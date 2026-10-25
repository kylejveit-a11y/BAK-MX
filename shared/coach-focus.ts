// "What are you showing BAK?" One tap on a clip or riding photos tells BAK which part of riding to look at, so it reads
// the right fundamentals and faults instead of guessing. The skill ids match shared/riding-coach.ts.
export const COACH_FOCUS=[
 {id:'corner',label:'Corner',skills:['cornering_ruts','cornering_flat','berms'],look:'entry speed and braking, where the rider sits, inside leg, elbows, eyes on the exit, line choice and drive out'},
 {id:'jump',label:'Jump',skills:['jumps','scrubbing'],look:'throttle and body up the face, centered body in the air, bike attitude, landing and drive away'},
 {id:'start',label:'Start',skills:['starts'],look:'body position at the drop, front wheel height, clutch and shift timing, line to the first turn'},
 {id:'whoops',label:'Whoops',skills:['whoops','rhythm'],look:'hips back, knees in, steady throttle, whether the rear tracks across the faces or kicks'},
 {id:'ruts',label:'Ruts',skills:['cornering_ruts'],look:'sitting forward, inside leg, looking through the rut, staying committed and balanced'},
 {id:'sand',label:'Sand',skills:['sand'],look:'gear and momentum, weight back while driving, standing through rough sections, steering with the rear'},
 {id:'hill',label:'Hill',skills:['hills'],look:'momentum from below, weight forward, no chopped throttle, shifting before the hill'},
 {id:'track',label:'Track',skills:[],look:'the track itself: soil, moisture, ruts, bumps, jumps, berms and the lines, and what setup suits it'},
] as const;
export type CoachFocus=typeof COACH_FOCUS[number]['id'];
export const COACH_FOCUS_IDS=COACH_FOCUS.map(f=>f.id) as [CoachFocus,...CoachFocus[]];
export const coachFocus=(id?:string|null)=>COACH_FOCUS.find(f=>f.id===id)??null;

/** Clip frames: more of them when the clip is short and trimmed to the moment, one roughly every 0.45 s, 4 to 12. */
export const CLIP_MAX_FRAMES=12;
export function clipFrameTimes(ms:number):number[]{
 const n=Math.max(4,Math.min(CLIP_MAX_FRAMES,Math.round(ms/450)));
 return Array.from({length:n},(_,i)=>Math.round(ms*(0.03+0.94*i/(n-1))));
}

/** Times BAK names in a coaching answer ("at 2.1 s", "1.4–1.9 s", "2.1s", "2.1 seconds"), for tap-to-see-the-frame. */
export const TIME_MENTION=/(\d{1,2}(?:\.\d{1,2})?)\s?(?:s|sec|secs|seconds)\b/g;
/** The frame closest to a named time, or -1 if no frame is within a second of it. */
export function nearestFrame(frames:readonly number[],t:number){
 let best=-1,gap=Infinity;frames.forEach((f,i)=>{const d=Math.abs(f-t);if(d<gap){gap=d;best=i;}});
 return gap<=1?best:-1;
}

/** What was sent with a chat question besides the photos themselves. Kept on the rider's message. */
export type ChatMedia={kind:'clip';duration:number;frames:number[];focus?:CoachFocus;slowmo?:boolean}|{kind:'photos';focus:CoachFocus};
