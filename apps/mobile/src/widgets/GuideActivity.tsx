// Lock Screen and Dynamic Island Live Activity for a guided job: which step, what to check, how far along.
// Marked 'widget' like BikeWidget: it runs inside the widget extension and may only use its props and SwiftUI pieces.
import {HStack,Image,ProgressView,Spacer,Text,VStack} from '@expo/ui/swift-ui';
import {activityBackgroundTint,font,foregroundStyle,lineLimit,monospacedDigit,padding,tint,widgetURL} from '@expo/ui/swift-ui/modifiers';
import {createLiveActivity,type LiveActivityEnvironment} from 'expo-widgets';

export type GuideActivityProps={guide:string;bike:string;step:number;total:number;stepTitle:string;check:string;needsNote:boolean;done:boolean};

const GuideActivityLayout=(p:GuideActivityProps,env:LiveActivityEnvironment)=>{
 'widget';
 const text='#f2f4f7',muted='#9aa2af',accent='#6AA4FF',good='#bfe3c8';
 const count=p.done?'Done':p.step+'/'+p.total;
 const value=p.total>0?Math.min(1,(p.done?p.total:p.step-1)/p.total):0;
 const headline=p.done?'Guide complete':p.stepTitle;
 const detail=p.done?'All '+p.total+' steps recorded.':p.needsNote?'Record your measurement before moving on.':p.check;
 const stale=!!env.isStale;
 return {
  banner:<VStack alignment="leading" spacing={6} modifiers={[padding({all:14}),activityBackgroundTint('#0b0c10'),widgetURL('bakmx://open')]}>
   <HStack spacing={6}>
    <Image systemName="wrench.and.screwdriver" size={12} color={accent}/>
    <Text modifiers={[font({size:11,weight:'heavy'}),foregroundStyle(muted),lineLimit(1)]}>{p.guide}</Text>
    <Spacer/>
    <Text modifiers={[font({size:13,weight:'bold'}),foregroundStyle(p.done?good:text),monospacedDigit()]}>{count}</Text>
   </HStack>
   <Text modifiers={[font({size:16,weight:'semibold'}),foregroundStyle(text),lineLimit(2)]}>{headline}</Text>
   <Text modifiers={[font({size:13}),foregroundStyle(stale?'#6b7280':muted),lineLimit(2)]}>{detail}</Text>
   <ProgressView value={value} modifiers={[tint(p.done?good:accent)]}/>
  </VStack>,
  compactLeading:<Image systemName="wrench.and.screwdriver" size={13} color={accent}/>,
  compactTrailing:<Text modifiers={[font({size:13,weight:'bold'}),foregroundStyle(text),monospacedDigit()]}>{count}</Text>,
  minimal:<Text modifiers={[font({size:12,weight:'bold'}),foregroundStyle(accent),monospacedDigit()]}>{p.done?'✓':String(p.step)}</Text>,
  expandedLeading:<Text modifiers={[font({size:13,weight:'bold'}),foregroundStyle(text),monospacedDigit(),padding({leading:6})]}>{p.done?'Done':'Step '+count}</Text>,
  expandedTrailing:<Text modifiers={[font({size:12}),foregroundStyle(muted),lineLimit(1),padding({trailing:6})]}>{p.bike}</Text>,
  expandedBottom:<VStack alignment="leading" spacing={5} modifiers={[padding({horizontal:6})]}>
   <Text modifiers={[font({size:15,weight:'semibold'}),foregroundStyle(text),lineLimit(2)]}>{headline}</Text>
   <Text modifiers={[font({size:12.5}),foregroundStyle(muted),lineLimit(2)]}>{detail}</Text>
   <ProgressView value={value} modifiers={[tint(p.done?good:accent)]}/>
  </VStack>,
 };
};

/** Created on first use (inside a try), never at import. */
export const makeGuideActivity=()=>createLiveActivity<GuideActivityProps>('GuideActivity',GuideActivityLayout);
