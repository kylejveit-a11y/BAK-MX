import test from 'node:test';
import assert from 'node:assert/strict';
import {chatStarters,applyStarter} from '../src/chatStarters.ts';
test('four starters; a carbureted two-stroke swaps one for jetting',()=>{
 const four=chatStarters({manufacturer:'KTM',model:'450 SX-F',model_year:2025});
 assert.equal(four.length,4);
 assert.deepEqual(four.map(s=>s.label),['Front end pushes in corners','Rear kicks on braking bumps','Set my sag and clickers','Race this weekend. What do I check?']);
 const two=chatStarters({manufacturer:'Yamaha',model:'YZ250',model_year:2025});
 assert.equal(two.length,4);
 assert.ok(two.some(s=>/jetting/i.test(s.label)));
 // injected two-stroke and unknown bikes keep the standard four
 assert.ok(!chatStarters({manufacturer:'KTM',model:'250 SX',model_year:2024}).some(s=>/jetting/i.test(s.label)));
 assert.ok(!chatStarters({manufacturer:'Beta',model:'300 RR',model_year:2024}).some(s=>/jetting/i.test(s.label)));
});
test('a starter fills an empty box, replaces another starter, and never wipes the rider’s words',()=>{
 const [a,b]=chatStarters({manufacturer:'KTM',model:'450 SX-F',model_year:2025});
 assert.equal(applyStarter('',a),a.draft);
 assert.equal(applyStarter(a.draft,b),b.draft);
 assert.equal(applyStarter('Sand track today. ',a),'Sand track today. '+a.draft);
});
