import test from 'node:test';
import assert from 'node:assert/strict';
import {jumpingKnowledgeFor} from '../shared/jumping-knowledge.ts';

test('jumping module is sent only for jumping talk',()=>{
 for(const q of ['how do I stop casing the big double','my bike kicks at the lip of the tabletop','building a backyard jump, how long should the landing be','what angle are freestyle ramps','nose dives off the step-up','FMX ramp setup'])
  assert.ok(jumpingKnowledgeFor(q),q);
 for(const q of ['what is the oil capacity','rebound clicks for sand','how often do I change the air filter'])assert.equal(jumpingKnowledgeFor(q),null,q);
});
test('jumping module never carries a launch speed and does not nag for measurements',()=>{
 const k=jumpingKnowledgeFor('jump')!;const all=JSON.stringify(k);
 assert.doesNotMatch(all,/\b\d+\s?(mph|km\/h|kph)\b/i);
 assert.match(k.rules.join(' '),/Never give a speed/);
 assert.match(k.rules.join(' '),/Never hold an answer back/);
 assert.match(k.rules.join(' '),/never send a rider to measure a jump at a public track/);
});
