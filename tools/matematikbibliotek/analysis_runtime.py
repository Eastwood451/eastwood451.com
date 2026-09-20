"""Resumable Gemini worker with bounded retries, strict validation and no paid fallback."""
import argparse,ctypes,datetime,json,os,re,sqlite3,subprocess,time
from pathlib import Path

def decode_result(stdout):
    envelope=json.loads(stdout)
    value=envelope.get('structured_output')
    if value is None:
        text=envelope.get('response','').strip()
        if text.startswith('```'):
            text=re.sub(r'^```(?:json)?\s*','',text,count=1)
        value,_=json.JSONDecoder().raw_decode(text)
    if not isinstance(value,dict) or not isinstance(value.get('pages'),list):
        raise ValueError('Svaret mangler pages-array')
    return envelope,value['pages']

def validate_pages(pages,expected,topics):
    ids=[p.get('id') for p in pages]
    if len(ids)!=len(expected) or set(ids)!=set(expected):raise ValueError('Forkerte eller manglende side-id’er')
    for p in pages:
        if p.get('visual_inspected') is not True:raise ValueError('Billedet blev ikke inspiceret')
        if not isinstance(p.get('summary'),str) or not isinstance(p.get('needs_review'),bool):raise ValueError('Ugyldigt sideformat')
        if p.get('subject') not in ('math','other','unknown') or p.get('material_type') not in ('student','answers','teacher','other'):raise ValueError('Ugyldig materialetype')
        if not isinstance(p.get('assessments'),list):raise ValueError('Ugyldige vurderinger')
        if p['material_type']=='answers':p['needs_review']=True
        for a in p['assessments']:
            if a.get('topic') not in topics:raise ValueError('Ukendt hovedemne')
            if not all(isinstance(a.get(k),str) for k in ('subtopic','skill','reason')):raise ValueError('Ugyldig vurderingstekst')
            if a.get('difficulty')=='uafklaret':a['difficulty']=None;p['needs_review']=True
            if a.get('difficulty') not in (None,'let','middel','svaer'):raise ValueError('Ugyldig sværhedsgrad')
            lo,hi=a.get('grade_min'),a.get('grade_max')
            if (lo is None)!=(hi is None):raise ValueError('Ufuldstændigt niveauinterval')
            if lo is not None and (type(lo)!=int or type(hi)!=int or not 0<=lo<=hi<=12):raise ValueError('Ugyldigt niveauinterval')
            confidence=a.get('confidence')
            if type(confidence) not in (int,float) or not 0<=confidence<=1:raise ValueError('Ugyldig sikkerhed')
            if confidence<.8 or lo is None:p['needs_review']=True
    return pages

def atomic_json(path,value):
    tmp=path.with_suffix(path.suffix+'.tmp');tmp.write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8');os.replace(tmp,path)

def repair_hook(data):
    # Preserve the enabled telemetry hook and its arguments; fix only its known Windows path.
    root=Path.home()/'.gemini/config/plugins/googlecloudtools.datacloud_telemetry'
    path=root/'hooks.json';bundle=root/'telemetry_hook_bundle.js'
    if not path.exists() or not bundle.exists():return False
    original=path.read_text(encoding='utf-8-sig');settings=json.loads(original);changed=False
    for group in settings.values():
        if not isinstance(group,dict):continue
        for entry in group.get('PreToolUse',[]):
            for hook in entry.get('hooks',[]):
                command=hook.get('command','');quoted='"'+str(bundle)+'"'
                if quoted in command and ' ' not in str(bundle):
                    hook['command']=command.replace(quoted,bundle.as_posix());changed=True
    if changed:
        backup=data/'telemetry-hook-before-recovery.json'
        if not backup.exists():backup.write_text(original,encoding='utf-8')
        atomic_json(path,settings)
    return changed

def credit_guard():
    path=Path.home()/'.gemini/antigravity-cli/settings.json'
    settings=json.loads(path.read_text(encoding='utf-8-sig'))
    if settings.get('useG1Credits',False) is not False:raise RuntimeError('Ekstra AI-kreditter er aktiveret. Stopper uden at sende opgaver.')

def quota_delay(text):
    return bool(re.search(r'quota|resource.exhausted|rate.limit|too many requests|\b429\b',text,re.I))

