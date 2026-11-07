// Real-world part life from riders' own service logs: how many engine hours riders of one platform actually get between
// two entries of the same job (piston, clutch, valves shimmed...). Pure, so it is testable. Anonymous by construction:
// only groups with at least RIDER_WEAR_MIN_RIDERS different riders are reported, and only as counts and a median of
// per-rider medians, never a rider's own numbers, ids, dates, notes or bikes.

export const RIDER_WEAR_MIN_RIDERS=5;
/** The interquartile range is shown only with this many riders, so no single rider's figure can be read off it. */
export const RIDER_WEAR_RANGE_MIN_RIDERS=10;
/** Longer gaps than this between two entries of the same job are a missed log or a reset hour meter, not part life. */
const MAX_GAP_HOURS=1000;

export type WearPart='top_end'|'bottom_end'|'valve_adjust'|'valve_check'|'cam_chain'|'clutch'|'reeds'|'fork_service'|'fork_seals'|'shock_service'|'linkage_bearings'|'wheel_bearings'|'chain_sprockets'|'brake_pads'|'air_filter'|'engine_oil'|'oil_filter'|'spark_plug'|'front_tire'|'rear_tire'|'silencer_packing'|'coolant';
export const WEAR_PART_LABEL:Record<WearPart,string>={top_end:'Top end (piston and rings)',bottom_end:'Bottom end (crank, rod, main bearings)',valve_adjust:'Valves re-shimmed or adjusted',valve_check:'Valve clearance check',cam_chain:'Cam chain',clutch:'Clutch plates or springs',reeds:'Reed petals',fork_service:'Fork service',fork_seals:'Fork seals',shock_service:'Shock service',linkage_bearings:'Linkage or swingarm bearings',wheel_bearings:'Wheel bearings',chain_sprockets:'Chain and sprockets',brake_pads:'Brake pads',air_filter:'Air filter',engine_oil:'Engine or transmission oil',oil_filter:'Oil filter',spark_plug:'Spark plug',front_tire:'Front tire',rear_tire:'Rear tire',silencer_packing:'Silencer packing',coolant:'Coolant'};

/** Keyword map from what riders type (the Service log quick picks or their own words) to part groups. One entry can name
 *  several jobs ("top end and valves shimmed"). Checks, adjustments and lubrication are not part replacements and are left out,
 *  except the valve check, which is the job itself. Order does not matter; exclusions keep near words apart. */
