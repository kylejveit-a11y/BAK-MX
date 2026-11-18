// Ride safety on the phone. The rider picks when they'll be back; BAK starts the ride on the server (which emails their
// contacts a link, and later the overdue alert), opens Messages with the contacts and the message filled in (one tap to
// send, from the rider's own number), schedules three reminders on the phone (they work with no signal), and sends the
// phone's position every couple of minutes, or every 150 m, while the ride is on. "I'm back" ends it all; "+30 min" moves
// the back-by time and the reminders. Only the last spot is kept on the server; with no signal an update is skipped.
import React,{useEffect,useState} from 'react';
import {Platform,Share,Text,View} from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import * as SMS from 'expo-sms';
import {REMINDERS_AFTER_BACK_BY,REMINDER_COPY,SHARE_COPY as C} from '../../../shared/ride-share';
import {api} from './api';
import {readProgress,writeProgress} from './localProgress';
import {success} from './haptics';

export const SHARE_TASK='bak-ride-share';
export type Active={id:string;url:string;expires_at:string;back_by:string;alert_at:string;track:string;name:string;reminders?:string[]};
export type ContactRef={name:string;phone:string;has_email:boolean};
const KEY='ride-share';
export const readActive=():Active|null=>{try{const a=readProgress<Active|null>('device',KEY,null);return a&&Date.parse(a.expires_at)>Date.now()&&a.back_by?a:null;}catch{return null;}};
const listeners=new Set<()=>void>();
const writeActive=(a:Active|null)=>{try{writeProgress('device',KEY,a);}catch{}listeners.forEach(l=>l());};
const zone=()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'';}catch{return '';}};
export const clock=(iso:string)=>new Date(iso).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});

/** Runs with the app in the background: send the newest position for the live ride; stop when it has ended. */
TaskManager.defineTask(SHARE_TASK,async({data,error}:TaskManager.TaskManagerTaskBody<{locations?:Location.LocationObject[]}>)=>{
 if(error)return;
 const active=readActive();
 if(!active){try{await Location.stopLocationUpdatesAsync(SHARE_TASK);}catch{}return;}
 const last=data?.locations?.[data.locations.length-1];if(!last)return;
 try{await api('/api/ride-share/position','POST',{id:active.id,lat:last.coords.latitude,lng:last.coords.longitude,accuracy_m:last.coords.accuracy??null,at:new Date(last.timestamp).toISOString()});}catch{/* no signal: the page shows the last time it got one */}
});

// The reminders carry two buttons. Either opens the app and does it, so the rider sees it took.
const CATEGORY='ride-safety';
try{void Notifications.setNotificationCategoryAsync(CATEGORY,[
 {identifier:'back',buttonTitle:'I’m back',options:{opensAppToForeground:true}},
 {identifier:'extend',buttonTitle:'+30 min',options:{opensAppToForeground:true}}]).catch(()=>{});}catch{/* a build without the module */}
let sheetOpener:((track?:string)=>void)|null=null;
/** The app shell registers how to open the ride safety sheet (from a reminder, the chat offer or Home). */
export const setSheetOpener=(f:((track?:string)=>void)|null)=>{sheetOpener=f;};
export const openSafetySheet=(track?:string)=>sheetOpener?.(track);
try{Notifications.addNotificationResponseReceivedListener(r=>{
 if(r.notification.request.content.categoryIdentifier!==CATEGORY&&(r.notification.request.content.data as {kind?:string})?.kind!=='ride-safety')return;
 if(r.actionIdentifier==='back')void endRide();
 else if(r.actionIdentifier==='extend')void extendRide(30);
 openSafetySheet();
});}catch{/* no module */}

