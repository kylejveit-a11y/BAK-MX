import React,{useState} from 'react';
import {View,Text,TextInput,Switch} from 'react-native';
import {Pressable} from './Touch';
import type {Bike} from '../../../shared/types';
import type {SetupLog,SetupResult} from '../../../shared/rider-types';
import {complaintGroups,complaintLabel,deciderAnswers,throttleAnswers,whereAnswers,trackAnswers,triageSteps,composeTriage,type TriageAnswers} from '../../../shared/triage';
import {pendingGarageUpdates,applyGarageUpdates,garageFieldLabel,type GarageUpdate} from '../../../shared/garage-updates';
import {systemLabel} from '../../../shared/installed-parts';
import {api} from './api';
import {BlueFace,blueLift,onBlueText,Button,Card,Copy,Icon,Notice,colors} from './ui';

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
function Chip({label,on=false,quiet=false,center=false,onPress}:{label:string;on?:boolean;quiet?:boolean;center?:boolean;onPress:()=>void}){
 return <Pressable haptic="select" accessibilityRole="button" accessibilityState={{selected:on}} onPress={onPress} style={({pressed})=>[ch.chip,on&&ch.on,on&&blueLift,quiet&&{borderColor:'transparent',paddingHorizontal:6},center&&{paddingHorizontal:6,alignItems:'center'},pressed&&{opacity:0.6}]}>{on&&<BlueFace radius={20}/>}<Text numberOfLines={center?1:undefined} adjustsFontSizeToFit={center} style={[ch.text,on&&{color:'#ffffff',fontWeight:'700'},on&&onBlueText,quiet&&{color:colors.accent,fontWeight:'600'},center&&{textAlign:'center'}]}>{label}</Text></Pressable>;
}
const ch={chip:{paddingVertical:10,paddingHorizontal:15,borderRadius:20,borderWidth:1,borderColor:'#343a45',backgroundColor:'transparent'},on:{borderColor:'transparent'},text:{color:colors.text,fontSize:15}};
const Wrap=({children}:{children:React.ReactNode})=><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{children}</View>;

type Step='complaint'|'decider'|'throttle'|'where'|'track'|'review';
/** Guided handling-problem intake: tap answers instead of typing, with "type it myself" at every step. The result lands in
 *  the question box so the rider can edit it before sending. Same questions as the website. */
