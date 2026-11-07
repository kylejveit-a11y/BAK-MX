import test from 'node:test';
import assert from 'node:assert/strict';
import {aggregateRiderWear,classifyService,WEAR_ABOUT,type WearEvent} from '../shared/rider-wear.ts';
import {platformYears} from '../server/rider-wear.ts';
import {buildEngineeringInput} from '../server/engineering.ts';

test('service entries are classified into part groups from the quick picks and free text',()=>{
 assert.deepEqual(classifyService('Top end'),['top_end']);
 assert.deepEqual(classifyService('New piston and rings'),['top_end']);
 assert.deepEqual(classifyService('Other','Replaced piston, valves were tight so shimmed both intakes'),['top_end','valve_adjust']);
 assert.deepEqual(classifyService('Valve check'),['valve_check']);
 assert.deepEqual(classifyService('Valve check','Exhaust valve tight, re-shimmed'),['valve_check','valve_adjust']);
 assert.deepEqual(classifyService('Chain & sprockets'),['chain_sprockets']);
 assert.deepEqual(classifyService('Lubed the chain'),[]);
 assert.deepEqual(classifyService('Cam chain replaced'),['cam_chain']);
 assert.deepEqual(classifyService('Clutch'),['clutch']);
 assert.deepEqual(classifyService('Adjusted clutch cable'),[]);
 assert.deepEqual(classifyService('Engine oil'),['engine_oil']);
 assert.deepEqual(classifyService('Fork oil'),['fork_service']);
 assert.deepEqual(classifyService('Rear tire'),['rear_tire']);
 assert.deepEqual(classifyService('Tires'),['front_tire','rear_tire']);
 assert.deepEqual(classifyService('Greased linkage'),[]);
 assert.deepEqual(classifyService('New linkage bearings'),['linkage_bearings']);
 assert.deepEqual(classifyService('Repacked silencer'),['silencer_packing']);
 assert.deepEqual(classifyService('Reed petals'),['reeds']);
 assert.deepEqual(classifyService('Coolant level check'),[]);
});

const ev=(rider:string,hours:number|null,day:number,category='Top end'):WearEvent=>({rider,bike:'bike-'+rider,category,engine_hours:hours,performed_at:`2026-0${Math.min(9,1+Math.floor(day/28))}-${String(1+day%28).padStart(2,'0')}T00:00:00Z`});

test('part life is reported only with at least five riders, as a median of per-rider medians, with no rider data',()=>{
 const four=['a','b','c','d'].flatMap((r,i)=>[ev(r,10,1),ev(r,40+i,30)]);
 assert.deepEqual(aggregateRiderWear(four),[]);
 const five=[...four,ev('e',5,1),ev('e',45,30),ev('e',85,60)];
 const [top]=aggregateRiderWear(five);
 // gaps: a 30, b 31, c 32, d 33, e median(40,40)=40 -> median 32
 assert.equal(top.part,'top_end');assert.equal(top.riders,5);assert.equal(top.intervals,6);assert.equal(top.median_hours,32);
 assert.equal(top.typical_range_hours,undefined);
 assert.deepEqual(Object.keys(top).sort(),['intervals','label','median_hours','part','riders']);
 // a minimum below five is never honoured
 assert.deepEqual(aggregateRiderWear(four,1),[]);
});

test('missing, backwards and implausible gaps are ignored',()=>{
 const riders=['a','b','c','d','e'];
 const rows=riders.flatMap(r=>[ev(r,10,1),ev(r,null,10),ev(r,8,20),ev(r,1500,30),ev(r,1520,40)]);
 // only 1500 -> 1520 (20 h) counts; null skipped, 10 -> 8 backwards, 8 -> 1500 over the cap
 const [top]=aggregateRiderWear(rows);assert.equal(top.median_hours,20);assert.equal(top.intervals,5);
});

test('a range is shown only from ten riders',()=>{
 const rows=Array.from({length:10},(_,i)=>String.fromCharCode(97+i)).flatMap((r,i)=>[ev(r,0,1,'Clutch plates'),ev(r,20+i*2,30,'Clutch plates')]);
 const [c]=aggregateRiderWear(rows);assert.equal(c.part,'clutch');assert.equal(c.riders,10);assert.ok(c.typical_range_hours);
});

test('the wear lookup runs only for part-life questions and the platform is the known generation',()=>{
 assert.ok(WEAR_ABOUT.test('how many hours do you get on a piston'));
 assert.ok(WEAR_ABOUT.test('when should I do the top end'));
 assert.equal(WEAR_ABOUT.test('front pushes in flat corners'),false);
 assert.ok(platformYears({manufacturer:'Yamaha',model:'YZ450F',model_year:2024}).includes(2024));
 assert.deepEqual(platformYears({manufacturer:'Nobody',model:'X',model_year:2025}),[2025]);
});

test('rider_wear_data is not part of the base input and is an internal field name',async()=>{
 const bike={id:'b',user_id:'u',manufacturer:'Yamaha',model:'YZ450F',model_year:2024,variant:'standard',region:'US',nickname:'',engine_hours:20,configuration:{}} as never;
 assert.equal((buildEngineeringInput(bike,[],[],'how long does a piston last') as Record<string,unknown>).rider_wear_data,undefined);
 const src=(await import('node:fs')).readFileSync(new URL('../server/engineering.ts',import.meta.url),'utf8');
 assert.match(src,/\|garage_updates\|[a-z_|]*\brider_wear_data\b[a-z_|]*\)\\b/);
 assert.match(src,/RIDER WEAR DATA:/);
});
