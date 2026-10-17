import type {SupabaseClient} from '@supabase/supabase-js';
import type {Bike} from '../shared/types.ts';
import {exactBikeScope} from '../shared/bike-identity.ts';
import {garageModels,garageModelInfo,garageModelYears} from '../shared/garage-models.ts';

/** Deep bike knowledge (docs/research/BIKE_KNOWLEDGE_STANDARD.md): power and feel, dynos, ECU maps, engine architecture,
 *  porting, mods, known issues and setups, each with its source tier. Selected per question for the exact bike. */
export type KnowledgeTier='OEM'|'MEASURED'|'TUNER'|'DERIVED'|'COMMUNITY';
export type Knowledge={bike?:string;id:string;domain:string;topic:string;statement:string;tier:KnowledgeTier;values:Record<string,unknown>;notes:string;confidence:string};
const MAX_ROWS=28;
const DOMAIN_HINTS:[RegExp,string][]=[
 [/\b(map|maps|mapping|power tuner|ecu|ignition|fuel(ing)?|traction control|launch|quickshift|tc\b|mode|app)\b/i,'ecu_electronics'],
 [/\b(dyno|horse ?power|hp|torque|power|pull|hit|bottom|mid ?range|top ?end|over-?rev|rev|rpm|fast|slow|feel|character|engine braking|vibration)\b/i,'power_feel'],
 [/\b(port|porting|power ?valve|ypvs|reed|cylinder|head|compression|cam|valve|bore|stroke|piston)\b/i,'engine_architecture'],
 [/\b(mod|mods|exhaust|pipe|silencer|build|faster|more power|race fuel|big bore|jet|jets|jetting|carb|carburetor|needle|plug|plugs|airbox|air box|choked|corked|uncork\w*|restrict\w*|throttle stop|baffle|insert|held back|holding (it|me) back|green sticker|emissions)\b/i,'engine_mods'],
 [/\b(gear|gearing|sprocket|ratio|speed|top speed)\b/i,'drivetrain'],
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
 const score=(k:Knowledge)=>{let s=want.has(k.domain)?10:0;for(const w of words(k.topic+' '+k.statement))if(q.has(w))s+=1;s+=k.tier==='OEM'||k.tier==='MEASURED'?1:0;return s;};
 return rows.map(k=>({k,s:score(k)})).filter(x=>x.s>=3).sort((a,b)=>b.s-a.s).slice(0,limit).map(x=>x.k);
}
export async function bikeKnowledge(db:SupabaseClient,bike:Bike,message:string,lookups:string[]=[]):Promise<Knowledge[]>{
 const s=exactBikeScope(bike);
 const {data,error}=await db.from('bike_knowledge').select('id,domain,topic,statement,tier,vals,notes,confidence').eq('manufacturer',s.manufacturer).eq('model',s.model).eq('model_year',s.model_year).eq('status','APPROVED').limit(600);
 if(error||!Array.isArray(data))return [];// Deep knowledge is additive; a read failure must not block the answer.
 const rows=data.map(r=>({id:'K-'+r.id,domain:r.domain,topic:r.topic,statement:r.statement,tier:r.tier,values:r.vals??{},notes:r.notes??'',confidence:r.confidence})) as Knowledge[];
 return rankKnowledge(rows,[message,...lookups].join(' '));
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
/** Knowledge for bikes the rider compares against, labelled with the bike so BAK never mixes them up with the rider's own. */
export async function comparisonKnowledge(db:SupabaseClient,bike:Bike,message:string):Promise<Knowledge[]>{
 const out:Knowledge[]=[];
 for(const other of mentionedBikes(message,bike)){
  const {data,error}=await db.from('bike_knowledge').select('id,domain,topic,statement,tier,vals,notes,confidence').eq('manufacturer',other.manufacturer).eq('model',other.model).eq('model_year',other.model_year).eq('status','APPROVED').limit(400);
  if(error||!Array.isArray(data))continue;
  const label=`${other.model_year} ${other.manufacturer} ${other.model}`;
  out.push(...rankKnowledge(data.map(r=>({bike:label,id:'K-'+r.id,domain:r.domain,topic:r.topic,statement:r.statement,tier:r.tier,values:r.vals??{},notes:r.notes??'',confidence:r.confidence})) as Knowledge[],message,12));
 }
 return out;
}
