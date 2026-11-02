// Parts the rider is weighing up ("Xtrig or Luxon clamps?", "best pipe for my 85", "compare a Rekluse and a Hinson"): the
// matching items from this bike's own parts list, with what BAK's research says about each, so Ask BAK can compare real,
// fitting options instead of guessing. Read from the same public parts files the Garage build sheet uses.
import {decodeFamily,familyOf,type CatalogPart,type FamilyFile} from '../shared/parts-picker.ts';
import {typeOf} from '../shared/part-types.ts';
import type {Bike} from '../shared/types.ts';

const SHOPPING=/\b(vs\.?|versus|compare|comparison|better|best|which (one|is|should|brand)|torn|deciding|decide|choose|pick|should i (get|buy|go with|run)|recommend|worth|upgrade|looking (at|for)|thinking (about|of)|want (a|an|some|new|to (get|buy|try))|new [a-z]+ (for|on)|difference between|or the)\b/i;
const STOP=new Set(['the','and','for','with','kit','set','new','my','bike','want','get','between','which','better','best','should','would','one','tell','about','what','your','that','this','them','compare','are','can','you','looking','thinking','torn','me','is','or','vs','versus','buy','good','which','more','than','from','have','has','part','parts','fits','fit']);
const words=(s:string)=>s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'').match(/[a-z0-9]{3,}/g)?.filter(w=>!STOP.has(w))??[];
const norm=(s:string)=>s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');

const cache=new Map<string,{at:number;file:Promise<FamilyFile|null>}>();
function siteOrigin(){return (process.env.PUBLIC_SITE_URL||'https://bakmx.com').replace(/\/$/,'');}
function loadFamily(name:string){
 const hit=cache.get(name);if(hit&&Date.now()-hit.at<30*60_000)return hit.file;
 const file=fetch(`${siteOrigin()}/parts-catalog/${name}.json`,{signal:AbortSignal.timeout(4000)}).then(r=>r.ok?r.json() as Promise<FamilyFile>:null).catch(()=>{cache.delete(name);return null;});
 cache.set(name,{at:Date.now(),file});return file;
}

export type PartOption={brand:string;part:string;type:string|null;part_number?:string;fits_this_bike:boolean;fit_confidence:string;what_it_changes?:string;caveats?:string;tester_notes?:string[];where_listed?:{seller:string;price?:string}[];service?:boolean};

/** Score a part against the rider's words: a named brand counts most, then the kind of part, then words in its name. */
/** A brand named as a whole word. Short brands (WP, GET, JE) must be written in capitals so "get" or "je" in a sentence don't count. */
function brandHit(brand:string,msg:string){
 const b=brand.trim();if(b.length<2)return false;
 const esc=b.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'[\\s-]*');
 return new RegExp(`(^|[^A-Za-z0-9])${esc}($|[^A-Za-z0-9])`,b.replace(/[^A-Za-z]/g,'').length<=3?'':'i').test(msg);
}
function score(p:CatalogPart,msgRaw:string,msgWords:Set<string>){
 const type=typeOf(p.system,p.name);let s=0;
 if(brandHit(p.brand,msgRaw))s+=6;
 else{const first=p.brand.split(/\s+/)[0]??'';if(first.length>=4&&brandHit(first,msgRaw))s+=5;}
 if(type){const tw=words(type);if(tw.length&&tw.every(w=>msgWords.has(w)||msgWords.has(w.replace(/s$/,''))||msgWords.has(w+'s')))s+=4;}
 for(const w of new Set(words(p.name)))if(msgWords.has(w)||msgWords.has(w.replace(/s$/,'')))s+=1;
 return s;
}
const view=(p:CatalogPart,fits:boolean):PartOption=>({brand:p.brand,part:p.name,type:typeOf(p.system,p.name),...(p.pn?{part_number:p.pn}:{}),fits_this_bike:fits,
 fit_confidence:!fits?'not listed for this bike':p.verified?'maker lists this fit':'dealer or retailer lists this fit',
 ...(p.what?{what_it_changes:p.what}:{}),...(p.caution?{caveats:p.caution}:{}),...(p.testers.length?{tester_notes:p.testers.slice(0,2)}:{}),
 ...(p.links.length?{where_listed:p.links.slice(0,3).map(l=>({seller:l.seller,...(l.price?{price:l.price}:{})}))}:{}),...(p.service?{service:true}:{})});

/** Up to 12 fitting options the rider's message names, plus up to 4 named ones not listed for this bike. Null when the
 *  message isn't about choosing a part or nothing matches. */
export async function partOptionsFor(bike:Bike|null,message:string,history:{role:string;content?:string|null}[]=[]):Promise<{options:PartOption[];not_listed_for_this_bike:PartOption[]}|null>{
 if(!bike)return null;
 const recentRider=history.filter(m=>m.role==='user').slice(-2).map(m=>m.content??'').join(' ');
 const text=`${message} ${SHOPPING.test(message)?'':recentRider}`;
 if(!SHOPPING.test(text))return null;
 const fam=familyOf(bike.manufacturer);if(!fam)return null;
 const file=await loadFamily(fam);if(!file)return null;
 const mine=decodeFamily(file,bike.manufacturer,bike.model,bike.model_year)??[];
 const msgRaw=message+' '+recentRider,msgNorm=norm(msgRaw),msgWords=new Set(words(message+' '+recentRider));
 const ranked=mine.map(p=>({p,s:score(p,msgRaw,msgWords)})).filter(x=>x.s>=5).sort((a,b)=>b.s-a.s||(b.p.verified?1:0)-(a.p.verified?1:0));
 const seen=new Set<string>(),options:PartOption[]=[];
 for(const {p} of ranked){const k=norm(p.brand+p.name);if(seen.has(k))continue;seen.add(k);options.push(view(p,true));if(options.length>=12)break;}
 // A brand the rider named that has nothing listed for this exact bike: say so instead of letting the answer assume it fits.
 const named=new Set(file.brands.filter(b=>brandHit(b,msgRaw)).map(norm));
 const missing:PartOption[]=[];
 if(named.size){
  const mineKeys=new Set(mine.map(p=>norm(p.brand)));
  for(const b of named){if(mineKeys.has(b))continue;
   const idx=file.items.findIndex(it=>norm(file.brands[it.b]??'')===b&&score({brand:file.brands[it.b]??'',name:it.n,system:file.systems[it.s],pn:'',verified:false,what:'',caution:'',testers:[],service:false,links:[]} as CatalogPart,msgRaw,msgWords)>=7);
   if(idx>=0){const it=file.items[idx];missing.push({brand:file.brands[it.b]??'',part:it.n,type:typeOf(file.systems[it.s],it.n),fits_this_bike:false,fit_confidence:'not listed for this bike'});}
   if(missing.length>=4)break;}
 }
 if(!options.length&&!missing.length)return null;
 return {options,not_listed_for_this_bike:missing};
}
