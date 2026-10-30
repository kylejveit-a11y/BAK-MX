// The build sheet as a finished document on the web: a header plate for the bike, a short summary, then each area of the bike
// with what's fitted, set out like a team's spec sheet. Printable; Share or Copy hands the sheet on as plain text.
// Reads the same sheet the server hands out (/build-sheet) and falls back to the bike record when that is not reachable.
import {useEffect,useMemo,useState} from 'react';
import {Copy,Printer,Share2} from 'lucide-react';
import type {Bike} from '../shared/types';
import {partSystems,readInstalled,type PartSystem} from '../shared/installed-parts';
import {checkBuild} from '../shared/build-check';
import {canonBrand,cleanName} from '../shared/parts-picker';
import {api} from './client';
import './rider-extras.css';

export type SheetPart={brand:string;name:string;size?:string;color?:string;detail?:string;off?:boolean};
export type SheetData={title:string;subtitle?:string;raceNumber?:string;hours?:number|null;updated?:string;parts:(SheetPart&{system:PartSystem})[];stock:PartSystem[];checks?:string[]};
type ServerSheet={parts:{system:PartSystem;brand:string;part:string;size:string;color:string;detail:string;off_bike:boolean}[];stock:PartSystem[]};
type Sharing={show_on_profile:boolean;build_sheet_public:boolean;photo_ids:string[]};

/** The bike's areas, grouped the way a mechanic walks it. */
const GROUPS:{label:string;systems:PartSystem[]}[]=[
 {label:'Suspension & chassis',systems:['suspension','chassis']},
 {label:'Engine',systems:['engine','intake','exhaust','tuning','clutch']},
 {label:'Drive, brakes & wheels',systems:['gearing','brakes','wheels']},
 {label:'Cockpit & protection',systems:['controls','protection','body']},
];
const label=(k:PartSystem)=>partSystems.find(s=>s.key===k)?.label??k;
const isSystem=(k:string):k is PartSystem=>partSystems.some(s=>s.key===k);

/** The sheet from the bike record alone, the same way the phone app builds it. */
export function sheetFromBike(bike:Bike,raceNumber?:string):SheetData{
 const {parts,stock}=readInstalled(bike.configuration);
 return {title:`${bike.model_year} ${bike.manufacturer} ${bike.model}`,subtitle:bike.nickname||undefined,raceNumber,hours:bike.engine_hours,updated:bike.updated_at,
  parts:parts.map(p=>({system:p.s,brand:canonBrand(p.b),name:cleanName(p.b,p.n),size:p.v,color:p.k,detail:p.d,off:p.o})),stock,checks:checkBuild(bike).map(c=>c.text)};
}
/** The sheet as plain text, for Share and Copy. Parts and stock areas only: never settings, notes or rider details. */
export function sheetText(data:SheetData):string{
 const on=data.parts.filter(p=>!p.off),spares=data.parts.filter(p=>p.off),modified=new Set(on.map(p=>p.system)),stock=data.stock.filter(s=>!modified.has(s));
 const line=(p:SheetPart)=>'  - '+[p.brand,p.name].filter(Boolean).join(' ')+([p.size,p.color].filter(Boolean).length?` (${[p.size,p.color].filter(Boolean).join(', ')})`:'')+(p.detail?` — ${p.detail}`:'');
 const out=[`${data.title}${data.subtitle?` · ${data.subtitle}`:''}`,'Build sheet · BAK MX',''];
 for(const g of GROUPS){const rows=g.systems.filter(k=>modified.has(k)||stock.includes(k));if(!rows.length)continue;out.push(g.label.toUpperCase());for(const k of rows){const parts=on.filter(p=>p.system===k);out.push(parts.length?`${label(k)}:`:`${label(k)}: stock`);for(const p of parts)out.push(line(p));}out.push('');}
 if(spares.length){out.push('OFF THE BIKE · SPARES AND SWAPS');for(const p of spares)out.push(line(p)+` [${label(p.system)}]`);out.push('');}
 return out.join('\n').trim();
}

