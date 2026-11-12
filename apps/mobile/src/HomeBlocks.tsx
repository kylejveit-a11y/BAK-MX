// Home, the rider's way: blocks they can turn on, off and reorder (saved on this phone), and race-day mode, which turns Home
// into a track-day screen: today's setup, a between-motos checklist and a fast change log that goes into the setup log.
import {PageSheet} from './PageSheet';
import React,{useCallback,useEffect,useState} from 'react';
import {Keyboard,Modal,Platform,ScrollView,Text,TextInput,View} from 'react-native';
import DateTimePicker,{type DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {Bike,ServiceEvent,Conversation,EngineeringResponse} from '../../../shared/types';
import {AI_CONSENT_VERSION} from '../../../shared/ai-consent';
import {randomUUID} from 'expo-crypto';
import {DateField,rideDays} from './DateSheet';
import {EVENT_TYPE_LABELS,SETUP_RESULT_LABELS,SETUP_RESULT_ORDER,type RideEvent,type SetupLog,type SetupResult} from '../../../shared/rider-types';
import {api,apiStream,apiQueued,currentStore} from './api';
import {isLocal,pending,withPending} from './offline';
import {readProgress,writeProgress} from './localProgress';
import {Pressable} from './Touch';
import {Button,Card,Copy,Eyebrow,Icon,MetalMark,Notice,Switch,colors,tint,type IconName} from './ui';
import {success} from './haptics';
import {RacePrepCard,RacePrepSheet,useRacePrep,Progress} from './RacePrep';
import {FuelPlanCard} from './FuelPlan';
import {RACE_PHASES,phaseForDaysOut,type RacePhase} from '../../../shared/race-prep';
import {advanceNextUp,checklistCount,clockText,countdownText,nextChecklistItem,nextQuarterHour,nextUpDate} from '../../../shared/practice-day';
import {endRaceActivity,setRaceStatus,setRaceWidget,syncRaceActivity} from './widgets/sync';
import {upNext,type PlanItem} from '../../../shared/service-plan';
import {RichText} from './RichText';
import {TrackReportCard} from './TrackReport';
import {OFF_RACE as OFF,dayOf,today,activeRace,raceToday,daysToGo,whenText,QUICK,CHANGES,MOTOS,quickAskText,tryNextText,raceSetupTitle,raceSetupQuestion,raceSetupField,raceSetupKey,raceSetupStale,plain,knownTrack,trackSuggestions,trackPicks,isPractice,type RaceDay,type KnownTrack,type NextUp} from '../../../shared/race-day';
export {daysToGo,whenText,type RaceDay};

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const when=(iso:string)=>new Date(iso).toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'});
const time=(iso:string)=>new Date(iso).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});

// ------------------------------------------------------------------ layout
import {HOME_BLOCKS,DEFAULT_LAYOUT,migrateLayout,type HomeBlock,type Layout} from './homeLayout';
export {HOME_BLOCKS,type HomeBlock};
export function useHomeLayout(account:string){
 const [layout,setLayout]=useState<Layout>(()=>migrateLayout(readProgress<{id:string;on:boolean}[]|null>(account,'home-layout',null)));
 const save=(next:Layout)=>{setLayout(next);try{writeProgress(account,'home-layout',next);}catch{}};
 return {layout,save,reset:()=>save(DEFAULT_LAYOUT)};
}

export function HomeEditor({visible,layout,onChange,onReset,onClose}:{visible:boolean;layout:Layout;onChange:(l:Layout)=>void;onReset:()=>void;onClose:()=>void}){
 const insets=useSafeAreaInsets();
 const move=(i:number,d:-1|1)=>{const j=i+d;if(j<0||j>=layout.length)return;const next=[...layout];[next[i],next[j]]=[next[j],next[i]];onChange(next);};
 const arrow=(name:IconName,label:string,disabled:boolean,onPress:()=>void)=><Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} hitSlop={6} onPress={onPress} style={({pressed})=>({width:34,height:34,borderRadius:17,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#2f3540',opacity:disabled?0.25:pressed?0.6:1})}><Icon name={name} size={16} color={colors.text}/></Pressable>;
 return <PageSheet visible={visible} animationType="slide" onRequestClose={onClose}>
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
     <Switch value={b.on} onValueChange={v=>onChange(layout.map(x=>x.id===b.id?{...x,on:v}:x))} accessibilityLabel={`Show ${meta.label}`}/>
    </View>;})}
    <Pressable accessibilityRole="button" onPress={onReset} style={{paddingVertical:18}}><Text style={{color:colors.muted,fontSize:15}}>Reset to the standard layout</Text></Pressable>
   </ScrollView>
  </View>
 </PageSheet>;
}

