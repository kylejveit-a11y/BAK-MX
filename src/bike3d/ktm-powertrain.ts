import * as T from 'three';
import {mesh,tube,path,disk,box,loft,bolt,photo,vector,type V,type AuthoringContext} from './authoring.ts';

type P=[number,number];

/** Rounded outline of an exterior casting, traced in the right OEM studio view.
 * Depths and the hidden continuation of each casting are artist estimates. */
function casting(g:T.Group,outline:P[],z:number,depth:number,mat:T.Material,name:string,round=.006){
 const p=outline.map(([x,y])=>photo(x,y));
 const s=new T.Shape();
 const mid=(a:V,b:V)=>[(a[0]+b[0])/2,(a[1]+b[1])/2] as P;
 s.moveTo(...mid(p[p.length-1],p[0]));
 p.forEach((v,i)=>s.quadraticCurveTo(v[0],v[1],...mid(v,p[(i+1)%p.length])));s.closePath();
 return mesh(g,new T.ExtrudeGeometry(s,{depth,steps:1,curveSegments:5,bevelEnabled:true,bevelSize:round,bevelThickness:round*.65,bevelSegments:3}),mat,[0,0,z],name);
}

function photoPath(g:T.Group,outline:P[],z:number,r:number,mat:T.Material,name=''){
 const m=path(g,outline.map(([x,y])=>photo(x,y,z)),r,mat,Math.max(24,outline.length*7),8);m.name=name;return m;
}

function photoBolt(g:T.Group,x:number,y:number,z:number,mat:T.Material,r=.0046){return bolt(g,photo(x,y,z),mat,r);}

/** Formed stock shell: a broad outer cheek, narrower inner face and unequal
 * upper/lower shoulders. Section widths remain estimates from the photographs. */
function ovalShell(g:T.Group,a:V,b:V,rings:[number,number,number][],mat:T.Material,name:string,cap=false){
 const axis=vector(b).sub(vector(a)).normalize(),u=new T.Vector3(-axis.y,axis.x,0).normalize(),v=new T.Vector3().crossVectors(axis,u).normalize();
 const section:P[]=[[1,.30],[.91,.78],[.62,.98],[.18,1.025],[-.27,1.02],[-.66,.97],[-.91,.74],[-1,.23],[-.89,-.38],[-.62,-.79],[.05,-.88],[.69,-.76],[.96,-.29]];
 const sections=rings.map(([t,ry,rz])=>section.map(([sy,sz])=>{
  const p=vector(a).lerp(vector(b),t).addScaledVector(u,ry*sy).addScaledVector(v,rz*sz);
  // The silver cap folds back diagonally across its large outside cheek, then
  // returns to the outlet plane rather than ending in a symmetric dome.
  if(cap)p.addScaledVector(axis,Math.sin(Math.PI*t)*(.008*sz-.006*sy));
  return p.toArray() as V;
 }));
 return loft(g,sections,mat,name);
}

/** A continuous crown over a cast face. The gasket perimeter stays in place;
 * only the broad face gains changing depth toward its off-centre crown. */
function crownedCase(g:T.Group,outline:P[],center:P,z:number,height:number,side:number,mat:T.Material,name:string){
 const s=new T.Shape(),p=outline.map(([x,y])=>photo(x,y));
 const mid=(a:V,b:V)=>[(a[0]+b[0])/2,(a[1]+b[1])/2] as P;
 s.moveTo(...mid(p[p.length-1],p[0]));p.forEach((v,i)=>s.quadraticCurveTo(v[0],v[1],...mid(v,p[(i+1)%p.length])));s.closePath();
 const boundary=s.getPoints(3);boundary.pop();
 if(T.ShapeUtils.isClockWise(boundary)===(side>0))boundary.reverse();
 const c=photo(...center),rings=[1,.86,.65,.40,.16,.025].map(scale=>boundary.map(p=>{
  const x=c[0]+(p.x-c[0])*scale,y=c[1]+(p.y-c[1])*scale;
  const crown=height*(1-scale*scale)*(1+.22*(x-c[0])/.12);
  return [x,y,z+side*crown] as V;
 }));
 return loft(g,rings,mat,name);
}

