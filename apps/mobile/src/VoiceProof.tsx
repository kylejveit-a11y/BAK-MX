// Talk to BAK (docs/plans/VOICE.md). One round key to start, End to stop; the key is not a stop button, so a glove brushing it cannot end a talk.
// The voice model only listens and speaks. When it hands a bike question off, this screen sends the rider's words to
// the normal Ask BAK engine and gives the answer back to be spoken, so voice follows the same data and safety rules
// as typed answers. No audio is kept; the conversation lands in the rider's chats like any other.
import React,{useEffect,useRef,useState} from 'react';
import {Animated,Easing,Text,View} from 'react-native';
import {Pressable} from './Touch';
import {Icon} from './Icon';
import {motion} from './theme';
import {randomUUID} from 'expo-crypto';
import {api,apiStream} from './api';
import {colors,Copy,Notice} from './ui';
import {RaisedButton,well} from './Raised';
import {BlueFace,blueLift} from './BlueFace';
import type {Bike,Conversation,EngineeringResponse} from '../../../shared/types';
import {VOICE,type VoiceStatus} from '../../../shared/voice';

type Phase='idle'|'starting'|'live'|'ending';
type Line={who:'you'|'bak';text:string;at:number};
const clock=(s:number)=>`${Math.floor(s/60)}:${String(Math.max(0,s)%60).padStart(2,'0')}`;
const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Try again.';
/** A written answer made speakable: no markdown marks, and short enough for one handoff. */
const speakable=(r:EngineeringResponse)=>[r.summary,r.answer??'',r.next_step?.action?`Next step: ${r.next_step.action}`:''].filter(Boolean).join('\n').replace(/[*_#`>|]/g,'').replace(/\n{2,}/g,'\n').slice(0,1800);

export function useVoiceStatus(){const [status,setStatus]=useState<VoiceStatus|null>(null);useEffect(()=>{let live=true;api<VoiceStatus>('/api/voice').then(s=>{if(live)setStatus(s);}).catch(()=>{});return()=>{live=false;};},[]);return status;}

type Pending={id:string;response:EngineeringResponse};
export function VoiceProof({bike,ownerId,renderChanges,applyChanges,job}:{bike?:Bike;ownerId:string;/** saves a waiting change when the rider says yes; returns what was saved, in words */applyChanges?:(response:EngineeringResponse)=>Promise<string[]>;/** a guided job in progress: its name, the step BAK should answer about, and a handler that runs "next", "repeat" and the like and returns the line to read out (null when the words are a question) */job?:{title:string;guided?:{procedure_id:string;step_index:number}|null;command:(heard:string)=>string|null};/** the same confirm cards typed chat shows for a Garage or settings change */renderChanges?:(response:EngineeringResponse,messageId:string)=>React.ReactNode}){
 const voice=VOICE.voice,[pending,setPending]=useState<Pending[]>([]),waiting=useRef<Pending[]>([]),[saved,setSaved]=useState<string[]>([]);
 const keep=(next:Pending[])=>{waiting.current=next;setPending(next);};
 const [phase,setPhase]=useState<Phase>('idle'),[notice,setNotice]=useState(''),[status,setStatus]=useState<VoiceStatus|null>(null),[seconds,setSeconds]=useState(0),[lines,setLines]=useState<Line[]>([]),[working,setWorking]=useState(false);
 const call=useRef<{pc:any;dc:any;stream:any;id:string;started:number;limit:number;heard:string;conversation:string;lastWords:number;closed?:()=>void}|null>(null);
 const refresh=()=>api<VoiceStatus>('/api/voice').then(setStatus).catch(e=>setNotice(errorText(e)));
 useEffect(()=>{void refresh();return()=>{void stop(true);};},[]);
 // The clock, the allowance stop and the silence stop.
 useEffect(()=>{if(phase!=='live')return;const t=setInterval(()=>{const c=call.current;if(!c)return;const s=Math.round((Date.now()-c.started)/1000);setSeconds(s);
  if(s>=c.limit){setNotice('That’s your talk time for now.');void stop();}
  else if(Date.now()-c.lastWords>VOICE.idleEndSeconds*1000){setNotice('Ended after 10 minutes of quiet.');void stop();}},1000);return()=>clearInterval(t);},[phase]);

 // Words arrive in small pieces, and the two speakers' pieces can cross. A piece joins the speaker's own last line when
 // that line is the newest one, or when it was still being written a moment ago (so one reply is never split in two).
 const say=(who:Line['who'],delta:string)=>setLines(old=>{const now=Date.now(),last=old[old.length-1];
  if(last&&last.who===who)return[...old.slice(0,-1),{who,text:last.text+delta,at:now}];
  const mine=old.length>=2?old[old.length-2]:undefined;
  if(mine&&mine.who===who&&now-mine.at<2500)return[...old.slice(0,-2),{who,text:mine.text+delta,at:now},old[old.length-1]];
  if(!delta.trim())return old;
  return[...old.slice(-11),{who,text:delta.replace(/^\s+/,''),at:now}];});
 // The voice reads the capitals B-A-K as letters or as "back", so anything it will say carries the name as the word "Bock". Screens keep BAK.
 const send=(event:Record<string,unknown>)=>{const dc=call.current?.dc;if(typeof event.content==='string')event={...event,content:event.content.replace(/\bBAK\b/g,'Bock')};if(dc&&dc.readyState==='open')dc.send(JSON.stringify(event));};

 async function answer(delegationId:string){
  const c=call.current;if(!c)return;const question=c.heard.trim();c.heard='';
  send({type:'session.thinking.append',event_id:randomUUID(),delegation_id:delegationId,content:''});
  if(!bike||!question){send({type:'session.commentary.append',event_id:randomUUID(),delegation_id:delegationId,content:bike?'I did not catch the question. Ask the rider to say it again.':'The rider has not added a bike yet. Ask them to add their bike in the Garage first.'});return;}
  // A change is waiting and the rider answered it out loud. Only a plain yes or no counts; anything else is a new question.
  if(waiting.current.length&&applyChanges){
   const said=question.toLowerCase().replace(/[^a-z' ]/g,' ').replace(/\s+/g,' ').trim();
   if(/^(yes|yeah|yep|yup|sure|ok|okay|please|do it|go ahead|go for it|save|save it|save that|confirm|yes please|yes save it|yeah save it|yeah do it|yes do it|yes go ahead)$/.test(said)){
    const todo=waiting.current;keep([]);
    try{const done:string[]=[];for(const p of todo)done.push(...await applyChanges(p.response));setSaved(old=>[...old,...done].slice(-6));
     send({type:'session.commentary.append',event_id:randomUUID(),delegation_id:delegationId,content:done.length?`Saved: ${done.join('; ')}. Tell the rider it is saved, in one short line.`:'There was nothing left to save. Tell the rider it was already up to date.'});}
    catch(e){keep(todo);send({type:'session.commentary.append',event_id:randomUUID(),delegation_id:delegationId,content:'The save did not go through. Tell the rider to tap Save on their screen or try again.'});setNotice(errorText(e));}
    return;
   }
   if(/^(no|nope|nah|cancel|don't|dont|do not|never mind|nevermind|leave it|no thanks|no don't)$/.test(said)){keep([]);send({type:'session.commentary.append',event_id:randomUUID(),delegation_id:delegationId,content:'Not saved; the rider said no. Acknowledge in a couple of words.'});return;}
  }
  const line=job?.command(question)??null;
  if(line){send({type:'session.commentary.append',event_id:randomUUID(),delegation_id:delegationId,content:`Read this step out as written, then wait: ${line}`.slice(0,1900)});return;}
  setWorking(true);
  try{
   if(!c.conversation){const conv=await api<Conversation>('/api/conversations','POST',{bike_id:bike.id,title:('Talk to BAK: '+question).slice(0,100),mode:'ask',create_id:randomUUID()});c.conversation=conv.id;}
   const r=await apiStream<{response:EngineeringResponse;message?:{id?:string}}>('/api/chat',{conversation_id:c.conversation,request_id:randomUUID(),message:question,voice:true,...(job?.guided?{guided:job.guided}:{})},()=>{});
   const changes=[...(r.response.garage_updates??[]).map(u=>`${u.field||u.name} ${u.value}`.trim()),...(r.response.app_actions??[]).map(a=>a.type.replace(/_/g,' '))];
   if(changes.length)keep([...waiting.current.slice(-2),{id:r.message?.id||randomUUID(),response:r.response}]);
   send({type:'session.commentary.append',event_id:randomUUID(),delegation_id:delegationId,content:(speakable(r.response)+(changes.length?`\nA change is waiting for the rider to confirm: ${changes.join('; ')}. It is NOT saved yet. Say what it is in one line and ask "Want me to save that?" They can say yes or no, or tap Save on screen.`:'')).slice(0,1900)});
  }catch(e){send({type:'session.commentary.append',event_id:randomUUID(),delegation_id:delegationId,content:'The answer did not come through. Tell the rider to ask again in a moment.'});setNotice(errorText(e));}
  finally{setWorking(false);}
 }
 function onEvent(raw:string){
  let e:any;try{e=JSON.parse(raw);}catch{return;}
  const c=call.current;if(!c)return;
  if(e.type==='session.started'){setPhase('live');c.started=Date.now();c.lastWords=Date.now();}
  else if(e.type==='session.input_transcript.delta'&&typeof e.delta==='string'){c.heard+=e.delta;c.lastWords=Date.now();say('you',e.delta);}
  else if(e.type==='session.output_transcript.delta'&&typeof e.delta==='string'){c.lastWords=Date.now();say('bak',e.delta);}
  else if(e.type==='session.delegation.created'&&e.delegation?.id)void answer(String(e.delegation.id));
  else if(e.type==='session.closed')c.closed?.();
  else if(e.type==='error')setNotice(String(e.error?.message||e.message||'The voice session reported a problem.'));
 }
 async function start(){
  if(phase!=='idle')return;setNotice('');setLines([]);keep([]);setSaved([]);setSeconds(0);setPhase('starting');
  let stream:any=null,pc:any=null;
  try{
   const rtc=require('react-native-webrtc');
   stream=await rtc.mediaDevices.getUserMedia({audio:true,video:false});
   pc=new rtc.RTCPeerConnection({});
   stream.getTracks().forEach((t:any)=>pc.addTrack(t,stream));
   const dc=pc.createDataChannel('oai-events');
   call.current={pc,dc,stream,id:'',started:Date.now(),limit:VOICE.maxSessionSeconds,heard:'',conversation:'',lastWords:Date.now()};
   dc.addEventListener('message',(m:any)=>onEvent(String(m.data)));
   const offer=await pc.createOffer({});await pc.setLocalDescription(offer);
   const res=await api<{session_id:string;sdp:string;seconds_left:number}>('/api/voice/session','POST',{sdp:offer.sdp,voice,job:job?.title.slice(0,160),bike:bike?`${bike.model_year} ${bike.manufacturer} ${bike.model}`:undefined});
   call.current.id=res.session_id;call.current.limit=res.seconds_left;
   await pc.setRemoteDescription(new rtc.RTCSessionDescription({type:'answer',sdp:res.sdp}));
   try{const InCall=require('react-native-incall-manager').default;InCall.start({media:'audio'});InCall.setForceSpeakerphoneOn(true);}catch{/* speaker routing is a nicety */}
  }catch(e){
   try{stream?.getTracks().forEach((t:any)=>t.stop());pc?.close();}catch{/* nothing to clean */}
   const id=call.current?.id;call.current=null;if(id)void api('/api/voice/end','POST',{session_id:id,seconds:0}).catch(()=>{});
   setPhase('idle');setNotice(errorText(e));
  }
 }
 async function stop(silent=false){
  const c=call.current;if(!c)return;call.current=null;if(!silent)setPhase('ending');
  const ran=Math.round((Date.now()-c.started)/1000);
  try{if(c.dc?.readyState==='open'){const closed=new Promise<void>(done=>{c.closed=done;setTimeout(done,4000);});c.dc.send(JSON.stringify({type:'session.close'}));await closed;}}catch{/* closing anyway */}
  try{c.stream?.getTracks().forEach((t:any)=>t.stop());c.pc?.close();}catch{/* already closed */}
  try{require('react-native-incall-manager').default.stop();}catch{/* not started */}
  if(c.id)await api<VoiceStatus>('/api/voice/end','POST',{session_id:c.id,seconds:ran}).then(s=>{if(!silent)setStatus(s);}).catch(()=>{});
  if(!silent)setPhase('idle');
 }
 const left=status?Math.max(0,status.seconds_left-(phase==='live'?seconds:0)):0;
 const blocked=status&&!status.allowed?(status.why==='not_pro'?'Talk to BAK is part of Pro.':status.why==='used_up'?'You’ve used this month’s talk time. It resets on the 1st.':'Talk to BAK isn’t switched on for this account yet.'):'';
 const total=status?Math.max(1,status.seconds_included):1,share=status?Math.min(1,left/total):0;
 const word=phase==='live'?(working?'Checking your bike’s data':'Listening'):phase==='starting'?'Connecting':phase==='ending'?'Ending':'Tap to talk';
 const shown=(t:string)=>t.trim().replace(/\b(Bock|Bach|Bahk)\b(?=\s+MX\b|[’']s\b)|\bBock\b/g,'BAK');
 return <View style={{gap:22}}>
  <Notice text={notice||blocked} tone={notice||blocked?'warn':undefined}/>
  {/* The stage: one round key. Tap it to start; while it listens, rings move out from it. */}
  <View style={{alignItems:'center',gap:14,paddingTop:lines.length?0:14,paddingBottom:lines.length?0:8}}>
   {!!bike&&<Text numberOfLines={1} style={{color:'#9aa2ae',fontSize:13.5,fontWeight:'600'}}>{bike.model_year} {bike.manufacturer} {bike.model}</Text>}
   <TalkKey phase={phase} working={working} blocked={phase==='idle'&&!status?.allowed} onPress={()=>void start()}/>
   <View style={{alignItems:'center',gap:6}}>
    <Text accessibilityLiveRegion="polite" style={{color:colors.text,fontSize:21,fontWeight:'800',letterSpacing:-0.2}}>{word}</Text>
    {phase==='idle'
     ?<Text style={{color:'#9aa2ae',fontSize:14,lineHeight:20,textAlign:'center',maxWidth:300}}>BAK checks your bike’s data before it answers, so expect a short pause.</Text>
     :<Text accessibilityLabel={`${clock(seconds)} talked`} style={{color:'#9aa2ae',fontSize:15,fontWeight:'600',fontVariant:['tabular-nums']}}>{clock(seconds)}</Text>}
   </View>
   {phase!=='idle'&&<RaisedButton title="End" disabled={phase==='ending'} onPress={()=>void stop()}/>}
  </View>
  {phase==='idle'&&!lines.length&&!blocked&&<View style={[{borderRadius:16,paddingVertical:6,paddingHorizontal:16},well]}>
   {['“What should my sag be?”','“It’s pushing in flat corners.”','“What’s the torque on the rear axle?”'].map((q,i)=><Text key={q} style={{color:'#c9cfd9',fontSize:15,paddingVertical:11,borderTopWidth:i?1:0,borderTopColor:'rgba(255,255,255,0.06)'}}>{q}</Text>)}
  </View>}
  {!!bike&&!!renderChanges&&pending.map(p=><View key={p.id}>{renderChanges(p.response,p.id)}</View>)}
  {saved.length>0&&<View style={[{borderRadius:14,padding:14,gap:4},well]}><Text style={{color:'#9fdcb3',fontSize:13,fontWeight:'700'}}>Saved</Text>{saved.map((x,k)=><Text key={k} style={{color:colors.text,fontSize:14.5}}>{x}</Text>)}</View>}
  {lines.length>0&&<View style={{gap:12}}>{lines.map((l,i)=>l.who==='you'
   ?<View key={i} accessible accessibilityLabel={`You said: ${shown(l.text)}`} style={{alignSelf:'flex-end',maxWidth:'86%',backgroundColor:'#161a21',borderRadius:18,borderBottomRightRadius:6,paddingHorizontal:14,paddingVertical:10}}><Text style={{color:'#dfe3ea',fontSize:15,lineHeight:21}}>{shown(l.text)}</Text></View>
   :<View key={i} accessible accessibilityLabel={`BAK said: ${shown(l.text)}`} style={{alignSelf:'flex-start',maxWidth:'92%',flexDirection:'row',gap:12}}><View style={{width:2,borderRadius:1,backgroundColor:colors.accent,opacity:0.8}}/><Text style={{flex:1,color:colors.text,fontSize:15.5,lineHeight:22}}>{shown(l.text)}</Text></View>)}</View>}
  {!!status&&<View style={{gap:8,paddingTop:4}}>
   <View style={[{height:6,borderRadius:3,overflow:'hidden'},well]}><View style={{width:`${Math.round(share*100)}%`,height:'100%',borderRadius:3,backgroundColor:colors.accent,opacity:0.85}}/></View>
   <Text style={{color:'#9aa2ae',fontSize:13,textAlign:'center'}}>{Math.floor(left/60)} of {Math.round(status.seconds_included/60)} minutes left this month · saved in your chats</Text>
  </View>}
 </View>;
}


/** The round key the rider taps to talk. Raised graphite at rest; while a talk is live it turns blue and two rings move
 * out from it, slowly while it listens and quicker while BAK is checking the bike's data. Still when motion is reduced. */
function TalkKey({phase,working,blocked,onPress}:{phase:Phase;working:boolean;/** talk is not available on this account */blocked:boolean;onPress:()=>void}){
 const SIZE=168,live=phase==='live',busy=phase==='starting'||phase==='ending';
 const a=useRef(new Animated.Value(0)).current,b=useRef(new Animated.Value(0)).current;
 useEffect(()=>{
  if(!live||motion.reduced){a.setValue(0);b.setValue(0);return;}
  const ms=working?1100:2200;
  const ring=(v:Animated.Value)=>Animated.loop(Animated.timing(v,{toValue:1,duration:ms,easing:Easing.out(Easing.quad),useNativeDriver:true}));
  a.setValue(0);b.setValue(0);
  const one=ring(a),two=ring(b);one.start();const t=setTimeout(()=>two.start(),ms/2);
  return()=>{clearTimeout(t);one.stop();two.stop();};
 },[live,working]);
 const ringStyle=(v:Animated.Value)=>({position:'absolute' as const,width:SIZE,height:SIZE,borderRadius:SIZE/2,borderWidth:1.5,borderColor:colors.accent,opacity:v.interpolate({inputRange:[0,1],outputRange:[0.55,0]}),transform:[{scale:v.interpolate({inputRange:[0,1],outputRange:[1,1.5]})}]});
 // The key is BAK blue, the same finish as the voice button that opened this screen, so it reads as the one thing to press.
 // It sits in a recessed seat with a fine lit rim. The rings overflow the layout box, so they take no room at rest.
 return <View style={{width:SIZE+36,height:SIZE+36,alignItems:'center',justifyContent:'center',marginVertical:14}}>
  <View style={[{position:'absolute',width:SIZE+36,height:SIZE+36,borderRadius:(SIZE+36)/2},well]}/>
  <View pointerEvents="none" style={{position:'absolute',width:SIZE+14,height:SIZE+14,borderRadius:(SIZE+14)/2,borderWidth:1,borderColor:'rgba(140,180,255,0.16)'}}/>
  {live&&!motion.reduced&&<><Animated.View pointerEvents="none" style={ringStyle(a)}/><Animated.View pointerEvents="none" style={ringStyle(b)}/></>}
  <Pressable haptic="press" accessibilityRole="button" accessibilityLabel="Start talking" accessibilityState={{disabled:blocked,busy}} disabled={phase!=='idle'||blocked} onPress={onPress}
   style={({pressed})=>[{width:SIZE,height:SIZE,borderRadius:SIZE/2,alignItems:'center',justifyContent:'center',opacity:blocked?0.45:busy?0.8:1},blueLift,pressed&&{transform:[{translateY:2}]}]}>
   {({pressed})=><><BlueFace radius={SIZE/2} pressed={pressed}/><Icon name="voice" size={68} color="#ffffff" weight={2}/></>}
  </Pressable>
 </View>;
}
