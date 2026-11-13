// A raised graphite surface for chips, tiles and small cards: light falls from the top, a faint brushed grain, a lit
// top edge, a darker bottom edge and a soft shadow, so boxes read as objects on the page instead of flat outlines.
// Lighter than MetalPanel (which is for the one hero plate on a screen).
import React from 'react';
import {Image,StyleSheet,View,type StyleProp,type ViewStyle} from 'react-native';
import Svg,{Defs,LinearGradient,Rect,Stop} from 'react-native-svg';

/** The shadow for a raised surface. Put it on the outer view (shadows need overflow visible). */
export const raisedLift={shadowColor:'#000',shadowOpacity:0.45,shadowRadius:10,shadowOffset:{width:0,height:6},elevation:4} as const;

/** Absolute-fill finish. Render it as the first child of a view with the same border radius. */
export function RaisedFace({radius,pressed=false,tint}:{radius:number;pressed?:boolean;tint?:'blue'}){
 const id=React.useId().replace(/[^a-zA-Z0-9]/g,'');
 const top=tint==='blue'?(pressed?'#1a2536':'#1f2c42'):(pressed?'#1a1d23':'#23272e');
 const bottom=tint==='blue'?'#0c121c':'#0e1014';
 return <View pointerEvents="none" style={[StyleSheet.absoluteFill,{borderRadius:radius,overflow:'hidden'}]}>
  <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
   <Defs>
    <LinearGradient id={'r'+id} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={top}/><Stop offset="1" stopColor={bottom}/></LinearGradient>
    <LinearGradient id={'s'+id} x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#ffffff" stopOpacity="0"/><Stop offset="0.35" stopColor="#ffffff" stopOpacity={pressed?0.015:0.04}/><Stop offset="0.65" stopColor="#ffffff" stopOpacity="0"/></LinearGradient>
   </Defs>
   <Rect x="0" y="0" width="100%" height="100%" fill={`url(#r${id})`}/>
   <Rect x="0" y="0" width="100%" height="100%" fill={`url(#s${id})`}/>
  </Svg>
  <Image source={require('../assets/metal-grain.png')} resizeMode="repeat" style={[StyleSheet.absoluteFill,{opacity:0.08,width:'100%',height:'100%'}]} accessibilityIgnoresInvertColors/>
  <View style={[StyleSheet.absoluteFill,{borderRadius:radius,borderWidth:1,borderTopColor:pressed?'rgba(255,255,255,0.08)':tint==='blue'?'rgba(140,180,255,0.28)':'rgba(255,255,255,0.16)',borderLeftColor:'rgba(255,255,255,0.06)',borderRightColor:'rgba(0,0,0,0.35)',borderBottomColor:'rgba(0,0,0,0.7)'}]}/>
 </View>;
}

/** A static raised card (no press). */
export function Raised({children,radius=18,tint,style}:{children:React.ReactNode;radius?:number;tint?:'blue';style?:StyleProp<ViewStyle>}){
 return <View style={[{borderRadius:radius},raisedLift,style]}><RaisedFace radius={radius} tint={tint}/>{children}</View>;
}
