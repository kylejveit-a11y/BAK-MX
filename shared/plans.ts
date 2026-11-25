// Ask BAK plans (Kyle, 2026-10-16).
// Free: a one-time trial of 7 sets of 20 questions. The first set is ready on day one; when a set is used up the rider starts
// the next whenever they choose (we suggest spacing them across a week). After the 7th set: credit packs or a plan.
// Premium: 100 a day. Pro: unlimited with fair use; the ceiling only stops abuse and is never shown as a number to plan around.
// Daily allowances reset at midnight UTC. Credits are bought in packs, never expire, and are spent only after the day's
// included questions. While AI_ACCESS_MODE is 'beta', every account also gets the beta daily allowance (AI_MAX_DAILY_REQUESTS).
export type Tier='free'|'premium'|'pro';
export const TIERS:Tier[]=['free','premium','pro'];
export const DEFAULT_DAILY:Record<Tier,number>={free:0,premium:100,pro:300};
export const TRIAL_BLOCKS=7,TRIAL_BLOCK_SIZE=20,BETA_DAILY=40;
export const TIER_LABEL:Record<Tier,string>={free:'Free',premium:'Premium',pro:'Pro'};
const VOICE_MINUTES_PREMIUM=15,VOICE_MINUTES_PRO=60,CLIPS_PREMIUM=3;
export const TIER_BLURB:Record<Tier,string>={
 free:`${TRIAL_BLOCKS} sets of ${TRIAL_BLOCK_SIZE} Ask BAK questions to start, plus your Garage, setup log and community.`,
 premium:`100 Ask BAK questions a day for riders who tune every weekend, with ${VOICE_MINUTES_PREMIUM} minutes of Talk to BAK and ${CLIPS_PREMIUM} riding clips a month.`,
 pro:`Unlimited Ask BAK questions (fair use), ${VOICE_MINUTES_PRO} minutes of Talk to BAK a month and coaching from riding clips, for racers, mechanics and shops.`};
/** Coaching from a riding clip (video frames). Kyle, 2026-11-25: everything in Pro is also in Premium, with a smaller allowance,
 *  so Premium is a preview of what Pro gives more of. Clips a month: null is no monthly limit (fair use). Photos stay on every plan. */
export const CLIPS_MONTHLY:Record<Tier,number|null>={free:0,premium:CLIPS_PREMIUM,pro:null};
export const canCoachClips=(t:Tier)=>CLIPS_MONTHLY[t]!==0;
export const CLIP_PRO_NOTE=`Coaching from a riding clip comes with Premium (${CLIPS_MONTHLY.premium} clips a month) and Pro. Photos of you riding still work on every plan, or upgrade in Account › Ask BAK plan.`;
export const CLIP_USED_NOTE=`You’ve used this month’s ${CLIPS_MONTHLY.premium} riding clips. Pro has no monthly limit; photos of you riding still work, and clips reset on the 1st.`;
/** Talk to BAK minutes a month. */
export const VOICE_MINUTES:Record<Tier,number>={free:0,premium:VOICE_MINUTES_PREMIUM,pro:VOICE_MINUTES_PRO};
export const tierRank=(t:Tier)=>TIERS.indexOf(t);
export const bestTier=(...t:(Tier|null|undefined)[]):Tier=>t.filter((x):x is Tier=>!!x).sort((a,b)=>tierRank(b)-tierRank(a))[0]??'free';
export function dailyLimit(tier:Tier,env:Record<string,string|undefined>={}):number{
 const raw=env[`AI_DAILY_${tier.toUpperCase()}`];const n=raw===undefined||raw===''?DEFAULT_DAILY[tier]:Number(raw);
 if(!Number.isInteger(n)||n<0||n>5000)throw new Error('Invalid AI daily limit');return n;
}
/** Parses "key:value,key:value" env lists, e.g. STRIPE_PLAN_PRICES="premium:price_a,pro:price_b". */
export function pairList(raw:string|undefined):[string,string][]{
 return (raw||'').split(',').map(x=>x.trim()).filter(Boolean).map(x=>{const i=x.lastIndexOf(':');return (i>0?[x.slice(0,i).trim(),x.slice(i+1).trim()]:['','']) as [string,string];}).filter(([a,b])=>a&&b);
}
export function envInt(env:Record<string,string|undefined>,name:string,fallback:number,max:number):number{
 const raw=env[name];const n=raw===undefined||raw===''?fallback:Number(raw);if(!Number.isInteger(n)||n<0||n>max)throw new Error(`Invalid ${name}`);return n;
}
export const trialConfig=(env:Record<string,string|undefined>={})=>({blocks:envInt(env,'AI_TRIAL_BLOCKS',TRIAL_BLOCKS,30),size:envInt(env,'AI_TRIAL_BLOCK_SIZE',TRIAL_BLOCK_SIZE,500)});
/** The allowance actually applied today: the plan's, raised to the beta allowance while the app is in beta. */
export function effectiveDailyLimit(tier:Tier,mode:'beta'|'subscription',env:Record<string,string|undefined>={}):number{
 const plan=dailyLimit(tier,env);return mode==='beta'?Math.max(plan,envInt(env,'AI_MAX_DAILY_REQUESTS',BETA_DAILY,1000)):plan;
}
export type Trial={blocks:number;size:number;started:number;remaining_sets:number};
export type Usage={tier:Tier;daily_limit:number;unlimited:boolean;used_today:number;remaining_today:number;credits:number;trial:Trial|null};
/** Whether the rider can start another free set right now (current set used up, sets left). */
export const canStartTrialSet=(u:Pick<Usage,'credits'|'trial'|'remaining_today'>)=>!!u.trial&&u.trial.remaining_sets>0&&u.trial.started>0&&u.credits<1&&u.remaining_today<1;
/** What the rider is told when a question cannot run. */
export function limitMessage(u:Pick<Usage,'tier'|'unlimited'>&{trial?:Trial|null}):string{
 if(u.unlimited)return "You've reached today's fair-use limit. Your questions reset at midnight UTC.";
 if(u.tier==='free'){
  const left=u.trial?.remaining_sets??0;
  if(left>0)return `You've used this set of free questions. You have ${left} free set${left===1?'':'s'} left: start the next one when you're ready (we suggest spacing them across the week), or add a credit pack.`;
  return "You've used all your free questions. Add a credit pack or choose Premium or Pro to keep asking BAK.";
 }
 const up=u.tier==='premium'?'Upgrade to Pro or add a credit pack':'Add a credit pack';
 return `You've used today's Ask BAK questions. ${up} to keep going, or come back after midnight UTC.`;
}
