import {useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {BadgeCheck,ChevronRight,CircleDot,Cog,Cpu,Disc,Disc3,Flame,Frame,Hand,Layers,Link as LinkIcon,MoveVertical,Plus,Search,Shield,Trash2,Wind,X} from 'lucide-react';
import type {Bike} from '../shared/types';
import {partSystems,readInstalled,writeInstalled,partLabel,MAX_PARTS,type InstalledPart,type PartSystem} from '../shared/installed-parts';
import {partsForBike,type CatalogPart} from './partsCatalog';
import {api} from './client';

const ICON:Record<PartSystem,typeof Flame>={exhaust:Flame,suspension:MoveVertical,engine:Cog,clutch:Disc,tuning:Cpu,intake:Wind,gearing:LinkIcon,brakes:Disc3,controls:Hand,chassis:Frame,wheels:CircleDot,protection:Shield,body:Layers};
const NOTE_HINT:Partial<Record<PartSystem,string>>={suspension:'Who revalved it, spring rates, oil height, anything non-stock inside',exhaust:'Insert in or out, spark arrester, packing age',tuning:'Map name or tuner, fuel used',gearing:'Exact sprocket sizes if not listed above',engine:'Hours on the top end, compression, other work',wheels:'Tire model and pressures you run'};
type Value=ReturnType<typeof readInstalled>;
/** Common changes in rider words, for work that isn't a single boxed part (a revalve, a spring swap). Picking one adds it
 *  without a brand; the note box below takes the details. */
const QUICK:Partial<Record<PartSystem,string[]>>={
 suspension:['Fork revalved','Shock revalved','Stiffer fork springs','Softer fork springs','Stiffer shock spring','Softer shock spring','Aftermarket linkage','Holeshot device'],
 exhaust:['Slip-on muffler','Full exhaust system','Quiet insert','Spark arrester'],
 tuning:['ECU remapped','Aftermarket ECU','Map from the maker’s app','Fuel tuner'],
 engine:['High-compression piston','Big bore kit','Ported head','Aftermarket cams','Bigger radiators'],
 clutch:['Auto clutch','Upgraded plates','Stiffer clutch springs','Hydraulic clutch conversion'],
 intake:['Aftermarket air filter','Vented airbox cover','Filter cage'],
 gearing:['Bigger rear sprocket','Smaller rear sprocket','Smaller front sprocket','Aftermarket chain'],
 wheels:['Mousse or foam insert','Tubliss','Aftermarket wheels','Different tire size'],
 chassis:['Triple clamps (different offset)','Softer engine mounts','Steering damper'],
 brakes:['Oversize front rotor','Aftermarket pads','Braided lines'],
 controls:['Aftermarket handlebar','Lower or wider footpegs','Aftermarket levers'],
};
const shortPn=(pn:string)=>{const parts=pn.split(/[\s,]+/).filter(Boolean);return parts.length>2?`${parts.slice(0,2).join(' ')} +${parts.length-2} more`:parts.join(' ')};

/** Garage: what is fitted to this bike, system by system. Stock, changed, or not recorded yet. */
export function BikeParts({bike,onSaved,onAsk}:{bike:Bike;onSaved:(b:Bike)=>void;onAsk?:(text:string)=>void}){
 const value=useMemo(()=>readInstalled(bike.configuration),[bike.configuration]);
 const [catalog,setCatalog]=useState<CatalogPart[]|null|undefined>(undefined),[open,setOpen]=useState<PartSystem|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{let live=true;setCatalog(undefined);partsForBike(bike.manufacturer,bike.model,bike.model_year).then(c=>{if(live)setCatalog(c)}).catch(()=>{if(live)setCatalog(null)});return()=>{live=false}},[bike.manufacturer,bike.model,bike.model_year]);
 const recorded=new Set([...value.parts.map(p=>p.s),...value.stock]).size;
 async function save(next:Value){
  setBusy(true);setError('');
  try{const configuration=writeInstalled(bike.configuration??{},next);
   const saved=await api<Bike>('/bikes?id='+bike.id,'PATCH',{manufacturer:bike.manufacturer,model:bike.model,model_year:bike.model_year,variant:bike.variant,region:bike.region,nickname:bike.nickname??'',engine_hours:bike.engine_hours,configuration});
   onSaved(saved);setOpen(null);}
  catch(e){setError((e as Error).message)}finally{setBusy(false)}
 }
 const changed=value.parts.length>0;
 return <section className="panel bike-parts" aria-labelledby="bike-parts-title">
  <div className="bp-head">
   <div><span className="eyebrow">BUILD SHEET</span><h2 id="bike-parts-title">What’s on your {bike.model}</h2>
    <p className="subtle">Mark each system stock or pick what you’ve fitted. BAK uses this in every answer, and anything left blank is treated as unknown, not stock.</p></div>
   <div className="bp-progress" aria-label={`${recorded} of ${partSystems.length} systems recorded`}><b>{recorded}</b><span>of {partSystems.length}<br/>recorded</span></div>
  </div>
  {catalog===null&&<p className="notice">We don’t have a parts list for this exact bike yet. You can still add what’s on it and BAK will use it.</p>}
  {error&&<div className="error" role="alert">{error}</div>}
  <ul className="bp-systems">{partSystems.map(s=>{const Icon=ICON[s.key],parts=value.parts.filter(p=>p.s===s.key),stock=value.stock.includes(s.key);
   return <li key={s.key}><button className="bp-row" onClick={()=>setOpen(s.key)} aria-haspopup="dialog">
    <span className="bp-icon"><Icon size={18}/></span>
    <span className="bp-main"><b>{s.label}</b>{parts.length?<span className="bp-fitted">{parts.map(partLabel).join(' · ')}</span>:<span className="bp-hint">{s.hint}</span>}</span>
    <span className={'bp-state '+(parts.length?'changed':stock?'stock':'unknown')}>{parts.length?`${parts.length} part${parts.length>1?'s':''}`:stock?'Stock':'Not set'}</span>
    <ChevronRight size={16} className="bp-chev"/>
   </button></li>})}</ul>
  {changed&&onAsk&&<button className="text-button" onClick={()=>onAsk(`I've recorded my aftermarket parts in the Garage. Anything I should check or set up differently because of what's fitted?`)}>Ask BAK about this build <ChevronRight size={14}/></button>}
  {open&&<SystemSheet key={open} system={open} bike={bike} value={value} catalog={catalog??null} busy={busy} close={()=>setOpen(null)} save={save}/>}
 </section>;
}

