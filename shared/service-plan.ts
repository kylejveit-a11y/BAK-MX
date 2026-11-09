// Turns the maker's own maintenance-schedule facts (as stored in claims, verified against the manual) into service reminders
// for a rider's exact bike: what to do, how often in hours, and where that number comes from. Pure, so it is testable.
// Nothing is invented: a task whose interval is only "as required" or counted in races with no hours given is left out.

export type PlanItem={category:string;every_hours:number;first_hours:number|null;task:string;claim_id:string;note:string|null};

/** The rider-facing categories (same words as the Service log quick picks) and the schedule wording that maps to each. */
/** The rider-facing categories (same words as the Service log quick picks), the schedule wording that maps to each, and the
 *  action that makes it a service rather than a look-over. Checks are kept only where the check is the job (valves). */
const DO=/\b(replace|change|renew|service|rebuild|clean|lubricate|grease|perform)\b/i;
const LOOK=/\b(inspect|check|examine)\b/i;
const CATEGORIES:{category:string;match:RegExp;exclude?:RegExp;check?:boolean}[]=[
 {category:'Engine oil',match:/engine oil|\boil\b.*(change|replace)/i,exclude:/fork|shock|major engine service|minor engine service|filter screen|filter element|engine oil filter/i},
 {category:'Oil filter',match:/oil filter/i,exclude:/fork|shock|filter screen/i},
 {category:'Air filter',match:/air filter/i,exclude:/\breplace\b/i},
 {category:'Spark plug',match:/spark plug/i,exclude:/\bclean\b/i},
 {category:'Valve check',match:/valve clearance/i,check:true},
 {category:'Top end',match:/\bpiston\b|minor engine service|top end/i,exclude:/carbon|piston pin\b(?!.*piston ring)/i},
 {category:'Fork service',match:/fork oil|front fork[^.]*(oil|service)|forks? - service/i,exclude:/seal/i},
 {category:'Shock service',match:/shock absorber service|shock[^.]*(oil|service)|rear shock - service/i,exclude:/linkage/i},
 {category:'Chain & sprockets',match:/(drive )?chain[^.]*sprocket|sprocket[^.]*chain|drive chain - replace|chain and sprockets/i,exclude:/tension|slack|lube|lubricate|guide|roller/i},
 {category:'Brake pads',match:/brake pad|brake lining/i,exclude:/secured/i},
 {category:'Brake fluid',match:/brake fluid/i,exclude:/level/i},
 {category:'Coolant',match:/\bcoolant\b/i,exclude:/level|passage|hose/i},
 {category:'Clutch',match:/clutch (disc|plate|fluid|hydraulic)|hydraulic clutch fluid/i,exclude:/level/i},
 {category:'Fuel filter',match:/fuel filter|fuel screen/i},
 {category:'Linkage',match:/linkage|swingarm/i,exclude:/check|inspect/i},
];
const ORDINAL:Record<string,number>={first:1,second:2,third:3,fourth:4,fifth:5,sixth:6,seventh:7,eighth:8,ninth:9,tenth:10};
const num=(s:string)=>ORDINAL[s.toLowerCase()]??Number(s);

/** The task text and the interval text out of a schedule statement like "Service schedule / Change the engine oil: every 15 operating hours; every 24 months. From the ...". */
export function splitStatement(statement:string):{task:string;intervals:string}|null{
 const body=statement.replace(/^(service schedule|maintenance schedule|periodic maintenance chart)\s*\/\s*/i,'');
 const i=body.indexOf(':');if(i<1)return null;
 const task=body.slice(0,i).replace(/^periodic maintenance\s*\/\s*/i,'').replace(/\s*\/\s*/g,' / ').trim();
 let rest=body.slice(i+1);
 const cut=rest.search(/\.\s+(From the|OEM schedule|Note\s*\d|The same|Intervals are|K:)/i);if(cut>=0)rest=rest.slice(0,cut);
 return {task,intervals:rest.trim()};
}

/** Hour figures out of the interval text: repeating ones and a one-time "after N hours" break-in. */
export function hoursIn(intervals:string):{repeat:number[];first:number|null}{
 const t=intervals.toLowerCase(),repeat:number[]=[];let first:number|null=null;
 let m:RegExpExecArray|null;
 const re1=/every\s+(\d+(?:\.\d+)?)\s*(?:operating\s+)?hours?\b/g;while((m=re1.exec(t)))repeat.push(Number(m[1]));
 const re2=/every\s+(\d+(?:\.\d+)?)\s*hours of race riding/g;while((m=re2.exec(t)))repeat.push(Number(m[1]));
 const re3=/(?:every|each)\s+([a-z]+|\d+)(?:st|nd|rd|th)?\s+races?\s*\(about\s+(\d+(?:\.\d+)?)\s*hours?\)/g;while((m=re3.exec(t)))repeat.push(Number(m[2]));
 const re6=/every\s+race\s*\((?:about|or)\s+(\d+(?:\.\d+)?)\s*hours?\)/g;while((m=re6.exec(t)))repeat.push(Number(m[1]));
 const re4=/each race\s*\((?:about|or)\s+(\d+(?:\.\d+)?)\s*hours?\)/g;while((m=re4.exec(t)))repeat.push(Number(m[1]));
 const re5=/every\s+(\d+)\s+races?\s*\(or\s+(\d+(?:\.\d+)?)\s*hours?\)/g;while((m=re5.exec(t)))repeat.push(Number(m[2]));
 const f1=/(?:once\s+)?after\s+(?:the\s+)?(\d+(?:\.\d+)?|one|first)\s*(?:operating\s+)?hours?/.exec(t);if(f1)first=f1[1]==='one'||f1[1]==='first'?1:Number(f1[1]);
 if(/after break-in/.test(t)&&first===null)first=0;
 return {repeat:repeat.filter(n=>n>0),first};
}

