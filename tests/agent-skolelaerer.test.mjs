import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';
import {onRequest} from '../functions/api/agent-skolelaerer/[[path]].js';

const origin='https://eastwood451.com';
const make=(path,options={})=>({request:new Request(origin+'/api/agent-skolelaerer'+path,options)});
test('anonymous reads reach the app without forwarding cookies or account credentials',async t=>{
 t.mock.method(globalThis,'fetch',async(url,options)=>{
  assert.ok(url.startsWith('https://uxbrnmcbvxgpsvdbzcov.supabase.co/functions/v1/agent-skolelaerer/'));
  assert.equal(options.headers.get('Authorization'),null);
  assert.equal(options.headers.get('Cookie'),null);
  return new Response('example',{headers:{'Content-Type':'application/javascript'}});
 });
 for(const path of ['/data','/pdf-cover?id=123','/assets/app.js']){
  const response=await onRequest(make(path,{headers:{Cookie:'old-session=value',Authorization:'Bearer old-account-token'}}));
  assert.equal(response.status,200);
  assert.equal(await response.text(),'example');
  assert.equal(response.headers.get('Cache-Control'),'no-store');
  assert.equal(response.headers.get('Set-Cookie'),null);
 }
});
test('anonymous same-origin edits preserve the request body and conflict response',async t=>{
 t.mock.method(globalThis,'fetch',async(url,options)=>{
  assert.equal(url,'https://uxbrnmcbvxgpsvdbzcov.supabase.co/functions/v1/agent-skolelaerer/lesson');
  assert.equal(options.method,'POST');
  assert.equal(options.headers.get('Content-Type'),'application/json');
  assert.deepEqual(await new Response(options.body).json(),{id:'example',expectedVersion:2});
  return Response.json({error:'Conflict'},{status:409});
 });
 const response=await onRequest(make('/lesson',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({id:'example',expectedVersion:2})}));
 assert.equal(response.status,409);
 assert.deepEqual(await response.json(),{error:'Conflict'});
});
test('cross-origin writes and unsupported methods are still rejected',async t=>{
 t.mock.method(globalThis,'fetch',()=>{throw Error('Must not contact backend');});
 assert.equal((await onRequest(make('/lesson',{method:'POST',headers:{Origin:'https://other.example'}}))).status,403);
 assert.equal((await onRequest(make('/lesson',{method:'POST'}))).status,403);
 assert.equal((await onRequest(make('/data',{method:'PUT',headers:{Origin:origin}}))).status,405);
});
test('legacy session endpoint removes stale cookies without authenticating',async()=>{
 for(const method of ['GET','POST','DELETE']){
  const response=await onRequest(make('/session',{method,headers:{Origin:origin}}));
  assert.equal(response.status,200);
  assert.match(response.headers.get('Set-Cookie'),/Max-Age=0/);
  assert.deepEqual(await response.json(),{ok:true});
 }
});
test('connection failure returns an actionable error',async t=>{
 t.mock.method(globalThis,'fetch',async()=>{throw Error('Offline');});
 const response=await onRequest(make('/data'));
 assert.equal(response.status,502);
 assert.match((await response.json()).error,/Prøv igen/);
});

