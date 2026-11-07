// "How did it ride?" — a rider's two-tap report on how a track rode on a day, the rules both apps and the server share:
// the chips (one word list, so the website, the phone and Ask BAK say the same thing), the checks a report must pass,
// which tracks to offer first, when a chat message is the rider saying they rode a track today or yesterday, and how
// recent reports add up per track for Ask BAK. Pure, so it runs in Node tests, the browser and the phone.
import {matchTracks} from './track-match.ts';
import {knownTrack,normTrack,type KnownTrack} from './race-day.ts';

export type ReportGroup='dirt'|'moisture'|'surface'|'prep';
/** Chip groups in the order the card shows them. `one` groups take a single pick; surface takes several. */
export const REPORT_GROUPS:{id:ReportGroup;label:string;one:boolean;tags:{id:string;label:string}[]}[]=[
 {id:'dirt',label:'Dirt',one:true,tags:[{id:'sand',label:'Sand'},{id:'loam',label:'Loam'},{id:'clay',label:'Clay'},{id:'hard_pack',label:'Hard-pack'},{id:'mixed',label:'Mixed'}]},
 {id:'moisture',label:'Moisture',one:true,tags:[{id:'watered',label:'Watered'},{id:'wet_muddy',label:'Wet / muddy'},{id:'tacky',label:'Tacky'},{id:'dry',label:'Dry'},{id:'dusty',label:'Dusty'}]},
 {id:'surface',label:'Surface',one:false,tags:[{id:'ruts_deep',label:'Ruts deep'},{id:'ruts_light',label:'Ruts light'},{id:'braking_bumps',label:'Braking bumps'},{id:'square_edge',label:'Square edge'},{id:'whoops_rough',label:'Whoops rough'},{id:'rocks',label:'Rocks'}]},
 {id:'prep',label:'Prep',one:true,tags:[{id:'fresh_prep',label:'Fresh prep'},{id:'ripped',label:'Ripped'},{id:'rolled',label:'Rolled'}]},
];
export const REPORT_TAGS=REPORT_GROUPS.flatMap(g=>g.tags.map(t=>t.id));
const GROUP_OF=new Map(REPORT_GROUPS.flatMap(g=>g.tags.map(t=>[t.id,g] as const)));
const LABEL_OF=new Map(REPORT_GROUPS.flatMap(g=>g.tags.map(t=>[t.id,t.label] as const)));
/** How a tag reads in a sentence ("deep ruts", "watered", "sand"): Ask BAK and the summary line use these. */
const SAY:Record<string,string>={ruts_deep:'deep ruts',ruts_light:'light ruts',braking_bumps:'braking bumps',square_edge:'square-edged bumps',whoops_rough:'rough whoops',rocks:'rocks',hard_pack:'hard-pack',wet_muddy:'wet / muddy',fresh_prep:'fresh prep',ripped:'ripped',rolled:'rolled'};
export const tagLabel=(id:string)=>LABEL_OF.get(id)??id;
export const tagSay=(id:string)=>SAY[id]??tagLabel(id).toLowerCase();

/** The words on the card, the same on the website, the phone and in Ask BAK. */
export const REPORT_COPY={
 title:'How did it ride?',
 intro:'Two taps: the dirt and how it rode today. Ask BAK uses recent reports, never your name, to keep track advice current.',
 track:'Track',search:'Search tracks, e.g. Dade City',noTrack:'Pick one of BAK’s tracks to report on it.',
 day:'Day ridden',today:'Today',yesterday:'Yesterday',
 tire:'Tire (optional)',tirePlaceholder:'e.g. MX33 rear',front:'Front psi',rear:'Rear psi',
 setup:'Setup I ran (optional)',setupLinked:'Linked to your setup log entry',setupPlaceholder:'e.g. stock clickers, 105 mm sag',unlink:'Unlink',
 note:'Note (optional)',notePlaceholder:'e.g. ruts got deep in the back section by the last moto',
 more:'Tire, setup and a note',less:'Hide tire, setup and note',
 save:'Save',saving:'Saving…',saved:'Saved. Thanks: Ask BAK now counts it for this track (without your name).',
 queued:'No signal. Saved on this phone; it sends when you’re back in range.',
 pickOne:'Tap at least one chip first.',
 askPrompt:(track:string,day:string)=>`Rode ${track} ${day}? Tell BAK how it rode.`,
 others:'Riders here lately',
};

