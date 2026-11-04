import postgres from 'https://deno.land/x/postgresjs@v3.4.5/mod.js';

// Reads and saves go straight to the preparation tables through the existing
// RPCs. The conflict checks live in those RPCs (previous value or expected
// version), so nothing here overwrites a newer value.
const SITE='appgprj_6aa82da4671081919d5421baaa0c906e';
const OWNER='FxqOJQWIl9nBf8qxvLDuypycdtR7yCbSTY2qwrmo7hMzReje8ZzI7T';
const RECIPIENTS=['Klassen','Nicki','Malthe D'];
const CELL_FIELDS=[1,2,5], HOMEWORK_FIELDS=[0,3,4];
const MAX_TEXT=45000;

// Optional legacy source. Only Google Drive extras (material list, PDF covers,
// file-to-link lookup) and calendar events still come from here. Loading,
// reading and saving never depend on it; failures fall back silently.
const LEGACY='https://jacob-forberedelse.eastwood451.chatgpt.site';
// The app bundle is served from this repository; the asset routes only keep
// tabs opened before the switch working.
const LEGACY_ROUTES=['/google/config','/materials','/pdf-cover','/materials/resolve-file','/assets/app.js','/assets/app.css'];

const routes:Record<string,string[]>={
 '/session':['GET'], '/data':['GET'],
 '/lesson':['POST'], '/annual':['POST'], '/material':['POST'], '/register/sync':['POST'],
 '/google/config':['GET'], '/materials':['GET'], '/pdf-cover':['GET'], '/materials/resolve-file':['POST'],
 '/assets/app.js':['GET'], '/assets/app.css':['GET'],
};

class Rejected extends Error{status:number;constructor(status:number,message:string){super(message);this.status=status;}}
const CONFLICT='Planen er ændret, siden du åbnede den. Opdatér siden, og prøv igen. Intet blev overskrevet.';
const INVALID='Ændringen kunne ikke gemmes: ugyldig dato, spor, felt eller tekst.';
function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});}

