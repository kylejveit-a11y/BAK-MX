import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {readFile,readdir} from 'node:fs/promises';
import {
 effectiveSettings,blockedBetween,validZone,zonedTime,localDay,eventReminderSlot,eventReminder,serviceDueItems,
 serviceNotifyAllowed,serviceNotification,scheduledNotifications,messageNotification,replyNotification,shouldNotifyRider,
 readTickets,deadFromReceipts,chunk,pushMessage,isExpoToken,SERVICE_REPEAT_MS,type ScheduleInput,
} from '../shared/notifications.ts';
import {parseNotificationLink,messageLink,serviceLink} from '../shared/notification-links.ts';
import {cronAuthorized,settingsSchema,deviceSchema} from '../server/notifications.ts';
import type {PlanItem} from '../shared/service-plan.ts';

const A='00000000-0000-4000-8000-0000000000a1',B='00000000-0000-4000-8000-0000000000b2',C='00000000-0000-4000-8000-0000000000c3';
const BIKE='00000000-0000-4000-8000-0000000000d4',EV='00000000-0000-4000-8000-0000000000e5';
const bike={id:BIKE,user_id:A,engine_hours:43,manufacturer:'KTM',model:'450 SX-F',model_year:2025,nickname:null};
const oilPlan:PlanItem[]=[{category:'Engine oil',every_hours:15,first_hours:null,task:'Change the engine oil',claim_id:'c1',note:null},{category:'Air filter',every_hours:5,first_hours:null,task:'Clean the air filter',claim_id:'c2',note:null}];
const svc=(o:Partial<{category:string;performed_at:string;engine_hours:number|null;next_due_hours:number|null;created_at:string}>)=>({user_id:A,bike_id:BIKE,category:'Engine oil',performed_at:'2026-10-01T00:00:00.000Z',engine_hours:30,next_due_hours:null,created_at:'2026-10-01T00:00:00.000Z',...o});

test('settings: on by default, service due follows the Remind me field until the rider chooses',()=>{
 assert.deepEqual(effectiveSettings(null,false),{messages:true,replies:true,events:true,service_due:false,service_due_follows_reminders:true});
 assert.equal(effectiveSettings(null,true).service_due,true);
 assert.equal(effectiveSettings({service_due:null,messages:false},true).service_due,true);
 assert.equal(effectiveSettings({messages:false},true).messages,false);
 assert.deepEqual(effectiveSettings({service_due:false},true),{messages:true,replies:true,events:true,service_due:false,service_due_follows_reminders:false});
 assert.equal(effectiveSettings({service_due:true},false).service_due,true);
});

test('service due: rider reminder on the latest entry, maker interval from the last log, soon and overdue',()=>{
 // Oil logged at 30 h with "next due at 45"; bike at 43 → 2 h to go (soon).
 let items=serviceDueItems(bike,null,[svc({next_due_hours:45})]);
 assert.deepEqual(items.map(i=>[i.category,i.left,i.stage]),[['Engine oil',2,'soon']]);
 // Not soon yet at 40 h on the bike (5 h to go).
 assert.equal(serviceDueItems({...bike,engine_hours:40},null,[svc({next_due_hours:45})]).length,0);
 // Overdue past the hour.
 assert.equal(serviceDueItems({...bike,engine_hours:46.2},null,[svc({next_due_hours:45})])[0].stage,'overdue');
 assert.equal(serviceDueItems({...bike,engine_hours:46.2},null,[svc({next_due_hours:45})])[0].left,-1.2);
 // A newer log of the same job replaces the old reminder: no nagging about a job already done.
 assert.equal(serviceDueItems(bike,null,[svc({next_due_hours:35}),svc({performed_at:'2026-10-20T00:00:00.000Z',engine_hours:36,next_due_hours:51})]).length,0);
 // Category names match case-insensitively for the replacement.
 assert.equal(serviceDueItems(bike,null,[svc({next_due_hours:35}),svc({category:'engine oil ',performed_at:'2026-10-20T00:00:00.000Z',engine_hours:36,next_due_hours:51})]).length,0);
 // Maker interval: oil every 15 h from the last log at 30 → due 45. Air filter never logged → left out.
 items=serviceDueItems(bike,oilPlan,[svc({})]);
 assert.deepEqual(items.map(i=>[i.category,i.due_at,i.left]),[['Engine oil',45,2]]);
 // The sooner of the two wins.
 assert.equal(serviceDueItems(bike,oilPlan,[svc({next_due_hours:44})])[0].due_at,44);
 // Hours unknown → nothing.
 assert.equal(serviceDueItems({...bike,engine_hours:null},oilPlan,[svc({next_due_hours:44})]).length,0);
 // Another bike's log does not count.
 assert.equal(serviceDueItems(bike,null,[svc({bike_id:'other',next_due_hours:44} as never)]).length,0);
});

