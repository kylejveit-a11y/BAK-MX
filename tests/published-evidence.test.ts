import test from 'node:test';
import assert from 'node:assert/strict';
import {responseSchema,responseViolations} from '../server/engineering.ts';
import type {Claim} from '../shared/types.ts';

const id='11111111-1111-4111-8111-111111111111';
const claim:Claim={id,manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US',domain:'service',statement:'Example reviewed value.',source_url:'https://example.com/manual',source_locator:'p. 1',status:'VERIFIED',has_conflict:false};
const base={
 kind:'answer',summary:'Answer',answer:'Answer',setup_changes:[],observations:[],systems:[],hypotheses:[],unknowns:[],next_step:null,
 evidence_ids:[],specifications:[],claims:[{claim:'Example reviewed value.',tier:'PUBLISHED',evidence_ids:[id]}],data_gaps:[],confidence:'LIMITED'
};
test('published claim must also appear in answer-level evidence references',()=>{
 const parsed=responseSchema.parse(base);
 assert.match(responseViolations(parsed,[claim]).join(' '),/omitted from the answer-level evidence list/);
});
test('published claim with answer-level reference is accepted',()=>{
 const parsed=responseSchema.parse({...base,evidence_ids:[id],confidence:'SUPPORTED'});
 assert.deepEqual(responseViolations(parsed,[claim]),[]);
});
test('conflicted source is never accepted as a published reference',()=>{
 const parsed=responseSchema.parse({...base,evidence_ids:[id],confidence:'SUPPORTED'});
 assert.notDeepEqual(responseViolations(parsed,[{...claim,has_conflict:true}]),[]);
});
