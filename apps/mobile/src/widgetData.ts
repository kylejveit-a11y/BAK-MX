// What the Home Screen widget and the guided-job Live Activity show. Pure, so it runs in Node tests.
import type {Bike,ServiceEvent} from '../../../shared/types';
import type {SetupLog} from '../../../shared/rider-types';

const clip=(s:string,n:number)=>{const t=s.replace(/\s+/g,' ').trim();return t.length>n?t.slice(0,n-1).trimEnd()+'…':t;};
const fmtHours=(h:number)=>Number.isInteger(h)?String(h):h.toFixed(1);

export const emptyBikeWidget={ready:false,logo:'',bike:'',hours:'',hoursSet:false,next:'',nextSet:false,nextUrgent:false,nextProgress:-1,change:'',changeSet:false,changeWhen:'',...noRace()};
export function noRace(){return {raceSet:false,raceTrack:'',raceWhen:'',raceProgress:-1,raceDone:''};}

export function bikeWidgetProps(bike:Bike|undefined,services:ServiceEvent[],logs:SetupLog[],now=new Date()){
 if(!bike)return emptyBikeWidget;
 const name=clip(`${bike.model_year} ${bike.manufacturer} ${bike.model}`,40),h=bike.engine_hours;
 const due=services.filter(e=>e.next_due_hours!==null).map(e=>({e,left:h==null?null:(e.next_due_hours as number)-h})).sort((a,b)=>(a.left??1e9)-(b.left??1e9))[0];
 const next=!due?'':due.left===null?`${clip(due.e.category,22)} at ${fmtHours(due.e.next_due_hours as number)} h`:due.left<=0?`${clip(due.e.category,22)} due now`:`${clip(due.e.category,22)} in ${fmtHours(Math.round(due.left*10)/10)} h`;
 const last=[...logs].sort((a,b)=>Date.parse(b.recorded_at)-Date.parse(a.recorded_at))[0];
 const days=last?Math.floor((now.getTime()-Date.parse(last.recorded_at))/86400000):0;
 // How much of the service interval is used: from the hours it was done at to the hours it's due.
 const start=due?.e.engine_hours,end=due?.e.next_due_hours;
 const nextProgress=due&&h!=null&&start!=null&&end!=null&&end>start?Math.max(0,Math.min(1,(h-start)/(end-start))):-1;
 return {ready:true,logo:'',bike:name,hours:h==null?'—':fmtHours(h),hoursSet:h!=null,next:due?next:'Add service reminder',nextSet:!!due,nextUrgent:!!due&&due.left!==null&&due.left<=0,nextProgress,
  change:last?clip(last.change_made||'Settings recorded',90):'No changes logged yet',changeSet:!!last,
  ...noRace(),
  changeWhen:!last?'Log one after a ride':days<=0?'Today':days===1?'Yesterday':days<14?`${days} days ago`:new Date(last.recorded_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})};
}

export type GuideStepInfo={guide:string;bike:string;stepIndex:number;total:number;stepTitle:string;verification:string[];needsNote:boolean;done:boolean};
export function guideActivityProps(i:GuideStepInfo){
 return {guide:clip(i.guide.toUpperCase(),40),bike:clip(i.bike,24),step:Math.min(i.total,i.stepIndex+1),total:i.total,stepTitle:clip(i.stepTitle,70),check:clip(i.verification[0]??'Check the step before moving on.',110),needsNote:i.needsNote,done:i.done};
}

/** The race countdown the widget shows, if the rider turned it on: the track, the date (YYYY-MM-DD) and prep progress. */
export type RaceWidgetInfo={track:string;day:string;done:number;total:number};
/** Widget entries from now to the day after the race: one at each local midnight, so the count is right without opening
 *  the app. After race day the countdown drops off by itself. */
export function raceTimeline<T extends object>(base:T,race:RaceWidgetInfo|null,now=new Date()):{date:Date;props:T&ReturnType<typeof noRace>}[]{
 const plain={...base,...noRace()};
 if(!race)return [{date:now,props:plain}];
 const [y,m,d]=race.day.split('-').map(Number),raceDay=new Date(y,m-1,d);
 const midnight=new Date(now);midnight.setHours(0,0,0,0);
 const props=(at:Date)=>{const n=Math.round((raceDay.getTime()-at.getTime())/864e5);
  return {...base,raceSet:true,raceTrack:clip(race.track||'Race day',28),raceWhen:n<=0?'Race day today':n===1?'Race tomorrow':`Race in ${n} days`,raceProgress:race.total?Math.max(0,Math.min(1,race.done/race.total)):-1,raceDone:race.total?`Prep ${race.done} of ${race.total}`:''};};
 const out:{date:Date;props:T&ReturnType<typeof noRace>}[]=[];
 if(raceDay.getTime()<midnight.getTime())return [{date:now,props:plain}];
 out.push({date:now,props:props(midnight)});
 for(let i=1;i<=62;i++){const at=new Date(midnight);at.setDate(at.getDate()+i);if(at.getTime()>raceDay.getTime()){out.push({date:at,props:plain});break;}out.push({date:at,props:props(at)});}
 return out;
}
