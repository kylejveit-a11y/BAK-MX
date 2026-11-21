import test from 'node:test';
import assert from 'node:assert/strict';
import {redeemInvite,rewardJoin,runInviteCron,inviteSummary} from '../server/invites.ts';
import {resolveTier} from '../server/plans.ts';

/** A small in-memory stand-in for the database client: just the calls the invite code makes. */
type Row=Record<string,unknown>;
function fakeDb(tables:Record<string,Row[]>,users:Record<string,{email_confirmed_at:string|null}>){
 const uniq:Record<string,string[]>={invite_codes:['user_id','code'],invites:['friend_id'],invite_offer_codes:['code']};
 function q(name:string){
  const rows=()=>tables[name]??=[];
  let filt:((r:Row)=>boolean)[]=[],op:'select'|'update'|'insert'='select',patch:Row={},lim=Infinity,head=false,ord:string|null=null,err:unknown=null;
  const run=()=>{if(err)return {data:null,error:err,count:null};let hit=rows().filter(r=>filt.every(f=>f(r)));
   if(op==='update')hit.forEach(r=>Object.assign(r,patch));
   if(ord)hit=[...hit].sort((a,b)=>String(a[ord!]??'').localeCompare(String(b[ord!]??'')));
   return {data:head?null:hit.slice(0,lim).map(r=>({...r})),error:null,count:hit.length};};
  const b:Record<string,unknown>={
   select:(_c?:string,o?:{head?:boolean})=>{if(o?.head)head=true;return b;},
   insert:(r:Row)=>{op='insert';const all=rows();for(const k of uniq[name]??[])if(all.some(x=>x[k]===r[k])){err={code:'23505'};return b;}
    if(name==='invite_months'&&all.some(x=>x.user_id===r.user_id&&x.seq===r.seq)){err={code:'23505'};return b;}
    all.push({id:name+all.length,created_at:new Date().toISOString(),added_at:'a',joined_rewarded_at:null,paid_since:null,paid_counted_at:null,offer_code:null,given_to:null,...r});return b;},
   update:(p:Row)=>{op='update';patch=p;return b;},
   eq:(k:string,v:unknown)=>{filt.push(r=>r[k]===v);return b;},
   is:(k:string,v:unknown)=>{filt.push(r=>(r[k]??null)===v);return b;},
   not:(k:string,_o:string,v:unknown)=>{filt.push(r=>(r[k]??null)!==v);return b;},
   gt:(k:string,v:string)=>{filt.push(r=>String(r[k])>v);return b;},
   lte:(k:string,v:string)=>{filt.push(r=>String(r[k])<=v);return b;},
   order:(k:string)=>{ord=k;return b;},limit:(n:number)=>{lim=n;return b;},
   maybeSingle:async()=>{const r=run();return {data:r.data?.[0]??null,error:r.error};},
   then:(res:(v:unknown)=>unknown,rej?:(e:unknown)=>unknown)=>Promise.resolve(run()).then(res,rej),
  };return b;
 }
 return {from:q,auth:{admin:{getUserById:async(id:string)=>({data:{user:users[id]??null},error:null})}}} as never;
}
const iso=(d:string)=>new Date(d).toISOString();
function world(){
 const grants:string[]=[];const grant=(async(u:string,n:number,ref:string)=>{if(grants.some(g=>g.endsWith(ref)))return false;grants.push(`${u}+${n}:${ref}`);return true;}) as never;
 const tables:Record<string,Row[]>={invite_codes:[{user_id:'kyle',code:'KYLE-7Q2'},{user_id:'f1',code:'FONE-AAA'}],invites:[],bikes:[],invite_months:[],invite_offer_codes:[],subscriptions:[],mobile_entitlements:[],complimentary_access:[],profiles:[]};
 const users:Record<string,{email_confirmed_at:string|null}>={kyle:{email_confirmed_at:'x'},f1:{email_confirmed_at:'x'},f2:{email_confirmed_at:null},f3:{email_confirmed_at:'x'},f4:{email_confirmed_at:'x'}};
 return {grants,grant,tables,db:fakeDb(tables,users),users};
}
const fresh=(id:string)=>({id,created_at:new Date().toISOString()});

