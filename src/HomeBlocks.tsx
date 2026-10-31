// Home, the rider's way, on the website: blocks they can turn on, off and reorder (saved on this browser), the phone app's
// tile list, a bike cover photo, and the small pieces the chat borrows (disclosures, tuning notes, a sheet). Mirrors
// apps/mobile/src/HomeBlocks.tsx so the phone-sized site reads like the app.
import {chatTopic} from '../shared/chat-topic';
import './home.css';
import {useEffect,useState,type ReactNode} from 'react';
import {ChevronDown,ChevronRight,ChevronUp,MessageSquare,NotebookPen,X} from 'lucide-react';
import type {Bike,ServiceEvent} from '../shared/types';
import {EVENT_TYPE_LABELS,SETUP_RESULT_LABELS,type RideEvent,type SetupLog} from '../shared/rider-types';
import {RACE_PHASES,hydratePrepList,fitsEngine,type PrepItem} from '../shared/race-prep';
import {garageModelInfo} from '../shared/garage-models';
import type {PlanItem} from '../shared/service-plan';
import {api} from './client';

export const errorText=(e:unknown)=>e instanceof Error&&e.message?e.message:'Something went wrong. Please try again.';
export const when=(iso:string)=>new Date(iso).toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'});
export const timeOf=(iso:string)=>new Date(iso).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});

// ------------------------------------------------------------------ this browser's storage
/** Per-account keys, like the phone's readProgress/writeProgress. Nothing here syncs: say "saved on this device" in the UI. */
const localKey=(account:string,key:string)=>`bakmx:${account}:${key}`;
export function readLocal<T>(account:string,key:string,fallback:T):T{try{const raw=localStorage.getItem(localKey(account,key));return raw===null?fallback:JSON.parse(raw) as T;}catch{return fallback;}}
/** False when the browser refused (private window, full storage): the caller tells the rider. */
export function writeLocal<T>(account:string,key:string,value:T):boolean{try{if(value===null||value===undefined)localStorage.removeItem(localKey(account,key));else localStorage.setItem(localKey(account,key),JSON.stringify(value));return true;}catch{return false;}}
/** State that lives on this browser. Returns the value, a setter and a line to show when the save failed. */
export function useLocal<T>(account:string,key:string,fallback:T):[T,(v:T)=>boolean,string]{
 const [value,setValue]=useState<T>(()=>readLocal(account,key,fallback)),[error,setError]=useState('');
 useEffect(()=>{setValue(readLocal(account,key,fallback));setError('');},[account,key]);
 const set=(v:T)=>{setValue(v);const ok=writeLocal(account,key,v);setError(ok?'':'This could not be saved on this browser. It stays until you leave the page.');return ok;};
 return [value,set,error];
}

