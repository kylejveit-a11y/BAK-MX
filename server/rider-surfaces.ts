import type {SupabaseClient} from '@supabase/supabase-js';
import {z} from 'zod';
import {checked} from './database.ts';
import {collectPages} from './pagination.ts';
import {HttpError,readJson,uuid} from './validation.ts';
import {objectionable} from './content-rules.ts';

/** Profile, community, events, messages, moderation, feedback, setup log and parts catalog.
 * Every query runs with the rider's own token, so row-level security is the authority;
 * the owner predicates here are a second check, not the only one. Paths are flat so the
 * same routes work behind the single serverless entry point. */

const text=(max:number)=>z.string().trim().min(1).max(max);
const optionalText=(max:number)=>z.string().trim().max(max).default('');
export const POST_CATEGORIES=['build','setup_question','ride_plan','general'] as const;
export const EVENT_TYPES=['ride_day','race','practice','clinic','meetup'] as const;
export const profileSchema=z.object({handle:z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,24}$/,'Use 3–24 lowercase letters, numbers or underscores'),display_name:optionalText(60),bio:optionalText(500),location:optionalText(80),riding_class:optionalText(60),accept_rules:z.literal(true).optional()}).strict();
export const postSchema=z.object({category:z.enum(POST_CATEGORIES),body:text(4000),bike_label:optionalText(120)}).strict();
export const commentSchema=z.object({post_id:uuid,body:text(2000)}).strict();
const instant=z.string().refine(v=>Number.isFinite(Date.parse(v)),{message:'Use a valid date and time'}).transform(v=>new Date(v).toISOString());
export const eventSchema=z.object({title:text(120),event_type:z.enum(EVENT_TYPES),starts_at:instant,ends_at:instant.nullable().default(null),location_name:text(160),description:optionalText(4000)}).strict().refine(v=>!v.ends_at||v.ends_at>=v.starts_at,{message:'An event cannot end before it starts'});
export const rsvpSchema=z.object({event_id:uuid,status:z.enum(['going','interested'])}).strict();
export const messageSchema=z.object({recipient_id:uuid,body:text(4000)}).strict();
export const reportSchema=z.object({target_type:z.enum(['post','comment','event','message','profile']),target_id:uuid,reason:text(1000)}).strict();
export const feedbackSchema=z.object({category:z.enum(['bug','answer_quality','missing_data','idea','other']),body:text(4000),context:z.record(z.unknown()).default({})}).strict().refine(v=>JSON.stringify(v.context).length<=4000,{message:'Feedback context is too large'});
const hours=z.number().finite().min(0).max(100000).nullable().default(null);
export const setupLogSchema=z.object({bike_id:uuid,recorded_at:instant,track:optionalText(120),conditions:optionalText(200),engine_hours:hours,settings:z.record(z.union([z.string().max(200),z.number().finite(),z.null()])).default({}),change_made:optionalText(1000),result:z.enum(['better','worse','no_change','not_tested']).default('not_tested'),notes:optionalText(4000)}).strict().refine(v=>Object.keys(v.settings).length<=60,{message:'Too many settings in one entry'});

type Db=SupabaseClient;
type Row=Record<string,any>;
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const PAGE=30;
const none=Promise.resolve({data:[] as Row[],error:null});

async function profilesFor(db:Db,ids:string[]):Promise<Map<string,Row>>{
 const unique=[...new Set(ids)];if(!unique.length)return new Map();
 const rows=checked(await db.from('profiles').select('user_id,handle,display_name,location,riding_class').in('user_id',unique)) as Row[]|null;
 return new Map((rows??[]).map(r=>[r.user_id,r]));
}
async function requireProfile(db:Db,owner:string){
 const profile=checked(await db.from('profiles').select('user_id').eq('user_id',owner).maybeSingle());
 if(!profile)throw new HttpError(409,'Set up your rider profile before posting or messaging.');
}
const author=(profiles:Map<string,Row>,id:string)=>profiles.get(id)??{user_id:id,handle:'rider',display_name:'',location:'',riding_class:''};
/** First-pass screen on rider-written text; reports and blocks handle the rest. */
function screen(...texts:(string|null|undefined)[]){if(texts.some(t=>t&&objectionable(t)))throw new HttpError(422,'That wording isn’t allowed here. Edit it and try again.');}
function saveFailed(error:{code?:string}|null,conflict:string):never{
 if(error?.code==='23505'&&conflict)throw new HttpError(409,conflict);
 if(error?.code==='42501')throw new HttpError(403,'This action is not available for that rider or item.');
 throw new HttpError(503,'Could not save. Nothing was changed.');
}

