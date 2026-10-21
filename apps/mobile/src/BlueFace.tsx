// The BAK blue surface for buttons, send circles and selected chips.
// Built like the metal lettering: light falls from the top, the lower half darkens, a fine brushed grain runs across,
// a bright edge catches the top, a dark edge holds the bottom, and the whole thing sits on a soft shadow.
import React from 'react';
import {Image,StyleSheet,View} from 'react-native';
import Svg,{Defs,LinearGradient,Rect,Stop} from 'react-native-svg';

/** Shadow under a blue control. Put it on the Pressable itself (not inside an overflow:hidden view). */
export const blueLift={shadowColor:'#0a2a6e',shadowOpacity:0.6,shadowRadius:8,shadowOffset:{width:0,height:4},elevation:5} as const;
/** Text on blue: white with a fine dark line under it, so it reads as stamped into the surface. */
export const onBlueText={color:'#ffffff',textShadowColor:'rgba(4,16,48,0.55)',textShadowOffset:{width:0,height:1},textShadowRadius:1.5} as const;

/** Absolute-fill layer. Render it as the first child of a control with the same border radius. */
export function BlueFace({radius,pressed=false}:{radius:number;pressed?:boolean}){
 const id=React.useId().replace(/[^a-zA-Z0-9]/g,'');
 return <View pointerEvents="none" style={[StyleSheet.absoluteFill,{borderRadius:radius,overflow:'hidden'}]}>
  <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
   <Defs>
    <LinearGradient id={'b'+id} x1="0" y1="0" x2="0" y2="1">
     <Stop offset="0" stopColor={pressed?'#3f7ee9':'#5e97f4'}/>
     <Stop offset="0.48" stopColor={pressed?'#2763cf':'#2f74e8'}/>
     <Stop offset="1" stopColor={pressed?'#173f96':'#1b4cb3'}/>
    </LinearGradient>
    <LinearGradient id={'g'+id} x1="0" y1="0" x2="0" y2="1">
     <Stop offset="0" stopColor="#ffffff" stopOpacity={pressed?0.08:0.2}/>
     <Stop offset="0.5" stopColor="#ffffff" stopOpacity="0"/>
    </LinearGradient>
    <LinearGradient id={'s'+id} x1="0" y1="0" x2="1" y2="0">
     <Stop offset="0" stopColor="#ffffff" stopOpacity="0"/>
     <Stop offset="0.3" stopColor="#ffffff" stopOpacity="0.07"/>
     <Stop offset="0.55" stopColor="#ffffff" stopOpacity="0"/>
    </LinearGradient>
   </Defs>
   <Rect x="0" y="0" width="100%" height="100%" fill={`url(#b${id})`}/>
   <Rect x="0" y="0" width="100%" height="100%" fill={`url(#s${id})`}/>
   <Rect x="0" y="0" width="100%" height="100%" fill={`url(#g${id})`}/>
  </Svg>
  <Image source={require('../assets/brushed.png')} resizeMode="repeat" style={[StyleSheet.absoluteFill,{opacity:0.12,width:'100%',height:'100%'}]} accessibilityIgnoresInvertColors/>
  <View style={[StyleSheet.absoluteFill,{borderRadius:radius,borderWidth:1,borderTopColor:pressed?'rgba(190,215,255,0.25)':'rgba(205,225,255,0.55)',borderLeftColor:'rgba(160,195,255,0.18)',borderRightColor:'rgba(10,30,80,0.35)',borderBottomColor:'rgba(6,20,60,0.7)'}]}/>
 </View>;
}
