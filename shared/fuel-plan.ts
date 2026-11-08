/** Race-day fuel plan: what to eat and drink, and when, from the night before to after the last moto. Pure, so the phone,
 *  the website and the Node tests build exactly the same plan.
 *
 *  General education, not medical advice. Every item carries an evidence label ("evidence-based" when a position stand or
 *  review gives the number, "expert practice" when it is a practitioner convention) and source ids from FUEL_SOURCES
 *  (full citations and dates in docs/research/fuel-plan/SOURCES.md).
 *
 *  Rules this file keeps (see the tests in tests/fuel-plan.test.ts):
 *  - A moto is 15–40 min near max heart rate: no carb-loading and no carbs during the moto.
 *  - Weight is used only to scale portions and for the sweat test. The plan never shows the rider's weight, never counts
 *    calories, never sets a weight goal. Height is stored with the profile and never used to judge anything.
 *  - Under 18 is youth mode, always: a parent-facing view in portions and cups, no grams, no calories, no caffeine, no
 *    energy drinks or supplements, water as the main drink.
 *  - Every drink figure has a ceiling: no more than the rider sweats out, never gaining weight across the day.
 *  - There is no motocross sweat-rate default (none is published): the plan asks for a personal sweat test and uses it once
 *    it is logged.
 *  - Heat red flags are part of every plan, including a blocked one.
 *  - Certain conditions (diabetes, kidney/heart/blood-pressure conditions, sickle cell trait, previous heat illness,
 *    current illness, medications that affect heat or fluids, pregnancy, a history of disordered eating) block the plan
 *    until the rider says a doctor or dietitian has cleared them. Being ill today blocks it outright.
 */

export const FUEL_PLAN_VERSION='bak-fuel-plan-1';
export type Evidence='evidence-based'|'expert practice';

/** Short labels shown on each item. Full citations: docs/research/fuel-plan/SOURCES.md. */
export const FUEL_SOURCES={
 joint2016:'Thomas, Erdman & Burke 2016 · Academy of Nutrition and Dietetics / Dietitians of Canada / ACSM joint position',
 burke2011:'Burke et al. 2011 · J Sports Sci',
 acsm2007:'ACSM fluid replacement position stand 2007',
 nata2017:'NATA fluid replacement position statement 2017',
 nata2015:'NATA exertional heat illnesses position statement 2015',
 baker2017:'Baker 2017 · GSSI, Sports Med (sweat testing)',
 issn2021:'ISSN caffeine position stand 2021',
 aap2011:'AAP 2011 clinical report · sports and energy drinks for children and adolescents',
 aapHeat:'AAP 2011 policy · climatic heat stress and exercising children',
 jeuk2017:'Jeukendrup 2017 · Sports Med (training the gut)',
 usda:'USDA FoodData Central (approximate values)',
 practice:'Practitioner convention',
 bak:'BAK convention',
} as const;
export type FuelSourceId=keyof typeof FUEL_SOURCES;

// ------------------------------------------------------------------ the rider
/** Reasons to talk to a doctor or dietitian before using the plan. `ill_now` can't be cleared: don't use it today. */
export const SCREEN_ITEMS=[
 {id:'diabetes',label:'Diabetes (especially if you use insulin)'},
 {id:'kidney',label:'A kidney condition'},
 {id:'heart',label:'A heart condition'},
 {id:'blood_pressure',label:'High or low blood pressure being treated'},
 {id:'sickle_cell',label:'Sickle cell trait'},
 {id:'heat_illness',label:'Heat exhaustion or heat stroke before'},
 {id:'ill_now',label:'Sick right now: fever, vomiting or diarrhea'},
 {id:'medications',label:'Medicines that affect heat, sweating or fluids (for example diuretics, some ADHD or allergy medicines)'},
 {id:'pregnancy',label:'Pregnant'},
 {id:'disordered_eating',label:'A history of an eating disorder or disordered eating'},
] as const;
export type ScreenId=typeof SCREEN_ITEMS[number]['id'];
export const SCREEN_IDS=SCREEN_ITEMS.map(s=>s.id) as ScreenId[];

/** What the planner needs about a rider. Saved to the account as a fuel profile (table fuel_profiles). */
export type FuelRider={
 weight:number;weight_unit:'kg'|'lb';age:number;
 /** Stored only, never used to judge. */
 height_cm?:number|null;
 /** Optional and not used by any formula here. */
 sex?:'female'|'male'|null;
 nervous_stomach?:boolean;
 /** Adults only; ignored under 18. */
 caffeine?:boolean;
 /** From the sweat test, litres per hour. Null until one is logged. */
 sweat_rate_lph?:number|null;
 /** Whether that test was on a hot or humid day. */
 sweat_test_hot?:boolean|null;
 screen?:ScreenId[];
 /** The rider says a doctor or dietitian has cleared them to use this plan. */
 cleared?:boolean;
};
/** A saved profile: the rider ("self") or a rider on this account without one of their own (a parent's child). */
export type FuelProfile=FuelRider&{id:string;kind:'self'|'rider';name:string;moto_minutes?:number|null;sweat_test_at?:string|null;updated_at?:string};

export const LB=0.45359237;
export const toKg=(weight:number,unit:'kg'|'lb')=>unit==='lb'?weight*LB:weight;
export const isYouth=(age:number)=>!(Number.isFinite(age)&&age>=18);
/** The bounds the profile form and the server both use. */
export const PROFILE_LIMITS={minKg:15,maxKg:200,minAge:5,maxAge:99,minCm:90,maxCm:230,minMoto:5,maxMoto:60,name:40,maxRiders:12} as const;

/** What's wrong with a profile before it can make a plan, or null. */
export function profileProblem(p:Partial<FuelRider>):string|null{
 const kg=toKg(Number(p.weight),p.weight_unit==='lb'?'lb':'kg');
 if(!Number.isFinite(kg)||kg<PROFILE_LIMITS.minKg||kg>PROFILE_LIMITS.maxKg)return p.weight_unit==='lb'?'Enter a weight between 35 and 440 lb.':'Enter a weight between 15 and 200 kg.';
 const age=Number(p.age);
 if(!Number.isInteger(age)||age<PROFILE_LIMITS.minAge||age>PROFILE_LIMITS.maxAge)return 'Enter an age between 5 and 99.';
 if(p.height_cm!=null&&(!Number.isFinite(p.height_cm)||p.height_cm<PROFILE_LIMITS.minCm||p.height_cm>PROFILE_LIMITS.maxCm))return 'Enter a height between 3 ft and 7 ft 6 in (90 to 230 cm), or leave it empty.';
 return null;
}

