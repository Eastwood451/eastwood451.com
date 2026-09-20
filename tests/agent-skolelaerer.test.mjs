import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequest} from '../functions/api/agent-skolelaerer/[[path]].js';
const origin='https://eastwood451.com';
const make=(path,options={})=>({request:new Request(origin+'/api/agent-skolelaerer'+path,options)});
test('rejects anonymous plan and PDF requests',async()=>{for(const path of ['/data','/pdf-cover?id=123','/assets/app.js'])assert.equal((await onRequest(make(path))).status,401);});
test('rejects cross-origin writes before contacting private backend',async()=>{assert.equal((await onRequest(make('/lesson',{method:'POST',headers:{Origin:'https://attacker.example'}}))).status,403);});
test('uses a server-verified HttpOnly cookie and never returns the JWT in JSON',async()=>{
 const previous=globalThis.fetch;const token='signed.user.token.with.enough.characters';
 globalThis.fetch=async(url,options)=>{assert.equal(url,'https://uxbrnmcbvxgpsvdbzcov.supabase.co/functions/v1/agent-skolelaerer/session');assert.equal(options.headers.get('Authorization'),'Bearer '+token);return Response.json({ok:true});};
 try{const response=await onRequest(make('/session',{method:'POST',headers:{Origin:origin,Authorization:'Bearer '+token}}));assert.equal(response.status,200);assert.match(response.headers.get('Set-Cookie'),/HttpOnly; Secure; SameSite=Strict/);assert.deepEqual(await response.json(),{ok:true});}finally{globalThis.fetch=previous;}
});
test('does not issue a cookie when owner verification fails',async()=>{const previous=globalThis.fetch;globalThis.fetch=async()=>Response.json({error:'Private'},{status:403});try{const response=await onRequest(make('/session',{method:'POST',headers:{Origin:origin,Authorization:'Bearer invalid.token.with.enough.characters'}}));assert.equal(response.status,403);assert.equal(response.headers.get('Set-Cookie'),null);}finally{globalThis.fetch=previous;}});
test('logout expires the private cookie',async()=>{const response=await onRequest(make('/session',{method:'DELETE',headers:{Origin:origin}}));assert.match(response.headers.get('Set-Cookie'),/Max-Age=0/);});