def run(cli,model,version,prompt):
    ap=argparse.ArgumentParser();ap.add_argument('--data',type=Path,required=True);ap.add_argument('--batch-size',type=int,default=5);ap.add_argument('--max-pages',type=int,default=100);ap.add_argument('--all-pending',action='store_true');ap.add_argument('--pilot-indices');ap.add_argument('--force',action='store_true');ap.add_argument('--keep-running',action='store_true')
    a=ap.parse_args()
    if not 1<=a.batch_size<=30:ap.error('batch-size must be 1..30')
    data=a.data.resolve();jobs=data/'analysis';jobs.mkdir(exist_ok=True)
    lock=(data/'analysis-worker.lock').open('a+b');lock.seek(0);lock.write(b'1');lock.flush();lock.seek(0)
    import msvcrt
    try:msvcrt.locking(lock.fileno(),msvcrt.LK_NBLCK,1)
    except OSError:raise SystemExit('En analysearbejder kører allerede.')
    db=sqlite3.connect(data/'catalogue.sqlite',timeout=30);db.row_factory=sqlite3.Row
    db.execute('create index if not exists locations_active_hash on locations(hash) where active=1');db.commit()
    schema=Path(__file__).with_name('analysis-schema.json');local_schema=jobs/'schema.json';local_schema.write_bytes(schema.read_bytes())
    topics=set(json.loads(schema.read_text(encoding='utf-8-sig'))['properties']['pages']['items']['properties']['assessments']['items']['properties']['topic']['enum'])
    retry_path=data/'analysis-retries.json';retries=json.loads(retry_path.read_text(encoding='utf-8')) if retry_path.exists() else {}
    state_path=data/'analysis-worker-status.json';finished=0;failures=0;queue=[]
    selected=None
    if not a.all_pending:
        selected=json.loads((data/'pilot.json').read_text(encoding='utf-8'))
        if a.pilot_indices:selected=[selected[int(i)-1] for i in a.pilot_indices.split(',')]
        selected=selected[:a.max_pages]
    forced_done=set()
    def state(event,**extra):
        value={'event':event,'at':datetime.datetime.now().astimezone().isoformat(),'pid':os.getpid(),'model':model,'paid_fallback':False,'completed_this_run':finished,**extra}
        atomic_json(state_path,value);print(json.dumps(value,ensure_ascii=True),flush=True)
    def pause(seconds,reason):
        state('waiting',reason=reason,retry_at=datetime.datetime.fromtimestamp(time.time()+seconds).astimezone().isoformat())
        time.sleep(seconds)
    keep_awake=bool(a.keep_running and ctypes.windll.kernel32.SetThreadExecutionState(0x80000001))
    try:
        state('started',batch_size=a.batch_size,prevent_idle_sleep=keep_awake)
        while finished<a.max_pages:
            credit_guard()
            if not queue:
                if selected is None:
                    rows=[dict(r) for r in db.execute('select id,hash,number,text from pages p where analysis_json is null and exists(select 1 from locations l where l.hash=p.hash and l.active=1) order by hash,number')]
                    for r in rows:r['image']=str(data/'previews'/r['hash']/f"{r['number']}.jpg")
                else:rows=[dict(r) for r in selected if r['id'] not in forced_done and (a.force or not db.execute('select analysis_json from pages where id=?',(r['id'],)).fetchone()[0])]
                if not rows:state('complete');break
                ready=[r for r in rows if retries.get(r['id'],{}).get('after',0)<=time.time()]
                if not ready:
                    if not a.keep_running:state('deferred',pages=len(rows));break
                    pause(min(300,max(5,min(retries[r['id']]['after'] for r in rows)-time.time())),'Afventer genforsøg på udskudte sider');continue
                queue=[ready[:min(a.batch_size,a.max_pages-finished)]]
            chunk=queue.pop(0);stamp=datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f');staged=[]
            try:
                if repair_hook(data):state('hook_path_repaired')
                manifest_rows=[]
                for n,r in enumerate(chunk):
                    target=jobs/f'{stamp}-page-{n+1:02d}.jpg';os.link(r['image'],target);staged.append(target)
                    manifest_rows.append({'id':r['id'],'image':target.as_posix(),'text':r['text']})
                manifest=jobs/f'{stamp}-input.json';atomic_json(manifest,manifest_rows)
                task=prompt+'\nReturner kun ét JSON-objekt uden markdown eller forklarende tekst. Kopiér id præcist fra listen, aldrig billedfilnavnet.\nManifest: '+manifest.as_posix()+'\n'+ '\n'.join('id='+r['id']+' image='+r['image'] for r in manifest_rows)
                state('batch_start',pages=len(chunk),manifest=manifest.name)
                proc=subprocess.run([str(cli),'-p',task,'--output-format','json','--json-schema',str(local_schema),'--model',model,'--print-timeout','5m'],cwd=data,capture_output=True,timeout=330,encoding='utf-8',errors='replace')
                (jobs/f'{stamp}-output.json').write_text(proc.stdout,encoding='utf-8');(jobs/f'{stamp}-stderr.txt').write_text(proc.stderr,encoding='utf-8')
                if proc.returncode:
                    failures+=1;queue.insert(0,chunk)
                    delay=900 if quota_delay(proc.stdout+'\n'+proc.stderr) else min(300,15*2**min(failures-1,5))
                    if not a.keep_running and failures>=3:state('stopped',reason='CLI-fejl efter tre forsøg');break
                    pause(delay,'Gemini-kvote; ingen betalt reserve' if delay==900 else 'Midlertidig CLI-/netværksfejl');continue
                envelope,pages=decode_result(proc.stdout);validate_pages(pages,[r['id'] for r in chunk],topics)
                for p in pages:
                    db.execute('update pages set status=?,analysis_json=?,model=?,version=? where id=?',('review' if p['needs_review'] else 'complete',json.dumps(p,ensure_ascii=False),model,version,p['id']))
                db.commit();finished+=len(pages);failures=0
                for p in pages:retries.pop(p['id'],None);forced_done.add(p['id'])
                atomic_json(retry_path,retries);state('batch_complete',pages=len(pages))
            except (ValueError,KeyError,TypeError,OSError,subprocess.TimeoutExpired) as e:
                db.rollback();state('batch_retry',pages=len(chunk),reason=str(e)[:500])
                if len(chunk)>1:
                    middle=len(chunk)//2;queue[0:0]=[chunk[:middle],chunk[middle:]]
                else:
                    r=chunk[0];count=retries.get(r['id'],{}).get('attempts',0)+1
                    retries[r['id']]={'attempts':count,'after':time.time()+(60 if count<3 else 3600),'reason':str(e)[:500]};atomic_json(retry_path,retries)
                pause(5,'Genforsøger mindre batches; ingen fejlede sider tælles færdige')
            finally:
                for p in staged:p.unlink(missing_ok=True)
    except KeyboardInterrupt:state('paused',reason='Stoppet af bruger')
    except Exception as e:state('stopped',reason=str(e));raise
    finally:
        if keep_awake:ctypes.windll.kernel32.SetThreadExecutionState(0x80000000)
        db.close();lock.close()
