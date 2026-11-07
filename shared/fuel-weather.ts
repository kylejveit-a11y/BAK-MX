/** BAK-authored fuel, jetting and mapping knowledge for gas motocross bikes, and how the day's weather moves it.
 *
 * Carbureted two-strokes and minis: how makers' jetting charts work, which part covers which throttle range, humidity
 * and air density, plug reading, rich and lean signs, premix. Fuel-injected four-strokes (and injected two-strokes):
 * what the ECU corrects on its own, what each maker's own tools change, when a map change helps. Fuel: octane scales,
 * makers' minimums, race fuel, ethanol and fuel age.
 *
 * The air numbers reuse shared/engine-physics.ts (airDensity / airChange); nothing here re-derives them. The maker's own
 * jetting chart for the exact bike lives in verified claims ("Carburetor tuning / ...") and reaches Ask BAK through
 * shared/engine-physics-context.ts; this module never repeats chart cells, only how to use them.
 *
 * Every fact carries `src` ids from FUEL_WEATHER_SOURCES (URLs and dates in docs/research/fuel-weather/SOURCES.md).
 * `src` never reaches the model: fuelWeather() strips it. Rider-facing text never names a magazine, tester, retailer or
 * rider. Facts marked src ['bak-engineering'] are BAK's own reasoning or arithmetic, not a maker's statement.
 *
 * Status: AUTHORED from public maker pages and manuals on 2026-11-07, pending review by Kyle. Edit here; the runtime
 * reads this file.
 */
import {airDensity,airChange} from './engine-physics.ts';
import {airFromText,isFourStroke} from './engine-physics-context.ts';
import {fuelSystem as fuelSystemFor} from './fuel-system.ts';

export const FUEL_WEATHER_VERSION='mx-fuel-weather-1';
/** About 2,250 tokens of JSON at roughly 4 characters a token. */
export const FUEL_WEATHER_MAX_CHARS=9000;

export type FwSource={id:string;publisher:string;kind:'bike_maker'|'carb_maker'|'plug_maker'|'fuel_maker'|'government'|'research'|'bak';url:string;published?:string;accessed:string};
export type Fact={t:string;src:string[]};

