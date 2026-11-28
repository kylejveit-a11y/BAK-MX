// Find a part: the rider opens it on purpose. Parts on file for this exact bike (factory list and aftermarket list),
// where to buy each, and a saved parts list. Also the one quiet line under an Ask BAK answer that opens it.
// Rules (Kyle): never push sales, nothing shown that is not on file for the bike.
// 2026-11-28 overhaul: laid out like a parts store. Shop by area, real brand and product names, the store buttons and
// the price each store showed when last checked right on the card, filters and sorting. Riders had called the old list useless.
import React,{useCallback,useEffect,useState} from 'react';
import {ArrowUpRight,Check,ChevronRight,Search} from 'lucide-react';
import './parts-shop.css';
import {api} from './client';
import type {Bike} from '../shared/types';
import type {FoundPart,StoreLink} from '../shared/parts-hunter';

type Found={query:string;factory:FoundPart[];aftermarket:FoundPart[];has_factory_list:boolean;has_aftermarket_list:boolean};
type Saved={id:string;kind:'factory'|'aftermarket';brand:string;name:string;part_number:string;stores:StoreLink[]};
const QUICK=['Brake pads','Chain','Sprocket','Air filter','Fork seals','Clutch plates','Spark plug','Wheel bearings','Grips','Levers'];
const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
const keyOf=(p:{kind:string;brand:string;name:string;part_number:string})=>`${p.kind}|${p.brand}|${p.name}|${p.part_number}`.toLowerCase();
const OFFER_KEY='bak.parts-offer';
export const partsOfferOn=()=>{try{return localStorage.getItem(OFFER_KEY)!=='off';}catch{return true;}};

let pending='';
/** From the Ask BAK line: remember the search and ask the app to open Specs and parts. */
export function openFindPart(query:string){pending=query;window.dispatchEvent(new CustomEvent('bak:find-part',{detail:query}));}

