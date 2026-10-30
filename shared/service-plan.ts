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