const SITE='appgprj_6aa82da4671081919d5421baaa0c906e';
const OWNER='FxqOJQWIl9nBf8qxvLDuypycdtR7yCbSTY2qwrmo7hMzReje8ZzI7T';
const SUPA='https://project.supabase.test';
const LEGACY='https://jacob-forberedelse.eastwood451.chatgpt.site';
const base='https://example.supabase.co/functions/v1/agent-skolelaerer';
async function edgeHarness(fetchImpl){
 const source=await readFile(new URL('../supabase/functions/agent-skolelaerer/index.ts',import.meta.url),'utf8');
 let handler;
 const sql=async()=>[{name:'forberedelse_sync_token',decrypted_secret:'test-app-secret'},{name:'forberedelse_site_bypass',decrypted_secret:'test-site-secret'}];
 const env={SUPABASE_URL:SUPA,SUPABASE_SERVICE_ROLE_KEY:'test-service-key'};
 const code=stripTypeScriptTypes(source.replace(/^import postgres.*\n/,'').replace(/^export /gm,''),{mode:'strip'});
 vm.runInNewContext(code,{
  postgres:()=>sql, Deno:{env:{get:name=>env[name]||''},serve:fn=>{handler=fn;}},
  URL,Headers,Response,AbortSignal,fetch:fetchImpl,
 });
 return handler;
}
// A tiny in-memory PostgREST: plan + homework reads and RPC calls are recorded.
function fakeSupabase({lessons,records=[],rpc={}}={}){
 const calls=[];
 const fetchImpl=async(url,options={})=>{
  url=String(url);
  if(url.startsWith(LEGACY))throw Error('Legacy source is offline');
  assert.ok(url.startsWith(SUPA+'/rest/v1/'),url);
  assert.equal(options.headers.apikey,'test-service-key');
  assert.equal(options.headers.Authorization,'Bearer test-service-key');
  const path=url.slice((SUPA+'/rest/v1/').length);
  if(path.startsWith('rpc/')){
   const name=path.slice(4),args=JSON.parse(options.body);
   calls.push({name,args});
   const result=rpc[name]?await rpc[name](args):null;
   if(result instanceof Response)return result;
   return Response.json(result);
  }
  calls.push({read:path.split('?')[0],path});
  if(path.startsWith('preparation_plans?'))return Response.json([{lessons,annual:[['Klasse'],[5,1]],version:357,updated_at:'2026-11-04T10:00:00+00:00'}]);
  if(path.startsWith('preparation_homework?')){assert.match(path,new RegExp('owner_id=eq.'+OWNER));return Response.json(records);}
  throw Error('Unexpected '+path);
 };
 return {calls,fetchImpl};
}
const lesson=(date,fields={})=>({date,className:'5. klasse',rows:['Klassen','Nicki','Malthe D'].map((name,row)=>({name,row,sheet:'Sheet1',cellNotes:{},manualFields:{},fields:fields[name]||['','','','','','']}))});
const post=(path,body)=>new Request(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});

