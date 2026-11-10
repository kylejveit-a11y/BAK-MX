// The empty Chat screen: the BAK MX mark on a lit plate, the one line that says what to do, and starters in rider language.
import React,{useEffect,useRef} from 'react';
import {Animated,Easing,Image,StyleSheet,Text,View} from 'react-native';
import Svg,{Defs,RadialGradient,Ellipse,Stop} from 'react-native-svg';
import {Pressable} from './Touch';
import {colors,motion} from './theme';
import type {ChatStarter} from './chatStarters';

const MARK=require('../assets/icon.png');
const GLOW_W=300,GLOW_H=190;

/** The mark with the bike's colour breathing softly behind it. Still when the rider asked for less motion.
 *  `compact` (the rider is typing, the keyboard is up): a smaller mark, so the line and the starters all stay in view. */
export function ChatHero({model,onPress,compact=false}:{model:string;onPress:()=>void;compact?:boolean}){
 const PLATE=compact?40:84,R=compact?11:22;
 const id=React.useId().replace(/[^a-zA-Z0-9]/g,'');
 const breath=useRef(new Animated.Value(motion.reduced?0.5:0)).current;
 useEffect(()=>{if(motion.reduced)return;
  const a=Animated.loop(Animated.sequence([
   Animated.timing(breath,{toValue:1,duration:1900,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
   Animated.timing(breath,{toValue:0,duration:1900,easing:Easing.inOut(Easing.sin),useNativeDriver:true})]));
  a.start();return()=>a.stop();},[breath]);
 return <Pressable accessibilityRole="button" accessibilityLabel="Start typing to BAK" accessibilityHint={`Ask about your ${model}`} onPress={onPress} style={({pressed})=>({alignItems:'center',gap:compact?8:14,paddingTop:compact?0:2,opacity:pressed?0.8:1})}>
  <View style={{width:PLATE,height:PLATE,alignItems:'center',justifyContent:'center'}}>
   <Animated.View pointerEvents="none" style={{position:'absolute',width:GLOW_W,height:GLOW_H,opacity:breath.interpolate({inputRange:[0,1],outputRange:[0.5,1]}),transform:[{scale:breath.interpolate({inputRange:[0,1],outputRange:compact?[0.55,0.62]:[0.94,1.05]})}]}}>
    <Svg width={GLOW_W} height={GLOW_H}><Defs><RadialGradient id={'hg'+id} cx="50%" cy="50%" rx="50%" ry="50%">
     <Stop offset="0" stopColor={colors.glow} stopOpacity="0.55"/><Stop offset="0.4" stopColor={colors.glow} stopOpacity="0.2"/><Stop offset="1" stopColor={colors.glow} stopOpacity="0"/>
    </RadialGradient></Defs><Ellipse cx={GLOW_W/2} cy={GLOW_H/2} rx={GLOW_W/2} ry={GLOW_H/2} fill={`url(#hg${id})`}/></Svg>
   </Animated.View>
   <View style={{width:PLATE,height:PLATE,borderRadius:R,shadowColor:'#000',shadowOpacity:0.6,shadowRadius:16,shadowOffset:{width:0,height:10},elevation:8}}>
    <Image source={MARK} fadeDuration={0} accessibilityIgnoresInvertColors style={{width:PLATE,height:PLATE,borderRadius:R}}/>
    {/* machined edge: lit along the top, falling to shadow at the bottom */}
    <View pointerEvents="none" style={[StyleSheet.absoluteFill,{borderRadius:R,borderWidth:1,borderTopColor:'rgba(255,255,255,0.30)',borderLeftColor:'rgba(255,255,255,0.12)',borderRightColor:'rgba(255,255,255,0.07)',borderBottomColor:'rgba(0,0,0,0.6)'}]}/>
   </View>
  </View>
  <View style={{alignItems:'center',gap:5,paddingHorizontal:8}}>
   <Text numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8} style={{color:colors.text,fontSize:24,fontWeight:'800',letterSpacing:-0.5,textAlign:'center'}}>Ask about your {model}</Text>
   <Text style={{color:'#adb5c1',fontSize:15,lineHeight:21,textAlign:'center'}}>Tell it like you’d tell your buddy at the truck.</Text>
  </View>
 </Pressable>;
}

/** Starters, two by two. A tap fills the message box; the rider finishes the sentence and sends. */
export function ChatStarters({starters,onPick}:{starters:ChatStarter[];onPick:(s:ChatStarter)=>void}){
 return <View accessibilityRole="list" style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>
  {starters.map(st=><Pressable key={st.label} haptic="select" accessibilityRole="button" accessibilityLabel={st.label} accessibilityHint="Puts this in the message box for you to finish" onPress={()=>onPick(st)}
   style={({pressed})=>({flexBasis:'47%',flexGrow:1,minHeight:54,justifyContent:'center',paddingVertical:8,paddingHorizontal:14,borderRadius:16,borderWidth:1,borderColor:'#2a2f39',backgroundColor:pressed?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.035)'})}>
   <Text numberOfLines={2} style={{color:'#e6e9ef',fontSize:14.5,lineHeight:19,fontWeight:'600'}}>{st.label}</Text>
  </Pressable>)}
 </View>;
}
