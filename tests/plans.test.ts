import {test} from 'node:test';
import assert from 'node:assert/strict';
import type Stripe from 'stripe';
import {dailyLimit,effectiveDailyLimit,trialConfig,canStartTrialSet,limitMessage,bestTier,pairList} from '../shared/plans.ts';
import {stripePlanPrices,storeTier,creditPacks} from '../server/plans.ts';
import {mobileSnapshot,storeCreditPurchases} from '../server/mobile-billing.ts';
import {subscriptionSnapshot} from '../server/billing.ts';

test('plan allowances: Free has no daily allowance (trial sets instead), Premium 100, Pro fair-use 300, env overrides',()=>{
 assert.equal(dailyLimit('free'),0);assert.equal(dailyLimit('premium'),100);assert.equal(dailyLimit('pro'),300);
 assert.equal(dailyLimit('premium',{AI_DAILY_PREMIUM:'120'}),120);assert.throws(()=>dailyLimit('pro',{AI_DAILY_PRO:'-1'}));
 assert.deepEqual(trialConfig(),{blocks:7,size:20});
});
test('beta keeps every rider on the beta daily allowance until launch',()=>{
 assert.equal(effectiveDailyLimit('free','beta'),40);assert.equal(effectiveDailyLimit('pro','beta'),300);
 assert.equal(effectiveDailyLimit('free','subscription'),0);assert.equal(effectiveDailyLimit('free','beta',{AI_MAX_DAILY_REQUESTS:'25'}),25);
});
test('next free set is offered only when the current set is used up and sets remain',()=>{
 const trial={blocks:7,size:20,started:1,remaining_sets:6};
 assert.equal(canStartTrialSet({credits:0,remaining_today:0,trial}),true);
 assert.equal(canStartTrialSet({credits:3,remaining_today:0,trial}),false);
 assert.equal(canStartTrialSet({credits:0,remaining_today:0,trial:{...trial,started:7,remaining_sets:0}}),false);
 assert.equal(canStartTrialSet({credits:0,remaining_today:0,trial:null}),false);
 assert.match(limitMessage({tier:'free',unlimited:false,trial}),/6 free sets left/);
 assert.match(limitMessage({tier:'free',unlimited:false,trial:{...trial,remaining_sets:0}}),/used all your free questions/);
 assert.match(limitMessage({tier:'pro',unlimited:true}),/fair-use/);
});
test('tier mapping from Stripe prices and store products; the original single membership counts as Pro',()=>{
 const env={STRIPE_PLAN_PRICES:'premium:price_p,premium:price_py,pro:price_x',STRIPE_PRICE_ID:'price_old'};
 const m=stripePlanPrices(env as NodeJS.ProcessEnv);assert.equal(m.get('price_p'),'premium');assert.equal(m.get('price_py'),'premium');assert.equal(m.get('price_x'),'pro');assert.equal(m.get('price_old'),'pro');
 const s={MOBILE_PREMIUM_PRODUCT_IDS:'mx_premium_m',MOBILE_PRODUCT_IDS:'mx_monthly'} as NodeJS.ProcessEnv;
 assert.equal(storeTier('mx_premium_m',s),'premium');assert.equal(storeTier('mx_monthly',s),'pro');assert.equal(storeTier('emoto_monthly',s),null);
 assert.equal(bestTier('premium',null,'pro'),'pro');assert.equal(bestTier(),'free');
 assert.deepEqual(pairList('a:1, b:2 ,bad'),[['a','1'],['b','2']]);
 assert.deepEqual([...creditPacks('pack25:25,pack100:100,bad:0')],[['pack25',25],['pack100',100]]);
});
const now=1000000;
test('store: a Premium entitlement is recognised and the better live plan wins',()=>{
 const sub={is_sandbox:false,store:'app_store'},exp=new Date(now+60000).toISOString();
 const premiumOnly={request_date_ms:now,subscriber:{entitlements:{bakmx_premium:{expires_date:exp,product_identifier:'mx_premium_m'}},subscriptions:{mx_premium_m:sub}}};
 assert.equal(mobileSnapshot(premiumOnly,['mx_premium_m','mx_monthly'],false,now).product_identifier,'mx_premium_m');
 const both={request_date_ms:now,subscriber:{entitlements:{bakmx_premium:{expires_date:exp,product_identifier:'mx_premium_m'},bakmx_pro:{expires_date:exp,product_identifier:'mx_monthly'}},subscriptions:{mx_premium_m:sub,mx_monthly:sub}}};
 assert.equal(mobileSnapshot(both,['mx_premium_m','mx_monthly'],false,now).product_identifier,'mx_monthly');
});
test('store credit packs grant once per transaction and skip sandbox in production',()=>{
 const body={request_date_ms:now,subscriber:{entitlements:{},subscriptions:{},non_subscriptions:{mx_credits_25:[{id:'t1',store:'app_store',is_sandbox:false},{id:'t2',store:'app_store',is_sandbox:true}],other:[{id:'t3'}]}}};
 assert.deepEqual(storeCreditPurchases(body,creditPacks('mx_credits_25:25'),false),[{reference:'rc:t1',product:'mx_credits_25',credits:25}]);
 assert.equal(storeCreditPurchases(body,creditPacks('mx_credits_25:25'),true).length,2);
});
test('Stripe snapshot records which plan price is live',()=>{
 const s={id:'sub_1',status:'active',cancel_at_period_end:false,items:{data:[{price:{id:'price_p'},current_period_end:20000}]}} as unknown as Stripe.Subscription;
 assert.equal(subscriptionSnapshot(s,['price_p','price_x']).price_id,'price_p');assert.equal(subscriptionSnapshot(s,['price_x']).status,'unsupported_price');
});
