// The empty Chat screen: one phrase with the bike's colour glowing behind it, the line that says what to do, and starters in rider language.
import React,{useEffect,useRef} from 'react';
import {Animated,Easing,Text,View,useWindowDimensions} from 'react-native';
import Svg,{Defs,RadialGradient,Ellipse,Stop} from 'react-native-svg';
import {Pressable} from './Touch';
import {MetalMark} from './ui';
import {colors,motion} from './theme';
import {CHAT_HERO_PHRASE,type ChatStarter} from './chatStarters';

const GLOW_W=440,GLOW_H=250;

/** The phrase, in the Home headline's lettering, with the bike's colour breathing softly and wide behind it. Still when
 *  the rider asked for less motion. The whole block is one button that starts typing.
 *  `compact` (the rider is typing, the keyboard is up): a smaller phrase, so the line and the starters all stay in view. */
export function ChatHero({model,onPress,compact=false}:{model:string;onPress:()=>void;compact?:boolean}){
 const id=React.useId().replace(/[^a-zA-Z0-9]/g,'');
 const breath=useRef(new Animated.Value(motion.reduced?0.5:0)).current;
 useEffect(()=>{if(motion.reduced)return;
  const a=Animated.loop(Animated.sequence([
   Animated.timing(breath,{toValue:1,duration:1900,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
   Animated.timing(breath,{toValue:0,duration:1900,easing:Easing.inOut(Easing.sin),useNativeDriver:true})]));
  a.start();return()=>a.stop();},[breath]);
 const wide=useWindowDimensions().width>=420,size=compact?27:wide?44:42;
 return <Pressable accessibilityRole="button" accessibilityLabel="Start typing to BAK" accessibilityHint={`Ask about your ${model}`} onPress={onPress} style={({pressed})=>({alignSelf:'stretch',alignItems:'center',gap:compact?8:14,opacity:pressed?0.8:1})}>
  <View style={{alignSelf:'stretch',alignItems:'center',justifyContent:'center',gap:compact?7:11}}>
   <Animated.View pointerEvents="none" style={{position:'absolute',width:GLOW_W,height:GLOW_H,opacity:breath.interpolate({inputRange:[0,1],outputRange:[0.6,1]}),transform:[{scale:breath.interpolate({inputRange:[0,1],outputRange:compact?[0.78,0.84]:[0.96,1.05]})}]}}>
    <Svg width={GLOW_W} height={GLOW_H}><Defs><RadialGradient id={'hg'+id} cx="50%" cy="50%" rx="50%" ry="50%">
     <Stop offset="0" stopColor={colors.glow} stopOpacity="0.30"/><Stop offset="0.45" stopColor={colors.glow} stopOpacity="0.13"/><Stop offset="1" stopColor={colors.glow} stopOpacity="0"/>
    </RadialGradient></Defs><Ellipse cx={GLOW_W/2} cy={GLOW_H/2} rx={GLOW_W/2} ry={GLOW_H/2} fill={`url(#hg${id})`}/></Svg>
   </Animated.View>
   {/* side padding keeps the raked last letter from being cut at the text box edge */}
   <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} maxFontSizeMultiplier={1.2} style={{alignSelf:'stretch',color:colors.text,fontSize:size,lineHeight:Math.round(size*1.12),fontWeight:'900',fontStyle:'italic',letterSpacing:compact?-0.9:-1.5,textAlign:'center',paddingHorizontal:8}}>{CHAT_HERO_PHRASE}</Text>
   <View style={{flexDirection:'row',gap:4}}><MetalMark width={compact?20:30} height={compact?2.5:3}/><MetalMark width={compact?6:9} height={compact?2.5:3} dim/></View>
  </View>
  <Text style={{color:'#adb5c1',fontSize:compact?14:15,lineHeight:compact?19:21,textAlign:'center',maxWidth:330}}>Ask about your {model}. Tell it like you’d tell your buddy at the truck.</Text>
 </Pressable>;
}

/** Starters, two by two. A tap fills the message box; the rider finishes the sentence and sends. */
export function ChatStarters({starters,onPick}:{starters:ChatStarter[];onPick:(s:ChatStarter)=>void}){
 return <View accessibilityRole="list" style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>
  {starters.map(st=><Pressable key={st.label} haptic="select" accessibilityRole="button" accessibilityLabel={st.label} accessibilityHint="Puts this in the message box for you to finish" onPress={()=>onPick(st)}
   style={({pressed})=>({flexBasis:'47%',flexGrow:1,minHeight:54,justifyContent:'center',paddingVertical:8,paddingHorizontal:14,borderRadius:16,borderWidth:1,borderColor:'#2a2f39',backgroundColor:pressed?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.035)'})}>
   {/* Three lines, so the longest starter still reads whole on a 375 pt phone; on wider phones it stays at two. */}
   <Text numberOfLines={3} style={{color:'#e6e9ef',fontSize:14.5,lineHeight:19,fontWeight:'600'}}>{st.label}</Text>
  </Pressable>)}
 </View>;
}
