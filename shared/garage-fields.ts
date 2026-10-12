import type {Bike} from './types.ts';
/** One definition of the build profile for web and native, so a bike edited on either reads the same. */
export type GarageField={key:string;label:string;numeric?:boolean};
export const garageFieldGroups:Record<'Rider'|'Engine'|'Suspension'|'Drivetrain',GarageField[]>={
 Rider:[{key:'geared_weight_lb',label:'Weight in riding gear (lb)',numeric:true},{key:'height_in',label:'Height (inches)',numeric:true},{key:'skill_level',label:'Skill level'},{key:'discipline',label:'Discipline / conditions'}],
 Engine:[{key:'engine_modifications',label:'Engine modifications'},{key:'intake',label:'Air filter / intake'},{key:'exhaust',label:'Exhaust system'},{key:'ecu',label:'ECU / firmware'},{key:'active_map',label:'Active map and source'}],
 Suspension:[{key:'fork',label:'Fork identity / tune'},{key:'shock',label:'Shock identity / tune'},{key:'fork_spring_rate',label:'Fork spring rate (as marked, e.g. 4.8 N/mm)'},{key:'shock_spring_rate',label:'Shock spring rate (as marked, e.g. 45 N/mm)'},{key:'rider_sag_mm',label:'Rider sag (mm, as manuals list it)',numeric:true},{key:'fork_height_mm',label:'Fork height in clamps (mm)',numeric:true},{key:'fork_compression',label:'Fork compression setting (include reference)'},{key:'fork_rebound',label:'Fork rebound setting (include reference)'},{key:'shock_compression',label:'Shock LSC / HSC settings'},{key:'shock_rebound',label:'Shock rebound setting'}],
 Drivetrain:[{key:'front_sprocket',label:'Front sprocket teeth',numeric:true},{key:'rear_sprocket',label:'Rear sprocket teeth',numeric:true},{key:'clutch',label:'Clutch modifications'},{key:'front_tire',label:'Front tire / size'},{key:'rear_tire',label:'Rear tire / size'},{key:'tire_pressures',label:'Tire pressures (psi, front / rear)'}],
};
/** Rider measurements are kept in US units. Builds saved before that change stored kilograms and centimetres; convert them once, here. */
export function usConfiguration(configuration:Record<string,unknown>|null|undefined):Record<string,unknown>{
 const c:Record<string,unknown>={...(configuration??{})},num=(v:unknown)=>v===null||v===undefined||v===''||!Number.isFinite(Number(v))?null:Number(v);
 const kg=num(c.geared_weight_kg),cm=num(c.height_cm);
 if(kg!==null&&num(c.geared_weight_lb)===null)c.geared_weight_lb=Math.round(kg*2.2046226);
 if(cm!==null&&num(c.height_in)===null)c.height_in=Math.round(cm/2.54);
 delete c.geared_weight_kg;delete c.height_cm;
 return c;
}
export const allGarageFields=Object.values(garageFieldGroups).flat();
const filled=(v:unknown)=>v!==null&&v!==undefined&&String(v).trim()!=='';
export type BuildCheck={id:string;label:string;done:boolean;why:string};
/** What BAK knows about this build. Each item says why it matters, so a gap is a reason to fill it in. */
export function buildChecks(bike:Pick<Bike,'engine_hours'|'configuration'>):BuildCheck[]{
 const c=bike.configuration??{},any=(keys:string[])=>keys.some(k=>filled(c[k]));
 return [
  {id:'hours',label:'Engine hours',done:bike.engine_hours!==null&&bike.engine_hours!==undefined,why:'Service timing and wear-related advice depend on hours.'},
  {id:'rider',label:'Rider weight and level',done:(filled(c.geared_weight_lb)||filled(c.geared_weight_kg))&&filled(c.skill_level),why:'Spring rate and setup direction start from the rider.'},
  {id:'suspension',label:'Current suspension settings',done:any(['rider_sag_mm','fork_compression','fork_rebound','shock_compression','shock_rebound']),why:'BAK can only suggest a change from where your clickers and sag are now.'},
  {id:'springs',label:'Spring rates or revalve',done:any(['fork_spring_rate','shock_spring_rate','fork','shock']),why:'Stock settings stop applying once springs or valving change.'},
  {id:'engine',label:'Engine, exhaust and map',done:any(['engine_modifications','exhaust','ecu','active_map','intake']),why:'Mapping and jetting advice depends on what is fitted.'},
  {id:'drivetrain',label:'Gearing and tires',done:any(['front_sprocket','rear_sprocket','front_tire','rear_tire','tire_pressures']),why:'Gearing and tire choice change how the bike drives and turns.'},
 ];
}
export function buildProgress(bike:Pick<Bike,'engine_hours'|'configuration'>){const checks=buildChecks(bike);return {done:checks.filter(x=>x.done).length,total:checks.length,missing:checks.filter(x=>!x.done)};}
