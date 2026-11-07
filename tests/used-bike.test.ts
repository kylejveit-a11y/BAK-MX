import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {usedBike,isUsedBikeQuestion,bikesIn,USED_BIKE_VERSION,USED_BIKE_MAX_CHARS,USED_SOURCES,inspection,hours,vin,paperwork,redFlags,negotiation,testRide,platformChecks} from '../shared/used-bike.ts';

const USED_QUESTIONS=[
 'I am looking at a used 2021 YZ450F with 60 hours, what should I check?','what should I look for when buying a used dirt bike',
 'how do I tell real hours on a used KTM 450 SX-F','where is the VIN on a 2023 CRF450R','seller has no title for a 2022 KX450, is that a red flag?',
 'what is a fair offer on a 2019 YZ250F that needs a top end','test ride checklist for a used two-stroke 250 SX','is this bike stolen? the numbers look ground off',
 'buying a used RM-Z450 2021','what is my 2020 FC 450 worth','he only has a bill of sale, no MSO','the hour meter says 40, can it be reset?',
 'going to look at a 2022 TC 250 tomorrow','is the frame number supposed to match the engine number?','I bought a used 2023 MC 450F, what should I check first?',
 'pre-purchase inspection on a 2020 CRF250R','how do I negotiate the price on a used 2024 KX250','decode this VIN: what does the 10th character mean',
];
const UNRELATED=[
 'should I buy a new chain and sprockets','how do I adjust sag','what oil for my yz250f','rear kicks on braking bumps','my fork seals are leaking',
 'how many hours before I do the top end on my 450','what tire pressure for sand','bog off the bottom on my 250 two-stroke',
 'best grips to buy','raise the fork tubes 5mm in the clamps','what is the torque for the rear axle nut','change the oil on my KX450',
 'how do I do a gate start','is a revalve worth the money','I used Maxima oil last time',
];

test('used-bike questions get a section; unrelated questions get null',()=>{
 for(const q of USED_QUESTIONS){const r=usedBike(q);assert.ok(r,`expected a section for: ${q}`);assert.equal(r.version,USED_BIKE_VERSION);assert.ok(r.topics.length>=1,q);assert.ok(isUsedBikeQuestion(q),q);}
 for(const q of UNRELATED){assert.equal(usedBike(q),null,`expected null for: ${q}`);assert.equal(isUsedBikeQuestion(q),false,q);}
 assert.equal(usedBike(''),null);
});

test('the right parts are chosen for the question',()=>{
 const insp:any=usedBike('I am looking at a used 2021 YZ450F with 60 hours, what should I check?');
 assert.ok(insp.inspection.length>=10,'a general inspection');
 assert.ok(insp.inspection.some((a:any)=>/valves/i.test(a.area)),'four-stroke valves for a four-stroke');
 assert.deepEqual(insp.platform_checks.map((p:any)=>p.bike),['Yamaha YZ450F']);
 assert.ok(insp.platform_checks[0].checks.some((c:string)=>/ywr-041/.test(c)),'2018-2022 YZ450F checks point at their rows');
 const two:any=usedBike('buying a used 2020 YZ250 two-stroke, what should I look for?');
 assert.ok(two.inspection.some((a:any)=>/Two-stroke/.test(a.area)));
 assert.ok(!two.inspection.some((a:any)=>/Four-stroke valves/.test(a.area)));
 const v:any=usedBike('where is the VIN on a 2023 CRF450R');
 assert.deepEqual(v.topics,['vin']);assert.equal(v.inspection,undefined,'a VIN question is not a full inspection');
 assert.deepEqual(v.vin.by_make.map((m:any)=>m.make),['Honda']);
 assert.equal(v.vin.year_codes.P,2023);
 const p:any=usedBike('seller has no title for a 2022 KX450, is that a red flag?');
 assert.ok(p.paperwork&&p.red_flags);assert.ok(p.paperwork.florida.length&&p.paperwork.stolen_checks.length);
 const h:any=usedBike('how do I tell real hours on a used KTM 450 SX-F');
 assert.ok(h.hours.meters.length&&h.hours.estimate.length);
 const n:any=usedBike('what is a fair offer on a 2019 YZ250F that needs a top end');
 assert.ok(n.negotiation.items.length>=8);
 assert.ok(usedBike('buying a used RM-Z450 2021')!.platform_checks);
});

