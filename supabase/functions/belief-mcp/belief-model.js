// Belief Map's native graph format. Shared library with one active canvas.
import {text,MAX_BYTES} from './model.js';
export const TYPES=['premise','evidence','assumption','hypothesis','conclusion','claim','ytring','doubt','conflict','incoherence','paradox','computation','operator','junction','image','feeling','schema','belief','pro','con','fact','datum','object','person','choice','desiredstate','deltaS','question','cluster'];
export const OPERATORS=['impl','bidir','cause','supports','weakens','abduct','nests','transmit','conflict','contradict','transform','integrate','actualize','weights'];
const bad=message=>{throw Object.assign(new Error(message),{status:400});};
const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
const clone=x=>JSON.parse(JSON.stringify(x));
const id=x=>{if(typeof x!=='string'||!/^[a-zA-Z0-9_.:-]{1,160}$/.test(x))bad('Invalid ID.');return x;};
const bounded=(x,min,max)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
function safe(value,depth=0){if(depth>60)bad('Too deeply nested.');if(value&&typeof value==='object')for(const [k,v]of Object.entries(value)){if(['__proto__','constructor','prototype'].includes(k))bad('Invalid property.');safe(v,depth+1);}}
const NODE_FIELDS=['parentId','slot','localX','y','type','title','text','tag','confidence','aggregator','isContainer','holonType','ontologiskNiveau','sandhedsStratum','temporalStatus','isQuestion','customColor','imgSrc','width','height','memberIds','attributes','speechBubble'];
const EDGE_FIELDS=['parentId','from','to','operator','weight','label','fromPort','toPort','connectorType','deltaS','valence','intensity','arrowDir','dashed','strokeColor','fromLocked','toLocked'];
const enums={aggregator:['and','or','avg','sum'],holonType:['entity','disposition','property'],ontologiskNiveau:['proposition','talehandling','argument','hypotese','selvholon','socialRelation','valens','holon'],sandhedsStratum:['F','M','E','P','D'],temporalStatus:['past','present','future_planned','future_possible','future_hypothetical']};
export function validateMap(input){
  if(!object(input))bad('Invalid argument map.');const m=clone(input);
  id(m.id);text(m.mapTitle,200);if(!m.mapTitle.trim())bad('Map title required.');m.mapNotes??='';text(m.mapNotes,50000);m.showTimeline=m.showTimeline!==false;
  if(!Array.isArray(m.slots)||!m.slots.length||m.slots.length>100)bad('Map needs 1–100 timeline steps.');
  const steps=new Set();for(const s of m.slots){id(s.id);text(s.label,200);if(steps.has(s.id))bad('Duplicate step ID.');steps.add(s.id);}
  if(!Array.isArray(m.nodes)||m.nodes.length>1000||!Array.isArray(m.edges)||m.edges.length>2000)bad('Graph exceeds node/edge limits.');
  const nodes=new Map();
  for(const n of m.nodes){
    if(!object(n))bad('Invalid node.');id(n.id);if(nodes.has(n.id))bad('Duplicate node ID.');nodes.set(n.id,n);delete n.subNodes;
    if(!TYPES.includes(n.type))bad('Unknown node type.');text(n.title,500);n.text??='';text(n.text,30000);
    n.parentId??=null;if(n.parentId!==null)id(n.parentId);
    if(!Number.isInteger(n.slot)||n.slot<0||n.slot>=m.slots.length)bad('Node has invalid timeline step.');
    for(const k of ['localX','y'])if(!bounded(n[k],-100000,100000))bad('Invalid node position.');
    if(n.confidence!==undefined&&!bounded(n.confidence,0,1))bad('Confidence must be between zero and one.');
    for(const [k,allowed]of Object.entries(enums))if(n[k]!=null&&!allowed.includes(n[k]))bad('Invalid '+k);
    for(const k of ['width','height'])if(n[k]!=null&&!bounded(n[k],1,100000))bad('Invalid node size.');
    for(const k of ['tag','attributes'])if(n[k]!=null)text(n[k],10000);
    if(n.customColor!=null&&!/^#[a-fA-F0-9]{6}$/.test(n.customColor))bad('Use a six-digit hex color.');
    if(n.imgSrc!=null&&(typeof n.imgSrc!=='string'||!(/^(https:\/\/|data:image\/(png|jpeg|jpg|webp|gif);base64,)/.test(n.imgSrc))))bad('Unsupported image source.');
    n.memberIds??=[];if(!Array.isArray(n.memberIds))bad('Invalid cluster members.');
  }
  for(const n of m.nodes){
    const seen=new Set([n.id]);let parent=n.parentId,depth=0;
    while(parent!==null){if(!nodes.has(parent))bad('Node parent is missing.');if(seen.has(parent)||++depth>20)bad('Node nesting is cyclic or too deep.');seen.add(parent);parent=nodes.get(parent).parentId;}
    for(const member of n.memberIds)if(member===n.id||!nodes.has(member))bad('Unknown cluster member.');
  }
  const edges=new Set();
  for(const e of m.edges){
    id(e.id);if(edges.has(e.id))bad('Duplicate edge ID.');edges.add(e.id);
    if(!nodes.has(e.from)||!nodes.has(e.to))bad('Edge endpoint is missing.');
    if(nodes.get(e.from).parentId!==e.parentId||nodes.get(e.to).parentId!==e.parentId)bad('Edge endpoints must share their canvas.');
    if(!OPERATORS.includes(e.operator))bad('Unknown edge operator.');
    if(!bounded(e.weight,0,1))bad('Edge weight must be between zero and one.');text(e.label??'',5000);
    e.parentId??=null;if(e.parentId!==null&&!nodes.has(e.parentId))bad('Unknown edge container.');
    for(const k of ['deltaS','intensity'])if(e[k]!=null&&!bounded(e[k],0,1))bad('Invalid '+k);
    if(e.valence!=null&&!['positive','negative'].includes(e.valence))bad('Invalid edge valence.');
    if(e.connectorType!=null&&!['default','unknown','nonzero','certain'].includes(e.connectorType))bad('Unknown connector type.');
  }
  return Object.fromEntries(['id','mapTitle','mapNotes','showTimeline','slots','nodes','edges'].map(k=>[k,m[k]]));
}
export function validateState(input){
  if(!object(input)||JSON.stringify(input).length>MAX_BYTES)bad('The connected map library exceeds 1 MB.');safe(input);
  if(input.kind!=='belief-map'||!Array.isArray(input.maps)||!input.maps.length||input.maps.length>50)bad('Invalid Belief Map library.');
  const maps=input.maps.map(validateMap),ids=maps.map(m=>m.id);if(new Set(ids).size!==ids.length)bad('Duplicate map ID.');
  if(!ids.includes(input.activeMapId))bad('Active map is missing.');
  return {kind:'belief-map',activeMapId:input.activeMapId,maps:maps.sort((a,b)=>a.id.localeCompare(b.id))};
}
export function describe(state){return {kind:state.kind,active_map_id:state.activeMapId,maps:state.maps.map(m=>({id:m.id,title:m.mapTitle,node_count:m.nodes.length,edge_count:m.edges.length,step_count:m.slots.length})),node_types:TYPES,edge_operators:OPERATORS,interpretation:'Node confidence and graph strength are user-defined model values, not verified probabilities. Keep observations, hypotheses, feelings and normative claims distinct. Read the map before editing; preserve IDs, nesting and timeline steps.'};}
export function readMap(state,mapId){const m=state.maps.find(m=>m.id===(mapId||state.activeMapId));if(!m)bad('Unknown map ID.');return {active_map_id:state.activeMapId,map_id:m.id,map_title:m.mapTitle,map_notes:m.mapNotes,show_timeline:m.showTimeline,steps:m.slots,nodes:m.nodes,edges:m.edges,node_types:TYPES,edge_operators:OPERATORS};}
const changes=(value,allowed)=>{if(!object(value)||!Object.keys(value).length)bad('Changes required.');for(const k of Object.keys(value))if(!allowed.includes(k))bad('Field cannot be edited: '+k);return value;};
export function mutate(input,name,args){
  const state=validateState(input),created=[];
  if(name==='belief_select_map'){if(!state.maps.some(m=>m.id===args.map_id))bad('Unknown map.');state.activeMapId=args.map_id;return {state};}
  if(name==='belief_create_map'){
    const map={id:'map_'+crypto.randomUUID(),mapTitle:text(args.title,200),mapNotes:'',showTimeline:true,slots:[{id:'step_'+crypto.randomUUID(),label:'Trin 1'}],nodes:[],edges:[]};
    state.maps.push(map);state.activeMapId=map.id;return {state:validateState(state),created_map_id:map.id};
  }
  const map=state.maps.find(m=>m.id===(args.map_id||state.activeMapId));if(!map)bad('Unknown map.');
  if(name==='belief_update_map')Object.assign(map,changes(args.changes,['mapTitle','mapNotes','showTimeline']));
  else if(name==='belief_edit_map'){
    if(!Array.isArray(args.actions)||!args.actions.length||args.actions.length>100)bad('Provide 1–100 actions.');
    for(const [index,a]of args.actions.entries()){
      if(!object(a))bad('Invalid action.');
      if(a.type==='create_node'){
        const p=changes(a.node,['id',...NODE_FIELDS]);
        const node={id:p.id||'node_'+crypto.randomUUID(),parentId:null,slot:0,localX:18,y:80+map.nodes.filter(n=>!n.parentId&&n.slot===(p.slot||0)).length*190,type:'hypothesis',title:'Ny node',text:'',tag:'',subNodes:[],confidence:0.5,aggregator:'and',isContainer:false,holonType:'entity',ontologiskNiveau:'proposition',sandhedsStratum:null,temporalStatus:null,isQuestion:false,customColor:null,imgSrc:null,width:null,height:null,memberIds:[],attributes:'',...p};
        if(map.nodes.some(n=>n.id===node.id))bad('Node ID already exists.');map.nodes.push(node);created.push({action:index,node_id:node.id});
      }else if(a.type==='update_node'){
        const n=map.nodes.find(n=>n.id===a.node_id);if(!n)bad('Unknown node.');Object.assign(n,changes(a.changes,NODE_FIELDS));
      }else if(a.type==='delete_node'){
        if(!map.nodes.some(n=>n.id===a.node_id))bad('Unknown node.');const remove=new Set([a.node_id]);
        let changed=true;while(changed){changed=false;for(const n of map.nodes)if(remove.has(n.parentId)&&!remove.has(n.id)){if(a.cascade!==true)bad('Node has children. Explicitly set cascade=true to delete its subtree.');remove.add(n.id);changed=true;}}
        map.nodes=map.nodes.filter(n=>!remove.has(n.id)).map(n=>({...n,memberIds:n.memberIds.filter(x=>!remove.has(x))}));map.edges=map.edges.filter(e=>!remove.has(e.from)&&!remove.has(e.to)&&!remove.has(e.parentId));
      }else if(a.type==='create_edge'){
        const p=changes(a.edge,['id',...EDGE_FIELDS]),from=map.nodes.find(n=>n.id===p.from),to=map.nodes.find(n=>n.id===p.to);
        if(!from||!to)bad('Create endpoint nodes before their edge.');if(from.parentId!==to.parentId)bad('Edge endpoints must be in the same nested canvas.');
        const edge={id:p.id||'edge_'+crypto.randomUUID(),parentId:from.parentId,operator:'supports',weight:0.7,label:'',fromPort:null,toPort:null,connectorType:'default',deltaS:0,valence:null,intensity:0.7,arrowDir:null,dashed:null,strokeColor:null,fromLocked:false,toLocked:false,...p};
        if(map.edges.some(e=>e.id===edge.id))bad('Edge ID already exists.');map.edges.push(edge);created.push({action:index,edge_id:edge.id});
      }else if(a.type==='update_edge'){
        const e=map.edges.find(e=>e.id===a.edge_id);if(!e)bad('Unknown edge.');Object.assign(e,changes(a.changes,EDGE_FIELDS));
      }else if(a.type==='delete_edge'){
        if(!map.edges.some(e=>e.id===a.edge_id))bad('Unknown edge.');map.edges=map.edges.filter(e=>e.id!==a.edge_id);
      }else if(a.type==='add_step'){
        const at=a.index??map.slots.length;if(!Number.isInteger(at)||at<0||at>map.slots.length)bad('Invalid step index.');
        const step={id:'step_'+crypto.randomUUID(),label:text(a.label,200)};map.slots.splice(at,0,step);for(const n of map.nodes)if(n.slot>=at)n.slot++;created.push({action:index,step_id:step.id});
      }else if(a.type==='rename_step'){
        const step=map.slots.find(s=>s.id===a.step_id);if(!step)bad('Unknown step.');step.label=text(a.label,200);
      }else bad('Unknown graph action: '+a.type);
    }
  }else bad('Unknown action.');
  // Validate flat nesting before recursive child snapshots are reconstructed.
  validateMap(map);return {state:validateState(state),map_id:map.id,created};
}
const str={type:'string'},rev={type:'integer',minimum:1,description:'Current library revision from a read tool. Edits are atomic and reject stale revisions.'};
const actionSchema={type:'object',properties:{type:{type:'string',enum:['create_node','update_node','delete_node','create_edge','update_edge','delete_edge','add_step','rename_step']},node:{type:'object',description:'Native node fields. Set a unique id to reference this node later in the same batch; type defaults to hypothesis. Fields include title, text, type, parentId, slot (zero-based), localX, y, confidence, tag, attributes, holonType, ontologiskNiveau, sandhedsStratum, temporalStatus.'},edge:{type:'object',description:'Native edge fields including from, to, operator, weight, label, deltaS, valence, intensity.'},node_id:str,edge_id:str,step_id:str,changes:{type:'object'},cascade:{type:'boolean'},label:str,index:{type:'integer',minimum:0}},required:['type'],additionalProperties:false};
export const TOOLS=[
 ['belief_list_maps','List saved argument maps and the active canvas. Read before choosing a map.',{},[],true],
 ['belief_read_map','Read a complete Belief Map: nodes, directed edges, nesting, timeline steps and notes. Omit map_id for the active map. Always read before edits.',{map_id:str},[],true],
 ['belief_select_map','Select a saved map; the browser displays it on the next sync.',{expected_revision:rev,map_id:str},['expected_revision','map_id'],false],
 ['belief_create_map','Create a new empty argument map and select it, preserving existing maps.',{expected_revision:rev,title:str},['expected_revision','title'],false],
 ['belief_update_map','Update map title, notes or timeline visibility. Preserve existing notes when appending.',{expected_revision:rev,map_id:str,changes:{type:'object',properties:{mapTitle:str,mapNotes:str,showTimeline:{type:'boolean'}},additionalProperties:false}},['expected_revision','map_id','changes'],false],
 ['belief_edit_map','Apply up to 100 node, edge or timeline actions atomically in one map. Use stable IDs, known node types and operators from the read result. Distinguish causal claims from support. Deleting a node removes incident edges; deleting descendants requires cascade=true.',{expected_revision:rev,map_id:str,actions:{type:'array',items:actionSchema,minItems:1,maxItems:100}},['expected_revision','map_id','actions'],false],
].map(([name,description,properties,required,readOnlyHint])=>({name,description,inputSchema:{type:'object',properties,required,additionalProperties:false},annotations:{readOnlyHint,destructiveHint:name==='belief_edit_map',idempotentHint:readOnlyHint,openWorldHint:false},securitySchemes:[{type:'oauth2',scopes:['belief:read',...readOnlyHint?[]:['belief:write']]}]}));

export function readTool(state,name,args){return name==='belief_read_map'?readMap(state,args.map_id):describe(state);}
