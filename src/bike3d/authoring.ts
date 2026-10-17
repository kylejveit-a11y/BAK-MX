import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import type {BikeDimensions} from '../../shared/bike-visual.ts';
export type V=[number,number,number];
export interface AuthoringContext {
 root:T.Group; groups:Record<string,T.Group>; kit:Record<string,T.Group>;
 mats:Record<string,T.MeshStandardMaterial>; d:BikeDimensions;
 target:(name:string,base:T.MeshStandardMaterial)=>T.MeshStandardMaterial;
}
export const vector=(p:V)=>new T.Vector3(...p);
/** Photo tracing space: official 918px right studio image, axle separation 589px.
 * XY contours are estimated from photography; Z widths are separately authored estimates. */
export const photo=(x:number,y:number,z=0):V=>[(x-456.5)/394.5,(615-y)/394.5,z];
export function mesh(g:T.Group,geometry:T.BufferGeometry,material:T.Material,p:V=[0,0,0],name=''){
 const m=new T.Mesh(geometry,material);m.position.set(...p);m.name=name;m.castShadow=true;m.receiveShadow=true;g.add(m);return m;
}
export function tube(g:T.Group,a:V,b:V,r:number,material:T.Material,r2=r,segments=20){
 const delta=vector(b).sub(vector(a));const m=mesh(g,new T.CylinderGeometry(r2,r,delta.length(),segments),material,vector(a).add(vector(b)).multiplyScalar(.5).toArray() as V);
 m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;
}
export function path(g:T.Group,points:V[],r:number,material:T.Material,segments=64,radial=12){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(vector),false,'centripetal'),segments,r,radial,false),material);}
export function disk(g:T.Group,p:V,r:number,width:number,material:T.Material,segments=48){const m=mesh(g,new T.CylinderGeometry(r,r,width,segments),material,p);m.rotation.x=Math.PI/2;return m;}
export function box(g:T.Group,p:V,s:V,material:T.Material,bevel=.003){return mesh(g,new RoundedBoxGeometry(...s,2,Math.min(bevel,...s.map(x=>x/3))),material,p);}
/** Authored closed cross-section loft. Rings use a consistent outward order. */
export function loft(g:T.Group,rings:V[][],material:T.Material,name=''){
 const pos=rings.flat(2),indices:number[]=[],n=rings[0].length;
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<n;j++){const a=i*n+j,b=i*n+(j+1)%n,c=b+n,d=a+n;indices.push(a,b,c,a,c,d);}
 // Fender channels and open-backed guards have concave cross-sections. A fan
 // from the first vertex fills their notches and reverses some cap triangles.
 function cap(ring:V[],offset:number,start:boolean){
  const points=ring.map(vector),center=points.reduce((sum,p)=>sum.add(p),new T.Vector3()).divideScalar(n);
  const normal=new T.Vector3();
  for(let i=0;i<n;i++)normal.add(points[i].clone().sub(center).cross(points[(i+1)%n].clone().sub(center)));
  if(normal.lengthSq()<1e-24)throw new Error('A loft end ring must enclose a nonzero planar area');
  // Dropping the dominant normal axis maximizes projected area for arbitrary
  // 3D ring orientations. Winding is recovered from the original 3D vertices.
  const axis=Math.abs(normal.x)>=Math.abs(normal.y)&&Math.abs(normal.x)>=Math.abs(normal.z)?0:Math.abs(normal.y)>=Math.abs(normal.z)?1:2;
  const contour=points.map(p=>axis===0?new T.Vector2(p.y,p.z):axis===1?new T.Vector2(p.x,p.z):new T.Vector2(p.x,p.y));
  for(const face of T.ShapeUtils.triangulateShape(contour,[])){
   const [a,b,c]=face,triangleNormal=points[b].clone().sub(points[a]).cross(points[c].clone().sub(points[a]));
   const reverse=(triangleNormal.dot(normal)<0)!==start;
   indices.push(offset+a,offset+(reverse?c:b),offset+(reverse?b:c));
  }
 }
 cap(rings[0],0,true);cap(rings[rings.length-1],(rings.length-1)*n,false);
 const vertices=rings.flat();let volume=0;for(let i=0;i<indices.length;i+=3){const a=vector(vertices[indices[i]]),b=vector(vertices[indices[i+1]]),c=vector(vertices[indices[i+2]]);volume+=a.dot(b.cross(c));}
 if(volume<0)for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(indices);geo.computeVertexNormals();return mesh(g,geo,material,[0,0,0],name);
}
export function bolt(g:T.Group,p:V,mat:T.Material,r=.005){disk(g,p,r*1.4,.002,mat,24);return disk(g,[p[0],p[1],p[2]+Math.sign(p[2])*.003],r,.006,mat,6);}
