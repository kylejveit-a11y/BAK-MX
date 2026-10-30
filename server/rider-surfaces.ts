import type {SupabaseClient} from '@supabase/supabase-js';
import {photoLinks,pick,photoIds,requireOwnPhotos} from './rider-photos.ts';
import {z} from 'zod';
import {checked} from './database.ts';
import {readInstalled,systemLabel,partLabel} from '../shared/installed-parts.ts';
import {canonBrand,cleanName} from '../shared/parts-picker.ts';
import {collectPages} from './pagination.ts';
import {HttpError,readJson,uuid} from './validation.ts';
import {objectionable} from './content-rules.ts';
import {exactBikeScope} from '../shared/bike-identity.ts';
import {trackDirectory} from './tracks.ts';
import {buildServicePlan} from '../shared/service-plan.ts';
import type {Bike} from '../shared/types.ts';

/** Profile, community, events, messages, moderation, feedback, setup log and parts catalog.
 * Every query runs with the rider's own token, so row-level security is the authority;
 * the owner predicates here are a second check, not the only one. Paths are flat so the
 * same routes work behind the single serverless entry point. */

const text=(max:number)=>z.string().trim().min(1).max(max);
const optionalText=(max:number)=>z.string().trim().max(max).default('');
export const POST_CATEGORIES=['build','setup_question','ride_plan','general'] as const;
export const EVENT_TYPES=['ride_day','race','practice','clinic','meetup'] as const;
export const profileSchema=z.object({handle:z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,24}$/,'Use 3–24 lowercase letters, numbers or underscores'),display_name:optionalText(60),bio:optionalText(500),avatar_photo_id:z.string().uuid().nullable().optional(),location:optionalText(80),riding_class:optionalText(60),race_number:z.string().trim().regex(/^([0-9]{1,3})?$/,'Race number is 1 to 3 digits').optional(),accept_rules:z.literal(true).optional()}).strict();
export const preferencesSchema=z.object({units:z.enum(['us','metric']),answer_length:z.enum(['quick','full']),tone:z.enum(['straight','encouraging'])}).strict();
export const RACE_PHASES=['week','night','track','motos','after'] as const;
export const raceChecklistSchema=z.object({items:z.array(z.object({id:z.string().trim().min(1).max(64),label:z.string().trim().min(1).max(80),phase:z.enum(RACE_PHASES),custom:z.boolean().optional()}).strict()).max(200).nullable()}).strict();
export const DEFAULT_PREFERENCES={units:'us',answer_length:'full',tone:'straight'} as const;
export const postSchema=z.object({category:z.enum(POST_CATEGORIES),body:text(4000),bike_label:optionalText(120),photo_ids:photoIds(4)}).strict();
export const commentSchema=z.object({post_id:uuid,body:text(2000)}).strict();
const instant=z.string().refine(v=>Number.isFinite(Date.parse(v)),{message:'Use a valid date and time'}).transform(v=>new Date(v).toISOString());
export const eventSchema=z.object({title:text(120),event_type:z.enum(EVENT_TYPES),starts_at:instant,ends_at:instant.nullable().default(null),location_name:text(160),description:optionalText(4000)}).strict().refine(v=>!v.ends_at||v.ends_at>=v.starts_at,{message:'An event cannot end before it starts'});
export const rsvpSchema=z.object({event_id:uuid,status:z.enum(['going','interested'])}).strict();
export const messageSchema=z.object({recipient_id:uuid,body:text(4000)}).strict();
export const garageSharingSchema=z.object({bike_id:uuid,show_on_profile:z.boolean(),build_sheet_public:z.boolean().default(false),photo_ids:z.array(z.string().uuid()).max(8).default([])}).strict();
export const reportSchema=z.object({target_type:z.enum(['post','comment','event','message','profile']),target_id:uuid,reason:text(1000)}).strict();
export const feedbackSchema=z.object({category:z.enum(['bug','answer_quality','missing_data','idea','other']),body:text(4000),context:z.record(z.unknown()).default({})}).strict().refine(v=>JSON.stringify(v.context).length<=4000,{message:'Feedback context is too large'});
const hours=z.number().finite().min(0).max(100000).nullable().default(null);
export const setupLogSchema=z.object({bike_id:uuid,recorded_at:instant,track:optionalText(120),conditions:optionalText(200),engine_hours:hours,settings:z.record(z.union([z.string().max(200),z.number().finite(),z.null()])).default({}),change_made:optionalText(1000),result:z.enum(['better','worse','no_change','not_tested']).default('not_tested'),notes:optionalText(4000)}).strict().refine(v=>Object.keys(v.settings).length<=60,{message:'Too many settings in one entry'});

