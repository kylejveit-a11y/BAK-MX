// Practice day, and the "next moto / next session at 10:40" both race day and practice day use. The rules both apps share:
// the short practice checklist (BAK's race-prep items that fit a practice day), the session log (number, time on track,
// notes, the setup change, which goes into the setup log), the time the rider typed ("Moto 1 at 10:40"), the countdown to it,
// the next checklist item, and the "Ask BAK about today" question with the day's context. Pure, so it runs in Node tests,
// the browser and the phone. Storage stays in each app (files on the phone, localStorage on the web).
import {PREP_ITEMS,type PrepItem,type RacePhase} from './race-prep.ts';
import {SETUP_RESULT_LABELS,type SetupResult} from './rider-types.ts';
import type {NextUp} from './race-day.ts';

// ------------------------------------------------------------------ the practice checklist
export type PracticePhase=Extract<RacePhase,'track'|'motos'|'after'>;
/** A practice day has no week before or night before: just before you ride, between sessions and after. Ids are race-prep phases. */
export const PRACTICE_PHASES:{id:PracticePhase;label:string;short:string}[]=[
 {id:'track',label:'Before you ride',short:'Before you ride'},
 {id:'motos',label:'Between sessions',short:'Between sessions'},
 {id:'after',label:'After practice',short:'After'},
];
/** BAK's race-prep items that fit a practice day, in the order they're done. Same ids, so a "why" stays with its item. */
export const PRACTICE_ITEM_IDS=[
 'track-set-tire-pressure-for-conditions','track-check-chain-slack-and-lube','track-quick-bolt-and-spoke-check','track-fuel-tank-full',
 'track-brakes-levers-controls-feel-right','track-bleed-fork-air-wheel-up','track-check-sag','track-warm-the-bike-up-fully','track-practice-roll-jumps-first-lap',
 'motos-refuel','motos-hydrate-and-eat','motos-recheck-tire-pressure','motos-chain-tension-and-lube','motos-check-spokes','motos-clean-goggles-fresh-tear-offs',
 'motos-bleed-fork-air-once-cold','motos-check-for-leaks-crash-damage','motos-note-what-the-bike-needs',
 'after-wash-bike-plug-airbox-and-exhaust','after-clean-and-oil-air-filter','after-log-hours-service-due','after-write-down-setup-that-worked',
] as const;
/** Practice words where the race list says "practice" or "moto". */
const PRACTICE_LABELS:Record<string,string>={'track-practice-roll-jumps-first-lap':'Roll jumps the first lap'};
/** BAK's practice list for this kind of riding (fork-air items are motocross only, like the race list). */
export function defaultPracticeList(discipline:'mx'|'offroad'):PrepItem[]{
 return PRACTICE_ITEM_IDS.map(id=>PREP_ITEMS.find(i=>i.id===id)).filter((i):i is PrepItem=>!!i&&(!i.discipline||i.discipline==='both'||i.discipline===discipline)).map(i=>({...i,label:PRACTICE_LABELS[i.id]??i.label}));
}
/** The rider's saved practice list, with BAK's "why" put back on the items that came from BAK's list. */
export function hydratePracticeList(saved:{id:string;label:string;phase:RacePhase;custom?:boolean}[]|null|undefined,discipline:'mx'|'offroad'):PrepItem[]{
 if(!Array.isArray(saved))return defaultPracticeList(discipline);
 return saved.filter(s=>s&&typeof s.id==='string'&&typeof s.label==='string'&&PRACTICE_PHASES.some(p=>p.id===s.phase)).map(s=>{const base=PREP_ITEMS.find(i=>i.id===s.id);return {...s,...(base&&!s.custom&&base.why?{why:base.why}:{})};});
}
/** The next thing to check: the first unchecked item, phase by phase. Null when everything in those phases is done. */
export function nextChecklistItem(list:PrepItem[],checks:Record<string,boolean>,phases:RacePhase[]):PrepItem|null{
 for(const p of phases){const hit=list.find(i=>i.phase===p&&!checks[i.id]);if(hit)return hit;}
 return null;
}
/** How many items in those phases are checked, and how many there are. */
export function checklistCount(list:PrepItem[],checks:Record<string,boolean>,phases:RacePhase[]):{done:number;total:number}{
 const its=list.filter(i=>phases.includes(i.phase));return {done:its.filter(i=>checks[i.id]).length,total:its.length};
}

