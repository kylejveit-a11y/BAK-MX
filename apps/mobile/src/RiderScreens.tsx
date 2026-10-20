import React,{useCallback,useContext,useEffect,useRef,useState} from 'react';
import {Alert,Linking,Pressable,Text,View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {Bike} from '../../../shared/types';
import {COMMUNITY_RULES,EVENT_TYPE_LABELS,POST_CATEGORY_LABELS,SETUP_FIELDS,SETUP_RESULT_LABELS,riderName,setupDifferences,type Part,type PartAssembly,type PartCatalog,type Post,type PostCategory,type PostComment,type Profile,type RideEvent,type RiderRef,type SetupLog,type SetupResult,type ThreadMessage,type ThreadSummary} from '../../../shared/rider-types';
import {api} from './api';
import {adjusters,beforeYouTune,symptomGuides} from '../../../shared/setup-knowledge';
import {Button,Card,Copy,Field,Notice,Page,Select,colors} from './ui';

/* Native rider surfaces: Community, Events, Messages, Profile, Feedback, Setup log, Parts.
   All data comes from the BAK MX API. Nothing here is sample content. */

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const when=(iso:string)=>new Date(iso).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
const day=(iso:string)=>new Date(iso).toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'});
const options=<T extends string>(labels:Record<T,string>)=>(Object.entries(labels) as [T,string][]).map(([value,label])=>({value,label}));

function Tag({text,tone='info'}:{text:string;tone?:'info'|'good'|'bad'}){
 const palette={info:['#202d40','#364a65','#b6c9e7'],good:['#16261b','#3c6a4a','#bfe3c8'],bad:['#2c191c','#7d424b','#efb5be']}[tone];
 return <View style={{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:6}}><View style={{width:6,height:6,borderRadius:3,backgroundColor:palette[2]}}/><Text style={{color:palette[2],fontSize:12.5,fontWeight:'600'}}>{text}</Text></View>;
}
function Link({title,onPress,danger=false}:{title:string;onPress:()=>void;danger?:boolean}){
 return <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} style={({pressed})=>({opacity:pressed?0.5:1,paddingVertical:6})}><Text style={{color:danger?'#efb5be':colors.accent,fontSize:14,fontWeight:'600'}}>{title}</Text></Pressable>;
}
function Row({children}:{children:React.ReactNode}){return <View style={{flexDirection:'row',flexWrap:'wrap',gap:18,alignItems:'center'}}>{children}</View>;}
function Segments<T extends string>({value,items,onChange}:{value:T;items:{value:T;label:string}[];onChange:(v:T)=>void}){
 return <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{items.map(i=><Pressable key={i.value||'all'} accessibilityRole="button" accessibilityState={{selected:value===i.value}} onPress={()=>onChange(i.value)} style={{paddingVertical:8,marginRight:10,borderBottomWidth:2,borderBottomColor:value===i.value?colors.text:'transparent'}}><Text style={{color:value===i.value?colors.text:colors.muted,fontSize:14,fontWeight:'600'}}>{i.label}</Text></Pressable>)}</View>;
}

function useProfile(){
 const [profile,setProfile]=useState<Profile|null|undefined>(undefined),[error,setError]=useState('');
 const load=useCallback(async()=>{try{setProfile(await api<Profile|null>('/api/profile'));setError('');}catch(e){setError(errorText(e));setProfile(null);}},[]);
 useFocusEffect(useCallback(()=>{void load();},[load]));
 return {profile,setProfile,profileError:error};
}

