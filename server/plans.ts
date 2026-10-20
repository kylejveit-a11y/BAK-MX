import {isMxProjectUrl} from '../shared/mx-project.ts';
import {createClient,type SupabaseClient} from '@supabase/supabase-js';
import {bestTier,effectiveDailyLimit,pairList,trialConfig,TIERS,type Tier,type Usage} from '../shared/plans.ts';
type Mode='beta'|'subscription';

function admin():SupabaseClient{if(!isMxProjectUrl(process.env.SUPABASE_URL)||!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)throw new Error('Database not configured');return createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});}
const list=(raw:string|undefined)=>(raw||'').split(',').map(x=>x.trim()).filter(Boolean);
const isTier=(x:string):x is Tier=>(TIERS as string[]).includes(x);

/** Stripe plan prices: STRIPE_PLAN_PRICES="premium:price_a,premium:price_a_yearly,pro:price_b". STRIPE_PRICE_ID (the original single membership) counts as Pro. */
export function stripePlanPrices(env=process.env):Map<string,Tier>{
 const m=new Map<string,Tier>();for(const [tier,price] of pairList(env.STRIPE_PLAN_PRICES))if(isTier(tier)&&tier!=='free')m.set(price,tier);
 if(env.STRIPE_PRICE_ID&&!m.has(env.STRIPE_PRICE_ID))m.set(env.STRIPE_PRICE_ID,'pro');return m;
}
/** Store subscription products by tier. MOBILE_PRODUCT_IDS (the original list) counts as Pro. */
export function storeProducts(env=process.env):{premium:string[];pro:string[]}{
 return {premium:list(env.MOBILE_PREMIUM_PRODUCT_IDS),pro:[...new Set([...list(env.MOBILE_PRO_PRODUCT_IDS),...list(env.MOBILE_PRODUCT_IDS)])]};
}
export function storeTier(product:string|null|undefined,env=process.env):Tier|null{
 if(!product)return null;const p=storeProducts(env);return p.pro.includes(product)?'pro':p.premium.includes(product)?'premium':null;
}
/** Credit packs: "<product or price id>:<credits>". */
export function creditPacks(raw:string|undefined):Map<string,number>{
 const m=new Map<string,number>();for(const [id,n] of pairList(raw)){const v=Number(n);if(Number.isInteger(v)&&v>0&&v<=10000)m.set(id,v);}return m;
}

const live=(status:string|null|undefined,end:string|null|undefined)=>['active','trialing'].includes(status||'')&&!!end&&Date.parse(end)>Date.now();
/** Reads tier from stored subscription rows. Callers that need freshness run the provider sync first (hasPaidAccess does). */
export async function resolveTier(userId:string,db=admin()):Promise<Tier>{
 const [web,store]=await Promise.all([db.from('subscriptions').select('status,current_period_end,price_id').eq('user_id',userId).maybeSingle(),db.from('mobile_entitlements').select('status,current_period_end,product_identifier,is_sandbox').eq('user_id',userId).maybeSingle()]);
 if(web.error)throw web.error;if(store.error)throw store.error;
 const sandboxOk=process.env.ALLOW_SANDBOX_PURCHASES==='true'&&process.env.APP_ENV!=='production';
 const s=store.data,w=web.data;
 const storeT=s&&live(s.status,s.current_period_end)&&(!s.is_sandbox||sandboxOk)?storeTier(s.product_identifier):null;
 // A web row from before plan tiers has no price id; it was the single (Pro) membership.
 const webT=w&&live(w.status,w.current_period_end)?(w.price_id?stripePlanPrices().get(w.price_id)??null:'pro'):null;
 return bestTier(storeT,webT);
}
/** Free riders: the first trial set is ready as soon as they use Ask BAK or open their plan. Safe to call repeatedly. */
export async function ensureTrial(userId:string,tier:Tier,db=admin()):Promise<void>{
 if(tier!=='free')return;const {blocks,size}=trialConfig(process.env);if(!blocks)return;
 const started=await db.rpc('trial_blocks_started',{p_user_id:userId});if(started.error)throw started.error;
 if(Number(started.data)>0)return;const r=await db.rpc('start_trial_block',{p_user_id:userId,p_blocks:blocks,p_size:size});if(r.error)throw r.error;
}
/** Rider-initiated: start the next free set. Returns the set number, 0 when none are left, -1 when the current set still has questions. */
export async function startNextTrialSet(userId:string):Promise<number>{
 const {blocks,size}=trialConfig(process.env);const r=await admin().rpc('start_trial_block',{p_user_id:userId,p_blocks:blocks,p_size:size});if(r.error)throw r.error;return Number(r.data);
}
export async function usageFor(userId:string,tier:Tier,mode:Mode,db=admin()):Promise<Usage>{
 const start=new Date();start.setUTCHours(0,0,0,0);
 const [used,credits,started]=await Promise.all([db.from('ai_usage').select('request_id',{count:'exact',head:true}).eq('user_id',userId).eq('funded_by','included').gte('created_at',start.toISOString()),db.rpc('ai_credit_balance',{p_user_id:userId}),db.rpc('trial_blocks_started',{p_user_id:userId})]);
 if(used.error)throw used.error;if(credits.error)throw credits.error;if(started.error)throw started.error;
 const limit=effectiveDailyLimit(tier,mode,process.env),usedToday=used.count??0,{blocks,size}=trialConfig(process.env),n=Number(started.data)||0;
 return {tier,daily_limit:limit,unlimited:tier==='pro',used_today:usedToday,remaining_today:Math.max(0,limit-usedToday),credits:Number(credits.data)||0,
  trial:tier==='free'&&blocks>0?{blocks,size,started:n,remaining_sets:Math.max(0,blocks-n)}:null};
}
export type Reservation='included'|'credit'|'limit'|'duplicate';
export async function reserveQuestion(userId:string,requestId:string,tier:Tier,mode:Mode):Promise<Reservation>{
 const {data,error}=await admin().rpc('reserve_ai_request_v2',{p_user_id:userId,p_request_id:requestId,p_daily_limit:effectiveDailyLimit(tier,mode,process.env)});if(error)throw error;
 if(!['included','credit','limit','duplicate'].includes(data))throw new Error('Unexpected quota result');return data as Reservation;
}
/** Idempotent on reference; returns true when newly granted. */
export async function grantCredits(userId:string,credits:number,reference:string,product:string|null,reason:'purchase'|'grant'='purchase'):Promise<boolean>{
 const {data,error}=await admin().rpc('grant_ai_credits',{p_user_id:userId,p_credits:credits,p_reference:reference,p_reason:reason,p_product:product});if(error)throw error;return data===true;
}
