import type {SupabaseClient} from '@supabase/supabase-js';
import {timingSafeEqual} from 'node:crypto';
import {z} from 'zod';
import {adminDb,checked} from './database.ts';
import {HttpError,readJson,uuid} from './validation.ts';
import {buildServicePlan,type PlanItem} from '../shared/service-plan.ts';
import {exactBikeScope} from '../shared/bike-identity.ts';
import type {Bike} from '../shared/types.ts';
import {
 effectiveSettings,scheduledNotifications,messageNotification,replyNotification,shouldNotifyRider,validZone,
 pushMessage,chunk,readTickets,deadFromReceipts,isExpoToken,EXPO_PUSH_URL,EXPO_RECEIPTS_URL,SERVICE_REPEAT_MS,
 type NewNotification,type NotificationKind,type StoredSettings,type BlockRow,type ServiceRow,
} from '../shared/notifications.ts';

/** Notifications: the rider's settings, their phones' push tokens, the in-app list, the scheduled run (Vercel Cron)
 *  and the immediate sends for new messages and comments. Records are written with the service role; riders read and
 *  mark their own through row-level security. Sending never fails the request that caused it. */

type Db=SupabaseClient;
type Row=Record<string,any>;
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const zone=z.string().max(64).regex(/^[A-Za-z_]+(\/[A-Za-z0-9_+-]+){0,2}$/).refine(v=>validZone(v,'')===v,{message:'Unknown time zone'});
export const settingsSchema=z.object({messages:z.boolean().optional(),replies:z.boolean().optional(),events:z.boolean().optional(),service_due:z.boolean().nullable().optional(),time_zone:zone.optional()}).strict();
export const deviceSchema=z.object({token:z.string().trim().min(10).max(200).refine(isExpoToken,{message:'Not an Expo push token'}),platform:z.enum(['ios','android']),time_zone:zone.optional(),app_version:z.string().trim().max(40).optional()}).strict();
const readSchema=z.union([z.object({all:z.literal(true)}).strict(),z.object({ids:z.array(uuid).min(1).max(200)}).strict()]);
const SETTINGS_COLUMNS='messages,replies,events,service_due,time_zone';

async function hasServiceReminder(db:Db,user:string):Promise<boolean>{
 const rows=checked(await db.from('service_events').select('id').eq('user_id',user).not('next_due_hours','is',null).limit(1)) as Row[]|null;
 return !!rows?.length;
}
async function settingsFor(db:Db,user:string){
 const [row,reminder]=await Promise.all([db.from('notification_preferences').select(SETTINGS_COLUMNS).eq('user_id',user).maybeSingle().then(r=>checked(r) as Row|null),hasServiceReminder(db,user)]);
 return {...effectiveSettings(row as StoredSettings,reminder),time_zone:(row?.time_zone as string|null)??null};
}

