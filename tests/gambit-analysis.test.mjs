import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {parseHTML} from 'linkedom';

const code=await readFile(new URL('../gambits/analysis.js',import.meta.url),'utf8');
function setup(){const context=vm.createContext({});vm.runInContext(code,context);return context.GambitAnalysis}
function form(A,field,value){const {document}=parseHTML('<html><body>'+A.editor(field,value)+'</body></html>');return document.querySelector('form')}
function set(form,key,value){const el=form.querySelector(`[data-analysis-key="${key}"]`);if(el.tagName==='SELECT'){for(const option of el.querySelectorAll('option'))option.removeAttribute('selected');el.querySelector(`option[value="${value}"]`).setAttribute('selected','')}else el.value=value}

test('purpose and mechanism codebooks have unique stable dimensions',()=>{
 const A=setup();assert.equal(A.goals.length,8);assert.equal(A.levers.length,9);
 for(const items of [A.goals,A.levers,A.reactions,A.susceptibility])assert.equal(new Set(items.map(x=>x[0])).size,items.length);
 assert.ok(A.susceptibility.some(x=>x[0]==='interoception'));
});
test('new cards stay unassessed rather than acquiring a default classification',()=>{
 const A=setup();for(const field of Object.keys(A.fields))assert.equal(A.rows(field,{}).length,0);
});
test('a primary purpose, extra purposes and roles survive an editor roundtrip',()=>{
 const A=setup(),value={primary:'resources',secondary:['control'],roles:['rescuer'],description:'Få hjælp',basis:'En konkret observation',futureKey:23};
 const result=A.read('analysis_purpose',form(A,'analysis_purpose',value),value);
 assert.equal(result.primary,'resources');assert.deepEqual([...result.secondary],['control']);assert.deepEqual([...result.roles],['rescuer']);assert.equal(result.description,'Få hjælp');assert.equal(result.futureKey,23);
 assert.equal(A.normalize('analysis_purpose',{primary:'resources',secondary:['resources','control','control']}).secondary.join(','),'control');
});
test('mechanism keeps causal lever, reaction and bodily sensitivity separate',()=>{
 const A=setup(),value={primary:'capacity',secondary:['obligation'],reactions:['guilt','exhaustion'],susceptibility:['interoception'],chain:'Pres → træthed → eftergivenhed',context:'Registrerer ikke egen træthed',basis:'Gentagne spørgsmål'};
 const result=A.read('analysis_mechanism',form(A,'analysis_mechanism',value),value);
 assert.equal(result.primary,'capacity');assert.deepEqual([...result.reactions],['guilt','exhaustion']);assert.deepEqual([...result.susceptibility],['interoception']);assert.equal(result.chain,value.chain);
});
test('unknown vocabulary and fields are retained across later versions',()=>{
 const A=setup(),value={primary:'future-purpose',secondary:['future-extra'],roles:['future-role'],schemaVersion:1,extra:{retained:true}};
 const result=A.read('analysis_purpose',form(A,'analysis_purpose',value),value);
 assert.equal(result.primary,value.primary);assert.equal(result.secondary[0],'future-extra');assert.equal(result.roles[0],'future-role');assert.equal(result.extra.retained,true);
});
test('culpability drops stale subtypes after switching category',()=>{
 const A=setup(),value={kind:'dolus',intent:'eventual',effect:'Skyldfølelse',scope:'episode'};
 const f=form(A,'analysis_culpability',value);set(f,'kind','culpa');set(f,'awareness','conscious');set(f,'severity','gross');
 let result=A.read('analysis_culpability',f,value);assert.equal(result.intent,'unspecified');assert.equal(result.awareness,'conscious');assert.equal(result.severity,'gross');
 set(f,'kind','casus');result=A.read('analysis_culpability',f,result);assert.equal(result.awareness,'unspecified');assert.equal(result.severity,'unspecified');
 const rows=A.rows('analysis_culpability',result).map(x=>x[0]);assert.ok(!rows.includes('Forsætsform'));assert.ok(!rows.includes('Grad'));
});
test('saved text is escaped in editor and view, and included in copy summary',()=>{
 const A=setup(),value={primary:'information',chain:'<img src=x onerror=alert(1)> & "test"',reactions:['confusion']};
 const output=A.editor('analysis_mechanism',value)+A.view('analysis_mechanism',value);
 assert.ok(!output.includes('<img'));assert.ok(output.includes('&lt;img'));assert.ok(A.summary({analysis_mechanism:value}).includes('Forvirring'));
});

