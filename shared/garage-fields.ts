import type {Bike} from './types.ts';
import {readInstalled,systemsRecorded,partSystems} from './installed-parts.ts';
/** One definition of the build profile for web and native, so a bike edited on either reads the same. Settings live here;
 *  parts and work done live only on the build sheet (installed-parts.ts), so the two can never disagree. */
export type GarageField={key:string;label:string;numeric?:boolean;unit?:string;placeholder?:string;options?:string[];hint?:string;more?:boolean;/** pick several; saved as one comma-separated string */multi?:boolean};
/** Kinds of riding, used for the main one and for the others a rider also does. */
export const RIDING_TYPES=['Motocross','Supercross','Arenacross','Cross-country / GNCC','Hare scrambles','Enduro','Desert','Trail','Flat track','Pit bike'];
/** A multi-pick field's saved string as a list, and back. */
export const multiValues=(v:unknown)=>String(v??'').split(',').map(x=>x.trim()).filter(Boolean);
export const multiString=(list:string[])=>list.join(', ');
/** Written the way riders write it on the setup sheet in the truck: clicks out from all the way in, sag in mm, gearing 13/50.
 *  Everything is optional; "more" fields stay folded away so a first setup takes a couple of minutes. */
export const garageFieldGroups:Record<string,GarageField[]>={
 'You':[
  {key:'geared_weight_lb',label:'Weight in riding gear',numeric:true,unit:'lb',placeholder:'185'},
  {key:'skill_level',label:'Riding level',options:['Beginner','Novice','Intermediate','Expert','Pro','Vet']},
  {key:'discipline',label:'Main kind of riding',options:RIDING_TYPES},
  {key:'other_disciplines',label:'Also ride',options:RIDING_TYPES,multi:true,hint:'Pick every other kind you ride'},
  {key:'usual_dirt',label:'Usual dirt',options:['Sand','Loam','Hard-pack','Clay','Mixed','Mud / wet'],more:true},
  {key:'height_in',label:'Height',numeric:true,unit:'in',placeholder:'70',more:true},
  {key:'years_riding',label:'Years riding',numeric:true,unit:'yrs',placeholder:'6',more:true},
  {key:'race_class',label:'Race class',placeholder:'250 B, Vet 30+, or none',more:true},
  {key:'riding_goal',label:'What you ride for',options:['Racing','Getting faster','Fun and trail','Learning'],more:true},
  {key:'rider_limits',label:'Anything that limits how you ride',placeholder:'Optional, e.g. a bad left knee',hint:'Only so coaching fits you',more:true}],
 'Bike fit':[
  {key:'bar_bend',label:'Handlebar',placeholder:'Stock, or brand and bend'},
  {key:'bar_position',label:'Bar height and position',placeholder:'Stock, or risers +10 mm, clamps forward'},
  {key:'lever_position',label:'Lever angle and reach',placeholder:'Angled down slightly, reach in 2'},
  {key:'peg_position',label:'Footpegs',options:['Stock','Lowered','Raised','Moved back']},
  {key:'seat',label:'Seat',placeholder:'Stock, tall, low or soft foam',more:true}],
 'Clickers & sag':[
  {key:'fork_compression',label:'Fork compression',placeholder:'12 out',hint:'Clicks out from all the way in'},
  {key:'fork_rebound',label:'Fork rebound',placeholder:'18 out'},
  {key:'shock_compression',label:'Shock compression',placeholder:'12 out / 1.5 turns',hint:'Low-speed clicks / high-speed turns'},
  {key:'shock_rebound',label:'Shock rebound',placeholder:'15 out'},
  {key:'rider_sag_mm',label:'Race sag',numeric:true,unit:'mm',placeholder:'105',hint:'Measured with you on the bike in gear'},
  {key:'fork_spring_rate',label:'Fork springs',placeholder:'Stock, or 4.6 N/mm / air psi'},
  {key:'shock_spring_rate',label:'Shock spring',placeholder:'Stock, or 48 N/mm'},
  {key:'fork_height_mm',label:'Fork tubes above top clamp',numeric:true,unit:'mm',placeholder:'5',more:true}],
 'Gearing, tires & map':[
  {key:'front_sprocket',label:'Front sprocket',numeric:true,placeholder:'13'},
  {key:'rear_sprocket',label:'Rear sprocket',numeric:true,placeholder:'50'},
  {key:'tire_pressures',label:'Tire pressure',placeholder:'13 / 13 psi'},
  {key:'active_map',label:'Map you run',placeholder:'Map 2, TC on'}],
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
/** Free-text part answers older versions asked for on this form, by build-sheet system. Parts now live only on the build
 *  sheet; these are read as notes for a system the sheet doesn't cover, and never shown as a separate source. */
export const LEGACY_PART_FIELDS:Record<string,string>={exhaust:'exhaust',fork:'suspension',shock:'suspension',engine_modifications:'engine',ecu:'tuning',intake:'intake',clutch:'clutch',front_tire:'wheels',rear_tire:'wheels'};
const filled=(v:unknown)=>v!==null&&v!==undefined&&String(v).trim()!=='';
export type BuildCheck={id:string;label:string;done:boolean;why:string};
/** What BAK knows about this build. Each item says why it matters, so a gap is a reason to fill it in. */
export function buildChecks(bike:Pick<Bike,'engine_hours'|'configuration'>):BuildCheck[]{
 const c=bike.configuration??{},any=(keys:string[])=>keys.some(k=>filled(c[k]));
 const sheet=readInstalled(c),onSheet=(systems:string[])=>sheet.parts.some(p=>systems.includes(p.s))||sheet.stock.some(s=>systems.includes(s));
 return [
  {id:'hours',label:'Engine hours',done:bike.engine_hours!==null&&bike.engine_hours!==undefined,why:'Service timing and wear-related advice depend on hours.'},
  {id:'rider',label:'Rider weight and level',done:(filled(c.geared_weight_lb)||filled(c.geared_weight_kg))&&filled(c.skill_level),why:'Spring rate and setup direction start from the rider.'},
  {id:'suspension',label:'Current suspension settings',done:any(['rider_sag_mm','fork_compression','fork_rebound','shock_compression','shock_rebound']),why:'BAK can only suggest a change from where your clickers and sag are now.'},
  {id:'springs',label:'Spring rates or revalve',done:any(['fork_spring_rate','shock_spring_rate'])||onSheet(['suspension']),why:'Stock settings stop applying once springs or valving change.'},
  {id:'engine',label:'Engine, exhaust and map',done:any(['active_map'])||onSheet(['exhaust','engine','tuning','intake']),why:'Mapping and jetting advice depends on what is fitted.'},
  {id:'drivetrain',label:'Gearing and tires',done:any(['front_sprocket','rear_sprocket','tire_pressures'])||onSheet(['gearing','wheels']),why:'Gearing and tire choice change how the bike drives and turns.'},
  {id:'parts',label:'What’s on the bike',done:systemsRecorded(c)>=Math.ceil(partSystems.length/2),why:'Fitted parts change which stock settings and maps still apply.'},
 ];
}
export function buildProgress(bike:Pick<Bike,'engine_hours'|'configuration'>){const checks=buildChecks(bike);return {done:checks.filter(x=>x.done).length,total:checks.length,missing:checks.filter(x=>!x.done)};}
