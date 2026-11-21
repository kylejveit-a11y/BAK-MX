import test from 'node:test';
import assert from 'node:assert/strict';
import {makeInviteCode,normalizeInviteCode,INVITE_CODE,monthsEarned,canRedeem,paidCounts,inviteLink} from '../shared/invites.ts';
test('invite codes: name plus three easy-to-read characters',()=>{
 const c=makeInviteCode('Kyle Veit',()=>0.5);assert.match(c,/^KYLEVE-[A-Z0-9]{3}$/);assert.match(c,INVITE_CODE);
 assert.match(makeInviteCode('',()=>0.1),/^BAK-/);assert.match(makeInviteCode('é',()=>0.99),/^BAK-[A-Z0-9]{3}$/);
 for(let i=0;i<200;i++)assert.doesNotMatch(makeInviteCode('x').split('-')[1],/[01ILO]/);
 assert.equal(normalizeInviteCode(' kyle-7q2 '),'KYLE-7Q2');assert.equal(inviteLink('KYLE-7Q2'),'https://bakmx.com/invite/KYLE-7Q2');
});
test('invite rewards: a month per three paying friends; only new accounts can enter a code; paid counts after two weeks',()=>{
 assert.deepEqual([0,2,3,5,6,9].map(monthsEarned),[0,0,1,1,2,3]);
 const now=new Date('2026-12-01T00:00:00Z');
 assert.equal(canRedeem({accountCreatedAt:'2026-11-25T00:00:00Z',alreadyInvited:false,now}),true);
 assert.equal(canRedeem({accountCreatedAt:'2026-11-01T00:00:00Z',alreadyInvited:false,now}),false);
 assert.equal(canRedeem({accountCreatedAt:'2026-11-30T00:00:00Z',alreadyInvited:true,now}),false);
 assert.equal(paidCounts('2026-11-10T00:00:00Z',true,now),true);assert.equal(paidCounts('2026-11-20T00:00:00Z',true,now),false);
 assert.equal(paidCounts('2026-11-10T00:00:00Z',false,now),false);assert.equal(paidCounts(null,true,now),false);
});
import {inviteCodeFromText,inviteMessage} from '../shared/invites.ts';
test('friend code box: a pasted invite message or link gives the code; typing is tidied',()=>{
 assert.equal(inviteCodeFromText(inviteMessage('GOD-TPZ')),'GOD-TPZ');
 assert.equal(inviteCodeFromText('https://bakmx.com/invite/kyle-wnv'),'KYLE-WNV');
 assert.equal(inviteCodeFromText('my code is god-tpz bro'),'GOD-TPZ');
 assert.equal(inviteCodeFromText('god-tp'),'GOD-TP');assert.equal(inviteCodeFromText(' god-tpz '),'GOD-TPZ');assert.equal(inviteCodeFromText('g!o d'),'GOD');
});
