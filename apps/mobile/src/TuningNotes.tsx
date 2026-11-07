// Tuning notes on the phone: "Save to bike" and "Share" under a BAK answer, the quick note under the chat, Garage › Tuning
// notes, and "Check it with a photo". Notes are saved to the rider's account (shared/tuning-notes.ts). Notes this phone kept
// before that move up to the account once, on the first launch after the update; the phone's copy stays as a backup.
import React,{useEffect,useRef,useState} from 'react';
import {Alert,Platform,ScrollView,Share,StyleSheet,Text,View} from 'react-native';
import * as Sharing from 'expo-sharing';
import {File,Paths} from 'expo-file-system';
import {randomUUID} from 'expo-crypto';
import type {Bike,Message} from '../../../shared/types';
import {PHOTO_CHECKS,askAboutNote,changeTable,localNoteUploads,noteFromAnswer,shareFileName,shareText,photoCheck,type PhotoCheckId,type TuningNote} from '../../../shared/tuning-notes';
import {api} from './api';
import {readProgress,writeProgress} from './localProgress';
import {Pressable} from './Touch';
import {RichText} from './RichText';
import {Button,Copy,Eyebrow,Field,Icon,LinkAction,Notice,colors} from './ui';

const errorText=(e:unknown)=>e instanceof Error&&e.message?e.message:'Something went wrong. Please try again.';
const shortDay=(iso:string)=>new Date(iso).toLocaleDateString([],{year:'numeric',month:'short',day:'numeric'});

// ------------------------------------------------------------------ the bike's notes
export function useBikeNotes(bike:Bike|undefined){
 const [notes,setNotes]=useState<TuningNote[]|null>(null),[error,setError]=useState('');
 const reload=async()=>{if(!bike){setNotes([]);return;}try{setNotes(await api<TuningNote[]>('/api/tuning-notes?bike_id='+bike.id));setError('');}catch(e){setError(errorText(e));setNotes(n=>n??[]);}};
 useEffect(()=>{setNotes(null);void reload();},[bike?.id]);
 const put=(n:TuningNote)=>setNotes(list=>[n,...(list??[]).filter(x=>x.id!==n.id)].sort((a,b)=>b.noted_at.localeCompare(a.noted_at)));
 const drop=(id:string)=>setNotes(list=>(list??[]).filter(x=>x.id!==id));
 return {notes,error,reload,put,drop};
}
export type BikeNotes=ReturnType<typeof useBikeNotes>;

/** Notes this phone kept per bike (`tuning-notes-<bike>`) go up to the account once. A note that fails stays queued for the
 *  next launch; the account keeps the phone's note id, so a second send never makes a copy. Returns how many moved. */
export async function moveDeviceNotes(account:string,bikes:Bike[]):Promise<number>{
 let moved=0;
 for(const bike of bikes){
  const doneKey=`tuning-notes-moved-${bike.id}`,done=readProgress<string[]>(account,doneKey,[]);
  if(done.includes('*'))continue;
  const uploads=localNoteUploads(readProgress<unknown>(account,`tuning-notes-${bike.id}`,[]),bike,done);
  const sent=[...done];let failed=false;
  for(const u of uploads){try{await api('/api/tuning-notes','POST',u.body);sent.push(u.id);moved++;}catch{failed=true;}}
  try{writeProgress(account,doneKey,failed?sent:['*']);}catch{/* tried again next launch; the account ignores repeats */}
 }
 return moved;
}
export function useMoveDeviceNotes(account:string,bikes:Bike[],onMoved?:()=>void){
 const ran=useRef('');
 useEffect(()=>{if(!bikes.length||ran.current===account)return;ran.current=account;void moveDeviceNotes(account,bikes).then(n=>{if(n)onMoved?.();}).catch(()=>{});},[account,bikes.length]);
}

