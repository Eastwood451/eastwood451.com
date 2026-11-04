import test from 'node:test';
import assert from 'node:assert/strict';
import {preparationLink} from '../matematikbibliotek/preparation-link.js';
test('verified material opens the preparation import with Danish title and page',()=>{const u=new URL(preparationLink({title:'Brøker_æ_ø_å',number:2,locations:[{status:'verified',drive_id:'11111111111'}]}));assert.equal(u.origin,'https://eastwood451.com');assert.equal(u.pathname,'/agent-skolelaerer/');assert.equal(u.searchParams.get('materiale'),'1');assert.equal(u.searchParams.get('title'),'Brøker æ ø å');assert.equal(u.searchParams.get('page'),'2');assert.equal(u.searchParams.get('drive'),'11111111111');assert.equal([...u.searchParams].length,4)});
test('unverified or malformed Drive links are not sent',()=>{assert.equal(preparationLink({locations:[{status:'missing',drive_id:'11111111111'}]}),null);assert.equal(preparationLink({locations:[{status:'verified',drive_id:'https://invalid.test'}]}),null)});
