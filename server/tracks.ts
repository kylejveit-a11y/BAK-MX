import type {SupabaseClient} from '@supabase/supabase-js';
import {matchTracks,type TrackName} from '../shared/track-match.ts';

/** Track knowledge (docs/research/tracks/README.md) for the tracks a rider names or is racing at soon. Additive:
 *  any read failure returns nothing so the answer is never blocked. */
export type TrackProfile={id:string;name:string;city:string|null;state:string;status:string;access:string;types:string[];tracks_on_site:string[];
 soil:Record<string,unknown>;layout:Record<string,unknown>;conditions:Record<string,unknown>;rider_reports:{says:string;source_type?:string;date?:string|null}[];
 confidence:string;gaps:string[];elevation_ft:number|null;race?:{date:string;kind:string;days_away:number}};

let names:{at:number;rows:TrackName[]}|null=null;
async function trackNames(db:SupabaseClient):Promise<TrackName[]>{
 if(names&&Date.now()-names.at<10*60_000)return names.rows;
 const {data,error}=await db.from('tracks').select('id,name,aliases').limit(5000);
 if(error||!Array.isArray(data))return names?.rows??[];
 names={at:Date.now(),rows:data as TrackName[]};return names.rows;
}
const FIELDS='id,name,city,state,status,access,types,tracks_on_site,soil,layout,conditions,rider_reports,confidence,gaps,elevation_ft';
const shape=(r:Record<string,unknown>):TrackProfile=>({...(r as unknown as TrackProfile),
 // Riders get what riders said and when; the links stay on file for review, not in the briefing.
 rider_reports:((r.rider_reports as {says:string;source_type?:string;date?:string|null}[])??[]).slice(0,8).map(x=>({says:x.says,source_type:x.source_type,date:x.date??null}))});

/** Tracks named in this message or the last few rider turns, plus the rider's races in the next 21 days. */
export async function trackContext(db:SupabaseClient,owner:string,texts:string[]):Promise<TrackProfile[]>{
 try{
  const today=new Date().toISOString().slice(0,10),soon=new Date(Date.now()+21*86400_000).toISOString().slice(0,10);
  const [all,races]=await Promise.all([trackNames(db),db.from('races').select('track_id,race_date,kind').eq('user_id',owner).gte('race_date',today).lte('race_date',soon).order('race_date').limit(3)]);
  const named=texts.flatMap(t=>matchTracks(t,all)).map(t=>t.id);
  const raceRows=(races.data??[]).filter(r=>r.track_id) as {track_id:string;race_date:string;kind:string}[];
  const ids=[...new Set([...named,...raceRows.map(r=>r.track_id)])].slice(0,3);
  if(!ids.length)return [];
  const {data,error}=await db.from('tracks').select(FIELDS).in('id',ids).eq('review_status','APPROVED');
  if(error||!Array.isArray(data))return [];
  return ids.map(id=>data.find(r=>r.id===id)).filter(Boolean).map(r=>{
   const p=shape(r as Record<string,unknown>),race=raceRows.find(x=>x.track_id===p.id);
   if(race)p.race={date:race.race_date,kind:race.kind,days_away:Math.round((Date.parse(race.race_date)-Date.parse(today))/86400_000)};
   return p;
  });
 }catch{return [];}
}
