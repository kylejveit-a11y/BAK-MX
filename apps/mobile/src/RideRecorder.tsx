// Ride tracking and lap timing on the practice-day and race-day screens. One raised card: Start recording, then a live
// clock with the lap count and last lap, then Stop and save. "All rides" opens the list; a ride opens to its route, its
// numbers and every lap. Free on every plan. The honest limits are said on the card: lap times from a phone are good to
// about a second, and recording uses battery.
import React,{useCallback,useEffect,useMemo,useState} from 'react';
import {Alert,ScrollView,Text,View} from 'react-native';
import Svg,{Circle,Polyline} from 'react-native-svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {Bike} from '../../../shared/types';
import {lapText,miles,mph,rideHours,type RideSummary} from '../../../shared/ride-track';
import {api} from './api';
import {PageSheet} from './PageSheet';
import {Raised} from './Raised';
import {Pressable} from './Touch';
import {BackLink,Button,Copy,Eyebrow,LinkAction,Notice,colors} from './ui';
import {DISPLAY,LABEL} from './theme';
import {success} from './haptics';
import {useTrackId} from './LiveConditions';
import {discardRecording,liveSummary,onRecorderChange,readRecording,sendWaitingRides,startRecording,stopRecording,waitingRides,type SavedRide} from './rideRecorder';

let hoursChanged:(()=>void)|null=null;
/** The app shell registers how to re-read the Garage after a ride's hours are added to the bike. */
export const setRideHoursListener=(f:(()=>void)|null)=>{hoursChanged=f;};

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const clock=(seconds:number)=>{const s=Math.max(0,Math.round(seconds)),h=Math.floor(s/3600),m=Math.floor(s%3600/60),r=s%60;return h?`${h}:${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`:`${m}:${String(r).padStart(2,'0')}`;};
const dist=(m:number)=>{const mi=miles(m);return mi<10?mi.toFixed(1):Math.round(mi).toString();};
const day=(iso:string)=>new Date(iso).toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'});
const headline=(r:Pick<SavedRide,'kind'|'laps'|'best_ms'|'distance_m'|'moving_seconds'>)=>r.kind==='track'?`${r.laps.length} lap${r.laps.length===1?'':'s'} · best ${lapText(r.best_ms)}`:`${dist(r.distance_m)} mi · ${clock(r.moving_seconds)} riding`;

function Stat({label,value}:{label:string;value:string}){return <View style={{flexGrow:1,flexBasis:'30%',gap:3}}><Text style={{color:colors.muted,fontSize:12,...LABEL,letterSpacing:1}}>{label.toUpperCase()}</Text><Text style={{color:colors.text,fontSize:20,...DISPLAY}}>{value}</Text></View>;}

/** The route as a clean line on the card: no map tiles, so it draws with no signal. Start is the bright dot. */
function RouteLine({route,height=190}:{route:{lat:number;lng:number}[];height?:number}){
 const [w,setW]=useState(0);
 const pts=useMemo(()=>{if(route.length<2||!w)return null;
  const lat0=route.reduce((a,p)=>a+p.lat,0)/route.length,k=Math.cos(lat0*Math.PI/180),xs=route.map(p=>p.lng*k),ys=route.map(p=>p.lat);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),pad=14,span=Math.max(maxX-minX,(maxY-minY)*(w-2*pad)/(height-2*pad),1e-7);
  const sc=(w-2*pad)/span,ox=pad+((w-2*pad)-(maxX-minX)*sc)/2,oy=pad+((height-2*pad)-(maxY-minY)*sc)/2;
  return route.map((_,i)=>({x:ox+(xs[i]-minX)*sc,y:oy+(maxY-ys[i])*sc}));},[route,w,height]);
 return <View onLayout={e=>setW(e.nativeEvent.layout.width)} style={{height,borderRadius:14,backgroundColor:'#0a0c10',overflow:'hidden'}} accessibilityLabel="The route of this ride">
  {pts&&<Svg width={w} height={height}><Polyline points={pts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} fill="none" stroke={colors.accent} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"/><Circle cx={pts[0].x} cy={pts[0].y} r={5} fill="#f6f7f9"/></Svg>}
 </View>;
}

