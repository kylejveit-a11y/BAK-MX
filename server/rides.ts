// Saving a recorded ride (shared/ride-track.ts does the maths). The phone posts its points as compact rows
// [time ms, latitude, longitude, accuracy m]; the server keeps the totals, the laps and a thinned route, never the raw points.
import {z} from 'zod';
import {summarize,thinRoute,type Fix} from '../shared/ride-track.ts';

const id=z.string().uuid();
export const rideSchema=z.object({
 bike_id:id.nullish(),track_id:id.nullish(),place:z.string().trim().max(160).default(''),
 fixes:z.array(z.tuple([z.number().int().min(1.5e12).max(4.2e12),z.number().min(-90).max(90),z.number().min(-180).max(180),z.number().min(0).max(5000).nullable()])).min(30).max(30000),
});
/** Everything a list row needs: the route stays out until one ride is opened. */
export const RIDE_LIST='id,bike_id,track_id,place,kind,started_at,ended_at,seconds,moving_seconds,distance_m,top_speed_ms,laps,best_ms,average_ms,created_at';
/** The row to save, or null when there was not a minute of actual riding in it. */
export function rideRow(data:z.infer<typeof rideSchema>){
 const fixes:Fix[]=data.fixes.map(([t,lat,lng,acc])=>({t,lat,lng,acc})),s=summarize(fixes);
 if(!s||s.moving_seconds<60)return null;
 return{bike_id:data.bike_id??null,track_id:data.track_id??null,place:data.place,kind:s.kind,started_at:new Date(s.started).toISOString(),ended_at:new Date(s.ended).toISOString(),
  seconds:s.seconds,moving_seconds:s.moving_seconds,distance_m:s.distance_m,top_speed_ms:s.top_speed_ms,laps:s.laps,best_ms:s.best_ms,average_ms:s.average_ms,gate:s.gate,route:thinRoute(fixes)};
}
