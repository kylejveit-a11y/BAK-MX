// Aftermarket fork and shock springs sold for the rider's exact bike, with the rates each company offers, so a spring answer
// can name real springs near the rate BAK worked out (or the maker's rider-weight table) instead of stopping at a number.
// Read from the same public parts files as the Garage build sheet. Rates are converted to N/mm; the company's own label is
// kept beside it. A company's rider-weight guide is passed on only when that company published one for this part.
import {decodeFamily,familyOf,type CatalogPart} from '../shared/parts-picker.ts';
import type {Bike} from '../shared/types.ts';
import {loadFamily} from './part-options.ts';

export const SPRING_ABOUT=/\b(springs?|sprung|re-?spring|spring rates?|sag|too (soft|stiff) for (me|my)|my weight|i weigh|i'm \d{2,3}|\d{2,3}\s?(lb|lbs|pounds|kg|kilos?))\b/i;
const KG=9.80665;
type Kind='shock'|'fork';
export type SpringLine={brand:string;part:string;rates_nmm:number[];listed_in:'kg/mm'|'N/mm';closest?:{rate_nmm:number;listed_as:string;part_number?:string};next_softer?:string;next_stiffer?:string};
export type SpringOptions={about:string;wanted?:{shock_nmm?:number;fork_nmm?:number;from:string};shock?:SpringLine[];fork?:SpringLine[];company_weight_guides?:{brand:string;part:string;guide:string}[];also_sold_by?:string[]};

const NOT_A_SPRING=/\b(perch|retainer|hook|collar|guide|seat|adjuster|caliper|brake|exhaust|clutch|valve|cam|conversion|cartridge|kit|heat shield|pressure spring)\b/i;
function kindOf(name:string):Kind|null{
 if(NOT_A_SPRING.test(name))return null;
 const s=/\bshock\b/i.test(name),f=/\bfork\b/i.test(name);
 return s&&!f?'shock':f&&!s?'fork':null;
}
const sane=(k:Kind,nmm:number)=>k==='shock'?nmm>=15&&nmm<=110:nmm>=1.5&&nmm<=12;
/** One option label ("4.6kg", ".47kg", "8.4 N/mm = 91410124", "881.0047.1 = 47") as a rate. `unit` carries over within one
 *  part once a label has stated it; a bare number is read by size (a shock is 3-10 in kg/mm and 25+ in N/mm; a fork is
 *  under 1 in kg/mm and 2+ in N/mm for a pair). */
function rateOf(label:string,kind:Kind,unit:'kg'|'N'|null):{nmm:number;unit:'kg'|'N';shown:string}|null{
 const t=label.replace(/…/g,'').trim();
 let m=t.match(/^(\d*\.?\d+)\s*(kg(?:\/mm)?|N(?:\/mm)?)\b/i);
 let v:number|null=null,u:'kg'|'N'|null=null;
 if(m){v=Number(m[1]);u=/^k/i.test(m[2])?'kg':'N';}
 else if((m=t.match(/^(\d*\.?\d+)\s*=\s*\S+$/))){v=Number(m[1]);u=unit;}
 else if((m=t.match(/^[A-Z0-9][A-Z0-9.\-]{4,}\s*=\s*(\d*\.?\d+)$/i))){v=Number(m[1]);u=unit;}
 if(v==null||!Number.isFinite(v))return null;
 if(!u)u=kind==='shock'?(v<12?'kg':'N'):(v<1.5?'kg':'N');
 const q=kind==='shock'?10:100,nmm=Math.round((u==='kg'?v*KG:v)*q)/q;
 if(!sane(kind,nmm))return null;
 return {nmm,unit:u,shown:u==='kg'?`${v} kg/mm`:`${v} N/mm`};
}
const WEIGHT_GUIDE=/\d{2,3}\s*(?:-|to)\s*\d{2,3}\s*(?:lb|lbs|kg)\b/i;

/** Pure: the springs in this bike's parts list as rate lines, nearest to the wanted rates when there are any. */
export function springOptions(parts:CatalogPart[],want:{shockNmm?:number;forkNmm?:number;from?:string}={}):SpringOptions|null{
 const lines:Record<Kind,SpringLine[]>={shock:[],fork:[]},seen=new Set<string>(),guides:{brand:string;part:string;guide:string}[]=[],also=new Set<string>();
 for(const p of parts){
  if(p.system!=='suspension'||!/\bsprings?\b/i.test(p.name))continue;
  const text=[p.what,p.caution].filter(Boolean).join(' ');
  if(WEIGHT_GUIDE.test(text)&&/spring|N\/mm|kg\/mm|\bN\b/i.test(text)&&guides.length<3&&!guides.some(g=>g.brand===p.brand&&g.guide===text.slice(0,700)))guides.push({brand:p.brand,part:p.name,guide:text.slice(0,700)});
  const kind=kindOf(p.name);if(!kind)continue;
  // A store listing that covers every bike in one long drop-down is not this bike's rate list: name the company only.
  if(!p.opts?.length||p.opts.length>=20){also.add(p.brand);continue;}
  let unit:'kg'|'N'|null=null;const got:{nmm:number;shown:string;pn:string}[]=[];
  for(const o of p.opts){const r=rateOf(o.label,kind,unit);if(!r)continue;unit=r.unit;got.push({nmm:r.nmm,shown:r.shown,pn:o.pn});}
  if(got.length<2)continue;
  got.sort((a,b)=>a.nmm-b.nmm);
  const key=p.brand+'|'+kind+'|'+got.map(g=>g.nmm).join(',');if(seen.has(key))continue;seen.add(key);
  const line:SpringLine={brand:p.brand,part:p.name,rates_nmm:got.map(g=>g.nmm),listed_in:unit==='kg'?'kg/mm':'N/mm'};
  const target=kind==='shock'?want.shockNmm:want.forkNmm;
  if(target!=null){
   let i=0;for(let j=1;j<got.length;j++)if(Math.abs(got[j].nmm-target)<Math.abs(got[i].nmm-target))i=j;
   // Outside what this company lists: name no closest rate rather than point at the end of the range as if it fitted.
   const step=got.length>1?(got[got.length-1].nmm-got[0].nmm)/(got.length-1):0;
   if(Math.abs(got[i].nmm-target)<=Math.max(step,kind==='shock'?2:0.2)){
    line.closest={rate_nmm:got[i].nmm,listed_as:got[i].shown,...(got[i].pn?{part_number:got[i].pn}:{})};
    if(got[i-1])line.next_softer=got[i-1].shown;if(got[i+1])line.next_stiffer=got[i+1].shown;
   }
  }
  lines[kind].push(line);
 }
 const trim=(a:SpringLine[])=>a.sort((x,y)=>(y.closest?1:0)-(x.closest?1:0)||y.rates_nmm.length-x.rates_nmm.length).slice(0,5);
 const shock=trim(lines.shock),fork=trim(lines.fork);
 const others=[...also].filter(b=>![...shock,...fork].some(l=>l.brand===b)).slice(0,6);
 if(!shock.length&&!fork.length&&!guides.length)return null;
 return {about:'Aftermarket springs listed for this exact bike and the rates each company offers, in N/mm with the company\'s own label. closest is the listed rate nearest the wanted rate; it is not that company\'s recommendation for this rider. also_sold_by are companies that list springs for this bike without a per-bike rate list on file.',
  ...(want.shockNmm!=null||want.forkNmm!=null?{wanted:{...(want.shockNmm!=null?{shock_nmm:want.shockNmm}:{}),...(want.forkNmm!=null?{fork_nmm:want.forkNmm}:{}),from:want.from??'worked out from sag'}}:{}),
  ...(shock.length?{shock}:{}),...(fork.length?{fork}:{}),...(guides.length?{company_weight_guides:guides}:{}),...(others.length?{also_sold_by:others}:{})};
}

type SpringCheck={suggested_shock_spring_nmm?:number;suggested_fork_spring_nmm?:number;by_maker_table?:string};
/** For Ask BAK: only when the rider is talking about springs, sag or their weight. Never blocks the answer. */
export async function springOptionsFor(bike:Bike|null,text:string,physics:unknown):Promise<SpringOptions|null>{
 if(!bike||!SPRING_ABOUT.test(text))return null;
 const fam=familyOf(bike.manufacturer);if(!fam)return null;
 const file=await loadFamily(fam);if(!file)return null;
 const mine=decodeFamily(file,bike.manufacturer,bike.model,bike.model_year);if(!mine?.length)return null;
 const sc=(physics as {spring_check?:SpringCheck}|null)?.spring_check;
 const table=sc?.by_maker_table?.match(/table: ([\d.]+) N\/mm/);
 const shockNmm=sc?.suggested_shock_spring_nmm??(table?Number(table[1]):undefined);
 return springOptions(mine,{shockNmm,forkNmm:sc?.suggested_fork_spring_nmm,from:sc?.suggested_shock_spring_nmm!=null?'worked out from the rider\'s race sag and free sag':'the maker\'s rider-weight table'});
}
