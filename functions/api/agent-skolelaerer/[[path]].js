const EDGE='https://uxbrnmcbvxgpsvdbzcov.supabase.co/functions/v1/agent-skolelaerer';
const PREFIX='/api/agent-skolelaerer';
const COOKIE='__Secure-eastwood_school';
const cookie=(token,age)=>`${COOKIE}=${token}; Path=${PREFIX}; Max-Age=${age}; HttpOnly; Secure; SameSite=Strict`;
const json=(data,status=200,extra={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...extra}});
export async function onRequest({request}){
 const url=new URL(request.url),path=url.pathname.slice(PREFIX.length);
 const validOrigin=['https://eastwood451.com','https://www.eastwood451.com'].includes(url.origin);
 if(!validOrigin)return json({error:'Åbn appen på eastwood451.com.'},403);
 if(!['GET','POST','DELETE'].includes(request.method))return json({error:'Metoden er ikke tilladt.'},405);
 if(request.method!=='GET'&&request.headers.get('origin')!==url.origin)return json({error:'Ugyldig afsender.'},403);
 if(path==='/session'&&request.method==='DELETE')return json({ok:true},200,{'Set-Cookie':cookie('',0)});
 let token='';
 if(path==='/session'&&request.method==='POST')token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');
 else token=(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||'';
 if(!/^[\w.-]{20,10000}$/.test(token))return json({error:'Log ind på Eastwood451.'},401);
 const headers=new Headers({Authorization:'Bearer '+token});
 const type=request.headers.get('content-type');if(type)headers.set('Content-Type',type);
 const length=request.headers.get('content-length');if(length)headers.set('Content-Length',length);
 try{
 const session=path==='/session';
 if(session)headers.delete('Content-Length');
 const result=await fetch(EDGE+path+url.search,{method:session?'GET':request.method,headers,body:!session&&request.method==='POST'?request.body:undefined,redirect:'manual'});
 if(session){if(!result.ok)return json({error:result.status===403?'Denne app er privat. Brug ejerens Eastwood-konto.':'Dit login kunne ikke bekræftes.'},result.status);return json({ok:true},200,{'Set-Cookie':cookie(token,3600)});}
 return new Response(result.body,{status:result.status,headers:{'Content-Type':result.headers.get('content-type')||'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
 }catch{return json({error:'Forbindelsen kunne ikke gennemføres. Prøv igen.'},502);}
}
