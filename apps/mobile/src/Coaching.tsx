// Coaching history for a bike: every clip or riding photo BAK coached, newest first, with the fix and drill up front and
// the frames and full answer one tap away. The same list feeds "Compare with an earlier clip" in Ask BAK.
import React,{useCallback,useEffect,useState} from 'react';
import {ActivityIndicator,Image,ScrollView,Text,View} from 'react-native';
import {Pressable} from './Touch';
import type {Bike} from '../../../shared/types';
import {coachFocus,type ChatMedia} from '../../../shared/coach-focus';
import {api} from './api';
import type {Photo} from './photos';
import {MessagePhotos} from './PhotoUI';
import {RichText,Disclosure} from './RichText';
import {Button,Card,Eyebrow,Notice,colors} from './ui';
import {TextInput} from 'react-native';

export type Tried={result:'better'|'no_change'|'worse';note:string;updated_at:string};
export type CoachingSession={id:string;message_id:string|null;at:string;question:string;media:ChatMedia;photos:Photo[];answer:string;fix:string;drill:string;tried:Tried|null};
const TRIED:{key:Tried['result'];label:string;said:string}[]=[{key:'better',label:'Helped',said:'helped'},{key:'no_change',label:'No change',said:'made no difference'},{key:'worse',label:'Worse',said:'made it worse'}];
const day=(iso:string)=>new Date(iso).toLocaleDateString(undefined,{month:'short',day:'numeric'});
export const sessionLabel=(s:CoachingSession)=>`${coachFocus(s.media.focus)?.label??(s.media.kind==='clip'?'Clip':'Photos')} · ${day(s.at)}`;

export function useCoachingSessions(bikeId:string|undefined,enabled=true){
 const [sessions,setSessions]=useState<CoachingSession[]|null>(null),[error,setError]=useState('');
 const load=useCallback(async()=>{if(!bikeId||!enabled)return;try{setError('');setSessions(await api<CoachingSession[]>(`/api/coaching?bike_id=${bikeId}`));}catch(e){setError(e instanceof Error?e.message:'Coaching history could not load.');setSessions([]);}},[bikeId,enabled]);
 useEffect(()=>{void load();},[load]);
 return {sessions,error,reload:load};
}

/** Garage › Coaching. */
export function CoachingList({bike,onCoach}:{bike:Bike;onCoach:()=>void}){
 const {sessions,error}=useCoachingSessions(bike.id);
 return <Card>
  <View style={{flexDirection:'row',alignItems:'baseline',justifyContent:'space-between'}}><Eyebrow>COACHING</Eyebrow>{!!sessions?.length&&<Text style={{color:'#9aa2ae',fontSize:12.5}}>{sessions.length} session{sessions.length===1?'':'s'}</Text>}</View>
  {sessions===null&&<ActivityIndicator color={colors.accent}/>}
  <Notice text={error}/>
  {sessions!==null&&!sessions.length&&!error&&<View style={{gap:10}}>
   <Text style={{color:colors.muted,fontSize:14,lineHeight:20}}>Send BAK a short clip of you riding a corner, jump or section. Each session lands here with the fix and a drill, so you can see what you have worked on and send a new clip to check it stuck.</Text>
   <Pressable accessibilityRole="button" onPress={onCoach} hitSlop={6}><Text style={{color:colors.accent,fontSize:15,fontWeight:'700'}}>Coach me from a clip</Text></Pressable>
  </View>}
  {sessions?.map((s,i)=><Session key={s.id} s={s} first={i===0}/>)}
 </Card>;
}

function Session({s,first}:{s:CoachingSession;first:boolean}){
 const times=s.media.kind==='clip'&&s.media.frames.length===s.photos.length?s.media.frames:undefined;
 return <View style={{gap:8,paddingTop:first?4:12,borderTopWidth:first?0:1,borderTopColor:'#1f242c'}}>
  <View style={{flexDirection:'row',gap:12}}>
   {!!s.photos[0]&&<Image source={{uri:s.photos[Math.floor(s.photos.length/2)].url}} style={{width:64,height:64,borderRadius:10,backgroundColor:'#101217'}} accessibilityIgnoresInvertColors/>}
   <View style={{flex:1,gap:4}}>
    <Text style={{color:colors.text,fontSize:15.5,fontWeight:'700'}}>{sessionLabel(s)}{s.media.kind==='clip'?` · ${s.media.duration.toFixed(0)} s clip`:''}</Text>
    {!!s.fix&&<Text selectable style={{color:colors.text,fontSize:14.5,lineHeight:21}}><Text style={{color:colors.accent,fontWeight:'700'}}>Fix: </Text>{s.fix}</Text>}
    {!!s.drill&&<Text selectable style={{color:colors.muted,fontSize:14,lineHeight:20}}><Text style={{fontWeight:'700'}}>Drill: </Text>{s.drill}</Text>}
    {s.tried&&<Text style={{color:s.tried.result==='better'?'#7fd09a':colors.muted,fontSize:13.5,fontWeight:'600'}}>You said it {TRIED.find(t=>t.key===s.tried!.result)?.said}{s.tried.note?`: ${s.tried.note}`:''}</Text>}
   </View>
  </View>
  <Disclosure title="Frames and full coaching">
   <MessagePhotos photos={s.photos} times={times} align="left"/>
   <RichText text={s.answer} frames={times?{times,photos:s.photos}:null}/>
  </Disclosure>
 </View>;
}

