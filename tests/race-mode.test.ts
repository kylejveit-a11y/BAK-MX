import test from 'node:test';
import assert from 'node:assert/strict';
import {chatSchema} from '../server/validation.ts';
import {raceLookups,RACE_LOOKUPS,instructions} from '../server/engineering.ts';

const base={conversation_id:'7f1c0c56-5d5e-4b7e-9d36-1d3a2b1f4c11',request_id:'0b6f1d4e-2c7a-4f0e-8d55-3c2e9a7b6f20',message:'front pushes in turns'};

test('chat accepts race mode with or without a track, and nothing else inside it',()=>{
 assert.equal(chatSchema.safeParse({...base,race:{}}).success,true);
 assert.equal(chatSchema.safeParse({...base,race:{track:'Glen Helen'}}).success,true);
 assert.equal(chatSchema.safeParse({...base,race:{track:'x',fast:true}}).success,false);
 assert.equal(chatSchema.safeParse(base).success,true);
});

test('race lookups lead with the rider\'s words and stay within the search budget',()=>{
 const q=raceLookups('  front pushes in turns ');
 assert.equal(q[0],'front pushes in turns');
 assert.ok(q.length<=6);
 for(const r of RACE_LOOKUPS)assert.ok(q.includes(r));
 assert.deepEqual(raceLookups(''),[...RACE_LOOKUPS]);
});

test('race mode never trades away safety or honesty in the prompt',()=>{
 assert.match(instructions,/RACE MODE/);
 assert.match(instructions,/Never trade safety or honesty for speed/);
});