/** Stamped two-half chamber with a changing, compound-curved section. */
function pressedChamber(g:T.Group,top:P[],bottom:P[],mat:T.Material,weld:T.Material){
 const curve=(points:P[])=>new T.CatmullRomCurve3(points.map(([x,y])=>vector(photo(x,y))),false,'centripetal');
 const upper=curve(top),lower=curve(bottom),longitudinal=44,transverse=12,row=transverse+1,count=(longitudinal+1)*row;
 const positions:number[]=[],indices:number[]=[],seam:V[]=[];
 for(const side of [1,-1])for(let i=0;i<=longitudinal;i++){
  const t=i/longitudinal,a=upper.getPointAt(t),b=lower.getPointAt(t);
  for(let j=0;j<=transverse;j++){
   const across=j/transverse,p=a.clone().lerp(b,across),along=T.MathUtils.clamp((p.x-photo(422,0)[0])/(107/394.5),0,1);
   const shoulder=Math.pow(Math.sin(across*Math.PI),.65),endBlend=.38+.62*Math.pow(Math.sin(t*Math.PI),.45);
   // A fuller middle and restrained edges reproduce the pressed outer half;
   // the inner half has a shallower crown against the engine.
   const seamZ=.171+.064*along;
   p.z=seamZ+side*(side>0?.027:.021)*shoulder*endBlend;
   positions.push(p.x,p.y,p.z);
  }
 }
 for(let i=0;i<longitudinal;i++)for(let j=0;j<transverse;j++){
  const a=i*row+j,b=a+1,c=a+row,d=c+1;
  indices.push(a,b,c,b,d,c,a+count,c+count,b+count,b+count,c+count,d+count);
 }
 const perimeter:number[]=[];
 for(let i=0;i<=longitudinal;i++)perimeter.push(i*row);
 for(let j=1;j<=transverse;j++)perimeter.push(longitudinal*row+j);
 for(let i=longitudinal-1;i>=0;i--)perimeter.push(i*row+transverse);
 for(let j=transverse-1;j>0;j--)perimeter.push(j);
 perimeter.forEach((a,i)=>{const b=perimeter[(i+1)%perimeter.length];indices.push(a,b,b+count,a,b+count,a+count);seam.push([positions[a*3],positions[a*3+1],positions[a*3+2]]);});
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
 mesh(g,geo,mat,[0,0,0],'formed-header-crescent-resonator');
 seam.push(seam[0]);path(g,seam,.0011,weld,140,6).name='resonator-continuous-perimeter-weld';
}

