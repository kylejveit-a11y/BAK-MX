import test from 'node:test';
import assert from 'node:assert/strict';
import {TRIAL_BLOCKS,TRIAL_BLOCK_SIZE,DEFAULT_DAILY,canCoachClips} from '../shared/plans.ts';
import {editAllowance} from '../shared/photo-edit.ts';
import {composerNudge,isLimitMessage,isLimitStatus,limitCard,nextResetLabel,planComparison,proValueRows,usageSummary,type UsageView} from '../shared/pro-flow.ts';

const free=(over:Partial<UsageView>={},trial:Partial<NonNullable<UsageView['trial']>>={}):UsageView=>({tier:'free',daily_limit:0,unlimited:false,used_today:0,remaining_today:0,credits:0,access_mode:'subscription',trial:{blocks:TRIAL_BLOCKS,size:TRIAL_BLOCK_SIZE,started:1,remaining_sets:TRIAL_BLOCKS-1,...trial},...over});
const premium=(over:Partial<UsageView>={}):UsageView=>({tier:'premium',daily_limit:DEFAULT_DAILY.premium,unlimited:false,used_today:40,remaining_today:60,credits:0,trial:null,access_mode:'subscription',...over});
const pro=(over:Partial<UsageView>={}):UsageView=>({tier:'pro',daily_limit:DEFAULT_DAILY.pro,unlimited:true,used_today:3,remaining_today:297,credits:0,trial:null,access_mode:'subscription',...over});

test('the Account plan row says where the rider stands',()=>{
 assert.equal(usageSummary(null),'Your questions today, plans and credit packs');
 assert.equal(usageSummary(free({credits:12},{started:4,remaining_sets:3})),'Free · 12 questions in this set · 3 of 7 sets left');
 assert.equal(usageSummary(free({credits:0},{started:4,remaining_sets:3})),'Free · 3 of 7 sets left');
 assert.equal(usageSummary(free({},{started:0,remaining_sets:7})),'Free · 7 of 7 sets left');
 assert.equal(usageSummary(free({credits:1},{started:7,remaining_sets:0})),'Free · 1 question in this set · 0 of 7 sets left');
 assert.equal(usageSummary(premium()),'Premium · 60 of 100 left today');
 assert.equal(usageSummary(premium(),'2026-12-10T12:00:00Z'),`Premium · renews ${new Date('2026-12-10T12:00:00Z').toLocaleDateString(undefined,{month:'short',day:'numeric'})}`);
 assert.equal(usageSummary(premium(),'not a date'),'Premium · 60 of 100 left today');
 assert.equal(usageSummary(pro()),'Pro · Unlimited questions');
 assert.equal(usageSummary(pro({access_mode:'beta'})),'Pro · Launch offer');
 assert.equal(usageSummary(free({access_mode:'beta',daily_limit:40,remaining_today:31})),'Free · Launch offer · 31 of 40 left today');
});

test('the limit card appears only for a used-up allowance, with the right way on',()=>{
 // Not refused, or refused for another reason while questions remain: no card.
 assert.equal(limitCard(free({credits:5}),false),null);
 assert.equal(limitCard(null,true),null);
 assert.equal(limitCard(free({credits:5}),true),null);
 assert.equal(limitCard(premium({remaining_today:3}),true),null);
 // Free, this set used, sets waiting: start the next or see Pro. No reset time: sets do not reset.
 const setDone=limitCard(free({},{started:2,remaining_sets:5}),true)!;
 assert.equal(setDone.kind,'free_set_done');assert.deepEqual(setDone.actions,['next_set','pro']);assert.match(setDone.body,/5 free sets of 20 left/);assert.equal(setDone.reset,undefined);
 assert.match(limitCard(free({},{started:6,remaining_sets:1}),true)!.body,/1 free set of 20 left/);
 // Free, every set used: Pro or a pack.
 const out=limitCard(free({},{started:7,remaining_sets:0}),true)!;
 assert.equal(out.kind,'free_exhausted');assert.equal(out.title,"You've used your free questions");assert.deepEqual(out.actions,['pro','pack']);assert.equal(out.reset,undefined);
 // Premium: today's questions, resets at midnight UTC.
 const prem=limitCard(premium({used_today:100,remaining_today:0}),true,new Date('2026-11-11T20:00:00Z'))!;
 assert.equal(prem.kind,'premium_daily');assert.equal(prem.title,"You've used today's Premium questions");assert.deepEqual(prem.actions,['pro','pack']);assert.match(prem.reset!,/^Resets at .* your time \(midnight UTC\)$/);
 // Pro fair use: no buttons, just when it is back.
 const fair=limitCard(pro({remaining_today:0}),true)!;
 assert.equal(fair.kind,'pro_fair_use');assert.deepEqual(fair.actions,[]);assert.ok(fair.reset);
 // Launch offer (beta): a free rider out of the daily set is told about the daily set, not about free sets.
 const beta=limitCard(free({access_mode:'beta',daily_limit:40,used_today:40},{started:7,remaining_sets:0}),true)!;
 assert.equal(beta.kind,'free_exhausted');assert.equal(beta.title,"You've used today's questions");assert.ok(beta.reset);
 assert.equal(isLimitStatus(429),true);assert.equal(isLimitStatus(409),false);assert.equal(isLimitStatus(undefined),false);
 assert.ok(isLimitMessage("You've used all your free questions. Add a credit pack or choose Premium or Pro to keep asking BAK."));
 assert.ok(isLimitMessage("You've used today's Ask BAK questions. Upgrade to Pro or add a credit pack to keep going, or come back after midnight UTC."));
 assert.ok(!isLimitMessage('Could not reach BAK MX. Check your connection and try again.'));
});

