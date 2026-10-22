// A brushed gunmetal plate that floats above the page. Built like real machined metal: a fine directional grain, light that
// falls off softly from the top, a broad satin sheen across the brushing, a hairline lit edge, a slightly darker lower edge,
// and a soft shadow that spreads underneath. Used where one thing should feel like a real object (the bike check before sign-up).
import React from 'react';
import {Image,StyleSheet,View,type StyleProp,type ViewStyle} from 'react-native';
import Svg,{Defs,LinearGradient,RadialGradient,Rect,Stop} from 'react-native-svg';

export function MetalPanel({children,style,radius=16}:{children:React.ReactNode;style?:StyleProp<ViewStyle>;radius?:number}){
 const id=React.useId().replace(/[^a-zA-Z0-9]/g,'');
 return <View style={[{borderRadius:radius,shadowColor:'#000',shadowOpacity:0.55,shadowRadius:28,shadowOffset:{width:0,height:18},elevation:10},style]}>
  {/* contact shadow: a tighter, darker shadow right under the plate */}
  <View pointerEvents="none" style={{position:'absolute',left:6,right:6,top:6,bottom:-2,borderRadius:radius,shadowColor:'#000',shadowOpacity:0.6,shadowRadius:6,shadowOffset:{width:0,height:4},backgroundColor:'#0b0c0f'}}/>
  <View pointerEvents="none" style={[StyleSheet.absoluteFill,{borderRadius:radius,overflow:'hidden'}]}>
   <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
    <Defs>
     <LinearGradient id={'b'+id} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#3a3e45"/><Stop offset="0.45" stopColor="#2b2e34"/><Stop offset="1" stopColor="#1f2226"/></LinearGradient>
     {/* satin sheen: brushed metal throws a broad soft band across the grain, not a sharp highlight */}
     <LinearGradient id={'s'+id} x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#ffffff" stopOpacity="0"/><Stop offset="0.28" stopColor="#ffffff" stopOpacity="0.035"/><Stop offset="0.5" stopColor="#ffffff" stopOpacity="0.075"/><Stop offset="0.72" stopColor="#ffffff" stopOpacity="0.03"/><Stop offset="1" stopColor="#ffffff" stopOpacity="0"/></LinearGradient>
     <RadialGradient id={'v'+id} cx="50%" cy="40%" r="75%"><Stop offset="0.6" stopColor="#000" stopOpacity="0"/><Stop offset="1" stopColor="#000" stopOpacity="0.28"/></RadialGradient>
    </Defs>
    <Rect x="0" y="0" width="100%" height="100%" fill={`url(#b${id})`}/>
    <Rect x="0" y="0" width="100%" height="100%" fill={`url(#s${id})`}/>
   </Svg>
   <Image source={require('../assets/metal-grain.png')} resizeMode="repeat" style={[StyleSheet.absoluteFill,{opacity:0.16,width:'100%',height:'100%'}]} accessibilityIgnoresInvertColors/>
   <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}><Rect x="0" y="0" width="100%" height="100%" fill={`url(#v${id})`}/></Svg>
   {/* hairline machined edge: lit along the top, falling to shadow at the bottom */}
   <View style={[StyleSheet.absoluteFill,{borderRadius:radius,borderWidth:StyleSheet.hairlineWidth,borderTopColor:'rgba(255,255,255,0.32)',borderLeftColor:'rgba(255,255,255,0.12)',borderRightColor:'rgba(255,255,255,0.06)',borderBottomColor:'rgba(0,0,0,0.6)'}]}/>
   <View style={{position:'absolute',left:radius,right:radius,top:0,height:1,backgroundColor:'rgba(255,255,255,0.10)'}}/>
  </View>
  <View style={{padding:22,gap:14}}>{children}</View>
 </View>;
}

/** A shallow recess machined into the plate, for the control that lives on it. */
export function MetalWell({children,style}:{children:React.ReactNode;style?:StyleProp<ViewStyle>}){
 return <View style={[{borderRadius:10,backgroundColor:'rgba(0,0,0,0.28)',borderWidth:StyleSheet.hairlineWidth,borderTopColor:'rgba(0,0,0,0.75)',borderLeftColor:'rgba(0,0,0,0.5)',borderRightColor:'rgba(255,255,255,0.05)',borderBottomColor:'rgba(255,255,255,0.12)'},style]}>{children}</View>;
}
