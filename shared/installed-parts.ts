/** What a rider has fitted to a bike, by system. Saved in bike.configuration and read by Garage, Ask BAK and the mobile app.
 *  installed_parts: the parts the rider picked or typed. stock_systems: systems the rider confirmed are stock.
 *  A system in neither list is unknown: BAK must not assume it is stock. */
export const partSystems=[
 // Ordered the way a rider walks the bike: what it handles on, the motor front to back, what stops and rolls it, then what they touch and what protects it.
 {key:'suspension',label:'Suspension',hint:'Fork, shock, springs, linkage, revalve'},
 {key:'chassis',label:'Chassis',hint:'Triple clamps, start device, engine mounts, chain guide'},
 {key:'engine',label:'Engine & cooling',hint:'Piston, cams, head work, radiators'},
 {key:'intake',label:'Air intake',hint:'Air filter, airbox, cage'},
 {key:'exhaust',label:'Exhaust',hint:'Head pipe, muffler, insert'},
 {key:'tuning',label:'Fuel & tuning',hint:'ECU, maps, tuner, fuel system'},
 {key:'clutch',label:'Clutch',hint:'Plates, basket, auto clutch, cover'},
 {key:'gearing',label:'Gearing & chain',hint:'Sprockets, chain'},
 {key:'brakes',label:'Brakes',hint:'Rotors, pads, calipers, lines'},
 {key:'wheels',label:'Wheels & tires',hint:'Wheels, tires, mousse, rim locks'},
 {key:'controls',label:'Bars & controls',hint:'Bars, bar mounts, grips, levers, pegs'},
 {key:'protection',label:'Guards & skid plate',hint:'Skid plate, frame and radiator guards'},
 {key:'body',label:'Plastics & seat',hint:'Plastics, seat, tank'},
] as const;
export type PartSystem=typeof partSystems[number]['key'];
export const partSystemKeys=partSystems.map(s=>s.key) as PartSystem[];
export const systemLabel=(k:string)=>partSystems.find(s=>s.key===k)?.label??k;
/** One fitted part or piece of work. r links a researched part or service (its notes are added server-side); x marks a part the
 *  rider typed in; d is the rider's detail on work done (map name, valving, oil height). */
/** k: the colour the rider chose from the maker's listed colours. */
/** o marks a part the rider owns but has off the bike right now (a second suspension set, sand tires, a quiet insert), so it is
 *  kept and can be swapped back on. v is the size or variant the rider picked ("52T"), which decides the part number. */
