import {createClient,processLock} from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import {createSessionStorage} from './sessionStorage';
import {readProgress,writeProgress} from './localProgress';
import {enqueue,flush,isNetworkError,LOCAL_PREFIX,pending,recall,remember,setOffline,type Store} from './offline';
export const apiOrigin=process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/,'')??'';
const url=process.env.EXPO_PUBLIC_SUPABASE_URL??'',key=process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'';
const mxProject=url.replace(/\/$/,'')==='https://yzvrujffiktfserrgkcb.supabase.co';
export const configured=Boolean(mxProject&&key&&apiOrigin&&/^https:\/\//.test(apiOrigin));
// Chunk encrypted values to avoid legacy iOS SecureStore payload limits.
const storage=createSessionStorage(SecureStore);
export const supabase=mxProject&&key?createClient(url,key,{auth:{storage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,lock:processLock,flowType:'pkce'}}):null;
export class ApiError extends Error{constructor(message:string,public status:number){super(message);}}
/** Reads and writes keyed to the signed-in account; null before sign-in. */
export function accountStore(userId:string):Store{return {read:(k,f)=>readProgress(userId,k,f),write:(k,v)=>writeProgress(userId,k,v)};}
let lastUser='';
export const currentStore=()=>lastUser?accountStore(lastUser):null;
/** The raw request. Offline handling wraps it below. */
async function request<T>(path:string,method:string,body:unknown,token:string):Promise<T>{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),90000);let response:Response;try{response=await fetch(apiOrigin+path,{signal:controller.signal,method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},...(body!==undefined?{body:JSON.stringify(body)}:{})});}catch(e){if(controller.signal.aborted)throw new Error('Connection timed out. Refresh your saved data before retrying; the request may have completed.');throw new Error('Could not reach BAK MX. Check your connection and try again.');}finally{clearTimeout(timeout);}let json:any;try{json=await response.json();}catch{throw new ApiError('BAK MX returned an incomplete response. Refresh your history before retrying.',response.status||502);}if(!response.ok)throw new ApiError(json.error??'Request failed. Please try again.',response.status);return json as T;}
/** GET answers are kept on the phone and served when there is no signal (the rider is told). Any success flushes queued writes. */
export async function api<T>(path:string,method='GET',body?:unknown):Promise<T>{
 if(!configured||!supabase)throw new Error('BAK MX services are not configured in this build.');
 const {data,error}=await supabase.auth.getSession();if(error)throw error;if(!data.session)throw new Error('Sign in to continue.');
 lastUser=data.session.user.id;const store=accountStore(lastUser);
 try{
  const out=await request<T>(path,method,body,data.session.access_token);
  setOffline(false);
  if(method==='GET')remember(store,path,out);
  if(method!=='GET'||pending(store).length)void flush(store,(p,b)=>request(p,'POST',b,data.session!.access_token)).catch(()=>{});
  return out;
 }catch(e){
  if(isNetworkError(e)){setOffline(true);if(method==='GET'){const kept=recall<T>(store,path);if(kept)return kept.data;}}
  throw e;
 }
}
/** A write that must not be lost at the track: sent now, or kept and sent when signal returns. Returns the saved row, or the
 *  local stand-in with a 'local-' id and pending:true when it had to wait. */
export async function apiQueued<T extends {id:string}>(path:string,body:unknown,local:Omit<T,'id'>,label:string):Promise<T&{pending?:boolean}>{
 try{return await api<T>(path,'POST',body);}
 catch(e){
  if(!isNetworkError(e))throw e;
  const store=currentStore();if(!store)throw e;
  const id=LOCAL_PREFIX+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
  enqueue(store,{id,path,body,created_at:new Date().toISOString(),label});
  return {...(local as T),id,pending:true};
 }
}

/** Posts a chat question and follows the reply as it is written: the server sends one JSON event per line ("status", "draft",
 *  then "done" or "error"). React Native's fetch cannot read a body in pieces, so this uses XMLHttpRequest, whose progress
 *  events carry the text received so far. If the server answers with plain JSON instead, that is used as is. */
export async function apiStream<T>(path:string,body:unknown,onEvent:(event:{type:string;[key:string]:unknown})=>void):Promise<T>{
 if(!configured||!supabase)throw new Error('BAK MX services are not configured in this build.');
 const {data,error}=await supabase.auth.getSession();if(error)throw error;if(!data.session)throw new Error('Sign in to continue.');
 const token=data.session.access_token;
 return new Promise<T>((resolve,reject)=>{
  const xhr=new XMLHttpRequest();let seen=0,result:T|undefined,failed:Error|null=null,settled=false;
  const finish=(fn:()=>void)=>{if(settled)return;settled=true;clearTimeout(timer);fn();};
  const line=(text:string)=>{if(!text.trim()||failed)return;let event:{type:string;[key:string]:unknown};try{event=JSON.parse(text);}catch{return;}
   if(event.type==='error'){failed=new ApiError(String(event.error||'Request failed. Please try again.'),Number(event.status)||502);return;}
   if(event.type==='done'){result=event as unknown as T;return;}
   try{onEvent(event);}catch{/* a display hiccup must not cost the answer */}};
  const read=(all:boolean)=>{const text=xhr.responseText||'';let cut;while((cut=text.indexOf('\n',seen))>=0){line(text.slice(seen,cut));seen=cut+1;}if(all&&seen<text.length){line(text.slice(seen));seen=text.length;}};
  const streaming=()=>(xhr.getResponseHeader('Content-Type')||'').startsWith('application/x-ndjson');
  const timer=setTimeout(()=>{xhr.abort();finish(()=>reject(new Error('Connection timed out. Refresh your saved data before retrying; the request may have completed.')));},90000);
  xhr.onprogress=()=>{if(xhr.status===200&&streaming())read(false);};
  xhr.onload=()=>finish(()=>{
   if(xhr.status===200&&streaming()){read(true);if(failed)return reject(failed);if(result!==undefined)return resolve(result);return reject(new Error('The connection dropped before the reply finished. Refresh your history before retrying.'));}
   let json:any;try{json=JSON.parse(xhr.responseText);}catch{return reject(new ApiError('BAK MX returned an incomplete response. Refresh your history before retrying.',xhr.status||502));}
   if(xhr.status<200||xhr.status>=300)return reject(new ApiError(json?.error??'Request failed. Please try again.',xhr.status));
   resolve(json as T);
  });
  xhr.onerror=()=>finish(()=>reject(new Error(seen>0?'The connection dropped before the reply finished. Refresh your history before retrying.':'Could not reach BAK MX. Check your connection and try again.')));
  xhr.open('POST',apiOrigin+path);
  xhr.setRequestHeader('Authorization',`Bearer ${token}`);xhr.setRequestHeader('Content-Type','application/json');xhr.setRequestHeader('Accept','application/x-ndjson, application/json');
  xhr.responseType='text';
  xhr.send(JSON.stringify(body));
 });
}