// ------------------------------------------------------------------ blocks
function BlockHead({title,action,onAction}:{title:string;action?:string;onAction?:()=>void}){
 return <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:8}}><MetalMark width={14}/><Eyebrow>{title}</Eyebrow></View>
  {action&&onAction&&<Pressable accessibilityRole="button" hitSlop={8} onPress={onAction} style={{flexDirection:'row',alignItems:'center',gap:4}}><Text style={{color:colors.text,fontWeight:'700'}}>{action}</Text><Icon name="chevronRight" size={15} color={colors.accent} weight={2.2}/></Pressable>}
 </View>;
}

/** The one thing worth a glance: a service that is actually due (a job never logged has no due state, so it never shows here),
 *  else the next event the rider is going to, else the last setup change. Nothing shows when there is nothing to say. */
export function UpNextBlock({bike,onService,onEvents,onSetup}:{bike:Bike;onService:()=>void;onEvents:()=>void;onSetup:()=>void}){
 const [data,setData]=useState<{due:{key:string;category:string;left:number|null;at:number|null}[];event:RideEvent|null;log:SetupLog|null}|null>(null);
 useFocusEffect(useCallback(()=>{let live=true;
  Promise.all([
   api<ServiceEvent[]>(`/api/services?bike_id=${bike.id}`).catch(()=>[] as ServiceEvent[]),
   api<{items:PlanItem[]}>(`/api/service-plan?bike_id=${bike.id}`).then(r=>r.items).catch(()=>null),
   api<RideEvent[]>('/api/events?scope=upcoming').catch(()=>[] as RideEvent[]),
   api<SetupLog[]>(`/api/setup-logs?bike_id=${bike.id}`).catch(()=>[] as SetupLog[]),
  ]).then(([events,plan,rides,logs])=>{if(!live)return;
   // Due means a figure: overdue or within the next 10 hours. A reminder with no hours on the bike is not a due state.
   const due=upNext(plan,events,bike.engine_hours,2).filter(d=>d.left!=null&&d.left<=10);
   const going=rides.filter(e=>!e.canceled_at&&(e.my_rsvp==='going'||e.mine)).sort((a,b)=>a.starts_at.localeCompare(b.starts_at));
   setData({due,event:going[0]??null,log:logs[0]??null});});
  return()=>{live=false;};},[bike.id,bike.engine_hours]));
 if(!data)return null;
 if(data.due.length)return <Card><BlockHead title="UP NEXT" action="Service log" onAction={onService}/>
  {data.due.map(d=>{const over=d.left!=null&&d.left<=0;return <View key={d.key} style={{flexDirection:'row',alignItems:'center',gap:10}}>
   <View style={{width:8,height:8,borderRadius:4,backgroundColor:over?'#ef6b73':'#e8c15a'}}/>
   <Text style={{flex:1,color:colors.text,fontSize:15.5,fontWeight:'600'}}>{d.category}</Text>
   <Text style={{color:over?'#ef9aa1':colors.muted,fontSize:14,fontWeight:over?'700':'500'}}>{over?(d.left===0?'due now':`${Math.abs(d.left!)} h overdue`):`in ${d.left} h`}</Text>
  </View>;})}
 </Card>;
 if(data.event){const e=data.event;return <Card><BlockHead title="UP NEXT" action="Events" onAction={onEvents}/>
  <Pressable accessibilityRole="button" onPress={onEvents} style={({pressed})=>({gap:2,opacity:pressed?0.7:1})}>
   <Text style={{color:colors.text,fontSize:12.5,fontWeight:'700'}}>{EVENT_TYPE_LABELS[e.event_type]}{e.my_rsvp==='going'?' · You’re going':e.mine?' · Yours':''}</Text>
   <Text style={{color:colors.text,fontSize:16,fontWeight:'700'}}>{e.title}</Text>
   <Text style={{color:colors.muted,fontSize:13.5}}>{when(e.starts_at)} · {time(e.starts_at)} · {e.location_name}</Text>
  </Pressable>
 </Card>;}
 if(data.log){const log=data.log,tone=log.result==='better'?'#7fd09a':log.result==='worse'?'#ef9aa1':colors.muted;return <Card><BlockHead title="LAST SETUP CHANGE" action="Setup log" onAction={onSetup}/>
  <Text style={{color:colors.text,fontSize:16,fontWeight:'700'}}>{log.change_made||'Setup recorded'}</Text>
  <Text style={{color:colors.muted,fontSize:13.5}}>{when(log.recorded_at)}{log.track?` · ${log.track}`:''}{log.conditions?` · ${log.conditions}`:''}</Text>
  <Text style={{color:tone,fontSize:14,fontWeight:'700'}}>{SETUP_RESULT_LABELS[log.result]}{log.notes?<Text style={{color:colors.muted,fontWeight:'400'}}> · {log.notes}</Text>:null}</Text>
 </Card>;}
 return null;
}

