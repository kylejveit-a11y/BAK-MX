import test from 'node:test';
import assert from 'node:assert/strict';
import {Mesh,Box3,Vector3,Raycaster} from 'three';
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
test('sprocket cut-outs are open and molded plastics face outward',()=>{
 const bike=createBikeModel(),gear=bike.getObjectByName('rear-sprocket-mesh') as Mesh;
 for(const [x,y] of [[0,0],[.075,0]]){
  const origin=gear.localToWorld(new Vector3(x,y,.1));
  assert.equal(new Raycaster(origin,new Vector3(0,0,-1)).intersectObject(gear).length,0);
 }
 assert.ok(new Raycaster(gear.localToWorld(new Vector3(.11,0,.1)),new Vector3(0,0,-1)).intersectObject(gear).length>0);
 const shrouds=bike.getObjectByName('shrouds')!;
 for(const child of shrouds.children){if(!(child instanceof Mesh))continue;const p=child.geometry.getAttribute('position'),n=child.geometry.getAttribute('normal');assert.ok(p.getZ(0)*n.getZ(0)>0,'outer ridge must face the rider-facing exterior');}
 disposeBikeModel(bike);
});
test('molded panels retain outward triangles throughout supported seat adjustment',()=>{
 for(const seatHeight of [.85,1.1]){
  const bike=createBikeModel({wheelbase:1.493,seatHeight});
  for(const id of ['shrouds','side-panels','airbox-cover'])for(const child of bike.getObjectByName(id)!.children){
   if(!(child instanceof Mesh)||!child.geometry.index)continue;
   const p=child.geometry.getAttribute('position'),idx=child.geometry.index;
   // Molded cap triangles each start at the ridge; skip the separate fasteners.
   if(p.count!==16&&p.count!==10)continue;
   for(let i=0;i<idx.count;i+=12){const a=new Vector3().fromBufferAttribute(p,idx.getX(i)),b=new Vector3().fromBufferAttribute(p,idx.getX(i+1)),c=new Vector3().fromBufferAttribute(p,idx.getX(i+2));assert.ok(b.sub(a).cross(c.sub(a)).z*p.getZ(0)>0,`${id} at ${seatHeight}`);}
  }disposeBikeModel(bike);
 }
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
