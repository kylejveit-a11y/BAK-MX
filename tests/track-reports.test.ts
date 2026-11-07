import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {readFile,readdir} from 'node:fs/promises';
import {aggregateReports,anonymousNote,addDays,reportSummaryLine,reportTrackPicks,rodeTrackMention,tagProblem,toggleTag,REPORT_TAGS,REPORT_GROUPS} from '../shared/track-reports.ts';
import {trackReportSchema,handleTrackReports,recentRiderReports} from '../server/track-reports.ts';
import {trackContext} from '../server/tracks.ts';

const today=new Date().toISOString().slice(0,10);
const ago=(n:number)=>addDays(today,-n);
const me='00000000-0000-4000-8000-0000000000a1',other='00000000-0000-4000-8000-0000000000b2',blocked='00000000-0000-4000-8000-0000000000c3';

// ------------------------------------------------------------------ a tiny stand-in for the Supabase query builder
type Q={table:string;op:string;cols?:string;opts?:Record<string,unknown>;row?:Record<string,unknown>;upsert?:Record<string,unknown>;filters:[string,string,unknown][];single:boolean};
type Result={data?:unknown;error?:unknown;count?:number};
function fakeDb(answer:(q:Q)=>Result){
 const calls:Q[]=[];
 const db={calls,from(table:string){
  const q:Q={table,op:'',filters:[],single:false};calls.push(q);
  const b:any={
   select(cols?:string,opts?:Record<string,unknown>){if(!q.op)q.op='select';q.cols=cols;if(opts)q.opts=opts;return b;},
   upsert(row:Record<string,unknown>,opts:Record<string,unknown>){q.op='upsert';q.row=row;q.upsert=opts;return b;},
   insert(row:Record<string,unknown>){q.op='insert';q.row=row;return b;},
   delete(){q.op='delete';return b;},
   then(ok:(r:unknown)=>void,fail:(e:unknown)=>void){try{const r=answer(q);ok({data:r.data??null,error:r.error??null,count:r.count});}catch(e){fail(e);}},
  };
  for(const f of ['eq','gte','lte','in','is','or','order','limit'])b[f]=(col:string,val:unknown)=>{q.filters.push([f,col,val]);return b;};
  for(const f of ['maybeSingle','single'])b[f]=()=>{q.single=true;return b;};
  return b;
 }};
 return db;
}
const has=(q:Q,f:string,col:string,val?:unknown)=>q.filters.some(([a,b,c])=>a===f&&b===col&&(val===undefined||c===val));
const post=(body:unknown)=>new Request('http://x/api/track-reports',{method:'POST',body:JSON.stringify(body)});
const base={track_id:'dade-city-mx',ridden_on:today,tags:['sand','watered','ruts_deep']};

// ------------------------------------------------------------------ chips and validation
test('chips: one pick for dirt, moisture and prep; surface takes several; deep and light ruts swap',()=>{
 assert.deepEqual(toggleTag(['sand'],'clay'),['clay']);
 assert.deepEqual(toggleTag(['sand','ruts_deep'],'braking_bumps'),['sand','ruts_deep','braking_bumps']);
 assert.deepEqual(toggleTag(['ruts_deep'],'ruts_light'),['ruts_light']);
 assert.deepEqual(toggleTag(['sand','watered'],'watered'),['sand']);
 assert.equal(tagProblem([]),'Tap at least one chip first.');
 assert.match(tagProblem(['sand','clay'])!,/one dirt/);
 assert.match(tagProblem(['ruts_deep','ruts_light'])!,/deep or light/);
 assert.equal(REPORT_TAGS.length,19);
 assert.deepEqual(REPORT_GROUPS.map(g=>g.label),['Dirt','Moisture','Surface','Prep']);
});

test('route validation: known chips only, a recent day, bounded pressures, no ownership fields',()=>{
 const ok=trackReportSchema.parse({...base,tags:['ruts_deep','watered','sand']});
 assert.deepEqual(ok.tags,['sand','watered','ruts_deep'],'tags come back in card order');
 assert.equal(ok.note,'');assert.equal(ok.front_psi,null);assert.equal(ok.setup_log_id,null);
 const bad=(patch:Record<string,unknown>)=>trackReportSchema.safeParse({...base,...patch}).success;
 assert.equal(bad({tags:[]}),false);
 assert.equal(bad({tags:['sand','loam']}),false);
 assert.equal(bad({tags:['gravel']}),false);
 assert.equal(bad({ridden_on:addDays(today,3)}),false,'not ahead');
 assert.equal(bad({ridden_on:ago(31)}),false,'not stale');
 assert.equal(bad({ridden_on:ago(30)}),true);
 assert.equal(bad({ridden_on:'2026-02-30'}),false);
 assert.equal(bad({rear_psi:45}),false);
 assert.equal(bad({rear_psi:12.5,front_psi:13}),true);
 assert.equal(bad({note:'x'.repeat(501)}),false);
 assert.equal(bad({setup_log_id:'00000000-0000-4000-8000-000000000009',setup_text:'stock'}),false,'link or text, not both');
 assert.equal(bad({user_id:other}),false,'no ownership injection');
 assert.equal(bad({removed_at:null}),false,'riders cannot touch moderation');
});

