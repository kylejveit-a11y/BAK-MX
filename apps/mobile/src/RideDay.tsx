// Ride Day mode: a full-screen, glove-first view of the practice day. Big targets only, the screen kept awake while it is open,
// and a tap lock (on demand, and by itself after a minute untouched) that ignores every touch except a press-and-hold on the
// unlock button, so a bump, a knee or sweat presses nothing. Sessions and changes go through the practice day's own logger
// (phone first, setup log when there is signal); the track check-in uses the "How did it ride?" rules.
import React,{useEffect,useRef,useState} from 'react';
import {Modal,ScrollView,Text,TextInput,View} from 'react-native';
import {useKeepAwake} from 'expo-keep-awake';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {Bike} from '../../../shared/types';
import {CHANGES} from '../../../shared/race-day';
import {SETUP_RESULT_LABELS,type SetupResult} from '../../../shared/rider-types';
import {emptySession,nextSessionNumber,sessionChange,type PracticeSession,type SessionDraft} from '../../../shared/practice-day';
import {AUTO_LOCK_MS,RIDE_DAY_COPY as C,RIDE_MINUTES,UNLOCK_HOLD_MS,changePresets} from '../../../shared/ride-day';
import {Pressable} from './Touch';
import {GloveTile,HeaderTile} from './GloveTile';
import {RaisedFace,raisedLift} from './Raised';
import {Icon} from './Icon';
import {colors,tint} from './ui';
import {DISPLAY,LABEL} from './theme';
import {success,warn} from './haptics';
import {bikeSetup} from './HomeBlocks';
import {LiveStatusList,sendCheckin,useLiveConditions,useTrackId} from './LiveConditions';
import {CHECKIN_COPY,CHECKIN_STATUSES,toggleStatus} from '../../../shared/track-checkins';
import {SHARE_COPY} from '../../../shared/ride-share';
import {clock as shareClock,useRide} from './RideShare';
import {RideSafetyPanel} from './RideSafety';
import {readProgress,writeProgress} from './localProgress';

type View_='start'|'offer'|'home'|'rate'|'minutes'|'anyChange'|'what'|'how'|'setup'|'track'|'share';
const RESULTS:SetupResult[]=['better','worse','no_change'];
const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const elapsed=(t:number)=>Math.min(240,Math.max(1,Math.round((Date.now()-t)/60e3)));
const clock=()=>new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});

/** A glove-sized button: at least 88 pt tall (62 when short), in the app's raised finish; `primary` is the blue main action. */
function Big({label,sub,icon,onPress,on=false,wide=false,tone,short=false,primary=false}:{label:string;sub?:string;icon?:React.ComponentProps<typeof Icon>['name'];onPress:()=>void;on?:boolean;wide?:boolean;tone?:string;short?:boolean;primary?:boolean}){
 return <GloveTile label={label} sub={sub} icon={icon} onPress={onPress} on={on} primary={primary} tone={tone} half={!wide} stack={!wide} minHeight={short?62:wide?72:88}/>;
}
const Grid=({children}:{children:React.ReactNode})=><View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:12}}>{children}</View>;
const Title=({children}:{children:React.ReactNode})=><Text style={{color:colors.text,fontSize:22,...DISPLAY,letterSpacing:0,marginBottom:4}}>{children}</Text>;

