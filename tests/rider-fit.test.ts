import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {riderFit,RIDER_FIT_VERSION,RIDER_FIT_MAX_CHARS,FIT_SOURCES,fitOrder,bars,levers,pedals,seat,pegs,grips,kids,measure,armPump,makeAdjust} from '../shared/rider-fit.ts';

const FIT_QUESTIONS=[
 'I\'m 6\'3" with a 34 inch inseam, how should I set up my YZ450F','what bar bend for a tall rider on a KX450','how do I set my lever angle',
 'my 9 year old son has outgrown his 65, ready for an 85?','brake pedal height with new boots','arm pump every moto',
 'what grips should I buy','lowering kit for my daughter\'s 50 SX, she can\'t touch the ground','can\'t reach the clutch lever, small hands',
 'what size bike for my 8 year old','how do I measure my bars','roll my bars forward or back?','taller seat foam for a 6\'4 guy',
 'lower footpegs on my KTM','Honda CRF250R bar clamp positions','the cockpit feels cramped when I stand up','I\'m 5\'6", is a 450 too big for me?',
 'shift lever too low, my boot catches it','Renthal 827 or 604 for my CRF450R?','how much free play should the clutch lever have',
];
const UNRELATED=[
 'raise the fork tubes 5mm in the clamps','fork tubes','slide the forks up in the triple clamps','what tire pressure, 0.9 bar front',
 'how do I seat the bead','rear won\'t grip on hard pack','brake lever feels spongy, do I need to bleed it','my son\'s bike won\'t start',
 'should I put my feet down in corners','will this exhaust fit my bike','change the oil on my YZ250F','how do I adjust sag',
 'bog off the bottom on my 250 two-stroke','what is the torque for the triple clamp bolts','jetting for 3000 ft','',
];

test('fit questions get a fit section; unrelated questions get null',()=>{
 for(const q of FIT_QUESTIONS){const r=riderFit(q);assert.ok(r,`expected a section for: ${q}`);assert.equal(r.version,RIDER_FIT_VERSION);assert.ok(r.topics.length>=1,q);}
 for(const q of UNRELATED)assert.equal(riderFit(q),null,`expected null for: ${q}`);
});

test('the right parts are selected for the question',()=>{
 const lv:any=riderFit('how do I set my lever angle');assert.ok(lv.levers.length>=3);assert.equal(lv.kids,undefined);assert.equal(lv.arm_pump,undefined);
 const kid:any=riderFit('my 9 year old son has outgrown his 65, ready for an 85?');
 assert.ok(kid.kids.fit_check.length&&kid.kids.outgrown.length);assert.equal(kid.rider.age,'9');
 assert.match(kid.kids.outgrown.join(' '),/no(?:t| ) ?publish|Neither/i,'says no threshold is published');
 const tall:any=riderFit('I\'m 6\'3" with a 34 inch inseam, how should I set up my YZ450F');
 assert.equal(tall.rider.height,'6 ft 3 in');assert.equal(tall.rider.inseam,'34 in');
 assert.ok(tall.bars&&tall.levers&&tall.pedals,'a whole-bike question gets bars, levers and pedals');
 assert.deepEqual(Object.keys(tall.bike_adjustments),['Yamaha'],'only the named make');
 const honda:any=riderFit('Honda CRF250R bar clamp positions');assert.match(honda.bike_adjustments.Honda,/26/);
 const none:any=riderFit('roll my bars forward or back?');assert.ok(Object.keys(none.bike_adjustments).length>=5,'every make when none is named');
 const pump:any=riderFit('arm pump every moto');assert.ok(pump.arm_pump.some((s:string)=>/doctor/.test(s)));
 const bend:any=riderFit('Renthal 827 or 604 for my CRF450R?');assert.ok(bend.bars.renthal_bends.some((s:string)=>/827 Fatbar.*width 811/.test(s)));
});

test('short follow-ups inherit fit context, but not when the rider moves on',()=>{
 const f=riderFit('and for the 450?',['what bar bend for a tall rider']);assert.ok(f?.from_history);assert.ok(f?.topics.includes('bars'));
 assert.equal(riderFit('ok now my jetting',['what bar bend for a tall rider']),null);
 assert.equal(riderFit('thanks',[]),null);
});

test('the section stays inside its size budget (about 2.5k tokens)',()=>{
 const everything='I\'m 6\'4" 36 inch inseam, my 10 year old daughter outgrew her 65; bars, bend, sweep, rise, lever angle and reach, small hands, brake pedal height, shift lever too low, seat height and tall seat foam, lower footpegs, which grips, arm pump, how do I measure my bars, cockpit feels cramped, Honda Yamaha KTM Kawasaki Triumph';
 for(const q of [...FIT_QUESTIONS,everything]){
  const r=riderFit(q);const n=JSON.stringify(r).length;
  assert.ok(n<=RIDER_FIT_MAX_CHARS,`${n} chars for: ${q}`);
  assert.ok(n/4<=2500,`about ${Math.round(n/4)} tokens for: ${q}`);
 }
 const all:any=riderFit(everything);assert.ok(all.kids&&all.bars,'the highest-priority parts survive the budget');
});

