// "How did it ride?" on the phone: pick the track (recent and nearby first, or search BAK's tracks), the day, tap the
// chips, save. Shown after a setup log entry, on the race-day screen and under an Ask BAK reply when the rider says they
// rode a track today or yesterday. Saves with no signal and sends when back in range. Mirrors src/TrackReport.tsx; the
// words and rules are in shared/track-reports.ts so the phone and the website say the same thing.
import React,{useEffect,useMemo,useState} from 'react';
import {Text,TextInput,View} from 'react-native';
import {today,dayOf,knownTrack,trackSuggestions} from '../../../shared/race-day';
import {REPORT_COPY,REPORT_GROUPS,addDays,dayWord,emptyDraft,reportBody,reportSummaryLine,reportTrackPicks,rodeTrackMention,mayMentionRide,toggleTag,type RecentRiderReports,type ReportDraft,type ReportTrack} from '../../../shared/track-reports';
import {api,apiQueued} from './api';
import {readProgress,writeProgress} from './localProgress';
import {Pressable} from './Touch';
import {Button,Card,Copy,Eyebrow,Icon,Notice,colors,tint} from './ui';
import {success} from './haptics';

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
type DirTrack=ReportTrack&{id:string};
let dirLoad:Promise<DirTrack[]>|null=null;
/** BAK's listed tracks (cached on this phone, refreshed once per app run). Only entries with an id can be reported on. */
export function useTrackDirectory(){
 const [dir,setDir]=useState<DirTrack[]>(()=>{try{return readProgress<DirTrack[]>('device','track-directory',[]).filter(t=>!!t.id);}catch{return [];}});
 useEffect(()=>{let live=true;
  dirLoad??=api<DirTrack[]>('/api/tracks').then(r=>{if(Array.isArray(r)&&r.length){try{writeProgress('device','track-directory',r);}catch{}return r.filter(t=>!!t.id);}return [];}).catch(()=>{dirLoad=null;return [];});
  void dirLoad.then(r=>{if(live&&r.length)setDir(r);});return()=>{live=false;};},[]);
 return dir;
}

function Chip({label,on,onPress,radio=false}:{label:string;on:boolean;onPress:()=>void;radio?:boolean}){
 return <Pressable haptic="select" accessibilityRole={radio?'radio':'button'} accessibilityState={radio?{checked:on}:{selected:on}} onPress={onPress} style={({pressed})=>({paddingHorizontal:12,paddingVertical:7,borderRadius:16,borderWidth:1,borderColor:on?colors.accent:'#343a45',backgroundColor:on?tint(0.16):'transparent',opacity:pressed?0.7:1})}><Text style={{color:on?'#ffffff':'#c9cfd9',fontSize:14,fontWeight:on?'700':'500'}}>{label}</Text></Pressable>;
}
const Wrap=({children}:{children:React.ReactNode})=><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{children}</View>;
const Label=({children}:{children:React.ReactNode})=><Text style={{color:'#adb5c1',fontSize:12.5,fontWeight:'600'}}>{children}</Text>;
const Link=({title,onPress,muted=false}:{title:string;onPress:()=>void;muted?:boolean})=><Pressable accessibilityRole="button" onPress={onPress} hitSlop={6}><Text style={{color:muted?colors.muted:colors.text,fontSize:15,fontWeight:muted?'500':'700'}}>{title}</Text></Pressable>;
const input={color:colors.text,fontSize:16,borderBottomWidth:1,borderBottomColor:'#2f3540',paddingVertical:10} as const;

/** Under an Ask BAK reply: when the rider's message said they rode one of BAK's tracks that day or the day before
 *  ("rode Dade City today"), a one-line offer that opens the card for that track and day. `at` is when they said it. */
export function RodeTrackOffer({text,at}:{text:string|undefined;at:string}){
 if(!text||!mayMentionRide(text))return null;
 return <RodeTrackOfferInner text={text} at={at}/>;
}
function RodeTrackOfferInner({text,at}:{text:string;at:string}){
 const dir=useTrackDirectory(),said=dayOf(new Date(at));
 const hit=useMemo(()=>rodeTrackMention(text,dir,said),[text,dir,said]);
 if(!hit||hit.day<addDays(today(),-30))return null;
 return <TrackReportCard compact track={hit.track.name} day={hit.day}/>;
}

