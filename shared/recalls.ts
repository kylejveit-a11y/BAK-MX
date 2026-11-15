import type {Bike} from './types.ts';
import {canonicalRegion} from './bike-identity.ts';

export type RecallNotice={id:string;title:string;summary:string;source_url:string;vin_url:string;vin_label:string;published_at:string};
type Rule={notice:RecallNotice;make:string;models:string[];years:number[]};
// Each notice is the CPSC recall as published; the model/year match only says the bike may be covered.
const RULES:Rule[]=[
 {make:'honda',models:['CRF250R','CRF250RX','CRF250RWE','CRF450R','CRF450RX','CRF450RWE'],years:[2025,2026],notice:{
  id:'cpsc-26-458',
  title:'Handlebar clamp recall: check your VIN',
  summary:'Some 2025–2026 CRF250R/RX/RWE and CRF450R/RX/RWE bikes are affected. Check your VIN. If affected, stop riding and arrange Honda dealer inspection and any required clamp replacement. Retightening alone does not establish that the recall is repaired.',
  source_url:'https://www.cpsc.gov/Recalls/2026/American-Honda-Motor-Recalls-Off-Road-Motorcycles-Due-to-Risk-of-Serious-Injury-or-Death-Due-to-Crash-Hazard',
  vin_url:'https://powersports.honda.com/recalls',vin_label:'Check Honda VIN',
  published_at:'2026-04-30'}},
 {make:'honda',models:['CRF450R'],years:[2015,2016],notice:{
  id:'cpsc-17-764',
  title:'Transmission gear recall: check your VIN',
  summary:'Some 2015 and 2016 CRF450R bikes are covered: a transmission gear can break. Check your VIN. If covered, stop riding and have an authorized Honda dealer do the free inspection and repair. Honda: 866-784-1870.',
  source_url:'https://www.cpsc.gov/Recalls/2017/American-Honda-Recalls-Motocross-Off-Road-Motorcycles-Recall-Alert',
  vin_url:'https://powersports.honda.com/recalls',vin_label:'Check Honda VIN',
  published_at:'2017-09-05'}},
 {make:'yamaha',models:['YZ250F','YZ450F'],years:[2014],notice:{
  id:'cpsc-14-717',
  title:'Drive chain recall: check with a Yamaha dealer',
  summary:'2014 YZ250F and YZ450F bikes (VIN 10th character E) were recalled: the drive chain can detach. If the free repair has not been done, stop riding and contact a Yamaha dealer. Yamaha: 800-962-7926.',
  source_url:'https://www.cpsc.gov/Recalls/2014/Yamaha-Recalls-Off-Road-Motorcycles',
  vin_url:'https://www.yamahamotorsports.com/',vin_label:'Yamaha Motorsports',
  published_at:'2014-02-26'}},
 {make:'yamaha',models:['YZ250F'],years:[2015],notice:{
  id:'cpsc-15-713',
  title:'Engine recall: check with a Yamaha dealer',
  summary:'2015 YZ250F bikes were recalled: the engine can seize while riding. If the free repair has not been done, stop riding and contact a Yamaha dealer. Yamaha: 800-962-7926.',
  source_url:'https://www.cpsc.gov/Recalls/2015/Yahama-Recalls-YZ250-Competition-Off-Road-Motorcycles',
  vin_url:'https://www.yamahamotorsports.com/',vin_label:'Yamaha Motorsports',
  published_at:'2014-12-18'}},
];
/** Model/year selects a potential notice, never a determination that the rider's VIN is recalled. */
export function recallsForBike(bike:Pick<Bike,'manufacturer'|'model'|'model_year'|'region'>):RecallNotice[]{
 if(canonicalRegion(bike.region)!=='US')return [];
 const make=bike.manufacturer.trim().toLowerCase(),model=bike.model.trim().toUpperCase();
 return RULES.filter(r=>r.make===make&&r.models.includes(model)&&r.years.includes(bike.model_year)).map(r=>r.notice);
}
