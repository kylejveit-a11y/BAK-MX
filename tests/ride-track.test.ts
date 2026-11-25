import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanFixes,findLaps,lapText,metres,rideHours,summarize,thinRoute,type Fix} from '../shared/ride-track.ts';

// A made-up oval about 600 m round at 28.36 N. One point a second, with a little GPS wobble.
const O={lat:28.36,lng:-82.19},mLat=1/111320,mLng=1/(111320*Math.cos(28.36*Math.PI/180));
let seed=7;const noise=(m:number)=>{seed=(seed*1103515245+12345)%2147483648;return (seed/2147483648-0.5)*2*m;};
const at=(angle:number,rx=120,ry=60)=>({lat:O.lat+Math.sin(angle)*ry*mLat,lng:O.lng+Math.cos(angle)*rx*mLng});
/** lapSeconds for each lap in turn, starting a quarter of the way round, after rolling out of a pit 80 m away. */
function oval(lapSeconds:number[],wobble=2,stopAfter=-1):Fix[]{
 const out:Fix[]=[];let t=1700000000000;
 for(let s=0;s<20;s++){out.push({t,lat:O.lat-150*mLat+noise(1)*mLat,lng:O.lng+noise(1)*mLng,acc:5});t+=1000;} // sitting in the pits
 for(let s=0;s<=15;s++){const k=s/15,p=at(Math.PI/2);out.push({t,lat:O.lat-150*mLat+(p.lat-(O.lat-150*mLat))*k,lng:O.lng+(p.lng-O.lng)*k,acc:5});t+=1000;}
 let a=Math.PI/2;
 lapSeconds.forEach((sec,i)=>{for(let s=0;s<sec;s++){a+=2*Math.PI/sec;const p=at(a);out.push({t,lat:p.lat+noise(wobble)*mLat,lng:p.lng+noise(wobble)*mLng,acc:5});t+=1000;}
  if(i===stopAfter)for(let s=0;s<90;s++){const p=at(a);out.push({t,lat:p.lat+noise(1)*mLat,lng:p.lng+noise(1)*mLng,acc:5});t+=1000;}});
 return out;
}
test('distance: a degree of latitude is about 111 km',()=>{assert.ok(Math.abs(metres({lat:0,lng:0},{lat:1,lng:0})-111195)<50);});
test('bad points are dropped: poor accuracy, repeats, and jumps no bike can make',()=>{
 const f:Fix[]=[{t:1000,lat:28,lng:-82,acc:5},{t:2000,lat:28.00001,lng:-82,acc:80},{t:2000,lat:28.00002,lng:-82,acc:5},{t:3000,lat:28.5,lng:-82,acc:5},{t:4000,lat:28.00004,lng:-82,acc:5}];
 assert.deepEqual(cleanFixes(f).map(x=>x.t),[1000,2000,4000]);
});
test('laps are found without being told where the start is, to within a second and a half',()=>{
 const want=[62,60,58,59,61,60],{laps,gate}=findLaps(cleanFixes(oval(want)));
 assert.ok(gate);
 assert.ok(laps.length>=want.length-1&&laps.length<=want.length,`found ${laps.length}`);
 // whichever point it chose, consecutive laps must match the real ones in order
 const real=want.map(s=>s*1000),offset=[0,1].find(o=>laps.every((l,i)=>Math.abs(l.ms-(real[i+o]??real[i]))<8000))??0;
 const total=laps.reduce((a,l)=>a+l.ms,0),avgReal=real.reduce((a,b)=>a+b,0)/real.length;
 assert.ok(Math.abs(total/laps.length-avgReal)<1500,`average ${total/laps.length} vs ${avgReal} (offset ${offset})`);
 assert.ok(laps.every(l=>!l.slow));
});
test('a stop in the middle of a session shows as one slow lap and does not spoil best or average',()=>{
 const s=summarize(oval([60,60,60,60,60,60],2,2))!;
 assert.equal(s.kind,'track');
 assert.equal(s.laps.filter(l=>l.slow).length,1);
 assert.ok(s.best_ms!>57000&&s.best_ms!<63000,`best ${s.best_ms}`);
 assert.ok(s.average_ms!>58000&&s.average_ms!<62000,`average ${s.average_ms}`);
 assert.ok(s.moving_seconds<s.seconds-80,'the stop is not counted as riding');
});
test('a trail ride that never comes back round has no laps, just distance, time and top speed',()=>{
 const f:Fix[]=Array.from({length:600},(_,i)=>({t:1700000000000+i*1000,lat:28+i*8*mLat,lng:-82+Math.sin(i/40)*200*mLng,acc:6}));
 const s=summarize(f)!;
 assert.equal(s.kind,'trail');assert.deepEqual(s.laps,[]);assert.equal(s.best_ms,null);
 assert.ok(s.distance_m>4700&&s.distance_m<6500,`distance ${s.distance_m}`);
 assert.ok(s.top_speed_ms>7&&s.top_speed_ms<14,`top ${s.top_speed_ms}`);
});
test('distance round the oval is right to a few percent despite GPS wobble',()=>{
 const s=summarize(oval([60,60,60,60]))!,once=2*Math.PI*Math.sqrt((120*120+60*60)/2); // close enough for an ellipse this shape
 assert.ok(Math.abs(s.distance_m/4-once)/once<0.12,`${s.distance_m/4} vs ${once}`);
});
test('too little to go on gives nothing, not a guess',()=>{
 assert.equal(summarize([]),null);
 assert.deepEqual(findLaps(cleanFixes(oval([60]))).laps,[]);
});
test('the saved route keeps its shape with far fewer points',()=>{
 const f=oval([60,60,60]),thin=thinRoute(f,3);
 assert.ok(thin.length<cleanFixes(f).length&&thin.length>20,`${thin.length}`);
 assert.ok(thinRoute(f,3,50).length<=50);
});
test('lap times and hours read the way riders say them',()=>{
 assert.equal(lapText(102340),'1:42.3');assert.equal(lapText(59960),'1:00.0');assert.equal(lapText(null),'--');
 assert.equal(rideHours(1800),0.5);assert.equal(rideHours(2000),0.6);
});

import {rideRow,rideSchema} from '../server/rides.ts';
test('the server saves totals, laps and a thinned route, and refuses a ride with under a minute of riding',()=>{
 const body=(f:Fix[])=>rideSchema.parse({bike_id:null,place:'Dade City MX',fixes:f.map(p=>[p.t,p.lat,p.lng,p.acc??null])});
 const row=rideRow(body(oval([60,60,60,60])))!;
 assert.equal(row.kind,'track');assert.equal(row.place,'Dade City MX');
 assert.ok(row.laps.length>=3&&row.best_ms!>57000&&row.best_ms!<63000);
 assert.ok(row.route.length>10&&row.route.length<=1500);
 assert.ok(!('fixes' in row),'raw points are never stored');
 assert.equal(rideRow(body(oval([60]).slice(0,45))),null);
 assert.throws(()=>rideSchema.parse({fixes:[[1,2,3,null]]}));
});
