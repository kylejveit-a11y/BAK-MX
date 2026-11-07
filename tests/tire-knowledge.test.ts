import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {tireKnowledge,TIRE_KNOWLEDGE_VERSION,TIRE_KNOWLEDGE_MAX_CHARS,TIRE_SOURCES,tireLines,choosingTires,sizes,pressureRules,pressureRanges,pressureDisagreement,terrainPressure,inserts,insertPractice,wear,tireSymptoms,tireAsk,proPractice} from '../shared/tire-knowledge.ts';

const TIRE_QUESTIONS=[
 'what tire pressure should I run in sand?','what psi for hard pack, front and rear?','MX34 or MX33 for sand?',
 'mousse vs tubliss vs heavy duty tubes for a rocky track','I keep getting pinch flats on the rear','how do I know when my rear tire is worn out',
 '120/80-19 or 110/90-19 on my 450?','what tires do supercross pros run','front pushes in flat corners','rear won\'t hook up on hard pack',
 'best tyre for mud','Starcross 6 Medium Soft front','tubliss core pressure','rim lock keeps loosening and the valve stem leans',
 'is the Pirelli MX32 Mid Soft good for loam?','how long does a bib mousse last','new tires feel sketchy','what tires for my 85 big wheel',
 'bike skates across hard pack chop','squirms in turns after the mousse got old',
];
const UNRELATED=[
 'set my fork air pressure for 180 lb','rear kicks on braking bumps','how do I adjust sag','change the oil on my YZ250F',
 'raise the fork tubes 5mm in the clamps','what grips should I buy','traction control map for slick conditions',
 'what is the torque for the rear axle nut','bog off the bottom on my 250 two-stroke','how do I do a gate start','bar bend for a tall rider',
 'shock nitrogen pressure','radiator cap pressure',
];

test('tire questions get a tire section; unrelated questions get null',()=>{
 for(const q of TIRE_QUESTIONS){const r=tireKnowledge(q);assert.ok(r,`expected a section for: ${q}`);assert.equal(r.version,TIRE_KNOWLEDGE_VERSION);assert.ok(r.topics.length>=1,q);}
 for(const q of UNRELATED)assert.equal(tireKnowledge(q),null,`expected null for: ${q}`);
 assert.equal(tireKnowledge(''),null);
});

test('the right parts are selected for the question',()=>{
 const p:any=tireKnowledge('what tire pressure should I run in sand?');
 assert.ok(p.pressure&&p.pressure.maker_ranges_cold.length>=3);assert.equal(p.choosing,undefined,'a pressure question is not a shopping list');
 assert.ok(p.pressure.by_conditions.some((c:any)=>c.id==='sand'));
 const m:any=tireKnowledge('how long does a bib mousse last');
 assert.deepEqual(m.tubes_mousse_tubliss.options.map((o:any)=>o.id),['mousse']);
 const cmp:any=tireKnowledge('mousse vs tubliss vs heavy duty tubes');
 assert.equal(cmp.tubes_mousse_tubliss.options.length,inserts.length);
 const named:any=tireKnowledge('MX34 or MX33 for sand?');
 assert.ok(named.choosing.asked_about.some((s:string)=>/MX34/.test(s))&&named.choosing.asked_about.some((s:string)=>/MX33/.test(s)));
 const push:any=tireKnowledge('front pushes in flat corners');
 assert.deepEqual(push.symptom_checks.checks.map((c:any)=>c.id),['front-push']);
 assert.equal(push.symptom_checks.checks[0].setup_guide,'front-push');
 const size:any=tireKnowledge('120/80-19 or 110/90-19 on my 450?');assert.ok(size.sizes);
});

test('short follow-ups inherit tire context, but not when the rider moves on',()=>{
 const f=tireKnowledge('what about 12?',['what tire pressure for sand?']);assert.ok(f?.from_history);assert.ok(f?.topics.includes('pressure'));
 assert.equal(tireKnowledge('ok now my jetting',['what tire pressure for sand?']),null);
 assert.ok(tireKnowledge('what pressure then?',['front pushes in flat corners'])?.topics.includes('pressure'));
 assert.equal(tireKnowledge('and the rebound?',['front pushes in flat corners']),null);
 assert.equal(tireKnowledge('thanks',[]),null);
});

