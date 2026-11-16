// Ride safety screens: who gets the link and the alert (up to two people), the start ("When will you be back?"), and the ride
// in progress (I'm back, +30 min, +1 hour, send the link again). One panel used in Ride Day mode, in the sheet that opens from
// a reminder, Home or the chat offer, and in Account › Ride safety. Big targets throughout: it's used with gloves on.
import React,{useCallback,useEffect,useState} from 'react';
import {Modal,Platform,ScrollView,Text,TextInput,View} from 'react-native';
import DateTimePicker,{type DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BACK_BY_CHOICES,SAFETY,SHARE_COPY as C} from '../../../shared/ride-share';
import {api} from './api';
import {Pressable} from './Touch';
import {Icon,colors,tint} from './ui';
import {DISPLAY,LABEL} from './theme';
import {readProgress,writeProgress} from './localProgress';
import {RideStatusLine,alwaysHint,clock,endRide,extendRide,openSafetySheet,sendLink,setSheetOpener,startRide,useRide} from './RideShare';

type Contact={id:string;name:string;phone:string;email:string};
const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const label=(m:number)=>m<60?`${m} min`:m%60?`${Math.floor(m/60)} h ${m%60} min`:`${m/60} hour${m===60?'':'s'}`;

function Tile({title,sub,icon,onPress,on=false,tone,half=false,disabled=false}:{title:string;sub?:string;icon?:React.ComponentProps<typeof Icon>['name'];onPress:()=>void;on?:boolean;tone?:string;half?:boolean;disabled?:boolean}){
 return <Pressable haptic="press" accessibilityRole="button" accessibilityLabel={sub?`${title}, ${sub}`:title} disabled={disabled} onPress={onPress}
  style={({pressed})=>({width:half?'48.5%':'100%',minHeight:64,borderRadius:16,borderWidth:1.5,borderColor:on?colors.accent:'#2c323c',backgroundColor:on?tint(0.2):pressed?'#1a1e25':'#111419',paddingHorizontal:14,paddingVertical:10,justifyContent:'center',gap:3,opacity:disabled?0.5:1})}>
  <View style={{flexDirection:'row',alignItems:'center',gap:10}}>{icon&&<Icon name={icon} size={22} color={tone??colors.accent}/>}<Text style={{color:tone??colors.text,fontSize:16,...LABEL,flexShrink:1}}>{title}</Text></View>
  {!!sub&&<Text style={{color:colors.muted,fontSize:13.5}}>{sub}</Text>}
 </Pressable>;
}
const Row=({children}:{children:React.ReactNode})=><View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',rowGap:10}}>{children}</View>;
const Heading=({children}:{children:React.ReactNode})=><Text style={{color:'#adb5c1',fontSize:12.5,...LABEL}}>{children}</Text>;
const Input=(p:React.ComponentProps<typeof TextInput>&{label:string})=><View style={{gap:4}}><Text style={{color:'#9aa2ae',fontSize:13}}>{p.label}</Text>
 <TextInput placeholderTextColor="#6f7682" {...p} style={{color:colors.text,fontSize:17,borderBottomWidth:1.5,borderBottomColor:'#3a414d',paddingVertical:8}}/></View>;

export function useSafetyContacts(){
 const [contacts,setContacts]=useState<Contact[]|null>(null),[emailReady,setEmailReady]=useState(true),[myName,setMyName]=useState('');
 const load=useCallback(()=>{api<{contacts:Contact[];email_ready:boolean;my_name?:string}>('/api/safety-contacts').then(r=>{setContacts(r.contacts);setEmailReady(r.email_ready);setMyName(r.my_name??'');}).catch(()=>setContacts(c=>c??[]));},[]);
 useEffect(()=>{load();},[load]);
 return {contacts,emailReady,setContacts,myName,setMyName,load};
}

