// Home Screen and Lock Screen widget: the active bike, its hours, what service is next and the last setup change.
// The layout function is marked 'widget': the build turns it into a string that runs inside the widget itself,
// so it may only use its arguments and the SwiftUI components and modifiers (no outside helpers or constants).
import {HStack,Image,Spacer,Text,VStack} from '@expo/ui/swift-ui';
import {containerBackground,font,foregroundStyle,frame,lineLimit,minimumScaleFactor,monospacedDigit,padding,widgetURL} from '@expo/ui/swift-ui/modifiers';
import {createWidget,type WidgetEnvironment} from 'expo-widgets';

export type BikeWidgetProps={ready:boolean;bike:string;hours:string;next:string;nextUrgent:boolean;change:string;changeWhen:string};

const BikeWidgetLayout=(p:BikeWidgetProps,env:WidgetEnvironment)=>{
 'widget';
 const bg='#0b0c10',text='#f2f4f7',muted='#8b93a1',accent='#6AA4FF',urgent='#f0b4bd';
 const family=env.widgetFamily;
 if(!p||!p.ready){
  return <VStack alignment="leading" spacing={6} modifiers={[containerBackground(bg,'widget'),widgetURL('bakmx://open')]}>
   <Text modifiers={[font({size:11,weight:'heavy'}),foregroundStyle(muted)]}>BAK MX</Text>
   <Text modifiers={[font({size:14,weight:'semibold'}),foregroundStyle(text),lineLimit(3)]}>Open BAK MX and pick your bike.</Text>
  </VStack>;
 }
 if(family==='accessoryRectangular'){
  return <VStack alignment="leading" spacing={1} modifiers={[containerBackground('clear','widget'),widgetURL('bakmx://service')]}>
   <Text modifiers={[font({size:13,weight:'bold'}),lineLimit(1)]}>{p.bike}</Text>
   <Text modifiers={[font({size:12}),lineLimit(1)]}>{p.next}</Text>
   <Text modifiers={[font({size:12}),monospacedDigit(),lineLimit(1)]}>{p.hours}</Text>
  </VStack>;
 }
 if(family==='accessoryInline'){
  return <Text modifiers={[widgetURL('bakmx://service')]}>{p.next}</Text>;
 }
 const left=<VStack alignment="leading" spacing={4}>
  <Text modifiers={[font({size:11,weight:'heavy'}),foregroundStyle(muted)]}>BAK MX</Text>
  <Text modifiers={[font({size:15,weight:'semibold'}),foregroundStyle(text),lineLimit(2),minimumScaleFactor(0.75)]}>{p.bike}</Text>
  <Text modifiers={[font({size:24,weight:'heavy'}),foregroundStyle(text),monospacedDigit(),minimumScaleFactor(0.7),lineLimit(1)]}>{p.hours}</Text>
  <Spacer/>
  <HStack spacing={5}>
   <Image systemName="wrench.and.screwdriver" size={11} color={p.nextUrgent?urgent:accent}/>
   <Text modifiers={[font({size:12,weight:'medium'}),foregroundStyle(p.nextUrgent?urgent:text),lineLimit(2),minimumScaleFactor(0.8)]}>{p.next}</Text>
  </HStack>
 </VStack>;
 if(family==='systemSmall'){
  return <VStack alignment="leading" modifiers={[frame({maxWidth:10000,maxHeight:10000,alignment:'topLeading'}),containerBackground(bg,'widget'),widgetURL('bakmx://service')]}>{left}</VStack>;
 }
 return <HStack alignment="top" spacing={14} modifiers={[containerBackground(bg,'widget'),widgetURL('bakmx://service')]}>
  <VStack alignment="leading" modifiers={[frame({maxWidth:10000,maxHeight:10000,alignment:'topLeading'})]}>{left}</VStack>
  <VStack alignment="leading" spacing={4} modifiers={[frame({maxWidth:10000,maxHeight:10000,alignment:'topLeading'}),padding({top:16})]}>
   <Text modifiers={[font({size:11,weight:'heavy'}),foregroundStyle(muted)]}>LAST SETUP CHANGE</Text>
   <Text modifiers={[font({size:14,weight:'medium'}),foregroundStyle(text),lineLimit(4),minimumScaleFactor(0.8)]}>{p.change}</Text>
   <Spacer/>
   <Text modifiers={[font({size:11}),foregroundStyle(muted),lineLimit(1)]}>{p.changeWhen}</Text>
  </VStack>
 </HStack>;
};

/** Created on first use (inside a try), never at import, so a missing native module can't crash startup. */
export const makeBikeWidget=()=>createWidget<BikeWidgetProps>('BikeWidget',BikeWidgetLayout);
