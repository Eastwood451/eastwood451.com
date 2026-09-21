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

async function edgeHarness(fetchImpl){
 const source=await readFile(new URL('../supabase/functions/agent-skolelaerer/index.ts',import.meta.url),'utf8');
 let handler;
 const sql=async()=>[{name:'forberedelse_sync_token',decrypted_secret:'test-app-secret'},{name:'forberedelse_site_bypass',decrypted_secret:'test-site-secret'}];
 const code=stripTypeScriptTypes(source.replace(/^import postgres.*\n/,''),{mode:'strip'});
 vm.runInNewContext(code,{
  postgres:()=>sql, Deno:{env:{get:()=>''},serve:fn=>{handler=fn;}},
  URL,Headers,Response,AbortSignal,fetch:fetchImpl,
 });
 return handler;
}
test('Edge Function accepts anonymous reads and edits, forwarding only server credentials',async()=>{
 const calls=[];
 const handler=await edgeHarness(async(url,options)=>{
  calls.push(url);
  assert.equal(options.headers.get('Authorization'),null);
  assert.equal(options.headers.get('OAI-Sites-Authorization'),'Bearer test-site-secret');
  assert.equal(options.headers.get('x-eastwood-agent-token'),'test-app-secret');
  if(options.method==='POST')assert.deepEqual(await new Response(options.body).json(),{id:'test'});
  return Response.json({ok:true});
 });
 const base='https://example.supabase.co/functions/v1/agent-skolelaerer';
 assert.equal((await handler(new Request(base+'/data'))).status,200);
 assert.equal((await handler(new Request(base+'/lesson',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"id":"test"}'}))).status,200);
 assert.deepEqual(calls,['https://jacob-forberedelse.eastwood451.chatgpt.site/api/data','https://jacob-forberedelse.eastwood451.chatgpt.site/api/lesson']);
});
test('Edge Function exposes only the existing app routes and keeps payload limits',async()=>{
 const handler=await edgeHarness(()=>{throw Error('Must not contact backend');});
 const base='https://example.supabase.co/functions/v1/agent-skolelaerer';
 assert.equal((await handler(new Request(base+'/google/tokens'))).status,404);
 assert.equal((await handler(new Request(base+'/data',{method:'POST'}))).status,404);
 assert.equal((await handler(new Request(base+'/lesson',{method:'POST',headers:{'Content-Length':String(97*1024*1024)}}))).status,413);
 assert.equal((await handler(new Request(base+'/session'))).status,200);
});