// ------------------------------------------------------------------ small pieces
export function Sheet({title,onClose,closeLabel='Close',children,label}:{title:string;onClose:()=>void;closeLabel?:string;children:ReactNode;label?:string}){
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};document.addEventListener('keydown',key);const prev=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.removeEventListener('keydown',key);document.body.style.overflow=prev;};},[]);
 return <div className="hb-sheet-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}><section className="hb-sheet" role="dialog" aria-modal="true" aria-label={label??title}>
  <div className="hb-sheet-head"><h2 className="hb-title">{title}</h2><button type="button" className="hb-sheet-close" onClick={onClose}>{closeLabel}</button></div>
  {children}
 </section></div>;
}
export function BlockHead({title,action,onAction}:{title:string;action?:string;onAction?:()=>void}){
 return <div className="hb-block-head"><span className="eyebrow"><i className="hb-mark" aria-hidden="true"/>{title}</span>{action&&onAction&&<button type="button" className="hb-link" onClick={onAction}>{action}<ChevronRight size={15} strokeWidth={2.2}/></button>}</div>;
}
export function Chip({on=false,onClick,children,square=false,disabled=false,role='button'}:{on?:boolean;onClick:()=>void;children:ReactNode;square?:boolean;disabled?:boolean;role?:'button'|'radio'}){
 return <button type="button" role={role} aria-pressed={role==='button'?on:undefined} aria-checked={role==='radio'?on:undefined} disabled={disabled} className={'hb-chip'+(on?' on':'')+(square?' square':'')} onClick={onClick}>{children}</button>;
}
export function Switch({on,onChange,label}:{on:boolean;onChange:(v:boolean)=>void;label:string}){
 return <button type="button" role="switch" aria-checked={on} aria-label={label} className="hb-switch" onClick={()=>onChange(!on)}/>;
}
export function Progress({done,total}:{done:number;total:number}){return <div className="hb-progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}><i style={{width:`${total?Math.round(done/total*100):0}%`}}/></div>;}
/** A section that starts closed: the answer stays short, the working is one tap away. */
export function Disclosure({title,children,className=''}:{title:string;children:ReactNode;className?:string}){return <details className={'hb-disclosure '+className}><summary>{title}</summary>{children}</details>;}

// ------------------------------------------------------------------ tiles
export function Tiles({children}:{children:ReactNode}){return <div className="hb-tiles">{children}</div>;}
export function Tile({icon:Icon,title,detail,onClick,featured=false}:{icon:typeof ChevronRight;title:string;detail?:string;onClick:()=>void;featured?:boolean}){
 return <button type="button" className={'hb-tile'+(featured?' featured':'')} onClick={onClick} aria-label={title+(detail?'. '+detail:'')}><Icon size={22}/><strong>{title}</strong>{detail&&<small>{detail}</small>}<ChevronRight className="hb-tile-arrow" size={17}/></button>;
}

// ------------------------------------------------------------------ layout
export type HomeBlock='bike'|'prep'|'service'|'setup'|'events'|'coaching'|'tools';
export const HOME_BLOCKS:{id:HomeBlock;label:string;detail:string}[]=[
 {id:'bike',label:'Your bike',detail:'Photo, hours and setup checklist'},
 {id:'prep',label:'Race prep',detail:'Your own checklist, week before to after'},
 {id:'service',label:'Service due',detail:'What’s due next, by hours'},
 {id:'setup',label:'Last setup change',detail:'What you changed and how it rode'},
 {id:'events',label:'Upcoming events',detail:'Your next ride days and races'},
 {id:'coaching',label:'Last coaching',detail:'Your latest fix and drill'},
 {id:'tools',label:'Shortcuts',detail:'Setup log, workshop, specs and more'},
];
export type Layout={id:HomeBlock;on:boolean}[];
const DEFAULT_LAYOUT:Layout=HOME_BLOCKS.map(b=>({id:b.id,on:true}));
/** Saved order, with any block added in a later version slotted in (on) so riders always see new things once. */
export function useHomeLayout(account:string){
 const [layout,setLayout]=useState<Layout>(()=>mergeLayout(readLocal<Layout|null>(account,'home-layout',null)));
 const [error,setError]=useState('');
 useEffect(()=>{setLayout(mergeLayout(readLocal<Layout|null>(account,'home-layout',null)));},[account]);
 const save=(next:Layout)=>{setLayout(next);setError(writeLocal(account,'home-layout',next)?'':'Your Home layout could not be saved on this browser.');};
 return {layout,save,reset:()=>save(DEFAULT_LAYOUT),error};
}
function mergeLayout(saved:Layout|null):Layout{
 if(!Array.isArray(saved))return DEFAULT_LAYOUT;
 const out=saved.filter(b=>b&&HOME_BLOCKS.some(h=>h.id===b.id)).map(b=>({id:b.id,on:b.on!==false}));
 DEFAULT_LAYOUT.forEach((d,i)=>{if(out.some(k=>k.id===d.id))return;const prev=DEFAULT_LAYOUT[i-1],at=prev?out.findIndex(k=>k.id===prev.id):-1;out.splice(at+1,0,d);});
 return out;
}
export function HomeEditor({layout,onChange,onReset,onClose,error}:{layout:Layout;onChange:(l:Layout)=>void;onReset:()=>void;onClose:()=>void;error?:string}){
 const move=(i:number,d:-1|1)=>{const j=i+d;if(j<0||j>=layout.length)return;const next=[...layout];[next[i],next[j]]=[next[j],next[i]];onChange(next);};
 return <Sheet title="Edit Home" onClose={onClose} closeLabel="Done">
  <p className="hb-copy">Turn blocks on or off and move them up or down. Saved on this device.</p>
  {error&&<p className="hb-error" role="alert">{error}</p>}
  <div>{layout.map((b,i)=>{const meta=HOME_BLOCKS.find(h=>h.id===b.id)!;return <div key={b.id} className="hb-edit-row">
   <div className="hb-grow"><b className={b.on?'':'off'}>{meta.label}</b><small>{meta.detail}</small></div>
   <button type="button" className="hb-arrow" aria-label={`Move ${meta.label} up`} disabled={i===0} onClick={()=>move(i,-1)}><ChevronUp size={16}/></button>
   <button type="button" className="hb-arrow" aria-label={`Move ${meta.label} down`} disabled={i===layout.length-1} onClick={()=>move(i,1)}><ChevronDown size={16}/></button>
   <Switch on={b.on} label={`Show ${meta.label}`} onChange={v=>onChange(layout.map(x=>x.id===b.id?{...x,on:v}:x))}/>
  </div>;})}</div>
  <button type="button" className="hb-link muted" onClick={onReset}>Reset to the standard layout</button>
 </Sheet>;
}

// ------------------------------------------------------------------ blocks
/** The bike's own photo, when one is in the Garage. Nothing shows until a photo exists. */
export function BikeCover({bikeId}:{bikeId:string}){
 const [url,setUrl]=useState(''),[error,setError]=useState('');
 useEffect(()=>{let live=true;setUrl('');setError('');api<{id:string;url:string}[]>(`/photos?kind=bike&bike_id=${bikeId}`).then(r=>{if(live&&r[0]?.url)setUrl(r[0].url);}).catch(e=>{if(live)setError('Your bike photo could not load: '+errorText(e));});return()=>{live=false;};},[bikeId]);
 if(error)return <p className="hb-note" role="status">{error}</p>;
 return url?<img className="hb-cover" src={url} alt="Your bike"/>:null;
}

type Plan={items:PlanItem[];source:string|null};
/** What is due next, by hours: the rider's own "next due" on each logged item, or the maker's interval from the service plan
 *  counted from the last time that item was done. Nearest first. */
export function ServiceDueBlock({bike,onOpen}:{bike:Bike;onOpen:()=>void}){
 const [events,setEvents]=useState<ServiceEvent[]|null>(null),[plan,setPlan]=useState<Plan|null>(null),[error,setError]=useState('');
 useEffect(()=>{let live=true;setEvents(null);setPlan(null);setError('');
  api<ServiceEvent[]>(`/services?bike_id=${bike.id}`).then(r=>{if(live)setEvents(r.filter(e=>e.bike_id===bike.id));}).catch(e=>{if(live){setEvents([]);setError('Your service log could not load: '+errorText(e));}});
  api<Plan>(`/service-plan?bike_id=${bike.id}`).then(r=>{if(live)setPlan(r);}).catch(()=>{if(live)setPlan({items:[],source:null});});
  return()=>{live=false;};},[bike.id,bike.updated_at]);
 if(!events)return null;
 const latest=new Map<string,ServiceEvent>();for(const e of [...events].sort((a,b)=>b.performed_at.localeCompare(a.performed_at)))if(!latest.has(e.category))latest.set(e.category,e);
 type Due={key:string;category:string;at:number;from:'you'|'maker'};
 const due:Due[]=[];
 for(const e of latest.values()){
  if(e.next_due_hours!=null){due.push({key:e.id,category:e.category,at:e.next_due_hours,from:'you'});continue;}
  const item=plan?.items.find(p=>p.category===e.category);
  if(item&&e.engine_hours!=null)due.push({key:e.id,category:e.category,at:Math.round((e.engine_hours+item.every_hours)*10)/10,from:'maker'});
 }
 due.sort((a,b)=>a.at-b.at);
 const show=due.slice(0,3),hours=bike.engine_hours;
 return <section className="panel hb-block"><BlockHead title="SERVICE DUE" action="Service log" onAction={onOpen}/>
  {error&&<p className="hb-error" role="alert">{error}</p>}
  {!show.length&&!error&&<p className="hb-copy">{events.length?'No reminders yet. When you log a service, add when it’s next due and it shows here.':'Log your last oil change or filter, with when it’s next due, and it shows here.'}</p>}
  {show.map(d=>{const left=hours!=null?Math.round((d.at-hours)*10)/10:null;const over=left!=null&&left<=0,soon=left!=null&&left>0&&left<=2;
   return <div key={d.key} className="hb-row"><i className={'hb-dot'+(over?' over':soon?' soon':'')} aria-hidden="true"/><span className="hb-grow hb-strong" style={{fontSize:15.5,fontWeight:600}}>{d.category}</span><span className={'hb-line'+(over?' hb-bad':'')} style={over?{fontWeight:700}:undefined}>{left==null?`at ${d.at} h`:over?`${Math.abs(left)} h overdue`:`in ${left} h`}</span></div>;})}
  {show.some(d=>d.from==='maker')&&<p className="hb-note">Hours to go use the maker’s interval, counted from the last time you logged each job.</p>}
  {show.length>0&&hours==null&&<p className="hb-note">Add the bike’s hours in Garage to count down.</p>}
 </section>;
}

export function LastSetupBlock({bike,onOpen}:{bike:Bike;onOpen:()=>void}){
 const [log,setLog]=useState<SetupLog|null|undefined>(undefined),[error,setError]=useState('');
 useEffect(()=>{let live=true;setLog(undefined);setError('');api<SetupLog[]>(`/setup-logs?bike_id=${bike.id}`).then(l=>{if(live)setLog(l[0]??null);}).catch(e=>{if(live){setLog(null);setError('Your setup log could not load: '+errorText(e));}});return()=>{live=false;};},[bike.id]);
 if(!log&&!error)return null;
 return <section className="panel hb-block"><BlockHead title="LAST SETUP CHANGE" action="Setup log" onAction={onOpen}/>
  {error&&<p className="hb-error" role="alert">{error}</p>}
  {log&&<><p className="hb-strong">{log.change_made||'Setup recorded'}</p>
  <p className="hb-line">{when(log.recorded_at)}{log.track?` · ${log.track}`:''}{log.conditions?` · ${log.conditions}`:''}</p>
  <p className={'hb-line'+(log.result==='better'?' hb-good':log.result==='worse'?' hb-bad':'')} style={{fontWeight:700}}>{SETUP_RESULT_LABELS[log.result]}{log.notes&&<span style={{color:'#98a2b5',fontWeight:400}}> · {log.notes}</span>}</p></>}
 </section>;
}

export function EventsBlock({onOpen}:{onOpen:()=>void}){
 const [events,setEvents]=useState<RideEvent[]|null>(null),[error,setError]=useState('');
 useEffect(()=>{let live=true;api<RideEvent[]>('/events?scope=upcoming').then(e=>{if(live)setEvents(e.filter(x=>!x.canceled_at));}).catch(e=>{if(live){setEvents([]);setError('Events could not load: '+errorText(e));}});return()=>{live=false;};},[]);
 if(!events?.length&&!error)return null;
 const mine=(events??[]).filter(e=>e.my_rsvp||e.mine),list=(mine.length?mine:events??[]).slice(0,2);
 return <section className="panel hb-block"><BlockHead title={mine.length?'YOUR NEXT EVENTS':'UPCOMING EVENTS'} action="Events" onAction={onOpen}/>
  {error&&<p className="hb-error" role="alert">{error}</p>}
  {list.map(e=><button type="button" key={e.id} className="hb-today-entry" style={{textAlign:'left',width:'100%'}} onClick={onOpen}>
   <span style={{fontSize:12.5,fontWeight:700,color:'#eef1f6'}}>{EVENT_TYPE_LABELS[e.event_type]}{e.my_rsvp==='going'?' · You’re going':e.my_rsvp==='interested'?' · Interested':''}</span>
   <strong>{e.title}</strong>
   <span>{when(e.starts_at)} · {timeOf(e.starts_at)} · {e.location_name}</span>
  </button>)}
 </section>;
}

type Coached={fix:string;drill:string;at:string};
export function CoachingBlock({bike,onOpen}:{bike:Bike;onOpen:()=>void}){
 const [s,setS]=useState<Coached|null|undefined>(undefined),[error,setError]=useState('');
 useEffect(()=>{let live=true;setS(undefined);setError('');api<Coached[]>(`/coaching?bike_id=${bike.id}`).then(l=>{if(live)setS(l[0]??null);}).catch(e=>{if(live){setS(null);setError('Your coaching history could not load: '+errorText(e));}});return()=>{live=false;};},[bike.id]);
 if((!s||!s.fix)&&!error)return null;
 return <section className="panel hb-block"><BlockHead title="LAST COACHING" action="Ask BAK" onAction={onOpen}/>
  {error&&<p className="hb-error" role="alert">{error}</p>}
  {s?.fix&&<><p className="hb-copy" style={{color:'#eef1f6',fontSize:15.5}}><b>Fix: </b>{s.fix}</p>
  {!!s.drill&&<p className="hb-copy" style={{fontSize:14.5}}><b>Drill: </b>{s.drill}</p>}
  <p className="hb-note">From a riding clip or photos you sent BAK on the phone app.</p></>}
 </section>;
}

export const disciplineOf=(bike?:Bike)=>bike&&garageModelInfo[`${bike.manufacturer}|${bike.model}`]?.discipline!=='motocross'?'offroad' as const:'mx' as const;
export const engineOf=(bike?:Bike)=>bike?garageModelInfo[`${bike.manufacturer}|${bike.model}`]?.engine??null:null;
/** The rider's race-prep list as the server holds it (or BAK's list for their riding), read-only: items by phase.
 *  Check-offs live on the phone, so none are shown here. */
export function useRacePrepList(bike?:Bike){
 const [list,setList]=useState<PrepItem[]|null>(null),[error,setError]=useState('');
 const discipline=disciplineOf(bike),engine=engineOf(bike);
 useEffect(()=>{let live=true;setError('');api<{items:PrepItem[]|null}>('/race-checklist').then(r=>{if(live)setList(hydratePrepList(r.items,discipline).filter(i=>fitsEngine(i,engine)));}).catch(e=>{if(live){setList(null);setError('Your race prep list could not load: '+errorText(e));}});return()=>{live=false;};},[discipline,engine]);
 return {list,error};
}
export function RacePrepBlock({bike,compact=false}:{bike:Bike;compact?:boolean}){
 const {list,error}=useRacePrepList(bike);
 if(!list&&!error)return null;
 const rows=RACE_PHASES.map(p=>({p,total:(list??[]).filter(i=>i.phase===p.id).length})).filter(r=>r.total>0);
 return <section className="panel hb-block"><BlockHead title="RACE PREP"/>
  {error&&<p className="hb-error" role="alert">{error}</p>}
  {list&&<>
   {!compact&&<p className="hb-copy">Your checklist from the week before to after the race, {list.length} items.</p>}
   <div className="hb-chips">{rows.map(r=><span key={r.p.id} className="hb-chip" style={{cursor:'default'}}>{r.p.short} · {r.total}</span>)}</div>
   <p className="hb-note">Check items off and edit the list in the BAK MX phone app. The list itself is saved to your account.</p>
  </>}
 </section>;
}

// ------------------------------------------------------------------ tuning notes
type Note={id:string;at:string;text:string;conversation:string};
/** A local notebook under the chat: what you changed, how it felt, what's next. Never leaves this browser. */
export function TuningNotes({account,bikeId,conversation}:{account:string;bikeId:string;conversation:string}){
 const [open,setOpen]=useState(false);
 const [draft,setDraft,draftError]=useLocal(account,`tuning-note-draft-${bikeId}`,''),[notes,setNotes,notesError]=useLocal<Note[]>(account,`tuning-notes-${bikeId}`,[]);
 const list=Array.isArray(notes)?notes:[];
 return <div className="hb-notes">
  <button type="button" className="hb-notes-toggle" aria-expanded={open} onClick={()=>setOpen(!open)}><NotebookPen size={21}/><span className="hb-grow"><b>Tuning notes{list.length?` · ${list.length}`:''}</b><small>What you changed, how it felt, what’s next. Saved on this device.</small></span>{open?<ChevronUp size={17}/>:<ChevronDown size={17}/>}</button>
  {open&&<div className="hb-notes-body">
   <label className="hb-field"><span className="hb-field-label">New note</span><textarea className="hb-input" value={draft} maxLength={4000} onChange={e=>setDraft(e.target.value)} placeholder="Rebound 2 slower. Rear stayed down in the braking bumps."/></label>
   {(draftError||notesError)&&<p className="hb-error" role="alert">{draftError||notesError}</p>}
   <button type="button" className="button" disabled={!draft.trim()} onClick={()=>{if(setNotes([{id:crypto.randomUUID(),at:new Date().toISOString(),text:draft.trim(),conversation},...list]))setDraft('');}}>Save note</button>
   {list.map(n=><div key={n.id} className="hb-note-item"><small>{new Date(n.at).toLocaleString()}</small><p>{n.text}</p><button type="button" className="hb-link muted" style={{alignSelf:'flex-start'}} onClick={()=>setNotes(list.filter(x=>x.id!==n.id))}><X size={13}/>Remove</button></div>)}
  </div>}
 </div>;
}

// ------------------------------------------------------------------ chats sheet (the phone's Chats chip)
export function ChatsSheet({conversations,active,busy,onPick,onClose}:{conversations:{id:string;title:string;created_at:string;mode?:string|null}[];active:string;busy:boolean;onPick:(id:string)=>void;onClose:()=>void}){
 return <Sheet title="Your chats" onClose={onClose}>
  <div className="hb-chat-list">
   <button type="button" className={active?'':'on'} disabled={busy} onClick={()=>{onPick('');onClose();}}><MessageSquare size={16}/><span>New chat</span></button>
   {conversations.map(c=><button type="button" key={c.id} className={active===c.id?'on':''} disabled={busy} onClick={()=>{onPick(c.id);onClose();}}><MessageSquare size={16}/><span><em className="chat-topic">{chatTopic(c.title,c.mode)}</em>{c.title}</span><small>{new Date(c.created_at).toLocaleDateString()}</small></button>)}
  </div>
  {!conversations.length&&<p className="hb-copy">Your saved chats for this bike will appear here.</p>}
 </Sheet>;
}
