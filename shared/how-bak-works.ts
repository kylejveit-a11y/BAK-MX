// "How BAK works": the short rider's guide to the app. Shown under Account on the phone and the website, and handed to Ask BAK
// when a rider asks how to do something in the app, so the two never say different things. Plain words, no marketing: a rider
// should skim the whole page in about a minute. Plan names come from shared/plans.ts; prices are never written here.
import {TIER_LABEL,TRIAL_BLOCKS,TRIAL_BLOCK_SIZE} from './plans.ts';
import {appGuideTextFor,isAppQuestion} from './app-guide.ts';

export type HowSection={id:string;title:string;lines:string[]};

export const HOW_BAK_WORKS:HowSection[]=[
 {id:'ask',title:'Ask BAK',lines:[
  'Describe what the bike is doing the way you’d tell a buddy: “front pushes in flat turns”, “bogs off the bottom”.',
  'Add a photo any time with the camera button. Pick the bike at the top if you have more than one.',
  'Race mode comes on by itself on race day: short answers, one change at a time. Tap “Something’s wrong?” on Home for a fault.']},
 {id:'garage',title:'Garage',lines:[
  'Your bikes, your weight and level, and where your clickers and sag are now.',
  'The build sheet is what’s stock and what’s changed. The more of it you fill in, the more exact BAK’s answers get for your bike.']},
 {id:'setup',title:'Setup log and tuning notes',lines:[
  'Log what you changed and how it rode. BAK reads the log, so it knows what you already tried.',
  'Tuning notes are the short things you want to keep: save one under an answer, or write one in the Garage.']},
 {id:'workshop',title:'Workshop',lines:[
  'Guided jobs step by step for your exact bike, with the torque figures on the step.',
  'Hands-free: turn on voice and say “next”, “back” or ask a question while you work.']},
 {id:'specs',title:'Specs and parts',lines:[
  'Your bike’s published figures: clickers, sag, fluids, torques, gearing, and the parts that fit it.',
  'Every figure says where it came from.']},
 {id:'service',title:'Service log',lines:[
  'Log your last oil change, filter or top end with the hours on the bike.',
  'BAK tracks what’s next from the maker’s intervals. A job you’ve never logged is never called due.']},
 {id:'race',title:'Race day, practice day and race prep',lines:[
  'Set a race from Home and it counts down with your prep list. BAK works out a starting setup for the track and the forecast.',
  'On the day, Home becomes your track screen: next moto, quick ask, a fast change log. Practice day does the same for a day of laps.']},
 {id:'fuel',title:'Fuel plan',lines:[
  'What to eat and drink, and when. Enter your weight, height and age once and BAK lays out the day before, race morning, between motos and after, timed to your gate drops.',
  'Nervous stomach on race day? Turn that on and the plan goes easier. Parents can set one up for a child rider. It shows on Home on race day and practice day.']},
 {id:'community',title:'Community and Events',lines:[
  'Community is riders’ builds, setup questions and ride plans. Events are ride days and races near you; say you’re going and they show on Home.']},
 {id:'messages',title:'Messages',lines:[
  'Message a rider from their post or an event. New messages show on Home.']},
 {id:'widgets',title:'Widgets and Siri',lines:[
  'The Home Screen widget shows hours, next service and your last setup change. The Lock Screen counts down to your next moto and keeps your workshop step up.',
  'Say “Hey Siri, ask BAK” and ask the question. iPhone only.']},
 {id:'notifications',title:'Notifications',lines:[
  'Messages, comments, event reminders and service due. Turn each one on or off in Account.']},
 {id:'plans',title:'Plans',lines:[
  `${TIER_LABEL.free}: ${TRIAL_BLOCKS} sets of ${TRIAL_BLOCK_SIZE} Ask BAK questions to start, plus the Garage, the logs, race day, the community and events.`,
  `${TIER_LABEL.premium} adds a daily allowance of questions. ${TIER_LABEL.pro} adds unlimited questions (fair use) and coaching from riding clips. Plans are in Account; nothing is charged unless you choose one.`]},
];

export const HOW_BAK_WORKS_CLOSING='Ask BAK how to do anything in the app and it will tell you.';

/** The whole guide as plain text, one block per section, for Ask BAK's input. */
export function howBakWorksText():string{
 return HOW_BAK_WORKS.map(s=>`${s.title}: ${s.lines.join(' ')}`).join('\n')+'\n'+HOW_BAK_WORKS_CLOSING;
}

/** A question about using the app itself ("how do I add a bike", "what does reduce motion do", "where is the service log"),
 *  not about the bike. The gate lives with the full guide so the two never disagree. */
export function isAppHowTo(message:string):boolean{return isAppQuestion(message);}

/** The app guide for Ask BAK's input, only for a question about the app: the short overview plus the matching sections of
 *  the full guide (or its index when no screen matches). Data for the model, never rider-facing copy. */
export function appHelpKnowledge(message:string):{rules:string;overview:string;guide:string}|null{
 const guide=appGuideTextFor(message);if(guide===null)return null;
 return {rules:'The rider is asking about the BAK MX app itself: a screen, a card, a button or a setting. Answer from the guide below, exactly and step by step, using the labels as they appear on screen (tap Account → Preferences → Answer length → Quick). Say what the thing is for, how to work it, and for a setting what each option does. If a section is marked [BAK can change this for the rider] or a setting [BAK can switch this], offer it: end with "Want me to switch it?" and, if the rider already asked for the change, return the matching app action. Otherwise say exactly where to tap; never claim you changed it. Never guess at a screen, setting or option that is not in the guide: say it is not a setting in the app and suggest Account → Feedback. Figures the app shows (specs, intervals) are the maker\'s published values. Tuning and safety rules still apply to any bike question in the same message.',overview:howBakWorksText(),guide};
}
