import {PublicGarage,type PublicBike} from './GarageSharing';
import {Fragment,useEffect,useRef,useState,type FormEvent,type ReactNode} from 'react';
import {ArrowLeft,ArrowRight,CalendarDays,Camera,Check,Clock3,Heart,ImagePlus,MapPin,MessageCircle,MessageSquare,MoreHorizontal,Plus,Send,Share2,Trash2,Users,X} from 'lucide-react';
import type {Bike} from '../shared/types';
import {api} from './client';
import {addPhotos,type Photo} from './photos';
import {garageModelInfo} from '../shared/garage-models';
import {adjusters,beforeYouTune,symptomGuides,mechanicalMimics,talkingToYourTuner,workOrder} from '../shared/setup-knowledge';
import {COMMUNITY_RULES,EVENT_TYPE_LABELS,POST_CATEGORY_LABELS,SETUP_FIELDS,SETUP_RESULT_LABELS,riderName,setupDifferences,type EventType,yearRanges,type Part,type PartAssembly,type PartCatalog,type PartFit,type Post,type PostCategory,type PostComment,type Profile,type RideEvent,type RiderRef,type SetupLog,type SetupResult,type ThreadMessage,type ThreadSummary} from '../shared/rider-types';
import './rider.css';

/* Rider surfaces for the web client: Community, Events, Messages, Profile, Feedback, Setup log, Parts.
   Everything here reads and writes through the BAK MX API; nothing is sample data.
   Ported from the phone app (apps/mobile/src/RiderScreens.tsx) so both feel the same. */

const errorText=(e:unknown)=>e instanceof Error&&e.message?e.message:'Something went wrong. Try again.';
const when=(iso:string)=>new Date(iso).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
const day=(iso:string)=>new Date(iso).toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'});
/** "now", "4m", "3h", "2d", then a short date, the way the phone shows post age. */
const ago=(iso:string)=>{const m=Math.round((Date.now()-new Date(iso).getTime())/60000);if(m<1)return 'now';if(m<60)return m+'m';const h=Math.round(m/60);if(h<24)return h+'h';const d=Math.round(h/24);if(d<7)return d+'d';return new Date(iso).toLocaleDateString([],{month:'short',day:'numeric'});};
const options=<T extends string>(labels:Record<T,string>)=>(Object.entries(labels) as [T,string][]).map(([value,label])=>({value,label}));
const bikeLabel=(bike:Bike)=>`${bike.model_year} ${bike.manufacturer} ${bike.model}`;

/* ------------------------------------------------------------------ Small shared pieces */
function Gate({icon,title,children,action}:{icon:ReactNode;title:string;children:ReactNode;action?:ReactNode}){
 return <section className="panel"><div className="empty"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{children}</p>{action}</div></section>;
}
/** One line and a sign-in button: what a signed-out rider sees instead of a feature. */
function SignInLine({onSignIn,children}:{onSignIn?:()=>void;children:ReactNode}){
 return <section className="panel rd-signin"><p>{children}</p>{onSignIn&&<button className="button" onClick={onSignIn}>Sign in <ArrowRight size={16}/></button>}</section>;
}
/** A rider's photo, or their initial when they have none. */
function Avatar({rider,size=40,className=''}:{rider:Pick<RiderRef,'display_name'|'handle'|'avatar_url'>;size?:number;className?:string}){
 const style={width:size,height:size,fontSize:Math.round(size*0.42)};
 if(rider.avatar_url)return <img className={'avatar rd-avatar '+className} src={rider.avatar_url} alt="" style={style}/>;
 return <div className={'avatar rd-avatar '+className} aria-hidden="true" style={style}>{riderName(rider).replace('@','').slice(0,1).toUpperCase()}</div>;
}
/** Single choice as a row of chips: every option visible, one tap. The chosen one carries a check mark. */
export function Choices<T extends string>({label,value,items,onChange,disabled=false}:{label?:string;value:T;items:{value:T;label:string}[];onChange:(v:T)=>void;disabled?:boolean}){
 return <div className="rd-choices" role="radiogroup" aria-label={label}>
  {label&&<span className="rd-choices-label">{label}</span>}
  <div className="rd-chips">{items.map(i=>{const on=i.value===value;return <button type="button" key={i.value} role="radio" aria-checked={on} disabled={disabled} className={'rd-chip'+(on?' on':'')} onClick={()=>onChange(i.value)}>{on&&<Check size={14} strokeWidth={2.6} aria-hidden="true"/>}{i.label}</button>;})}</div>
 </div>;
}
type MenuItem={label:string;onPick:()=>void;danger?:boolean};
/** The "⋯" menu: report, block, delete and the like live here instead of a row of links. */
function MoreMenu({label,items,size=20}:{label:string;items:MenuItem[];size?:number}){
 const [open,setOpen]=useState(false),ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!open)return;const away=(e:PointerEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false);};const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false);};document.addEventListener('pointerdown',away);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',away);document.removeEventListener('keydown',key);};},[open]);
 if(!items.length)return null;
 return <div className="rd-more" ref={ref}>
  <button type="button" className="icon-button rd-more-button" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={()=>setOpen(!open)}><MoreHorizontal size={size}/></button>
  {open&&<div className="rd-menu" role="menu">{items.map(i=><button type="button" key={i.label} role="menuitem" className={'rd-menu-item'+(i.danger?' danger':'')} onClick={()=>{setOpen(false);i.onPick();}}>{i.label}</button>)}</div>}
 </div>;
}
/** Gray placeholder cards that gently pulse while a list loads, instead of a line of text. */
function SkeletonList({kind}:{kind:'post'|'event'|'thread'|'profile'}){
 const rows=kind==='post'?2:kind==='profile'?1:3;
 return <div className={'rd-skeleton '+kind} role="progressbar" aria-label={kind==='post'?'Loading the feed':kind==='event'?'Loading events':kind==='thread'?'Loading conversations':'Loading your profile'}>
  {Array.from({length:rows},(_,i)=>kind==='post'
   ?<div key={i} className="rd-sk-post"><div className="rd-sk-row"><i className="rd-sk-circle"/><div><i className="rd-sk-bar" style={{width:130}}/><i className="rd-sk-bar thin" style={{width:90}}/></div></div><i className="rd-sk-bar" style={{width:'70%'}}/><i className="rd-sk-block"/></div>
   :kind==='event'
   ?<div key={i} className="rd-sk-row"><i className="rd-sk-square"/><div style={{flex:1}}><i className="rd-sk-bar" style={{width:'75%'}}/><i className="rd-sk-bar thin" style={{width:'50%'}}/></div></div>
   :<div key={i} className="rd-sk-row"><i className="rd-sk-circle"/><div style={{flex:1}}><i className="rd-sk-bar" style={{width:'55%'}}/><i className="rd-sk-bar thin" style={{width:'80%'}}/></div></div>)}
 </div>;
}
function useProfile(signedIn:boolean){
 const [profile,setProfile]=useState<Profile|null|undefined>(undefined),[error,setError]=useState('');
 async function load(){try{setProfile(await api<Profile|null>('/profile'));setError('');}catch(e){setError(errorText(e));setProfile(null);}}
 useEffect(()=>{if(signedIn)void load();else setProfile(undefined);},[signedIn]);
 return {profile,setProfile,profileError:error};
}
function NeedsProfile({onSaved,children}:{onSaved:(p:Profile)=>void;children?:ReactNode}){
 return <section className="panel"><span className="eyebrow">ONE STEP FIRST</span><h2>Set up your rider profile</h2>{children&&<p className="subtle">{children}</p>}<ProfileEditor profile={null} onSaved={onSaved} compact/></section>;
}

