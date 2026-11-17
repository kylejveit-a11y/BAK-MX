// One-time "new in this version" card on Home. It closes with one tap and retires itself after a few app opens,
// so it is never a nag. 1.0.12's features work on iPhone and Android, so it shows on both.
import React,{useEffect,useState} from 'react';
import {Platform,Text,View} from 'react-native';
import {Pressable} from './Touch';
import {Icon,type IconName} from './Icon';
import {Disclosure} from './RichText';
import {MetalMark,Button,Card,colors} from './ui';
import {useProgress} from './localProgress';

const KEY='whats-new-2026-11-where-to-ride',MAX_OPENS=4;
const TITLE='Where to Ride';
let countedThisLaunch=false;

const items:[IconName,string,string][]=[
 ['moto','Riding areas','Off-road parks and national forest trails next to the tracks: what you can ride and how wide, passes, season and rules from the official pages.'],
 ['location','Trail maps','Forest Service trail lines colored by width, with each trail’s name and season. Tap Ride here today to start a practice day there.'],
 ['search','Near me','Find tracks and riding areas by name, town or state, or nearest first.'],
];

export function WhatsNewCard({account,show=Platform.OS!=='web'}:{account:string;show?:boolean}){
 const [state,setState]=useProgress(account,KEY,{dismissed:false,opens:0}),[open,setOpen]=useState(false);
 useEffect(()=>{if(!show||countedThisLaunch||state.dismissed)return;countedThisLaunch=true;setState({...state,opens:state.opens+1});},[]);
 if(!show||state.dismissed||state.opens>MAX_OPENS)return null;
 const close=()=>setState({...state,dismissed:true});
 // Closed it is one slim row, so Your bike stays on the first screen; tap to see the four features.
 if(!open)return <View style={{gap:8,paddingVertical:12,paddingHorizontal:14,borderRadius:16,backgroundColor:'#121a26',borderWidth:1,borderColor:'#22324a'}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
   <View style={{paddingHorizontal:7,paddingVertical:3,borderRadius:6,backgroundColor:colors.primary}}><Text style={{color:'#fff',fontSize:10.5,fontWeight:'900',letterSpacing:1}}>NEW</Text></View>
   <Text style={{color:colors.text,fontSize:15,fontWeight:'700',flex:1,lineHeight:20}} numberOfLines={2}>{TITLE}</Text>
  </View>
  {/* The actions sit on their own row, so the title never has to shrink to make room for them. */}
  <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingLeft:2}}>
   <Pressable accessibilityRole="button" accessibilityLabel={`New: ${TITLE}. See what's new`} hitSlop={8} onPress={()=>setOpen(true)} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:6,paddingVertical:2,opacity:pressed?0.6:1})}><Text style={{color:colors.text,fontSize:14,fontWeight:'700'}}>See what’s new</Text><Icon name="arrowRight" size={15} color={colors.accent} weight={2}/></Pressable>
   <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} onPress={close} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:5,paddingVertical:2,opacity:pressed?0.5:1})}><Text style={{color:'#9ea6b3',fontSize:14,fontWeight:'600'}}>Not now</Text><Icon name="close" size={14} color="#9ea6b3"/></Pressable>
  </View>
 </View>;
 return <Card>
  <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
   <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
    <MetalMark width={18}/>
    <Text style={{color:'#9aa2ae',fontSize:11.5,fontWeight:'800',letterSpacing:1.4}}>NEW IN BAK MX</Text>
   </View>
   <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} onPress={close} style={({pressed})=>({opacity:pressed?0.5:1,padding:2})}><Icon name="close" size={18} color="#9ea6b3"/></Pressable>
  </View>
  <Text style={{color:colors.text,fontSize:20,fontWeight:'800',letterSpacing:-0.4}}>{TITLE}</Text>
  <View style={{gap:12}}>
   {items.map(([icon,title,detail])=><View key={title} style={{flexDirection:'row',gap:12,alignItems:'flex-start'}}>
    <View style={{width:34,height:34,borderRadius:10,backgroundColor:'#16202e',borderWidth:1,borderColor:'#26354a',alignItems:'center',justifyContent:'center'}}><Icon name={icon} size={18} color="#9cc4ff"/></View>
    <View style={{flex:1,gap:1}}><Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>{title}</Text><Text style={{color:'#a7b0bd',fontSize:13.5,lineHeight:19}}>{detail}</Text></View>
   </View>)}
  </View>
  <Disclosure title="How to start Ride Day">
   {['On Home, tap Practice day and pick your track.','Tap Ride Day mode at the top of the practice screen.','Choose auto-lock or not, then set up ride safety if you want it.'].map((t,i)=><View key={i} style={{flexDirection:'row',gap:10}}><Text style={{color:colors.text,fontSize:14.5,fontWeight:'800',minWidth:14}}>{i+1}</Text><Text style={{color:colors.text,fontSize:14.5,lineHeight:21,flex:1}}>{t}</Text></View>)}
  </Disclosure>
  <Button secondary title="Got it" onPress={close}/>
 </Card>;
}
