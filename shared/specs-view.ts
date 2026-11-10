// How Specs reads to a rider, shared by the website and the phone app: one row per value in plain words, the values
// riders look up most, and their own Garage settings next to stock. Pure; nothing is invented, only re-worded.
import type {Claim} from './types.ts';
import {factSystem,factKind,type FactKind,type FactSystem} from './fact-system.ts';
import {plainName,plainInterval} from './plain-facts.ts';

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

/** A maker part or article number on its own: "A460C159Y406000", "48601166S1", "00062010053". Never a measurement: a
 *  plain number counts only at eight or more digits, far longer than any value printed in brackets. */
const PART_NUMBER=/^(?=(?:[^0-9]*[0-9]){5})[A-Z0-9][A-Z0-9.\-]{6,}$/i;
export const isPartNumber=(s:string)=>{const t=s.trim();return PART_NUMBER.test(t)&&(!/^\d+(\.\d+)?$/.test(t)||/^\d{8,}$/.test(t));};
/** Parts-catalog bookkeeping that was published as a fact: a catalog callout or dimensional designation, an article or part
 *  number, or a "no torque applies to this washer" review. Real for the parts catalog, noise in a specs list. */
export function isCatalogClaim(c:Pick<Claim,'statement'|'domain'>):boolean{
 if(c.domain==='component_identification')return true;
 const f=splitFact(c.statement);const head=f.name;
 if(/^(OEM catalog dimensional designation|OEM material designation|Engineering applicability review)\b/i.test(head))return true;
 if(/\bcallout\b/i.test(head))return true;
 if(/\b(article|part) (number|no\.?)\b/i.test(head))return true;
 const first=f.value.split(';')[0].trim();
 if(/\bassembly$/i.test(head)&&isPartNumber(first))return true;
 return false;
}
/** A value printed with the maker's part number ("5 g; Special grease (00062010053)", "SAE 2.5; 50180751S1") reads as the
 *  value alone; the number moves to the row's detail so nothing is lost. */
export function liftPartNumbers(value:string):{value:string;parts:string[]}{
 const parts:string[]=[];
 let v=value.replace(/\s*\(([^()]+)\)/g,(m,inner:string)=>{if(isPartNumber(inner)){parts.push(inner.trim());return '';}return m;});
 v=v.split(';').map(s=>s.trim()).filter(s=>{if(s&&isPartNumber(s)){parts.push(s);return false;}return !!s;}).join('; ');
 return {value:v.replace(/\s{2,}/g,' ').trim(),parts};
}

/** The conditions sentence the manual rows carry, in rider words: "Applies to the US standard model named; other regions
 *  and special editions covered by the same manual can differ. Stock OEM parts only." reads "US model; other regions and
 *  special editions can differ. Stock parts only." Same facts, fewer words; anything else is left as written. */
export function riderNote(note:string):string{
 return note
  .replace(/Applies to the US standard model named[;.]?\s*/i,'US model. ')
  .replace(/Applies to the US model named,?\s*stock OEM configuration;?\s*/i,'US model, stock parts. ')
  .replace(/\bother regions and special editions covered by the same manual can differ\b/i,'Other regions and special editions can differ')
  .replace(/\bStock OEM parts only\b/i,'Stock parts only')
  .replace(/\bthe owner.s manual says specifications are subject to change without notice\b/i,'The manual says specs can change without notice')
  .replace(/\.\s*\.\s*/g,'. ').replace(/\s{2,}/g,' ').trim();
}
/** One list row in rider words: plain part name, and for service jobs the one interval a rider follows. A condition the manual
 *  printed inside the value ("Valve clearance / Intake at: 20 °C: 0.10 mm", "Spring rate / Weight of rider: 65 … 75 kg: 42 N/mm")
 *  moves into the name, so the value is the number alone. */
export function toSpecRow(c:Claim):SpecRow{const f=splitFact(c.statement),kind=factKind(c);
 let rawName=f.name,rawValue=f.value;
 const cond=/\b(at|weight of rider)$/i.test(rawName)?rawValue.match(/^([^:;]{1,60}):\s*(.+)$/):null;
 if(cond){rawName=rawName.replace(/\s*·?\s*weight of rider$/i,', rider')+' '+cond[1].trim();rawValue=cond[2].trim();}
 const lifted=kind==='service'?{value:plainInterval(rawValue),parts:[] as string[]}:liftPartNumbers(rawValue);
 const note=riderNote(lifted.parts.length?[f.note,`Maker part ${lifted.parts.length>1?'numbers':'number'} ${lifted.parts.join(', ')}.`].filter(Boolean).join(' '):f.note);
 return {c,system:factSystem(c),kind,section:f.section,note,name:settingName(plainName(rawName)),value:lifted.value};}
