import test from 'node:test';import assert from 'node:assert/strict';
import {Mesh,MeshStandardMaterial} from 'three';
import {createBikeModel,disposeBikeModel} from '../src/bike3d/model.ts';
import {applyVisualBuild} from '../src/bike3d/apply-build.ts';
import {resolveVisualBuild} from '../shared/build-visual.ts';
import {readFileSync} from 'node:fs';
test('GLB exporter respects hidden replaced stock meshes',()=>{
 assert.match(readFileSync(new URL('../src/bike3d/scene.ts',import.meta.url),'utf8'),/onlyVisible:true/);
});
function colors(root:ReturnType<typeof createBikeModel>){const result:Record<string,string[]>={};root.traverse(o=>{if(o instanceof Mesh&&o.material instanceof MeshStandardMaterial){const n=o.material.name;result[n]??=[];result[n].push(o.material.color.getHexString());}});return result;}
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
 bike.getObjectByName('stock-muffler')!.traverse(o=>{if(o instanceof Mesh&&o.material instanceof MeshStandardMaterial&&o.material.name==='exhaust')stock=o.material;});
 applyVisualBuild(bike,resolveVisualBuild({installed_parts:[{s:'exhaust',b:'FMF',n:'Factory 4.1 RCT Titanium Anodized SL (Slip-On) w/ Carbon Cap'}]}));
 const body=bike.getObjectByName('generic-slip-on')!.children[0] as Mesh;
 const mat=body.material as MeshStandardMaterial;
 assert.equal(mat.color.getHex(),stock!.color.getHex());assert.equal(mat.metalness,stock!.metalness);assert.equal(mat.roughness,stock!.roughness);disposeBikeModel(bike);
});