// ------------------------------------------------------------------ share
/** The system share sheet with the plain-text setup sheet. If the text share is not available, the same sheet as a file. */
export async function shareNote(note:Parameters<typeof shareText>[0]&{bike_label:string;noted_at:string}):Promise<void>{
 const text=shareText(note);
 try{await Share.share(Platform.OS==='ios'?{message:text}:{message:text,title:`BAK MX setup · ${note.bike_label}`});return;}
 catch{/* fall through to a file */}
 const file=new File(Paths.cache,shareFileName(note));file.create({overwrite:true});file.write(text);
 if(!await Sharing.isAvailableAsync())throw new Error('Sharing is not available on this device.');
 await Sharing.shareAsync(file.uri,{mimeType:'text/plain',dialogTitle:'Share setup sheet'});
}

const a=StyleSheet.create({row:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:8,paddingTop:4},action:{flexDirection:'row',alignItems:'center',gap:6,height:34,paddingHorizontal:12,borderRadius:17,borderWidth:1,borderColor:'#2a2f39',backgroundColor:'rgba(255,255,255,0.03)'},text:{color:'#c9cfd9',fontSize:13.5,fontWeight:'600'}});
function Action({icon,title,onPress,disabled,done,accessibilityLabel}:{icon:Parameters<typeof Icon>[0]['name'];title:string;onPress?:()=>void;disabled?:boolean;done?:boolean;accessibilityLabel?:string}){
 return <Pressable haptic="tap" accessibilityRole="button" accessibilityLabel={accessibilityLabel??title} accessibilityState={{disabled:!!disabled||done}} disabled={disabled||done||!onPress} onPress={onPress} style={({pressed})=>[a.action,done&&{borderColor:'transparent'},{opacity:disabled?0.45:pressed?0.6:1}]}><Icon name={icon} size={15} color={done?'#bfe3c8':'#b2b9c4'}/><Text style={[a.text,done&&{color:'#bfe3c8'}]}>{title}</Text></Pressable>;
}

// ------------------------------------------------------------------ under a BAK answer
export function AnswerNoteBar({bike,message,question,notes}:{bike?:Bike;message:Message;question:string;notes?:BikeNotes}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');const id=useRef(randomUUID());
 if(!message.response)return null;
 const saved=notes?.notes?.find(n=>n.source_message_id===message.id);
 const draft=noteFromAnswer({bike:bike??null,question,response:message.response,messageId:message.id,conversationId:message.conversation_id,at:message.created_at});
 async function save(){if(!bike||busy)return;setBusy(true);setError('');try{notes?.put(await api<TuningNote>('/api/tuning-notes','POST',{id:id.current,message_id:message.id}));}catch(e){setError(errorText(e));}finally{setBusy(false);}}
 return <View style={{gap:6}}>
  <View style={a.row}>
   {bike&&notes&&(saved?<Action icon="check" title="Saved to bike" done/>:<Action icon="notes" title={busy?'Saving…':'Save to bike'} disabled={busy} onPress={()=>void save()}/>)}
   <Action icon="share" title="Share" onPress={()=>void shareNote(saved??draft).catch(e=>setError(errorText(e)))}/>
  </View>
  {!!error&&<Text style={{color:'#ffb4ae',fontSize:13}}>{error}</Text>}
 </View>;
}

