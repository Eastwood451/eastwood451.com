export const LIMIT = 1000;
export const ANSWER_TIMEOUT_MS = 5000;
export function makeCards() {
  return Array.from({length:10},(_,a)=>Array.from({length:9-a},(_,n)=>{
    const b=a+n+1;
    return {id:`${a}-${b}`,a,b,c:10+a-b,hits:0,attempts:0,due:0,lastMs:null,firstSide:['nw','ne','south'][Math.floor(Math.random()*3)]};
  })).flat();
}
export const ANSWER_MODES = ['nw','ne','south','all'];
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
export function pickCard(cards,lastId,random=Math.random){
  let pool=cards.filter(c=>c.hits<3);
  if(pool.length>1)pool=pool.filter(c=>c.id!==lastId);
  if(!pool.length)return null;
  const earliest=Math.min(...pool.map(c=>c.due));
  const candidates=pool.filter(c=>c.due===earliest);
  return candidates[Math.min(candidates.length-1,Math.floor(random()*candidates.length))];
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
