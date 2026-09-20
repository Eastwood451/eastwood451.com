"""Local process watchdog. No AI calls: check the worker lock and resume if absent."""
import argparse,datetime,json,msvcrt,os,sqlite3,subprocess,sys,time
from pathlib import Path
from contextlib import closing
from analysis_runtime import atomic_json,credit_guard

def lock_file(path):
    f=path.open('a+b');f.seek(0);f.write(b'1');f.flush();f.seek(0)
    try:msvcrt.locking(f.fileno(),msvcrt.LK_NBLCK,1)
    except OSError:f.close();return None
    return f

def ensure_worker(data,python,worker):
    data=Path(data).resolve()
    guard=lock_file(data/'analysis-watchdog.lock')
    if guard is None:return {'event':'watchdog_already_running'}
    def report(event,**details):
        value={'event':event,'at':datetime.datetime.now().astimezone().isoformat(),**details}
        atomic_json(data/'analysis-watchdog-status.json',value)
        with (data/'analysis-watchdog.log').open('a',encoding='utf-8') as f:f.write(json.dumps(value,ensure_ascii=False)+'\n')
        return value
    try:
        control=data/'analysis-control.json'
        settings=json.loads(control.read_text(encoding='utf-8')) if control.exists() else {}
        if settings.get('enabled',True) is not True:return report('disabled')
        batch=settings.get('batch_size',15)
        if type(batch)!=int or not 1<=batch<=30:return report('configuration_error',reason='Invalid batch size')
        try:credit_guard()
        except Exception as e:return report('blocked',reason=str(e))
        worker_lock=lock_file(data/'analysis-worker.lock')
        if worker_lock is None:return report('worker_running')
        worker_lock.close()
        with closing(sqlite3.connect(data/'catalogue.sqlite',timeout=30)) as db:
            remaining=db.execute('select count(*) from pages p where analysis_json is null and exists(select 1 from locations l where l.hash=p.hash and l.active=1)').fetchone()[0]
        if not remaining:return report('complete')
        # The worker acquires its own exclusive lock; concurrent manual starts remain safe.
        with (data/'analysis-background.log').open('ab') as out,(data/'analysis-background-errors.log').open('ab') as err:
            process=subprocess.Popen([str(python),'-u',str(worker),'--data',str(data),'--all-pending','--max-pages','20000','--batch-size',str(batch),'--keep-running'],cwd=Path(worker).resolve().parents[2],stdin=subprocess.DEVNULL,stdout=out,stderr=err,creationflags=subprocess.CREATE_NO_WINDOW|subprocess.CREATE_NEW_PROCESS_GROUP)
        time.sleep(1)
        if process.poll() is not None:return report('start_failed',exit_code=process.returncode)
        return report('worker_restarted',pid=process.pid,pending=remaining,batch_size=batch)
    except Exception as e:return report('watchdog_error',reason=str(e))
    finally:guard.close()

def main():
    p=argparse.ArgumentParser();p.add_argument('--data',type=Path,required=True);a=p.parse_args()
    result=ensure_worker(a.data,Path(sys.executable).with_name('python.exe'),Path(__file__).with_name('analyse.py'))
    if sys.stdout:print(json.dumps(result))
if __name__=='__main__':main()