/** Every source behind a fact here. Not rider-facing and never sent to the model. Kept in step with SOURCES.md. */
export const FUEL_WEATHER_SOURCES:FwSource[]=[
 {id:'honda-crf150r-charts',publisher:'Honda CRF150R/RB Competition Handbooks 2021-2026 (charts on file in docs/research/expansion/honda/jetting)',kind:'bike_maker',url:'https://cdn.powersports.honda.com/documentum/MWOM/ml.remawmom.akse2525chen.pdf',published:'2025',accessed:'2026-11-04'},
 {id:'honda-cr250r-2007',publisher:'Honda CR250R 2007 Owner\'s Manual & Competition Handbook, Adjustments for Altitude & Temperature',kind:'bike_maker',url:'https://www.manualslib.com/manual/706239/Honda-Cr250r.html?page=110',published:'2007',accessed:'2026-11-07'},
 {id:'ktm-2t-carb-manual',publisher:'KTM 250 SX / 300 SX / 380 SX owner\'s manual, carburetor adjustment (older carbureted model)',kind:'bike_maker',url:'https://www.manualsdir.com/manuals/162395/ktm-250-sx-300-sx-380sx.html?page=17',accessed:'2026-11-07'},
 {id:'yamaha-yz250-2015-osm',publisher:'Yamaha YZ250 Owner\'s Service Manual (2015, 1SS-28199-33)',kind:'bike_maker',url:'https://en.enduro.team/images/a/a5/2014_YZ250.pdf',published:'2014',accessed:'2026-11-07'},
 {id:'kawasaki-kx85-2015-om',publisher:'Kawasaki KX85 2015 Owner\'s Manual',kind:'bike_maker',url:'https://cyclechaos.com/images/4/4b/2015_Kawasaki_KX85_owners_manual.pdf',published:'2014',accessed:'2026-11-07'},
 {id:'mikuni-hs40-manual',publisher:'Mikuni HS40 carburetor tuning manual (dealer-hosted copy)',kind:'carb_maker',url:'https://procycle.us/sites/default/files/files/TM40_manual.pdf',accessed:'2026-11-07'},
 {id:'ngk-read-plug',publisher:'NGK Spark Plugs, How do I read a spark plug?',kind:'plug_maker',url:'https://ngksparkplugs.com/en/resources/read-spark-plug',accessed:'2026-11-07'},
 {id:'honda-crf-fuel-page',publisher:'Honda CRF owner\'s manual fuel page (Honda parts-site copy)',kind:'bike_maker',url:'https://www.bike-parts.fr/thumbs/pdf_url/img/owner_manuals/CRF450RB_EN/2500_2500/0047.pdf',accessed:'2026-11-07'},
 {id:'honda-webom-crf450r',publisher:'Honda Europe web owner\'s manual, CRF450R/RX/RWE (refuelling, HRC Launch Control)',kind:'bike_maker',url:'https://webom.hondamotopub.com/webom/HMEE/MKE250/html/GOG016001.html',accessed:'2026-11-07'},
 {id:'honda-2022-crf450r-release',publisher:'American Honda press release, 2022 CRF450R features and benefits',kind:'bike_maker',url:'https://hondanews.com/en-US/powersports/releases/release-e86048ba0d6e80b260e72d443f084bf6-2022-honda-crf450r-features-benefits',published:'2021',accessed:'2026-11-07'},
 {id:'hrc-setting-tool-2017',publisher:'HRC (Honda Racing Corporation), PGM-FI setting tool for CRF450R/RX 2017-on',kind:'bike_maker',url:'https://www.honda.co.jp/HRC/products/racingkit/crf450r/settingtool2017/',accessed:'2026-11-07'},
 {id:'yamaha-power-tuner',publisher:'Yamaha Motorsports USA, Power Tuner app page',kind:'bike_maker',url:'https://www.yamahamotorsports.com/power-tuner-app',accessed:'2026-11-07'},
 {id:'ktm-450sxf-2019-om',publisher:'KTM 450 SX-F / XC-F Owner\'s Manual 2019 (3214029en)',kind:'bike_maker',url:'https://www.ktmshop.se/documents/19_3214029_en_OM.pdf',published:'2018-11',accessed:'2026-11-07'},
 {id:'ktm-450sxf-2025-om',publisher:'KTM 450 SX-F / XC-F Owner\'s Manual 2025 (3240045en)',kind:'bike_maker',url:'https://www.ktmshop.se/bike-manuals/25_3240045_en_OM.pdf',published:'2024-05-16',accessed:'2026-11-07'},
 {id:'ktm-cuo',publisher:'KTM tech guide, Connectivity Unit Offroad (recorded in docs/research/knowledge/app_maps.json, map1-017/018)',kind:'bike_maker',url:'https://www.ktm.com/tech-guide/connectivity-unit-offroad',published:'2024',accessed:'2026-11-07'},
 {id:'husqvarna-mx-2024',publisher:'Husqvarna Motorcycles 2024 motocross media information (recorded in app_maps.json, map1-021)',kind:'bike_maker',url:'https://www.husqvarna-motorcycles.com/en-int/Media-Information-Motocross-2024.html',published:'2023',accessed:'2026-11-07'},
 {id:'kawasaki-2024-kx450-release',publisher:'Kawasaki Motors Corp. USA press release, 2024 KX450 / KX450X',kind:'bike_maker',url:'https://content2.kawasaki.com/ContentStorage/KMC/PressReleases/747/2ece80ad-ec1a-4fad-aed6-433d9631696e.pdf',published:'2023-09-22',accessed:'2026-11-07'},
 {id:'kawasaki-rideology-kx',publisher:'Kawasaki, Rideology The App KX listing (recorded in app_maps.json, map1-007)',kind:'bike_maker',url:'https://apps.apple.com/md/app/rideology-the-app-kx/id6443785419',published:'2026',accessed:'2026-11-07'},
 {id:'suzuki-rmz450-2025',publisher:'Suzuki Motor Corporation, 2025 RM-Z450 product page',kind:'bike_maker',url:'https://www.globalsuzuki.com/motorcycle/smgs/products/2025rm-z450/',accessed:'2026-11-07'},
 {id:'suzuki-rmz250-2025',publisher:'Suzuki Motor Corporation, 2025 RM-Z250 product page',kind:'bike_maker',url:'https://www.globalsuzuki.com/motorcycle/smgs/products/2025rm-z250/',accessed:'2026-11-07'},
 {id:'triumph-mx-tune-pro',publisher:'Triumph Motorcycles, MX Tune Pro off-road app owners page',kind:'bike_maker',url:'https://www.triumphmotorcycles.com/owners/off-road/app',accessed:'2026-11-07'},
 {id:'vp-mr-pro6',publisher:'VP Racing Fuels, MR PRO6 product page',kind:'fuel_maker',url:'https://vpracingfuels.com/product/mr-pro6-reg/?c=221&',accessed:'2026-11-07'},
 {id:'sunoco-oxygenated',publisher:'Sunoco Race Fuels, Fuel metering basics: oxygenated fuels',kind:'fuel_maker',url:'https://www.sunocoracefuels.com/tech-corner/article/fuel-metering-basics-oxygenated-fuels',accessed:'2026-11-07'},
 {id:'sunoco-faq',publisher:'Sunoco Race Fuels, FAQ',kind:'fuel_maker',url:'https://www.sunocoracefuels.com/faq',accessed:'2026-11-07'},
 {id:'sunoco-moto-rp6',publisher:'Sunoco Race Fuels, Moto RP6 product page',kind:'fuel_maker',url:'https://www.sunocoracefuels.com/fuels/moto-rp6',accessed:'2026-11-07'},
 {id:'yamaha-wr250f-2024-osm',publisher:'Yamaha 2024 WR250F Owner\'s Service Manual (BAK-2819U-14), recorded in docs/research/knowledge/ywr_a.json',kind:'bike_maker',url:'https://library.ymcapps.net/library/om/contents/pdf/10/BAK-2819U-14_02.pdf',published:'2024',accessed:'2026-11-07'},
 {id:'ftc-octane',publisher:'US Federal Trade Commission, Paying a premium for high octane gasoline? (archived consumer page)',kind:'government',url:'https://webarchive.library.unt.edu/web/20130214154816/http://www.consumer.ftc.gov/articles/0210-paying-premium-high-octane-gasoline',published:'2013 capture',accessed:'2026-11-07'},
 {id:'nrel-storage-2016',publisher:'US DOE National Renewable Energy Laboratory small-engine fuel storage study, as released by the Renewable Fuels Association (study sponsor)',kind:'research',url:'https://www.ethanolrfa.org/media-and-news/category/news-releases/article/2016/09/new-doe-study-gas-becomes-stale-long-before-water-uptake-becomes-a-concern',published:'2016-09-21',accessed:'2026-11-07'},
 {id:'bak-engineering',publisher:'BAK engineering: own reasoning or arithmetic from shared/engine-physics.ts, not a maker statement',kind:'bak',url:'https://bakmx.com',accessed:'2026-11-07'},
];

