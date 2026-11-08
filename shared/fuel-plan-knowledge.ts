/** BAK-authored rider nutrition and hydration knowledge for race and practice days, for Ask BAK.
 *
 * The same rules shared/fuel-plan.ts builds the rider's plan from: what to eat and drink the day before, race morning,
 * between motos and after; fluids and the sweat test; caffeine for adults; youth rules; a nervous stomach; gate-time
 * changes; heat red flags; when to see a doctor or dietitian first. Numbers come from FUEL_PLAN_FACTS, each with an
 * evidence label and source ids (full citations: docs/research/fuel-plan/SOURCES.md). Source ids never reach the model:
 * fuelPlanKnowledge() sends the short source labels only, never URLs.
 *
 * Only for the rider's body. "Fuel" on its own in BAK MX means the bike's gasoline (shared/fuel-weather.ts), so it never
 * switches this on; jetting, octane, coolant, radiators, an overheating engine and tire heat cycles don't either.
 *
 * Status: AUTHORED 2026-11-08 from the position stands listed in SOURCES.md, pending review by Kyle. General education,
 * not medical advice.
 */
import {FOODS,FUEL_SOURCES,RED_FLAGS,SCREEN_ITEMS,type FuelSourceId} from './fuel-plan.ts';

export const FUEL_PLAN_KNOWLEDGE_VERSION='bak-rider-fuel-1';
/** About 2,300 tokens of JSON at roughly 4 characters a token. */
export const FUEL_PLAN_KNOWLEDGE_MAX_CHARS=9200;

type Fact={t:string;e:'evidence-based'|'expert practice';src:FuelSourceId[]};
type Topic='timing'|'fluids'|'heat'|'cramps'|'caffeine'|'youth'|'nervous'|'foods'|'gate_shift';
const F=(t:string,e:Fact['e'],...src:FuelSourceId[]):Fact=>({t,e,src});

