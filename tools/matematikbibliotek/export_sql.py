"""Export parameter-safe, resumable SQL batches for the authorized database connector."""
import json,sqlite3,argparse
from pathlib import Path

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--data',type=Path,required=True);a=ap.parse_args();db=sqlite3.connect(a.data/'catalogue.sqlite');db.row_factory=sqlite3.Row
 dest=a.data/'sql';dest.mkdir(exist_ok=True);manifest=[]
 def export(table,columns,rows,conflict,updates):
  batch=[];length=0
  def save():
   if not batch:return
   payload=json.dumps(batch,ensure_ascii=False,separators=(',',':')).replace("'","''")
   names=','.join(columns)
   fields=','.join(k+' '+v for k,v in columns.items())
   sql=f"insert into public.{table}({names}) select {names} from jsonb_to_recordset('{payload}'::jsonb) as x({fields}) on conflict({conflict}) do update set "+','.join(k+'=excluded.'+k for k in updates)+';'
   f=dest/f'{len(manifest):04d}-{table}.sql';f.write_text(sql,encoding='utf-8');manifest.append(str(f))
  for row in rows:
   n=len(json.dumps(row,ensure_ascii=False))
   if batch and length+n>70000:save();batch=[];length=0
   batch.append(row);length+=n
  save()
 rows=[dict(r) for r in db.execute('select hash id,title,page_count,error from contents')]
 export('math_contents',{'id':'text','title':'text','page_count':'integer','error':'text'},rows,'id',['title','page_count','error'])
 rows=[]
 for r in db.execute('select * from locations'):
  rows.append({'path':r['path'],'content_id':r['hash'],'bytes':r['bytes'],'drive_id':r['drive_id'],'drive_status':r['drive_status'],'error':r['error'],'source_metadata':json.loads(r['source_json']),'active':bool(r['active'])})
 export('math_locations',{'path':'text','content_id':'text','bytes':'bigint','drive_id':'text','drive_status':'text','error':'text','source_metadata':'jsonb','active':'boolean'},rows,'path',['content_id','bytes','drive_id','drive_status','error','source_metadata','active'])
 rows=[{'id':r['id'],'content_id':r['hash'],'number':r['number'],'search_text':r['title']+'\n'+r['text'].replace(chr(0),' ')} for r in db.execute('select p.*,c.title from pages p join contents c on c.hash=p.hash')]
 export('math_pages',{'id':'text','content_id':'text','number':'integer','search_text':'text'},rows,'id',['search_text'])
 (dest/'manifest.json').write_text(json.dumps(manifest),encoding='utf-8')
 print(json.dumps({'batches':len(manifest),'bytes':sum(Path(f).stat().st_size for f in manifest)}))
if __name__=='__main__':main()