// ---------- Carbureted bikes ----------

/** How a maker's printed jetting chart is laid out and used. */
export const chartUse:Fact[]=[
 {t:'A maker\'s jetting chart is a grid: elevation bands down one side, air-temperature bands across, and each box gives the full setting for that air (pilot or air screw turns, pilot/slow jet, needle and clip position, main jet). Find the box for the track\'s elevation and the day\'s temperature.',src:['honda-crf150r-charts']},
 {t:'Some makers print a second chart for an optional part (Honda prints one for its optional quieter muffler); use the chart that matches the exhaust fitted.',src:['honda-crf150r-charts']},
 {t:'Charts are for the stock, unmodified engine. A pipe, porting, different fuel or a different premix ratio makes the chart a starting point, not the answer.',src:['honda-cr250r-2007']},
 {t:'KTM sets its baseline for about 500 m (1,600 ft) and about 20 °C (68 °F): higher or hotter means go leaner, lower or colder means go richer.',src:['ktm-2t-carb-manual']},
 {t:'Change one jet size at a time and test; Honda says fine tuning should not need more than one size either way. Leaning: go down one number at a time to avoid overheating and seizure (KTM). When in doubt, take the next richer jet (Honda).',src:['honda-cr250r-2007','ktm-2t-carb-manual']},
 {t:'Before changing jets for a running fault, rule out the things jetting cannot fix: dirty or over-oiled air filter, air leaks, float level, blocked jets, stale fuel or a wrong fuel/oil mix, ignition, and low compression or worn crank seals.',src:['honda-cr250r-2007','ktm-2t-carb-manual','yamaha-yz250-2015-osm']},
];
/** Which carb part mostly covers which throttle opening. The ranges overlap. */
export const circuits:Fact[]=[
 {t:'Pilot jet and air/fuel screw: idle to about 1/4 throttle.',src:['mikuni-hs40-manual','yamaha-yz250-2015-osm']},
 {t:'Needle (taper and clip position): about 1/4 to 3/4 throttle. Clip up a groove = leaner, clip down = richer through that range.',src:['mikuni-hs40-manual','ktm-2t-carb-manual']},
 {t:'Main jet: about 3/4 to full throttle. Adjust the main before the needle (Honda) so a lean top end is never chased with the needle.',src:['mikuni-hs40-manual','honda-cr250r-2007']},
 {t:'Screw direction differs by carb: on an air screw (the usual two-stroke type) turning out leans the low-speed mixture; on a fuel or pilot screw (many four-stroke carbs) turning out richens it. Check which one the bike has before advising turns.',src:['bak-engineering','yamaha-yz250-2015-osm']},
 {t:'If best idle needs a fuel screw more than about 3-1/2 turns out, the pilot jet is too small; if it needs less than about 1/4 turn, it is too big (Mikuni\'s rule for a fuel screw).',src:['mikuni-hs40-manual']},
];
/** Track and weather conditions the makers name, beyond the chart. */
export const conditionRules:Fact[]=[
 {t:'Very humid or rainy days: Honda says go one main jet size leaner. Water vapour takes the place of oxygen, so the carb runs a little richer for the same air.',src:['honda-cr250r-2007','bak-engineering']},
 {t:'Air hotter than about 113 °F (45 °C): Honda says one main jet leaner.',src:['honda-cr250r-2007']},
 {t:'Long straights or long uphills, deep sand or mud (the engine held loaded at big throttle): Honda says one main jet richer.',src:['honda-cr250r-2007']},
 {t:'Dry air or cold air: the mixture goes lean, so richen. Warm air, high humidity and high altitude: the mixture goes rich, so lean.',src:['honda-cr250r-2007','ktm-2t-carb-manual']},
];
/** Air density, density altitude and how to use them for jetting. */
export const airRules:Fact[]=[
 {t:'Density altitude is the elevation the day\'s air "feels" like to the engine, from the real elevation, temperature, pressure and humidity. A hot sea-level day can ride like a couple of thousand feet up.',src:['bak-engineering']},
 {t:'A carb meters fuel from the air\'s pressure drop, so its mixture moves with about the square root of air density: thinner air = richer, denser air = leaner. Power follows the oxygen (dry air) density.',src:['bak-engineering']},
 {t:'The useful number is the change from where the bike runs right now to the race, not the day versus sea level: carry the rider\'s own good jetting by that change.',src:['bak-engineering']},
 {t:'Humidity moves a carb\'s mixture far less than temperature or elevation: going from 30% to 90% humidity on an 85 °F day makes it only about 1.3% richer (computed). Temperature and elevation lead; humidity tips a borderline call.',src:['bak-engineering']},
];
/** Plug reading. */
export const plugRules:Fact[]=[
 {t:'Normal: insulator light tan to grey-brown.',src:['ngk-read-plug','kawasaki-kx85-2015-om']},
 {t:'Dry black soot: rich mixture, but also a plug too cold for the use, retarded timing, too big a gap or low compression; check those before re-jetting.',src:['ngk-read-plug']},
 {t:'Wet black: extremely rich or oil getting in (on a two-stroke, too much premix oil or a rich low-speed circuit).',src:['ngk-read-plug','kawasaki-kx85-2015-om']},
 {t:'Glazed or glossy insulator, blistered or melted electrode: overheating. Trace it straight away (lean, too hot a plug, timing).',src:['ngk-read-plug']},
 {t:'Read the plug after a steady run in the range being tested, then shut off without blipping the throttle on the way in, so the last fuel through is from that range.',src:['mikuni-hs40-manual']},
 {t:'Change heat range only after jetting is right: Kawasaki\'s mini manual lists a hotter optional plug for a plug that stays dark and fouled.',src:['kawasaki-kx85-2015-om']},
];
/** Rich and lean signs by throttle range. */
export const symptomRules:Fact[]=[
 {t:'Lean (any range): pinging or detonation, surging at steady throttle, flat part-throttle pull, running hot, power that fades as it heats up. Lean two-stroke jetting that pings is a stop-riding condition.',src:['mikuni-hs40-manual','ktm-2t-carb-manual']},
 {t:'Rich: blubbering or crackling, sluggish and heavy response, black exhaust tip and sooty plug, loading up at small throttle.',src:['mikuni-hs40-manual','ngk-read-plug']},
 {t:'Work out the throttle opening where the fault is, then change the part for that range: off idle to 1/4 = pilot/screw; 1/4 to 3/4 = needle clip; 3/4 to full = main.',src:['mikuni-hs40-manual']},
 {t:'A bog off the bottom can be rich or lean; a plug read and one change at a time tell which. Air filter, float level and choke/starter left on cause the same complaints.',src:['honda-cr250r-2007','bak-engineering']},
];
/** Premix: maker ratios and the effect on jetting. */
export const premixRules:Fact[]=[
 {t:'Use the maker\'s ratio and oil from the bike\'s own manual: for example Yamaha YZ two-strokes 30:1 with Yamalube 2-R (15:1 for break-in), Kawasaki KX85 32:1 with a racing two-stroke oil, older KTM SX two-strokes 1:40 to 1:60.',src:['yamaha-yz250-2015-osm','kawasaki-kx85-2015-om','ktm-2t-carb-manual']},
 {t:'More oil in the mix means slightly less gasoline through the same jet, so a richer oil ratio runs a touch leaner. 32:1 versus 50:1 changes the gasoline share by only about 1% (computed): jet with the mix you will race, and do not change ratio to fix jetting.',src:['bak-engineering']},
 {t:'Too much oil: smoke and fouled plugs. Too little: wear and engine damage (Kawasaki). Mix fresh for each riding day.',src:['kawasaki-kx85-2015-om','yamaha-yz250-2015-osm']},
];

