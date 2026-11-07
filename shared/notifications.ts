// What BAK MX notifies a rider about, and when. Pure (no database, no network), so the scheduling rules are tested in Node:
// service due by the hours on the bike, event reminders in the rider's own time zone, new messages and comments on
// the rider's posts, blocks, the rider's on/off choices, and how Expo's push replies are read.
import {serviceDueRows,type PlanItem} from './service-plan.ts';
import {eventLink,messageLink,postLink,serviceLink} from './notification-links.ts';

export const NOTIFICATION_KINDS=['service_due','event_reminder','message','reply'] as const;
export type NotificationKind=typeof NOTIFICATION_KINDS[number];
/** A notification as stored (and listed in the web bell). */
export type NotificationRecord={id:string;kind:NotificationKind;title:string;body:string;link:string;created_at:string;read_at:string|null};
/** A notification about to be stored: who it is for, what it says, where it opens, and the key that keeps it from repeating. */
export type NewNotification={user_id:string;kind:NotificationKind;title:string;body:string;link:string;dedupe_key:string;subject:string|null;data:Record<string,unknown>};

// ---------------------------------------------------------------- Rider choices

export type NotificationSettings={messages:boolean;replies:boolean;events:boolean;service_due:boolean};
/** The stored row: null (or no row) means the default. service_due null means "follow the Remind me field on the service log". */
export type StoredSettings={messages?:boolean|null;replies?:boolean|null;events?:boolean|null;service_due?:boolean|null}|null|undefined;
/** Everything is on unless the rider turned it off, except service due: that turns on when the rider sets a
 *  "Remind me when it's due next" hour on a service, unless they chose on or off themselves. */
export function effectiveSettings(row:StoredSettings,hasServiceReminder:boolean):NotificationSettings&{service_due_follows_reminders:boolean}{
 const follows=row?.service_due==null;
 return {messages:row?.messages??true,replies:row?.replies??true,events:row?.events??true,service_due:follows?hasServiceReminder:!!row!.service_due,service_due_follows_reminders:follows};
}
export const kindSetting:Record<NotificationKind,keyof NotificationSettings>={service_due:'service_due',event_reminder:'events',message:'messages',reply:'replies'};

// ---------------------------------------------------------------- Blocks

export type BlockRow={blocker_id:string;blocked_id:string};
/** True when either rider blocked the other. A blocked rider never causes a notification, in either direction. */
export function blockedBetween(blocks:BlockRow[],a:string,b:string):boolean{
 return blocks.some(x=>(x.blocker_id===a&&x.blocked_id===b)||(x.blocker_id===b&&x.blocked_id===a));
}

// ---------------------------------------------------------------- Time zones

export const DEFAULT_TIME_ZONE='America/New_York';
/** The zone if the runtime knows it, else the fallback. */
export function validZone(tz:string|null|undefined,fallback=DEFAULT_TIME_ZONE):string{
 if(tz&&tz.length<=64)try{new Intl.DateTimeFormat('en-US',{timeZone:tz});return tz;}catch{/* unknown zone */}
 return fallback;
}
type Parts={y:number;m:number;d:number;h:number;min:number;s:number};
function partsIn(date:Date,tz:string):Parts{
 const f=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});
 const p:Record<string,string>={};for(const x of f.formatToParts(date))p[x.type]=x.value;
 return {y:+p.year,m:+p.month,d:+p.day,h:+p.hour%24,min:+p.minute,s:+p.second};
}
/** Minutes the zone is ahead of UTC at that instant (negative west of Greenwich). */
function offsetMs(date:Date,tz:string){const p=partsIn(date,tz);return Date.UTC(p.y,p.m-1,p.d,p.h,p.min,p.s)-Math.floor(date.getTime()/1000)*1000;}
/** The calendar day an instant falls on, in the zone. */
export function localDay(date:Date,tz:string):{y:number;m:number;d:number}{const p=partsIn(date,tz);return {y:p.y,m:p.m,d:p.d};}
/** The instant of a wall-clock time in the zone (daylight-saving aware). */
export function zonedTime(y:number,m:number,d:number,h:number,min:number,tz:string):Date{
 const wall=Date.UTC(y,m-1,d,h,min);let t=wall-offsetMs(new Date(wall),tz);
 const again=offsetMs(new Date(t),tz);if(wall-again!==t)t=wall-again;
 return new Date(t);
}
const shiftDay=(day:{y:number;m:number;d:number},n:number)=>{const t=new Date(Date.UTC(day.y,day.m-1,day.d+n));return {y:t.getUTCFullYear(),m:t.getUTCMonth()+1,d:t.getUTCDate()};};
const sameDay=(a:{y:number;m:number;d:number},b:{y:number;m:number;d:number})=>a.y===b.y&&a.m===b.m&&a.d===b.d;

