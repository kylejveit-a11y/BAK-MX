import * as T from 'three';
import type {RepresentativeAssetId} from '../../shared/bike-asset-contract.ts';
/** Original unbranded shapes. Never use these meshes as evidence of product fit or exact geometry. */
export function createRepresentativeAsset(id:RepresentativeAssetId,material:T.MeshStandardMaterial){
 const group=new T.Group();group.name=id;group.userData={tier:2,geometryStatus:'REPRESENTATIVE'};
 function box(p:number[],size:[number,number,number]){const m=new T.Mesh(new T.BoxGeometry(...size),material);m.position.set(p[0],p[1],p[2]);group.add(m);return m;}
 function path(points:number[][],radius:number){const m=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(p[0],p[1],p[2]))),32,radius,10,false),material);group.add(m);return m;}
 if(id==='generic-slip-on'){
  const body=new T.Mesh(new T.CylinderGeometry(.047,.06,.32,16),material);body.rotation.z=Math.PI/2-.25;group.add(body);
  path([[.16,-.08,0],[.16,-.06,0],[.15,-.038,0]],.027).name='slip-on-inlet';
 }else if(id==='generic-fatbar'||id==='generic-crossbar'){
  path([[-.02,.02,-.40],[-.04,.04,-.23],[0,0,-.12],[0,0,.12],[-.04,.04,.23],[-.02,.02,.40]],id==='generic-fatbar'?.014:.011);
  if(id==='generic-crossbar')path([[-.035,.035,-.23],[-.035,.035,.23]],.009);
 }else if(id==='generic-clamps'){
  for(const y of [0,.085])box([0,y,0],[.085,.032,.25]);
 }else if(id==='generic-skid-plate'){
  box([0,0,0],[.48,.016,.25]);for(const z of [-.13,.13])box([0,.04,z],[.44,.08,.012]);box([.23,.07,0],[.016,.14,.25]);
 }else if(id==='generic-frame-guards'){
  for(const z of [-.115,.115]){const m=box([0,.08,z],[.085,.24,.012]);m.rotation.z=-.22;}
 }else if(id==='generic-radiator-braces'){
  for(const z of [-.18,.18]){box([0,0,z],[.014,.27,.014]);for(const y of [-.125,.125])box([-.03,y,z],[.09,.014,.03]);}
 }else if(id==='generic-hand-guards'){
  for(const z of [-1,1]){path([[.025,.02,z*.20],[.08,.02,z*.25],[.10,.02,z*.34]],.008);const shield=box([.105,.035,z*.335],[.018,.095,.16]);shield.rotation.y=z*.18;}
 }
 group.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true;}});return group;
}
