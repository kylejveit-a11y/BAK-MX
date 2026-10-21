// Rider photos: bike pictures, post photos, photos sent to BAK in chat, profile pictures.
// Files sit in a private bucket. Uploads go straight from the phone to storage with a one-time signed upload link;
// everything that shows a photo gets a short-lived signed link from here. Only the owner can attach their photos.
import {z} from 'zod';
import type {SupabaseClient} from '@supabase/supabase-js';
import {adminDb} from './database.ts';
import {HttpError,readJson} from './validation.ts';

export const PHOTO_BUCKET='rider-photos';
export const PHOTO_KINDS=['post','chat','bike','avatar'] as const;
export type PhotoKind=typeof PHOTO_KINDS[number];
export type PhotoRef={id:string;url:string;width:number|null;height:number|null};
const LIMITS:Record<PhotoKind,number>={post:2000,chat:2000,bike:300,avatar:30};
const EXT:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/heic':'heic','image/webp':'webp'};
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const checked=<T>(r:{data:T;error:unknown}):T=>{if(r.error)throw new HttpError(503,'Photos could not be reached right now');return r.data;};
export const photoUploadSchema=z.object({kind:z.enum(PHOTO_KINDS),bike_id:z.string().uuid().nullable().default(null),content_type:z.enum(['image/jpeg','image/png','image/heic','image/webp']).default('image/jpeg'),width:z.number().int().min(1).max(20000).nullable().default(null),height:z.number().int().min(1).max(20000).nullable().default(null)}).strict();
export const photoIds=(max:number)=>z.array(z.string().uuid()).max(max).default([]);

/** Signed links for photo ids, in the order given. Missing or never-uploaded photos are left out. */
export async function photoLinks(ids:string[],seconds=3600):Promise<Map<string,PhotoRef>>{
 const unique=[...new Set(ids.filter(Boolean))];if(!unique.length)return new Map();
 const admin=adminDb();
 const rows=(await admin.from('rider_photos').select('id,storage_path,width,height').in('id',unique)).data as {id:string;storage_path:string;width:number|null;height:number|null}[]|null;
 if(!rows?.length)return new Map();
 const signed=await admin.storage.from(PHOTO_BUCKET).createSignedUrls(rows.map(r=>r.storage_path),seconds);
 const byPath=new Map((signed.data??[]).filter(s=>s.signedUrl&&!s.error).map(s=>[s.path,s.signedUrl]));
 return new Map(rows.filter(r=>byPath.has(r.storage_path)).map(r=>[r.id,{id:r.id,url:byPath.get(r.storage_path)!,width:r.width,height:r.height}]));
}
export const pick=(links:Map<string,PhotoRef>,ids:string[]|null|undefined)=>(ids??[]).map(id=>links.get(id)).filter((x):x is PhotoRef=>!!x);

/** Throws unless every id is the owner's photo of that kind. */
export async function requireOwnPhotos(owner:string,ids:string[],kind:PhotoKind){
 if(!ids.length)return;
 const rows=checked(await adminDb().from('rider_photos').select('id').eq('user_id',owner).eq('kind',kind).in('id',ids)) as {id:string}[]|null;
 if((rows?.length??0)!==new Set(ids).size)throw new HttpError(400,'One of those photos could not be found. Add it again.');
}

export async function handleRiderPhotos(req:Request,path:string,method:string,url:URL,owner:string,db:SupabaseClient):Promise<Response|null>{
 if(!path.startsWith('/api/photos'))return null;
 const admin=adminDb();
 if(path==='/api/photos/upload'&&method==='POST'){
  const data=photoUploadSchema.parse(await readJson(req));
  if(data.kind==='bike'&&!data.bike_id)throw new HttpError(400,'Choose the bike for this photo');
  if(data.bike_id){const bike=checked(await db.from('bikes').select('id').eq('id',data.bike_id).eq('user_id',owner).maybeSingle());if(!bike)throw new HttpError(404,'Bike not found');}
  const existing=checked(await admin.from('rider_photos').select('id').eq('user_id',owner).eq('kind',data.kind).limit(LIMITS[data.kind]+1)) as unknown[]|null;
  if((existing?.length??0)>=LIMITS[data.kind])throw new HttpError(409,data.kind==='bike'?'This bike has as many photos as it can hold. Delete one to add another.':'Photo limit reached. Delete some older photos to add more.');
  const id=crypto.randomUUID(),storage_path=`${owner}/${data.kind}/${id}.${EXT[data.content_type]}`;
  checked(await admin.from('rider_photos').insert({id,user_id:owner,kind:data.kind,bike_id:data.bike_id,storage_path,content_type:data.content_type,width:data.width,height:data.height}));
  const signed=await admin.storage.from(PHOTO_BUCKET).createSignedUploadUrl(storage_path);
  if(signed.error||!signed.data)throw new HttpError(503,'Upload could not be started');
  return json({id,path:storage_path,token:signed.data.token},201);
 }
 if(path==='/api/photos'&&method==='GET'){
  const kind=z.enum(PHOTO_KINDS).parse(url.searchParams.get('kind')??'bike');
  let query=db.from('rider_photos').select('id,bike_id,created_at').eq('user_id',owner).eq('kind',kind).order('created_at',{ascending:false}).limit(100);
  const bike=url.searchParams.get('bike_id');if(bike)query=query.eq('bike_id',z.string().uuid().parse(bike));
  const rows=(checked(await query)??[]) as {id:string;bike_id:string|null;created_at:string}[];
  const links=await photoLinks(rows.map(r=>r.id));
  return json(rows.filter(r=>links.has(r.id)).map(r=>({...links.get(r.id)!,bike_id:r.bike_id,created_at:r.created_at})));
 }
 if(path==='/api/photos'&&method==='DELETE'){
  const id=z.string().uuid().parse(url.searchParams.get('id'));
  const row=checked(await admin.from('rider_photos').select('storage_path').eq('id',id).eq('user_id',owner).maybeSingle()) as {storage_path:string}|null;
  if(!row)throw new HttpError(404,'Photo not found');
  await admin.storage.from(PHOTO_BUCKET).remove([row.storage_path]);
  checked(await admin.from('rider_photos').delete().eq('id',id).eq('user_id',owner));
  return json({deleted:true});
 }
 return null;
}
