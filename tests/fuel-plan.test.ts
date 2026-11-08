import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {buildFuelPlan,composeFoods,cupsText,draftBody,draftFrom,FOODS,FUEL_SOURCES,gatesOf,isYouth,nextGate,profileProblem,RED_FLAGS,readFuelDay,riderOf,SCREEN_IDS,screenBlock,shiftGate,splitByNow,sweatTest,toKg,untilText,withSweatRate,YOUTH_FORBIDDEN,type DayInput,type FuelPlan,type FuelProfileRow,type FuelRider,type PlanItem} from '../shared/fuel-plan.ts';
import {fuelPlanKnowledge,FUEL_PLAN_KNOWLEDGE_MAX_CHARS,FUEL_PLAN_KNOWLEDGE_VERSION,FUEL_PLAN_FACTS} from '../shared/fuel-plan-knowledge.ts';
import {fuelProfileSchema,handleFuelProfiles,profileRow} from '../server/fuel-profiles.ts';

const day=(over:Partial<DayInput>={}):DayInput=>({kind:'race',gates:[{label:'Moto 1',at:'10:00'},{label:'Moto 2',at:'14:00'},{label:'Moto 3',at:'15:30'}],motoMinutes:20,...over});
const adult=(kg:number,over:Partial<FuelRider>={}):FuelRider=>({weight:kg,weight_unit:'kg',age:30,...over});
const item=(p:FuelPlan,id:string)=>p.items.find(i=>i.id===id)!;
const near=(a:number,b:number,tol=10)=>assert.ok(Math.abs(a-b)<=tol,`${a} ≈ ${b}`);

// ------------------------------------------------------------------ formulas
for(const kg of [35,70,90]){
 test(`formulas at ${kg} kg (adult)`,()=>{
  const p=buildFuelPlan(adult(kg,{caffeine:true,sweat_rate_lph:1.2}),day());
  assert.equal(p.youth,false);assert.equal(p.blocked,null);
  // Pre-race meal 3.5 h before: 1–2 g/kg.
  const meal=item(p,'meal');
  assert.equal(meal.at,'06:30');assert.equal(meal.offset,-210);
  assert.deepEqual(meal.eat!.detail!.carb_g,[kg,2*kg]);
  assert.ok(meal.eat!.detail!.foods_carb_g>=kg*0.85&&meal.eat!.detail!.foods_carb_g<=2*kg*1.1+8,'foods add up to the range');
  assert.equal(meal.evidence,'evidence-based');assert.ok(meal.sources.includes('joint2016'));
  // Fluids: 5–7 mL/kg at least 4 h before; 3–5 mL/kg at 2 h only if urine is dark.
  const pre=item(p,'pre-fluid');assert.ok((pre.offset??0)<=-240);
  near(pre.drink!.ml![0],5*kg);near(pre.drink!.ml![1],7*kg);
  const chk=item(p,'pre-fluid-check');assert.equal(chk.offset,-120);assert.ok(chk.optional);assert.match(chk.drink!.only_if!,/dark/);
  near(chk.drink!.ml![0],3*kg);near(chk.drink!.ml![1],5*kg);
  // Caffeine 2–3 mg/kg, 60 min before, opt-in adults only.
  const caf=item(p,'caffeine');assert.equal(caf.offset,-60);assert.match(caf.drink!.text,new RegExp(`^${Math.round(2*kg)}–${Math.round(3*kg)} mg`));
  // Snack 30–60 min before: 15–30 g, optional, practitioner convention.
  const snack=item(p,'snack-0');assert.ok(snack.optional);assert.deepEqual(snack.eat!.detail!.carb_g,[15,30]);assert.equal(snack.evidence,'expert practice');
  assert.ok(snack.offset!<=-30&&snack.offset!>=-60);
  // Between motos 1 and 2 (3 h 40 after the moto): 1.0–1.2 g/kg/h, bulk early, solids stop 60–90 min before.
  const feeds=p.items.filter(i=>i.id.startsWith('feed-0-'));
  assert.ok(feeds.length>=2);
  const windowH=(14*60-75-(10*60+20+15))/60;
  const lo=feeds.reduce((s,f)=>s+f.eat!.detail!.carb_g[0],0),hi=feeds.reduce((s,f)=>s+f.eat!.detail!.carb_g[1],0);
  // capped: about 1.0-1.5 g/kg across the gap (short motos), never the full hourly recovery dose on long gaps
  near(lo,1.0*kg*Math.min(windowH,1),feeds.length);near(hi,Math.max(1.0*kg*Math.min(windowH,1),Math.min(1.2*kg*windowH,1.5*kg)),feeds.length);
  assert.ok(feeds[0].eat!.detail!.carb_g[0]>=feeds[1].eat!.detail!.carb_g[0],'the bulk is eaten early');
  const stop=item(p,'stop-0');assert.ok(stop.offset!<=-60&&stop.offset!>=-90);
  for(const f of feeds)assert.ok((f.offset??0)<=-60,'no solid food in the last hour');
  // Protein 20–30 g (~0.3 g/kg) after the moto, not right before the gate.
  const prot=feeds[0].eat!.detail!.protein_g!;assert.ok(prot[0]>=15&&prot[1]<=30&&prot[1]>=20);
  assert.ok(!feeds.slice(1).some(f=>f.eat!.detail!.protein_g),'protein only with the first feed');
  // Sweat rate 1.2 L/h × 20 min = 400 mL per moto; between motos never more than that.
  assert.equal(p.ceiling.ml,400);
  const fl=item(p,'fluid-0');assert.deepEqual(fl.drink!.ml,[320,400]);assert.ok(fl.drink!.ml![1]<=p.ceiling.ml!);
  // After: 1.25–1.5 × loss.
  assert.deepEqual(item(p,'after-fluid').drink!.ml,[500,600]);
  // No food during or right before the gate.
  assert.match(item(p,'gate-0').why,/nothing during the moto/);
 });
}

