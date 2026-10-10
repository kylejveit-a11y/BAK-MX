import test from 'node:test';
import assert from 'node:assert/strict';
import {aiAccessMode} from '../server/ai-access.ts';

test('beta access is explicit and subscription access remains available',()=>{
  assert.equal(aiAccessMode('beta'),'beta');
  assert.equal(aiAccessMode('subscription'),'subscription');
});

test('invalid access configuration cannot silently enable beta access',()=>{
  for(const value of ['', 'production', 'Subscription']) {
    assert.throws(()=>aiAccessMode(value),{status:503});
  }
});
