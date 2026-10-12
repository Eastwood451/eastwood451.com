const $=id=>document.getElementById(id),API='/api/smfi',KEY='smfi-chatgpt-connection-v1';
const requestId=new URL(location.href).searchParams.get('request');
let connection,row;
const note=message=>{$('status').textContent=message;};
async function api(path,method='GET',data){
 const response=await fetch(API+path,{method,cache:'no-store',headers:{'Content-Type':'application/json',...connection?{Authorization:'Bearer '+connection.owner_token}:{}},body:data===undefined?undefined:JSON.stringify(data)});
 const value=await response.json();if(!response.ok)throw new Error(value.error_description||'Forbindelsen kunne ikke åbnes.');return value;
}
async function consent(approved){
 $('approve').disabled=$('deny').disabled=true;
 try{const result=await api('/consent','POST',{request:requestId,approved});const url=new URL(result.redirect_url);if(url.origin!=='https://chatgpt.com')throw new Error('Uventet returadresse.');location.assign(url.href);}
 catch(e){note(e.message);$('approve').disabled=$('deny').disabled=false;}
}
$('approve').onclick=()=>consent(true);$('deny').onclick=()=>consent(false);
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('url').textContent);$('copy').textContent='Kopieret';}catch{note('Markér og kopiér serveradressen ovenfor.');}};
$('disconnect').onclick=async()=>{try{await api('/disconnect','POST',{});note('ChatGPT-adgangen er afbrudt. Diagrammet er bevaret.');}catch(e){note(e.message);}};
$('restore').onclick=async()=>{
 if(!$('history').value)return;
 if(!confirm('Gendan den valgte version? Den nuværende version bevares i historikken. Luk mapper-fanen først.'))return;
 try{row=await api('/workspace');const restored=await api('/restore','POST',{revision:Number($('history').value),expected_revision:row.revision});localStorage.removeItem('smfi-chatgpt-cache-v1');note('Version gendannet. Åbn Nested Actor Mapper igen.');await loadHistory();}catch(e){note(e.message);}
};
async function loadHistory(){const history=await api('/history');$('history').replaceChildren(...history.map(h=>{const o=document.createElement('option');o.value=h.revision;o.textContent='Version '+h.revision+' · '+h.source+' · '+new Date(h.created_at).toLocaleString('da-DK');return o;}));$('restore').disabled=!history.length;}
async function start(){
 try{
  connection=JSON.parse(localStorage.getItem(KEY)||'null');
  if(!connection){$('missing').hidden=false;note('Intet diagram er valgt i denne browser.');return;}
  row=await api('/workspace');
  if(requestId){const detail=await api('/consent?request='+encodeURIComponent(requestId));$('client').textContent=detail.client_name;$('diagram').textContent=row.label;$('permissions').textContent=detail.scope.split(' ').includes('smfi:write')?'ChatGPT kan læse diagrammet, skrive noter, oprette aktører og oprette eller flytte brugerdefinerede holoner.':'ChatGPT kan læse diagrammet.';$('consent').hidden=false;note('Dit diagram er klar.');}
  else{$('setup').hidden=false;note(row.connected?'ChatGPT er forbundet til '+row.label:row.label+' er klar til at blive forbundet.');await loadHistory();}
 }catch(e){note(e.message);}
}
start();
