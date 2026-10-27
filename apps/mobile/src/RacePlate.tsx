// The rider's race number on a small raked number plate, in the metal finish of their bike's colour.
import React from 'react';
import {Text,View} from 'react-native';
import Svg,{Defs,LinearGradient,Rect,Stop} from 'react-native-svg';
import {colors,metalHighlight} from './theme';

export function RacePlate({number,size=1}:{number:string;size?:number}){
 const id=React.useId().replace(/[^a-zA-Z0-9]/g,''),w=Math.round((20+number.length*13)*size),h=Math.round(30*size);
 return <View accessibilityLabel={`Race number ${number}`} style={{width:w,height:h,borderRadius:6*size,overflow:'hidden',transform:[{skewX:'-10deg'}],borderWidth:1,borderTopColor:'rgba(255,255,255,0.35)',borderLeftColor:'rgba(255,255,255,0.15)',borderRightColor:'rgba(0,0,0,0.3)',borderBottomColor:'rgba(0,0,0,0.5)'}}>
  <Svg width={w} height={h} style={{position:'absolute'}}><Defs><LinearGradient id={'p'+id} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={metalHighlight()}/><Stop offset="0.5" stopColor={colors.accent}/><Stop offset="1" stopColor={colors.primary}/></LinearGradient></Defs><Rect x="0" y="0" width={w} height={h} fill={`url(#p${id})`}/></Svg>
  <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text style={{color:'#0b0c10',fontSize:19*size,fontWeight:'900',fontStyle:'italic',letterSpacing:-0.5}}>{number}</Text></View>
 </View>;
}
