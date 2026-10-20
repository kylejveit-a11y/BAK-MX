import {useEffect,useMemo,useState} from 'react';
import {Check,ChevronRight,Search} from 'lucide-react';

export type SupportRow={make:string;model:string;year:number;type:string;knowledge:number;setup:number;specs:number;troubleshooting:number;guides:number;full_rebuild:boolean};
type Data={generated:string;guide_total:number;bikes:SupportRow[]};
let cache:Promise<Data>|null=null;
const loadSupport=()=>cache??=import('../shared/bike-support.json').then(m=>(m.default??m) as Data);
export function useSupport(){const [data,setData]=useState<Data|null>(null);useEffect(()=>{let live=true;void loadSupport().then(d=>{if(live)setData(d)});return()=>{live=false}},[]);return data;}

export type Level={id:'full'|'strong'|'good'|'basic';label:string;short:string;line:string};
export function level(r:SupportRow):Level{
 if(r.full_rebuild)return {id:'full',label:'Full support',short:'Full',line:'Setup, specs, troubleshooting and step-by-step rebuilds, engine to suspension.'};
 if(r.knowledge>=80)return {id:'strong',label:'Strong support',short:'Strong',line:'Setup, specs and troubleshooting are well covered. Rebuild guides are still coming.'};
 if(r.knowledge>=60)return {id:'good',label:'Good support',short:'Good',line:'Solid setup and troubleshooting help. Some exact numbers are still being added.'};
 return {id:'basic',label:'Basic support',short:'Basic',line:'General setup and troubleshooting help. Few bike-specific numbers yet.'};
}
const area=(n:number)=>n>=80?'Strong':n>=50?'Partial':n>0?'Limited':'Not yet';

function Detail({row,total}:{row:SupportRow;total:number}){
 const l=level(row);
 const items:[string,string,boolean][]=[['Setup & tuning',area(row.setup),row.setup>=50],['Specs & torques',area(row.specs),row.specs>=50],['Troubleshooting',area(row.troubleshooting),row.troubleshooting>=50],['Step-by-step rebuilds',row.guides?`${row.guides} of ${total} jobs`:'Not yet',row.full_rebuild]];
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
 const [q,setQ]=useState(''),[open,setOpen]=useState<SupportRow|null>(null);
 if(!data)return <section className="panel"><p className="subtle" role="status">Loading bikes…</p></section>;
 const groups=new Map<string,SupportRow[]>();
 for(const b of data.bikes)if(!q.trim()||`${b.make} ${b.model} ${b.year}`.toLowerCase().includes(q.trim().toLowerCase()))(groups.get(`${b.make}|${b.model}`)??groups.set(`${b.make}|${b.model}`,[]).get(`${b.make}|${b.model}`)!).push(b);
 const makes=[...new Set([...groups.keys()].map(k=>k.split('|')[0]))].sort();
 const legend:Level['id'][]=['full','strong','good','basic'];
 return <div className="supported">
  <section className="panel"><p>Tap a year to see what BAK covers for it. If your bike isn’t here, it isn’t supported yet.</p>
   <div className="support-legend">{legend.map(id=>{const l=level({full_rebuild:id==='full',knowledge:id==='strong'?90:id==='good'?70:10} as SupportRow);return <span key={id} className={'support-badge lvl-'+id}>{l.short}</span>;})}</div>
   <label className="search-input"><Search size={15}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search: KX450, 2024, Husqvarna…" aria-label="Search bikes"/></label>
  </section>
  {open&&<section className="panel"><Detail row={open} total={data.guide_total}/><button className="text-button" onClick={()=>setOpen(null)}>Close</button></section>}
  {makes.map(make=><section className="panel" key={make}><h2>{make}</h2>{[...groups.entries()].filter(([k])=>k.startsWith(make+'|')).map(([k,rows])=><div className="support-model" key={k}><strong>{k.split('|')[1]}</strong><div className="support-years">{rows.sort((a,b)=>b.year-a.year).map(r=>{const l=level(r);return <button key={r.year} className={'year-chip lvl-'+l.id+(open===r?' active':'')} title={`${r.year}: ${l.label}`} onClick={()=>setOpen(r)}>{r.year}</button>;})}</div></div>)}</section>)}
 </div>;
}
