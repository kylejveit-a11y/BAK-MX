// Home, the rider's way: blocks they can turn on, off and reorder (saved on this phone), and race-day mode, which turns Home
// into a track-day screen: today's setup, a between-motos checklist and a fast change log that goes into the setup log.
import React,{useCallback,useEffect,useState} from 'react';
import {Keyboard,Modal,ScrollView,Switch,Text,TextInput,View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {Bike,ServiceEvent,Conversation,EngineeringResponse} from '../../../shared/types';
import {AI_CONSENT_VERSION} from '../../../shared/ai-consent';
import {randomUUID} from 'expo-crypto';
import {DateField,rideDays} from './DateSheet';
import {EVENT_TYPE_LABELS,SETUP_RESULT_LABELS,type RideEvent,type SetupLog,type SetupResult} from '../../../shared/rider-types';
import {api,apiStream,apiQueued,currentStore} from './api';
import {isLocal,pending,withPending} from './offline';
import {readProgress,writeProgress} from './localProgress';
import {Pressable} from './Touch';
import {Button,Card,Copy,Eyebrow,Icon,MetalMark,Notice,colors,tint,type IconName} from './ui';
import {success} from './haptics';
import {RacePrepCard,RacePrepSheet,useRacePrep,Progress} from './RacePrep';
import {RACE_PHASES,phaseForDaysOut} from '../../../shared/race-prep';
import {setRaceWidget} from './widgets/sync';
import {RichText} from './RichText';
import {OFF_RACE as OFF,dayOf,today,activeRace,raceToday,daysToGo,whenText,QUICK,CHANGES,MOTOS,quickAskText,tryNextText,raceSetupTitle,raceSetupQuestion,raceSetupField,raceSetupKey,raceSetupStale,plain,knownTrack,trackSuggestions,trackPicks,type RaceDay,type KnownTrack} from '../../../shared/race-day';
export {daysToGo,whenText,type RaceDay};

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const when=(iso:string)=>new Date(iso).toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'});
const time=(iso:string)=>new Date(iso).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});

// ------------------------------------------------------------------ layout
export type HomeBlock='ask'|'bike'|'prep'|'service'|'setup'|'events'|'coaching'|'tools';
export const HOME_BLOCKS:{id:HomeBlock;label:string;detail:string}[]=[
 {id:'ask',label:'Ask BAK',detail:'The question bar'},
 {id:'bike',label:'Your bike',detail:'Photo, hours and setup checklist'},
 {id:'prep',label:'Race prep',detail:'Your own checklist, week before to after'},
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
 const [layout,setLayout]=useState<Layout>(()=>{const saved=readProgress<Layout|null>(account,'home-layout',null);if(!saved)return DEFAULT_LAYOUT;const known=saved.filter(b=>HOME_BLOCKS.some(h=>h.id===b.id));const out=[...known];DEFAULT_LAYOUT.forEach((d,i)=>{if(out.some(k=>k.id===d.id))return;const prev=DEFAULT_LAYOUT[i-1],at=prev?out.findIndex(k=>k.id===prev.id):-1;out.splice(at+1,0,d);});return out;});
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
    <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}><Text style={{color:colors.text,fontSize:16,fontWeight:'700'}}>Done</Text></Pressable>
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
  {action&&onAction&&<Pressable accessibilityRole="button" hitSlop={8} onPress={onAction} style={{flexDirection:'row',alignItems:'center',gap:4}}><Text style={{color:colors.text,fontWeight:'700'}}>{action}</Text><Icon name="chevronRight" size={15} color={colors.accent} weight={2.2}/></Pressable>}
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
   <Text style={{color:colors.text,fontSize:12.5,fontWeight:'700'}}>{EVENT_TYPE_LABELS[e.event_type]}{e.my_rsvp==='going'?' · You’re going':e.my_rsvp==='interested'?' · Interested':''}</Text>
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
  <Text style={{color:colors.text,fontSize:15.5,lineHeight:22}}><Text style={{color:colors.text,fontWeight:'700'}}>Fix: </Text>{s.fix}</Text>
  {!!s.drill&&<Text style={{color:colors.muted,fontSize:14.5,lineHeight:21}}><Text style={{fontWeight:'700'}}>Drill: </Text>{s.drill}</Text>}
 </Card>;
}

