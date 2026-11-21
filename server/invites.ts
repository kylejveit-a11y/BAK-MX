import type {SupabaseClient} from '@supabase/supabase-js';
import {z} from 'zod';
import {adminDb} from './database.ts';
import {HttpError,readJson} from './validation.ts';
import {grantCredits,paidTier} from './plans.ts';
import {INVITE,INVITE_CODE,canRedeem,inviteLink,inviteMessage,makeInviteCode,monthsEarned,normalizeInviteCode,paidCounts,type InviteSummary} from '../shared/invites.ts';
import type {Tier} from '../shared/plans.ts';

/** Invite a friend (docs/plans/INVITE_REWARDS.md). Every table here is server-only: the service role reads and writes, riders never touch them directly. */
type Db=SupabaseClient;
type InviteRow={friend_id:string;inviter_id:string;created_at:string;joined_rewarded_at:string|null;paid_since:string|null;paid_counted_at:string|null};
type MonthRow={seq:number;tier:'premium'|'pro';how:'unlock'|'offer_code';starts_at:string|null;ends_at:string|null;offer_code:string|null};
const ok=<T>(r:{data:T;error:unknown}):T=>{if(r.error)throw r.error;return r.data;};
const DAY=86400000;

async function codeFor(userId:string,admin:Db):Promise<string>{
 const have=ok(await admin.from('invite_codes').select('code').eq('user_id',userId).maybeSingle());if(have)return have.code as string;
 const prof=await admin.from('profiles').select('handle,display_name').eq('user_id',userId).maybeSingle();
 const hint=(prof.data?.display_name as string|undefined)?.split(/\s+/)[0]||(prof.data?.handle as string|undefined)||'';
 for(let i=0;i<8;i++){
  const code=makeInviteCode(i<6?hint:'');
  const ins=await admin.from('invite_codes').insert({user_id:userId,code});
  if(!ins.error)return code;
  // Lost a race with our own second request: use the row that won. Otherwise the code was taken; try another.
  const again=ok(await admin.from('invite_codes').select('code').eq('user_id',userId).maybeSingle());if(again)return again.code as string;
 }
 throw new HttpError(503,'Could not make an invite code. Try again.');
}

export async function inviteSummary(user:{id:string;created_at?:string},admin:Db=adminDb()):Promise<InviteSummary>{
 const code=await codeFor(user.id,admin);
 const [mine,sent,months]=await Promise.all([
  admin.from('invites').select('friend_id').eq('friend_id',user.id).maybeSingle(),
  admin.from('invites').select('joined_rewarded_at,paid_counted_at').eq('inviter_id',user.id).limit(2000),
  admin.from('invite_months').select('seq,tier,how,ends_at,offer_code').eq('user_id',user.id).order('seq')]);
 const rows=(ok(sent)??[]) as Pick<InviteRow,'joined_rewarded_at'|'paid_counted_at'>[];
 const joined=rows.filter(r=>r.joined_rewarded_at).length,paying=rows.filter(r=>r.paid_counted_at).length;
 const invitedBy=!!ok(mine);
 return {code,link:inviteLink(code),message:inviteMessage(code),joined,waiting:rows.length-joined,questions_earned:joined*INVITE.joinQuestions,paying,months_earned:monthsEarned(paying),
  months:((ok(months)??[]) as MonthRow[]).map(m=>({seq:m.seq,tier:m.tier,how:m.how,ends_at:m.ends_at,offer_code:m.offer_code})),
  invited_by:invitedBy,can_enter:canRedeem({accountCreatedAt:user.created_at??new Date(0),alreadyInvited:invitedBy})};
}

