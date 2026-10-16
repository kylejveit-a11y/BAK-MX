import {mountBikeScene,type BikeScene,type CameraView} from './scene';
import {defaultBikeDimensions} from '../../shared/bike-visual';
let api:BikeScene|null=null;
const host=document.getElementById('bike')!,status=document.getElementById('status')!;
function start(){api?.dispose();api=null;status.textContent='';try{api=mountBikeScene(host,defaultBikeDimensions,message=>{status.textContent=message;});}catch{status.textContent='3D graphics are unavailable. Try restarting the preview.';}}
document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(button=>button.addEventListener('click',()=>api?.setView(button.dataset.view as CameraView)));
document.getElementById('retry')!.addEventListener('click',start);
window.addEventListener('pagehide',()=>{api?.dispose();api=null;});
window.addEventListener('pageshow',()=>{if(!api)start();});
start();
