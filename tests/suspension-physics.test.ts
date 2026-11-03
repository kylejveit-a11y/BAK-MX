import test from 'node:test';
import assert from 'node:assert/strict';
import {chassisFromStatements,springCheck,geometry,oilThinning,physicsContext} from '../shared/suspension-physics.ts';
const yz=['Chassis / Caster angle: 26.9 °. Exact US standard-model OEM configuration.','Chassis / Trail: 119 mm. Exact US standard-model OEM configuration.','Front tire / Size: 80/100-21 51M. Exact US.','Wheelbase: 1475 mm.'];
const ktm=['Steering head angle: 63.9 degrees. OEM angle convention.','Wheelbase: 1493 +/- 10 mm. OEM technical table.','Static sag: 35 mm. OEM US stock setup reference.','Riding sag: 105 mm. OEM US stock setup reference.','Recommended shock spring rate: 42 N/mm. Rider mass 65–75 kg.; Recommendation','Recommended shock spring rate: 45 N/mm. Rider mass 75–85 kg.; Recommendation','Recommended shock spring rate: 48 N/mm. Rider mass 85–95 kg.; Recommendation','Rear suspension travel: 300 mm.','Front suspension travel: 310 mm.'];
const honda=['Shock standard spring rate: 52 N/mm. Applies to the standard R model.','Shock optional soft spring rate: 50 N/mm.','Fork standard spring rate: 5 N/mm.'];
test('reads published chassis values in every maker wording',()=>{
 const y=chassisFromStatements(yz);assert.equal(y.rakeDeg,26.9);assert.equal(y.trailMm,119);assert.deepEqual(y.frontTire,{width:80,aspect:100,rim:21});assert.equal(y.wheelbaseMm,1475);
 const k=chassisFromStatements(ktm);assert.equal(Math.round(k.rakeDeg!*10)/10,26.1,'head angle from horizontal becomes caster');assert.equal(k.wheelbaseMm,1493);assert.equal(k.raceSagMm,105);assert.equal(k.staticSagMm,35);assert.equal(k.shockSpringByRiderKg!.length,3);assert.equal(k.rearTravelMm,300);
 const h=chassisFromStatements(honda);assert.equal(h.shockSpringNmm,52,'standard, not the optional soft');assert.equal(h.forkSpringNmm,5);
});
test('spring check: preload wound in to hold a heavy rider means the spring is too soft',()=>{
 const p={...chassisFromStatements(ktm),shockSpringNmm:45};
 const soft=springCheck(p,{raceSagMm:105,freeSagMm:20,gearedWeightLb:215});
 assert.match(soft.verdict,/too soft/);assert.ok(soft.suggested_shock_spring_nmm!>45);assert.match(soft.by_maker_table!,/48 N\/mm/);
 const stiff=springCheck(p,{raceSagMm:105,freeSagMm:50});assert.match(stiff.verdict,/too stiff/);assert.ok(stiff.suggested_shock_spring_nmm!<45);
 assert.match(springCheck(p,{raceSagMm:104,freeSagMm:36}).verdict,/suits/);
 assert.match(springCheck(p,{}).verdict,/Race sag not recorded/);
});
test('geometry: tubes up steepen and cut trail; more offset cuts trail; more rear sag adds it',()=>{
 const g=geometry(chassisFromStatements(yz))!;
 assert.ok(g.fork_tubes_up_5mm!.trail_change_mm<0&&g.fork_tubes_up_5mm!.head_angle_change_deg<0);
 assert.ok(g.clamp_offset_plus_2mm.trail_change_mm<0&&g.clamp_offset_minus_2mm.trail_change_mm>0);
 assert.ok(g.rear_sag_plus_5mm!.trail_change_mm>0);
 assert.ok(Math.abs(g.clamp_offset_plus_2mm.trail_change_mm+2.2)<0.2,'2 mm offset is about 2.2 mm of trail at 27°');
 assert.equal(geometry(chassisFromStatements(ktm)),null,'no published trail: no geometry numbers');
});
test('oil thins as it heats: a hot afternoon is a real drop in low-speed damping',()=>{
 const h=oilThinning(60,95);assert.ok(h.viscosity_change_pct< -30&&h.viscosity_change_pct> -60,String(h.viscosity_change_pct));
 assert.ok(oilThinning(95,60).viscosity_change_pct>0);
 assert.ok(physicsContext(yz,{}).geometry);
});
test('Kawasaki and Honda wordings, and KTM geometry from head angle and clamp offset',()=>{
 const kx=chassisFromStatements(['Frame / Trail: 0.06 in (116 mm). Applies to the US standard model named','Frame / Caster: 27.0°. Applies','Rear shock / Spring rate (standard): K = 54 N/mm (K = 5.5 kgf/mm).','Rear shock / Optional spring rate (harder): K = 56 N/mm','Front fork / Spring rate (standard): 5.0 N/mm (0.51 kgf/mm).','Frame / Tire Size/Type / Front: 80/100-21 51M/DUNLOP MX34F.','Dimensions / Wheelbase: 1480 mm.']);
 assert.equal(kx.trailMm,116);assert.equal(kx.shockSpringNmm,54);assert.equal(kx.forkSpringNmm,5);assert.deepEqual(kx.frontTire,{width:80,aspect:100,rim:21});
 const k=geometry(chassisFromStatements(['Steering head angle: 63.9 degrees.','Fork offset: 22 mm.','Original front tire: 80/100-21 51M TT','Wheelbase: 1493 +/- 10 mm.']))!;
 assert.ok(k&&k.clamp_offset_plus_2mm.trail_change_mm<0);assert.match(k.worked_out_from[0],/isn't published/);
});
