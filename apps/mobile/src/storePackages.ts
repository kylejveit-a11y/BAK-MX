// Store offers (RevenueCat packages) sorted into what the Pro screen draws: Pro plans, Premium plans, question packs.
// Which product is which plan is decided by the server (MOBILE_PRO_PRODUCT_IDS, MOBILE_PREMIUM_PRODUCT_IDS); the phone
// only reads the names the store gives it, so a product it cannot place is shown under its own title, never mislabelled.
export type StorePackage={identifier:string;packageType?:string;product:{identifier:string;title:string;description:string;priceString:string;subscriptionPeriod:string|null}};
export type PlanGroup='pro'|'premium'|'other';
export const periodLabel=(value:string|null|undefined)=>value?({P1W:'week',P1M:'month',P2M:'2 months',P3M:'3 months',P6M:'6 months',P1Y:'year'}[value]??value):'';
export const isSubscription=(p:StorePackage)=>!!p.product.subscriptionPeriod;
export function planGroup(p:StorePackage):PlanGroup{
 const text=`${p.identifier} ${p.product.identifier} ${p.product.title}`.toLowerCase();
 if(/premium/.test(text))return 'premium';if(/\bpro\b|_pro|pro_|bakmx\.pro|bakmxpro/.test(text))return 'pro';return 'other';
}
/** Yearly before monthly within a group is not assumed: the store's own order is kept, so what Kyle arranges in RevenueCat is what riders see. */
export function sortPackages<T extends StorePackage>(all:T[]):{pro:T[];premium:T[];other:T[];packs:T[]}{
 const out={pro:[] as T[],premium:[] as T[],other:[] as T[],packs:[] as T[]};
 for(const p of all){if(!isSubscription(p)){out.packs.push(p);continue;}out[planGroup(p)].push(p);}
 return out;
}
/** "$9.99 / month" from the store's own price string and period. */
export const priceLine=(p:StorePackage)=>isSubscription(p)?`${p.product.priceString} / ${periodLabel(p.product.subscriptionPeriod)}`:p.product.priceString;
