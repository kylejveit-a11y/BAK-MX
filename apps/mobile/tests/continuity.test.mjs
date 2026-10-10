import test from 'node:test';
import assert from 'node:assert/strict';
import {bikeScope,createRequestGate,selectedBikeId,validServiceDate,retryRequest,appendWorkshopContext} from '../src/continuity.ts';

test('late refresh cannot replace newer conversation history',()=>{
  const gate=createRequestGate();
  const slow=gate.begin(),fast=gate.begin();
  assert.equal(gate.accepts(fast),true);
  assert.equal(gate.accepts(slow),false);
});
test('workshop prefill preserves unsent text and does not duplicate a context on remount',()=>{
 const draft='My existing question',context='Valve inspection: I measured intake clearance.';
 const merged=appendWorkshopContext(draft,context);
 assert.equal(merged,draft+'\n\n'+context);
 assert.equal(appendWorkshopContext(merged,context),merged);
 assert.equal(appendWorkshopContext('',context),context);
 const long='x'.repeat(7999);assert.equal(appendWorkshopContext(long,context),long+'\n\n'+context);
});

test('restored bike selection survives reload, but never selects a deleted or other-account bike',()=>{
 const bikes=[{id:'first'},{id:'second'}];
 assert.equal(selectedBikeId(bikes,'second'),'second');
 assert.equal(selectedBikeId(bikes,'other-account-bike'),'first');
 assert.equal(selectedBikeId([],'second'),'');
});

test('service dates reject impossible calendar values and accept leap days only in leap years',()=>{
 for(const date of ['2025-02-29','2026-04-31','2026-13-01','not-a-date','2026-1-01'])assert.equal(validServiceDate(date),false,date);
 for(const date of ['2024-02-29','2026-09-13'])assert.equal(validServiceDate(date),true,date);
});

test('a retry restored after restart reuses its request ID only for the exact same conversation and text',()=>{
 const previous=JSON.parse(JSON.stringify({id:'original',text:'Rear kicks',conversation:'bike-a-thread'}));
 assert.equal(retryRequest(previous,'Rear kicks','bike-a-thread',()=>{throw Error('must not mint another ID');}).id,'original');
 assert.equal(retryRequest(previous,'Front washes','bike-a-thread',()=> 'new-text').id,'new-text');
 assert.equal(retryRequest(previous,'Rear kicks','bike-b-thread',()=> 'new-bike').id,'new-bike');
});
test('selection changes and sends invalidate requests already in flight',()=>{
  const gate=createRequestGate(),ticket=gate.begin();
  gate.invalidate();
  assert.equal(gate.accepts(ticket),false);
  assert.equal(gate.accepts(gate.begin()),true);
});
test('bike scope changes for bike, model year, region and component edits',()=>{
  const bike={id:'one',updated_at:'revision1',manufacturer:'Yamaha',model:'YZ450F',model_year:2025,variant:'Standard',region:'US',configuration:{}};
  for(const edit of [{id:'two'},{model_year:2026},{region:'EU'},{variant:'Special'},{configuration:{exhaust:'modified'}},{updated_at:'revision2'}])assert.notEqual(bikeScope(bike),bikeScope({...bike,...edit}));
  assert.notEqual(bikeScope(bike),bikeScope(undefined));
  assert.equal(bikeScope({...bike}),bikeScope(bike));
});
