import {makeCards,ANSWER_MODES} from './engine.js';
export const PROFILE_PREFIX='tre-og-noget-v2:';
export const PREFERENCES_KEY='tre-og-noget-v2:preferences';
export function freshProfile(){return {cards:makeCards(),round:0,lastId:null};}
export function restoreProfile(saved){
  const fresh=freshProfile();
  if(!saved||!Array.isArray(saved.cards))return fresh;
  const round=Number.isSafeInteger(saved.round)&&saved.round>=0?saved.round:0;
  const cards=fresh.cards.map(c=>{
    const s=saved.cards.find(x=>x?.id===c.id);
    if(!s||!Number.isInteger(s.hits)||s.hits<0||s.hits>3||!Number.isSafeInteger(s.attempts)||s.attempts<s.hits||!Number.isFinite(s.due)||s.due<0)return c;
    return {...c,hits:s.hits,attempts:s.attempts,due:s.due,lastMs:Number.isFinite(s.lastMs)&&s.lastMs>=0?s.lastMs:null,firstSide:['nw','ne','south'].includes(s.firstSide)?s.firstSide:'nw'};
  });
  return {cards,round,lastId:cards.some(c=>c.id===saved.lastId)?saved.lastId:null};
}
function read(storage,key){try{return JSON.parse(storage.getItem(key));}catch{return null;}}
export function writeProfile(storage,mode,profile){
  if(!ANSWER_MODES.includes(mode))throw new Error('Ugyldigt svarfelt');
  storage.setItem(PROFILE_PREFIX+mode,JSON.stringify({version:2,...profile}));
  storage.setItem(PREFERENCES_KEY,JSON.stringify({version:2,answerMode:mode}));
}
export function loadProfiles(storage){
  const profiles=Object.fromEntries(ANSWER_MODES.map(mode=>[mode,restoreProfile(read(storage,PROFILE_PREFIX+mode))]));
  const prefs=read(storage,PREFERENCES_KEY);
  let answerMode=ANSWER_MODES.includes(prefs?.answerMode)?prefs.answerMode:'all',migrated=false,saveFailed=false;
  if(prefs?.version!==2){
    const legacy=read(storage,'tre-og-noget-v1');
    if(legacy?.version===1&&Array.isArray(legacy.cards)&&!read(storage,PROFILE_PREFIX+'all')){
      profiles.all=restoreProfile(legacy);
      migrated=profiles.all.cards.some(c=>c.attempts>0);
      // The old data had no per-answer region; keep it only in the mixed profile.
      answerMode='all';
    }
    try{
      for(const mode of ANSWER_MODES)storage.setItem(PROFILE_PREFIX+mode,JSON.stringify({version:2,...profiles[mode]}));
      storage.setItem(PREFERENCES_KEY,JSON.stringify({version:2,answerMode}));
    }catch{saveFailed=true;}
  }
  return {profiles,answerMode,migrated,saveFailed};
}
