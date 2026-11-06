// Action-sports photo edits. The rider picks one of their own photos and a look; the image model regrades it (light,
// colour, contrast, sharpness only: never the rider, bike, numbers or scene) and the result is saved as a new photo of
// theirs, ready for a post. The original is never changed. Each edit is counted before it runs and handed back if it fails.
import {z} from 'zod';
import type {SupabaseClient} from '@supabase/supabase-js';
import {adminDb} from './database.ts';
import {HttpError,readJson} from './validation.ts';
import {photoLinks,PHOTO_BUCKET} from './rider-photos.ts';
import {hasPaidAccess,stripe} from './billing.ts';
import {creditPacks,resolveTier,unlimitedAccess,UNLIMITED_EDITS} from './plans.ts';
import {allowanceSince,editAllowance,editPrompt,EDIT_STYLES,type EditAllowance,type EditUsage} from '../shared/photo-edit.ts';
import type {Tier} from '../shared/plans.ts';

const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const editSchema=z.object({photo_id:z.string().uuid(),style:z.enum(EDIT_STYLES),request_id:z.string().uuid()}).strict();

async function tierOf(owner:string):Promise<Tier>{return await hasPaidAccess(owner)?await resolveTier(owner):'free';}
/** The rider's allowance; team accounts get a monthly set large enough to never meet. */
async function allowanceOf(owner:string,tier:Tier):Promise<EditAllowance>{return await unlimitedAccess(owner)?{period:'month',included:UNLIMITED_EDITS}:editAllowance(tier,process.env);}

/** Which of these photos are Action edits, so posts can say "Edited" (riders should know a photo was regraded by AI). */
export async function editedPhotos(ids:string[]):Promise<Set<string>>{
 const unique=[...new Set(ids.filter(Boolean))];if(!unique.length)return new Set();
 const rows=(await adminDb().from('photo_edits').select('result_photo_id').in('result_photo_id',unique).eq('status','done')).data as {result_photo_id:string}[]|null;
 return new Set((rows??[]).map(r=>r.result_photo_id));
}
export async function editUsage(owner:string,tier?:Tier,store=false):Promise<EditUsage>{
 const t=tier??await tierOf(owner),a=await allowanceOf(owner,t),admin=adminDb();
 const [used,bal]=await Promise.all([
  admin.from('photo_edits').select('id',{count:'exact',head:true}).eq('user_id',owner).eq('funded_by','included').neq('status','failed').gte('created_at',allowanceSince(a)),
  admin.rpc('photo_edit_credit_balance',{p_user_id:owner})]);
 if(used.error||bal.error)throw new HttpError(503,'Photo edits could not be checked right now');
 const n=used.count??0;let packs:EditUsage['packs']=[...creditPacks(store?process.env.PHOTO_EDIT_PACKS_STORE:process.env.STRIPE_PHOTO_EDIT_PRICES)].map(([id,edits])=>({id,edits}));
 // On the web a pack is shown only with its real Stripe price; the phone asks the App Store for its own price.
 if(!store&&packs.length){const s=stripe();packs=(await Promise.all(packs.map(async p=>{try{const pr=await s.prices.retrieve(p.id);return pr.active&&!pr.recurring&&pr.unit_amount!==null?{...p,price:new Intl.NumberFormat('en-US',{style:'currency',currency:pr.currency.toUpperCase()}).format(pr.unit_amount/100)}:null;}catch{return null;}}))).filter((p):p is NonNullable<typeof p>=>!!p);}
 return {tier:t,period:a.period,included:a.included,used:n,left:Math.max(0,a.included-n),credits:Number(bal.data)||0,packs};
}

export async function runEdit(source:Blob,style:typeof EDIT_STYLES[number]):Promise<Uint8Array>{
 const key=process.env.OPENAI_API_KEY;if(!key)throw new HttpError(503,'Photo edits are not set up yet');
 const form=new FormData();
 form.append('model',process.env.PHOTO_EDIT_MODEL||'gpt-image-2');
 form.append('image',source,'photo.'+(source.type.split('/')[1]||'jpg'));
 form.append('prompt',editPrompt(style));
 form.append('quality',process.env.PHOTO_EDIT_QUALITY||'medium');
 form.append('size','auto');
 form.append('output_format','jpeg');
 form.append('n','1');
 const r=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',headers:{Authorization:'Bearer '+key},body:form,signal:AbortSignal.timeout(95_000)});
 const body=await r.json().catch(()=>null) as {data?:{b64_json?:string}[];error?:{message?:string;code?:string}}|null;
 if(!r.ok||!body?.data?.[0]?.b64_json){
  // A photo the model refuses (its own safety checks) is not the rider's fault and is not charged.
  if(body?.error?.code==='moderation_blocked')throw new HttpError(422,'This photo could not be edited. Try another one.');
  throw new HttpError(502,'The photo edit did not finish. Nothing was used; try again.');
 }
 return Uint8Array.from(atob(body.data[0].b64_json),c=>c.charCodeAt(0));
}