/* ------------------------------------------------------------------ Profile */
export function ProfileEditor({profile,onSaved,compact=false}:{profile:Profile|null;onSaved:(p:Profile)=>void;compact?:boolean}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();const f=new FormData(e.currentTarget);setBusy(true);setError('');setSaved(false);
  try{
   const next=await api<Profile>('/profile','PUT',{handle:String(f.get('handle')||'').trim().toLowerCase().replace(/[\s-]+/g,'_').replace(/[^a-z0-9_]/g,'').replace(/_+$/,''),display_name:String(f.get('display_name')||''),bio:String(f.get('bio')||''),location:String(f.get('location')||''),riding_class:String(f.get('riding_class')||''),race_number:String(f.get('race_number')||'').replace(/[^0-9]/g,'').slice(0,3),...(profile?{}:{accept_rules:true})});
   onSaved(next);setSaved(true);
  }catch(err){setError(errorText(err));}finally{setBusy(false);}
 }
 return <form onSubmit={submit} className="profile-form">
  {!profile&&<p className="notice">Pick a handle so other riders know who they’re talking to. You can change it later.</p>}
  <div className="form-grid">
   <label className="field"><span>Handle</span><input name="handle" defaultValue={profile?.handle||''} required minLength={3} maxLength={24} autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="e.g. moto_kyle" onInput={e=>{const el=e.currentTarget,clean=el.value.toLowerCase().replace(/[\s-]+/g,'_').replace(/[^a-z0-9_]/g,'').slice(0,24);if(clean!==el.value)el.value=clean;}}/><small>3–24 lowercase letters, numbers or underscores. Spaces become underscores.</small></label>
   <label className="field"><span>Display name</span><input name="display_name" defaultValue={profile?.display_name||''} maxLength={60} placeholder="The name riders see"/></label>
   <label className="field"><span>Home area</span><input name="location" defaultValue={profile?.location||''} maxLength={80} placeholder="e.g. Tampa, FL"/></label>
   <label className="field"><span>Class / riding</span><input name="riding_class" defaultValue={profile?.riding_class||''} maxLength={60} placeholder="e.g. Vet 35+, 450 C"/></label>
   <label className="field"><span>Race number</span><input name="race_number" inputMode="numeric" pattern="[0-9]{0,3}" defaultValue={profile?.race_number||''} maxLength={3} placeholder="e.g. 36"/></label>
  </div>
  {!compact&&<label className="field"><span>About</span><textarea name="bio" rows={3} maxLength={500} defaultValue={profile?.bio||''} placeholder="What you ride, where, what you’re working on"/></label>}
  {!profile&&<div className="rules"><span className="eyebrow">COMMUNITY RULES</span><ul>{COMMUNITY_RULES.map((r,i)=><li key={i}>{r}</li>)}</ul><label className="field check"><input type="checkbox" name="accept" required/><span>I agree to the community rules.</span></label></div>}
  {error&&<div className="error" role="alert">{error}</div>}
  <div className="button-row"><button className="button" type="submit" disabled={busy}>{busy?'Saving…':profile?'Save profile':'Create profile'}<Check size={16}/></button>{saved&&<span className="subtle" role="status">Saved.</span>}</div>
 </form>;
}
export function ProfilePanel({signedIn}:{signedIn:boolean}){
 const {profile,setProfile,profileError}=useProfile(signedIn);
 const [editing,setEditing]=useState(false),[photoBusy,setPhotoBusy]=useState(false),[photoNote,setPhotoNote]=useState(''),[bikes,setBikes]=useState<PublicBike[]>([]);
 const [blocks,setBlocks]=useState<{blocked_id:string;created_at:string}[]>([]);
 useEffect(()=>{if(signedIn)api<{blocked_id:string;created_at:string}[]>('/blocks').then(setBlocks).catch(()=>setBlocks([]));else setBlocks([]);},[signedIn]);
 // The bikes this rider shows on their profile, exactly as other riders see them.
 useEffect(()=>{let live=true;if(!profile){setBikes([]);return;}api<{bikes?:PublicBike[]}>('/profiles?id='+profile.user_id).then(d=>{if(live)setBikes(d.bikes??[]);}).catch(()=>{if(live)setBikes([]);});return()=>{live=false;};},[profile?.user_id]);
 async function changePhoto(){
  if(!profile||photoBusy)return;setPhotoNote('');
  try{
   const picked=await addPhotos('avatar',{square:true});if(!picked.length)return;setPhotoBusy(true);
   // The profile route takes the whole profile, so the current fields go back with the new photo id.
   const saved=await api<Profile>('/profile','PUT',{handle:profile.handle,display_name:profile.display_name||'',bio:profile.bio||'',location:profile.location||'',riding_class:profile.riding_class||'',race_number:profile.race_number||'',avatar_photo_id:picked[0].id});
   setProfile(saved);
  }catch(e){setPhotoNote(errorText(e));}finally{setPhotoBusy(false);}
 }
 if(!signedIn)return <SignInLine>Sign in to set up your rider profile.</SignInLine>;
 if(profile===undefined)return <section className="panel"><span className="eyebrow">RIDER PROFILE</span><SkeletonList kind="profile"/></section>;
 return <section className="panel rd-profile"><span className="eyebrow">RIDER PROFILE</span>
  {profile?<div className="rd-profile-head">
   <button type="button" className="rd-avatar-button" aria-label="Change profile photo" disabled={photoBusy} onClick={()=>void changePhoto()}><Avatar rider={profile} size={64}/><span className="rd-avatar-badge" aria-hidden="true">{photoBusy?<span className="rd-spin"/>:<Camera size={13} strokeWidth={2.2}/>}</span></button>
   <div className="rd-profile-name"><h2>{profile.race_number&&<span className="race-plate">{profile.race_number}</span>}{riderName(profile)}</h2><p className="subtle">@{profile.handle}{profile.location?' · '+profile.location:''}{profile.riding_class?' · '+profile.riding_class:''}</p></div>
   <button type="button" className="text-button" onClick={()=>setEditing(!editing)}>{editing?'Done':'Edit'}</button>
  </div>:<h2>Set up your rider profile</h2>}
  {profile?.bio&&!editing&&<p className="plain-message rd-bio">{profile.bio}</p>}
  {(profileError||photoNote)&&<div className="error" role="alert">{profileError||photoNote}</div>}
  {profile&&!editing&&<p className="subtle rd-photo-hint">Tap your photo to change it. Riders see it on your posts and messages.</p>}
  {(!profile||editing)&&<ProfileEditor profile={profile} onSaved={p=>{setProfile(p);setEditing(false);}}/>}
  {profile&&!editing&&(bikes.length?<PublicGarage bikes={bikes}/>:<p className="subtle">No bikes on your profile yet. Turn on “Show this bike on my profile” in Garage.</p>)}
  {blocks.length>0&&<div className="blocked-list"><h3>Blocked riders</h3>{blocks.map(b=><div key={b.blocked_id} className="row-between"><span className="subtle">Blocked {day(b.created_at)}</span><button className="text-button" onClick={async()=>{try{await api('/blocks?user_id='+b.blocked_id,'DELETE');setBlocks(blocks.filter(x=>x.blocked_id!==b.blocked_id));}catch(e){setPhotoNote(errorText(e));}}}>Unblock</button></div>)}</div>}
 </section>;
}

/* ------------------------------------------------------------------ Report / block */
type Target={type:'post'|'comment'|'event'|'message'|'profile';id:string};
/** The report box or the block confirmation, opened from a "⋯" menu. */
function ModerationPanel({mode,rider,target,onClose,onBlocked}:{mode:'report'|'block';rider:RiderRef;target:Target;onClose:()=>void;onBlocked:()=>void}){
 const [reason,setReason]=useState(''),[busy,setBusy]=useState(false),[note,setNote]=useState(''),[sent,setSent]=useState(false);
 async function report(){if(busy||!reason.trim())return;setBusy(true);setNote('');try{await api('/reports','POST',{target_type:target.type,target_id:target.id,reason});setSent(true);}catch(e){setNote(errorText(e));}finally{setBusy(false);}}
 async function block(){if(busy)return;setBusy(true);setNote('');try{await api('/blocks?user_id='+rider.user_id,'PUT');onBlocked();}catch(e){setNote(errorText(e));setBusy(false);}}
 if(sent)return <div className="rd-mod" role="status"><p>Report received. We review reports and remove content that breaks the rules.</p><button type="button" className="text-button" onClick={onClose}>Done</button></div>;
 return <div className="rd-mod">
  {mode==='report'?<>
   <label className="field"><span>What’s wrong with this?</span><textarea rows={2} maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)} autoFocus/></label>
   <div className="button-row"><button type="button" className="button secondary" disabled={busy||!reason.trim()} onClick={()=>void report()}>{busy?'Sending…':'Send report'}</button><button type="button" className="text-button" onClick={onClose}>Cancel</button></div>
  </>:<>
   <p>Block {riderName(rider)}? You won’t see their posts, events or messages, and they won’t see yours.</p>
   <div className="button-row"><button type="button" className="button secondary rd-danger" disabled={busy} onClick={()=>void block()}>{busy?'Blocking…':'Block '+riderName(rider)}</button><button type="button" className="text-button" onClick={onClose}>Cancel</button></div>
  </>}
  {note&&<div className="error" role="alert">{note}</div>}
 </div>;
}
/** Message plus a "⋯" menu with Report and Block, for events, threads and profiles. */
function RiderActions({rider,target,onBlocked,onMessage,showMessage=true}:{rider:RiderRef;target:Target;onBlocked:()=>void;onMessage?:(r:RiderRef)=>void;showMessage?:boolean}){
 const [mode,setMode]=useState<''|'report'|'block'>('');
 return <div className="rd-actions">
  <div className="rd-actions-row">
   {onMessage&&showMessage&&<button type="button" className="text-button" onClick={()=>onMessage(rider)}><MessageCircle size={15}/>Message</button>}
   <MoreMenu label={'More about '+riderName(rider)} items={[...(onMessage&&!showMessage?[{label:'Message',onPick:()=>onMessage(rider)}]:[]),{label:'Report',onPick:()=>setMode('report')},{label:'Block',danger:true,onPick:()=>setMode('block')}]}/>
  </div>
  {mode&&<ModerationPanel mode={mode} rider={rider} target={target} onClose={()=>setMode('')} onBlocked={onBlocked}/>}
 </div>;
}

