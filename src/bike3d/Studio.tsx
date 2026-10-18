import {createRoot} from 'react-dom/client';
import {BikeViewer} from './BikeViewer';
import {defaultBikeDimensions} from '../../shared/bike-visual';
import {OEM_VIEWER_COPY} from './presentation';

function Studio(){
 return <main className="bak3d-studio">
  <header><a href="/">BAK<span> MX</span></a><div>IN-HOUSE DEVELOPMENT <b>OEM VIEWER / 001</b></div></header>
  <section className="bak3d-intro">
   <div><p className="bak3d-eyebrow">STOCK BIKE / EXACT YEAR</p><h1>Inspect it.<br/><em>Turn it around.</em></h1><p>{OEM_VIEWER_COPY.identity}<br/>{OEM_VIEWER_COPY.scope}</p></div>
   <div className="bak3d-phase"><span>OEM REFERENCE</span><strong>Stock bike inspection</strong><p>Original chassis, powertrain and body surfaces.<br/>Geometry remains an authored study pending visual acceptance.</p></div>
  </section>
  <BikeViewer dimensions={defaultBikeDimensions} authoring/>
  <section className="bak3d-bottom">
   <article><p className="bak3d-eyebrow">VISUAL ACCEPTANCE</p><h2>Geometry stays honest.</h2><p>Every view is fitted to the actual motorcycle bounds. The presentation is production-oriented; the geometry remains explicitly unverified until its silhouette, molded surfaces, junctions and mechanical details pass exact-year review.</p><ul><li>Stock 2025 Standard US identity</li><li>No graphics or decal editor</li><li>No neighboring-year substitutions</li><li>No OEM-verification claim before acceptance</li></ul></article>
   <article><p className="bak3d-eyebrow">EVIDENCE, NOT GUESSWORK</p><h2>Reference bench</h2><p>The 42-group OEM inventory defines component identities. Exact-year studio photos guide contours. Estimated shapes remain unverified until compared from all required views.</p><a target="_blank" rel="noreferrer" href="https://www.ktm.com/en-us/models/motocross/4-stroke/2025-ktm-450-sx-f.html">Open KTM’s exact-year studio photos ↗</a><a target="_blank" rel="noreferrer" href="https://sparepartsfinder.ktm.com/Result/ExecuteSearch?modelIdentification=1003417574&isEngine=False">Open exact US OEM catalog ↗</a><a href="/bike-builder/ktm-450-sxf-2025-comparison.html">Open six-view mesh / reference comparison ↗</a><a href="/bike-builder/vendor-dimensions.json" download>Download part measurement evidence ↓</a><a href="/bike-builder/ktm-450-sxf-2025.references.json" download>Download component / evidence manifest ↓</a></article>
  </section>
  <footer>BAK BIKE BUILDER · STOCK OEM STUDY · NO GRAPHICS CONFIGURATOR</footer>
 </main>;
}

createRoot(document.getElementById('root')!).render(<Studio/>);
