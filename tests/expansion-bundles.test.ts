import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {mergeExpansionBundles,loadExpansionBundles} from '../scripts/expansion-bundles.ts';
const empty=()=>({claims:[],catalogs:[],mappings:[],torque_mappings:[],excluded:[]});
test('cumulative evidence replay deduplicates identical IDs and rejects changed evidence',()=>{
 const a={...empty(),claims:[{id:'one',statement:'original'}]};
 assert.equal(mergeExpansionBundles([a,structuredClone(a)]).claims.length,1);
 assert.throws(()=>mergeExpansionBundles([a,{...empty(),claims:[{id:'one',statement:'changed'}]}]),/Conflicting expansion claims/);
});
test('cumulative mappings reject competing values for the same physical occurrence',()=>{
 const m={assembly_id:'group',callout:'1',part_number:'part',property:'dimensions',field_key:'catalog_explicit_notation',claim_id:'one',value:'M8'};
 const a={...empty(),claims:[{id:'one'}],mappings:[m]};
 assert.equal(mergeExpansionBundles([a,a]).mappings.length,1);
 assert.throws(()=>mergeExpansionBundles([a,{...empty(),mappings:[{...m,value:'M10'}]}]),/Conflicting expansion mappings/);
 assert.throws(()=>mergeExpansionBundles([{...empty(),mappings:[m]}]),/Unbound expansion mapping/);
});
test('bundle loading binds exact bytes and MX project identity',()=>{
 const dir=mkdtempSync(join(tmpdir(),'bakmx-bundle-test-'));
 try {
  const bytes=JSON.stringify(empty());writeFileSync(join(dir,'wave.json'),bytes);
  const manifest={project_ref:'yzvrujffiktfserrgkcb',bundles:[{file:'wave.json',sha256:createHash('sha256').update(bytes).digest('hex')}]};
  const path=join(dir,'manifest.json');writeFileSync(path,JSON.stringify(manifest));
  assert.equal(loadExpansionBundles(path).claims.length,0);
  writeFileSync(join(dir,'wave.json'),bytes+' ');assert.throws(()=>loadExpansionBundles(path),/bundle changed/);
  writeFileSync(path,JSON.stringify({...manifest,project_ref:'another-project'}));assert.throws(()=>loadExpansionBundles(path),/Invalid MX/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