const ONLY_LOOKED=/^(?!.*\b(new|replac\w*|rebuil\w*|kit|swapped|changed)\b).*\b(greas\w*|lub\w*|clean\w*|check\w*|inspect\w*|adjust\w*)\b/i;
const MAP:{part:WearPart;match:RegExp;exclude?:RegExp}[]=[
 {part:'top_end',match:/\btop[\s-]?end\b|\bpistons?\b|\bpiston rings?\b|\bnew rings\b/i,exclude:/\b(check(ed)?|inspect(ed)?|measur\w*) (the )?piston\b/i},
 {part:'bottom_end',match:/\bbottom[\s-]?end\b|\bcrank(shaft)?\b|\bcon(necting)?[\s-]?rod\b|\bmain bearings?\b|\bfull (engine )?rebuild\b/i,exclude:/\bcrank(case)? (cover|seal)s?\b|\bcranking\b/i},
 {part:'valve_adjust',match:/\b(shim(s|med|ming)?|re-?shim(med)?)\b|\bvalves? (adjust(ed|ment)?|(were |was |are )?tight)\b|\badjust(ed)? (the )?valves?\b|\bnew valves?\b|\bvalves? (replac|job)\w*|\bhead rebuild\b/i},
 {part:'valve_check',match:/\bvalve (check|clearance|inspection)\b|\bchecked (the )?valves\b/i,exclude:/\b(shim(s|med)?|adjust(ed)?|tight)\b/i},
 {part:'cam_chain',match:/\bcam[\s-]?(chain|timing chain)\b|\btiming chain\b/i,exclude:ONLY_LOOKED},
 {part:'clutch',match:/\bclutch\b/i,exclude:/\bclutch (cable|lever|perch|fluid|bleed|adjust\w*|free ?play|slave)\b|\b(adjust(ed)?|lubed?|bled) (the )?clutch\b/i},
 {part:'reeds',match:/\breeds?\b|\breed (petals?|valve|block)\b/i,exclude:ONLY_LOOKED},
 {part:'fork_seals',match:/\bfork seals?\b|\bseals? (in|on) the forks?\b|\bfork (dust )?wipers?\b/i},
 {part:'fork_service',match:/\bfork (service|oil|rebuild|revalve)\b|\bforks? (serviced|rebuilt)\b|\bservice(d)? (the )?forks?\b/i},
 {part:'shock_service',match:/\bshock (service|oil|rebuild|revalve)\b|\bshock (serviced|rebuilt)\b|\bservice(d)? (the )?shock\b/i},
 {part:'linkage_bearings',match:/\b(linkage|swing[\s-]?arm|shock) (pivot )?(bearings?|bushings?)\b|\blinkage (rebuild|rebuilt|kit)\b|\b(new|replac\w*|rebuil\w*)\b.*\b(linkage|swing[\s-]?arm)\b/i,exclude:ONLY_LOOKED},
 {part:'wheel_bearings',match:/\bwheel bearings?\b|\b(front|rear) (wheel |hub )?bearings?\b/i,exclude:ONLY_LOOKED},
 {part:'chain_sprockets',match:/\bchain\b.*\bsprockets?\b|\bsprockets?\b|\bnew chain\b|\bchain (replac\w*|swap\w*)\b|\breplac\w* (the )?chain\b/i,exclude:/\b(cam|timing) chain\b|\bchain (lube|clean\w*|slack|adjust\w*|tension\w*|guide|roller|slider)s?\b|\b(lubed?|cleaned|adjusted) (the )?chain\b/i},
 {part:'brake_pads',match:/\bbrake pads?\b|\bpads?\b(?=.*\bbrake\b)|\b(front|rear) pads?\b/i},
 {part:'air_filter',match:/\bair[\s-]?filter\b|\bair cleaner\b/i},
 {part:'oil_filter',match:/\boil filter\b|\boil (and|&) (oil )?filter\b/i},
 {part:'engine_oil',match:/\b(engine|motor|transmission|trans|gearbox|gear) oil\b|\boil change\b|\bchanged (the )?oil\b|\boil (and|&) (oil )?filter\b|^\s*oil\s*$/i,exclude:/\b(fork|shock|premix|mix|2-?stroke oil|filter oil)\b/i},
 {part:'spark_plug',match:/\bspark ?plug\b|^\s*plug\s*$|\bnew plug\b/i},
 {part:'front_tire',match:/\bfront (tire|tyre)\b|\bfront and rear (tires|tyres)\b|\b(both|new) (tires|tyres)\b|^\s*(tires?|tyres?)\s*$/i,exclude:/\bpressure\b/i},
 {part:'rear_tire',match:/\brear (tire|tyre)\b|\bfront and rear (tires|tyres)\b|\b(both|new) (tires|tyres)\b|^\s*(tires?|tyres?)\s*$/i,exclude:/\bpressure\b/i},
 {part:'silencer_packing',match:/\b(silencer|muffler|exhaust|can) (re)?pack(ing|ed)?\b|\brepack(ed)? (the )?(silencer|muffler|exhaust|can)\b|\brepack\b/i},
 {part:'coolant',match:/\bcoolant\b|\bantifreeze\b/i,exclude:/\b(level|top(ped)? off|check(ed)?)\b/i},
];

/** Part groups named by one service entry. The rider's category decides; their notes are read only when the category names
 *  no part (e.g. "Other" with "new piston and rings" in the notes). */
