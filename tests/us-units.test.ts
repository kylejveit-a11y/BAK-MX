import test from 'node:test';
import assert from 'node:assert/strict';
import {usConfiguration,buildChecks} from '../shared/garage-fields.ts';
test('builds saved in kilograms and centimetres are read as pounds and inches',()=>{
 const c=usConfiguration({geared_weight_kg:90,height_cm:180,skill_level:'B'});
 assert.equal(c.geared_weight_lb,198);assert.equal(c.height_in,71);
 assert.ok(!('geared_weight_kg' in c)&&!('height_cm' in c));
});
test('a weight already saved in pounds is never overwritten',()=>{
 assert.equal(usConfiguration({geared_weight_lb:215,geared_weight_kg:90}).geared_weight_lb,215);
 assert.deepEqual(usConfiguration(null),{});
});
test('rider check counts a weight in either unit',()=>{
 const rider=(c:Record<string,unknown>)=>buildChecks({engine_hours:null,configuration:c}).find(x=>x.id==='rider')!.done;
 assert.ok(rider({geared_weight_lb:215,skill_level:'B'}));assert.ok(rider({geared_weight_kg:90,skill_level:'B'}));assert.ok(!rider({skill_level:'B'}));
});
