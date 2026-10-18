import test from 'node:test';import assert from 'node:assert/strict';
import {Mesh,MeshStandardMaterial,Object3D,Raycaster,Vector3} from 'three';
import {createBikeModel,disposeBikeModel} from '../src/bike3d/model.ts';
import {applyVisualBuild} from '../src/bike3d/apply-build.ts';
import {resolveVisualBuild} from '../shared/build-visual.ts';
import {readFileSync} from 'node:fs';
test('GLB exporter respects hidden replaced stock meshes',()=>{
 assert.match(readFileSync(new URL('../src/bike3d/scene.ts',import.meta.url),'utf8'),/onlyVisible:true/);
});
function colors(root:ReturnType<typeof createBikeModel>){const result:Record<string,string[]>={};root.traverse(o=>{if(o instanceof Mesh&&o.material instanceof MeshStandardMaterial){const n=o.material.name;result[n]??=[];result[n].push(o.material.color.getHexString());}});return result;}
test('stock OEM materials retain distinct plastic seat rubber cast and machined response',()=>{
 const bike=createBikeModel(),materials=new Map<string,MeshStandardMaterial>();
 try{
  bike.traverse(o=>{if(o instanceof Mesh&&o.material instanceof MeshStandardMaterial&&o.material.name&&!materials.has(o.material.name))materials.set(o.material.name,o.material);});
  const plastics=materials.get('plastics')!,seat=materials.get('seat')!,rim=materials.get('front-rim')!,engine=materials.get('engine-cast')!;
  assert.ok(plastics&&seat&&rim&&engine);
  assert.equal(plastics.color.getHex(),0xff5a00);assert.equal(plastics.metalness,0);assert.ok(plastics.roughness>=.32&&plastics.roughness<=.46);assert.ok(plastics.envMapIntensity>=.8&&plastics.envMapIntensity<=1.2);
  assert.ok(seat.roughness>=.84);assert.ok(seat.color.getHex()<0x303030);
  assert.ok(rim.metalness>=.8&&rim.roughness>=.2&&rim.roughness<=.4);
  assert.ok(engine.metalness<rim.metalness&&engine.roughness>rim.roughness);
 }finally{disposeBikeModel(bike);}
});
test('every tier-1 finish target is independent and restores stock',()=>{
 const bike=createBikeModel(),before=colors(bike);
 for(const target of ['bars','grips','clamps','front-rim','rear-rim','front-hub','rear-hub','front-spokes','rear-spokes','chain','rear-sprocket','exhaust','seat']){
  assert.ok(before[target]?.length,`missing ${target}`);
  applyVisualBuild(bike,{parts:[{mappingId:'test',target,hardpoint:'bar-clamp',label:'test',color:{id:'blue',name:'Blue',hex:'#124ace',finish:'anodized',status:'APPROXIMATE',source:'test'}}]});
  const after=colors(bike);assert.notDeepEqual(after[target],before[target]);
  for(const k of Object.keys(before))if(k!==target)assert.deepEqual(after[k],before[k],`${target} affected ${k}`);
  applyVisualBuild(bike,{parts:[]});assert.deepEqual(colors(bike),before);
 }
 disposeBikeModel(bike);
});
test('rim finish changes only rim materials and restores exactly on removal',()=>{
 const bike=createBikeModel(),before=colors(bike);applyVisualBuild(bike,resolveVisualBuild({installed_parts:[{s:'wheels',b:'Excel',n:'Takasago 1.60" x 21" Front Rim',color:'gold'}]}));const after=colors(bike);
 assert.notDeepEqual(before['front-rim'],after['front-rim']);for(const k of Object.keys(before))if(k!=='front-rim')assert.deepEqual(before[k],after[k]);
 applyVisualBuild(bike,resolveVisualBuild({}));assert.deepEqual(colors(bike),before);disposeBikeModel(bike);
});
test('clamp replacement and finish preserve both hydraulic master-cylinder bodies',()=>{
 const bike=createBikeModel(),controls=bike.getObjectByName('controls')!;
 // Probe the front face of each hydraulic reservoir, clear of its lid, lever
 // and handlebar. This checks physical parts even after material batching.
 const visible=(object:Object3D):boolean=>object.visible&&(!object.parent||visible(object.parent));
 const rays=[-1,1].map(side=>new Raycaster(new Vector3(.6,1.196,side*.252),new Vector3(-1,0,0)));
 const bodies=rays.map(ray=>{
  const hit=ray.intersectObject(controls,true).find(hit=>visible(hit.object));
  assert.ok(hit&&hit.object instanceof Mesh&&hit.object.material instanceof MeshStandardMaterial,'Master-cylinder front face must exist');
  assert.ok(hit.point.x>.37,'Probe must hit the reservoir rather than the handlebar behind it');
  return {object:hit.object,point:hit.point.clone(),color:hit.object.material.color.getHex()};
 });
 try{
  applyVisualBuild(bike,{parts:[{mappingId:'test',asset:'generic-clamps',target:'clamps',hardpoint:'steering-stem',label:'test',color:{id:'blue',name:'Blue',hex:'#124ace',finish:'anodized',status:'APPROXIMATE',source:'test'}}]});
  rays.forEach((ray,i)=>{
   const hit=ray.intersectObject(controls,true).find(hit=>visible(hit.object));
   assert.ok(hit,'Clamp replacement must leave each master-cylinder body visible');
   assert.equal(hit.object,bodies[i].object,'Clamp replacement must not expose a different component behind the reservoir');
   assert.ok(hit.point.distanceTo(bodies[i].point)<1e-7);
   assert.equal((bodies[i].object.material as MeshStandardMaterial).color.getHex(),bodies[i].color,'Clamp finish must not recolor the reservoirs');
  });
 }finally{disposeBikeModel(bike);}
});
test('hub finish targets stay inside the hub and exclude peripheral wheel hardware',()=>{
 const bike=createBikeModel();
 try{
  for(const end of ['front','rear']){
   const wheel=bike.getObjectByName(`${end}-wheel`)!;let vertices=0;
   wheel.traverse(object=>{
    if(!(object instanceof Mesh&&object.material instanceof MeshStandardMaterial&&object.material.name===`${end}-hub`))return;
    const position=object.geometry.getAttribute('position');
    for(let i=0;i<position.count;i++){
     const point=wheel.worldToLocal(object.localToWorld(new Vector3().fromBufferAttribute(position,i)));vertices++;
     // A hub occupies the center and flange envelope. Nipples, rim marks,
     // caliper/carrier details and axle end hardware are separate components.
     assert.ok(Math.hypot(point.x,point.y)<=.060,`${end} hub finish reaches peripheral wheel hardware`);
     assert.ok(Math.abs(point.z)<=.064,`${end} hub finish reaches external axle hardware`);
    }
   });
   assert.ok(vertices>0,`${end} hub must retain its selectable finish`);
  }
 }finally{disposeBikeModel(bike);}
});
test('representative accessories attach, replace only their slot, and remove cleanly',()=>{
 for(const [asset,target,hardpoint] of [['generic-fatbar','bars','bar-clamp'],['generic-crossbar','bars','bar-clamp'],['generic-clamps','clamps','steering-stem'],['generic-skid-plate','skid-plate','engine-cradle'],['generic-frame-guards','frame-guards','frame-pivot'],['generic-radiator-braces','radiator-braces','radiator-mount'],['generic-hand-guards','hand-guards','bar-clamp']] as const){
  const bike=createBikeModel(),before=colors(bike);
  applyVisualBuild(bike,{parts:[{mappingId:'test',asset,target,hardpoint,label:'shown as: generic'}]});
  const replacement=bike.getObjectByName(asset);assert.ok(replacement,asset);assert.equal(replacement.userData.tier,2);
  assert.deepEqual(replacement.position.toArray(),bike.userData.hardpoints[hardpoint]);
  applyVisualBuild(bike,{parts:[]});assert.equal(bike.getObjectByName(asset),undefined);assert.deepEqual(colors(bike),before);disposeBikeModel(bike);
 }
});
test('plastics have separate named kit pieces and exhaust replacement restores stock',()=>{
 const bike=createBikeModel();for(const n of ['front-fender','number-plate','shrouds','side-panels','rear-fender','airbox-cover','fork-guards'])assert.ok(bike.getObjectByName(n));
 applyVisualBuild(bike,resolveVisualBuild({plastics_color:'white',installed_parts:[{s:'exhaust',b:'FMF',n:'Factory 4.1 RCT Titanium Anodized Full System w/ Carbon End Cap'}]}));
 assert.ok(bike.getObjectByName('generic-full-exhaust'));applyVisualBuild(bike,resolveVisualBuild({}));assert.equal(bike.getObjectByName('generic-full-exhaust'),undefined);disposeBikeModel(bike);
});
test('slip-on inlet joins the retained OEM header',()=>{
 const bike=createBikeModel();
 applyVisualBuild(bike,{parts:[{mappingId:'test',asset:'generic-slip-on',target:'exhaust-muffler',hardpoint:'muffler-mount',label:'test'}]});bike.updateMatrixWorld(true);
 const header=bike.getObjectByName('stock-header')!.children[0] as Mesh;
 const inlet=bike.getObjectByName('slip-on-inlet') as Mesh;assert.ok(inlet);
 const outlet=header.localToWorld((header.geometry as import('three').TubeGeometry).parameters.path.getPoint(1));
 const entry=inlet.localToWorld((inlet.geometry as import('three').TubeGeometry).parameters.path.getPoint(0));
 assert.ok(outlet.distanceTo(entry)<1e-6);disposeBikeModel(bike);
});
test('slip-on preserves the OEM header and restores the OEM muffler on removal',()=>{
 const bike=createBikeModel();
 applyVisualBuild(bike,resolveVisualBuild({installed_parts:[{s:'exhaust',b:'FMF',n:'Factory 4.1 RCT Titanium Anodized SL (Slip-On) w/ Carbon Cap',color:'blue-anodized'}]}));
 assert.ok(bike.getObjectByName('generic-slip-on'));assert.equal(bike.getObjectByName('stock-muffler')?.visible,false);
 assert.equal(bike.getObjectByName('stock-header')?.visible,true);
 applyVisualBuild(bike,{parts:[]});assert.equal(bike.getObjectByName('stock-muffler')?.visible,true);assert.equal(bike.getObjectByName('generic-slip-on'),undefined);disposeBikeModel(bike);
});
test('unknown slip-on finish inherits stock muffler appearance',()=>{
 const bike=createBikeModel();let stock:MeshStandardMaterial|undefined;
 bike.getObjectByName('stock-muffler')!.traverse(o=>{if(o instanceof Mesh&&o.material instanceof MeshStandardMaterial&&o.material.userData.representativeFinish)stock=o.material;});
 assert.ok(stock,'The black stock muffler shell supplies the fallback finish');
 applyVisualBuild(bike,resolveVisualBuild({installed_parts:[{s:'exhaust',b:'FMF',n:'Factory 4.1 RCT Titanium Anodized SL (Slip-On) w/ Carbon Cap'}]}));
 const body=bike.getObjectByName('generic-slip-on')!.children[0] as Mesh;
 const mat=body.material as MeshStandardMaterial;
 assert.equal(mat.color.getHex(),stock!.color.getHex());assert.equal(mat.metalness,stock!.metalness);assert.equal(mat.roughness,stock!.roughness);disposeBikeModel(bike);
});
