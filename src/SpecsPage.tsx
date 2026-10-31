// Specs on the web, laid out for a rider at the bike: the numbers people look for most sit on top, a kind filter
// (torques, settings, service, specs) and a search narrow the rest, and every fact is one compact row, name left and
// value right, grouped by the part of the bike. Tap a row for the conditions and the source. Only verified facts for
// this exact bike are shown; a value that is not here is unknown, not zero.
import {useEffect,useMemo,useState,type FormEvent} from 'react';
import {ArrowUpRight,BookOpen,ChevronDown,Search,X} from 'lucide-react';
import type {Bike,Claim} from '../shared/types';
import type {FactKind} from '../shared/fact-system';
import {api} from './client';
import './specs.css';

import {splitFact,toSpecRow as toRow,specRows,groupSpecRows,quickSpecs,oilSummary,yourSettings,SPEC_KINDS as KINDS,type SpecRow as Row} from '../shared/specs-view';
export {splitFact};

export function SpecsPage({bike,onGarage}:{bike?:Bike;onGarage:()=>void}){
 const [claims,setClaims]=useState<Claim[]|null>(null),[error,setError]=useState(''),[kind,setKind]=useState<FactKind|'all'>('all'),[open,setOpen]=useState<string>(''),[query,setQuery]=useState(''),[found,setFound]=useState<Claim[]|null>(null),[searching,setSearching]=useState(false),[openRow,setOpenRow]=useState('');
 useEffect(()=>{let live=true;setClaims(null);setError('');setFound(null);setQuery('');setOpen('');
  if(bike)api<Claim[]>('/claims?bike_id='+bike.id).then(d=>{if(live)setClaims(d.filter(c=>c.manufacturer===bike.manufacturer&&c.model===bike.model&&c.model_year===bike.model_year&&c.variant===bike.variant&&c.region===bike.region&&c.status==='VERIFIED'&&!c.has_conflict))}).catch(e=>{if(live){setError((e as Error).message);setClaims([]);}});
  else setClaims([]);
  return()=>{live=false};},[bike?.id]);
 const rows=useMemo<Row[]>(()=>specRows(claims??[]),[claims]);
 const quick=useMemo(()=>quickSpecs(rows),[rows]);
 const oil=useMemo(()=>oilSummary(rows),[rows]);
 const mine=useMemo(()=>yourSettings(rows,bike?.configuration as Record<string,unknown>|undefined),[rows,bike?.configuration]);
 const yours=mine.list,hasYours=mine.any;
 const jump=(r:Row)=>{setKind('all');setOpen(r.system);setOpenRow(r.c.id);requestAnimationFrame(()=>document.getElementById('sp-'+r.c.id)?.scrollIntoView({block:'center',behavior:'smooth'}));};
 const shown=kind==='all'?rows:rows.filter(r=>r.kind===kind);
 const systems=groupSpecRows(shown);
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
  <form className="sp-search" onSubmit={search} role="search"><Search size={17} aria-hidden="true"/><input aria-label="Search this bike’s specs" value={query} onChange={e=>{setQuery(e.target.value);if(!e.target.value.trim())setFound(null);}} placeholder="Rear axle nut, fork oil…" enterKeyHint="search"/>{query&&<button type="button" className="sp-clear" aria-label="Clear search" onClick={()=>{setQuery('');setFound(null);}}><X size={15}/></button>}<button type="submit" className="sp-go" disabled={searching||!query.trim()}>{searching?'…':'Search'}</button></form>
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