/** Garage › Build sheet, for the rider's own bike: loads the sheet, the race plate and whether it is public, then lays it out. */
export function BuildSheetDoc({bike,signedIn=true,onSignIn,onEdit}:{bike?:Bike;signedIn?:boolean;onSignIn?:()=>void;onEdit?:()=>void}){
 const [server,setServer]=useState<ServerSheet|null|undefined>(undefined),[plate,setPlate]=useState(''),[sharing,setSharing]=useState<Sharing|null>(null),[notice,setNotice]=useState('');
 useEffect(()=>{let live=true;setServer(undefined);setSharing(null);if(!signedIn||!bike)return;
  api<ServerSheet>('/build-sheet?bike_id='+bike.id).then(s=>{if(live)setServer(s);}).catch(()=>{if(live)setServer(null);});
  api<{race_number?:string}|null>('/profile').then(p=>{if(live)setPlate(p?.race_number??'');}).catch(()=>{});
  api<Sharing>('/garage-sharing?bike_id='+bike.id).then(s=>{if(live)setSharing(s);}).catch(()=>{});
  return()=>{live=false;};},[signedIn,bike?.id,bike?.updated_at]);
 const data=useMemo<SheetData|null>(()=>{if(!bike)return null;const local=sheetFromBike(bike,plate||undefined);
  if(!server)return local;
  return {...local,parts:server.parts.filter(p=>isSystem(p.system)).map(p=>({system:p.system,brand:p.brand,name:p.part,size:p.size||undefined,color:p.color||undefined,detail:p.detail||undefined,off:p.off_bike})),stock:server.stock.filter(isSystem)};},[bike,server,plate]);
 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),3000);return()=>clearTimeout(t);},[notice]);
 if(!signedIn)return <section className="panel"><div className="rx-prompt"><p className="rx-copy">Sign in to see your build sheet.</p>{onSignIn&&<button className="button" onClick={onSignIn}>Sign in</button>}</div></section>;
 if(!bike||!data)return <section className="panel"><p className="rx-copy">Add a bike first. The build sheet lists what is fitted to it, area by area.</p></section>;
 const text=sheetText(data),canShare=typeof navigator!=='undefined'&&typeof navigator.share==='function';
 async function share(){try{await navigator.share({title:`${data!.title} · build sheet`,text});}catch(e){if(!(e instanceof DOMException&&e.name==='AbortError'))setNotice('Sharing is not available here. Copy the sheet instead.');}}
 async function copy(){try{await navigator.clipboard.writeText(text);setNotice('Build sheet copied.');}catch{setNotice('Could not copy on this browser. Select the sheet and copy it by hand.');}}
 return <section className="panel rx-panel-gap">
  <SheetLayout data={data} mine/>
  {server===undefined&&<p className="rx-note">Checking the saved sheet…</p>}
  {notice&&<p className="notice" role="status">{notice}</p>}
  <div className="rx-doc-actions">
   {onEdit&&<button type="button" className="button" onClick={onEdit}>Edit build sheet</button>}
   {canShare&&<button type="button" className="button secondary" onClick={()=>void share()}><Share2 size={15}/>Share</button>}
   <button type="button" className="button secondary" onClick={()=>void copy()}><Copy size={15}/>Copy sheet</button>
   <button type="button" className="button secondary" onClick={()=>window.print()}><Printer size={15}/>Print</button>
  </div>
  {sharing&&<p className="rx-note">{sharing.show_on_profile&&sharing.build_sheet_public?'This parts list is public: riders who see your bike on your profile can read it. Your settings, notes and hours are never shared.':sharing.show_on_profile?'Your bike is on your profile, but the parts list is private. Turn on the public build sheet in Photos › On your profile to let riders read it.':'Private: only you see this sheet. Show the bike on your profile to share it.'}</p>}
 </section>;
}

