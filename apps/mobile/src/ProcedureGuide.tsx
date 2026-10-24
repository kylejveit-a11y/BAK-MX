import React,{useEffect,useRef,useState} from 'react';
import {syncGuideActivity} from './widgets/sync';
import {Linking,View,Share,Text,TextInput,Pressable,ScrollView} from 'react-native';
import type {Bike} from '../../../shared/types';
import {procedureCatalog} from '../../../shared/procedure-catalog';
import {createProcedureRun,validateProcedureRun,recordProcedureStep,followProcedureBranch,procedureStepRecorded,type ProcedureRun,type ReviewedProcedure} from '../../../shared/procedures';
import {BackLink,Button,Card,Copy,Eyebrow,LinkAction,Notice,Page,Select,Tile,TileGrid,colors} from './ui';
import {Disclosure} from './RichText';
import {useProgress,readProgress} from './localProgress';

// Guided jobs. One screen per step: the step, what to check, one clear box for the measurement, and the Next button pinned
// above the tab bar, so a rider with dirty hands never has to scroll past the guide's introduction to keep going.

const runKey=(bike:Bike,p:ReviewedProcedure)=>`procedure-${bike.id}-${p.id}`;
function progressOf(ownerId:string,bike:Bike,p:ReviewedProcedure){
 try{const runs=(readProgress<ProcedureRun[]>(ownerId,runKey(bike,p),[])??[]).map(v=>validateProcedureRun(v,bike,p)).filter((v):v is ProcedureRun=>!!v);const r=runs[0];if(!r)return '';
  return p.steps.every(s=>procedureStepRecorded(r,s.id))?'Done':`Step ${r.step_index+1} of ${p.steps.length}`;}catch{return '';}
}

export default function ProcedureGuide({bike,ownerId,onClose,onAsk}:{bike:Bike;ownerId:string;onClose:()=>void;onAsk?:(context:string)=>void}){
 const [selected,setSelected]=useState(''),[footer,setFooter]=useState<React.ReactNode>(null);
 const scroll=useRef<ScrollView>(null);
 const {available,groups,coverage}=procedureCatalog(bike),procedure=available.find(p=>p.id===selected);
 useEffect(()=>{scroll.current?.scrollTo({y:0,animated:false});if(!procedure)setFooter(null);},[selected]);
 return <Page title={procedure?'':'Guided jobs'} scrollRef={scroll} footer={procedure?footer:undefined}>
  {procedure?<>
   <BackLink title="All guides" onPress={()=>setSelected('')}/>
   <ProcedureSession key={procedure.id} bike={bike} ownerId={ownerId} procedure={procedure} onAsk={onAsk} setFooter={setFooter} toTop={()=>scroll.current?.scrollTo({y:0,animated:true})}/>
  </>:<>
   <BackLink title="Workshop" onPress={onClose}/>
   <Copy strong>{bike.model_year} {bike.manufacturer} {bike.model}</Copy>
   {!available.length&&<Copy>No step-by-step guide is available for this exact bike yet. Job notes in Workshop still keep your own measurements.</Copy>}
   {groups.map(group=>group.procedures.length>0&&<View key={group.title} style={{gap:2}}>
    <Eyebrow>{group.title.toUpperCase()}</Eyebrow>
    <TileGrid>{group.procedures.map(p=>{const prog=progressOf(ownerId,bike,p);return <Tile key={p.id} title={p.title} detail={`${p.steps.length} steps`} right={prog||undefined} onPress={()=>setSelected(p.id)}/>;})}</TileGrid>
   </View>)}
   {available.length>0&&<Disclosure title="What these guides cover">
    <Copy>Each guide is written for this exact year and model with stock parts. Some start with the engine or part already out; the start of each guide says where it begins.</Copy>
    {coverage.map(item=><Copy key={item.system}>{item.system}: {item.available} {item.remaining}</Copy>)}
   </Disclosure>}
  </>}
 </Page>;
}

