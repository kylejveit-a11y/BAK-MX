import test from 'node:test';
import assert from 'node:assert/strict';
import {PREP_ITEMS,defaultPrepList,hydratePrepList,toSaved,RACE_PHASES} from '../shared/race-prep.ts';
import {raceChecklistSchema} from '../server/rider-surfaces.ts';

test('BAK prep list: unique ids, every phase filled, fits what the server accepts',()=>{
 assert.equal(new Set(PREP_ITEMS.map(i=>i.id)).size,PREP_ITEMS.length);
 for(const p of RACE_PHASES)assert.ok(PREP_ITEMS.filter(i=>i.phase===p.id).length>=8,p.id);
 for(const d of ['mx','offroad'] as const)assert.ok(raceChecklistSchema.safeParse({items:toSaved(defaultPrepList(d))}).success,d);
 assert.ok(!defaultPrepList('mx').some(i=>i.discipline==='offroad'));
 assert.ok(!defaultPrepList('offroad').some(i=>i.discipline==='mx'));
});
test('a saved list keeps the rider\'s own items and order, and BAK\'s why on the items they kept',()=>{
 const first=PREP_ITEMS[0];
 const saved=[{id:'own-1',label:'Pack the kids\' bikes',phase:'night' as const,custom:true},{id:first.id,label:first.label,phase:first.phase}];
 const list=hydratePrepList(saved,'mx');
 assert.deepEqual(list.map(i=>i.id),['own-1',first.id]);assert.equal(list[1].why,first.why);assert.equal(list[0].why,undefined);
 assert.equal(hydratePrepList(null,'mx').length,defaultPrepList('mx').length);
});

import {fitsEngine,phaseForDaysOut} from '../shared/race-prep.ts';
test('prep items for the other engine type are hidden, custom items always show',()=>{
 const premix=PREP_ITEMS.find(i=>i.id==='night-fuel-can-right-premix-ratio')!,fresh=PREP_ITEMS.find(i=>i.id==='night-fuel-can-fresh-fuel')!;
 assert.equal(fitsEngine(premix,'4-stroke'),false);assert.equal(fitsEngine(premix,'2-stroke'),true);
 assert.equal(fitsEngine(fresh,'2-stroke'),false);assert.equal(fitsEngine(fresh,'4-stroke'),true);
 assert.equal(fitsEngine(premix,null),true);
 assert.equal(fitsEngine({id:'x',custom:true},'4-stroke'),true);
});
test('the prep phase follows the days to go',()=>{
 assert.equal(phaseForDaysOut(5),'week');assert.equal(phaseForDaysOut(2),'week');assert.equal(phaseForDaysOut(1),'night');assert.equal(phaseForDaysOut(0),'track');
});
