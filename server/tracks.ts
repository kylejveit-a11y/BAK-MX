import type {SupabaseClient} from '@supabase/supabase-js';
import {matchTracks,type TrackName} from '../shared/track-match.ts';
import type {RecentRiderReports} from '../shared/track-reports.ts';
import {recentRiderReports} from './track-reports.ts';

/** Track knowledge (docs/research/tracks/README.md) for the tracks a rider names or is racing at soon. Additive:
 *  any read failure returns nothing so the answer is never blocked. */
export type TrackProfile={id:string;name:string;city:string|null;state:string;status:string;access:string;types:string[];tracks_on_site:string[];
 soil:Record<string,unknown>;layout:Record<string,unknown>;conditions:Record<string,unknown>;rider_reports:{says:string;source_type?:string;date?:string|null}[];
 confidence:string;gaps:string[];elevation_ft:number|null;lat?:number|null;lng?:number|null;race?:{date:string;kind:string;days_away:number};
 // What BAK MX riders logged after riding there lately ("How did it ride?"): counts and anonymous notes, with dates.
 recent_rider_reports?:RecentRiderReports};

let names:{at:number;rows:TrackName[]}|null=null;
async function trackNames(db:SupabaseClient):Promise<TrackName[]>{
 if(names&&Date.now()-names.at<10*60_000)return names.rows;
 const {data,error}=await db.from('tracks').select('id,name,aliases,city').limit(5000);
 if(error||!Array.isArray(data))return names?.rows??[];
 names={at:Date.now(),rows:data as TrackName[]};return names.rows;
}
const FIELDS='id,name,city,state,status,access,types,tracks_on_site,soil,layout,conditions,rider_reports,confidence,gaps,elevation_ft,lat,lng';
const shape=(r:Record<string,unknown>):TrackProfile=>({...(r as unknown as TrackProfile),
 // Riders get what riders said and when; the links stay on file for review, not in the briefing.
 rider_reports:((r.rider_reports as {says:string;source_type?:string;date?:string|null}[])??[]).slice(0,8).map(x=>({says:x.says,source_type:x.source_type,date:x.date??null}))});

/** Tracks named in this message or the last few rider turns, plus the rider's races in the next 21 days. With `reports`
 *  (the service-role client) each profile also carries recent_rider_reports, when riders reported in the last 90 days. */
export async function trackContext(db:SupabaseClient,owner:string,texts:string[],reports?:SupabaseClient|null):Promise<TrackProfile[]>{
 try{
  const today=new Date().toISOString().slice(0,10),soon=new Date(Date.now()+21*86400_000).toISOString().slice(0,10);
  const [all,races]=await Promise.all([trackNames(db),db.from('races').select('track_id,race_date,kind').eq('user_id',owner).gte('race_date',today).lte('race_date',soon).order('race_date').limit(3)]);
  const named=texts.flatMap(t=>matchTracks(t,all)).map(t=>t.id);
  const raceRows=(races.data??[]).filter(r=>r.track_id) as {track_id:string;race_date:string;kind:string}[];
  const ids=[...new Set([...named,...raceRows.map(r=>r.track_id)])].slice(0,3);
  if(!ids.length)return [];
  const {data,error}=await db.from('tracks').select(FIELDS).in('id',ids).eq('review_status','APPROVED');
  if(error||!Array.isArray(data))return [];
  const recent=reports?await recentRiderReports(reports,ids,owner):new Map<string,RecentRiderReports>();
  return ids.map(id=>data.find(r=>r.id===id)).filter(Boolean).map(r=>{
   const p=shape(r as Record<string,unknown>),race=raceRows.find(x=>x.track_id===p.id);
   if(race)p.race={date:race.race_date,kind:race.kind,days_away:Math.round((Date.parse(race.race_date)-Date.parse(today))/86400_000)};
   const rr=recent.get(p.id);if(rr)p.recent_rider_reports=rr;
   return p;
  });
 }catch{return [];}
}

/** The tracks BAK knows, for the race-day and "How did it ride?" pickers: id, name, place, whether a forecast can be had
 *  (location on file), and the location rounded to about a mile so the nearest tracks can be offered first. */
export async function trackDirectory(db:SupabaseClient):Promise<{id:string;name:string;city:string|null;state:string;aliases:string[];weather:boolean;lat:number|null;lng:number|null}[]>{
 // Reference-only tracks (listed=false) are never offered to riders, only used when a rider names them.
 const {data,error}=await db.from('tracks').select('id,name,aliases,city,state,lat,lng').eq('review_status','APPROVED').eq('listed',true).order('name').limit(2000);
 if(error||!Array.isArray(data))return [];
 const round=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?Math.round(v*100)/100:null;
 return data.map(r=>({id:r.id as string,name:r.name as string,city:(r.city as string|null)??null,state:r.state as string,aliases:(r.aliases as string[]|null)??[],weather:r.lat!=null&&r.lng!=null,lat:round(r.lat),lng:round(r.lng)}));
}
