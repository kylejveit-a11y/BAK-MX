import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {adaptExpansionCatalog} from '../shared/expansion-inventory.ts';
import {applyTorqueMappings} from '../shared/part-specification-mappings.ts';
const capture=JSON.parse(readFileSync('docs/research/expansion/kawasaki/2025-kx450.json','utf8'));
test('catalog completeness requires exact manifest and every assembly row',()=>{
 const result=adaptExpansionCatalog(capture);assert.equal(result.catalog_complete,true);assert.equal(result.assemblies.length,54);assert.equal(result.parts.length,867);
 for(const alter of [(d:any)=>delete d.catalog_manifest,(d:any)=>d.parts.pop(),(d:any)=>d.catalog_scope_confirmed=false]){
  const d=structuredClone(capture);alter(d);assert.equal(adaptExpansionCatalog(d).catalog_complete,false);
 }
});
test('US manual scope cannot resolve catalog market or convert cart quantities',()=>{
 const d=structuredClone(capture);d.catalog_scope_confirmed=false;d.parts[0].quantity_basis='CART_DEFAULT';
 const r=adaptExpansionCatalog(d);assert.equal(r.parts[0].quantity,null);assert.equal(r.parts[0].scope_status,'PENDING');assert.equal(r.parts[0].identity_status,'CAPTURED');
});
test('reviewed torque cannot be attached to an unconfirmed catalog identity',()=>{
 const bundle=JSON.parse(readFileSync('docs/research/parts/ktm-approved-torques.json','utf8'));
 const parts=JSON.parse(readFileSync('docs/research/parts/normalized-captures.json','utf8')).parts;
 for(const p of parts)p.scope_status='PENDING';
 assert.throws(()=>applyTorqueMappings(parts,bundle));
});
test('GasGas head stages and spark plug range retain their different meanings',()=>{
 const bundle=JSON.parse(readFileSync('docs/research/expansion/approved-bundle.json','utf8'));
 const inventory=JSON.parse(readFileSync('docs/research/parts/normalized-captures.json','utf8'));
 const head=bundle.claims.find((c:any)=>c.evidence_record.review.approval_reference.includes('gasgas-450f-2025-torque-p158-t1-r7'));
 const plug=bundle.claims.find((c:any)=>c.evidence_record.review.approval_reference.includes('gasgas-450f-2025-torque-p158-t1-r11'));
 const h=JSON.parse(head.evidence_record.source.reviewed_content);const p=JSON.parse(plug.evidence_record.source.reviewed_content);
 assert.deepEqual(h.value,[10,30,50]);assert.match(h.conditions.join(' '),/ordered stages/);
 assert.deepEqual(p.value,[10,12]);assert.match(p.conditions.join(' '),/range/);
 const slot=inventory.parts.flatMap((r:any)=>r.specifications).find((s:any)=>s.claim_id===head.id);
 assert.equal(slot.value,'[10,30,50]');assert.match(slot.conditions.join(' '),/ordered stages/);
});
