// Where to Ride (docs/plans/riding-areas-plan.md): every track and riding area BAK knows. List → place page → trail map,
// each with Back to the step before. Riding-area facts come from official pages; anything not confirmed says so.
import React,{useEffect,useMemo,useState} from 'react';
import {Linking,Platform,ScrollView,Text,TextInput,View} from 'react-native';
import * as Location from 'expo-location';
import {WHERE_COPY as W,WIDTHS,mapSeason,byDistance,directionsLink,filterPlaces,fmtMiles,onxLink,placeSummary,statesOf,widthColor,widthLabel,type PlaceDetail,type PlaceKind,type PlaceRow,type TrailLine} from '../../../shared/where-to-ride';
import {api} from './api';
import {readProgress,writeProgress} from './localProgress';
import {Pressable} from './Touch';
import {BackLink,Button,Card,Copy,Eyebrow,Icon,LinkAction,Notice,PageTitle,PickChip,colors} from './ui';
import {LiveConditionsCard} from './LiveConditions';
import {TrackHistoryCard} from './TrackHistory';
import {TrailMap,MAP_NOTE} from './TrailMap';

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const open=(url:string|null|undefined)=>{if(url&&/^(https?:|tel:)/.test(url))void Linking.openURL(url).catch(()=>{});};
const platform=Platform.OS==='ios'?'ios':Platform.OS==='android'?'android':'web';
const input={color:colors.text,fontSize:16,borderWidth:1,borderColor:'#2f3540',borderRadius:14,paddingHorizontal:14,paddingVertical:11,flex:1} as const;

let listCache:PlaceRow[]|null=null;
function usePlaces(){
 const [rows,setRows]=useState<PlaceRow[]>(()=>listCache??(()=>{try{return readProgress<PlaceRow[]>('device','where-to-ride',[]);}catch{return [];}})());
 const [error,setError]=useState('');
 useEffect(()=>{let live=true;api<PlaceRow[]>('/api/where-to-ride').then(r=>{listCache=r;try{writeProgress('device','where-to-ride',r);}catch{}if(live){setRows(r);setError('');}}).catch(e=>{if(live&&!rows.length)setError(errorText(e));});return()=>{live=false;};},[]);
 return {rows,error};
}

/** The whole Where to Ride flow. `view` is the step: the list, a place, or a place's trail map. */
export function WhereToRide({initialId,onAsk,onRideToday,onClose}:{initialId?:string;onAsk:(text:string)=>void;onRideToday:(name:string)=>void;onClose?:()=>void}){
 const [view,setView]=useState<{id:string;map:boolean}|null>(initialId?{id:initialId,map:false}:null);
 useEffect(()=>{if(initialId)setView({id:initialId,map:false});},[initialId]);
 if(view?.map)return <TrailMapView id={view.id} onBack={()=>setView({id:view.id,map:false})}/>;
 if(view)return <PlaceView id={view.id} onBack={()=>setView(null)} onMap={()=>setView({id:view.id,map:true})} onAsk={onAsk} onRideToday={onRideToday}/>;
 return <PlaceList onOpen={id=>setView({id,map:false})} onClose={onClose}/>;
}

