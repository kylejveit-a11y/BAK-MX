import {useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {Check,ChevronLeft,ChevronRight,CircleDot,Cog,Cpu,Disc,Disc3,Flame,Frame,Hand,Layers,Link as LinkIcon,MoveVertical,Plus,Search,Shield,Trash2,Wind,X} from 'lucide-react';
import type {Bike} from '../shared/types';
import {partSystems,readInstalled,writeInstalled,partLabel,MAX_PARTS,type InstalledPart,type PartSystem} from '../shared/installed-parts';
import {partsForBike,type CatalogPart} from './partsCatalog';
import {api} from './client';
import {NOTE_HINT,WORK,providersFor,cleanName,pickerChoices,typesWithCounts,choicesOfType,brandsIn,productsOf,type Work,type PartColor} from '../shared/parts-picker';
import {fuelSystem,fuelSystemLabel} from '../shared/fuel-system';

const ICON:Record<PartSystem,typeof Flame>={exhaust:Flame,suspension:MoveVertical,engine:Cog,clutch:Disc,tuning:Cpu,intake:Wind,gearing:LinkIcon,brakes:Disc3,controls:Hand,chassis:Frame,wheels:CircleDot,protection:Shield,body:Layers};
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

type Screen={id:'home'}|{id:'type'}|{id:'work';work:Work}|{id:'detail';work:Work;who:string;r?:string}|{id:'brand';type:string|null}|{id:'product';type:string|null;brand:string}|{id:'custom';brand:string;type:string|null}|{id:'color';ip:InstalledPart;colors:PartColor[]};

function SystemSheet({system,bike,value,catalog,busy,close,save}:{system:PartSystem;bike:Bike;value:Value;catalog:CatalogPart[]|null;busy:boolean;close:()=>void;save:(v:Value)=>void}){
 const meta=partSystems.find(s=>s.key===system)!,fuel=fuelSystem(bike.manufacturer,bike.model,bike.model_year);
 const others=value.parts.filter(p=>p.s!==system);
 const [mode,setMode]=useState<'stock'|'changed'|'unknown'>(value.parts.some(p=>p.s===system)?'changed':value.stock.includes(system)?'stock':'unknown');
 const [picked,setPicked]=useState<InstalledPart[]>(value.parts.filter(p=>p.s===system));
 const [note,setNote]=useState(value.notes[system]??''),[query,setQuery]=useState(''),[stack,setStack]=useState<Screen[]>([{id:'home'}]),[custom,setCustom]=useState({b:'',n:'',p:''});
 const screen=stack[stack.length-1],push=(s:Screen)=>{setQuery('');setStack([...stack,s])},back=()=>{setQuery('');setStack(stack.slice(0,-1))};
 const dialog=useRef<HTMLElement>(null),closeRef=useRef(close);closeRef.current=close;
 useEffect(()=>{dialog.current?.focus();const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')closeRef.current()};addEventListener('keydown',esc);document.body.classList.add('sheet-open');return()=>{removeEventListener('keydown',esc);document.body.classList.remove('sheet-open')}},[]);
 useEffect(()=>{dialog.current?.querySelector('.sheet-body')?.scrollTo(0,0)},[stack.length]);
 // the listed parts for this bike and system, one row per brand and name, with small service parts kept out
 const choices=useMemo(()=>pickerChoices(catalog,system,fuel),[catalog,system,fuel]);
 const types=typesWithCounts(choices,system,!!catalog);
 const firstStep=():Screen=>types.length||WORK[system]?{id:'type'}:{id:'brand',type:null};
 const [detail,setDetail]=useState('');
 const inType=(type:string|null)=>choicesOfType(choices,type);
 const brandsFor=(type:string|null)=>brandsIn(inType(type));
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
 const title=screen.id==='home'?meta.label:screen.id==='type'?'What did you change?':screen.id==='work'?'Who did it?':screen.id==='detail'?screen.work.label:screen.id==='brand'?'Which brand?':screen.id==='product'?screen.brand:screen.id==='color'?'Which color?':'Add it yourself';
 const sub=screen.id==='home'?meta.hint:screen.id==='brand'?(screen.type??'Any '+meta.label.toLowerCase()+' part'):screen.id==='product'?(screen.type??meta.label):screen.id==='color'?cleanName(screen.ip.b,screen.ip.n):screen.id==='type'?`${bike.model_year} ${bike.manufacturer} ${bike.model}`:screen.id==='work'?screen.work.label:screen.id==='detail'?(screen.who||'Who did it not recorded'):'';
 const Row=({label,detail,onClick,tag,chev=true,selected=false}:{label:ReactNode;detail?:ReactNode;onClick:()=>void;tag?:ReactNode;chev?:boolean;selected?:boolean})=>
  <li><button className={'nav-row'+(selected?' selected':'')} onClick={onClick}><span className="nav-main">{label}{tag}</span>{detail!==undefined&&<span className="nav-detail">{detail}</span>}{selected?<Check size={18} className="nav-check"/>:chev&&<ChevronRight size={18} className="nav-chev"/>}</button></li>;
 const workList=WORK[system]?<><h3 className="nav-section">WORK DONE</h3><ul className="nav-list">{WORK[system]!.map(w=><Row key={w.label} label={<b>{w.label}</b>} detail={w.kind?'Who did it?':undefined} onClick={()=>push({id:'work',work:w})}/>)}</ul></>:null;
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
      <Row label={<><b>Changed</b><small>Aftermarket parts or work</small></>} selected={mode==='changed'} chev={!picked.length&&mode!=='changed'} onClick={()=>{setMode('changed');if(!picked.length)push(firstStep());}}/>
      <Row label={<><b>Not sure</b><small>BAK won’t assume anything here</small></>} selected={mode==='unknown'} chev={false} onClick={()=>setMode('unknown')}/>
     </ul>
     {mode==='changed'&&<>
      <h3 className="nav-section">ON YOUR BIKE</h3>
      <ul className="nav-list">
       {picked.map(p=>{const r=notesFor(p),k=key(p),has=!!(r&&(r.what||r.caution||r.testers.length))||!!p.p;return <li key={k} className="fitted">
        <div className="fitted-top"><span className="nav-main"><small className="fitted-brand">{p.b||'Brand not set'}</small><b>{cleanName(p.b,p.n)}</b>{(p.k||p.d)&&<small>{[p.k,p.d].filter(Boolean).join(' · ')}</small>}</span><button className="fitted-remove" onClick={()=>setPicked(picked.filter(x=>key(x)!==k))} aria-label={`Remove ${partLabel(p)}`}>Remove</button></div>
        {has&&<details className="part-notes"><summary>{r&&(r.what||r.caution)?'What this part changes':'Details'}</summary>
         {r?.what&&<p><span>What it changes</span>{r.what}</p>}{r?.caution&&<p className="caution"><span>Heads up</span>{r.caution}</p>}{r?.testers.slice(0,1).map(x=><p key={x}><span>Testers found</span>{x}</p>)}{p.p&&<p><span>Part number</span>{p.p}</p>}
        </details>}
       </li>})}
       <Row label={<span className="nav-add"><Plus size={17}/>Add a part</span>} onClick={()=>push(firstStep())}/>
      </ul></>}
     {mode!=='unknown'&&<label className="field nav-note"><span>Anything else BAK should know? (optional)</span><textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} maxLength={280} placeholder={NOTE_HINT[system]??'Condition, settings or work done'}/></label>}
    </>}
    {screen.id==='type'&&system==='tuning'&&workList}
    {screen.id==='type'&&system==='tuning'&&fuel&&<p className="legend">Your {bike.model} is {fuelSystemLabel(fuel)}, so {fuel==='injected'?'carburetor and jetting':'fuel-injection'} parts are hidden.</p>}
    {screen.id==='type'&&(types.length>0||system!=='tuning')&&<>{system==='tuning'&&<h3 className="nav-section">PARTS</h3>}<ul className="nav-list">
     {types.map(t=><Row key={t.label} label={<b>{t.label}</b>} detail={t.count||undefined} onClick={()=>push({id:'brand',type:t.label})}/>)}
     <Row label={<b>Something else</b>} onClick={()=>push({id:'brand',type:null})}/>
    </ul></>}
    {screen.id==='type'&&system!=='tuning'&&workList}
    {screen.id==='work'&&(()=>{const w=screen.work,shops=w.kind?providersFor(w.kind,bike.manufacturer,bike.model):[],go=(who:string,r?:string)=>{setDetail('');push({id:'detail',work:w,who,...(r?{r}:{})})};return <>
     {shops.length>0&&<><h3 className="nav-section">{w.kind==='ecu'?'TUNERS':'SUSPENSION SHOPS'}</h3><ul className="nav-list">
      {shops.map(p=><Row key={p.id} label={<><b>{p.brand}</b><small>{p.label}</small></>} onClick={()=>go(p.brand,p.exact?p.id:undefined)}/>)}</ul></>}
     <ul className="nav-list">
      <Row label={<b>Someone else</b>} detail="Type it" onClick={()=>{setCustom({b:'',n:w.label,p:''});push({id:'custom',brand:'',type:w.label})}}/>
      <Row label={<b>{w.kind==='ecu'?'My dealer':'My dealer or local shop'}</b>} onClick={()=>go(w.kind==='ecu'?'Dealer':'Local shop')}/>
      <Row label={<b>I did it myself</b>} onClick={()=>go('Myself')}/>
      <Row label={<b>Not sure who</b>} onClick={()=>go('')}/>
     </ul></>})()}
    {screen.id==='detail'&&<div className="nav-form">
     <Labeled label={`${screen.work.detail} (optional)`}><textarea autoFocus rows={2} value={detail} onChange={e=>setDetail(e.target.value)} placeholder={screen.work.example} maxLength={120}/></Labeled>
     <button className="button" onClick={()=>add({s:system,b:screen.who==='Myself'?'':screen.who,n:screen.work.label+(screen.who==='Myself'?' (myself)':''),...(detail.trim()?{d:detail.trim()}:{}),...(screen.r?{r:screen.r}:{x:true})})}>Add to my bike</button>
    </div>}
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
    {screen.id==='color'&&<ul className="nav-list">
     {screen.colors.map(c=><Row key={c.name} label={<b>{c.name}</b>} detail={c.finish&&c.finish!=='stock'?c.finish:undefined} chev={false} onClick={()=>add({...screen.ip,k:c.name})}/>)}
     <Row label={<b>Not sure</b>} detail="Add without a color" chev={false} onClick={()=>add(screen.ip)}/>
    </ul>}
    {screen.id==='product'&&(()=>{const all=productsOf(inType(screen.type),screen.brand),list=all.filter(c=>match(c.name+' '+c.pn));return <>
     {all.length>8&&search(`Search ${screen.brand}`)}
     <ul className="nav-list">
      {list.map(c=>{const ip:InstalledPart={s:system,b:c.brand,n:c.name,...(c.pn?{p:c.pn}:{}),...(c.r?{r:c.r}:{})},on=pickedKeys.has(key(ip)),cols=c.colors??[];return <Row key={c.name+c.pn} selected={on}
       label={<b>{c.name}</b>} detail={cols.length>1?`${cols.length} colors`:undefined} chev={cols.length>1} onClick={()=>cols.length>1&&!on?push({id:'color',ip,colors:cols}):add(cols.length===1?{...ip,k:cols[0].name}:ip)}/>})}
      {!list.length&&<li className="nav-empty">Nothing listed matches.</li>}
     </ul>
     <ul className="nav-list"><Row label={<b>Not listed?</b>} detail="Type it" onClick={()=>{setCustom({b:screen.brand,n:query,p:''});push({id:'custom',brand:screen.brand,type:screen.type})}}/></ul></>})()}
    {screen.id==='custom'&&<div className="nav-form">
     <Labeled label={WORK[system]?.some(w=>w.label===custom.n)?'Who did the work? (shop or tuner)':'Brand'}><input autoFocus={WORK[system]?.some(w=>w.label===custom.n)} value={custom.b} onChange={e=>setCustom({...custom,b:e.target.value})} placeholder={WORK[system]?.some(w=>w.label===custom.n)?'e.g. the shop’s name':'e.g. FMF'} maxLength={60}/></Labeled>
     <Labeled label={WORK[system]?.some(w=>w.label===custom.n)?'Work done':'Part'}><input autoFocus={!WORK[system]?.some(w=>w.label===custom.n)} value={custom.n} onChange={e=>setCustom({...custom,n:e.target.value})} placeholder="e.g. Factory 4.1 RCT titanium slip-on" maxLength={90}/></Labeled>
     <Labeled label="Part number (optional)"><input value={custom.p} onChange={e=>setCustom({...custom,p:e.target.value})} maxLength={48}/></Labeled>
     <button className="button" disabled={!custom.n.trim()&&!custom.b.trim()} onClick={()=>add({s:system,b:custom.b.trim(),n:custom.n.trim(),...(custom.p.trim()?{p:custom.p.trim()}:{}),x:true})}>Add to my bike</button>
    </div>}
   </div>
   {screen.id==='home'&&<footer className="sheet-foot"><button className="button" disabled={busy||(mode==='changed'&&!picked.length)} onClick={done}>{busy?'Saving…':mode==='changed'&&!picked.length?'Add a part first':'Save'}</button></footer>}
  </section>
 </div>;
}
function Labeled({label,children}:{label:string;children:ReactNode}){return <label className="field"><span>{label}</span>{children}</label>}
