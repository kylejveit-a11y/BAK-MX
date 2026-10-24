import {useEffect,useMemo,useState} from 'react';
import {Check,ChevronDown,ChevronRight,ChevronUp,Search} from 'lucide-react';

import {level,supportAreas,groupSupport,yearRange,type SupportRow,type SupportData as Data} from '../shared/bike-support';
export type {SupportRow};
let cache:Promise<Data>|null=null;
const loadSupport=()=>cache??=import('../shared/bike-support.json').then(m=>(m.default??m) as Data);
export function useSupport(){const [data,setData]=useState<Data|null>(null);useEffect(()=>{let live=true;void loadSupport().then(d=>{if(live)setData(d)});return()=>{live=false}},[]);return data;}

function Detail({row,total}:{row:SupportRow;total:number}){
 const l=level(row);
 const items=supportAreas(row,total);
 return <div className={'support-detail lvl-'+l.id}>
  <div className="support-head"><span className={'support-badge lvl-'+l.id}>{l.label}</span><strong>{row.year} {row.make} {row.model}</strong></div>
  <p className="subtle">{l.line}</p>
  <ul className="support-list">{items.map(([name,val,ok])=><li key={name} className={ok?'ok':''}>{ok?<Check size={14}/>:<span className="dot"/>}<span>{name}</span><b>{val}</b></li>)}</ul>
 </div>;
}

/** Home page: pick make, model and year before signing up or subscribing. */
export function SupportPicker({onSeeAll}:{onSeeAll:()=>void}){
 const data=useSupport();
 const makes=useMemo(()=>data?[...new Set(data.bikes.map(b=>b.make))].sort():[],[data]);
 const [make,setMake]=useState(''),[model,setModel]=useState(''),[year,setYear]=useState(0);
 const models=data?[...new Set(data.bikes.filter(b=>b.make===make).map(b=>b.model))]:[];
 const years=data?data.bikes.filter(b=>b.make===make&&b.model===model).map(b=>b.year).sort((a,b)=>b-a):[];
 const row=data?.bikes.find(b=>b.make===make&&b.model===model&&b.year===year);
 return <section className="panel support-picker" aria-label="Is your bike supported?">
  <div className="panel-title"><div><span className="eyebrow">BEFORE YOU SIGN UP</span><h2>Is your bike supported?</h2></div><button className="text-button" onClick={onSeeAll}>All bikes <ChevronRight size={14}/></button></div>
  <div className="support-selects">
   <label className="field"><span>Make</span><select value={make} onChange={e=>{setMake(e.target.value);setModel('');setYear(0);}}><option value="">Make</option>{makes.map(m=><option key={m}>{m}</option>)}</select></label>
   <label className="field"><span>Model</span><select value={model} disabled={!make} onChange={e=>{setModel(e.target.value);const ys=data!.bikes.filter(b=>b.make===make&&b.model===e.target.value).map(b=>b.year);setYear(Math.max(...ys));}}><option value="">Model</option>{models.map(m=><option key={m}>{m}</option>)}</select></label>
   <label className="field"><span>Year</span><select value={year||''} disabled={!model} onChange={e=>setYear(Number(e.target.value))}><option value="">Year</option>{years.map(y=><option key={y}>{y}</option>)}</select></label>
  </div>
  {row?<Detail row={row} total={data!.guide_total}/>:<p className="subtle">{data?`${data.bikes.length} bike-years from ${makes.length} makes so far. Don’t see yours? It isn’t supported yet.`:'Loading…'}</p>}
 </section>;
}

/** The full list: every model, each year marked by how complete BAK is for it. */
export function SupportedBikes(){
 const data=useSupport();
 const [q,setQ]=useState(''),[openMake,setOpenMake]=useState(''),[openModel,setOpenModel]=useState(''),[open,setOpen]=useState<SupportRow|null>(null);
 if(!data)return <section className="panel"><p className="subtle" role="status">Loading bikes…</p></section>;
 const searching=!!q.trim(),makes=groupSupport(data.bikes,q);
 const legend:('full'|'strong'|'good'|'basic')[]=['full','strong','good','basic'];
 return <div className="supported">
  <section className="panel"><p>Open a brand, then a model, to see what BAK covers for each year. If your bike isn’t here, it isn’t supported yet.</p>
   <div className="support-legend">{legend.map(id=>{const l=level({full_rebuild:id==='full',knowledge:id==='strong'?90:id==='good'?70:10} as SupportRow);return <span key={id} className={'support-badge lvl-'+id}>{l.short}</span>;})}</div>
   <label className="search-input"><Search size={15}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search: KX450, 2024, Husqvarna…" aria-label="Search bikes"/></label>
  </section>
  {!makes.length&&<section className="panel"><p className="subtle">No supported bike matches “{q.trim()}”.</p></section>}
  <section className="panel support-brands">{makes.map(mk=>{const expanded=searching||openMake===mk.make;return <div className="support-brand" key={mk.make}>
   <button className="support-brand-head" aria-expanded={expanded} onClick={()=>{if(searching)return;setOpenMake(expanded?'':mk.make);setOpenModel('');setOpen(null);}}><span><h2>{mk.make}</h2><small>{mk.models.length} {mk.models.length===1?'model':'models'} · {yearRange(mk.from,mk.to)}</small></span>{!searching&&(expanded?<ChevronUp size={18}/>:<ChevronDown size={18}/>)}</button>
   {expanded&&mk.models.map(md=>{const key=mk.make+'|'+md.model,mOpen=openModel===key;return <div className="support-model" key={key}>
    <button className="support-model-head" aria-expanded={mOpen} onClick={()=>{setOpenModel(mOpen?'':key);setOpen(null);}}><span><strong>{md.model}</strong><small>{yearRange(md.from,md.to)}</small></span><span className="support-dots">{[...md.rows].reverse().map(r=><i key={r.year} className={'lvl-'+level(r).id} title={`${r.year}: ${level(r).label}`}/>)}</span></button>
    {mOpen&&<div className="support-years">{md.rows.map(r=>{const l=level(r);return <button key={r.year} className={'year-chip lvl-'+l.id+(open===r?' active':'')} title={`${r.year}: ${l.label}`} onClick={()=>setOpen(open===r?null:r)}>{r.year}</button>;})}{open&&md.rows.includes(open)&&<div className="support-inline"><Detail row={open} total={data.guide_total}/></div>}</div>}
   </div>;})}
  </div>;})}</section>
 </div>;
}
