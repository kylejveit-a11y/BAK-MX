/** Find a part (docs/plans/PARTS_HUNTER.md): search words, where-to-buy links and the one quiet offer under an Ask BAK
 *  answer. Pure and shared by the server, the website and the app. Kyle's rules: never push sales, rank by fit and never
 *  by payout, say nothing rather than point at something that may not fit. */
import type {CatalogPart} from './parts-picker.ts';
import {partSystems,type PartSystem} from './installed-parts.ts';
import {partTypes,typeOf} from './part-types.ts';
import {partGuide,kindOf} from './part-plain.ts';

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

export type FoundPart={kind:'factory'|'aftermarket';brand:string;name:string;part_number:string;where:string;stores:StoreLink[];
 /** every part number on file for this product (versions, sizes, front and rear); part_number is the first */
 numbers?:string[];
 /** which end of the bike, when the name says so */
 position?:'front'|'rear';
 /** one line on what it is or changes, when on file */
 note?:string;
 /** the kind of part inside its system (Auto clutch, Plates, Fork springs…), for the browse filters */
 type?:string;
 /** lowest price seen at the stores on file, in US dollars, when one is on file (as last checked, not live) */
 price_from?:number;
 /** colours or sizes the maker lists for this product */
 options?:string[];
 /** which version of this kind of part it is, in plain words (Sintered: the hardest-wearing pad…) */
 variant?:{name:string;plain:string}};
/** Front or rear, read from the part's own name. */
export function positionOf(name:string):'front'|'rear'|undefined{
 const front=/\b(front|fr\.?)\b/i.test(name),rear=/\b(rear|rr\.?)\b/i.test(name);return front===rear?undefined:front?'front':'rear';
}
const splitNumbers=(pn:string)=>[...new Set(pn.split(/[,;]\s*/).map(x=>x.trim()).filter(x=>x.length>=3&&!/-$/.test(x)))];
export type StoreLink={store:string;url:string;how:'listing'|'search';
 /** the store's price for this product in US dollars as last checked, when on file */
 price?:number};
/** '429.00 USD' -> 429. Only plain US-dollar prices; anything else is left out rather than guessed. */
export function usd(price?:string):number|undefined{const m=/^\s*\$?(\d{1,5}(?:\.\d{1,2})?)\s*(USD)?\s*$/i.exec(price??'');if(!m)return undefined;const n=Number(m[1]);return n>0?n:undefined;}
/** Where to buy. Checked by hand on 2026-11-21 with real part numbers from the parts lists on file, because a store
 *  that cannot look a part up by the maker's number is no use (Kyle: "just pulling the store with a part number they
 *  can't identify isn't really a tool"):
 *  - MotoSport has a page per factory part number for Honda, Yamaha, Kawasaki, KTM, Husqvarna and GasGas (not Triumph).
 *  - Partzilla's search finds the exact factory part for Honda, Yamaha, Kawasaki and Suzuki (it does not sell KTM-group or Triumph).
 *  - Rocky Mountain's search does NOT understand factory part numbers (it returned unrelated products), so it is not used for them.
 *  - Aftermarket parts carry the store pages already on file for that exact product; nothing is guessed. */
