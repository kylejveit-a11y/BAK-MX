/** Find a part (docs/plans/PARTS_HUNTER.md): search words, where-to-buy links and the one quiet offer under an Ask BAK
 *  answer. Pure and shared by the server, the website and the app. Kyle's rules: never push sales, rank by fit and never
 *  by payout, say nothing rather than point at something that may not fit. */
import type {CatalogPart} from './parts-picker.ts';

const STOP=new Set(['the','and','for','with','my','bike','a','an','of','to','new','need','some','i','on','in','set','kit','part','parts','oem','stock','factory','replacement','replace','find','buy','where','get']);
/** Words riders use and the short forms factory parts lists print. */
const ALIASES:Record<string,string>={rear:'(rear|rr)',front:'(front|fr)',left:'(left|lh|l\\.)',right:'(right|rh|r\\.)',gasket:'(gasket|gskt)',assembly:'(assembly|assy)',bearing:'(bearing|brg)',sprocket:'(sprocket|sprkt)',rotor:'(rotor|disc|disk)',disc:'(rotor|disc|disk)',disk:'(rotor|disc|disk)',grips:'grips?',tire:'(tire|tyre)',tyre:'(tire|tyre)',lever:'lever',plug:'plug',sparkplug:'spark ?plug',airfilter:'(air filter|element)',filter:'(filter|element)',silencer:'(silencer|muffler)',muffler:'(silencer|muffler)',pipe:'(pipe|chamber|exhaust)',handlebar:'(handlebar|handle ?bar)',bars:'(handlebar|handle ?bar|bars?)',footpegs:'(foot ?pegs?|step)',pegs:'(foot ?pegs?|step)',footpeg:'(foot ?pegs?|step)'};
const esc=(s:string)=>s.replace(/[^a-z0-9]/g,'');
/** The rider's words as case-insensitive patterns; every one must match a part for it to be listed. Max 6 words. */
export function termPatterns(query:string):string[]{
 const words=(query.toLowerCase().normalize('NFKD').match(/[a-z0-9]+/g)??[]).map(esc).filter(w=>w.length>=2&&!STOP.has(w)).slice(0,6);
 return [...new Set(words.map(w=>ALIASES[w]??(w.length>3&&w.endsWith('s')&&!w.endsWith('ss')?`${w.slice(0,-1)}s?`:w.length>3?`${w}s?`:w)))];
}
const hits=(text:string,patterns:string[])=>patterns.every(p=>new RegExp(`(^|[^a-z0-9])${p}($|[^a-z0-9])`,'i').test(text));

export type FoundPart={kind:'factory'|'aftermarket';brand:string;name:string;part_number:string;where:string;stores:StoreLink[]};
export type StoreLink={store:string;url:string;how:'listing'|'search'};
/** Search pages checked by hand 2026-11-21 (each opened and returned results for a real search). */
const SEARCH:{store:string;url:(q:string)=>string;factory:boolean;aftermarket:boolean}[]=[
 {store:'Rocky Mountain ATV/MC',url:q=>`https://www.rockymountainatvmc.com/search?term=${q}`,factory:true,aftermarket:true},
 {store:'MotoSport',url:q=>`https://www.motosport.com/search?textsearch=${q}`,factory:true,aftermarket:true},
 {store:'Partzilla',url:q=>`https://www.partzilla.com/search?q=${q}`,factory:true,aftermarket:false},
];
/** Where to buy: store pages already on file for this exact part first, then each store's own search for the part
 *  number (or brand and name when there is no number). A factory part with no part number gets no links. */
