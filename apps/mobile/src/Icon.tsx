import React from 'react';
import Svg,{Circle,Path} from 'react-native-svg';
import {iconData} from './iconData';

export type IconName=keyof typeof iconData;
/** BAK MX line icons. One stroke weight everywhere; the accent fill marks goggles and flags. */
export function Icon({name,size=22,color='#f6f7f9',accent='#6AA4FF',bg='#121419',weight=1.7}:{name:IconName;size?:number;color?:string;accent?:string;bg?:string;weight?:number}){
 const shapes=iconData[name]??[];
 return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{position:'relative'}} accessibilityElementsHidden importantForAccessibility="no">
  {shapes.map((s,i)=>{const fill=s.fill==='a'?accent:s.fill==='s'?color:s.fill==='b'?bg:'none';const sw=(s.w??1.7)*(weight/1.7);
   return s.c?<Circle key={i} cx={s.c[0]} cy={s.c[1]} r={s.c[2]} fill={fill} stroke={color} strokeWidth={sw}/>
    :<Path key={i} d={s.d!} transform={s.t} fill={fill} stroke={sw?color:'none'} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>;})}
 </Svg>;
}
