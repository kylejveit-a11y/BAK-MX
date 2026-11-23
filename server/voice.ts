// Talk to BAK (docs/plans/VOICE.md): the phone sends its call offer here, this server opens the voice session with the
// provider, and the provider's key and settings never reach the phone. Pro only, a monthly allowance, testers only
// until the proof is approved. Audio is never stored; only when a session started and how long it ran.
import {z} from 'zod';
import {adminDb} from './database.ts';
import {HttpError,readJson} from './validation.ts';
import {hasPaidAccess} from './billing.ts';
import {resolveTier,unlimitedAccess} from './plans.ts';
import {VOICE,VOICES,monthStart,sessionSeconds,voiceInstructions,voiceStatus,type VoiceStatus} from '../shared/voice.ts';

type Who={id:string};
const ok=<T>(r:{data:T;error:unknown}):T=>{if(r.error)throw r.error;return r.data;};
const startSchema=z.object({sdp:z.string().min(20).max(60000),bike:z.string().trim().max(120).optional(),voice:z.enum(VOICES).optional(),job:z.string().trim().max(160).optional()}).strict();
const endSchema=z.object({session_id:z.string().min(3).max(200),seconds:z.number().int().min(0).max(86400).optional()}).strict();

async function statusFor(user:Who):Promise<VoiceStatus>{
 const db=adminDb();
 const [tester,rows,unlimited,paid]=await Promise.all([
  db.from('voice_testers').select('user_id').eq('user_id',user.id).maybeSingle(),
  db.from('voice_sessions').select('started_at,ended_at,seconds').eq('user_id',user.id).gte('started_at',monthStart()),
  unlimitedAccess(user.id),hasPaidAccess(user.id)]);
 const used=(ok(rows) as {started_at:string;ended_at:string|null;seconds:number|null}[]).reduce((n,r)=>n+sessionSeconds(r),0);
 const tier=paid?await resolveTier(user.id):'free';
 // While voice is a proof, the people testing it are not held to the monthly allowance.
 const inTest=Boolean(ok(tester));
 return voiceStatus(tier,inTest,used,unlimited||inTest);
}
const WHY:Record<NonNullable<VoiceStatus['why']>,string>={not_in_test:'Talk to BAK is not switched on for this account yet.',not_pro:'Talk to BAK is part of Pro.',used_up:'You have used this month’s talk time. It resets on the 1st.'};

export async function handleVoice(req:Request,path:string,method:string,user:Who):Promise<unknown|null>{
 if(path==='/api/voice'&&method==='GET')return statusFor(user);
 if(path==='/api/voice/session'&&method==='POST'){
  const data=startSchema.parse(await readJson(req));
  const status=await statusFor(user);if(!status.allowed)throw new HttpError(403,WHY[status.why??'not_in_test']);
  const key=process.env.OPENAI_API_KEY;if(!key)throw new HttpError(503,'Voice is not configured');
  const r=await fetch('https://api.openai.com/v1/live/sessions',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
   body:JSON.stringify({session:{model:VOICE.model,instructions:voiceInstructions(data.bike??'',data.job??''),audio:{output:{voice:data.voice??VOICE.voice}},delegation:{type:'client',acknowledgement_delay_ms:400}},transport:{type:'webrtc',sdp:data.sdp}}),signal:AbortSignal.timeout(20000)});
  if(!r.ok){const detail=(await r.text().catch(()=>'')).slice(0,400);console.error('voice session failed',r.status,detail);throw new HttpError(502,'BAK could not start the voice session. Try again in a moment.');}
  const body=await r.json() as {session?:{id?:string};transport?:{sdp?:string}};
  if(!body.session?.id||!body.transport?.sdp)throw new HttpError(502,'BAK could not start the voice session. Try again in a moment.');
  ok(await adminDb().from('voice_sessions').insert({id:body.session.id,user_id:user.id,started_at:new Date().toISOString()}));
  return{session_id:body.session.id,sdp:body.transport.sdp,seconds_left:Math.min(status.seconds_left,VOICE.maxSessionSeconds)};
 }
 if(path==='/api/voice/end'&&method==='POST'){
  const data=endSchema.parse(await readJson(req)),db=adminDb();
  const row=ok(await db.from('voice_sessions').select('started_at,ended_at').eq('id',data.session_id).eq('user_id',user.id).maybeSingle()) as {started_at:string;ended_at:string|null}|null;
  if(!row)throw new HttpError(404,'Session not found');
  if(!row.ended_at){
   // The phone's own count is trusted only downwards: never more than the clock says has passed.
   const wall=sessionSeconds({started_at:row.started_at,ended_at:null,seconds:null}),seconds=Math.min(wall,data.seconds??wall);
   ok(await db.from('voice_sessions').update({ended_at:new Date().toISOString(),seconds}).eq('id',data.session_id).eq('user_id',user.id).is('ended_at',null));
  }
  return statusFor(user);
 }
 return null;
}
