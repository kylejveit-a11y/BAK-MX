// Service log on the web, ported from the phone app: the maker's own schedule for this exact bike (what's due by the hours on
// it), the rider's own reminders coming up, quick picks for what was done, and the history with delete. Nothing here is
// invented: an interval only shows when the maker's schedule or the rider's own entry gives one.
import {useCallback,useEffect,useRef,useState,type FormEvent} from 'react';
import {ChevronDown,ChevronRight,Droplets,Plus,RefreshCw,Wrench} from 'lucide-react';
import type {Bike,ServiceEvent} from '../shared/types';
import {serviceDueRows,comingUp,dueLine,type PlanItem} from '../shared/service-plan';
import {api} from './client';
import {createSubmission,finishCreate} from './createSubmission';
import './rider-extras.css';

const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const SERVICE_QUICK=['Engine oil','Oil filter','Air filter','Spark plug','Valve check','Top end','Fork service','Shock service','Chain & sprockets','Brake pads','Coolant','Clutch'];
const today=()=>new Date().toISOString().slice(0,10);
const dayText=(iso:string)=>{const d=new Date(iso.slice(0,10)+'T12:00:00');return Number.isNaN(d.getTime())?iso.slice(0,10):d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});};
type Draft={category:string;date:string;hours:string;notes:string;due:string;source:string};

/** Drop-in for the Maintenance page. signedIn defaults to true so the existing wiring keeps working. */
export function Maintenance({bike,onGarage,signedIn=true,onSignIn}:{bike?:Bike;onGarage:()=>void;signedIn?:boolean;onSignIn?:()=>void}){
 if(!signedIn)return <section className="panel rx-service"><div className="rx-prompt"><p className="rx-copy">Sign in to keep a service log for your bike.</p>{onSignIn&&<button className="button" onClick={onSignIn}>Sign in</button>}</div></section>;
 if(!bike)return <section className="panel rx-service"><div className="rx-prompt"><p className="rx-copy">Add a bike first, then log oil changes, filters and top ends against its hours.</p><button className="button" onClick={onGarage}><Plus size={16}/>Add a bike</button></div></section>;
 return <MaintenanceForBike key={bike.id} bike={bike}/>;
}

