// Keeps the Home Screen widget and the guided-job Live Activity in step with the app. Every call is
// best effort: a widget that can't update must never break the screen that asked for it.
// iOS only: sync.ts is the no-op used on Android and web, where the SwiftUI pieces don't exist.
import {api} from '../api';
import type {Bike,ServiceEvent} from '../../../../shared/types';
import type {SetupLog} from '../../../../shared/rider-types';
import {after} from 'expo-widgets';
import {makeBikeWidget} from './BikeWidget';
import {makeGuideActivity} from './GuideActivity';
import {bikeWidgetProps,emptyBikeWidget,guideActivityProps,type GuideStepInfo} from '../widgetData';

const ios=true;
type Mods={bikeWidget:ReturnType<typeof makeBikeWidget>;guideActivity:ReturnType<typeof makeGuideActivity>};
let mods:Mods|null|undefined;
function load():Mods|null{
 if(mods!==undefined)return mods;
 try{mods={bikeWidget:makeBikeWidget(),guideActivity:makeGuideActivity()};}catch{mods=null;}
 return mods;
}

let lastKey='';
/** Refreshes the widget for this bike (or clears it when there is none). */
export async function syncBikeWidget(bike:Bike|undefined){
 if(!ios)return;const m=load();if(!m)return;
 try{
  if(!bike){if(lastKey!=='none'){m.bikeWidget.updateSnapshot(emptyBikeWidget);lastKey='none';}return;}
  const [services,logs]=await Promise.all([api<ServiceEvent[]>(`/api/services?bike_id=${bike.id}`).catch(()=>[] as ServiceEvent[]),api<SetupLog[]>(`/api/setup-logs?bike_id=${bike.id}`).catch(()=>[] as SetupLog[])]);
  const props=bikeWidgetProps(bike,services,logs),key=JSON.stringify(props);
  if(key!==lastKey){m.bikeWidget.updateSnapshot(props);lastKey=key;}
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
