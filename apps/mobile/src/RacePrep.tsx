// Race prep: the rider's own checklist, by phase (week before → after the race). Starts from BAK's researched list for their
// kind of riding; Edit list adds their own items, removes what they don't use and reorders. The list is saved to the
// account; checks are kept on the phone until they start fresh.
import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Modal,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg,{Defs,LinearGradient,Rect,Stop} from 'react-native-svg';
import {RACE_PHASES,hydratePrepList,toSaved,defaultPrepList,fitsEngine,engineOf,disciplineOf,type PrepItem,type RacePhase} from '../../../shared/race-prep';
import {PRACTICE_PHASES,defaultPracticeList,hydratePracticeList} from '../../../shared/practice-day';
import type {Bike} from '../../../shared/types';
import {api} from './api';
import {readProgress,writeProgress} from './localProgress';
import {Pressable} from './Touch';
import {Card,Eyebrow,Icon,MetalMark,Notice,colors,tint} from './ui';
import {metalHighlight} from './theme';
import {select as hSelect,success} from './haptics';

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
export {engineOf,disciplineOf};

/** Every open copy of the list hears about a change, so Home's counts and the widget follow the sheet at once. */
const listeners=new Set<()=>void>();
const changed=()=>{for(const l of listeners)l();};
export type PrepKind='race'|'practice';
/** The phases a list shows: race prep runs the week before to after the race; a practice day is the day itself. */
export const phasesFor=(kind:PrepKind)=>kind==='practice'?PRACTICE_PHASES:RACE_PHASES;
/** The rider's list and checks, shared by the full sheet and the race-day card. `practice` is the short practice-day list:
 *  edited the same way, kept on this phone (the race list is saved to the account). */
export function useRacePrep(account:string,bike?:Bike,kind:PrepKind='race'){
 const discipline=disciplineOf(bike),engine=engineOf(bike),practice=kind==='practice';
 const listKey=practice?'practice-prep-list':'race-prep-list',checksKey=practice?'practice-prep-checks':'race-prep-checks';
 const hydrate=(saved:PrepItem[]|null)=>practice?hydratePracticeList(saved,discipline):hydratePrepList(saved,discipline);
 const [all,setList]=useState<PrepItem[]>(()=>hydrate(readProgress(account,listKey,null)));
 const [checks,setChecks]=useState<Record<string,boolean>>(()=>readProgress(account,checksKey,{}));
 const [error,setError]=useState('');
 useEffect(()=>{if(practice){setList(hydrate(readProgress(account,listKey,null)));setChecks(readProgress(account,checksKey,{}));return;}api<{items:PrepItem[]|null}>('/api/race-checklist').then(r=>{setList(hydratePrepList(r.items,discipline));try{writeProgress(account,'race-prep-list',r.items);}catch{}}).catch(()=>{});},[account,discipline,practice]);
 useEffect(()=>{const l=()=>{setChecks(readProgress(account,checksKey,{}));setList(hydrate(readProgress(account,listKey,null)));};listeners.add(l);return()=>{listeners.delete(l);};},[account,discipline,practice]);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 // What this bike shows; items for the other engine type stay in the saved list for the rider's other bikes.
 const list=all.filter(i=>fitsEngine(i,engine)),hidden=all.filter(i=>!fitsEngine(i,engine));
 const saveList=(edited:PrepItem[]|null)=>{const next=edited?[...edited,...hidden]:null;const shown=next??(practice?defaultPracticeList(discipline):defaultPrepList(discipline));setList(shown);const saved=next?toSaved(next):null;try{writeProgress(account,listKey,saved);}catch{}changed();
  if(practice)return;
  if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>{api('/api/race-checklist','PUT',{items:saved}).then(()=>setError('')).catch(e=>setError(errorText(e)));},600);};
 const toggle=(id:string)=>{const next={...checks,[id]:!checks[id]};setChecks(next);try{writeProgress(account,checksKey,next);}catch{}changed();};
 const clear=(phase?:RacePhase)=>{const next=phase?Object.fromEntries(Object.entries(checks).filter(([id])=>list.find(i=>i.id===id)?.phase!==phase)):{};setChecks(next);try{writeProgress(account,checksKey,next);}catch{}changed();};
 return {list,checks,toggle,clear,saveList,error};
}

