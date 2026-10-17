/** What a rider has fitted to a bike, by system. Saved in bike.configuration and read by Garage, Ask BAK and the mobile app.
 *  installed_parts: the parts the rider picked or typed. stock_systems: systems the rider confirmed are stock.
 *  A system in neither list is unknown: BAK must not assume it is stock. */
export const partSystems=[
 {key:'exhaust',label:'Exhaust',hint:'Head pipe, muffler, insert'},
 {key:'suspension',label:'Suspension',hint:'Fork, shock, springs, linkage, revalve'},
 {key:'engine',label:'Engine & cooling',hint:'Piston, cams, head work, radiators'},
 {key:'clutch',label:'Clutch',hint:'Plates, basket, auto clutch, cover'},
 {key:'tuning',label:'Fuel & tuning',hint:'ECU, maps, tuner, fuel system'},
 {key:'intake',label:'Air intake',hint:'Air filter, airbox, cage'},
 {key:'gearing',label:'Gearing & chain',hint:'Sprockets, chain'},
 {key:'brakes',label:'Brakes',hint:'Rotors, pads, calipers, lines'},
 {key:'controls',label:'Bars & controls',hint:'Bars, grips, levers, pegs, clamps'},
 {key:'chassis',label:'Chassis',hint:'Triple clamps, engine mounts, chain guide'},
 {key:'wheels',label:'Wheels & tires',hint:'Wheels, tires, mousse, rim locks'},
 {key:'protection',label:'Guards & skid plate',hint:'Skid plate, frame and radiator guards'},
 {key:'body',label:'Plastics & seat',hint:'Plastics, seat, tank'},
] as const;
export type PartSystem=typeof partSystems[number]['key'];
export const partSystemKeys=partSystems.map(s=>s.key) as PartSystem[];
export const systemLabel=(k:string)=>partSystems.find(s=>s.key===k)?.label??k;
/** One fitted part or piece of work. r links a researched part or service (its notes are added server-side); x marks a part the
 *  rider typed in; d is the rider's detail on work done (map name, valving, oil height). */
export type InstalledPart={s:PartSystem;b:string;n:string;p?:string;r?:string;x?:boolean;d?:string;color?:string};
export const MAX_PARTS=40;
const clip=(v:unknown,n:number)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,n);
/** Clean whatever is stored (older builds, other clients) into the current shape. */
export function readInstalled(configuration:Record<string,unknown>|null|undefined):{parts:InstalledPart[];stock:PartSystem[];notes:Partial<Record<PartSystem,string>>;plastics?:string}{
 const c=configuration??{},parts:InstalledPart[]=[];
 for(const raw of Array.isArray(c.installed_parts)?c.installed_parts:[]){
  if(!raw||typeof raw!=='object')continue;const o=raw as Record<string,unknown>,s=String(o.s) as PartSystem;
  if(!partSystemKeys.includes(s))continue;const n=clip(o.n,90),b=clip(o.b,60);if(!n&&!b)continue;
  const part:InstalledPart={s,b,n};const p=clip(o.p,48);if(p)part.p=p;const r=clip(o.r,40);if(r&&/^[a-z0-9-]+$/i.test(r))part.r=r;if(o.x)part.x=true;const d=clip(o.d,120);if(d)part.d=d;
  if(typeof o.color==='string'&&/^[a-z0-9-]{1,48}$/.test(o.color))part.color=o.color;
  parts.push(part);if(parts.length>=MAX_PARTS)break;
 }
 const fitted=new Set(parts.map(p=>p.s));
 const stock=(Array.isArray(c.stock_systems)?c.stock_systems:[]).map(String).filter((k):k is PartSystem=>partSystemKeys.includes(k as PartSystem)&&!fitted.has(k as PartSystem));
 const notes:Partial<Record<PartSystem,string>>={};
 if(c.parts_notes&&typeof c.parts_notes==='object')for(const [k,v] of Object.entries(c.parts_notes as Record<string,unknown>)){const t=clip(v,280);if(t&&partSystemKeys.includes(k as PartSystem))notes[k as PartSystem]=t;}
 return {parts,stock:[...new Set(stock)],notes,...(typeof c.plastics_color==='string'&&/^[a-z0-9-]{1,48}$/.test(c.plastics_color)?{plastics:c.plastics_color}:{})};
}
/** Write the picker's result back into a configuration object (other keys untouched). */
export function writeInstalled(configuration:Record<string,unknown>,value:{parts:InstalledPart[];stock:PartSystem[];notes:Partial<Record<PartSystem,string>>;plastics?:string}):Record<string,unknown>{
 const clean=readInstalled({installed_parts:value.parts,stock_systems:value.stock,parts_notes:value.notes});
 return {...configuration,installed_parts:clean.parts,stock_systems:clean.stock,parts_notes:clean.notes,plastics_color:value.plastics??null};
}
/** How many systems the rider has accounted for (parts fitted or confirmed stock). */
export function systemsRecorded(configuration:Record<string,unknown>|null|undefined){const {parts,stock}=readInstalled(configuration);return new Set([...parts.map(p=>p.s),...stock]).size;}
export const partLabel=(p:InstalledPart)=>[p.b,p.n].filter(Boolean).join(' ');
