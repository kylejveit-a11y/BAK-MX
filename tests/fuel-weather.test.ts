import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fuelWeather,fuelWeatherTopics,rideAir,FUEL_WEATHER_VERSION,FUEL_WEATHER_MAX_CHARS,FUEL_WEATHER_SOURCES,chartUse,circuits,conditionRules,airRules,plugRules,symptomRules,premixRules,efiRules,makerTools,octaneRules,makerMinimums,raceFuelRules,ethanolRules,seasonRules} from '../shared/fuel-weather.ts';

const YZ250={manufacturer:'Yamaha',model:'YZ250',model_year:2024};
const CRF450={manufacturer:'Honda',model:'CRF450R',model_year:2025};
const KX450={manufacturer:'Kawasaki',model:'KX450',model_year:2025};
const KTM85={manufacturer:'KTM',model:'85 SX',model_year:2024};

const ON_TOPIC=[
 'my yz250 bogs off the bottom, what jetting change?','what main jet for 6,000 ft and 85 degrees','should I move the needle clip up for summer?',
 'how do I read my spark plug','plug is black and sooty','what octane should I run','is E10 ok in my bike','how long can I store gas?',
 'is race fuel worth it, VP or Sunoco oxygenated','what premix ratio for my 125','32:1 or 40:1?','which map should I run in sand?',
 'how do I use the power tuner app','what do the suzuki couplers do','it pings on the big uphill','runs lean after my new exhaust, popping on decel',
 'does humidity affect how my bike runs','how does altitude change my jetting','density altitude today','bike feels flat on a hot humid day, is it the jetting',
 'traction control map for slick conditions','hangs at idle after the pipe',
];
const OFF_TOPIC=[
 'set my sag for 180 lb','rear kicks on braking bumps','change the oil on my YZ250F','what tire pressure for sand','torque for the rear axle nut',
 'change the drain plug','gear ratio for supercross','what is the weather saturday','track map for Dade City','how do I do a gate start','bar bend for a tall rider',
 '',
];

test('fuel, jetting, map, plug and weather-running questions get a section; others get null',()=>{
 for(const q of ON_TOPIC){const r=fuelWeather(q);assert.ok(r,`expected a section for: ${q}`);assert.equal(r.version,FUEL_WEATHER_VERSION);assert.ok(r.topics.length>=1,q);}
 for(const q of OFF_TOPIC)assert.equal(fuelWeather(q),null,`expected null for: ${q}`);
 assert.deepEqual([...fuelWeatherTopics('what is the weather saturday')],[]);
 assert.ok(fuelWeatherTopics('does elevation change how my bike runs').has('air'));
});

test('the bike\'s fuel system picks carb or EFI knowledge, never both wrongly',()=>{
 const carb:any=fuelWeather('it bogs and blubbers off the bottom',[],YZ250);
 assert.equal(carb.fuel_system.value,'carbureted');assert.ok(carb.carb_circuits&&carb.rich_lean_signs);assert.equal(carb.maker_tools,undefined);assert.equal(carb.fuel_injection,undefined);
 const efi:any=fuelWeather('it bogs off the bottom, which map?',[],CRF450);
 assert.equal(efi.fuel_system.value,'fuel injected');assert.equal(efi.carb_circuits,undefined);assert.equal(efi.jetting_charts,undefined);
 assert.deepEqual(Object.keys(efi.maker_tools),['Honda'],'only the rider\'s maker');
 assert.ok(efi.maker_tools.Honda.some((s:string)=>/HRC/.test(s)));
 const kx:any=fuelWeather('how do I change maps',[],KX450);assert.ok(kx.maker_tools.Kawasaki.some((s:string)=>/Rideology/.test(s)));
 const stated:any=fuelWeather('rich or lean?',[],{...CRF450,fuel_system:'carburetor'});assert.equal(stated.fuel_system.source,'the bike on file');
 const unknown:any=fuelWeather('what jetting for the mountains');assert.ok(unknown.carb_circuits);assert.ok(unknown.ask||unknown.fuel_system.value==='carbureted');
 const anyMap:any=fuelWeather('which map for hard pack?');assert.equal(Object.keys(anyMap.maker_tools).length,makerTools.length,'no bike and no maker named: every maker, briefly');
});

test('the right parts are selected for the question',()=>{
 const air:any=fuelWeather('what main jet for 6,000 ft and 85 degrees',[],KTM85);
 assert.ok(air.air_from_message&&air.air_from_message.density_altitude_ft>8500&&air.air_from_message.density_altitude_ft<10000,JSON.stringify(air.air_from_message));
 assert.ok(air.jetting_charts&&air.conditions&&air.air_and_weather);
 const oct:any=fuelWeather('what octane should I run');assert.ok(oct.octane.maker_minimums.length>=3);assert.equal(oct.race_fuel,undefined);
 const race:any=fuelWeather('is oxygenated race fuel worth it');assert.ok(race.race_fuel&&race.octane);
 const e10:any=fuelWeather('is E10 ok and how long can I store gas?');assert.ok(e10.ethanol_and_storage);assert.equal(e10.premix,undefined);
 const mix:any=fuelWeather('what premix ratio for my 125',[],{manufacturer:'Yamaha',model:'YZ125',model_year:2023});assert.ok(mix.premix);
 assert.equal((fuelWeather('what oil ratio',[],CRF450) as any)?.premix,undefined,'no premix for a four-stroke');
 const plug:any=fuelWeather('how do I read my spark plug',[],YZ250);assert.ok(plug.plug_reading.some((s:string)=>/tan/.test(s)));
 const season:any=fuelWeather('how should I jet for Florida summer versus winter?',[],YZ250);assert.ok(season.air_and_weather.example_days.length===3);
});