export async function handlePhotoEdits(req:Request,path:string,method:string,url:URL,owner:string,_db:SupabaseClient):Promise<Response|null>{
 if(!path.startsWith('/api/photo-edits'))return null;
 if(path==='/api/photo-edits/usage'&&method==='GET')return json(await editUsage(owner,undefined,url.searchParams.get('store')==='1'));
 if(path!=='/api/photo-edits'||method!=='POST')return null;
 const data=editSchema.parse(await readJson(req)),admin=adminDb();
 const src=(await admin.from('rider_photos').select('id,storage_path,content_type,width,height').eq('id',data.photo_id).eq('user_id',owner).maybeSingle()).data as {id:string;storage_path:string;content_type:string;width:number|null;height:number|null}|null;
 if(!src)throw new HttpError(404,'That photo could not be found. Add it again.');
 const tier=await tierOf(owner),a=await allowanceOf(owner,tier);
 // An edit cut off by the server time limit never finished: hand it back so it does not use up the allowance.
 const stale=(await admin.from('photo_edits').select('request_id').eq('user_id',owner).eq('status','pending').lt('created_at',new Date(Date.now()-150_000).toISOString()).limit(5)).data as {request_id:string}[]|null;
 for(const r of stale??[])await admin.rpc('refund_photo_edit',{p_request_id:r.request_id});
 const reserved=await admin.rpc('reserve_photo_edit',{p_user_id:owner,p_request_id:data.request_id,p_limit:a.included,p_since:allowanceSince(a),p_source:src.id,p_style:data.style});
 if(reserved.error)throw new HttpError(503,'Photo edits could not be checked right now');
 if(reserved.data==='duplicate'){
  // The same request again (the app lost the connection and asked again): hand back the finished edit, say it failed
  // (it was handed back already), or, for one stuck past the server time limit, hand it back now.
  const done=(await admin.from('photo_edits').select('result_photo_id,status,created_at').eq('request_id',data.request_id).eq('user_id',owner).maybeSingle()).data as {result_photo_id:string|null;status:string;created_at:string}|null;
  if(done?.result_photo_id){const p=(await photoLinks([done.result_photo_id])).get(done.result_photo_id);if(p)return json({photo:p,usage:await editUsage(owner,tier)});}
  if(done?.status==='pending'&&Date.now()-new Date(done.created_at).getTime()>150_000)await admin.rpc('refund_photo_edit',{p_request_id:data.request_id});
  if(done?.status!=='pending'||Date.now()-new Date(done.created_at).getTime()>150_000)throw new HttpError(410,'That edit did not finish and nothing was used. Tap Make it again.');
  throw new HttpError(409,'That edit is still running. Give it a moment.');
 }
 if(reserved.data==='limit')throw new HttpError(402,tier==='free'?'You have used your 3 free photo edits. Pro includes 15 a month, or buy a pack of edits.':`You have used this month's ${a.included} photo edits. Buy a pack of edits to keep going.`);
 try{
  const file=await admin.storage.from(PHOTO_BUCKET).download(src.storage_path);
  if(file.error||!file.data)throw new HttpError(404,'That photo could not be read. Add it again.');
  const out=await runEdit(file.data,data.style);
  const id=crypto.randomUUID(),storage_path=`${owner}/post/${id}.jpg`;
  const up=await admin.storage.from(PHOTO_BUCKET).upload(storage_path,out,{contentType:'image/jpeg',upsert:false});
  if(up.error)throw new HttpError(503,'The edited photo could not be saved. Nothing was used; try again.');
  const row=await admin.from('rider_photos').insert({id,user_id:owner,kind:'post',bike_id:null,storage_path,content_type:'image/jpeg',width:src.width,height:src.height});
  if(row.error)throw new HttpError(503,'The edited photo could not be saved. Nothing was used; try again.');
  await admin.rpc('finish_photo_edit',{p_request_id:data.request_id,p_result:id});
  const photo=(await photoLinks([id])).get(id);
  return json({photo,usage:await editUsage(owner,tier)},201);
 }catch(e){
  // Failed edits never count: the allowance slot opens again and a spent credit comes back.
  await admin.rpc('refund_photo_edit',{p_request_id:data.request_id});
  throw e instanceof HttpError?e:new HttpError(502,'The photo edit did not finish. Nothing was used; try again.');
 }
}
