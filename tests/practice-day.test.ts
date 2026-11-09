import test from 'node:test';
import assert from 'node:assert/strict';
import {PRACTICE_ITEM_IDS,PRACTICE_PHASES,defaultPracticeList,hydratePracticeList,nextChecklistItem,checklistCount,parseClock,parseNextUp,clockText,nextUpDate,countdownText,nextQuarterHour,nextUpLine,followingLabel,advanceNextUp,
 parseMinutes,makeSession,nextSessionNumber,sessionConditions,sessionLogBody,sessionsSummary,sessionsFor,practiceAskText,emptySession,type PracticeSession} from '../shared/practice-day.ts';
import {PREP_ITEMS,fitsEngine} from '../shared/race-prep.ts';
import {isPractice,dayName} from '../shared/race-day.ts';

test('the practice list is BAK race-prep items for the day itself, by discipline',()=>{
 for(const id of PRACTICE_ITEM_IDS)assert.ok(PREP_ITEMS.some(i=>i.id===id),id);
 const mx=defaultPracticeList('mx'),off=defaultPracticeList('offroad');
 assert.ok(mx.every(i=>PRACTICE_PHASES.some(p=>p.id===i.phase)));
 assert.ok(mx.some(i=>i.id==='track-bleed-fork-air-wheel-up'));assert.ok(!off.some(i=>i.id==='track-bleed-fork-air-wheel-up'));
 assert.ok(!mx.some(i=>i.id==='motos-know-your-moto-time'));
 assert.equal(mx.find(i=>i.id==='track-practice-roll-jumps-first-lap')?.label,'Roll jumps the first lap');
 assert.ok(mx.find(i=>i.id==='track-set-tire-pressure-for-conditions')?.why);
});
test('a saved practice list keeps its order and custom items, gets BAK’s why back and drops other phases',()=>{
 const l=hydratePracticeList([{id:'own-1',label:'Bring the dog',phase:'track',custom:true},{id:'motos-refuel',label:'Fuel up',phase:'motos'},{id:'x',label:'Week item',phase:'week'}],'mx');
 assert.deepEqual(l.map(i=>i.id),['own-1','motos-refuel']);assert.equal(l[1].label,'Fuel up');
 assert.deepEqual(hydratePracticeList(null,'mx'),defaultPracticeList('mx'));
 assert.ok(fitsEngine(l[0],'2-stroke'));
});
test('next checklist item and counts go phase by phase',()=>{
 const list=defaultPracticeList('mx'),first=list.find(i=>i.phase==='track')!;
 assert.equal(nextChecklistItem(list,{},['track','motos'])?.id,first.id);
 const allTrack=Object.fromEntries(list.filter(i=>i.phase==='track').map(i=>[i.id,true]));
 assert.equal(nextChecklistItem(list,allTrack,['track','motos'])?.phase,'motos');
 assert.equal(nextChecklistItem(list,allTrack,['track']),null);
 const c=checklistCount(list,allTrack,['track','motos']);assert.equal(c.done,list.filter(i=>i.phase==='track').length);assert.equal(c.total,list.filter(i=>i.phase!=='after').length);
});
test('moto times: "Moto 1 at 10:40" and friends',()=>{
 assert.equal(parseClock('10:40'),'10:40');assert.equal(parseClock('2:15pm'),'14:15');assert.equal(parseClock('12 am'),'00:00');assert.equal(parseClock('1040'),'10:40');
 assert.equal(parseClock('2'),'14:00');assert.equal(parseClock('9'),'09:00');assert.equal(parseClock('25:00'),null);assert.equal(parseClock('10:75'),null);assert.equal(parseClock('soon'),null);
 assert.deepEqual(parseNextUp('Moto 1 at 10:40'),{label:'Moto 1',at:'10:40'});
 assert.deepEqual(parseNextUp('moto 2 2:15 pm'),{label:'Moto 2',at:'14:15'});
 assert.deepEqual(parseNextUp('Practice @ 8'),{label:'Practice',at:'08:00'});
 assert.deepEqual(parseNextUp('11:30','Session 2'),{label:'Session 2',at:'11:30'});
 assert.equal(parseNextUp('Moto 2'),null);assert.equal(parseNextUp(''),null);
 assert.equal(clockText('14:05'),'2:05 PM');assert.equal(clockText('00:30'),'12:30 AM');
});
test('countdown words, and the next up line',()=>{
 const at=nextUpDate({label:'Moto 1',at:'10:40'},'2026-11-08')!;
 assert.equal(at.getHours(),10);assert.equal(at.getMinutes(),40);assert.equal(at.getDate(),8);
 const before=(min:number)=>new Date(at.getTime()-min*60000);
 assert.equal(countdownText(at,before(25)),'in 25 min');assert.equal(countdownText(at,before(65)),'in 1 h 5 min');assert.equal(countdownText(at,before(141)),'in 2 h 21 min');assert.equal(countdownText(at,before(120)),'in 2 h');
 assert.equal(countdownText(at,before(0)),'now');assert.equal(countdownText(at,before(-12)),'started 12 min ago');assert.equal(countdownText(null),'');
 assert.equal(nextUpDate({label:'Moto 1',at:''},'2026-11-08'),null);
 assert.equal(nextUpLine({label:'Moto 1',at:'10:40'},'2026-11-08',before(25)),'Moto 1 · 10:40 AM · in 25 min');
 assert.equal(nextUpLine({label:'Moto 2',at:''},'2026-11-08'),'Moto 2 · set the time');
});
test('logging the moto that was up next moves it along',()=>{
 assert.equal(followingLabel('Moto 1'),'Moto 2');assert.equal(followingLabel('Practice'),'Moto 1');assert.equal(followingLabel('Session 9'),'Session 10');
 assert.deepEqual(advanceNextUp({label:'Moto 1',at:'10:40'},'Moto 1'),{label:'Moto 2',at:''});
 const n={label:'Moto 2',at:'12:00'};assert.equal(advanceNextUp(n,'Moto 1'),n);
 assert.equal(advanceNextUp(null,'Moto 1'),null);
});
test('session log: numbers, minutes, what must be there',()=>{
 assert.equal(parseMinutes(''),null);assert.equal(parseMinutes('20'),20);assert.equal(parseMinutes('20 min'),20);assert.equal(parseMinutes('1:15'),75);
 assert.equal(typeof parseMinutes('0'),'string');assert.equal(typeof parseMinutes('500'),'string');assert.equal(typeof parseMinutes('abc'),'string');
 const now=new Date('2026-11-08T15:00:00Z');
 assert.equal(makeSession([],emptySession(),now).problem,'Add the time on track, a note or a change first.');
 assert.equal(makeSession([],{...emptySession(),detail:'2 clicks'},now).problem,'Pick what you changed.');
 const a=makeSession([],{...emptySession(),minutes:'20',notes:' front pushed '},now).session!;
 assert.equal(a.n,1);assert.equal(a.minutes,20);assert.equal(a.notes,'front pushed');assert.equal(a.change,'');assert.equal(a.result,'not_tested');assert.equal(a.at,now.toISOString());
 const b=makeSession([a],{...emptySession(),change:'Fork compression',detail:'2 softer',result:'better'},now).session!;
 assert.equal(b.n,2);assert.equal(b.result,'better');assert.equal(nextSessionNumber([a,b]),3);assert.equal(nextSessionNumber([]),1);
 assert.equal(sessionConditions(a),'Practice day · Session 1 · 20 min');assert.equal(sessionConditions(b),'Practice day · Session 2');
 assert.equal(sessionsSummary([a,b]),'2 sessions · 20 min on track');assert.equal(sessionsSummary([{...a,minutes:75}]),'1 session · 1 h 15 min on track');assert.equal(sessionsSummary([]),'');
 const many=Array.from({length:40},(_,i)=>({...a,id:'s'+i,n:i+1}));assert.ok(makeSession(many,{...emptySession(),minutes:'10'},now).problem);
});
test('only a session with a setup change goes into the setup log, with the bike’s settings',()=>{
 const now=new Date('2026-11-08T15:00:00Z');
 const a=makeSession([],{...emptySession(),minutes:'15'},now).session!;
 const b=makeSession([a],{...emptySession(),minutes:'20',change:'Rear tire',detail:'12 psi',result:'worse',notes:'spun up'},now).session!;
 const bike={id:'bike-1',engine_hours:41.5,configuration:{fork_compression:'12 out',rider_sag_mm:105,shock_rebound:''}};
 assert.equal(sessionLogBody(a,bike,'Dade City'),null);
 assert.deepEqual(sessionLogBody(b,bike,'Dade City'),{bike_id:'bike-1',recorded_at:now.toISOString(),track:'Dade City',conditions:'Practice day · Session 2 · 20 min',engine_hours:41.5,settings:{fork_compression:'12 out',rider_sag_mm:'105'},change_made:'Rear tire: 12 psi',result:'worse',notes:'spun up'});
});
test('stored sessions only count on their own day',()=>{
 const s={id:'x',n:1,at:'',minutes:null,notes:'n',change:'',detail:'',result:'not_tested',logId:null} as PracticeSession;
 assert.equal(sessionsFor({day:'2026-11-08',sessions:[s]},'2026-11-08').length,1);
 assert.equal(sessionsFor({day:'2026-11-07',sessions:[s]},'2026-11-08').length,0);
 assert.deepEqual(sessionsFor(null,'2026-11-08'),[]);
});
test('Ask BAK about today carries the bike, setup, sessions and the track',()=>{
 const now=new Date('2026-11-08T15:00:00Z');
 const a=makeSession([],{...emptySession(),minutes:'15',notes:'ruts deep'},now).session!;
 const b=makeSession([a],{...emptySession(),change:'Fork rebound',detail:'1 slower',result:'better'},now).session!;
 const q=practiceAskText({track:'Dade City',bike:'2025 KTM 450 SX-F',setup:[['Fork comp','12 out'],['Race sag','105 mm']],sessions:[b,a],report:'sand, deep ruts'});
 assert.match(q,/^Practice day at Dade City on my 2025 KTM 450 SX-F\./);
 assert.match(q,/Setup now: Fork comp 12 out, Race sag 105 mm\./);assert.match(q,/The track: sand, deep ruts\./);
 assert.ok(q.indexOf('Session 1 · 15 min (ruts deep)')<q.indexOf('Session 2: changed Fork rebound: 1 slower → Better'));
 assert.match(practiceAskText({track:'',bike:'bike',setup:[],sessions:[]}),/No sessions logged yet\./);
});
test('a saved race without a kind is a race day',()=>{
 assert.equal(isPractice({on:true,track:'',day:'2026-11-08'}),false);assert.equal(isPractice({on:true,track:'',day:'2026-11-08',kind:'practice'}),true);
 assert.equal(dayName(null),'Race day');assert.equal(dayName({on:true,track:'',day:'',kind:'practice'}),'Practice day');
});

test('the time picker opens on the next quarter hour',()=>{
 assert.equal(nextQuarterHour(new Date(2026,5,6,10,31)),'10:45');assert.equal(nextQuarterHour(new Date(2026,5,6,10,45)),'11:00');assert.equal(nextQuarterHour(new Date(2026,5,6,23,50)),'00:00');
});