function RideDetail({ride,bike,onBack,onDeleted}:{ride:SavedRide;bike:Bike|undefined;onBack:()=>void;onDeleted:()=>void}){
 const [full,setFull]=useState<SavedRide>(ride),[notice,setNotice]=useState(''),[added,setAdded]=useState(false),[busy,setBusy]=useState(false);
 useEffect(()=>{if(ride.pending)return;let live=true;api<SavedRide>('/api/rides/'+ride.id).then(r=>{if(live)setFull(r);}).catch(e=>{if(live)setNotice(errorText(e));});return()=>{live=false;};},[ride.id,ride.pending]);
 const hours=rideHours(full.moving_seconds),mine=bike&&full.bike_id===bike.id?bike:undefined;
 async function addHours(){if(!mine||busy)return;setBusy(true);
  try{await api<Bike>(`/api/bikes?id=${mine.id}`,'PATCH',{manufacturer:mine.manufacturer,model:mine.model,model_year:mine.model_year,variant:mine.variant,region:mine.region,nickname:mine.nickname??'',engine_hours:Math.round(((mine.engine_hours??0)+hours)*10)/10,configuration:mine.configuration});setAdded(true);success();hoursChanged?.();}
  catch(e){setNotice(errorText(e));}finally{setBusy(false);}}
 const good=full.laps.filter(l=>!l.slow);
 return <ScrollView contentContainerStyle={{padding:20,paddingBottom:48,gap:18}}>
  <BackLink title="All rides" onPress={onBack}/>
  <View style={{gap:4}}><Eyebrow>{day(full.started_at)}</Eyebrow><Text style={{color:colors.text,fontSize:24,...DISPLAY}}>{full.place||(full.kind==='track'?'Track session':'Trail ride')}</Text><Text style={{color:colors.muted,fontSize:14}}>{headline(full)}</Text></View>
  {full.pending&&<Notice text="Saved on this phone. It will send when you have signal."/>}
  {!!full.route?.length&&<RouteLine route={full.route}/>}
  <Raised style={{padding:18}}><View style={{flexDirection:'row',flexWrap:'wrap',rowGap:16,columnGap:12}}>
   {full.kind==='track'&&<><Stat label="Best lap" value={lapText(full.best_ms)}/><Stat label="Average" value={lapText(full.average_ms)}/><Stat label="Laps" value={String(full.laps.length)}/></>}
   <Stat label="Riding time" value={clock(full.moving_seconds)}/><Stat label="Distance" value={dist(full.distance_m)+' mi'}/><Stat label="Top speed" value={Math.round(mph(full.top_speed_ms))+' mph'}/>
  </View></Raised>
  {full.kind==='track'&&full.laps.length>0&&<Raised style={{paddingVertical:8}}>
   {full.laps.map((l,i)=>{const best=!l.slow&&l.ms===full.best_ms;return <View key={l.n} style={{flexDirection:'row',alignItems:'center',paddingHorizontal:18,paddingVertical:11,borderTopWidth:i?1:0,borderTopColor:'rgba(255,255,255,0.06)'}}>
    <Text style={{color:colors.muted,fontSize:15,width:64}}>Lap {l.n}</Text>
    <Text style={{color:l.slow?colors.muted:colors.text,fontSize:17,...DISPLAY,flex:1}}>{lapText(l.ms)}</Text>
    <Text style={{color:best?colors.accent:colors.muted,fontSize:13}}>{best?'Best':l.slow?'Stop or slow lap':good.length>1&&full.best_ms?`+${((l.ms-full.best_ms)/1000).toFixed(1)}`:''}</Text>
   </View>;})}
  </Raised>}
  {full.kind==='track'&&<Copy>Lap times from a phone are good to about a second. Slow laps (a stop, a crash, a trip through the pits) are left out of best and average.</Copy>}
  {!!mine&&hours>0&&!full.pending&&(added?<Notice text={`Added ${hours} h to ${mine.nickname?.trim()||mine.model}.`}/>:<Button secondary disabled={busy} title={`Add ${hours} h to the bike’s hours`} onPress={()=>void addHours()}/>)}
  {!!notice&&<Notice text={notice} tone="warn"/>}
  {!full.pending&&<LinkAction muted arrow={false} title="Delete this ride" onPress={()=>Alert.alert('Delete this ride?','Its laps and route will be permanently removed.',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>void api('/api/rides/'+full.id,'DELETE').then(onDeleted).catch(e=>setNotice(errorText(e)))}])}/>}
 </ScrollView>;
}

