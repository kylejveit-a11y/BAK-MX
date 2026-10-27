// Floating chrome: the header, tab bar and message boxes hover over the content as dark glass.
// iOS 26+ uses Apple's Liquid Glass; older iOS uses a system blur; web/Android get a dark translucent fill.
import React,{useEffect,useState} from 'react';
import {Keyboard,Platform,StyleSheet,Text,View,type StyleProp,type ViewStyle} from 'react-native';
import {Pressable} from './Touch';
import {BlurView} from 'expo-blur';
import {GlassView,isLiquidGlassAvailable} from 'expo-glass-effect';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon,type IconName} from './Icon';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import Svg,{Defs,LinearGradient,RadialGradient,Rect,Stop,Ellipse} from 'react-native-svg';

const liquid=(()=>{try{return Platform.OS==='ios'&&isLiquidGlassAvailable();}catch{return false;}})();
import {colors,metalHighlight} from './theme';
/** @deprecated read colors.accent so the bike's colour applies */
export const ACCENT='#6AA4FF';

/** Dark glass surface. Children sit on top. */
export function Glass({style,children,strong=false}:{style?:StyleProp<ViewStyle>;children?:React.ReactNode;strong?:boolean}){
 const edge={borderWidth:StyleSheet.hairlineWidth,borderColor:'rgba(255,255,255,0.09)'};
 if(liquid)return <GlassView glassEffectStyle="regular" colorScheme="dark" tintColor={strong?'rgba(8,9,12,0.55)':'rgba(8,9,12,0.3)'} style={[{overflow:'hidden'},edge,style]}>{children}</GlassView>;
 if(Platform.OS==='ios')return <BlurView intensity={strong?70:55} tint="systemChromeMaterialDark" style={[{overflow:'hidden'},edge,style]}><View style={[StyleSheet.absoluteFill,{backgroundColor:strong?'rgba(8,9,12,0.55)':'rgba(8,9,12,0.35)'}]}/>{children}</BlurView>;
 return <View style={[{overflow:'hidden',backgroundColor:'rgba(16,18,23,0.9)'},edge,style]}>{children}</View>;
}

/** Height of the keyboard while it is up, 0 otherwise. */
export function useKeyboardHeight(){
 const [h,setH]=useState(0);
 useEffect(()=>{const show=Platform.OS==='ios'?'keyboardWillShow':'keyboardDidShow',hide=Platform.OS==='ios'?'keyboardWillHide':'keyboardDidHide';
  const a=Keyboard.addListener(show,e=>setH(e.endCoordinates.height)),b=Keyboard.addListener(hide,()=>setH(0));return()=>{a.remove();b.remove();};},[]);
 return h;
}

export const TAB_H=62;
/** Space the floating tab bar takes at the bottom of the screen. */
export function useTabSpace(){const insets=useSafeAreaInsets();return tabBottom(insets.bottom)+TAB_H;}
const tabBottom=(inset:number)=>inset>0?inset-4:12;

const icons:Record<string,IconName>={Home:'home',Garage:'moto','Ask BAK':'chat',Community:'riders',Events:'flag'};
const labels:Record<string,string>={'Ask BAK':'Chat'};

/** Floating glass tab bar. The active tab gets a raked accent stripe, like a number-plate graphic. */
export function FloatingTabBar({state,navigation}:BottomTabBarProps){
 const insets=useSafeAreaInsets(),kb=useKeyboardHeight();
 if(kb>0)return null;
 const routes=state.routes.filter(r=>icons[r.name]);
 const current=state.routes[state.index]?.name;
 return <View pointerEvents="box-none" style={{position:'absolute',left:0,right:0,bottom:tabBottom(insets.bottom),alignItems:'center'}}>
  <View style={{width:'92%',maxWidth:460,borderRadius:TAB_H/2,shadowColor:'#000',shadowOpacity:0.5,shadowRadius:18,shadowOffset:{width:0,height:8}}}><TabGlow/><Glass strong style={{height:TAB_H,borderRadius:TAB_H/2,flexDirection:'row',alignItems:'center',paddingHorizontal:6}}>
   {routes.map(r=>{const on=r.name===current;
    return <Pressable key={r.key} haptic="select" accessibilityRole="tab" accessibilityState={{selected:on}} accessibilityLabel={labels[r.name]??r.name} onPress={()=>{const e=navigation.emit({type:'tabPress',target:r.key,canPreventDefault:true});if(!on&&!e.defaultPrevented)navigation.navigate(r.name as never);}} style={({pressed})=>({flex:1,alignItems:'center',justifyContent:'center',height:TAB_H,opacity:pressed?0.6:1})}>
     <View style={{marginBottom:5,height:3,width:16,opacity:on?1:0}}><TabMark/></View>
     <Icon name={icons[r.name]} size={24} color={on?'#f6f7f9':'#9ea6b3'} bg="#0d0f13" weight={on?1.9:1.6}/>
     <Text style={{color:on?'#f6f7f9':'#9ea6b3',fontSize:10.5,fontWeight:on?'800':'600',marginTop:2,letterSpacing:0.2}}>{labels[r.name]??r.name}</Text>
    </Pressable>;})}
  </Glass></View>
 </View>;
}