export async function handleRiderSurfaces(req:Request,url:URL,path:string,method:string,db:Db,owner:string):Promise<Response|null>{
 const q=(name:string)=>url.searchParams.get(name);
 const id=(name:string)=>uuid.parse(q(name));

 // ---- Profile
 if(path==='/api/profile'){
  if(method==='GET')return json(checked(await db.from('profiles').select('*').eq('user_id',owner).maybeSingle()));
  if(method==='PUT'){
   const {accept_rules,...data}=profileSchema.parse(await readJson(req));screen(data.handle,data.display_name,data.bio,data.location,data.riding_class);
   const existing=checked(await db.from('profiles').select('user_id').eq('user_id',owner).maybeSingle());
   const result=existing
    ?await db.from('profiles').update({...data,updated_at:new Date().toISOString()}).eq('user_id',owner).select().single()
    :accept_rules===true?await db.from('profiles').insert({...data,user_id:owner,accepted_rules_at:new Date().toISOString()}).select().single():(()=>{throw new HttpError(400,'Accept the community rules to create your profile.');})();
   if(result.error)saveFailed(result.error,'That handle is taken. Choose another.');
   return json(result.data);
  }
 }
 if(path==='/api/profiles'&&method==='GET'){
  const rider=id('id');
  const profile=checked(await db.from('profiles').select('user_id,handle,display_name,bio,location,riding_class,created_at').eq('user_id',rider).maybeSingle());
  if(!profile)throw new HttpError(404,'Rider not found');
  const posts=checked(await db.from('posts').select('id,category,body,bike_label,created_at').eq('user_id',rider).is('removed_at',null).order('created_at',{ascending:false}).limit(20));
  return json({profile,posts:posts??[],mine:rider===owner});
 }

 // ---- Community
 if(path==='/api/posts'){
  if(method==='GET'){
   let query=db.from('posts').select('id,user_id,category,body,bike_label,created_at').is('removed_at',null).order('created_at',{ascending:false}).limit(PAGE);
   const category=q('category');if(category)query=query.eq('category',z.enum(POST_CATEGORIES).parse(category));
   const before=q('before');if(before)query=query.lt('created_at',instant.parse(before));
   const posts=(checked(await query)??[]) as Row[];
   const ids=posts.map(p=>p.id);
   const [profiles,likes,comments]=await Promise.all([
    profilesFor(db,posts.map(p=>p.user_id)),
    ids.length?db.from('post_likes').select('post_id,user_id').in('post_id',ids).limit(5000):none,
    ids.length?db.from('post_comments').select('post_id').in('post_id',ids).is('removed_at',null).limit(5000):none]);
   const likeRows=(checked(likes)??[]) as Row[],commentRows=(checked(comments)??[]) as Row[];
   return json(posts.map(p=>({...p,author:author(profiles,p.user_id),mine:p.user_id===owner,like_count:likeRows.filter(l=>l.post_id===p.id).length,liked:likeRows.some(l=>l.post_id===p.id&&l.user_id===owner),comment_count:commentRows.filter(c=>c.post_id===p.id).length})));
  }
  if(method==='POST'){
   const data=postSchema.parse(await readJson(req));screen(data.body);await requireProfile(db,owner);
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
  const catalogs=(checked(await db.from('part_catalogs').select('id,source,source_url,scope_label,complete,assembly_count,part_count').match({manufacturer:bike.manufacturer,model:bike.model,model_year:bike.model_year,variant:bike.variant,region:bike.region}).order('complete',{ascending:false}).order('part_count',{ascending:false}).limit(1))??[]) as Row[];
  if(!catalogs.length)return json({catalog:null,assemblies:[]});
  const assemblies=checked(await db.from('part_assemblies').select('id,name,diagram_url,source_url,position').eq('catalog_id',catalogs[0].id).order('position',{ascending:true}).limit(400));
  return json({catalog:catalogs[0],assemblies:assemblies??[]});
 }
 if(path==='/api/parts'&&method==='GET'){
  const assemblyId=id('assembly_id');
  const rows=await collectPages<Row>((from,to)=>db.from('parts').select('id,position,callout,part_number,description,quantity_raw,remarks',{count:'exact'}).eq('assembly_id',assemblyId).order('position',{ascending:true}).order('id',{ascending:true}).range(from,to),{label:'Parts assembly',maxRows:10000,maxBytes:10_000_000,key:row=>String(row.id)});
  return json(rows);
 }
 return null;
}
