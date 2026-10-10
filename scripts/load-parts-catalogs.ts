/** Load reconciled exact-year parts catalogs into the BAK MX database.
 *
 * Reads docs/research/parts-pass14/INVENTORY_STATUS.json and, for every target whose catalog
 * inventory is complete, normalizes the selected capture into catalog → assemblies → parts.
 *
 *   node --experimental-strip-types scripts/load-parts-catalogs.ts --dry-run
 *   node --experimental-strip-types --env-file=.env scripts/load-parts-catalogs.ts
 *
 * Writing needs SUPABASE_URL (the MX project only) and SUPABASE_SERVICE_ROLE_KEY. A catalog is
 * replaced as a whole, so re-running is safe. Nothing is inferred: quantities stay as published
 * (per assembly, not whole-bike), unknown stays blank, and no adjacent year is substituted.
 */
import {readFileSync} from 'node:fs';
import {createClient} from '@supabase/supabase-js';
import {isMxProjectUrl} from '../shared/mx-project.ts';

export type Target={manufacturer:string;model:string;model_year:number;variant:string;region:string};
export type NormalPart={position:number;callout:string;part_number:string|null;description:string;quantity_raw:string;remarks:string};
export type NormalAssembly={external_id:string;name:string;diagram_url:string;source_url:string;position:number;parts:NormalPart[]};
export type NormalCatalog={target:Target;source:string;source_url:string;scope_label:string;capture_sha256:string;complete:boolean;assemblies:NormalAssembly[]};
type Selected={target:any;path:string;sha256?:string;source:string;complete:boolean;scope?:string;assemblies:number;occurrences:number};

const text=(v:unknown)=>v===null||v===undefined?'':String(v).trim();
const quantity=(row:any)=>text(row.catalog_quantity_raw??row.catalog_quantity??row.quantity);
const target=(t:any):Target=>({manufacturer:text(t.manufacturer),model:text(t.model),model_year:Number(t.model_year??t.year),variant:text(t.variant)||'standard',region:text(t.region)||'US'});
const sameTarget=(a:Target,b:Target)=>a.manufacturer===b.manufacturer&&a.model===b.model&&a.model_year===b.model_year&&a.variant===b.variant&&a.region===b.region;
const https=(v:unknown)=>/^https:\/\//.test(text(v))?text(v):'';

/** Convert one selected capture into the common shape. Throws rather than guessing on an unknown format. */
export function normalizeInventory(selected:Selected,read:(path:string)=>any):NormalCatalog{
 const want=target(selected.target),path=selected.path.replace(/\\/g,'/'),data=read(path);
 const base={target:want,source:selected.source,scope_label:text(selected.scope),capture_sha256:text(selected.sha256),complete:Boolean(selected.complete)};
 let assemblies:NormalAssembly[];let source_url='';
 if(path.endsWith('docs/research/parts/inventory.json')){
  // Legacy reviewed inventory: flat assemblies and parts for many targets in one file.
  const groups=(data.assemblies as any[]).filter(a=>sameTarget(target(a.target),want));
  const rows=(data.parts as any[]).filter(p=>sameTarget(target(p.target),want));
  assemblies=groups.map((a,i)=>({external_id:text(a.id),name:text(a.name),diagram_url:https(a.diagram_url),source_url:https(a.catalog_evidence?.url),position:i+1,
   parts:rows.filter(p=>p.assembly_id===a.id).map((p,n)=>({position:n+1,callout:text(p.callout),part_number:text(p.part_number)||null,description:text(p.description),quantity_raw:quantity(p),remarks:text(p.non_orderable_reference?`Reference ${p.non_orderable_reference}`:p.additional_text)}))}));
  source_url=assemblies[0]?.source_url??'';
 }else if(Array.isArray(data.parts)&&Array.isArray(data.assemblies)){
  // Official KTM / Husqvarna / GasGas catalog capture: assemblies plus a flat parts list.
  if(!sameTarget(target(data.target),want))throw new Error(`Capture target mismatch: ${path}`);
  assemblies=(data.assemblies as any[]).map((a,i)=>({external_id:text(a.id),name:text(a.name),diagram_url:https(a.diagram_url),source_url:https(a.source_url),position:i+1,
   parts:(data.parts as any[]).filter(p=>text(p.assembly_id)===text(a.id)).map((p,n)=>({position:n+1,callout:text(p.callout),part_number:text(p.part_number)||null,description:text(p.description),quantity_raw:quantity(p),remarks:text(p.additional_text)}))}));
  source_url=https(data.source_url);
 }else if(Array.isArray(data.assemblies)&&Array.isArray(data.assemblies[0]?.rows)){
  // Kawasaki official tables and MotoSport public catalog: rows nested under each assembly.
  if(!sameTarget(target(data.target),want))throw new Error(`Capture target mismatch: ${path}`);
  assemblies=(data.assemblies as any[]).map((a,i)=>({external_id:text(a.id??a.url??a.name),name:text(a.name),diagram_url:https(a.diagram_urls?.[0]),source_url:https(a.url),position:i+1,
   parts:(a.rows as any[]).map((p,n)=>({position:Number(p.occurrence_index)||n+1,callout:text(p.callout),part_number:text(p.part_number)||null,description:text(p.description),quantity_raw:quantity(p),
    remarks:[text(p.remarks),text(p.destination),text(p.context),p.supersedes_part_number?`Supersedes ${p.supersedes_part_number}`:''].filter(Boolean).join(' · ')}))}));
  source_url=https(data.index_url);
 }else throw new Error(`Unrecognized inventory format: ${path}`);
 if(!assemblies.length)throw new Error(`No assemblies for ${want.model_year} ${want.manufacturer} ${want.model} in ${path}`);
 const ids=new Set(assemblies.map(a=>a.external_id));
 if(ids.size!==assemblies.length||ids.has(''))throw new Error(`Assembly identifiers are not unique in ${path}`);
 return {...base,source_url,assemblies};
}
export const partCount=(c:NormalCatalog)=>c.assemblies.reduce((n,a)=>n+a.parts.length,0);

