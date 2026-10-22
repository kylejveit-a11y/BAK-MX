// A machined gunmetal plate that floats above the page: brushed grain, light falling from the top, a bevelled edge that
// catches it, a dark lower edge, four corner screws and a deep shadow underneath. Used where one thing should feel like a
// real object to hold (the bike check before sign-up).
import React from 'react';
import {Image,StyleSheet,View,type StyleProp,type ViewStyle} from 'react-native';
import Svg,{Defs,LinearGradient,RadialGradient,Rect,Stop,Circle,Line} from 'react-native-svg';

export function MetalPanel({children,style,radius=18}:{children:React.ReactNode;style?:StyleProp<ViewStyle>;radius?:number}){
 const id=React.useId().replace(/[^a-zA-Z0-9]/g,'');
 return <View style={[{borderRadius:radius,shadowColor:'#000',shadowOpacity:0.75,shadowRadius:22,shadowOffset:{width:0,height:16},elevation:12},style]}>
  <View pointerEvents="none" style={[StyleSheet.absoluteFill,{borderRadius:radius,overflow:'hidden'}]}>
   <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
    <Defs>
     <LinearGradient id={'b'+id} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#4a5059"/><Stop offset="0.18" stopColor="#30353d"/><Stop offset="0.7" stopColor="#1d2026"/><Stop offset="1" stopColor="#14161a"/></LinearGradient>
     <LinearGradient id={'s'+id} x1="0" y1="0" x2="1" y2="0.6"><Stop offset="0" stopColor="#ffffff" stopOpacity="0"/><Stop offset="0.34" stopColor="#ffffff" stopOpacity="0.09"/><Stop offset="0.42" stopColor="#ffffff" stopOpacity="0.02"/><Stop offset="0.6" stopColor="#ffffff" stopOpacity="0"/></LinearGradient>
    </Defs>
    <Rect x="0" y="0" width="100%" height="100%" fill={`url(#b${id})`}/>
    <Rect x="0" y="0" width="100%" height="100%" fill={`url(#s${id})`}/>
   </Svg>
   <Image source={require('../assets/brushed.png')} resizeMode="repeat" style={[StyleSheet.absoluteFill,{opacity:0.22,width:'100%',height:'100%'}]} accessibilityIgnoresInvertColors/>
   {/* bevel: a lit outer edge and a dark chamfer just inside it */}
   <View style={[StyleSheet.absoluteFill,{borderRadius:radius,borderWidth:1,borderTopColor:'rgba(255,255,255,0.38)',borderLeftColor:'rgba(255,255,255,0.14)',borderRightColor:'rgba(0,0,0,0.5)',borderBottomColor:'rgba(0,0,0,0.85)'}]}/>
   <View style={{position:'absolute',left:3,right:3,top:3,bottom:3,borderRadius:radius-3,borderWidth:1,borderTopColor:'rgba(0,0,0,0.45)',borderLeftColor:'rgba(0,0,0,0.3)',borderRightColor:'rgba(255,255,255,0.05)',borderBottomColor:'rgba(255,255,255,0.08)'}}/>
   {(['tl','tr','bl','br'] as const).map(c=><Screw key={c} id={id+c} style={{position:'absolute',[c[0]==='t'?'top':'bottom']:10,[c[1]==='l'?'left':'right']:10}} angle={c==='tl'?35:c==='tr'?-20:c==='bl'?70:10}/>)}
  </View>
  <View style={{padding:22,gap:14}}>{children}</View>
 </View>;
}

/** A recessed slot milled into the plate, for the control that lives on it. */
export function MetalWell({children,style}:{children:React.ReactNode;style?:StyleProp<ViewStyle>}){
 return <View style={[{borderRadius:12,backgroundColor:'rgba(0,0,0,0.38)',borderWidth:1,borderTopColor:'rgba(0,0,0,0.7)',borderLeftColor:'rgba(0,0,0,0.5)',borderRightColor:'rgba(255,255,255,0.06)',borderBottomColor:'rgba(255,255,255,0.14)'},style]}>{children}</View>;
}

function Screw({id,style,angle}:{id:string;style:StyleProp<ViewStyle>;angle:number}){
 const r=Math.PI*angle/180,dx=Math.cos(r)*3.2,dy=Math.sin(r)*3.2;
 return <View style={style}><Svg width={10} height={10}>
  <Defs><RadialGradient id={'h'+id} cx="35%" cy="30%" r="75%"><Stop offset="0" stopColor="#c9ced6"/><Stop offset="0.55" stopColor="#6c727c"/><Stop offset="1" stopColor="#2a2e35"/></RadialGradient></Defs>
  <Circle cx={5} cy={5.4} r={4.6} fill="rgba(0,0,0,0.6)"/>
  <Circle cx={5} cy={5} r={4.2} fill={`url(#h${id})`}/>
  <Line x1={5-dx} y1={5-dy} x2={5+dx} y2={5+dy} stroke="#1b1e23" strokeWidth={1.2} strokeLinecap="round"/>
 </Svg></View>;
}