// ------------------------------------------------------------------ race day
/** The rider's race, today or still ahead; a past one is over. Read fresh each time so other screens see it at once. */
export function readRace(account:string):RaceDay|null{return activeRace(readProgress<RaceDay|null>(account,'race-day',null));}
/** Today's race day, if one is running (Ask BAK's race mode). */
export function readRaceDay(account:string):RaceDay|null{return raceToday(readProgress<RaceDay|null>(account,'race-day',null));}
export function useRaceDay(account:string){
 const [race,setRace]=useState<RaceDay>(()=>readRace(account)??OFF);
 // Tabs stay mounted: re-read on focus so a race that passed or started elsewhere shows right.
 useFocusEffect(useCallback(()=>{const r=readRace(account)??OFF;setRace(old=>old.on===r.on&&old.day===r.day&&old.track===r.track&&old.widget===r.widget?old:r);},[account]));
 const save=(r:RaceDay)=>{setRace(r);try{writeProgress(account,'race-day',r);}catch{}};
 return {race,isToday:race.on&&race.day===today(),upcoming:race.on&&race.day>today(),
  start:(track:string,day:string=today(),widget=true)=>save({on:true,track:track.trim(),day,widget}),end:()=>save(OFF)};
}

// ------------------------------------------------------------------ BAK's starting setup for the race
type RaceSetup={key:string;at:string;summary:string;answer:string;changes:{setting:string;change:string;expect:string;go_back_if:string}[];next:string;conversation:string};
/** BAK works out a starting setup for this track, date and forecast from what is on the bike now. Saved on the phone. */
export function RaceSetupCard({account,bike,track,day,onOpenChat}:{account:string;bike:Bike;track:string;day:string;onOpenChat:(conversation:string)=>void}){
 const key=raceSetupKey(bike.id,track,day);
 const [saved,setSaved]=useState<RaceSetup|null>(()=>{const r=readProgress<RaceSetup|null>(account,'race-setup',null);return r&&r.key===key?r:null;});
 const [live,setLive]=useState<{summary:string;answer:string}|null>(null),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 useEffect(()=>{const r=readProgress<RaceSetup|null>(account,'race-setup',null);setSaved(r&&r.key===key?r:null);},[account,key]);
 const consent=readProgress<boolean>(account,'ai-consent-'+AI_CONSENT_VERSION,false)===true;
 const stale=!!saved&&raceSetupStale(day,saved.at);
 async function get(){
  if(busy)return;if(!consent){setNotice('Open Ask BAK once and agree to the AI terms, then come back.');return;}
  setBusy(true);setNotice('');setLive({summary:'',answer:''});
  try{
   const conv=await api<Conversation>('/api/conversations','POST',{bike_id:bike.id,title:raceSetupTitle(track,day),mode:'setup',create_id:randomUUID()});
   const r=await apiStream<{response:EngineeringResponse}>('/api/chat',{conversation_id:conv.id,request_id:randomUUID(),message:raceSetupQuestion(track,day),race:raceSetupField(track,day)},ev=>{if(ev.type==='draft')setLive({summary:String(ev.summary||''),answer:String(ev.answer||'')});});
   const next:RaceSetup={key,at:new Date().toISOString(),summary:r.response.summary,answer:r.response.answer??'',changes:r.response.setup_changes??[],next:r.response.next_step?.action??'',conversation:conv.id};
   setSaved(next);success();try{writeProgress(account,'race-setup',next);}catch{}
  }catch(e){setNotice(errorText(e));}finally{setBusy(false);setLive(null);}
 }
 return <Card>
  <View style={{flexDirection:'row',alignItems:'center',gap:8}}><MetalMark width={14}/><Eyebrow>BAK’S SETUP FOR {track?track.toUpperCase():'THIS RACE'}</Eyebrow></View>
  {!saved&&!live&&<Text style={{color:colors.muted,fontSize:14,lineHeight:20}}>BAK works out where to start for this track and day: the dirt and layout, the weather forecast once it’s within a week, and what’s on your bike now. {track?'':'Add the track for track info and weather. '}It may say your setup is already right.</Text>}
  {live&&<View style={{gap:6}}>{!!live.summary&&<Text style={{color:colors.text,fontSize:16,fontWeight:'700',lineHeight:22}}>{plain(live.summary)}</Text>}{!!live.answer&&<RichText text={live.answer}/>}<Text style={{color:'#8b93a1',fontSize:12.5}}>{live.summary||live.answer?'Writing… final checks run before it’s saved.':'Reading the track, the forecast and your bike…'}</Text></View>}
  {saved&&!live&&<View style={{gap:10}}>
   <Text style={{color:colors.text,fontSize:16,fontWeight:'700',lineHeight:22}}>{plain(saved.summary)}</Text>
   {saved.changes.length>0?saved.changes.map((c,i)=><View key={i} style={{gap:2,borderLeftWidth:3,borderLeftColor:colors.accent,paddingLeft:10}}>
    <Text style={{color:'#9aa2ae',fontSize:11.5,fontWeight:'800',letterSpacing:0.8}}>{c.setting.toUpperCase()}</Text>
    <Text style={{color:colors.text,fontSize:15.5,fontWeight:'700'}}>{plain(c.change)}</Text>
    {!!c.expect&&<Text style={{color:colors.muted,fontSize:13.5,lineHeight:19}}>{plain(c.expect)}</Text>}
   </View>):<Text style={{color:'#7fd09a',fontSize:14.5,fontWeight:'700'}}>Keep what’s on the bike.</Text>}
   {!!saved.answer&&<RichText text={saved.answer}/>}
   {!!saved.next&&<Text style={{color:colors.text,fontSize:14,lineHeight:20}}><Text style={{fontWeight:'700'}}>First practice: </Text>{plain(saved.next)}</Text>}
   <Text style={{color:'#6f7784',fontSize:12}}>Worked out {new Date(saved.at).toLocaleDateString('en-US',{month:'short',day:'numeric'})} at {new Date(saved.at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}{stale?' · the forecast is out now, refresh it':''}</Text>
  </View>}
  <Notice text={notice}/>
  <View style={{flexDirection:'row',gap:18,alignItems:'center'}}>
   <Pressable accessibilityRole="button" disabled={busy} onPress={()=>void get()} hitSlop={6}><Text style={{color:colors.text,fontSize:15,fontWeight:'700',opacity:busy?0.5:1}}>{busy?'Working it out…':saved?'Refresh':'Get BAK’s setup'}</Text></Pressable>
   {saved&&!busy&&<Pressable accessibilityRole="button" onPress={()=>onOpenChat(saved.conversation)} hitSlop={6}><Text style={{color:colors.muted,fontSize:15}}>Ask about it</Text></Pressable>}
  </View>
 </Card>;
}

/** Keeps the widget's race countdown in step with the race and the prep list (off when the rider turned it off). */
export function useRaceWidget(account:string,bike:Bike|undefined,race:RaceDay){
 const {list,checks}=useRacePrep(account,bike);
 // Count only the phase that matters now (the week before, the night before, race day), not the whole list.
 const phase=phaseForDaysOut(daysToGo(race.day)),before=list.filter(i=>i.phase===phase),done=before.filter(i=>checks[i.id]).length,phaseName=RACE_PHASES.find(p=>p.id===phase)?.short??'Prep';
 const show=race.on&&race.widget!==false&&race.day>=today();
 useEffect(()=>{setRaceWidget(show?{track:race.track,day:race.day,done,total:before.length}:null);},[show,race.track,race.day,done,before.length,phaseName]);
}

/** Home before the race: the countdown, BAK's setup for it and the prep list. */
export function RaceCountdown({account,bike,race,onPrep,onEnd,onOpenChat}:{account:string;bike:Bike;race:RaceDay;onPrep:()=>void;onEnd:()=>void;onOpenChat:(c:string)=>void}){
 const {list,checks}=useRacePrep(account,bike);
 // Count only the phase that matters now (the week before, the night before, race day), not the whole list.
 const phase=phaseForDaysOut(daysToGo(race.day)),before=list.filter(i=>i.phase===phase),done=before.filter(i=>checks[i.id]).length,phaseName=RACE_PHASES.find(p=>p.id===phase)?.short??'Prep';
 const n=daysToGo(race.day),date=new Date(race.day+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});
 return <>
  <Card>
   <View style={{flexDirection:'row',alignItems:'center',gap:8}}><Icon name="flag" size={16} color={colors.accent}/><Eyebrow>NEXT RACE</Eyebrow></View>
   <View style={{flexDirection:'row',alignItems:'flex-end',gap:14}}>
    <View style={{alignItems:'center'}}><Text style={{color:colors.text,fontSize:44,fontWeight:'900',fontStyle:'italic',letterSpacing:-1.5,lineHeight:48}}>{n}</Text><Text style={{color:colors.muted,fontSize:12,fontWeight:'700',letterSpacing:1}}>{n===1?'DAY':'DAYS'}</Text></View>
    <View style={{flex:1,gap:2,paddingBottom:4}}><Text style={{color:colors.text,fontSize:21,fontWeight:'800'}} numberOfLines={2}>{race.track||'Race day'}</Text><Text style={{color:colors.muted,fontSize:14}}>{date}</Text></View>
   </View>
   {before.length>0&&<Pressable accessibilityRole="button" onPress={onPrep} style={{gap:5}}>
    <View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{color:colors.text,fontSize:14.5,fontWeight:'600'}}>Prep · {phaseName}</Text><Text style={{color:colors.muted,fontSize:13}}>{done} of {before.length} ready</Text></View>
    <Progress done={done} total={before.length}/>
   </Pressable>}
  </Card>
  <RaceSetupCard account={account} bike={bike} track={race.track} day={race.day} onOpenChat={onOpenChat}/>
  <Pressable accessibilityRole="button" onPress={onEnd} style={{alignSelf:'flex-start'}} hitSlop={6}><Text style={{color:colors.muted,fontSize:14.5}}>Cancel this race</Text></Pressable>
 </>;
}

