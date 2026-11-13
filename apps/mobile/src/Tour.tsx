// The optional 30-second tour. Never forced: Home offers it once after the first bike is in, "No thanks" retires the
// offer for good, every step has Skip, and it can be replayed from How BAK works. It walks the real screens (the app
// moves to each tab behind a light dim) with one short card at the bottom, then gets out of the way.
import React,{useEffect,useState} from 'react';
import {Modal,Text,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Pressable} from './Touch';
import {Button,colors} from './ui';
import {useProgress} from './localProgress';
import {MetalPanel} from './MetalPanel';
import {Raised} from './Raised';
import {BlueFace,onBlueText} from './BlueFace';

export type TourTab='Home'|'Garage'|'Ask BAK'|'Events';
export const TOUR_STEPS:{tab:TourTab;title:string;body:string}[]=[
 {tab:'Home',title:'Home is your pit board',body:'Ask BAK from the bar at the top. Your bike, what service is next and a race countdown live here.'},
 {tab:'Garage',title:'Garage is what BAK knows',body:'Clickers, sag, springs, tires and parts for each bike. The more you fill in, the sharper every answer gets.'},
 {tab:'Ask BAK',title:'Ask it like you’d tell your buddy',body:'Say what the bike is doing. You get one change to try and what you should feel. You can also ask how anything in the app works.'},
 {tab:'Events',title:'Race day, logs and riders',body:'Set a race from Home for a countdown and prep list. Log what you changed after a ride so BAK remembers what worked. Events and Community are for riding with others.'},
];

// One tour at a time, started from anywhere (the Home offer, How BAK works).
const listeners=new Set<(on:boolean)=>void>();
export function startTour(){for(const l of listeners)l(true);}

export function TourHost({navigate}:{navigate:(tab:TourTab)=>void}){
 const [on,setOn]=useState(false),[i,setI]=useState(0);
 const bottom=useSafeAreaInsets().bottom;
 useEffect(()=>{const l=(v:boolean)=>{setOn(v);setI(0);};listeners.add(l);return()=>{listeners.delete(l);};},[]);
 useEffect(()=>{if(on)navigate(TOUR_STEPS[i].tab);},[on,i]);
 if(!on)return null;
 const step=TOUR_STEPS[i],last=i===TOUR_STEPS.length-1;
 const close=()=>{setOn(false);navigate('Home');};
 return <Modal visible transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
  <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.45)',justifyContent:'flex-end',padding:16,paddingBottom:bottom+96}}>
   <View accessibilityViewIsModal><MetalPanel radius={24}>
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
     <View style={{flexDirection:'row',gap:6}} accessibilityLabel={`Step ${i+1} of ${TOUR_STEPS.length}`}>
      {TOUR_STEPS.map((_,k)=><View key={k} style={{width:k===i?20:6,height:6,borderRadius:3,backgroundColor:k===i?'#6AA4FF':'rgba(255,255,255,0.22)'}}/>)}
     </View>
     <Pressable accessibilityRole="button" hitSlop={12} onPress={close}><Text style={{color:colors.muted,fontSize:14.5}}>Skip tour</Text></Pressable>
    </View>
    <Text style={{color:'#f3f5f8',fontSize:21,fontWeight:'900',fontStyle:'italic',letterSpacing:-0.4,textShadowColor:'rgba(0,0,0,0.7)',textShadowOffset:{width:0,height:1},textShadowRadius:1}}>{step.title}</Text>
    <Text style={{color:'#d3d8e0',fontSize:15,lineHeight:22}}>{step.body}</Text>
    <View style={{flexDirection:'row',gap:10,paddingTop:4}}>
     {i>0&&<View style={{flex:1}}><Button secondary title="Back" onPress={()=>setI(i-1)}/></View>}
     <View style={{flex:1}}><Button title={last?'Got it':'Next'} onPress={()=>last?close():setI(i+1)}/></View>
    </View>
   </MetalPanel></View>
  </View>
 </Modal>;
}

/** Home's one-time offer. Either answer retires it; the tour stays in How BAK works. */
export function TourOffer({account}:{account:string}){
 const [state,setState]=useProgress(account,'tour-offer-v1',{answered:false});
 if(state.answered)return null;
 const answer=(take:boolean)=>{setState({answered:true});if(take)startTour();};
 return <MetalPanel radius={20}>
  <View style={{gap:6}}>
   <Text style={{color:'#b9c0ca',fontWeight:'800',letterSpacing:2.2,fontSize:11}}>NEW HERE?</Text>
   <Text style={{color:'#f3f5f8',fontSize:21,fontWeight:'900',fontStyle:'italic',letterSpacing:-0.4,textShadowColor:'rgba(0,0,0,0.7)',textShadowOffset:{width:0,height:1},textShadowRadius:1}}>Take the 30-second tour</Text>
   <Text style={{color:'#c4cad3',fontSize:14,lineHeight:20}}>Four stops: Home, Garage, Ask BAK and race day. Skip any time.</Text>
  </View>
  <View style={{flexDirection:'row',gap:10}}>
   <View style={{flex:1}}><Button title="Show me" onPress={()=>answer(true)}/></View>
   <View style={{flex:1}}><Button secondary title="No thanks" onPress={()=>answer(false)}/></View>
  </View>
 </MetalPanel>;
}

/** Empty chat, shown once: Ask BAK also explains the app. Tapping it fills the box; × hides it for good. */
export function AppHelpHint({account,onUse}:{account:string;onUse:(q:string)=>void}){
 const [state,setState]=useProgress(account,'hint-app-help-v1',{done:false});
 if(state.done)return null;
 const q='How do I log a setup change?';
 return <Raised radius={16} style={{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:12,paddingLeft:12,paddingRight:14}}>
  <View style={{width:30,height:30,borderRadius:15,alignItems:'center',justifyContent:'center'}}><BlueFace radius={15}/><Text style={[{fontSize:16,fontWeight:'900'},onBlueText]}>?</Text></View>
  <Pressable accessibilityRole="button" accessibilityLabel={`Not sure how something works? Ask BAK. Try: ${q}`} onPress={()=>{setState({done:true});onUse(q);}} style={{flex:1,gap:2}}>
   <Text style={{color:'#eef1f5',fontSize:14,fontWeight:'700'}}>Not sure how something works?</Text>
   <Text style={{color:'#aeb6c2',fontSize:13,lineHeight:18}}>Ask BAK, like “{q}”</Text>
  </Pressable>
  <Pressable accessibilityRole="button" accessibilityLabel="Hide this tip" hitSlop={12} onPress={()=>setState({done:true})}><Text style={{color:'#8f97a4',fontSize:20,lineHeight:22}}>×</Text></Pressable>
 </Raised>;
}