/* ------------------------------------------------------------------ Profile */
export function ProfileEditor({profile,onSaved}:{profile:Profile|null;onSaved:(p:Profile)=>void}){
 const [handle,setHandle]=useState(profile?.handle??''),[name,setName]=useState(profile?.display_name??''),[location,setLocation]=useState(profile?.location??''),[riding,setRiding]=useState(profile?.riding_class??''),[bio,setBio]=useState(profile?.bio??''),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[agreed,setAgreed]=useState(false);
 useEffect(()=>{setHandle(profile?.handle??'');setName(profile?.display_name??'');setLocation(profile?.location??'');setRiding(profile?.riding_class??'');setBio(profile?.bio??'');},[profile?.user_id,profile?.updated_at]);
 async function save(){
  if(busy)return;setBusy(true);setNotice('');
  try{if(!/^[A-Za-z0-9_]{3,24}$/.test(handle.trim()))throw new Error('Handle must be 3–24 letters, numbers or underscores.');if(!profile&&!agreed)throw new Error('Agree to the community rules to create your profile.');onSaved(await api<Profile>('/api/profile','PUT',{handle:handle.trim().toLowerCase(),display_name:name,location,riding_class:riding,bio,...(profile?{}:{accept_rules:true})}));setNotice('Profile saved.');}
  catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 return <View style={{gap:12}}>
  {!profile&&<Copy>Pick a handle so other riders know who they’re talking to. You can change it later.</Copy>}
  <Field editable={!busy} label="Handle" value={handle} onChangeText={setHandle} maxLength={24} autoCorrect={false}/>
  <Field editable={!busy} label="Display name" value={name} onChangeText={setName} maxLength={60} autoCapitalize="words"/>
  <Field editable={!busy} label="Home area" value={location} onChangeText={setLocation} maxLength={80} autoCapitalize="words"/>
  <Field editable={!busy} label="Class / riding" value={riding} onChangeText={setRiding} maxLength={60}/>
  <Field editable={!busy} label="About" value={bio} onChangeText={setBio} maxLength={500} multiline autoCapitalize="sentences"/>
  {!profile&&<View style={{gap:6,borderWidth:1,borderColor:colors.line,borderRadius:12,padding:14}}><Text style={{color:colors.accent,fontSize:11,fontWeight:'800',letterSpacing:1.5}}>COMMUNITY RULES</Text>{COMMUNITY_RULES.map((r,i)=><Copy key={i}>• {r}</Copy>)}<Link title={(agreed?'☑':'☐')+' I agree to the community rules'} onPress={()=>setAgreed(!agreed)}/></View>}
  <Notice text={notice}/>
  <Button disabled={busy} title={busy?'Saving…':profile?'Save profile':'Create profile'} onPress={()=>void save()}/>
 </View>;
}
function NeedsProfile({onSaved}:{onSaved:(p:Profile)=>void}){return <Card><Copy strong>Set up your rider profile</Copy><ProfileEditor profile={null} onSaved={onSaved}/></Card>;}
export function ProfileCard(){
 const {profile,setProfile,profileError}=useProfile();
 const [blocks,setBlocks]=useState<{blocked_id:string;created_at:string}[]>([]);
 useFocusEffect(useCallback(()=>{api<{blocked_id:string;created_at:string}[]>('/api/blocks').then(setBlocks).catch(()=>setBlocks([]));},[]));
 if(profile===undefined)return null;
 return <Card><Copy strong>{profile?riderName(profile):'Rider profile'}</Copy><Notice text={profileError}/><ProfileEditor profile={profile} onSaved={setProfile}/>
  {blocks.length>0&&<View style={{gap:8}}><Copy strong>Blocked riders</Copy>{blocks.map(b=><Row key={b.blocked_id}><Copy>Blocked {day(b.created_at)}</Copy><Link title="Unblock" onPress={()=>void api('/api/blocks?user_id='+b.blocked_id,'DELETE').then(()=>setBlocks(old=>old.filter(x=>x.blocked_id!==b.blocked_id))).catch(()=>{})}/></Row>)}</View>}
 </Card>;
}
export function FeedbackCard({bike}:{bike?:Bike}){
 const [category,setCategory]=useState('missing_data'),[body,setBody]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 async function send(){if(busy||!body.trim())return;setBusy(true);setNotice('');try{await api('/api/feedback','POST',{category,body,context:{client:'native',bike:bike?`${bike.model_year} ${bike.manufacturer} ${bike.model}`:null}});setBody('');setNotice('Thanks — this goes straight to the build list.');}catch(e){setNotice(errorText(e));}finally{setBusy(false);}}
 return <Card><Copy strong>Tell us what’s missing or wrong</Copy><Copy>A wrong answer, a missing spec for your bike, a bug, an idea. Be specific; it gets read.</Copy>
  <Select disabled={busy} label="About" value={category} options={[{value:'answer_quality',label:'An answer BAK gave'},{value:'missing_data',label:'Missing data for my bike'},{value:'bug',label:'Something broken'},{value:'idea',label:'An idea'},{value:'other',label:'Something else'}]} onChange={setCategory}/>
  <Field editable={!busy} label="Details" value={body} onChangeText={setBody} multiline maxLength={4000} autoCapitalize="sentences"/>
  <Notice text={notice}/><Button disabled={busy||!body.trim()} title={busy?'Sending…':'Send feedback'} onPress={()=>void send()}/></Card>;
}

/* ------------------------------------------------------------------ Report / block */
function RiderActions({rider,target,onBlocked,onMessage}:{rider:RiderRef;target:{type:'post'|'comment'|'event'|'message'|'profile';id:string};onBlocked:()=>void;onMessage?:(r:RiderRef)=>void}){
 const [reporting,setReporting]=useState(false),[reason,setReason]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 async function report(){if(busy||!reason.trim())return;setBusy(true);try{await api('/api/reports','POST',{target_type:target.type,target_id:target.id,reason});setReporting(false);setReason('');setNotice('Report received. We review reports and remove content that breaks the rules.');}catch(e){setNotice(errorText(e));}finally{setBusy(false);}}
 const block=()=>Alert.alert(`Block ${riderName(rider)}?`,'You won’t see their posts, events or messages, and they won’t see yours.',[{text:'Cancel',style:'cancel'},{text:'Block',style:'destructive',onPress:()=>void api('/api/blocks?user_id='+rider.user_id,'PUT').then(onBlocked).catch(e=>setNotice(errorText(e)))}]);
 return <View style={{gap:8}}>
  <Row>{onMessage&&<Link title="Message" onPress={()=>onMessage(rider)}/>}<Link title="Report" onPress={()=>setReporting(!reporting)}/><Link title="Block" onPress={block}/></Row>
  {reporting&&<><Field label="What’s wrong with this?" value={reason} onChangeText={setReason} multiline maxLength={1000} autoCapitalize="sentences"/><Button secondary disabled={busy||!reason.trim()} title="Send report" onPress={()=>void report()}/></>}
  <Notice text={notice}/>
 </View>;
}

/* ------------------------------------------------------------------ Community */
export function CommunityScreen({bike,onMessage}:{bike?:Bike;onMessage:(r:RiderRef)=>void}){
 const {profile,setProfile}=useProfile();
 const [posts,setPosts]=useState<Post[]>([]),[filter,setFilter]=useState<PostCategory|''>(''),[notice,setNotice]=useState(''),[loading,setLoading]=useState(false),[composing,setComposing]=useState(false),[category,setCategory]=useState<PostCategory>('setup_question'),[body,setBody]=useState(''),[tagBike,setTagBike]=useState(true),[busy,setBusy]=useState(false),[open,setOpen]=useState(''),[viewing,setViewing]=useState('');
 const run=useRef(0);
 const load=useCallback(async()=>{const mine=++run.current;setLoading(true);try{const data=await api<Post[]>('/api/posts'+(filter?'?category='+filter:''));if(mine===run.current){setPosts(data);setNotice('');}}catch(e){if(mine===run.current)setNotice(errorText(e));}finally{if(mine===run.current)setLoading(false);}},[filter]);
 useFocusEffect(useCallback(()=>{if(profile)void load();},[load,profile?.user_id]));
 async function publish(){if(busy||!body.trim())return;setBusy(true);try{await api('/api/posts','POST',{category,body,bike_label:tagBike&&bike?`${bike.model_year} ${bike.manufacturer} ${bike.model}`:''});setBody('');setComposing(false);await load();}catch(e){setNotice(errorText(e));}finally{setBusy(false);}}
 async function like(p:Post){setPosts(old=>old.map(x=>x.id===p.id?{...x,liked:!p.liked,like_count:p.like_count+(p.liked?-1:1)}:x));try{await api('/api/likes?post_id='+p.id,p.liked?'DELETE':'PUT');}catch(e){setNotice(errorText(e));void load();}}
 if(viewing)return <RiderProfileView riderId={viewing} onBack={()=>setViewing('')} onMessage={r=>{setViewing('');onMessage(r);}}/>;
 if(profile===undefined)return <Page title="Community"><Copy>Loading…</Copy></Page>;
 if(!profile)return <Page title="Community"><Copy>Builds, setup questions and ride plans from riders on gas MX bikes.</Copy><NeedsProfile onSaved={setProfile}/></Page>;
 return <Page title="Community">
  <Segments value={filter} items={[{value:'' as PostCategory|'',label:'All'},...options(POST_CATEGORY_LABELS)]} onChange={setFilter}/>
  <Button title={composing?'Cancel':'New post'} secondary={composing} onPress={()=>setComposing(!composing)}/>
  {composing&&<Card><Select disabled={busy} label="Kind of post" value={category} options={options(POST_CATEGORY_LABELS)} onChange={v=>setCategory(v as PostCategory)}/>
   <Field editable={!busy} label="Post" value={body} onChangeText={setBody} multiline maxLength={4000} autoCapitalize="sentences"/>
   {bike&&<Link title={(tagBike?'✓ Tagging ':'Tag ')+`my ${bike.model_year} ${bike.manufacturer} ${bike.model}`} onPress={()=>setTagBike(!tagBike)}/>}
   <Button disabled={busy||!body.trim()} title={busy?'Posting…':'Post'} onPress={()=>void publish()}/></Card>}
  <Notice text={notice}/>
  {loading&&!posts.length&&<Copy>Loading the feed…</Copy>}
  {!loading&&!posts.length&&<Card><Copy strong>Nothing here yet.</Copy><Copy>Be the first to post a build, a setup question or a ride plan.</Copy></Card>}
  {posts.map(p=><Card key={p.id}>
   <View style={{flexDirection:'row',gap:12,alignItems:'center'}}><View style={{width:40,height:40,borderRadius:20,backgroundColor:'#1d2531',borderWidth:1,borderColor:'#3a4658',alignItems:'center',justifyContent:'center'}}><Text style={{color:colors.text,fontWeight:'700'}}>{riderName(p.author).replace('@','').slice(0,1).toUpperCase()}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={'View '+riderName(p.author)} onPress={()=>setViewing(p.user_id)} style={{flex:1}}><Text style={{color:colors.text,fontSize:15,fontWeight:'700'}}>{riderName(p.author)}</Text><Text style={{color:colors.muted,fontSize:12}}>@{p.author.handle}{p.author.location?' · '+p.author.location:''} · {when(p.created_at)}</Text></Pressable></View>
   <Row><Tag text={POST_CATEGORY_LABELS[p.category]}/>{!!p.bike_label&&<Text style={{color:colors.primary,fontSize:12}}>{p.bike_label}</Text>}</Row>
   <Text selectable style={{color:colors.text,fontSize:16,lineHeight:24}}>{p.body}</Text>
   <Row><Link title={(p.liked?'♥ ':'♡ ')+p.like_count} onPress={()=>void like(p)}/><Link title={`${p.comment_count} ${p.comment_count===1?'comment':'comments'}`} onPress={()=>setOpen(open===p.id?'':p.id)}/>{p.mine&&<Link danger title="Delete" onPress={()=>Alert.alert('Delete this post?','',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>void api('/api/posts?id='+p.id,'DELETE').then(load).catch(e=>setNotice(errorText(e)))}])}/>}</Row>
   {!p.mine&&<RiderActions rider={p.author} target={{type:'post',id:p.id}} onMessage={onMessage} onBlocked={()=>setPosts(old=>old.filter(x=>x.user_id!==p.user_id))}/>}
   {open===p.id&&<Comments postId={p.id} onCount={n=>setPosts(old=>old.map(x=>x.id===p.id?{...x,comment_count:n}:x))}/>}
  </Card>)}
 </Page>;
}
function Comments({postId,onCount}:{postId:string;onCount:(n:number)=>void}){
 const [comments,setComments]=useState<PostComment[]>([]),[text,setText]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const load=useCallback(async()=>{try{const data=await api<PostComment[]>('/api/comments?post_id='+postId);setComments(data);onCount(data.length);}catch(e){setNotice(errorText(e));}},[postId]);
 useEffect(()=>{void load();},[load]);
 async function add(){if(busy||!text.trim())return;setBusy(true);try{await api('/api/comments','POST',{post_id:postId,body:text});setText('');await load();}catch(e){setNotice(errorText(e));}finally{setBusy(false);}}
 return <View style={{gap:10,borderTopWidth:1,borderTopColor:colors.line,paddingTop:12}}>
  {comments.map(c=><View key={c.id} style={{gap:2}}><Text style={{color:colors.text,fontWeight:'700',fontSize:13}}>{riderName(c.author)} <Text style={{color:colors.muted,fontWeight:'400'}}>· {when(c.created_at)}</Text></Text><Text selectable style={{color:colors.text,fontSize:15,lineHeight:22}}>{c.body}</Text>{c.mine&&<Link danger title="Delete" onPress={()=>void api('/api/comments?id='+c.id,'DELETE').then(load).catch(e=>setNotice(errorText(e)))}/>}</View>)}
  <Notice text={notice}/><Field editable={!busy} label="Add a comment" value={text} onChangeText={setText} maxLength={2000} autoCapitalize="sentences"/><Button secondary disabled={busy||!text.trim()} title="Comment" onPress={()=>void add()}/>
 </View>;
}