export function TriageCard({onDone,onCancel}:{onDone:(text:string)=>void;onCancel:()=>void}){
 const [a,setA]=useState<TriageAnswers>({complaint:'',where:[],track:[]}),[step,setStep]=useState<Step>('complaint'),[typing,setTyping]=useState(false),[draft,setDraft]=useState('');
 const steps=():Step[]=>{const s=a.complaint&&a.complaint!=='other'?triageSteps(a.complaint):{decider:null,throttle:true};return ['complaint',...(s.decider?['decider' as Step]:[]),...(s.throttle?['throttle' as Step]:[]),'where','track','review'];};
 const order=steps(),i=order.indexOf(step);
 const go=(d:number)=>{setTyping(false);setDraft('');setStep(order[Math.max(0,Math.min(order.length-1,i+d))]);};
 const pick=(patch:Partial<TriageAnswers>)=>{setA({...a,...patch});setTyping(false);setDraft('');setStep(order[Math.min(order.length-1,i+1)]);};
 const toggle=(k:'where'|'track',v:string)=>setA({...a,[k]:a[k].includes(v)?a[k].filter(x=>x!==v):[...a[k],v]});
 const own=(placeholder:string,save:(t:string)=>void)=>typing?<View style={{gap:8,width:'100%'}}><TextInput autoFocus value={draft} onChangeText={setDraft} placeholder={placeholder} placeholderTextColor="#6b7380" maxLength={200} onSubmitEditing={()=>{if(draft.trim())save(draft.trim());}} style={tx.input}/><Button disabled={!draft.trim()} title="Next" onPress={()=>save(draft.trim())}/></View>
  :<Chip quiet label="Type it myself" onPress={()=>setTyping(true)}/>;
 const question=step==='complaint'?'What is the bike doing?':step==='decider'?triageSteps(a.complaint).decider:step==='throttle'?'On the gas or off the gas?':step==='where'?'Where on the track?':step==='track'?'What’s the dirt like?':'Here’s what BAK will get';
 return <Card>
  <View style={{flexDirection:'row',alignItems:'center',gap:4}}>
   {order.map((s,k)=><View key={s} style={{flex:1,height:3,borderRadius:1,backgroundColor:k<=i?colors.accent:colors.line,transform:[{skewX:'-24deg'}]}}/>)}
   <Pressable accessibilityRole="button" accessibilityLabel="Close guided questions" onPress={onCancel} hitSlop={10} style={{marginLeft:10}}><Icon name="close" size={18} color={colors.muted} weight={2}/></Pressable>
  </View>
  <Text style={tx.q}>{question}</Text>
  {step==='complaint'&&<>{complaintGroups.map(g=><View key={g.label} style={{gap:8}}><Text style={tx.eyebrow}>{g.label.toUpperCase()}</Text><Wrap>{g.ids.map(id=><Chip key={id} label={complaintLabel(id)} on={a.complaint===id} onPress={()=>{setA({...a,complaint:id,complaintText:undefined,decider:undefined,throttle:undefined});const s=triageSteps(id);setStep(s.decider?'decider':s.throttle?'throttle':'where');}}/>)}</Wrap></View>)}
   <View style={{gap:8}}><Text style={tx.eyebrow}>NOT LISTED?</Text><Wrap>{own('Describe it, e.g. “front end feels vague in sand”',t=>{setA({...a,complaint:'other',complaintText:t,decider:undefined});setTyping(false);setDraft('');setStep('throttle');})}</Wrap></View></>}
  {step==='decider'&&<View style={{gap:8}}>{(deciderAnswers[a.complaint]??[]).map(o=><Chip key={o} label={o} on={a.decider===o} onPress={()=>pick({decider:o})}/>)}<Chip quiet label="Not sure" onPress={()=>pick({decider:'Not sure'})}/>{own('Tell it your way',t=>pick({decider:t}))}</View>}
  {step==='throttle'&&<Wrap>{throttleAnswers.map(o=><Chip key={o} label={o} on={a.throttle===o} onPress={()=>pick({throttle:o})}/>)}<Chip quiet label="Not sure" onPress={()=>pick({throttle:undefined})}/>{own('Tell it your way',t=>pick({throttle:t}))}</Wrap>}
  {(step==='where'||step==='track')&&<>
   <Copy>{step==='where'?'Pick all that apply.':'Optional. Pick all that apply.'}</Copy>
   <Wrap>{(step==='where'?whereAnswers:trackAnswers).map(o=><Chip key={o} label={o} on={a[step].includes(o)} onPress={()=>toggle(step,o)}/>)}
    {a[step].filter(v=>!(step==='where'?whereAnswers:trackAnswers).includes(v)).map(v=><Chip key={v} label={v} on onPress={()=>toggle(step,v)}/>)}
    {own(step==='where'?'Somewhere else, e.g. “off-camber downhill”':'Something else, e.g. “wet clay”',t=>{toggle(step,t);setTyping(false);setDraft('');})}</Wrap>
   <View style={{flexDirection:'row',gap:10}}><View style={{flex:1}}><Button secondary title="Back" onPress={()=>go(-1)}/></View><View style={{flex:1}}><Button title={a[step].length||step==='track'?'Next':'Skip'} onPress={()=>go(1)}/></View></View></>}
  {step==='review'&&<>
   <View style={tx.quote}><Text style={{color:colors.text,fontSize:15,lineHeight:22}}>{composeTriage(a)}</Text></View>
   <Text style={tx.small}>Anything else? (optional)</Text>
   <TextInput multiline value={a.notes??''} onChangeText={notes=>setA({...a,notes})} maxLength={400} placeholder="What you’ve already tried, recent changes, how it felt before" placeholderTextColor="#6b7380" style={[tx.input,{minHeight:70,textAlignVertical:'top'}]}/>
   <View style={{flexDirection:'row',gap:10}}><View style={{flex:1}}><Button secondary title="Back" onPress={()=>go(-1)}/></View><View style={{flex:1}}><Button title="Use this" onPress={()=>onDone(composeTriage(a))}/></View></View></>}
  {(step==='decider'||step==='throttle')&&<Button secondary title="Back" onPress={()=>go(-1)}/>}
 </Card>;
}

