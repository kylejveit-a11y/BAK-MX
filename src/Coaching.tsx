// Coaching history for a bike on the web: every clip or riding photo BAK coached, newest first, with the fix and drill up
// front and the frames and full answer one tap away. "Tried it?" posts how it went, so BAK reads it next time.
import {useCallback,useEffect,useState} from 'react';
import {ChevronDown,ChevronRight} from 'lucide-react';
import type {Bike} from '../shared/types';
import {coachFocus,type ChatMedia} from '../shared/coach-focus';
import {api} from './client';
import type {Photo} from './photos';
import {RichText} from './RichText';
import './rider-extras.css';

export type Tried={result:'better'|'no_change'|'worse';note:string;updated_at:string};
export type CoachingSession={id:string;message_id:string|null;at:string;question:string;media:ChatMedia;photos:Photo[];answer:string;fix:string;drill:string;tried:Tried|null};
const TRIED:{key:Tried['result'];label:string;said:string}[]=[{key:'better',label:'Helped',said:'helped'},{key:'no_change',label:'No change',said:'made no difference'},{key:'worse',label:'Worse',said:'made it worse'}];
const errorText=(e:unknown)=>e instanceof Error?e.message:'Coaching history could not load.';
const day=(iso:string)=>new Date(iso).toLocaleDateString(undefined,{month:'short',day:'numeric'});
export const sessionLabel=(s:CoachingSession)=>`${coachFocus(s.media.focus)?.label??(s.media.kind==='clip'?'Clip':'Photos')} · ${day(s.at)}`;

export function useCoachingSessions(bikeId:string|undefined,enabled=true){
 const [sessions,setSessions]=useState<CoachingSession[]|null>(null),[error,setError]=useState('');
 const load=useCallback(async()=>{if(!bikeId||!enabled){setSessions([]);return;}try{setError('');setSessions(await api<CoachingSession[]>('/coaching?bike_id='+bikeId));}catch(e){setError(errorText(e));setSessions([]);}},[bikeId,enabled]);
 useEffect(()=>{setSessions(null);void load();},[load]);
 const update=useCallback((id:string,tried:Tried)=>setSessions(old=>old?old.map(s=>s.id===id?{...s,tried}:s):old),[]);
 return {sessions,error,reload:load,update};
}

/** Garage › Coaching. onCoach opens Ask BAK with a clip; onAsk sends a follow-up question there. */
export function CoachingList({bike,signedIn=true,onSignIn,onCoach,onAsk}:{bike?:Bike;signedIn?:boolean;onSignIn?:()=>void;onCoach?:()=>void;onAsk?:(text:string)=>void}){
 const {sessions,error,update}=useCoachingSessions(bike?.id,signedIn&&!!bike);
 if(!signedIn)return <section className="panel"><div className="rx-prompt"><p className="rx-copy">Sign in to see the coaching BAK has given you.</p>{onSignIn&&<button className="button" onClick={onSignIn}>Sign in</button>}</div></section>;
 if(!bike)return <section className="panel"><p className="rx-copy">Add a bike first. Coaching sessions are kept with the bike you were riding.</p></section>;
 return <section className="panel rx-panel-gap">
  <div className="rx-between"><span className="eyebrow" style={{margin:0}}>COACHING</span>{!!sessions?.length&&<span className="rx-count">{sessions.length} session{sessions.length===1?'':'s'}</span>}</div>
  {sessions===null&&<div className="rx-center" role="status" aria-label="Loading"><span className="rx-spin"/></div>}
  {error&&<p className="rx-error" role="alert">{error}</p>}
  {sessions!==null&&!sessions.length&&!error&&<div className="rx-panel-gap" style={{gap:10}}>
   <p className="rx-copy">Send BAK a short clip or photos of you riding a corner, jump or section from the phone app. Each session lands here with the fix and a drill, so you can see what you have worked on and send a new clip to check it stuck.</p>
   {onCoach&&<button type="button" className="rx-link" onClick={onCoach}>Coach me from a clip <ChevronRight size={15}/></button>}
  </div>}
  {sessions?.map(s=><Session key={s.id} s={s} onTried={t=>update(s.id,t)} onAsk={onAsk}/>)}
 </section>;
}

