import * as nestedModel from './model.js';
const {text,MAX_BYTES}=nestedModel;

export const SITE='https://eastwood451.com', BASE=SITE+'/api/smfi', RESOURCE=BASE+'/mcp';
const SCOPES=['smfi:read','smfi:write','offline_access'];
const TTL={request:600,code:120,access:3600,refresh:30*86400,client:365*86400,rate:3700};
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
export const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
export async function digest(value) {return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');}
export async function challenge(value) {return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
const expiry=seconds=>new Date(Date.now()+seconds*1000).toISOString();
const safeHeaders={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const json=(data,status=200,extra={})=>Response.json(data,{status,headers:{...safeHeaders,...extra}});
const redirect=url=>new Response(null,{status:302,headers:{...safeHeaders,Location:url}});
const authHeader=()=>`Bearer resource_metadata="${BASE}/resource-metadata", scope="smfi:read smfi:write"`;
export function authorizationMetadata(){return {issuer:BASE,authorization_endpoint:BASE+'/authorize',token_endpoint:BASE+'/token',registration_endpoint:BASE+'/register',revocation_endpoint:BASE+'/revoke',response_types_supported:['code'],grant_types_supported:['authorization_code','refresh_token'],token_endpoint_auth_methods_supported:['none','client_secret_post','client_secret_basic'],code_challenge_methods_supported:['S256'],scopes_supported:SCOPES,authorization_response_iss_parameter_supported:true};}
export function protectedMetadata(){return {resource:RESOURCE,authorization_servers:[BASE],scopes_supported:['smfi:read','smfi:write'],bearer_methods_supported:['header'],resource_name:'SMFI Nested Actor'};}
export function validRedirect(value) {
  try {const u=new URL(value);return !u.username&&!u.password&&!u.hash&&!u.search&&((u.origin==='https://chatgpt.com'&&(u.pathname==='/connector_platform_oauth_redirect'||/^\/connector\/oauth\/[a-zA-Z0-9_-]+$/.test(u.pathname)))||(u.origin==='https://grok.com'&&/^\/connectors-oauth-exchange-code\/?$/.test(u.pathname)));}catch{return false;}
}
async function body(request) {
  if (Number(request.headers.get('content-length'))>MAX_BYTES+10000) fail('Request too large.',413);
  const reader=request.body?.getReader();if(!reader)fail('Request body required.');
  const chunks=[];let n=0;
  while(true){const {done,value}=await reader.read();if(done)break;n+=value.length;if(n>MAX_BYTES+10000){await reader.cancel();fail('Request too large.',413);}chunks.push(value);}
  const bytes=new Uint8Array(n);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
  const raw=new TextDecoder().decode(bytes);
  try {if(request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded'))return Object.fromEntries(new URLSearchParams(raw));return JSON.parse(raw);}catch{fail('Invalid request body.');}
}
export function createDatabase(url,secret,fetcher=fetch) {
  return async (table,method='GET',query='',value)=>{
    const response=await fetcher(url+'/rest/v1/'+table+(query?'?'+query:''),{method,headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json',Prefer:'return=representation'},body:value===undefined?undefined:JSON.stringify(value)});
    if(!response.ok){const err=await response.json().catch(()=>({}));if(err.code==='23505')fail('Concurrent update; retry.',409);throw Object.assign(new Error('Storage unavailable.'),{status:503});}
    return response.status===204?[]:response.json();
  };
}
export function createHandler(db, options={}) {
  const model=options.model||nestedModel;
  const {validateState,describe,mutate,TOOLS}=model;
  const BASE=options.base||SITE+'/api/smfi', RESOURCE=BASE+'/mcp';
  const READ_SCOPE=options.readScope||'smfi:read',WRITE_SCOPE=options.writeScope||'smfi:write';
  const SCOPES=[READ_SCOPE,WRITE_SCOPE,'offline_access'];
  const TITLE=options.title||'SMFI Nested Actor',MODEL_KIND=options.model?'belief-map':'nested-actor';
  const SETUP=options.setup||'/SMFI_Suite/chatgpt.html';
  const isState=options.isState||((state)=>state?.kind!=='belief-map');
  const authHeader=()=>`Bearer resource_metadata="${BASE}/resource-metadata", scope="${READ_SCOPE} ${WRITE_SCOPE}"`;
  const authorizationMetadata=()=>({issuer:BASE,authorization_endpoint:BASE+'/authorize',token_endpoint:BASE+'/token',registration_endpoint:BASE+'/register',revocation_endpoint:BASE+'/revoke',response_types_supported:['code'],grant_types_supported:['authorization_code','refresh_token'],token_endpoint_auth_methods_supported:['none','client_secret_post','client_secret_basic'],code_challenge_methods_supported:['S256'],scopes_supported:SCOPES,authorization_response_iss_parameter_supported:true});
  const protectedMetadata=()=>({resource:RESOURCE,authorization_servers:[BASE],scopes_supported:[READ_SCOPE,WRITE_SCOPE],bearer_methods_supported:['header'],resource_name:TITLE});
  const getRecord=async(id,kind)=>{const row=(await db('smfi_mcp_oauth','GET',`id=eq.${encodeURIComponent(id)}&kind=eq.${kind}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}`))[0];return row&&(row.payload.resource||SITE+'/api/smfi/mcp')===RESOURCE?row:undefined;};
  const putRecord=(id,kind,payload,workspace_id=null)=>db('smfi_mcp_oauth','POST','',{id,kind,payload,workspace_id,expires_at:expiry(TTL[kind])});
  const consume=async(id,kind)=>(await db('smfi_mcp_oauth','DELETE',`id=eq.${encodeURIComponent(id)}&kind=eq.${kind}&payload->>resource=eq.${encodeURIComponent(RESOURCE)}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}`))[0];
  async function workspace(request) {
    const token=request.headers.get('authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];if(!token)fail('Private diagram connection required.',401);
    const row=(await db('smfi_mcp_workspaces','GET','owner_hash=eq.'+await digest(token)))[0];if(!row||!isState(row.state))fail('Unknown private diagram connection.',401);return row;
  }
  async function oauth(request) {
    const token=request.headers.get('authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];if(!token)fail('Authorization required.',401);
    const record=await getRecord(await digest(token),'access');if(!record||record.payload.resource!==RESOURCE)fail('Invalid or expired access token.',401);
    const row=(await db('smfi_mcp_workspaces','GET','id=eq.'+record.workspace_id))[0];if(!row||!isState(row.state))fail('Diagram not found.',401);
    return {row,record};
  }
  async function rate(request,kind,max) {
    // Fixed slots make the limit atomic without read/increment races.
    const ip=request.headers.get('cf-connecting-ip')||request.headers.get('x-forwarded-for')||'unknown';
    const bucket=await digest(BASE+':'+kind+':'+ip+':'+Math.floor(Date.now()/3600000));
    for(let n=0;n<max;n++){try {await putRecord(bucket+'-'+n,'rate',{});return;}catch(e){if(e.status!==409)throw e;}}
    fail('Too many requests. Try again later.',429);
  }
  function browserOrigin(request){if(request.headers.get('origin')!==SITE)fail('Invalid browser origin.',403);}
  async function clientAuth(request,args) {
    let id=args.client_id,secret=args.client_secret,method=secret?'client_secret_post':'none';
    const basic=request.headers.get('authorization')?.match(/^Basic (.+)$/);
    if(basic){let decoded;try{decoded=atob(basic[1]);}catch{fail('Invalid client.',401);}const colon=decoded.indexOf(':');if(colon<0)fail('Invalid client.',401);id=decodeURIComponent(decoded.slice(0,colon));secret=decodeURIComponent(decoded.slice(colon+1));method='client_secret_basic';}
    const client=typeof id==='string'?await getRecord(id,'client'):null;
    if(!client||client.payload.method!==method||(client.payload.secret_hash&&await digest(secret||'')!==client.payload.secret_hash))fail('Invalid client.',401);
    return client;
  }
  async function tokens(record) {
    const access=random(),refresh=random();
    const payload={client_id:record.payload.client_id,scope:record.payload.scope,resource:RESOURCE,provider:record.payload.provider||'chatgpt'};
    await putRecord(await digest(access),'access',payload,record.workspace_id);
    if(payload.scope.split(' ').includes('offline_access'))await putRecord(await digest(refresh),'refresh',payload,record.workspace_id);
    return {access_token:access,token_type:'Bearer',expires_in:TTL.access,scope:payload.scope,...payload.scope.split(' ').includes('offline_access')?{refresh_token:refresh}:{}};
  }
  async function save(row,state,revision,source) {
    if(!Number.isInteger(revision)||revision!==row.revision)fail('Diagram changed. Read the current revision before editing.',409);
    const rows=await db('smfi_mcp_workspaces','PATCH',`id=eq.${row.id}&revision=eq.${revision}`,{state:validateState(state),revision:revision+1,source,updated_at:new Date().toISOString()});
    if(!rows.length)fail('Diagram changed. Read the current revision before editing.',409);return rows[0];
  }
  const publicRow=row=>({id:row.id,label:row.label,state:row.state,revision:row.revision,source:row.source,connected:!!row.connected_at,updated_at:row.updated_at});

  return async function handle(request) {
    const u=new URL(request.url), prefix=new URL(BASE).pathname;
    let path=u.pathname.replace(/^\/(?:functions\/v1\/)?(?:smfi-mcp|belief-mcp)/,'');
    if(path.startsWith(prefix))path=path.slice(prefix.length);path=path.replace(/\/$/,'')||'/';
    try {
      if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...safeHeaders,'Access-Control-Allow-Origin':SITE,'Access-Control-Allow-Headers':'authorization,content-type,mcp-protocol-version','Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS'}});
      if(request.method==='GET'&&path==='/health')return json({ok:true,version:'1.1.0',kind:MODEL_KIND,model_calls:false});
      if(request.method==='GET'&&(path==='/oauth-metadata'||path.includes('/.well-known/oauth-authorization-server')))return json(authorizationMetadata());
      if(request.method==='GET'&&(path==='/resource-metadata'||path.includes('/.well-known/oauth-protected-resource')))return json(protectedMetadata());
      if(path==='/bootstrap'&&request.method==='POST') {
        browserOrigin(request);await rate(request,'workspace',5);const args=await body(request),state=validateState(args.state),secret=random();
        const row=(await db('smfi_mcp_workspaces','POST','',{owner_hash:await digest(secret),state,label:text(args.label||TITLE,120)}))[0];
        return json({...publicRow(row),owner_token:secret},201);
      }
      if(path==='/workspace') {
        const row=await workspace(request);
        if(request.method==='GET')return json(publicRow(row));
        if(request.method==='PUT'){browserOrigin(request);const args=await body(request);return json(publicRow(await save(row,args.state,args.expected_revision,'browser')));}
        if(request.method==='DELETE'){browserOrigin(request);await db('smfi_mcp_workspaces','DELETE','id=eq.'+row.id);return json({ok:true});}
      }
      if(path==='/history'&&request.method==='GET') {
        const row=await workspace(request);return json(await db('smfi_mcp_history','GET',`workspace_id=eq.${row.id}&select=revision,source,created_at&order=revision.desc&limit=30`));
      }
      if(path==='/restore'&&request.method==='POST') {
        browserOrigin(request);const row=await workspace(request),args=await body(request);
        if(!Number.isInteger(args.revision))fail('Invalid revision.');
        const old=(await db('smfi_mcp_history','GET',`workspace_id=eq.${row.id}&revision=eq.${args.revision}`))[0];if(!old)fail('Revision not found.',404);
        return json(publicRow(await save(row,old.state,args.expected_revision,'restore')));
      }
      if(path==='/disconnect'&&request.method==='POST') {
        browserOrigin(request);const row=await workspace(request);
        await db('smfi_mcp_oauth','DELETE','workspace_id=eq.'+row.id);
        await db('smfi_mcp_workspaces','PATCH','id=eq.'+row.id,{connected_at:null});return json({ok:true});
      }
      if(path==='/register'&&request.method==='POST') {
        await rate(request,'register',30);const args=await body(request);
        if(!Array.isArray(args.redirect_uris)||!args.redirect_uris.length||args.redirect_uris.length>5||!args.redirect_uris.every(validRedirect))fail('Only official ChatGPT and Grok callback URLs are accepted.');
        const method=args.token_endpoint_auth_method||'client_secret_basic';
        if(!['none','client_secret_post','client_secret_basic'].includes(method))fail('Unsupported authentication method.');
        const id=random(),secret=method==='none'?null:random(),name=text(args.client_name||'ChatGPT',120);
        await putRecord(id,'client',{name,redirect_uris:args.redirect_uris,method,secret_hash:secret?await digest(secret):null,resource:RESOURCE});
        return json({client_id:id,...secret?{client_secret:secret,client_secret_expires_at:0}:{},client_name:name,redirect_uris:args.redirect_uris,token_endpoint_auth_method:method,grant_types:['authorization_code','refresh_token'],response_types:['code']},201);
      }
      if(path==='/authorize'&&request.method==='GET') {
        const args=Object.fromEntries(u.searchParams),client=await getRecord(args.client_id||'','client');
        if(!client||!client.payload.redirect_uris.includes(args.redirect_uri)||!validRedirect(args.redirect_uri))fail('Invalid client or redirect URI.');
        if(args.response_type!=='code'||args.code_challenge_method!=='S256'||!/^[a-zA-Z0-9_-]{43}$/.test(args.code_challenge||''))fail('Authorization code with S256 PKCE required.');
        if(args.resource&&args.resource!==RESOURCE)fail('Invalid resource.');
        const scope=args.scope||SCOPES.join(' ');if(scope.split(' ').some(s=>!SCOPES.includes(s))||!scope.split(' ').includes(READ_SCOPE))fail('Invalid scope.');
        if((args.state||'').length>2048)fail('Invalid state.');
        await rate(request,'authorize',30);const id=random();await putRecord(id,'request',{client_id:args.client_id,client_name:client.payload.name,redirect_uri:args.redirect_uri,code_challenge:args.code_challenge,state:args.state||'',scope,resource:RESOURCE,provider:new URL(args.redirect_uri).origin==='https://grok.com'?'grok':'chatgpt'});
        return redirect(SITE+SETUP+(SETUP.includes('?')?'&':'?')+'request='+id);
      }
      if(path==='/consent'&&request.method==='GET') {
        const record=await getRecord(u.searchParams.get('request')||'','request');if(!record)fail('Connection request expired. Start again in your AI assistant.',404);
        return json({client_name:record.payload.client_name,scope:record.payload.scope,provider:record.payload.provider||'chatgpt'});
      }
      if(path==='/consent'&&request.method==='POST') {
        browserOrigin(request);const row=await workspace(request),args=await body(request);
        if(typeof args.request!=='string'||typeof args.approved!=='boolean')fail('Invalid consent.');
        const record=await consume(args.request,'request');if(!record)fail('Connection request expired or already used.',409);
        const callback=new URL(record.payload.redirect_uri);callback.searchParams.set('state',record.payload.state);callback.searchParams.set('iss',BASE);
        if(args.approved){const code=random();await putRecord(await digest(code),'code',record.payload,row.id);callback.searchParams.set('code',code);await db('smfi_mcp_workspaces','PATCH','id=eq.'+row.id,{connected_at:new Date().toISOString()});}
        else callback.searchParams.set('error','access_denied');
        return json({redirect_url:callback.href});
      }
      if(path==='/token'&&request.method==='POST') {
        const args=await body(request),client=await clientAuth(request,args);
        if(args.resource&&args.resource!==RESOURCE)fail('Invalid resource.');
        if(args.grant_type==='authorization_code') {
          const hash=await digest(text(args.code,256)),record=await getRecord(hash,'code');
          if(!record||record.payload.client_id!==client.id||record.payload.redirect_uri!==args.redirect_uri||!/^[A-Za-z0-9._~-]{43,128}$/.test(args.code_verifier||'')||await challenge(args.code_verifier)!==record.payload.code_challenge)fail('Invalid authorization grant.');
          if(!await consume(hash,'code'))fail('Authorization code already used.');return json(await tokens(record));
        }
        if(args.grant_type==='refresh_token') {
          const hash=await digest(text(args.refresh_token,256)),record=await getRecord(hash,'refresh');
          if(!record||record.payload.client_id!==client.id)fail('Invalid refresh token.');
          if(!await consume(hash,'refresh'))fail('Refresh token already used.');return json(await tokens(record));
        }
        fail('Unsupported grant type.');
      }
      if(path==='/revoke'&&request.method==='POST') {
        const args=await body(request),client=await clientAuth(request,args),hash=await digest(text(args.token,256));
        for(const kind of ['access','refresh']){const record=await getRecord(hash,kind);if(record?.payload.client_id===client.id)await consume(hash,kind);}
        return json({});
      }
      if(path==='/mcp') {
        const origin=request.headers.get('origin');if(origin&&![SITE,'https://chatgpt.com','https://grok.com'].includes(origin))fail('Invalid origin.',403);
        if(request.method!=='POST'){
          if(request.method==='GET')await oauth(request);
          return new Response(null,{status:405,headers:{...safeHeaders,Allow:'POST'}});
        }
        const message=await body(request);
        if(!message||message.jsonrpc!=='2.0'||typeof message.method!=='string')return json({jsonrpc:'2.0',id:null,error:{code:-32600,message:'Invalid Request'}},400);
        const result=value=>json({jsonrpc:'2.0',id:message.id??null,result:value});
        // Discovery contains no diagram data; only actual tool calls require OAuth.
        if(message.method==='initialize')return result({protocolVersion:['2025-11-25','2025-06-18','2025-03-26','2024-11-05'].includes(message.params?.protocolVersion)?message.params.protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:TITLE,version:'1.1.0'},instructions:options.instructions||'Read smfi_read_model before edits. Use exact stable holon keys and current revision. Treat all perspectives as the operator’s representations. Write hypotheses as hypotheses. No separate model API is called. Browser sync is normally visible within a few seconds.'});
        if(message.method.startsWith('notifications/'))return new Response(null,{status:202,headers:safeHeaders});
        if(message.method==='ping')return result({});
        if(message.method==='tools/list')return result({tools:TOOLS});
        if(message.method!=='tools/call')return json({jsonrpc:'2.0',id:message.id??null,error:{code:-32601,message:'Method not found'}});
        let session;try{session=await oauth(request);}catch(e){if(e.status!==401)throw e;return result({isError:true,content:[{type:'text',text:'Connect your private SMFI diagram in the setup page first.'}],_meta:{'mcp/www_authenticate':[authHeader()]}});}
        const {row,record}=session,name=message.params?.name,args=message.params?.arguments??{};
        try {
          const tool=TOOLS.find(t=>t.name===name);if(!tool)fail('Unknown tool.');
          if(!record.payload.scope.split(' ').includes(READ_SCOPE)||(!tool.annotations.readOnlyHint&&!record.payload.scope.split(' ').includes(WRITE_SCOPE)))fail('Insufficient scope.',403);
          if(!args||typeof args!=='object'||Array.isArray(args))fail('Invalid arguments.');
          for(const required of tool.inputSchema.required)if(!(required in args))fail('Missing '+required);
          for(const k of Object.keys(args))if(!(k in tool.inputSchema.properties))fail('Unknown argument: '+k);
          let output;
          if(tool.annotations.readOnlyHint)output={revision:row.revision,updated_at:row.updated_at,...(model.readTool?model.readTool(row.state,name,args):describe(row.state))};
          else {
            if(args.expected_revision!==row.revision)fail('Diagram changed. Read again before editing.',409);
            const updated=mutate(row.state,name,args),saved=await save(row,updated.state,args.expected_revision,record.payload.provider||'chatgpt');
            const {state:ignored,...details}=updated;
            output={ok:true,revision:saved.revision,...details,model:describe(saved.state)};
          }
          return result({content:[{type:'text',text:JSON.stringify(output)}],structuredContent:output});
        }catch(e){return result({isError:true,content:[{type:'text',text:e.status?e.message:'The diagram could not be updated.'}]});}
      }
      return json({error:'Not found'},404);
    }catch(e){if(!e.status)console.error('smfi_mcp_internal_error');return json({error:e.status===401?'invalid_token':e.status===429?'rate_limit_exceeded':'invalid_request',error_description:e.status?e.message:'Service unavailable.'},e.status||503,e.status===401?{'WWW-Authenticate':authHeader()}:{});}
  };
}