/** The friend enters the inviter's code. One code per account, new accounts only, never your own. */
export async function redeemInvite(user:{id:string;created_at?:string},raw:string,admin:Db=adminDb(),grant:Grant=grantCredits):Promise<{ok:true}>{
 const code=normalizeInviteCode(raw);const wrong=new HttpError(400,'That code is not right. Check it with your friend.');
 if(!INVITE_CODE.test(code))throw wrong;
 const owner=ok(await admin.from('invite_codes').select('user_id').eq('code',code).maybeSingle());if(!owner)throw wrong;
 const inviter=owner.user_id as string;
 if(inviter===user.id)throw new HttpError(400,'That is your own code. Share it with a friend instead.');
 const [already,reverse]=await Promise.all([admin.from('invites').select('friend_id').eq('friend_id',user.id).maybeSingle(),admin.from('invites').select('friend_id').eq('friend_id',inviter).eq('inviter_id',user.id).maybeSingle()]);
 if(ok(already))throw new HttpError(409,'You already entered a friend\'s code.');
 if(ok(reverse))throw new HttpError(400,'You invited this rider, so their code cannot be used here.');
 if(!canRedeem({accountCreatedAt:user.created_at??new Date(0),alreadyInvited:false}))throw new HttpError(400,`A friend's code can only be entered in the first ${INVITE.newAccountDays} days of a new account.`);
 const ins=await admin.from('invites').insert({friend_id:user.id,inviter_id:inviter,code});
 if(ins.error){if((ins.error as {code?:string}).code==='23505')throw new HttpError(409,'You already entered a friend\'s code.');throw ins.error;}
 await rewardJoin(user.id,admin,grant).catch(()=>{});
 return {ok:true};
}

/** The friend confirmed their email and added a bike: the inviter gets 10 Ask BAK questions, once per friend. Safe to call any number of times. */
type Grant=typeof grantCredits;
export async function rewardJoin(friendId:string,admin:Db=adminDb(),grant:Grant=grantCredits):Promise<boolean>{
 const inv=ok(await admin.from('invites').select('inviter_id,joined_rewarded_at').eq('friend_id',friendId).maybeSingle());
 if(!inv||inv.joined_rewarded_at)return false;
 const [bikes,who]=await Promise.all([admin.from('bikes').select('id',{count:'exact',head:true}).eq('user_id',friendId),admin.auth.admin.getUserById(friendId)]);
 if(bikes.error)throw bikes.error;if(!(bikes.count??0))return false;
 if(who.error||!who.data.user?.email_confirmed_at)return false;
 // The credit ledger refuses a repeated reference, so a double call can never pay twice.
 await grant(inv.inviter_id as string,INVITE.joinQuestions,'invite-join-'+friendId,null,'grant');
 ok(await admin.from('invites').update({joined_rewarded_at:new Date().toISOString()}).eq('friend_id',friendId).is('joined_rewarded_at',null));
 return true;
}

const storeOf=(s:string|null|undefined)=>s==='app_store'?'apple':s==='play_store'?'google':null;
async function takeOfferCode(userId:string,store:'apple'|'google',tier:'premium'|'pro',admin:Db):Promise<string|null>{
 for(let i=0;i<3;i++){
  const free=ok(await admin.from('invite_offer_codes').select('code').eq('store',store).eq('tier',tier).is('given_to',null).order('added_at').limit(1));
  if(!free?.length)return null;
  const got=ok(await admin.from('invite_offer_codes').update({given_to:userId,given_at:new Date().toISOString()}).eq('code',free[0].code).is('given_to',null).select('code'));
  if(got?.length)return got[0].code as string;
 }
 return null;
}