// ---------- Fuel-injected bikes ----------

export const efiRules:Fact[]=[
 {t:'The ECU reads air temperature and pressure and corrects fuelling for the day on its own (HRC says this of Honda\'s PGM-FI). Riders do not re-map for weather or elevation; the power lost to thin air still happens.',src:['hrc-setting-tool-2017','bak-engineering']},
 {t:'Cold starts are also handled by the ECU: it lengthens injection when the engine and the air are cold (KTM).',src:['ktm-450sxf-2019-om','ktm-450sxf-2025-om']},
 {t:'Map changes are for how the power is delivered (traction, hit, engine braking) on that dirt, not for the air. Change one thing at a time and keep the stock map to go back to.',src:['triumph-mx-tune-pro','yamaha-power-tuner','bak-engineering']},
 {t:'Slick, wet, hard-pack or muddy ground: a smoother map, more traction control or the gentler launch setting. Loam, sand or good traction: a stronger map and less intervention. Makers name their presets this way (Triumph: hard pack, loam, sand, each dry or wet; KTM app: sand, gravel, hard pack, dry or wet; Honda HSTC level 3 for slippery or muddy surfaces).',src:['triumph-mx-tune-pro','ktm-cuo','honda-2022-crf450r-release']},
 {t:'An aftermarket exhaust can need its own fuel map: Triumph only offers its exhaust maps for its accessory exhaust, and Yamaha lists a map made for its own accessory exhaust. Signs fuelling went lean after a pipe: popping on deceleration, hesitation or a hang off idle, running hotter. Fix it with a map made for that pipe or a tuner, never by guessing cells.',src:['triumph-mx-tune-pro','yamaha-power-tuner','bak-engineering']},
 {t:'Before blaming the map: fuel pressure and filter, a dirty air filter, a sticking throttle position reading (KTM has a throttle valve teach procedure) and stale fuel cause the same running faults.',src:['ktm-450sxf-2019-om','bak-engineering']},
];
export type MakerTools={make:string;matches:RegExp;tools:Fact[]};
export const makerTools:MakerTools[]=[
 {make:'Yamaha',matches:/yamaha|\byz|\bwr\d|power tuner/i,tools:[
  {t:'Power Tuner app (free, through the bike\'s communication unit): simple smooth-to-aggressive slider or a full fuel and ignition timing grid, traction control level, launch control, maps uploaded to the ECU for on-the-fly selection, ECU lock, and live data including intake air temperature. Yamaha publishes preset maps named for conditions (for example one for loamy dirt).',src:['yamaha-power-tuner']}]},
 {make:'Honda',matches:/honda|\bcrf|hrc|hstc/i,tools:[
  {t:'Handlebar engine mode button: Mode 1 Standard, Mode 2 Smooth, Mode 3 Aggressive. HSTC traction control 1 (lightest) to 3 (quickest, for slippery or muddy) or off. HRC Launch Control with three rev-limit levels (level 3 for slippery starts); it works in 1st or 2nd and switches itself off after a few seconds.',src:['honda-2022-crf450r-release','honda-webom-crf450r']},
  {t:'Official fuel and ignition tuning is HRC\'s PGM-FI setting tool (PC software and interface sold through HRC service shops): it edits fuel and ignition by throttle opening and rpm, and on 2017-on CRF450R/RX only changes the Smooth and Aggressive modes, leaving Standard as the stock map.',src:['hrc-setting-tool-2017']}]},
 {make:'KTM group',matches:/ktm|husq|husky|gas ?gas|\bsx-?f|\bfc ?\d|\bmc ?\d|cuo|connectivity/i,tools:[
  {t:'Bar switch: Map 1 (standard, white light) and Map 2 (advanced/aggressive, green light); traction control button for wet or slick; launch control armed at idle in neutral with two buttons, off after the start. Same system on Husqvarna and GasGas.',src:['ktm-450sxf-2019-om','ktm-450sxf-2025-om','husqvarna-mx-2024']},
  {t:'Connectivity Unit Offroad (official accessory, standard on some Factory Editions): phone app sliders for throttle response, engine braking, traction control, launch control and quickshifter, with presets for sand, gravel or hard pack, dry or wet.',src:['ktm-cuo']}]},
 {make:'Kawasaki',matches:/kawasaki|\bkx|rideology/i,tools:[
  {t:'2024-on KX450 family: handlebar Power Mode button with Normal and Mild maps (replacing the earlier DFI fuel couplers), traction control Low or Strong or off, launch control by pressing two buttons together.',src:['kawasaki-2024-kx450-release']},
  {t:'Rideology The App KX (2024-on KX450, later KX250): edits fuel and ignition on a 6 x 6 rpm-by-throttle grid for both stock maps and logs live data. Earlier KX-F models used plug-in couplers or the cable-connected KX FI Calibration Kit.',src:['kawasaki-rideology-kx','kawasaki-2024-kx450-release']}]},
 {make:'Suzuki',matches:/suzuki|rm-?z/i,tools:[
  {t:'RM-Z comes with two fuel couplers, one richer and one leaner than stock, plugged into the harness in seconds; MX-Tuner 2.0 app adjusts fuel and ignition and saves settings per track or weather. S-HAC launch: Mode A for hard or slippery gates, Mode B for good traction.',src:['suzuki-rmz450-2025','suzuki-rmz250-2025']}]},
 {make:'Triumph',matches:/triumph|\btf ?\d|mx tune/i,tools:[
  {t:'MX Tune Pro app through Triumph\'s accessory Wi-Fi Module Kit: loads factory maps (Novice, Intermediate, Expert, Hard Pack Dry/Wet, Loam Dry/Wet, Sand Dry/Wet) into Map 2 while Map 1 stays full power; traction control (GPA) and launch control set per map; separate maps for the accessory exhaust also change Map 1 fuelling; OE Factory map resets everything.',src:['triumph-mx-tune-pro']}]},
];

