// The Pro conversion flow (Kyle, 2026-11-11): the words and decisions behind the BAK Pro screen, the limit card in chat,
// the quiet nudges and the Account plan row. Everything here is derived from shared/plans.ts and shared/photo-edit.ts,
// so the screen can never promise a feature the plans do not gate. Prices are never written here: the store (RevenueCat
// on the phone, Stripe on the web) is the only source of a price.
import {TIER_LABEL,TRIAL_BLOCKS,TRIAL_BLOCK_SIZE,DEFAULT_DAILY,canCoachClips,canStartTrialSet,type Tier,type Usage} from './plans.ts';
import {editAllowance} from './photo-edit.ts';

export type UsageView=Usage&{access_mode:'beta'|'subscription'};

export const PRO_HEADLINE='Unlimited answers. Every moto.';
export const PRO_SUBHEAD='Ask BAK as much as you tune. Pro is for racers, mechanics and shops who want the answer now, not after midnight.';
export const PRO_EYEBROW='BAK PRO';
/** Shown while the store is in beta (access_mode 'beta'); the plan card already uses these exact words. */
export const LAUNCH_OFFER='LAUNCH OFFER';

export type ValueRow={icon:'chat'|'video'|'image';title:string;detail:string};
/** The three things Pro adds. Each is gated in code: unlimited questions (plans.ts unlimited), clip coaching
 *  (canCoachClips), and the Pro photo-edit allowance (photo-edit.ts). Nothing else in the app is Pro-only. */
export function proValueRows(env:Record<string,string|undefined>={}):ValueRow[]{
 const edits=editAllowance('pro',env);
 return [
  {icon:'chat',title:'Unlimited Ask BAK questions',detail:'Setup, jetting, diagnosis, race-day calls, as many as you need. Fair use only stops abuse; it never stops a rider tuning hard.'},
  {icon:'video',title:'Coaching from your riding clips',detail:'Send a short clip of a corner, jump or section. BAK comes back with the one fix and a drill, and every session is saved so you can send a new clip to check it stuck.'},
  {icon:'image',title:`${edits.included} Action photo edits a month`,detail:'Your own shots graded like a magazine cover: light, colour, contrast and sharpness only. You, your bike and your numbers stay exactly as shot.'}];
}

export type ComparisonRow={feature:string;free:string;premium:string;pro:string};
const yes='Included',no='—';
const editsText=(t:Tier,env:Record<string,string|undefined>)=>{const a=editAllowance(t,env);return a.period==='lifetime'?`${a.included} to try`:`${a.included} a month`;};
/** Free / Premium / Pro side by side, every cell read from the plan code. */
export function planComparison(env:Record<string,string|undefined>={}):ComparisonRow[]{
 return [
  {feature:'Ask BAK questions',free:`${TRIAL_BLOCKS} sets of ${TRIAL_BLOCK_SIZE} to start`,premium:`${DEFAULT_DAILY.premium} a day`,pro:'Unlimited, fair use'},
  {feature:'Coaching from riding clips',free:canCoachClips('free')?yes:no,premium:canCoachClips('premium')?yes:no,pro:canCoachClips('pro')?yes:no},
  {feature:'Coaching from photos',free:yes,premium:yes,pro:yes},
  {feature:'Action photo edits',free:editsText('free',env),premium:editsText('premium',env),pro:editsText('pro',env)},
  {feature:'Garage, specs, setup and service logs',free:yes,premium:yes,pro:yes},
  {feature:'Tuning notes and saved chats',free:yes,premium:yes,pro:yes},
  {feature:'Community, events, messages',free:yes,premium:yes,pro:yes}];
}

/** The Premium line under its (secondary) button. */
export const PREMIUM_LINE=`${DEFAULT_DAILY.premium} Ask BAK questions a day for riders who tune every weekend. Clip coaching stays with Pro.`;

/** The subscription disclosure near the buttons (Apple 3.1.2). The price and period come from the store product, never from here. */
export const RENEWAL_DISCLOSURE='Payment is charged to your App Store account when you confirm the purchase. The subscription renews automatically at the price and period shown unless you cancel at least 24 hours before the current period ends. Manage or cancel any time in your App Store subscriptions.';
export const TERMS_URL='https://bakmx.com/terms',PRIVACY_URL='https://bakmx.com/privacy';
/** When the store offers could not load: no number is ever made up. */
export const PRICE_IN_STORE='Price shown in the App Store';

