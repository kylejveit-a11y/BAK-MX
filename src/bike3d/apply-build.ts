import * as T from 'three';
import type {VisualBuild,PartColor} from '../../shared/build-visual.ts';
import {disposeBikeModel} from './model.ts';
import {representativeAssets} from '../../shared/bike-asset-contract.ts';
import {createRepresentativeAsset} from './representative-assets.ts';
function finish(mat:T.MeshStandardMaterial,c?:PartColor){
 if(!mat.userData.stockFinish)mat.userData.stockFinish={color:mat.color.getHex(),metalness:mat.metalness,roughness:mat.roughness};
 const stock=mat.userData.stockFinish;mat.color.setHex(stock.color);mat.metalness=stock.metalness;mat.roughness=stock.roughness;
 if(!c)return;if(c.hex)mat.color.set(c.hex);
 if(c.finish==='anodized'||c.finish==='titanium'){mat.metalness=.8;mat.roughness=.32;}
 if(c.finish==='gloss'){mat.metalness=0;mat.roughness=.25;}
}
export function applyVisualBuild(root:T.Group,plan:VisualBuild){
 const accessories:T.Object3D[]=[];root.traverse(o=>{if(o.userData.visualAccessory)accessories.push(o);});
 for(const o of accessories){o.removeFromParent();disposeBikeModel(o);}
 root.traverse(o=>{if(o.userData.hiddenByBuild){o.visible=true;delete o.userData.hiddenByBuild;}});
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
  const mount=root.userData.hardpoints['muffler-mount'] as number[];
  const inlet=root.userData.hardpoints['muffler-inlet'] as number[]|undefined;
  const relative=(point:number[])=>new T.Vector3(point[0]-anchor[0],point[1]-anchor[1],point[2]-anchor[2]);
  const bodyCenter=relative(mount),bodyInlet=bodyCenter.clone().add(new T.Vector3(.144,-.069,0));
  const points=[new T.Vector3(),new T.Vector3(.06,-.07,.015),new T.Vector3(.07,-.17,.055),new T.Vector3(.015,-.11,.12),new T.Vector3(-.12,-.01,.10),new T.Vector3(-.30,-.04,.025),...(inlet?[relative(inlet)]:[]),bodyInlet];
  g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),40,.025,12,false),header));
  const body=new T.Mesh(new T.CylinderGeometry(.047,.06,.32,20),muffler);body.position.copy(bodyCenter);body.rotation.z=Math.PI/2-.45;g.add(body);exhaust.add(g);
 }
 root.userData.visualLabels=plan.parts.map(p=>p.label);root.updateMatrixWorld(true);
 for(const part of plan.parts){
  if(!part.asset||part.asset==='generic-full-exhaust')continue;
  const contract=representativeAssets[part.asset],anchor=root.userData.hardpoints[contract.hardpoint] as number[]|undefined;
  const parent=root.getObjectByName(contract.parent);if(!anchor||!parent||contract.target!==part.target||contract.hardpoint!==part.hardpoint)continue;
  if(part.asset==='generic-slip-on'){const stock=root.getObjectByName('stock-muffler');if(stock){stock.visible=false;stock.userData.hiddenByBuild=true;}}
  let stockMaterial:T.MeshStandardMaterial|undefined;
  const stockSource=part.target==='exhaust-muffler'?root.getObjectByName('stock-muffler')??root:root;
  const stockTarget=part.target==='exhaust-muffler'?'exhaust':part.target;
  stockSource.traverse(o=>{if(o instanceof T.Mesh&&o.material instanceof T.MeshStandardMaterial&&o.material.name===stockTarget&&(!stockMaterial?.userData.representativeFinish||o.material.userData.representativeFinish))stockMaterial=o.material;});
  const material=stockMaterial?stockMaterial.clone():new T.MeshStandardMaterial({color:0x72777b,roughness:.4,metalness:0});finish(material,part.color);
  root.traverse(o=>{if(o instanceof T.Mesh&&!Array.isArray(o.material)&&o.material.name===part.target){o.visible=false;o.userData.hiddenByBuild=true;}});
  const joint=root.userData.hardpoints['muffler-inlet'] as number[]|undefined;
  const inlet=part.asset==='generic-slip-on'&&joint?joint.map((value,i)=>value-anchor[i]) as [number,number,number]:undefined;
  const asset=createRepresentativeAsset(part.asset,material,{inlet});asset.position.set(anchor[0],anchor[1],anchor[2]);asset.userData={...asset.userData,visualAccessory:true,label:part.label,hardpoint:part.hardpoint};parent.add(asset);
 }
 root.updateMatrixWorld(true);
}