/** Setup logs from the server or cache, plus any logged here with no signal that are still waiting to send. */
export function setupLogsWithPending(rows:SetupLog[],bikeId:string):SetupLog[]{
 const store=currentStore();if(!store)return rows;
 return withPending(rows,pending(store),'/api/setup-logs',w=>{const b=w.body as Partial<SetupLog>&{bike_id?:string};return b.bike_id===bikeId?{id:w.id,user_id:'',bike_id:bikeId,recorded_at:b.recorded_at??w.created_at,track:b.track??'',conditions:b.conditions??'',engine_hours:b.engine_hours??null,settings:b.settings??{},change_made:b.change_made??'',result:b.result??'not_tested',notes:b.notes??'',created_at:w.created_at}:null;},r=>r.recorded_at);
}
const config=(b:Bike,k:string)=>{const v=b.configuration?.[k];return v==null||v===''?'':String(v);};

/** The race-day Home: today's setup, the between-motos check, a fast change log and today's entries. */
export function RaceDayHome({bike,account,track,onEnd,onAsk,onQuick,onOpenChat}:{bike:Bike;account:string;track:string;onEnd:()=>void;onAsk:(text:string)=>void;onQuick:(text:string)=>void;onOpenChat:(c:string)=>void}){
 const [prepOpen,setPrepOpen]=useState(false);
 const [logs,setLogs]=useState<SetupLog[]>([]),[moto,setMoto]=useState('Moto 1'),[what,setWhat]=useState(''),[detail,setDetail]=useState(''),[result,setResult]=useState<SetupResult>('not_tested'),[note,setNote]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const load=useCallback(async()=>{try{const all=setupLogsWithPending(await api<SetupLog[]>(`/api/setup-logs?bike_id=${bike.id}`),bike.id);setLogs(all.filter(l=>dayOf(new Date(l.recorded_at))===today()));}catch(e){setNotice(errorText(e));}},[bike.id]);
 useEffect(()=>{void load();},[load]);
 const setup:[string,string][]=[['Fork comp',config(bike,'fork_compression')],['Fork reb',config(bike,'fork_rebound')],['Shock comp',config(bike,'shock_compression')],['Shock reb',config(bike,'shock_rebound')],['Race sag',config(bike,'rider_sag_mm')?config(bike,'rider_sag_mm')+' mm':''],['Tires',config(bike,'tire_pressures')]];
 const known=setup.filter(([,v])=>v);
 async function log(){
  if(busy)return;if(!what){setNotice('Pick what you changed.');return;}
  setBusy(true);setNotice('');
  try{
   const settings:Record<string,string>={};for(const k of ['fork_compression','fork_rebound','shock_rebound','rider_sag_mm','fork_height_mm']){const v=config(bike,k);if(v)settings[k]=v.slice(0,200);}
   const body={bike_id:bike.id,recorded_at:new Date().toISOString(),track:track.slice(0,120),conditions:`Race day · ${moto}`.slice(0,200),engine_hours:bike.engine_hours??null,settings,change_made:`${what}${detail.trim()?': '+detail.trim():''}`.slice(0,1000),result,notes:note.trim().slice(0,4000)};
   const saved=await apiQueued<SetupLog>('/api/setup-logs',body,{...body,user_id:account,created_at:body.recorded_at},'Race-day change');
   success();setWhat('');setDetail('');setNote('');setResult('not_tested');if(saved.pending)setNotice('No signal. Saved on this phone; it sends when you’re back in range.');await load();
  }catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 const chip=(label:string,on:boolean,onPress:()=>void)=><Pressable key={label} haptic="select" accessibilityRole="button" accessibilityState={{selected:on}} onPress={onPress} style={({pressed})=>({paddingHorizontal:12,paddingVertical:7,borderRadius:16,borderWidth:1,borderColor:on?colors.accent:'#343a45',backgroundColor:on?tint(0.16):'transparent',opacity:pressed?0.7:1})}><Text style={{color:on?'#ffffff':'#c9cfd9',fontSize:14,fontWeight:on?'700':'500'}}>{label}</Text></Pressable>;
 return <>
  <View style={{gap:6}}>
   <View style={{flexDirection:'row',alignItems:'center',gap:8}}><MetalMark width={22}/><Eyebrow>RACE DAY · {new Date().toLocaleDateString([],{weekday:'long',month:'short',day:'numeric'}).toUpperCase()}</Eyebrow></View>
   <Text style={{color:colors.text,fontSize:30,fontWeight:'900',fontStyle:'italic',letterSpacing:-1}}>{track||'Track day'}</Text>
   <Text style={{color:colors.muted,fontSize:14}}>{bike.model_year} {bike.manufacturer} {bike.model}{bike.engine_hours!=null?` · ${bike.engine_hours} h`:''}</Text>
  </View>
  <RaceSetupCard account={account} bike={bike} track={track} day={today()} onOpenChat={onOpenChat}/>
  <Card><Eyebrow>ON YOUR BIKE NOW</Eyebrow>
   {known.length?<View style={{flexDirection:'row',flexWrap:'wrap',rowGap:12}}>{known.map(([k,v])=><View key={k} style={{width:'50%',gap:2}}><Text style={{color:'#9aa2ae',fontSize:12}}>{k}</Text><Text style={{color:colors.text,fontSize:16,fontWeight:'700'}}>{v}</Text></View>)}</View>
   :<Copy>Your clickers, sag and tire pressures show here once they’re in Garage › Edit details.</Copy>}
  </Card>
  <Card><View style={{flexDirection:'row',alignItems:'center',gap:8}}><Icon name="bolt" size={16} color={colors.accent}/><Eyebrow>QUICK ASK</Eyebrow></View>
   <Text style={{color:colors.muted,fontSize:13.5,lineHeight:19}}>Tap what the bike did. BAK answers in race mode: the one change to make, short and fast.</Text>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{QUICK.map(q=>chip(q,false,()=>onQuick(quickAskText(track,q))))}</View>
  </Card>
  <RacePrepCard account={account} bike={bike} onOpen={()=>setPrepOpen(true)}/>
  <RacePrepSheet visible={prepOpen} onClose={()=>setPrepOpen(false)} account={account} bike={bike} startPhase="motos"/>
  <Card><Eyebrow>LOG A CHANGE</Eyebrow>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{MOTOS.map(m=>chip(m,moto===m,()=>setMoto(m)))}</View>
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
    <Text style={{color:colors.muted,fontSize:13.5}}>{time(l.recorded_at)} · {l.conditions.replace('Race day · ','')}{isLocal(l.id)?' · waiting for signal':''} · <Text style={{color:l.result==='better'?'#7fd09a':l.result==='worse'?'#ef9aa1':colors.muted,fontWeight:'700'}}>{SETUP_RESULT_LABELS[l.result]}</Text>{l.notes?` · ${l.notes}`:''}</Text>
   </View>)}
   <Pressable accessibilityRole="button" onPress={()=>onAsk(tryNextText(track,logs))} hitSlop={6}><Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>Ask BAK what to try next</Text></Pressable>
  </Card>}
  <Pressable accessibilityRole="button" onPress={onEnd} style={{alignSelf:'center',paddingVertical:10}}><Text style={{color:colors.muted,fontSize:15}}>End race day</Text></Pressable>
 </>;
}

