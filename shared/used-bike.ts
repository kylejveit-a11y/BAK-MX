/** BAK-authored used-bike buying knowledge for gas motocross and off-road bikes.
 *
 * What to inspect, how to judge real hours and condition, VIN and frame/engine number checks, title and stolen-bike
 * practice in the US, red flags, what to price in when negotiating, a test-ride checklist, and per-platform checks that
 * point at the bike's own known_issues research rows.
 *
 * Every general fact carries a `src` id from USED_SOURCES (full list with URLs and dates in docs/research/used-bike/SOURCES.md).
 * `src` never reaches the model: usedBike() strips it. Rider-facing text never names a magazine, tester, retailer, forum
 * or rider. Model-specific weak spots live in docs/research/knowledge (research ids, including the new used-* records);
 * the platform checks here only say what to look at and which rows carry the evidence.
 *
 * Recalls are NOT repeated here. The recall guard (server/answer-guards.ts scopeRecalls, recall_notice) raises the bike's
 * own recall rows once per conversation, scoped to the VIN. This module only tells the model how a used buyer should act
 * on that: ask for proof the recall work was done, and check the VIN with the maker.
 *
 * Status: AUTHORED from public sources on 2026-11-07, pending review by Kyle. Edit here; the runtime reads this file.
 */
import {garageModels} from './garage-models.ts';

export const USED_BIKE_VERSION='mx-used-1';

export type Source={id:string;publisher:string;kind:'regulator'|'state'|'bike_maker'|'insurer_body'|'press'|'retailer'|'lubricant_maker'|'forum'|'shop';url:string;published?:string;accessed:string};
export type InspectArea={id:string;area:string;how:string[];bad_signs:string[];src:string[]};
export type MakeId={make:string;vin_location:string;engine_number:string;decode:string;confidence:'maker document'|'maker general page'|'unconfirmed';src:string[]};
export type PriceItem={item:string;cost:'low'|'medium'|'high'|'very high';due_when:string;src:string[]};
export type PlatformCheck={make:string;models:string[];years:[number,number];checks:{check:string;ids:string[]}[]};

/** Every source behind a general fact here. Not rider-facing and never sent to the model. Kept in step with SOURCES.md. */
export const USED_SOURCES:Source[]=[
 {id:'cfr-565',publisher:'US eCFR, 49 CFR 565.15 (VIN content, model-year table)',kind:'regulator',url:'https://www.ecfr.gov/current/title-49/subtitle-B/chapter-V/part-565/subpart-B/section-565.15',accessed:'2026-11-07'},
 {id:'nhtsa-offroad',publisher:'NHTSA interpretation letter on off-road vehicles and VINs',kind:'regulator',url:'https://www.nhtsa.gov/interpretations/bbrmotorsports1',published:'2003-07-17',accessed:'2026-11-07'},
 {id:'ktm-vin',publisher:'KTM North America VIN filing to NHTSA (vPIC)',kind:'bike_maker',url:'https://vpic.nhtsa.dot.gov/mid/home/displayfile/e221d4fc-fbbd-4590-bdda-e5bc5dbb2792',published:'2025-09-09',accessed:'2026-11-07'},
 {id:'ktm-om-2025',publisher:'KTM 2025 250 SX / 300 SX owner\'s manual 25_3240042en (identification page, held in this repo as p6k-0084)',kind:'bike_maker',url:'https://azwecdnepstoragewebsiteuploads.azureedge.net/25_3240042_en_OM.pdf',published:'2025',accessed:'2026-11-07'},
 {id:'ktm-eps',publisher:'KTM 2025 450 SX-F owner\'s manual 25_3240045_en_OM, service schedule',kind:'bike_maker',url:'https://azwecdnepstoragewebsiteuploads.azureedge.net/25_3240045_en_OM.pdf',published:'2025',accessed:'2026-11-07'},
 {id:'honda-om',publisher:'Honda 2020 CRF450R/RX/RWE owner\'s manual 31MKE630 (held in this repo as p6h-017)',kind:'bike_maker',url:'https://2rom-prd-data.hondamotopub.com/om/AHM/CRF450RX-R-RWE/2020/CRF450R.RX.RWE_31MKE630_0.pdf',published:'2019-04',accessed:'2026-11-07'},
 {id:'honda-om-old',publisher:'Honda CRF450R owner\'s manual, vehicle identification page (older edition)',kind:'bike_maker',url:'https://www.manualslib.com/manual/1201988/Honda-Crf450r.html?page=157',accessed:'2026-11-07'},
 {id:'honda-recall',publisher:'Honda Powersports recall lookup',kind:'bike_maker',url:'https://powersports.honda.com/recalls',accessed:'2026-11-07'},
 {id:'yamaha-osm',publisher:'Yamaha 2016 YZ450F owner\'s service manual, identification page',kind:'bike_maker',url:'https://www.manualslib.com/manual/1161595/Yamaha-Yz450f.html?page=19',published:'2016',accessed:'2026-11-07'},
 {id:'cpsc-22-746',publisher:'CPSC recall notice 22-746 (Yamaha 2022 YZ125)',kind:'regulator',url:'https://www.cpsc.gov/Recalls/2022/Yamaha-Recalls-Competition-Off-Road-Motorcycles-Due-to-Crash-Hazard-Recall-Alert',published:'2022',accessed:'2026-11-07'},
 {id:'kawasaki-vin',publisher:'Kawasaki parts site, VIN finder',kind:'bike_maker',url:'https://kpp.kawasaki.com/Vin-Finder',accessed:'2026-11-07'},
 {id:'triumph-hb',publisher:'Triumph TF 250-C / TF 450-C owner\'s handbook 3850699-US-EN (held in this repo)',kind:'bike_maker',url:'https://api.triumphtechnicalinformation.com/handbooks/documents/697b1c4ec47604be99a352a4/pdf',published:'2025-04',accessed:'2026-11-07'},
 {id:'yamaha-hour',publisher:'Yamaha Motor Canada accessory page, hour meter and tachometer',kind:'bike_maker',url:'https://www.yamaha-motor.ca/en/accessories/motorcycles/handlebars-controls-/hour-meter-and-tachometer/ENG-HR806-12-00',accessed:'2026-11-07'},
 {id:'yamaha-blog',publisher:'Yamaha Motor Canada blog, getting the most out of your YZ (Power Tuner maintenance log)',kind:'bike_maker',url:'https://www.yamaha-motor.ca/en/blog/maintenance-technical/are-you-getting-the-most-out-of-your-yz/Article67',published:'2021-04-20',accessed:'2026-11-07'},
 {id:'yamaha-app',publisher:'Yamaha Power Tuner app store listing',kind:'bike_maker',url:'https://apps.apple.com/us/app/id1235945328',accessed:'2026-11-07'},
 {id:'flhsmv-tl44',publisher:'Florida HSMV procedure TL-44, off-highway vehicle titles',kind:'state',url:'https://www.flhsmv.gov/pdf/proc/tl/tl-44.pdf',accessed:'2026-11-07'},
 {id:'fl-317-0017',publisher:'Florida Statutes 317.0017 (off-highway vehicle offences)',kind:'state',url:'https://m.flsenate.gov/Statutes/317.0017',accessed:'2026-11-07'},
 {id:'nicb',publisher:'NICB VINCheck',kind:'insurer_body',url:'https://nicb.org/vincheck',accessed:'2026-11-07'},
 {id:'cpsc-recalls',publisher:'CPSC recall pages for off-road motorcycles (examples in the bike recall rows)',kind:'regulator',url:'https://www.cpsc.gov/Recalls',accessed:'2026-11-07'},
 {id:'guide-dr2009',publisher:'Off-road magazine used-bike buying guide',kind:'press',url:'https://www.dirtrider.com/misc/141_0504_10_things_when_buying_a_used_dirtbike',published:'2009-02-24',accessed:'2026-11-07'},
 {id:'guide-maciag',publisher:'Off-road parts retailer used-bike buying guide',kind:'retailer',url:'https://www.maciag-offroad.com/how-to/mx-buying-used.html',accessed:'2026-11-07'},
 {id:'guide-amsoil',publisher:'Lubricant maker blog, buying a used dirt bike',kind:'lubricant_maker',url:'https://blog.amsoil.com/what-to-look-for-when-buying-a-used-dirt-bike/',published:'2020-08-21',accessed:'2026-11-07'},
 {id:'guide-dirtlegal',publisher:'Off-road title service blog, dirt bike title status',kind:'shop',url:'https://dirtlegal.squarespace.com/blog/2018/9/4/this-is-why-a-dirt-bikes-title-status-is-important',accessed:'2026-11-07'},
 {id:'leakdown',publisher:'Parts retailer guide, four-stroke leak-down testing',kind:'retailer',url:'https://www.partzilla.com/blog/motorcycle-engine-leak-down-test-how-to',accessed:'2026-11-07'},
 {id:'compression',publisher:'Parts retailer guide, dirt bike compression test',kind:'retailer',url:'https://www.motosport.com/blog/how-to-do-a-compression-test-on-a-dirt-bike-or-atv',accessed:'2026-11-07'},
 {id:'valves-tight',publisher:'Motocross how-to site, tight four-stroke valves',kind:'press',url:'https://motocrosshideout.com/4-stroke-valves-adjusted',published:'2023-08-18',accessed:'2026-11-07'},
 {id:'forum-wear-2017',publisher:'Rider forum thread, wear spots on used bikes',kind:'forum',url:'https://www.vitalmx.com/forums/Moto-Related,20/Wear-spots-to-look-for-in-used-bikes,1322622',published:'2017-07-06',accessed:'2026-11-07'},
 {id:'forum-hours-2024',publisher:'Rider forum thread, judging hours on a used bike',kind:'forum',url:'https://www.vitalmx.com/comment/6261116',published:'2024-03-06',accessed:'2026-11-07'},
 {id:'forum-4t-2023',publisher:'Rider forum thread, checks when buying a used four-stroke',kind:'forum',url:'https://www.vitalmx.com/forums/moto-related/when-buying-used-4-stroke-what-do-you-check',published:'2023-11-28',accessed:'2026-11-07'},
 {id:'forum-app-hours',publisher:'Rider forum thread, engine time in a maker app when buying used',kind:'forum',url:'https://www.vitalmx.com/comment/4459341',published:'2022-10-22',accessed:'2026-11-07'},
];

