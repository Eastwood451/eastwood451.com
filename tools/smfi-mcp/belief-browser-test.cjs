const {chromium}=require('playwright');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const {validateState,mutate}=await import('../../supabase/functions/smfi-mcp/belief-model.js');
 const state=validateState({kind:'belief-map',activeMapId:'map1',maps:[{id:'map1',mapTitle:'Mit kort',mapNotes:'',slots:[{id:'t1',label:'Nu'}],nodes:[],edges:[]},{id:'map2',mapTitle:'Andet kort',mapNotes:'',slots:[{id:'t2',label:'Senere'}],nodes:[],edges:[]}]});
 const seed=mutate(state,'belief_edit_map',{map_id:'map1',actions:[{type:'create_node',node:{id:'a',title:'Observation',type:'evidence'}},{type:'create_node',node:{id:'b',title:'Fortolkning'}},{type:'create_node',node:{id:'child',parentId:'a',title:'Underholon'}},{type:'create_edge',edge:{id:'e',from:'a',to:'b',operator:'supports'}}]}).state;
 const browser=await chromium.launch({headless:true,executablePath:process.env.SMFI_TEST_CHROMIUM||'/root/.cache/ms-playwright/chromium_headless_shell-1161/chrome-linux/headless_shell'});
 const context=await browser.newContext({viewport:{width:1500,height:1000}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));let remote=null,puts=0;
 await context.addInitScript(seed=>{
  if(!localStorage.getItem('belief-test-seeded')){
   localStorage.setItem('smfi_belief_map_library',JSON.stringify(seed.maps));
   localStorage.setItem('smfi_suite_belief_map_state',JSON.stringify(seed.maps.find(m=>m.id===seed.activeMapId)));
   localStorage.setItem('belief-test-seeded','true');
  }
 },seed);
 await context.route('**/*',async route=>{
  const u=new URL(route.request().url()),p=decodeURIComponent(u.pathname);
  if(u.hostname==='unpkg.com'){
   const name=p.startsWith('/react-dom@')?'react-dom.js':p.startsWith('/react@')?'react.js':'babel.js';
   return route.fulfill({body:await fs.readFile((process.env.SMFI_BELIEF_VENDOR||'/tmp/smfi-belief-vendor')+'/'+name),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}});
  }
  if(u.hostname!=='eastwood451.com')return route.abort();
  if(p==='/auth.js')return route.fulfill({contentType:'text/javascript',body:'// Isolated UI fixture only.'});
  if(p.startsWith('/api/smfi/belief/')){
   const args=route.request().postDataJSON(),method=route.request().method();
   if(p.endsWith('/bootstrap')){remote={id:'test',owner_token:'a'.repeat(64),state:validateState(args.state),revision:1,connected:false};return route.fulfill({json:remote});}
   if(p.endsWith('/workspace')&&method==='GET')return route.fulfill({json:remote});
   if(p.endsWith('/workspace')&&method==='PUT'){if(args.expected_revision!==remote.revision)return route.fulfill({status:409,json:{error_description:'Conflict'}});remote={...remote,state:validateState(args.state),revision:remote.revision+1};puts++;return route.fulfill({json:remote});}
   if(p.endsWith('/history'))return route.fulfill({json:[]});
   if(p.endsWith('/register')){assert.deepEqual(args.redirect_uris,['https://grok.com/connectors-oauth-exchange-code/']);return route.fulfill({json:{client_id:'public-test-client'}});}
   if(p.endsWith('/consent')&&method==='GET')return route.fulfill({json:{client_name:'Grok',provider:'grok',scope:'belief:read belief:write'}});
   return route.fulfill({status:404,json:{error_description:'Not found'}});
  }
  let filename=path.join(process.cwd(),p);if(p.endsWith('/'))filename=path.join(filename,'index.html');
  try{await route.fulfill({body:await fs.readFile(filename),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'})[path.extname(filename)]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:'Not found'});}
 });
 await page.goto('https://eastwood451.com/Belief-map%20-%20Antigravity/Argument-mapper%20-%20codex/');
 await page.locator('#smfiChatGPT').waitFor();
 assert.equal((await page.evaluate(()=>window.smfiBeliefDiagram.exportState())).maps.length,2);
 await page.locator('#smfiChatGPT').click();await page.waitForFunction(()=>document.getElementById('smfiChatGPT').textContent==='AI ✓');
 const mutateRemote=(name,args)=>{remote.state=mutate(remote.state,name,args).state;remote.revision++;remote.connected=true;};
 mutateRemote('belief_edit_map',{map_id:'map1',actions:[{type:'update_node',node_id:'a',changes:{title:'AI observation',text:'<img src=x onerror="window.INJECTED=true">'}},{type:'update_node',node_id:'child',changes:{title:'Opdateret barn'}}]});
 await page.waitForFunction(()=>window.smfiBeliefDiagram.exportState().maps.find(m=>m.id==='map1').nodes[0].title==='AI observation');
 assert.ok(await page.getByText('AI observation',{exact:true}).count());assert.equal(await page.evaluate(()=>window.INJECTED),undefined);
 await page.locator('#root input').first().fill('Lokalt kortnavn');
 await page.waitForFunction(()=>document.getElementById('smfiSyncStatus').textContent==='Synkroniseret med AI');
 await page.waitForTimeout(2200);assert.equal(remote.state.maps.find(m=>m.id==='map1').mapTitle,'Lokalt kortnavn');
 assert.equal(remote.state.maps.find(m=>m.id==='map2').mapTitle,'Andet kort');
 const count=puts;await page.waitForTimeout(2400);assert.equal(puts,count,'No endless saves from derived children or timestamps');
 mutateRemote('belief_select_map',{map_id:'map2'});await page.waitForFunction(()=>window.smfiBeliefDiagram.exportState().activeMapId==='map2');
 assert.equal(await page.locator('#root input').first().inputValue(),'Andet kort');
 await page.reload();await page.locator('#smfiChatGPT').waitFor();await page.waitForFunction(()=>window.smfiBeliefDiagram.exportState().activeMapId==='map2');
 await page.screenshot({path:'/tmp/smfi-belief-ui.png'});
 const setup=await context.newPage();setup.on('pageerror',e=>errors.push(e.message));
 await setup.goto('https://eastwood451.com/SMFI_Suite/chatgpt.html?kind=belief');await setup.locator('#setup').waitFor();
 assert.equal(await setup.locator('#url').textContent(),'https://eastwood451.com/api/smfi/belief/mcp');
 await setup.locator('#grok-client').click();await setup.locator('#grok-config').waitFor();assert.equal(await setup.locator('#grok-id').textContent(),'public-test-client');
 await setup.goto('https://eastwood451.com/SMFI_Suite/chatgpt.html?kind=belief&request=test');await setup.locator('#consent').waitFor();
 assert.ok((await setup.locator('#client').textContent()).includes('Grok'));assert.ok((await setup.locator('#permissions').textContent()).includes('relationer'));
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: saved maps, AI→UI, nested children, UI→cloud, text escaping, stable sync, map switching, reload, Grok setup and consent.');
})().catch(e=>{console.error(e);process.exit(1);});
