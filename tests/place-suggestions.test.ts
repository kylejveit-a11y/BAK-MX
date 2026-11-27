import {test} from 'node:test';
import assert from 'node:assert/strict';
import {suggestionProblem,alreadyListed,MAX_PENDING_SUGGESTIONS} from '../shared/where-to-ride.ts';
import {suggestionSchema,suggestPlace} from '../server/where-to-ride.ts';

test('a suggestion needs a name and a state before it is sent',()=>{
 assert.equal(suggestionProblem({name:' ',state:'FL'}),'Add the name of the place.');
 assert.equal(suggestionProblem({name:'Dade City MX',state:''}),'Add the state it is in.');
 assert.equal(suggestionProblem({name:'Dade City MX',state:'FL'}),'');
});
test('a rider is told when the place is already listed',()=>{
 const rows=[{name:'Dade City MX',state:'FL'}];
 assert.equal(alreadyListed(rows,'dade city  mx','fl'),true);assert.equal(alreadyListed(rows,'Dade City MX','GA'),false);assert.equal(alreadyListed(rows,'D','FL'),false);
});
test('the suggestion schema refuses half a location and unknown fields',()=>{
 const ok={name:'Pine Ridge',kind:'riding_area',state:'GA'};
 assert.equal(suggestionSchema.safeParse(ok).success,true);
 assert.equal(suggestionSchema.safeParse({...ok,lat:33.1}).success,false);
 assert.equal(suggestionSchema.safeParse({...ok,status:'approved'}).success,false);
 assert.equal(suggestionSchema.safeParse({...ok,kind:'private'}).success,false);
});
// A tiny stand-in for the two database clients: the rider's own (reads) and the service one (the insert).
function clients(existing:{name:string;state:string;status:string}[]){
 const inserted:Record<string,unknown>[]=[];
 const reader={from:()=>({select:()=>({eq:()=>({order:()=>({limit:async()=>({data:existing,error:null})})})})})};
 const writer={from:()=>({insert:(row:Record<string,unknown>)=>{inserted.push(row);return {select:()=>({single:async()=>({data:{id:'s1',status:'pending',created_at:'2026-11-27T00:00:00Z',...row},error:null})})};}})};
 return {reader,writer,inserted};
}
test('a suggestion is saved as pending under the rider, never as a listed place',async()=>{
 const c=clients([]);
 const saved=await suggestPlace(c.reader as never,'rider-1',{name:'Pine Ridge',kind:'riding_area',state:'GA',note:'County OHV park'},c.writer as never);
 assert.equal(saved.status,'pending');assert.equal(c.inserted[0].user_id,'rider-1');assert.equal('status' in c.inserted[0],false);
});
test('five waiting suggestions is the limit, and the same place twice is refused',async()=>{
 const full=clients(Array.from({length:MAX_PENDING_SUGGESTIONS},(_,i)=>({name:'P'+i,state:'GA',status:'pending'})));
 await assert.rejects(()=>suggestPlace(full.reader as never,'r',{name:'New',kind:'track',state:'GA'},full.writer as never),/5 suggestions/);
 const dup=clients([{name:'Pine Ridge',state:'GA',status:'pending'}]);
 await assert.rejects(()=>suggestPlace(dup.reader as never,'r',{name:'pine ridge',kind:'track',state:'ga'},dup.writer as never),/already sent/);
 assert.equal(full.inserted.length+dup.inserted.length,0);
});
