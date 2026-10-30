// Specs on the web, laid out for a rider at the bike: the numbers people look for most sit on top, a kind filter
// (torques, settings, service, specs) and a search narrow the rest, and every fact is one compact row, name left and
// value right, grouped by the part of the bike. Tap a row for the conditions and the source. Only verified facts for
// this exact bike are shown; a value that is not here is unknown, not zero.
import {useEffect,useMemo,useState,type FormEvent} from 'react';
import {ArrowUpRight,BookOpen,ChevronDown,Search,X} from 'lucide-react';
import type {Bike,Claim} from '../shared/types';
import {factSystem,factKind,type FactKind,type FactSystem} from '../shared/fact-system';
import {api} from './client';
import './specs.css';

type Row={c:Claim;system:FactSystem;kind:FactKind;name:string;value:string;note:string;section:string};

/** "Section / Sub / Item: value. Conditions." → item name, value and the rest. */
export function splitFact(statement:string):{section:string;name:string;value:string;note:string}{
 const i=statement.indexOf(':');
 if(i<1)return {section:'',name:statement.split('. ')[0],value:'',note:statement.split('. ').slice(1).join('. ')};
 const head=statement.slice(0,i).trim(),rest=statement.slice(i+1).trim();
 const parts=head.split(' / ').map(s=>s.trim()).filter(Boolean);
 // Broad manual headings ("Chassis", "Capacities", "Engine tightening torques") are dropped; ones that name the part ("Fork", "Shock absorber") stay.
 const generic=/^(chassis|engine|capacities|specifications?|general|electrical|chassis tightening torques|engine tightening torques|tightening torques|service schedule|dimensions|technical data)$/i;
 const name=parts.length>1?(generic.test(parts[0])?parts.slice(1):parts).join(' · '):parts[0]??head;
 const cut=rest.search(/\.\s+(?=[A-Z])/);
 const value=(cut>=0?rest.slice(0,cut):rest).replace(/\.$/,'').trim();
 const note=cut>=0?rest.slice(cut+1).trim():'';
 return {section:parts.length>1?parts[0]:'',name,value,note};
}

const KINDS:{k:FactKind|'all';label:string}[]=[{k:'all',label:'All'},{k:'torque',label:'Torques'},{k:'setting',label:'Settings'},{k:'service',label:'Service'},{k:'spec',label:'Specs'}];
const ORDER:FactSystem[]=['Suspension','Oils & fluids','Engine','Wheels & tires','Brakes','Chain & sprockets','Clutch','Transmission','Cooling','Fuel & air','Exhaust','Electrical & ignition','Controls','Chassis','Dimensions & weight','General'];

/** The values riders look up most, found by the words the manuals use. The first match wins; nothing is invented. */
const QUICK:{label:string;rx:RegExp;kind?:FactKind}[]=[
 {label:'Engine oil',rx:/engine oil.*(quantity|capacity|amount)|capacities.*engine oil|oil change quantity|engine oil \(.*\)|^engine oil \/ quantity/i},
 {label:'Oil type',rx:/(recommended|specified) (engine )?oil|engine oil.*(grade|type|viscosity)/i},
 {label:'Valve clearance · intake',rx:/valve clearance.*(intake|in\b)/i},
 {label:'Valve clearance · exhaust',rx:/valve clearance.*(exhaust|ex\b)/i},
 {label:'Riding sag',rx:/riding sag|race sag|rider sag/i},
 {label:'Static sag',rx:/static sag|free sag/i},
 {label:'Fork compression · stock',rx:/fork.*compression.*(standard|stock)|front fork.*compression damping.*standard/i},
 {label:'Fork rebound · stock',rx:/fork.*rebound.*(standard|stock)|front fork.*rebound damping.*standard/i},
 {label:'Shock rebound · stock',rx:/shock.*rebound.*(standard|stock)/i},
 {label:'Tire pressure',rx:/tire (air )?pressure|tyre pressure|offroad tire pressure/i},
 {label:'Spark plug',rx:/spark plug(?!.*(torque|gap))|specified spark plug/i},
 {label:'Coolant',rx:/coolant.*(quantity|capacity|amount)|capacities.*coolant/i},
];