test('pre-race meal scales toward 1 g/kg when the gate is closer than 3 h',()=>{
 const near2=buildFuelPlan(adult(70),day({mealAt:'07:30'}));assert.deepEqual(item(near2,'meal').eat!.detail!.carb_g,[70,105]);
 const near1=buildFuelPlan(adult(70),day({mealAt:'08:30'}));assert.deepEqual(item(near1,'meal').eat!.detail!.carb_g,[35,70]);
 assert.ok(item(near1,'meal').eat!.foods.every(f=>!/oatmeal|PB&J/.test(f)),'nothing slow 1.5 h before');
 const early=buildFuelPlan(adult(70),day({gates:[{label:'Moto 1',at:'06:00'}]}));
 assert.ok(!early.items.some(i=>i.id==='meal'),'too early for a meal');assert.ok(early.notes.some(n=>/too soon for a meal/.test(n)));
 const oat=buildFuelPlan(adult(70),day({mealAt:'07:30'}));assert.ok(!item(oat,'meal').eat!.foods.some(f=>/oatmeal/.test(f)),'oatmeal only 3–4 h before');
});

test('nervous stomach: meal earlier, easy foods, liquids, lower end',()=>{
 const p=buildFuelPlan(adult(70,{nervous_stomach:true}),day());
 assert.equal(item(p,'meal').offset,-240);
 assert.deepEqual(item(p,'meal').eat!.detail!.carb_g,[70,105]);
 const easy=new Set(FOODS.filter(f=>f.easy).map(f=>f.portion));
 for(const it of p.items)for(const d of it.eat?.detail?.per_food??[])assert.ok([...easy].some(e=>d.food.includes(e.replace(/^1 /,''))||d.food===e),`${d.food} is easy`);
 assert.ok(p.notes.some(n=>/train your gut/i.test(n)));
});

test('day before: no carb-loading, meals as portions, grams only as a reference',()=>{
 const p=buildFuelPlan(adult(70),day());
 assert.match(p.dayBefore[0].why,/longer than 90 minutes/);
 const meals=p.dayBefore.find(i=>i.id==='db-meals')!;
 assert.deepEqual(meals.eat!.detail!.carb_g,[490,840]);assert.match(meals.eat!.detail!.basis,/Reference only, not a target/);
 assert.ok(meals.eat!.foods.every(f=>!/\d+\s?g\b/.test(f)),'meals are portions, not grams');
 assert.equal(buildFuelPlan(adult(70),day({kind:'practice'})).dayBefore.length,0);
});