/** Up to two people. A mobile number gets the text (sent by the rider, one tap); an email gets the link and, if needed, the alert. */
/** The rider's own name as their contacts know them ("Kyle"), used in BAK's emails and on the link. Private. */
function MyName({myName,setMyName}:{myName:string;setMyName:(n:string)=>void}){
 const [editing,setEditing]=useState(false),[draft,setDraft]=useState(myName),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 async function save(){if(busy||!draft.trim())return;setBusy(true);setNotice('');try{const r=await api<{my_name:string}>('/api/safety-contacts/name','PUT',{name:draft.trim()});setMyName(r.my_name);setEditing(false);}catch(e){setNotice(errorText(e));}finally{setBusy(false);}}
 if(!editing)return <Pressable accessibilityRole="button" accessibilityLabel={`Your name in emails, ${myName}. Change`} onPress={()=>{setDraft(myName);setEditing(true);}} hitSlop={6}>
  <Text style={{color:colors.muted,fontSize:14.5}}>Your name in emails: <Text style={{color:colors.text,fontWeight:'700'}}>{myName}</Text> · Change</Text></Pressable>;
 return <View style={{gap:10}}>
  <Input label="Your name, as they know you" value={draft} onChangeText={setDraft} maxLength={40} autoCapitalize="words" autoFocus placeholder="e.g. Kyle" onSubmitEditing={()=>void save()} returnKeyType="done"/>
  <View style={{flexDirection:'row',gap:18}}><Pressable accessibilityRole="button" disabled={busy||!draft.trim()} onPress={()=>void save()} hitSlop={8}><Text style={{color:colors.text,fontSize:15,fontWeight:'700',opacity:draft.trim()?1:0.5}}>{busy?'Saving…':'Save'}</Text></Pressable>
   <Pressable accessibilityRole="button" onPress={()=>setEditing(false)} hitSlop={8}><Text style={{color:colors.muted,fontSize:15}}>Cancel</Text></Pressable></View>
  {!!notice&&<Text style={{color:'#ef9aa1',fontSize:14}}>{notice}</Text>}
 </View>;
}

