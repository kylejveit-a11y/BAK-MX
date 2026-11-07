import type {SupabaseClient} from '@supabase/supabase-js';
import {z} from 'zod';
import {checked} from './database.ts';
import {HttpError,readJson,uuid} from './validation.ts';
import type {Bike,EngineeringResponse} from '../shared/types.ts';
import {NOTE_LIMITS,noteFromAnswer,riderNote,type NoteDraft} from '../shared/tuning-notes.ts';

/** Tuning notes: GET (one bike's live notes), POST (save a BAK answer, or the rider's own note), PATCH (rename, edit the
 *  rider's words), DELETE (soft: sets removed_at). Everything runs with the rider's own token, so row-level security keeps
 *  every read and write to their own rows. A POST is safe to send twice: the same id, or the same BAK answer, returns the
 *  note already saved. */

const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const COLS='id,bike_id,title,question,answer,setup_changes,rider_note,bike_label,noted_at,conversation_id,source_message_id,created_at,updated_at';
const instant=z.string().refine(v=>Number.isFinite(Date.parse(v)),{message:'Use a valid date and time'}).transform(v=>new Date(v).toISOString());
const title=z.string().trim().min(1,'Give the note a name.').max(NOTE_LIMITS.title);
export const saveAnswerSchema=z.object({id:uuid,message_id:uuid,title:title.optional()}).strict();
export const saveOwnSchema=z.object({id:uuid,bike_id:uuid,rider_note:z.string().trim().min(1,'Write the note first.').max(NOTE_LIMITS.riderNote),noted_at:instant.optional(),conversation_id:uuid.nullable().optional(),title:title.optional()}).strict();
export const editNoteSchema=z.object({title:title.optional(),rider_note:z.string().trim().max(NOTE_LIMITS.riderNote).optional()}).strict().refine(v=>v.title!==undefined||v.rider_note!==undefined,{message:'Nothing to change.'});

async function ownBike(db:SupabaseClient,owner:string,id:string){const bike=checked(await db.from('bikes').select('id,model_year,manufacturer,model,nickname').eq('id',id).eq('user_id',owner).maybeSingle()) as Pick<Bike,'id'|'model_year'|'manufacturer'|'model'|'nickname'>|null;if(!bike)throw new HttpError(404,'Bike not found');return bike;}

/** The note for one saved BAK answer: the rider's question just before it, the answer, the bike of that chat. */
export async function draftFromMessage(db:SupabaseClient,owner:string,messageId:string,now=new Date().toISOString()):Promise<NoteDraft>{
 const message=checked(await db.from('messages').select('id,conversation_id,role,response,created_at').eq('id',messageId).eq('user_id',owner).maybeSingle()) as {id:string;conversation_id:string;role:string;response:EngineeringResponse|null;created_at:string}|null;
 if(!message||message.role!=='assistant'||!message.response)throw new HttpError(404,'That answer could not be found.');
 const conversation=checked(await db.from('conversations').select('id,bike_id').eq('id',message.conversation_id).eq('user_id',owner).maybeSingle()) as {id:string;bike_id:string|null}|null;
 if(!conversation)throw new HttpError(404,'That answer could not be found.');
 if(!conversation.bike_id)throw new HttpError(409,'This was a general question with no bike. Ask it on a bike to save it there.');
 const bike=await ownBike(db,owner,conversation.bike_id);
 const asked=checked(await db.from('messages').select('content').eq('conversation_id',conversation.id).eq('user_id',owner).eq('role','user').lte('created_at',message.created_at).order('created_at',{ascending:false}).limit(1)) as {content:string}[]|null;
 return noteFromAnswer({bike,question:asked?.[0]?.content??'',response:message.response,messageId:message.id,conversationId:conversation.id,at:now});
}

async function insertNote(db:SupabaseClient,owner:string,id:string,draft:NoteDraft):Promise<Response>{
 const result=await db.from('tuning_notes').insert({...draft,id,user_id:owner}).select(COLS).single();
 if(!result.error)return json(result.data,201);
 if(result.error.code!=='23505'){checked(result);throw new HttpError(503,'The note could not be saved.');}
 // Sent twice: the same id (a retry, a device note moving again) or the same BAK answer saved again.
 const byId=checked(await db.from('tuning_notes').select(COLS).eq('id',id).eq('user_id',owner).maybeSingle());
 if(byId)return json(byId,200);
 if(draft.source_message_id){const same=checked(await db.from('tuning_notes').select(COLS).eq('user_id',owner).eq('source_message_id',draft.source_message_id).is('removed_at',null).maybeSingle());if(same)return json(same,200);}
 throw new HttpError(409,'This note was already saved. Refresh your notes.');
}

export async function handleTuningNotes(req:Request,url:URL,path:string,method:string,db:SupabaseClient,owner:string):Promise<Response|null>{
 if(path!=='/api/tuning-notes')return null;
 if(method==='GET'){
  const bike=uuid.parse(url.searchParams.get('bike_id'));
  return json(checked(await db.from('tuning_notes').select(COLS).eq('user_id',owner).eq('bike_id',bike).is('removed_at',null).order('noted_at',{ascending:false}).limit(300)));
 }
 if(method==='POST'){
  const body=await readJson(req,32000);
  if(body&&typeof body==='object'&&'message_id' in body){const input=saveAnswerSchema.parse(body);const draft=await draftFromMessage(db,owner,input.message_id);return insertNote(db,owner,input.id,input.title?{...draft,title:input.title}:draft);}
  const input=saveOwnSchema.parse(body);const bike=await ownBike(db,owner,input.bike_id);
  const draft=riderNote({bike,text:input.rider_note,at:input.noted_at??new Date().toISOString(),conversationId:input.conversation_id??null});
  return insertNote(db,owner,input.id,input.title?{...draft,title:input.title}:draft);
 }
 if(method==='PATCH'){
  const id=uuid.parse(url.searchParams.get('id')),input=editNoteSchema.parse(await readJson(req,16000));
  const result=await db.from('tuning_notes').update({...input,updated_at:new Date().toISOString()}).eq('id',id).eq('user_id',owner).is('removed_at',null).select(COLS).maybeSingle();
  if(result.error?.code==='23514')throw new HttpError(422,'A note needs some words. Delete it instead if you don’t need it.');
  const row=checked(result);
  if(!row)throw new HttpError(404,'Note not found');
  return json(row);
 }
 if(method==='DELETE'){
  const id=uuid.parse(url.searchParams.get('id'));
  const rows=checked(await db.from('tuning_notes').update({removed_at:new Date().toISOString()}).eq('id',id).eq('user_id',owner).is('removed_at',null).select('id'));
  if(!rows?.length)throw new HttpError(404,'Note not found');
  return json({removed:true});
 }
 return null;
}
