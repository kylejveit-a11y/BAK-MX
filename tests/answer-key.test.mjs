import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('answer key entries are well formed and ids are unique',()=>{
 const key=JSON.parse(readFileSync('docs/answer-key/questions.json','utf8'));
 assert.equal(key.schema_version,1);
 const ids=new Set();
 for(const q of key.questions){
  assert.match(q.id,/^[a-z]+-\d{3}$/);assert.ok(!ids.has(q.id),'duplicate id '+q.id);ids.add(q.id);
  assert.match(q.bike,/^\d{4} \S+ .+/);assert.ok(q.ask.trim().length>0);
  assert.ok(['answer','setup','diagnosis'].includes(q.kind));assert.ok(['published','none','unknown'].includes(q.numbers));
  assert.ok(Array.isArray(q.must)&&Array.isArray(q.must_not));assert.ok(q.why.trim().length>0);
 }
});
