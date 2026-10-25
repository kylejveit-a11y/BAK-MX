import test from 'node:test';
import assert from 'node:assert/strict';
import {clipFrameTimes,nearestFrame,TIME_MENTION,COACH_FOCUS,CLIP_MAX_FRAMES} from '../shared/coach-focus.ts';
import {skills} from '../shared/riding-coach.ts';
import {riderMedia} from '../server/engineering.ts';

test('short trimmed clips get frames close together; long clips are capped',()=>{
 assert.equal(clipFrameTimes(2000).length,4);
 const five=clipFrameTimes(5000);assert.equal(five.length,11);assert.ok(five[1]-five[0]<500);
 assert.equal(clipFrameTimes(20000).length,CLIP_MAX_FRAMES);
 const t=clipFrameTimes(8000);assert.ok(t[0]>0&&t[t.length-1]<8000);assert.deepEqual([...t].sort((a,b)=>a-b),t);
});
test('times named in an answer link to the nearest frame',()=>{
 const frames=[0.2,0.7,1.2,1.7,2.2];
 const found=[...'At 1.2 s your elbows drop, by 2.1s you are late, 1.6 seconds in. Stay 10 s.'.matchAll(new RegExp(TIME_MENTION.source,'g'))].map(m=>nearestFrame(frames,parseFloat(m[1])));
 assert.deepEqual(found,[2,4,3,-1]);
});
test('every focus names real coaching skills',()=>{
 const ids=new Set(skills.map(s=>s.id));
 for(const f of COACH_FOCUS)for(const s of f.skills)assert.ok(ids.has(s),`${f.id}: ${s}`);
});
test('what the rider is showing reaches BAK with the clip',()=>{
 const m=riderMedia({kind:'clip',duration:4.04,frames:[0.12,1.4],focus:'corner',slowmo:true},2) as any;
 assert.equal(m.kind,'clip');assert.equal(m.slow_motion,true);assert.equal(m.focus.showing,'corner');assert.deepEqual(m.frames,[{frame:1,time_s:0.1},{frame:2,time_s:1.4}]);
 assert.deepEqual(riderMedia(null,3),{kind:'photos',count:3});
 assert.equal((riderMedia({kind:'photos',focus:'track'},2) as any).focus.showing,'track');
});
