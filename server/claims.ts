import type {SupabaseClient} from '@supabase/supabase-js';
import type {Bike,Claim} from '../shared/types.ts';
import {collectPages} from './pagination.ts';
import {applicableClaims} from './engineering.ts';
import {exactBikeScope} from '../shared/bike-identity.ts';
import {HttpError} from './validation.ts';
import {comparisonBikes} from './knowledge.ts';
const columns='id,manufacturer,model,model_year,variant,region,domain,property,statement,source_url,source_locator,status,has_conflict';
/** Read the complete exact-bike claim set, without sending audit envelopes to the model. */
export async function getBikeClaims(db:SupabaseClient,bike:Bike):Promise<Claim[]>{
 const rows=await collectPages<Claim>((from,to)=>db.from('claims').select(columns,{count:'exact'}).match({...exactBikeScope(bike),status:'VERIFIED',has_conflict:false}).order('id',{ascending:true}).range(from,to),{label:'Verified bike evidence',maxRows:20000,maxBytes:20_000_000,key:c=>c.id});
 return applicableClaims(rows,bike);
}

const SEARCH_LIMIT=12,MAX_QUERIES=6,MAX_RETRIEVED=60;
/** Retrieve only the exact-bike evidence a question needs. Queries are search terms chosen by the model;
 * scope, status and conflict filtering stay in the database function and are rechecked here. */
export async function searchBikeClaims(db:SupabaseClient,bike:Bike,queries:string[]):Promise<Claim[]>{
 const scope=exactBikeScope(bike),lists:Claim[][]=[];
 for(const query of [...new Set(queries.map(q=>q.trim()).filter(Boolean))].slice(0,MAX_QUERIES)){
  const {data,error}=await db.rpc('search_bike_evidence',{p_manufacturer:scope.manufacturer,p_model:scope.model,p_model_year:scope.model_year,p_variant:scope.variant,p_region:scope.region,p_query:query.slice(0,200),p_limit:SEARCH_LIMIT});
  if(error||!Array.isArray(data))throw new HttpError(503,'Verified bike evidence could not be searched');
  lists.push(applicableClaims(data as Claim[],bike));
 }
 return mergeSearchResults(lists);
}
/** Take the best match of each search in turn, so a well-stocked bike's first searches cannot crowd out the later ones. */
export function mergeSearchResults(lists:Claim[][],max=MAX_RETRIEVED):Claim[]{
 const found=new Map<string,Claim>();
 for(let i=0;found.size<max&&lists.some(l=>i<l.length);i++)for(const l of lists){const c=l[i];if(c&&!found.has(c.id)){found.set(c.id,c);if(found.size>=max)break;}}
 return [...found.values()];
}

/** Verified facts of a bike the question compares with, labelled with that bike ("2026 Triumph TF 450-X"). */
export type ComparisonFacts={bike:string;relation:'other_year'|'other_model';claims:Claim[]};
const MAX_COMPARED=24;
/** "What changed for 2027", "RC vs X", "how is the E different": the same searches run for the compared bike (the previous or
 *  named year of the rider's model, or another roster model named in the message), at most two bikes and 24 facts each.
 *  Comparison evidence is additive: a failed search leaves it out rather than costing the rider the answer. */
export async function comparisonClaims(db:SupabaseClient,bike:Bike,message:string,queries:string[]):Promise<ComparisonFacts[]>{
 const out:ComparisonFacts[]=[];
 for(const t of comparisonBikes(message,bike)){
  // Another year keeps the rider's variant; another model is its standard version in the rider's region.
  const other:Bike={...bike,manufacturer:t.manufacturer,model:t.model,model_year:t.model_year,variant:t.relation==='other_year'?bike.variant:'standard'};
  try{const found=await searchBikeClaims(db,other,[...queries,message.slice(0,200)]);if(found.length)out.push({bike:t.label,relation:t.relation,claims:found.slice(0,MAX_COMPARED)});}catch{/* additive */}
 }
 return out;
}
