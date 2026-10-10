import {test} from 'node:test';
import assert from 'node:assert/strict';
import {finalDrive,gearingChange,sagPercent,speedKmh,displacementCc,springRateNmm,compressionRatio} from '../shared/calculators.ts';
test('ratio direction and gearing percentage',()=>{assert.equal(finalDrive(13,52),4);assert.equal(gearingChange(13,52,13,52),0);assert.ok(Math.abs(gearingChange(13,50,13,52)-4)<1e-10);});
test('speed units and zero RPM',()=>{assert.equal(speedKmh(6000,3,1,10,40,2000),60);assert.equal(speedKmh(0,3,1,10,40,2000),0);});
test('measured sag normalized to travel',()=>assert.ok(Math.abs(sagPercent(600,500,300)-100/3)<1e-10));
test('geometric displacement, compression and physical spring units',()=>{assert.ok(Math.abs(displacementCc(100,60,1)-471.238898)<1e-6);assert.equal(compressionRatio(450,45),11);assert.ok(Math.abs(springRateNmm(100)-17.5126835)<1e-6);});
test('invalid inputs do not yield plausible answers',()=>{for(const f of [()=>finalDrive(0,52),()=>finalDrive(13.5,52),()=>speedKmh(Infinity,3,1,13,50,2000),()=>sagPercent(500,600,300),()=>sagPercent(800,400,300),()=>displacementCc(100,60,1.5)])assert.throws(f,RangeError);});