function RidesSheet({visible,onClose,bike,first}:{visible:boolean;onClose:()=>void;bike:Bike|undefined;first:SavedRide|null}){
 const insets=useSafeAreaInsets();
 const [rides,setRides]=useState<SavedRide[]|null>(null),[open,setOpen]=useState<SavedRide|null>(null),[notice,setNotice]=useState('');
 const load=useCallback(()=>{api<SavedRide[]>('/api/rides').then(r=>{setRides(r);setNotice('');}).catch(e=>{setRides(old=>old??[]);setNotice(errorText(e));});},[]);
 useEffect(()=>{if(!visible)return;setOpen(first);void sendWaitingRides().finally(load);},[visible,first,load]);
 const all=useMemo(()=>[...waitingRides(),...(rides??[])],[rides]);
 return <PageSheet visible={visible} animationType="slide" onRequestClose={()=>open?setOpen(null):onClose()}>
  <View style={{flex:1,backgroundColor:colors.bg,paddingBottom:insets.bottom}}>
   {open?<RideDetail ride={open} bike={bike} onBack={()=>setOpen(null)} onDeleted={()=>{setOpen(null);load();}}/>:
   <ScrollView contentContainerStyle={{padding:20,paddingBottom:48,gap:16}}>
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}><Text style={{color:colors.text,fontSize:24,...DISPLAY}}>Rides</Text><LinkAction arrow={false} title="Done" onPress={onClose}/></View>
    {!!notice&&<Notice text={notice} tone="warn"/>}
    {rides===null&&!all.length?<Copy>Loading your rides…</Copy>:!all.length?<Copy>No rides yet. Start recording on a practice day or race day and your laps and route show up here.</Copy>:
     <Raised style={{paddingVertical:6}}>{all.map((r,i)=><Pressable key={r.id} accessibilityRole="button" accessibilityLabel={`${day(r.started_at)}, ${r.place||'ride'}, ${headline(r)}`} onPress={()=>setOpen(r)} style={({pressed})=>({paddingHorizontal:18,paddingVertical:14,borderTopWidth:i?1:0,borderTopColor:'rgba(255,255,255,0.06)',opacity:pressed?0.7:1,gap:3})}>
      <Text style={{color:colors.text,fontSize:16,...DISPLAY}}>{r.place||(r.kind==='track'?'Track session':'Trail ride')}</Text>
      <Text style={{color:colors.muted,fontSize:13.5}}>{day(r.started_at)} · {headline(r)}{r.pending?' · waiting for signal':''}</Text>
     </Pressable>)}</Raised>}
   </ScrollView>}
  </View>
 </PageSheet>;
}

