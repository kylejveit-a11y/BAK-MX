import {Fragment,useEffect,useRef,useState,type FormEvent,type ReactNode} from 'react';
import {ArrowLeft,ArrowRight,CalendarDays,Check,Flag,Heart,MapPin,MessageCircle,MessageSquare,Plus,Send,ShieldOff,Trash2,UserRound,Users,X} from 'lucide-react';
import type {Bike} from '../shared/types';
import {api} from './client';
import {adjusters,beforeYouTune,symptomGuides,mechanicalMimics,talkingToYourTuner,workOrder} from '../shared/setup-knowledge';
import {COMMUNITY_RULES,EVENT_TYPE_LABELS,POST_CATEGORY_LABELS,SETUP_FIELDS,SETUP_RESULT_LABELS,riderName,setupDifferences,type EventType,yearRanges,type Part,type PartAssembly,type PartCatalog,type PartFit,type Post,type PostCategory,type PostComment,type Profile,type RideEvent,type RiderRef,type SetupLog,type SetupResult,type ThreadMessage,type ThreadSummary} from '../shared/rider-types';

/* Rider surfaces for the web client: Community, Events, Messages, Profile, Feedback, Setup log, Parts.
   Everything here reads and writes through the BAK MX API; nothing is sample data. */

const when=(iso:string)=>new Date(iso).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
const day=(iso:string)=>new Date(iso).toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'});
function Gate({icon,title,children,action}:{icon:ReactNode;title:string;children:ReactNode;action?:ReactNode}){
 return <section className="panel"><div className="empty"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{children}</p>{action}</div></section>;
}
function useProfile(signedIn:boolean){
 const [profile,setProfile]=useState<Profile|null|undefined>(undefined),[error,setError]=useState('');
 async function load(){try{setProfile(await api<Profile|null>('/profile'));setError('');}catch(e){setError((e as Error).message);setProfile(null);}}
 useEffect(()=>{if(signedIn)void load();else setProfile(undefined);},[signedIn]);
 return {profile,setProfile,profileError:error};
}

/* ------------------------------------------------------------------ Profile */
export function ProfileEditor({profile,onSaved,compact=false}:{profile:Profile|null;onSaved:(p:Profile)=>void;compact?:boolean}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();const f=new FormData(e.currentTarget);setBusy(true);setError('');setSaved(false);
  try{
   const next=await api<Profile>('/profile','PUT',{handle:String(f.get('handle')||'').trim().toLowerCase().replace(/[\s-]+/g,'_').replace(/[^a-z0-9_]/g,'').replace(/_+$/,''),display_name:String(f.get('display_name')||''),bio:String(f.get('bio')||''),location:String(f.get('location')||''),riding_class:String(f.get('riding_class')||''),...(profile?{}:{accept_rules:true})});
   onSaved(next);setSaved(true);
  }catch(err){setError((err as Error).message);}finally{setBusy(false);}
 }
 return <form onSubmit={submit} className="profile-form">
  {!profile&&<p className="notice">Pick a handle so other riders know who they’re talking to. You can change it later.</p>}
  <div className="form-grid">
   <label className="field"><span>Handle</span><input name="handle" defaultValue={profile?.handle||''} required minLength={3} maxLength={24} autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="e.g. god_father" onInput={e=>{const el=e.currentTarget,clean=el.value.toLowerCase().replace(/[\s-]+/g,'_').replace(/[^a-z0-9_]/g,'').slice(0,24);if(clean!==el.value)el.value=clean;}}/><small>3–24 lowercase letters, numbers or underscores. Spaces become underscores.</small></label>
   <label className="field"><span>Display name</span><input name="display_name" defaultValue={profile?.display_name||''} maxLength={60}/></label>
   <label className="field"><span>Home area</span><input name="location" defaultValue={profile?.location||''} maxLength={80} placeholder="City or region"/></label>
   <label className="field"><span>Class / riding</span><input name="riding_class" defaultValue={profile?.riding_class||''} maxLength={60} placeholder="250 B, Vet 30+, weekend rider…"/></label>
  </div>
  {!compact&&<label className="field"><span>About</span><textarea name="bio" rows={3} maxLength={500} defaultValue={profile?.bio||''} placeholder="What you ride and where."/></label>}
  {!profile&&<div className="rules"><span className="eyebrow">COMMUNITY RULES</span><ul>{COMMUNITY_RULES.map((r,i)=><li key={i}>{r}</li>)}</ul><label className="field check"><input type="checkbox" name="accept" required/><span>I agree to the community rules.</span></label></div>}
  {error&&<div className="error" role="alert">{error}</div>}
  <div className="button-row"><button className="button" type="submit" disabled={busy}>{busy?'Saving…':profile?'Save profile':'Create profile'}<Check size={16}/></button>{saved&&<span className="subtle" role="status">Saved.</span>}</div>
 </form>;
}
export function ProfilePanel({signedIn}:{signedIn:boolean}){
 const {profile,setProfile,profileError}=useProfile(signedIn);
 const [blocks,setBlocks]=useState<{blocked_id:string;created_at:string}[]>([]);
 useEffect(()=>{if(signedIn)api<{blocked_id:string;created_at:string}[]>('/blocks').then(setBlocks).catch(()=>setBlocks([]));},[signedIn]);
 if(!signedIn||profile===undefined)return null;
 return <section className="panel"><span className="eyebrow">RIDER PROFILE</span><h2>{profile?riderName(profile):'Set up your rider profile'}</h2>
  {profileError&&<div className="error" role="alert">{profileError}</div>}
  <ProfileEditor profile={profile} onSaved={setProfile}/>
  {blocks.length>0&&<div className="blocked-list"><h3>Blocked riders</h3>{blocks.map(b=><div key={b.blocked_id} className="row-between"><span className="subtle">Blocked {day(b.created_at)}</span><button className="text-button" onClick={async()=>{await api('/blocks?user_id='+b.blocked_id,'DELETE');setBlocks(blocks.filter(x=>x.blocked_id!==b.blocked_id));}}>Unblock</button></div>)}</div>}
 </section>;
}

