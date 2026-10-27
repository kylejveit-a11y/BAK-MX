// One-time "new on iPhone" card on Home. It closes with one tap and retires itself after a few app opens,
// so it is never a nag. Widgets, Lock Screen and Siri are iPhone-only, so other platforms never show it.
import React,{useEffect,useState} from 'react';
import {Platform,Text,View} from 'react-native';
import {Pressable} from './Touch';
import {Icon,type IconName} from './Icon';
import {Disclosure} from './RichText';
import {MetalMark,Button,Card,colors} from './ui';
import {useProgress} from './localProgress';

const KEY='whats-new-2026-10-widgets',MAX_OPENS=4;
let countedThisLaunch=false;

const items:[IconName,string,string][]=[
 ['home','Home Screen widget','Hours, next service and your last setup change at a glance.'],
 ['thandle','Guided jobs on the Lock Screen','The step you’re on stays visible while the phone is locked on the bench.'],
 ['mic','Siri','Say “Hey Siri, Ask BAK MX” when your hands are full.'],
 ['camera','Snap a part','Tap the camera on Home, take a photo, ask BAK.'],
];

export function WhatsNewCard({account,show=Platform.OS==='ios'}:{account:string;show?:boolean}){
 const [state,setState]=useProgress(account,KEY,{dismissed:false,opens:0}),[open,setOpen]=useState(false);
 useEffect(()=>{if(!show||countedThisLaunch||state.dismissed)return;countedThisLaunch=true;setState({...state,opens:state.opens+1});},[]);
 if(!show||state.dismissed||state.opens>MAX_OPENS)return null;
 const close=()=>setState({...state,dismissed:true});
 // Closed it is one slim row, so Your bike stays on the first screen; tap to see the four features.
 if(!open)return <View style={{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:12,paddingHorizontal:14,borderRadius:16,backgroundColor:'#121a26',borderWidth:1,borderColor:'#22324a'}}>
  <Pressable accessibilityRole="button" accessibilityLabel="New on iPhone: widgets, Siri and Lock Screen. See what's new" onPress={()=>setOpen(true)} style={({pressed})=>({flex:1,flexDirection:'row',alignItems:'center',gap:10,opacity:pressed?0.6:1})}>
   <View style={{paddingHorizontal:7,paddingVertical:3,borderRadius:6,backgroundColor:colors.primary}}><Text style={{color:'#fff',fontSize:10.5,fontWeight:'900',letterSpacing:1}}>NEW</Text></View>
   <Text style={{color:colors.text,fontSize:15,fontWeight:'700',flex:1}} numberOfLines={1}>Widgets, Siri and Lock Screen</Text>
   <Text style={{color:colors.accent,fontSize:14,fontWeight:'700'}}>See</Text>
  </Pressable>
  <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} onPress={close} style={({pressed})=>({opacity:pressed?0.5:1})}><Icon name="close" size={16} color="#9ea6b3"/></Pressable>
 </View>;
 return <Card>
  <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
   <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
    <MetalMark width={18}/>
    <Text style={{color:colors.accent,fontSize:11.5,fontWeight:'800',letterSpacing:1.4}}>NEW ON IPHONE</Text>
   </View>
   <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} onPress={close} style={({pressed})=>({opacity:pressed?0.5:1,padding:2})}><Icon name="close" size={18} color="#9ea6b3"/></Pressable>
  </View>
  <Text style={{color:colors.text,fontSize:20,fontWeight:'800',letterSpacing:-0.4}}>Widgets, Siri and Lock Screen</Text>
  <View style={{gap:12}}>
   {items.map(([icon,title,detail])=><View key={title} style={{flexDirection:'row',gap:12,alignItems:'flex-start'}}>
    <View style={{width:34,height:34,borderRadius:10,backgroundColor:'#16202e',borderWidth:1,borderColor:'#26354a',alignItems:'center',justifyContent:'center'}}><Icon name={icon} size={18} color="#9cc4ff"/></View>
    <View style={{flex:1,gap:1}}><Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>{title}</Text><Text style={{color:'#a7b0bd',fontSize:13.5,lineHeight:19}}>{detail}</Text></View>
   </View>)}
  </View>
  <Disclosure title="How to add the widget">
   {['Touch and hold an empty spot on your Home Screen until the apps jiggle.','Tap Edit in the top corner, then Add Widget.','Search BAK MX, pick a size and tap Add Widget.'].map((t,i)=><View key={i} style={{flexDirection:'row',gap:10}}><Text style={{color:colors.accent,fontSize:14.5,fontWeight:'800',minWidth:14}}>{i+1}</Text><Text style={{color:colors.text,fontSize:14.5,lineHeight:21,flex:1}}>{t}</Text></View>)}
  </Disclosure>
  <Button secondary title="Got it" onPress={close}/>
 </Card>;
}
