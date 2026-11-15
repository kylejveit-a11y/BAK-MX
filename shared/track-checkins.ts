// Live track check-ins: one tap from a rider at the track about how it is right now. Shown to other riders as "Right now"
// with how many riders said it and how long ago, never who. Riders' word, not the track's: closures are always labelled as
// what riders reported, and anything older than the window fades out.

export const CHECKIN_STATUSES=[
 {id:'open',label:'Open'},{id:'closed',label:'Closed'},{id:'busy',label:'Busy'},{id:'quiet',label:'Quiet'},
 {id:'watering',label:'Watering now'},{id:'muddy',label:'Muddy'},{id:'dusty',label:'Dusty'},{id:'rough',label:'Rough'},{id:'fresh_prep',label:'Fresh prep'},
] as const;
export type CheckinStatus=(typeof CHECKIN_STATUSES)[number]['id'];
const IDS=CHECKIN_STATUSES.map(s=>s.id) as string[];
const LABEL=new Map<string,string>(CHECKIN_STATUSES.map(s=>[s.id,s.label]));
/** Pairs that cannot both be picked in one check-in. */
const OPPOSITE:Record<string,string>={open:'closed',closed:'open',busy:'quiet',quiet:'busy',muddy:'dusty',dusty:'muddy'};
export const checkinLabel=(id:string)=>LABEL.get(id)??id;

export const CHECKIN_LIMITS={perPick:4,perHour:6,windowHours:6} as const;
export const CHECKIN_COPY={
 title:'Right now',empty:'No check-ins in the last 6 hours.',
 ask:'At the track? Tap what it’s like right now.',send:'Check in',sent:'Thanks. Riders see it for the next few hours (never your name).',
 noSignal:'No signal. Check-ins only send live, since they’re about right now. Try again when you have a bar or two.',pickOne:'Tap at least one first.',
 riders:'Riders’ reports, not the track’s. Call ahead before a long drive.',
} as const;

/** Tap a status: toggles it, drops its opposite, keeps at most four. */
export function toggleStatus(picked:readonly string[],id:string):string[]{
 if(!IDS.includes(id))return [...picked];
 if(picked.includes(id))return picked.filter(x=>x!==id);
 return [...picked.filter(x=>x!==OPPOSITE[id]),id].slice(-CHECKIN_LIMITS.perPick);
}
export function statusProblem(statuses:readonly string[]):string|null{
 if(!statuses.length)return CHECKIN_COPY.pickOne;
 if(statuses.length>CHECKIN_LIMITS.perPick)return `Pick up to ${CHECKIN_LIMITS.perPick}.`;
 if(statuses.some(s=>!IDS.includes(s)))return 'Unknown check-in.';
 if(statuses.some(s=>OPPOSITE[s]&&statuses.includes(OPPOSITE[s])))return 'Pick one of each pair (open or closed, busy or quiet, muddy or dusty).';
 return null;
}
/** Known statuses in the list's order, no repeats. */
export const normalizeStatuses=(s:readonly string[])=>IDS.filter(id=>s.includes(id));

export type CheckinRow={user_id?:string;statuses:string[]|null;created_at:string};
export type LiveStatus={id:string;label:string;riders:number;minutes_ago:number};
export type LiveConditions={window_hours:number;checkins:number;latest_minutes_ago:number;statuses:LiveStatus[];as_of?:string};
/** A copy read earlier (kept on the phone with no signal) aged to now: minutes moved on, anything past the window dropped. */
export function agedConditions(c:LiveConditions|null,now:Date):LiveConditions|null{
 if(!c)return null;const extra=c.as_of?Math.max(0,Math.round((now.getTime()-Date.parse(c.as_of))/60e3)):0;
 const statuses=c.statuses.map(s=>({...s,minutes_ago:s.minutes_ago+extra})).filter(s=>s.minutes_ago<=c.window_hours*60);
 return statuses.length?{...c,latest_minutes_ago:c.latest_minutes_ago+extra,statuses}:null;
}

/** What riders said in the last few hours: per status, how many riders and how long since the latest. A rider who checked
 *  in twice counts once per status, with their latest time. For each opposite pair only the most recent side is kept
 *  (a track that was closed at 8 and open at 10 is open). Riders hidden by a block are left out. */
export function aggregateCheckins(rows:CheckinRow[],now:Date,{hidden=new Set<string>()}:{hidden?:Set<string>}={}):LiveConditions|null{
 const from=now.getTime()-CHECKIN_LIMITS.windowHours*3600e3;
 const live=rows.filter(r=>{const t=Date.parse(r.created_at);return Number.isFinite(t)&&t>=from&&t<=now.getTime()+60e3&&!(r.user_id&&hidden.has(r.user_id));});
 if(!live.length)return null;
 const per=new Map<string,{riders:Set<string>;latest:number}>();
 live.forEach((r,i)=>{const t=Date.parse(r.created_at);for(const s of normalizeStatuses(r.statuses??[])){const e=per.get(s)??{riders:new Set<string>(),latest:0};e.riders.add(r.user_id??'row'+i);e.latest=Math.max(e.latest,t);per.set(s,e);}});
 for(const [a,b] of Object.entries(OPPOSITE))if(per.has(a)&&per.has(b)){if(per.get(a)!.latest>=per.get(b)!.latest)per.delete(b);else per.delete(a);}
 const mins=(t:number)=>Math.max(0,Math.round((now.getTime()-t)/60e3));
 const statuses=[...per].map(([id,e])=>({id,label:checkinLabel(id),riders:e.riders.size,minutes_ago:mins(e.latest)}))
  .sort((a,b)=>(a.id==='closed'?-1:b.id==='closed'?1:0)||a.minutes_ago-b.minutes_ago||IDS.indexOf(a.id)-IDS.indexOf(b.id));
 return {window_hours:CHECKIN_LIMITS.windowHours,checkins:live.length,latest_minutes_ago:mins(Math.max(...live.map(r=>Date.parse(r.created_at)))),statuses};
}
/** "25 min ago", "2 h ago", "just now". */
export function agoText(minutes:number):string{
 if(minutes<2)return 'just now';
 if(minutes<60)return `${minutes} min ago`;
 const h=Math.floor(minutes/60),m=minutes%60;return m>=30&&h<3?`${h}½ h ago`:`${h} h ago`;
}
/** One line for a card: "Closed · 1 rider · 20 min ago". */
export const liveStatusLine=(s:LiveStatus)=>`${s.label} · ${s.riders} rider${s.riders===1?'':'s'} · ${agoText(s.minutes_ago)}`;