// ---------- Fuel ----------

export const octaneRules:Fact[]=[
 {t:'US pumps post the anti-knock index, (RON + MON) / 2, often written (R+M)/2 or PON: regular is usually 87, premium 92 or 93. Europe and most manuals quote RON, which reads higher for the same fuel.',src:['ftc-octane','sunoco-faq']},
 {t:'Makers equate pump 91 (R+M)/2 with RON 95: Honda and Yamaha print both; KTM lists Super unleaded RON 95 / PON 91. Example from a fuel maker\'s sheet: RON 104 and MON 86 make 95 (R+M)/2.',src:['honda-crf-fuel-page','yamaha-wr250f-2024-osm','ktm-450sxf-2019-om','vp-mr-pro6']},
 {t:'More octane than the engine needs adds no power; it only resists knock. If a bike pings on the specified grade, change brand or go up a grade, and find the cause if it persists.',src:['ftc-octane','sunoco-faq','honda-crf-fuel-page','yamaha-yz250-2015-osm']},
];
export const makerMinimums:Fact[]=[
 {t:'Honda CRF450R/RX/RWE: unleaded, RON 95 or higher (pump 91 or higher).',src:['honda-webom-crf450r','honda-crf-fuel-page']},
 {t:'KTM 450 SX-F/XC-F: Super unleaded RON 95 (PON 91).',src:['ktm-450sxf-2019-om','ktm-450sxf-2025-om']},
 {t:'Yamaha YZ250: premium unleaded, RON 95 or higher.',src:['yamaha-yz250-2015-osm']},
 {t:'Kawasaki KX85: unleaded premium, RON 95 or higher, no more ethanol than E10.',src:['kawasaki-kx85-2015-om']},
];
export const raceFuelRules:Fact[]=[
 {t:'Oxygenated race fuel carries oxygen of its own, so it needs more fuel for the same air: one race-fuel maker says a 10%-oxygen fuel needs about 10 to 15% more fuel. Lower-oxygen fuels (about 4 to 6% by weight) need only small jetting or map changes, but still richer, never leaner.',src:['sunoco-oxygenated','sunoco-faq','vp-mr-pro6','sunoco-moto-rp6']},
 {t:'Switching fuels can also change specific gravity, which moves a carb\'s mixture; re-check the plug and feel after any fuel change.',src:['sunoco-faq']},
 {t:'Race fuel helps a high-compression or modified engine that knocks on pump fuel; a stock engine tuned for pump fuel gains little and may need a richer setting. Leaded fuel is not for these bikes: makers specify unleaded. What is legal to race is in the race rules, not here.',src:['sunoco-faq','honda-crf-fuel-page']},
 {t:'Do not mix different race fuels; sealed in an opaque can with little air space, most race fuels keep at least a year.',src:['sunoco-faq']},
];
export const ethanolRules:Fact[]=[
 {t:'E10 (up to 10% ethanol) is acceptable; makers say no more ethanol than E10 (Kawasaki), and Yamaha allows ethanol blends up to 10% but not methanol blends.',src:['kawasaki-kx85-2015-om','yamaha-wr250f-2024-osm']},
 {t:'Ethanol carries some oxygen, so E10 runs a carb slightly leaner than ethanol-free gas; jet with the fuel you will race.',src:['bak-engineering','sunoco-oxygenated']},
 {t:'In hot, humid storage (a government lab study simulated Houston and Orlando), small-engine fuel went stale (lost light ends, harder starting, gum) before water caused phase separation; E10 took three months or more to separate, and ethanol-free gas went stale just as fast.',src:['nrel-storage-2016']},
 {t:'Practical rule: buy small amounts, keep cans sealed and shaded, mix premix fresh each riding day, and drain or stabilise fuel before a long layoff.',src:['kawasaki-kx85-2015-om','yamaha-yz250-2015-osm','sunoco-faq','bak-engineering']},
];

