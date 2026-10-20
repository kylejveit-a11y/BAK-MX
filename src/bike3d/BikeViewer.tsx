import {useEffect,useMemo,useRef,useState} from 'react';
import type {BikeDimensions} from '../../shared/bike-visual';
import {clampZoom,cycleView,resolvePartAnchor,type StaticConfiguratorManifest,type StaticViewId} from './static-configurator';
import './studio.css';

const manifestUrl='/bike-builder/ktm-static-configurator/manifest.json';

export function BikeViewer({dimensions:_,authoring=false,configuration:__}:{dimensions?:BikeDimensions;authoring?:boolean;configuration?:Record<string,unknown>}){
 const [manifest,setManifest]=useState<StaticConfiguratorManifest|null>(null);
 const [viewId,setViewId]=useState<StaticViewId>('three-quarter-left');
 const [partId,setPartId]=useState('engine');
 const [zoom,setZoom]=useState(1);
 const [error,setError]=useState('');
 const swipeStart=useRef<number|null>(null);

 useEffect(()=>{
  const controller=new AbortController();
  fetch(manifestUrl,{signal:controller.signal}).then(response=>{
   if(!response.ok)throw new Error(`View manifest returned ${response.status}`);
   return response.json() as Promise<StaticConfiguratorManifest>;
  }).then(value=>{
   setManifest(value);
   for(const view of value.views){const image=new Image();image.src=view.src;}
  }).catch(reason=>{if(reason instanceof Error&&reason.name!=='AbortError')setError('The photographic bike views could not be loaded.');});
  return()=>controller.abort();
 },[]);

 const view=manifest?.views.find(candidate=>candidate.id===viewId)??manifest?.views[0];
 const part=manifest?.parts.find(candidate=>candidate.id===partId)??manifest?.parts[0];
 const anchor=part&&view?resolvePartAnchor(part,view.id):null;
 const viewIds=useMemo(()=>manifest?.views.map(candidate=>candidate.id)??[],[manifest]);
 const go=(direction:-1|1)=>{if(!viewIds.length)return;setViewId(cycleView(viewIds,viewId,direction) as StaticViewId);setZoom(1);};
 const setView=(id:StaticViewId)=>{setViewId(id);setZoom(1);};
 const markerStyle=anchor?{
  left:`${50+((anchor.x*100)-50)*zoom}%`,
  top:`${50+((anchor.y*100)-50)*zoom}%`,
 }:undefined;

 return <section className="bak3d-viewer bak-photo-viewer" aria-label="2025 KTM 450 SX-F photographic configurator" tabIndex={0}
  onKeyDown={event=>{if(event.key==='ArrowLeft')go(-1);if(event.key==='ArrowRight')go(1);}}>
  <div className="bak-photo-stage" onWheel={event=>{event.preventDefault();setZoom(value=>clampZoom(value+(event.deltaY<0?.15:-.15)));}}
   onPointerDown={event=>{swipeStart.current=event.clientX;}} onPointerUp={event=>{if(swipeStart.current===null)return;const delta=event.clientX-swipeStart.current;swipeStart.current=null;if(Math.abs(delta)>55)go(delta>0?-1:1);}}>
   {!view&&!error&&<div className="bak-photo-loading" role="status"><span/>Preparing five-view inspection…</div>}
   {error&&<div className="bak3d-error" role="alert">{error}<button onClick={()=>location.reload()}>Retry views</button></div>}
   {view&&<>
    <img className="bak-photo-bike" src={view.src} alt={`2025 KTM 450 SX-F concept study — ${view.label}`} draggable={false} style={{transform:`scale(${zoom})`}}/>
    <button className="bak-photo-arrow bak-photo-prev" aria-label="Previous view" onClick={()=>go(-1)}>‹</button>
    <button className="bak-photo-arrow bak-photo-next" aria-label="Next view" onClick={()=>go(1)}>›</button>
    {anchor&&part&&<button className="bak-photo-marker" style={markerStyle} aria-label={`${part.label}: ${part.detail}`} onClick={()=>setZoom(value=>value===1?1.45:1)}><span>{part.label}</span></button>}
    <div className="bak-photo-meta"><b>{view.label}</b><span>PHOTO-REAL CONCEPT · NOT OEM REFERENCE</span></div>
    <div className="bak-photo-zoom" aria-label="Image zoom controls">
     <button aria-label="Zoom out" onClick={()=>setZoom(value=>clampZoom(value-.2))}>−</button>
     <output aria-label="Zoom level">{Math.round(zoom*100)}%</output>
     <button aria-label="Zoom in" onClick={()=>setZoom(value=>clampZoom(value+.2))}>+</button>
     <button onClick={()=>setZoom(1)}>Reset</button>
    </div>
   </>}
  </div>

  {manifest&&<>
   <nav className="bak-photo-views" aria-label="Bike views">
    <button className="bak-view-step" aria-label="Previous view" onClick={()=>go(-1)}>←</button>
    {manifest.views.map(candidate=><button key={candidate.id} aria-pressed={candidate.id===viewId} onClick={()=>setView(candidate.id)}><span>{candidate.shortLabel}</span><small>{candidate.label}</small></button>)}
    <button className="bak-view-step" aria-label="Next view" onClick={()=>go(1)}>→</button>
   </nav>
   <div className="bak-photo-configurator">
    <div className="bak-photo-selection">
     <p className="bak3d-eyebrow">SELECT A COMPONENT</p>
     <h2>{part?.label}</h2>
     <p>{part?.detail}</p>
     <span>{part?.group}</span>
    </div>
    <div className="bak-photo-parts" aria-label="Selectable motorcycle components">
     {manifest.parts.map(candidate=><button key={candidate.id} aria-pressed={candidate.id===partId} onClick={()=>setPartId(candidate.id)}><i/>{candidate.label}</button>)}
    </div>
   </div>
  </>}
  <p className="bak3d-hint">Use view buttons, arrows, swipe, or keyboard ← → · Scroll or use + / − to inspect · Select a component to locate it in every view.</p>
  {authoring&&<p className="bak-photo-authoring">Fixed 2025 KTM 450 SX-F · Standard US · {manifest?.accuracy??'BLOCKOUT_NOT_OEM_VERIFIED'}</p>}
 </section>;
}
