import type {SupabaseClient} from '@supabase/supabase-js';
import {z} from 'zod';
import {checked} from './database.ts';
import {HttpError,readJson,uuid} from './validation.ts';
import {PROFILE_LIMITS,SCREEN_IDS,toKg,type ScreenId} from '../shared/fuel-plan.ts';

/** Fuel profiles: GET (the account's profiles: the rider and riders without an account, like a parent's child), PUT
 *  (create or update one by id), DELETE (remove one). Everything runs with the rider's own token, so row-level security
 *  keeps every read and write to their own rows. Weight arrives in the rider's unit and is stored in kg. */

const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export const FUEL_PROFILE_COLS='id,kind,name,weight_kg,weight_unit,height_cm,age,sex,nervous_stomach,caffeine,moto_minutes,sweat_rate_lph,sweat_test_at,sweat_test_hot,screen,cleared,created_at,updated_at';
const L=PROFILE_LIMITS;

export const fuelProfileSchema=z.object({
 id:uuid,kind:z.enum(['self','rider']),name:z.string().trim().max(L.name).default(''),
 weight:z.number().positive(),weight_unit:z.enum(['kg','lb']),
 height_cm:z.number().min(L.minCm).max(L.maxCm).nullable().optional(),
 age:z.number().int().min(L.minAge).max(L.maxAge),
 sex:z.enum(['female','male']).nullable().optional(),
 nervous_stomach:z.boolean().optional(),caffeine:z.boolean().optional(),
 moto_minutes:z.number().int().min(L.minMoto).max(L.maxMoto).nullable().optional(),
 sweat_rate_lph:z.number().min(0.1).max(4).nullable().optional(),
 sweat_test_at:z.string().refine(v=>Number.isFinite(Date.parse(v)),{message:'Use a valid date and time'}).nullable().optional(),
 sweat_test_hot:z.boolean().nullable().optional(),
 screen:z.array(z.enum(SCREEN_IDS as [ScreenId,...ScreenId[]])).max(12).optional(),
 cleared:z.boolean().optional(),
}).strict().superRefine((v,ctx)=>{
 const kg=toKg(v.weight,v.weight_unit);
 if(kg<L.minKg||kg>L.maxKg)ctx.addIssue({code:'custom',path:['weight'],message:v.weight_unit==='lb'?'Enter a weight between 35 and 440 lb.':'Enter a weight between 15 and 200 kg.'});
 if(v.caffeine&&v.age<18)ctx.addIssue({code:'custom',path:['caffeine'],message:'Caffeine is for riders 18 and over only.'});
});
export type FuelProfileInput=z.infer<typeof fuelProfileSchema>;

/** The row as stored: kg, the unit the rider uses, caffeine forced off under 18, screen without repeats. */
export function profileRow(v:FuelProfileInput,owner:string){
 return {id:v.id,user_id:owner,kind:v.kind,name:v.name,weight_kg:Math.round(toKg(v.weight,v.weight_unit)*10)/10,weight_unit:v.weight_unit,
  height_cm:v.height_cm==null?null:Math.round(v.height_cm*10)/10,age:v.age,sex:v.sex??null,nervous_stomach:!!v.nervous_stomach,caffeine:v.age>=18&&!!v.caffeine,
  moto_minutes:v.moto_minutes??null,sweat_rate_lph:v.sweat_rate_lph==null?null:Math.round(v.sweat_rate_lph*100)/100,
  sweat_test_at:v.sweat_test_at?new Date(v.sweat_test_at).toISOString():null,sweat_test_hot:v.sweat_test_hot??null,
  screen:[...new Set(v.screen??[])],cleared:!!v.cleared,updated_at:new Date().toISOString()};
}

export async function handleFuelProfiles(req:Request,url:URL,path:string,method:string,db:SupabaseClient,owner:string):Promise<Response|null>{
 if(path!=='/api/fuel-profiles')return null;
 if(method==='GET')return json(checked(await db.from('fuel_profiles').select(FUEL_PROFILE_COLS).eq('user_id',owner).order('created_at',{ascending:true}).limit(L.maxRiders+1)));
 if(method==='PUT'){
  const input=fuelProfileSchema.parse(await readJson(req,8000));
  const row=profileRow(input,owner);
  const existing=checked(await db.from('fuel_profiles').select('id').eq('user_id',owner).limit(L.maxRiders+1)) as {id:string}[]|null;
  if(!(existing??[]).some(r=>r.id===input.id)&&(existing?.length??0)>=L.maxRiders)throw new HttpError(409,`You can keep up to ${L.maxRiders} riders. Remove one first.`);
  const result=await db.from('fuel_profiles').upsert(row,{onConflict:'id'}).select(FUEL_PROFILE_COLS).single();
  if(result.error?.code==='23505')throw new HttpError(409,'You already have a profile for yourself. Add this one as another rider.');
  if(result.error?.code==='23514')throw new HttpError(422,'Check the numbers: weight, height, age and moto length need to be in range, and caffeine is for 18 and over.');
  return json(checked(result));
 }
 if(method==='DELETE'){
  const id=uuid.parse(url.searchParams.get('id'));
  const rows=checked(await db.from('fuel_profiles').delete().eq('id',id).eq('user_id',owner).select('id'));
  if(!rows?.length)throw new HttpError(404,'Rider not found');
  return json({removed:true});
 }
 return null;
}