function PlaceList({onOpen,onClose}:{onOpen:(id:string)=>void;onClose?:()=>void}){
 const {rows,error}=usePlaces();
 const [query,setQuery]=useState(''),[kind,setKind]=useState<'all'|PlaceKind>(()=>{try{return readProgress<'all'|PlaceKind>('device','where-kind','all');}catch{return 'all';}});
 const [state,setState]=useState(()=>{try{return readProgress<string>('device','where-state','');}catch{return '';}});
 const [here,setHere]=useState<{lat:number;lng:number}|null>(null),[locNote,setLocNote]=useState(''),[finding,setFinding]=useState(false);
 const pickKind=(k:'all'|PlaceKind)=>{setKind(k);try{writeProgress('device','where-kind',k);}catch{}};
 const pickState=(s:string)=>{setState(s);try{writeProgress('device','where-state',s);}catch{}};
 async function nearMe(){
  if(here){setHere(null);return;}
  setFinding(true);setLocNote('');
  try{const p=await Location.requestForegroundPermissionsAsync();
   if(p.status!=='granted'){setLocNote('Location is off for BAK MX, so the list stays by name. Pick a state instead.');return;}
   const at=await Location.getLastKnownPositionAsync()??await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced});
   if(at){setHere({lat:at.coords.latitude,lng:at.coords.longitude});pickState('');}}
  catch{setLocNote('Couldn’t get your location. Pick a state instead.');}
  finally{setFinding(false);}
 }
 const shown=useMemo(()=>byDistance(filterPlaces(rows,{query,kind,state}),here),[rows,query,kind,state,here]);
 const states=useMemo(()=>statesOf(rows),[rows]);
 return <View style={{gap:16}}>
  {onClose&&<BackLink title="Home" onPress={onClose}/>}
  <PageTitle>{W.title}</PageTitle>
  <Copy>{W.intro}</Copy>
  <View style={{flexDirection:'row',gap:10,alignItems:'center'}}>
   <View style={{flex:1,flexDirection:'row',alignItems:'center'}}><TextInput value={query} onChangeText={setQuery} placeholder={W.search} placeholderTextColor="#7d8593" selectionColor={colors.accent} style={input} accessibilityLabel={W.search} returnKeyType="search" autoCorrect={false}/></View>
   <Pressable haptic="select" accessibilityRole="button" accessibilityLabel={here?'Sort by name':'Nearest first'} accessibilityState={{selected:!!here}} onPress={()=>void nearMe()} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:12,paddingVertical:10,borderRadius:14,borderWidth:1,borderColor:here?colors.accent:'#2f3540',opacity:pressed||finding?0.6:1})}>
    <Icon name="location" size={17} color={here?colors.accent:colors.text}/><Text style={{color:colors.text,fontSize:14.5,fontWeight:'700'}}>{finding?'Finding…':'Near me'}</Text></Pressable>
  </View>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{(['all','track','riding_area'] as const).map(k=><PickChip key={k} label={W.filters[k]} on={kind===k} radio onPress={()=>pickKind(k)}/>)}</View>
  {!here&&states.length>1&&<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,paddingRight:8}}>
   <PickChip small radio label={W.allStates} on={!state} onPress={()=>pickState('')}/>
   {states.map(s=><PickChip key={s} small radio label={s} on={state===s} onPress={()=>pickState(state===s?'':s)}/>)}
  </ScrollView>}
  <Notice text={locNote}/>
  <Notice text={error}/>
  {!shown.length&&!!rows.length&&<Copy>{W.none}</Copy>}
  <View>{shown.slice(0,200).map((p,i)=><PlaceRowView key={p.id} p={p} first={i===0} onPress={()=>onOpen(p.id)}/>)}</View>
 </View>;
}

function PlaceRowView({p,first,onPress}:{p:PlaceRow&{miles:number|null};first:boolean;onPress:()=>void}){
 const where=[p.city?`${p.city}, ${p.state}`:p.state,p.miles!=null?`${Math.round(p.miles)} mi`:''].filter(Boolean).join(' · ');
 return <Pressable accessibilityRole="button" accessibilityLabel={`${p.name}. ${placeSummary(p)}. ${where}`} onPress={onPress} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:12,paddingVertical:14,borderTopWidth:first?0:1,borderTopColor:'#1f232b',opacity:pressed?0.6:1})}>
  <Icon name={p.kind==='riding_area'?'moto':'flag'} size={20} color={colors.accent}/>
  <View style={{flex:1,gap:3}}>
   <Text style={{color:colors.text,fontSize:16,fontWeight:'700'}} numberOfLines={2}>{p.name}</Text>
   <Text style={{color:'#adb5c1',fontSize:13.5}} numberOfLines={2}>{placeSummary(p)}</Text>
   <Text style={{color:'#8b93a0',fontSize:12.5}} numberOfLines={1}>{where}{p.status==='closed'?' · Listed as closed':''}{p.trail_map?' · Trail map':''}</Text>
  </View>
  <Icon name="chevronRight" size={18} color="#6f7784"/>
 </Pressable>;
}

function Fact({k,v}:{k:string;v:string|null|undefined}){
 return <View style={{gap:2}}><Text style={{color:'#8b93a0',fontSize:12.5,fontWeight:'600'}}>{k}</Text><Text style={{color:v?colors.text:colors.muted,fontSize:15,lineHeight:21}}>{v||W.notConfirmed}</Text></View>;
}

