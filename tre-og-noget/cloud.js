import {ANSWER_MODES, grade} from './engine.js';
import {freshProfile,restoreProfile,loadProfiles} from './storage.js';

const client=window.supabase.createClient('https://wpriingzftsboauvkmsj.supabase.co','sb_publishable_bSvkvx_Lqd5ZEt94oVdMaw_44WV2fYE');
const $=id=>document.getElementById(id);
let user, cacheKey, cache, running=false, timer, update=()=>{};
const note=text=>{$('storage-note').textContent=text;};
function persist(){localStorage.setItem(cacheKey,JSON.stringify(cache));}
function apply(state,op){
  const next=structuredClone(state), mode=op.mode;
  if(op.kind==='seed'){if(!next[mode])next[mode]=op.data;}
  else if(op.kind==='preferences')next.preferences={...next.preferences,...op.data};
  else if(op.kind==='reset')next[mode]=op.data;
  else if(op.kind==='answer'){
    const p=restoreProfile(next[mode]),card=p.cards.find(c=>c.id===op.card);
    p.round++;p.lastId=op.card;
    p.cards=p.cards.map(c=>c.id===op.card?grade(card,op.side,op.value,op.ms,p.round).card:c);
    next[mode]=p;
  }
  return next;
}
export function snapshot(){return cache.queue.reduce(apply,structuredClone(cache.confirmed));}
export function onUpdate(fn){update=fn;}
export function enqueue(operation){
  const op={...operation,id:crypto.randomUUID(),at:new Date().toISOString()};
  cache.queue.push(op);
  try{persist();}catch(error){note('Lokal lagring er fuld. Hold siden åben, til svarene er gemt.');}
  note('Gemmer fremskridt …');void sync();
}
export async function sync(){
  if(running)return;running=true;clearTimeout(timer);
  try{
    do{
      const op=cache.queue[0]||null;
      const {data,error}=await client.rpc('tre_og_noget_sync',{op});
      if(error)throw error;
      cache.confirmed=data;
      if(op)cache.queue.shift();
      persist();update(snapshot());
    }while(cache.queue.length);
    note('Alle fremskridt er gemt i Supabase.');
  }catch(error){
    note(cache.queue.length?'Afventer forbindelse · dine svar gemmes automatisk.':'Kun lokal kopi · prøver forbindelsen igen.');
    timer=setTimeout(sync,10000);
  }finally{running=false;}
}
export async function initialize(){
  const {data:{session}}=await client.auth.getSession();
  if(session)user=session.user;
  if(!user){
    $('cloud-login').hidden=false;
    $('login-loading').hidden=true;
    await new Promise(resolve=>{
      $('login-form').addEventListener('submit',async event=>{
        event.preventDefault();$('login-submit').disabled=true;$('login-error').textContent='';
        try{
          const {data,error}=await client.auth.signInWithPassword({email:$('login-email').value.trim(),password:$('login-password').value});
          if(error)throw error;user=data.user;$('login-password').value='';resolve();
        }catch{ $('login-error').textContent='Login lykkedes ikke. Kontrollér din e-mail, adgangskode og internetforbindelse.'; }
        finally{$('login-submit').disabled=false;}
      });
    });
  }
  $('cloud-login').hidden=true;$('login-loading').hidden=false;
  cacheKey='tre-og-noget-cloud-v1:'+user.id;
  try{cache=JSON.parse(localStorage.getItem(cacheKey));}catch{}
  if(!cache||!cache.confirmed||!Array.isArray(cache.queue))cache={confirmed:{},queue:[]};
  if(navigator.locks){
    await new Promise(resolve=>navigator.locks.request(cacheKey,{ifAvailable:true},lock=>{
      if(!lock){$('login-loading').textContent='Træningen er allerede åben i en anden fane. Luk den anden fane og genindlæs.';return new Promise(()=>{});}
      resolve();return new Promise(()=>{});
    }));
    // Read after acquiring the lock, so a previous tab's final writes are included.
    try{const latest=JSON.parse(localStorage.getItem(cacheKey));if(latest?.confirmed&&Array.isArray(latest.queue))cache=latest;}catch{}
  }
  const legacy=loadProfiles(localStorage);
  let oldSettings={};try{oldSettings=JSON.parse(localStorage.getItem('tre-og-noget-help-settings'))||{};}catch{}
  for(const mode of ANSWER_MODES){if(!snapshot()[mode])cache.queue.push({id:crypto.randomUUID(),kind:'seed',mode,data:legacy.profiles[mode]});}
  if(!snapshot().preferences)cache.queue.push({id:crypto.randomUUID(),kind:'seed',mode:'preferences',data:{answerMode:legacy.answerMode,autoContinue:oldSettings.autoContinue===true}});
  persist();await sync();
  $('login-loading').hidden=true;document.querySelector('.app').hidden=false;
  $('account-label').textContent=user.email;
  $('cloud-logout').addEventListener('click',async()=>{
    await sync();
    if(cache.queue.length){note('Vent med at logge ud: nogle svar mangler at blive gemt.');return;}
    await client.auth.signOut();location.reload();
  });
  client.auth.onAuthStateChange((event,session)=>{
    if(event==='SIGNED_OUT'||(session&&session.user.id!==user.id))location.reload();
  });
  window.addEventListener('online',sync);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)void sync();});
  $('import-progress').addEventListener('click',()=>$('import-file').click());
  $('import-file').addEventListener('change',async()=>{
    const file=$('import-file').files[0];if(!file)return;
    try{
      const data=JSON.parse(await file.text());
      const legacyModes=['nw','ne','south','all'];
      const validLegacy=legacyModes.every(m=>Array.isArray(data.profiles?.[m]?.cards)&&data.profiles[m].cards.length===45);
      const validDistance=data.profiles?.distance===undefined||Array.isArray(data.profiles.distance?.cards)&&data.profiles.distance.cards.length===45;
      if(data.app!=='tre-og-noget'||!validLegacy||!validDistance)throw new Error('Invalid backup');
      if(!confirm('Erstat de fem fremskridtsoversigter med fremskridtene fra filen?'))return;
      document.dispatchEvent(new Event('progress-import'));
      for(const mode of ANSWER_MODES)enqueue({kind:'reset',mode,data:mode==='distance'&&data.profiles?.distance===undefined?freshProfile():restoreProfile(data.profiles[mode])});
      enqueue({kind:'preferences',mode:'preferences',data:{answerMode:ANSWER_MODES.includes(data.answerMode)?data.answerMode:'all',autoContinue:data.autoContinue===true}});
      update(snapshot());await sync();
    }catch{note('Filen kunne ikke importeres. Vælg en eksport fra Tre-og-noget.');}
    finally{$('import-file').value='';}
  });
  return snapshot();
}
