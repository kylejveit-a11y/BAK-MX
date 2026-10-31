/* Signed-in visual check of the website at phone width, with sample data and no real backend.
   usage (engine webkit = Safari's engine, or chromium): VITE_SUPABASE_URL=https://yzvrujffiktfserrgkcb.supabase.co VITE_SUPABASE_PUBLISHABLE_KEY=visual-check npm run build
          npx vite preview --port 4173 &   then   node scripts/web-visual/signed-in.cjs <out dir> [width] [webkit|chromium]
   Every /api call and every Supabase call is answered by Playwright from mock-api.cjs; a fake session is placed in
   localStorage so the app starts signed in. Screenshots are the deliverable: look at every one before shipping. */
const pw=require('playwright');const fs=require('fs');const M=require('./mock-api.cjs');
const out=(process.argv[2]||'/tmp/web-visual')+'/';const width=Number(process.argv[3]||390);const engine=process.argv[4]||'webkit';
fs.mkdirSync(out,{recursive:true});
const json=(body,status=200)=>({status,contentType:'application/json',body:JSON.stringify(body)});
function route(url,method,post){const u=new URL(url);const r=M.respond(u.pathname,u.searchParams,method,post);return r.events?ndjson(r.events):json(r.body,r.status);}
function ndjson(events){return {status:200,headers:{'Content-Type':'application/x-ndjson'},body:events.map(e=>JSON.stringify(e)).join('\n')+'\n'};}
(async()=>{
 const b=await pw[engine].launch();
 const ctx=await b.newContext({viewport:{width,height:844},deviceScaleFactor:2,isMobile:width<800,hasTouch:width<800});
 const session={access_token:'visual-check',refresh_token:'visual-check',token_type:'bearer',expires_in:3600*24*365,expires_at:Math.floor(Date.now()/1000)+3600*24*365,user:{id:M.USER,aud:'authenticated',role:'authenticated',email:'visual@example.invalid',app_metadata:{},user_metadata:{},created_at:new Date().toISOString()}};
 await ctx.addInitScript(({s,user})=>{localStorage.setItem('sb-yzvrujffiktfserrgkcb-auth-token',JSON.stringify(s));localStorage.setItem('bakmx:active-bike:'+user,'11111111-1111-4111-8111-111111111111');localStorage.setItem('bakmx:ai-consent:v2:'+user,'yes');},{s:session,user:M.USER});
 const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>{errors.push(String(e));console.log('PAGEERROR',String(e));});page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,300));});
 await page.route(/supabase\.co/,r=>{const u=r.request().url();if(u.includes('/auth/v1/user'))return r.fulfill(json(session.user));if(u.includes('/auth/v1/token'))return r.fulfill(json(session));return r.fulfill(json({}));});
 await page.route(/\/api\//,r=>{const req=r.request();let post=null;try{post=req.postDataJSON();}catch{}try{return r.fulfill(route(req.url(),req.method(),post));}catch(e){console.log('ROUTE FAIL',req.url(),String(e));return r.fulfill(json([]));}});
 const scroll=async(dy)=>{await page.evaluate(y=>window.scrollBy({top:y,behavior:'instant'}),dy);await page.waitForTimeout(350);};
 const window_w=width;const wide=[];const shot=async(name)=>{await page.waitForTimeout(500);const w=await page.evaluate(()=>document.documentElement.scrollWidth);if(w>window_w)wide.push(name+':'+w);await page.screenshot({path:out+name+'.png'});};
 const ALIAS={Chat:'Ask BAK',Home:'Overview'};const pick=async(label)=>{const rx=label instanceof RegExp?label:new RegExp('^'+label);const prim=page.getByRole('navigation',{name:'Primary'}).getByRole('button',{name:rx});if(await prim.first().isVisible().catch(()=>false))return prim.first().click();const om=page.getByRole('button',{name:'Open menu'});const more=page.getByRole('navigation',{name:'Primary'}).getByRole('button',{name:/^More/});if(await om.isVisible().catch(()=>false)){await om.click();await page.waitForTimeout(300);}else if(await more.isVisible().catch(()=>false)){await more.click();await page.waitForTimeout(300);}return page.getByRole('button',{name:rx}).last().click();};
 const tab=async(name)=>{const nav=page.getByRole('navigation',{name:'Mobile navigation'});if(await nav.isVisible().catch(()=>false))return nav.getByRole('button',{name}).click();const alt=ALIAS[name];if(alt&&await page.getByRole('navigation',{name:'Primary'}).getByRole('button',{name:new RegExp('^'+alt)}).first().isVisible().catch(()=>false))return pick(alt);return pick(name);};
 await page.goto('http://localhost:4173/',{waitUntil:'networkidle'});
 await shot('01-home');await scroll(900);await shot('02-home-scrolled');await scroll(900);await shot('03-home-scrolled-2');await scroll(-3000);
 await tab('Chat');await shot('10-chat-welcome');
 const box=page.getByPlaceholder(/Ask about your bike/).first();await box.fill('What does high-speed compression actually do?');await shot('11-chat-typed');
 await page.getByRole('button',{name:'Send message'}).click();await page.waitForTimeout(1500);await shot('12-chat-answer');await scroll(600);await shot('13-chat-answer-scrolled');
 const chats=page.getByRole('button',{name:/Chats/}).first();if(await chats.count()){await chats.click();await shot('14-chats-sheet');const close=page.getByRole('button',{name:'Close'}).last();if(await close.isVisible().catch(()=>false))await close.click();await page.waitForTimeout(300);}
 await tab('Garage');await shot('20-garage');await scroll(1100);await shot('20b-garage-overview');await scroll(-3000);
 for(const [t,n] of [['Build sheet','21-garage-build'],['Photos','22-garage-photos'],['Coaching','23-garage-coaching']]){const bt=page.getByRole('tab',{name:t});if(await bt.count()){await bt.click();await shot(n);}}
 await tab('Community');await shot('30-community');
 await tab('Events');await shot('40-events');
 const menu=async(label,name)=>{await scroll(-5000);await page.waitForTimeout(400);await pick(label);await shot(name);};
 await menu(/Service log/,'50-service-log');await menu(/Messages/,'51-messages');await menu(/^Setup/,'52-setup-log');await menu(/Account/,'53-account');await scroll(700);await shot('54-account-scrolled');
 await menu(/Know-how/,'55-know-how');await menu(/Specs/,'56-specs');await scroll(700);await shot('56b-specs-scrolled');await page.getByRole('button',{name:/^Suspension/}).first().click().catch(()=>{});await shot('56c-specs-open');await scroll(1400);await shot('56d-parts');await scroll(-3000);await page.getByRole('tab',{name:/^Service/}).click().catch(()=>{});await page.getByRole('button',{name:/^Suspension/}).first().click().catch(()=>{});await scroll(500);await shot('56e-service');await menu(/Workshop/,'57-workshop');const job=page.locator('select').filter({hasText:/Choose a job/}).first();if(await job.count()){const v=await job.locator('option').nth(2).getAttribute('value');if(v){await job.selectOption(v);await shot('58-workshop-job');}}
 await tab('Home');const race=page.getByRole('button',{name:/Race day/}).first();if(await race.count()){await race.click();await shot('60-race-day-start');}
 console.log(JSON.stringify({errors,wide,shots:fs.readdirSync(out).length}));await b.close();
})().catch(e=>{console.error(e);process.exit(1);});
