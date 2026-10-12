import test from 'node:test';
import assert from 'node:assert/strict';
import {validateState,describe,mutate} from '../supabase/functions/smfi-mcp/model.js';
import {createHandler,challenge,validRedirect,BASE,RESOURCE,SITE} from '../supabase/functions/smfi-mcp/server.js';
import {same,mergeStates} from '../SMFI_Suite/sync-merge.js';
const initial=()=>validateState({version:'4.0',operatorName:'Jacob',actors:[{id:'a1',personId:'person_line',name:'Line',children:[]}],holonNotes:{'person_line/operator/main':'Original note'}});
import {memoryDB} from './helpers/smfi-db.mjs';
function harness(){const {db,tables}=memoryDB(),handle=createHandler(db);return {tables,call:async(path,method='GET',data,token,extra={})=>{
 const response=await handle(new Request(BASE+path,{method,headers:{Origin:SITE,'Content-Type':'application/json',...token?{Authorization:'Bearer '+token}:{},...extra},body:data===undefined?undefined:JSON.stringify(data)}));
 return {status:response.status,headers:response.headers,data:await response.json().catch(()=>null)};
}};}
async function link(h,owner,scope='smfi:read smfi:write offline_access'){
 const redirect='https://chatgpt.com/connector_platform_oauth_redirect',verifier='a'.repeat(64);
 const client=(await h.call('/register','POST',{client_name:'ChatGPT',redirect_uris:[redirect],token_endpoint_auth_method:'none'})).data;
 const q=new URLSearchParams({client_id:client.client_id,redirect_uri:redirect,response_type:'code',code_challenge:await challenge(verifier),code_challenge_method:'S256',resource:RESOURCE,state:'exact-state',scope});
 const auth=await h.call('/authorize?'+q),request=new URL(auth.headers.get('location')).searchParams.get('request');
 const consent=await h.call('/consent','POST',{request,approved:true},owner);
 const callback=new URL(consent.data.redirect_url);assert.equal(callback.searchParams.get('state'),'exact-state');assert.equal(callback.searchParams.get('iss'),BASE);
 const exchange={grant_type:'authorization_code',client_id:client.client_id,redirect_uri:redirect,code:callback.searchParams.get('code'),code_verifier:verifier,resource:RESOURCE};
 return {exchange,request,client,tokens:(await h.call('/token','POST',exchange)).data};
}
const rpc=(name,args={})=>({jsonrpc:'2.0',id:7,method:'tools/call',params:{name,arguments:args}});
test('Nested actor semantics and stable ID keys match existing mapper',()=>{
 const view=describe(initial());assert.equal(view.holons['person_line/operator/main'].notation,'J(L(J))');assert.equal(view.holons['operator/_Luc.mod.'].notation,'J(J)_Luc.mod.');assert.equal(view.holons['person_line/person_line/_ideel'].section,'lof');assert.equal(Object.keys(view.holons).length,12);
 const added=mutate(initial(),'smfi_add_actor',{name:'Pia',parent_actor_ids:['a1']});assert.equal(added.state.actors[0].children[0].name,'Pia');assert.equal(added.state.holonNotes['person_line/operator/main'],'Original note');
});
test('Create and move custom holons preserve notes; standard holons cannot move',()=>{
 const created=mutate(initial(),'smfi_create_holon',{zone:'person_line/mof',title:'Hypotese',content:'Mulig fortolkning',tags:['K2']});
 const moved=mutate(created.state,'smfi_move_holon',{holon_key:created.created_key,zone:'top/lof'});
 assert.equal(describe(moved.state).holons[created.created_key].zone,'top/lof');assert.equal(moved.state.holonNotes[created.created_key],'Mulig fortolkning');
 assert.throws(()=>mutate(initial(),'smfi_move_holon',{holon_key:'operator/_Luc.mod.',zone:'top/lof'}));
 assert.throws(()=>mutate(initial(),'smfi_update_holon',{holon_key:'nonexistent',content:'x'}));
});
test('Reject invalid structures and prototype pollution without stripping valid text',()=>{
 assert.throws(()=>validateState(JSON.parse('{"operatorName":"J","actors":[],"__proto__":{}}')));
 assert.throws(()=>mutate(initial(),'smfi_update_holon',{holon_key:'operator/_Luc.mod.',tags:['<script>']}));
 assert.equal(mutate(initial(),'smfi_update_holon',{holon_key:'operator/_Luc.mod.',content:'<b>plain text</b>'}).state.holonNotes['operator/_Luc.mod.'],'<b>plain text</b>');
});
test('Three-way merge preserves separate edits and flags overlapping edits regardless of key order',()=>{
 assert.equal(same({x:1,y:2},{y:2,x:1}),true);
 const base={holonNotes:{a:'first',b:'second'},actors:[]};
 assert.deepEqual(mergeStates(base,{...base,holonNotes:{a:'mine',b:'second'}},{...base,holonNotes:{a:'first',b:'AI'}}),{value:{holonNotes:{a:'mine',b:'AI'},actors:[]},conflicts:[]});
 assert.deepEqual(mergeStates(base,{...base,holonNotes:{a:'mine',b:'second'}},{...base,holonNotes:{a:'AI',b:'second'}}).conflicts,['/holonNotes/a']);
});
test('OAuth discovery, PKCE, one-time codes, diagram isolation, MCP edits, refresh and revocation',async()=>{
 const h=harness();
 const a=(await h.call('/bootstrap','POST',{state:initial()})).data;
 const b=(await h.call('/bootstrap','POST',{state:{...initial(),operatorName:'Other'}})).data;
 assert.equal((await h.call('/workspace')).status,401);
 assert.equal((await h.call('/workspace','GET',undefined,'b'.repeat(64))).status,401);
 assert.equal((await h.call('/bootstrap','POST',{state:initial()},undefined,{Origin:'https://evil.example'})).status,403);
 assert.equal((await h.call('/register','POST',{redirect_uris:['https://evil.example/callback']})).status,400);
 const linked=await link(h,a.owner_token);
 assert.ok(linked.tokens.access_token);assert.ok(linked.tokens.refresh_token);
 assert.equal((await h.call('/token','POST',linked.exchange)).status,400);
 assert.equal((await h.call('/consent','POST',{request:linked.request,approved:true},a.owner_token)).status,409);
 const anon=await h.call('/mcp','POST',rpc('smfi_read_model'));
 assert.equal(anon.data.result.isError,true);assert.ok(anon.data.result._meta['mcp/www_authenticate']);
 const read=await h.call('/mcp','POST',rpc('smfi_read_model'),linked.tokens.access_token);
 assert.equal(read.data.result.structuredContent.operator,'Jacob');
 const write=await h.call('/mcp','POST',rpc('smfi_update_holon',{expected_revision:1,holon_key:'person_line/operator/main',content:'Updated through ChatGPT'}),linked.tokens.access_token);
 assert.equal(write.data.result.structuredContent.revision,2);
 assert.equal((await h.call('/workspace','GET',undefined,a.owner_token)).data.state.holonNotes['person_line/operator/main'],'Updated through ChatGPT');
 assert.equal((await h.call('/workspace','GET',undefined,b.owner_token)).data.state.holonNotes['person_line/operator/main'],'Original note');
 const stale=await h.call('/mcp','POST',rpc('smfi_update_holon',{expected_revision:1,holon_key:'person_line/operator/main',content:'Overwrite'}),linked.tokens.access_token);
 assert.equal(stale.data.result.isError,true);
 assert.equal((await h.call('/workspace','PUT',{state:initial(),expected_revision:1},a.owner_token)).status,409);
 const refreshArgs={grant_type:'refresh_token',refresh_token:linked.tokens.refresh_token,client_id:linked.client.client_id};
 const refreshed=(await h.call('/token','POST',refreshArgs)).data;assert.ok(refreshed.access_token);
 assert.equal((await h.call('/token','POST',refreshArgs)).status,400);
 await h.call('/disconnect','POST',{},a.owner_token);
 assert.equal((await h.call('/mcp','POST',rpc('smfi_read_model'),refreshed.access_token)).data.result.isError,true);
});
test('Read-only consent cannot write',async()=>{
 const h=harness(),a=(await h.call('/bootstrap','POST',{state:initial()})).data;
 const {tokens}=await link(h,a.owner_token,'smfi:read');
 assert.equal(tokens.refresh_token,undefined);
 const attempt=await h.call('/mcp','POST',rpc('smfi_update_holon',{expected_revision:1,holon_key:'operator/_Luc.mod.',content:'denied'}),tokens.access_token);
 assert.equal(attempt.data.result.isError,true);
});
test('OAuth redirects are exact official HTTPS callbacks',()=>{
 assert.equal(validRedirect('https://chatgpt.com/connector_platform_oauth_redirect'),true);
 for(const url of ['https://chatgpt.com.evil/connector_platform_oauth_redirect','http://chatgpt.com/connector_platform_oauth_redirect','https://chatgpt.com/connector_platform_oauth_redirect#x','https://user@chatgpt.com/connector_platform_oauth_redirect'])assert.equal(validRedirect(url),false);
});
