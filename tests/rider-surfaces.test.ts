import test from 'node:test';
import assert from 'node:assert/strict';
import {profileSchema,postSchema,eventSchema,setupLogSchema,feedbackSchema,messageSchema,handleRiderSurfaces} from '../server/rider-surfaces.ts';
const owner='00000000-0000-4000-8000-000000000001',other='00000000-0000-4000-8000-000000000002',bike='00000000-0000-4000-8000-000000000003';
test('rider input is normalized and bounded before it reaches the database',()=>{
 assert.equal(profileSchema.parse({handle:'  Kyle_450 '}).handle,'kyle_450');
 assert.throws(()=>profileSchema.parse({handle:'no spaces allowed'}));
 assert.throws(()=>profileSchema.parse({handle:'ok_handle',admin:true}));
 assert.throws(()=>postSchema.parse({category:'marketplace',body:'x'}));
 assert.throws(()=>postSchema.parse({category:'general',body:'   '}));
 const event=eventSchema.parse({title:'Practice',event_type:'practice',starts_at:'2026-11-01T18:00:00-04:00',location_name:'Track'});
 assert.equal(event.starts_at,'2026-11-01T22:00:00.000Z');assert.equal(event.ends_at,null);
 assert.throws(()=>eventSchema.parse({title:'Backwards',event_type:'race',starts_at:'2026-11-02T00:00:00Z',ends_at:'2026-11-01T00:00:00Z',location_name:'Track'}));
 const log=setupLogSchema.parse({bike_id:bike,recorded_at:'2026-10-08T12:00:00Z',settings:{fork_compression:'12 out',rider_sag_mm:105}});
 assert.equal(log.result,'not_tested');assert.equal(log.settings.rider_sag_mm,105);
 assert.throws(()=>setupLogSchema.parse({bike_id:bike,recorded_at:'2026-10-08T12:00:00Z',settings:{nested:{a:1}}}));
 assert.throws(()=>feedbackSchema.parse({category:'bug',body:'x',context:{blob:'y'.repeat(5000)}}));
 assert.throws(()=>messageSchema.parse({recipient_id:'not-a-uuid',body:'hi'}));
});
/** Minimal chainable stand-in that records calls and answers from a script. */
function fakeDb(answers:Record<string,unknown>){
 const calls:{table:string;op:string;args:unknown[]}[]=[];
 const builder=(table:string)=>{
  let op='select';const chain:any={};
  for(const name of ['select','eq','is','in','lt','gte','or','order','limit','match','range'])chain[name]=(...args:unknown[])=>{calls.push({table,op:name,args});return chain;};
  for(const name of ['insert','update','delete'])chain[name]=(...args:unknown[])=>{op=name;calls.push({table,op:name,args});return chain;};
  const answer=()=>Promise.resolve(answers[`${table}.${op}`]??{data:op==='select'?[]:null,error:null});
  chain.single=answer;chain.maybeSingle=answer;chain.then=(resolve:any,reject:any)=>answer().then(resolve,reject);
  return chain;
 };
 return {db:{from:builder} as any,calls};
}
const request=(method:string,path:string,body?:unknown)=>({req:new Request('http://localhost'+path,{method,body:body?JSON.stringify(body):undefined}),url:new URL('http://localhost'+path)});
test('posting requires a rider profile and always writes the signed-in rider as author',async()=>{
 const none=fakeDb({'profiles.select':{data:null,error:null}});
 const first=request('POST','/api/posts',{category:'general',body:'First ride on the new shock',user_id:other});
 await assert.rejects(handleRiderSurfaces(first.req,first.url,'/api/posts','POST',none.db,owner),/Invalid|Unrecognized|profile/i);
 const noProfile=request('POST','/api/posts',{category:'general',body:'First ride on the new shock'});
 await assert.rejects(handleRiderSurfaces(noProfile.req,noProfile.url,'/api/posts','POST',none.db,owner),/rider profile/);
 const ready=fakeDb({'profiles.select':{data:{user_id:owner},error:null},'posts.insert':{data:{id:'p1'},error:null}});
 const ok=request('POST','/api/posts',{category:'general',body:'First ride on the new shock'});
 const response=await handleRiderSurfaces(ok.req,ok.url,'/api/posts','POST',ready.db,owner);
 assert.equal(response?.status,201);
 const insert=ready.calls.find(c=>c.table==='posts'&&c.op==='insert');
 assert.equal((insert?.args[0] as any).user_id,owner);
});
test('a rider cannot message themselves, and a refused write is reported as refused',async()=>{
 const {db}=fakeDb({'profiles.select':{data:{user_id:owner},error:null},'direct_messages.insert':{data:null,error:{code:'42501'}}});
 const self=request('POST','/api/thread',{recipient_id:owner,body:'hi'});
 await assert.rejects(handleRiderSurfaces(self.req,self.url,'/api/thread','POST',db,owner),/another rider/);
 const blocked=request('POST','/api/thread',{recipient_id:other,body:'hi'});
 await assert.rejects(handleRiderSurfaces(blocked.req,blocked.url,'/api/thread','POST',db,owner),/not available/);
});
test('setup entries are bound to a bike the rider owns; unknown routes fall through',async()=>{
 const {db}=fakeDb({'bikes.select':{data:null,error:null}});
 const entry=request('POST','/api/setup-logs',{bike_id:bike,recorded_at:'2026-10-08T12:00:00Z'});
 await assert.rejects(handleRiderSurfaces(entry.req,entry.url,'/api/setup-logs','POST',db,owner),/Bike not found/);
 const unknown=request('GET','/api/nothing');
 assert.equal(await handleRiderSurfaces(unknown.req,unknown.url,'/api/nothing','GET',db,owner),null);
});
test('rider text is screened, engine terms are not, and a profile needs accepted rules',async()=>{
 const {objectionable}=await import('../server/content-rules.ts');
 assert.equal(objectionable('Retard the ignition timing two degrees and check for detonation'),false);
 assert.equal(objectionable('Raccoon got into my gear bag at the track'),false);
 assert.equal(objectionable('Front pushes in flat corners'),false);
 const {db}=fakeDb({'profiles.select':{data:null,error:null}});
 const noRules=request('PUT','/api/profile',{handle:'new_rider'});
 await assert.rejects(handleRiderSurfaces(noRules.req,noRules.url,'/api/profile','PUT',db,owner),/community rules/);
 const ready=fakeDb({'profiles.select':{data:null,error:null},'profiles.insert':{data:{user_id:owner,handle:'new_rider'},error:null}});
 const ok=request('PUT','/api/profile',{handle:'new_rider',accept_rules:true});
 assert.equal((await handleRiderSurfaces(ok.req,ok.url,'/api/profile','PUT',ready.db,owner))?.status,200);
 const insert=ready.calls.find(c=>c.table==='profiles'&&c.op==='insert')?.args[0] as any;
 assert.ok(insert.accepted_rules_at);assert.equal(insert.accept_rules,undefined);
});
