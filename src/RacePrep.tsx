// Race prep on the web: the rider's own checklist by phase (week before → after the race), starting from BAK's researched list
// for their kind of riding. Edit list adds their own items, removes what they don't use and reorders. The list is saved to the
// account through the API (the same list the phone app shows); the ticks are kept in this browser until they clear them.
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Check,ChevronDown,ChevronRight,ChevronUp,Minus,Plus} from 'lucide-react';
import {RACE_PHASES,hydratePrepList,toSaved,defaultPrepList,fitsEngine,engineOf,disciplineOf,type PrepItem,type RacePhase} from '../shared/race-prep';
import {PRACTICE_PHASES,defaultPracticeList,hydratePracticeList} from '../shared/practice-day';
import type {Bike} from '../shared/types';
import {api} from './client';
import './rider-extras.css';

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
type SavedItem={id:string;label:string;phase:RacePhase;custom?:boolean};
const key=(account:string,what:string)=>`bakmx:race-prep:${account}:${what}`;
function readLocal<T>(account:string,what:string,fallback:T):T{try{const raw=localStorage.getItem(key(account,what));return raw?JSON.parse(raw) as T:fallback;}catch{return fallback;}}
function writeLocal(account:string,what:string,value:unknown){try{localStorage.setItem(key(account,what),JSON.stringify(value));}catch{/* the list still lives on the account; ticks are a convenience */}}

/** Every open copy of the list hears about a change, so the Home block follows the sheet at once. */
const listeners=new Set<()=>void>();
const changed=()=>{for(const l of listeners)l();};

export type PrepKind='race'|'practice';
/** The phases a list shows: race prep runs the week before to after the race; a practice day is the day itself. */
export const phasesFor=(kind:PrepKind)=>kind==='practice'?PRACTICE_PHASES:RACE_PHASES;
/** The rider's list and ticks, shared by the full sheet, the race-day card and the Home block. `practice` is the short
 *  practice-day list: edited the same way, kept on this browser (the race list is saved to the account). */
export function useRacePrep(bike?:Bike,kind:PrepKind='race'){
 const account=bike?.user_id??'anon',discipline=disciplineOf(bike),engine=engineOf(bike),practice=kind==='practice';
 const L=practice?'practice-list':'list',C=practice?'practice-checks':'checks';
 const hydrate=(saved:SavedItem[]|null)=>practice?hydratePracticeList(saved,discipline):hydratePrepList(saved,discipline);
 const [all,setList]=useState<PrepItem[]>(()=>hydrate(readLocal<SavedItem[]|null>(account,L,null)));
 const [checks,setChecks]=useState<Record<string,boolean>>(()=>readLocal<Record<string,boolean>>(account,C,{}));
 const [error,setError]=useState(''),[saving,setSaving]=useState(false);
 useEffect(()=>{let live=true;setList(hydrate(readLocal<SavedItem[]|null>(account,L,null)));setChecks(readLocal(account,C,{}));
  if(bike&&!practice)api<{items:SavedItem[]|null}>('/race-checklist').then(r=>{if(!live)return;setList(hydratePrepList(r.items,discipline));writeLocal(account,'list',r.items);}).catch(()=>{});
  return()=>{live=false;};},[account,discipline,!!bike,practice]);
 useEffect(()=>{const l=()=>{setChecks(readLocal(account,C,{}));setList(hydrate(readLocal<SavedItem[]|null>(account,L,null)));};listeners.add(l);return()=>{listeners.delete(l);};},[account,discipline,practice]);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 // What this bike shows; items for the other engine type stay in the saved list for the rider's other bikes.
 const list=useMemo(()=>all.filter(i=>fitsEngine(i,engine)),[all,engine]),hidden=useMemo(()=>all.filter(i=>!fitsEngine(i,engine)),[all,engine]);
 const saveList=useCallback((edited:PrepItem[]|null)=>{
  const next=edited?[...edited,...hidden]:null;setList(next??(practice?defaultPracticeList(discipline):defaultPrepList(discipline)));
  const saved=next?toSaved(next):null;writeLocal(account,L,saved);changed();
  if(practice)return;
  if(timer.current)clearTimeout(timer.current);
  timer.current=setTimeout(()=>{setSaving(true);api('/race-checklist','PUT',{items:saved}).then(()=>setError('')).catch(e=>setError(errorText(e))).finally(()=>setSaving(false));},600);
 },[account,discipline,hidden,practice]);
 const toggle=useCallback((id:string)=>{setChecks(c=>{const next={...c,[id]:!c[id]};writeLocal(account,C,next);return next;});setTimeout(changed,0);},[account,C]);
 const clear=useCallback((phase?:RacePhase)=>{setChecks(c=>{const next=phase?Object.fromEntries(Object.entries(c).filter(([id])=>list.find(i=>i.id===id)?.phase!==phase)):{};writeLocal(account,C,next);return next;});setTimeout(changed,0);},[account,list,C]);
 return {list,checks,toggle,clear,saveList,error,saving};
}