// ------------------------------------------------------------------ the quick note under the chat
export function ChatNoteBox({bike,conversation,notes,onOpenGarage}:{bike:Bike;conversation:string;notes:BikeNotes;onOpenGarage?:()=>void}){
 const [open,setOpen]=useState(false),[draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const list=notes.notes??[];
 async function save(){const text=draft.trim();if(!text||busy)return;setBusy(true);setError('');try{notes.put(await api<TuningNote>('/api/tuning-notes','POST',{id:randomUUID(),bike_id:bike.id,rider_note:text,...(conversation?{conversation_id:conversation}:{})}));setDraft('');}catch(e){setError(errorText(e));}finally{setBusy(false);}}
 return <View style={{borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'#2a2f39',paddingTop:6,marginTop:8}}>
  <Pressable accessibilityRole="button" accessibilityState={{expanded:open}} onPress={()=>setOpen(!open)} style={{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:12}}><Icon name="notes" size={21} color="#b2b9c4"/><View style={{flex:1}}><Text style={{color:colors.text,fontSize:16,fontWeight:'600'}}>Tuning notes{list.length?` · ${list.length}`:''}</Text><Text style={{color:'#adb5c1',fontSize:13}}>What you changed, how it felt, what’s next. Saved to your account.</Text></View><Icon name={open?'chevronUp':'chevronDown'} size={17} color="#7d8593"/></Pressable>
  {open&&<View style={{gap:12,paddingBottom:8}}>
   <Field label="New note" multiline value={draft} onChangeText={setDraft} maxLength={4000} placeholder="Rebound 2 slower. Rear stayed down in the braking bumps."/>
   <Notice text={error||notes.error}/>
   <Button disabled={!draft.trim()||busy} title={busy?'Saving…':'Save note'} onPress={()=>void save()}/>
   {list.slice(0,3).map(n=><View key={n.id} style={{gap:2,paddingTop:8,borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'#232833'}}><Text style={{color:'#adb5c1',fontSize:12.5}}>{new Date(n.noted_at).toLocaleString()}</Text><Text selectable style={{color:colors.text,fontSize:15,lineHeight:22}}>{n.rider_note||n.title}</Text></View>)}
   {onOpenGarage&&list.length>0&&<LinkAction muted title="All notes for this bike" onPress={onOpenGarage}/>}
  </View>}
 </View>;
}

// ------------------------------------------------------------------ Garage › Tuning notes
export function NotesList({bike,onAsk}:{bike:Bike;onAsk:(text:string)=>void}){
 const notes=useBikeNotes(bike),[open,setOpen]=useState(''),[renaming,setRenaming]=useState(''),[name,setName]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function rename(n:TuningNote){const t=name.trim();if(!t||busy)return;setBusy(true);setError('');try{notes.put(await api<TuningNote>('/api/tuning-notes?id='+n.id,'PATCH',{title:t}));setRenaming('');}catch(e){setError(errorText(e));}finally{setBusy(false);}}
 function remove(n:TuningNote){Alert.alert('Delete this note?',`“${n.title}” leaves your notes on every device.`,[{text:'Keep',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>{setBusy(true);setError('');api('/api/tuning-notes?id='+n.id,'DELETE').then(()=>{notes.drop(n.id);if(open===n.id)setOpen('');}).catch(e=>setError(errorText(e))).finally(()=>setBusy(false));}}]);}
 const list=notes.notes;
 return <View style={{gap:10}}>
  <Copy>BAK answers you saved to this bike and notes you wrote. Saved to your account, on every device.</Copy>
  <Notice text={error||notes.error}/>
  {list===null&&<Copy>Loading notes…</Copy>}
  {list&&!list.length&&<Copy>No notes yet. Tap “Save to bike” under any BAK answer, or write a note under the chat.</Copy>}
  {list?.map(n=>{const isOpen=open===n.id,table=changeTable(n.setup_changes);return <View key={n.id} style={{borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'#2a2f39'}}>
   <Pressable accessibilityRole="button" accessibilityState={{expanded:isOpen}} onPress={()=>setOpen(isOpen?'':n.id)} style={{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:12}}><View style={{flex:1,gap:2}}><Text style={{color:colors.text,fontSize:16,fontWeight:'600'}}>{n.title}</Text><Text style={{color:'#adb5c1',fontSize:13}}>{shortDay(n.noted_at)}{n.setup_changes.length?` · ${n.setup_changes.length} change${n.setup_changes.length>1?'s':''}`:''}{!n.answer?' · your note':''}</Text></View><Icon name={isOpen?'chevronUp':'chevronDown'} size={17} color="#7d8593"/></Pressable>
   {isOpen&&<View style={{gap:10,paddingBottom:14}}>
    {renaming===n.id&&<View style={{gap:8}}><Field label="Note name" value={name} onChangeText={setName} maxLength={120} autoFocus/><View style={{flexDirection:'row',gap:10}}><View style={{flex:1}}><Button title="Save name" disabled={busy||!name.trim()} onPress={()=>void rename(n)}/></View><View style={{flex:1}}><Button secondary title="Cancel" onPress={()=>setRenaming('')}/></View></View></View>}
    {!!n.question&&<View style={{gap:4}}><Eyebrow>YOU ASKED</Eyebrow><Text selectable style={{color:colors.text,fontSize:15,lineHeight:22}}>{n.question}</Text></View>}
    {!!n.answer&&<View style={{gap:4}}><Eyebrow>BAK</Eyebrow><RichText text={n.answer}/></View>}
    {table.rows.length>0&&<View style={{gap:0}}><Eyebrow>SETUP CHANGES</Eyebrow>{table.rows.map((r,i)=><View key={i} style={{paddingVertical:8,borderTopWidth:i?StyleSheet.hairlineWidth:0,borderTopColor:colors.line,gap:2}}><Text selectable style={{color:colors.text,fontSize:15,fontWeight:'700'}}>{r[0]}: {r[1]}</Text>{r.length>2&&<Text selectable style={{color:'#adb5c1',fontSize:13.5}}>Stock: {r[2]}</Text>}</View>)}</View>}
    {!!n.rider_note&&<View style={{gap:4}}><Eyebrow>YOUR NOTE</Eyebrow><Text selectable style={{color:colors.text,fontSize:15,lineHeight:22}}>{n.rider_note}</Text></View>}
    <View style={a.row}>
     <Action icon="chat" title="Ask BAK about this note" onPress={()=>onAsk(askAboutNote(n))}/>
     <Action icon="share" title="Share" onPress={()=>void shareNote(n).catch(e=>setError(errorText(e)))}/>
     <Action icon="compose" title="Rename" onPress={()=>{setRenaming(n.id);setName(n.title);}}/>
     <Action icon="trash" title="Delete" disabled={busy} onPress={()=>remove(n)}/>
    </View>
   </View>}
  </View>;})}
 </View>;
}

// ------------------------------------------------------------------ check it with a photo
/** The one-line shot tip, then camera or library. Resolves to the source, or null when the rider cancels. */
export function photoCheckSource(check:PhotoCheckId):Promise<'camera'|'library'|null>{
 const c=photoCheck(check);if(!c)return Promise.resolve(null);
 return new Promise(resolve=>Alert.alert(c.label,c.tip,[{text:'Take photo',onPress:()=>resolve('camera')},{text:'Choose from library',onPress:()=>resolve('library')},{text:'Cancel',style:'cancel',onPress:()=>resolve(null)}],{cancelable:true,onDismiss:()=>resolve(null)}));
}
/** One scrolling line in the chat footer (`line`), or a wrapped block on a page like Workshop. */
export function PhotoCheckChips({disabled,onPick,line=false}:{disabled?:boolean;onPick:(id:PhotoCheckId)=>void;line?:boolean}){
 const chips=PHOTO_CHECKS.map(c=><Pressable key={c.id} haptic="select" accessibilityRole="button" accessibilityLabel={`Check it with a photo: ${c.label}`} disabled={disabled} onPress={()=>onPick(c.id)} style={({pressed})=>({height:30,paddingHorizontal:11,borderRadius:15,borderWidth:1,borderColor:'#2a2f39',justifyContent:'center',opacity:disabled?0.4:pressed?0.6:1})}><Text style={{color:'#c9cfd9',fontSize:13,fontWeight:'600'}}>{c.label}</Text></Pressable>);
 const label=<View style={{flexDirection:'row',alignItems:'center',gap:5}}><Icon name="camera" size={13} color="#8f97a4"/><Text style={{color:'#8f97a4',fontSize:12.5,fontWeight:'600'}}>Check it with a photo</Text></View>;
 if(line)return <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{alignItems:'center',gap:6,paddingHorizontal:8,paddingBottom:6}}>{label}{chips}</ScrollView>;
 return <View style={{gap:6,paddingHorizontal:8,paddingTop:2,paddingBottom:4}}>{label}<View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{chips}</View></View>;
}
