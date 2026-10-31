import {garageModelInfo} from '../../../shared/garage-models';
import {PublicGarage,type PublicBike} from './GarageSharing';
import {RacePlate} from './RacePlate';
import {motion} from './theme';
import {usedLinkTokens} from './appLinks';
import {PART_AREAS,partArea,niceName} from '../../../shared/specs-view';
import React,{useCallback,useContext,useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Alert,Animated,Image,KeyboardAvoidingView,Linking,Modal,Platform,ScrollView,Share,StyleSheet,Text,TextInput,View} from 'react-native';
import {Pressable} from './Touch';
import {success} from './haptics';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {tap as hTap,select as hSelect} from './haptics';
import {useFocusEffect} from '@react-navigation/native';
import {DateField,rideDays,recentDays} from './DateSheet';
import {AttachedPhotos,PostPhotos} from './PhotoUI';
import {addPhotos,pickImages,uploadPhoto,type Photo} from './photos';
import type {Bike} from '../../../shared/types';
import {COMMUNITY_RULES,EVENT_TYPE_LABELS,POST_CATEGORY_LABELS,SETUP_FIELDS,SETUP_RESULT_LABELS,riderName,setupDifferences,type Part,type PartAssembly,type PartCatalog,type Post,type PostCategory,type PostComment,type Profile,type RideEvent,type RiderRef,type SetupLog,type SetupResult,type ThreadMessage,type ThreadSummary} from '../../../shared/rider-types';
import {setupLogsWithPending} from './HomeBlocks';
import {api,apiQueued} from './api';
import {adjusters,beforeYouTune,symptomGuides} from '../../../shared/setup-knowledge';
import {BlueFace,blueLift,onBlueText,Avatar,BackLink,Button,Card,CheckRow,Copy,Eyebrow,Field,Icon,IconAction,type IconName,Notice,Page,SectionHead,Tile,TileGrid,colors} from './ui';

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
 return <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} style={({pressed})=>({opacity:pressed?0.5:1,paddingVertical:6})}><Text style={{color:danger?'#efb5be':colors.text,fontSize:14,fontWeight:'700'}}>{title}</Text></Pressable>;
}
function Row({children}:{children:React.ReactNode}){return <View style={{flexDirection:'row',flexWrap:'wrap',gap:18,alignItems:'center'}}>{children}</View>;}
function Segments<T extends string>({value,items,onChange}:{value:T;items:{value:T;label:string}[];onChange:(v:T)=>void}){
 return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8}} style={{flexGrow:0}}>{items.map(i=><Pressable key={i.value||'all'} haptic="select" accessibilityRole="button" accessibilityState={{selected:value===i.value}} onPress={()=>onChange(i.value)} style={{paddingVertical:8,marginRight:10,borderBottomWidth:2,borderBottomColor:value===i.value?colors.text:'transparent'}}><Text style={{color:value===i.value?colors.text:colors.muted,fontSize:14,fontWeight:'600'}}>{i.label}</Text></Pressable>)}</ScrollView>;
}

/** Single choice as a row of pills: every option visible, one tap. */
export function Choices<T extends string>({label,value,items,onChange,disabled=false}:{label:string;value:T;items:{value:T;label:string}[];onChange:(v:T)=>void;disabled?:boolean}){
 // Same finish as the segmented controls: the chosen pill is lifted steel with a check, the rest quiet outlines.
 return <View style={{gap:8}}><Text style={{color:'#adb5c1',fontSize:12.5,fontWeight:'600'}}>{label}</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{items.map(i=>{const on=i.value===value;return <Pressable key={i.value} haptic="select" accessibilityRole="radio" accessibilityState={{selected:on,disabled}} disabled={disabled} onPress={()=>onChange(i.value)} style={({pressed})=>[{flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:14,minHeight:38,borderRadius:12,borderWidth:1,borderColor:on?'#4a5160':'#2a2f39',backgroundColor:on?'#1e232c':'transparent',opacity:pressed?0.7:1}]}>{on&&<Icon name="check" size={14} color={colors.accent} weight={2.4}/>}<Text style={{color:on?'#ffffff':'#b2b9c4',fontSize:14,fontWeight:on?'700':'500'}}>{i.label}</Text></Pressable>;})}</View></View>;
}
/** Tap-to-start row: an open line with a plus, not a box. */
/** The row's bottom line doubles as the top line of the card under it, so the two never stack into a pair of lines. */
export function StartRow({icon,title,detail,onPress}:{icon:IconName;title:string;detail?:string;onPress:()=>void}){return <View style={{marginBottom:-18}}><TileGrid><Tile icon={icon} title={title} detail={detail} trailing="plus" onPress={onPress}/></TileGrid></View>;}
export function FormHead({title,onCancel}:{title:string;onCancel:()=>void}){return <SectionHead title={title} action="Cancel" onAction={onCancel}/>;}

function useProfile(){
 const [profile,setProfile]=useState<Profile|null|undefined>(undefined),[error,setError]=useState('');
 const load=useCallback(async()=>{try{setProfile(await api<Profile|null>('/api/profile'));setError('');}catch(e){setError(errorText(e));setProfile(null);}},[]);
 useFocusEffect(useCallback(()=>{void load();},[load]));
 return {profile,setProfile,profileError:error};
}

