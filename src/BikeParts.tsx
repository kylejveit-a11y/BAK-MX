import {useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {BadgeCheck,Check,ChevronLeft,ChevronRight,CircleDot,Cog,Cpu,Disc,Disc3,Flame,Frame,Hand,Layers,Link as LinkIcon,MoveVertical,Plus,Search,Shield,Trash2,Wind,X} from 'lucide-react';
import type {Bike} from '../shared/types';
import {partSystems,readInstalled,writeInstalled,partLabel,MAX_PARTS,type InstalledPart,type PartSystem} from '../shared/installed-parts';
import {partsForBike,type CatalogPart} from './partsCatalog';
import {api} from './client';
import {partTypes,typeOf} from './partTypes';

const ICON:Record<PartSystem,typeof Flame>={exhaust:Flame,suspension:MoveVertical,engine:Cog,clutch:Disc,tuning:Cpu,intake:Wind,gearing:LinkIcon,brakes:Disc3,controls:Hand,chassis:Frame,wheels:CircleDot,protection:Shield,body:Layers};
const NOTE_HINT:Partial<Record<PartSystem,string>>={suspension:'Who revalved it, spring rates, oil height, anything non-stock inside',exhaust:'Insert in or out, spark arrester, packing age',tuning:'Map name or tuner, fuel used',gearing:'Exact sprocket sizes if not listed above',engine:'Hours on the top end, compression, other work',wheels:'Tire model and pressures you run'};
type Value=ReturnType<typeof readInstalled>;
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
   <div><span className="eyebrow">BUILD SHEET</span><h2 id="bike-parts-title">What’s on your {bike.model}?</h2>
    <p className="bp-lede">Tap each part of the bike and tell BAK if it’s <b>stock</b> (came from the factory) or <b>changed</b> (aftermarket parts or work). BAK uses this in every answer.</p></div>
  </div>
  <div className="bp-meter" aria-label={`${recorded} of ${partSystems.length} set`}><div><i style={{width:`${100*recorded/partSystems.length}%`}}/></div><span><b>{recorded} of {partSystems.length}</b> set</span></div>
  {catalog===null&&<p className="notice">We don’t have a parts list for this exact bike yet. You can still add what’s on it and BAK will use it.</p>}
  {error&&<div className="error" role="alert">{error}</div>}
  <ul className="bp-systems">{partSystems.map(s=>{const Icon=ICON[s.key],parts=value.parts.filter(p=>p.s===s.key),stock=value.stock.includes(s.key);
   return <li key={s.key}><button className="bp-row" onClick={()=>setOpen(s.key)} aria-haspopup="dialog">
    <span className="bp-icon"><Icon size={18}/></span>
    <span className="bp-main"><b>{s.label}</b>{parts.length?<span className="bp-fitted">{parts.map(partLabel).join(' · ')}</span>:<span className="bp-hint">{s.hint}</span>}</span>
    <span className={'bp-state '+(parts.length?'changed':stock?'stock':'unknown')}>{parts.length?<>Changed · {parts.length}</>:stock?<><Check size={13}/>Stock</>:'Tap to set'}</span>
    <ChevronRight size={16} className="bp-chev"/>
   </button></li>})}</ul>
  {changed&&onAsk&&<button className="text-button" onClick={()=>onAsk(`I've recorded my aftermarket parts in the Garage. Anything I should check or set up differently because of what's fitted?`)}>Ask BAK about this build <ChevronRight size={14}/></button>}
  {open&&<SystemSheet key={open} system={open} bike={bike} value={value} catalog={catalog??null} busy={busy} close={()=>setOpen(null)} save={save}/>}
 </section>;
}

