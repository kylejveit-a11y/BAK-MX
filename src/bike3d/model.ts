import * as T from 'three';
import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {defaultBikeDimensions,parseBikeDimensions,visualComponents,type BikeDimensions} from '../../shared/bike-visual.ts';
import {pilotGeometryAnchors as anchors} from '../../shared/bike-geometry-anchors.ts';
type V=[number,number,number];
const v=(a:V)=>new T.Vector3(...a);
/** Original exterior study. Documentary nominal dimensions are identified in anchors;
 * contours, widths, cut-out profiles and mounting coordinates remain artist estimates. */
export function createBikeModel(input:BikeDimensions=defaultBikeDimensions){
 const d=parseBikeDimensions(input),root=new T.Group();root.name='BAK_KTM_450_SXF_2025_BLOCKOUT';
 root.userData={accuracy:'BLOCKOUT_NOT_OEM_VERIFIED',units:'meters',identity:'KTM|450 SX-F|2025|standard|US',dimensions:d};
 const mats={orange:new T.MeshStandardMaterial({color:0xff5808,roughness:.32}),black:new T.MeshStandardMaterial({color:0x181b1d,roughness:.42}),rubber:new T.MeshStandardMaterial({color:0x17191b,roughness:.95}),seat:new T.MeshStandardMaterial({color:0x252629,roughness:.9}),silver:new T.MeshStandardMaterial({color:0xb7bec6,metalness:.8,roughness:.33}),steel:new T.MeshStandardMaterial({color:0x626c74,metalness:.85,roughness:.28}),engine:new T.MeshStandardMaterial({color:0x777c81,metalness:.65,roughness:.47}),white:new T.MeshStandardMaterial({color:0xecebe8,roughness:.4})};
 const groups=Object.fromEntries(visualComponents.map(([id,label])=>{const g=new T.Group();g.name=id;g.userData={label,geometryStatus:'ESTIMATED',replacementBoundary:true};root.add(g);return[id,g];})) as Record<string,T.Group>;
 const stockHeader=new T.Group();stockHeader.name='stock-header';groups.exhaust.add(stockHeader);
 const stockMuffler=new T.Group();stockMuffler.name='stock-muffler';groups.exhaust.add(stockMuffler);
 const kit=Object.fromEntries(['front-fender','number-plate','shrouds','side-panels','rear-fender','airbox-cover','fork-guards'].map(id=>{const g=new T.Group();g.name=id;groups.plastics.add(g);return [id,g];})) as Record<string,T.Group>;
 const target=(name:string,base:T.MeshStandardMaterial)=>{const mat=base.clone();mat.name=name;return mat;};
 const bars=target('bars',mats.silver),frontRim=target('front-rim',mats.black),rearRim=target('rear-rim',mats.black),plastic=target('plastics',mats.orange),airbox=target('plastics',mats.black);
 const grips=target('grips',mats.rubber),clamps=target('clamps',mats.black),seat=target('seat',mats.seat),seatRibs=target('seat',mats.black),chain=target('chain',mats.steel),sprocket=target('rear-sprocket',mats.steel),exhaust=target('exhaust',mats.silver);
 root.userData.hardpoints={'muffler-mount':[-.59,.83,.18],'exhaust-port':[.18,.81,.12],'steering-stem':[.39,1.03,0],'engine-cradle':[0,.385,0],'frame-pivot':[-.20,.47,0],'radiator-mount':[.28,.82,0],'bar-clamp':[.38,1.14,0],'front-axle':[d.wheelbase/2,.347,0],'rear-axle':[-d.wheelbase/2,.333,0]};
 function mesh(g:T.Group,geo:T.BufferGeometry,mat:T.Material,p:V=[0,0,0]){const m=new T.Mesh(geo,mat);m.position.set(...p);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
 function tube(g:T.Group,a:V,b:V,r:number,mat:T.Material,r2=r){const delta=v(b).sub(v(a));const m=mesh(g,new T.CylinderGeometry(r2,r,delta.length(),16),mat,v(a).add(v(b)).multiplyScalar(.5).toArray() as V);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;}
 function box(g:T.Group,p:V,s:V,mat:T.Material){return mesh(g,new T.BoxGeometry(...s),mat,p);}
 function path(g:T.Group,points:V[],r:number,mat:T.Material){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v)),48,r,10,false),mat);}
 function disk(g:T.Group,p:V,r:number,width:number,mat:T.Material){const m=mesh(g,new T.CylinderGeometry(r,r,width,48),mat,p);m.rotation.x=Math.PI/2;return m;}
 function panel(points:number[][],side:number,mat:T.Material,g=groups.plastics,depth=.012){const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();const m=mesh(g,new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.009,bevelThickness:.005,bevelSegments:2,steps:1}),mat,[0,0,side]);return m;}
 // The outer edge and raised ridge form a closed, non-planar molded panel.
 function moldedPanel(g:T.Group,outline:V[],ridge:V,mat:T.Material,side:number){
  const bodyY=(y:number)=>.65+(y-.65)*(d.seatHeight-.65)/(.958-.65);
  const points=outline.map(([x,y,z])=>[x,bodyY(y),z*side] as V),center:[number,number,number]=[ridge[0],bodyY(ridge[1]),ridge[2]*side];
  const positions:number[]=[],indices:number[]=[],n=points.length;
  for(const p of [center,...points])positions.push(...p);
  for(const p of [center,...points])positions.push(p[0],p[1],p[2]-.006*side);
  for(let i=0;i<n;i++){const a=i+1,b=(i+1)%n+1,k=n+1;indices.push(0,a,b,k,b+k,a+k,a,a+k,b+k,a,b+k,b);}
  const area=points.reduce((sum,p,i)=>{const q=points[(i+1)%n];return sum+p[0]*q[1]-q[0]*p[1];},0);
  if(area*side<0)for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();return mesh(g,geo,mat);
 }
 // Cross sections are [x, center height, half width, thickness].
 function shell(g:T.Group,sections:number[][],mat:T.Material){
  const pos:number[]=[],indices:number[]=[];
  // Crown and shoulder rings give fenders and seat a shaped surface in front/top views.
  const ring=[[-1,-.5],[-.84,0],[0,.12],[.84,0],[1,-.5],[.82,-1],[-.82,-1]];
  for(const [x,y,w,h] of sections)for(const [z,dy] of ring)pos.push(x,y+dy*h,z*w);
  const n=ring.length;
  for(let i=0;i<sections.length-1;i++)for(let j=0;j<n;j++){const a=i*n+j,b=i*n+(j+1)%n,c=b+n,d=a+n;indices.push(a,b,c,a,c,d);}
  for(let j=1;j<n-1;j++){indices.push(0,j+1,j);const k=(sections.length-1)*n;indices.push(k,k+j,k+j+1);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(indices);geo.computeVertexNormals();return mesh(g,geo,mat);
 }

 function wheel(id:string,x:number,r:number,width:number,front:boolean){const g=groups[id];g.position.set(x,r,0);g.userData.axle=[x,r,0];
  const tire=mesh(g,new T.TorusGeometry(r-.044,.044,12,64),mats.rubber);tire.scale.z=width/.088;
  mesh(g,new T.TorusGeometry((front?anchors.frontRimBeadSeatDiameter:anchors.rearRimBeadSeatDiameter)/2,.012,8,64),front?frontRim:rearRim);
  mesh(g,new T.TorusGeometry((front?anchors.frontRimBeadSeatDiameter:anchors.rearRimBeadSeatDiameter)/2,.009,8,64),front?frontRim:rearRim,[0,0,width*.31]);
  disk(g,[0,0,0],.043,width*.8,target(front?'front-hub':'rear-hub',mats.silver));
  const spokes=target(front?'front-spokes':'rear-spokes',mats.black);
  for(let i=0;i<36;i++){const a=i*Math.PI*2/36,b=a+.2;for(const side of [-1,1])tube(g,[Math.cos(a)*.04,Math.sin(a)*.04,side*width*.3],[Math.cos(b)*(r-.08),Math.sin(b)*(r-.08),side*.006],.0018,spokes);}
  const tread=new T.InstancedMesh(new T.BoxGeometry(.025,.016,.025),mats.rubber,56*3),dummy=new T.Object3D();
  for(let i=0;i<56;i++)for(let row=0;row<3;row++){const a=(i+(row===1?.5:0))*Math.PI*2/56;dummy.position.set(Math.cos(a)*(r-.004),Math.sin(a)*(r-.004),(row-1)*width*.28);dummy.rotation.z=a-Math.PI/2;dummy.updateMatrix();tread.setMatrixAt(i*3+row,dummy.matrix);}tread.castShadow=true;g.add(tread);
  const brakeSide=front?-1:1;
  const radius=(front?anchors.frontDiscDiameter:anchors.rearDiscDiameter)/2,rotor=new T.Shape();
  for(let i=0;i<96;i++){const a=i*Math.PI/48;if(i===0)rotor.moveTo(radius,0);else rotor.lineTo(Math.cos(a)*radius,Math.sin(a)*radius);}rotor.closePath();
  const inner=new T.Path();inner.absarc(0,0,front?.077:.065,0,Math.PI*2,true);rotor.holes.push(inner);
  for(let i=0;i<24;i++){const a=i*Math.PI/12,hole=new T.Path();hole.absarc(Math.cos(a)*(radius-.012),Math.sin(a)*(radius-.012),.0035,0,Math.PI*2,true);rotor.holes.push(hole);}
  const brake=mesh(g,new T.ExtrudeGeometry(rotor,{depth:.003,bevelEnabled:false,curveSegments:8}),new T.MeshStandardMaterial({color:0x9ca4ac,metalness:.8,roughness:.3}),[0,0,brakeSide*width*.65]);brake.name=front?'front-brake-disc':'rear-brake-disc';
  box(g,[.075,.04,brakeSide*width*.72],[.055,.085,.035],mats.black);
  tube(g,[0,-(r-.10),0],[0,-(r-.065),0],.004,mats.steel);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;tube(g,[Math.cos(a)*.04,Math.sin(a)*.04,brakeSide*width*.65],[Math.cos(a+.2)*.09,Math.sin(a+.2)*.09,brakeSide*width*.65],.006,mats.silver);}
 }
 const front=d.wheelbase/2,rear=-front,sy=d.seatHeight-.958;
 wheel('front-wheel',front,.347,.09,true);wheel('rear-wheel',rear,.333,.12,false);
 const frame=groups.frame;
 for(const z of [-.09,.09]){
  tube(frame,[.35,1.06,z*.55],[-.12,.74,z],.025,mats.black);
  tube(frame,[.35,1.06,z*.55],[.22,.43,z],.022,mats.black);
  tube(frame,[.22,.43,z],[-.23,.39,z],.022,mats.black);
  tube(frame,[-.23,.39,z],[-.12,.74,z],.026,mats.black);
  tube(frame,[-.12,.74,z],[-.62,.94+sy,z],.018,mats.black);
  tube(frame,[-.62,.94+sy,z],[-.23,.51,z],.018,mats.black);
  panel([[rear-.04,.36],[rear-.04,.31],[-.20,.40],[-.20,.51]],z-.025,mats.silver,groups.swingarm,.05);
  tube(groups.fork,[front,.347,z],[.54,.76,z],.019,mats.silver,.021);
  tube(groups.fork,[.54,.76,z],[.36,1.12,z],.026,mats.silver);
  tube(kit['fork-guards'],[front-.025,.40,z],[.58,.66,z],.029,plastic);
 }
 for(const y of [1.03,1.115])box(groups.fork,[.39,y,0],[.07,.035,.25],clamps);
 tube(groups.shock,[-.19,.49,0],[-.3,.83,0],.026,mats.silver);
 const coil:V[]=[];for(let i=0;i<=180;i++){const t=i/180,a=t*Math.PI*2*9;coil.push([-.19-.11*t+Math.cos(a)*.045,.51+.29*t,Math.sin(a)*.045]);}path(groups.shock,coil,.007,mats.white);
 // Engine outside only; no internal mechanical representation.
 panel([[-.23,.47],[-.19,.42],[.06,.43],[.16,.50],[.15,.63],[.07,.70],[-.08,.69],[-.20,.60]],-.115,mats.engine,groups.engine,.23);
 for(const side of [-1,1]){
  const z=side*.135,r=side>0?.119:.092,x=side>0?-.025:.035,y=side>0?.535:.565;
  disk(groups.engine,[x,y,z],r,.026,mats.engine);disk(groups.engine,[x-.014,y+.008,z+side*.022],r*.72,.014,mats.black);
  for(let i=0;i<9;i++){const a=i*Math.PI*2/9;disk(groups.engine,[x+Math.cos(a)*r*.9,y+Math.sin(a)*r*.9,z+side*.02],.005,.008,mats.silver);}
  for(let i=0;i<7;i++)tube(groups.engine,[x-.045+i*.012,y-.042,z+side*.031],[x-.045+i*.012,y+.05,z+side*.031],.0016,mats.steel);
 }
 // Water-pump housing and coolant outlet on the right; shift lever on the left.
 disk(groups.engine,[.125,.58,.13],.035,.035,mats.engine);
 path(groups.engine,[[.12,.60,.15],[.18,.62,.15],[.20,.70,.14]],.011,mats.rubber);
 path(groups.engine,[[.04,.47,-.16],[-.03,.425,-.18],[-.15,.43,-.18]],.008,mats.silver);
 tube(groups.engine,[-.15,.43,-.18],[-.15,.43,-.22],.014,mats.rubber);
 const cylinder=box(groups.engine,[.10,.735,0],[.15,.17,.17],mats.engine);cylinder.rotation.z=-.12;
 box(groups.engine,[.09,.835,0],[.22,.08,.21],mats.engine);
 for(let i=0;i<5;i++)box(groups.engine,[.11,.68+i*.025,0],[.17,.008,.19],mats.steel);
 for(const z of [-.11,.11]){const rad=box(groups.cooling,[.28,.82,z],[.10,.27,.065],mats.black);rad.rotation.z=-.2;for(let i=0;i<12;i++)box(groups.cooling,[.30,.70+i*.019,z],[.08,.004,.068],mats.steel);path(groups.cooling,[[.29,.72,z],[.24,.65,z],[.12,.63,z]],.012,mats.rubber);}
 shell(frame,[[-.19,.88,.065,.12],[.04,.975,.085,.17],[.22,1.015,.07,.19],[.30,.96,.045,.10]],mats.black);
 mesh(frame,new T.CylinderGeometry(.027,.032,.018,24),mats.black,[.21,1.03,0]);
 path(stockHeader,[[.18,.81,.12],[.24,.72,.16],[.25,.60,.20],[.19,.55,.22],[.13,.63,.23],[.01,.67,.22],[-.16,.64,.20],[-.30,.68,.18],[-.43,.75,.18]],.027,exhaust);
 tube(stockMuffler,[-.43,.75,.18],[-.94,.88,.18],.057,exhaust,.045);
 tube(stockMuffler,[-.94,.88,.18],[-.96,.885,.18],.032,mats.black);
 shell(groups.seat,[[-.78,.99+sy,.055,.035],[-.58,.98+sy,.09,.045],[-.22,.94+sy,.105,.05],[.08,.958+sy,.08,.045],[.19,1.01+sy,.05,.04]],seat);
 shell(kit['rear-fender'],[[-1.06,1.015+sy,.025,.012],[-.83,1.005+sy,.075,.018],[-.60,.97+sy,.10,.025],[-.40,.93+sy,.11,.025]],plastic);
 shell(kit['front-fender'],[[.34,.98,.08,.025],[.54,1.00,.09,.02],[.79,.98,.085,.015],[.99,.90,.025,.012]],plastic);
 for(const side of [-1,1]){
  moldedPanel(kit['side-panels'],[[-.77,.98,.075],[-.49,.91,.13],[-.12,.85,.145],[-.27,.80,.15],[-.24,.66,.13],[-.30,.65,.13],[-.48,.76,.14]],[-.44,.855,.18],plastic,side);
  moldedPanel(kit.shrouds,[[-.31,.88,.13],[.10,1.00,.105],[.46,.96,.10],[.28,.82,.17],[.22,.73,.15],[.12,.71,.14],[.11,.84,.16]],[.16,.895,.205],plastic,side);
  moldedPanel(kit['airbox-cover'],[[-.31,.883,.132],[.09,.954,.108],[.32,.943,.113],[.16,.89,.185]],[.04,.917,.16],airbox,side);
  for(const [x,y,z] of [[-.22,.85,.15],[-.29,.68,.145],[-.51,.90,.14],[.25,.94,.135]])disk(kit['side-panels'],[x,.65+(y-.65)*(d.seatHeight-.65)/(.958-.65),z*side],.009,.008,mats.black);
 }
 for(let i=0;i<9;i++){const x=-.55+i*.055;const y=.98-(x+.58)/.36*.04+sy;tube(groups.seat,[x,y+.004,-.08],[x,y+.004,.08],.003,seatRibs);}
 // Rounded tapered front plate, modeled across bike width (not a box).
 const plateOutline=new T.Shape();plateOutline.moveTo(-.085,.10);plateOutline.quadraticCurveTo(-.105,.10,-.103,.075);plateOutline.lineTo(-.08,-.075);plateOutline.quadraticCurveTo(-.075,-.105,-.055,-.105);plateOutline.lineTo(.055,-.105);plateOutline.quadraticCurveTo(.075,-.105,.08,-.075);plateOutline.lineTo(.103,.075);plateOutline.quadraticCurveTo(.105,.10,.085,.10);plateOutline.closePath();
 const plate=mesh(kit['number-plate'],new T.ExtrudeGeometry(plateOutline,{depth:.008,bevelEnabled:true,bevelSize:.004,bevelThickness:.003,bevelSegments:3}),plastic,[.445,1.075,0]);plate.quaternion.setFromAxisAngle(new T.Vector3(0,0,1),.30).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),Math.PI/2));
 path(groups.controls,[[.36,1.16,-.40],[.34,1.18,-.23],[.38,1.14,-.12],[.38,1.14,.12],[.34,1.18,.23],[.36,1.16,.40]],.011,bars);
 tube(groups.controls,[.38,1.14,-.10],[.38,1.14,.10],anchors.handlebarClampDiameter/2,bars);
 for(const z of [-1,1]){tube(groups.controls,[.36,1.16,z*.29],[.36,1.16,z*.41],.018,grips);tube(groups.controls,[.39,1.16,z*.27],[.44,1.16,z*.40],.006,mats.silver);box(frame,[-.20,.41,z*.19],[.10,.02,.08],mats.steel);}
 path(groups.controls,[[.37,1.17,-.22],[.47,1.03,-.15],[.59,.73,-.12],[front,.38,-.08]],.004,mats.rubber);
 // Catalog: 7771015105130 (51 teeth), 50310165118 (5/8-inch pitch).
 // Tooth count/pitch are documentary; tooth profile, cut-outs and width are estimates.
 const drive=groups.drivetrain,teeth=51,pitchRadius=.015875/(2*Math.sin(Math.PI/teeth)),outline=new T.Shape();
 for(let i=0;i<teeth*4;i++){const a=i*Math.PI*2/(teeth*4),r=pitchRadius+(i%4===1||i%4===2?.004:-.006);if(i===0)outline.moveTo(Math.cos(a)*r,Math.sin(a)*r);else outline.lineTo(Math.cos(a)*r,Math.sin(a)*r);}outline.closePath();
 const bore=new T.Path();bore.absarc(0,0,.029,0,Math.PI*2,true);outline.holes.push(bore);
 for(let i=0;i<6;i++){const a=i*Math.PI/3,hole=new T.Path();hole.absarc(Math.cos(a)*.075,Math.sin(a)*.075,.025,0,Math.PI*2,true);outline.holes.push(hole);}
 const gear=mesh(drive,new T.ExtrudeGeometry(outline,{depth:.006,bevelEnabled:false,curveSegments:16}),sprocket,[rear,.333,-.103]);gear.name='rear-sprocket-mesh';gear.userData={teeth,chainPitch:.015875,profileStatus:'ESTIMATED'};
 path(drive,[[rear,.46,-.10],[-.21,.53,-.10],[-.15,.49,-.10],[-.20,.44,-.10],[rear,.205,-.10],[rear-.13,.33,-.10],[rear,.46,-.10]],.009,chain);
 root.userData.refinement='exterior-pass-4';
 consolidateComponents(root);root.updateMatrixWorld(true);return root;
}
export function disposeBikeModel(root:T.Object3D){const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();root.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}

