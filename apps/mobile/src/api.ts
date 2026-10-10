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
