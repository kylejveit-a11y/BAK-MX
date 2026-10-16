import test from 'node:test';
import assert from 'node:assert/strict';
import {Scene,Mesh,MeshStandardMaterial} from 'three';
import {fitCameraDistance,replaceBikeModel,mountBikeScene} from '../src/bike3d/scene.ts';
import {createBikeModel,disposeBikeModel} from '../src/bike3d/model.ts';
test('portrait camera fits a complete bounding sphere',()=>{
 const radius=1.3,aspect=300/360,fov=35;
 const distance=fitCameraDistance(radius,fov,aspect);
 const halfHorizontal=Math.atan(Math.tan(fov*Math.PI/360)*aspect);
 assert.ok(distance*Math.sin(halfHorizontal)>radius);
 assert.ok(fitCameraDistance(radius,fov,.4)>distance);
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
