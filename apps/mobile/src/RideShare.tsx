// Safety share link on the phone. The rider picks how long, BAK starts a share and hands back a link to text to someone; the
// phone then sends its position every couple of minutes (or every 150 m) with the app in the pocket, until the share ends by
// itself, the rider stops it, or they sign out. Only the last spot is kept on the server. With no signal the update is
// skipped (the page says when the rider was last seen); nothing is queued, since an old spot sent late would mislead.
import React,{useCallback,useEffect,useState} from 'react';
import {Linking,Platform,Share,Text,View} from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import {SHARE_COPY as C,SHARE_HOURS} from '../../../shared/ride-share';
import {api} from './api';
import {readProgress,writeProgress} from './localProgress';
import {success} from './haptics';

export const SHARE_TASK='bak-ride-share';
type Active={id:string;url:string;expires_at:string};
const KEY='ride-share';
export const readActive=():Active|null=>{try{const a=readProgress<Active|null>('device',KEY,null);return a&&Date.parse(a.expires_at)>Date.now()?a:null;}catch{return null;}};
const writeActive=(a:Active|null)=>{try{writeProgress('device',KEY,a);}catch{}};

/** Runs with the app in the background: send the newest position for the live share; stop when the share has ended. */
TaskManager.defineTask(SHARE_TASK,async({data,error}:TaskManager.TaskManagerTaskBody<{locations?:Location.LocationObject[]}>)=>{
 if(error)return;
 const active=readActive();
 if(!active){try{await Location.stopLocationUpdatesAsync(SHARE_TASK);}catch{}writeActive(null);return;}
 const last=data?.locations?.[data.locations.length-1];if(!last)return;
 try{await api('/api/ride-share/position','POST',{id:active.id,lat:last.coords.latitude,lng:last.coords.longitude,accuracy_m:last.coords.accuracy??null,at:new Date(last.timestamp).toISOString()});}catch{/* no signal: the page shows the last time it got one */}
});

async function startUpdates(){
 await Location.startLocationUpdatesAsync(SHARE_TASK,{accuracy:Location.Accuracy.Balanced,timeInterval:120000,distanceInterval:150,deferredUpdatesInterval:120000,
  showsBackgroundLocationIndicator:true,pausesUpdatesAutomatically:false,activityType:Location.ActivityType.OtherNavigation,
  foregroundService:{notificationTitle:'BAK MX is sharing your location',notificationBody:'Open BAK MX to stop sharing.',notificationColor:'#1e6fff'}});
}

export function useRideShare(){
 const [active,setActive]=useState<Active|null>(readActive),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 // The server is the truth: a share ended on another device or expired clears here too.
 const refresh=useCallback(async()=>{
  const local=readActive();if(!local){setActive(null);return;}
  try{const r=await api<{id:string}|null>('/api/ride-share');if(!r||r.id!==local.id){writeActive(null);setActive(null);try{await Location.stopLocationUpdatesAsync(SHARE_TASK);}catch{}}}catch{/* offline: keep */}
 },[]);
 useEffect(()=>{void refresh();},[refresh]);
 // Without "Always" location, the background task can't run: keep sending while this screen is open instead.
 useEffect(()=>{if(!active)return;let sub:Location.LocationSubscription|null=null,live=true;
  void (async()=>{try{if(await Location.hasStartedLocationUpdatesAsync(SHARE_TASK))return;
   const s=await Location.watchPositionAsync({accuracy:Location.Accuracy.Balanced,timeInterval:120000,distanceInterval:150},p=>{void api('/api/ride-share/position','POST',{id:active.id,lat:p.coords.latitude,lng:p.coords.longitude,accuracy_m:p.coords.accuracy??null,at:new Date(p.timestamp).toISOString()}).catch(()=>{});});
   if(live)sub=s;else s.remove();}catch{}})();
  return()=>{live=false;sub?.remove();};},[active?.id]);
 async function start(hours:number,name:string){
  if(busy)return;setBusy(true);setNotice('');
  try{
   const fg=await Location.requestForegroundPermissionsAsync();
   if(fg.status!=='granted'){setNotice(C.noPermission);return;}
   // Background lets it keep updating in a pocket; if the rider says no, it still updates while the app is open.
   try{await Location.requestBackgroundPermissionsAsync();}catch{}
   const s=await api<Active>('/api/ride-share','POST',{hours,rider_name:name.slice(0,40)});
   const a={id:s.id,url:s.url,expires_at:s.expires_at};writeActive(a);setActive(a);
   try{await startUpdates();}catch{}
   try{const now=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced});await api('/api/ride-share/position','POST',{id:a.id,lat:now.coords.latitude,lng:now.coords.longitude,accuracy_m:now.coords.accuracy??null,at:new Date(now.timestamp).toISOString()});}catch{}
   success();await send(a,name);
  }catch(e){setNotice(e instanceof Error?e.message:'Could not start sharing.');}
  finally{setBusy(false);}
 }
 async function send(a:Active|null=active,name=''){
  if(!a)return;const until=new Date(a.expires_at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
  try{await Share.share({message:C.message(name,a.url,until)});}catch{}
 }
 async function stop(){
  if(busy||!active)return;setBusy(true);
  try{await api('/api/ride-share/end','POST',{id:active.id});setNotice(C.ended);}catch(e){setNotice(e instanceof Error?e.message:'Could not stop sharing. Try again.');setBusy(false);return;}
  try{await Location.stopLocationUpdatesAsync(SHARE_TASK);}catch{}
  writeActive(null);setActive(null);setBusy(false);
 }
 return {active,busy,notice,start,stop,send:()=>send(),openSettings:()=>void Linking.openSettings()};
}

export const SHARE_CHOICES=SHARE_HOURS.map(h=>({hours:h,label:`${h} hours`}));
export const shareUntil=(a:{expires_at:string})=>new Date(a.expires_at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
export const alwaysHint=Platform.OS==='ios'?C.always:'To keep updating with the phone in your pocket, choose “Allow all the time” when asked. You can stop sharing any time.';
export function ShareStatusLine({until}:{until:string}){
 return <View style={{flexDirection:'row',alignItems:'center',gap:8}}><View style={{width:9,height:9,borderRadius:5,backgroundColor:'#7fd09a'}}/><Text style={{color:'#cfe9d7',fontSize:14,fontWeight:'700'}}>{C.sharing} until {until}</Text></View>;
}

/** Signing out or deleting the account ends any live share first, so a signed-out phone never keeps reporting. */
export async function endShareOnSignOut(){
 const a=readActive();
 if(a){try{await api('/api/ride-share/end','POST',{id:a.id});}catch{}}
 try{if(await Location.hasStartedLocationUpdatesAsync(SHARE_TASK))await Location.stopLocationUpdatesAsync(SHARE_TASK);}catch{}
 writeActive(null);
}
