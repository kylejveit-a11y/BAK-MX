import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {createBikeModel,disposeBikeModel} from './model.ts';
import {applyVisualBuild} from './apply-build.ts';
import {resolveVisualBuild} from '../../shared/build-visual.ts';
import {parseBikeDimensions,type BikeDimensions} from '../../shared/bike-visual.ts';
import {fitObjectToCamera} from './camera-fit.ts';
export const CAMERA_PRESETS={
 perspective:{label:'Three-quarter',direction:[2.55,.78,3.2],margin:1.025},
 right:{label:'Right',direction:[0,.12,1],margin:1.06},
 left:{label:'Left',direction:[0,.12,-1],margin:1.06},
 front:{label:'Front',direction:[1,.10,0],margin:1.10},
 rear:{label:'Rear',direction:[-1,.10,0],margin:1.10},
 top:{label:'Top',direction:[0,1,.001],margin:1.08},
} as const;
export type CameraView=keyof typeof CAMERA_PRESETS;
export function fitCameraDistance(radius:number,fov:number,aspect:number){
 const halfVertical=fov*Math.PI/360,halfHorizontal=Math.atan(Math.tan(halfVertical)*Math.max(aspect,.01));
 return radius/Math.sin(Math.min(halfVertical,halfHorizontal))*1.08;
}
export function replaceBikeModel(scene:T.Scene,old:T.Group,dimensions:BikeDimensions){
 const next=createBikeModel(dimensions);let wire=false;
 old.traverse(o=>{if(o instanceof T.Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m instanceof T.MeshStandardMaterial)wire=m.wireframe;});
 for(const group of next.children)group.visible=old.getObjectByName(group.name)?.visible??true;
 next.traverse(o=>{if(o instanceof T.Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m instanceof T.MeshStandardMaterial)m.wireframe=wire;});
 scene.remove(old);scene.add(next);disposeBikeModel(old);return next;
}
export function mountBikeScene(host:HTMLElement,dimensions:BikeDimensions,onError:(message:string)=>void){
 dimensions=parseBikeDimensions(dimensions);
 const cleanup:Array<()=>void>=[];
 try{
 const scene=new T.Scene();
 cleanup.push(()=>disposeBikeModel(scene));scene.background=new T.Color(0x090e12);scene.fog=new T.Fog(0x090e12,7,15);
 const camera=new T.PerspectiveCamera(37,1,.03,30),renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 cleanup.push(()=>{renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();});
 const room=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer);
 try{const environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=.72;cleanup.push(()=>environment.dispose());}finally{room.dispose();pmrem.dispose();}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NeutralToneMapping;renderer.toneMappingExposure=.64;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
 renderer.domElement.setAttribute('aria-label','Interactive stock 2025 KTM 450 SX-F exterior study');renderer.domElement.style.touchAction='none';host.append(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.65,0);controls.minDistance=1.3;controls.maxDistance=20;controls.enablePan=false;controls.maxPolarAngle=Math.PI-.03;controls.minPolarAngle=.03;
 cleanup.push(()=>controls.dispose());
 scene.add(new T.HemisphereLight(0xdcecff,0x111820,.30));
 for(const [color,x,y,z,power] of [[0xffffff,2.7,4.2,3.3,1.55],[0xc9ddf2,-2.8,2.7,-3.5,.54],[0xffa06d,-1.2,3.4,2.8,.34]] as const){const light=new T.DirectionalLight(color,power);light.position.set(x,y,z);if(x===2.7){light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-2,right:2,top:2,bottom:-2,near:.1,far:10});light.shadow.bias=-.00018;light.shadow.normalBias=.012;}scene.add(light);}
 scene.traverse(object=>{if(object instanceof T.DirectionalLight)cleanup.push(()=>object.shadow.dispose());});
 const floor=new T.Mesh(new T.PlaneGeometry(40,40),new T.MeshStandardMaterial({color:0x111a20,metalness:.08,roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.y=-.018;floor.receiveShadow=true;scene.add(floor);
 let bike=createBikeModel(dimensions);scene.add(bike);let configuration:Record<string,unknown>={};
 let disposed=false,visible=true,paused=false,frame=0;
 function render(){frame=0;if(!disposed&&visible&&!paused&&!document.hidden){try{renderer.render(scene,camera);}catch{onError('The 3D preview could not render. Close and reopen the viewer.');}}}
 function invalidate(){if(!disposed&&!frame&&visible&&!paused&&!document.hidden)frame=requestAnimationFrame(render);}
 let activeView:CameraView='perspective';
 function fit(margin=CAMERA_PRESETS[activeView].margin){const direction=camera.position.clone().sub(controls.target).normalize();fitObjectToCamera(camera,bike,controls.target,direction,margin);controls.update();}
 function resize(){if(disposed)return;const {width,height}=host.getBoundingClientRect();renderer.setSize(Math.max(width,1),Math.max(height,1));camera.aspect=Math.max(width,1)/Math.max(height,1);camera.updateProjectionMatrix();fit();invalidate();}
 function setView(view:CameraView){activeView=view;const preset=CAMERA_PRESETS[view];camera.position.copy(controls.target).add(new T.Vector3(...preset.direction).normalize());fit(preset.margin);invalidate();}
 const resizeObserver=new ResizeObserver(resize);cleanup.push(()=>resizeObserver.disconnect());resizeObserver.observe(host);
 const intersection=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;if(!visible&&frame){cancelAnimationFrame(frame);frame=0;}invalidate();});cleanup.push(()=>intersection.disconnect());intersection.observe(host);
 const visibility=()=>{if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}invalidate();};document.addEventListener('visibilitychange',visibility);cleanup.push(()=>document.removeEventListener('visibilitychange',visibility));
 const lost=(event:Event)=>{event.preventDefault();onError('Graphics paused. Close and reopen the viewer to recover.');};renderer.domElement.addEventListener('webglcontextlost',lost);cleanup.push(()=>renderer.domElement.removeEventListener('webglcontextlost',lost));
 cleanup.push(()=>{disposed=true;cancelAnimationFrame(frame);controls.removeEventListener('change',invalidate);});controls.addEventListener('change',invalidate);setView('perspective');resize();
 return {
  setView,
  setPaused(value:boolean){paused=value;if(paused&&frame){cancelAnimationFrame(frame);frame=0;}invalidate();},
  updateDimensions(value:BikeDimensions){bike=replaceBikeModel(scene,bike,value);applyVisualBuild(bike,resolveVisualBuild(configuration));invalidate();},
  updateBuild(value:Record<string,unknown>){configuration=value;applyVisualBuild(bike,resolveVisualBuild(value));invalidate();},
  setWireframe(value:boolean){bike.traverse(o=>{if(o instanceof T.Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m instanceof T.MeshStandardMaterial)m.wireframe=value;});invalidate();},
  setComponent(id:string,value:boolean){const g=bike.getObjectByName(id);if(g)g.visible=value;invalidate();},
  async exportGLB(){// Export a clean clone: inspection visibility and wireframe never alter the OEM assembly export.
   const clone=bike.clone(true);clone.children.forEach(o=>{o.visible=true;});clone.traverse(o=>{if(o instanceof T.Mesh){const make=(m:T.Material)=>{const c=m.clone();if(c instanceof T.MeshStandardMaterial)c.wireframe=false;return c;};o.material=Array.isArray(o.material)?o.material.map(make):make(o.material);}});
   try{return await new GLTFExporter().parseAsync(clone,{binary:true,onlyVisible:true}) as ArrayBuffer;}finally{const materials=new Set<T.Material>();clone.traverse(o=>{if(o instanceof T.Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});materials.forEach(m=>m.dispose());}
  },
  dispose(){if(disposed)return;for(const release of cleanup.reverse())release();}
 };
 }catch(error){for(const release of cleanup.reverse()){try{release();}catch{/* Preserve the initialization error. */}}throw error;}
}
export type BikeScene=ReturnType<typeof mountBikeScene>;
