// Race day, the rules both apps share: what a saved race looks like, when it counts as today or ahead, the words on the
// quick-ask and change chips, and the exact question BAK gets for a starting setup. Pure, so the phone and the website
// behave the same and the rules can be tested in Node. Storage stays in each app (files on the phone, localStorage on the web).
import type {SetupLog} from './rider-types.ts';
import {SETUP_RESULT_LABELS} from './rider-types.ts';

/** A race the rider set up: the track, the date (today or ahead) and whether the phone's Home Screen widget counts down to it. */
export type RaceDay={on:boolean;track:string;day:string;widget?:boolean};
export const OFF_RACE:RaceDay={on:false,track:'',day:''};

/** The rider's own calendar day (not UTC), so an evening practice still counts as today. */
export const dayOf=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const today=()=>dayOf(new Date());

/** The saved race if it is still on and today or ahead; a past one is over and reads as nothing. */
export function activeRace(saved:RaceDay|null|undefined,now=today()):RaceDay|null{
 return saved&&saved.on&&typeof saved.day==='string'&&saved.day>=now?saved:null;
}
/** Today's race, if one is running (Ask BAK's race mode). */
export function raceToday(saved:RaceDay|null|undefined,now=today()):RaceDay|null{const r=activeRace(saved,now);return r&&r.day===now?r:null;}

/** Whole days from today to a YYYY-MM-DD day: 0 today, 1 tomorrow, negative once it has passed. */
export const daysToGo=(day:string)=>{const [y,m,d]=day.split('-').map(Number);const t=new Date();t.setHours(0,0,0,0);return Math.round((new Date(y,m-1,d).getTime()-t.getTime())/864e5);};
export const whenText=(day:string)=>{const n=daysToGo(day);return n<=0?'Today':n===1?'Tomorrow':`In ${n} days`;};
/** "Saturday, Nov 8" for a YYYY-MM-DD day, read at noon so time zones never move it a day. */
export const longDay=(day:string)=>new Date(day+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});

/** What riders feel between motos, in their words. One tap sends it to BAK in race mode. */
export const QUICK=['Front pushes in turns','Front harsh on braking bumps','Rear kicks on braking bumps','Rear squats out of turns','Bottoms on jumps','Harsh on landings','Headshake on the straights','Won’t hold the rut','No rear hookup','Bogs out of turns'];
/** What gets changed in the pits with a screwdriver or a gauge. */
export const CHANGES=['Fork compression','Fork rebound','Shock low-speed','Shock high-speed','Shock rebound','Sag','Front tire','Rear tire','Fork height','Other'];
export const MOTOS=['Practice','Moto 1','Moto 2','Moto 3'];

/** The quick-ask question for one chip. */
export const quickAskText=(track:string,feel:string)=>`Race day${track?` at ${track}`:''}, between motos: ${feel.toLowerCase()}. What's the one change to make?`;
/** Today's entries, oldest first, as the question "what should I try next?" */
export const tryNextText=(track:string,logs:SetupLog[])=>`Race day${track?` at ${track}`:''}. Here's what I changed today and how it rode:\n${logs.slice().reverse().map(l=>`- ${l.conditions.replace('Race day · ','')}: ${l.change_made} → ${SETUP_RESULT_LABELS[l.result]}${l.notes?` (${l.notes})`:''}`).join('\n')}\nWhat should I try next?`;

/** The conversation title and the question BAK gets for a starting setup at this track on this day. */
export const raceSetupTitle=(track:string,day:string)=>`Race setup · ${track||'track'} · ${day}`.slice(0,100);
export const raceSetupQuestion=(track:string,day:string)=>`Starting setup for ${track||'my next race'} on ${longDay(day)}. Work it out for the track and the conditions, starting from what's on my bike now.`.slice(0,8000);
/** The body `race` field for a starting-setup request on /api/chat. */
export const raceSetupField=(track:string,day:string)=>({...(track?{track:track.slice(0,120)}:{}),date:day,setup:true});
/** One saved setup per bike, track and day. */
export const raceSetupKey=(bikeId:string,track:string,day:string)=>`${bikeId}|${track.trim().toLowerCase()}|${day}`;
/** The forecast only exists inside a week; a setup worked out before that is worth refreshing once the race is within it. */
export function raceSetupStale(day:string,workedOutAt:string):boolean{
 const away=daysToGo(day);
 return away<=6&&daysToGo(workedOutAt.slice(0,10))>-1&&(Date.parse(day)-Date.parse(workedOutAt))/864e5>6.5;
}
/** Short lines on a card show as plain text: no markdown asterisks. */
export const plain=(t:string)=>t.replace(/\*\*/g,'').replace(/(^|\s)\*(\S)/g,'$1$2');

export type KnownTrack={name:string;city:string|null;state:string;aliases?:string[];weather:boolean};
export const normTrack=(x:string)=>x.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
/** The directory entry the typed name is, if it is one of BAK's tracks (by name or alias). */
export function knownTrack(dir:KnownTrack[],typed:string):KnownTrack|undefined{const t=normTrack(typed);return t?dir.find(k=>normTrack(k.name)===t||(k.aliases??[]).some(a=>normTrack(a)===t)):undefined;}
/** Up to five tracks matching what the rider typed (name, city or alias), none once the name is an exact match. */
export function trackSuggestions(dir:KnownTrack[],typed:string,limit=5):KnownTrack[]{const t=normTrack(typed);if(t.length<2||knownTrack(dir,typed))return [];return dir.filter(k=>[k.name,k.city??'',...(k.aliases??[])].some(x=>normTrack(x).includes(t))).slice(0,limit);}
/** One-tap track picks: tracks of events the rider is going to within 30 days, then recent setup-log tracks, no repeats. */
export function trackPicks(eventTracks:string[],logTracks:string[],limit=6):string[]{const seen=new Set<string>();return [...eventTracks,...logTracks].map(t=>t.trim()).filter(t=>t&&!seen.has(t.toLowerCase())&&!!seen.add(t.toLowerCase())).slice(0,limit);}
