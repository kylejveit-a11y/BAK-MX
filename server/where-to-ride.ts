import type {SupabaseClient} from '@supabase/supabase-js';
import {z} from 'zod';
import {checked} from './database.ts';
import {HttpError} from './validation.ts';
import {raceForecast,type RaceForecast} from './weather.ts';
import {objectionable} from './content-rules.ts';
import {readJson} from './validation.ts';
import {MAX_PENDING_SUGGESTIONS,SUGGEST_COPY,type PlaceSuggestion} from '../shared/where-to-ride.ts';
import {adminDb} from './database.ts';
import {areaWidths,decodePolyline,type DayForecast,type PlaceDetail,type PlaceWeather,type PlaceRow,type RidingArea,type TrailLine,type TrailWidth} from '../shared/where-to-ride.ts';

/** Where to Ride (docs/plans/riding-areas-plan.md): the list of tracks and riding areas, one place's page, and its trail
 *  lines. Read with the rider's own client: listed, approved places only (reference-only places never show). */
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'private, max-age=300','X-Content-Type-Options':'nosniff'}});
const idSchema=z.string().trim().min(1).max(120);
type Row=Record<string,unknown>;
const round=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?Math.round(v*1000)/1000:null;
const TRAIL_TYPES=['offroad','enduro'];

export function toRow(r:Row,lineCounts:Map<string,number>):PlaceRow{
 const area=(r.area??null) as RidingArea|null,types=(r.types as string[]|null)??[];
 const kind=r.kind==='riding_area'?'riding_area':'track';
 // No location on file: the middle of the trail map stands in for distance and weather (approx, so never for directions).
 const approx=r.lat==null&&!!area?.center,lat=approx?area!.center!.lat:r.lat,lng=approx?area!.center!.lng:r.lng;
 return {id:r.id as string,name:r.name as string,kind,city:(r.city as string|null)??null,state:r.state as string,lat:round(lat),lng:round(lng),...(approx?{approx:true}:{}),
  status:(r.status as string)??'unknown',access:(r.access as string)??'unknown',has_trails:kind==='riding_area'||types.some(t=>TRAIL_TYPES.includes(t)),
  trail_miles:typeof area?.trail_miles==='number'?area.trail_miles:null,widths:areaWidths(area?.vehicles),trail_map:(lineCounts.get(r.id as string)??0)>0};
}

async function lineCounts(db:SupabaseClient,ids?:string[]):Promise<Map<string,number>>{
 let q=db.from('trail_lines').select('track_id').limit(20000);if(ids)q=q.in('track_id',ids);
 const {data,error}=await q;const out=new Map<string,number>();
 if(error||!Array.isArray(data))return out;
 for(const r of data as {track_id:string}[])out.set(r.track_id,(out.get(r.track_id)??0)+1);
 return out;
}

export async function placeList(db:SupabaseClient):Promise<PlaceRow[]>{
 const rows=checked(await db.from('tracks').select('id,name,kind,city,state,lat,lng,status,access,types,area').eq('review_status','APPROVED').eq('listed',true).order('name').limit(3000)) as Row[];
 const counts=await lineCounts(db);
 return rows.map(r=>toRow(r,counts));
}

export async function placeDetail(db:SupabaseClient,id:string):Promise<PlaceDetail>{
 const r=checked(await db.from('tracks').select('id,name,kind,city,state,lat,lng,status,access,types,area,tracks_on_site,website,phone,layout').eq('id',id).eq('review_status','APPROVED').eq('listed',true).maybeSingle()) as Row|null;
 if(!r)throw new HttpError(404,'Place not found');
 const lines=checked(await db.from('trail_lines').select('map_date').eq('track_id',id).limit(5000)) as {map_date:string|null}[];
 const dates=lines.map(l=>l.map_date).filter((d):d is string=>!!d).sort();
 const layout=(r.layout??{}) as Row;
 return {...toRow(r,new Map([[id,lines.length]])),area:(r.area??null) as RidingArea|null,tracks_on_site:(r.tracks_on_site as string[]|null)??[],
  website:(r.website as string|null)??null,phone:(r.phone as string|null)??null,trail_lines:lines.length,map_date:dates.at(-1)??null,
  layout_notes:typeof layout.notes==='string'&&layout.notes?layout.notes:null};
}

