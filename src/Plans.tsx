import {useEffect,useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {api} from './client';
import {TIER_LABEL,TIER_BLURB,canStartTrialSet,type Tier,type Usage} from '../shared/plans';
import type {Entitlement} from '../shared/types';

type PlanPrice={tier:Tier;price_id:string;amount:number;currency:string;interval:string};
type Pack={price_id:string;credits:number;amount:number;currency:string};
type UsageView=Usage&{access_mode:'beta'|'subscription'};
const money=(amount:number,currency:string)=>new Intl.NumberFormat(undefined,{style:'currency',currency}).format(amount);
const per=(i:string)=>i==='year'?'yr':i==='month'?'mo':i;

/** Shown in chat when a Free rider's set is used up and another is available. */
export function NextSetButton({onStarted}:{onStarted:()=>void}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 return <span className="next-set"><button className="button" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await api('/usage/next-set','POST',{});onStarted();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>Start next free set</button>{error&&<small>{error}</small>}</span>;
}

export function Plans({entitlement}:{entitlement:Entitlement|null}){
 const [usage,setUsage]=useState<UsageView|null>(null),[catalog,setCatalog]=useState<{plans:PlanPrice[];packs:Pack[]}|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const load=()=>api<UsageView>('/usage').then(setUsage).catch(e=>setError((e as Error).message));
 useEffect(()=>{load();api<{plans:PlanPrice[];packs:Pack[]}>('/billing/plans').then(c=>setCatalog({plans:Array.isArray(c?.plans)?c.plans:[],packs:Array.isArray(c?.packs)?c.packs:[]})).catch(()=>setCatalog({plans:[],packs:[]}));},[]);
 async function go(path:string,price_id?:string){setBusy(true);setError('');try{const {url}=await api<{url:string}>('/billing/'+path,'POST',price_id?{price_id}:{});const u=new URL(url);if(u.protocol!=='https:')throw Error('The payment service returned an invalid URL.');location.assign(u.href);}catch(e){setError((e as Error).message);setBusy(false);}}
 async function nextSet(){setBusy(true);setError('');try{setUsage(await api<UsageView>('/usage/next-set','POST',{}));}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 const tier=usage?.tier??'free',paid=!!entitlement&&entitlement.status!=='none';
 const byTier=(t:Tier)=>(catalog?.plans??[]).filter(p=>p.tier===t).sort((a,b)=>a.amount-b.amount);
 return <section className="panel plans">
  <span className="eyebrow">ASK BAK PLAN</span>
  {error&&<div className="error" role="alert">{error}</div>}
  {!usage?<p className="subtle">Checking your plan…</p>:<div className="plan-status">
   <div><h2>{TIER_LABEL[tier]}</h2><p className="subtle">{TIER_BLURB[tier]}</p></div>
   <dl>
    {usage.unlimited?<div><dt>Questions</dt><dd>Unlimited</dd></div>:usage.daily_limit>0&&<div><dt>Today</dt><dd>{usage.used_today} of {usage.daily_limit}</dd></div>}
    <div><dt>{tier==='free'?'Questions left':'Credits'}</dt><dd>{usage.credits}</dd></div>
    {usage.trial&&<div><dt>Free sets left</dt><dd>{usage.trial.remaining_sets} of {usage.trial.blocks}</dd></div>}
   </dl>
   {usage.access_mode==='beta'&&<p className="subtle">Beta: every rider gets {usage.daily_limit} questions a day while BAK MX is in beta.</p>}
   {usage.trial&&usage.trial.remaining_sets>0&&<p className="subtle">Each free set is {usage.trial.size} questions. When a set runs out, start the next one when you're ready. We suggest spacing them across the week.</p>}
   {canStartTrialSet(usage)&&<div className="button-row"><button className="button" disabled={busy} onClick={nextSet}>Start next free set</button></div>}
  </div>}
  {catalog&&(catalog.plans.length?<div className="plan-grid">{(['premium','pro'] as Tier[]).map(t=>{const prices=byTier(t);if(!prices.length)return null;return <article key={t} className={'plan-card'+(tier===t?' current':'')}>
    <span className="eyebrow">{TIER_LABEL[t].toUpperCase()}{tier===t?' · CURRENT':''}</span><p>{TIER_BLURB[t]}</p>
    <div className="plan-prices">{prices.map(p=><button key={p.price_id} className={tier===t?'button secondary':'button'} disabled={busy||paid} onClick={()=>go('checkout',p.price_id)}>{money(p.amount,p.currency)} / {per(p.interval)}</button>)}</div>
   </article>;})}</div>:<p className="subtle">Premium and Pro open at launch.</p>)}
  {paid&&<div className="button-row"><button className="button secondary" disabled={busy} onClick={()=>go('portal')}>Change plan or manage billing <ArrowUpRight size={16}/></button></div>}
  {catalog&&catalog.packs.length>0&&<div className="credit-packs"><h3>Credit packs</h3><p className="subtle">Credits never expire and are used only after your included questions.</p><div className="button-row">{catalog.packs.map(p=><button key={p.price_id} className="button secondary" disabled={busy} onClick={()=>go('credits',p.price_id)}>{p.credits} questions · {money(p.amount,p.currency)}</button>)}</div></div>}
 </section>;
}
