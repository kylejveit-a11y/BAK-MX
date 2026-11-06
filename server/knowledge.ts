import type {SupabaseClient} from '@supabase/supabase-js';
import type {Bike} from '../shared/types.ts';
import {exactBikeScope} from '../shared/bike-identity.ts';
import {garageModels,garageModelInfo,garageModelYears} from '../shared/garage-models.ts';

/** Deep bike knowledge (docs/research/BIKE_KNOWLEDGE_STANDARD.md): power and feel, dynos, ECU maps, engine architecture,
 *  porting, mods, known issues and setups, each with its source tier. Selected per question for the exact bike. */
export type KnowledgeTier='OEM'|'MEASURED'|'TUNER'|'DERIVED'|'COMMUNITY';
/** reported_by: an OEM-tier row whose source is not the maker's own document (a magazine or dealer quoting the maker).
 *  maker_conflict: set in code when the row disagrees with a verified maker fact for the same bike (server/answer-guards.ts). */
export type Knowledge={bike?:string;id:string;domain:string;topic:string;statement:string;tier:KnowledgeTier;values:Record<string,unknown>;notes:string;confidence:string;reported_by?:string;maker_conflict?:string;recall?:{vin_range:boolean;rider_vin:string}};
/** Source types that are the maker's own word. An OEM-tier row from any other source is a maker figure as quoted by someone else. */
const MAKER_SOURCES=new Set(['manufacturer','official recall notice','press release','calculation','']);
export function reportedBy(tier:string,sourceType:unknown):string|undefined{
 const t=String(sourceType??'').trim().toLowerCase();if(tier!=='OEM'||MAKER_SOURCES.has(t))return undefined;
 return t==='magazine'||t==='tester'?'press':t;
}
type Row={id:string;domain:string;topic:string;statement:string;tier:KnowledgeTier;vals:Record<string,unknown>|null;notes:string|null;confidence:string;source?:{type?:string}|null};
const toKnowledge=(r:Row,bike?:string):Knowledge=>{const by=reportedBy(r.tier,r.source?.type);return {...(bike?{bike}:{}),id:'K-'+r.id,domain:r.domain,topic:r.topic,statement:r.statement,tier:r.tier,values:r.vals??{},notes:r.notes??'',confidence:r.confidence,...(by?{reported_by:by}:{})};};
const KNOWLEDGE_COLUMNS='id,domain,topic,statement,tier,vals,notes,confidence,source';
const MAX_ROWS=28;
const DOMAIN_HINTS:[RegExp,string][]=[
 [/\b(map|maps|mapping|power tuner|ecu|ignition|fuel(ing)?|traction control|launch|quickshift|tc\b|mode|app)\b/i,'ecu_electronics'],
 [/\b(dyno|horse ?power|hp|torque|power|pull|hit|bottom|mid ?range|top ?end|over-?rev|rev|rpm|fast|slow|feel|character|engine braking|vibration)\b/i,'power_feel'],
 [/\b(port|porting|power ?valve|ypvs|reed|cylinder|head|compression|cam|valve|bore|stroke|piston)\b/i,'engine_architecture'],
 [/\b(mod|mods|exhaust|pipe|silencer|build|faster|more power|race fuel|big bore|jet|jets|jetting|carb|carburetor|needle|plug|plugs|airbox|air box|choked|corked|uncork\w*|restrict\w*|throttle stop|baffle|insert|held back|holding (it|me) back|green sticker|emissions|flywheel|fly ?wheel weight|inertia|stall\w*|lug\w*|spins? up)\b/i,'engine_mods'],
 [/\b(gear|gearing|sprocket|ratio|speed|top speed)\b/i,'drivetrain'],
 [/\b(torque spec\w*|tighten\w*|torqu(e|ing) (the |a )?\w*\s?(bolt|nut|screw)|bolt|bolts|nut|nuts|n·?m|nm|ft[- ]?lbs?|lb[- ]?ft|clearance\w*|valve (clearance|check|adjust\w*)|shim|service|interval\w*|hours?|maintenance|oil change|change (the )?oil|oil capacity|how much oil|coolant|replace\w*|rebuild|top end|bottom end|piston|rings?|wear limit|limit|spark plug|air filter|fork oil|spec|specs|specification\w*)\b/i,'maintenance'],
 [/\b(rake|trail|wheelbase|frame|chassis|handling|corner|turn|stable|stability|weight)\b/i,'chassis'],
 [/\b(problem|issue|fail|failure|recall|bulletin|known|common|break|broke|leak|foul|fouls|fouling|boil|boils|boiling|overheat\w*|stall\w*|bog\w*|ping\w*|detonat\w*|hard start\w*|won'?t start)\b/i,'known_issues'],
 [/\b(change|changed|new|differen|vs|versus|compare|generation|update)\b/i,'identity'],
 [/\b(setup|setups|setting|settings|baseline|start(ing)? point|arenacross|supercross|outdoors?|sand|sandy|mud|muddy|rut\w*|loam\w*|hard ?pack|hard-pack|whoops|gncc|desert|enduro|vet|novice|intermediate|pro|lb|lbs|kg|weigh\w*|heavy|light)\b/i,'setups'],
 [/\b(suspension|fork|forks|shock|spring|springs|clicker\w*|compression|rebound|sag|air pressure|psi|bar|preload|valving|revalve\w*|bottom(s|ing|ed)? out|bottoming|wallow\w*|div(e|es|ing)|harsh|pack(s|ing)?|kick(s|ing)?|clamp\w*|offset|linkage)\b/i,'suspension'],
];
const words=(s:string)=>new Set(s.toLowerCase().match(/[a-z0-9]{3,}/g)??[]);
/** Rank the bike's knowledge for this question: domain hints from the rider's words, then word overlap. */
export function rankKnowledge(rows:Knowledge[],text:string,limit=MAX_ROWS):Knowledge[]{
 const want=new Set(DOMAIN_HINTS.filter(([re])=>re.test(text)).map(([,d])=>d)),q=words(text);
 // 'Torque' next to a fastener means tightening torque, not engine torque.
 if(/\b(bolt|bolts|nut|nuts|screw|axle|tighten\w*|n·?m|ft[- ]?lbs?|lb[- ]?ft)\b/i.test(text))want.delete('power_feel');
 const score=(k:Knowledge)=>{let s=want.has(k.domain)?10:0;for(const w of words(k.topic+' '+k.statement))if(q.has(w))s+=1;s+=k.tier==='OEM'||k.tier==='MEASURED'?1:0;return s;};
 return rows.map(k=>({k,s:score(k)})).filter(x=>x.s>=3).sort((a,b)=>b.s-a.s).slice(0,limit).map(x=>x.k);
}
const STOP=new Set(['what','when','with','that','this','have','does','should','often','much','many','about','your','bike','check','checked','change','spec','specs','torque','value','values','there','from','they','them','into','what\'s']);
/** Large table rows (torque tables, schedules, service limits) are cut down to the entries that match the question. */
export function focusRow(k:Knowledge,text:string,max=4000):Knowledge{
 if(JSON.stringify(k.values).length<=max)return k;
 const q=(text.toLowerCase().match(/[a-z0-9]{3,}/g)??[]).filter(w=>!STOP.has(w));
 if(!q.length)return k;
 const hit=(s:string)=>{const t=s.toLowerCase();return q.some(w=>t.includes(w));};
 const out:Record<string,unknown>={};let kept=0,total=0;
 for(const [key,val] of Object.entries(k.values)){
  if(Array.isArray(val)){total+=val.length;const m=val.filter(v=>hit(JSON.stringify(v)));kept+=m.length;if(m.length)out[key]=m;continue;}
  if(val&&typeof val==='object'){const e=Object.entries(val as Record<string,unknown>);total+=e.length;const m=e.filter(([a,b])=>hit(a+' '+JSON.stringify(b)));kept+=m.length;if(m.length)out[key]=Object.fromEntries(m);continue;}
  total++;if(hit(key+' '+String(val))){out[key]=val;kept++;}
 }
 if(!kept)return k;
 return {...k,values:out,notes:(k.notes?k.notes+' ':'')+`[Only the ${kept} of ${total} table entries that match the question are shown.]`};
}
/** Keep the briefing a sensible size: large rows (full torque tables, schedules) only while the budget lasts. */
export function withinBudget(rows:Knowledge[],budget=36000):Knowledge[]{
 let used=0;const out:Knowledge[]=[];
 for(const k of rows){const n=JSON.stringify(k).length;if(used+n>budget&&out.length)continue;used+=n;out.push(k);}
 return out;
}
export async function bikeKnowledge(db:SupabaseClient,bike:Bike,message:string,lookups:string[]=[]):Promise<Knowledge[]>{
 const s=exactBikeScope(bike);
 const {data,error}=await db.from('bike_knowledge').select(KNOWLEDGE_COLUMNS).eq('manufacturer',s.manufacturer).eq('model',s.model).eq('model_year',s.model_year).eq('status','APPROVED').limit(600);
 if(error||!Array.isArray(data))return [];// Deep knowledge is additive; a read failure must not block the answer.
 const rows=(data as Row[]).map(r=>toKnowledge(r));
 const q=[message,...lookups].join(' ');
 return withinBudget(rankKnowledge(rows,q).map(k=>focusRow(k,q)));
}
/** Which answer tier each knowledge tier may support. */
export const knowledgeClaimTier:Record<KnowledgeTier,'PUBLISHED'|'COMMUNITY'|'ENGINEERING'>={OEM:'PUBLISHED',MEASURED:'COMMUNITY',TUNER:'COMMUNITY',COMMUNITY:'COMMUNITY',DERIVED:'ENGINEERING'};

const disp=(model:string)=>(model.match(/\d{2,3}/)?.[0])??'';
/** Other bikes the rider names ("vs the Yamaha", "my buddy's CRF450R", "KX450"): an exact model name wins; a bare make
 *  means that make's motocross bike of the same displacement and stroke. Same model year, or the nearest year on file. */
export function mentionedBikes(message:string,bike:Pick<Bike,'manufacturer'|'model'|'model_year'>):{manufacturer:string;model:string;model_year:number}[]{
 const out=new Map<string,{manufacturer:string;model:string;model_year:number}>(),text=' '+message+' ',mine=garageModelInfo[bike.manufacturer+'|'+bike.model];
 const add=(make:string,model:string)=>{if(make===bike.manufacturer&&model===bike.model)return;const years=garageModelYears(make,model);if(!years.length)return;
  const y=years.includes(bike.model_year)?bike.model_year:years.reduce((a,b)=>Math.abs(b-bike.model_year)<Math.abs(a-bike.model_year)?b:a);out.set(make+'|'+model,{manufacturer:make,model,model_year:y});};
 for(const [make,models] of Object.entries(garageModels))for(const model of models){const re=new RegExp('(?<![A-Za-z0-9])'+model.replace(/[-\s]/g,'[- ]?')+'(?![A-Za-z0-9])','i');if(re.test(text))add(make,model);}
 if(!out.size)for(const make of Object.keys(garageModels)){
  if(make===bike.manufacturer||!new RegExp('(?<![A-Za-z])'+(make==='GasGas'?'gas ?gas':make)+'(?![A-Za-z])','i').test(text))continue;
  const match=garageModels[make].find(m=>disp(m)===disp(bike.model)&&garageModelInfo[make+'|'+m]?.discipline==='motocross'&&garageModelInfo[make+'|'+m]?.engine===mine?.engine);
  if(match)add(make,match);
 }
 return [...out.values()].slice(0,2);
}
/** Words that make a year or a short model name a comparison rather than a passing mention. */
const COMPARE=/\b(vs\.?|versus|compared?|comparing|comparison|differen\w*|differ|changed?|changes|new|same as|than|update[sd]?|upgrades?|swap|over the)\b/i;
/** Asking what changed or is new, without naming a year: compare with the previous model year of the same model. */
const PREVIOUS_YEAR=/\b(what(?:'s|\s+is|\s+has|\s+have)?\s+(?:changed|new|different)|changes?\s+(?:for|from|since|between)|new\s+for\s+20\d\d|(?:vs\.?|versus|than|compared\s+(?:to|with))\s+(?:the\s+)?(?:last|previous|prior|older|old)\b|(?:last|previous|prior)\s+(?:year'?s?|model(?:\s+year)?|gen\w*)\b|year[- ]over[- ]year)/i;
const esc=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
/** Short names riders use for a roster model of the same make: "450-X", "450 RC", "250F"; and, for a model of the active
 *  bike's displacement, the suffix alone: "RC", "RX", "XC-F", "the X", "the E". An alias that fits two models is not used. */
function aliasModels(message:string,bike:Pick<Bike,'manufacturer'|'model'>):string[]{
 const list=garageModels[bike.manufacturer]??[],mine=disp(bike.model);
 const parts=list.map(model=>{const d=model.match(/\d{2,3}/);if(!d||d.index===undefined)return null;const token=model.slice(d.index+d[0].length).replace(/^[-\s]+/,'').trim().split(/\s+/)[0]??'';return token?{model,disp:d[0],token}:null;}).filter((p):p is {model:string;disp:string;token:string}=>!!p);
 const count=new Map<string,number>();const key=(a:string,b:string)=>a+'|'+b.toLowerCase();
 for(const p of parts)count.set(key(p.disp,p.token),(count.get(key(p.disp,p.token))??0)+1);
 const found:string[]=[];
 for(const p of parts){
  if(p.model===bike.model||count.get(key(p.disp,p.token))!==1)continue;
  const tok=esc(p.token).replace(/-/g,'[- ]?');
  if(new RegExp('(?<![A-Za-z0-9])'+p.disp+'[- ]?'+tok+'(?![A-Za-z0-9])','i').test(message)&&COMPARE.test(message)){found.push(p.model);continue;}
  if(p.disp!==mine)continue;
  // The suffix alone: one letter only as "the X" in capitals; longer ones anywhere as a word.
  const alone=p.token.length===1?new RegExp('(?:^|\\s)(?:[Tt]he|[Aa]n?|vs\\.?|versus|than|to|with|from)\\s+'+tok+'(?![A-Za-z0-9-])'):new RegExp('(?<![A-Za-z0-9-])'+tok+'(?![A-Za-z0-9])','i');
  if(alone.test(message)&&COMPARE.test(message))found.push(p.model);
 }
 return found;
}
export type CompareTarget={manufacturer:string;model:string;model_year:number;relation:'other_year'|'other_model';label:string};
/** The bikes a question compares with: other roster models the rider names (full name, short name or bare make), and another
 *  model year of the same model (a year named in a comparison, or the previous year for "what changed"). At most two. */
export function comparisonBikes(message:string,bike:Pick<Bike,'manufacturer'|'model'|'model_year'>):CompareTarget[]{
 const out=new Map<string,CompareTarget>(),named=[...message.matchAll(/(?<![0-9])(20[1-3]\d)(?![0-9])/g)].map(m=>Number(m[1]));
 const label=(make:string,model:string,y:number)=>`${y} ${make} ${model}`;
 const nearest=(make:string,model:string)=>{const ys=garageModelYears(make,model);if(!ys.length)return null;const n=named.find(y=>ys.includes(y)&&y!==bike.model_year)??named.find(y=>ys.includes(y));if(n)return n;return ys.includes(bike.model_year)?bike.model_year:ys.reduce((a,b)=>Math.abs(b-bike.model_year)<Math.abs(a-bike.model_year)?b:a);};
 const addModel=(make:string,model:string)=>{if(make===bike.manufacturer&&model===bike.model)return;const y=nearest(make,model);if(y)out.set(make+'|'+model,{manufacturer:make,model,model_year:y,relation:'other_model',label:label(make,model,y)});};
 for(const b of mentionedBikes(message,bike))addModel(b.manufacturer,b.model);
 for(const model of aliasModels(message,bike))addModel(bike.manufacturer,model);
 const years=garageModelYears(bike.manufacturer,bike.model);
 const otherYear=named.find(y=>y!==bike.model_year&&years.includes(y))??null;
 const year=otherYear&&COMPARE.test(message)?otherYear:!out.size&&PREVIOUS_YEAR.test(message)?Math.max(-Infinity,...years.filter(y=>y<bike.model_year)):null;
 if(year&&Number.isFinite(year))out.set('year',{manufacturer:bike.manufacturer,model:bike.model,model_year:year,relation:'other_year',label:label(bike.manufacturer,bike.model,year)});
 return [...out.values()].slice(0,2);
}
/** Knowledge for other models the rider compares against, labelled with the bike so BAK never mixes them up with the rider's own.
 *  (Another year of the same model shares most rows with the rider's bike; its verified facts come through server/claims.ts.) */
export async function comparisonKnowledge(db:SupabaseClient,bike:Bike,message:string):Promise<Knowledge[]>{
 const out:Knowledge[]=[];
 for(const other of comparisonBikes(message,bike).filter(t=>t.relation==='other_model')){
  const {data,error}=await db.from('bike_knowledge').select(KNOWLEDGE_COLUMNS).eq('manufacturer',other.manufacturer).eq('model',other.model).eq('model_year',other.model_year).eq('status','APPROVED').limit(400);
  if(error||!Array.isArray(data))continue;
  out.push(...rankKnowledge((data as Row[]).map(r=>toKnowledge(r,other.label)),message,12));
 }
 return out;
}
