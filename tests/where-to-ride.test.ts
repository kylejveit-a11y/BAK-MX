import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readdirSync} from 'node:fs';
import {eventsAt,forecastLine,partialNote,toggleSaved,trailName,fmtDay,mapSeason,decodePolyline,areaForAsk,areaWidths,byDistance,directionsLink,filterPlaces,milesBetween,mvumWidth,onxLink,placeSummary,type PlaceRow,type RidingArea} from '../shared/where-to-ride.ts';
import {handleWhereToRide,placeWeather,toRow} from '../server/where-to-ride.ts';
import {checkinStatusesFor} from '../shared/track-checkins.ts';

const row=(o:Partial<PlaceRow>):PlaceRow=>({id:'x',name:'X',kind:'track',city:null,state:'FL',lat:null,lng:null,status:'open',access:'public',has_trails:false,trail_miles:null,widths:[],trail_map:false,...o});

test('summary line says what a place is in plain words',()=>{
 assert.equal(placeSummary(row({kind:'riding_area',trail_miles:125,widths:['single_track','atv']})),'Riding area · 125 mi of trail · Single-track, ATV');
 assert.equal(placeSummary(row({has_trails:true})),'Track with trails');
 assert.equal(placeSummary(row({kind:'riding_area',trail_miles:9.2})),'Riding area · 9.2 mi of trail');
});
test('widths: only confirmed ones show; unknown is left out, never guessed',()=>{
 assert.deepEqual(areaWidths({single_track:true,atv:null,full_width:false}),['single_track']);
 assert.deepEqual(areaWidths(null),[]);
});
test('search and filters',()=>{
 const rows=[row({id:'a',name:'Croom Motorcycle Area',kind:'riding_area',city:'Brooksville'}),row({id:'b',name:'Dade City MX',city:'Dade City'}),row({id:'c',name:'Houston Valley',kind:'riding_area',state:'GA'})];
 assert.deepEqual(filterPlaces(rows,{kind:'riding_area'}).map(r=>r.id),['a','c']);
 assert.deepEqual(filterPlaces(rows,{query:'brooks'}).map(r=>r.id),['a']);
 assert.deepEqual(filterPlaces(rows,{state:'GA'}).map(r=>r.id),['c']);
});
test('near me: nearest first, places with no location last',()=>{
 assert.ok(Math.abs(milesBetween({lat:28.0,lng:-82.0},{lat:29.0,lng:-82.0})-69)<1);
 const rows=[row({id:'far',lat:34,lng:-84}),row({id:'none'}),row({id:'near',lat:28.4,lng:-82.2})];
 assert.deepEqual(byDistance(rows,{lat:28.3,lng:-82.2}).map(r=>r.id),['near','far','none']);
 assert.deepEqual(byDistance(rows,null).map(r=>r.id),['far','none','near']);
});
test('links: onX is a plain public link; directions go to the trailhead when known',()=>{
 assert.equal(onxLink('GA'),'https://www.onxmaps.com/offroad/trails/us/georgia');
 assert.equal(onxLink('ZZ'),'https://www.onxmaps.com/offroad');
 const area={trailheads:[{name:'TH',lat:29.4,lng:-81.8}]} as unknown as RidingArea;
 assert.equal(directionsLink({name:'Ocala',city:null,state:'FL',lat:1,lng:2,area},'ios'),'https://maps.apple.com/?daddr=29.4,-81.8');
 assert.match(directionsLink({name:'Kentuck',city:null,state:'AL',lat:null,lng:null},'android'),/destination=Kentuck%2C%20AL$/);
});
test('MVUM width: the map legend decides; special trails fall back to the motorcycle and ATV columns',()=>{
 assert.equal(mvumWidth('Trails open to motorcycles, Seasonal'),'single_track');
 assert.equal(mvumWidth('Trails open to vehicles 50" or less in width, Yearlong'),'atv');
 assert.equal(mvumWidth('Wheeled OHV <50", Seasonal'),'atv');
 assert.equal(mvumWidth('Trails open to all vehicles, Yearlong'),'full_width');
 assert.equal(mvumWidth('Special Designation, Seasonal',{MOTORCYCLE:'open',ATV:'open'}),'atv');
 assert.equal(mvumWidth('Special Designation, Seasonal',{MOTORCYCLE:'open'}),'single_track');
 assert.equal(mvumWidth('Special Designation, Yearlong',{MOTORCYCLE:'',ATV:''}),'unknown');
});
test('Ask BAK gets confirmed facts only',()=>{
 const a=areaForAsk({vehicles:{single_track:true,atv:true,full_width:false},width_limit_in:50,trail_miles:25,season:null,hours:null,rules:[],closures:null,verified:'2026-11-17'} as unknown as RidingArea)!;
 assert.deepEqual(a,{vehicles:['Single-track','ATV trail'],width_limit_in:50,trail_miles:25,checked_on:'2026-11-17'});
 assert.equal(areaForAsk(null),null);
});
test('research file: every record has sources, a checked date and no guessed widths',()=>{
 const D='docs/research/riding-areas/';
 const recs=readdirSync(D).filter(f=>f.endsWith('.json')&&!['trail-lines.json','new-places.json'].includes(f)).flatMap(f=>JSON.parse(readFileSync(D+f,'utf8')) as (RidingArea&{id:string})[]);
 assert.ok(recs.length>=25);assert.equal(new Set(recs.map(r=>r.id)).size,recs.length,'one record per place');
 for(const r of recs){assert.ok(r.sources.length>0,r.id);assert.match(r.verified??'',/^\d{4}-\d{2}-\d{2}$/,r.id);
  for(const v of Object.values(r.vehicles))assert.ok(v===true||v===false||v===null,r.id);
  for(const s of r.sources)assert.match(s.url,/^https:\/\//,r.id);
  assert.ok(!('center' in r),'center is worked out by the loader, never typed in: '+r.id);}
 const places=JSON.parse(readFileSync(D+'new-places.json','utf8')) as {id:string}[];
 for(const p of places)assert.ok(recs.some(r=>r.id===p.id),'new place has a record: '+p.id);
});
test('rows: riding areas always have trails; a track with woods trails says so',()=>{
 const counts=new Map([['ocala',3]]);
 const a=toRow({id:'ocala',name:'Ocala',kind:'riding_area',state:'FL',types:['offroad'],area:{vehicles:{single_track:true,atv:true,full_width:null},trail_miles:125}},counts);
 assert.equal(a.has_trails,true);assert.equal(a.trail_map,true);assert.deepEqual(a.widths,['single_track','atv']);assert.equal(a.trail_miles,125);
 const t=toRow({id:'t',name:'T',kind:'track',state:'FL',types:['motocross','offroad']},counts);
 assert.equal(t.kind,'track');assert.equal(t.has_trails,true);assert.equal(t.trail_map,false);
});

/** A tiny stand-in for the rider's database client: records filters and returns canned rows. */
function fakeDb(tables:Record<string,Record<string,unknown>[]>){
 const seen:string[]=[];
 const from=(t:string)=>{let rows=[...(tables[t]??[])];const b={
  select(){return b;},order(){return b;},limit(){return b;},
  eq(k:string,v:unknown){seen.push(`${t}.${k}=${String(v)}`);rows=rows.filter(r=>r[k]===undefined||r[k]===v);return b;},
  in(k:string,v:unknown[]){rows=rows.filter(r=>v.includes(r[k]));return b;},
  maybeSingle(){return Promise.resolve({data:rows[0]??null,error:null});},
  then(res:(v:unknown)=>unknown){return Promise.resolve({data:rows,error:null}).then(res);}};return b;};
 return {db:{from} as never,seen};
}
test('API: list and page read only listed, approved places; unknown id is a 404; non-GET passes through',async()=>{
 const {db,seen}=fakeDb({tracks:[{id:'ocala',name:'Ocala',kind:'riding_area',state:'FL',types:['offroad'],area:null,listed:true,review_status:'APPROVED'}],trail_lines:[{track_id:'ocala',map_date:'2025-01-01'}]});
 const list=await handleWhereToRide(new URL('https://x/api/where-to-ride'),'/api/where-to-ride','GET',db);
 const body=await list!.json() as PlaceRow[];assert.equal(body[0].id,'ocala');assert.equal(body[0].trail_map,true);
 assert.ok(seen.includes('tracks.listed=true'));assert.ok(seen.includes('tracks.review_status=APPROVED'));
 const page=await handleWhereToRide(new URL('https://x/api/riding-area?id=ocala'),'/api/riding-area','GET',db);
 const p=await page!.json() as {map_date:string;trail_lines:number};assert.equal(p.trail_lines,1);assert.equal(p.map_date,'2025-01-01');
 const {db:empty}=fakeDb({tracks:[],trail_lines:[]});
 await assert.rejects(handleWhereToRide(new URL('https://x/api/riding-area?id=nope'),'/api/riding-area','GET',empty),/Place not found/);
 assert.equal(await handleWhereToRide(new URL('https://x/api/where-to-ride'),'/api/where-to-ride','POST',db),null);
});

test('trail lines decode from the stored polyline to [lng, lat]',()=>{
 // Google's documented example: (38.5,-120.2), (40.7,-120.95), (43.252,-126.453)
 assert.deepEqual(decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@'),[[-120.2,38.5],[-120.95,40.7],[-126.453,43.252]]);
 const lines=JSON.parse(readFileSync('docs/research/riding-areas/trail-lines.json','utf8')) as {line:string;track_id:string}[];
 for(const l of lines){const pts=decodePolyline(l.line);assert.ok(pts.length>=2,l.track_id);for(const [x,y] of pts){assert.ok(x<-75&&x>-90&&y>24&&y<39,l.track_id);}}
});
test('dates read like a person wrote them',()=>{assert.equal(fmtDay('2026-11-15'),'Nov 15, 2026');assert.equal(mapSeason('Yearlong'),'Yearlong on the map');assert.equal(mapSeason('04/01-12/31'),'Map season 04/01–12/31');});

test('no entrance on file: the middle of the trail map is used for distance, never for directions',()=>{
 const r=toRow({id:'w',name:'Wambaw',kind:'riding_area',state:'SC',lat:null,lng:null,types:['offroad'],area:{vehicles:{single_track:true,atv:true,full_width:false},center:{lat:33.1335,lng:-79.6298}}},new Map());
 assert.equal(r.approx,true);assert.equal(r.lat,33.134);
 assert.match(directionsLink({...r,area:null},'ios'),/daddr=Wambaw%2C%20SC$/);
 const fixed=toRow({id:'b',name:'B',kind:'riding_area',state:'NC',lat:35.9,lng:-81.7,area:{vehicles:null,center:{lat:1,lng:1}}},new Map());
 assert.equal(fixed.approx,undefined);assert.equal(fixed.lat,35.9);
});
test('trail names: the map name, else its number; never blank',()=>{
 assert.equal(trailName({name:'Kirby\'s Loop',number:'TRBM4'}),'Kirby\'s Loop');
 assert.equal(trailName({name:'',number:'450D'}),'Trail 450D');
 assert.equal(trailName({name:' ',number:''}),'Unnamed trail');
 assert.equal(trailName({name:'15R',number:'0615R'}),'Trail 15R');assert.equal(trailName({name:'13th',number:'0613TH'}),'Trail 13th');assert.equal(trailName({name:'BM 1A',number:'TRBM1A'}),'BM 1A');
 const lines=JSON.parse(readFileSync('docs/research/riding-areas/trail-lines.json','utf8')) as {name:string}[];
 assert.ok(!lines.some(l=>/[A-Z]'S\b|\bBm\b|\b\d+Th\b/.test(l.name)),'names read properly (Kirby\'s, BM 1A, 13th)');
});
test('partial maps say so instead of looking complete',()=>{
 assert.equal(partialNote([{number:'1',miles:30}],34),null);
 assert.match(partialNote([{number:'1',miles:25}],100)!,/about 25 of the 100 miles/);
 assert.equal(partialNote([{number:'1',miles:25}],null),null);
});
test('saved places: toggle, newest first, no repeats',()=>{
 assert.deepEqual(toggleSaved([],'a'),['a']);assert.deepEqual(toggleSaved(['a'],'b'),['b','a']);assert.deepEqual(toggleSaved(['b','a'],'a'),['b']);
});
test('riding-area check-ins leave out watering and fresh prep',()=>{
 const ids=checkinStatusesFor('riding_area').map(s=>s.id);
 assert.ok(!ids.includes('watering')&&!ids.includes('fresh_prep')&&ids.includes('muddy')&&ids.includes('closed'));
 assert.equal(checkinStatusesFor('track').length,9);
});
test('events here: matched by place name, canceled ones left out, a town alone matches nothing',()=>{
 const all=[{id:'ocala',name:'Ocala National Forest OHV Trail System',aliases:['Ocala North'],city:'Fort McCoy'},{id:'croom',name:'Croom Motorcycle Area',aliases:[],city:'Brooksville'}];
 const ev=[{id:'1',title:'Saturday trail ride',location_name:'Croom Motorcycle Area',canceled_at:null},{id:'2',title:'Ride',location_name:'Croom',canceled_at:'2026-01-01'},{id:'3',title:'Meetup',location_name:'Brooksville',canceled_at:null},{id:'4',title:'Trail day',location_name:'Croom Motorcycle Area, Hwy 50 trailhead',canceled_at:null}];
 assert.deepEqual(eventsAt(ev,all[1],all).map(e=>e.id),['1','4']);
 assert.deepEqual(eventsAt(ev,all[0],all),[]);
});
test('weather: today and tomorrow, plain reasons when the service has nothing',async()=>{
 const {db}=fakeDb({tracks:[{id:'w',name:'W',kind:'riding_area',state:'SC',lat:null,lng:null,types:[],area:{vehicles:null,center:{lat:33.1,lng:-79.6}},listed:true,review_status:'APPROVED'}],trail_lines:[]});
 const calls:string[]=[];
 const w=await placeWeather(db,'w','2026-11-17',async(lat,lng,date)=>{calls.push(`${lat},${lng},${date}`);return date==='2026-11-17'?{available:true,source:'US National Weather Service forecast',issued:'',date,day:'Sunny',night:'Clear',high_f:70,low_f:45,rain_chance_pct:null,wind:'N 5 mph',rain_days_before:[]}:{available:false,reason:'The forecast does not reach the race date yet.'};});
 assert.deepEqual(calls,['33.1,-79.6,2026-11-17','33.1,-79.6,2026-11-18']);
 assert.equal(forecastLine(w.today),'Sunny · 70° / 45° · wind N 5 mph');
 assert.equal(forecastLine(w.tomorrow),'The forecast does not reach that day yet.');
});
