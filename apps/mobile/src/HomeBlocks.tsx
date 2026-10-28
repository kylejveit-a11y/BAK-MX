// Home, the rider's way: blocks they can turn on, off and reorder (saved on this phone), and race-day mode, which turns Home
// into a track-day screen: today's setup, a between-motos checklist and a fast change log that goes into the setup log.
import React,{useCallback,useEffect,useState} from 'react';
import {Modal,ScrollView,Switch,Text,TextInput,View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {Bike,ServiceEvent} from '../../../shared/types';
import {EVENT_TYPE_LABELS,SETUP_RESULT_LABELS,type RideEvent,type SetupLog,type SetupResult} from '../../../shared/rider-types';
import {api} from './api';
import {readProgress,writeProgress} from './localProgress';
import {Pressable} from './Touch';
import {Button,Card,Copy,Eyebrow,Icon,MetalMark,Notice,colors,tint,type IconName} from './ui';
import {success} from './haptics';

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const today=()=>new Date().toISOString().slice(0,10);
const when=(iso:string)=>new Date(iso).toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'});
const time=(iso:string)=>new Date(iso).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});

// ------------------------------------------------------------------ layout
export type HomeBlock='ask'|'bike'|'service'|'setup'|'events'|'coaching'|'tools';
export const HOME_BLOCKS:{id:HomeBlock;label:string;detail:string}[]=[
 {id:'ask',label:'Ask BAK',detail:'The question bar'},
 {id:'bike',label:'Your bike',detail:'Photo, hours and setup checklist'},
 {id:'service',label:'Service due',detail:'What’s due next, by hours'},
 {id:'setup',label:'Last setup change',detail:'What you changed and how it rode'},
 {id:'events',label:'Upcoming events',detail:'Your next ride days and races'},
 {id:'coaching',label:'Last coaching',detail:'Your latest fix and drill'},
 {id:'tools',label:'Shortcuts',detail:'Setup log, workshop, specs and more'},
];
type Layout={id:HomeBlock;on:boolean}[];
const DEFAULT_LAYOUT:Layout=HOME_BLOCKS.map(b=>({id:b.id,on:true}));
/** Saved order, with any block added in a later version appended (on) so riders always see new things once. */
export function useHomeLayout(account:string){
 const [layout,setLayout]=useState<Layout>(()=>{const saved=readProgress<Layout|null>(account,'home-layout',null);if(!saved)return DEFAULT_LAYOUT;const known=saved.filter(b=>HOME_BLOCKS.some(h=>h.id===b.id));return [...known,...DEFAULT_LAYOUT.filter(d=>!known.some(k=>k.id===d.id))];});
 const save=(next:Layout)=>{setLayout(next);try{writeProgress(account,'home-layout',next);}catch{}};
 return {layout,save,reset:()=>save(DEFAULT_LAYOUT)};
}

export function HomeEditor({visible,layout,onChange,onReset,onClose}:{visible:boolean;layout:Layout;onChange:(l:Layout)=>void;onReset:()=>void;onClose:()=>void}){
 const insets=useSafeAreaInsets();
 const move=(i:number,d:-1|1)=>{const j=i+d;if(j<0||j>=layout.length)return;const next=[...layout];[next[i],next[j]]=[next[j],next[i]];onChange(next);};
 const arrow=(name:IconName,label:string,disabled:boolean,onPress:()=>void)=><Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} hitSlop={6} onPress={onPress} style={({pressed})=>({width:34,height:34,borderRadius:17,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#2f3540',opacity:disabled?0.25:pressed?0.6:1})}><Icon name={name} size={16} color={colors.text}/></Pressable>;
 return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
  <View style={{flex:1,backgroundColor:colors.bg,paddingTop:20,paddingBottom:insets.bottom+12}}>
   <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:20,paddingBottom:12}}>
    <Text style={{color:colors.text,fontSize:24,fontWeight:'900',fontStyle:'italic'}}>Edit Home</Text>
    <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}><Text style={{color:colors.accent,fontSize:16,fontWeight:'700'}}>Done</Text></Pressable>
   </View>
   <Text style={{color:colors.muted,fontSize:14,paddingHorizontal:20,paddingBottom:10}}>Turn blocks on or off and move them up or down. Saved on this phone.</Text>
   <ScrollView contentContainerStyle={{paddingHorizontal:20,gap:2}}>
    {layout.map((b,i)=>{const meta=HOME_BLOCKS.find(h=>h.id===b.id)!;return <View key={b.id} style={{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:12,borderBottomWidth:1,borderBottomColor:'#1c2028'}}>
     <View style={{flex:1,gap:2}}><Text style={{color:b.on?colors.text:'#7d8593',fontSize:16,fontWeight:'700'}}>{meta.label}</Text><Text style={{color:colors.muted,fontSize:12.5}}>{meta.detail}</Text></View>
     {arrow('chevronUp','Move up',i===0,()=>move(i,-1))}
     {arrow('chevronDown','Move down',i===layout.length-1,()=>move(i,1))}
     <Switch value={b.on} onValueChange={v=>onChange(layout.map(x=>x.id===b.id?{...x,on:v}:x))} trackColor={{true:colors.primary,false:'#2a2f39'}} accessibilityLabel={`Show ${meta.label}`}/>
    </View>;})}
    <Pressable accessibilityRole="button" onPress={onReset} style={{paddingVertical:18}}><Text style={{color:colors.muted,fontSize:15}}>Reset to the standard layout</Text></Pressable>
   </ScrollView>
  </View>
 </Modal>;
}

