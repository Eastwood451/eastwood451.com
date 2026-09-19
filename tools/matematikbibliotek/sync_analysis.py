"""Create resumable delta SQL for the existing authorized database connector.
Apply every file in sync/manifest.json, then copy sync/pending-state.json to synced-state.json.
Never acknowledge before the database confirms all files.
"""
import argparse,json,sqlite3,hashlib
from pathlib import Path

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--data',type=Path,required=True);a=ap.parse_args();db=sqlite3.connect(a.data/'catalogue.sqlite');db.row_factory=sqlite3.Row
 state_path=a.data/'synced-state.json';previous=json.loads(state_path.read_text(encoding='utf-8')) if state_path.exists() else {'analysis':{},'previews':[]}
 state={'analysis':dict(previous['analysis']),'previews':list(previous['previews'])};rows=[]
 for r in db.execute('select * from pages where analysis_json is not null'):
  digest=hashlib.sha256((r['analysis_json']+r['status']+(r['version'] or '')+(r['model'] or '')).encode()).hexdigest()
  if previous['analysis'].get(r['id'])==digest:continue
  v=json.loads(r['analysis_json']);rows.append({'id':r['id'],'status':r['status'],'summary':v['summary'],'subject':v['subject'],'material_type':v['material_type'],'model':r['model'],'analysis_version':r['version'],'assessments':v['assessments']});state['analysis'][r['id']]=digest
 dest=a.data/'sync';dest.mkdir(exist_ok=True);manifest=[]
 def save(sql):
  p=dest/f'{len(manifest):04d}.sql';p.write_text('begin;\n'+sql+'\ncommit;',encoding='utf-8');manifest.append(str(p))
 for start in range(0,len(rows),25):
  payload=json.dumps(rows[start:start+25],ensure_ascii=False).replace("'","''")
  save(f"""with data as (select * from jsonb_to_recordset('{payload}'::jsonb) x(id text,status text,summary text,subject text,material_type text,model text,analysis_version text,assessments jsonb)) update public.math_pages p set status=d.status,summary=d.summary,subject=d.subject,material_type=d.material_type,model=d.model,analysis_version=d.analysis_version,analyzed_at=now() from data d where p.id=d.id;
 delete from public.math_assessments where origin='ai' and page_id in (select x->>'id' from jsonb_array_elements('{payload}'::jsonb) x);
 insert into public.math_assessments(page_id,origin,ordinal,topic,subtopic,skill,grade_min,grade_max,difficulty,confidence,reason)
 select p->>'id','ai',n::integer,v->>'topic',v->>'subtopic',v->>'skill',(v->>'grade_min')::integer,(v->>'grade_max')::integer,v->>'difficulty',(v->>'confidence')::real,v->>'reason'
 from jsonb_array_elements('{payload}'::jsonb) p cross join lateral jsonb_array_elements(p->'assessments') with ordinality a(v,n);""")
 uploaded=json.loads((a.data/'uploaded-previews.json').read_text(encoding='utf-8')) if (a.data/'uploaded-previews.json').exists() else []
 old=set(previous['previews']);previews=[{'id':k.replace('/',':').removesuffix('.jpg'),'key':k} for k in uploaded if k not in old]
 for start in range(0,len(previews),300):
  payload=json.dumps(previews[start:start+300]).replace("'","''")
  save(f"update public.math_pages p set preview_key=x.key from jsonb_to_recordset('{payload}'::jsonb) x(id text,key text) where p.id=x.id;")
 state['previews']=uploaded
 (dest/'pending-state.json').write_text(json.dumps(state),encoding='utf-8');(dest/'manifest.json').write_text(json.dumps(manifest),encoding='utf-8')
 print(json.dumps({'analysed_delta':len(rows),'previews_delta':len(previews),'batches':len(manifest)}))
if __name__=='__main__':main()
