import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {readFile,readdir} from 'node:fs/promises';
import {askAboutNote,bikeLabel,changeTable,localNoteUploads,noteFromAnswer,noteTitle,plainAnswer,riderNote,scrubInternal,shareFileName,shareText,stockFor,PHOTO_CHECKS,photoCheck} from '../shared/tuning-notes.ts';
import {handleTuningNotes,saveAnswerSchema,saveOwnSchema,editNoteSchema} from '../server/tuning-notes.ts';
import type {EngineeringResponse} from '../shared/types.ts';

const me='00000000-0000-4000-8000-0000000000a1',other='00000000-0000-4000-8000-0000000000b2';
const bikeId='00000000-0000-4000-8000-0000000000d4',convId='00000000-0000-4000-8000-0000000000c1',msgId='00000000-0000-4000-8000-0000000000e1',noteId='00000000-0000-4000-8000-0000000000f1';
const bike={id:bikeId,model_year:2025,manufacturer:'KTM',model:'450 SX-F',nickname:'Blue'};
const response:EngineeringResponse={kind:'setup',summary:'Front pushes: soften fork compression.',
 answer:'## What is happening\nThe fork holds up too much on the flat corner entry, so the front **skates**.\n\n| Clicker | Now |\n|---|---|\n| Fork compression | 12 out |\n\nSee verified_claims [E12] in ktm_450sxf_2025_manual.pdf (claim 3f1c2a9e-1111-4222-8333-944445555666) https://example.com/manual',
 setup_changes:[{setting:'Fork compression',change:'2 clicks softer (out)',expect:'Front settles into the corner',go_back_if:'Front dives on braking'},{setting:'Rear sag',change:'105 mm',expect:'Rear sits lower',go_back_if:'Rear kicks'}],
 observations:[],systems:[],hypotheses:[],unknowns:[],next_step:null,evidence_ids:[],confidence:'SUPPORTED',
 specifications:[{claim_id:'c1',value:'Fork / Compression damping / Standard: 12 clicks out. Turn counter-clockwise to open.'},{claim_id:'c2',value:'Shock absorber / Rebound damping / Standard: 15 clicks out.'},{claim_id:'c3',value:'Shock absorber / Riding sag: 105 mm.'}]};

// ------------------------------------------------------------------ building notes
test('a saved answer keeps the question, the answer, the changes with stock values, the bike and the day',()=>{
 const n=noteFromAnswer({bike,question:'My front end pushes in flat corners. What should I change?',response,messageId:msgId,conversationId:convId,at:'2026-11-07T15:00:00.000Z'});
 assert.equal(n.bike_id,bikeId);
 assert.equal(n.title,'My front end pushes in flat corners');
 assert.equal(n.bike_label,'2025 KTM 450 SX-F “Blue”');
 assert.equal(n.source_message_id,msgId);assert.equal(n.conversation_id,convId);
 assert.match(n.answer,/skates/);
 assert.deepEqual(n.setup_changes,[{setting:'Fork compression',change:'2 clicks softer (out)',stock:'12 clicks out'},{setting:'Rear sag',change:'105 mm',stock:'105 mm'}]);
 assert.equal(noteFromAnswer({bike:null,question:'',response,messageId:null,conversationId:null,at:'2026-11-07T15:00:00Z'}).title,'Front pushes: soften fork compression','falls back to the summary');
 assert.equal(noteFromAnswer({bike:null,question:'x',response,messageId:null,conversationId:null,at:'2026-11-07T15:00:00Z'}).bike_label,'General question');
});

test('stock values only come from a clearly matching published value',()=>{
 assert.equal(stockFor('Fork compression',response.specifications),'12 clicks out');
 assert.equal(stockFor('Shock rebound',response.specifications),'15 clicks out');
 assert.equal(stockFor('Fork rebound',response.specifications),null,'no fork rebound value: no guess from the shock');
 assert.equal(stockFor('Shock high-speed compression',response.specifications),null,'speed must match');
 assert.equal(stockFor('Front tire pressure',[{value:'Tire pressure / Front: 15 psi'},{value:'Tire pressure / Rear: 15 psi'}]),'15 psi');
 assert.equal(stockFor('Bar position',response.specifications),null);
 assert.equal(stockFor('Fork compression',undefined),null);
});