type OwnReport={id:string;track_id:string;ridden_on:string};
export function TrackReportCard({track,day,setupLogId,setupLabel,recent=[],compact=false,showOthers=false,title=REPORT_COPY.title,onClose}:{track?:string;day?:string;setupLogId?:string|null;setupLabel?:string;recent?:string[];compact?:boolean;showOthers?:boolean;title?:string;onClose?:()=>void}){
 const dir=useTrackDirectory(),now=today();
 // The day's track is the starting point: an exact BAK track is picked outright; any other name fills the search so the
 // rider sees it and the nearest listed tracks, instead of an empty box on a day that already has a track.
 const [open,setOpen]=useState(!compact),[draft,setDraft]=useState<ReportDraft>(()=>({...emptyDraft(day&&day<=now?day:now),setupLogId:setupLogId??null})),[search,setSearch]=useState(()=>track&&!knownTrack(dir,track)?track:''),[more,setMore]=useState(false);
 const [mine,setMine]=useState<OwnReport[]>([]),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[done,setDone]=useState(''),[others,setOthers]=useState<RecentRiderReports|null>(null);
 const set=(p:Partial<ReportDraft>)=>setDraft(d=>({...d,...p}));
 useEffect(()=>{if(!track||draft.trackId)return;const k=knownTrack(dir,track) as DirTrack|undefined;if(k){set({trackId:k.id});setSearch('');}else setSearch(s=>s||track);},[track,dir]);
 useEffect(()=>{set({setupLogId:setupLogId??null});},[setupLogId]);
 useEffect(()=>{if(!open)return;let live=true;api<OwnReport[]>('/api/track-reports').then(r=>{if(live&&Array.isArray(r))setMine(r);}).catch(()=>{});return()=>{live=false;};},[open]);
 useEffect(()=>{if(!showOthers||!draft.trackId){setOthers(null);return;}let live=true;api<RecentRiderReports|null>('/api/track-reports/summary?track_id='+encodeURIComponent(draft.trackId)).then(r=>{if(live)setOthers(r);}).catch(()=>{if(live)setOthers(null);});return()=>{live=false;};},[showOthers,draft.trackId,done]);
 const byId=(id:string)=>dir.find(t=>t.id===id);
 const chosen=draft.trackId?byId(draft.trackId):undefined;
 const picks=reportTrackPicks(dir,[...mine.map(r=>byId(r.track_id)?.name??''),...(track?[track]:[]),...recent].filter(Boolean)) as DirTrack[];
 const suggestions=trackSuggestions(dir,search) as DirTrack[],exact=knownTrack(dir,search) as DirTrack|undefined;
 async function save(){
  if(busy)return;const r=reportBody(draft,now);if(r.problem){setNotice(r.problem);return;}
  setBusy(true);setNotice('');
  try{const saved=await apiQueued<{id:string}>('/api/track-reports',r.body,{...r.body} as never,'Track report');success();setDone(saved.pending?REPORT_COPY.queued:REPORT_COPY.saved);}
  catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 if(compact&&!open&&!done)return <Pressable accessibilityRole="button" onPress={()=>setOpen(true)} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:8,alignSelf:'flex-start',paddingHorizontal:14,paddingVertical:9,borderRadius:18,borderWidth:1,borderColor:'#343a45',opacity:pressed?0.7:1})}>
  <Icon name="location" size={16} color={colors.accent}/><Text style={{color:colors.text,fontSize:14.5,fontWeight:'600',flexShrink:1}}>{REPORT_COPY.askPrompt(chosen?.name??track??'the track',dayWord(draft.day,now).toLowerCase())}</Text>
 </Pressable>;
 return <Card>
  <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}><Eyebrow>{title.toUpperCase()}</Eyebrow>{onClose&&<Link muted title="Close" onPress={onClose}/>}</View>
  {done?<>
   <Notice text={done}/>
   {others&&<Copy>{reportSummaryLine(others)}</Copy>}
   <Link muted title="Change it" onPress={()=>{setDone('');setDraft(d=>({...emptyDraft(d.day),trackId:d.trackId,setupLogId:d.setupLogId}));}}/>
  </>:<>
   <Copy>{REPORT_COPY.intro}</Copy>
   <Label>{REPORT_COPY.track}</Label>
   {chosen?<View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10}}>
    <View style={{flex:1}}><Text style={{color:colors.text,fontSize:17,fontWeight:'700'}}>{chosen.name}</Text><Text style={{color:colors.muted,fontSize:12.5}}>{[chosen.city,chosen.state].filter(Boolean).join(', ')}</Text></View>
    <Link muted title="Change" onPress={()=>{set({trackId:''});setSearch('');}}/>
   </View>:<>
    {picks.length>0&&<Wrap>{picks.map(t=><Chip key={t.id} label={t.name} on={false} onPress={()=>set({trackId:t.id})}/>)}</Wrap>}
    <TextInput value={search} onChangeText={setSearch} maxLength={120} autoCorrect={false} autoCapitalize="words" placeholder={REPORT_COPY.search} placeholderTextColor="#7d8593" accessibilityLabel={REPORT_COPY.track} style={input}/>
    {suggestions.map(t=><Pressable key={t.id} accessibilityRole="button" onPress={()=>{set({trackId:t.id});setSearch('');}} style={{paddingVertical:10,borderBottomWidth:1,borderBottomColor:colors.line}}><Text style={{color:colors.text,fontSize:16,fontWeight:'600'}}>{t.name}</Text><Text style={{color:colors.muted,fontSize:12.5}}>{[t.city,t.state].filter(Boolean).join(', ')}</Text></Pressable>)}
    {exact&&<Link title={`Use ${exact.name}`} onPress={()=>{set({trackId:exact.id});setSearch('');}}/>}
    {!!search.trim()&&!suggestions.length&&!exact&&<Text style={{color:'#7d8593',fontSize:12.5,lineHeight:18}}>Not one of BAK’s tracks yet. Reports go on listed tracks; pick the nearest one or search another name.</Text>}
   </>}
   {others&&<Text style={{color:colors.muted,fontSize:12.5}}>{REPORT_COPY.others}: {reportSummaryLine(others)}</Text>}
   <Label>{REPORT_COPY.day}</Label>
   <Wrap>{[...new Set([...(day&&day<addDays(now,-3)&&day>=addDays(now,-30)?[day]:[]),...[0,-1,-2,-3].map(n=>addDays(now,n))])].sort().reverse().map(d=><Chip key={d} radio label={dayWord(d,now)} on={draft.day===d} onPress={()=>set({day:d})}/>)}</Wrap>
   {REPORT_GROUPS.map(g=><View key={g.id} style={{gap:8}} accessibilityRole={g.one?'radiogroup':undefined} accessibilityLabel={g.label}>
    <Label>{g.label}</Label>
    <Wrap>{g.tags.map(t=><Chip key={t.id} radio={g.one} label={t.label} on={draft.tags.includes(t.id)} onPress={()=>set({tags:toggleTag(draft.tags,t.id)})}/>)}</Wrap>
   </View>)}
   <Link title={more?REPORT_COPY.less:REPORT_COPY.more} onPress={()=>setMore(!more)}/>
   {more&&<View style={{gap:10}}>
    <Label>{REPORT_COPY.tire}</Label>
    <TextInput value={draft.tire} onChangeText={v=>set({tire:v})} maxLength={80} placeholder={REPORT_COPY.tirePlaceholder} placeholderTextColor="#7d8593" style={input}/>
    <View style={{flexDirection:'row',gap:16}}>
     <View style={{flex:1,gap:4}}><Label>{REPORT_COPY.front}</Label><TextInput value={draft.front} onChangeText={v=>set({front:v})} maxLength={5} keyboardType="decimal-pad" placeholder="13" placeholderTextColor="#7d8593" style={input}/></View>
     <View style={{flex:1,gap:4}}><Label>{REPORT_COPY.rear}</Label><TextInput value={draft.rear} onChangeText={v=>set({rear:v})} maxLength={5} keyboardType="decimal-pad" placeholder="12" placeholderTextColor="#7d8593" style={input}/></View>
    </View>
    <Label>{REPORT_COPY.setup}</Label>
    {draft.setupLogId?<View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10}}><Text style={{color:colors.muted,fontSize:14,flex:1}}>{REPORT_COPY.setupLinked}{setupLabel?`: ${setupLabel}`:''}</Text><Link muted title={REPORT_COPY.unlink} onPress={()=>set({setupLogId:null})}/></View>
     :<TextInput value={draft.setupText} onChangeText={v=>set({setupText:v})} maxLength={200} placeholder={REPORT_COPY.setupPlaceholder} placeholderTextColor="#7d8593" style={input}/>}
    <Label>{REPORT_COPY.note}</Label>
    <TextInput value={draft.note} onChangeText={v=>set({note:v})} maxLength={500} multiline placeholder={REPORT_COPY.notePlaceholder} placeholderTextColor="#7d8593" style={[input,{minHeight:44}]}/>
   </View>}
   <Notice text={notice}/>
   <Button disabled={busy} title={busy?REPORT_COPY.saving:REPORT_COPY.save} onPress={()=>void save()}/>
  </>}
 </Card>;
}
