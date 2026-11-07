// Keeps the Home Screen widgets (your bike, next event) and the Live Activities (guided job, race day) in step with the app. Every call is
// best effort: a widget that can't update must never break the screen that asked for it.
// iOS only: sync.ts is the no-op used on Android and web, where the SwiftUI pieces don't exist.
import {api} from '../api';
import type {Bike,ServiceEvent} from '../../../../shared/types';
import type {SetupLog,RideEvent} from '../../../../shared/rider-types';
import type {RaceDay} from '../../../../shared/race-day';
import {after,widgetsDirectory} from 'expo-widgets';
import {Asset} from 'expo-asset';
import {File} from 'expo-file-system';
import {makeBikeWidget} from './BikeWidget';
import {makeGuideActivity} from './GuideActivity';
import {makeNextEventWidget} from './NextEventWidget';
import {makeRaceActivity} from './RaceActivity';
import {bikeWidgetProps,emptyBikeWidget,emptyNextEvent,guideActivityProps,nextEventTimeline,raceActivityProps,raceActivityStale,raceTimeline,type GuideStepInfo,type RaceActivityInfo,type RaceWidgetInfo} from '../widgetData';

const ios=true;
type Mods={bikeWidget:ReturnType<typeof makeBikeWidget>;guideActivity:ReturnType<typeof makeGuideActivity>};
let mods:Mods|null|undefined;
function load():Mods|null{
 if(mods!==undefined)return mods;
 try{mods={bikeWidget:makeBikeWidget(),guideActivity:makeGuideActivity()};}catch{mods=null;}
 return mods;
}
// The newer pieces load on their own, so a build without them (an older native binary) still keeps the bike widget.
type Extra={nextEvent:ReturnType<typeof makeNextEventWidget>;raceActivity:ReturnType<typeof makeRaceActivity>};
let extra:Extra|null|undefined;
function loadExtra():Extra|null{
 if(extra!==undefined)return extra;
 try{extra={nextEvent:makeNextEventWidget(),raceActivity:makeRaceActivity()};}catch{extra=null;}
 return extra;
}

// The widget can't read the app's bundled images, so the logo is copied once into the shared App Group folder.
const LOGO_FILE='bak-mx-logo-v1.png';
let logoUri:string|null=null;
async function widgetLogo():Promise<string>{
 if(logoUri!==null)return logoUri;
 try{
  if(!widgetsDirectory)return '';
  const dest=new File(widgetsDirectory,LOGO_FILE);
  if(!dest.exists){const asset=Asset.fromModule(require('../../assets/bak-mx-wordmark.png'));await asset.downloadAsync();if(!asset.localUri)return '';new File(asset.localUri).copy(dest);}
  logoUri=dest.uri;return logoUri;
 }catch{return '';}
}

let lastKey='',lastBike:Bike|undefined,race:RaceWidgetInfo|null=null;
/** The race countdown for the widget (null: none). Re-draws the widget when it changes. */
export function setRaceWidget(info:RaceWidgetInfo|null){
 if(!ios)return;const key=JSON.stringify(info);if(key===JSON.stringify(race))return;race=info;
 if(lastBike)void syncBikeWidget(lastBike);
}
/** Refreshes the widget for this bike (or clears it when there is none). */
export async function syncBikeWidget(bike:Bike|undefined){
 if(!ios)return;const m=load();if(!m)return;lastBike=bike;
 try{
  if(!bike){if(lastKey!=='none'){m.bikeWidget.updateSnapshot({...emptyBikeWidget,logo:await widgetLogo()});lastKey='none';}return;}
  const [services,logs]=await Promise.all([api<ServiceEvent[]>(`/api/services?bike_id=${bike.id}`).catch(()=>[] as ServiceEvent[]),api<SetupLog[]>(`/api/setup-logs?bike_id=${bike.id}`).catch(()=>[] as SetupLog[])]);
  const props={...bikeWidgetProps(bike,services,logs),logo:await widgetLogo()},key=JSON.stringify([props,race,new Date().toDateString()]);
  if(key!==lastKey){if(race)m.bikeWidget.updateTimeline(raceTimeline(props,race));else m.bikeWidget.updateSnapshot(props);lastKey=key;}
 }catch{}
}
export function clearBikeWidget(){if(!ios)return;const m=load();if(!m)return;try{m.bikeWidget.updateSnapshot(emptyBikeWidget);lastKey='none';}catch{}}

