import {createRoot} from 'react-dom/client';
import {BikeViewer} from './BikeViewer';
import {defaultBikeDimensions} from '../../shared/bike-visual';
import {OEM_VIEWER_COPY} from './presentation';

function Studio(){
 return <main className="bak3d-studio">
  <header><a href="/">BAK<span> MX</span></a><div>IN-HOUSE DEVELOPMENT <b>FIVE-VIEW BUILDER / 001</b></div></header>
  <section className="bak3d-intro">
   <div><p className="bak3d-eyebrow">FIXED BIKE / FIVE ANGLES</p><h1>Pick a view.<br/><em>Find the component.</em></h1><p>{OEM_VIEWER_COPY.identity}<br/>Photoreal concept inspection for the fixed bike only.</p></div>
   <div className="bak3d-phase"><span>BAK MX PHOTO VIEWER</span><strong>Fast, clear inspection</strong><p>Five matched workshop views, fifteen selectable component zones and no real-time 3D overhead.</p></div>
  </section>
  <BikeViewer dimensions={defaultBikeDimensions} authoring/>
  <section className="bak3d-bottom">
   <article><p className="bak3d-eyebrow">VISUAL BOUNDARY</p><h2>Realistic without pretending.</h2><p>The scenes are polished visual concepts built for component location and configuration flow. They are not factory photography and do not verify exact part geometry.</p><ul><li>Fixed 2025 Standard US scope</li><li>Five consistent inspection angles</li><li>Fifteen selectable component zones</li><li>BLOCKOUT_NOT_OEM_VERIFIED retained</li></ul></article>
   <article><p className="bak3d-eyebrow">EVIDENCE, NOT GUESSWORK</p><h2>Reference bench</h2><p>Use manufacturer material and the exact US parts catalog for purchasing, fitment and service decisions. The photo viewer is a visual navigation layer only.</p><a target="_blank" rel="noreferrer" href="https://www.ktm.com/en-us/models/motocross/4-stroke/2025-ktm-450-sx-f.html">Open KTM model reference ↗</a><a target="_blank" rel="noreferrer" href="https://sparepartsfinder.ktm.com/Result/ExecuteSearch?modelIdentification=1003417574&isEngine=False">Open exact US OEM catalog ↗</a><a href="/bike-builder/ktm-static-configurator/manifest.json" download>Download five-view component manifest ↓</a><a href="/bike-builder/ktm-450-sxf-2025.references.json" download>Download evidence manifest ↓</a></article>
  </section>
  <footer>BAK BIKE BUILDER · PHOTO-REAL CONCEPT STUDY · NOT OEM VERIFIED</footer>
 </main>;
}

createRoot(document.getElementById('root')!).render(<Studio/>);
