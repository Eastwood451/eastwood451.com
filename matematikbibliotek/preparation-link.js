export function preparationLink(item){
 const location=item.locations?.find(l=>l.status==='verified'&&/^[A-Za-z0-9_-]{10,200}$/.test(l.drive_id));
 if(!location)return null;
 const url=new URL('https://jacob-forberedelse.eastwood451.chatgpt.site/materiale');
 url.searchParams.set('title',String(item.title||'Materiale').replace(/[_\r\n]+/g,' ').slice(0,300));
 url.searchParams.set('drive',location.drive_id);
 if(Number.isInteger(item.number)&&item.number>0&&item.number<1000000)url.searchParams.set('page',String(item.number));
 return url.href;
}
