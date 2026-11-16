import type {SupabaseClient} from '@supabase/supabase-js';
import {z} from 'zod';
import {adminDb,checked} from './database.ts';
import {HttpError,readJson} from './validation.ts';
import {SAFETY,alertEmail,allClearEmail,extendedTimes,introEmail,publicView,rideTimes,startEmail} from '../shared/ride-share.ts';
import {emailReady,sendEmail} from './email.ts';

/** Safety share link. Riders start, update and end their own shares here (checked against their sign-in); every write uses
 *  the service role because riders have no write grant on the table. The public link is a random secret; only its SHA-256
 *  is stored. Only the last position is kept, ending or expiry clears it, and the public view shows only the first name the
 *  rider chose and that last point. */
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const sha=async(s:string)=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const token=()=>{const b=crypto.getRandomValues(new Uint8Array(24));return btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');};
const OWN='id,rider_name,created_at,expires_at,ended_at,last_lat,last_lng,last_accuracy_m,last_at,back_by,alert_at,alerted_at,track_name';
export const startSchema=z.object({back_by_min:z.number().int().min(SAFETY.minBackByMin).max(SAFETY.maxBackByMin),rider_name:z.string().trim().max(40).default(''),
 track_name:z.string().trim().max(120).default(''),tz:z.string().trim().max(60).regex(/^[A-Za-z_]+(\/[A-Za-z0-9_+-]+)*$|^$/).default('')}).strict();
export const contactSchema=z.object({name:z.string().trim().min(1).max(60),phone:z.string().trim().max(24).regex(/^[0-9+() .-]*$/,'Use digits for the phone number').default(''),
 email:z.string().trim().max(200).default('').refine(v=>!v||/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),'Check the email address'),
 my_name:z.string().trim().max(40).optional()}).strict()
 .refine(v=>v.phone.replace(/\D/g,'').length>=7||v.email,{message:'Add a mobile number or an email.'});
