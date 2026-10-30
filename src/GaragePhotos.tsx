// Photos of the rider's bike on the web, ported from the phone app: a wide cover with the race plate, the grid with add and
// delete (up to 8), and what shows on the profile. Photos are private unless the rider shows the bike, and picks them, on
// their profile. The links are short-lived and handed out by the server, so nothing here is public by accident.
import {useCallback,useEffect,useState} from 'react';
import {Camera,Plus,X} from 'lucide-react';
import type {Bike} from '../shared/types';
import {api} from './client';
import {addPhotos,type Photo} from './photos';
import './rider-extras.css';

export const MAX_BIKE_PHOTOS=8;
const errorText=(e:unknown)=>e instanceof Error?e.message:'Something went wrong. Please try again.';
type Sharing={show_on_profile:boolean;build_sheet_public:boolean;photo_ids:string[]};

/** Every open copy of a bike's photos hears about a change, so the cover follows the grid at once. */
const listeners=new Map<string,Set<(p:Photo[])=>void>>();
const announce=(bikeId:string,photos:Photo[])=>{for(const l of listeners.get(bikeId)??[])l(photos);};

export function useBikePhotos(bikeId?:string,enabled=true){
 const [photos,setPhotosState]=useState<Photo[]|null>(null),[error,setError]=useState('');
 const load=useCallback(async()=>{if(!bikeId||!enabled){setPhotosState([]);return;}try{setError('');const list=await api<Photo[]>(`/photos?kind=bike&bike_id=${bikeId}`);setPhotosState(list);announce(bikeId,list);}catch(e){setError(errorText(e));setPhotosState([]);}},[bikeId,enabled]);
 useEffect(()=>{setPhotosState(null);void load();},[load]);
 useEffect(()=>{if(!bikeId)return;const set=listeners.get(bikeId)??new Set();const l=(p:Photo[])=>setPhotosState(p);set.add(l);listeners.set(bikeId,set);return()=>{set.delete(l);};},[bikeId]);
 const setPhotos=useCallback((next:Photo[])=>{setPhotosState(next);if(bikeId)announce(bikeId,next);},[bikeId]);
 return {photos,setPhotos,load,error};
}

/** Wide cover photo for the bike with the rider's race plate, if they have added a photo. Nothing shows otherwise. */
export function BikeCover({bike,signedIn=true}:{bike?:Bike;signedIn?:boolean}){
 const {photos}=useBikePhotos(bike?.id,signedIn&&!!bike);
 const [plate,setPlate]=useState('');
 useEffect(()=>{let live=true;if(!signedIn||!bike){setPlate('');return;}api<{race_number?:string}|null>('/profile').then(p=>{if(live)setPlate(p?.race_number??'');}).catch(()=>{});return()=>{live=false;};},[signedIn,bike?.user_id]);
 const p=photos?.[0];if(!bike||!p)return null;
 return <div className="rx-cover-wrap"><img className="rx-cover" src={p.url} alt={`Your ${bike.model_year} ${bike.manufacturer} ${bike.model}`}/>{plate&&<span className="race-plate" aria-label={`Race number ${plate}`}>{plate}</span>}</div>;
}

/** Garage › Photos: the rider's own pictures of this bike, and which of them show on their profile. */
export function BikePhotos({bike,signedIn=true,onSignIn,onSharingChanged}:{bike?:Bike;signedIn?:boolean;onSignIn?:()=>void;onSharingChanged?:()=>void}){
 if(!signedIn)return <section className="panel"><div className="rx-prompt"><p className="rx-copy">Sign in to keep photos of your bike.</p>{onSignIn&&<button className="button" onClick={onSignIn}>Sign in</button>}</div></section>;
 if(!bike)return <section className="panel"><p className="rx-copy">Add a bike first, then keep before-and-after photos of the build with it.</p></section>;
 return <BikePhotosFor key={bike.id} bike={bike} onSharingChanged={onSharingChanged}/>;
}

