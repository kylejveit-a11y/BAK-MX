// Coaching history: every Ask BAK question sent with a clip, or with riding photos and a "what are you showing" tap, is a
// coaching session. They are read back from the finished requests, per bike, for three things: the Coaching tab in Garage,
// the short history BAK sees with a new clip ("did the last fix stick?"), and before/after: the frames of an earlier clip
// sent alongside a new one. Reads only; any failure returns nothing so a question is never blocked.
import type {SupabaseClient} from '@supabase/supabase-js';
import {adminDb,checked} from './database.ts';
import {photoLinks,pick,type PhotoRef} from './rider-photos.ts';
import {coachFocus,type ChatMedia} from '../shared/coach-focus.ts';
import type {EngineeringResponse} from '../shared/types.ts';
import {HttpError,uuid} from './validation.ts';

type Row={request_id:string;conversation_id:string;created_at:string;input:string;media:ChatMedia|null;photo_ids:string[]|null;response:EngineeringResponse|null};
const COLS='request_id,conversation_id,created_at,input,media,photo_ids,response';

async function sessions(db:SupabaseClient,owner:string,bikeId:string,limit:number):Promise<Row[]>{
 const convs=checked(await db.from('conversations').select('id').eq('user_id',owner).eq('bike_id',bikeId).order('updated_at',{ascending:false}).limit(300)) as {id:string}[]|null;
 if(!convs?.length)return [];
 const rows=checked(await adminDb().from('ai_requests').select(COLS).eq('user_id',owner).eq('state','complete').in('conversation_id',convs.map(c=>c.id)).not('media','is',null).order('created_at',{ascending:false}).limit(limit)) as Row[]|null;
 return (rows??[]).filter(r=>r.media&&(r.media.kind==='clip'||r.media.focus));
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
   question:clip(r.input,160),fix:clip(answerPart(r.response?.answer,'The fix')||r.response?.next_step?.action||'',400),drill:clip(answerPart(r.response?.answer,'Drill'),300)}));
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

export type CoachingSession={id:string;at:string;question:string;media:ChatMedia;photos:PhotoRef[];answer:string;fix:string;drill:string};
/** GET /api/coaching?bike_id= — the Coaching tab: newest first, with the frames and BAK's answer. */
export async function handleCoaching(path:string,method:string,url:URL,owner:string,db:SupabaseClient):Promise<CoachingSession[]|null>{
 if(path!=='/api/coaching')return null;
 if(method!=='GET')throw new HttpError(405,'Method not allowed');
 const bikeId=uuid.parse(url.searchParams.get('bike_id'));
 const bike=checked(await db.from('bikes').select('id').eq('id',bikeId).eq('user_id',owner).maybeSingle());if(!bike)throw new HttpError(404,'Bike not found');
 const rows=await sessions(db,owner,bikeId,20),links=await photoLinks(rows.flatMap(r=>r.photo_ids??[]));
 return rows.map(r=>({id:r.request_id,at:r.created_at,question:r.input,media:r.media!,photos:pick(links,r.photo_ids),answer:r.response?.answer??r.response?.summary??'',
  fix:answerPart(r.response?.answer,'The fix')||r.response?.next_step?.action||'',drill:answerPart(r.response?.answer,'Drill')}));
}