// ------------------------------------------------------------------ amounts
export const ML_PER_OZ=29.5735;
export const ML_PER_CUP=240;
const r5=(n:number)=>Math.round(n/5)*5,r10=(n:number)=>Math.round(n/10)*10;
const oz=(ml:number)=>Math.max(1,Math.round(ml/ML_PER_OZ));
/** "½ cup", "1 cup", "1½ cups", rounded to the nearest half cup (never less than a few sips). */
export function cupsText(ml:number):string{
 const halves=Math.round(ml/(ML_PER_CUP/2));
 if(halves<=0)return 'a few sips';
 const whole=Math.floor(halves/2),half=halves%2?'½':'';
 const n=whole?`${whole}${half}`:half;
 return `${n} cup${halves>2?'s':''}`;
}
/** "350–490 mL (12–17 oz)" for adults, "1½–2 cups" in youth mode. */
export function drinkText(low:number,high:number,youth:boolean):string{
 if(youth){const a=cupsText(low),b=cupsText(high);return a===b?a:`${a.replace(/ cups?$/,'')}–${b}`;}
 const lo=r10(low),hi=r10(high);
 return lo===hi?`${lo} mL (${oz(lo)} oz)`:`${lo}–${hi} mL (${oz(lo)}–${oz(hi)} oz)`;
}

// ------------------------------------------------------------------ foods (approximate carbohydrate)
/** Approximate carbohydrate per portion, checked against USDA FoodData Central where possible (values used and their FDC
 *  entries are in docs/research/fuel-plan/SOURCES.md). `minH`: the earliest it fits before a gate, in hours (fat, fiber,
 *  dairy and bulk need longer). `easy`: low fat and fiber, fine for a nervous stomach. */
export type Food={id:string;portion:string;carb:number;protein?:number;sodium?:number;minH:number;easy:boolean;liquid?:boolean};
export const FOODS:Food[]=[
 {id:'bagel',portion:'1 plain bagel',carb:50,protein:10,minH:2,easy:true},
 {id:'jam',portion:'1 tbsp jam',carb:13,minH:0.5,easy:true},
 {id:'honey',portion:'1 tbsp honey',carb:17,minH:0.5,easy:true},
 {id:'banana',portion:'1 banana',carb:27,minH:1,easy:true},
 {id:'rice',portion:'1 cup cooked white rice',carb:45,protein:4,minH:2,easy:true},
 {id:'oatmeal',portion:'1 packet instant oatmeal',carb:28,protein:4,minH:3,easy:false},
 {id:'pbj',portion:'1 PB&J sandwich',carb:42,protein:12,minH:2,easy:false},
 {id:'pretzels',portion:'1 oz pretzels (a small handful)',carb:23,sodium:350,minH:0.75,easy:true},
 {id:'figbars',portion:'2 fig bars',carb:21,minH:1,easy:true},
 {id:'applesauce',portion:'1 applesauce pouch',carb:13,minH:0.5,easy:true},
 {id:'ricecake',portion:'1 rice cake',carb:7,minH:0.5,easy:true},
 {id:'sportsdrink',portion:'20 oz sports drink',carb:36,sodium:270,minH:0,easy:true,liquid:true},
 {id:'sportshalf',portion:'10 oz sports drink (half a bottle)',carb:18,sodium:135,minH:0,easy:true,liquid:true},
 {id:'chocmilk',portion:'8 oz chocolate milk',carb:25,protein:8,minH:2,easy:false,liquid:true},
];
const food=(id:string)=>FOODS.find(f=>f.id===id)!;
type Slot='meal'|'snack'|'recovery'|'liquid';
const ORDER:Record<Slot,{calm:string[];nervous:string[]}>={
 meal:{calm:['bagel','jam','banana','oatmeal','rice','honey','pbj','pretzels'],nervous:['bagel','honey','banana','applesauce','sportshalf','ricecake']},
 snack:{calm:['banana','pretzels','applesauce','figbars','ricecake'],nervous:['applesauce','sportshalf','ricecake']},
 recovery:{calm:['bagel','jam','banana','rice','pretzels','figbars','applesauce','sportshalf'],nervous:['banana','applesauce','sportshalf','ricecake','honey','bagel']},
 liquid:{calm:['sportshalf','sportsdrink'],nervous:['sportshalf','sportsdrink']},
};
const MAX_EACH:Record<string,number>={bagel:2,jam:2,honey:2,banana:2,rice:2,oatmeal:1,pbj:1,pretzels:2,figbars:2,applesauce:2,ricecake:3,sportsdrink:1,sportshalf:1,chocmilk:1};
/** Picks familiar foods that add up to the carbohydrate range, never past it by much. `hours` is the time left before the
 *  next gate, so foods that need longer drop out. Nervous stomach: easy foods, smaller, toward the low end. */
export function composeFoods(low:number,high:number,o:{hours:number;slot:Slot;nervous?:boolean}):{foods:{food:Food;n:number}[];carb:number}{
 const order=(o.nervous?ORDER[o.slot].nervous:ORDER[o.slot].calm).map(food).filter(f=>f.minH<=o.hours&&(!o.nervous||f.easy));
 const target=o.nervous?low:(low+high)/2,cap=Math.max(high*1.1,low+8);
 const got=new Map<string,number>();let carb=0;
 for(let pass=0;pass<4&&carb<target;pass++)for(const f of order){
  if(carb>=target)break;
  const n=got.get(f.id)??0;if(n>=(MAX_EACH[f.id]??1))continue;
  // A spread goes on bread: jam or honey only with a bagel already picked.
  if((f.id==='jam'||f.id==='honey')&&!got.get('bagel'))continue;
  if(carb+f.carb>cap)continue;
  got.set(f.id,n+1);carb+=f.carb;
 }
 // Still short (big portions, small range): the one food that lands closest to the target, even a little over.
 if(carb<low*0.85){
  const best=order.filter(f=>(got.get(f.id)??0)<(MAX_EACH[f.id]??1)&&!((f.id==='jam'||f.id==='honey')&&!got.get('bagel'))).sort((a,b)=>Math.abs(carb+a.carb-target)-Math.abs(carb+b.carb-target))[0];
  if(best){got.set(best.id,(got.get(best.id)??0)+1);carb+=best.carb;}
 }
 return {foods:[...got].map(([id,n])=>({food:food(id),n})),carb};
}
const portionText=(f:Food,n:number)=>n===1?f.portion:f.portion.replace(/^1 /,`${n} `).replace(/^2 fig bars/,`${2*n} fig bars`).replace(/pouch$/,'pouches').replace(/bagel$/,'bagels').replace(/banana$/,'bananas').replace(/rice cake$/,'rice cakes').replace(/sandwich$/,'sandwiches').replace(/packet /,'packets ');

// ------------------------------------------------------------------ the plan
export type Phase='day-before'|'morning'|'gate'|'between'|'after';
export type Eat={foods:string[];
 /** Adults only (never in youth or portions-only mode): the grams behind the portions. */
 detail?:{carb_g:[number,number];foods_carb_g:number;protein_g?:[number,number];per_food:{food:string;carb_g:number}[];basis:string}};
export type Drink={what:string;text:string;ml?:[number,number];ceiling?:string;only_if?:string};
export type PlanItem={id:string;phase:Phase;at:string|null;
 /** The gate this item is timed from, and minutes from it (negative before the gate drops, positive after). */
 gate:number|null;offset:number|null;
 title:string;eat?:Eat;drink?:Drink;why:string;evidence:Evidence;sources:FuelSourceId[];optional?:boolean};
