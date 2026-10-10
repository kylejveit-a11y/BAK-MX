import type {SupabaseClient} from '@supabase/supabase-js';
import type {Bike,Claim} from '../shared/types.ts';
import {collectPages} from './pagination.ts';
import {applicableClaims} from './engineering.ts';
import {exactBikeScope} from '../shared/bike-identity.ts';
import {HttpError} from './validation.ts';
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
 const scope=exactBikeScope(bike),found=new Map<string,Claim>();
 for(const query of [...new Set(queries.map(q=>q.trim()).filter(Boolean))].slice(0,MAX_QUERIES)){
  const {data,error}=await db.rpc('search_bike_evidence',{p_manufacturer:scope.manufacturer,p_model:scope.model,p_model_year:scope.model_year,p_variant:scope.variant,p_region:scope.region,p_query:query.slice(0,200),p_limit:SEARCH_LIMIT});
  if(error||!Array.isArray(data))throw new HttpError(503,'Verified bike evidence could not be searched');
  for(const claim of applicableClaims(data as Claim[],bike)){if(found.size>=MAX_RETRIEVED)break;found.set(claim.id,claim);}
 }
 return [...found.values()];
}
