import test from 'node:test';
import assert from 'node:assert/strict';
import {buildCoverage,normalizeResearch} from '../scripts/research-coverage.mjs';
const record={id:'a',make:'KTM',model:'450 SX-F',year:2025,variant:'standard',region:'US',source_url:'https://example.test/manual'};
test('coverage never inherits across year, market or special edition',()=>{
 const result=buildCoverage([record,{...record,id:'b',year:2024,region:'AU'},{...record,id:'c',variant:'Factory Edition'}]);
 assert.equal(result.length,60);
 const target=result.find(r=>r.make==='KTM'&&r.model==='450 SX-F'&&r.year===2025);
 assert.equal(target.us_standard_candidates,1);assert.equal(target.other_or_unresolved_scope_candidates,1);
 assert.equal(result.find(r=>r.make==='KTM'&&r.model==='450 SX-F'&&r.year===2026).research_candidates,0);
 assert.ok(result.every(r=>r.runtime_support==='NOT_ESTABLISHED_BY_RESEARCH'));
 assert.throws(()=>buildCoverage([record,record]),/Duplicate/);
});
test('research normalization fails closed on missing source, scope or runtime eligibility',()=>{
 const data={sources:[{id:'s',url:record.source_url}],candidates:[{...record,source_id:'s',statement:'Fixture fact',locator:'p1',runtime_eligible:false}]};
 assert.equal(normalizeResearch('fixture',data)[0].year,2025);
 assert.throws(()=>normalizeResearch('fixture',{...data,sources:[]}),/Incomplete/);
 assert.throws(()=>normalizeResearch('fixture',{...data,candidates:[{...data.candidates[0],year:null}]}),/Unresolved/);
 assert.throws(()=>normalizeResearch('fixture',{...data,runtime_eligible:true}),/eligibility/);
});