test('the reset line is midnight UTC in the rider\'s clock and never a made-up date',()=>{
 const line=nextResetLabel(new Date('2026-11-11T23:30:00Z'));
 assert.match(line,/^Resets at \S.* your time \(midnight UTC\)$/);
});

test('the quiet nudge: last set, or a set that just finished; nothing for paid riders or the launch offer',()=>{
 assert.equal(composerNudge(null),null);
 assert.equal(composerNudge(premium()),null);
 assert.equal(composerNudge(pro()),null);
 assert.equal(composerNudge(free({access_mode:'beta',daily_limit:40,remaining_today:2},{started:7,remaining_sets:0,})),null);
 assert.equal(composerNudge(free({credits:9},{started:3,remaining_sets:4})),null);
 assert.equal(composerNudge(free({credits:0},{started:0,remaining_sets:7})),null);
 const last=composerNudge(free({credits:4},{started:7,remaining_sets:0}))!;
 assert.equal(last.action,'pro');assert.equal(last.text,'Last free set. Pro is unlimited.');assert.equal(last.key,'last-set');
 const done=composerNudge(free({credits:0},{started:3,remaining_sets:4}))!;
 assert.equal(done.action,'next_set');assert.match(done.text,/That set is used up\. 4 free sets left/);assert.equal(done.key,'set-done-3');
 // All sets used and nothing left: that is the limit card's job, not a nudge.
 assert.equal(composerNudge(free({credits:0},{started:7,remaining_sets:0})),null);
});

test('the Pro screen promises only what the plan code gates',()=>{
 const rows=proValueRows();
 assert.equal(rows.length,3);
 assert.equal(rows[0].title,'Unlimited Ask BAK questions');
 assert.equal(rows[1].title,'Coaching from your riding clips');assert.ok(canCoachClips('pro')&&!canCoachClips('premium'));
 assert.equal(rows[2].title,`${editAllowance('pro').included} Action photo edits a month`);
 for(const r of rows)assert.doesNotMatch(r.title+r.detail,/\$|price|setup history|saved tuning/i);
 const cmp=planComparison();
 const by=(f:string)=>cmp.find(r=>r.feature===f)!;
 assert.deepEqual(by('Ask BAK questions'),{feature:'Ask BAK questions',free:`${TRIAL_BLOCKS} sets of ${TRIAL_BLOCK_SIZE} to start`,premium:`${DEFAULT_DAILY.premium} a day`,pro:'Unlimited, fair use'});
 assert.deepEqual(by('Coaching from riding clips'),{feature:'Coaching from riding clips',free:'—',premium:'—',pro:'Included'});
 assert.deepEqual(by('Action photo edits'),{feature:'Action photo edits',free:'3 to try',premium:'5 a month',pro:'15 a month'});
 // Everything that is not gated is shown as included on every plan: no fake Pro-only features.
 for(const f of ['Garage, specs, setup and service logs','Tuning notes and saved chats','Community, events, messages','Coaching from photos'])assert.deepEqual([by(f).free,by(f).premium,by(f).pro],['Included','Included','Included']);
});