/* ------------------------------------------------------------------ Report / block */
function RiderActions({rider,target,onBlocked,onMessage}:{rider:RiderRef;target:{type:'post'|'comment'|'event'|'message'|'profile';id:string};onBlocked:()=>void;onMessage?:(r:RiderRef)=>void}){
 const [open,setOpen]=useState<''|'report'|'block'>(''),[reason,setReason]=useState(''),[note,setNote]=useState(''),[busy,setBusy]=useState(false);
 async function report(){setBusy(true);try{await api('/reports','POST',{target_type:target.type,target_id:target.id,reason});setNote('Report received. We review reports and remove content that breaks the rules.');setOpen('');setReason('');}catch(e){setNote((e as Error).message);}finally{setBusy(false);}}
 async function block(){setBusy(true);try{await api('/blocks?user_id='+rider.user_id,'PUT');onBlocked();}catch(e){setNote((e as Error).message);}finally{setBusy(false);}}
 return <div className="rider-actions">
  <div className="row-actions">
   {onMessage&&<button className="text-button" onClick={()=>onMessage(rider)}><MessageCircle size={14}/>Message</button>}
   <button className="text-button" onClick={()=>setOpen(open==='report'?'':'report')}><Flag size={14}/>Report</button>
   <button className="text-button" onClick={()=>setOpen(open==='block'?'':'block')}><ShieldOff size={14}/>Block</button>
  </div>
  {open==='report'&&<div className="inline-form"><textarea aria-label="Reason for report" rows={2} maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)} placeholder="What’s wrong with this?"/><button className="button secondary" disabled={busy||!reason.trim()} onClick={report}>Send report</button></div>}
  {open==='block'&&<div className="inline-form"><p className="subtle">You won’t see {riderName(rider)}’s posts, events or messages, and they won’t see yours.</p><button className="button secondary" disabled={busy} onClick={block}>Block {riderName(rider)}</button></div>}
  {note&&<p className="subtle" role="status">{note}</p>}
 </div>;
}

