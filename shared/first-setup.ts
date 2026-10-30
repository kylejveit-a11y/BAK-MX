// Pure helpers for the 60-second first setup (tested in Node).
import type {Bike} from './types';
const str=(v:unknown)=>v==null?'':String(v);
/** True when the bike still lacks what a starting setup needs about the rider. */
export function needsFirstSetup(bike:Bike|undefined){
 if(!bike)return false;const c=bike.configuration??{};
 return !(str(c.geared_weight_lb)||str(c.geared_weight_kg))||!str(c.skill_level)||!str(c.discipline);
}

/** The question BAK gets, written from the four answers. */
export function firstSetupQuestion(bike:Bike,a:{weight:string;level:string;discipline:string;dirt:string}){
 const dirt=a.dirt?` on ${a.dirt.toLowerCase()} dirt`:'';
 return `Starting setup for my ${bike.model_year} ${bike.manufacturer} ${bike.model}: I'm a ${a.level.toLowerCase()} rider, ${a.weight} lb in gear, riding ${a.discipline.toLowerCase()}${dirt}. Give me where to start from the published settings: rider sag, each clicker, fork air or spring, tire pressures, and the one thing to check in my first session.`;
}

