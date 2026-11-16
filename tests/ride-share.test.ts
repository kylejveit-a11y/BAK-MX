import test from 'node:test';
import assert from 'node:assert/strict';
import {HEADING_OUT,SAFETY,alertEmail,allClearEmail,extendedTimes,lastSeen,publicView,rideTimes,startEmail} from '../shared/ride-share.ts';
import {contactSchema,positionSchema,startSchema,runSafetyCron} from '../server/ride-shares.ts';
const now=Date.parse('2026-11-15T18:00:00Z');
const row={rider_name:'Kyle',expires_at:'2026-11-15T20:00:00Z',ended_at:null,last_lat:28.1,last_lng:-82.3,last_accuracy_m:30,last_at:'2026-11-15T17:55:00Z'};
test('public view shows only the name, back-by and last point while active',()=>{
 const v=publicView({...row,back_by:'2026-11-15T19:00:00Z',alerted_at:null},now);assert.equal(v.state,'active');assert.equal(v.overdue,false);
 assert.deepEqual(Object.keys(v).sort(),['back_by','expires_at','last','overdue','rider_name','state']);
 assert.equal(publicView({...row,ended_at:'2026-11-15T17:58:00Z'},now).last,null);
 assert.equal(publicView({...row,expires_at:'2026-11-15T17:00:00Z'},now).state,'expired');
 assert.equal(publicView({...row,alerted_at:'2026-11-15T17:59:00Z'},now).overdue,true);
});
test('last seen wording',()=>{assert.equal(lastSeen(null,now),'No location yet');assert.equal(lastSeen('2026-11-15T17:30:00Z',now),'Last seen 30 min ago');});
test('nothing can alert before back-by plus the 30-minute cushion; the link outlives the alert but never 13 hours',()=>{
 const t=rideTimes(now,120);assert.equal(Date.parse(t.alert_at)-Date.parse(t.back_by),SAFETY.graceMin*60e3);
 assert.equal(Date.parse(t.back_by),now+120*60e3);assert.ok(Date.parse(t.expires_at)>Date.parse(t.alert_at));
 const long=rideTimes(now,SAFETY.maxBackByMin);assert.ok(Date.parse(long.expires_at)<now+13*3600e3);assert.ok(Date.parse(long.expires_at)>Date.parse(long.alert_at));
});
test('adding time counts from the later of now and back-by, and is bounded',()=>{
 const created=now,bb=now+60*60e3;
 assert.equal(Date.parse(extendedTimes(created,bb,now,30).back_by),bb+30*60e3);
 const late=now+90*60e3;assert.equal(Date.parse(extendedTimes(created,bb,late,30).back_by),late+30*60e3);
 const capped=extendedTimes(created,now+500*60e3,now+500*60e3,240);assert.ok(Date.parse(capped.expires_at)<created+13*3600e3);
});
test('emails are calm and in the rider’s time zone',()=>{
 const a=alertEmail('Kyle','https://bakmx.com/s/x','2026-11-15T20:00:00Z','2026-11-15T19:40:00Z','Dade City MX','America/New_York');
 assert.match(a.text,/3:00 PM EST/);assert.match(a.text,/Try calling or texting them first/);assert.match(a.text,/https:\/\/bakmx\.com\/s\/x/);
 assert.match(startEmail('Kyle','u','2026-11-15T20:00:00Z','','America/New_York').text,/3:00 PM EST plus a 30-minute cushion/);
 assert.match(allClearEmail('','2026-11-15T20:10:00Z','America/Chicago').text,/Your rider checked in .* 2:10 PM CST/);
});
test('schemas: back-by bounds, contacts need a phone or email',()=>{
 assert.ok(startSchema.safeParse({back_by_min:120,tz:'America/New_York'}).success);assert.ok(!startSchema.safeParse({back_by_min:5}).success);assert.ok(!startSchema.safeParse({back_by_min:9999}).success);
 assert.ok(!startSchema.safeParse({back_by_min:60,tz:'x;drop'}).success);
 assert.ok(contactSchema.safeParse({name:'Bella',email:'b@example.com'}).success);assert.ok(contactSchema.safeParse({name:'Bella',phone:'(813) 555-0123'}).success);
 assert.ok(!contactSchema.safeParse({name:'Bella'}).success);assert.ok(!contactSchema.safeParse({name:'Bella',email:'nope'}).success);
 assert.ok(positionSchema.safeParse({id:'5b9f0c1e-1a2b-4c3d-8e9f-0a1b2c3d4e5f',lat:28,lng:-82,at:'2026-11-15T17:00:00Z'}).success);
});
test('chat offers ride safety only for heading-out talk',()=>{
 for(const q of ['before we head out what should I check','about to ride, what are my settings','heading out to the track now','first moto in 20 min'])assert.ok(HEADING_OUT.test(q),q);
 for(const q of ['what oil do I use','my bike bottoms on landings','how often should I change the air filter'])assert.ok(!HEADING_OUT.test(q),q);
});
// A tiny fake of the database for the alert run: one ride past its alert time, then a second run sends nothing more.
function fakeAdmin(rows:any[],contacts:any[]){
 const api=(table:string)=>{let list=table==='ride_shares'?rows:contacts;const f:any={};let patch:any=null,filters:((r:any)=>boolean)[]=[];
  const run=()=>{let r=list.filter(x=>filters.every(fl=>fl(x)));if(patch){r.forEach(x=>Object.assign(x,patch));}return r;};
  Object.assign(f,{select:()=>f,update:(p:any)=>{patch=p;return f;},eq:(k:string,v:any)=>{filters.push(r=>r[k]===v);return f;},is:(k:string,v:any)=>{filters.push(r=>(r[k]??null)===v);return f;},
   lte:(k:string,v:any)=>{filters.push(r=>r[k]<=v);return f;},gt:(k:string,v:any)=>{filters.push(r=>r[k]>v);return f;},or:()=>f,order:()=>f,limit:()=>f,
   maybeSingle:async()=>({data:run()[0]??null}),then:(res:any)=>res({data:run(),error:null})});return f;};
 return {from:api} as any;
}
test('the alert goes once, only when due, and only by email',async()=>{
 process.env.RESEND_API_KEY='test';const sent:any[]=[];const orig=globalThis.fetch;
 globalThis.fetch=(async(_u:any,o:any)=>{sent.push(JSON.parse(o.body));return new Response('{}',{status:200});}) as any;
 try{
  const rows=[{id:'a',user_id:'u',rider_name:'Kyle',track_name:'',tz:'America/New_York',back_by:'2026-11-15T17:00:00Z',alert_at:'2026-11-15T17:30:00Z',expires_at:'2026-11-15T21:30:00Z',ended_at:null,alerted_at:null,alert_claimed_at:null,last_at:null,link_secret:'A'.repeat(32)},
   {id:'b',user_id:'u',rider_name:'Kyle',track_name:'',tz:'',back_by:'2026-11-15T19:00:00Z',alert_at:'2026-11-15T19:30:00Z',expires_at:'2026-11-15T23:30:00Z',ended_at:null,alerted_at:null,alert_claimed_at:null,last_at:null,link_secret:null}];
  const admin=fakeAdmin(rows,[{id:'c',user_id:'u',name:'Bella',phone:'',email:'b@example.com'}]);
  const r1=await runSafetyCron(admin,new Date('2026-11-15T17:31:00Z'));
  assert.equal(r1.alerted,1);assert.equal(sent.length,1);assert.deepEqual(sent[0].to,['b@example.com']);assert.match(sent[0].text,/bakmx\.com\/s\/A{32}/);
  const r2=await runSafetyCron(admin,new Date('2026-11-15T17:32:00Z'));assert.equal(r2.alerted,0);assert.equal(sent.length,1);
 }finally{globalThis.fetch=orig;delete process.env.RESEND_API_KEY;}
});