function SystemSheet({system,bike,value,catalog,busy,close,save}:{system:PartSystem;bike:Bike;value:Value;catalog:CatalogPart[]|null;busy:boolean;close:()=>void;save:(v:Value)=>void}){
 const meta=partSystems.find(s=>s.key===system)!;
 const others=value.parts.filter(p=>p.s!==system);
 const [mode,setMode]=useState<'stock'|'changed'|'unknown'>(value.parts.some(p=>p.s===system)?'changed':value.stock.includes(system)?'stock':'unknown');
 const [picked,setPicked]=useState<InstalledPart[]>(value.parts.filter(p=>p.s===system));
 const [note,setNote]=useState(value.notes[system]??''),[query,setQuery]=useState(''),[brand,setBrand]=useState(''),[custom,setCustom]=useState<{b:string;n:string;p:string}|null>(null);
 const dialog=useRef<HTMLElement>(null),closeRef=useRef(close);closeRef.current=close;
 useEffect(()=>{dialog.current?.focus();const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')closeRef.current()};addEventListener('keydown',esc);document.body.classList.add('sheet-open');return()=>{removeEventListener('keydown',esc);document.body.classList.remove('sheet-open')}},[]);
 const items=useMemo(()=>(catalog??[]).filter(p=>p.system===system),[catalog,system]);
 const brands=useMemo(()=>{const c=new Map<string,number>();for(const p of items)c.set(p.brand,(c.get(p.brand)??0)+(p.r?25:1));return [...c.entries()].sort((a,b)=>b[1]-a[1]).map(([b])=>b)},[items]);
 const key=(p:{b:string;n:string;p?:string})=>(p.b+'|'+(p.p||p.n)).toLowerCase();
 const pickedKeys=new Set(picked.map(key));
 const results=useMemo(()=>{const words=query.toLowerCase().split(/\s+/).filter(Boolean),rank=new Map(brands.map((b,i)=>[b,i]));
  // each word must start a word of the brand or name, or appear in a part number
  const hit=(p:CatalogPart,w:string)=>(' '+p.brand+' '+p.name).toLowerCase().replace(/[^a-z0-9.]+/g,' ').includes(' '+w)||p.pn.toLowerCase().includes(w);
  return items.filter(p=>(!brand||p.brand===brand)&&words.every(w=>hit(p,w)))
   .sort((a,b)=>Number(!!b.r)-Number(!!a.r)||Number(b.verified)-Number(a.verified)||(rank.get(a.brand)??999)-(rank.get(b.brand)??999)||a.name.localeCompare(b.name)).slice(0,60)},[items,brands,brand,query]);
 const add=(p:InstalledPart)=>{if(picked.length+others.length>=MAX_PARTS||pickedKeys.has(key(p)))return;setPicked([...picked,p]);setMode('changed');setQuery('');setCustom(null)};
 const fromCatalog=(c:CatalogPart):InstalledPart=>({s:system,b:c.brand,n:c.name,...(c.pn?{p:c.pn.split(' ')[0]}:{}),...(c.r?{r:c.r}:{})});
 const researched=(p:InstalledPart)=>p.r?items.find(i=>i.r===p.r):undefined;
 function done(){
  const parts=[...others,...(mode==='changed'?picked:[])];
  const stock=value.stock.filter(s=>s!==system).concat(mode==='stock'?[system]:[]);
  const notes={...value.notes};if(note.trim()&&mode!=='unknown')notes[system]=note.trim();else delete notes[system];
  save({parts,stock,notes});
 }
 const shown=brands.slice(0,10);
 return <div className="sheet-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
  <section className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" tabIndex={-1} ref={dialog}>
   <header className="sheet-head"><div><span className="eyebrow">{bike.model_year} {bike.manufacturer} {bike.model}</span><h2 id="sheet-title">{meta.label}</h2></div><button className="icon-button" onClick={close} aria-label="Close"><X/></button></header>
   <div className="sheet-body">
    <div className="segmented" role="radiogroup" aria-label={`${meta.label} status`}>
     {([['stock','Stock'],['changed','Aftermarket'],['unknown','Not sure']] as const).map(([k,l])=><button key={k} role="radio" aria-checked={mode===k} className={mode===k?'on':''} onClick={()=>setMode(k)}>{l}</button>)}
    </div>
    {mode==='stock'&&<p className="subtle">BAK will use the factory setup for this system.</p>}
    {mode==='unknown'&&<p className="subtle">BAK won’t assume anything here. Set it later when you know.</p>}
    {mode==='changed'&&<>
     {picked.length>0&&<ul className="picked">{picked.map(p=>{const r=researched(p);return <li key={key(p)}>
      <div className="picked-top"><div><b>{p.b}</b> {p.n}{p.p&&<small>Part # {p.p}</small>}</div><button className="icon-button" aria-label={`Remove ${partLabel(p)}`} onClick={()=>setPicked(picked.filter(x=>key(x)!==key(p)))}><Trash2 size={16}/></button></div>
      {r&&(r.what||r.caution||r.testers.length>0)&&<div className="part-notes">
       {r.what&&<p><span>What it changes</span>{r.what}</p>}
       {r.caution&&<p className="caution"><span>Heads up</span>{r.caution}</p>}
       {r.testers.map(t=><p key={t}><span>Testers</span>{t}</p>)}
      </div>}
     </li>})}</ul>}
     {QUICK[system]&&<div className="quick-picks"><span className="eyebrow">COMMON CHANGES</span><div className="brand-chips wrap">{QUICK[system]!.map(q=>{const on=pickedKeys.has(key({b:'',n:q}));return <button key={q} className={on?'on':''} disabled={on} onClick={()=>add({s:system,b:'',n:q,x:true})}>{on?'✓ ':'+ '}{q}</button>})}</div></div>}
     <div className="picker">
      <label className="search-field"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={items.length?`Search ${meta.label.toLowerCase()} parts, brands or part numbers`:'Brand and part name'} aria-label={`Search ${meta.label} parts`}/></label>
      {shown.length>0&&<div className="brand-chips" role="group" aria-label="Filter by brand">
       <button className={!brand?'on':''} onClick={()=>setBrand('')}>All</button>
       {shown.map(b=><button key={b} className={brand===b?'on':''} onClick={()=>setBrand(brand===b?'':b)}>{b}</button>)}
       {brands.length>shown.length&&<select aria-label="More brands" value={shown.includes(brand)?'':brand} onChange={e=>setBrand(e.target.value)}><option value="">More brands</option>{brands.slice(10).sort().map(b=><option key={b}>{b}</option>)}</select>}
      </div>}
      {items.length>0&&<ul className="results">{results.map(c=>{const ip=fromCatalog(c),on=pickedKeys.has(key(ip));return <li key={c.brand+c.name+c.pn}>
       <button disabled={on} onClick={()=>add(ip)}><span className="r-main"><b>{c.brand}</b> {c.name}{c.pn&&<small>{shortPn(c.pn)}</small>}
        {c.r&&<span className={'r-tag'+(c.verified?' verified':'')}>{c.verified?<><BadgeCheck size={13}/>Maker lists this fit</>:'BAK has notes'}</span>}</span>
        <span className="r-add">{on?'Added':<Plus size={16}/>}</span></button></li>})}
       {!results.length&&<li className="subtle none">No listed part matches. Add it yourself below.</li>}</ul>}
      {!custom?<button className="text-button" onClick={()=>setCustom({b:brand,n:query,p:''})}><Plus size={14}/>{items.length?'Not listed? Add it yourself':'Add a part'}</button>:
       <div className="custom-part">
        <Labeled label="Brand"><input value={custom.b} onChange={e=>setCustom({...custom,b:e.target.value})} placeholder="e.g. FMF" maxLength={60}/></Labeled>
        <Labeled label="Part"><input value={custom.n} onChange={e=>setCustom({...custom,n:e.target.value})} placeholder="e.g. Factory 4.1 RCT titanium slip-on" maxLength={90}/></Labeled>
        <Labeled label="Part number (optional)"><input value={custom.p} onChange={e=>setCustom({...custom,p:e.target.value})} maxLength={48}/></Labeled>
        <div className="button-row"><button className="button" disabled={!custom.n.trim()&&!custom.b.trim()} onClick={()=>add({s:system,b:custom.b.trim(),n:custom.n.trim(),...(custom.p.trim()?{p:custom.p.trim()}:{}),x:true})}>Add part</button><button className="button secondary" onClick={()=>setCustom(null)}>Cancel</button></div>
       </div>}
     </div>
    </>}
    {mode!=='unknown'&&<Labeled label="Anything else BAK should know? (optional)"><textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} maxLength={280} placeholder={NOTE_HINT[system]??'Condition, settings or work done'}/></Labeled>}
   </div>
   <footer className="sheet-foot"><button className="button secondary" onClick={close}>Cancel</button><button className="button" disabled={busy||(mode==='changed'&&!picked.length)} onClick={done}>{busy?'Saving…':mode==='changed'&&!picked.length?'Add a part first':'Save'}</button></footer>
  </section>
 </div>;
}
function Labeled({label,children}:{label:string;children:ReactNode}){return <label className="field"><span>{label}</span>{children}</label>}
