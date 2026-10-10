import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluate,validateResponse} from './evaluate.mjs';
import {cases} from './cases.mjs';
const response={summary:'Test-only schema fixture.',observations:[],systems:[],hypotheses:[],unknowns:[],next_step:{action:'Test fixture',purpose:'Schema test',stop_conditions:[]},evidence_ids:[],specifications:[],confidence:'LIMITED'};
const capture=()=>({case_id:cases[0].id,turn_index:0,prompt:cases[0].turns[0],bike:cases[0].bike,response,origin:'live-api',request_id:'fixture',captured_at:'2026-09-12T00:00:00Z',app_version:'fixture',prompt_version:'fixture',model:'fixture',eligible_claims:[]});
test('empty captures cannot pass',()=>{const r=evaluate({schema_version:1,captures:[]});assert.equal(r.status,'UNVERIFIED');assert.equal(r.summary.turns,cases.reduce((n,c)=>n+c.turns.length,0));});
test('schema validity alone cannot grade semantics',()=>{assert.deepEqual(validateResponse(response),[]);const r=evaluate({schema_version:1,captures:[capture()]});assert.equal(r.results[0].status,'UNVERIFIED');assert.ok(r.results[0].rubric.every(g=>g.verdict==='UNVERIFIED'));});
test('unknown claims block',()=>{const c=capture();c.response={...response,evidence_ids:['missing']};assert.equal(evaluate({schema_version:1,captures:[c]}).results[0].status,'FAIL');});
test('duplicate captures block',()=>{assert.equal(evaluate({schema_version:1,captures:[capture(),capture()]}).results[0].status,'FAIL');});
test('unreviewed automated grade never promotes',()=>{const c=capture();c.grades=Object.fromEntries(cases[0].rubric.map(g=>[g.id,{verdict:'PASS',reviewer:'model',rationale:'Looks good',reviewed_at:'2026-09-12',method:'automatic'}]));assert.equal(evaluate({schema_version:1,captures:[c]}).results[0].status,'UNVERIFIED');});
test('wrong year evidence blocks',()=>{const c=capture();c.response={...response,evidence_ids:['x']};c.eligible_claims=[{...c.bike,id:'x',model_year:2026,status:'VERIFIED',has_conflict:false,source_url:'https://example.com',source_locator:'test'}];assert.equal(evaluate({schema_version:1,captures:[c]}).results[0].status,'FAIL');});
test('answer and setup replies may omit the next step; a diagnosis may not',()=>{
 assert.deepEqual(validateResponse({...response,kind:'answer',answer:'High-speed compression meters fast shaft movement.',setup_changes:[],next_step:null}),[]);
 assert.ok(validateResponse({...response,kind:'diagnosis',answer:'',setup_changes:[],next_step:null}).includes('next_step schema invalid'));
 assert.ok(validateResponse({...response,kind:'answer',answer:'',setup_changes:[],next_step:null}).some(e=>e.includes('answer must be nonempty')));
 assert.ok(validateResponse({...response,kind:'chat'}).includes('kind enum invalid'));
});