export function Progress({done,total}:{done:number;total:number}){
 const pct=total?Math.round(100*done/total):0;
 return <div className="rx-meter" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={`${done} of ${total} done`}><i style={{width:`${pct}%`}}/></div>;
}

function CheckRow({item,on,onToggle}:{item:PrepItem;on:boolean;onToggle:()=>void}){
 return <button type="button" className="rx-check" role="checkbox" aria-checked={on} onClick={onToggle}>
  <span className="rx-check-box" aria-hidden="true">{on&&<Check size={15} strokeWidth={3}/>}</span>
  <div><b>{item.label}{item.custom&&<span className="rx-yours">YOURS</span>}</b>{!!item.why&&!on&&<small>{item.why}</small>}</div>
 </button>;
}

/** Full race prep: phase tabs, progress, the list, and Edit list to make it the rider's own. Shown as a sheet over the page. */
export function RacePrepSheet({open,onClose,bike,startPhase='week',kind='race'}:{open:boolean;onClose:()=>void;bike?:Bike;startPhase?:RacePhase;kind?:PrepKind}){
 const {list,checks,toggle,clear,saveList,error,saving}=useRacePrep(bike,kind);
 const PHASES=phasesFor(kind),practice=kind==='practice',title=practice?'Practice checklist':'Race prep';
 const [phase,setPhase]=useState<RacePhase>(startPhase),[editing,setEditing]=useState(false),[draft,setDraft]=useState('');
 const box=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(open){setPhase(startPhase);setEditing(false);box.current?.focus();}},[open,startPhase]);
 useEffect(()=>{if(!open)return;const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};window.addEventListener('keydown',onKey);const prev=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{window.removeEventListener('keydown',onKey);document.body.style.overflow=prev;};},[open,onClose]);
 const items=list.filter(i=>i.phase===phase),done=items.filter(i=>checks[i.id]).length;
 const counts=useMemo(()=>Object.fromEntries(PHASES.map(p=>{const its=list.filter(i=>i.phase===p.id);return [p.id,[its.filter(i=>checks[i.id]).length,its.length] as [number,number]];})),[list,checks,PHASES]);
 if(!open)return null;
 const move=(id:string,d:-1|1)=>{const idx=items.findIndex(i=>i.id===id),j=idx+d;if(j<0||j>=items.length)return;const a=items[idx],b=items[j],next=[...list],ia=next.indexOf(a),ib=next.indexOf(b);[next[ia],next[ib]]=[next[ib],next[ia]];saveList(next);};
 const remove=(id:string)=>saveList(list.filter(i=>i.id!==id));
 const add=()=>{const label=draft.trim().slice(0,80);if(!label)return;saveList([...list,{id:'own-'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),label,phase,custom:true}]);setDraft('');};
 const current=PHASES.find(p=>p.id===phase)??PHASES[0];
 return <div className="sheet-backdrop rx-prep-sheet" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
  <div className="sheet" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={box}>
   <div className="sheet-head">
    <div><h2 className="rx-title lg">{title}</h2><div className="rx-marks" aria-hidden="true"><span className="rx-mark" style={{width:26}}/><span className="rx-mark dim"/></div></div>
    <div><button type="button" className={editing?'on':'muted'} onClick={()=>setEditing(!editing)}>{editing?'Done editing':'Edit list'}</button><button type="button" onClick={onClose}>Close</button></div>
   </div>
   <div className="sheet-body">
    <div className="rx-chips scroll" role="tablist" aria-label="Phase">{PHASES.map(p=>{const on=p.id===phase,[d,t]=counts[p.id];return <button key={p.id} type="button" role="tab" className="rx-chip" aria-selected={on} onClick={()=>setPhase(p.id)}>{p.short}{t>0&&<small>{d}/{t}</small>}</button>;})}</div>
    <div className="rx-panel-gap" style={{gap:8}}>
     <div className="rx-between"><span className="eyebrow" style={{margin:0}}>{current.label.toUpperCase()}</span><span className="rx-count">{done} of {items.length}</span></div>
     <Progress done={done} total={items.length}/>
    </div>
    {!editing&&<div>{items.map(i=><CheckRow key={i.id} item={i} on={!!checks[i.id]} onToggle={()=>toggle(i.id)}/>)}</div>}
    {editing&&<div>{items.map((i,n)=><div key={i.id} className="rx-edit-row">
     <button type="button" className="rx-remove" aria-label={`Remove ${i.label}`} onClick={()=>remove(i.id)}><Minus size={16} strokeWidth={3}/></button>
     <span>{i.label}{i.custom&&<span className="rx-yours">YOURS</span>}</span>
     <button type="button" className="rx-move" aria-label="Move up" disabled={n===0} onClick={()=>move(i.id,-1)}><ChevronUp size={17}/></button>
     <button type="button" className="rx-move" aria-label="Move down" disabled={n===items.length-1} onClick={()=>move(i.id,1)}><ChevronDown size={17}/></button>
    </div>)}</div>}
    {/* add your own: always there, so a rider can jot an item without entering edit mode */}
    <div className="rx-add-own"><Plus size={16}/><input value={draft} maxLength={80} placeholder="Add your own item" aria-label="Add your own item" onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();add();}}}/>{!!draft.trim()&&<button type="button" onClick={add}>Add</button>}</div>
    {error&&<p className="rx-error" role="alert">{error}</p>}
    <p className="rx-note">{practice?'Your practice list and ticks are saved on this browser.':saving?'Saving your list to your account…':'Your list is saved to your account and shows on the phone app too. Ticks stay on this browser.'}</p>
    <div className="rx-between" style={{paddingTop:6}}>
     {done>0?<button type="button" className="rx-link muted" onClick={()=>clear(phase)}>Uncheck this list</button>:<span/>}
     {editing&&<button type="button" className="rx-link muted" onClick={()=>saveList(null)}>Restore BAK’s list</button>}
    </div>
   </div>
  </div>
 </div>;
}

