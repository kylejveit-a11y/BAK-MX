// BAK Pro: the one screen that sells the paid side. Opened from the plan card, the used-up moment in chat, the Account
// row and a quiet link in the empty chat. Honest by construction: every feature line comes from shared/pro-flow.ts
// (which reads the plan gates), and every price is the store's own string. If the store offers do not load, the rider
// sees "Price shown in the App Store" and a Retry, never a number we made up.
import React,{useCallback,useEffect,useState} from 'react';
import {ActivityIndicator,Linking,Platform,StyleSheet,Text,View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {PurchasesPackage} from 'react-native-purchases';
import {TIER_LABEL,type Tier} from '../../../shared/plans';
import {LAUNCH_OFFER,PREMIUM_LINE,PRICE_IN_STORE,PRIVACY_URL,PRO_EYEBROW,PRO_HEADLINE,PRO_SUBHEAD,RENEWAL_DISCLOSURE,TERMS_URL,planComparison,proValueRows,type UsageView} from '../../../shared/pro-flow';
import {userErrorText} from '../../../shared/user-error';
import {api} from './api';
import {offerings,purchase,restore} from './billing';
import {priceLine,sortPackages} from './storePackages';
import {MetalPanel} from './MetalPanel';
import {Pressable} from './Touch';
import {BlueFace,Button,Icon,LinkAction,MetalMark,Notice,Page,blueLift,colors,onBlueText,type IconName} from './ui';

const ICON:Record<'chat'|'video'|'image',IconName>={chat:'chat',video:'video',image:'image'};
const hair={borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'#2a2f39'} as const;
const open=(url:string,fail:(t:string)=>void)=>void Linking.openURL(url).catch(e=>fail(userErrorText(e)));

/** The primary buy button: the plan name and the store's price line on the blue face. */
function BuyButton({title,price,disabled,onPress}:{title:string;price:string;disabled:boolean;onPress:()=>void}){
 return <Pressable haptic="press" accessibilityRole="button" accessibilityLabel={`${title}, ${price}`} accessibilityState={{disabled}} disabled={disabled} onPress={onPress}
  style={({pressed})=>[{borderRadius:28,minHeight:56,paddingVertical:14,paddingHorizontal:22,justifyContent:'center',overflow:'visible'},!disabled&&[blueLift,pressed&&{shadowOpacity:0.3,transform:[{translateY:1}]}],disabled&&{backgroundColor:'#16191f'}]}>
  {({pressed})=><>{!disabled&&<BlueFace radius={28} pressed={pressed}/>}
   <View style={{flexDirection:'row',alignItems:'baseline',justifyContent:'space-between',gap:12}}>
    <Text style={[{fontSize:17,fontWeight:'800',color:disabled?'#7d8593':'#fff'},!disabled&&onBlueText]}>{title}</Text>
    <Text style={[{fontSize:15.5,fontWeight:'700',color:disabled?'#7d8593':'#fff'},!disabled&&onBlueText]}>{price}</Text>
   </View></>}
 </Pressable>;
}

/** One value row: icon in a dark well, the title, one line under it. */
function ValueRow({icon,title,detail,last}:{icon:IconName;title:string;detail:string;last:boolean}){
 return <View accessible accessibilityLabel={`${title}. ${detail}`} style={[{flexDirection:'row',gap:14,paddingVertical:14},!last&&{borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:'rgba(255,255,255,0.08)'}]}>
  <View style={{width:40,height:40,borderRadius:12,borderWidth:1,borderColor:'rgba(255,255,255,0.10)',backgroundColor:'rgba(0,0,0,0.30)',alignItems:'center',justifyContent:'center'}}><Icon name={icon} size={20} color={colors.accent}/></View>
  <View style={{flex:1,gap:3}}><Text style={{color:colors.text,fontSize:16.5,fontWeight:'800',letterSpacing:-0.2}}>{title}</Text><Text style={{color:'#b9c0cb',fontSize:13.5,lineHeight:19}}>{detail}</Text></View>
 </View>;
}

/** Free / Premium / Pro, compact. Every cell is read from the plan code, so nothing here can drift from what is gated. */
function Comparison({current}:{current:Tier}){
 const rows=planComparison(),tiers:Tier[]=['free','premium','pro'];
 const head=(t:Tier)=><View key={t} style={{flex:1,alignItems:'center',gap:3}}><Text style={{color:t==='pro'?colors.accent:'#adb5c1',fontSize:11.5,fontWeight:'800',letterSpacing:1.1}}>{TIER_LABEL[t].toUpperCase()}</Text>{t===current&&<Text style={{color:'#8f97a4',fontSize:10,fontWeight:'700',letterSpacing:0.8}}>YOURS</Text>}</View>;
 return <View accessibilityRole="summary" accessibilityLabel={'Plans compared. '+rows.map(r=>`${r.feature}: Free ${r.free}, Premium ${r.premium}, Pro ${r.pro}.`).join(' ')} style={{gap:0}}>
  <View style={{flexDirection:'row',paddingBottom:10}}><View style={{flex:1.5}}/>{tiers.map(head)}</View>
  {rows.map((r,i)=><View key={r.feature} style={[{flexDirection:'row',alignItems:'center',paddingVertical:10,gap:4},hair]}>
   <Text style={{flex:1.5,color:'#d6dbe3',fontSize:13,lineHeight:17,fontWeight:'600'}}>{r.feature}</Text>
   {tiers.map(t=>{const v=r[t];const yes=v==='Included',no=v==='—';return <View key={t} style={{flex:1,alignItems:'center',paddingHorizontal:2}}>
    {yes?<Icon name="check" size={17} color={t==='pro'?colors.accent:'#bfe3c8'} weight={2.4}/>:no?<Text accessibilityLabel="Not included" style={{color:'#4f5663',fontSize:15}}>—</Text>:<Text style={{color:t==='pro'?colors.text:'#adb5c1',fontSize:11.5,lineHeight:15,fontWeight:t==='pro'?'800':'600',textAlign:'center'}}>{v}</Text>}
   </View>;})}
  </View>)}
 </View>;
}

export function ProScreen(){
 const [usage,setUsage]=useState<UsageView|null>(null),[packages,setPackages]=useState<PurchasesPackage[]|null>(null),[storeError,setStoreError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const loadUsage=useCallback(()=>{api<UsageView>('/api/usage').then(setUsage).catch(()=>{});},[]);
 const loadStore=useCallback(()=>{setStoreError('');offerings().then(p=>{setPackages(p);if(!p.length)setStoreError('Plans are not available from the store yet.');}).catch(e=>{setPackages([]);setStoreError(userErrorText(e,'The store could not be reached.'));});},[]);
 useFocusEffect(loadUsage);useEffect(loadStore,[loadStore]);
 async function task(action:()=>Promise<unknown>,success:string){setBusy(true);setNotice('');try{await action();setNotice(success);loadUsage();}catch(e){if((e as {userCancelled?:boolean}).userCancelled)setNotice('Purchase cancelled.');else setNotice(userErrorText(e));}finally{setBusy(false);}}
 const tier=usage?.tier??'free',beta=usage?.access_mode==='beta',onPro=tier==='pro';
 const groups=sortPackages(packages??[]),loading=packages===null,storeDown=!loading&&(!!storeError||(!groups.pro.length&&!groups.premium.length&&!groups.other.length));
 const manage=()=>open(Platform.OS==='ios'?'https://apps.apple.com/account/subscriptions':'https://play.google.com/store/account/subscriptions',setNotice);
 return <Page title="">
  <MetalPanel radius={22}>
   <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
    <View style={{flexDirection:'row',alignItems:'center',gap:8}}><MetalMark width={22}/><Text style={{color:'#c9cfd9',fontSize:12,fontWeight:'800',letterSpacing:1.6}}>{PRO_EYEBROW}</Text></View>
    {beta&&<Text style={{color:'#9aa2ae',fontSize:11.5,fontWeight:'800',letterSpacing:1.2}}>{LAUNCH_OFFER}</Text>}
   </View>
   <Text accessibilityRole="header" style={{color:colors.text,fontSize:34,lineHeight:38,fontWeight:'900',fontStyle:'italic',letterSpacing:-1.2}}>{PRO_HEADLINE}</Text>
   <Text style={{color:'#c9cfd9',fontSize:15,lineHeight:22}}>{PRO_SUBHEAD}</Text>
   <View style={{paddingTop:4}}>{proValueRows().map((r,i,all)=><ValueRow key={r.title} icon={ICON[r.icon]} title={r.title} detail={r.detail} last={i===all.length-1}/>)}</View>
  </MetalPanel>

  {/* The buttons: Pro first, then Premium smaller. Prices and periods are the store's own words. */}
  <View style={{gap:12,paddingTop:6}}>
   {onPro&&<Notice text={beta?'You are on Pro for the launch offer. Thanks for riding with us.':'You are on Pro. Thanks for riding with us.'}/>}
   {loading&&<View style={{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:8}}><ActivityIndicator color={colors.accent}/><Text style={{color:colors.muted,fontSize:14}}>Checking store prices…</Text></View>}
   {!loading&&!storeDown&&<>
    {groups.pro.map(p=><View key={p.identifier} style={{gap:6}}><BuyButton title={p.product.title||'BAK Pro'} price={priceLine(p)} disabled={busy||onPro} onPress={()=>void task(()=>purchase(p),'Purchase received. You are on Pro.')}/>{!!p.product.description&&<Text style={{color:'#8f97a4',fontSize:12.5,lineHeight:17,paddingHorizontal:6}}>{p.product.description}</Text>}</View>)}
    {groups.other.map(p=><BuyButton key={p.identifier} title={p.product.title} price={priceLine(p)} disabled={busy} onPress={()=>void task(()=>purchase(p),'Purchase received and your plan is updated.')}/>)}
    {groups.premium.length>0&&<View style={{gap:8,paddingTop:8}}>
     <Text style={{color:'#9aa2ae',fontSize:11.5,fontWeight:'800',letterSpacing:1.2}}>OR {TIER_LABEL.premium.toUpperCase()}</Text>
     <Text style={{color:colors.muted,fontSize:13.5,lineHeight:19}}>{PREMIUM_LINE}</Text>
     {groups.premium.map(p=><Button key={p.identifier} secondary disabled={busy||tier!=='free'} title={`${p.product.title||TIER_LABEL.premium} · ${priceLine(p)}`} onPress={()=>void task(()=>purchase(p),'Purchase received. You are on Premium.')}/>)}
    </View>}
    {groups.packs.length>0&&<View style={{gap:4,paddingTop:10}}>
     <Text style={{color:'#9aa2ae',fontSize:11.5,fontWeight:'800',letterSpacing:1.2}}>QUESTION PACKS</Text>
     <Text style={{color:colors.muted,fontSize:13.5,lineHeight:19}}>Extra questions that never expire, used after your included ones.</Text>
     {groups.packs.map(p=><Pressable key={p.identifier} accessibilityRole="button" accessibilityLabel={`${p.product.title}, ${p.product.priceString}`} disabled={busy} onPress={()=>void task(()=>purchase(p),'Credits added.')} style={({pressed})=>[{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:13,opacity:pressed?0.6:1},hair]}><Text style={{color:colors.text,fontSize:15.5,fontWeight:'600'}}>{p.product.title}</Text><Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>{p.product.priceString}</Text></Pressable>)}
    </View>}
   </>}
   {storeDown&&<View style={{gap:10}}>
    <BuyButton title="BAK Pro" price={PRICE_IN_STORE} disabled onPress={()=>{}}/>
    <Notice text={storeError||PRICE_IN_STORE}/>
    <LinkAction title="Retry" disabled={busy} onPress={()=>{setPackages(null);loadStore();}}/>
   </View>}
   <Notice text={notice}/>
  </View>

  {/* Apple 3.1.2: price and period are on each button; renewal and cancellation terms, Terms of Use (EULA) and Privacy Policy sit with them. */}
  <View style={{gap:8}}>
   <Text style={{color:'#9aa2ae',fontSize:12,lineHeight:17}}>{RENEWAL_DISCLOSURE}</Text>
   <View style={{flexDirection:'row',gap:22,flexWrap:'wrap'}}><LinkAction muted arrow={false} title="Terms of Use (EULA)" onPress={()=>open(TERMS_URL,setNotice)}/><LinkAction muted arrow={false} title="Privacy Policy" onPress={()=>open(PRIVACY_URL,setNotice)}/></View>
   <View style={{flexDirection:'row',gap:22,flexWrap:'wrap'}}><LinkAction muted arrow={false} disabled={busy} title="Restore purchases" onPress={()=>void task(restore,'Purchases restored.')}/><LinkAction muted arrow={false} title="Manage subscription" onPress={manage}/></View>
  </View>

  <View style={[{paddingTop:18,gap:12},hair]}>
   <Text style={{color:'#9aa2ae',fontSize:11.5,fontWeight:'800',letterSpacing:1.2}}>WHAT EACH PLAN GIVES</Text>
   <Comparison current={tier}/>
   <Text style={{color:'#8f97a4',fontSize:12.5,lineHeight:18}}>Your Garage, specs, logs, notes and community are yours on every plan. Only Ask BAK's allowance, clip coaching and the photo-edit count change.</Text>
  </View>
 </Page>;
}