test('composeFoods stays inside the range and drops slow foods near the gate',()=>{
 for(const [lo,hi] of [[15,30],[35,70],[70,140],[90,180]] as const){const c=composeFoods(lo,hi,{hours:3.5,slot:'meal'});assert.ok(c.carb>=lo*0.85&&c.carb<=hi*1.1+8,`${c.carb} in ${lo}–${hi}`);}
 assert.ok(!composeFoods(60,90,{hours:1.5,slot:'meal'}).foods.some(f=>f.food.minH>1.5));
});

// ------------------------------------------------------------------ youth
const YOUTH_DAYS:DayInput[]=[day(),day({hot:true}),day({nervous:true}),day({caffeine:true}),day({kind:'practice'}),day({mealAt:'08:30'}),day({gates:[{label:'Moto 1',at:'09:00'},{label:'Moto 2',at:'09:50'}]})];
test('youth mode (under 18): never grams, calories, caffeine or weight; cups; water first',()=>{
 for(const age of [8,12,17])for(const kg of [25,35,60])for(const d of YOUTH_DAYS)for(const rate of [null,0.8]){
  const p=buildFuelPlan({weight:kg,weight_unit:'kg',age,caffeine:true,sweat_rate_lph:rate,nervous_stomach:age===12},d);
  assert.equal(p.youth,true);assert.equal(p.portionsOnly,true);
  const text=JSON.stringify({...p,sweat:{...p.sweat,rate_lph:null}});
  assert.doesNotMatch(text,YOUTH_FORBIDDEN,`age ${age}, ${kg} kg`);
  assert.doesNotMatch(text,/carb_g|protein_g|"detail"/);
  assert.ok(!p.items.some(i=>i.id==='caffeine'));
  assert.ok(!p.items.some(i=>/energy drink|supplement/i.test(`${i.eat?.foods.join(' ')} ${i.drink?.what}`)),'never suggested');
  for(const it of p.items)if(it.drink?.ml)assert.fail('youth drinks are cups, not mL');
  assert.ok(p.notes.some(n=>/Water is the main drink/.test(n)));
  if(d.kind==='race')assert.ok(p.items.some(i=>i.id.startsWith('pits-')&&/½–1 cup every 15–20 minutes/.test(i.drink!.text)),'AAP pit drinking');
 }
 // A gate shift keeps youth mode too.
 const shifted=shiftGate(day(),1,'15:10',{now:'11:00',lastAteAt:'10:40',youth:true});
 assert.doesNotMatch(JSON.stringify(buildFuelPlan({weight:30,weight_unit:'kg',age:10},shifted.day)),YOUTH_FORBIDDEN);
 // An adult-written extra item is cleaned for youth.
 const leaked:PlanItem={id:'shift-x',phase:'gate',at:'09:00',gate:0,offset:-60,title:'Top-up',eat:{foods:['30 g carbs'],detail:{carb_g:[15,30],foods_carb_g:20,per_food:[],basis:'x'}},why:'2 mg per kg caffeine',evidence:'expert practice',sources:['practice']};
 assert.doesNotMatch(JSON.stringify(buildFuelPlan({weight:30,weight_unit:'kg',age:10},day({extra:[leaked]}))),YOUTH_FORBIDDEN);
 assert.equal(isYouth(17),true);assert.equal(isYouth(18),false);assert.equal(isYouth(Number.NaN),true,'unknown age is treated as youth');
 assert.equal(cupsText(240),'1 cup');assert.equal(cupsText(360),'1½ cups');assert.equal(cupsText(120),'½ cup');
});

test('caffeine is off by default and adults only',()=>{
 assert.ok(!buildFuelPlan(adult(70),day()).items.some(i=>i.id==='caffeine'));
 assert.ok(buildFuelPlan(adult(70,{caffeine:true}),day()).items.some(i=>i.id==='caffeine'));
 assert.ok(!buildFuelPlan(adult(70,{caffeine:true}),day({caffeine:false})).items.some(i=>i.id==='caffeine'));
});

