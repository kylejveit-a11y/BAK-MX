import test from 'node:test';
import assert from 'node:assert/strict';
import {buildServicePlan,hoursIn,splitStatement} from '../shared/service-plan.ts';

const ktm=[
 {id:'a',statement:'Service schedule / Change the engine oil and the oil filter, clean the oil screens: once after 1 operating hour; every 15 operating hours; every 45 operating hours; every 90 operating hours; every 24 months. From the manufacturer service schedule for the US standard model. "once" marks a one-time interval; the other entries repeat.'},
 {id:'b',statement:'Service schedule / Clean the air filter and air filter box: every 15 operating hours; every 45 operating hours; every 90 operating hours; every 24 months. From the manufacturer service schedule for the US standard model.'},
 {id:'c',statement:'Service schedule / Check the valve clearance: once after 1 operating hour; every 45 operating hours; every 90 operating hours. From the manufacturer service schedule for the US standard model.'},
 {id:'d',statement:'Service schedule / Check the coolant level: once after 1 operating hour; every 15 operating hours. From the manufacturer service schedule for the US standard model.'},
 {id:'e',statement:'Service schedule / Change the coolant: every 24 months. From the manufacturer service schedule for the US standard model.'},
 {id:'f',statement:'Service schedule / Perform minor engine service including removing and installing the engine. (Change the piston, check/measure the cylinder.): every 45 operating hours; every 90 operating hours. From the manufacturer service schedule.'},
 {id:'g',statement:'Service schedule / Perform the shock absorber service: every 45 operating hours; every 90 operating hours. From the manufacturer service schedule for the US standard model.'},
 {id:'h',statement:'Service schedule / Check the shock absorber linkage: every 15 operating hours; every 45 operating hours. From the manufacturer service schedule.'},
];
test('KTM schedule: shortest repeating hours per category, break-in kept, level checks and month-only items left out',()=>{
 const plan=buildServicePlan(ktm),by=Object.fromEntries(plan.map(p=>[p.category,p]));
 assert.equal(by['Engine oil'].every_hours,15);assert.equal(by['Engine oil'].first_hours,1);
 assert.equal(by['Air filter'].every_hours,15);
 assert.equal(by['Valve check'].every_hours,45);
 assert.equal(by['Top end'].every_hours,45);
 assert.equal(by['Shock service'].every_hours,45);
 assert.equal(by['Coolant'],undefined);
 assert.equal(plan.find(p=>/linkage/i.test(p.task)),undefined);
});
test('Yamaha and Honda race-based schedules use the printed hour estimate; "as required" and races without hours are skipped',()=>{
 const plan=buildServicePlan([
  {id:'y1',statement:"Service schedule / Oil filter element – Replace: after break-in; every fifth race (about 12.5 hours). From the maintenance-interval table of the US Owner's Service Manual. Intervals are per race with the approximate hours as printed."},
  {id:'y2',statement:"Service schedule / Air filter element – Replace: as required. From the maintenance-interval table of the US Owner's Service Manual."},
  {id:'h1',statement:'Maintenance schedule / Air Filter / Clean: each race (about 2.5 hours) races. Note 1: clean after every moto for dusty riding conditions'},
  {id:'k1',statement:'Periodic maintenance chart / Periodic maintenance / Front fork oil-change: 1st time after 2 races, then every 5 races races/hours. K: dealer service recommended'},
  {id:'t1',statement:'Service schedule / Lubrication / Engine oil - replace: after the first operating hour; every 3.5 hours of race riding conditions; every 15 operating hours; every 30 operating hours. From the manufacturer.'},
 ]);
 const by=Object.fromEntries(plan.map(p=>[p.category,p]));
 assert.equal(by['Oil filter'].every_hours,12.5);assert.equal(by['Oil filter'].first_hours,0);
 assert.equal(by['Air filter'].every_hours,2.5);assert.match(by['Air filter'].note??'',/races/);
 assert.equal(by['Fork service'],undefined);
 assert.equal(by['Engine oil'].every_hours,3.5);assert.equal(by['Engine oil'].first_hours,1);assert.match(by['Engine oil'].note??'',/Race-use/);
});
test('statement splitting keeps the task and drops the source note',()=>{
 const p=splitStatement('Service schedule / Change the spark plug and spark plug connector: every 45 operating hours; every 90 operating hours. From the manufacturer service schedule for the US standard model.')!;
 assert.equal(p.task,'Change the spark plug and spark plug connector');assert.equal(p.intervals,'every 45 operating hours; every 90 operating hours');
 assert.deepEqual(hoursIn('every 15 operating hours; every 24 months'),{repeat:[15],first:null});
});