/* ------------------------------------------------------------------ Community */
const FILTERS:{value:PostCategory|'';label:string}[]=[{value:'',label:'All'},{value:'build',label:'Builds'},{value:'setup_question',label:'Setup questions'},{value:'ride_plan',label:'Ride plans'},{value:'general',label:'General'}];
export function Community({signedIn,bike,onSignIn,onMessage}:{signedIn:boolean;bike?:Bike;onSignIn:()=>void;onMessage:(r:RiderRef)=>void}){
 const {profile,setProfile}=useProfile(signedIn);
 const [posts,setPosts]=useState<Post[]>([]),[filter,setFilter]=useState<PostCategory|''>(''),[loading,setLoading]=useState(false),[error,setError]=useState(''),[composing,setComposing]=useState(false),[openPost,setOpenPost]=useState(''),[viewing,setViewing]=useState('');
 const live=useRef(0);
 async function load(){const run=++live.current;setLoading(true);try{const data=await api<Post[]>('/posts'+(filter?'?category='+filter:''));if(run===live.current){setPosts(data);setError('');}}catch(e){if(run===live.current)setError(errorText(e));}finally{if(run===live.current)setLoading(false);}}
 useEffect(()=>{if(signedIn&&profile)void load();},[signedIn,profile?.user_id,filter]);
 async function toggleLike(p:Post){
  setPosts(old=>old.map(x=>x.id===p.id?{...x,liked:!p.liked,like_count:p.like_count+(p.liked?-1:1)}:x));
  try{await api('/likes?post_id='+p.id,p.liked?'DELETE':'PUT');}catch(e){setError(errorText(e));void load();}
 }
 async function remove(p:Post){if(!confirm('Delete this post?'))return;try{await api('/posts?id='+p.id,'DELETE');setPosts(old=>old.filter(x=>x.id!==p.id));}catch(e){setError(errorText(e));}}
 if(!signedIn)return <SignInLine onSignIn={onSignIn}>Sign in to see builds, setup questions and ride plans from riders on gas MX bikes.</SignInLine>;
 if(profile===undefined)return <SkeletonList kind="post"/>;
 if(!profile)return <NeedsProfile onSaved={setProfile}>Builds, setup questions and ride plans from riders on gas MX bikes.</NeedsProfile>;
 return <>
  <div className="rd-feedhead">
   {!composing&&<button type="button" className="rd-start" onClick={()=>setComposing(true)}><Avatar rider={profile} size={38}/><span>What’s on the bike?</span><Plus size={18} aria-hidden="true"/></button>}
   <div className="rd-filters" role="tablist" aria-label="Post filters">{FILTERS.map(f=><button type="button" role="tab" key={f.label} aria-selected={filter===f.value} className={'rd-filter'+(filter===f.value?' on':'')} onClick={()=>setFilter(f.value)}>{f.label}</button>)}</div>
  </div>
  {composing&&<Composer profile={profile} bike={bike} onClose={()=>setComposing(false)} onPosted={()=>{setComposing(false);void load();}}/>}
  {error&&<div className="error" role="alert">{error}<button className="icon-button" aria-label="Dismiss" onClick={()=>setError('')}><X size={16}/></button></div>}
  {viewing&&<RiderProfile riderId={viewing} onClose={()=>setViewing('')} onMessage={onMessage}/>}
  {loading&&!posts.length&&<SkeletonList kind="post"/>}
  {!loading&&!posts.length&&<Gate icon={<Users size={26}/>} title="Nothing here yet.">Be the first to post a build, a setup question or a ride plan.</Gate>}
  <div className="feed rd-feed">{posts.map(p=><PostCard key={p.id} post={p} open={openPost===p.id} onOpen={()=>setOpenPost(openPost===p.id?'':p.id)} onLike={()=>void toggleLike(p)} onDelete={()=>void remove(p)} onRider={()=>setViewing(p.user_id)} onMessage={onMessage} onBlocked={()=>setPosts(old=>old.filter(x=>x.user_id!==p.user_id))} onCount={n=>setPosts(prev=>prev.map(x=>x.id===p.id?{...x,comment_count:n}:x))}/>)}</div>
 </>;
}
/** Share through the device sheet when the browser has one; otherwise copy the text and link. */
async function sharePost(p:Post):Promise<string>{
 const text=`${riderName(p.author)} on BAK MX:\n\n${p.body}`,url=location.origin+location.pathname;
 try{
  if(typeof navigator.share==='function'){await navigator.share({title:'BAK MX',text,url});return '';}
  await navigator.clipboard.writeText(text+'\n\n'+url);return 'Copied. Paste it anywhere.';
 }catch(e){return (e as Error).name==='AbortError'?'':'Could not share this post.';}
}
function PostCard({post:p,open,onOpen,onLike,onDelete,onRider,onMessage,onBlocked,onCount}:{post:Post;open:boolean;onOpen:()=>void;onLike:()=>void;onDelete:()=>void;onRider:()=>void;onMessage:(r:RiderRef)=>void;onBlocked:()=>void;onCount:(n:number)=>void}){
 const [full,setFull]=useState(false),[mode,setMode]=useState<''|'report'|'block'>(''),[note,setNote]=useState('');
 const long=p.body.length>320||p.body.split('\n').length>6;
 const menu:MenuItem[]=p.mine?[{label:'Delete post',danger:true,onPick:onDelete}]:[{label:'Message',onPick:()=>onMessage(p.author)},{label:'View profile',onPick:onRider},{label:'Report post',onPick:()=>setMode('report')},{label:'Block',danger:true,onPick:()=>setMode('block')}];
 return <article className="panel post rd-post">
  <header className="rd-post-head">
   <button type="button" className="rd-plain" aria-label={'View '+riderName(p.author)} onClick={onRider}><Avatar rider={p.author} size={42}/></button>
   <button type="button" className="rd-plain rd-post-who" onClick={onRider}>
    <strong>{riderName(p.author)} <span className="subtle">· {ago(p.created_at)}</span></strong>
    <span className="rd-context"><b>{POST_CATEGORY_LABELS[p.category]}</b>{p.bike_label?' · '+p.bike_label:p.author.location?' · '+p.author.location:''}</span>
   </button>
   <MoreMenu label="More options" items={menu}/>
  </header>
  <p className={'plain-message rd-body'+(long&&!full?' clipped':'')}>{p.body}</p>
  {long&&<button type="button" className="text-button rd-seemore" onClick={()=>setFull(!full)}>{full?'Show less':'See more'}</button>}
  {!!p.photos?.length&&<div className={'post-photos n'+Math.min(p.photos.length,4)}>{p.photos.map(ph=><a key={ph.id} href={ph.url} target="_blank" rel="noreferrer"><img src={ph.url} alt="" loading="lazy"/></a>)}</div>}
  {mode&&<ModerationPanel mode={mode} rider={p.author} target={{type:'post',id:p.id}} onClose={()=>setMode('')} onBlocked={onBlocked}/>}
  <footer className="rd-post-foot">
   <button type="button" className={'rd-act'+(p.liked?' liked':'')} aria-pressed={p.liked} aria-label={p.liked?'Unlike':'Like'} onClick={onLike}><Heart size={21} fill={p.liked?'currentColor':'none'}/>{p.like_count>0&&<span>{p.like_count}</span>}</button>
   <button type="button" className="rd-act" aria-expanded={open} aria-label="Comments" onClick={onOpen}><MessageSquare size={20}/>{p.comment_count>0&&<span>{p.comment_count}</span>}</button>
   <button type="button" className="rd-act" aria-label="Share" onClick={()=>void sharePost(p).then(n=>{setNote(n);if(n)setTimeout(()=>setNote(''),2500);})}><Share2 size={20}/></button>
   {note&&<span className="subtle rd-note" role="status">{note}</span>}
  </footer>
  {!open&&p.comment_count>0&&<button type="button" className="text-button rd-viewcomments" onClick={onOpen}>View {p.comment_count===1?'1 comment':`all ${p.comment_count} comments`}</button>}
  {open&&<Comments post={p} onCount={onCount}/>}
 </article>;
}
/** New post: category chips, the bike tag, up to four photos. */
function Composer({profile,bike,onClose,onPosted}:{profile:Profile;bike?:Bike;onClose:()=>void;onPosted:()=>void}){
 const [category,setCategory]=useState<PostCategory>('setup_question'),[body,setBody]=useState(''),[tagBike,setTagBike]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[photos,setPhotos]=useState<Photo[]>([]),[uploading,setUploading]=useState(0);
 const ready=!!body.trim()&&!busy&&!uploading,room=4-photos.length;
 const hint={build:'What you did to the bike and how it turned out',setup_question:'What the bike is doing, where, and what you’ve tried',ride_plan:'Where, when, and who should come',general:'What’s on your mind'}[category];
 async function publish(e:FormEvent){e.preventDefault();if(!ready)return;setBusy(true);setError('');try{await api('/posts','POST',{category,body,bike_label:tagBike&&bike?bikeLabel(bike):'',photo_ids:photos.map(p=>p.id)});onPosted();}catch(err){setError(errorText(err));}finally{setBusy(false);}}
 async function add(capture:boolean){
  if(room<1||uploading)return;setError('');
  try{const added=await addPhotos('post',{limit:room,capture,onProgress:(done,total)=>setUploading(Math.max(0,total-done))});setPhotos(old=>[...old,...added].slice(0,4));}
  catch(err){setError(errorText(err));}finally{setUploading(0);}
 }
 function removePhoto(id:string){setPhotos(old=>old.filter(p=>p.id!==id));void api('/photos?id='+id,'DELETE').catch(()=>{});}
 return <section className="panel rd-compose"><form onSubmit={publish}>
  <div className="rd-compose-head"><Avatar rider={profile} size={44}/><div><strong>{riderName(profile)}</strong>
   {bike&&<button type="button" role="checkbox" aria-checked={tagBike} className={'rd-biketag'+(tagBike?' on':'')} onClick={()=>setTagBike(!tagBike)}>{tagBike&&<Check size={13} strokeWidth={2.6} aria-hidden="true"/>}{tagBike?bikeLabel(bike):'Tag my bike'}</button>}
  </div><button type="button" className="icon-button" aria-label="Cancel" onClick={onClose}><X size={18}/></button></div>
  <Choices value={category} items={options(POST_CATEGORY_LABELS)} onChange={setCategory} disabled={busy}/>
  <textarea className="rd-compose-text" autoFocus value={body} onChange={e=>setBody(e.target.value)} maxLength={4000} rows={5} placeholder={hint} aria-label="Post" disabled={busy}/>
  {(photos.length>0||uploading>0)&&<div className="rd-thumbs">{photos.map(ph=><div className="rd-thumb" key={ph.id}><img src={ph.url} alt=""/><button type="button" className="rd-thumb-x" aria-label="Remove photo" onClick={()=>removePhoto(ph.id)}><X size={13} strokeWidth={2.6}/></button></div>)}{Array.from({length:uploading},(_,i)=><div className="rd-thumb uploading" key={'up'+i} aria-label="Uploading photo"><span className="rd-spin"/></div>)}</div>}
  {error&&<div className="error" role="alert">{error}</div>}
  <div className="rd-compose-bar">
   <button type="button" className="rd-tool" disabled={room<1||!!uploading} onClick={()=>void add(true)}><Camera size={21}/>Camera</button>
   <button type="button" className="rd-tool" disabled={room<1||!!uploading} onClick={()=>void add(false)}><ImagePlus size={21}/>Photos</button>
   <span className="subtle rd-count">{photos.length?`${photos.length}/4 photos`:body.length>3500?`${4000-body.length} left`:'Up to 4 photos'}</span>
   <button className="button" type="submit" disabled={!ready}>{busy?'Posting…':'Post'}<Send size={15}/></button>
  </div>
 </form></section>;
}
function Comments({post,onCount}:{post:Post;onCount:(n:number)=>void}){
 const [comments,setComments]=useState<PostComment[]>([]),[text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[loaded,setLoaded]=useState(false),[mod,setMod]=useState<{id:string;mode:'report'|'block'}|null>(null);
 async function load(){try{const data=await api<PostComment[]>('/comments?post_id='+post.id);setComments(data);onCount(data.length);setError('');}catch(e){setError(errorText(e));}finally{setLoaded(true);}}
 useEffect(()=>{void load();},[post.id]);
 async function add(e:FormEvent){e.preventDefault();if(!text.trim()||busy)return;setBusy(true);setError('');try{await api('/comments','POST',{post_id:post.id,body:text});setText('');await load();}catch(err){setError(errorText(err));}finally{setBusy(false);}}
 async function remove(c:PostComment){try{await api('/comments?id='+c.id,'DELETE');await load();}catch(e){setError(errorText(e));}}
 return <div className="rd-comments">
  {!loaded&&<SkeletonList kind="thread"/>}
  {comments.map(c=><div className="rd-comment" key={c.id}>
   <Avatar rider={c.author} size={30}/>
   <div className="rd-comment-body"><p className="plain-message"><strong>{riderName(c.author)} </strong>{c.body}</p><span className="subtle">{ago(c.created_at)}</span>
    {mod?.id===c.id&&<ModerationPanel mode={mod.mode} rider={c.author} target={{type:'comment',id:c.id}} onClose={()=>setMod(null)} onBlocked={()=>{setMod(null);setComments(old=>old.filter(x=>x.user_id!==c.user_id));}}/>}
   </div>
   <MoreMenu size={17} label="More about this comment" items={c.mine?[{label:'Delete comment',danger:true,onPick:()=>void remove(c)}]:[{label:'Report comment',onPick:()=>setMod({id:c.id,mode:'report'})},{label:'Block',danger:true,onPick:()=>setMod({id:c.id,mode:'block'})}]}/>
  </div>)}
  {error&&<div className="error" role="alert">{error}</div>}
  <form className="rd-comment-form" onSubmit={add}><input aria-label="Add a comment" value={text} onChange={e=>setText(e.target.value)} maxLength={2000} placeholder="Add a comment…" disabled={busy}/><button className="rd-send" type="submit" aria-label="Post comment" disabled={busy||!text.trim()}><Send size={16}/></button></form>
 </div>;
}

/* ------------------------------------------------------------------ Events */
export function Events({signedIn,onSignIn,onMessage}:{signedIn:boolean;onSignIn:()=>void;onMessage:(r:RiderRef)=>void}){
 const {profile,setProfile}=useProfile(signedIn);
 const [events,setEvents]=useState<RideEvent[]>([]),[scope,setScope]=useState<'upcoming'|'past'>('upcoming'),[creating,setCreating]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[formError,setFormError]=useState(''),[open,setOpen]=useState(''),[loading,setLoading]=useState(false),[type,setType]=useState<EventType>('practice'),[rsvpBusy,setRsvpBusy]=useState('');
 async function load(){setLoading(true);try{setEvents(await api<RideEvent[]>('/events?scope='+scope));setError('');}catch(e){setError(errorText(e));}finally{setLoading(false);}}
 useEffect(()=>{if(signedIn&&profile)void load();},[signedIn,profile?.user_id,scope]);
 async function create(e:FormEvent<HTMLFormElement>){
  e.preventDefault();const form=e.currentTarget,f=new FormData(form);setBusy(true);setFormError('');
  try{
   const title=String(f.get('title')||'').trim(),place=String(f.get('location_name')||'').trim();
   if(!title||!place)throw Error('Enter the event name and the track or location.');
   const start=new Date(String(f.get('starts_at')));if(!Number.isFinite(start.getTime()))throw Error('Pick a start date and time.');
   const endRaw=String(f.get('ends_at')||''),end=endRaw?new Date(endRaw):null;
   if(end&&!Number.isFinite(end.getTime()))throw Error('The end time could not be read. Fix it, or clear it.');
   if(end&&end<start)throw Error('The end time is before the start. Change the end, or clear it.');
   await api('/events','POST',{title,event_type:type,starts_at:start.toISOString(),ends_at:end?end.toISOString():null,location_name:place,description:String(f.get('description')||'')});
   form.reset();setCreating(false);setScope('upcoming');await load();
  }catch(err){setFormError(errorText(err));}finally{setBusy(false);}
 }
 async function rsvp(ev:RideEvent,status:'going'|'interested'){
  setRsvpBusy(ev.id);
  try{if(ev.my_rsvp===status)await api('/rsvps?event_id='+ev.id,'DELETE');else await api('/rsvps','PUT',{event_id:ev.id,status});await load();}catch(e){setError(errorText(e));}finally{setRsvpBusy('');}
 }
 if(!signedIn)return <SignInLine onSignIn={onSignIn}>Sign in to see ride days, races, practice nights, clinics and meetups posted by riders.</SignInLine>;
 if(profile===undefined)return <SkeletonList kind="event"/>;
 if(!profile)return <NeedsProfile onSaved={setProfile}>Ride days, races, practice nights, clinics and meetups posted by riders.</NeedsProfile>;
 return <>
  <div className="feed-bar"><div className="tabs"><button className={scope==='upcoming'?'active':''} onClick={()=>setScope('upcoming')}>Upcoming</button><button className={scope==='past'?'active':''} onClick={()=>setScope('past')}>Past</button></div>{!creating&&<button className="button" onClick={()=>{setFormError('');setCreating(true);}}><Plus size={16}/>Post an event</button>}</div>
  {error&&<div className="error" role="alert">{error}<button className="icon-button" aria-label="Dismiss" onClick={()=>setError('')}><X size={16}/></button></div>}
  {creating&&<section className="panel rd-eventform"><form onSubmit={create} noValidate>
   <div className="panel-title"><h3>New event</h3><button type="button" className="text-button" onClick={()=>{setFormError('');setCreating(false);}}>Cancel</button></div>
   <label className="field"><span>Event name</span><input name="title" maxLength={120} placeholder="e.g. Saturday practice at Dade City" disabled={busy}/></label>
   <Choices label="Type" value={type} items={options(EVENT_TYPE_LABELS)} onChange={setType} disabled={busy}/>
   <div className="form-grid">
    <label className="field"><span>Starts</span><input name="starts_at" type="datetime-local" disabled={busy}/></label>
    <label className="field"><span>Ends (optional)</span><input name="ends_at" type="datetime-local" disabled={busy}/></label>
   </div>
   <label className="field"><span>Track or location</span><input name="location_name" maxLength={160} placeholder="Track name or address" disabled={busy}/></label>
   <label className="field"><span>Details</span><textarea name="description" rows={3} maxLength={4000} placeholder="Gate time, classes, cost, what to bring" disabled={busy}/></label>
   {formError&&<div className="error" role="alert">{formError}</div>}
   <div className="button-row"><button className="button" type="submit" disabled={busy}>{busy?'Saving…':'Publish event'}</button></div>
  </form></section>}
  {loading&&!events.length&&<SkeletonList kind="event"/>}
  {!loading&&!events.length&&<Gate icon={<CalendarDays size={26}/>} title={scope==='upcoming'?'No upcoming events yet.':'No past events.'}>{scope==='upcoming'?'Post the next ride day or practice night so other riders can plan around it.':'Events you could see are listed here after they happen.'}</Gate>}
  <div className="feed rd-events">{events.map(ev=>{const past=scope==='past',canceled=!!ev.canceled_at;return <article className={'panel event rd-event'+(canceled?' canceled':'')} key={ev.id}>
   <div className="event-date" aria-hidden="true"><span>{new Date(ev.starts_at).toLocaleDateString([],{month:'short'}).toUpperCase()}</span><strong>{new Date(ev.starts_at).getDate()}</strong></div>
   <div className="event-body">
    <div className="rd-tags"><span className="rd-tag"><i/>{EVENT_TYPE_LABELS[ev.event_type]}</span>{canceled?<span className="rd-badge bad">Canceled</span>:past?<span className="rd-badge past">Past</span>:ev.my_rsvp==='going'?<span className="rd-badge good"><Check size={12} strokeWidth={2.8}/>Going</span>:ev.my_rsvp==='interested'?<span className="rd-badge">Interested</span>:null}</div>
    <h3>{ev.title}</h3>
    <p className="rd-eventline"><Clock3 size={15}/><span>{when(ev.starts_at)}{ev.ends_at?' – '+when(ev.ends_at):''}</span></p>
    <p className="rd-eventline"><MapPin size={15}/><span>{ev.location_name}</span></p>
    <p className="rd-host"><Avatar rider={ev.host} size={22}/><span className="subtle">Hosted by {riderName(ev.host)} · {ev.going_count} going · {ev.interested_count} interested</span></p>
    {open===ev.id&&ev.description&&<p className="plain-message">{ev.description}</p>}
    {!canceled&&!past&&<div className="rd-rsvp" role="group" aria-label="Your RSVP">
     <button type="button" className={'rd-rsvp-button'+(ev.my_rsvp==='going'?' on':'')} aria-pressed={ev.my_rsvp==='going'} disabled={rsvpBusy===ev.id} onClick={()=>void rsvp(ev,'going')}>{ev.my_rsvp==='going'&&<Check size={15} strokeWidth={2.6}/>}{ev.my_rsvp==='going'?'Going':'I’m going'}</button>
     <button type="button" className={'rd-rsvp-button'+(ev.my_rsvp==='interested'?' on':'')} aria-pressed={ev.my_rsvp==='interested'} disabled={rsvpBusy===ev.id} onClick={()=>void rsvp(ev,'interested')}>{ev.my_rsvp==='interested'&&<Check size={15} strokeWidth={2.6}/>}Interested</button>
    </div>}
    <div className="rd-actions-row">
     {ev.description&&<button className="text-button" onClick={()=>setOpen(open===ev.id?'':ev.id)}>{open===ev.id?'Hide details':'Details'}</button>}
     {ev.mine&&<button className="text-button" onClick={async()=>{try{await api('/events?id='+ev.id,'PATCH',{canceled:!ev.canceled_at});await load();}catch(e){setError(errorText(e));}}}>{ev.canceled_at?'Restore event':'Cancel event'}</button>}
     {ev.mine&&<button className="text-button rd-danger-text" onClick={async()=>{if(!confirm('Delete this event?'))return;try{await api('/events?id='+ev.id,'DELETE');await load();}catch(e){setError(errorText(e));}}}><Trash2 size={14}/>Delete</button>}
     {!ev.mine&&<RiderActions rider={ev.host} target={{type:'event',id:ev.id}} onMessage={onMessage} onBlocked={()=>void load()}/>}
    </div>
   </div>
  </article>;})}</div>
 </>;
}

/* ------------------------------------------------------------------ Messages */
export function Messages({signedIn,onSignIn,startWith,onStarted}:{signedIn:boolean;onSignIn:()=>void;startWith:RiderRef|null;onStarted:()=>void}){
 const {profile,setProfile}=useProfile(signedIn);
 const [threads,setThreads]=useState<ThreadSummary[]|null>(null),[active,setActive]=useState<RiderRef|null>(null),[messages,setMessages]=useState<ThreadMessage[]|null>(null),[text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[listError,setListError]=useState('');
 const endRef=useRef<HTMLDivElement>(null);
 async function loadThreads(){try{setThreads(await api<ThreadSummary[]>('/threads'));setListError('');}catch(e){setListError(errorText(e));setThreads(old=>old??[]);}}
 async function open(rider:RiderRef){setActive(rider);setMessages(null);setError('');try{const data=await api<{rider:RiderRef;messages:ThreadMessage[]}>('/thread?with='+rider.user_id);setMessages(data.messages);void loadThreads();}catch(e){setError(errorText(e));setMessages([]);}}
 useEffect(()=>{if(signedIn&&profile)void loadThreads();},[signedIn,profile?.user_id]);
 useEffect(()=>{if(startWith&&profile){void open(startWith);onStarted();}},[startWith?.user_id,profile?.user_id]);
 useEffect(()=>{endRef.current?.scrollIntoView({block:'end'});},[messages?.length,active?.user_id]);
 async function send(e:FormEvent){e.preventDefault();if(!active||!text.trim()||busy)return;setBusy(true);setError('');try{const sent=await api<ThreadMessage>('/thread','POST',{recipient_id:active.user_id,body:text});setMessages(old=>[...(old??[]),sent]);setText('');void loadThreads();}catch(err){setError(errorText(err));}finally{setBusy(false);}}
 if(!signedIn)return <SignInLine onSignIn={onSignIn}>Sign in to message other riders from a post or an event.</SignInLine>;
 if(profile===undefined)return <SkeletonList kind="thread"/>;
 if(!profile)return <NeedsProfile onSaved={setProfile}>Message a rider from a post or an event.</NeedsProfile>;
 return <div className="chat-layout rd-chat">
  <aside className={'panel history rd-threads'+(active?' has-active':'')}><div className="panel-title"><h3 className="sr-only">Messages</h3></div>
   {listError&&<div className="error" role="alert">{listError}</div>}
   {threads===null&&<SkeletonList kind="thread"/>}
   {threads&&!threads.length&&<p className="subtle">No conversations yet. Use “Message” on a post or event to start one. Messages are private between you and the other rider.</p>}
   {threads?.map(t=><button key={t.rider.user_id} className={'rd-thread'+(active?.user_id===t.rider.user_id?' selected':'')+(t.unread?' rd-has-unread':'')} aria-label={`${riderName(t.rider)}${t.unread?`, ${t.unread} new`:''}`} onClick={()=>void open(t.rider)}>
    <Avatar rider={t.rider} size={42}/>
    <span className="rd-thread-text"><span className="rd-thread-top"><strong>{riderName(t.rider)}</strong><time>{ago(t.last_message.created_at)}</time></span><small>{t.last_message.mine?'You: ':''}{t.last_message.body}</small></span>
    {t.unread>0&&<i className="rd-unread" aria-hidden="true"/>}
   </button>)}
  </aside>
  <section className="panel conversation rd-conversation">
   {!active?<div className="chat-welcome"><MessageCircle size={30}/><h2>Pick a conversation</h2><p>Messages are private between you and the other rider.</p></div>:<>
    <div className="chat-context rd-chat-head"><button className="icon-button thread-back" aria-label="Back to conversations" onClick={()=>{setActive(null);void loadThreads();}}><ArrowLeft size={18}/></button><Avatar rider={active} size={36}/><div><strong>{riderName(active)}</strong><p>@{active.handle}{active.location?' · '+active.location:''}</p></div>
     <div className="rd-chat-more"><RiderActions rider={active} target={{type:'profile',id:active.user_id}} showMessage={false} onBlocked={()=>{setActive(null);void loadThreads();}}/></div></div>
    <div className="messages rd-messages" aria-live="polite">
     {messages===null&&<SkeletonList kind="thread"/>}
     {messages&&!messages.length&&<p className="subtle">No messages yet. Say hello.</p>}
     {messages?.map(m=><div key={m.id} className={'rd-bubble'+(m.mine?' mine':'')}><p className="plain-message">{m.body}</p><time>{when(m.created_at)}</time></div>)}
     <div ref={endRef}/>
    </div>
    {error&&<div className="error" role="alert">{error}</div>}
    <form className="composer rd-composer" onSubmit={send}><textarea value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();e.currentTarget.form?.requestSubmit();}}} maxLength={4000} rows={1} aria-label={'Message '+riderName(active)} placeholder={'Message '+riderName(active)} disabled={busy}/><div><span>Be the rider you’d want pitted next to.</span><button className="send-button" type="submit" aria-label="Send message" disabled={busy||!text.trim()}><Send size={18}/></button></div></form>
   </>}
  </section>
 </div>;
}

