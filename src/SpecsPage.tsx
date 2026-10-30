// Specs on the web, laid out for a rider at the bike: the numbers people look for most sit on top, a kind filter
// (torques, settings, service, specs) and a search narrow the rest, and every fact is one compact row, name left and
// value right, grouped by the part of the bike. Tap a row for the conditions and the source. Only verified facts for
// this exact bike are shown; a value that is not here is unknown, not zero.
import {useEffect,useMemo,useState,type FormEvent} from 'react';
import {ArrowUpRight,BookOpen,ChevronDown,Search,X} from 'lucide-react';
import type {Bike,Claim} from '../shared/types';
import {factSystem,factKind,type FactKind,type FactSystem} from '../shared/fact-system';
import {api} from './client';
import {plainName,plainInterval,sameJob} from '../shared/plain-facts';
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

/** The values riders look up most, found by the words the manuals use. The first match wins; nothing is invented.
 *  Workshop-only numbers (valve clearances, torques) stay in the list and the search, not up here. */
const QUICK:{label:string;rx:RegExp}[]=[
 {label:'Riding sag',rx:/riding sag|race sag|rider sag/i},
 {label:'Tire pressure',rx:/tire (air )?pressure|tyre pressure|offroad tire pressure/i},
 {label:'Spark plug',rx:/spark plug(?!.*(torque|gap|tightening))|specified spark plug/i},
 {label:'Coolant',rx:/coolant.*(quantity|capacity|amount)|capacities.*coolant|^coolant$/i},
];
const OIL_AMOUNT=/engine oil.*(quantity|capacity|amount)|capacities.*engine oil|oil change quantity|^engine oil \/ quantity|engine oil quantity/i;
const OIL_GRADE=/\b\d{1,2}W[-/ ]?\d{2}\b|SAE\s*\d|JASO|API\s*S[A-Z]/i;
/** Your settings next to stock: Garage key, label, and the words of the stock value in the manual. */
const YOURS:{key:string;label:string;rx:RegExp}[]=[
 {key:'fork_compression',label:'Fork compression',rx:/fork.*compression.*(standard|stock)/i},
 {key:'fork_rebound',label:'Fork rebound',rx:/fork.*rebound.*(standard|stock)/i},
 {key:'shock_compression',label:'Shock compression',rx:/shock.*(low-speed )?compression.*(standard|stock)/i},
 {key:'shock_rebound',label:'Shock rebound',rx:/shock.*rebound.*(standard|stock)/i},
 {key:'rider_sag_mm',label:'Race sag',rx:/riding sag|race sag|rider sag/i},
 {key:'tire_pressures',label:'Tire pressure',rx:/tire (air )?pressure|tyre pressure/i},
];

/** One list row in rider words: plain part name, and for service jobs the one interval a rider follows. */
function toRow(c:Claim):Row{const f=splitFact(c.statement),kind=factKind(c);
 return {c,system:factSystem(c),kind,...f,name:plainName(f.name),value:kind==='service'?plainInterval(f.value):f.value};}
const everyH=(v:string)=>{const m=v.match(/Every (\d+(?:\.\d+)?) h/);return m?Number(m[1]):Infinity;};

