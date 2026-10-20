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

test('workshop voice: realistic transcripts, misheard names and shop talk',()=>{
 const cases:[string,string][]=[
['Next.','next'],['next step please','next'],['OK next','next'],['all right next','next'],['done','next'],['I\'m done','next'],['that\'s done','next'],['next one','next'],['Nexus','ignore'],['next next','next'],
['go back','back'],['back','back'],['go back a step','back'],['previous','back'],['back up','back'],
['repeat','repeat'],['repeat that','repeat'],['say that again','repeat'],['can you repeat that','repeat'],['what was that','repeat'],['huh','ignore'],['read it again','repeat'],['one more time','repeat'],
['where am I','where'],['what step am I on','where'],['what\'s next','where'],
['record 0.12','record'],['record point one two','record'],['intake is 0.12 and 0.13','ignore'],['it\'s 0.12','ignore'],['measured 26.5 millimeters','record'],
['hey back what\'s the torque on these bolts','question'],['Hey Bach, what size socket is that','question'],['hey buck how much oil','question'],['OK Bak torque for the axle','question'],['back what\'s the torque','ignore'],['hey back','ignore'],['bak next','next'],['hey back repeat that','repeat'],
['stop listening','sleep'],['pause','sleep'],['be quiet','ignore'],['shut up','ignore'],['stop','ignore'],
['hand me the 10 mil','ignore'],['dude this bolt is stuck','ignore'],['turn the radio down','ignore'],['back it out a turn','ignore'],['back the clicker out two','ignore'],['go back to the truck','ignore'],
['hey BAK the bolt is stuck what do I do','question'],['hey back I stripped it','question'],
];
 for(const [t,want] of cases)assert.equal(parseGuidedInput(t,true).kind,want,t);
 assert.equal(toSpeech('| Setting | Value |\n|---|---|\n| Axle | **80 Nm** |'),'Setting: Value. Axle: 80 newton metres.');
 assert.match(toSpeech('Gap 0.10–0.15 mm'),/0.10 to 0.15 millimetres/);
});
test('private manual search uses the meaningful words of the question',async()=>{
 const {manualQuery}=await import('../server/rider-manuals.ts');
 assert.equal(manualQuery("What's the torque on the rear axle nut?"),'torque or rear or axle or nut');
 assert.equal(manualQuery('how do I'),'');
});
