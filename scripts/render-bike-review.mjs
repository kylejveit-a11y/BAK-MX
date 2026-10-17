/** Deterministic geometry review, independent of WebGL. Pipe JSON into render-bike-review.py. */
import {Mesh,InstancedMesh,Matrix4,Vector3,Color} from 'three';
import {createBikeModel,disposeBikeModel} from '../src/bike3d/model.ts';
const model=createBikeModel(),faces=[],instance=new Matrix4(),world=new Matrix4();
model.updateMatrixWorld(true);
model.traverse(o=>{
 if(!(o instanceof Mesh))return;
 const pos=o.geometry.getAttribute('position'),index=o.geometry.index,materials=Array.isArray(o.material)?o.material:[o.material];
 for(let k=0;k<(o instanceof InstancedMesh?o.count:1);k++){
  world.copy(o.matrixWorld);if(o instanceof InstancedMesh){o.getMatrixAt(k,instance);world.multiply(instance);}
  for(let i=0;i<(index?.count??pos.count);i+=3){
   const group=o.geometry.groups.find(g=>i>=g.start&&i<g.start+g.count),mat=materials[group?.materialIndex??0]??materials[0];
   const color=mat.color??new Color(0x888888);
   faces.push({c:'#'+color.getHexString(),v:[0,1,2].map(j=>new Vector3().fromBufferAttribute(pos,index?index.getX(i+j):i+j).applyMatrix4(world).toArray())});
  }
 }
});
process.stdout.write(JSON.stringify(faces));disposeBikeModel(model);