/* ------------------------------------------------------------------ Events */
const localStamp=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
/** Parse "YYYY-MM-DD HH:MM" as local time; reject anything that does not round-trip. */
export function parseLocalStamp(value:string):Date|null{
 const m=/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(value.trim());if(!m)return null;
 const d=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]),Number(m[4]),Number(m[5]));
 return localStamp(d)===`${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}`?d:null;
}
export function EventsScreen({onMessage}:{onMessage:(r:RiderRef)=>void}){
 const {profile,setProfile}=useProfile();
 const [events,setEvents]=useState<RideEvent[]>([]),[scope,setScope]=useState<'upcoming'|'past'>('upcoming'),[notice,setNotice]=useState(''),[loading,setLoading]=useState(false),[creating,setCreating]=useState(false),[busy,setBusy]=useState(false),[open,setOpen]=useState('');
 const [title,setTitle]=useState(''),[type,setType]=useState('practice'),[starts,setStarts]=useState(()=>{const d=new Date(Date.now()+86400000);d.setHours(9,0,0,0);return localStamp(d);}),[ends,setEnds]=useState(''),[place,setPlace]=useState(''),[details,setDetails]=useState('');
 const load=useCallback(async()=>{setLoading(true);try{setEvents(await api<RideEvent[]>('/api/events?scope='+scope));setNotice('');}catch(e){setNotice(errorText(e));}finally{setLoading(false);}},[scope]);
 useFocusEffect(useCallback(()=>{if(profile)void load();},[load,profile?.user_id]));
 async function create(){
  if(busy)return;setBusy(true);
  try{
   const start=parseLocalStamp(starts),end=ends.trim()?parseLocalStamp(ends):null;
   if(!title.trim()||!place.trim())throw new Error('Enter the event name and the track or location.');
   if(!start||(ends.trim()&&!end))throw new Error('Enter dates as YYYY-MM-DD HH:MM, for example 2026-11-07 09:00.');
   await api('/api/events','POST',{title,event_type:type,starts_at:start.toISOString(),ends_at:end?end.toISOString():null,location_name:place,description:details});
   setTitle('');setPlace('');setDetails('');setEnds('');setCreating(false);setScope('upcoming');await load();
  }catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 async function rsvp(ev:RideEvent,status:'going'|'interested'){try{if(ev.my_rsvp===status)await api('/api/rsvps?event_id='+ev.id,'DELETE');else await api('/api/rsvps','PUT',{event_id:ev.id,status});await load();}catch(e){setNotice(errorText(e));}}
 if(profile===undefined)return <Page title="Events"><Copy>Loading…</Copy></Page>;
 if(!profile)return <Page title="Events"><Copy>Ride days, races, practice nights, clinics and meetups posted by riders.</Copy><NeedsProfile onSaved={setProfile}/></Page>;
 return <Page title="Events">
  <Segments value={scope} items={[{value:'upcoming',label:'Upcoming'},{value:'past',label:'Past'}]} onChange={setScope}/>
  <Button title={creating?'Cancel':'Create event'} secondary={creating} onPress={()=>setCreating(!creating)}/>
  {creating&&<Card>
   <Field editable={!busy} label="Event name" value={title} onChangeText={setTitle} maxLength={120} autoCapitalize="sentences"/>
   <Select disabled={busy} label="Type" value={type} options={options(EVENT_TYPE_LABELS)} onChange={setType}/>
   <Field editable={!busy} label="Starts (YYYY-MM-DD HH:MM)" value={starts} onChangeText={setStarts} keyboardType="numbers-and-punctuation"/>
   <Field editable={!busy} label="Ends (optional)" value={ends} onChangeText={setEnds} keyboardType="numbers-and-punctuation"/>
   <Field editable={!busy} label="Track or location" value={place} onChangeText={setPlace} maxLength={160} autoCapitalize="words"/>
   <Field editable={!busy} label="Details" value={details} onChangeText={setDetails} multiline maxLength={4000} autoCapitalize="sentences"/>
   <Button disabled={busy} title={busy?'Saving…':'Publish event'} onPress={()=>void create()}/></Card>}
  <Notice text={notice}/>
  {loading&&!events.length&&<Copy>Loading events…</Copy>}
  {!loading&&!events.length&&<Card><Copy strong>{scope==='upcoming'?'No upcoming events yet.':'No past events.'}</Copy><Copy>{scope==='upcoming'?'Post the next ride day or practice night so other riders can plan around it.':'Events you could see are listed here after they happen.'}</Copy></Card>}
  {events.map(ev=><Card key={ev.id}>
   <Row><Tag text={EVENT_TYPE_LABELS[ev.event_type]}/>{ev.canceled_at?<Tag tone="bad" text="Canceled"/>:ev.my_rsvp?<Tag tone="good" text={ev.my_rsvp==='going'?'You’re going':'Interested'}/>:null}</Row>
   <Text style={{color:ev.canceled_at?colors.muted:colors.text,fontSize:19,fontWeight:'700',textDecorationLine:ev.canceled_at?'line-through':'none'}}>{ev.title}</Text>
   <Copy>{when(ev.starts_at)}{ev.ends_at?' – '+when(ev.ends_at):''}{'\n'}{ev.location_name}</Copy>
   <Copy>Hosted by {riderName(ev.host)} · {ev.going_count} going · {ev.interested_count} interested</Copy>
   {open===ev.id&&!!ev.description&&<Text selectable style={{color:colors.text,fontSize:15,lineHeight:23}}>{ev.description}</Text>}
   {!ev.canceled_at&&scope==='upcoming'&&<View style={{flexDirection:'row',gap:10}}><View style={{flex:1}}><Button secondary={ev.my_rsvp!=='going'} title={ev.my_rsvp==='going'?'✓ Going':'I’m going'} onPress={()=>void rsvp(ev,'going')}/></View><View style={{flex:1}}><Button secondary title={ev.my_rsvp==='interested'?'✓ Interested':'Interested'} onPress={()=>void rsvp(ev,'interested')}/></View></View>}
   <Row>{!!ev.description&&<Link title={open===ev.id?'Hide details':'Details'} onPress={()=>setOpen(open===ev.id?'':ev.id)}/>}
    {ev.mine&&<Link title={ev.canceled_at?'Restore event':'Cancel event'} onPress={()=>void api('/api/events?id='+ev.id,'PATCH',{canceled:!ev.canceled_at}).then(load).catch(e=>setNotice(errorText(e)))}/>}
    {ev.mine&&<Link danger title="Delete" onPress={()=>Alert.alert('Delete this event?','',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>void api('/api/events?id='+ev.id,'DELETE').then(load).catch(e=>setNotice(errorText(e)))}])}/>}</Row>
   {!ev.mine&&<RiderActions rider={ev.host} target={{type:'event',id:ev.id}} onMessage={onMessage} onBlocked={()=>void load()}/>}
  </Card>)}
 </Page>;
}

