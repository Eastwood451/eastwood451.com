"""Upload derived JPEG previews through existing Wrangler OAuth; never upload originals."""
import argparse,concurrent.futures,json,os,tomllib,urllib.request,urllib.parse,urllib.error,time,threading,subprocess
from pathlib import Path
ACCOUNT='702bb0cb9490f68da0bfaf2ab84700d3'
BUCKET='matematikbibliotek-previews'
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--data',type=Path,required=True);ap.add_argument('--limit',type=int,default=100000);a=ap.parse_args()
 config=Path(os.environ['APPDATA'])/'xdg.config/.wrangler/config/default.toml'
 token=tomllib.loads(config.read_text(encoding='utf-8'))['oauth_token']
 log=a.data/'uploaded-previews.json';done=set(json.loads(log.read_text()) if log.exists() else [])
 gate=threading.Lock();last_request=[0.0];last_auth=[time.monotonic()]
 root=a.data/'previews';files=[p for p in sorted(root.rglob('*.jpg')) if p.relative_to(root).as_posix() not in done][:a.limit]
 def upload(p):
  nonlocal token
  with gate:
   if time.monotonic()-last_auth[0]>2400:
    subprocess.run(['npx.cmd','wrangler','whoami'],check=True,capture_output=True,creationflags=subprocess.CREATE_NO_WINDOW)
    token=tomllib.loads(config.read_text(encoding='utf-8'))['oauth_token'];last_auth[0]=time.monotonic()
  key=p.relative_to(root).as_posix();content=p.read_bytes()
  if len(content)>3000000 or content[:2]!=b'\xff\xd8':raise ValueError('Only small JPEG previews are accepted')
  req=urllib.request.Request(f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/r2/buckets/{BUCKET}/objects/'+urllib.parse.quote(key,safe=''),data=content,method='PUT',headers={'Authorization':'Bearer '+token,'Content-Type':'image/jpeg','Cache-Control':'private, no-store'})
  for attempt in range(12):
   try:
    with gate:
     delay=.3-(time.monotonic()-last_request[0])
     if delay>0:time.sleep(delay)
     last_request[0]=time.monotonic()
    with urllib.request.urlopen(req,timeout=90) as r:
     if r.status not in (200,201,204):raise RuntimeError('Upload failed')
    break
   except urllib.error.HTTPError as e:
    if e.code==401 and attempt<11:
     with gate:
      subprocess.run(['npx.cmd','wrangler','whoami'],check=True,capture_output=True,creationflags=subprocess.CREATE_NO_WINDOW)
      token=tomllib.loads(config.read_text(encoding='utf-8'))['oauth_token'];last_auth[0]=time.monotonic()
      req.add_header('Authorization','Bearer '+token)
     continue
    if e.code not in (429,500,502,503,504) or attempt==11:raise
    time.sleep(min(60,int(e.headers.get('Retry-After',2**attempt*2))))
  return key
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
  for i,key in enumerate(pool.map(upload,files)):
   done.add(key)
   if i%25==0:log.write_text(json.dumps(sorted(done)),encoding='utf-8')
   if i%100==0:print(json.dumps({'uploaded':len(done),'remaining':len(files)-i-1}),flush=True)
 log.write_text(json.dumps(sorted(done)),encoding='utf-8')
 print(json.dumps({'uploaded':len(done)}))
if __name__=='__main__':main()
