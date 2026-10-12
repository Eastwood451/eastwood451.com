const UPSTREAM='https://wpriingzftsboauvkmsj.supabase.co/functions/v1/smfi-mcp';
export async function onRequest({request}) {
  const url=new URL(request.url);
  const headers=new Headers();
  for(const name of ['authorization','content-type','accept','origin','mcp-protocol-version','cf-connecting-ip']) {
    const value=request.headers.get(name);if(value)headers.set(name,value);
  }
  const response=await fetch(UPSTREAM+url.pathname.slice('/api/smfi'.length)+url.search,{method:request.method,headers,body:['GET','HEAD'].includes(request.method)?undefined:request.body,redirect:'manual'});
  const out=new Headers(response.headers);out.set('Cache-Control','no-store');out.set('Referrer-Policy','no-referrer');
  return new Response(response.body,{status:response.status,headers:out});
}
