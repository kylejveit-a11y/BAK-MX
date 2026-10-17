import test from 'node:test';
import assert from 'node:assert/strict';
import {Mesh,Box3,Vector3} from 'three';
import {createBikeModel,disposeBikeModel} from '../src/bike3d/model.ts';
test('OEM study keeps chain drive left and rear brake right',()=>{
 const bike=createBikeModel();
 assert.ok(new Box3().setFromObject(bike.getObjectByName('drivetrain')!).max.z<0);
 const rearBrake=bike.getObjectByName('rear-brake-disc');assert.ok(rearBrake);
 assert.ok(new Box3().setFromObject(rearBrake).min.z>0);
 disposeBikeModel(bike);
});
test('OEM rear sprocket carries the catalog 51 teeth with real cut-out geometry',()=>{
 const bike=createBikeModel(),sprocket=bike.getObjectByName('rear-sprocket-mesh') as Mesh;
 assert.ok(sprocket);assert.equal(sprocket.userData.teeth,51);
 assert.ok(sprocket.geometry.getAttribute('position').count>1000);
 const size=new Box3().setFromObject(sprocket).getSize(new Vector3());
 assert.ok(size.x>.25&&size.x<.28);disposeBikeModel(bike);
});
test('model has finite original geometry with removable exterior groups',()=>{
 const bike=createBikeModel();
 for(const name of ['front-wheel','rear-wheel','exhaust','plastics','seat','frame','engine','fork','shock'])assert.ok(bike.getObjectByName(name),name);
 let meshes=0;bike.traverse(o=>{if(o instanceof Mesh){meshes++;const p=o.geometry.getAttribute('position');for(const n of p.array)assert.ok(Number.isFinite(n));}});
 assert.ok(meshes>20);assert.ok(meshes<70, `Expected batched components, got ${meshes} meshes`);
 const size=new Box3().setFromObject(bike).getSize(new Vector3());assert.ok(size.x>2&&size.x<2.5);assert.ok(size.y>1&&size.y<1.5);
 const f=bike.getObjectByName('front-wheel')!,r=bike.getObjectByName('rear-wheel')!;assert.ok(Math.abs(f.position.x-r.position.x-1.493)<1e-8);
 assert.equal(bike.userData.accuracy,'BLOCKOUT_NOT_OEM_VERIFIED');disposeBikeModel(bike);
});
