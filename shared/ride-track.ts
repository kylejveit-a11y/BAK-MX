// Ride tracking and lap timing from the phone's GPS. Pure maths, no phone or server code, so it can be tested with made-up
// rides. The phone records one position about every second; these functions clean the points, find where a lap starts
// without being told (a track's map pin is rarely on the start line), time each lap, and sum up a trail ride.
// Honest limit: a phone fixes position about once a second to within a few metres, so a lap time is good to roughly a
// second. Good for "am I getting faster", not for hundredths.

export type Fix={/** ms since 1970 */t:number;lat:number;lng:number;/** reported accuracy radius, metres */acc?:number|null;/** m/s from the phone, when it gives one */speed?:number|null};
export type Lap={n:number;/** crossing times, ms */start:number;end:number;ms:number;/** a lap far slower than the rider's normal one: a stop, a crash or a trip through the pits */slow:boolean};
export type RideSummary={started:number;ended:number;/** total seconds from first to last point */seconds:number;/** seconds actually moving */moving_seconds:number;/** metres */distance_m:number;/** m/s, smoothed so one bad point cannot set it */top_speed_ms:number;laps:Lap[];best_ms:number|null;average_ms:number|null;/** where laps were counted from */gate:{lat:number;lng:number}|null;kind:'track'|'trail'};

export const TRACKING={/** points with a worse reported accuracy than this are dropped, metres */maxAccuracyM:35,/** faster than any dirt bike on dirt: a GPS jump, m/s (about 110 mph) */maxSpeedMs:50,/** below this the rider is stopped, m/s (about 3 mph) */movingMs:1.4,/** how close a pass must come to the start point to count, metres */gateRadiusM:14,/** no real lap is shorter, seconds */minLapS:20,/** a pass must head the same way as the first, degrees either side */headingWindow:70,/** laps this many times the usual lap are marked slow */slowFactor:1.6} as const;

const R=6371000,rad=(d:number)=>d*Math.PI/180;
/** Metres between two points. */
export function metres(a:{lat:number;lng:number},b:{lat:number;lng:number}):number{
 const dLat=rad(b.lat-a.lat),dLng=rad(b.lng-a.lng),h=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;
 return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));
}
/** Compass heading from a to b, 0-360. */
export function heading(a:{lat:number;lng:number},b:{lat:number;lng:number}):number{
 const y=Math.sin(rad(b.lng-a.lng))*Math.cos(rad(b.lat)),x=Math.cos(rad(a.lat))*Math.sin(rad(b.lat))-Math.sin(rad(a.lat))*Math.cos(rad(b.lat))*Math.cos(rad(b.lng-a.lng));
 return (Math.atan2(y,x)*180/Math.PI+360)%360;
}
const turn=(a:number,b:number)=>Math.abs(((a-b+540)%360)-180);
/** Flat x/y in metres around an origin: accurate to centimetres across a track or a riding area. */
const flat=(o:{lat:number;lng:number},p:{lat:number;lng:number})=>({x:rad(p.lng-o.lng)*R*Math.cos(rad(o.lat)),y:rad(p.lat-o.lat)*R});

