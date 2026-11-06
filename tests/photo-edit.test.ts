import test from 'node:test';
import assert from 'node:assert/strict';
import {allowanceSince,editAllowance,editPrompt,EDIT_STYLES} from '../shared/photo-edit.ts';

test('photo edit allowance: 3 free to try, 15 a month on Pro, adjustable from settings',()=>{
 assert.deepEqual(editAllowance('free'),{period:'lifetime',included:3});
 assert.deepEqual(editAllowance('pro'),{period:'month',included:15});
 assert.equal(editAllowance('pro',{PHOTO_EDITS_PRO_MONTHLY:'20'}).included,20);
 assert.equal(editAllowance('pro',{PHOTO_EDITS_PRO_MONTHLY:'lots'}).included,15);
 assert.equal(allowanceSince({period:'month',included:15},new Date('2026-11-06T12:00:00Z')),'2026-11-01T00:00:00.000Z');
});

test('every look keeps the rider, bike, numbers and scene as shot',()=>{
 for(const s of EDIT_STYLES)assert.match(editPrompt(s),/Do not add, remove or change any person, vehicle, object, number, logo or text/);
});