export type Gate={label:string;at:string};
export type DayInput={kind:'race'|'practice';gates:Gate[];
 /** How long each moto or session lasts, minutes (default 20). */
 motoMinutes?:number;
 hot?:boolean;forecast?:{tempF?:number|null;humidity?:number|null}|null;
 /** Overrides the profile's setting for today. */
 nervous?:boolean;caffeine?:boolean;
 /** The earliest a rider will realistically eat on race morning (default 05:30). */
 earliest?:string;
 /** When the pre-race meal is (or was) eaten, if not the planned time. */
 mealAt?:string|null;
 /** Items added by a gate-time change (shiftGate), kept with the day. */
 extra?:PlanItem[];
};
export type Safety={stop:string[];call911:string[];lowSodium:string;note:string;sources:FuelSourceId[]};
export type FuelPlan={version:string;youth:boolean;portionsOnly:boolean;kind:'race'|'practice';hot:boolean;nervous:boolean;
 blocked:null|{reason:string;canClear:boolean};
 dayBefore:PlanItem[];items:PlanItem[];
 /** The most to drink: always shown. ml is per moto when a sweat rate is logged. */
 ceiling:{text:string;ml:number|null};
 sweat:{rate_lph:number|null;loss_per_moto_ml:number|null;prompt:string|null};
 safety:Safety;notes:string[];problems:string[];disclaimer:string};

export const DISCLAIMER='General sports-nutrition education, not medical advice. Check with a doctor or registered dietitian for your own needs.';

/** Always on the race-day and practice-day plan. NATA 2015 and 2017. */
export const RED_FLAGS:Safety={
 stop:['Dizziness or light-headedness','Headache','Nausea or vomiting','Unusual tiredness or weakness','Chills or goosebumps in the heat','Cramps that don’t go away','Clumsiness or loss of coordination'],
 call911:['Confusion, odd behaviour or slurred speech','Collapse or passing out','A seizure'],
 lowSodium:'Swelling in the hands or feet, a headache that keeps getting worse, confusion, or gaining weight after drinking a lot can mean low blood sodium: stop drinking fluids and call 911.',
 note:'Any of the first list: stop riding, get into shade, loosen gear, cool down with cold water or ice towels and sip a sports drink. Confusion, collapse or a seizure in the heat: call 911 and cool them first (cold water or ice on the whole body), transport second.',
 sources:['nata2015','nata2017'],
};
export const SAFETY_TITLE='Stop riding and cool down if you notice';

const toMin=(at:string):number|null=>{const m=/^(\d{1,2}):(\d{2})$/.exec(at?.trim?.()??'');if(!m)return null;const h=Number(m[1]),mi=Number(m[2]);return h<24&&mi<60?h*60+mi:null;};
const fromMin=(m:number)=>{const x=((Math.round(m)%1440)+1440)%1440;return `${String(Math.floor(x/60)).padStart(2,'0')}:${String(x%60).padStart(2,'0')}`;};
export const clockMinutes=toMin;
export const clockFromMinutes=fromMin;

/** BAK reads 80 °F (27 °C) and up, or 75 °F and up with humidity of 60% or more, as a hot or humid day. */
export function forecastHot(f:DayInput['forecast']):boolean{
 const t=f?.tempF,h=f?.humidity;
 return typeof t==='number'&&(t>=80||(t>=75&&typeof h==='number'&&h>=60));
}
/** The gates with a valid time, in order. */
export function gatesOf(day:Pick<DayInput,'gates'|'kind'>):Gate[]{
 const word=day.kind==='practice'?'Session':'Moto';
 return (day.gates??[]).map((g,i)=>({label:(g.label||'').trim().slice(0,30)||`${word} ${i+1}`,at:g.at,m:toMin(g.at)})).filter(g=>g.m!=null).sort((a,b)=>a.m!-b.m!).map(({label,m})=>({label,at:fromMin(m!)}));
}
export const motoMinutesOf=(day:Pick<DayInput,'motoMinutes'>)=>Math.min(PROFILE_LIMITS.maxMoto,Math.max(PROFILE_LIMITS.minMoto,Math.round(Number(day.motoMinutes)||20)));

/** Why the plan can't be used yet, or null. */
export function screenBlock(r:Pick<FuelRider,'screen'|'cleared'>):FuelPlan['blocked']{
 const s=new Set(r.screen??[]);
 if(s.has('ill_now'))return {reason:'Being sick with a fever, vomiting or diarrhea changes how much fluid and salt your body needs and raises the risk of heat illness. Don’t use this plan today: see a doctor before riding.',canClear:false};
 if(s.size&&!r.cleared)return {reason:'Something you told us means your fluid, salt or food needs can differ from this general plan. Talk to your doctor or a registered dietitian before using it. Once they’ve cleared you, turn on “My doctor or dietitian cleared me”.',canClear:true};
 return null;
}

