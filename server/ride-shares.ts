import type {SupabaseClient} from '@supabase/supabase-js';
import {z} from 'zod';
import {adminDb,checked} from './database.ts';
import {HttpError,readJson} from './validation.ts';
import {SHARE_LIMITS,publicView} from '../shared/ride-share.ts';

/** Safety share link. Riders start, update and end their own shares here (checked against their sign-in); every write uses
 *  the service role because riders have no write grant on the table. The public link is a random secret; only its SHA-256
 *  is stored. Only the last position is kept, ending or expiry clears it, and the public view shows only the first name the
 *  rider chose and that last point. */
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const sha=async(s:string)=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const token=()=>{const b=crypto.getRandomValues(new Uint8Array(24));return btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');};
const OWN='id,rider_name,created_at,expires_at,ended_at,last_lat,last_lng,last_accuracy_m,last_at';
export const startSchema=z.object({hours:z.number().int().min(SHARE_LIMITS.minHours).max(SHARE_LIMITS.maxHours),rider_name:z.string().trim().max(40).default('')}).strict();
export const positionSchema=z.object({id:z.string().uuid(),lat:z.number().min(-90).max(90),lng:z.number().min(-180).max(180),accuracy_m:z.number().min(0).max(100000).nullable().default(null),at:z.string().refine(v=>Number.isFinite(Date.parse(v)))}).strict();
const site=()=>(process.env.PUBLIC_SITE_URL||'https://bakmx.com').replace(/\/$/,'');

/** Clears positions of ended or expired shares (privacy: nothing kept after). Run by the hourly cron and on reads. */
export async function clearFinishedShares(admin:SupabaseClient=adminDb()){
 try{await admin.from('ride_shares').update({last_lat:null,last_lng:null,last_accuracy_m:null}).or(`ended_at.not.is.null,expires_at.lt.${new Date().toISOString()}`).not('last_lat','is',null);}catch{/* best effort */}
}

/** GET /api/share?t=<secret>: no sign-in. */
export async function handlePublicShare(url:URL):Promise<Response>{
 const t=url.searchParams.get('t')??'';if(!/^[A-Za-z0-9_-]{32}$/.test(t))return json({error:'This link is not valid.'},404);
 const r=await adminDb().from('ride_shares').select('rider_name,expires_at,ended_at,last_lat,last_lng,last_accuracy_m,last_at').eq('token_sha256',await sha(t)).maybeSingle();
 if(r.error)return json({error:'Could not load this link right now. Try again in a minute.'},503);
 if(!r.data)return json({error:'This link is not valid.'},404);
 return json(publicView(r.data as never,Date.now()));
}

export async function handleRideShares(req:Request,path:string,method:string,db:SupabaseClient,owner:string,admin:()=>SupabaseClient=adminDb):Promise<Response|null>{
 if(!path.startsWith('/api/ride-share'))return null;
 if(path==='/api/ride-share'&&method==='GET'){
  const rows=(checked(await db.from('ride_shares').select(OWN).eq('user_id',owner).is('ended_at',null).gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(1))??[]) as Record<string,unknown>[];
  return json(rows[0]??null);
 }
 if(path==='/api/ride-share'&&method==='POST'){
  const data=startSchema.parse(await readJson(req,1000));
  const {count}=await db.from('ride_shares').select('id',{count:'exact',head:true}).eq('user_id',owner).gte('created_at',new Date(Date.now()-864e5).toISOString());
  if((count??0)>=SHARE_LIMITS.perDay)throw new HttpError(429,'That’s a lot of share links today. Try again tomorrow.');
  // One live share at a time: starting a new one ends the old one.
  await admin().from('ride_shares').update({ended_at:new Date().toISOString(),last_lat:null,last_lng:null,last_accuracy_m:null}).eq('user_id',owner).is('ended_at',null);
  const secret=token(),now=Date.now();
  const r=await admin().from('ride_shares').insert({user_id:owner,token_sha256:await sha(secret),rider_name:data.rider_name,expires_at:new Date(now+data.hours*3600e3).toISOString()}).select(OWN).single();
  if(r.error)throw new HttpError(503,'Could not start sharing. Nothing was changed.');
  return json({...r.data,url:`${site()}/s/${secret}`},201);
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
  const r=await admin().from('ride_shares').update({ended_at:new Date().toISOString(),last_lat:null,last_lng:null,last_accuracy_m:null}).eq('id',id).eq('user_id',owner).is('ended_at',null).select('id');
  if(r.error)throw new HttpError(503,'Could not stop sharing. Try again.');
  return json({ended:true});
 }
 return null;
}
