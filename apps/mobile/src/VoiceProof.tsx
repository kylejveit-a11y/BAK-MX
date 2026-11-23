// Talk to BAK, proof screen (docs/plans/VOICE.md). Hidden: it only shows for accounts on the server's tester list.
// The voice model only listens and speaks. When it hands a bike question off, this screen sends the rider's words to
// the normal Ask BAK engine and gives the answer back to be spoken, so voice follows the same data and safety rules
// as typed answers. No audio is kept; the conversation lands in the rider's chats like any other.
import React,{useEffect,useRef,useState} from 'react';
import {Text,View} from 'react-native';
import {randomUUID} from 'expo-crypto';
import {api,apiStream} from './api';
import {colors,Copy,Notice} from './ui';
import {Raised,RaisedButton,well} from './Raised';
import type {Bike,Conversation,EngineeringResponse} from '../../../shared/types';
import {VOICE,VOICES,type VoiceName,type VoiceStatus} from '../../../shared/voice';
import {Pressable} from './Touch';
import {readProgress,writeProgress} from './localProgress';

type Phase='idle'|'starting'|'live'|'ending';
type Line={who:'you'|'bak';text:string;at:number};
const clock=(s:number)=>`${Math.floor(s/60)}:${String(Math.max(0,s)%60).padStart(2,'0')}`;
const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Try again.';
/** A written answer made speakable: no markdown marks, and short enough for one handoff. */
const speakable=(r:EngineeringResponse)=>[r.summary,r.answer??'',r.next_step?.action?`Next step: ${r.next_step.action}`:''].filter(Boolean).join('\n').replace(/[*_#`>|]/g,'').replace(/\n{2,}/g,'\n').slice(0,1800);

export function useVoiceStatus(){const [status,setStatus]=useState<VoiceStatus|null>(null);useEffect(()=>{let live=true;api<VoiceStatus>('/api/voice').then(s=>{if(live)setStatus(s);}).catch(()=>{});return()=>{live=false;};},[]);return status;}

type Pending={id:string;response:EngineeringResponse};
const cap=(s:string)=>s.charAt(0).toUpperCase()+s.slice(1);
export function VoiceProof({bike,ownerId,renderChanges}:{bike?:Bike;ownerId:string;/** the same confirm cards typed chat shows for a Garage or settings change */renderChanges?:(response:EngineeringResponse,messageId:string)=>React.ReactNode}){
 const [voice,setVoice]=useState<VoiceName>(()=>{const saved=readProgress<string>(ownerId,'voice-name',VOICE.voice);return (VOICES as readonly string[]).includes(saved)?saved as VoiceName:VOICE.voice;}),[pending,setPending]=useState<Pending[]>([]);
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
 const send=(event:Record<string,unknown>)=>{const dc=call.current?.dc;if(dc&&dc.readyState==='open')dc.send(JSON.stringify(event));};

 async function answer(delegationId:string){
  const c=call.current;if(!c)return;const question=c.heard.trim();c.heard='';
  send({type:'session.thinking.append',event_id:randomUUID(),delegation_id:delegationId,content:''});
  if(!bike||!question){send({type:'session.commentary.append',event_id:randomUUID(),delegation_id:delegationId,content:bike?'I did not catch the question. Ask the rider to say it again.':'The rider has not added a bike yet. Ask them to add their bike in the Garage first.'});return;}
  setWorking(true);
  try{
   if(!c.conversation){const conv=await api<Conversation>('/api/conversations','POST',{bike_id:bike.id,title:('Talk to BAK: '+question).slice(0,100),mode:'ask',create_id:randomUUID()});c.conversation=conv.id;}
   const r=await apiStream<{response:EngineeringResponse;message?:{id?:string}}>('/api/chat',{conversation_id:c.conversation,request_id:randomUUID(),message:question,voice:true},()=>{});
   const changes=[...(r.response.garage_updates??[]).map(u=>`${u.field||u.name} ${u.value}`.trim()),...(r.response.app_actions??[]).map(a=>a.type.replace(/_/g,' '))];
   if(changes.length)setPending(old=>[...old.slice(-2),{id:r.message?.id||randomUUID(),response:r.response}]);
   send({type:'session.commentary.append',event_id:randomUUID(),delegation_id:delegationId,content:(speakable(r.response)+(changes.length?`\nA change is waiting on the rider's screen for them to confirm with a tap: ${changes.join('; ')}. It is NOT saved yet.`:'')).slice(0,1900)});
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
  if(phase!=='idle')return;setNotice('');setLines([]);setPending([]);setSeconds(0);setPhase('starting');
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
   const res=await api<{session_id:string;sdp:string;seconds_left:number}>('/api/voice/session','POST',{sdp:offer.sdp,voice,bike:bike?`${bike.model_year} ${bike.manufacturer} ${bike.model}`:undefined});
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
 return <View style={{gap:16}}>
  <Copy>Test version. Ask about your bike out loud. BAK checks your bike’s data before it answers, so there’s a short pause after each question. The conversation is saved in your chats.</Copy>
  <Notice text={notice||blocked} tone={notice||blocked?'warn':undefined}/>
  <Raised radius={20}><View style={{padding:20,gap:14,alignItems:'center'}}>
   <Text style={{color:'#9aa2ae',fontSize:13}}>{phase==='live'?(working?'Checking your bike’s data…':'Listening'):phase==='starting'?'Connecting…':phase==='ending'?'Ending…':'Ready'}</Text>
   <Text accessibilityLabel={`${clock(seconds)} talked`} style={{color:colors.text,fontSize:44,fontWeight:'800',letterSpacing:-1,fontVariant:['tabular-nums']}}>{clock(seconds)}</Text>
   {phase==='idle'?<RaisedButton title="Start talking" disabled={!status?.allowed} onPress={()=>void start()}/>:<RaisedButton title="End" disabled={phase==='ending'} onPress={()=>void stop()}/>}
   {!!status&&<Text style={{color:'#9aa2ae',fontSize:13}}>{Math.floor(left/60)} of {Math.round(status.seconds_included/60)} minutes left this month</Text>}
  </View></Raised>
  {!!bike&&!!renderChanges&&pending.map(p=><View key={p.id}>{renderChanges(p.response,p.id)}</View>)}
  {phase==='idle'&&<View style={{gap:9}}><Text style={{color:'#8b93a0',fontSize:13,fontWeight:'700'}}>Voice (test: pick one, start talking, then try another)</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{VOICES.map(n=>{const on=n===voice;return <Pressable key={n} accessibilityRole="button" accessibilityState={{selected:on}} onPress={()=>{setVoice(n);writeProgress(ownerId,'voice-name',n);}} style={{paddingHorizontal:13,height:36,borderRadius:18,justifyContent:'center',borderWidth:1,borderColor:on?colors.accent:'rgba(255,255,255,.14)',backgroundColor:on?'rgba(255,255,255,.07)':'transparent'}}><Text style={{color:colors.text,fontSize:14,fontWeight:on?'700':'500'}}>{cap(n)}</Text></Pressable>;})}</View></View>}
  {lines.length>0&&<View style={[{borderRadius:14,padding:14,gap:10},well]}>{lines.map((l,i)=><View key={i} style={{gap:2}}><Text style={{color:'#8b93a0',fontSize:12,fontWeight:'700'}}>{l.who==='you'?'You':'BAK'}</Text><Text style={{color:l.who==='you'?'#c9cfd9':colors.text,fontSize:15,lineHeight:21}}>{l.text.trim()}</Text></View>)}</View>}
 </View>;
}
