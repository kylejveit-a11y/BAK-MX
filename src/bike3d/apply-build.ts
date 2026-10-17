import * as T from 'three';
import type {VisualBuild,PartColor} from '../../shared/build-visual.ts';
import {disposeBikeModel} from './model.ts';
function finish(mat:T.MeshStandardMaterial,c?:PartColor){
 if(!mat.userData.stockFinish)mat.userData.stockFinish={color:mat.color.getHex(),metalness:mat.metalness,roughness:mat.roughness};
 const stock=mat.userData.stockFinish;mat.color.setHex(stock.color);mat.metalness=stock.metalness;mat.roughness=stock.roughness;
 if(!c)return;if(c.hex)mat.color.set(c.hex);
 if(c.finish==='anodized'||c.finish==='titanium'){mat.metalness=.8;mat.roughness=.32;}
 if(c.finish==='gloss'){mat.metalness=0;mat.roughness=.25;}
}
export function applyVisualBuild(root:T.Group,plan:VisualBuild){
 const exhaust=root.getObjectByName('exhaust')!;
 const prior=exhaust.getObjectByName('generic-full-exhaust');if(prior){exhaust.remove(prior);disposeBikeModel(prior);}
 for(const child of exhaust.children)child.visible=true;
 root.traverse(o=>{if(o instanceof T.Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m instanceof T.MeshStandardMaterial)finish(m,m.name==='plastics'?plan.plastics:plan.parts.find(p=>p.target===m.name)?.color);});
 const full=plan.parts.find(p=>p.asset==='generic-full-exhaust');
 if(full){
  for(const child of exhaust.children)child.visible=false;
  const g=new T.Group();g.name='generic-full-exhaust';g.userData={tier:2,label:full.label,hardpoint:full.hardpoint};
  const anchor=root.userData.hardpoints[full.hardpoint] as number[];g.position.set(anchor[0],anchor[1],anchor[2]);
  const header=new T.MeshStandardMaterial({color:0xa8a4a0,metalness:.8,roughness:.35});
  const muffler=new T.MeshStandardMaterial({color:0xb7bec6,metalness:.8,roughness:.33});finish(muffler,full.color);
  const points=[[0,0,0],[.12,-.09,.05],[.10,-.20,.08],[-.08,-.17,.10],[-.38,-.03,.08],[-.56,.01,.08]].map(p=>new T.Vector3(...p));
  g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),40,.025,12,false),header));
  const body=new T.Mesh(new T.CylinderGeometry(.047,.06,.32,12),muffler);body.position.set(-.70,.04,.08);body.rotation.z=Math.PI/2+.16;g.add(body);exhaust.add(g);
 }
 root.userData.visualLabels=plan.parts.map(p=>p.label);root.updateMatrixWorld(true);
}
