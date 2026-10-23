// What the Home Screen widget and the guided-job Live Activity show. Pure, so it runs in Node tests.
import type {Bike,ServiceEvent} from '../../../shared/types';
import type {SetupLog} from '../../../shared/rider-types';

const clip=(s:string,n:number)=>{const t=s.replace(/\s+/g,' ').trim();return t.length>n?t.slice(0,n-1).trimEnd()+'…':t;};
const fmtHours=(h:number)=>Number.isInteger(h)?String(h):h.toFixed(1);

export const emptyBikeWidget={ready:false,bike:'',hours:'',next:'',nextUrgent:false,change:'',changeWhen:''};

export function bikeWidgetProps(bike:Bike|undefined,services:ServiceEvent[],logs:SetupLog[],now=new Date()){
 if(!bike)return emptyBikeWidget;
 const name=clip(`${bike.model_year} ${bike.manufacturer} ${bike.model}`,40),h=bike.engine_hours;
 const due=services.filter(e=>e.next_due_hours!==null).map(e=>({e,left:h==null?null:(e.next_due_hours as number)-h})).sort((a,b)=>(a.left??1e9)-(b.left??1e9))[0];
 const next=!due?'No service scheduled':due.left===null?`${clip(due.e.category,22)} at ${fmtHours(due.e.next_due_hours as number)} h`:due.left<=0?`${clip(due.e.category,22)} due now`:`${clip(due.e.category,22)} in ${fmtHours(Math.round(due.left*10)/10)} h`;
 const last=[...logs].sort((a,b)=>Date.parse(b.recorded_at)-Date.parse(a.recorded_at))[0];
 const days=last?Math.floor((now.getTime()-Date.parse(last.recorded_at))/86400000):0;
 return {ready:true,bike:name,hours:h==null?'Hours not set':`${fmtHours(h)} h`,next,nextUrgent:!!due&&due.left!==null&&due.left<=0,
  change:last?clip(last.change_made||'Settings recorded',90):'Nothing logged yet',
  changeWhen:!last?'':days<=0?'Today':days===1?'Yesterday':days<14?`${days} days ago`:new Date(last.recorded_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})};
}

export type GuideStepInfo={guide:string;bike:string;stepIndex:number;total:number;stepTitle:string;verification:string[];needsNote:boolean;done:boolean};
export function guideActivityProps(i:GuideStepInfo){
 return {guide:clip(i.guide.toUpperCase(),40),bike:clip(i.bike,24),step:Math.min(i.total,i.stepIndex+1),total:i.total,stepTitle:clip(i.stepTitle,70),check:clip(i.verification[0]??'Check the step before moving on.',110),needsNote:i.needsNote,done:i.done};
}
