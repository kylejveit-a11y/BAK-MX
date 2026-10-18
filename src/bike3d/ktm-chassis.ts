import * as T from 'three';
import {pilotGeometryAnchors as anchors} from '../../shared/bike-geometry-anchors.ts';
import {type AuthoringContext,type V,mesh,tube,path,disk,box,loft,bolt,vector} from './authoring.ts';

/** Six inset faces, twelve edge bevels and eight corner facets: 44 triangles.
 * Repeated rubber/chain details retain true chamfers without subdividing flat faces. */
function chamferedBlock(width:number,height:number,depth:number,bevel:number){
 const half=[width/2,height/2,depth/2],b=Math.min(bevel,...half.map(x=>x*.8)),inside=half.map(x=>x-b),positions:number[]=[];
 function face(points:number[][]){
  const p=points.map(p=>new T.Vector3(...p as V));
  const normal=p[1].clone().sub(p[0]).cross(p[2].clone().sub(p[0]));
  const center=p.reduce((sum,v)=>sum.add(v),new T.Vector3());
  if(normal.dot(center)<0)p.reverse();
  for(let i=1;i<p.length-1;i++)positions.push(...p[0].toArray(),...p[i].toArray(),...p[i+1].toArray());
 }
 // Large planar faces.
 for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){
  const others=[0,1,2].filter(i=>i!==axis);
  face([[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,c])=>{const p=[0,0,0];p[axis]=sign*half[axis];p[others[0]]=a*inside[others[0]];p[others[1]]=c*inside[others[1]];return p;}));
 }
 // Each chamfer joins two perpendicular faces along one full edge.
 for(let a=0;a<3;a++)for(let c=a+1;c<3;c++)for(const sa of [-1,1])for(const sc of [-1,1]){
  const along=3-a-c;
  face([[0,-1],[0,1],[1,1],[1,-1]].map(([which,edge])=>{const p=[0,0,0];p[a]=sa*(which?inside[a]:half[a]);p[c]=sc*(which?half[c]:inside[c]);p[along]=edge*inside[along];return p;}));
 }
 for(const sx of [-1,1])for(const sy of [-1,1])for(const sz of [-1,1]){
  const sign=[sx,sy,sz];face([0,1,2].map(axis=>half.map((value,i)=>sign[i]*(i===axis?value:inside[i]))));
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();return geometry;
}

/** Original exterior reconstruction, traced against the exact-year US studio photographs.
 * Nominal wheel/disc/chain dimensions are documentary anchors; surface profiles are estimates. */
