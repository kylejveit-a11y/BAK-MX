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

import {serviceDueRows,comingUp,dueLine,upNext} from '../shared/service-plan.ts';
test('a bike with hours and nothing logged: nothing in Coming up, every maker row reads "not logged yet"',()=>{
 const plan=buildServicePlan(ktm);
 assert.deepEqual(upNext(plan,[],64),[]);
 const rows=serviceDueRows(plan,[],64);
 assert.ok(rows.length>0);
 for(const r of rows){assert.equal(r.left,null);assert.match(dueLine(r),/not logged yet$/);assert.doesNotMatch(dueLine(r),/due now/);}
 // one logged job brings that job, and only that job, into Coming up once it is within the soon window
 assert.equal(upNext(plan,[{category:'Engine oil',engine_hours:60,next_due_hours:null}],64).length,0);
 const soon=upNext(plan,[{category:'Engine oil',engine_hours:50,next_due_hours:null}],64);
 assert.deepEqual(soon.map(x=>[x.category,x.left,x.at]),[['Engine oil',1,65]]);
});
test('due rows: last log sets the next one, never-logged jobs have no due state, soonest first, unknown hours give no figures',()=>{
 const plan=buildServicePlan(ktm);
 const events=[{category:'Engine oil',engine_hours:20},{category:'Engine oil',engine_hours:5},{category:'Air filter',engine_hours:null}];
 const rows=serviceDueRows(plan,events,32);
 const oil=rows.find(r=>r.item.category==='Engine oil')!;
 assert.equal(oil.last?.engine_hours,20);assert.equal(oil.due,35);assert.equal(oil.left,3);
 // never logged (an entry with no hours does not count): BAK does not know when it was last done, so it is not "due now"
 const air=rows.find(r=>r.item.category==='Air filter')!;
 assert.equal(air.last,null);assert.equal(air.due,null);assert.equal(air.left,null);
 assert.equal(dueLine(air),'every 15 h · not logged yet');
 assert.equal(dueLine(oil),'every 15 h · 3 h to go');
 assert.deepEqual(rows.map(r=>r.left),[...rows.map(r=>r.left)].sort((a,b)=>(a??1e9)-(b??1e9)));
 assert.equal(rows[0].item.category,'Engine oil');
 // a logged job that has run past its interval is overdue
 const over=serviceDueRows(plan,[{category:'Engine oil',engine_hours:40}],64).find(r=>r.item.category==='Engine oil')!;
 assert.equal(over.due,55);assert.equal(over.left,-9);assert.equal(dueLine(over),'every 15 h · due now');
 // a new bike that has not reached the break-in hour yet: that first service cannot have been done, so it is due at the break-in figure
 const fresh=serviceDueRows(plan,[],0.5).find(r=>r.item.category==='Valve check')!;
 assert.equal(fresh.due,1);assert.equal(fresh.left,0.5);
 // past the break-in hour with nothing logged: no due state either
 const past=serviceDueRows(plan,[],1.5).find(r=>r.item.category==='Valve check')!;
 assert.equal(past.due,null);assert.equal(past.left,null);
 const unknown=serviceDueRows(plan,events,null);
 assert.ok(unknown.every(r=>r.due===null&&r.left===null));
 assert.equal(dueLine(unknown.find(r=>r.item.category==='Engine oil')!),'every 15 h');
});
test('coming up: the rider\'s own reminders, closest first, capped',()=>{
 const events=[{id:'1',next_due_hours:50},{id:'2',next_due_hours:null},{id:'3',next_due_hours:33},{id:'4',next_due_hours:40},{id:'5',next_due_hours:90}];
 assert.deepEqual(comingUp(events,30).map(x=>[x.e.id,x.left]),[['3',3],['4',10],['1',20]]);
 assert.deepEqual(comingUp(events,null,2).map(x=>[x.e.id,x.left]),[['1',null],['3',null]]);
});