// ---------- Seasons ----------

/** Florida summer, Florida winter and a mountain track, computed from airDensity (example days, not forecasts). */
const day=(label:string,e:number,t:number,h:number)=>{const a=airDensity(e,t,h);return {day:label,rides_like_ft:a.density_altitude_ft,air_density_pct:a.air_density_pct,power_pct:a.power_pct};};
export const seasonExamples=[
 day('Florida summer, 100 ft, 92 °F, 75% humidity',100,92,75),
 day('Florida winter, 100 ft, 55 °F, 60% humidity',100,55,60),
 day('Mountain track, 7,000 ft, 55 °F, 30% humidity',7000,55,30),
];
const flChange=airChange({elevationFt:100,tempF:55,humidityPct:60},{elevationFt:100,tempF:92,humidityPct:75});
export const seasonRules:Fact[]=[
 {t:`Hot, humid Florida summer versus a cool winter day at the same track: about ${Math.abs(flChange.power_change_pct)}% less oxygen and a carb about ${flChange.carb_mixture_change_pct}% richer (computed). A carb jetted in winter usually wants a step leaner for summer (main and clip first); Honda adds one main leaner for very humid days.`,src:['bak-engineering','honda-cr250r-2007']},
 {t:'Cold, high mountain tracks: elevation dominates; use the chart box for that elevation and temperature, and carry the rider\'s own jetting by the chart\'s change. Early cold mornings at elevation can be on the lean side of a box that suits the afternoon.',src:['honda-crf150r-charts','ktm-2t-carb-manual','bak-engineering']},
 {t:'Fuel injection follows the season on its own; in summer heat expect less power and use map and traction settings for the dirt, not the air.',src:['hrc-setting-tool-2017','bak-engineering']},
];

// ---------- Gating ----------

export type FwTopic='jetting'|'maps'|'plug'|'fuel'|'symptoms'|'air';
const T:Record<FwTopic,RegExp>={
 jetting:/\b(jet(s|ting|ted)?|re-?jet\w*|carb(s|uretor|uretors|urettor|y)?|main jet|pilot( jet)?|slow jet|needle|clip (position|up|down|leaner|richer)|(one|a|two) clips?|(air|fuel|pilot) screw|float (level|height)|pwk|tmx|mikuni|keihin)\b/i,
 maps:/\b(ecu|efi|fuel injection|injected|fuel ?maps?|maps?\s?(switch|1|2|one|two|button|setting|change)|(engine|power|ignition|stock|aggressive|smooth|mild) maps?|mapping|re-?map\w*|(which|what|best|change|switch|good|new|a|the) maps?|maps? for|power tuner|tuner app|rideology|mx tune|mx-tuner|connectivity unit|\bcuo\b|couplers?|hrc (setting|tool|launch)|hstc|engine mode|traction control|launch control|s-hac|holeshot assist|fi (kit|calibration)|calibration kit|tune the (bike|ecu)|throttle body)\b/i,
 plug:/\b(spark ?plugs?|plug (is|was|looks|came out)|(black|sooty|wet|white|tan|glazed|oily) plug|plug (chop|read\w*|colou?r|fouled|fouling|heat range)|read(ing)? (the|my) plug|fouled plug|fouls? plugs?|heat range)\b/i,
 fuel:/\b(octane|\bron\b|\bmon\b|\bpon\b|\baki\b|\(r\+m\)\/2|race (fuel|gas)|pump (gas|fuel)|e10|e15|e85|ethanol|non-?ethanol|ethanol-?free|rec ?(90|fuel)|premix|pre-mix|mix (ratio|oil)|oil ratio|\d{2}\s?:\s?1|1\s?:\s?\d{2}|two-?stroke oil|2-?stroke oil|vp\b|sunoco|oxygenated|leaded|unleaded|stale (gas|fuel)|old (gas|fuel)|(store|storing|storage of|keep) (the )?(gas|fuel)|fuel (age|stabili[sz]er|grade|type)|what (gas|fuel)|which (gas|fuel)|premium (gas|fuel)|(87|89|91|93) octane|gasohol)\b/i,
 symptoms:/\b(rich or lean|lean or rich|too rich|too lean|richen\w*|richer|leaner|lean it out|runs? (rich|lean|fat|hot|rough)|running (rich|lean|fat)|too (rich|lean)|lean (bog|condition|seize|out)|rich (bog|condition)|bog(s|gy|ging|ged)?|blubber\w*|load(s|ing)? up|ping(s|ing)?|pinging|detonat\w*|knock(s|ing)?|surg(e|es|ing)|hesitat\w*|stumbl\w*|(popping|pops|backfir\w*) on (decel\w*|the decel)|decel pop\w*|backfir\w*|crackl\w*|hangs? (at )?idle|hanging idle|won.?t clean up|spooge|spits? (oil|juice))\b/i,
 air:/\b(altitude|elevation|density altitude|air density|thin air|humid(ity)?|feet up|mountains?|hot (day|weather|summer)|cold (day|weather|morning)|summer|winter|seasons?|weather|barometric|sea level)\b/i,
};
/** Running words that make an air/weather word about how the bike runs, not about the trip. */
const RUNNING=/\b(run(s|ning)?|power|engine|motor|bike|jet\w*|carb\w*|maps?|fuel\w*|bog\w*|rich|lean|ping\w*|plug|throttle|pull(s|ing)?|response|tune|tuning|feel(s)?)\b/i;
const NOT_OURS=/\b(drain plug|oil (drain )?plug|plug (wire )?for (the )?(phone|charger)|gear ratio|final drive ratio|sprocket ratio|track map|map of (the )?track|course map|tire|tyre|psi\b)/i;
/** Follow-ups that clearly moved to another system. */
const OTHER_DOMAIN=/\b(sag|fork|shock|clickers?|rebound|compression damping|spring rate|tire|tyre|psi|sprocket|chain|brake|clutch|valve clearance|oil change|coolant|torque spec|bar bend|grips?)\b/i;