type Change={setting:string;change:string};
const RESULTS:{key:Exclude<SetupResult,'not_tested'>;label:string}[]=[{key:'better',label:'Better'},{key:'no_change',label:'No change'},{key:'worse',label:'Worse'}];
const said:Record<string,string>={better:'better',no_change:'no different',worse:'worse'};
/** After BAK suggests setup changes: the rider rides, then taps how it went. Saved to the bike's setup log, which BAK reads
 *  on the next question. Same flow as the website. */
export function RideCheckCard({bike,messageId,changes,logged,onLogged,onAsk}:{bike:Bike;messageId:string;changes:Change[];logged?:SetupLog;onLogged:(log:SetupLog)=>void;onAsk:(text:string)=>void}){
 const [which,setWhich]=useState(0),[result,setResult]=useState<Exclude<SetupResult,'not_tested'>|null>(null),[track,setTrack]=useState(''),[notes,setNotes]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const text=(c:Change)=>`${c.setting}: ${c.change}`;
 if(logged){const r=logged.result;return <View style={tx.box}>
  <View style={{flexDirection:'row',gap:8}}><Icon name="check" size={16} color="#7fd09a" weight={2.2}/><Text style={{color:colors.muted,fontSize:14,lineHeight:20,flex:1}}>You said <Text style={{color:colors.text,fontWeight:'700'}}>{logged.change_made}</Text> rode <Text style={{color:colors.text,fontWeight:'700'}}>{said[r]??'untested'}</Text>{logged.track?` at ${logged.track}`:''}. It’s in your setup log and BAK will use it.</Text></View>
  <Button secondary title="Ask BAK what’s next" onPress={()=>onAsk(`I tried ${logged.change_made}. It rode ${said[r]??'no different'}${logged.track?` at ${logged.track}`:''}.${logged.notes?' '+logged.notes:''} What should I try next?`)}/>
 </View>;}
 async function save(){
  if(!result)return;setBusy(true);setError('');
  try{const log=await api<SetupLog>('/api/setup-logs','POST',{bike_id:bike.id,recorded_at:new Date().toISOString(),track:track.trim(),conditions:'',engine_hours:bike.engine_hours,settings:{bak_suggestion:messageId},change_made:text(changes[which]).slice(0,1000),result,notes:notes.trim()});onLogged(log);}
  catch(e){setError(errorText(e));}finally{setBusy(false);}
 }
 return <View style={tx.box}>
  <Text style={{color:colors.text,fontSize:16,fontWeight:'700'}}>Tried it? How did it ride?</Text>
  {changes.length>1&&<Wrap>{changes.map((c,i)=><Chip key={i} label={c.setting} on={which===i} onPress={()=>setWhich(i)}/>)}</Wrap>}
  <View style={{flexDirection:'row',gap:8}}>{RESULTS.map(r=><View key={r.key} style={{flex:1}}><Chip center label={r.label} on={result===r.key} onPress={()=>setResult(r.key)}/></View>)}</View>
  {result&&<>
   <TextInput value={track} onChangeText={setTrack} maxLength={120} placeholder="Track (optional)" placeholderTextColor="#6b7380" style={tx.input}/>
   <TextInput multiline value={notes} onChangeText={setNotes} maxLength={1000} placeholder={result==='better'?'What improved? (optional)':result==='worse'?'What got worse? (optional)':'Anything you noticed? (optional)'} placeholderTextColor="#6b7380" style={[tx.input,{minHeight:64,textAlignVertical:'top'}]}/>
   <Notice text={error}/>
   <Button disabled={busy} title={busy?'Saving…':'Save to my setup log'} onPress={()=>void save()}/>
  </>}
 </View>;
}

