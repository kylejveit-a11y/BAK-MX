import {applicabilitySchema} from './evidence.ts';
import {validatePartInventory,type PartsAssembly,type PartOccurrence} from './parts-inventory.ts';
export function expansionNamespace(target:unknown){const t=applicabilitySchema.parse(target);return `expanded:${t.manufacturer}:${t.model}:${t.model_year}:${t.variant}:${t.region}`;}
/** Adapt reviewed source captures; never infer catalog completeness from collected row count. */
export function adaptExpansionCatalog(data:any){
 const target=applicabilitySchema.parse(data.target);if(target.manufacturer==='KTM')throw Error('KTM is outside this expansion pass');
 const ns=expansionNamespace(target);const confirmed=(data.catalog_scope_confirmed??data.scope_confirmed)===true;
 const expected=data.catalog_manifest?.expected_assembly_ids;
 const explicitManifest=Array.isArray(expected)&&expected.length>0&&new Set(expected).size===expected.length&&Boolean(data.catalog_manifest.source_url)&&Boolean(data.catalog_manifest.review_note);
 const groups:PartsAssembly[]=(data.assemblies??[]).map((a:any)=>({id:`${ns}:${a.id}`,target,scope_status:confirmed?'CONFIRMED':'PENDING',name:a.name,catalog_evidence:{url:a.source_url,locator:a.locator??`Published assembly ${a.name}; ${a.id}`},expected_occurrences:a.enumeration_checked===true?a.expected_occurrences:null,enumeration_checked:a.enumeration_checked===true,enumeration_review:a.enumeration_checked===true?{url:a.source_url,locator:a.enumeration_review??'Full rendered assembly table reconciled against source count'}:null}));
 const parts:PartOccurrence[]=(data.parts??[]).map((p:any,i:number)=>{
  const quantity=Number.isInteger(p.quantity)&&p.quantity>0&&p.quantity_basis==='OEM_CATALOG'?p.quantity:null;
  const callout=String(p.callout);const pn=p.part_number==='SPNO'?null:p.part_number??null;
  return {id:`${ns}:row-${i+1}`,target,scope_status:confirmed?'CONFIRMED':'PENDING',assembly_id:`${ns}:${p.assembly_id}`,callout,alternative_key:p.alternative_key??p.non_orderable_reference??p.part_number??`row-${i+1}`,part_number:pn,description:p.description,quantity,catalog_quantity:Number.isInteger(p.catalog_quantity)&&p.catalog_quantity>=0?p.catalog_quantity:null,non_orderable_reference:p.non_orderable_reference??null,
   quantity_evidence:quantity===null?null:{url:p.source_url,locator:`OEM assembly quantity, callout ${callout}; alternatives and nested assemblies are not summed as installed totals`},catalog_evidence:{url:p.source_url,locator:p.locator??`Assembly ${p.assembly_id}, callout ${callout}, part ${p.part_number??'non-orderable reference'}`},identity_status:confirmed?'REVIEWED':'CAPTURED',kind:/\b(bolt|screw|nut|stud)\b/i.test(p.description)?'FASTENER':'UNKNOWN',supersedes_part_number:null,supersession_evidence:null,
   specifications:(['torque','dimensions','material_grade','clearance_wear_limit','installation','replacement_rule','service_interval'] as const).map(property=>({property,status:'UNKNOWN',value:null,unit:null,conditions:[],claim_id:null,evidence:null,review_note:'Exact component requirement and source review pending; no inherited value.'}))};
 });
 const coverage=validatePartInventory(groups,parts);
 const complete=data.catalog_complete===true&&confirmed&&explicitManifest&&expected.length===groups.length&&expected.every((id:string)=>groups.some(g=>g.id===`${ns}:${id}`))&&coverage.every(g=>g.enumeration_complete);
 return {target,namespace:ns,assemblies:groups,parts,catalog_manifest:explicitManifest?{target,source_url:data.catalog_manifest.source_url,expected_assembly_ids:expected.map((id:string)=>`${ns}:${id}`),reviewed:complete}:null,catalog_complete:complete};
}
