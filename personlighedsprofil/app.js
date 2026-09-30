import {normalizePeople,normalizeProfile,readImport,mergePeople} from './data.js';
const $=id=>document.getElementById(id), module=window.ProfileModule;
let client,user,localMode=false,people=[],revision=0,changes=0,saved=0,busy=false,conflict=false,timer,cacheKey;
const note=text=>{$('save-status').textContent=text;};
function remember(){try{localStorage.setItem(cacheKey,JSON.stringify({revision,people,pending:!localMode&&changes!==saved}));}catch{note('Den lokale kopi kunne ikke gemmes. Hold siden åben til synkronisering er færdig.');}}
function changed(){changes++;remember();if(localMode){saved=changes;note('Profilerne er gemt på denne enhed.');return;}note('Gemmer profiler…');clearTimeout(timer);timer=setTimeout(sync,500);}
function render(selected=module.currentId){
 module.setPeople(people);
 $('person-select').replaceChildren(...people.map(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name;return o;}));
 const active=people.find(p=>p.id===selected)||people[0];if(active){$('person-select').value=active.id;module.select(active.id);}
 $('empty').hidden=!!people.length;for(const id of ['rename','delete'])$(id).disabled=!people.length;
}
async function remote(){const {data,error}=await client.from('personality_documents').select('people,revision').eq('user_id',user.id).maybeSingle();if(error)throw error;return data?{people:normalizePeople(data.people),revision:data.revision}:{people:[],revision:0};}
async function sync(){
 if(busy||conflict||changes===saved)return;busy=true;clearTimeout(timer);$('retry').hidden=true;
 try{
  while(changes!==saved&&!conflict){
   const serial=changes,snapshot=normalizePeople(people),row={user_id:user.id,people:snapshot,revision:revision+1,updated_at:new Date().toISOString()};
   const query=revision===0?client.from('personality_documents').insert(row):client.from('personality_documents').update(row).eq('user_id',user.id).eq('revision',revision);
   const {data,error}=await query.select('revision').maybeSingle();
   if(error?.code==='23505'||(!error&&!data)){conflict=true;note('Profilerne er ændret i en anden fane eller på en anden enhed. Eksportér din kopi, eller hent de nyeste profiler.');$('load-cloud').hidden=false;remember();break;}
   if(error)throw error;
   revision=data.revision;saved=serial;remember();
  }
  if(!conflict)note('Alle profiler er gemt på din konto.');
 }catch{note('Afventer forbindelse. Din lokale kopi er gemt; prøv igen.');$('retry').hidden=false;}
 finally{busy=false;}
}
function importValue(data){const incoming=readImport(data);people=mergePeople(people,incoming);render();changed();return incoming.length;}
window.pmDoImport=()=>{try{importValue(JSON.parse($('pmImportText').value));window.pmCloseImport();}catch(error){$('pmImportError').textContent=error.message;$('pmImportError').style.display='block';}};
window.exportProfiles=()=>{
 const profiles=people.map(p=>({id:p.id,label:p.name,...p.profile,confidence:p.profile._confidence,rationale_da:p.profile._rationale}));
 const url=URL.createObjectURL(new Blob([JSON.stringify({schema:'smfi-profile-import-v1',profiles},null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='smfi-personlighedsprofiler.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
window.addEventListener('profile-changed',changed);
$('person-select').addEventListener('change',()=>module.select($('person-select').value));
$('person-form').addEventListener('submit',event=>{event.preventDefault();try{const person={id:crypto.randomUUID(),name:$('person-name').value.trim(),profile:normalizeProfile()};people=normalizePeople([...people,person]);render(person.id);$('person-name').value='';changed();}catch(error){note(error.message);}});
$('rename').onclick=()=>{const person=people.find(p=>p.id===module.currentId);if(!person)return;const name=prompt('Nyt navn',person.name);if(name===null)return;try{people=normalizePeople(people.map(p=>p.id===person.id?{...p,name}:p));render(person.id);changed();}catch(error){note(error.message);}};
$('delete').onclick=()=>{const person=people.find(p=>p.id===module.currentId);if(!person||!confirm('Slet profilen for '+person.name+'?'))return;people=people.filter(p=>p.id!==person.id);render();changed();};
$('import-file-button').onclick=()=>$('import-file').click();
$('import-file').onchange=async()=>{try{const file=$('import-file').files[0];if(!file)return;if(file.size>2e6)throw new Error('Filen er for stor (maks. 2 MB).');importValue(JSON.parse(await file.text()));}catch(error){note(error.message);}finally{$('import-file').value='';}};
$('import-library').onclick=()=>{try{const library=JSON.parse(localStorage.getItem('smfi-nested-actor-saved-people')||'[]');if(!library.length)throw new Error('Ingen gemte personer fundet i denne browser. Brug Åbn profilfil til en gemt Nested Actor-fil.');importValue({savedPeopleLibrary:library});}catch(error){note(error.message);}};
$('retry').onclick=sync;window.addEventListener('online',sync);
$('load-cloud').onclick=async()=>{if(!confirm('Erstat din lokale kopi med de nyeste profiler? Eksportér først, hvis du vil beholde dine ændringer.'))return;try{const data=await remote();people=data.people;revision=data.revision;changes=saved=0;conflict=false;remember();render();$('load-cloud').hidden=true;note('Nyeste profiler hentet.');}catch{note('Profilerne kunne ikke hentes. Prøv igen.');}};
$('theme-toggle').onclick=()=>{document.body.classList.toggle('theme-light');localStorage.setItem('smfi-profile-theme',document.body.classList.contains('theme-light')?'light':'dark');};
if(localStorage.getItem('smfi-profile-theme')==='light')document.body.classList.add('theme-light');
$('logout').onclick=async()=>{await sync();if(changes!==saved){note('Gem eller eksportér dine ændringer, før du logger ud.');return;}await client.auth.signOut();location.reload();};
window.addEventListener('beforeunload',event=>{if(changes!==saved){event.preventDefault();event.returnValue='';}});
function startLocal(){
 localMode=true;cacheKey='smfi-profile-local-v1';
 try{const cached=JSON.parse(localStorage.getItem(cacheKey)||'null');people=normalizePeople(cached?.people||[]);}catch{people=[];note('Den lokale kopi kunne ikke læses. Importér en eksporteret profilfil, hvis du har en.');}
 render();$('loading').hidden=true;$('app').hidden=false;
 if(!$('save-status').textContent)note('Profilerne gemmes på denne enhed. Brug Eksportér JSON som sikkerhedskopi.');
}
async function start(){
 // The site's shared password does not identify a Supabase user. Reuse an
 // existing account session when present; otherwise keep profiles on-device.
 const script=document.createElement('script');script.src='../tre-og-noget/supabase-2.57.4.js';
 await new Promise(resolve=>{script.onload=resolve;script.onerror=resolve;document.head.appendChild(script);});
 if(!window.supabase){startLocal();return;}
 try{
  const response=await fetch('/api/config',{cache:'no-store'});
  if(!response.ok)throw new Error('Konfiguration mangler.');
  const config=await response.json();
  if(!config.supabaseUrl||!config.supabaseAnonKey)throw new Error('Konfiguration mangler.');
  client=window.supabase.createClient(config.supabaseUrl,config.supabaseAnonKey);
  const {data:{session}}=await client.auth.getSession();user=session?.user;
  if(!user){startLocal();return;}
  cacheKey='smfi-profile-private-v1:'+user.id;
  client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'||session&&session.user.id!==user.id)location.reload();});
  const data=await remote();people=data.people;revision=data.revision;
  try{const cached=JSON.parse(localStorage.getItem(cacheKey));if(cached?.pending){people=normalizePeople(cached.people);changes=1;if(cached.revision!==revision){conflict=true;$('load-cloud').hidden=false;}else revision=cached.revision;}}catch{}
  render();$('loading').hidden=true;$('app').hidden=false;$('logout').hidden=false;
  note(conflict?'Der er lokale ændringer og nyere profiler på kontoen. Eksportér din kopi, eller hent de nyeste profiler.':'Alle profiler er gemt på din konto.');await sync();
 }catch{startLocal();}
}
start();
