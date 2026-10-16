import React,{useCallback,useState} from 'react';
import {View,Linking,Platform} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {PurchasesPackage} from 'react-native-purchases';
import {TIER_LABEL,TIER_BLURB,canStartTrialSet,type Usage} from '../../../shared/plans';
import {api} from './api';
import {offerings,purchase,restore} from './billing';
import {Button,Card,Copy,Notice} from './ui';

type UsageView=Usage&{access_mode:'beta'|'subscription'};
const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const periodLabel=(value:string)=>({P1W:'week',P1M:'month',P3M:'3 months',P6M:'6 months',P1Y:'year'}[value]??value);
const isSubscription=(p:PurchasesPackage)=>!!p.product.subscriptionPeriod;

/** Ask BAK plan: current plan, what's left, free sets, store plans and credit packs. Store purchases are verified by the server. */
export function PlansCard(){
 const [usage,setUsage]=useState<UsageView|null>(null),[packages,setPackages]=useState<PurchasesPackage[]>([]),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const load=useCallback(()=>{api<UsageView>('/api/usage').then(setUsage).catch(e=>setNotice(errorText(e)));},[]);
 useFocusEffect(load);
 async function task(action:()=>Promise<unknown>,success?:string){setBusy(true);try{await action();if(success)setNotice(success);load();}catch(e){if((e as {userCancelled?:boolean}).userCancelled)setNotice('Purchase cancelled.');else setNotice(errorText(e));}finally{setBusy(false);}}
 const tier=usage?.tier??'free',plans=packages.filter(isSubscription),packs=packages.filter(p=>!isSubscription(p));
 return <Card>
  <Copy strong>Ask BAK plan</Copy>
  <Notice text={notice}/>
  {!usage?<Copy>Checking your plan…</Copy>:<>
   <Copy strong>{TIER_LABEL[tier]}</Copy><Copy>{TIER_BLURB[tier]}</Copy>
   {usage.unlimited?<Copy>Questions: unlimited</Copy>:usage.daily_limit>0&&<Copy>Today: {usage.used_today} of {usage.daily_limit}</Copy>}
   <Copy>{tier==='free'?'Questions left':'Credits'}: {usage.credits}</Copy>
   {usage.trial&&<Copy>Free sets left: {usage.trial.remaining_sets} of {usage.trial.blocks}</Copy>}
   {usage.access_mode==='beta'&&<Copy>Beta: every rider gets {usage.daily_limit} questions a day while BAK MX is in beta.</Copy>}
   {usage.trial&&usage.trial.remaining_sets>0&&<Copy>Each free set is {usage.trial.size} questions. When a set runs out, start the next one when you're ready. We suggest spacing them across the week.</Copy>}
   {canStartTrialSet(usage)&&<Button disabled={busy} title="Start next free set" onPress={()=>void task(()=>api('/api/usage/next-set','POST',{}),'Your next free set is ready.')}/>}
  </>}
  <Button secondary disabled={busy} title="See plans and credit packs" onPress={()=>void task(async()=>{const p=await offerings();setPackages(p);if(!p.length)setNotice('Plans and credit packs are not available from the store yet.');})}/>
  {plans.map(p=><View key={p.identifier} style={{gap:8}}><Copy strong>{p.product.title}</Copy><Copy>{p.product.description}</Copy><Button disabled={busy} title={`Subscribe · ${p.product.priceString} / ${periodLabel(p.product.subscriptionPeriod!)}`} onPress={()=>void task(()=>purchase(p),'Purchase received and your plan is updated.')}/></View>)}
  {packs.length>0&&<><Copy strong>Credit packs</Copy><Copy>Credits never expire and are used only after your included questions.</Copy></>}
  {packs.map(p=><Button key={p.identifier} secondary disabled={busy} title={`${p.product.title} · ${p.product.priceString}`} onPress={()=>void task(()=>purchase(p),'Credits added.')}/>)}
  <Copy>Subscriptions renew automatically unless cancelled in your store account at least 24 hours before the period ends. The store purchase sheet confirms the billing period and full terms before payment.</Copy>
  <Button secondary disabled={busy} title="Restore purchases" onPress={()=>void task(restore,'Purchases restored.')}/>
  <Button secondary title="Manage store subscription" onPress={()=>void Linking.openURL(Platform.OS==='ios'?'https://apps.apple.com/account/subscriptions':'https://play.google.com/store/account/subscriptions').catch(e=>setNotice(errorText(e)))}/>
 </Card>;
}