const money=(n:number)=>'$'+(Number.isInteger(n)?String(n):n.toFixed(2));
const tidy=(name:string)=>name===name.toUpperCase()&&/[A-Z]/.test(name)?name.toLowerCase().replace(/(^|[\s,(/-])([a-z])/g,(_,a,b)=>a+b.toUpperCase()).replace(/\bRr\b\.?/g,'Rear').replace(/\bFr\b\.?/g,'Front').replace(/\bAssy\b\.?/gi,'Assembly').replace(/\bCpl\b\.?/gi,'Complete'):name;
const firstNumber=(p:{part_number:string})=>p.part_number.split(/\s+/)[0]??'';
/** Store buttons right on the card: cheapest first, price on the button when one is on file. */
function Buy({stores}:{stores:StoreLink[]}){
 if(!stores.length)return <p className="ps-nostore">No store on file can look this one up yet. Copy the part number for your dealer.</p>;
 const sorted=[...stores].sort((a,b)=>(a.price??1e9)-(b.price??1e9));
 return <div className="ps-buy">{sorted.map((s,i)=><a key={s.store} className={i===0?'first':''} href={s.url} target="_blank" rel="noreferrer" aria-label={`Open this part at ${s.store}${s.price?`, ${money(s.price)} when last checked`:''}`}><span>{s.how==='listing'?s.store:`Search ${s.store}`}</span>{s.price?<b>{money(s.price)}</b>:null}<ArrowUpRight size={14} aria-hidden/></a>)}</div>;
}
function Copy({text}:{text:string}){const [done,setDone]=useState(false);return <button type="button" className="ps-copy" onClick={()=>{void navigator.clipboard?.writeText(text).then(()=>{setDone(true);setTimeout(()=>setDone(false),1400);}).catch(()=>{});}}>{done?'Copied':'Copy'}</button>;}
function Product({p,saved,onSave,busy}:{p:FoundPart;saved:boolean;onSave:()=>void;busy:boolean}){
 const n=firstNumber(p),more=(p.numbers?.length??0)>1||p.part_number.includes(' ');
 return <article className="ps-card">
  <div className="ps-card-top"><span className="ps-brand">{p.brand}</span>{p.price_from!==undefined&&<span className="ps-price">{p.stores.filter(s=>s.price).length>1?'From ':''}{money(p.price_from)}</span>}</div>
  <h3>{p.name}</h3>
  {(p.type||p.position)&&<div className="ps-tags">{p.type&&p.type!=='Small parts and accessories'&&<span>{p.type}</span>}{p.position&&<span>{p.position==='front'?'Front':'Rear'}</span>}</div>}
  {p.note&&<p className="ps-note">{p.note}</p>}
  {p.options&&<p className="ps-opts">Comes in: {p.options.slice(0,4).join(', ')}{p.options.length>4?` and ${p.options.length-4} more`:''}</p>}
  <Buy stores={p.stores}/>
  <div className="ps-card-foot">{n?<span className="ps-pn">Part no. {n}{more?' and others':''} <Copy text={n}/></span>:<span/>}<button type="button" className="ps-save" disabled={saved||busy} onClick={onSave}>{saved?<><Check size={14} aria-hidden/> On my list</>:'Save'}</button></div>
 </article>;
}
function FactoryRow({p,saved,onSave,busy}:{p:FoundPart;saved:boolean;onSave:()=>void;busy:boolean}){
 return <li className="ps-frow"><div><b>{tidy(p.name)}</b><small>{[p.where&&`Shown in the ${tidy(p.where)} diagram`,p.position&&(p.position==='front'?'Front':'Rear')].filter(Boolean).join(' · ')}</small><span className="ps-pn">Part no. {p.part_number} <Copy text={p.part_number}/></span></div>
  <div className="ps-frow-act"><Buy stores={p.stores}/><button type="button" className="ps-save" disabled={saved||busy} onClick={onSave}>{saved?<><Check size={14} aria-hidden/> On my list</>:'Save'}</button></div></li>;
}

type Overview={systems:{key:string;label:string;hint:string;count:number;types:string[]}[];has_aftermarket_list:boolean};
type Shop=Found&{system?:string;types?:{label:string;count:number}[];brands?:{name:string;count:number}[];total?:number};
const SORTS:[string,string][]=[['type','Kind of part'],['price_low','Price: low to high'],['price_high','Price: high to low'],['brand','Brand A to Z']];

export function FindPart({bike}:{bike?:Bike}){
 const [q,setQ]=useState(pending),[found,setFound]=useState<Shop|null>(null),[saved,setSaved]=useState<Saved[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(''),[offerOn,setOfferOn]=useState(partsOfferOn);
 const [overview,setOverview]=useState<Overview|null>(null),[system,setSystem]=useState(''),[type,setType]=useState(''),[brand,setBrand]=useState(''),[position,setPosition]=useState(''),[sort,setSort]=useState('type');
 const id=bike?.id;
 const search=useCallback(async(text:string)=>{
  if(!id||!text.trim())return;setBusy(true);setError('');setSystem('');
  try{setFound(await api<Shop>(`/parts/find?bike_id=${id}&q=${encodeURIComponent(text.trim())}`));}catch(e){setError(errorText(e));}finally{setBusy(false);}
 },[id]);
 const browse=useCallback(async(sys:string,f:{type?:string;brand?:string;position?:string;sort?:string;offset?:number}={})=>{
  if(!id)return;setBusy(true);setError('');
  const qs=new URLSearchParams({bike_id:id,system:sys,shop:'1',sort:f.sort??'type',...(f.type?{type:f.type}:{}),...(f.brand?{brand:f.brand}:{}),...(f.position?{position:f.position}:{}),...(f.offset?{offset:String(f.offset)}:{})});
  try{const r=await api<Shop>('/parts/find?'+qs);setFound(prev=>f.offset&&prev?{...r,aftermarket:[...prev.aftermarket,...r.aftermarket]}:r);}catch(e){setError(errorText(e));}finally{setBusy(false);}
 },[id]);
 useEffect(()=>{setFound(null);setSaved([]);setOverview(null);setSystem('');if(!id)return;let live=true;
  api<Saved[]>('/saved-parts?bike_id='+id).then(r=>{if(live)setSaved(r);}).catch(()=>{});
  api<Overview>('/parts/overview?bike_id='+id).then(r=>{if(live)setOverview(r);}).catch(()=>{if(live)setOverview({systems:[],has_aftermarket_list:false});});
  if(pending){const p=pending;pending='';setQ(p);void search(p);}
  const hear=(e:Event)=>{const text=String((e as CustomEvent).detail||'');pending='';setQ(text);void search(text);};window.addEventListener('bak:find-part',hear);
  return()=>{live=false;window.removeEventListener('bak:find-part',hear);};},[id,search]);
 function open(sys:string){setSystem(sys);setType('');setBrand('');setPosition('');setSort('type');setQ('');setFound(null);void browse(sys);}
 function refine(next:{type?:string;brand?:string;position?:string;sort?:string}){const f={type,brand,position,sort,...next};if('type' in next)f.brand='';setType(f.type);setBrand(f.brand);setPosition(f.position);setSort(f.sort);void browse(system,f);}
 function home(){setSystem('');setFound(null);setQ('');}
 async function save(p:FoundPart){
  if(!id)return;setBusy(true);setError('');
  try{await api('/saved-parts','POST',{bike_id:id,kind:p.kind,brand:p.brand,name:p.name,part_number:p.part_number});setSaved(await api<Saved[]>('/saved-parts?bike_id='+id));}catch(e){setError(errorText(e));}finally{setBusy(false);}
 }
 async function remove(s:Saved){
  setBusy(true);setError('');
  try{await api(`/saved-parts?id=${s.id}`,'DELETE');setSaved(saved.filter(x=>x.id!==s.id));}catch(e){setError(errorText(e));}finally{setBusy(false);}
 }
 if(!bike)return null;
 const name=`${bike.model_year} ${bike.manufacturer} ${bike.model}`,savedKeys=new Set(saved.map(keyOf));
 const sys=overview?.systems.find(s=>s.key===system),none=found&&!found.factory.length&&!found.aftermarket.length;
 const results=found?.aftermarket??[],searching=!!found&&!system;
 return <section className="panel ps" id="find-a-part">
  <div className="ps-head"><h2>Parts for your {name}</h2><p>Everything here is on file as fitting this exact bike and year.</p></div>
  <form className="ps-search" onSubmit={e=>{e.preventDefault();void search(q);}}>
   <label className="sr-only" htmlFor="ps-q">Search parts</label>
   <div><Search size={18} aria-hidden/><input id="ps-q" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by part or brand: brake pads, Renthal, air filter" maxLength={80} enterKeyHint="search"/></div>
   <button type="submit" className="primary" disabled={busy||!q.trim()}>Search</button>
  </form>
  {!system&&!found&&<div className="ps-quick" aria-label="Common parts">{QUICK.map(w=><button type="button" key={w} onClick={()=>{setQ(w);void search(w);}}>{w}</button>)}</div>}
  {error&&<div className="error" role="alert">{error}</div>}

  {!system&&!found&&<>
   {overview===null&&<p className="subtle" role="status">Loading the parts list…</p>}
   {overview&&!overview.systems.length&&<p className="subtle">BAK has no aftermarket list for this exact bike yet. You can still search the factory parts list above.</p>}
   {!!overview?.systems.length&&<><h3 className="ps-sub">Shop by area of the bike</h3>
    <div className="ps-areas">{overview.systems.map(s=><button type="button" key={s.key} onClick={()=>open(s.key)}><b>{s.label}</b><span>{s.types.length?s.types.join(', '):s.hint}</span><small>{s.count} {s.count===1?'part':'parts'}</small><ChevronRight size={18} aria-hidden/></button>)}</div></>}
  </>}

  {(system||found)&&<nav className="ps-crumb" aria-label="Where you are"><button type="button" onClick={home}>All parts</button><ChevronRight size={14} aria-hidden/><span>{system?(sys?.label??'Parts'):`“${found?.query}”`}</span></nav>}

  {system&&found&&<>
   {!!found.types?.length&&<div className="ps-types" role="group" aria-label="Kind of part"><button type="button" className={!type?'on':''} aria-pressed={!type} onClick={()=>refine({type:''})}>All <small>{found.types.reduce((n,t)=>n+t.count,0)}</small></button>{found.types.map(t=><button type="button" key={t.label} className={type===t.label?'on':''} aria-pressed={type===t.label} onClick={()=>refine({type:t.label})}>{t.label} <small>{t.count}</small></button>)}</div>}
   <div className="ps-filters">
    <label><span>Brand</span><select value={brand} onChange={e=>refine({brand:e.target.value})}><option value="">All brands</option>{found.brands?.map(b=><option key={b.name} value={b.name}>{b.name} ({b.count})</option>)}</select></label>
    <label><span>Front or rear</span><select value={position} onChange={e=>refine({position:e.target.value})}><option value="">Either</option><option value="front">Front</option><option value="rear">Rear</option></select></label>
    <label><span>Sort by</span><select value={sort} onChange={e=>refine({sort:e.target.value})}>{SORTS.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
    <p role="status">{busy?'Loading…':`${found.total??results.length} ${(found.total??results.length)===1?'part':'parts'}`}</p>
   </div>
  </>}
  {searching&&!none&&<p className="ps-count" role="status">{results.length} aftermarket and {found!.factory.length} factory {found!.factory.length===1?'part':'parts'} match</p>}
  {none&&<p className="subtle" role="status">{system?'Nothing on file matches those filters. Clear one and try again.':!found!.has_factory_list&&!found!.has_aftermarket_list?'BAK has no parts list for this exact bike yet, so there is nothing to show.':`Nothing on file for “${found!.query}” on this bike. Try fewer words, like “brake pads” or “chain”.`}</p>}

  {!!results.length&&<div className="ps-grid">{results.map(p=><Product key={keyOf(p)} p={p} busy={busy} saved={savedKeys.has(keyOf(p))} onSave={()=>void save(p)}/>)}</div>}
  {system&&found&&(found.total??0)>results.length&&<button type="button" className="ps-more" disabled={busy} onClick={()=>void browse(system,{type,brand,position,sort,offset:results.length})}>Show more ({(found.total??0)-results.length} left)</button>}

  {!!found?.factory.length&&<details className="ps-factory" open={searching&&!results.length}><summary><b>{bike.manufacturer} factory parts</b><span>{found.factory.length} from the maker’s own parts list for your year</span></summary>
   <ul>{found.factory.map(p=><FactoryRow key={keyOf(p)} p={p} busy={busy} saved={savedKeys.has(keyOf(p))} onSave={()=>void save(p)}/>)}</ul>
   <p className="subtle">One search can list a few versions of a part. Match the part number to the one on your bike, or open the Diagrams tab to see where it sits.</p></details>}

  {(system||found)&&!none&&<p className="ps-fine">Prices are what each store showed when BAK last checked, and they change. The store’s page has today’s price and stock. Check the fit for your year there before you order. BAK earns nothing from these links.</p>}

  {!!saved.length&&<div className="ps-saved"><h3 className="ps-sub">My list ({saved.length})</h3>
   <ul>{saved.map(s=><li key={s.id} className="ps-frow"><div><b>{s.kind==='aftermarket'?`${s.brand} ${s.name}`:tidy(s.name)}</b>{!!s.part_number&&<span className="ps-pn">Part no. {firstNumber(s)} <Copy text={firstNumber(s)}/></span>}</div>
    <div className="ps-frow-act"><Buy stores={s.stores}/><button type="button" className="ps-save" disabled={busy} onClick={()=>void remove(s)}>Remove</button></div></li>)}</ul></div>}
  <label className="ps-offer">
   <span><b>Suggest parts in Ask BAK</b><small>One small line, at most once a chat, when an answer says a part needs replacing.</small></span>
   <input type="checkbox" role="switch" checked={offerOn} onChange={e=>{setOfferOn(e.target.checked);try{localStorage.setItem(OFFER_KEY,e.target.checked?'on':'off');}catch{}}} aria-label="Suggest parts in Ask BAK"/>
  </label>
 </section>;
}

const linkBtn:React.CSSProperties={background:'none',border:0,padding:0,color:'inherit',fontWeight:700,cursor:'pointer',font:'inherit'};
/** Under an Ask BAK answer: shown only if this bike really has a matching part on file. Otherwise nothing. */
export function PartOfferLine({bikeId,query}:{bikeId:string;query:string}){
 const [has,setHas]=useState(false);
 useEffect(()=>{let live=true;setHas(false);api<Found>(`/parts/find?bike_id=${bikeId}&q=${encodeURIComponent(query)}`).then(r=>{if(live)setHas(r.factory.length+r.aftermarket.length>0);}).catch(()=>{});return()=>{live=false;};},[bikeId,query]);
 if(!has)return null;
 return <p style={{margin:'8px 0 0'}}><button type="button" style={{...linkBtn,fontWeight:600,opacity:0.8,textDecoration:'underline'}} onClick={()=>openFindPart(query)}>See parts that fit your bike</button></p>;
}