test('short follow-ups inherit the topic; a move to another system does not',()=>{
 const f=fuelWeather('what about one size smaller?',['my yz250 bogs off the bottom'],YZ250);assert.ok(f?.from_history);assert.ok(f?.topics.includes('jetting')||f?.topics.includes('symptoms'));
 assert.equal(fuelWeather('and the rebound?',['which jet for 5,000 ft']),null);
 assert.equal(fuelWeather('thanks',[]),null);
});

test('density math: standard atmosphere checks and known values',()=>{
 const sea=rideAir(0,59,0);assert.equal(sea.density_altitude_ft,0);assert.equal(sea.air_density_pct,100);
 // ISA at 5,000 ft is 41.2 °F: dry air there is 86.2% of sea-level density and the density altitude is the elevation itself.
 const isa=rideAir(5000,41.17,0);assert.ok(Math.abs(isa.density_altitude_ft-5000)<=50,String(isa.density_altitude_ft));assert.equal(isa.air_density_pct,86.2);
 // Hot and humid at sea level rides higher than dry; humid air holds less oxygen.
 const fl=rideAir(100,92,75),dry=rideAir(100,92,0);assert.ok(fl.density_altitude_ft>dry.density_altitude_ft);assert.ok(fl.oxygen_pct<dry.oxygen_pct);
 assert.ok(fl.density_altitude_ft>2000&&fl.density_altitude_ft<3500,String(fl.density_altitude_ft));
 assert.throws(()=>rideAir(30000,60));
});

test('the section stays inside its size budget (about 2.5k tokens)',()=>{
 const everything='everything: jetting, needle clip, main jet, maps, power tuner, couplers, plug chop, octane, race fuel oxygenated VP, e10 storage, premix 32:1 ratio, bogging lean pinging rich blubbering, humidity altitude summer winter in Florida at 6,000 ft and 95 degrees 80% humidity';
 for(const q of [...ON_TOPIC,everything])for(const b of [undefined,YZ250,CRF450,KTM85]){
  const r=fuelWeather(q,[],b);if(!r)continue;const n=JSON.stringify(r).length;
  assert.ok(n<=FUEL_WEATHER_MAX_CHARS,`${n} chars for: ${q}`);assert.ok(n/4<=2500,`about ${Math.round(n/4)} tokens for: ${q}`);
 }
 const all:any=fuelWeather(everything,[],YZ250);assert.ok(all.rich_lean_signs&&all.carb_circuits,'the highest-priority parts survive the budget');
});

const ALL_FACTS=[chartUse,circuits,conditionRules,airRules,plugRules,symptomRules,premixRules,efiRules,...makerTools.map(m=>m.tools),octaneRules,makerMinimums,raceFuelRules,ethanolRules,seasonRules].flat();

test('nothing rider-facing names a magazine, tester, retailer or internal file, and no src leaks',()=>{
 const BANNED=/Keefer|Motocross Action|\bMXA\b|Vital ?MX|Dirt Bike (Magazine|Test)|Cycle News|MX ?Vice|Transmoto|Racer ?X|Bones Bacon|ThumperTalk|manualslib|manualsdir|enduro\.team|cyclechaos|bike-parts|ktmshop|\.json|docs\/|\bsrc\b/i;
 for(const f of ALL_FACTS)assert.doesNotMatch(f.t,BANNED,f.t);
 const everything='jetting maps plug octane race fuel e10 storage premix ratio bog pinging humidity altitude power tuner rideology couplers mx tune hrc';
 for(const b of [undefined,YZ250,CRF450,KX450,KTM85]){const r=fuelWeather(everything,[],b);assert.doesNotMatch(JSON.stringify(r),BANNED);}
});

test('every fact is sourced, every source is listed in SOURCES.md, and no number is left unsourced',()=>{
 const md=readFileSync(new URL('../docs/research/fuel-weather/SOURCES.md',import.meta.url),'utf8');
 const ids=new Set(FUEL_WEATHER_SOURCES.map(s=>s.id));
 assert.equal(ids.size,FUEL_WEATHER_SOURCES.length,'unique source ids');
 for(const s of FUEL_WEATHER_SOURCES){assert.ok(md.includes('`'+s.id+'`'),`SOURCES.md lists ${s.id}`);assert.ok(md.includes(s.url),`SOURCES.md has the URL for ${s.id}`);assert.match(s.accessed,/^\d{4}-\d{2}-\d{2}$/);}
 for(const f of ALL_FACTS){assert.ok(f.src.length>=1,f.t);for(const id of f.src)assert.ok(ids.has(id),`${id} in FUEL_WEATHER_SOURCES`);}
 const used=new Set(ALL_FACTS.flatMap(f=>f.src));for(const s of FUEL_WEATHER_SOURCES)assert.ok(used.has(s.id),`${s.id} is used by a fact`);
});
