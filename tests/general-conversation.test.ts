import test from 'node:test';
import assert from 'node:assert/strict';
import {conversationSchema} from '../server/validation.ts';
import {buildEngineeringInput,responseViolations} from '../server/engineering.ts';
const id='00000000-0000-4000-8000-000000000001';
test('a conversation without a build is allowed only as a general question',()=>{
 assert.ok(conversationSchema.safeParse({bike_id:null,title:'What does HSC do?',mode:'ask'}).success);
 assert.ok(!conversationSchema.safeParse({bike_id:null,title:'Bogging',mode:'diagnose'}).success);
 assert.ok(!conversationSchema.safeParse({bike_id:null,title:'Sag',mode:'setup'}).success);
 assert.ok(conversationSchema.safeParse({bike_id:id,title:'Bogging',mode:'diagnose'}).success);
 assert.ok(!conversationSchema.safeParse({title:'missing bike field',mode:'ask'}).success);
});
test('a general question sends no bike, no workshop context and no published evidence to the model',()=>{
 const input=buildEngineeringInput(null,[],[],'What does high-speed compression do?');
 assert.equal(input.bike,null);assert.equal(input.reviewed_workshop,null);assert.deepEqual(input.verified_claims,[]);
 assert.match(String((input as {no_build?:string}).no_build),/NO BUILD SELECTED/);
});
test('with no evidence, a reply cannot present anything as published',()=>{
 const reply={kind:'answer',summary:'s',answer:'Typical torque is 80 Nm.',observations:[],systems:[],hypotheses:[],unknowns:[],next_step:null,setup_changes:[],specifications:[],evidence_ids:[],confidence:'LIMITED',claims:[{claim:'Axle torque is 80 Nm',tier:'PUBLISHED',evidence_ids:[]}],data_gaps:[]};
 assert.ok(responseViolations(reply as never,[]).some(v=>/PUBLISHED without retrieved evidence/.test(v)));
});
test('a reply that describes how BAK is fed is repaired',()=>{
 const base={kind:'answer',summary:'s',observations:[],systems:[],hypotheses:[],unknowns:[],next_step:null,setup_changes:[],specifications:[],evidence_ids:[],confidence:'LIMITED',claims:[],data_gaps:[]};
 assert.ok(responseViolations({...base,answer:'The supplied research notes relay tester reports of more midrange.'} as never,[]).some(v=>/how BAK is fed/.test(v)));
 assert.ok(!responseViolations({...base,answer:'Testers report more midrange with the insert out.'} as never,[]).some(v=>/how BAK is fed/.test(v)));
});
test('a tuner name is allowed only when it is the brand of a part the rider has fitted',async()=>{
 const {responseViolations}=await import('../server/engineering.ts');
 const base={kind:'answer',summary:'s',answer:'Your Slavens Racing head kit raises compression.',setup_changes:[],observations:[],systems:[],hypotheses:[],unknowns:[],next_step:null,specifications:[],evidence_ids:[],claims:[],references:[],confidence:'LIMITED',garage_updates:[]} as never;
 assert.ok(responseViolations(base,[]).some(v=>/tester, magazine or tuner/.test(v)));
 assert.ok(!responseViolations(base,[],['Slavens Racing']).some(v=>/tester, magazine or tuner/.test(v)));
 assert.ok(responseViolations({...(base as object),answer:'Keefer says so.'} as never,[],['Slavens Racing']).some(v=>/tester, magazine or tuner/.test(v)));
});
test('racing knowledge is in the briefing and covers pro and amateur racing types',async()=>{
 const {disciplinesKnowledge}=await import('../shared/disciplines.ts');const k=disciplinesKnowledge();
 for(const id of ['supercross','arenacross','motocross','mxgp','cross_country','enduro_extreme'])assert.ok(k.disciplines.some(d=>d.id===id),id);
 assert.ok(!/\b\d+\s?(clicks?|psi|N\/mm|mm sag)\b/i.test(JSON.stringify(k)),'no bike-specific numbers');
});
