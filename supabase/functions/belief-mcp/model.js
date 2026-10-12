// Shared, deterministic diagram model. No AI inference or paid model calls.
export const MAX_BYTES = 1_000_000;
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const bad = message => { throw Object.assign(new Error(message), {status: 400}); };
const object = x => x && typeof x === 'object' && !Array.isArray(x);
export function text(value, max = 20000) {
  if (typeof value !== 'string' || value.length > max) bad('Invalid text or text too long.');
  return value;
}
function safeKeys(value, depth = 0) {
  if (depth > 50) bad('Model too deeply nested.');
  if (value && typeof value === 'object') for (const [k,v] of Object.entries(value)) {
    if (['__proto__','prototype','constructor'].includes(k)) bad('Invalid property.');
    safeKeys(v, depth+1);
  }
}
export function validateState(input) {
  if (!object(input) || JSON.stringify(input).length > MAX_BYTES) bad('Diagram exceeds 1 MB.');
  safeKeys(input);
  const state = JSON.parse(JSON.stringify(input));
  text(state.operatorName, 120);
  if (!state.operatorName.trim()) bad('Operator name is required.');
  let count = 0; const ids = new Set();
  const checkActors = (list, depth = 0) => {
    if (!Array.isArray(list) || depth > 10) bad('Invalid actor tree.');
    for (const a of list) {
      if (!object(a) || ++count > 150) bad('Too many actors.');
      for (const id of [a.id, a.personId]) if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,160}$/.test(id)) bad('Invalid actor ID.');
      if (ids.has(a.id)) bad('Duplicate actor ID.'); ids.add(a.id);
      text(a.name, 120); if (!a.name.trim()) bad('Actor name required.');
      checkActors(a.children, depth + 1);
    }
  };
  checkActors(state.actors);
  for (const field of ['holonNotes','holonTags','holonSizes','customHolons','personalityData','savedPeopleVisibility']) {
    state[field] ??= {}; if (!object(state[field])) bad('Invalid '+field);
  }
  for (const note of Object.values(state.holonNotes)) text(note);
  for (const tags of Object.values(state.holonTags)) {
    if (!Array.isArray(tags) || tags.some(t => !/^K[1-7]$/.test(t))) bad('Tags must be K1–K7.');
  }
  for (const size of Object.values(state.holonSizes)) {
    if (!object(size) || !Number.isFinite(size.w) || !Number.isFinite(size.h) || size.w<0 || size.h<0 || size.w>100000 || size.h>100000) bad('Invalid size.');
  }
  const customIds = new Set();
  for (const list of Object.values(state.customHolons)) {
    if (!Array.isArray(list) || list.length > 300) bad('Invalid custom holons.');
    for (const h of list) {
      if (!object(h) || typeof h.id !== 'string' || !/^[a-zA-Z0-9_-]{1,160}$/.test(h.id) || customIds.has(h.id)) bad('Invalid custom holon ID.');
      customIds.add(h.id); text(h.title, 300);
    }
  }
  state.savedPeopleLibrary ??= [];
  if (!Array.isArray(state.savedPeopleLibrary) || state.savedPeopleLibrary.length > 300) bad('Invalid people library.');
  // Persist only diagram data, never the legacy provider chat or credentials.
  return Object.fromEntries(['version','operatorName','actors','holonNotes','holonTags','holonSizes','customHolons','personalityData','savedPeopleLibrary','savedPeopleVisibility'].filter(k=>own(state,k)).map(k=>[k,state[k]]));
}
const enc = x => encodeURIComponent(x);
const key = (path, target, suffix) => [...path.map(enc),enc(target),suffix||'main'].join('/');
const zone = path => path.length ? path.map(enc).join('/') : 'top';
export function describe(state) {
  const holons = {}, zones = [];
  const add = (names, path, target, targetId, suffix, section) => {
    const k = key(path,targetId,suffix);
    let notation = target.charAt(0).toUpperCase();
    for (const n of [...names].reverse()) notation = n.charAt(0).toUpperCase()+'('+notation+')';
    notation = state.operatorName.charAt(0).toUpperCase()+'('+notation+')'+suffix;
    holons[k] = {key:k,notation,ownerPath:names,target,section,zone:zone(path)+'/'+section,content:state.holonNotes[k]||'',tags:state.holonTags[k]||[]};
  };
  const visit = (list,names=[],path=[]) => {
    const owner = names.at(-1)||state.operatorName, ownerId=path.at(-1)||'operator';
    for (const section of ['mof','lof']) zones.push({id:zone(path)+'/'+section,ownerPath:names,section});
    add(names,path,owner,ownerId,'_Luc.mod.','mof');
    if (path.length && ownerId!=='operator') add(names,path,state.operatorName,'operator','','mof');
    for (const a of list) {add(names,path,a.name,a.personId,'_bevidst','mof');visit(a.children,[...names,a.name],[...path,a.personId]);}
    for (const suffix of ['_ideel','_Dark_intuition']) {
      add(names,path,owner,ownerId,suffix,'lof');
      if (path.length && ownerId!=='operator') add(names,path,state.operatorName,'operator',suffix,'lof');
      for (const a of list) add(names,path,a.name,a.personId,suffix,'lof');
    }
    for (const section of ['mof','lof']) for (const h of state.customHolons[zone(path)+'/'+section]||[]) {
      holons[h.id]={key:h.id,notation:h.title,custom:true,ownerPath:names,section,zone:zone(path)+'/'+section,content:state.holonNotes[h.id]||'',tags:state.holonTags[h.id]||[]};
    }
  };
  visit(state.actors);
  return {operator:state.operatorName,actors:state.actors,holons,zones,personalityProfiles:state.personalityData,
    interpretation:'All nested perspectives are representations in the operator’s model. J(L(J)) is Jacob’s model of Line’s model of Jacob, not verified access to Line’s thoughts.'};
}
export function mutate(input, name, args) {
  const state=validateState(input), view=describe(state);
  const holon = () => {if (!own(view.holons,args.holon_key)) bad('Unknown holon_key. Read the model first.');return view.holons[args.holon_key];};
  if (name==='smfi_update_holon') {
    holon();
    if (args.content===undefined && args.tags===undefined) bad('Provide content or tags.');
    if (args.content!==undefined) state.holonNotes[args.holon_key]=text(args.content);
    if (args.tags!==undefined) state.holonTags[args.holon_key]=args.tags;
  } else if (name==='smfi_create_holon') {
    if (!view.zones.some(z=>z.id===args.zone)) bad('Unknown zone. Read the model first.');
    const id='ch_'+crypto.randomUUID();
    (state.customHolons[args.zone]??=[]).push({id,title:text(args.title,300)});
    state.holonNotes[id]=text(args.content??'');
    state.holonTags[id]=args.tags??[];
    return {state:validateState(state),created_key:id};
  } else if (name==='smfi_move_holon') {
    const h=holon(); if (!h.custom) bad('Only custom holons can move. Standard holons retain their SMFI meaning.');
    if (!view.zones.some(z=>z.id===args.zone)) bad('Unknown destination zone.');
    const entry=state.customHolons[h.zone].find(x=>x.id===h.key);
    state.customHolons[h.zone]=state.customHolons[h.zone].filter(x=>x.id!==h.key);
    (state.customHolons[args.zone]??=[]).push(entry);
  } else if (name==='smfi_add_actor') {
    let list=state.actors;
    if (!Array.isArray(args.parent_actor_ids??[])) bad('parent_actor_ids must be an array.');
    for (const id of args.parent_actor_ids??[]) {
      const parent=list.find(a=>a.id===id); if (!parent) bad('Unknown parent actor path.'); list=parent.children;
    }
    const id='a_'+crypto.randomUUID(),personId='person_'+crypto.randomUUID();
    list.push({id,personId,name:text(args.name,120),children:[]});
    return {state:validateState(state),created_actor_id:id};
  } else bad('Unknown action.');
  return {state:validateState(state)};
}
const str={type:'string'}, tags={type:'array',items:{type:'string',enum:['K1','K2','K3','K4','K5','K6','K7']}};
const revision={type:'integer',minimum:1,description:'Exact revision from smfi_read_model. Concurrent edits cause a conflict; read again before retrying.'};
export const TOOLS=[
  ['smfi_read_model','Read the connected SMFI Nested Actor diagram, revision, stable holon keys, actor paths and MOF/LOF zones. Always call before editing.',{},[],true],
  ['smfi_update_holon','Update content and/or conflict tags on an existing holon. Content replaces its note; preserve existing text when appending.',{expected_revision:revision,holon_key:str,content:str,tags},['expected_revision','holon_key'],false],
  ['smfi_create_holon','Create a custom holon in a MOF/LOF zone obtained from smfi_read_model.',{expected_revision:revision,zone:str,title:str,content:str,tags},['expected_revision','zone','title','content'],false],
  ['smfi_move_holon','Move a custom holon between MOF/LOF zones without losing notes or tags. Standard holons cannot be moved.',{expected_revision:revision,holon_key:str,zone:str},['expected_revision','holon_key','zone'],false],
  ['smfi_add_actor','Add an actor inside the indicated actor ID path, or at the top with an empty path. Creates the corresponding standard holons.',{expected_revision:revision,name:str,parent_actor_ids:{type:'array',items:str}},['expected_revision','name','parent_actor_ids'],false],
].map(([name,description,properties,required,readOnlyHint])=>({name,description,inputSchema:{type:'object',properties,required,additionalProperties:false},annotations:{readOnlyHint,destructiveHint:false,idempotentHint:readOnlyHint,openWorldHint:false},securitySchemes:[{type:'oauth2',scopes:['smfi:read',...readOnlyHint?[]:['smfi:write']]}]}));