/* ------------------------------------------------------------------ Messages */
export function MessagesScreen({startWith,onStarted}:{startWith?:RiderRef;onStarted:()=>void}){
 const {profile,setProfile}=useProfile();
 const [threads,setThreads]=useState<ThreadSummary[]>([]),[active,setActive]=useState<RiderRef|null>(null),[messages,setMessages]=useState<ThreadMessage[]>([]),[text,setText]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const loadThreads=useCallback(async()=>{try{setThreads(await api<ThreadSummary[]>('/api/threads'));}catch(e){setNotice(errorText(e));}},[]);
 const open=useCallback(async(rider:RiderRef)=>{setActive(rider);setMessages([]);setNotice('');try{const data=await api<{messages:ThreadMessage[]}>('/api/thread?with='+rider.user_id);setMessages(data.messages);void loadThreads();}catch(e){setNotice(errorText(e));}},[loadThreads]);
 useFocusEffect(useCallback(()=>{if(profile)void loadThreads();},[loadThreads,profile?.user_id]));
 useEffect(()=>{if(startWith&&profile){void open(startWith);onStarted();}},[startWith?.user_id,profile?.user_id]);
 async function send(){if(busy||!active||!text.trim())return;setBusy(true);try{const sent=await api<ThreadMessage>('/api/thread','POST',{recipient_id:active.user_id,body:text});setMessages(old=>[...old,sent]);setText('');void loadThreads();}catch(e){setNotice(errorText(e));}finally{setBusy(false);}}
 if(profile===undefined)return <Page title="Messages"><Copy>Loading…</Copy></Page>;
 if(!profile)return <Page title="Messages"><Copy>Message a rider from a post or an event.</Copy><NeedsProfile onSaved={setProfile}/></Page>;
 if(!active)return <Page title="Messages"><Notice text={notice}/>
  {!threads.length&&<Card><Copy strong>No conversations yet.</Copy><Copy>Use “Message” on a post or event to start one. Messages are private between you and the other rider.</Copy></Card>}
  {threads.map(t=><Pressable key={t.rider.user_id} accessibilityRole="button" onPress={()=>void open(t.rider)} style={({pressed})=>({opacity:pressed?0.6:1})}><Card><Row><Text style={{color:colors.text,fontSize:17,fontWeight:'700'}}>{riderName(t.rider)}</Text>{t.unread>0&&<Tag tone="good" text={`${t.unread} new`}/>}</Row><Copy>{t.last_message.mine?'You: ':''}{t.last_message.body.slice(0,90)}</Copy><Text style={{color:colors.muted,fontSize:12}}>{when(t.last_message.created_at)}</Text></Card></Pressable>)}
 </Page>;
 return <Page title={riderName(active)}>
  <Link title="‹ All messages" onPress={()=>{setActive(null);void loadThreads();}}/>
  <Notice text={notice}/>
  {!messages.length&&<Copy>No messages yet. Say hello.</Copy>}
  {messages.map(m=><View key={m.id} style={{alignSelf:m.mine?'flex-end':'flex-start',maxWidth:'88%',backgroundColor:m.mine?'#1b2a44':colors.panel,borderWidth:1,borderColor:colors.line,borderRadius:16,padding:13,gap:4}}><Text selectable style={{color:colors.text,fontSize:16,lineHeight:23}}>{m.body}</Text><Text style={{color:colors.muted,fontSize:11}}>{when(m.created_at)}</Text></View>)}
  <Field editable={!busy} label={'Message '+riderName(active)} value={text} onChangeText={setText} multiline maxLength={4000} autoCapitalize="sentences"/>
  <Button disabled={busy||!text.trim()} title={busy?'Sending…':'Send'} onPress={()=>void send()}/>
  <RiderActions rider={active} target={{type:'profile',id:active.user_id}} onBlocked={()=>{setActive(null);void loadThreads();}}/>
 </Page>;
}

