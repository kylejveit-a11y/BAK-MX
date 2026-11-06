import {runEdit} from './photo-edits.ts';
import {EDIT_STYLES} from '../shared/photo-edit.ts';
import {createHash} from 'node:crypto';
import {z} from 'zod';
import type {Bike,Message} from '../shared/types.ts';
import {adminDb,checked} from './database.ts';
import {HttpError,readJson} from './validation.ts';
import {COACH_FOCUS_IDS,CLIP_MAX_FRAMES} from '../shared/coach-focus.ts';
import {searchBikeClaims} from './claims.ts';
import {bikeKnowledge,comparisonKnowledge} from './knowledge.ts';
import {trackContext} from './tracks.ts';
import {raceForecast,raceTrackAt} from './weather.ts';
import {generateAnswer,planSpecLookups,raceLookups,PROMPT_VERSION} from './engineering.ts';
import {physicsFor} from './physics-context.ts';
/** Test access to Ask BAK for automated evaluation (POST /api/eval/ask), approved by Kyle 2026-10-15. Gated by a bearer
 *  token whose SHA-256 is in eval_access_tokens (expiring, revocable, capped per day). The bike, prior turns and ride results
 *  come in the request, so a run never reads or writes any rider's account, bikes, conversations or AI allowance. Each run is
 *  logged in eval_runs. Any failure to authenticate answers 404 so the route does not advertise itself. */
