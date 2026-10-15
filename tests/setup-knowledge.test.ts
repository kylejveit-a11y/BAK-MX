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
