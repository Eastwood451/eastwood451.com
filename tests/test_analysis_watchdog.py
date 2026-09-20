import importlib.util,json,sqlite3,subprocess,sys,tempfile,time,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools/matematikbibliotek'))
from analysis_watchdog import ensure_worker
class WatchdogTests(unittest.TestCase):
 def test_restart_after_actual_process_exit_and_no_duplicate(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);data=root/'data';data.mkdir();worker=root/'tools/test/worker.py';worker.parent.mkdir(parents=True)
   worker.write_text("import msvcrt,sys,time\nfrom pathlib import Path\np=Path(sys.argv[sys.argv.index('--data')+1])\nf=(p/'analysis-worker.lock').open('a+b');f.seek(0);f.write(b'1');f.flush();f.seek(0);msvcrt.locking(f.fileno(),msvcrt.LK_NBLCK,1)\nwhile True:time.sleep(1)\n")
   db=sqlite3.connect(data/'catalogue.sqlite');db.executescript("create table pages(hash text,analysis_json text);create table locations(hash text,active integer);insert into pages values('test',null);insert into locations values('test',1);");db.close()
   pids=[]
   try:
    first=ensure_worker(data,Path(sys.executable),worker);self.assertEqual(first['event'],'worker_restarted');pids.append(first['pid'])
    self.assertEqual(ensure_worker(data,Path(sys.executable),worker)['event'],'worker_running')
    subprocess.run(['taskkill','/PID',str(first['pid']),'/T','/F'],check=True,capture_output=True);pids.remove(first['pid']);time.sleep(.3)
    second=ensure_worker(data,Path(sys.executable),worker);self.assertEqual(second['event'],'worker_restarted');self.assertNotEqual(first['pid'],second['pid']);pids.append(second['pid'])
    (data/'analysis-control.json').write_text('{"enabled":false}');self.assertEqual(ensure_worker(data,Path(sys.executable),worker)['event'],'disabled')
   finally:
    for pid in pids:subprocess.run(['taskkill','/PID',str(pid),'/T','/F'],capture_output=True)
    time.sleep(.3)
if __name__=='__main__':unittest.main()
