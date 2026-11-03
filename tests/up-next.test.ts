import test from 'node:test';
import assert from 'node:assert/strict';
import {upNext} from '../shared/service-plan.ts';
import {typeOf} from '../shared/part-types.ts';
const plan=[{category:'Valve check',every_hours:30,first_hours:null,task:'',claim_id:'a',note:null},{category:'Engine oil',every_hours:15,first_hours:null,task:'',claim_id:'b',note:null},{category:'Air filter',every_hours:5,first_hours:null,task:'',claim_id:'c',note:null}];
test('Coming up lists a maker job that is due now, not only the rider\'s reminders',()=>{
 const events=[{category:'Engine oil',engine_hours:58,next_due_hours:73},{category:'Air filter',engine_hours:63,next_due_hours:null}];
 const list=upNext(plan,events,64);
 assert.equal(list[0].category,'Valve check');assert.ok((list[0].left??1)<=0,'valve check is due now');
 assert.ok(list.some(r=>r.category==='Engine oil'&&r.left===9));
 assert.equal(list.filter(r=>r.category==='Engine oil').length,1,'one line per job');
});
test('Fork list holds forks and kits, not guards, seals tools or oil filters',()=>{
 for(const n of ['Upper Fork Guards','Z Mud Fork Gaters','Fork Bleeders For Showa / KYB / WP Forks','Cartridge Oil Filter','Fork airpump','Fork Support'])assert.notEqual(typeOf('suspension',n),'Fork (cartridge, conversion, kit)',n);
 for(const n of ['XACT PRO 7548 Cone Valve Fork','Factory Kit coil-spring fork','MXT Blackjack Cartridge System'])assert.equal(typeOf('suspension',n),'Fork (cartridge, conversion, kit)',n);
 assert.equal(typeOf('suspension','WP SUSPENSION FLUID SAE 4'),'Fork and shock oil');
});
import {coachingExtrasFor} from '../shared/riding-coach-pass5.ts';
test('A coaching question brings the extra drills and faults for its skills, and only those',()=>{
 const x=coachingExtrasFor('I keep casing the double and my son struggles in ruts');
 assert.ok(x.jumps&&x.cornering_ruts);assert.ok(Object.keys(x).length<=3);
 assert.deepEqual(coachingExtrasFor('what oil does my bike take'),{});
});
