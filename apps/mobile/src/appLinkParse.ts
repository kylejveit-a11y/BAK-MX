// Pure parsing for Siri / Shortcuts links (no React Native imports, so tests run in Node).
export type AppLink={screen:'ask';question:string}|{screen:'snap'}|{screen:'setup';note:string}|{screen:'service'};
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
  case 'service':return {screen:'service'};
  default:return null;
 }
}

/** Reads a pending pair {url, at} the native side left; stale or malformed values are ignored. */
export function pendingFrom(value:unknown,now=Date.now()):string|null{
 if(typeof value!=='string')return null;
 try{const v=JSON.parse(value) as {url?:unknown;at?:unknown};if(typeof v.url!=='string'||typeof v.at!=='number'||now-v.at>MAX_AGE||v.at-now>60_000)return null;return v.url;}catch{return null;}
}

