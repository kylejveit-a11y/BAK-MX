import type {SupabaseClient} from '@supabase/supabase-js';
import type {Bike} from '../shared/types.ts';
import {exactBikeScope} from '../shared/bike-identity.ts';

/** Deep bike knowledge (docs/research/BIKE_KNOWLEDGE_STANDARD.md): power and feel, dynos, ECU maps, engine architecture,
 *  porting, mods, known issues and setups, each with its source tier. Selected per question for the exact bike. */
export type KnowledgeTier='OEM'|'MEASURED'|'TUNER'|'DERIVED'|'COMMUNITY';
export type Knowledge={id:string;domain:string;topic:string;statement:string;tier:KnowledgeTier;values:Record<string,unknown>;notes:string;confidence:string};
const MAX_ROWS=28;
const DOMAIN_HINTS:[RegExp,string][]=[
 [/\b(map|maps|mapping|power tuner|ecu|ignition|fuel(ing)?|traction control|launch|quickshift|tc\b|mode|app)\b/i,'ecu_electronics'],
 [/\b(dyno|horse ?power|hp|torque|power|pull|hit|bottom|mid ?range|top ?end|over-?rev|rev|rpm|fast|slow|feel|character|engine braking|vibration)\b/i,'power_feel'],
 [/\b(port|porting|power ?valve|ypvs|reed|cylinder|head|compression|cam|valve|bore|stroke|piston)\b/i,'engine_architecture'],
 [/\b(mod|mods|exhaust|pipe|silencer|build|faster|more power|race fuel|big bore)\b/i,'engine_mods'],
 [/\b(gear|gearing|sprocket|ratio|speed|top speed)\b/i,'drivetrain'],
 [/\b(rake|trail|wheelbase|frame|chassis|handling|corner|turn|stable|stability|weight)\b/i,'chassis'],
 [/\b(problem|issue|fail|failure|recall|bulletin|known|common|break|broke|leak)\b/i,'known_issues'],
 [/\b(change|changed|new|differen|vs|versus|compare|generation|update)\b/i,'identity'],
 [/\b(setup|settings|baseline|arenacross|supercross|sand|mud|hardpack|vet|novice|pro)\b/i,'setups'],
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
