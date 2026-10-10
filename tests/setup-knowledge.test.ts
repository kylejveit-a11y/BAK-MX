import test from 'node:test';
import assert from 'node:assert/strict';
import {adjusters,symptomGuides,beforeYouTune,setupKnowledge} from '../shared/setup-knowledge.ts';
import {buildEngineeringInput} from '../server/engineering.ts';
test('setup knowledge is direction-only: it carries no numbers that could pass as specifications',()=>{
 const text=JSON.stringify({adjusters,symptomGuides,beforeYouTune});
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
