import test from 'node:test';
import assert from 'node:assert/strict';
import {parseAppLink,pendingFrom} from '../src/appLinkParse.ts';

test('Siri links open the right screen',()=>{
  assert.deepEqual(parseAppLink('bakmx://ask?q=why%20does%20it%20bog'),{screen:'ask',question:'why does it bog'});
  assert.deepEqual(parseAppLink('bakmx://snap'),{screen:'snap'});
  assert.deepEqual(parseAppLink('bakmx://setup?note=2%20clicks%20softer%20rebound'),{screen:'setup',note:'2 clicks softer rebound'});
  assert.deepEqual(parseAppLink('bakmx://service'),{screen:'service'});
  assert.equal(parseAppLink('bakmx://auth?code=x'),null);
  assert.equal(parseAppLink('https://bakmx.com/ask'),null);
  assert.equal(parseAppLink('not a url'),null);
  assert.equal(parseAppLink('bakmx://ask?q='+'a'.repeat(5000)).question.length,2000);
});

test('pending links expire and ignore junk',()=>{
  const now=1_800_000_000_000;
  assert.equal(pendingFrom(JSON.stringify({url:'bakmx://snap',at:now-1000}),now),'bakmx://snap');
  assert.equal(pendingFrom(JSON.stringify({url:'bakmx://snap',at:now-11*60*1000}),now),null);
  assert.equal(pendingFrom('{bad',now),null);
  assert.equal(pendingFrom(42,now),null);
});
