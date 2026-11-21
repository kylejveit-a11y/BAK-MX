/** First-login setup, shared rules (pure, tested). The screens are apps/mobile/src/Welcome.tsx.
 *  hello -> bike -> you -> answers -> look -> home -> alerts -> done. "you" (weight, level, riding) is only asked once there is a bike to put
 *  it on; a rider who is still shopping goes from the bike step straight to how BAK should answer. */
export type WelcomeStep='hello'|'bike'|'you'|'answers'|'look'|'home'|'alerts'|'done';
export const WELCOME_STEPS:WelcomeStep[]=['hello','bike','you','answers','look','home','alerts','done'];
export const welcomeSteps=(s:{hasBike:boolean}):WelcomeStep[]=>WELCOME_STEPS.filter(x=>x!=='you'||s.hasBike);
/** Shown once, and only to an account that has no bike yet: a rider who already uses the app never gets it after an update.
 *  Waits for the Garage to load so a slow connection cannot show setup to someone who has bikes. */
export function shouldShowWelcome(s:{done:boolean;bikesLoaded:boolean;bikeCount:number;started:boolean}){
 if(s.done)return false;
 if(s.started)return true; // once it is open it stays open while the rider adds the bike inside it
 return s.bikesLoaded&&s.bikeCount===0;
}
/** The Home step's two plain questions, turned into the Home blocks they switch on. Blocks the rider was not asked about keep
 *  whatever they were. */
export function homeLayoutFromAnswers<T extends {id:string;on:boolean}>(layout:T[],a:{races:boolean|null;coaching:boolean|null}):T[]{
 return layout.map(b=>b.id==='prep'&&a.races!==null?{...b,on:a.races}:b.id==='coaching'&&a.coaching!==null?{...b,on:a.coaching}:b);
}
