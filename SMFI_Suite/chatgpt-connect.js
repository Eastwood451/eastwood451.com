const $=id=>document.getElementById(id),params=new URL(location.href).searchParams;
const belief=params.get('kind')==='belief',API='/api/smfi'+(belief?'/belief':''),KEY=belief?'smfi-belief-connection-v1':'smfi-chatgpt-connection-v1',CACHE=belief?'smfi-belief-cache-v1':'smfi-chatgpt-cache-v1';
const requestId=params.get('request'),APP=belief?'Belief Map':'Nested Actor Mapper';
$('url').textContent=location.origin+API+'/mcp';$('name').textContent=belief?'SMFI Belief Map':'SMFI Nested Actor';
$('app-name').textContent=APP;$('back').textContent='← '+APP;$('open-app').textContent='Åbn '+APP;
if(belief){
 $('back').href=$('open-app').href='../Belief-map%20-%20Antigravity/Argument-mapper%20-%20codex/';
 $('lead').textContent='Arbejd med dine argumentkort i ChatGPT eller Grok, og se noder og relationer i Belief Map.';
 $('example').textContent='Læs mine Belief Maps, og åbn det kort vi skal arbejde med.';
}

let connection,row;
const note=message=>{$('status').textContent=message;};
async function api(path,method='GET',data){
 const response=await fetch(API+path,{method,cache:'no-store',headers:{'Content-Type':'application/json',...connection?{Authorization:'Bearer '+connection.owner_token}:{}},body:data===undefined?undefined:JSON.stringify(data)});
 const value=await response.json();if(!response.ok)throw new Error(value.error_description||'Forbindelsen kunne ikke åbnes.');return value;
}
async function consent(approved){
 $('approve').disabled=$('deny').disabled=true;
 try{const result=await api('/consent','POST',{request:requestId,approved});const url=new URL(result.redirect_url);if(!['https://chatgpt.com','https://grok.com'].includes(url.origin))throw new Error('Uventet returadresse.');location.assign(url.href);}
 catch(e){note(e.message);$('approve').disabled=$('deny').disabled=false;}
}
$('approve').onclick=()=>consent(true);$('deny').onclick=()=>consent(false);
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('url').textContent);$('copy').textContent='Kopieret';}catch{note('Markér og kopiér serveradressen ovenfor.');}};
$('disconnect').onclick=async()=>{try{await api('/disconnect','POST',{});note('AI-adgangen er afbrudt. Diagrammet er bevaret.');}catch(e){note(e.message);}};
$('restore').onclick=async()=>{
 if(!$('history').value)return;
 if(!confirm('Gendan den valgte version? Den nuværende version bevares i historikken. Luk mapper-fanen først.'))return;
 try{row=await api('/workspace');const restored=await api('/restore','POST',{revision:Number($('history').value),expected_revision:row.revision});localStorage.removeItem(CACHE);note('Version gendannet. Åbn '+APP+' igen.');await loadHistory();}catch(e){note(e.message);}
};
async function loadHistory(){const history=await api('/history');$('history').replaceChildren(...history.map(h=>{const o=document.createElement('option');o.value=h.revision;o.textContent='Version '+h.revision+' · '+h.source+' · '+new Date(h.created_at).toLocaleString('da-DK');return o;}));$('restore').disabled=!history.length;}
async function start(){
 try{
  connection=JSON.parse(localStorage.getItem(KEY)||'null');
  if(!connection){$('missing').hidden=false;note('Intet diagram er valgt i denne browser.');return;}
  row=await api('/workspace');
  if(requestId){const detail=await api('/consent?request='+encodeURIComponent(requestId));$('client').textContent=(detail.provider==='grok'?'Grok':'ChatGPT')+' · '+detail.client_name;$('diagram').textContent=row.label;$('permissions').textContent=detail.scope.split(' ').includes(belief?'belief:write':'smfi:write')?(belief?'Din AI kan læse dine gemte kort og redigere noder, relationer, noter og tidslinjetrin.':'Din AI kan læse diagrammet, skrive noter, oprette aktører og oprette eller flytte brugerdefinerede holoner.'):'Din AI kan læse diagrammet.';$('consent').hidden=false;note('Dit diagram er klar.');}
  else{$('setup').hidden=false;note(row.connected?'AI-adgang er godkendt til '+row.label:row.label+' er klar til at blive forbundet.');await loadHistory();}
 }catch(e){note(e.message);}
}
start();

$('grok-client').onclick=async()=>{
 $('grok-client').disabled=true;
 try{
  // Public PKCE client: the ID confers no access without owner consent.
  const key='smfi-grok-client-'+(belief?'belief':'nested')+'-v1';
  let client=JSON.parse(localStorage.getItem(key)||'null');
  if(!client||Date.now()-client.created_at>300*86400000){
   client=await api('/register','POST',{client_name:'Grok',redirect_uris:['https://grok.com/connectors-oauth-exchange-code/'],token_endpoint_auth_method:'none'});
   client.created_at=Date.now();localStorage.setItem(key,JSON.stringify(client));
  }
  $('grok-id').textContent=client.client_id;$('grok-authorize').textContent=location.origin+API+'/authorize';
  $('grok-token').textContent=location.origin+API+'/token';$('grok-scopes').textContent=(belief?'belief:read belief:write':'smfi:read smfi:write')+' offline_access';
  $('grok-config').hidden=false;
 }catch(e){note(e.message);}finally{$('grok-client').disabled=false;}
};
