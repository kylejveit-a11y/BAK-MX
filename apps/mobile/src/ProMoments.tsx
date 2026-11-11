// The conversion moments inside chat: the card where the answer would be when the allowance is used up, the quiet line
// under the composer, and the one-line link in the empty chat. Decisions live in shared/pro-flow.ts; this file only draws.
import React,{useCallback,useEffect,useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {Text,View} from 'react-native';
import {usageSummary,type LimitCard as LimitState,type UsageView} from '../../../shared/pro-flow';
import {userErrorText} from '../../../shared/user-error';
import {api} from './api';
import {offerings,planRenewal} from './billing';
import {sortPackages} from './storePackages';
import {Pressable} from './Touch';
import {Button,Card,Eyebrow,Icon,LinkAction,MetalMark,Notice,colors} from './ui';

/** Where the answer would be: what ran out, when it comes back, and the way on. The rider's question stays in the box. */
export function LimitCard({state,busy,onPro,onNextSet}:{state:LimitState;busy:boolean;onPro:()=>void;onNextSet:()=>Promise<void>}){
 const [packs,setPacks]=useState(false),[notice,setNotice]=useState(''),[working,setWorking]=useState(false);
 // "Buy a question pack" only when the store really has packs; it opens the Pro screen, where the packs are bought.
 useEffect(()=>{if(!state.actions.includes('pack'))return;let live=true;offerings().then(p=>{if(live)setPacks(sortPackages(p).packs.length>0);}).catch(()=>{});return()=>{live=false;};},[state.kind]);
 return <Card>
  <View style={{flexDirection:'row',alignItems:'center',gap:7}}><MetalMark width={14}/><Eyebrow>BAK</Eyebrow></View>
  <Text accessibilityRole="header" style={{color:colors.text,fontSize:19,fontWeight:'800',letterSpacing:-0.3,lineHeight:25}}>{state.title}</Text>
  <Text style={{color:colors.muted,fontSize:15,lineHeight:22}}>{state.body}</Text>
  {!!state.reset&&<View style={{flexDirection:'row',alignItems:'center',gap:7}}><Icon name="clock" size={14} color="#8f97a4"/><Text style={{color:'#8f97a4',fontSize:13}}>{state.reset}</Text></View>}
  <View style={{gap:10,paddingTop:2}}>
   {state.actions.includes('next_set')&&<Button title="Start next free set" disabled={busy||working} onPress={()=>{setWorking(true);setNotice('');onNextSet().catch(e=>setNotice(userErrorText(e))).finally(()=>setWorking(false));}}/>}
   {state.actions.includes('pro')&&<Button title="See BAK Pro" secondary={state.actions.includes('next_set')} disabled={busy} onPress={onPro}/>}
   {state.actions.includes('pack')&&packs&&<LinkAction title="Buy a question pack" disabled={busy} onPress={onPro}/>}
  </View>
  <Notice text={notice}/>
  <Text style={{color:'#6f7784',fontSize:12.5,lineHeight:17}}>Your Garage, specs, logs and notes keep working. Your question is still in the box.</Text>
 </Card>;
}

/** One quiet line under the composer. Dismissible for the session. */
export function ComposerNudge({text,action,onPress,onDismiss}:{text:string;action:'pro'|'next_set';onPress:()=>void;onDismiss:()=>void}){
 return <View accessibilityLiveRegion="polite" style={{flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:4,paddingBottom:2}}>
  <View style={{width:3,height:14,borderRadius:1,backgroundColor:colors.accent,transform:[{skewX:'-18deg'}]}}/>
  <Text numberOfLines={1} style={{flex:1,color:'#adb5c1',fontSize:13}}>{text}</Text>
  <Pressable accessibilityRole="button" accessibilityLabel={action==='pro'?'See plans':'Start next free set'} hitSlop={6} onPress={onPress} style={({pressed})=>({opacity:pressed?0.6:1})}><Text style={{color:colors.text,fontSize:13,fontWeight:'800'}}>{action==='pro'?'See plans →':'Start it →'}</Text></Pressable>
  <Pressable accessibilityRole="button" accessibilityLabel="Dismiss" hitSlop={8} onPress={onDismiss} style={({pressed})=>({opacity:pressed?0.6:1,paddingLeft:4})}><Icon name="close" size={13} color="#7d8593" weight={2.2}/></Pressable>
 </View>;
}

/** The empty chat's one line about Pro, for riders who are not on it. Nothing for Pro riders. */
export function ChatProLine({usage,onPress}:{usage:UsageView|null;onPress:()=>void}){
 if(!usage||usage.tier==='pro')return null;
 return <Pressable accessibilityRole="link" accessibilityLabel="Unlimited questions and clip coaching with BAK Pro" hitSlop={6} onPress={onPress} style={({pressed})=>({alignSelf:'center',flexDirection:'row',alignItems:'center',gap:6,paddingVertical:4,opacity:pressed?0.6:1})}>
  <Text style={{color:'#8f97a4',fontSize:12.5}}>Unlimited questions and clip coaching with</Text><Text style={{color:'#adb5c1',fontSize:12.5,fontWeight:'800'}}>BAK Pro</Text><Icon name="arrowRight" size={12} color="#adb5c1" weight={2}/>
 </Pressable>;
}

/** Account › Ask BAK plan row: the live one-liner ("Free · 3 of 7 sets left", "Premium · renews Dec 10", "Pro · Unlimited questions"). */
export function usePlanSummary(){
 const [usage,setUsage]=useState<UsageView|null>(null),[renews,setRenews]=useState<string|null>(null);
 useFocusEffect(useCallback(()=>{let live=true;api<UsageView>('/api/usage').then(u=>{if(!live)return;setUsage(u);if(u.tier==='premium')planRenewal().then(r=>{if(live)setRenews(r);});}).catch(()=>{});return()=>{live=false;};},[]));
 return {usage,summary:usageSummary(usage,renews)};
}
