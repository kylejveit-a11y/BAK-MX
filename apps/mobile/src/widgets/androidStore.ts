// What the Android home-screen widgets show, kept in one small file so the widget can redraw itself without the app
// open (every 30 minutes, after a reboot, when it is added). Pure data plus file read/write; no React Native views.
import {File,Paths} from 'expo-file-system';
import {bikeWidgetProps,emptyBikeWidget,emptyNextEvent,nextEventProps,raceTimeline,type EventLite,type RaceWidgetInfo} from '../widgetData';
import type {RaceDay} from '../../../../shared/race-day';

export type AndroidWidgetState={
 bike:ReturnType<typeof bikeWidgetProps>|null;
 race:RaceWidgetInfo|null;
 events:EventLite[]|null;
 raceDay:RaceDay|null;
 savedAt:number;
};
const FILE='bak-android-widgets-v1.json';
export const emptyState:AndroidWidgetState={bike:null,race:null,events:null,raceDay:null,savedAt:0};

function file(){return new File(Paths.document,FILE);}
export function readState():AndroidWidgetState{
 try{const f=file();if(!f.exists)return emptyState;const v=JSON.parse(f.textSync()) as Partial<AndroidWidgetState>;return {...emptyState,...v};}catch{return emptyState;}
}
export function writeState(patch:Partial<AndroidWidgetState>):AndroidWidgetState{
 const next={...readState(),...patch,savedAt:Date.now()};
 try{const f=file();if(!f.exists)f.create();f.write(JSON.stringify(next));}catch{}
 return next;
}
export function clearState(){try{const f=file();if(f.exists)f.delete();}catch{}}

/** The bike widget's props right now: the stored bike plus the race countdown worked out for today's date. */
export function bikePropsNow(s:AndroidWidgetState,now=new Date()){
 const base=s.bike??emptyBikeWidget;
 return raceTimeline(base,s.race,now)[0].props;
}
/** The next-event widget's props right now. */
export function nextEventNow(s:AndroidWidgetState,now=new Date()){
 if(!s.events&&!s.raceDay)return emptyNextEvent;
 return nextEventProps(s.events??[],s.raceDay,now);
}
