import test from 'node:test';
import assert from 'node:assert/strict';
import {aggregateCheckins,agedConditions,agoText,statusProblem,toggleStatus} from '../shared/track-checkins.ts';
import {checkinSchema} from '../server/track-checkins.ts';
const now=new Date('2026-11-15T18:00:00Z');
const at=(m:number)=>new Date(now.getTime()-m*60e3).toISOString();

test('toggle keeps one side of each pair and at most four',()=>{
 assert.deepEqual(toggleStatus(['open'],'closed'),['closed']);
 assert.deepEqual(toggleStatus(['muddy','busy','rough','watering'],'fresh_prep'),['busy','rough','watering','fresh_prep']);
 assert.deepEqual(toggleStatus(['muddy'],'muddy'),[]);
 assert.ok(statusProblem(['open','closed']));assert.ok(statusProblem([]));assert.equal(statusProblem(['open','busy']),null);
});
test('aggregate: riders counted once, newest side of a pair wins, window and blocks respected',()=>{
 const agg=aggregateCheckins([
  {user_id:'a',statuses:['closed'],created_at:at(200)},{user_id:'b',statuses:['open','muddy'],created_at:at(30)},
  {user_id:'b',statuses:['muddy'],created_at:at(10)},{user_id:'c',statuses:['muddy'],created_at:at(50)},
  {user_id:'d',statuses:['dusty'],created_at:at(500)},{user_id:'x',statuses:['busy'],created_at:at(5)}],now,{hidden:new Set(['x'])})!;
 assert.deepEqual(agg.statuses.map(s=>[s.id,s.riders,s.minutes_ago]),[['muddy',2,10],['open',1,30]]);
 assert.equal(aggregateCheckins([{user_id:'a',statuses:['open'],created_at:at(400)}],now),null);
});
test('closed shows first when it is the latest word',()=>{
 const agg=aggregateCheckins([{user_id:'a',statuses:['busy'],created_at:at(5)},{user_id:'b',statuses:['closed'],created_at:at(20)}],now)!;
 assert.equal(agg.statuses[0].id,'closed');
});
test('cached conditions age and expire',()=>{
 const c={window_hours:6,checkins:1,latest_minutes_ago:10,statuses:[{id:'muddy',label:'Muddy',riders:1,minutes_ago:10}],as_of:now.toISOString()};
 assert.equal(agedConditions(c,new Date(now.getTime()+30*60e3))!.statuses[0].minutes_ago,40);
 assert.equal(agedConditions(c,new Date(now.getTime()+400*60e3)),null);
 assert.equal(agoText(1),'just now');assert.equal(agoText(45),'45 min ago');assert.equal(agoText(95),'1½ h ago');
});
test('server schema rejects unknown and conflicting statuses',()=>{
 assert.ok(checkinSchema.safeParse({track_id:'t',statuses:['muddy']}).success);
 assert.ok(!checkinSchema.safeParse({track_id:'t',statuses:['open','closed']}).success);
 assert.ok(!checkinSchema.safeParse({track_id:'t',statuses:['lava']}).success);
});