test('rider-facing text never names a magazine, tester, retailer or rider, and never leaks sources',()=>{
 const banned=/Keefer|Motocross Action|\bMXA\b|\bADB\b|Australasian|Dirt ?Bike ?(Mag|Test)|Transmoto|Racer ?X|Cycle ?News|Vital ?MX|MX ?Large|Mojo|ktmdirect|KTM Direct|RevZilla|Rocky Mountain|Porterville|O'Dowd|Superbike|https?:\/\//i;
 const riderData=JSON.stringify({fitOrder,bars,levers,pedals,seat,pegs,grips,kids,measure,armPump,makeAdjust}).replace(/"src":\[[^\]]*\]/g,'');
 assert.doesNotMatch(riderData,banned);
 for(const q of FIT_QUESTIONS){const s=JSON.stringify(riderFit(q));assert.doesNotMatch(s,banned,q);assert.doesNotMatch(s,/"src"/,q);}
});

test('every fact points at a recorded source, and every source is in SOURCES.md',()=>{
 const ids=new Set(FIT_SOURCES.map(s=>s.id));assert.equal(ids.size,FIT_SOURCES.length,'source ids are unique');
 const facts=[...fitOrder,bars.dimensions,...bars.rules,...bars.renthal_bends,...levers,...pedals,...seat,...pegs,...grips,...kids.fit_check,...kids.adjustments,...kids.outgrown,...measure,...armPump,...Object.values(makeAdjust)];
 for(const f of facts){assert.ok(f.src.length,`no source for: ${f.text.slice(0,60)}`);for(const r of f.src)assert.ok(ids.has(r),`unknown source id ${r}`);}
 const md=readFileSync(new URL('../docs/research/rider-fit/SOURCES.md',import.meta.url),'utf8');
 for(const s of FIT_SOURCES){assert.ok(md.includes('`'+s.id+'`'),`SOURCES.md is missing ${s.id}`);if(/^https?:/.test(s.url))assert.ok(md.includes(s.url),`SOURCES.md is missing the URL for ${s.id}`);assert.match(s.accessed,/^\d{4}-\d{2}-\d{2}$/);}
});

test('numbers in the knowledge come from a maker or study, never from BAK reasoning alone',()=>{
 const facts=[...fitOrder,...bars.rules,...levers,...pedals,...seat,...pegs,...grips,...kids.fit_check,...kids.adjustments,...kids.outgrown,...measure,...armPump];
 for(const f of facts)if(/\d+(\.\d+)? ?(mm|in|cm|%|mmHg)\b/.test(f.text))assert.ok(f.src.some(s=>s!=='bak-reasoning'),`a figure with only BAK reasoning behind it: ${f.text.slice(0,80)}`);
 assert.equal(RIDER_FIT_VERSION,'mx-fit-1');
 for(const m of ['Honda','Yamaha','KTM','Kawasaki','Triumph'])assert.ok(makeAdjust[m],m);
});

test('the per-bike fit records are well formed and cover the launch platforms',()=>{
 const rows:Record<string,Set<number>>={};
 for(const f of ['fit_honda_kawasaki_triumph_minis','fit_ktm_group','fit_yamaha']){
  const d=JSON.parse(readFileSync(new URL(`../docs/research/knowledge/${f}.json`,import.meta.url),'utf8'));
  for(const r of d.records){
   assert.match(r.id,/^rfit-/);assert.equal(r.domain,'chassis');assert.ok(['OEM','MEASURED','TUNER','DERIVED','COMMUNITY'].includes(r.tier));
   assert.ok(r.source?.url&&r.source?.date,`${r.id} has a source URL and date`);
   for(const m of r.applies_to.models)for(const y of r.applies_to.years??[])(rows[m.replace(/^(KTM|Husqvarna|GasGas) /,'')]??=new Set()).add(y);
  }
 }
 const want:Record<string,number[]>={'CRF250R':[2020,2021,2022,2023,2024,2025,2026,2027],'CRF450R':[2020,2021,2022,2023,2024,2025,2026,2027],
  'YZ250F':[2020,2021,2022,2023,2024,2025,2026,2027],'YZ450F':[2020,2021,2022,2023,2024,2025,2026,2027],'YZ125':[2020,2021,2022,2023,2024,2025,2026,2027],'YZ250':[2020,2021,2022,2023,2024,2025,2026,2027],
  '250 SX-F':[2020,2021,2022,2023,2024,2025,2026,2027],'350 SX-F':[2020,2021,2022,2023,2024,2025,2026,2027],'450 SX-F':[2020,2021,2022,2023,2024,2025,2026,2027],
  '125 SX':[2020,2021,2022,2023,2024,2025,2026,2027],'KX250':[2020,2021,2022,2023,2024,2025,2026,2027],'KX450':[2020,2021,2022,2023,2024,2025,2026],
  'TF 250-X':[2024,2025,2026,2027],'TF 450-X':[2025,2026,2027],'FC 450':[2020,2021,2022,2023,2024,2025,2026,2027],'MC 450F':[2021,2022,2023,2024,2025,2026,2027]};
 for(const [m,ys] of Object.entries(want))for(const y of ys)assert.ok(rows[m]?.has(y),`fit record missing for ${m} ${y}`);
});
