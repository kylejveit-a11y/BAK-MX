import {readFileSync,writeFileSync} from 'node:fs';
const dir='docs/research/parts/';
const links=JSON.parse(readFileSync(dir+'ktm-450-2025-official-links.json','utf8'));
const groups:any[]=[];
for(const lane of ['a','b','root']){
 const d=JSON.parse(readFileSync(dir+`ktm-450-2025-lane-${lane}-official.json`,'utf8'));
 if(d.groups)groups.push(...d.groups);
 else if(lane==='b'&&d.assemblies?.length===14){
  groups.push(...d.assemblies.map((a:any)=>({index:links.findIndex((l:any)=>'https://sparepartsfinder.ktm.com'+l.href===a.source_url),name:a.assembly_name,url:a.source_url,
   table_complete:a.table_complete,table_row_count:a.table_row_count,diagram_part_numbers:a.points.map((p:any)=>p.part_number),
   parts:a.rows.map((p:any)=>({...p,description:p.description??a.description_labels?.[p.description_ref],catalog_quantity:Number(p.quantity),quantity:Number(p.quantity)>0?Number(p.quantity):null}))})));
 }else throw Error(`Official lane ${lane} not finalized`);
}
groups.sort((a,b)=>a.index-b.index);
if(groups.length!==42||new Set(groups.map(g=>g.index)).size!==42)throw Error('All 42 exact official groups required');
const parts:any[]=[];const assemblies:any[]=[];const duplicate_source_rows:any[]=[];
for(const g of groups){
 if(g.url!=='https://sparepartsfinder.ktm.com'+links[g.index].href)throw Error('Official source mismatch');
 const tableComplete=g.table_complete===true||g.table_status==='ALL_RENDERED_ROWS_ACQUIRED';
 if(!tableComplete||(g.table_row_count!==undefined&&g.table_row_count!==g.parts.length)||!g.parts.length)throw Error('Table enumeration incomplete');
 if(!Array.isArray(g.diagram_part_numbers))throw Error('Diagram reconciliation missing');
 const known=new Set(g.parts.flatMap((p:any)=>[p.part_number,p.non_orderable_reference].filter(Boolean)));
 const unmatched=[...new Set(g.diagram_part_numbers)].filter(p=>!known.has(p));
 if(unmatched.length)throw Error(`Unmatched diagram references in ${g.index}: ${unmatched.join(',')}`);
 const id=`official-${g.index}`;
 const unique=new Map<string,any>();
 for(const [rowIndex,p] of g.parts.entries()){
  const key=JSON.stringify([p.callout,p.part_number]);const prior=unique.get(key);
  if(prior){if(prior.catalog_quantity!==p.catalog_quantity||prior.description!==p.description||prior.specification!==p.specification)throw Error('Conflicting duplicate OEM row');duplicate_source_rows.push({assembly_id:id,source_url:g.url,source_row:rowIndex+1,callout:p.callout,part_number:p.part_number,reason:'Identical repeated source row; preserved here, counted once as a distinct occurrence'});}
  else unique.set(key,p);
 }
 const displayName=g.name.replaceAll('\\t','\t');
 assemblies.push({assembly_id:id,assembly_name:displayName.split('\t')[1]??displayName,source_url:g.url,raw_table_rows:g.parts.length,expected_occurrences:unique.size,enumeration_checked:true,diagram_reference_check:'ALL_REFERENCES_ACCOUNTED_FOR'});
 for(const p of unique.values()){
  if(!Number.isInteger(p.catalog_quantity)||p.catalog_quantity<0)throw Error('Invalid OEM quantity');
  const qty=p.catalog_quantity>0&&!p.optional? p.catalog_quantity:null;
  parts.push({...p,assembly_id:id,quantity:qty,quantity_basis:'OEM assembly catalog; alternatives and nested assemblies must not be summed as a whole-bike BOM',source_url:g.url,locator:`US F8475Y5; catalog callout ${p.callout}`,status:'OEM_CATALOG_REVIEWED'});
 }
}
const data={schema_version:2,research_date:'2026-09-13',bike:{make:'KTM',model:'450 SX-F',year:2025,edition:'standard',target_market:'US',model_code:'F8475Y5',model_identifier:'1003417574'},authority:'OEM',scope_confirmed:true,catalog_enumeration_complete:true,full_specification_coverage:false,
 catalog_manifest:{source_url:'https://sparepartsfinder.ktm.com/Result/ExecuteSearch?modelIdentification=1003417574&isEngine=False',engine_source_url:'https://sparepartsfinder.ktm.com/Result/ExecuteSearch?modelIdentification=1003417574&isEngine=True',expected_assembly_ids:assemblies.map(a=>a.assembly_id),review:'All 23 chassis and 19 engine groups acquired; per-group table counts and diagram references reconciled'},
 counts:{assemblies:assemblies.length,part_rows:parts.length,raw_table_rows:groups.reduce((n,g)=>n+g.parts.length,0),duplicate_source_rows:duplicate_source_rows.length},assemblies,parts,duplicate_source_rows,limitations:['Catalog completeness does not establish every engineering specification.','Source quantities describe catalog rows, including nested assemblies and options; not summed installed totals.','Abbreviated labels are not complete technical descriptions.','No retail supersession automatically overrides official model-specific identity.']};
writeFileSync(dir+'ktm-450-2025.json',JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify(data.counts));