test('Edge /data reads the plan and homework straight from Supabase',async()=>{
 const db=fakeSupabase({lessons:[lesson('2026-11-05',{Klassen:['plan 0','A','B','plan 3','plan 4','M']})],records:[{lesson_date:'2026-11-05',class_number:5,recipient:'Klassen',field:3,value:'Lektie',version:2,updated_at:'2026-11-04T09:00:00+00:00'}]});
 const handler=await edgeHarness(db.fetchImpl);
 const response=await handler(new Request(base+'/data'));
 assert.equal(response.status,200);
 const data=await response.json();
 assert.equal(data.version,357);
 assert.deepEqual(data.events,[]);
 assert.equal(data.homeworkSynced,true);
 const row=data.lessons[0].rows[0];
 assert.deepEqual(row.fields,['plan 0','A','B','Lektie','plan 4','M']);
 assert.deepEqual(row.homework,{3:{version:2,updatedAt:'2026-11-04T09:00:00+00:00'}});
 assert.deepEqual(data.lessons[0].rows[1].homework,{});
 assert.ok(db.calls.every(c=>!c.name),'reads never call an RPC');
});
test('Edge /lesson saves fields 1, 2 and 5 through save_preparation_cell with the previous value',async()=>{
 const db=fakeSupabase({rpc:{save_preparation_cell:a=>({value:a.p_value,version:358})}});
 const handler=await edgeHarness(db.fetchImpl);
 const response=await handler(post('/lesson',{kind:'content',sheet:'Sheet1',row:0,name:'Nicki',field:2,previous:'gammel',value:'ny',date:'2026-11-05',className:'5. klasse',expectedVersion:0}));
 assert.equal(response.status,200);
 assert.deepEqual(await response.json(),{saved:true,value:'ny',version:358});
 assert.deepEqual(db.calls,[{name:'save_preparation_cell',args:{p_site_id:SITE,p_date:'2026-11-05',p_class_name:'5. klasse',p_recipient:'Nicki',p_field:2,p_value:'ny',p_previous:'gammel'}}]);
});
test('Edge /lesson saves notes through save_preparation_note',async()=>{
 const db=fakeSupabase({rpc:{save_preparation_note:a=>({value:a.p_value,version:358})}});
 const handler=await edgeHarness(db.fetchImpl);
 const response=await handler(post('/lesson',{kind:'note',name:'Klassen',field:0,previous:'',value:'note',date:'2026-11-05',className:'5. klasse'}));
 assert.equal(response.status,200);
 assert.equal(db.calls[0].name,'save_preparation_note');
});
test('Edge /lesson saves homework only through save_preparation_homework with the expected version',async()=>{
 const db=fakeSupabase({rpc:{save_preparation_homework:a=>({site_id:SITE,owner_id:OWNER,lesson_date:a.p_lesson_date,class_number:5,recipient:a.p_recipient,field:a.p_field,value:a.p_value,version:3,authority:'manual',updated_at:'2026-11-04T11:00:00+00:00'})}});
 const handler=await edgeHarness(db.fetchImpl);
 const response=await handler(post('/lesson',{kind:'content',name:'Klassen',field:3,previous:'gammel',value:'ny lektie',date:'2026-11-05',className:'5. klasse',expectedVersion:2}));
 assert.equal(response.status,200);
 const body=await response.json();
 assert.deepEqual(body.record,{lesson_date:'2026-11-05',class_number:5,recipient:'Klassen',field:3,value:'ny lektie',version:3,updated_at:'2026-11-04T11:00:00+00:00'});
 assert.deepEqual(db.calls,[{name:'save_preparation_homework',args:{p_site_id:SITE,p_owner_id:OWNER,p_lesson_date:'2026-11-05',p_class_number:5,p_recipient:'Klassen',p_field:3,p_value:'ny lektie',p_expected_version:2}}]);
});
test('Edge /lesson refuses a first homework save when the plan text changed meanwhile',async()=>{
 const db=fakeSupabase({lessons:[lesson('2026-11-05',{Klassen:['nyere tekst','','','','','']})],rpc:{save_preparation_homework:()=>{throw Error('Must not save');}}});
 const handler=await edgeHarness(db.fetchImpl);
 const response=await handler(post('/lesson',{name:'Klassen',field:0,previous:'gammel',value:'min tekst',date:'2026-11-05',className:'5. klasse',expectedVersion:0}));
 assert.equal(response.status,409);
 assert.match((await response.json()).error,/Intet blev overskrevet/);
 assert.ok(!db.calls.some(c=>c.name));
});
test('Edge /lesson refuses version 0 when a homework record already exists',async()=>{
 const db=fakeSupabase({lessons:[lesson('2026-11-05')],records:[{lesson_date:'2026-11-05',class_number:5,recipient:'Klassen',field:4,value:'x',version:1,updated_at:'t'}]});
 const handler=await edgeHarness(db.fetchImpl);
 const response=await handler(post('/lesson',{name:'Klassen',field:4,previous:'x',value:'y',date:'2026-11-05',className:'5. klasse',expectedVersion:0}));
 assert.equal(response.status,409);
 assert.ok(!db.calls.some(c=>c.name));
});
test('Edge maps RPC conflicts to 409 and never retries',async()=>{
 for(const [name,body] of [['save_preparation_cell',{field:1}],['save_preparation_homework',{field:3,expectedVersion:4}]]){
  const db=fakeSupabase({rpc:{[name]:()=>Response.json({code:'PT409',message:'Plan conflict'},{status:409})}});
  const handler=await edgeHarness(db.fetchImpl);
  const response=await handler(post('/lesson',{name:'Klassen',previous:'a',value:'b',date:'2026-11-05',className:'5. klasse',...body}));
  assert.equal(response.status,409);
  assert.equal(db.calls.filter(c=>c.name).length,1);
 }
});
test('Edge rejects invalid edits before contacting Supabase',async()=>{
 const handler=await edgeHarness(()=>{throw Error('Must not contact backend');});
 const valid={name:'Klassen',field:1,previous:'',value:'x',date:'2026-11-05',className:'5. klasse'};
 for(const change of [{name:'Hovedspor'},{field:6},{field:'1'},{date:'2026-02-30'},{className:'6. klasse'},{value:7},{value:'x'.repeat(45001)},{field:3,expectedVersion:-1}]){
  const response=await handler(post('/lesson',{...valid,...change}));
  assert.equal(response.status,400,JSON.stringify(change));
 }
 assert.equal((await handler(new Request(base+'/lesson',{method:'POST',body:'not json'}))).status,400);
});
test('Edge /annual saves through save_preparation_annual with the expected version',async()=>{
 const annual=[['Klasse'],[5,1,'T']];
 const db=fakeSupabase({rpc:{save_preparation_annual:a=>({annual:a.p_annual,version:358})}});
 const handler=await edgeHarness(db.fetchImpl);
 const response=await handler(post('/annual',{annual,expectedVersion:357}));
 assert.equal(response.status,200);
 assert.deepEqual(db.calls,[{name:'save_preparation_annual',args:{p_site_id:SITE,p_annual:annual,p_expected_version:357}}]);
 assert.equal((await handler(post('/annual',{annual}))).status,400);
});
test('Edge /material appends a Drive link to the chosen track and field',async()=>{
 const url='https://drive.google.com/file/d/11111111111/view';
 const db=fakeSupabase({lessons:[lesson('2026-11-05',{Nicki:['','Opgave 1','','','','']})],rpc:{save_preparation_cell:a=>({value:a.p_value,version:358})}});
 const handler=await edgeHarness(db.fetchImpl);
 const response=await handler(post('/material',{date:'2026-11-05',className:'5. klasse',name:'Nicki',field:1,title:'KonteXt 5',url,page:26}));
 assert.equal(response.status,200);
 const save=db.calls.find(c=>c.name);
 assert.deepEqual(save,{name:'save_preparation_cell',args:{p_site_id:SITE,p_date:'2026-11-05',p_class_name:'5. klasse',p_recipient:'Nicki',p_field:1,p_value:'Opgave 1\n\nKonteXt 5 · s. 26\n'+url,p_previous:'Opgave 1'}});
});
test('Edge /material on homework uses the current homework version and skips duplicates',async()=>{
 const url='https://drive.google.com/file/d/11111111111/view';
 const records=[{lesson_date:'2026-11-05',class_number:5,recipient:'Malthe D',field:4,value:'Ugeopgave',version:5,updated_at:'t'}];
 const db=fakeSupabase({lessons:[lesson('2026-11-05')],records,rpc:{save_preparation_homework:a=>({owner_id:OWNER,lesson_date:a.p_lesson_date,class_number:5,recipient:a.p_recipient,field:a.p_field,value:a.p_value,version:6,updated_at:'t2'})}});
 const handler=await edgeHarness(db.fetchImpl);
 assert.equal((await handler(post('/material',{date:'2026-11-05',name:'Malthe D',field:4,title:'Ark',url}))).status,200);
 const save=db.calls.find(c=>c.name);
 assert.equal(save.args.p_expected_version,5);
 assert.equal(save.args.p_value,'Ugeopgave\n\nArk\n'+url);
 records[0].value='Ugeopgave\n\nArk\n'+url;
 const again=fakeSupabase({lessons:[lesson('2026-11-05')],records});
 const response=await (await edgeHarness(again.fetchImpl))(post('/material',{date:'2026-11-05',name:'Malthe D',field:4,title:'Ark',url}));
 assert.deepEqual(await response.json(),{saved:false,duplicate:true,value:records[0].value});
 assert.ok(!again.calls.some(c=>c.name));
});
test('Edge /material creates a missing lesson from the template before appending',async()=>{
 let lessons=[];
 const db=fakeSupabase({rpc:{
  ensure_preparation_lesson:a=>{lessons.push(lesson(a.p_date));return null;},
  save_preparation_cell:a=>({value:a.p_value,version:358}),
 }});
 db.fetchImpl=(orig=>async(url,o)=>{if(String(url).includes('preparation_plans?'))return Response.json([{lessons,annual:[],version:357,updated_at:'t'}]);return orig(url,o);})(db.fetchImpl);
 const handler=await edgeHarness(db.fetchImpl);
 const response=await handler(post('/material',{date:'2026-12-01',name:'Klassen',field:5,title:'Ark',url:'https://docs.google.com/document/d/abc/edit'}));
 assert.equal(response.status,200);
 assert.deepEqual(db.calls.filter(c=>c.name).map(c=>c.name),['ensure_preparation_lesson','save_preparation_cell']);
 assert.equal((await handler(post('/material',{date:'2026-12-01',name:'Klassen',field:5,title:'Ark',url:'https://evil.example/x'}))).status,400);
});
test('Edge keeps Google Drive extras optional when the legacy source is gone',async()=>{
 const handler=await edgeHarness(async url=>{assert.ok(String(url).startsWith(LEGACY));throw Error('offline');});
 const config=await handler(new Request(base+'/google/config'));
 assert.equal(config.status,200);
 assert.deepEqual(await config.json(),{configured:false,connected:false,previews:false});
 assert.equal((await handler(new Request(base+'/materials'))).status,503);
});
test('Edge Function exposes only the app routes and keeps payload limits',async()=>{
 const handler=await edgeHarness(()=>{throw Error('Must not contact backend');});
 assert.equal((await handler(new Request(base+'/google/tokens'))).status,404);
 assert.equal((await handler(new Request(base+'/data',{method:'POST'}))).status,404);
 assert.equal((await handler(new Request(base+'/lesson',{method:'GET'}))).status,404);
 assert.equal((await handler(new Request(base+'/lesson',{method:'POST',headers:{'Content-Length':String(97*1024*1024)}}))).status,413);
 assert.equal((await handler(new Request(base+'/session'))).status,200);
});
test('Edge Function no longer forwards reads or saves to the Sites app',async()=>{
 const source=await readFile(new URL('../supabase/functions/agent-skolelaerer/index.ts',import.meta.url),'utf8');
 assert.doesNotMatch(source,/'\/lesson'.*LEGACY|LEGACY_ROUTES=\[[^\]]*'\/(lesson|annual|data|material)'/);
});