/** Hourly sweep: late join rewards, which invited friends are (still) paying, and the free months that earns. */
export async function runInviteCron(admin:Db=adminDb(),now=new Date(),grant:Grant=grantCredits):Promise<{joined:number;counted:number;months:number;codes_filled:number;owed:number}>{
 let joined=0,counted=0,months=0,filled=0;
 const pendingJoin=(ok(await admin.from('invites').select('friend_id').is('joined_rewarded_at',null).gt('created_at',new Date(now.getTime()-60*DAY).toISOString()).limit(300))??[]) as {friend_id:string}[];
 for(const r of pendingJoin){try{if(await rewardJoin(r.friend_id,admin,grant))joined++;}catch{/* next hour */}}
 const open=(ok(await admin.from('invites').select('friend_id,inviter_id,paid_since').is('paid_counted_at',null).not('joined_rewarded_at','is',null).limit(1000))??[]) as Pick<InviteRow,'friend_id'|'inviter_id'|'paid_since'>[];
 const touched=new Set<string>();
 for(const r of open){
  try{
   const paid=!!(await paidTier(r.friend_id,admin));
   if(paid&&!r.paid_since)ok(await admin.from('invites').update({paid_since:now.toISOString()}).eq('friend_id',r.friend_id).is('paid_since',null));
   else if(!paid&&r.paid_since)ok(await admin.from('invites').update({paid_since:null}).eq('friend_id',r.friend_id).is('paid_counted_at',null));
   else if(paidCounts(r.paid_since,paid,now)){ok(await admin.from('invites').update({paid_counted_at:now.toISOString()}).eq('friend_id',r.friend_id).is('paid_counted_at',null));counted++;touched.add(r.inviter_id);}
  }catch{/* next hour */}
 }
 for(const inviter of touched){
  try{
   const [c,have]=await Promise.all([admin.from('invites').select('friend_id',{count:'exact',head:true}).eq('inviter_id',inviter).not('paid_counted_at','is',null),admin.from('invite_months').select('seq,how,ends_at').eq('user_id',inviter).order('seq')]);
   if(c.error)throw c.error;const rows=(ok(have)??[]) as Pick<MonthRow,'seq'|'how'|'ends_at'>[];
   for(let seq=rows.length+1;seq<=monthsEarned(c.count??0);seq++){
    const plan=await paidTier(inviter,admin);
    if(!plan){
     // Free rider: BAK opens Premium for 30 days, starting when any earlier free month ends.
     const lastEnd=Math.max(now.getTime(),...rows.filter(m=>m.how==='unlock'&&m.ends_at).map(m=>Date.parse(m.ends_at!)));
     const starts=new Date(lastEnd),ends=new Date(lastEnd+INVITE.monthDays*DAY);
     const ins=await admin.from('invite_months').insert({user_id:inviter,seq,tier:'premium',how:'unlock',starts_at:starts.toISOString(),ends_at:ends.toISOString()});
     if(!ins.error){months++;rows.push({seq,how:'unlock',ends_at:ends.toISOString()});}
    }else{
     // Paying rider: a store code for a free month of the plan they are on. Empty pool = owed, filled on a later run.
     const ins=await admin.from('invite_months').insert({user_id:inviter,seq,tier:plan,how:'offer_code'});
     if(!ins.error){months++;rows.push({seq,how:'offer_code',ends_at:null});}
    }
   }
  }catch{/* next hour */}
 }
 const owedRows=(ok(await admin.from('invite_months').select('id,user_id,tier').eq('how','offer_code').is('offer_code',null).order('earned_at').limit(200))??[]) as {id:string;user_id:string;tier:'premium'|'pro'}[];
 let owed=owedRows.length;
 for(const m of owedRows){
  try{
   const ent=await admin.from('mobile_entitlements').select('store').eq('user_id',m.user_id).maybeSingle();const store=storeOf(ent.data?.store as string|undefined);if(!store)continue;
   const code=await takeOfferCode(m.user_id,store,m.tier,admin);if(!code)continue;
   ok(await admin.from('invite_months').update({offer_code:code}).eq('id',m.id).is('offer_code',null));filled++;owed--;
  }catch{/* next hour */}
 }
 return {joined,counted,months,codes_filled:filled,owed};
}

const redeemSchema=z.object({code:z.string().trim().min(3).max(20)});
export async function handleInvites(req:Request,path:string,method:string,user:{id:string;created_at?:string}):Promise<unknown|null>{
 if(path==='/api/invite'&&method==='GET')return inviteSummary(user);
 if(path==='/api/invite/redeem'&&method==='POST'){const {code}=redeemSchema.parse(await readJson(req));await redeemInvite(user,code);return inviteSummary(user);}
 return null;
}