export const positionSchema=z.object({id:z.string().uuid(),lat:z.number().min(-90).max(90),lng:z.number().min(-180).max(180),accuracy_m:z.number().min(0).max(100000).nullable().default(null),at:z.string().refine(v=>Number.isFinite(Date.parse(v)))}).strict();
type Contact={id:string;name:string;phone:string;email:string};
export const nameSchema=z.object({name:z.string().trim().min(1,'Add your name').max(40)}).strict();
/** The rider's name as their contacts know them, set on the Ride safety card (private). Empty if they haven't set it. */
async function ownName(admin:SupabaseClient,owner:string):Promise<string>{const r=await admin.from('rider_preferences').select('safety_name').eq('user_id',owner).maybeSingle();return ((r.data as {safety_name?:string}|null)?.safety_name??'').trim();}
/** For the emails and the link: their own name, else their community name, else a plain stand-in. */
async function mailName(admin:SupabaseClient,owner:string):Promise<string>{
 const own=await ownName(admin,owner);if(own)return own;
 const prof=await admin.from('profiles').select('display_name').eq('user_id',owner).maybeSingle();
 return ((prof.data as {display_name?:string}|null)?.display_name??'').trim();
}
async function setOwnName(admin:SupabaseClient,owner:string,name:string){const r=await admin.from('rider_preferences').upsert({user_id:owner,safety_name:name,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(r.error)throw new HttpError(503,'Could not save your name. Try again.');}
async function contactsOf(admin:SupabaseClient,owner:string):Promise<Contact[]>{const r=await admin.from('safety_contacts').select('id,name,phone,email').eq('user_id',owner).order('created_at').limit(SAFETY.maxContacts);return (r.data??[]) as Contact[];}
const emailsOf=(c:Contact[])=>c.map(x=>x.email).filter(Boolean);
const site=()=>(process.env.PUBLIC_SITE_URL||'https://bakmx.com').replace(/\/$/,'');

/** Clears positions of ended or expired shares (privacy: nothing kept after). Run by the hourly cron and on reads. */
export async function clearFinishedShares(admin:SupabaseClient=adminDb()){
 try{await admin.from('ride_shares').update({last_lat:null,last_lng:null,last_accuracy_m:null,link_secret:null}).or(`ended_at.not.is.null,expires_at.lt.${new Date().toISOString()}`).or('last_lat.not.is.null,link_secret.not.is.null');}catch{/* best effort */}
}

/** GET /api/share?t=<secret>: no sign-in. */
export async function handlePublicShare(url:URL):Promise<Response>{
 const t=url.searchParams.get('t')??'';if(!/^[A-Za-z0-9_-]{32}$/.test(t))return json({error:'This link is not valid.'},404);
 const r=await adminDb().from('ride_shares').select('rider_name,expires_at,ended_at,back_by,alerted_at,last_lat,last_lng,last_accuracy_m,last_at').eq('token_sha256',await sha(t)).maybeSingle();
 if(r.error)return json({error:'Could not load this link right now. Try again in a minute.'},503);
 if(!r.data)return json({error:'This link is not valid.'},404);
 return json(publicView(r.data as never,Date.now()));
}

export async function handleRideShares(req:Request,path:string,method:string,db:SupabaseClient,owner:string,admin:()=>SupabaseClient=adminDb):Promise<Response|null>{
 if(!path.startsWith('/api/ride-share')&&!path.startsWith('/api/safety-contacts'))return null;
 if(path==='/api/ride-share'&&method==='GET'){
  const rows=(checked(await db.from('ride_shares').select(OWN).eq('user_id',owner).is('ended_at',null).gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(1))??[]) as Record<string,unknown>[];
  return json(rows[0]??null);
 }
 if(path==='/api/ride-share'&&method==='POST'){
  const data=startSchema.parse(await readJson(req,1000));
  const {count}=await db.from('ride_shares').select('id',{count:'exact',head:true}).eq('user_id',owner).gte('created_at',new Date(Date.now()-864e5).toISOString());
  if((count??0)>=SAFETY.perDay)throw new HttpError(429,'That’s a lot of rides today. Try again tomorrow.');
  // One ride at a time: starting a new one ends the old one (no all-clear needed unless it had already alerted).
  await endOpen(admin(),owner,'');
  const secret=token(),now=Date.now(),t=rideTimes(now,data.back_by_min);
  if(!data.rider_name)data.rider_name=(await mailName(admin(),owner)).slice(0,40);
  const r=await admin().from('ride_shares').insert({user_id:owner,token_sha256:await sha(secret),link_secret:secret,rider_name:data.rider_name,track_name:data.track_name,tz:data.tz,...t}).select(OWN).single();
  if(r.error)throw new HttpError(503,'Could not start ride safety. Nothing was changed.');
  const url=`${site()}/s/${secret}`,contacts=await contactsOf(admin(),owner);
  const mail=startEmail(data.rider_name,url,t.back_by,data.track_name,data.tz||undefined);
  const emailed=emailsOf(contacts).length?await sendEmail(emailsOf(contacts),mail.subject,mail.text):false;
  return json({...r.data,url,email_ready:emailReady(),emailed,contacts:contacts.map(c=>({name:c.name,phone:c.phone,has_email:!!c.email}))},201);
 }
 if(path==='/api/ride-share/extend'&&method==='POST'){
  const {id,minutes}=z.object({id:z.string().uuid(),minutes:z.number().int().min(15).max(SAFETY.maxExtendMin)}).strict().parse(await readJson(req,500));
  const row=(await admin().from('ride_shares').select('id,created_at,back_by,alerted_at,all_clear_at,rider_name,tz').eq('id',id).eq('user_id',owner).is('ended_at',null).maybeSingle()).data as {id:string;created_at:string;back_by:string|null;alerted_at:string|null;all_clear_at:string|null;rider_name:string;tz:string}|null;
  if(!row||!row.back_by)throw new HttpError(404,'No ride in progress.');
  const t=extendedTimes(Date.parse(row.created_at),Date.parse(row.back_by),Date.now(),minutes);
  // Adding time after an alert went out means the rider is OK: contacts get the all-clear, and a later alert can go again.
  const cleared=row.alerted_at&&!row.all_clear_at?await allClear(admin(),owner,row.rider_name,row.tz):false;
  const r=await admin().from('ride_shares').update({...t,...(row.alerted_at?{alerted_at:null,alert_claimed_at:null,all_clear_at:null}:{})}).eq('id',id).eq('user_id',owner).select(OWN).single();
  if(r.error)throw new HttpError(503,'Could not add time. Try again.');
  return json({...r.data,all_clear_sent:cleared});
 }
 if(path==='/api/ride-share/position'&&method==='POST'){
  const p=positionSchema.parse(await readJson(req,1000));
  const at=Math.min(Date.parse(p.at),Date.now());
  const r=await admin().from('ride_shares').update({last_lat:Math.round(p.lat*1e5)/1e5,last_lng:Math.round(p.lng*1e5)/1e5,last_accuracy_m:p.accuracy_m==null?null:Math.round(p.accuracy_m),last_at:new Date(at).toISOString()})
   .eq('id',p.id).eq('user_id',owner).is('ended_at',null).gt('expires_at',new Date().toISOString()).or(`last_at.is.null,last_at.lt.${new Date(at).toISOString()}`).select('id,expires_at');
  if(r.error)throw new HttpError(503,'Could not update.');
  return json({updated:(r.data??[]).length>0});
 }
 if(path==='/api/ride-share/end'&&method==='POST'){
  const {id}=z.object({id:z.string().uuid()}).strict().parse(await readJson(req,500));
  const cleared=await endOpen(admin(),owner,id);
  return json({ended:true,all_clear_sent:cleared});
 }
 if(path==='/api/safety-contacts'&&method==='GET')return json({contacts:await contactsOf(admin(),owner),email_ready:emailReady(),my_name:await ownName(admin(),owner)});
 if(path==='/api/safety-contacts/name'&&method==='PUT'){const {name}=nameSchema.parse(await readJson(req,500));await setOwnName(admin(),owner,name);return json({my_name:name});}
 if(path==='/api/safety-contacts'&&method==='POST'){
  const c=contactSchema.parse(await readJson(req,1000));
  if(c.my_name)await setOwnName(admin(),owner,c.my_name);
  const have=await contactsOf(admin(),owner);
  if(have.length>=SAFETY.maxContacts)throw new HttpError(409,`Up to ${SAFETY.maxContacts} contacts. Remove one first.`);
  const r=await admin().from('safety_contacts').insert({user_id:owner,name:c.name,phone:c.phone,email:c.email.toLowerCase()}).select('id,name,phone,email').single();
  if(r.error)throw new HttpError(503,'Could not save the contact. Nothing was changed.');
  // A short hello so the first alert is expected and not lost in spam.
  if(c.email){
   const rider=(await mailName(admin(),owner))||'A BAK MX rider';
   const m=introEmail(rider,c.name);
   if(await sendEmail([c.email],m.subject,m.text))await admin().from('safety_contacts').update({introduced_at:new Date().toISOString()}).eq('id',(r.data as Contact).id);
  }
  return json({contact:r.data,contacts:await contactsOf(admin(),owner),email_ready:emailReady()},201);
 }
 if(path==='/api/safety-contacts'&&method==='DELETE'){
  const id=z.string().uuid().parse(new URL(req.url).searchParams.get('id'));
  // Riders can remove a contact any time: a guarded update to the rider's own row would leave it; removing is the point here.
  const r=await admin().from('safety_contacts').delete().eq('id',id).eq('user_id',owner).select('id');
  if(r.error)throw new HttpError(503,'Could not remove. Try again.');
  return json({contacts:await contactsOf(admin(),owner)});
 }
 return null;
}

/** Ends the rider's open ride (one id, or any when id is ''), clears the position, and sends the all-clear if an alert had
 *  gone out. Returns whether an all-clear went. */
async function endOpen(admin:SupabaseClient,owner:string,id:string):Promise<boolean>{
 let q=admin.from('ride_shares').update({ended_at:new Date().toISOString(),last_lat:null,last_lng:null,last_accuracy_m:null,link_secret:null}).eq('user_id',owner).is('ended_at',null);
 if(id)q=q.eq('id',id);
 const r=await q.select('id,rider_name,alerted_at,all_clear_at,tz');
 if(r.error)throw new HttpError(503,'Could not end ride safety. Try again.');
 const alerted=((r.data??[]) as {id:string;rider_name:string;alerted_at:string|null;all_clear_at:string|null;tz:string}[]).find(x=>x.alerted_at&&!x.all_clear_at);
 if(!alerted)return false;
 const sent=await allClear(admin,owner,alerted.rider_name,alerted.tz);
 if(sent)await admin.from('ride_shares').update({all_clear_at:new Date().toISOString()}).eq('id',alerted.id);
 return sent;
}
async function allClear(admin:SupabaseClient,owner:string,rider:string,tz:string):Promise<boolean>{
 const to=emailsOf(await contactsOf(admin,owner));if(!to.length)return false;
 const m=allClearEmail(rider,new Date().toISOString(),tz||undefined);return sendEmail(to,m.subject,m.text);
}

/** Every minute (Vercel Cron): rides 30 minutes past their back-by with no check-in. Each is claimed once (so two runs never
 *  both send), then the contacts get one alert email with the last known spot. A failed send is released to try again next
 *  minute, up to 30 minutes. */
export async function runSafetyCron(admin:SupabaseClient,now=new Date()):Promise<{due:number;alerted:number;failed:number}>{
 const nowIso=now.toISOString(),stale=new Date(now.getTime()-5*60e3).toISOString();
 const due=await admin.from('ride_shares').select('id').is('ended_at',null).is('alerted_at',null).lte('alert_at',nowIso).gt('expires_at',nowIso)
  .or(`alert_claimed_at.is.null,alert_claimed_at.lt.${stale}`).limit(100);
 let alerted=0,failed=0;
 for(const {id} of (due.data??[]) as {id:string}[]){
  const claim=await admin.from('ride_shares').update({alert_claimed_at:nowIso}).eq('id',id).is('alerted_at',null).or(`alert_claimed_at.is.null,alert_claimed_at.lt.${stale}`)
   .select('id,user_id,rider_name,track_name,tz,back_by,alert_at,last_at,link_secret').maybeSingle();
  const row=claim.data as {id:string;user_id:string;rider_name:string;track_name:string;tz:string;back_by:string;alert_at:string;last_at:string|null;link_secret:string|null}|null;
  if(!row)continue;
  const to=emailsOf(await contactsOf(admin,row.user_id));
  // The same link the contacts already have (its secret is kept server-side only, never readable by any app user).
  const m=alertEmail(row.rider_name,row.link_secret?`${site()}/s/${row.link_secret}`:site(),row.back_by,row.last_at,row.track_name,row.tz||undefined);
  const ok=to.length?await sendEmail(to,m.subject,m.text):false;
  if(ok){await admin.from('ride_shares').update({alerted_at:nowIso}).eq('id',row.id);alerted++;}
  else{failed++;if(now.getTime()-Date.parse(row.alert_at)<30*60e3)await admin.from('ride_shares').update({alert_claimed_at:null}).eq('id',row.id);else await admin.from('ride_shares').update({alerted_at:nowIso}).eq('id',row.id);}
 }
 return {due:(due.data??[]).length,alerted,failed};
}