/** The whole plan for one rider and one day. */
export function buildFuelPlan(rider:FuelRider,day:DayInput):FuelPlan{
 const kg=toKg(rider.weight,rider.weight_unit);
 const youth=isYouth(rider.age);
 const portionsOnly=youth||(rider.screen??[]).includes('disordered_eating');
 const nervous=day.nervous??!!rider.nervous_stomach;
 const hot=!!day.hot||forecastHot(day.forecast);
 const caffeine=!youth&&(day.caffeine??!!rider.caffeine);
 const practice=day.kind==='practice';
 const gates=gatesOf(day),mins=motoMinutesOf(day);
 const rate=rider.sweat_rate_lph&&rider.sweat_rate_lph>0?rider.sweat_rate_lph:null;
 const lossMl=rate?r10(rate*1000*mins/60):null;
 const problems:string[]=[],notes:string[]=[];
 const safety=RED_FLAGS;
 const sweat={rate_lph:rate,loss_per_moto_ml:lossMl,prompt:rate?null:youth
  ?'Do the sweat test on a practice day: weigh before and after riding and the app works out how much to drink. Until then, follow the cups below and stop at thirst.'
  :'Do the sweat test once on a practice day (weigh before and after riding). Sweat rates vary several-fold between riders, so BAK uses your own number instead of a guess.'};
 const ceiling=rate
  ?{ml:lossMl,text:youth?`Between motos: no more than about ${cupsText(lossMl!)} per moto, about what is sweated out. If the scale goes up across the day, it’s too much.`:`Between motos: no more than about ${drinkText(lossMl!,lossMl!,false)} per ${mins}-minute moto, which is what you sweat out. Never gain weight across the day.`}
  :{ml:null,text:youth?'No more than is sweated out: drink to thirst in small amounts. If the scale goes up across the day, it’s too much.':'No more than you sweat out: drink to thirst in small amounts and never gain weight across the day. The sweat test gives you a number.'};
 const base={version:FUEL_PLAN_VERSION,youth,portionsOnly,kind:day.kind,hot,nervous,ceiling,sweat,safety,notes,problems,disclaimer:DISCLAIMER};
 const blocked=screenBlock(rider);
 if(blocked)return {...base,blocked,dayBefore:[],items:[]};
 const bad=profileProblem(rider);
 if(bad){problems.push(bad);return {...base,blocked:null,dayBefore:[],items:[]};}

 const W=kg;
 const g=(n:number)=>Math.round(n);
 const eat=(low:number,high:number,o:{hours:number;slot:Slot;protein?:[number,number];basis:string;add?:string[]}):Eat=>{
  const c=composeFoods(low,high,{hours:o.hours,slot:o.slot,nervous});
  const foods=[...c.foods.map(x=>portionText(x.food,x.n)),...(o.add??[])];
  if(portionsOnly)return {foods};
  return {foods,detail:{carb_g:[g(low),g(high)],foods_carb_g:g(c.carb),...(o.protein?{protein_g:o.protein}:{}),per_food:c.foods.map(x=>({food:portionText(x.food,x.n),carb_g:x.food.carb*x.n})),basis:o.basis}};
 };
 const drink=(what:string,low:number,high:number,extra:Partial<Drink>={}):Drink=>({what,text:drinkText(low,high,youth),...(portionsOnly&&youth?{}:{ml:[r10(low),r10(high)] as [number,number]}),...extra});
 const sodiumWhat=youth?(hot?'Water, or a sports drink on a long hot day':'Water'):hot?'Sports drink with sodium (460–1,150 mg per litre), or water plus a salty snack':'Water or a sports drink';

 // ---------------- the day before (race days only)
 const dayBefore:PlanItem[]=practice?[]:[
  {id:'db-no-load',phase:'day-before',at:null,gate:null,offset:null,title:'No carb-loading needed',why:'A moto is 15–40 minutes. Carb-loading is for events longer than 90 minutes; for motocross it just leaves you feeling heavy. Eat your normal, carb-rich meals.',evidence:'evidence-based',sources:['joint2016','burke2011']},
  {id:'db-meals',phase:'day-before',at:null,gate:null,offset:null,title:'Normal meals, carbs as the biggest part of the plate',
   eat:{foods:youth?['Breakfast: cereal or toast with fruit','Lunch: a sandwich, fruit and pretzels','Dinner: a plate that’s about half rice, pasta or potatoes, with some chicken or fish and a vegetable','A snack between meals, like a banana or fig bars']
    :['Breakfast: a bagel or oatmeal with fruit','Lunch: a sandwich or rice bowl with fruit','Dinner: about half the plate rice, pasta or potatoes, plus lean protein and a vegetable','One or two snacks: banana, pretzels, fig bars'],
    ...(portionsOnly?{}:{detail:{carb_g:[g(7*W),g(12*W)],foods_carb_g:0,per_food:[],basis:'Reference only, not a target: 7–12 g per kg per day is the range for fuelling hard training days. Normal carb-rich meals cover a race weekend.'}})},
   why:'Topping up the muscles’ fuel the day before comes from ordinary meals, not extra food.',evidence:'evidence-based',sources:['joint2016','burke2011']},
  {id:'db-familiar',phase:'day-before',at:null,gate:null,offset:null,title:'Familiar food only',why:`Nothing new the day before or on race day. Go easy on greasy, spicy and very high-fiber food at dinner${nervous?', and keep dinner a little earlier and lighter than usual':''}.`,evidence:'expert practice',sources:['joint2016','practice']},
  {id:'db-fluids',phase:'day-before',at:null,gate:null,offset:null,title:'Drink with every meal',drink:{what:youth?'Water':'Water',text:youth?'A cup or two with each meal and snack':'With each meal and snack'},why:'Start race morning already hydrated: pale-yellow urine by the evening is the sign.',evidence:'expert practice',sources:['acsm2007','practice']},
 ];

 if(!gates.length){problems.push(practice?'Add the time of your first session to build the plan.':'Add the time of your first moto to build the plan.');return {...base,blocked:null,dayBefore,items:[]};}

 const items:PlanItem[]=[];
 const G=gates.map(x=>toMin(x.at)!),first=G[0];
 const earliest=toMin(day.earliest??'')??330;
 // ---------------- race morning
 const lead=nervous?240:210;
 const mealAtSet=day.mealAt?toMin(day.mealAt):null;
 const mealAt=mealAtSet??Math.max(first-lead,earliest);
 const mealH=(first-mealAt)/60;
 const perKg:[number,number]=mealH>=3?(nervous?[1,1.5]:[1,2]):mealH>=2?[1,1.5]:[0.5,1];
 if(mealH>=1){
  items.push({id:'meal',phase:'morning',at:fromMin(mealAt),gate:0,offset:mealAt-first,
   title:mealH>=3?'Pre-race meal':'Pre-race meal (smaller: closer to the gate)',
   eat:eat(perKg[0]*W,perKg[1]*W,{hours:mealH,slot:mealH>=2?'meal':'snack',basis:`${perKg[0]}–${perKg[1]} g carbohydrate per kg, ${mealH>=3?'3–4 hours':'less than 3 hours'} before the first gate`}),
   why:`${mealH>=3?'Three to four hours gives the meal time to settle.':'With less than 3 hours to go the meal is smaller and easier.'} Low fat, low fiber and food you already know${nervous?'; with a nervous stomach eat a little earlier, a little less, and drink part of it':''}.`,
   evidence:'evidence-based',sources:['joint2016']});
 }else notes.push('The first gate is too soon for a meal: have the small snack and sips of sports drink instead.');
 const preAt=Math.max(Math.min(mealAt,first-240),earliest);
 items.push({id:'pre-fluid',phase:'morning',at:fromMin(preAt),gate:0,offset:preAt-first,title:'Drink to start hydrated',
  drink:drink(youth?'Water':'Water or a sports drink',5*W,7*W,{ceiling:'That’s the whole amount for now, sipped over the next half hour or so.'}),
  why:first-preAt>=240?'Drinking at least 4 hours before leaves time to pass what you don’t need before the gate.':'Drink this as early as you can; it needs time to settle before the gate.',
  evidence:'evidence-based',sources:['acsm2007','nata2017']});
 items.push({id:'pre-fluid-check',phase:'morning',at:fromMin(first-120),gate:0,offset:-120,title:'Check your urine',optional:true,
  drink:drink(youth?'Water':'Water or a sports drink',3*W,5*W,{only_if:'Only if your urine is dark or there’s very little of it.'}),
  why:'Pale yellow means you’re ready; more on top of that just sends you to the porta-john before the gate.',evidence:'evidence-based',sources:['acsm2007']});
 if(caffeine)items.push({id:'caffeine',phase:'morning',at:fromMin(first-60),gate:0,offset:-60,title:'Caffeine (only if you already use it)',optional:true,
  drink:{what:'Your usual coffee or caffeine',text:`${g(2*W)}–${g(3*W)} mg, about an hour before`},
  why:`Only if you already have caffeine and know how it sits with you. Never try it for the first time on race day.${nervous?' It can upset a nervous stomach; skip it if it does.':''} 3–6 mg per kg is the effective range; BAK uses the low end, 2–3 mg per kg.`,
  evidence:'evidence-based',sources:['issn2021']});

 // ---------------- each gate
 G.forEach((at,i)=>{
  const label=gates[i].label;
  const prevEnd=i?G[i-1]+mins:null;
  const gap=prevEnd==null?null:at-prevEnd;
  // Snack 30–60 minutes before: optional, and only when there's room for it.
  const roomForSnack=i===0?mealH>=1.5||mealH<1:(gap??0)>=90;
  if(roomForSnack)items.push({id:`snack-${i}`,phase:'gate',at:fromMin(at-45),gate:i,offset:-45,title:`Small snack before ${label}`,optional:true,
   eat:eat(15,30,{hours:0.75,slot:i===0&&!nervous?'snack':'liquid',basis:'15–30 g of easy carbohydrate, 30–60 minutes before'}),
   why:'Optional. Something small and easy if you’re hungry; skip it if your stomach says no.',evidence:'expert practice',sources:['practice']});
  items.push({id:`gate-${i}`,phase:'gate',at:fromMin(at-15),gate:i,offset:-15,title:`Before ${label}: sips only`,
   drink:{what:sodiumWhat,text:youth?'A few sips':'A few sips',ceiling:'Not a big drink right before the gate.'},
   why:'No food from here, and nothing during the moto: it’s too short to need it.',evidence:'evidence-based',sources:['joint2016','burke2011']});
  if(youth)items.push({id:`pits-${i}`,phase:'gate',at:fromMin(at-30),gate:i,offset:-30,title:`In gear and in the pits around ${label}`,
   drink:{what:hot?'Water, or a sports drink on a long hot day':'Water',text:'½–1 cup every 15–20 minutes while waiting in gear',ceiling:ceiling.text},
   why:'Kids heat up faster and don’t always feel thirsty in time, so a parent hands them a drink on a schedule.',evidence:'evidence-based',sources:['aapHeat']});

  // Between this gate and the next.
  if(i<G.length-1){
   const end=at+mins,next=G[i+1],left=next-end;
   const stop=next-(nervous?90:75);
   const nextLabel=gates[i+1].label;
   const quick=left<60?` Less than an hour until ${nextLabel}: no food, just sips${youth?'':' of sports drink'}.`:'';
   if(rate)items.push({id:`fluid-${i}`,phase:'between',at:fromMin(end+5),gate:i+1,offset:end+5-next,title:`After ${label}: replace what you sweated`,
    drink:drink(sodiumWhat,0.8*lossMl!,lossMl!,{ceiling:ceiling.text}),
    why:`Spread it out until about 15 minutes before ${nextLabel}${hot&&!rider.sweat_test_hot?'. Your sweat test was on a cooler day: today you may sweat more, so drink to thirst on top, still without gaining weight':''}.${quick}`,evidence:'evidence-based',sources:['acsm2007','nata2017','baker2017']});
   else items.push({id:`fluid-${i}`,phase:'between',at:fromMin(end+5),gate:i+1,offset:end+5-next,title:`After ${label}: drink to thirst`,
    drink:{what:sodiumWhat,text:youth?'Small drinks often, to thirst':'Sips and small drinks often, to thirst',ceiling:ceiling.text},
    why:`Your sweat test gives you an exact number; until then, drink to thirst and stop short of feeling full or sloshy.${quick}`,evidence:'evidence-based',sources:['acsm2007','nata2017']});
   if(left>=120){
    const firstFeed=end+15,windowMin=Math.max(0,stop-firstFeed),hours=Math.min(4,windowMin/60);
    // A 15-40 minute moto does not drain the tank like an endurance event, so the 1.0-1.2 g/kg/h recovery rate is
    // capped at about 1.0-1.5 g/kg for the whole gap (a pro's ~75 g between motos is ~1 g/kg); easier on nervous stomachs.
    const low=1.0*W*Math.min(hours,1),high=Math.max(low,Math.min(1.2*W*hours,1.5*W));
    const full=left>=240;
    const feeds=windowMin>=150?[0.5,0.3,0.2]:windowMin>=60?[0.6,0.4]:[1];
    const proteinG:[number,number]=[Math.max(15,g(0.25*W)),Math.min(30,Math.max(20,g(0.3*W)))];
    feeds.forEach((share,k)=>{
     const t=k===0?firstFeed:firstFeed+windowMin*(k===1?0.45:0.8);
     const isFirst=k===0;
     items.push({id:`feed-${i}-${k}`,phase:'between',at:fromMin(t),gate:i+1,offset:Math.round(t-next),
      title:isFirst?(full?`After ${label}: a full meal`:`After ${label}: refuel now`):`Top-up before ${nextLabel}`,
      eat:eat(low*share,high*share,{hours:(next-t)/60,slot:'recovery',...(isFirst&&!portionsOnly?{protein:proteinG}:{}),basis:`About 1.0–1.5 g carbohydrate per kg across the gap (the 1.0–1.2 g/kg per hour recovery rate, capped because a moto is short); this feed is ${Math.round(share*100)}% of it`,
       add:isFirst?[youth?'Some protein: a glass of milk, a cheese stick, or turkey in a sandwich':'Some protein: 8 oz chocolate milk, a turkey sandwich or Greek yogurt']:undefined}),
      why:isFirst?`Start refuelling soon after the moto and eat most of it early. Protein belongs here, after the moto, not right before the gate. Skip greasy food: nothing fried within 2–3 hours of riding.${nervous?' With a nervous stomach, keep feeds small and drink part of the carbohydrate.':''}`:`Small and easy. Solid food stops about ${nervous?90:75} minutes before ${nextLabel}.`,
      evidence:'evidence-based',sources:isFirst?['joint2016','nata2017']:['joint2016']});
    });
    if(!isFinite(stop)||stop>firstFeed)items.push({id:`stop-${i}`,phase:'between',at:fromMin(stop),gate:i+1,offset:stop-next,title:`Last solid food before ${nextLabel}`,why:`From here to the gate, only sips and the small optional snack. Food in the stomach at the gate is what makes riders feel bad on the bike.`,evidence:'expert practice',sources:['joint2016','practice']});
   }else if(left>=60){
    items.push({id:`feed-${i}-0`,phase:'between',at:fromMin(end+10),gate:i+1,offset:end+10-next,title:`After ${label}: a small easy snack`,
     eat:eat(15,30,{hours:(next-end-10)/60,slot:nervous?'liquid':'snack',basis:'15–30 g of easy carbohydrate; the gap is too short for a meal'}),
     why:`Under 2 hours until ${nextLabel}: keep it small and easy, and save the protein for after racing.`,evidence:'expert practice',sources:['practice','joint2016']});
   }
  }
 });

 // ---------------- after the last moto
 const lastEnd=G[G.length-1]+mins;
 const afterProtein:[number,number]=[20,30];
 items.push({id:'after-meal',phase:'after',at:fromMin(lastEnd+30),gate:null,offset:null,title:practice?'After practice: refuel':'After racing: refuel',
  eat:eat(1.0*W,1.2*W,{hours:6,slot:'recovery',protein:portionsOnly?undefined:afterProtein,basis:'About 1.0–1.2 g carbohydrate per kg and 20–30 g protein within 2 hours',add:[youth?'Protein with it: milk, chicken, eggs or yogurt':portionsOnly?'Protein with it: 8 oz chocolate milk, chicken, eggs or Greek yogurt':'Protein with it: 8 oz chocolate milk, chicken, eggs or Greek yogurt (20–30 g)']}),
  why:'Eat a real meal within about 2 hours of the last moto. Now is the time for the bigger, normal meal.',evidence:'evidence-based',sources:['nata2017','joint2016']});
 items.push({id:'after-fluid',phase:'after',at:fromMin(lastEnd+15),gate:null,offset:null,title:'Rehydrate over the next few hours',
  drink:rate?drink(youth?'Water, milk or a sports drink':'Water, a sports drink or chocolate milk, with salty food',1.25*lossMl!,1.5*lossMl!,{ceiling:youth?`That’s about the most from the last moto: ${cupsText(1.5*lossMl!)}, spread over a few hours.`:`That’s the most for the last moto: 1.25–1.5 times what you lost, spread over a few hours, not all at once.`})
   :{what:youth?'Water, milk or a sports drink':'Water, a sports drink or chocolate milk, with salty food',text:youth?'Small drinks over a few hours':'For each pound lost, about 19–23 oz (1.25–1.5 L per kg) over a few hours',ceiling:youth?'Not all at once. Weigh before and after with the sweat test to know the amount.':'Weigh before and after to know: no more than 1.5 times what you lost.'},
  why:'Replace a bit more than you lost, because some passes straight through, and spread it out.',evidence:'evidence-based',sources:['acsm2007','nata2017']});

 if(practice)notes.push('Practice day is where you rehearse: eat exactly what you plan to eat on race day, at the same times, so your stomach knows it. Nervous stomachs get better with practice too.');
 if(nervous)notes.push('Nervous stomach: meal earlier and smaller, snacks small, liquids instead of solids when you can’t face food, low fat and fiber. Rehearse these foods on practice days to train your gut.');
 if(hot)notes.push(youth?'Hot day: more breaks in the shade, a sports drink on a long day, and watch for the warning signs below.':'Hot or humid: use a sports drink with sodium or add a salty snack (pretzels), cool off in the shade between motos, and watch the warning signs below.');
 notes.push(youth?'Water is the main drink. No energy drinks or supplements for riders under 18.':'Sodium in drinks: 460–1,150 mg per litre. A 20 oz sports drink has about 270 mg (about 460 mg per litre).');

 const extra=(day.extra??[]).filter(x=>x&&typeof x.id==='string').map(x=>youthSafeItem(x,youth));
 const all=[...items,...extra].sort((a,b)=>(toMin(a.at??'')??9999)-(toMin(b.at??'')??9999));
 return {...base,blocked:null,dayBefore,items:all};
}

