/** Parts in plain words (Kyle, 2026-11-28): what each kind of part is and how the versions differ, written for a rider
 *  who does not know what "sintered" means. General mechanical facts only: no numbers, no claims about one product.
 *  `kinds` are matched against the product's own name; a product that matches none simply shows no label. */
import type {PartSystem} from './installed-parts.ts';
/** `match` reads the version from a product's own name. Leave it out when the name cannot be trusted to say (an exhaust
 *  called "Factory" or "MX/Enduro" says nothing certain): the version is then explained in the guide but never stamped on a product. */
export type PlainKind={name:string;match?:RegExp;plain:string};
export type PlainGuide={what:string;kinds?:PlainKind[]};
const TI:PlainKind={name:'Titanium',match:/\btitanium\b|\bti\b/i,plain:'Lighter than stainless steel and costs more. It makes the same power.'};
const STAINLESS:PlainKind={name:'Stainless steel',match:/\bstainless\b/i,plain:'Tougher and cheaper than titanium, and a little heavier.'};
const CARBON:PlainKind={name:'Carbon',match:/\bcarbon\b/i,plain:'Lightest of the lot and the most easily damaged in a crash.'};
const TRAIL:PlainKind={name:'Trail (quiet, spark arrester)',match:/\bspark arrest\w*\b/i,plain:'Quieter, with a screen that stops sparks. Needed on most public trails. Gives up a little power up top.'};
const RACE:PlainKind={name:'Race (closed course)',plain:'Built for the track: the most power and the most noise, with no spark arrester. Not for public trails.'};
const G:Partial<Record<PartSystem,Record<string,PlainGuide>>>={
 brakes:{
  'Pads':{what:'The blocks that squeeze the brake disc to slow the wheel. They wear down and get replaced. The material is what changes how the brake feels.',kinds:[
   {name:'Semi-metallic',match:/\bsemi[- ]?metal/i,plain:'The middle choice. More bite than organic, softer feel than sintered.'},
   {name:'Sintered (metal)',match:/\bsinter|\bHH\b/i,plain:'The hardest-wearing pad with the strongest bite. Keeps working when wet, muddy or hot. What most racers run. A little harder on the disc.'},
   {name:'Organic',match:/\b(organic|kevlar)\b/i,plain:'A softer pad. Gentle, easy-to-control feel and kind to the disc, but it wears faster and fades sooner in mud or heat.'}]},
  'Rotor':{what:'The steel disc bolted to the wheel that the pads squeeze. Also called a brake disc.',kinds:[
   {name:'Oversized',match:/\b(oversi[zs]e\w*|27\d ?mm|28\d ?mm)\b/i,plain:'Bigger than stock, so it stops harder with less pull on the lever. Needs a matching caliper bracket, which a kit includes.'},
   {name:'Floating',match:/\bfloat/i,plain:'The braking ring can move a hair on its centre, so it stays flat when it gets hot. A race part.'},
   {name:'Wave',match:/\b(wave|contour|flame|blade)\b/i,plain:'A wavy edge that clears mud and saves a little weight. Stops about the same as a round one.'},
   {name:'Solid',match:/\bsolid\b/i,plain:'No holes, so sand and mud wear the pads more slowly. Made for off-road.'}]},
  'Caliper or master cylinder':{what:'The caliper is the clamp that pushes the pads. The master cylinder is the pump at your lever or pedal. Bigger or better ones give a firmer, stronger brake.'},
  'Brake lines':{what:'The hose that carries brake fluid from the lever to the caliper.',kinds:[{name:'Braided steel',match:/\b(braid\w*|steel|stainless)\b/i,plain:'Does not swell under pressure like a rubber hose, so the lever feels firmer and stays the same when hot.'}]}},
 exhaust:{
  'Full exhaust system':{what:'The front pipe and the muffler together. The biggest power change you can bolt on, and the most money.',kinds:[TRAIL,TI,CARBON,STAINLESS,RACE]},
  'Slip-on muffler':{what:'Only the rear muffler, fitted to the stock front pipe. Cheaper and easier than a full system. Mostly changes sound and weight, with a small power change.',kinds:[TRAIL,TI,CARBON,STAINLESS,RACE]},
  'Head pipe':{what:'The front pipe coming off the engine. Its shape and length move where in the revs the power comes in.',kinds:[TI,STAINLESS]},
  'Two-stroke pipe':{what:'The fat front pipe on a two-stroke. Its shape decides whether the bike pulls harder down low or up top.',kinds:[
   {name:'Low-to-mid power',plain:'More pull down low and thicker metal that shrugs off rocks. For woods and tight tracks.'},
   {name:'Mid-to-top power',plain:'More power in the middle and on top. For motocross and open ground.'}]},
  'Insert or spark arrester':{what:'A piece that fits in the end of the muffler. A spark arrester is a screen that most public trails require. A quiet insert cuts noise and takes a little power off the top.'}},
 gearing:{
  'Rear sprocket':{what:'The big sprocket on the back wheel. More teeth gives more snap out of corners and less top speed. Fewer teeth does the opposite.',kinds:[
   {name:'Steel and aluminium together',match:/\b(twin ?ring|dual|bi-?metal|supersprox|stealth|hybrid)\b/i,plain:'Steel teeth on an aluminium centre. Nearly as light as aluminium and lasts like steel.'},
   {name:'Aluminium',match:/\b(alumin\w*|alloy|ultra ?light|7075)\b/i,plain:'Light, and what most racers run. Wears out faster than steel.'},
   {name:'Steel',match:/\bsteel\b/i,plain:'Heavier, and lasts much longer. Good for trail riding and practice.'}]},
  'Front sprocket':{what:'The small sprocket on the engine. One tooth here changes the gearing about as much as three teeth on the rear. Smaller gives more snap, bigger gives more top speed.'},
  'Chain':{what:'Carries the power from the engine to the back wheel. The size number (520 on most full-size bikes) has to match your sprockets.',kinds:[
   {name:'Not sealed (race)',match:/\bnon[- ]?(seal\w*|o-?ring)\b/i,plain:'The lightest and freest-running chain. Wears fast and needs lube after every ride.'},
   {name:'Sealed (O-ring or X-ring)',match:/\b[oxz][- ]?ring\b|\bsealed\b/i,plain:'Rubber rings seal the grease inside each link. Lasts far longer and needs less adjusting. Has a touch more drag.'}]},
  'Chain and sprocket kit':{what:'A chain and both sprockets matched to each other. Changing all three together stops new parts wearing to the shape of old ones.'}},
 controls:{
  'Handlebar':{what:'The bar itself. The bend (height, sweep and width) sets where your hands and elbows sit.',kinds:[
   {name:'Fat bar (1-1/8 inch)',match:/1[- ]?1\/8|\bfat ?bar\b|\boversi[zs]e\w*\b|28\.6|\btwinwall\b|\btapered\b/i,plain:'Thick in the middle and tapered to the grips, usually with no crossbar. Flexes a little to soak up hits. Needs fat-bar clamps.'},
   {name:'Standard (7/8 inch)',match:/7\/8|\b22 ?mm\b/i,plain:'The classic bar with a crossbar. Stiffer feel, costs less, and fits stock 7/8 clamps.'}]},
  'Grips':{what:'The rubber your hands hold. Softer rubber is more comfortable and grips better but wears out sooner.',kinds:[
   {name:'Lock-on',match:/\block[- ]?on\b/i,plain:'Clamps on with a small bolt. No glue, no wire, and easy to swap.'},
   {name:'Half waffle',match:/\bhalf[- ]?waffle\b/i,plain:'Raised ridges under your fingers for grip, smooth under your palm for comfort. The most common motocross grip.'},
   {name:'Full waffle',match:/\bfull[- ]?waffle\b/i,plain:'Ridges all the way round. The most grip, for mud and wet gloves.'},
   {name:'Full diamond',match:/\bdiamond\b/i,plain:'A fine pattern all the way round. Thinner feel, with more of your hand on the bar.'}]},
  'Levers and perches':{what:'The clutch and brake levers and the clamps that hold them to the bar.',kinds:[
   {name:'Folding',match:/\b(fold\w*|pivot\w*|flex\w*|unbreakable|hinge\w*)\b/i,plain:'Bends out of the way in a crash and springs back, where a stock lever snaps.'},
   {name:'Adjustable reach',match:/\b(adjust\w*|reach)\b/i,plain:'Lets you set how far the lever sits from the grip to suit your hand.'}]},
  'Footpegs':{what:'Where your boots stand. Aftermarket pegs are usually wider and sharper than stock, for more grip and a bigger platform.'},
  'Bar mounts or clamps':{what:'What holds the handlebar to the bike. Rubber-mounted ones take out vibration, and different heights or offsets change your riding position.'},
  'Hand guards':{what:'Shields in front of your hands.',kinds:[
   {name:'Wrap-around',match:/\b(wrap\w*|bark ?buster\w*|pro ?bend)\b/i,plain:'A metal bar that wraps to the end of the handlebar. Saves levers and knuckles from trees and crashes. For woods.'},
   {name:'Roost deflector',match:/\b(roost|flag|deflector)\b/i,plain:'A light plastic shield that stops rocks and mud hitting your fingers. For motocross.'}]}},
 clutch:{
  'Auto clutch':{what:'A clutch that lets go by itself when the revs drop, so the bike will not stall when you stop or tip over in gear. You can still use the lever. Popular in the woods and with riders coming back to it.'},
  'Plates':{what:'The stack of discs inside the clutch that grip to pass power. When the clutch slips under power, these are what you replace.'},
  'Basket or hub':{what:'The parts the clutch plates slide in. Stock ones get notched and make the lever feel grabby. Machined aftermarket ones stay smooth for longer.'},
  'Clutch cover':{what:'The outer cover on the clutch side of the engine. Stronger ones stand up to boot wear and crashes.'},
  'Hydraulic clutch':{what:'Uses fluid in place of a cable to work the clutch. Lighter pull, and it adjusts itself as the plates wear.'}},
 intake:{
  'Air filter':{what:'Keeps dirt out of the engine. Clean or change it often: a dirty or torn filter is the fastest way to wear an engine out.',kinds:[
   {name:'Pre-oiled',match:/\bpre[- ]?oiled\b/i,plain:'Comes already oiled, ready to fit straight from the bag.'},
   {name:'Foam',match:/\b(foam|dual[- ]?stage|twin[- ]?stage)\b/i,plain:'Washable foam that you clean and re-oil. The standard for dirt bikes.'}]},
  'Airbox or cover':{what:'The box and lid around the air filter. Vented covers let more air in, which suits dry tracks and lets in more water in the wet.'},
  'Filter cage':{what:'The frame the air filter stretches over. Aftermarket cages remove the backfire screen or open up the airflow.'},
  'Reed valve':{what:'On a two-stroke, the one-way flaps between the carburetor and the engine. Aftermarket ones sharpen throttle response.'}},
 wheels:{
  'Tires':{what:'Pick the tire for the ground you ride on most. The front and rear are different sizes, so check both.',kinds:[
   {name:'Soft ground',match:/\b(soft|sand|mud|scoop|paddle)\b/i,plain:'Tall, widely spaced knobs that dig into sand, loam and mud. They wear quickly on hard ground.'},
   {name:'Hard ground',match:/\bhard\b/i,plain:'Closer, tougher knobs for hard-pack, rocks and blue groove. They pack up in mud.'},
   {name:'Intermediate',match:/\b(intermediate|inter|mid|medium)\b/i,plain:'The all-rounder. Works on most tracks and is the safe pick if the dirt changes.'}]},
  'Mousse or tube':{what:'What goes inside the tire.',kinds:[
   {name:'Mousse (foam insert)',match:/\b(mousse|bib|foam|tubliss)\b/i,plain:'Solid foam in place of a tube, so it cannot go flat. Feels like low pressure, is harder to fit, and wears out.'},
   {name:'Heavy-duty tube',match:/\b(heavy|hd|ultra|thick|extreme)\b/i,plain:'A thicker tube that resists pinch flats. Adds a little weight.'},
   {name:'Standard tube',match:/\bstandard\b/i,plain:'The normal inner tube. Light and cheap, and the easiest to pinch.'}]},
  'Wheels':{what:'Complete wheels or rims and hubs. Riders buy them for stronger parts than stock, or to keep a second set with different tires on.'},
  'Wheel bearings':{what:'The bearings the wheel spins on. Replace them when the wheel has side-to-side play or feels rough when you spin it.'},
  'Rim locks':{what:'A clamp inside the wheel that stops the tire spinning on the rim and tearing the tube’s valve off.'}},
 suspension:{
  'Fork springs':{what:'The springs in the fork that hold the front of the bike up. They have to match your weight. If they do not, no clicker setting will fix it.'},
  'Shock spring':{what:'The spring on the rear shock that holds the back of the bike up. It has to match your weight. If you cannot get the sag numbers right, this is why.'},
  'Valving, bladder or perch kit':{what:'Parts a suspension tuner fits inside the fork or shock to change how it controls bumps and landings.'},
  'Linkage':{what:'The arms that connect the shock to the swingarm. A different one changes the rear ride height and how the shock firms up through its travel.'},
  'Bearings and seals':{what:'The wearing parts of the fork, shock and linkage. Leaking fork seals and loose linkage bearings are the usual reason to be here.'},
  'Fork and shock oil':{what:'The oil the fork and shock work with. It breaks down with use, which is why suspension gets serviced by hours.'},
  'Preload adjuster':{what:'A collar or tool that makes it quick to set shock spring preload, which is how you set sag.'},
  'Clicker adjusters':{what:'Bigger or easier-to-turn knobs for the compression and rebound clickers, so you can change them by hand at the track.'},
  'Fork (cartridge, conversion, kit)':{what:'Kits that replace the insides of the fork, for example swapping an air fork for springs. A big change in how the front feels.'},
  'Shock':{what:'A complete replacement rear shock.'}},
 engine:{
  'Piston or top end':{what:'The piston, rings and the parts around them. They wear with hours and get replaced on a schedule, before they fail.',kinds:[
   {name:'High compression',match:/\b(high[- ]?comp\w*|hi[- ]?comp\w*|\bHC\b|1[3-5](\.\d)?:1)\b/i,plain:'Squeezes the fuel harder for more punch. Can need race fuel and runs hotter.'},
   {name:'Forged',match:/\bforged\b/i,plain:'Stronger than a cast piston, for hard riding and high revs. Needs a proper warm-up.'},
   {name:'Cast',match:/\bcast\b/i,plain:'Made like the stock piston. Quiet and long-lasting for normal riding.'}]},
  'Big bore or cylinder':{what:'A larger cylinder and piston that make the engine bigger. More power everywhere, and it can move you out of your racing class.'},
  'Cams':{what:'The shafts that open the valves. A different cam moves the power lower or higher in the revs.'},
  'Head work':{what:'Machining and parts for the cylinder head and valves. Engine-builder territory.'},
  'Radiators and cooling':{what:'Radiators, hoses, fans and braces that keep the engine cool. Bigger radiators and fans help in slow, hot riding.'},
  'Engine covers':{what:'Stronger outer covers for the engine. They stand up to boot wear and crashes better than stock.'}},
 tuning:{
  'ECU, tuner or map switch':{what:'Changes how much fuel the engine gets and when it sparks. A map switch on the handlebar flips between two settings, such as mellow and aggressive.'},
  'Fuel injection':{what:'Parts for the fuel injection system: throttle bodies, injectors and fuel pumps.'},
  'Carburetor and jetting':{what:'Carburetors and the small brass jets that set the fuel mixture. Jets get changed for altitude, temperature and engine changes.'}},
 chassis:{
  'Holeshot device':{what:'A catch that holds the fork down on the start line so the front stays low and the bike drives forward. It lets go the first time you brake.'},
  'Triple clamps':{what:'The two clamps that hold the fork to the frame. A different offset changes how quickly the bike turns and how stable it is at speed.'},
  'Engine mounts':{what:'The plates that bolt the engine to the frame. Their material and shape change how stiff the bike feels: softer ones calm a harsh ride.'},
  'Steering damper':{what:'A small shock for the steering. It stops the bars whipping side to side at speed or in rocks.'},
  'Chain guide or slider':{what:'The plastic blocks that guide the chain and protect the swingarm. They wear and get replaced.'},
  'Bearings':{what:'Steering, swingarm and linkage bearings. Replace them when there is play or the steering feels notchy.'}},
 protection:{
  'Skid plate':{what:'A plate under the engine that takes rock and log hits so the cases and frame do not.'},
  'Frame guards':{what:'Covers on the frame where your boots rub. They protect the frame and give your boots more grip.'},
  'Radiator guards':{what:'Braces or cages that stop the radiators bending in a crash.'},
  'Disc or link guards':{what:'Guards for the brake discs and the shock linkage, the parts that hit rocks first.'}},
 body:{
  'Plastics':{what:'Fenders, shrouds, number plates and side panels. Sold as single pieces or as a full kit in one colour.'},
  'Seat':{what:'Complete seats and seat covers.',kinds:[
   {name:'Tall',match:/\b(tall|high|\+\d+ ?mm)\b/i,plain:'Raises you up. Easier on the knees for taller riders.'},
   {name:'Low',match:/\b(low|short|-\d+ ?mm)\b/i,plain:'Sits you lower, so shorter riders can reach the ground.'},
   {name:'Gripper',match:/\b(grip\w*|ribbed|pleat\w*|traction)\b/i,plain:'A tacky or ribbed cover that stops you sliding back under power.'}]},
  'Gas tank':{what:'Replacement fuel tanks. Bigger ones are for trail rides and long motos where the stock tank will not last.'}}};
/** What this kind of part is, and how its versions differ. Null when nothing is written for it yet. */
export function partGuide(system:string,type:string):{what:string;kinds:{name:string;plain:string;always?:boolean}[]}|null{
 const g=G[system as PartSystem]?.[type];return g?{what:g.what,kinds:(g.kinds??[]).map(({name,plain,match})=>({name,plain,...(match?{}:{always:true})}))}:null;
}
/** Which version one product is, read from its own name. First match wins; no match means no label. */
export function kindOf(system:string,type:string|undefined,name:string):{name:string;plain:string}|undefined{
 if(!type)return undefined;const k=G[system as PartSystem]?.[type]?.kinds?.find(k=>k.match?.test(name));return k?{name:k.name,plain:k.plain}:undefined;
}
