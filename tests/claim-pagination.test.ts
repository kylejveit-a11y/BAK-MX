import test from 'node:test';
import assert from 'node:assert/strict';
import {getBikeClaims} from '../server/claims.ts';
const bike:any={manufacturer:'KTM',model:'450 SX-F',model_year:2025,variant:'standard',region:'US'};
test('bike evidence beyond the API page cap stays available with exact scope and provenance',async()=>{
 const rows=Array.from({length:1264},(_,i)=>({...bike,id:String(i).padStart(5,'0'),domain:'engine',statement:'Evidence '+i,source_url:'https://example.com/oem',source_locator:'p.1',status:'VERIFIED',has_conflict:false}));
 let pages=0;const db:any={from(table:string){assert.equal(table,'claims');return{select(columns:string,opts:any){assert.equal(opts.count,'exact');assert(!columns.includes('evidence_record'));return{match(scope:any){assert.deepEqual(scope,{...bike,status:'VERIFIED',has_conflict:false});return{order(col:string){assert.equal(col,'id');return{range(from:number,to:number){pages++;return Promise.resolve({data:rows.slice(from,Math.min(to+1,from+100)),count:rows.length,error:null});}};}};}};}};}};
 const result=await getBikeClaims(db,bike);assert.equal(result.length,1264);assert.equal(result.at(-1)?.statement,'Evidence 1263');assert.equal(pages,13);
});
