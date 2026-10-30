import test from 'node:test';
import assert from 'node:assert/strict';
import {plainName,plainInterval,sameJob} from '../shared/plain-facts.ts';

test('maker jargon becomes rider words',()=>{
 assert.equal(plainName('Check the fork bearing for play'),'Check the swingarm pivot bearing for play');
 assert.equal(plainName('Check that the brake linings of the front brake are secured'),'Check that the brake pads of the front brake are secured');
 assert.equal(plainName('Check the free travel of the foot brake lever'),'Check the free travel of the rear brake pedal');
 assert.equal(plainName('Perform the shock absorber service'),'Service the shock');
 assert.equal(plainName('Screw, front brake caliper (M8)'),'Front brake caliper screw (M8)');
 assert.equal(plainName('Service the fork.'),'Service the fork');
});
test('intervals collapse to the one a rider follows',()=>{
 assert.equal(plainInterval('once after 1 operating hour; every 15 operating hours; every 45 operating hours; every 90 operating hours; every 24 months'),'Every 15 h · or 24 months · first at 1 h');
 assert.equal(plainInterval('every 45 operating hours; every 90 operating hours'),'Every 45 h');
 assert.equal(plainInterval('Every45h; included90h'),'Every 45 h');
 assert.equal(plainInterval('every 90 operating hours; every 24 months'),'Every 90 h · or 24 months');
 assert.equal(plainInterval('every 24 months'),'Every 24 months');
 assert.equal(plainInterval('After break-in; Every race.'),'Every race');
 assert.equal(plainInterval('As required.'),'When needed');
});
test('duplicate jobs are found',()=>{assert.ok(sameJob('Service the fork','Service the fork.'));assert.ok(!sameJob('Service the fork','Service the shock'));});