/* ------------------------------------------------------------------ Feedback */
const FEEDBACK_KINDS=[{value:'answer_quality',label:'An answer BAK gave'},{value:'missing_data',label:'Missing data for my bike'},{value:'bug',label:'Something broken'},{value:'idea',label:'An idea'},{value:'other',label:'Something else'}] as const;
type FeedbackKind=typeof FEEDBACK_KINDS[number]['value'];
export function Feedback({signedIn,bike}:{signedIn:boolean;bike?:Bike}){
 const [category,setCategory]=useState<FeedbackKind>('missing_data'),[body,setBody]=useState(''),[expected,setExpected]=useState(''),[busy,setBusy]=useState(false),[note,setNote]=useState(''),[error,setError]=useState('');
 if(!signedIn)return <SignInLine>Sign in to send feedback.</SignInLine>;
 const prompt={answer_quality:'Which question, and what was wrong or missing in the answer?',missing_data:'Which spec, setting or part is missing, and for which bike?',bug:'What did you tap, what happened, and what should have happened?',idea:'What would you like BAK to do, and when would you use it?',other:'Tell us what’s on your mind.'}[category];
 async function submit(e:FormEvent){
  e.preventDefault();if(!body.trim()||busy)return;setBusy(true);setError('');setNote('');
  try{await api('/feedback','POST',{category,body:expected.trim()?`${body.trim()}\n\nExpected: ${expected.trim()}`:body,context:{client:'web',bike:bike?bikeLabel(bike):null,page:location.pathname+location.hash,screen:`${window.innerWidth}×${window.innerHeight}`}});setBody('');setExpected('');setNote('Thanks — this goes straight to the build list.');}
  catch(err){setError(errorText(err));}finally{setBusy(false);}
 }
 return <section className="panel rd-feedback"><span className="eyebrow">FEEDBACK</span><h2>Tell us what’s missing or wrong.</h2><p className="subtle">A wrong answer, a missing spec for your bike, a bug, an idea. Be specific; it gets read.</p>
  <form onSubmit={submit}>
   <Choices label="About" value={category} items={FEEDBACK_KINDS.map(k=>({value:k.value,label:k.label}))} onChange={setCategory} disabled={busy}/>
   <label className="field"><span>What happened</span><textarea value={body} onChange={e=>setBody(e.target.value)} rows={4} maxLength={3500} required placeholder={prompt} disabled={busy}/></label>
   {(category==='bug'||category==='answer_quality')&&<label className="field"><span>What you expected (optional)</span><input value={expected} onChange={e=>setExpected(e.target.value)} maxLength={400} placeholder="The answer or behaviour you were after" disabled={busy}/></label>}
   <p className="subtle rd-feedback-note">{bike?`Sent with your bike (${bikeLabel(bike)}) and this page. `:'Sent with this page. '}Screenshots can’t be attached yet, so say where it happened.</p>
   {error&&<div className="error" role="alert">{error}</div>}{note&&<p className="notice" role="status">{note}</p>}
   <button className="button" type="submit" disabled={busy||!body.trim()}>{busy?'Sending…':'Send feedback'}</button>
  </form>
 </section>;
}