/** Grams, calories, per-kg and caffeine: none of these reach a youth plan. */
export const YOUTH_FORBIDDEN=/\b\d+(?:[.,]\d+)?(?:–\d+(?:[.,]\d+)?)?\s?(?:g|mg|kcal)\b|calori|\bper kg\b|\bkg\b|\blbs?\b|\bpounds?\b|caffeine/i;
const GRAMS=YOUTH_FORBIDDEN;
/** An item added from the outside (a saved gate shift) obeys youth mode too. */
function youthSafeItem(x:PlanItem,youth:boolean):PlanItem{
 if(!youth)return x;
 const {eat,drink,...rest}=x;
 return {...rest,...(eat?{eat:{foods:eat.foods.filter(f=>!GRAMS.test(f))}}:{}),...(drink?{drink:{what:drink.what,text:drink.text.replace(/\d+[–-]?\d*\s?mL.*$/,'').trim()||'A few sips',...(drink.ceiling?{ceiling:drink.ceiling}:{})}}:{}),why:GRAMS.test(x.why)?'Keep it small and easy.':x.why};
}

// ------------------------------------------------------------------ the day, live
/** The next gate to drop from `now` ("HH:MM"), with minutes to go. Null once the last gate has dropped. */
export function nextGate(day:Pick<DayInput,'gates'|'kind'>,now:string):{index:number;label:string;at:string;minutes:number}|null{
 const gates=gatesOf(day),n=toMin(now);if(n==null)return null;
 const i=gates.findIndex(g=>toMin(g.at)!>=n);
 return i<0?null:{index:i,label:gates[i].label,at:gates[i].at,minutes:toMin(gates[i].at)!-n};
}
/** "in 1 h 20" / "in 25 min" / "now". */
export const untilText=(minutes:number)=>minutes<=0?'now':minutes<60?`in ${minutes} min`:`in ${Math.floor(minutes/60)} h${minutes%60?` ${String(minutes%60).padStart(2,'0')}`:''}`;
/** "T−45 min" style label for an item, relative to its gate. */
export function offsetText(item:PlanItem,gates:Gate[]):string{
 if(item.gate==null||item.offset==null)return '';
 const label=gates[item.gate]?.label??'';const o=item.offset;
 if(o===0)return `at ${label}`;
 const a=Math.abs(o),t=a<60?`${a} min`:`${Math.floor(a/60)} h${a%60?` ${a%60} min`:''}`;
 return o<0?`${t} before ${label}`:`${t} after ${label}`;
}
/** Items still ahead of `now`, and the ones already behind (UI dims those). Day-before items aren't timed. */
export function splitByNow(items:PlanItem[],now:string):{ahead:PlanItem[];past:PlanItem[]}{
 const n=toMin(now)??0,ahead:PlanItem[]=[],past:PlanItem[]=[];
 for(const it of items){const t=toMin(it.at??'');(t!=null&&t<n-10?past:ahead).push(it);}
 return {ahead,past};
}

