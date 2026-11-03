// Engineering numbers for this rider on this bike (shared/suspension-physics.ts), fetched only when the question is about
// how the bike handles or is set up. Reads the bike's own published chassis values; never blocks the answer.
import type {SupabaseClient} from '@supabase/supabase-js';
import type {Bike} from '../shared/types.ts';
import {searchBikeClaims} from './claims.ts';
import {physicsContext} from '../shared/suspension-physics.ts';
import {engineContext,ENGINE_ABOUT} from '../shared/engine-physics-context.ts';

const ABOUT=/\b(sag|spring|preload|harsh|stiff|soft|wallow|dives?|diving|bottom(s|ing)?|kicks?|headshake|shake|wobble|unstable|stable|stability|turn(s|ing)? in|pushes|pushing|tucks|steer(s|ing)?|oversteer|understeer|triple clamps?|offset|fork height|tubes? (up|down)|slide the fork|rake|trail|geometry|clickers?|compression|rebound|damping|heat|hot|temperature|fade|setup|set up|suspension|fork|shock)\b/i;
const n=(v:unknown)=>v==null||v===''||!Number.isFinite(Number(String(v).replace(/[^\d.]/g,'')))?undefined:Number(String(v).replace(/[^\d.]/g,''));
/** Suspension and chassis numbers when the question is about handling; drivetrain, air and engine numbers when it is about
 *  gearing, jetting or the engine. Each part is left out when it has nothing to say. */
export async function physicsFor(db:SupabaseClient,bike:Bike|null,texts:string[],env:{tracks?:{name:string;elevation_ft:number|null}[];raceTrack?:string|null;forecastHighF?:number|null;raceMode?:boolean}={}){
 if(!bike)return null;
 const [chassis,engine]=await Promise.all([chassisFor(db,bike,texts),engineFor(db,bike,texts,env)]);
 if(!chassis&&!engine)return null;
 return {...(chassis??{}),...(engine??{})};
}
async function engineFor(db:SupabaseClient,bike:Bike,texts:string[],env:{tracks?:{name:string;elevation_ft:number|null}[];raceTrack?:string|null;forecastHighF?:number|null;raceMode?:boolean}){
 try{
  const text=texts.join(' ');
  const claims=ENGINE_ABOUT.test(text)||env.raceMode?await searchBikeClaims(db,bike,['bore stroke compression ratio displacement','fuel system carburetor fuel injection throttle body','chain size drive chain links sprocket']):[];
  const track=(env.raceTrack?env.tracks?.find(t=>t.name.toLowerCase()===env.raceTrack!.toLowerCase()):undefined)??env.tracks?.find(t=>t.elevation_ft!=null);
  return engineContext(text,{model:bike.model,configuration:(bike.configuration??{}) as Record<string,unknown>,statements:claims.map(c=>c.statement),
   track:track&&track.elevation_ft!=null?{name:track.name,elevationFt:track.elevation_ft}:null,forecastHighF:env.forecastHighF??null,raceMode:env.raceMode===true});
 }catch{return null;}
}
async function chassisFor(db:SupabaseClient,bike:Bike,texts:string[]){
 if(!ABOUT.test(texts.join(' ')))return null;
 try{
  const claims=await searchBikeClaims(db,bike,['caster trail steering head angle wheelbase','riding sag static sag spring rate','fork offset suspension travel front tire size']);
  const cfg=(bike.configuration??{}) as Record<string,unknown>;
  const rate=(v:unknown)=>{const s=String(v??'');const m=s.match(/([\d.]+)\s*(N\/mm|kg\/mm|lb)/i);if(!m)return undefined;const x=Number(m[1]);return /kg/i.test(m[2])?x*9.80665:/lb/i.test(m[2])?x*4.4482216/25.4:x;};
  return physicsContext(claims.map(c=>c.statement),{gearedWeightLb:n(cfg.geared_weight_lb),raceSagMm:n(cfg.rider_sag_mm),freeSagMm:n(cfg.free_sag_mm),shockSpringNmm:rate(cfg.shock_spring_rate),forkSpringNmm:rate(cfg.fork_spring_rate),forkHeightMm:n(cfg.fork_height_mm)});
 }catch{return null;}
}
