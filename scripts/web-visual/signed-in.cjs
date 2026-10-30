/* Signed-in visual check of the website at phone width, with sample data and no real backend.
   usage (engine webkit = Safari's engine, or chromium): VITE_SUPABASE_URL=https://yzvrujffiktfserrgkcb.supabase.co VITE_SUPABASE_PUBLISHABLE_KEY=visual-check npm run build
          npx vite preview --port 4173 &   then   node scripts/web-visual/signed-in.cjs <out dir> [width] [webkit|chromium]
   Every /api call and every Supabase call is answered by Playwright from mock-api.cjs; a fake session is placed in
   localStorage so the app starts signed in. Screenshots are the deliverable: look at every one before shipping. */
const pw=require('playwright');const fs=require('fs');const M=require('./mock-api.cjs');
const out=(process.argv[2]||'/tmp/web-visual')+'/';const width=Number(process.argv[3]||390);const engine=process.argv[4]||'webkit';
fs.mkdirSync(out,{recursive:true});
const json=(body,status=200)=>({status,contentType:'application/json',body:JSON.stringify(body)});
function ndjson(events){return {status:200,headers:{'Content-Type':'application/x-ndjson'},body:events.map(e=>JSON.stringify(e)).join('\n')+'\n'};}
const CL=(i,st,prop)=>({id:'cl'+i,manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US',domain:prop==='service_interval'?'maintenance':'specification',property:prop||'specification',statement:st,source_url:'https://example.invalid/manual.pdf',source_locator:'PDF page '+(100+i)+'; printed '+(98+i),status:'VERIFIED',has_conflict:false});
const CLAIMS=[CL(1,'Capacities / Engine oil: 1.10 l (1.16 qt.); Engine oil (SAE 10W/50). Applies to the US standard model named.'),CL(2,'Engine / Valve clearance / Intake at: 0.10 … 0.15 mm (0.0039 … 0.0059 in). Applies to the US standard model named.'),CL(3,'Engine / Valve clearance / Exhaust at: 0.20 … 0.25 mm (0.0079 … 0.0098 in). Applies to the US standard model named.'),CL(4,'Shock absorber / Riding sag: 105 mm. Applies to the US standard model named.'),CL(5,'Shock absorber / Static sag: 35 mm. Applies to the US standard model named.'),CL(6,'Fork / Compression damping / Standard: 12 clicks. Counted counterclockwise.'),CL(7,'Fork / Rebound damping / Standard: 18 clicks. Counted counterclockwise.'),CL(8,'Shock absorber / Rebound damping / Standard: 15 clicks. Counted counterclockwise.'),CL(9,'Chassis / Offroad tire pressure / front: 1.0 bar (15 psi). Applies to the US standard model named.'),CL(10,'Chassis tightening torques / Nut, rear wheel spindle (M20x1.5): 80 Nm (59 lbf ft). Applies to the US standard model named.','torque'),CL(11,'Chassis tightening torques / Screw, front brake caliper (M8): 25 Nm (18.4 lbf ft); Loctite® 243. Applies to the US standard model named.','torque'),CL(12,'Engine tightening torques / Spark plug (M10x1): 10 … 12 Nm (7.4 … 8.9 lbf ft). Applies to the US standard model named.','torque'),CL(13,'Service schedule / Change the engine oil and the oil filter: every 10 operating hours. From the manufacturer service schedule.','service_interval'),CL(14,'Engine / Spark plug: NGK LMAR8DI-10. Applies to the US standard model named.'),CL(18,'Service schedule / Check the fork bearing for play: every 45 operating hours; every 90 operating hours. From the manufacturer service schedule.','service_interval'),CL(19,'Service schedule / Check that the brake linings of the front brake are secured: once after 1 operating hour; every 15 operating hours; every 45 operating hours; every 90 operating hours; every 24 months. From the manufacturer service schedule.','service_interval'),CL(20,'Service schedule / Service the fork: every 45 operating hours; every 90 operating hours. From the manufacturer service schedule.','service_interval'),CL(21,'Service schedule / Service the fork.: every 45 operating hours; every 90 operating hours. From the manufacturer service schedule.','service_interval'),CL(16,'Engine oil requirements: Fully synthetic SAE10W/50; JASO T903 MA2.'),CL(17,'Service schedule / Change the engine oil and the oil filter, clean the oil screens: once after 1 operating hour; every 15 operating hours. From the manufacturer service schedule.','service_interval'),CL(15,'Capacities / Coolant: 1.20 l (1.27 qt.); Coolant. Applies to the US standard model named.')];
let sent=false;
function route(url,method,post){
 const u=new URL(url),p=u.pathname,q=u.searchParams;
 if(p==='/api/bikes')return json(method==='GET'?[M.bike,M.bike2]:{...M.bike});
 if(p==='/api/coverage')return json(M.coverage);
 if(p==='/api/entitlement')return json(M.entitlement);
 if(p==='/api/profile')return json(M.profile);
 if(p==='/api/profiles')return json({profile:M.profile,bikes:[{id:M.bike.id,label:'2025 KTM 450 SX-F',photos:[],sheet:'mine'}],posts:[],mine:true});
 if(p==='/api/conversations')return json(method==='GET'?(q.get('bike_id')===M.bike.id?[M.conversation]:[]):{...M.conversation,id:'44444444-4444-4444-8444-444444444444',title:(post&&post.title)||'New chat',mode:(post&&post.mode)||'ask'});
 if(p==='/api/messages'){const cid=q.get('conversation_id');return json((sent||cid===M.conversation.id)?M.messages.map(m=>({...m,conversation_id:cid})):[]);}
 if(p==='/api/chat'){sent=true;const m={...M.messages[1],id:'m-new',conversation_id:(post&&post.conversation_id)||M.conversation.id,created_at:new Date().toISOString()};return ndjson([{type:'status',stage:'reading'},{type:'draft',summary:M.answer.summary,answer:M.answer.answer.slice(0,120)},{type:'status',stage:'writing'},{type:'done',message:m}]);}
 if(p==='/api/services')return method==='GET'?json(M.services):json(method==='DELETE'?{ok:true}:{...M.services[0],id:'s-new'});
 if(p==='/api/service-plan')return json({items:M.plan,source:'manufacturer schedule'});
 if(p==='/api/setup-logs')return json(method==='GET'?M.setupLogs:{...M.setupLogs[0],id:'l-new'});
 if(p==='/api/events')return json(method==='GET'?M.events:{...M.events[0],id:'e-new'});
 if(p==='/api/posts')return json(method==='GET'?M.posts:{...M.posts[0],id:'p-new'});
 if(p.startsWith('/api/posts/'))return json([]);
 if(p==='/api/threads')return json(M.threads);
 if(p==='/api/thread')return json({rider:M.threads[0].rider,messages:[{id:'t1',body:'See you at Dade Saturday?',created_at:new Date(Date.now()-7200000).toISOString(),mine:false}]});
 if(p==='/api/comments')return json([]);
 if(p==='/api/parts/catalog')return json({catalog:{id:'pc',source:'KTM',source_url:'',scope_label:'',complete:true,assembly_count:8,part_count:300},assemblies:['FRONT FORK, TRIPLE CLAMP','SHOCK ABSORBER','SWING ARM','CYLINDER HEAD','CLUTCH','FRONT WHEEL','REAR BRAKE CALIPER','TANK, SEAT','HANDLEBAR, CONTROLS','EXHAUST SYSTEM','WP SHIMS FOR SETTING','TRANSMISSION II - COUNTERSHAFT'].map((n,i)=>({id:'a'+i,name:n,diagram_url:'',source_url:'',position:i}))});
 if(p==='/api/coaching')return json(M.coaching);
 if(p==='/api/race-checklist')return json(M.checklist);
 if(p==='/api/tracks')return json(M.tracks);
 if(p==='/api/photos')return json([]);
 if(p==='/api/garage-sharing')return json({show_on_profile:false,photo_ids:[],build_sheet_public:false});
 if(p==='/api/build-sheet')return json(null,404);
 if(p==='/api/claims')return json(CLAIMS);
 if(p==='/api/claims/search')return json(CLAIMS.filter(c=>c.statement.toLowerCase().includes((q.get('q')||'').toLowerCase().split(' ')[0])));
 if(p==='/api/parts-catalog'||p.startsWith('/api/parts'))return json(null,404);
 if(p==='/api/blocks')return json([]);
 if(p==='/api/reports')return json([]);
 if(p==='/api/preferences')return json({});
 return json([]);
}
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
 const tab=async(name)=>{await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('button',{name}).click();};
 await page.goto('http://localhost:4173/',{waitUntil:'networkidle'});
 await shot('01-home');await scroll(900);await shot('02-home-scrolled');await scroll(900);await shot('03-home-scrolled-2');await scroll(-3000);
 await tab('Chat');await shot('10-chat-welcome');
 const box=page.getByPlaceholder(/Ask about your bike/).first();await box.fill('What does high-speed compression actually do?');await shot('11-chat-typed');
 await page.getByRole('button',{name:'Send message'}).click();await page.waitForTimeout(1500);await shot('12-chat-answer');await scroll(600);await shot('13-chat-answer-scrolled');
 const chats=page.getByRole('button',{name:/Chats/}).first();if(await chats.count()){await chats.click();await shot('14-chats-sheet');const close=page.getByRole('button',{name:'Close'}).last();if(await close.isVisible().catch(()=>false))await close.click();await page.waitForTimeout(300);}
 await tab('Garage');await shot('20-garage');
 for(const [t,n] of [['Build sheet','21-garage-build'],['Photos','22-garage-photos'],['Coaching','23-garage-coaching']]){const bt=page.getByRole('tab',{name:t});if(await bt.count()){await bt.click();await shot(n);}}
 await tab('Community');await shot('30-community');
 await tab('Events');await shot('40-events');
 const menu=async(label,name)=>{await scroll(-5000);await page.waitForTimeout(400);await page.getByRole('button',{name:'Open menu'}).click();await page.waitForTimeout(300);await page.getByRole('button',{name:label}).first().click();await shot(name);};
 await menu(/Service log/,'50-service-log');await menu(/Messages/,'51-messages');await menu(/^Setup/,'52-setup-log');await menu(/Account/,'53-account');await scroll(700);await shot('54-account-scrolled');
 await menu(/Know-how/,'55-know-how');await menu(/Specs/,'56-specs');await scroll(700);await shot('56b-specs-scrolled');await page.getByRole('button',{name:/^Suspension/}).first().click().catch(()=>{});await shot('56c-specs-open');await scroll(1400);await shot('56d-parts');await scroll(-3000);await page.getByRole('tab',{name:/^Service/}).click().catch(()=>{});await page.getByRole('button',{name:/^Suspension/}).first().click().catch(()=>{});await scroll(500);await shot('56e-service');await menu(/Workshop/,'57-workshop');const job=page.locator('select').filter({hasText:/Choose a job/}).first();if(await job.count()){const v=await job.locator('option').nth(2).getAttribute('value');if(v){await job.selectOption(v);await shot('58-workshop-job');}}
 await tab('Home');const race=page.getByRole('button',{name:/Race day/}).first();if(await race.count()){await race.click();await shot('60-race-day-start');}
 console.log(JSON.stringify({errors,wide,shots:fs.readdirSync(out).length}));await b.close();
})().catch(e=>{console.error(e);process.exit(1);});