export function buildPowertrain(ctx:AuthoringContext){
 const {groups,mats,target,root}=ctx,engine=groups.engine,cooling=groups.cooling;
 const cast=mats.engine,bright=mats.silver,dark=mats.darkMetal??mats.black;
 const castLight=cast.clone();castLight.color.setHex(0x858b8a);castLight.metalness=.42;castLight.roughness=.60;
 const castShadow=cast.clone();castShadow.color.setHex(0x535a59);castShadow.metalness=.30;castShadow.roughness=.70;
 const gasket=mats.black.clone();gasket.color.setHex(0x1b1f1e);gasket.roughness=.78;
 const magnesium=mats.black.clone();magnesium.color.setHex(0x292d2b);magnesium.metalness=.30;magnesium.roughness=.67;
 const coverFace=magnesium.clone();coverFace.color.setHex(0x202422);coverFace.roughness=.78;

 // The engine is a liquid-cooled compact single: a tapered barrel, irregular
 // cast crankcase and different removable covers on each side, not finned blocks.
 const crank:P[]=[[405,373],[427,360],[459,362],[480,373],[496,384],[507,403],[506,427],[492,451],[474,462],[444,465],[420,460],[402,449],[391,430],[390,405],[396,386]];
 casting(engine,crank,-.094,.188,castShadow,'crankcase-central-casting',.010);
 const rightGasket:P[]=[[405,377],[425,368],[453,372],[474,378],[487,389],[501,399],[506,418],[494,444],[479,457],[453,461],[429,458],[411,451],[401,436],[395,419],[396,398]];
 casting(engine,rightGasket,.093,.006,gasket,'right-case-gasket',.003);
 casting(engine,rightGasket,.100,.025,castLight,'right-clutch-case-casting',.007);
 crownedCase(engine,rightGasket,[447,413],.128,.013,1,castLight,'right-case-compound-crown');
 // Underside sump and an uneven front web remain visible beyond the cover.
 casting(engine,[[414,441],[444,446],[472,438],[494,439],[488,455],[465,462],[432,461],[414,454]],-.074,.149,castLight,'sump-bottom-casting',.006);
 casting(engine,[[470,374],[490,369],[501,380],[511,397],[505,419],[491,434],[475,431],[478,411]],.110,.023,cast,'right-front-cast-web',.006);
 photoPath(engine,[[407,444],[424,454],[451,458],[477,451],[489,436]],.137,.0028,castShadow,'right-cover-bottom-seam');
 photoPath(engine,[[476,382],[488,390],[491,407],[482,425],[471,433]],.141,.0038,castLight,'right-cast-oil-gallery');
 photoPath(engine,[[458,442],[467,435],[473,419],[485,408]],.143,.0041,castLight,'diagonal-casting-rib');
 photoPath(engine,[[401,407],[402,391],[413,380],[425,376]],.139,.0032,castLight,'upper-cover-rib');
 for(const [x,y] of [[407,383],[427,371],[454,377],[478,384],[496,400],[500,421],[487,443],[472,455],[446,459],[423,454],[407,442],[398,421],[398,400]] as P[]){
  disk(engine,photo(x,y,.137),.008,.009,castLight,24);photoBolt(engine,x,y,.144,bright,.0041);
 }

 // A shallow raised clutch protector has a lobed cast rim and a fine ribbed face.
 const clutch:P[]=[[411,391],[421,383],[435,382],[450,389],[459,400],[462,414],[456,429],[446,438],[431,441],[418,435],[409,424],[405,409]];
 casting(engine,clutch,.139,.010,magnesium,'clutch-protector-lobed-rim',.006);
 const center=photo(433,412,.159);
 const clutchFace=disk(engine,center,.065,.009,coverFace,64);clutchFace.name='right-clutch-protector-face';clutchFace.scale.y=.98;
 const rim=mesh(engine,new T.TorusGeometry(.0665,.0025,8,64),magnesium,[center[0],center[1],.166],'clutch-protector-rim');rim.scale.y=1.01;
 const stipplePositions:V[]=[];
 for(let row=-10;row<=10;row++)for(let col=-10;col<=10;col++){
  const x=(col+(row%2)*.5)*.0053,y=row*.0050;
  if(x*x+y*y<.054*.054)stipplePositions.push([center[0]+x,center[1]+y,.167]);
 }
 const stipple=new T.InstancedMesh(new T.ConeGeometry(.0018,.0011,4),magnesium,stipplePositions.length),stippleTransform=new T.Object3D();
 stipple.name='clutch-protector-diamond-texture';stipple.castShadow=true;stipple.receiveShadow=true;
 stipplePositions.forEach((p,i)=>{stippleTransform.position.set(...p);stippleTransform.rotation.set(Math.PI/2,0,Math.PI/4);stippleTransform.updateMatrix();stipple.setMatrixAt(i,stippleTransform.matrix);});engine.add(stipple);
 for(const [x,y] of [[412,395],[433,385],[453,397],[456,421],[437,439],[415,430]] as P[])photoBolt(engine,x,y,.166,castShadow,.0033);
 // Small mint index segment is part of the photographed stock clutch guard.
 const indexMat=new T.MeshStandardMaterial({color:0x7dd8bc,roughness:.64});
 const indexPts:V[]=[];for(let i=0;i<20;i++){const a=.3+i/19*.75;indexPts.push([center[0]+Math.cos(a)*.070,center[1]+Math.sin(a)*.070,.169]);}path(engine,indexPts,.0016,indexMat,28,6).name='clutch-cover-index';

 // Left stator casting is visibly smaller, angular and differently positioned.
 const leftStator=new T.Group();leftStator.name='left-stator-assembly';leftStator.position.x=27/394.5;engine.add(leftStator);
 const leftCase:P[]=[[408,381],[428,374],[453,377],[471,386],[482,404],[481,423],[474,446],[459,458],[436,459],[415,450],[403,431],[399,409]];
 casting(leftStator,leftCase,-.117,.021,castLight,'left-stator-case-casting',.007);
 crownedCase(leftStator,leftCase,[444,418],-.120,.011,-1,castLight,'left-case-compound-crown');
 const leftCover:P[]=[[419,400],[435,390],[452,394],[465,406],[468,425],[458,442],[443,448],[427,441],[417,428],[414,414]];
 casting(leftStator,leftCover,-.144,.020,magnesium,'left-stator-protector',.005);
 const stator=photo(442,421,-.151);
 disk(leftStator,stator,.041,.007,coverFace,48).name='left-stator-center';
 mesh(leftStator,new T.TorusGeometry(.035,.0014,6,48),gasket,[stator[0],stator[1],-.156],'left-stator-emboss');
 disk(leftStator,[stator[0],stator[1],-.158],.010,.004,magnesium,12);
 for(const [x,y] of [[418,402],[439,394],[460,409],[463,431],[444,447],[422,434],[405,409],[414,449],[463,452],[477,426],[477,401]] as P[])photoBolt(leftStator,x,y,-.149,bright,.0037);
 photoPath(leftStator,[[407,403],[414,387],[430,381],[449,383]],-.126,.0035,castLight,'left-upper-cast-rib');
 photoPath(leftStator,[[474,408],[475,436],[462,453],[444,455]],-.131,.0036,castLight,'left-case-oil-gallery');
 // Sprocket-side shaft boss and clutch actuation details; the final drive owns
 // the actual countershaft sprocket and chain.
 disk(engine,photo(417,423,-.119),.029,.025,castLight,32);
 disk(engine,photo(417,423,-.137),.016,.010,dark,24);
 photoPath(engine,[[439,447],[458,459],[481,461],[504,455]],-.172,.0063,bright,'left-shift-lever');
 tube(engine,photo(504,455,-.169),photo(504,455,-.216),.010,mats.rubber,.010,16);
 for(let i=0;i<5;i++)disk(engine,photo(504,455,-.176-i*.007),.0105,.002,magnesium,20);

 // Slanted barrel and head use continuously rounded shoulders and two real
 // assembly seams; the water jacket has no stacked air-cooling fins.
 casting(engine,[[450,367],[467,353],[496,353],[509,366],[499,391],[484,402],[455,391],[444,380]],-.077,.154,cast,'cylinder-water-jacket',.009);
 casting(engine,[[454,363],[468,357],[497,359],[508,367],[504,373],[472,372],[451,371]],-.083,.166,castLight,'cylinder-upper-flange',.003);
 casting(engine,[[444,380],[457,375],[489,386],[498,394],[492,399],[461,393],[447,387]],-.083,.166,castLight,'cylinder-base-flange',.003);
 for(const side of [-1,1]){
  photoPath(engine,[[462,363],[458,372],[455,381]],side*.087,.0030,castLight,'cylinder-cast-rib');
  photoPath(engine,[[481,366],[478,377],[475,386]],side*.087,.0030,castLight,'cylinder-cast-rib');
  photoPath(engine,[[496,367],[491,381],[488,389]],side*.087,.0030,castLight,'cylinder-cast-rib');
  photoBolt(engine,455,377,side*.091,bright,.0042);photoBolt(engine,496,381,side*.091,bright,.0042);
 }
 casting(engine,[[458,343],[470,332],[500,331],[519,337],[526,350],[518,364],[497,371],[472,365],[457,355]],-.091,.182,castLight,'cylinder-head-casting',.008);
 casting(engine,[[466,326],[479,321],[501,323],[512,331],[514,344],[501,349],[475,349],[464,342]],-.086,.172,magnesium,'valve-cover',.007);
 for(const side of [-1,1]){
  photoPath(engine,[[459,350],[475,356],[499,359],[518,352]],side*.099,.0026,castShadow,'head-gasket-seam');
  for(const [x,y] of [[467,345],[481,336],[506,339],[516,353]] as P[])photoBolt(engine,x,y,side*.102,bright,.0043);
  disk(engine,photo(519,345,side*.098),.022,.015,castShadow,32);
  disk(engine,photo(519,345,side*.109),.016,.006,castLight,32);
  photoPath(engine,[[475,331],[479,324],[488,320]],side*.077,.0045,magnesium,'valve-cover-raised-channel');
 }
 // Exposed intake boot, starter body and cast mounting ears sit in the spaces
 // between the head and rear frame, not as invisible engine internals.
 tube(engine,photo(466,338,0),photo(447,325,0),.030,mats.rubber,.027,24);
 tube(engine,photo(447,325,0),photo(444,318,0),.031,castShadow,.030,24);
 tube(engine,photo(429,366,-.050),photo(459,354,-.050),.023,castShadow,.023,24);
 for(const side of [-1,1]){
  casting(engine,[[426,354],[436,337],[444,340],[447,356],[439,367]],side>0?.063:-.081,.018,castLight,'head-mount-ear',.004);
  photoBolt(engine,438,346,side*.088,bright,.0057);
 }
 const pump:P[]=[[476,417],[482,405],[494,401],[503,407],[503,419],[495,429],[482,430]];
 casting(engine,pump,.138,.014,castLight,'right-water-pump-housing',.005);
 disk(engine,photo(490,415,.158),.017,.009,cast,32);
 photoBolt(engine,490,415,.166,bright,.0056);
 for(const [x,y] of [[482,408],[499,410],[495,426]] as P[])photoBolt(engine,x,y,.163,bright,.0034);
 photoPath(engine,[[497,402],[504,391],[505,381]],.134,.010,castShadow,'water-pump-neck');
 photoPath(engine,[[505,382],[510,370],[511,354],[520,342]],.125,.011,mats.rubber,'coolant-engine-hose');
 tube(engine,photo(504,380,.134),photo(506,374,.132),.0124,bright,.0124,20);
 disk(engine,photo(468,437,.149),.012,.010,castLight,32).name='oil-filler-cap';
 const oilSlot=box(engine,photo(468,437,.157),[.013,.0025,.0025],castShadow,.001);oilSlot.rotation.z=.5;
 photoBolt(engine,448,460,.095,bright,.0062);

 // Paired cores sit behind the shrouds. Their cooling fins and forward louvers
 // are real exterior features, visible from the front three-quarter views.
 for(const side of [-1,1]){
  const radiator=new T.Group();radiator.name=side>0?'right-radiator-core':'left-radiator-core';
  radiator.position.set(.229,.785,side*.083);radiator.rotation.z=-.16;cooling.add(radiator);
  box(radiator,[0,0,0],[.037,.237,.110],gasket,.003);
  for(const y of [-.119,.119])box(radiator,[.001,y,0],[.046,.025,.119],castShadow,.005);
  for(const z of [-.056,.056])box(radiator,[.002,0,z],[.046,.231,.007],castShadow,.002);
  for(let i=0;i<24;i++)box(radiator,[.022,-.108+i*.009,0],[.0025,.0017,.102],dark,.0005);
  for(let i=0;i<8;i++)box(radiator,[.026,0,-.048+i*.0137],[.008,.213,.0025],magnesium,.001);
  for(const y of [-.103,.103])for(const z of [-.049,.049]){
   const b=disk(radiator,[.027,y,z],.0038,.004,bright,6);b.rotation.z=Math.PI/2;
  }
  const zz=side*.105;
  path(cooling,[[.211,.669,zz],[.191,.646,zz],[.150,.627,side*.095],[.119,.593,side*.102]],.011,mats.rubber,42,12).name='lower-radiator-hose';
  tube(cooling,[.204,.662,zz],[.196,.653,zz],.0125,bright,.0125,20);
  path(cooling,[[.252,.899,zz],[.217,.916,zz],[.172,.899,side*.068],[.137,.817,side*.072],[.127,.758,side*.075]],.0105,mats.rubber,52,12).name='upper-radiator-hose';
 }
 path(cooling,[[.238,.896,-.105],[.261,.925,-.065],[.263,.927,.065],[.238,.896,.105]],.0085,mats.rubber,40,10).name='radiator-balance-hose';
 tube(cooling,[.252,.904,.113],[.254,.920,.113],.015,castShadow,.015,20);
 box(cooling,[.254,.923,.113],[.039,.008,.026],bright,.004).name='radiator-pressure-cap';

 const stockHeader=groups.exhaust.getObjectByName('stock-header') as T.Group;
 const stockMuffler=groups.exhaust.getObjectByName('stock-muffler') as T.Group;
 const headerMat=target('exhaust',mats.silver);headerMat.color.setHex(0xbdbeb9);headerMat.metalness=.87;headerMat.roughness=.29;
 const mufflerMat=target('exhaust',mats.black);mufflerMat.color.setHex(0x292c2b);mufflerMat.metalness=.46;mufflerMat.roughness=.46;mufflerMat.userData.representativeFinish=true;
 const endMat=target('exhaust',mats.silver);endMat.color.setHex(0xaeb1ae);endMat.metalness=.8;endMat.roughness=.38;
 const weld=headerMat.clone();weld.color.setHex(0x858881);weld.roughness=.49;
 const headerPoints:V[]=[photo(516,354,.086),photo(527,372,.090),photo(535,400,.108),photo(540,426,.136),photo(535,434,.174),photo(525,423,.211),photo(516,393,.224),photo(500,371,.219),photo(477,359,.203),photo(448,356,.178),photo(424,360,.156),photo(407,373,.105),photo(392,382,.045),photo(364,376,.035),photo(336,360,.065),photo(313,352,.135)];
 const headerCurve=new T.CatmullRomCurve3(headerPoints.map(vector),false,'centripetal');
 // Keep the first child as a continuous TubeGeometry for connector inspection.
 const header=mesh(stockHeader,new T.TubeGeometry(headerCurve,144,.0195,16,false),headerMat,[0,0,0],'stock-header-primary-tube');
 header.userData={inlet:headerPoints[0],outlet:headerPoints[headerPoints.length-1],profileStatus:'PHOTO_ESTIMATED'};
 stockHeader.userData={inlet:headerPoints[0],outlet:headerPoints[headerPoints.length-1],connectionRole:'header-to-muffler'};
 // The resonator is a broad flattened crescent pressed in two welded halves,
 // rather than a second round pipe. Its outer face slopes outward toward the
 // forward U-bend; rounded shoulders and the seam describe the stamped skin.
 pressedChamber(stockHeader,[[422,353],[441,348],[463,349],[484,355],[501,367],[515,383],[528,403]],[[421,365],[429,369],[443,363],[461,364],[480,370],[497,382],[511,398],[522,413],[529,411]],headerMat,weld);
 for(const t of [.055,.19,.35,.82,.93]){
  const p=headerCurve.getPointAt(t),tangent=headerCurve.getTangentAt(t).normalize();
  const ring=mesh(stockHeader,new T.TorusGeometry(.0197,.0010,6,24),weld,p.toArray() as V,'header-weld-band');
  ring.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),tangent);
 }
 const port=headerPoints[0],dir=vector(headerPoints[1]).sub(vector(port)).normalize();
 const flange=mesh(stockHeader,new T.TorusGeometry(.023,.004,8,28),castShadow,port,'exhaust-port-flange');flange.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),dir);
 for(const dz of [-.029,.029])photoBolt(stockHeader,516,354,.086+dz,bright,.0042);
 // A small tension spring crosses the rear slip joint alongside the chamber.
 const springA=photo(405,369,.163),springB=photo(420,358,.178),springAxis=vector(springB).sub(vector(springA)),springNormal=new T.Vector3(-springAxis.y,springAxis.x,0).normalize(),springDepth=new T.Vector3().crossVectors(springAxis.clone().normalize(),springNormal).normalize();
 const springPts:V[]=[];for(let i=0;i<=100;i++){const t=i/100,a=t*Math.PI*20;springPts.push(vector(springA).addScaledVector(springAxis,t).addScaledVector(springNormal,Math.cos(a)*.0032).addScaledVector(springDepth,Math.sin(a)*.0032).toArray() as V);}path(stockHeader,springPts,.00075,bright,100,5).name='header-retention-spring';

 const connector=headerPoints[headerPoints.length-1];
 const bodyFront=photo(293,340,.142),bodyRear=photo(179,279,.150),capRear=photo(163,272,.150);
 path(stockMuffler,[connector,photo(304,350,.138),bodyFront],.0208,headerMat,24,16).name='muffler-inlet-neck';
 ovalShell(stockMuffler,bodyFront,bodyRear,[[0,.030,.032],[.09,.045,.040],[.80,.056,.048],[1,.056,.048]],mufflerMat,'stock-black-tapered-muffler');
 ovalShell(stockMuffler,bodyRear,capRear,[[0,.057,.049],[.12,.058,.050],[.46,.055,.047],[.76,.041,.035],[1,.033,.029]],endMat,'stock-silver-formed-outlet-cap',true);
 // End opening faces rearward and retains a dark recessed bore.
 const capAxis=vector(capRear).sub(vector(bodyRear)).normalize();
 const mouth=mesh(stockMuffler,new T.CircleGeometry(.024,32),gasket,vector(capRear).addScaledVector(capAxis,.001).toArray() as V,'muffler-dark-outlet');mouth.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),capAxis);
 const outletLip=mesh(stockMuffler,new T.TorusGeometry(.025,.0025,8,32),endMat,capRear,'muffler-outlet-lip');outletLip.quaternion.copy(mouth.quaternion);
 for(const side of [-1,1]){
  photoPath(stockMuffler,[[184,266],[210,282],[246,302],[279,323]],.150+side*.049,.0014,side>0?endMat:magnesium,'muffler-side-seam');
  for(const [x,y] of [[184,268],[178,289],[278,329]] as P[])photoBolt(stockMuffler,x,y,.150+side*.048,bright,.0028);
 }
 // Visible black hanger lug; mounting point is distinct from the inlet joint.
 casting(stockMuffler,[[231,286],[240,283],[248,298],[241,309],[233,303]],.141,.014,magnesium,'muffler-mount-hanger',.003);
 photoBolt(stockMuffler,239,296,.162,bright,.0048);
 stockMuffler.userData={inlet:connector,mount:photo(239,296,.162),profileStatus:'PHOTO_ESTIMATED'};
 root.userData.hardpoints={...root.userData.hardpoints,'exhaust-port':port,'muffler-mount':photo(239,296,.162),'muffler-inlet':connector,'radiator-mount':[.229,.785,0]};
 engine.userData.geometryStatus='PHOTO_ESTIMATED_EXTERIOR';
 cooling.userData.geometryStatus='PHOTO_ESTIMATED_EXTERIOR';
 groups.exhaust.userData.geometryStatus='PHOTO_ESTIMATED_EXTERIOR';
}