/** A gate moved (a delay, or the schedule moved up). Everything stays anchored to the gate, and the change adds:
 *  - delayed 60 min or more: a small top-up 30–60 min before the new time;
 *  - moved earlier while the last meal was under 2 hours ago: sips of sports drink only;
 *  - 4 hours or more from now to the new gate: a full meal now.
 *  `cascade` moves the later gates by the same amount (the usual case at the track). */
export function shiftGate(day:DayInput,index:number,newAt:string,ctx:{now:string;lastAteAt?:string|null;cascade?:boolean;youth?:boolean}):{day:DayInput;added:PlanItem[];notes:string[]}{
 const gates=gatesOf(day),to=toMin(newAt),now=toMin(ctx.now);
 if(!gates[index]||to==null||now==null)return {day,added:[],notes:['Pick the moto and its new time.']};
 const from=toMin(gates[index].at)!,delta=to-from,cascade=ctx.cascade!==false;
 const moved=gates.map((g,i)=>i===index||(cascade&&i>index)?{...g,at:fromMin(toMin(g.at)!+delta)}:g);
 const label=gates[index].label,added:PlanItem[]=[],notes:string[]=[];
 const ate=ctx.lastAteAt?toMin(ctx.lastAteAt):null;
 const sinceAte=ate==null?null:now-ate;
 const tag=`shift-${index}-${newAt.replace(':','')}`;
 const youth=!!ctx.youth;
 if(delta>=60)added.push({id:`${tag}-topup`,phase:'gate',at:fromMin(to-45),gate:index,offset:-45,title:`${label} delayed: small top-up`,
  eat:youth?{foods:['1 banana or 1 applesauce pouch']}:{foods:['1 banana or 1 applesauce pouch or 10 oz sports drink'],detail:{carb_g:[15,30],foods_carb_g:20,per_food:[],basis:'15–30 g of easy carbohydrate, 30–60 minutes before the new time'}},
  why:'The wait burned through some of what you ate. Something small and easy, then sips.',evidence:'expert practice',sources:['practice']});
 if(delta<0&&sinceAte!=null&&sinceAte<120)added.push({id:`${tag}-sips`,phase:'gate',at:fromMin(now),gate:index,offset:now-to,title:`${label} moved up: sips only`,
  drink:{what:youth?'Water or a little sports drink':'Sports drink',text:'Sips only until the gate'},
  why:'You ate less than 2 hours ago: no more food before this gate, just sips.',evidence:'expert practice',sources:['practice','joint2016']});
 if(to-now>=240)added.push({id:`${tag}-meal`,phase:'between',at:fromMin(now+15),gate:index,offset:now+15-to,title:`${label} is 4+ hours away: a full meal`,
  eat:{foods:['A normal meal: a sandwich or rice bowl with fruit, low fat and fiber, like the pre-race meal']},
  why:'With 4 hours or more to go there’s time for a real meal and for it to settle.',evidence:'expert practice',sources:['joint2016','practice']});
 if(delta>0&&delta<60)notes.push(`${label} moved ${delta} min later: keep sipping, no extra food needed.`);
 if(delta<0&&!added.length)notes.push(`${label} moved ${-delta} min earlier: skip anything not eaten yet within 60–90 minutes of the gate.`);
 const keep=(day.extra??[]).filter(x=>!x.id.startsWith(`shift-${index}-`));
 return {day:{...day,gates:moved,extra:[...keep,...added]},added,notes};
}