export function fuelWeatherTopics(text:string):Set<FwTopic>{
 const t=(text??'').replace(NOT_OURS,' ');
 const out=new Set<FwTopic>();
 for(const k of Object.keys(T) as FwTopic[]){if(k==='air')continue;if(T[k].test(t))out.add(k);}
 if(T.air.test(t)&&(out.size||RUNNING.test(t)||/\b(density altitude|air density|thin air)\b/i.test(t)))out.add('air');
 // "6,000 ft and 85 degrees" with a jetting or running question is about the air too.
 if(out.size&&!out.has('air')){const a=airFromText(t);if(a.elevationFt!=null||a.tempF!=null||a.humidity!=null)out.add('air');}
 return out;
}

export type FwBike={manufacturer:string;model:string;model_year:number;fuel_system?:string};
type System='carburetor'|'injected'|null;
function systemOf(bike:FwBike|undefined,text:string):{system:System;source:string}{
 const fs=String(bike?.fuel_system??'').toLowerCase();
 if(/carb/.test(fs))return {system:'carburetor',source:'the bike on file'};
 if(/inject|efi|tbi|tpi|throttle body/.test(fs))return {system:'injected',source:'the bike on file'};
 if(bike){const f=fuelSystemFor(bike.manufacturer,bike.model,bike.model_year);if(f)return {system:f,source:'model and year'};}
 if(/\b(carb(s|uretor|uretted|ureted)?|jets?|jetting|needle|main jet|pilot jet|pwk|mikuni|keihin pw)\b/i.test(text)&&!/\b(efi|fuel injection|injected|ecu|tbi|tpi)\b/i.test(text))return {system:'carburetor',source:'the rider\'s words'};
 if(/\b(efi|fuel injection|injected|ecu|tbi|tpi|throttle body|power tuner|rideology|mx tune|couplers?|cuo)\b/i.test(text))return {system:'injected',source:'the rider\'s words'};
 return {system:null,source:'not known'};
}
const strip=(f:Fact[])=>f.map(x=>x.t);

/** Day air for jetting: density altitude, air density and oxygen versus standard sea-level air (59 °F, dry). Reuses airDensity. */
export function rideAir(elevationFt:number,tempF:number,humidityPct?:number|null){
 const a=airDensity(elevationFt,tempF,humidityPct);
 return {elevation_ft:a.elevation_ft,temp_f:a.temp_f,humidity_pct:a.humidity_pct,humidity_assumed:a.humidity_assumed,density_altitude_ft:a.density_altitude_ft,air_density_pct:a.air_density_pct,oxygen_pct:a.power_pct};
}

export type FuelWeatherSection={version:string;boundary:string;topics:FwTopic[];fuel_system:{value:string;source:string};from_history?:true;[k:string]:unknown};

/**
 * The fuel, jetting and weather section for Ask BAK, or null when the conversation is not about jetting, fuelling,
 * maps, plugs, fuel, rich/lean running or weather and altitude effects on running. Pure; stays under FUEL_WEATHER_MAX_CHARS.
 */