export function SpecsPage({bike,onGarage}:{bike?:Bike;onGarage:()=>void}){
 const [claims,setClaims]=useState<Claim[]|null>(null),[error,setError]=useState(''),[kind,setKind]=useState<FactKind|'all'>('all'),[open,setOpen]=useState<string>(''),[query,setQuery]=useState(''),[found,setFound]=useState<Claim[]|null>(null),[searching,setSearching]=useState(false),[openRow,setOpenRow]=useState('');
 useEffect(()=>{let live=true;setClaims(null);setError('');setFound(null);setQuery('');setOpen('');
  if(bike)api<Claim[]>('/claims?bike_id='+bike.id).then(d=>{if(live)setClaims(d.filter(c=>c.manufacturer===bike.manufacturer&&c.model===bike.model&&c.model_year===bike.model_year&&c.variant===bike.variant&&c.region===bike.region&&c.status==='VERIFIED'&&!c.has_conflict))}).catch(e=>{if(live){setError((e as Error).message);setClaims([]);}});
  else setClaims([]);
  return()=>{live=false};},[bike?.id]);
 const rows=useMemo<Row[]>(()=>(claims??[]).map(c=>{const f=splitFact(c.statement);return {c,system:factSystem(c),kind:factKind(c),...f};}),[claims]);
 const quick=useMemo(()=>{const used=new Set<string>();return QUICK.map(q=>{const r=rows.find(r=>!used.has(r.c.id)&&r.value&&q.rx.test(r.section+' / '+r.name)&&r.kind!=='service'&&r.kind!=='torque');if(r)used.add(r.c.id);return r?{label:q.label,row:r}:null;}).filter((x):x is {label:string;row:Row}=>!!x).slice(0,6);},[rows]);
 const shown=kind==='all'?rows:rows.filter(r=>r.kind===kind);
 const systems=ORDER.map(s=>({s,items:shown.filter(r=>r.system===s).sort((a,b)=>a.name.localeCompare(b.name))})).filter(g=>g.items.length);
 async function search(e:FormEvent){e.preventDefault();if(!bike)return;const q=query.trim();if(!q){setFound(null);return;}setSearching(true);setError('');try{setFound(await api<Claim[]>('/claims/search?bike_id='+bike.id+'&q='+encodeURIComponent(q)));}catch(err){setError((err as Error).message);}finally{setSearching(false);}}
 const count=(k:FactKind|'all')=>k==='all'?rows.length:rows.filter(r=>r.kind===k).length;
 const row=(r:Row)=>{const id=r.c.id,on=openRow===id;return <li key={id} id={'sp-'+id} className={'sp-row'+(on?' on':'')}>
  <button type="button" className="sp-row-main" aria-expanded={on} onClick={()=>setOpenRow(on?'':id)}><span className="sp-name">{r.name}</span><span className="sp-value">{r.value||'—'}</span></button>
  {on&&<div className="sp-detail">{r.section&&<p className="sp-section">{r.section}</p>}{r.note&&<p>{r.note}</p>}<p className="sp-src">{r.c.source_locator}{/^https?:\/\//.test(r.c.source_url)&&<> · <a href={r.c.source_url} target="_blank" rel="noreferrer">Maker document <ArrowUpRight size={12}/></a></>}</p></div>}
 </li>;};

 if(!bike)return <section className="panel sp"><div className="empty"><div className="empty-icon"><BookOpen size={27}/></div><h3>Specs start with your bike.</h3><p>Add the make, model and year in Garage and BAK shows the published numbers for that exact bike.</p><button className="button" onClick={onGarage}>Open Garage</button></div></section>;
 return <section className="panel sp">
  <div className="sp-head"><span className="eyebrow">VERIFIED FOR</span><h2>{bike.model_year} {bike.manufacturer} {bike.model}</h2><p className="subtle">{claims===null?'Loading…':`${rows.length} published values from the maker’s own documents. Not listed means unknown, not zero.`}</p></div>
  {error&&<div className="error" role="alert">{error}</div>}
  <form className="sp-search" onSubmit={search} role="search"><Search size={17} aria-hidden="true"/><input aria-label="Search this bike’s specs" value={query} onChange={e=>{setQuery(e.target.value);if(!e.target.value.trim())setFound(null);}} placeholder="Rear axle nut, valve clearance, fork oil…" enterKeyHint="search"/>{query&&<button type="button" className="sp-clear" aria-label="Clear search" onClick={()=>{setQuery('');setFound(null);}}><X size={15}/></button>}<button type="submit" className="sp-go" disabled={searching||!query.trim()}>{searching?'…':'Search'}</button></form>
  {claims!==null&&!rows.length&&!error?<p className="notice">No published specs on file for this exact bike yet. Ask BAK: it says plainly when a number isn’t confirmed.</p>:
  found?<div className="sp-results"><p className="subtle">{found.length?`${found.length} match${found.length===1?'':'es'}`:'Nothing published matches that for this bike. Try the words a service manual would use.'}</p><ul className="sp-list">{found.map(c=>row({c,system:factSystem(c),kind:factKind(c),...splitFact(c.statement)}))}</ul></div>:<>
   {quick.length>0&&kind==='all'&&<div className="sp-quick" aria-label="Most looked-up values">{quick.map(q=><button type="button" key={q.label} className="sp-tile" onClick={()=>{setOpen(q.row.system);setOpenRow(q.row.c.id);requestAnimationFrame(()=>document.getElementById('sp-'+q.row.c.id)?.scrollIntoView({block:'center',behavior:'smooth'}));}}><small>{q.label}</small><b>{q.row.value.split(';')[0]}</b></button>)}</div>}
   <div className="sp-kinds" role="tablist" aria-label="Kind of value">{KINDS.map(k=><button key={k.k} type="button" role="tab" aria-selected={kind===k.k} className={kind===k.k?'on':''} onClick={()=>setKind(k.k)} disabled={k.k!=='all'&&!count(k.k)}>{k.label}<span>{count(k.k)}</span></button>)}</div>
   <div className="sp-groups">{systems.map(g=>{const isOpen=open===g.s||systems.length===1;return <div key={g.s} className={'sp-group'+(isOpen?' open':'')}>
    <button type="button" className="sp-group-head" aria-expanded={isOpen} onClick={()=>setOpen(isOpen?'':g.s)}><span>{g.s}</span><small>{g.items.length}</small><ChevronDown size={17}/></button>
    {isOpen&&<ul className="sp-list">{g.items.map(row)}</ul>}
   </div>;})}</div>
  </>}
 </section>;
}