/** Active-tab stripe in the metal finish (drawn here: ui.tsx imports this file). */
function TabMark(){
 const id=React.useId().replace(/[^a-zA-Z0-9]/g,'');
 return <View style={{width:16,height:3,borderRadius:1,overflow:'hidden',transform:[{skewX:'-24deg'}]}}><Svg width={16} height={3}><Defs><LinearGradient id={'t'+id} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={metalHighlight()}/><Stop offset="0.5" stopColor={colors.accent}/><Stop offset="1" stopColor={colors.primary}/></LinearGradient></Defs><Rect x="0" y="0" width={16} height={3} fill={`url(#t${id})`}/></Svg></View>;
}
/** The bike's colour as a soft light under the floating tab bar: present, never loud. */
function TabGlow(){
 const id=React.useId().replace(/[^a-zA-Z0-9]/g,'');
 return <View pointerEvents="none" style={{position:'absolute',left:'-6%',right:'-6%',top:-26,bottom:-30}}>
  <Svg width="100%" height="100%"><Defs><RadialGradient id={'tg'+id} cx="50%" cy="55%" rx="50%" ry="50%">
   <Stop offset="0" stopColor={colors.glow} stopOpacity="0.20"/><Stop offset="0.55" stopColor={colors.glow} stopOpacity="0.07"/><Stop offset="1" stopColor={colors.glow} stopOpacity="0"/>
  </RadialGradient></Defs><Ellipse cx="50%" cy="55%" rx="50%" ry="50%" fill={`url(#tg${id})`}/></Svg>
 </View>;
}

/** Glass header background with a fine bottom edge. */
/** The top bar. Clear glass let big page titles show through it as you scrolled, so a title looked like it appeared twice and
 *  you couldn't tell where the page began. The bar is a dark, nearly solid frost: a hint of what's under it, never readable. */
export function GlassHeader(){
 const line={borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:'rgba(255,255,255,0.10)'};
 if(Platform.OS==='ios')return <BlurView intensity={80} tint="systemChromeMaterialDark" style={[StyleSheet.absoluteFill,{overflow:'hidden'},line]}><View style={[StyleSheet.absoluteFill,{backgroundColor:'rgba(6,7,9,0.86)'}]}/><HeaderEdge/></BlurView>;
 return <View style={[StyleSheet.absoluteFill,{backgroundColor:'rgba(6,7,9,0.96)'},line]}><HeaderEdge/></View>;
}
/** A faint wash of the bike's colour rising from the header's bottom edge, brightest in the middle. */
function HeaderEdge(){
 const id=React.useId().replace(/[^a-zA-Z0-9]/g,'');
 return <View pointerEvents="none" style={[StyleSheet.absoluteFill]}>
  <Svg width="100%" height="100%"><Defs>
   <LinearGradient id={'hv'+id} x1="0" y1="0" x2="0" y2="1"><Stop offset="0.35" stopColor={colors.glow} stopOpacity="0"/><Stop offset="1" stopColor={colors.glow} stopOpacity="0.10"/></LinearGradient>
   <LinearGradient id={'hl'+id} x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor={colors.accent} stopOpacity="0"/><Stop offset="0.5" stopColor={colors.accent} stopOpacity="0.55"/><Stop offset="1" stopColor={colors.accent} stopOpacity="0"/></LinearGradient>
  </Defs><Rect x="0" y="0" width="100%" height="100%" fill={`url(#hv${id})`}/><Rect x="0" y="99%" width="100%" height="1" fill={`url(#hl${id})`}/></Svg>
 </View>;
}

/** Header text button (Account). The icon prop is kept for callers but the label is what shows. */
export function HeaderButton({label,onPress}:{label:string;icon?:IconName;onPress:()=>void}){
 return <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={12} onPress={onPress} style={({pressed})=>({marginRight:18,paddingVertical:6,opacity:pressed?0.55:1})}><Text style={{color:'#f6f7f9',fontSize:16,fontWeight:'700',letterSpacing:0.1}}>{label}</Text></Pressable>;
}
