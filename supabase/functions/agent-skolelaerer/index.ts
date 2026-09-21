import postgres from 'https://deno.land/x/postgresjs@v3.4.5/mod.js';
const SOURCE='https://jacob-forberedelse.eastwood451.chatgpt.site';
const routes:Record<string,string[]>={
 '/session':['GET'], '/assets/app.js':['GET'], '/assets/app.css':['GET'],
 '/data':['GET'], '/google/config':['GET'], '/materials':['GET'],
 '/pdf-cover':['GET'], '/materials/resolve-file':['POST'],
 '/lesson':['POST'], '/annual':['POST'], '/register/sync':['POST'],
};
const sql=postgres(Deno.env.get('SUPABASE_DB_URL')!,{prepare:false,max:2,connect_timeout:15});
let cached:{until:number;token:string;bypass:string}|null=null;
async function credentials(){
 if(cached&&cached.until>Date.now())return cached;
 const rows=await sql`select name,decrypted_secret from vault.decrypted_secrets where name in ('forberedelse_sync_token','forberedelse_site_bypass')`;
 const values=Object.fromEntries(rows.map(r=>[r.name,r.decrypted_secret]));
 if(!values.forberedelse_sync_token||!values.forberedelse_site_bypass)throw Error('Connection missing');
 return cached={until:Date.now()+60000,token:values.forberedelse_sync_token,bypass:values.forberedelse_site_bypass};
}
function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}});}
Deno.serve(async req=>{try{
 // The owner explicitly enabled public read/write access to these app routes.
 // Vault credentials remain server-side; unrelated Sites endpoints stay inaccessible.
 const url=new URL(req.url),prefix='/agent-skolelaerer';
 const index=url.pathname.indexOf(prefix);const path=index<0?'':url.pathname.slice(index+prefix.length);
 if(!routes[path]?.includes(req.method))return json({error:'Ukendt handling.'},404);
 if(path==='/session')return json({ok:true});
 if(Number(req.headers.get('content-length'))>96*1024*1024)return json({error:'Filen er for stor.'},413);
 const {token,bypass}=await credentials();
 const target=path.startsWith('/assets/')?'/agent-skolelaerer/'+path.slice(8):'/api'+path;
 const headers=new Headers({'OAI-Sites-Authorization':'Bearer '+bypass,'x-eastwood-agent-token':token,'Origin':SOURCE});
 const contentType=req.headers.get('content-type');if(contentType)headers.set('Content-Type',contentType);
 const response=await fetch(SOURCE+target+url.search,{method:req.method,headers,body:req.method==='POST'?req.body:undefined,redirect:'manual',signal:AbortSignal.timeout(115000)});
 if(response.status>=300&&response.status<400)return json({error:'Appens private forbindelse kunne ikke åbnes.'},502);
 const type=response.headers.get('content-type')||'';
 if(!/json|javascript|css|image\//i.test(type))return json({error:'Appens forbindelse svarede ikke korrekt.'},502);
 return new Response(response.body,{status:response.status,headers:{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
 }catch{return json({error:'Forbindelsen kunne ikke gennemføres. Prøv igen.'},502);}
});
