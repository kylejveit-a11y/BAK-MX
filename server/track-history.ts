import type {SupabaseClient} from '@supabase/supabase-js';
import {z} from 'zod';
import {adminDb,checked} from './database.ts';
import {HttpError} from './validation.ts';
import {weatherNow} from './weather.ts';
import {logAtTrack,visitsFrom,type HistoryLog,type HistoryReport} from '../shared/track-history.ts';

const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
type TrackRow={id:string;name:string;aliases:string[]|null;lat:number|null;lng:number|null};

/** A listed track by id, or by a name / alias as riders type it in a setup log. */
export async function findTrack(db:SupabaseClient,{id,name}:{id?:string;name?:string}):Promise<TrackRow|null>{
 if(id){const r=await db.from('tracks').select('id,name,aliases,lat,lng').eq('id',id).eq('listed',true).eq('review_status','APPROVED').maybeSingle();return (r.data as TrackRow|null)??null;}
 if(!name?.trim())return null;
 const r=await db.from('tracks').select('id,name,aliases,lat,lng').eq('listed',true).eq('review_status','APPROVED').limit(2000);
 return ((r.data??[]) as TrackRow[]).find(t=>logAtTrack(name,t))??null;
}

/** Best effort, at most four seconds: keeps the weather at the track with a report or setup log made today. Never blocks a
 *  save and never throws. Written with the service role (riders cannot write the column). */
export async function stampWeather(table:'track_reports'|'setup_logs',rowId:string,track:TrackRow|null,when:string){
 if(!track||Math.abs(Date.now()-Date.parse(when))>3*3600e3)return;
 try{
  const w=await Promise.race([weatherNow(track.lat,track.lng),new Promise<null>(r=>setTimeout(()=>r(null),4000))]);
  if(w)await adminDb().from(table).update({weather:w}).eq('id',rowId);
 }catch{/* best effort */}
}

/** GET /api/track-history?track_id=&bike_id= : the rider's own visits to a track (their token, row-level security). */
export async function handleTrackHistory(url:URL,path:string,method:string,db:SupabaseClient,owner:string):Promise<Response|null>{
 if(path!=='/api/track-history'||method!=='GET')return null;
 const trackId=z.string().trim().min(1).max(120).parse(url.searchParams.get('track_id'));
 const bikeId=url.searchParams.get('bike_id');if(bikeId)z.string().uuid().parse(bikeId);
 const tz=Number(url.searchParams.get('tz_offset')??'0');const offset=Number.isFinite(tz)&&Math.abs(tz)<=840?tz:0;
 const track=await findTrack(db,{id:trackId});if(!track)throw new HttpError(404,'Track not found');
 const since=new Date(Date.now()-730*864e5).toISOString();
 let logs=db.from('setup_logs').select('id,recorded_at,bike_id,track,settings,change_made,result,notes,conditions,weather').eq('user_id',owner).gte('recorded_at',since).order('recorded_at',{ascending:false}).limit(500);
 if(bikeId)logs=logs.eq('bike_id',bikeId);
 const [l,r]=await Promise.all([logs,db.from('track_reports').select('ridden_on,tags,tire,front_psi,rear_psi,setup_text,note,weather').eq('user_id',owner).eq('track_id',track.id).is('removed_at',null).order('ridden_on',{ascending:false}).limit(60)]);
 const mine=((checked(l)??[]) as (HistoryLog&{track:string})[]).filter(x=>logAtTrack(x.track,track)).map(({track:_t,...x})=>x);
 const reports=((checked(r)??[]) as HistoryReport[]).map(x=>({...x,front_psi:x.front_psi==null?null:Number(x.front_psi),rear_psi:x.rear_psi==null?null:Number(x.rear_psi)}));
 // The rider's calendar day for a log: their UTC offset in minutes (from the phone), so a 7 pm session stays on its day.
 const dayOf=(iso:string)=>new Date(Date.parse(iso)-offset*60e3).toISOString().slice(0,10);
 return json({track:{id:track.id,name:track.name},visits:visitsFrom(mine,reports,dayOf)});
}