// ------------------------------------------------------------------ "Moto 1 at 10:40"
/** "10:40", "10.40", "1040", "2:15pm", "2 pm", "14:15" → "HH:MM" (24 h), or null. A bare hour from 1 to 6 reads as afternoon. */
export function parseClock(text:string):string|null{
 const t=text.trim().toLowerCase().replace(/\s+/g,'');
 const m=/^(\d{1,2})(?:[:.h]?(\d{2}))?(a|am|p|pm)?$/.exec(t);if(!m)return null;
 let h=Number(m[1]);const min=m[2]?Number(m[2]):0,ap=m[3]?.[0];
 if(min>59||h>23)return null;
 if(ap){if(h<1||h>12)return null;if(ap==='p'&&h<12)h+=12;if(ap==='a'&&h===12)h=0;}
 else if(!m[2]&&h>=1&&h<=6)h+=12;
 return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
}
/** "Moto 1 at 10:40", "moto 2 2:15pm", "Practice 9:30", "Session 3 at 11", or just "10:40" (labelled with `fallback`). */
export function parseNextUp(text:string,fallback='Moto 1'):NextUp|null{
 const t=text.replace(/\s+/g,' ').trim();if(!t)return null;
 const tidy=(l:string)=>l.trim().replace(/^./,c=>c.toUpperCase()).slice(0,30)||fallback;
 // "… at 10:40" / "… @ 11": anything after "at" is the time.
 const withAt=/^(.*?)\s*(?:\bat\b|@)\s*(\S.*)$/i.exec(t);
 if(withAt){const at=parseClock(withAt[2]);if(at)return {label:tidy(withAt[1]),at};}
 // No "at": the time must look like one ("10:40", "2:15pm", "2 pm", "1040"), so "Moto 2" alone is not 2 o'clock.
 const bare=/^(.*?)\s*(\d{1,2}[:.]\d{2}\s*(?:am|pm|a|p)?|\d{1,2}\s*(?:am|pm)|\d{3,4})$/i.exec(t);
 if(bare){const at=parseClock(bare[2]);if(at)return {label:tidy(bare[1]),at};}
 return null;
}
/** "10:40 AM" for "10:40". */
export function clockText(at:string):string{
 const m=/^(\d{2}):(\d{2})$/.exec(at);if(!m)return '';let h=Number(m[1]);const ap=h>=12?'PM':'AM';h=h%12||12;return `${h}:${m[2]} ${ap}`;
}
/** When the next moto or session starts, on the race's day (local time). Null when no time is set. */
export function nextUpDate(next:NextUp|null|undefined,day:string):Date|null{
 if(!next||!/^\d{2}:\d{2}$/.test(next.at)||!/^\d{4}-\d{2}-\d{2}$/.test(day))return null;
 const [y,mo,d]=day.split('-').map(Number),[h,mi]=next.at.split(':').map(Number);return new Date(y,mo-1,d,h,mi,0,0);
}
/** "in 25 min", "in 1 h 5 min", "now", "started 12 min ago". Empty with no time set. */
export function countdownText(at:Date|null,now=new Date()):string{
 if(!at)return '';const min=Math.round((at.getTime()-now.getTime())/60000);
 if(min>=60){const h=Math.floor(min/60),m=min%60;return `in ${h} h${m?` ${m} min`:''}`;}
 if(min>0)return `in ${min} min`;
 if(min>-2)return 'now';
 return `started ${-min} min ago`;
}
/** One line for the race-day screen: "Moto 1 · 10:40 AM · in 25 min", or "Moto 2 · set the time". */
export function nextUpLine(next:NextUp|null|undefined,day:string,now=new Date()):string{
 if(!next)return '';const at=nextUpDate(next,day);
 return at?`${next.label} · ${clockText(next.at)} · ${countdownText(at,now)}`:`${next.label} · set the time`;
}
/** The labels in order (race: Practice, Moto 1…; practice: Session 1…), so logging one moves "next up" along. */
export function followingLabel(label:string):string{
 const m=/^(.*?)(\d+)$/.exec(label.trim());if(m)return `${m[1]}${Number(m[2])+1}`;
 return /^practice$/i.test(label.trim())?'Moto 1':label;
}
/** After the rider logs `logged`: if it was the one up next, the next one is the following moto or session, time not set. */
export function advanceNextUp(next:NextUp|null|undefined,logged:string):NextUp|null{
 if(!next)return null;if(next.label.trim().toLowerCase()!==logged.trim().toLowerCase())return next;
 return {label:followingLabel(next.label),at:''};
}