// ------------------------------------------------------------------ fluids
test('a fluid ceiling is always shown; no sweat-rate default until a test is logged',()=>{
 for(const r of [adult(70),adult(70,{sweat_rate_lph:1.5}),{weight:35,weight_unit:'kg' as const,age:11},adult(70,{screen:['heart']})]){
  const p=buildFuelPlan(r,day());assert.ok(p.ceiling.text.length>20);assert.match(p.ceiling.text,/no more than/i);
 }
 const none=buildFuelPlan(adult(70),day());
 assert.equal(none.ceiling.ml,null);assert.equal(none.sweat.rate_lph,null);assert.match(none.sweat.prompt!,/sweat test/);
 for(const i of none.items.filter(x=>x.phase==='between'&&x.drink))assert.equal(i.drink!.ml,undefined,'no invented volume');
 for(const i of none.items.filter(x=>x.drink&&x.phase!=='day-before'))assert.ok(i.drink!.ceiling||i.drink!.only_if||/sips/i.test(i.drink!.text)||i.id==='caffeine','every drink is bounded');
 const hot=buildFuelPlan(adult(70,{sweat_rate_lph:1,sweat_test_hot:false}),day({hot:true}));
 assert.match(item(hot,'fluid-0').why,/cooler day/);assert.match(item(hot,'fluid-0').drink!.what,/460–1,150 mg/);
 assert.equal(buildFuelPlan(adult(70),day({forecast:{tempF:91}})).hot,true);
});

test('sweat test: (pre − post + drunk − urine) / hours; no weight in the text; gain and >2% flagged',()=>{
 const r=sweatTest({pre:70,post:69.2,unit:'kg',drankMl:500,urineMl:100,minutes:60});
 assert.ok(r.ok);if(!r.ok)return;
 assert.equal(r.rate_lph,1.2);assert.equal(r.loss_kg,0.8);assert.deepEqual(r.replace_ml,[1000,1200]);
 assert.match(r.replaceText,/^Fluid to replace: 1000–1200 mL/);assert.doesNotMatch(r.replaceText,/kg|lb/);
 const lb=sweatTest({pre:154,post:152,unit:'lb',drankMl:0,minutes:30});assert.ok(lb.ok&&Math.abs(lb.rate_lph-toKg(2,'lb')*2)<0.01);
 const gain=sweatTest({pre:70,post:70.4,unit:'kg',drankMl:1200,minutes:60});assert.ok(gain.ok&&/drank more than you sweated/.test(gain.flags[0]));
 const big=sweatTest({pre:60,post:58.5,unit:'kg',drankMl:0,minutes:60});assert.ok(big.ok&&/more than 2%/.test(big.flags[0]));
 const kid=sweatTest({pre:35,post:34.5,unit:'kg',drankMl:200,minutes:45},{youth:true});assert.ok(kid.ok&&/cups?/.test(kid.replaceText));assert.doesNotMatch(JSON.stringify(kid.ok&&kid.replaceText),YOUTH_FORBIDDEN);
 assert.equal(sweatTest({pre:70,post:0,unit:'kg',drankMl:0,minutes:60}).ok,false);
 assert.equal(sweatTest({pre:70,post:60,unit:'kg',drankMl:0,minutes:30}).ok,false,'impossible rate');
});

