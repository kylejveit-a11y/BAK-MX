import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewedProcedures,createProcedureRun,recordProcedureStep,followProcedureBranch,validateProcedureRun,procedureStepRecorded} from '../shared/procedures.ts';
const p=reviewedProcedures.find(p=>p.id==='yamaha-2026-yz450f-valve-adjustment-v3')!;
const bike:any={id:'bike',user_id:'owner',...p.target,configuration:{engine:'stock'}};
function atDecision(){let run=createProcedureRun(bike,p,true);while(p.steps[run.step_index].id!=='adjustment-scope')run=recordProcedureStep(run,p,'Rider test record');return run;}
test('reviewed in-range branch closes up without claiming cam or tensioner work',()=>{
 let run=followProcedureBranch(atDecision(),p,'within-range','Four measured cold clearances are in range.');
 assert.equal(p.steps[run.step_index].id,'cover-install');
 assert.equal(run.completed['tensioner-remove'],undefined);assert.equal(run.bypassed?.['tensioner-remove'].branch_id,'within-range');
 assert.ok(validateProcedureRun(JSON.parse(JSON.stringify(run)),bike,p));
 for(let i=run.step_index;i<p.steps.length;i++)run=recordProcedureStep(run,p,'Reassembly verified');
 assert.ok(p.steps.every(s=>procedureStepRecorded(run,s.id)));
 assert.equal(run.completed['cams-remove'],undefined);
 assert.ok(validateProcedureRun(JSON.parse(JSON.stringify(run)),bike,p));
});
test('unreviewed routes, partial skip sets and performed-work replacement are rejected',()=>{
 const original=atDecision();assert.throws(()=>followProcedureBranch(original,p,'invented','record'));assert.throws(()=>followProcedureBranch(original,p,'within-range',''));
 const branch=followProcedureBranch(original,p,'within-range','In range');
 const partial=structuredClone(branch);delete partial.bypassed!['cams-remove'];assert.equal(validateProcedureRun(partial,bike,p),null);
 const falseCompletion=structuredClone(branch);falseCompletion.completed['cams-remove']={notes:'claimed performed',at:new Date().toISOString()};assert.equal(validateProcedureRun(falseCompletion,bike,p),null);
 const altered=structuredClone(branch);altered.bypassed!['cams-remove'].branch_id='invented';assert.equal(validateProcedureRun(altered,bike,p),null);
 assert.throws(()=>followProcedureBranch({...original,completed:{...original.completed,'cams-remove':{notes:'done',at:new Date().toISOString()}}},p,'within-range','record'));
});

test('fork air-release resolution saves unchanged clickers without claiming a tuning trial',()=>{
 const guide=reviewedProcedures.find(g=>g.id==='yamaha-2026-yz450f-fork-harshness-trial-v1')!;
 assert.ok(guide);
 const targetBike={...bike,...guide.target,configuration:{suspension:'stock'}};
 let run=createProcedureRun(targetBike,guide,true);
 while(!guide.steps[run.step_index].branches?.some(b=>b.id==='air-resolved'))run=recordProcedureStep(run,guide,'Synthetic QA: initial symptom and settings recorded.');
 run=followProcedureBranch(run,guide,'air-resolved','Synthetic QA: pressure released and check resolved stiffness; clickers unchanged.');
 assert.equal(guide.steps[run.step_index].id,'retain-or-restore');
 assert.equal(Object.keys(run.bypassed??{}).length,5);
 for(const id of Object.keys(run.bypassed??{}))assert.equal(run.completed[id],undefined);
 assert.ok(validateProcedureRun(JSON.parse(JSON.stringify(run)),targetBike,guide));
 run=recordProcedureStep(run,guide,'Synthetic QA: original clickers retained; no baseline reset or clicker trial performed.');
 assert.ok(guide.steps.every(s=>procedureStepRecorded(run,s.id)));
 assert.equal(Object.keys(run.completed).length,3);
 assert.ok(validateProcedureRun(JSON.parse(JSON.stringify(run)),targetBike,guide));
});
