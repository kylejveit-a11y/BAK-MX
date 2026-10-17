/** CPU-only assembly profile. This does not measure WebGL, FPS or phone performance. */
import {performance} from 'node:perf_hooks';
import {cpus} from 'node:os';
import {Mesh,InstancedMesh} from 'three';
import {createBikeModel,disposeBikeModel} from '../src/bike3d/model.ts';
const samples=[],geometries=new Set();let meshes=0,triangles=0,geometryBytes=0;
for(let i=0;i<3;i++){
 const start=performance.now(),model=createBikeModel();samples.push(Number((performance.now()-start).toFixed(1)));
 if(i===2)model.traverse(o=>{if(o instanceof Mesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.getAttribute('position').count)/3*(o instanceof InstancedMesh?o.count:1);geometries.add(o.geometry);}});
 if(i===2)for(const g of geometries){geometryBytes+=g.index?.array.byteLength??0;for(const a of Object.values(g.attributes))geometryBytes+=a.array.byteLength;}
 disposeBikeModel(model);
}
console.log(JSON.stringify({scope:'Node CPU construction only; not WebGL/iPhone performance',runtime:process.version,cpu:cpus()[0]?.model??'unavailable',platform:process.platform,architecture:process.arch,construction_ms:samples,meshes,rendered_triangles:triangles,geometry_bytes:geometryBytes},null,2));