/** Ask BAK, with a clip attached: pick an earlier clip on this bike to compare with (same kind of moment first). */
export function CompareChips({sessions,focus,value,onChange}:{sessions:CoachingSession[];focus:string|null;value:string|null;onChange:(id:string|null)=>void}){
 const clips=sessions.filter(s=>s.media.kind==='clip').sort((a,b)=>Number(b.media.focus===focus)-Number(a.media.focus===focus)).slice(0,4);
 if(!clips.length)return null;
 return <View style={{gap:6,paddingTop:6}}>
  <Text style={{color:'#7d8593',fontSize:12}}>Compare with an earlier clip?</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{gap:6}}>
   {clips.map(s=>{const on=value===s.id;return <Pressable key={s.id} accessibilityRole="button" accessibilityState={{selected:on}} onPress={()=>onChange(on?null:s.id)} hitSlop={4} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:6,paddingLeft:4,paddingRight:12,paddingVertical:4,borderRadius:15,borderWidth:1,borderColor:on?colors.accent:'#2f3540',backgroundColor:on?'rgba(106,164,255,0.16)':'transparent',opacity:pressed?0.7:1})}>
    {!!s.photos[0]&&<Image source={{uri:s.photos[Math.floor(s.photos.length/2)].url}} style={{width:22,height:22,borderRadius:11}} accessibilityIgnoresInvertColors/>}
    <Text style={{color:on?'#ffffff':'#c9cfd9',fontSize:13,fontWeight:on?'700':'500'}}>{sessionLabel(s)}</Text></Pressable>;})}
  </ScrollView>
 </View>;
}

/** Under a coaching answer in Ask BAK: did the fix or drill help? BAK reads the answer next time. */
export function TriedCard({messageId,tried,onSaved,onAsk}:{messageId:string;tried:Tried|null;onSaved:(t:Tried)=>void;onAsk:(text:string)=>void}){
 const [pick,setPick]=useState<Tried['result']|null>(null),[note,setNote]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[edit,setEdit]=useState(false);
 if(tried&&!edit){const t=TRIED.find(x=>x.key===tried.result)!;return <View style={st.box}>
  <Text style={{color:colors.muted,fontSize:14,lineHeight:20}}>You said this <Text style={{color:colors.text,fontWeight:'700'}}>{t.said}</Text>{tried.note?`: ${tried.note}`:'.'}</Text>
  <View style={{flexDirection:'row',gap:16}}>
   <Pressable accessibilityRole="button" onPress={()=>onAsk(`I tried the coaching from my clip and it ${t.said}.${tried.note?' '+tried.note:''} What should I work on next?`)} hitSlop={6}><Text style={{color:colors.accent,fontSize:14.5,fontWeight:'700'}}>Ask BAK what's next</Text></Pressable>
   <Pressable accessibilityRole="button" onPress={()=>{setPick(tried.result);setNote(tried.note);setEdit(true);}} hitSlop={6}><Text style={{color:colors.muted,fontSize:14.5}}>Change</Text></Pressable>
  </View>
 </View>;}
 async function save(){if(!pick)return;setBusy(true);setError('');try{const t=await api<Tried>('/api/coaching/result','POST',{message_id:messageId,result:pick,note:note.trim()});setEdit(false);onSaved(t);}catch(e){setError(e instanceof Error?e.message:'That did not save. Try again.');}finally{setBusy(false);}}
 return <View style={st.box}>
  <Text style={{color:colors.text,fontSize:16,fontWeight:'700'}}>Tried it? Did it help?</Text>
  <View style={{flexDirection:'row',gap:8}}>{TRIED.map(t=>{const on=pick===t.key;return <Pressable key={t.key} accessibilityRole="button" accessibilityState={{selected:on}} onPress={()=>setPick(t.key)} style={({pressed})=>({flex:1,alignItems:'center',paddingVertical:10,borderRadius:20,borderWidth:1,borderColor:on?colors.accent:'#343a45',backgroundColor:on?'rgba(106,164,255,0.16)':'transparent',opacity:pressed?0.7:1})}><Text style={{color:on?'#ffffff':colors.text,fontSize:15,fontWeight:on?'700':'500'}}>{t.label}</Text></Pressable>;})}</View>
  {pick&&<>
   <TextInput multiline value={note} onChangeText={setNote} maxLength={1000} placeholder={pick==='better'?'What felt better? (optional)':pick==='worse'?'What got worse? (optional)':'Anything you noticed? (optional)'} placeholderTextColor="#7d8593" style={st.input}/>
   <Notice text={error}/>
   <Button disabled={busy} title={busy?'Saving…':'Save'} onPress={()=>void save()}/>
  </>}
 </View>;
}
const st={box:{gap:10,borderWidth:1,borderColor:'#262b34',borderRadius:14,padding:14},input:{color:colors.text,fontSize:15,lineHeight:21,borderWidth:1,borderColor:'#2f3540',borderRadius:12,paddingHorizontal:12,paddingVertical:10,minHeight:64,textAlignVertical:'top' as const}} as const;
