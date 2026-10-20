import React,{useCallback,useEffect,useRef,useState} from 'react';
import {View,Text,Pressable,TextInput,Linking} from 'react-native';
import * as Speech from 'expo-speech';
import {activateKeepAwakeAsync,deactivateKeepAwake} from 'expo-keep-awake';
import {ExpoSpeechRecognitionModule,useSpeechRecognitionEvent} from 'expo-speech-recognition';
import type {Bike} from '../../../shared/types';
import {procedureCatalog} from '../../../shared/procedure-catalog';
import {createProcedureRun,validateProcedureRun,recordProcedureStep,followProcedureBranch,procedureStepRecorded,type ProcedureRun,type ReviewedProcedure} from '../../../shared/procedures';
import {parseGuidedInput,stepSpeech,guidedHelp,riderText,toSpeech,type GuidedCommand} from '../../../shared/guided-job';
import {readProgress,writeProgress} from './localProgress';
import {Button,Card,Copy,Notice,Select,colors,s} from './ui';

// Same storage as the Workshop guide screen (procedure-<bike>-<procedure>, newest run first), so progress is shared.
const runsKey=(bike:Bike,p:ReviewedProcedure)=>`procedure-${bike.id}-${p.id}`;
const activeKey=(bike:Bike)=>`guided-active-${bike.id}`;
function loadRun(owner:string,bike:Bike,p:ReviewedProcedure){
 const list=readProgress<unknown[]>(owner,runsKey(bike,p),[]);
 for(const v of list){const r=validateProcedureRun(v,bike,p);if(r)return r;}
 return null;
}

export type NativeGuidedJob=ReturnType<typeof useGuidedJobNative>;
export function useGuidedJobNative(owner:string,bike?:Bike){
 const {available,groups}=bike?procedureCatalog(bike):{available:[] as ReviewedProcedure[],groups:[] as {id:string;title:string;procedures:ReviewedProcedure[]}[]};
 const [procedureId,setProcedureId]=useState(()=>bike?readProgress(owner,activeKey(bike),''):'');
 const procedure=available.find(p=>p.id===procedureId)??null;
 const [run,setRun]=useState<ProcedureRun|null>(()=>bike&&procedure?loadRun(owner,bike,procedure):null);
 const [notice,setNotice]=useState('');
 const save=(next:ProcedureRun,p=procedure)=>{
  if(!bike||!p)return false;
  try{const list=readProgress<unknown[]>(owner,runsKey(bike,p),[]);const rest=list.filter(v=>(v as ProcedureRun)?.started_at!==next.started_at);writeProgress(owner,runsKey(bike,p),[next,...rest]);setRun(next);setNotice('');return true;}
  catch{setNotice('This device could not save your progress. Your step has not moved.');return false;}
 };
 function start(id:string){
  if(!bike)return '';const p=available.find(x=>x.id===id);if(!p)return '';
  try{writeProgress(owner,activeKey(bike),id);}catch{}
  setProcedureId(id);
  const existing=loadRun(owner,bike,p);
  if(existing){setRun(existing);return `Picking up ${p.title}. ${stepSpeech(p,existing.step_index)}`;}
  const fresh=createProcedureRun(bike,p,true);save(fresh,p);
  return `Starting ${p.title}. ${p.steps.length} steps. ${stepSpeech(p,0)}`;
 }
 function end(){if(bike){try{writeProgress(owner,activeKey(bike),'');}catch{}}setProcedureId('');setRun(null);return 'Job closed. Your progress is saved; start it again any time to pick up where you left off.';}
 const finished=!!run&&!!procedure&&procedure.steps.every(x=>procedureStepRecorded(run,x.id));
 const step=run&&procedure?procedure.steps[run.step_index]:null;
 function handle(cmd:GuidedCommand):string{
  if(!procedure||!run||!step||!bike)return '';
  try{
   if(cmd.kind==='repeat')return stepSpeech(procedure,run.step_index);
   if(cmd.kind==='where')return finished?`All ${procedure.steps.length} steps are recorded for ${procedure.title}.`:`You're on step ${run.step_index+1} of ${procedure.steps.length}: ${riderText(step.title)}.`;
   if(cmd.kind==='end')return end();
   if(cmd.kind==='record'){const next=recordProcedureStep(run,procedure,`${step.verification.join(' ')}\nRecorded: ${cmd.text}`);if(!save(next))return 'That could not be saved. Try again.';return `Recorded ${cmd.text}. ${next.step_index===run.step_index?'That was the last step.':stepSpeech(procedure,next.step_index)}`;}
   if(cmd.kind==='next'){
    if(step.branches?.length)return 'This step has more than one way forward. Pick the option that matches what you found on the screen.';
    if(step.record_required)return 'This step needs a measurement first. Say "record" and the number.';
    if(procedureStepRecorded(run,step.id)&&run.step_index===procedure.steps.length-1)return `That's the last step. ${procedure.title} is fully recorded.`;
    const next=recordProcedureStep(run,procedure,step.verification.join(' ')||'Checked');
    if(!save(next))return 'That could not be saved. Try again.';
    if(next.step_index===run.step_index)return `Last step checked. ${procedure.title} is complete. Nice work.`;
    return stepSpeech(procedure,next.step_index);
   }
   if(cmd.kind==='back'){
    let i=run.step_index-1;while(i>=0&&run.bypassed?.[procedure.steps[i].id])i--;
    if(i<0)return 'You are on the first step.';
    const back={...run,step_index:i};if(!validateProcedureRun(back,bike,procedure))return 'That step cannot be reopened from here.';
    if(!save(back))return 'That could not be saved.';return stepSpeech(procedure,i);
   }
  }catch(e){return (e as Error).message;}
  return '';
 }
 function branch(id:string,notes:string){if(!procedure||!run)return '';try{const next=followProcedureBranch(run,procedure,id,notes);if(!save(next))return 'That could not be saved.';return stepSpeech(procedure,next.step_index);}catch(e){return (e as Error).message;}}
 const guided=procedure&&run?{procedure_id:procedure.id,step_index:run.step_index}:null;
 return {available,groups,procedure,run,step,finished,notice,start,end,handle,branch,guided};
}