test('service due: at most once per item per week',()=>{
 const now=new Date('2026-11-07T15:00:00Z'),subject=`service:${BIKE}:engine oil`;
 assert.equal(serviceNotifyAllowed(subject,new Map(),now),true);
 assert.equal(serviceNotifyAllowed(subject,new Map([[subject,new Date(now.getTime()-SERVICE_REPEAT_MS+60_000).toISOString()]]),now),false);
 assert.equal(serviceNotifyAllowed(subject,new Map([[subject,now.getTime()-SERVICE_REPEAT_MS]]),now),true);
 assert.equal(serviceNotifyAllowed(subject,new Map([['service:other:engine oil',now.toISOString()]]),now),true);
 const [item]=serviceDueItems(bike,null,[svc({next_due_hours:45})]);
 const n=serviceNotification(A,bike,item,now);
 assert.equal(n.title,'Engine oil due soon');
 assert.equal(n.body,'2025 KTM 450 SX-F: due at 45 h, 2 h to go.');
 assert.equal(n.subject,subject);
 assert.equal(n.dedupe_key,subject+':2026-11-07');
 assert.equal(n.link,serviceLink(BIKE));
});

test('time zones: wall-clock times convert across daylight saving',()=>{
 assert.equal(validZone('Mars/Base'),'America/New_York');
 assert.equal(validZone('America/Denver'),'America/Denver');
 // New York: EDT (UTC-4) on 1 Nov 2026 morning, EST (UTC-5) on 2 Nov.
 assert.equal(zonedTime(2026,10,31,18,0,'America/New_York').toISOString(),'2026-10-31T22:00:00.000Z');
 assert.equal(zonedTime(2026,11,2,7,0,'America/New_York').toISOString(),'2026-11-02T12:00:00.000Z');
 assert.equal(zonedTime(2026,11,8,7,0,'Europe/London').toISOString(),'2026-11-08T07:00:00.000Z');
 assert.equal(zonedTime(2026,7,4,7,0,'Australia/Sydney').toISOString(),'2026-07-03T21:00:00.000Z');
 assert.deepEqual(localDay(new Date('2026-11-08T03:00:00Z'),'America/Los_Angeles'),{y:2026,m:11,d:7});
});

