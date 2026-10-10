import {readFileSync,writeFileSync} from 'node:fs';
import {loadExpansionBundles} from './expansion-bundles.ts';
const root='docs/research/expansion/';
const bundle=loadExpansionBundles();
const inventory=JSON.parse(readFileSync('docs/research/parts/inventory.json','utf8'));
const published=JSON.parse(readFileSync(root+'published-claims.json','utf8')).claims;
const match=(c:any,t:any)=>Object.entries(t).every(([k,v])=>c[k]===v);
const targets=inventory.targets.filter((t:any)=>t.target.manufacturer!=='KTM').map((t:any)=>{
 const claims=bundle.claims.filter((c:any)=>match(c,t.target));
 return {...t,reviewed_expansion_records:claims.length,published_expansion_records:published.filter((c:any)=>match(c,t.target)).length,named_torque_records:claims.filter((c:any)=>JSON.parse(c.evidence_record.source.reviewed_content).property==='torque').length,reviewed_field_assignments:inventory.parts.filter((p:any)=>match(p.target,t.target)).flatMap((p:any)=>p.specifications).filter((s:any)=>s.status==='VERIFIED').length};
});
const complete=targets.filter((t:any)=>t.inventory_complete).length;
const lines=['# Non-KTM expansion progress','',`Generated ${new Date().toISOString()}. ${targets.length} exact US-standard targets. ${bundle.claims.length} source-reviewed expansion records; ${published.length} recorded as database-published. ${complete} complete non-KTM catalog enumerations. No bike has complete engineering specification coverage. These counts are records, not unique mechanical concepts or installed-piece totals.`,'',
 '| Make | Model | Year | Parts captured | Catalog complete | Reviewed records | Published records | Named torques | Part field assignments |',
 '|---|---|---:|---:|---|---:|---:|---:|---:|',
 ...targets.map((t:any)=>`| ${t.target.manufacturer} | ${t.target.model} | ${t.target.model_year} | ${t.part_rows} | ${t.inventory_complete?'Yes':'No'} | ${t.reviewed_expansion_records} | ${t.published_expansion_records} | ${t.named_torque_records} | ${t.reviewed_field_assignments} |`),'',
 'The KTM benchmark is the reviewed 2025 450 SX-F only; other KTM targets were not already complete. Catalog alternatives, kits and WP shim selections inflate occurrence counts and cannot be used as installed totals. A named torque is not an approved assignment to every matching-diameter bolt. Partial dimensions leave dimensional coverage open.',
 '', 'Secondary sources: 29 attributed research records from Keefer, MX-Tech, Race Tech and Factory Connection; 16 eligible for narrowly scoped reference use. None is silently imported as an OEM specification. Claim-kind and installed-component retrieval gates are still required before runtime use.',
 '', 'Remaining gaps: complete catalog access for many Honda, Yamaha and Kawasaki targets; exact US market reconciliation for some GasGas/Husqvarna sources; remaining manuals and full procedure review; joint-to-occurrence torque mappings; internal suspension service procedures; wear limits, materials, replacement rules and interval evidence. See manufacturer REVIEW/REPORT files for exact source conflicts and access failures.',
 '', 'No paid KTM manual was purchased. No live AI, signed native build, store purchase flow or launch-readiness greenlight is implied by this research pass.',''];
writeFileSync(root+'COVERAGE.md',lines.join('\n'));
writeFileSync(root+'coverage.json',JSON.stringify({generated_at:new Date().toISOString(),bundle_sources:bundle.bundle_sources,targets},null,2)+'\n');
