import {makeCards,missingSide,answerFor,grade,pickCard,heatColor,hardestCards,ANSWER_MODES,ANSWER_TIMEOUT_MS} from './engine.js?v=20260918-0640';
import {freshProfile,restoreProfile} from './storage.js?v=20260918-0640';
import {initialize,enqueue,onUpdate} from './cloud.js?v=20260918-0640';
import {needsAnswerHelp,numberLineExample,numberLineQuestion} from './number-line.js?v=20260918-0640';
const $=id=>document.getElementById(id),MODE_LABELS={nw:'NV',ne:'NØ',south:'Nederst',all:'Alle',distance:'Afstand'};
const initial=await initialize().catch(error=>{
  $('login-loading').hidden=false;
  $('login-loading').textContent='Appen kunne ikke hente dine fremskridt. Tillad lokal lagring i browseren, og genindlæs siden.';
  throw error;
});
let autoContinue=initial.preferences?.autoContinue===true;
const CIRCLE_VIEWS=['circle','calculation','both'];
let circleView=CIRCLE_VIEWS.includes(initial.preferences?.circleView)?initial.preferences.circleView:'circle';
const profiles=Object.fromEntries(ANSWER_MODES.map(mode=>[mode,restoreProfile(initial[mode])]));
let answerMode=ANSWER_MODES.includes(initial.preferences?.answerMode)?initial.preferences.answerMode:'all';
let {cards,round,lastId}=profiles[answerMode];
let focusIds=null;
let current=null,side='nw',phase='idle',startedAt=0,frame=0,scheduled=0,answerTimer=0,token=0;
function save(operation){
  profiles[answerMode]={cards,round,lastId};
  if(operation)enqueue({...operation,mode:answerMode});
}
function lockKeys(locked){document.querySelectorAll('#keypad button').forEach(b=>b.disabled=locked)}
for(const n of [1,2,3,4,5,6,7,8,9,0]){const b=document.createElement('button');b.textContent=n;b.type='button';b.disabled=true;b.setAttribute('aria-label',`Svar ${n}`);b.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();submit(n)});b.addEventListener('click',e=>{if(e.detail===0)submit(n)});$('keypad').append(b)}
function trainingCards(){return focusIds?cards.filter(c=>focusIds.includes(c.id)):cards;}
function renderFocus(){
  const available=hardestCards(cards);
  $('hardest').textContent=focusIds?'Træn alle par':'Træn de 4 sværeste';
  $('hardest').setAttribute('aria-pressed',String(Boolean(focusIds)));
  $('hardest').disabled=!focusIds&&!available.length;
  $('focus-note').textContent=focusIds
    ?`${focusIds.length} svære par · ${MODE_LABELS[answerMode]}`
    :available.length?'Vælger øvede par med længst seneste svartid.':'Øv nogle par først. Kun par, der ikke er lært, vælges.';
}
function finishTraining(){
  phase='done';$('pause').disabled=true;progress();
  if(focusIds)overlay('De svære par er lært!',`Du har lært alle ${focusIds.length} par i denne gruppe.`,'Træn alle par','all');
  else overlay('Alle 45 er lært!',`Du har nået målet i ${MODE_LABELS[answerMode]}.`,'Træn forfra','reset');
}
function toggleFocus(){
  const selected=focusIds?null:hardestCards(cards).map(c=>c.id);
  if(selected&&!selected.length)return;
  cancel();focusIds=selected;current=null;progress();
  if(trainingCards().some(c=>c.hits<3))begin();else showReady();
}
$('hardest').addEventListener('click',toggleFocus);
function progress(){
  renderFocus();
  renderCircleView();
  $('progress-title').textContent='Din fremgang · '+MODE_LABELS[answerMode];
  $('heatmap-mode').textContent=MODE_LABELS[answerMode];
  $('practice-title').textContent=answerMode==='distance'?'FIND AFSTANDEN':'FIND DET MANGLENDE CIFFER';
  $('notation').innerHTML=answerMode==='distance'?'Svar med <b>afstanden</b> mellem de to markerede tal.':'<b>?7</b> betyder et tal, der ender på 7. Feltet med blå ramme er dit svar.';
  $('pairs-note').textContent=answerMode==='distance'?'Alle opgaver går over 80. Farven viser den seneste svartid.':'Kun par, hvor første enerciffer er mindre end det andet.';
  const learned=cards.filter(c=>c.hits===3).length;
  $('learned-count').textContent=learned;$('learning-count').textContent=45-learned;
  $('percent').textContent=Math.round(learned/45*100)+' %';$('overall-progress').value=learned;
  $('pairs').replaceChildren(...cards.map(c=>{
    const el=document.createElement('div'),heat=heatColor(c.lastMs);
    el.className='pair'+(focusIds?.includes(c.id)?' focused':'')+(current?.id===c.id&&phase!=='idle'?' active':'');
    const start=80+c.a,end=start-c.b;
    el.textContent=answerMode==='distance'?`${end}↔${start}`:`${c.a}−${c.b}`;
    if(heat){el.style.backgroundColor=heat.background;el.style.color=heat.foreground;el.style.borderColor=heat.background;}
    const timing=heat?`Seneste svar: ${(c.lastMs/1000).toFixed(2).replace('.',',')} sek.`:'Ikke øvet';
    el.title=answerMode==='distance'?`Afstand mellem ${end} og ${start} · ${timing} · ${c.hits}/3 hurtige svar${c.hits===3?' · Lært':''}`:`?${c.a} − ?${c.b} = ?${c.c} · ${timing} · ${c.hits}/3 hurtige svar${c.hits===3?' · Lært':''}`;
    el.setAttribute('aria-label',el.title);
    return el;
  }));
}
function cell(digit,blank,reveal=false){return blank?`<span class="prefix">?</span><span class="missing">${reveal?digit:'?'}</span>`:`<span class="prefix">?</span>${digit}`}
function equationCell(digit,blank,reveal=false){const value=blank?(reveal?digit:'?'):digit;return `<span class="equation-digit prefix">?</span><span class="equation-digit${blank?' equation-missing':''}">${value}</span>`}
function renderCircleView(){
  const circleTask=answerMode!=='distance';
  $('circle-view-row').hidden=!circleTask;$('circle-layout').hidden=!circleTask;
  if(!circleTask)return;
  $('circle-layout').className=`circle-layout view-${circleView}`;
  $('circle').hidden=circleView==='calculation';$('vertical-equation').hidden=circleView==='circle';
  document.querySelectorAll('[data-circle-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.circleView===circleView)));
}
function renderEquation(reveal=false){
  $('equation-top').innerHTML=equationCell(current.a,side==='nw',reveal);
  $('equation-bottom').innerHTML=equationCell(current.b,side==='ne',reveal);
  $('equation-result').innerHTML=equationCell(current.c,side==='south',reveal);
  $('vertical-equation').setAttribute('aria-label',`Lodret regnestykke: ${side==='nw'&&!reveal?'manglende enerciffer':current.a} i første tal, minus ${side==='ne'&&!reveal?'manglende enerciffer':current.b} i andet tal, giver ${side==='south'&&!reveal?'manglende enerciffer':current.c} i resultatet.`);
}
function renderQuestion(reveal=false){
  $('question-progress').textContent=`Dette par: ${current.hits} af 3 hurtige svar`;
  if(side==='distance'){
    const graphic=reveal?numberLineExample(current):numberLineQuestion(current);
    renderCircleView();
    $('distance-question').hidden=false;
    $('distance-question').className='distance-question';
    $('distance-prompt').textContent=reveal?`Afstanden er ${graphic.distance}.`:'Hvad er afstanden?';
    $('distance-line').innerHTML=graphic.svg;
    $('distance-question').setAttribute('aria-label',reveal?`Afstanden mellem ${graphic.end} og ${graphic.start} er ${graphic.distance}.`:`Hvad er afstanden mellem ${graphic.end} og ${graphic.start}?`);
    return;
  }
  $('distance-question').hidden=true;renderCircleView();
  $('nw').innerHTML=cell(current.a,side==='nw',reveal);$('ne').innerHTML=cell(current.b,side==='ne',reveal);$('south').innerHTML=cell(current.c,side==='south',reveal);renderEquation(reveal);
  $('circle').setAttribute('aria-label',`${side==='nw'&&!reveal?'Manglende ciffer':current.a+' og noget'} minus ${side==='ne'&&!reveal?'manglende ciffer':current.b+' og noget'} giver ${side==='south'&&!reveal?'et manglende ciffer':current.c+' og noget eller '+current.c}.`);
}
function cancel(){token++;clearTimeout(scheduled);clearTimeout(answerTimer);cancelAnimationFrame(frame);lockKeys(true);$('answer-help').hidden=true;$('keypad').hidden=false;}
function overlay(title,copy,label,mode){$('overlay').hidden=false;$('overlay').innerHTML=`<span class="eyebrow">TRE-OG-NOGET</span><h2>${title}</h2><p>${copy}</p><button class="primary" id="resume">${label}</button>`;$('resume').addEventListener('click',mode==='reset'?askReset:mode==='all'?toggleFocus:begin)}
function nextQuestion(){cancel();$('next').hidden=true;$('circle').className='circle';$('vertical-equation').className='vertical-equation';$('distance-question').className='distance-question';current=pickCard(trainingCards(),lastId);if(!current){finishTraining();return}lastId=current.id;side=missingSide(current,answerMode);phase='preparing';$('overlay').hidden=true;renderQuestion();progress();$('feedback').textContent={nw:'Find cifret øverst til venstre.',ne:'Find cifret øverst til højre.',south:'Find cifret i nederste halvdel.',distance:'Indtast afstanden mellem de to markerede tal.'}[side];$('feedback').className='feedback';const ticket=token;frame=requestAnimationFrame(()=>{if(ticket!==token)return;startedAt=performance.now();phase='asking';lockKeys(false);expireQuestion(ticket)});}
// Re-check elapsed time in case a timer fires early; the token rejects stale questions.
function expireQuestion(ticket){
  if(ticket!==token||phase!=='asking')return;
  const remaining=ANSWER_TIMEOUT_MS-(performance.now()-startedAt);
  if(remaining>0){answerTimer=setTimeout(()=>expireQuestion(ticket),remaining);return;}
  submit(null);
}
function begin(){if(document.hidden)return;cancel();phase='countdown';$('pause').disabled=false;$('pause').textContent='Pause';$('next').hidden=true;let count=3;$('overlay').hidden=false;const ticket=token;function countDown(){if(ticket!==token)return;if(count===0){nextQuestion();return}$('overlay').innerHTML=`<span class="eyebrow">GØR DIG KLAR</span><h2 style="font-size:5rem">${count--}</h2><p>Ét tryk er dit svar.</p>`;scheduled=setTimeout(countDown,650)}countDown()}
function renderAutoContinue(){
  $('auto-continue').setAttribute('aria-checked',String(autoContinue));
  $('auto-state').textContent=autoContinue?'Til':'Fra';
}
function scheduleHelpAdvance(){
  clearTimeout(scheduled);
  if(phase!=='review'||!autoContinue)return;
  const ticket=token;
  scheduled=setTimeout(()=>{if(ticket===token&&phase==='review'&&!document.hidden)nextQuestion();},4000);
}
function showAnswerHelp(){
  const example=numberLineExample(current);
  phase='review';
  if(side==='distance'){
    $('distance-question').hidden=false;$('circle').hidden=true;
    $('distance-prompt').textContent=`Afstanden er ${example.distance}.`;
    $('distance-line').innerHTML=example.svg;
    $('distance-question').setAttribute('aria-label',`Afstanden mellem ${example.end} og ${example.start} er ${example.distance}. ${example.explanation}`);
    $('answer-help').hidden=true;
  }else{
    $('help-equation').textContent=example.equation;
    $('help-line').innerHTML=example.svg;
    $('help-explanation').textContent=`Fra ${example.start} går du ${example.distance} tilbage til ${example.end}. Rektanglet viser ${example.distance}.`;
    $('answer-help').hidden=false;
  }
  $('keypad').hidden=true;$('next').hidden=false;
  scheduleHelpAdvance();
}
function submit(n){
  if(phase!=='asking'||document.hidden)return;
  const elapsed=performance.now()-startedAt;
  // Enforce the deadline even when an input event runs before a delayed timer.
  const timedOut=elapsed>=ANSWER_TIMEOUT_MS;
  const value=timedOut?null:n,ms=timedOut?ANSWER_TIMEOUT_MS:elapsed;
  phase='feedback';clearTimeout(answerTimer);cancelAnimationFrame(frame);lockKeys(true);round++;
  const result=grade(current,side,value,ms,round);
  cards=cards.map(c=>c.id===current.id?result.card:c);current=result.card;
  save({kind:'answer',card:current.id,side,value,ms,...(timedOut?{timedOut:true}:{})});const showWorked=side!=='distance'||!result.correct||ms>4000;renderQuestion(showWorked);progress();
  const resultClass=result.correct?'correct':'wrong';
  if(side==='distance')$('distance-question').classList.add(resultClass);else{$('circle').classList.add(resultClass);$('vertical-equation').classList.add(resultClass);}
  $('feedback').className='feedback '+(result.correct?'good':'bad');
  if(timedOut){
    $('feedback').textContent=side==='distance'?`Tiden er gået (5 sek.). Den rigtige afstand er ${answerFor(current,side)}.`:`Tiden er gået (5 sek.). Det rigtige ciffer er ${answerFor(current,side)}.`;
  }else if(result.correct){
    $('feedback').textContent=current.hits===3?'✓ Flyttet til Lært!':result.fast?`✓ Hurtigt! ${current.hits} af 3.`:ms>4000?'✓ Korrekt. Se eksemplet på tallinjen.':'✓ Korrekt. Prøv at komme ned på ét sekund.';
  }else{
    $('feedback').textContent=side==='distance'?`Du svarede ${n}. Den rigtige afstand er ${answerFor(current,side)}.`:`Du svarede ${n}. Det rigtige ciffer er ${answerFor(current,side)}.`;
  }
  if(needsAnswerHelp(result.correct,ms))showAnswerHelp();
  else scheduled=setTimeout(nextQuestion,300);
}

function pause(){if(phase==='idle'||phase==='done'||phase==='paused')return;cancel();phase='paused';$('next').hidden=true;$('pause').disabled=true;overlay('Pause','Din fremgang er gemt.','Fortsæt træning');}
function askReset(){pause();$('reset-copy').textContent=`Alle 45 par i ${MODE_LABELS[answerMode]} flyttes tilbage til øvebunken. De fire andre valg bevares.`;$('reset-dialog').showModal()}
$('pause').addEventListener('click',pause);$('next').addEventListener('click',nextQuestion);$('reset').addEventListener('click',askReset);$('cancel-reset').addEventListener('click',()=>$('reset-dialog').close());$('confirm-reset').addEventListener('click',()=>{cancel();focusIds=null;({cards,round,lastId}=freshProfile());current=null;save({kind:'reset',data:{cards,round,lastId}});$('reset-dialog').close();progress();begin()});
document.addEventListener('keydown',e=>{
  if($('reset-dialog').open)return;
  if(e.key==='Escape'){pause();return}
  if(e.repeat||e.ctrlKey||e.altKey||e.metaKey)return;
  if((e.code==='Space'||e.key===' ')&&phase==='review'&&!$('next').hidden){
    e.preventDefault();
    nextQuestion();
    return;
  }
  if(/^[0-9]$/.test(e.key)&&phase==='asking'){e.preventDefault();submit(Number(e.key))}
});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});