const OEM=/^(ktm|ktm powerparts|husqvarna|husqvarna technical accessories|gasgas|gas gas|gasgas technical accessories|yamaha|yamaha gytr|yamaha genuine accessories|gytr|honda|hrc|kawasaki|triumph|triumph genuine accessories)$/i;
const MAKERS=['Akrapovič','FMF','Pro Circuit','Yoshimura','Rekluse','Hinson','WP','Xtrig','Renthal','Acerbis','Polisport','Brembo','Galfer','Twin Air','Neken','Hebo','Moto-Master','Factory Effex','Tusk','Moose Racing','Cycra'];
/** One name per brand: Akrapovič sold through KTM is Akrapovič; an FMF muffler sold by KTM is FMF. */
function brandOf(c:CatalogPart){
 if(/akrapovi/i.test(c.brand+' '+c.name))return 'Akrapovič';
 if(OEM.test(c.brand.trim())){const m=MAKERS.find(x=>new RegExp('\\b'+x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i').test(c.name));if(m)return m;return /^ktm/i.test(c.brand)?'KTM PowerParts':c.brand;}
 return c.brand.replace(/\s*\(.*\)$/,'');
}
/** The part name without its brand and the fitment the shop pasted into it ("450/500 2023-2026", "350/450 SX-F/XC-F"). */
function cleanName(brand:string,name:string){
 let n=name;
 for(const w of [brand,'Akrapovič','Akrapovic','KTM PowerParts','KTM'])if(n.toLowerCase().startsWith(w.toLowerCase()+' '))n=n.slice(w.length+1);
 n=n.replace(/"/g,'').replace(/\b(19|20)\d{2}\s*-\s*(19|20)?\d{2}\b/g,'').replace(/\b\d{2}-\d{2}\b/g,'')
  .replace(/\b\d{2,3}(\/\d{2,3})+\b/g,'').replace(/\b(SX-?F|XC-?F|XCF-W|EXC-?F|SMR|SX|XC|MX\/Enduro)(\/(SX-?F|XC-?F|XCF-W|EXC-?F|SMR|SX|XC))*\b/gi,'')
  .replace(/\s*,\s*(?=,|$)/g,'').replace(/\s{2,}/g,' ').replace(/[\s,\-/]+$/,'').trim();
 return n||name;
}
/** Work that isn't a boxed part; picking one asks who did it. */
const WORK:Partial<Record<PartSystem,string[]>>={suspension:['Fork revalved','Shock revalved','Fork serviced','Shock serviced'],engine:['Ported head','Rebuilt top end','Rebuilt bottom end'],tuning:['ECU remapped'],clutch:['Clutch rebuilt']};
type Choice={brand:string;name:string;pn:string;r?:string;verified:boolean;what:string;caution:string;testers:string[];type:string|null};
type Screen={id:'home'}|{id:'type'}|{id:'brand';type:string|null}|{id:'product';type:string|null;brand:string}|{id:'custom';brand:string;type:string|null};

function SystemSheet({system,bike,value,catalog,busy,close,save}:{system:PartSystem;bike:Bike;value:Value;catalog:CatalogPart[]|null;busy:boolean;close:()=>void;save:(v:Value)=>void}){
 const meta=partSystems.find(s=>s.key===system)!;
 const others=value.parts.filter(p=>p.s!==system);
 const [mode,setMode]=useState<'stock'|'changed'|'unknown'>(value.parts.some(p=>p.s===system)?'changed':value.stock.includes(system)?'stock':'unknown');
 const [picked,setPicked]=useState<InstalledPart[]>(value.parts.filter(p=>p.s===system));
 const [note,setNote]=useState(value.notes[system]??''),[query,setQuery]=useState(''),[stack,setStack]=useState<Screen[]>([{id:'home'}]),[custom,setCustom]=useState({b:'',n:'',p:''});
 const screen=stack[stack.length-1],push=(s:Screen)=>{setQuery('');setStack([...stack,s])},back=()=>{setQuery('');setStack(stack.slice(0,-1))};
 const dialog=useRef<HTMLElement>(null),closeRef=useRef(close);closeRef.current=close;
 useEffect(()=>{dialog.current?.focus();const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')closeRef.current()};addEventListener('keydown',esc);document.body.classList.add('sheet-open');return()=>{removeEventListener('keydown',esc);document.body.classList.remove('sheet-open')}},[]);
 useEffect(()=>{dialog.current?.querySelector('.sheet-body')?.scrollTo(0,0)},[stack.length]);
 // the listed parts for this bike and system, one row per brand and name, with small service parts kept out
 const choices=useMemo(()=>{const m=new Map<string,Choice>();
  for(const c of catalog??[]){if(c.system!==system)continue;const brand=brandOf(c),name=cleanName(brand,c.name),type=typeOf(system,c.name);
   const k=(brand+'|'+name).toLowerCase(),prev=m.get(k);
   if(!prev)m.set(k,{brand,name,pn:c.pn.split(/[\s,]+/)[0]??'',r:c.r,verified:c.verified,what:c.what,caution:c.caution,testers:c.testers,type});
   else if(c.r&&!prev.r)m.set(k,{...prev,r:c.r,verified:c.verified,what:c.what,caution:c.caution,testers:c.testers});}
  return [...m.values()];},[catalog,system]);
 const main=choices.filter(c=>c.type||c.r);
 const types=(partTypes[system]??[]).map(t=>({label:t.label,count:main.filter(c=>c.type===t.label).length})).filter(t=>t.count>0||!catalog);
 const inType=(type:string|null)=>type?main.filter(c=>c.type===type):choices;
 const brandsFor=(type:string|null)=>{const m=new Map<string,{n:number;r:number}>();for(const c of inType(type)){const v=m.get(c.brand)??{n:0,r:0};v.n++;if(c.r)v.r++;m.set(c.brand,v)}
  return [...m.entries()].sort((a,b)=>b[1].r-a[1].r||b[1].n-a[1].n||a[0].localeCompare(b[0]))};
 const key=(p:{b:string;n:string;p?:string})=>(p.b+'|'+(p.p||p.n)).toLowerCase();
 const pickedKeys=new Set(picked.map(key));
 const add=(p:InstalledPart)=>{if(picked.length+others.length>=MAX_PARTS||pickedKeys.has(key(p))){setStack([{id:'home'}]);return;}setPicked([...picked,p]);setMode('changed');setQuery('');setStack([{id:'home'}]);};
 const notesFor=(p:InstalledPart)=>p.r?choices.find(c=>c.r===p.r):undefined;
 const match=(text:string)=>query.trim().toLowerCase().split(/\s+/).every(w=>text.toLowerCase().includes(w));
 function done(){
  const parts=[...others,...(mode==='changed'?picked:[])];
  const stock=value.stock.filter(s=>s!==system).concat(mode==='stock'?[system]:[]);
  const notes={...value.notes};if(note.trim()&&mode!=='unknown')notes[system]=note.trim();else delete notes[system];
  save({parts,stock,notes});
 }
 const title=screen.id==='home'?meta.label:screen.id==='type'?'What did you change?':screen.id==='brand'?'Which brand?':screen.id==='product'?screen.brand:'Add it yourself';
 const sub=screen.id==='home'?meta.hint:screen.id==='brand'?(screen.type??'Any '+meta.label.toLowerCase()+' part'):screen.id==='product'?(screen.type??meta.label):screen.id==='type'?`${bike.model_year} ${bike.manufacturer} ${bike.model}`:'';
 const Row=({label,detail,onClick,tag,chev=true,selected=false}:{label:ReactNode;detail?:ReactNode;onClick:()=>void;tag?:ReactNode;chev?:boolean;selected?:boolean})=>
  <li><button className={'nav-row'+(selected?' selected':'')} onClick={onClick}><span className="nav-main">{label}{tag}</span>{detail!==undefined&&<span className="nav-detail">{detail}</span>}{selected?<Check size={18} className="nav-check"/>:chev&&<ChevronRight size={18} className="nav-chev"/>}</button></li>;
 const search=(placeholder:string)=><label className="search-field nav-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={placeholder} aria-label={placeholder}/></label>;
 return <div className="sheet-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
  <section className="sheet nav-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" tabIndex={-1} ref={dialog}>
   <header className="nav-bar">
    {stack.length>1?<button className="nav-back" onClick={back}><ChevronLeft size={20}/>Back</button>:<span/>}
    <button className="nav-close" onClick={close} aria-label="Close"><X size={18}/></button>
   </header>
   <div className="sheet-body">
    <h2 id="sheet-title" className="nav-title">{title}</h2>{sub&&<p className="nav-sub">{sub}</p>}
    {screen.id==='home'&&<>
     <ul className="nav-list">
      <Row label={<><b>Stock</b><small>Factory parts and setup</small></>} selected={mode==='stock'} chev={false} onClick={()=>setMode('stock')}/>
      <Row label={<><b>Changed</b><small>Aftermarket parts or work</small></>} selected={mode==='changed'} chev={!picked.length&&mode!=='changed'} onClick={()=>{setMode('changed');if(!picked.length)push(types.length?{id:'type'}:{id:'brand',type:null});}}/>
      <Row label={<><b>Not sure</b><small>BAK won’t assume anything here</small></>} selected={mode==='unknown'} chev={false} onClick={()=>setMode('unknown')}/>
     </ul>
     {mode==='changed'&&<>
      <h3 className="nav-section">ON YOUR BIKE</h3>
      <ul className="nav-list">
       {picked.map(p=>{const r=notesFor(p);return <li key={key(p)} className="fitted">
        <div className="fitted-top"><span className="nav-main"><b>{[p.b,p.n].filter(Boolean).join(' ')}</b>{p.p&&<small>Part # {p.p}</small>}</span><button className="fitted-remove" onClick={()=>setPicked(picked.filter(x=>key(x)!==key(p)))} aria-label={`Remove ${partLabel(p)}`}>Remove</button></div>
        {r&&(r.what||r.caution)&&<div className="part-notes">{r.what&&<p><span>What it changes</span>{r.what}</p>}{r.caution&&<p className="caution"><span>Heads up</span>{r.caution}</p>}{r.testers.slice(0,1).map(x=><p key={x}><span>Testers found</span>{x}</p>)}</div>}
       </li>})}
       <Row label={<span className="nav-add"><Plus size={17}/>Add a part</span>} onClick={()=>push(types.length?{id:'type'}:{id:'brand',type:null})}/>
      </ul></>}
     {mode!=='unknown'&&<label className="field nav-note"><span>Anything else BAK should know? (optional)</span><textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} maxLength={280} placeholder={NOTE_HINT[system]??'Condition, settings or work done'}/></label>}
    </>}
    {screen.id==='type'&&<ul className="nav-list">
     {types.map(t=><Row key={t.label} label={<b>{t.label}</b>} detail={t.count||undefined} onClick={()=>push({id:'brand',type:t.label})}/>)}
     <Row label={<b>Something else</b>} onClick={()=>push({id:'brand',type:null})}/>
    </ul>}
    {screen.id==='type'&&WORK[system]&&<><h3 className="nav-section">WORK DONE</h3><ul className="nav-list">{WORK[system]!.map(w=><Row key={w} label={<b>{w}</b>} detail="Who did it?" onClick={()=>{setCustom({b:'',n:w,p:''});push({id:'custom',brand:'',type:w})}}/>)}</ul></>}
    {screen.id==='brand'&&(()=>{const list=brandsFor(screen.type).filter(([b])=>match(b));return <>
     {brandsFor(screen.type).length>8&&search('Search brands')}
     <ul className="nav-list">
      {list.map(([b,v])=><Row key={b} label={<b>{b}</b>} detail={v.n} onClick={()=>push({id:'product',type:screen.type,brand:b})}/>)}
      {!list.length&&<li className="nav-empty">No listed brand matches.</li>}
     </ul>
     <ul className="nav-list">
      <Row label={<b>Another brand</b>} detail="Type it" onClick={()=>{setCustom({b:query,n:screen.type??'',p:''});push({id:'custom',brand:query,type:screen.type})}}/>
      {screen.type&&<Row label={<b>I don’t know the brand</b>} detail={`Add as “${screen.type}”`} chev={false} onClick={()=>add({s:system,b:'',n:screen.type!,x:true})}/>}
     </ul></>})()}
    {screen.id==='product'&&(()=>{const all=inType(screen.type).filter(c=>c.brand===screen.brand),list=all.filter(c=>match(c.name+' '+c.pn)).sort((a,b)=>Number(!!b.r)-Number(!!a.r)||Number(b.verified)-Number(a.verified)||a.name.localeCompare(b.name));return <>
     {all.length>8&&search(`Search ${screen.brand}`)}
     <ul className="nav-list">
      {list.map(c=>{const ip:InstalledPart={s:system,b:c.brand,n:c.name,...(c.pn?{p:c.pn}:{}),...(c.r?{r:c.r}:{})},on=pickedKeys.has(key(ip));return <Row key={c.name+c.pn} selected={on}
       label={<><b>{c.name}</b>{c.pn&&<small>Part # {c.pn}</small>}</>}
       tag={c.r?<span className={'r-tag'+(c.verified?' verified':'')}>{c.verified?<><BadgeCheck size={13}/>Confirmed fit</>:'BAK knows it'}</span>:undefined}
       chev={false} onClick={()=>add(ip)}/>})}
      {!list.length&&<li className="nav-empty">Nothing listed matches.</li>}
     </ul>
     {list.some(c=>c.r)&&<p className="legend"><b>Confirmed fit</b>: the part maker lists your bike. <b>BAK knows it</b>: BAK has notes on what it changes.</p>}
     <ul className="nav-list"><Row label={<b>Not listed?</b>} detail="Type it" onClick={()=>{setCustom({b:screen.brand,n:query,p:''});push({id:'custom',brand:screen.brand,type:screen.type})}}/></ul></>})()}
    {screen.id==='custom'&&<div className="nav-form">
     <Labeled label={WORK[system]?.includes(custom.n)?'Who did the work? (shop or tuner, optional)':'Brand'}><input value={custom.b} onChange={e=>setCustom({...custom,b:e.target.value})} placeholder="e.g. FMF" maxLength={60}/></Labeled>
     <Labeled label="Part"><input autoFocus value={custom.n} onChange={e=>setCustom({...custom,n:e.target.value})} placeholder="e.g. Factory 4.1 RCT titanium slip-on" maxLength={90}/></Labeled>
     <Labeled label="Part number (optional)"><input value={custom.p} onChange={e=>setCustom({...custom,p:e.target.value})} maxLength={48}/></Labeled>
     <button className="button" disabled={!custom.n.trim()&&!custom.b.trim()} onClick={()=>add({s:system,b:custom.b.trim(),n:custom.n.trim(),...(custom.p.trim()?{p:custom.p.trim()}:{}),x:true})}>Add to my bike</button>
    </div>}
   </div>
   {screen.id==='home'&&<footer className="sheet-foot"><button className="button" disabled={busy||(mode==='changed'&&!picked.length)} onClick={done}>{busy?'Saving…':mode==='changed'&&!picked.length?'Add a part first':'Save'}</button></footer>}
  </section>
 </div>;
}
function Labeled({label,children}:{label:string;children:ReactNode}){return <label className="field"><span>{label}</span>{children}</label>}
