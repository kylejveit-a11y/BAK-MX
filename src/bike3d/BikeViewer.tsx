import {useEffect,useRef,useState} from 'react';
import {mountBikeScene,type BikeScene,type CameraView} from './scene';
import {defaultBikeDimensions,visualComponents,type BikeDimensions} from '../../shared/bike-visual';
import './studio.css';
export function BikeViewer({dimensions=defaultBikeDimensions,authoring=false}:{dimensions?:BikeDimensions;authoring?:boolean}){
 const host=useRef<HTMLDivElement>(null),api=useRef<BikeScene|null>(null),panel=useRef<HTMLDivElement>(null);
 const [error,setError]=useState(''),[wire,setWire]=useState(false),[hidden,setHidden]=useState<string[]>([]),[busy,setBusy]=useState(false);
 useEffect(()=>{setError('');setWire(false);setHidden([]);try{api.current=mountBikeScene(host.current!,dimensions,setError);}catch{setError('3D is unavailable on this device. The rest of your garage remains available.');}return()=>{api.current?.dispose();api.current=null;};},[]);
 useEffect(()=>{try{api.current?.updateDimensions(dimensions);}catch{setError('These dimensions could not be applied.');}},[dimensions.wheelbase,dimensions.seatHeight]);
 async function download(){if(!api.current)return;setBusy(true);try{const data=await api.current.exportGLB();const url=URL.createObjectURL(new Blob([data],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=url;a.download='bak-ktm-450-sxf-2025-blockout.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{setError('Export failed. Try reopening the viewer.');}finally{setBusy(false);}}
 return <div className="bak3d-viewer" ref={panel}>
  <div className="bak3d-canvas" ref={host}/>
  <div className="bak3d-tag">EXTERIOR STUDY <span>01 / OEM TARGET</span></div>
  {error&&<div className="bak3d-error" role="alert">{error}</div>}
  <div className="bak3d-controls" aria-label="Bike camera controls">{(['perspective','right','left','front','rear','top'] as CameraView[]).map(view=><button key={view} disabled={!!error} onClick={()=>api.current?.setView(view)}>{view==='perspective'?'Reset':view}</button>)}<button onClick={()=>{if(document.fullscreenElement)void document.exitFullscreen().catch(()=>setError('Unable to leave full screen.'));else if(panel.current?.requestFullscreen)void panel.current.requestFullscreen().catch(()=>setError('Full screen is unavailable. The inline viewer still works.'));}}>Expand</button></div>
  <p className="bak3d-hint">Drag to orbit · Pinch or scroll to zoom · Prototype geometry, not verified OEM</p>
  {authoring&&<div className="bak3d-authoring"><label><input type="checkbox" checked={wire} onChange={e=>{setWire(e.target.checked);api.current?.setWireframe(e.target.checked);}}/> Wireframe</label><button disabled={busy||!!error} onClick={()=>void download()}>{busy?'Exporting…':'Export editable GLB'}</button><div className="bak3d-components">{visualComponents.map(([id,label])=><label key={id}><input type="checkbox" checked={!hidden.includes(id)} onChange={e=>{api.current?.setComponent(id,e.target.checked);setHidden(h=>e.target.checked?h.filter(x=>x!==id):[...h,id]);}}/>{label}</label>)}</div></div>}
 </div>;
}
