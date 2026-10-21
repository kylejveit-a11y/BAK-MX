// Pressable that gives a light haptic on every tap, so the whole app has the same touch feel.
// Pass haptic="select" for choices (tabs, chips, toggles), "press" for primary actions, or false for none.
import React,{forwardRef} from 'react';
import {Pressable as RNPressable,type PressableProps,type View} from 'react-native';
import {tap,press,select} from './haptics';
type Props=PressableProps&{haptic?:'tap'|'select'|'press'|false};
export const Pressable=forwardRef<View,Props>(function Pressable({haptic='tap',onPress,...rest},ref){
 const buzz=haptic==='select'?select:haptic==='press'?press:haptic===false?null:tap;
 return <RNPressable ref={ref} {...rest} onPress={onPress?(e=>{if(buzz)buzz();onPress(e);}):undefined}/>;
});
