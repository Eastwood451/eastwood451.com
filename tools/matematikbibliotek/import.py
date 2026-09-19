"""Resumable local catalogue. Original PDFs are never copied or modified."""
import argparse, collections, hashlib, json, random, sqlite3, time, unicodedata
from pathlib import Path
import fitz

def norm(s): return unicodedata.normalize('NFC',s.replace('\\','/'))
def connect(data):
    data.mkdir(parents=True,exist_ok=True)
    db=sqlite3.connect(data/'catalogue.sqlite')
    db.row_factory=sqlite3.Row
    db.executescript('''
    pragma journal_mode=WAL;
    create table if not exists contents(hash text primary key, title text, page_count integer, error text);
    create table if not exists locations(path text primary key, hash text, bytes integer, mtime integer, drive_id text, drive_status text, error text, source_json text, active integer default 1);
    create table if not exists pages(id text primary key, hash text, number integer, text text, status text default 'pending', analysis_json text, model text, version text, unique(hash,number));
    create table if not exists jobs(id text primary key, status text, created_at text, error text);
    ''')
    return db

def drive_index(data):
    folderlist=json.loads((data/'drive/folders.json').read_text(encoding='utf-8-sig'))
    folders={f['id']:f for f in folderlist}
    def path(fid,seen=None):
        if fid not in folders: return None
        f=folders[fid]
        if not f['parents']: return ''
        parent=path(f['parents'][0])
        return norm(parent+'/'+f['name']).lstrip('/') if parent is not None else None
    idx=collections.defaultdict(list)
    for file in sorted((data/'drive').glob('pdf-*.json')):
        for r in json.loads(file.read_text(encoding='utf-8-sig')):
            for parent in r['parents']:
                folder=path(parent)
                if folder is not None: idx[(norm(folder+'/'+r['name']).lstrip('/'),r['size'])].append(r['id'])
    return idx

def ingest(root,data):
    db=connect(data); idx=drive_index(data)
    metadata={}
    source=root/'Mattip/filoversigt.json'
    if source.exists():
        raw=json.loads(source.read_text(encoding='utf-8-sig'))
        if isinstance(raw,dict): raw=raw.get('files',raw.get('items',[]))
        for entry in raw:
            if isinstance(entry,dict) and entry.get('sha256'): metadata[entry['sha256']]=entry
    paths=sorted(p for p in root.rglob('*.pdf') if not norm(p.relative_to(root).as_posix()).startswith('output/matematikbibliotek/'))
    active=[]
    for i,p in enumerate(paths):
        rel=norm(p.relative_to(root).as_posix()); active.append(rel); st=p.stat()
        old=db.execute('select * from locations where path=?',(rel,)).fetchone()
        if old and old['bytes']==st.st_size and old['mtime']==st.st_mtime_ns:
            sha=old['hash']
        else:
            h=hashlib.sha256()
            with p.open('rb') as f:
                for block in iter(lambda:f.read(1024*1024),b''): h.update(block)
            sha=h.hexdigest()
        matches=sorted(set(idx.get((rel,st.st_size),[])))
        status='verified' if len(matches)==1 else ('ambiguous' if matches else 'missing')
        error=None; count=0
        if not db.execute('select 1 from contents where hash=?',(sha,)).fetchone():
            try:
                with fitz.open(p) as doc:
                    if doc.is_encrypted: raise ValueError('PDF er krypteret')
                    count=len(doc)
                    if count==0: raise ValueError('PDF har ingen sider')
                    rows=[(f'{sha}:{n+1}',sha,n+1,page.get_text()) for n,page in enumerate(doc)]
                    db.executemany('insert or ignore into pages(id,hash,number,text) values(?,?,?,?)',rows)
            except Exception as e: error=type(e).__name__+': '+str(e)
            title=metadata.get(sha,{}).get('title') or p.stem
            db.execute('insert into contents values(?,?,?,?)',(sha,title,count,error))
        else: error=db.execute('select error from contents where hash=?',(sha,)).fetchone()[0]
        link_error=None if status=='verified' else ('Flere Drive-filer matcher sti, navn og størrelse: '+','.join(matches) if matches else 'Intet Drive-match for sti, navn og størrelse')
        db.execute('insert into locations values(?,?,?,?,?,?,?,?,1) on conflict(path) do update set hash=excluded.hash,bytes=excluded.bytes,mtime=excluded.mtime,drive_id=excluded.drive_id,drive_status=excluded.drive_status,error=excluded.error,source_json=excluded.source_json,active=1',
            (rel,sha,st.st_size,st.st_mtime_ns,matches[0] if status=='verified' else None,status,error or link_error,json.dumps(metadata.get(sha,{}),ensure_ascii=False)))
        if i%50==0:
            db.commit(); print(json.dumps({'scanned':i+1,'total':len(paths)}),flush=True)
    active_set=set(active)
    for row in db.execute('select path from locations').fetchall():
        if row[0] not in active_set: db.execute('update locations set active=0 where path=?',(row[0],))
    db.commit()
    report={'files':len(paths),'readable_files':db.execute('select count(*) from locations l join contents c on c.hash=l.hash where l.active=1 and c.error is null').fetchone()[0],
      'original_pages':db.execute('select sum(c.page_count) from locations l join contents c on c.hash=l.hash where l.active=1').fetchone()[0],
      'unique_contents':db.execute('select count(distinct hash) from locations where active=1').fetchone()[0],
      'unique_pages':db.execute('select count(*) from pages p where exists(select 1 from locations l where l.hash=p.hash and l.active=1)').fetchone()[0],
      'drive':dict(db.execute('select drive_status,count(*) from locations where active=1 group by drive_status')),
      'errors':[dict(r) for r in db.execute('select path,error from locations where active=1 and error is not null')]}
    (data/'import-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False),flush=True)
    db.close()

def render(root,data,row):
    target=data/'previews'/row['hash']/f"{row['number']}.jpg"
    if not target.exists():
        target.parent.mkdir(parents=True,exist_ok=True)
        with fitz.open(root/row['path']) as doc:
            page=doc[row['number']-1]
            pix=page.get_pixmap(matrix=fitz.Matrix(110/72,110/72),alpha=False)
            pix.save(target,jpg_quality=78)
    return target

def pilot(root,data):
    db=connect(data)
    # Stable sampling across sources, page positions, scans and long documents.
    rows=[dict(r) for r in db.execute('select p.*,min(l.path) path,c.title,c.page_count from pages p join locations l on l.hash=p.hash join contents c on c.hash=p.hash where l.active=1 group by p.id order by p.id')]
    rng=random.Random(451); rng.shuffle(rows)
    groups=collections.defaultdict(list)
    for r in rows:
        source=r['path'].split('/')[0]
        kind='scan' if len(r['text'].strip())<40 else ('book' if r['page_count']>20 else 'sheet')
        groups[(source,kind)].append(r)
    chosen=[]; used=set()
    while len(chosen)<100 and any(groups.values()):
        for key in sorted(groups):
            if groups[key] and len(chosen)<100:
                r=groups[key].pop()
                if r['id'] not in used: chosen.append(r); used.add(r['id'])
    for r in chosen:
        r['image']=str(render(root,data,r));r['text']=r['text'][:16000]
    (data/'pilot.json').write_text(json.dumps(chosen,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'pilot_pages':len(chosen),'sources':dict(collections.Counter(r['path'].split('/')[0] for r in chosen))},ensure_ascii=False))
    db.close()

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('command',choices=['ingest','pilot']);ap.add_argument('--root',type=Path,required=True);ap.add_argument('--data',type=Path,required=True)
    a=ap.parse_args();globals()[a.command](a.root,a.data)