function PlaceView({id,onBack,onMap,onAsk,onRideToday}:{id:string;onBack:()=>void;onMap:()=>void;onAsk:(text:string)=>void;onRideToday:(name:string)=>void}){
 const [p,setP]=useState<PlaceDetail|null>(null),[error,setError]=useState('');
 useEffect(()=>{let live=true;setP(null);setError('');api<PlaceDetail>('/api/riding-area?id='+encodeURIComponent(id)).then(r=>{if(live)setP(r);}).catch(e=>{if(live)setError(errorText(e));});return()=>{live=false;};},[id]);
 if(!p)return <View style={{gap:16}}><BackLink title={W.title} onPress={onBack}/>{error?<Notice text={error}/>:<Copy>Loading…</Copy>}</View>;
 const a=p.area,ride=p.kind==='riding_area',privateLand=a?a.land==='private':p.access==='members'||p.access==='private';
 const place=[a?.near??(p.city?`${p.city}, ${p.state}`:p.state),a?.managed_by].filter(Boolean).join(' · ');
 const askText=ride?`I’m riding the trails at ${p.name}. How should I set up my bike for them?`:`I’m riding ${p.name}. How should I set up my bike for this track?`;
 return <View style={{gap:16}}>
  <BackLink title={W.title} onPress={onBack}/>
  <View style={{gap:6}}>
   <PageTitle>{p.name}</PageTitle>
   {!!a?.name_detail&&<Text style={{color:colors.text,fontSize:15}}>{a.name_detail}</Text>}
   <Text style={{color:'#adb5c1',fontSize:14}}>{placeSummary(p)}</Text>
   {!!place&&<Text style={{color:'#8b93a0',fontSize:13.5}}>{place}</Text>}
  </View>
  {p.status==='closed'&&<Notice tone="warn" text="BAK has this place listed as closed. Check the official page before you go."/>}
  {!!a?.closures&&<Notice tone="warn" text={a.closures}/>}
  <View style={{gap:10}}>
   {p.trail_map&&<Button title={W.trailMap} onPress={onMap}/>}
   <Button secondary title={W.rideToday} onPress={()=>onRideToday(p.name)}/>
   <Text style={{color:'#8b93a0',fontSize:12.5}}>{W.rideTodayDetail}</Text>
  </View>
  {ride&&<Card>
   <Eyebrow>{W.whatYouCanRide.toUpperCase()}</Eyebrow>
   <View style={{gap:8}}>{WIDTHS.map(w=>{const v=a?.vehicles?.[w.id];return <View key={w.id} style={{flexDirection:'row',alignItems:'center',gap:10}}>
    <View style={{width:22,height:4,borderRadius:2,backgroundColor:w.color,opacity:v===false?0.3:1}}/>
    <Text style={{color:v===false?'#7d8593':colors.text,fontSize:15,fontWeight:'700',flex:1}}>{w.label} <Text style={{color:'#8b93a0',fontWeight:'500',fontSize:13}}>{w.detail}</Text></Text>
    <Text style={{color:v===true?'#9fdcb3':v===false?'#8b93a0':colors.muted,fontSize:13.5,fontWeight:'700'}}>{v===true?'Yes':v===false?'No':'Not confirmed'}</Text></View>;})}</View>
   <View style={{flexDirection:'row',gap:24}}>
    <Fact k="Width limit" v={a?.width_limit_in!=null?`${a.width_limit_in} in`:null}/>
    <Fact k="Trail" v={a?.trail_miles!=null?`${fmtMiles(a.trail_miles)} mi`:null}/>
   </View>
  </Card>}
  {!ride&&!!p.tracks_on_site.length&&<Card><Eyebrow>ON SITE</Eyebrow>{p.tracks_on_site.map(t=><Copy key={t}>• {t}</Copy>)}{!!p.layout_notes&&<Copy>{p.layout_notes}</Copy>}</Card>}
  {(ride||a)&&<Card>
   <Eyebrow>{W.knowBefore.toUpperCase()}</Eyebrow>
   {privateLand&&<Copy>{W.privateLand}</Copy>}
   <Fact k="Pass or fee" v={a?.pass?[a.pass.day&&`Visit: ${a.pass.day}`,a.pass.year&&`Annual: ${a.pass.year}`,a.pass.how].filter(Boolean).join('\n')||null:null}/>
   <Fact k="Season" v={a?.season}/>
   <Fact k="Hours" v={a?.hours}/>
   {!!a?.rules?.length&&<View style={{gap:4}}><Text style={{color:'#8b93a0',fontSize:12.5,fontWeight:'600'}}>Rules</Text>{a.rules.map(r=><Text key={r} style={{color:colors.text,fontSize:15,lineHeight:21}}>• {r}</Text>)}</View>}
   {!!a?.address&&<Fact k="Address" v={a.address}/>}
  </Card>}
  <LiveConditionsCard track={p.name}/>
  <TrackHistoryCard track={p.name}/>
  <View>
   <LinkAction icon="chat" title={W.ask} onPress={()=>onAsk(askText)}/>
   <LinkAction icon="location" title={W.directions} onPress={()=>open(directionsLink(p,platform))}/>
   {!!(a?.official_url??p.website)&&<LinkAction icon="document" title={W.official} onPress={()=>open(a?.official_url??p.website)}/>}
   {!!(a?.phone??p.phone)&&<LinkAction icon="messages" title={`${W.call} ${a?.phone??p.phone}`} onPress={()=>open('tel:'+(a?.phone??p.phone)!.replace(/[^\d+]/g,''))}/>}
   {ride&&<LinkAction icon="share" title={W.onx} onPress={()=>open(onxLink(p.state))}/>}
  </View>
  {!!a?.verified&&<View style={{gap:6}}>
   <Text style={{color:'#8b93a0',fontSize:12.5,lineHeight:18}}>{W.checkedOn(a.verified)}</Text>
   {a.sources.map(s=><Pressable key={s.url} accessibilityRole="link" onPress={()=>open(s.url)} hitSlop={4}><Text style={{color:'#adb5c1',fontSize:12.5,textDecorationLine:'underline'}}>{s.title}</Text></Pressable>)}
  </View>}
 </View>;
}

