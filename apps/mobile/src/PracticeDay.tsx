// Practice day on the phone, inside race mode: today's bike and setup, what's up next (with the Lock Screen countdown), a
// short practice checklist (BAK's race-prep items that fit a practice day; edited like race prep), a session log (number,
// time on track, notes, the setup change, which goes into the setup log), "How did it ride?" and Ask BAK about today.
// Built for weak signal: sessions are kept on the phone first, and a setup change waits in the queue until there is signal.
// The rules and words are in shared/practice-day.ts; src/PracticeDay.tsx is the website's version.
import React,{useEffect,useState} from 'react';
import {Text,TextInput,View} from 'react-native';
import type {Bike} from '../../../shared/types';
import {SETUP_RESULT_LABELS,type SetupLog,type SetupResult} from '../../../shared/rider-types';
import {CHANGES,today,type NextUp,type RaceDay} from '../../../shared/race-day';
import {PRACTICE_COPY as COPY,SESSION_MINUTES,advanceNextUp,emptySession,makeSession,nextSessionNumber,practiceAskText,sessionChange,sessionLabel,sessionLogBody,sessionsFor,sessionsSummary,type PracticeSession,type SessionDraft,type StoredPractice} from '../../../shared/practice-day';
import {apiQueued} from './api';
import {isLocal} from './offline';
import {readProgress,writeProgress} from './localProgress';
import {Pressable} from './Touch';
import {Button,Card,Copy,Eyebrow,Icon,MetalMark,Notice,colors,tint} from './ui';
import {success} from './haptics';
import {BikeNowCard,NextUpCard,bikeSetup,useRaceActivity} from './HomeBlocks';
import {RacePrepCard,RacePrepSheet} from './RacePrep';
import {TrackReportCard} from './TrackReport';
import {FuelPlanCard} from './FuelPlan';

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
 return <Pressable haptic="select" accessibilityRole="button" accessibilityState={{selected:on}} onPress={onPress} style={({pressed})=>({paddingHorizontal:12,paddingVertical:7,borderRadius:16,borderWidth:1,borderColor:on?colors.accent:'#343a45',backgroundColor:on?tint(0.16):'transparent',opacity:pressed?0.7:1})}><Text style={{color:on?'#ffffff':'#c9cfd9',fontSize:14,fontWeight:on?'700':'500'}}>{label}</Text></Pressable>;
}
const Wrap=({children}:{children:React.ReactNode})=><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{children}</View>;
const Label=({children}:{children:React.ReactNode})=><Text style={{color:'#adb5c1',fontSize:12.5,fontWeight:'600'}}>{children}</Text>;
const input={color:colors.text,fontSize:16,borderBottomWidth:1,borderBottomColor:'#2f3540',paddingVertical:10} as const;
const tone=(r:SetupResult)=>r==='better'?'#7fd09a':r==='worse'?'#ef9aa1':colors.muted;

export function PracticeDayHome({bike,account,race,onEnd,onAsk,onNext}:{bike:Bike;account:string;race:RaceDay;onEnd:()=>void;onAsk:(text:string)=>void;onNext:(next:NextUp|null)=>void}){
 const {sessions,save}=usePracticeSessions(account,bike.id);
 const [draft,setDraft]=useState<SessionDraft>(emptySession),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[prepOpen,setPrepOpen]=useState(false);
 const set=(p:Partial<SessionDraft>)=>setDraft(d=>({...d,...p}));
 const track=race.track,n=nextSessionNumber(sessions),latest=[...sessions].sort((a,b)=>b.n-a.n)[0];
 const bikeName=`${bike.model_year} ${bike.manufacturer} ${bike.model}`;
 useRaceActivity(account,bike,race,latest?`${sessionLabel(latest)}${latest.change?' · '+sessionChange(latest):''}`:'');
 const labels=[`Session ${n}`,`Session ${n+1}`];
 async function log(){
  if(busy)return;const made=makeSession(sessions,draft);if(!made.session){setNotice(made.problem);return;}
  const s=made.session;setBusy(true);setNotice('');
  // On the phone first, so a dead zone never loses a session.
  let list=[...sessions,s];if(!save(list)){setNotice('This phone could not save the session. Free some storage and try again.');setBusy(false);return;}
  setDraft(emptySession());success();
  onNext(advanceNextUp(race.next,`Session ${s.n}`));
  const body=sessionLogBody(s,bike,track);
  if(body){
   try{
    const saved=await apiQueued<SetupLog>('/api/setup-logs',body,{...(body as Omit<SetupLog,'id'|'user_id'|'created_at'>),user_id:account,created_at:s.at},'Practice session');
    list=list.map(x=>x.id===s.id?{...x,logId:saved.id,waiting:!!saved.pending}:x);save(list);
    if(saved.pending)setNotice(COPY.queued);
   }catch(e){setNotice(`Session saved on this phone, but the setup change could not go to your setup log: ${errorText(e)}`);}
  }
  setBusy(false);
 }
 const ordered=[...sessions].sort((a,b)=>b.n-a.n);
 const linked=ordered.find(x=>x.logId&&!isLocal(x.logId));
 return <>
  <View style={{gap:6}}>
   <View style={{flexDirection:'row',alignItems:'center',gap:8}}><MetalMark width={22}/><Eyebrow>PRACTICE DAY · {new Date().toLocaleDateString([],{weekday:'long',month:'short',day:'numeric'}).toUpperCase()}</Eyebrow></View>
   <Text style={{color:colors.text,fontSize:30,fontWeight:'900',fontStyle:'italic',letterSpacing:-1}}>{track||'Practice day'}</Text>
   <Text style={{color:colors.muted,fontSize:14}}>{bikeName}{bike.engine_hours!=null?` · ${bike.engine_hours} h`:''}{sessions.length?` · ${sessionsSummary(sessions)}`:''}</Text>
  </View>
  <NextUpCard race={race} labels={labels} onSet={onNext}/>
  <BikeNowCard bike={bike}/>
  <Card>
   <View style={{flexDirection:'row',alignItems:'center',gap:8}}><Icon name="bolt" size={16} color={colors.accent}/><Eyebrow>{COPY.ask.toUpperCase()}</Eyebrow></View>
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
    <Wrap>{(['better','no_change','worse','not_tested'] as SetupResult[]).map(r=><Chip key={r} label={SETUP_RESULT_LABELS[r]} on={draft.result===r} onPress={()=>set({result:r})}/>)}</Wrap>
    <Text style={{color:'#7d8593',fontSize:12.5}}>Goes into your setup log with this session.</Text>
   </>}
   <Notice text={notice}/>
   <Button disabled={busy} title={busy?COPY.saving:COPY.save} onPress={()=>void log()}/>
  </Card>
  <Card><Eyebrow>{COPY.sessions}{sessions.length?` · ${sessionsSummary(sessions).toUpperCase()}`:''}</Eyebrow>
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
