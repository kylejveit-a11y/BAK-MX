import test from 'node:test';
import assert from 'node:assert/strict';
import {chainChange,chainPitch,gearingChangeFromText,airDensity,airChange,pistonDrop,portTiming,blowdownDeg,tunedPipeLength,exhaustWaveSpeed,pipeRpmShiftPct,trappedCompression,meanPistonSpeed,ENGINE_CALCULATORS} from '../shared/engine-physics.ts';
import {engineContext,isFourStroke,airFromText} from '../shared/engine-physics-context.ts';

test('chain: a rear tooth brings the axle forward a quarter pitch, two links let it back one pitch',()=>{
 const up=chainChange(15.875,13,50,13,52);
 assert.equal(up.final_drive_change_pct,4);assert.equal(up.axle_moves_mm,-7.9);assert.match(up.feel,/Shorter gearing/);
 const links=chainChange(15.875,13,50,13,50,2);assert.equal(links.axle_moves_mm,15.9);assert.equal(links.final_drive_change_pct,0);
 assert.equal(chainChange(12.7,14,47,13,47).axle_moves_mm,3.2,'one tooth less up front lets the axle go back');
 assert.throws(()=>chainChange(15.875,13,50,13,50,1),/two links/);
 assert.equal(chainPitch('428'),12.7);assert.equal(chainPitch(520),15.875);assert.throws(()=>chainPitch(630));
});
test('reads gearing changes the way riders write them',()=>{
 assert.deepEqual(gearingChangeFromText('going 13/50 to 13/52'),{front:13,rear:52});
 assert.deepEqual(gearingChangeFromText('what if I go up two teeth on the rear',13,50),{front:13,rear:52});
 assert.deepEqual(gearingChangeFromText('drop one tooth on the front',13,50),{front:12,rear:50});
 assert.deepEqual(gearingChangeFromText('rear down one',13,50),{front:13,rear:49});
 assert.equal(gearingChangeFromText('front pushes in flat corners',13,50),null);
});
test('air: standard day is 100%, a hot mountain day is much thinner and a carb goes rich',()=>{
 const std=airDensity(0,59,0);assert.equal(std.air_density_pct,100);assert.equal(std.density_altitude_ft,0);
 const hot=airDensity(5000,90,30);assert.ok(hot.density_altitude_ft>7900&&hot.density_altitude_ft<8600,String(hot.density_altitude_ft));
 assert.ok(hot.power_pct<80);assert.match(hot.carb_mixture,/richer/);assert.match(hot.carb_mixture,/leaner/);
 assert.equal(airDensity(0,59).humidity_assumed,true);
 const trip=airChange({elevationFt:800,tempF:60},{elevationFt:6000,tempF:85});assert.ok(trip.power_change_pct<-20);assert.match(trip.direction,/lean it a step/);
 assert.match(airChange({elevationFt:5000,tempF:90},{elevationFt:0,tempF:50}).direction,/richen/);
 assert.throws(()=>airDensity(30000,60));
});
test('two-stroke ports, blowdown, pipe and compression',()=>{
 assert.equal(Math.round(pistonDrop(54.5,110,180)*10)/10,54.5);assert.equal(pistonDrop(54.5,110,0),0);
 const ex=portTiming(54.5,110,26.5),tr=portTiming(54.5,110,38.5);
 assert.ok(ex.duration_deg>190&&ex.duration_deg<205,String(ex.duration_deg));assert.ok(tr.duration_deg<ex.duration_deg);
 assert.equal(blowdownDeg(ex.duration_deg,tr.duration_deg),26);
 assert.throws(()=>portTiming(54.5,110,60));assert.throws(()=>blowdownDeg(130,190));
 const pipe=tunedPipeLength(190,11500,500);assert.equal(pipe.length_mm,688);
 assert.ok(exhaustWaveSpeed(500)>540&&exhaustWaveSpeed(500)<550);assert.ok(pipeRpmShiftPct(500,400)<0);
 assert.deepEqual(trappedCompression(54,26.5,9),{trapped_cc:60.69,ratio:7.74});
 assert.deepEqual(meanPistonSpeed(63.4,13000),{m_s:27.5,ft_min:5408});
});
test('every workshop calculator runs on sensible inputs and rejects nonsense',()=>{
 const v={pitch:520,oldFront:13,oldRear:50,front:13,rear:51,links:NaN,elevation:5000,temp:85,humidity:NaN,stroke:54.5,rod:110,exhaust:26.5,transfer:38.5,deck:NaN,duration:190,rpm:11500,gas:NaN,bore:54,clearance:9,exhaustTop:NaN};
 for(const c of ENGINE_CALCULATORS){const out=c.run(v);assert.ok(out.length>40,c.key);assert.doesNotMatch(out,/NaN|undefined/,c.key);}
 assert.throws(()=>ENGINE_CALCULATORS.find(c=>c.key==='chain')!.run({...v,pitch:630}));
});
test('Ask BAK context: gearing from the Garage, air from the track and forecast, ports from the rider',()=>{
 const env={model:'250 SX-F',configuration:{front_sprocket:'13',rear_sprocket:'49'},statements:['Fuel system: EFI, 44 mm throttle body','Bore x stroke: 78 x 52.3 mm'],track:{name:'Glen Helen',elevationFt:1600},forecastHighF:88,raceMode:false};
 const g=engineContext('should I go up two teeth on the rear?',env) as {drivetrain:{proposed:{gearing:string};chain_size_source:string}};
 assert.equal(g.drivetrain.proposed.gearing,'13/51');assert.match(g.drivetrain.chain_size_source,/usual size/);
 const a=engineContext('bike feels flat on the bottom, jetting or map?',env) as {air:{fuel_system:string;temperature_source:string;days:unknown[]}};
 assert.equal(a.air.fuel_system,'fuel injection');assert.equal(a.air.temperature_source,'race-day forecast high');assert.equal(a.air.days.length,1);
 assert.equal(engineContext('front pushes in flat corners',env),null,'handling words alone stay out of engine math');
 assert.equal(engineContext('lean the bike more in ruts',env),null,'riding lean is not jetting');
 const p=engineContext('exhaust port is at 26.5 mm, stroke 54.5 mm, rod 110 mm, pipe works at 11,500 rpm',{...env,model:'125 SX',statements:[]}) as {engine:{engine_type:string;exhaust_port:unknown;pipe:unknown}};
 assert.equal(p.engine.engine_type,'two-stroke');assert.ok(p.engine.exhaust_port);assert.ok(p.engine.pipe);
 assert.deepEqual(airFromText("we're at 6,000 ft and it's 95 degrees, 80% humidity"),{elevationFt:6000,tempF:95,humidity:80});
 assert.deepEqual(['YZ250F','YZ250','KX250','KX112','CRF150R','TF 250-X','MC 125','RM-Z450'].map(isFourStroke),[true,false,true,false,true,true,false,true]);
});
test('published jetting: picks the maker\'s chart cell for the elevation and air, per chart',async()=>{
 const {jettingCells,jettingFor,engineContext}=await import('../shared/engine-physics-context.ts');
 const rows=[
  {id:'a',statement:'Carburetor tuning (standard mode) / 301 to 750 m (987 to 2,460 ft) / 16 to 24 °C (60.8 to 75.2 °F): idle air screw 2 turns open; idling jet 55; jet needle NRK C; needle clip position 3 from top; main jet 140. Applies to the US standard model named.'},
  {id:'b',statement:'Carburetor tuning (standard mode) / 301 to 750 m (987 to 2,460 ft) / 25 to 36 °C (77 to 96.8 °F): idle air screw 2 turns open; idling jet 55; jet needle NRJ C; needle clip position 3 from top; main jet 140. Applies.'},
  {id:'c',statement:'Carburetor tuning (lean) / 301 to 750 m (987 to 2,460 ft) / 16 to 24 °C (60.8 to 75.2 °F): idle air screw 2 turns open; idling jet 55; jet needle NRJ C; needle clip position 3 from top; main jet 140. Applies.'},
  {id:'d',statement:'Carburetor tuning / 0 to 300 m (0 to 984 ft) / 16 to 24 °C (61 to 75 °F): idle air screw 1.5 turns open; idling jet 30; jet needle 43-71; needle clip position 2 from top; main jet 480. Applies.'}];
 const cells=jettingCells(rows);assert.equal(cells.length,4);
 const r=jettingFor(cells.filter(c=>c.chart!=='standard'),1500,76.5);
 assert.deepEqual(r.map(x=>[x.chart,x.evidence_id]),[['standard mode','b'],['lean','c']],'76.5 °F sits between the bands: nearer one');
 assert.match(r[0].settings,/main jet 140/);
 assert.match(jettingFor(cells.filter(c=>c.chart==='standard'),5000,70)[0].note??'',/stops at 984 ft/);
 const env={model:'85 SX 19/16',configuration:{},statements:[],track:{name:'Home',elevationFt:1600},forecastHighF:70,raceMode:false,jetting:rows.slice(0,3)};
 const a=engineContext('how should I jet it for this weekend?',env) as {air:{published_jetting:{evidence_id:string}[];fuel_system:string}};
 assert.equal(a.air.fuel_system,'carburetor');assert.deepEqual(a.air.published_jetting.map(x=>x.evidence_id),['a','c']);
});
