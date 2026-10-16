import * as T from 'three';
import {defaultBikeDimensions,parseBikeDimensions,visualComponents,type BikeDimensions} from '../../shared/bike-visual.ts';
type V=[number,number,number];
const v=(a:V)=>new T.Vector3(...a);
/** Original exterior blockout. Only wheelbase/seat anchor are documentary values;
 * all contours, widths and mounting coordinates remain artist estimates. */
export function createBikeModel(input:BikeDimensions=defaultBikeDimensions){
 const d=parseBikeDimensions(input),root=new T.Group();root.name='BAK_KTM_450_SXF_2025_BLOCKOUT';
 root.userData={accuracy:'BLOCKOUT_NOT_OEM_VERIFIED',units:'meters',identity:'KTM|450 SX-F|2025|standard|US',dimensions:d};
 const mats={orange:new T.MeshStandardMaterial({color:0xff5808,roughness:.32}),black:new T.MeshStandardMaterial({color:0x181b1d,roughness:.42}),rubber:new T.MeshStandardMaterial({color:0x17191b,roughness:.95}),seat:new T.MeshStandardMaterial({color:0x252629,roughness:.9}),silver:new T.MeshStandardMaterial({color:0xb7bec6,metalness:.8,roughness:.33}),steel:new T.MeshStandardMaterial({color:0x626c74,metalness:.85,roughness:.28}),engine:new T.MeshStandardMaterial({color:0x777c81,metalness:.65,roughness:.47}),white:new T.MeshStandardMaterial({color:0xecebe8,roughness:.4})};
 const groups=Object.fromEntries(visualComponents.map(([id,label])=>{const g=new T.Group();g.name=id;g.userData={label,geometryStatus:'ESTIMATED',replacementBoundary:true};root.add(g);return[id,g];})) as Record<string,T.Group>;
 function mesh(g:T.Group,geo:T.BufferGeometry,mat:T.Material,p:V=[0,0,0]){const m=new T.Mesh(geo,mat);m.position.set(...p);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
 function tube(g:T.Group,a:V,b:V,r:number,mat:T.Material,r2=r){const delta=v(b).sub(v(a));const m=mesh(g,new T.CylinderGeometry(r2,r,delta.length(),16),mat,v(a).add(v(b)).multiplyScalar(.5).toArray() as V);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;}
 function box(g:T.Group,p:V,s:V,mat:T.Material){return mesh(g,new T.BoxGeometry(...s),mat,p);}
 function path(g:T.Group,points:V[],r:number,mat:T.Material){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v)),48,r,10,false),mat);}
 function disk(g:T.Group,p:V,r:number,width:number,mat:T.Material){const m=mesh(g,new T.CylinderGeometry(r,r,width,48),mat,p);m.rotation.x=Math.PI/2;return m;}
 function panel(points:number[][],side:number,mat:T.Material){const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();const m=mesh(groups.plastics,new T.ExtrudeGeometry(s,{depth:.012,bevelEnabled:true,bevelSize:.009,bevelThickness:.005,bevelSegments:2,steps:1}),mat,[0,0,side]);return m;}
 // Cross sections are [x, center height, half width, thickness].
 function shell(g:T.Group,sections:number[][],mat:T.Material){const pos:number[]=[],indices:number[]=[];for(const [x,y,w,h] of sections)for(const [z,dy] of [[-w,0],[w,0],[w,-h],[-w,-h]])pos.push(x,y+dy,z);for(let i=0;i<sections.length-1;i++)for(let j=0;j<4;j++){const a=i*4+j,b=i*4+(j+1)%4,c=b+4,e=a+4;indices.push(a,b,c,a,c,e);}indices.push(0,3,2,0,2,1);const n=(sections.length-1)*4;indices.push(n,n+1,n+2,n,n+2,n+3);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(indices);geo.computeVertexNormals();return mesh(g,geo,mat);}
 function wheel(id:string,x:number,r:number,width:number,front:boolean){const g=groups[id];g.position.set(x,r,0);g.userData.axle=[x,r,0];
  const tire=mesh(g,new T.TorusGeometry(r-.044,.044,12,64),mats.rubber);tire.scale.z=width/.088;
  mesh(g,new T.TorusGeometry(front?.2667:.2413,.012,8,64),mats.silver);
  mesh(g,new T.TorusGeometry(front?.2667:.2413,.009,8,64),mats.black,[0,0,width*.31]);
  disk(g,[0,0,0],.043,width*.8,mats.silver);
  for(let i=0;i<36;i++){const a=i*Math.PI*2/36,b=a+.2;for(const side of [-1,1])tube(g,[Math.cos(a)*.04,Math.sin(a)*.04,side*width*.3],[Math.cos(b)*(r-.08),Math.sin(b)*(r-.08),side*.006],.0018,mats.silver);}
  const tread=new T.InstancedMesh(new T.BoxGeometry(.025,.016,.025),mats.rubber,56*3),dummy=new T.Object3D();
  for(let i=0;i<56;i++)for(let row=0;row<3;row++){const a=(i+(row===1?.5:0))*Math.PI*2/56;dummy.position.set(Math.cos(a)*(r-.004),Math.sin(a)*(r-.004),(row-1)*width*.28);dummy.rotation.z=a-Math.PI/2;dummy.updateMatrix();tread.setMatrixAt(i*3+row,dummy.matrix);}tread.castShadow=true;g.add(tread);
  const brake=mesh(g,new T.RingGeometry(front?.08:.07,front?.13:.11,48),mats.steel,[0,0,-width*.65]);brake.material=new T.MeshStandardMaterial({color:0x9ca4ac,metalness:.8,roughness:.3,side:T.DoubleSide});
  for(let i=0;i<8;i++){const a=i*Math.PI/4;tube(g,[Math.cos(a)*.04,Math.sin(a)*.04,-width*.65],[Math.cos(a+.2)*.09,Math.sin(a+.2)*.09,-width*.65],.006,mats.silver);}
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
  tube(groups.swingarm,[rear,.333,z],[-.23,.46,z],.036,mats.silver,.047);
  tube(groups.fork,[front,.347,z],[.54,.76,z],.019,mats.silver,.021);
  tube(groups.fork,[.54,.76,z],[.36,1.12,z],.026,mats.silver);
  tube(groups.fork,[front-.025,.40,z],[.58,.66,z],.029,mats.orange);
 }
 for(const y of [1.03,1.115])box(groups.fork,[.39,y,0],[.07,.035,.25],mats.black);
 tube(groups.shock,[-.19,.49,0],[-.3,.83,0],.026,mats.silver);
 const coil:V[]=[];for(let i=0;i<=180;i++){const t=i/180,a=t*Math.PI*2*9;coil.push([-.19-.11*t+Math.cos(a)*.045,.51+.29*t,Math.sin(a)*.045]);}path(groups.shock,coil,.007,mats.white);
 // Engine outside only; no internal mechanical representation.
 box(groups.engine,[-.015,.55,0],[.32,.24,.24],mats.engine);
 for(const z of [-.135,.135]){disk(groups.engine,[-.03,.55,z],.13,.025,mats.engine);disk(groups.engine,[-.035,.56,z*1.12],.09,.012,mats.black);for(let i=0;i<9;i++){const a=i*Math.PI*2/9;disk(groups.engine,[-.03+Math.cos(a)*.114,.55+Math.sin(a)*.114,z*1.2],.005,.008,mats.silver);}}
 const cylinder=box(groups.engine,[.10,.735,0],[.15,.17,.17],mats.engine);cylinder.rotation.z=-.12;
 box(groups.engine,[.09,.835,0],[.22,.08,.21],mats.engine);
 for(let i=0;i<5;i++)box(groups.engine,[.11,.68+i*.025,0],[.17,.008,.19],mats.steel);
 for(const z of [-.135,.135]){const rad=box(groups.cooling,[.28,.82,z],[.10,.27,.10],mats.black);rad.rotation.z=-.2;for(let i=0;i<12;i++)box(groups.cooling,[.30,.70+i*.019,z],[.08,.006,.105],mats.silver);path(groups.cooling,[[.29,.72,z],[.24,.65,z],[.12,.63,z]],.012,mats.rubber);}
 path(groups.exhaust,[[.18,.81,.12],[.30,.74,.16],[.29,.64,.20],[.14,.64,.22],[-.12,.70,.20],[-.42,.78,.18]],.027,mats.silver);
 tube(groups.exhaust,[-.40,.79,.18],[-.78,.87,.18],.057,mats.silver,.045);
 disk(groups.exhaust,[-.79,.87,.18],.032,.035,mats.black).rotation.z=Math.PI/2;
 shell(groups.seat,[[-.78,.99+sy,.055,.035],[-.58,.98+sy,.09,.045],[-.22,.94+sy,.105,.05],[.08,.958+sy,.08,.045],[.19,1.01+sy,.05,.04]],mats.seat);
 shell(groups.plastics,[[-1.06,1.015+sy,.025,.012],[-.83,1.005+sy,.075,.018],[-.60,.97+sy,.10,.025],[-.40,.93+sy,.11,.025]],mats.orange);
 shell(groups.plastics,[[.34,.98,.08,.025],[.54,1.00,.09,.02],[.79,.98,.085,.015],[.99,.90,.025,.012]],mats.orange);
 for(const side of [-.14,.14]){
  panel([[-.73,.96+sy],[-.49,.94+sy],[-.18,.85],[-.28,.65],[-.44,.72]],side,mats.orange);
  panel([[-.31,.88],[.10,1.00+sy],[.41,.97],[.25,.82],[.14,.72],[.08,.86]],side,mats.orange);
  panel([[-.31,.883],[.09,.954+sy],[.32,.943],[.16,.89]],side+(side>0?.019:-.019),mats.black);
 }
 const plate=box(groups.plastics,[.42,1.075,.0],[.025,.20,.19],mats.orange);plate.rotation.z=.33;
 path(groups.controls,[[.36,1.16,-.40],[.34,1.18,-.23],[.38,1.14,-.12],[.38,1.14,.12],[.34,1.18,.23],[.36,1.16,.40]],.011,mats.silver);
 for(const z of [-1,1]){tube(groups.controls,[.36,1.16,z*.29],[.36,1.16,z*.41],.018,mats.rubber);tube(groups.controls,[.39,1.16,z*.27],[.44,1.16,z*.40],.006,mats.silver);box(frame,[-.20,.41,z*.19],[.10,.02,.08],mats.steel);}
 path(groups.controls,[[.37,1.17,-.22],[.47,1.03,-.15],[.59,.73,-.12],[front,.38,-.08]],.004,mats.rubber);
 const drive=groups.drivetrain;disk(drive,[rear,.333,.085],.13,.008,mats.steel);
 path(drive,[[rear,.46,.10],[-.21,.53,.10],[-.15,.49,.10],[-.20,.44,.10],[rear,.205,.10],[rear-.13,.33,.10],[rear,.46,.10]],.009,mats.steel);
 root.updateMatrixWorld(true);return root;
}
export function disposeBikeModel(root:T.Object3D){const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();root.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
