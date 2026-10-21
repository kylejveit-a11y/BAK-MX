// Floating chrome: the header, tab bar and message boxes hover over the content as dark glass.
// iOS 26+ uses Apple's Liquid Glass; older iOS uses a system blur; web/Android get a dark translucent fill.
import React,{useEffect,useState} from 'react';
import {Keyboard,Platform,Pressable,StyleSheet,Text,View,type StyleProp,type ViewStyle} from 'react-native';
import {BlurView} from 'expo-blur';
import {GlassView,isLiquidGlassAvailable} from 'expo-glass-effect';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon,type IconName} from './Icon';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';

const liquid=(()=>{try{return Platform.OS==='ios'&&isLiquidGlassAvailable();}catch{return false;}})();
export const ACCENT='#8cb6ee';

/** Dark glass surface. Children sit on top. */
export function Glass({style,children,strong=false}:{style?:StyleProp<ViewStyle>;children?:React.ReactNode;strong?:boolean}){
 const edge={borderWidth:StyleSheet.hairlineWidth,borderColor:'rgba(255,255,255,0.09)'};
 if(liquid)return <GlassView glassEffectStyle="regular" colorScheme="dark" tintColor={strong?'rgba(8,9,12,0.55)':'rgba(8,9,12,0.3)'} style={[{overflow:'hidden'},edge,style]}>{children}</GlassView>;
 if(Platform.OS==='ios')return <BlurView intensity={strong?70:55} tint="systemChromeMaterialDark" style={[{overflow:'hidden'},edge,style]}><View style={[StyleSheet.absoluteFill,{backgroundColor:strong?'rgba(6,6,9,0.55)':'rgba(6,6,9,0.35)'}]}/>{children}</BlurView>;
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
  <View style={{width:'92%',maxWidth:460,borderRadius:TAB_H/2,shadowColor:'#000',shadowOpacity:0.5,shadowRadius:18,shadowOffset:{width:0,height:8}}}><Glass strong style={{height:TAB_H,borderRadius:TAB_H/2,flexDirection:'row',alignItems:'center',paddingHorizontal:6}}>
   {routes.map(r=>{const on=r.name===current;
    return <Pressable key={r.key} accessibilityRole="tab" accessibilityState={{selected:on}} accessibilityLabel={labels[r.name]??r.name} onPress={()=>{const e=navigation.emit({type:'tabPress',target:r.key,canPreventDefault:true});if(!on&&!e.defaultPrevented)navigation.navigate(r.name as never);}} style={({pressed})=>({flex:1,alignItems:'center',justifyContent:'center',height:TAB_H,opacity:pressed?0.6:1})}>
     <View style={{height:3,width:16,marginBottom:5,borderRadius:1,backgroundColor:on?ACCENT:'transparent',transform:[{skewX:'-24deg'}]}}/>
     <Icon name={icons[r.name]} size={24} color={on?'#f6f7f9':'#8b93a1'} bg="#0d0f13" weight={on?1.9:1.6}/>
     <Text style={{color:on?'#f6f7f9':'#8b93a1',fontSize:10.5,fontWeight:on?'800':'600',marginTop:2,letterSpacing:0.2}}>{labels[r.name]??r.name}</Text>
    </Pressable>;})}
  </Glass></View>
 </View>;
}

/** Glass header background with a fine bottom edge. */
export function GlassHeader(){return <Glass strong style={[StyleSheet.absoluteFill,{borderWidth:0,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:'rgba(255,255,255,0.08)'}]}/>;}

/** Small round glass button for the header (Account). */
export function HeaderButton({label,icon,onPress}:{label:string;icon:IconName;onPress:()=>void}){
 return <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={10} onPress={onPress} style={({pressed})=>({marginRight:14,opacity:pressed?0.6:1})}><Glass style={{width:40,height:40,borderRadius:20,alignItems:'center',justifyContent:'center'}}><Icon name={icon} size={24} color="#f6f7f9" bg="#0d0f13"/></Glass></Pressable>;
}
