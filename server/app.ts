import {handleRiderManuals,riderManualExcerpts} from './rider-manuals.ts';
import {handleRiderPhotos,photoLinks,pick,requireOwnPhotos,PHOTO_BUCKET} from './rider-photos.ts';
import {createInput,createRecord} from './create-record.ts';
import {aiAccessMode} from './ai-access.ts';
import {getBikeClaims,searchBikeClaims} from './claims.ts';
import {bikeKnowledge,comparisonKnowledge} from './knowledge.ts';
import {trackContext} from './tracks.ts';
import {handleCoaching,coachingHistory,beforeClip} from './coaching.ts';
import {collectPages} from './pagination.ts';
import {ZodError} from 'zod';
import type {Bike,Claim,Message} from '../shared/types.ts';
import {authenticate,adminDb,checked,configured} from './database.ts';
import {HttpError,readJson,bikeSchema,serviceSchema,conversationSchema,chatSchema,uuid} from './validation.ts';
import {applicableClaims,generateAnswer,planSpecLookups,raceLookups,PROMPT_VERSION,type RiderPreferences} from './engineering.ts';
import type {SupabaseClient} from '@supabase/supabase-js';
import {handleBilling,hasPaidAccess,prepareAccountDeletion} from './billing.ts';
import {resolveTier,usageFor,reserveQuestion,ensureTrial,startNextTrialSet} from './plans.ts';
import {limitMessage} from '../shared/plans.ts';
import {handleMobileBilling} from './mobile-billing.ts';
import {handleRiderSurfaces} from './rider-surfaces.ts';
import {handleModeration} from './moderation.ts';
import {handleEval} from './eval-access.ts';
import {proceduresForBike} from '../shared/procedures.ts';
import {exactBikeScope} from '../shared/bike-identity.ts';
export function json(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
/** The first validation problem in plain words when we wrote it ("An event cannot end before it starts"); zod's own
 *  wording ("Required", "Invalid uuid") becomes a plain prompt instead. */
export function friendlyIssue(e:ZodError){const m=e.issues[0]?.message??'';return m&&!/^(Required|Invalid|Expected|String must|Number must|Array must|Unrecognized|Too (small|big))/i.test(m)?m:'Some details are missing or not valid. Check the form and try again.';}
/** The rider's answer preferences, or null (BAK's defaults) when none are saved or they can't be read. */
async function riderPreferences(db:SupabaseClient,owner:string):Promise<RiderPreferences|null>{try{const {data}=await db.from('rider_preferences').select('units,answer_length,tone').eq('user_id',owner).maybeSingle();return (data as RiderPreferences|null)??null;}catch{return null;}}
export async function handleRequest(req:Request):Promise<Response>{try{return await route(req);}catch(e){if(e instanceof ZodError)return json({error:friendlyIssue(e),issues:e.issues.map(i=>({path:i.path,message:i.message}))},400);if(e instanceof HttpError)return json({error:e.message},e.status);return json({error:'Service temporarily unavailable'},503);}}
async function route(req:Request):Promise<Response>{const url=new URL(req.url),originalPath=url.pathname.replace(/\/$/,''),method=req.method;
 let path=originalPath;
 if(path==='/api/services')path='/api/service-events';
 if(path==='/api/messages')path='/api/conversations/'+uuid.parse(url.searchParams.get('conversation_id'))+'/messages';
 if(path==='/api/bikes'&&(method==='PATCH'||method==='DELETE'))path='/api/bikes/'+uuid.parse(url.searchParams.get('id'));
 if(path==='/api/service-events'&&method==='DELETE')path+='/'+uuid.parse(url.searchParams.get('id'));
 if(path==='/api/conversations'&&method==='DELETE')path+='/'+uuid.parse(url.searchParams.get('id'));
 if(path==='/api/health'&&method==='GET'){const ready=configured()&&Boolean(process.env.OPENAI_API_KEY&&process.env.OPENAI_MODEL);return json({status:ready?'configured':'not_ready',ready,live_dependencies_verified:false},ready?200:503);}
 if((path==='/api/billing/webhook'&&method==='POST')||(path==='/api/billing/price'&&method==='GET')||(path==='/api/billing/plans'&&method==='GET')){return await handleBilling(req,null,null)??json({error:'Not found'},404);}
 if(path==='/api/mobile/webhook'&&method==='POST')return await handleMobileBilling(req,null)??json({error:'Not found'},404);
 if(path==='/api/eval/ask'&&method==='POST')return await handleEval(req);
 const {db,user,token}=await authenticate(req);
 if(path.startsWith('/api/mobile/'))return await handleMobileBilling(req,user)??json({error:'Not found'},404);
 if(path.startsWith('/api/billing/')){return await handleBilling(req,user,db)??json({error:'Not found'},404);}
 const owner=user.id;
 {const manuals=await handleRiderManuals(req,path,method,url,owner,db);if(manuals)return manuals;}
 {const photos=await handleRiderPhotos(req,path,method,url,owner,db);if(photos)return photos;}
 {const coaching=await handleCoaching(req,path,method,url,owner,db);if(coaching)return json(coaching);}
 if(path==='/api/bikes'){
  if(method==='GET')return json(checked(await db.from('bikes').select('*').eq('user_id',owner).order('created_at',{ascending:false})));
  if(method==='POST'){const input=createInput(await readJson(req)),data=bikeSchema.parse(input.data),saved=await createRecord(db,'bikes',owner,data,input.id);return json(saved.record,saved.replayed?200:201);}
 }
 const bikeMatch=path.match(/^\/api\/bikes\/([^/]+)$/);
 if(bikeMatch){const id=uuid.parse(bikeMatch[1]);if(method==='PUT'||method==='PATCH'){const data=bikeSchema.parse(await readJson(req));const bike=checked(await db.from('bikes').update({...data,updated_at:new Date().toISOString()}).eq('id',id).eq('user_id',owner).select().maybeSingle());if(!bike)throw new HttpError(404,'Bike not found');return json(bike);}if(method==='DELETE'){const rows=checked(await db.from('bikes').delete().eq('id',id).eq('user_id',owner).select('id'));if(!rows?.length)throw new HttpError(404,'Bike not found');return json({deleted:true});}}
 if(path==='/api/service-events'){
  if(method==='GET'){let query=db.from('service_events').select('*').eq('user_id',owner).order('performed_at',{ascending:false});if(url.searchParams.has('bike_id'))query=query.eq('bike_id',uuid.parse(url.searchParams.get('bike_id')));return json(checked(await query));}
  if(method==='POST'){const input=createInput(await readJson(req)),data=serviceSchema.parse(input.data);const bike=checked(await db.from('bikes').select('id').eq('id',data.bike_id).eq('user_id',owner).maybeSingle());if(!bike)throw new HttpError(404,'Bike not found');const saved=await createRecord(db,'service_events',owner,data,input.id);return json(saved.record,saved.replayed?200:201);}
 }
 const serviceMatch=path.match(/^\/api\/service-events\/([^/]+)$/);if(serviceMatch&&method==='DELETE'){const rows=checked(await db.from('service_events').delete().eq('id',uuid.parse(serviceMatch[1])).eq('user_id',owner).select('id'));if(!rows?.length)throw new HttpError(404,'Service event not found');return json({deleted:true});}
 if(path==='/api/conversations'){
  if(method==='GET'){let query=db.from('conversations').select('*').eq('user_id',owner).order('updated_at',{ascending:false});if(url.searchParams.get('bike_id')==='none')query=query.is('bike_id',null);else if(url.searchParams.has('bike_id'))query=query.eq('bike_id',uuid.parse(url.searchParams.get('bike_id')));return json(checked(await query));}
  if(method==='POST'){const input=createInput(await readJson(req)),data=conversationSchema.parse(input.data);if(data.bike_id){const bike=checked(await db.from('bikes').select('id').eq('id',data.bike_id).eq('user_id',owner).maybeSingle());if(!bike)throw new HttpError(404,'Bike not found');}const saved=await createRecord(db,'conversations',owner,data,input.id);return json(saved.record,saved.replayed?200:201);}
 }
 const convMatch=path.match(/^\/api\/conversations\/([^/]+)(\/messages)?$/);if(convMatch){const id=uuid.parse(convMatch[1]);if(convMatch[2]&&method==='GET'){const conversation=checked(await db.from('conversations').select('id').eq('id',id).eq('user_id',owner).maybeSingle());if(!conversation)throw new HttpError(404,'Conversation not found');const rows=await collectPages<Message&{photo_ids?:string[]}>((from,to)=>db.from('messages').select('*',{count:'exact'}).eq('conversation_id',id).eq('user_id',owner).order('created_at',{ascending:true}).order('role',{ascending:false}).order('id',{ascending:true}).range(from,to),{label:'Conversation history',key:r=>r.id});const links=await photoLinks(rows.flatMap(r=>r.photo_ids??[]));return json(rows.map(r=>r.photo_ids?.length?{...r,photos:pick(links,r.photo_ids)}:r));}if(!convMatch[2]&&method==='DELETE'){const rows=checked(await db.from('conversations').delete().eq('id',id).eq('user_id',owner).select('id'));if(!rows?.length)throw new HttpError(404,'Conversation not found');return json({deleted:true});}}
 async function getClaims(bike:Bike){return getBikeClaims(db,bike);}
 if(path==='/api/coverage'&&method==='GET'){const id=uuid.parse(url.searchParams.get('bike_id'));const bike=checked(await db.from('bikes').select('*').eq('id',id).eq('user_id',owner).maybeSingle()) as Bike|null;if(!bike)throw new HttpError(404,'Bike not found');const scope={...exactBikeScope(bike),status:'VERIFIED',has_conflict:false};const count=async(filter?:(q:any)=>any)=>{let q=db.from('claims').select('id',{count:'exact',head:true}).match(scope);if(filter)q=filter(q);const r=await q;if(r.error||r.count===null)throw new HttpError(503,'Coverage could not be read');return r.count;};const [specs,suspension,torque,catalogs]=await Promise.all([count(),count(q=>q.or('domain.eq.suspension,property.in.(compression_damping,rebound_damping,low_speed_compression,high_speed_compression,rider_sag,static_sag,spring_rate,air_pressure)')),count(q=>q.or('property.eq.torque,statement.ilike.*Nm*,statement.ilike.*N·m*')),db.from('part_catalogs').select('complete,part_count').match(exactBikeScope(bike)).order('complete',{ascending:false}).limit(1)]);const catalog=(checked(catalogs) as {complete:boolean;part_count:number}[]|null)?.[0]??null;return json({specs,suspension_settings:suspension,torque_values:torque,parts_catalog:catalog?{complete:catalog.complete,part_count:catalog.part_count}:null,workshop_guides:proceduresForBike(bike).length});}
 if(path==='/api/claims/search'&&method==='GET'){const id=uuid.parse(url.searchParams.get('bike_id')),query=(url.searchParams.get('q')??'').trim().slice(0,200);const bike=checked(await db.from('bikes').select('*').eq('id',id).eq('user_id',owner).maybeSingle()) as Bike|null;if(!bike)throw new HttpError(404,'Bike not found');return json(query?await searchBikeClaims(db,bike,[query]):[]);}
 if(path==='/api/claims'&&method==='GET'){const id=uuid.parse(url.searchParams.get('bike_id'));const bike=checked(await db.from('bikes').select('*').eq('id',id).eq('user_id',owner).maybeSingle()) as Bike|null;if(!bike)throw new HttpError(404,'Bike not found');const claims=await getClaims(bike);return json(claims);}
 if(path==='/api/entitlement'&&method==='GET'){
  const [web,store]=await Promise.all([db.from('subscriptions').select('status,current_period_end,cancel_at_period_end').eq('user_id',owner).maybeSingle(),db.from('mobile_entitlements').select('status,current_period_end,store').eq('user_id',owner).maybeSingle()]);
  const native=checked(store),website=checked(web);
  if(native?.status==='active'&&native.current_period_end&&Date.parse(native.current_period_end)>Date.now())return json({...native,cancel_at_period_end:false,billing_provider:'store'});
  return json({...website??{status:'none',current_period_end:null,cancel_at_period_end:false},billing_provider:'web'});
 }
 if(path==='/api/usage'&&method==='GET'){
  // Plan, today's included questions and credit balance. Paid status is refreshed from the provider first when it is stale.
  const tier=await hasPaidAccess(owner)?await resolveTier(owner):'free',mode=aiAccessMode();await ensureTrial(owner,tier);return json({...await usageFor(owner,tier,mode),access_mode:mode});
 }
 if(path==='/api/usage/next-set'&&method==='POST'){
  const tier=await hasPaidAccess(owner)?await resolveTier(owner):'free';if(tier!=='free')throw new HttpError(409,'Free question sets are part of the Free plan.');
  const n=await startNextTrialSet(owner);if(n===-1)throw new HttpError(409,'You still have questions left in this set.');if(n===0)throw new HttpError(409,"You've used all your free sets. Add a credit pack or choose a plan to keep asking BAK.");
  return json({...await usageFor(owner,tier,aiAccessMode()),started_set:n});
 }
 if(path==='/api/chat'&&method==='POST'){
  const data=chatSchema.parse(await readJson(req));const admin=adminDb();
  checked(await admin.from('ai_requests').update({state:'failed',error_code:'worker_timeout',completed_at:new Date().toISOString()}).eq('user_id',owner).eq('state','processing').lt('created_at',new Date(Date.now()-300000).toISOString()));
  const existing=checked(await admin.from('ai_requests').select('user_id,conversation_id,input,state,response,assistant_message_id').eq('request_id',data.request_id).maybeSingle());
  if(existing){if(existing.user_id!==owner||existing.conversation_id!==data.conversation_id||existing.input!==data.message)throw new HttpError(409,'Request ID was already used');if(existing.state==='complete'){const message=checked(await db.from('messages').select('*').eq('id',existing.assistant_message_id).eq('user_id',owner).single());return json({request_id:data.request_id,response:existing.response,message});}if(existing.state==='processing')throw new HttpError(409,'This request is still processing. Check conversation history before retrying.');}
  // A request recorded as failed produced no answer, so the same rider sending the same question again is a retry, not a duplicate. It is re-run under the same ID.
  const rerun=Boolean(existing);
  if(!process.env.OPENAI_API_KEY||!process.env.OPENAI_MODEL)throw new HttpError(503,'AI is not configured');
  // Plan rules: Free riders use their trial sets and any credits; Premium and Pro get their daily allowance, then credits.
  const paid=await hasPaidAccess(owner),tier=paid?await resolveTier(owner):'free',mode=aiAccessMode();await ensureTrial(owner,tier);
  const conversation=checked(await db.from('conversations').select('*').eq('id',data.conversation_id).eq('user_id',owner).maybeSingle());if(!conversation)throw new HttpError(404,'Conversation not found');
  const photoIds=data.photo_ids??[];await requireOwnPhotos(owner,photoIds,'chat');
  // A conversation without a build is a general question: no saved bike, no published-value lookup.
  const bike=conversation.bike_id?checked(await db.from('bikes').select('*').eq('id',conversation.bike_id).eq('user_id',owner).single()) as Bike:null;
  // Context is bounded explicitly; do not silently drop previous tests or imply complete continuity.
  const history=await collectPages<Message>((from,to)=>db.from('messages').select('*',{count:'exact'}).eq('conversation_id',data.conversation_id).eq('user_id',owner).order('created_at',{ascending:true}).order('role',{ascending:false}).order('id',{ascending:true}).range(from,to),{label:'Diagnostic context',maxBytes:120000,key:r=>r.id});
  if(JSON.stringify(history).length>120000)throw new HttpError(409,'This diagnostic conversation reached its context limit. Save the history and start a new conversation including prior tests and results.');
  const lock=rerun?await admin.from('ai_requests').update({state:'processing',error_code:null,completed_at:null,created_at:new Date().toISOString(),bike_snapshot:bike,claims_snapshot:[],photo_ids:photoIds,media:data.media??null,model:process.env.OPENAI_MODEL,prompt_version:PROMPT_VERSION}).eq('request_id',data.request_id).eq('user_id',owner).eq('state','failed'):await admin.from('ai_requests').insert({request_id:data.request_id,user_id:owner,conversation_id:data.conversation_id,input:data.message,state:'processing',bike_snapshot:bike,claims_snapshot:[],photo_ids:photoIds,media:data.media??null,model:process.env.OPENAI_MODEL,prompt_version:PROMPT_VERSION});
  if(lock.error){if(lock.error.code==='23505')throw new HttpError(409,'A request is already processing for this conversation');throw new HttpError(503,'Could not reserve request');}
  type Emit=(event:Record<string,unknown>)=>void;
  const run=async(emit:Emit)=>{
   /* A re-run was already counted against the allowance when it first ran ('duplicate'). */const reserved=await reserveQuestion(owner,data.request_id,tier,mode);if(reserved==='limit'||(reserved==='duplicate'&&!rerun))throw new HttpError(429,reserved==='limit'?limitMessage((await usageFor(owner,tier,mode))):'Daily AI allowance reached');
   emit({type:'status',stage:'specs'});
   const t0=Date.now();const lookups=bike?(data.race?raceLookups(data.message):await planSpecLookups(bike,history,data.message)):[];const t1=Date.now();const claims=bike?await searchBikeClaims(db,bike,lookups):[];const knowledge=bike?[...await bikeKnowledge(db,bike,data.message,lookups),...await comparisonKnowledge(db,bike,data.message)]:[];const t2=Date.now();
   checked(await admin.from('ai_requests').update({claims_snapshot:claims}).eq('request_id',data.request_id).eq('user_id',owner).eq('state','processing'));
   emit({type:'status',stage:'writing',published:claims.length});
   let sent=0;
   // what the rider tried and how it rode; a log that cannot be read never blocks the answer
   const setupHistory=bike?((await db.from('setup_logs').select('recorded_at,track,conditions,change_made,result,notes').eq('bike_id',bike.id).eq('user_id',owner).order('recorded_at',{ascending:false}).limit(8)).data??[]):[];
   const {response,raw}=await generateAnswer(bike,history,claims,data.message,lookups,draft=>{const size=draft.summary.length+draft.answer.length;if(size-sent<24)return;sent=size;emit({type:'draft',summary:draft.summary,answer:draft.answer});},setupHistory,knowledge,data.guided??null,data.voice===true,bike?await riderManualExcerpts(owner,bike.id,data.message,lookups):[],await (async()=>{const links=await photoLinks(photoIds,900);return photoIds.map(id=>links.get(id)?.url).filter((u):u is string=>!!u);})(),await trackContext(db,owner,[...(data.media?.track?[data.media.track]:[]),...(data.race?.track?[data.race.track]:[]),data.message,...history.filter(m=>m.role==='user').slice(-3).map(m=>m.content)]),data.media??null,data.media&&bike?{history:await coachingHistory(db,owner,bike.id,data.request_id),before:data.media.kind==='clip'&&data.media.compare_to?await beforeClip(owner,data.media.compare_to):null}:null,await riderPreferences(db,owner),data.race??null);
   emit({type:'status',stage:'checking'});
   checked(await admin.rpc('complete_ai_request',{p_user_id:owner,p_request_id:data.request_id,p_response:response,p_raw_output:{...raw,bakmx_plan_ms:t1-t0,bakmx_search_ms:t2-t1,bakmx_streamed:emit!==quiet}}));
   if(bike&&response.data_gaps?.length){const scope=exactBikeScope(bike);/* Best effort: a logging failure must not cost the rider a saved answer. */await admin.from('data_gaps').insert(response.data_gaps.map(gap=>({request_id:data.request_id,user_id:owner,...scope,gap:gap.slice(0,300)}))).then(()=>{},()=>{});}
   const done=checked(await admin.from('ai_requests').select('assistant_message_id').eq('request_id',data.request_id).single());const message=checked(await db.from('messages').select('*').eq('id',done!.assistant_message_id).eq('user_id',owner).single());
   return {request_id:data.request_id,response,message};
  };
  const quiet:Emit=()=>{};
  const fail=async(e:unknown)=>{const result=await admin.from('ai_requests').update({state:'failed',error_code:e instanceof HttpError?String(e.status)+((e as HttpError&{detail?:string}).detail?' '+(e as HttpError&{detail?:string}).detail:''):'provider_failure',completed_at:new Date().toISOString()}).eq('request_id',data.request_id).eq('user_id',owner).eq('state','processing');if(result.error)throw new HttpError(503,'Request state could not be saved; check history before resubmitting');};
  if((req.headers.get('Accept')||'').includes('application/x-ndjson')){
   // Live reply: one JSON object per line. The work continues to completion even if the rider's connection drops, so the saved answer is there when they return.
   const encoder=new TextEncoder();
   const body=new ReadableStream<Uint8Array>({start(controller){
    let open=true;const emit:Emit=event=>{if(!open)return;try{controller.enqueue(encoder.encode(JSON.stringify(event)+'\n'));}catch{open=false;}};
    void (async()=>{
     try{emit({type:'done',...await run(emit)});}
     catch(e){let message=e instanceof HttpError?e.message:'Service temporarily unavailable',status=e instanceof HttpError?e.status:503;try{await fail(e);}catch(saveError){if(saveError instanceof HttpError){message=saveError.message;status=saveError.status;}}emit({type:'error',status,error:message});}
     finally{if(open)try{controller.close();}catch{/* already closed */}}
    })();
   },cancel(){/* keep working; see above */}});
   return new Response(body,{status:200,headers:{'Content-Type':'application/x-ndjson; charset=utf-8','Cache-Control':'no-store, no-transform','X-Accel-Buffering':'no','X-Content-Type-Options':'nosniff'}});
  }
  try{return json(await run(quiet));}
  catch(e){await fail(e);throw e;}
 }
 if(path==='/api/receipts'&&method==='POST'){const data=await readJson(req);const id=uuid.parse(data?.request_id??data?.message_id);const rows=checked(await adminDb().from('ai_requests').update({received_at:new Date().toISOString()}).eq(data?.request_id?'request_id':'assistant_message_id',id).eq('user_id',owner).eq('state','complete').select('request_id'));if(!rows?.length)throw new HttpError(404,'Completed request not found');return json({received:true});}
 if(path==='/api/account/export'&&method==='GET'){const tables=['bikes','service_events','conversations','messages','subscriptions','mobile_entitlements','setup_logs','posts','post_comments','events','feedback','rider_preferences'] as const;const entries=await Promise.all(tables.map(async t=>{const primaryKey=t==='subscriptions'||t==='mobile_entitlements'||t==='rider_preferences'?'user_id':'id';return [t,await collectPages((from,to)=>db.from(t).select('*',{count:'exact'}).eq('user_id',owner).order(primaryKey,{ascending:true}).range(from,to),{label:t,key:r=>r[primaryKey]})];}));const requests=await collectPages((from,to)=>adminDb().from('ai_requests').select('request_id,conversation_id,input,state,response,bike_snapshot,claims_snapshot,model,prompt_version,error_code,received_at,created_at,completed_at',{count:'exact'}).eq('user_id',owner).order('request_id',{ascending:true}).range(from,to),{label:'Request history',key:r=>r.request_id});if(Buffer.byteLength(JSON.stringify({entries,requests}),'utf8')>60000000)throw new HttpError(413,'Account export exceeds the download size limit. Contact support for a complete export.');return json({exported_at:new Date().toISOString(),user:{id:owner,email:user.email},...Object.fromEntries(entries),requests});}
 if(path==='/api/account'&&method==='DELETE'){const data=await readJson(req);if(data?.confirmation!=='DELETE')throw new HttpError(400,'Confirm deletion by sending DELETE');await prepareAccountDeletion(owner);const admin=adminDb();{const files=await admin.storage.from('rider-manuals').list(owner,{limit:100});if(files.data?.length)await admin.storage.from('rider-manuals').remove(files.data.map(f=>`${owner}/${f.name}`));}{const photos=(await admin.from('rider_photos').select('storage_path').eq('user_id',owner).limit(5000)).data as {storage_path:string}[]|null;for(let i=0;i<(photos?.length??0);i+=500)await admin.storage.from(PHOTO_BUCKET).remove(photos!.slice(i,i+500).map(p=>p.storage_path));}const signout=await admin.auth.admin.signOut(token,'global');if(signout.error)throw new HttpError(503,'Could not revoke sessions');const deleted=await admin.auth.admin.deleteUser(owner);if(deleted.error)throw new HttpError(503,'Could not delete account. Contact support before signing up again.');return json({deleted:true});}
 {const surface=await handleRiderSurfaces(req,url,path,method,db,owner);if(surface)return surface;}
 {const moderation=await handleModeration(req,path,method,owner);if(moderation)return moderation;}
 if(path==='/api/admin/requests'&&method==='GET'){const admin=adminDb();const member=checked(await admin.from('admin_memberships').select('user_id').eq('user_id',owner).maybeSingle());if(!member)throw new HttpError(403,'Administrator access required');checked(await admin.from('admin_access_log').insert({user_id:owner,action:'read_response_mirror'}));const requests=checked(await admin.from('ai_requests').select('*').order('created_at',{ascending:false}).limit(100));return json({requests});}
 return json({error:'Not found'},404);
}
