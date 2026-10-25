import type {PartSystem} from './installed-parts.ts';
/** What kind of change, per system, in rider words. A listed part belongs to the first type its name matches; small
 *  service bits (springs, end caps, stickers, bolts) match none and stay out of the picker unless the rider asks. */
export type PartType={label:string;match:RegExp;keep?:boolean};
const SMALL=/\b(end ?caps?|springs?|stickers?|decals?|straps?|packing|repack|bolts?|clips?|braces?|brackets?|gaskets?|rings?|o-rings?|grommets?|hardware|replacement|wrap|plugs?|shields?|heat protection|nuts?|washers?|screws?|rebuild|seal kit|bushings?|bearings?|caps?\b(?! kit)|dust|stickers)\b/i;
export const partTypes:Partial<Record<PartSystem,PartType[]>>={
 exhaust:[
  {label:'Full exhaust system',match:/\b(full|complete)\b|\bsystem\b/i},
  {label:'Two-stroke pipe',match:/\b(pipe|chamber|gnarly|fatty|platinum|works)\b(?!.*(silencer|muffler))/i},
  {label:'Slip-on muffler',match:/\b(slip-?on|silencer|muffler)\b/i},
  {label:'Head pipe',match:/\b(head ?pipe|header|megabomb|powerbomb|mid-?pipe)\b/i},
  {label:'Insert or spark arrester',match:/\b(insert|spark|quiet|noise|db)\b/i}],
 suspension:[
  {label:'Bearings and seals',match:/^(?!.*\b(?:crank(?:shaft)?|main|transmission|countershaft|gearbox|engine|water pump|wheel|steering)\s+(?:bearing|seal)).*\b(bearings?|seals?|seal kit|seal head)\b/i,keep:true},
  {label:'Fork springs',match:/\bfork\b.*\bsprings?\b|\bsprings?\b.*\bfork\b/i},
  {label:'Shock spring',match:/\bshock\b.*\bsprings?\b|\bsprings?\b.*\bshock\b/i},
  {label:'Valving, bladder or perch kit',match:/\b(valving|revalve|bladder|perch(es)?|gold valve|mid-?valve|valve kit)\b/i},
  {label:'Preload adjuster',match:/\bpre-?load\b/i},
  {label:'Linkage',match:/\b(linkage|link|pull ?rod|dog ?bone)\b/i},
  {label:'Fork (cartridge, conversion, kit)',match:/\b(fork|cartridge|conversion|cone valve)\b/i},
  {label:'Shock',match:/\bshock\b/i}],
 engine:[
  {label:'Piston or top end',match:/\b(piston|top end)\b/i},
  {label:'Big bore or cylinder',match:/\b(big bore|cylinder)\b/i},
  {label:'Cams',match:/\bcams?(haft)?\b/i},
  {label:'Head work',match:/\bhead\b/i},
  {label:'Radiators and cooling',match:/\b(radiators?|fan|water pump|coolant|hose kit)\b/i},
  {label:'Engine covers',match:/\b(ignition cover|clutch cover|cover)\b/i}],
 clutch:[
  {label:'Auto clutch',match:/\b(auto|radius|exp|core)\b/i},
  {label:'Plates',match:/\b(plates?|pack|friction|torqdrive)\b/i},
  {label:'Basket or hub',match:/\b(basket|hub|pressure plate)\b/i},
  {label:'Clutch cover',match:/\bcover\b/i},
  {label:'Hydraulic clutch',match:/\b(hydraulic|slave|master)\b/i}],
 tuning:[
  {label:'ECU, tuner or map switch',match:/\b(ecu|e\.c\.u|tuner|maps?|wifi|wi-fi|calibration|connectivity|ignition|flash|remap|control unit|controller)\b/i},
  {label:'Fuel injection',match:/\b(injectors?|injection|throttle body|fuel pump|pump module)\b/i},
  {label:'Carburetor and jetting',match:/\b(carb\w*|jets?|jetting|needles?|float|pwk|mikuni|accelerator pump)\b/i}],
 intake:[
  {label:'Air filter',match:/\bfilters?\b/i},
  {label:'Airbox or cover',match:/\b(air ?box|cover|boot|snorkel)\b/i},
  {label:'Filter cage',match:/\bcage\b/i},
  {label:'Reed valve',match:/\breeds?\b/i}],
 gearing:[
  {label:'Rear sprocket',match:/\brear\b.*\bsprocket|sprocket.*\brear\b/i},
  {label:'Front sprocket',match:/\b(front|countershaft)\b.*\bsprocket|sprocket.*\bfront\b/i},
  {label:'Chain',match:/\bchain\b(?!.*(guide|slider|roller))/i},
  {label:'Chain and sprocket kit',match:/\bkit\b/i}],
 brakes:[
  {label:'Rotor',match:/\b(rotors?|discs?)\b/i},
  {label:'Pads',match:/\bpads?\b/i},
  {label:'Caliper or master cylinder',match:/\b(caliper|master)\b/i},
  {label:'Brake lines',match:/\b(lines?|hoses?)\b/i}],
 controls:[
  {label:'Handlebar',match:/\b(handlebars?|fat ?bar|bars?)\b(?! (pad|mount|clamp))/i},
  {label:'Grips',match:/\bgrips?\b/i},
  {label:'Levers and perches',match:/\b(levers?|perch(es)?)\b/i},
  {label:'Footpegs',match:/\b(foot ?pegs?|pegs?)\b/i},
  {label:'Bar mounts or clamps',match:/\b(bar mounts?|bar clamps?|clamps?|mounts?)\b/i},
  {label:'Hand guards',match:/\b(hand ?guards?|brush guards?)\b/i}],
 chassis:[
  {label:'Bearings',match:/\bbearings?\b/i,keep:true},
  {label:'Holeshot device',match:/\b(holeshot|start(?:ing)? (?:device|blocks?)|launch)\b/i},
  {label:'Triple clamps',match:/\b(triple|clamps?)\b/i},
  {label:'Engine mounts',match:/\bengine (?:mounts?|braces?|brace set|hangers?)\b|\bhead stays?\b/i,keep:true},
  {label:'Steering damper',match:/\b(damper|stabilizer)\b/i},
  {label:'Chain guide or slider',match:/\b(chain guide|slider|rollers?)\b/i}],
 wheels:[
  {label:'Wheel bearings',match:/\bbearings?\b/i,keep:true},
  {label:'Wheels',match:/\b(wheels?|wheel set|rims?|hubs?)\b/i},
  {label:'Tires',match:/\b(tires?|tyres?)\b/i},
  {label:'Mousse or tube',match:/\b(mousse|tubes?|tubliss|foam)\b/i},
  {label:'Rim locks',match:/\brim ?locks?\b/i}],
 protection:[
  {label:'Skid plate',match:/\b(skid|glide|bash)\b/i},
  {label:'Frame guards',match:/\bframe\b/i},
  {label:'Radiator guards',match:/\bradiator\b/i},
  {label:'Disc or link guards',match:/\b(disc|rotor|link|caliper)\b/i}],
 body:[
  {label:'Plastics',match:/\b(plastics?|plastic kit|fenders?|shrouds?|side panels?|number plates?)\b/i},
  {label:'Seat',match:/\bseats?\b/i},
  {label:'Gas tank',match:/\btanks?\b/i}],
};
/** Accessories that name a main part but are not one ("silencer guard", "pipe mounts"), per system. */
const NOT_THE_PART:Partial<Record<PartSystem,RegExp>>={
 exhaust:/\b(guards?|protectors?|armou?r|clamps?|mounts?|repacking|coating|heat|hangers?)\b/i,
 suspension:/\b(guards?|covers?|socks?|protectors?|tools?|wraps?|bumpers?|seal ?heads?|collars?|clevis|eyelets?|reservoir caps?|nitrogen|valves? caps?|lowering|gas valves?|air ports?|repair kits?|bushing kits?|service kits?)\b/i,
 engine:/\b(guards?|protectors?|caps?)\b/i,
 brakes:/\b(guards?|covers?|protectors?)\b/i,
 controls:/\b(covers?|protectors?)\b/i,
 wheels:/\b(stands?|spoon|irons?|covers?|valves?|spacers?)\b/i,
};
/** The type a listed part belongs to, or null for small service parts and accessories. */
export function typeOf(system:PartSystem,name:string):string|null{
 // springs and seals are the part itself for suspension and clutch work
 const probe=['suspension','clutch'].includes(system)?name.replace(/\b(springs?|seal kit|bushings?)\b/gi,''):name;
 const small=(SMALL.test(probe)&&!/\b(system|full|complete)\b/i.test(name))||!!NOT_THE_PART[system]?.test(name);
 for(const t of partTypes[system]??[])if(t.match.test(name)&&(!small||t.keep))return t.label;
 return null;
}
