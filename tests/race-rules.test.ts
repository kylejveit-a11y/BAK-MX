import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {raceRules,isRaceRulesQuestion,RACE_RULES,raceRuleUnknowns,RACE_RULES_VERSION,RACE_RULES_MAX_CHARS} from '../shared/race-rules.ts';

const RULES_QUESTIONS=[
 'What is the sound limit for supercross?',
 'Can my 11 year old race a supermini at Loretta Lynns?',
 'What plate color for 250 B?',
 'Is VP race gas legal for AMA pro?',
 'what does tech inspection check',
 'Do I need a chest protector at an AMA amateur race?',
 'How do I qualify for Loretta Lynns from Florida?',
 'What class can my son race on a KTM 85?',
 '250 east west rules',
 'how many motos at a regional',
 'What happens if I fail the sound test after the race?',
 'is a 300 two stroke legal in the 450 class',
 'what helmet standards are allowed',
 'where does the transponder go',
 'arenacross classes rules',
 'tell me the race rules',
];
const NOT_RULES=[
 'front pushes in flat corners',
 'the rear sounds harsh over braking bumps',
 'what jetting for race fuel at sea level',
 'rule of thumb for sag on a 450',
 'how do I corner faster in ruts',
 'my 85 bogs off the bottom',
 'when should I change my fork oil',
 'best tire pressure for sand',
];
const tokens=(o:unknown)=>Math.ceil(JSON.stringify(o).length/4);

test('only racing-rules conversations get the race-rules section',()=>{
 for(const q of RULES_QUESTIONS){assert.ok(isRaceRulesQuestion(q),q);assert.ok(raceRules(q),q);}
 for(const q of NOT_RULES){assert.equal(isRaceRulesQuestion(q),false,q);assert.equal(raceRules(q),null,q);}
});

test('a short follow-up inherits a rules conversation, but not a tuning one',()=>{
 assert.ok(raceRules('what about for 85s?',['What class can my son race at Loretta Lynns?']));
 assert.ok(raceRules('and for the 250 class?',['What is the sound limit for supercross?']));
 assert.equal(raceRules('how much sag should I run?',['what plate color for B?']),null);
 assert.equal(raceRules('what about for 85s?',['my fork feels harsh']),null);
 // Only the last few messages count.
 assert.equal(raceRules('and for the 250?',['what is the sound limit','sag?','clickers?','jetting?']),null);
});

test('the section stays compact: under about 2.5k tokens for every kind of question',()=>{
 const all=[...RULES_QUESTIONS,'rules sound fuel tech plates gear qualifying arenacross classes eligibility florida pro amateur'];
 for(const q of all){
  const r=raceRules(q)!;
  assert.ok(JSON.stringify(r).length<=RACE_RULES_MAX_CHARS,`${q}: ${JSON.stringify(r).length} chars`);
  assert.ok(tokens(r)<2500,`${q}: ~${tokens(r)} tokens`);
 }
});

test('every rule carries its year and a short source label, never a URL',()=>{
 assert.match(RACE_RULES_VERSION,/^race-rules-/);
 assert.equal(new Set(RACE_RULES.map(r=>r.id)).size,RACE_RULES.length);
 for(const r of RACE_RULES){
  assert.ok(Number.isInteger(r.year)&&r.year>=2020&&r.year<=2027,r.id);
  assert.ok(r.source.length>0&&r.source.length<=160,r.id);
  assert.doesNotMatch(JSON.stringify(r),/https?:|www\.|\.com\b|\.org\b/,r.id);
  if(r.year<2026)assert.ok(r.caution||r.topic==='local',`${r.id} is from an older year and needs a caution`);
 }
 for(const u of raceRuleUnknowns)assert.ok(Number.isInteger(u.year),u.what);
 // Every item that reaches the model keeps its year and source.
 for(const q of RULES_QUESTIONS){
  const r:any=raceRules(q);
  for(const i of r.items){assert.ok(Number.isInteger(i.year),q);assert.ok(i.source,q);}
 }
});

test('answers point at the right rules and carry the confirm-before-race-day advice',()=>{
 const sound:any=raceRules('What is the sound limit for supercross?');
 assert.equal(sound.topics[0],'sound');
 assert.ok(sound.items.every((i:any)=>i.topic==='sound'));
 assert.match(sound.items[0].rule,/112 dB\/A/);
 assert.match(sound.boundary,/confirm with the current rulebook/);
 const plates:any=raceRules('What plate color for 250 B?');
 assert.equal(plates.topics[0],'plates');
 assert.ok(plates.items.some((i:any)=>/yellow/i.test(i.rule)));
 const mini:any=raceRules('Can my 11 year old race a supermini at Loretta Lynns?');
 assert.ok(mini.items.some((i:any)=>/must be 12/.test(i.rule)));
 const fuel:any=raceRules('Is VP race gas legal for AMA pro?');
 assert.ok(fuel.items.every((i:any)=>i.topic==='fuel'));
 assert.match(fuel.items[0].rule,/D4814/);
 // Unknowns ride along so BAK says it does not know instead of guessing.
 const tech:any=raceRules('what does tech inspection check');
 assert.ok(tech.unknown.some((u:any)=>/bar-end/i.test(u.what)));
});

test('amateur rules come from the 2026 AMA book, not the 2023 edition or the forum memo',()=>{
 assert.equal(RACE_RULES_VERSION,'race-rules-2026.2');
 for(const r of RACE_RULES)assert.doesNotMatch(r.source,/2023|memo|repost/i,r.id);
 const am:any=raceRules('What is the sound limit for my 250F at a local AMA amateur race?');
 const text=JSON.stringify(am.items);
 assert.match(text,/94 dB\/A/);assert.match(text,/126–250cc 5,000/);assert.match(text,/2028/);
 assert.ok(am.items.filter((i:any)=>/AMA amateur/.test(i.applies)).every((i:any)=>i.year===2026&&!i.caution));
 const age:any=raceRules('how old do you have to be to race a 450 in AMA amateur?');
 assert.ok(age.items.some((i:any)=>/16 to ride 251cc/.test(i.rule)));
});

test('every source label is listed in SOURCES.md',()=>{
 const md=readFileSync(new URL('../docs/research/race-rules/SOURCES.md',import.meta.url),'utf8');
 const labels=new Set(RACE_RULES.flatMap(r=>r.source.split('; ').map(s=>s.replace(/ \(\d{4}\)$/,''))));
 for(const l of labels)assert.ok(md.includes(l),`SOURCES.md is missing "${l}"`);
});