// ------------------------------------------------------------------ the sweat test
export type SweatInput={pre:number;post:number;unit:'kg'|'lb';drankMl:number;urineMl?:number;minutes:number};
export type SweatResult={ok:true;rate_lph:number;loss_kg:number;loss_pct:number;replace_ml:[number,number];replaceText:string;flags:string[]}|{ok:false;problem:string};
/** Sweat rate (L/h) = (pre kg − post kg + fluid drunk L − urine L) ÷ hours, weighed in minimal clothing, dried off.
 *  ACSM 2007, NATA 2017, Baker 2017. replaceText never shows a weight: "Fluid to replace: 700 mL". */
export function sweatTest(i:SweatInput,o:{youth?:boolean}={}):SweatResult{
 const pre=toKg(Number(i.pre),i.unit),post=toKg(Number(i.post),i.unit);
 const drank=Math.max(0,Number(i.drankMl)||0)/1000,urine=Math.max(0,Number(i.urineMl)||0)/1000,h=Number(i.minutes)/60;
 if(!Number.isFinite(pre)||!Number.isFinite(post)||pre<PROFILE_LIMITS.minKg||post<PROFILE_LIMITS.minKg||pre>PROFILE_LIMITS.maxKg||post>PROFILE_LIMITS.maxKg)return {ok:false,problem:'Enter both weights, before and after riding.'};
 if(!Number.isFinite(h)||h<0.25||h>6)return {ok:false,problem:'Enter how long you rode, between 15 minutes and 6 hours.'};
 if(drank>8||urine>4)return {ok:false,problem:'Check the amounts drunk and peed: they look too large.'};
 const lossKg=pre-post;
 const rate=(lossKg+drank-urine)/h;
 if(rate<0.1||rate>4)return {ok:false,problem:'These numbers don’t add up to a sweat rate. Weigh on the same scale, in the same minimal clothing, dried off, and try again.'};
 const pct=lossKg/pre*100;
 const flags:string[]=[];
 if(lossKg<0)flags.push(o.youth?'The scale went up: more was drunk than sweated out. Drink a little less next time.':'You weighed more after riding: you drank more than you sweated. Drink less next time; gaining weight while riding is never the goal.');
 else if(pct>2)flags.push(o.youth?'That was a big loss for one session: drink a little more next time, up to the sweat rate.':`You lost more than 2% of your body weight. Drink a bit more while riding next time, up to your sweat rate.`);
 const replace:[number,number]=[r10(Math.max(0,lossKg)*1250),r10(Math.max(0,lossKg)*1500)];
 const replaceText=lossKg<=0?'Nothing extra to replace from this session.':o.youth?`Fluid to replace: ${cupsText(replace[0])} to ${cupsText(replace[1])}, over a few hours`:`Fluid to replace: ${replace[0]}–${replace[1]} mL (${oz(replace[0])}–${oz(replace[1])} oz), over a few hours`;
 return {ok:true,rate_lph:Math.round(rate*100)/100,loss_kg:Math.round(lossKg*100)/100,loss_pct:Math.round(pct*10)/10,replace_ml:replace,replaceText,flags};
}
/** The sweat rate as the rider sees it: per moto, never their weight. */
export function sweatRateText(rate:number,motoMinutes:number,youth:boolean):string{
 const ml=r10(rate*1000*motoMinutes/60);
 return youth?`About ${cupsText(ml)} sweated out in a ${motoMinutes}-minute moto`:`${Math.round(rate*100)/100} L an hour: about ${ml} mL (${oz(ml)} oz) in a ${motoMinutes}-minute moto`;
}

// ------------------------------------------------------------------ saved day settings
/** Today's settings, kept on the device with the race (gates, moto length, hot, nervous). Youth plans keep the same. */
export type FuelDay={day:string;profileId:string|null;input:DayInput};
export function emptyDay(kind:'race'|'practice',firstAt?:string|null):DayInput{
 return {kind,gates:firstAt?[{label:kind==='practice'?'Session 1':'Moto 1',at:firstAt}]:[],motoMinutes:20};
}
/** A saved day, or a fresh one when it is from another day or unreadable. */
export function readFuelDay(saved:unknown,today:string,kind:'race'|'practice',firstAt?:string|null):FuelDay{
 const s=saved as FuelDay|null;
 if(s&&typeof s==='object'&&s.day===today&&s.input&&Array.isArray(s.input.gates))return {...s,input:{...s.input,kind}};
 return {day:today,profileId:s&&typeof s==='object'&&typeof s.profileId==='string'?s.profileId:null,input:emptyDay(kind,firstAt)};
}
/** The plan card's one-line summary for Home: the next thing to eat or drink. */
export function nextUpLine(plan:FuelPlan,now:string):string{
 if(plan.blocked)return 'Talk to a doctor or dietitian before using this plan.';
 if(plan.problems.length)return plan.problems[0];
 const {ahead}=splitByNow(plan.items,now);const it=ahead[0];
 if(!it)return 'Done for today. Rehydrate and eat a real meal.';
 return `${it.at?clockLabel(it.at)+' · ':''}${it.title}`;
}
export function clockLabel(at:string):string{const m=toMin(at);if(m==null)return '';let h=Math.floor(m/60);const ap=h>=12?'PM':'AM';h=h%12||12;return `${h}:${String(m%60).padStart(2,'0')} ${ap}`;}