export function SpecsPage({bike,onGarage}:{bike?:Bike;onGarage:()=>void}){
 const [claims,setClaims]=useState<Claim[]|null>(null),[error,setError]=useState(''),[kind,setKind]=useState<FactKind|'all'>('all'),[open,setOpen]=useState<string>(''),[query,setQuery]=useState(''),[found,setFound]=useState<Claim[]|null>(null),[searching,setSearching]=useState(false),[openRow,setOpenRow]=useState('');
 useEffect(()=>{let live=true;setClaims(null);setError('');setFound(null);setQuery('');setOpen('');
  if(bike)api<Claim[]>('/claims?bike_id='+bike.id).then(d=>{if(live)setClaims(d.filter(c=>c.manufacturer===bike.manufacturer&&c.model===bike.model&&c.model_year===bike.model_year&&c.variant===bike.variant&&c.region===bike.region&&c.status==='VERIFIED'&&!c.has_conflict))}).catch(e=>{if(live){setError((e as Error).message);setClaims([]);}});
  else setClaims([]);
  return()=>{live=false};},[bike?.id]);
 const rows=useMemo<Row[]>(()=>{const out:Row[]=[];for(const c of claims??[]){const r=toRow(c);if(out.some(o=>o.kind===r.kind&&o.system===r.system&&sameJob(o.name,r.name)&&o.value===r.value))continue;out.push(r);}return out;},[claims]);
 const fits=(r:Row)=>r.value&&r.kind!=='service'&&r.kind!=='torque';
 const quick=useMemo(()=>QUICK.map(q=>{const r=rows.find(r=>fits(r)&&q.rx.test(r.section+' / '+r.name));return r?{label:q.label,row:r}:null;}).filter((x):x is {label:string;row:Row}=>!!x),[rows]);
 const oil=useMemo(()=>{const amount=rows.find(r=>fits(r)&&OIL_AMOUNT.test(r.section+' / '+r.name));
  const inAmount=amount?.value.split(';').slice(1).join(';').trim();
  const full=rows.find(r=>fits(r)&&/engine oil (requirement|specification|recommend)|recommended engine oil|specified engine oil/i.test(r.name)&&OIL_GRADE.test(r.value))?.value.replace(/;\s*/g,' · ');
  const grade=full??(inAmount&&OIL_GRADE.test(inAmount)?inAmount:rows.find(r=>fits(r)&&r.system==='Oils & fluids'&&/engine oil|oil/i.test(r.section+' '+r.name)&&OIL_GRADE.test(r.value))?.value);
  return amount||grade?{amount:amount?.value.split(';')[0].trim(),grade:grade?.replace(/^engine oil\s*/i,'').replace(/^\((.*)\)$/,'$1').trim(),row:amount??null}:null;},[rows]);
 const cfg=bike?.configuration??{};const val=(k:string)=>{const v=cfg[k];return v==null||String(v).trim()===''?'':String(v);};
 const yours=YOURS.map(y=>({...y,mine:y.key==='rider_sag_mm'&&/^\d+(\.\d+)?$/.test(val(y.key))?val(y.key)+' mm':val(y.key),stock:rows.find(r=>fits(r)&&y.rx.test(r.section+' / '+r.name))?.value.split(';')[0]}));
 const hasYours=yours.some(y=>y.mine);
 const jump=(r:Row)=>{setKind('all');setOpen(r.system);setOpenRow(r.c.id);requestAnimationFrame(()=>document.getElementById('sp-'+r.c.id)?.scrollIntoView({block:'center',behavior:'smooth'}));};
 const shown=kind==='all'?rows:rows.filter(r=>r.kind===kind);
 const systems=ORDER.map(s=>({s,items:shown.filter(r=>r.system===s).sort((a,b)=>a.kind==='service'&&b.kind==='service'?everyH(a.value)-everyH(b.value)||a.name.localeCompare(b.name):a.name.localeCompare(b.name))})).filter(g=>g.items.length);
 async function search(e:FormEvent){e.preventDefault();if(!bike)return;const q=query.trim();if(!q){setFound(null);return;}setSearching(true);setError('');try{setFound(await api<Claim[]>('/claims/search?bike_id='+bike.id+'&q='+encodeURIComponent(q)));}catch(err){setError((err as Error).message);}finally{setSearching(false);}}
 const count=(k:FactKind|'all')=>k==='all'?rows.length:rows.filter(r=>r.kind===k).length;
 const row=(r:Row)=>{const id=r.c.id,on=openRow===id,stack=r.value.length>34;return <li key={id} id={'sp-'+id} className={'sp-row'+(on?' on':'')+(stack?' stack':'')}>
  <button type="button" className="sp-row-main" aria-expanded={on} onClick={()=>setOpenRow(on?'':id)}><span className="sp-name">{r.name}</span><span className="sp-value">{r.value||'—'}</span></button>
  {on&&<div className="sp-detail">{r.section&&<p className="sp-section">{r.section}</p>}{r.note&&<p>{r.note}</p>}<p className="sp-src">{r.c.source_locator}{/^https?:\/\//.test(r.c.source_url)&&<> · <a href={r.c.source_url} target="_blank" rel="noreferrer">Maker document <ArrowUpRight size={12}/></a></>}</p></div>}
 </li>;};

 if(!bike)return <section className="panel sp"><div className="empty"><div className="empty-icon"><BookOpen size={27}/></div><h3>Specs start with your bike.</h3><p>Add the make, model and year in Garage and BAK shows the published numbers for that exact bike.</p><button className="button" onClick={onGarage}>Open Garage</button></div></section>;
 return <section className="panel sp">
  <div className="sp-head"><span className="eyebrow">VERIFIED FOR</span><h2>{bike.model_year} {bike.manufacturer} {bike.model}</h2><p className="subtle">{claims===null?'Loading…':`${rows.length} published values from the maker’s own documents. Not listed means unknown, not zero.`}</p></div>
  {error&&<div className="error" role="alert">{error}</div>}
  <form className="sp-search" onSubmit={search} role="search"><Search size={17} aria-hidden="true"/><input aria-label="Search this bike’s specs" value={query} onChange={e=>{setQuery(e.target.value);if(!e.target.value.trim())setFound(null);}} placeholder="Rear axle nut, valve clearance, fork oil…" enterKeyHint="search"/>{query&&<button type="button" className="sp-clear" aria-label="Clear search" onClick={()=>{setQuery('');setFound(null);}}><X size={15}/></button>}<button type="submit" className="sp-go" disabled={searching||!query.trim()}>{searching?'…':'Search'}</button></form>
  {claims!==null&&!rows.length&&!error?<p className="notice">No published specs on file for this exact bike yet. Ask BAK: it says plainly when a number isn’t confirmed.</p>:
  found?<div className="sp-results"><p className="subtle">{found.length?`${found.length} match${found.length===1?'':'es'}`:'Nothing published matches that for this bike. Try the words a service manual would use.'}</p><ul className="sp-list">{found.map(c=>row(toRow(c)))}</ul></div>:<>
   {kind==='all'&&<>
   <div className="sp-quick" aria-label="Most looked-up values">
    {oil&&<button type="button" className="sp-tile wide" onClick={()=>oil.row&&jump(oil.row)}><small>Engine oil</small><b>{oil.amount||'Amount not published'}</b>{oil.grade&&<span>{oil.grade}</span>}</button>}
    {quick.map(q=><button type="button" key={q.label} className="sp-tile" onClick={()=>jump(q.row)}><small>{q.label}</small><b>{q.row.value.split(';')[0]}</b></button>)}
   </div>
   <div className="sp-yours"><div className="sp-yours-head"><span className="eyebrow">YOUR SETTINGS NOW</span><button type="button" className="hb-link" onClick={onGarage}>{hasYours?'Update':'Add yours'}</button></div>
    {hasYours?<ul>{yours.filter(y=>y.mine||y.stock).map(y=><li key={y.key}><span>{y.label}</span><b>{y.mine||'—'}</b><small>{y.stock?`stock ${y.stock}`:'stock not published'}</small></li>)}</ul>:<p className="subtle">Put your clickers, sag and tire pressure in Garage and they show here next to stock, so you always know where you are.</p>}
   </div>
  </>}
   <div className="sp-kinds" role="tablist" aria-label="Kind of value">{KINDS.map(k=><button key={k.k} type="button" role="tab" aria-selected={kind===k.k} className={kind===k.k?'on':''} onClick={()=>setKind(k.k)} disabled={k.k!=='all'&&!count(k.k)}>{k.label}<span>{count(k.k)}</span></button>)}</div>
   <div className="sp-groups">{systems.map(g=>{const isOpen=open===g.s||systems.length===1;return <div key={g.s} className={'sp-group'+(isOpen?' open':'')}>
    <button type="button" className="sp-group-head" aria-expanded={isOpen} onClick={()=>setOpen(isOpen?'':g.s)}><span>{g.s}</span><small>{g.items.length}</small><ChevronDown size={17}/></button>
    {isOpen&&<ul className="sp-list">{g.items.map(row)}</ul>}
   </div>;})}</div>
  </>}
 </section>;
}