/** Where to look and what bad looks like, in the order a careful buyer works round the bike. */
export const inspection:InspectArea[]=[
 {id:'first_look',area:'Seller, paperwork and first look',how:['See the bike where it lives; how the owner keeps the truck, garage and tools says a lot about the maintenance.','Ask for receipts and a service log (oil, filter, top end, valves, suspension), and who did the work.','Ask the seller not to start it before you arrive, so you hear a cold start.','Fresh plastics and graphics say nothing about the engine or bearings; judge the parts that wear.'],bad_signs:['No history at all, or a story that changes.','New plastics on a bike whose pegs, sprockets and levers are worn out.','Engine already warm when you arrive.'],src:['guide-dr2009','guide-maciag','forum-4t-2023']},
 {id:'cold_start',area:'Cold start and idle',how:['Start it from cold yourself and let it warm up while you listen.','Two-stroke: a little smoke on a cold start is normal and should clear within seconds.','Four-stroke: blue smoke when revved means oil is burning (rings or valve guides); black smoke means rich running.'],bad_signs:['Many kicks or long cranking from cold, or a four-stroke that only bump-starts: low cranking compression, often tight valves on a four-stroke.','Hard to restart hot.','Smoke that does not clear, hanging or hunting idle.'],src:['guide-amsoil','guide-dr2009','valves-tight']},
 {id:'noises',area:'Engine noises',how:['Listen at idle, on a few blips and as it warms; compare with another bike of the same model if you can.','Top end: a sharp ticking or slapping that changes with throttle (valves, piston slap).','Bottom end: a deep knock or rumble under load (rod or main bearings).','Cam chain: a rattle from the top of the engine on four-strokes, often worse at idle or on deceleration.','Clutch: rattles that change when the lever is pulled in point at the clutch basket and plates.'],bad_signs:['Strong metallic noise once warm.','Knock under load.','Noise that changes with the clutch lever.'],src:['guide-maciag','guide-amsoil']},
 {id:'leaks_fluids',area:'Leaks, oil and coolant',how:['Look under the engine and around the covers, water pump and base gasket for wet oil or coolant.','Check the oil on the dipstick or sight glass: shiny particles mean metal wear (bearing, gears).','Coolant should be full; check its colour.'],bad_signs:['Oil in the coolant (a seal or gasket failing) or milky oil.','Low coolant: the engine may have boiled.','Cracked ignition or clutch covers.'],src:['guide-maciag','guide-amsoil']},
 {id:'compression',area:'Compression and leak-down basics',how:['Compression test: plug out, gauge in, throttle held wide open, kick or crank until the needle peaks. Compare with the maker\'s figure for the exact bike or with earlier readings, not with another model.','On a four-stroke the automatic decompressor affects the reading; the service manual says whether to disable it, and a leak-down test avoids the problem.','Leak-down test: pressurise the cylinder at top dead centre and listen for where the air goes: intake (intake valve), exhaust (exhaust valve), crankcase breather or oil filler (rings), bubbles in the radiator (head gasket).'],bad_signs:['A reading well below the maker\'s range or a big drop since the last test.','Leak-down above about 15% means repair is needed; 5-15% means repair is coming.'],src:['compression','leakdown']},
 {id:'four_stroke_valves',area:'Four-stroke valves and top end',how:['Ask when the valves were last checked and what the clearances were; ask for the shim sizes if they were changed.','Ask when the piston and rings were last replaced and at how many hours.'],bad_signs:['Clearances that keep closing up, needing thinner shims each time: the valves or seats are wearing, which is a head job, not an adjustment.','Hard cold and hot starting with no valve history.','A four-stroke well past the maker\'s piston interval with no top end done.'],src:['valves-tight','guide-dr2009','guide-amsoil','forum-4t-2023']},
 {id:'two_stroke',area:'Two-stroke top end, reeds and seals',how:['Kick it slowly through compression: there should be strong resistance at top dead centre.','If the seller allows, pull the exhaust pipe and look at the piston through the exhaust port.','Ask when the top end and reeds were last done.'],bad_signs:['Little resistance on the kickstarter.','Vertical scoring or smeared shiny aluminium on the piston: a past seizure or dirt ingestion.','Dents in the expansion chamber.'],src:['guide-dr2009','guide-maciag','guide-amsoil']},
 {id:'air_filter',area:'Air filter and airbox',how:['Pull the seat and look at the filter and the clean side of the airbox and intake boot.'],bad_signs:['Dirt on the clean side of the filter or inside the intake boot: dirt has gone into the engine, so expect top-end wear.','A filter that is dry, torn, badly seated or not oiled.'],src:['guide-maciag','forum-wear-2017','forum-4t-2023']},
 {id:'suspension',area:'Fork and shock',how:['Look for oil on the fork tubes and shock body and for scratched or pitted tubes and shaft.','Lock the front brake and push the bars down and forward to feel for fork bushing play (rule out wheel and steering bearings first).','Push down on the rear: it should return in a controlled way, not bounce like a pogo stick.','Check every clicker turns.'],bad_signs:['Leaking seals or oil and dirt build-up at the seals: service due.','Play at the shock mounts: worn bushings or bearings.','Rear that bounces back undamped: the shock needs a service.'],src:['guide-dr2009','guide-amsoil','guide-maciag']},
 {id:'linkage_swingarm',area:'Linkage and swingarm bearings',how:['Bike on a stand, rear wheel lifted slightly: rock the wheel up and down and side to side, and the swingarm side to side.','Sit on the bike and cycle the rear while listening.','Ask when the linkage was last greased; pulling a bottom bolt shows the grease.'],bad_signs:['Play, clunks, notchy or rusty bearings: a bearing job is due.'],src:['guide-dr2009','guide-amsoil','forum-wear-2017']},
 {id:'steering_head',area:'Steering head',how:['Front wheel off the ground: turn the bars lock to lock and feel for notches; grab the lower fork legs and push and pull for play.','Look at the steering stops, triple clamps and frame tabs.'],bad_signs:['Notchy or loose steering.','Damaged steering stops or clamps: a big crash.'],src:['guide-dr2009','guide-maciag']},
 {id:'wheels',area:'Wheels, bearings, spokes and rims',how:['Spin each wheel and listen for grinding; rock it for side play.','Check every spoke is tight and the rims run true without dents or cracks.'],bad_signs:['Any wheel-bearing play.','Loose spokes or a rim out of true.','Cracked or checked tyres.'],src:['guide-dr2009','guide-maciag','guide-amsoil']},
 {id:'chain_sprockets',area:'Chain, sprockets, guides and sliders',how:['Look at the sprocket teeth, the chain slack and the chain slider, guide and rollers.','Lift the chain off the back of the rear sprocket: a worn chain pulls well away.','Check for side wear on the chain and for play in the countershaft.'],bad_signs:['Hooked, thin or sharp sprocket teeth: a chain and sprocket kit is due.','Side wear: misalignment, a bent guide, worn wheel bearings or a bent swingarm.'],src:['guide-dr2009','guide-maciag']},
 {id:'brakes',area:'Brakes',how:['Squeeze the lever and press the pedal: both should be firm with a steady pressure point.','Look at pad thickness, disc wear and caliper play.'],bad_signs:['Spongy lever, worn pads or discs at their limit, a sloppy rear caliper.'],src:['guide-dr2009','guide-maciag']},
 {id:'frame',area:'Frame, subframe and radiators',how:['Look over the frame rails, around the steering head and under the engine for cracks, dents, welds and fresh paint.','Check the subframe lines up with the rear wheel; take the seat off to see it.','Look at the radiators for bends, crush damage and repaired leaks.'],bad_signs:['Cracks, weld repairs or bends.','A subframe that does not line up: a crash.','Bent or epoxied radiators.'],src:['guide-dr2009','guide-maciag']},
 {id:'clutch_gearbox',area:'Clutch and gearbox',how:['Engage first gear cold with the clutch pulled in.','Shift through every gear on the test ride, up and down, and find neutral.','Test for slip in a high gear with hard throttle.'],bad_signs:['The bike lurches forward with the clutch in: drag, often a worn basket.','Jumping out of gear or false neutrals.','Clutch slip, or a notchy engagement.'],src:['guide-maciag','guide-dr2009','guide-amsoil']},
];

