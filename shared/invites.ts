/** Invite a friend: the rules in one place (pure, tested). Decided by Kyle 2026-11-14, see docs/plans/INVITE_REWARDS.md. */
export const INVITE={joinQuestions:10,friendsPerMonth:3,paidDaysBeforeCounting:14,monthDays:30,newAccountDays:14} as const;
/** No 0/O, 1/I/L: a code is read off a phone and typed on another. */
const ALPHABET='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const normalizeInviteCode=(raw:string)=>raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g,'');
export const INVITE_CODE=/^[A-Z0-9]{2,8}-[A-Z0-9]{3,4}$/;
/** "KYLE-7Q2": up to six letters of the rider's name or handle (BAK when there is nothing usable), then three random characters. */
export function makeInviteCode(hint:string|null|undefined,random:()=>number=Math.random){
 const word=(hint??'').normalize('NFKD').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);
 const tail=Array.from({length:3},()=>ALPHABET[Math.floor(random()*ALPHABET.length)%ALPHABET.length]).join('');
 return `${word.length>=2?word:'BAK'}-${tail}`;
}
export const inviteLink=(code:string)=>`https://bakmx.com/invite/${code}`;
export const inviteMessage=(code:string)=>`Come ride with me on BAK MX: specs, setup and answers for your exact bike. Use my code ${code} when you sign up: ${inviteLink(code)}`;
/** Free months earned so far: one for every three invited friends who stayed on a paid plan. */
export const monthsEarned=(payingFriends:number)=>Math.floor(Math.max(0,payingFriends)/INVITE.friendsPerMonth);
/** Can this account still enter a friend's code? Only a new account, once, and never its own code. */
export function canRedeem(s:{accountCreatedAt:string|Date;alreadyInvited:boolean;now?:Date}){
 if(s.alreadyInvited)return false;
 const age=((s.now??new Date()).getTime()-new Date(s.accountCreatedAt).getTime())/86400000;
 return age<=INVITE.newAccountDays;
}
/** A friend on a paid plan counts once they have stayed paid for two weeks (so a refund never counts). */
export function paidCounts(paidSince:string|Date|null,stillPaid:boolean,now:Date=new Date()){
 return !!paidSince&&stillPaid&&(now.getTime()-new Date(paidSince).getTime())/86400000>=INVITE.paidDaysBeforeCounting;
}
export type InviteSummary={code:string;link:string;message:string;joined:number;waiting:number;questions_earned:number;paying:number;months_earned:number;
 months:{seq:number;tier:'premium'|'pro';how:'unlock'|'offer_code';ends_at:string|null;offer_code:string|null}[];invited_by:boolean;can_enter:boolean};
/** What a rider types or pastes into the friend's-code box, turned into a code. Pasting the whole invite message or
 *  the link works: the code is picked out of it. Otherwise the typing is tidied to code characters. */
export function inviteCodeFromText(raw:string):string{
 const text=(raw??'').toUpperCase();
 const link=/\/INVITE\/([A-Z0-9]{2,8}-[A-Z0-9]{3,4})\b/.exec(text);if(link)return link[1];
 if(/\s/.test(text.trim())){const found=/\bCODE\s+([A-Z0-9]{2,8}-[A-Z0-9]{3,4})\b/.exec(text)??/\b([A-Z0-9]{2,8}-[A-Z0-9]{3,4})\b/.exec(text);if(found)return found[1];}
 return text.replace(/[^A-Z0-9-]/g,'').slice(0,13);
}
