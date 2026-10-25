// Which part of the bike a verified fact is about, in the words a rider uses: "Brakes", "Suspension", "Wheels & tires".
// Most loaded facts carry a broad source label ("service", "maintenance", property "specification"), so the label is read
// from the fact itself. Statements start with the manual's own heading path, "<section> / <item>: <value>", e.g.
// "Chassis tightening torques / Screw, front brake caliper (M8): 25 Nm". The item names the part ("front brake caliper"),
// so it decides the system; the section ("chassis tightening torques", "service schedule") only says what kind of fact it is.
export type FactSystem='Suspension'|'Brakes'|'Wheels & tires'|'Chain & sprockets'|'Clutch'|'Transmission'|'Engine'|'Cooling'
 |'Fuel & air'|'Exhaust'|'Electrical & ignition'|'Oils & fluids'|'Chassis'|'Controls'|'Dimensions & weight'|'General';
export type FactKind='torque'|'service'|'setting'|'spec';
type FactLike={domain?:string|null;property?:string|null;statement:string};

// Order matters: the first match wins. Specific parts come before the broad words that also appear in them
// ("fork oil" is suspension, not oils; "engine sprocket" is the chain and sprockets, not the engine; "exhaust valve" is the engine).
const RULES:[FactSystem,RegExp][]=[
 ['Brakes',/\b(brake ?ho\w*|brakes?|calipers?|brake discs?|brake pads?|brake linings?|master cylinder|brake fluid|brake lines?|brake pedal|foot brake|hand brake)\b/],
 ['Clutch',/\bclutch\b|\bslave cylinder\b|friction (?:discs?|plates?)/],
 // "link fork" and "fork pivot" are KTM's words for the swingarm (chassis), not the front fork
 ['Suspension',/\b((?<!link )forks?(?! pivot)|shock(?: absorber)?s?|damping|rebound|compression adjuster|sag|spring (?:rate|preload|length)|preload|linkage|heim joint|suspension|cartridge|angle lever|pull rod|wheel travel)\b/],
 ['Chassis',/\b(link fork|fork pivot|swing ?arm|engine (?:bracket|brace|carrying|mount)\w*|frame protector|(?<!valve )seats?|spoiler|fenders?|number plate|side covers?|skid plate)\b/],
 ['Wheels & tires',/\b(tires?|tyres?|rims?|rim lock|spokes?|spoke nipple|wheels?|hubs?|wheel spindle|wheel bearing|axle(?! load)|valve stem)\b/],
 ['Chain & sprockets',/\b(chain(?! tensioner| guide rail|case)|sprockets?|final drive|secondary (?:ratio|reduction)|drive chain)\b/],
 ['Electrical & ignition',/\b(spark plugs?|ignition|alternator|stator|rotor|battery|(?<!kick )starter|sensor|electrical|wiring|wire|fuse|regulator|ecu|fault memory|diagnostics tool|lamps?|lights?|horn|kill switch|map select)\b/],
 ['Cooling',/\b(coolant|antifreeze|frost protection|radiators?|water pump|cooling|thermostat|fan)\b/],
 ['Fuel & air',/\b(fuel|air filter|air box|airbox|throttle(?! grip)|carburet(?:or|tor)|main jet|pilot jet|jet needle|needle (?:clip|position|jet|valve)|float (?:level|height|chamber|bowl)|injector|intake (?:flange|manifold|boot)|reed|idle speed|choke)\b/],
 ['Oils & fluids',/\b(engine oil|gear oil|oil filter|oil screen|oil drain|oil pressure|oil level|lubricat\w*|grease|oil)\b/],
 ['Engine',/\b(valves?|valve clearance|cams?|camshafts?|cam chain|timing chain|pistons?|piston rings?|piston pin|wrist pin|cylinders?|cylinder head|head gasket|crank(?:shaft)?|conrod|connecting rod|big end|bore|stroke|compression ratio|displacement|balancer|exhaust control|power ?valve|ypvs|engine case|engine)\b/],
 ['Exhaust',/\b(exhaust|silencer|muffler|manifold|header pipe|spark arrest(?:o|e)r|glass fiber)\b/],
 ['Transmission',/\b(gear(?:box| ratios?)?s?|transmission|shift(?: drum| shaft| lever| fork)?|primary (?:drive|gear|transmission|reduction)|kick ?starter|tooth pair)\b/],
 ['Controls',/\b(handlebars?|grips?|levers?|footpegs?|foot ?rests?|hand ?guards?)\b/],
 ['Chassis',/\b(chassis|frame|subframe|steering|triple clamp|wheelbase|rake|trail|offset|ground clearance)\b/],
 ['Dimensions & weight',/\b(weight|height|length|width|dimensions?|axle load|capacity)\b/],
];

const SECTION=/^\s*(?:\([^)]*\)\s*)?([^:]*):/;
/** The "<section> / <item>" heading of a statement, lower case, and the item part alone. */
function heading(statement:string){
 const m=statement.match(SECTION);const head=(m?m[1]:statement.split('.')[0]).toLowerCase().replace(/\s+/g,' ').trim();
 const parts=head.split(' / ');
 const section=parts.length>1?parts[0]:'';
 const item=parts.length>1?parts.slice(1).join(' / '):head;
 return {head,section,item};
}

/** The rider-facing system a fact belongs to. */
export function factSystem(c:FactLike):FactSystem{
 const {item,head}=heading(c.statement);
 // The item names the part ("engine tightening torques / screw, engine sprocket" is the sprocket), so it is read first;
 // the whole heading is the fallback ("engine / design").
 for(const text of [item,head])for(const [sys,rx] of RULES)if(rx.test(text))return sys;
 const d=(c.domain??'').toLowerCase();
 if(d==='suspension')return 'Suspension';
 if(d==='brakes')return 'Brakes';
 if(d==='cooling')return 'Cooling';
 if(d==='lubrication')return 'Oils & fluids';
 if(d==='electrical'||d==='ignition')return 'Electrical & ignition';
 if(d==='fuel')return 'Fuel & air';
 if(d==='final_drive_gearing')return 'Chain & sprockets';
 if(d==='transmission')return 'Transmission';
 if(d==='wheels_tires')return 'Wheels & tires';
 if(d==='chassis')return 'Chassis';
 if(d==='engine'||d==='engine_mechanical')return 'Engine';
 return 'General';
}

/** What kind of fact it is: a tightening torque, a service interval, an adjustable setting, or a fixed specification. */
export function factKind(c:FactLike):FactKind{
 const p=(c.property??'').toLowerCase(),{section,head}=heading(c.statement),d=(c.domain??'').toLowerCase();
 if(p==='torque'||/tightening torque/.test(section)||/\d\s?(?:n·m|nm|n-m)\b/i.test(c.statement))return 'torque';
 if(p==='service_interval'||d==='maintenance'||section==='service schedule')return 'service';
 if(/damping|rebound|compression|sag|preload|clicks?|turns? out|air pressure|tire pressure|tyre pressure|spring rate|fork height/.test(p+' '+head))return 'setting';
 return 'spec';
}

const KIND_LABEL:Record<FactKind,string>={torque:'Torque',service:'Service interval',setting:'Setting',spec:'Spec'};
/** "Brakes · Torque", for a card heading or a group name. */
export function factLabel(c:FactLike){return `${factSystem(c)} · ${KIND_LABEL[factKind(c)]}`;}
