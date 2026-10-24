// One-time "new on iPhone" card on Home. It closes with one tap and retires itself after a few app opens,
// so it is never a nag. Widgets, Lock Screen and Siri are iPhone-only, so other platforms never show it.
import React,{useEffect} from 'react';
import {Platform,Text,View} from 'react-native';
import {Pressable} from './Touch';
import {Icon,type IconName} from './Icon';
import {Disclosure} from './RichText';
import {Button,Card,colors} from './ui';
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
 const [state,setState]=useProgress(account,KEY,{dismissed:false,opens:0});
 useEffect(()=>{if(!show||countedThisLaunch||state.dismissed)return;countedThisLaunch=true;setState({...state,opens:state.opens+1});},[]);
 if(!show||state.dismissed||state.opens>MAX_OPENS)return null;
 const close=()=>setState({...state,dismissed:true});
 return <Card>
  <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
   <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
    <View style={{width:18,height:3,borderRadius:2,backgroundColor:colors.accent,transform:[{skewX:'-24deg'}]}}/>
    <Text style={{color:colors.accent,fontSize:11.5,fontWeight:'800',letterSpacing:1.4}}>NEW ON IPHONE</Text>
   </View>
   <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} onPress={close} style={({pressed})=>({opacity:pressed?0.5:1,padding:2})}><Icon name="close" size={18} color="#8b93a1"/></Pressable>
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