/* ------------------------------------------------------------------ Setup log */
export function SetupLogPanel({bike,signedIn,onAsk}:{bike?:Bike;signedIn:boolean;onAsk?:(text:string)=>void}){
 const [logs,setLogs]=useState<SetupLog[]|null>(null),[adding,setAdding]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState<SetupResult>('not_tested');
 async function load(){if(!bike)return;try{setLogs(await api<SetupLog[]>('/setup-logs?bike_id='+bike.id));setError('');}catch(e){setError(errorText(e));setLogs(old=>old??[]);}}
 useEffect(()=>{setLogs(null);setAdding(false);if(signedIn&&bike)void load();},[bike?.id,signedIn]);
 if(!signedIn)return <SignInLine>Sign in to keep a setup log for your bike.</SignInLine>;
 if(!bike)return null;
 const latest=logs?.[0];
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();const f=new FormData(e.currentTarget),settings:Record<string,string|null>={};
  for(const field of SETUP_FIELDS){const v=String(f.get(field.key)||'').trim();settings[field.key]=v||null;}
  setBusy(true);setError('');
  try{
   const date=String(f.get('recorded_at')||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Pick the date you rode.');
   const hoursRaw=String(f.get('engine_hours')||'').trim(),hours=hoursRaw===''?null:Number(hoursRaw);
   if(hours!==null&&(!Number.isFinite(hours)||hours<0))throw Error('Hours must be zero or greater.');
   await api('/setup-logs','POST',{bike_id:bike!.id,recorded_at:new Date(date+'T12:00:00').toISOString(),track:String(f.get('track')||''),conditions:String(f.get('conditions')||''),engine_hours:hours,settings,change_made:String(f.get('change_made')||''),result,notes:String(f.get('notes')||'')});
   setAdding(false);setResult('not_tested');await load();
  }catch(err){setError(errorText(err));}finally{setBusy(false);}
 }
 function describe(log:SetupLog){const set=SETUP_FIELDS.filter(f=>log.settings[f.key]!==null&&log.settings[f.key]!==undefined&&log.settings[f.key]!=='');return set.map(f=>`${f.label}: ${log.settings[f.key]}`).join('; ');}
 return <section className="panel setup-log rd-setuplog">
  <div className="panel-title"><div><h2>Setup log</h2><p className="subtle">One change, how it rode. That’s it.</p></div>{!adding&&<button className="button" onClick={()=>{setResult('not_tested');setAdding(true);}}><Plus size={16}/>Log a setup</button>}</div>
  {error&&<div className="error" role="alert">{error}</div>}
  {adding&&<form onSubmit={save} className="service-form setup-log-form rd-logform" noValidate>
   <label className="field"><span>What did you change?</span><input name="change_made" maxLength={1000} placeholder="Fork comp 2 softer" autoFocus disabled={busy}/></label>
   <Choices label="How was it?" value={result} items={options(SETUP_RESULT_LABELS)} onChange={setResult} disabled={busy}/>
   <label className="field"><span>Track</span><input name="track" maxLength={120} placeholder="Dade City" disabled={busy}/></label>
   <label className="field"><span>Notes</span><textarea name="notes" rows={2} maxLength={4000} placeholder="Better in the ruts, still kicks in the whoops" disabled={busy}/></label>
   <details className="editor-more"><summary>Conditions, date and hours</summary><div className="form-grid">
    <label className="field"><span>Conditions</span><input name="conditions" maxLength={200} placeholder="Sand, hard-pack, wet…" disabled={busy}/></label>
    <label className="field"><span>Date</span><input type="date" name="recorded_at" defaultValue={new Date().toISOString().slice(0,10)} disabled={busy}/></label>
    <label className="field"><span>Hours</span><input name="engine_hours" type="number" inputMode="decimal" min="0" step="0.1" defaultValue={bike.engine_hours??''} placeholder="Unknown" disabled={busy}/></label>
   </div></details>
   <details className="editor-more"><summary>Full settings{latest?' (filled in from last time)':''}</summary>{(['Fork','Shock','Chassis','Engine'] as const).map(group=><div key={group}><h4 className="mini-head">{group}</h4><div className="form-grid">{SETUP_FIELDS.filter(f=>f.group===group).map(f=><label className="field" key={f.key}><span>{f.label}</span><input name={f.key} maxLength={200} defaultValue={latest?.settings[f.key]??''} placeholder="—" disabled={busy}/></label>)}</div></div>)}</details>
   <div className="button-row"><button className="button" type="submit" disabled={busy}>{busy?'Saving…':'Save'}</button><button className="button secondary" type="button" onClick={()=>setAdding(false)}>Cancel</button></div>
  </form>}
  {logs===null&&!error&&<SkeletonList kind="event"/>}
  {logs&&!logs.length&&!adding&&<div className="empty"><h3>Your tuning notebook starts here.</h3><p>Log the settings you ran and how the bike felt. Next time you’ll know what worked at this track.</p></div>}
  <div className="rd-logs">{logs?.map((log,i)=>{const prior=logs[i+1],diff=prior?setupDifferences(prior.settings,log.settings):[];return <article key={log.id} className="rd-log">
   <div className="rd-tags"><span className={'rd-badge '+(log.result==='better'?'good':log.result==='worse'?'bad':'')}>{SETUP_RESULT_LABELS[log.result]}</span><span className="subtle">{day(log.recorded_at)}{log.engine_hours!==null?` · ${log.engine_hours} h`:''}</span></div>
   <h3>{log.track||'Track not recorded'}</h3>
   {log.conditions&&<p className="subtle">{log.conditions}</p>}
   {log.change_made&&<p className="plain-message"><b>Changed:</b> {log.change_made}</p>}
   {diff.length>0&&<ul className="diff-list rd-diff">{diff.map(d=><li key={d.key}>{d.label}: {d.from} → {d.to}</li>)}</ul>}
   {log.notes&&<p className="plain-message">{log.notes}</p>}
   <details><summary>All settings</summary><p className="subtle">{describe(log)||'No settings recorded.'}</p></details>
   <div className="rd-actions-row">{onAsk&&<button className="text-button" onClick={()=>onAsk(`Setup log from ${day(log.recorded_at)}${log.track?' at '+log.track:''}${log.conditions?' ('+log.conditions+')':''}. Settings: ${describe(log)||'none recorded'}.${log.change_made?' Change made: '+log.change_made+'.':''} Result: ${SETUP_RESULT_LABELS[log.result]}.${log.notes?' Notes: '+log.notes:''}\n\nWhat should I try next?`)}>Ask BAK about this <ArrowRight size={14}/></button>}<button className="text-button rd-danger-text" onClick={async()=>{if(!confirm('Delete this setup entry?'))return;try{await api('/setup-logs?id='+log.id,'DELETE');await load();}catch(e){setError(errorText(e));}}}><Trash2 size={13}/>Delete</button></div>
  </article>;})}</div>
 </section>;
}

