import {useEffect,useState} from 'react';
import {ArrowUpRight,Check,Image as ImageIcon,MessageSquare,Video} from 'lucide-react';
import {api} from './client';
import {TIER_LABEL,TIER_BLURB,canStartTrialSet,type Tier,type Usage} from '../shared/plans';
import {LAUNCH_OFFER,PREMIUM_LINE,PRO_HEADLINE,PRO_SUBHEAD,planComparison,proValueRows} from '../shared/pro-flow';
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

const VALUE_ICON={chat:MessageSquare,video:Video,image:ImageIcon} as const;
/** The Pro pitch, the same words as the phone's BAK Pro screen (shared/pro-flow.ts). Prices come from Stripe below it. */
function ProPitch({tier,beta}:{tier:Tier;beta:boolean}){
 const rows=planComparison(),tiers:Tier[]=['free','premium','pro'];
 return <div className="pro-pitch">
  <div className="pro-head"><span className="eyebrow">BAK PRO{beta?` · ${LAUNCH_OFFER}`:''}</span><h2>{PRO_HEADLINE}</h2><p className="subtle">{PRO_SUBHEAD}</p></div>
  <ul className="pro-values">{proValueRows().map(r=>{const I=VALUE_ICON[r.icon];return <li key={r.title}><I size={18} aria-hidden/><div><b>{r.title}</b><p className="subtle">{r.detail}</p></div></li>;})}</ul>
  <table className="pro-compare"><caption className="eyebrow">WHAT EACH PLAN GIVES</caption>
   <thead><tr><th scope="col"><span className="sr-only">Feature</span></th>{tiers.map(t=><th key={t} scope="col" className={t==='pro'?'pro':''}>{TIER_LABEL[t]}{t===tier?<small> · yours</small>:null}</th>)}</tr></thead>
   <tbody>{rows.map(r=><tr key={r.feature}><th scope="row">{r.feature}</th>{tiers.map(t=>{const v=r[t];return <td key={t} className={t==='pro'?'pro':''}>{v==='Included'?<Check size={16} aria-label="Included"/>:v==='—'?<span aria-label="Not included">—</span>:v}</td>;})}</tr>)}</tbody>
  </table>
  <p className="subtle">Your Garage, specs, logs, notes and community are yours on every plan. Only Ask BAK's allowance, clip coaching and the photo-edit count change.</p>
 </div>;
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
   {usage.access_mode==='beta'&&<p className="subtle">Launch offer: every rider gets {usage.daily_limit} questions a day for now.</p>}
   {usage.trial&&usage.trial.remaining_sets>0&&<p className="subtle">Each free set is {usage.trial.size} questions. When a set runs out, start the next one when you're ready. We suggest spacing them across the week.</p>}
   {canStartTrialSet(usage)&&<div className="button-row"><button className="button" disabled={busy} onClick={nextSet}>Start next free set</button></div>}
  </div>}
  {tier!=='pro'&&<ProPitch tier={tier} beta={usage?.access_mode==='beta'}/>}
  {catalog&&(catalog.plans.length?<div className="plan-grid">{(['pro','premium'] as Tier[]).map(t=>{const prices=byTier(t);if(!prices.length)return null;return <article key={t} className={'plan-card'+(tier===t?' current':'')+(t==='pro'?' primary':' secondary')}>
    <span className="eyebrow">{TIER_LABEL[t].toUpperCase()}{tier===t?' · CURRENT':''}</span><p>{t==='premium'?PREMIUM_LINE:TIER_BLURB[t]}</p>
    <div className="plan-prices">{prices.map(p=><button key={p.price_id} className={tier===t||t==='premium'?'button secondary':'button'} disabled={busy||paid} onClick={()=>go('checkout',p.price_id)}>{money(p.amount,p.currency)} / {per(p.interval)}</button>)}</div>
   </article>;})}</div>:<p className="subtle">Premium and Pro open at launch.</p>)}
  {catalog&&catalog.plans.length>0&&<p className="subtle plan-terms">Subscriptions renew automatically until cancelled; change or cancel any time from Manage billing. <a href="/terms">Terms of Use</a> · <a href="/privacy">Privacy Policy</a></p>}
  {paid&&<div className="button-row"><button className="button secondary" disabled={busy} onClick={()=>go('portal')}>Change plan or manage billing <ArrowUpRight size={16}/></button></div>}
  {catalog&&catalog.packs.length>0&&<div className="credit-packs"><h3>Credit packs</h3><p className="subtle">Credits never expire and are used only after your included questions.</p><div className="button-row">{catalog.packs.map(p=><button key={p.price_id} className="button secondary" disabled={busy} onClick={()=>go('credits',p.price_id)}>{p.credits} questions · {money(p.amount,p.currency)}</button>)}</div></div>}
 </section>;
}