/** The document itself, from ready data. Also for another rider's public sheet (mine=false). */
export function SheetLayout({data,mine=false}:{data:SheetData;mine?:boolean}){
 const on=data.parts.filter(p=>!p.off),spares=data.parts.filter(p=>p.off);
 const modified=new Set(on.map(p=>p.system)),stock=data.stock.filter(s=>!modified.has(s));
 const missing=partSystems.map(s=>s.key).filter(k=>!modified.has(k)&&!stock.includes(k));
 return <div className="rx-doc">
  <header className="rx-doc-plate">
   <div className="rx-between"><div className="rx-eyebrow-row"><span className="rx-mark" aria-hidden="true" style={{width:18}}/><span className="eyebrow">BUILD SHEET</span></div><small>BAK MX</small></div>
   <div className="rx-doc-ident">{!!data.raceNumber&&<span className="race-plate" aria-label={`Race number ${data.raceNumber}`}>{data.raceNumber}</span>}<div><h2 className="rx-title md">{data.title}</h2>{!!data.subtitle&&<p className="rx-copy">{data.subtitle}</p>}</div></div>
   <div className="rx-doc-stats">
    <Stat value={String(on.length)} label={on.length===1?'part':'parts'}/><Stat value={String(modified.size)} label="changed"/><Stat value={String(stock.length)} label="stock"/>{data.hours!=null&&<Stat value={String(data.hours)} label="hours"/>}
   </div>
  </header>
  {!!data.checks?.length&&<div className="rx-doc-checks"><b>{data.checks.length===1?'1 THING TO CHECK':`${data.checks.length} THINGS TO CHECK`}</b>{data.checks.map((c,i)=><p key={i}>{c}</p>)}</div>}
  {!on.length&&!stock.length&&<p className="rx-copy">{mine?'Nothing recorded yet. Edit the build sheet and pick what’s on the bike, or mark an area stock.':'Nothing recorded yet.'}</p>}
  {GROUPS.map(g=>{const rows=g.systems.filter(k=>modified.has(k)||stock.includes(k));if(!rows.length)return null;
   return <section key={g.label} className="rx-doc-group"><b>{g.label}</b><div className="rx-doc-table">
    {rows.map(k=>{const parts=on.filter(p=>p.system===k);return <div key={k} className="rx-doc-tr">
     <div className="rx-doc-th"><b>{label(k)}</b>{parts.length?<span>MODIFIED</span>:<span className="stock">STOCK</span>}</div>
     <div className="rx-doc-td">{parts.length?parts.map((p,j)=><PartLine key={j} p={p}/>):<p>As it came from the factory</p>}</div>
    </div>;})}
   </div></section>;})}
  {spares.length>0&&<section className="rx-doc-group"><b>Off the bike · spares and swaps</b><div className="rx-doc-table dashed">{spares.map((p,j)=><div key={j} className="rx-part"><small>{label(p.system).toUpperCase()}</small><PartLine p={p}/></div>)}</div></section>}
  {mine&&missing.length>0&&(on.length>0||stock.length>0)&&<p className="rx-note">Not recorded yet: {missing.map(label).join(', ')}. BAK treats these as unknown, not stock.</p>}
  {!!data.updated&&<p className="rx-doc-updated">Updated {new Date(data.updated).toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'})}</p>}
 </div>;
}
function Stat({value,label}:{value:string;label:string}){return <div aria-label={`${value} ${label}`}><b>{value}</b><small>{label}</small></div>;}
function PartLine({p}:{p:SheetPart}){
 const tags=[p.size,p.color].filter(Boolean) as string[];
 return <div className="rx-part">{!!p.brand&&<small>{p.brand.toUpperCase()}</small>}<b>{p.name}{tags.length>0&&<span>  ·  {tags.join(' · ')}</span>}</b>{!!p.detail&&<p>{p.detail}</p>}</div>;
}
