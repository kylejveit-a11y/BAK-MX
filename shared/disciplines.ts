/** BAK-authored racing-discipline knowledge for gas dirt bikes (pro and amateur).
 *
 * What each type of racing is, what its tracks and races ask of a bike and rider, and how that shifts setup and parts.
 * Directions only: NO bike-specific numbers (clickers, sag, spring rates, pressures, gearing teeth) — those come from
 * verified claims for the exact bike or from the rider's own baseline. Series facts were checked on 2026-10-17; rules
 * change every year, so BAK tells riders to confirm class and equipment rules in the current rulebook.
 *
 * Status: AUTHORED, pending review by Kyle. Edit here; the runtime reads this file.
 */
export type Discipline={
 id:string;names:string[];what:string;terrain:string;race_format:string;who:string;
 setup:{suspension:string;gearing_power:string;tires:string;ergonomics_chassis:string};
 parts_that_pay:string[];parts_that_do_not:string[];amateur_vs_pro:string;rules_note?:string;
};
export const DISCIPLINES_VERSION='mx-disciplines-1';

export const disciplines:Discipline[]=[
 {id:'supercross',names:['supercross','SX','stadium','AMA Supercross','SMX'],
  what:'Man-made tracks inside stadiums: tight turns, rhythm sections, big triples, whoops, sand sections in some rounds. The US pro series is AMA Supercross (January to May), 450SX and 250SX with 250SX split East and West; it feeds the SuperMotocross (SMX) playoffs with Pro Motocross.',
  terrain:'Hard-packed, often slick, built-up dirt; square-edged landings; whoops; very few braking bumps compared with outdoors.',
  race_format:'Short sprint races (heats, LCQ, main event); starts and the first lap matter a lot.',
  who:'Pros, and amateurs at supercross-style local tracks and amateur supercross events.',
  setup:{suspension:'Pro supercross setups are far stiffer than anything else: much stiffer springs and valving to survive big jumps and skim whoops. Hold-up and bottoming resistance matter more than small-bump comfort.',
   gearing_power:'Tight tracks reward strong, controllable bottom-end and roll-on; gearing usually shorter than outdoors. Smooth maps for slick dirt.',
   tires:'Intermediate to hard-terrain tires for hard-pack; sand sections push toward softer compounds.',
   ergonomics_chassis:'Some riders lower forks in the clamps or change offset for turning; holeshot/launch devices are standard.'},
  parts_that_pay:['Suspension revalve and springs built for the rider and supercross specifically','Launch (holeshot) device','Clutch upgrades that survive hard starts and slipping in tight sections','Intermediate/hard-terrain tires'],
  parts_that_do_not:['Woods parts (big tanks, hand guards with wraps, kickstands) add weight','Very soft trail valving'],
  amateur_vs_pro:'Amateurs should NOT copy pro supercross suspension: it is built for pro speeds and jump sizes and feels harsh and deflective at amateur pace. An amateur racing a supercross-style track needs more hold-up than for motocross, not a pro SX setup.'},
 {id:'arenacross',names:['arenacross','AX','indoor','arena'],
  what:'Indoor racing in arenas and expo centers on very short, tight tracks: smaller jumps than supercross but packed close, tight turns, short straights. US pro and amateur classes run in the AMA Arenacross Championship (regional East/West series and playoffs in 2026-27) and many regional series.',
  terrain:'Indoor dirt hauled in: can be soft and loamy early, then hard and slick or rutted; dusty or wet depending on prep; little room to carry speed.',
  race_format:'Short races and heats, packed gates, lots of contact; the start and first turn decide a lot.',
  who:'Pros, amateurs and minis; many families race regional arenacross through winter.',
  setup:{suspension:'Firmer than for outdoor motocross for the jumps and quick landings, but not supercross-stiff; the bike must still turn tight and track on slick dirt.',
   gearing_power:'Short gearing for the tight track; smooth, strong bottom-end; a milder map helps on slick concrete-base dirt. Many riders run one tooth bigger on the rear than outdoors.',
   tires:'Intermediate tires are common; soft-terrain when the dirt is loose and loamy.',
   ergonomics_chassis:'Quick-turning chassis setup; launch device; bar position that lets the rider stay forward in tight turns.'},
  parts_that_pay:['Launch device','Clutch that tolerates heavy slipping','Gearing changes (rear sprocket) more than engine mods','Hand/lever protection for packed-gate contact'],
  parts_that_do_not:['Top-end horsepower parts that make the bike harder to ride on short tracks','Large tanks and woods protection'],
  amateur_vs_pro:'Amateurs gain more from gearing, clutch and suspension for their weight than from engine work.'},
 {id:'motocross',names:['motocross','MX','outdoors','outdoor motocross','Pro Motocross','nationals','Loretta Lynn','amateur nationals'],
  what:'Outdoor natural-terrain tracks with hills, jumps, ruts and braking bumps. The US pro series is AMA Pro Motocross (May to September, 450 and 250 classes, two motos per round) feeding the SMX playoffs. Amateur racing runs from local tracks through area and regional qualifiers to national events such as the AMA Amateur National at Loretta Lynn Ranch.',
  terrain:'Varies by track: hard-pack, loam, clay, sand; gets rough as the day goes on with braking bumps, acceleration chop and deep ruts.',
  race_format:'Pro motos are long (about 30 minutes plus two laps); amateur motos are shorter. Fitness and a bike that stays comfortable late in the moto matter.',
  who:'Everyone: the most common racing type.',
  setup:{suspension:'Balance between comfort over braking bumps and chop and hold-up for jumps; usually softer than supercross. Track type moves it: sand wants more support, hard-pack wants more compliance.',
   gearing_power:'Broad, usable power; gearing chosen per track (taller for fast open tracks, shorter for tight or sandy ones).',
   tires:'Matched to the dirt: soft-terrain for loam/sand, intermediate for mixed, hard-terrain for hard-pack. Sand tires and scoop rear for deep sand.',
   ergonomics_chassis:'Steering damper is popular for high-speed stability; fork height and sag tuned per track.'},
  parts_that_pay:['Springs and valving for rider weight and speed','Tires matched to the track','Steering damper for fast, rough tracks','Gearing per track','Bars and controls that fit the rider'],
  parts_that_do_not:['Heavy woods protection','Pro supercross valving'],
  amateur_vs_pro:'Most amateurs are best served by correct springs for their weight, sag set properly and a mild revalve if needed; engine work comes later.'},
 {id:'mxgp',names:['MXGP','MX2','world championship','FIM motocross','grand prix','GP'],
  what:'The FIM Motocross World Championship. MXGP is the premier class (450 four-strokes); MX2 is the 250 four-stroke class with an upper age limit (riders leave after the season in which they turn 23, under FIM rules). Rounds run worldwide, mostly in Europe, two motos per class per weekend.',
  terrain:'Wide variety and often natural, rough tracks: deep sand (e.g. Lommel-type), hard-pack, mud; usually rougher and more natural than US outdoor tracks.',
  race_format:'Two motos (around 30 minutes plus two laps) per class per Grand Prix; a Saturday qualifying race sets gate picks.',
  who:'Pro riders; amateurs and vets follow the same type of racing in European national championships.',
  setup:{suspension:'Built for long rough motos and often deep sand: support and stability with control in big braking bumps.',
   gearing_power:'Strong mid-range and top for sand and long straights; mapping for traction in sand and mud.',
   tires:'Sand and soft-terrain tires feature heavily at sand rounds; mud tires in wet rounds.',
   ergonomics_chassis:'Stability first: dampers, frame and chassis settings for straight-line stability in sand.'},
  parts_that_pay:['Suspension built for sand and rough tracks','Sand/scoop tires for sand rounds','Steering damper','Cooling and air-filter prep for mud and sand'],
  parts_that_do_not:['Supercross-only setups'],
  amateur_vs_pro:'Riders copying GP sand setups on a hard-pack track will find them too stiff.',
  rules_note:'Class age limits and equipment rules are set yearly by the FIM; check the current rulebook.'},
 {id:'cross_country',names:['GNCC','cross country','XC','hare scramble','hare scrambles','woods','WORCS','National Enduro'],
  what:'Long loops through woods, fields and natural terrain; the US pro series is GNCC (about 3-hour races for pros), with regional hare scrambles and western WORCS. National Enduro is a timed woods format.',
  terrain:'Roots, rocks, logs, mud, hills, tight trees, and some fast grass sections; constantly changing traction.',
  race_format:'Long races (often 1-3 hours), timed laps, pit stops for fuel; endurance and reliability matter.',
  who:'Pros, amateurs, vets and youth; very popular with families.',
  setup:{suspension:'Softer and more compliant than motocross for roots and rocks, while keeping enough hold-up for occasional jumps; slower rebound often helps on rocks and roots.',
   gearing_power:'Smooth, tractable power; slightly shorter gearing for tight trails or a wide-ratio gearbox (XC models); milder maps and traction control help.',
   tires:'Soft-terrain or dedicated off-road tires; many run mousse or tire balls to avoid flats, accepting a different feel.',
   ergonomics_chassis:'Bars set for standing and comfort; a steering damper helps on rocks and roots.'},
  parts_that_pay:['Skid plate, radiator guards and frame guards','Hand guards (wrap-around)','Larger fuel tank','Auto clutch (e.g. Rekluse) or clutch upgrades to avoid stalls','Mousse or flat-proof setup','Kickstand on XC models','Spark arrestor where required'],
  parts_that_do_not:['Pro motocross/supercross valving','Launch devices matter little','Large top-end power mods'],
  amateur_vs_pro:'Amateurs benefit most from protection, a softer setup and tractable power; pros add custom suspension and endurance prep.',
  rules_note:'Many off-road series require a spark arrestor and have sound limits; check the series rules.'},
 {id:'enduro_extreme',names:['enduro','EnduroCross','extreme enduro','hard enduro','ISDE','Erzberg'],
  what:'Enduro: timed sections over long distances with check points. EnduroCross: indoor obstacle racing (logs, rocks, tires, water). Hard/extreme enduro: very technical climbs and rock gardens.',
  terrain:'Rocks, logs, steep climbs, mud, obstacles; very low speed and very high technical demand.',
  race_format:'Timed sections (enduro), short obstacle heats (EnduroCross), long survival races (extreme).',
  who:'Pros and amateurs; often enduro (XC-W, TE, EC, WR, FE) models or two-strokes.',
  setup:{suspension:'Very soft and plush for obstacles; slower rebound; low sag figures sometimes adjusted to help climbs.',
   gearing_power:'Lots of low-end, very smooth; two-strokes and enduro models common; gearing for crawling.',
   tires:'Soft or gummy trials-style rear tires for traction; mousse common.',
   ergonomics_chassis:'Full protection, hand guards, clutch that tolerates abuse.'},
  parts_that_pay:['Full protection (skid plate with linkage guard, radiator guards, hand guards)','Gummy tires and mousse','Auto clutch','Steering damper'],
  parts_that_do_not:['Motocross valving','Launch device'],
  amateur_vs_pro:'Same direction for both: soft and protected.'},
 {id:'desert',names:['desert','hare and hound','Baja','SCORE','NHHA','best in the desert'],
  what:'Long, fast desert races on open terrain.',
  terrain:'Sand washes, rocks, whoops at high speed, silt.',
  race_format:'Long distance with high average speeds.',
  who:'Pros and amateurs mostly in the US West and Mexico.',
  setup:{suspension:'Firm and stable for high-speed whoops and hits; stability first.',gearing_power:'Taller gearing for top speed; bigger tanks.',tires:'Hard-wearing desert tires; mousse.',ergonomics_chassis:'Steering damper is close to essential; navigation and lights for some events.'},
  parts_that_pay:['Steering damper','Large tank','Protection','Taller gearing'],parts_that_do_not:['Tight-track gearing'],
  amateur_vs_pro:'Stability and reliability matter more than power for amateurs.'},
];

