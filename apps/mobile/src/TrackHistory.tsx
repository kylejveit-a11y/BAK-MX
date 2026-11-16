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

/** One visit. Short form (the card's first look): the day and weather, the setup, tires and what changed. Full form adds
 *  how the track was and the rider's note. */
function VisitView({v,full}:{v:Visit;full:boolean}){
 const r=v.report,settings=v.logs.map(l=>settingsLine(l.settings)).filter(Boolean)[0]??r?.setup_text??'';
 const changes=v.logs.filter(l=>l.change_made);
 const psi=r&&(r.front_psi!=null||r.rear_psi!=null)?`${r.front_psi??'?'} / ${r.rear_psi??'?'} psi`:'';
 const tires=[r?.tire,psi].filter(Boolean).join(' · ');
 const Row=({k,v:val}:{k:string;v:string})=>val?<View style={{flexDirection:'row',gap:10}}><Text style={{color:'#8b93a0',fontSize:13.5,width:62}}>{k}</Text><Text style={{color:colors.text,fontSize:14,lineHeight:19,flex:1}}>{val}</Text></View>:null;
 return <View style={{gap:6}}>
  <Text style={{color:colors.text,fontSize:15.5,fontWeight:'700'}}>{dayText(v.day)}{weatherLine(v.weather)?<Text style={{color:colors.muted,fontWeight:'400'}}>{'  ·  '+weatherLine(v.weather)}</Text>:null}</Text>
  <Row k="Setup" v={settings}/>
  <Row k="Tires" v={tires}/>
  {changes.map(l=><Row key={l.id} k="Changed" v={`${l.change_made}${l.result&&l.result!=='not_tested'?` → ${SETUP_RESULT_LABELS[l.result as SetupResult]??l.result}`:''}`}/>)}
  {full&&<Row k="Track" v={r?.tags.length?r.tags.map(tagLabel).join(', '):''}/>}
  {full&&!!r?.note&&<Row k="Note" v={`“${r.note}”`}/>}
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
  <VisitView v={past[0]} full={all}/>
  {all&&past.slice(1).map(v=><View key={v.day} style={{borderTopWidth:1,borderTopColor:'#232832',paddingTop:10}}><VisitView v={v} full/></View>)}
  <Pressable accessibilityRole="button" onPress={()=>setAll(a=>!a)} hitSlop={6}><Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>{all?'Show less':past.length>1?`Details and all ${past.length} visits`:'Details'}</Text></Pressable>
 </Card>;
}
