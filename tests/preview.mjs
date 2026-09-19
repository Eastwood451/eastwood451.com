import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/jacob/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.argv[2]||'https://matematikbibliotek-preview.eastwood451-com.pages.dev';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const response=await page.goto(base+'/matematikbibliotek/',{waitUntil:'networkidle'});assert.equal(response.status(),200);assert.ok(response.headers()['content-security-policy']?.includes("frame-ancestors 'none'"));
const denied=await page.evaluate(async()=>{const out=[];for(const p of ['search','bootstrap','preview/'+'a'.repeat(64)+':1']){const r=await fetch('/api/library/'+p);out.push({route:p,status:r.status,cache:r.headers.get('cache-control')})}return out});for(const r of denied){assert.equal(r.status,401);assert.match(r.cache,/no-store/)}
assert.equal(await page.locator('#login').isVisible(),true);assert.equal(await page.locator('#login-message').textContent(),'');assert.deepEqual(errors,[]);
await page.screenshot({path:'E:/Codex @Barracuda/Matematikbibliotek-data/preview-login.png',fullPage:true});
await page.goto(base+'/');assert.equal(await page.locator('a[href="matematikbibliotek/"]').count(),1);
console.log(JSON.stringify({base,title:'Matematikbiblioteket',loginVisible:true,anonymousApi:denied,libraryCsp:true,homepageLink:true,errors}));await browser.close();