test('event reminders: evening before and morning of, in the rider’s zone',()=>{
 // Saturday 14 Nov 2026, 9:00 in Tampa (EST, UTC-5) = 14:00Z.
 const ev={id:EV,title:'Practice night',starts_at:'2026-11-14T14:00:00.000Z',location_name:'Dade City'};
 const tz='America/New_York',at=(iso:string)=>eventReminderSlot(ev,tz,new Date(iso));
 assert.equal(at('2026-11-13T22:59:00Z'),null);          // 5:59 pm Friday
 assert.equal(at('2026-11-13T23:00:00Z'),'day_before');  // 6 pm Friday
 assert.equal(at('2026-11-14T11:59:00Z'),'day_before');  // 6:59 am Saturday
 assert.equal(at('2026-11-14T12:00:00Z'),'morning');     // 7 am Saturday
 assert.equal(at('2026-11-14T14:00:00Z'),null);          // started
 // The same instant is still too early for a rider in Los Angeles (3 pm there).
 assert.equal(eventReminderSlot(ev,'America/Los_Angeles',new Date('2026-11-13T23:00:00Z')),null);
 // Canceled or removed: nothing.
 assert.equal(eventReminderSlot({...ev,canceled_at:'2026-11-10T00:00:00Z'},tz,new Date('2026-11-14T12:30:00Z')),null);
 assert.equal(eventReminderSlot({...ev,removed_at:'2026-11-10T00:00:00Z'},tz,new Date('2026-11-14T12:30:00Z')),null);
 // Gate drops at 7:30 am: no morning reminder; the evening one runs until the start.
 const early={...ev,starts_at:'2026-11-14T12:30:00.000Z'};
 assert.equal(eventReminderSlot(early,tz,new Date('2026-11-14T12:10:00Z')),'day_before');
 // Wording follows the rider's calendar day.
 assert.equal(eventReminder(A,ev,'day_before',tz,new Date('2026-11-13T23:00:00Z')).title,'Tomorrow: Practice night');
 const morning=eventReminder(A,ev,'morning',tz,new Date('2026-11-14T12:00:00Z'));
 assert.equal(morning.title,'Today: Practice night');
 assert.equal(morning.body,'Starts 9:00 AM at Dade City.');
 assert.equal(morning.dedupe_key,`event:${EV}:morning`);
 // Across the DST change: event Sunday 1 Nov 2026 10:00 EST (15:00Z); the evening before is 6 pm EDT (22:00Z).
 const dst={...ev,starts_at:'2026-11-01T15:00:00.000Z'};
 assert.equal(eventReminderSlot(dst,tz,new Date('2026-10-31T21:59:00Z')),null);
 assert.equal(eventReminderSlot(dst,tz,new Date('2026-10-31T22:00:00Z')),'day_before');
 assert.equal(eventReminderSlot(dst,tz,new Date('2026-11-01T11:59:00Z')),'day_before');
 assert.equal(eventReminderSlot(dst,tz,new Date('2026-11-01T12:00:00Z')),'morning');
});

test('blocks: either direction stops messages, comments and event reminders',()=>{
 const blocks=[{blocker_id:A,blocked_id:B}];
 assert.equal(blockedBetween(blocks,A,B),true);
 assert.equal(blockedBetween(blocks,B,A),true);
 assert.equal(blockedBetween(blocks,A,C),false);
 const on=effectiveSettings(null,false);
 assert.equal(shouldNotifyRider('message',B,A,on,blocks),false);
 assert.equal(shouldNotifyRider('reply',A,B,on,blocks),false);
 assert.equal(shouldNotifyRider('message',C,A,on,blocks),true);
 assert.equal(shouldNotifyRider('message',A,A,on,[]),false);
 assert.equal(shouldNotifyRider('message',C,A,effectiveSettings({messages:false},false),[]),false);
 assert.equal(shouldNotifyRider('reply',C,A,effectiveSettings({messages:false},false),[]),true);
});

test('messages and comments say who, preview the text and open the right screen',()=>{
 const m=messageNotification(A,{user_id:B,handle:'rider_b',display_name:'Bee'},{id:'m1',body:'What   track\nare you at?'});
 assert.equal(m.title,'Bee');assert.equal(m.body,'What track are you at?');assert.equal(m.dedupe_key,'message:m1');
 assert.deepEqual(parseNotificationLink(m.link),{screen:'messages',with:B,handle:'rider_b',name:'Bee'});
 const r=replyNotification(A,{user_id:B,handle:'rider_b',display_name:''},{id:'c1',post_id:EV,body:'x'.repeat(300)});
 assert.equal(r.title,'@rider_b commented on your post');assert.equal(r.body.length,140);
 assert.deepEqual(parseNotificationLink(r.link),{screen:'community',post:EV});
 assert.deepEqual(parseNotificationLink(serviceLink(BIKE)),{screen:'service',bike:BIKE});
 assert.deepEqual(parseNotificationLink('bakmx://messages?with=not-a-uuid'),{screen:'messages',with:null,handle:'',name:''});
 assert.equal(parseNotificationLink('https://bakmx.com/messages'),null);
 assert.equal(messageLink(B),'bakmx://messages?with='+B);
});

