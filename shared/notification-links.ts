// Where a notification opens. Each one carries a bakmx:// link: the phone opens it as a deep link (see
// apps/mobile/src/appLinkParse.ts) and the web bell maps it to a page. Pure, so it is shared and tested in Node.

export type NotificationLink=
 {screen:'messages';with:string|null;handle:string;name:string}|
 {screen:'community';post:string|null}|
 {screen:'events';event:string|null}|
 {screen:'service';bike:string|null};

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const id=(v:string|null)=>v&&UUID.test(v)?v.toLowerCase():null;
const clip=(v:string|null,n:number)=>(v??'').trim().slice(0,n);
const q=(params:Record<string,string|null|undefined>)=>{const s=new URLSearchParams();for(const [k,v] of Object.entries(params))if(v)s.set(k,v);const t=s.toString();return t?'?'+t:'';};

export const messageLink=(sender:string,handle='',name='')=>'bakmx://messages'+q({with:sender,handle:clip(handle,40),name:clip(name,60)});
export const postLink=(post:string)=>'bakmx://community'+q({post});
export const eventLink=(event:string)=>'bakmx://events'+q({event});
export const serviceLink=(bike?:string|null)=>'bakmx://service'+q({bike:bike??null});

/** Reads one of the notification links above. Anything else (including a malformed id) is null or drops the id. */
export function parseNotificationLink(raw:string):NotificationLink|null{
 let url:URL;try{url=new URL(raw);}catch{return null;}
 if(url.protocol!=='bakmx:')return null;
 const p=url.searchParams;
 switch(url.hostname){
  case 'messages':return {screen:'messages',with:id(p.get('with')),handle:clip(p.get('handle'),40),name:clip(p.get('name'),60)};
  case 'community':return {screen:'community',post:id(p.get('post'))};
  case 'events':return {screen:'events',event:id(p.get('event'))};
  case 'service':return {screen:'service',bike:id(p.get('bike'))};
  default:return null;
 }
}
