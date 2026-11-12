// Android home-screen widgets: "Your bike" and "Next event". Same content as the iPhone widgets, drawn with Android's
// widget views (no SwiftUI on Android). Brushed dark steel, BAK blue accents, real BAK MX wordmark.
import React from 'react';
import {FlexWidget,ImageWidget,TextWidget} from 'react-native-android-widget';
import type {bikeWidgetProps,NextEventProps} from '../widgetData';

type BikeProps=ReturnType<typeof bikeWidgetProps>&{raceSet?:boolean;raceTrack?:string;raceWhen?:string;raceDone?:string};
const C={text:'#ffffff',soft:'#e2e7ee',muted:'#a7b0bd',accent:'#6AA4FF',label:'#8ab8ff',urgent:'#ff8f9e',pill:'#2f6fd6',pillSoft:'#23395c',pillUrgent:'#b23a4b'} as const;
const steel={from:'#20242b',to:'#020203',orientation:'TL_BR'} as const;
const logo=require('../../assets/bak-mx-wordmark.png');

function Logo(){return <ImageWidget image={logo} imageWidth={84} imageHeight={13}/>;}
function Label({children}:{children:string}){return <TextWidget text={children} style={{fontSize:10,fontWeight:'800',color:C.label,letterSpacing:0.08}}/>;}

export function BikeWidgetAndroid({p,wide}:{p:BikeProps;wide:boolean}){
 if(!p.ready){
  return <FlexWidget clickAction="OPEN_URI" clickActionData={{uri:'bakmx://open'}} style={{height:'match_parent',width:'match_parent',padding:14,borderRadius:22,backgroundGradient:steel,flexDirection:'column',justifyContent:'space-between'}}>
   <Logo/>
   <TextWidget text="Open BAK MX and pick your bike." maxLines={3} style={{fontSize:15,fontWeight:'600',color:C.text}}/>
  </FlexWidget>;
 }
 const pillBg=p.nextUrgent?C.pillUrgent:p.nextSet?C.pill:C.pillSoft;
 const left=<FlexWidget style={{flex:1,height:'match_parent',flexDirection:'column',justifyContent:'space-between'}}>
  <Logo/>
  <FlexWidget style={{flexDirection:'column'}}>
   <TextWidget text={p.bike} maxLines={wide?2:1} truncate="END" style={{fontSize:wide?12.5:13,fontWeight:'600',color:C.soft}}/>
   <FlexWidget style={{flexDirection:'row',alignItems:'flex-end'}}>
    <TextWidget text={p.hours} style={{fontSize:wide?40:36,fontWeight:'900',color:C.text}}/>
    <TextWidget text=" HRS" style={{fontSize:12,fontWeight:'900',color:C.accent,paddingBottom:7}}/>
   </FlexWidget>
  </FlexWidget>
  <FlexWidget style={{paddingHorizontal:10,paddingVertical:5,borderRadius:14,backgroundColor:(!wide&&p.raceSet)?C.pillSoft:pillBg}}>
   <TextWidget text={(!wide&&p.raceSet)?(p.raceWhen??''):p.next} maxLines={wide?2:1} truncate="END" style={{fontSize:wide?11.5:12,fontWeight:'600',color:C.text}}/>
  </FlexWidget>
 </FlexWidget>;
 return <FlexWidget clickAction="OPEN_URI" clickActionData={{uri:'bakmx://service'}} style={{height:'match_parent',width:'match_parent',padding:14,borderRadius:22,backgroundGradient:steel,flexDirection:'row',flexGap:12}}>
  {left}
  {wide?<FlexWidget style={{flex:1,height:'match_parent',padding:12,borderRadius:16,backgroundColor:'#ffffff14',flexDirection:'column',justifyContent:'space-between'}}>
   {p.raceSet?<FlexWidget style={{flexDirection:'column',flexGap:4}}>
    <Label>NEXT RACE</Label>
    <TextWidget text={p.raceTrack??''} maxLines={2} truncate="END" style={{fontSize:15,fontWeight:'600',color:C.text}}/>
    <TextWidget text={p.raceWhen??''} maxLines={1} style={{fontSize:13,fontWeight:'700',color:C.accent}}/>
   </FlexWidget>:<FlexWidget style={{flexDirection:'column',flexGap:4}}>
    <Label>LAST SETUP CHANGE</Label>
    <TextWidget text={p.change} maxLines={3} truncate="END" style={{fontSize:14,fontWeight:'600',color:p.changeSet?C.text:C.soft}}/>
    <TextWidget text={p.changeWhen} maxLines={1} style={{fontSize:11.5,color:C.muted}}/>
   </FlexWidget>}
   {p.raceSet&&p.raceDone?<Label>{p.raceDone.toUpperCase()}</Label>:<TextWidget text=" " style={{fontSize:4}}/>}
  </FlexWidget>:null}
 </FlexWidget>;
}

export function NextEventWidgetAndroid({p}:{p:NextEventProps}){
 const shell={height:'match_parent' as const,width:'match_parent' as const,padding:14,borderRadius:22,backgroundGradient:steel,flexDirection:'column' as const,justifyContent:'space-between' as const};
 if(!p.ready){
  return <FlexWidget clickAction="OPEN_URI" clickActionData={{uri:'bakmx://events'}} style={shell}>
   <Logo/>
   <TextWidget text="Open BAK MX to see your next event." maxLines={3} style={{fontSize:15,fontWeight:'600',color:C.text}}/>
  </FlexWidget>;
 }
 if(!p.hasEvent){
  return <FlexWidget clickAction="OPEN_URI" clickActionData={{uri:p.url}} style={shell}>
   <Logo/>
   <FlexWidget style={{flexDirection:'column',flexGap:4}}>
    {p.race?<TextWidget text={p.race} maxLines={2} style={{fontSize:14,fontWeight:'700',color:C.accent}}/>:null}
    <TextWidget text="No events yet. Find a ride day or race in Events." maxLines={3} style={{fontSize:13.5,fontWeight:'600',color:C.text}}/>
   </FlexWidget>
  </FlexWidget>;
 }
 return <FlexWidget clickAction="OPEN_URI" clickActionData={{uri:p.url}} style={shell}>
  <FlexWidget style={{flexDirection:'row',justifyContent:'space-between',width:'match_parent'}}>
   <Logo/>
   <TextWidget text={p.rsvp.toUpperCase()} style={{fontSize:10,fontWeight:'800',color:C.label}}/>
  </FlexWidget>
  <FlexWidget style={{flexDirection:'column',flexGap:2}}>
   <TextWidget text={p.daysText} style={{fontSize:26,fontWeight:'900',color:C.text}}/>
   <TextWidget text={p.name} maxLines={2} truncate="END" style={{fontSize:14,fontWeight:'600',color:C.soft}}/>
   <TextWidget text={[p.when,p.time,p.place].filter(Boolean).join(' · ')} maxLines={1} truncate="END" style={{fontSize:11.5,color:C.muted}}/>
  </FlexWidget>
  {p.race?<TextWidget text={p.race} maxLines={1} truncate="END" style={{fontSize:12,fontWeight:'700',color:C.accent}}/>:<TextWidget text={p.type} style={{fontSize:11.5,fontWeight:'600',color:C.label}}/>}
 </FlexWidget>;
}