/** Hold-to-unlock: a press-and-hold is the only touch the lock lets through. */
function LockScreen({onUnlock,track,next,setup}:{onUnlock:()=>void;track:string;next:string;setup:[string,string][]}){
 const insets=useSafeAreaInsets();const [t,setT]=useState(clock());
 useEffect(()=>{const i=setInterval(()=>setT(clock()),15000);return()=>clearInterval(i);},[]);
 return <View accessibilityViewIsModal style={{position:'absolute',left:0,right:0,top:0,bottom:0,backgroundColor:colors.bg,paddingTop:insets.top+24,paddingBottom:insets.bottom+28,paddingHorizontal:22,justifyContent:'space-between'}} onStartShouldSetResponder={()=>true}>
  <View style={{gap:6}}>
   <Text style={{color:colors.muted,fontSize:13,...LABEL}}>{C.locked.toUpperCase()}</Text>
   <Text style={{color:colors.text,fontSize:56,fontWeight:'800'}}>{t}</Text>
   <Text style={{color:colors.text,fontSize:20,...DISPLAY,letterSpacing:0}} numberOfLines={1}>{track||'Practice day'}</Text>
   <Text style={{color:colors.muted,fontSize:17}}>{next}</Text>
  </View>
  {!!setup.length&&<View style={{flexDirection:'row',flexWrap:'wrap',rowGap:14}}>{setup.map(([k,v])=><View key={k} style={{width:'50%',gap:2}}><Text style={{color:'#9aa2ae',fontSize:14}}>{k}</Text><Text style={{color:colors.text,fontSize:22,fontWeight:'700'}}>{v}</Text></View>)}</View>}
  <Pressable haptic={false} accessibilityRole="button" accessibilityLabel={C.holdToUnlock} accessibilityHint="Press and hold" delayLongPress={UNLOCK_HOLD_MS} onLongPress={()=>{success();onUnlock();}} onPress={()=>warn()}
   style={({pressed})=>[{alignSelf:'center',width:132,height:132,borderRadius:66,alignItems:'center',justifyContent:'center',gap:6},raisedLift,pressed&&{transform:[{scale:0.97}]}]}>
   {({pressed})=><><RaisedFace radius={66} pressed={pressed}/>{pressed&&<View pointerEvents="none" style={{position:'absolute',left:0,right:0,top:0,bottom:0,borderRadius:66,borderWidth:2,borderColor:colors.accent,backgroundColor:tint(0.16)}}/>}
   <Icon name="lock" size={34} color={colors.text}/>
   <Text style={{color:colors.text,fontSize:11,lineHeight:15,textAlign:'center',width:110,...LABEL}}>{C.holdToUnlock.toUpperCase()}</Text></>}
  </Pressable>
 </View>;
}

export function RideDayMode({visible,onClose,bike,track,sessions,onLog,onRate,onAsk}:{visible:boolean;onClose:()=>void;bike:Bike;track:string;sessions:PracticeSession[];onLog:(d:SessionDraft)=>Promise<string>;onRate:(id:string,r:SetupResult)=>void;onAsk:()=>void}){
 // Android's back button goes one step back like the Back button, does nothing while locked, and closes only from the start.
 const backRef=useRef<()=>boolean>(()=>false);
 if(!visible)return null;
 return <Modal visible animationType="fade" presentationStyle="fullScreen" onRequestClose={()=>{if(!backRef.current())onClose();}} supportedOrientations={['portrait']}>
  <RideDayInner backRef={backRef} onClose={onClose} bike={bike} track={track} sessions={sessions} onLog={onLog} onRate={onRate} onAsk={onAsk}/>
 </Modal>;
}