// ---------------------------------------------------------------- Event reminders

/** The evening before (6 pm) and the morning of (7 am), in the rider's time zone. */
export const DAY_BEFORE_HOUR=18,MORNING_HOUR=7;
export type EventSlot='day_before'|'morning';
export type EventLike={id:string;title:string;starts_at:string;location_name?:string|null;canceled_at?:string|null;removed_at?:string|null};
/** Which reminder is due now for an event, or null. The evening-before one runs from 6 pm the day before until the
 *  morning one starts; the morning one from 7 am until the event starts. An event that starts before 8 am gets no
 *  morning reminder (it would land as the gate drops), so its evening-before reminder runs until the start instead.
 *  Canceled, removed and started events get nothing. A run that misses a window skips it rather than sending late. */
export function eventReminderSlot(ev:EventLike,tz:string,now:Date):EventSlot|null{
 if(ev.canceled_at||ev.removed_at)return null;
 const start=new Date(ev.starts_at);if(!Number.isFinite(start.getTime())||now>=start)return null;
 const zone=validZone(tz),day=localDay(start,zone),before=shiftDay(day,-1);
 const evening=zonedTime(before.y,before.m,before.d,DAY_BEFORE_HOUR,0,zone);
 const morning=zonedTime(day.y,day.m,day.d,MORNING_HOUR,0,zone);
 const hasMorning=start.getTime()-morning.getTime()>=3600_000;
 if(hasMorning&&now>=morning)return 'morning';
 if(now>=evening)return 'day_before';
 return null;
}
/** "7:30 AM" in the rider's zone. */
export function clockIn(date:Date,tz:string){return new Intl.DateTimeFormat('en-US',{timeZone:validZone(tz),hour:'numeric',minute:'2-digit'}).format(date);}
export function eventReminder(user:string,ev:EventLike,slot:EventSlot,tz:string,now:Date):NewNotification{
 const zone=validZone(tz),start=new Date(ev.starts_at),today=sameDay(localDay(now,zone),localDay(start,zone));
 const where=ev.location_name?` at ${ev.location_name}`:'';
 return {user_id:user,kind:'event_reminder',title:`${today?'Today':'Tomorrow'}: ${clip(ev.title,80)}`,body:`Starts ${clockIn(start,zone)}${where}.`,link:eventLink(ev.id),dedupe_key:`event:${ev.id}:${slot}`,subject:`event:${ev.id}`,data:{event_id:ev.id,slot}};
}

// ---------------------------------------------------------------- Service due

/** "Due soon" means within this many engine hours; overdue means at or past the due hour. */
export const DUE_SOON_HOURS=3;
/** One notification per service item per week at most, whatever its stage. */
export const SERVICE_REPEAT_MS=7*24*3600_000;
export type ServiceRow={bike_id:string;category:string;performed_at:string;engine_hours:number|null;next_due_hours:number|null;created_at?:string|null};
export type BikeLike={id:string;engine_hours:number|null;manufacturer?:string;model?:string;model_year?:number;nickname?:string|null};
export type DueItem={subject:string;category:string;due_at:number;left:number;stage:'soon'|'overdue'};
const round1=(n:number)=>Math.round(n*10)/10;
const catKey=(c:string)=>c.trim().toLowerCase();
/** Service items on this bike that are due within DUE_SOON_HOURS or overdue, soonest first. Two sources, the sooner wins:
 *  - the rider's own "next due at" hour on the latest log entry for that job (an older entry's hour is replaced by a newer
 *    log of the same job, so a done job never nags);
 *  - the maker's interval from the service schedule, counted from the last time the rider logged that job. A job the rider
 *    has never logged is left out: with no starting point, every job on a used bike would read as overdue at once.
 *  Nothing is due when the bike's hours are unknown. */