const short=(d:Date)=>d.toLocaleDateString(undefined,{month:'short',day:'numeric'});
/** The Account › Ask BAK plan row in one line. `renewsAt` is the store's expiry date when the phone knows it. */
export function usageSummary(u:UsageView|null,renewsAt?:string|null):string{
 if(!u)return 'Your questions today, plans and credit packs';
 const label=TIER_LABEL[u.tier];
 if(u.tier==='pro')return u.access_mode==='beta'?`${label} · Launch offer`:`${label} · Unlimited questions`;
 if(u.tier==='premium'){const when=renewsAt&&Number.isFinite(Date.parse(renewsAt))?`renews ${short(new Date(renewsAt))}`:`${Math.max(0,u.remaining_today)} of ${u.daily_limit} left today`;return `${label} · ${when}`;}
 if(u.access_mode==='beta')return `${label} · Launch offer · ${Math.max(0,u.remaining_today)} of ${u.daily_limit} left today`;
 if(!u.trial)return `${label} · ${u.credits} question${u.credits===1?'':'s'} left`;
 const left=u.trial.started>0?u.trial.remaining_sets:u.trial.blocks;
 const sets=`${left} of ${u.trial.blocks} set${u.trial.blocks===1?'':'s'} left`;
 if(u.trial.started>0&&u.credits>0)return `${label} · ${u.credits} question${u.credits===1?'':'s'} in this set · ${sets}`;
 return `${label} · ${sets}`;
}

/** Midnight UTC, when daily allowances reset, said in the rider's own time: "Resets at 7:00 PM your time". */
export function nextResetLabel(now=new Date()):string{
 const reset=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()+1));
 let time:string;try{time=reset.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});}catch{time='midnight UTC';}
 return `Resets at ${time} your time (midnight UTC)`;
}

export type LimitCard={kind:'free_set_done'|'free_exhausted'|'premium_daily'|'pro_fair_use';title:string;body:string;
 /** `next_set`: Start next free set. `pro`: See BAK Pro. `pack`: Buy a question pack (only drawn when the store has packs). */
 actions:('next_set'|'pro'|'pack')[];reset?:string};
/** What the chat shows where the answer would be when a question cannot run. Null when the allowance is not the reason
 *  (an ordinary error keeps the ordinary notice). `blocked` is whether the server refused the question for its allowance. */
/** The pack sentence in a limit card's body; `withoutPacks` removes it when the store has no pack to buy. */
export const PACK_SENTENCE=', or add a question pack and keep going now.';
export function withoutPacks(body:string):string{return body.endsWith(PACK_SENTENCE)?body.slice(0,-PACK_SENTENCE.length)+'.':body;}
export function limitCard(u:UsageView|null,blocked:boolean,now=new Date()):LimitCard|null{
 if(!blocked||!u)return null;
 const pack=PACK_SENTENCE;
 // Something else was refused (a duplicate send, a re-run): the ordinary notice says so; this card is only for a used-up allowance.
 if(u.remaining_today>0||u.credits>0)return null;
 if(u.unlimited)return {kind:'pro_fair_use',title:"You've reached today's fair-use limit",body:'That is a lot of tuning. Your questions are back after midnight UTC.',actions:[],reset:nextResetLabel(now)};
 if(u.tier==='premium')return {kind:'premium_daily',title:"You've used today's Premium questions",body:`All ${u.daily_limit} of today's questions are gone. Pro has no daily count${pack}`,actions:['pro','pack'],reset:nextResetLabel(now)};
 if(canStartTrialSet(u)){const left=u.trial!.remaining_sets;return {kind:'free_set_done',title:"You've used this set of free questions",body:`${left} free set${left===1?'':'s'} of ${u.trial!.size} left. Start the next one when you're ready, or go Pro and stop counting.`,actions:['next_set','pro']};}
 if(u.access_mode==='beta'&&u.remaining_today<1&&u.credits<1&&(!u.trial||u.trial.remaining_sets<1))return {kind:'free_exhausted',title:"You've used today's questions",body:`The launch offer gives every rider a daily set. Pro has no daily count${pack}`,actions:['pro','pack'],reset:nextResetLabel(now)};
 return {kind:'free_exhausted',title:"You've used your free questions",body:`All ${u.trial?.blocks??TRIAL_BLOCKS} free sets are done. Pro gives you unlimited questions and clip coaching${pack}`,actions:['pro','pack']};
}

/** The status the server answers with when a question cannot run for its allowance (server/app.ts, /api/chat). */
export const isLimitStatus=(status:number|undefined)=>status===429;
/** The same moment on the web, which only has the message text: the words limitMessage() in plans.ts uses. */
export const isLimitMessage=(text:string)=>/you've used (this set|all your free|today's)|fair-use limit/i.test(text);

/** The quiet line under the composer, or null for nothing. Shown dismissibly, never over an answer. */
export function composerNudge(u:UsageView|null):{key:string;text:string;action:'pro'|'next_set'}|null{
 if(!u||u.tier!=='free'||u.access_mode==='beta'||!u.trial||u.trial.started<1)return null;
 // The set just finished (nothing left to spend) and another is waiting: say so after the answer, not during it.
 if(canStartTrialSet(u))return {key:`set-done-${u.trial.started}`,text:`That set is used up. ${u.trial.remaining_sets} free set${u.trial.remaining_sets===1?'':'s'} left, or Pro is unlimited.`,action:'next_set'};
 if(u.trial.remaining_sets===0&&u.credits>0)return {key:'last-set',text:'Last free set. Pro is unlimited.',action:'pro'};
 return null;
}
