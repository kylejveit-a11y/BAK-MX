// Records a ride on the phone: one GPS point about every second, with the screen off and the phone in a pocket. Points go
// straight into a small file as they arrive, so a ride survives the app being closed or the phone restarting; nothing is
// sent anywhere until the rider taps Stop. The server works out laps and totals (shared/ride-track.ts) and keeps only
// those and a thinned route. A ride that could not be sent (no signal at the track) waits on the phone and goes later.
import {Platform} from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import {File,Paths} from 'expo-file-system';
import {summarize,type Fix,type RideSummary} from '../../../shared/ride-track';
import {api} from './api';
import {isNetworkError} from './offline';
import {readProgress,writeProgress} from './localProgress';

export const RIDE_TASK='bak-ride-record';
export type Recording={started:number;bike_id:string|null;track_id:string|null;place:string};
export type SavedRide={id:string;bike_id:string|null;track_id:string|null;place:string;kind:'track'|'trail';started_at:string;ended_at:string;seconds:number;moving_seconds:number;distance_m:number;top_speed_ms:number;laps:RideSummary['laps'];best_ms:number|null;average_ms:number|null;created_at?:string;route?:{lat:number;lng:number}[];/** still on this phone, not sent yet */pending?:boolean};
type Waiting={key:string;body:{bike_id:string|null;track_id:string|null;place:string;fixes:[number,number,number,number|null][]};summary:RideSummary};

const KEY='ride-recording',WAITING='rides-waiting';
const live=()=>new File(Paths.document,'bak-ride-live.csv');
const listeners=new Set<()=>void>();
const tell=()=>listeners.forEach(l=>{try{l();}catch{}});
/** Re-render when a recording starts, stops, or a waiting ride is sent. */
export const onRecorderChange=(f:()=>void)=>{listeners.add(f);return()=>{listeners.delete(f);};};
export const readRecording=():Recording|null=>{try{return readProgress<Recording|null>('device',KEY,null);}catch{return null;}};
const writeRecording=(r:Recording|null)=>{try{writeProgress('device',KEY,r);}catch{}tell();};

/** Runs with the app in the background: add each new point to the file. */
TaskManager.defineTask(RIDE_TASK,async({data,error}:TaskManager.TaskManagerTaskBody<{locations?:Location.LocationObject[]}>)=>{
 if(error)return;
 if(!readRecording()){try{await Location.stopLocationUpdatesAsync(RIDE_TASK);}catch{}return;}
 const rows=(data?.locations??[]).map(l=>`${Math.round(l.timestamp)},${l.coords.latitude.toFixed(6)},${l.coords.longitude.toFixed(6)},${l.coords.accuracy!=null?Math.round(l.coords.accuracy):''}\n`).join('');
 if(!rows)return;
 try{const f=live();if(!f.exists)f.create();f.write(rows,{append:true});}catch{/* a full disk: the ride simply has fewer points */}
});

/** The points recorded so far. */
export function readFixes():Fix[]{
 try{const f=live();if(!f.exists)return[];
  return f.textSync().split('\n').map(line=>{const [t,lat,lng,acc]=line.split(',');return {t:Number(t),lat:Number(lat),lng:Number(lng),acc:acc?Number(acc):null};}).filter(p=>Number.isFinite(p.t)&&Number.isFinite(p.lat)&&Number.isFinite(p.lng)&&p.t>0);}
 catch{return[];}
}
/** Laps and totals for the ride in progress, for the live card. Null until there is something to show. */
export const liveSummary=():RideSummary|null=>summarize(readFixes());

