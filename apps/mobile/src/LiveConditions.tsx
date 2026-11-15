// "Right now" at a track: what riders checked in over the last few hours (how many, how long ago, never who) and a one-tap
// check-in. Lives on the practice-day and race-day screens, under the track name, and in Ride Day mode with bigger buttons.
// Check-ins send only with signal: they are about right now, so one that arrived hours later would mislead.
import React,{useCallback,useEffect,useState} from 'react';
import {Text,View} from 'react-native';
import {knownTrack} from '../../../shared/race-day';
import {CHECKIN_COPY as C,CHECKIN_STATUSES,agedConditions,liveStatusLine,statusProblem,toggleStatus,type LiveConditions} from '../../../shared/track-checkins';
import {api} from './api';
import {isNetworkError} from './offline';
import {Pressable} from './Touch';
import {Card,Eyebrow,Icon,Notice,colors,tint} from './ui';
import {success} from './haptics';
import {useTrackDirectory} from './TrackReport';

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
/** The listed track id for a day's track name, or '' when it isn't one of BAK's tracks. */
export function useTrackId(track:string):string{const dir=useTrackDirectory();return (knownTrack(dir,track) as {id?:string}|undefined)?.id??'';}

/** Live conditions for a track, re-read every two minutes while shown. */
export function useLiveConditions(trackId:string){
 const [live,setLive]=useState<LiveConditions|null>(null);
 const load=useCallback(()=>{if(!trackId){setLive(null);return;}api<LiveConditions|null>('/api/track-checkins?track_id='+encodeURIComponent(trackId)).then(r=>setLive(agedConditions(r,new Date()))).catch(()=>{});},[trackId]);
 useEffect(()=>{load();const i=setInterval(load,120000);return()=>clearInterval(i);},[load]);
 return {live,reload:load};
}

/** Send a check-in; returns what to tell the rider. */
export async function sendCheckin(trackId:string,statuses:string[]):Promise<{ok:boolean;message:string}>{
 const p=statusProblem(statuses);if(p)return {ok:false,message:p};
 try{await api('/api/track-checkins','POST',{track_id:trackId,statuses});success();return {ok:true,message:C.sent};}
 catch(e){return {ok:false,message:isNetworkError(e)?C.noSignal:errorText(e)};}
}

export function LiveStatusList({live,big=false}:{live:LiveConditions|null;big?:boolean}){
 if(!live)return <Text style={{color:colors.muted,fontSize:big?16:14}}>{C.empty}</Text>;
 return <View style={{gap:big?8:4}}>
  {live.statuses.map(s=><Text key={s.id} style={{color:s.id==='closed'?'#ef9aa1':colors.text,fontSize:big?19:15,fontWeight:'700'}}>{liveStatusLine(s)}</Text>)}
  <Text style={{color:'#8b93a0',fontSize:big?13.5:12}}>{C.riders}</Text>
 </View>;
}

function Chip({label,on,onPress}:{label:string;on:boolean;onPress:()=>void}){
 return <Pressable haptic="select" accessibilityRole="button" accessibilityState={{selected:on}} onPress={onPress} style={({pressed})=>({paddingHorizontal:14,paddingVertical:9,borderRadius:18,borderWidth:1,borderColor:on?colors.accent:'#343a45',backgroundColor:on?tint(0.16):'transparent',opacity:pressed?0.7:1})}><Text style={{color:on?colors.text:'#c9cfd8',fontSize:14.5,fontWeight:'600'}}>{label}</Text></Pressable>;
}

/** The card for the practice-day and race-day screens: the live list, and a collapsed "Check in" that opens the chips. */
export function LiveConditionsCard({track}:{track:string}){
 const trackId=useTrackId(track),{live,reload}=useLiveConditions(trackId);
 const [open,setOpen]=useState(false),[picked,setPicked]=useState<string[]>([]),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 if(!trackId)return null;
 async function send(){if(busy)return;setBusy(true);const r=await sendCheckin(trackId,picked);setNotice(r.message);if(r.ok){setPicked([]);setOpen(false);reload();}setBusy(false);}
 return <Card>
  <View style={{flexDirection:'row',alignItems:'center',gap:8}}><Icon name="pulse" size={16} color={colors.accent}/><Eyebrow>{C.title.toUpperCase()}</Eyebrow></View>
  <LiveStatusList live={live}/>
  {!open?<Pressable haptic="press" accessibilityRole="button" onPress={()=>{setOpen(true);setNotice('');}} style={({pressed})=>({alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:14,paddingVertical:9,borderRadius:18,borderWidth:1,borderColor:colors.accent,opacity:pressed?0.7:1})}>
    <Icon name="flag" size={16} color={colors.accent}/><Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>{C.send}</Text></Pressable>
  :<View style={{gap:10}}>
    <Text style={{color:colors.muted,fontSize:13.5}}>{C.ask}</Text>
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{CHECKIN_STATUSES.map(s=><Chip key={s.id} label={s.label} on={picked.includes(s.id)} onPress={()=>setPicked(p=>toggleStatus(p,s.id))}/>)}</View>
    <View style={{flexDirection:'row',gap:16,alignItems:'center'}}>
     <Pressable haptic="press" accessibilityRole="button" disabled={busy} onPress={()=>void send()} style={({pressed})=>({paddingHorizontal:18,paddingVertical:10,borderRadius:18,backgroundColor:colors.accent,opacity:pressed||busy?0.7:1})}><Text style={{color:'#fff',fontSize:15,fontWeight:'700'}}>{busy?'Sending…':C.send}</Text></Pressable>
     <Pressable accessibilityRole="button" onPress={()=>{setOpen(false);setPicked([]);}} hitSlop={8}><Text style={{color:colors.muted,fontSize:15}}>Cancel</Text></Pressable>
    </View>
   </View>}
  <Notice text={notice}/>
 </Card>;
}
