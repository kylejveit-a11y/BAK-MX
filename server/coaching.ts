// Coaching history: every Ask BAK question sent with a clip, or with riding photos and a "what are you showing" tap, is a
// coaching session. They are read back from the finished requests, per bike, for three things: the Coaching tab in Garage,
// the short history BAK sees with a new clip ("did the last fix stick?"), and before/after: the frames of an earlier clip
// sent alongside a new one. Reads only; any failure returns nothing so a question is never blocked.
import type {SupabaseClient} from '@supabase/supabase-js';
import {adminDb,checked} from './database.ts';
import {photoLinks,pick,type PhotoRef} from './rider-photos.ts';
import {coachFocus,type ChatMedia} from '../shared/coach-focus.ts';
import type {EngineeringResponse} from '../shared/types.ts';
import {z} from 'zod';
import {HttpError,readJson,uuid} from './validation.ts';

type Result={result:'better'|'no_change'|'worse';note:string;updated_at:string};
type Row={request_id:string;conversation_id:string;created_at:string;input:string;media:ChatMedia|null;photo_ids:string[]|null;response:EngineeringResponse|null;assistant_message_id:string|null;tried?:Result|null};
const COLS='request_id,conversation_id,created_at,input,media,photo_ids,response,assistant_message_id';

async function sessions(db:SupabaseClient,owner:string,bikeId:string,limit:number):Promise<Row[]>{
 const convs=checked(await db.from('conversations').select('id').eq('user_id',owner).eq('bike_id',bikeId).order('updated_at',{ascending:false}).limit(300)) as {id:string}[]|null;
 if(!convs?.length)return [];
 const rows=checked(await adminDb().from('ai_requests').select(COLS).eq('user_id',owner).eq('state','complete').in('conversation_id',convs.map(c=>c.id)).not('media','is',null).order('created_at',{ascending:false}).limit(limit)) as Row[]|null;
 const out=(rows??[]).filter(r=>r.media&&(r.media.kind==='clip'||r.media.focus));
 if(!out.length)return out;
 // What the rider said happened when they tried it; a read failure just leaves it off.
 const tried=await adminDb().from('coaching_results').select('request_id,result,note,updated_at').eq('user_id',owner).in('request_id',out.map(r=>r.request_id));
 const by=new Map(((tried.data??[]) as (Result&{request_id:string})[]).map(t=>[t.request_id,t]));
 return out.map(r=>({...r,tried:by.get(r.request_id)??null}));
}

/** One "## Heading" part of a coaching answer. */
export function answerPart(answer:string|undefined,heading:string){
 const m=(answer??'').match(new RegExp('(?:^|\\n)##\\s*'+heading+'\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)','i'));
 return (m?.[1]??'').replace(/\s+/g,' ').trim();
}
const clip=(s:string,n:number)=>s.length>n?s.slice(0,n-1).trimEnd()+'…':s;

/** What BAK sees about earlier sessions on this bike: when, what was shown, the fix and the drill. */
export async function coachingHistory(db:SupabaseClient,owner:string,bikeId:string,exclude:string){
 try{
  return (await sessions(db,owner,bikeId,8)).filter(r=>r.request_id!==exclude).slice(0,5).map(r=>({
   date:r.created_at.slice(0,10),showing:coachFocus(r.media?.focus)?.label.toLowerCase()??null,from:r.media?.kind==='clip'?'clip':'photos',
   question:clip(r.input,160),fix:clip(answerPart(r.response?.answer,'The fix')||r.response?.next_step?.action||'',400),drill:clip(answerPart(r.response?.answer,'Drill'),300),...(r.tried?{rider_tried_it:{result:r.tried.result,note:clip(r.tried.note,300)}}:{})}));
 }catch{return [];}
}

/** The earlier clip a rider asked to compare with: its frames as image links and what it was. Null if it is not theirs. */
export async function beforeClip(owner:string,requestId:string){
 try{
  const r=checked(await adminDb().from('ai_requests').select(COLS).eq('request_id',requestId).eq('user_id',owner).eq('state','complete').maybeSingle()) as Row|null;
  if(!r||r.media?.kind!=='clip'||!r.photo_ids?.length)return null;
  const links=await photoLinks(r.photo_ids,900),urls=r.photo_ids.map(id=>links.get(id)?.url);
  if(urls.some(u=>!u)||urls.length!==r.media.frames.length)return null;
  return {urls:urls as string[],media:r.media,date:r.created_at.slice(0,10),fix:clip(answerPart(r.response?.answer,'The fix')||r.response?.next_step?.action||'',400)};
 }catch{return null;}
}

export type CoachingSession={id:string;message_id:string|null;at:string;question:string;media:ChatMedia;photos:PhotoRef[];answer:string;fix:string;drill:string;tried:Result|null};
const resultSchema=z.object({message_id:uuid,result:z.enum(['better','no_change','worse']),note:z.string().trim().max(1000).default('')}).strict();
/** GET /api/coaching?bike_id= — the Coaching tab: newest first, with the frames, BAK's answer and how it went.
 *  POST /api/coaching/result — the rider's "Tried it?" answer. */
export async function handleCoaching(req:Request,path:string,method:string,url:URL,owner:string,db:SupabaseClient):Promise<CoachingSession[]|Result|null>{
 if(path==='/api/coaching/result'){
  // POST: "Tried it?" under a coaching answer. The message must be BAK's answer to one of this rider's coaching questions.
  if(method!=='POST')throw new HttpError(405,'Method not allowed');
  const data=resultSchema.parse(await readJson(req)),admin=adminDb();
  const r=checked(await admin.from('ai_requests').select('request_id,media').eq('assistant_message_id',data.message_id).eq('user_id',owner).eq('state','complete').maybeSingle()) as {request_id:string;media:ChatMedia|null}|null;
  if(!r?.media)throw new HttpError(404,'That coaching answer was not found');
  const now=new Date().toISOString();
  const saved=checked(await admin.from('coaching_results').upsert({request_id:r.request_id,user_id:owner,result:data.result,note:data.note,updated_at:now},{onConflict:'request_id'}).select('result,note,updated_at').single()) as Result;
  return saved;
 }
 if(path!=='/api/coaching')return null;
 if(method!=='GET')throw new HttpError(405,'Method not allowed');
 const bikeId=uuid.parse(url.searchParams.get('bike_id'));
 const bike=checked(await db.from('bikes').select('id').eq('id',bikeId).eq('user_id',owner).maybeSingle());if(!bike)throw new HttpError(404,'Bike not found');
 const rows=await sessions(db,owner,bikeId,20),links=await photoLinks(rows.flatMap(r=>r.photo_ids??[]));
 return rows.map(r=>({id:r.request_id,message_id:r.assistant_message_id,tried:r.tried??null,at:r.created_at,question:r.input,media:r.media!,photos:pick(links,r.photo_ids),answer:r.response?.answer??r.response?.summary??'',
  fix:answerPart(r.response?.answer,'The fix')||r.response?.next_step?.action||'',drill:answerPart(r.response?.answer,'Drill')}));
}
