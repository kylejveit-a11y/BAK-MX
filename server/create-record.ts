import type {SupabaseClient} from '@supabase/supabase-js';
import {canonicalJson} from '../shared/create-retry.ts';
import {checked} from './database.ts';
import {HttpError,uuid} from './validation.ts';

export function createInput(raw:unknown){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new HttpError(400,'Invalid request');
 const {create_id,...data}=raw as Record<string,unknown>;
 return {id:create_id===undefined?undefined:uuid.parse(create_id),data};
}
export function sameCreatedInput(input:Record<string,unknown>,existing:Record<string,unknown>){
 const saved=Object.fromEntries(Object.keys(input).map(key=>[key,key==='performed_at'&&typeof existing[key]==='string'?new Date(existing[key]).toISOString():typeof input[key]==='number'&&typeof existing[key]==='string'&&['engine_hours','next_due_hours','model_year'].includes(key)?Number(existing[key]):existing[key]]));
 return canonicalJson(input)===canonicalJson(saved);
}
// Uses the existing UUID primary key. Never upserts or overwrites an existing record.
export async function createRecord(db:SupabaseClient,table:'bikes'|'service_events'|'conversations',owner:string,input:Record<string,unknown>,id?:string){
 const result=await db.from(table).insert({...input,user_id:owner,...(id?{id}:{})}).select().single();
 if(!result.error)return {record:result.data,replayed:false};
 if(!id||result.error.code!=='23505'){checked(result);throw new HttpError(503,'Could not save record');}
 const existing=checked(await db.from(table).select('*').eq('id',id).eq('user_id',owner).maybeSingle());
 if(!existing||!sameCreatedInput(input,existing))throw new HttpError(409,'This save identifier was already used for different data. Refresh your saved records before starting another entry.');
 return {record:existing,replayed:true};
}
