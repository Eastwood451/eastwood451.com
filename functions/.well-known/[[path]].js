// OAuth discovery uses the issuer's path suffix (RFC 8414 / RFC 9728).
export async function onRequestGet({request}) {
  const path=new URL(request.url).pathname;
  const belief=path==='/.well-known/oauth-protected-resource/api/smfi/belief/mcp'||path==='/.well-known/oauth-authorization-server/api/smfi/belief';
  const resource=['/.well-known/oauth-protected-resource/api/smfi/belief/mcp','/.well-known/oauth-protected-resource/api/smfi/mcp','/.well-known/oauth-protected-resource'].includes(path);
  const auth=['/.well-known/oauth-authorization-server/api/smfi/belief','/.well-known/oauth-authorization-server/api/smfi','/.well-known/oauth-authorization-server'].includes(path);
  if(!resource&&!auth)return new Response('Not found',{status:404});
  const response=await fetch('https://wpriingzftsboauvkmsj.supabase.co/functions/v1/'+(belief?'belief-mcp':'smfi-mcp')+'/'+(resource?'resource-metadata':'oauth-metadata'));
  return new Response(response.body,{status:response.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
}
