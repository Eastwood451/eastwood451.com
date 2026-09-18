import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../engine.js',import.meta.url),'utf8');
const engine=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));

test('distance is a separate training mode with the distance as answer',()=>{
  assert.ok(engine.ANSWER_MODES.includes('distance'));
  const card={id:'2-4',a:2,b:4,c:8,hits:0,attempts:0,due:0,lastMs:null,firstSide:'nw'};
  assert.equal(engine.missingSide(card,'distance'),'distance');
  assert.equal(engine.answerFor(card,'distance'),4);
  const correct=engine.grade(card,'distance',4,800,1);
  assert.equal(correct.correct,true);
  assert.equal(correct.fast,true);
  assert.equal(correct.card.hits,1);
  const wrong=engine.grade(card,'distance',3,800,1);
  assert.equal(wrong.correct,false);
  assert.equal(wrong.card.hits,0);
});