type Coached={fix:string;drill:string;at:string;media:{focus?:string}};
export function CoachingBlock({bike,onOpen,onCoach}:{bike:Bike;onOpen:()=>void;onCoach?:()=>void}){
 const [s,setS]=useState<Coached|null|undefined>(undefined);
 useFocusEffect(useCallback(()=>{api<Coached[]>(`/api/coaching?bike_id=${bike.id}`).then(l=>setS(l[0]??null)).catch(()=>setS(undefined));},[bike.id]));
 if(s===undefined)return null;
 // The block is on but there is nothing to show yet: say so and point at the way to get the first session.
 if(!s||!s.fix)return <Card><BlockHead title="LAST COACHING" action="Coaching" onAction={onOpen}/>
  <Text style={{color:colors.muted,fontSize:14.5,lineHeight:21}}>No coaching sessions yet. Send BAK a riding clip from Chat to get your first one.</Text>
  {onCoach&&<Pressable accessibilityRole="button" onPress={onCoach} hitSlop={6}><Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>Coach me from a clip</Text></Pressable>}
 </Card>;
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
 useFocusEffect(useCallback(()=>{const r=readRace(account)??OFF;setRace(old=>JSON.stringify(old)===JSON.stringify(r)?old:r);},[account]));
 const save=(r:RaceDay)=>{setRace(r);try{writeProgress(account,'race-day',r);}catch{}setRaceStatus(r.on?r:null);};
 return {race,isToday:race.on&&race.day===today(),upcoming:race.on&&race.day>today(),
  /** A practice day is always today; a race can be set ahead and Home counts down to it. */
  start:(track:string,day:string=today(),widget=true,kind:'race'|'practice'='race')=>save({on:true,track:track.trim(),day:kind==='practice'?today():day,widget,kind,next:null}),
  end:()=>{endRaceActivity();save(OFF);},
  /** The moto or session up next ("Moto 1 at 10:40"); the Lock Screen activity counts down to it. */
  setNext:(next:NextUp|null)=>{const cur=readRace(account);if(cur)save({...cur,next});}};
}

