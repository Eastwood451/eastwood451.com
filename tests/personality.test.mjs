import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DIM_KEYS,normalizePeople,readImport,mergePeople} from '../personlighedsprofil/data.js';
test('Nested Actor and Suite imports preserve actors, operator, rest, stress and notes',()=>{
 const state={operatorName:'Operatøren',actors:[{name:'Person A',personId:'a',children:[]}],personalityData:{operator:{rest:{attachment:2},stress:{attachment:7}},a:{rest:{agency:8},stress:{agency:3},_confidence:.8,_rationale:'Observation'}},savedPeopleLibrary:[]};
 const people=readImport({apps:{'SMFI Nested Actor':state}});
 assert.equal(people.length,2);assert.equal(people[0].name,'Operatøren');assert.equal(people[0].profile.stress.attachment,7);assert.equal(people[1].profile.rest.agency,8);assert.equal(people[1].profile._rationale,'Observation');assert.equal(Object.keys(people[0].profile.rest).length,DIM_KEYS.length);
});
test('Import merges names without overwriting unrelated people',()=>{
 const before=normalizePeople([{id:'a',name:'Alice',profile:{}},{id:'b',name:'Bob',profile:{}}]);
 const after=mergePeople(before,readImport({schema:'smfi-profile-import-v1',profiles:[{label:'alice',rest:{agency:9},stress:{agency:1}}]}));
 assert.equal(after.length,2);assert.equal(after[0].id,'a');assert.equal(after[0].profile.stress.agency,1);assert.equal(after[1].profile.rest.agency,5);assert.equal(before[0].profile.rest.agency,5);
});
test('Invalid imports are rejected before any mutation',()=>{
 assert.throws(()=>readImport({profiles:[{label:'a',rest:{agency:'NaN'}}]}));
 assert.throws(()=>normalizePeople([{id:'a',name:'A',profile:{}},{id:'b',name:'a',profile:{}}]));
 assert.throws(()=>readImport({profiles:[]}));
});