export function storeLinks(p:{kind:'factory'|'aftermarket';brand:string;name:string;part_number:string;links?:{seller:string;url:string}[]}):StoreLink[]{
 const out:StoreLink[]=[];const seen=new Set<string>();
 for(const l of p.links??[]){if(!/^https:\/\//.test(l.url)||seen.has(l.seller))continue;seen.add(l.seller);out.push({store:l.seller,url:l.url,how:'listing'});}
 const q=p.part_number.trim()||(p.kind==='aftermarket'?`${p.brand} ${p.name}`.trim():'');if(!q)return out;
 for(const s of SEARCH){if(!(p.kind==='factory'?s.factory:s.aftermarket)||seen.has(s.store))continue;out.push({store:s.store,url:s.url(encodeURIComponent(q.slice(0,80))),how:'search'});}
 return out;
}
/** Aftermarket parts on this bike's list that match the rider's words, best match first. Payout is never an input. */
export function findAftermarket(parts:CatalogPart[],query:string,limit=30):FoundPart[]{
 const patterns=termPatterns(query);if(!patterns.length)return [];
 const scored:{p:CatalogPart;s:number}[]=[];
 for(const p of parts){const name=`${p.brand} ${p.name}`;if(!hits(`${name} ${p.system}`,patterns))continue;
  scored.push({p,s:(hits(p.name,patterns)?4:0)+(p.verified?2:0)+(p.pn?1:0)+(p.links.length?1:0)});}
 scored.sort((a,b)=>b.s-a.s||a.p.brand.localeCompare(b.p.brand)||a.p.name.localeCompare(b.p.name));
 const seen=new Set<string>();const out:FoundPart[]=[];
 for(const {p} of scored){const key=`${p.brand}|${p.name}|${p.pn}`.toLowerCase();if(seen.has(key))continue;seen.add(key);
  out.push({kind:'aftermarket',brand:p.brand,name:p.name,part_number:p.pn,where:p.system,stores:storeLinks({kind:'aftermarket',brand:p.brand,name:p.name,part_number:p.pn,links:p.links})});if(out.length>=limit)break;}
 return out;
}

/** Wear parts and consumables a rider replaces, with the words an answer uses and the search to open. */
const NEEDS:[RegExp,string][]=[
 [/\b(front )?brake pads?\b/i,'brake pads'],[/\bchain (and|&) sprockets?\b|\bsprockets?\b/i,'sprocket'],[/\bdrive chain\b|\bnew chain\b|\bchain\b(?= (is|was|has) (worn|stretched|kinked))/i,'chain'],
 [/\bfork seals?\b/i,'fork seal'],[/\bair filter\b/i,'air filter'],[/\bspark plug\b/i,'spark plug'],[/\bclutch plates?\b|\bfriction plates?\b|\bclutch pack\b/i,'clutch plate'],
 [/\bclutch cable\b/i,'clutch cable'],[/\bthrottle cable\b/i,'throttle cable'],[/\bwheel bearings?\b/i,'wheel bearing'],[/\b(steering stem|steering head|head) bearings?\b/i,'steering bearing'],
 [/\blinkage bearings?\b/i,'linkage bearing'],[/\bswing ?arm bearings?\b/i,'swingarm bearing'],[/\bpiston( kit| and rings?)?\b/i,'piston'],[/\btop[- ]end gasket\b|\bhead gasket\b|\bbase gasket\b/i,'gasket'],
 [/\breeds?\b|\breed petals?\b/i,'reed'],[/\boil filter\b/i,'oil filter'],[/\bbrake (rotor|disc)\b/i,'brake rotor'],[/\bchain (slider|guide)\b/i,'chain guide'],[/\bgrips\b/i,'grips'],
 [/\b(front|rear) tire\b|\bnew tires?\b/i,'tire'],[/\bbrake lever\b|\bclutch lever\b/i,'lever'],[/\bradiator hoses?\b/i,'radiator hose'],[/\bwater pump seal\b/i,'water pump seal'],[/\bkick ?start(er)? \w+\b/i,'kickstarter']];
const REPLACE=/\b(replace|replacing|replacement|new (set|one|pair)|fit a new|install a new|needs? (a )?new|order (a|new)|buy (a|new)|swap (it|them|the)|worn out|past (its|the) (wear|service) limit|is due|are due|time for (a )?new)\b/i;
const SAFETY=/\b(do not ride|don'?t ride|stop riding|unsafe to ride|not safe to ride|fuel leak|leaking fuel|fire|brake failure|no brakes|call 911|injur)/i;
/** The one quiet line under an Ask BAK answer. Returns the search to open, or null (the usual case). Only when the answer
 *  itself says a named wear part needs replacing, the answer is not still asking the rider questions, it is not a safety
 *  stop, and nothing was offered earlier in this conversation. The caller still checks that the bike has a matching part. */
export function partOffer(answer:string,opts:{offeredAlready:boolean;enabled:boolean}):{query:string}|null{
 if(!opts.enabled||opts.offeredAlready||!answer||answer.length<80)return null;
 if(SAFETY.test(answer))return null;
 if(/\?\s*$/.test(answer.trim())||(answer.match(/\?/g)?.length??0)>=2)return null;
 for(const sentence of answer.split(/(?<=[.!?\n])\s+/)){
  if(!REPLACE.test(sentence))continue;
  if(/\b(don'?t|do not|no need to|not yet|before you|rather than|instead of|unless|if (it|they|the))\b/i.test(sentence))continue;
  for(const [re,query] of NEEDS)if(re.test(sentence))return {query};
 }
 return null;
}