/** Builds the plan from the bike's verified maintenance statements. One item per category: the shortest repeating interval wins. */
export function buildServicePlan(rows:{id:string;statement:string}[]):PlanItem[]{
 const best=new Map<string,PlanItem>();
 for(const r of rows){
  const parts=splitStatement(r.statement);if(!parts)continue;
  // One statement can cover two jobs ("change the engine oil and the oil filter"), so every matching category gets it.
  const cats=CATEGORIES.filter(c=>c.match.test(parts.task)&&!(c.exclude&&c.exclude.test(parts.task))&&(c.check?LOOK.test(parts.task):DO.test(parts.task)&&!(LOOK.test(parts.task)&&!DO.test(parts.task.replace(LOOK,'')))));if(!cats.length)continue;
  const {repeat,first}=hoursIn(parts.intervals);if(!repeat.length)continue;
  const every=Math.min(...repeat);
  const note=/race riding/i.test(parts.intervals)?'Race-use interval':/(about|or)\s+[\d.]+\s*hours/i.test(parts.intervals)?'Counted in races; hours are the maker’s estimate':null;
  for(const cat of cats){
   const item:PlanItem={category:cat.category,every_hours:every,first_hours:first,task:parts.task,claim_id:r.id,note};
   const have=best.get(cat.category);
   if(!have||every<have.every_hours)best.set(cat.category,item);
  }
 }
 const order=CATEGORIES.map(c=>c.category);
 return [...best.values()].sort((a,b)=>order.indexOf(a.category)-order.indexOf(b.category));
}

/** Where each maker's job stands for this bike: hours since it was last logged against the maker's interval.
 *  `due` is the hour reading the job comes due at; `left` is how many hours remain (negative or zero means due now).
 *  Both are null when the bike's hours are unknown, and for a job that has never been logged: with no record of when it was
 *  last done BAK cannot say it is due, so the row only says "not logged yet". The one exception is a new bike that has not yet
 *  reached the maker's break-in service hour: that job cannot have been done, so it is due at the break-in figure.
 *  Sorted soonest first; rows with no figure go last. */
export type ServiceEventLike={category:string;engine_hours:number|null};
export type DueRow<E extends ServiceEventLike=ServiceEventLike>={item:PlanItem;last:E|null;due:number|null;left:number|null};
export function serviceDueRows<E extends ServiceEventLike>(plan:PlanItem[],events:E[],hours:number|null|undefined):DueRow<E>[]{
 const h=hours??null;
 return plan.map(item=>{
  const last=events.filter(e=>e.category===item.category&&e.engine_hours!=null).sort((a,b)=>(b.engine_hours??0)-(a.engine_hours??0))[0]??null;
  // Logged before: the next one is one interval on. Never logged: no due figure, except the break-in service on a bike still short of it.
  const due=h==null?null:last?(last.engine_hours as number)+item.every_hours:(item.first_hours!=null&&h<item.first_hours?item.first_hours:null);
  const left=due!=null&&h!=null?round1(due-h):null;
  return {item,last,due,left};
 }).sort((a,b)=>(a.left??1e9)-(b.left??1e9));
}
/** The rider's own reminders ("next due at") that are closest, soonest first. `left` is null when the bike's hours are unknown. */
export function comingUp<E extends {next_due_hours:number|null}>(events:E[],hours:number|null|undefined,limit=3):{e:E;left:number|null}[]{
 const h=hours??null;
 return events.filter(e=>e.next_due_hours!==null).map(e=>({e,left:h===null?null:round1((e.next_due_hours as number)-h)})).sort((a,b)=>(a.left??1e9)-(b.left??1e9)).slice(0,limit);
}
/** One plain line for a due row: "every 15 h · 3.5 h to go", "every 15 h · due now", "every 15 h · not logged yet".
 *  A never-logged job has no due state: the line says so and nothing more. */
export function dueLine(row:{item:PlanItem;last:unknown|null;left:number|null}):string{
 const parts=[`every ${row.item.every_hours} h`];
 if(row.left!=null)parts.push(row.left<=0?'due now':`${row.left} h to go`);
 if(!row.last&&row.left==null)parts.push('not logged yet');
 if(row.item.note)parts.push(row.item.note);
 return parts.join(' · ');
}
const round1=(n:number)=>Math.round(n*10)/10;
/** "Coming up" in rider words: the rider's own reminders plus the maker's jobs that are due now or within `soonHours`,
 *  one line per job, soonest first. A job the rider set a reminder for keeps the sooner of the two. */
export function upNext<E extends {category:string;next_due_hours:number|null;engine_hours:number|null}>(plan:PlanItem[]|null,events:E[],hours:number|null|undefined,limit=3,soonHours=10):{key:string;category:string;left:number|null;at:number|null}[]{
 const h=hours??null,by=new Map<string,{key:string;category:string;left:number|null;at:number|null}>();
 const keep=(r:{key:string;category:string;left:number|null;at:number|null})=>{const k=r.category.toLowerCase(),o=by.get(k);if(!o||(r.left??1e9)<(o.left??1e9))by.set(k,r);};
 for(const {e,left} of comingUp(events,h,50))keep({key:'r-'+e.category,category:e.category,left,at:e.next_due_hours});
 if(plan&&h!=null)for(const r of serviceDueRows(plan,events,h))if(r.left!=null&&r.left<=soonHours)keep({key:'p-'+r.item.category,category:r.item.category,left:r.left,at:r.due});
 return [...by.values()].sort((a,b)=>(a.left??1e9)-(b.left??1e9)).slice(0,limit);
}