/** Hands-free workshop listening on the phone: continuous recognition, screen kept awake, mic paused while BAK speaks. */
export function useNativeVoice(onUtterance:(text:string)=>void){
 const [on,setOn]=useState(false),[heard,setHeard]=useState(''),[speaking,setSpeaking]=useState(false),[problem,setProblem]=useState('');
 const wanted=useRef(false),talking=useRef(false),cb=useRef(onUtterance);cb.current=onUtterance;
 const listen=useCallback(()=>{
  if(!wanted.current||talking.current)return;
  try{ExpoSpeechRecognitionModule.start({lang:'en-US',interimResults:false,continuous:true,addsPunctuation:false,iosTaskHint:'dictation',contextualStrings:['BAK','next','repeat','go back','record','where am I','stop listening']});}catch{/* already running */}
 },[]);
 useSpeechRecognitionEvent('result',e=>{if(!e.isFinal)return;const t=(e.results?.[0]?.transcript??'').trim();if(t){setHeard(t);cb.current(t);}});
 useSpeechRecognitionEvent('end',()=>{if(wanted.current&&!talking.current)setTimeout(listen,300);});
 useSpeechRecognitionEvent('error',e=>{if(e.error==='not-allowed'){wanted.current=false;setOn(false);setProblem('Microphone or speech access is off. Turn it on for BAK MX in Settings to use workshop mode.');}});
 const enable=useCallback(async()=>{
  try{const r=await ExpoSpeechRecognitionModule.requestPermissionsAsync();if(!r.granted){setProblem('Microphone or speech access is off. Turn it on for BAK MX in Settings to use workshop mode.');return false;}}
  catch{setProblem('Voice is not available on this device.');return false;}
  wanted.current=true;setOn(true);setProblem('');
  try{await activateKeepAwakeAsync('bak-workshop');}catch{}
  listen();return true;
 },[listen]);
 const disable=useCallback(()=>{wanted.current=false;setOn(false);try{ExpoSpeechRecognitionModule.abort();}catch{}Speech.stop();talking.current=false;setSpeaking(false);try{deactivateKeepAwake('bak-workshop');}catch{}},[]);
 const speak=useCallback((text:string)=>{
  if(!text)return;
  talking.current=true;setSpeaking(true);try{ExpoSpeechRecognitionModule.abort();}catch{}
  const done=()=>{talking.current=false;setSpeaking(false);setTimeout(listen,350);};
  Speech.stop();Speech.speak(text,{language:'en-US',rate:1.0,onDone:done,onStopped:done,onError:done});
 },[listen]);
 const hush=useCallback(()=>{Speech.stop();},[]);
 useEffect(()=>()=>{wanted.current=false;try{ExpoSpeechRecognitionModule.abort();}catch{}Speech.stop();try{deactivateKeepAwake('bak-workshop');}catch{}},[]);
 return {on,heard,speaking,problem,enable,disable,speak,hush};
}