test('bikes are found by roster name, shorthand and year',()=>{
 assert.deepEqual(bikesIn('a used 2021 YZ450F'),[{make:'Yamaha',model:'YZ450F',year:2021}]);
 assert.deepEqual(bikesIn('looking at a 450 SX-F').map(b=>b.model),['450 SX-F']);
 assert.deepEqual(bikesIn('my yz250f').map(b=>b.model),['YZ250F'],'YZ250F, not also the YZ250');
 assert.deepEqual(bikesIn('an 18 crf450').map(b=>b.model),['CRF450R']);
 assert.equal(bikesIn("an '18 crf450")[0].year,2018);
 assert.deepEqual(bikesIn('rmz 250').map(b=>b.model),['RM-Z250']);
 assert.deepEqual(bikesIn('no bike named here'),[]);
});

test('short follow-ups inherit a used-bike conversation, but not when the rider moves on',()=>{
 const h=['looking at a used 2021 YZ450F, what should I check?'];
 const f=usedBike('and the linkage?',h);assert.ok(f?.from_history);
 assert.ok(usedBike('what about the title?',h)?.topics.includes('paperwork'));
 assert.equal(usedBike('how do I change my chain',h),null);
 assert.equal(usedBike('how do I adjust sag',h),null);
 assert.equal(usedBike('thanks',[]),null);
});

test('the section stays inside its size budget (about 2.5k tokens)',()=>{
 const everything='buying a used 2-stroke 2020 yz250 and a 2023 450 sx-f and a 2021 crf450r, what to look for, what to offer, how to tell real hours, check the VIN and frame number, the title and bill of sale, is it stolen, red flags, test ride';
 for(const q of [...USED_QUESTIONS,everything]){
  const r=usedBike(q);const n=JSON.stringify(r).length;
  assert.ok(n<=USED_BIKE_MAX_CHARS,`${n} chars for: ${q}`);
  assert.ok(n/4<=2500,`about ${Math.round(n/4)} tokens for: ${q}`);
 }
 const all:any=usedBike(everything);
 assert.ok(all.red_flags&&all.vin&&all.platform_checks,'what the rider asked about survives the budget');
});

const BANNED=/Keefer|Motocross Action|\bMXA\b|Dirt ?Rider|Dirt ?Bike ?(Magazine|Test)|Transmoto|Racer ?X|Cycle ?News|Vital ?MX|vitalmx|Cafe ?Husky|cafehusky|Maciag|AMSOIL|Partzilla|MotoSport|Motocross ?Hideout|Dirt ?Legal|Engine ?Patrol|RevZilla|Rocky Mountain|ThumperTalk|manualslib|https?:\/\//i;
test('rider-facing text never names a magazine, tester, retailer or forum, and never leaks sources',()=>{
 const riderData=JSON.stringify({inspection,hours,vin,paperwork,redFlags,negotiation,testRide,platformChecks},(k,v)=>k==='src'?undefined:v);
 assert.doesNotMatch(riderData,BANNED);
 for(const q of USED_QUESTIONS){const s=JSON.stringify(usedBike(q));assert.doesNotMatch(s,BANNED,q);assert.doesNotMatch(s,/"src"/,q);}
 // No BAK dollar figures in the rider data.
 assert.doesNotMatch(riderData,/\$\s?\d/);
});

test('recalls are linked, not repeated',()=>{
 const r:any=usedBike('buying a used 2025 CRF450R, what should I check?');
 assert.match(r.boundary,/recall_notice/);
 const recallChecks=r.platform_checks.flatMap((p:any)=>p.checks).filter((c:string)=>/recall/i.test(c));
 assert.ok(recallChecks.length>=1,'the used buyer is told to ask about the recall');
 for(const c of recallChecks)assert.doesNotMatch(c,/CPSC|stop riding|\b\d{2}-\d{3}\b/,'recall text itself comes from the recall guard');
});

