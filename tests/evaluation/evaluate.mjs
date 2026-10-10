#!/usr/bin/env node
import {readFileSync, writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {cases} from './cases.mjs';
const record=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const string=v=>typeof v==='string'&&v.trim().length>0;
const strings=v=>Array.isArray(v)&&v.every(string);
export function validateResponse(r) {
 const errors=[];
 if(!record(r))return ['response must be an object'];
 for(const key of ['summary'])if(!string(r[key]))errors.push(`${key} must be nonempty text`);
 for(const key of ['observations','systems','unknowns','evidence_ids'])if(!strings(r[key]))errors.push(`${key} must be a string array`);
 if(!Array.isArray(r.hypotheses)||!r.hypotheses.every(h=>record(h)&&['mechanism','explains','confirm','reject'].every(k=>string(h[k]))))errors.push('hypotheses schema invalid');
 // From prompt mx-engineering-7 an answer or setup reply may have no next step; a diagnosis must.
 const stepOptional=(r.kind==='answer'||r.kind==='setup')&&r.next_step===null;
 if(!stepOptional&&(!record(r.next_step)||!string(r.next_step.action)||!string(r.next_step.purpose)||!strings(r.next_step.stop_conditions)))errors.push('next_step schema invalid');
 if(r.kind!==undefined&&!['answer','setup','diagnosis'].includes(r.kind))errors.push('kind enum invalid');
 if((r.kind==='answer'||r.kind==='setup')&&!string(r.answer))errors.push('answer must be nonempty text for this kind');
 if(!Array.isArray(r.specifications)||!r.specifications.every(s=>record(s)&&string(s.claim_id)&&string(s.value)))errors.push('specifications schema invalid');
 if(!['LIMITED','SUPPORTED'].includes(r.confidence))errors.push('confidence enum invalid');
 return errors;
}
export function evaluate(input) {
 if(!record(input)||input.schema_version!==1||!Array.isArray(input.captures))throw Error('Expected schema_version: 1 and captures array');
 const known=new Set(cases.map(c=>c.id));
 const input_errors=[];
 for(const cap of input.captures)if(!record(cap)||!known.has(cap.case_id))input_errors.push('Unknown or malformed capture');
 const results=[];
 for(const test of cases)for(let turn=0;turn<test.turns.length;turn++){
  const matches=input.captures.filter(c=>record(c)&&c.case_id===test.id&&c.turn_index===turn);
  if(matches.length!==1){results.push({case_id:test.id,turn_index:turn,status:matches.length?'FAIL':'UNVERIFIED',deterministic_errors:matches.length?['duplicate capture']:[],missing:matches.length?[]:['capture']});continue;}
  const cap=matches[0], errors=validateResponse(cap.response), missing=[];
  if(cap.origin!=='live-api')missing.push('real API provenance');
  for(const key of ['request_id','captured_at','app_version','prompt_version','model'])if(!string(cap[key]))missing.push(key);
  if(string(cap.captured_at)&&Number.isNaN(Date.parse(cap.captured_at)))errors.push('invalid captured_at');
  if(cap.prompt!==test.turns[turn])errors.push('captured prompt differs from test');
  for(const key of ['manufacturer','model','model_year','variant','region'])if(cap.bike?.[key]!==test.bike[key])errors.push(`bike identity mismatch: ${key}`);
  if(!Array.isArray(cap.eligible_claims))missing.push('retrieval snapshot');
  const claims=Array.isArray(cap.eligible_claims)?cap.eligible_claims:[];
  const evidence=Array.isArray(cap.response?.evidence_ids)?cap.response.evidence_ids:[];
  const specs=Array.isArray(cap.response?.specifications)?cap.response.specifications:[];
  for(const id of new Set([...evidence,...specs.map(s=>s?.claim_id)])){
   const found=claims.filter(c=>record(c)&&c.id===id);
   if(found.length!==1){errors.push(`claim ${id}: absent or duplicate in eligible snapshot`);continue;}
   const claim=found[0];
   if(!['VERIFIED','REVIEWED'].includes(claim.status)||claim.has_conflict!==false)errors.push(`claim ${id}: not governed eligible evidence`);
   for(const key of ['manufacturer','model','model_year','variant','region'])if(claim[key]!==cap.bike?.[key])errors.push(`claim ${id}: applicability mismatch ${key}`);
   if(!string(claim.source_url)||!string(claim.source_locator))errors.push(`claim ${id}: missing source provenance`);
  }
  for(const spec of specs)if(!evidence.includes(spec?.claim_id))errors.push('specification claim missing from evidence_ids');
  const rubric=test.rubric.map(rule=>{
   const grade=cap.grades?.[rule.id];
   const valid=record(grade)&&['PASS','FAIL'].includes(grade.verdict)&&string(grade.reviewer)&&string(grade.rationale)&&string(grade.reviewed_at)&&!Number.isNaN(Date.parse(grade.reviewed_at))&&['human','externally-reviewed'].includes(grade.method);
   return {...rule,verdict:valid?grade.verdict:'UNVERIFIED',review:valid?grade:null};
  });
  // This is supplied reviewer attestation, not a claim that software verified engineering semantics.
  const failed=errors.length>0||rubric.some(r=>r.verdict==='FAIL');
  const pending=missing.length>0||rubric.some(r=>r.verdict==='UNVERIFIED');
  results.push({case_id:test.id,category:test.category,turn_index:turn,request_id:cap.request_id??null,status:failed?'FAIL':pending?'UNVERIFIED':'REVIEWED_PASS',deterministic_errors:errors,missing,rubric});
 }
 for(const cap of input.captures){const c=cases.find(c=>c.id===cap?.case_id);if(c&&(!Number.isInteger(cap.turn_index)||cap.turn_index<0||cap.turn_index>=c.turns.length))input_errors.push(`invalid turn index for ${c.id}`);}
 const summary={cases:cases.length,turns:results.length,reviewed_pass:results.filter(r=>r.status==='REVIEWED_PASS').length,fail:results.filter(r=>r.status==='FAIL').length,unverified:results.filter(r=>r.status==='UNVERIFIED').length};
 return {schema_version:1,generated_at:new Date().toISOString(),status:input_errors.length||summary.fail?'FAIL':summary.unverified?'UNVERIFIED':'REVIEWED_PASS',notice:'Schema and claim identity checks do not establish semantic correctness, source truth, live provenance authenticity, or public release readiness. Reviewed passes reflect supplied reviewer attestations.',summary,input_errors,results};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{
  const [, , inputPath,outputPath]=process.argv;
  if(!inputPath||!outputPath)throw Error('Usage: node tests/evaluation/evaluate.mjs captures.json report.json');
  const report=evaluate(JSON.parse(readFileSync(inputPath,'utf8')));
  writeFileSync(outputPath,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,...report.summary}));
  process.exitCode=report.status==='FAIL'?1:report.status==='UNVERIFIED'?2:0;
 }catch(error){console.error(error.message);process.exitCode=1;}
}