export type InstalledPart={s:PartSystem;b:string;n:string;p?:string;r?:string;x?:boolean;d?:string;k?:string;o?:boolean;v?:string};
export const MAX_PARTS=40;
const clip=(v:unknown,n:number)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,n);
/** Parts whose name says plainly where they belong. Only unambiguous names move; everything else keeps the rider's choice. */
const PLACE:[RegExp,PartSystem][]=[
 [/holeshot|start(?:ing)? (?:device|blocks?)|launch device/i,'chassis'],
 [/^(?!.*(?:mount|spacer|handguard|bushing|bearing|hardware)).*\btriple clamps?\b/i,'chassis'],
 [/chain (?:guide|slider)s?\b/i,'chassis'],
 [/sprocket|^(?!.*(?:chain rollers?|adjuster|guide|slider|guard|breaker|tool|lube|clean)).*\b(?:4[12]0|428|520|525)\b.*\bchain\b/i,'gearing'],
 [/brake pads?\b|brake rotor(?!s? guard)|\brotor kit\b/i,'brakes'],
 [/air filter|airbox|air box|filter cage/i,'intake'],
 [/skid plate|frame guards?\b|radiator (?:guards?|braces?|louvers?)|(?:brake )?(?:disc|disk|rotor) guards?/i,'protection'],
 [/^(?!.*(?:tool|wrench)).*\bwheel bearings?\b/i,'wheels'],
 [/^(?!.*(?:tool|wrench)).*(?:\b(?:steering (?:stem |head )?|swing ?arm )bearings?\b|\bengine (?:mounts?|braces?|brace set|hangers?)\b)/i,'chassis'],
 [/^(?!.*(?:switch|ecu|map|handguard|hand guard|guard|clamp)).*(?:handlebars?\b|\bbar mounts?\b|\bgrips?\b|\blevers?\b|foot ?pegs?)/i,'controls'],
];
export function placeSystem(s:PartSystem,_b:string,n:string):PartSystem{for(const [re,k] of PLACE)if(re.test(n))return k;return s;}
/** Order inside a system, the way a build sheet reads: front to back, big parts before wear parts. Unmatched parts keep their order at the end. */
const ORDER:Partial<Record<PartSystem,RegExp[]>>={
 suspension:[/fork/i,/shock|preload/i,/linkage|\blink\b/i],
 chassis:[/triple clamp/i,/holeshot|launch|start/i,/engine mount/i,/chain (?:guide|slider)/i],
 engine:[/piston|top end|big bore/i,/cam/i,/head|valve/i,/radiator|cool|fan/i],
 intake:[/filter(?! cage)/i,/cage/i,/airbox|air box/i],
 exhaust:[/full system|head ?pipe|header/i,/mid ?pipe/i,/muffler|silencer|slip/i,/insert|spark|flange/i],
 tuning:[/ecu|flash|remap/i,/map\b/i,/tuner/i,/fuel/i],
 clutch:[/kit|auto|rekluse/i,/plate/i,/basket/i,/spring/i,/cover/i],
 gearing:[/front sprocket/i,/rear sprocket/i,/chain/i],
 brakes:[/rotor/i,/caliper/i,/line|hose/i,/pad/i,/master|reservoir/i],
 wheels:[/wheel/i,/front tire|front tyre/i,/rear tire|rear tyre/i,/tire|tyre/i,/mousse|tube/i,/rim lock/i],
 controls:[/handlebar|fat ?bar|twin ?wall|\bbars?\b/i,/bar mount/i,/grip/i,/lever/i,/throttle/i,/peg/i],
 protection:[/skid plate/i,/frame guard/i,/radiator/i,/disc guard|rotor guard/i],
 body:[/plastics|graphics/i,/seat/i,/tank/i],
};
const rank=(p:InstalledPart)=>{const list=ORDER[p.s]??[],t=p.b+' '+p.n;const i=list.findIndex(re=>re.test(t));return i<0?list.length:i;};
const systemIndex=(k:PartSystem)=>partSystemKeys.indexOf(k);
/** Parts in build-sheet order: by system, then by position inside the system. Stable for ties. */
export function sortInstalled(parts:InstalledPart[]):InstalledPart[]{return parts.map((p,i)=>({p,i})).sort((a,b)=>systemIndex(a.p.s)-systemIndex(b.p.s)||rank(a.p)-rank(b.p)||a.i-b.i).map(x=>x.p);}
/** Clean whatever is stored (older builds, other clients) into the current shape. */
export function readInstalled(configuration:Record<string,unknown>|null|undefined):{parts:InstalledPart[];stock:PartSystem[];notes:Partial<Record<PartSystem,string>>}{
 const c=configuration??{},parts:InstalledPart[]=[];
 for(const raw of Array.isArray(c.installed_parts)?c.installed_parts:[]){
  if(!raw||typeof raw!=='object')continue;const o=raw as Record<string,unknown>,s=String(o.s) as PartSystem;
  if(!partSystemKeys.includes(s))continue;const n=clip(o.n,90),b=clip(o.b,60);if(!n&&!b)continue;
  const part:InstalledPart={s:placeSystem(s,b,n),b,n};const p=clip(o.p,48);if(p)part.p=p;const r=clip(o.r,120);if(r&&/^[a-z0-9-]+$/i.test(r))part.r=r;if(o.x)part.x=true;const d=clip(o.d,120);if(d)part.d=d;const k=clip(o.k,30);if(k)part.k=k;if(o.o)part.o=true;const v=clip(o.v,20);if(v)part.v=v;
  parts.push(part);if(parts.length>=MAX_PARTS)break;
 }
 parts.splice(0,parts.length,...sortInstalled(parts));
 const fitted=new Set(parts.filter(p=>!p.o).map(p=>p.s));
 const stock=(Array.isArray(c.stock_systems)?c.stock_systems:[]).map(String).filter((k):k is PartSystem=>partSystemKeys.includes(k as PartSystem)&&!fitted.has(k as PartSystem));
 const notes:Partial<Record<PartSystem,string>>={};
 if(c.parts_notes&&typeof c.parts_notes==='object')for(const [k,v] of Object.entries(c.parts_notes as Record<string,unknown>)){const t=clip(v,280);if(t&&partSystemKeys.includes(k as PartSystem))notes[k as PartSystem]=t;}
 return {parts,stock:[...new Set(stock)],notes};
}
/** Write the picker's result back into a configuration object (other keys untouched). */
export function writeInstalled(configuration:Record<string,unknown>,value:{parts:InstalledPart[];stock:PartSystem[];notes:Partial<Record<PartSystem,string>>}):Record<string,unknown>{
 const clean=readInstalled({installed_parts:value.parts,stock_systems:value.stock,parts_notes:value.notes});
 return {...configuration,installed_parts:clean.parts,stock_systems:clean.stock,parts_notes:clean.notes};
}
/** How many systems the rider has accounted for (parts fitted or confirmed stock). */
export function systemsRecorded(configuration:Record<string,unknown>|null|undefined){const {parts,stock}=readInstalled(configuration);return new Set([...parts.filter(p=>!p.o).map(p=>p.s),...stock]).size;}
export const partLabel=(p:InstalledPart)=>[p.b,p.n].filter(Boolean).join(' ')+([p.v,p.k].filter(Boolean).length?` (${[p.v,p.k].filter(Boolean).join(', ')})`:'');