function ProcedureSession({bike,ownerId,procedure,onAsk,setFooter,toTop}:{bike:Bike;ownerId:string;procedure:ReviewedProcedure;onAsk?:(context:string)=>void;setFooter:(n:React.ReactNode)=>void;toTop:()=>void}){
 const [stored,saveStored,storageError]=useProgress<ProcedureRun[]>(ownerId,runKey(bike,procedure),[],{durable:true});
 const history=Array.isArray(stored)?stored:[];
 const runs=history.map(value=>validateProcedureRun(value,bike,procedure)).filter((value):value is ProcedureRun=>value!==null);
 const [chosen,setChosen]=useState('');const run=runs.find(value=>value.started_at===chosen)??runs[0];
 const [notice,setNotice]=useState('');
 function start(){try{const next=createProcedureRun(bike,procedure,true);if(saveStored([next,...history]))setChosen(next.started_at);setNotice('');toTop();}catch(e){setNotice((e as Error).message);}}
 function save(next:ProcedureRun){return saveStored(history.map(value=>value===run?next:value));}
 useEffect(()=>{if(!run)setFooter(<View style={{padding:12,gap:6}}><Notice text={notice}/><Button title="Start this guide" onPress={start}/></View>);},[!!run,notice,history.length]);
 return <>
  <Text style={{color:colors.text,fontSize:24,fontWeight:'800',letterSpacing:-0.4}}>{procedure.title}</Text>
  <Notice text={storageError}/>
  <AboutGuide procedure={procedure} open={!run}/>
  {runs.length>1&&<Select label="Saved run" value={run?.started_at??''} options={runs.map(value=>({value:value.started_at,label:new Date(value.started_at).toLocaleString()}))} onChange={setChosen}/>}
  {run?<ProcedureSteps key={run.started_at} procedure={procedure} run={run} save={save} start={start} onAsk={onAsk} setFooter={setFooter} toTop={toTop}/>:<Card>
   <Copy strong>Before you begin</Copy>
   {procedure.prerequisites.map((text,i)=><Copy key={i}>• {text}</Copy>)}
   {procedure.required_parts.length>0&&<><Copy strong>Have these ready</Copy>{procedure.required_parts.map((part,i)=><Copy key={i}>• {part.name}: {part.purpose}</Copy>)}</>}
   {history.length>0&&<Copy>An earlier run was for a different build of this bike. It stays in your exported data; starting now begins a fresh run.</Copy>}
   <Copy>Start when the bike is stock for the parts this guide touches.</Copy>
  </Card>}
 </>;
}