test('a scheduled run: settings, reminders, weekly limit, time zones and blocks together',()=>{
 const now=new Date('2026-11-13T23:30:00Z'); // 6:30 pm Friday in New York
 const base:ScheduleInput={now,settings:new Map(),reminderUsers:new Set([A]),bikes:[bike],services:[svc({next_due_hours:45})],plans:new Map(),recentService:new Map(),
  events:[{id:EV,user_id:C,title:'Practice night',starts_at:'2026-11-14T14:00:00.000Z',location_name:'Dade City'}],
  rsvps:[{event_id:EV,user_id:A,status:'going'},{event_id:EV,user_id:B,status:'interested'}],zones:new Map([[A,'America/New_York'],[B,'America/Los_Angeles']]),blocks:[]};
 let out=scheduledNotifications(base);
 assert.deepEqual(out.map(n=>[n.user_id,n.kind]).sort(),[[A,'event_reminder'],[A,'service_due']]); // B is still at 3:30 pm
 // Rider turned service due off; event reminders off for A.
 out=scheduledNotifications({...base,settings:new Map([[A,{service_due:false,events:false}]])});
 assert.equal(out.length,0);
 // No Remind me hour set and no choice made: service due stays off.
 assert.equal(scheduledNotifications({...base,reminderUsers:new Set(),rsvps:[]}).length,0);
 // Already told this week.
 assert.equal(scheduledNotifications({...base,rsvps:[],recentService:new Map([[A,new Map([[`service:${BIKE}:engine oil`,'2026-11-10T00:00:00Z']])]])}).length,0);
 // Host blocked by the rider: no reminder for that host's event.
 assert.equal(scheduledNotifications({...base,reminderUsers:new Set(),blocks:[{blocker_id:A,blocked_id:C}]}).length,0);
 // Later that night B's evening also starts.
 out=scheduledNotifications({...base,now:new Date('2026-11-14T02:30:00Z'),reminderUsers:new Set()});
 assert.deepEqual(out.map(n=>n.user_id).sort(),[A,B]);
 // A non-RSVP status is ignored.
 assert.equal(scheduledNotifications({...base,reminderUsers:new Set(),rsvps:[{event_id:EV,user_id:A,status:'maybe'}]}).length,0);
});

test('Expo replies: tickets, dead tokens and receipts',()=>{
 const t1='ExponentPushToken[aaaaaaaaaaaa]',t2='ExponentPushToken[bbbbbbbbbbbb]',t3='ExponentPushToken[cccccccccccc]';
 assert.equal(isExpoToken(t1),true);assert.equal(isExpoToken('nope'),false);
 const out=readTickets([t1,t2,t3],{data:[{status:'ok',id:'tk1'},{status:'error',message:'x',details:{error:'DeviceNotRegistered'}},{status:'error',details:{error:'MessageRateExceeded'}}]});
 assert.deepEqual(out,{sent:[{token:t1,ticket:'tk1'}],dead:[t2],failed:[t3]});
 assert.deepEqual(readTickets([t1],{errors:[{code:'PUSH_TOO_MANY_EXPERIENCE_IDS'}]}),{sent:[],dead:[],failed:[t1]});
 assert.deepEqual(deadFromReceipts([{token:t1,ticket:'a'},{token:t2,ticket:'b'}],{data:{a:{status:'ok'},b:{status:'error',details:{error:'DeviceNotRegistered'}}}}),[t2]);
 assert.deepEqual(chunk([1,2,3,4,5],2),[[1,2],[3,4],[5]]);
 assert.equal(chunk(Array.from({length:250}),100).length,3);
 assert.deepEqual(pushMessage(t1,{id:'n1',title:'T',body:'B',link:'bakmx://events',kind:'event_reminder'}).data,{url:'bakmx://events',kind:'event_reminder',notification_id:'n1'});
});