test('POST saves the rider’s own report once per track and day, only on listed tracks, with a daily cap',async()=>{
 let listed=true,count=0;
 const db=fakeDb(q=>{
  if(q.table==='tracks')return {data:listed?{id:'dade-city-mx'}:null};
  if(q.table==='track_reports'&&q.op==='select')return {count};
  if(q.table==='track_reports'&&q.op==='upsert')return {data:{id:'r1',...q.row}};
  throw new Error('unexpected '+q.table);
 });
 const res=await handleTrackReports(post({...base,note:'Deep in the back section'}),new URL('http://x/api/track-reports'),'/api/track-reports','POST',db as never,me);
 assert.equal(res!.status,201);
 const up=db.calls.find(c=>c.op==='upsert')!;
 assert.equal(up.row!.user_id,me);assert.deepEqual(up.upsert,{onConflict:'user_id,track_id,ridden_on'});
 assert.ok(has(db.calls.find(c=>c.table==='tracks')!,'eq','listed',true),'reference-only tracks are refused');
 listed=false;
 await assert.rejects(handleTrackReports(post(base),new URL('http://x/api/track-reports'),'/api/track-reports','POST',db as never,me),/Pick one of BAK’s tracks/);
 listed=true;count=20;
 await assert.rejects(handleTrackReports(post(base),new URL('http://x/api/track-reports'),'/api/track-reports','POST',db as never,me),(e:any)=>e.status===429);
});

test('POST refuses a setup entry that is not the rider’s own',async()=>{
 const db=fakeDb(q=>q.table==='tracks'?{data:{id:'dade-city-mx'}}:q.table==='setup_logs'?{data:null}:{count:0});
 await assert.rejects(handleTrackReports(post({...base,setup_log_id:'00000000-0000-4000-8000-000000000009'}),new URL('http://x/api/track-reports'),'/api/track-reports','POST',db as never,me),/Setup entry not found/);
});

test('summary for the track screen: counts through the service role, no notes, never a reference-only track',async()=>{
 const rows=[{user_id:other,track_id:'dade-city-mx',ridden_on:ago(1),tags:['sand','ruts_deep'],note:'Call me @fastguy, ruts were huge'}];
 const admin=fakeDb(q=>q.table==='track_reports'?{data:rows}:{data:[]});
 let listed=true;const db=fakeDb(()=>({data:listed?{id:'dade-city-mx'}:null}));
 const url=new URL('http://x/api/track-reports/summary?track_id=dade-city-mx');
 const res=await handleTrackReports(new Request(url),url,'/api/track-reports/summary','GET',db as never,me,()=>admin as never);
 const body=await res!.json();
 assert.equal(body.last_7_days.reports,1);assert.deepEqual(body.recent_notes,[]);assert.ok(!JSON.stringify(body).includes(other));
 listed=false;
 await assert.rejects(handleTrackReports(new Request(url),url,'/api/track-reports/summary','GET',db as never,me,()=>admin as never),/Track not found/);
});