function AboutGuide({procedure,open}:{procedure:ReviewedProcedure;open:boolean}){
 const [error,setError]=useState('');
 const body=<View style={{gap:8}}>
  <Copy>{procedure.completeness}</Copy>
  {!!procedure.entry_state?.length&&<Copy>Starts with: {procedure.entry_state.join(' ')}</Copy>}
  {!!procedure.exit_state?.length&&<Copy>Finishes with: {procedure.exit_state.join(' ')}</Copy>}
  {procedure.required_tools.length>0&&<><Copy strong>Tools</Copy>{procedure.required_tools.map((tool,i)=><Copy key={i}>• {tool.name}{tool.size?` · ${tool.size}`:''}</Copy>)}</>}
  {procedure.excluded.length>0&&<Copy>Not covered: {procedure.excluded.join('; ')}.</Copy>}
  {procedure.critical_stop_conditions.length>0&&<><Copy strong>Stop if</Copy>{procedure.critical_stop_conditions.map((c,i)=><Copy key={i}>• {c}</Copy>)}</>}
  {procedure.supplemental_sources?.map((source,i)=><LinkAction key={i} title={'Open '+source.attribution} onPress={()=>void Linking.openURL(source.url).catch(()=>setError('The source could not open. Try again when connected.'))}/>)}
  {/^https?:\/\//.test(procedure.source.source_url)&&<LinkAction title="Open the source document" onPress={()=>void Linking.openURL(procedure.source.source_url).catch(()=>setError('The source could not open. Try again when connected.'))}/>}
  <Copy>Your checks and measurements save on this phone for this bike.</Copy>
  <Notice text={error}/>
 </View>;
 return open?body:<Disclosure title="About this guide: tools, scope, stop rules">{body}</Disclosure>;
}

function ProcedureSteps({procedure,run,save,start,onAsk,setFooter,toTop}:{procedure:ReviewedProcedure;run:ProcedureRun;save:(next:ProcedureRun)=>boolean;start:()=>void;onAsk?:(context:string)=>void;setFooter:(n:React.ReactNode)=>void;toTop:()=>void}){
 const step=procedure.steps[run.step_index],complete=procedure.steps.every(s=>procedureStepRecorded(run,s.id));
 const [drafts,setDrafts,draftError]=useProgress<Record<string,string>>(run.owner_id,`procedure-draft-${run.bike_id}-${procedure.id}-${run.started_at}`,{});
 const [notice,setNotice]=useState('');
 const notes=drafts[step.id]??'',needsNote=!!step.record_required&&!notes.trim();
 function finish(){try{if(needsNote)throw new Error('Write what you measured or found in the box above, then tap Next.');const verification=step.verification.join(' ');const next=recordProcedureStep(run,procedure,verification+(step.diagram_reference_required?'\nConfirmed the linked source diagram matches this step.':'')+(notes.trim()?`\nRecorded: ${notes.trim()}`:''));if(save(next)){setNotice('');toTop();}}catch(e){setNotice((e as Error).message);}}
 function branch(id:string){try{if(save(followProcedureBranch(run,procedure,id,notes))){setNotice('');toTop();}}catch(e){setNotice((e as Error).message);}}
 const stepRecord=(id:string)=>run.completed[id]?.notes.replace(/^[\s\S]*?\nRecorded: /,'Recorded: ')??(run.bypassed?.[id]?'Skipped by the route chosen':'Not yet done');
 const recap=()=>`${procedure.title}\n${procedure.steps.map((s,i)=>`${i+1}. ${s.title}\n${run.completed[s.id]?.notes??(run.bypassed?.[s.id]?'Not performed: '+run.bypassed[s.id].notes:'Not yet recorded')}`).join('\n\n')}`;
 const last=run.step_index===procedure.steps.length-1;
 // Lock Screen / Dynamic Island: the step you're on stays visible while the phone is locked on the bench.
 useEffect(()=>{const t=procedure.target;syncGuideActivity(`${procedure.id}|${run.started_at}`,{guide:procedure.title,bike:`${t.model_year} ${t.model}`,stepIndex:run.step_index,total:procedure.steps.length,stepTitle:step.title,verification:step.verification,needsNote,done:complete});},[procedure.id,run.started_at,run.step_index,complete,needsNote]);
 useEffect(()=>{
  if(complete){setFooter(null);return;}
  setFooter(<View style={{padding:12,gap:6}}>
   {!!notice&&<Text style={{color:'#f0b4bd',fontSize:13.5,lineHeight:19}}>{notice}</Text>}
   {!notice&&needsNote&&<Text style={{color:'#b2b9c4',fontSize:13,lineHeight:18}}>This step needs a measurement or note before you continue.</Text>}
   <Button title={last?'Done — finish guide':'Done — next step'} disabled={needsNote} onPress={finish}/>
  </View>);
 },[complete,notice,needsNote,run,notes]);
 if(complete)return <Card><Copy strong>Guide complete</Copy><Copy>All {procedure.steps.length} steps are recorded.</Copy>
  {procedure.steps.map((s,i)=><View key={s.id} style={{gap:2}}><Text style={{color:colors.text,fontSize:15,fontWeight:'600'}}>{i+1}. {s.title}</Text><Copy>{stepRecord(s.id)}</Copy></View>)}
  <LinkAction title="Share the record" onPress={()=>void Share.share({message:recap()}).catch(()=>setNotice('The share sheet could not open. Your record is saved.'))}/>
  <LinkAction title="Start another run" onPress={start}/><Notice text={notice}/></Card>;
 const done=procedure.steps.filter(s=>procedureStepRecorded(run,s.id)).length;
 return <View style={{gap:16}}>
  <View style={{gap:8}}>
   <Text style={{color:'#b2b9c4',fontSize:13,fontWeight:'600'}}>STEP {run.step_index+1} OF {procedure.steps.length}</Text>
   <View style={{height:4,borderRadius:2,backgroundColor:'#232833',overflow:'hidden'}}><View style={{height:4,width:`${Math.round(done/procedure.steps.length*100)}%`,backgroundColor:colors.accent}}/></View>
  </View>
  <Text style={{color:colors.text,fontSize:22,fontWeight:'800',letterSpacing:-0.3}}>{step.title}</Text>
  <Text selectable style={{color:colors.text,fontSize:17,lineHeight:26}}>{step.instruction}</Text>
  {step.source_links.map((url,i)=><Button key={i} secondary title={step.diagram_reference_required?'Open the diagram for this step':'Open the source for this step'} onPress={()=>void Linking.openURL(url).catch(()=>setNotice('The source could not open. Try again when connected.'))}/>)}
  {step.verification.length>0&&<View style={{gap:6,borderLeftWidth:2,borderLeftColor:colors.accent,paddingLeft:12}}>
   <Eyebrow>CHECK BEFORE YOU MOVE ON</Eyebrow>
   {step.verification.map((text,i)=><Copy key={i}>• {text}</Copy>)}
  </View>}
  <View style={{gap:6}}>
   <Text style={{color:colors.text,fontSize:14.5,fontWeight:'700'}}>{step.record_required?'Write what you measured or found (needed)':'Notes or measurements (optional)'}</Text>
   <TextInput accessibilityLabel="Step notes" multiline value={notes} maxLength={7000} onChangeText={text=>{setDrafts({...drafts,[step.id]:text});if(notice)setNotice('');}}
    placeholder={step.record_required?'The number you measured, or what you saw':'Anything worth remembering'} placeholderTextColor="#7d8593" selectionColor={colors.accent}
    style={{minHeight:84,borderWidth:1,borderColor:step.record_required&&!notes.trim()?colors.accent:'#343a45',borderRadius:12,padding:12,color:colors.text,fontSize:16,textAlignVertical:'top',backgroundColor:'#0d1015'}}/>
  </View>
  {step.branches?.length?<View style={{gap:8}}>
   <Eyebrow>OR, IF THIS APPLIES</Eyebrow>
   {step.branches.map(choice=><Pressable key={choice.id} accessibilityRole="button" disabled={!notes.trim()} onPress={()=>branch(choice.id)} style={({pressed})=>({borderWidth:1,borderColor:'#343a45',borderRadius:12,padding:12,gap:3,opacity:!notes.trim()?0.5:pressed?0.7:1})}>
    <Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>{choice.label}</Text><Copy>{choice.condition}</Copy>
   </Pressable>)}
   {!notes.trim()&&<Copy>Write what you found in the box above to choose one of these.</Copy>}
  </View>:null}
  {onAsk&&<LinkAction title="Ask BAK about this step" onPress={()=>onAsk(`${procedure.title}\nStep ${run.step_index+1}: ${step.title}\n${step.instruction}\nMy notes: ${notes||'None yet'}`)}/>}
  <Notice text={draftError}/>
  <Disclosure title={`All steps (${done} of ${procedure.steps.length} done)`}>
   {procedure.steps.map((s,i)=>{const rec=procedureStepRecorded(run,s.id),cur=i===run.step_index;return <View key={s.id} style={{flexDirection:'row',gap:10}}>
    <Text style={{color:rec?colors.accent:cur?colors.text:'#7d8593',fontSize:14,width:22}}>{rec?'✓':`${i+1}`}</Text>
    <View style={{flex:1}}><Text style={{color:cur?colors.text:rec?'#bcc3cd':'#7d8592',fontSize:14.5,fontWeight:cur?'700':'500'}}>{s.title}</Text>{rec&&<Text style={{color:'#7d8592',fontSize:12.5}} numberOfLines={2}>{stepRecord(s.id)}</Text>}</View>
   </View>;})}
  </Disclosure>
 </View>;
}
