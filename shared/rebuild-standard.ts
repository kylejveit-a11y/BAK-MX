// BAK MX listing standard: a bike is listed only when a rider can be guided from the bike on the stand, through a full
// engine teardown (cases split) and suspension and chassis rebuilds, back to a running bike.
import type {Bike} from './types.ts';
import {reviewedProcedures,type ReviewedProcedure} from './procedures.ts';
import {sameBikeScope} from './bike-identity.ts';

export const rebuildRequirements=[
 {id:'engine_out_in',label:'Engine out of the frame and back in',test:(p:ReviewedProcedure)=>p.component==='engine'&&/(remove|removal|refit|out of the frame|into the frame).*(engine)|engine.*(remove|removal|refit|install|out of the frame|back in the frame)|major engine/i.test(p.title)},
 {id:'top_end',label:'Top end teardown and rebuild',test:(p:ReviewedProcedure)=>p.component==='engine'&&/top end|top-end|cylinder head|major engine/i.test(p.title)},
 {id:'cases_split',label:'Cases split: crank, gearbox, bottom end',test:(p:ReviewedProcedure)=>p.component==='engine'&&/bottom end|bottom-end|lower engine|crankcase|split the cases|cases split|major engine/i.test(p.title)},
 {id:'running_again',label:'First start, break-in and checks',test:(p:ReviewedProcedure)=>p.component==='engine'&&/commission|first start|break-in|running/i.test(p.title)},
 {id:'fork_rebuild',label:'Fork rebuild: seals, bushings, oil',test:(p:ReviewedProcedure)=>p.component==='fork'&&/seal|bushing|full fork service|fork service|rebuild/i.test(p.title)},
 {id:'shock_rebuild',label:'Shock rebuild',test:(p:ReviewedProcedure)=>p.component==='shock'&&/shock (service|rebuild)|rebuild.*shock/i.test(p.title)},
 {id:'linkage',label:'Linkage and swingarm bearings',test:(p:ReviewedProcedure)=>/linkage/i.test(p.title)&&/bearing|rebuild|renew/i.test(p.title)||/(frame|chassis) bearing/i.test(p.title)},
 {id:'steering',label:'Steering head bearings',test:(p:ReviewedProcedure)=>/steering/i.test(p.title)&&/bearing/i.test(p.title)||/frame.*bearing/i.test(p.title)},
 {id:'wheel_bearings',label:'Wheel bearings',test:(p:ReviewedProcedure)=>/wheel bearing|wheel.*bearings|frame.*bearing/i.test(p.title)},
] as const;

/** Which listing requirements a bike meets from the guides available for its exact identity. */
export function rebuildStandard(bike:Pick<Bike,'manufacturer'|'model'|'model_year'|'variant'|'region'>){
 const guides=reviewedProcedures.filter(p=>sameBikeScope(p.target,bike));
 const items=rebuildRequirements.map(r=>({id:r.id,label:r.label,met:guides.some(g=>r.test(g))}));
 return {met:items.every(i=>i.met),items,guides:guides.length};
}

/** The owner turns this on when he is ready to hide bikes that do not meet the standard from the Garage picker. */
export const LISTING_STANDARD_ENFORCED=false;