export const REPORT_LIMITS={note:500,tire:80,setupText:200,minPsi:4,maxPsi:30,daysBack:30,perDay:20} as const;

/** The tags a rider picked, deduped, in card order; unknown tags are dropped. */
export function normalizeTags(tags:readonly string[]):string[]{const set=new Set(tags);return REPORT_TAGS.filter(t=>set.has(t));}
/** Why a set of tags cannot be saved, or null: at least one, all known, one pick per single-choice group. */
export function tagProblem(tags:readonly string[]):string|null{
 if(!tags.length)return REPORT_COPY.pickOne;
 const unknown=tags.find(t=>!GROUP_OF.has(t));if(unknown)return `Unknown chip: ${unknown.slice(0,40)}`;
 for(const g of REPORT_GROUPS)if(g.one&&tags.filter(t=>GROUP_OF.get(t)===g).length>1)return `Pick one ${g.label.toLowerCase()} chip.`;
 if(tags.includes('ruts_deep')&&tags.includes('ruts_light'))return 'Ruts are deep or light, not both.';
 return null;
}
/** Tap a chip: single-choice groups swap, surface toggles (deep and light ruts swap with each other). */
export function toggleTag(tags:readonly string[],id:string):string[]{
 const g=GROUP_OF.get(id);if(!g)return [...tags];
 if(tags.includes(id))return tags.filter(t=>t!==id);
 const rivals=g.one?new Set(g.tags.map(t=>t.id)):new Set(id==='ruts_deep'?['ruts_light']:id==='ruts_light'?['ruts_deep']:[]);
 return normalizeTags([...tags.filter(t=>!rivals.has(t)),id]);
}

/** YYYY-MM-DD n days from a YYYY-MM-DD day (calendar arithmetic at noon UTC, so it never slips a day). */
export const addDays=(day:string,n:number)=>new Date(Date.parse(day+'T12:00:00Z')+n*864e5).toISOString().slice(0,10);
/** Why a ridden-on day cannot be saved, or null. A day ahead is allowed for time zones; older than 30 days is too stale. */
export function dayProblem(day:string,today:string):string|null{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(Date.parse(day+'T12:00:00Z'))||addDays(day,0)!==day)return 'Pick the day you rode.';
 if(day>addDays(today,1))return 'That day hasn’t happened yet.';
 if(day<addDays(today,-REPORT_LIMITS.daysBack))return `Reports are for the last ${REPORT_LIMITS.daysBack} days, while the track still rides that way.`;
 return null;
}

// ------------------------------------------------------------------ picking the track
export type ReportTrack=KnownTrack&{id?:string;lat?:number|null;lng?:number|null};
const miles=(a:ReportTrack,b:ReportTrack)=>{const r=Math.PI/180,dLat=(b.lat!-a.lat!)*r,dLng=(b.lng!-a.lng!)*r,x=Math.sin(dLat/2)**2+Math.cos(a.lat!*r)*Math.cos(b.lat!*r)*Math.sin(dLng/2)**2;return 7918*Math.asin(Math.sqrt(x));};
const located=(t:ReportTrack)=>typeof t.lat==='number'&&typeof t.lng==='number';
/** Tracks to offer first: the rider's recent ones (reports, race day, setup log; newest first), then the tracks nearest
 *  where they ride (by distance from their latest located track, else the same state). No location permission needed. */
export function reportTrackPicks(dir:ReportTrack[],recent:string[],limit=6):ReportTrack[]{
 const out:ReportTrack[]=[],seen=new Set<string>();
 const add=(t:ReportTrack|undefined)=>{if(t&&!seen.has(normTrack(t.name))&&out.length<limit){seen.add(normTrack(t.name));out.push(t);}};
 const mine=recent.map(n=>knownTrack(dir,n) as ReportTrack|undefined).filter((t):t is ReportTrack=>!!t);
 mine.forEach(add);
 const anchor=mine.find(located);
 if(anchor)dir.filter(t=>located(t)&&!seen.has(normTrack(t.name))).map(t=>({t,d:miles(anchor,t)})).filter(x=>x.d<=150).sort((a,b)=>a.d-b.d).forEach(x=>add(x.t));
 else if(mine[0])dir.filter(t=>t.state===mine[0].state).forEach(add);
 return out;
}

