// Lock Screen and Dynamic Island Live Activity for race day and practice day: the track, the next moto or session and a
// countdown to it, the next checklist item and the last thing logged. Marked 'widget' like GuideActivity: it runs inside the
// widget extension and may only use its props and SwiftUI pieces. The countdown is SwiftUI's own timer, so it ticks without
// the app; the app updates the rest when the rider checks an item, logs a moto or sets the next time.
import {HStack,Image,ProgressView,Spacer,Text,VStack} from '@expo/ui/swift-ui';
import {activityBackgroundTint,font,foregroundStyle,lineLimit,monospacedDigit,padding,tint,widgetURL} from '@expo/ui/swift-ui/modifiers';
import {createLiveActivity,type LiveActivityEnvironment} from 'expo-widgets';
import type {RaceActivityProps} from '../widgetData';

export type {RaceActivityProps};

const RaceActivityLayout=(p:RaceActivityProps,env:LiveActivityEnvironment)=>{
 'widget';
 const text='#f2f4f7',muted='#9aa2af',accent='#6AA4FF',good='#bfe3c8';
 const icon=p.practice?'stopwatch':'flag.checkered';
 const stale=!!env.isStale;
 const live=p.live&&!stale;
 const up=p.nextLabel?(p.nextClock?p.nextLabel+' · '+p.nextClock:p.nextLabel):'';
 const timer=(size:number)=>live?<Text timerInterval={{lower:new Date(p.since),upper:new Date(p.nextAt)}} countsDown modifiers={[font({size,weight:'heavy'}),foregroundStyle(accent),monospacedDigit(),lineLimit(1)]}/>
  :<Text modifiers={[font({size:size*0.72,weight:'bold'}),foregroundStyle(p.nextAt?good:muted),lineLimit(1)]}>{p.nextAt?'Up now':p.nextText}</Text>;
 const itemLine=p.item?(p.count?p.item+'  ·  '+p.count:p.item):p.last;
 return {
  banner:<VStack alignment="leading" spacing={6} modifiers={[padding({all:14}),activityBackgroundTint('#0b0c10'),widgetURL('bakmx://open')]}>
   <HStack spacing={6}>
    <Image systemName={icon} size={12} color={accent}/>
    <Text modifiers={[font({size:11,weight:'heavy'}),foregroundStyle(muted),lineLimit(1)]}>{p.head+' · '+p.track}</Text>
    <Spacer/>
   </HStack>
   {up?<HStack alignment="lastTextBaseline" spacing={8}>
    <Text modifiers={[font({size:16,weight:'semibold'}),foregroundStyle(text),lineLimit(1)]}>{up}</Text>
    <Spacer/>
    {timer(22)}
   </HStack>:<Text modifiers={[font({size:16,weight:'semibold'}),foregroundStyle(text),lineLimit(1)]}>{p.practice?'Log each session as you come off':'Set your first moto time in BAK MX'}</Text>}
   {itemLine?<Text modifiers={[font({size:13}),foregroundStyle(stale?'#6b7280':muted),lineLimit(2)]}>{p.item?'Next: '+itemLine:itemLine}</Text>:null}
   {p.progress>=0?<ProgressView value={p.progress} modifiers={[tint(p.progress>=1?good:accent)]}/>:null}
  </VStack>,
  compactLeading:<Image systemName={icon} size={13} color={accent}/>,
  compactTrailing:live?<Text timerInterval={{lower:new Date(p.since),upper:new Date(p.nextAt)}} countsDown modifiers={[font({size:13,weight:'bold'}),foregroundStyle(text),monospacedDigit(),lineLimit(1)]}/>
   :<Text modifiers={[font({size:13,weight:'bold'}),foregroundStyle(text),monospacedDigit(),lineLimit(1)]}>{p.count||p.nextLabel||'BAK'}</Text>,
  minimal:<Image systemName={icon} size={12} color={accent}/>,
  expandedLeading:<Text modifiers={[font({size:13,weight:'bold'}),foregroundStyle(text),lineLimit(1),padding({leading:6})]}>{up||p.head}</Text>,
  expandedTrailing:<VStack alignment="trailing" modifiers={[padding({trailing:6})]}>{timer(15)}</VStack>,
  expandedBottom:<VStack alignment="leading" spacing={5} modifiers={[padding({horizontal:6})]}>
   <Text modifiers={[font({size:12.5,weight:'semibold'}),foregroundStyle(muted),lineLimit(1)]}>{p.track}</Text>
   {itemLine?<Text modifiers={[font({size:14,weight:'semibold'}),foregroundStyle(text),lineLimit(2)]}>{p.item?'Next: '+itemLine:itemLine}</Text>:null}
   {p.progress>=0?<ProgressView value={p.progress} modifiers={[tint(p.progress>=1?good:accent)]}/>:null}
  </VStack>,
 };
};

/** Created on first use (inside a try), never at import. */
export const makeRaceActivity=()=>createLiveActivity<RaceActivityProps>('RaceActivity',RaceActivityLayout);