test('invite: entering a code, and who cannot',async()=>{
 const w=world();
 await assert.rejects(redeemInvite(fresh('f1'),'nope-123',w.db,w.grant),/not right/);
 await assert.rejects(redeemInvite(fresh('kyle'),'kyle-7q2',w.db,w.grant),/your own code/);
 await assert.rejects(redeemInvite({id:'f1',created_at:iso('2020-01-01')},'KYLE-7Q2',w.db,w.grant),/first 14 days/);
 await redeemInvite(fresh('f1'),' kyle-7q2 ',w.db,w.grant);
 await assert.rejects(redeemInvite(fresh('f1'),'KYLE-7Q2',w.db,w.grant),/already entered/);
 await assert.rejects(redeemInvite(fresh('kyle'),'FONE-AAA',w.db,w.grant),/You invited this rider/);
 assert.equal(w.grants.length,0,'no reward until the friend has a bike');
});
test('invite: 10 questions once, only after a confirmed email and a bike',async()=>{
 const w=world();
 await redeemInvite(fresh('f1'),'KYLE-7Q2',w.db,w.grant);await redeemInvite(fresh('f2'),'KYLE-7Q2',w.db,w.grant);
 assert.equal(await rewardJoin('f1',w.db,w.grant),false);
 w.tables.bikes.push({id:'b1',user_id:'f1'},{id:'b2',user_id:'f2'});
 assert.equal(await rewardJoin('f1',w.db,w.grant),true);assert.equal(await rewardJoin('f1',w.db,w.grant),false);
 assert.equal(await rewardJoin('f2',w.db,w.grant),false,'email not confirmed');
 assert.deepEqual(w.grants,['kyle+10:invite-join-f1']);
 w.users.f2.email_confirmed_at='x';const r=await runInviteCron(w.db,new Date(),w.grant);assert.equal(r.joined,1);
 const s=await inviteSummary(fresh('kyle'),w.db);assert.equal(s.code,'KYLE-7Q2');assert.equal(s.joined,2);assert.equal(s.questions_earned,20);assert.equal(s.waiting,0);
});
test('invite: three friends paid for two weeks earn a month; a free inviter gets Premium opened for 30 days',async()=>{
 const w=world();process.env.MOBILE_PREMIUM_PRODUCT_IDS='prem_m';process.env.MOBILE_PRO_PRODUCT_IDS='pro_m';
 for(const f of ['f1','f3','f4']){await redeemInvite(fresh(f),'KYLE-7Q2',w.db,w.grant);w.tables.bikes.push({id:'b'+f,user_id:f});await rewardJoin(f,w.db,w.grant);
  w.tables.mobile_entitlements.push({user_id:f,status:'active',current_period_end:iso('2030-01-01'),product_identifier:'prem_m',is_sandbox:false,store:'app_store'});}
 const t0=new Date('2026-12-01T00:00:00Z');
 let r=await runInviteCron(w.db,t0,w.grant);assert.equal(r.counted,0);assert.ok(w.tables.invites.every(i=>i.paid_since));
 // One friend cancels and is refunded before the two weeks are up: the clock resets for them.
 w.tables.mobile_entitlements[2].status='none';
 r=await runInviteCron(w.db,new Date('2026-12-16T00:00:00Z'),w.grant);assert.equal(r.counted,2);assert.equal(r.months,0);
 assert.equal(await resolveTier('kyle',w.db),'free');
 w.tables.mobile_entitlements[2].status='active';
 await runInviteCron(w.db,new Date('2026-12-17T00:00:00Z'),w.grant);
 r=await runInviteCron(w.db,new Date('2027-01-02T00:00:00Z'),w.grant);assert.equal(r.counted,1);assert.equal(r.months,1);
 const m=w.tables.invite_months[0];assert.equal(m.how,'unlock');assert.equal(m.tier,'premium');
 assert.equal((Date.parse(m.ends_at as string)-Date.parse(m.starts_at as string))/86400000,30);
 // The month is open "now" only inside its window; move it to cover today and the plan resolves to Premium.
 m.starts_at=new Date(Date.now()-86400000).toISOString();m.ends_at=new Date(Date.now()+86400000).toISOString();
 assert.equal(await resolveTier('kyle',w.db),'premium');
 r=await runInviteCron(w.db,new Date('2027-01-03T00:00:00Z'),w.grant);assert.equal(r.months,0,'never paid twice');
});
test('invite: a paying inviter gets a store code for their own plan, owed until codes are loaded',async()=>{
 const w=world();process.env.MOBILE_PREMIUM_PRODUCT_IDS='prem_m';process.env.MOBILE_PRO_PRODUCT_IDS='pro_m';
 w.tables.mobile_entitlements.push({user_id:'kyle',status:'active',current_period_end:iso('2030-01-01'),product_identifier:'pro_m',is_sandbox:false,store:'app_store'});
 for(const f of ['f1','f3','f4']){await redeemInvite(fresh(f),'KYLE-7Q2',w.db,w.grant);w.tables.bikes.push({id:'b'+f,user_id:f});await rewardJoin(f,w.db,w.grant);
  w.tables.mobile_entitlements.push({user_id:f,status:'active',current_period_end:iso('2030-01-01'),product_identifier:'prem_m',is_sandbox:false,store:'play_store'});}
 await runInviteCron(w.db,new Date('2026-12-01T00:00:00Z'),w.grant);
 let r=await runInviteCron(w.db,new Date('2026-12-16T00:00:00Z'),w.grant);assert.equal(r.months,1);assert.equal(r.owed,1);
 assert.equal(w.tables.invite_months[0].tier,'pro');assert.equal(w.tables.invite_months[0].offer_code,null);
 w.tables.invite_offer_codes.push({code:'GOOGLEPRO',store:'google',tier:'pro',given_to:null,added_at:'a'},{code:'APPLEPRO1',store:'apple',tier:'pro',given_to:null,added_at:'b'});
 r=await runInviteCron(w.db,new Date('2026-12-16T01:00:00Z'),w.grant);assert.equal(r.codes_filled,1);assert.equal(r.owed,0);
 assert.equal(w.tables.invite_months[0].offer_code,'APPLEPRO1');assert.equal(w.tables.invite_offer_codes[1].given_to,'kyle');assert.equal(w.tables.invite_offer_codes[0].given_to,null);
});
test('invite: a code made before BAK knew the name is swapped for one with the name, unless a friend already used it',async()=>{
 const w=world();w.tables.invite_codes.push({user_id:'f3',code:'BAK-MQ6'},{user_id:'f4',code:'BAK-ZZ2'});
 const s=await inviteSummary({id:'f3',created_at:new Date().toISOString(),user_metadata:{full_name:'Kyle Veit'}},w.db);
 assert.match(s.code,/^KYLE-[A-Z0-9]{3}$/);assert.equal(w.tables.invite_codes.find(c=>c.user_id==='f3')!.code,s.code);
 assert.equal((await inviteSummary({id:'f3',user_metadata:{full_name:'Kyle Veit'}},w.db)).code,s.code,'stays the same after that');
 w.tables.invites.push({friend_id:'f1',inviter_id:'f4',code:'BAK-ZZ2',joined_rewarded_at:null,paid_counted_at:null});
 assert.equal((await inviteSummary({id:'f4',user_metadata:{name:'Bell'}},w.db)).code,'BAK-ZZ2');
 assert.equal((await inviteSummary({id:'kyle',user_metadata:{}},w.db)).code,'KYLE-7Q2');
});