/** Asks for location and starts recording. Returns a sentence to show when it cannot. */
export async function startRecording(what:Omit<Recording,'started'>):Promise<string|null>{
 try{
  if(!await Location.hasServicesEnabledAsync())return 'Location is turned off on this phone. Turn it on in Settings, then start again.';
  const fg=await Location.requestForegroundPermissionsAsync();
  if(fg.status!=='granted')return 'BAK MX needs your location to time laps and draw your ride. Allow it in Settings › BAK MX › Location.';
  // iPhone keeps recording in a pocket once it was started on screen; asking for Always as well makes that survive a restart.
  if(Platform.OS==='ios')try{await Location.requestBackgroundPermissionsAsync();}catch{}
  try{const f=live();if(f.exists)f.delete();f.create();}catch{}
  writeRecording({...what,started:Date.now()});
  await Location.startLocationUpdatesAsync(RIDE_TASK,{accuracy:Location.Accuracy.BestForNavigation,timeInterval:1000,distanceInterval:0,
   showsBackgroundLocationIndicator:true,pausesUpdatesAutomatically:false,activityType:Location.ActivityType.Fitness,
   foregroundService:{notificationTitle:'BAK MX is recording your ride',notificationBody:'Open BAK MX and tap Stop when you’re done.',notificationColor:'#1e6fff'}});
  return null;
 }catch(e){writeRecording(null);return e instanceof Error&&e.message?`Recording could not start: ${e.message}`:'Recording could not start. Try again.';}
}
async function stopUpdates(){try{if(await Location.hasStartedLocationUpdatesAsync(RIDE_TASK))await Location.stopLocationUpdatesAsync(RIDE_TASK);}catch{}}
/** Throws the ride in progress away. */
export async function discardRecording(){await stopUpdates();try{const f=live();if(f.exists)f.delete();}catch{}writeRecording(null);}

const waiting=():Waiting[]=>{try{return readProgress<Waiting[]>('device',WAITING,[]);}catch{return[];}};
const setWaiting=(w:Waiting[])=>{try{writeProgress('device',WAITING,w.slice(-5));}catch{}tell();};
const asRide=(w:Waiting):SavedRide=>({id:w.key,bike_id:w.body.bike_id,track_id:w.body.track_id,place:w.body.place,kind:w.summary.kind,started_at:new Date(w.summary.started).toISOString(),ended_at:new Date(w.summary.ended).toISOString(),seconds:w.summary.seconds,moving_seconds:w.summary.moving_seconds,distance_m:w.summary.distance_m,top_speed_ms:w.summary.top_speed_ms,laps:w.summary.laps,best_ms:w.summary.best_ms,average_ms:w.summary.average_ms,pending:true});
/** Rides recorded with no signal, shown in the list until they are sent. */
export const waitingRides=():SavedRide[]=>waiting().map(asRide);

/** Stops and saves. Gives back the ride, a ride waiting for signal, or a sentence saying why there is nothing to save. */
export async function stopRecording():Promise<{ride:SavedRide}|{problem:string}>{
 const rec=readRecording();await stopUpdates();
 const fixes=readFixes(),summary=summarize(fixes);
 try{const f=live();if(f.exists)f.delete();}catch{}
 writeRecording(null);
 if(!rec||!summary||summary.moving_seconds<60)return {problem:'That was under a minute of riding, so there is nothing to save.'};
 // at most 30,000 points go up: about eight hours at one a second
 const sent=fixes.length>30000?fixes.filter((_,i)=>i%Math.ceil(fixes.length/30000)===0):fixes;
 const body={bike_id:rec.bike_id,track_id:rec.track_id,place:rec.place.slice(0,160),fixes:sent.map(p=>[Math.round(p.t),p.lat,p.lng,p.acc??null] as [number,number,number,number|null])};
 try{return {ride:await api<SavedRide>('/api/rides','POST',body)};}
 catch(e){
  if(!isNetworkError(e))return {problem:e instanceof Error?e.message:'The ride could not be saved.'};
  const w:Waiting={key:'waiting-'+summary.started,body,summary};
  // a long ride is big: keep it in its own file and only the summary in the list
  try{const f=new File(Paths.document,`bak-ride-${summary.started}.json`);f.create({overwrite:true});f.write(JSON.stringify(body));setWaiting([...waiting(),{...w,body:{...body,fixes:[]}}]);}catch{return {problem:'No signal, and the ride could not be kept on this phone.'};}
  return {ride:asRide(w)};
 }
}
/** Sends rides that were waiting for signal. Safe to call any time; the server ignores a ride it already has. */
export async function sendWaitingRides():Promise<number>{
 let sent=0;
 for(const w of waiting()){
  const f=new File(Paths.document,`bak-ride-${w.summary.started}.json`);
  try{
   if(!f.exists){setWaiting(waiting().filter(x=>x.key!==w.key));continue;}
   await api('/api/rides','POST',JSON.parse(f.textSync()));
   try{f.delete();}catch{}
   setWaiting(waiting().filter(x=>x.key!==w.key));sent++;
  }catch(e){if(isNetworkError(e))break; /* anything else: the server refused it, so stop offering it */ try{f.delete();}catch{} setWaiting(waiting().filter(x=>x.key!==w.key));}
 }
 return sent;
}