async function main(){
 const dry=process.argv.includes('--dry-run');
 const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
 const status=read('docs/research/parts-pass14/INVENTORY_STATUS.json');
 const cache=new Map<string,any>(),cached=(p:string)=>{if(!cache.has(p))cache.set(p,read(p));return cache.get(p);};
 const complete=(status.rows as any[]).filter(r=>r.catalog_inventory_complete&&r.selected_inventory);
 const catalogs:NormalCatalog[]=[];
 for(const row of complete){
  const c=normalizeInventory(row.selected_inventory,cached);
  if(partCount(c)!==row.selected_inventory.occurrences)throw new Error(`Part count ${partCount(c)} does not match the reconciled ${row.selected_inventory.occurrences} for ${c.target.model_year} ${c.target.manufacturer} ${c.target.model}`);
  catalogs.push(c);
 }
 console.log(`${catalogs.length} complete catalogs, ${catalogs.reduce((n,c)=>n+c.assemblies.length,0)} assemblies, ${catalogs.reduce((n,c)=>n+partCount(c),0)} part entries`);
 if(dry){for(const c of catalogs)console.log(`  ${c.target.model_year} ${c.target.manufacturer} ${c.target.model} · ${c.source} · ${c.assemblies.length} assemblies · ${partCount(c)} parts`);console.log('Dry run: nothing was written.');return;}
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!isMxProjectUrl(url)||!key)throw new Error('Set SUPABASE_URL to the BAK MX project and SUPABASE_SERVICE_ROLE_KEY. This loader never writes to any other project.');
 const db=createClient(url!,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const must=<T>(r:{data:T;error:{message:string}|null}):T=>{if(r.error)throw new Error(r.error.message);return r.data;};
 for(const c of catalogs){
  const scope={...c.target,source:c.source};
  must(await db.from('part_catalogs').delete().match(scope));
  const catalog=must(await db.from('part_catalogs').insert({...scope,source_url:c.source_url,scope_label:c.scope_label,capture_sha256:c.capture_sha256,complete:c.complete,assembly_count:c.assemblies.length,part_count:partCount(c)}).select('id').single()) as {id:string};
  const saved=must(await db.from('part_assemblies').insert(c.assemblies.map(a=>({catalog_id:catalog.id,external_id:a.external_id,name:a.name,diagram_url:a.diagram_url,source_url:a.source_url,position:a.position}))).select('id,external_id')) as {id:string;external_id:string}[];
  const byExternal=new Map(saved.map(a=>[a.external_id,a.id]));
  const rows=c.assemblies.flatMap(a=>a.parts.map(p=>({assembly_id:byExternal.get(a.external_id)!,...p})));
  for(let i=0;i<rows.length;i+=500)must(await db.from('parts').insert(rows.slice(i,i+500)));
  const check=must(await db.from('parts').select('id',{count:'exact',head:true}).in('assembly_id',saved.map(a=>a.id)) as any);void check;
  console.log(`  loaded ${c.target.model_year} ${c.target.manufacturer} ${c.target.model}: ${rows.length} parts`);
 }
 const total=await db.from('parts').select('id',{count:'exact',head:true});
 console.log(`Done. parts table now holds ${total.count} rows.`);
}
if(process.argv[1]?.replace(/\\/g,'/').endsWith('scripts/load-parts-catalogs.ts'))main().catch(e=>{console.error(e.message);process.exit(1);});
