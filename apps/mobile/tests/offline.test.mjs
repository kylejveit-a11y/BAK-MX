import test from 'node:test';
import assert from 'node:assert/strict';
import {remember,recall,enqueue,pending,flush,withPending,isNetworkError,LOCAL_PREFIX} from '../src/offline.ts';

const mem=()=>{const m=new Map();return {read:(k,f)=>m.has(k)?m.get(k):f,write:(k,v)=>m.set(k,v),m};};

test('a GET answer is kept and recalled; huge answers are skipped',()=>{
 const s=mem();remember(s,'/api/bikes',[{id:'a'}]);assert.deepEqual(recall(s,'/api/bikes').data,[{id:'a'}]);
 remember(s,'/api/big','x'.repeat(300000));assert.equal(recall(s,'/api/big'),null);
});
test('queued writes merge into lists and go out oldest first, stopping on no signal',async()=>{
 const s=mem();
 enqueue(s,{id:LOCAL_PREFIX+'1',path:'/api/setup-logs',body:{bike_id:'b',recorded_at:'2026-10-29T10:00:00Z',change_made:'Fork 2 softer'},created_at:'2026-10-29T10:00:00Z',label:'Setup log'});
 enqueue(s,{id:LOCAL_PREFIX+'2',path:'/api/services',body:{bike_id:'b',category:'Oil'},created_at:'2026-10-29T10:01:00Z',label:'Service'});
 const rows=withPending([{id:'srv',recorded_at:'2026-10-28T10:00:00Z'}],pending(s),'/api/setup-logs',w=>({id:w.id,recorded_at:w.body.recorded_at}),r=>r.recorded_at);
 assert.deepEqual(rows.map(r=>r.id),[LOCAL_PREFIX+'1','srv']);
 const sent=[];
 let n=await flush(s,async(p)=>{if(p==='/api/services')throw new Error('Could not reach BAK MX.');sent.push(p);});
 assert.equal(n,1);assert.equal(pending(s).length,1);
 n=await flush(s,async(p)=>{sent.push(p);});assert.equal(n,1);assert.equal(pending(s).length,0);
 assert.deepEqual(sent,['/api/setup-logs','/api/services']);
});
test('a refused write is dropped, not retried forever',async()=>{
 const s=mem();enqueue(s,{id:'x',path:'/api/services',body:{},created_at:'',label:''});
 const e=Object.assign(new Error('Bad request'),{status:400});
 await flush(s,async()=>{throw e;});assert.equal(pending(s).length,0);
});
test('only no-signal errors count as offline',()=>{
 assert.equal(isNetworkError(new Error('Could not reach BAK MX. Check your connection and try again.')),true);
 assert.equal(isNetworkError(Object.assign(new Error('Could not reach'),{status:503})),false);
 assert.equal(isNetworkError(new Error('Bike not found')),false);
});
