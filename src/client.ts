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
