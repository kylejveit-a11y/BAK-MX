// The trail lines drawn on a plain dark background: the website, and Android builds without a Google Maps key.
// Same colours and legend as the map, so a rider reads both the same way.
import React,{useState} from 'react';
import {View} from 'react-native';
import Svg,{Polyline} from 'react-native-svg';
import {trailName,widthColor,type TrailLine} from '../../../shared/where-to-ride';

export function boundsOf(lines:TrailLine[]){
 let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
 for(const l of lines)for(const [x,y] of l.line){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;}
 return {minX,minY,maxX,maxY};
}

export function TrailDiagram({lines,height=420,selected,onSelect}:{lines:TrailLine[];height?:number;selected?:string|null;onSelect?:(name:string)=>void}){
 const [w,setW]=useState(0);
 const b=boundsOf(lines),k=Math.cos(((b.minY+b.maxY)/2)*Math.PI/180);
 const spanX=Math.max((b.maxX-b.minX)*k,1e-6),spanY=Math.max(b.maxY-b.minY,1e-6),pad=14;
 const scale=w?Math.min((w-pad*2)/spanX,(height-pad*2)/spanY):0;
 const ox=(w-spanX*scale)/2,oy=(height-spanY*scale)/2;
 const pt=([x,y]:[number,number])=>`${(ox+(x-b.minX)*k*scale).toFixed(1)},${(oy+(b.maxY-y)*scale).toFixed(1)}`;
 return <View onLayout={e=>setW(e.nativeEvent.layout.width)} style={{height,borderRadius:18,backgroundColor:'#0b0d11',borderWidth:1,borderColor:'#232832',overflow:'hidden'}}>
  {!!w&&<Svg width={w} height={height}>
   {lines.map(l=>{const n=trailName(l),on=selected===n;return <Polyline key={l.id} points={l.line.map(pt).join(' ')} fill="none" stroke={widthColor(l.width)} strokeOpacity={selected&&!on?0.35:1} strokeWidth={on?4.5:3} strokeLinejoin="round" strokeLinecap="round" onPress={onSelect?()=>onSelect(n):undefined}/>;})}
  </Svg>}
 </View>;
}