function supabase(){
 const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!url||!key)throw Error('Connection missing');
 return {url,headers:{apikey:key,Authorization:'Bearer '+key}};
}
async function rest(path:string){
 const {url,headers}=supabase();
 const response=await fetch(url+'/rest/v1/'+path,{headers,signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error('Read failed');
 return await response.json();
}
async function rpc(name:string,args:Record<string,unknown>){
 const {url,headers}=supabase();
 const response=await fetch(url+'/rest/v1/rpc/'+name,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(20000)});
 const text=await response.text();
 let body:any=null;try{body=text?JSON.parse(text):null;}catch{body=null;}
 if(response.ok)return body;
 const code=String(body?.code||'');
 if(response.status===409||code==='PT409'||code==='40001')throw new Rejected(409,CONFLICT);
 if(response.status===400||response.status===404||['22023','22P02','22007','22008','23514','P0002'].includes(code))throw new Rejected(400,INVALID);
 throw Error('Save failed');
}

async function loadPlan(){
 const rows=await rest('preparation_plans?select=lessons,annual,version,updated_at&site_id=eq.'+SITE);
 if(!Array.isArray(rows)||rows.length!==1)throw Error('Plan missing');
 return rows[0];
}
async function loadHomework(){
 const records:any[]=[];
 for(let offset=0;offset<100000;offset+=1000){
  const page=await rest('preparation_homework?select=lesson_date,class_number,recipient,field,value,version,updated_at&site_id=eq.'+SITE+'&owner_id=eq.'+OWNER+'&order=lesson_date,class_number,recipient,field&limit=1000&offset='+offset);
  if(!Array.isArray(page))throw Error('Read failed');
  records.push(...page);
  if(page.length<1000)break;
 }
 return records;
}
// Homework fields 0/3/4 live in preparation_homework and override the plan text.
export function mergeHomework(lessons:any[],records:any[]){
 const copy=JSON.parse(JSON.stringify(Array.isArray(lessons)?lessons:[]));
 for(const lesson of copy)for(const row of lesson?.rows||[])row.homework=row.homework||{};
 for(const record of records){
  const lesson=copy.find((l:any)=>l.date===record.lesson_date&&l.className===record.class_number+'. klasse');
  const row=lesson?.rows?.find((r:any)=>r.name===record.recipient);
  if(!row||!Array.isArray(row.fields))continue;
  row.fields[record.field]=record.value;
  row.homework={...(row.homework||{}),[record.field]:{version:Number(record.version),updatedAt:record.updated_at}};
 }
 return copy;
}
async function currentPlan(){
 const [plan,records]=await Promise.all([loadPlan(),loadHomework()]);
 return {...plan,lessons:mergeHomework(plan.lessons,records)};
}

let eventsCache:{until:number;events:unknown[]}|null=null;
async function legacyEvents(){
 if(eventsCache&&eventsCache.until>Date.now())return eventsCache.events;
 let events:unknown[]=[];
 try{
  const response=await legacyFetch('/api/data','GET',null,null,4000);
  const body=response.ok?await response.json():null;
  if(Array.isArray(body?.events))events=body.events;
 }catch{events=[];}
 eventsCache={until:Date.now()+5*60000,events};
 return events;
}

async function readData(){
 const [plan,events]=await Promise.all([currentPlan(),legacyEvents()]);
 return {lessons:plan.lessons,annual:plan.annual,version:Number(plan.version),events,calendarErrors:[],homeworkSynced:true,syncedAt:plan.updated_at};
}

function isDate(value:unknown){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const d=new Date(value+'T00:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===value;
}
function text(value:unknown,allowMissing=false){
 if(allowMissing&&(value===undefined||value===null))return '';
 if(typeof value!=='string'||value.length>MAX_TEXT)throw new Rejected(400,INVALID);
 return value;
}
function lessonTarget(body:any){
 const className=body?.className, match=typeof className==='string'?/^(5|7)\. klasse$/.exec(className):null;
 const field=body?.field;
 if(!isDate(body?.date)||!match||!RECIPIENTS.includes(body?.name)||!Number.isInteger(field)||field<0||field>5)throw new Rejected(400,INVALID);
 return {date:body.date as string,className:className as string,classNumber:Number(match[1]),name:body.name as string,field:field as number};
}

export async function saveLesson(body:any){
 const t=lessonTarget(body);
 const value=text(body.value), previous=text(body.previous,true);
 const cellArgs={p_site_id:SITE,p_date:t.date,p_class_name:t.className,p_recipient:t.name,p_field:t.field,p_value:value,p_previous:previous};
 if(body.kind==='note'){
  const saved=await rpc('save_preparation_note',cellArgs);
  if(saved?.value!==value)throw Error('Save not confirmed');
  return {saved:true,value,version:saved.version};
 }
 if(CELL_FIELDS.includes(t.field)){
  const saved=await rpc('save_preparation_cell',cellArgs);
  if(saved?.value!==value)throw Error('Save not confirmed');
  return {saved:true,value,version:saved.version};
 }
 const expected=body.expectedVersion===undefined||body.expectedVersion===null?0:body.expectedVersion;
 if(!Number.isSafeInteger(expected)||expected<0)throw new Rejected(400,INVALID);
 if(expected===0){
  // No homework record was seen. The text the client edited came from the plan,
  // so it must still be the plan text (or already the new value).
  const plan=await currentPlan();
  const row=plan.lessons.find((l:any)=>l.date===t.date&&l.className===t.className)?.rows?.find((r:any)=>r.name===t.name);
  if(row?.homework?.[t.field]?.version)throw new Rejected(409,CONFLICT);
  const current=row?.fields?.[t.field]??'';
  if(row&&current!==previous&&current!==value)throw new Rejected(409,CONFLICT);
 }
 const record=await rpc('save_preparation_homework',{p_site_id:SITE,p_owner_id:OWNER,p_lesson_date:t.date,p_class_number:t.classNumber,p_recipient:t.name,p_field:t.field,p_value:value,p_expected_version:expected});
 if(!record||record.value!==value||record.recipient!==t.name||Number(record.field)!==t.field||record.lesson_date!==t.date||record.owner_id!==OWNER)throw Error('Save not confirmed');
 return {saved:true,value,record:{lesson_date:record.lesson_date,class_number:record.class_number,recipient:record.recipient,field:record.field,value:record.value,version:record.version,updated_at:record.updated_at}};
}

export async function saveAnnual(body:any){
 const expected=body?.expectedVersion;
 if(!Array.isArray(body?.annual)||!Number.isSafeInteger(expected)||expected<1)throw new Rejected(400,'Årsplanen kunne ikke gemmes: ugyldige data.');
 const saved=await rpc('save_preparation_annual',{p_site_id:SITE,p_annual:body.annual,p_expected_version:expected});
 if(!saved||!Array.isArray(saved.annual))throw Error('Save not confirmed');
 return {saved:true,annual:saved.annual,version:saved.version};
}

export function isMaterialUrl(value:unknown){
 try{const u=new URL(String(value));return u.protocol==='https:'&&['drive.google.com','docs.google.com'].includes(u.hostname)&&!u.username&&!u.password&&u.href.length<=2000;}catch{return false;}
}
// Same block format as the app's file drop: "label\nurl", blocks separated by a blank line.
export function appendMaterial(current:string,label:string,url:string){
 if(current.match(/https?:\/\/[^\s<>]+/g)?.includes(url))return current;
 return current+(current?(current.endsWith('\n\n')?'':'\n\n'):'')+label.replace(/[\r\n]+/g,' ').trim()+'\n'+url;
}
export async function addMaterial(body:any){
 const t=lessonTarget({...body,className:body?.className??'5. klasse'});
 const title=typeof body?.title==='string'?body.title.replace(/[\r\n_]+/g,' ').trim().slice(0,300):'';
 const page=body?.page===undefined||body?.page===null||body?.page===''?null:Number(body.page);
 if(!title||!isMaterialUrl(body?.url)||(page!==null&&(!Number.isInteger(page)||page<1||page>999999)))throw new Rejected(400,'Materialet kunne ikke tilføjes: titel eller link mangler.');
 const label=title+(page?' · s. '+page:'');
 let plan=await currentPlan();
 const find=()=>plan.lessons.find((l:any)=>l.date===t.date&&l.className===t.className)?.rows?.find((r:any)=>r.name===t.name);
 let row=find();
 if(!row){
  // Creates the empty lesson from the template only when it does not exist yet.
  await rpc('ensure_preparation_lesson',{p_site_id:SITE,p_date:t.date,p_class_name:t.className,p_recipient:t.name});
  plan=await currentPlan();row=find();
  if(!row)throw new Rejected(400,INVALID);
 }
 const current=String(row.fields?.[t.field]??'');
 const value=appendMaterial(current,label,body.url);
 if(value===current)return {saved:false,duplicate:true,value};
 if(value.length>MAX_TEXT)throw new Rejected(400,'Feltet er for langt. Forkort teksten først.');
 return await saveLesson({date:t.date,className:t.className,name:t.name,field:t.field,previous:current,value,expectedVersion:row.homework?.[t.field]?.version||0});
}

const sql=postgres(Deno.env.get('SUPABASE_DB_URL')!,{prepare:false,max:2,connect_timeout:15});
let cached:{until:number;token:string;bypass:string}|null=null;
async function credentials(){
 if(cached&&cached.until>Date.now())return cached;
 const rows=await sql`select name,decrypted_secret from vault.decrypted_secrets where name in ('forberedelse_sync_token','forberedelse_site_bypass')`;
 const values=Object.fromEntries(rows.map(r=>[r.name,r.decrypted_secret]));
 if(!values.forberedelse_sync_token||!values.forberedelse_site_bypass)throw Error('Connection missing');
 return cached={until:Date.now()+60000,token:values.forberedelse_sync_token,bypass:values.forberedelse_site_bypass};
}
async function legacyFetch(target:string,method:string,body:BodyInit|null,contentType:string|null,timeout:number){
 const {token,bypass}=await credentials();
 const headers=new Headers({'OAI-Sites-Authorization':'Bearer '+bypass,'x-eastwood-agent-token':token,'Origin':LEGACY});
 if(contentType)headers.set('Content-Type',contentType);
 return await fetch(LEGACY+target,{method,headers,body:method==='POST'?body:undefined,redirect:'manual',signal:AbortSignal.timeout(timeout)});
}

async function readJson(req:Request){
 try{return await req.json();}catch{throw new Rejected(400,INVALID);}
}

Deno.serve(async req=>{try{
 // The owner explicitly enabled public read/write access to these app routes.
 // The Cloudflare Pages Function in front rejects cross-origin writes.
 const url=new URL(req.url),prefix='/agent-skolelaerer';
 const index=url.pathname.indexOf(prefix);const path=index<0?'':url.pathname.slice(index+prefix.length);
 if(!routes[path]?.includes(req.method))return json({error:'Ukendt handling.'},404);
 if(path==='/session')return json({ok:true});
 if(Number(req.headers.get('content-length'))>96*1024*1024)return json({error:'Filen er for stor.'},413);
 if(path==='/data')return json(await readData());
 if(path==='/lesson')return json(await saveLesson(await readJson(req)));
 if(path==='/annual')return json(await saveAnnual(await readJson(req)));
 if(path==='/material')return json(await addMaterial(await readJson(req)));
 const contentType=req.headers.get('content-type');

 // Sync goes straight to the dedicated Supabase sync function.
 if(path==='/register/sync'){
  const internal=Deno.env.get('SUPABASE_URL');
  if(!internal)throw Error('Connection missing');
  const {token}=await credentials();
  const headers=new Headers({'x-register-token':token});
  if(contentType)headers.set('Content-Type',contentType);
  const response=await fetch(internal+'/functions/v1/forberedelse-sync',{
   method:'POST',headers,body:req.body,signal:AbortSignal.timeout(60000)
  });
  const type=response.headers.get('content-type')||'';
  if(!/json/i.test(type))return json({ok:false,error:'Synkroniseringen svarede ikke korrekt. Prøv igen.'},502);
  return new Response(response.body,{status:response.status,headers:{
   'Content-Type':'application/json','Cache-Control':'no-store',
   'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'
  }});
 }

 // Optional Google Drive extras from the legacy source.
 if(LEGACY_ROUTES.includes(path)){
  try{
   const target=path.startsWith('/assets/')?'/agent-skolelaerer/'+path.slice(8):'/api'+path;
   const response=await legacyFetch(target+url.search,req.method,req.body,contentType,path==='/materials/resolve-file'?115000:30000);
   const type=response.headers.get('content-type')||'';
   if(response.status>=300&&response.status<400||!/json|javascript|css|image\//i.test(type))throw Error('Legacy unavailable');
   return new Response(response.body,{status:response.status,headers:{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
  }catch{
   if(path==='/google/config')return json({configured:false,connected:false,previews:false});
   return json({error:'Google Drive-materialer er ikke tilgængelige lige nu. Gem og læs virker stadig.'},503);
  }
 }
 return json({error:'Ukendt handling.'},404);
 }catch(error){
  if(error instanceof Rejected)return json({error:error.message},error.status);
  return json({error:'Forbindelsen kunne ikke gennemføres. Prøv igen.'},502);
 }
});