// ------------------------------------------------------------------ the session log
export type PracticeSession={id:string;n:number;at:string;minutes:number|null;notes:string;change:string;detail:string;result:SetupResult;logId:string|null;waiting?:boolean};
export type SessionDraft={minutes:string;notes:string;change:string;detail:string;result:SetupResult};
export const emptySession=():SessionDraft=>({minutes:'',notes:'',change:'',detail:'',result:'not_tested'});
/** Time-on-track picks, in minutes. */
export const SESSION_MINUTES=[10,15,20,30];
export const SESSION_LIMITS={minutes:240,notes:500,detail:200,perDay:40} as const;
export const PRACTICE_COPY={
 start:'Start practice day',title:'Practice day',
 intro:'Today’s bike and setup, a short checklist, a log of each session and how the track rode. Each setup change you log goes into your setup log.',
 sessions:'SESSIONS',logSession:'LOG A SESSION',timeOnTrack:'Time on track',minutesPlaceholder:'min',notesLabel:'How it went (optional)',notesPlaceholder:'e.g. front pushed in the flat turns, got braver on the triple',
 changeLabel:'Setup change for the next session (optional)',save:'Save session',saving:'Saving…',
 queued:'No signal. Saved on this phone; the setup change sends when you’re back in range.',
 ask:'Ask BAK about today',askDetail:'Sends BAK your bike, setup, today’s sessions and how the track rode.',
 end:'End practice day',none:'No sessions yet. Log one when you come off the track.',
};
/** The next session number: one more than the highest logged today. */
export const nextSessionNumber=(sessions:PracticeSession[])=>sessions.reduce((n,s)=>Math.max(n,s.n),0)+1;
/** Whole minutes from 1 to 240 out of "20", "20 min", "1:15" (h:mm); null when blank. A string is the problem to show. */
export function parseMinutes(text:string):number|null|string{
 const t=text.trim().toLowerCase().replace(/\s*(min|mins|minutes|m)$/,'');if(!t)return null;
 const hm=/^(\d{1,2}):(\d{2})$/.exec(t);const n=hm?Number(hm[1])*60+Number(hm[2]):Number(t);
 if(!Number.isFinite(n)||n<1||n>SESSION_LIMITS.minutes)return `Time on track: use minutes from 1 to ${SESSION_LIMITS.minutes}.`;
 return Math.round(n);
}
/** The session the rider just logged, or what to fix first. */
export function makeSession(sessions:PracticeSession[],d:SessionDraft,now=new Date()):{session:PracticeSession;problem?:undefined}|{problem:string;session?:undefined}{
 if(sessions.length>=SESSION_LIMITS.perDay)return {problem:`That’s ${SESSION_LIMITS.perDay} sessions today. End practice day to start fresh.`};
 const minutes=parseMinutes(d.minutes);if(typeof minutes==='string')return {problem:minutes};
 const notes=d.notes.trim().slice(0,SESSION_LIMITS.notes),change=d.change.trim().slice(0,60),detail=d.detail.trim().slice(0,SESSION_LIMITS.detail);
 if(!minutes&&!notes&&!change&&!detail)return {problem:'Add the time on track, a note or a change first.'};
 if(detail&&!change)return {problem:'Pick what you changed.'};
 return {session:{id:'s-'+now.getTime().toString(36)+Math.random().toString(36).slice(2,6),n:nextSessionNumber(sessions),at:now.toISOString(),minutes,notes,change,detail,result:change?d.result:'not_tested',logId:null}};
}
/** "Practice day · Session 2 · 20 min": the setup log's conditions line, and the label on the screen. */
export const sessionLabel=(s:Pick<PracticeSession,'n'|'minutes'>)=>`Session ${s.n}${s.minutes?` · ${s.minutes} min`:''}`;
export const sessionConditions=(s:Pick<PracticeSession,'n'|'minutes'>)=>`Practice day · ${sessionLabel(s)}`.slice(0,200);
export const sessionChange=(s:Pick<PracticeSession,'change'|'detail'>)=>s.change?`${s.change}${s.detail?': '+s.detail:''}`.slice(0,1000):'';
/** The POST /api/setup-logs body for a session with a setup change, or null: sessions without a change stay off the setup log. */
export function sessionLogBody(s:PracticeSession,bike:{id:string;engine_hours?:number|null;configuration?:Record<string,unknown>|null},track:string):Record<string,unknown>|null{
 if(!s.change)return null;
 const settings:Record<string,string>={};for(const k of ['fork_compression','fork_rebound','shock_compression','shock_rebound','rider_sag_mm','fork_height_mm','tire_pressures']){const v=bike.configuration?.[k];if(v!=null&&v!=='')settings[k]=String(v).slice(0,200);}
 return {bike_id:bike.id,recorded_at:s.at,track:track.slice(0,120),conditions:sessionConditions(s),engine_hours:bike.engine_hours??null,settings,change_made:sessionChange(s),result:s.result,notes:s.notes.slice(0,4000)};
}
/** Minutes on track today, from the sessions that have a time. */
export const trackMinutes=(sessions:PracticeSession[])=>sessions.reduce((n,s)=>n+(s.minutes??0),0);
/** "3 sessions · 55 min on track". */
export function sessionsSummary(sessions:PracticeSession[]):string{
 if(!sessions.length)return '';const m=trackMinutes(sessions);
 return `${sessions.length} session${sessions.length===1?'':'s'}${m?` · ${m>=60?`${Math.floor(m/60)} h ${String(m%60).padStart(2,'0')} min`:`${m} min`} on track`:''}`;
}
/** The day's sessions as kept on the device: only today's count; a new day starts empty. */
export type StoredPractice={day:string;sessions:PracticeSession[]};
export function sessionsFor(stored:StoredPractice|null|undefined,day:string):PracticeSession[]{
 return stored&&stored.day===day&&Array.isArray(stored.sessions)?stored.sessions.filter(s=>s&&typeof s.n==='number'):[];
}