/** Hours: what meters can and cannot tell you, and how to judge use when there is no reliable meter. */
export const hours={
 meters:[
  'Most motocross bikes have no hour meter from the factory; many owners fit one later, so its total may not start at zero hours. Some maker accessory meters cannot be reset, but a meter can always be swapped or fitted late.',
  'Some fuel-injected bikes keep a running-time record in the ECU that a maker app or a dealer tool can read: Yamaha\'s Power Tuner app shows data recorded by the bike and keeps a maintenance log of running time. Owners disagree on whether app or ECU hours can be reset, and a swapped or aftermarket ECU breaks the record. Treat it as one clue, not proof.',
 ],
 estimate:[
  'Footpeg teeth, the shift lever and brake pedal tips: rounded or worn.',
  'Boot wear on the frame rails, clutch and ignition covers, and where the factory finish has rubbed through.',
  'Sprockets and chain: original drivetrain on a bike sold as low-hours is a good sign; hooked teeth are not.',
  'Original wear parts still fitted (brake pads, tyres, grips, plastics) versus replaced.',
  'Play in the linkage, swingarm, steering and wheel bearings.',
  'Brake master cylinder, discs and pads.',
 ],
 caveats:[
  'Cover and frame scuffs appear after a few rides on a new bike and can be cleaned or covered, so no single clue settles it; judge the whole bike.',
  'A well-maintained high-hour bike can be a better buy than a neglected low-hour one; the service record matters more than the number.',
  'Hard racing hours (supercross, hare scrambles, desert, hard enduro) wear a bike faster than trail hours.',
 ],
 src:['guide-maciag','guide-amsoil','yamaha-hour','yamaha-blog','yamaha-app','forum-app-hours','forum-hours-2024','forum-wear-2017','forum-4t-2023'],
};

