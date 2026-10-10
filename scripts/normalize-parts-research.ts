// Research adapters only. No guessed specifications and no database writes.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {validatePartInventory,type PartOccurrence,type PartsAssembly} from '../shared/parts-inventory.ts';
import {applyPartFieldMappings} from '../shared/part-field-mappings.ts';
import {applyTorqueMappings} from '../shared/part-specification-mappings.ts';
import {adaptExpansionCatalog} from '../shared/expansion-inventory.ts';
import {loadExpansionBundles} from './expansion-bundles.ts';
const names=['ktm-450-2025','yamaha-250-2024','honda-250-2025','kawasaki-450-2025','husqvarna-450-2025','gasgas-450-2025'];
const assemblies:PartsAssembly[]=[];const parts:PartOccurrence[]=[];
const catalog_manifests:any[]=[];
const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
for(const name of names){
 const path=`docs/research/parts/${name}.json`;if(!existsSync(path))throw Error(`Missing acquisition file ${path}`);
 const d=JSON.parse(readFileSync(path,'utf8'));const b=d.target??d.bike;
 const target={manufacturer:b.manufacturer??b.make,model:b.model,model_year:b.model_year??b.year,variant:b.variant??b.edition??'standard',region:'US'};
 const scopeStatus=d.authority==='OEM'&&d.scope_confirmed===true?'CONFIRMED':'PENDING';
 if(d.catalog_manifest)catalog_manifests.push({target,...d.catalog_manifest,expected_assembly_ids:d.catalog_manifest.expected_assembly_ids.map((id:string)=>`${name}:${id}`),reviewed:d.catalog_enumeration_complete===true});
 const sources=new Map<string,any>((d.sources??[]).map((s:any)=>[s.id??s.source_id,s]));
 const assemblyNames=new Map<string,string>();
 const allAssemblies=[...d.assemblies,...(d.catalog_index??[]).filter((a:any)=>!d.assemblies.some((b:any)=>b.name===a.name))];
 for(const a of allAssemblies){
  const local=a.id??a.assembly_id??slug(a.name);const id=`${name}:${local}`;const title=a.name??a.assembly_name;
  assemblyNames.set(local,id);assemblyNames.set(title,id);
  const src=sources.get(a.source_id??a.inventory_source_id);
  const url=a.source_url??a.indexSourceURL??src?.url??d.catalog?.url;
  const reviewed=scopeStatus==='CONFIRMED'&&a.enumeration_checked===true;
  assemblies.push({id,target,scope_status:scopeStatus,name:title,catalog_evidence:{url,locator:`Assembly catalog index; acquisition file ${name}.json`},expected_occurrences:reviewed?a.expected_occurrences:null,enumeration_checked:reviewed,enumeration_review:reviewed?{url,locator:'Official model-specific table count and all diagram-linked part numbers reconciled'}:null});
 }
 for(const [i,p] of d.parts.entries()){
  const assembly_id=assemblyNames.get(p.assembly_id??p.assembly);if(!assembly_id)throw Error(`Unmapped assembly in ${name} row ${i}`);
  const src=sources.get(p.source_id);const url=p.source_url??p.sourceURL??src?.url;
  const description=p.description;const callout=String(p.callout);
  const evidence={url,locator:`${p.locator??'Part table callout '+callout}; ${p.evidenceStatus??p.status??'captured research; exact market and identity review pending'}; ${name}.json row ${i+1}`};
  const conflict=(d.conflicts??[]).some((c:any)=>c.assembly===p.assembly&&c.callout===callout);
  const rawPrevious=p.supersedes;const previous=typeof rawPrevious==='string'?rawPrevious:Array.isArray(rawPrevious)&&rawPrevious.length===1?rawPrevious[0]:null;
  const quantity=typeof p.quantity==='number'&&!/suggested/i.test(p.quantity_basis??p.quantityBasis??'')?p.quantity:null;
  parts.push({id:`${name}:row-${i+1}`,target,scope_status:scopeStatus,assembly_id,callout,alternative_key:p.non_orderable_reference??p.part_number??p.partNumber??`row-${i+1}`,part_number:p.part_number==='SPNO'?null:p.part_number??p.partNumber??null,description,quantity,catalog_quantity:p.catalog_quantity??null,non_orderable_reference:p.non_orderable_reference??null,
   quantity_evidence:quantity===null?null:{url,locator:`Callout ${callout}: ${p.quantityBasis??'explicit catalog quantity; captured, pending independent review'}`},catalog_evidence:evidence,
   identity_status:conflict?'CONFLICTED':scopeStatus==='CONFIRMED'?'REVIEWED':'CAPTURED',kind:p.is_fastener===true||/\b(bolt|screw|nut|washer|stud)\b/i.test(description)?'FASTENER':'UNKNOWN',supersedes_part_number:typeof previous==='string'?previous:null,supersession_evidence:typeof previous==='string'?evidence:null,
   specifications:(['torque','dimensions','material_grade','clearance_wear_limit','installation','replacement_rule','service_interval'] as const).map(property=>({property,status:'UNKNOWN',value:null,unit:null,conditions:[],claim_id:null,evidence:null,review_note:'Requirement applicability and exact-installation evidence still need review; do not infer from catalog description.'}))});
 }
}
const torqueBundle=JSON.parse(readFileSync('docs/research/parts/ktm-approved-torques.json','utf8'));
const fieldBundle=JSON.parse(readFileSync('docs/research/parts/ktm-approved-fields.json','utf8'));
const fieldClaims=applyPartFieldMappings(parts,fieldBundle);
const approvedClaims=[...applyTorqueMappings(parts,torqueBundle),...fieldClaims];
const expansion=loadExpansionBundles();
{
 approvedClaims.push(...expansion.claims);
 for(const entry of expansion.catalogs){
  const adapted=adaptExpansionCatalog(entry.data);if(!adapted.parts.length)continue;
  const matches=(t:any)=>Object.entries(adapted.target).every(([k,v])=>t[k]===v);
  const old=parts.filter(p=>matches(p.target));
  // A partial capture cannot displace a larger existing capture. Both source files remain archived.
  if(old.length&&(!adapted.catalog_complete||adapted.parts.length<old.length))continue;
  for(let i=parts.length-1;i>=0;i--)if(matches(parts[i].target))parts.splice(i,1);
  for(let i=assemblies.length-1;i>=0;i--)if(matches(assemblies[i].target))assemblies.splice(i,1);
  for(let i=catalog_manifests.length-1;i>=0;i--)if(matches(catalog_manifests[i].target))catalog_manifests.splice(i,1);
  assemblies.push(...adapted.assemblies);parts.push(...adapted.parts);
  if(adapted.catalog_manifest)catalog_manifests.push(adapted.catalog_manifest);
 }
 if(expansion.mappings?.length)applyPartFieldMappings(parts,{claims:expansion.claims,mappings:expansion.mappings});
 if(expansion.torque_mappings?.length)applyTorqueMappings(parts,{claims:expansion.claims,mappings:expansion.torque_mappings});
}
validatePartInventory(assemblies,parts,approvedClaims);
writeFileSync('docs/research/parts/normalized-captures.json',JSON.stringify({schema_version:2,assemblies,parts,catalog_manifests,approved_claims:approvedClaims,expansion_bundle_sources:expansion.bundle_sources},null,2)+'\n');
console.log(JSON.stringify({assemblies:assemblies.length,parts:parts.length}));