test('cron needs the bearer secret; inputs are checked',()=>{
 const secret='s'.repeat(32);
 assert.equal(cronAuthorized('Bearer '+secret,secret),true);
 assert.equal(cronAuthorized('Bearer '+secret,undefined),false);
 assert.equal(cronAuthorized(null,secret),false);
 assert.equal(cronAuthorized('Bearer wrong',secret),false);
 assert.equal(cronAuthorized('Bearer short','short'),false);
 assert.throws(()=>settingsSchema.parse({time_zone:'Mars/Base'}));
 assert.deepEqual(settingsSchema.parse({service_due:null,time_zone:'America/New_York'}),{service_due:null,time_zone:'America/New_York'});
 assert.throws(()=>settingsSchema.parse({extra:true}));
 assert.throws(()=>deviceSchema.parse({token:'abc',platform:'ios'}));
 assert.equal(deviceSchema.parse({token:'ExponentPushToken[abcdefghijkl]',platform:'android'}).platform,'android');
});

test('migration: riders see and change only their own devices, settings and notifications',async()=>{
 const db=new PGlite();
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth,public to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`);
  for(const file of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort())await db.exec(await readFile('supabase/migrations/'+file,'utf8'));
  // Guarded: running it again changes nothing.
  await db.exec(await readFile('supabase/migrations/20261107180000_notifications.sql','utf8'));
  await db.exec(`insert into auth.users values('${A}'),('${B}');`);
  await db.exec(`set role service_role;insert into public.notifications(user_id,kind,title,dedupe_key) values('${A}','message','Bee','message:1'),('${B}','reply','Ay','comment:1');reset role;`);
  await assert.rejects(db.exec(`set role service_role;insert into public.notifications(user_id,kind,title,dedupe_key) values('${A}','message','again','message:1');`));
  await db.exec('reset role;');
  const as=async(u:string)=>db.exec(`reset role;set role authenticated;set request.jwt.claim.sub='${u}';`);
  await as(A);
  assert.equal((await db.query('select * from public.notifications')).rows.length,1);
  assert.equal((await db.query(`update public.notifications set read_at=now() returning id`)).rows.length,1);
  await assert.rejects(db.exec(`update public.notifications set title='x'`));
  await assert.rejects(db.exec(`insert into public.notifications(user_id,kind,title,dedupe_key) values('${A}','message','forged','x')`));
  await assert.rejects(db.exec(`delete from public.notifications`));
  await db.exec(`insert into public.push_devices(user_id,token,platform) values('${A}','ExponentPushToken[aaaaaaaaaaaa]','ios')`);
  await assert.rejects(db.exec(`insert into public.push_devices(user_id,token,platform) values('${B}','ExponentPushToken[bbbbbbbbbbbb]','ios')`));
  await db.exec(`insert into public.notification_preferences(user_id,messages) values('${A}',false)`);
  await assert.rejects(db.exec(`insert into public.notification_preferences(user_id,messages) values('${B}',false)`));
  await as(B);
  assert.equal((await db.query('select * from public.push_devices')).rows.length,0);
  assert.equal((await db.query('select * from public.notification_preferences')).rows.length,0);
  assert.equal((await db.query(`update public.push_devices set active=false returning id`)).rows.length,0);
  assert.equal((await db.query(`select * from public.notifications`)).rows.length,1);
  // Deleting the account removes that rider's rows.
  await db.exec(`reset role;delete from auth.users where id='${A}';`);
  assert.equal((await db.query('select * from public.push_devices')).rows.length,0);
  assert.equal((await db.query(`select * from public.notifications where user_id='${A}'`)).rows.length,0);
 }finally{await db.close();}
});

test('migration is non-destructive',async()=>{
 const sql=(await readFile('supabase/migrations/20261107180000_notifications.sql','utf8')).replace(/--.*$/gm,'');
 assert.doesNotMatch(sql,/\bdrop\b/i);
 assert.doesNotMatch(sql,/\bdelete\s+from\b/i);
 assert.doesNotMatch(sql,/\btruncate\b/i);
 assert.equal(sql.match(/create\s+(unique\s+)?(table|index)\s+(?!if not exists)/gi),null);
 assert.match(sql,/create policy/i);
});
