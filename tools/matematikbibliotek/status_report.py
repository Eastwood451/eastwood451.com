"""Write exact private pending/review lists and current counts without changing originals."""
import argparse,csv,datetime,json,sqlite3
from pathlib import Path

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--data',type=Path,required=True);a=ap.parse_args();db=sqlite3.connect(a.data/'catalogue.sqlite');db.row_factory=sqlite3.Row
 counts=dict(db.execute('select status,count(*) from pages p where exists(select 1 from locations l where l.hash=p.hash and l.active=1) group by status'));uploaded=json.loads((a.data/'uploaded-previews.json').read_text(encoding='utf-8')) if (a.data/'uploaded-previews.json').exists() else []
 for status,name in [('pending','afventer-analyse.csv'),('review','kraever-gennemgang.csv')]:
  with (a.data/name).open('w',encoding='utf-8-sig',newline='') as f:
   writer=csv.writer(f);writer.writerow(['side_id','fil','sidetal','drive_id','drive_link','status'])
   for r in db.execute('select p.id,p.number,l.path,l.drive_id from pages p join locations l on l.hash=p.hash where p.status=? and l.active=1 order by l.path,p.number',(status,)):
    writer.writerow([r['id'],r['path'],r['number'],r['drive_id'],'https://drive.google.com/file/d/'+r['drive_id']+'/view' if r['drive_id'] else '',status])
 report={'at':datetime.datetime.now().astimezone().isoformat(),'files':db.execute('select count(*) from locations where active=1').fetchone()[0],'unique_pages':sum(counts.values()),'status':counts,'analysed':sum(v for k,v in counts.items() if k in ('complete','review')),'previews_uploaded':len(uploaded),'paid_ai_usd':0,'extra_ai_credits':False,'automatic_paid_fallback':False}
 (a.data/'status-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report));db.close()
if __name__=='__main__':main()
