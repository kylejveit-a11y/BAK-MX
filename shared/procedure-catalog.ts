import type {Bike} from './types.ts';
import {proceduresForBike,type ReviewedProcedure} from './procedures.ts';

// Presentation grouping does not change source scope, prerequisites or saved run hashes.
const routes=new Set([
 'yamaha-yz450f-2022-major-engine-bike-journey-v1',
 'yamaha-yz450f-2022-top-end-bike-journey-v1',
 'yamaha-yz450f-2022-frame-bearing-renewal-reassembly-v1',
 'yamaha-2022-yz450f-fork-oil-seals-bushings-v1',
 'yamaha-yz450f-2023-major-engine-bike-journey-v1',
 'yamaha-yz450f-2023-top-end-bike-journey-v1',
 'yamaha-yz450f-2023-frame-bearing-renewal-reassembly-v1',
 'yamaha-2023-yz450f-fork-oil-seals-bushings-v1',
 'yamaha-yz450f-2024-major-engine-bike-journey-v1',
 'yamaha-yz450f-2024-top-end-bike-journey-v1',
 'yamaha-yz450f-2024-frame-bearing-renewal-reassembly-v1',
 'yamaha-2024-yz450f-fork-oil-seals-bushings-v1',
 'yamaha-yz450f-2025-major-engine-bike-journey-v1',
 'yamaha-yz450f-2025-top-end-bike-journey-v1',
 'yamaha-yz450f-2025-frame-bearing-renewal-reassembly-v1',
 'yamaha-2025-yz450f-fork-oil-seals-bushings-v2',
 'yamaha-2026-yz450f-top-end-guide-valve-renew-v1',
 'yamaha-yz450f-2026-frame-bearing-renewal-reassembly-v1',
 'yamaha-2026-yz450f-top-end-stock-reuse-v1',
 'yamaha-2026-yz450f-frame-strip-reassemble-v1',
 'yamaha-2026-yz450f-fork-oil-seals-bushings-v1',
]);
const categories=[
 {id:'routes',title:'Guided jobs'},
 {id:'engine',title:'Engine service and checks'},
 {id:'chassis',title:'Chassis and access'},
 {id:'suspension',title:'Suspension setup and service'},
 {id:'bench',title:'Engine bench modules'},
] as const;
export function procedureCategory(p:ReviewedProcedure):typeof categories[number]['id']{
 if(routes.has(p.id))return 'routes';
 if(p.id.includes('-bench-')||p.id.endsWith('-top-end-teardown-inspection-v1')||p.id.endsWith('-original-head-valve-reassembly-v1'))return 'bench';
 if(['fork','shock'].includes(p.component))return 'suspension';
 if(p.component==='engine')return 'engine';
 return 'chassis';
}
export function procedureCatalog(bike:Bike){
 const available=proceduresForBike(bike);
 const groups=categories.map(group=>({...group,procedures:available.filter(p=>procedureCategory(p)===group.id)})).filter(group=>group.procedures.length);
 const has=(id:string)=>available.some(p=>p.id===id);
 const major=available.some(p=>p.id.endsWith('-major-engine-bike-journey-v1'));
 const topEnd=available.some(p=>p.id.endsWith('-top-end-bike-journey-v1'));
 const frameRenewal=available.some(p=>p.id.endsWith('-frame-bearing-renewal-reassembly-v1'));
 const coverage=[
  {system:'Engine',available:major?'Engine removal, measured top-end and lower-engine work, crank assembly and gearbox service, refit and break-in checks.':topEnd?'Top-end rebuild from the assembled bike through refit, pressure test and break-in checks.':has('yamaha-2026-yz450f-top-end-guide-valve-renew-v1')?'Stock top-end rebuild with guide and valve renewal, specialist seat work, engine refit and stationary checks. Running break-in remains required.':has('yamaha-2026-yz450f-top-end-stock-reuse-v1')?'Stock top-end rebuild, including engine removal and refit.':available.some(p=>p.component==='engine')?'Individual service guides and checks.':'No reviewed engine guide for this build yet.',remaining:major?'Pressed crank rebuilding, damaged cases and some retained engine accessory internals are excluded. Specialist work and remaining checks are listed in the guide.':'A complete bottom-end rebuild route is not available.'},
  {system:'Chassis',available:frameRenewal?'Stock frame strip, wheel, steering and linkage bearing renewal, and reassembly. Separate guides cover brake hydraulics.':has('yamaha-yz450f-2026-steering-bearings-races-renewal-v1')?'Stock chassis strip and reassembly, plus separate wheel, steering and linkage bearing renewal and brake hydraulic service.':has('yamaha-2026-yz450f-frame-strip-reassemble-v1')?'Stock chassis strip and reassembly; pressed steering races and bonded pads stay in place.':available.some(p=>p.component==='frame')?'Individual chassis service guides.':'No reviewed chassis rebuild route for this build yet.',remaining:'Structural frame repair is not covered. Follow each service guide’s access and reassembly requirements.'},
  {system:'Fork',available:(has('yamaha-2026-yz450f-fork-oil-seals-bushings-v1')||has('yamaha-2025-yz450f-fork-oil-seals-bushings-v2')||has('yamaha-2024-yz450f-fork-oil-seals-bushings-v1')||has('yamaha-2023-yz450f-fork-oil-seals-bushings-v1')||has('yamaha-2022-yz450f-fork-oil-seals-bushings-v1'))?'Stock fork oil, seal and bushing service, including removal and refit.':available.some(p=>p.component==='fork'||p.affected_components?.includes('fork'))?'Individual fork setup or service guides.':'No reviewed fork guide for this build yet.',remaining:'Cartridge rod-seal overhaul and revalving are not covered.'},
  {system:'Rear shock',available:has('yamaha-yz450f-2026-shock-spring-preload-sag-v1')?'Spring replacement, measured sag setup, mounting-eye renewal and controlled damping trials.':available.some(p=>p.component==='shock'||p.affected_components?.includes('shock'))?'Individual setup, inspection or removal/refit guides; see each guide for its scope.':'No reviewed rear-shock guide for this build yet.',remaining:'Internal shock rebuilding is not covered.'},
 ];
 return {available,groups,featured:available.filter(p=>routes.has(p.id)),coverage};
}