type Db=SupabaseClient;
type Row=Record<string,any>;
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const PAGE=30;
const none=Promise.resolve({data:[] as Row[],error:null});

/** Adds avatar_url (a short-lived signed link) in place of the stored photo id. */
async function withAvatars<T extends Row>(rows:T[]):Promise<T[]>{
 const links=await photoLinks(rows.map(r=>r.avatar_photo_id).filter(Boolean));
 return rows.map(({avatar_photo_id,...r})=>({...r,avatar_url:avatar_photo_id?links.get(avatar_photo_id)?.url??'':''}) as unknown as T);
}
async function profilesFor(db:Db,ids:string[]):Promise<Map<string,Row>>{
 const unique=[...new Set(ids)];if(!unique.length)return new Map();
 const rows=checked(await db.from('profiles').select('user_id,handle,display_name,location,riding_class,race_number,avatar_photo_id').in('user_id',unique)) as Row[]|null;
 return new Map((await withAvatars(rows??[])).map(r=>[r.user_id,r]));
}
async function requireProfile(db:Db,owner:string){
 const profile=checked(await db.from('profiles').select('user_id').eq('user_id',owner).maybeSingle());
 if(!profile)throw new HttpError(409,'Set up your rider profile before posting or messaging.');
}
const author=(profiles:Map<string,Row>,id:string)=>profiles.get(id)??{user_id:id,handle:'rider',display_name:'',location:'',riding_class:'',race_number:'',avatar_url:''};
/** First-pass screen on rider-written text; reports and blocks handle the rest. */
function screen(...texts:(string|null|undefined)[]){if(texts.some(t=>t&&objectionable(t)))throw new HttpError(422,'That wording isn’t allowed here. Edit it and try again.');}
function saveFailed(error:{code?:string}|null,conflict:string):never{
 if(error?.code==='23505'&&conflict)throw new HttpError(409,conflict);
 if(error?.code==='42501')throw new HttpError(403,'This action is not available for that rider or item.');
 throw new HttpError(503,'Could not save. Nothing was changed.');
}

const bikeLabel=(b:Row)=>[b.model_year,b.manufacturer,b.model].filter(Boolean).join(' ')+(b.nickname?` “${b.nickname}”`:'');
/** The bikes a rider shows on their profile, with their chosen photos and whether the build sheet is public. */
async function publicGarage(db:Db,rider:string,viewer:string){
 const {data,error}=await db.rpc('profile_garage',{p_user:rider});if(error||!Array.isArray(data))return [];
 const bikes=data as Row[];if(!bikes.length)return [];
 const links=await photoLinks(bikes.flatMap(b=>b.public_photo_ids??[]));
 return bikes.map(b=>({id:b.id,label:bikeLabel(b),manufacturer:b.manufacturer,model:b.model,model_year:b.model_year,nickname:b.nickname??'',photos:pick(links,b.public_photo_ids??[]),sheet:rider===viewer?'mine':b.build_sheet_public?'public':'private'}));
}

