import {allGarageFields} from './garage-fields.ts';
import {readInstalled,writeInstalled,partSystemKeys,MAX_PARTS,type InstalledPart,type PartSystem} from './installed-parts.ts';
/** Garage changes Ask BAK proposes from what the rider said in chat ("my clickers are 12 and 14", "I put an FMF slip-on on").
 *  BAK only proposes; nothing is saved until the rider taps Save, and the save goes through the normal bike update. */
export type GarageUpdate={type:'part'|'setting';system:string;brand:string;name:string;field:string;value:string;current:string};
const fields=new Map(allGarageFields.map(f=>[f.key,f]));
const clip=(v:unknown,n:number)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,n);
export const garageFieldLabel=(key:string)=>fields.get(key)?.label.replace(/\s*\(.*\)$/,'')??key;
/** Keep only well-formed proposals: a known Garage field with a value, or a part in a known build-sheet section. */
export function cleanGarageUpdates(updates:unknown,hasBike:boolean):GarageUpdate[]{
 if(!hasBike||!Array.isArray(updates))return [];
 const out:GarageUpdate[]=[],seen=new Set<string>();
 for(const raw of updates){
  if(!raw||typeof raw!=='object')continue;const u=raw as Record<string,unknown>;
  const g:GarageUpdate={type:u.type==='part'?'part':'setting',system:clip(u.system,40),brand:clip(u.brand,60),name:clip(u.name,90),field:clip(u.field,40),value:clip(u.value,120),current:clip(u.current,120)};
  if(g.type==='setting'){const f=fields.get(g.field);if(!f||!g.value)continue;if(f.numeric&&!Number.isFinite(Number(g.value)))continue;g.system='';g.brand='';g.name='';}
  else{if(!partSystemKeys.includes(g.system as PartSystem)||!(g.name||g.brand))continue;g.field='';g.value=clip(u.value,120);}
  const key=g.type==='setting'?'s:'+g.field:'p:'+(g.brand+'|'+g.name).toLowerCase();
  if(seen.has(key))continue;seen.add(key);out.push(g);if(out.length>=6)break;
 }
 return out;
}
const norm=(v:unknown)=>String(v??'').toLowerCase().replace(/\s+/g,' ').trim();
/** The proposals that would still change this bike: a setting that differs from what is saved, a part not already listed. */
export function pendingGarageUpdates(configuration:Record<string,unknown>|null|undefined,updates:GarageUpdate[]|undefined):GarageUpdate[]{
 const c=configuration??{},parts=readInstalled(c).parts;
 return (updates??[]).filter(u=>u.type==='setting'?norm(c[u.field])!==norm(u.value)
  :!parts.some(p=>p.s===u.system&&norm(p.b)===norm(u.brand)&&(norm(p.n)===norm(u.name)||norm(p.n).includes(norm(u.name))||norm(u.name).includes(norm(p.n)))));
}
/** The configuration after applying the chosen proposals (other keys untouched). A fitted part also clears "stock" for its section. */
export function applyGarageUpdates(configuration:Record<string,unknown>|null|undefined,updates:GarageUpdate[]):Record<string,unknown>{
 let c:Record<string,unknown>={...(configuration??{})};
 for(const u of updates)if(u.type==='setting')c[u.field]=fields.get(u.field)?.numeric?Number(u.value):u.value;
 const parts=updates.filter(u=>u.type==='part');
 if(parts.length){
  const v=readInstalled(c);
  for(const u of parts){if(v.parts.length>=MAX_PARTS)break;const p:InstalledPart={s:u.system as PartSystem,b:u.brand,n:u.name||u.brand,x:true};if(u.value)p.d=u.value;v.parts.push(p);v.stock=v.stock.filter(s=>s!==p.s);}
  c=writeInstalled(c,v);
 }
 return c;
}
