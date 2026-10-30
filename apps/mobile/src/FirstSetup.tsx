// The 60-second first setup: four taps about the rider (weight in gear, level, kind of riding, usual dirt), saved to the
// bike, then BAK writes a starting setup from the bike's published settings. New riders get to a useful answer before they
// have filled in anything else; the same sheet reopens from Home for a fresh starting point any time.
import React,{useEffect,useState} from 'react';
import {Keyboard,Modal,ScrollView,Text,TextInput,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {Bike} from '../../../shared/types';
import {RIDING_TYPES} from '../../../shared/garage-fields';
import {api} from './api';
import {Pressable} from './Touch';
import {Button,Copy,Icon,Notice,colors} from './ui';
import {needsFirstSetup,firstSetupQuestion} from './firstSetup';
export {needsFirstSetup};

const LEVELS=['Beginner','Novice','Intermediate','Expert','Pro','Vet'];
const DIRT=['Sand','Loam','Hard-pack','Clay','Mixed','Mud / wet'];
const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const str=(v:unknown)=>v==null?'':String(v);


export function FirstSetupSheet({visible,bike,onClose,onSaved,onAsk}:{visible:boolean;bike:Bike;onClose:()=>void;onSaved:()=>void;onAsk:(question:string)=>void}){
 const insets=useSafeAreaInsets(),c=bike.configuration??{};
 const [weight,setWeight]=useState(str(c.geared_weight_lb)),[level,setLevel]=useState(str(c.skill_level)),[discipline,setDiscipline]=useState(str(c.discipline)),[dirt,setDirt]=useState(str(c.usual_dirt)),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 useEffect(()=>{if(!visible)return;const cc=bike.configuration??{};setWeight(str(cc.geared_weight_lb));setLevel(str(cc.skill_level));setDiscipline(str(cc.discipline));setDirt(str(cc.usual_dirt));setNotice('');},[visible,bike.id]);
 const w=Number(weight);const ready=w>=60&&w<=400&&!!level&&!!discipline;
 async function go(){
  if(busy||!ready)return;setBusy(true);setNotice('');
  try{
   await api(`/api/bikes?id=${bike.id}`,'PATCH',{manufacturer:bike.manufacturer,model:bike.model,model_year:bike.model_year,variant:bike.variant,region:bike.region,nickname:bike.nickname??'',engine_hours:bike.engine_hours??null,configuration:{...c,geared_weight_lb:weight.trim(),skill_level:level,discipline,...(dirt?{usual_dirt:dirt}:{})}});
   onSaved();onClose();onAsk(firstSetupQuestion({...bike,configuration:{...c,geared_weight_lb:weight.trim(),skill_level:level,discipline}},{weight:weight.trim(),level,discipline,dirt}));
  }catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 const chips=(items:string[],value:string,set:(v:string)=>void)=><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{items.map(i=>{const on=i===value;return <Pressable key={i} haptic="select" accessibilityRole="radio" accessibilityState={{selected:on}} onPress={()=>set(on&&items===DIRT?'':i)} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:14,minHeight:40,borderRadius:12,borderWidth:1,borderColor:on?'#4a5160':'#2a2f39',backgroundColor:on?'#1e232c':'transparent',opacity:pressed?0.7:1})}>{on&&<Icon name="check" size={14} color={colors.accent} weight={2.4}/>}<Text style={{color:on?'#ffffff':'#b2b9c4',fontSize:15,fontWeight:on?'700':'500'}}>{i}</Text></Pressable>;})}</View>;
 const label=(t:string,sub?:string)=><View style={{gap:2}}><Text style={{color:colors.text,fontSize:17,fontWeight:'800'}}>{t}</Text>{!!sub&&<Text style={{color:'#8f97a4',fontSize:13}}>{sub}</Text>}</View>;
 return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
  <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" automaticallyAdjustKeyboardInsets style={{flex:1,backgroundColor:colors.bg}} contentContainerStyle={{padding:20,paddingBottom:insets.bottom+24,gap:22}}>
   <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><Text style={{color:colors.text,fontSize:26,fontWeight:'900',fontStyle:'italic'}}>Starting setup</Text><Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}><Text style={{color:colors.muted,fontSize:16}}>Close</Text></Pressable></View>
   <Copy>Four quick answers about you. BAK sets the {bike.model_year} {bike.manufacturer} {bike.model} up from its published settings for your weight, level and the kind of riding you do. About a minute.</Copy>
   <View style={{gap:10}}>{label('Weight in riding gear','Boots, helmet, the lot. Springs and sag come from this.')}
    <View style={{flexDirection:'row',alignItems:'flex-end',gap:8}}><TextInput value={weight} onChangeText={v=>setWeight(v.replace(/[^0-9]/g,'').slice(0,3))} keyboardType="number-pad" returnKeyType="done" onSubmitEditing={()=>Keyboard.dismiss()} placeholder="185" placeholderTextColor="#7d8593" accessibilityLabel="Weight in riding gear, pounds" style={{color:colors.text,fontSize:32,fontWeight:'900',fontStyle:'italic',borderBottomWidth:1,borderBottomColor:colors.accent,paddingVertical:6,minWidth:110}}/><Text style={{color:colors.muted,fontSize:16,paddingBottom:12}}>lb</Text></View>
   </View>
   <View style={{gap:10}}>{label('Riding level')}{chips(LEVELS,level,setLevel)}</View>
   <View style={{gap:10}}>{label('Main kind of riding')}{chips(RIDING_TYPES,discipline,setDiscipline)}</View>
   <View style={{gap:10}}>{label('Usual dirt','Optional. Tap again to clear.')}{chips(DIRT,dirt,setDirt)}</View>
   <Notice text={notice} tone={notice?'warn':undefined}/>
   <Button disabled={busy||!ready} title={busy?'Saving…':'Save and get my setup'} onPress={()=>void go()}/>
   <Text style={{color:'#7d8593',fontSize:12.5,lineHeight:18}}>These go on the bike in Garage, where you can change them any time. BAK’s answer uses the bike’s own published settings and says what it doesn’t have.</Text>
  </ScrollView>
 </Modal>;
}