test('titles, labels and the rider’s own note',()=>{
 assert.equal(noteTitle('  '),'Tuning note');
 assert.equal(noteTitle('Why? It bogs.'),'Why');
 assert.equal(noteTitle('x'.repeat(120)).length,80);
 assert.equal(bikeLabel({model_year:2024,manufacturer:'Honda',model:'CRF450R',nickname:''}),'2024 Honda CRF450R');
 const own=riderNote({bike,text:'Rebound 2 slower. Rear stayed down.',at:'2026-11-07T15:00:00Z'});
 assert.equal(own.title,'Rebound 2 slower');assert.equal(own.answer,'');assert.equal(own.rider_note,'Rebound 2 slower. Rear stayed down.');
});

// ------------------------------------------------------------------ the shared sheet
test('the setup sheet is plain text with bike, date, question, answer and a short changes table, and no internals',()=>{
 const n=noteFromAnswer({bike,question:'My front end pushes in flat corners.',response,messageId:msgId,conversationId:convId,at:'2026-11-07T15:00:00.000Z'});
 const text=shareText({...n,rider_note:'Tried it at Dade City, better.'});
 assert.match(text,/^BAK MX setup sheet\n2025 KTM 450 SX-F “Blue” · Nov 7, 2026\n/);
 assert.match(text,/QUESTION\nMy front end pushes in flat corners\./);
 assert.match(text,/BAK’S ANSWER\nWHAT IS HAPPENING\nThe fork holds up too much on the flat corner entry, so the front skates\./);
 assert.match(text,/• Clicker: Fork compression · Now: 12 out/);
 assert.match(text,/SETUP CHANGES \(one at a time, in this order\)\nSetting {11}Change {17}Stock\n-{16} {2}-{21} {2}-{13}\nFork compression {2}2 clicks softer \(out\) {2}12 clicks out\nRear sag {10}105 mm {17}105 mm\n/);
 assert.match(text,/MY NOTE\nTried it at Dade City, better\./);
 for(const bad of [/\*\*/,/##/,/[0-9a-f]{8}-[0-9a-f]{4}-/i,/\.pdf/,/verified_claims/,/\[E12\]/,/https?:/,/claim/i,new RegExp(msgId),new RegExp(convId),new RegExp(bikeId)])assert.doesNotMatch(text,bad);
 assert.doesNotMatch(JSON.stringify(text),/c1|c2|c3/,'no claim ids');
});

test('the changes table drops the stock column when nothing has a stock value; file names carry no ids',()=>{
 assert.deepEqual(changeTable([{setting:'Bars',change:'Roll forward 5 mm',stock:null}]),{head:['Setting','Change'],rows:[['Bars','Roll forward 5 mm']]});
 assert.deepEqual(changeTable([{setting:'Fork compression',change:'2 out',stock:'12 out'},{setting:'Bars',change:'fwd',stock:null}]).rows[1],['Bars','fwd','—']);
 assert.equal(shareFileName({bike_label:'2025 KTM 450 SX-F “Blue”',noted_at:'2026-11-07T15:00:00.000Z'}),'bakmx-setup-2025-ktm-450-sx-f-blue-2026-11-07.txt');
 assert.equal(plainAnswer('- one\n* two\n**bold** and *soft*'),'• one\n• two\nbold and soft');
 {const t=scrubInternal('Stock is 12 out [source: e7], from tester_baselines in notes.json, id 3f1c2a9e-1111-4222-8333-944445555666.');assert.match(t,/^Stock is 12 out, from/);for(const bad of [/e7/,/_/,/\.json/,/3f1c/])assert.doesNotMatch(t,bad);}
 const sheet=shareText(riderNote({bike,text:'Only my words',at:'2026-11-07T15:00:00Z'}));
 assert.doesNotMatch(sheet,/QUESTION|BAK’S ANSWER|SETUP CHANGES/);assert.match(sheet,/MY NOTE\nOnly my words/);
});

test('Ask BAK about a note puts the note in a few lines ahead of the rider’s follow-up',()=>{
 const n=noteFromAnswer({bike,question:'Front pushes in flat corners',response,messageId:msgId,conversationId:convId,at:'2026-11-07T15:00:00.000Z'});
 const t=askAboutNote({...n,rider_note:'Better, still pushes in sand'});
 assert.match(t,/^About my saved tuning note “Front pushes in flat corners” \(Nov 7, 2026\):\nI asked: Front pushes in flat corners\nChanges: Fork compression: 2 clicks softer \(out\); Rear sag: 105 mm\nMy note: Better, still pushes in sand\n\n$/);
 assert.doesNotMatch(t,new RegExp(msgId));
});

// ------------------------------------------------------------------ moving device notes to the account
test('device notes become uploads once, keeping their ids; broken rows and moved ones are skipped',()=>{
 const local=[{id:noteId,at:'2026-10-01T12:00:00.000Z',text:'Rebound 2 slower',conversation:convId},{id:'not-a-uuid',at:'x',text:'skip'},{id:'00000000-0000-4000-8000-0000000000f2',at:'garbage',text:'  ',conversation:''},{id:'00000000-0000-4000-8000-0000000000f3',at:'garbage',text:'Bars forward',conversation:'none'},null,'text'];
 const ups=localNoteUploads(local,bike);
 assert.deepEqual(ups.map(u=>u.id),[noteId,'00000000-0000-4000-8000-0000000000f3']);
 assert.deepEqual(ups[0].body,{id:noteId,bike_id:bikeId,rider_note:'Rebound 2 slower',noted_at:'2026-10-01T12:00:00.000Z',conversation_id:convId});
 assert.equal(ups[1].body.conversation_id,null);assert.equal(ups[1].body.noted_at,new Date(0).toISOString());
 assert.deepEqual(localNoteUploads(local,bike,[noteId]).map(u=>u.id),['00000000-0000-4000-8000-0000000000f3']);
 assert.deepEqual(localNoteUploads({not:'a list'},bike),[]);
 assert.ok(saveOwnSchema.safeParse(ups[0].body).success,'an upload is a valid own-note save');
});

test('photo checks: six checks, each with a prompt and a one-line shot tip',()=>{
 assert.deepEqual(PHOTO_CHECKS.map(c=>c.id),['spark_plug','tire_wear','chain_sprockets','fork_seal','air_filter','brake_pads']);
 for(const c of PHOTO_CHECKS){assert.ok(c.prompt.length<60&&c.tip.length<120&&!c.tip.includes('\n'),c.id);}
 assert.equal(photoCheck('spark_plug')?.prompt,'Read my spark plug.');assert.equal(photoCheck('nope'),null);
});

// ------------------------------------------------------------------ the route
type Q={table:string;op:string;row?:Record<string,unknown>;filters:[string,string,unknown][]};
function fakeDb(answer:(q:Q)=>{data?:unknown;error?:unknown}){
 const calls:Q[]=[];
 return {calls,from(table:string){const q:Q={table,op:'',filters:[]};calls.push(q);const b:any={
  select(){if(!q.op)q.op='select';return b;},insert(row:Record<string,unknown>){q.op='insert';q.row=row;return b;},update(row:Record<string,unknown>){q.op='update';q.row=row;return b;},delete(){q.op='delete';return b;},
  then(ok:(r:unknown)=>void,fail:(e:unknown)=>void){try{const r=answer(q);ok({data:r.data??null,error:r.error??null});}catch(e){fail(e);}}};
  for(const f of ['eq','is','lte','order','limit'])b[f]=(col:string,val:unknown)=>{q.filters.push([f,col,val]);return b;};
  for(const f of ['maybeSingle','single'])b[f]=()=>b;
  return b;}};
}
const req=(method:string,body?:unknown,query='')=>{const url=new URL('http://x/api/tuning-notes'+query);return [new Request(url,{method,...(body?{body:JSON.stringify(body)}:{})}),url,'/api/tuning-notes',method] as const;};

test('route validation: no ownership or moderation fields, names and notes bounded',()=>{
 assert.equal(saveAnswerSchema.safeParse({id:noteId,message_id:msgId,user_id:other}).success,false);
 assert.equal(saveOwnSchema.safeParse({id:noteId,bike_id:bikeId,rider_note:'x',removed_at:null}).success,false);
 assert.equal(saveOwnSchema.safeParse({id:noteId,bike_id:bikeId,rider_note:'   '}).success,false);
 assert.equal(saveOwnSchema.safeParse({id:noteId,bike_id:bikeId,rider_note:'x'.repeat(4001)}).success,false);
 assert.equal(editNoteSchema.safeParse({}).success,false);
 assert.equal(editNoteSchema.safeParse({title:''}).success,false);
 assert.equal(editNoteSchema.safeParse({title:'Dade City sand'}).success,true);
 assert.equal(editNoteSchema.safeParse({answer:'rewritten'}).success,false,'the saved answer is not rewritten');
});

test('POST from a BAK answer builds the note on the server from the rider’s own message, chat and bike',async()=>{
 const db=fakeDb(q=>{
  if(q.table==='messages'&&q.filters.some(f=>f[1]==='id'))return {data:{id:msgId,conversation_id:convId,role:'assistant',response,created_at:'2026-11-07T15:00:00Z'}};
  if(q.table==='messages')return {data:[{content:'Front pushes in flat corners'}]};
  if(q.table==='conversations')return {data:{id:convId,bike_id:bikeId}};
  if(q.table==='bikes')return {data:bike};
  if(q.table==='tuning_notes'&&q.op==='insert')return {data:{...q.row}};
  throw new Error('unexpected '+q.table+' '+q.op);
 });
 const res=await handleTuningNotes(...req('POST',{id:noteId,message_id:msgId}),db as never,me);
 assert.equal(res!.status,201);
 const ins=db.calls.find(c=>c.op==='insert')!;
 assert.equal(ins.row!.user_id,me);assert.equal(ins.row!.id,noteId);assert.equal(ins.row!.bike_id,bikeId);assert.equal(ins.row!.question,'Front pushes in flat corners');
 assert.deepEqual((ins.row!.setup_changes as {stock:string}[]).map(c=>c.stock),['12 clicks out','105 mm']);
 for(const c of db.calls)assert.ok(c.filters.some(f=>f[1]==='user_id'&&f[2]===me)||c.op==='insert','every read is scoped to the rider');
 const userQ=db.calls.find(c=>c.table==='messages'&&c.filters.some(f=>f[1]==='role'&&f[2]==='user'))!;
 assert.ok(userQ.filters.some(f=>f[0]==='lte'&&f[1]==='created_at'),'the question is the one before the answer');
});

test('POST again returns the saved note; a general chat or someone else’s answer cannot be saved',async()=>{
 let mode='dup';
 const db=fakeDb(q=>{
  if(q.table==='messages'&&q.filters.some(f=>f[1]==='id'))return {data:mode==='missing'?null:{id:msgId,conversation_id:convId,role:'assistant',response,created_at:'2026-11-07T15:00:00Z'}};
  if(q.table==='messages')return {data:[]};
  if(q.table==='conversations')return {data:{id:convId,bike_id:mode==='general'?null:bikeId}};
  if(q.table==='bikes')return {data:bike};
  if(q.table==='tuning_notes'&&q.op==='insert')return {error:{code:'23505'}};
  if(q.table==='tuning_notes'&&q.filters.some(f=>f[1]==='id'))return {data:null};
  if(q.table==='tuning_notes'&&q.filters.some(f=>f[1]==='source_message_id'))return {data:{id:'existing',title:'Saved before'}};
  throw new Error('unexpected');
 });
 const again=await handleTuningNotes(...req('POST',{id:noteId,message_id:msgId}),db as never,me);
 assert.equal(again!.status,200);assert.equal((await again!.json()).id,'existing');
 mode='general';await assert.rejects(handleTuningNotes(...req('POST',{id:noteId,message_id:msgId}),db as never,me),/general question/);
 mode='missing';await assert.rejects(handleTuningNotes(...req('POST',{id:noteId,message_id:msgId}),db as never,me),/could not be found/);
});

test('DELETE only sets removed_at; PATCH renames live notes; GET hides removed notes',async()=>{
 const db=fakeDb(q=>{if(q.op==='update')return {data:q.row!.removed_at?[{id:noteId}]:{id:noteId,...q.row}};if(q.op==='select')return {data:[]};throw new Error('unexpected '+q.op);});
 assert.equal((await handleTuningNotes(...req('DELETE',undefined,'?id='+noteId),db as never,me))!.status,200);
 assert.equal((await handleTuningNotes(...req('PATCH',{title:'Sand setup'},'?id='+noteId),db as never,me))!.status,200);
 await handleTuningNotes(...req('GET',undefined,'?bike_id='+bikeId),db as never,me);
 assert.ok(!db.calls.some(c=>c.op==='delete'),'never a hard delete');
 const [del,patch,get]=db.calls;
 assert.ok(typeof del.row!.removed_at==='string');
 for(const c of [del,patch,get])assert.ok(c.filters.some(f=>f[0]==='is'&&f[1]==='removed_at'&&f[2]===null)&&c.filters.some(f=>f[1]==='user_id'&&f[2]===me));
 assert.equal(patch.row!.title,'Sand setup');
 assert.equal(await handleTuningNotes(new Request('http://x/api/other'),new URL('http://x/api/other'),'/api/other','GET',db as never,me),null);
});

// ------------------------------------------------------------------ the migration
test('migration: guarded, additive, no DELETE or DROP',async()=>{
 const sql=await readFile('supabase/migrations/20261107160000_tuning_notes.sql','utf8');
 const code=sql.split('\n').filter(l=>!l.trim().startsWith('--')).join('\n');
 assert.doesNotMatch(code,/\bdelete\s+from\b|\bdrop\s+(table|column|policy|index|constraint)\b|\btruncate\b/i);
 assert.doesNotMatch(code,/\bgrant\b[^;]*\bdelete\b/i,'riders get no DELETE');
 assert.match(code,/create table if not exists public\.tuning_notes/);
 assert.match(code,/removed_at timestamptz/);
});

test('migration: own rows on own bikes only, soft delete, removed notes stay removed, re-runnable',async()=>{
 const db=new PGlite();
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth,public to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`);
  const files=(await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort();
  for(const file of files)await db.exec(await readFile('supabase/migrations/'+file,'utf8'));
  // Applying it again changes nothing and does not fail.
  await db.exec(await readFile('supabase/migrations/20261107160000_tuning_notes.sql','utf8'));
  await db.exec(`insert into auth.users values('${me}'),('${other}');
   insert into public.bikes(id,user_id,manufacturer,model,model_year,variant,region) values('${bikeId}','${me}','KTM','450 SX-F',2025,'standard','US');
   insert into public.conversations(id,user_id,bike_id,title,mode) values('${convId}','${me}','${bikeId}','Front pushes','setup');
   insert into public.messages(id,conversation_id,user_id,role,content,response) values('${msgId}','${convId}','${me}','assistant','x','{}');`);
  const as=async(user:string)=>db.exec(`set role authenticated;set request.jwt.claim.sub='${user}';`);
  const rows=async(sql:string)=>(await db.query(sql)).rows.length;
  await as(me);
  await db.exec(`insert into public.tuning_notes(id,user_id,bike_id,conversation_id,source_message_id,title,answer,setup_changes,bike_label) values('${noteId}','${me}','${bikeId}','${convId}','${msgId}','Front pushes','Soften the fork','[{"setting":"Fork compression","change":"2 out","stock":"12 out"}]','2025 KTM 450 SX-F')`);
  // The same answer saved twice: one live note.
  await assert.rejects(db.exec(`insert into public.tuning_notes(user_id,bike_id,source_message_id,title,answer) values('${me}','${bikeId}','${msgId}','Again','x')`));
  await assert.rejects(db.exec(`insert into public.tuning_notes(user_id,bike_id,title) values('${me}','${bikeId}','Empty')`),'a note needs an answer or the rider’s words');
  await assert.rejects(db.exec(`insert into public.tuning_notes(user_id,bike_id,title,rider_note,removed_at) values('${me}','${bikeId}','x','y',now())`),'riders cannot write a removed note');
  await as(other);
  assert.equal(await rows('select * from public.tuning_notes'),0,'another rider sees nothing');
  await assert.rejects(db.exec(`insert into public.tuning_notes(user_id,bike_id,title,rider_note) values('${other}','${bikeId}','On your bike','x')`),'not on someone else’s bike');
  await assert.rejects(db.exec(`insert into public.tuning_notes(user_id,bike_id,title,rider_note) values('${me}','${bikeId}','As you','x')`),'not as someone else');
  assert.equal((await db.query(`update public.tuning_notes set title='hijack' returning id`)).rows.length,0);
  await as(me);
  await assert.rejects(db.exec(`delete from public.tuning_notes where id='${noteId}'`),'no hard delete');
  await assert.rejects(db.exec(`update public.tuning_notes set answer='rewritten' where id='${noteId}'`),'the saved answer is not rewritten');
  assert.equal((await db.query(`update public.tuning_notes set title='Dade City sand',updated_at=now() where id='${noteId}' returning id`)).rows.length,1);
  assert.equal((await db.query(`update public.tuning_notes set removed_at=now() where id='${noteId}' returning id`)).rows.length,1);
  assert.equal((await db.query(`update public.tuning_notes set removed_at=null where id='${noteId}' returning id`)).rows.length,0,'a removed note stays removed');
  assert.equal(await rows(`select * from public.tuning_notes where removed_at is null`),0);
  // Removed, so the same answer can be saved again.
  await db.exec(`insert into public.tuning_notes(user_id,bike_id,source_message_id,title,answer) values('${me}','${bikeId}','${msgId}','Again','x')`);
  await db.exec(`set role anon;`);
  await assert.rejects(db.query('select * from public.tuning_notes'));
 }finally{await db.close();}
});
