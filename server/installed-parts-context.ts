import {readInstalled,partSystems,systemLabel} from '../shared/installed-parts.ts';
import {researchedParts} from '../shared/aftermarket-research.ts';
import {workProviders} from '../shared/work-providers.ts';
import {checkBuild} from '../shared/build-check.ts';
/** What the rider has fitted, for the answer model: each part by system with the research notes BAK holds for it, the systems
 *  confirmed stock, and the systems not recorded (unknown, not stock). Null when nothing has been recorded. */
/** A shop's service notes describe the bikes it lists (a two-stroke ECU remap is not a 450 four-stroke remap): attach them only
 *  when the shop lists this exact model, or publishes no bike list. */
function researchFor(id:string|undefined,bike?:{manufacturer:string;model:string}){
 if(!id)return undefined;const w=workProviders.find(p=>p.id===id);
 if(w&&bike&&w.models.length&&!w.models.includes(bike.manufacturer+'|'+bike.model))return undefined;
 return researchedParts[id];
}
export function installedPartsContext(configuration:Record<string,unknown>|null|undefined,bike?:{manufacturer:string;model:string;model_year?:number}){
 const {parts,stock,notes}=readInstalled(configuration);
 if(!parts.length&&!stock.length&&!Object.keys(notes).length)return null;
 const known=new Set([...parts.filter(p=>!p.o).map(p=>p.s),...stock]);
 const describe=(p:typeof parts[number])=>{const r=researchFor(p.r,bike);return {system:systemLabel(p.s),part:[p.b,p.n].filter(Boolean).join(' '),...(p.v?{size:p.v}:{}),...(p.k?{color:p.k}:{}),...(p.p?{part_number:p.p}:{}),...(p.d?{rider_detail:p.d}:{}),
   source:p.x?'typed by the rider':'picked from the parts list for this bike',
   ...(r?{research:{listed_as:[r.brand,r.product].filter(Boolean).join(' '),what_it_changes:r.what_it_changes,caveats:r.caveats,tester_notes:r.tester_notes,fit_confidence:r.confidence==='high'?'maker lists this fit':'dealer or retailer listing'}}:{})};};
 const checks=bike?checkBuild({manufacturer:bike.manufacturer,model:bike.model,model_year:bike.model_year??0,configuration}):[];
 return {
  fitted:parts.filter(p=>!p.o).map(describe),
  off_the_bike:parts.filter(p=>p.o).map(describe),
  build_checks:checks.map(c=>c.text),
  confirmed_stock:stock.map(systemLabel),
  not_recorded:partSystems.filter(s=>!known.has(s.key)).map(s=>s.label),
  rider_notes:Object.fromEntries(Object.entries(notes).map(([k,v])=>[systemLabel(k),v])),
 };
}
/** The bike's configuration without the build-sheet keys, which installed_parts carries in readable form. */
export function withoutBuildSheet(configuration:Record<string,unknown>){const {installed_parts:_a,stock_systems:_b,parts_notes:_c,...rest}=configuration;return rest;}