test('the section stays inside its size budget (about 2.5k tokens)',()=>{
 const everything='best tire for mud and sand, which pressure, mousse or tube or tubliss, how long do they last, 120/80-19 vs 110/90-19, what do supercross pros run, rear spins, front washes, it squirms and deflects and hops, rim lock and valve stem, Dunlop Michelin Pirelli Bridgestone Maxxis Kenda Shinko IRC Mitas Metzeler';
 for(const q of [...TIRE_QUESTIONS,everything]){
  const r=tireKnowledge(q);const n=JSON.stringify(r).length;
  assert.ok(n<=TIRE_KNOWLEDGE_MAX_CHARS,`${n} chars for: ${q}`);
  assert.ok(n/4<=2500,`about ${Math.round(n/4)} tokens for: ${q}`);
 }
 const all:any=tireKnowledge(everything);assert.ok(all.symptom_checks&&all.pressure,'the highest-priority parts survive the budget');
});

test('rider-facing text never names a magazine, tester, retailer or rider, and never leaks sources',()=>{
 const banned=/Keefer|Motocross Action|\bMXA\b|Dirt ?Bike ?Test|dirtbiketest|Transmoto|Racer ?X|Cycle ?News|Vital ?MX|Ultimate Motorcycling|MX ?Large|motosport|Rocky Mountain|RevZilla|Risk Racing|dirtbikes\.com|24mx|Anstie|Slavens|Bones|https?:\/\//i;
 const riderData=JSON.stringify({tireLines,choosingTires,sizes,pressureRules,pressureRanges,pressureDisagreement,terrainPressure,inserts,insertPractice,wear,tireSymptoms,tireAsk,proPractice});
 assert.doesNotMatch(riderData,banned);
 for(const q of TIRE_QUESTIONS){const s=JSON.stringify(tireKnowledge(q));assert.doesNotMatch(s,banned,q);assert.doesNotMatch(s,/"src"/,q);}
});

test('every fact points at a recorded source, and every source is in SOURCES.md',()=>{
 const ids=new Set(TIRE_SOURCES.map(s=>s.id));assert.equal(ids.size,TIRE_SOURCES.length,'source ids are unique');
 const refs=[...tireLines.flatMap(l=>l.src),...pressureRanges.map(p=>p.src),...terrainPressure.flatMap(p=>p.src),...inserts.flatMap(i=>i.src),...tireSymptoms.flatMap(s=>s.src),...wear.src,...sizes.src];
 for(const r of refs)assert.ok(ids.has(r),`unknown source id ${r}`);
 const md=readFileSync(new URL('../docs/research/tires/SOURCES.md',import.meta.url),'utf8');
 for(const s of TIRE_SOURCES){assert.ok(md.includes(s.id),`SOURCES.md is missing ${s.id}`);if(/^https?:/.test(s.url))assert.ok(md.includes(s.url),`SOURCES.md is missing the URL for ${s.id}`);}
 for(const s of TIRE_SOURCES)assert.match(s.accessed,/^\d{4}-\d{2}-\d{2}$/);
});

test('the data covers the ground riders ask about',()=>{
 for(const b of ['Dunlop','Michelin','Pirelli','Bridgestone','Maxxis','Kenda','Shinko','IRC','Mitas','Metzeler'])assert.ok(tireLines.some(l=>l.brand===b),b);
 for(const t of ['sand','mud','soft_intermediate','intermediate','intermediate_hard','hard'] as const)assert.ok(tireLines.some(l=>l.terrain.includes(t)),t);
 assert.deepEqual(inserts.map(i=>i.id),['standard_tube','heavy_duty_tube','mousse','tubliss']);
 assert.ok(terrainPressure.some(p=>p.id==='rocks')&&terrainPressure.some(p=>p.id==='sand')&&terrainPressure.some(p=>p.id==='mud'));
 assert.match(pressureRules[0],/bike maker/i,'the bike maker\'s figure comes first');
 // No adventure, trials or rally tire is presented as a motocross line.
 assert.doesNotMatch(tireLines.map(l=>l.model).join(' '),/Anakee|Karoo|TKC|Trailmax|MT ?43|MT ?21|Rally|Trial|AT8[12]|D606|Sahara/i);
});
