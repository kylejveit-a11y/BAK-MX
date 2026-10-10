import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {reviewedProcedures,createProcedureRun,recordProcedureStep,followProcedureBranch} from '../shared/procedures.ts';
import {emptyWorkshopWork,workshopBackup,parseWorkshopBackup,mergeWorkshopBackup} from '../shared/workshop-backup.ts';

const bike:any={id:'engine-journey-test',user_id:'qa-owner',manufacturer:'Yamaha',model:'YZ450F',model_year:2025,region:'US',variant:'standard',configuration:{}};

test('equipment correction includes axle torque capacity without changing mechanical run identity',()=>{
 const raw=JSON.parse(readFileSync('docs/research/workshop-pass9/yamaha-2025-frame/engine-removal-refit-v1.procedure.json','utf8'));
 const p=reviewedProcedures.find(p=>p.id===raw.id)!;
 assert.equal(p.content_sha256,createHash('sha256').update(JSON.stringify(raw)).digest('hex'));
 assert.ok(p.required_tools.some(t=>t.name.includes('1.5-135 Nm')));
 assert.ok(!p.required_tools.some(t=>t.name.includes('1.5-90 Nm')));
 assert.deepEqual(p.steps.map(s=>s.instruction),raw.steps.map((s:any)=>s.instruction));
});

for(const year of [2022,2023,2024,2025]){
 const targetBike={...bike,model_year:year};
test(`${year} major-engine route preserves lower-engine work when valve renewal is bypassed`,()=>{
 const p=reviewedProcedures.find(p=>p.id===`yamaha-yz450f-${year}-major-engine-bike-journey-v1`);
 assert.ok(p);
 const ids=p.steps.map(s=>s.id);
 assert.ok(ids.indexOf('topend-piston-out')<ids.indexOf('lower-entry'));
 assert.ok(ids.indexOf('lower-exit')<ids.indexOf('topend-bore'));
 assert.ok(ids.indexOf('lower-generator-cover-in')<ids.indexOf('topend-cam-disposition'));
 let run=createProcedureRun(targetBike,p,true);
 while(p.steps[run.step_index].id!=='topend-head-path')run=recordProcedureStep(run,p,'Synthetic QA only');
 run=followProcedureBranch(run,p,p.steps[run.step_index].branches![0].id,'Synthetic QA: retained valves and guides passed measurements.');
 assert.ok(run.completed['lower-exit']);
 assert.ok(Object.keys(run.bypassed??{}).every(id=>!id.startsWith('lower-')));
 const work={journals:[],procedures:[{run,drafts:{}}],archived:[]};
 assert.deepEqual(mergeWorkshopBackup(emptyWorkshopWork(),parseWorkshopBackup(JSON.stringify(workshopBackup(targetBike,work)),targetBike),targetBike),work);
 assert.match(p.steps.find(s=>s.id==='commission-plan')!.instruction,/crankshaft/);
 assert.match(p.steps.find(s=>s.id==='commission-plan')!.instruction,/gears/);
});

test(`${year} top-end journey restores a retained-valve branch and keeps startup checks ahead of riding`,()=>{
 const p=reviewedProcedures.find(p=>p.id===`yamaha-yz450f-${year}-top-end-bike-journey-v1`);
 assert.ok(p);
 let run=createProcedureRun(targetBike,p,true);
 while(p.steps[run.step_index].id!=='topend-head-path')run=recordProcedureStep(run,p,'Synthetic QA verification');
 const branch=p.steps[run.step_index].branches![0];
 run=followProcedureBranch(run,p,branch.id,'Synthetic QA: original valves, guides and seats passed the required measured checks.');
 const skipped=Object.keys(run.bypassed??{});
 assert.ok(skipped.length>0);
 assert.ok(skipped.every(id=>run.completed[id]===undefined));
 const work={journals:[],procedures:[{run,drafts:{}}],archived:[]};
 const restored=mergeWorkshopBackup(emptyWorkshopWork(),parseWorkshopBackup(JSON.stringify(workshopBackup(targetBike,work)),targetBike),targetBike);
 assert.deepEqual(restored,work);
 run=restored.procedures[0].run;
 while(p.steps[run.step_index].id!=='commission-test-attach')run=recordProcedureStep(run,p,'Synthetic QA verification');
 assert.equal(run.completed['access-engine-oil-flow'],undefined);
 assert.equal(run.completed['commission-first-ride'],undefined);
 assert.ok(run.completed['access-engine-bench-record']);
 const phases=['commission-test-attach','access-engine-oil-flow','commission-test-warm','commission-test-hold','commission-test-cool-close'];
 for(const id of phases){assert.equal(p.steps[run.step_index].id,id);run=recordProcedureStep(run,p,'Synthetic QA only; no physical repair performed.');}
 assert.ok(skipped.every(id=>run.completed[id]===undefined));
 assert.throws(()=>createProcedureRun({...bike,model_year:2026},p,true));
});

}