/** VIN and frame/engine numbers. The model-year letter table is the US federal one; makers use it on off-road bikes too. */
export const vin={
 format:[
  '17 characters, never I, O or Q. Position 10 is the model year, 11 the plant, 9 a check digit, 1-3 the maker code.',
  'US road-vehicle VIN rules do not cover off-road bikes; makers still use the 17-character format on US competition bikes and states may require a VIN for titling. Recall notices sometimes quote only part of a VIN.',
 ],
 year_codes:{F:2015,G:2016,H:2017,J:2018,K:2019,L:2020,M:2021,N:2022,P:2023,R:2024,S:2025,T:2026,V:2027,W:2028},
 by_make:[
  {make:'KTM, Husqvarna, GasGas',vin_location:'Stamped on the right side of the steering head; a type label is on the frame.',engine_number:'Embossed on the left side of the engine above the engine sprocket.',decode:'Starts VBK (KTM AG, all three brands). 4-5 model code, 7 engine type (2 two-stroke, 4 four-stroke), 8 usage (3 = closed-course competition), 10 year, 11 plant (M = Mattighofen), 12 engine size. A 7th character that does not match the engine type is a red flag.',confidence:'maker document',src:['ktm-vin','ktm-om-2025']},
  {make:'Honda',vin_location:'Stamped on the right side of the steering head.',engine_number:'On the crankcase: Honda\'s 2020 CRF450R manual says the right side, an older edition says the left, so use the manual for the exact year.',decode:'US Honda VINs start JH2. Honda\'s recall lookup (powersports.honda.com/recalls) takes the VIN.',confidence:'maker document',src:['honda-om','honda-om-old','honda-recall']},
  {make:'Yamaha',vin_location:'Stamped on the frame steering head; the model number label is on both sides of the bike.',engine_number:'Stamped on the raised part of the right side of the engine (older YZ450F manual).',decode:'US Yamaha VINs start JYA.',confidence:'maker document',src:['cpsc-22-746','yamaha-osm']},
  {make:'Kawasaki',vin_location:'Stamped on the steering head, below the handlebars.',engine_number:'Not confirmed from a Kawasaki document; check the owner\'s manual.',decode:'US Kawasaki VINs start JKA or JKB.',confidence:'maker general page',src:['kawasaki-vin']},
  {make:'Suzuki',vin_location:'Not confirmed from a Suzuki document in BAK\'s sources; the owner\'s service manual has a serial number location page.',engine_number:'Not confirmed; see the owner\'s service manual.',decode:'US Suzuki VINs start JS1.',confidence:'unconfirmed',src:[]},
  {make:'Triumph',vin_location:'Stamped into the steering head and repeated on a label on the left of the frame.',engine_number:'Stamped on the crankcase above the clutch cover.',decode:'Triumph VINs start SMT. Triumph splits some specs by VIN, so match the VIN to the right handbook.',confidence:'maker document',src:['triumph-hb']},
 ] as MakeId[],
 engine_number:[
  'The engine number is its own serial: it will not match the VIN digits, so do not expect it to.',
  'Read both numbers off the bike yourself and write both on the bill of sale.',
  'A ground-off, re-stamped, uneven or painted-over VIN or engine number is a stop sign: in Florida, knowingly possessing or selling an off-highway vehicle with an altered VIN or motor number is a felony and the bike can be seized.',
  'BAK has no tables that decode engine numbers to a model. To check an engine was not swapped from another model or year, ask a dealer for that maker to look the engine number up.',
 ],
 src:['honda-om','yamaha-osm','ktm-om-2025','fl-317-0017','cfr-565','nhtsa-offroad'],
};

/** Title, bill of sale and stolen-bike practice in the US. State rules vary; Florida is given as a worked example. */
export const paperwork={
 general:[
  'Off-road bikes often have no title. Some states title them, many do not; ask the state DMV for its rules before you pay.',
  'Match the VIN on the frame with the title or bill of sale, character by character, and check the seller\'s ID matches the name on the paperwork.',
  'Do not accept a title that is already signed by someone else (an open title), and ask about any lien.',
  'Get a dated bill of sale with year, make, model, VIN, engine number, price and both names and signatures.',
  'An untitled bike is worth less than a titled one where the state titles them.',
  'A new bike\'s proof of ownership is the maker\'s certificate of origin (MCO, also called MSO); a seller who still has it is a good sign on a nearly new bike.',
 ],
 florida:[
  'Florida titles off-highway vehicles bought on or after 1 July 2002; there is no plate, only a title validation decal.',
  'A used bike bought in Florida needs the seller\'s Florida title, or a bill of sale with year, make and VIN only if the seller owned it before the titling date and was never required to title it. For a modern bike, expect a title in the seller\'s name.',
  'From a state that does not title off-road bikes: a dealer bill of sale, or the seller\'s registration plus a bill of sale.',
 ],
 stolen_checks:[
  'Run the VIN through NICB VINCheck: free, five searches a day, but it only knows theft and salvage claims from participating insurers, so a clean result is not proof.',
  'Ask the local police or sheriff\'s non-emergency line whether the VIN is reported stolen.',
  'Ask the maker\'s dealer to run the VIN for open recalls, and ask the seller for dealer paperwork showing recall work was done.',
 ],
 src:['flhsmv-tl44','fl-317-0017','nicb','guide-dirtlegal','guide-maciag','honda-recall','cpsc-recalls'],
};

/** Red flags. Each one is a reason to slow down or walk away. */
export const redFlags:{flag:string;why:string;src:string[]}[]=[
 {flag:'VIN or engine number ground, re-stamped, painted over, covered or missing.',why:'The usual sign of a stolen bike or stolen engine, and possessing one is a crime in some states.',src:['fl-317-0017','guide-maciag']},
 {flag:'VIN on the frame does not match the paperwork, or the seller\'s name is not on it.',why:'You may not be able to title or register it, and it may not be theirs to sell.',src:['guide-dirtlegal']},
 {flag:'No title in a state that titles off-road bikes, or an open title signed by someone else.',why:'You may be buying a title problem or a stolen bike.',src:['flhsmv-tl44','guide-dirtlegal']},
 {flag:'Price far below similar bikes, pressure to decide fast, cash only and a meeting place away from the seller\'s home.',why:'Classic signs of a bike the seller cannot explain.',src:['guide-maciag','guide-dirtlegal']},
 {flag:'Engine warmed up before you arrived, or the seller will not let you start it cold.',why:'Hides hard starting, cold noises and smoke.',src:['forum-4t-2023','guide-maciag']},
 {flag:'Dirt on the clean side of the air filter.',why:'Dirt has gone into the engine.',src:['guide-maciag']},
 {flag:'Fresh frame paint or welds near the steering head or rails.',why:'Hides crash damage or a changed VIN area.',src:['guide-maciag','guide-dr2009']},
 {flag:'An open recall with no dealer proof that the work was done.',why:'Some recalls say stop riding until repaired.',src:['cpsc-recalls']},
];

