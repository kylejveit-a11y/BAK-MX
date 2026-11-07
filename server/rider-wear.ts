// Real-world part life for Ask BAK: anonymous intervals from other riders' service logs on the same platform
// (shared/rider-wear.ts does the counting). Read with the service role because each rider's log is private to them;
// nothing leaves this module except per-part counts and medians across at least RIDER_WEAR_MIN_RIDERS riders.
// Runs only for part-life and service questions, and never blocks or fails an answer.
import type {SupabaseClient} from '@supabase/supabase-js';
import type {Bike} from '../shared/types.ts';
import {aggregateRiderWear,RIDER_WEAR_MIN_RIDERS,WEAR_ABOUT,type WearEvent,type WearPartSummary} from '../shared/rider-wear.ts';
import {bikeOverviews} from './bike-overviews.ts';

const MAX_BIKES=2000,MAX_EVENTS=20000,PAGE=1000;

/** The model years that share the rider's platform: the generation BAK knows for this model, else the exact year only. */
export function platformYears(bike:{manufacturer:string;model:string;model_year:number}):number[]{
 const gen=bikeOverviews[`${bike.manufacturer}|${bike.model}`]?.find(o=>o.years.includes(bike.model_year));
 return gen?.years.length?[...gen.years].sort((a,b)=>a-b):[bike.model_year];
}

export type RiderWearData={platform:string;min_riders:number;parts:WearPartSummary[]};

/** Null when the question is not about part life, the platform has too few riders, or anything fails. */
export async function riderWearFor(admin:SupabaseClient,bike:Bike|null,texts:string[]):Promise<RiderWearData|null>{
 if(!bike||!WEAR_ABOUT.test(texts.join(' ')))return null;
 try{
  const years=platformYears(bike);
  const bikes=((await admin.from('bikes').select('id,user_id').eq('manufacturer',bike.manufacturer).eq('model',bike.model).in('model_year',years).limit(MAX_BIKES)).data??[]) as {id:string;user_id:string}[];
  if(new Set(bikes.map(b=>b.user_id)).size<RIDER_WEAR_MIN_RIDERS)return null;
  const events:WearEvent[]=[];
  for(let i=0;i<bikes.length&&events.length<MAX_EVENTS;i+=200){
   const ids=bikes.slice(i,i+200).map(b=>b.id);
   for(let from=0;events.length<MAX_EVENTS;from+=PAGE){
    const {data,error}=await admin.from('service_events').select('user_id,bike_id,category,notes,engine_hours,performed_at').in('bike_id',ids).not('engine_hours','is',null).order('id',{ascending:true}).range(from,from+PAGE-1);
    if(error)return null;
    for(const r of (data??[]) as {user_id:string;bike_id:string;category:string;notes:string|null;engine_hours:number|string|null;performed_at:string}[])
     events.push({rider:r.user_id,bike:r.bike_id,category:r.category,notes:r.notes,engine_hours:r.engine_hours==null?null:Number(r.engine_hours),performed_at:r.performed_at});
    if(!data||data.length<PAGE)break;
   }
  }
  const parts=aggregateRiderWear(events);
  if(!parts.length)return null;
  return {platform:`${bike.manufacturer} ${bike.model} ${years.length>1?`${years[0]}-${years[years.length-1]}`:years[0]}`,min_riders:RIDER_WEAR_MIN_RIDERS,parts};
 }catch{return null;}
}
