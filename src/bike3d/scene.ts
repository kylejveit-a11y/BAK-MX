import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {createBikeModel,disposeBikeModel} from './model.ts';
import {applyVisualBuild} from './apply-build.ts';
import {resolveVisualBuild} from '../../shared/build-visual.ts';
import {parseBikeDimensions,type BikeDimensions} from '../../shared/bike-visual.ts';
export type CameraView='perspective'|'left'|'right'|'front'|'rear'|'top';
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
 cleanup.push(()=>disposeBikeModel(scene));scene.background=new T.Color(0x12191e);
 const camera=new T.PerspectiveCamera(35,1,.03,30),renderer=new T.WebGLRenderer({antialias:true,alpha:false});
 cleanup.push(()=>{renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();});
 const room=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer);
 try{const environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;cleanup.push(()=>environment.dispose());}finally{room.dispose();pmrem.dispose();}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.5;
 renderer.domElement.setAttribute('aria-label','Interactive exterior bike prototype');renderer.domElement.style.touchAction='none';host.append(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.65,0);controls.minDistance=1.3;controls.maxDistance=20;controls.enablePan=false;controls.maxPolarAngle=Math.PI*.49;controls.minPolarAngle=.03;
 cleanup.push(()=>controls.dispose());
 scene.add(new T.HemisphereLight(0xe7f3ff,0x56505a,3));
 for(const [x,y,z,power] of [[2,4,3,5],[-2,3,-3,4],[0,3,0,2]]){const light=new T.DirectionalLight(0xffffff,power);light.position.set(x,y,z);scene.add(light);}
 const floor=new T.Mesh(new T.CircleGeometry(4,64),new T.MeshStandardMaterial({color:0x202c32,roughness:.95}));floor.rotation.x=-Math.PI/2;floor.position.y=-.015;scene.add(floor);
 const grid=new T.GridHelper(6,30,0x344149,0x26343b);grid.position.y=-.012;scene.add(grid);
 let bike=createBikeModel(dimensions);scene.add(bike);let configuration:Record<string,unknown>={};
 let disposed=false,visible=true,paused=false,frame=0;
 function render(){frame=0;if(!disposed&&visible&&!paused&&!document.hidden){try{renderer.render(scene,camera);}catch{onError('The 3D preview could not render. Close and reopen the viewer.');}}}
 function invalidate(){if(!disposed&&!frame&&visible&&!paused&&!document.hidden)frame=requestAnimationFrame(render);}
 function fit(){const sphere=new T.Box3().setFromObject(bike).getBoundingSphere(new T.Sphere());const direction=camera.position.clone().sub(controls.target).normalize();controls.target.copy(sphere.center);camera.position.copy(sphere.center).addScaledVector(direction,fitCameraDistance(sphere.radius,camera.fov,camera.aspect));controls.update();}
 function resize(){if(disposed)return;const {width,height}=host.getBoundingClientRect();renderer.setSize(Math.max(width,1),Math.max(height,1));camera.aspect=Math.max(width,1)/Math.max(height,1);camera.updateProjectionMatrix();fit();invalidate();}
 function setView(view:CameraView){const views:Record<CameraView,[number,number,number]>={perspective:[2.5,1.65,3],right:[0,.9,3.8],left:[0,.9,-3.8],front:[3.8,.85,0],rear:[-3.8,.85,0],top:[0,4,.001]};camera.position.set(...views[view]);controls.target.set(0,.65,0);fit();invalidate();}
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