/** Amateur racing in the US: how classes are usually organized. Exact class names and limits vary by series. */
export const amateurStructure=[
 'Skill classes: Beginner, Novice (C), Intermediate (B), Pro Sport/Open Pro (A). Riders move up by results; rules set by each series and the AMA.',
 'Age classes: minis (50cc, 65cc, 85cc, Supermini), Schoolboy, College, Vet (30+, 40+ and up), Women.',
 'Bike classes: separate 250 and 450 four-stroke classes, 125 two-stroke classes, and two-stroke classes; displacement equivalence rules for two-strokes vs four-strokes differ by series.',
 'Pathway to the AMA Amateur National (Loretta Lynn Ranch): area qualifiers then regional championships, with limited spots per class.',
 'Arenacross, GNCC and hare scramble series have their own amateur class systems.',
];

/** How to answer race-type build questions. */
export const raceBuildRules=[
 'Ask or use the Garage for: discipline, rider weight in gear, skill/speed (beginner to pro), track/terrain, budget, two- or four-stroke.',
 'Order a build by what changes the ride most per dollar: 1) suspension springs and setup for the rider and discipline, 2) tires for the terrain, 3) gearing, 4) ergonomics (bars, levers), 5) protection required by the discipline, 6) clutch and reliability, 7) engine and exhaust last.',
 'Name parts only by category, or by a specific product when it is in the rider\'s build sheet or the parts research supplied; never invent part numbers or prices.',
 'Explain what to avoid for that discipline (e.g. woods protection on a supercross bike, pro supercross valving for an amateur).',
 'For pro or racing-class rules (equipment, sound, fuel, displacement), tell the rider to check the current series rulebook.',
];

export function disciplinesKnowledge(){
 return {version:DISCIPLINES_VERSION,
  boundary:'BAK-authored general knowledge of racing types and how they shift setup and parts. Directions only; never a bike specification; never cited as verified evidence. Use it when the rider names a racing type, a series, a track type, or asks for a race-specific build, and when the Garage discipline field is set.',
  disciplines,amateur_structure:amateurStructure,race_build_rules:raceBuildRules};
}