/* ------------------------------------------------------------------ Parts catalog */
/** Catalog section names arrive in capitals ("FRONT FORK, TRIPLE CLAMP"); show them the way a rider reads them. */
const KEEP_UPPER=/^(WP|PDS|CDI|ECU|EFI|TPS|ABS|LED|SX|XC|SX-F|XC-F|EXC|KYB|YZ|KX|CRF|RM-Z|TC|FC|MC|EX|TE|FE|TX|FX|PHDS|ASV|ODI|O-RING|I|II|III|IV|V|VI)$/;
export function niceName(name:string){const t=name.trim();if(t!==t.toUpperCase())return t;return t.toLowerCase().split(/(\s+|-)/).map((w,i)=>{const up=w.toUpperCase();if(KEEP_UPPER.test(up))return up;return i===0||w.length>3?w.charAt(0).toUpperCase()+w.slice(1):w;}).join('').replace(/\b(and|of|for|with|the|to|in|on)\b/gi,m=>m.toLowerCase()).replace(/^./,c=>c.toUpperCase());}
/** Which area of the bike a catalog section belongs to, for grouping the list. */
export const PART_AREAS=['Suspension','Engine','Fuel, air & exhaust','Wheels & brakes','Frame & body','Controls & electrics','Other'] as const;
export function partArea(name:string):typeof PART_AREAS[number]{const n=name.toLowerCase();
 if(/fork|shock|swing ?arm|linkage|linking|lever link|steering|triple clamp|suspension|wp shims/.test(n))return 'Suspension';
 if(/wheel|brake|caliper|disc|tire|tyre|hub|sprocket|chain/.test(n))return 'Wheels & brakes';
 if(/fuel|air ?filter|air ?box|carbur|throttle|injector|exhaust|silencer|muffler|intake/.test(n))return 'Fuel, air & exhaust';
 if(/engine|cylinder|piston|crank|clutch|transmission|gear|shift|cam|valve|timing|water pump|cooling|lubricat|oil|balancer|kick|starter|ignition|generator|stator|case|head/.test(n))return 'Engine';
 if(/frame|seat|tank|fender|mask|plastic|cover|decal|guard|skid|number|side panel|footpeg|stand/.test(n))return 'Frame & body';
 if(/handlebar|control|wiring|harness|switch|electric|battery|light|cable|grip/.test(n))return 'Controls & electrics';
 return 'Other';}

