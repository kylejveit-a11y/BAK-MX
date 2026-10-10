import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {readFile,readdir} from 'node:fs/promises';
import {createRecord,createInput} from '../server/create-record.ts';
import {bikeSchema,serviceSchema} from '../server/validation.ts';
import {createAttempt} from '../shared/create-retry.ts';
const owner='10000000-0000-4000-8000-000000000001',other='10000000-0000-4000-8000-000000000002',bikeId='10000000-0000-4000-8000-000000000003',serviceId='10000000-0000-4000-8000-000000000004';
// PostgREST-shaped transport backed by the real migrated PostgreSQL tables/RLS.
function adapter(pg:PGlite):any{return {from(table:string){return {
 insert(value:Record<string,unknown>){return {select(){return {async single(){try{const fields=Object.keys(value),rows=await pg.query(`insert into public.${table} (${fields.join(',')}) values (${fields.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,fields.map(k=>typeof value[k]==='object'&&value[k]!==null?JSON.stringify(value[k]):value[k]));return {data:rows.rows[0],error:null};}catch(error){return {data:null,error};}}};}};},
 select(){const filters:[string,unknown][]=[];const query={eq(key:string,value:unknown){filters.push([key,value]);return query;},async maybeSingle(){try{const result=await pg.query(`select * from public.${table} where ${filters.map(([key],i)=>key+'=$'+(i+1)).join(' and ')}`,filters.map(([,value])=>value));return {data:result.rows[0]??null,error:null};}catch(error){return {data:null,error};}}};return query;}
 };}};}

test('stable create retries use one row, reject changed input and preserve owner isolation in PostgreSQL',async()=>{
 const pg=new PGlite();try{
  await pg.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth,public to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`);
  for(const file of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort())await pg.exec(await readFile('supabase/migrations/'+file,'utf8'));
  await pg.exec(`insert into auth.users values('${owner}'),('${other}');set role authenticated;set request.jwt.claim.sub='${owner}';`);
  const db=adapter(pg),bike=bikeSchema.parse({manufacturer:'Yamaha',model:'YZ450F',model_year:2026,variant:'standard',region:'US',configuration:{suspension:'stock',engine:'stock'}});
  const [first,retry]=await Promise.all([createRecord(db,'bikes',owner,bike,bikeId),createRecord(db,'bikes',owner,{...bike,configuration:{engine:'stock',suspension:'stock'}},bikeId)]);
  assert.equal(first.record.id,bikeId);assert.equal(retry.record.id,bikeId);assert.equal([first,retry].filter(r=>r.replayed).length,1);
  assert.equal((await pg.query('select * from bikes')).rows.length,1);
  await assert.rejects(createRecord(db,'bikes',owner,{...bike,nickname:'Changed request'},bikeId),{status:409});
  const service=serviceSchema.parse({bike_id:bikeId,category:'Valve inspection',performed_at:'2026-09-13',engine_hours:10,notes:'Measured cold',next_due_hours:null,interval_source:''});
  assert.equal((await createRecord(db,'service_events',owner,service,serviceId)).replayed,false);
  assert.equal((await createRecord(db,'service_events',owner,service,serviceId)).replayed,true);
  await assert.rejects(createRecord(db,'service_events',owner,{...service,notes:'Different measurements'},serviceId),{status:409});
  assert.equal((await pg.query('select * from service_events')).rows.length,1);
  const conversation={bike_id:bikeId,title:'Check cold clearance',mode:'diagnose'},conversationId='10000000-0000-4000-8000-000000000005';
  assert.equal((await createRecord(db,'conversations',owner,conversation,conversationId)).replayed,false);
  assert.equal((await createRecord(db,'conversations',owner,conversation,conversationId)).replayed,true);
  await assert.rejects(createRecord(db,'conversations',owner,{...conversation,mode:'setup'},conversationId),{status:409});
  assert.equal((await pg.query('select * from conversations')).rows.length,1);
  await pg.exec(`set request.jwt.claim.sub='${other}';`);
  await assert.rejects(createRecord(db,'bikes',other,bike,bikeId),{status:409});
  assert.equal((await pg.query('select * from bikes')).rows.length,0);
 }finally{await pg.close();}
});
test('client create identity survives serialization and changes only for changed input',()=>{
 const original={configuration:{fork:'stock',shock:'stock'},nickname:'My bike'};
 const first=createAttempt(null,original,()=>bikeId),restored=JSON.parse(JSON.stringify(first));
 assert.equal(createAttempt(restored,{nickname:'My bike',configuration:{shock:'stock',fork:'stock'}},()=>other).id,bikeId);
 assert.equal(createAttempt(restored,{...original,nickname:'Another bike'},()=>other).id,other);
 assert.equal(createAttempt({id:'corrupt',payload:first.payload},original,()=>other).id,other);
 assert.deepEqual(createInput({create_id:bikeId,nickname:'My bike'}),{id:bikeId,data:{nickname:'My bike'}});
 assert.throws(()=>createInput({create_id:'invalid'}));
});
