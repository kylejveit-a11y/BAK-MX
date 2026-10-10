import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
type Target={manufacturer:string;model:string;model_year:number;variant:string;region:string};
type Assembly={id:string;target:Target;scope_status:string;name:string;expected_occurrences:number|null;enumeration_checked:boolean;catalog_evidence:{url:string;locator:string}};
type Part={id:string;target:Target;scope_status:string;assembly_id:string;part_number:string|null;non_orderable_reference?:string;quantity:unknown;catalog_quantity:unknown;alternative_key?:string};
const identity=(t:Target)=>JSON.stringify([t.manufacturer,t.model,t.variant,t.region]);
const sameTarget=(a:Target,b:Target)=>identity(a)===identity(b)&&a.model_year===b.model_year;
const fingerprint=(p:Part)=>JSON.stringify([p.part_number??`NONORDERABLE:${p.non_orderable_reference??p.id}`,p.catalog_quantity??p.quantity,p.alternative_key??null]);
/** Catalog commonality is a research prioritization result, never specification inheritance. */
export function compareCatalogYears(data:{assemblies:Assembly[];parts:Part[]}){
 const byAssembly=new Map<string,Part[]>();
 for(const p of data.parts){const rows=byAssembly.get(p.assembly_id)??[];rows.push(p);byAssembly.set(p.assembly_id,rows);}
 const groups=new Map<string,Assembly[]>();
 for(const a of data.assemblies){if(a.scope_status!=='CONFIRMED')continue;const key=identity(a.target)+'|'+a.name.trim().replace(/\s+/g,' ').toUpperCase();const list=groups.get(key)??[];list.push(a);groups.set(key,list);}
 const comparisons=[];
 for(const assemblies of groups.values()){
  const sorted=assemblies.toSorted((a,b)=>a.target.model_year-b.target.model_year||a.id.localeCompare(b.id));
  for(let i=0;i<sorted.length;i++)for(let j=i+1;j<sorted.length;j++){
   const a=sorted[i],b=sorted[j];if(a.target.model_year===b.target.model_year)continue;
   const left=byAssembly.get(a.id)??[],right=byAssembly.get(b.id)??[];
   const bounded=(assembly:Assembly,rows:Part[])=>assembly.enumeration_checked&&rows.length>0&&assembly.expected_occurrences===rows.length&&rows.every(p=>p.scope_status==='CONFIRMED'&&sameTarget(p.target,assembly.target));
   const complete=bounded(a,left)&&bounded(b,right);
   const allNumbers=[...left,...right].every(p=>typeof p.part_number==='string'&&p.part_number.length>0&&typeof (p.catalog_quantity??p.quantity)==='number'&&Number.isFinite(p.catalog_quantity??p.quantity));
   const counts=(rows:Part[])=>{const m=new Map<string,number>();for(const p of rows)m.set(fingerprint(p),(m.get(fingerprint(p))??0)+1);return m;};
   const lc=counts(left),rc=counts(right);let matched=0;
   for(const [key,count] of lc)matched+=Math.min(count,rc.get(key)??0);
   const identical=complete&&allNumbers&&matched===left.length&&matched===right.length;
   comparisons.push({manufacturer:a.target.manufacturer,model:a.target.model,variant:a.target.variant,region:a.target.region,assembly:a.name,years:[a.target.model_year,b.target.model_year],assembly_ids:[a.id,b.id],status:identical?'IDENTICAL_CAPTURED_ORDERABLE_PART_MULTISET':complete?'COMPLETE_CAPTURED_ASSEMBLIES_DIFFER_OR_CONTAIN_NONORDERABLES':'PARTIAL_COMPARISON_ONLY',enumeration_complete:complete,matched_occurrences:matched,left_occurrences:left.length,right_occurrences:right.length,left_only_occurrences:left.length-matched,right_only_occurrences:right.length-matched,source_evidence:[a.catalog_evidence,b.catalog_evidence],runtime_inheritance_authorized:false,limits:['Exact captured assembly names only; no whole-bike equivalence.','Matching part numbers/quantities do not establish torque, lubrication, replacement rules, supersession or installed compatibility.','Missing years are not implied by the pair; unconfirmed markets and special variants are kept separate.']});
  }
 }
 return comparisons;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const path='docs/research/parts/normalized-captures.json',bytes=readFileSync(path),comparisons=compareCatalogYears(JSON.parse(bytes.toString()));
 const output={schema_version:1,generated_at:new Date().toISOString(),source:path,source_sha256:createHash('sha256').update(bytes).digest('hex'),purpose:'Research reuse candidates only; no new verified technical facts or runtime applicability.',summary:{compared_assembly_pairs:comparisons.length,identical_orderable_pairs:comparisons.filter(c=>c.status==='IDENTICAL_CAPTURED_ORDERABLE_PART_MULTISET').length,complete_pairs:comparisons.filter(c=>c.enumeration_complete).length,partial_pairs:comparisons.filter(c=>!c.enumeration_complete).length},comparisons};
 mkdirSync('docs/research/generations',{recursive:true});writeFileSync('docs/research/generations/catalog-comparisons.json',JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify(output.summary));
}
