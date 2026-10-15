import type {PartSystem} from '../shared/installed-parts';
/** One part a rider can pick for their bike. r marks a researched part (it carries what it changes and tester notes). */
export type CatalogPart={brand:string;name:string;system:PartSystem;pn:string;r?:string;verified:boolean;what:string;caution:string;testers:string[];service:boolean;fuel?:'c'|'i';links:{seller:string;url:string;price:string}[]};
type FamilyFile={v:number;systems:PartSystem[];sellers:Record<string,string>;brands:string[];items:{b:number;n:string;s:number;p?:string;u?:string[][];r?:string;conf?:string;w?:string;c?:string;t?:string[];sv?:number;k?:'c'|'i'}[];bikes:Record<string,number[]>};
const SELLER:Record<string,string>={cg:'Cycle Gear',ms:'MotoSport',kt:'KTM Twins',lg:'Lings',tr:'Triumph dealer',ym:'Yamaha dealer',rs:'Source'};
const familyOf=(make:string)=>['KTM','Husqvarna','GasGas'].includes(make)?'ktm-family':make==='Triumph'?'triumph':make==='Yamaha'?'yamaha':make==='Honda'?'honda':make==='Kawasaki'?'kawasaki':null;
const cache=new Map<string,Promise<FamilyFile|null>>();
function family(name:string){
 if(!cache.has(name))cache.set(name,fetch(`/parts-catalog/${name}.json`).then(r=>r.ok?r.json() as Promise<FamilyFile>:null).catch(()=>{cache.delete(name);return null;}));
 return cache.get(name)!;
}
/** Every listed part for this exact bike, or null when no parts list exists for it (other makes, enduro models, unlisted years). */
export async function partsForBike(make:string,model:string,year:number):Promise<CatalogPart[]|null>{
 const name=familyOf(make);if(!name)return null;
 const f=await family(name);const list=f?.bikes[`${make}|${model}|${year}`];
 if(!f||!list)return null;
 const out:CatalogPart[]=[];let idx=0;
 for(const d of list){idx+=d;const it=f.items[idx];if(!it)continue;
  out.push({brand:f.brands[it.b]??'',name:it.n,system:f.systems[it.s],pn:it.p??'',r:it.r,verified:it.conf==='high',what:it.w??'',caution:it.c??'',testers:it.t??[],service:!!it.sv,...(it.k?{fuel:it.k}:{}),
   links:(it.u??[]).map(([code,path,price])=>({seller:SELLER[code]??'Source',url:(f.sellers[code]??'')+path,price:price??''})).filter(l=>/^https:\/\//.test(l.url))});
 }
 return out;
}