// ------------------------------------------------------------------ blocks
function BlockHead({title,action,onAction}:{title:string;action?:string;onAction?:()=>void}){
 return <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:8}}><MetalMark width={14}/><Eyebrow>{title}</Eyebrow></View>
  {action&&onAction&&<Pressable accessibilityRole="button" hitSlop={8} onPress={onAction} style={{flexDirection:'row',alignItems:'center',gap:4}}><Text style={{color:colors.accent,fontWeight:'700'}}>{action}</Text><Icon name="chevronRight" size={15} color={colors.accent} weight={2.2}/></Pressable>}
 </View>;
}

/** Service items with a "next due at hours" reminder, nearest first, against the bike's hours. */
export function ServiceDueBlock({bike,onOpen}:{bike:Bike;onOpen:()=>void}){
 const [events,setEvents]=useState<ServiceEvent[]|null>(null);
 useFocusEffect(useCallback(()=>{api<ServiceEvent[]>(`/api/services?bike_id=${bike.id}`).then(setEvents).catch(()=>setEvents([]));},[bike.id]));
 if(!events)return null;
 // Latest entry per item decides when that item is next due.
 const latest=new Map<string,ServiceEvent>();for(const e of [...events].sort((a,b)=>b.performed_at.localeCompare(a.performed_at)))if(!latest.has(e.category))latest.set(e.category,e);
 const due=[...latest.values()].filter(e=>e.next_due_hours!=null).sort((a,b)=>(a.next_due_hours!)-(b.next_due_hours!)).slice(0,3);
 const hours=bike.engine_hours;
 return <Card><BlockHead title="SERVICE DUE" action="Service log" onAction={onOpen}/>
  {!due.length&&<Copy>{events.length?'No reminders set. When you log a service, add when it’s next due and it shows here.':'Log your last oil change or filter, with when it’s next due, and it shows here.'}</Copy>}
  {due.map(e=>{const left=hours!=null?Math.round((e.next_due_hours!-hours)*10)/10:null;const over=left!=null&&left<=0,soon=left!=null&&left>0&&left<=2;
   return <View key={e.id} style={{flexDirection:'row',alignItems:'center',gap:10}}>
    <View style={{width:8,height:8,borderRadius:4,backgroundColor:over?'#ef6b73':soon?'#e8c15a':'#5fbf7f'}}/>
    <Text style={{flex:1,color:colors.text,fontSize:15.5,fontWeight:'600'}}>{e.category}</Text>
    <Text style={{color:over?'#ef9aa1':colors.muted,fontSize:14,fontWeight:over?'700':'500'}}>{left==null?`at ${e.next_due_hours} h`:over?`${Math.abs(left)} h overdue`:`in ${left} h`}</Text>
   </View>;})}
  {due.length>0&&hours==null&&<Text style={{color:colors.muted,fontSize:12.5}}>Add the bike’s hours in Garage to count down.</Text>}
 </Card>;
}

export function LastSetupBlock({bike,onOpen}:{bike:Bike;onOpen:()=>void}){
 const [log,setLog]=useState<SetupLog|null|undefined>(undefined);
 useFocusEffect(useCallback(()=>{api<SetupLog[]>(`/api/setup-logs?bike_id=${bike.id}`).then(l=>setLog(l[0]??null)).catch(()=>setLog(null));},[bike.id]));
 if(!log)return null;
 const tone=log.result==='better'?'#7fd09a':log.result==='worse'?'#ef9aa1':colors.muted;
 return <Card><BlockHead title="LAST SETUP CHANGE" action="Setup log" onAction={onOpen}/>
  <Text style={{color:colors.text,fontSize:16,fontWeight:'700'}}>{log.change_made||'Setup recorded'}</Text>
  <Text style={{color:colors.muted,fontSize:13.5}}>{when(log.recorded_at)}{log.track?` · ${log.track}`:''}{log.conditions?` · ${log.conditions}`:''}</Text>
  <Text style={{color:tone,fontSize:14,fontWeight:'700'}}>{SETUP_RESULT_LABELS[log.result]}{log.notes?<Text style={{color:colors.muted,fontWeight:'400'}}> · {log.notes}</Text>:null}</Text>
 </Card>;
}