export async function handleNotifications(req:Request,path:string,method:string,url:URL,owner:string,db:Db):Promise<Response|null>{
 if(path==='/api/notifications'){
  if(method==='GET'){
   const [items,unread,prefs]=await Promise.all([
    db.from('notifications').select('id,kind,title,body,link,created_at,read_at').eq('user_id',owner).order('created_at',{ascending:false}).limit(50),
    db.from('notifications').select('id',{count:'exact',head:true}).eq('user_id',owner).is('read_at',null),
    db.from('notification_preferences').select('time_zone').eq('user_id',owner).maybeSingle()]);
   if(unread.error)throw new HttpError(503,'Notifications could not be read');
   return json({items:checked(items)??[],unread:unread.count??0,time_zone:(checked(prefs) as Row|null)?.time_zone??null});
  }
  if(method==='PATCH'){
   const body=readSchema.parse(await readJson(req));
   let q=db.from('notifications').update({read_at:new Date().toISOString()}).eq('user_id',owner).is('read_at',null);
   if('ids' in body)q=q.in('id',body.ids);
   checked(await q);return json({read:true});
  }
 }
 if(path==='/api/notification-settings'){
  if(method==='GET')return json(await settingsFor(db,owner));
  if(method==='PUT'){
   const data=settingsSchema.parse(await readJson(req));
   const result=await db.from('notification_preferences').upsert({...data,user_id:owner,updated_at:new Date().toISOString()},{onConflict:'user_id'});
   if(result.error)throw new HttpError(503,'Could not save. Nothing was changed.');
   return json(await settingsFor(db,owner));
  }
 }
 if(path==='/api/push-devices'){
  if(method==='PUT'){
   // A phone that changes hands (sign out, sign in as someone else) keeps its token, so the row moves to the new rider.
   // That needs the service role: the earlier owner's row is not visible to this rider.
   const data=deviceSchema.parse(await readJson(req));
   const result=await adminDb().from('push_devices').upsert({...data,time_zone:data.time_zone??null,app_version:data.app_version??null,user_id:owner,active:true,last_error:null,updated_at:new Date().toISOString()},{onConflict:'token'});
   if(result.error)throw new HttpError(503,'Could not save this phone for notifications.');
   return json({registered:true});
  }
  if(method==='DELETE'){
   const token=z.string().min(10).max(200).parse(url.searchParams.get('token'));
   checked(await db.from('push_devices').update({active:false,updated_at:new Date().toISOString()}).eq('user_id',owner).eq('token',token));
   return json({registered:false});
  }
 }
 return null;
}

// ---------------------------------------------------------------- Cron

/** Vercel Cron sends "Authorization: Bearer <CRON_SECRET>". Nothing runs when the secret is not set. */
export function cronAuthorized(header:string|null,secret:string|undefined):boolean{
 if(!secret||secret.length<16||!header)return false;
 const a=Buffer.from(header),b=Buffer.from('Bearer '+secret);
 return a.length===b.length&&timingSafeEqual(a,b);
}
export async function handleNotificationCron(req:Request):Promise<Response>{
 if(!process.env.CRON_SECRET)return json({error:'Scheduled notifications are not configured'},503);
 if(!cronAuthorized(req.headers.get('authorization'),process.env.CRON_SECRET))return json({error:'Not authorized'},401);
 return json(await runNotificationCron(adminDb(),new Date()));
}

const MAX_RIDERS=500;
const uniq=<T>(xs:T[])=>[...new Set(xs)];
async function zonesFor(admin:Db,users:string[],settings:Map<string,StoredSettings&{time_zone?:string|null}>):Promise<Map<string,string>>{
 const zones=new Map<string,string>();
 for(const u of users){const tz=settings.get(u)?.time_zone;if(tz)zones.set(u,tz);}
 const missing=users.filter(u=>!zones.has(u));
 if(missing.length){const devices=(checked(await admin.from('push_devices').select('user_id,time_zone,updated_at').in('user_id',missing).eq('active',true).not('time_zone','is',null).order('updated_at',{ascending:false}).limit(5000))??[]) as Row[];
  for(const d of devices)if(!zones.has(d.user_id))zones.set(d.user_id,d.time_zone);}
 return zones;
}
/** One scheduled run: works out service-due and event reminders, stores the new ones (a repeat is ignored by the unique
 *  key), sends pushes for them and for any immediate send that did not finish, and checks Expo's receipts. */
