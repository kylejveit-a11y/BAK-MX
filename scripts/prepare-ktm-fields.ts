import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {candidateSchema,promotionBlockers,stagedClaim} from '../shared/evidence.ts';
const dir='docs/research/parts/';
const scope={manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US'};
const catalog=JSON.parse(readFileSync(dir+'ktm-450-2025.json','utf8'));
const when='2026-09-13T11:05:28.363234Z';
const claims:any[]=[],mappings:any[]=[],labels:any[]=[];
function fact(input:any){
 const digest=createHash('sha256').update(`${input.hash}:${input.key}`).digest('hex');
 const id=`${digest.slice(0,8)}-${digest.slice(8,12)}-4${digest.slice(13,16)}-a${digest.slice(17,20)}-${digest.slice(20,32)}`;
 const content={field_key:input.field_key,coverage:input.coverage,property:input.property,status:input.status??'VERIFIED',value:input.value,unit:input.unit??null,conditions:input.conditions??[]};
 const c=candidateSchema.parse({id,applicability:scope,domain:input.domain??'component_identification',statement:input.statement,
 source:{url:input.url,locator:input.locator,document_sha256:input.hash,retrieved_at:when,document_revision:input.revision,kind:'document',reviewed_content:JSON.stringify(content)},
 rights:{basis:'factual_extraction',reference:'docs/research/parts/KTM_FIELD_REVIEW.md; bounded US factual extraction without source redistribution',commercial_use_approved:true,usage_scope:'facts_only_no_source_distribution'},
 review:{reviewer_id:'BAK-MX engineering evidence review',reviewed_at:when,decision:'approved',content_checked:true,scope_checked:true,conflicts_checked:true,approval_reference:'docs/research/parts/KTM_FIELD_REVIEW.md',approved_document_sha256:input.hash,approved_applicability:scope},has_conflict:false,conflict_references:[],status:'STAGED'});
 if(promotionBlockers(c).length)throw Error('Field review blocked');
 claims.push({...stagedClaim(c),status:'VERIFIED'});return {claim_id:id,...content};
}
for(const file of ['ktm-engine-full-labels.json','ktm-chassis-full-labels.json','ktm-suspension-full-labels.json']){
 const bytes=readFileSync(dir+file);const capture=JSON.parse(bytes.toString());const hash=createHash('sha256').update(bytes).digest('hex');
 const rows=capture.rows; if(!Array.isArray(rows))throw Error('Full-label rows missing');
 const seen=new Set<string>();
 for(const r of rows){
  const key=JSON.stringify([r.assembly_id,String(r.callout),r.part_number]);
  if(seen.has(key))throw Error('Duplicate full-label row');seen.add(key);
  const matches=catalog.parts.filter((p:any)=>p.assembly_id===r.assembly_id&&String(p.callout)===String(r.callout)&&p.part_number===r.part_number);
  if(matches.length!==1||r.reviewed!==true||r.source_url!==matches[0].source_url||!r.review_note)throw Error(`Unreviewed or wrong-scope field capture: ${key}`);
  const part=matches[0];const map={assembly_id:`ktm-450-2025:${r.assembly_id}`,callout:String(r.callout),part_number:r.part_number==='SPNO'?null:r.part_number,review_note:r.review_note};
  labels.push({...map,description:r.description,reviewed:true,source_url:r.source_url});
  const base={hash,url:r.source_url,locator:`US F8475Y5, ${r.assembly_id}, callout ${r.callout}, part ${r.part_number}; reviewed capture ${file}`,revision:'Live US F8475Y5 OEM catalog capture / 2026-09-13'};
  if(r.dimension_text){
   const value=r.dimension_text;
   const c=fact({...base,key:key+':dimensions',property:'dimensions',coverage:'PARTIAL',value,unit:null,conditions:['Exact catalog designation only; omitted units, tolerances, materials and installed options are not inferred.'],statement:`OEM catalog dimensional designation for ${r.part_number} (${r.description}), ${r.assembly_id} callout ${r.callout}: ${value}. This does not establish manufacturing tolerances or which alternative is installed.`});
   mappings.push({...map,...c});
  }
  if(r.material_grade_text){
   const value=r.material_grade_text;
   const c=fact({...base,key:key+':material',property:'material_grade',coverage:'PARTIAL',value,conditions:['Only the explicit OEM catalog material designation is known; no unstated standard or material treatment inferred.'],statement:`OEM material designation for ${r.part_number} (${r.description}): ${value}.`});
   mappings.push({...map,...c});
  }
  if(r.torque_not_applicable){
   const reason=typeof r.torque_not_applicable==='string'?r.torque_not_applicable:r.torque_not_applicable.review_note;
   if(!reason)throw Error('Missing explicit non-applicability review');
   const value='Not applicable to this individual non-threaded component';
   const c=fact({...base,key:key+':torque-na',property:'torque',status:'NOT_APPLICABLE',value,conditions:[reason,'This classification does not apply to fasteners retaining the component or to its containing assembly.'],statement:`Engineering applicability review of OEM catalog part ${r.part_number} (${r.description}): no tightening torque acts on the individual non-threaded component. ${reason} Retaining fasteners require separate torque evidence.`});
   mappings.push({...map,...c,review_note:reason});
  }
 }
}
const other=JSON.parse(readFileSync(dir+'ktm-owner-other-specs.json','utf8'));
for(const f of other.facts){
 const c=fact({hash:'a24efdc2f908cc4c3764ee133bcdf6957b6caaebfee4587e847f3b2fe2456a33',url:'https://powaypowersports.com/cdn/shop/files/2025-ktm-450sx-f-factory-owners-manual.pdf?v=679135179847397228',locator:`3240045en, printed p. ${f.printed_page}, ${f.joint}; scope p. 1 F8475Y5`,revision:'3240045en / 2025-01-22',key:f.id,field_key:f.id,domain:f.domain,property:f.property,value:f.value,unit:f.unit,conditions:f.conditions,statement:`${f.joint}: ${f.value}${f.unit?' '+f.unit:''}. ${f.conditions.join('; ')}`});
 for(const m of (other.mappings??[]).filter((m:any)=>m.fact_id===f.id))mappings.push({...m,assembly_id:`ktm-450-2025:${m.assembly_id}`,...c});
}
writeFileSync(dir+'ktm-approved-fields.json',JSON.stringify({schema_version:1,scope,claims,mappings,labels},null,2)+'\n');
console.log(JSON.stringify({claims:claims.length,mappings:mappings.length,labels:labels.length}));
