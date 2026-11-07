// What the Home Screen widgets and the Live Activities (guided job, race day) show. Pure, so it runs in Node tests.
import type {Bike,ServiceEvent} from '../../../shared/types';
import type {SetupLog,RideEvent} from '../../../shared/rider-types';
import {EVENT_TYPE_LABELS} from '../../../shared/rider-types.ts';
import {dayOf,isPractice,type NextUp,type RaceDay} from '../../../shared/race-day.ts';
import {clockText,countdownText,nextUpDate} from '../../../shared/practice-day.ts';

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

// ------------------------------------------------------------------ race-day / practice-day Live Activity
/** What the Lock Screen and Dynamic Island show while race day or practice day runs. */
export type RaceActivityInfo={kind:'race'|'practice';track:string;day:string;next:NextUp|null;item:string;done:number;total:number;last:string};
export type RaceActivityProps={practice:boolean;head:string;track:string;nextLabel:string;nextClock:string;nextAt:number;since:number;live:boolean;nextText:string;item:string;progress:number;count:string;last:string};
/** `live` means the moto or session is still ahead, so the activity runs its own countdown to `nextAt` (no app updates needed). */
export function raceActivityProps(i:RaceActivityInfo,now=new Date()):RaceActivityProps{
 const at=nextUpDate(i.next,i.day),t=at?at.getTime():0;
 return {practice:i.kind==='practice',head:i.kind==='practice'?'PRACTICE DAY':'RACE DAY',track:clip(i.track||'Track day',30),
  nextLabel:clip(i.next?.label??'',20),nextClock:i.next?.at?clockText(i.next.at):'',nextAt:t,since:now.getTime(),live:t>now.getTime(),
  nextText:!i.next?'':at?countdownText(at,now):'Set the time in BAK MX',
  item:i.item?clip(i.item,70):i.total?'Checklist done':'',progress:i.total?Math.max(0,Math.min(1,i.done/i.total)):-1,count:i.total?`${i.done}/${i.total}`:'',last:clip(i.last,60)};
}
/** When iOS may dim the activity: a few minutes after the moto it counts down to, else at the end of the day. */
export function raceActivityStale(p:RaceActivityProps,day:string):Date{
 if(p.live)return new Date(p.nextAt+5*60000);
 const [y,m,d]=day.split('-').map(Number);return new Date(y,m-1,d,23,59);
}

// ------------------------------------------------------------------ the "Next event" widget
export type EventLite=Pick<RideEvent,'id'|'title'|'event_type'|'starts_at'|'location_name'|'canceled_at'|'my_rsvp'>&{ends_at?:string|null};
export type NextEventProps={ready:boolean;hasEvent:boolean;name:string;type:string;when:string;time:string;place:string;days:number;daysText:string;rsvp:string;race:string;raceLive:boolean;url:string};
export const emptyNextEvent:NextEventProps={ready:false,hasEvent:false,name:'',type:'',when:'',time:'',place:'',days:-1,daysText:'',rsvp:'',race:'',raceLive:false,url:'bakmx://events'};
const calDays=(from:Date,to:Date)=>{const a=new Date(from);a.setHours(0,0,0,0);const b=new Date(to);b.setHours(0,0,0,0);return Math.round((b.getTime()-a.getTime())/864e5);};
/** The rider's next event they're going to or interested in: not canceled, not over, soonest first (going wins a tie). */
export function pickNextEvent(events:EventLite[],now=new Date()):EventLite|null{
 const today=dayOf(now);
 const live=events.filter(e=>!e.canceled_at&&(e.my_rsvp==='going'||e.my_rsvp==='interested')&&Number.isFinite(Date.parse(e.starts_at))&&dayOf(new Date(e.ends_at&&Number.isFinite(Date.parse(e.ends_at))?e.ends_at:e.starts_at))>=today);
 return live.sort((a,b)=>Date.parse(a.starts_at)-Date.parse(b.starts_at)||(a.my_rsvp==='going'?-1:0)-(b.my_rsvp==='going'?-1:0))[0]??null;
}
/** Today's race-day status for the widget: "Race day today · Dade City", "Practice day today", "Race in 3 days · Gatorback". */
export function raceStatus(race:RaceDay|null|undefined,now=new Date()):{race:string;raceLive:boolean}{
 if(!race||!race.on||!/^\d{4}-\d{2}-\d{2}$/.test(race.day))return {race:'',raceLive:false};
 const [y,m,d]=race.day.split('-').map(Number),n=calDays(now,new Date(y,m-1,d,12)),where=race.track?` · ${clip(race.track,24)}`:'';
 if(n<0)return {race:'',raceLive:false};
 if(n===0)return {race:`${isPractice(race)?'Practice':'Race'} day today${where}`,raceLive:true};
 if(isPractice(race))return {race:'',raceLive:false};
 return {race:`${n===1?'Race tomorrow':`Race in ${n} days`}${where}`,raceLive:false};
}
export function nextEventProps(events:EventLite[],race:RaceDay|null|undefined,now=new Date()):NextEventProps{
 const e=pickNextEvent(events,now),status=raceStatus(race,now);
 if(!e)return {...emptyNextEvent,ready:true,...status,url:status.raceLive?'bakmx://open':'bakmx://events'};
 const start=new Date(e.starts_at),n=calDays(now,start);
 return {ready:true,hasEvent:true,name:clip(e.title,48),type:EVENT_TYPE_LABELS[e.event_type]??'',when:start.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}),
  time:start.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}),place:clip(e.location_name??'',36),days:Math.max(0,n),daysText:n<0?'On now':n===0?'Today':n===1?'Tomorrow':`In ${n} days`,
  rsvp:e.my_rsvp==='going'?'Going':'Interested',...status,url:'bakmx://events?event='+encodeURIComponent(e.id)};
}
/** Widget entries now and at each local midnight, so "In 3 days" and the race status stay right without opening the app.
 *  Stops the day after the last thing it shows has passed (at most a month ahead). */
export function nextEventTimeline(events:EventLite[],race:RaceDay|null|undefined,now=new Date()):{date:Date;props:NextEventProps}[]{
 const out=[{date:now,props:nextEventProps(events,race,now)}];
 const last=Math.max(...events.map(e=>Date.parse(e.ends_at??e.starts_at)).filter(Number.isFinite),race?.on&&race.day?Date.parse(race.day+'T23:59:59'):0,0);
 for(let i=1;i<=31;i++){const at=new Date(now);at.setHours(0,0,0,0);at.setDate(at.getDate()+i);out.push({date:at,props:nextEventProps(events,race,at)});if(at.getTime()>last)break;}
 return out;
}
