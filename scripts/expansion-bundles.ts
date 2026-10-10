import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {expansionNamespace} from '../shared/expansion-inventory.ts';

const canonical=(value:any):string=>JSON.stringify(value,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.entries(item).sort(([a],[b])=>a.localeCompare(b))):item);
/** Replays may repeat identical rows; a shared identity with different evidence fails closed. */
export function mergeExpansionBundles(bundles:any[]){
 const merged:any={claims:[],catalogs:[],mappings:[],torque_mappings:[],excluded:[]};
 const indexes=new Map<string,Map<string,any>>();
 const add=(kind:string,key:string,row:any)=>{
  if(!key)throw Error(`Missing ${kind} identity`);
  const index=indexes.get(kind)??new Map();indexes.set(kind,index);
  if(index.has(key)){if(canonical(index.get(key))!==canonical(row))throw Error(`Conflicting expansion ${kind} identity: ${key}`);return;}
  index.set(key,row);merged[kind].push(row);
 };
 for(const bundle of bundles){
  for(const kind of ['claims','catalogs','mappings','torque_mappings','excluded'])if(!Array.isArray(bundle[kind]))throw Error(`Missing expansion array: ${kind}`);
  for(const c of bundle.claims)add('claims',c.id,c);
  for(const c of bundle.catalogs)add('catalogs',expansionNamespace(c.data.target),c);
  for(const kind of ['mappings','torque_mappings'])for(const m of bundle[kind])add(kind,canonical([m.assembly_id,String(m.callout),m.part_number,m.property??'torque',m.field_key??'']),m);
  for(const e of bundle.excluded)add('excluded',canonical([e.file,e.id]),e);
 }
 const ids=new Set(merged.claims.map((c:any)=>c.id));
 for(const kind of ['mappings','torque_mappings'])for(const m of merged[kind])if(!ids.has(m.claim_id))throw Error(`Unbound expansion mapping: ${m.claim_id}`);
 return merged;
}

/** Only explicitly listed, byte-identical reviewed waves enter the research inventory. */
export function loadExpansionBundles(manifestPath='docs/research/expansion/bundle-manifest.json'){
 const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
 if(manifest.project_ref!=='yzvrujffiktfserrgkcb'||!Array.isArray(manifest.bundles)||!manifest.bundles.length)throw Error('Invalid MX expansion bundle manifest');
 const bundles=manifest.bundles.map((entry:any)=>{
  if(typeof entry.file!=='string'||!/^[a-f0-9]{64}$/.test(entry.sha256))throw Error('Missing explicit expansion bundle hash');
  const bytes=readFileSync(resolve(dirname(manifestPath),entry.file));
  if(createHash('sha256').update(bytes).digest('hex')!==entry.sha256)throw Error(`Expansion bundle changed: ${entry.file}`);
  return JSON.parse(bytes.toString('utf8'));
 });
 return {...mergeExpansionBundles(bundles),bundle_sources:manifest.bundles};
}