const MODE=/^(standard|stock|standard setting|basic setting|comfort|sport)$/i;
const modeWord=(p:string)=>/^(comfort|sport)$/i.test(p)?p.toLowerCase():'stock';
const same=(a:string,b:string)=>a.toLowerCase().replace(/[\s.]+$/,'')===b.toLowerCase().replace(/[\s.]+$/,'');
/** "Fork · Compression damping · Standard" → "Fork compression (stock)"; "Fork · Rebound damping · Comfort" → "Fork rebound
 *  (comfort)"; "Fork rebound standard" (no heading) → "Fork rebound (stock)"; "Fork · Fork length" → "Fork length";
 *  "Shock · Riding sag" → "Riding sag". */
export function settingName(name:string):string{
 const parts=name.split(' · ').map(p=>p.trim()).filter((p,i,a)=>p&&!(i>0&&same(p,a[i-1])));
 if(parts.length<2){
  const m=name.trim().match(/^(.+?)\s+(standard|stock|comfort|sport)$/i);
  return m?`${m[1].replace(/\s*damping\b/i,'').trim()} (${modeWord(m[2])})`:(parts[0]??name).replace(/\.$/,'');
 }
 const mode=parts.find(p=>MODE.test(p));
 const rest=parts.filter(p=>!MODE.test(p));
 const sag=rest.find(p=>/\b(riding|race|static|free) sag\b/i.test(p));if(sag)return sag.charAt(0).toUpperCase()+sag.slice(1);
 const [part,...what]=rest;let tail=what.join(' ').replace(/\s*damping\b/i,'').trim();
 // The manual repeats the heading inside the item ("Fork / Fork length", "Shock absorber / Shock absorber article number").
 const partLc=part.toLowerCase();
 if(tail.toLowerCase()===partLc)tail='';else if(tail.toLowerCase().startsWith(partLc+' '))tail=tail.slice(part.length+1);
 const trail=!mode?tail.match(/^(.+?)\s+(standard|stock|comfort|sport)$/i):null;if(trail)tail=trail[1];
 const joined=tail?`${part} ${tail.charAt(0).toLowerCase()+tail.slice(1)}`:part;
 const m=mode??trail?.[2];
 return m?`${joined} (${modeWord(m)})`:joined;
}

/** Two names for the same thing: same words in any order ("Front suspension travel", "Suspension travel front"), plural or
 *  hyphen aside. */
const nameKey=(name:string)=>plainName(name).toLowerCase().replace(/-/g,'').replace(/[^a-z0-9 ]+/g,' ').split(/\s+/).filter(Boolean).map(w=>w.length>3?w.replace(/s$/,''):w).sort().join(' ');
const rowKey=(r:SpecRow)=>`${r.kind}|${r.system}|${nameKey(r.name)}`;
/** The value as printed, with the second unit, thousands commas and the spelling of ranges, degrees and plurals set aside,
 *  so "22 mm" reads the same as "22 mm (0.87 in)" and "10-12 Nm" the same as "10 … 12 Nm". Comparison only; never shown. */
