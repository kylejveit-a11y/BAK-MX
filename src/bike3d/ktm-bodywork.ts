import * as T from 'three';
import {KTM_MY25_RIGHT_SHROUD_MARKS,KTM_MY25_LEFT_SHROUD_MARKS} from './ktm-oem-marks.ts';
import {mergeVertices,toCreasedNormals} from 'three/addons/utils/BufferGeometryUtils.js';
import {type AuthoringContext,type V,photo,mesh,path,tube,disk,loft,bolt} from './authoring.ts';

/** Hand-authored body surfaces traced against MY25 standard studio photographs.
 * XY silhouette is photo-derived. Width, crown, thickness and hidden surfaces remain estimates.
 * No image billboards: every visible silhouette is closed, independently replaceable geometry. */
export function buildBodywork(ctx:AuthoringContext){
 const {groups,kit,mats,target,d}=ctx;
 const plastic=target('plastics',mats.orange),airbox=target('plastics',mats.black),seat=target('seat',mats.seat);
 const graphic=new T.MeshStandardMaterial({color:0x2a2e30,roughness:.4});graphic.name='fixed-oem-graphics';
 const red=new T.MeshStandardMaterial({color:0xe83d22,roughness:.36});red.name='fixed-oem-graphics';
 const yScale=(y:number)=>.65+(y-.65)*(d.seatHeight-.65)/(.958-.65);
 // A rounded traced outline, triangulated and subdivided before applying the molded surface.
 function contour(points:number[][],round=.12){
  const p=points.map(([x,y])=>new T.Vector2(...photo(x,y).slice(0,2) as [number,number]));
  if(round===0){const polygon=new T.Shape(p);polygon.closePath();return polygon;}
  const s=new T.Shape();
  for(let i=0;i<p.length;i++){
   const prev=p[(i+p.length-1)%p.length],at=p[i],next=p[(i+1)%p.length];
   const start=at.clone().lerp(prev,round),end=at.clone().lerp(next,round);
   if(!i)s.moveTo(start.x,start.y);else s.lineTo(start.x,start.y);
   s.quadraticCurveTo(at.x,at.y,end.x,end.y);
  }s.closePath();return s;
 }
 function subdivide(geo:T.BufferGeometry,rounds:number){
  let current=geo.index?geo.toNonIndexed():geo;if(current!==geo)geo.dispose();
  for(let level=0;level<rounds;level++){
   const p=current.getAttribute('position'),out:number[]=[];
   for(let i=0;i<p.count;i+=3){const a=new T.Vector3().fromBufferAttribute(p,i),b=new T.Vector3().fromBufferAttribute(p,i+1),c=new T.Vector3().fromBufferAttribute(p,i+2),ab=a.clone().lerp(b,.5),bc=b.clone().lerp(c,.5),ca=c.clone().lerp(a,.5);for(const v of [a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca])out.push(v.x,v.y,v.z);}
   current.dispose();current=new T.BufferGeometry();current.setAttribute('position',new T.Float32BufferAttribute(out,3));
  }return current;
 }
 function panel(name:string,g:T.Group,outline:number[][],surface:(x:number,y:number)=>number,side:number,mat:T.Material,thickness=.004,graphicOnly=false){
  const shape=contour(outline,graphicOnly?0:.1);
  let geo:T.BufferGeometry=graphicOnly?new T.ShapeGeometry(shape,8):new T.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:true,bevelSize:.0025,bevelThickness:.0015,bevelSegments:3,curveSegments:5,steps:1});
  // Tessellation changes surface curvature, rather than adding triangles to a flat cap.
  geo=subdivide(geo,graphicOnly?2:1);const p=geo.getAttribute('position');
  const backing=graphicOnly?g.getObjectByName('shroud-molded-'+side) as T.Mesh:undefined;
  backing?.updateMatrixWorld(true);
  const ray=new T.Raycaster(new T.Vector3(),new T.Vector3(0,0,-side));
  const projected=new Map<string,number>();
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),height=yScale(y);let z=side*(surface(x,y)+p.getZ(i)+(graphicOnly?.008:0));
   if(backing){const key=x.toFixed(7)+','+height.toFixed(7);const cached=projected.get(key);if(cached!==undefined)z=cached;else{ray.ray.origin.set(x,height,side*.5);const hit=ray.intersectObject(backing)[0];if(hit)z=hit.point.z+side*(mat===graphic?.0025:.0018);projected.set(key,z);}}
   p.setXYZ(i,x,height,z);
  }
  if(side<0)for(let i=0;i<p.count;i+=3){const b=new T.Vector3().fromBufferAttribute(p,i+1),c=new T.Vector3().fromBufferAttribute(p,i+2);p.setXYZ(i+1,c.x,c.y,c.z);p.setXYZ(i+2,b.x,b.y,b.z);}
  geo.deleteAttribute('normal');geo.deleteAttribute('uv');const welded=mergeVertices(geo,1e-6);geo.dispose();welded.computeVertexNormals();
  const m=mesh(g,welded,mat,[0,0,0],name);m.userData.authoredSurface=true;return m;
 }
 const shroudOutline=[[349,275],[392,255],[435,237],[466,231],[500,239],[548,245],[589,245],[660,248],[633,268],[608,287],[594,299],[586,310],[578,321],[570,329],[546,337],[542,322],[538,306],[535,287],[491,289],[446,288],[402,282],[374,281]];
 const shroudSurface=(x:number,y:number)=>.115+.055*Math.exp(-(((x-.03)/.25)**2))+.022*Math.exp(-(((y-.86)/.08)**2))-.65*Math.max(0,y-.91)-.20*Math.max(0,x-.23);
 const sideOutline=[[205,235],[246,244],[296,259],[342,276],[376,283],[415,284],[449,288],[438,299],[392,312],[375,320],[385,361],[378,368],[361,361],[332,339],[303,319],[276,300],[248,282],[227,263]];
 // The left airbox-side number panel is deeper than the muffler-side panel.
 // These points are traced from the separate left studio photograph, mirrored
 // around the axle midpoint into +X-forward authoring space, not cloned right.
 const leftSideOutline=[[204,254],[231,263],[277,279],[321,290],[371,294],[414,294],[444,299],[411,315],[390,335],[376,367],[370,394],[362,397],[334,376],[309,353],[281,327],[258,304],[231,282]];
 const sideSurface=(x:number,y:number)=>.102+.031*Math.exp(-(((x+.34)/.30)**2))+.013*Math.exp(-(((y-.81)/.15)**2))-.20*Math.max(0,y-.89);
 for(const side of [-1,1]){
  panel('shroud-molded-'+side,kit.shrouds,shroudOutline,shroudSurface,side,plastic);
  panel('side-number-panel-'+side,kit['side-panels'],side<0?leftSideOutline:sideOutline,sideSurface,side,plastic);
  panel('airbox-cover-'+side,kit['airbox-cover'],[[280,267],[335,278],[387,287],[433,290],[401,308],[372,320],[383,360],[365,354],[329,321]],(x,y)=>sideSurface(x,y)-.015,side,airbox);
  panel('lower-airbox-and-frame-protector-'+side,groups.frame,[[293,313],[330,337],[362,360],[378,370],[386,348],[394,345],[392,393],[403,429],[398,444],[381,446],[366,430],[360,401],[345,375],[319,353],[298,335]],(x,y)=>.114+.015*Math.exp(-(((x+.22)/.13)**2)),side,mats.black,.010);
  // Fixed, independently traced marks for each side, projected onto the
  // actual molded surface. They remain unchanged by plastics-color choices.
  const marks=side>0?KTM_MY25_RIGHT_SHROUD_MARKS:KTM_MY25_LEFT_SHROUD_MARKS;
  marks.red.forEach((outline,i)=>panel('oem-shroud-red-'+side+'-'+i,kit.shrouds,outline,shroudSurface,side,red,0,true));
  marks.charcoal.forEach((outline,i)=>panel('oem-shroud-charcoal-'+side+'-'+i,kit.shrouds,outline,(x,y)=>shroudSurface(x,y)+.001,side,graphic,0,true));
  for(const [px,py] of side<0?[[235,280],[368,386]]:[[235,268],[291,298],[378,360]]){const [x,y]=photo(px,py);bolt(kit['side-panels'],[x,yScale(y),side*(sideSurface(x,y)+.008)],mats.black,.006);}
  const [sx,sy]=photo(419,291);bolt(kit.shrouds,[sx,yScale(sy),side*(shroudSurface(sx,sy)+.009)],mats.black,.006);
  // Subtle lower crease and inward return at the side-panel trailing hook.
  path(kit['side-panels'],(side<0?[[312,351],[340,378],[365,392]]:[[333,338],[356,356],[378,365]]).map(([x,y])=>{const p=photo(x,y);return[p[0],yScale(p[1]),side*(sideSurface(p[0],p[1])+.003)] as V;}),.0014,plastic,24,6);
 }
 // Smooth authored cross-sections [photoX, photoY, halfWidth, depth].
 function sections(g:T.Group,spec:number[][],mat:T.Material,name:string,profile:number[][],samples=54){
  const curve=new T.CatmullRomCurve3(spec.map(([x,y,w])=>new T.Vector3(photo(x,y)[0],photo(x,y)[1],w)),false,'catmullrom',.2);
  const depth=new T.CatmullRomCurve3(spec.map(([x,,w,h])=>new T.Vector3(photo(x,0)[0],h,w)),false,'catmullrom',.2);
  const rings:V[][]=[];
  for(let i=0;i<=samples;i++){const p=curve.getPoint(i/samples),h=depth.getPoint(i/samples).y;rings.push(profile.map(([z,dy])=>[p.x,yScale(p.y+dy*h),p.z*z]));}
  const result=loft(g,rings,mat,name);
  if(name.includes('fender')){const old=result.geometry;result.geometry=toCreasedNormals(old,Math.PI/12);if(result.geometry!==old)old.dispose();}
  return result;
 }
 const seatProfile=[[-1,-.62],[-.98,-.23],[-.86,-.06],[-.62,.03],[-.3,.08],[0,.10],[.3,.08],[.62,.03],[.86,-.06],[.98,-.23],[1,-.62],[.82,-1],[0,-1.03],[-.82,-1]];
 sections(groups.seat,[[207,219,.048,.024],[239,223,.068,.040],[288,231,.083,.058],[341,234,.090,.065],[382,233,.086,.059],[425,228,.077,.051],[463,217,.061,.042],[491,210,.038,.026]],seat,'seat-crowned-standard',seatProfile,64);
 // A fine embossed seat grain, not the nonstandard coarse ribbed seat in the rejected asset.
 const seatSeam:V[]=[];
 for(const [px,py,w] of [[209,226,.046],[250,238,.073],[300,251,.084],[350,258,.091],[400,247,.081],[445,232,.068],[486,219,.038]]){const p=photo(px,py);seatSeam.push([p[0],yScale(p[1]),w]);}
 for(const side of [-1,1])path(groups.seat,seatSeam.map(([x,y,z])=>[x,y,z*side]),.0016,seat,56,6);
 // Tank is a complete dark, lobed volume visible between the saddle and steering head.
 sections(groups.frame,[[387,266,.054,.08],[437,244,.073,.13],[473,224,.071,.14],[507,210,.060,.14],[534,217,.045,.09]],mats.black,'fuel-tank',seatProfile,36);
 const cap=mesh(groups.frame,new T.CylinderGeometry(.026,.030,.018,32),mats.black,photo(510,207));cap.rotation.z=-.18;
 for(let i=0;i<8;i++){const a=i*Math.PI/4;const p=photo(510,207);tube(groups.frame,[p[0]+Math.cos(a)*.025,p[1]+.007,Math.sin(a)*.025],[p[0]+Math.cos(a)*.03,p[1]+.007,Math.sin(a)*.03],.003,mats.black, .003,6);}
 path(groups.frame,[photo(510,201),photo(515,190),photo(543,181)],.003,mats.rubber,24,6);
 // MY25 fenders have a narrow central spine and folded shoulder channels.
 // Width/crown are perspective estimates from the dealer front and rear details.
 const fenderProfile=[[-1,-.66],[-.96,-.48],[-.78,-.14],[-.53,-.20],[-.25,.25],[-.12,.42],[0,.45],[.12,.42],[.25,.25],[.53,-.20],[.78,-.14],[.96,-.48],[1,-.66],[.94,-.82],[.75,-.39],[.51,-.43],[.22,.02],[0,.18],[-.22,.02],[-.51,-.43],[-.75,-.39],[-.94,-.82]];
 sections(kit['front-fender'],[[543,244,.060,.025],[582,232,.086,.029],[627,226,.100,.036],[672,229,.103,.041],[713,239,.096,.044],[752,252,.084,.037],[789,270,.061,.026],[824,288,.008,.008]],plastic,'front-fender-crowned',fenderProfile,64);
 sections(kit['rear-fender'],[[58,207,.018,.006],[109,211,.056,.012],[166,219,.085,.022],[213,231,.094,.032],[255,249,.096,.033],[302,268,.090,.030]],plastic,'rear-fender-channel',fenderProfile,54);
 // A bowed number plate with distinct beveled cheek facets and swept-back
 // lower wings; local +Z is forward before the rake transform. The former
 // rounded rectangle missed the MY25 plate silhouette and molded returns.
 const plateRotation=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),.38).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),Math.PI/2));
 const plateCenter:V=[.441,1.086,0];
 function platePart(points:number[][],name:string,depth:(x:number,y:number)=>number,mat:T.Material=plastic){
  const shape=new T.Shape(points.map(([x,y])=>new T.Vector2(x,y)));
  let geometry:T.BufferGeometry=new T.ExtrudeGeometry(shape,{depth:.0035,bevelEnabled:true,bevelSize:.0014,bevelThickness:.0012,bevelSegments:2,curveSegments:1});
  geometry=subdivide(geometry,2);const p=geometry.getAttribute('position');
  for(let i=0;i<p.count;i++)p.setZ(i,p.getZ(i)+depth(p.getX(i),p.getY(i)));
  geometry.deleteAttribute('normal');geometry.deleteAttribute('uv');const welded=mergeVertices(geometry,1e-6);geometry.dispose();welded.computeVertexNormals();
  const part=mesh(kit['number-plate'],welded,mat,plateCenter,name);part.quaternion.copy(plateRotation);part.userData.authoredSurface=true;return part;
 }
 const plateCrown=(x:number,y:number)=>.018*(1-(x/.116)**2)+.004*Math.max(0,1-((y+.02)/.18)**2);
 platePart([[-.109,.143],[.109,.143],[.113,.043],[.071,-.122],[.057,-.133],[0,-.126],[-.057,-.133],[-.071,-.122],[-.113,.043]],'number-plate-molded',plateCrown);
 for(const side of [-1,1]){
  const cheek=[[-.109,.143],[-.093,.119],[-.092,.036],[-.058,-.120],[-.057,-.133],[-.071,-.122],[-.113,.043]].map(([x,y])=>[x*side,y]);
  platePart(cheek,'number-plate-cheek-'+side,(x,y)=>plateCrown(x,y)+.0015);
  const wing=[[-.072,-.060],[-.108,-.076],[-.127,-.127],[-.126,-.149],[-.055,-.132]].map(([x,y])=>[x*side,y]);
  platePart(wing,'number-plate-lower-wing-'+side,(x,y)=>plateCrown(x,y)-.008-.42*Math.max(0,Math.abs(x)-.067));
 }
 // The fixed corner insert is part of the OEM appearance, not a designer.
 platePart([[.020,.141],[.105,.141],[.107,.110]],'number-plate-oem-corner',(x,y)=>plateCrown(x,y)+.003,graphic);
 // Open-backed molded fork guards, following the fork leg instead of a full tube.
 for(const side of [-1,1]){
  const bottom=new T.Vector3(d.wheelbase/2-.007,.374,side*.092),top=new T.Vector3(.593,.676,side*.092),axis=top.clone().sub(bottom).normalize(),forward=new T.Vector3(axis.y,-axis.x,0);
  const ring:V[][]=[];
  for(let j=0;j<=14;j++){const t=j/14,c=bottom.clone().lerp(top,t),r=.027+Math.sin(t*Math.PI)*.004,rr:V[]=[];for(let k=0;k<=14;k++){const a=-Math.PI*.57+k/14*Math.PI*1.14;rr.push(c.clone().addScaledVector(forward,Math.cos(a)*r).add(new T.Vector3(0,0,Math.sin(a)*r)).toArray() as V);}for(let k=14;k>=0;k--){const a=-Math.PI*.57+k/14*Math.PI*1.14;rr.push(c.clone().addScaledVector(forward,Math.cos(a)*(r-.003)).add(new T.Vector3(0,0,Math.sin(a)*(r-.003))).toArray() as V);}ring.push(rr);}
  loft(kit['fork-guards'],ring,plastic,'fork-guard-'+side);
  for(const t of [.06,.20]){const c=bottom.clone().lerp(top,t).addScaledVector(forward,.031);disk(kit['fork-guards'],c.toArray() as V,.0045,.004,mats.silver,12);}
 }
}
