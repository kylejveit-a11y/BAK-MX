/** Finds the tracks a rider names ("racing Dade City this weekend", "anyone ridden Croom?") in their own words.
 *  A track matches on its name, an alias, or its name without the generic ending ("Gatorback Cycle Park" → "Gatorback"),
 *  as whole words. Short or generic leftovers never match on their own, so "I'm in Orlando" is not a track. */
export type TrackName={id:string;name:string;aliases:string[]};
const GENERIC=/\b(motocross|moto[- ]?x|mx|raceway|race ?way|cycle|cycles|park|parks|track|tracks|motorsports?|motoplex|speedway|facility|complex|ranch|ohv|area|trail|system|recreation|the|at|of|and)\b/gi;
// Everyday words, people's names, regions and landmarks that leftovers can collapse to: never a track on their own.
const COMMON=new Set(['florida','north','south','central','east','west','orlando','tampa','miami','jacksonville','ocala','daytona','sand','mud','clay','track','county','city','motocross',
 'quick','quick racing','sunshine','sandbox','harold','milton','the glen','central florida','north florida','marion county','lake okeechobee','county line','seminole','pinellas','big cypress',
 'longleaf','rodman','delancy','charlie creek','florida trails','florida atv','ocala adventure','santa rosa','bartow sports','central florida offroad','ocala national forest','east bay','hard rock','cross roads','dirt stars']);
const clean=(s:string)=>s.toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
/** Every phrase that should be recognised as this track, longest first. */
export function trackPhrases(t:TrackName):string[]{
 const out=new Set<string>();
 for(const raw of [t.name,...t.aliases]){
  const full=clean(raw);if(full.length>=4&&!COMMON.has(full))out.add(full);
  const core=clean(raw.replace(/\(.*?\)/g,'').replace(GENERIC,' '));
  if(core.length>=5&&!COMMON.has(core))out.add(core);
 }
 return [...out].sort((a,b)=>b.length-a.length);
}
/** Tracks named in the text, best (longest phrase) first, at most `limit`. */
export function matchTracks<T extends TrackName>(text:string,tracks:T[],limit=2):T[]{
 const hay=' '+clean(text)+' ',hits:{t:T;len:number}[]=[];
 for(const t of tracks){
  const p=trackPhrases(t).find(ph=>hay.includes(' '+ph+' '));
  if(p)hits.push({t,len:p.length});
 }
 return hits.sort((a,b)=>b.len-a.len).slice(0,limit).map(h=>h.t);
}
