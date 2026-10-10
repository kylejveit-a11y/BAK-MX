import {readFileSync,writeFileSync} from 'node:fs';
const input=JSON.parse(readFileSync('docs/research/parts/normalized-captures.json','utf8'));
const bundle=JSON.parse(readFileSync('docs/research/parts/ktm-approved-torques.json','utf8'));
const groups=input.assemblies.filter((a:any)=>a.id.startsWith('ktm-450-2025:'));
const linked=new Set(bundle.mappings.map((m:any)=>m.claim_id));
const rows=groups.map((a:any)=>{
 const parts=input.parts.filter((p:any)=>p.assembly_id===a.id);
 const mapped=parts.filter((p:any)=>p.specifications.some((s:any)=>s.property==='torque'&&s.status==='VERIFIED'));
 return `| ${a.name} | ${parts.length} | ${mapped.length} | ${parts.length-mapped.length} |`;
});
writeFileSync('docs/research/parts/TORQUE_GAPS.md',[
 '# KTM torque mapping gaps — 2025 450 SX-F US','',
 `${bundle.claims.length} approved torque-table facts; ${linked.size} facts linked to ${bundle.mappings.length} catalog occurrences. Full torque coverage: INCOMPLETE.`,
 '', 'An unlinked catalog occurrence is not necessarily a missing bolt torque. This catalog includes seals, shims, kits, alternatives and duplicate illustrations of the same installed component. Torque applicability itself still needs review for many rows. No completion percentage is asserted.',
 '', '| Assembly | Catalog occurrences | Torque-linked occurrences | Unlinked / applicability pending |','|---|---:|---:|---:|',...rows,
 '', 'Remaining work: resolve each unlinked fastener function from complete OEM labels and diagrams; match the exact joint and thread treatment; review procedure sequence and replacement requirements. Generic manufacturer fallback torques remain barred from automatic thread-size mapping. Internal suspension assemblies and supplied subassemblies may require component repair documentation.',
 '', 'The owner manual establishes torque-table values, not complete overhaul procedures. The official repair-manual preview provides a contents locator for engine torques (printed371) but did not expose the body. No purchase was made. Conflicting or incomplete mappings are recorded in ktm-450-2025-engine-torque-facts.json.',
 '', 'The remaining59 model-year targets have not passed this KTM completion gate. KTM values must not be inherited by a related bike or year.', ''
].join('\n'));
