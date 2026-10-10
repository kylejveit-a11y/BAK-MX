import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ENGINEERING_SYSTEMS,getMechanismLibrary,summarizeMechanismEvidence,type VerificationEvidence} from '../shared/mechanisms.ts';

test('mechanism graph contains complete bounded causal and verification relationships',()=>{
  const all=getMechanismLibrary();assert.equal(all.length,12);assert.equal(new Set(all.map(m=>m.id)).size,all.length);
  for(const system of ENGINEERING_SYSTEMS)assert.ok(all.some(m=>m.systems.includes(system)),system);
  for(const m of all){
    assert.equal(m.status,'LIMITED');assert.equal(m.authorship,'BAK_AUTHORED_HYPOTHESIS');
    assert.ok(m.component&&m.physical_state&&m.causal_chain.length>=3&&m.possible_observations.length&&m.unknowns.length);
    const v=m.verification;assert.ok(v.purpose&&v.measurement&&v.safe_first_step&&v.supports&&v.weakens&&v.inconclusive_when);
    assert.ok(v.stop_conditions.length&&v.prerequisites.length&&m.corrective_action_gate);
  }
  assert.ok(JSON.stringify(all).length<35000,'Keep runtime context bounded');
});
test('domain selection is exact taxonomy, not prompt matching, and returns independent objects',()=>{
  const fuel=getMechanismLibrary(['fuel']);assert.ok(fuel.length>1);assert.ok(fuel.every(m=>m.systems.includes('fuel')));
  assert.deepEqual(getMechanismLibrary([]),[]);
  assert.throws(()=>getMechanismLibrary(['my bike is broken' as never]),RangeError);
  fuel[0]!.causal_chain.length=0;assert.ok(getMechanismLibrary(['fuel'])[0]!.causal_chain.length);
});
test('library contains no bike-specific specifications, quantities, rankings or repair prescriptions',()=>{
  const serialized=JSON.stringify(getMechanismLibrary());
  assert.doesNotMatch(serialized,/\b(?:YZ250F|KX450|CRF450R|SX-F|202[2-6]|psi|Nm|N·m|milliliters|clicks)\b/);
  assert.doesNotMatch(serialized,/"(?:probability|rank|specification|torque|service_interval)":/);
  for(const m of getMechanismLibrary())assert.match(m.corrective_action_gate,/Verify the fault/);
});
test('hypothetical, wrong-condition and unverified-procedure results never eliminate mechanisms',()=>{
  const base:VerificationEvidence={mechanism_id:'fuel-delivery-limited',result:'weakens',origin:'observed',applicable_procedure_verified:true,complaint_condition_matched:true};
  for(const changed of [{origin:'hypothetical' as const},{applicable_procedure_verified:false},{complaint_condition_matched:false}]){
    const [result]=summarizeMechanismEvidence([{...base,...changed}]);assert.equal(result!.effect,'inconclusive');assert.equal(result!.diagnostic_status,'UNRESOLVED');
  }
  assert.equal(summarizeMechanismEvidence([base])[0]!.effect,'weakens');
  assert.equal(summarizeMechanismEvidence([{...base,result:'supports'}])[0]!.diagnostic_status,'UNRESOLVED');
  assert.throws(()=>summarizeMechanismEvidence([{...base,mechanism_id:'invented'}]),RangeError);
  assert.throws(()=>summarizeMechanismEvidence(Array(201).fill(base)),RangeError);
});
test('high-risk families carry engine-off and no-reproduction safeguards',()=>{
  const all=getMechanismLibrary();
  assert.match(all.find(m=>m.id==='lubrication-compromised')!.verification.safe_first_step,/do not restart/);
  assert.match(all.find(m=>m.id==='tank-vent-restriction')!.verification.safe_first_step,/do not open a hot tank/);
  assert.match(all.find(m=>m.id==='cooling-capacity-or-loss')!.verification.safe_first_step,/without removing a hot/);
  assert.match(all.find(m=>m.id==='brake-drag-or-loss')!.verification.safe_first_step,/do not road-test/);
  assert.match(all.find(m=>m.id==='suspension-friction-or-damping-fault')!.verification.safe_first_step,/until faults are excluded/);
});
