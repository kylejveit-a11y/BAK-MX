import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {readFile,readdir} from 'node:fs/promises';
const a='00000000-0000-4000-8000-0000000000a1',b='00000000-0000-4000-8000-0000000000b2',c='00000000-0000-4000-8000-0000000000c3',bike='00000000-0000-4000-8000-0000000000d4';
test('rider surfaces enforce ownership, profile-before-publish, blocks and service-only catalog writes',async()=>{
 const db=new PGlite();
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth,public to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`);
  for(const file of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort())await db.exec(await readFile('supabase/migrations/'+file,'utf8'));
  await db.exec(`insert into auth.users values('${a}'),('${b}'),('${c}');insert into public.bikes(id,user_id,manufacturer,model,model_year,variant,region) values('${bike}','${a}','KTM','450 SX-F',2025,'standard','US');`);
  const as=async(user:string)=>db.exec(`set role authenticated;set request.jwt.claim.sub='${user}';`);
  const count=async(sql:string)=>(await db.query(sql)).rows.length;
  await as(a);
  // No profile yet: publishing is refused.
  await assert.rejects(db.exec(`insert into public.posts(user_id,category,body) values('${a}','general','hello')`));
  await assert.rejects(db.exec(`insert into public.profiles(user_id,handle,accepted_rules_at) values('${b}','forged',now())`));
  await assert.rejects(db.exec(`insert into public.profiles(user_id,handle,accepted_rules_at) values('${a}','Bad Handle',now())`));
  await assert.rejects(db.exec(`insert into public.profiles(user_id,handle) values('${a}','rider_a')`));
  await db.exec(`insert into public.profiles(user_id,handle,display_name,accepted_rules_at) values('${a}','rider_a','Rider A',now())`);
  await db.exec(`insert into public.posts(id,user_id,category,body) values('00000000-0000-4000-8000-00000000aaaa','${a}','setup_question','Front end pushes in flat corners')`);
  await db.exec(`insert into public.events(id,user_id,title,event_type,starts_at,location_name) values('00000000-0000-4000-8000-00000000eeee','${a}','Practice night','practice',now()+interval '3 days','Local track')`);
  await db.exec(`insert into public.setup_logs(user_id,bike_id,recorded_at,settings,result) values('${a}','${bike}',now(),'{"fork_compression":"12 clicks out"}','better')`);
  await assert.rejects(db.exec(`insert into public.posts(user_id,category,body) values('${b}','general','as someone else')`));
  await as(b);
  await db.exec(`insert into public.profiles(user_id,handle,accepted_rules_at) values('${b}','rider_b',now())`);
  await assert.rejects(db.exec(`insert into public.profiles(user_id,handle,accepted_rules_at) values('${b}','rider_a',now())`));
  assert.equal(await count('select * from public.posts'),1);
  assert.equal(await count('select * from public.setup_logs'),0);
  await assert.rejects(db.exec(`insert into public.setup_logs(user_id,bike_id,recorded_at) values('${b}','${bike}',now())`));
  await db.exec(`insert into public.post_comments(post_id,user_id,body) values('00000000-0000-4000-8000-00000000aaaa','${b}','Try two clicks softer on fork compression')`);
  await db.exec(`insert into public.post_likes(post_id,user_id) values('00000000-0000-4000-8000-00000000aaaa','${b}')`);
  await db.exec(`insert into public.event_rsvps(event_id,user_id,status) values('00000000-0000-4000-8000-00000000eeee','${b}','going')`);
  await db.exec(`insert into public.direct_messages(sender_id,recipient_id,body) values('${b}','${a}','What track?')`);
  await assert.rejects(db.exec(`insert into public.direct_messages(sender_id,recipient_id,body) values('${a}','${b}','forged sender')`));
  await assert.rejects(db.exec(`insert into public.direct_messages(sender_id,recipient_id,body) values('${b}','${c}','no profile recipient')`));
  assert.equal((await db.query(`update public.posts set body='edited by another rider' where id='00000000-0000-4000-8000-00000000aaaa' returning id`)).rows.length,0);
  assert.equal((await db.query(`delete from public.events where id='00000000-0000-4000-8000-00000000eeee' returning id`)).rows.length,0);
  await db.exec(`insert into public.content_reports(reporter_id,target_type,target_id,reason) values('${b}','post','00000000-0000-4000-8000-00000000aaaa','test report')`);
  await db.exec(`insert into public.feedback(user_id,category,body) values('${b}','missing_data','No clicker baseline for my bike')`);
  await assert.rejects(db.exec(`insert into public.part_catalogs(manufacturer,model,model_year,variant,region,source) values('KTM','450 SX-F',2025,'standard','US','x')`));
  // Third rider cannot read a private thread, reports or feedback.
  await as(c);
  assert.equal(await count('select * from public.direct_messages'),0);
  assert.equal(await count('select * from public.content_reports'),0);
  assert.equal(await count('select * from public.feedback'),0);
  // A blocks B: each disappears from the other's community view and messaging stops.
  await as(a);
  assert.equal(await count('select * from public.direct_messages'),1);
  await db.exec(`insert into public.user_blocks(blocker_id,blocked_id) values('${a}','${b}')`);
  assert.equal(await count('select * from public.post_comments'),0);
  assert.equal(await count(`select * from public.profiles where user_id='${b}'`),0);
  await as(b);
  assert.equal(await count('select * from public.posts'),0);
  assert.equal(await count('select * from public.events'),0);
  assert.equal(await count('select * from public.user_blocks'),0);
  await assert.rejects(db.exec(`insert into public.direct_messages(sender_id,recipient_id,body) values('${b}','${a}','after block')`));
  await assert.rejects(db.exec(`insert into public.post_comments(post_id,user_id,body) values('00000000-0000-4000-8000-00000000aaaa','${b}','after block')`));
  await db.exec(`set role anon;`);
  await assert.rejects(db.query('select * from public.posts'));
  await assert.rejects(db.query('select * from public.parts'));
  // Service role loads catalog data; riders read it.
  await db.exec(`reset role;set role service_role;insert into public.part_catalogs(id,manufacturer,model,model_year,variant,region,source) values('00000000-0000-4000-8000-00000000cccc','KTM','450 SX-F',2025,'standard','US','Official KTM US catalog');insert into public.part_assemblies(id,catalog_id,external_id,name) values('00000000-0000-4000-8000-00000000dddd','00000000-0000-4000-8000-00000000cccc','1','Front fork');insert into public.parts(assembly_id,callout,part_number,description,quantity_raw) values('00000000-0000-4000-8000-00000000dddd','1','A46001000','Fork leg','1');`);
  await as(c);
  assert.equal(await count('select * from public.parts'),1);
  // Deleting an account removes that rider's content.
  await db.exec(`reset role;delete from auth.users where id='${a}';`);
  assert.equal(await count('select * from public.posts'),0);
  assert.equal(await count('select * from public.setup_logs'),0);
  assert.equal(await count('select * from public.direct_messages'),0);
 }finally{await db.close();}
});