/** Race-day card: the between-motos part of the rider's own list, with the full prep list one tap away. */
export function RacePrepCard({bike,phase='motos',onOpen,kind='race'}:{bike:Bike;phase?:RacePhase;onOpen:()=>void;kind?:PrepKind}){
 const {list,checks,toggle,clear}=useRacePrep(bike,kind);
 const PHASES=phasesFor(kind),practice=kind==='practice',H=practice?'practice-hidden':'hidden';
 const [hidden,setHidden]=useState(()=>readLocal(bike.user_id,H,false));
 const hide=(v:boolean)=>{setHidden(v);writeLocal(bike.user_id,H,v);};
 if(hidden)return <button type="button" className="rx-link muted" onClick={()=>hide(false)}>Show prep list</button>;
 const items=list.filter(i=>i.phase===phase),done=items.filter(i=>checks[i.id]).length;
 return <section className="panel rx-panel-gap">
  <div className="rx-between"><span className="eyebrow" style={{margin:0}}>{(PHASES.find(p=>p.id===phase)?.label??'Checklist').toUpperCase()} · {done}/{items.length}</span><button type="button" className="rx-link" onClick={onOpen}>{practice?'Edit checklist':'Full prep list'} <ChevronRight size={15}/></button></div>
  <Progress done={done} total={items.length}/>
  <div>{items.map(i=><CheckRow key={i.id} item={i} on={!!checks[i.id]} onToggle={()=>toggle(i.id)}/>)}</div>
  {!items.length&&<p className="rx-copy">Nothing on this list yet. Open the full prep list to add your own.</p>}
  <div className="rx-between">
   {done>0?<button type="button" className="rx-link muted" onClick={()=>clear(phase)}>{practice?'Clear for the next session':'Clear for the next moto'}</button>:<span/>}
   <button type="button" className="rx-link muted" onClick={()=>hide(true)}>Hide</button>
  </div>
 </section>;
}

/** Home block: race prep at a glance (each phase's progress), opening the full list. Works signed out and without a bike. */
export function RacePrepBlock({bike,signedIn=true,onSignIn,onOpen}:{bike?:Bike;signedIn?:boolean;onSignIn?:()=>void;onOpen:()=>void}){
 const {list,checks}=useRacePrep(bike);
 const rows=RACE_PHASES.map(p=>{const its=list.filter(i=>i.phase===p.id);return {p,done:its.filter(i=>checks[i.id]).length,total:its.length};}).filter(r=>r.total>0);
 const started=rows.some(r=>r.done>0);
 return <section className="panel rx-panel-gap">
  <div className="rx-between"><div className="rx-eyebrow-row"><span className="rx-mark" aria-hidden="true"/><span className="eyebrow">RACE PREP</span></div>
   {signedIn&&bike&&<button type="button" className="rx-link" onClick={onOpen}>{started?'Open':'Start'} <ChevronRight size={15}/></button>}</div>
  {!signedIn&&<div className="rx-prompt"><p className="rx-copy">Sign in and your prep list follows you between the phone and the web.</p>{onSignIn&&<button className="button secondary" onClick={onSignIn}>Sign in</button>}</div>}
  {signedIn&&!bike&&<p className="rx-copy">Add a bike and BAK starts your checklist for its kind of riding.</p>}
  {signedIn&&bike&&!started&&<p className="rx-copy">Your checklist from the week before to after the race. Make it yours: add, remove and reorder.</p>}
  {signedIn&&bike&&started&&<div className="rx-phase-rows">{rows.map(r=><button key={r.p.id} type="button" className="rx-phase-row" onClick={onOpen}>
   <div className="rx-between"><b>{r.p.short}</b><span className="rx-count">{r.done}/{r.total}</span></div><Progress done={r.done} total={r.total}/></button>)}</div>}
 </section>;
}