/* ------------------------------------------------------------------ Community */
export function Community({signedIn,bike,onSignIn,onMessage}:{signedIn:boolean;bike?:Bike;onSignIn:()=>void;onMessage:(r:RiderRef)=>void}){
 const {profile,setProfile}=useProfile(signedIn);
 const [posts,setPosts]=useState<Post[]>([]),[filter,setFilter]=useState<PostCategory|''>(''),[loading,setLoading]=useState(false),[error,setError]=useState(''),[composing,setComposing]=useState(false),[busy,setBusy]=useState(false),[openPost,setOpenPost]=useState(''),[viewing,setViewing]=useState('');
 const live=useRef(0);
 async function load(){const run=++live.current;setLoading(true);try{const data=await api<Post[]>('/posts'+(filter?'?category='+filter:''));if(run===live.current){setPosts(data);setError('');}}catch(e){if(run===live.current)setError((e as Error).message);}finally{if(run===live.current)setLoading(false);}}
 useEffect(()=>{if(signedIn)void load();},[signedIn,filter]);
 async function publish(e:FormEvent<HTMLFormElement>){
  e.preventDefault();const form=e.currentTarget,f=new FormData(form);setBusy(true);setError('');
  try{await api('/posts','POST',{category:String(f.get('category')),body:String(f.get('body')||''),bike_label:f.get('attach')&&bike?`${bike.model_year} ${bike.manufacturer} ${bike.model}`:''});form.reset();setComposing(false);await load();}
  catch(err){setError((err as Error).message);}finally{setBusy(false);}
 }
 async function toggleLike(p:Post){
  setPosts(posts.map(x=>x.id===p.id?{...x,liked:!p.liked,like_count:p.like_count+(p.liked?-1:1)}:x));
  try{await api('/likes?post_id='+p.id,p.liked?'DELETE':'PUT');}catch(e){setError((e as Error).message);void load();}
 }
 async function remove(p:Post){if(!confirm('Delete this post?'))return;try{await api('/posts?id='+p.id,'DELETE');setPosts(posts.filter(x=>x.id!==p.id));}catch(e){setError((e as Error).message);}}
 if(!signedIn)return <Gate icon={<Users size={26}/>} title="The pits, in your pocket." action={<button className="button" onClick={onSignIn}>Sign in to join <ArrowRight size={16}/></button>}>Builds, setup questions and ride plans from riders on gas MX bikes.</Gate>;
 if(profile===undefined)return <p className="subtle" role="status">Loading…</p>;
 if(!profile)return <section className="panel"><span className="eyebrow">ONE STEP FIRST</span><h2>Set up your rider profile</h2><ProfileEditor profile={null} onSaved={setProfile} compact/></section>;
 return <>
  <div className="feed-bar"><div className="tabs">{([['','All'],...Object.entries(POST_CATEGORY_LABELS)] as [PostCategory|'',string][]).map(([k,l])=><button key={k||'all'} className={filter===k?'active':''} onClick={()=>setFilter(k)}>{l}</button>)}</div><button className="button" onClick={()=>setComposing(!composing)}><Plus size={16}/>New post</button></div>
  {error&&<div className="error" role="alert">{error}<button className="icon-button" aria-label="Dismiss" onClick={()=>setError('')}><X size={16}/></button></div>}
  {composing&&<section className="panel"><form onSubmit={publish}>
   <div className="form-grid"><label className="field"><span>Kind of post</span><select name="category" defaultValue="setup_question">{Object.entries(POST_CATEGORY_LABELS).map(([k,l])=><option key={k} value={k}>{l}</option>)}</select></label>
   {bike&&<label className="field check"><input type="checkbox" name="attach" defaultChecked/><span>Tag my {bike.model_year} {bike.manufacturer} {bike.model}</span></label>}</div>
   <label className="field"><span>Post</span><textarea name="body" rows={4} maxLength={4000} required placeholder="What are you working on, asking, or planning?"/></label>
   <div className="button-row"><button className="button" type="submit" disabled={busy}>{busy?'Posting…':'Post'}<Send size={15}/></button><button className="button secondary" type="button" onClick={()=>setComposing(false)}>Cancel</button></div>
  </form></section>}
  {viewing&&<RiderProfile riderId={viewing} onClose={()=>setViewing('')} onMessage={onMessage}/>}
  {loading&&!posts.length&&<p className="subtle" role="status">Loading the feed…</p>}
  {!loading&&!posts.length&&<Gate icon={<Users size={26}/>} title="Nothing here yet.">Be the first to post a build, a setup question or a ride plan.</Gate>}
  <div className="feed">{posts.map(p=><article className="panel post" key={p.id}>
   <header className="post-head"><div className="avatar" aria-hidden="true">{riderName(p.author).replace('@','').slice(0,1).toUpperCase()}</div><div><button className="author-link" onClick={()=>setViewing(p.user_id)}>{riderName(p.author)}</button><span className="subtle">@{p.author.handle}{p.author.location?' · '+p.author.location:''} · {when(p.created_at)}</span></div><span className="kind-tag">{POST_CATEGORY_LABELS[p.category].toUpperCase()}</span></header>
   {p.bike_label&&<span className="bike-tag">{p.bike_label}</span>}
   <p className="plain-message">{p.body}</p>
   <footer className="post-foot"><button className={'text-button'+(p.liked?' liked':'')} aria-pressed={p.liked} onClick={()=>toggleLike(p)}><Heart size={15} fill={p.liked?'currentColor':'none'}/>{p.like_count}</button><button className="text-button" onClick={()=>setOpenPost(openPost===p.id?'':p.id)}><MessageSquare size={15}/>{p.comment_count} {p.comment_count===1?'comment':'comments'}</button>{p.mine&&<button className="text-button" onClick={()=>remove(p)}><Trash2 size={14}/>Delete</button>}</footer>
   {!p.mine&&<RiderActions rider={p.author} target={{type:'post',id:p.id}} onMessage={onMessage} onBlocked={()=>setPosts(posts.filter(x=>x.user_id!==p.user_id))}/>}
   {openPost===p.id&&<Comments post={p} onCount={n=>setPosts(prev=>prev.map(x=>x.id===p.id?{...x,comment_count:n}:x))}/>}
  </article>)}</div>
 </>;
}
function Comments({post,onCount}:{post:Post;onCount:(n:number)=>void}){
 const [comments,setComments]=useState<PostComment[]>([]),[text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function load(){try{const data=await api<PostComment[]>('/comments?post_id='+post.id);setComments(data);onCount(data.length);}catch(e){setError((e as Error).message);}}
 useEffect(()=>{void load();},[post.id]);
 async function add(e:FormEvent){e.preventDefault();if(!text.trim())return;setBusy(true);setError('');try{await api('/comments','POST',{post_id:post.id,body:text});setText('');await load();}catch(err){setError((err as Error).message);}finally{setBusy(false);}}
 return <div className="comments">
  {comments.map(c=><div className="comment" key={c.id}><strong>{riderName(c.author)}</strong><span className="subtle"> · {when(c.created_at)}</span><p className="plain-message">{c.body}</p>{c.mine&&<button className="text-button" onClick={async()=>{try{await api('/comments?id='+c.id,'DELETE');await load();}catch(e){setError((e as Error).message);}}}><Trash2 size={13}/>Delete</button>}</div>)}
  {error&&<div className="error" role="alert">{error}</div>}
  <form className="inline-form" onSubmit={add}><input aria-label="Add a comment" value={text} onChange={e=>setText(e.target.value)} maxLength={2000} placeholder="Add a comment"/><button className="button secondary" type="submit" disabled={busy||!text.trim()}>Comment</button></form>
 </div>;
}

/* ------------------------------------------------------------------ Events */
export function Events({signedIn,onSignIn,onMessage}:{signedIn:boolean;onSignIn:()=>void;onMessage:(r:RiderRef)=>void}){
 const {profile,setProfile}=useProfile(signedIn);
 const [events,setEvents]=useState<RideEvent[]>([]),[scope,setScope]=useState<'upcoming'|'past'>('upcoming'),[creating,setCreating]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[open,setOpen]=useState(''),[loading,setLoading]=useState(false);
 async function load(){setLoading(true);try{setEvents(await api<RideEvent[]>('/events?scope='+scope));setError('');}catch(e){setError((e as Error).message);}finally{setLoading(false);}}
 useEffect(()=>{if(signedIn)void load();},[signedIn,scope]);
 async function create(e:FormEvent<HTMLFormElement>){
  e.preventDefault();const form=e.currentTarget,f=new FormData(form);setBusy(true);setError('');
  try{
   const start=new Date(String(f.get('starts_at')));if(!Number.isFinite(start.getTime()))throw Error('Choose a start date and time.');
   const endRaw=String(f.get('ends_at')||''),end=endRaw?new Date(endRaw):null;
   await api('/events','POST',{title:String(f.get('title')||''),event_type:String(f.get('event_type')),starts_at:start.toISOString(),ends_at:end?end.toISOString():null,location_name:String(f.get('location_name')||''),description:String(f.get('description')||'')});
   form.reset();setCreating(false);setScope('upcoming');await load();
  }catch(err){setError((err as Error).message);}finally{setBusy(false);}
 }
 async function rsvp(ev:RideEvent,status:'going'|'interested'){
  try{if(ev.my_rsvp===status)await api('/rsvps?event_id='+ev.id,'DELETE');else await api('/rsvps','PUT',{event_id:ev.id,status});await load();}catch(e){setError((e as Error).message);}
 }
 if(!signedIn)return <Gate icon={<CalendarDays size={26}/>} title="Know where everyone’s riding." action={<button className="button" onClick={onSignIn}>Sign in to see events <ArrowRight size={16}/></button>}>Ride days, races, practice nights, clinics and meetups posted by riders.</Gate>;
 if(profile===undefined)return <p className="subtle" role="status">Loading…</p>;
 if(!profile)return <section className="panel"><span className="eyebrow">ONE STEP FIRST</span><h2>Set up your rider profile</h2><ProfileEditor profile={null} onSaved={setProfile} compact/></section>;
 return <>
  <div className="feed-bar"><div className="tabs"><button className={scope==='upcoming'?'active':''} onClick={()=>setScope('upcoming')}>Upcoming</button><button className={scope==='past'?'active':''} onClick={()=>setScope('past')}>Past</button></div><button className="button" onClick={()=>setCreating(!creating)}><Plus size={16}/>Create event</button></div>
  {error&&<div className="error" role="alert">{error}<button className="icon-button" aria-label="Dismiss" onClick={()=>setError('')}><X size={16}/></button></div>}
  {creating&&<section className="panel"><form onSubmit={create}>
   <div className="form-grid">
    <label className="field"><span>Event name</span><input name="title" required maxLength={120}/></label>
    <label className="field"><span>Type</span><select name="event_type" defaultValue="practice">{Object.entries(EVENT_TYPE_LABELS).map(([k,l])=><option key={k} value={k}>{l}</option>)}</select></label>
    <label className="field"><span>Starts</span><input name="starts_at" type="datetime-local" required/></label>
    <label className="field"><span>Ends (optional)</span><input name="ends_at" type="datetime-local"/></label>
   </div>
   <label className="field"><span>Track or location</span><input name="location_name" required maxLength={160}/></label>
   <label className="field"><span>Details</span><textarea name="description" rows={3} maxLength={4000} placeholder="Gate fee, classes, track prep, what to bring."/></label>
   <div className="button-row"><button className="button" type="submit" disabled={busy}>{busy?'Saving…':'Publish event'}</button><button className="button secondary" type="button" onClick={()=>setCreating(false)}>Cancel</button></div>
  </form></section>}
  {loading&&!events.length&&<p className="subtle" role="status">Loading events…</p>}
  {!loading&&!events.length&&<Gate icon={<CalendarDays size={26}/>} title={scope==='upcoming'?'No upcoming events yet.':'No past events.'}>{scope==='upcoming'?'Post the next ride day or practice night so other riders can plan around it.':'Events you could see will be listed here after they happen.'}</Gate>}
  <div className="feed">{events.map(ev=><article className={'panel event'+(ev.canceled_at?' canceled':'')} key={ev.id}>
   <div className="event-date"><span>{new Date(ev.starts_at).toLocaleDateString([],{month:'short'}).toUpperCase()}</span><strong>{new Date(ev.starts_at).getDate()}</strong></div>
   <div className="event-body">
    <div className="row-between"><span className="kind-tag">{EVENT_TYPE_LABELS[ev.event_type].toUpperCase()}</span>{ev.canceled_at?<span className="status-badge bad">CANCELED</span>:ev.my_rsvp&&<span className="status-badge">{ev.my_rsvp==='going'?'YOU’RE GOING':'INTERESTED'}</span>}</div>
    <h3>{ev.title}</h3>
    <p className="subtle"><CalendarDays size={13}/> {when(ev.starts_at)}{ev.ends_at?' – '+when(ev.ends_at):''} · <MapPin size={13}/> {ev.location_name}</p>
    <p className="subtle">Hosted by {riderName(ev.host)} · {ev.going_count} going · {ev.interested_count} interested</p>
    {open===ev.id&&ev.description&&<p className="plain-message">{ev.description}</p>}
    <div className="button-row">
     {!ev.canceled_at&&scope==='upcoming'&&<><button className={'button'+(ev.my_rsvp==='going'?'':' secondary')} aria-pressed={ev.my_rsvp==='going'} onClick={()=>rsvp(ev,'going')}>{ev.my_rsvp==='going'?<><Check size={15}/>Going</>:'I’m going'}</button><button className={'button secondary'+(ev.my_rsvp==='interested'?' selected':'')} aria-pressed={ev.my_rsvp==='interested'} onClick={()=>rsvp(ev,'interested')}>Interested</button></>}
     {ev.description&&<button className="text-button" onClick={()=>setOpen(open===ev.id?'':ev.id)}>{open===ev.id?'Hide details':'Details'}</button>}
     {ev.mine&&<button className="text-button" onClick={async()=>{try{await api('/events?id='+ev.id,'PATCH',{canceled:!ev.canceled_at});await load();}catch(e){setError((e as Error).message);}}}>{ev.canceled_at?'Restore event':'Cancel event'}</button>}
     {ev.mine&&<button className="text-button" onClick={async()=>{if(!confirm('Delete this event?'))return;try{await api('/events?id='+ev.id,'DELETE');await load();}catch(e){setError((e as Error).message);}}}><Trash2 size={14}/>Delete</button>}
    </div>
    {!ev.mine&&<RiderActions rider={ev.host} target={{type:'event',id:ev.id}} onMessage={onMessage} onBlocked={()=>void load()}/>}
   </div>
  </article>)}</div>
 </>;
}

/* ------------------------------------------------------------------ Messages */
export function Messages({signedIn,onSignIn,startWith,onStarted}:{signedIn:boolean;onSignIn:()=>void;startWith:RiderRef|null;onStarted:()=>void}){
 const {profile,setProfile}=useProfile(signedIn);
 const [threads,setThreads]=useState<ThreadSummary[]>([]),[active,setActive]=useState<RiderRef|null>(null),[messages,setMessages]=useState<ThreadMessage[]>([]),[text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function loadThreads(){try{setThreads(await api<ThreadSummary[]>('/threads'));}catch(e){setError((e as Error).message);}}
 async function open(rider:RiderRef){setActive(rider);setMessages([]);setError('');try{const data=await api<{rider:RiderRef;messages:ThreadMessage[]}>('/thread?with='+rider.user_id);setMessages(data.messages);void loadThreads();}catch(e){setError((e as Error).message);}}
 useEffect(()=>{if(signedIn&&profile)void loadThreads();},[signedIn,profile?.user_id]);
 useEffect(()=>{if(startWith&&profile){void open(startWith);onStarted();}},[startWith?.user_id,profile?.user_id]);
 async function send(e:FormEvent){e.preventDefault();if(!active||!text.trim())return;setBusy(true);setError('');try{const sent=await api<ThreadMessage>('/thread','POST',{recipient_id:active.user_id,body:text});setMessages([...messages,sent]);setText('');void loadThreads();}catch(err){setError((err as Error).message);}finally{setBusy(false);}}
 if(!signedIn)return <Gate icon={<MessageCircle size={26}/>} title="Talk to other riders." action={<button className="button" onClick={onSignIn}>Sign in <ArrowRight size={16}/></button>}>Message a rider from a post or an event.</Gate>;
 if(profile===undefined)return <p className="subtle" role="status">Loading…</p>;
 if(!profile)return <section className="panel"><span className="eyebrow">ONE STEP FIRST</span><h2>Set up your rider profile</h2><ProfileEditor profile={null} onSaved={setProfile} compact/></section>;
 return <div className="chat-layout">
  <aside className={'panel history'+(active?' has-active':'')}><div className="panel-title"><h3>Messages</h3></div>
   {!threads.length&&<p className="subtle">No conversations yet. Use “Message” on a post or event to start one.</p>}
   {threads.map(t=><button key={t.rider.user_id} className={'history-item '+(active?.user_id===t.rider.user_id?'selected':'')} onClick={()=>open(t.rider)}><UserRound size={16}/><span>{riderName(t.rider)}{t.unread>0&&<b className="unread">{t.unread}</b>}<small>{t.last_message.mine?'You: ':''}{t.last_message.body.slice(0,60)}</small></span></button>)}
  </aside>
  <section className="panel conversation">
   {!active?<div className="chat-welcome"><MessageCircle size={30}/><h2>Pick a conversation</h2><p>Messages are private between you and the other rider.</p></div>:<>
    <div className="chat-context"><button className="icon-button thread-back" aria-label="Back to conversations" onClick={()=>setActive(null)}><ArrowLeft size={18}/></button><div><strong>{riderName(active)}</strong><p>@{active.handle}{active.location?' · '+active.location:''}</p></div></div>
    <div className="messages" aria-live="polite">{!messages.length&&<p className="subtle">No messages yet. Say hello.</p>}{messages.map(m=><article key={m.id} className={'message '+(m.mine?'user':'assistant')}><div className="message-label">{m.mine?'YOU':riderName(active).toUpperCase()}<time>{when(m.created_at)}</time></div><p className="plain-message">{m.body}</p></article>)}</div>
    {error&&<div className="error" role="alert">{error}</div>}
    <RiderActions rider={active} target={{type:'profile',id:active.user_id}} onBlocked={()=>{setActive(null);void loadThreads();}}/>
    <form className="composer" onSubmit={send}><textarea value={text} onChange={e=>setText(e.target.value)} maxLength={4000} rows={2} aria-label={'Message '+riderName(active)} placeholder="Write a message…" required/><div><span>Be the rider you’d want pitted next to.</span><button className="send-button" type="submit" aria-label="Send message" disabled={busy||!text.trim()}><Send size={18}/></button></div></form>
   </>}
  </section>
 </div>;
}

/* ------------------------------------------------------------------ Feedback */
export function Feedback({signedIn,bike}:{signedIn:boolean;bike?:Bike}){
 const [busy,setBusy]=useState(false),[note,setNote]=useState(''),[error,setError]=useState('');
 if(!signedIn)return null;
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();const form=e.currentTarget,f=new FormData(form);setBusy(true);setError('');setNote('');
  try{await api('/feedback','POST',{category:String(f.get('category')),body:String(f.get('body')||''),context:{client:'web',bike:bike?`${bike.model_year} ${bike.manufacturer} ${bike.model}`:null}});form.reset();setNote('Thanks — this goes straight to the build list.');}
  catch(err){setError((err as Error).message);}finally{setBusy(false);}
 }
 return <section className="panel"><span className="eyebrow">FEEDBACK</span><h2>Tell us what’s missing or wrong.</h2><p className="subtle">A wrong answer, a missing spec for your bike, a bug, an idea. Be specific; it gets read.</p>
  <form onSubmit={submit}><div className="form-grid"><label className="field"><span>About</span><select name="category" defaultValue="missing_data"><option value="answer_quality">An answer BAK gave</option><option value="missing_data">Missing data for my bike</option><option value="bug">Something broken</option><option value="idea">An idea</option><option value="other">Something else</option></select></label></div>
  <label className="field"><span>Details</span><textarea name="body" rows={4} maxLength={4000} required placeholder="What happened, and what did you expect?"/></label>
  {error&&<div className="error" role="alert">{error}</div>}{note&&<p className="notice" role="status">{note}</p>}
  <button className="button" type="submit" disabled={busy}>{busy?'Sending…':'Send feedback'}</button></form>
 </section>;
}

/* ------------------------------------------------------------------ Setup log */
export function SetupLogPanel({bike,signedIn,onAsk}:{bike?:Bike;signedIn:boolean;onAsk?:(text:string)=>void}){
 const [logs,setLogs]=useState<SetupLog[]>([]),[adding,setAdding]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function load(){if(!bike)return;try{setLogs(await api<SetupLog[]>('/setup-logs?bike_id='+bike.id));setError('');}catch(e){setError((e as Error).message);}}
 useEffect(()=>{setLogs([]);setAdding(false);if(signedIn&&bike)void load();},[bike?.id,signedIn]);
 if(!signedIn||!bike)return null;
 const latest=logs[0];
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();const f=new FormData(e.currentTarget),settings:Record<string,string|null>={};
  for(const field of SETUP_FIELDS){const v=String(f.get(field.key)||'').trim();settings[field.key]=v||null;}
  setBusy(true);setError('');
  try{
   const hoursRaw=String(f.get('engine_hours')||'');
   await api('/setup-logs','POST',{bike_id:bike!.id,recorded_at:new Date(String(f.get('recorded_at'))+'T12:00:00').toISOString(),track:String(f.get('track')||''),conditions:String(f.get('conditions')||''),engine_hours:hoursRaw===''?null:Number(hoursRaw),settings,change_made:String(f.get('change_made')||''),result:String(f.get('result')) as SetupResult,notes:String(f.get('notes')||'')});
   setAdding(false);await load();
  }catch(err){setError((err as Error).message);}finally{setBusy(false);}
 }
 function describe(log:SetupLog){const set=SETUP_FIELDS.filter(f=>log.settings[f.key]!==null&&log.settings[f.key]!==undefined&&log.settings[f.key]!=='');return set.map(f=>`${f.label}: ${log.settings[f.key]}`).join('; ');}
 return <section className="panel setup-log">
  <div className="panel-title"><div><h2>Setup log</h2><p className="subtle">What you ran, where, and whether it was better. One change at a time reads cleanest.</p></div><button className="button" onClick={()=>setAdding(!adding)}><Plus size={16}/>Log a setup</button></div>
  {error&&<div className="error" role="alert">{error}</div>}
  {adding&&<form onSubmit={save} className="service-form">
   <div className="form-grid">
    <label className="field"><span>Date</span><input type="date" name="recorded_at" required defaultValue={new Date().toISOString().slice(0,10)}/></label>
    <label className="field"><span>Track</span><input name="track" maxLength={120} placeholder="Where you rode"/></label>
    <label className="field"><span>Conditions</span><input name="conditions" maxLength={200} placeholder="Deep sand, hard pack, rutted, 85°F…"/></label>
    <label className="field"><span>Engine hours</span><input name="engine_hours" type="number" min="0" step="0.1" defaultValue={bike.engine_hours??''} placeholder="Unknown"/></label>
   </div>
   {(['Fork','Shock','Chassis','Engine'] as const).map(group=><details key={group} className="config-group" open={group==='Fork'||group==='Shock'}><summary>{group}</summary><div className="form-grid">{SETUP_FIELDS.filter(f=>f.group===group).map(f=><label className="field" key={f.key}><span>{f.label}</span><input name={f.key} maxLength={200} defaultValue={latest?.settings[f.key]??''} placeholder="Not recorded"/></label>)}</div></details>)}
   <label className="field"><span>What changed from last time</span><input name="change_made" maxLength={1000} placeholder="e.g. fork compression 2 clicks softer"/></label>
   <div className="form-grid"><label className="field"><span>Result</span><select name="result" defaultValue="not_tested">{Object.entries(SETUP_RESULT_LABELS).map(([k,l])=><option key={k} value={k}>{l}</option>)}</select></label></div>
   <label className="field"><span>How it felt</span><textarea name="notes" rows={3} maxLength={4000} placeholder="Where on the track, what the bike did, what you’d try next."/></label>
   <div className="button-row"><button className="button" type="submit" disabled={busy}>{busy?'Saving…':'Save setup'}</button><button className="button secondary" type="button" onClick={()=>setAdding(false)}>Cancel</button></div>
  </form>}
  {!logs.length&&!adding&&<div className="empty"><h3>Your tuning notebook starts here.</h3><p>Log the settings you ran and how the bike felt. Next time you’ll know what worked at this track.</p></div>}
  <div className="service-list">{logs.map((log,i)=>{const prior=logs[i+1],diff=prior?setupDifferences(prior.settings,log.settings):[];return <article key={log.id}>
   <div className={'result-chip '+log.result}>{SETUP_RESULT_LABELS[log.result]}</div>
   <div><h3>{log.track||'Track not recorded'}</h3><span className="subtle">{day(log.recorded_at)}{log.conditions?' · '+log.conditions:''}{log.engine_hours!==null?` · ${log.engine_hours} h`:''}</span>
    {log.change_made&&<p className="plain-message"><b>Changed:</b> {log.change_made}</p>}
    {diff.length>0&&<ul className="diff-list">{diff.map(d=><li key={d.key}>{d.label}: {d.from} → {d.to}</li>)}</ul>}
    {log.notes&&<p className="plain-message">{log.notes}</p>}
    <details><summary>All settings</summary><p className="subtle">{describe(log)||'No settings recorded.'}</p></details>
    <div className="row-actions">{onAsk&&<button className="text-button" onClick={()=>onAsk(`Setup log from ${day(log.recorded_at)}${log.track?' at '+log.track:''}${log.conditions?' ('+log.conditions+')':''}. Settings: ${describe(log)||'none recorded'}.${log.change_made?' Change made: '+log.change_made+'.':''} Result: ${SETUP_RESULT_LABELS[log.result]}.${log.notes?' Notes: '+log.notes:''}\n\nWhat should I try next?`)}>Ask BAK about this <ArrowRight size={14}/></button>}<button className="text-button" onClick={async()=>{if(!confirm('Delete this setup entry?'))return;try{await api('/setup-logs?id='+log.id,'DELETE');await load();}catch(e){setError((e as Error).message);}}}><Trash2 size={13}/>Delete</button></div>
   </div></article>;})}</div>
 </section>;
}

