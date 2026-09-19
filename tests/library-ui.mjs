// UI integration using real catalogue fixtures and a mocked transport.
// Public API access and database persistence are verified separately in library.test.mjs/library-regression.sql.
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/jacob/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const data=process.argv[2];if(!data)throw Error('Pass private data directory');
const fixture=JSON.parse(await fs.readFile(path.join(data,'ui-fixture.json'),'utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1100}});const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));
const items=[];
await page.route('http://library.test/**',async route=>{
 const req=route.request(),u=new URL(req.url()),p=decodeURIComponent(u.pathname),method=req.method();
 const json=v=>route.fulfill({contentType:'application/json',body:JSON.stringify(v)});
 if(p==='/api/config')return json({supabaseUrl:'https://fixture.invalid',supabaseAnonKey:'fixture'});
 if(p==='/api/library/bootstrap')return json(fixture);
 if(p.startsWith('/api/library/preview/')){const id=p.split('/').at(-1);return route.fulfill({contentType:'image/jpeg',body:await fs.readFile(path.join(data,'previews',id.replace(':','/')+'.jpg'))})}
 if(p==='/api/library/search'){requests.push(Object.fromEntries(u.searchParams));return json(fixture.search)}
 if(p.startsWith('/api/library/page/')&&method==='PATCH'){const body=req.postDataJSON(),row=fixture.search.items.find(x=>x.page_id===p.split('/').at(-1));Object.assign(row,body,{corrected:true});return json({ok:true})}
 if(p==='/api/library/filters'&&method==='POST'){fixture.filters.push({id:'11111111-1111-4111-8111-111111111111',...req.postDataJSON()});return json({ok:true})}
 if(p==='/api/library/collections'&&method==='POST'){fixture.collections.push({id:'22222222-2222-4222-8222-222222222222',...req.postDataJSON()});return json({ok:true})}
 if(p.endsWith('/items')&&method==='POST'){items.push(req.postDataJSON());return json({ok:true})}
 if(p.endsWith('/items'))return json(items);
 if(p.startsWith('/matematikbibliotek/')){const name=p.split('/').at(-1)||'index.html';return route.fulfill({contentType:name.endsWith('.js')?'application/javascript':name.endsWith('.css')?'text/css':'text/html',body:await fs.readFile(path.join('matematikbibliotek',name))})}
 return route.fulfill({status:404,body:''});
});
await page.goto('http://library.test/matematikbibliotek/');await page.locator('.card').first().waitFor();assert.equal(await page.locator('#login').count(),0);
await page.locator('.preview.ready').first().waitFor();assert.ok(await page.locator('.preview img').first().evaluate(img=>img.naturalWidth>0));
await page.locator('.preview.ready').first().click();assert.equal(await page.locator('#preview-dialog').isVisible(),true);await page.locator('#close-preview').click();
await page.locator('#grade').selectOption('3');await page.locator('#topic').selectOption('broeker');await page.locator('#difficulty').selectOption('let');await page.waitForFunction(()=>!document.querySelector('#result-count').hasAttribute('aria-busy'));
assert.ok(requests.some(r=>r.grade==='3'&&r.topic==='broeker'&&r.difficulty==='let'));
await page.locator('#view-pages').click();
await page.locator('.card').first().getByRole('button',{name:'Ret tags'}).click();await page.locator('#edit-summary').fill('Ændret beskrivelse: æ ø å');await page.locator('#edit-form').getByRole('button',{name:'Gem rettelser'}).click();await page.locator('#editor').waitFor({state:'hidden'});
page.once('dialog',d=>d.accept('Mine lette brøker'));await page.locator('#save-filter').click();await page.getByRole('button',{name:'Mine lette brøker'}).waitFor();
page.once('dialog',d=>d.accept('Fredagens opgaver'));await page.locator('#new-collection').click();await page.locator('#collection option', {hasText:'Fredagens opgaver'}).waitFor({state:'attached'});
await page.locator('.card').first().getByRole('button',{name:'＋ Gem'}).click();await page.locator('#add-form').getByRole('button',{name:'Tilføj',exact:true}).click();assert.equal(items.length,1);assert.ok(items[0].page_id);
await page.reload();await page.locator('.card').first().waitFor();assert.ok((await page.locator('.card').first().textContent()).includes('Ændret beskrivelse: æ ø å'));assert.equal(await page.getByRole('button',{name:'Mine lette brøker'}).count(),1);
await page.screenshot({path:path.join(data,'preview-library-desktop.png'),fullPage:true});
await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(data,'preview-library-mobile.png'),fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:['real page images','preview zoom','combined filter request','page view','edit dialog','saved filter reload','collection item','Danish text','mobile width','no browser errors'],transport:'fixture; DB and public API separately tested'}));await browser.close();
