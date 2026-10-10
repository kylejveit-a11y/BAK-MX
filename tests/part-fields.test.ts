import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validatePartInventory} from '../shared/parts-inventory.ts';
import {applyTorqueMappings} from '../shared/part-specification-mappings.ts';
const inv=JSON.parse(readFileSync('docs/research/parts/normalized-captures.json','utf8'));
const torques=JSON.parse(readFileSync('docs/research/parts/ktm-approved-torques.json','utf8'));
test('complete component identity separates a spark plug from its connector',()=>{
 const connector=inv.parts.find((p:any)=>p.assembly_id==='ktm-450-2025:official-39'&&p.callout==='12');
 assert.match(connector.description,/connector/i);
 assert.equal(connector.specifications.find((s:any)=>s.property==='torque').status,'UNKNOWN');
 const plug=inv.parts.find((p:any)=>p.assembly_id==='ktm-450-2025:official-39'&&p.callout==='13');
 assert.equal(plug.specifications.find((s:any)=>s.property==='torque').status,'VERIFIED');
 const bad=structuredClone(torques);bad.mappings[0].reviewed_catalog_description='Abbreviated stale label';
 assert.throws(()=>applyTorqueMappings(structuredClone(inv.parts),bad),/missing or stale/);
});
test('partial dimensions cannot close full specification coverage and N/A requires approved evidence',()=>{
 const coverage=validatePartInventory(inv.assemblies,inv.parts,inv.approved_claims);
 assert(coverage.every(a=>!a.specification_coverage_complete));
 const partial=inv.parts.flatMap((p:any)=>p.specifications).filter((s:any)=>s.coverage==='PARTIAL');assert(partial.length>0);
 const parts=structuredClone(inv.parts);const na=parts.flatMap((p:any)=>p.specifications).find((s:any)=>s.status==='NOT_APPLICABLE');assert(na?.claim_id);na.claim_id=null;
 assert.throws(()=>validatePartInventory(inv.assemblies,parts,inv.approved_claims));
});
test('same part number at steering head and axle keeps separate joint torques',()=>{
 const rows=inv.parts.filter((p:any)=>p.part_number==='A46009082000');
 const values=rows.map((p:any)=>p.specifications.find((s:any)=>s.property==='torque').value);
 assert(values.includes('12'));assert(values.includes('35'));
});
