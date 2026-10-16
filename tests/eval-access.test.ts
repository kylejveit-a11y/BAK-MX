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
