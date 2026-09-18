import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

// Loading as a data URL keeps these tests independent of the repository's
// package.json module setting; the browser loads the original ES module.
const source=await readFile(new URL('../number-line.js',import.meta.url),'utf8');
const {numberLineExample,numberLineQuestion,needsAnswerHelp}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const x=n=>40+(n-70)*21;
function attributes(svg,attribute,value){
  const tag=svg.match(new RegExp(`<[^>]+ ${attribute}="${value}"[^>]*>`));
  assert.ok(tag,`${attribute}="${value}" is present`);
  return Object.fromEntries([...tag[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(([,key,val])=>[key,val]));
}

test('85 − 8 = 77: centered endpoints, green 3, blue 5, and 3 + 5 = 8',()=>{
  const e=numberLineExample({a:5,b:8});
  assert.equal(e.equation,'85 − 8 = 77');
  assert.equal(e.decomposition,'3 + 5 = 8');
  assert.equal(e.firstStep,5);
  assert.equal(e.secondStep,3);
  assert.equal(e.middle,80);
  assert.equal(attributes(e.svg,'data-label','end').x,String(x(77)));
  assert.equal(attributes(e.svg,'data-label','start').x,String(x(85)));
  assert.equal(attributes(e.svg,'data-part','remainder').width,'63');
  assert.equal(attributes(e.svg,'data-part','to-ten').width,'105');
  assert.match(e.svg,/Fra 85 går du 5 tilbage til 80 og derefter 3 tilbage til 77/);
  assert.match(e.svg,/data-label="decomposition"/);
});

test('all 45 pairs preserve alignment and proportional distances through 80',()=>{
  let count=0;
  for(let a=0;a<9;a++)for(let b=a+1;b<=9;b++){
    count++;
    const e=numberLineExample({a,b});
    assert.equal(e.start-e.end,b);
    assert.equal(e.firstStep+e.secondStep,b);
    assert.equal(e.firstStep,a);
    assert.equal(e.secondStep,b-a);
    assert.equal(e.start-e.firstStep,80);
    assert.equal(80-e.secondStep,e.end);
    assert.ok(!e.svg.includes('NaN')&&!e.svg.includes('undefined'));
    for(const label of ['start','end']){
      const text=attributes(e.svg,'data-label',label),guide=attributes(e.svg,'data-guide',label);
      assert.equal(text.x,String(x(e[label])));
      assert.equal(text['text-anchor'],'middle');
      assert.equal(guide.x1,text.x);
      assert.equal(guide.x2,text.x);
    }
    const whole=attributes(e.svg,'data-part','whole');
    const remainder=attributes(e.svg,'data-part','remainder');
    assert.equal(Number(whole.width),b*21);
    assert.equal(whole.x,remainder.x);
    assert.equal(Number(remainder.x)+Number(remainder.width),x(80));
    if(a>0){
      const toTen=attributes(e.svg,'data-part','to-ten');
      assert.equal(Number(toTen.x),x(80));
      assert.equal(Number(toTen.x)+Number(toTen.width),x(e.start));
      assert.equal(Number(remainder.width)+Number(toTen.width),Number(whole.width));
      assert.equal((e.svg.match(/data-direction="left"/g)||[]).length,2);
    }else{
      assert.ok(!e.svg.includes('data-part="to-ten"'));
      assert.equal((e.svg.match(/data-direction="left"/g)||[]).length,1);
    }
  }
  assert.equal(count,45);
});

test('80 − 1 = 79 staggers labels vertically without changing x alignment',()=>{
  const e=numberLineExample({a:0,b:1});
  const start=attributes(e.svg,'data-label','start'),end=attributes(e.svg,'data-label','end');
  assert.notEqual(start.y,end.y);
  assert.equal(Number(start.x)-Number(end.x),21);
  assert.equal(e.decomposition,'1 + 0 = 1');
});

test('distance question shows only the two endpoints until the answer is revealed',()=>{
  const q=numberLineQuestion({a:2,b:4});
  assert.equal(q.start,82);
  assert.equal(q.end,78);
  assert.equal(q.distance,4);
  assert.equal(attributes(q.svg,'data-label','end').x,String(x(78)));
  assert.equal(attributes(q.svg,'data-label','start').x,String(x(82)));
  assert.ok(!q.svg.includes('data-part="whole"'));
  assert.ok(!q.svg.includes('data-part="remainder"'));
  assert.ok(!q.svg.includes('data-label="decomposition"'));
  assert.ok(!q.svg.includes('>4</text>'));
});

test('help triggers and timing are unchanged',()=>{
  for(const ms of [0,1000,4000,4001,5000])assert.equal(needsAnswerHelp(false,ms),true);
  assert.equal(needsAnswerHelp(true,1000),false);
  assert.equal(needsAnswerHelp(true,4000),false);
  assert.equal(needsAnswerHelp(true,4001),true);
});

test('invalid cards do not generate broken or unsafe SVG',()=>{
  for(const card of [null,{}, {a:-1,b:2},{a:2,b:2},{a:3,b:2},{a:0,b:10},{a:0.5,b:2},{a:'5',b:8}]){
    assert.throws(()=>numberLineExample(card),RangeError);
  }
});