const html=await readFile(new URL('../gambits/index.html',import.meta.url),'utf8');
const main=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
function storage(initial={}){const m=new Map(Object.entries(initial));return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),key:i=>[...m.keys()][i]??null,get length(){return m.size}}}
async function app(){
 const {document,window}=parseHTML(html),timers=[];
 const selectProto=window.HTMLSelectElement.prototype;const selectValue=Object.getOwnPropertyDescriptor(selectProto,'value');
 Object.defineProperty(selectProto,'value',{configurable:true,get:selectValue.get,set(value){for(const option of this.querySelectorAll('option'))option.removeAttribute('selected');this.querySelectorAll('option').forEach(option=>{if(option.value===value)option.setAttribute('selected','')})}});const row={id:'GAM-0001',title:'Testkort',version:1,example:'Kun test',source_meta:{origin:'egne',source_label:'Bevar kilde'},analysis_purpose:{},analysis_mechanism:{},analysis_culpability:{}};
 const state={row,patches:[],conflict:false,offline:false};
 const sessionStorage=storage({'smfi-gambits-auth-session-v1':JSON.stringify({access_token:'test-only',expires_at:4102444800})});
 const fetch=async(url,{method='GET',body}={})=>{
  if(state.offline)throw Error('offline');
  if(method==='PATCH'){
   const patch=JSON.parse(body);state.patches.push(patch);
   if(state.conflict){state.row={...state.row,version:state.row.version+1,analysis_purpose:{primary:'status'}};return {ok:true,status:200,json:async()=>[]}}
   state.row={...state.row,...patch,version:state.row.version+1};
  }
  return {ok:true,status:200,json:async()=>[structuredClone(state.row)]};
 };
 const context=vm.createContext({window,document,console,sessionStorage,localStorage:storage(),navigator:{onLine:true},crypto:{randomUUID:()=> 'test-tab'},location:{hash:'',origin:'https://test.invalid',pathname:'/gambits/',search:''},history:{replaceState(){}},URLSearchParams,fetch,setTimeout:(fn)=>{timers.push(fn);return timers.length},clearTimeout(){},setInterval(){},Blob,URL,confirm:()=>false});
 vm.runInContext(code,context);context.GambitAnalysis=window.GambitAnalysis;
 // Expose only to this in-memory test, never in the shipped page.
 const instrumented=main.replace('render();updateRecoveryControl();','window.testApp={open,flushDatabase,save,saveQueue,entryPayload,displayEntry,applyDraft,chatPrompt,get entries(){return entries},set entries(v){entries=v},stageText,typingDrafts};render();updateRecoveryControl();');
 vm.runInContext(instrumented,context);await new Promise(r=>setImmediate(r));
 return {document,window,state,context,api:window.testApp,Event:window.Event};
}
test('analysis uses existing field-isolated save queue, versions and source preservation',async()=>{
 const x=await app();x.api.open('GAM-0001');const e=x.api.entries[0];e.analysis_purpose={primary:'resources'};x.api.save(['analysis_purpose']);await x.api.flushDatabase();
 assert.deepEqual(Object.keys(x.state.patches[0]),['analysis_purpose']);assert.equal(x.state.row.source_meta.source_label,'Bevar kilde');assert.equal(x.state.row.version,2);assert.equal(x.api.saveQueue.size,0);
 const restored=x.api.displayEntry(x.state.row);assert.equal(restored.analysis_purpose.primary,'resources');assert.ok(x.api.chatPrompt(restored).includes('Ressourcefordeling'));
});
test('a remote edit to the same analysis field blocks overwrite and retains the draft',async()=>{
 const x=await app();x.api.open('GAM-0001');x.api.entries[0].analysis_purpose={primary:'resources'};x.api.save(['analysis_purpose']);x.state.conflict=true;await x.api.flushDatabase();
 assert.equal(x.state.row.analysis_purpose.primary,'status');assert.equal(x.state.patches.length,1);assert.ok(x.api.saveQueue.get('GAM-0001').blocked);assert.equal(x.api.saveQueue.get('GAM-0001').fields.analysis_purpose.primary,'resources');
});
test('offline analysis edits remain queued and are confirmed after retry',async()=>{
 const x=await app();x.api.open('GAM-0001');x.api.entries[0].analysis_mechanism={primary:'capacity'};x.api.save(['analysis_mechanism']);x.state.offline=true;await x.api.flushDatabase();
 assert.ok(x.api.saveQueue.has('GAM-0001'));x.state.offline=false;await x.api.flushDatabase();assert.equal(x.api.saveQueue.size,0);assert.equal(x.state.row.analysis_mechanism.primary,'capacity');
});
test('editor draft survives card navigation and cancel discards only that draft',async()=>{
 const x=await app();x.api.open('GAM-0001');x.document.querySelector('[data-analysis-open="analysis_mechanism"]').click();
 const textarea=x.document.querySelector('[data-analysis-key="chain"]');textarea.value='Min ufærdige årsagskæde';textarea.dispatchEvent(new x.Event('input',{bubbles:true}));
 x.api.open('GAM-0001');x.document.querySelector('[data-analysis-open="analysis_mechanism"]').click();assert.equal(x.document.querySelector('[data-analysis-key="chain"]').value,'Min ufærdige årsagskæde');
 x.document.querySelector('[data-analysis-cancel="analysis_mechanism"]').click();assert.equal(Object.keys(x.api.typingDrafts).length,0);assert.equal(x.state.patches.length,0);
});
