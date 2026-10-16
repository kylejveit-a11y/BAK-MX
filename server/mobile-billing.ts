import {isMxProjectUrl} from '../shared/mx-project.ts';
import {createClient} from '@supabase/supabase-js';
import {timingSafeEqual} from 'node:crypto';
import {z} from 'zod';
import {storeProducts,creditPacks,grantCredits} from './plans.ts';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
function db(){if(!isMxProjectUrl(process.env.SUPABASE_URL)||!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)throw new Error('Database not configured');return createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});}
const providerSchema=z.object({request_date_ms:z.number().finite().positive(),subscriber:z.object({entitlements:z.record(z.object({expires_date:z.string().nullable(),product_identifier:z.string()})),subscriptions:z.record(z.object({is_sandbox:z.boolean(),store:z.string(),refunded_at:z.string().nullable().optional()})),
 non_subscriptions:z.record(z.array(z.object({id:z.string(),is_sandbox:z.boolean().optional(),store:z.string().optional()}))).optional()})});
/** Plan entitlements in RevenueCat, best first. bakmx_pro is the original single membership. */
export const STORE_ENTITLEMENTS=['bakmx_pro','bakmx_premium'] as const;
export function mobileSnapshot(input:unknown,products:string[],allowSandbox=false,now=Date.now()){
 const data=providerSchema.parse(input);
 const check=(name:string)=>{const entitlement=data.subscriber.entitlements[name];const sub=entitlement?data.subscriber.subscriptions[entitlement.product_identifier]:undefined;
  const valid=!!entitlement&&!!sub&&products.includes(entitlement.product_identifier)&&!!entitlement.expires_date&&Date.parse(entitlement.expires_date)>now&&(!sub.is_sandbox||allowSandbox)&&!sub.refunded_at&&['app_store','play_store'].includes(sub.store);
  return {entitlement,sub,valid};};
 const all=STORE_ENTITLEMENTS.map(check),pick=all.find(x=>x.valid)??all.find(x=>x.entitlement)??all[0];
 const {entitlement,sub,valid}=pick;
 return {status:valid?'active':'none',current_period_end:valid?entitlement!.expires_date:null,product_identifier:entitlement?.product_identifier??null,store:sub?.store??null,is_sandbox:sub?.is_sandbox??false,provider_request_at:data.request_date_ms};
}
/** Consumable credit-pack purchases from the store, one per transaction id. */
export function storeCreditPurchases(input:unknown,packs:Map<string,number>,allowSandbox=false){
 const data=providerSchema.parse(input),out:{reference:string;product:string;credits:number}[]=[];
 for(const [product,txs] of Object.entries(data.subscriber.non_subscriptions??{})){const credits=packs.get(product);if(!credits)continue;
  for(const t of txs){if(t.is_sandbox&&!allowSandbox)continue;if(t.store&&!['app_store','play_store'].includes(t.store))continue;out.push({reference:'rc:'+t.id,product,credits});}}
 return out;
}
export async function syncStoreEntitlement(userId:string){
 z.string().uuid().parse(userId);const secret=process.env.REVENUECAT_SECRET_KEY;if(!secret)throw new Error('Store validation not configured');
 const res=await fetch('https://api.revenuecat.com/v1/subscribers/'+encodeURIComponent(userId),{headers:{Authorization:`Bearer ${secret}`},signal:AbortSignal.timeout(15000)});if(!res.ok)throw new Error('Store validation unavailable');
 const p=storeProducts(),products=[...p.premium,...p.pro];if(!products.length)throw new Error('No store products configured');
 const body=await res.json(),sandbox=process.env.ALLOW_SANDBOX_PURCHASES==='true'&&process.env.APP_ENV!=='production';
 const snap=mobileSnapshot(body,products,sandbox);
 // Credit packs bought in the app: each store transaction grants once, however many times this sync runs.
 for(const c of storeCreditPurchases(body,creditPacks(process.env.CREDIT_PACKS_STORE),sandbox))await grantCredits(userId,c.credits,c.reference,c.product);
 const {error}=await db().rpc('sync_mobile_entitlement',{p_user_id:userId,p_status:snap.status,p_period_end:snap.current_period_end,p_product:snap.product_identifier,p_store:snap.store,p_sandbox:snap.is_sandbox,p_request_at:snap.provider_request_at});if(error)throw error;return snap;
}
export async function hasStoreAccess(userId:string):Promise<boolean>{
 const {data,error}=await db().from('mobile_entitlements').select('*').eq('user_id',userId).maybeSingle();if(error)throw error;if(!data)return false;
 const current=Date.now()-Date.parse(data.checked_at)>300000?await syncStoreEntitlement(userId):data;
 return current.status==='active'&&!!current.current_period_end&&Date.parse(current.current_period_end)>Date.now()&&(!current.is_sandbox||(process.env.ALLOW_SANDBOX_PURCHASES==='true'&&process.env.APP_ENV!=='production'));
}
export async function handleMobileBilling(req:Request,user:{id:string}|null):Promise<Response|null>{
 const path=new URL(req.url).pathname;if(!path.startsWith('/api/mobile/'))return null;
 try{
  if(path==='/api/mobile/webhook'&&req.method==='POST'){
   const secret=process.env.REVENUECAT_WEBHOOK_SECRET,authorization=req.headers.get('authorization')||'';
   if(!secret||secret.length<32)return json({error:'Webhook not configured'},503);
   const expected=Buffer.from('Bearer '+secret),actual=Buffer.from(authorization);if(expected.length!==actual.length||!timingSafeEqual(expected,actual))return json({error:'Unauthorized'},401);
   const raw=await req.json() as {event?:{app_user_id?:string;transferred_from?:string[];transferred_to?:string[]}};
   // Transfers require revoking the prior owner as well as checking the recipient.
   const ids=[raw.event?.app_user_id,...(raw.event?.transferred_from||[]),...(raw.event?.transferred_to||[])];
   const unique=[...new Set(ids.filter((id):id is string=>z.string().uuid().safeParse(id).success))];if(unique.length>20)return json({error:'Event too large'},400);
   for(const id of unique){const found=await db().auth.admin.getUserById(id);if(!found.data.user)continue;await syncStoreEntitlement(id);}
   return json({received:true});
  }
  if(path==='/api/mobile/sync-entitlement'&&req.method==='POST'){if(!user)return json({error:'Sign in required'},401);return json(await syncStoreEntitlement(user.id));}
  return json({error:'Not found'},404);
 }catch{return json({error:'Store purchase validation is temporarily unavailable. Try Restore purchases again.'},503);}
}