// ------------------------------------------------------------------ gate shifts
test('gate shifts: delay ≥60 adds a top-up, earlier after a meal is sips only, ≥4 h adds a meal; later gates follow',()=>{
 const d=day();
 const late=shiftGate(d,0,'11:15',{now:'09:00'});
 assert.equal(gatesOf(late.day)[0].at,'11:15');assert.equal(gatesOf(late.day)[1].at,'15:15','cascades by default');
 const top=late.added.find(a=>/top-up/.test(a.title))!;assert.equal(top.at,'10:30');assert.equal(top.offset,-45);
 const plan=buildFuelPlan(adult(70),late.day);
 assert.ok(plan.items.some(i=>i.id===top.id),'saved with the day and shown in the plan');
 assert.equal(item(plan,'gate-0').at,'11:00','everything re-anchors to the new gate');
 assert.equal(shiftGate(d,0,'11:15',{now:'09:00',cascade:false}).day.gates[1].at,'14:00');
 const small=shiftGate(d,0,'10:30',{now:'09:00'});assert.equal(small.added.length,0);assert.match(small.notes[0],/no extra food/);
 const early=shiftGate(d,1,'12:30',{now:'11:00',lastAteAt:'10:45'});
 assert.ok(early.added.some(a=>/sips only/.test(a.title)&&a.drink));assert.ok(!early.added.some(a=>a.eat));
 const meal=shiftGate(d,1,'15:30',{now:'11:00'});assert.ok(meal.added.some(a=>/full meal/.test(a.title)));
 // Shifting the same gate again replaces its earlier additions.
 const twice=shiftGate(late.day,0,'12:30',{now:'09:00'});assert.equal(twice.day.extra!.filter(x=>x.id.startsWith('shift-0-')).length,twice.added.length);
 assert.deepEqual(nextGate(d,'09:30'),{index:0,label:'Moto 1',at:'10:00',minutes:30});
 assert.equal(nextGate(d,'16:00'),null);assert.equal(untilText(80),'in 1 h 20');
 const {ahead,past}=splitByNow(buildFuelPlan(adult(70),d).items,'12:00');assert.ok(past.some(i=>i.id==='meal'));assert.ok(ahead.some(i=>i.id==='after-meal'));
});

test('short gaps: under 2 h a small snack, under 1 h sips only, protein waits',()=>{
 const p=buildFuelPlan(adult(70),day({gates:[{label:'Moto 1',at:'10:00'},{label:'Moto 2',at:'11:30'},{label:'Moto 3',at:'12:10'}]}));
 const f0=p.items.filter(i=>i.id.startsWith('feed-0-'));assert.equal(f0.length,1);assert.deepEqual(f0[0].eat!.detail!.carb_g,[15,30]);assert.equal(f0[0].eat!.detail!.protein_g,undefined);
 assert.ok(!p.items.some(i=>i.id.startsWith('feed-1-')));assert.match(item(p,'fluid-1').why,/no food, just sips/);
});

// ------------------------------------------------------------------ safety
test('heat red flags are always present: normal, no gates, bad profile, screened, ill',()=>{
 const plans=[buildFuelPlan(adult(70),day()),buildFuelPlan(adult(70),day({gates:[]})),buildFuelPlan(adult(500),day()),buildFuelPlan(adult(70,{screen:['diabetes']}),day()),buildFuelPlan(adult(70,{screen:['ill_now'],cleared:true}),day()),buildFuelPlan({weight:30,weight_unit:'kg',age:9},day({kind:'practice'}))];
 for(const p of plans){
  assert.deepEqual(p.safety.stop,RED_FLAGS.stop);
  for(const w of ['Dizziness','Headache','Nausea','tiredness','Chills','Cramps','coordination'])assert.ok(p.safety.stop.some(s=>s.includes(w)),w);
  for(const w of ['Confusion','Collapse','seizure'])assert.ok(p.safety.call911.some(s=>s.toLowerCase().includes(w.toLowerCase())),w);
  assert.match(p.safety.lowSodium,/stop drinking fluids and call 911/);assert.match(p.safety.note,/cool them first.*transport second/);
  assert.ok(p.disclaimer.includes('not medical advice'));
 }
});

test('refer out: screened conditions block until cleared; sick today always blocks; disordered eating gets no grams',()=>{
 for(const id of SCREEN_IDS){
  const b=buildFuelPlan(adult(70,{screen:[id]}),day());assert.ok(b.blocked,id);assert.equal(b.items.length,0);
  const c=buildFuelPlan(adult(70,{screen:[id],cleared:true}),day());
  if(id==='ill_now'){assert.ok(c.blocked);assert.equal(c.blocked!.canClear,false);}else assert.equal(c.blocked,null,id);
 }
 const de=buildFuelPlan(adult(70,{screen:['disordered_eating'],cleared:true}),day());
 assert.equal(de.portionsOnly,true);assert.doesNotMatch(JSON.stringify(de.items),/carb_g|\b\d+ g\b|calori/);
 assert.equal(screenBlock({screen:[]}),null);
});

