import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {readFile,readdir} from 'node:fs/promises';
import {postSchema,profileSchema} from '../server/rider-surfaces.ts';
import {chatSchema} from '../server/validation.ts';
import {photoUploadSchema} from '../server/rider-photos.ts';
const a='00000000-0000-4000-8000-0000000000a1',b='00000000-0000-4000-8000-0000000000b2',pa='00000000-0000-4000-8000-00000000f0a1',pb='00000000-0000-4000-8000-00000000f0b2',av='00000000-0000-4000-8000-00000000f0a9';

test('photo requests are bounded',()=>{
 assert.equal(postSchema.parse({category:'build',body:'Fresh top end',photo_ids:[pa]}).photo_ids.length,1);
 assert.deepEqual(postSchema.parse({category:'build',body:'No photos'}).photo_ids,[]);
 assert.throws(()=>postSchema.parse({category:'build',body:'x',photo_ids:[pa,pa,pa,pa,pa]}));
 assert.throws(()=>chatSchema.parse({conversation_id:a,request_id:b,message:'look',photo_ids:[pa,pa,pa,pa,pa]}));
 assert.equal(profileSchema.parse({handle:'rider_a',avatar_photo_id:av}).avatar_photo_id,av);
 assert.throws(()=>photoUploadSchema.parse({kind:'post',content_type:'application/pdf'}));
 assert.throws(()=>photoUploadSchema.parse({kind:'wallpaper'}));
});

test('riders can only attach their own photos, and only see their own photo rows',async()=>{
 const db=new PGlite();
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth,public to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`);
  for(const file of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort())await db.exec(await readFile('supabase/migrations/'+file,'utf8'));
  await db.exec(`insert into auth.users values('${a}'),('${b}');
   insert into public.rider_photos(id,user_id,kind,storage_path) values('${pa}','${a}','post','${a}/post/1.jpg'),('${pb}','${b}','post','${b}/post/2.jpg'),('${av}','${a}','avatar','${a}/avatar/3.jpg');`);
  const as=async(user:string)=>db.exec(`set role authenticated;set request.jwt.claim.sub='${user}';`);
  await as(a);
  await db.exec(`insert into public.profiles(user_id,handle,accepted_rules_at,avatar_photo_id) values('${a}','rider_a',now(),'${av}')`);
  await db.exec(`insert into public.posts(user_id,category,body,photo_ids) values('${a}','build','mine','{${pa}}')`);
  await assert.rejects(db.exec(`insert into public.posts(user_id,category,body,photo_ids) values('${a}','build','theirs','{${pb}}')`));
  await assert.rejects(db.exec(`insert into public.posts(user_id,category,body,photo_ids) values('${a}','build','wrong kind','{${av}}')`));
  await assert.rejects(db.exec(`update public.profiles set avatar_photo_id='${pa}' where user_id='${a}'`));
  assert.equal((await db.query(`select id from public.rider_photos`)).rows.length,2);
  await as(b);
  assert.equal((await db.query(`select id from public.rider_photos`)).rows.length,1);
 }finally{await db.close();}
});
