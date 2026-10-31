// How Specs reads to a rider, shared by the website and the phone app: one row per value in plain words, the values
// riders look up most, and their own Garage settings next to stock. Pure; nothing is invented, only re-worded.
import type {Claim} from './types.ts';
import {factSystem,factKind,type FactKind,type FactSystem} from './fact-system.ts';
import {plainName,plainInterval,sameJob} from './plain-facts.ts';

export type SpecRow={c:Claim;system:FactSystem;kind:FactKind;name:string;value:string;note:string;section:string};

/** "Section / Sub / Item: value. Conditions." → item name, value and the rest. Broad manual headings ("Chassis",
 *  "Capacities", "Engine tightening torques") are dropped; ones that name the part ("Fork", "Shock absorber") stay. */
export function splitFact(statement:string):{section:string;name:string;value:string;note:string}{
 const i=statement.indexOf(':');
 if(i<1)return {section:'',name:statement.split('. ')[0],value:'',note:statement.split('. ').slice(1).join('. ')};
 const head=statement.slice(0,i).trim(),rest=statement.slice(i+1).trim();
 const parts=head.split(' / ').map(s=>s.trim()).filter(Boolean);
 const generic=/^(chassis|engine|capacities|specifications?|general|electrical|chassis tightening torques|engine tightening torques|tightening torques|service schedule|dimensions|technical data)$/i;
 const name=parts.length>1?(generic.test(parts[0])?parts.slice(1):parts).join(' · '):parts[0]??head;
 const cut=rest.search(/\.\s+(?=[A-Z])/);
 const value=(cut>=0?rest.slice(0,cut):rest).replace(/\.$/,'').trim();
 const note=cut>=0?rest.slice(cut+1).trim():'';
 return {section:parts.length>1?parts[0]:'',name,value,note};
}

/** One list row in rider words: plain part name, and for service jobs the one interval a rider follows. */
export function toSpecRow(c:Claim):SpecRow{const f=splitFact(c.statement),kind=factKind(c);
 return {c,system:factSystem(c),kind,...f,name:settingName(plainName(f.name)),value:kind==='service'?plainInterval(f.value):f.value};}
/** "Fork · Compression damping · Standard" → "Fork compression (stock)"; "Shock · Riding sag" → "Riding sag". */
export function settingName(name:string):string{
 const parts=name.split(' · ').map(p=>p.trim()).filter(Boolean);if(parts.length<2)return name;
 const stock=parts.some(p=>/^(standard|stock|standard setting|basic setting)$/i.test(p));
 const rest=parts.filter(p=>!/^(standard|stock|standard setting|basic setting)$/i.test(p));
 const sag=rest.find(p=>/\b(riding|race|static|free) sag\b/i.test(p));if(sag)return sag.charAt(0).toUpperCase()+sag.slice(1);
 const [part,...what]=rest;const tail=what.join(' ').replace(/\s*damping\b/i,'').trim();
 const joined=tail?`${part} ${tail.charAt(0).toLowerCase()+tail.slice(1)}`:part;
 return stock?`${joined} (stock)`:joined;
}

/** All rows for a bike, with jobs printed twice in the manual collapsed to one. */
export function specRows(claims:Claim[]):SpecRow[]{const out:SpecRow[]=[];for(const c of claims){const r=toSpecRow(c);if(out.some(o=>o.kind===r.kind&&o.system===r.system&&sameJob(o.name,r.name)&&o.value===r.value))continue;out.push(r);}return out;}

export const SPEC_KINDS:{k:FactKind|'all';label:string}[]=[{k:'all',label:'All'},{k:'torque',label:'Torques'},{k:'setting',label:'Settings'},{k:'service',label:'Service'},{k:'spec',label:'Specs'}];
export const SPEC_ORDER:FactSystem[]=['Suspension','Oils & fluids','Engine','Wheels & tires','Brakes','Chain & sprockets','Clutch','Transmission','Cooling','Fuel & air','Exhaust','Electrical & ignition','Controls','Chassis','Dimensions & weight','General'];
const everyH=(v:string)=>{const m=v.match(/Every (\d+(?:\.\d+)?) h/);return m?Number(m[1]):Infinity;};
/** Rows by part of the bike, in the order riders look; service jobs most frequent first, the rest A to Z. */
export function groupSpecRows(rows:SpecRow[]):{s:FactSystem;items:SpecRow[]}[]{
 return SPEC_ORDER.map(s=>({s,items:rows.filter(r=>r.system===s).sort((a,b)=>a.kind==='service'&&b.kind==='service'?everyH(a.value)-everyH(b.value)||a.name.localeCompare(b.name):a.name.localeCompare(b.name))})).filter(g=>g.items.length);
}