export function EventsBlock({onOpen}:{onOpen:()=>void}){
 const [events,setEvents]=useState<RideEvent[]|null>(null);
 useFocusEffect(useCallback(()=>{api<RideEvent[]>('/api/events?scope=upcoming').then(e=>setEvents(e.filter(x=>!x.canceled_at))).catch(()=>setEvents([]));},[]));
 if(!events?.length)return null;
 const mine=events.filter(e=>e.my_rsvp||e.mine),list=(mine.length?mine:events).slice(0,2);
 return <Card><BlockHead title={mine.length?'YOUR NEXT EVENTS':'UPCOMING EVENTS'} action="Events" onAction={onOpen}/>
  {list.map(e=><Pressable key={e.id} accessibilityRole="button" onPress={onOpen} style={({pressed})=>({gap:2,opacity:pressed?0.7:1})}>
   <Text style={{color:colors.accent,fontSize:12.5,fontWeight:'700'}}>{EVENT_TYPE_LABELS[e.event_type]}{e.my_rsvp==='going'?' · You’re going':e.my_rsvp==='interested'?' · Interested':''}</Text>
   <Text style={{color:colors.text,fontSize:16,fontWeight:'700'}}>{e.title}</Text>
   <Text style={{color:colors.muted,fontSize:13.5}}>{when(e.starts_at)} · {time(e.starts_at)} · {e.location_name}</Text>
  </Pressable>)}
 </Card>;
}

type Coached={fix:string;drill:string;at:string;media:{focus?:string}};
export function CoachingBlock({bike,onOpen}:{bike:Bike;onOpen:()=>void}){
 const [s,setS]=useState<Coached|null|undefined>(undefined);
 useFocusEffect(useCallback(()=>{api<Coached[]>(`/api/coaching?bike_id=${bike.id}`).then(l=>setS(l[0]??null)).catch(()=>setS(null));},[bike.id]));
 if(!s||!s.fix)return null;
 return <Card><BlockHead title="LAST COACHING" action="Coaching" onAction={onOpen}/>
  <Text style={{color:colors.text,fontSize:15.5,lineHeight:22}}><Text style={{color:colors.accent,fontWeight:'700'}}>Fix: </Text>{s.fix}</Text>
  {!!s.drill&&<Text style={{color:colors.muted,fontSize:14.5,lineHeight:21}}><Text style={{fontWeight:'700'}}>Drill: </Text>{s.drill}</Text>}
 </Card>;
}

// ------------------------------------------------------------------ race day
export type RaceDay={on:boolean;track:string;day:string};
export function useRaceDay(account:string){
 const [race,setRace]=useState<RaceDay>(()=>{const r=readProgress<RaceDay|null>(account,'race-day',null);return r&&r.on&&r.day===today()?r:{on:false,track:'',day:''};});
 const save=(r:RaceDay)=>{setRace(r);try{writeProgress(account,'race-day',r);}catch{}};
 return {race,start:(track:string)=>save({on:true,track:track.trim(),day:today()}),end:()=>save({on:false,track:'',day:''})};
}

const CHECKS=['Tire pressures set cold','Fork air bled','Chain slack and lube','Spokes and axle nuts','Air filter clean','Fuel and oil level'];
const CHANGES=['Fork compression','Fork rebound','Shock low-speed','Shock high-speed','Shock rebound','Sag','Front tire','Rear tire','Fork height','Other'];
const config=(b:Bike,k:string)=>{const v=b.configuration?.[k];return v==null||v===''?'':String(v);};

