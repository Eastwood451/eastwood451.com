import {mergeStates,same} from './sync-merge.js';
const API='/api/smfi',KEY='smfi-chatgpt-connection-v1',CACHE='smfi-chatgpt-cache-v1';
const adapter=window.smfiDiagram;
let connection,base,revision,busy=false,paused=false,stopped=false,conflictRow;
const button=document.createElement('button');button.className='chat-toggle-btn';button.id='smfiChatGPT';button.textContent='Forbind ChatGPT';
button.style.background='#5b4cda';button.type='button';
document.getElementById('chatToggleBtn').before(button);
const status=document.createElement('span');status.id='smfiSyncStatus';status.setAttribute('role','status');status.style.cssText='font:11px system-ui;max-width:210px;color:#637089;';button.after(status);
const resolveButton=document.createElement('button');resolveButton.id='smfiSyncResolve';resolveButton.type='button';resolveButton.textContent='Gennemse ændringer';resolveButton.hidden=true;resolveButton.className='chat-toggle-btn';status.after(resolveButton);
const syncStyle=document.createElement('style');syncStyle.textContent='#smfiSyncResolve[hidden]{display:none!important}';document.head.append(syncStyle);
const say=message=>{status.textContent=message;};
const snapshot=()=>adapter.exportState();
function cache(local=snapshot()) {
  localStorage.setItem(CACHE,JSON.stringify({id:connection.id,revision,base,state:local}));
}
async function api(path,method='GET',data) {
  const response=await fetch(API+path,{method,cache:'no-store',headers:{'Content-Type':'application/json',Authorization:'Bearer '+connection.owner_token},body:data===undefined?undefined:JSON.stringify(data),signal:AbortSignal.timeout(15000)});
  const result=await response.json();if(!response.ok)throw Object.assign(new Error(result.error_description||'Kunne ikke forbinde.'),{status:response.status});return result;
}
function apply(state) {if(!same(snapshot(),state))adapter.importState(state);}
function adopt(row) {
  const local=snapshot(),merged=mergeStates(base,local,row.state);
  if(merged.conflicts.length){paused=true;conflictRow=row;cache(local);resolveButton.hidden=false;say('Samtidige ændringer — begge kopier er bevaret.');return false;}
  apply(merged.value);base=row.state;revision=row.revision;cache();return true;
}
async function sync() {
  if(!connection||!base||busy||paused||stopped)return;
  busy=true;
  try {
    const row=await api('/workspace');
    if(row.revision!==revision&&!adopt(row))return;
    const current=snapshot();
    if(!same(current,base)) {
      cache(current);say('Gemmer…');const sent=current;
      try {
        const saved=await api('/workspace','PUT',{state:sent,expected_revision:revision});
        base=saved.state;revision=saved.revision;cache();
      } catch(error) {if(error.status===409){adopt(await api('/workspace'));return;}throw error;}
    }
    say(row.connected?'Synkroniseret med ChatGPT':'Diagram gemt · forbind pluginet');button.textContent='ChatGPT ✓';
  }catch(error){if(error.status===401){stopped=true;say('Forbindelsen er udløbet. Åbn ChatGPT-indstillinger.');}else say('Afventer forbindelse · lokal kopi gemt');}
  finally{busy=false;}
}
button.onclick=async()=>{
  if(connection){window.open('/SMFI_Suite/chatgpt.html','_blank','noopener');return;}
  button.disabled=true;say('Forbereder dit diagram…');
  try {
    const state=snapshot();
    const response=await fetch(API+'/bootstrap',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({state,label:state.operatorName+' · Nested Actor'})});
    const row=await response.json();if(!response.ok)throw new Error(row.error_description||'Forbindelsen kunne ikke oprettes.');
    connection={id:row.id,owner_token:row.owner_token};
    localStorage.setItem(KEY,JSON.stringify(connection));base=row.state;revision=row.revision;cache();
    button.textContent='ChatGPT ✓';say('Klar · klik for opsætning');
    window.open('/SMFI_Suite/chatgpt.html','_blank','noopener');
  }catch(error){say(error.message);}finally{button.disabled=false;}
};
function download(state,label) {
  const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='SMFI-'+label+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
resolveButton.onclick=()=>{
  const dialog=document.createElement('dialog');dialog.style.cssText='max-width:520px;padding:28px;border:1px solid #c9c8ef;border-radius:18px;font:15px/1.6 system-ui;';
  const title=document.createElement('h2');title.textContent='To ændringer i samme del af diagrammet';
  const p=document.createElement('p');p.textContent='Din lokale kopi er bevaret. Gem den som fil, og vælg hvilken version du vil arbejde videre med.';
  const local=document.createElement('button');local.textContent='Gem min lokale kopi';local.onclick=()=>download(snapshot(),'lokal-kopi');
  const remote=document.createElement('button');remote.textContent='Brug nyeste fra ChatGPT';
  remote.onclick=async()=>{try{const row=await api('/workspace');download(snapshot(),'foer-sammenfletning');apply(row.state);base=row.state;revision=row.revision;paused=false;conflictRow=null;resolveButton.hidden=true;cache();dialog.close();dialog.remove();sync();}catch{say('Kunne ikke hente diagrammet.');}};
  const close=document.createElement('button');close.textContent='Luk';close.onclick=()=>{dialog.close();dialog.remove();};
  dialog.append(title,p,local,remote,close);document.body.append(dialog);dialog.showModal();
};
async function start() {
  try {
    connection=JSON.parse(localStorage.getItem(KEY)||'null');if(!connection)return;
    const saved=JSON.parse(localStorage.getItem(CACHE)||'null');
    const row=await api('/workspace');
    if(saved?.id===connection.id&&saved.base){base=saved.base;revision=saved.revision;apply(saved.state);if(!adopt(row))return;}
    else{base=row.state;revision=row.revision;apply(row.state);cache();}
    button.textContent='ChatGPT ✓';await sync();
  }catch{say('Kunne ikke hente diagrammet. Din lokale kopi er bevaret.');
    // Recovery after network failure must retain both revision and local edits.
    try{const saved=JSON.parse(localStorage.getItem(CACHE)||'null');if(saved?.id===connection?.id&&saved.base){base=saved.base;revision=saved.revision;apply(saved.state);}}catch{}
  }
}
setInterval(()=>{if(connection&&base){try{cache();}catch{say('Den lokale kopi kunne ikke gemmes.');}sync();}},2000);
window.addEventListener('online',sync);
window.addEventListener('storage',event=>{if(event.key===KEY&&event.newValue!==JSON.stringify(connection)){stopped=true;say('Forbindelsen blev ændret. Genindlæs siden.');}});
window.addEventListener('beforeunload',event=>{if(connection&&base&&!same(snapshot(),base)){try{cache();}catch{}event.preventDefault();event.returnValue='';}});
start();