/* ------------------------------------------------------------------ Profile */
export function ProfileEditor({profile,onSaved}:{profile:Profile|null;onSaved:(p:Profile)=>void}){
 const [handle,setHandle]=useState(profile?.handle??''),[name,setName]=useState(profile?.display_name??''),[location,setLocation]=useState(profile?.location??''),[riding,setRiding]=useState(profile?.riding_class??''),[bio,setBio]=useState(profile?.bio??''),[number,setNumber]=useState(profile?.race_number??''),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[agreed,setAgreed]=useState(false);
 useEffect(()=>{setHandle(profile?.handle??'');setName(profile?.display_name??'');setLocation(profile?.location??'');setRiding(profile?.riding_class??'');setBio(profile?.bio??'');setNumber(profile?.race_number??'');},[profile?.user_id,profile?.updated_at]);
 async function save(){
  if(busy)return;setBusy(true);setNotice('');
  try{if(!/^[A-Za-z0-9_]{3,24}$/.test(handle.trim()))throw new Error('Handle must be 3–24 letters, numbers or underscores.');if(!profile&&!agreed)throw new Error('Agree to the community rules to create your profile.');onSaved(await api<Profile>('/api/profile','PUT',{handle:handle.trim().toLowerCase(),display_name:name,location,riding_class:riding,bio,race_number:number.trim(),...(profile?{}:{accept_rules:true})}));setNotice('Profile saved.');}
  catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 return <View style={{gap:12}}>
  {!profile&&<Copy>Pick a handle so other riders know who they’re talking to. You can change it later.</Copy>}
  <Field editable={!busy} label="Handle" placeholder="e.g. moto_kyle" value={handle} onChangeText={setHandle} maxLength={24} autoCorrect={false}/>
  <Field editable={!busy} label="Display name" placeholder="The name riders see" value={name} onChangeText={setName} maxLength={60} autoCapitalize="words"/>
  <Field editable={!busy} label="Home area" placeholder="e.g. Tampa, FL" value={location} onChangeText={setLocation} maxLength={80} autoCapitalize="words"/>
  <Field editable={!busy} label="Class / riding" placeholder="e.g. Vet 35+, 450 C" value={riding} onChangeText={setRiding} maxLength={60}/>
  <Field editable={!busy} label="Race number" placeholder="e.g. 36" value={number} onChangeText={t=>setNumber(t.replace(/[^0-9]/g,'').slice(0,3))} keyboardType="number-pad" maxLength={3}/>
  <Field editable={!busy} label="About" placeholder="What you ride, where, what you’re working on" value={bio} onChangeText={setBio} maxLength={500} multiline autoCapitalize="sentences"/>
  {!profile&&<View style={{gap:8,paddingTop:8}}><Text style={{color:'#9aa2ae',fontSize:11.5,fontWeight:'600',letterSpacing:1}}>COMMUNITY RULES</Text>{COMMUNITY_RULES.map((r,i)=><Copy key={i}>• {r}</Copy>)}<CheckRow label="I agree to the community rules" checked={agreed} onPress={()=>setAgreed(!agreed)}/></View>}
  <Notice text={notice}/>
  <Button disabled={busy} title={busy?'Saving…':profile?'Save profile':'Create profile'} onPress={()=>void save()}/>
 </View>;
}
function NeedsProfile({onSaved}:{onSaved:(p:Profile)=>void}){return <Card><Copy strong>Set up your rider profile</Copy><ProfileEditor profile={null} onSaved={onSaved}/></Card>;}
export function ProfileCard(){
 const {profile,setProfile,profileError}=useProfile();
 const [editing,setEditing]=useState(false),[photoBusy,setPhotoBusy]=useState(false),[photoNote,setPhotoNote]=useState('');
 async function changePhoto(){if(!profile)return;setPhotoNote('');try{const picked=await addPhotos('avatar',{square:true,title:'Profile photo'});if(!picked.length)return;setPhotoBusy(true);const saved=await api<Profile>('/api/profile','PUT',{handle:profile.handle,display_name:profile.display_name,bio:profile.bio,location:profile.location,riding_class:profile.riding_class,avatar_photo_id:picked[0].id});setProfile(saved);}catch(e){setPhotoNote(errorText(e));}finally{setPhotoBusy(false);}}
 const [blocks,setBlocks]=useState<{blocked_id:string;created_at:string}[]>([]);
 useFocusEffect(useCallback(()=>{api<{blocked_id:string;created_at:string}[]>('/api/blocks').then(setBlocks).catch(()=>setBlocks([]));},[]));
 // While the profile loads, hold its space so the rest of Account doesn't jump down when it arrives.
 if(profile===undefined)return <Card><View accessibilityLabel="Loading your profile" style={{flexDirection:'row',alignItems:'center',gap:14}}><View style={{width:56,height:56,borderRadius:28,backgroundColor:'#15181e'}}/><View style={{flex:1,gap:8}}><View style={{width:'55%',height:16,borderRadius:5,backgroundColor:'#15181e'}}/><View style={{width:'80%',height:12,borderRadius:4,backgroundColor:'#121519'}}/></View></View></Card>;
 return <Card>{profile?<View style={{flexDirection:'row',alignItems:'center',gap:14}}><Pressable accessibilityRole="button" accessibilityLabel="Change profile photo" disabled={photoBusy} onPress={()=>void changePhoto()}><Avatar name={riderName(profile)} uri={profile.avatar_url} size={56}/><View style={{position:'absolute',right:-2,bottom:-2,width:24,height:24,borderRadius:12,alignItems:'center',justifyContent:'center',...blueLift}}><BlueFace radius={12}/>{photoBusy?<ActivityIndicator size="small" color="#ffffff"/>:<Icon name="camera" size={12} color="#ffffff" weight={2.2}/>}</View></Pressable><View style={{flex:1,gap:2}}><Text style={{color:colors.text,fontSize:20,fontWeight:'800'}}>{riderName(profile)}</Text><Text style={{color:'#adb5c1',fontSize:13.5}}>@{profile.handle}{profile.location?' · '+profile.location:''}{profile.riding_class?' · '+profile.riding_class:''}</Text></View><Pressable accessibilityRole="button" hitSlop={10} onPress={()=>setEditing(!editing)}><Text style={{color:colors.text,fontWeight:'700',fontSize:15}}>{editing?'Done':'Edit'}</Text></Pressable></View>:<Copy strong>Rider profile</Copy>}{!!profile?.bio&&!editing&&<Text style={{color:colors.text,fontSize:15,lineHeight:22}}>{profile.bio}</Text>}<Notice text={profileError||photoNote}/>{(!profile||editing)&&<ProfileEditor profile={profile} onSaved={p=>{setProfile(p);setEditing(false);}}/>}
  {blocks.length>0&&<View style={{gap:8}}><Copy strong>Blocked riders</Copy>{blocks.map(b=><Row key={b.blocked_id}><Copy>Blocked {day(b.created_at)}</Copy><Link title="Unblock" onPress={()=>void api('/api/blocks?user_id='+b.blocked_id,'DELETE').then(()=>setBlocks(old=>old.filter(x=>x.blocked_id!==b.blocked_id))).catch(()=>{})}/></Row>)}</View>}
 </Card>;
}
export function FeedbackCard({bike,bare=false}:{bike?:Bike;bare?:boolean}){
 const [category,setCategory]=useState('missing_data'),[body,setBody]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 async function send(){if(busy||!body.trim())return;setBusy(true);setNotice('');try{await api('/api/feedback','POST',{category,body,context:{client:'native',bike:bike?`${bike.model_year} ${bike.manufacturer} ${bike.model}`:null}});setBody('');setNotice('Thanks — this goes straight to the build list.');}catch(e){setNotice(errorText(e));}finally{setBusy(false);}}
 const Wrap=bare?View:Card;
 return <Wrap style={bare?{gap:12}:undefined}>{!bare&&<Copy strong>Tell us what’s missing or wrong</Copy>}<Copy>A wrong answer, a missing spec for your bike, a bug, an idea. Be specific; it gets read.</Copy>
  <Choices disabled={busy} label="About" value={category} items={[{value:'answer_quality',label:'An answer'},{value:'missing_data',label:'Missing data'},{value:'bug',label:'Something broken'},{value:'idea',label:'An idea'},{value:'other',label:'Other'}]} onChange={setCategory}/>
  <Field editable={!busy} label="Details" placeholder="What happened, on which bike, and what you expected" value={body} onChangeText={setBody} multiline maxLength={4000} autoCapitalize="sentences"/>
  <Notice text={notice}/><Button disabled={busy||!body.trim()} title={busy?'Sending…':'Send feedback'} onPress={()=>void send()}/></Wrap>;
}

/* ------------------------------------------------------------------ Report / block */
function RiderActions({rider,target,onBlocked,onMessage}:{rider:RiderRef;target:{type:'post'|'comment'|'event'|'message'|'profile';id:string};onBlocked:()=>void;onMessage?:(r:RiderRef)=>void}){
 const [reporting,setReporting]=useState(false),[reason,setReason]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 async function report(){if(busy||!reason.trim())return;setBusy(true);try{await api('/api/reports','POST',{target_type:target.type,target_id:target.id,reason});setReporting(false);setReason('');setNotice('Report received. We review reports and remove content that breaks the rules.');}catch(e){setNotice(errorText(e));}finally{setBusy(false);}}
 const block=()=>Alert.alert(`Block ${riderName(rider)}?`,'You won’t see their posts, events or messages, and they won’t see yours.',[{text:'Cancel',style:'cancel'},{text:'Block',style:'destructive',onPress:()=>void api('/api/blocks?user_id='+rider.user_id,'PUT').then(onBlocked).catch(e=>setNotice(errorText(e)))}]);
 return <View style={{gap:8}}>
  <Row>{onMessage&&<IconAction icon="messages" label="Message" onPress={()=>onMessage(rider)}/>}<IconAction icon="more" label="More" onPress={()=>Alert.alert(riderName(rider),undefined,[{text:'Report',onPress:()=>setReporting(true)},{text:'Block',style:'destructive',onPress:block},{text:'Cancel',style:'cancel'}])}/></Row>
  {reporting&&<><Field label="What’s wrong with this?" value={reason} onChangeText={setReason} multiline maxLength={1000} autoCapitalize="sentences"/><Button secondary disabled={busy||!reason.trim()} title="Send report" onPress={()=>void report()}/></>}
  <Notice text={notice}/>
 </View>;
}

/* ------------------------------------------------------------------ Community */
const ago=(iso:string)=>{const m=Math.round((Date.now()-new Date(iso).getTime())/60000);if(m<1)return 'now';if(m<60)return m+'m';const h=Math.round(m/60);if(h<24)return h+'h';const d=Math.round(h/24);if(d<7)return d+'d';return new Date(iso).toLocaleDateString([],{month:'short',day:'numeric'});};
const FILTERS:{value:PostCategory|'';label:string}[]=[{value:'',label:'All'},{value:'build',label:'Builds'},{value:'setup_question',label:'Setup questions'},{value:'ride_plan',label:'Ride plans'},{value:'general',label:'General'}];

/** Community: a feed first. One-line composer, small filters, then posts that use the full width. */
export function CommunityScreen({bike,onMessage}:{bike?:Bike;onMessage:(r:RiderRef)=>void}){
 const {profile,setProfile}=useProfile();
 const [posts,setPosts]=useState<Post[]>([]),[filter,setFilter]=useState<PostCategory|''>(''),[notice,setNotice]=useState(''),[loading,setLoading]=useState(false),[composing,setComposing]=useState(false),[open,setOpen]=useState(''),[viewing,setViewing]=useState(''),[reporting,setReporting]=useState(''),[reason,setReason]=useState('');
 const run=useRef(0);
 const load=useCallback(async()=>{const mine=++run.current;setLoading(true);try{const data=await api<Post[]>('/api/posts'+(filter?'?category='+filter:''));if(mine===run.current){setPosts(data);setNotice('');}}catch(e){if(mine===run.current)setNotice(errorText(e));}finally{if(mine===run.current)setLoading(false);}},[filter]);
 useFocusEffect(useCallback(()=>{if(profile)void load();},[load,profile?.user_id]));
 async function like(p:Post){hSelect();setPosts(old=>old.map(x=>x.id===p.id?{...x,liked:!p.liked,like_count:p.like_count+(p.liked?-1:1)}:x));try{await api('/api/likes?post_id='+p.id,p.liked?'DELETE':'PUT');}catch(e){setNotice(errorText(e));void load();}}
 async function report(p:Post){if(!reason.trim())return;try{await api('/api/reports','POST',{target_type:'post',target_id:p.id,reason});setReporting('');setReason('');setNotice('Report received. We review reports and remove posts that break the rules.');}catch(e){setNotice(errorText(e));}}
 function more(p:Post){
  const block=()=>Alert.alert(`Block ${riderName(p.author)}?`,'You won’t see their posts, events or messages, and they won’t see yours.',[{text:'Cancel',style:'cancel'},{text:'Block',style:'destructive',onPress:()=>void api('/api/blocks?user_id='+p.user_id,'PUT').then(()=>setPosts(old=>old.filter(x=>x.user_id!==p.user_id))).catch(e=>setNotice(errorText(e)))}]);
  if(p.mine)Alert.alert('Your post',undefined,[{text:'Delete post',style:'destructive',onPress:()=>void api('/api/posts?id='+p.id,'DELETE').then(load).catch(e=>setNotice(errorText(e)))},{text:'Cancel',style:'cancel'}]);
  else Alert.alert(riderName(p.author),undefined,[{text:'Message',onPress:()=>onMessage(p.author)},{text:'View profile',onPress:()=>setViewing(p.user_id)},{text:'Report post',onPress:()=>{setReporting(p.id);setReason('');}},{text:'Block',style:'destructive',onPress:block},{text:'Cancel',style:'cancel'}]);
 }
 if(viewing)return <RiderProfileView riderId={viewing} onBack={()=>setViewing('')} onMessage={r=>{setViewing('');onMessage(r);}}/>;
 if(profile===undefined)return <Page title="Community"><Copy>Loading…</Copy></Page>;
 if(!profile)return <Page title="Community"><Copy>Builds, setup questions and ride plans from riders on gas MX bikes.</Copy><NeedsProfile onSaved={setProfile}/></Page>;
 return <Page title="">
  <View style={{gap:14}}>
   <Text style={{color:colors.text,fontSize:28,fontWeight:'900',fontStyle:'italic',letterSpacing:-1}}>Community</Text>
   <Pressable accessibilityRole="button" accessibilityLabel="Start a post" onPress={()=>setComposing(true)} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:12,opacity:pressed?0.7:1})}>
    <Avatar name={riderName(profile)} uri={profile.avatar_url} size={38}/>
    <View style={{flex:1,borderWidth:1,borderColor:'#2f3540',borderRadius:22,paddingHorizontal:16,paddingVertical:11}}><Text style={{color:'#adb5c1',fontSize:15}}>What’s on the bike?</Text></View>
   </Pressable>
   <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8}} style={{flexGrow:0,marginHorizontal:-20}}>
    <View style={{width:12}}/>{FILTERS.map(f=>{const on=filter===f.value;return <Pressable key={f.label} haptic="select" accessibilityRole="button" accessibilityState={{selected:on}} onPress={()=>setFilter(f.value)} style={({pressed})=>[{paddingHorizontal:13,paddingVertical:6,borderRadius:16,borderWidth:on?0:1,margin:on?1:0,borderColor:'#2f3540',opacity:pressed?0.7:1},on&&blueLift]}>{on&&<BlueFace radius={16}/>}<Text style={[{color:on?'#ffffff':'#c9cfd9',fontSize:13,fontWeight:on?'700':'500'},on&&onBlueText]}>{f.label}</Text></Pressable>;})}<View style={{width:12}}/>
   </ScrollView>
  </View>
  <Notice text={notice}/>
  {loading&&!posts.length&&<SkeletonList kind="post"/>}
  {!loading&&!posts.length&&<View style={{paddingVertical:40,alignItems:'center',gap:10}}><Icon name="riders" size={40} color="#7d8593" bg="#060609"/><Text style={{color:colors.text,fontSize:18,fontWeight:'800'}}>Nothing here yet</Text><Text style={{color:'#adb5c1',fontSize:14,textAlign:'center'}}>Be the first to post a build, a setup question or a ride plan.</Text></View>}
  <View style={{marginHorizontal:-20}}>{posts.map(p=><PostView key={p.id} p={p} open={open===p.id} onOpen={()=>setOpen(open===p.id?'':p.id)} onLike={()=>void like(p)} onMore={()=>more(p)} onRider={()=>setViewing(p.user_id)} onCount={n=>setPosts(old=>old.map(x=>x.id===p.id?{...x,comment_count:n}:x))}
   report={reporting===p.id?<View style={{gap:10,paddingHorizontal:20}}><Field label="What’s wrong with this post?" value={reason} onChangeText={setReason} multiline maxLength={1000} autoCapitalize="sentences"/><View style={{flexDirection:'row',gap:22}}><LinkActionLite title="Send report" onPress={()=>void report(p)}/><LinkActionLite muted title="Cancel" onPress={()=>setReporting('')}/></View></View>:null}/>)}</View>
  <ComposeSheet visible={composing} profile={profile} bike={bike} onClose={()=>setComposing(false)} onPosted={()=>{setComposing(false);void load();}}/>
 </Page>;
}
function LinkActionLite({title,onPress,muted=false}:{title:string;onPress:()=>void;muted?:boolean}){return <Pressable accessibilityRole="button" hitSlop={8} onPress={onPress}><Text style={{color:muted?'#adb5c1':colors.accent,fontSize:15,fontWeight:'700'}}>{title}</Text></Pressable>;}

