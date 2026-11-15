import test from 'node:test';
import assert from 'node:assert/strict';
import {lastSeen,publicView} from '../shared/ride-share.ts';
import {positionSchema,startSchema} from '../server/ride-shares.ts';
const now=Date.parse('2026-11-15T18:00:00Z');
const row={rider_name:'Kyle',expires_at:'2026-11-15T20:00:00Z',ended_at:null,last_lat:28.1,last_lng:-82.3,last_accuracy_m:30,last_at:'2026-11-15T17:55:00Z'};
test('public view shows only the name and last point while active',()=>{
 const v=publicView(row,now);assert.equal(v.state,'active');assert.deepEqual(Object.keys(v).sort(),['expires_at','last','rider_name','state']);assert.equal(v.last?.lat,28.1);
 assert.equal(publicView({...row,ended_at:'2026-11-15T17:58:00Z'},now).last,null);
 assert.equal(publicView({...row,expires_at:'2026-11-15T17:00:00Z'},now).state,'expired');
 assert.equal(publicView({...row,expires_at:'2026-11-15T17:00:00Z'},now).last,null);
});
test('last seen wording',()=>{assert.equal(lastSeen(null,now),'No location yet');assert.equal(lastSeen('2026-11-15T17:59:30Z',now),'Last seen just now');assert.equal(lastSeen('2026-11-15T17:30:00Z',now),'Last seen 30 min ago');assert.equal(lastSeen('2026-11-15T16:45:00Z',now),'Last seen 1 h 15 min ago');});
test('share length is bounded and positions are validated',()=>{
 assert.ok(startSchema.safeParse({hours:4}).success);assert.ok(!startSchema.safeParse({hours:24}).success);assert.ok(!startSchema.safeParse({hours:0}).success);
 assert.ok(positionSchema.safeParse({id:'5b9f0c1e-1a2b-4c3d-8e9f-0a1b2c3d4e5f',lat:28,lng:-82,at:'2026-11-15T17:00:00Z'}).success);
 assert.ok(!positionSchema.safeParse({id:'5b9f0c1e-1a2b-4c3d-8e9f-0a1b2c3d4e5f',lat:128,lng:-82,at:'2026-11-15T17:00:00Z'}).success);
});
