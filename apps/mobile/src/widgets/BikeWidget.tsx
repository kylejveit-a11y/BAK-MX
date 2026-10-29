// Home Screen and Lock Screen widget: the active bike, its hours, what service is next and the last setup change.
// The layout function is marked 'widget': the build turns it into a string that runs inside the widget itself,
// so it may only use its arguments and the SwiftUI components and modifiers (no outside helpers or constants).
import {Capsule,HStack,Image,ProgressView,Spacer,Text,VStack} from '@expo/ui/swift-ui';
import {aspectRatio,background,clipShape,containerBackground,font,foregroundStyle,frame,kerning,lineLimit,minimumScaleFactor,monospacedDigit,padding,resizable,tint,widgetURL} from '@expo/ui/swift-ui/modifiers';
import {createWidget,type WidgetEnvironment} from 'expo-widgets';

export type BikeWidgetProps={ready:boolean;logo:string;bike:string;hours:string;hoursSet:boolean;next:string;nextSet:boolean;nextUrgent:boolean;nextProgress:number;change:string;changeSet:boolean;changeWhen:string;raceSet?:boolean;raceTrack?:string;raceWhen?:string;raceProgress?:number;raceDone?:string};

const BikeWidgetLayout=(p:BikeWidgetProps,env:WidgetEnvironment)=>{
 'widget';
 const text='#ffffff',soft='#e2e7ee',muted='#a7b0bd',accent='#6AA4FF',label='#8ab8ff',urgent='#ff8f9e';
 // Brushed-steel dark: lighter top-left falling to near black, like the logo plate.
 const steel={type:'linearGradient' as const,colors:['#20242b','#0c0e11','#020203'],startPoint:{x:0,y:0},endPoint:{x:1,y:1}};
 const family=env.widgetFamily;
 const logo=p&&p.logo?<Image uiImage={p.logo} modifiers={[resizable(),aspectRatio({ratio:900/139,contentMode:'fit'}),frame({height:family==='systemSmall'?13:14})]}/>:<Text modifiers={[font({size:12,weight:'heavy'}),foregroundStyle(soft),kerning(1)]}>BAK MX</Text>;
 if(!p||!p.ready){
  return <VStack alignment="leading" spacing={8} modifiers={[frame({maxWidth:10000,maxHeight:10000,alignment:'topLeading'}),containerBackground(steel,'widget'),widgetURL('bakmx://open')]}>
   {logo}
   <Spacer/>
   <Text modifiers={[font({size:15,weight:'semibold'}),foregroundStyle(text),lineLimit(3)]}>Open BAK MX and pick your bike.</Text>
  </VStack>;
 }
 if(family==='accessoryRectangular'){
  return <VStack alignment="leading" spacing={1} modifiers={[containerBackground('clear','widget'),widgetURL('bakmx://service')]}>
   <Text modifiers={[font({size:13,weight:'bold'}),lineLimit(1)]}>{p.bike}</Text>
   {p.raceSet?<Text modifiers={[font({size:12,weight:'semibold'}),lineLimit(1)]}>{p.raceWhen+' · '+p.raceTrack}</Text>:null}
   <Text modifiers={[font({size:12}),lineLimit(1)]}>{p.next}</Text>
   <Text modifiers={[font({size:12}),monospacedDigit(),lineLimit(1)]}>{p.hoursSet?p.hours+' hours':'Hours not set'}</Text>
  </VStack>;
 }
 if(family==='accessoryInline'){
  return <Text modifiers={[widgetURL('bakmx://service')]}>{p.raceSet?p.raceWhen+' · '+p.raceTrack:p.next}</Text>;
 }
 const pillColor=p.nextSet?text:'#9cc4ff';
 const hours=<HStack alignment="lastTextBaseline" spacing={4}>
  <Text modifiers={[font({size:family==='systemSmall'?38:42,weight:'heavy'}),foregroundStyle(text),monospacedDigit(),minimumScaleFactor(0.6),lineLimit(1)]}>{p.hours}</Text>
  <Text modifiers={[font({size:12,weight:'heavy'}),foregroundStyle(accent),kerning(0.8)]}>HRS</Text>
 </HStack>;
 const pill=<HStack spacing={5} modifiers={[padding({horizontal:9,vertical:5}),background(p.nextUrgent?'#b23a4b':p.nextSet?'#2f6fd6':'rgba(106,164,255,0.24)'),clipShape('capsule')]}>
  <Image systemName={p.nextSet?'wrench.and.screwdriver.fill':'plus'} size={10} color={pillColor}/>
  <Text modifiers={[font({size:11.5,weight:'semibold'}),foregroundStyle(text),lineLimit(1),minimumScaleFactor(0.7)]}>{p.next}</Text>
 </HStack>;
 const racePill=<HStack spacing={5} modifiers={[padding({horizontal:9,vertical:5}),background('rgba(106,164,255,0.24)'),clipShape('capsule')]}>
  <Image systemName="flag.checkered" size={10} color={text}/>
  <Text modifiers={[font({size:11.5,weight:'semibold'}),foregroundStyle(text),lineLimit(1),minimumScaleFactor(0.7)]}>{p.raceWhen}</Text>
 </HStack>;
 const left=<VStack alignment="leading" spacing={0}>
  {logo}
  <Spacer/>
  <Capsule modifiers={[frame({width:20,height:3}),foregroundStyle(accent),padding({bottom:5})]}/>
  <Text modifiers={[font({size:13,weight:'semibold'}),foregroundStyle(soft),lineLimit(1),minimumScaleFactor(0.75)]}>{p.bike}</Text>
  {hours}
  <Spacer/>
  {family==='systemSmall'&&p.raceSet?racePill:pill}
 </VStack>;
 if(family==='systemSmall'){
  return <VStack alignment="leading" modifiers={[frame({maxWidth:10000,maxHeight:10000,alignment:'topLeading'}),containerBackground(steel,'widget'),widgetURL('bakmx://service')]}>{left}</VStack>;
 }
 return <HStack alignment="top" spacing={12} modifiers={[containerBackground(steel,'widget'),widgetURL('bakmx://service')]}>
  <VStack alignment="leading" modifiers={[frame({maxWidth:10000,maxHeight:10000,alignment:'topLeading'})]}>{left}</VStack>
  <VStack alignment="leading" spacing={5} modifiers={[frame({maxWidth:10000,maxHeight:10000,alignment:'topLeading'}),padding({all:12}),background({type:'linearGradient',colors:['rgba(255,255,255,0.12)','rgba(255,255,255,0.04)'],startPoint:{x:0,y:0},endPoint:{x:0,y:1}}),clipShape('roundedRectangle',16)]}>
   {p.raceSet?<VStack alignment="leading" spacing={5}>
    <Text modifiers={[font({size:9.5,weight:'heavy'}),foregroundStyle(label),kerning(1)]}>NEXT RACE</Text>
    <Text modifiers={[font({size:15,weight:'semibold'}),foregroundStyle(text),lineLimit(2),minimumScaleFactor(0.8)]}>{p.raceTrack}</Text>
    <Text modifiers={[font({size:12.5,weight:'bold'}),foregroundStyle(accent),lineLimit(1),minimumScaleFactor(0.8)]}>{p.raceWhen}</Text>
   </VStack>:<VStack alignment="leading" spacing={5}>
    <Text modifiers={[font({size:9.5,weight:'heavy'}),foregroundStyle(label),kerning(1)]}>LAST SETUP CHANGE</Text>
    <Text modifiers={[font({size:15,weight:'semibold'}),foregroundStyle(p.changeSet?text:soft),lineLimit(3),minimumScaleFactor(0.8)]}>{p.change}</Text>
    <Text modifiers={[font({size:11.5,weight:'medium'}),foregroundStyle(muted),lineLimit(1),minimumScaleFactor(0.8)]}>{p.changeWhen}</Text>
   </VStack>}
   <Spacer/>
   {p.raceSet&&p.raceProgress!==undefined&&p.raceProgress>=0?<VStack alignment="leading" spacing={4}>
    <Text modifiers={[font({size:9.5,weight:'heavy'}),foregroundStyle(label),kerning(1)]}>{(p.raceDone||'PREP').toUpperCase()}</Text>
    <ProgressView value={p.raceProgress} modifiers={[tint(accent)]}/>
   </VStack>:p.nextProgress>=0?<VStack alignment="leading" spacing={4}>
    <Text modifiers={[font({size:9.5,weight:'heavy'}),foregroundStyle(label),kerning(1)]}>SERVICE INTERVAL</Text>
    <ProgressView value={p.nextProgress} modifiers={[tint(p.nextUrgent?urgent:accent)]}/>
   </VStack>:null}
  </VStack>
 </HStack>;
};

/** Created on first use (inside a try), never at import, so a missing native module can't crash startup. */
export const makeBikeWidget=()=>createWidget<BikeWidgetProps>('BikeWidget',BikeWidgetLayout);