export async function trailLines(db:SupabaseClient,id:string):Promise<{lines:TrailLine[];map_date:string|null}>{
 const rows=checked(await db.from('trail_lines').select('id,name,number,width,vehicles,dates_open,miles,line,map_date').eq('track_id',id).order('name').limit(5000)) as Row[];
 const dates=rows.map(r=>r.map_date as string|null).filter((d):d is string=>!!d).sort();
 return {map_date:dates.at(-1)??null,lines:rows.map(r=>({id:r.id as string,name:(r.name as string)??'',number:(r.number as string)??'',width:(r.width as TrailWidth|'unknown')??'unknown',
  vehicles:(r.vehicles??{}) as Record<string,string>,dates_open:(r.dates_open as string)??'',miles:r.miles==null?null:Number(r.miles),line:typeof r.line==='string'?decodePolyline(r.line):Array.isArray(r.line)?r.line as [number,number][]:[]})).filter(l=>l.line.length>1)};
}

const dayOf=(f:RaceForecast):DayForecast=>f.available?{available:true,date:f.date,day:f.day,night:f.night,high_f:f.high_f,low_f:f.low_f,rain_chance_pct:f.rain_chance_pct,wind:f.wind,rain_days_before:f.rain_days_before}:{available:false,reason:f.reason.replace('This track has','This place has').replace('the race date','that day')};
const daySchema=z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const addDay=(d:string)=>new Date(Date.parse(d+'T12:00:00Z')+86400_000).toISOString().slice(0,10);

/** Today's and tomorrow's forecast at a place, `day` being the rider's own today. Best effort, like race-day weather. */
export async function placeWeather(db:SupabaseClient,id:string,day:string,forecast=raceForecast):Promise<PlaceWeather>{
 const p=await placeDetail(db,id);
 const [today,tomorrow]=await Promise.all([forecast(p.lat,p.lng,day,day),forecast(p.lat,p.lng,addDay(day),day)]);
 return {today:dayOf(today),tomorrow:dayOf(tomorrow)};
}

export const suggestionSchema=z.object({name:z.string().trim().min(2).max(120),kind:z.enum(['track','riding_area']),city:z.string().trim().max(80).default(''),
 state:z.string().trim().min(2).max(40),lat:z.number().min(-90).max(90).nullable().default(null),lng:z.number().min(-180).max(180).nullable().default(null),
 note:z.string().trim().max(600).default('')}).strict().refine(v=>(v.lat==null)===(v.lng==null),'A location needs both numbers.');
const SUGGESTION_FIELDS='id,name,kind,city,state,lat,lng,note,status,created_at';
/** A rider's own suggestions, newest first. */
export async function mySuggestions(db:SupabaseClient,owner:string):Promise<PlaceSuggestion[]>{
 return (checked(await db.from('place_suggestions').select(SUGGESTION_FIELDS).eq('user_id',owner).order('created_at',{ascending:false}).limit(30))??[]) as PlaceSuggestion[];
}
/** Save a suggestion for review. Nothing is listed here: review adds the place to tracks. At most five waiting per rider. */
export async function suggestPlace(db:SupabaseClient,owner:string,input:unknown,admin:SupabaseClient=adminDb()):Promise<PlaceSuggestion>{
 const data=suggestionSchema.parse(input);
 if([data.name,data.city,data.state,data.note].some(t=>t&&objectionable(t)))throw new HttpError(422,'That wording isn’t allowed here. Edit it and try again.');
 const waiting=(await mySuggestions(db,owner)).filter(s=>s.status==='pending');
 if(waiting.length>=MAX_PENDING_SUGGESTIONS)throw new HttpError(429,SUGGEST_COPY.limit);
 if(waiting.some(s=>s.name.toLowerCase()===data.name.toLowerCase()&&s.state.toLowerCase()===data.state.toLowerCase()))throw new HttpError(409,'You already sent that one. It’s being checked.');
 return checked(await admin.from('place_suggestions').insert({...data,user_id:owner}).select(SUGGESTION_FIELDS).single()) as PlaceSuggestion;
}

export async function handleWhereToRide(url:URL,path:string,method:string,db:SupabaseClient,req?:Request,owner?:string):Promise<Response|null>{
 if(path==='/api/place-suggestions'&&req&&owner){
  if(method==='GET')return new Response(JSON.stringify(await mySuggestions(db,owner)),{headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  if(method==='POST')return new Response(JSON.stringify(await suggestPlace(db,owner,await readJson(req))),{status:201,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 }
 if(method!=='GET')return null;
 if(path==='/api/where-to-ride')return json(await placeList(db));
 if(path==='/api/riding-area')return json(await placeDetail(db,idSchema.parse(url.searchParams.get('id'))));
 if(path==='/api/trail-lines')return json(await trailLines(db,idSchema.parse(url.searchParams.get('id'))));
 if(path==='/api/place-weather')return json(await placeWeather(db,idSchema.parse(url.searchParams.get('id')),daySchema.parse(url.searchParams.get('day'))));
 return null;
}
