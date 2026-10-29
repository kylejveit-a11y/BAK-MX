import {createClient,processLock} from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import {createSessionStorage} from './sessionStorage';
export const apiOrigin=process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/,'')??'';
const url=process.env.EXPO_PUBLIC_SUPABASE_URL??'',key=process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'';
const mxProject=url.replace(/\/$/,'')==='https://yzvrujffiktfserrgkcb.supabase.co';
export const configured=Boolean(mxProject&&key&&apiOrigin&&/^https:\/\//.test(apiOrigin));
// Chunk encrypted values to avoid legacy iOS SecureStore payload limits.
const storage=createSessionStorage(SecureStore);
export const supabase=mxProject&&key?createClient(url,key,{auth:{storage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,lock:processLock,flowType:'pkce'}}):null;
export class ApiError extends Error{constructor(message:string,public status:number){super(message);}}
export async function api<T>(path:string,method='GET',body?:unknown):Promise<T>{if(!configured||!supabase)throw new Error('BAK MX services are not configured in this build.');const {data,error}=await supabase.auth.getSession();if(error)throw error;if(!data.session)throw new Error('Sign in to continue.');const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),90000);let response:Response;try{response=await fetch(apiOrigin+path,{signal:controller.signal,method,headers:{Authorization:`Bearer ${data.session.access_token}`,'Content-Type':'application/json'},...(body!==undefined?{body:JSON.stringify(body)}:{})});}catch(e){if(controller.signal.aborted)throw new Error('Connection timed out. Refresh your saved data before retrying; the request may have completed.');throw new Error('Could not reach BAK MX. Check your connection and try again.');}finally{clearTimeout(timeout);}let json:any;try{json=await response.json();}catch{throw new ApiError('BAK MX returned an incomplete response. Refresh your history before retrying.',response.status||502);}if(!response.ok)throw new ApiError(json.error??'Request failed. Please try again.',response.status);return json as T;}

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
