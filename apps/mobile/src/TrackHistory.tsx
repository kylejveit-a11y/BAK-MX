// "What I ran here": on the practice-day and race-day screens, the rider's own past visits to today's track (setup, changes,
// tires and pressures, how it rode, the weather then). Shows the last visit; the rest open on a tap. Hidden when there is
// nothing yet, so a first visit stays clean.
import React,{useEffect,useState} from 'react';
import {Text,View} from 'react-native';
import {SETUP_RESULT_LABELS,type SetupResult} from '../../../shared/rider-types';
import {settingsLine,weatherLine,type Visit} from '../../../shared/track-history';
import {tagLabel} from '../../../shared/track-reports';
import {api} from './api';
import {Pressable} from './Touch';
import {Card,Eyebrow,Icon,colors} from './ui';
import {useTrackId} from './LiveConditions';

const dayText=(d:string)=>new Date(d+'T12:00:00').toLocaleDateString([],{weekday:'short',month:'short',day:'numeric',year:new Date(d+'T12:00:00').getFullYear()===new Date().getFullYear()?undefined:'numeric'});
const line={color:colors.muted,fontSize:14,lineHeight:20} as const;

function VisitView({v}:{v:Visit}){
 const r=v.report,settings=v.logs.map(l=>settingsLine(l.settings)).filter(Boolean)[0]??'';
 const changes=v.logs.filter(l=>l.change_made);
 const psi=r&&(r.front_psi!=null||r.rear_psi!=null)?`${r.front_psi??'?'} / ${r.rear_psi??'?'} psi`:'';
 return <View style={{gap:4}}>
  <Text style={{color:colors.text,fontSize:15.5,fontWeight:'700'}}>{dayText(v.day)}</Text>
  {!!weatherLine(v.weather)&&<Text style={line}>Weather: {weatherLine(v.weather)}</Text>}
  {!!settings&&<Text style={line}>Setup: {settings}</Text>}
  {!!r?.setup_text&&<Text style={line}>Setup: {r.setup_text}</Text>}
  {(!!r?.tire||!!psi)&&<Text style={line}>Tires: {[r?.tire,psi].filter(Boolean).join(' · ')}</Text>}
  {changes.map(l=><Text key={l.id} style={line}>Changed: {l.change_made}{l.result&&l.result!=='not_tested'?` → ${SETUP_RESULT_LABELS[l.result as SetupResult]??l.result}`:''}</Text>)}
  {!!r?.tags.length&&<Text style={line}>Track: {r.tags.map(tagLabel).join(', ')}</Text>}
  {!!r?.note&&<Text style={line}>“{r.note}”</Text>}
 </View>;
}

export function TrackHistoryCard({track,bikeId}:{track:string;bikeId?:string}){
 const trackId=useTrackId(track);const [visits,setVisits]=useState<Visit[]|null>(null),[all,setAll]=useState(false);
 useEffect(()=>{if(!trackId)return;let live=true;
  api<{visits:Visit[]}>(`/api/track-history?track_id=${encodeURIComponent(trackId)}${bikeId?`&bike_id=${bikeId}`:''}&tz_offset=${new Date().getTimezoneOffset()}`).then(r=>{if(live)setVisits(r.visits);}).catch(()=>{});
  return()=>{live=false;};},[trackId,bikeId]);
 // Today's own entries are already on this screen; the card is about earlier visits.
 const today=new Date();const t=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
 const past=(visits??[]).filter(v=>v.day<t);
 if(!past.length)return null;
 return <Card>
  <View style={{flexDirection:'row',alignItems:'center',gap:8}}><Icon name="history" size={16} color={colors.accent}/><Eyebrow>WHAT I RAN HERE</Eyebrow></View>
  <VisitView v={past[0]}/>
  {all&&past.slice(1).map(v=><View key={v.day} style={{borderTopWidth:1,borderTopColor:'#232832',paddingTop:10}}><VisitView v={v}/></View>)}
  {past.length>1&&<Pressable accessibilityRole="button" onPress={()=>setAll(a=>!a)} hitSlop={6}><Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>{all?'Show only the last visit':`See all ${past.length} visits`}</Text></Pressable>}
 </Card>;
}