export async function runNotificationCron(admin:Db,now:Date){
 const soon=new Date(now.getTime()+48*3600_000).toISOString();
 // Who might get a service reminder: riders who set a "next due at" hour, and riders who turned service due on.
 const [reminderRows,prefRows,eventRows]=await Promise.all([
  admin.from('service_events').select('user_id').not('next_due_hours','is',null).limit(20000).then(r=>(checked(r)??[]) as Row[]),
  admin.from('notification_preferences').select('user_id,'+SETTINGS_COLUMNS).limit(20000).then(r=>(checked(r)??[]) as Row[]),
  admin.from('events').select('id,user_id,title,starts_at,location_name,canceled_at,removed_at').gt('starts_at',now.toISOString()).lte('starts_at',soon).is('canceled_at',null).is('removed_at',null).limit(500).then(r=>(checked(r)??[]) as Row[])]);
 const reminderUsers=new Set(reminderRows.map(r=>r.user_id as string));
 const settings=new Map<string,StoredSettings&{time_zone?:string|null}>(prefRows.map(r=>[r.user_id,r]));
 const serviceUsers=uniq([...reminderUsers,...prefRows.filter(r=>r.service_due===true).map(r=>r.user_id as string)]).filter(u=>effectiveSettings(settings.get(u),reminderUsers.has(u)).service_due).slice(0,MAX_RIDERS);
 const rsvps=eventRows.length?((checked(await admin.from('event_rsvps').select('event_id,user_id,status').in('event_id',eventRows.map(e=>e.id)).limit(20000))??[]) as {event_id:string;user_id:string;status:string}[]):[];
 const eventUsers=uniq(rsvps.map(r=>r.user_id));
 const people=uniq([...eventUsers,...eventRows.map(e=>e.user_id as string)]);
 const [bikes,services,recent,blocksA,blocksB,zones]=await Promise.all([
  serviceUsers.length?admin.from('bikes').select('id,user_id,manufacturer,model,model_year,variant,region,nickname,engine_hours').in('user_id',serviceUsers).not('engine_hours','is',null).limit(5000).then(r=>(checked(r)??[]) as Row[]):[],
  serviceUsers.length?admin.from('service_events').select('user_id,bike_id,category,performed_at,engine_hours,next_due_hours,created_at').in('user_id',serviceUsers).order('performed_at',{ascending:false}).limit(20000).then(r=>(checked(r)??[]) as Row[]):[],
  serviceUsers.length?admin.from('notifications').select('user_id,subject,created_at').eq('kind','service_due').in('user_id',serviceUsers).gte('created_at',new Date(now.getTime()-SERVICE_REPEAT_MS-86400_000).toISOString()).limit(20000).then(r=>(checked(r)??[]) as Row[]):[],
  people.length?admin.from('user_blocks').select('blocker_id,blocked_id').in('blocker_id',people).limit(20000).then(r=>(checked(r)??[]) as BlockRow[]):[],
  people.length?admin.from('user_blocks').select('blocker_id,blocked_id').in('blocked_id',people).limit(20000).then(r=>(checked(r)??[]) as BlockRow[]):[],
  zonesFor(admin,eventUsers,settings)]);
 // The maker's schedule, once per exact bike (year, model, variant, region), only for bikes with logged service.
 const plans=new Map<string,PlanItem[]>(),byScope=new Map<string,PlanItem[]>();
 for(const bike of bikes){
  if(!services.some(s=>s.bike_id===bike.id))continue;
  const scope=exactBikeScope(bike as Bike),key=JSON.stringify(scope);
  if(!byScope.has(key)){const {data}=await admin.from('claims').select('id,statement').match({...scope,status:'VERIFIED',domain:'maintenance'}).limit(400);byScope.set(key,buildServicePlan((data??[]) as {id:string;statement:string}[]));}
  plans.set(bike.id,byScope.get(key)!);
 }
 const recentService=new Map<string,Map<string,string>>();
 for(const r of recent){if(!r.subject)continue;const m=recentService.get(r.user_id)??new Map();const o=m.get(r.subject);if(!o||r.created_at>o)m.set(r.subject,r.created_at);recentService.set(r.user_id,m);}
 const planned=scheduledNotifications({now,settings,reminderUsers,bikes:bikes as never,services:services as (ServiceRow&{user_id:string})[],plans,recentService,events:eventRows as never,rsvps,zones,blocks:[...blocksA,...blocksB]});
 const created=await store(admin,planned);
 // Immediate sends (messages, comments) that did not finish: picked up after two minutes, for up to a day.
 const stuck=(checked(await admin.from('notifications').select('id,user_id,kind,title,body,link').eq('push_status','pending').lt('created_at',new Date(now.getTime()-120_000).toISOString()).gt('created_at',new Date(now.getTime()-86400_000).toISOString()).limit(500))??[]) as Row[];
 const pending=[...created,...stuck.filter(s=>!created.some(c=>c.id===s.id))] as Stored[];
 const pushed=await deliver(admin,pending);
 const receipts=await checkReceipts(admin,now);
 return {planned:planned.length,created:created.length,retried:stuck.length,...pushed,receipts};
}