export function Progress({done,total}:{done:number;total:number}){
 const id=React.useId().replace(/[^a-zA-Z0-9]/g,''),pct=total?done/total:0;
 return <View style={{height:6,borderRadius:3,backgroundColor:'#1a1e25',overflow:'hidden'}}>
  <View style={{width:`${Math.round(pct*100)}%`,height:6}}><Svg width="100%" height="6"><Defs><LinearGradient id={'g'+id} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={metalHighlight()}/><Stop offset="0.5" stopColor={colors.accent}/><Stop offset="1" stopColor={colors.primary}/></LinearGradient></Defs><Rect x="0" y="0" width="100%" height="6" fill={`url(#g${id})`}/></Svg></View>
 </View>;
}

function CheckRow({item,on,onPress}:{item:PrepItem;on:boolean;onPress:()=>void}){
 return <Pressable haptic="select" accessibilityRole="checkbox" accessibilityState={{checked:on}} accessibilityLabel={item.label} onPress={onPress} style={({pressed})=>({flexDirection:'row',alignItems:'flex-start',gap:12,paddingVertical:9,opacity:pressed?0.7:1})}>
  <View style={{width:24,height:24,borderRadius:7,marginTop:1,borderWidth:1.5,borderColor:on?colors.accent:'#4a515d',backgroundColor:on?tint(0.24):'transparent',alignItems:'center',justifyContent:'center'}}>{on&&<Icon name="check" size={15} color="#ffffff"/>}</View>
  <View style={{flex:1,gap:2}}>
   <Text style={{color:on?'#7d8593':colors.text,fontSize:16,fontWeight:'600',textDecorationLine:on?'line-through':'none'}}>{item.label}{item.custom?<Text style={{color:'#9aa2ae',fontSize:11,fontWeight:'800',letterSpacing:0.6}}>  YOURS</Text>:null}</Text>
   {!!item.why&&!on&&<Text style={{color:colors.muted,fontSize:13,lineHeight:18}}>{item.why}</Text>}
  </View>
 </Pressable>;
}

