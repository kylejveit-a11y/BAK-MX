import test from 'node:test';
import assert from 'node:assert/strict';
import {changePresets,AUTO_LOCK_MS,UNLOCK_HOLD_MS} from '../shared/ride-day.ts';
import {CHANGES} from '../shared/race-day.ts';
import {makeSession,emptySession} from '../shared/practice-day.ts';

test('every Ride Day quick pick makes a valid session with its change',()=>{
 for(const c of CHANGES)for(const p of changePresets(c)){
  const r=makeSession([],{...emptySession(),change:c,detail:p});assert.ok(r.session,`${c}: ${p}`);assert.equal(r.session!.detail,p);
 }
});
test('clicker picks say softer/stiffer, tires psi; typed-only changes have no picks',()=>{
 assert.ok(changePresets('Fork compression').every(p=>/clicks? (softer|stiffer)$/.test(p)));
 assert.ok(changePresets('Rear tire').every(p=>/psi (up|down)$/.test(p)));
 assert.deepEqual(changePresets('Other'),[]);
});
test('lock timings stay glove-friendly',()=>{assert.ok(UNLOCK_HOLD_MS>=600&&UNLOCK_HOLD_MS<=1500);assert.equal(AUTO_LOCK_MS,180000);});
