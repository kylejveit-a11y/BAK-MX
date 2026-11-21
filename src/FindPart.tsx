// Find a part: the rider opens it on purpose. Parts on file for this exact bike (factory list and aftermarket list),
// where to buy each, and a saved parts list. Also the one quiet line under an Ask BAK answer that opens it.
// Rules (Kyle): never push sales, nothing shown that is not on file for the bike, no prices BAK cannot stand behind.
import React,{useCallback,useEffect,useState} from 'react';
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

function Stores({stores}:{stores:StoreLink[]}){
 if(!stores.length)return <p className="subtle">BAK hasn’t found a store that can look this one up by its number. Copy the part number and give it to your dealer.</p>;
 return <div style={{display:'grid',gap:6}}>{stores.map(s=><a key={s.store} href={s.url} target="_blank" rel="noreferrer">{s.how==='listing'?`${s.store}: this part`:`Search ${s.store}`}</a>)}
  <small className="subtle">Opens that part’s page at the store. Check the fit for your year there before you order. BAK earns nothing from these links.</small></div>;
}
const linkBtn:React.CSSProperties={background:'none',border:0,padding:0,color:'inherit',fontWeight:700,cursor:'pointer',font:'inherit'};
function Row({p,saved,onSave,busy}:{p:FoundPart;saved:boolean;onSave:()=>void;busy:boolean}){
 const [open,setOpen]=useState(false);
 return <div style={{borderTop:'1px solid #2a2f38',paddingTop:10,display:'grid',gap:6}}>
  <b>{p.kind==='aftermarket'?`${p.brand} ${p.name}`:p.name}</b>
  <small className="subtle">{[p.kind==='factory'?`${p.brand} factory part`:'Aftermarket',p.part_number&&`Part no. ${p.part_number}`,p.kind==='factory'&&p.where&&`From: ${p.where.toLowerCase()}`].filter(Boolean).join('  ·  ')}</small>
  <div style={{display:'flex',gap:18,flexWrap:'wrap'}}>
   <button type="button" style={linkBtn} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Hide stores':'Where to buy'}</button>
   <button type="button" style={{...linkBtn,opacity:saved?0.6:1}} disabled={saved||busy} onClick={onSave}>{saved?'On my parts list':'Save to my parts list'}</button>
  </div>
  {open&&<Stores stores={p.stores}/>}
 </div>;
}

