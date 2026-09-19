const $ = id => document.getElementById(id);
const el = (tag,text,cls) => {const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
const labels={pending:'Afventer analyse',review:'Kræver gennemgang',complete:'Færdigvurderet',error:'Fejl'};
const difficulty={let:'Let',middel:'Middel',svaer:'Svær'};
const format = n => new Intl.NumberFormat('da-DK').format(n||0);
let bootstrap,controller,offset=0,total=0,view='files',editing,adding,searchTimer;
const objectUrls=new Set();
const filters=()=>Object.fromEntries(['q','grade','topic','subtopic','difficulty','scope','status','collection'].map(id=>[id,$(id).value]).concat([['view',view]]));
async function api(path,options={}){
 const response=await fetch('/api/library/'+path,{...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),...options.headers}});
 const value=await response.json();if(!response.ok)throw new Error(value.error||'Handlingen mislykkedes.');return value;
}
function option(select,value,label){const o=el('option',label);o.value=value;select.append(o)}
function loadOptions(select,items,empty){const previous=select.value;select.replaceChildren();if(empty)option(select,'',empty);for(const item of items)option(select,item.id,item.label||item.name);select.value=previous}
async function refreshBootstrap(){
 bootstrap=await api('bootstrap');
 loadOptions($('topic'),bootstrap.topics,'Alle emner');loadOptions($('collection'),bootstrap.collections,'Hele biblioteket');
 $('saved').replaceChildren();
 for(const f of bootstrap.filters){const b=el('button',f.name);b.onclick=()=>{applyFilters(f.filters);search()};$('saved').append(b)}
 if(!bootstrap.filters.length)$('saved').append(el('p','Ingen gemte søgninger endnu.','hint'));
 const s=bootstrap.stats;$('stats').replaceChildren();
 for(const [n,label] of [[s.files,'PDF-FILER'],[s.original_pages,'SIDER I ORIGINALER'],[s.complete,'UNIKKE SIDER VURDERET']]){const d=el('div',undefined,'stat');d.append(el('strong',format(n)),el('span',label));$('stats').append(d)}
 $('error-list').replaceChildren();for(const e of s.errors){const p=el('p',e.path+' — '+e.error);if(e.drive_id){const a=el('a',' Åbn i Google Drive');a.href='https://drive.google.com/file/d/'+encodeURIComponent(e.drive_id)+'/view';a.target='_blank';a.rel='noopener noreferrer';p.append(a)}$('error-list').append(p)}
 if(!s.errors.length)$('error-list').append(el('p','Ingen registrerede importfejl.'));
}
function applyFilters(f){for(const id of ['q','grade','topic','subtopic','difficulty','scope','status','collection'])$(id).value=f[id]??(id==='scope'?'students':'');view=f.view==='pages'?'pages':'files';offset=0;updateView()}
function updateView(){$('view-files').setAttribute('aria-pressed',view==='files');$('view-pages').setAttribute('aria-pressed',view==='pages')}
function tag(text){return el('span',text,'tag')}
async function thumbnail(image,id){
 try{const r=await fetch('/api/library/preview/'+encodeURIComponent(id));if(!r.ok)return;const blob=await r.blob();if(!image.isConnected)return;const url=URL.createObjectURL(blob);objectUrls.add(url);image.src=url;image.hidden=false;image.previousElementSibling.hidden=true;image.parentElement.classList.add('ready');image.parentElement.tabIndex=0;image.parentElement.setAttribute('role','button');image.parentElement.setAttribute('aria-label','Forstør '+image.alt)}catch{/* The catalogue remains usable if a preview is not available. */}
}
const previewObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){previewObserver.unobserve(e.target);thumbnail(e.target.querySelector("img"),e.target.dataset.page)}},{rootMargin:'200px'});
function card(item){
 const c=el('article',undefined,'card'),preview=el('div',undefined,'preview');preview.append(el('span','∑','placeholder'));const img=el('img');img.alt='Forhåndsvisning af '+item.title+', side '+item.number;img.hidden=true;img.dataset.page=item.page_id;const enlarge=()=>{if(!img.src)return;$('preview-title').textContent=item.title+' · Side '+item.number;$('preview-large').src=img.src;$('preview-large').alt=img.alt;$('preview-dialog').showModal()};preview.onclick=enlarge;preview.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();enlarge()}};preview.append(img,el('span','Side '+item.number+' af '+item.page_count,'page-chip'));c.append(preview);
 const b=el('div',undefined,'card-body');b.append(el('span',item.corrected?'Manuelt rettet':labels[item.status], 'status '+item.status),el('h3',item.title.replace(/_+/g,' ')));
 b.append(el('p',item.summary||'Indholdet er registreret og afventer faglig vurdering.','description'));
 const tags=el('div',undefined,'tags');for(const a of item.assessments){const name=bootstrap.topics.find(t=>t.id===a.topic)?.label||a.topic;const level=a.grade_min===null?'Niveau uafklaret':(a.grade_min===a.grade_max?a.grade_min:a.grade_min+'–'+a.grade_max)+'. kl.';const t=tag(name+' · '+level+(a.difficulty?' · '+difficulty[a.difficulty]:''));t.title=[a.subtopic,a.skill,a.reason].filter(Boolean).join(' → ');tags.append(t)}b.append(tags);
 if(view==='files'&&item.matched_pages>1)b.append(el('p',format(item.matched_pages)+' sider matcher søgningen.','hint'));
 const actions=el('div',undefined,'card-actions'),verified=item.locations.find(l=>l.status==='verified');
 if(verified){const a=el('a','Åbn i Google Drive ↗');a.href='https://drive.google.com/file/d/'+encodeURIComponent(verified.drive_id)+'/view';a.target='_blank';a.rel='noopener noreferrer';actions.append(a)}else actions.append(el('span','Drive-link kræver afklaring','hint'));
 const edit=el('button','Ret tags');edit.onclick=()=>editPage(item);const add=el('button','＋ Gem');add.onclick=()=>addItem(item);actions.append(edit,add);
 if($('collection').value){const remove=el('button','Fjern');remove.onclick=async()=>{try{const entries=await api('collections/'+$('collection').value+'/items');for(const entry of entries)if(entry.page_id===item.page_id||entry.content_id===item.content_id)await api('items/'+entry.id,{method:'DELETE'});await search()}catch(e){$('notice').textContent=e.message}};actions.append(remove)}
 b.append(actions);
 const locations=el('details',undefined,'locations');locations.append(el('summary',item.locations.length>1?item.locations.length+' identiske kopier':'Filplacering og kilde'));
 for(const l of item.locations){locations.append(el('p',l.path));if(l.source?.source){const s=el('span','Kilde: '+l.source.source);locations.append(s)}if(l.source?.grades?.length)locations.append(el('p','Kildens klassetrin: '+l.source.grades.map(g=>({3:0,1:1,2:2,4:3,5:4,6:5,7:6,8:7,9:8,10:9}[g]??g)+'.').join(', ')+' klasse'));if(l.drive_id){const a=el('a','Åbn denne placering');a.href='https://drive.google.com/file/d/'+encodeURIComponent(l.drive_id)+'/view';a.target='_blank';a.rel='noopener noreferrer';locations.append(a)}}b.append(locations);c.append(b);
 if(item.preview_key)setTimeout(()=>{if(img.isConnected){preview.dataset.page=item.page_id;previewObserver.observe(preview)}},0);return c;
}
async function search(reset=true){
 if(reset)offset=0;controller?.abort();controller=new AbortController();const active=controller;
 $('notice').textContent='';$('result-count').setAttribute('aria-busy','true');
 try{const started=performance.now();const result=await api('search?'+new URLSearchParams({...filters(),offset}),{signal:active.signal});if(active!==controller)return;total=result.total;
 previewObserver.disconnect();for(const u of objectUrls)URL.revokeObjectURL(u);objectUrls.clear();$('cards').replaceChildren(...result.items.map(card));
 if(!result.items.length)$('cards').append(el('div','Ingen materialer matcher. Prøv færre filtre eller vis alle materialetyper.','empty'));
 $('result-count').textContent=format(total)+(view==='pages'?' sider':' materialer');
 $('result-detail').textContent=format(result.pages)+' matchende sider · '+Math.round(performance.now()-started)+' ms · '+format(bootstrap.stats.pending)+' afventer analyse';
 $('page-label').textContent=total?`${offset+1}–${Math.min(offset+30,total)} af ${format(total)}`:'0 resultater';$('prev').disabled=offset===0;$('next').disabled=offset+30>=total;
 $('subtopics').replaceChildren();for(const t of result.facets.subtopics||[])option($('subtopics'),t.value,t.value+' ('+format(t.count)+')');
 const gradeCurrent=$('grade').value;$('grade').replaceChildren();option($('grade'),'','Alle klassetrin');for(let g=0;g<=12;g++){const count=result.facets.grades.find(x=>Number(x.value)===g)?.count||0;option($('grade'),String(g),g+'. klasse'+(count?' ('+format(count)+')':''))}$('grade').value=gradeCurrent;
 const topicCurrent=$('topic').value;loadOptions($('topic'),bootstrap.topics.map(t=>({...t,label:t.label+(result.facets.topics.find(x=>x.value===t.id)?' ('+format(result.facets.topics.find(x=>x.value===t.id).count)+')':'')})),'Alle emner');$('topic').value=topicCurrent;
 }catch(e){if(e.name!=='AbortError')$('notice').textContent=e.message}finally{if(active===controller)$('result-count').removeAttribute('aria-busy')}
}
function assessmentRow(value={}){
 const box=el('section',undefined,'assessment'),remove=el('button','Fjern','remove');remove.type='button';remove.onclick=()=>box.remove();box.append(remove);
 const row=el('div',undefined,'row');
 function field(key,label,type='input',choices){const wrap=el('label',label),input=el(type);input.dataset.key=key;if(choices)for(const [v,l]of choices)option(input,v,l);input.value=value[key]??'';wrap.append(input);return [wrap,input]}
 const [topic]=field('topic','Emne','select',bootstrap.topics.map(t=>[t.id,t.label]));row.append(topic);const [sub,subinput]=field('subtopic','Underemne');subinput.maxLength=100;row.append(sub);const [skill,skillinput]=field('skill','Færdighed');skillinput.maxLength=200;row.append(skill);box.append(row);
 const level=el('div',undefined,'row');const grades=[['','Uafklaret'],...Array.from({length:13},(_,g)=>[String(g),g+'. klasse'])];level.append(field('grade_min','Fra klassetrin','select',grades)[0],field('grade_max','Til klassetrin','select',grades)[0],field('difficulty','Sværhedsgrad','select',[['','Uafklaret'],...Object.entries(difficulty)])[0]);box.append(level);$('assessments').append(box);
}
function editPage(item){editing=item;$('edit-title').textContent=item.title+' · Side '+item.number;$('edit-summary').value=item.summary;$('edit-subject').value=item.subject;$('edit-type').value=item.material_type;$('assessments').replaceChildren();item.assessments.forEach(assessmentRow);$('edit-error').textContent='';$('editor').showModal()}
async function addItem(item){adding=item;if(!bootstrap.collections.length){const name=prompt('Navn på din første samling:');if(!name)return;try{await api('collections',{method:'POST',body:JSON.stringify({name})});await refreshBootstrap()}catch(e){$('notice').textContent=e.message;return}}loadOptions($('add-target'),bootstrap.collections);$('add-target').selectedIndex=0;$('add-title').textContent=item.title+(view==='pages'?' · Side '+item.number:' · Hele filen');$('add-dialog').showModal()}
$('edit-form').onsubmit=async e=>{e.preventDefault();const assessments=[...$('assessments').children].map(row=>Object.fromEntries([...row.querySelectorAll('[data-key]')].map(input=>[input.dataset.key,input.dataset.key.startsWith('grade_')?(input.value===''?null:Number(input.value)):input.value||null])));for(const a of assessments){a.subtopic||='';a.skill||=''}try{await api('page/'+encodeURIComponent(editing.page_id),{method:'PATCH',body:JSON.stringify({summary:$('edit-summary').value,subject:$('edit-subject').value,material_type:$('edit-type').value,assessments})});$('editor').close();await refreshBootstrap();await search(false)}catch(error){$('edit-error').textContent=error.message}};
$('add-assessment').onclick=()=>assessmentRow();$('close-editor').onclick=()=>$('editor').close();$('cancel-add').onclick=()=>$('add-dialog').close();
$('add-form').onsubmit=async e=>{e.preventDefault();try{await api('collections/'+$('add-target').value+'/items',{method:'POST',body:JSON.stringify(view==='pages'?{page_id:adding.page_id}:{content_id:adding.content_id})});$('add-dialog').close();$('notice').textContent='Gemt i samlingen.'}catch(error){$('notice').textContent=error.message;$('add-dialog').close()}};
$('save-filter').onclick=async()=>{const name=prompt('Navn på den gemte søgning:');if(!name)return;try{await api('filters',{method:'POST',body:JSON.stringify({name,filters:filters()})});await refreshBootstrap()}catch(e){$('notice').textContent=e.message}};
$('new-collection').onclick=async()=>{const name=prompt('Navn på samlingen:');if(!name)return;try{await api('collections',{method:'POST',body:JSON.stringify({name})});await refreshBootstrap()}catch(e){$('notice').textContent=e.message}};
for(const id of ['q','subtopic'])$(id).oninput=()=>{clearTimeout(searchTimer);searchTimer=setTimeout(search,250)};
for(const id of ['grade','topic','difficulty','scope','status','collection'])$(id).onchange=()=>search();
$('view-files').onclick=()=>{view='files';updateView();search()};$('view-pages').onclick=()=>{view='pages';updateView();search()};$('clear').onclick=()=>{applyFilters({});search()};$('prev').onclick=()=>{offset=Math.max(0,offset-30);search(false)};$('next').onclick=()=>{offset+=30;search(false)};
$('close-preview').onclick=()=>$('preview-dialog').close();
async function init(){try{await refreshBootstrap();await search()}catch(error){$('notice').textContent=error.message;$('result-count').textContent='Biblioteket kunne ikke hentes.'}}
if(document.readyState==='complete')init();else window.addEventListener('load',init,{once:true});
