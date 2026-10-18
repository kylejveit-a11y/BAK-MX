import test from 'node:test';
import assert from 'node:assert/strict';
import {Mesh,Box3,Vector3,Raycaster,Matrix3,Triangle,Group,MeshStandardMaterial,Matrix4} from 'three';
import {createBikeModel,disposeBikeModel} from '../src/bike3d/model.ts';
import {loft,type V} from '../src/bike3d/authoring.ts';
test('concave loft caps preserve the open channel and face outward in every projection plane',()=>{
 const profile=[[0,0],[3,0],[3,3],[2,3],[2,1],[1,1],[1,3],[0,3]];
 const transforms=[new Matrix4(),new Matrix4().makeRotationZ(Math.PI/2),new Matrix4().makeRotationY(Math.PI/2),new Matrix4().makeRotationY(.63).multiply(new Matrix4().makeRotationZ(.42))];
 for(const transform of transforms)for(const reverse of [false,true]){
  const rings=[0,1].map(x=>profile.map(([y,z])=>new Vector3(x,y,z).applyMatrix4(transform).toArray() as V));
  if(reverse)rings.forEach(ring=>ring.reverse());
  const root=new Group(),body=loft(root,rings,new MeshStandardMaterial());
  try{
   root.updateMatrixWorld(true);
   for(const end of [0,1]){
    const origin=new Vector3(end===0?-1:2,.5,2).applyMatrix4(transform),direction=new Vector3(end===0?1:-1,0,0).transformDirection(transform);
    assert.ok(new Raycaster(origin,direction).intersectObject(body).length,'Solid cap region must remain visible');
    origin.copy(new Vector3(end===0?-1:2,1.5,2).applyMatrix4(transform));
    assert.equal(new Raycaster(origin,direction).intersectObject(body).length,0,'Concave channel must not be filled by cap triangles');
   }
   const positions=body.geometry.getAttribute('position'),index=body.geometry.index!,inverse=transform.clone().invert(),areas=[0,0];
   for(let i=0;i<index.count;i+=3){
    const points=[0,1,2].map(j=>new Vector3().fromBufferAttribute(positions,index.getX(i+j)).applyMatrix4(inverse));
    const end=[0,1].find(x=>points.every(p=>Math.abs(p.x-x)<1e-6));
    if(end===undefined)continue;
    const normal=points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0]));
    assert.ok(normal.x*(end===0?-1:1)>0,'Every cap triangle must face outward');
    areas[end]+=normal.length()/2;
   }
   for(const area of areas)assert.ok(Math.abs(area-7)<1e-5,'Triangulation must cover exactly the concave profile area');
  }finally{disposeBikeModel(root);}
 }
});
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
test('sprocket cut-outs remain open geometry',()=>{
 const bike=createBikeModel(),gear=bike.getObjectByName('rear-sprocket-mesh') as Mesh;
 for(const [x,y] of [[0,0],[.075,0]]){
  const origin=gear.localToWorld(new Vector3(x,y,.1));
  assert.equal(new Raycaster(origin,new Vector3(0,0,-1)).intersectObject(gear).length,0);
 }
 assert.ok(new Raycaster(gear.localToWorld(new Vector3(.11,0,.1)),new Vector3(0,0,-1)).intersectObject(gear).length>0);
 disposeBikeModel(bike);
});
test('authored molded panels present outward surfaces throughout supported seat adjustment',()=>{
 // Interior points on each traced panel, away from bolts, edges and graphic overlays.
 // A ray into the isolated panel tests actual surface winding and smooth normals,
 // without depending on its tessellation, vertex ordering, or triangle count.
 const samples:[string,number,number][]=[
  ['shroud-molded',.1103,.8745],
  ['side-number-panel',-.3663,.7909],
  ['airbox-cover',-.2573,.7985],
 ];
 for(const seatHeight of [.85,.958,1.1]){
  const bike=createBikeModel({wheelbase:1.493,seatHeight});
  try{
   for(const [id,x,y] of samples)for(const side of [-1,1]){
    const name=`${id}-${side}`,panel=bike.getObjectByName(name);
    assert.ok(panel instanceof Mesh,`Missing authored panel ${name}`);
    const height=.65+(y-.65)*(seatHeight-.65)/(.958-.65);
    const hit=new Raycaster(new Vector3(x,height,side*.5),new Vector3(0,0,-side)).intersectObject(panel,false)[0];
    assert.ok(hit,`${name} must be visible from its exterior at seat ${seatHeight}`);
    assert.ok(hit.point.z*side>.08,`${name} ray must hit the same side of the bike`);
    assert.ok(hit.face,`${name} must have an intersected surface triangle`);
    const normalMatrix=new Matrix3().getNormalMatrix(panel.matrixWorld);
    const geometric=hit.face.normal.clone().applyMatrix3(normalMatrix).normalize();
    assert.ok(geometric.z*side>.5,`${name} geometric normal faces inward at seat ${seatHeight}`);
    // Raycaster flips its reported interpolated normal toward the ray. Read the
    // authored normal attribute directly so inverted shading cannot pass.
    const positions=panel.geometry.getAttribute('position'),normals=panel.geometry.getAttribute('normal');
    assert.ok(normals,`${name} must provide smooth surface normals`);
    const {a,b,c}=hit.face;
    const bary=Triangle.getBarycoord(panel.worldToLocal(hit.point.clone()),new Vector3().fromBufferAttribute(positions,a),new Vector3().fromBufferAttribute(positions,b),new Vector3().fromBufferAttribute(positions,c),new Vector3());
    assert.ok(bary,`${name} must have a nondegenerate surface triangle`);
    const smooth=new Vector3().fromBufferAttribute(normals,a).multiplyScalar(bary.x)
     .addScaledVector(new Vector3().fromBufferAttribute(normals,b),bary.y)
     .addScaledVector(new Vector3().fromBufferAttribute(normals,c),bary.z).applyMatrix3(normalMatrix).normalize();
    assert.ok(smooth.z*side>.5,`${name} interpolated normal faces inward at seat ${seatHeight}`);
   }
  }finally{disposeBikeModel(bike);}
 }
});
test('molded bodywork keeps visible shoulder crown instead of collapsing into flat cards',()=>{
 const bike=createBikeModel();
 try{
  const depth=(name:string)=>new Box3().setFromObject(bike.getObjectByName(name)!).getSize(new Vector3()).z;
  assert.ok(depth('shroud-molded-1')>.15,'right shroud needs a pronounced radiator shoulder');
  assert.ok(depth('shroud-molded--1')>.15,'left shroud needs a pronounced radiator shoulder');
  assert.ok(depth('side-number-panel-1')>.055,'right number panel needs molded crown and edge return');
  assert.ok(depth('side-number-panel--1')>.045,'left number panel needs molded crown and edge return');
 }finally{disposeBikeModel(bike);}
});
test('side panel and airbox carry a compound shoulder instead of one broad slope',()=>{
 const bike=createBikeModel();
 try{
  bike.updateMatrixWorld(true);
  const sample=(name:string,side:number,x:number,y:number)=>{
   const object=bike.getObjectByName(`${name}-${side}`);assert.ok(object instanceof Mesh,`${name}-${side} is missing`);
   const hit=new Raycaster(new Vector3(x,y,side*.5),new Vector3(0,0,-side)).intersectObject(object,false)[0];
   assert.ok(hit,`${name}-${side} must cover the shoulder sample at ${x}, ${y}`);return hit.point.z*side;
  };
  for(const side of [-1,1]){
   const panelCrown=sample('side-number-panel',side,-.36,.80)-Math.max(sample('side-number-panel',side,-.42,.80),sample('side-number-panel',side,-.28,.80));
   assert.ok(panelCrown>.0045,`side-panel ${side} shoulder crown is only ${panelCrown.toFixed(4)}m`);
   const airboxCrown=sample('airbox-cover',side,-.36,.82)-Math.max(sample('airbox-cover',side,-.38,.82),sample('airbox-cover',side,-.30,.82));
   assert.ok(airboxCrown>.007,`airbox ${side} shoulder crown is only ${airboxCrown.toFixed(4)}m`);
  }
 }finally{disposeBikeModel(bike);}
});
test('front number plate is a compact tapered shell with independent side returns',()=>{
 const bike=createBikeModel();
 try{
  const face=bike.getObjectByName('number-plate-molded');assert.ok(face instanceof Mesh);
  face.geometry.computeBoundingBox();const size=face.geometry.boundingBox!.getSize(new Vector3());
  assert.ok(size.x<.195,`number plate face is still too wide at ${size.x.toFixed(3)}m`);
  assert.ok(size.y<.255,`number plate face is still too tall at ${size.y.toFixed(3)}m`);
  for(const side of [-1,1]){
   const returned=bike.getObjectByName(`number-plate-side-return-${side}`);assert.ok(returned instanceof Mesh,`number plate ${side} side return is missing`);
   returned.geometry.computeBoundingBox();
   assert.ok(returned.geometry.boundingBox!.getSize(new Vector3()).z>.014,`number plate ${side} return needs molded depth`);
  }
 }finally{disposeBikeModel(bike);}
});
test('front fender has a pronounced crown over a thin molded shell',()=>{
 const bike=createBikeModel();
 try{
  const fender=bike.getObjectByName('front-fender-crowned');assert.ok(fender instanceof Mesh);
  const positions=fender.geometry.getAttribute('position'),bounds=new Box3().setFromBufferAttribute(positions),centerX=(bounds.min.x+bounds.max.x)/2;
  let ringX=positions.getX(0);for(let i=1;i<positions.count;i++)if(Math.abs(positions.getX(i)-centerX)<Math.abs(ringX-centerX))ringX=positions.getX(i);
  const ring:{y:number,z:number}[]=[];for(let i=0;i<positions.count;i++)if(Math.abs(positions.getX(i)-ringX)<1e-5)ring.push({y:positions.getY(i),z:positions.getZ(i)});
  const halfWidth=Math.max(...ring.map(p=>Math.abs(p.z))),band=(at:number)=>ring.filter(p=>Math.abs(Math.abs(p.z)/halfWidth-at)<.04).map(p=>p.y);
  const center=band(0),edge=band(.95);assert.ok(center.length&&edge.length,'front fender inspection bands must exist');
  const centerTop=Math.max(...center),edgeTop=Math.max(...edge),centerThickness=centerTop-Math.min(...center),edgeThickness=edgeTop-Math.min(...edge);
  assert.ok(centerTop-edgeTop>.050,`front fender crown is only ${(centerTop-edgeTop).toFixed(3)}m`);
  assert.ok(centerThickness<.010,`front fender center is still ${centerThickness.toFixed(3)}m thick`);
  assert.ok(edgeThickness<.010,`front fender edge is still ${edgeThickness.toFixed(3)}m thick`);
 }finally{disposeBikeModel(bike);}
});
test('body junctions use a molded shroud shoulder and recessed tank-seat transition',()=>{
 const bike=createBikeModel();
 try{
  for(const side of [-1,1]){
   const shoulder=bike.getObjectByName(`shroud-upper-shoulder-${side}`),transition=bike.getObjectByName(`tank-seat-transition-${side}`);
   assert.ok(shoulder instanceof Mesh,`shroud ${side} upper shoulder is missing`);
   assert.ok(transition instanceof Mesh,`tank-seat ${side} transition is missing`);
   assert.ok(new Box3().setFromObject(shoulder).getSize(new Vector3()).z>.025,'shroud shoulder needs visible molded depth');
  }
 }finally{disposeBikeModel(bike);}
});
test('engine and exhaust retain stepped exterior depth without an oversized header loop',()=>{
 const bike=createBikeModel();
 try{
  for(const name of ['right-case-raised-step','cylinder-head-upper-step','right-water-pump-stepped-cover']){
   const detail=bike.getObjectByName(name);assert.ok(detail instanceof Mesh,`${name} is missing`);
   assert.ok(new Box3().setFromObject(detail).getSize(new Vector3()).z>.008,`${name} needs visible casting depth`);
  }
  const leftHeadStep=bike.getObjectByName('cylinder-head-upper-step-left');assert.ok(leftHeadStep instanceof Mesh,'left cylinder-head step is missing');
  assert.ok(new Box3().setFromObject(leftHeadStep).min.z<-.128,'left cylinder-head step must sit outside the base casting');
  const header=bike.getObjectByName('stock-header-primary-tube') as Mesh;
  assert.ok(header);assert.ok((header.geometry as import('three').TubeGeometry).parameters.radius<.019,'header primary tube remains visually oversized');
  const chamber=bike.getObjectByName('formed-header-crescent-resonator');assert.ok(chamber);
  assert.ok(new Box3().setFromObject(chamber).getSize(new Vector3()).z>.095,'formed header chamber needs stepped pressed depth');
 }finally{disposeBikeModel(bike);}
});
test('valve cover and stock exhaust keep compact layered silhouettes',()=>{
 const bike=createBikeModel();
 try{
  for(const side of [-1,1]){
   const deck=bike.getObjectByName(`valve-cover-raised-deck-${side}`);assert.ok(deck instanceof Mesh,`valve-cover ${side} raised deck is missing`);
   const bounds=new Box3().setFromObject(deck);
   assert.ok(bounds.getSize(new Vector3()).z>.012,`valve-cover ${side} raised deck needs visible depth`);
   assert.ok(side>0?bounds.max.z>.105:bounds.min.z<-.105,`valve-cover ${side} deck must stand outside the base cover`);
  }
  const header=bike.getObjectByName('stock-header-primary-tube');assert.ok(header instanceof Mesh);
  const headerBounds=new Box3().setFromObject(header);
  assert.ok(headerBounds.max.z<.215,`header forward loop still sits ${headerBounds.max.z.toFixed(3)}m outside the bike`);
  const muffler=bike.getObjectByName('stock-black-tapered-muffler');assert.ok(muffler instanceof Mesh);
  const mufflerSize=new Box3().setFromObject(muffler).getSize(new Vector3());
  assert.ok(mufflerSize.z<.09,`stock muffler remains ${mufflerSize.z.toFixed(3)}m deep`);
 }finally{disposeBikeModel(bike);}
});
test('fork separates dark anodized outer tubes from bright lower stanchions',()=>{
 const bike=createBikeModel();
 try{
  for(const side of [-1,1]){
   const upper=bike.getObjectByName(`fork-upper-outer-${side}`),lower=bike.getObjectByName(`fork-lower-stanchion-${side}`);
   assert.ok(upper instanceof Mesh&&lower instanceof Mesh,`fork ${side} keeps inspectable tube surfaces`);
   assert.ok(upper.material instanceof MeshStandardMaterial&&lower.material instanceof MeshStandardMaterial);
   assert.ok(upper.material.color.getHex()<0x404040,'outer fork tube must read as dark anodized alloy');
   assert.ok(lower.material.color.getHex()>upper.material.color.getHex(),'lower stanchion must remain visually distinct');
  }
 }finally{disposeBikeModel(bike);}
});
test('model has finite original geometry with removable exterior groups',()=>{
 const bike=createBikeModel();
 for(const name of ['front-wheel','rear-wheel','exhaust','plastics','seat','frame','engine','fork','shock'])assert.ok(bike.getObjectByName(name),name);
 let meshes=0;bike.traverse(o=>{if(o instanceof Mesh){meshes++;for(const attribute of ['position','normal']){const values=o.geometry.getAttribute(attribute);assert.ok(values,`${o.name} needs ${attribute}`);for(const n of values.array)assert.ok(Number.isFinite(n),`${o.name} has a nonfinite ${attribute}`);}}});
 // Keep an explicit scene-object budget while allowing independently authored
 // mechanical and molded surfaces that cannot be flattened across edit slots.
 assert.ok(meshes>20);assert.ok(meshes<=160, `Expected at most 160 component meshes, got ${meshes}`);
 const size=new Box3().setFromObject(bike).getSize(new Vector3());assert.ok(size.x>2&&size.x<2.5);assert.ok(size.y>1&&size.y<1.5);
 const f=bike.getObjectByName('front-wheel')!,r=bike.getObjectByName('rear-wheel')!;assert.ok(Math.abs(f.position.x-r.position.x-1.493)<1e-8);
 assert.equal(bike.userData.accuracy,'BLOCKOUT_NOT_OEM_VERIFIED');disposeBikeModel(bike);
});
