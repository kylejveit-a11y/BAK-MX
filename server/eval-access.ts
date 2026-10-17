import {createHash} from 'node:crypto';
import {z} from 'zod';
import type {Bike,Message} from '../shared/types.ts';
import {adminDb,checked} from './database.ts';
import {HttpError,readJson} from './validation.ts';
import {searchBikeClaims} from './claims.ts';
import {bikeKnowledge} from './knowledge.ts';
import {generateAnswer,planSpecLookups,PROMPT_VERSION} from './engineering.ts';
/** Test access to Ask BAK for automated evaluation (POST /api/eval/ask), approved by Kyle 2026-10-15. Gated by a bearer
 *  token whose SHA-256 is in eval_access_tokens (expiring, revocable, capped per day). The bike, prior turns and ride results
 *  come in the request, so a run never reads or writes any rider's account, bikes, conversations or AI allowance. Each run is
 *  logged in eval_runs. Any failure to authenticate answers 404 so the route does not advertise itself. */
const turn=z.object({role:z.enum(['user','assistant']),content:z.string().max(8000)});
const body=z.object({
 bike:z.object({manufacturer:z.string().min(1).max(40),model:z.string().min(1).max(60),model_year:z.number().int().min(1990).max(2030),
  variant:z.string().max(40).default('standard'),region:z.string().max(10).default('US'),engine_hours:z.number().nullable().default(null),
  configuration:z.record(z.string(),z.unknown()).default({})}).nullable(),
 message:z.string().min(1).max(4000),
 history:z.array(turn).max(20).default([]),
 setup_history:z.array(z.object({recorded_at:z.string().default(()=>new Date().toISOString()),track:z.string().max(120).default(''),conditions:z.string().max(120).default(''),
  change_made:z.string().max(1000).default(''),result:z.enum(['better','no_change','worse','not_tested']),notes:z.string().max(1000).default('')})).max(8).default([]),
});
const ID='00000000-0000-4000-8000-0000000000';
export async function handleEval(req:Request):Promise<Response>{
 const m=(req.headers.get('authorization')??'').match(/^Bearer (bakeval_[a-f0-9]{48})$/);
 if(!m)throw new HttpError(404,'Not found');
 const admin=adminDb(),hash=createHash('sha256').update(m[1]).digest('hex');
 const tok=checked(await admin.from('eval_access_tokens').select('id,daily_limit,expires_at,revoked_at').eq('token_sha256',hash).maybeSingle()) as {id:string;daily_limit:number;expires_at:string;revoked_at:string|null}|null;
 if(!tok||tok.revoked_at||new Date(tok.expires_at)<new Date())throw new HttpError(404,'Not found');
 const {count}=await admin.from('eval_runs').select('id',{count:'exact',head:true}).eq('token_id',tok.id).gte('created_at',new Date(Date.now()-864e5).toISOString());
 if((count??0)>=tok.daily_limit)throw new HttpError(429,'Daily test limit reached');
 if(!process.env.OPENAI_API_KEY||!process.env.OPENAI_MODEL)throw new HttpError(503,'AI is not configured');
 const data=body.parse(await readJson(req)),now=new Date().toISOString();
 const bike:Bike|null=data.bike?{id:ID+'01',user_id:ID+'02',nickname:'Test bike',created_at:now,updated_at:now,...data.bike} as unknown as Bike:null;
 const history:Message[]=data.history.map((t,i)=>({id:ID+String(10+i),conversation_id:ID+'03',user_id:ID+'02',role:t.role,content:t.content,response:null,created_at:new Date(Date.now()-(data.history.length-i)*1000).toISOString()}));
 const t0=Date.now(),label=bike?`${bike.model_year} ${bike.manufacturer} ${bike.model}`:'no bike';
 const log=(ok:boolean,error?:string)=>admin.from('eval_runs').insert({token_id:tok.id,bike:label,message:data.message.slice(0,500),prompt_version:PROMPT_VERSION,ms:Date.now()-t0,ok,error:error?.slice(0,300)??null}).then(()=>{},()=>{});
 try{
  const lookups=bike?await planSpecLookups(bike,history,data.message):[];
  const claims=bike?await searchBikeClaims(admin,bike,lookups):[];
  const knowledge=bike?await bikeKnowledge(admin,bike,data.message,lookups):[];
  const {response}=await generateAnswer(bike,history,claims,data.message,lookups,()=>{},data.setup_history as never,knowledge);
  await log(true);
  return new Response(JSON.stringify({prompt_version:PROMPT_VERSION,model:process.env.OPENAI_MODEL,ms:Date.now()-t0,published_claims:claims.length,lookups,response}),{headers:{'content-type':'application/json','cache-control':'no-store'}});
 }catch(e){await log(false,String((e as Error)?.message??e));throw e;}
}