export function bareValue(v:string):string{
 return v.replace(/\s*\([^()]*\)/g,'').replace(/(\d),(\d{3})\b/g,'$1$2').replace(/\s*(\+\/-|\+\/−|±)\s*/g,'±').replace(/\s*(…|\.\.\.|–|—|-|to)\s*(?=\d)/g,'-')
  .replace(/\s*degrees?\b/gi,'°').replace(/cm³/g,'cm3').replace(/(\d)\s*(turns?|clicks?)\b/gi,(_,n,u)=>`${n} ${u.toLowerCase().replace(/s$/,'')}`).replace(/\s+/g,' ').trim().toLowerCase();
}
/** "60 Nm" and "60 Nm (44.3 lbf ft); Loctite 2701" are one value: the second only says more. Different numbers are not. */
function sameValue(a:string,b:string):boolean{
 if(a===b)return true;
 const [a0,...aRest]=a.split(';').map(s=>s.trim()),[b0,...bRest]=b.split(';').map(s=>s.trim());
 if(bareValue(a0)!==bareValue(b0))return false;
 if(!aRest.length||!bRest.length)return true;
 return bareValue(aRest.join('; '))===bareValue(bRest.join('; '));
}
const richness=(v:string)=>(v.match(/\(/g)?.length??0)*100+v.split(';').length*10+(/\d\s*(turns|clicks)\b/i.test(v)&&/^1\s/.test(v)?0:1)+Math.min(v.length,9)/10;
/** All rows for a bike: parts-catalog bookkeeping left out, jobs printed twice in the manual collapsed to one, and the same
 *  value printed twice under one name ("22 mm" and "22 mm (0.87 in)") shown once, with both units. Linear in the number of
 *  claims, since a bike can carry well over a thousand. */
export function specRows(claims:Claim[]):SpecRow[]{
 const out:SpecRow[]=[];const byKey=new Map<string,number[]>();
 for(const c of claims){
  if(isCatalogClaim(c))continue;
  const r=toSpecRow(c);const k=rowKey(r);const seen=byKey.get(k);
  if(seen){
   let dup=false;
   for(const i of seen){const o=out[i];if(sameValue(o.value,r.value)){if(richness(r.value)>richness(o.value))out[i]=r;dup=true;break;}}
   if(dup)continue;
   seen.push(out.length);
  }else byKey.set(k,[out.length]);
  out.push(r);
 }
 return out;
}

export const SPEC_KINDS:{k:FactKind|'all';label:string}[]=[{k:'all',label:'All'},{k:'torque',label:'Torques'},{k:'setting',label:'Settings'},{k:'service',label:'Service'},{k:'spec',label:'Specs'}];
export const SPEC_ORDER:FactSystem[]=['Suspension','Oils & fluids','Engine','Wheels & tires','Brakes','Chain & sprockets','Clutch','Transmission','Cooling','Fuel & air','Exhaust','Electrical & ignition','Controls','Chassis','Dimensions & weight','General'];
const everyH=(v:string)=>{const m=v.match(/Every (\d+(?:\.\d+)?) h/);return m?Number(m[1]):Infinity;};
/** Rows by part of the bike, in the order riders look: settings, torques and specs A to Z in `items`, and the part's
 *  service jobs apart in `service` (most frequent first), so a clicker setting never sits between two intervals.
 *  `items.length + service.length` is the part's count. */
export function groupSpecRows(rows:SpecRow[]):{s:FactSystem;items:SpecRow[];service:SpecRow[]}[]{
 return SPEC_ORDER.map(s=>{const all=rows.filter(r=>r.system===s);return {s,
  items:all.filter(r=>r.kind!=='service').sort((a,b)=>a.name.localeCompare(b.name)),
  service:all.filter(r=>r.kind==='service').sort((a,b)=>everyH(a.value)-everyH(b.value)||a.name.localeCompare(b.name))};}).filter(g=>g.items.length||g.service.length);
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
 // The clicker units this maker prints anywhere in its settings ("12 clicks", "1.5 turns"), for a row with no stock value.
 const makerUnits=new Set(rows.filter(fits).flatMap(r=>[...r.value.matchAll(/\d\s*(clicks?|turns?)\b/gi)].map(x=>x[1].toLowerCase().replace(/s$/,'')+'s')));
 const list=YOURS.map(y=>{const m=val(y.key);const stock=rows.find(r=>fits(r)&&y.rx.test(r.section+' / '+r.name))?.value.split(';')[0].trim();
  // A bare number takes the unit stock is given in ("14" next to "stock 12 clicks" reads "14 clicks"). With no stock row, a
  // clicker takes the unit the maker uses elsewhere: whole numbers are clicks, a fraction of a turn ("1.5") is turns.
  const fromStock=stock?.match(/^\s*[\d.]+\s*(clicks?|turns?|mm)\b/i)?.[1];
  const clicker=/_(compression|rebound)$/.test(y.key)?(/^\d+\.\d+$/.test(m)?'turns':'clicks'):'';
  const unit=y.key==='rider_sag_mm'?'mm':fromStock??(clicker&&makerUnits.has(clicker)?clicker:'');
  return {key:y.key,label:y.label,mine:/^\d+(\.\d+)?$/.test(m)&&unit?`${m} ${unit}`:m,stock};});
 return {list:list.filter(y=>y.mine||y.stock),any:list.some(y=>y.mine)};
}

/** Catalog section names arrive in the maker's casing ("FRONT FORK, TRIPLE CLAMP", "WP Shims for Setting", "Transmission II -
 *  Countershaft"); show them in sentence case with the same words: "Front fork, triple clamp", "WP shims for setting",
 *  "Transmission II - countershaft". Makers' marks and numerals keep their capitals. */
const KEEP_UPPER=/^(WP|PDS|CDI|ECU|EFI|TPS|ABS|LED|SX|XC|SX-F|XC-F|EXC|KYB|YZ|KX|CRF|RM-Z|TC|FC|MC|EX|TE|FE|TX|FX|PHDS|ASV|ODI|O-RING|I|II|III|IV|V|VI|OEM|USA|US|EU|HRC|SHOWA|SHOWA)$/;
export function niceName(name:string){const t=name.trim();if(!t)return t;
 return t.split(/(\s+|-)/).map((w,i)=>{if(!w||/^(\s+|-)$/.test(w))return w;const up=w.toUpperCase();if(KEEP_UPPER.test(up))return up;const low=w.toLowerCase();return i===0?low.charAt(0).toUpperCase()+low.slice(1):low;}).join('');}
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

/** Where a spec was printed, in rider words: "Page 24". Internal notes ("one-based", PDF/printed page bookkeeping, file
 *  names) never reach riders, and nothing is shown for a source that is not a public maker document. */
export function friendlyLocator(locator:string|null|undefined,url:string|null|undefined):string{
 if(!locator||!/^https:\/\//.test(url??''))return '';
 const printed=locator.match(/printed page\s*([0-9]+(?:[-–][0-9]+)?)/i)??locator.match(/\bpage\s*([0-9]+(?:[-–][0-9]+)?)/i);
 return printed?`Page ${printed[1]}`:'';
}