test('2024 rear hose correction preserves other checks, original content identity and rejects changed review inputs',async()=>{
 const {applyHoseRouteCorrection,hoseCorrectionSha256}=await import('../scripts/apply-hose-route-correction.ts');
 const bytes=readFileSync('docs/research/workshop-pass10/yamaha-2024-frame/frame-bearing-renewal-reassembly-v1.procedure.json');
 const correction=readFileSync('docs/research/workshop-pass10/yamaha-2024-frame/hose-route-correction.json');
 const raw=JSON.parse(bytes.toString('utf8'));
 const p=reviewedProcedures.find(p=>p.id===raw.id)!;
 assert.ok(p);
 assert.equal(p.content_sha256,createHash('sha256').update(JSON.stringify(raw)).digest('hex'));
 const before=raw.steps.find((s:any)=>s.id==='rear-brake-refit');
 const after=p.steps.find(s=>s.id===before.id)!;
 assert.equal(after.instruction,before.instruction.replace('with paint mark UP','following the illustrated route'));
 assert.deepEqual(after.verification,before.verification);
 assert.deepEqual(after.depends_on,before.depends_on);
 assert.equal(after.diagram_reference_required,true);
 assert.equal((p.source as any).hose_route_correction_sha256,hoseCorrectionSha256);
 assert.deepEqual(p.steps.filter(s=>s.id!==before.id).map(s=>s.instruction),raw.steps.filter((s:any)=>s.id!==before.id).map((s:any)=>s.instruction));
 assert.throws(()=>applyHoseRouteCorrection(structuredClone(raw),Buffer.concat([bytes,Buffer.from(' ')]),correction),/does not match/);
 assert.throws(()=>applyHoseRouteCorrection(structuredClone(raw),bytes,Buffer.concat([correction,Buffer.from(' ')])),/review changed/);
 const changed=structuredClone(raw);changed.steps.find((s:any)=>s.id===before.id).instruction+=' changed';
 assert.throws(()=>applyHoseRouteCorrection(changed,bytes,correction),/does not match/);
});


test('2022 filter seal clarification preserves saved work identity and matches its reviewed snapshot',()=>{
 const path='docs/research/workshop-pass12/';
 const raw=JSON.parse(readFileSync(path+'yamaha-2022-engine/lower-engine-bench-v1.procedure.json','utf8'));
 const corrected=JSON.parse(readFileSync(path+'yamaha-2022-engine-journey/lower-engine-bench-v1-corrected.procedure.json','utf8'));
 const p=reviewedProcedures.find(p=>p.id===raw.id)!;
 assert.ok(p);
 assert.equal(p.content_sha256,createHash('sha256').update(JSON.stringify(raw)).digest('hex'));
 assert.deepEqual(p.steps.map(s=>s.instruction),corrected.steps.map((s:any)=>s.instruction));
 assert.equal(raw.steps.filter((s:any,i:number)=>s.instruction!==corrected.steps[i].instruction).length,2);
});
