import {connectDiagram} from './chatgpt-sync.js?v=2';
let started=false;
function start(){
  if(started||!window.smfiBeliefDiagram)return;
  const mount=document.getElementById('beliefChatGPTMount');if(!mount)return;
  started=true;
  connectDiagram({adapter:window.smfiBeliefDiagram,mount,API:'/api/smfi/belief',KEY:'smfi-belief-connection-v1',CACHE:'smfi-belief-cache-v1',SETUP:'/SMFI_Suite/chatgpt.html?kind=belief',label:()=> 'Belief Map · mine argumentkort'});
}
window.addEventListener('smfi-belief-ready',start);
start();
