/** The Garage parts picker, shared by the web app and the iPhone app: catalog decoding, one name per maker, part types,
 *  work done and who did it, and the fuel-system filter. Each app supplies only its own fetch and screens. */
import type {PartSystem} from './installed-parts.ts';
import {workProviders,type WorkProvider} from './work-providers.ts';
import {partTypes,typeOf} from './part-types.ts';
import type {FuelSystem} from './fuel-system.ts';
export {partTypes,typeOf};
/** One part a rider can pick for their bike. r marks a researched part (it carries what it changes and tester notes). */
export type CatalogPart={brand:string;name:string;system:PartSystem;pn:string;r?:string;verified:boolean;what:string;caution:string;testers:string[];service:boolean;fuel?:'c'|'i';links:{seller:string;url:string;price:string}[]};
export type FamilyFile={v:number;systems:PartSystem[];sellers:Record<string,string>;brands:string[];items:{b:number;n:string;s:number;p?:string;u?:string[][];r?:string;conf?:string;w?:string;c?:string;t?:string[];sv?:number;k?:'c'|'i'}[];bikes:Record<string,number[]>};
const SELLER:Record<string,string>={cg:'Cycle Gear',ms:'MotoSport',kt:'KTM Twins',lg:'Lings',tr:'Triumph dealer',ym:'Yamaha dealer',rs:'Source'};
export const familyOf=(make:string)=>['KTM','Husqvarna','GasGas'].includes(make)?'ktm-family':make==='Triumph'?'triumph':make==='Yamaha'?'yamaha':make==='Honda'?'honda':make==='Kawasaki'?'kawasaki':null;
/** Every listed part for this exact bike in a family file, or null when the bike has no list there. */
export function decodeFamily(f:FamilyFile|null,make:string,model:string,year:number):CatalogPart[]|null{
 const list=f?.bikes[`${make}|${model}|${year}`];
 if(!f||!list)return null;
 const out:CatalogPart[]=[];let idx=0;
 for(const d of list){idx+=d;const it=f.items[idx];if(!it)continue;
  out.push({brand:f.brands[it.b]??'',name:it.n,system:f.systems[it.s],pn:it.p??'',r:it.r,verified:it.conf==='high',what:it.w??'',caution:it.c??'',testers:it.t??[],service:!!it.sv,...(it.k?{fuel:it.k}:{}),
   links:(it.u??[]).map(([code,path,price])=>({seller:SELLER[code]??'Source',url:(f.sellers[code]??'')+path,price:price??''})).filter(l=>/^https:\/\//.test(l.url))});
 }
 return out;
}
export const NOTE_HINT:Partial<Record<PartSystem,string>>={suspension:'Who revalved it, spring rates, oil height, anything non-stock inside',exhaust:'Insert in or out, spark arrester, packing age',tuning:'Map name or tuner, fuel used',gearing:'Exact sprocket sizes if not listed above',engine:'Hours on the top end, compression, other work',wheels:'Tire model and pressures you run'};
const OEM=/^(ktm|ktm powerparts|husqvarna|husqvarna technical accessories|gasgas|gas gas|gasgas technical accessories|yamaha|yamaha gytr|yamaha genuine accessories|gytr|honda|hrc|kawasaki|triumph|triumph genuine accessories)$/i;
const MAKERS=['Akrapovič','FMF','Pro Circuit','Yoshimura','Rekluse','Hinson','WP','Xtrig','Renthal','Acerbis','Polisport','Brembo','Galfer','Twin Air','Neken','Hebo','Moto-Master','Factory Effex','Tusk','Moose Racing','Cycra'];
/** One name per brand: Akrapovič sold through KTM is Akrapovič; an FMF muffler sold by KTM is FMF. */
export function brandOf(c:{brand:string;name:string}){
 if(/akrapovi/i.test(c.brand+' '+c.name))return 'Akrapovič';
 if(OEM.test(c.brand.trim())){const m=MAKERS.find(x=>new RegExp('\\b'+x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i').test(c.name));if(m)return m;return /^ktm/i.test(c.brand)?'KTM PowerParts':canonBrand(c.brand);}
 return canonBrand(c.brand.replace(/\s*\(.*\)$/,''));
}
/** Sellers spell the same maker several ways; riders should see one row per maker. */
const CANON:[RegExp,string][]=[[/^moose( racing)?$/i,'Moose Racing'],[/^vortex( racing)?$/i,'Vortex'],[/^graves( motorsports)?$/i,'Graves Motorsports'],[/^helix( racing products)?$/i,'Helix Racing'],
 [/^all balls( racing)?$/i,'All Balls Racing'],[/^scotts?( performance)?( \/ brp)?$|^brp$/i,'Scotts / BRP'],[/^raptor( titanium)?$/i,'Raptor'],[/^galfer( braking systems)?$/i,'Galfer'],[/^koubalinks?$/i,'KoubaLink'],
 [/^jt( sprockets)?$/i,'JT Sprockets'],[/^supersprox$/i,'Supersprox'],[/^ebc( brakes)?$/i,'EBC'],[/^pro ?taper$/i,'ProTaper'],[/^pro[- ]?x$/i,'Pro-X'],[/^uni( filter)?$/i,'Uni Filter'],[/^ktm powerparts.*$/i,'KTM PowerParts'],
 [/^husqvarna( technical accessories| motorcycles)?$/i,'Husqvarna Technical Accessories'],[/^gas ?gas( technical accessories| parts & accessories)?$/i,'GasGas Technical Accessories'],[/^d\.?i\.?d$/i,'D.I.D'],[/^xtrig$/i,'Xtrig']];
export function canonBrand(b:string){const t=b.trim();for(const [re,name] of CANON)if(re.test(t))return name;return t;}
/** The part name without its brand and the fitment the shop pasted into it ("450/500 2023-2026", "350/450 SX-F/XC-F"). */
export function cleanName(brand:string,name:string){
 let n=name;
 for(const w of [brand,'Akrapovič','Akrapovic','KTM PowerParts','KTM'])if(n.toLowerCase().startsWith(w.toLowerCase()+' '))n=n.slice(w.length+1);
 n=n.replace(/^(?:(?:KTM|Husqvarna|Husky|GAS ?GAS|GasGas)\s*[\/,&]?\s*)+(?=\S)/i,'').replace(/^[\/\s-]+/,'').replace(/"/g,'').replace(/\b(19|20)\d{2}\s*-\s*(19|20)?\d{2}\b/g,'').replace(/\b\d{2}-\d{2}\b/g,'')
  .replace(/\b\d{2,3}(\/\d{2,3})+\b/g,'').replace(/\b(SX-?F|XC-?F|XCF-W|EXC-?F|SMR|SX|XC|MX\/Enduro)(\/(SX-?F|XC-?F|XCF-W|EXC-?F|SMR|SX|XC))*\b/gi,'')
  .replace(/\s*,\s*(?=,|$)/g,'').replace(/\s{2,}/g,' ').replace(/[\s,\-/]+$/,'').trim();
 return n||name;
}
/** Work that isn't a boxed part; picking one asks who did it and what they did. */
export type Work={label:string;kind?:WorkProvider['work'];detail:string;example:string};
export const WORK:Partial<Record<PartSystem,Work[]>>={
 suspension:[{label:'Fork revalved',kind:'suspension',detail:'Valving, springs, oil height',example:'e.g. stiffer mid-valve, 0.50 springs'},{label:'Shock revalved',kind:'suspension',detail:'Valving, spring rate',example:'e.g. more low-speed comp, 5.4 spring'},
  {label:'Fork serviced',kind:'suspension',detail:'Hours since, oil used',example:'e.g. 20 hours ago, stock valving'},{label:'Shock serviced',kind:'suspension',detail:'Hours since',example:'e.g. 20 hours ago'}],
 tuning:[{label:'ECU flashed or remapped',kind:'ecu',detail:'Map name or number, what it’s set up for',example:'e.g. green map, pump gas, FMF pipe'}],
 engine:[{label:'Head ported',detail:'What was done',example:'e.g. ported and polished, new valves'},{label:'Top end rebuilt',detail:'Hours since, piston used',example:'e.g. 5 hours ago, Vertex high comp'},{label:'Bottom end rebuilt',detail:'Hours since',example:'e.g. 30 hours ago'}],
 clutch:[{label:'Clutch rebuilt',detail:'Plates and springs used',example:'e.g. new plates, heavy springs'}],
};
/** Shops that list this exact model first, then this make, then shops with no bike list; one row per shop. The service name is
 *  shown only when the shop lists this model, so a 300 SX never reads "KTM 450 mail-in tuning". */
export function providersFor(kind:WorkProvider['work'],make:string,model:string){
 const rank=(p:WorkProvider)=>p.models.includes(make+'|'+model)?2:p.makes.includes(make)?1:0;
 const m=new Map<string,WorkProvider>();
 for(const p of workProviders.filter(p=>p.work===kind&&(!p.makes.length||p.makes.includes(make))).sort((a,b)=>rank(b)-rank(a)))if(!m.has(p.brand))m.set(p.brand,p);
 return [...m.values()].map(p=>({...p,exact:rank(p)===2||!p.models.length,label:rank(p)===2?p.name:kind==='ecu'?'ECU flash and mapping':'Revalves and suspension service'}));
}
export type Choice={brand:string;name:string;pn:string;r?:string;verified:boolean;what:string;caution:string;testers:string[];type:string|null};
/** The listed parts for one system, one row per maker and name: services, small service bits and parts for the other fuel
 *  system are kept out (no carb jets on an injected bike). */
export function pickerChoices(catalog:CatalogPart[]|null,system:PartSystem,fuel:FuelSystem|null):Choice[]{
 const m=new Map<string,Choice>();
 for(const c of catalog??[]){if(c.system!==system||c.service||(fuel==='injected'&&c.fuel==='c')||(fuel==='carburetor'&&c.fuel==='i'))continue;const brand=brandOf(c),name=cleanName(brand,c.name),type=typeOf(system,c.name);
  const k=(brand+'|'+name).toLowerCase(),prev=m.get(k);
  if(!prev)m.set(k,{brand,name,pn:c.pn.split(/[\s,]+/)[0]??'',r:c.r,verified:c.verified,what:c.what,caution:c.caution,testers:c.testers,type});
  else if(c.r&&!prev.r)m.set(k,{...prev,r:c.r,verified:c.verified,what:c.what,caution:c.caution,testers:c.testers});}
 return [...m.values()];
}
/** Part types that have listed parts (or every type when there is no list), with counts. */
export function typesWithCounts(choices:Choice[],system:PartSystem,hasCatalog:boolean){const main=choices.filter(c=>c.type||c.r);return (partTypes[system]??[]).map(t=>({label:t.label,count:main.filter(c=>c.type===t.label).length})).filter(t=>t.count>0||!hasCatalog);}
export function choicesOfType(choices:Choice[],type:string|null){return type?choices.filter(c=>(c.type||c.r)&&c.type===type):choices;}
/** Makers in a list, researched and most-listed first. */
export function brandsIn(list:Choice[]){const m=new Map<string,{n:number;r:number}>();for(const c of list){const v=m.get(c.brand)??{n:0,r:0};v.n++;if(c.r)v.r++;m.set(c.brand,v)}
 return [...m.entries()].sort((a,b)=>b[1].r-a[1].r||b[1].n-a[1].n||a[0].localeCompare(b[0]));}
/** Products of one maker, researched first. */
export function productsOf(list:Choice[],brand:string){return list.filter(c=>c.brand===brand).sort((a,b)=>Number(!!b.r)-Number(!!a.r)||Number(b.verified)-Number(a.verified)||a.name.localeCompare(b.name));}
