import {useEffect,useRef,useState} from 'react';
import {CAMERA_PRESETS,mountBikeScene,type BikeScene,type CameraView} from './scene';
import {defaultBikeDimensions,visualComponents,type BikeDimensions} from '../../shared/bike-visual';
import './studio.css';
import {resolveVisualBuild} from '../../shared/build-visual';
import {OEM_VIEWER_COPY} from './presentation';
const emptyConfiguration:Record<string,unknown>={};
export function BikeViewer({dimensions=defaultBikeDimensions,authoring=false,configuration=emptyConfiguration}:{dimensions?:BikeDimensions;authoring?:boolean;configuration?:Record<string,unknown>}){
 const host=useRef<HTMLDivElement>(null),api=useRef<BikeScene|null>(null),panel=useRef<HTMLDivElement>(null);
 const [error,setError]=useState(''),[wire,setWire]=useState(false),[hidden,setHidden]=useState<string[]>([]),[busy,setBusy]=useState(false),[revision,setRevision]=useState(0),[expanded,setExpanded]=useState(false),[view,setView]=useState<CameraView>('perspective');
 useEffect(()=>{setError('');setWire(false);setHidden([]);try{api.current=mountBikeScene(host.current!,dimensions,setError);}catch{setError('3D is unavailable on this device. The rest of your garage remains available.');}return()=>{api.current?.dispose();api.current=null;};},[revision]);
 useEffect(()=>{try{api.current?.updateDimensions(dimensions);}catch{setError('These dimensions could not be applied.');}},[dimensions.wheelbase,dimensions.seatHeight]);
 useEffect(()=>{api.current?.updateBuild(configuration);},[configuration,revision]);
 useEffect(()=>{if(!expanded)return;const prior=document.body.style.overflow;document.body.style.overflow='hidden';const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')setExpanded(false);};document.addEventListener('keydown',escape);return()=>{document.body.style.overflow=prior;document.removeEventListener('keydown',escape);};},[expanded]);
 async function download(){if(!api.current)return;setBusy(true);try{const data=await api.current.exportGLB();const url=URL.createObjectURL(new Blob([data],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=url;a.download='bak-ktm-450-sxf-2025-exterior-study.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{setError('Export failed. Try reopening the viewer.');}finally{setBusy(false);}}
 return <div className={"bak3d-viewer"+(expanded?" bak3d-expanded":"")} ref={panel}>
  <div className="bak3d-canvas" ref={host}/>
  <div className="bak3d-tag">STOCK OEM INSPECTION <span>2025 / STANDARD US</span></div>
  {error&&<div className="bak3d-error" role="alert">{error}<button onClick={()=>setRevision(v=>v+1)}>Retry 3D</button></div>}
  <div className="bak3d-controls" aria-label="Bike camera controls">{(Object.keys(CAMERA_PRESETS) as CameraView[]).map(name=><button key={name} aria-pressed={view===name} disabled={!!error} onClick={()=>{setView(name);api.current?.setView(name);}}>{CAMERA_PRESETS[name].label}</button>)}<button aria-pressed={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?'Collapse':'Expand'}</button></div>
  <p className="bak3d-hint">Drag to orbit · Pinch or scroll to zoom · {OEM_VIEWER_COPY.accuracy}</p>
  <div className="bak3d-hint">{resolveVisualBuild(configuration).parts.map(p=><p key={p.mappingId}>{p.label}</p>)}</div>
  {authoring&&<div className="bak3d-authoring"><label><input type="checkbox" checked={wire} onChange={e=>{setWire(e.target.checked);api.current?.setWireframe(e.target.checked);}}/> Wireframe</label><button disabled={busy||!!error} onClick={()=>void download()}>{busy?'Exporting…':'Export editable GLB'}</button><div className="bak3d-components">{visualComponents.map(([id,label])=><label key={id}><input type="checkbox" checked={!hidden.includes(id)} onChange={e=>{api.current?.setComponent(id,e.target.checked);setHidden(h=>e.target.checked?h.filter(x=>x!==id):[...h,id]);}}/>{label}</label>)}</div></div>}
 </div>;
}
