// Practice day on the phone, inside race mode: today's bike and setup, what's up next (with the Lock Screen countdown), a
// short practice checklist (BAK's race-prep items that fit a practice day; edited like race prep), a session log (number,
// time on track, notes, the setup change, which goes into the setup log), "How did it ride?" and Ask BAK about today.
// Built for weak signal: sessions are kept on the phone first, and a setup change waits in the queue until there is signal.
// The rules and words are in shared/practice-day.ts; src/PracticeDay.tsx is the website's version.
import React,{useEffect,useState} from 'react';
import {DISPLAY,LABEL} from './theme';
import {Text,TextInput,View} from 'react-native';
import type {Bike} from '../../../shared/types';
import {SETUP_RESULT_LABELS,SETUP_RESULT_ORDER,type SetupLog,type SetupResult} from '../../../shared/rider-types';
import {CHANGES,today,type NextUp,type RaceDay} from '../../../shared/race-day';
import {PRACTICE_COPY as COPY,SESSION_MINUTES,advanceNextUp,emptySession,makeSession,nextSessionNumber,practiceAskText,sessionChange,sessionLabel,sessionLogBody,sessionsFor,sessionsSummary,type PracticeSession,type SessionDraft,type StoredPractice} from '../../../shared/practice-day';
import {api,apiQueued} from './api';
import {isLocal} from './offline';
import {readProgress,writeProgress} from './localProgress';
import {Pressable} from './Touch';
import {Button,Card,Copy,Eyebrow,Icon,MetalMark,Notice,colors,tint,PickChip} from './ui';
import {success} from './haptics';
import {BikeNowCard,NextUpCard,bikeSetup,useRaceActivity} from './HomeBlocks';
import {RacePrepCard,RacePrepSheet} from './RacePrep';
import {TrackReportCard} from './TrackReport';
import {FuelPlanCard} from './FuelPlan';
import {RideDayMode} from './RideDay';
import {warmOffline} from './warmOffline';
import {LiveConditionsCard} from './LiveConditions';
import {RideRecorderCard} from './RideRecorder';
import {TrackHistoryCard} from './TrackHistory';
import {RIDE_DAY_COPY} from '../../../shared/ride-day';

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const time=(iso:string)=>new Date(iso).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
const storeKey=(bikeId:string)=>`practice-sessions:${bikeId}`;

/** Today's sessions for this bike, kept on the phone. Every change is written before anything goes to the network. */
export function usePracticeSessions(account:string,bikeId:string){
 const day=today();
 const read=()=>{try{return sessionsFor(readProgress<StoredPractice|null>(account,storeKey(bikeId),null),day);}catch{return [];}};
 const [sessions,setSessions]=useState<PracticeSession[]>(read);
 useEffect(()=>{setSessions(read());},[account,bikeId,day]);
 const save=(next:PracticeSession[]):boolean=>{setSessions(next);try{writeProgress(account,storeKey(bikeId),{day,sessions:next});return true;}catch{return false;}};
 return {sessions,save};
}

function Chip({label,on,onPress}:{label:string;on:boolean;onPress:()=>void}){
 return <PickChip label={label} on={on} onPress={onPress}/>;
}
const Wrap=({children}:{children:React.ReactNode})=><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{children}</View>;
const Label=({children}:{children:React.ReactNode})=><Text style={{color:'#adb5c1',fontSize:12.5,fontWeight:'600'}}>{children}</Text>;
const input={color:colors.text,fontSize:16,borderBottomWidth:1,borderBottomColor:'#2f3540',paddingVertical:10} as const;
const tone=(r:SetupResult)=>r==='better'?'#7fd09a':r==='worse'?'#ef9aa1':colors.muted;

