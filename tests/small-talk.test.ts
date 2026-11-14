import test from 'node:test';
import assert from 'node:assert/strict';
import {smallTalkKind,smallTalkReply} from '../shared/small-talk.ts';
import {responseSchema} from '../server/engineering.ts';
import {gapIsForBike,orderedMakeModel} from '../shared/bike-identity.ts';
import {bikeSchema} from '../server/validation.ts';

test('thanks, hello and a pasted email are free small talk; real questions are not',()=>{
 for(const m of ['Thank you!','thanks','Thanks so much','ok thanks','Appreciate it 🙏','thx'])assert.equal(smallTalkKind(m),'thanks',m);
 for(const m of ['hey','Hi BAK','hello!'])assert.equal(smallTalkKind(m),'hello',m);
 assert.equal(smallTalkKind('GTest@bakmx.com'),'email');
 // From real tester conversations: these are questions and must reach BAK.
 for(const m of ['GTest@bakmx.com Rear kicks on braking bumps.','Thanks, what about rebound?','What oil do I use and where can I get it','Is 5th a good gear to hit it in','ok','next','hyqflu','Yeah I am going to get all those things later on today and put them into my garage thank you!'])assert.equal(smallTalkKind(m),null,m);
 assert.equal(smallTalkKind('thanks',true),null,'a photo or clip is never small talk');
});
test('a small-talk reply passes the same shape check as an AI answer',()=>{
 for(const k of ['thanks','hello','email'] as const){const r=smallTalkReply(k,'2025 Triumph TF 250-X');assert.equal(responseSchema.safeParse(r).success,true,k);}
 assert.match(smallTalkReply('hello','2025 Triumph TF 250-X').answer!,/TF 250-X/);
});
test('a data gap about another bike is not logged against the rider\'s bike',()=>{
 const ktm={manufacturer:'KTM',model:'450 SX-F'};
 assert.equal(gapIsForBike('Published 2024 KX450 standard fork compression and rebound settings.',ktm),false);
 assert.equal(gapIsForBike('Yamaha YZ250F rebound baseline',ktm),false);
 assert.equal(gapIsForBike('WP 6500 kit-specific spring chart for 215 lb geared weight.',ktm),true);
 assert.equal(gapIsForBike('Published sag inspection interval for the 2025 US KTM 450 SX-F.',ktm),true);
 assert.equal(gapIsForBike('Published static-sag target for the CRF250R',{manufacturer:'Honda',model:'CRF250R'}),true);
});
test('make and model typed into each other\'s boxes are put back',()=>{
 assert.deepEqual(orderedMakeModel('kx85','Kawasaki'),{manufacturer:'Kawasaki',model:'kx85'});
 assert.deepEqual(orderedMakeModel('KTM','450 SX-F'),{manufacturer:'KTM',model:'450 SX-F'});
 const saved=bikeSchema.parse({manufacturer:'kx85',model:'Kawasaki',model_year:2018,variant:'standard',region:'US',configuration:{identity_source:'rider_declared',vehicle_use:'motocross'}});
 assert.equal(saved.manufacturer,'Kawasaki');assert.equal(saved.model,'KX85');
});
