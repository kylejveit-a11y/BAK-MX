import {rewardTier} from './plans.ts';
import {isMxProjectUrl} from '../shared/mx-project.ts';
import Stripe from 'stripe';
import {createClient,type SupabaseClient} from '@supabase/supabase-js';
import {hasStoreAccess} from './mobile-billing.ts';
import {stripePlanPrices,creditPacks,grantCredits} from './plans.ts';

const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
function required(name:string):string {const value=process.env[name];if(!value)throw new Error(`${name} is not configured`);return value;}
function admin():SupabaseClient{if(!isMxProjectUrl(process.env.SUPABASE_URL))throw new Error('MX database configuration is invalid');return createClient(required('SUPABASE_URL'),required('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});}
function stripe():Stripe{return new Stripe(required('STRIPE_SECRET_KEY'),{maxNetworkRetries:1,timeout:15_000});}
function appUrl():string {const u=new URL(required('APP_URL'));if(u.protocol!=='https:'&&u.hostname!=='localhost')throw new Error('APP_URL must use HTTPS');return u.origin;}
export function subscriptionEligible(s:{status:string;current_period_end:string|null},now=Date.now()):boolean{return ['active','trialing'].includes(s.status)&&!!s.current_period_end&&Date.parse(s.current_period_end)>now;}
export function subscriptionSnapshot(subscription:Stripe.Subscription,prices:string|Iterable<string>){
  const allowed=new Set(typeof prices==='string'?[prices]:prices);
  const item=subscription.items.data.find(i=>allowed.has(i.price.id));
  return {status:item?subscription.status:'unsupported_price',current_period_end:item?new Date(item.current_period_end*1000).toISOString():null,cancel_at_period_end:subscription.cancel_at_period_end,stripe_subscription_id:subscription.id,price_id:item?.price.id??null};
}
/** Plan prices this deployment sells (STRIPE_PLAN_PRICES, plus STRIPE_PRICE_ID as Pro). */
function planPrices(){const m=stripePlanPrices();if(!m.size)throw new Error('STRIPE_PRICE_ID is not configured');return m;}
async function syncCustomer(customerId:string,eventCreated:number,s:Stripe,db:SupabaseClient){
  const {data:row,error}=await db.from('subscriptions').select('user_id,stripe_customer_id').eq('stripe_customer_id',customerId).maybeSingle();
  if(error)throw error;if(!row)return; // Events for another product never acquire MX authority.
  const list=await s.subscriptions.list({customer:customerId,status:'all',limit:100});
  if(list.has_more)throw new Error('Subscription inventory incomplete');
  const plans=planPrices();
  const matching=list.data.filter(v=>v.items.data.some(i=>plans.has(i.price.id)));
  // With more than one live plan (mid-upgrade), the higher tier is the one that counts.
  const rank=(v:Stripe.Subscription)=>Math.max(...v.items.data.map(i=>plans.get(i.price.id)==='pro'?2:plans.get(i.price.id)==='premium'?1:0));
  const selected=matching.filter(v=>['active','trialing'].includes(v.status)).sort((a,b)=>rank(b)-rank(a))[0]||matching.sort((a,b)=>b.created-a.created)[0];
  const snap=selected?subscriptionSnapshot(selected,plans.keys()):{status:'none',current_period_end:null,cancel_at_period_end:false,stripe_subscription_id:null,price_id:null};
  const {error:syncError}=await db.rpc('sync_subscription_v2',{p_user_id:row.user_id,p_customer_id:customerId,p_subscription_id:snap.stripe_subscription_id,p_status:snap.status,p_period_end:snap.current_period_end,p_cancel:snap.cancel_at_period_end,p_event_created:eventCreated,p_price_id:snap.price_id});
  if(syncError)throw syncError;
}
export async function hasPaidAccess(userId:string):Promise<boolean>{
  if(await hasStoreAccess(userId))return true;
  if(await rewardTier(userId))return true;
  const db=admin();let {data,error}=await db.from('subscriptions').select('*').eq('user_id',userId).maybeSingle();if(error)throw error;
  if(!data)return false;
  // A bounded freshness check prevents an indefinitely stale active entitlement.
  if(data.stripe_customer_id&&Date.now()-Date.parse(data.updated_at)>300_000){await syncCustomer(data.stripe_customer_id,Math.floor(Date.now()/1000),stripe(),db);const latest=await db.from('subscriptions').select('*').eq('user_id',userId).maybeSingle();if(latest.error)throw latest.error;data=latest.data;}
  return !!data&&subscriptionEligible(data);
}
export async function prepareAccountDeletion(userId:string):Promise<void>{
  const db=admin();const {data,error}=await db.from('subscriptions').select('stripe_customer_id').eq('user_id',userId).maybeSingle();if(error)throw error;if(!data?.stripe_customer_id)return;
  const s=stripe();const all=await s.subscriptions.list({customer:data.stripe_customer_id,status:'all',limit:100});
  if(all.has_more)throw new Error('Subscription inventory incomplete');
  // Explicit account deletion cancels web billing immediately; never require waiting for expiry.
  for(const subscription of all.data)if(!['canceled','incomplete_expired'].includes(subscription.status))await s.subscriptions.cancel(subscription.id);
  await s.customers.del(data.stripe_customer_id);
}
/** Grants a paid credit-pack Checkout once (reference = session id). Credits come from the configured price, never from metadata. */
async function grantStripeCredits(session:Stripe.Checkout.Session,db:SupabaseClient){
  const customer=typeof session.customer==='string'?session.customer:session.customer?.id;if(!customer)return;
  const {data:row,error}=await db.from('subscriptions').select('user_id').eq('stripe_customer_id',customer).maybeSingle();if(error)throw error;if(!row)return;
  const items=await stripe().checkout.sessions.listLineItems(session.id,{limit:10});const packs=creditPacks(process.env.STRIPE_CREDIT_PRICES);
  let credits=0,product:string|null=null;for(const i of items.data){const n=i.price?packs.get(i.price.id):undefined;if(n){credits+=n*(i.quantity??1);product=i.price!.id;}}
  if(credits>0)await grantCredits(row.user_id,credits,'stripe:'+session.id,product);
}
async function ensureCustomer(user:{id:string;email?:string},existing:{stripe_customer_id?:string|null}|null,s:Stripe,db:SupabaseClient):Promise<string>{
  if(existing?.stripe_customer_id)return existing.stripe_customer_id;
  const {error:insertError}=await db.from('subscriptions').upsert({user_id:user.id},{onConflict:'user_id',ignoreDuplicates:true});if(insertError)throw insertError;
  const customer=await s.customers.create({email:user.email,metadata:{bakmx_user_id:user.id,product:'bakmx'}},{idempotencyKey:`bakmx-customer-${user.id}`});
  const {error:updateError}=await db.from('subscriptions').update({stripe_customer_id:customer.id}).eq('user_id',user.id);if(updateError)throw updateError;return customer.id;
}
export async function handleBilling(req:Request,user:{id:string;email?:string}|null,_caller:SupabaseClient|null):Promise<Response|null>{
  const path=new URL(req.url).pathname;
  if(!path.startsWith('/api/billing/'))return null;
  try {
    if(path==='/api/billing/price'&&req.method==='GET'){
      const p=await stripe().prices.retrieve(required('STRIPE_PRICE_ID'));
      if(!p.active||!p.recurring||p.unit_amount===null)return json({error:'Membership pricing is not available yet.'},503);
      return json({amount:p.unit_amount/100,currency:p.currency,interval:p.recurring.interval,interval_count:p.recurring.interval_count});
    }
    if(path==='/api/billing/plans'&&req.method==='GET'){
      // Only prices that are configured here AND active in Stripe are offered; nothing is shown that cannot be bought.
      const plans=[] as {tier:string;price_id:string;amount:number;currency:string;interval:string}[],packs=[] as {price_id:string;credits:number;amount:number;currency:string}[];
      const configuredPlans=stripePlanPrices(),configuredPacks=creditPacks(process.env.STRIPE_CREDIT_PRICES);
      // Before web billing is set up there is simply nothing on sale yet; that is not an outage.
      if(!process.env.STRIPE_SECRET_KEY||(!configuredPlans.size&&!configuredPacks.size))return json({plans,packs});
      const s=stripe();
      for(const [id,tier] of configuredPlans){try{const p=await s.prices.retrieve(id);if(p.active&&p.recurring&&p.unit_amount!==null)plans.push({tier,price_id:id,amount:p.unit_amount/100,currency:p.currency,interval:p.recurring.interval});}catch{}}
      for(const [id,credits] of configuredPacks){try{const p=await s.prices.retrieve(id);if(p.active&&!p.recurring&&p.unit_amount!==null)packs.push({price_id:id,credits,amount:p.unit_amount/100,currency:p.currency});}catch{}}
      return json({plans,packs});
    }
    if(path==='/api/billing/webhook'&&req.method==='POST'){
      const s=stripe();const signature=req.headers.get('stripe-signature');if(!signature)return json({error:'Missing signature'},400);
      let event:Stripe.Event;try{event=s.webhooks.constructEvent(await req.text(),signature,required('STRIPE_WEBHOOK_SECRET'));}catch{return json({error:'Invalid signature'},400);}
      if(['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted','checkout.session.completed','invoice.paid','invoice.payment_failed'].includes(event.type)){
        const obj=event.data.object as unknown as {customer?:string|{id:string}};
        const customer=typeof obj.customer==='string'?obj.customer:obj.customer?.id;
        if(customer)await syncCustomer(customer,event.created,s,admin());
      }
      if(event.type==='checkout.session.completed'||event.type==='checkout.session.async_payment_succeeded'){
        const session=event.data.object as Stripe.Checkout.Session;
        if(session.metadata?.product==='bakmx'&&session.metadata?.kind==='credits'&&session.payment_status==='paid')await grantStripeCredits(session,admin());
      }
      // Duplicate deliveries converge on current Stripe state; no customer-supplied payload grants access.
      return json({received:true});
    }
    if(!user)return json({error:'Sign in to manage membership.'},401);
    if(req.method!=='POST')return json({error:'Method not allowed'},405);
    const s=stripe(),db=admin();
    const {data:existing,error:lookupError}=await db.from('subscriptions').select('*').eq('user_id',user.id).maybeSingle();if(lookupError)throw lookupError;
    if(path==='/api/billing/portal'){
      if(!existing?.stripe_customer_id)return json({error:'No billing account exists yet.'},409);
      const portal=await s.billingPortal.sessions.create({customer:existing.stripe_customer_id,return_url:appUrl()+'/account'});return json({url:portal.url});
    }
    const body=await req.json().catch(()=>({})) as {price_id?:unknown};
    if(path==='/api/billing/credits'){
      const packs=creditPacks(process.env.STRIPE_CREDIT_PRICES),priceId=typeof body.price_id==='string'?body.price_id:'';
      if(!packs.has(priceId))return json({error:'That credit pack is not available.'},400);
      const price=await s.prices.retrieve(priceId);if(!price.active||price.recurring||price.unit_amount===null)return json({error:'That credit pack is not available.'},503);
      const customerId=await ensureCustomer(user,existing,s,db);
      const session=await s.checkout.sessions.create({mode:'payment',customer:customerId,line_items:[{price:priceId,quantity:1}],client_reference_id:user.id,metadata:{product:'bakmx',kind:'credits',user_id:user.id},success_url:appUrl()+'/account?credits=success',cancel_url:appUrl()+'/account?credits=canceled'});
      return json({url:session.url});
    }
    if(path==='/api/billing/checkout'){
      const plans=planPrices(),requested=typeof body.price_id==='string'?body.price_id:process.env.STRIPE_PRICE_ID||[...plans.keys()][0];
      if(!plans.has(requested))return json({error:'That plan is not available.'},400);
      const price=await s.prices.retrieve(requested);if(!price.active||!price.recurring||price.unit_amount===null)return json({error:'Membership pricing is not available yet.'},503);
      const customerId=await ensureCustomer(user,existing,s,db);
      const subscriptions=await s.subscriptions.list({customer:customerId,status:'all',limit:100});
      if(subscriptions.has_more||subscriptions.data.some(v=>!['canceled','incomplete_expired'].includes(v.status)))return json({error:'A membership already exists. Use Manage billing.'},409);
      // Reuse an open session to prevent accidental parallel subscriptions.
      const open=await s.checkout.sessions.list({customer:customerId,status:'open',limit:10});
      const own=open.data.find(v=>v.metadata?.product==='bakmx'&&v.metadata?.kind!=='credits'&&v.metadata?.price_id===price.id);if(own?.url)return json({url:own.url});
      const session=await s.checkout.sessions.create({mode:'subscription',customer:customerId,line_items:[{price:price.id,quantity:1}],client_reference_id:user.id,metadata:{product:'bakmx',user_id:user.id,price_id:price.id},subscription_data:{metadata:{product:'bakmx',user_id:user.id}},success_url:appUrl()+'/account?checkout=success',cancel_url:appUrl()+'/account?checkout=canceled'}, {idempotencyKey:`bakmx-checkout-${user.id}-${price.id}-${Math.floor(Date.now()/3600000)}`});
      return json({url:session.url});
    }
    return json({error:'Not found'},404);
  }catch{return json({error:'Billing is temporarily unavailable. No access change has been assumed.'},503);}
}