function RideDayInner({backRef,onClose,bike,track,sessions,onLog,onRate,onAsk}:{backRef:React.MutableRefObject<()=>boolean>;onClose:()=>void;bike:Bike;track:string;sessions:PracticeSession[];onLog:(d:SessionDraft)=>Promise<string>;onRate:(id:string,r:SetupResult)=>void;onAsk:()=>void}){
 useKeepAwake('bak-ride-day');
 const insets=useSafeAreaInsets();
 const [view,setViewRaw]=useState<View_>('start'),[trail,setTrail]=useState<View_[]>([]),[autoLock,setAutoLock]=useState(false),[draft,setDraft]=useState<SessionDraft>(emptySession),[typing,setTyping]=useState(false);
 const [locked,setLocked]=useState(false),[toast,setToast]=useState(''),[busy,setBusy]=useState(false);
 const [tags,setTags]=useState<string[]>([]);
 const touched=useRef(Date.now());
 const timerKey=`ride-timer:${bike.id}`;
 const [timer,setTimerState]=useState<number|null>(()=>{try{const t=readProgress<number|null>('device',timerKey,null);return t&&Date.now()-t<5*3600e3?t:null;}catch{return null;}});
 const setTimer=(t:number|null)=>{setTimerState(t);try{writeProgress('device',timerKey,t);}catch{}};
 const [,tick]=useState(0);useEffect(()=>{if(!timer)return;const i=setInterval(()=>tick(x=>x+1),30000);return()=>clearInterval(i);},[timer]);
 const ride=useRide();
 // Opening Ride Day is the moment a rider heads out: offer ride safety once a day, never while one is on.
 const afterStart=():View_=>{if(ride)return 'home';const d=new Date().toDateString();try{if(readProgress<string>('device','safety-rideday',''))if(readProgress<string>('device','safety-rideday','')===d)return 'home';writeProgress('device','safety-rideday',d);}catch{}return 'offer';};
 // Every step remembers where it came from, so Back goes one step back (a wrong tap never costs the whole entry).
 const setView=(next:View_)=>{setTrail(t=>next==='home'?[]:[...t,view]);setViewRaw(next);};
 const back=()=>{const prev=trail[trail.length-1];setTrail(t=>t.slice(0,-1));if(!prev||prev==='home'){home();return;}if(view==='how')setTyping(false);setViewRaw(prev);};
 backRef.current=()=>{if(locked)return true;if(view==='home'||view==='start')return false;back();return true;};
 const set=(p:Partial<SessionDraft>)=>setDraft(d=>({...d,...p}));
 const setup=bikeSetup(bike),n=nextSessionNumber(sessions),last=[...sessions].sort((a,b)=>b.n-a.n)[0];
 const trackId=useTrackId(track),{live,reload}=useLiveConditions(trackId);
 // With auto-lock on, locks itself after 3 minutes untouched; any touch on the screen resets the clock.
 useEffect(()=>{if(!autoLock)return;touched.current=Date.now();const i=setInterval(()=>{if(!locked&&Date.now()-touched.current>AUTO_LOCK_MS)setLocked(true);},5000);return()=>clearInterval(i);},[locked,autoLock]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),3500);return()=>clearTimeout(t);},[toast]);
 const home=()=>{setTrail([]);setViewRaw('home');setDraft(emptySession());setTyping(false);};
 async function save(d:SessionDraft){
  if(busy)return;setBusy(true);
  try{const msg=await onLog(d);setToast(msg===C.saved&&d.change?`Saved: ${d.change}, ${d.detail}`:msg===C.saved&&d.minutes?`Session saved: ${d.minutes} min`:msg);if(msg===C.saved||msg===C.savedQueued){if(timer&&d.minutes)setTimer(null);home();}}
  catch(e){setToast(errorText(e));}finally{setBusy(false);}
 }
 async function checkIn(){
  if(busy)return;setBusy(true);
  const r=await sendCheckin(trackId,tags);setToast(r.ok?C.saved:r.message);if(r.ok){setTags([]);reload();home();}
  setBusy(false);
 }
 // Coming off the track: the last change not yet rated is asked about first (one tap, or Skip).
 const unrated=[...sessions].sort((a,b)=>b.n-a.n).find(x=>x.change&&x.result==='not_tested');
 const [afterRate,setAfterRate]=useState<View_>('minutes');
 const comeIn=(next:View_)=>{if(unrated){setAfterRate(next);setView('rate');}else setView(next);};
 const changedToday=[...sessions].filter(x=>x.change).sort((a,b)=>a.n-b.n);
 const nextLine=timer?`On track ${elapsed(timer)} min`:`Session ${n} next${last?.change?` · last: ${sessionChange(last)}`:''}`;
 let body:React.ReactNode=null;
 if(view==='start')body=<><Title>{C.startTitle}</Title><Text style={{color:colors.muted,fontSize:16,lineHeight:23,marginBottom:8}}>{C.startDetail}</Text><Grid>
  <Big label={C.autoOn} icon="lock" wide onPress={()=>{setAutoLock(true);setView(afterStart());}}/>
  <Big label={C.autoOff} icon="unlock" wide onPress={()=>{setAutoLock(false);setView(afterStart());}}/>
 </Grid></>;
 if(view==='offer')body=<><Title>{SHARE_COPY.offer}</Title><Text style={{color:colors.muted,fontSize:16,lineHeight:23,marginBottom:8}}>{SHARE_COPY.offerSub}</Text><Grid>
  <Big label="Yes, set it up" icon="location" wide primary onPress={()=>setView('share')}/>
  <Big label="Not today" wide onPress={()=>setView('home')}/>
 </Grid></>;
 if(view==='home')body=<>
  <Grid>
   {timer?<Big label="Back in" sub={`On track ${elapsed(timer)} min`} icon="clock" on onPress={()=>{set({minutes:String(elapsed(timer))});comeIn('anyChange');}}/>
   :<Big label={C.offTrack} sub={C.offTrackSub} icon="clock" onPress={()=>comeIn('minutes')}/>}
   <Big label={C.change} sub={C.changeSub} icon="shock" onPress={()=>{set({minutes:''});setView('what');}}/>
   <Big label={C.setup} sub={C.setupSub} icon="gauge" onPress={()=>setView('setup')}/>
   <Big label={C.track} sub={C.trackSub} icon="flag" onPress={()=>setView('track')}/>
   <Big label={ride?SHARE_COPY.sharing:SHARE_COPY.start} sub={ride?`Back by ${shareClock(ride.back_by)}`:SHARE_COPY.startSub} icon="location" on={!!ride} onPress={()=>setView('share')}/>
   <Big label={C.ask} sub={C.askSub} icon="bolt" onPress={()=>{onClose();onAsk();}}/>
  </Grid>
 </>;
 if(view==='minutes')body=<><Title>{C.howLong}</Title><Grid>
  <Big label="Heading out? Start a timer" sub="Tap Back in when you come off" icon="clock" wide onPress={()=>{setTimer(Date.now());home();}}/>
  {RIDE_MINUTES.map(m=><Big key={m} label={`${m} min`} on={draft.minutes===String(m)} onPress={()=>{set({minutes:String(m)});setView('anyChange');}}/>)}
  <Big label={C.skipTime} wide onPress={()=>{set({minutes:''});setView('anyChange');}}/>
 </Grid></>;
 if(view==='anyChange')body=<><Title>{C.anyChange}</Title><Grid>
  <Big label={C.noChange} icon="check" wide onPress={()=>void save({...draft,change:'',detail:''})}/>
  <Big label="Yes, log a change" icon="shock" wide onPress={()=>setView('what')}/>
 </Grid></>;
 if(view==='what')body=<><Title>{C.what}</Title><Grid>
  {CHANGES.map(c=><Big key={c} label={c} on={draft.change===c} onPress={()=>{set({change:c,detail:''});setTyping(!changePresets(c).length);setView('how');}}/>)}
 </Grid></>;
 if(view==='how'){const presets=changePresets(draft.change);body=<><Title>{draft.change}: {C.how.toLowerCase()}</Title>
  {!typing&&<Grid>
   {presets.map(p=><Big key={p} label={p} on={draft.detail===p} onPress={()=>void save({...draft,detail:p,result:'not_tested'})}/>)}
   <Big label={C.typeIt} icon="compose" wide onPress={()=>setTyping(true)}/>
  </Grid>}
  {typing&&<View style={{gap:12}}>
   <TextInput autoFocus value={draft.detail} onChangeText={v=>set({detail:v})} maxLength={200} placeholder="e.g. 2 clicks softer, or 13 psi" placeholderTextColor="#7d8593" accessibilityLabel="Detail of the change" returnKeyType="done" onSubmitEditing={()=>void save({...draft,result:'not_tested'})}
    style={{color:colors.text,fontSize:22,borderBottomWidth:1.5,borderBottomColor:colors.accent,paddingVertical:12}}/>
   <Big label={busy?'Saving…':'Save change'} icon="check" wide primary onPress={()=>void save({...draft,result:'not_tested'})}/>
  </View>}
 </>;}
 if(view==='rate'&&unrated)body=<><Title>{C.didItHelp}</Title><Text style={{color:colors.muted,fontSize:16,marginBottom:8}}>{sessionChange(unrated)}</Text><Grid>
  {RESULTS.map(r=><Big key={r} label={SETUP_RESULT_LABELS[r]} tone={r==='better'?'#7fd09a':r==='worse'?'#ef9aa1':undefined} wide={r==='no_change'} onPress={()=>{onRate(unrated.id,r);setView(afterRate);}}/>)}
  <Big label="Skip" wide onPress={()=>setView(afterRate)}/>
 </Grid></>;
 if(view==='share')body=<><Title>{SHARE_COPY.title}</Title><RideSafetyPanel track={track}/></>;
 if(view==='setup')body=<><Title>{C.setup}</Title>
  {setup.length?<View style={{flexDirection:'row',flexWrap:'wrap',rowGap:18}}>{setup.map(([k,v])=><View key={k} style={{width:'50%',gap:2}}><Text style={{color:'#9aa2ae',fontSize:15}}>{k}</Text><Text style={{color:colors.text,fontSize:26,fontWeight:'800'}}>{v}</Text></View>)}</View>
  :<Text style={{color:colors.muted,fontSize:17,lineHeight:24}}>{C.noSetup}</Text>}
  {changedToday.length>0&&<View style={{marginTop:18,gap:6}}>
   <Text style={{color:'#adb5c1',fontSize:13,...LABEL}}>CHANGED TODAY</Text>
   {changedToday.map(x=><Text key={x.id} style={{color:colors.text,fontSize:17,lineHeight:23}}>{sessionChange(x)}{x.result!=='not_tested'?<Text style={{color:x.result==='better'?'#7fd09a':x.result==='worse'?'#ef9aa1':colors.muted}}>{'  ·  '+SETUP_RESULT_LABELS[x.result]}</Text>:null}</Text>)}
   <Text style={{color:'#8b93a0',fontSize:13,marginTop:2}}>The numbers above are from your Garage. Update them there once you keep a change.</Text>
  </View>}
 </>;
 if(view==='track')body=<><Title>{C.track}</Title>
  {!trackId?<Text style={{color:colors.muted,fontSize:17,lineHeight:24}}>{C.noTrack}</Text>:<View style={{gap:16}}>
   <LiveStatusList live={live} big/>
   <Text style={{color:'#adb5c1',fontSize:13,...LABEL}}>TAP WHAT IT’S LIKE NOW</Text>
   <Grid>{CHECKIN_STATUSES.map(t=><Big key={t.id} short label={t.label} on={tags.includes(t.id)} onPress={()=>setTags(x=>toggleStatus(x,t.id))}/>)}</Grid>
   <Big label={busy?'Sending…':C.checkIn} icon="check" wide primary onPress={()=>void checkIn()}/>
  </View>}
 </>;
 return <View style={{flex:1,backgroundColor:colors.bg}} onTouchStart={()=>{touched.current=Date.now();}}>
  <View style={{paddingTop:insets.top+10,paddingHorizontal:16,paddingBottom:12,flexDirection:'row',alignItems:'center',gap:10,borderBottomWidth:1,borderBottomColor:'#1d2129'}}>
   <View style={{flex:1,gap:2}}>
    <Text style={{color:colors.text,fontSize:18,...DISPLAY,letterSpacing:0}} numberOfLines={1}>{track||'Practice day'}</Text>
    <Text style={{color:colors.muted,fontSize:14}} numberOfLines={1}>{clock()} · {nextLine}{autoLock?` · ${C.autoBadge}`:''}</Text>
   </View>
   <HeaderTile label={C.lock} icon="lock" onPress={()=>setLocked(true)}/>
   {view==='home'||view==='start'?<HeaderTile wide label={C.done} onPress={onClose}/>:<HeaderTile wide label={C.back} icon="chevronLeft" onPress={back}/>}
  </View>
  <ScrollView contentContainerStyle={{padding:16,paddingBottom:insets.bottom+40,gap:12}} keyboardShouldPersistTaps="handled">{body}</ScrollView>
  {!!toast&&<View pointerEvents="none" accessibilityLiveRegion="polite" style={[{position:'absolute',left:16,right:16,bottom:insets.bottom+20,padding:16,borderRadius:16},raisedLift]}><RaisedFace radius={16}/><View pointerEvents="none" style={{position:'absolute',left:0,right:0,top:0,bottom:0,borderRadius:16,borderWidth:1,borderColor:colors.accent}}/><Text style={{color:colors.text,fontSize:17,fontWeight:'700',textAlign:'center'}}>{toast}</Text></View>}
  {locked&&<LockScreen onUnlock={()=>{touched.current=Date.now();setLocked(false);}} track={track} next={ride?`${nextLine} · back by ${shareClock(ride.back_by)}`:nextLine} setup={setup}/>}
 </View>;
}
