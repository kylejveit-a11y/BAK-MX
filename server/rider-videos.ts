// Short clips in Community posts: one clip per post, up to 60 seconds and 100 MB, with a poster photo the app grabs from
// the clip. Files live in the private rider-videos bucket; the feed hands out signed links that expire after an hour.
import {z} from 'zod';
import type {SupabaseClient} from '@supabase/supabase-js';
import {adminDb} from './database.ts';
import {HttpError,readJson} from './validation.ts';
import {photoLinks,requireOwnPhotos} from './rider-photos.ts';

const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const checked=<T>(r:{data:T;error:unknown}):T=>{if(r.error)throw new HttpError(503,'Clips could not be reached right now');return r.data;};
export const VIDEO_BUCKET='rider-videos';
export const VIDEO_MAX_SECONDS=60,VIDEO_MAX_BYTES=100*1024*1024;
const MAX_VIDEOS=300;
const EXT:Record<string,string>={'video/mp4':'mp4','video/quicktime':'mov','video/webm':'webm'};
export type VideoRef={id:string;url:string;poster_url:string|null;duration_s:number|null;width:number|null;height:number|null};

export const videoUploadSchema=z.object({
 content_type:z.enum(['video/mp4','video/quicktime','video/webm']).default('video/mp4'),
 bytes:z.number().int().min(1).max(VIDEO_MAX_BYTES),
 duration_s:z.number().positive().max(VIDEO_MAX_SECONDS+0.5),
 width:z.number().int().min(1).max(10000).nullable().default(null),
 height:z.number().int().min(1).max(10000).nullable().default(null),
 poster_photo_id:z.string().uuid().nullable().default(null),
}).strict();

/** Signed links for video ids (and their posters). Missing ones are left out. */
export async function videoLinks(ids:string[],seconds=3600):Promise<Map<string,VideoRef>>{
 const unique=[...new Set(ids.filter(Boolean))];if(!unique.length)return new Map();
 const admin=adminDb();
 const rows=(await admin.from('rider_videos').select('id,storage_path,poster_photo_id,duration_s,width,height').in('id',unique)).data as {id:string;storage_path:string;poster_photo_id:string|null;duration_s:number|null;width:number|null;height:number|null}[]|null;
 if(!rows?.length)return new Map();
 const [signed,posters]=await Promise.all([admin.storage.from(VIDEO_BUCKET).createSignedUrls(rows.map(r=>r.storage_path),seconds),photoLinks(rows.map(r=>r.poster_photo_id??'').filter(Boolean),seconds)]);
 const byPath=new Map((signed.data??[]).filter(s=>s.signedUrl&&!s.error).map(s=>[s.path,s.signedUrl]));
 return new Map(rows.filter(r=>byPath.has(r.storage_path)).map(r=>[r.id,{id:r.id,url:byPath.get(r.storage_path)!,poster_url:r.poster_photo_id?posters.get(r.poster_photo_id)?.url??null:null,duration_s:r.duration_s===null?null:Number(r.duration_s),width:r.width,height:r.height}]));
}

export async function requireOwnVideo(owner:string,id:string|null|undefined){
 if(!id)return;
 const row=checked(await adminDb().from('rider_videos').select('id').eq('id',id).eq('user_id',owner).maybeSingle());
 if(!row)throw new HttpError(400,'That clip could not be found. Add it again.');
}

export async function handleRiderVideos(req:Request,path:string,method:string,url:URL,owner:string,_db:SupabaseClient):Promise<Response|null>{
 if(!path.startsWith('/api/videos'))return null;
 const admin=adminDb();
 if(path==='/api/videos/upload'&&method==='POST'){
  const data=videoUploadSchema.parse(await readJson(req));
  if(data.poster_photo_id)await requireOwnPhotos(owner,[data.poster_photo_id],['post','chat']);
  const existing=checked(await admin.from('rider_videos').select('id').eq('user_id',owner).limit(MAX_VIDEOS+1)) as unknown[]|null;
  if((existing?.length??0)>=MAX_VIDEOS)throw new HttpError(409,'Clip limit reached. Delete some older posts with clips to add more.');
  const id=crypto.randomUUID(),storage_path=`${owner}/${id}.${EXT[data.content_type]}`;
  checked(await admin.from('rider_videos').insert({id,user_id:owner,storage_path,content_type:data.content_type,poster_photo_id:data.poster_photo_id,duration_s:Math.round(data.duration_s*100)/100,width:data.width,height:data.height}));
  const signed=await admin.storage.from(VIDEO_BUCKET).createSignedUploadUrl(storage_path);
  if(signed.error||!signed.data)throw new HttpError(503,'Upload could not be started');
  return json({id,path:storage_path,token:signed.data.token,bucket:VIDEO_BUCKET},201);
 }
 if(path==='/api/videos'&&method==='GET'){
  const id=z.string().uuid().parse(url.searchParams.get('id'));
  const row=checked(await admin.from('rider_videos').select('id').eq('id',id).eq('user_id',owner).maybeSingle());
  if(!row)throw new HttpError(404,'Clip not found');
  const link=(await videoLinks([id])).get(id);if(!link)throw new HttpError(404,'Clip not found');return json(link);
 }
 return null;
}