/* ------------------------------------------------------------------ Setup log */
export function SetupLogCard({bike,onAsk}:{bike?:Bike;onAsk:(text:string)=>void}){
 const [logs,setLogs]=useState<SetupLog[]>([]),[adding,setAdding]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');const [showMore,setShowMore]=useState(false);
 const [date,setDate]=useState(()=>new Date().toISOString().slice(0,10)),[track,setTrack]=useState(''),[conditions,setConditions]=useState(''),[hours,setHours]=useState(''),[settings,setSettings]=useState<Record<string,string>>({}),[change,setChange]=useState(''),[result,setResult]=useState<SetupResult>('not_tested'),[notes,setNotes]=useState('');
 const load=useCallback(async()=>{if(!bike)return;try{setLogs(await api<SetupLog[]>('/api/setup-logs?bike_id='+bike.id));setNotice('');}catch(e){setNotice(errorText(e));}},[bike?.id]);
 useFocusEffect(useCallback(()=>{setLogs([]);void load();},[load]));
 function begin(){const latest=logs[0];setSettings(Object.fromEntries(SETUP_FIELDS.map(f=>[f.key,latest?.settings[f.key]==null?'':String(latest.settings[f.key])])));setHours(bike?.engine_hours?.toString()??'');setChange('');setNotes('');setResult('not_tested');setAdding(true);}
 async function save(){
  if(busy||!bike)return;setBusy(true);
  try{
   if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T12:00:00')))throw new Error('Enter the date as YYYY-MM-DD.');
   const h=hours.trim()?Number(hours):null;if(h!==null&&(!Number.isFinite(h)||h<0))throw new Error('Hours must be zero or greater.');
   await api('/api/setup-logs','POST',{bike_id:bike.id,recorded_at:new Date(date+'T12:00:00').toISOString(),track,conditions,engine_hours:h,settings:Object.fromEntries(SETUP_FIELDS.map(f=>[f.key,settings[f.key]?.trim()||null])),change_made:change,result,notes});
   setAdding(false);await load();
  }catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 const describe=(log:SetupLog)=>SETUP_FIELDS.filter(f=>log.settings[f.key]!=null&&log.settings[f.key]!=='').map(f=>`${f.label}: ${log.settings[f.key]}`).join('; ');
 if(!bike)return null;
 return <View style={{gap:16}}>
  <Card><Copy strong>Setup log</Copy><Copy>One change, how it rode. That’s it.</Copy><Notice text={notice}/>
   <Button title={adding?'Cancel':'Log a setup'} secondary={adding} onPress={()=>adding?setAdding(false):begin()}/>
   {adding&&<View style={{gap:12}}>
    <Field editable={!busy} label="What did you change?" placeholder="Fork comp 2 softer" value={change} onChangeText={setChange} maxLength={1000} autoCapitalize="sentences"/>
    <Select disabled={busy} label="How was it?" value={result} options={options(SETUP_RESULT_LABELS)} onChange={v=>setResult(v as SetupResult)}/>
    <Field editable={!busy} label="Track" placeholder="Dade City" value={track} onChangeText={setTrack} maxLength={120} autoCapitalize="words"/>
    <Field editable={!busy} label="Notes" placeholder="Better in the ruts, still kicks in the whoops" value={notes} onChangeText={setNotes} multiline maxLength={4000} autoCapitalize="sentences"/>
    <Pressable accessibilityRole="button" onPress={()=>setShowMore(!showMore)}><Text style={{color:colors.accent,fontWeight:'700'}}>{showMore?'Hide conditions and settings':'Conditions, date, hours and full settings'}</Text></Pressable>
    {showMore&&<>
    <Field editable={!busy} label="Conditions" placeholder="Sand, hard-pack, wet…" value={conditions} onChangeText={setConditions} maxLength={200} autoCapitalize="sentences"/>
    <Field editable={!busy} label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} keyboardType="numbers-and-punctuation"/>
    <Field editable={!busy} label="Hours" value={hours} onChangeText={setHours} keyboardType="decimal-pad"/>
    {(['Fork','Shock','Chassis','Engine'] as const).map(group=><View key={group} style={{gap:10}}><Text style={{color:colors.accent,fontSize:12,fontWeight:'800',letterSpacing:2}}>{group.toUpperCase()}</Text>{SETUP_FIELDS.filter(f=>f.group===group).map(f=><Field editable={!busy} key={f.key} label={f.label} value={settings[f.key]??''} onChangeText={v=>setSettings(old=>({...old,[f.key]:v}))} maxLength={200}/>)}</View>)}
    </>}
    <Button disabled={busy} title={busy?'Saving…':'Save'} onPress={()=>void save()}/>
   </View>}
   {!logs.length&&!adding&&<Copy>Log one change and how it rode. Next time at this track you’ll know what worked.</Copy>}
  </Card>
  {logs.map((log,i)=>{const prior=logs[i+1],diff=prior?setupDifferences(prior.settings,log.settings):[];return <Card key={log.id}>
   <Row><Tag tone={log.result==='better'?'good':log.result==='worse'?'bad':'info'} text={SETUP_RESULT_LABELS[log.result]}/><Text style={{color:colors.muted,fontSize:12}}>{day(log.recorded_at)}{log.engine_hours!==null?` · ${log.engine_hours} h`:''}</Text></Row>
   <Text style={{color:colors.text,fontSize:18,fontWeight:'700'}}>{log.track||'Track not recorded'}</Text>
   {!!log.conditions&&<Copy>{log.conditions}</Copy>}
   {!!log.change_made&&<Text style={{color:colors.text,fontSize:15,lineHeight:22}}>Changed: {log.change_made}</Text>}
   {diff.map(d=><Text key={d.key} style={{color:colors.primary,fontSize:14,lineHeight:21}}>• {d.label}: {d.from} → {d.to}</Text>)}
   {!!log.notes&&<Text selectable style={{color:colors.text,fontSize:15,lineHeight:22}}>{log.notes}</Text>}
   <Copy>{describe(log)||'No settings recorded.'}</Copy>
   <Row><Link title="Ask BAK about this" onPress={()=>onAsk(`Setup log from ${day(log.recorded_at)}${log.track?' at '+log.track:''}${log.conditions?' ('+log.conditions+')':''}. Settings: ${describe(log)||'none recorded'}.${log.change_made?' Change made: '+log.change_made+'.':''} Result: ${SETUP_RESULT_LABELS[log.result]}.${log.notes?' Notes: '+log.notes:''}\n\nWhat should I try next?`)}/><Link danger title="Delete" onPress={()=>Alert.alert('Delete this setup entry?','',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>void api('/api/setup-logs?id='+log.id,'DELETE').then(load).catch(e=>setNotice(errorText(e)))}])}/></Row>
  </Card>;})}
 </View>;
}