/** "Rode Dade City today", "raced Gatorback yesterday": the track (from BAK's list) and the day, or null. Only riding
 *  the track today or yesterday counts; planning to ride it, or a question about it, does not. */
/** A cheap first look before matching tracks: the message says today/yesterday and uses a riding word. */
export const mayMentionRide=(text:string)=>/\b(today|this morning|this afternoon|tonight|yesterday|last night)\b/i.test(text)&&/\b(rode|ridden|raced|practi[cs]ed|went to|was at|were at|motos|laps)\b/i.test(text);
export function rodeTrackMention<T extends ReportTrack&{id:string;aliases?:string[]}>(text:string,dir:T[],today:string):{track:T;day:string}|null{
 const t=' '+text.toLowerCase().replace(/[’']/g,'').replace(/\s+/g,' ')+' ';
 const when=/\b(today|this morning|this afternoon|tonight)\b/.test(t)?0:/\b(yesterday|last night)\b/.test(t)?-1:null;
 if(when===null)return null;
 if(!/\b(rode|ridden|raced|practiced|practised|went to|was at|were at|did motos|got laps|spun laps|turned laps|got some laps)\b/.test(t))return null;
 if(/\b(going to|gonna|will|planning|plan to|tomorrow|this weekend|next)\b/.test(t)&&!/\b(rode|raced|practiced|practised)\b/.test(t))return null;
 const hit=matchTracks(text,dir.map(d=>({...d,aliases:d.aliases??[]})),1)[0] as T|undefined;
 return hit?{track:hit,day:addDays(today,when)}:null;
}

// ------------------------------------------------------------------ adding reports up for Ask BAK
export type ReportRow={user_id?:string;ridden_on:string;tags:string[]|null;note?:string|null;front_psi?:number|string|null;rear_psi?:number|string|null};
export type ReportWindow={reports:number;since:string;tags:Record<string,number>};
export type RecentRiderReports={latest:string;last_7_days:ReportWindow;last_30_days:ReportWindow;last_90_days:ReportWindow;
 tire_pressure_30_days?:{reports:number;front_psi_median:number|null;rear_psi_median:number|null};recent_notes:{date:string;note:string}[]};

/** A note as Ask BAK may see it: no handles, emails, phone numbers or links, so nothing in it points at a person. */
export function anonymousNote(note:string):string{
 return note.replace(/https?:\/\/\S+|www\.\S+/gi,'[link]').replace(/[\w.+-]+@[\w-]+\.[\w.]+/g,'[email]').replace(/@\w{2,}/g,'[rider]').replace(/\+?\d[\d\s().-]{8,}\d/g,'[number]').replace(/\s+/g,' ').trim().slice(0,REPORT_LIMITS.note);
}
const median=(xs:number[])=>{if(!xs.length)return null;const s=[...xs].sort((a,b)=>a-b),m=s.length>>1;return Math.round((s.length%2?s[m]:(s[m-1]+s[m])/2)*2)/2;};
const psi=(v:unknown)=>{const n=typeof v==='string'?Number(v):v;return typeof n==='number'&&Number.isFinite(n)&&n>=REPORT_LIMITS.minPsi&&n<=REPORT_LIMITS.maxPsi?n:null;};

/** Recent reports for one track, added up: report counts and how often each condition was tagged in the last 7, 30 and
 *  90 days (worded the way a rider says it, most-tagged first), median tire pressures in the last 30 days, and the latest
 *  few notes with their dates and no names. Null when nobody reported in 90 days. Rows from riders in `hidden` (blocks
 *  either way with the rider asking) are left out. */
export function aggregateReports(rows:ReportRow[],today:string,{notes=3,hidden=new Set<string>()}:{notes?:number;hidden?:Set<string>}={}):RecentRiderReports|null{
 const since=(n:number)=>addDays(today,-n);
 const live=rows.filter(r=>/^\d{4}-\d{2}-\d{2}$/.test(r.ridden_on)&&r.ridden_on>=since(90)&&r.ridden_on<=addDays(today,1)&&!(r.user_id&&hidden.has(r.user_id))).sort((a,b)=>b.ridden_on.localeCompare(a.ridden_on));
 if(!live.length)return null;
 const win=(n:number):ReportWindow=>{
  const inWin=live.filter(r=>r.ridden_on>=since(n)),counts=new Map<string,number>();
  for(const r of inWin)for(const t of normalizeTags(r.tags??[]))counts.set(t,(counts.get(t)??0)+1);
  return {reports:inWin.length,since:since(n),tags:Object.fromEntries([...counts].sort((a,b)=>b[1]-a[1]||REPORT_TAGS.indexOf(a[0])-REPORT_TAGS.indexOf(b[0])).map(([t,c])=>[tagSay(t),c]))};
 };
 const month=live.filter(r=>r.ridden_on>=since(30)),front=month.map(r=>psi(r.front_psi)).filter((x):x is number=>x!==null),rear=month.map(r=>psi(r.rear_psi)).filter((x):x is number=>x!==null);
 const out:RecentRiderReports={latest:live[0].ridden_on,last_7_days:win(7),last_30_days:win(30),last_90_days:win(90),recent_notes:live.filter(r=>r.note&&r.note.trim()).slice(0,notes).map(r=>({date:r.ridden_on,note:anonymousNote(r.note!)})).filter(n=>n.note)};
 if(front.length||rear.length)out.tire_pressure_30_days={reports:Math.max(front.length,rear.length),front_psi_median:median(front),rear_psi_median:median(rear)};
 return out;
}

/** One line for the track screen: "Riders this month (4 reports): deep ruts 3, watered 2, sand 2". */
export function reportSummaryLine(r:RecentRiderReports|null):string{
 if(!r)return '';
 const w=r.last_30_days.reports?r.last_30_days:r.last_90_days,span=w===r.last_30_days?(r.last_7_days.reports===w.reports?'this week':'this month'):'the last 3 months';
 const tags=Object.entries(w.tags).slice(0,4).map(([t,c])=>`${t} ${c}`).join(', ');
 return `Riders ${span} (${w.reports} report${w.reports===1?'':'s'})${tags?': '+tags:''}`;
}

// ------------------------------------------------------------------ the card's draft, turned into the request body
export type ReportDraft={trackId:string;day:string;tags:string[];tire:string;front:string;rear:string;setupLogId:string|null;setupText:string;note:string};
export const emptyDraft=(day:string):ReportDraft=>({trackId:'',day,tags:[],tire:'',front:'',rear:'',setupLogId:null,setupText:'',note:''});
/** The POST /api/track-reports body for a draft, or what the rider has to fix first. Same on both apps. */
export function reportBody(d:ReportDraft,today:string):{body:Record<string,unknown>;problem?:undefined}|{problem:string;body?:undefined}{
 if(!d.trackId)return {problem:REPORT_COPY.noTrack};
 const tags=tagProblem(d.tags);if(tags)return {problem:tags};
 const day=dayProblem(d.day,today);if(day)return {problem:day};
 const num=(s:string,label:string)=>{const t=s.trim().replace(/\s*psi$/i,'');if(!t)return null;const n=Number(t);return Number.isFinite(n)&&n>=REPORT_LIMITS.minPsi&&n<=REPORT_LIMITS.maxPsi?Math.round(n*10)/10:label;};
 const front=num(d.front,REPORT_COPY.front),rear=num(d.rear,REPORT_COPY.rear);
 for(const v of [front,rear])if(typeof v==='string')return {problem:`${v}: use a number from ${REPORT_LIMITS.minPsi} to ${REPORT_LIMITS.maxPsi}.`};
 return {body:{track_id:d.trackId,ridden_on:d.day,tags:normalizeTags(d.tags),tire:d.tire.trim().slice(0,REPORT_LIMITS.tire),front_psi:front,rear_psi:rear,
  setup_log_id:d.setupLogId,setup_text:d.setupLogId?'':d.setupText.trim().slice(0,REPORT_LIMITS.setupText),note:d.note.trim().slice(0,REPORT_LIMITS.note)}};
}
/** "Today", "Yesterday" or "Thu, Nov 6" for the ridden-on day. */
export const dayWord=(day:string,today:string)=>day===today?REPORT_COPY.today:day===addDays(today,-1)?REPORT_COPY.yesterday:new Date(day+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
