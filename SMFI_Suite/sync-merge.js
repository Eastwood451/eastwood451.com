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
  if(['/maps','/nodes','/edges'].some(end=>path.endsWith(end))&&[base,local,remote].every(a=>Array.isArray(a)&&a.every(x=>obj(x)&&typeof x.id==='string')&&new Set(a.map(x=>x.id)).size===a.length)) {
    const [b,l,r]=[base,local,remote].map(a=>new Map(a.map(x=>[x.id,x]))),value=[],conflicts=[];
    for(const id of new Set([...l.keys(),...r.keys(),...b.keys()])) {
      const result=mergeStates(b.get(id),l.get(id),r.get(id),path+'/'+id);
      if(result.value!==undefined)value.push(result.value);
      conflicts.push(...result.conflicts);
    }
    // Independently valid edits may jointly leave dangling graph references.
    if(path.endsWith('/maps'))for(const map of value){
      const nodes=new Map((map.nodes||[]).map(n=>[n.id,n]));
      let invalid=(map.nodes||[]).some(n=>n.parentId!=null&&!nodes.has(n.parentId)||!Number.isInteger(n.slot)||n.slot<0||n.slot>=(map.slots||[]).length);
      for(const n of nodes.values()){
        const seen=new Set([n.id]);let parent=n.parentId;
        while(parent!=null&&nodes.has(parent)){if(seen.has(parent)||seen.size>20){invalid=true;break;}seen.add(parent);parent=nodes.get(parent).parentId;}
        if((n.memberIds||[]).some(id=>!nodes.has(id)))invalid=true;
      }
      if((map.edges||[]).some(e=>!nodes.has(e.from)||!nodes.has(e.to)||nodes.get(e.from).parentId!==e.parentId||nodes.get(e.to).parentId!==e.parentId))invalid=true;
      if(invalid)conflicts.push(path+'/'+map.id+'/graph');
    }
    return {value,conflicts};
  }
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
