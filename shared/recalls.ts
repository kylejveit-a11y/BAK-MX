import type {Bike} from './types.ts';
import {canonicalRegion} from './bike-identity.ts';

export type RecallNotice={id:string;title:string;summary:string;source_url:string;vin_url:string;published_at:string};
const hondaHandlebar:RecallNotice={
 id:'cpsc-26-458',
 title:'Handlebar clamp recall: check your VIN',
 summary:'Some 2025–2026 CRF250R/RX/RWE and CRF450R/RX/RWE bikes are affected. Check your VIN. If affected, stop riding and arrange Honda dealer inspection and any required clamp replacement. Retightening alone does not establish that the recall is repaired.',
 source_url:'https://www.cpsc.gov/Recalls/2026/American-Honda-Motor-Recalls-Off-Road-Motorcycles-Due-to-Risk-of-Serious-Injury-or-Death-Due-to-Crash-Hazard',
 vin_url:'https://powersports.honda.com/recalls',
 published_at:'2026-04-30',
};
const coveredModels=new Set(['CRF250R','CRF250RX','CRF250RWE','CRF450R','CRF450RX','CRF450RWE']);
/** Model/year selects a potential notice, never a determination that the rider's VIN is recalled. */
export function recallsForBike(bike:Pick<Bike,'manufacturer'|'model'|'model_year'|'region'>):RecallNotice[]{
 return bike.manufacturer.trim().toLowerCase()==='honda'&&coveredModels.has(bike.model.trim().toUpperCase())&&[2025,2026].includes(bike.model_year)&&canonicalRegion(bike.region)==='US'?[hondaHandlebar]:[];
}