/** What to price in. Relative costs only: BAK has no current dated price list. Use the rider's local prices. */
export const negotiation={
 rules:[
  'Agree what the bike needs before you talk price: list each worn item you found and ask the seller to account for it.',
  'Price the work due soon, not just what is broken: a top end at or past the maker\'s interval, a chain kit with hooked teeth, tyres, bearings with play, suspension service with leaking seals.',
  'Relative order, cheapest first, from one dated buying guide\'s price examples: wheel or linkage bearings and a chain and sprocket kit cost less than a shock rebuild, a clutch or a top end, and gearbox or bottom-end work costs the most. Four-stroke top ends cost more than two-stroke ones, and four-strokes need them more often.',
  'Service records with receipts are worth paying for; a story without receipts is not.',
  'Never quote a dollar figure as BAK\'s; if the rider wants numbers, they come from local parts and labour quotes.',
 ],
 items:[
  {item:'Grips, levers, air filter, oil and filter',cost:'low',due_when:'Worn, bent or overdue.',src:['guide-maciag']},
  {item:'Chain and both sprockets',cost:'medium',due_when:'Hooked or thin teeth, chain pulls away from the rear sprocket, or side wear.',src:['guide-dr2009','guide-maciag']},
  {item:'Tyres',cost:'medium',due_when:'Rounded or missing knobs, cracking.',src:['guide-amsoil','guide-maciag']},
  {item:'Brake pads and discs',cost:'medium',due_when:'Pads thin, discs at the wear limit, spongy lever.',src:['guide-dr2009','guide-maciag']},
  {item:'Wheel, steering, swingarm and linkage bearings',cost:'medium',due_when:'Any play, notches or dry, rusty bearings.',src:['guide-dr2009','guide-amsoil']},
  {item:'Fork and shock service (seals, bushings, oil)',cost:'high',due_when:'Leaking seals, undamped rebound, play at the mounts, or no service record.',src:['guide-dr2009','guide-amsoil']},
  {item:'Clutch plates and springs',cost:'medium',due_when:'Slip under load or drag with the lever in.',src:['guide-dr2009','guide-amsoil']},
  {item:'Two-stroke top end',cost:'high',due_when:'Weak compression feel on the kickstarter, scored piston, or no record near the maker\'s interval.',src:['guide-dr2009']},
  {item:'Four-stroke top end with valves',cost:'very high',due_when:'Hard starting, valves that keep closing up, low compression or leak-down, blue smoke, or past the maker\'s piston interval with no record.',src:['guide-dr2009','guide-amsoil','valves-tight']},
  {item:'Clutch basket, gearbox or bottom end',cost:'very high',due_when:'Knocking under load, jumping out of gear, metal on the dipstick, or a notched basket.',src:['guide-dr2009','guide-amsoil']},
 ] as PriceItem[],
};

/** Test ride, done last and only after the static checks, in full gear. */
export const testRide:{step:string;src:string[]}[]=[
 {step:'Do the static checks first; ride last, in full gear, with the seller\'s agreement.',src:['guide-maciag']},
 {step:'Cold start, then first gear with the clutch pulled in: no lurch.',src:['guide-maciag']},
 {step:'Every gear up and down under load, and find neutral; note any false neutral or jumping out of gear.',src:['guide-dr2009','guide-amsoil']},
 {step:'Clutch slip test in a high gear with hard throttle; smooth engagement from a stop.',src:['guide-dr2009']},
 {step:'Even throttle response with no stutter, bog or hesitation through the range.',src:['guide-maciag','guide-amsoil']},
 {step:'Brakes with a firm, steady pressure point; the bike runs straight without pulling to one side; no odd vibration.',src:['guide-maciag']},
 {step:'Suspension: no clunks over bumps; rear returns under control.',src:['guide-dr2009']},
 {step:'After the ride: look again for fresh leaks, smoke and coolant pushed out of the overflow, then restart it hot.',src:['guide-maciag','valves-tight']},
];

/** Model-specific things to look at on a used bike, with the research rows (bike_knowledge ids) that carry the evidence.
 *  Built from the known_issues records in docs/research/knowledge. Recall ids are listed so the model knows to ask for proof
 *  of the work; the recall text itself comes from the recall guard, not from here. */
