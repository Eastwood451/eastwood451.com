export const LIMIT = 1000;
export const ANSWER_TIMEOUT_MS = 5000;
export function makeCards() {
  return Array.from({length:10},(_,a)=>Array.from({length:9-a},(_,n)=>{
    const b=a+n+1;
    return {id:`${a}-${b}`,a,b,c:10+a-b,hits:0,attempts:0,due:0,lastMs:null,firstSide:['nw','ne','south'][Math.floor(Math.random()*3)]};
  })).flat();
}
export const ANSWER_MODES = ['nw','ne','south','all','distance'];
export function missingSide(card,mode='all'){
  if(!ANSWER_MODES.includes(mode))throw new Error('Ugyldigt svarfelt');
  if(mode!=='all')return mode;
  const sides=ANSWER_MODES.slice(0,3);
  const offset=Math.max(0,sides.indexOf(card.firstSide));
  return sides[(offset+card.attempts)%3];
}
export function answerFor(card,side){
  if(side==='nw')return card.a;
  if(side==='ne')return card.b;
  if(side==='south')return card.c;
  if(side==='distance')return card.b;
  throw new Error('Ugyldigt svarfelt');
}
export function grade(card,side,value,ms,round){
  // null records an unanswered timeout, never a guessed or fabricated digit.
  const validValue=value===null?ms>=ANSWER_TIMEOUT_MS:Number.isInteger(value)&&value>=0&&value<=9;
  if(!validValue||!Number.isFinite(ms)||ms<0)throw new Error('Ugyldigt svar');
  const correct=value===answerFor(card,side),fast=correct&&ms<=LIMIT;
  const gap=correct?Math.max(2,Math.round(14-Math.min(ms,3000)/250)):1;
  return {correct,fast,card:{...card,attempts:card.attempts+1,hits:Math.min(3,card.hits+(fast?1:0)),due:round+gap,lastMs:ms}};
}
export function practiceWeight(card,earliestDue){
  // Slow/problematic pairs should dominate the mix instead of merely returning
  // one round earlier. The heatmap's latest response time is the main signal.
  const ms=Number.isFinite(card.lastMs)?card.lastMs:null;
  let difficulty=1;
  if(ms!==null){
    if(ms<=1000)difficulty=.55;
    else if(ms<=2000)difficulty=1.5;
    else if(ms<=3000)difficulty=3;
    else if(ms<=4000)difficulty=6;
    else if(ms<5000)difficulty=12;
    else difficulty=20;
  }
  // Repeated non-fast attempts are a second signal that the pair is sticky.
  const nonFast=Math.max(0,card.attempts-card.hits);
  difficulty*=1+Math.min(2,nonFast*.12);
  // Keep spacing relevant, but do not let it bury a red/orange pair for many turns.
  const dueDistance=Math.max(0,card.due-earliestDue);
  return difficulty/(1+dueDistance*.35);
}
export function pickCard(cards,lastId,random=Math.random){
  let pool=cards.filter(c=>c.hits<3);
  if(pool.length>1)pool=pool.filter(c=>c.id!==lastId);
  if(!pool.length)return null;
  const earliest=Math.min(...pool.map(c=>c.due));
  const weights=pool.map(c=>practiceWeight(c,earliest));
  const total=weights.reduce((sum,w)=>sum+w,0);
  let target=Math.max(0,Math.min(.999999999999,random()))*total;
  for(let i=0;i<pool.length;i++){
    target-=weights[i];
    if(target<0)return pool[i];
  }
  return pool[pool.length-1];
}

export function heatColor(ms) {
  if (!Number.isFinite(ms) || ms < 0) return null;
  const t = Math.max(0, Math.min(1, (ms - 1000) / 4000));
  const stops = [[34, 230, 84], [250, 204, 21], [139, 0, 0]];
  const segment = t <= .5 ? 0 : 1;
  const local = segment === 0 ? t * 2 : (t - .5) * 2;
  const rgb = stops[segment].map((v, i) => Math.round(v + (stops[segment + 1][i] - v) * local));
  const linear = rgb.map(v => { const s = v / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; });
  const luminance = .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
  return {background: `rgb(${rgb.join(', ')})`, foreground: luminance > .179 ? '#000000' : '#ffffff'};
}

export function hardestCards(cards,limit=4){
  return cards.filter(c=>c.hits<3&&c.attempts>0&&Number.isFinite(c.lastMs))
    .sort((a,b)=>b.lastMs-a.lastMs||a.hits-b.hits||a.id.localeCompare(b.id))
    .slice(0,limit);
}