// An assistant turn may carry its full earlier reply, as the live conversation does (messages.response).
const turn=z.object({role:z.enum(['user','assistant']),content:z.string().max(8000),response:z.record(z.string(),z.unknown()).optional()});
const body=z.object({
 bike:z.object({manufacturer:z.string().min(1).max(40),model:z.string().min(1).max(60),model_year:z.number().int().min(1990).max(2030),
  variant:z.string().max(40).default('standard'),region:z.string().max(10).default('US'),engine_hours:z.number().nullable().default(null),
  configuration:z.record(z.string(),z.unknown()).default({})}).nullable(),
 message:z.string().min(1).max(4000),
 history:z.array(turn).max(20).default([]),
 guided:z.object({procedure_id:z.string().min(1).max(200),step_index:z.number().int().min(0).max(2000)}).optional(),
 voice:z.boolean().optional(),
 // App-action tests: the rider's bikes and upcoming events as the live route would give them (ids are test ids).
 app:z.object({bikes:z.array(z.object({id:z.string().max(60),label:z.string().max(120),active:z.boolean()})).max(30),events:z.array(z.object({id:z.string().max(60),title:z.string().max(120),type:z.string().max(20),starts_at:z.string().max(40),location:z.string().max(160),my_rsvp:z.string().nullable()})).max(25),today:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),weekday:z.string().max(12).optional(),photos:z.array(z.string().max(60)).max(4).optional()}).optional(),
 // Coaching tests: still frames as inline JPEGs (never links), and the clip details the app would send with them.
 images:z.array(z.string().regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/).max(400000)).max(CLIP_MAX_FRAMES).default([]),
 media:z.discriminatedUnion('kind',[z.object({kind:z.literal('clip'),duration:z.number().min(0).max(120),frames:z.array(z.number().min(0).max(120)).min(2).max(CLIP_MAX_FRAMES),focus:z.enum(COACH_FOCUS_IDS).optional(),slowmo:z.boolean().optional()}).strict(),z.object({kind:z.literal('photos'),focus:z.enum(COACH_FOCUS_IDS)}).strict()]).optional(),
 race:z.object({track:z.string().trim().max(120).optional(),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),setup:z.boolean().optional()}).strict().optional(),
 preferences:z.object({units:z.enum(['us','metric']),answer_length:z.enum(['quick','full']),tone:z.enum(['straight','encouraging'])}).strict().optional(),
 setup_history:z.array(z.object({recorded_at:z.string().default(()=>new Date().toISOString()),track:z.string().max(120).default(''),conditions:z.string().max(120).default(''),
  change_made:z.string().max(1000).default(''),result:z.enum(['better','no_change','worse','not_tested']),notes:z.string().max(1000).default('')})).max(8).default([]),
});
const ID='00000000-0000-4000-8000-0000000000';
async function evalToken(req:Request){
 const m=(req.headers.get('authorization')??'').match(/^Bearer (bakeval_[a-f0-9]{48})$/);
 if(!m)throw new HttpError(404,'Not found');
 const admin=adminDb(),hash=createHash('sha256').update(m[1]).digest('hex');
 const tok=checked(await admin.from('eval_access_tokens').select('id,daily_limit,expires_at,revoked_at').eq('token_sha256',hash).maybeSingle()) as {id:string;daily_limit:number;expires_at:string;revoked_at:string|null}|null;
 if(!tok||tok.revoked_at||new Date(tok.expires_at)<new Date())throw new HttpError(404,'Not found');
 const {count}=await admin.from('eval_runs').select('id',{count:'exact',head:true}).eq('token_id',tok.id).gte('created_at',new Date(Date.now()-864e5).toISOString());
 if((count??0)>=tok.daily_limit)throw new HttpError(429,'Daily test limit reached');
 return {admin,tok};
}
/** Photo-edit test: one image in, the edited image back. Nothing is saved and no rider is charged; it counts as a test run. */
export async function handleEvalPhotoEdit(req:Request):Promise<Response>{
 const {admin,tok}=await evalToken(req);
 const data=z.object({image:z.string().regex(/^data:image\/(jpeg|png|webp);base64,/).max(3_900_000),style:z.enum(EDIT_STYLES)}).strict().parse(await readJson(req,4_000_000));
 const [head,b64]=data.image.split(',');const type=head.slice(5,head.indexOf(';'));
 const t0=Date.now(),out=await runEdit(new Blob([Uint8Array.from(atob(b64),c=>c.charCodeAt(0))],{type}),data.style);
 await admin.from('eval_runs').insert({token_id:tok.id,bike:'photo edit',message:data.style,prompt_version:'photo-edit',ms:Date.now()-t0,ok:true}).then(()=>{},()=>{});
 let s='';for(const b of out)s+=String.fromCharCode(b);
 return Response.json({image:'data:image/jpeg;base64,'+btoa(s),ms:Date.now()-t0},{headers:{'Cache-Control':'no-store'}});
}
export async function handleEval(req:Request):Promise<Response>{
 const {admin,tok}=await evalToken(req);
 if(!process.env.OPENAI_API_KEY||!process.env.OPENAI_MODEL)throw new HttpError(503,'AI is not configured');
 const data=body.parse(await readJson(req,4_000_000)),now=new Date().toISOString();
 if(data.media?.kind==='clip'&&data.media.frames.length!==data.images.length)throw new HttpError(400,'Send one frame time per image.');
 const bike:Bike|null=data.bike?{id:ID+'01',user_id:ID+'02',nickname:'Test bike',created_at:now,updated_at:now,...data.bike} as unknown as Bike:null;
 const history:Message[]=data.history.map((t,i)=>({id:ID+String(10+i),conversation_id:ID+'03',user_id:ID+'02',role:t.role,content:t.content,response:(t.response??null) as never,created_at:new Date(Date.now()-(data.history.length-i)*1000).toISOString()}));
 const t0=Date.now(),label=bike?`${bike.model_year} ${bike.manufacturer} ${bike.model}`:'no bike';
 const log=(ok:boolean,error?:string)=>admin.from('eval_runs').insert({token_id:tok.id,bike:label,message:data.message.slice(0,500),prompt_version:PROMPT_VERSION,ms:Date.now()-t0,ok,error:error?.slice(0,300)??null}).then(()=>{},()=>{});
 try{
  const lookups=bike?(data.race?raceLookups(data.message):await planSpecLookups(bike,history,data.message)):[];
  const claims=bike?await searchBikeClaims(admin,bike,lookups):[];
  const knowledge=bike?[...await bikeKnowledge(admin,bike,data.message,lookups),...await comparisonKnowledge(admin,bike,data.message)]:[];
  const tracks=data.race?.track?await trackContext(admin,ID+'02',[data.race.track,data.message]):[];
  const race=data.race?{...data.race,...(data.race.date&&data.race.track?{forecast:await raceForecast(...raceTrackAt(tracks,data.race.track),data.race.date,new Date().toISOString().slice(0,10))}:{})}:null;
  // Same engineering numbers as the live route (chassis, gearing, air and jetting), so tests cover them too.
  const physics=bike?await physicsFor(admin,bike,[data.message,...history.filter(m=>m.role==='user').slice(-2).map(m=>m.content??'')],{tracks,raceTrack:data.race?.track??null,forecastHighF:race?.forecast&&race.forecast.available?race.forecast.high_f:null,raceMode:!!data.race}):null;
  const physicsEvidence=(physics as {evidence?:typeof claims}|null)?.evidence;
  if(physicsEvidence?.length)for(const c of physicsEvidence)if(!claims.some(x=>x.id===c.id))claims.push(c);
  const {response}=await generateAnswer(bike,history,claims,data.message,lookups,()=>{},data.setup_history as never,knowledge,data.guided??null,data.voice===true,[],data.images,tracks,data.media??null,null,data.preferences??null,race,physics,data.app??null);
  await log(true);
  return new Response(JSON.stringify({prompt_version:PROMPT_VERSION,model:process.env.OPENAI_MODEL,ms:Date.now()-t0,published_claims:claims.length,lookups,response}),{headers:{'content-type':'application/json','cache-control':'no-store'}});
 }catch(e){await log(false,String((e as Error)?.message??e));throw e;}
}