/** The values riders look up most. Workshop-only numbers (valve clearances, torques) stay in the list and the search. */
const QUICK:{label:string;rx:RegExp}[]=[
 {label:'Riding sag',rx:/riding sag|race sag|rider sag/i},
 {label:'Tire pressure',rx:/tire (air )?pressure|tyre pressure|offroad tire pressure/i},
 {label:'Spark plug',rx:/spark plug(?!.*(torque|gap|tightening))|specified spark plug/i},
 {label:'Coolant',rx:/coolant.*(quantity|capacity|amount)|capacities.*coolant|^coolant$/i},
];
const fits=(r:SpecRow)=>!!r.value&&r.kind!=='service'&&r.kind!=='torque';
export function quickSpecs(rows:SpecRow[]):{label:string;row:SpecRow;value:string}[]{
 return QUICK.map(q=>{const r=rows.find(r=>fits(r)&&q.rx.test(r.section+' / '+r.name));return r?{label:q.label,row:r,value:r.value.split(';')[0].trim()}:null;}).filter((x):x is {label:string;row:SpecRow;value:string}=>!!x);
}
const OIL_AMOUNT=/engine oil.*(quantity|capacity|amount)|capacities.*engine oil|oil change quantity|^engine oil \/ quantity|engine oil quantity/i;
const OIL_GRADE=/\b\d{1,2}W[-/ ]?\d{2}\b|SAE\s*\d|JASO|API\s*S[A-Z]/i;
/** Engine oil as a rider needs it: how much and what kind. */
export function oilSummary(rows:SpecRow[]):{amount?:string;grade?:string;row:SpecRow|null}|null{
 const amount=rows.find(r=>fits(r)&&OIL_AMOUNT.test(r.section+' / '+r.name));
 const inAmount=amount?.value.split(';').slice(1).join(';').trim();
 const full=rows.find(r=>fits(r)&&/engine oil (requirement|specification|recommend)|recommended engine oil|specified engine oil/i.test(r.name)&&OIL_GRADE.test(r.value))?.value.replace(/;\s*/g,' · ');
 const grade=full??(inAmount&&OIL_GRADE.test(inAmount)?inAmount:rows.find(r=>fits(r)&&r.system==='Oils & fluids'&&/oil/i.test(r.section+' '+r.name)&&OIL_GRADE.test(r.value))?.value);
 if(!amount&&!grade)return null;
 return {amount:amount?.value.split(';')[0].trim(),grade:grade?.replace(/^engine oil\s*/i,'').replace(/^\((.*)\)$/,'$1').trim(),row:amount??null};
}
/** Garage settings next to stock. */
const YOURS:{key:string;label:string;rx:RegExp}[]=[
 {key:'fork_compression',label:'Fork compression',rx:/fork.*compression.*(standard|stock)/i},
 {key:'fork_rebound',label:'Fork rebound',rx:/fork.*rebound.*(standard|stock)/i},
 {key:'shock_compression',label:'Shock compression',rx:/shock.*(low-speed )?compression.*(standard|stock)/i},
 {key:'shock_rebound',label:'Shock rebound',rx:/shock.*rebound.*(standard|stock)/i},
 {key:'rider_sag_mm',label:'Race sag',rx:/riding sag|race sag|rider sag/i},
 {key:'tire_pressures',label:'Tire pressure',rx:/tire (air )?pressure|tyre pressure/i},
];
export function yourSettings(rows:SpecRow[],configuration:Record<string,unknown>|null|undefined){
 const cfg=configuration??{};const val=(k:string)=>{const v=cfg[k];return v==null||String(v).trim()===''?'':String(v);};
 const list=YOURS.map(y=>{const m=val(y.key);const stock=rows.find(r=>fits(r)&&y.rx.test(r.section+' / '+r.name))?.value.split(';')[0].trim();
  // A bare number takes the unit stock is given in ("14" next to "stock 12 clicks" reads "14 clicks").
  const unit=y.key==='rider_sag_mm'?'mm':stock?.match(/^\s*[\d.]+\s*(clicks?|turns?|mm)\b/i)?.[1]??'';
  return {key:y.key,label:y.label,mine:/^\d+(\.\d+)?$/.test(m)&&unit?`${m} ${unit}`:m,stock};});
 return {list:list.filter(y=>y.mine||y.stock),any:list.some(y=>y.mine)};
}

/** Catalog section names arrive in capitals ("FRONT FORK, TRIPLE CLAMP"); show them the way a rider reads them. */
const KEEP_UPPER=/^(WP|PDS|CDI|ECU|EFI|TPS|ABS|LED|SX|XC|SX-F|XC-F|EXC|KYB|YZ|KX|CRF|RM-Z|TC|FC|MC|EX|TE|FE|TX|FX|PHDS|ASV|ODI|O-RING|I|II|III|IV|V|VI)$/;
export function niceName(name:string){const t=name.trim();if(t!==t.toUpperCase())return t;return t.toLowerCase().split(/(\s+|-)/).map((w,i)=>{const up=w.toUpperCase();if(KEEP_UPPER.test(up))return up;return i===0||w.length>3?w.charAt(0).toUpperCase()+w.slice(1):w;}).join('').replace(/\b(and|of|for|with|the|to|in|on)\b/gi,m=>m.toLowerCase()).replace(/^./,c=>c.toUpperCase());}
/** Which area of the bike a catalog section belongs to, for grouping the list. */
export const PART_AREAS=['Suspension','Engine','Fuel, air & exhaust','Wheels & brakes','Frame & body','Controls & electrics','Other'] as const;
export function partArea(name:string):typeof PART_AREAS[number]{const n=name.toLowerCase();
 if(/fork|shock|swing ?arm|linkage|linking|lever link|steering|triple clamp|suspension|wp shims/.test(n))return 'Suspension';
 if(/wheel|brake|caliper|disc|tire|tyre|hub|sprocket|chain/.test(n))return 'Wheels & brakes';
 if(/fuel|air ?filter|air ?box|carbur|throttle|injector|exhaust|silencer|muffler|intake/.test(n))return 'Fuel, air & exhaust';
 if(/engine|cylinder|piston|crank|clutch|transmission|gear|shift|cam|valve|timing|water pump|cooling|lubricat|oil|balancer|kick|starter|ignition|generator|stator|case|head/.test(n))return 'Engine';
 if(/frame|seat|tank|fender|mask|plastic|cover|decal|guard|skid|number|side panel|footpeg|stand/.test(n))return 'Frame & body';
 if(/handlebar|control|wiring|harness|switch|electric|battery|light|cable|grip/.test(n))return 'Controls & electrics';
 return 'Other';}
