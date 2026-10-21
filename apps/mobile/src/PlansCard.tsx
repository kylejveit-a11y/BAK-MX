import React,{useCallback,useState} from 'react';
import {View,Text,Linking,Platform,StyleSheet} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {PurchasesPackage} from 'react-native-purchases';
import {TIER_LABEL,TIER_BLURB,canStartTrialSet,type Usage} from '../../../shared/plans';
import {api} from './api';
import {offerings,purchase,restore} from './billing';
import {Button,Card,Copy,Eyebrow,LinkAction,Notice,Tile,colors} from './ui';

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
 const meter=(used:number,total:number)=><View style={{height:3,borderRadius:2,backgroundColor:'#222834',overflow:'hidden'}}><View style={{height:3,width:`${Math.min(100,total?100*used/total:0)}%`,backgroundColor:colors.accent}}/></View>;
 const line=(label:string,value:string)=><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{color:'#8f97a5',fontSize:14}}>{label}</Text><Text style={{color:colors.text,fontSize:14,fontWeight:'700'}}>{value}</Text></View>;
 const manage=()=>void Linking.openURL(Platform.OS==='ios'?'https://apps.apple.com/account/subscriptions':'https://play.google.com/store/account/subscriptions').catch(e=>setNotice(errorText(e)));
 return <Card>
  <Eyebrow>ASK BAK PLAN</Eyebrow>
  {!usage?<Copy>Checking your plan…</Copy>:<>
   <View style={{flexDirection:'row',alignItems:'baseline',gap:10}}><Text style={{color:colors.text,fontSize:24,fontWeight:'900',fontStyle:'italic',letterSpacing:-0.6}}>{TIER_LABEL[tier]}</Text>{usage.access_mode==='beta'&&<Text style={{color:colors.accent,fontSize:12,fontWeight:'800',letterSpacing:1.2}}>BETA</Text>}</View>
   <Text style={{color:colors.muted,fontSize:14,lineHeight:20}}>{usage.access_mode==='beta'?`Everyone gets ${usage.daily_limit} questions a day during the beta.`:TIER_BLURB[tier]}</Text>
   <View style={{gap:8,paddingTop:2}}>
    {usage.unlimited?line('Questions','Unlimited'):usage.daily_limit>0&&<>{line('Today',`${usage.used_today} of ${usage.daily_limit}`)}{meter(usage.used_today,usage.daily_limit)}</>}
    {(tier==='free'||usage.credits>0)&&line(tier==='free'?'Questions left':'Credits',String(usage.credits))}
    {usage.trial&&usage.trial.blocks!=null&&line('Free sets left',`${usage.trial.remaining_sets} of ${usage.trial.blocks}`)}
   </View>
   {canStartTrialSet(usage)&&<Button disabled={busy} title="Start next free set" onPress={()=>void task(()=>api('/api/usage/next-set','POST',{}),'Your next free set is ready.')}/>}
  </>}
  <Notice text={notice}/>
  {!packages.length&&<LinkAction disabled={busy} title="See plans and credit packs" onPress={()=>void task(async()=>{const p=await offerings();setPackages(p);if(!p.length)setNotice('Plans and credit packs are not available from the store yet.');})}/>}
  {plans.map(p=><View key={p.identifier} style={{gap:6,paddingVertical:10,borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'#2a2f39'}}><View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'baseline'}}><Text style={{color:colors.text,fontSize:17,fontWeight:'800'}}>{p.product.title}</Text><Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>{p.product.priceString}<Text style={{color:'#8f97a5',fontWeight:'500'}}> / {periodLabel(p.product.subscriptionPeriod!)}</Text></Text></View><Text style={{color:colors.muted,fontSize:13.5,lineHeight:19}}>{p.product.description}</Text><Button disabled={busy} title={`Subscribe · ${p.product.priceString} / ${periodLabel(p.product.subscriptionPeriod!)}`} onPress={()=>void task(()=>purchase(p),'Purchase received and your plan is updated.')}/></View>)}
  {packs.length>0&&<View style={{gap:4,paddingTop:6}}><Text style={{color:colors.text,fontSize:16,fontWeight:'800'}}>Credit packs</Text><Text style={{color:colors.muted,fontSize:13}}>Credits never expire and are used after your included questions.</Text></View>}
  {packs.map(p=><Tile key={p.identifier} title={p.product.title} right={p.product.priceString} onPress={()=>{if(!busy)void task(()=>purchase(p),'Credits added.');}}/>)}
  {packages.length>0&&<Text style={{color:'#737b88',fontSize:12,lineHeight:17}}>Subscriptions renew automatically unless cancelled in your store account at least 24 hours before the period ends. The store purchase sheet confirms the billing period and full terms before payment.</Text>}
  <View style={{flexDirection:'row',gap:22,flexWrap:'wrap'}}><LinkAction muted arrow={false} disabled={busy} title="Restore purchases" onPress={()=>void task(restore,'Purchases restored.')}/><LinkAction muted arrow={false} title="Manage subscription" onPress={manage}/></View>
 </Card>;
}
