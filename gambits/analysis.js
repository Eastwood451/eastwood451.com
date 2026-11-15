/* Structured analysis vocabulary. Registry records remain in Supabase. */
(function(root){
'use strict';
const goals=[
 ['responsibility','Ansvarsplacering','Frikende sig selv, mindske eget ansvar, overføre skyld eller gøre Hvid medskyldig.'],
 ['resources','Ressourcefordeling','Vinde eller beholde penge, tid, arbejde, hjælp, omsorg eller opmærksomhed; flytte omkostninger og risiko.'],
 ['rights','Rettigheder og pligter','Opnå privilegier og særbehandling, fritages fra regler eller øge Hvids forpligtelser.'],
 ['control','Handlings- og proceskontrol','Få en handling eller undladelse; styre dagsorden, tempo og afslutning; få det sidste ord.'],
 ['knowledge','Sagsfremstilling og viden','Få egen version accepteret, skjule oplysninger, hindre afklaring eller gøre en sag uafgørlig.'],
 ['status','Status og anseelse','Hæve egen eller sænke Hvids status, bevare ansigt, fremstå bedre eller opnå beundring.'],
 ['relations','Relationel konfiguration','Fastholde, isolere, skabe afhængighed, gøre sig uundværlig eller rekruttere allierede.'],
 ['affect','Affektiv tilstand','Dæmpe egen skam, angst eller frustration; opnå nydelse; fremkalde skyld, frygt, skam eller smerte hos Hvid.']
];
const levers=[
 ['information','Informationsgrundlag','Ændrer det materiale, Hvid har at vurdere ud fra: løgn, udeladelse, selektion, falsk kildeflertal eller skjult kontekst.'],
 ['inference','Slutning og fortolkning','Ændrer forbindelsen mellem oplysninger og konklusion: tvetydighed, præmissmugling, falsk dilemma eller selvforseglende argumentation.'],
 ['obligation','Normativ selvbinding','Aktiverer regler om, hvad Hvid bør gøre: pligt, samvittighed, overjeg, loyalitet eller gengældelse.'],
 ['selfworth','Selvvurdering og social værdi','Gør Hvids værdi, kompetence eller anseelse betinget af eftergivenhed: skam, nedvurdering, sammenligning eller smiger.'],
 ['consequences','Belønning og sanktion','Gør en praktisk gevinst eller omkostning afhængig af Hvids valg: trussel, løfte, belønning eller tilbageholdte goder. Relationel tilknytning kodes særskilt.'],
 ['attachment','Tilknytning og tilhørsforhold','Gør kontakt, kærlighed, accept eller gruppetilhør betinget af eftergivenhed; aktiverer frygt for afvisning eller tab.'],
 ['contagion','Affektsmitte og samregulering','Sorts følelsesudtryk ændrer Hvids tilstand direkte; Hvid forsøger at berolige, redde eller dæmpe spændingen for at genoprette ro.'],
 ['capacity','Bearbejdningskapacitet','Reducerer tid, energi eller mental kapacitet til at vurdere og stå fast: hast, gentagelse, overbelastning eller udmattelse.'],
 ['options','Adgang og handlemuligheder','Begrænser selve muligheden for at svare, vælge, få støtte eller efterprøve: afbrudt kanal, isolation, afhængighed eller proceduremæssige spærrer.']
];
const reactions=[['guilt','Skyldfølelse'],['shame','Skam'],['fear','Frygt / angst'],['confusion','Forvirring'],['selfdoubt','Tvivl på egen dømmekraft'],['exhaustion','Udmattelse'],['overload','Overvældelse'],['freeze','Fastfrysning'],['duty','Pligtfølelse'],['care','Omsorg / redderimpuls'],['approval','Behov for accept'],['anger','Vrede'],['hope','Håb om gevinst'],['desire','Lyst / begær'],['relief','Lettelse ved at give efter']];
const susceptibility=[
 ['conscience','Stærk samvittighed / overjeg / pligtopfyldenhed'],
 ['selfworth','Selvværd bundet til andres vurdering'],
 ['attachment','Følsomhed for afvisning / konflikt / tab'],
 ['trust','Stor tillid til andres fremstilling eller autoritet'],
 ['empathy','Stærk empati / ansvarsfølelse for andres tilstand'],
 ['capacity','Aktuel træthed, stress, tidspres eller overbelastning'],
 ['interoception','Svært ved at mærke egne kropssignaler, ubehag eller grænser'],
 ['dependence','Praktisk, økonomisk eller social afhængighed'],
 ['habit','Indlært eftergivenhed / automatisk autoritetstro']
];
const roles=[['rescuer','Redder'],['victim','Offer'],['persecutor','Krænker'],['friend','Ven'],['enemy','Fjende'],['ward','Myndling'],['authority','Autoritet / dommer']];
const kinds=[['unknown','Uafklaret'],['dolus','Dolus — forsæt'],['culpa','Culpa — uagtsomhed'],['casus','Casus — hændeligt']];
const intent=[['unspecified','Ikke nærmere vurderet'],['direct','Direkte forsæt'],['probable','Sandsynlighedsforsæt'],['eventual','Dolus eventualis']];
const awareness=[['unspecified','Ikke nærmere vurderet'],['conscious','Bevidst uagtsomhed'],['unconscious','Ubevidst uagtsomhed']];
const severity=[['unspecified','Ikke nærmere vurderet'],['simple','Simpel uagtsomhed'],['gross','Grov uagtsomhed']];
const scope=[['prototype','Prototypisk træk'],['episode','Konkret episode']];
const fields={analysis_purpose:'Sorts formål (ΔS)',analysis_mechanism:'Mekanisme',analysis_culpability:'Tilregnelse'};
const str=x=>String(x??'');
const esc=x=>str(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arr=x=>Array.isArray(x)?[...new Set(x.filter(v=>typeof v==='string'))]:[];
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
const label=(items,key)=>items.find(x=>x[0]===key)?.[1]||key;
function normalize(field,value){
 const d=obj(value);
 if(field==='analysis_purpose')return {...d,schemaVersion:1,primary:str(d.primary),secondary:arr(d.secondary).filter(x=>x!==d.primary),description:str(d.description),basis:str(d.basis),roles:arr(d.roles)};
 if(field==='analysis_mechanism')return {...d,schemaVersion:1,primary:str(d.primary),secondary:arr(d.secondary).filter(x=>x!==d.primary),reactions:arr(d.reactions),susceptibility:arr(d.susceptibility),chain:str(d.chain),context:str(d.context),basis:str(d.basis)};
 if(field==='analysis_culpability')return {...d,schemaVersion:1,scope:str(d.scope||'prototype'),effect:str(d.effect),kind:str(d.kind||'unknown'),intent:str(d.intent||'unspecified'),awareness:str(d.awareness||'unspecified'),severity:str(d.severity||'unspecified'),basis:str(d.basis)};
 return {...d};
}
function select(key,title,items,value,empty=false){
 const unknown=value&&!items.some(x=>x[0]===value)?`<option value="${esc(value)}" selected>${esc(value)} (tidligere værdi)</option>`:'';
 return `<label class="analysis-label">${esc(title)}<select data-analysis-key="${key}">${empty?'<option value="">Ikke vurderet</option>':''}${unknown}${items.map(([id,text])=>`<option value="${id}" ${value===id?'selected':''}>${esc(text)}</option>`).join('')}</select></label>`;
}
function checks(key,title,items,values){
 const available=[...items,...values.filter(v=>!items.some(x=>x[0]===v)).map(v=>[v,v+' (tidligere værdi)'])];
 return `<fieldset class="analysis-checks"><legend>${esc(title)}</legend>${available.map(([id,text,help])=>`<label title="${esc(help||text)}"><input type="checkbox" data-analysis-list="${key}" value="${esc(id)}" ${values.includes(id)?'checked':''}><span>${esc(text)}</span></label>`).join('')}</fieldset>`;
}
function textarea(key,title,value,placeholder=''){
 return `<label class="analysis-label">${esc(title)}<textarea data-analysis-key="${key}" placeholder="${esc(placeholder)}">${esc(value)}</textarea></label>`;
}
function dictionary(title,items){return `<details class="analysis-dictionary"><summary>${title}</summary><p>Ét kausalt deltrin kodes efter det, der påvirkes. En hel gambit kan aktivere flere kategorier i en kæde.</p><dl>${items.map(([,name,help])=>`<dt>${esc(name)}</dt><dd>${esc(help)}</dd>`).join('')}</dl></details>`}
function controls(field,d){
 if(field==='analysis_purpose')return select('primary','Primært målområde',goals,d.primary,true)+checks('secondary','Sekundære målområder',goals,d.secondary)+textarea('description','Den konkrete ønskede ændring',d.description,'Fra hvilken tilstand til hvilken? Hvad skal være anderledes, for at Sort har opnået sit formål?')+checks('roles','Sorts søgte rolle (valgfrit)',roles,d.roles)+textarea('basis','Grundlag for vurderingen',d.basis)+dictionary('De otte målområder',goals);
 if(field==='analysis_mechanism')return select('primary','Primært virkende greb',levers,d.primary,true)+checks('secondary','Yderligere greb i kæden',levers,d.secondary)+checks('reactions','Aktiveret reaktion hos Hvid',reactions,d.reactions)+textarea('chain','Sådan fungerer mekanismen',d.chain,'Sorts greb → Hvids reaktion → den handling eller ændring, det fremmer.')+checks('susceptibility','Modtagelighed / kontekst hos Hvid (hvis relevant)',susceptibility,d.susceptibility)+textarea('context','Uddybning af kontekst og modtagelighed',d.context,'Fx mærker Hvid ikke sin udmattelse og fortsætter derfor med at forklare sig.')+textarea('basis','Grundlag for vurderingen',d.basis)+dictionary('De ni mekanismeområder og deres afgrænsning',levers);
 return select('scope','Vurderingen gælder',scope,d.scope)+textarea('effect','Den handling eller følge, der vurderes',d.effect,'Fx fremkaldelsen af skyldfølelse, den urigtige påstand eller den konkrete ydmygelse.')+select('kind','Tilregnelsesform',kinds,d.kind)+`<div data-analysis-dolus ${d.kind==='dolus'?'':'hidden'}>${select('intent','Forsætsform',intent,d.intent)}</div><div data-analysis-culpa ${d.kind==='culpa'?'':'hidden'}>${select('awareness','Bevidsthed om risikoen',awareness,d.awareness)}${select('severity','Uagtsomhedens grad',severity,d.severity)}</div>`+textarea('basis','Grundlag for tilregnelsen',d.basis,'Hvilke konkrete oplysninger støtter vurderingen?')+'<details class="analysis-dictionary"><summary>Dolus, culpa og casus</summary><dl><dt>Dolus</dt><dd>Forsæt vedrørende den angivne handling eller følge. Det er ikke nok, at ordene blot blev sagt med vilje.</dd><dt>Culpa</dt><dd>Her brugt snævert om uagtsomhed: Sort har ikke forsæt til det relevante forhold, men burde have udvist større opmærksomhed eller hensyntagen.</dd><dt>Casus</dt><dd>Hændeligt: hverken forsæt eller uagtsomhed vedrørende den angivne følge. Giver anledning til at genoverveje Sort-rollen for netop dette forhold.</dd><dt>Uafklaret</dt><dd>Oplysningerne er utilstrækkelige. Det er ikke det samme som casus.</dd></dl><p>Bevidst/ubevidst og grov/simpel er forskellige dimensioner. En prototypisk vurdering på kortet er adskilt fra vurderingen af en konkret episode.</p><p><a href="https://lex.dk/fors%C3%A6t" target="_blank" rel="noopener noreferrer">Forsæt</a> · <a href="https://lex.dk/culpa_-_erstatningsretsbegreb" target="_blank" rel="noopener noreferrer">Culpa</a> · <a href="https://lex.dk/h%C3%A6ndelige_skader" target="_blank" rel="noopener noreferrer">Hændelighed</a></p></details>';
}
function rows(field,data){
 const d=normalize(field,data),out=[];
 const add=(name,value)=>{if(value)out.push([name,value])};
 const list=(name,items,values)=>add(name,values.map(v=>label(items,v)).join(' · '));
 if(field==='analysis_purpose'){
  add('Primært mål',label(goals,d.primary));list('Sekundære mål',goals,d.secondary);add('Konkret ΔS',d.description);list('Søgt rolle',roles,d.roles);add('Grundlag',d.basis);
 }else if(field==='analysis_mechanism'){
  add('Primært greb',label(levers,d.primary));list('Yderligere greb',levers,d.secondary);list('Reaktion hos Hvid',reactions,d.reactions);add('Årsagskæde',d.chain);list('Modtagelighed / kontekst',susceptibility,d.susceptibility);add('Uddybning',d.context);add('Grundlag',d.basis);
 }else if(Object.keys(obj(data)).length){
  add('Gælder',label(scope,d.scope));add('Vedrørende',d.effect);add('Tilregnelse',label(kinds,d.kind));
  if(d.kind==='dolus'&&d.intent!=='unspecified')add('Forsætsform',label(intent,d.intent));
  if(d.kind==='culpa'){if(d.awareness!=='unspecified')add('Bevidsthed',label(awareness,d.awareness));if(d.severity!=='unspecified')add('Grad',label(severity,d.severity))}
  add('Grundlag',d.basis);
 }
 return out;
}
function view(field,data){const r=rows(field,data);return r.length?`<dl class="analysis-values">${r.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`:'<p class="analysis-unset">Ikke vurderet</p>'}
const help={analysis_purpose:'Hvad skal være anderledes, for at Sort har opnået sit formål? Vælg et primært mål og eventuelle delmål.',analysis_mechanism:'Hvad får gambitten til at fungere efter Sorts hensigt? Registrér greb → reaktion → virkning. Reaktion og modtagelighed er særskilte dimensioner.',analysis_culpability:'Knyt tilregnelsen til en bestemt handling eller følge. Uafklaret er en selvstændig mulighed.'};
function section(field,data){return `<section class="section analysis-section" data-analysis-section="${field}"><div class="section-head"><h3>${fields[field]}</h3><button class="inline-edit" type="button" data-analysis-open="${field}">✎ Redigér</button></div><p class="help">${help[field]}</p><div data-analysis-view>${view(field,data)}</div><div data-analysis-editor hidden></div></section>`}
function editor(field,data){const d=normalize(field,data);return `<form data-analysis-form="${field}">${controls(field,d)}<div class="example-actions"><button class="btn ghost tiny" type="button" data-analysis-cancel="${field}">Annuller</button><button class="btn dark tiny" type="submit">Gem ${fields[field]}</button></div><p class="help" role="status" aria-live="polite" data-analysis-status></p></form>`}
function read(field,form,previous){
 const d=normalize(field,previous);
 form.querySelectorAll('[data-analysis-key]').forEach(el=>{d[el.dataset.analysisKey]=el.value});
 for(const key of new Set([...form.querySelectorAll('[data-analysis-list]')].map(el=>el.dataset.analysisList)))d[key]=[...form.querySelectorAll(`[data-analysis-list="${key}"]:checked`)].map(el=>el.value);
 if(field==='analysis_culpability'){
  if(d.kind!=='dolus')d.intent='unspecified';
  if(d.kind!=='culpa'){d.awareness='unspecified';d.severity='unspecified'}
 }
 return normalize(field,d);
}
function update(form){const kind=form.querySelector('[data-analysis-key="kind"]')?.value;if(!kind)return;form.querySelector('[data-analysis-dolus]').hidden=kind!=='dolus';form.querySelector('[data-analysis-culpa]').hidden=kind!=='culpa'}
function summary(entry){return Object.entries(fields).map(([field,title])=>title+':\n'+(rows(field,entry[field]).map(([k,v])=>k+': '+v).join('\n')||'Ikke vurderet')).join('\n\n')}
root.GambitAnalysis={fields,goals,levers,reactions,susceptibility,normalize,section,editor,read,update,view,summary,rows};
})(typeof window!=='undefined'?window:globalThis);
