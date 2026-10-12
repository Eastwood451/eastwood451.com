// Three-way merge: independent edits combine; conflicting edits stay reviewable.
export const same=(a,b)=>{
  if(a===b)return true;
  if(!a||!b||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return false;
  const ak=Object.keys(a),bk=Object.keys(b);
  return ak.length===bk.length&&ak.every(k=>Object.prototype.hasOwnProperty.call(b,k)&&same(a[k],b[k]));
};
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
export function mergeStates(base,local,remote,path='') {
  if(same(local,base))return {value:remote,conflicts:[]};
  if(same(remote,base)||same(local,remote))return {value:local,conflicts:[]};
  if(obj(base)&&obj(local)&&obj(remote)) {
    const value={},conflicts=[];
    for(const k of new Set([...Object.keys(base),...Object.keys(local),...Object.keys(remote)])) {
      if(['__proto__','constructor','prototype'].includes(k))continue;
      const result=mergeStates(base[k],local[k],remote[k],path+'/'+k);
      if(result.value!==undefined)value[k]=result.value;
      conflicts.push(...result.conflicts);
    }
    return {value,conflicts};
  }
  return {value:local,conflicts:[path]};
}
