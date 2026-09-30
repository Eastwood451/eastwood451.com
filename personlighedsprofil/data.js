export const DIM_KEYS=['attachment','affect','activation','selfworth','identity','changeTol','sufferResponse','joyResponse','cogEmpathy','selfMent','otherMent','selfBoundary','affectiveOpenness','dominance','normative','zeroSum','enemyInversion','regulation','ambivalence','agency','temporal','mofLof','valence','satisfaction','arousal','returnSpeed'];
export function normalizeProfile(value={}){
 const out={rest:{},stress:{}};
 for(const mode of ['rest','stress'])for(const key of DIM_KEYS){
  const raw=value[mode]?.[key]??value[key]?.[mode]??5;
  if(typeof raw!=='number'||!Number.isFinite(raw))throw new Error('Profilværdier skal være tal.');
  out[mode][key]=Math.max(0,Math.min(10,raw));
 }
 const confidence=value._confidence??value.confidence;
 if(confidence!==undefined){if(typeof confidence!=='number'||!Number.isFinite(confidence)||confidence<0||confidence>1)throw new Error('Confidence skal være mellem 0 og 1.');out._confidence=confidence;}
 const rationale=value._rationale??value.rationale_da;if(rationale!==undefined){if(typeof rationale!=='string'||rationale.length>20000)throw new Error('Begrundelsen er for lang eller ugyldig.');out._rationale=rationale;}
 return out;
}
export function normalizePeople(people){
 if(!Array.isArray(people)||people.length>500)throw new Error('Der kan højst være 500 personer.');
 const ids=new Set(),names=new Set();
 return people.map(p=>{
  const name=typeof p.name==='string'?p.name.trim():'';
  if(!name||name.length>100)throw new Error('Personnavne skal være mellem 1 og 100 tegn.');
  const id=typeof p.id==='string'&&p.id.length&&p.id.length<=200?p.id:crypto.randomUUID();
  if(ids.has(id)||names.has(name.toLocaleLowerCase('da')))throw new Error('Personer skal have forskellige navne og ID’er.');
  ids.add(id);names.add(name.toLocaleLowerCase('da'));
  return {id,name,profile:normalizeProfile(p.profile)};
 });
}
export function readImport(data){
 const nested=data?.apps?.['SMFI Nested Actor']??data;
 let profiles;
 if(Array.isArray(data))profiles=data;
 else if(Array.isArray(data?.profiles))profiles=data.profiles;
 else if(Array.isArray(data?.people))return normalizePeople(data.people);
 else if(data?.label)profiles=[data];
 else if(nested?.personalityData){
  const names=new Map([['operator',nested.operatorName||'Operatør']]);
  const walk=list=>(list||[]).forEach(a=>{names.set(a.personId||a.id,a.name);walk(a.children);});walk(nested.actors);
  profiles=Object.entries(nested.personalityData).map(([id,p])=>({id,label:names.get(id)||id,...p}));
  for(const p of nested.savedPeopleLibrary||[]){if(!profiles.some(x=>x.id===p.id||x.label?.toLowerCase()===p.name?.toLowerCase()))profiles.push({id:p.id,label:p.name,...p.profile});}
 }else if(Array.isArray(nested?.savedPeopleLibrary)&&nested.savedPeopleLibrary.length){profiles=nested.savedPeopleLibrary.map(p=>({id:p.id,label:p.name,...p.profile}));
 }else throw new Error('Ingen profiler fundet i filen.');
 if(!profiles.length)throw new Error('Ingen profiler fundet i filen.');
 return normalizePeople(profiles.map(p=>({id:p.id,name:p.label||p.name||p.id,profile:p})));
}
export function mergePeople(existing,incoming){
 const result=structuredClone(existing);
 for(const p of incoming){const match=result.find(x=>x.name.toLocaleLowerCase('da')===p.name.toLocaleLowerCase('da'));if(match)match.profile=p.profile;else result.push({...p,id:crypto.randomUUID()});}
 return normalizePeople(result);
}
