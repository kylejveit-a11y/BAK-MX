import test from 'node:test';
import assert from 'node:assert/strict';
import {adjusters,symptomGuides,beforeYouTune,setupKnowledge,workOrder,triageQuestions,mechanicalMimics,airForkRules,whenClickersRunOut,conditions,vocabulary,talkingToYourTuner,openQuestions} from '../shared/setup-knowledge.ts';
import {buildEngineeringInput} from '../server/engineering.ts';
test('setup knowledge is direction-only: it carries no numbers that could pass as specifications',()=>{
 const text=JSON.stringify({adjusters,symptomGuides,beforeYouTune,workOrder,triageQuestions,mechanicalMimics,airForkRules,whenClickersRunOut,conditions,vocabulary,talkingToYourTuner,openQuestions});
 // No digits at all: clicker counts, sag targets, pressures, jet sizes and torque must come from verified claims.
 assert.equal(/\d/.test(text),false,'authored setup knowledge must not contain numeric values');
 assert.ok(adjusters.length>=10);assert.ok(symptomGuides.length>=10);
 assert.equal(new Set(adjusters.map(a=>a.id)).size,adjusters.length);
 assert.equal(new Set(symptomGuides.map(g=>g.id)).size,symptomGuides.length);
 for(const g of symptomGuides){assert.ok(g.rider_says.length>=3,g.id);assert.ok(g.check_first.length>=1,g.id);assert.ok(g.likely.length>=1,g.id);}
});
test('the model receives setup knowledge with its boundary, separate from verified evidence',()=>{
 const bike:any={id:'b',user_id:'u',manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US',configuration:{}};
 const input=buildEngineeringInput(bike,[],[],'front pushes in flat corners');
 assert.equal(input.setup_knowledge.version,setupKnowledge().version);
 assert.match(input.setup_knowledge.boundary,/never cited as verified evidence/);
 assert.equal(input.verified_claims.length,0);
});
test('specialist knowledge separates causes that feel the same, without naming sources to riders',()=>{
 const k=setupKnowledge(),text=JSON.stringify(k);
 assert.equal(k.version,'mx-setup-2');
 for(const g of symptomGuides)if(g.likely.length>=3)assert.ok(g.ask,`${g.id} needs the question that separates its causes`);
 const kick=symptomGuides.find(g=>g.id==='rear-kick')!;
 assert.ok(kick.likely.some(l=>/rebound too fast/i.test(l.cause))&&kick.likely.some(l=>/compression too firm/i.test(l.cause)));
 assert.ok(openQuestions.some(q=>/rear grip/i.test(q.topic))&&openQuestions.some(q=>/rear kick/i.test(q.topic)));
 assert.doesNotMatch(text,/Keefer|Race Tech|MXA|Motocross Action|Bones|Slavens|Enzo|Factory Connection|Pro Circuit|Teknik|Öhlins|REP|JBI/);
});
test('tester baselines reach the model privately, and naming a tester is a rule break',async()=>{
 const {buildEngineeringInput,responseViolations,testerBaselinesFor}=await import('../server/engineering.ts');
 const bike:any={id:'b',user_id:'u',manufacturer:'Yamaha',model:'YZ450F',model_year:2025,variant:'standard',region:'US',configuration:{}};
 const input:any=buildEngineeringInput(bike,[],[],'rear kicks on braking bumps');
 assert.ok(input.tester_baselines_private?.settings?.length,'exact-bike baselines present');
 assert.doesNotMatch(JSON.stringify(input.tester_baselines_private),/Keefer|MXA|Motocross Action/);
 assert.match(String(testerBaselinesFor({manufacturer:'Yamaha',model:'YZ450F',model_year:2030})?.model_year??'none'),/none|not the rider/);
 const reply:any={kind:'answer',summary:'Keefer runs it slower.',answer:'x',claims:[],evidence_ids:[],specifications:[],confidence:'GENERAL',next_step:null,hypotheses:[],unknowns:[],setup_changes:[]};
 assert.ok(responseViolations(reply,[]).some(v=>/names a tester/.test(v)));
});
test('the rider\'s setup results reach Ask BAK, newest first',async()=>{
 const {buildEngineeringInput}=await import('../server/engineering.ts');
 const bike:any={id:'b',user_id:'u',manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US',configuration:{}};
 const input:any=buildEngineeringInput(bike,[],[],'still kicks',[{recorded_at:'2026-10-14T12:00:00Z',track:'Dade City',conditions:'',change_made:'Shock HSC: 1/4 turn softer',result:'better',notes:''}]);
 assert.equal(input.recent_setup_results[0].change,'Shock HSC: 1/4 turn softer');assert.equal(input.recent_setup_results[0].result,'better');
 assert.equal(buildEngineeringInput(bike,[],[],'x').recent_setup_results,undefined);
});
test('handling questions do not pull in unrelated workshop procedures',async()=>{
 const {workshopContext}=await import('../server/workshop-context.ts');
 const bike:any={manufacturer:'Yamaha',model:'YZ450F',model_year:2025,variant:'standard',region:'US',configuration:{}};
 assert.equal(workshopContext(bike,[],'rear kicks on braking bumps').relevant_operations.length,0);
 assert.equal(workshopContext(bike,[],'front pushes in flat corners').relevant_operations.length,0);
 const brake=workshopContext(bike,[],'rebuild the rear brake caliper').relevant_operations;
 if(brake.length)assert.match(brake[0].title,/rear/i);
});