// ---------------------------------------------------------------- Storing and sending

type Stored={id:string;user_id:string;kind:NotificationKind;title:string;body:string;link:string};
/** Stores new notifications; ones already stored (same rider and dedupe key) are skipped, so only the new rows come back. */
async function store(admin:Db,items:NewNotification[]):Promise<Stored[]>{
 const out:Stored[]=[];
 for(const part of chunk(items,200)){
  if(!part.length)continue;
  const {data,error}=await admin.from('notifications').upsert(part,{onConflict:'user_id,dedupe_key',ignoreDuplicates:true}).select('id,user_id,kind,title,body,link');
  if(error)throw new HttpError(503,'Notifications could not be saved');
  out.push(...((data??[]) as Stored[]));
 }
 return out;
}
const expoHeaders=()=>({'Content-Type':'application/json',Accept:'application/json',...(process.env.EXPO_ACCESS_TOKEN?{Authorization:'Bearer '+process.env.EXPO_ACCESS_TOKEN}:{})});
async function deactivate(admin:Db,tokens:string[],reason:string){
 if(tokens.length)await admin.from('push_devices').update({active:false,last_error:reason,updated_at:new Date().toISOString()}).in('token',uniq(tokens));
}
/** Sends each notification to every active phone of its rider through Expo, 100 per request. A notification goes to
 *  'sent' when at least one phone took it, 'no_device' when the rider has no phone registered (it still shows in the
 *  web list), 'failed' when every phone refused it; it stays 'pending' when Expo could not be reached, for the next run. */
async function deliver(admin:Db,items:Stored[]):Promise<{sent:number;no_device:number;failed:number;deactivated:number}>{
 const result={sent:0,no_device:0,failed:0,deactivated:0};if(!items.length)return result;
 const devices=(checked(await admin.from('push_devices').select('user_id,token').in('user_id',uniq(items.map(i=>i.user_id))).eq('active',true).limit(10000))??[]) as {user_id:string;token:string}[];
 const outbox:{n:Stored;token:string}[]=[],none:string[]=[];
 for(const n of items){const mine=devices.filter(d=>d.user_id===n.user_id);if(!mine.length)none.push(n.id);for(const d of mine)outbox.push({n,token:d.token});}
 if(none.length){await admin.from('notifications').update({push_status:'no_device'}).in('id',none);result.no_device=none.length;}
 const tickets=new Map<string,{token:string;ticket:string}[]>(),reached=new Set<string>(),dead:string[]=[];
 for(const batch of chunk(outbox)){
  let reply:unknown;
  try{const r=await fetch(EXPO_PUSH_URL,{method:'POST',headers:expoHeaders(),body:JSON.stringify(batch.map(b=>pushMessage(b.token,b.n))),signal:AbortSignal.timeout(15000)});if(!r.ok)continue;reply=await r.json();}catch{continue;}
  const outcome=readTickets(batch.map(b=>b.token),reply);
  batch.forEach(b=>reached.add(b.n.id));
  for(const s of outcome.sent){const b=batch.find(x=>x.token===s.token)!;tickets.set(b.n.id,[...(tickets.get(b.n.id)??[]),s]);}
  dead.push(...outcome.dead);
 }
 await deactivate(admin,dead,'DeviceNotRegistered');result.deactivated=uniq(dead).length;
 const at=new Date().toISOString();
 await Promise.all([...reached].map(async id=>{
  const t=tickets.get(id)??[];
  if(t.length){result.sent++;await admin.from('notifications').update({push_status:'sent',push_tickets:t,pushed_at:at}).eq('id',id);}
  else{result.failed++;await admin.from('notifications').update({push_status:'failed',pushed_at:at}).eq('id',id);}
 }));
 return result;
}
/** About 15 minutes after sending, Expo knows whether Apple or Google accepted each push. Phones that report the app
 *  is gone (DeviceNotRegistered) are marked inactive. */