export const platformChecks:PlatformCheck[]=[
 {make:'Yamaha',models:['YZ450F'],years:[2018,2022],checks:[{check:'Air filter seal and dirt past the backfire screen.',ids:['ywr-041']},{check:'Hot restart and idle heat.',ids:['ywr-042']}]},
 {make:'Yamaha',models:['YZ450F'],years:[2023,2025],checks:[{check:'Dirt in the airbox past the backfire screen.',ids:['yz45-068']},{check:'Clutch fade or slip under load.',ids:['yz45-069']},{check:'Map/kill button and footpeg brackets.',ids:['yz45-070']}]},
 {make:'Yamaha',models:['YZ250F'],years:[2019,2024],checks:[{check:'Cam chain history and rattle.',ids:['yz25-048']},{check:'Clutch heat and lever free play.',ids:['yz25-050']},{check:'Hard starting and idle on 2019-2021.',ids:['jg8-018']},{check:'Battery, clutch and chain wear on 2019-2020.',ids:['jg8-005']}]},
 {make:'Yamaha',models:['YZ250'],years:[2020,2026],checks:[{check:'Power valve working: primary gear bolt, linkage and governor pin.',ids:['y2t8-006','y2t8-007']},{check:'Crank seal leaks.',ids:['y2t8-009']},{check:'Water in the airbox.',ids:['yz25-074']}]},
 {make:'Yamaha',models:['YZ125','YZ125X'],years:[2020,2026],checks:[{check:'Power valve pin.',ids:['y2t8-008']},{check:'Rich running and plug fouling on 2022-2025.',ids:['yz25-077']},{check:'2022 YZ125 shift recall done.',ids:['ki6-013']}]},
 {make:'Honda',models:['CRF450R','CRF450RX'],years:[2021,2026],checks:[{check:'Boiling and coolant loss.',ids:['h45-103']},{check:'Air filter seal on 2021-2024.',ids:['h45-105']},{check:'Exhaust flange studs on 2023-2024.',ids:['h45-104']},{check:'Countershaft sprocket loose on its splines on 2022-2024.',ids:['cd6-103']},{check:'Clutch wear on 2021-2022.',ids:['h45-107']},{check:'2025-2026 handlebar clamp recall done.',ids:['h25-099','ki6-011']}]},
 {make:'Honda',models:['CRF250R','CRF250RX'],years:[2020,2026],checks:[{check:'Overheating and the radiator cap.',ids:['h25-100','jg8-044']},{check:'Air filter clogging on 2022-2024.',ids:['h25-101']},{check:'Clutch and chain wear.',ids:['h25-102']},{check:'2020-2021 issues.',ids:['h25-105']},{check:'2025-2026 handlebar clamp recall done.',ids:['h25-099']}]},
 {make:'Kawasaki',models:['KX450','KX450X'],years:[2021,2026],checks:[{check:'Heat and coolant loss.',ids:['kx-110']},{check:'Right side-case oil leak on 2024-2025.',ids:['kx-106']},{check:'Ignition cover damage on 2024.',ids:['kx-107']},{check:'Clutch plates on 2024+.',ids:['kx-109','cd6-101']},{check:'Rear brake and small parts on 2021-2023.',ids:['kx-111']},{check:'2022 fuel pump and 2025 crankshaft gear recalls done.',ids:['kx-105','kx-104']}]},
 {make:'Kawasaki',models:['KX250','KX250X'],years:[2021,2026],checks:[{check:'Chain roller and guide wear on 2021-2023.',ids:['jg8-070']},{check:'Small parts.',ids:['kx-112']},{check:'2022 fuel pump recall done.',ids:['kx-105']}]},
 {make:'Suzuki',models:['RM-Z450'],years:[2020,2025],checks:[{check:'Missed shifts and false neutrals under load.',ids:['used-rmz-001']}]},
 {make:'KTM',models:['250 SX-F','350 SX-F','450 SX-F','FC 250','FC 350','FC 450','MC 250F','MC 350F','MC 450F'],years:[2023,2026],checks:[{check:'Chain wearing into the swingarm and the chain buffer.',ids:['cd6-064','k45-104','k25-081','k35-093']},{check:'Linkage needle bearings.',ids:['k45-101','k25-078','k35-092']},{check:'Spoke tension.',ids:['k45-103','k25-079','k35-096']},{check:'Clutch cutting out: pinched crankcase breather hose.',ids:['ki6-015']},{check:'Rear brake pedal.',ids:['k45-105','k25-082']},{check:'Plastic radiator cap.',ids:['k25-080','k35-097']},{check:'350: swingarm pivot nut.',ids:['k35-100']}]},
 {make:'KTM',models:['250 SX-F','350 SX-F','450 SX-F','FC 250','FC 350','FC 450','MC 250F','MC 450F'],years:[2020,2022],checks:[{check:'Loose hardware.',ids:['kg7-094']},{check:'Finding neutral and the shift locker.',ids:['kg7-095','ki6-016']},{check:'Husqvarna composite subframe cracks.',ids:['kg7-097','used-hq-001']}]},
 {make:'Husqvarna',models:['FC 250','FC 350','FC 450','TC 125','TC 250','FX 350','FX 450','TX 300','FE 450','TE 150','TE 250','TE 300'],years:[2020,2022],checks:[{check:'Composite subframe cracks and airbox seam gaps.',ids:['used-hq-001','used-hq-002','kg7-097']}]},
 {make:'KTM',models:['125 SX','150 SX','250 SX','300 SX','TC 125','TC 250','MC 125','MC 250'],years:[2023,2025],checks:[{check:'TBI detonation, cut-outs and plug fouling.',ids:['k2t-074','k2t-075','k2t-076']},{check:'2022 125/150 connecting-rod recall done (2022 bikes).',ids:['ki6-006']}]},
 {make:'KTM',models:['150 XC-W','250 XC-W','300 XC-W','TE 150','TE 250','TE 300','EX 300'],years:[2023,2026],checks:[{check:'Overheating, TPS calibration and water in the TPS connector.',ids:['ko2-089','ko2-093','ko2-094']},{check:'Fuel pump cut-outs.',ids:['ko2-095']}]},
 {make:'GasGas',models:['MC 125','MC 250','MC 250F','MC 350F','MC 450F','EX 250','EX 250F','EX 300','EX 350F','EX 450F','EC 250','EC 300','EC 450F'],years:[2021,2025],checks:[{check:'Front and rear brake caliper recalls done.',ids:['ki6-001','ki6-005']}]},
 {make:'Triumph',models:['TF 250-X'],years:[2024,2025],checks:[{check:'Right switch cube recall done.',ids:['tf-077']},{check:'Clutch.',ids:['tg-019']},{check:'Stiff, notchy gearbox.',ids:['tf-080','tk8-009']},{check:'Jumped timing after a tip-over.',ids:['tk8-010']}]},
 {make:'Triumph',models:['TF 450-RC Edition','TF 450-X','TF 450-C','TF 450-E'],years:[2025,2026],checks:[{check:'Cylinder head recall done.',ids:['tg-001']},{check:'False neutrals and gearbox.',ids:['tk8-006','tf-080']},{check:'Fuelling and flame-out.',ids:['tf-081']}]},
];