/* ------------------------------------------------------------------ Parts catalog */
export function PartsCatalogCard({bike}:{bike?:Bike}){
 const [catalog,setCatalog]=useState<PartCatalog|null|undefined>(undefined),[assemblies,setAssemblies]=useState<PartAssembly[]>([]),[open,setOpen]=useState(''),[parts,setParts]=useState<Part[]>([]),[find,setFind]=useState(''),[notice,setNotice]=useState('');
 useEffect(()=>{let live=true;setCatalog(undefined);setAssemblies([]);setOpen('');setParts([]);setNotice('');if(bike)api<{catalog:PartCatalog|null;assemblies:PartAssembly[]}>('/api/parts/catalog?bike_id='+bike.id).then(d=>{if(live){setCatalog(d.catalog);setAssemblies(d.assemblies);}}).catch(e=>{if(live){setNotice(errorText(e));setCatalog(null);}});return()=>{live=false;};},[bike?.id]);
 async function show(a:PartAssembly){if(open===a.id){setOpen('');return;}setOpen(a.id);setParts([]);try{setParts(await api<Part[]>('/api/parts?assembly_id='+a.id));}catch(e){setNotice(errorText(e));}}
 if(!bike||catalog===undefined)return null;
 const shown=assemblies.filter(a=>a.name.toLowerCase().includes(find.trim().toLowerCase()));
 return <Card><Copy strong>Parts catalog</Copy><Notice text={notice}/>
  {!catalog?<Copy>No parts catalog for this exact bike yet. Catalogs are loaded per model year, variant and region; a neighbouring year is never shown in its place.</Copy>:<>
   <Copy>{catalog.source}{catalog.complete?'':' · partial capture'} · {catalog.assembly_count} assemblies · {catalog.part_count} part entries</Copy>
   <Field label="Find an assembly" value={find} onChangeText={setFind}/>
   {shown.map(a=><View key={a.id} style={{borderTopWidth:1,borderTopColor:colors.line,paddingTop:10,gap:8}}>
    <Pressable accessibilityRole="button" accessibilityState={{expanded:open===a.id}} onPress={()=>void show(a)} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',minHeight:40}}><Text style={{color:colors.text,fontSize:16,flex:1}}>{a.name}</Text><Text style={{color:colors.accent,fontSize:20}}>{open===a.id?'⌄':'›'}</Text></Pressable>
    {open===a.id&&<View style={{gap:8}}>
     {/^https:\/\//.test(a.diagram_url)&&<Link title="Open exploded diagram" onPress={()=>void Linking.openURL(a.diagram_url).catch(e=>setNotice(errorText(e)))}/>}
     {!parts.length?<Copy>Loading parts…</Copy>:parts.map(p=><View key={p.id} style={{flexDirection:'row',gap:10}}><Text style={{color:colors.accent,width:30,fontWeight:'700'}}>{p.callout}</Text><View style={{flex:1}}><Text selectable style={{color:colors.text,fontSize:15}}>{p.description}</Text><Text selectable style={{color:colors.muted,fontSize:13}}>{p.part_number||'No part number'} · Qty {p.quantity_raw||'—'}{p.remarks?' · '+p.remarks:''}</Text></View></View>)}
     <Copy>Catalog quantities are per assembly as published, not whole-bike totals.</Copy>
    </View>}
   </View>)}
  </>}
 </Card>;
}

/* ------------------------------------------------------------------ Setup guide */
export function SetupGuideCard({onAsk}:{onAsk?:(text:string)=>void}){
 const [view,setView]=useState<'feel'|'adjusters'>('feel'),[open,setOpen]=useState('');
 const head=(id:string,label:string,sub?:string)=><Pressable accessibilityRole="button" accessibilityState={{expanded:open===id}} onPress={()=>setOpen(open===id?'':id)} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',minHeight:44,borderTopWidth:1,borderTopColor:colors.line,paddingTop:10}}><View style={{flex:1}}><Text style={{color:colors.text,fontSize:16,fontWeight:'600'}}>{label}</Text>{!!sub&&<Text style={{color:colors.muted,fontSize:12}}>{sub}</Text>}</View><Text style={{color:colors.accent,fontSize:20}}>{open===id?'⌄':'›'}</Text></Pressable>;
 return <Card><Copy strong>Setup guide</Copy><Copy>What each adjustment does and where to start for what you’re feeling. Direction only — your bike’s published settings live in Specs.</Copy>
  <Segments value={view} items={[{value:'feel',label:'By what you feel'},{value:'adjusters',label:'By adjustment'}]} onChange={v=>{setView(v);setOpen('');}}/>
  {view==='feel'?symptomGuides.map(g=><View key={g.id} style={{gap:8}}>{head(g.id,`“${g.rider_says[0]}”`,g.rider_says.slice(1,4).join(', '))}
   {open===g.id&&<View style={{gap:8}}><Copy>{g.where}</Copy><Text style={{color:colors.accent,fontSize:11,fontWeight:'800',letterSpacing:1.5}}>CHECK FIRST</Text>{g.check_first.map((c,i)=><Text key={i} style={{color:colors.text,fontSize:15,lineHeight:22}}>• {c}</Text>)}<Text style={{color:colors.accent,fontSize:11,fontWeight:'800',letterSpacing:1.5}}>LIKELY CAUSES</Text>{g.likely.map((l,i)=><View key={i} style={{gap:2}}><Text style={{color:colors.text,fontSize:15,fontWeight:'700',lineHeight:22}}>{l.cause}</Text><Copy>{l.tell}</Copy><Text style={{color:colors.primary,fontSize:15,lineHeight:22}}>First change: {l.first_change}</Text></View>)}{onAsk&&<Link title="Ask BAK about this on my bike" onPress={()=>onAsk(`My bike ${g.rider_says[0]}. `)}/>}</View>}</View>)
  :adjusters.map(a=><View key={a.id} style={{gap:8}}>{head(a.id,a.name)}
   {open===a.id&&<View style={{gap:8}}><Text style={{color:colors.text,fontSize:15,lineHeight:22}}>{a.controls}</Text><Text style={{color:colors.accent,fontSize:11,fontWeight:'800',letterSpacing:1.5}}>FIRMER / MORE</Text><Text style={{color:colors.text,fontSize:15,lineHeight:22}}>{a.firmer_or_more}</Text><Copy>Too much: {a.too_much}</Copy><Text style={{color:colors.accent,fontSize:11,fontWeight:'800',letterSpacing:1.5}}>SOFTER / LESS</Text><Text style={{color:colors.text,fontSize:15,lineHeight:22}}>{a.softer_or_less}</Text><Copy>Too little: {a.too_little}</Copy><Copy>{a.notes}</Copy></View>}</View>)}
  <Text style={{color:colors.accent,fontSize:11,fontWeight:'800',letterSpacing:1.5,marginTop:6}}>BEFORE YOU TOUCH A CLICKER</Text>{beforeYouTune.map((b,i)=><Copy key={i}>• {b}</Copy>)}
 </Card>;
}

/* ------------------------------------------------------------------ Rider profile */
export function RiderProfileView({riderId,onBack,onMessage}:{riderId:string;onBack:()=>void;onMessage:(r:RiderRef)=>void}){
 const [data,setData]=useState<{profile:Profile;posts:{id:string;category:PostCategory;body:string;bike_label:string;created_at:string}[];mine:boolean}|null>(null),[notice,setNotice]=useState('');
 useEffect(()=>{let live=true;setData(null);setNotice('');api<NonNullable<typeof data>>('/api/profiles?id='+riderId).then(d=>{if(live)setData(d);}).catch(e=>{if(live)setNotice(errorText(e));});return()=>{live=false;};},[riderId]);
 return <Page title={data?riderName(data.profile):'Rider'}><Link title="‹ Back to the feed" onPress={onBack}/><Notice text={notice}/>
  {!data&&!notice&&<Copy>Loading rider…</Copy>}
  {data&&<><Card><Copy>@{data.profile.handle}{data.profile.location?' · '+data.profile.location:''}{data.profile.riding_class?' · '+data.profile.riding_class:''}</Copy>{!!data.profile.bio&&<Text selectable style={{color:colors.text,fontSize:16,lineHeight:24}}>{data.profile.bio}</Text>}<Copy>Riding with BAK MX since {new Date(data.profile.created_at).toLocaleDateString([],{month:'long',year:'numeric'})}</Copy>{!data.mine&&<RiderActions rider={data.profile} target={{type:'profile',id:data.profile.user_id}} onMessage={onMessage} onBlocked={onBack}/>}</Card>
   <Copy strong>Recent posts</Copy>{!data.posts.length&&<Copy>No posts yet.</Copy>}
   {data.posts.map(p=><Card key={p.id}><Row><Tag text={POST_CATEGORY_LABELS[p.category]}/>{!!p.bike_label&&<Text style={{color:colors.primary,fontSize:12}}>{p.bike_label}</Text>}</Row><Text selectable style={{color:colors.text,fontSize:16,lineHeight:24}}>{p.body}</Text><Text style={{color:colors.muted,fontSize:12}}>{when(p.created_at)}</Text></Card>)}</>}
 </Page>;
}
