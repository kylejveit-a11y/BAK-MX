// Starter prompts on the empty Chat screen: real complaints in rider language. Tapping one puts `draft` in the message
// box for the rider to finish; nothing is sent. Pure, so it is tested without the app.
import {fuelSystem} from '../../../shared/fuel-system.ts';
/** The headline on the empty Chat screen. Change the words here; the screen sizes itself to fit. */
export const CHAT_HERO_PHRASE='Dial it in.';
export type ChatStarter={label:string;draft:string};
const PUSH:ChatStarter={label:'Front end pushes in corners',draft:'Front end pushes in corners. '};
const KICK:ChatStarter={label:'Rear kicks on braking bumps',draft:'Rear kicks on braking bumps. '};
const SAG:ChatStarter={label:'Set my sag and clickers',draft:'Help me set my sag and clickers. '};
const RACE:ChatStarter={label:'Race this weekend. What do I check?',draft:'Race this weekend. What should I check? '};
const JET:ChatStarter={label:'Jetting for today’s weather',draft:'Help me with jetting for today’s weather. '};
/** Four starters. A bike on file as carbureted (the two-strokes that still run a carb) gets a jetting prompt. */
export function chatStarters(bike:{manufacturer:string;model:string;model_year:number}):ChatStarter[]{
 const carb=fuelSystem(bike.manufacturer,bike.model,bike.model_year)==='carburetor';
 return [PUSH,carb?JET:KICK,SAG,RACE];
}
/** The draft after a starter is tapped: an empty box or another starter is replaced; the rider's own words are kept. */
export function applyStarter(draft:string,starter:ChatStarter):string{
 const now=draft.trim();
 if(!now||[PUSH,KICK,SAG,RACE,JET].some(s=>s.draft.trim()===now))return starter.draft;
 return `${draft.trimEnd()} ${starter.draft}`;
}
