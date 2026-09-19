const BASE = '/api/library/';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PAGE = /^[a-f0-9]{64}:\d+$/;
const HASH = /^[a-f0-9]{64}$/;
const headers = {'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const reply = (value,status=200) => Response.json(value,{status,headers});
const fail = (message,status=400) => {throw Object.assign(new Error(message),{status});};
export function validateFilters(raw={}) {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))fail('Ugyldigt filterobjekt.');
 const f={};
 for(const k of ['q','grade','topic','subtopic','difficulty','scope','status','view','collection']) if(raw[k]!==undefined && raw[k]!==null && raw[k]!=='') f[k]=String(raw[k]);
 if((f.q?.length||0)>200 || (f.subtopic?.length||0)>100) fail('Søgningen er for lang.');
 if(f.grade && !/^(?:[0-9]|1[0-2])$/.test(f.grade)) fail('Ugyldigt klassetrin.');
 if(f.topic && !/^[a-z_]{1,40}$/.test(f.topic)) fail('Ugyldigt emne.');
 for(const [k,values] of Object.entries({difficulty:['let','middel','svaer'],scope:['students','all'],status:['pending','review','complete','error'],view:['files','pages']})) if(f[k]&&!values.includes(f[k])) fail('Ugyldigt filter.');
 if(f.collection&&!UUID.test(f.collection)) fail('Ugyldig samling.');
 return f;
}
async function body(request) {
 if(!request.headers.get('content-type')?.includes('application/json')) fail('JSON kræves.',415);
 if(Number(request.headers.get('content-length')||0)>64000) fail('For stor forespørgsel.',413);
 const reader=request.body?.getReader();if(!reader)fail('Tom forespørgsel.');let bytes=0,chunks=[];
 while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>64000){await reader.cancel();fail('For stor forespørgsel.',413)}chunks.push(value)}
 const buffer=new Uint8Array(bytes);let offset=0;for(const c of chunks){buffer.set(c,offset);offset+=c.length}
 try{const parsed=JSON.parse(new TextDecoder().decode(buffer));if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))fail('JSON-objekt kræves.');return parsed}catch{fail('Ugyldig JSON.')}
}
function validName(name){if(typeof name!=='string'||!name.trim()||name.length>150)fail('Angiv et navn på højst 150 tegn.');return name.trim()}
export async function onRequest({request,env}) {
 try {
  const url=new URL(request.url),route=decodeURIComponent(url.pathname.slice(BASE.length));
  if(!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY)return reply({error:'Biblioteket er endnu ikke konfigureret.'},503);
  if(!['GET','HEAD'].includes(request.method)&&request.headers.get('origin')!==url.origin)return reply({error:'Ugyldig oprindelse.'},403);
  // Intentionally public, shared catalogue. Database grants limit anonymous writes
  // to manual assessments, saved filters and collections; import/AI data stays protected.
  const authHeaders={apikey:env.SUPABASE_ANON_KEY};
  async function db(path,method='GET',payload) {
   const res=await fetch(env.SUPABASE_URL+'/rest/v1/'+path,{method,headers:{...authHeaders,'Content-Type':'application/json',Prefer:'return=representation'},...(payload!==undefined?{body:JSON.stringify(payload)}:{})});
   if(!res.ok){console.error(JSON.stringify({event:'library_db_error',status:res.status,route:route.split('/')[0]}));fail('Databasen kunne ikke udføre handlingen.',res.status===403?403:502)}
   const text=await res.text();return text?JSON.parse(text):null;
  }
  if(route==='search' && request.method==='GET') {
   const f=validateFilters(Object.fromEntries(url.searchParams));
   const offset=Math.max(0,Math.min(Number(url.searchParams.get('offset'))||0,100000));
   return reply(await db('rpc/math_search','POST',{p_filters:f,p_offset:Math.floor(offset),p_limit:30}));
  }
  if(route==='bootstrap' && request.method==='GET') {
   const [stats,topics,filters,collections]=await Promise.all([db('rpc/math_stats','POST',{}),db('math_topics?select=*&order=label'),db('math_saved_filters?select=*&order=name'),db('math_collections?select=*&order=name')]);
   return reply({stats,topics,filters,collections});
  }
  if(route.startsWith('preview/')&&request.method==='GET') {
   const id=route.slice(8);if(!PAGE.test(id))fail('Ugyldigt sidetal.');
   const rows=await db('math_pages?select=preview_key&id=eq.'+encodeURIComponent(id));
   const key=rows[0]?.preview_key;
   if(!key||!env.MATH_PREVIEWS)return reply({error:'Forhåndsvisningen er ikke klar.'},404);
   const object=await env.MATH_PREVIEWS.get(key);
   if(!object)return reply({error:'Forhåndsvisningen mangler.'},404);
   return new Response(object.body,{headers:{...headers,'Content-Type':'image/jpeg','Content-Disposition':'inline'}});
  }
  if(route.startsWith('page/')&&request.method==='PATCH') {
   const id=route.slice(5);if(!PAGE.test(id))fail('Ugyldig side.');
   const value=await body(request);
   if(typeof value.summary!=='string'||value.summary.length>2000||!['math','other','unknown'].includes(value.subject)||!['student','answers','teacher','other'].includes(value.material_type)||!Array.isArray(value.assessments)||value.assessments.length>40)fail('Ugyldig vurdering.');
   for(const a of value.assessments){validateFilters({topic:a.topic,difficulty:a.difficulty});if(!a.topic||typeof a.subtopic!=='string'||a.subtopic.length>100||typeof a.skill!=='string'||a.skill.length>200)fail('Ugyldige emner.');for(const g of [a.grade_min,a.grade_max])if(g!==null&&(!Number.isInteger(g)||g<0||g>12))fail('Ugyldigt niveau.');if((a.grade_min===null)!==(a.grade_max===null)||(a.grade_min!==null&&a.grade_min>a.grade_max))fail('Ugyldigt niveauinterval.');}
   await db('rpc/math_correct_page','POST',{p_id:id,p_data:value});return reply({saved:true});
  }
  if(route==='filters'&&request.method==='POST') {const v=await body(request);return reply(await db('math_saved_filters','POST',{name:validName(v.name),filters:validateFilters(v.filters)}),201)}
  if(route==='collections'&&request.method==='POST') {const v=await body(request);return reply(await db('math_collections','POST',{name:validName(v.name)}),201)}
  const item=route.match(/^collections\/([0-9a-f-]+)\/items$/i);
  if(item&&UUID.test(item[1])) {
   if(request.method==='GET')return reply(await db('math_collection_items?select=*&collection_id=eq.'+item[1]));
   if(request.method==='POST') {const v=await body(request);if((!!v.page_id)===(!!v.content_id)||v.page_id&&!PAGE.test(v.page_id)||v.content_id&&!HASH.test(v.content_id))fail('Vælg en fil eller side.');return reply(await db('math_collection_items','POST',{collection_id:item[1],page_id:v.page_id||null,content_id:v.content_id||null}),201)}
  }
  const del=route.match(/^(filters|collections|items)\/([0-9a-f-]+)$/i);
  if(del&&UUID.test(del[2])&&request.method==='DELETE'){const table={filters:'math_saved_filters',collections:'math_collections',items:'math_collection_items'}[del[1]];await db(table+'?id=eq.'+del[2],'DELETE');return reply({deleted:true})}
  return reply({error:'Handlingen findes ikke.'},404);
 }catch(error){return reply({error:error.status?error.message:'Der opstod en fejl. Prøv igen.'},error.status||500)}
}
