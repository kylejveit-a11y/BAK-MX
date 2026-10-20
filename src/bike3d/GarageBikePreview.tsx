import {lazy,Suspense,useState} from 'react';
import type {Bike} from '../../shared/types';
import {resolveBikeVisual} from '../../shared/bike-visual';
const Viewer=lazy(()=>import('./BikeViewer').then(m=>({default:m.BikeViewer})));
export function GarageBikePreview({bike}:{bike:Bike}){const [open,setOpen]=useState(false);
 if(import.meta.env.VITE_BIKE_BUILDER_PREVIEW!=='true'||!resolveBikeVisual(bike))return null;
 return <section className="panel"><h2>Five-view bike builder</h2><p>Photoreal component inspection · visual study, not OEM verified.</p><button type="button" onClick={()=>setOpen(v=>!v)}>{open?'Close bike viewer':'Inspect this bike'}</button>{open&&<Suspense fallback={<p role="status">Loading bike views…</p>}><Viewer configuration={bike.configuration??{}}/></Suspense>}</section>;
}
