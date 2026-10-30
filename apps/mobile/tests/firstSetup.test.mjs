import test from 'node:test';
import assert from 'node:assert/strict';
import {needsFirstSetup,firstSetupQuestion} from '../src/firstSetup.ts';
const bike={id:'b',manufacturer:'KTM',model:'450 SX-F',model_year:2025,configuration:{}};
test('first setup is offered until weight, level and kind of riding are on the bike',()=>{
 assert.equal(needsFirstSetup(bike),true);
 assert.equal(needsFirstSetup({...bike,configuration:{geared_weight_lb:'215',skill_level:'Vet'}}),true);
 assert.equal(needsFirstSetup({...bike,configuration:{geared_weight_lb:'215',skill_level:'Vet',discipline:'Motocross'}}),false);
 assert.equal(needsFirstSetup(undefined),false);
});
test('the question names the bike, the rider and asks for published settings',()=>{
 const q=firstSetupQuestion(bike,{weight:'215',level:'Vet',discipline:'Motocross',dirt:'Sand'});
 assert.match(q,/2025 KTM 450 SX-F/);assert.match(q,/215 lb in gear/);assert.match(q,/vet rider/);assert.match(q,/on sand dirt/);assert.match(q,/published settings/);
 assert.doesNotMatch(firstSetupQuestion(bike,{weight:'180',level:'Novice',discipline:'Trail',dirt:''}),/dirt/);
});
