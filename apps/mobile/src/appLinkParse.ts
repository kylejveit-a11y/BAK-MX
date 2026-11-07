// Pure parsing for Siri / Shortcuts links and notification taps (no React Native imports, so tests run in Node).
import {parseNotificationLink} from '../../../shared/notification-links.ts';
export type AppLink={screen:'ask';question:string}|{screen:'snap'}|{screen:'setup';note:string}|{screen:'trackReport'}|{screen:'service';bike?:string|null}
 |{screen:'messages';with:string|null;handle:string;name:string}|{screen:'community';post:string|null}|{screen:'events';event:string|null};
export const PENDING_LINK_KEY='bak.pendingLink';
const MAX_AGE=10*60*1000,clip=(v:string|null)=>(v??'').trim().slice(0,2000);

export function parseAppLink(raw:string):AppLink|null{
 let url:URL;try{url=new URL(raw);}catch{return null;}
 if(url.protocol!=='bakmx:')return null;
 const q=url.searchParams;
 switch(url.hostname){
  case 'ask':return {screen:'ask',question:clip(q.get('q'))};
  case 'snap':return {screen:'snap'};
  case 'setup':return {screen:'setup',note:clip(q.get('note'))};
  // "Log how the track rode": the How did it ride? card.
  case 'track-report':return {screen:'trackReport'};
  // From a notification: service (optionally for one bike), a message thread, a post, an event.
  case 'service':{const bike=parseNotificationLink(raw);return bike?.screen==='service'&&bike.bike?{screen:'service',bike:bike.bike}:{screen:'service'};}
  case 'messages':case 'community':case 'events':return parseNotificationLink(raw) as AppLink|null;
  default:return null;
 }
}

/** Reads a pending pair {url, at} the native side left; stale or malformed values are ignored. */
export function pendingFrom(value:unknown,now=Date.now()):string|null{
 if(typeof value!=='string')return null;
 try{const v=JSON.parse(value) as {url?:unknown;at?:unknown};if(typeof v.url!=='string'||typeof v.at!=='number'||now-v.at>MAX_AGE||v.at-now>60_000)return null;return v.url;}catch{return null;}
}