function PostView({p,open,onOpen,onLike,onMore,onRider,onCount,report}:{p:Post;open:boolean;onOpen:()=>void;onLike:()=>void;onMore:()=>void;onRider:()=>void;onCount:(n:number)=>void;report:React.ReactNode}){
 const [full,setFull]=useState(false),long=p.body.length>320||p.body.split('\n').length>6;
 return <View style={{paddingTop:18,paddingBottom:6,gap:12,borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'#262b34'}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:20}}>
   <Pressable accessibilityRole="button" accessibilityLabel={'View '+riderName(p.author)} onPress={onRider}><Avatar name={riderName(p.author)} uri={p.author.avatar_url} size={42}/></Pressable>
   <Pressable accessibilityRole="button" accessibilityLabel={'View '+riderName(p.author)} onPress={onRider} style={{flex:1,gap:2}}>
    <Text style={{color:colors.text,fontSize:15.5,fontWeight:'700'}}>{riderName(p.author)} <Text style={{color:'#9aa2ae',fontWeight:'500'}}>· {ago(p.created_at)}</Text></Text>
    <Text numberOfLines={1} style={{color:'#adb5c1',fontSize:12.5}}><Text style={{color:colors.text,fontWeight:'700'}}>{POST_CATEGORY_LABELS[p.category]}</Text>{p.bike_label?' · '+p.bike_label:p.author.location?' · '+p.author.location:''}</Text>
   </Pressable>
   <Pressable accessibilityRole="button" accessibilityLabel="More options" hitSlop={12} onPress={onMore}><Icon name="more" size={22} color="#adb5c1"/></Pressable>
  </View>
  <Pressable onPress={long?()=>setFull(!full):undefined} style={{paddingHorizontal:20}} disabled={!long}>
   <Text selectable numberOfLines={full||!long?undefined:6} style={{color:colors.text,fontSize:16.5,lineHeight:25}}>{p.body}</Text>
   {long&&<Text style={{color:'#adb5c1',fontSize:14,fontWeight:'600',marginTop:4}}>{full?'Show less':'See more'}</Text>}
  </Pressable>
  {!!p.photos?.length&&<PostPhotos photos={p.photos}/>}
  {report}
  <View style={{flexDirection:'row',alignItems:'center',gap:22,paddingHorizontal:20}}>
   <Pressable accessibilityRole="button" haptic={false} accessibilityLabel={p.liked?'Unlike':'Like'} accessibilityState={{selected:p.liked}} hitSlop={8} onPress={onLike} style={{flexDirection:'row',alignItems:'center',gap:6}}><Icon name={p.liked?'heartOn':'heart'} size={23} color={p.liked?'#e8607a':colors.text}/>{p.like_count>0&&<Text style={{color:colors.text,fontSize:14,fontWeight:'600'}}>{p.like_count}</Text>}</Pressable>
   <Pressable accessibilityRole="button" accessibilityLabel="Comments" hitSlop={8} onPress={onOpen} style={{flexDirection:'row',alignItems:'center',gap:6}}><Icon name="comment" size={22} color={colors.text}/>{p.comment_count>0&&<Text style={{color:colors.text,fontSize:14,fontWeight:'600'}}>{p.comment_count}</Text>}</Pressable>
   <Pressable accessibilityRole="button" accessibilityLabel="Share" hitSlop={8} onPress={()=>void Share.share({message:`${riderName(p.author)} on BAK MX:\n\n${p.body}`}).catch(()=>{})}><Icon name="share" size={22} color={colors.text}/></Pressable>
  </View>
  {!open&&p.comment_count>0&&<Pressable onPress={onOpen} style={{paddingHorizontal:20}}><Text style={{color:'#adb5c1',fontSize:14}}>View {p.comment_count===1?'1 comment':`all ${p.comment_count} comments`}</Text></Pressable>}
  {open&&<Comments postId={p.id} onCount={onCount}/>}
 </View>;
}

