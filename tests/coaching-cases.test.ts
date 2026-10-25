import test from 'node:test';
import assert from 'node:assert/strict';
// @ts-ignore plain module of test fixtures
import {cases,check} from './evaluation/coaching/cases.mjs';

test('coaching test set: unique ids, a level and checks on every case',()=>{
 assert.equal(new Set(cases.map((c:any)=>c.id)).size,cases.length);
 for(const c of cases as any[]){assert.ok(c.level&&c.q&&c.must?.length,c.id);}
});
test('the checks catch the dangerous answers they are written for',()=>{
 const byId=Object.fromEntries((cases as any[]).map(c=>[c.id,c]));
 assert.ok(check(byId['hill-stall'],'Hold the front brake, pull the clutch and hold it, then turn around.').length>0);
 assert.deepEqual(check(byId['hill-stall'],'Hold both brakes with the bike in gear, step off on the uphill side, then use the clutch as a brake to back down.'),[]);
 assert.ok(check(byId['double-casing'],'Each lap go a little faster until you clear it.').length>0);
 assert.ok(check(byId['arm-pump'],'Per coaching_knowledge, grip with your legs and breathe.').some((f:string)=>f.startsWith('must not')));
});
