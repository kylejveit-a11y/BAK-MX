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
import {Icon} from './Icon';
import {colors,tint} from './ui';
import {DISPLAY,LABEL} from './theme';
import {success,warn} from './haptics';
import {bikeSetup} from './HomeBlocks';
import {LiveStatusList,sendCheckin,useLiveConditions,useTrackId} from './LiveConditions';
import {CHECKIN_COPY,CHECKIN_STATUSES,toggleStatus} from '../../../shared/track-checkins';
import {SHARE_COPY} from '../../../shared/ride-share';
import {SHARE_CHOICES,ShareStatusLine,alwaysHint,shareUntil,useRideShare} from './RideShare';
import {readProgress,writeProgress} from './localProgress';

type View_='start'|'home'|'rate'|'minutes'|'anyChange'|'what'|'how'|'setup'|'track'|'share';
const RESULTS:SetupResult[]=['better','worse','no_change'];
const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const elapsed=(t:number)=>Math.min(240,Math.max(1,Math.round((Date.now()-t)/60e3)));
const clock=()=>new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});

/** A glove-sized button: at least 88 pt tall, label in the wide font. */
function Big({label,sub,icon,onPress,on=false,wide=false,tone,short=false}:{label:string;sub?:string;icon?:React.ComponentProps<typeof Icon>['name'];onPress:()=>void;on?:boolean;wide?:boolean;tone?:string;short?:boolean}){
 return <Pressable haptic="press" accessibilityRole="button" accessibilityLabel={sub?`${label}, ${sub}`:label} accessibilityState={{selected:on}} onPress={onPress}
  style={({pressed})=>({width:wide?'100%':'48.5%',minHeight:short?62:88,borderRadius:18,borderWidth:1.5,borderColor:on?colors.accent:'#2c323c',backgroundColor:on?tint(0.22):pressed?'#1a1e25':'#111419',paddingHorizontal:14,paddingVertical:12,justifyContent:'center',gap:4})}>
  {/* Half-width tiles stack icon, label and hint so long labels never squeeze; full-width rows keep them on one line. */}
  <View style={{flexDirection:wide?'row':'column',alignItems:wide?'center':'flex-start',gap:wide?12:8}}>
   {icon&&<Icon name={icon} size={wide?24:26} color={tone??colors.accent}/>}
   <Text style={{color:tone??colors.text,fontSize:wide?17:15.5,lineHeight:wide?22:20,...LABEL,flexShrink:1}} numberOfLines={2}>{label}</Text>
  </View>
  {!!sub&&<Text style={{color:colors.muted,fontSize:13.5,lineHeight:18}} numberOfLines={2}>{sub}</Text>}
 </Pressable>;
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
   style={({pressed})=>({alignSelf:'center',width:132,height:132,borderRadius:66,borderWidth:2,borderColor:pressed?colors.accent:'#3a414d',backgroundColor:pressed?tint(0.25):'#101318',alignItems:'center',justifyContent:'center',gap:6})}>
   <Icon name="lock" size={34} color={colors.text}/>
   <Text style={{color:colors.text,fontSize:11,lineHeight:15,textAlign:'center',width:110,...LABEL}}>{C.holdToUnlock.toUpperCase()}</Text>
  </Pressable>
 </View>;
}

export function RideDayMode({visible,onClose,bike,track,sessions,onLog,onRate,onAsk}:{visible:boolean;onClose:()=>void;bike:Bike;track:string;sessions:PracticeSession[];onLog:(d:SessionDraft)=>Promise<string>;onRate:(id:string,r:SetupResult)=>void;onAsk:()=>void}){
 if(!visible)return null;
 return <Modal visible animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose} supportedOrientations={['portrait']}>
  <RideDayInner onClose={onClose} bike={bike} track={track} sessions={sessions} onLog={onLog} onRate={onRate} onAsk={onAsk}/>
 </Modal>;
}

