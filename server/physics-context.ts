// Engineering numbers for this rider on this bike (shared/suspension-physics.ts), fetched only when the question is about
// how the bike handles or is set up. Reads the bike's own published chassis values; never blocks the answer.
import type {SupabaseClient} from '@supabase/supabase-js';
import type {Bike} from '../shared/types.ts';
import {searchBikeClaims} from './claims.ts';
import {physicsContext} from '../shared/suspension-physics.ts';

const ABOUT=/\b(sag|spring|preload|harsh|stiff|soft|wallow|dives?|diving|bottom(s|ing)?|kicks?|headshake|shake|wobble|unstable|stable|stability|turn(s|ing)? in|pushes|pushing|tucks|steer(s|ing)?|oversteer|understeer|triple clamps?|offset|fork height|tubes? (up|down)|slide the fork|rake|trail|geometry|clickers?|compression|rebound|damping|heat|hot|temperature|fade|setup|set up|suspension|fork|shock)\b/i;
const n=(v:unknown)=>v==null||v===''||!Number.isFinite(Number(String(v).replace(/[^\d.]/g,'')))?undefined:Number(String(v).replace(/[^\d.]/g,''));
export async function physicsFor(db:SupabaseClient,bike:Bike|null,texts:string[]){
 if(!bike||!ABOUT.test(texts.join(' ')))return null;
 try{
  const claims=await searchBikeClaims(db,bike,['caster trail steering head angle wheelbase','riding sag static sag spring rate','fork offset suspension travel front tire size']);
  const cfg=(bike.configuration??{}) as Record<string,unknown>;
  const rate=(v:unknown)=>{const s=String(v??'');const m=s.match(/([\d.]+)\s*(N\/mm|kg\/mm|lb)/i);if(!m)return undefined;const x=Number(m[1]);return /kg/i.test(m[2])?x*9.80665:/lb/i.test(m[2])?x*4.4482216/25.4:x;};
  return physicsContext(claims.map(c=>c.statement),{gearedWeightLb:n(cfg.geared_weight_lb),raceSagMm:n(cfg.rider_sag_mm),freeSagMm:n(cfg.free_sag_mm),shockSpringNmm:rate(cfg.shock_spring_rate),forkSpringNmm:rate(cfg.fork_spring_rate),forkHeightMm:n(cfg.fork_height_mm)});
 }catch{return null;}
}