function MaintenanceForBike({bike}:{bike:Bike}){
 const [events,setEvents]=useState<ServiceEvent[]|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[adding,setAdding]=useState(false);
 const [draft,setDraft]=useState<Draft>({category:'Engine oil',date:today(),hours:bike.engine_hours!=null?String(bike.engine_hours):'',notes:'',due:'',source:''});
 const [dueOpen,setDueOpen]=useState(false);
 const live=useRef(true);useEffect(()=>{live.current=true;return()=>{live.current=false;};},[]);
 const refresh=useCallback(async()=>{try{const data=await api<ServiceEvent[]>('/services?bike_id='+bike.id);if(live.current){setEvents(data.filter(e=>e.bike_id===bike.id));setError('');}}catch(e){if(live.current){setError(errorText(e));setEvents(old=>old??[]);}}},[bike.id]);
 useEffect(()=>{void refresh();},[refresh]);
 const set=(k:keyof Draft)=>(v:string)=>setDraft(d=>({...d,[k]:v}));
 const num=(s:string)=>s.trim()===''?null:Number(s);
 async function save(e:FormEvent){
  e.preventDefault();if(busy)return;
  const category=draft.category.trim();
  if(!category||!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)){setError('Enter what you did and pick the date.');return;}
  for(const [label,v] of [['Hours',draft.hours],['Next due at hours',draft.due]] as const)if(v.trim()&&(!Number.isFinite(Number(v))||Number(v)<0)){setError(`${label}: enter a number.`);return;}
  setBusy(true);setError('');
  try{
   const body={bike_id:bike.id,category,performed_at:draft.date,engine_hours:num(draft.hours),notes:draft.notes,next_due_hours:num(draft.due),interval_source:draft.source};
   const kind='service-'+bike.id;
   await api('/services','POST',createSubmission(bike.user_id,kind,body));finishCreate(bike.user_id,kind);
   if(!live.current)return;
   setAdding(false);setDraft(d=>({...d,notes:'',due:'',source:''}));setDueOpen(false);
   await refresh();if(live.current)setNotice('Service saved.');
  }catch(err){if(live.current)setError(errorText(err));}finally{if(live.current)setBusy(false);}
 }
 async function remove(e:ServiceEvent){
  if(!confirm(`Delete this entry (${e.category}, ${dayText(e.performed_at)})? It is removed for good.`))return;
  try{await api('/services?id='+e.id,'DELETE');await refresh();}catch(err){setError(errorText(err));}
 }
 function logFromPlan(item:PlanItem){
  const h=bike.engine_hours;
  setDraft({category:item.category,date:today(),hours:h!=null?String(h):'',notes:'',due:h!=null?String(Math.round((h+item.every_hours)*10)/10):'',source:`Maker’s schedule · every ${item.every_hours} h`});
  setDueOpen(true);setAdding(true);window.scrollTo({top:0,behavior:'smooth'});
 }
 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),4000);return()=>clearTimeout(t);},[notice]);
 const hours=bike.engine_hours??null,list=events??[],coming=comingUp(list,hours);
 const quick=SERVICE_QUICK.includes(draft.category);
 return <div className="rx-stack rx-service">
  {notice&&<p className="notice" role="status">{notice}</p>}
  {error&&<p className="rx-error" role="alert">{error}</p>}
  {adding?<section className="panel"><form className="rx-service-form" onSubmit={save}>
   <div className="rx-head"><div><span className="eyebrow">LOG SERVICE</span><h2 className="rx-title md">What did you do?</h2></div><button type="button" className="text-button" onClick={()=>setAdding(false)}>Cancel</button></div>
   <div className="rx-chips" role="group" aria-label="What was done">{SERVICE_QUICK.map(q=><button key={q} type="button" className="rx-chip" aria-pressed={draft.category===q} disabled={busy} onClick={()=>set('category')(q)}>{q}</button>)}</div>
   <label className="field"><span>Or type it</span><input value={quick?'':draft.category} maxLength={80} placeholder="e.g. Clutch plates" disabled={busy} onChange={e=>set('category')(e.target.value)}/></label>
   <div className="rx-grid-2">
    <label className="field"><span>Hours on the bike</span><input inputMode="decimal" type="number" min="0" step="0.1" value={draft.hours} placeholder="Unknown" disabled={busy} onChange={e=>set('hours')(e.target.value)}/></label>
    <label className="field"><span>Date</span><input type="date" value={draft.date} max={today()} required disabled={busy} onChange={e=>set('date')(e.target.value)}/></label>
   </div>
   <label className="field"><span>Notes (optional)</span><textarea rows={3} maxLength={4000} value={draft.notes} placeholder="Oil and filter, cleaned the screen" disabled={busy} onChange={e=>set('notes')(e.target.value)}/></label>
   <details className="rx-disclosure" open={dueOpen} onToggle={e=>setDueOpen((e.target as HTMLDetailsElement).open)}><summary>Remind me when it’s due next <ChevronDown size={16}/></summary><div>
    <div className="rx-grid-2">
     <label className="field"><span>Next due at hours</span><input inputMode="decimal" type="number" min="0" step="0.1" value={draft.due} placeholder="e.g. 45" disabled={busy} onChange={e=>set('due')(e.target.value)}/></label>
     <label className="field"><span>Why that interval (optional)</span><input maxLength={1000} value={draft.source} placeholder="Your own rule, race schedule, dealer advice…" disabled={busy} onChange={e=>set('source')(e.target.value)}/></label>
    </div></div></details>
   <div className="button-row"><button type="submit" className="button" disabled={busy}>{busy?'Saving…':'Save service'}</button></div>
  </form></section>
  :<button className="rx-start" onClick={()=>setAdding(true)}><span className="rx-start-icon"><Droplets size={20}/></span><span><b>Log service</b><small>What you did and at how many hours</small></span><ChevronRight size={18}/></button>}

  {coming.length>0&&<section className="panel"><span className="eyebrow">COMING UP</span>
   <ul className="rx-coming">{coming.map(({e,left})=><li key={e.id} className={left!==null&&left<=0?'due':''}>{e.category}: {left===null?`at ${e.next_due_hours} hours`:left<=0?`due now (${e.next_due_hours} h)`:`in ${left} hours`}</li>)}</ul>
   {hours===null&&<p className="rx-note">Add the hours on the bike in Garage and BAK counts down to each one.</p>}
  </section>}

  {!adding&&events!==null&&<ServicePlanCard bike={bike} events={list} onLog={logFromPlan}/>}

  <section className="panel">
   <div className="rx-head"><div><span className="eyebrow">HISTORY</span><h2 className="rx-title md">{bike.model_year} {bike.manufacturer} {bike.model}</h2><p className="rx-copy">{hours!==null?`${hours} hours on the bike`:'Hours not set'}{list.length?` · ${list.length} ${list.length===1?'entry':'entries'}`:''}</p></div>
    <button className="icon-button" aria-label="Refresh service history" disabled={busy} onClick={()=>void refresh()}><RefreshCw size={18}/></button></div>
   {events===null&&<div className="rx-center" role="status" aria-label="Loading"><span className="rx-spin"/></div>}
   {events!==null&&!list.length&&<p className="rx-copy">Nothing logged yet. Log your first oil change or filter and BAK can tell you what’s due.</p>}
   <div className="rx-rows">{list.map(e=><ServiceRow key={e.id} e={e} hoursNow={hours} onDelete={()=>void remove(e)}/>)}</div>
  </section>
 </div>;
}

