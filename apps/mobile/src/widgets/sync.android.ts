// Android's versions of the iPhone widgets and Live Activities:
//  - "Your bike" and "Next event" home-screen widgets (react-native-android-widget), drawn from a small saved file so
//    they stay current with the app closed.
//  - Race/practice day and guided jobs: a pinned (ongoing) notification, Android's stand-in for the Lock Screen
//    activity, plus a heads-up a few minutes before the next moto or session.
// Every call is best effort: a widget or notification that can't update must never break the screen that asked for it.
import * as Notifications from 'expo-notifications';
import {requestWidgetUpdate} from 'react-native-android-widget';
import {api} from '../api';
import type {Bike,ServiceEvent} from '../../../../shared/types';
import type {SetupLog,RideEvent} from '../../../../shared/rider-types';
import type {RaceDay} from '../../../../shared/race-day';
import {bikeWidgetProps,guideActivityProps,raceActivityProps,type GuideStepInfo,type RaceActivityInfo,type RaceWidgetInfo} from '../widgetData';
import {clearState,readState,writeState} from './androidStore';
import {ANDROID_BIKE_WIDGET,ANDROID_EVENT_WIDGET,renderAndroidWidget} from './androidWidgetTask';

const redraw=(name:string)=>{void requestWidgetUpdate({widgetName:name,renderWidget:info=>renderAndroidWidget(name,info.width)}).catch(()=>{});};

// ------------------------------------------------------------------ "Your bike" widget
let lastBike:Bike|undefined;
export function setRaceWidget(info:RaceWidgetInfo|null){
 if(JSON.stringify(readState().race)===JSON.stringify(info))return;
 writeState({race:info});redraw(ANDROID_BIKE_WIDGET);
}
export async function syncBikeWidget(bike:Bike|undefined){
 lastBike=bike;
 try{
  if(!bike){writeState({bike:null});redraw(ANDROID_BIKE_WIDGET);return;}
  const [services,logs]=await Promise.all([api<ServiceEvent[]>(`/api/services?bike_id=${bike.id}`).catch(()=>[] as ServiceEvent[]),api<SetupLog[]>(`/api/setup-logs?bike_id=${bike.id}`).catch(()=>[] as SetupLog[])]);
  if(lastBike!==bike)return;
  writeState({bike:bikeWidgetProps(bike,services,logs)});redraw(ANDROID_BIKE_WIDGET);
 }catch{}
}
export function clearBikeWidget(){clearState();redraw(ANDROID_BIKE_WIDGET);redraw(ANDROID_EVENT_WIDGET);}

// ------------------------------------------------------------------ "Next event" widget
export async function syncNextEventWidget(race?:RaceDay|null){
 try{
  if(race!==undefined)writeState({raceDay:race});
  const events=await api<RideEvent[]>('/api/events?scope=upcoming').catch(()=>null);
  if(events)writeState({events});
  redraw(ANDROID_EVENT_WIDGET);
 }catch{}
}
export function setRaceStatus(race:RaceDay|null){
 if(JSON.stringify(readState().raceDay)===JSON.stringify(race))return;
 writeState({raceDay:race});redraw(ANDROID_EVENT_WIDGET);
}
export function clearNextEventWidget(){writeState({events:null,raceDay:null});redraw(ANDROID_EVENT_WIDGET);}

// ------------------------------------------------------------------ pinned notifications
const CHANNEL='live',GUIDE_ID='bak-live-guide',RACE_ID='bak-live-race',RACE_SOON_ID='bak-race-next-soon';
let channelReady=false;
async function canNotify():Promise<boolean>{
 try{
  let p=await Notifications.getPermissionsAsync();
  // Race day or a guided job is the moment the rider wants this, so ask once here if they never answered.
  if(!p.granted&&p.canAskAgain&&p.status==='undetermined')p=await Notifications.requestPermissionsAsync();
  if(!p.granted)return false;
  if(!channelReady){
   // Quiet: no sound or buzz for the pinned card itself, so it can update without nagging.
   await Notifications.setNotificationChannelAsync(CHANNEL,{name:'Race day and guided jobs',importance:Notifications.AndroidImportance.LOW,showBadge:false,sound:null,vibrationPattern:null,enableVibrate:false});
   channelReady=true;
  }
  return true;
 }catch{return false;}
}
async function pin(id:string,title:string,body:string){
 if(!(await canNotify()))return;
 try{await Notifications.scheduleNotificationAsync({identifier:id,content:{title,body,sticky:true,autoDismiss:false,data:{url:'bakmx://open'},priority:Notifications.AndroidNotificationPriority.LOW},trigger:{channelId:CHANNEL}});}catch{}
}
async function unpin(id:string){try{await Notifications.dismissNotificationAsync(id);}catch{}}

let guideKey='',guideSig='';
export function syncGuideActivity(runKey:string,info:GuideStepInfo){
 const p=guideActivityProps(info);
 if(info.done){if(guideKey===runKey){guideKey='';guideSig='';void unpin(GUIDE_ID);}return;}
 const title=`${p.guide} · Step ${p.step} of ${p.total}`,body=`${p.stepTitle}\n${p.check}`,sig=title+body;
 if(guideKey===runKey&&sig===guideSig)return;
 guideKey=runKey;guideSig=sig;void pin(GUIDE_ID,title,body);
}
export function endGuideActivity(){guideKey='';guideSig='';void unpin(GUIDE_ID);}

let raceKey='',raceSig='',soonAt=0;
export function syncRaceActivity(runKey:string,info:RaceActivityInfo){
 const p=raceActivityProps(info);
 const title=`${p.head} · ${p.track}`;
 const next=p.live&&p.nextLabel?`${p.nextLabel} at ${p.nextClock}`:p.nextText;
 const body=[next,p.item?`Next: ${p.item}${p.count?` (${p.count})`:''}`:'',p.last?`Last change: ${p.last}`:''].filter(Boolean).join('\n');
 const sig=title+body;
 if(!(raceKey===runKey&&sig===raceSig)){raceKey=runKey;raceSig=sig;void pin(RACE_ID,title,body||'Open BAK MX for your day.');}
 // A heads-up 10 minutes before the moto or session (the pinned card can't count down by itself on Android).
 const at=p.live?p.nextAt-10*60000:0;
 if(at!==soonAt){
  soonAt=at;
  void (async()=>{
   try{await Notifications.cancelScheduledNotificationAsync(RACE_SOON_ID);}catch{}
   if(at>Date.now()+30000&&await canNotify()){
    try{await Notifications.scheduleNotificationAsync({identifier:RACE_SOON_ID,content:{title:`${p.nextLabel||'Next up'} in 10 minutes`,body:`${p.track}. Gear on, bike ready.`,data:{url:'bakmx://open'}},trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:new Date(at),channelId:'default'}});}catch{}
   }
  })();
 }
}
export function endRaceActivity(){
 raceKey='';raceSig='';soonAt=0;void unpin(RACE_ID);
 void Notifications.cancelScheduledNotificationAsync(RACE_SOON_ID).catch(()=>{});
}