async function cancelReminders(a:Active|null){for(const id of a?.reminders??[])try{await Notifications.cancelScheduledNotificationAsync(id);}catch{}}
/** Three reminders: at back by, 15 and 25 minutes after. Local, so they fire with no signal. Asks for notifications once. */
async function scheduleReminders(backBy:string):Promise<string[]>{
 try{
  let p=await Notifications.getPermissionsAsync();if(!p.granted&&p.canAskAgain)p=await Notifications.requestPermissionsAsync();
  if(!p.granted)return [];
  const ids:string[]=[];
  for(const [i,after] of REMINDERS_AFTER_BACK_BY.entries()){
   const at=Date.parse(backBy)+after*60e3;if(at<=Date.now()+5000)continue;
   ids.push(await Notifications.scheduleNotificationAsync({content:{title:REMINDER_COPY[i].title,body:REMINDER_COPY[i].body,categoryIdentifier:CATEGORY,sound:'default',data:{kind:'ride-safety'}},
    trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:new Date(at)}}));
  }
  return ids;
 }catch{return [];}
}

async function startUpdates(){
 await Location.startLocationUpdatesAsync(SHARE_TASK,{accuracy:Location.Accuracy.Balanced,timeInterval:120000,distanceInterval:150,deferredUpdatesInterval:120000,
  showsBackgroundLocationIndicator:true,pausesUpdatesAutomatically:false,activityType:Location.ActivityType.OtherNavigation,
  foregroundService:{notificationTitle:'BAK MX ride safety is on',notificationBody:'Open BAK MX and tap I’m back when you’re done.',notificationColor:'#1e6fff'}});
}
async function stopUpdates(){try{if(await Location.hasStartedLocationUpdatesAsync(SHARE_TASK))await Location.stopLocationUpdatesAsync(SHARE_TASK);}catch{}}

/** The message, filled in with the contacts' numbers: the rider taps Send once. With no numbers (or no Messages), the share sheet. */
export async function sendLink(a:Active|null=readActive(),phones:string[]=[]){
 if(!a)return;const message=C.message(a.name,a.url,a.back_by,a.track);
 try{if(phones.length&&await SMS.isAvailableAsync()){await SMS.sendSMSAsync(phones,message);return;}}catch{}
 try{await Share.share({message});}catch{}
}

export type StartResult={ok:boolean;notice:string;contacts:ContactRef[];emailed:boolean;emailReady:boolean};
/** Starts a ride. Location is asked for, but a "no" still starts the timer and the alert (the link just has no spot). */
export async function startRide(backByMin:number,name:string,track:string):Promise<StartResult>{
 let notice='';
 try{
  const fg=await Location.requestForegroundPermissionsAsync();
  if(fg.status!=='granted')notice=C.noPermission;
  // iPhone only: Android builds don't ask for location while closed yet (see app.config.ts); the open app keeps the spot updating.
  else if(Platform.OS==='ios')try{await Location.requestBackgroundPermissionsAsync();}catch{}
  const s=await api<{id:string;url:string;expires_at:string;back_by:string;alert_at:string;contacts:ContactRef[];emailed:boolean;email_ready:boolean}>('/api/ride-share','POST',{back_by_min:backByMin,rider_name:name.slice(0,40),track_name:track.slice(0,120),tz:zone()});
  const prev=readActive();await cancelReminders(prev);
  const a:Active={id:s.id,url:s.url,expires_at:s.expires_at,back_by:s.back_by,alert_at:s.alert_at,track,name};
  a.reminders=await scheduleReminders(a.back_by);writeActive(a);
  if(fg.status==='granted'){
   if(Platform.OS==='ios')try{await startUpdates();}catch{}
   try{const now=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced});await api('/api/ride-share/position','POST',{id:a.id,lat:now.coords.latitude,lng:now.coords.longitude,accuracy_m:now.coords.accuracy??null,at:new Date(now.timestamp).toISOString()});}catch{}
  }
  success();
  return {ok:true,notice,contacts:s.contacts??[],emailed:!!s.emailed,emailReady:!!s.email_ready};
 }catch(e){return {ok:false,notice:e instanceof Error?e.message:'Could not start ride safety.',contacts:[],emailed:false,emailReady:false};}
}
/** More time: moves back by and the reminders. Returns what to tell the rider. */
export async function extendRide(minutes:number):Promise<string>{
 const a=readActive();if(!a)return 'No ride in progress.';
 try{
  const r=await api<{back_by:string;alert_at:string;expires_at:string;all_clear_sent:boolean}>('/api/ride-share/extend','POST',{id:a.id,minutes});
  await cancelReminders(a);
  const next:Active={...a,back_by:r.back_by,alert_at:r.alert_at,expires_at:r.expires_at};next.reminders=await scheduleReminders(next.back_by);writeActive(next);success();
  return `Back by ${clock(next.back_by)} now.${r.all_clear_sent?' Your contacts were told you’re OK.':''}`;
 }catch(e){return e instanceof Error?e.message:'Could not add time. Try again.';}
}
/** "I'm back": ends the ride, clears the spot, cancels the reminders; an all-clear goes if an alert had gone out. */
export async function endRide():Promise<string>{
 const a=readActive();if(!a)return C.ended;
 try{const r=await api<{all_clear_sent:boolean}>('/api/ride-share/end','POST',{id:a.id});
  await cancelReminders(a);await stopUpdates();writeActive(null);success();
  return r.all_clear_sent?`${C.ended} Your contacts got an all-clear.`:C.ended;
 }catch(e){return e instanceof Error?e.message:'Could not end ride safety. Try again.';}
}