// ------------------------------------------------------------------ Ask BAK about today
export type DayContext={track:string;bike:string;setup:[string,string][];sessions:PracticeSession[];report?:string};
/** The question "Ask BAK about today" puts in the box: the bike, its setup, each session and how the track rode. */
export function practiceAskText(c:DayContext):string{
 const lines=[`Practice day${c.track?` at ${c.track}`:''} on my ${c.bike}.`];
 if(c.setup.length)lines.push(`Setup now: ${c.setup.map(([k,v])=>`${k} ${v}`).join(', ')}.`);
 if(c.report)lines.push(`The track: ${c.report}.`);
 if(c.sessions.length){lines.push('Today so far:');for(const s of [...c.sessions].sort((a,b)=>a.n-b.n))lines.push(`- ${sessionLabel(s)}${s.change?`: changed ${sessionChange(s)} → ${SETUP_RESULT_LABELS[s.result]}`:''}${s.notes?` (${s.notes})`:''}`);}
 else lines.push('No sessions logged yet.');
 lines.push('What should I work on or change for the next session?');
 return lines.join('\n').slice(0,4000);
}

/** The next quarter hour after now, as "HH:MM": where the Next up time picker opens so the first tap is close to right. */
export function nextQuarterHour(now=new Date()):string{
 const d=new Date(now.getTime());d.setSeconds(0,0);const m=d.getMinutes(),up=15-(m%15);d.setMinutes(m+up);
 return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