/** The maker's own service schedule for this exact bike, as reminders: what's due next by the hours on the bike. */
function ServicePlanCard({bike,events,onLog}:{bike:Bike;events:ServiceEvent[];onLog:(item:PlanItem)=>void}){
 const [plan,setPlan]=useState<PlanItem[]|null>(null),[open,setOpen]=useState(false);
 useEffect(()=>{let live=true;setPlan(null);api<{items:PlanItem[]}>('/service-plan?bike_id='+bike.id).then(r=>{if(live)setPlan(r.items);}).catch(()=>{if(live)setPlan([]);});return()=>{live=false;};},[bike.id]);
 if(!plan||!plan.length)return null;
 const h=bike.engine_hours??null,rows=serviceDueRows(plan,events,h),shown=open?rows:rows.slice(0,4);
 return <section className="panel">
  <div className="rx-eyebrow-row" style={{marginBottom:8}}><span className="rx-mark" aria-hidden="true"/><span className="eyebrow">{bike.manufacturer.toUpperCase()}’S SCHEDULE FOR THIS BIKE</span></div>
  <p className="rx-copy">From the owner’s manual service table. {h==null?'Add the hours on the bike in Garage to see what’s due.':'Log a job and the next one is set from the maker’s interval.'}</p>
  <div style={{marginTop:10}}>{shown.map(row=><div key={row.item.category} className="rx-plan-row">
   <div><b>{row.item.category}</b><span className={row.left!=null&&row.left<=0?'due':''}>{dueLine(row)}</span></div>
   <button className="rx-mini" aria-label={`Log ${row.item.category}`} onClick={()=>onLog(row.item)}>Log it</button>
  </div>)}</div>
  {rows.length>4&&<button className="rx-link muted" onClick={()=>setOpen(!open)}>{open?'Show fewer':`Show all ${rows.length}`}</button>}
 </section>;
}

function ServiceRow({e,hoursNow,onDelete}:{e:ServiceEvent;hoursNow:number|null;onDelete:()=>void}){
 const [open,setOpen]=useState(false);
 return <div className="rx-row">
  <button className="rx-row-head" aria-expanded={open} onClick={()=>setOpen(!open)}>
   <Wrench size={16}/>
   <div><b>{e.category}</b><span>{dayText(e.performed_at)} · {e.engine_hours??'?'} h{e.next_due_hours!==null?` · next at ${e.next_due_hours} h`:''}</span></div>
   {open?<ChevronDown size={17}/>:<ChevronRight size={17}/>}
  </button>
  {open&&<div className="rx-row-body">
   <p>{e.notes||'No notes.'}</p>
   {e.next_due_hours!==null&&<p>Next at {e.next_due_hours} h{hoursNow!==null?` · ${Math.max(0,Math.round((e.next_due_hours-hoursNow)*10)/10)} h to go`:''}{e.interval_source?` · ${e.interval_source}`:''}</p>}
   <button className="rx-link muted" onClick={onDelete}>Delete entry</button>
  </div>}
 </div>;
}