// ------------------------------------------------------------------ BAK's starting setup for the race
type RaceSetup={key:string;at:string;summary:string;answer:string;changes:{setting:string;change:string;expect:string;go_back_if:string}[];next:string;conversation:string};
/** BAK works out a starting setup for this track, date and forecast from what is on the bike now. Saved on the phone. */
export function RaceSetupCard({account,bike,track,day,onOpenChat}:{account:string;bike:Bike;track:string;day:string;onOpenChat:(conversation:string)=>void}){
 const key=raceSetupKey(bike.id,track,day);
 const [saved,setSaved]=useState<RaceSetup|null>(()=>{const r=readProgress<RaceSetup|null>(account,'race-setup',null);return r&&r.key===key?r:null;});
 const [live,setLive]=useState<{summary:string;answer:string}|null>(null),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 useEffect(()=>{const r=readProgress<RaceSetup|null>(account,'race-setup',null);setSaved(r&&r.key===key?r:null);},[account,key]);
 // AI consent is read fresh: at tap time (the rider may have agreed in Ask BAK a moment ago) and again whenever Home comes back
 // into view, so the notice clears by itself instead of waiting for a re-render.
 const consentNow=()=>readProgress<boolean>(account,'ai-consent-'+AI_CONSENT_VERSION,false)===true;
 useFocusEffect(useCallback(()=>{if(consentNow())setNotice(n=>n.startsWith('Open Ask BAK once')?'':n);},[account]));
 const stale=!!saved&&raceSetupStale(day,saved.at);
 async function get(){
  if(busy)return;if(!consentNow()){setNotice('Open Ask BAK once and agree to the AI terms, then come back.');return;}
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
 const show=race.on&&race.widget!==false&&race.day>=today()&&!isPractice(race);
 useEffect(()=>{setRaceWidget(show?{track:race.track,day:race.day,done,total:before.length}:null);},[show,race.track,race.day,done,before.length,phaseName]);
 // The Next event widget shows today's race-day status; the Lock Screen activity only lives on the day itself.
 const live=race.on&&race.day===today();
 useEffect(()=>{setRaceStatus(race.on?race:null);if(!live)endRaceActivity();},[race.on,race.day,race.track,race.kind,live]);
}

/** Keeps the Lock Screen / Dynamic Island activity in step with the day: the next moto or session and its time, the next
 *  checklist item, and the last thing logged. Started by the race-day or practice-day screen, ended by End race day. */
export function useRaceActivity(account:string,bike:Bike,race:RaceDay,last:string){
 const kind=isPractice(race)?'practice' as const:'race' as const;
 const {list,checks}=useRacePrep(account,bike,kind);
 const phases:RacePhase[]=['track','motos'],item=nextChecklistItem(list,checks,phases),{done,total}=checklistCount(list,checks,phases);
 useEffect(()=>{if(!race.on||race.day!==today())return;
  syncRaceActivity(`${kind}|${race.track}|${race.day}`,{kind,track:race.track,day:race.day,next:race.next??null,item:item?.label??'',done,total,last});
 },[race.on,race.day,race.track,race.next?.label,race.next?.at,kind,item?.id,done,total,last]);
}

/** "Next up": the moto or session and its time ("Moto 1 at 10:40"), with a countdown. Feeds the Lock Screen activity.
 *  The time is a native time picker (spinner), opened on the next quarter hour so the first tap is close to right. */
export function NextUpCard({race,labels,onSet}:{race:RaceDay;labels:string[];onSet:(next:NextUp|null)=>void}){
 const next=race.next??null;
 const clockOf=(d:Date)=>`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
 const dateOf=(clock:string)=>{const [h,m]=clock.split(':').map(Number);const d=new Date();d.setHours(h,m,0,0);return d;};
 const startAt=()=>dateOf(next?.at||nextQuarterHour());
 const [now,setNow]=useState(()=>new Date()),[editing,setEditing]=useState(!next?.at),[label,setLabel]=useState(next?.label??labels[0]),[at,setAt]=useState<Date>(startAt),[androidOpen,setAndroidOpen]=useState(false);
 useEffect(()=>{const t=setInterval(()=>setNow(new Date()),30000);return()=>clearInterval(t);},[]);
 useEffect(()=>{setLabel(next?.label??labels[0]);setAt(startAt());setEditing(!next?.at);},[next?.label,next?.at,labels[0]]);
 const save=()=>{success();onSet({label,at:clockOf(at)});setEditing(false);};
 const when=nextUpDate(next,race.day);
 const chip=(l:string)=>{const on=label===l;return <Pressable key={l} haptic="select" accessibilityRole="button" accessibilityState={{selected:on}} onPress={()=>setLabel(l)} style={({pressed})=>({paddingHorizontal:12,paddingVertical:7,borderRadius:16,borderWidth:1,borderColor:on?colors.accent:'#343a45',backgroundColor:on?tint(0.16):'transparent',opacity:pressed?0.7:1})}><Text style={{color:on?'#ffffff':'#c9cfd9',fontSize:14,fontWeight:on?'700':'500'}}>{l}</Text></Pressable>;};
 const picked=(_e:DateTimePickerEvent,d?:Date)=>{setAndroidOpen(false);if(d)setAt(d);};
 return <Card>
  <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
   <View style={{flexDirection:'row',alignItems:'center',gap:8}}><Icon name="clock" size={16} color={colors.accent}/><Eyebrow>NEXT UP</Eyebrow></View>
   {!editing&&next&&<View style={{flexDirection:'row',gap:16}}>
    <Pressable accessibilityRole="button" onPress={()=>setEditing(true)} hitSlop={8}><Text style={{color:colors.text,fontWeight:'700'}}>Change</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={()=>onSet(null)} hitSlop={8}><Text style={{color:colors.muted}}>Clear</Text></Pressable>
   </View>}
  </View>
  {!editing&&next&&<View style={{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',gap:12}}>
   <View style={{flex:1,gap:2}}><Text style={{color:colors.text,fontSize:21,fontWeight:'800'}}>{next.label}</Text><Text style={{color:colors.muted,fontSize:14}}>{next.at?clockText(next.at):'Time not set'}</Text></View>
   {when?<Text style={{color:colors.accent,fontSize:22,fontWeight:'900',fontStyle:'italic',fontVariant:['tabular-nums']}}>{countdownText(when,now)}</Text>:<Pressable accessibilityRole="button" onPress={()=>setEditing(true)} hitSlop={8}><Text style={{color:colors.text,fontWeight:'700'}}>Set the time</Text></Pressable>}
  </View>}
  {editing&&<>
   <Text style={{color:colors.muted,fontSize:13.5,lineHeight:19}}>Set your next {labels[0].startsWith('Session')?'session':'moto'} time and the Lock Screen counts down to it, with the next item on your checklist.</Text>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{labels.map(chip)}</View>
   {Platform.OS==='ios'
    ?<View accessible accessibilityLabel={`${label} time`} style={{alignSelf:'stretch'}}><DateTimePicker value={at} mode="time" display="spinner" minuteInterval={5} themeVariant="dark" accentColor={colors.accent} textColor={colors.text} onChange={picked} style={{height:150,marginVertical:-6}}/></View>
    :<><Pressable accessibilityRole="button" accessibilityLabel={`${label} time, ${clockText(clockOf(at))}. Change`} onPress={()=>setAndroidOpen(true)} hitSlop={8} style={({pressed})=>({paddingVertical:10,borderBottomWidth:1,borderBottomColor:colors.accent,opacity:pressed?0.7:1})}><Text style={{color:colors.text,fontSize:22,fontWeight:'800'}}>{clockText(clockOf(at))}</Text></Pressable>
     {androidOpen&&<DateTimePicker value={at} mode="time" display="spinner" minuteInterval={5} themeVariant="dark" accentColor={colors.accent} onChange={picked}/>}</>}
   <View style={{flexDirection:'row',alignItems:'center',gap:18}}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Set ${label} at ${clockText(clockOf(at))}`} onPress={save} hitSlop={8}><Text style={{color:colors.text,fontSize:15.5,fontWeight:'700'}}>Set</Text></Pressable>
    {next&&<Pressable accessibilityRole="button" onPress={()=>{setEditing(false);setAt(startAt());}} hitSlop={8}><Text style={{color:colors.muted,fontSize:15}}>Cancel</Text></Pressable>}
   </View>
  </>}
 </Card>;
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
/** What's on the bike now, in the words the race-day card uses (only the ones that are set). */
export function bikeSetup(bike:Bike):[string,string][]{
 const setup:[string,string][]=[['Fork comp',config(bike,'fork_compression')],['Fork reb',config(bike,'fork_rebound')],['Shock comp',config(bike,'shock_compression')],['Shock reb',config(bike,'shock_rebound')],['Race sag',config(bike,'rider_sag_mm')?config(bike,'rider_sag_mm')+' mm':''],['Tires',config(bike,'tire_pressures')]];
 return setup.filter(([,v])=>v);
}
export function BikeNowCard({bike}:{bike:Bike}){
 const known=bikeSetup(bike);
 return <Card><Eyebrow>ON YOUR BIKE NOW</Eyebrow>
  {known.length?<View style={{flexDirection:'row',flexWrap:'wrap',rowGap:12}}>{known.map(([k,v])=><View key={k} style={{width:'50%',gap:2}}><Text style={{color:'#9aa2ae',fontSize:12}}>{k}</Text><Text style={{color:colors.text,fontSize:16,fontWeight:'700'}}>{v}</Text></View>)}</View>
  :<Copy>Your clickers, sag and tire pressures show here once they’re in Garage › Edit details.</Copy>}
 </Card>;
}

