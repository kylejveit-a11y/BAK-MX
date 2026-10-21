import test from 'node:test';
import assert from 'node:assert/strict';
import {handleRequest} from '../server/app.ts';

test('test access: without a valid-looking token the route answers 404 before touching the database',async()=>{
 for(const auth of [undefined,'Bearer nope','Bearer bakeval_short','Basic bakeval_'+'a'.repeat(48)]){
  const res=await handleRequest(new Request('https://bakmx.test/api/eval/ask',{method:'POST',headers:auth?{authorization:auth}:{},body:'{}'}));
  assert.equal(res.status,404,String(auth));
 }
});
test('test access: the route is POST only',async()=>{
 const res=await handleRequest(new Request('https://bakmx.test/api/eval/ask',{method:'GET'}));
 assert.notEqual(res.status,200);
});

import {originalPath} from '../api/index.ts';
test('multi-segment API paths are recovered however the host passes them',()=>{
 assert.equal(originalPath('/api/index?__p=billing/price'),'/api/billing/price');
 assert.equal(originalPath('/api/index?__p=billing/price%2B'),'/api/billing/price');
 assert.equal(originalPath('/api/parts/catalog?bike_id=abc&__p=parts%2Fcatalog%20&a=parts&rest=catalog'),'/api/parts/catalog?bike_id=abc');
 assert.equal(originalPath('/api/index?__p=parts/catalog&bike_id=x'),'/api/parts/catalog?bike_id=x');
 assert.equal(originalPath('/api/index?a=mobile&rest=webhook'),'/api/mobile/webhook');
 assert.equal(originalPath('/api/index',"a=eval&rest=ask"),'/api/eval/ask');
 assert.equal(originalPath('/api/billing/price'),null);
});
