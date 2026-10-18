import * as T from 'three';
import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {defaultBikeDimensions,parseBikeDimensions,visualComponents,type BikeDimensions} from '../../shared/bike-visual.ts';
import {buildBodywork} from './ktm-bodywork.ts';
import {buildChassis} from './ktm-chassis.ts';
import {buildPowertrain} from './ktm-powertrain.ts';
/** Editable photo-traced surface authoring. Still pending OEM likeness acceptance.
 * Reproducible headless GLB export; no runtime downloads or photographic billboards. */
export function createBikeModel(input:BikeDimensions=defaultBikeDimensions){
 const d=parseBikeDimensions(input),root=new T.Group();root.name='BAK_KTM_450_SXF_2025_BLOCKOUT';
 root.userData={accuracy:'BLOCKOUT_NOT_OEM_VERIFIED',units:'meters',identity:'KTM|450 SX-F|2025|standard|US',dimensions:d,refinement:'authored-surfaces-2026-10-18-pass4'};
 const mats={orange:new T.MeshPhysicalMaterial({color:0xff5a00,metalness:0,roughness:.43,clearcoat:.34,clearcoatRoughness:.46,envMapIntensity:.92}),black:new T.MeshStandardMaterial({color:0x0c0f11,metalness:.02,roughness:.66,envMapIntensity:.68}),darkMetal:new T.MeshStandardMaterial({color:0x252a2d,metalness:.72,roughness:.39,envMapIntensity:.92}),rubber:new T.MeshStandardMaterial({color:0x0b0d0f,metalness:0,roughness:.98,envMapIntensity:.42}),seat:new T.MeshStandardMaterial({color:0x141719,metalness:0,roughness:.94,envMapIntensity:.52}),silver:new T.MeshStandardMaterial({color:0x969fa4,metalness:.78,roughness:.38,envMapIntensity:.96}),steel:new T.MeshStandardMaterial({color:0x626b70,metalness:.82,roughness:.36,envMapIntensity:.94}),engine:new T.MeshStandardMaterial({color:0x747b7d,metalness:.38,roughness:.64,envMapIntensity:.78}),white:new T.MeshStandardMaterial({color:0xd8d6d0,metalness:0,roughness:.58,envMapIntensity:.72})};
 Object.assign(mats.orange,{name:'oem-orange-plastic'});Object.assign(mats.black,{name:'black-polymer'});Object.assign(mats.rubber,{name:'rubber'});Object.assign(mats.engine,{name:'engine-cast'});
 const groups=Object.fromEntries(visualComponents.map(([id,label])=>{const g=new T.Group();g.name=id;g.userData={label,geometryStatus:'ESTIMATED',replacementBoundary:true};root.add(g);return[id,g];})) as Record<string,T.Group>;
 for(const id of ['stock-header','stock-muffler']){const g=new T.Group();g.name=id;groups.exhaust.add(g);}
 const kit=Object.fromEntries(['front-fender','number-plate','shrouds','side-panels','rear-fender','airbox-cover','fork-guards'].map(id=>{const g=new T.Group();g.name=id;groups.plastics.add(g);return [id,g];})) as Record<string,T.Group>;
 const target=(name:string,base:T.MeshStandardMaterial)=>{const mat=base.clone();mat.name=name;return mat;};
 root.userData.hardpoints={'muffler-mount':[-.59,.83,.18],'exhaust-port':[.18,.81,.12],'steering-stem':[.39,1.03,0],'engine-cradle':[0,.385,0],'frame-pivot':[-.20,.47,0],'radiator-mount':[.28,.82,0],'bar-clamp':[.38,1.14,0],'front-axle':[d.wheelbase/2,.347,0],'rear-axle':[-d.wheelbase/2,.333,0]};
 const context={root,groups,kit,mats,target,d};
 buildChassis(context);buildPowertrain(context);buildBodywork(context);
 consolidateComponents(root);root.updateMatrixWorld(true);return root;
}
export function disposeBikeModel(root:T.Object3D){const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();root.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}

/** Batch opaque geometry by material inside each replaceable component only.
 * Instanced tires remain instanced; no merge crosses a replacement boundary. */
function consolidateComponents(root:T.Group){
 const groups:T.Object3D[]=[];root.traverse(g=>{if(g instanceof T.Group)groups.push(g);});
 for(const group of groups){
  const batches=new Map<T.Material,T.Mesh[]>();
  for(const child of group.children)if(child instanceof T.Mesh&&!(child instanceof T.InstancedMesh)&&!Array.isArray(child.material)&&!child.userData.authoredSurface&&!['rear-sprocket-mesh','front-brake-disc','rear-brake-disc'].includes(child.name)&&group.name!=='stock-header'){
   const list=batches.get(child.material)??[];list.push(child);batches.set(child.material,list);
  }
  for(const [material,meshes] of batches){
   if(meshes.length<2)continue;
   const transformed=meshes.map(m=>{m.updateMatrix();const geometry=m.geometry.clone().applyMatrix4(m.matrix);const flat=geometry.index?geometry.toNonIndexed():geometry;if(flat!==geometry)geometry.dispose();flat.deleteAttribute('uv');return flat;});
   const merged=mergeGeometries(transformed,false);transformed.forEach(g=>g.dispose());
   if(!merged)continue;
   const indexed=mergeVertices(merged,1e-6);merged.dispose();const combined=new T.Mesh(indexed,material);combined.name=group.name+'-surface';combined.castShadow=true;combined.receiveShadow=true;
   for(const m of meshes){group.remove(m);m.geometry.dispose();}group.add(combined);
  }
 }
}