export function serviceDueItems(bike:BikeLike,plan:PlanItem[]|null,events:ServiceRow[]):DueItem[]{
 const h=bike.engine_hours;if(h==null||!Number.isFinite(h))return [];
 const mine=events.filter(e=>e.bike_id===bike.id);
 const by=new Map<string,{category:string;due_at:number}>();
 const keep=(category:string,due_at:number)=>{const k=catKey(category),o=by.get(k);if(!o||due_at<o.due_at)by.set(k,{category,due_at});};
 const latest=new Map<string,ServiceRow>();
 for(const e of mine){const k=catKey(e.category),o=latest.get(k);if(!o||e.performed_at>o.performed_at||(e.performed_at===o.performed_at&&(e.created_at??'')>(o.created_at??'')))latest.set(k,e);}
 for(const e of latest.values())if(e.next_due_hours!=null)keep(e.category,e.next_due_hours);
 if(plan?.length)for(const row of serviceDueRows(plan,mine,h))if(row.last&&row.due!=null)keep(row.item.category,row.due);
 return [...by.entries()].map(([k,v])=>({subject:`service:${bike.id}:${k}`,category:v.category,due_at:round1(v.due_at),left:round1(v.due_at-h)}))
  .filter(x=>x.left<=DUE_SOON_HOURS).map(x=>({...x,stage:x.left<=0?'overdue' as const:'soon' as const})).sort((a,b)=>a.left-b.left);
}
/** True when this item was not notified in the last week. lastSent maps subject → when it last went out. */
export function serviceNotifyAllowed(subject:string,lastSent:Map<string,string|number>,now:Date):boolean{
 const at=lastSent.get(subject);if(at==null)return true;
 const t=typeof at==='number'?at:Date.parse(at);
 return !Number.isFinite(t)||now.getTime()-t>=SERVICE_REPEAT_MS;
}
export const bikeName=(b:BikeLike)=>b.nickname?.trim()||[b.model_year,b.manufacturer,b.model].filter(Boolean).join(' ')||'Your bike';
export function serviceNotification(user:string,bike:BikeLike,item:DueItem,now:Date):NewNotification{
 const h=bike.engine_hours??0,name=bikeName(bike);
 const title=item.stage==='overdue'?`${item.category} is due`:`${item.category} due soon`;
 const body=item.stage==='overdue'?`${name}: due at ${item.due_at} h, ${round1(h)} h on the bike now.`:`${name}: due at ${item.due_at} h, ${item.left} h to go.`;
 return {user_id:user,kind:'service_due',title,body,link:serviceLink(bike.id),dedupe_key:`${item.subject}:${now.toISOString().slice(0,10)}`,subject:item.subject,data:{bike_id:bike.id,category:item.category,due_at:item.due_at,stage:item.stage}};
}

// ---------------------------------------------------------------- Messages and comments

export type RiderLike={user_id:string;handle?:string|null;display_name?:string|null};
const nameOf=(r:RiderLike)=>r.display_name?.trim()||(r.handle?'@'+r.handle:'A rider');
const clip=(s:string,n:number)=>{const t=s.replace(/\s+/g,' ').trim();return t.length>n?t.slice(0,n-1).trimEnd()+'…':t;};
export function messageNotification(recipient:string,sender:RiderLike,message:{id:string;body:string}):NewNotification{
 return {user_id:recipient,kind:'message',title:nameOf(sender),body:clip(message.body,140),link:messageLink(sender.user_id,sender.handle??'',sender.display_name??''),dedupe_key:`message:${message.id}`,subject:`thread:${sender.user_id}`,data:{sender_id:sender.user_id,message_id:message.id}};
}
export function replyNotification(postOwner:string,commenter:RiderLike,comment:{id:string;post_id:string;body:string}):NewNotification{
 return {user_id:postOwner,kind:'reply',title:`${nameOf(commenter)} commented on your post`,body:clip(comment.body,140),link:postLink(comment.post_id),dedupe_key:`comment:${comment.id}`,subject:`post:${comment.post_id}`,data:{post_id:comment.post_id,comment_id:comment.id,commenter_id:commenter.user_id}};
}
/** Whether a message or comment notification goes out: never to oneself, never across a block, and only when that kind is on. */
export function shouldNotifyRider(kind:NotificationKind,actor:string,recipient:string,settings:NotificationSettings,blocks:BlockRow[]):boolean{
 return actor!==recipient&&settings[kindSetting[kind]]&&!blockedBetween(blocks,actor,recipient);
}

// ---------------------------------------------------------------- One scheduled run