// ------------------------------------------------------------------ adding reports up
test('aggregation: 7/30/90-day counts in riders’ words, latest notes with dates and no names, blocks left out',()=>{
 const rows=[
  {user_id:other,ridden_on:ago(1),tags:['sand','watered','ruts_deep'],note:'Ruts got deep by moto 2. Text me 813-555-1212 or @mxjoe',rear_psi:12,front_psi:13},
  {user_id:me,ridden_on:ago(3),tags:['sand','ruts_deep','braking_bumps'],note:'',rear_psi:13},
  {user_id:other,ridden_on:ago(12),tags:['sand','dry'],note:'Dusty, see www.example.com',rear_psi:'14'},
  {user_id:other,ridden_on:ago(60),tags:['clay','tacky'],note:'Tacky and perfect'},
  {user_id:blocked,ridden_on:ago(2),tags:['hard_pack'],note:'Blocked rider’s note'},
  {user_id:other,ridden_on:ago(120),tags:['mixed'],note:'Too old'},
 ];
 const r=aggregateReports(rows,today,{hidden:new Set([blocked])})!;
 assert.equal(r.latest,ago(1));
 assert.equal(r.last_7_days.reports,2);
 assert.deepEqual(r.last_7_days.tags,{sand:2,'deep ruts':2,watered:1,'braking bumps':1});
 assert.equal(r.last_30_days.reports,3);assert.equal(r.last_30_days.tags.sand,3);assert.equal(r.last_30_days.since,ago(30));
 assert.equal(r.last_90_days.reports,4);assert.equal(r.last_90_days.tags.clay,1);
 assert.ok(!('hard-pack' in r.last_90_days.tags),'blocked riders are left out');
 assert.deepEqual(r.tire_pressure_30_days,{reports:3,front_psi_median:13,rear_psi_median:13});
 assert.equal(r.recent_notes.length,3);
 assert.deepEqual(r.recent_notes.map(n=>n.date),[ago(1),ago(12),ago(60)]);
 assert.equal(r.recent_notes[0].note,'Ruts got deep by moto 2. Text me [number] or [rider]');
 assert.equal(r.recent_notes[1].note,'Dusty, see [link]');
 assert.ok(!JSON.stringify(r).includes(other)&&!JSON.stringify(r).includes(me),'no rider ids');
 assert.equal(aggregateReports([{ridden_on:ago(100),tags:['sand']}],today),null);
 assert.equal(reportSummaryLine(r),'Riders this month (3 reports): sand 3, deep ruts 2, watered 1, dry 1');
 assert.equal(anonymousNote('email me at joe@example.com'),'email me at [email]');
});

test('the service-role read hides blocks either way and survives a failed read',async()=>{
 const admin=fakeDb(q=>q.table==='user_blocks'?{data:[{blocker_id:me,blocked_id:blocked},{blocker_id:other,blocked_id:me}]}:{data:[
  {user_id:other,track_id:'t1',ridden_on:ago(1),tags:['sand']},{user_id:blocked,track_id:'t1',ridden_on:ago(1),tags:['clay']},{user_id:'x',track_id:'t1',ridden_on:ago(1),tags:['loam']}]});
 const m=await recentRiderReports(admin as never,['t1','t2'],me);
 assert.deepEqual(m.get('t1')!.last_7_days.tags,{loam:1});assert.equal(m.has('t2'),false);
 const broken=fakeDb(()=>{throw new Error('down');});
 assert.equal((await recentRiderReports(broken as never,['t1'],me)).size,0);
});

test('Ask BAK’s track profile carries recent_rider_reports with dates',async()=>{
 const profile={id:'dade-city-mx',name:'Dade City MX',aliases:[],city:'Dade City',state:'FL',status:'open',access:'public',types:[],tracks_on_site:[],soil:{},layout:{},conditions:{},rider_reports:[],confidence:'medium',gaps:[],elevation_ft:100};
 const db=fakeDb(q=>q.table==='races'?{data:[]}:q.cols?.startsWith('id,name,aliases')?{data:[profile]}:{data:[profile]});
 const admin=fakeDb(q=>q.table==='user_blocks'?{data:[]}:{data:[{user_id:other,track_id:'dade-city-mx',ridden_on:ago(2),tags:['sand','watered'],note:'Watered heavy before first practice'}]});
 const [p]=await trackContext(db as never,me,['how should I set up for Dade City MX'],admin as never);
 assert.equal(p.recent_rider_reports!.last_7_days.reports,1);
 assert.deepEqual(p.recent_rider_reports!.recent_notes,[{date:ago(2),note:'Watered heavy before first practice'}]);
 const [plain]=await trackContext(db as never,me,['how should I set up for Dade City MX']);
 assert.equal(plain.recent_rider_reports,undefined);
});

// ------------------------------------------------------------------ picking the track, and spotting it in chat
const dir=[
 {id:'dade-city-mx',name:'Dade City MX',city:'Dade City',state:'FL',aliases:[],weather:true,lat:28.36,lng:-82.19},
 {id:'gatorback-cycle-park',name:'Gatorback Cycle Park',city:'Gainesville',state:'FL',aliases:['Gatorback'],weather:true,lat:29.65,lng:-82.32},
 {id:'brooksville-mx',name:'Brooksville MX',city:'Brooksville',state:'FL',aliases:[],weather:true,lat:28.55,lng:-82.39},
 {id:'far-away',name:'Far Away MX',city:'Austin',state:'TX',aliases:[],weather:true,lat:30.27,lng:-97.74},
];
test('picks: recent tracks first, then the nearest to where the rider rides',()=>{
 assert.deepEqual(reportTrackPicks(dir,['dade city mx']).map(t=>t.id),['dade-city-mx','brooksville-mx','gatorback-cycle-park']);
 assert.deepEqual(reportTrackPicks(dir,['Gatorback','Dade City MX','Somewhere unknown']).map(t=>t.id).slice(0,2),['gatorback-cycle-park','dade-city-mx']);
 assert.deepEqual(reportTrackPicks(dir,[]),[]);
});
test('chat: “rode X today/yesterday” offers the card; plans and questions do not',()=>{
 assert.deepEqual(rodeTrackMention('Rode Dade City today, front pushed in the sand',dir,today)?.track.id,'dade-city-mx');
 assert.equal(rodeTrackMention('raced gatorback yesterday and the rear kicked',dir,today)?.day,ago(1));
 assert.equal(rodeTrackMention('going to Dade City today, what should I run?',dir,today),null);
 assert.equal(rodeTrackMention('Rode Dade City last month',dir,today),null);
 assert.equal(rodeTrackMention('Rode today, the front pushes',dir,today),null);
});

