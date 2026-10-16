import {lazy,Suspense,useState} from 'react';
import type {Bike} from '../../shared/types';
import {resolveBikeVisual} from '../../shared/bike-visual';
const Viewer=lazy(()=>import('./BikeViewer').then(m=>({default:m.BikeViewer})));
export function GarageBikePreview({bike}:{bike:Bike}){const [open,setOpen]=useState(false);
 if(import.meta.env.VITE_BIKE_BUILDER_PREVIEW!=='true'||!resolveBikeVisual(bike))return null;
 return <section className="panel"><h2>In-house 3D prototype</h2><p>OEM exterior study · geometry still under review.</p><button type="button" onClick={()=>setOpen(v=>!v)}>{open?'Close 3D preview':'Explore exterior prototype'}</button>{open&&<Suspense fallback={<p role="status">Loading 3D tools…</p>}><Viewer/></Suspense>}</section>;
}
