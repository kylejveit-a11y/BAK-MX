import {readInstalled,partSystems,systemLabel} from '../shared/installed-parts.ts';
import {researchedParts} from '../shared/aftermarket-research.ts';
/** What the rider has fitted, for the answer model: each part by system with the research notes BAK holds for it, the systems
 *  confirmed stock, and the systems not recorded (unknown, not stock). Null when nothing has been recorded. */
export function installedPartsContext(configuration:Record<string,unknown>|null|undefined){
 const {parts,stock,notes}=readInstalled(configuration);
 if(!parts.length&&!stock.length&&!Object.keys(notes).length)return null;
 const known=new Set([...parts.map(p=>p.s),...stock]);
 return {
  fitted:parts.map(p=>{const r=p.r?researchedParts[p.r]:undefined;return {system:systemLabel(p.s),part:[p.b,p.n].filter(Boolean).join(' '),...(p.p?{part_number:p.p}:{}),...(p.d?{rider_detail:p.d}:{}),
   source:p.x?'typed by the rider':'picked from the parts list for this bike',
   ...(r?{research:{what_it_changes:r.what_it_changes,caveats:r.caveats,tester_notes:r.tester_notes,fit_confidence:r.confidence==='high'?'maker lists this fit':'dealer or retailer listing'}}:{})}}),
  confirmed_stock:stock.map(systemLabel),
  not_recorded:partSystems.filter(s=>!known.has(s.key)).map(s=>s.label),
  rider_notes:Object.fromEntries(Object.entries(notes).map(([k,v])=>[systemLabel(k),v])),
 };
}
/** The bike's configuration without the build-sheet keys, which installed_parts carries in readable form. */
export function withoutBuildSheet(configuration:Record<string,unknown>){const {installed_parts:_a,stock_systems:_b,parts_notes:_c,...rest}=configuration;return rest;}
