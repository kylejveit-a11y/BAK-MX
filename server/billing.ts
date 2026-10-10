import {isMxProjectUrl} from '../shared/mx-project.ts';
import Stripe from 'stripe';
import {createClient,type SupabaseClient} from '@supabase/supabase-js';
import {hasStoreAccess} from './mobile-billing.ts';

const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
function required(name:string):string {const value=process.env[name];if(!value)throw new Error(`${name} is not configured`);return value;}
function admin():SupabaseClient{if(!isMxProjectUrl(process.env.SUPABASE_URL))throw new Error('MX database configuration is invalid');return createClient(required('SUPABASE_URL'),required('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});}
function stripe():Stripe{return new Stripe(required('STRIPE_SECRET_KEY'),{maxNetworkRetries:1,timeout:15_000});}
function appUrl():string {const u=new URL(required('APP_URL'));if(u.protocol!=='https:'&&u.hostname!=='localhost')throw new Error('APP_URL must use HTTPS');return u.origin;}
export function subscriptionEligible(s:{status:string;current_period_end:string|null},now=Date.now()):boolean{return ['active','trialing'].includes(s.status)&&!!s.current_period_end&&Date.parse(s.current_period_end)>now;}
export function subscriptionSnapshot(subscription:Stripe.Subscription,priceId:string){
  const item=subscription.items.data.find(i=>i.price.id===priceId);
  return {status:item?subscription.status:'unsupported_price',current_period_end:item?new Date(item.current_period_end*1000).toISOString():null,cancel_at_period_end:subscription.cancel_at_period_end,stripe_subscription_id:subscription.id};
}
async function syncCustomer(customerId:string,eventCreated:number,s:Stripe,db:SupabaseClient){
  const {data:row,error}=await db.from('subscriptions').select('user_id,stripe_customer_id').eq('stripe_customer_id',customerId).maybeSingle();
  if(error)throw error;if(!row)return; // Events for another product never acquire MX authority.
  const list=await s.subscriptions.list({customer:customerId,status:'all',limit:100});
  if(list.has_more)throw new Error('Subscription inventory incomplete');
  const priceId=required('STRIPE_PRICE_ID');
  const matching=list.data.filter(v=>v.items.data.some(i=>i.price.id===priceId));
  const selected=matching.find(v=>['active','trialing'].includes(v.status))||matching.sort((a,b)=>b.created-a.created)[0];
  const snap=selected?subscriptionSnapshot(selected,priceId):{status:'none',current_period_end:null,cancel_at_period_end:false,stripe_subscription_id:null};
  const {error:syncError}=await db.rpc('sync_subscription',{p_user_id:row.user_id,p_customer_id:customerId,p_subscription_id:snap.stripe_subscription_id,p_status:snap.status,p_period_end:snap.current_period_end,p_cancel:snap.cancel_at_period_end,p_event_created:eventCreated});
  if(syncError)throw syncError;
}
export async function hasPaidAccess(userId:string):Promise<boolean>{
  if(await hasStoreAccess(userId))return true;
  const db=admin();let {data,error}=await db.from('subscriptions').select('*').eq('user_id',userId).maybeSingle();if(error)throw error;
  if(!data)return false;
  // A bounded freshness check prevents an indefinitely stale active entitlement.
  if(data.stripe_customer_id&&Date.now()-Date.parse(data.updated_at)>300_000){await syncCustomer(data.stripe_customer_id,Math.floor(Date.now()/1000),stripe(),db);const latest=await db.from('subscriptions').select('*').eq('user_id',userId).maybeSingle();if(latest.error)throw latest.error;data=latest.data;}
  return !!data&&subscriptionEligible(data);
}
export async function consumeAiQuota(userId:string,requestId:string):Promise<boolean>{
  const configured=Number(process.env.AI_MAX_DAILY_REQUESTS||40);
  if(!Number.isInteger(configured)||configured<1||configured>1000)throw new Error('Invalid AI quota');
  const {data,error}=await admin().rpc('reserve_ai_request',{p_user_id:userId,p_request_id:requestId,p_max_daily:configured});if(error)throw error;return data===true;
}
export async function prepareAccountDeletion(userId:string):Promise<void>{
  const db=admin();const {data,error}=await db.from('subscriptions').select('stripe_customer_id').eq('user_id',userId).maybeSingle();if(error)throw error;if(!data?.stripe_customer_id)return;
  const s=stripe();const all=await s.subscriptions.list({customer:data.stripe_customer_id,status:'all',limit:100});
  if(all.has_more)throw new Error('Subscription inventory incomplete');
  // Explicit account deletion cancels web billing immediately; never require waiting for expiry.
  for(const subscription of all.data)if(!['canceled','incomplete_expired'].includes(subscription.status))await s.subscriptions.cancel(subscription.id);
  await s.customers.del(data.stripe_customer_id);
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
    if(path==='/api/billing/webhook'&&req.method==='POST'){
      const s=stripe();const signature=req.headers.get('stripe-signature');if(!signature)return json({error:'Missing signature'},400);
      let event:Stripe.Event;try{event=s.webhooks.constructEvent(await req.text(),signature,required('STRIPE_WEBHOOK_SECRET'));}catch{return json({error:'Invalid signature'},400);}
      if(['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted','checkout.session.completed','invoice.paid','invoice.payment_failed'].includes(event.type)){
        const obj=event.data.object as unknown as {customer?:string|{id:string}};
        const customer=typeof obj.customer==='string'?obj.customer:obj.customer?.id;
        if(customer)await syncCustomer(customer,event.created,s,admin());
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
    if(path==='/api/billing/checkout'){
      const price=await s.prices.retrieve(required('STRIPE_PRICE_ID'));if(!price.active||!price.recurring||price.unit_amount===null)return json({error:'Membership pricing is not available yet.'},503);
      let customerId=existing?.stripe_customer_id as string|undefined;
      if(!customerId){
        const {error:insertError}=await db.from('subscriptions').upsert({user_id:user.id},{onConflict:'user_id',ignoreDuplicates:true});if(insertError)throw insertError;
        const customer=await s.customers.create({email:user.email,metadata:{bakmx_user_id:user.id,product:'bakmx'}},{idempotencyKey:`bakmx-customer-${user.id}`});customerId=customer.id;
        const {error:updateError}=await db.from('subscriptions').update({stripe_customer_id:customerId}).eq('user_id',user.id);if(updateError)throw updateError;
      }
      const subscriptions=await s.subscriptions.list({customer:customerId,status:'all',limit:100});
      if(subscriptions.has_more||subscriptions.data.some(v=>!['canceled','incomplete_expired'].includes(v.status)))return json({error:'A membership already exists. Use Manage billing.'},409);
      // Reuse an open session to prevent accidental parallel subscriptions.
      const open=await s.checkout.sessions.list({customer:customerId,status:'open',limit:10});
      const own=open.data.find(v=>v.metadata?.product==='bakmx');if(own?.url)return json({url:own.url});
      const session=await s.checkout.sessions.create({mode:'subscription',customer:customerId,line_items:[{price:price.id,quantity:1}],client_reference_id:user.id,metadata:{product:'bakmx',user_id:user.id},subscription_data:{metadata:{product:'bakmx',user_id:user.id}},success_url:appUrl()+'/account?checkout=success',cancel_url:appUrl()+'/account?checkout=canceled'}, {idempotencyKey:`bakmx-checkout-${user.id}-${Math.floor(Date.now()/3600000)}`});
      return json({url:session.url});
    }
    return json({error:'Not found'},404);
  }catch{return json({error:'Billing is temporarily unavailable. No access change has been assumed.'},503);}
}