export function PracticeDayHome({bike,account,race,onEnd,onAsk,onNext}:{bike:Bike;account:string;race:RaceDay;onEnd:()=>void;onAsk:(text:string)=>void;onNext:(next:NextUp|null)=>void}){
 const {sessions,save}=usePracticeSessions(account,bike.id);
 useEffect(()=>{void warmOffline(bike.id);},[bike.id]);
 const [draft,setDraft]=useState<SessionDraft>(emptySession),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[prepOpen,setPrepOpen]=useState(false),[rideDay,setRideDay]=useState(false);
 const set=(p:Partial<SessionDraft>)=>setDraft(d=>({...d,...p}));
 const track=race.track,n=nextSessionNumber(sessions),latest=[...sessions].sort((a,b)=>b.n-a.n)[0];
 const bikeName=`${bike.model_year} ${bike.manufacturer} ${bike.model}`;
 useRaceActivity(account,bike,race,latest?`${sessionLabel(latest)}${latest.change?' · '+sessionChange(latest):''}`:'');
 const labels=[`Session ${n}`,`Session ${n+1}`];
 /** Logs one session from a draft: on the phone first, then the setup change to the setup log (queued with no signal).
  *  Returns what to tell the rider. Used by the session card and by Ride Day mode. */
 async function logDraft(d:SessionDraft):Promise<string>{
  const made=makeSession(sessions,d);if(!made.session)return made.problem;
  const s=made.session;
  // On the phone first, so a dead zone never loses a session.
  let list=[...sessions,s];if(!save(list))return 'This phone could not save the session. Free some storage and try again.';
  success();
  onNext(advanceNextUp(race.next,`Session ${s.n}`));
  const body=sessionLogBody(s,bike,track);
  if(!body)return RIDE_DAY_COPY.saved;
  try{
   const saved=await apiQueued<SetupLog>('/api/setup-logs',body,{...(body as Omit<SetupLog,'id'|'user_id'|'created_at'>),user_id:account,created_at:s.at},'Practice session');
   list=list.map(x=>x.id===s.id?{...x,logId:saved.id,waiting:!!saved.pending}:x);save(list);
   return saved.pending?RIDE_DAY_COPY.savedQueued:RIDE_DAY_COPY.saved;
  }catch(e){return `Session saved on this phone, but the setup change could not go to your setup log: ${errorText(e)}`;}
 }
 /** Ride Day: how the last change rode, once the rider is back in. Saved on the phone, and on the setup log when it has one. */
 function rate(id:string,result:SetupResult){
  const list=sessions.map(x=>x.id===id?{...x,result}:x);save(list);success();
  const s=list.find(x=>x.id===id);const body=s&&sessionLogBody(s,bike,track);
  if(s?.logId&&body)void api(`/api/setup-logs?id=${s.logId}`,'PATCH',body).catch(()=>{});
 }
 async function log(){
  if(busy)return;setBusy(true);setNotice('');
  const msg=await logDraft(draft);
  if(msg===RIDE_DAY_COPY.saved||msg===RIDE_DAY_COPY.savedQueued||msg.startsWith('Session saved on this phone'))setDraft(emptySession());
  setNotice(msg===RIDE_DAY_COPY.saved?'':msg===RIDE_DAY_COPY.savedQueued?COPY.queued:msg);
  setBusy(false);
 }
 const ordered=[...sessions].sort((a,b)=>b.n-a.n);
 const linked=ordered.find(x=>x.logId&&!isLocal(x.logId));
 return <>
  <View style={{gap:6}}>
   <View style={{flexDirection:'row',alignItems:'center',gap:8}}><Eyebrow>PRACTICE DAY · {new Date().toLocaleDateString([],{weekday:'long',month:'short',day:'numeric'})}</Eyebrow></View>
   <Text style={{color:colors.text,fontSize:24,...DISPLAY,letterSpacing:0}}>{track||'Practice day'}</Text>
   <Text style={{color:colors.muted,fontSize:14}}>{bikeName}{bike.engine_hours!=null?` · ${bike.engine_hours} h`:''}{sessions.length?` · ${sessionsSummary(sessions)}`:''}</Text>
  </View>
  <Pressable haptic="press" accessibilityRole="button" accessibilityLabel={`${RIDE_DAY_COPY.open}. ${RIDE_DAY_COPY.openDetail}`} onPress={()=>setRideDay(true)} style={({pressed})=>({minHeight:72,borderRadius:18,borderWidth:1.5,borderColor:colors.accent,backgroundColor:pressed?tint(0.28):tint(0.16),paddingHorizontal:16,paddingVertical:12,flexDirection:'row',alignItems:'center',gap:12})}>
   <Icon name="moto" size={28} color={colors.accent}/>
   <View style={{flex:1,gap:2}}><Text style={{color:colors.text,fontSize:17,...LABEL}}>{RIDE_DAY_COPY.open.toUpperCase()}</Text><Text style={{color:colors.muted,fontSize:13.5}}>{RIDE_DAY_COPY.openDetail}</Text></View>
   <Icon name="chevronRight" size={20} color={colors.muted}/>
  </Pressable>
  <RideDayMode visible={rideDay} onClose={()=>setRideDay(false)} bike={bike} track={track} sessions={sessions} onLog={logDraft} onRate={rate} onAsk={()=>onAsk(practiceAskText({track,bike:bikeName,setup:bikeSetup(bike),sessions}))}/>
  <LiveConditionsCard track={track}/>
  <RideRecorderCard bike={bike} track={track}/>
  <NextUpCard race={race} labels={labels} onSet={onNext}/>
  <BikeNowCard bike={bike}/>
  <TrackHistoryCard track={track} bikeId={bike.id}/>
  <Card>
   <View style={{flexDirection:'row',alignItems:'center',gap:8}}><Icon name="bolt" size={16} color={colors.accent}/><Eyebrow bare>{COPY.ask}</Eyebrow></View>
   <Text style={{color:colors.muted,fontSize:13.5,lineHeight:19}}>{COPY.askDetail}</Text>
   <Button title={COPY.ask} onPress={()=>onAsk(practiceAskText({track,bike:bikeName,setup:bikeSetup(bike),sessions}))}/>
  </Card>
  <FuelPlanCard account={account} race={race} kind="practice"/>
  <RacePrepCard kind="practice" account={account} bike={bike} phase={sessions.length?'motos':'track'} onOpen={()=>setPrepOpen(true)}/>
  <RacePrepSheet kind="practice" visible={prepOpen} onClose={()=>setPrepOpen(false)} account={account} bike={bike} startPhase={sessions.length?'motos':'track'}/>
  <Card><Eyebrow>{COPY.logSession} · SESSION {n}</Eyebrow>
   <Label>{COPY.timeOnTrack}</Label>
   <Wrap>{SESSION_MINUTES.map(m=><Chip key={m} label={`${m} min`} on={draft.minutes===String(m)} onPress={()=>set({minutes:draft.minutes===String(m)?'':String(m)})}/>)}</Wrap>
   <TextInput value={draft.minutes} onChangeText={v=>set({minutes:v})} maxLength={6} keyboardType="numbers-and-punctuation" placeholder="Or type minutes, e.g. 25" placeholderTextColor="#7d8593" accessibilityLabel={COPY.timeOnTrack} style={input}/>
   <Label>{COPY.notesLabel}</Label>
   <TextInput value={draft.notes} onChangeText={v=>set({notes:v})} maxLength={500} multiline placeholder={COPY.notesPlaceholder} placeholderTextColor="#7d8593" style={[input,{minHeight:44}]}/>
   <Label>{COPY.changeLabel}</Label>
   <Wrap>{CHANGES.map(c=><Chip key={c} label={c} on={draft.change===c} onPress={()=>set({change:draft.change===c?'':c})}/>)}</Wrap>
   {!!draft.change&&<>
    <TextInput value={draft.detail} onChangeText={v=>set({detail:v})} maxLength={200} placeholder="e.g. 2 clicks softer, or 13 psi" placeholderTextColor="#7d8593" accessibilityLabel="Detail of the change" style={input}/>
    <Label>How did it ride?</Label>
    <Wrap>{SETUP_RESULT_ORDER.map(r=><Chip key={r} label={SETUP_RESULT_LABELS[r]} on={draft.result===r} onPress={()=>set({result:r})}/>)}</Wrap>
    <Text style={{color:'#7d8593',fontSize:12.5}}>Goes into your setup log with this session.</Text>
   </>}
   <Notice text={notice}/>
   <Button disabled={busy} title={busy?COPY.saving:COPY.save} onPress={()=>void log()}/>
  </Card>
  <Card><Eyebrow>{COPY.sessions}{sessions.length?` · ${sessionsSummary(sessions)}`:''}</Eyebrow>
   {!sessions.length&&<Copy>{COPY.none}</Copy>}
   {ordered.map(x=><View key={x.id} style={{gap:2,paddingVertical:4}}>
    <Text style={{color:colors.text,fontSize:15.5,fontWeight:'700'}}>{sessionLabel(x)}{x.change?<Text style={{color:colors.text,fontWeight:'600'}}> · {sessionChange(x)}</Text>:null}</Text>
    <Text style={{color:colors.muted,fontSize:13.5}}>{time(x.at)}{x.change?<Text style={{color:tone(x.result),fontWeight:'700'}}> · {SETUP_RESULT_LABELS[x.result]}</Text>:null}{x.waiting?' · waiting for signal':x.logId?' · in setup log':''}{x.notes?` · ${x.notes}`:''}</Text>
   </View>)}
  </Card>
  <TrackReportCard track={track} day={today()} setupLogId={linked?.logId??null} setupLabel={linked?sessionChange(linked):undefined} showOthers/>
  <Pressable accessibilityRole="button" onPress={onEnd} style={{alignSelf:'center',paddingVertical:10}}><Text style={{color:colors.muted,fontSize:15}}>{COPY.end}</Text></Pressable>
 </>;
}
