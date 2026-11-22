// A raised graphite surface for chips, tiles and small cards: light falls from the top, a faint brushed grain, a lit
// top edge, a darker bottom edge and a soft shadow, so boxes read as objects on the page instead of flat outlines.
// Lighter than MetalPanel (which is for the one hero plate on a screen).
import React from 'react';
import {Image,StyleSheet,Text,View,type StyleProp,type ViewStyle} from 'react-native';
import {Pressable} from './Touch';
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

/** A small raised button for a row's one action ("Log it"): reads as a pressable key, not a flat outline. */
export function RaisedButton({title,onPress,label,disabled=false}:{title:string;onPress:()=>void;label?:string;disabled?:boolean}){
 return <Pressable haptic="press" accessibilityRole="button" accessibilityLabel={label??title} disabled={disabled} onPress={onPress} hitSlop={8}
  style={({pressed})=>[{minHeight:38,paddingHorizontal:16,borderRadius:13,alignItems:'center',justifyContent:'center',opacity:disabled?0.5:1},raisedLift,{shadowRadius:6,shadowOffset:{width:0,height:3}},pressed&&{transform:[{translateY:1}]}]}>
  {({pressed})=><><RaisedFace radius={13} pressed={pressed}/><Text style={{color:'#f2f4f7',fontSize:14,fontWeight:'700'}}>{title}</Text></>}</Pressable>;
}
/** The finish for a field the rider types in: sunk into the page (dark top edge, faint lit bottom edge), the opposite of raised. */
export const well={backgroundColor:'#07080b',borderWidth:1,borderTopColor:'rgba(0,0,0,0.9)',borderLeftColor:'rgba(0,0,0,0.6)',borderRightColor:'rgba(255,255,255,0.05)',borderBottomColor:'rgba(255,255,255,0.11)'} as const;
