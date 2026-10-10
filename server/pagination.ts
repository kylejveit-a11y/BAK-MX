import {HttpError} from './validation.ts';
export type PageResult<T>={data:T[]|null;error:unknown;count:number|null};
type Options<T>={label:string;maxRows?:number;maxBytes?:number;key:(row:T)=>string};
/** Every callback must apply an owner predicate and a deterministic unique ordering.
 * Exact counts prevent a lower PostgREST page cap from masquerading as end-of-data.
 * A changing row count or duplicate key rejects the read instead of returning partial data.
 */
export async function collectPages<T>(fetchPage:(from:number,to:number)=>PromiseLike<PageResult<T>>,options:Options<T>):Promise<T[]>{
 const {label,key,maxRows=20000,maxBytes=20_000_000}=options;
 const rows:T[]=[];const keys=new Set<string>();let expected:number|undefined;let bytes=2;
 while(true){
  const result=await fetchPage(rows.length,rows.length+249);
  if(result.error||result.data===null||result.count===null)throw new HttpError(503,`${label} could not be read completely`);
  if(!Number.isSafeInteger(result.count)||result.count<0)throw new HttpError(503,`${label} returned an invalid record count`);
  if(expected===undefined){expected=result.count;if(expected>maxRows)throw new HttpError(413,`${label} exceeds the ${maxRows}-record download limit. Contact support for a complete export.`);}
  else if(result.count!==expected)throw new HttpError(409,`${label} changed during retrieval. Retry when other sessions have finished saving.`);
  for(const row of result.data){const id=key(row);if(keys.has(id))throw new HttpError(409,`${label} changed during retrieval. Retry the request.`);keys.add(id);bytes+=Buffer.byteLength(JSON.stringify(row),'utf8')+1;if(bytes>maxBytes)throw new HttpError(413,`${label} exceeds the response size limit. No partial data was returned. Contact support for a complete export.`);rows.push(row);}
  if(rows.length===expected)return rows;
  if(rows.length>expected||result.data.length===0)throw new HttpError(503,`${label} could not be read completely`);
 }
}