/** Under a BAK reply: what the rider told BAK that isn't in their Garage yet, with one tap to save it. Nothing saves until
 *  they tap; proposals already matching the Garage are hidden. Same rules as the website. */
export function GarageUpdatesCard({bike,updates,onSaved}:{bike:Bike;updates:GarageUpdate[]|undefined;onSaved:()=>void}){
 const pending=pendingGarageUpdates(bike.configuration,updates);
 const [off,setOff]=useState<Set<number>>(new Set()),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
 if(saved)return <View style={tx.box}><View style={{flexDirection:'row',gap:8}}><Icon name="check" size={16} color="#7fd09a" weight={2.2}/><Text style={{color:colors.muted,fontSize:14,flex:1}}>Saved to your Garage. BAK will use it from your next question.</Text></View></View>;
 if(!pending.length)return null;
 const chosen=pending.filter((_,i)=>!off.has(i));
 async function save(){
  setBusy(true);setError('');
  try{const configuration=applyGarageUpdates(bike.configuration,chosen);
   await api<Bike>(`/api/bikes?id=${bike.id}`,'PATCH',{manufacturer:bike.manufacturer,model:bike.model,model_year:bike.model_year,variant:bike.variant,region:bike.region,nickname:bike.nickname??'',engine_hours:bike.engine_hours,configuration});
   setSaved(true);onSaved();}
  catch(e){setError(errorText(e));}finally{setBusy(false);}
 }
 return <View style={tx.box}>
  <Text style={{color:colors.text,fontSize:16,fontWeight:'700'}}>Save to your {bike.model} Garage?</Text>
  {pending.map((u,i)=><View key={i} style={{flexDirection:'row',alignItems:'center',gap:12}}>
   <Switch value={!off.has(i)} onValueChange={()=>{const n=new Set(off);n.has(i)?n.delete(i):n.add(i);setOff(n);}} accessibilityLabel={u.type==='setting'?garageFieldLabel(u.field):[u.brand,u.name].filter(Boolean).join(' ')}/>
   <View style={{flex:1,gap:2}}>
    <Text style={{color:colors.text,fontSize:15,fontWeight:'600'}}>{u.type==='setting'?garageFieldLabel(u.field):[u.brand,u.name].filter(Boolean).join(' ')}</Text>
    <Text style={tx.small}>{u.type==='setting'?`${u.current?u.current+' → ':''}${u.value}`:`Add under ${systemLabel(u.system)}${u.value?' · '+u.value:''}`}</Text>
   </View>
  </View>)}
  <Notice text={error}/>
  <Button disabled={busy||!chosen.length} title={busy?'Saving…':chosen.length===pending.length?'Save to Garage':`Save ${chosen.length} to Garage`} onPress={()=>void save()}/>
 </View>;
}
const tx={
 q:{color:colors.text,fontSize:22,fontWeight:'900' as const,fontStyle:'italic' as const,letterSpacing:-0.5},
 eyebrow:{color:colors.muted,fontSize:11,fontWeight:'700' as const,letterSpacing:1.5},
 small:{color:colors.muted,fontSize:13,lineHeight:19},
 input:{borderBottomColor:'#2a2f39',borderBottomWidth:1,paddingVertical:10,color:colors.text,fontSize:16},
 quote:{borderLeftWidth:3,borderLeftColor:colors.accent,paddingLeft:12,paddingVertical:4},
 box:{gap:12,paddingTop:16,marginTop:4,borderTopWidth:1,borderTopColor:colors.line},
};
