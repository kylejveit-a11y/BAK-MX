// Copying text out of the app. Press and hold any answer, spec or note to copy it; the buttons that say Copy do the
// same with one tap. A short "Copied" note confirms it, because iOS gives no sign of its own.
import React,{useEffect,useState} from 'react';
import {AccessibilityInfo,Text,View,type TextProps} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {success} from './haptics';

const hearers=new Set<(what:string)=>void>();
/** Flatten what a Text shows into the plain words a rider would expect to paste. */
export function textOf(node:React.ReactNode):string{
 if(node==null||typeof node==='boolean')return '';
 if(typeof node==='string'||typeof node==='number')return String(node);
 if(Array.isArray(node))return node.map(textOf).join('');
 if(React.isValidElement(node))return textOf((node.props as {children?:React.ReactNode}).children);
 return '';
}
export function copyText(text:string,what='Copied'){
 const clean=text.replace(/ /g,' ').trim();if(!clean)return;
 void Clipboard.setStringAsync(clean).then(()=>{success();hearers.forEach(f=>f(what));AccessibilityInfo.announceForAccessibility(what);}).catch(()=>{});
}
/** Mounted once at the top of the app. */
export function CopiedToast(){
 const [what,setWhat]=useState(''),top=useSafeAreaInsets().top;
 useEffect(()=>{let t:ReturnType<typeof setTimeout>|undefined;const hear=(w:string)=>{setWhat(w);if(t)clearTimeout(t);t=setTimeout(()=>setWhat(''),1600);};hearers.add(hear);return()=>{hearers.delete(hear);if(t)clearTimeout(t);};},[]);
 if(!what)return null;
 return <View pointerEvents="none" style={{position:'absolute',top:top+10,left:0,right:0,alignItems:'center',zIndex:1000}}>
  <View style={{paddingHorizontal:16,paddingVertical:9,borderRadius:18,backgroundColor:'#1b2029',borderWidth:1,borderColor:'#343b47'}}><Text style={{color:'#f6f7f9',fontSize:14.5,fontWeight:'700'}}>{what}</Text></View>
 </View>;
}
/** A Text the rider can press and hold to copy (iOS's own text selection does not work reliably inside the app's scrolling screens). */
export function CopyText({children,onLongPress,...rest}:TextProps){
 return <Text {...rest} onLongPress={onLongPress??(()=>copyText(textOf(children)))}>{children}</Text>;
}
