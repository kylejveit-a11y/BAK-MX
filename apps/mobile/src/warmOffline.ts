// Before a ride day: read the active bike's Garage, specs, service list, setup log and tuning notes once while there is
// signal, so every one of those screens opens from the phone's copy at a track with none. Uses the same paths the screens
// read, so the cached answers are the ones they look for. Quiet and best effort; at most once every 30 minutes per bike.
import {api} from './api';
const last=new Map<string,number>();
export function bikeOfflinePaths(bikeId:string):string[]{
 return ['/api/bikes',`/api/claims?bike_id=${bikeId}`,`/api/services?bike_id=${bikeId}`,`/api/service-plan?bike_id=${bikeId}`,`/api/setup-logs?bike_id=${bikeId}`,'/api/tuning-notes?bike_id='+bikeId,`/api/build-sheet?bike_id=${bikeId}`,'/api/tracks'];
}
export async function warmOffline(bikeId:string){
 if(!bikeId||Date.now()-(last.get(bikeId)??0)<30*60e3)return;last.set(bikeId,Date.now());
 await Promise.allSettled(bikeOfflinePaths(bikeId).map(p=>api(p)));
}
