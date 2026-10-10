import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {applyTorqueMappings} from '../shared/part-specification-mappings.ts';
import {validatePartInventory} from '../shared/parts-inventory.ts';
const bundle=JSON.parse(readFileSync('docs/research/parts/ktm-approved-torques.json','utf8'));
const inventory=JSON.parse(readFileSync('docs/research/parts/normalized-captures.json','utf8'));
test('reviewed torque mappings retain exact occurrence, scope and preparation',()=>{
 const parts=structuredClone(inventory.parts);const claims=applyTorqueMappings(parts,bundle);
 assert.equal(parts.filter((p:any)=>p.target.manufacturer==='KTM').flatMap((p:any)=>p.specifications).filter((s:any)=>s.property==='torque'&&s.status==='VERIFIED').length,bundle.mappings.length);
 assert.doesNotThrow(()=>validatePartInventory(inventory.assemblies,parts,inventory.approved_claims));
 for(const mutate of [(b:any)=>b.mappings[0].value='999',(b:any)=>b.mappings[2].conditions=[],(b:any)=>b.mappings[0].assembly_id='wrong',(b:any)=>b.claims[0].model_year=2024]){
  const altered=structuredClone(bundle);mutate(altered);assert.throws(()=>applyTorqueMappings(structuredClone(inventory.parts),altered));
 }
});
test('head bolt stages and water-pump treatment distinctions survive extraction',()=>{
 const data=JSON.parse(readFileSync('docs/research/parts/ktm-450-2025-engine-torque-facts.json','utf8'));
 const head=data.facts.find((f:any)=>f.id==='engine-52');assert.deepEqual(head.stages.map((s:any)=>s.torque_nm),[10,30,50]);
 const byId=(id:string)=>data.facts.find((f:any)=>f.id===id);
 assert.match(JSON.stringify(byId('engine-17').conditions),/222/);
 assert.match(JSON.stringify(byId('engine-39').conditions),/243/);
});