function TrailMapView({id,onBack}:{id:string;onBack:()=>void}){
 const [data,setData]=useState<{lines:TrailLine[];map_date:string|null}|null>(null),[error,setError]=useState(''),[selected,setSelected]=useState<string|null>(null);
 useEffect(()=>{let live=true;api<{lines:TrailLine[];map_date:string|null}>('/api/trail-lines?id='+encodeURIComponent(id)).then(r=>{if(live)setData(r);}).catch(e=>{if(live)setError(errorText(e));});return()=>{live=false;};},[id]);
 const trails=useMemo(()=>{const m=new Map<string,{name:string;width:string;dates:string;miles:number}>();
  for(const l of data?.lines??[]){const name=l.name||l.number;const t=m.get(name)??{name,width:l.width,dates:l.dates_open,miles:0};t.miles+=l.miles??0;m.set(name,t);}
  return [...m.values()].sort((x,y)=>y.miles-x.miles);},[data]);
 const used=new Set((data?.lines??[]).map(l=>l.width));
 return <View style={{gap:16}}>
  <BackLink title="Back" onPress={onBack}/>
  <PageTitle>{W.trailMap}</PageTitle>
  <Notice text={error}/>
  {!data&&!error&&<Copy>Loading…</Copy>}
  {data&&!data.lines.length&&<Copy>{W.noLines}</Copy>}
  {!!data?.lines.length&&<>
   <TrailMap lines={data.lines} selected={selected}/>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:14}}>{WIDTHS.filter(w=>used.has(w.id)).map(w=><View key={w.id} style={{flexDirection:'row',alignItems:'center',gap:6}}><View style={{width:18,height:4,borderRadius:2,backgroundColor:w.color}}/><Text style={{color:colors.text,fontSize:13.5}}>{w.label}</Text></View>)}</View>
   <Text style={{color:'#8b93a0',fontSize:12.5,lineHeight:18}}>{W.mapNote(data.map_date)}{MAP_NOTE?` ${MAP_NOTE}`:''} Forest roads that also allow OHVs aren’t drawn.</Text>
   <Card>
    <Eyebrow>TRAILS</Eyebrow>
    {trails.map((t,i)=><Pressable key={t.name} accessibilityRole="button" accessibilityState={{selected:selected===t.name}} onPress={()=>setSelected(s=>s===t.name?null:t.name)} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:10,paddingVertical:10,borderTopWidth:i?1:0,borderTopColor:'#1f232b',opacity:pressed?0.6:1})}>
     <View style={{width:18,height:4,borderRadius:2,backgroundColor:widthColor(t.width)}}/>
     <View style={{flex:1}}><Text style={{color:selected===t.name?colors.accent:colors.text,fontSize:15,fontWeight:'700'}}>{t.name}</Text>
      <Text style={{color:'#8b93a0',fontSize:12.5}}>{[widthLabel(t.width),mapSeason(t.dates),t.miles?`${fmtMiles(Math.round(t.miles*10)/10)} mi`:''].filter(Boolean).join(' · ')}</Text></View>
    </Pressable>)}
   </Card>
  </>}
 </View>;
}
