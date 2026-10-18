import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Box3,Mesh,Vector3} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

class NodeFileReader {
 async readAsArrayBuffer(blob){try{this.result=await blob.arrayBuffer();this.onloadend?.();}catch(error){this.onerror?.(error);}}
 async readAsDataURL(blob){try{this.result=`data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`;this.onloadend?.();}catch(error){this.onerror?.(error);}}
}
globalThis.FileReader=NodeFileReader;

async function loadMaster(){
 const bytes=await readFile(new URL('../public/bike-builder/ktm-450-sxf-2025.glb',import.meta.url));
 return (await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')).scene;
}

test('shipped GLB is the Blender reconstruction master with an honest identity boundary',async()=>{
 const bike=await loadMaster();
 assert.equal(bike.userData.identity,'KTM|450 SX-F|2025|standard|US');
 assert.equal(bike.userData.accuracy,'BLOCKOUT_NOT_OEM_VERIFIED');
 assert.equal(bike.userData.authoring,'BLENDER_RECONSTRUCTION');
 assert.equal(bike.userData.referenceYear,2025);
});

test('reconstruction exposes coherent visible shells and preserved replacement groups',async()=>{
 const bike=await loadMaster();
 for(const name of ['front-wheel','rear-wheel','frame','engine','exhaust','plastics','seat','fork','shock'])
  assert.ok(bike.getObjectByName(name),`missing replacement group ${name}`);
 for(const name of [
  'front-fender-shell','number-plate-shell','right-radiator-shroud-shell','left-radiator-shroud-shell',
  'right-side-panel-shell','left-side-panel-shell','rear-fender-shell','seat-shell',
  'engine-crankcase-shell','engine-cylinder-shell','engine-head-shell','stock-header-primary','stock-muffler-shell'
 ]){
  const object=bike.getObjectByName(name);
  assert.ok(object instanceof Mesh,`missing coherent authored mesh ${name}`);
  assert.ok(object.geometry.getAttribute('position').count>=24,`${name} is still a primitive-grade mesh`);
 }
});

test('body shells carry real transverse curvature instead of flat extruded cards',async()=>{
 const bike=await loadMaster();
 for(const name of ['right-radiator-shroud-shell','left-radiator-shroud-shell','right-side-panel-shell','left-side-panel-shell','seat-shell']){
  const object=bike.getObjectByName(name);assert.ok(object instanceof Mesh);
  object.updateWorldMatrix(true,false);
  const normals=object.geometry.getAttribute('normal');assert.ok(normals,`${name} has no normals`);
  const transformed=[];
  for(let index=0;index<normals.count;index+=Math.max(1,Math.floor(normals.count/200)))
   transformed.push(new Vector3().fromBufferAttribute(normals,index).transformDirection(object.matrixWorld));
  const lateral=transformed.map(normal=>Math.abs(normal.z));
  const foreAft=transformed.map(normal=>Math.abs(normal.x));
  assert.ok(Math.max(...lateral)>.65,`${name} has no outward side surface`);
  assert.ok(Math.max(...foreAft)>.25,`${name} has no wrapped edge/crown curvature`);
 }
});

test('materials separate molded plastic, vinyl, rubber, cast alloy and exhaust finishes',async()=>{
 const bike=await loadMaster();
 const names=new Set();bike.traverse(object=>{if(object instanceof Mesh)for(const material of Array.isArray(object.material)?object.material:[object.material])names.add(material.name);});
 for(const name of ['KTM Orange Molded','Seat Gripper Vinyl','Tire Rubber','Cast Aluminum','Cast Magnesium','Brushed Exhaust','Black Muffler'])
  assert.ok(names.has(name),`missing authored material ${name}`);
});

test('fixed 2025 stance remains within the documented exterior-study envelope',async()=>{
 const bike=await loadMaster();bike.updateMatrixWorld(true);
 const bounds=new Box3().setFromObject(bike),size=bounds.getSize(new Vector3());
 assert.ok(size.x>2.05&&size.x<2.30,`unexpected overall length ${size.x}`);
 assert.ok(size.y>1.15&&size.y<1.40,`unexpected overall height ${size.y}`);
 const front=bike.getObjectByName('front-wheel'),rear=bike.getObjectByName('rear-wheel');assert.ok(front&&rear);
 const frontCenter=new Box3().setFromObject(front).getCenter(new Vector3()),rearCenter=new Box3().setFromObject(rear).getCenter(new Vector3());
 assert.ok(Math.abs(frontCenter.x-rearCenter.x-1.493)<.015,'wheel centers drifted from the fixed authored stance');
 assert.ok(Math.abs(frontCenter.y-.347)<.015,'front wheel no longer meets the ground plane');
 assert.ok(Math.abs(rearCenter.y-.333)<.015,'rear wheel no longer meets the ground plane');
});