function ComposeSheet({visible,profile,bike,onClose,onPosted}:{visible:boolean;profile:Profile;bike?:Bike;onClose:()=>void;onPosted:()=>void}){
 const insets=useSafeAreaInsets();
 const [category,setCategory]=useState<PostCategory>('setup_question'),[body,setBody]=useState(''),[tagBike,setTagBike]=useState(true),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[photos,setPhotos]=useState<Photo[]>([]),[uploading,setUploading]=useState(0);
 const ready=!!body.trim()&&!busy&&!uploading;
 async function publish(){if(!ready)return;setBusy(true);setNotice('');try{await api('/api/posts','POST',{category,body,bike_label:tagBike&&bike?`${bike.model_year} ${bike.manufacturer} ${bike.model}`:'',photo_ids:photos.map(p=>p.id)});setBody('');setPhotos([]);success();onPosted();}catch(e){setNotice(errorText(e));}finally{setBusy(false);}}
 async function add(source:'camera'|'library'){
  const room=4-photos.length;if(room<1)return;
  try{const picked=await pickImages(source,room);if(!picked.length)return;setUploading(picked.length);
   for(const a of picked){const p=await uploadPhoto(a,'post');setPhotos(old=>[...old,p]);setUploading(n=>Math.max(0,n-1));}}
  catch(e){setNotice(errorText(e));}finally{setUploading(0);}
 }
 const hint={build:'What you did to the bike and how it turned out',setup_question:'What the bike is doing, where, and what you’ve tried',ride_plan:'Where, when, and who should come',general:'What’s on your mind'}[category];
 const tool=(icon:'camera'|'image',label:string,onPress:()=>void)=><Pressable accessibilityRole="button" accessibilityLabel={label} disabled={photos.length>=4||!!uploading} onPress={onPress} hitSlop={8} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:7,paddingVertical:8,paddingHorizontal:4,opacity:photos.length>=4||uploading?0.35:pressed?0.6:1})}><Icon name={icon} size={23} color={colors.text}/><Text style={{color:colors.text,fontSize:14,fontWeight:'600'}}>{label}</Text></Pressable>;
 return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
  <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1,backgroundColor:colors.bg}}>
   <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingTop:Platform.OS==='ios'?14:insets.top+10,paddingBottom:12}}>
    <Pressable accessibilityRole="button" hitSlop={10} onPress={onClose} style={{flex:1}}><Text style={{color:'#b2b9c4',fontSize:16}}>Cancel</Text></Pressable>
    <Text style={{color:colors.text,fontSize:17,fontWeight:'800'}}>New post</Text>
    <View style={{flex:1,alignItems:'flex-end'}}><Pressable accessibilityRole="button" accessibilityState={{disabled:!ready}} disabled={!ready} onPress={()=>void publish()} style={({pressed})=>[{backgroundColor:ready?'transparent':'#16191f',borderRadius:18,paddingHorizontal:18,paddingVertical:8},ready&&blueLift,pressed&&{transform:[{translateY:1}]}]}>{({pressed})=><>{ready&&<BlueFace radius={18} pressed={pressed}/>}{busy?<ActivityIndicator size="small" color="#ffffff"/>:<Text style={[{color:ready?'#ffffff':'#7d8593',fontWeight:'800',fontSize:15},ready&&onBlueText]}>Post</Text>}</>}</Pressable></View>
   </View>
   <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingHorizontal:20,paddingBottom:24,gap:16}}>
    <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
     <Avatar name={riderName(profile)} uri={profile.avatar_url} size={44}/>
     <View style={{flex:1,gap:6}}>
      <Text style={{color:colors.text,fontSize:16,fontWeight:'700'}}>{riderName(profile)}</Text>
      {bike&&<Pressable haptic="select" accessibilityRole="checkbox" accessibilityState={{checked:tagBike}} onPress={()=>setTagBike(!tagBike)} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:6,alignSelf:'flex-start',borderWidth:1,borderColor:tagBike?colors.accent:'#2f3540',borderRadius:14,paddingHorizontal:10,paddingVertical:4,opacity:pressed?0.7:1})}><Icon name="moto" size={16} color={tagBike?colors.accent:'#adb5c1'}/><Text style={{color:tagBike?colors.accent:'#adb5c1',fontSize:12.5,fontWeight:'700'}}>{tagBike?`${bike.model_year} ${bike.manufacturer} ${bike.model}`:'Tag my bike'}</Text></Pressable>}
     </View>
    </View>
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{options(POST_CATEGORY_LABELS).map(o=>{const on=category===o.value;return <Pressable key={o.value} haptic="select" accessibilityRole="button" accessibilityState={{selected:on}} onPress={()=>setCategory(o.value)} style={({pressed})=>[{paddingHorizontal:13,paddingVertical:6,borderRadius:16,borderWidth:on?0:1,margin:on?1:0,borderColor:'#2f3540',opacity:pressed?0.7:1},on&&blueLift]}>{on&&<BlueFace radius={16}/>}<Text style={[{color:on?'#ffffff':'#c9cfd9',fontSize:13.5,fontWeight:on?'700':'500'},on&&onBlueText]}>{o.label}</Text></Pressable>;})}</View>
    <TextInput autoFocus multiline value={body} onChangeText={setBody} maxLength={4000} autoCapitalize="sentences" placeholder={hint} placeholderTextColor="#7d8593" selectionColor={colors.accent} accessibilityLabel="Post" style={{color:colors.text,fontSize:19,lineHeight:27,minHeight:140,textAlignVertical:'top',outlineStyle:'none'} as never}/>
    <AttachedPhotos photos={photos} uploading={uploading} size={104} onRemove={id=>{setPhotos(old=>old.filter(p=>p.id!==id));void api('/api/photos?id='+id,'DELETE').catch(()=>{});}}/>
    <Notice text={notice}/>
   </ScrollView>
   <View style={{flexDirection:'row',alignItems:'center',gap:18,paddingHorizontal:16,paddingTop:8,paddingBottom:Math.max(insets.bottom,10),borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'#262b34'}}>
    {tool('camera','Camera',()=>void add('camera'))}{tool('image','Photos',()=>void add('library'))}
    <View style={{flex:1}}/>
    <Text style={{color:'#9aa2ae',fontSize:12.5}}>{photos.length?`${photos.length}/4 photos`:body.length>3500?`${4000-body.length} left`:'Up to 4 photos'}</Text>
   </View>
  </KeyboardAvoidingView>
 </Modal>;
}