export const FUEL_PLAN_FACTS:Record<Topic,Fact[]>={
 timing:[
  F('A moto is 15–40 min near max heart rate: no carb-loading (10–12 g/kg loading is only for events over 90 min) and no carbohydrate during the moto.','evidence-based','joint2016','burke2011'),
  F('Day before: normal carb-rich meals (about half the plate rice, pasta, potatoes or bread), familiar food, go easy on greasy, spicy, very high-fiber dinner. Describe meals and portions, not gram targets; 7–12 g/kg/day is a reference for hard training days only.','evidence-based','joint2016','burke2011'),
  F('Pre-race meal: 1–2 g carbohydrate per kg (up to 4 g/kg is in range) 3–4 h before the first moto, low fat and fiber, familiar. Closer than 2–3 h: smaller, toward 1 g/kg.','evidence-based','joint2016'),
  F('Snack 30–60 min before a moto: 15–30 g easy carbohydrate, optional.','expert practice','practice'),
  F('Between motos: start refuelling soon after a moto; with the next moto under 8 h away, 1.0–1.2 g/kg/h for the first hours in small frequent feeds; eat the bulk early and stop solid food about 60–90 min before the next gate.','evidence-based','joint2016'),
  F('Protein 20–30 g (about 0.3 g/kg) after motos and within 2 h of finishing, not right before the gate. No greasy or fried food within 2–3 h of riding.','evidence-based','joint2016','nata2017'),
  F('Anchor everything to the time to the next gate drop, not the clock.','expert practice','bak'),
 ],
 fluids:[
  F('Before: 5–7 mL/kg at least 4 h before riding; an extra 3–5 mL/kg about 2 h before only if urine is dark or scant.','evidence-based','acsm2007','nata2017'),
  F('Drink sodium 460–1,150 mg per litre (a 20 oz sports drink has about 270 mg, about 460 mg/L). Aim to lose less than 2% of body mass across the day, and never gain weight across the day.','evidence-based','acsm2007','nata2017'),
  F('Ceiling: never more than measured losses. After riding, replace 1.25–1.5 L per kg lost (about 19–23 oz per lb), spread over hours.','evidence-based','acsm2007','nata2017'),
  F('Sweat test: (pre kg − post kg + fluid drunk L − urine L) ÷ hours = litres per hour, weighed in minimal clothing, dried off, same scale. Sweat rates vary several-fold between riders and no motocross default is published: ask the rider to do the test on a practice day (BAK has a sweat test helper in the Fuel plan) instead of guessing a number.','evidence-based','acsm2007','nata2017','baker2017'),
 ],
 heat:[
  F('Hot or humid: sports drink with sodium or a salty snack, shade and cooling between motos, and the rider’s own sweat rate (it rises in heat).','evidence-based','acsm2007','nata2015'),
 ],
 cramps:[
  F('Cramps: most come from fatigue and hard efforts; heavy sweating with sodium loss is a factor for some. Drink to the sweat-test number with sodium, not extra plain water. Cramps that don’t go away are a reason to stop riding and cool down.','expert practice','nata2017','nata2015'),
 ],
 caffeine:[
  F('Adults only, off by default: 2–3 mg/kg about 60 min before, only for riders who already use caffeine and never for the first time on race day. ISSN: 3–6 mg/kg is effective; BAK uses the low end as a conservative choice. It can upset a nervous stomach.','evidence-based','issn2021'),
  F('Never caffeine, energy drinks or supplements for anyone under 18.','evidence-based','aap2011'),
 ],
 youth:[
  F('Under 18: talk to the parent; portions and cups only (no grams, no calories, no weight shown to the child); core foods only; water as the main drink, sports drink on long hot days; about 120–240 mL (½–1 cup) every 15–20 min in the pits during riding periods.','evidence-based','aapHeat','aap2011'),
 ],
 nervous:[
  F('Nervous stomach: move the meal earlier and make it smaller, smaller snacks, liquids (sports drink, chocolate milk, applesauce pouches) instead of solids, lower fat and fiber. Train the gut by rehearsing race foods and timing on practice days.','evidence-based','jeuk2017','joint2016'),
 ],
 foods:[],
 gate_shift:[
  F('Gate delayed 60 min or more: a small top-up (15–30 g easy carbohydrate) 30–60 min before the new time. Moved earlier and the meal was under 2 h ago: sips of sports drink only. 4 h or more to the next gate: a full meal.','expert practice','practice','joint2016'),
 ],
};

const RULES=[
 'General education, not medical advice. Never set a weight goal, an ideal weight or calorie counts; weight only scales portions and the sweat test.',
 'Talk to a doctor or registered dietitian before following a plan with: '+SCREEN_ITEMS.map(s=>s.label.replace(/ \(.*\)$/,'').toLowerCase()).join('; ')+'. Sick today: don’t race on the plan.',
 'Point the rider to the Fuel plan on the race-day or practice-day screen for their own timed plan.',
];

