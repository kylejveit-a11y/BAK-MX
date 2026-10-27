// Garage sharing on the web: show a bike on your profile with the photos you pick and set its build sheet public or private;
// on another rider's profile, see their shown bikes and read the build sheets they made public. Same rules as the phone app.
import {useCallback,useEffect,useState} from 'react';
import type {Bike} from '../shared/types';
import {api} from './client';

type Photo={id:string;url:string};
type Sharing={show_on_profile:boolean;build_sheet_public:boolean;photo_ids:string[]};
const msg=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';

/** Garage: profile sharing for the selected bike. */
export function ProfileSharing({bike,onChanged}:{bike:Bike;onChanged?:()=>void}){
 const [sharing,setSharing]=useState<Sharing|null>(null),[photos,setPhotos]=useState<Photo[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const load=useCallback(async()=>{try{setError('');const [s,p]=await Promise.all([api<Sharing>(`/garage-sharing?bike_id=${bike.id}`),api<Photo[]>(`/photos?kind=bike&bike_id=${bike.id}`).catch(()=>[] as Photo[])]);setSharing(s);setPhotos(p);}catch(e){setError(msg(e));}},[bike.id]);
 useEffect(()=>{setSharing(null);void load();},[load]);
 async function save(next:Partial<Sharing>){if(!sharing)return;setBusy(true);setError('');try{const saved=await api<Sharing>('/garage-sharing','PUT',{bike_id:bike.id,show_on_profile:sharing.show_on_profile,build_sheet_public:sharing.build_sheet_public,photo_ids:sharing.photo_ids,...next});setSharing(saved);onChanged?.();}catch(e){setError(msg(e));}finally{setBusy(false);}}
 if(!sharing)return <section className="panel"><span className="eyebrow">PROFILE</span>{error?<div className="error" role="alert">{error}</div>:<p className="subtle" role="status">Loading…</p>}</section>;
 const on=sharing.show_on_profile,picked=new Set(sharing.photo_ids);
 const toggle=(id:string)=>{const ids=picked.has(id)?sharing.photo_ids.filter(x=>x!==id):[...sharing.photo_ids,id];if(ids.length>8){setError('Choose up to 8 photos.');return;}void save({photo_ids:ids});};
 return <section className="panel"><span className="eyebrow">PROFILE</span>
  <label className="check-row" style={{display:'flex',gap:10,alignItems:'flex-start'}}><input type="checkbox" checked={on} disabled={busy} onChange={e=>void save({show_on_profile:e.target.checked,build_sheet_public:e.target.checked&&sharing.build_sheet_public,photo_ids:e.target.checked?sharing.photo_ids:[]})}/>
   <span><b>Show this bike on my profile</b><br/><span className="subtle">{on?'Riders see the bike and the photos you tick.':'Off: only you see this bike and its photos.'}</span></span></label>
  {on&&(photos.length?<><p className="subtle">Tick the photos to show ({picked.size} of up to 8).</p><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{photos.map(p=><button key={p.id} type="button" disabled={busy} aria-pressed={picked.has(p.id)} onClick={()=>toggle(p.id)} style={{padding:0,border:picked.has(p.id)?'2px solid var(--bike-accent, #6AA4FF)':'2px solid transparent',borderRadius:10,background:'none',opacity:picked.has(p.id)?1:0.5,cursor:'pointer'}}><img src={p.url} alt={picked.has(p.id)?'Shown on profile':'Not shown'} style={{width:84,height:84,objectFit:'cover',borderRadius:8,display:'block'}}/></button>)}</div></>:<p className="subtle">Add photos of this bike in the phone app, then tick the ones to show.</p>)}
  {on&&<label className="check-row" style={{display:'flex',gap:10,alignItems:'flex-start'}}><input type="checkbox" checked={sharing.build_sheet_public} disabled={busy} onChange={e=>void save({build_sheet_public:e.target.checked})}/>
   <span><b>Public build sheet</b><br/><span className="subtle">{sharing.build_sheet_public?'Anyone who sees this bike can read its parts list. Never your settings, notes, hours or rider details.':'Private: only you see the parts list.'}</span></span></label>}
  {error&&<div className="error" role="alert">{error}</div>}
 </section>;
}

export type PublicBike={id:string;label:string;photos:Photo[];sheet:'mine'|'public'|'private'};
type Sheet={parts:{system_label:string;name:string;detail:string;off_bike:boolean}[];stock_systems:string[]};

/** Another rider's profile: their shown bikes, photos, and the build sheet when it's public. */
export function PublicGarage({bikes}:{bikes:PublicBike[]}){
 if(!bikes.length)return null;
 return <><div className="section-line"><h2>Garage</h2></div>{bikes.map(b=><PublicBikeCard key={b.id} bike={b}/>)}</>;
}
function PublicBikeCard({bike}:{bike:PublicBike}){
 const state=bike.sheet,[sheet,setSheet]=useState<Sheet|null>(null),[open,setOpen]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function view(){if(open){setOpen(false);return;}setBusy(true);setError('');try{setSheet(await api<Sheet>(`/build-sheet?bike_id=${bike.id}`));setOpen(true);}catch(e){setError(msg(e));}finally{setBusy(false);}}
 const groups=sheet?Object.entries(sheet.parts.reduce<Record<string,Sheet['parts']>>((m,p)=>{(m[p.system_label]??=[]).push(p);return m;},{})):[];
 return <div className="comment"><h3 style={{margin:'0 0 8px'}}>{bike.label}</h3>
  {bike.photos.length>0&&<div style={{display:'flex',gap:8,overflowX:'auto'}}>{bike.photos.map((p,i)=><a key={p.id} href={p.url} target="_blank" rel="noreferrer"><img src={p.url} alt={`Photo ${i+1} of ${bike.label}`} style={{height:120,borderRadius:10,display:'block'}}/></a>)}</div>}
  {state==='mine'&&<p className="subtle">This is how riders see your bike. Set the build sheet public or private in Garage.</p>}
  <div className="button-row">
   {state==='private'&&<span className="subtle">Build sheet is private.</span>}
   {(state==='public'||state==='mine')&&<button className="button secondary" disabled={busy} onClick={()=>void view()}>{open?'Hide build sheet':'View build sheet'}</button>}
  </div>
  {open&&sheet&&<div>{!groups.length&&<p className="subtle">No parts recorded yet.</p>}{groups.map(([label,parts])=><div key={label}><span className="eyebrow">{label.toUpperCase()}</span><ul>{parts.map((p,i)=><li key={i}>{p.name}{p.detail&&<span className="subtle"> · {p.detail}</span>}{p.off_bike&&<span className="subtle"> (spare, off the bike)</span>}</li>)}</ul></div>)}{sheet.stock_systems.length>0&&<p className="subtle">Stock: {sheet.stock_systems.join(', ')}</p>}</div>}
  {error&&<div className="error" role="alert">{error}</div>}
 </div>;
}
