// Garage sharing on the web: show a bike on your profile with the photos you pick, answer build-sheet requests, and on
// another rider's profile see their shown bikes and ask for (or read) their build sheet. Same rules as the phone app.
import {useCallback,useEffect,useState} from 'react';
import type {Bike} from '../shared/types';
import {api} from './client';

type Photo={id:string;url:string};
type Rider={user_id:string;handle:string;display_name:string};
type Request={id:string;rider:Rider;status:'pending'|'approved'|'declined'|'revoked'};
type Sharing={show_on_profile:boolean;photo_ids:string[];requests:Request[]};
const name=(r:Rider)=>r.display_name||'@'+r.handle;
const msg=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';

/** Garage: profile sharing for the selected bike. */
export function ProfileSharing({bike,onChanged}:{bike:Bike;onChanged?:()=>void}){
 const [sharing,setSharing]=useState<Sharing|null>(null),[photos,setPhotos]=useState<Photo[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const load=useCallback(async()=>{try{setError('');const [s,p]=await Promise.all([api<Sharing>(`/garage-sharing?bike_id=${bike.id}`),api<Photo[]>(`/photos?kind=bike&bike_id=${bike.id}`).catch(()=>[] as Photo[])]);setSharing(s);setPhotos(p);}catch(e){setError(msg(e));}},[bike.id]);
 useEffect(()=>{setSharing(null);void load();},[load]);
 async function save(next:{show_on_profile:boolean;photo_ids:string[]}){setBusy(true);setError('');try{const saved=await api<{show_on_profile:boolean;photo_ids:string[]}>('/garage-sharing','PUT',{bike_id:bike.id,...next});setSharing(old=>old?{...old,...saved}:old);onChanged?.();}catch(e){setError(msg(e));}finally{setBusy(false);}}
 async function answer(r:Request,decision:'approve'|'decline'|'revoke'){if(decision==='revoke'&&!confirm(`Stop sharing your build sheet with ${name(r.rider)}?`))return;setError('');try{await api('/build-sheet-requests/answer','POST',{id:r.id,decision});await load();}catch(e){setError(msg(e));}}
 if(!sharing)return <section className="panel"><span className="eyebrow">PROFILE</span>{error?<div className="error" role="alert">{error}</div>:<p className="subtle" role="status">Loading…</p>}</section>;
 const on=sharing.show_on_profile,picked=new Set(sharing.photo_ids);
 const toggle=(id:string)=>{const ids=picked.has(id)?sharing.photo_ids.filter(x=>x!==id):[...sharing.photo_ids,id];if(ids.length>8){setError('Choose up to 8 photos.');return;}void save({show_on_profile:true,photo_ids:ids});};
 const pending=sharing.requests.filter(r=>r.status==='pending'),approved=sharing.requests.filter(r=>r.status==='approved');
 return <section className="panel"><span className="eyebrow">PROFILE</span>
  <label className="check-row" style={{display:'flex',gap:10,alignItems:'flex-start'}}><input type="checkbox" checked={on} disabled={busy} onChange={e=>void save({show_on_profile:e.target.checked,photo_ids:e.target.checked?sharing.photo_ids:[]})}/>
   <span><b>Show this bike on my profile</b><br/><span className="subtle">{on?'Riders see the bike and the photos you tick. Your parts list stays private until you approve a request.':'Off: only you see this bike and its photos.'}</span></span></label>
  {on&&(photos.length?<><p className="subtle">Tick the photos to show ({picked.size} of up to 8).</p><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{photos.map(p=><button key={p.id} type="button" disabled={busy} aria-pressed={picked.has(p.id)} onClick={()=>toggle(p.id)} style={{padding:0,border:picked.has(p.id)?'2px solid var(--accent, #6AA4FF)':'2px solid transparent',borderRadius:10,background:'none',opacity:picked.has(p.id)?1:0.5,cursor:'pointer'}}><img src={p.url} alt={picked.has(p.id)?'Shown on profile':'Not shown'} style={{width:84,height:84,objectFit:'cover',borderRadius:8,display:'block'}}/></button>)}</div></>:<p className="subtle">Add photos of this bike in the phone app, then tick the ones to show.</p>)}
  {error&&<div className="error" role="alert">{error}</div>}
  {pending.length>0&&<><h3>Build sheet requests</h3>{pending.map(r=><div key={r.id} className="button-row" style={{alignItems:'center'}}><span style={{flex:1}}>{name(r.rider)} <span className="subtle">wants to see your parts list</span></span><button className="button" onClick={()=>void answer(r,'approve')}>Share</button><button className="button secondary" onClick={()=>void answer(r,'decline')}>No</button></div>)}</>}
  {approved.length>0&&<><h3>Sharing your build sheet with</h3>{approved.map(r=><div key={r.id} className="button-row" style={{alignItems:'center'}}><span style={{flex:1}}>{name(r.rider)}</span><button className="button secondary" onClick={()=>void answer(r,'revoke')}>Stop sharing</button></div>)}</>}
 </section>;
}

export type PublicBike={id:string;label:string;photos:Photo[];sheet:'mine'|'none'|'pending'|'approved'|'declined'|'revoked'};
type Sheet={parts:{system_label:string;name:string;detail:string;off_bike:boolean}[];stock_systems:string[]};

/** Another rider's profile: their shown bikes, photos, and the build sheet on request. */
export function PublicGarage({bikes}:{bikes:PublicBike[]}){
 if(!bikes.length)return null;
 return <><div className="section-line"><h2>Garage</h2></div>{bikes.map(b=><PublicBikeCard key={b.id} bike={b}/>)}</>;
}
function PublicBikeCard({bike}:{bike:PublicBike}){
 const [state,setState]=useState(bike.sheet),[sheet,setSheet]=useState<Sheet|null>(null),[open,setOpen]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function ask(){setBusy(true);setError('');try{const r=await api<{status:PublicBike['sheet']}>('/build-sheet-requests','POST',{bike_id:bike.id});setState(r.status);}catch(e){setError(msg(e));}finally{setBusy(false);}}
 async function view(){if(open){setOpen(false);return;}setBusy(true);setError('');try{setSheet(await api<Sheet>(`/build-sheet?bike_id=${bike.id}`));setOpen(true);}catch(e){setError(msg(e));}finally{setBusy(false);}}
 const groups=sheet?Object.entries(sheet.parts.reduce<Record<string,Sheet['parts']>>((m,p)=>{(m[p.system_label]??=[]).push(p);return m;},{})):[];
 return <div className="comment"><h3 style={{margin:'0 0 8px'}}>{bike.label}</h3>
  {bike.photos.length>0&&<div style={{display:'flex',gap:8,overflowX:'auto'}}>{bike.photos.map((p,i)=><a key={p.id} href={p.url} target="_blank" rel="noreferrer"><img src={p.url} alt={`Photo ${i+1} of ${bike.label}`} style={{height:120,borderRadius:10,display:'block'}}/></a>)}</div>}
  {state==='mine'&&<p className="subtle">This is how riders see your bike. Your parts list shows only to riders you approve.</p>}
  <div className="button-row">
   {(state==='none'||state==='declined'||state==='revoked')&&<button className="button secondary" disabled={busy} onClick={()=>void ask()}>{busy?'Asking…':'Ask to see the build sheet'}</button>}
   {state==='pending'&&<span className="subtle">Build sheet requested. You’ll get a message when they answer.</span>}
   {(state==='approved'||state==='mine')&&<button className="button secondary" disabled={busy} onClick={()=>void view()}>{open?'Hide build sheet':'View build sheet'}</button>}
  </div>
  {open&&sheet&&<div>{!groups.length&&<p className="subtle">No parts recorded yet.</p>}{groups.map(([label,parts])=><div key={label}><span className="eyebrow">{label.toUpperCase()}</span><ul>{parts.map((p,i)=><li key={i}>{p.name}{p.detail&&<span className="subtle"> · {p.detail}</span>}{p.off_bike&&<span className="subtle"> (spare, off the bike)</span>}</li>)}</ul></div>)}{sheet.stock_systems.length>0&&<p className="subtle">Stock: {sheet.stock_systems.join(', ')}</p>}</div>}
  {error&&<div className="error" role="alert">{error}</div>}
 </div>;
}