// ------------------------------------------------------------------ the migration, on real PostgreSQL
test('migration: riders write only their own rows on listed tracks, read only their own, and cannot touch moderation',async()=>{
 const db=new PGlite();
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth,public to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`);
  for(const file of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort())await db.exec(await readFile('supabase/migrations/'+file,'utf8'));
  // Re-running the new migration changes nothing and does not fail.
  await db.exec(await readFile('supabase/migrations/20261107120000_track_reports_how_it_rode.sql','utf8'));
  await db.exec(`insert into auth.users values('${me}'),('${other}');insert into public.tracks(id,name,state) values('open-mx','Open MX','FL');insert into public.tracks(id,name,state,listed) values('pro-farm','Pro Farm','FL',false);`);
  const as=(u:string)=>db.exec(`set role authenticated;set request.jwt.claim.sub='${u}';`);
  const day=today;
  await as(me);
  await db.exec(`insert into public.track_reports(user_id,track_id,ridden_on,tags,note,rear_psi) values('${me}','open-mx','${day}','{sand,watered}','Deep',12.5)`);
  // A re-save the way the server does it (upsert) replaces the day's report.
  await db.exec(`insert into public.track_reports(user_id,track_id,ridden_on,tags) values('${me}','open-mx','${day}','{clay}') on conflict(user_id,track_id,ridden_on) do update set tags=excluded.tags`);
  assert.deepEqual((await db.query<{tags:string[]}>(`select tags from public.track_reports`)).rows.map(r=>r.tags),[['clay']]);
  await assert.rejects(db.exec(`insert into public.track_reports(user_id,track_id,ridden_on,tags) values('${other}','open-mx','${day}','{sand}')`),'not for another rider');
  await assert.rejects(db.exec(`insert into public.track_reports(user_id,track_id,ridden_on,tags) values('${me}','pro-farm','${day}','{sand}')`),'not on a reference-only track');
  await assert.rejects(db.exec(`insert into public.track_reports(user_id,track_id,ridden_on,tags) values('${me}','open-mx','${ago(1)}','{gravel}')`),'known chips only');
  await assert.rejects(db.exec(`insert into public.track_reports(user_id,track_id,ridden_on,tags) values('${me}','open-mx','${ago(2)}','{}')`),'at least one chip');
  await assert.rejects(db.exec(`insert into public.track_reports(user_id,track_id,ridden_on,tags,rear_psi) values('${me}','open-mx','${ago(2)}','{sand}',60)`),'bounded pressure');
  await assert.rejects(db.exec(`update public.track_reports set removed_at=now()`),'moderation only');
  await as(other);
  assert.equal((await db.query(`select * from public.track_reports`)).rows.length,0,'other riders never read the row');
  await db.exec(`reset role;set role service_role;`);
  assert.equal((await db.query(`select * from public.track_reports`)).rows.length,1,'the server adds them up');
  await db.exec(`reset role;`);
 }finally{await db.close();}
});

test('the card’s draft becomes the same request body on both apps',async()=>{
 const {reportBody,emptyDraft}=await import('../shared/track-reports.ts');
 const d={...emptyDraft(today),trackId:'dade-city-mx',tags:['watered','sand'],rear:'12.5 psi',setupText:'  stock clickers '};
 const r=reportBody(d,today);
 assert.deepEqual(r.body,{track_id:'dade-city-mx',ridden_on:today,tags:['sand','watered'],tire:'',front_psi:null,rear_psi:12.5,setup_log_id:null,setup_text:'stock clickers',note:''});
 assert.equal(trackReportSchema.safeParse(r.body).success,true,'what the card sends, the route accepts');
 assert.equal(reportBody({...d,trackId:''},today).problem,'Pick one of BAK’s tracks to report on it.');
 assert.equal(reportBody({...d,tags:[]},today).problem,'Tap at least one chip first.');
 assert.match(reportBody({...d,front:'80'},today).problem!,/Front psi/);
 assert.equal(reportBody({...d,setupLogId:'00000000-0000-4000-8000-000000000009'},today).body!.setup_text,'','a linked entry wins over typed text');
});