function renderModes(){
  document.querySelectorAll('[data-answer-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.answerMode===answerMode)));
}
function showReady(){
  $('pause').disabled=true;$('next').hidden=true;$('circle').className='circle';$('vertical-equation').className='vertical-equation';$('distance-question').className='distance-question';
  if(answerMode==='distance'){
    const preview=numberLineQuestion({a:2,b:4});
    $('circle-layout').hidden=true;$('circle-view-row').hidden=true;$('distance-question').hidden=false;$('distance-prompt').textContent='Hvad er afstanden?';$('distance-line').innerHTML=preview.svg;
  }else{
    $('distance-question').hidden=true;renderCircleView();
  }
  $('question-progress').textContent='Tre hurtige, korrekte svar pr. par';
  $('feedback').textContent='Klar, når du er.';$('feedback').className='feedback';
  if(trainingCards().every(c=>c.hits===3)){
    finishTraining();
  }else{
    phase='idle';
    const circleCopy={circle:'Find det manglende ciffer i cirklen.',calculation:'Find det manglende ciffer i det lodrette regnestykke.',both:'Find det manglende ciffer. Du ser både cirklen og det lodrette regnestykke.'}[circleView];
    const copy=answerMode==='distance'?'Find afstanden mellem de to markerede tal på tallinjen.':circleCopy;
    overlay(`Træn ${MODE_LABELS[answerMode]}`,copy,cards.some(c=>c.attempts>0)?'Fortsæt træning':'Start træning');
  }
}
function chooseMode(mode){
  if(!ANSWER_MODES.includes(mode))throw new Error('Ugyldigt svarfelt');
  if(mode===answerMode)return;
  const wasRunning=['asking','preparing','feedback','review','countdown'].includes(phase);
  cancel();save();
  focusIds=null;answerMode=mode;({cards,round,lastId}=profiles[answerMode]);current=null;
  save();enqueue({kind:'preferences',mode:'preferences',data:{answerMode}});renderModes();progress();
  if(wasRunning&&cards.some(c=>c.hits<3))begin();else showReady();
}
function chooseCircleView(view){
  if(!CIRCLE_VIEWS.includes(view))throw new Error('Ugyldig cirkelvisning');
  if(view===circleView)return;
  circleView=view;renderCircleView();enqueue({kind:'preferences',mode:'preferences',data:{circleView}});
}
document.querySelectorAll('[data-answer-mode]').forEach(button=>button.addEventListener('click',()=>chooseMode(button.dataset.answerMode)));
document.querySelectorAll('[data-circle-view]').forEach(button=>button.addEventListener('click',()=>chooseCircleView(button.dataset.circleView)));
renderModes();renderCircleView();

progress();showReady();
const context=document.modelContext;if(context?.registerTool){const lifecycle=new AbortController();try{Promise.resolve(context.registerTool({name:'read_training_progress',title:'Læs træningsfremgang',description:'Læs antal lærte par og hurtige svar uden at ændre træningen.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(input){if(input&&Object.keys(input).length)throw new Error('Ingen parametre forventes');return{answerMode,total:45,learned:cards.filter(c=>c.hits===3).length,phase,pairs:cards.map(c=>({pair:c.id,fastCorrect:c.hits,attempts:c.attempts}))}}},{signal:lifecycle.signal})).catch(()=>{})}catch{}window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true})}

onUpdate(state=>{
  for(const mode of ANSWER_MODES)profiles[mode]=restoreProfile(state[mode]);
  ({cards,round}=profiles[answerMode]);
  if(current)current=cards.find(c=>c.id===current.id)||null;
  autoContinue=state.preferences?.autoContinue===true;if(CIRCLE_VIEWS.includes(state.preferences?.circleView))circleView=state.preferences.circleView;renderAutoContinue();renderCircleView();progress();
  if(['idle','done','paused'].includes(phase))showReady();
});

document.addEventListener('progress-import',()=>{cancel();focusIds=null;phase='paused';current=null;showReady();});