// ------------------------------------------------------------------ gating
/** The rider's body, food and drink. "fuel" alone is gasoline here and never matches. */
const BODY=/\b(eat(?:ing|s)?|ate|food|meals?|breakfast|lunch|dinner|snacks?|hungry|protein|bagel|banana|pasta|rice\b|pretzels?|oatmeal|nutrition|diet|calories?|drink(?:ing|s)?|hydrat\w*|dehydrat\w*|water bottle|electrolytes?|sodium|salt tabs?|sports drink|gatorade|pedialyte|chocolate milk|caffeine|coffee|energy drinks?|pre-?workout|sweat(?:ing|s)?|sweat rate|sweat test|urine|pee(?![- ]?wees?)|peeing|cramp(?:s|ing)?|stomach|nause\w*|throw(?:ing)? up|puk\w*|vomit\w*|heat (?:stroke|exhaustion|illness)|overheat(?:ed|ing)? (?:rider|myself|kid|son|daughter)|too hot to ride|(?:i'?m|i was|i get|getting|feel|felt|feeling) (?:over)?heat\w*|(?:feel|felt|feeling) (?:hot|faint|sick|dizzy|weak)|dizz\w*|light-?headed|bonk\w*|refuel(?:ling)? (?:my ?self|between motos))\b/i;
/** Bike words that use the same vocabulary. */
const BIKE=/\b(bikes?|gas|fuel|overheat\w*|jet(?:s|ting)?|needle|octane|premix|race gas|gasoline|ethanol|coolant|radiators?|water pump|head gasket|boil(?:ing|ed)? over|engine|cylinder|piston|clutch|fork|shock|tires?|tyres?|heat cycles?|fuel pump|fuel map|map switch|carb(?:uretor|uretted)?\b(?!s)|airbox|air filter)\b/i;
/** "Carb" alone is ambiguous: carburetor in bike talk, carbohydrate in food talk. */
/** Weather words count only when the message isn't about the bike ("jet for hot humid weather" is jetting). */
const WEATHER=/\b(hot day|hot out|heat index|humid(?:ity)?|in the heat|heat wave)\b/i;
const CARB_FOOD=/\bcarbs\b|\bcarbohydrates?\b|\bcarb[- ]?load(?:ing)?\b/i;
const HUMAN=/\b(i|me|my ?self|rider|kid|son|daughter|child|stomach|body|feel|felt|sick)\b/i;

function topicsOf(text:string):Set<Topic>{
 const t=new Set<Topic>();
 if(!text.trim())return t;
 const bike=BIKE.test(text),strong=BODY.test(text)||CARB_FOOD.test(text);
 if(!strong&&!(WEATHER.test(text)&&!bike))return t;
 // Bike words with food words: only when it is about the rider, not "what should I feed the engine".
 if(bike&&!CARB_FOOD.test(text)&&!HUMAN.test(text))return t;
 if(/\b(eat|ate|food|meals?|breakfast|lunch|dinner|snacks?|carbs?|carbohydrates?|protein|hungry|nutrition|diet|calories?|bagel|banana|pasta|rice|pretzels?|oatmeal|refuel|bonk\w*|carb[- ]?load\w*)\b/i.test(text))t.add('timing');
 if(/\b(drink|hydrat|dehydrat|water|electrolyte|sodium|salt|sports drink|gatorade|pedialyte|sweat|urine|pee(?![- ]?wee)|chocolate milk)\w*/i.test(text))t.add('fluids');
 if(/\b(heat|hot|humid|overheat|dizz|light-?headed)\w*/i.test(text))t.add('heat');
 if(/\bcramp\w*/i.test(text)){t.add('cramps');t.add('fluids');}
 if(/\b(caffeine|coffee|energy drinks?|pre-?workout|monster|red bull)\b/i.test(text))t.add('caffeine');
 if(/\b(kids?|son|daughter|child(?:ren)?|youth|junior|minis?|50cc|65cc?|85cc?|supermini|\d{1,2}[- ]?(?:yo|year[- ]old)|teen\w*)\b/i.test(text))t.add('youth');
 if(/\b(nerv\w*|anxious|butterflies|stomach|nause\w*|throw(?:ing)? up|puk\w*|vomit\w*|feel(?:s)? (?:sick|bad|heavy)|sick on the bike)\b/i.test(text))t.add('nervous');
 if(/\b(what (?:should|can|do) (?:i|he|she|we|they) eat|foods?|snacks?|bagel|banana|pretzels?|oatmeal|rice|applesauce|fig bars?|pb ?& ?j|chocolate milk)\b/i.test(text))t.add('foods');
 if(/\b(delay\w*|pushed back|moved up|running (?:late|behind|early)|schedule changed?|gate (?:time|drop))\b/i.test(text))t.add('gate_shift');
 if(!t.size)t.add('timing');
 return t;
}
const OTHER_DOMAIN=/\b(fork|shock|sag|clicker|jet|needle|tire|tyre|psi|chain|sprocket|torque|bolt|oil change|valve|piston|map)\b/i;

export type FuelPlanSection={version:string;boundary:string;topics:Topic[];from_history?:boolean;rules:string[];
 facts:Partial<Record<Topic,{t:string;e:string;src:string[]}[]>>;foods_approx?:{food:string;carb_g:number;note?:string}[];
 red_flags:{stop_and_cool:string[];call_911:string[];low_sodium:string};sources:Record<string,string>};

/** A compact rider-nutrition section for Ask BAK, or null when the conversation isn't about eating, drinking, hydration,
 *  cramps, heat or race-day food. history: earlier rider messages, oldest first; a short follow-up inherits their topic. */
export function fuelPlanKnowledge(message:string,history?:string[]):FuelPlanSection|null{
 const msg=message??'';
 let topics=topicsOf(msg),fromHistory=false;
 if(!topics.size&&history?.length&&msg.trim().length<=160&&!OTHER_DOMAIN.test(msg)&&msg.trim()){
  const h=topicsOf(history.slice(-3).join('\n'));
  if(h.size){topics=h;fromHistory=true;}
 }
 if(!topics.size)return null;
 // Red flags go with every answer; youth and screening rules too, because they change what can be said.
 if(topics.has('heat')||topics.has('cramps'))topics.add('fluids');
 const order:Topic[]=['youth','timing','nervous','fluids','heat','cramps','caffeine','gate_shift','foods'];
 const want=order.filter(t=>topics.has(t));
 const youth=topics.has('youth');
 const used=new Set<FuelSourceId>(['nata2015','nata2017']);
 const facts:FuelPlanSection['facts']={};
 const out:FuelPlanSection={version:FUEL_PLAN_KNOWLEDGE_VERSION,
  boundary:'BAK-authored rider nutrition and hydration for motocross race and practice days, from sports-nutrition position stands. Use these numbers and labels; say which are evidence-based and which are expert practice. Youth: speak to the parent in portions and cups only.',
  topics:want,...(fromHistory?{from_history:true}:{}),rules:RULES,facts,
  red_flags:{stop_and_cool:RED_FLAGS.stop,call_911:[...RED_FLAGS.call911,'cool first (cold water or ice), transport second'],low_sodium:RED_FLAGS.lowSodium},sources:{}};
 const add=(t:Topic)=>{let list=FUEL_PLAN_FACTS[t];
  // A youth question never gets the adult caffeine dose, only the under-18 rule.
  if(youth&&t==='caffeine')list=list.filter(f=>f.src.includes('aap2011'));
  if(!list.length)return;
  facts[t]=list.map(f=>{f.src.forEach(s=>used.add(s));return {t:f.t,e:f.e,src:f.src.map(s=>FUEL_SOURCES[s])};});};
 for(const t of want){
  if(t==='foods'){out.foods_approx=FOODS.filter(f=>f.id!=='sportshalf').map(f=>({food:f.portion,carb_g:f.carb,...(f.protein&&f.id==='chocmilk'?{note:`+${f.protein} g protein`}:f.sodium&&f.id==='sportsdrink'?{note:`~${f.sodium} mg sodium`}:f.minH>=2?{note:`${f.minH}+ h before a gate`}:{})}));used.add('usda');continue;}
  add(t);
  if(JSON.stringify(out).length>FUEL_PLAN_KNOWLEDGE_MAX_CHARS){delete facts[t];break;}
 }
 // Caffeine is always answered for youth, even when not asked: the safe rule is short.
 if(youth&&!facts.caffeine)add('caffeine');
 out.sources=Object.fromEntries([...used].map(s=>[s,FUEL_SOURCES[s]]));
 // Keep inside the budget: drop the least important parts first.
 for(const k of ['foods','gate_shift','caffeine','cramps','heat'] as const){
  if(JSON.stringify(out).length<=FUEL_PLAN_KNOWLEDGE_MAX_CHARS)break;
  if(k==='foods')delete out.foods_approx;else if(!(youth&&k==='caffeine'))delete facts[k];
 }
 return out;
}