test('no calorie counting, no weight goals, weight never shown on the plan',()=>{
 for(const kg of [35,70,90]){
  const text=JSON.stringify(buildFuelPlan(adult(kg,{sweat_rate_lph:1}),day({hot:true,nervous:true})));
  assert.doesNotMatch(text,/calori|kcal|ideal weight|lose weight|weight goal|target weight/i);
  assert.ok(!text.includes(`${kg} kg`)&&!text.includes(`"weight"`),'the rider’s weight is not in the plan');
 }
 assert.ok(profileProblem({weight:10,weight_unit:'kg',age:30}));assert.ok(profileProblem({weight:70,weight_unit:'kg',age:30,height_cm:40}));assert.equal(profileProblem({weight:150,weight_unit:'lb',age:15}),null);
});

test('profile drafts round-trip, keep the sweat test and never opt minors into caffeine',()=>{
 const row:FuelProfileRow={id:'00000000-0000-4000-8000-000000000001',kind:'rider',name:'Wy',weight_kg:'36.3',weight_unit:'lb',height_cm:'142.0',age:12,sex:null,nervous_stomach:true,caffeine:false,moto_minutes:15,sweat_rate_lph:'0.70',sweat_test_at:'2026-11-01T15:00:00Z',sweat_test_hot:true,screen:[],cleared:false};
 const d=draftFrom(row,{id:row.id,kind:'rider'});assert.equal(d.weight,'80');assert.equal(d.ft,'4');assert.equal(d.inch,'8');
 const b=draftBody({...d,caffeine:true},row);assert.ok('body' in b);if(!('body' in b))return;
 assert.equal(b.body.caffeine,false);assert.equal(b.body.sweat_rate_lph,0.7);assert.equal(b.body.height_cm,142);
 assert.equal(withSweatRate(row,0.95,false,'2026-11-08T12:00:00Z').sweat_rate_lph,0.95);
 assert.ok('problem' in draftBody({...d,name:''},row));
 const r=riderOf(row);assert.equal(r.weight,36.3);assert.equal(r.weight_unit,'kg');
 assert.equal(readFuelDay({day:'2026-11-07',profileId:'p',input:{kind:'race',gates:[{label:'Moto 1',at:'09:00'}]}},'2026-11-08','race','10:40').input.gates[0].at,'10:40','yesterday’s times are not reused');
});

// ------------------------------------------------------------------ Ask BAK knowledge
const ON=['what should I eat before my first moto','how much water should I drink on race day','I get cramps in moto 2','my stomach gets nervous and I throw up before the gate','is coffee ok before racing','what should my 10 year old eat at the track','is it too hot to ride today, how do I stay hydrated','what do I eat between motos','moto 2 got delayed an hour, should I eat something','should I carb load the night before','how do I do a sweat test','I felt dizzy after moto 1','energy drinks before a race?','I always feel sick on the bike after breakfast','what about electrolytes'];
const OFF=['how do I jet my carb for hot humid weather','what octane fuel for my 450','bike is overheating on a hot day','coolant boiling over','how much fuel to refuel between motos','tire pressure in the heat','fork feels harsh','my PW50 pee wee needs a new chain','change the oil','water in my fuel','heat cycle new tires','my carb is running rich','refuel the bike between motos','what map for the heat',''];
test('knowledge: only for eating, drinking, hydration, cramps, heat and race-day food',()=>{
 for(const q of ON){const r=fuelPlanKnowledge(q);assert.ok(r,`expected a section for: ${q}`);assert.equal(r!.version,FUEL_PLAN_KNOWLEDGE_VERSION);}
 for(const q of OFF)assert.equal(fuelPlanKnowledge(q),null,`expected null for: ${q}`);
 assert.ok(fuelPlanKnowledge('and how much?',['what should I drink between motos'])?.from_history);
 assert.equal(fuelPlanKnowledge('and the rear?',['what tire pressure in sand']),null);
 assert.equal(fuelPlanKnowledge('what about the fork?',['what should I eat']),null,'a follow-up on another system does not inherit');
});

