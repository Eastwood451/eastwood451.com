import {DIGIT_MODES,ONES_MODES,nextMinusQuestion} from './minus-engine.js';

const SUPABASE_URL='https://wpriingzftsboauvkmsj.supabase.co';
const SUPABASE_KEY='sb_publishable_bSvkvx_Lqd5ZEt94oVdMaw_44WV2fYE';
const LOCAL_KEY='tre-og-noget-minus-settings-v1';
const $=id=>document.getElementById(id);
const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

const {data:{session}}=await client.auth.getSession();
if(!session){
  location.replace('./');
  throw new Error('Login required');
}
$('account-label').textContent=session.user.email;

let local={};
try{local=JSON.parse(localStorage.getItem(LOCAL_KEY))||{};}catch{}
let remote={};
try{
  const {data,error}=await client.rpc('tre_og_noget_sync',{op:null});
  if(error)throw error;
  remote=data?.preferences||{};
}catch{}

const settings={
  digits:DIGIT_MODES.includes(remote.minusDigits)?remote.minusDigits:(DIGIT_MODES.includes(local.digits)?local.digits:'one'),
  ones:ONES_MODES.includes(remote.minusOnes)?remote.minusOnes:(ONES_MODES.includes(local.ones)?local.ones:'borrow')
};

let question=null,lastKey='',buffer='',answered=false,correct=0,attempts=0,streak=0,advanceTimer=0;

function persistSettings(){
  localStorage.setItem(LOCAL_KEY,JSON.stringify(settings));
  const op={
    id:crypto.randomUUID(),
    kind:'preferences',
    mode:'preferences',
    data:{minusDigits:settings.digits,minusOnes:settings.ones},
    at:new Date().toISOString()
  };
  void (async()=>{try{await client.rpc('tre_og_noget_sync',{op});}catch{}})();
}

function renderToggles(){
  document.querySelectorAll('[data-digits]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.digits===settings.digits)));
  document.querySelectorAll('[data-ones]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.ones===settings.ones)));
}

function renderStats(){
  $('correct-count').textContent=correct;
  $('attempt-count').textContent=attempts;
  $('streak-count').textContent=streak;
}

function renderAnswer(){
  $('answer-value').textContent=buffer||'?';
  $('answer-box').className='minus-answer-box';
}

function newQuestion(){
  clearTimeout(advanceTimer);
  question=nextMinusQuestion(settings,lastKey);
  lastKey=`${question.top}-${question.bottom}`;
  buffer='';answered=false;
  $('top-number').textContent=question.top;
  $('bottom-number').textContent=question.bottom;
  $('feedback').textContent='Skriv svaret og tryk Enter.';
  $('feedback').className='minus-feedback';
  $('next-question').hidden=true;
  renderAnswer();
  $('problem').setAttribute('aria-label',`${question.top} minus ${question.bottom}. Hvad er resultatet?`);
}

function addDigit(digit){
  if(answered||buffer.length>=2)return;
  if(buffer==='0')buffer='';
  buffer+=String(digit);
  renderAnswer();
}

function erase(){
  if(answered)return;
  buffer=buffer.slice(0,-1);
  renderAnswer();
}

function submit(){
  if(answered||!buffer)return;
  answered=true;attempts++;
  const value=Number(buffer);
  const isCorrect=value===question.answer;
  if(isCorrect){
    correct++;streak++;
    $('answer-box').classList.add('correct');
    $('feedback').textContent='✓ Korrekt';
    $('feedback').className='minus-feedback good';
    renderStats();
    advanceTimer=setTimeout(newQuestion,450);
  }else{
    streak=0;
    $('answer-box').classList.add('wrong');
    $('feedback').textContent=`${question.top} − ${question.bottom} = ${question.answer}`;
    $('feedback').className='minus-feedback bad';
    $('next-question').hidden=false;
    renderStats();
  }
}

document.querySelectorAll('[data-digits]').forEach(button=>button.addEventListener('click',()=>{
  const value=button.dataset.digits;
  if(!DIGIT_MODES.includes(value)||value===settings.digits)return;
  settings.digits=value;persistSettings();renderToggles();newQuestion();
}));
document.querySelectorAll('[data-ones]').forEach(button=>button.addEventListener('click',()=>{
  const value=button.dataset.ones;
  if(!ONES_MODES.includes(value)||value===settings.ones)return;
  settings.ones=value;persistSettings();renderToggles();newQuestion();
}));

for(const n of [1,2,3,4,5,6,7,8,9]){
  const button=document.createElement('button');
  button.type='button';button.textContent=n;
  button.addEventListener('click',()=>addDigit(n));
  $('minus-keypad').append(button);
}
const back=document.createElement('button');
back.type='button';back.className='key-action';back.textContent='⌫';back.setAttribute('aria-label','Slet sidste ciffer');back.addEventListener('click',erase);
$('minus-keypad').append(back);
const zero=document.createElement('button');
zero.type='button';zero.textContent='0';zero.addEventListener('click',()=>addDigit(0));
$('minus-keypad').append(zero);
const enter=document.createElement('button');
enter.type='button';enter.className='key-action enter';enter.textContent='Svar';enter.addEventListener('click',submit);
$('minus-keypad').append(enter);

$('next-question').addEventListener('click',newQuestion);
document.addEventListener('keydown',event=>{
  if(event.ctrlKey||event.altKey||event.metaKey)return;
  if(/^[0-9]$/.test(event.key)){event.preventDefault();addDigit(Number(event.key));}
  else if(event.key==='Backspace'){event.preventDefault();erase();}
  else if(event.key==='Enter'){event.preventDefault();answered?newQuestion():submit();}
});

renderToggles();renderStats();newQuestion();
$('minus-loading').hidden=true;$('minus-app').hidden=false;