/** Starts race day: shows the bike it's for (switchable) and asks which track, with one-tap picks from the rider's recent
 *  setup-log tracks and the events they're going to. */
export function RaceDayStart({visible,bike,bikes,onSwitch,onStart,onClose}:{visible:boolean;bike:Bike;bikes:Bike[];onSwitch:(id:string)=>void;onStart:(track:string,day:string,widget:boolean)=>void;onClose:()=>void}){
 const [day,setDay]=useState(today()),[widget,setWidget]=useState(true),[dir,setDir]=useState<KnownTrack[]>(()=>readProgress<KnownTrack[]>('device','track-directory',[])),[track,setTrack]=useState(''),[picks,setPicks]=useState<string[]>([]),[choosing,setChoosing]=useState(false);const insets=useSafeAreaInsets();
 useEffect(()=>{if(!visible)return;let live=true;setTrack('');setDay(today());setChoosing(false);
  Promise.all([api<SetupLog[]>(`/api/setup-logs?bike_id=${bike.id}`).catch(()=>[] as SetupLog[]),api<RideEvent[]>('/api/events?scope=upcoming').catch(()=>[] as RideEvent[])]).then(([logs,events])=>{
   const soon=events.filter(e=>!e.canceled_at&&(e.my_rsvp==='going'||e.mine)&&Date.parse(e.starts_at)-Date.now()<30*864e5).map(e=>e.location_name);
   if(live)setPicks(trackPicks(soon,logs.map(l=>l.track)));});
  return()=>{live=false;};},[visible,bike.id]);
 // BAK's tracks, kept on the phone so the picker works with no signal at the track.
 useEffect(()=>{if(!visible)return;api<KnownTrack[]>('/api/tracks').then(r=>{if(Array.isArray(r)&&r.length){setDir(r);try{writeProgress('device','track-directory',r);}catch{}}}).catch(()=>{});},[visible]);
 const known=knownTrack(dir,track),suggestions=trackSuggestions(dir,track);
 const name=(b:Bike)=>b.nickname||`${b.model_year} ${b.manufacturer} ${b.model}`;
 return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
  <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" automaticallyAdjustKeyboardInsets style={{flex:1,backgroundColor:colors.bg}} contentContainerStyle={{padding:20,paddingBottom:insets.bottom+20,gap:18}}>
   <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><Text style={{color:colors.text,fontSize:26,fontWeight:'900',fontStyle:'italic'}}>Race day</Text><Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}><Text style={{color:colors.muted,fontSize:16}}>Cancel</Text></Pressable></View>
   <Copy>Pick the track and the day. BAK works out a starting setup for that track and the forecast, and Home counts down with your prep list. On the day, Home becomes your track-day screen: quick ask, a change log and today’s entries. It ends by itself the day after.</Copy>
   <View style={{gap:8}}>
    <Text style={{color:'#adb5c1',fontSize:12.5,fontWeight:'600'}}>Bike</Text>
    <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
     <Text style={{flex:1,color:colors.text,fontSize:18,fontWeight:'800'}}>{name(bike)}</Text>
     {bikes.length>1&&<Pressable accessibilityRole="button" onPress={()=>setChoosing(!choosing)} hitSlop={8}><Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>{choosing?'Close':'Change'}</Text></Pressable>}
    </View>
    {choosing&&<View style={{gap:4}}>{bikes.filter(b=>b.id!==bike.id).map(b=><Pressable key={b.id} accessibilityRole="button" onPress={()=>{onSwitch(b.id);setChoosing(false);}} style={({pressed})=>({paddingVertical:10,opacity:pressed?0.6:1})}><Text style={{color:colors.text,fontSize:16}}>{name(b)}</Text></Pressable>)}</View>}
   </View>
   <View style={{gap:8}}>
    <Text style={{color:'#adb5c1',fontSize:12.5,fontWeight:'600'}}>Track</Text>
    {picks.length>0&&<View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{picks.map(t=>{const on=track===t;return <Pressable key={t} haptic="select" accessibilityRole="button" accessibilityState={{selected:on}} onPress={()=>setTrack(on?'':t)} style={({pressed})=>({paddingHorizontal:12,paddingVertical:8,borderRadius:16,borderWidth:1,borderColor:on?colors.accent:'#343a45',backgroundColor:on?tint(0.16):'transparent',opacity:pressed?0.7:1})}><Text style={{color:on?'#ffffff':'#c9cfd9',fontSize:14.5,fontWeight:on?'700':'500'}}>{t}</Text></Pressable>;})}</View>}
    <TextInput value={track} onChangeText={setTrack} maxLength={120} placeholder={picks.length?'Or search BAK’s tracks':'Search tracks, e.g. Dade City'} placeholderTextColor="#7d8593" autoCapitalize="words" autoCorrect={false} returnKeyType="done" onSubmitEditing={()=>Keyboard.dismiss()} style={{color:colors.text,fontSize:18,fontWeight:'600',borderBottomWidth:1,borderBottomColor:colors.accent,paddingVertical:10}}/>
    {suggestions.length>0&&<View style={{gap:2}}>{suggestions.map(t=><Pressable key={t.name} haptic="select" accessibilityRole="button" accessibilityLabel={`${t.name}${t.weather?', forecast available':''}`} onPress={()=>{setTrack(t.name);Keyboard.dismiss();}} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:10,paddingVertical:11,borderBottomWidth:1,borderBottomColor:'#1d2128',opacity:pressed?0.6:1})}>
     <View style={{flex:1,gap:1}}><Text style={{color:colors.text,fontSize:16,fontWeight:'600'}}>{t.name}</Text><Text style={{color:'#8b93a1',fontSize:12.5}}>{[t.city,t.state].filter(Boolean).join(', ')}</Text></View>
     {t.weather&&<Text style={{color:colors.text,fontSize:12,fontWeight:'700'}}>Forecast</Text>}
    </Pressable>)}</View>}
    <Text style={{color:known?.weather?'#7fd09a':'#7d8593',fontSize:12.5,lineHeight:18}}>{known?(known.weather?'BAK knows this track and can use the forecast for it.':'BAK knows this track. No forecast for it yet.'):track.trim()?'Not one of BAK’s tracks yet: the setup works from your bike and what you tell it, without a forecast.':'Optional. Pick one of BAK’s tracks for its dirt, layout and the forecast. It also goes on each change you log.'}</Text>
   </View>
   <View style={{gap:8}}>
    <DateField label="Race day" value={day} onChange={v=>setDay(v&&v>=today()?v:today())} years={[new Date().getFullYear(),new Date().getFullYear()+1]} quick={rideDays()}/>
   </View>
   <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
    <View style={{flex:1,gap:2}}><Text style={{color:colors.text,fontSize:16,fontWeight:'600'}}>Countdown on the widget</Text><Text style={{color:'#7d8593',fontSize:12.5}}>Days to go and your prep progress on the BAK MX Home Screen widget.</Text></View>
    <Switch value={widget} onValueChange={setWidget}/>
   </View>
   <Button title={day===today()?'Start race day':'Set up this race'} onPress={()=>{onStart(track,day,widget);setTrack('');}}/>
  </ScrollView>
 </Modal>;
}