export function classifyService(category:string,notes=''):WearPart[]{
 const find=(text:string)=>MAP.filter(m=>m.match.test(text)&&!(m.exclude&&m.exclude.test(text))).map(m=>m.part);
 const fromCategory=find(category),fromNotes=find(notes.slice(0,500));
 // A valve check whose notes say the valves were re-shimmed is also a valve adjustment.
 const extra=fromCategory.includes('valve_check')&&fromNotes.includes('valve_adjust')?['valve_adjust' as WearPart]:[];
 return [...new Set(fromCategory.length?[...fromCategory,...extra]:fromNotes)];
}

export type WearEvent={rider:string;bike:string;category:string;notes?:string|null;engine_hours:number|null;performed_at:string};
export type WearPartSummary={part:WearPart;label:string;riders:number;intervals:number;median_hours:number;typical_range_hours?:[number,number]};

const median=(xs:number[])=>{const s=[...xs].sort((a,b)=>a-b),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2;};
const quantile=(xs:number[],q:number)=>{const s=[...xs].sort((a,b)=>a-b),i=(s.length-1)*q,lo=Math.floor(i),hi=Math.ceil(i);return s[lo]+(s[hi]-s[lo])*(i-lo);};
const round=(h:number)=>h<20?Math.round(h*2)/2:Math.round(h);

/** Hours between consecutive entries of the same job on the same bike, per rider; each rider's median counts once, so a
 *  rider who logs a lot does not outweigh the others. Entries without hours, zero or backwards gaps and gaps over
 *  MAX_GAP_HOURS are skipped. Parts with fewer than minRiders riders are left out entirely. */
export function aggregateRiderWear(events:WearEvent[],minRiders=RIDER_WEAR_MIN_RIDERS):WearPartSummary[]{
 const byBikePart=new Map<string,{rider:string;hours:number;at:string}[]>();
 for(const e of events){
  if(e.engine_hours==null||!Number.isFinite(e.engine_hours)||e.engine_hours<0)continue;
  for(const part of classifyService(e.category,e.notes??'')){
   const key=part+'|'+e.bike,list=byBikePart.get(key)??[];list.push({rider:e.rider,hours:e.engine_hours,at:e.performed_at});byBikePart.set(key,list);
  }
 }
 const perRider=new Map<WearPart,Map<string,number[]>>();
 for(const [key,list] of byBikePart){
  const part=key.slice(0,key.indexOf('|')) as WearPart;
  const sorted=[...list].sort((a,b)=>a.at.localeCompare(b.at)||a.hours-b.hours);
  for(let i=1;i<sorted.length;i++){
   const gap=sorted[i].hours-sorted[i-1].hours;if(!(gap>0&&gap<=MAX_GAP_HOURS))continue;
   const riders=perRider.get(part)??new Map<string,number[]>();const mine=riders.get(sorted[i].rider)??[];mine.push(gap);riders.set(sorted[i].rider,mine);perRider.set(part,riders);
  }
 }
 const out:WearPartSummary[]=[];
 for(const part of Object.keys(WEAR_PART_LABEL) as WearPart[]){
  const riders=perRider.get(part);if(!riders||riders.size<Math.max(minRiders,RIDER_WEAR_MIN_RIDERS))continue;
  const medians=[...riders.values()].map(median),intervals=[...riders.values()].reduce((n,g)=>n+g.length,0);
  out.push({part,label:WEAR_PART_LABEL[part],riders:riders.size,intervals,median_hours:round(median(medians)),
   ...(riders.size>=RIDER_WEAR_RANGE_MIN_RIDERS?{typical_range_hours:[round(quantile(medians,0.25)),round(quantile(medians,0.75))] as [number,number]}:{})});
 }
 return out;
}

/** Questions about part life and service timing: the only ones the rider-wear lookup runs for. */
export const WEAR_ABOUT=/\b(how (long|many hours)|hours?\b.*\b(last|get|between|before|until)|last(s)? (me|you)?\s*\b|wear(s|ing)? out|worn|wear|life|lifespan|interval|due|overdue|replace|replacement|rebuild|top[\s-]?end|piston|rings?|valves?|shim|cam chain|clutch|crank|bottom[\s-]?end|reeds?|bearings?|chain|sprockets?|brake pads?|pads|air filter|oil change|spark plug|tires?|repack|packing|service|maintenance)\b/i;
