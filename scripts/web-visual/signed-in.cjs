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
 if(p==='/api/parts/catalog')return json({catalog:null,assemblies:[]});
 if(p==='/api/coaching')return json(M.coaching);
 if(p==='/api/race-checklist')return json(M.checklist);
 if(p==='/api/tracks')return json(M.tracks);
 if(p==='/api/photos')return json([]);
 if(p==='/api/garage-sharing')return json({show_on_profile:false,photo_ids:[],build_sheet_public:false});
 if(p==='/api/build-sheet')return json(null,404);
 if(p==='/api/claims'||p==='/api/specs')return json([]);
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
 const shot=async(name)=>{await page.waitForTimeout(500);await page.screenshot({path:out+name+'.png'});};
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
 await menu(/Know-how/,'55-know-how');await menu(/Specs/,'56-specs');
 await tab('Home');const race=page.getByRole('button',{name:/Race day/}).first();if(await race.count()){await race.click();await shot('60-race-day-start');}
 console.log(JSON.stringify({errors,shots:fs.readdirSync(out).length}));await b.close();
})().catch(e=>{console.error(e);process.exit(1);});