export function fuelWeather(message:string,history?:string[],bike?:FwBike):FuelWeatherSection|null{
 const msg=message??'';
 let topics=fuelWeatherTopics(msg),text=msg,fromHistory=false;
 if(!topics.size&&history?.length&&msg.trim().length<=160&&!OTHER_DOMAIN.test(msg)){
  const recent=history.slice(-3).join('\n'),h=fuelWeatherTopics(recent);
  // A follow-up inherits only when it reads like one: short, and asking about a number, a step or "what about".
  if(h.size&&/\b(what about|and|then|so|how much|how many|which|should i|one|two|step|size|clip|turns?|\d+|richer|leaner|up|down|more|less|instead)\b/i.test(msg)){topics=h;text=recent+'\n'+msg;fromHistory=true;}
 }
 if(!topics.size)return null;
 const {system,source}=systemOf(bike,text);
 const two=bike?!isFourStroke(bike.model):/\b(two-?stroke|2-?stroke|smoker|premix|\b(65|85|105|112|125|150|200|250|300) ?sx\b|yz(65|85|125|250)\b|kx(65|85|112)\b|tc ?(65|85|125|250|300)\b|mc ?(65|85|125|250)\b)/i.test(text)||null;
 const carb=system==='carburetor'||(system===null&&(topics.has('jetting')||topics.has('plug')));
 const efi=system==='injected'||(system===null&&topics.has('maps'));
 const out:FuelWeatherSection={version:FUEL_WEATHER_VERSION,
  boundary:'BAK fuel, jetting and mapping knowledge from makers\' manuals and pages. It is general guidance: the exact bike\'s published jetting chart, fuel grade and premix ratio in verified claims always come first. Give jetting changes as steps to try and confirm by plug and feel, never as calculated jet sizes. Never suggest jets on a fuel-injected bike or ECU maps on a carbureted one. Name bike, fuel and part makers freely; never name a magazine, tester, retailer or rider.',
  topics:[...topics],fuel_system:{value:system==='carburetor'?'carbureted':system==='injected'?'fuel injected':'not known',source}};
 if(fromHistory)out.from_history=true;
 if(system===null&&(topics.has('jetting')||topics.has('maps')||topics.has('symptoms')))out.ask='Whether the bike has a carburetor or fuel injection, if the answer turns on it.';
 // Rider-given air numbers, computed here so a weather question has them even without a track on file.
 const said=airFromText(text);
 const parts:[string,()=>unknown][]=[];
 if(said.elevationFt!=null&&said.tempF!=null&&(topics.has('air')||topics.has('jetting')||topics.has('symptoms'))){
  parts.push(['air_from_message',()=>{try{return rideAir(said.elevationFt!,said.tempF!,said.humidity??null);}catch{return undefined;}}]);
 }
 const symptoms=topics.has('symptoms')||topics.has('plug');
 if(carb&&(topics.has('jetting')||symptoms||topics.has('air'))){
  if(symptoms)parts.push(['rich_lean_signs',()=>strip(symptomRules)]);
  parts.push(['carb_circuits',()=>strip(circuits)]);
  if(topics.has('jetting')||topics.has('air'))parts.push(['jetting_charts',()=>strip(chartUse)]);
  if(topics.has('jetting')||topics.has('air')||topics.has('symptoms'))parts.push(['conditions',()=>strip(conditionRules)]);
 }
 if(topics.has('plug'))parts.push(['plug_reading',()=>strip(plugRules)]);
 // Rich or lean signs when the fuel system is not known: they read the same either way.
 if(!carb&&!efi&&topics.has('symptoms'))parts.push(['rich_lean_signs',()=>strip(symptomRules)]);
 if(efi&&(topics.has('maps')||topics.has('symptoms')||topics.has('air')||topics.has('fuel'))){
  parts.push(['fuel_injection',()=>strip(topics.has('maps')||topics.has('symptoms')?efiRules:efiRules.slice(0,3))]);
  if(topics.has('maps')||topics.has('symptoms')){
   const named=makerTools.filter(m=>m.matches.test(text)||(bike&&m.matches.test(bike.manufacturer)));
   parts.push(['maker_tools',()=>Object.fromEntries((named.length?named:makerTools).map(m=>[m.make,strip(m.tools)]))]);
  }
 }
 if(topics.has('air'))parts.push(['air_and_weather',()=>({rules:strip(airRules),seasons:strip(seasonRules),example_days:seasonExamples})]);
 if(topics.has('fuel')){
  const ft=text;
  if(/octane|\bron\b|\bmon\b|\bpon\b|\baki\b|r\+m|premium|grade|(87|89|91|93)\b|what (gas|fuel)|which (gas|fuel)|race (fuel|gas)/i.test(ft))parts.push(['octane',()=>({rules:strip(octaneRules),maker_minimums:strip(makerMinimums)})]);
  if(/race (fuel|gas)|oxygenated|leaded|vp\b|sunoco|specific gravity/i.test(ft))parts.push(['race_fuel',()=>strip(raceFuelRules)]);
  if(/ethanol|e10|e15|e85|gasohol|stale|old (gas|fuel)|storage|store|stabili|shelf|rec ?(90|fuel)|non-?ethanol|ethanol-?free|age/i.test(ft))parts.push(['ethanol_and_storage',()=>strip(ethanolRules)]);
  if(two!==false&&/premix|pre-mix|ratio|\d{2}\s?:\s?1|1\s?:\s?\d{2}|oil/i.test(ft))parts.push(['premix',()=>strip(premixRules)]);
  // A bare fuel question with none of the above: octane and the minimums are the usual answer.
  if(!parts.some(([k])=>['octane','race_fuel','ethanol_and_storage','premix'].includes(k)))parts.push(['octane',()=>({rules:strip(octaneRules),maker_minimums:strip(makerMinimums)})]);
 }else if(carb&&two!==false&&(topics.has('jetting')||topics.has('symptoms'))&&/premix|ratio|oil/i.test(text))parts.push(['premix',()=>strip(premixRules)]);
 for(const [k,f] of parts){
  const v=f();if(v===undefined)continue;out[k]=v;
  if(JSON.stringify(out).length>FUEL_WEATHER_MAX_CHARS){
   if(Array.isArray(v))out[k]=v.slice(0,3);
   else if(k==='maker_tools'&&v&&typeof v==='object')out[k]=Object.fromEntries(Object.entries(v as Record<string,string[]>).map(([m,l])=>[m,l.slice(0,1)]));
   else if(k==='air_and_weather')out[k]={rules:strip(airRules).slice(0,2),example_days:seasonExamples};
   else if(k==='octane')out[k]={rules:strip(octaneRules).slice(0,2),maker_minimums:strip(makerMinimums).slice(0,2)};
   if(JSON.stringify(out).length>FUEL_WEATHER_MAX_CHARS)delete out[k];
  }
 }
 return out;
}
