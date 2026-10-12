import {createClient} from '@supabase/supabase-js';
import {isMxProjectUrl} from '../shared/mx-project';
const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase=isMxProjectUrl(url)&&key?createClient(url,key):null;
export async function api<T>(path:string,method='GET',body?:unknown):Promise<T>{
 const session=await supabase?.auth.getSession();
 const token=session?.data.session?.access_token;
 if(!token)throw new Error('Sign in to access your workshop.');
 const response=await fetch('/api'+path,{method,headers:{Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
 const data=await response.json().catch(()=>({error:'The service returned an unreadable response. Please try again.'}));
 if(!response.ok){const err=new Error(data.error||'The request could not be completed.') as Error&{status?:number};err.status=response.status;throw err;}
 return data as T;
}

/** Posts a request whose reply arrives as one JSON event per line, calling onEvent for each until the final "done" event. */
export async function apiStream<T>(path:string,body:unknown,onEvent:(event:{type:string;[key:string]:unknown})=>void):Promise<T>{
 const session=await supabase?.auth.getSession();
 const token=session?.data.session?.access_token;
 if(!token)throw new Error('Sign in to access your workshop.');
 const response=await fetch('/api'+path,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',Accept:'application/x-ndjson, application/json'},body:JSON.stringify(body)});
 const fail=(message:string,status?:number)=>{const err=new Error(message) as Error&{status?:number};if(status)err.status=status;return err;};
 if(!response.ok||!response.body||!(response.headers.get('Content-Type')||'').startsWith('application/x-ndjson')){
  const data=await response.json().catch(()=>({error:'The service returned an unreadable response. Please try again.'}));
  if(!response.ok)throw fail(data.error||'The request could not be completed.',response.status);
  return data as T;
 }
 const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',result:T|undefined;
 const line=(text:string)=>{if(!text.trim())return;let event:{type:string;[key:string]:unknown};try{event=JSON.parse(text);}catch{return;}
  if(event.type==='error')throw fail(String(event.error||'The request could not be completed.'),Number(event.status)||502);
  if(event.type==='done'){result=event as unknown as T;return;}
  onEvent(event);};
 for(;;){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});let cut;while((cut=buffer.indexOf('\n'))>=0){line(buffer.slice(0,cut));buffer=buffer.slice(cut+1);}}
 line(buffer);
 // The connection closed before the final event: the outcome is unknown, so no status is attached and the caller keeps its retry identity.
 if(result===undefined)throw new Error('The connection dropped before the reply finished. Checking for the saved answer…');
 return result;
}
