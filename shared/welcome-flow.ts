/** First-login setup, shared rules (pure, tested). The screens are apps/mobile/src/Welcome.tsx.
 *  hello -> bike -> you -> answers -> look -> done. "you" (weight, level, riding) is only asked once there is a bike to put
 *  it on; a rider who is still shopping goes from the bike step straight to how BAK should answer. */
export type WelcomeStep='hello'|'bike'|'you'|'answers'|'look'|'done';
export const WELCOME_STEPS:WelcomeStep[]=['hello','bike','you','answers','look','done'];
export const welcomeSteps=(s:{hasBike:boolean}):WelcomeStep[]=>WELCOME_STEPS.filter(x=>x!=='you'||s.hasBike);
/** Shown once, and only to an account that has no bike yet: a rider who already uses the app never gets it after an update.
 *  Waits for the Garage to load so a slow connection cannot show setup to someone who has bikes. */
export function shouldShowWelcome(s:{done:boolean;bikesLoaded:boolean;bikeCount:number;started:boolean}){
 if(s.done)return false;
 if(s.started)return true; // once it is open it stays open while the rider adds the bike inside it
 return s.bikesLoaded&&s.bikeCount===0;
}