async function checkReceipts(admin:Db,now:Date):Promise<number>{
 const rows=(checked(await admin.from('notifications').select('id,push_tickets').eq('push_status','sent').is('receipts_checked_at',null).lt('pushed_at',new Date(now.getTime()-15*60_000).toISOString()).limit(300))??[]) as {id:string;push_tickets:{token:string;ticket:string}[]}[];
 if(!rows.length)return 0;
 const all=rows.flatMap(r=>Array.isArray(r.push_tickets)?r.push_tickets:[]),dead:string[]=[];
 for(const part of chunk(all,300)){
  try{const r=await fetch(EXPO_RECEIPTS_URL,{method:'POST',headers:expoHeaders(),body:JSON.stringify({ids:part.map(t=>t.ticket)}),signal:AbortSignal.timeout(15000)});if(!r.ok)return 0;dead.push(...deadFromReceipts(part,await r.json()));}catch{return 0;}
 }
 await deactivate(admin,dead,'DeviceNotRegistered');
 await admin.from('notifications').update({receipts_checked_at:now.toISOString()}).in('id',rows.map(r=>r.id));
 return rows.length;
}

// ---------------------------------------------------------------- Immediate: messages and comments

/** Keeps a send running after the response on Vercel (its request context's waitUntil); elsewhere the promise just runs.
 *  Errors are swallowed: a notification must never fail or slow the request that caused it. A send that is cut off
 *  stays 'pending' and the next scheduled run delivers it. */
export function inBackground(task:()=>Promise<unknown>):void{
 const p=Promise.resolve().then(task).catch(()=>{});
 try{const ctx=(globalThis as Record<symbol,{get?:()=>{waitUntil?:(p:Promise<unknown>)=>void}|undefined}|undefined>)[Symbol.for('@vercel/request-context')]?.get?.();ctx?.waitUntil?.(p);}catch{/* not on Vercel */}
}
async function riderContext(admin:Db,actor:string,recipient:string){
 const [prefs,blocks,profile]=await Promise.all([
  admin.from('notification_preferences').select(SETTINGS_COLUMNS).eq('user_id',recipient).maybeSingle().then(r=>checked(r) as StoredSettings),
  admin.from('user_blocks').select('blocker_id,blocked_id').or(`and(blocker_id.eq.${actor},blocked_id.eq.${recipient}),and(blocker_id.eq.${recipient},blocked_id.eq.${actor})`).then(r=>(checked(r)??[]) as BlockRow[]),
  admin.from('profiles').select('user_id,handle,display_name').eq('user_id',actor).maybeSingle().then(r=>checked(r) as Row|null)]);
 // hasServiceReminder does not matter for messages and comments, so it is not read.
 return {settings:effectiveSettings(prefs,false),blocks,actor:{user_id:actor,handle:profile?.handle??'',display_name:profile?.display_name??''}};
}
export async function notifyDirectMessage(sender:string,recipient:string,message:{id:string;body:string}){
 const admin=adminDb(),ctx=await riderContext(admin,sender,recipient);
 if(!shouldNotifyRider('message',sender,recipient,ctx.settings,ctx.blocks))return;
 await deliver(admin,await store(admin,[messageNotification(recipient,ctx.actor,message)]));
}
export async function notifyComment(commenter:string,comment:{id:string;post_id:string;body:string}){
 const admin=adminDb();
 const post=checked(await admin.from('posts').select('user_id,removed_at').eq('id',comment.post_id).maybeSingle()) as Row|null;
 if(!post||post.removed_at)return;
 const ctx=await riderContext(admin,commenter,post.user_id);
 if(!shouldNotifyRider('reply',commenter,post.user_id,ctx.settings,ctx.blocks))return;
 await deliver(admin,await store(admin,[replyNotification(post.user_id,ctx.actor,comment)]));
}
