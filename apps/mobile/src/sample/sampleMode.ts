// Sample mode: a development-only way to open every signed-in screen on a simulator without an account. The app talks to
// no server; every call is answered from scripts/web-visual/mock-api.cjs (the same sample rider, bikes and answers the
// website check uses). It is on only in a development build started with EXPO_PUBLIC_SAMPLE_MODE=1. In a release build
// __DEV__ is false, so this file's code is never reached and Metro drops it.
export const SAMPLE=__DEV__&&process.env.EXPO_PUBLIC_SAMPLE_MODE==='1';

type Mock={respond:(p:string,q:{get:(k:string)=>string|null},method:string,post:unknown)=>{status:number;body?:unknown;events?:{type:string;[k:string]:unknown}[]};USER:string};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mock=():Mock=>require('../../../../scripts/web-visual/mock-api.cjs');

function split(path:string){const i=path.indexOf('?');const p=i<0?path:path.slice(0,i);const params:Record<string,string>={};
 if(i>=0)for(const pair of path.slice(i+1).split('&')){if(!pair)continue;const [k,v=''] =pair.split('=');params[decodeURIComponent(k)]=decodeURIComponent(v.replace(/\+/g,' '));}
 return {p:p.startsWith('/api/')?p:'/api'+p,q:{get:(k:string)=>params[k]??null}};}

export async function sampleApi<T>(path:string,method:string,body:unknown):Promise<T>{
 const {p,q}=split(path);const r=mock().respond(p,q,method,body);
 await new Promise(res=>setTimeout(res,120));
 if(r.status>=400)throw Object.assign(new Error('Not found in sample data.'),{status:r.status});
 return r.body as T;
}
export async function sampleStream<T>(path:string,body:unknown,onEvent:(e:{type:string;[k:string]:unknown})=>void):Promise<T>{
 // Like the real stream, the result is the whole 'done' event ({type:'done', message, ...}).
 const {p,q}=split(path);const r=mock().respond(p,q,'POST',body);let done:unknown;
 for(const e of r.events??[]){await new Promise(res=>setTimeout(res,350));onEvent(e);if(e.type==='done')done=e;}
 return (done??r.body) as T;
}
export function sampleSession(){const id=mock().USER;const at=Math.floor(Date.now()/1000);
 return {access_token:'sample',refresh_token:'sample',token_type:'bearer',expires_in:3600*24,expires_at:at+3600*24,
  user:{id,aud:'authenticated',role:'authenticated',email:'sample@example.invalid',app_metadata:{},user_metadata:{},created_at:new Date().toISOString()}};}