/** In time order, without poor fixes, repeats or impossible jumps. */
export function cleanFixes(raw:Fix[]):Fix[]{
 const sorted=raw.filter(f=>Number.isFinite(f.t)&&Number.isFinite(f.lat)&&Number.isFinite(f.lng)&&Math.abs(f.lat)<=90&&Math.abs(f.lng)<=180&&(f.acc==null||f.acc<=TRACKING.maxAccuracyM)).sort((a,b)=>a.t-b.t);
 const out:Fix[]=[];
 for(const f of sorted){const last=out[out.length-1];
  if(!last){out.push(f);continue;}
  const dt=(f.t-last.t)/1000;if(dt<=0)continue;
  if(metres(last,f)/dt>TRACKING.maxSpeedMs)continue;
  out.push(f);}
 return out;
}
/** Speed between neighbouring fixes, m/s, averaged over three so a single wobble cannot spike it. */
function speeds(f:Fix[]):number[]{
 const raw=f.map((p,i)=>i?metres(f[i-1],p)/Math.max(0.2,(p.t-f[i-1].t)/1000):0);
 return raw.map((_,i)=>{const w=raw.slice(Math.max(1,i-1),Math.min(raw.length,i+2));return w.length?w.reduce((a,b)=>a+b,0)/w.length:0;});
}
/** Every pass of the start point: the moment of closest approach on each visit, heading the same way as the reference. */
function passes(f:Fix[],gate:{lat:number;lng:number},ref:number|null):number[]{
 const times:number[]=[];let best:{d:number;t:number}|null=null,inside=false;
 const close=()=>{if(best&&(!times.length||(best.t-times[times.length-1])/1000>=TRACKING.minLapS))times.push(best.t);best=null;};
 for(let i=1;i<f.length;i++){const a=flat(gate,f[i-1]),b=flat(gate,f[i]),dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy;
  // closest point of this stretch to the start point, and when the rider was there
  const k=len?Math.max(0,Math.min(1,-(a.x*dx+a.y*dy)/len)):0,cx=a.x+k*dx,cy=a.y+k*dy,d=Math.hypot(cx,cy);
  const near=d<=TRACKING.gateRadiusM&&len>0.25&&(ref==null||turn(heading(f[i-1],f[i]),ref)<=TRACKING.headingWindow);
  if(near){inside=true;if(!best||d<best.d)best={d,t:f[i-1].t+k*(f[i].t-f[i-1].t)};}
  else if(inside&&d>TRACKING.gateRadiusM*1.5){inside=false;close();}}
 if(inside)close();
 return times;
}
const median=(v:number[])=>{const s=[...v].sort((a,b)=>a-b);return s.length?s.length%2?s[(s.length-1)/2]:(s[s.length/2-1]+s[s.length/2])/2:0;};
/** Finds the start point by itself: of the places the rider passed early on, the one they came back to most often and most evenly. */
export function findLaps(clean:Fix[]):{laps:Lap[];gate:{lat:number;lng:number}|null}{
 if(clean.length<30)return{laps:[],gate:null};
 const sp=speeds(clean),first=clean.findIndex((_,i)=>sp[i]>=TRACKING.movingMs*2);
 if(first<0)return{laps:[],gate:null};
 let pick:{times:number[];gate:{lat:number;lng:number};score:number}|null=null;
 // try a start point every few seconds of the first four minutes of riding
 const until=clean[first].t+240000;let lastTried=-Infinity;
 for(let i=Math.max(1,first);i<clean.length&&clean[i].t<=until;i++){
  if(clean[i].t-lastTried<4000||sp[i]<TRACKING.movingMs*2)continue;lastTried=clean[i].t;
  const gate={lat:clean[i].lat,lng:clean[i].lng},times=passes(clean,gate,heading(clean[i-1],clean[i]));
  if(times.length<3)continue;
  const ms=times.slice(1).map((t,k)=>t-times[k]),m=median(ms),even=ms.filter(x=>x<=m*TRACKING.slowFactor).length;
  const spread=ms.filter(x=>x<=m*TRACKING.slowFactor).reduce((a,x)=>a+Math.abs(x-m),0)/Math.max(1,even)/Math.max(1,m);
  const score=even-spread; // most clean laps first, the steadier one breaks a tie
  if(!pick||score>pick.score)pick={times,gate,score};}
 if(!pick)return{laps:[],gate:null};
 const ms=pick.times.slice(1).map((t,k)=>t-pick!.times[k]),m=median(ms);
 return{gate:pick.gate,laps:ms.map((x,k)=>({n:k+1,start:pick!.times[k],end:pick!.times[k+1],ms:Math.round(x),slow:x>m*TRACKING.slowFactor}))};
}
/** The whole ride in numbers. Two or more laps makes it a track session; anything else is a trail ride. */
export function summarize(raw:Fix[]):RideSummary|null{
 const f=cleanFixes(raw);if(f.length<2)return null;
 const sp=speeds(f);let distance=0,moving=0;
 for(let i=1;i<f.length;i++){const dt=(f[i].t-f[i-1].t)/1000;if(dt>30)continue; // a gap: signal lost or the app was asleep, not riding
  if(sp[i]>=TRACKING.movingMs){distance+=metres(f[i-1],f[i]);moving+=dt;}}
 const {laps,gate}=findLaps(f),good=laps.filter(l=>!l.slow),kind=laps.length>=2?'track':'trail';
 return{started:f[0].t,ended:f[f.length-1].t,seconds:Math.round((f[f.length-1].t-f[0].t)/1000),moving_seconds:Math.round(moving),distance_m:Math.round(distance),top_speed_ms:Math.round(Math.max(0,...sp)*10)/10,
  laps:kind==='track'?laps:[],best_ms:kind==='track'&&good.length?Math.min(...good.map(l=>l.ms)):null,average_ms:kind==='track'&&good.length?Math.round(good.reduce((a,l)=>a+l.ms,0)/good.length):null,gate:kind==='track'?gate:null,kind};
}
/** The route thinned for saving and drawing: keeps the shape to within a few metres with a fraction of the points. */
export function thinRoute(raw:Fix[],toleranceM=3,max=1500):{lat:number;lng:number}[]{
 const f=cleanFixes(raw);if(f.length<3)return f.map(p=>({lat:p.lat,lng:p.lng}));
 const o=f[0],pts=f.map(p=>flat(o,p)),keep=new Uint8Array(f.length);keep[0]=keep[f.length-1]=1;
 const stack:[number,number][]=[[0,f.length-1]];
 while(stack.length){const [a,b]=stack.pop()!;let far=0,at=-1;const dx=pts[b].x-pts[a].x,dy=pts[b].y-pts[a].y,len=Math.hypot(dx,dy);
  for(let i=a+1;i<b;i++){const d=len?Math.abs(dy*(pts[i].x-pts[a].x)-dx*(pts[i].y-pts[a].y))/len:Math.hypot(pts[i].x-pts[a].x,pts[i].y-pts[a].y);if(d>far){far=d;at=i;}}
  if(at>0&&far>toleranceM){keep[at]=1;stack.push([a,at],[at,b]);}}
 let out=f.filter((_,i)=>keep[i]).map(p=>({lat:Math.round(p.lat*1e6)/1e6,lng:Math.round(p.lng*1e6)/1e6}));
 if(out.length>max){const step=out.length/max;out=Array.from({length:max},(_,i)=>out[Math.min(out.length-1,Math.floor(i*step))]);}
 return out;
}
/** 1:42.3 */
export function lapText(ms:number|null|undefined):string{
 if(ms==null||!Number.isFinite(ms)||ms<0)return '--';
 const t=Math.round(ms/100)/10,m=Math.floor(t/60),s=t-m*60;return `${m}:${s<10?'0':''}${s.toFixed(1)}`;
}
export const miles=(m:number)=>m/1609.344,mph=(ms:number)=>ms*2.236936;
/** Riding time as engine hours, to the tenth. */
export const rideHours=(movingSeconds:number)=>Math.round(movingSeconds/360)/10;
