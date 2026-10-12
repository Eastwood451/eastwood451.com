export function memoryDB(){
 const tables={smfi_mcp_workspaces:[],smfi_mcp_oauth:[],smfi_mcp_history:[]};
 const db=async(table,method='GET',query='',value)=>{
  const p=new URLSearchParams(query),rows=tables[table];
  const match=r=>[...p].every(([k,v])=>k==='payload->>resource'?r.payload?.resource===v.slice(3):['select','order','limit'].includes(k)||v.startsWith('eq.')&&String(r[k])===v.slice(3)||v.startsWith('gt.')&&r[k]>v.slice(3));
  if(method==='POST'){if(rows.some(r=>r.id===value.id&&r.id!==undefined||value.owner_hash&&r.owner_hash===value.owner_hash))throw Object.assign(new Error('duplicate'),{status:409});const row={id:crypto.randomUUID(),revision:1,source:'browser',updated_at:new Date().toISOString(),...structuredClone(value)};rows.push(row);return [structuredClone(row)];}
  const found=rows.filter(match);
  if(method==='PATCH')for(const row of found)Object.assign(row,structuredClone(value));
  if(method==='DELETE')tables[table]=rows.filter(r=>!match(r));
  return structuredClone(found);
 };return {db,tables};
}