const pill=(active:boolean)=>({flex:1,minHeight:52,borderRadius:14,alignItems:'center' as const,justifyContent:'center' as const,backgroundColor:active?colors.accent:'#1b2130',borderWidth:1,borderColor:active?colors.accent:colors.line});
export function GuidedJobCardNative({job,voice,onSay,busy}:{job:NativeGuidedJob;voice:ReturnType<typeof useNativeVoice>;onSay:(text:string)=>void;busy:boolean}){
 const [picking,setPicking]=useState(false),[record,setRecord]=useState(''),[finding,setFinding]=useState(''),[open,setOpen]=useState(false);
 const {procedure,run,step,finished}=job;
 if(!job.available.length)return null;
 if(!procedure||!run)return picking?<Card><Select label="Guided job for this bike" value="" options={[{value:'',label:'Choose a job'},...job.groups.flatMap(g=>g.procedures.map(p=>({value:p.id,label:`${p.title} · ${p.steps.length} steps`})))]} onChange={v=>{if(v){onSay(job.start(v));setPicking(false);}}}/><Button secondary title="Cancel" onPress={()=>setPicking(false)}/></Card>:<Button secondary title="Working on the bike? Get walked through it →" onPress={()=>setPicking(true)}/>;
 const done=procedure.steps.filter(x=>procedureStepRecorded(run,x.id)).length;
 const link=step?.diagram_reference_required?step.source_links.find(l=>/^https?:\/\//.test(l)):undefined;
 return <Card>
  <Text style={{color:colors.accent,fontWeight:'800',letterSpacing:2,fontSize:11}}>{finished?'JOB COMPLETE':`STEP ${run.step_index+1} OF ${procedure.steps.length}`}</Text>
  <Text numberOfLines={1} style={{color:'#aab3c2',fontSize:13,fontWeight:'600'}}>{procedure.title}</Text>
  <View style={{height:4,borderRadius:2,backgroundColor:'#222834',overflow:'hidden'}}><View style={{height:4,width:`${100*done/procedure.steps.length}%`,backgroundColor:colors.accent}}/></View>
  {step&&<><Text style={{color:colors.text,fontSize:20,fontWeight:'800'}}>{riderText(step.title)}</Text><Text selectable numberOfLines={open?undefined:4} style={{color:colors.text,fontSize:17,lineHeight:25}}>{riderText(step.instruction)}</Text><Pressable accessibilityRole="button" onPress={()=>setOpen(!open)}><Text style={{color:colors.accent,fontWeight:'700'}}>{open?'Less':'More'}</Text></Pressable>{open&&step.verification.map((v,i)=><Copy key={i}>✓ {riderText(v)}</Copy>)}</>}
  {link&&<Button secondary title="Show the picture for this step" onPress={()=>void Linking.openURL(link).catch(()=>{})}/>}
  {step?.record_required&&!finished&&<View style={{gap:8}}><TextInput value={record} onChangeText={setRecord} placeholder="Measurement or finding" placeholderTextColor="#7c858e" style={s.input} accessibilityLabel="Record a measurement"/><Button title="Record and continue" disabled={!record.trim()} onPress={()=>{onSay(job.handle({kind:'record',text:record.trim()}));setRecord('');}}/></View>}
  {!!step?.branches?.length&&<View style={{gap:8}}><TextInput value={finding} onChangeText={setFinding} placeholder="What you measured or found" placeholderTextColor="#7c858e" style={s.input}/>{step.branches.map(b=><Button key={b.id} secondary disabled={!finding.trim()} title={b.label} onPress={()=>{onSay(job.branch(b.id,finding));setFinding('');}}/>)}</View>}
  <Notice text={job.notice}/>
  <View style={{flexDirection:'row',gap:8}}>
   <Pressable accessibilityRole="button" accessibilityLabel="Previous step" disabled={run.step_index===0} onPress={()=>onSay(job.handle({kind:'back'}))} style={[pill(false),{opacity:run.step_index===0?0.4:1}]}><Text style={{color:colors.text,fontWeight:'700'}}>‹ Back</Text></Pressable>
   <Pressable accessibilityRole="button" accessibilityLabel="Repeat this step" onPress={()=>onSay(job.handle({kind:'repeat'}))} style={pill(false)}><Text style={{color:colors.text,fontWeight:'700'}}>Repeat</Text></Pressable>
   <Pressable accessibilityRole="button" accessibilityLabel="Step done, next step" disabled={finished||!!step?.record_required||!!step?.branches?.length} onPress={()=>{setOpen(false);onSay(job.handle({kind:'next'}));}} style={[pill(true),{flex:1.4,opacity:finished||step?.record_required||step?.branches?.length?0.4:1}]}><Text style={{color:'#0a0d12',fontWeight:'800'}}>Done ›</Text></Pressable>
  </View>
  <Button secondary={!voice.on} title={voice.on?'Hands-free on · tap to stop':'Hands-free'} onPress={()=>{if(voice.on)voice.disable();else void voice.enable().then(ok=>{if(ok)voice.speak(toSpeech(`Workshop mode on. ${guidedHelp} ${stepSpeech(procedure,run.step_index)}`));});}}/>
  {voice.on&&<Copy>{voice.speaking?'Speaking…':busy?'Thinking…':voice.heard?`Heard: “${voice.heard}”`:'Listening. Say “next”, “repeat”, or “Hey BAK” and your question.'}</Copy>}
  {voice.speaking&&<Button secondary title="Quiet" onPress={voice.hush}/>}
  <Notice text={voice.problem}/>
  <Button secondary title="Close job (progress is kept)" onPress={()=>onSay(job.end())}/>
 </Card>;
}