/* ------------------------------------------------------------------ Parts catalog */
export function PartsCatalog({bike}:{bike?:Bike}){
 const [catalog,setCatalog]=useState<PartCatalog|null|undefined>(undefined),[assemblies,setAssemblies]=useState<PartAssembly[]>([]),[open,setOpen]=useState(''),[parts,setParts]=useState<Part[]>([]),[error,setError]=useState(''),[find,setFind]=useState('');
 const [partsLoading,setPartsLoading]=useState(false);const [partsLoaded,setPartsLoaded]=useState(false);const requestId=useRef(0);
 const [fit,setFit]=useState<{number:string;rows:PartFit[]|null;error:string}|null>(null);
 async function showFit(number:string){if(fit?.number===number){setFit(null);return;}setFit({number,rows:null,error:''});try{const d=await api<{part_number:string;fits:PartFit[]}>('/parts/fitment?part_number='+encodeURIComponent(number));setFit(f=>f?.number===number?{number,rows:d.fits,error:''}:f);}catch(e){setFit(f=>f?.number===number?{number,rows:[],error:(e as Error).message}:f);}}
 useEffect(()=>{let live=true;requestId.current++;setCatalog(undefined);setAssemblies([]);setOpen('');setParts([]);setPartsLoading(false);setPartsLoaded(false);setError('');if(bike)api<{catalog:PartCatalog|null;assemblies:PartAssembly[]}>('/parts/catalog?bike_id='+bike.id).then(d=>{if(live){setCatalog(d.catalog);setAssemblies(d.assemblies);}}).catch(e=>{if(live){setError(e.message);setCatalog(null);}});return()=>{live=false};},[bike?.id]);
 async function show(a:PartAssembly){const current=++requestId.current;if(open===a.id){setOpen('');setPartsLoading(false);return;}setOpen(a.id);setParts([]);setPartsLoaded(false);setPartsLoading(true);setError('');try{const result=await api<Part[]>('/parts?assembly_id='+a.id);if(requestId.current===current){setParts(result);setPartsLoaded(true);}}catch(e){if(requestId.current===current)setError((e as Error).message);}finally{if(requestId.current===current)setPartsLoading(false);}}
 if(!bike||catalog===undefined)return null;
 const shown=assemblies.filter(a=>a.name.toLowerCase().includes(find.trim().toLowerCase()));
 return <section className="panel parts-catalog">
  <div className="panel-title"><div><h2>Parts catalog</h2><p className="subtle">{catalog?`${catalog.source}${catalog.complete?'':' · partial capture'} · ${catalog.assembly_count} assemblies · ${catalog.part_count} part entries`:'Exact model-year catalog'}</p></div></div>
  {error&&<div className="error" role="alert">{error}</div>}
  {!catalog?<div className="empty"><h3>No parts catalog for this exact bike yet.</h3><p>Catalogs are loaded per model year, variant and region. A neighbouring year is never shown in its place.</p></div>:<>
   {/no market label/i.test(catalog.source)&&<p className="notice">The manufacturer lists this model year once, without a market label, so this is the only official catalog for it. Confirm the part number with your dealer before ordering.</p>}
   {/EU market/i.test(catalog.source)&&<p className="notice">The manufacturer lists this catalog under its EU market only. This model was also sold in the US, but a US bike can differ in a few parts. Confirm the part number with your dealer before ordering.</p>}
   <label className="field"><span>Find an assembly</span><input value={find} onChange={e=>setFind(e.target.value)} placeholder="Front fork, clutch, cylinder head…"/></label>
   <div className="assembly-list">{shown.map(a=><div key={a.id} className={'assembly'+(open===a.id?' open':'')}>
    <button className="assembly-head" aria-expanded={open===a.id} onClick={()=>show(a)}><span>{a.name}</span><ArrowRight size={15}/></button>
    {open===a.id&&<div className="assembly-body">
     {a.diagram_url&&<a href={a.diagram_url} target="_blank" rel="noreferrer" className="text-button">Open exploded diagram <ArrowRight size={14}/></a>}
     {partsLoading?<p className="subtle" role="status">Loading parts…</p>:!partsLoaded?<p className="subtle" role="status">Parts could not be loaded. Try reopening this assembly.</p>:!parts.length?<p className="subtle" role="status">No part entries have been imported for this assembly.</p>:<table><thead><tr><th>Ref</th><th>Part number</th><th>Description</th><th>Qty</th></tr></thead><tbody>{parts.map(p=><Fragment key={p.id}><tr><td>{p.callout}</td><td>{p.part_number?<button className="part-number" aria-expanded={fit?.number===p.part_number} title="See which other bikes list this part number" onClick={()=>showFit(p.part_number!)}>{p.part_number}</button>:'—'}</td><td>{p.description}{p.remarks&&<small>{p.remarks}</small>}</td><td>{p.quantity_raw==='0'?'As needed':p.quantity_raw||'—'}</td></tr>
      {p.part_number&&fit?.number===p.part_number&&<tr className="fit-row"><td colSpan={4}>{fit.error?<span className="error" role="alert">{fit.error}</span>:!fit.rows?<span className="subtle" role="status">Checking other catalogs…</span>:<FitList bike={bike} rows={fit.rows}/>}</td></tr>}</Fragment>)}</tbody></table>}
     <p className="subtle">Catalog quantities are per assembly as published, not whole-bike totals. Confirm superseded numbers with a dealer before ordering.</p>
    </div>}
   </div>)}</div>
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
export function SetupGuide({onAsk}:{onAsk?:(text:string)=>void}){
 const [view,setView]=useState<'feel'|'adjusters'|'faults'|'tuner'>('feel'),[open,setOpen]=useState('');
 return <section className="panel setup-guide">
  <div className="panel-title"><div><h2>Setup guide</h2><p className="subtle">What each adjustment does and where to start for what you’re feeling. Direction only — your bike’s published settings live in Specs.</p></div></div>
  <div className="tabs"><button className={view==='feel'?'active':''} onClick={()=>{setView('feel');setOpen('');}}>By what you feel</button><button className={view==='adjusters'?'active':''} onClick={()=>{setView('adjusters');setOpen('');}}>By adjustment</button><button className={view==='faults'?'active':''} onClick={()=>{setView('faults');setOpen('');}}>Not a setting</button><button className={view==='tuner'?'active':''} onClick={()=>{setView('tuner');setOpen('');}}>Your tuner</button></div>
  {view==='feel'?<div className="assembly-list">{symptomGuides.map(g=><div key={g.id} className={'assembly'+(open===g.id?' open':'')}>
   <button className="assembly-head" aria-expanded={open===g.id} onClick={()=>setOpen(open===g.id?'':g.id)}><span>“{g.rider_says[0]}”<small className="subtle">{g.rider_says.slice(1,4).join(', ')}</small></span><ArrowRight size={15}/></button>
   {open===g.id&&<div className="assembly-body guide-body"><p className="subtle">{g.where}</p>{g.ask&&<p className="decider"><b>The question that decides:</b> {g.ask}</p>}<h4>Check first</h4><ul>{g.check_first.map((c,i)=><li key={i}>{c}</li>)}</ul><h4>Likely causes</h4>{g.likely.map((l,i)=><div className="hypothesis" key={i}><strong>{l.cause}</strong><p>{l.tell}</p><p><b>First change:</b> {l.first_change}</p></div>)}{g.note&&<p className="subtle"><b>Common wrong move:</b> {g.note}</p>}{onAsk&&<button className="text-button" onClick={()=>onAsk(`My bike ${g.rider_says[0]}. `)}>Ask BAK about this on my bike <ArrowRight size={14}/></button>}</div>}
  </div>)}</div>:view==='faults'?<div className="assembly-list">{mechanicalMimics.map(m=><div key={m.fault} className={'assembly'+(open===m.fault?' open':'')}>
   <button className="assembly-head" aria-expanded={open===m.fault} onClick={()=>setOpen(open===m.fault?'':m.fault)}><span>{m.fault}<small className="subtle">{m.feels_like}</small></span><ArrowRight size={15}/></button>
   {open===m.fault&&<div className="assembly-body guide-body"><h4>How to check</h4><p>{m.check}</p></div>}
  </div>)}</div>:view==='tuner'?<div className="guide-body tuner-guide"><h4>The order the pros work in</h4><ol>{workOrder.map((w,i)=><li key={i}>{w}</li>)}</ol><h4>Getting the most from your suspension tuner</h4><ul>{talkingToYourTuner.map((w,i)=><li key={i}>{w}</li>)}</ul></div>:<div className="assembly-list">{adjusters.map(a=><div key={a.id} className={'assembly'+(open===a.id?' open':'')}>
   <button className="assembly-head" aria-expanded={open===a.id} onClick={()=>setOpen(open===a.id?'':a.id)}><span>{a.name}</span><ArrowRight size={15}/></button>
   {open===a.id&&<div className="assembly-body guide-body"><p>{a.controls}</p><div className="guide-grid"><div><h4>Firmer / more</h4><p>{a.firmer_or_more}</p><p className="subtle"><b>Too much:</b> {a.too_much}</p></div><div><h4>Softer / less</h4><p>{a.softer_or_less}</p><p className="subtle"><b>Too little:</b> {a.too_little}</p></div></div><p className="subtle">{a.notes}</p></div>}
  </div>)}</div>}
  <details className="before-tune"><summary>Before you touch a clicker</summary><ul>{beforeYouTune.map((b,i)=><li key={i}>{b}</li>)}</ul></details>
 </section>;
}

/* ------------------------------------------------------------------ Rider profile */
export function RiderProfile({riderId,onClose,onMessage}:{riderId:string;onClose:()=>void;onMessage:(r:RiderRef)=>void}){
 const [data,setData]=useState<{profile:Profile;posts:{id:string;category:PostCategory;body:string;bike_label:string;created_at:string}[];mine:boolean}|null>(null),[error,setError]=useState('');
 useEffect(()=>{let live=true;setData(null);setError('');api<typeof data>('/profiles?id='+riderId).then(d=>{if(live)setData(d);}).catch(e=>{if(live)setError(e.message);});return()=>{live=false};},[riderId]);
 return <div className="modal-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}><section className="modal wide" role="dialog" aria-modal="true" aria-label="Rider profile"><button className="icon-button modal-close" onClick={onClose} aria-label="Close"><X/></button>
  {error&&<div className="error" role="alert">{error}</div>}
  {!data&&!error&&<p className="subtle" role="status">Loading rider…</p>}
  {data&&<>
   <header className="post-head"><div className="avatar" aria-hidden="true">{riderName(data.profile).replace('@','').slice(0,1).toUpperCase()}</div><div><h2 style={{margin:0}}>{riderName(data.profile)}</h2><span className="subtle">@{data.profile.handle}{data.profile.location?' · '+data.profile.location:''}{data.profile.riding_class?' · '+data.profile.riding_class:''}</span></div></header>
   {data.profile.bio&&<p className="plain-message">{data.profile.bio}</p>}
   <p className="subtle">Riding with BAK MX since {new Date(data.profile.created_at).toLocaleDateString([],{month:'long',year:'numeric'})}</p>
   {!data.mine&&<RiderActions rider={data.profile} target={{type:'profile',id:data.profile.user_id}} onMessage={r=>{onClose();onMessage(r);}} onBlocked={onClose}/>}
   <div className="section-line"><h2>Recent posts</h2></div>
   {!data.posts.length&&<p className="subtle">No posts yet.</p>}
   {data.posts.map(p=><div className="comment" key={p.id}><span className="kind-tag" style={{marginLeft:0}}>{POST_CATEGORY_LABELS[p.category].toUpperCase()}</span>{p.bike_label&&<span className="bike-tag" style={{marginLeft:8}}>{p.bike_label}</span>}<p className="plain-message">{p.body}</p><span className="subtle">{when(p.created_at)}</span></div>)}
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
 async function resolve(r:ReportRow,action:'dismiss'|'remove_content'){setBusy(r.id);setError('');try{await api('/admin/reports','POST',{report_id:r.id,action});await load();}catch(e){setError((e as Error).message);}finally{setBusy('');}}
 if(!reports)return null;
 const text=(c:ReportRow['content'])=>c?String(c.body??c.title??c.bio??c.handle??''):'';
 return <section className="panel"><span className="eyebrow">ADMIN · REPORTS</span><h2>{reports.length?`${reports.length} open ${reports.length===1?'report':'reports'}`:'No open reports'}</h2>
  {error&&<div className="error" role="alert">{error}</div>}
  {reports.map(r=><div className="comment" key={r.id}><span className="kind-tag" style={{marginLeft:0}}>{r.target_type.toUpperCase()}</span><span className="subtle"> · reported {when(r.created_at)}</span>
   <p className="plain-message"><b>Reason:</b> {r.reason}</p>
   <p className="plain-message">{r.content?text(r.content)||'(no text)':'The reported item no longer exists.'}</p>
   <div className="button-row">{['post','comment','event'].includes(r.target_type)&&r.content&&<button className="button" disabled={busy===r.id} onClick={()=>resolve(r,'remove_content')}>Remove content</button>}<button className="button secondary" disabled={busy===r.id} onClick={()=>resolve(r,'dismiss')}>Dismiss</button></div></div>)}
 </section>;
}