/** The race-day Home: today's setup, the between-motos check, a fast change log and today's entries. */
export function RaceDayHome({bike,account,track,onEnd,onAsk}:{bike:Bike;account:string;track:string;onEnd:()=>void;onAsk:(text:string)=>void}){
 const checkKey=`race-checks-${today()}`;
 const [checked,setChecked]=useState<string[]>(()=>readProgress<string[]>(account,checkKey,[]));
 const toggle=(c:string)=>{const next=checked.includes(c)?checked.filter(x=>x!==c):[...checked,c];setChecked(next);try{writeProgress(account,checkKey,next);}catch{}};
 const [logs,setLogs]=useState<SetupLog[]>([]),[moto,setMoto]=useState('Moto 1'),[what,setWhat]=useState(''),[detail,setDetail]=useState(''),[result,setResult]=useState<SetupResult>('not_tested'),[note,setNote]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const load=useCallback(async()=>{try{const all=await api<SetupLog[]>(`/api/setup-logs?bike_id=${bike.id}`);setLogs(all.filter(l=>l.recorded_at.slice(0,10)===today()));}catch(e){setNotice(errorText(e));}},[bike.id]);
 useEffect(()=>{void load();},[load]);
 const setup:[string,string][]=[['Fork comp',config(bike,'fork_compression')],['Fork reb',config(bike,'fork_rebound')],['Shock comp',config(bike,'shock_compression')],['Shock reb',config(bike,'shock_rebound')],['Race sag',config(bike,'rider_sag_mm')?config(bike,'rider_sag_mm')+' mm':''],['Tires',config(bike,'tire_pressures')]];
 const known=setup.filter(([,v])=>v);
 async function log(){
  if(busy)return;if(!what){setNotice('Pick what you changed.');return;}
  setBusy(true);setNotice('');
  try{
   const settings:Record<string,string>={};for(const k of ['fork_compression','fork_rebound','shock_rebound','rider_sag_mm','fork_height_mm']){const v=config(bike,k);if(v)settings[k]=v.slice(0,200);}
   await api('/api/setup-logs','POST',{bike_id:bike.id,recorded_at:new Date().toISOString(),track:track.slice(0,120),conditions:`Race day · ${moto}`.slice(0,200),engine_hours:bike.engine_hours??null,settings,change_made:`${what}${detail.trim()?': '+detail.trim():''}`.slice(0,1000),result,notes:note.trim().slice(0,4000)});
   success();setWhat('');setDetail('');setNote('');setResult('not_tested');await load();
  }catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 const chip=(label:string,on:boolean,onPress:()=>void)=><Pressable key={label} haptic="select" accessibilityRole="button" accessibilityState={{selected:on}} onPress={onPress} style={({pressed})=>({paddingHorizontal:12,paddingVertical:7,borderRadius:16,borderWidth:1,borderColor:on?colors.accent:'#343a45',backgroundColor:on?tint(0.16):'transparent',opacity:pressed?0.7:1})}><Text style={{color:on?'#ffffff':'#c9cfd9',fontSize:14,fontWeight:on?'700':'500'}}>{label}</Text></Pressable>;
 return <>
  <View style={{gap:6}}>
   <View style={{flexDirection:'row',alignItems:'center',gap:8}}><MetalMark width={22}/><Eyebrow>RACE DAY · {new Date().toLocaleDateString([],{weekday:'long',month:'short',day:'numeric'}).toUpperCase()}</Eyebrow></View>
   <Text style={{color:colors.text,fontSize:30,fontWeight:'900',fontStyle:'italic',letterSpacing:-1}}>{track||'Track day'}</Text>
   <Text style={{color:colors.muted,fontSize:14}}>{bike.model_year} {bike.manufacturer} {bike.model}{bike.engine_hours!=null?` · ${bike.engine_hours} h`:''}</Text>
  </View>
  <Card><Eyebrow>TODAY’S SETUP</Eyebrow>
   {known.length?<View style={{flexDirection:'row',flexWrap:'wrap',rowGap:12}}>{known.map(([k,v])=><View key={k} style={{width:'50%',gap:2}}><Text style={{color:'#9aa2ae',fontSize:12}}>{k}</Text><Text style={{color:colors.text,fontSize:16,fontWeight:'700'}}>{v}</Text></View>)}</View>
   :<Copy>Your clickers, sag and tire pressures show here once they’re in Garage › Edit details.</Copy>}
  </Card>
  <Card><Eyebrow>BETWEEN MOTOS · {checked.length}/{CHECKS.length}</Eyebrow>
   {CHECKS.map(c=>{const on=checked.includes(c);return <Pressable key={c} haptic="select" accessibilityRole="checkbox" accessibilityState={{checked:on}} onPress={()=>toggle(c)} style={{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:4}}>
    <View style={{width:22,height:22,borderRadius:6,borderWidth:1.5,borderColor:on?colors.accent:'#4a515d',backgroundColor:on?tint(0.22):'transparent',alignItems:'center',justifyContent:'center'}}>{on&&<Icon name="check" size={14} color="#ffffff"/>}</View>
    <Text style={{color:on?colors.muted:colors.text,fontSize:15.5,textDecorationLine:on?'line-through':'none'}}>{c}</Text></Pressable>;})}
   {checked.length>0&&<Pressable accessibilityRole="button" onPress={()=>{setChecked([]);try{writeProgress(account,checkKey,[]);}catch{}}} hitSlop={6}><Text style={{color:colors.muted,fontSize:14}}>Clear for the next moto</Text></Pressable>}
  </Card>
  <Card><Eyebrow>LOG A CHANGE</Eyebrow>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{['Practice','Moto 1','Moto 2','Moto 3'].map(m=>chip(m,moto===m,()=>setMoto(m)))}</View>
   <Text style={{color:'#adb5c1',fontSize:12.5,fontWeight:'600'}}>What did you change?</Text>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{CHANGES.map(c=>chip(c,what===c,()=>setWhat(what===c?'':c)))}</View>
   <TextInput value={detail} onChangeText={setDetail} maxLength={200} placeholder="e.g. 2 clicks softer, or 13 psi" placeholderTextColor="#7d8593" style={{color:colors.text,fontSize:16,borderBottomWidth:1,borderBottomColor:'#2f3540',paddingVertical:10}}/>
   <Text style={{color:'#adb5c1',fontSize:12.5,fontWeight:'600'}}>How did it ride?</Text>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{(['better','no_change','worse','not_tested'] as SetupResult[]).map(r=>chip(SETUP_RESULT_LABELS[r],result===r,()=>setResult(r)))}</View>
   <TextInput value={note} onChangeText={setNote} maxLength={500} placeholder="Note (optional): ruts got deeper, front pushed in turn 3…" placeholderTextColor="#7d8593" multiline style={{color:colors.text,fontSize:16,borderBottomWidth:1,borderBottomColor:'#2f3540',paddingVertical:10,minHeight:44}}/>
   <Notice text={notice}/>
   <Button disabled={busy} title={busy?'Saving…':'Save to setup log'} onPress={()=>void log()}/>
  </Card>
  {logs.length>0&&<Card><Eyebrow>TODAY</Eyebrow>
   {logs.map(l=><View key={l.id} style={{gap:2,paddingVertical:4}}>
    <Text style={{color:colors.text,fontSize:15.5,fontWeight:'700'}}>{l.change_made}</Text>
    <Text style={{color:colors.muted,fontSize:13.5}}>{time(l.recorded_at)} · {l.conditions.replace('Race day · ','')} · <Text style={{color:l.result==='better'?'#7fd09a':l.result==='worse'?'#ef9aa1':colors.muted,fontWeight:'700'}}>{SETUP_RESULT_LABELS[l.result]}</Text>{l.notes?` · ${l.notes}`:''}</Text>
   </View>)}
   <Pressable accessibilityRole="button" onPress={()=>onAsk(`Race day${track?` at ${track}`:''}. Here's what I changed today and how it rode:\n${logs.slice().reverse().map(l=>`- ${l.conditions.replace('Race day · ','')}: ${l.change_made} → ${SETUP_RESULT_LABELS[l.result]}${l.notes?` (${l.notes})`:''}`).join('\n')}\nWhat should I try next?`)} hitSlop={6}><Text style={{color:colors.accent,fontSize:15,fontWeight:'700'}}>Ask BAK what to try next</Text></Pressable>
  </Card>}
  <Pressable accessibilityRole="button" onPress={onEnd} style={{alignSelf:'center',paddingVertical:10}}><Text style={{color:colors.muted,fontSize:15}}>End race day</Text></Pressable>
 </>;
}

/** Asks for the track and starts race day. */
export function RaceDayStart({visible,onStart,onClose}:{visible:boolean;onStart:(track:string)=>void;onClose:()=>void}){
 const [track,setTrack]=useState('');const insets=useSafeAreaInsets();
 return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
  <View style={{flex:1,backgroundColor:colors.bg,padding:20,paddingBottom:insets.bottom+20,gap:16}}>
   <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><Text style={{color:colors.text,fontSize:26,fontWeight:'900',fontStyle:'italic'}}>Race day</Text><Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}><Text style={{color:colors.muted,fontSize:16}}>Cancel</Text></Pressable></View>
   <Copy>Home turns into your track-day screen: today’s setup, a between-motos check and a quick change log. It ends by itself tomorrow.</Copy>
   <TextInput autoFocus value={track} onChangeText={setTrack} maxLength={120} placeholder="Where are you riding?" placeholderTextColor="#7d8593" style={{color:colors.text,fontSize:20,fontWeight:'700',borderBottomWidth:1,borderBottomColor:colors.accent,paddingVertical:12}}/>
   <Button title="Start race day" onPress={()=>{onStart(track);setTrack('');}}/>
  </View>
 </Modal>;
}
