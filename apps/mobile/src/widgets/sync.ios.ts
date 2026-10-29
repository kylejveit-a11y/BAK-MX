// Keeps the Home Screen widget and the guided-job Live Activity in step with the app. Every call is
// best effort: a widget that can't update must never break the screen that asked for it.
// iOS only: sync.ts is the no-op used on Android and web, where the SwiftUI pieces don't exist.
import {api} from '../api';
import type {Bike,ServiceEvent} from '../../../../shared/types';
import type {SetupLog} from '../../../../shared/rider-types';
import {after,widgetsDirectory} from 'expo-widgets';
import {Asset} from 'expo-asset';
import {File} from 'expo-file-system';
import {makeBikeWidget} from './BikeWidget';
import {makeGuideActivity} from './GuideActivity';
import {bikeWidgetProps,emptyBikeWidget,guideActivityProps,raceTimeline,type GuideStepInfo,type RaceWidgetInfo} from '../widgetData';

const ios=true;
type Mods={bikeWidget:ReturnType<typeof makeBikeWidget>;guideActivity:ReturnType<typeof makeGuideActivity>};
let mods:Mods|null|undefined;
function load():Mods|null{
 if(mods!==undefined)return mods;
 try{mods={bikeWidget:makeBikeWidget(),guideActivity:makeGuideActivity()};}catch{mods=null;}
 return mods;
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