export function ContactsEditor({contacts,setContacts,myName,setMyName,onDone}:{contacts:Contact[];setContacts:(c:Contact[])=>void;myName:string;setMyName:(n:string)=>void;onDone?:()=>void}){
 const [adding,setAdding]=useState(contacts.length===0),[name,setName]=useState(''),[phone,setPhone]=useState(''),[email,setEmail]=useState(''),[mine,setMine]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const needName=!myName;
 async function add(){
  if(busy)return;setBusy(true);setNotice('');
  try{const r=await api<{contacts:Contact[]}>('/api/safety-contacts','POST',{name:name.trim(),phone:phone.trim(),email:email.trim(),...(needName?{my_name:mine.trim()}:{})});setContacts(r.contacts);if(needName)setMyName(mine.trim());setName('');setPhone('');setEmail('');setAdding(false);onDone?.();}
  catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 async function remove(id:string){try{const r=await api<{contacts:Contact[]}>('/api/safety-contacts?id='+id,'DELETE');setContacts(r.contacts);}catch(e){setNotice(errorText(e));}}
 return <View style={{gap:12}}>
  {contacts.map(c=><View key={c.id} style={{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:4}}>
   <View style={{flex:1,gap:2}}><Text style={{color:colors.text,fontSize:16,fontWeight:'700'}}>{c.name}</Text><Text style={{color:colors.muted,fontSize:13.5}}>{[c.phone,c.email].filter(Boolean).join(' · ')}</Text></View>
   <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${c.name}`} hitSlop={8} onPress={()=>void remove(c.id)}><Text style={{color:'#ef9aa1',fontSize:14.5}}>Remove</Text></Pressable>
  </View>)}
  {contacts.length>0&&!contacts.some(c=>c.email)&&<Text style={{color:'#f0c674',fontSize:13.5,lineHeight:19}}>Add an email for at least one person: that’s how BAK reaches them if you don’t check in.</Text>}
  {!needName&&<MyName myName={myName} setMyName={setMyName}/>}
  {adding?<View style={{gap:12}}>
   {needName&&<Input label="Your name, as they know you" value={mine} onChangeText={setMine} maxLength={40} autoCapitalize="words" placeholder="e.g. Kyle"/>}
   <Input label="Their name" value={name} onChangeText={setName} maxLength={60} autoCapitalize="words" placeholder="e.g. Bella"/>
   <Input label="Mobile (gets your text)" value={phone} onChangeText={setPhone} maxLength={24} keyboardType="phone-pad" placeholder="(813) 555-0123"/>
   <Input label="Email (gets the link and any alert)" value={email} onChangeText={setEmail} maxLength={200} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} placeholder="name@email.com"/>
   <Text style={{color:'#8b93a0',fontSize:12.5,lineHeight:17}}>BAK emails them once to say you added them, so an alert is never a surprise. Emails use your name, not your community name.</Text>
   <Tile title={busy?'Saving…':'Save contact'} icon="check" on onPress={()=>void add()} disabled={busy||!name.trim()||(needName&&!mine.trim())}/>
   {contacts.length>0&&<Pressable accessibilityRole="button" onPress={()=>setAdding(false)} hitSlop={8}><Text style={{color:colors.muted,fontSize:15}}>Cancel</Text></Pressable>}
  </View>:contacts.length<SAFETY.maxContacts&&<Pressable accessibilityRole="button" onPress={()=>setAdding(true)} hitSlop={8}><Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>+ Add another person</Text></Pressable>}
  {!!notice&&<Text style={{color:'#ef9aa1',fontSize:14}}>{notice}</Text>}
 </View>;
}

/** The whole flow. Not riding: contacts (if none yet), then "When will you be back?", a summary, Start. Riding: status and actions. */
export function RideSafetyPanel({track=''}:{track?:string}){
 const active=useRide(),{contacts,emailReady,setContacts,myName,setMyName}=useSafetyContacts();
 const [pick,setPick]=useState<number|null>(null),[custom,setCustom]=useState(false),[at,setAt]=useState(()=>new Date(Date.now()+3*3600e3));
 const [name,setName]=useState(()=>{try{return readProgress<string>('device','share-name','');}catch{return '';}});
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[editContacts,setEditContacts]=useState(false);
 const say=(m:string)=>setNotice(m);
 if(contacts===null)return <Text style={{color:colors.muted,fontSize:15}}>Loading…</Text>;
 if(active)return <View style={{gap:14}}>
  <RideStatusLine active={active}/>
  <Tile title={busy?'Saving…':C.stop} sub="Ends ride safety and clears your spot" icon="check" on onPress={async()=>{if(busy)return;setBusy(true);say(await endRide());setBusy(false);}}/>
  <Row>
   <Tile half title="+30 min" icon="clock" onPress={async()=>say(await extendRide(30))}/>
   <Tile half title="+1 hour" icon="clock" onPress={async()=>say(await extendRide(60))}/>
  </Row>
  <Tile title={C.send} icon="share" onPress={()=>void sendLink(active,contacts.map(c=>c.phone).filter(Boolean))}/>
  {!!notice&&<Text style={{color:colors.text,fontSize:15.5,lineHeight:21}}>{notice}</Text>}
 </View>;
 if(!contacts.length||editContacts)return <View style={{gap:12}}>
  <Text style={{color:colors.muted,fontSize:15.5,lineHeight:22}}>{contacts.length?'Your ride safety contacts.':C.noContacts}</Text>
  <ContactsEditor contacts={contacts} setContacts={setContacts} myName={myName} setMyName={setMyName} onDone={()=>setEditContacts(false)}/>
  {contacts.length>0&&<Tile title="Done" onPress={()=>setEditContacts(false)}/>}
 </View>;
 const backByMin=custom?Math.round((at.getTime()-Date.now())/60e3):pick;
 const valid=backByMin!=null&&backByMin>=SAFETY.minBackByMin&&backByMin<=SAFETY.maxBackByMin;
 const backBy=valid?new Date(Date.now()+backByMin!*60e3).toISOString():'',alertAt=valid?new Date(Date.now()+(backByMin!+SAFETY.graceMin)*60e3).toISOString():'';
 async function start(){
  if(busy||!valid)return;setBusy(true);setNotice('');
  try{writeProgress('device','share-name',name.trim());}catch{}
  const r=await startRide(backByMin!,name.trim(),track);
  if(!r.ok){setNotice(r.notice);setBusy(false);return;}
  const emails=r.contacts.filter(c=>c.has_email).map(c=>c.name);
  setNotice([emails.length?(r.emailed?`Emailed the link to ${emails.join(' and ')}.`:'The email to your contacts didn’t go through. Send the text so they have the link.'):'',
   !r.emailReady?'Alert emails aren’t switched on yet, so only your text and reminders work for now.':'',r.notice].filter(Boolean).join(' '));
  setBusy(false);
  void sendLink(undefined,r.contacts.map(c=>c.phone).filter(Boolean));
 }
 return <View style={{gap:14}}>
  <Text style={{color:colors.muted,fontSize:15.5,lineHeight:22}}>{C.explain}</Text>
  <Heading>{C.when.toUpperCase()}</Heading>
  <Row>
   {BACK_BY_CHOICES.map(m=><Tile key={m} half title={label(m)} sub={`by ${clock(new Date(Date.now()+m*60e3).toISOString())}`} on={!custom&&pick===m} onPress={()=>{setCustom(false);setPick(m);}}/>)}
   <Tile half title={C.pickTime} on={custom} onPress={()=>{setCustom(true);setPick(null);}}/>
  </Row>
  {custom&&<View style={{alignItems:'center'}}><DateTimePicker value={at} mode="time" display="spinner" minuteInterval={5} themeVariant="dark" accentColor={colors.accent} textColor={colors.text}
   onChange={(_e:DateTimePickerEvent,d?:Date)=>{if(!d)return;const n=new Date(d);if(n.getTime()<Date.now())n.setDate(n.getDate()+1);setAt(n);}} style={Platform.OS==='ios'?{height:150}:undefined}/></View>}
  <Text style={{color:'#f6dfa6',fontSize:14,lineHeight:20}}>{C.roomTip}</Text>
  {custom&&!valid&&<Text style={{color:'#ef9aa1',fontSize:14}}>Pick a time between 15 minutes and {SAFETY.maxBackByMin/60} hours from now.</Text>}
  {valid&&<>
   <Text style={{color:colors.text,fontSize:17,fontWeight:'700'}}>{C.summary(backBy,alertAt)}</Text>
   <Input label="Your name on the link" value={name} onChangeText={setName} maxLength={40} autoCapitalize="words" placeholder={myName||'e.g. Kyle'}/>
   <Tile title={busy?'Starting…':'Start ride safety'} sub={`Texts ${contacts.filter(c=>c.phone).map(c=>c.name).join(' and ')||'no one'} (you tap Send) and emails ${contacts.filter(c=>c.email).map(c=>c.name).join(' and ')||'no one'}`} icon="check" on onPress={()=>void start()}/>
  </>}
  <Text style={{color:'#8b93a0',fontSize:13,lineHeight:18}}>{alwaysHint}</Text>
  <Pressable accessibilityRole="button" onPress={()=>setEditContacts(true)} hitSlop={8}><Text style={{color:colors.muted,fontSize:14.5}}>Contacts: {contacts.map(c=>c.name).join(', ')} · Change</Text></Pressable>
  {!!notice&&<Text style={{color:colors.text,fontSize:15.5,lineHeight:21}}>{notice}</Text>}
  {!emailReady&&<Text style={{color:'#f0c674',fontSize:13.5,lineHeight:19}}>Alert emails aren’t switched on yet.</Text>}
 </View>;
}

/** The sheet, mounted once in the app shell: opened by a reminder, the Home banner or the chat offer. */
export function RideSafetyHost(){
 const [open,setOpen]=useState(false),[track,setTrack]=useState('');const insets=useSafeAreaInsets();
 useEffect(()=>{setSheetOpener(t=>{setTrack(t??'');setOpen(true);});return()=>setSheetOpener(null);},[]);
 return <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={()=>setOpen(false)}>
  <View style={{flex:1,backgroundColor:colors.bg}}>
   <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingTop:16,paddingBottom:10}}>
    <Text style={{color:colors.text,fontSize:22,...DISPLAY,letterSpacing:0,flex:1}}>{C.title}</Text>
    <Pressable accessibilityRole="button" onPress={()=>setOpen(false)} hitSlop={10}><Text style={{color:colors.text,fontSize:16,fontWeight:'700'}}>Done</Text></Pressable>
   </View>
   <ScrollView contentContainerStyle={{padding:16,paddingBottom:insets.bottom+40}} keyboardShouldPersistTaps="handled"><RideSafetyPanel track={track}/></ScrollView>
  </View>
 </Modal>;
}

/** Home: a slim bar while a ride is on, so "I'm back" is one tap from anywhere. */
export function RideSafetyBanner(){
 const active=useRide();const [msg,setMsg]=useState('');
 // After "I'm back" the banner goes; a short confirmation stays a few seconds so the rider sees it took.
 useEffect(()=>{if(active||!msg)return;const t=setTimeout(()=>setMsg(''),6000);return()=>clearTimeout(t);},[active,msg]);
 if(!active)return msg?<View style={{borderRadius:16,borderWidth:1,borderColor:'#2f5d43',backgroundColor:'#10231a',padding:12}}><Text style={{color:'#cfe9d7',fontSize:14.5,fontWeight:'700'}}>{msg}</Text></View>:null;
 const late=Date.now()>Date.parse(active.back_by);
 return <View style={{borderRadius:16,borderWidth:1,borderColor:late?'#f0c674':'#2f5d43',backgroundColor:late?'#2a2410':'#10231a',padding:12,gap:10}}>
  <Pressable accessibilityRole="button" onPress={()=>openSafety()} style={{gap:2}}>
   <Text style={{color:colors.text,fontSize:15,fontWeight:'800'}}>{late?'Past your back-by time':C.sharing}</Text>
   <Text style={{color:colors.muted,fontSize:13.5}}>{late?`Alert at ${clock(active.alert_at)} unless you check in.`:`Back by ${clock(active.back_by)}`}</Text>
  </Pressable>
  <View style={{flexDirection:'row',gap:10}}>
   <Pressable haptic="press" accessibilityRole="button" onPress={async()=>setMsg(await endRide())} style={({pressed})=>({flex:1,minHeight:44,borderRadius:12,backgroundColor:colors.accent,alignItems:'center',justifyContent:'center',opacity:pressed?0.8:1})}><Text style={{color:'#fff',fontSize:15,fontWeight:'800'}}>I’m back</Text></Pressable>
   <Pressable haptic="press" accessibilityRole="button" onPress={async()=>setMsg(await extendRide(30))} style={({pressed})=>({flex:1,minHeight:44,borderRadius:12,borderWidth:1,borderColor:'#3a414d',alignItems:'center',justifyContent:'center',opacity:pressed?0.8:1})}><Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>+30 min</Text></Pressable>
  </View>
  {!!msg&&<Text style={{color:colors.muted,fontSize:13.5}}>{msg}</Text>}
 </View>;
}
const openSafety=(track?:string)=>openSafetySheet(track);

/** Chat: one small offer under an answer when the rider is about to head out. Once a day, never while a ride is on. */
export function RideSafetyOffer({track}:{track?:string}){
 const active=useRide();const day=new Date().toDateString();
 const [hidden,setHidden]=useState(()=>{try{const v=readProgress<string>('device','safety-offer','');return v===day||v==='never';}catch{return false;}});
 if(active||hidden)return null;
 const hide=(v:string)=>{try{writeProgress('device','safety-offer',v);}catch{}setHidden(true);};
 return <View style={{borderRadius:14,borderWidth:1,borderColor:'#2c323c',backgroundColor:'#111419',padding:12,gap:8,marginTop:8}}>
  <Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>{C.offer}</Text>
  <Text style={{color:colors.muted,fontSize:13.5}}>{C.offerSub}</Text>
  <View style={{flexDirection:'row',gap:16,alignItems:'center'}}>
   <Pressable haptic="press" accessibilityRole="button" onPress={()=>{hide(day);openSafety(track);}} style={({pressed})=>({paddingHorizontal:16,paddingVertical:9,borderRadius:16,backgroundColor:colors.accent,opacity:pressed?0.8:1})}><Text style={{color:'#fff',fontSize:14.5,fontWeight:'800'}}>Start</Text></Pressable>
   <Pressable accessibilityRole="button" onPress={()=>hide(day)} hitSlop={8}><Text style={{color:colors.muted,fontSize:14.5}}>Not now</Text></Pressable>
   <Pressable accessibilityRole="button" onPress={()=>hide('never')} hitSlop={8}><Text style={{color:'#8b93a0',fontSize:13.5}}>Don’t ask again</Text></Pressable>
  </View>
 </View>;
}

/** Account › Ride safety: the contacts, and how it works in one line. */
export function SafetyContactsCard(){
 const {contacts,setContacts,emailReady,myName,setMyName}=useSafetyContacts();
 if(contacts===null)return <Text style={{color:colors.muted,fontSize:15}}>Loading…</Text>;
 return <View style={{gap:12}}>
  <Text style={{color:colors.muted,fontSize:14.5,lineHeight:20}}>Start ride safety from Ride Day mode or when BAK offers it. Your contacts get a link to where you were last seen; if you don’t check in by your back-by time plus 30 minutes (after three reminders to you), BAK emails them.</Text>
  <ContactsEditor contacts={contacts} setContacts={setContacts} myName={myName} setMyName={setMyName}/>
  {!emailReady&&<Text style={{color:'#f0c674',fontSize:13.5}}>Alert emails aren’t switched on yet.</Text>}
 </View>;
}