const MOTOSPORT_OEM=new Set(['honda','yamaha','kawasaki','ktm','husqvarna','gasgas']);
const PARTZILLA_OEM=new Set(['honda','yamaha','kawasaki','suzuki']);
const NOT_A_STORE=/scene7|cloudfront|cdn\.|\.(png|jpe?g|webp|pdf)(\?|$)/i;
export function storeLinks(p:{kind:'factory'|'aftermarket';brand:string;name:string;part_number:string;links?:{seller:string;url:string;price?:string}[]}):StoreLink[]{
 const out:StoreLink[]=[];const seen=new Set<string>();
 for(const l of p.links??[]){if(!/^https:\/\//.test(l.url)||NOT_A_STORE.test(l.url)||NOT_A_STORE.test(l.seller)||seen.has(l.seller))continue;seen.add(l.seller);const price=usd(l.price);out.push({store:l.seller,url:l.url,how:'listing',...(price?{price}:{})});if(out.length>=4)break;}
 const pn=p.part_number.trim();
 if(p.kind==='factory'){
  if(!pn)return out;const make=p.brand.toLowerCase().replace(/[^a-z]/g,'');
  if(MOTOSPORT_OEM.has(make))out.push({store:'MotoSport',url:`https://www.motosport.com/oem-parts/part-number/${encodeURIComponent(pn)}`,how:'listing'});
  if(PARTZILLA_OEM.has(make))out.push({store:'Partzilla',url:`https://www.partzilla.com/search?q=${encodeURIComponent(pn)}`,how:'listing'});
  return out;
 }
 // An aftermarket part with no store page on file: a word search by brand and name at a store whose search takes words.
 if(!out.length){const q=encodeURIComponent(`${p.brand} ${p.name}`.trim().slice(0,80));if(q)out.push({store:'MotoSport',url:`https://www.motosport.com/search?textsearch=${q}`,how:'search'});}
 return out;
}

/** One aftermarket product as a card: brand, name, what it is, options, store pages and the lowest price on file. */
function productCard(p:CatalogPart,type?:string):FoundPart{
 const numbers=splitNumbers(p.pn),position=positionOf(p.name),note=(p.desc||p.what||'').trim();
 const stores=storeLinks({kind:'aftermarket',brand:p.brand,name:p.name,part_number:p.pn,links:p.links});
 const prices=stores.map(s=>s.price).filter((n):n is number=>!!n),options=[...new Set((p.opts??[]).map(o=>o.label.replace(/^[A-Z0-9][A-Z0-9.-]{4,}\s*=\s*/,'').replace(/:\s*[A-Z0-9][A-Z0-9.-]{5,}$/,'').trim()).filter(Boolean))].slice(0,12);
 const variant=kindOf(p.system==='brakes'&&/\bbar pads?\b|cross ?bar/i.test(p.name)?'controls':p.system,type,p.name);
 return {kind:'aftermarket',brand:p.brand,name:p.name,part_number:numbers[0]??'',where:p.system,numbers,stores,...(type?{type}:{}),...(variant?{variant}:{}),...(position?{position}:{}),...(note?{note:note.length>140?note.slice(0,137).trimEnd()+'…':note}:{}),...(prices.length?{price_from:Math.min(...prices)}:{}),...(options.length>1?{options}:{})};
}
/** Aftermarket parts on this bike's list that match the rider's words, best match first. Payout is never an input. */
export function findAftermarket(parts:CatalogPart[],query:string,limit=60):FoundPart[]{
 const patterns=termPatterns(query);if(!patterns.length)return [];
 const scored:{p:CatalogPart;s:number}[]=[];
 for(const p of parts){if(/\[(open box|previously installed|blemished)[^\]]*\]/i.test(p.name))continue;const name=`${p.brand} ${p.name}`;if(!hits(`${name} ${p.system}`,patterns))continue;
  scored.push({p,s:(hits(p.name,patterns)?4:0)+(p.verified?2:0)+(p.pn?1:0)+(p.links.length?1:0)});}
 scored.sort((a,b)=>b.s-a.s||a.p.brand.localeCompare(b.p.brand)||a.p.name.localeCompare(b.p.name));
 // One card per product: the same brand and name listed under several part numbers (versions, front and rear sets)
 // is one product with several numbers, not a wall of identical rows.
 const byProduct=new Map<string,FoundPart>();const out:FoundPart[]=[];
 for(const {p} of scored){const key=`${p.brand}|${p.name}`.toLowerCase();const numbers=splitNumbers(p.pn);
  const have=byProduct.get(key);
  if(have){for(const n of numbers)if(!have.numbers!.includes(n))have.numbers!.push(n);if(!have.stores.length)have.stores=storeLinks({kind:'aftermarket',brand:p.brand,name:p.name,part_number:p.pn,links:p.links});continue;}
  if(out.length>=limit)continue;
  const part=productCard(p,typeOf(p.system,p.name)??undefined);
  byProduct.set(key,part);out.push(part);}
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

/* ------------------------------------------------------------------ Browse by system */
/** How the factory parts list names each system, so a system page can show the maker's parts beside the aftermarket ones. */
const FACTORY_SYSTEM:Record<PartSystem,string>={suspension:'(fork|shock|suspension|linkage|swing ?arm)',chassis:'(frame|triple clamp|steering|chain guide|subframe)',engine:'(piston|cylinder|crank(shaft|case)?|cam(shaft)?|valve|radiator|water pump|cooling)',
 intake:'(air filter|air cleaner|air box|airbox|intake|element)',exhaust:'(exhaust|muffler|silencer|manifold)',tuning:'(throttle body|injection|injector|fuel pump|carburetor|ecu|control unit)',clutch:'clutch',
 gearing:'(sprocket|chain|drive)',brakes:'brake',wheels:'(wheel|tire|rim|spoke|hub)',controls:'(handlebar|handle|grip|lever|footrest|foot ?peg|throttle grip|cable)',protection:'(guard|skid|protector)',body:'(seat|fender|shroud|tank|number plate|side cover|spoiler|decal)'};
export const isPartSystem=(k:string):k is PartSystem=>partSystems.some(s=>s.key===k);
export const factorySystemPatterns=(system:PartSystem):string[]=>[FACTORY_SYSTEM[system]];
const OTHER='Small parts and accessories';
/** Everything on this bike's aftermarket list for one system, one card per product, ordered by kind of part then brand.
 *  `types` lists the kinds present with counts, in the order riders think about that system. */
export function browseSystem(parts:CatalogPart[],system:PartSystem,limit=240):{parts:FoundPart[];types:{label:string;count:number}[]}{
 const order=[...(partTypes[system]??[]).map(t=>t.label),OTHER];
 const byProduct=new Map<string,FoundPart>();
 for(const p of parts){if(p.system!==system||p.service)continue;const key=`${p.brand}|${p.name}`.toLowerCase();const numbers=splitNumbers(p.pn);
  const have=byProduct.get(key);if(have){for(const n of numbers)if(!have.numbers!.includes(n))have.numbers!.push(n);continue;}
  byProduct.set(key,productCard(p,typeOf(system,p.name)??OTHER));}
 const all=[...byProduct.values()].sort((a,b)=>order.indexOf(a.type!)-order.indexOf(b.type!)||a.brand.localeCompare(b.brand)||a.name.localeCompare(b.name));
 const types=order.map(label=>({label,count:all.filter(p=>p.type===label).length})).filter(t=>t.count>0);
 return {parts:all.slice(0,limit),types};
}

/* ------------------------------------------------------------------ Shop view (2026-11-28 overhaul) */
export type ShopSort='type'|'price_low'|'price_high'|'brand';
export type ShopFilters={type?:string;brand?:string;position?:'front'|'rear';sort?:ShopSort;limit?:number;offset?:number};
const SECOND_HAND=/\[(open box|previously installed|blemished)[^\]]*\]/i;
/** A few products sit under the wrong system in the lists (handlebar pads filed under brakes because of the word "pad").
 *  The shop reads the system through this so they show where a rider would look. */
export function shopSystemOf(p:{system:PartSystem;name:string}):PartSystem{
 if(p.system==='brakes'&&/\b(cross ?bar|bar) pads?\b|\bhandlebar pad\b/i.test(p.name))return 'controls';
 return p.system;
}
const FIDDLY=/\b(retaining pins?|pin kit|pad pins?|bolts?|banjo|bleeder|hardware)\b/i;
/** One system's products for this bike, filtered and sorted on the whole list before the page is cut, so "cheapest first"
 *  is the cheapest of everything on file and not of the first screenful. Open-box and previously-installed listings are
 *  left out: they are one-off items a store may no longer have. */
export function shopSystem(parts:CatalogPart[],system:PartSystem,f:ShopFilters={}):{parts:FoundPart[];types:{label:string;count:number}[];brands:{name:string;count:number}[];total:number;guide?:{what:string;kinds:{name:string;plain:string}[]}}{
 const order=[...(partTypes[system]??[]).map(t=>t.label),OTHER];
 const byProduct=new Map<string,FoundPart>();
 for(const p of parts){if(shopSystemOf(p)!==system||p.service||SECOND_HAND.test(p.name))continue;const key=`${p.brand}|${p.name}`.toLowerCase();
  const have=byProduct.get(key);if(have){for(const n of splitNumbers(p.pn))if(!have.numbers!.includes(n))have.numbers!.push(n);continue;}
  byProduct.set(key,productCard(p,FIDDLY.test(p.name)?OTHER:typeOf(system,p.name)??OTHER));}
 const all=[...byProduct.values()];
 const types=order.map(label=>({label,count:all.filter(p=>p.type===label).length})).filter(t=>t.count>0);
 let list=f.type?all.filter(p=>p.type===f.type):all;
 const brandCount=new Map<string,number>();for(const p of list)brandCount.set(p.brand,(brandCount.get(p.brand)??0)+1);
 const brands=[...brandCount].map(([name,count])=>({name,count})).sort((a,b)=>a.name.localeCompare(b.name));
 if(f.brand)list=list.filter(p=>p.brand===f.brand);
 if(f.position)list=list.filter(p=>p.position===f.position);
 const byName=(a:FoundPart,b:FoundPart)=>a.brand.localeCompare(b.brand)||a.name.localeCompare(b.name);
 const priced=(p:FoundPart)=>p.price_from!==undefined;
 if(f.sort==='price_low')list.sort((a,b)=>Number(priced(b))-Number(priced(a))||(a.price_from??0)-(b.price_from??0)||byName(a,b));
 else if(f.sort==='price_high')list.sort((a,b)=>Number(priced(b))-Number(priced(a))||(b.price_from??0)-(a.price_from??0)||byName(a,b));
 else if(f.sort==='brand')list.sort(byName);
 else list.sort((a,b)=>order.indexOf(a.type!)-order.indexOf(b.type!)||byName(a,b));
 const offset=Math.max(0,f.offset??0),limit=Math.min(120,Math.max(1,f.limit??60));
 // The plain-words guide for the chosen kind of part, listing only the versions this bike's list actually has.
 const g=f.type?partGuide(system,f.type):null,present=new Set(all.filter(p=>p.type===f.type).map(p=>p.variant?.name));
 return {parts:list.slice(offset,offset+limit),types,brands,total:list.length,...(g?{guide:{what:g.what,kinds:g.kinds.filter(k=>k.always||present.has(k.name)).map(({name,plain})=>({name,plain}))}}:{})};
}
/** The shop's front page for one bike: each system with how many products are on file and its main kinds of part. */
export function partsOverview(parts:CatalogPart[]):{key:PartSystem;label:string;hint:string;count:number;types:string[]}[]{
 return partSystems.map(s=>{const r=shopSystem(parts,s.key,{limit:1});return {key:s.key,label:s.label,hint:s.hint,count:r.types.reduce((n,t)=>n+t.count,0),types:r.types.filter(t=>t.label!==OTHER).slice(0,4).map(t=>t.label)};}).filter(s=>s.count>0);
}