function RideDayInner({onClose,bike,track,sessions,onLog,onRate,onAsk}:{onClose:()=>void;bike:Bike;track:string;sessions:PracticeSession[];onLog:(d:SessionDraft)=>Promise<string>;onRate:(id:string,r:SetupResult)=>void;onAsk:()=>void}){
 useKeepAwake('bak-ride-day');
 const insets=useSafeAreaInsets();
 const [view,setView]=useState<View_>('start'),[autoLock,setAutoLock]=useState(false),[draft,setDraft]=useState<SessionDraft>(emptySession),[typing,setTyping]=useState(false);
 const [locked,setLocked]=useState(false),[toast,setToast]=useState(''),[busy,setBusy]=useState(false);
 const [tags,setTags]=useState<string[]>([]);
 const touched=useRef(Date.now());
 const timerKey=`ride-timer:${bike.id}`;
 const [timer,setTimerState]=useState<number|null>(()=>{try{const t=readProgress<number|null>('device',timerKey,null);return t&&Date.now()-t<5*3600e3?t:null;}catch{return null;}});
 const setTimer=(t:number|null)=>{setTimerState(t);try{writeProgress('device',timerKey,t);}catch{}};
 const [,tick]=useState(0);useEffect(()=>{if(!timer)return;const i=setInterval(()=>tick(x=>x+1),30000);return()=>clearInterval(i);},[timer]);
 const share=useRideShare();const [shareName,setShareName]=useState(()=>{try{return readProgress<string>('device','share-name','');}catch{return '';}});
 const set=(p:Partial<SessionDraft>)=>setDraft(d=>({...d,...p}));
 const setup=bikeSetup(bike),n=nextSessionNumber(sessions),last=[...sessions].sort((a,b)=>b.n-a.n)[0];
 const trackId=useTrackId(track),{live,reload}=useLiveConditions(trackId);
 // With auto-lock on, locks itself after 3 minutes untouched; any touch on the screen resets the clock.
 useEffect(()=>{if(!autoLock)return;touched.current=Date.now();const i=setInterval(()=>{if(!locked&&Date.now()-touched.current>AUTO_LOCK_MS)setLocked(true);},5000);return()=>clearInterval(i);},[locked,autoLock]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),3500);return()=>clearTimeout(t);},[toast]);
 const home=()=>{setView('home');setDraft(emptySession());setTyping(false);};
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
  <Big label={C.autoOn} icon="lock" wide onPress={()=>{setAutoLock(true);setView('home');}}/>
  <Big label={C.autoOff} icon="unlock" wide onPress={()=>{setAutoLock(false);setView('home');}}/>
 </Grid></>;
 if(view==='home')body=<>
  <Grid>
   {timer?<Big label="Back in" sub={`On track ${elapsed(timer)} min`} icon="clock" on onPress={()=>{set({minutes:String(elapsed(timer))});comeIn('anyChange');}}/>
   :<Big label={C.offTrack} sub={C.offTrackSub} icon="clock" onPress={()=>comeIn('minutes')}/>}
   <Big label={C.change} sub={C.changeSub} icon="shock" onPress={()=>{set({minutes:''});setView('what');}}/>
   <Big label={C.setup} sub={C.setupSub} icon="gauge" onPress={()=>setView('setup')}/>
   <Big label={C.track} sub={C.trackSub} icon="flag" onPress={()=>setView('track')}/>
   <Big label={share.active?SHARE_COPY.sharing:SHARE_COPY.start} sub={share.active?`Until ${shareUntil(share.active)}`:SHARE_COPY.startSub} icon="location" on={!!share.active} onPress={()=>setView('share')}/>
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
   <Big label={busy?'Saving…':'Save change'} icon="check" wide on onPress={()=>void save({...draft,result:'not_tested'})}/>
  </View>}
 </>;}
 if(view==='rate'&&unrated)body=<><Title>{C.didItHelp}</Title><Text style={{color:colors.muted,fontSize:16,marginBottom:8}}>{sessionChange(unrated)}</Text><Grid>
  {RESULTS.map(r=><Big key={r} label={SETUP_RESULT_LABELS[r]} tone={r==='better'?'#7fd09a':r==='worse'?'#ef9aa1':undefined} wide={r==='no_change'} onPress={()=>{onRate(unrated.id,r);setView(afterRate);}}/>)}
  <Big label="Skip" wide onPress={()=>setView(afterRate)}/>
 </Grid></>;
 if(view==='share')body=<><Title>{share.active?SHARE_COPY.sharing:SHARE_COPY.start}</Title>
  {share.active?<View style={{gap:12}}>
   <ShareStatusLine until={shareUntil(share.active)}/>
   <Grid>
    <Big label={SHARE_COPY.send} icon="share" wide onPress={()=>void share.send()}/>
    <Big label={share.stopping?'Stopping…':SHARE_COPY.stop} icon="close" wide tone="#ef9aa1" onPress={()=>void share.stop()}/>
   </Grid>
  </View>:<View style={{gap:12}}>
   <Text style={{color:colors.muted,fontSize:16,lineHeight:23}}>{SHARE_COPY.explain}</Text>
   <TextInput value={shareName} onChangeText={setShareName} maxLength={40} placeholder="First name on the link (optional)" placeholderTextColor="#7d8593" accessibilityLabel="Your first name, shown on the link" autoCapitalize="words"
    style={{color:colors.text,fontSize:19,borderBottomWidth:1.5,borderBottomColor:'#3a414d',paddingVertical:10}}/>
   <Text style={{color:'#adb5c1',fontSize:13,...LABEL}}>{SHARE_COPY.how.toUpperCase()}</Text>
   <Grid>{SHARE_CHOICES.map(c=><Big key={c.hours} label={c.label} onPress={()=>{try{writeProgress('device','share-name',shareName.trim());}catch{}void share.start(c.hours,shareName.trim());}}/>)}</Grid>
   <Text style={{color:'#8b93a0',fontSize:14,lineHeight:20}}>{alwaysHint}</Text>
  </View>}
  {!!share.notice&&<Text style={{color:colors.text,fontSize:16,marginTop:8}}>{share.notice}</Text>}
 </>;
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
   <Big label={busy?'Sending…':C.checkIn} icon="check" wide on onPress={()=>void checkIn()}/>
  </View>}
 </>;
 return <View style={{flex:1,backgroundColor:colors.bg}} onTouchStart={()=>{touched.current=Date.now();}}>
  <View style={{paddingTop:insets.top+10,paddingHorizontal:16,paddingBottom:12,flexDirection:'row',alignItems:'center',gap:10,borderBottomWidth:1,borderBottomColor:'#1d2129'}}>
   <View style={{flex:1,gap:2}}>
    <Text style={{color:colors.text,fontSize:18,...DISPLAY,letterSpacing:0}} numberOfLines={1}>{track||'Practice day'}</Text>
    <Text style={{color:colors.muted,fontSize:14}} numberOfLines={1}>{clock()} · {nextLine}{autoLock?` · ${C.autoBadge}`:''}</Text>
   </View>
   <Pressable haptic="press" accessibilityRole="button" accessibilityLabel={C.lock} onPress={()=>setLocked(true)} style={({pressed})=>({width:64,height:56,borderRadius:16,borderWidth:1.5,borderColor:'#2c323c',alignItems:'center',justifyContent:'center',backgroundColor:pressed?'#1a1e25':'#111419'})}><Icon name="lock" size={26}/></Pressable>
   <Pressable haptic="tap" accessibilityRole="button" accessibilityLabel={view==='home'||view==='start'?C.done:C.back} onPress={view==='home'||view==='start'?onClose:home} style={({pressed})=>({minWidth:72,height:56,paddingHorizontal:12,borderRadius:16,borderWidth:1.5,borderColor:'#2c323c',alignItems:'center',justifyContent:'center',backgroundColor:pressed?'#1a1e25':'#111419'})}><Text style={{color:colors.text,fontSize:14,...LABEL}}>{(view==='home'||view==='start'?C.done:C.back).toUpperCase()}</Text></Pressable>
  </View>
  <ScrollView contentContainerStyle={{padding:16,paddingBottom:insets.bottom+40,gap:12}} keyboardShouldPersistTaps="handled">{body}</ScrollView>
  {!!toast&&<View pointerEvents="none" accessibilityLiveRegion="polite" style={{position:'absolute',left:16,right:16,bottom:insets.bottom+20,padding:16,borderRadius:16,backgroundColor:'#16202c',borderWidth:1,borderColor:colors.accent}}><Text style={{color:colors.text,fontSize:17,fontWeight:'700',textAlign:'center'}}>{toast}</Text></View>}
  {locked&&<LockScreen onUnlock={()=>{touched.current=Date.now();setLocked(false);}} track={track} next={share.active?`${nextLine} · sharing location until ${shareUntil(share.active)}`:nextLine} setup={setup}/>}
 </View>;
}