test('knowledge: size cap, red flags always, sources as labels, youth never gets a caffeine dose',()=>{
 const all=['my 12 year old is nervous, gets cramps and dizzy in the heat; what foods, drinks and coffee should he have, and what if the gate is delayed','what should I eat and drink, caffeine, cramps, heat, nervous stomach, gate delayed, foods list',...ON];
 for(const q of all){
  const r=fuelPlanKnowledge(q)!;const text=JSON.stringify(r);
  assert.ok(text.length<=FUEL_PLAN_KNOWLEDGE_MAX_CHARS,`${text.length} chars for: ${q}`);
  assert.ok(FUEL_PLAN_KNOWLEDGE_MAX_CHARS/4<=2500,'about 2.5k tokens at most');
  assert.ok(r.red_flags.stop_and_cool.length>=7&&r.red_flags.call_911.length>=3);
  assert.doesNotMatch(text,/https?:\/\//);
  for(const v of Object.values(r.sources))assert.ok(Object.values(FUEL_SOURCES).includes(v as never));
 }
 const kid=fuelPlanKnowledge('can my 14 year old have coffee or an energy drink before his moto')!;
 assert.ok(kid.topics.includes('youth'));assert.doesNotMatch(JSON.stringify(kid.facts.caffeine),/2–3 mg\/kg/);assert.match(JSON.stringify(kid.facts.caffeine),/under 18/);
 assert.match(JSON.stringify(fuelPlanKnowledge('how much coffee before a race')!.facts.caffeine),/2–3 mg\/kg/);
 for(const list of Object.values(FUEL_PLAN_FACTS))for(const f of list)assert.ok(f.src.length&&f.src.every(s=>s in FUEL_SOURCES));
});

// ------------------------------------------------------------------ the route
const me='00000000-0000-4000-8000-0000000000aa',other='00000000-0000-4000-8000-0000000000bb',pid='00000000-0000-4000-8000-000000000011';
type Q={table:string;op:string;row?:Record<string,unknown>;filters:[string,string,unknown][]};
function fakeDb(answer:(q:Q)=>{data?:unknown;error?:unknown}){
 const calls:Q[]=[];
 return {calls,from(table:string){const q:Q={table,op:'',filters:[]};calls.push(q);const b:any={
  select(){if(!q.op)q.op='select';return b;},upsert(row:Record<string,unknown>){q.op='upsert';q.row=row;return b;},delete(){q.op='delete';return b;},
  then(ok:(r:unknown)=>void,fail:(e:unknown)=>void){try{const r=answer(q);ok({data:r.data??null,error:r.error??null});}catch(e){fail(e);}}};
  for(const f of ['eq','order','limit'])b[f]=(col:string,val:unknown)=>{q.filters.push([f,col,val]);return b;};
  b.single=()=>b;return b;}};
}
const req=(method:string,body?:unknown,query='')=>{const url=new URL('http://x/api/fuel-profiles'+query);return [new Request(url,{method,...(body?{body:JSON.stringify(body)}:{})}),url,'/api/fuel-profiles',method] as const;};
const good={id:pid,kind:'rider',name:'Addy',weight:80,weight_unit:'lb',height_cm:140,age:11,nervous_stomach:true};

test('route validation: bounded fields, no ownership fields, caffeine 18+',()=>{
 assert.equal(fuelProfileSchema.safeParse(good).success,true);
 assert.equal(fuelProfileSchema.safeParse({...good,user_id:other}).success,false);
 assert.equal(fuelProfileSchema.safeParse({...good,caffeine:true}).success,false,'no caffeine under 18');
 assert.equal(fuelProfileSchema.safeParse({...good,age:30,caffeine:true}).success,true);
 assert.equal(fuelProfileSchema.safeParse({...good,weight:20}).success,false,'20 lb is out of range');
 assert.equal(fuelProfileSchema.safeParse({...good,screen:['unknown']}).success,false);
 const row=profileRow(fuelProfileSchema.parse(good),me);assert.equal(row.user_id,me);assert.equal(row.weight_kg,36.3);assert.equal(row.caffeine,false);
});

test('route: every read and write is scoped to the rider; the riders cap holds',async()=>{
 let existing:{id:string}[]=[];
 const db=fakeDb(q=>{if(q.op==='upsert')return {data:{...q.row}};if(q.op==='delete')return {data:[{id:pid}]};if(q.op==='select')return {data:existing};throw new Error('unexpected '+q.op);});
 assert.equal((await handleFuelProfiles(...req('GET'),db as never,me))!.status,200);
 assert.equal((await handleFuelProfiles(...req('PUT',good),db as never,me))!.status,200);
 const up=db.calls.find(c=>c.op==='upsert')!;assert.equal(up.row!.user_id,me);assert.equal(up.row!.weight_kg,36.3);
 assert.equal((await handleFuelProfiles(...req('DELETE',undefined,'?id='+pid),db as never,me))!.status,200);
 for(const c of db.calls.filter(c=>c.op!=='upsert'))assert.ok(c.filters.some(f=>f[1]==='user_id'&&f[2]===me),c.op);
 existing=Array.from({length:12},(_,i)=>({id:`x${i}`}));
 await assert.rejects(handleFuelProfiles(...req('PUT',good),db as never,me),/up to 12/);
 assert.equal(await handleFuelProfiles(new Request('http://x/api/other'),new URL('http://x/api/other'),'/api/other','GET',db as never,me),null);
});

// ------------------------------------------------------------------ the migration
const MIGRATION='supabase/migrations/20261108120000_fuel_profiles.sql';
test('migration: guarded, additive, no DROP, DELETE FROM or TRUNCATE',async()=>{
 const code=(await readFile(MIGRATION,'utf8')).split('\n').filter(l=>!l.trim().startsWith('--')).join('\n');
 assert.doesNotMatch(code,/\bdelete\s+from\b|\bdrop\s+(table|column|policy|index|constraint)\b|\btruncate\b/i);
 assert.match(code,/create table if not exists public\.fuel_profiles/);
 assert.match(code,/enable row level security/);
 assert.match(code,/caffeine or age>=18/);
});

test('migration: own rows only, caffeine adults only, one self profile, re-runnable',async()=>{
 const db=new PGlite();
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth,public to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`);
  const files=(await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort();
  for(const file of files)await db.exec(await readFile('supabase/migrations/'+file,'utf8'));
  await db.exec(await readFile(MIGRATION,'utf8'));
  await db.exec(`insert into auth.users values('${me}'),('${other}');`);
  const as=async(user:string)=>db.exec(`set role authenticated;set request.jwt.claim.sub='${user}';`);
  await as(me);
  await db.exec(`insert into public.fuel_profiles(id,user_id,kind,name,weight_kg,weight_unit,age) values('${pid}','${me}','rider','Addy',36.3,'lb',11)`);
  await db.exec(`insert into public.fuel_profiles(user_id,kind,weight_kg,age,caffeine) values('${me}','self',80,40,true)`);
  await assert.rejects(db.exec(`insert into public.fuel_profiles(user_id,kind,weight_kg,age) values('${me}','self',80,40)`),'one self profile');
  await assert.rejects(db.exec(`update public.fuel_profiles set caffeine=true where id='${pid}'`),'no caffeine under 18');
  await assert.rejects(db.exec(`insert into public.fuel_profiles(user_id,weight_kg,age) values('${me}',500,30)`),'bounded');
  await assert.rejects(db.exec(`insert into public.fuel_profiles(user_id,weight_kg,age) values('${other}',60,30)`),'not as someone else');
  await as(other);
  assert.equal((await db.query('select * from public.fuel_profiles')).rows.length,0,'another account sees nothing');
  assert.equal((await db.query(`update public.fuel_profiles set name='x' returning id`)).rows.length,0);
  assert.equal((await db.query(`delete from public.fuel_profiles returning id`)).rows.length,0);
  await as(me);
  assert.equal((await db.query(`update public.fuel_profiles set sweat_rate_lph=0.8,updated_at=now() where id='${pid}' returning id`)).rows.length,1);
  assert.equal((await db.query(`delete from public.fuel_profiles where id='${pid}' returning id`)).rows.length,1);
  await db.exec('set role anon;');
  await assert.rejects(db.query('select * from public.fuel_profiles'));
 }finally{await db.close();}
});

test('sources file lists every source id with a date',async()=>{
 const md=await readFile('docs/research/fuel-plan/SOURCES.md','utf8');
 for(const id of Object.keys(FUEL_SOURCES))assert.ok(md.includes('`'+id+'`'),id);
 assert.match(md,/Accessed|accessed/);
 for(const f of FOODS)assert.ok(md.includes(f.portion.replace(/ \(.*\)$/,'')),f.portion);
});
