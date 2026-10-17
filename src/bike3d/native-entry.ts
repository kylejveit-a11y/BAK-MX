import {mountBikeScene,type BikeScene,type CameraView} from './scene';
import {defaultBikeDimensions} from '../../shared/bike-visual';
import {resolveVisualBuild} from '../../shared/build-visual';
declare global {interface Window {updateBikeBuild?:(configuration:Record<string,unknown>)=>void;}}
let configuration:Record<string,unknown>={};
const labels=document.createElement('p');document.body.append(labels);
window.updateBikeBuild=value=>{configuration=value;api?.updateBuild(configuration);labels.textContent=resolveVisualBuild(configuration).parts.map(p=>p.label).join(' · ');};
let api:BikeScene|null=null;
const host=document.getElementById('bike')!,status=document.getElementById('status')!;
function start(){api?.dispose();api=null;status.textContent='';try{api=mountBikeScene(host,defaultBikeDimensions,message=>{status.textContent=message;});api.updateBuild(configuration);}catch{status.textContent='3D graphics are unavailable. Try restarting the preview.';}}
document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(button=>button.addEventListener('click',()=>api?.setView(button.dataset.view as CameraView)));
document.getElementById('retry')!.addEventListener('click',start);
window.addEventListener('pagehide',()=>{api?.dispose();api=null;});
window.addEventListener('pageshow',()=>{if(!api)start();});
start();