function Session({s,onTried,onAsk}:{s:CoachingSession;onTried:(t:Tried)=>void;onAsk?:(text:string)=>void}){
 const [open,setOpen]=useState(false);
 const times=s.media.kind==='clip'&&s.media.frames.length===s.photos.length?s.media.frames:undefined;
 const cover=s.photos[Math.floor(s.photos.length/2)];
 return <article className="rx-session">
  <div className="rx-session-top">
   {cover&&<img src={cover.url} alt=""/>}
   <div>
    <b>{sessionLabel(s)}{s.media.kind==='clip'?` · ${s.media.duration.toFixed(0)} s clip`:''}</b>
    {!!s.fix&&<p><strong>Fix: </strong>{s.fix}</p>}
    {!!s.drill&&<p className="drill"><strong>Drill: </strong>{s.drill}</p>}
    {s.tried&&<p className={'tried'+(s.tried.result==='better'?' good':'')}>You said it {TRIED.find(t=>t.key===s.tried!.result)?.said}{s.tried.note?`: ${s.tried.note}`:''}</p>}
   </div>
  </div>
  <button type="button" className="rx-link muted" aria-expanded={open} onClick={()=>setOpen(!open)}>Frames and full coaching {open?<ChevronDown size={15}/>:<ChevronRight size={15}/>}</button>
  {open&&<div>
   {s.photos.length>0&&<div className="rx-frames">{s.photos.map((p,i)=><figure key={p.id}><a href={p.url} target="_blank" rel="noreferrer"><img src={p.url} alt={times?`Frame at ${times[i].toFixed(1)} s`:`Photo ${i+1}`}/></a>{times&&<figcaption>{times[i].toFixed(1)} s</figcaption>}</figure>)}</div>}
   <RichText text={s.answer}/>
   {s.message_id&&<TriedCard messageId={s.message_id} tried={s.tried} onSaved={onTried} onAsk={onAsk}/>}
  </div>}
 </article>;
}

/** Under a coaching answer: did the fix or drill help? BAK reads the answer next time. */
export function TriedCard({messageId,tried,onSaved,onAsk}:{messageId:string;tried:Tried|null;onSaved:(t:Tried)=>void;onAsk?:(text:string)=>void}){
 const [pick,setPick]=useState<Tried['result']|null>(null),[note,setNote]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[edit,setEdit]=useState(false);
 if(tried&&!edit){const t=TRIED.find(x=>x.key===tried.result)!;return <div className="rx-tried">
  <p className="rx-copy">You said this <strong style={{color:'#e7e9ee'}}>{t.said}</strong>{tried.note?`: ${tried.note}`:'.'}</p>
  <div className="rx-line">
   {onAsk&&<button type="button" className="rx-link" onClick={()=>onAsk(`I tried the coaching from my clip and it ${t.said}.${tried.note?' '+tried.note:''} What should I work on next?`)}>Ask BAK what’s next</button>}
   <button type="button" className="rx-link muted" onClick={()=>{setPick(tried.result);setNote(tried.note);setEdit(true);}}>Change</button>
  </div>
 </div>;}
 async function save(){if(!pick||busy)return;setBusy(true);setError('');try{const t=await api<Tried>('/coaching/result','POST',{message_id:messageId,result:pick,note:note.trim()});setEdit(false);onSaved(t);}catch(e){setError(e instanceof Error?e.message:'That did not save. Try again.');}finally{setBusy(false);}}
 return <div className="rx-tried">
  <h4>Tried it? Did it help?</h4>
  <div className="rx-chips" role="group" aria-label="How it went">{TRIED.map(t=><button key={t.key} type="button" className="rx-chip" aria-pressed={pick===t.key} onClick={()=>setPick(t.key)}>{t.label}</button>)}</div>
  {pick&&<>
   <textarea value={note} maxLength={1000} placeholder={pick==='better'?'What felt better? (optional)':pick==='worse'?'What got worse? (optional)':'Anything you noticed? (optional)'} onChange={e=>setNote(e.target.value)}/>
   {error&&<p className="rx-error" role="alert">{error}</p>}
   <div className="button-row" style={{marginTop:0}}><button type="button" className="button" disabled={busy} onClick={()=>void save()}>{busy?'Saving…':'Save'}</button>{edit&&<button type="button" className="button secondary" onClick={()=>setEdit(false)}>Cancel</button>}</div>
  </>}
 </div>;
}

/** Home block: the last fix and drill BAK gave on this bike, opening the Coaching tab. Nothing shows until there is one. */
export function CoachingBlock({bike,signedIn=true,onOpen}:{bike?:Bike;signedIn?:boolean;onOpen:()=>void}){
 const [s,setS]=useState<CoachingSession|null|undefined>(undefined);
 useEffect(()=>{let live=true;setS(undefined);if(!bike||!signedIn){setS(null);return;}api<CoachingSession[]>('/coaching?bike_id='+bike.id).then(l=>{if(live)setS(l[0]??null);}).catch(()=>{if(live)setS(null);});return()=>{live=false;};},[bike?.id,signedIn]);
 if(!s||!s.fix)return null;
 return <section className="panel rx-panel-gap">
  <div className="rx-between"><span className="eyebrow" style={{margin:0}}>LAST COACHING</span><button type="button" className="rx-link" onClick={onOpen}>Coaching <ChevronRight size={15}/></button></div>
  <p className="rx-copy strong" style={{fontSize:15}}><strong>Fix: </strong>{s.fix}</p>
  {!!s.drill&&<p className="rx-copy"><strong>Drill: </strong>{s.drill}</p>}
 </section>;
}