/** The race-day Home: today's setup, what's up next, the between-motos check, a fast change log and today's entries. */
export function RaceDayHome({bike,account,track,race,onEnd,onAsk,onQuick,onOpenChat,onNext}:{bike:Bike;account:string;track:string;race?:RaceDay;onEnd:()=>void;onAsk:(text:string)=>void;onQuick:(text:string)=>void;onOpenChat:(c:string)=>void;onNext?:(next:NextUp|null)=>void}){
 const [prepOpen,setPrepOpen]=useState(false);
 const day:RaceDay=race??{on:true,track,day:today()};
 const [logs,setLogs]=useState<SetupLog[]>([]),[moto,setMoto]=useState('Moto 1'),[what,setWhat]=useState(''),[detail,setDetail]=useState(''),[result,setResult]=useState<SetupResult>('not_tested'),[note,setNote]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const load=useCallback(async()=>{try{const all=setupLogsWithPending(await api<SetupLog[]>(`/api/setup-logs?bike_id=${bike.id}`),bike.id);setLogs(all.filter(l=>dayOf(new Date(l.recorded_at))===today()));}catch(e){setNotice(errorText(e));}},[bike.id]);
 useEffect(()=>{void load();},[load]);
 useRaceActivity(account,bike,day,logs[0]?`${logs[0].conditions.replace('Race day · ','')} · ${logs[0].change_made}`:'');
 async function log(){
  if(busy)return;if(!what){setNotice('Pick what you changed.');return;}
  setBusy(true);setNotice('');
  try{
   const settings:Record<string,string>={};for(const k of ['fork_compression','fork_rebound','shock_rebound','rider_sag_mm','fork_height_mm']){const v=config(bike,k);if(v)settings[k]=v.slice(0,200);}
   const body={bike_id:bike.id,recorded_at:new Date().toISOString(),track:track.slice(0,120),conditions:`Race day · ${moto}`.slice(0,200),engine_hours:bike.engine_hours??null,settings,change_made:`${what}${detail.trim()?': '+detail.trim():''}`.slice(0,1000),result,notes:note.trim().slice(0,4000)};
   const saved=await apiQueued<SetupLog>('/api/setup-logs',body,{...body,user_id:account,created_at:body.recorded_at},'Race-day change');
   // Logged the moto that was up next: the next one is the following moto, time to be set.
   if(onNext&&day.next){const moved=advanceNextUp(day.next,moto);if(moved!==day.next)onNext(moved);}
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
  {onNext&&<NextUpCard race={day} labels={MOTOS} onSet={onNext}/>}
  <RaceSetupCard account={account} bike={bike} track={track} day={today()} onOpenChat={onOpenChat}/>
  <FuelPlanCard account={account} race={day} kind="race"/>
  <BikeNowCard bike={bike}/>
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
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{SETUP_RESULT_ORDER.map(r=>chip(SETUP_RESULT_LABELS[r],result===r,()=>setResult(r)))}</View>
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
  {/* "How did it ride?" is already the change log's question above, so this section is simply the track report. */}
  <TrackReportCard title="Track report" track={track} day={today()} setupLogId={logs[0]&&!isLocal(logs[0].id)?logs[0].id:null} setupLabel={logs[0]?.change_made} showOthers/>
  <Pressable accessibilityRole="button" onPress={onEnd} style={{alignSelf:'center',paddingVertical:10}}><Text style={{color:colors.muted,fontSize:15}}>End race day</Text></Pressable>
 </>;
}

/** Starts race day: shows the bike it's for (switchable) and asks which track, with one-tap picks from the rider's recent
 *  setup-log tracks and the events they're going to. */
export function RaceDayStart({visible,initialKind='race',bike,bikes,onSwitch,onStart,onClose}:{visible:boolean;initialKind?:'race'|'practice';bike:Bike;bikes:Bike[];onSwitch:(id:string)=>void;onStart:(track:string,day:string,widget:boolean,kind:'race'|'practice')=>void;onClose:()=>void}){
 const [kind,setKind]=useState<'race'|'practice'>('race'),practice=kind==='practice';
 const [day,setDay]=useState(today()),[widget,setWidget]=useState(true),[dir,setDir]=useState<KnownTrack[]>(()=>readProgress<KnownTrack[]>('device','track-directory',[])),[track,setTrack]=useState(''),[picks,setPicks]=useState<string[]>([]),[choosing,setChoosing]=useState(false);const insets=useSafeAreaInsets();
 useEffect(()=>{if(!visible)return;let live=true;setTrack('');setDay(today());setChoosing(false);setKind(initialKind);
  Promise.all([api<SetupLog[]>(`/api/setup-logs?bike_id=${bike.id}`).catch(()=>[] as SetupLog[]),api<RideEvent[]>('/api/events?scope=upcoming').catch(()=>[] as RideEvent[])]).then(([logs,events])=>{
   const soon=events.filter(e=>!e.canceled_at&&(e.my_rsvp==='going'||e.mine)&&Date.parse(e.starts_at)-Date.now()<30*864e5).map(e=>e.location_name);
   if(live)setPicks(trackPicks(soon,logs.map(l=>l.track)));});
  return()=>{live=false;};},[visible,bike.id,initialKind]);
 // BAK's tracks, kept on the phone so the picker works with no signal at the track.
 useEffect(()=>{if(!visible)return;api<KnownTrack[]>('/api/tracks').then(r=>{if(Array.isArray(r)&&r.length){setDir(r);try{writeProgress('device','track-directory',r);}catch{}}}).catch(()=>{});},[visible]);
 const known=knownTrack(dir,track),suggestions=trackSuggestions(dir,track);
 const name=(b:Bike)=>b.nickname||`${b.model_year} ${b.manufacturer} ${b.model}`;
 return <PageSheet visible={visible} animationType="slide" onRequestClose={onClose}>
  <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" automaticallyAdjustKeyboardInsets style={{flex:1,backgroundColor:colors.bg}} contentContainerStyle={{padding:20,paddingBottom:insets.bottom+20,gap:18}}>
   <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><Text style={{color:colors.text,fontSize:26,fontWeight:'900',fontStyle:'italic'}}>{practice?'Practice day':'Race day'}</Text><Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}><Text style={{color:colors.muted,fontSize:16}}>Cancel</Text></Pressable></View>
   <View accessibilityRole="tablist" style={{flexDirection:'row',borderWidth:1,borderColor:'#2f3540',borderRadius:20,padding:3,alignSelf:'flex-start'}}>
    {(['race','practice'] as const).map(k=>{const on=kind===k;return <Pressable key={k} haptic="select" accessibilityRole="tab" accessibilityState={{selected:on}} onPress={()=>setKind(k)} style={({pressed})=>({paddingHorizontal:16,paddingVertical:8,borderRadius:17,backgroundColor:on?tint(0.22):'transparent',opacity:pressed?0.7:1})}><Text style={{color:on?'#ffffff':'#c9cfd9',fontSize:14.5,fontWeight:on?'800':'600'}}>{k==='race'?'Race day':'Practice day'}</Text></Pressable>;})}
   </View>
   <Copy>{practice?'A day of laps, today. Home becomes your practice screen: a session log, a short checklist and Ask BAK about today. Ends by itself tonight.':'Pick the track and the day. BAK works out a starting setup for the track and the forecast, and on the day Home becomes your track screen. Ends by itself the day after.'}</Copy>
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
   {!practice&&<View style={{gap:8}}>
    <DateField label="Race day" value={day} onChange={v=>setDay(v&&v>=today()?v:today())} years={[new Date().getFullYear(),new Date().getFullYear()+1]} quick={rideDays()}/>
   </View>}
   {!practice&&<View style={{flexDirection:'row',alignItems:'center',gap:12}}>
    <View style={{flex:1,gap:2}}><Text style={{color:colors.text,fontSize:16,fontWeight:'600'}}>Countdown on the widget</Text><Text style={{color:'#7d8593',fontSize:12.5}}>Days to go and your prep progress on the BAK MX Home Screen widget.</Text></View>
    <Switch value={widget} onValueChange={setWidget}/>
   </View>}
   <Button title={practice?'Start practice day':day===today()?'Start race day':'Set up this race'} onPress={()=>{onStart(track,practice?today():day,widget,kind);setTrack('');}}/>
  </ScrollView>
 </PageSheet>;
}