/** The live ride (or null), kept in step with the reminders, the sheet and Ride Day. Checks the server once on open. */
export function useRide(){
 const [active,setActive]=useState<Active|null>(readActive);
 useEffect(()=>{const l=()=>setActive(readActive());listeners.add(l);
  const local=readActive();
  if(local)api<{id:string}|null>('/api/ride-share').then(r=>{if(!r||r.id!==local.id){void cancelReminders(local);void stopUpdates();writeActive(null);}}).catch(()=>{});
  return()=>{listeners.delete(l);};},[]);
 // Without "Always" location, the background task can't run: keep sending while the app is open instead.
 useEffect(()=>{if(!active)return;let sub:Location.LocationSubscription|null=null,live=true;
  void (async()=>{try{if(await Location.hasStartedLocationUpdatesAsync(SHARE_TASK))return;const perm=await Location.getForegroundPermissionsAsync();if(!perm.granted)return;
   const s=await Location.watchPositionAsync({accuracy:Location.Accuracy.Balanced,timeInterval:120000,distanceInterval:150},p=>{void api('/api/ride-share/position','POST',{id:active.id,lat:p.coords.latitude,lng:p.coords.longitude,accuracy_m:p.coords.accuracy??null,at:new Date(p.timestamp).toISOString()}).catch(()=>{});});
   if(live)sub=s;else s.remove();}catch{}})();
  return()=>{live=false;sub?.remove();};},[active?.id]);
 return active;
}

export const alwaysHint=Platform.OS==='ios'?C.always:'Your spot updates while BAK MX is open. Keep it open on the Ride Day screen during your ride. The back-by timer, reminders and alert work either way.';
export function RideStatusLine({active}:{active:Active}){
 const late=Date.now()>Date.parse(active.back_by);
 return <View style={{flexDirection:'row',alignItems:'center',gap:8}}><View style={{width:9,height:9,borderRadius:5,backgroundColor:late?'#f0c674':'#7fd09a'}}/>
  <Text style={{color:late?'#f6dfa6':'#cfe9d7',fontSize:14.5,fontWeight:'700',flexShrink:1}}>{late?`Past your back-by time. Alert at ${clock(active.alert_at)} unless you check in.`:`Back by ${clock(active.back_by)}. Nothing is sent before ${clock(active.alert_at)}.`}</Text></View>;
}

/** Signing out or deleting the account ends any ride first, so a signed-out phone never keeps reporting or alerting. */
export async function endShareOnSignOut(){
 const a=readActive();
 if(a){try{await api('/api/ride-share/end','POST',{id:a.id});}catch{}await cancelReminders(a);}
 await stopUpdates();writeActive(null);
}