const FOUR_HOURS=4*3600*1000;
let current:{key:string;activity:ReturnType<Mods['guideActivity']['start']>}|null=null;
/** Starts or moves the Lock Screen activity for the guide on screen; a different guide replaces it. */
export function syncGuideActivity(runKey:string,info:GuideStepInfo){
 if(!ios)return;const m=load();if(!m)return;
 const props=guideActivityProps(info),stale=new Date(Date.now()+FOUR_HOURS);
 try{
  if(!current){const existing=m.guideActivity.getInstances();for(const a of existing)void a.end('immediate').catch(()=>{});}
  if(current&&current.key!==runKey){void current.activity.end('immediate').catch(()=>{});current=null;}
  if(!current){if(info.done)return;current={key:runKey,activity:m.guideActivity.start(props,'bakmx://open',stale)};return;}
  if(info.done){const a=current.activity;current=null;void a.end(after(new Date(Date.now()+15*60*1000)),props).catch(()=>{});return;}
  void current.activity.update(props,stale).catch(()=>{});
 }catch{current=null;}
}
/** Ends any guided-job activity (sign out, guide abandoned). */
export function endGuideActivity(){
 if(!ios)return;const m=load();if(!m)return;
 try{for(const a of m.guideActivity.getInstances())void a.end('immediate').catch(()=>{});}catch{}
 current=null;
}

// ------------------------------------------------------------------ the "Next event" widget
let eventKey='',raceNow:RaceDay|null=null,eventsSeen:RideEvent[]|null=null;
/** Refreshes the Next event widget: the rider's events (fetched here, kept from the last good read with no signal) and
 *  today's race-day status. Pass the race when it is known; leave it out to keep the last one. */
export async function syncNextEventWidget(race?:RaceDay|null){
 if(!ios)return;const x=loadExtra();if(!x)return;if(race!==undefined)raceNow=race;
 try{
  const events=await api<RideEvent[]>('/api/events?scope=upcoming').catch(()=>eventsSeen);
  if(events)eventsSeen=events;
  if(!eventsSeen&&!raceNow){if(eventKey!=='none'){x.nextEvent.updateSnapshot(emptyNextEvent);eventKey='none';}return;}
  const timeline=nextEventTimeline(eventsSeen??[],raceNow),key=JSON.stringify([timeline[0].props,timeline.length,raceNow,new Date().toDateString()]);
  if(key!==eventKey){x.nextEvent.updateTimeline(timeline);eventKey=key;}
 }catch{}
}
/** Race day started, changed or ended: the Next event widget's status line follows (no network when the events are known). */
export function setRaceStatus(race:RaceDay|null){
 if(!ios)return;if(JSON.stringify(race)===JSON.stringify(raceNow))return;raceNow=race;
 const x=loadExtra();if(!x||!eventsSeen){void syncNextEventWidget();return;}
 try{const timeline=nextEventTimeline(eventsSeen,raceNow);x.nextEvent.updateTimeline(timeline);eventKey=JSON.stringify([timeline[0].props,timeline.length,raceNow,new Date().toDateString()]);}catch{}
}
export function clearNextEventWidget(){if(!ios)return;const x=loadExtra();if(!x)return;raceNow=null;eventsSeen=null;try{x.nextEvent.updateSnapshot(emptyNextEvent);eventKey='none';}catch{}}

// ------------------------------------------------------------------ race-day / practice-day Live Activity
let raceRun:{key:string;activity:ReturnType<Extra['raceActivity']['start']>}|null=null,raceLast='';
/** Starts or updates the Lock Screen activity for today's race or practice day. `runKey` names the day (kind, track, day);
 *  a different one replaces it. Re-opening the app picks the running activity back up instead of starting a second one. */
export function syncRaceActivity(runKey:string,info:RaceActivityInfo){
 if(!ios)return;const x=loadExtra();if(!x)return;
 const props=raceActivityProps(info),stale=raceActivityStale(props,info.day);
 const sig=JSON.stringify({...props,since:0});
 try{
  if(raceRun&&raceRun.key!==runKey){void raceRun.activity.end('immediate').catch(()=>{});raceRun=null;}
  if(!raceRun){
   const running=x.raceActivity.getInstances();
   if(running.length&&raceLast===''){/* the app was closed while the day ran: carry on with that one */raceRun={key:runKey,activity:running[0]};for(const a of running.slice(1))void a.end('immediate').catch(()=>{});}
   else{for(const a of running)void a.end('immediate').catch(()=>{});raceRun={key:runKey,activity:x.raceActivity.start(props,'bakmx://open',stale)};raceLast=sig;return;}
  }
  if(sig===raceLast)return;raceLast=sig;
  void raceRun.activity.update(props,stale).catch(()=>{});
 }catch{raceRun=null;}
}
/** Ends the race-day activity: End race day, the day is over, or sign out. */
export function endRaceActivity(){
 if(!ios)return;const x=loadExtra();if(!x)return;
 try{for(const a of x.raceActivity.getInstances())void a.end('immediate').catch(()=>{});}catch{}
 raceRun=null;raceLast='';
}