export async function handleRiderSurfaces(req:Request,url:URL,path:string,method:string,db:Db,owner:string):Promise<Response|null>{
 const q=(name:string)=>url.searchParams.get(name);
 const id=(name:string)=>uuid.parse(q(name));

 // ---- Profile
 if(path==='/api/profile'){
  if(method==='GET'){const row=checked(await db.from('profiles').select('*').eq('user_id',owner).maybeSingle()) as Row|null;return json(row?(await withAvatars([row]))[0]:null);}
  if(method==='PUT'){
   const {accept_rules,...data}=profileSchema.parse(await readJson(req));if(data.avatar_photo_id)await requireOwnPhotos(owner,[data.avatar_photo_id],'avatar');screen(data.handle,data.display_name,data.bio,data.location,data.riding_class);
   const existing=checked(await db.from('profiles').select('user_id').eq('user_id',owner).maybeSingle());
   const result=existing
    ?await db.from('profiles').update({...data,updated_at:new Date().toISOString()}).eq('user_id',owner).select().single()
    :accept_rules===true?await db.from('profiles').insert({...data,user_id:owner,accepted_rules_at:new Date().toISOString()}).select().single():(()=>{throw new HttpError(400,'Accept the community rules to create your profile.');})();
   if(result.error)saveFailed(result.error,'That handle is taken. Choose another.');
   return json((await withAvatars([result.data as Row]))[0]);
  }
 }
 if(path==='/api/profiles'&&method==='GET'){
  const rider=id('id');
  const found=checked(await db.from('profiles').select('user_id,handle,display_name,bio,location,riding_class,race_number,created_at,avatar_photo_id').eq('user_id',rider).maybeSingle()) as Row|null;const profile=found?(await withAvatars([found]))[0]:null;
  if(!profile)throw new HttpError(404,'Rider not found');
  const posts=(checked(await db.from('posts').select('id,category,body,bike_label,created_at,photo_ids').eq('user_id',rider).is('removed_at',null).order('created_at',{ascending:false}).limit(20))??[]) as Row[];
  const plinks=await photoLinks(posts.flatMap(p=>p.photo_ids??[]));
  return json({profile,posts:posts.map(({photo_ids,...p})=>({...p,photos:pick(plinks,photo_ids)})),bikes:await publicGarage(db,rider,owner),mine:rider===owner});
 }

 // ---- Service plan: the maker's own schedule for this exact bike, as reminder suggestions
 if(path==='/api/service-plan'&&method==='GET'){
  const bike=checked(await db.from('bikes').select('*').eq('id',id('bike_id')).eq('user_id',owner).maybeSingle()) as Bike|null;if(!bike)throw new HttpError(404,'Bike not found');
  const rows=checked(await db.from('claims').select('id,statement').match({...exactBikeScope(bike),status:'VERIFIED',domain:'maintenance'}).limit(400)) as {id:string;statement:string}[];
  return json({items:buildServicePlan(rows),source:rows.length?'manufacturer schedule':null});
 }
 // ---- Tracks BAK knows (race-day picker)
 if(path==='/api/tracks'&&method==='GET')return json(await trackDirectory(db as never));

 // ---- Preferences: how BAK answers (units, length, tone)
 if(path==='/api/preferences'){
  if(method==='GET'){const row=checked(await db.from('rider_preferences').select('units,answer_length,tone').eq('user_id',owner).maybeSingle()) as Row|null;return json(row??DEFAULT_PREFERENCES);}
  if(method==='PUT'){const data=preferencesSchema.parse(await readJson(req));const result=await db.from('rider_preferences').upsert({...data,user_id:owner,updated_at:new Date().toISOString()},{onConflict:'user_id'}).select('units,answer_length,tone').single();if(result.error)saveFailed(result.error,'');return json(result.data);}
 }

 // ---- Race prep checklist: the rider's own list (null = BAK's list for their riding)
 if(path==='/api/race-checklist'){
  if(method==='GET'){const row=checked(await db.from('rider_preferences').select('race_checklist').eq('user_id',owner).maybeSingle()) as Row|null;return json({items:row?.race_checklist??null});}
  if(method==='PUT'){const data=raceChecklistSchema.parse(await readJson(req));screen(...(data.items??[]).filter(i=>i.custom).map(i=>i.label));
   const result=await db.from('rider_preferences').upsert({user_id:owner,race_checklist:data.items,updated_at:new Date().toISOString()},{onConflict:'user_id'}).select('race_checklist').single();
   if(result.error)saveFailed(result.error,'');return json({items:result.data.race_checklist??null});}
 }

 // ---- Community
 if(path==='/api/posts'){
  if(method==='GET'){
   let query=db.from('posts').select('id,user_id,category,body,bike_label,created_at,photo_ids').is('removed_at',null).order('created_at',{ascending:false}).limit(PAGE);
   const category=q('category');if(category)query=query.eq('category',z.enum(POST_CATEGORIES).parse(category));
   const before=q('before');if(before)query=query.lt('created_at',instant.parse(before));
   const posts=(checked(await query)??[]) as Row[];
   const ids=posts.map(p=>p.id);
   const [profiles,likes,comments]=await Promise.all([
    profilesFor(db,posts.map(p=>p.user_id)),
    ids.length?db.from('post_likes').select('post_id,user_id').in('post_id',ids).limit(5000):none,
    ids.length?db.from('post_comments').select('post_id').in('post_id',ids).is('removed_at',null).limit(5000):none]);
   const likeRows=(checked(likes)??[]) as Row[],commentRows=(checked(comments)??[]) as Row[];
   const plinks=await photoLinks(posts.flatMap(p=>p.photo_ids??[]));
   return json(posts.map(({photo_ids,...p})=>({...p,photos:pick(plinks,photo_ids),author:author(profiles,p.user_id),mine:p.user_id===owner,like_count:likeRows.filter(l=>l.post_id===p.id).length,liked:likeRows.some(l=>l.post_id===p.id&&l.user_id===owner),comment_count:commentRows.filter(c=>c.post_id===p.id).length})));
  }
  if(method==='POST'){
   const data=postSchema.parse(await readJson(req));screen(data.body);await requireProfile(db,owner);await requireOwnPhotos(owner,data.photo_ids,'post');
   const result=await db.from('posts').insert({...data,user_id:owner}).select('id,user_id,category,body,bike_label,created_at').single();
   if(result.error)saveFailed(result.error,'This post already exists.');
   return json(result.data,201);
  }
  if(method==='DELETE'){
   const rows=checked(await db.from('posts').delete().eq('id',id('id')).eq('user_id',owner).select('id'));
   if(!rows?.length)throw new HttpError(404,'Post not found');return json({deleted:true});
  }
 }
 if(path==='/api/comments'){
  if(method==='GET'){
   const comments=(checked(await db.from('post_comments').select('id,post_id,user_id,body,created_at').eq('post_id',id('post_id')).is('removed_at',null).order('created_at',{ascending:true}).limit(200))??[]) as Row[];
   const profiles=await profilesFor(db,comments.map(c=>c.user_id));
   return json(comments.map(c=>({...c,author:author(profiles,c.user_id),mine:c.user_id===owner})));
  }
  if(method==='POST'){
   const data=commentSchema.parse(await readJson(req));screen(data.body);await requireProfile(db,owner);
   const result=await db.from('post_comments').insert({...data,user_id:owner}).select('id,post_id,user_id,body,created_at').single();
   if(result.error)saveFailed(result.error,'This comment already exists.');
   return json(result.data,201);
  }
  if(method==='DELETE'){
   const rows=checked(await db.from('post_comments').delete().eq('id',id('id')).eq('user_id',owner).select('id'));
   if(!rows?.length)throw new HttpError(404,'Comment not found');return json({deleted:true});
  }
 }
 if(path==='/api/likes'){
  const post=id('post_id');
  if(method==='PUT'){
   const result=await db.from('post_likes').insert({post_id:post,user_id:owner});
   if(result.error&&result.error.code!=='23505')saveFailed(result.error,'');
   return json({liked:true});
  }
  if(method==='DELETE'){checked(await db.from('post_likes').delete().eq('post_id',post).eq('user_id',owner));return json({liked:false});}
 }

 // ---- Events
 if(path==='/api/events'){
  if(method==='GET'){
   const past=q('scope')==='past',now=new Date(Date.now()-6*3600_000).toISOString();
   let query=db.from('events').select('id,user_id,title,event_type,starts_at,ends_at,location_name,description,created_at,canceled_at').is('removed_at',null).limit(60);
   query=past?query.lt('starts_at',now).order('starts_at',{ascending:false}):query.gte('starts_at',now).order('starts_at',{ascending:true});
   const type=q('type');if(type)query=query.eq('event_type',z.enum(EVENT_TYPES).parse(type));
   const events=(checked(await query)??[]) as Row[],ids=events.map(e=>e.id);
   const [profiles,rsvps]=await Promise.all([profilesFor(db,events.map(e=>e.user_id)),ids.length?db.from('event_rsvps').select('event_id,user_id,status').in('event_id',ids).limit(5000):none]);
   const rows=(checked(rsvps)??[]) as Row[];
   return json(events.map(e=>({...e,host:author(profiles,e.user_id),mine:e.user_id===owner,going_count:rows.filter(r=>r.event_id===e.id&&r.status==='going').length,interested_count:rows.filter(r=>r.event_id===e.id&&r.status==='interested').length,my_rsvp:rows.find(r=>r.event_id===e.id&&r.user_id===owner)?.status??null})));
  }
  if(method==='POST'){
   const data=eventSchema.parse(await readJson(req));screen(data.title,data.description,data.location_name);await requireProfile(db,owner);
   const result=await db.from('events').insert({...data,user_id:owner}).select().single();
   if(result.error)saveFailed(result.error,'This event already exists.');
   return json(result.data,201);
  }
  if(method==='PATCH'){
   const body=await readJson(req),event=id('id');
   const change=body?.canceled===true?{canceled_at:new Date().toISOString()}:body?.canceled===false?{canceled_at:null}:eventSchema.parse(body);
   const row=checked(await db.from('events').update(change).eq('id',event).eq('user_id',owner).select().maybeSingle());
   if(!row)throw new HttpError(404,'Event not found');return json(row);
  }
  if(method==='DELETE'){
   const rows=checked(await db.from('events').delete().eq('id',id('id')).eq('user_id',owner).select('id'));
   if(!rows?.length)throw new HttpError(404,'Event not found');return json({deleted:true});
  }
 }
 if(path==='/api/rsvps'){
  if(method==='PUT'){
   const data=rsvpSchema.parse(await readJson(req));
   const existing=checked(await db.from('event_rsvps').select('event_id').eq('event_id',data.event_id).eq('user_id',owner).maybeSingle());
   const result=existing?await db.from('event_rsvps').update({status:data.status}).eq('event_id',data.event_id).eq('user_id',owner):await db.from('event_rsvps').insert({...data,user_id:owner});
   if(result.error)saveFailed(result.error,'');
   return json({status:data.status});
  }
  if(method==='DELETE'){checked(await db.from('event_rsvps').delete().eq('event_id',id('event_id')).eq('user_id',owner));return json({status:null});}
 }

 // ---- Messages
 if(path==='/api/threads'&&method==='GET'){
  const rows=(checked(await db.from('direct_messages').select('id,sender_id,recipient_id,body,created_at,read_at').or(`sender_id.eq.${owner},recipient_id.eq.${owner}`).order('created_at',{ascending:false}).limit(500))??[]) as Row[];
  const threads=new Map<string,{with:string;last:Row;unread:number}>();
  for(const m of rows){const other=m.sender_id===owner?m.recipient_id:m.sender_id;const t=threads.get(other)??{with:other,last:m,unread:0};if(m.recipient_id===owner&&!m.read_at)t.unread++;threads.set(other,t);}
  const profiles=await profilesFor(db,[...threads.keys()]);
  // A rider hidden by a block has no readable profile; the thread is hidden with them.
  return json([...threads.values()].filter(t=>profiles.has(t.with)).map(t=>({rider:author(profiles,t.with),last_message:{body:t.last.body,created_at:t.last.created_at,mine:t.last.sender_id===owner},unread:t.unread})));
 }
 if(path==='/api/thread'){
  if(method==='GET'){
   const other=id('with');
   const profile=checked(await db.from('profiles').select('user_id,handle,display_name,location,riding_class').eq('user_id',other).maybeSingle());
   if(!profile)throw new HttpError(404,'Rider not found');
   const rows=(checked(await db.from('direct_messages').select('id,sender_id,recipient_id,body,created_at,read_at').or(`and(sender_id.eq.${owner},recipient_id.eq.${other}),and(sender_id.eq.${other},recipient_id.eq.${owner})`).order('created_at',{ascending:false}).limit(200))??[]) as Row[];
   checked(await db.from('direct_messages').update({read_at:new Date().toISOString()}).eq('recipient_id',owner).eq('sender_id',other).is('read_at',null));
   return json({rider:profile,messages:rows.reverse().map(m=>({id:m.id,body:m.body,created_at:m.created_at,mine:m.sender_id===owner}))});
  }
  if(method==='POST'){
   const data=messageSchema.parse(await readJson(req));
   if(data.recipient_id===owner)throw new HttpError(400,'Choose another rider to message.');screen(data.body);
   await requireProfile(db,owner);
   const result=await db.from('direct_messages').insert({...data,sender_id:owner}).select('id,body,created_at').single();
   if(result.error)saveFailed(result.error,'This message already exists.');
   return json({...result.data,mine:true},201);
  }
 }


 // ---- Garage sharing: a bike on the profile with chosen photos, and its build sheet public or private
 if(path==='/api/garage-sharing'){
  if(method==='GET'){
   const bike=checked(await db.from('bikes').select('id,show_on_profile,build_sheet_public,public_photo_ids').eq('id',id('bike_id')).eq('user_id',owner).maybeSingle()) as Row|null;
   if(!bike)throw new HttpError(404,'Bike not found');
   return json({show_on_profile:bike.show_on_profile,build_sheet_public:bike.build_sheet_public,photo_ids:bike.public_photo_ids??[]});
  }
  if(method==='PUT'){
   const data=garageSharingSchema.parse(await readJson(req));const photoIds=[...new Set(data.photo_ids)];
   if(photoIds.length){const own=(checked(await db.from('rider_photos').select('id').eq('user_id',owner).eq('kind','bike').eq('bike_id',data.bike_id).in('id',photoIds))??[]) as Row[];if(own.length!==photoIds.length)throw new HttpError(404,'Photo not found');}
   const result=await db.from('bikes').update({show_on_profile:data.show_on_profile,build_sheet_public:data.show_on_profile&&data.build_sheet_public,public_photo_ids:photoIds}).eq('id',data.bike_id).eq('user_id',owner).select('show_on_profile,build_sheet_public,public_photo_ids').maybeSingle();
   if(result.error)saveFailed(result.error,'');if(!result.data)throw new HttpError(404,'Bike not found');
   return json({show_on_profile:result.data.show_on_profile,build_sheet_public:result.data.build_sheet_public,photo_ids:result.data.public_photo_ids??[]});
  }
 }
 if(path==='/api/build-sheet'&&method==='GET'){
  const {data,error}=await db.rpc('shared_build_sheet',{p_bike:id('bike_id')});
  if(error)throw new HttpError(503,'The build sheet could not load.');
  if(!data)throw new HttpError(403,'This build sheet is private.');
  const sheet=data as Row,{parts,stock}=readInstalled(sheet.configuration as Record<string,unknown>);
  return json({bike:{id:sheet.id,label:bikeLabel(sheet),manufacturer:sheet.manufacturer,model:sheet.model,model_year:sheet.model_year,nickname:sheet.nickname??''},parts:parts.map(p=>({system:p.s,system_label:systemLabel(p.s),name:partLabel(p),brand:canonBrand(p.b),part:cleanName(p.b,p.n),size:p.v??'',color:p.k??'',detail:p.d??'',off_bike:!!p.o})),stock:stock,stock_systems:stock.map(k=>systemLabel(k))});
 }

 // ---- Blocks, reports, feedback
 if(path==='/api/blocks'){
  if(method==='GET')return json(checked(await db.from('user_blocks').select('blocked_id,created_at').eq('blocker_id',owner).order('created_at',{ascending:false}))??[]);
  if(method==='PUT'){
   const blocked=id('user_id');if(blocked===owner)throw new HttpError(400,'You cannot block yourself.');
   const result=await db.from('user_blocks').insert({blocker_id:owner,blocked_id:blocked});
   if(result.error&&result.error.code!=='23505')saveFailed(result.error,'');
   return json({blocked:true});
  }
  if(method==='DELETE'){checked(await db.from('user_blocks').delete().eq('blocker_id',owner).eq('blocked_id',id('user_id')));return json({blocked:false});}
 }
 if(path==='/api/reports'&&method==='POST'){
  const data=reportSchema.parse(await readJson(req));
  const result=await db.from('content_reports').insert({...data,reporter_id:owner}).select('id,created_at').single();
  if(result.error)saveFailed(result.error,'');
  return json({reported:true,...result.data},201);
 }
 if(path==='/api/feedback'&&method==='POST'){
  const data=feedbackSchema.parse(await readJson(req));
  const result=await db.from('feedback').insert({...data,user_id:owner}).select('id,created_at').single();
  if(result.error)saveFailed(result.error,'');
  return json({received:true,...result.data},201);
 }

 // ---- Setup log
 if(path==='/api/setup-logs'){
  if(method==='GET'){
   let query=db.from('setup_logs').select('*').eq('user_id',owner).order('recorded_at',{ascending:false}).limit(200);
   if(url.searchParams.has('bike_id'))query=query.eq('bike_id',id('bike_id'));
   return json(checked(await query)??[]);
  }
  if(method==='POST'||method==='PATCH'){
   const data=setupLogSchema.parse(await readJson(req));
   const bike=checked(await db.from('bikes').select('id').eq('id',data.bike_id).eq('user_id',owner).maybeSingle());
   if(!bike)throw new HttpError(404,'Bike not found');
   if(method==='POST'){
    const result=await db.from('setup_logs').insert({...data,user_id:owner}).select().single();
    if(result.error)saveFailed(result.error,'');
    return json(result.data,201);
   }
   const {bike_id,...change}=data;
   const row=checked(await db.from('setup_logs').update(change).eq('id',id('id')).eq('user_id',owner).eq('bike_id',bike_id).select().maybeSingle());
   if(!row)throw new HttpError(404,'Setup entry not found');return json(row);
  }
  if(method==='DELETE'){
   const rows=checked(await db.from('setup_logs').delete().eq('id',id('id')).eq('user_id',owner).select('id'));
   if(!rows?.length)throw new HttpError(404,'Setup entry not found');return json({deleted:true});
  }
 }

 // ---- Parts catalog (exact bike only; an absent catalog is reported, never substituted)
 if(path==='/api/parts/catalog'&&method==='GET'){
  const bike=checked(await db.from('bikes').select('manufacturer,model,model_year,variant,region').eq('id',id('bike_id')).eq('user_id',owner).maybeSingle()) as Row|null;
  if(!bike)throw new HttpError(404,'Bike not found');
  const catalogs=(checked(await db.from('part_catalogs').select('id,source,source_url,scope_label,complete,assembly_count,part_count').match(exactBikeScope(bike as Pick<Bike,'manufacturer'|'model'|'model_year'|'variant'|'region'>)).order('complete',{ascending:false}).order('part_count',{ascending:false}).limit(1))??[]) as Row[];
  if(!catalogs.length)return json({catalog:null,assemblies:[]});
  const assemblies=checked(await db.from('part_assemblies').select('id,name,diagram_url,source_url,position').eq('catalog_id',catalogs[0].id).order('position',{ascending:true}).limit(400));
  return json({catalog:catalogs[0],assemblies:assemblies??[]});
 }
 if(path==='/api/parts/fitment'&&method==='GET'){
  const number=(q('part_number')??'').trim();
  if(!/^[A-Za-z0-9][A-Za-z0-9 .\/-]{3,39}$/.test(number))throw new HttpError(400,'Enter a part number');
  const rows=checked(await db.rpc('part_fitment',{p_part_number:number}));
  return json({part_number:number,fits:rows??[]});
 }
 if(path==='/api/parts'&&method==='GET'){
  const assemblyId=id('assembly_id');
  const rows=await collectPages<Row>((from,to)=>db.from('parts').select('id,position,callout,part_number,description,quantity_raw,remarks',{count:'exact'}).eq('assembly_id',assemblyId).order('position',{ascending:true}).order('id',{ascending:true}).range(from,to),{label:'Parts assembly',maxRows:10000,maxBytes:10_000_000,key:row=>String(row.id)});
  return json(rows);
 }
 return null;
}