const knowledgeFiles=readdirSync(new URL('../docs/research/knowledge/',import.meta.url)).filter(f=>f.endsWith('.json'));
const records=knowledgeFiles.flatMap(f=>{const d=JSON.parse(readFileSync(new URL('../docs/research/knowledge/'+f,import.meta.url),'utf8'));return d&&typeof d==='object'&&Array.isArray(d.records)?d.records.map((r:any)=>({...r,file:f})):[];});
test('every platform check points at research rows that exist',()=>{
 const ids=new Set(records.map((r:any)=>r.id));
 for(const p of platformChecks)for(const c of p.checks)for(const id of c.ids)assert.ok(ids.has(id),`unknown research id ${id} (${p.make} ${p.models[0]})`);
 for(const p of platformChecks)assert.ok(p.years[0]<=p.years[1]&&p.years[0]>=2015&&p.years[1]<=2027,`${p.make} ${p.models[0]} years`);
});

test('the used-bike research records follow the knowledge standard',()=>{
 const used=records.filter((r:any)=>/^used_/.test(r.file));
 assert.ok(used.length>=6);
 const DOMAINS=new Set(['identity','engine_architecture','power_feel','ecu_electronics','engine_mods','chassis','suspension','drivetrain','maintenance','known_issues','setups']);
 for(const r of used){
  assert.match(r.id,/^used-/,r.id);assert.ok(DOMAINS.has(r.domain),r.id);assert.ok(['OEM','MEASURED','TUNER','DERIVED','COMMUNITY'].includes(r.tier),r.id);
  assert.ok(r.source?.url&&/^https:\/\//.test(r.source.url)&&r.source.date,`${r.id} has a source URL and date`);
  assert.doesNotMatch(r.statement,BANNED,r.id);
  if(r.tier==='COMMUNITY')assert.match(r.notes,/https:\/\//,`${r.id}: a COMMUNITY record names its second agreeing source`);
 }
 assert.ok(used.some((r:any)=>r.domain==='known_issues'&&r.applies_to.make==='Suzuki'),'Suzuki has a known-issues record');
});

test('every fact points at a recorded source, and every source is in SOURCES.md',()=>{
 const ids=new Set(USED_SOURCES.map(s=>s.id));assert.equal(ids.size,USED_SOURCES.length,'source ids are unique');
 const refs=[...inspection.flatMap(a=>a.src),...hours.src,...vin.src,...vin.by_make.flatMap(m=>m.src),...paperwork.src,...redFlags.flatMap(r=>r.src),...negotiation.items.flatMap(i=>i.src),...testRide.flatMap(s=>s.src)];
 for(const r of refs)assert.ok(ids.has(r),`unknown source id ${r}`);
 const md=readFileSync(new URL('../docs/research/used-bike/SOURCES.md',import.meta.url),'utf8');
 for(const s of USED_SOURCES){assert.ok(md.includes(s.id),`SOURCES.md is missing ${s.id}`);assert.ok(md.includes(s.url),`SOURCES.md is missing the URL for ${s.id}`);assert.match(s.accessed,/^\d{4}-\d{2}-\d{2}$/);}
 for(const r of records.filter((x:any)=>/^used_/.test(x.file)))assert.ok(md.includes(r.source.url),`SOURCES.md is missing ${r.id}'s source`);
});

test('the data covers the ground buyers ask about',()=>{
 for(const id of ['cold_start','noises','leaks_fluids','compression','four_stroke_valves','two_stroke','air_filter','suspension','linkage_swingarm','steering_head','wheels','chain_sprockets','brakes','frame','clutch_gearbox'])assert.ok(inspection.some(a=>a.id===id),id);
 for(const m of ['KTM','Honda','Yamaha','Kawasaki','Suzuki','Triumph'])assert.ok(vin.by_make.some(b=>b.make.includes(m)),m);
 for(const m of ['YZ450F','YZ250F','CRF450R','CRF250R','KX450','KX250','RM-Z450','450 SX-F','FC 450','TF 250-X'])assert.ok(platformChecks.some(p=>p.models.includes(m)),m);
 assert.deepEqual(Object.keys(vin.year_codes).length>=13,true);
});
