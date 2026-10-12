const {chromium}=require('playwright');
const fs=require('node:fs/promises');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.SMFI_TEST_CHROMIUM||'/root/.cache/ms-playwright/chromium_headless_shell-1161/chrome-linux/headless_shell'});const context=await browser.newContext({viewport:{width:1500,height:1000}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let remote=null,puts=0;
 await context.route('**/*',async route=>{
  const u=new URL(route.request().url()),p=decodeURIComponent(u.pathname);
  if(u.hostname!=='eastwood451.com')return route.abort();
  if(p==='/auth.js')return route.fulfill({contentType:'text/javascript',body:'// Authentication gate stub for isolated UI test only.'});
  if(p.startsWith('/api/smfi/')){
   const args=route.request().postDataJSON(),method=route.request().method();
   if(p.endsWith('/bootstrap')){remote={id:'test',owner_token:'a'.repeat(64),state:args.state,revision:1,connected:false};return route.fulfill({json:remote});}
   if(p.endsWith('/workspace')&&method==='GET')return route.fulfill({json:remote});
   if(p.endsWith('/workspace')&&method==='PUT'){if(args.expected_revision!==remote.revision)return route.fulfill({status:409,json:{error_description:'Conflict'}});remote={...remote,state:args.state,revision:remote.revision+1};puts++;return route.fulfill({json:remote});}
   if(p.endsWith('/history'))return route.fulfill({json:[]});
   return route.fulfill({status:404,json:{error_description:'Not found'}});
  }
  let filename=path.join(process.cwd(),p);if(p.endsWith('/'))filename=path.join(filename,'index.html');
  try{const body=await fs.readFile(filename);const ext=path.extname(filename);await route.fulfill({body,contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'})[ext]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:'Not found'});}
 });
 await page.goto('https://eastwood451.com/SMFI%20-%20Nested%20Actor%20-%20Antigravity/');
 await page.locator('#smfiChatGPT').waitFor();
 assert.equal(await page.locator('#smfiSyncResolve').isVisible(),false);
 const original=await page.evaluate(()=>window.smfiDiagram.exportState());
 const {describe}=await import('../../supabase/functions/smfi-mcp/model.js');
 const serverView=describe(original),browserView=await page.evaluate(()=>getFullState());
 assert.deepEqual(Object.keys(serverView.holons).sort(),Object.keys(browserView.holons).sort());
 for(const [key,h] of Object.entries(serverView.holons))assert.equal(h.notation,browserView.holons[key].notation);
 await page.locator('#smfiChatGPT').click();
 await page.waitForFunction(()=>document.getElementById('smfiChatGPT').textContent==='ChatGPT ✓');
 // AI change arrives through the same synced state the live endpoint will return.
 remote.state.holonNotes['person_line/operator/main']='AI note: <img src=x onerror="window.INJECTED=true">';remote.revision++;remote.connected=true;
 await page.waitForFunction(()=>window.smfiDiagram.exportState().holonNotes['person_line/operator/main']?.startsWith('AI note:'));
 assert.equal(await page.evaluate(()=>window.INJECTED),undefined);
 assert.ok(await page.locator('[data-hkey="person_line/operator/main"]').textContent().then(t=>t.includes('<img')));
 await page.locator('[data-hkey="person_line/operator/main"]').click();
 await page.locator('#detailTextarea').fill('Browser note');
 await page.waitForFunction(()=>document.getElementById('smfiSyncStatus').textContent==='Synkroniseret med ChatGPT');
 await new Promise(resolve=>setTimeout(resolve,2300));
 assert.equal(remote.state.holonNotes['person_line/operator/main'],'Browser note');
 const putCount=puts;await new Promise(resolve=>setTimeout(resolve,2400));assert.equal(puts,putCount,'no endless saves due to key order');
 await page.screenshot({path:'/tmp/smfi-mcp-ui.png',fullPage:false});
 await page.reload();await page.waitForFunction(()=>window.smfiDiagram?.exportState().holonNotes['person_line/operator/main']==='Browser note');
 assert.deepEqual(errors,[]);
 await browser.close();console.log('PASS: browser rendering, canonical holon keys, AI→UI, UI→server, XSS escaping, stable sync, reload recovery.');
})().catch(error=>{console.error(error);process.exit(1);});