export function FindPart({bike}:{bike?:Bike}){
 const [q,setQ]=useState(pending),[found,setFound]=useState<Found|null>(null),[saved,setSaved]=useState<Saved[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(''),[openSaved,setOpenSaved]=useState(''),[offerOn,setOfferOn]=useState(partsOfferOn);
 const id=bike?.id;
 const search=useCallback(async(text:string)=>{
  if(!id||!text.trim())return;setBusy(true);setError('');
  try{setFound(await api<Found>(`/parts/find?bike_id=${id}&q=${encodeURIComponent(text.trim())}`));}catch(e){setError(errorText(e));}finally{setBusy(false);}
 },[id]);
 useEffect(()=>{setFound(null);setSaved([]);if(!id)return;let live=true;api<Saved[]>('/saved-parts?bike_id='+id).then(r=>{if(live)setSaved(r);}).catch(()=>{});
  if(pending){const p=pending;pending='';setQ(p);void search(p);}
  const hear=(e:Event)=>{const text=String((e as CustomEvent).detail||'');pending='';setQ(text);void search(text);};window.addEventListener('bak:find-part',hear);
  return()=>{live=false;window.removeEventListener('bak:find-part',hear);};},[id,search]);
 async function save(p:FoundPart){
  if(!id)return;setBusy(true);setError('');
  try{await api('/saved-parts','POST',{bike_id:id,kind:p.kind,brand:p.brand,name:p.name,part_number:p.part_number});setSaved(await api<Saved[]>('/saved-parts?bike_id='+id));}catch(e){setError(errorText(e));}finally{setBusy(false);}
 }
 async function remove(s:Saved){
  setBusy(true);setError('');
  try{await api(`/saved-parts?id=${s.id}`,'DELETE');setSaved(saved.filter(x=>x.id!==s.id));}catch(e){setError(errorText(e));}finally{setBusy(false);}
 }
 if(!bike)return null;
 const savedKeys=new Set(saved.map(keyOf));const none=found&&!found.factory.length&&!found.aftermarket.length;
 return <section className="panel" id="find-a-part" style={{display:'grid',gap:12}}>
  <div className="panel-title"><div><h2>Find a part</h2><p className="subtle">Parts on file for your {bike.model_year} {bike.model}. Type what you need.</p></div></div>
  <form onSubmit={e=>{e.preventDefault();void search(q);}} style={{display:'grid',gap:10}}>
   <label className="field"><span>What do you need?</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Rear brake pads" maxLength={80}/></label>
   <div style={{display:'flex',flexWrap:'wrap',gap:8}}>{QUICK.map(w=><button type="button" key={w} onClick={()=>{setQ(w);void search(w);}} style={{padding:'6px 12px',borderRadius:16,border:'1px solid #2a2f38',background:'none',color:'inherit',cursor:'pointer',fontSize:13.5}}>{w}</button>)}</div>
   <button type="submit" className="primary" disabled={busy||!q.trim()}>{busy?'Looking…':'Find it'}</button>
  </form>
  {error&&<div className="error" role="alert">{error}</div>}
  {none&&<p className="subtle" role="status">{!found.has_factory_list&&!found.has_aftermarket_list?'BAK has no parts list for this exact bike yet, so there is nothing to show.':`Nothing on file for “${found.query}” on this bike. Try fewer words, like “brake pads” or “chain”.`}</p>}
  {!!found?.factory.length&&<div style={{display:'grid',gap:10}}><small className="subtle"><b>Factory parts</b></small>{found.factory.map(p=><Row key={keyOf(p)} p={p} busy={busy} saved={savedKeys.has(keyOf(p))} onSave={()=>void save(p)}/>)}</div>}
  {!!found?.aftermarket.length&&<div style={{display:'grid',gap:10}}><small className="subtle"><b>Aftermarket</b></small>{found.aftermarket.map(p=><Row key={keyOf(p)} p={p} busy={busy} saved={savedKeys.has(keyOf(p))} onSave={()=>void save(p)}/>)}</div>}
  {!!found&&!none&&<p className="subtle">The factory list is the maker’s own for your year. One search can list a few versions of a part; match the part number to the one on your bike.</p>}
  {!!saved.length&&<div style={{display:'grid',gap:10}}><small className="subtle"><b>My parts list ({saved.length})</b></small>
   {saved.map(s=><div key={s.id} style={{borderTop:'1px solid #2a2f38',paddingTop:10,display:'grid',gap:6}}>
    <b>{s.kind==='aftermarket'?`${s.brand} ${s.name}`:s.name}</b>{!!s.part_number&&<small className="subtle">Part no. {s.part_number}</small>}
    <div style={{display:'flex',gap:18}}>
     <button type="button" style={linkBtn} onClick={()=>setOpenSaved(openSaved===s.id?'':s.id)}>{openSaved===s.id?'Hide stores':'Where to buy'}</button>
     <button type="button" style={{...linkBtn,opacity:0.7}} disabled={busy} onClick={()=>void remove(s)}>Remove</button>
    </div>
    {openSaved===s.id&&<Stores stores={s.stores}/>}
   </div>)}</div>}
  <label style={{display:'flex',alignItems:'center',gap:12,borderTop:'1px solid #2a2f38',paddingTop:12}}>
   <span style={{flex:1}}><b>Suggest parts in Ask BAK</b><br/><small className="subtle">One small line, at most once a chat, when an answer says a part needs replacing.</small></span>
   <input type="checkbox" role="switch" checked={offerOn} onChange={e=>{setOfferOn(e.target.checked);try{localStorage.setItem(OFFER_KEY,e.target.checked?'on':'off');}catch{}}} aria-label="Suggest parts in Ask BAK"/>
  </label>
 </section>;
}

/** Under an Ask BAK answer: shown only if this bike really has a matching part on file. Otherwise nothing. */
export function PartOfferLine({bikeId,query}:{bikeId:string;query:string}){
 const [has,setHas]=useState(false);
 useEffect(()=>{let live=true;setHas(false);api<Found>(`/parts/find?bike_id=${bikeId}&q=${encodeURIComponent(query)}`).then(r=>{if(live)setHas(r.factory.length+r.aftermarket.length>0);}).catch(()=>{});return()=>{live=false;};},[bikeId,query]);
 if(!has)return null;
 return <p style={{margin:'8px 0 0'}}><button type="button" style={{...linkBtn,fontWeight:600,opacity:0.8,textDecoration:'underline'}} onClick={()=>openFindPart(query)}>See parts that fit your bike</button></p>;
}