/** Full-screen race prep: phase tabs, progress, the list, and Edit list to make it the rider's own. */
export function RacePrepSheet({visible,onClose,account,bike,startPhase='week',kind='race'}:{visible:boolean;onClose:()=>void;account:string;bike?:Bike;startPhase?:RacePhase;kind?:PrepKind}){
 const insets=useSafeAreaInsets();
 const {list,checks,toggle,clear,saveList,error}=useRacePrep(account,bike,kind);
 const PHASES=phasesFor(kind);
 const [phase,setPhase]=useState<RacePhase>(startPhase),[editing,setEditing]=useState(false),[draft,setDraft]=useState('');
 useEffect(()=>{if(visible){setPhase(startPhase);setEditing(false);}},[visible,startPhase]);
 const items=list.filter(i=>i.phase===phase),done=items.filter(i=>checks[i.id]).length;
 const move=(id:string,d:-1|1)=>{const idx=items.findIndex(i=>i.id===id),j=idx+d;if(j<0||j>=items.length)return;const a=items[idx],b=items[j];const next=[...list];const ia=next.indexOf(a),ib=next.indexOf(b);[next[ia],next[ib]]=[next[ib],next[ia]];saveList(next);};
 const remove=(id:string)=>saveList(list.filter(i=>i.id!==id));
 const add=()=>{const label=draft.trim().slice(0,80);if(!label)return;saveList([...list,{id:'own-'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),label,phase,custom:true}]);setDraft('');success();};
 const counts=useMemo(()=>Object.fromEntries(PHASES.map(p=>{const its=list.filter(i=>i.phase===p.id);return [p.id,[its.filter(i=>checks[i.id]).length,its.length]];})),[list,checks,PHASES]);
 // The sheet owns the whole screen, from the status bar down: the app's header bar never shows above it. The title row and
 // the phase tabs are a fixed header (sized by their content, never shrunk to make room for the list); only the checklist
 // scrolls beneath them.
 return <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" statusBarTranslucent onRequestClose={onClose}>
  <View style={{flex:1,backgroundColor:colors.bg,paddingTop:insets.top+12}}>
   <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:20,paddingBottom:6}}>
    <View style={{gap:6}}><Text style={{color:colors.text,fontSize:28,fontWeight:'900',fontStyle:'italic',letterSpacing:-0.8}}>{kind==='practice'?'Practice checklist':'Race prep'}</Text><View style={{flexDirection:'row',gap:4}}><MetalMark width={26}/><MetalMark width={8} dim/></View></View>
    <View style={{flexDirection:'row',gap:18,alignItems:'center'}}>
     <Pressable accessibilityRole="button" onPress={()=>setEditing(!editing)} hitSlop={8}><Text style={{color:editing?colors.accent:colors.muted,fontSize:15.5,fontWeight:'700'}}>{editing?'Done editing':'Edit list'}</Text></Pressable>
     <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}><Text style={{color:colors.text,fontSize:15.5,fontWeight:'700'}}>Close</Text></Pressable>
    </View>
   </View>
   <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:20,gap:8,paddingVertical:12}} style={{flexGrow:0,flexShrink:0,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:'#262b34'}}>
    {PHASES.map(p=>{const on=p.id===phase,[d,t]=counts[p.id];return <Pressable key={p.id} haptic="select" accessibilityRole="tab" accessibilityState={{selected:on}} onPress={()=>setPhase(p.id)} style={({pressed})=>({paddingHorizontal:14,paddingVertical:9,borderRadius:18,borderWidth:1,borderColor:on?colors.accent:'#2f3540',backgroundColor:on?tint(0.16):'transparent',opacity:pressed?0.7:1})}>
     <Text style={{color:on?'#ffffff':'#c9cfd9',fontSize:14,fontWeight:on?'800':'600'}}>{p.short}{t?<Text style={{color:on?colors.accent:'#7d8593',fontWeight:'700'}}>  {d}/{t}</Text>:null}</Text>
    </Pressable>;})}
   </ScrollView>
   <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets style={{flex:1}} contentContainerStyle={{paddingHorizontal:20,paddingTop:14,paddingBottom:insets.bottom+30,gap:10}}>
    <View style={{gap:8}}>
     <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'baseline'}}><Eyebrow>{(PHASES.find(p=>p.id===phase)??PHASES[0]).label.toUpperCase()}</Eyebrow><Text style={{color:colors.muted,fontSize:13}}>{done} of {items.length}</Text></View>
     <Progress done={done} total={items.length}/>
    </View>
    {!editing&&<View>{items.map(i=><CheckRow key={i.id} item={i} on={!!checks[i.id]} onPress={()=>toggle(i.id)}/>)}</View>}
    {editing&&<View>{items.map((i,n)=><View key={i.id} style={{flexDirection:'row',alignItems:'center',gap:8,paddingVertical:8,borderBottomWidth:1,borderBottomColor:'#1a1e25'}}>
     <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${i.label}`} onPress={()=>{hSelect();remove(i.id);}} hitSlop={6} style={{width:26,height:26,borderRadius:13,backgroundColor:'#3a1d22',alignItems:'center',justifyContent:'center'}}><Text style={{color:'#ef9aa1',fontSize:18,fontWeight:'900',marginTop:-2}}>−</Text></Pressable>
     <Text style={{flex:1,color:colors.text,fontSize:15.5}}>{i.label}{i.custom?<Text style={{color:colors.text,fontSize:11,fontWeight:'800'}}>  YOURS</Text>:null}</Text>
     <Pressable accessibilityRole="button" accessibilityLabel="Move up" disabled={n===0} onPress={()=>move(i.id,-1)} hitSlop={6} style={{opacity:n===0?0.25:1,padding:4}}><Icon name="chevronUp" size={17} color={colors.text}/></Pressable>
     <Pressable accessibilityRole="button" accessibilityLabel="Move down" disabled={n===items.length-1} onPress={()=>move(i.id,1)} hitSlop={6} style={{opacity:n===items.length-1?0.25:1,padding:4}}><Icon name="chevronDown" size={17} color={colors.text}/></Pressable>
    </View>)}</View>}
    {/* add your own: always there, so a rider can jot an item without entering edit mode */}
    <View style={{flexDirection:'row',alignItems:'center',gap:10,borderWidth:1,borderColor:'#2f3540',borderStyle:'dashed',borderRadius:12,paddingHorizontal:12,marginTop:6}}>
     <Icon name="plus" size={16} color={colors.accent}/>
     <TextInput value={draft} onChangeText={setDraft} onSubmitEditing={add} blurOnSubmit={false} returnKeyType="done" maxLength={80} placeholder="Add your own item" placeholderTextColor="#7d8593" style={{flex:1,color:colors.text,fontSize:15.5,paddingVertical:12}}/>
     {!!draft.trim()&&<Pressable accessibilityRole="button" onPress={add} hitSlop={6}><Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>Add</Text></Pressable>}
    </View>
    <Notice text={error}/>
    <View style={{flexDirection:'row',justifyContent:'space-between',paddingTop:10}}>
     {done>0?<Pressable accessibilityRole="button" onPress={()=>clear(phase)} hitSlop={6}><Text style={{color:colors.muted,fontSize:14.5}}>Uncheck this list</Text></Pressable>:<View/>}
     {editing&&<Pressable accessibilityRole="button" onPress={()=>saveList(null)} hitSlop={6}><Text style={{color:colors.muted,fontSize:14.5}}>Restore BAK’s list</Text></Pressable>}
    </View>
   </ScrollView>
  </View>
 </Modal>;
}

/** Race-day Home: the between-motos part of the rider's own list, with the full prep list one tap away. */
export function RacePrepCard({account,bike,phase='motos',onOpen,kind='race'}:{account:string;bike:Bike;phase?:RacePhase;onOpen:()=>void;kind?:PrepKind}){
 const {list,checks,toggle,clear}=useRacePrep(account,bike,kind);
 const PHASES=phasesFor(kind),practice=kind==='practice';
 const hiddenKey=practice?'practice-prep-hidden':'race-prep-hidden',[hidden,setHidden]=useState(()=>readProgress(account,hiddenKey,false));
 const hide=(v:boolean)=>{setHidden(v);try{writeProgress(account,hiddenKey,v);}catch{}};
 if(hidden)return <Pressable accessibilityRole="button" onPress={()=>hide(false)} hitSlop={6} style={{alignSelf:'flex-start'}}><Text style={{color:colors.muted,fontSize:14.5}}>Show prep list</Text></Pressable>;
 const items=list.filter(i=>i.phase===phase),done=items.filter(i=>checks[i.id]).length;
 return <Card>
  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'baseline'}}><Eyebrow>{(PHASES.find(p=>p.id===phase)?.label??'Checklist').toUpperCase()} · {done}/{items.length}</Eyebrow>
   <Pressable accessibilityRole="button" onPress={onOpen} hitSlop={8}><Text style={{color:colors.text,fontWeight:'700'}}>{practice?'Edit checklist':'Full prep list'}</Text></Pressable></View>
  <Progress done={done} total={items.length}/>
  <View>{items.map(i=><CheckRow key={i.id} item={i} on={!!checks[i.id]} onPress={()=>toggle(i.id)}/>)}</View>
  {!items.length&&<Text style={{color:colors.muted,fontSize:14}}>Nothing on this list yet. Open the full prep list to add your own.</Text>}
  <View style={{flexDirection:'row',justifyContent:'space-between'}}>
   {done>0?<Pressable accessibilityRole="button" onPress={()=>clear(phase)} hitSlop={6}><Text style={{color:colors.muted,fontSize:14}}>{practice?'Clear for the next session':'Clear for the next moto'}</Text></Pressable>:<View/>}
   <Pressable accessibilityRole="button" onPress={()=>hide(true)} hitSlop={6}><Text style={{color:colors.muted,fontSize:14}}>Hide</Text></Pressable>
  </View>
 </Card>;
}

/** Home block: race prep at a glance (the phase with the most left to do), opening the full list. Optional in Edit Home. */
export function RacePrepBlock({account,bike,onOpen}:{account:string;bike:Bike;onOpen:()=>void}){
 const {list,checks}=useRacePrep(account,bike);
 const rows=RACE_PHASES.map(p=>{const its=list.filter(i=>i.phase===p.id);return {p,done:its.filter(i=>checks[i.id]).length,total:its.length};}).filter(r=>r.total>0);
 const started=rows.some(r=>r.done>0);
 return <Card>
  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><View style={{flexDirection:'row',alignItems:'center',gap:8}}><MetalMark width={14}/><Eyebrow>RACE PREP</Eyebrow></View>
   <Pressable accessibilityRole="button" onPress={onOpen} hitSlop={8} style={{flexDirection:'row',alignItems:'center',gap:4}}><Text style={{color:colors.text,fontWeight:'700'}}>{started?'Open':'Start'}</Text><Icon name="chevronRight" size={15} color={colors.accent} weight={2.2}/></Pressable></View>
  {!started&&<Text style={{color:colors.muted,fontSize:14,lineHeight:20}}>Your checklist from the week before to after the race. Make it yours: add, remove and reorder.</Text>}
  {started&&rows.map(r=><Pressable key={r.p.id} accessibilityRole="button" onPress={onOpen} style={{gap:5}}>
   <View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{color:colors.text,fontSize:14.5,fontWeight:'600'}}>{r.p.short}</Text><Text style={{color:colors.muted,fontSize:13}}>{r.done}/{r.total}</Text></View>
   <Progress done={r.done} total={r.total}/></Pressable>)}
 </Card>;
}
