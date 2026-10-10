import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

// Research bookkeeping only. Never imported by the application or evidence promotion path.
export const roster={Yamaha:['YZ250F','YZ450F'],Honda:['CRF250R','CRF450R'],Kawasaki:['KX250','KX450'],KTM:['250 SX-F','450 SX-F'],Husqvarna:['FC 250','FC 450'],GasGas:['MC 250F','MC 450F']};
export function normalizeResearch(name,data){
  const sources=new Map(Array.isArray(data.sources)?data.sources.map(s=>[s.id,s]):Object.entries(data.sources??{}));
  return (data.candidates??[]).map(c=>{
    const source=sources.get(c.source_id);
    if(!source?.url||!c.id||!c.statement||!c.locator)throw Error(`Incomplete research reference: ${name}:${c.id}`);
    const a=c.applicability??(c.make?c:source.applicability??source);
    const row={file:name,id:c.id,make:a.make??a.manufacturer,model:a.model,year:a.model_year??a.year,variant:a.variant??null,region:a.region??null,source_url:source.url,source_id:c.source_id,source_access:source.access??null,source_sha256:source.sha256??null,locator:c.locator};
    if(!roster[row.make]?.includes(row.model)||!Number.isInteger(row.year)||row.year<2022||row.year>2026)throw Error(`Unresolved target: ${name}:${c.id}`);
    if(c.runtime_eligible===true||data.runtime_eligible===true)throw Error('Research cannot confer runtime eligibility');
    return row;
  });
}
export function buildCoverage(records){
  if(new Set(records.map(r=>r.id)).size!==records.length)throw Error('Duplicate research candidate ID');
  return Object.entries(roster).flatMap(([make,models])=>models.flatMap(model=>[2022,2023,2024,2025,2026].map(year=>{
    const rows=records.filter(r=>r.make===make&&r.model===model&&r.year===year);
    const us=rows.filter(r=>r.region==='US'&&r.variant==='standard');
    return {make,model,year,identity_registered:true,research_candidates:rows.length,us_standard_candidates:us.length,other_or_unresolved_scope_candidates:rows.length-us.length,source_urls:[...new Set(rows.map(r=>r.source_url))].sort(),scope_labels:[...new Set(rows.map(r=>`${r.region??'UNKNOWN'} / ${r.variant??'UNKNOWN'}`))].sort(),runtime_support:'NOT_ESTABLISHED_BY_RESEARCH',candidate_ids:rows.map(r=>r.id),remaining_gates:['complete domain-specific source coverage','exact installed component and revision applicability','source content and conflict review','usage-rights review','governed promotion','live retrieval and answer qualification']};
  })));
}
export async function generateCoverage(){
  const names=['japanese-candidates.json','european-candidates.json','kawasaki-candidates.json','older-us-candidates.json','japan-manuals-sep13.json','europe-manuals-sep13.json','yamaha-service-pass.json','japan-service-pass.json','honda-latest-handbook-extracts.json','europe-service-pass.json'];
  const records=[];
  for(const name of names)records.push(...normalizeResearch(name,JSON.parse(await readFile(resolve('docs/research',name),'utf8'))));
  const targets=buildCoverage(records);
  const report={schema_version:1,scope:'OEM candidate inventory only; not a live database support report',files:names,total_candidates:records.length,targets_with_any_candidate:targets.filter(t=>t.research_candidates).length,targets_with_us_standard_candidate:targets.filter(t=>t.us_standard_candidates).length,targets,records};
  const md=['# OEM coverage ledger','',`Generated from ${names.length} research files: ${records.length} candidate facts across ${report.targets_with_any_candidate}/60 model-year targets. Only ${report.targets_with_us_standard_candidate}/60 have any exact US-standard candidate. Neither count establishes adequate coverage or production readiness.`,'','Each number counts candidate records, not verified specifications. Zero rows in this ledger imply a source-acquisition gap, not that the bike is unsupported by its manufacturer. Color-edition labels, other regions and Factory Editions are deliberately not silently normalized to US standard. Aftermarket research and discovery-only manual links are separate inventories.','', '| Make | Model | Year | US standard candidates | Other/unresolved scope | Sources |','|---|---|---:|---:|---:|---:|',...targets.map(t=>`| ${t.make} | ${t.model} | ${t.year} | ${t.us_standard_candidates} | ${t.other_or_unresolved_scope_candidates} | ${t.source_urls.length} |`),'','## Required evidence per marketed target','','Owner/service manual identity and revision; condition-specific fluids and clearances; fastener-specific torques and procedures; maintenance tasks and severity context; diagnostic codes, electrical/fuel tests and stop conditions; fork/shock identity and setup; gearing and chassis data; ECU/firmware and component applicability. No target is complete merely because one of these exists.','','Source URLs, exact scope labels and candidate IDs are retained in coverage-ledger.json. Research facts copied into the staging batch are not counted twice. Rebuild with `node scripts/research-coverage.mjs`.',''].join('\n');
  await writeFile('docs/research/coverage-ledger.json',JSON.stringify(report,null,2)+'\n');
  await writeFile('docs/research/COVERAGE.md',md);
  return {candidates:records.length,targets:targets.length,with_any_candidate:report.targets_with_any_candidate,with_us_standard_candidate:report.targets_with_us_standard_candidate};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)generateCoverage().then(r=>console.log(JSON.stringify(r))).catch(e=>{console.error(e.message);process.exitCode=1;});
