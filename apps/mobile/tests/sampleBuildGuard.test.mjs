import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const eas=JSON.parse(readFileSync(new URL('../eas.json',import.meta.url),'utf8'));

test('store builds never carry sample mode',()=>{
 for(const [name,profile] of Object.entries(eas.build)){
  if(name.startsWith('android-sample'))continue;
  const env=profile.env??{};
  assert.equal(env.EXPO_PUBLIC_SAMPLE_BUILD,undefined,`${name} must not set EXPO_PUBLIC_SAMPLE_BUILD`);
  assert.equal(env.EXPO_PUBLIC_SAMPLE_MODE,undefined,`${name} must not set EXPO_PUBLIC_SAMPLE_MODE`);
 }
 const sample=eas.build['android-sample'];
 assert.equal(sample.distribution,'internal');assert.equal(sample.autoSubmit,undefined);
});
