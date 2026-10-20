// A rider's own manual: private to that rider, used only in that rider's chats for that bike. Never shared or reused.
import {z} from 'zod';
import type {SupabaseClient} from '@supabase/supabase-js';
import {adminDb} from './database.ts';
import {HttpError,readJson} from './validation.ts';

const BUCKET='rider-manuals';
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const checked=<T>(r:{data:T;error:unknown}):T=>{if(r.error)throw new HttpError(503,'Your manual could not be reached right now');return r.data;};
const uploadSchema=z.object({bike_id:z.string().uuid(),file_name:z.string().min(1).max(200),bytes:z.number().int().min(1).max(209715200)}).strict();
const idSchema=z.object({id:z.string().uuid()}).strict();

/** Words worth searching for: drops filler so "what's the torque on the rear axle nut" finds the torque table. */
const STOP=new Set('a an the and or of to in on for is it its it\'s my me i im what whats how do does should can at with this that be are was from by as when which where why you your much many any about'.split(' '));
export function manualQuery(text:string){
 const words=[...new Set((text.toLowerCase().match(/[a-z0-9][a-z0-9-]{1,}/g)??[]).filter(w=>!STOP.has(w)))].slice(0,14);
 return words.join(' or ');
}

/** Cleans a PDF page's text: collapses spacing and drops lines that are only a repeated watermark or page furniture. */
export function cleanPage(text:string){return text.replace(/\s+/g,' ').trim().slice(0,6000);}

export async function riderManualExcerpts(userId:string,bikeId:string,message:string,lookups:string[]=[]){
 const q=manualQuery([message,...lookups].join(' '));if(!q)return [];
 const r=await adminDb().rpc('search_rider_manual',{p_user:userId,p_bike:bikeId,p_query:q,p_limit:4});
 if(r.error||!Array.isArray(r.data))return [];
 return (r.data as {page:number;body:string}[]).map(p=>({page:p.page,text:p.body.slice(0,2500)}));
}

export async function handleRiderManuals(req:Request,path:string,method:string,url:URL,owner:string,db:SupabaseClient):Promise<Response|null>{
 if(!path.startsWith('/api/rider-manuals'))return null;
 const admin=adminDb();
 if(path==='/api/rider-manuals'&&method==='GET'){
  const bike=z.string().uuid().parse(url.searchParams.get('bike_id'));
  return json(checked(await db.from('rider_manuals').select('id,file_name,pages,status,reason,created_at').eq('user_id',owner).eq('bike_id',bike).order('created_at',{ascending:false})));
 }
 if(path==='/api/rider-manuals'&&method==='DELETE'){
  const id=z.string().uuid().parse(url.searchParams.get('id'));
  const row=checked(await admin.from('rider_manuals').select('storage_path').eq('id',id).eq('user_id',owner).maybeSingle()) as {storage_path:string}|null;
  if(!row)throw new HttpError(404,'Manual not found');
  await admin.storage.from(BUCKET).remove([row.storage_path]);
  checked(await admin.from('rider_manuals').delete().eq('id',id).eq('user_id',owner));
  return json({deleted:true});
 }
 if(path==='/api/rider-manuals/upload'&&method==='POST'){
  const data=uploadSchema.parse(await readJson(req));
  const bike=checked(await db.from('bikes').select('id').eq('id',data.bike_id).eq('user_id',owner).maybeSingle());
  if(!bike)throw new HttpError(404,'Bike not found');
  const count=checked(await admin.from('rider_manuals').select('id').eq('user_id',owner)) as unknown[];
  if((count?.length??0)>=20)throw new HttpError(409,'You can keep up to 20 manuals. Delete one to add another.');
  const id=crypto.randomUUID(),storage_path=`${owner}/${id}.pdf`;
  checked(await admin.from('rider_manuals').insert({id,user_id:owner,bike_id:data.bike_id,file_name:data.file_name,bytes:data.bytes,storage_path}));
  const signed=await admin.storage.from(BUCKET).createSignedUploadUrl(storage_path);
  if(signed.error||!signed.data)throw new HttpError(503,'Upload could not be started');
  return json({id,path:storage_path,token:signed.data.token},201);
 }
 if(path==='/api/rider-manuals/process'&&method==='POST'){
  const {id}=idSchema.parse(await readJson(req));
  const row=checked(await admin.from('rider_manuals').select('*').eq('id',id).eq('user_id',owner).maybeSingle()) as {id:string;storage_path:string;status:string}|null;
  if(!row)throw new HttpError(404,'Manual not found');
  if(row.status==='READY')return json({id,status:'READY'});
  const fail=async(reason:string)=>{checked(await admin.from('rider_manuals').update({status:'FAILED',reason}).eq('id',id));return json({id,status:'FAILED',reason});};
  checked(await admin.from('rider_manuals').update({status:'READING',reason:null}).eq('id',id));
  const file=await admin.storage.from(BUCKET).download(row.storage_path);
  if(file.error||!file.data)return fail('The file did not finish uploading. Try again.');
  const bytes=new Uint8Array(await file.data.arrayBuffer());
  if(String.fromCharCode(...bytes.slice(0,5))!=='%PDF-')return fail('That file is not a PDF.');
  let pages:{page:number;body:string}[]=[],total=0;
  try{
   const {getDocumentProxy}=await import('unpdf');
   const pdf=await getDocumentProxy(bytes);total=pdf.numPages;
   for(let i=1;i<=Math.min(total,900);i++){const p=await pdf.getPage(i),c=await p.getTextContent();const body=cleanPage((c.items as {str?:string}[]).map(t=>t.str??'').join(' '));if(body.length>40)pages.push({page:i,body});}
  }catch{return fail('The PDF could not be read. It may be damaged or password protected.');}
  if(pages.length<3)return fail('This PDF has almost no readable text (it may be photos of pages). Upload a text-searchable copy.');
  await admin.from('rider_manual_pages').delete().eq('manual_id',id);
  for(let i=0;i<pages.length;i+=60){const r=await admin.from('rider_manual_pages').insert(pages.slice(i,i+60).map(p=>({manual_id:id,user_id:owner,page:p.page,body:p.body})));if(r.error)return fail('Your manual could not be saved. Try again.');}
  checked(await admin.from('rider_manuals').update({status:'READY',pages:total,ready_at:new Date().toISOString()}).eq('id',id));
  return json({id,status:'READY',pages:total});
 }
 return null;
}