/** Rider-facing weight helpers for the profile form only (never on the plan). */
export const kgToLb=(kg:number)=>Math.round(kg/LB*10)/10;
export const cmFromFtIn=(ft:number,inch:number)=>Math.round((ft*12+inch)*2.54);
export const ftInFromCm=(cm:number):[number,number]=>{const t=Math.round(cm/2.54);return [Math.floor(t/12),t%12];};

// ------------------------------------------------------------------ profiles, as both apps edit them
/** A fuel_profiles row as /api/fuel-profiles returns it (weight always in kg; weight_unit is how the rider types it). */
export type FuelProfileRow={id:string;kind:'self'|'rider';name:string;weight_kg:number|string;weight_unit:'kg'|'lb';height_cm:number|string|null;age:number;sex:'female'|'male'|null;
 nervous_stomach:boolean;caffeine:boolean;moto_minutes:number|null;sweat_rate_lph:number|string|null;sweat_test_at:string|null;sweat_test_hot:boolean|null;screen:ScreenId[];cleared:boolean;created_at?:string;updated_at?:string};
const num=(v:unknown)=>v==null||v===''?null:Number(v);
/** The planner's view of a saved row. */
export function riderOf(r:FuelProfileRow):FuelRider{
 return {weight:Number(r.weight_kg),weight_unit:'kg',age:Number(r.age),height_cm:num(r.height_cm),sex:r.sex??null,nervous_stomach:!!r.nervous_stomach,caffeine:Number(r.age)>=18&&!!r.caffeine,
  sweat_rate_lph:num(r.sweat_rate_lph),sweat_test_hot:r.sweat_test_hot??null,screen:Array.isArray(r.screen)?r.screen.filter(s=>SCREEN_IDS.includes(s)):[],cleared:!!r.cleared};
}
export const profileName=(r:Pick<FuelProfileRow,'kind'|'name'>)=>r.kind==='self'?(r.name.trim()||'You'):(r.name.trim()||'Rider');
/** The profile form: strings as typed. Height is feet and inches when the rider uses pounds, centimetres with kilograms. */
export type ProfileDraft={id:string;kind:'self'|'rider';name:string;weight:string;unit:'kg'|'lb';ft:string;inch:string;cm:string;age:string;sex:''|'female'|'male';
 nervous:boolean;caffeine:boolean;screen:ScreenId[];cleared:boolean;moto:string};
export function draftFrom(row:FuelProfileRow|null,o:{id:string;kind:'self'|'rider'}):ProfileDraft{
 if(!row)return {id:o.id,kind:o.kind,name:'',weight:'',unit:'lb',ft:'',inch:'',cm:'',age:'',sex:'',nervous:false,caffeine:false,screen:[],cleared:false,moto:''};
 const kg=Number(row.weight_kg),cm=num(row.height_cm),unit=row.weight_unit==='kg'?'kg':'lb';
 const [ft,inch]=cm?ftInFromCm(cm):[0,0];
 return {id:row.id,kind:row.kind,name:row.name??'',weight:String(unit==='lb'?kgToLb(kg):kg),unit,ft:cm?String(ft):'',inch:cm?String(inch):'',cm:cm?String(cm):'',age:String(row.age),sex:row.sex??'',
  nervous:!!row.nervous_stomach,caffeine:!!row.caffeine,screen:Array.isArray(row.screen)?row.screen:[],cleared:!!row.cleared,moto:row.moto_minutes?String(row.moto_minutes):''};
}
/** The PUT body for /api/fuel-profiles, or what to fix. Keeps the sweat test that is already saved. */
export function draftBody(d:ProfileDraft,row?:FuelProfileRow|null):{body:Record<string,unknown>}|{problem:string}{
 const weight=Number(d.weight.replace(',','.')),age=Number(d.age);
 let height:number|null=null;
 if(d.unit==='lb'&&(d.ft.trim()||d.inch.trim())){const ft=Number(d.ft||0),inch=Number(d.inch||0);if(!Number.isFinite(ft)||!Number.isFinite(inch)||inch<0||inch>=12)return {problem:'Enter height as feet and inches (0 to 11).'};height=cmFromFtIn(ft,inch);}
 if(d.unit==='kg'&&d.cm.trim()){height=Number(d.cm.replace(',','.'));}
 const problem=profileProblem({weight,weight_unit:d.unit,age,height_cm:height});
 if(problem)return {problem};
 if(d.kind==='rider'&&!d.name.trim())return {problem:'Give this rider a name, like their first name or number.'};
 const moto=d.moto.trim()?Number(d.moto):null;
 if(moto!=null&&(!Number.isInteger(moto)||moto<PROFILE_LIMITS.minMoto||moto>PROFILE_LIMITS.maxMoto))return {problem:'Moto length is 5 to 60 minutes.'};
 const screen=d.screen.filter(s=>SCREEN_IDS.includes(s));
 return {body:{id:d.id,kind:d.kind,name:d.name.trim().slice(0,PROFILE_LIMITS.name),weight,weight_unit:d.unit,height_cm:height,age,sex:d.sex||null,
  nervous_stomach:d.nervous,caffeine:age>=18&&d.caffeine,moto_minutes:moto,screen,cleared:screen.length?d.cleared:false,
  sweat_rate_lph:row?num(row.sweat_rate_lph):null,sweat_test_at:row?.sweat_test_at??null,sweat_test_hot:row?.sweat_test_hot??null}};
}
/** The same row with a new sweat rate, as a PUT body. */
export function withSweatRate(row:FuelProfileRow,rate:number,hot:boolean,at:string):Record<string,unknown>{
 const d=draftFrom(row,{id:row.id,kind:row.kind});const b=draftBody(d,row);
 if('problem' in b)throw new Error(b.problem);
 return {...b.body,sweat_rate_lph:Math.round(rate*100)/100,sweat_test_at:at,sweat_test_hot:hot};
}
export const EVIDENCE_TEXT:Record<Evidence,string>={'evidence-based':'Evidence-based','expert practice':'Expert practice'};
export const sourceText=(ids:FuelSourceId[])=>ids.map(i=>FUEL_SOURCES[i]).join(' · ');
/** Moto lengths to pick from on the card. */
export const MOTO_LENGTHS=[15,20,25,30,35] as const;