/** Batch opaque geometry by material inside each replaceable component only.
 * Instanced tires remain instanced; no merge crosses a replacement boundary. */
function consolidateComponents(root:T.Group){
 for(const group of root.children){
  const batches=new Map<T.Material,T.Mesh[]>();
  for(const child of group.children)if(child instanceof T.Mesh&&!(child instanceof T.InstancedMesh)&&!Array.isArray(child.material)){
   const list=batches.get(child.material)??[];list.push(child);batches.set(child.material,list);
  }
  for(const [material,meshes] of batches){
   if(meshes.length<2)continue;
   const transformed=meshes.map(m=>{m.updateMatrix();const geometry=m.geometry.clone().applyMatrix4(m.matrix);const flat=geometry.index?geometry.toNonIndexed():geometry;if(flat!==geometry)geometry.dispose();flat.deleteAttribute('uv');return flat;});
   const merged=mergeGeometries(transformed,false);transformed.forEach(g=>g.dispose());
   if(!merged)continue;
   const indexed=mergeVertices(merged,1e-6);merged.dispose();const combined=new T.Mesh(indexed,material);combined.name=group.name+'-surface';combined.castShadow=true;combined.receiveShadow=true;
   for(const m of meshes){group.remove(m);m.geometry.dispose();}group.add(combined);
  }
 }
}