function Comments({postId,onCount}:{postId:string;onCount:(n:number)=>void}){
 const [comments,setComments]=useState<PostComment[]>([]),[text,setText]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const load=useCallback(async()=>{try{const data=await api<PostComment[]>('/api/comments?post_id='+postId);setComments(data);onCount(data.length);}catch(e){setNotice(errorText(e));}},[postId]);
 useEffect(()=>{void load();},[load]);
 async function add(){if(busy||!text.trim())return;setBusy(true);try{await api('/api/comments','POST',{post_id:postId,body:text});setText('');await load();}catch(e){setNotice(errorText(e));}finally{setBusy(false);}}
 return <View style={{gap:12,paddingHorizontal:20,paddingTop:4}}>
  {comments.map(c=><View key={c.id} style={{flexDirection:'row',gap:10}}><Avatar name={riderName(c.author)} uri={c.author.avatar_url} size={30}/><View style={{flex:1,gap:2}}><Text style={{color:colors.text,fontSize:14.5,lineHeight:21}}><Text style={{fontWeight:'700'}}>{riderName(c.author)} </Text>{c.body}</Text><View style={{flexDirection:'row',gap:14}}><Text style={{color:'#9aa2ae',fontSize:12}}>{ago(c.created_at)}</Text>{c.mine&&<Pressable hitSlop={8} onPress={()=>void api('/api/comments?id='+c.id,'DELETE').then(load).catch(e=>setNotice(errorText(e)))}><Text style={{color:'#efb5be',fontSize:12,fontWeight:'600'}}>Delete</Text></Pressable>}</View></View></View>)}
  <Notice text={notice}/>
  <View style={{flexDirection:'row',alignItems:'center',gap:8,borderWidth:1,borderColor:'#2f3540',borderRadius:22,paddingLeft:14,paddingRight:5,paddingVertical:4}}><TextInput editable={!busy} value={text} onChangeText={setText} maxLength={2000} autoCapitalize="sentences" placeholder="Add a comment…" placeholderTextColor="#7d8593" accessibilityLabel="Add a comment" style={{flex:1,color:colors.text,fontSize:15,paddingVertical:8}} onSubmitEditing={()=>void add()} returnKeyType="send"/><Pressable accessibilityRole="button" accessibilityLabel="Post comment" disabled={busy||!text.trim()} onPress={()=>void add()} style={[{width:32,height:32,borderRadius:16,alignItems:'center',justifyContent:'center'},!!text.trim()&&blueLift]}>{!!text.trim()&&<BlueFace radius={16}/>}<Icon name="arrowUp" size={17} color={text.trim()?'#ffffff':'#7d8593'} weight={2.2}/></Pressable></View>
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
 const [formNotice,setFormNotice]=useState('');const [events,setEvents]=useState<RideEvent[]>([]),[scope,setScope]=useState<'upcoming'|'past'>('upcoming'),[notice,setNotice]=useState(''),[loading,setLoading]=useState(false),[creating,setCreating]=useState(false),[busy,setBusy]=useState(false),[open,setOpen]=useState('');
 const [title,setTitle]=useState(''),[type,setType]=useState('practice'),[starts,setStarts]=useState(()=>{const d=new Date(Date.now()+86400000);d.setHours(9,0,0,0);return localStamp(d);}),[ends,setEnds]=useState(''),[place,setPlace]=useState(''),[details,setDetails]=useState('');
 const load=useCallback(async()=>{setLoading(true);try{setEvents(await api<RideEvent[]>('/api/events?scope='+scope));setNotice('');}catch(e){setNotice(errorText(e));}finally{setLoading(false);}},[scope]);
 useFocusEffect(useCallback(()=>{if(profile)void load();},[load,profile?.user_id]));
 async function create(){
  if(busy)return;setBusy(true);
  try{
   const start=parseLocalStamp(starts),end=ends.trim()?parseLocalStamp(ends):null;
   if(!title.trim()||!place.trim())throw new Error('Enter the event name and the track or location.');
   if(!start||(ends.trim()&&!end))throw new Error('Pick a start date and time.');
   if(end&&end<start)throw new Error('The end time is before the start. Change the end, or clear it.');
   await api('/api/events','POST',{title,event_type:type,starts_at:start.toISOString(),ends_at:end?end.toISOString():null,location_name:place,description:details});
   success();setTitle('');setPlace('');setDetails('');setEnds('');setCreating(false);setScope('upcoming');await load();
  }catch(e){setFormNotice(errorText(e));}finally{setBusy(false);}
 }
 async function rsvp(ev:RideEvent,status:'going'|'interested'){try{if(ev.my_rsvp===status)await api('/api/rsvps?event_id='+ev.id,'DELETE');else await api('/api/rsvps','PUT',{event_id:ev.id,status});await load();}catch(e){setNotice(errorText(e));}}
 if(profile===undefined)return <Page title="Events"><Copy>Loading…</Copy></Page>;
 if(!profile)return <Page title="Events"><Copy>Ride days, races, practice nights, clinics and meetups posted by riders.</Copy><NeedsProfile onSaved={setProfile}/></Page>;
 return <Page title="Events">
  <Segments value={scope} items={[{value:'upcoming',label:'Upcoming'},{value:'past',label:'Past'}]} onChange={setScope}/>
  {!creating&&<StartRow icon="flag" title="Post an event" detail="Ride day, race, practice night, clinic or meetup" onPress={()=>{setFormNotice('');setCreating(true);}}/>}
  {creating&&<Card><FormHead title="New event" onCancel={()=>{setFormNotice('');setCreating(false);}}/>
   <Field editable={!busy} label="Event name" placeholder="e.g. Saturday practice at Dade City" value={title} onChangeText={setTitle} maxLength={120} autoCapitalize="sentences"/>
   <Choices disabled={busy} label="Type" value={type} items={options(EVENT_TYPE_LABELS)} onChange={setType}/>
   <DateField disabled={busy} label="Starts" time value={starts} onChange={v=>{setStarts(v);const a=parseLocalStamp(v),b=ends.trim()?parseLocalStamp(ends):null;if(a&&b&&b<a)setEnds('');}} years={[new Date().getFullYear(),new Date().getFullYear()+2]} quick={rideDays()}/>
   <DateField disabled={busy} label="Ends" time optional seed={starts} value={ends} onChange={setEnds} years={[new Date().getFullYear(),new Date().getFullYear()+2]} quick={rideDays()}/>
   <Field editable={!busy} label="Track or location" placeholder="Track name or address" value={place} onChangeText={setPlace} maxLength={160} autoCapitalize="words"/>
   <Field editable={!busy} label="Details" placeholder="Gate time, classes, cost, what to bring" value={details} onChangeText={setDetails} multiline maxLength={4000} autoCapitalize="sentences"/>
   <Button disabled={busy} title={busy?'Saving…':'Publish event'} onPress={()=>void create()}/><Notice text={formNotice}/></Card>}
  <Notice text={notice}/>
  {loading&&!events.length&&<SkeletonList kind="event"/>}
  {!loading&&!events.length&&<Card><Copy strong>{scope==='upcoming'?'No upcoming events yet.':'No past events.'}</Copy><Copy>{scope==='upcoming'?'Post the next ride day or practice night so other riders can plan around it.':'Events you could see are listed here after they happen.'}</Copy></Card>}
  {events.map(ev=><Card key={ev.id}>
   <Row><Tag text={EVENT_TYPE_LABELS[ev.event_type]}/>{ev.canceled_at?<Tag tone="bad" text="Canceled"/>:ev.my_rsvp?<Tag tone="good" text={ev.my_rsvp==='going'?'You’re going':'Interested'}/>:null}</Row>
   <Text style={{color:ev.canceled_at?colors.muted:colors.text,fontSize:19,fontWeight:'700',textDecorationLine:ev.canceled_at?'line-through':'none'}}>{ev.title}</Text>
   <View style={{gap:6}}><View style={{flexDirection:'row',alignItems:'center',gap:8}}><Icon name="clock" size={17} color="#adb5c1"/><Text style={{color:'#c9cfd9',fontSize:15}}>{when(ev.starts_at)}{ev.ends_at?' – '+when(ev.ends_at):''}</Text></View><View style={{flexDirection:'row',alignItems:'center',gap:8}}><Icon name="location" size={17} color="#adb5c1"/><Text style={{color:'#c9cfd9',fontSize:15,flex:1}}>{ev.location_name}</Text></View></View>
   <Copy>Hosted by {riderName(ev.host)} · {ev.going_count} going · {ev.interested_count} interested</Copy>
   {open===ev.id&&!!ev.description&&<Text selectable style={{color:colors.text,fontSize:15,lineHeight:23}}>{ev.description}</Text>}
   {!ev.canceled_at&&scope==='upcoming'&&<View style={{flexDirection:'row',gap:10}}><View style={{flex:1}}><Button secondary={ev.my_rsvp!=='going'} title={ev.my_rsvp==='going'?'Going':'I’m going'} onPress={()=>void rsvp(ev,'going')}/></View><View style={{flex:1}}><Button secondary={ev.my_rsvp!=='interested'} title="Interested" onPress={()=>void rsvp(ev,'interested')}/></View></View>}
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
  <View>{threads.map(t=><Pressable key={t.rider.user_id} accessibilityRole="button" accessibilityLabel={`${riderName(t.rider)}${t.unread?`, ${t.unread} new`:''}`} onPress={()=>void open(t.rider)} style={({pressed})=>({flexDirection:'row',alignItems:'center',gap:12,paddingVertical:14,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:'#2a2f39',opacity:pressed?0.6:1})}><Avatar name={riderName(t.rider)} uri={t.rider.avatar_url} size={42}/><View style={{flex:1,gap:3}}><View style={{flexDirection:'row',alignItems:'center',gap:8}}><Text style={{color:colors.text,fontSize:16,fontWeight:t.unread?'800':'600',flex:1}} numberOfLines={1}>{riderName(t.rider)}</Text><Text style={{color:'#7c858e',fontSize:12}}>{when(t.last_message.created_at)}</Text></View><Text numberOfLines={1} style={{color:t.unread?colors.text:'#adb5c1',fontSize:14}}>{t.last_message.mine?'You: ':''}{t.last_message.body}</Text></View>{t.unread>0&&<View style={{width:9,height:9,borderRadius:5,backgroundColor:colors.accent}}/>}</Pressable>)}</View>
 </Page>;
 const canSend=!busy&&!!text.trim();
 const footer=<View><View style={{flexDirection:'row',alignItems:'flex-end',gap:8,paddingLeft:16,paddingRight:6,paddingVertical:6}}><TextInput accessibilityLabel={'Message '+riderName(active)} editable={!busy} value={text} onChangeText={setText} multiline maxLength={4000} autoCapitalize="sentences" placeholder={'Message '+riderName(active)} placeholderTextColor="#7d8593" style={{flex:1,color:colors.text,fontSize:16,lineHeight:21,maxHeight:120,paddingTop:9,paddingBottom:9}}/><Pressable accessibilityRole="button" accessibilityLabel="Send" accessibilityState={{disabled:!canSend}} disabled={!canSend} onPress={()=>void send()} style={({pressed})=>[{width:38,height:38,borderRadius:19,backgroundColor:canSend?'transparent':'#23272f',alignItems:'center',justifyContent:'center'},canSend&&blueLift,pressed&&{transform:[{translateY:1}]}]}>{({pressed})=><>{canSend&&<BlueFace radius={19} pressed={pressed}/>}{busy?<ActivityIndicator size="small" color={colors.text}/>:<Icon name="arrowUp" size={20} color={canSend?'#ffffff':'#7d8593'} weight={2.2}/>}</>}</Pressable></View></View>;
 return <Page title={riderName(active)} footer={footer}>
  <BackLink title="All messages" onPress={()=>{setActive(null);void loadThreads();}}/>
  <Notice text={notice}/>
  {!messages.length&&<Copy>No messages yet. Say hello.</Copy>}
  {messages.map(m=><View key={m.id} style={{alignSelf:m.mine?'flex-end':'flex-start',maxWidth:'85%',backgroundColor:m.mine?'#1b2130':'#121418',borderRadius:18,paddingHorizontal:14,paddingVertical:10,gap:3}}><Text selectable style={{color:colors.text,fontSize:16,lineHeight:22}}>{m.body}</Text><Text style={{color:'#7c858e',fontSize:11}}>{when(m.created_at)}</Text></View>)}
  <RiderActions rider={active} target={{type:'profile',id:active.user_id}} onBlocked={()=>{setActive(null);void loadThreads();}}/>
 </Page>;
}

/* ------------------------------------------------------------------ Setup log */
export function SetupLogCard({bike,onAsk,prefill}:{bike?:Bike;onAsk:(text:string)=>void;prefill?:{text:string;token:string}}){
 const [loaded,setLoaded]=useState(false);
 const [logs,setLogs]=useState<SetupLog[]>([]),[adding,setAdding]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');const [showMore,setShowMore]=useState(false);
 const [date,setDate]=useState(()=>new Date().toISOString().slice(0,10)),[track,setTrack]=useState(''),[conditions,setConditions]=useState(''),[hours,setHours]=useState(''),[settings,setSettings]=useState<Record<string,string>>({}),[change,setChange]=useState(''),[result,setResult]=useState<SetupResult>('not_tested'),[notes,setNotes]=useState('');
 const load=useCallback(async()=>{if(!bike)return;try{setLogs(setupLogsWithPending(await api<SetupLog[]>('/api/setup-logs?bike_id='+bike.id),bike.id));setNotice('');}catch(e){setNotice(errorText(e));}finally{setLoaded(true);}},[bike?.id]);
 useFocusEffect(useCallback(()=>{setLogs([]);setLoaded(false);void load();},[load]));
 function begin(){const latest=logs[0];setSettings(Object.fromEntries(SETUP_FIELDS.map(f=>[f.key,latest?.settings[f.key]==null?'':String(latest.settings[f.key])])));setHours(bike?.engine_hours?.toString()??'');setChange('');setNotes('');setResult('not_tested');setAdding(true);}
 async function save(){
  if(busy||!bike)return;setBusy(true);
  try{
   if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T12:00:00')))throw new Error('Pick the date you rode.');
   const h=hours.trim()?Number(hours):null;if(h!==null&&(!Number.isFinite(h)||h<0))throw new Error('Hours must be zero or greater.');
   const logBody={bike_id:bike.id,recorded_at:new Date(date+'T12:00:00').toISOString(),track,conditions,engine_hours:h,settings:Object.fromEntries(SETUP_FIELDS.map(f=>[f.key,settings[f.key]?.trim()||null])),change_made:change,result,notes};const savedLog=await apiQueued<SetupLog>('/api/setup-logs',logBody,{...logBody,user_id:'',created_at:new Date().toISOString()} as Omit<SetupLog,'id'>,'Setup log');if(savedLog.pending)setNotice('No signal. Saved on this phone; it sends when you’re back in range.');
   success();setAdding(false);await load();
  }catch(e){setNotice(errorText(e));}finally{setBusy(false);}
 }
 // From Siri ("Log a setup change in BAK MX"): open a new entry, last settings carried over, with the change filled in.
 useEffect(()=>{if(!prefill||!loaded||!bike||usedLinkTokens.has(prefill.token))return;usedLinkTokens.add(prefill.token);begin();setChange(prefill.text);},[prefill?.token,loaded,bike?.id]);
 const describe=(log:SetupLog)=>SETUP_FIELDS.filter(f=>log.settings[f.key]!=null&&log.settings[f.key]!=='').map(f=>`${f.label}: ${log.settings[f.key]}`).join('; ');
 if(!bike)return null;
 return <View style={{gap:16}}>
  <Card><Notice text={notice}/>
   {adding?<FormHead title="Log a setup" onCancel={()=>setAdding(false)}/>:<StartRow icon="shock" title="Log a setup" detail="One change, how it rode" onPress={begin}/>}
   {adding&&<View style={{gap:12}}>
    <Field editable={!busy} label="What did you change?" placeholder="Fork comp 2 softer" value={change} onChangeText={setChange} maxLength={1000} autoCapitalize="sentences"/>
    <Choices disabled={busy} label="How was it?" value={result} items={options(SETUP_RESULT_LABELS)} onChange={v=>setResult(v as SetupResult)}/>
    <Field editable={!busy} label="Track" placeholder="Dade City" value={track} onChangeText={setTrack} maxLength={120} autoCapitalize="words"/>
    <Field editable={!busy} label="Notes" placeholder="Better in the ruts, still kicks in the whoops" value={notes} onChangeText={setNotes} multiline maxLength={4000} autoCapitalize="sentences"/>
    <Pressable accessibilityRole="button" onPress={()=>setShowMore(!showMore)}><Text style={{color:colors.text,fontWeight:'700'}}>{showMore?'Hide conditions and settings':'Conditions, date, hours and full settings'}</Text></Pressable>
    {showMore&&<>
    <Field editable={!busy} label="Conditions" placeholder="Sand, hard-pack, wet…" value={conditions} onChangeText={setConditions} maxLength={200} autoCapitalize="sentences"/>
    <DateField disabled={busy} label="Date" value={date} onChange={setDate} years={[new Date().getFullYear()-5,new Date().getFullYear()]} quick={recentDays()}/>
    <Field editable={!busy} label="Hours" value={hours} onChangeText={setHours} keyboardType="decimal-pad"/>
    {(['Fork','Shock','Chassis','Engine'] as const).map(group=><View key={group} style={{gap:10}}><Text style={{color:'#9aa2ae',fontSize:12,fontWeight:'800',letterSpacing:2}}>{group.toUpperCase()}</Text>{SETUP_FIELDS.filter(f=>f.group===group).map(f=><Field editable={!busy} key={f.key} label={f.label} value={settings[f.key]??''} onChangeText={v=>setSettings(old=>({...old,[f.key]:v}))} maxLength={200}/>)}</View>)}
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
/** Catalog section names arrive in capitals ("FRONT FORK, TRIPLE CLAMP"); show them in normal case, keeping known abbreviations. */
const sectionName=niceName;
const hasDiagram=(u:string)=>/^https:\/\//.test(u)&&!/NoImage/i.test(u);
/** The exploded diagram for a parts section, right above its numbered list. Tap to open it full screen and pinch to zoom. */
function Diagram({uri,title}:{uri:string;title:string}){
 const [open,setOpen]=useState(false),[failed,setFailed]=useState(false),[ratio,setRatio]=useState(1.3);const insets=useSafeAreaInsets();
 useEffect(()=>{Image.getSize(uri,(w,h)=>{if(w&&h)setRatio(w/h);},()=>{});},[uri]);
 if(failed)return <Link title="Open exploded diagram" onPress={()=>void Linking.openURL(uri).catch(()=>{})}/>;
 return <>
  <Pressable accessibilityRole="imagebutton" accessibilityLabel={`Exploded diagram: ${title}. Tap to enlarge`} onPress={()=>setOpen(true)} style={{backgroundColor:'#fff',borderRadius:10,overflow:'hidden'}}>
   <Image source={{uri}} onError={()=>setFailed(true)} resizeMode="contain" style={{width:'100%',aspectRatio:ratio,maxHeight:420}}/>
   <Text style={{position:'absolute',right:8,bottom:6,fontSize:11.5,color:'#4b5563',fontWeight:'600'}}>Tap to zoom</Text>
  </Pressable>
  <Modal visible={open} animationType="fade" onRequestClose={()=>setOpen(false)} supportedOrientations={['portrait','landscape']}>
   <View style={{flex:1,backgroundColor:'#fff'}}>
    <ScrollView maximumZoomScale={5} minimumZoomScale={1} centerContent bouncesZoom contentContainerStyle={{flexGrow:1,justifyContent:'center'}}>
     <Image source={{uri}} resizeMode="contain" style={{width:'100%',aspectRatio:ratio}}/>
    </ScrollView>
    <Pressable accessibilityRole="button" accessibilityLabel="Close diagram" onPress={()=>setOpen(false)} style={{position:'absolute',top:insets.top+10,right:14,backgroundColor:'#111',borderRadius:18,paddingHorizontal:14,paddingVertical:8}}><Text style={{color:'#fff',fontWeight:'700'}}>Done</Text></Pressable>
   </View>
  </Modal>
 </>;
}
export function PartsCatalogCard({bike}:{bike?:Bike}){
 const [catalog,setCatalog]=useState<PartCatalog|null|undefined>(undefined),[assemblies,setAssemblies]=useState<PartAssembly[]>([]),[open,setOpen]=useState(''),[parts,setParts]=useState<Part[]>([]),[find,setFind]=useState(''),[notice,setNotice]=useState('');
 useEffect(()=>{let live=true;setCatalog(undefined);setAssemblies([]);setOpen('');setParts([]);setNotice('');if(bike)api<{catalog:PartCatalog|null;assemblies:PartAssembly[]}>('/api/parts/catalog?bike_id='+bike.id).then(d=>{if(live){setCatalog(d.catalog);setAssemblies(d.assemblies);}}).catch(e=>{if(live){setNotice(errorText(e));setCatalog(null);}});return()=>{live=false;};},[bike?.id]);
 async function show(a:PartAssembly){if(open===a.id){setOpen('');return;}setOpen(a.id);setParts([]);try{setParts(await api<Part[]>('/api/parts?assembly_id='+a.id));}catch(e){setNotice(errorText(e));}}
 if(!bike||catalog===undefined)return null;
 const shown=assemblies.filter(a=>a.name.toLowerCase().includes(find.trim().toLowerCase()));
 return <Card><Copy strong>Parts catalog</Copy><Notice text={notice}/>
  {!catalog?<Copy>No parts catalog for this bike yet. Parts are only shown when they’re listed for your exact year and version, never borrowed from a neighboring year.</Copy>:<>
   <Copy>{catalog.assembly_count} sections · {catalog.part_count} parts{catalog.complete?'':' · not every section is listed yet'}</Copy>
   <Field label="Find an assembly" value={find} onChangeText={setFind}/>
   {PART_AREAS.flatMap(area=>{const list=shown.filter(a=>partArea(a.name)===area);return list.length?[<Text key={'h-'+area} style={{color:'#9aa2ae',fontSize:11,fontWeight:'800',letterSpacing:1.5,marginTop:10}}>{area.toUpperCase()}</Text>,...list.map(a=><View key={a.id} style={{borderTopWidth:1,borderTopColor:colors.line,paddingTop:10,gap:8}}>
    <Pressable accessibilityRole="button" accessibilityState={{expanded:open===a.id}} onPress={()=>void show(a)} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',minHeight:40}}><Text style={{color:colors.text,fontSize:16,flex:1}}>{sectionName(a.name)}</Text><Icon name={open===a.id?'chevronDown':'chevronRight'} size={17} color="#adb5c1"/></Pressable>
    {open===a.id&&<View style={{gap:8}}>
     {hasDiagram(a.diagram_url)&&<Diagram uri={a.diagram_url} title={sectionName(a.name)}/>}
     {!parts.length?<Copy>Loading parts…</Copy>:parts.map(p=><View key={p.id} style={{flexDirection:'row',gap:10}}><Text style={{color:colors.text,width:30,fontWeight:'700'}}>{p.callout}</Text><View style={{flex:1}}><Text selectable style={{color:colors.text,fontSize:15}}>{p.description}</Text><Text selectable style={{color:colors.muted,fontSize:13}}>{[p.part_number||'No part number',p.quantity_raw&&p.quantity_raw!=='0'?`Qty ${p.quantity_raw}`:'',p.remarks].filter(Boolean).join(' · ')}</Text></View></View>)}
     <Copy>Catalog quantities are per assembly as published, not whole-bike totals.</Copy>
    </View>}
   </View>)]:[];})}
  </>}
 </Card>;
}

/* ------------------------------------------------------------------ Setup guide */
export function SetupGuideCard({onAsk,bike}:{onAsk?:(text:string)=>void;bike?:Bike}){
 // Only what this bike has: no carburetor jetting on a fuel-injected four-stroke.
 const engine=bike?garageModelInfo[`${bike.manufacturer}|${bike.model}`]?.engine:undefined;
 const shownAdjusters=adjusters.filter(a=>!(engine==='4-stroke'&&a.id==='two_stroke_jetting'));
 const [view,setView]=useState<'feel'|'adjusters'>('feel'),[open,setOpen]=useState('');
 const head=(id:string,label:string,sub?:string)=><Pressable accessibilityRole="button" accessibilityState={{expanded:open===id}} onPress={()=>setOpen(open===id?'':id)} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',minHeight:44,borderTopWidth:1,borderTopColor:colors.line,paddingTop:10}}><View style={{flex:1}}><Text style={{color:colors.text,fontSize:16,fontWeight:'600'}}>{label}</Text>{!!sub&&<Text style={{color:colors.muted,fontSize:12}}>{sub}</Text>}</View><Icon name={open===id?'chevronDown':'chevronRight'} size={17} color="#adb5c1"/></Pressable>;
 return <Card>
  <Segments value={view} items={[{value:'feel',label:'By what you feel'},{value:'adjusters',label:'By adjustment'}]} onChange={v=>{setView(v);setOpen('');}}/>
  {view==='feel'?symptomGuides.map(g=><View key={g.id} style={{gap:8}}>{head(g.id,`“${g.rider_says[0]}”`,g.rider_says.slice(1,4).join(', '))}
   {open===g.id&&<View style={{gap:8}}><Copy>{g.where}</Copy><Text style={{color:'#9aa2ae',fontSize:11,fontWeight:'800',letterSpacing:1.5}}>CHECK FIRST</Text>{g.check_first.map((c,i)=><Text key={i} style={{color:colors.text,fontSize:15,lineHeight:22}}>• {c}</Text>)}<Text style={{color:'#9aa2ae',fontSize:11,fontWeight:'800',letterSpacing:1.5}}>LIKELY CAUSES</Text>{g.likely.map((l,i)=><View key={i} style={{gap:2}}><Text style={{color:colors.text,fontSize:15,fontWeight:'700',lineHeight:22}}>{l.cause}</Text><Copy>{l.tell}</Copy><Text style={{color:colors.primary,fontSize:15,lineHeight:22}}>First change: {l.first_change}</Text></View>)}{onAsk&&<Link title="Ask BAK about this on my bike" onPress={()=>onAsk(`My bike ${g.rider_says[0]}. `)}/>}</View>}</View>)
  :shownAdjusters.map(a=><View key={a.id} style={{gap:8}}>{head(a.id,a.name)}
   {open===a.id&&<View style={{gap:8}}><Text style={{color:colors.text,fontSize:15,lineHeight:22}}>{a.controls}</Text><Text style={{color:'#9aa2ae',fontSize:11,fontWeight:'800',letterSpacing:1.5}}>FIRMER / MORE</Text><Text style={{color:colors.text,fontSize:15,lineHeight:22}}>{a.firmer_or_more}</Text><Copy>Too much: {a.too_much}</Copy><Text style={{color:'#9aa2ae',fontSize:11,fontWeight:'800',letterSpacing:1.5}}>SOFTER / LESS</Text><Text style={{color:colors.text,fontSize:15,lineHeight:22}}>{a.softer_or_less}</Text><Copy>Too little: {a.too_little}</Copy><Copy>{a.notes}</Copy></View>}</View>)}
  <Text style={{color:'#9aa2ae',fontSize:11,fontWeight:'800',letterSpacing:1.5,marginTop:6}}>BEFORE YOU TOUCH A CLICKER</Text>{beforeYouTune.map((b,i)=><Copy key={i}>• {b}</Copy>)}
 </Card>;
}

/* ------------------------------------------------------------------ Rider profile */
export function RiderProfileView({riderId,onBack,onMessage}:{riderId:string;onBack:()=>void;onMessage:(r:RiderRef)=>void}){
 const [data,setData]=useState<{profile:Profile;posts:{id:string;category:PostCategory;body:string;bike_label:string;created_at:string;photos?:Photo[]}[];bikes?:PublicBike[];mine:boolean}|null>(null),[notice,setNotice]=useState('');
 useEffect(()=>{let live=true;setData(null);setNotice('');api<NonNullable<typeof data>>('/api/profiles?id='+riderId).then(d=>{if(live)setData(d);}).catch(e=>{if(live)setNotice(errorText(e));});return()=>{live=false;};},[riderId]);
 return <Page title=""><BackLink title="Community" onPress={onBack}/><Notice text={notice}/>
  {!data&&!notice&&<Copy>Loading rider…</Copy>}
  {data&&<>
   <View style={{alignItems:'center',gap:8,paddingVertical:8}}>
    <Avatar name={riderName(data.profile)} uri={data.profile.avatar_url} size={92}/>
    <View style={{flexDirection:'row',alignItems:'center',gap:10}}>{!!data.profile.race_number&&<RacePlate number={data.profile.race_number}/>}<Text style={{color:colors.text,fontSize:26,fontWeight:'900',fontStyle:'italic',letterSpacing:-0.6}}>{riderName(data.profile)}</Text></View>
    <Text style={{color:'#adb5c1',fontSize:14}}>@{data.profile.handle}{data.profile.location?' · '+data.profile.location:''}{data.profile.riding_class?' · '+data.profile.riding_class:''}</Text>
    {!!data.profile.bio&&<Text selectable style={{color:colors.text,fontSize:15.5,lineHeight:23,textAlign:'center'}}>{data.profile.bio}</Text>}
    <Text style={{color:'#9aa2ae',fontSize:12.5}}>Riding with BAK MX since {new Date(data.profile.created_at).toLocaleDateString([],{month:'long',year:'numeric'})}</Text>
    {!data.mine&&<RiderActions rider={data.profile} target={{type:'profile',id:data.profile.user_id}} onMessage={onMessage} onBlocked={onBack}/>}
   </View>
   <PublicGarage bikes={data.bikes??[]} raceNumber={data.profile.race_number}/>
   <Eyebrow>RECENT POSTS</Eyebrow>{!data.posts.length&&<Copy>No posts yet.</Copy>}
   <View style={{marginHorizontal:-20}}>{data.posts.map(p=><View key={p.id} style={{paddingVertical:16,gap:10,borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'#262b34'}}><Text style={{color:'#adb5c1',fontSize:12.5,paddingHorizontal:20}}><Text style={{color:colors.text,fontWeight:'700'}}>{POST_CATEGORY_LABELS[p.category]}</Text>{p.bike_label?' · '+p.bike_label:''} · {ago(p.created_at)}</Text><Text selectable style={{color:colors.text,fontSize:16,lineHeight:24,paddingHorizontal:20}}>{p.body}</Text>{!!p.photos?.length&&<PostPhotos photos={p.photos}/>}</View>)}</View>
  </>}
 </Page>;
}

/** Gray placeholder cards that gently pulse while the feed or events load, instead of a line of text. */
function SkeletonList({kind}:{kind:'post'|'event'}){
 const pulse=useRef(new Animated.Value(0.45)).current;
 useEffect(()=>{if(motion.reduced)return;const loop=Animated.loop(Animated.sequence([Animated.timing(pulse,{toValue:0.9,duration:700,useNativeDriver:true}),Animated.timing(pulse,{toValue:0.45,duration:700,useNativeDriver:true})]));loop.start();return()=>loop.stop();},[pulse]);
 const bar=(w:number|`${number}%`,h=12)=><View style={{width:w,height:h,borderRadius:6,backgroundColor:'#20242c'}}/>;
 return <Animated.View accessibilityLabel={kind==='post'?'Loading the feed':'Loading events'} accessibilityRole="progressbar" style={{gap:22,opacity:pulse}}>
  {[0,1,2].slice(0,kind==='post'?2:3).map(i=>kind==='post'
   ?<View key={i} style={{gap:12}}><View style={{flexDirection:'row',gap:10,alignItems:'center'}}><View style={{width:36,height:36,borderRadius:18,backgroundColor:'#20242c'}}/><View style={{gap:7}}>{bar(130)}{bar(90,10)}</View></View>{bar('70%')}<View style={{height:190,borderRadius:14,backgroundColor:'#121418'}}/></View>
   :<View key={i} style={{flexDirection:'row',gap:14,alignItems:'center'}}><View style={{width:46,height:50,borderRadius:10,backgroundColor:'#20242c'}}/><View style={{flex:1,gap:8}}>{bar('75%',14)}{bar('50%',10)}</View></View>)}
 </Animated.View>;
}
