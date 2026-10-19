import test from 'node:test';
import assert from 'node:assert/strict';
import {parseGuidedInput,toSpeech,stepSpeech} from '../shared/guided-job.ts';
import {guidedStepContext} from '../server/workshop-context.ts';
import {reviewedProcedures} from '../shared/procedures.ts';
import type {Bike} from '../shared/types.ts';

test('spoken commands work without a wake word; questions need one',()=>{
 for(const t of ['Next','next step.','Done','okay next','got it'])assert.equal(parseGuidedInput(t,true).kind,'next',t);
 for(const t of ['go back','Back','previous step'])assert.equal(parseGuidedInput(t,true).kind,'back',t);
 for(const t of ['repeat','say that again','what was that'])assert.equal(parseGuidedInput(t,true).kind,'repeat',t);
 assert.equal(parseGuidedInput('where am I',true).kind,'where');
 assert.equal(parseGuidedInput('stop listening',true).kind,'sleep');
 // shop talk is not a question
 assert.equal(parseGuidedInput('hand me the ten millimetre socket',true).kind,'ignore');
 const q=parseGuidedInput('Hey back, what is the torque on the cam cap bolts?',true);
 assert.equal(q.kind,'question');assert.equal((q as {text:string}).text,'what is the torque on the cam cap bolts?');
 assert.equal(parseGuidedInput('Hey BAK next',true).kind,'next');
});
test('typed text is a question unless it is a command; numbers are recorded',()=>{
 assert.equal(parseGuidedInput('what torque for the axle nut',false).kind,'question');
 assert.equal(parseGuidedInput('next',false).kind,'next');
 const r=parseGuidedInput('record intake 0.12 exhaust 0.15',false);
 assert.equal(r.kind,'record');assert.equal((r as {text:string}).text,'intake 0.12 exhaust 0.15');
 assert.equal(parseGuidedInput('record',false).kind,'question');
});
test('answers read aloud without markdown and with spoken units',()=>{
 const s=toSpeech('**Torque:** 80 Nm (59 lbf ft)\n- clearance 0.10 mm at 20 °C');
 assert.equal(s,'Torque: 80 newton metres (59 foot pounds). clearance 0.10 millimetres at 20 degrees C');
});
test('guided step context resolves only reviewed steps for the exact bike and never manual references',()=>{
 const p=reviewedProcedures.find(x=>x.id==='yamaha-yz450f-2025-major-engine-bike-journey-v1')!;
 assert.ok(p);
 const bike={id:'b',user_id:'u',manufacturer:'Yamaha',model:'YZ450F',model_year:2025,variant:'standard',region:'US',configuration:{}} as unknown as Bike;
 const ctx=guidedStepContext(bike,{procedure_id:p.id,step_index:3})!;
 assert.equal(ctx.step_number,4);assert.equal(ctx.current_step.title,p.steps[3].title);
 assert.doesNotMatch(JSON.stringify(ctx),/https?:|pdf_pages|source_links/);
 assert.equal(guidedStepContext(bike,{procedure_id:p.id,step_index:9999}),null);
 assert.equal(guidedStepContext({...bike,model_year:2019} as Bike,{procedure_id:p.id,step_index:0}),null);
 assert.match(stepSpeech(p,0),/^Step 1 of \d+\./);
});
test('BAK-written guides are original, reference-free and scoped to the exact bike',async()=>{
 const {bakGuideLibrary}=await import('../shared/bak-guide-library.ts');
 const {rebuildStandard}=await import('../shared/rebuild-standard.ts');
 assert.ok(bakGuideLibrary.length>=18);
 for(const p of bakGuideLibrary){
  assert.match(p.id,/^bak-/);assert.equal(p.source.source_url,'');assert.equal(p.source.review_status,'BAK_AUTHORED');
  assert.doesNotMatch(JSON.stringify(p),/repair manual|service manual|page \d|@|065920|070143|veit/i);
  assert.deepEqual(p.target,{manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US'});
 }
 const std=rebuildStandard({manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US'});
 assert.equal(std.items.length,9);assert.ok(std.met);
 assert.ok(std.items.find(i=>i.id==='linkage')!.met&&std.items.find(i=>i.id==='shock_rebuild')!.met);
 assert.equal(rebuildStandard({manufacturer:'KTM',model:'450 SX-F',model_year:2024,variant:'standard',region:'US'}).guides,0);
});