export function PartsCatalog({bike}:{bike?:Bike}){
 const [catalog,setCatalog]=useState<PartCatalog|null|undefined>(undefined),[assemblies,setAssemblies]=useState<PartAssembly[]>([]),[open,setOpen]=useState(''),[parts,setParts]=useState<Part[]>([]),[error,setError]=useState(''),[find,setFind]=useState('');
 const [partsLoading,setPartsLoading]=useState(false);const [partsLoaded,setPartsLoaded]=useState(false);const requestId=useRef(0);
 const [fit,setFit]=useState<{number:string;rows:PartFit[]|null;error:string}|null>(null);
 async function showFit(number:string){if(fit?.number===number){setFit(null);return;}setFit({number,rows:null,error:''});try{const d=await api<{part_number:string;fits:PartFit[]}>('/parts/fitment?part_number='+encodeURIComponent(number));setFit(f=>f?.number===number?{number,rows:d.fits,error:''}:f);}catch(e){setFit(f=>f?.number===number?{number,rows:[],error:errorText(e)}:f);}}
 useEffect(()=>{let live=true;requestId.current++;setCatalog(undefined);setAssemblies([]);setOpen('');setParts([]);setPartsLoading(false);setPartsLoaded(false);setError('');if(bike)api<{catalog:PartCatalog|null;assemblies:PartAssembly[]}>('/parts/catalog?bike_id='+bike.id).then(d=>{if(live){setCatalog(d.catalog);setAssemblies(d.assemblies);}}).catch(e=>{if(live){setError(errorText(e));setCatalog(null);}});return()=>{live=false};},[bike?.id]);
 async function show(a:PartAssembly){const current=++requestId.current;if(open===a.id){setOpen('');setPartsLoading(false);return;}setOpen(a.id);setParts([]);setPartsLoaded(false);setPartsLoading(true);setError('');try{const result=await api<Part[]>('/parts?assembly_id='+a.id);if(requestId.current===current){setParts(result);setPartsLoaded(true);}}catch(e){if(requestId.current===current)setError(errorText(e));}finally{if(requestId.current===current)setPartsLoading(false);}}
 if(!bike||catalog===undefined||(catalog===null&&!error))return null;
 const shown=assemblies.filter(a=>a.name.toLowerCase().includes(find.trim().toLowerCase()));
 return <section className="panel parts-catalog">
  <div className="panel-title"><div><h2>Parts catalog</h2><p className="subtle">{catalog?`${catalog.assembly_count} sections · ${catalog.part_count} parts${catalog.complete?'':' · not every section is listed yet'}`:'Exact model-year catalog'}</p></div></div>
  {error&&<div className="error" role="alert">{error}</div>}
  {!catalog?<div className="empty"><h3>No parts catalog for this bike yet.</h3><p>Parts are only shown when they’re listed for your exact year and version, never borrowed from a neighboring year.</p></div>:<>
   {/no market label/i.test(catalog.source)&&<p className="notice">The manufacturer lists this model year once, without a market label, so this is the only official catalog for it. Confirm the part number with your dealer before ordering.</p>}
   {/EU market/i.test(catalog.source)&&<p className="notice">The manufacturer lists this catalog under its EU market only. This model was also sold in the US, but a US bike can differ in a few parts. Confirm the part number with your dealer before ordering.</p>}
   <label className="field"><span>Find an assembly</span><input value={find} onChange={e=>setFind(e.target.value)} placeholder="Front fork, clutch, cylinder head…"/></label>
   <div className="assembly-list">{PART_AREAS.map(area=>{const list=shown.filter(a=>partArea(a.name)===area);return list.length?<Fragment key={area}><p className="pc-area">{area}</p>{list.map(a=><div key={a.id} className={'assembly'+(open===a.id?' open':'')}>
    <button className="assembly-head" aria-expanded={open===a.id} onClick={()=>show(a)}><span>{niceName(a.name)}</span><ArrowRight size={15}/></button>
    {open===a.id&&<div className="assembly-body">
     {/^https:\/\//.test(a.diagram_url)&&!/NoImage/i.test(a.diagram_url)&&<a href={a.diagram_url} target="_blank" rel="noreferrer" className="parts-diagram" title="Open the diagram full size"><img src={a.diagram_url} alt={`Exploded diagram: ${a.name}`} loading="lazy"/><span>Open full size</span></a>}
     {partsLoading?<p className="subtle" role="status">Loading parts…</p>:!partsLoaded?<p className="subtle" role="status">Parts could not be loaded. Try reopening this assembly.</p>:!parts.length?<p className="subtle" role="status">No part entries have been imported for this assembly.</p>:<table><thead><tr><th>Ref</th><th>Part number</th><th>Description</th><th>Qty</th></tr></thead><tbody>{parts.map(p=><Fragment key={p.id}><tr><td>{p.callout}</td><td>{p.part_number?<button className="part-number" aria-expanded={fit?.number===p.part_number} title="See which other bikes list this part number" onClick={()=>showFit(p.part_number!)}>{p.part_number}</button>:'—'}</td><td>{p.description}{p.remarks&&<small>{p.remarks}</small>}</td><td>{p.quantity_raw==='0'?'As needed':p.quantity_raw||'—'}</td></tr>
      {p.part_number&&fit?.number===p.part_number&&<tr className="fit-row"><td colSpan={4}>{fit.error?<span className="error" role="alert">{fit.error}</span>:!fit.rows?<span className="subtle" role="status">Checking other catalogs…</span>:<FitList bike={bike} rows={fit.rows}/>}</td></tr>}</Fragment>)}</tbody></table>}
     <p className="subtle">Catalog quantities are per assembly as published, not whole-bike totals. Confirm superseded numbers with a dealer before ordering.</p>
    </div>}
   </div>)}</Fragment>:null;})}{!shown.length&&<p className="subtle">No section matches that. Try “fork”, “brake” or “clutch”.</p>}</div>
  </>}
 </section>;
}

function FitList({bike,rows}:{bike:Bike;rows:PartFit[]}){
 const others=rows.filter(r=>!(r.manufacturer===bike.manufacturer&&r.model===bike.model)),own=rows.find(r=>r.manufacturer===bike.manufacturer&&r.model===bike.model);
 return <div className="fit-list">
  <strong>Same part number in other catalogs</strong>
  {own&&own.years.length>1&&<p className="subtle">{bike.manufacturer} {bike.model}: {yearRanges(own.years)}</p>}
  {others.length?<ul>{others.map(r=><li key={r.manufacturer+r.model}><span>{r.manufacturer} {r.model}</span><em>{yearRanges(r.years)}</em></li>)}</ul>:<p className="subtle">No other bike in the loaded catalogs lists this number.</p>}
  <p className="subtle">This shows where the manufacturer prints the same number. Confirm fit for the assembly you’re working on before ordering.</p>
 </div>;
}

/* ------------------------------------------------------------------ Setup guide */
export function SetupGuide({onAsk,bike}:{onAsk?:(text:string)=>void;bike?:Bike}){
 // Only what this bike has: no carburetor jetting on a fuel-injected four-stroke.
 const engine=bike?garageModelInfo[`${bike.manufacturer}|${bike.model}`]?.engine:undefined;
 const shownAdjusters=adjusters.filter(a=>!(engine==='4-stroke'&&a.id==='two_stroke_jetting'));
 const [view,setView]=useState<'feel'|'adjusters'|'faults'|'tuner'>('feel'),[open,setOpen]=useState('');
 return <section className="panel setup-guide">
  <div className="panel-title"><div><h2>Setup guide</h2><p className="subtle">What each adjustment does and where to start for what you’re feeling. Direction only — your bike’s published settings live in Specs.</p></div></div>
  <div className="tabs"><button className={view==='feel'?'active':''} onClick={()=>{setView('feel');setOpen('');}}>By what you feel</button><button className={view==='adjusters'?'active':''} onClick={()=>{setView('adjusters');setOpen('');}}>By adjustment</button><button className={view==='faults'?'active':''} onClick={()=>{setView('faults');setOpen('');}}>When it’s a fault</button><button className={view==='tuner'?'active':''} onClick={()=>{setView('tuner');setOpen('');}}>Working with a tuner</button></div>
  {view==='feel'?<div className="assembly-list">{symptomGuides.map(g=><div key={g.id} className={'assembly'+(open===g.id?' open':'')}>
   <button className="assembly-head" aria-expanded={open===g.id} onClick={()=>setOpen(open===g.id?'':g.id)}><span>“{g.rider_says[0]}”<small className="subtle">{g.rider_says.slice(1,4).join(', ')}</small></span><ArrowRight size={15}/></button>
   {open===g.id&&<div className="assembly-body guide-body"><p className="subtle">{g.where}</p>{g.ask&&<p className="decider"><b>The question that decides:</b> {g.ask}</p>}<h4>Check first</h4><ul>{g.check_first.map((c,i)=><li key={i}>{c}</li>)}</ul><h4>Likely causes</h4>{g.likely.map((l,i)=><div className="hypothesis" key={i}><strong>{l.cause}</strong><p>{l.tell}</p><p><b>First change:</b> {l.first_change}</p></div>)}{g.note&&<p className="subtle"><b>Common wrong move:</b> {g.note}</p>}{onAsk&&<button className="text-button" onClick={()=>onAsk(`My bike ${g.rider_says[0]}. `)}>Ask BAK about this on my bike <ArrowRight size={14}/></button>}</div>}
  </div>)}</div>:view==='faults'?<div className="assembly-list">{mechanicalMimics.map(m=><div key={m.fault} className={'assembly'+(open===m.fault?' open':'')}>
   <button className="assembly-head" aria-expanded={open===m.fault} onClick={()=>setOpen(open===m.fault?'':m.fault)}><span>{m.fault}<small className="subtle">{m.feels_like}</small></span><ArrowRight size={15}/></button>
   {open===m.fault&&<div className="assembly-body guide-body"><h4>How to check</h4><p>{m.check}</p></div>}
  </div>)}</div>:view==='tuner'?<div className="guide-body tuner-guide"><h4>The order the pros work in</h4><ol>{workOrder.map((w,i)=><li key={i}>{w}</li>)}</ol><h4>Getting the most from your suspension tuner</h4><ul>{talkingToYourTuner.map((w,i)=><li key={i}>{w}</li>)}</ul></div>:<div className="assembly-list">{shownAdjusters.map(a=><div key={a.id} className={'assembly'+(open===a.id?' open':'')}>
   <button className="assembly-head" aria-expanded={open===a.id} onClick={()=>setOpen(open===a.id?'':a.id)}><span>{a.name}</span><ArrowRight size={15}/></button>
   {open===a.id&&<div className="assembly-body guide-body"><p>{a.controls}</p><div className="guide-grid"><div><h4>Firmer / more</h4><p>{a.firmer_or_more}</p><p className="subtle"><b>Too much:</b> {a.too_much}</p></div><div><h4>Softer / less</h4><p>{a.softer_or_less}</p><p className="subtle"><b>Too little:</b> {a.too_little}</p></div></div><p className="subtle">{a.notes}</p></div>}
  </div>)}</div>}
  <details className="before-tune"><summary>Before you touch a clicker</summary><ul>{beforeYouTune.map((b,i)=><li key={i}>{b}</li>)}</ul></details>
 </section>;
}

/* ------------------------------------------------------------------ Rider profile */
type PublicProfile={profile:Profile;posts:{id:string;category:PostCategory;body:string;bike_label:string;created_at:string;photos?:Photo[]}[];bikes?:PublicBike[];mine:boolean};
export function RiderProfile({riderId,onClose,onMessage}:{riderId:string;onClose:()=>void;onMessage:(r:RiderRef)=>void}){
 const [data,setData]=useState<PublicProfile|null>(null),[error,setError]=useState('');
 useEffect(()=>{let live=true;setData(null);setError('');api<PublicProfile>('/profiles?id='+riderId).then(d=>{if(live)setData(d);}).catch(e=>{if(live)setError(errorText(e));});return()=>{live=false};},[riderId]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[onClose]);
 return <div className="modal-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}><section className="modal wide rd-rider" role="dialog" aria-modal="true" aria-label="Rider profile"><button className="icon-button modal-close" onClick={onClose} aria-label="Close"><X/></button>
  {error&&<div className="error" role="alert">{error}</div>}
  {!data&&!error&&<SkeletonList kind="profile"/>}
  {data&&<>
   <header className="rd-rider-head">
    <Avatar rider={data.profile} size={92}/>
    <h2>{data.profile.race_number&&<span className="race-plate">{data.profile.race_number}</span>}{riderName(data.profile)}</h2>
    <p className="subtle">@{data.profile.handle}{data.profile.location?' · '+data.profile.location:''}{data.profile.riding_class?' · '+data.profile.riding_class:''}</p>
    {data.profile.bio&&<p className="plain-message rd-bio">{data.profile.bio}</p>}
    <p className="subtle">Riding with BAK MX since {new Date(data.profile.created_at).toLocaleDateString([],{month:'long',year:'numeric'})}</p>
    {!data.mine&&<RiderActions rider={data.profile} target={{type:'profile',id:data.profile.user_id}} onMessage={r=>{onClose();onMessage(r);}} onBlocked={onClose}/>}
   </header>
   <PublicGarage bikes={data.bikes??[]}/>
   <div className="section-line"><h2>Recent posts</h2></div>
   {!data.posts.length&&<p className="subtle">No posts yet.</p>}
   {data.posts.map(p=><div className="rd-rider-post" key={p.id}><span className="rd-context"><b>{POST_CATEGORY_LABELS[p.category]}</b>{p.bike_label?' · '+p.bike_label:''} · {ago(p.created_at)}</span><p className="plain-message">{p.body}</p>{!!p.photos?.length&&<div className={'post-photos n'+Math.min(p.photos.length,4)}>{p.photos.map(ph=><a key={ph.id} href={ph.url} target="_blank" rel="noreferrer"><img src={ph.url} alt="" loading="lazy"/></a>)}</div>}</div>)}
  </>}
 </section></div>;
}

/* ------------------------------------------------------------------ Admin: report queue */
type ReportRow={id:string;target_type:string;target_id:string;reason:string;created_at:string;content:Record<string,unknown>|null};
/** Shown only to administrators; everyone else gets a 403 from the API and sees nothing. */
export function ReportQueue({signedIn}:{signedIn:boolean}){
 const [reports,setReports]=useState<ReportRow[]|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState('');
 async function load(){try{const d=await api<{reports:ReportRow[]}>('/admin/reports');setReports(d.reports);}catch{setReports(null);}}
 useEffect(()=>{if(signedIn)void load();else setReports(null);},[signedIn]);
 async function resolve(r:ReportRow,action:'dismiss'|'remove_content'){setBusy(r.id);setError('');try{await api('/admin/reports','POST',{report_id:r.id,action});await load();}catch(e){setError(errorText(e));}finally{setBusy('');}}
 if(!reports)return null;
 const text=(c:ReportRow['content'])=>c?String(c.body??c.title??c.bio??c.handle??''):'';
 return <section className="panel"><span className="eyebrow">ADMIN · REPORTS</span><h2>{reports.length?`${reports.length} open ${reports.length===1?'report':'reports'}`:'No open reports'}</h2>
  {error&&<div className="error" role="alert">{error}</div>}
  {reports.map(r=><div className="comment" key={r.id}><span className="rd-tag"><i/>{r.target_type}</span><span className="subtle"> · reported {when(r.created_at)}</span>
   <p className="plain-message"><b>Reason:</b> {r.reason}</p>
   <p className="plain-message">{r.content?text(r.content)||'(no text)':'The reported item no longer exists.'}</p>
   <div className="button-row">{['post','comment','event'].includes(r.target_type)&&r.content&&<button className="button" disabled={busy===r.id} onClick={()=>resolve(r,'remove_content')}>Remove content</button>}<button className="button secondary" disabled={busy===r.id} onClick={()=>resolve(r,'dismiss')}>Dismiss</button></div></div>)}
 </section>;
}
