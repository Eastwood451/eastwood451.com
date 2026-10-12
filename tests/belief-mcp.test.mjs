import test from 'node:test';
import assert from 'node:assert/strict';
import * as model from '../supabase/functions/smfi-mcp/belief-model.js';
import {createHandler,challenge,validRedirect,SITE,BASE} from '../supabase/functions/smfi-mcp/server.js';
import {memoryDB} from './helpers/smfi-db.mjs';
import {mergeStates} from '../SMFI_Suite/sync-merge.js';
const initial=()=>model.validateState({kind:'belief-map',activeMapId:'map1',maps:[{id:'map1',mapTitle:'Mit kort',mapNotes:'Original',slots:[{id:'t1',label:'Nu'}],nodes:[],edges:[]}]});
const edit=(state,actions)=>model.mutate(state,'belief_edit_map',{map_id:'map1',actions});
const node=id=>({type:'create_node',node:{id,title:id}});
const rpc=(name,args={})=>({jsonrpc:'2.0',id:7,method:'tools/call',params:{name,arguments:args}});
test('Graph batches create stable references, nested nodes, relations and timeline steps atomically',()=>{
 const {state,created}=edit(initial(),[node('a'),node('b'),{type:'create_edge',edge:{id:'e',from:'a',to:'b',operator:'supports',weight:.8}},{type:'add_step',index:0,label:'Før'},{type:'create_node',node:{id:'c',parentId:'a',title:'Barn'}}]);
 assert.equal(created.length,5);assert.equal(state.maps[0].nodes[0].slot,1);assert.equal(state.maps[0].nodes[2].parentId,'a');
 assert.equal(state.maps[0].nodes[0].confidence,.5);assert.equal(state.maps[0].edges[0].weight,.8);
 const before=JSON.stringify(state);
 assert.throws(()=>edit(state,[{type:'update_node',node_id:'a',changes:{text:'Partial'}},{type:'create_edge',edge:{from:'a',to:'missing'}}]));
 assert.equal(JSON.stringify(state),before);
 assert.throws(()=>edit(state,[{type:'update_node',node_id:'a',changes:{parentId:'c'}}]));
 assert.throws(()=>edit(state,[{type:'create_edge',edge:{from:'a',to:'c'}}]));
 assert.throws(()=>edit(state,[{type:'update_edge',edge_id:'e',changes:{to:'c'}}]));
 assert.throws(()=>edit(state,[{type:'update_node',node_id:'a',changes:{confidence:2}}]));
 assert.throws(()=>edit(state,[{type:'delete_node',node_id:'a'}]));
 const removed=edit(state,[{type:'delete_node',node_id:'a',cascade:true}]).state;
 assert.deepEqual(removed.maps[0].nodes.map(n=>n.id),['b']);assert.deepEqual(removed.maps[0].edges,[]);
});
test('Map library keeps existing maps, validates untrusted fields and omits duplicate child snapshots',()=>{
 const a=edit(initial(),[node('a')]).state;
 const newMap=model.mutate(a,'belief_create_map',{title:'Andet kort'});
 assert.equal(newMap.state.maps.length,2);assert.equal(newMap.state.activeMapId,newMap.created_map_id);
 const selected=model.mutate(newMap.state,'belief_select_map',{map_id:'map1'}).state;
 assert.equal(model.readMap(selected).nodes[0].id,'a');
 selected.maps.find(m=>m.id==='map1').nodes[0].subNodes=[{text:'stale derived data'}];
 assert.equal(model.validateState(selected).maps.find(m=>m.id==='map1').nodes[0].subNodes,undefined);
 assert.throws(()=>model.validateState({...a,activeMapId:'absent'}));
 assert.throws(()=>model.validateState(JSON.parse('{"kind":"belief-map","__proto__":{}}')));
 assert.throws(()=>edit(a,[{type:'update_node',node_id:'a',changes:{imgSrc:'javascript:alert(1)'}}]));
 assert.throws(()=>edit(a,[{type:'update_node',node_id:'a',changes:{id:'renamed'}}]));
});
test('Graph merge combines independent nodes and detects deletion versus edits',()=>{
 const b={maps:[{id:'m',slots:[{id:'s',label:'Nu'}],nodes:[{id:'a',text:'A',slot:0,parentId:null},{id:'b',text:'B',slot:0,parentId:null}],edges:[]}]},l=structuredClone(b),r=structuredClone(b);
 l.maps[0].nodes[0].text='Local';r.maps[0].nodes[1].text='Remote';r.maps[0].nodes.push({id:'c',text:'New',slot:0,parentId:null});
 const merged=mergeStates(b,l,r);assert.deepEqual(merged.conflicts,[]);assert.deepEqual(merged.value.maps[0].nodes.map(n=>n.text),['Local','Remote','New']);
 r.maps[0].nodes=r.maps[0].nodes.filter(n=>n.id!=='a');assert.deepEqual(mergeStates(b,l,r).conflicts,['/maps/m/nodes/a']);
});
test('Grok PKCE works for both bridges; tokens, clients and private libraries are isolated',async()=>{
 const {db}=memoryDB(),beliefBase=BASE+'/belief';
 const handlers=[createHandler(db),createHandler(db,{model,base:beliefBase,title:'SMFI Belief Map',readScope:'belief:read',writeScope:'belief:write',setup:'/SMFI_Suite/chatgpt.html?kind=belief',isState:s=>s.kind==='belief-map'})];
 const call=async(index,path,method='GET',data,token,origin=SITE)=>{
  const res=await handlers[index](new Request((index?beliefBase:BASE)+path,{method,headers:{Origin:origin,'Content-Type':'application/json',...token?{Authorization:'Bearer '+token}:{}},body:data===undefined?undefined:JSON.stringify(data)}));
  return {status:res.status,headers:res.headers,data:await res.json().catch(()=>null)};
 };
 for(const index of [0,1]){
  const prefix=index?'belief':'smfi',base=index?beliefBase:BASE,resource=base+'/mcp',state=index?initial():{operatorName:'Test',actors:[]};
  const owner=(await call(index,'/bootstrap','POST',{state})).data;
  assert.equal((await call(1-index,'/workspace','GET',undefined,owner.owner_token)).status,401);
  const redirect='https://grok.com/connectors-oauth-exchange-code/',verifier='v'.repeat(64);
  const client=(await call(index,'/register','POST',{client_name:'Grok',redirect_uris:[redirect],token_endpoint_auth_method:'none'})).data;
  const q=new URLSearchParams({client_id:client.client_id,redirect_uri:redirect,response_type:'code',code_challenge:await challenge(verifier),code_challenge_method:'S256',scope:prefix+':read '+prefix+':write offline_access',resource,state:'grok-state'});
  assert.equal((await call(1-index,'/authorize?'+q)).status,400);
  const auth=await call(index,'/authorize?'+q),request=new URL(auth.headers.get('Location')).searchParams.get('request');
  const detail=(await call(index,'/consent?request='+request)).data;assert.equal(detail.provider,'grok');
  const consent=(await call(index,'/consent','POST',{request,approved:true},owner.owner_token)).data;
  const callback=new URL(consent.redirect_url);assert.equal(callback.origin,'https://grok.com');assert.equal(callback.searchParams.get('state'),'grok-state');
  const exchange={client_id:client.client_id,grant_type:'authorization_code',redirect_uri:redirect,code:callback.searchParams.get('code'),code_verifier:verifier,resource};
  assert.equal((await call(index,'/token','POST',{...exchange,code_verifier:'wrong'.repeat(10)})).status,400);
  const tokens=(await call(index,'/token','POST',exchange)).data;assert.ok(tokens.access_token);
  assert.equal((await call(index,'/token','POST',exchange)).status,400);
  const readName=index?'belief_read_map':'smfi_read_model';
  assert.equal((await call(index,'/mcp','POST',rpc(readName),tokens.access_token,'https://grok.com')).data.result.isError,undefined);
  assert.equal((await call(1-index,'/mcp','POST',rpc(readName),tokens.access_token)).data.result.isError,true);
  const write=index?rpc('belief_edit_map',{expected_revision:1,map_id:'map1',actions:[node('grok')]}):rpc('smfi_update_holon',{expected_revision:1,holon_key:'operator/_Luc.mod.',content:'Grok'});
  assert.equal((await call(index,'/mcp','POST',write,tokens.access_token)).data.result.structuredContent.revision,2);
  assert.equal((await call(index,'/workspace','GET',undefined,owner.owner_token)).data.source,'grok');
  assert.equal((await call(index,'/mcp','POST',write,tokens.access_token)).data.result.isError,true);
  await call(index,'/disconnect','POST',{},owner.owner_token);
  assert.equal((await call(index,'/mcp','POST',rpc(readName),tokens.access_token)).data.result.isError,true);
 }
});
test('Grok redirects accept only exact HTTPS callbacks',()=>{
 assert.equal(validRedirect('https://grok.com/connectors-oauth-exchange-code/'),true);
 for(const u of ['https://grok.com.evil/connectors-oauth-exchange-code/','https://grok.com/other','https://grok.com/connectors-oauth-exchange-code/?next=x','https://user@grok.com/connectors-oauth-exchange-code/','http://grok.com/connectors-oauth-exchange-code/'])assert.equal(validRedirect(u),false);
});

test('Concurrent node deletion and edge creation pause instead of importing an invalid graph',()=>{
 const base=edit(initial(),[node('a'),node('b')]).state,local=edit(base,[{type:'delete_node',node_id:'a'}]).state;
 const remote=edit(base,[{type:'create_edge',edge:{id:'new',from:'a',to:'b'}}]).state;
 assert.deepEqual(mergeStates(base,local,remote).conflicts,['/maps/map1/graph']);
});