function BikePhotosFor({bike,onSharingChanged}:{bike:Bike;onSharingChanged?:()=>void}){
 const {photos,setPhotos,error:loadError}=useBikePhotos(bike.id);
 const [adding,setAdding]=useState(false),[progress,setProgress]=useState(''),[error,setError]=useState('');
 const count=photos?.length??0,room=MAX_BIKE_PHOTOS-count;
 async function add(){
  if(room<=0){setError(`Up to ${MAX_BIKE_PHOTOS} photos per bike. Delete one to add another.`);return;}
  setError('');setAdding(true);
  try{const added=await addPhotos('bike',{limit:room,bikeId:bike.id,onProgress:(d,t)=>setProgress(t>1?`Uploading ${Math.min(d+1,t)} of ${t}…`:'Uploading…')});if(added.length)setPhotos([...added,...(photos??[])]);}
  catch(e){setError(errorText(e));}finally{setAdding(false);setProgress('');}
 }
 async function remove(p:Photo){
  if(!confirm('Delete this photo? It is removed from your Garage and your profile.'))return;
  try{await api('/photos?id='+p.id,'DELETE');setPhotos((photos??[]).filter(x=>x.id!==p.id));}catch(e){setError(errorText(e));}
 }
 return <>
  <section className="panel rx-panel-gap">
   <div className="rx-between"><span className="eyebrow" style={{margin:0}}>PHOTOS</span>{count>0&&<span className="rx-count">{count} of {MAX_BIKE_PHOTOS}</span>}</div>
   {photos!==null&&!count&&<p className="rx-copy">Keep pictures of the build: before and after, how parts are fitted, your clicker settings. They stay private unless you show them on your profile.</p>}
   {photos===null&&<div className="rx-center" role="status" aria-label="Loading"><span className="rx-spin"/></div>}
   <div className="rx-photo-grid">
    {(photos??[]).map((p,i)=><figure key={p.id} className="rx-photo" style={{margin:0}}><a href={p.url} target="_blank" rel="noreferrer"><img src={p.url} alt={`Photo ${i+1} of your bike`}/></a><button type="button" aria-label="Delete this photo" onClick={()=>void remove(p)}><X size={15}/></button></figure>)}
    {photos!==null&&room>0&&<button type="button" className="rx-photo-add" disabled={adding} onClick={()=>void add()}>{adding?<span className="rx-spin"/>:count?<Plus size={22}/>:<Camera size={22}/>}<span>{adding?progress||'Uploading…':count?'Add':'Add photos'}</span></button>}
   </div>
   {(error||loadError)&&<p className="rx-error" role="alert">{error||loadError}</p>}
  </section>
  {photos!==null&&<PhotoSharing bike={bike} photos={photos} onChanged={onSharingChanged}/>}
 </>;
}

/** Show this bike on your profile, and tick the photos riders see. Saved to the account through the API. */
function PhotoSharing({bike,photos,onChanged}:{bike:Bike;photos:Photo[];onChanged?:()=>void}){
 const [sharing,setSharing]=useState<Sharing|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{let live=true;setSharing(null);api<Sharing>(`/garage-sharing?bike_id=${bike.id}`).then(s=>{if(live)setSharing(s);}).catch(e=>{if(live)setError(errorText(e));});return()=>{live=false;};},[bike.id]);
 async function save(next:Partial<Sharing>){if(!sharing||busy)return;setBusy(true);setError('');try{const saved=await api<Sharing>('/garage-sharing','PUT',{bike_id:bike.id,show_on_profile:sharing.show_on_profile,build_sheet_public:sharing.build_sheet_public,photo_ids:sharing.photo_ids,...next});setSharing(saved);onChanged?.();}catch(e){setError(errorText(e));}finally{setBusy(false);}}
 if(!sharing)return error?<p className="rx-error" role="alert">{error}</p>:null;
 const on=sharing.show_on_profile,picked=new Set(sharing.photo_ids.filter(id=>photos.some(p=>p.id===id)));
 const toggle=(id:string)=>{const ids=picked.has(id)?sharing.photo_ids.filter(x=>x!==id):[...sharing.photo_ids,id];if(ids.length>MAX_BIKE_PHOTOS){setError(`Choose up to ${MAX_BIKE_PHOTOS} photos.`);return;}void save({photo_ids:ids});};
 return <section className="panel rx-panel-gap">
  <span className="eyebrow" style={{margin:0}}>ON YOUR PROFILE</span>
  <label className="rx-toggle"><input type="checkbox" checked={on} disabled={busy} onChange={e=>void save({show_on_profile:e.target.checked,build_sheet_public:e.target.checked&&sharing.build_sheet_public,photo_ids:e.target.checked?sharing.photo_ids:[]})}/><span><b>Show this bike on my profile</b><span>{on?'Riders see the bike and the photos you tick.':'Off: only you see this bike and its photos.'}</span></span></label>
  {on&&(photos.length?<><p className="rx-note">Tick the photos to show ({picked.size} of up to {MAX_BIKE_PHOTOS}).</p><div className="rx-share-pick">{photos.map(p=><button key={p.id} type="button" disabled={busy} aria-pressed={picked.has(p.id)} onClick={()=>toggle(p.id)}><img src={p.url} alt={picked.has(p.id)?'Shown on profile':'Not shown'}/></button>)}</div></>:<p className="rx-note">Add a photo above, then tick the ones to show.</p>)}
  {on&&<label className="rx-toggle"><input type="checkbox" checked={sharing.build_sheet_public} disabled={busy} onChange={e=>void save({build_sheet_public:e.target.checked})}/><span><b>Public build sheet</b><span>{sharing.build_sheet_public?'Riders who see this bike can read its parts list. Never your settings, notes, hours or rider details.':'Private: only you see the parts list.'}</span></span></label>}
  {error&&<p className="rx-error" role="alert">{error}</p>}
 </section>;
}
