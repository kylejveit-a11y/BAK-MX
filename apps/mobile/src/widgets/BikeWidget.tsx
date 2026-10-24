// Home Screen and Lock Screen widget: the active bike, its hours, what service is next and the last setup change.
// The layout function is marked 'widget': the build turns it into a string that runs inside the widget itself,
// so it may only use its arguments and the SwiftUI components and modifiers (no outside helpers or constants).
import {HStack,Image,ProgressView,Spacer,Text,VStack} from '@expo/ui/swift-ui';
import {aspectRatio,background,clipShape,containerBackground,font,foregroundStyle,frame,kerning,lineLimit,minimumScaleFactor,monospacedDigit,padding,resizable,tint,widgetURL} from '@expo/ui/swift-ui/modifiers';
import {createWidget,type WidgetEnvironment} from 'expo-widgets';

export type BikeWidgetProps={ready:boolean;logo:string;bike:string;hours:string;hoursSet:boolean;next:string;nextSet:boolean;nextUrgent:boolean;nextProgress:number;change:string;changeSet:boolean;changeWhen:string};

const BikeWidgetLayout=(p:BikeWidgetProps,env:WidgetEnvironment)=>{
 'widget';
 const text='#f5f7fa',soft='#b4bcc8',muted='#7f8794',accent='#6AA4FF',urgent='#f4a3ae';
 // Brushed-steel dark: lighter top-left falling to near black, like the logo plate.
 const steel={type:'linearGradient' as const,colors:['#2b3039','#15181d','#08090b'],startPoint:{x:0,y:0},endPoint:{x:1,y:1}};
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
   <Text modifiers={[font({size:12}),lineLimit(1)]}>{p.next}</Text>
   <Text modifiers={[font({size:12}),monospacedDigit(),lineLimit(1)]}>{p.hoursSet?p.hours+' hours':'Hours not set'}</Text>
  </VStack>;
 }
 if(family==='accessoryInline'){
  return <Text modifiers={[widgetURL('bakmx://service')]}>{p.next}</Text>;
 }
 const pillColor=p.nextUrgent?urgent:p.nextSet?accent:muted;
 const hours=<HStack alignment="lastTextBaseline" spacing={4}>
  <Text modifiers={[font({size:family==='systemSmall'?38:42,weight:'heavy'}),foregroundStyle(text),monospacedDigit(),minimumScaleFactor(0.6),lineLimit(1)]}>{p.hours}</Text>
  <Text modifiers={[font({size:11,weight:'heavy'}),foregroundStyle(muted),kerning(0.8)]}>HRS</Text>
 </HStack>;
 const pill=<HStack spacing={5} modifiers={[padding({horizontal:9,vertical:5}),background(p.nextUrgent?'rgba(244,163,174,0.16)':p.nextSet?'rgba(106,164,255,0.15)':'rgba(255,255,255,0.07)'),clipShape('capsule')]}>
  <Image systemName={p.nextSet?'wrench.and.screwdriver.fill':'plus'} size={10} color={pillColor}/>
  <Text modifiers={[font({size:11.5,weight:'semibold'}),foregroundStyle(p.nextSet?text:soft),lineLimit(1),minimumScaleFactor(0.7)]}>{p.next}</Text>
 </HStack>;
 const left=<VStack alignment="leading" spacing={0}>
  {logo}
  <Spacer/>
  <Text modifiers={[font({size:12.5,weight:'semibold'}),foregroundStyle(soft),lineLimit(1),minimumScaleFactor(0.75)]}>{p.bike}</Text>
  {hours}
  <Spacer/>
  {pill}
 </VStack>;
 if(family==='systemSmall'){
  return <VStack alignment="leading" modifiers={[frame({maxWidth:10000,maxHeight:10000,alignment:'topLeading'}),containerBackground(steel,'widget'),widgetURL('bakmx://service')]}>{left}</VStack>;
 }
 return <HStack alignment="top" spacing={12} modifiers={[containerBackground(steel,'widget'),widgetURL('bakmx://service')]}>
  <VStack alignment="leading" modifiers={[frame({maxWidth:10000,maxHeight:10000,alignment:'topLeading'})]}>{left}</VStack>
  <VStack alignment="leading" spacing={5} modifiers={[frame({maxWidth:10000,maxHeight:10000,alignment:'topLeading'}),padding({all:12}),background({type:'linearGradient',colors:['rgba(255,255,255,0.09)','rgba(255,255,255,0.025)'],startPoint:{x:0,y:0},endPoint:{x:0,y:1}}),clipShape('roundedRectangle',16)]}>
   <Text modifiers={[font({size:9.5,weight:'heavy'}),foregroundStyle(muted),kerning(1)]}>LAST SETUP CHANGE</Text>
   <Text modifiers={[font({size:14.5,weight:'semibold'}),foregroundStyle(p.changeSet?text:soft),lineLimit(3),minimumScaleFactor(0.8)]}>{p.change}</Text>
   <Text modifiers={[font({size:11}),foregroundStyle(muted),lineLimit(1)]}>{p.changeWhen}</Text>
   <Spacer/>
   {p.nextProgress>=0?<VStack alignment="leading" spacing={4}>
    <Text modifiers={[font({size:9.5,weight:'heavy'}),foregroundStyle(muted),kerning(1)]}>SERVICE INTERVAL</Text>
    <ProgressView value={p.nextProgress} modifiers={[tint(p.nextUrgent?urgent:accent)]}/>
   </VStack>:null}
  </VStack>
 </HStack>;
};

/** Created on first use (inside a try), never at import, so a missing native module can't crash startup. */
export const makeBikeWidget=()=>createWidget<BikeWidgetProps>('BikeWidget',BikeWidgetLayout);
