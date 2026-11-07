import type {SupabaseClient} from '@supabase/supabase-js';
import {z} from 'zod';
import {adminDb,checked} from './database.ts';
import {HttpError,readJson,uuid} from './validation.ts';
import {objectionable} from './content-rules.ts';
import {REPORT_LIMITS,aggregateReports,dayProblem,normalizeTags,tagProblem,type RecentRiderReports,type ReportRow} from '../shared/track-reports.ts';

/** "How did it ride?" reports. A rider writes and reads only their own rows (their token, row-level security). What other
 *  riders reported is only ever read here, with the service role, and only as counts and anonymous notes: never a name,
 *  never another rider's row. Riders hidden by a block either way are left out, as everywhere else. */

const utcToday=()=>new Date().toISOString().slice(0,10);
const text=(max:number)=>z.string().trim().max(max).default('');
const psi=z.number().finite().min(REPORT_LIMITS.minPsi).max(REPORT_LIMITS.maxPsi).nullable().default(null);
export const trackReportSchema=z.object({
 track_id:z.string().trim().min(1).max(120),
 ridden_on:z.string(),
 tags:z.array(z.string().max(40)).max(16),
 race_id:uuid.nullable().default(null),
 tire:text(REPORT_LIMITS.tire),front_psi:psi,rear_psi:psi,
 setup_log_id:uuid.nullable().default(null),setup_text:text(REPORT_LIMITS.setupText),
 note:text(REPORT_LIMITS.note),
}).strict().superRefine((v,ctx)=>{
 const tags=tagProblem(v.tags);if(tags)ctx.addIssue({code:'custom',path:['tags'],message:tags});
 const day=dayProblem(v.ridden_on,utcToday());if(day)ctx.addIssue({code:'custom',path:['ridden_on'],message:day});
 if(v.setup_log_id&&v.setup_text)ctx.addIssue({code:'custom',path:['setup_text'],message:'Link a setup log entry or type the setup, not both.'});
}).transform(v=>({...v,tags:normalizeTags(v.tags)}));
export type TrackReportInput=z.infer<typeof trackReportSchema>;

const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const OWN='id,track_id,race_id,ridden_on,tags,tire,front_psi,rear_psi,setup_log_id,setup_text,note,created_at';

/** Recent reports per track, for Ask BAK (with anonymous notes) or the track screen (counts only). Additive: a read that
 *  fails returns nothing, so an answer is never blocked by it. */
export async function recentRiderReports(admin:SupabaseClient,trackIds:string[],viewer:string,{today=utcToday(),notes=3}:{today?:string;notes?:number}={}):Promise<Map<string,RecentRiderReports>>{
 const out=new Map<string,RecentRiderReports>();
 if(!trackIds.length)return out;
 try{
  const since=new Date(Date.parse(today+'T12:00:00Z')-90*864e5).toISOString().slice(0,10);
  const [rows,blocks]=await Promise.all([
   admin.from('track_reports').select('user_id,track_id,ridden_on,tags,note,front_psi,rear_psi').in('track_id',trackIds).gte('ridden_on',since).is('removed_at',null).order('ridden_on',{ascending:false}).limit(2000),
   admin.from('user_blocks').select('blocker_id,blocked_id').or(`blocker_id.eq.${viewer},blocked_id.eq.${viewer}`).limit(5000)]);
  if(rows.error||!Array.isArray(rows.data))return out;
  const hidden=new Set(((blocks.data??[]) as {blocker_id:string;blocked_id:string}[]).map(b=>b.blocker_id===viewer?b.blocked_id:b.blocker_id));
  for(const id of trackIds){
   const agg=aggregateReports((rows.data as (ReportRow&{track_id:string})[]).filter(r=>r.track_id===id),today,{notes,hidden});
   if(agg)out.set(id,agg);
  }
 }catch{/* additive */}
 return out;
}

export async function handleTrackReports(req:Request,url:URL,path:string,method:string,db:SupabaseClient,owner:string,admin:()=>SupabaseClient=adminDb):Promise<Response|null>{
 if(path==='/api/track-reports/summary'&&method==='GET'){
  const track=z.string().trim().min(1).max(120).parse(url.searchParams.get('track_id'));
  // Only tracks a rider can pick: reference-only tracks never get a summary.
  const row=checked(await db.from('tracks').select('id').eq('id',track).eq('listed',true).eq('review_status','APPROVED').maybeSingle());
  if(!row)throw new HttpError(404,'Track not found');
  const agg=(await recentRiderReports(admin(),[track],owner,{notes:0})).get(track)??null;
  return json(agg?{...agg,recent_notes:[]}:null);
 }
 if(path!=='/api/track-reports')return null;
 if(method==='GET'){
  let query=db.from('track_reports').select(OWN).eq('user_id',owner).order('ridden_on',{ascending:false}).order('created_at',{ascending:false}).limit(50);
  const track=url.searchParams.get('track_id');if(track)query=query.eq('track_id',track.slice(0,120));
  return json(checked(await query)??[]);
 }
 if(method==='POST'){
  const data=trackReportSchema.parse(await readJson(req,8000));
  if([data.note,data.tire,data.setup_text].some(t=>t&&objectionable(t)))throw new HttpError(422,'That wording isn’t allowed here. Edit it and try again.');
  const track=checked(await db.from('tracks').select('id').eq('id',data.track_id).eq('listed',true).eq('review_status','APPROVED').maybeSingle());
  if(!track)throw new HttpError(404,'Pick one of BAK’s tracks to report on it.');
  if(data.setup_log_id&&!checked(await db.from('setup_logs').select('id').eq('id',data.setup_log_id).eq('user_id',owner).maybeSingle()))throw new HttpError(404,'Setup entry not found');
  if(data.race_id&&!checked(await db.from('races').select('id').eq('id',data.race_id).eq('user_id',owner).maybeSingle()))throw new HttpError(404,'Race not found');
  // One report per rider, track and day (a second save replaces the first), and a daily cap so nobody can flood a track.
  const {count,error}=await db.from('track_reports').select('id',{count:'exact',head:true}).eq('user_id',owner).gte('created_at',new Date(Date.now()-864e5).toISOString());
  if(error)throw new HttpError(503,'Could not save. Nothing was changed.');
  if((count??0)>=REPORT_LIMITS.perDay)throw new HttpError(429,'That’s a lot of track reports for one day. Try again tomorrow.');
  const result=await db.from('track_reports').upsert({...data,user_id:owner},{onConflict:'user_id,track_id,ridden_on'}).select(OWN).single();
  if(result.error)throw new HttpError(result.error.code==='42501'?403:503,'Could not save. Nothing was changed.');
  return json(result.data,201);
 }
 if(method==='DELETE'){
  const rows=checked(await db.from('track_reports').delete().eq('id',uuid.parse(url.searchParams.get('id'))).eq('user_id',owner).select('id'));
  if(!rows?.length)throw new HttpError(404,'Track report not found');
  return json({deleted:true});
 }
 return null;
}
