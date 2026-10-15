import test from 'node:test';
import assert from 'node:assert/strict';
import {symptomGuides} from '../shared/setup-knowledge.ts';
import {deciderAnswers,complaintGroups,composeTriage,triageSteps} from '../shared/triage.ts';
test('every symptom guide is reachable and its deciding question has tap answers',()=>{
 const listed=complaintGroups.flatMap(g=>g.ids);
 for(const g of symptomGuides){assert.ok(listed.includes(g.id),`${g.id} missing from the guided list`);if(g.ask)assert.ok(deciderAnswers[g.id]?.length>=2,`${g.id} needs answers`);}
 for(const id of listed)assert.ok(symptomGuides.some(g=>g.id===id),id);
});
test('the composed message carries the tells in rider language',()=>{
 const text=composeTriage({complaint:'rear-kick',decider:'It kicks sideways off edges, rocks or roots',throttle:'Braking or off the gas',where:['Braking bumps'],track:['Hard pack'],notes:'Started after new tires.'});
 assert.match(text,/^Rear kicks\./);assert.match(text,/sideways off edges/i);assert.match(text,/braking or off the gas/);assert.match(text,/braking bumps/);assert.match(text,/hard pack/);assert.match(text,/new tires/);
 assert.equal(triageSteps('front-push').throttle,false);
 assert.match(composeTriage({complaint:'other',complaintText:'Front feels vague in sand',where:[],track:[]}),/^Front feels vague in sand\./);
});