// ---------- Gating ----------
// Buying or selling a bike (not a part). Strong phrases count on their own; plain "buy" needs a bike in the sentence.
const BUY_STRONG=/\b(for sale|seller|selling (it|my|the|a|this)|sell(ing)? (it|my|the|this) (bike|\w+ ?\d{2,3})|listing|marketplace|craigslist|pre-?owned|second[- ]?hand|new[- ]to[- ]me|used (bike|one|dirt ?bike|mx bike|\d{2,4}|yz|wr|crf|kx|rm-?z|ktm|husky|husqvarna|gas ?gas|tf)|looking at (a|an|this|one) (used |\d{4} )?(bike|yz|wr|crf|kx|rm-?z|ktm|husky|husqvarna|gas ?gas|tf|\d{2,3})|go(ing)? (to )?(look|see) at (a|an|the|this) (bike|yz|wr|crf|kx|rm-?z|ktm|husky|gas ?gas|tf|\d{2,4})|pre-?purchase|what('s| is) (it|this|that|my [\w -]{1,24}?) worth|resale (value|price)|used (two|four|2|4)[- ]?strokes?|(fair|good|decent) (price|offer)|asking price|lowball\w*|haggl\w*|negotiat\w*|what (should|would|do) (i|you) (offer|pay)|how much (should i|to|would you) (pay|offer)|overpa(y|ying|id))\b/i;
const BUY_WORD=/\b(buy(ing)?|bought|purchas(e|ing|ed))\b/i;
const BIKE_WORD=/\b(bike|dirt ?bike|motocross bike|mx bike|enduro bike|it|one|this one|that one)\b|\b(yz|wr|crf|kx|rm-?z|ktm|husky|husqvarna|gas ?gas|tf|sx-?f|xc-?f|fc|tc|mc)\s?-?\d{2,3}|\b(19|20)\d{2}\b/i;
const PART_WORD=/\b(chain|sprockets?|tires?|tyres?|grips?|pipe|exhaust|silencer|muffler|filters?|oil|parts?|plastics?|graphics|springs?|pistons?|kit|levers?|bars?|handlebars?|seat|wheels?|rims?|boots|helmet|gear|goggles|jersey|pants|stand|ramp|trailer|battery|clutch|brake pads?|mousse|tubes?)\b/i;
const PRICE=/\b(negotiat\w*|lowball\w*|offer|haggl\w*|asking( price)?|worth|fair price|price it|price in|overpa(y|ying|id)|good deal|bad deal|deal)\b/i;
const VIN=/\b(vins?|frame (number|no\.?|serial)|chassis number|serial numbers?|engine (number|serial)|re-?stamped|ground off|numbers? match\w*|matching numbers)\b/i;
const PAPER=/\b(titles?|titled|mso|mco|certificate of origin|bill of sale|registration|registered|stolen|theft|lien)\b/i;
const PAPER_STRONG=/\b(stolen|theft|mso|mco|certificate of origin|bill of sale|no title|open title|clean title|title in hand|lost title|without a title)\b/i;
const HOURS_STRONG=/\b((real|actual|true|claimed|fake|honest|original) hours|hour ?meter|hour counter|rolled back|reset (the )?(hours|meter)|(judge|tell|estimate|check|know|verify|guess|prove) (the |its |real |actual )*hours)\b/i;
const HOURS_WEAK=/\b(hours on (it|the bike|this|that)|low[- ]hours?|high[- ]hours?|how many hours)\b/i;
const RED=/\b(red flags?|scam\w*|sketchy|warning signs|too good to be true)\b/i;
const RIDE=/\b(test[- ]?ride|test it|ride it before)\b/i;
const INSPECT=/\b(inspect\w*|what (to|should i|do i) (look|check)( for| at)?|what to check|check(ing)? (it|the bike) over|pre-?purchase|things to check|look out for)\b/i;
const SETUP_ONLY=/\b(clickers?|sag|rebound|compression damping|jetting|map switch|tire pressure|tyre pressure)\b/i;
const FOLLOW_UP=/^(and|what about|how about|ok|okay|so|also|what if|then|is that|does that|would|should i|can i)\b/i;
/** Short follow-ups that stay on a used-bike conversation: the things a buyer checks or asks about. */
const FOLLOW_TOPIC=/\b(vins?|titles?|bill of sale|stolen|hours|price|offer|worth|linkage|bearings?|steering|fork seals?|seals|shock|valves?|top end|piston|air filter|filter|chain|sprockets?|smoke|smoking|compression|leak[- ]?down|frame|subframe|radiators?|clutch|gearbox|false neutral|walk away|deal|test ride)\b/i;

/** Buying or selling a whole bike, as opposed to a part. */
export function aboutBuyingBike(text:string):boolean{
 if(BUY_STRONG.test(text))return true;
 return BUY_WORD.test(text)&&BIKE_WORD.test(text)&&!(PART_WORD.test(text)&&!/\b(used|bike)\b/i.test(text));
}
export type UsedTopic='inspect'|'hours'|'vin'|'paperwork'|'red_flags'|'negotiate'|'test_ride';
function topicsOf(text:string):Set<UsedTopic>{
 const t=new Set<UsedTopic>(),buy=aboutBuyingBike(text),vin=VIN.test(text);
 if(vin)t.add('vin');
 if(PAPER_STRONG.test(text)||(PAPER.test(text)&&(buy||vin)))t.add('paperwork');
 if(HOURS_STRONG.test(text)||(HOURS_WEAK.test(text)&&buy))t.add('hours');
 if(RED.test(text)&&(buy||t.size))t.add('red_flags');
 if(RIDE.test(text)&&(buy||t.size||/\bused\b/i.test(text)))t.add('test_ride');
 if(PRICE.test(text)&&buy)t.add('negotiate');
 if(buy&&(INSPECT.test(text)||![...t].some(x=>x!=='vin')))t.add('inspect');
 return t;
}
/** True when a message is about buying, selling or inspecting a used bike, VINs, hours, papers or red flags. */
export function isUsedBikeQuestion(text:string):boolean{
 if(!text?.trim())return false;
 if(SETUP_ONLY.test(text)&&!aboutBuyingBike(text))return false;
 return topicsOf(text).size>0;
}

// ---------- Bike detection ----------
const squash=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
// Names riders use that are not roster model names.
const ALIASES:[RegExp,string,string][]=[[/\bcrf ?450(?!r)\b/i,'Honda','CRF450R'],[/\bcrf ?250(?!r)\b/i,'Honda','CRF250R'],[/\byz ?450(?!f)\b/i,'Yamaha','YZ450F'],[/\bkx ?450 ?f\b/i,'Kawasaki','KX450'],[/\bkx ?250 ?f\b/i,'Kawasaki','KX250'],[/\brmz ?(450|250)\b/i,'Suzuki','RM-Z$1']];
const ROSTER=Object.entries(garageModels).flatMap(([make,models])=>models.map(model=>({make,model,key:squash(model)}))).sort((a,b)=>b.key.length-a.key.length);
/** Bikes named in the text: make and model from the Garage roster, plus a model year (2015-2029, or '18 style) if given. */
export function bikesIn(text:string):{make:string;model:string;year:number|null}[]{
 const flat=squash(text),found:{make:string;model:string;key:string}[]=[];
 const yr=text.match(/\b20(1[5-9]|2\d)\b|'(1[5-9]|2\d)\b/);
 const year=yr?2000+Number(yr[1]??yr[2]):null;
 // Longest names first, so "250 SX-F" wins over "250 SX" and "YZ250F" over "YZ250"; a name inside one already found is skipped.
 for(const m of ROSTER){
  if(m.key.length<4||!flat.includes(m.key)||found.some(f=>f.key.includes(m.key)))continue;
  // A bare-number KTM name ("250 SX") inside a longer token such as "1250sx" is not a match.
  const i=flat.indexOf(m.key);if(/^\d/.test(m.key)&&i>0&&/\d/.test(flat[i-1]))continue;
  found.push(m);
 }
 for(const [re,make,model] of ALIASES){const r=text.match(re);if(!r)continue;const name=model.replace('$1',r[1]??'');if(!found.some(f=>f.model===name))found.push({make,model:name,key:squash(name)});}
 return found.slice(0,3).map(({make,model})=>({make,model,year}));
}
function checksFor(b:{make:string;model:string;year:number|null}){
 const short=(m:string)=>m.replace(/^(KTM|Husqvarna|GasGas) /,'');
 return platformChecks.filter(p=>p.models.map(short).includes(b.model)&&(b.year===null||b.year>=p.years[0]&&b.year<=p.years[1]))
  .map(p=>({bike:`${b.make} ${b.model}`,years:`${p.years[0]}-${p.years[1]}`,checks:p.checks.map(c=>`${c.check} [${c.ids.join(', ')}]`)}));
}

// ---------- Output ----------
const strip=<T,>(x:T):T=>JSON.parse(JSON.stringify(x,(k,v)=>k==='src'?undefined:v));
/** Rough budget: about 2.5k tokens of JSON, at roughly four characters a token. */
export const USED_BIKE_MAX_CHARS=9800;

export type UsedSection={version:string;boundary:string;topics:UsedTopic[];from_history?:true;[k:string]:unknown};
/** A compact used-bike section for Ask BAK, or null when the conversation is not about buying, selling or inspecting a
 *  used bike, VINs, hours, papers or red flags. history: earlier rider messages, oldest first. */
export function usedBike(message:string,history?:string[]):UsedSection|null{
 const msg=message??'';
 let text=msg,topics=isUsedBikeQuestion(msg)?topicsOf(msg):new Set<UsedTopic>(),fromHistory=false;
 // A short follow-up ("what about the linkage?", "and the title?") inherits a used-bike conversation from the last few rider messages.
 if(!topics.size&&history?.length&&msg.trim().length<=140&&!SETUP_ONLY.test(msg)){
  const recent=history.slice(-3);
  if(recent.some(isUsedBikeQuestion)&&(FOLLOW_UP.test(msg.trim())||FOLLOW_TOPIC.test(msg))&&!/\bhow (do i|to|should i|can i) (change|replace|adjust|set|fix|install|rebuild|bleed|grease)\b/i.test(msg)){
   text=[...recent,msg].join('\n');topics=topicsOf(text);fromHistory=true;
  }
 }
 if(!topics.size)return null;
 const bikes=bikesIn(text);
 const out:UsedSection={version:USED_BIKE_VERSION,
  boundary:'BAK-authored used-bike buying guidance from makers\' documents, US regulators and state rules, and agreeing buying guides and owner reports. It is a checklist, not a verdict on any bike: say what to check and what each finding means, and that a pre-purchase look by a trusted mechanic is the surest step. Model-specific weak spots come from the bike\'s own bike_knowledge rows (ids in brackets under platform_checks): use those rows\' tier and wording, and if a row is not supplied, name the check without claiming it as a known fault. RECALLS: the recall_notice and recall rows decide whether a recall is mentioned; for a used bike, tell the rider to ask for dealer proof the work was done and to check the VIN with the maker, never that a VIN is clear from model and year alone. Title and theft rules vary by state: give Florida only as an example and tell the rider to check their own state. Never give a dollar figure as BAK\'s, never name a magazine, tester, retailer or forum, and never accuse a seller; describe the sign and what to ask.',
  topics:[...topics]};
 if(fromHistory)out.from_history=true;
 const parts:[string,()=>unknown][]=[];
 const two=/two[- ]?stroke|2[- ]?stroke|smoker|\b(125|150|250|300) ?(sx|xc|xc-w|tc|tx|te|mc|ex|ec)\b|\byz ?(125|250)x?\b(?!f)/i.test(text);
 const areaIds=two?['first_look','cold_start','two_stroke','air_filter','suspension','linkage_swingarm','chain_sprockets','frame','clutch_gearbox','compression','noises','leaks_fluids','steering_head','wheels','brakes']
  :['first_look','cold_start','noises','four_stroke_valves','air_filter','compression','suspension','linkage_swingarm','frame','chain_sprockets','clutch_gearbox','leaks_fluids','steering_head','wheels','brakes'];
 // Compact form: one line of checks and one of bad signs per area.
 const areas=()=>areaIds.map(id=>{const x=inspection.find(a=>a.id===id)!;return {area:x.area,check:x.how.join(' '),bad:x.bad_signs.join(' ')};});
 // What the rider asked about comes first; the general inspection fills what is left of the budget.
 if(topics.has('red_flags')||topics.has('paperwork'))parts.push(['red_flags',()=>redFlags.map(r=>`${r.flag} ${r.why}`)]);
 if(bikes.length)parts.push(['platform_checks',()=>bikes.flatMap(checksFor).slice(0,4)]);
 if(topics.has('vin'))parts.push(['vin',()=>{const makes=bikes.map(b=>b.make);const by=vin.by_make.filter(m=>!makes.length||makes.some(k=>m.make.includes(k)));return strip({format:vin.format,year_codes:vin.year_codes,by_make:by,engine_number:vin.engine_number});}]);
 if(topics.has('paperwork'))parts.push(['paperwork',()=>strip(paperwork)]);
 if(topics.has('hours'))parts.push(['hours',()=>strip(hours)]);
 if(topics.has('negotiate'))parts.push(['negotiation',()=>({rules:negotiation.rules,items:negotiation.items.map(i=>`${i.item}: ${i.cost} cost; due when ${i.due_when.replace(/\.$/,'').replace(/^./,c=>c.toLowerCase())}.`)})]);
 if(topics.has('test_ride'))parts.push(['test_ride',()=>testRide.map(s=>s.step)]);
 if(topics.has('inspect')){
  parts.push(['inspection',areas]);
  if(!topics.has('hours'))parts.push(['hours',()=>({estimate:hours.estimate,caveats:hours.caveats.slice(0,2)})]);
  if(!topics.has('test_ride'))parts.push(['test_ride',()=>testRide.map(s=>s.step)]);
  if(!topics.has('negotiate'))parts.push(['negotiation',()=>({rules:negotiation.rules.slice(0,3)})]);
 }
 for(const [k,f] of parts){
  const v=f();out[k]=v;
  if(JSON.stringify(out).length>USED_BIKE_MAX_CHARS){
   // Trim long lists before dropping a part.
   if(Array.isArray(v)){let n=v.length;while(n>1&&JSON.stringify(out).length>USED_BIKE_MAX_CHARS){n--;out[k]=v.slice(0,n);}}
   if(JSON.stringify(out).length>USED_BIKE_MAX_CHARS)delete out[k];
  }
 }
 return out;
}