export function buildChassis({groups,mats,d,target}:AuthoringContext){
 const front=d.wheelbase/2,rear=-front,seatOffset=d.seatHeight-.958;
 const rimFront=target('front-rim',mats.black),rimRear=target('rear-rim',mats.black);
 for(const rim of [rimFront,rimRear]){rim.metalness=.82;rim.roughness=.31;rim.envMapIntensity=1.05;}
 const hubFront=target('front-hub',mats.silver),hubRear=target('rear-hub',mats.silver);
 const spokeFront=target('front-spokes',mats.steel),spokeRear=target('rear-spokes',mats.steel);
 const bars=target('bars',mats.black),grips=target('grips',mats.rubber),clamps=target('clamps',mats.black);
 bars.metalness=.5;bars.roughness=.4;
 const chainMat=target('chain',mats.steel),sprocketMat=target('rear-sprocket',mats.steel);
 const black=mats.black;
 const treadMaterial=mats.rubber.clone();treadMaterial.color.setHex(0x121416);treadMaterial.roughness=.96;
 const TAU=Math.PI*2;
 const polar=(r:number,a:number,z=0):V=>[Math.cos(a)*r,Math.sin(a)*r,z];
 function outline(points:number[][]){const shape=new T.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();return shape;}
 function hole(points:number[][]){const p=new T.Path();points.forEach(([x,y],i)=>i?p.lineTo(x,y):p.moveTo(x,y));p.closePath();return p;}
 function circularHole(shape:T.Shape,x:number,y:number,r:number){const p=new T.Path();p.absarc(x,y,r,0,TAU,true);shape.holes.push(p);}
 function plate(g:T.Group,shape:T.Shape,z:number,depth:number,mat:T.Material,bevel=.002,name=''){
  return mesh(g,new T.ExtrudeGeometry(shape,{depth,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel*.7,bevelSegments:2,steps:1,curveSegments:12}),mat,[0,0,z],name);
 }
 function ring(g:T.Group,r:number,minor:number,z:number,mat:T.Material){return mesh(g,new T.TorusGeometry(r,minor,6,80),mat,[0,0,z]);}
 function around(g:T.Group,center:V,axis:V,r:number,t:number,mat:T.Material){const m=mesh(g,new T.TorusGeometry(r,t,8,32),mat,center);m.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),vector(axis).normalize());return m;}

 function wheel(frontWheel:boolean){
  const g=groups[frontWheel?'front-wheel':'rear-wheel'],radius=frontWheel?.347:.333;
  g.position.set(frontWheel?front:rear,radius,0);g.userData.axle=[g.position.x,radius,0];
  g.userData.spokeCount=36;g.userData.rimBeadSeatDiameter=frontWheel?anchors.frontRimBeadSeatDiameter:anchors.rearRimBeadSeatDiameter;
  const rim=frontWheel?rimFront:rimRear,hub=frontWheel?hubFront:hubRear,spokes=frontWheel?spokeFront:spokeRear;
  const bead=g.userData.rimBeadSeatDiameter/2,halfWidth=frontWheel?.025:.034;
  const carcassCenter=frontWheel?.302:.2815,radial=frontWheel?.0335:.0415,axial=frontWheel?.041:.059;
  // The closed elliptical section gives a rounded crown and visibly bowed sidewalls.
  const section:T.Vector2[]=[];
  for(let i=0;i<=32;i++){const a=i*TAU/32;section.push(new T.Vector2(carcassCenter+Math.cos(a)*radial,Math.sin(a)*axial));}
  const tire=mesh(g,new T.LatheGeometry(section,96),mats.rubber,[0,0,0],frontWheel?'front-tire-carcass':'rear-tire-carcass');tire.rotation.x=Math.PI/2;
  // Raised mold lines on both sidewalls and the bead seat are deliberately subtle.
  for(const side of [-1,1]){
   ring(g,bead+.008,.002,side*(axial*.76),mats.rubber);
   ring(g,bead+.021,.0014,side*(axial*.96),mats.rubber);
   ring(g,bead+.033,.001,side*(axial*.98),mats.rubber);
  }
  // A concave black alloy rim, with rolled flanges and a recessed spoke well.
  const rimProfile=[new T.Vector2(bead-.006,-halfWidth),new T.Vector2(bead+.008,-halfWidth),new T.Vector2(bead+.010,-halfWidth+.004),new T.Vector2(bead+.005,-halfWidth+.009),new T.Vector2(bead-.008,-halfWidth+.010),new T.Vector2(bead-.012,-.009),new T.Vector2(bead-.012,.009),new T.Vector2(bead-.008,halfWidth-.010),new T.Vector2(bead+.005,halfWidth-.009),new T.Vector2(bead+.010,halfWidth-.004),new T.Vector2(bead+.008,halfWidth),new T.Vector2(bead-.006,halfWidth),new T.Vector2(bead-.017,halfWidth-.010),new T.Vector2(bead-.021,0),new T.Vector2(bead-.017,-halfWidth+.010),new T.Vector2(bead-.006,-halfWidth)];
  const rimBody=mesh(g,new T.LatheGeometry(rimProfile,80),rim);rimBody.rotation.x=Math.PI/2;
  for(const side of [-1,1])ring(g,bead+.007,.0028,side*halfWidth,rim);
  const hubWidth=frontWheel?.092:.118,flange=frontWheel?.042:.052;
  disk(g,[0,0,0],frontWheel?.025:.029,hubWidth,hub,48);
  for(const side of [-1,1]){
   disk(g,[0,0,side*hubWidth*.42],flange,.008,hub,48);
   disk(g,[0,0,side*(hubWidth*.42+.008)],flange*.82,.007,hub,48);
   disk(g,[0,0,side*(hubWidth*.5+.008)],.018,.016,mats.silver,32);
   disk(g,[0,0,side*(hubWidth*.5+.018)],.011,.004,mats.black,32);
   disk(g,[0,0,side*(hubWidth*.5+.021)],.008,.003,mats.silver,24);
  }
  // 18 spokes per flange, 36 total, tangential three-cross lacing with alternating pull.
  for(let i=0;i<36;i++){
   const side=i%2===0?-1:1,a=i*TAU/36,hand=Math.floor(i/2)%2===0?1:-1;
   const b=a+hand*TAU*3/18,hubPoint=polar(flange*.88,b,side*hubWidth*.43),rimPoint=polar(bead-.014,a,side*.006);
   tube(g,hubPoint,rimPoint,.00125,spokes,.00115,8);
   const nippleStart=polar(bead-.027,a,side*.006);
   tube(g,nippleStart,polar(bead-.009,a,side*.006),.0021,mats.silver,.00165,8);
   disk(g,hubPoint,.0022,.003,mats.silver,8);
  }
  // Radially oriented individual MX blocks continue around both shoulders.
  const rows=frontWheel?[-1.01,0,1.01]:[-1.02,-.48,0,.48,1.02],count=frontWheel?46:44;
  const treadGeometry=chamferedBlock(frontWheel?.028:.034,.018,frontWheel?.026:.028,.0015);
  const tread=new T.InstancedMesh(treadGeometry,treadMaterial,count*rows.length),dummy=new T.Object3D();
  const basis=new T.Matrix4(),tangent=new T.Vector3(),normal=new T.Vector3(),cross=new T.Vector3();
  rows.forEach((beta,row)=>{for(let i=0;i<count;i++){
   const a=(i+(row%2)*.5+(row===2?.22:0))*TAU/count,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(beta),sb=Math.sin(beta);
   const r=carcassCenter+radial*cb+(frontWheel?.0025:.001);
   dummy.position.set(ca*r,sa*r,axial*sb);
   tangent.set(sa,-ca,0);normal.set(ca*cb,sa*cb,sb);cross.crossVectors(tangent,normal);
   basis.makeBasis(tangent,normal,cross);dummy.quaternion.setFromRotationMatrix(basis);
   dummy.scale.set(row===Math.floor(rows.length/2)?1.06:.92,1,row===0||row===rows.length-1?.88:1);
   dummy.updateMatrix();tread.setMatrixAt(row*count+i,dummy.matrix);
  }});
  tread.instanceMatrix.needsUpdate=true;tread.castShadow=true;tread.receiveShadow=true;tread.name=frontWheel?'front-mx-tread-blocks':'rear-mx-tread-blocks';g.add(tread);
  // Molded sidewall dashes and small rim labels break up the otherwise featureless rings.
  for(const side of [-1,1])for(let i=0;i<32;i++){
   const a=i*TAU/32,r=bead+.026;
   const rib=mesh(g,chamferedBlock(.012,.0012,.0015,.0004),mats.rubber,polar(r,a,side*axial*.995));rib.rotation.z=a;
  }
  for(const side of [-1,1])for(const a of [.4,3.54]){
   const label=mesh(g,chamferedBlock(.022,.004,.0007,.0003),mats.silver,polar(bead-.001,a,side*(halfWidth+.002)));label.rotation.z=a+Math.PI/2;
   const mark=mesh(g,chamferedBlock(.006,.004,.0008,.0003),mats.silver,polar(bead-.001,a+.058,side*(halfWidth+.002)));mark.rotation.z=a+Math.PI/2;
  }
  const valveAngle=-1.33;
  tube(g,polar(bead-.032,valveAngle),polar(bead-.005,valveAngle),.0035,mats.rubber,.003,10);
  tube(g,polar(bead-.035,valveAngle),polar(bead-.030,valveAngle),.004,mats.silver,.004,10);
  const rotorRadius=(frontWheel?anchors.frontDiscDiameter:anchors.rearDiscDiameter)/2,brakeSide=frontWheel?-1:1,brakeZ=brakeSide*(frontWheel?.069:.080);
  const rotor=new T.Shape(),scallops=frontWheel?12:10;
  for(let i=0;i<192;i++){
   const a=i*TAU/192,r=rotorRadius-.0018*(1-Math.cos(a*scallops));
   if(i===0)rotor.moveTo(r,0);else rotor.lineTo(Math.cos(a)*r,Math.sin(a)*r);
  }rotor.closePath();circularHole(rotor,0,0,.019);
  for(let i=0;i<6;i++){
   const a=i*TAU/6,ri=frontWheel?.041:.038,ro=rotorRadius-.029;
   const points=[polar(ri,a-.29),polar(ro,a-.29),polar(ro,a+.20),polar(ri,a+.32)].map(p=>[p[0],p[1]]);
   rotor.holes.push(hole(points));
   const bp=polar(frontWheel?.033:.030,a);circularHole(rotor,bp[0],bp[1],.0034);
  }
  for(let i=0;i<36;i++){
   const a=i*TAU/36,r=rotorRadius-(i%2?.009:.017),p=polar(r,a);circularHole(rotor,p[0],p[1],.0024);
  }
  const disc=mesh(g,new T.ExtrudeGeometry(rotor,{depth:.0032,bevelEnabled:false,curveSegments:8}),mats.steel,[0,0,brakeZ],frontWheel?'front-brake-disc':'rear-brake-disc');
  disc.userData={diameter:rotorRadius*2,preserveMesh:true};
  for(let i=0;i<6;i++)bolt(g,polar(frontWheel?.033:.030,i*TAU/6,brakeZ+brakeSide*.003),mats.silver,.0031);
  const caliperX=frontWheel?-.075:.065,caliperY=frontWheel?.079:.071;
  const caliper=box(g,[caliperX,caliperY,brakeZ+brakeSide*.016],[.045,.079,.036],mats.black,.009);caliper.rotation.z=frontWheel?-.35:.35;
  for(const offset of [-.018,.018])disk(g,[caliperX,caliperY+offset,brakeZ+brakeSide*.035],.011,.004,mats.silver,24);
  const carrier=box(g,[caliperX*.64,caliperY*.65,brakeZ-brakeSide*.012],[.035,.09,.009],mats.silver,.005);carrier.rotation.z=frontWheel?-.48:.48;
 }
 wheel(true);wheel(false);

 const frame=groups.frame;
 function spar(points:V[],width:number,thickness:number){
  const rings=points.map((p,i)=>{const before=vector(points[Math.max(i-1,0)]),after=vector(points[Math.min(i+1,points.length-1)]),along=after.sub(before).normalize(),side=new T.Vector3(-along.y,along.x,0).multiplyScalar(width/2);return [
   [p[0]+side.x,p[1]+side.y,p[2]-thickness/2],[p[0]-side.x,p[1]-side.y,p[2]-thickness/2],
   [p[0]-side.x,p[1]-side.y,p[2]+thickness/2],[p[0]+side.x,p[1]+side.y,p[2]+thickness/2],
  ] as V[];});return loft(frame,rings,black);
 }
 for(const side of [-1,1]){
  const z=side*.103;
  spar([[.31,1.035,side*.043],[.16,.905,side*.071],[-.055,.77,z],[-.171,.619,z],[-.184,.467,z]],.041,.030);
  path(frame,[[.30,1.017,side*.037],[.267,.849,side*.07],[.23,.65,side*.099],[.215,.463,side*.10],[.157,.401,side*.10],[-.08,.39,side*.10],[-.188,.438,z]],.016,black,50,14);
  // Broad forged pivot plates, with actual mounting holes and the recessed spindle.
  const pivot=outline([[-.219,.525],[-.165,.533],[-.154,.468],[-.178,.422],[-.211,.421],[-.230,.463]]);circularHole(pivot,-.192,.469,.014);
  plate(frame,pivot,side>0?.111:-.128,.017,black,.003);
  disk(frame,[-.192,.469,side*.133],.025,.008,black,32);bolt(frame,[-.192,.469,side*.14],mats.silver,.012);
  spar([[-.08,.79,z],[-.30,.859+seatOffset,side*.093],[-.60,.944+seatOffset,side*.067]],.026,.021);
  path(frame,[[-.205,.565,z],[-.335,.752+seatOffset,side*.115],[-.58,.91+seatOffset,side*.076]],.012,black,36,12);
  // Visible weld beads around the steering and cradle junctions.
  for(let i=0;i<6;i++)tube(frame,[.233-i*.003,.448-i*.0015,z-.013],[.228-i*.003,.455-i*.0015,z+.013],.0015,mats.steel,.0015,6);
  for(const [x,y] of [[-.185,.56],[.234,.69],[-.10,.405]])bolt(frame,[x,y,side*.122],mats.silver,.0045);
  // Open, serrated cast footpegs, with transverse ribs and a folding pin.
  const pegZ=side*.202;
  tube(frame,[-.205,.419,side*.119],[-.205,.419,side*.181],.012,mats.engine,.012,16);
  path(frame,[[-.245,.404,pegZ-side*.036],[-.245,.404,pegZ+side*.045],[-.151,.404,pegZ+side*.045],[-.151,.404,pegZ-side*.036],[-.245,.404,pegZ-side*.036]],.006,mats.steel,28,8);
  for(let j=0;j<4;j++)tube(frame,[-.232+j*.023,.405,pegZ-side*.032],[-.232+j*.023,.405,pegZ+side*.04],.004,mats.steel,.004,8);
  for(let j=0;j<6;j++)for(const edge of [-1,1])tube(frame,[-.241+j*.017,.406,pegZ+edge*.042],[-.241+j*.017,.415,pegZ+edge*.042],.003,mats.steel,.0018,6);
 }
 tube(frame,[.303,1.017,0],[.36,1.116,0],.032,black,.032,28);
 tube(frame,[-.19,.47,-.113],[-.19,.47,.113],.019,mats.steel,.019,28);
 tube(frame,[-.14,.79,-.101],[-.14,.79,.101],.017,black,.017,20);

 // The beam perimeter is a real open pocket, backed by a recessed thin web.
 const swing=groups.swingarm;
 for(const side of [-1,1]){
  const axleX=rear;
  const outer=outline([[-.203,.508],[-.287,.503],[axleX+.089,.386],[axleX-.033,.363],[axleX-.045,.341],[axleX-.031,.311],[axleX+.023,.306],[-.300,.414],[-.214,.43]]);
  const inset=[[axleX+.07,.354],[axleX+.11,.367],[-.303,.473],[-.254,.477],[-.271,.448],[axleX+.10,.342]];
  outer.holes.push(hole(inset));
  plate(swing,outer,side>0?.104:-.143,.039,mats.silver,.0035);
  plate(swing,outline(inset),side>0?.108:-.114,.006,mats.engine,.002);
  // A raised tapered upper rib and a smaller ridge along the cast lower edge.
  path(swing,[[axleX+.08,.374,side*.143],[-.48,.431,side*.144],[-.285,.491,side*.143]],.0035,mats.silver,20,8);
  path(swing,[[axleX+.08,.325,side*.143],[-.48,.385,side*.144],[-.278,.432,side*.143]],.0025,mats.silver,20,8);
  disk(swing,[-.205,.470,side*.12],.035,.055,mats.silver,40);
  disk(swing,[-.205,.470,side*.153],.021,.009,mats.steel,32);bolt(swing,[-.205,.470,side*.162],mats.silver,.012);
  const axleSlot=outline([[axleX-.026,.349],[axleX+.026,.349],[axleX+.033,.340],[axleX+.030,.327],[axleX-.024,.320],[axleX-.033,.329]]);
  plate(swing,axleSlot,side>0?.147:-.154,.007,mats.steel,.002);
  const adjuster=box(swing,[axleX+.005,.336,side*.16],[.037,.035,.012],mats.silver,.004);adjuster.rotation.z=.16;
  bolt(swing,[axleX,.333,side*.17],mats.silver,.012);
  tube(swing,[axleX+.023,.342,side*.157],[axleX+.075,.355,side*.157],.003,mats.steel,.003,8);
  disk(swing,[axleX+.048,.348,side*.16],.005,.008,mats.steel,6);
 }
 const bridge=box(swing,[-.292,.463,0],[.068,.054,.247],mats.silver,.012);bridge.rotation.z=.26;
 // Rear hose follows the top of the right arm, clipped at three stations.
 path(swing,[[-.205,.503,.154],[-.35,.49,.151],[-.53,.438,.15],[rear+.08,.397,.137],[rear+.065,.407,.105]],.0033,mats.rubber,32,8);
 for(const x of [-.31,-.45,-.59]){const y=.49+(x+.35)*.29;box(swing,[x,y,.152],[.015,.012,.014],mats.black,.003);}

 const fork=groups.fork,upper:V=[.351,1.136,0],lower:V=[.546,.752,0];
 const forkAxis:V=[upper[0]-front,upper[1]-.347,0];
 for(const side of [-1,1]){
  const z=side*.094;
  const lowerStanchion=tube(fork,[front-.003,.36,z],[lower[0],lower[1],z],.021,mats.silver,.021,28);lowerStanchion.name='fork-lower-stanchion-'+side;lowerStanchion.userData.authoredSurface=true;
  const upperOuter=tube(fork,[lower[0],lower[1],z],[upper[0],upper[1],z],.0266,mats.darkMetal,.0254,32);upperOuter.name='fork-upper-outer-'+side;upperOuter.userData.authoredSurface=true;
  tube(fork,[.548,.748,z],[.537,.77,z],.029,mats.black,.0285,28);
  tube(fork,[.535,.773,z],[.528,.787,z],.028,mats.silver,.027,28);
  tube(fork,[.354,1.128,z],[.346,1.145,z],.0275,clamps,.0275,28);
  tube(fork,[.346,1.145,z],[.343,1.151,z],.021,mats.silver,.021,24);
  tube(fork,[.343,1.151,z],[.341,1.155,z],.009,mats.black,.009,12);
  // Forged axle shoes are flattened and offset to carry the axle ahead of the leg.
  const shoe=outline([[front-.036,.401],[front-.020,.406],[front+.025,.364],[front+.029,.331],[front+.010,.311],[front-.024,.315],[front-.046,.337]]);circularHole(shoe,front,.347,.011);
  plate(fork,shoe,z-.019,.038,mats.silver,.005);
  disk(fork,[front,.347,z+side*.024],.019,.009,mats.silver,32);bolt(fork,[front,.347,z+side*.030],mats.silver,.011);
  for(const y of [.341,.368])bolt(fork,[front-.023,y,z+side*.024],mats.silver,.004);
  // Black WP graphic panel on the exposed lower portion of the silver outer tube.
  const decal=box(fork,[.509,.822,z+side*.025],[.018,.089,.001],mats.black,.001);decal.rotation.z=.467;
  const slash=box(fork,[.507,.826,z+side*.026],[.009,.006,.0012],mats.white,.0004);slash.rotation.z=.467;
  const slash2=box(fork,[.500,.842,z+side*.026],[.011,.006,.0012],mats.white,.0004);slash2.rotation.z=.467;
 }
 // The two machined yokes have individual fork pinch collars and center stem.
 for(const [x,y,depth] of [[.397,1.045,.031],[.362,1.113,.024]]){
  const clampShape=outline([[x-.035,y-.017],[x+.026,y-.017],[x+.037,y+.007],[x+.02,y+.021],[x-.028,y+.018]]);
  plate(fork,clampShape,-.095,.190,clamps,.004);
  for(const side of [-1,1]){
   tube(fork,[x+.008,y-.016,side*.094],[x-.008,y+.016,side*.094],.036,clamps,.036,24);
   bolt(fork,[x+.028,y,side*.119],mats.silver,.0045);
   bolt(fork,[x+.026,y+depth*.5,side*.119],mats.silver,.004);
  }
 }
 around(fork,[.366,1.105,0],forkAxis,.023,.004,mats.silver);

 const shock=groups.shock,shockBottom:V=[-.251,.455,0],shockTop:V=[-.092,.805,0];
 const shockVector=vector(shockTop).sub(vector(shockBottom)),shockAxis=shockVector.clone().normalize();
 tube(shock,shockBottom,shockTop,.021,mats.engine,.024,24);
 const rodEnd=vector(shockBottom).addScaledVector(shockAxis,.082).toArray() as V;
 tube(shock,shockBottom,rodEnd,.010,mats.silver,.010,24);
 const perpendicular=new T.Vector3(shockAxis.y,-shockAxis.x,0),coilPoints:V[]=[];
 for(let i=0;i<=260;i++){
  const t=i/260,a=t*TAU*8.3,p=vector(shockBottom).addScaledVector(shockAxis,.072+t*.250).addScaledVector(perpendicular,Math.cos(a)*.035);p.z+=Math.sin(a)*.035;coilPoints.push(p.toArray() as V);
 }
 path(shock,coilPoints,.0064,mats.white,260,10);
 for(const offset of [.064,.326,.340]){
  const p=vector(shockBottom).addScaledVector(shockAxis,offset).toArray() as V;around(shock,p,shockAxis.toArray() as V,.036,.006,offset>.33?mats.black:mats.engine);
 }
 const springNut=vector(shockBottom).addScaledVector(shockAxis,.343).toArray() as V;
 for(let i=0;i<12;i++){const a=i*TAU/12,p=vector(springNut).addScaledVector(perpendicular,Math.cos(a)*.034);p.z+=Math.sin(a)*.034;box(shock,p.toArray() as V,[.009,.007,.008],mats.engine,.001);}
 tube(shock,[-.106,.79,.025],[-.217,.80,.025],.024,mats.engine,.026,24);
 tube(shock,[-.217,.80,.025],[-.240,.802,.025],.027,mats.black,.027,24);
 tube(shock,[-.24,.802,.025],[-.25,.803,.025],.010,mats.black,.010,16);
 for(const [x,y] of [[-.251,.455],[-.092,.805]]){disk(shock,[x,y,0],.025,.077,mats.engine,32);bolt(shock,[x,y,.044],mats.silver,.008);bolt(shock,[x,y,-.044],mats.silver,.008);}
 // Forged linkage and dogbones beneath the swingarm cross member.
 for(const side of [-1,1]){
  const link=outline([[-.272,.459],[-.31,.418],[-.359,.384],[-.347,.364],[-.264,.392],[-.222,.427],[-.225,.451]]);
  circularHole(link,-.247,.441,.009);circularHole(link,-.342,.384,.009);
  plate(shock,link,side>0?.035:-.049,.014,mats.silver,.003);
  for(const [x,y] of [[-.247,.441],[-.342,.384]])bolt(shock,[x,y,side*.054],mats.engine,.008);
  tube(shock,[-.342,.384,side*.043],[-.195,.403,side*.043],.012,mats.engine,.013,16);
 }

 const controls=groups.controls;
 path(controls,[[.325,1.184,-.405],[.332,1.188,-.29],[.348,1.183,-.225],[.38,1.144,-.13],[.38,1.14,0],[.38,1.144,.13],[.348,1.183,.225],[.332,1.188,.29],[.325,1.184,.405]],.0112,bars,72,16);
 tube(controls,[.38,1.14,-.115],[.38,1.14,.115],anchors.handlebarClampDiameter/2,bars,.014,24);
 for(const side of [-1,1]){
  box(controls,[.377,1.132,side*.055],[.044,.041,.033],clamps,.006);
  for(const x of [.365,.391]){const b=mesh(controls,new T.CylinderGeometry(.004,.004,.007,6),mats.silver,[x,1.155,side*.055]);b.rotation.z=.05;}
  tube(controls,[.331,1.186,side*.287],[.325,1.184,side*.409],.017,grips,.017,24);
  for(let i=0;i<25;i++)disk(controls,[.33-i*.0002,1.186-i*.00008,side*(.294+i*.0043)],.0177,.0014,grips,24);
  disk(controls,[.331,1.186,side*.288],.025,.005,grips,28);
  disk(controls,[.325,1.184,side*.413],.018,.006,grips,28);disk(controls,[.325,1.184,side*.417],.008,.003,mats.black,20);
  const master=box(controls,[.357,1.19,side*.252],[.045,.030,.037],mats.black,.006);master.rotation.y=side*.1;
  box(controls,[.358,1.209,side*.252],[.033,.010,.030],mats.black,.003);
  bolt(controls,[.373,1.195,side*.27],mats.silver,.003);
  path(controls,[[.376,1.183,side*.26],[.407,1.182,side*.29],[.418,1.17,side*.35],[.417,1.166,side*.406]],.0055,mats.silver,28,10);
  const end=mesh(controls,new T.SphereGeometry(.008,12,8),mats.silver,[.417,1.166,side*.406]);end.scale.y=.7;
  tube(controls,[.379,1.185,side*.26],[.382,1.185,side*.28],.009,mats.silver,.009,20);
  box(controls,[.323,1.193,side*.27],[.023,.024,.014],mats.black,.004);
  box(controls,[.323,1.207,side*.27],[.009,.004,.008],mats.white,.001);
 }
 const barPad=box(controls,[.392,1.169,0],[.058,.047,.162],mats.black,.013);barPad.rotation.z=-.06;
 box(controls,[.422,1.174,0],[.001,.014,.070],mats.white,.001);
 // Free loops at the bars, then clipped hydraulic line down the left fork leg.
 path(controls,[[.372,1.188,-.246],[.341,1.16,-.188],[.30,1.119,-.15],[.33,1.045,-.13],[.43,1.005,-.122],[.53,.79,-.12],[.65,.556,-.122],[front-.065,.426,-.104]],.0036,mats.black,64,8);
 path(controls,[[.35,1.19,.263],[.315,1.14,.19],[.276,1.07,.14],[.286,.959,.10],[.18,.869,.105]],.0035,mats.black,48,8);
 path(controls,[[.36,1.182,-.26],[.24,1.145,-.13],[.275,1.031,-.06],[.25,.941,-.04]],.003,mats.black,32,8);

 const drive=groups.drivetrain,teeth=51,pitch=.015875,pitchRadius=pitch/(2*Math.sin(Math.PI/teeth));
 const sprocketShape=new T.Shape();
 for(let i=0;i<teeth*4;i++){
  const a=i*TAU/(teeth*4),r=pitchRadius+(i%4===1||i%4===2?.004:-.006);
  if(i===0)sprocketShape.moveTo(Math.cos(a)*r,Math.sin(a)*r);else sprocketShape.lineTo(Math.cos(a)*r,Math.sin(a)*r);
 }sprocketShape.closePath();circularHole(sprocketShape,0,0,.029);
 // Six broad circular lightening windows leave an open annular, six-arm carrier.
 for(let i=0;i<6;i++){const a=i*TAU/6;circularHole(sprocketShape,Math.cos(a)*.075,Math.sin(a)*.075,.026);}
 for(let i=0;i<6;i++){const a=(i+.5)*TAU/6;circularHole(sprocketShape,Math.cos(a)*.046,Math.sin(a)*.046,.0037);}
 const sprocket=mesh(drive,new T.ExtrudeGeometry(sprocketShape,{depth:.006,bevelEnabled:false,curveSegments:18}),sprocketMat,[rear,.333,-.148],'rear-sprocket-mesh');
 sprocket.userData={teeth,chainPitch:pitch,profileStatus:'ESTIMATED',preserveMesh:true};
 for(let i=0;i<6;i++){const a=(i+.5)*TAU/6;bolt(drive,[rear+Math.cos(a)*.046,.333+Math.sin(a)*.046,-.155],mats.silver,.0045);}
 // Countershaft sprocket and a chain with articulated side plates and individual pins.
 const counterX=-.156,counterY=.506,counterRadius=.036;
 disk(drive,[counterX,counterY,-.142],counterRadius,.013,mats.steel,28);
 disk(drive,[counterX,counterY,-.153],.015,.008,mats.silver,12);
 const chainZ=-.149,chainPoints:V[]=[];
 const rearCenter=new T.Vector2(rear,.333),frontCenter=new T.Vector2(counterX,counterY),delta=frontCenter.clone().sub(rearCenter),distance=delta.length();
 const base=Math.atan2(delta.y,delta.x),tangentAngle=base+Math.acos((pitchRadius-counterRadius)/distance);
 const upperA=tangentAngle,lowerA=base-Math.acos((pitchRadius-counterRadius)/distance);
 const rearUpper=new T.Vector2(rear+Math.cos(upperA)*pitchRadius,.333+Math.sin(upperA)*pitchRadius);
 const frontUpper=new T.Vector2(counterX+Math.cos(upperA)*counterRadius,counterY+Math.sin(upperA)*counterRadius);
 const rearLower=new T.Vector2(rear+Math.cos(lowerA)*pitchRadius,.333+Math.sin(lowerA)*pitchRadius);
 const frontLower=new T.Vector2(counterX+Math.cos(lowerA)*counterRadius,counterY+Math.sin(lowerA)*counterRadius);
 function segment(a:T.Vector2,b:T.Vector2){const length=a.distanceTo(b),n=Math.max(1,Math.round(length/pitch));for(let i=0;i<n;i++){const p=a.clone().lerp(b,i/n);chainPoints.push([p.x,p.y,chainZ]);}}
 segment(rearUpper,frontUpper);
 const frontArc=upperA-lowerA,frontN=Math.ceil(frontArc*counterRadius/pitch);
 for(let i=0;i<frontN;i++){const a=upperA-i/frontN*frontArc;chainPoints.push([counterX+Math.cos(a)*counterRadius,counterY+Math.sin(a)*counterRadius,chainZ]);}
 segment(frontLower,rearLower);
 const rearArc=TAU-frontArc,rearN=Math.ceil(rearArc*pitchRadius/pitch);
 for(let i=0;i<rearN;i++){const a=lowerA-i/rearN*rearArc;chainPoints.push([rear+Math.cos(a)*pitchRadius,.333+Math.sin(a)*pitchRadius,chainZ]);}
 const sidePlateGeometry=chamferedBlock(.015,.0065,.0025,.001),linkCount=chainPoints.length;
 const chainPlates=new T.InstancedMesh(sidePlateGeometry,chainMat,linkCount*2),chainPins=new T.InstancedMesh(new T.CylinderGeometry(.0028,.0028,.017,8),chainMat,linkCount),dummy=new T.Object3D();
 for(let i=0;i<linkCount;i++){
  const a=vector(chainPoints[i]),b=vector(chainPoints[(i+1)%linkCount]),mid=a.clone().add(b).multiplyScalar(.5),angle=Math.atan2(b.y-a.y,b.x-a.x);
  for(const side of [-1,1]){dummy.position.set(mid.x,mid.y,chainZ+side*.007);dummy.rotation.set(0,0,angle);dummy.scale.set(a.distanceTo(b)/.015,1,1);dummy.updateMatrix();chainPlates.setMatrixAt(i*2+(side+1)/2,dummy.matrix);}
  dummy.position.copy(a);dummy.rotation.set(Math.PI/2,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();chainPins.setMatrixAt(i,dummy.matrix);
 }
 for(const m of [chainPlates,chainPins]){m.castShadow=true;m.receiveShadow=true;m.instanceMatrix.needsUpdate=true;drive.add(m);}chainPlates.name='roller-chain-side-plates';chainPins.name='roller-chain-pins';
 // Black slider at the pivot and the open lower chain guide ahead of the rear sprocket.
 const slider=outline([[-.181,.551],[-.218,.552],[-.375,.504],[-.372,.487],[-.219,.532],[-.181,.532]]);plate(drive,slider,-.17,.025,mats.black,.002);
 const guide=outline([[rear+.157,.309],[rear+.262,.346],[rear+.293,.321],[rear+.274,.271],[rear+.209,.267],[rear+.176,.280]]);
 guide.holes.push(hole([[rear+.189,.304],[rear+.252,.326],[rear+.265,.309],[rear+.247,.288],[rear+.210,.285]]));
 plate(drive,guide,-.171,.041,mats.black,.003);
 bolt(drive,[rear+.183,.303,-.177],mats.silver,.0045);bolt(drive,[rear+.267,.314,-.177],mats.silver,.0045);
}
