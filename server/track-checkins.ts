import type {SupabaseClient} from '@supabase/supabase-js';
import {z} from 'zod';
import {adminDb,checked} from './database.ts';
import {HttpError,readJson} from './validation.ts';
import {CHECKIN_LIMITS,aggregateCheckins,normalizeStatuses,statusProblem,type LiveConditions} from '../shared/track-checkins.ts';

/** Live check-ins ("Right now"). A rider writes and reads only their own rows (their token, row-level security). Other riders'
 *  check-ins are read here with the service role, only as counts and times: never a name, never a row. Riders hidden by a block
 *  either way are left out. Additive for Ask BAK: a failed read returns nothing. */
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export const checkinSchema=z.object({track_id:z.string().trim().min(1).max(120),statuses:z.array(z.string().max(20)).min(1).max(CHECKIN_LIMITS.perPick)}).strict()
 .superRefine((v,ctx)=>{const p=statusProblem(v.statuses);if(p)ctx.addIssue({code:'custom',path:['statuses'],message:p});}).transform(v=>({...v,statuses:normalizeStatuses(v.statuses)}));

export async function liveConditions(admin:SupabaseClient,trackIds:string[],viewer:string,now=new Date()):Promise<Map<string,LiveConditions>>{
 const out=new Map<string,LiveConditions>();if(!trackIds.length)return out;
 try{
  const since=new Date(now.getTime()-CHECKIN_LIMITS.windowHours*3600e3).toISOString();
  const [rows,blocks]=await Promise.all([
   admin.from('track_checkins').select('user_id,track_id,statuses,created_at').in('track_id',trackIds).gte('created_at',since).order('created_at',{ascending:false}).limit(1000),
   admin.from('user_blocks').select('blocker_id,blocked_id').or(`blocker_id.eq.${viewer},blocked_id.eq.${viewer}`).limit(5000)]);
  if(rows.error||!Array.isArray(rows.data))return out;
  const hidden=new Set(((blocks.data??[]) as {blocker_id:string;blocked_id:string}[]).map(b=>b.blocker_id===viewer?b.blocked_id:b.blocker_id));
  for(const id of trackIds){const agg=aggregateCheckins((rows.data as {user_id:string;track_id:string;statuses:string[];created_at:string}[]).filter(r=>r.track_id===id),now,{hidden});if(agg)out.set(id,agg);}
 }catch{/* additive */}
 return out;
}

export async function handleTrackCheckins(req:Request,url:URL,path:string,method:string,db:SupabaseClient,owner:string,admin:()=>SupabaseClient=adminDb):Promise<Response|null>{
 if(path!=='/api/track-checkins')return null;
 if(method==='GET'){
  const track=z.string().trim().min(1).max(120).parse(url.searchParams.get('track_id'));
  const row=checked(await db.from('tracks').select('id').eq('id',track).eq('listed',true).eq('review_status','APPROVED').maybeSingle());
  if(!row)throw new HttpError(404,'Track not found');
  const agg=(await liveConditions(admin(),[track],owner)).get(track);
  return json(agg?{...agg,as_of:new Date().toISOString()}:null);
 }
 if(method==='POST'){
  const data=checkinSchema.parse(await readJson(req,2000));
  const track=checked(await db.from('tracks').select('id').eq('id',data.track_id).eq('listed',true).eq('review_status','APPROVED').maybeSingle());
  if(!track)throw new HttpError(404,'Pick one of BAK’s tracks to check in.');
  const {count,error}=await db.from('track_checkins').select('id',{count:'exact',head:true}).eq('user_id',owner).gte('created_at',new Date(Date.now()-3600e3).toISOString());
  if(error)throw new HttpError(503,'Could not check in. Nothing was changed.');
  if((count??0)>=CHECKIN_LIMITS.perHour)throw new HttpError(429,'That’s a lot of check-ins this hour. Try again a bit later.');
  const result=await db.from('track_checkins').insert({...data,user_id:owner}).select('id,track_id,statuses,created_at').single();
  if(result.error)throw new HttpError(result.error.code==='42501'?403:503,'Could not check in. Nothing was changed.');
  return json(result.data,201);
 }
 if(method==='DELETE'){
  const id=z.string().uuid().parse(url.searchParams.get('id'));
  const rows=checked(await db.from('track_checkins').delete().eq('id',id).eq('user_id',owner).select('id'));
  if(!rows?.length)throw new HttpError(404,'Check-in not found');
  return json({deleted:true});
 }
 return null;
}
