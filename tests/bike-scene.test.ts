import test from 'node:test';
import assert from 'node:assert/strict';
import {Scene,Mesh,MeshStandardMaterial,Vector3} from 'three';
import {fitCameraDistance,replaceBikeModel,mountBikeScene} from '../src/bike3d/scene.ts';
import {fitDistanceForPoints} from '../src/bike3d/camera-fit.ts';
import {createBikeModel,disposeBikeModel} from '../src/bike3d/model.ts';
test('portrait camera fits a complete bounding sphere',()=>{
 const radius=1.3,aspect=300/360,fov=35;
 const distance=fitCameraDistance(radius,fov,aspect);
 const halfHorizontal=Math.atan(Math.tan(fov*Math.PI/360)*aspect);
 assert.ok(distance*Math.sin(halfHorizontal)>radius);
 assert.ok(fitCameraDistance(radius,fov,.4)>distance);
});
const boxPoints=(min:Vector3,max:Vector3)=>[0,1].flatMap(x=>[0,1].flatMap(y=>[0,1].map(z=>new Vector3(x?max.x:min.x,y?max.y:min.y,z?max.z:min.z))));
test('projected camera fitting keeps every corner inside wide square and portrait frusta',()=>{
 const points=boxPoints(new Vector3(-1.12,-.53,-.24),new Vector3(1.12,.53,.24));
 const target=new Vector3(),direction=new Vector3(2,.55,3).normalize(),up=new Vector3(0,1,0),fov=35,margin=1.08;
 for(const aspect of [2.4,1,.45]){
  const distance=fitDistanceForPoints(points,target,direction,up,fov,aspect,margin);
  const right=new Vector3().crossVectors(up,direction).normalize(),cameraUp=new Vector3().crossVectors(direction,right).normalize();
  const tanV=Math.tan(fov*Math.PI/360),tanH=tanV*aspect;
  for(const point of points){
   const relative=point.clone().sub(target),depth=distance-relative.dot(direction);
   assert.ok(depth>0);
   assert.ok(Math.abs(relative.dot(right))*margin<=depth*tanH+1e-12,`horizontal clip at aspect ${aspect}`);
   assert.ok(Math.abs(relative.dot(cameraUp))*margin<=depth*tanV+1e-12,`vertical clip at aspect ${aspect}`);
  }
 }
});
test('projected camera fitting uses framing margin and rejects degenerate inputs',()=>{
 const points=boxPoints(new Vector3(-1,-.5,-.2),new Vector3(1,.5,.2)),target=new Vector3(),direction=new Vector3(2,.4,3),up=new Vector3(0,1,0);
 assert.ok(fitDistanceForPoints(points,target,direction,up,35,1.8,1.15)>fitDistanceForPoints(points,target,direction,up,35,1.8,1.02));
 assert.throws(()=>fitDistanceForPoints([],target,direction,up,35,1.8,1.08),/point/i);
 assert.throws(()=>fitDistanceForPoints(points,target,new Vector3(),up,35,1.8,1.08),/direction/i);
 assert.throws(()=>fitDistanceForPoints(points,target,direction,up,0,1.8,1.08),/field of view/i);
 assert.throws(()=>fitDistanceForPoints(points,target,direction,up,35,0,1.08),/aspect/i);
});
test('dimension edits preserve hidden groups and wireframe inspection',()=>{
 const scene=new Scene(),old=createBikeModel();scene.add(old);old.getObjectByName('exhaust')!.visible=false;
 old.traverse(o=>{if(o instanceof Mesh&&(o.material instanceof MeshStandardMaterial))o.material.wireframe=true;});
 const next=replaceBikeModel(scene,old,{wheelbase:1.5,seatHeight:.96});
 assert.equal(next.getObjectByName('exhaust')!.visible,false);assert.equal(scene.children.length,1);assert.equal(old.parent,null);
 let wire=true;next.traverse(o=>{if(o instanceof Mesh&&o.material instanceof MeshStandardMaterial)wire&&=o.material.wireframe;});assert.ok(wire);disposeBikeModel(next);
});
test('invalid input fails before any browser or GPU resources are accessed',()=>{
 assert.throws(()=>mountBikeScene(null as unknown as HTMLElement,{wheelbase:NaN,seatHeight:.958},()=>{}),e=>e instanceof Error&&e.name==='ZodError');
});
