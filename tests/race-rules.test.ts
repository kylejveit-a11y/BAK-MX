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
 // Second pass: flags, starts, scoring, protests, entry, paddock, series.
 'what does the red cross flag mean in supercross',
 'can you pass under a yellow flag',
 'when does the gate drop after the 30 second card',
 'what is the penalty for jumping the gate',
 'how are motos scored',
 'who wins a tie in the overall',
 'how do the smx playoffs work',
 'how much is a protest fee',
 'what is the claiming rule',
 'do I need an AMA membership to race',
 'my son races tristar, does he need a minor release?',
 'can grandma take my daughter to race without me',
 'can I use a pit bike at mini o\'s',
 'what are the florida winter am classes',
 'what classes does partzilla arenacross have',
 'mxgp displacement rules',
 'wmx age requirement',
 'what happens if I cut the track',
 'how many road to supercross points do I need for a 250 license',
 'what are the hare scramble rules for spark arrestors',
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
 'how do I get better starts off the gate',
 'how do I jump a triple',
 'my bike is hard to start when hot',
 'how do I get a better holeshot',
 'can I run a bigger rear sprocket',
 'my bike stalls in the pits',
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

test('second pass covers flags, starts, scoring, protests, entry, paddock and the series Kyle races',()=>{
 const pick=(q:string)=>(raceRules(q) as any);
 const text=(q:string)=>JSON.stringify(pick(q).items);
 // Pro red cross: every obstacle one at a time, no passing; amateur yellow: no passing, roll jumps, 5 positions.
 assert.match(text('what does the red cross flag mean in supercross'),/no doubles, triples/);
 assert.match(text('can you pass under a yellow flag at an AMA amateur race'),/lose 5 positions/);
 assert.match(text('when does the gate drop after the 30 second card'),/between 5 and 10 seconds/);
 assert.match(text('how are motos scored'),/class size plus 30/);
 assert.match(text('how much is a protest fee'),/\$1,500/);
 assert.match(text('what is the claiming rule'),/50% over its MSRP/);
 assert.match(text('can grandma take my daughter to race without me'),/notarized/);
 // TriStar runs Partzilla Arenacross; its own page is the source, and its missing rulebook is an unknown.
 const ax=pick('my son races tristar, does he need a minor release?');
 assert.ok(ax.items.some((i:any)=>i.source.includes('TriStar')&&/minor waiver/.test(i.rule)));
 assert.ok(pick('what classes does partzilla arenacross have').unknown.some((u:any)=>/TriStar MX \/ Partzilla/.test(u.what)));
 assert.match(text('can I use a pit bike at mini o\'s'),/7 mph/);
 assert.match(text('what are the florida winter am classes'),/all five rounds/);
 assert.match(text('how many road to supercross points do I need for a 250 license'),/four points/);
 // Older or secondary sources keep their caution.
 const smx=pick('how do the smx playoffs work').items.find((i:any)=>i.source.includes('Playoffs'));
 assert.ok(smx&&smx.year===2025&&smx.caution);
 const fim=pick('mxgp displacement rules').items.find((i:any)=>i.source.includes('FIM'));
 assert.ok(fim&&fim.year===2021&&fim.caution);
 // A plain plate question stays on plates and classes, not the arenacross plate list.
 assert.ok(pick('What plate color for 250 B?').items.every((i:any)=>['plates','classes'].includes(i.topic)));
 // Every topic has items, and keywords never leak into the output.
 for(const t of ['classes','eligibility','entry','sound','fuel','tech','plates','gear','flags','starts','scoring','protests','paddock','qualifying','arenacross','local'])
  assert.ok(RACE_RULES.some(r=>r.topic===t),t);
 assert.doesNotMatch(JSON.stringify(pick('what does the red cross flag mean in supercross')),/"kw"|"core"|"who"/);
});

test('amateur rules come from the 2026 AMA book, not the 2023 edition or the forum memo',()=>{
 assert.equal(RACE_RULES_VERSION,'race-rules-2026.3');
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
