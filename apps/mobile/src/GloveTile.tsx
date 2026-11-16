// The glove-sized button for Ride Day and ride safety, in the app's own finishes: raised graphite for choices, a lit accent
// edge when a choice is picked, and the BAK blue metal for the one main action on a screen (Start, Save, Send, I'm back).
import React from 'react';
import {StyleSheet,Text,View} from 'react-native';
import {Pressable} from './Touch';
import {Icon,type IconName} from './Icon';
import {RaisedFace,raisedLift} from './Raised';
import {BlueFace,blueLift,onBlueText} from './BlueFace';
import {colors,tint} from './theme';
import {LABEL} from './theme';

export function GloveTile({label,sub,icon,onPress,on=false,primary=false,tone,half=false,minHeight=64,stack=false,disabled=false,radius=18,accessibilityLabel}:{
 label:string;sub?:string;icon?:IconName;onPress:()=>void;on?:boolean;primary?:boolean;tone?:string;half?:boolean;minHeight?:number;
 /** Icon above the label (half-width tiles), so long labels never squeeze. */stack?:boolean;disabled?:boolean;radius?:number;accessibilityLabel?:string}){
 const live=!disabled;
 return <Pressable haptic={primary?'press':'select'} accessibilityRole="button" accessibilityLabel={accessibilityLabel??(sub?`${label}, ${sub}`:label)} accessibilityState={{selected:on,disabled}} disabled={disabled} onPress={onPress}
  style={({pressed})=>[{width:half?'48.5%':'100%',minHeight,borderRadius:radius,paddingHorizontal:14,paddingVertical:12,justifyContent:'center',gap:4,opacity:live?1:0.5},
   primary&&live?blueLift:raisedLift,pressed&&{transform:[{translateY:1}],shadowOpacity:0.25}]}>
  {({pressed})=><>
   {primary&&live?<BlueFace radius={radius} pressed={pressed}/>:<RaisedFace radius={radius} pressed={pressed}/>}
   {on&&!primary&&<View pointerEvents="none" style={[StyleSheet.absoluteFill,{borderRadius:radius,borderWidth:1.5,borderColor:colors.accent,backgroundColor:tint(0.12)}]}/>}
   <View style={{flexDirection:stack?'column':'row',alignItems:stack?'flex-start':'center',gap:stack?8:12}}>
    {icon&&<Icon name={icon} size={stack?26:23} color={primary&&live?'#ffffff':tone??colors.accent}/>}
    <Text numberOfLines={2} style={[{color:tone??colors.text,fontSize:stack?15.5:16.5,lineHeight:stack?20:22,...LABEL,flexShrink:1},primary&&live&&onBlueText]}>{label}</Text>
   </View>
   {!!sub&&<Text numberOfLines={2} style={{color:primary&&live?'rgba(255,255,255,0.85)':colors.muted,fontSize:13.5,lineHeight:18}}>{sub}</Text>}
  </>}
 </Pressable>;
}

/** The small square header buttons (Lock, Back, Done) in the same raised finish. */
export function HeaderTile({label,icon,onPress,wide=false}:{label:string;icon?:IconName;onPress:()=>void;wide?:boolean}){
 return <Pressable haptic="tap" accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
  style={({pressed})=>[{minWidth:wide?76:60,height:54,paddingHorizontal:wide?12:0,borderRadius:16,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:6},raisedLift,pressed&&{transform:[{translateY:1}],shadowOpacity:0.25}]}>
  {({pressed})=><><RaisedFace radius={16} pressed={pressed}/>
   {icon&&<Icon name={icon} size={wide?18:25} color={colors.text}/>}
   {wide&&<Text style={{color:colors.text,fontSize:13.5,...LABEL}}>{label.toUpperCase()}</Text>}</>}
 </Pressable>;
}