/** The card. `track` is the day's place name; when it is one of BAK's listed tracks the ride is filed under it. */
export function RideRecorderCard({bike,track}:{bike:Bike;track:string}){
 const trackId=useTrackId(track);
 const [rec,setRec]=useState(readRecording),[now,setNow]=useState(Date.now()),[live,setLive]=useState<RideSummary|null>(null),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[sheet,setSheet]=useState(false),[last,setLast]=useState<SavedRide|null>(null);
 useEffect(()=>onRecorderChange(()=>setRec(readRecording())),[]);
 useEffect(()=>{void sendWaitingRides();},[]);
 // the clock ticks every second; laps are re-read every five (reading the file each second would waste battery)
 useEffect(()=>{if(!rec)return;setNow(Date.now());setLive(liveSummary());const a=setInterval(()=>setNow(Date.now()),1000),b=setInterval(()=>setLive(liveSummary()),5000);return()=>{clearInterval(a);clearInterval(b);};},[rec?.started]);
 async function start(){if(busy)return;setBusy(true);setNotice('');setLast(null);const problem=await startRecording({bike_id:bike.id,track_id:trackId||null,place:track});if(problem)setNotice(problem);else success();setBusy(false);}
 async function stop(){if(busy)return;setBusy(true);setNotice('');const r=await stopRecording();setLive(null);if('problem' in r)setNotice(r.problem);else{setLast(r.ride);success();}setBusy(false);}
 const laps=live?.laps??[],lastLap=laps[laps.length-1];
 return <>
  <Raised tint={rec?'blue':undefined} style={{padding:18,gap:14}}>
   {rec?<>
    <View style={{flexDirection:'row',alignItems:'center',gap:8}}><View style={{width:9,height:9,borderRadius:5,backgroundColor:'#ff5a4f'}}/><Text style={{color:colors.text,fontSize:13,...LABEL,letterSpacing:1.5}}>RECORDING</Text></View>
    <Text style={{color:colors.text,fontSize:44,...DISPLAY,fontVariant:['tabular-nums']}} accessibilityLabel={`Recording for ${clock((now-rec.started)/1000)}`}>{clock((now-rec.started)/1000)}</Text>
    <Text style={{color:colors.muted,fontSize:15,lineHeight:21}}>{laps.length>=1&&lastLap?`Lap ${laps.length+1} · last ${lapText(lastLap.ms)} · best ${lapText(live?.best_ms)}`:live&&live.distance_m>50?`${dist(live.distance_m)} mi · top ${Math.round(mph(live.top_speed_ms))} mph`:'Put the phone in a zipped pocket and ride. Laps count themselves.'}</Text>
    <Button disabled={busy} title={busy?'Saving…':'Stop and save'} onPress={()=>void stop()}/>
    <LinkAction muted arrow={false} title="Discard this ride" onPress={()=>Alert.alert('Discard this ride?','Nothing from it will be saved.',[{text:'Keep recording',style:'cancel'},{text:'Discard',style:'destructive',onPress:()=>void discardRecording()}])}/>
   </>:<>
    <View style={{gap:4}}><Text style={{color:colors.text,fontSize:17,...LABEL}}>RECORD THIS RIDE</Text><Text style={{color:colors.muted,fontSize:14,lineHeight:20}}>Lap times at the track, distance and route on the trail. Works with the screen off.</Text></View>
    {last&&<Pressable accessibilityRole="button" onPress={()=>setSheet(true)} style={{gap:2}}><Text style={{color:colors.accent,fontSize:15,...DISPLAY}}>{last.pending?'Saved on this phone':'Saved'} · {headline(last)}</Text><Text style={{color:colors.muted,fontSize:13}}>Tap to see every lap and the route.</Text></Pressable>}
    <Button disabled={busy} title={busy?'Starting…':'Start recording'} onPress={()=>void start()}/>
    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><Text style={{color:colors.muted,fontSize:12.5,flex:1,paddingRight:12}}>Good to about a second a lap. Uses more battery while it records.</Text><LinkAction title="All rides" onPress={()=>{setLast(null);setSheet(true);}}/></View>
   </>}
   {!!notice&&<Notice text={notice} tone="warn"/>}
  </Raised>
  <RidesSheet visible={sheet} onClose={()=>setSheet(false)} bike={bike} first={last}/>
 </>;
}