export type ScheduleInput={
 now:Date;
 /** Stored settings per rider (absent = defaults). */
 settings:Map<string,StoredSettings>;
 /** Riders with at least one service entry carrying a "next due at" hour (service due follows this unless set). */
 reminderUsers:Set<string>;
 bikes:(BikeLike&{user_id:string})[];
 services:(ServiceRow&{user_id:string})[];
 /** The maker's schedule per bike id, when known. */
 plans:Map<string,PlanItem[]>;
 /** subject → when it was last notified, per rider (service items, last week or so). */
 recentService:Map<string,Map<string,string|number>>;
 events:(EventLike&{user_id:string})[];
 rsvps:{event_id:string;user_id:string;status:string}[];
 /** The rider's time zone (settings first, then their phone). Absent = DEFAULT_TIME_ZONE. */
 zones:Map<string,string>;
 blocks:BlockRow[];
};
/** Everything a scheduled run should notify now: service due (riders with it on) and event reminders (riders who said
 *  going or interested, with event reminders on, not blocked with the host). Duplicates of past runs are removed by the
 *  store (unique dedupe_key); the weekly service limit is applied here from recentService. */
export function scheduledNotifications(input:ScheduleInput):NewNotification[]{
 const out:NewNotification[]=[],{now}=input;
 const on=(user:string)=>effectiveSettings(input.settings.get(user),input.reminderUsers.has(user));
 for(const bike of input.bikes){
  if(!on(bike.user_id).service_due)continue;
  const sent=input.recentService.get(bike.user_id)??new Map();
  const services=input.services.filter(s=>s.user_id===bike.user_id&&s.bike_id===bike.id);
  for(const item of serviceDueItems(bike,input.plans.get(bike.id)??null,services))
   if(serviceNotifyAllowed(item.subject,sent,now))out.push(serviceNotification(bike.user_id,bike,item,now));
 }
 const events=new Map(input.events.map(e=>[e.id,e]));
 for(const r of input.rsvps){
  const ev=events.get(r.event_id);if(!ev||(r.status!=='going'&&r.status!=='interested'))continue;
  if(!on(r.user_id).events||blockedBetween(input.blocks,r.user_id,ev.user_id))continue;
  const tz=validZone(input.zones.get(r.user_id)),slot=eventReminderSlot(ev,tz,now);
  if(slot)out.push(eventReminder(r.user_id,ev,slot,tz,now));
 }
 const seen=new Set<string>();
 return out.filter(n=>{const k=n.user_id+'|'+n.dedupe_key;if(seen.has(k))return false;seen.add(k);return true;});
}

// ---------------------------------------------------------------- Expo push

export const EXPO_PUSH_URL='https://exp.host/--/api/v2/push/send';
export const EXPO_RECEIPTS_URL='https://exp.host/--/api/v2/push/getReceipts';
/** Expo takes at most 100 messages per request. */
export const EXPO_BATCH=100;
export type PushMessage={to:string;title:string;body:string;data:Record<string,unknown>;sound:'default';priority:'high';channelId:'default'};
export const isExpoToken=(t:string)=>/^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]{8,}\]$/.test(t);
export function pushMessage(token:string,n:{id?:string;title:string;body:string;link:string;kind:NotificationKind}):PushMessage{
 return {to:token,title:n.title,body:n.body,data:{url:n.link,kind:n.kind,...(n.id?{notification_id:n.id}:{})},sound:'default',priority:'high',channelId:'default'};
}
export function chunk<T>(items:T[],size=EXPO_BATCH):T[][]{const out:T[][]=[];for(let i=0;i<items.length;i+=size)out.push(items.slice(i,i+size));return out;}
export type TicketOutcome={sent:{token:string;ticket:string}[];dead:string[];failed:string[]};
/** Reads Expo's reply to one send: tickets come back in the order the messages were sent. A token Expo reports as
 *  DeviceNotRegistered is dead (the app was removed or notifications were reset) and is marked inactive. */
export function readTickets(tokens:string[],reply:unknown):TicketOutcome{
 const out:TicketOutcome={sent:[],dead:[],failed:[]};
 const data=(reply as {data?:unknown})?.data;
 if(!Array.isArray(data)){out.failed.push(...tokens);return out;}
 tokens.forEach((token,i)=>{const t=data[i] as {status?:string;id?:string;details?:{error?:string}}|undefined;
  if(t?.status==='ok'&&t.id)out.sent.push({token,ticket:t.id});
  else if(t?.details?.error==='DeviceNotRegistered')out.dead.push(token);
  else out.failed.push(token);});
 return out;
}
/** Reads Expo's receipts (checked a while after sending): the tokens whose delivery failed with DeviceNotRegistered. */
export function deadFromReceipts(tickets:{token:string;ticket:string}[],reply:unknown):string[]{
 const data=(reply as {data?:Record<string,{status?:string;details?:{error?:string}}>})?.data;if(!data||typeof data!=='object')return [];
 return [...new Set(tickets.filter(t=>data[t.ticket]?.status==='error'&&data[t.ticket]?.details?.error==='DeviceNotRegistered').map(t=>t.token))];
}
