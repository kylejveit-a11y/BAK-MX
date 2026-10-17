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
test('rim finish changes only rim materials and restores exactly on removal',()=>{
 const bike=createBikeModel(),before=colors(bike);applyVisualBuild(bike,resolveVisualBuild({installed_parts:[{s:'wheels',b:'Excel',n:'Takasago 1.60" x 21" Front Rim',color:'gold'}]}));const after=colors(bike);
 assert.notDeepEqual(before['front-rim'],after['front-rim']);for(const k of Object.keys(before))if(k!=='front-rim')assert.deepEqual(before[k],after[k]);
 applyVisualBuild(bike,resolveVisualBuild({}));assert.deepEqual(colors(bike),before);disposeBikeModel(bike);
});
test('plastics have separate named kit pieces and exhaust replacement restores stock',()=>{
 const bike=createBikeModel();for(const n of ['front-fender','number-plate','shrouds','side-panels','rear-fender','airbox-cover','fork-guards'])assert.ok(bike.getObjectByName(n));
 applyVisualBuild(bike,resolveVisualBuild({plastics_color:'white',installed_parts:[{s:'exhaust',b:'FMF',n:'Factory 4.1 RCT Titanium Anodized Full System w/ Carbon End Cap'}]}));
 assert.ok(bike.getObjectByName('generic-full-exhaust'));applyVisualBuild(bike,resolveVisualBuild({}));assert.equal(bike.getObjectByName('generic-full-exhaust'),undefined);disposeBikeModel(bike);
});
