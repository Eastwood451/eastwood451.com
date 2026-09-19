"""Render every unique readable page once. Process isolation is required by PyMuPDF."""
import argparse,concurrent.futures,json,sqlite3,os
from pathlib import Path
import fitz

def render_group(args):
 root,data,sha,path=args;folder=Path(data)/'previews'/sha;folder.mkdir(parents=True,exist_ok=True);errors=[];count=0
 try:
  with fitz.open(Path(root)/path) as doc:
   for n,page in enumerate(doc):
    target=folder/f'{n+1}.jpg'
    if target.exists():count+=1;continue
    try:
     pix=page.get_pixmap(matrix=fitz.Matrix(100/72,100/72),alpha=False)
     temp=folder/f'{n+1}.tmp.jpg';pix.save(temp,jpg_quality=72);os.replace(temp,target);count+=1
    except Exception as e:errors.append({'id':f'{sha}:{n+1}','error':str(e)})
 except Exception as e:errors.append({'content':sha,'error':str(e)})
 return count,errors

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--root',type=Path,required=True);ap.add_argument('--data',type=Path,required=True);a=ap.parse_args();db=sqlite3.connect(a.data/'catalogue.sqlite')
 groups=[(str(a.root),str(a.data),r[0],r[1]) for r in db.execute('select c.hash,min(l.path) from contents c join locations l on l.hash=c.hash where c.error is null and l.active=1 group by c.hash')]
 total=0;errors=[]
 with concurrent.futures.ProcessPoolExecutor(max_workers=3) as pool:
  for i,(count,err) in enumerate(pool.map(render_group,groups)):
   total+=count;errors.extend(err)
   if i%100==0:print(json.dumps({'files':i+1,'total_files':len(groups),'pages':total,'errors':len(errors)}),flush=True)
 (a.data/'render-report.json').write_text(json.dumps({'pages':total,'errors':errors},ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({'pages':total,'errors':len(errors)}),flush=True)
if __name__=='__main__':main()
