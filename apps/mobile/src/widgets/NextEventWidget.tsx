// Home Screen and Lock Screen widget: the rider's next event they're going to or interested in (name, date, days until)
// and today's race-day status. Marked 'widget' like BikeWidget: the build turns the layout into a string that runs inside
// the widget, so it may only use its arguments and the SwiftUI components and modifiers.
import {Capsule,HStack,Image,Spacer,Text,VStack} from '@expo/ui/swift-ui';
import {background,clipShape,containerBackground,font,foregroundStyle,frame,kerning,lineLimit,minimumScaleFactor,monospacedDigit,padding,widgetURL} from '@expo/ui/swift-ui/modifiers';
import {createWidget,type WidgetEnvironment} from 'expo-widgets';
import type {NextEventProps} from '../widgetData';

export type {NextEventProps};

const NextEventLayout=(p:NextEventProps,env:WidgetEnvironment)=>{
 'widget';
 const text='#ffffff',soft='#e2e7ee',muted='#a7b0bd',accent='#6AA4FF',label='#8ab8ff',good='#bfe3c8';
 const steel={type:'linearGradient' as const,colors:['#20242b','#0c0e11','#020203'],startPoint:{x:0,y:0},endPoint:{x:1,y:1}};
 const family=env.widgetFamily;
 const url=p&&p.url?p.url:'bakmx://events';
 if(!p||!p.ready){
  return <VStack alignment="leading" spacing={8} modifiers={[frame({maxWidth:10000,maxHeight:10000,alignment:'topLeading'}),containerBackground(steel,'widget'),widgetURL('bakmx://events')]}>
   <Text modifiers={[font({size:12,weight:'heavy'}),foregroundStyle(soft),kerning(1)]}>BAK MX</Text>
   <Spacer/>
   <Text modifiers={[font({size:15,weight:'semibold'}),foregroundStyle(text),lineLimit(3)]}>Open BAK MX to see your next event.</Text>
  </VStack>;
 }
 if(family==='accessoryRectangular'){
  return <VStack alignment="leading" spacing={1} modifiers={[containerBackground('clear','widget'),widgetURL(url)]}>
   {p.raceLive?<Text modifiers={[font({size:13,weight:'bold'}),lineLimit(1)]}>{p.race}</Text>:null}
   <Text modifiers={[font({size:p.raceLive?12:13,weight:p.raceLive?'semibold':'bold'}),lineLimit(1)]}>{p.hasEvent?p.name:'No event saved'}</Text>
   <Text modifiers={[font({size:12}),lineLimit(1)]}>{p.hasEvent?p.daysText+' · '+p.when:'Mark one Going in Events'}</Text>
   {!p.raceLive&&p.race?<Text modifiers={[font({size:12}),lineLimit(1)]}>{p.race}</Text>:null}
  </VStack>;
 }
 const days=p.hasEvent?(p.days===0?'TODAY':p.daysText==='On now'?'NOW':String(p.days)):'—';
 const daysUnit=p.hasEvent&&p.days>0&&p.daysText!=='On now'?(p.days===1?'DAY':'DAYS'):'';
 const statusPill=p.race?<HStack spacing={5} modifiers={[padding({horizontal:9,vertical:5}),background(p.raceLive?'#2f6fd6':'rgba(106,164,255,0.24)'),clipShape('capsule')]}>
  <Image systemName="flag.checkered" size={10} color={text}/>
  <Text modifiers={[font({size:11.5,weight:'semibold'}),foregroundStyle(text),lineLimit(1),minimumScaleFactor(0.7)]}>{p.race}</Text>
 </HStack>:<Text modifiers={[font({size:11.5,weight:'medium'}),foregroundStyle(muted),lineLimit(1)]}>No race day set</Text>;
 const count=<HStack alignment="lastTextBaseline" spacing={4}>
  <Text modifiers={[font({size:family==='systemSmall'?36:42,weight:'heavy'}),foregroundStyle(text),monospacedDigit(),minimumScaleFactor(0.5),lineLimit(1)]}>{days}</Text>
  {daysUnit?<Text modifiers={[font({size:12,weight:'heavy'}),foregroundStyle(accent),kerning(0.8)]}>{daysUnit}</Text>:null}
 </HStack>;
 const head=<HStack spacing={6}>
  <Text modifiers={[font({size:9.5,weight:'heavy'}),foregroundStyle(label),kerning(1),lineLimit(1)]}>NEXT EVENT</Text>
  <Spacer/>
  {p.rsvp?<Text modifiers={[font({size:9.5,weight:'heavy'}),foregroundStyle(p.rsvp==='Going'?good:muted),kerning(0.6),lineLimit(1)]}>{p.rsvp.toUpperCase()}</Text>:null}
 </HStack>;
 if(family==='systemSmall'){
  return <VStack alignment="leading" spacing={3} modifiers={[frame({maxWidth:10000,maxHeight:10000,alignment:'topLeading'}),containerBackground(steel,'widget'),widgetURL(url)]}>
   {head}
   <Spacer/>
   {count}
   <Text modifiers={[font({size:13,weight:'semibold'}),foregroundStyle(soft),lineLimit(2),minimumScaleFactor(0.75)]}>{p.hasEvent?p.name:'Mark an event Going or Interested'}</Text>
   {p.hasEvent?<Text modifiers={[font({size:11.5,weight:'medium'}),foregroundStyle(muted),lineLimit(1)]}>{p.when}</Text>:null}
   <Spacer/>
   {p.race?statusPill:null}
  </VStack>;
 }
 return <HStack alignment="top" spacing={12} modifiers={[containerBackground(steel,'widget'),widgetURL(url)]}>
  <VStack alignment="leading" spacing={3} modifiers={[frame({maxWidth:10000,maxHeight:10000,alignment:'topLeading'})]}>
   {head}
   <Spacer/>
   <Capsule modifiers={[frame({width:20,height:3}),foregroundStyle(accent),padding({bottom:5})]}/>
   {count}
   <Text modifiers={[font({size:12,weight:'semibold'}),foregroundStyle(accent),lineLimit(1)]}>{p.hasEvent?p.daysText:''}</Text>
  </VStack>
  <VStack alignment="leading" spacing={5} modifiers={[frame({maxWidth:10000,maxHeight:10000,alignment:'topLeading'}),padding({all:12}),background({type:'linearGradient',colors:['rgba(255,255,255,0.12)','rgba(255,255,255,0.04)'],startPoint:{x:0,y:0},endPoint:{x:0,y:1}}),clipShape('roundedRectangle',16)]}>
   <Text modifiers={[font({size:9.5,weight:'heavy'}),foregroundStyle(label),kerning(1),lineLimit(1)]}>{p.hasEvent?(p.type||'EVENT').toUpperCase():'EVENTS'}</Text>
   <Text modifiers={[font({size:15,weight:'semibold'}),foregroundStyle(text),lineLimit(2),minimumScaleFactor(0.8)]}>{p.hasEvent?p.name:'Nothing saved yet'}</Text>
   <Text modifiers={[font({size:11.5,weight:'medium'}),foregroundStyle(muted),lineLimit(2),minimumScaleFactor(0.8)]}>{p.hasEvent?p.when+' · '+p.time+(p.place?' · '+p.place:''):'Mark an event Going or Interested in Events.'}</Text>
   <Spacer/>
   {statusPill}
  </VStack>
 </HStack>;
};

/** Created on first use (inside a try), never at import, so a missing native module can't crash startup. */
export const makeNextEventWidget=()=>createWidget<NextEventProps>('NextEventWidget',NextEventLayout);
