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
