/** BAK-authored tire knowledge for gas motocross bikes.
 *
 * Tire lines and what terrain each is made for, published cold-pressure ranges from the tire makers, how pressure moves
 * with conditions, tube / heavy-duty tube / mousse / TUbliss trade-offs, wear and replacement, rim locks and mounting,
 * and the handling complaints where a tire is as likely a cause as the suspension.
 *
 * Every number carries a `src` id from TIRE_SOURCES (full list with URLs and dates in docs/research/tires/SOURCES.md).
 * `src` never reaches the model: tireKnowledge() strips it. Rider-facing text names tire brands and models only, never a
 * magazine, tester, retailer or rider. Tire-maker ranges are general guidance, never the bike's published value: the bike
 * maker's own cold pressure for the exact bike (verified claims) always comes first.
 *
 * Status: AUTHORED from public maker pages on 2026-11-07, pending review by Kyle. Edit here; the runtime reads this file.
 */
export const TIRE_KNOWLEDGE_VERSION='mx-tires-1';

export type Terrain='sand'|'mud'|'soft'|'soft_intermediate'|'intermediate'|'intermediate_hard'|'hard'|'all_round'|'mini';
export type Position='front'|'rear'|'both';
export type TireLine={brand:string;model:string;terrain:Terrain[];position:Position;note:string;current:boolean;src:string[]};
export type PressureRange={who:string;applies:string;front?:string;rear?:string;both?:string;src:string};
export type TerrainPressure={id:string;terrain:string;direction:string;why:string;maker_figures?:string;watch:string;src:string[]};
export type InsertOption={id:string;name:string;weight:string;feel:string;flat_protection:string;pressure:string;life_and_heat:string;cost:string;install:string;best_for:string;src:string[]};
export type TireSymptom={id:string;rider_says:string[];tire_causes:string[];check:string[];versus_suspension:string;setup_guide?:string;src:string[]};
export type Source={id:string;publisher:string;kind:'tire_maker'|'insert_maker'|'bike_maker'|'series'|'press'|'retailer'|'tester';url:string;published?:string;accessed:string};

/** Every source behind a fact here. Not rider-facing and never sent to the model. Kept in step with SOURCES.md. */
export const TIRE_SOURCES:Source[]=[
 {id:'dunlop-offroad-facts',publisher:'Dunlop Motorcycle Tires (US)',kind:'tire_maker',url:'https://dmt.exults.com/about/off-road-facts',accessed:'2026-11-07'},
 {id:'dunlop-offroad-pdf',publisher:'Dunlop Motorcycle Tires (US), Off-Road Facts PDF',kind:'tire_maker',url:'https://images.motorcycleid.com/dunlop/items/pdf/off-road-facts-information.pdf',accessed:'2026-11-07'},
 {id:'dunlop-care',publisher:'Dunlop Motorcycle Tires (US), Care & Maintenance',kind:'tire_maker',url:'https://dmt.exults.com/care',accessed:'2026-11-07'},
 {id:'dunlop-care-pdf',publisher:'Dunlop Motorcycle Tires (US), Care and Maintenance sheet PDF',kind:'tire_maker',url:'https://images.motorcycleid.com/dunlop/items/pdf/care-and-maintenance-instruction-sheet.pdf',accessed:'2026-11-07'},
 {id:'dunlop-mx34',publisher:'Goodyear Europe newsroom (Dunlop)',kind:'tire_maker',url:'https://news.goodyear.eu/dunlop-introduces-geomax-mx34-next-generation-intermediate-mx-tire/',published:'2023',accessed:'2026-11-07'},
 {id:'dunlop-geomax-eu',publisher:'Dunlop Moto Europe, Geomax range',kind:'tire_maker',url:'https://www.dunlop-moto.com/en_gb/why-dunlop/geomax-range.html',accessed:'2026-11-07'},
 {id:'dunlop-mx12',publisher:'Dunlop Motorcycle Tires (US), Geomax MX12 release',kind:'tire_maker',url:'https://dmt.exults.com/dunlop-introduces-new-geomax-mx12',published:'2017-06-30',accessed:'2026-11-07'},
 {id:'dunlop-track-guide',publisher:'Dunlop track-by-track tire setup (older Geomax lineup), as published by a retailer',kind:'retailer',url:'https://www.motosport.com/blog/dunlop-tire-setup-at-the-top-motocross-tracks',accessed:'2026-11-07'},
 {id:'michelin-choose-mx',publisher:'Michelin, choosing motocross tyres',kind:'tire_maker',url:'https://www.michelin.com.au/motorbike/advice-motorbike/choose-tyres/motocross-tyres',accessed:'2026-11-07'},
 {id:'michelin-pressure-offroad',publisher:'Michelin (US), off-road tire pressure',kind:'tire_maker',url:'https://www.michelinman.com/motorcycle/tips-and-advice/advice-motorbike/tire-pressure/off-road',accessed:'2026-11-07'},
 {id:'michelin-bib-mousse',publisher:'Michelin (US), Bib Mousse and off-road pressure',kind:'tire_maker',url:'https://www.michelinman.com/motorcycle/tips-and-advice/tips-to-take-care-of-motorcycle-tires/tire-pressure-off-road',accessed:'2026-11-07'},
 {id:'michelin-starcross-family',publisher:'Michelin (UK), Starcross family',kind:'tire_maker',url:'https://www.michelin.co.uk/motorbike/browse-tyres/by-family/starcross',accessed:'2026-11-07'},
 {id:'pirelli-mx-catalog',publisher:'Pirelli (US), motocross catalog',kind:'tire_maker',url:'https://pirelli.com/tires/en-us/motorcycle/all-tires/catalog/off-road/motocross',accessed:'2026-11-07'},
 {id:'pirelli-offroad-2026',publisher:'Pirelli, Off-road flyer 2026 (German)',kind:'tire_maker',url:'https://tyre24.pirelli.com/moto/assets/pirelli/pdf/global/TDB/PI-Offroad-Flyer2026-DE.pdf',published:'2026',accessed:'2026-11-07'},
 {id:'pirelli-mini-os-2020',publisher:'Pirelli press release (Mini O\'s 2020 tire setup)',kind:'tire_maker',url:'https://vitalmx.com/news/press-release/Pirelli-Releases-Recommended-Tire-Setup-for-Upcoming-Thor-Mini-O-s-Amateur-Motocross-National,21786',published:'2020-11-17',accessed:'2026-11-07'},
 {id:'bridgestone-x31',publisher:'Bridgestone Tires (US), Battlecross X31',kind:'tire_maker',url:'https://tires.bridgestone.com/en-us/tires/motorcycle/battlecross/x31',accessed:'2026-11-07'},
 {id:'bridgestone-gripping',publisher:'Bridgestone Gripping Stories (Bridgestone motorcycle)',kind:'tire_maker',url:'https://grippingstories.com/?p=573',published:'2018-06-05',accessed:'2026-11-07'},
 {id:'bridgestone-x40-dealer',publisher:'Dealer listing, Battlecross X40 sizes',kind:'retailer',url:'https://discountmotorcycletyres.com.au/products/bridgestone-battlecross-x40',accessed:'2026-11-07'},
 {id:'maxxis-offroad',publisher:'Maxxis (US), moto off-road',kind:'tire_maker',url:'https://www.maxxis.com/us/tires/motorcycle/moto-off-road/',accessed:'2026-11-07'},
 {id:'maxxis-guide-au',publisher:'Maxxis dirt bike tyre guide (Australian press)',kind:'press',url:'https://transmoto.com.au/maxxis-dirt-bike-tyre-guide',accessed:'2026-11-07'},
 {id:'kenda-guide',publisher:'Dirt bike tire buyer\'s guide, Kenda page (retailer)',kind:'retailer',url:'https://dirtbikes.com/dirtbike-tires-buyers-guide/4',accessed:'2026-11-07'},
 {id:'kenda-dealer',publisher:'Dealer listings with Kenda terrain designations',kind:'retailer',url:'https://www.blackcircles.com/brands/kenda/washougal-iii-k7102--motocross-intermed-terr-not-for-highway-use',accessed:'2026-11-07'},
 {id:'shinko-520',publisher:'Retail listing, Shinko 520',kind:'retailer',url:'https://www.revzilla.com/motorcycle/shinko-520-series-intermediate-hard-tires',accessed:'2026-11-07'},
 {id:'shinko-546-525',publisher:'Retail listings, Shinko 546 and 525 terrain titles',kind:'retailer',url:'https://www.jpcycles.com/product/shinko-546-series-soft-intermediate-tires',accessed:'2026-11-07'},
 {id:'irc-vx40',publisher:'Cycle News product note, IRC VX40',kind:'press',url:'https://www.cyclenews.com/2023/02/article/irc-vx40-tire/',published:'2023-02-19',accessed:'2026-11-07'},
 {id:'irc-vx30',publisher:'Retail listing, IRC VX30 soft/intermediate',kind:'retailer',url:'https://www.rockymountainatvmc.com/tires-and-wheels/irc-vx30-soft-intermediate-terrain-tire-p?v=2352',accessed:'2026-11-07'},
 {id:'mitas-terraforce',publisher:'Mitas press room, Terra Force-MX',kind:'tire_maker',url:'https://www.mitas-moto.com/en/media-and-events/press-room/mitas-launching-new-motocross-competition-tires-terra-force-mx',published:'2019-03-25',accessed:'2026-11-07'},
 {id:'mitas-pressures',publisher:'Mitas recommended inflation pressures (PDF)',kind:'tire_maker',url:'https://www.mitas-moto.com/~/media/mitas-moto/technology-and-safety/mitas-recommended-inflation-pressures.pdf?la=en',accessed:'2026-11-07'},
 {id:'metzeler-mc360',publisher:'Metzeler, MC360 Mid Hard',kind:'tire_maker',url:'https://www.metzeler.com/en-ww/products/tyres/mc-360-mid-hard',accessed:'2026-11-07'},
 {id:'nuetech-tubliss-guide',publisher:'Nuetech TUbliss guide (PDF)',kind:'insert_maker',url:'https://images.motorcycleid.com/nuetech/items/pdf/guide.pdf',accessed:'2026-11-07'},
 {id:'tubliss-kit-listing',publisher:'Retail listing reproducing Nuetech TUbliss Gen 2.0 kit details',kind:'retailer',url:'https://tripleclampmoto.ca/products/nuetech-tubliss-gen-2-0-system',accessed:'2026-11-07'},
 {id:'nitromousse-listing',publisher:'Retail listing, Nuetech Nitromousse Platinum / Plushie',kind:'retailer',url:'https://www.tmbrmoto.com/products/nitromousse-platinum-equivilent-to-10-12-psi',accessed:'2026-11-07'},
 {id:'mousse-guide-retailer',publisher:'Retailer guide to tire mousse',kind:'retailer',url:'https://motosport.com/blog/tire-mousse-a-guide-to-foam-tubes-and-flat-free-tires',accessed:'2026-11-07'},
 {id:'pressure-guide-retailer',publisher:'Retailer guide to dirt bike tire pressure',kind:'retailer',url:'https://motosport.com/blog/how-to-get-ideal-dirt-bike-tire-pressure',accessed:'2026-11-07'},
 {id:'replace-guide-retailer',publisher:'Retailer guide, when to replace dirt bike tires',kind:'retailer',url:'https://motosport.com/blog/when-to-replace-dirt-bike-tires',accessed:'2026-11-07'},
 {id:'rimlock-guide-retailer',publisher:'Retailer guide, tire change and rim locks',kind:'retailer',url:'https://de.riskracing.com/blogs/news/dirt-bike-tire-change-when-how-much-balancing-rim-locks',accessed:'2026-11-07'},
 {id:'michelin-uhd-listing',publisher:'Retail listing, Michelin Ultra Heavy Duty tube',kind:'retailer',url:'https://www.24mx.com/en-us/product/michelin-ultra-heavy-duty-4-mm-inner-tube/PM-0001097',accessed:'2026-11-07'},
 {id:'tubliss-test',publisher:'Independent test, TUbliss Gen 2.0',kind:'tester',url:'https://dirtbiketest.com/product-tests/nuetech-tubliss-gen-2-0/',published:'2021-10-11 (last modified)',accessed:'2026-11-07'},
 {id:'nitromousse-test',publisher:'Independent test, Nitro Mousse',kind:'tester',url:'https://dirtbiketest.com/product-tests/nuetech-nitro-mousse/',published:'2017 (images), 2021-10-11 (last modified)',accessed:'2026-11-07'},
 {id:'wsx-tyres',publisher:'FIM World Supercross Championship, Tech Tuesday: tyres',kind:'series',url:'https://worldsupercrosschampionship.com/tech-tuesday-the-importance-of-tyres/',published:'2025-11-25',accessed:'2026-11-07'},
 {id:'bike-manuals',publisher:'Bike makers\' owner\'s manuals already in BAK research (KTM, Husqvarna, GasGas, Kawasaki)',kind:'bike_maker',url:'docs/research/knowledge/manual_specs_b.json; manual_specs_c.json; kawasaki_manuals.json',accessed:'2026-11-07'},
];

// ---------------------------------------------------------------------------------------------------------------
// Tire lines. Terrain words are the maker's own designation where the maker publishes one; see SOURCES.md.
// current:false marks an older line that still ships as original equipment or sits in riders' garages.
export const tireLines:TireLine[]=[
 {brand:'Dunlop',model:'Geomax MX34',terrain:['soft_intermediate'],position:'both',note:'Soft to intermediate with the emphasis on softer dirt; also used from hard-packed to loose loam. Successor to the MX33; mini to big-bike sizes.',current:true,src:['dunlop-mx34','dunlop-offroad-facts']},
 {brand:'Dunlop',model:'Geomax MX14',terrain:['sand','mud'],position:'rear',note:'Rear for deep sand and mud only.',current:true,src:['dunlop-geomax-eu','dunlop-offroad-facts']},
 {brand:'Dunlop',model:'Geomax MX53',terrain:['intermediate_hard','hard'],position:'both',note:'Intermediate to hard pack. An MX53 front with an MX34 rear is Dunlop\'s mixed intermediate pairing.',current:true,src:['dunlop-geomax-eu','dunlop-offroad-facts','dunlop-mx34']},
 {brand:'Dunlop',model:'Geomax MX71',terrain:['hard'],position:'both',note:'Hard terrain (listed in Dunlop\'s European range).',current:true,src:['dunlop-geomax-eu']},
 {brand:'Dunlop',model:'Geomax MX33',terrain:['soft_intermediate'],position:'both',note:'Soft, mud and intermediate; replaced by the MX34 and still fitted as original equipment on many bikes.',current:false,src:['dunlop-geomax-eu','dunlop-mx34','bike-manuals']},
 {brand:'Dunlop',model:'Geomax MX3S',terrain:['soft_intermediate'],position:'both',note:'Older soft-to-intermediate line, original equipment on many bikes before the MX33 and MX34.',current:false,src:['bike-manuals']},
 {brand:'Dunlop',model:'Geomax MX12',terrain:['sand','mud'],position:'both',note:'Older sand and mud line, made for 21-inch front and 19-inch rear.',current:false,src:['dunlop-mx12']},
 {brand:'Michelin',model:'Starcross 6 Sand',terrain:['sand'],position:'both',note:'Michelin puts the Sand on both ends for sand.',current:true,src:['michelin-choose-mx']},
 {brand:'Michelin',model:'Starcross 6 Mud',terrain:['mud'],position:'rear',note:'Rear for mud; Michelin pairs it with a Starcross 6 Medium Soft front.',current:true,src:['michelin-choose-mx']},
 {brand:'Michelin',model:'Starcross 6 Medium Soft',terrain:['soft','soft_intermediate'],position:'both',note:'Soft to intermediate ground a finger can push into; the more comfortable of the two middle tires.',current:true,src:['michelin-choose-mx','michelin-starcross-family']},
 {brand:'Michelin',model:'Starcross 6 Medium Hard',terrain:['intermediate'],position:'both',note:'Intermediate; more responsive than the Medium Soft, especially on the gas.',current:true,src:['michelin-choose-mx','michelin-starcross-family']},
 {brand:'Michelin',model:'Starcross 6 Hard',terrain:['hard'],position:'both',note:'Dry, compacted ground with or without stones, where a finger will not go in; Michelin\'s pick for supercross.',current:true,src:['michelin-choose-mx']},
 {brand:'Michelin',model:'Starcross 5 Mini',terrain:['mini'],position:'both',note:'Michelin\'s line for small bikes.',current:true,src:['michelin-starcross-family']},
 {brand:'Pirelli',model:'Scorpion MX32 Mid Soft',terrain:['soft_intermediate'],position:'both',note:'Soft (mud, sand) through intermediate (dry soil, gravel); new generation from 2025; minicross sizes too.',current:true,src:['pirelli-mx-catalog','pirelli-offroad-2026']},
 {brand:'Pirelli',model:'Scorpion MX32 Mid Hard',terrain:['intermediate_hard'],position:'both',note:'Medium to hard ground.',current:true,src:['pirelli-mx-catalog','pirelli-offroad-2026']},
 {brand:'Pirelli',model:'Scorpion MX Soft',terrain:['sand','mud','soft'],position:'rear',note:'Rear for very soft ground: mud, sand and soft clay.',current:true,src:['pirelli-mx-catalog','pirelli-offroad-2026']},
 {brand:'Pirelli',model:'Scorpion MX Extra X',terrain:['all_round'],position:'both',note:'Long-lasting all-rounder for practice and amateur racing on mixed terrain.',current:true,src:['pirelli-mx-catalog','pirelli-offroad-2026']},
 {brand:'Bridgestone',model:'Battlecross X10',terrain:['sand','mud'],position:'both',note:'Sand and mud.',current:true,src:['bridgestone-gripping']},
 {brand:'Bridgestone',model:'Battlecross X20',terrain:['soft'],position:'both',note:'Soft and muddy ground.',current:true,src:['bridgestone-gripping']},
 {brand:'Bridgestone',model:'Battlecross X31',terrain:['intermediate'],position:'both',note:'A true intermediate that copes with soft and hard; successor to the X30.',current:true,src:['bridgestone-x31']},
 {brand:'Bridgestone',model:'Battlecross X40',terrain:['intermediate_hard','hard'],position:'both',note:'Medium to hard terrain.',current:true,src:['bridgestone-gripping','bridgestone-x40-dealer']},
 {brand:'Maxxis',model:'Maxxcross MX-ST',terrain:['soft','sand'],position:'both',note:'Soft, loamy and sandy tracks; the MX-ST+ is original equipment on several European bikes, including 85s.',current:true,src:['maxxis-guide-au','bike-manuals']},
 {brand:'Maxxis',model:'Maxxcross MX-SI',terrain:['soft_intermediate'],position:'both',note:'Soft to intermediate.',current:true,src:['maxxis-offroad','maxxis-guide-au']},
 {brand:'Maxxis',model:'Maxxcross MX-IH',terrain:['intermediate_hard'],position:'both',note:'Intermediate to hard, including rocky and blue-groove hard pack.',current:true,src:['maxxis-offroad','maxxis-guide-au']},
 {brand:'Maxxis',model:'Maxxcross SM',terrain:['sand','mud'],position:'both',note:'Mud and sand.',current:true,src:['maxxis-offroad']},
 {brand:'Kenda',model:'Southwick II',terrain:['sand','mud'],position:'both',note:'Sand and mud.',current:true,src:['kenda-guide']},
 {brand:'Kenda',model:'Millville II',terrain:['soft_intermediate'],position:'both',note:'Soft to intermediate.',current:true,src:['kenda-guide']},
 {brand:'Kenda',model:'Washougal II',terrain:['intermediate'],position:'both',note:'Intermediate.',current:true,src:['kenda-guide']},
 {brand:'Kenda',model:'Washougal III',terrain:['intermediate'],position:'both',note:'Intermediate.',current:true,src:['kenda-dealer']},
 {brand:'Kenda',model:'Sand Mad',terrain:['sand','mud'],position:'rear',note:'Sand and mud rear.',current:true,src:['kenda-guide']},
 {brand:'Kenda',model:'Triple',terrain:['hard'],position:'both',note:'Made for arenacross dirt.',current:true,src:['kenda-guide']},
 {brand:'Shinko',model:'520',terrain:['intermediate_hard'],position:'both',note:'Intermediate and hard.',current:true,src:['shinko-520']},
 {brand:'Shinko',model:'546',terrain:['soft_intermediate'],position:'both',note:'Soft to intermediate.',current:true,src:['shinko-546-525']},
 {brand:'Shinko',model:'525 Hybrid Cheater',terrain:['soft_intermediate'],position:'rear',note:'Soft to intermediate rear.',current:true,src:['shinko-546-525']},
 {brand:'IRC',model:'VX40',terrain:['intermediate_hard'],position:'both',note:'Intermediate to hard.',current:true,src:['irc-vx40']},
 {brand:'IRC',model:'VX30',terrain:['soft_intermediate'],position:'both',note:'Soft to intermediate.',current:true,src:['irc-vx30']},
 {brand:'Mitas',model:'Terra Force-MX Sand',terrain:['sand'],position:'both',note:'Sand and extra-soft terrain.',current:true,src:['mitas-terraforce']},
 {brand:'Mitas',model:'Terra Force-MX SM',terrain:['soft_intermediate'],position:'both',note:'Soft to medium.',current:true,src:['mitas-terraforce']},
 {brand:'Mitas',model:'Terra Force-MX MH',terrain:['intermediate_hard'],position:'both',note:'Medium to hard.',current:true,src:['mitas-terraforce']},
 {brand:'Metzeler',model:'MC360 Mid Soft',terrain:['soft_intermediate'],position:'both',note:'Soft to medium, made to cope with changing ground.',current:true,src:['metzeler-mc360']},
 {brand:'Metzeler',model:'MC360 Mid Hard',terrain:['intermediate_hard'],position:'both',note:'Medium to hard.',current:true,src:['metzeler-mc360']},
];

/** How to choose, in BAK's words. */
export const choosingTires:string[]=[
 'Match the tire to the dirt most of the track is, not the one wet corner: soft or sandy (a finger pushes in), intermediate (loam that packs), or hard (a finger will not go in, shiny or blue-groove).',
 'A soft-to-intermediate tire covers most amateur tracks; a dedicated sand, mud or hard-pack tire is worth it when that is the track every week.',
 'Soft-terrain tires have taller, wider-spaced knobs that dig in and clean out; hard-terrain tires have more, lower knobs with more rubber on the ground. A soft tire on hard pack squirms and tears knobs; a hard tire in loam or sand will not dig and fills up.',
 'Mixing is normal: an intermediate or hard front with a softer rear, or a scoop or paddle-style rear only for deep sand and mud. Fit front-marked tires to the front and rear-marked tires to the rear.',
 'Many makers designate the terrain in the name (Soft, Mid Soft, Medium Hard, Mid Hard, Sand, Mud, SM, MH, SI, IH); the same word does not mean the same compound from one brand to the next.',
 'Off-road and enduro tires with an 18-inch rear (and adventure, dual-sport, trials and rally tires) are made for other bikes and riding; they are not motocross tires.',
];

/** Common sizes. From bike makers' manuals in BAK's research and tire makers' size lists. */
export const sizes={
 full_size_front:'80/100-21 is the stock front on full-size motocross bikes; 90/100-21 is the wider option with a bigger footprint, which some riders prefer in sand and others find heavier steering. Some pros prefer the narrower front on soft, rutted stadium dirt.',
 rear_19:'19-inch rears: 100/90-19 (125s and some 250s), 110/90-19 (most 250F and 350, and many European-market 450s), 120/80-19 (many US-market 450s). The second number is the sidewall height as a percentage of the width, so a 120/80 is wider and lower than a 110/90 at a similar overall diameter.',
 rear_18:'18-inch rears (110/100-18, 120/90-18, 140/80-18) are fitted to cross-country and enduro models, not motocross models.',
 big_wheel_85:'85cc: small wheel 70/100-17 front with 90/100-14 rear; big wheel 70/100-19 front with 90/100-16 rear.',
 minis:'Smaller minis run 10-, 12- and 14-inch sizes (for example 2.50-10, 2.75-10, 60/100-12, 60/100-14, 80/100-12); take the size from the bike\'s manual.',
 rule:'Take the size from the bike maker\'s manual for the exact model and year; a size change moves the overall diameter, the feel of the gearing and clearance at the swingarm and chain guide.',
 src:['bike-manuals','pirelli-offroad-2026','mitas-terraforce','dunlop-offroad-facts','wsx-tyres'],
};

// ---------------------------------------------------------------------------------------------------------------
// Pressure.
export const pressureRules:string[]=[
 'Start from the bike maker\'s cold pressure for the exact bike when it is known; tire makers\' ranges are general guidance only.',
 'Set it cold, at the track, with a gauge that reads in quarter-psi steps; recheck after a few laps on a hot day, when pressure can rise several psi. Never bleed a hot tire down to the cold figure.',
 'Move about 1 psi at a time and test the same section. Lower gives more footprint and grip in soft or slick dirt; higher protects the rim and holds the carcass stable over rocks, square edges and hard landings.',
 'Stop going lower at the first rim strike, pinch flat, squirm in turns or a valve stem that starts to lean.',
 'A mousse has no pressure to set: its feel is fixed and softens with use. TUbliss: the inner core must be at its full pressure before every ride, and the tire itself can run lower than with a tube.',
 'Elevation and temperature change the reading: check where you ride, not at home the night before.',
];
export const pressureRanges:PressureRange[]=[
 {who:'Dunlop',applies:'Hard and intermediate conditions',front:'12.5–13.5 psi',rear:'14 psi',src:'dunlop-offroad-facts'},
 {who:'Dunlop',applies:'Soft conditions',front:'12.5–13.5 psi',rear:'11–12 psi',src:'dunlop-offroad-facts'},
 {who:'Dunlop',applies:'Minis',both:'13–14 psi',src:'dunlop-offroad-facts'},
 {who:'Michelin',applies:'Starcross 6, with a tube',both:'0.9 bar (13.1 psi) recommended, 0.8 bar (11.6 psi) minimum',src:'michelin-pressure-offroad'},
 {who:'Michelin',applies:'Starcross 5 Mini, with a tube',both:'1.2 bar (17.4 psi) recommended, 1.0 bar (14.5 psi) minimum',src:'michelin-pressure-offroad'},
 {who:'Mitas',applies:'Motocross hard terrain',both:'10–12 psi (0.66–0.80 bar)',src:'mitas-pressures'},
 {who:'Mitas',applies:'Motocross intermediate and soft terrain',both:'12–14 psi (0.80–0.93 bar)',src:'mitas-pressures'},
 {who:'Pirelli',applies:'Event guide for a Florida amateur national (sandy loam), all tires',both:'14 psi',src:'pirelli-mini-os-2020'},
];
export const pressureDisagreement='Makers differ on hard pack: Dunlop keeps the rear at its highest figure on hard and intermediate dirt, while Mitas lists its lowest range for hard terrain. Hard and smooth or slick favours a little lower for grip; hard with rocks, square edges or big landings favours higher to protect the rim.';
export const terrainPressure:TerrainPressure[]=[
 {id:'sand',terrain:'Sand and deep soft dirt',direction:'Toward the low end of the range, mostly at the rear.',why:'A softer carcass spreads into a longer footprint and floats rather than digging.',maker_figures:'Dunlop drops the rear to 11–12 psi in soft conditions; Michelin\'s minimum with a tube is 0.8 bar (11.6 psi).',watch:'Buried rocks and hard landings in sand still pinch tubes; stop at the first rim strike.',src:['dunlop-offroad-facts','michelin-pressure-offroad']},
 {id:'mud',terrain:'Mud',direction:'Usually unchanged, or a little lower if the track slows and grip is the problem; the bigger gain is a mud or sand tire.',why:'Lower pressure can help the knobs bite, but mud hides rocks and ruts, and a heavy, mud-packed bike hits harder.',maker_figures:'No tire maker publishes a separate mud pressure.',watch:'Clean packed mud from the tread; it hurts grip on the next ride.',src:['michelin-pressure-offroad']},
 {id:'hard_slick',terrain:'Hard pack and slick, smooth',direction:'A little lower within the range for grip, if there are no square edges or rocks.',why:'More footprint and a carcass that conforms to a hard surface rather than skating over it.',maker_figures:'Mitas lists 10–12 psi for hard terrain; Dunlop keeps the rear at 14 psi.',watch:'Lower pressure puts more force through tire and wheel on hard hits.',src:['mitas-pressures','dunlop-offroad-facts','wsx-tyres']},
 {id:'rocks',terrain:'Rocks, roots, square edges, big landings',direction:'Higher within the range.',why:'Protects the rim and tube from pinching and keeps the tire from folding on edges.',maker_figures:'In Dunlop\'s track guide, rocky outdoor tracks got a rear about 1 psi higher than the same tire elsewhere.',watch:'Too high deflects and loses grip; that feels like harsh suspension.',src:['michelin-pressure-offroad','dunlop-track-guide']},
 {id:'sticky_prepped',terrain:'Sticky, prepared or watered dirt',direction:'Slightly higher can calm a tire that grabs and folds.',why:'A firmer carcass on tacky dirt reduces the grabby, rolling feel.',watch:'Recheck as the track dries; it changes through the day.',src:['wsx-tyres']},
 {id:'heat',terrain:'Hot days and long motos',direction:'Set cold and allow for the rise.',why:'Heat raises pressure through the moto; the tire feels firmer late on.',watch:'Do not set it hot to the cold figure.',src:['pressure-guide-retailer','michelin-pressure-offroad']},
];

// ---------------------------------------------------------------------------------------------------------------
// Tubes, heavy-duty tubes, mousse, TUbliss.
export const inserts:InsertOption[]=[
 {id:'standard_tube',name:'Standard tube',weight:'Lightest of the usual options.',feel:'Lively; pressure tunes the feel.',flat_protection:'Least: pinch flats when run low or on rocks.',pressure:'Fully adjustable.',life_and_heat:'Fit a new tube with each new tire; old tubes stretch and crease.',cost:'Cheapest.',install:'Standard tire change; rim lock needed.',best_for:'Most motocross, and supercross pros run tubes front and rear for low weight and a livelier bike.',src:['dunlop-care-pdf','wsx-tyres']},
 {id:'heavy_duty_tube',name:'Heavy-duty or ultra-heavy-duty tube',weight:'A heavy-duty tube is about 2–3 lb; ultra-heavy-duty walls are around 4 mm thick.',feel:'Slightly deader than a standard tube, still adjustable.',flat_protection:'Much better pinch and puncture resistance, but it can still go flat.',pressure:'Fully adjustable.',life_and_heat:'Same care as a standard tube.',cost:'More than a standard tube, far less than a mousse.',install:'Standard tire change, a little harder to fit.',best_for:'Riders who flat at rocky tracks and want to keep a pressure they can tune.',src:['mousse-guide-retailer','michelin-uhd-listing']},
 {id:'mousse',name:'Mousse (foam insert: Michelin Bib Mousse, Nuetech Nitromousse and others)',weight:'Heavier: about 4.5–5 lb on average, roughly double a tube.',feel:'Damped and dead compared with a tube; new mousses start firm and soften with use.',flat_protection:'No flats from punctures or pinches.',pressure:'None to set. Michelin gives its Bib Mousse a 0.8–1.0 bar (11.6–14.5 psi) feel; Pirelli says a new mousse feels like about 0.7 bar (±0.1); Nitromousse Platinum aims at a 10–12 psi feel and the Plushie at 6–8 psi (slow technical riding).',life_and_heat:'Michelin: use within 6 months of fitting, much less in motocross than enduro; keep under 130 km/h (80 mph); avoid above 40°C and store below 30°C. Heat from wheelspin followed by hard whoops is the hardest case.',cost:'Roughly the price of several heavy-duty tubes each.',install:'Hard: lots of gel (every fit, new or used), tire spoons, often a bead tool and a second pair of hands; seal spoke nipples and keep the rim lock. Bib Mousse is made for Michelin tires.',best_for:'Off-road racing and riders who cannot afford a flat; some motocross riders run one in the rear only. A soft or worn mousse can feel like low pressure.',src:['michelin-bib-mousse','pirelli-offroad-2026','nitromousse-listing','mousse-guide-retailer','nitromousse-test']},
 {id:'tubliss',name:'TUbliss (Nuetech tubeless system)',weight:'Lighter than a tube: about a pound less than a standard rear tube and up to about 2 lb less than heavy-duty tubes; kits weigh under 2 lb including the lock.',feel:'Tubeless feel; lets the tire run lower for grip.',flat_protection:'No pinch flats; the high-pressure core holds the bead on the rim and protects it. Punctures can be plugged at the track; sealant goes in the tire only.',pressure:'Core at 100 psi before every ride (it loses about 1 psi a day and some at every gauge check). The tire can run at least 2 psi lower than with a tube; go down 1 psi at a time.',life_and_heat:'Two pressures to check; a loose valve core is the usual fault.',cost:'Similar to a mousse per wheel.',install:'New tires only (not ones mounted with a standard rim lock), no tire machine, smooth spoons; the core takes the place of the rim lock. Works on dented rims. Big-wheel kits are 18, 19 and 21 inch.',best_for:'Off-road and rocky tracks where low pressure and no pinch flats matter; off-road use only.',src:['nuetech-tubliss-guide','tubliss-kit-listing','tubliss-test']},
];
export const insertPractice='In motocross most amateurs run tubes. Supercross pros run tubes front and rear; some outdoor and world-championship riders run mousse, and mousse and TUbliss are common in off-road racing. No published motocross rule against them was found here; check the series rulebook.';

// ---------------------------------------------------------------------------------------------------------------
// Wear, replacement, rim locks, mounting.
export const wear={
 signs:[
  'Knob edges rounded off: on the rear look at the leading (drive) face of the centre knobs, on the front the side knobs that hold the bike in turns.',
  'Knobs torn, chunked or missing; cracks at the base of the knobs or in the grooves between them; cuts into the carcass.',
  'Rubber gone grey and hard from age or storage; thin, bald spots on the sidewall.',
  'Stress cracks in the tread grooves point to overload or under-inflation and mean replace now.',
 ],
 when:[
  'Replace when the edges are gone or knobs are tearing, not when the tire is bald: grip goes long before the rubber does.',
  'The rear wears much faster than the front; a fresh rear makes the biggest difference off the start and out of corners.',
  'A new front with a badly worn rear can make the bike unstable; replace them together when the rear is worn out.',
  'Rubber ages even unused: a tire over a year old that also shows wear is due; Dunlop wants tires over 5 years old inspected yearly and replaced at 10 years from manufacture.',
 ],
 rim_locks:[
  'The rim lock stops the tire slipping round the rim under braking and drive, which tears the valve stem out of the tube.',
  'Tighten it after the bead is seated and before setting pressure; check it before every ride.',
  'A valve stem that leans means the tire or tube has moved: let the air out, straighten it and re-seat.',
  'Some rear wheels use two rim locks. With TUbliss the core takes the rim lock\'s place.',
 ],
 mounting:[
  'Lube the beads with soapy water; never go above 40 psi to seat a bead; if it will not seat, deflate, re-lube and try again.',
  'Powder the tube, give it just enough air to hold its shape, keep it out from under the rim lock and away from the spoon, then deflate and reinflate once seated to settle it.',
  'Ride the first laps on a new tire easy until you know where its grip ends, then recheck the pressure once it is cool.',
  'Store tires dry and out of sun, away from motors and chargers (ozone); wipe off fuel at once.',
 ],
 src:['dunlop-care','dunlop-care-pdf','dunlop-offroad-pdf','replace-guide-retailer','rimlock-guide-retailer','wsx-tyres','nuetech-tubliss-guide'],
};

// ---------------------------------------------------------------------------------------------------------------
// Handling complaints where the tire is a likely cause. These overlap setup_knowledge symptom guides; check the tire first.
export const tireSymptoms:TireSymptom[]=[
 {id:'front-push',rider_says:['front pushes','front washes','front slides','won’t turn','plows','front won’t bite'],tire_causes:['Front side knobs rounded off.','Front too hard for the dirt, or a hard-pack tire in loam or sand.','Front pressure too high (small footprint), or so low it rolls and squirms.'],check:['Look at the front side knobs.','Front pressure cold, against the bike maker\'s figure.'],versus_suspension:'A worn or wrong front pushes on every kind of corner and gets worse as it wears; a setup push depends on on- or off-gas and where in the turn.',setup_guide:'front-push',src:['replace-guide-retailer','michelin-choose-mx']},
 {id:'rear-traction',rider_says:['won’t hook up','spins','no traction','rear slides','no drive','rear steps out'],tire_causes:['Rear drive edges rounded; old, hardened rubber.','Rear compound wrong for the dirt.','Rear pressure too high for soft or slick dirt.'],check:['Look at the leading face of the rear centre knobs.','Rear pressure cold.','Does it spin on smooth ground too? Then tire, power delivery or technique; if it skips over chop, suspension.'],versus_suspension:'A worn rear spins everywhere, more on hard pack and off the start; suspension traction loss shows over bumps and chop.',setup_guide:'no-drive',src:['replace-guide-retailer','wsx-tyres']},
 {id:'deflect-harsh',rider_says:['deflects','skates','pings off','harsh on small bumps','bounces off'],tire_causes:['Pressure too high.','A hard compound or a new stiff carcass on hard, choppy dirt; a fresh mousse.'],check:['Pressures cold, then 1 psi lower as a test before any clicker change.'],versus_suspension:'Tire deflection is sharp and small and changes with pressure; suspension harshness changes with the clickers.',setup_guide:'deflect',src:['michelin-pressure-offroad','wsx-tyres']},
 {id:'squirm-vague',rider_says:['squirms','vague','rolls in turns','wallows','rim strikes','pinch flat','feels flat'],tire_causes:['Pressure too low, or a slow leak.','A mousse near the end of its life feels like a tube at low pressure.','A soft-terrain tire on hard pack, knobs folding.'],check:['Pressure cold; check for a leak or a leaning valve stem.','Mousse age and hours.'],versus_suspension:'Tire squirm is a lazy, rolling feel at lean and under braking; suspension wallow is the chassis pitching front to rear.',src:['michelin-pressure-offroad','nitromousse-test','michelin-bib-mousse']},
 {id:'hop-shake',rider_says:['hops','vibrates','headshake','wobbles at speed','shakes'],tire_causes:['Uneven wear or a bulge, a bead not seated evenly, a tire slipped on the rim.','A new front with a worn rear.','Front pressure wrong.'],check:['Spin the wheel and watch the bead line and the tire for a flat spot or bulge.','Wheel true and spokes tight.','Front pressure.'],versus_suspension:'A tire hop repeats with wheel speed and happens on smooth flat ground; headshake from setup comes with bumps, braking or acceleration.',setup_guide:'headshake',src:['replace-guide-retailer','dunlop-care-pdf','dunlop-care']},
];
export const tireAsk='Did it start after tires were changed, or as they wore, or after a setting change? Check pressures cold and look at the knobs before any clicker change.';

// ---------------------------------------------------------------------------------------------------------------
// Supercross and pro practice, in general terms.
export const proPractice:string[]=[
 'Stadium dirt is prepared and often soft and rutted; tire makers bring several fronts and rears to each round and riders pick for the dirt.',
 'Factory tires are lighter, softer and roll more than the stock versions, which are stiffer and can run lower pressure.',
 'A mid-soft compound is often preferred for whoops because harder compounds deflect more; scoop-style rears come out for sand sections.',
 'Supercross riders run tubes front and rear, for weight and a livelier bike.',
 'One set can last an elite rider a full round, but many fit a fresh rear for the main event, mainly for the start.',
 'An amateur on a normal track gains more from a fresh intermediate tire at the right pressure than from copying a pro stadium setup.',
];
const proSrc=['wsx-tyres','michelin-choose-mx'];

// ---------------------------------------------------------------------------------------------------------------
// Gating and selection.
const TERRAIN_WORDS:[Terrain,RegExp][]=[
 ['sand',/\b(sand|sandy|dunes?|southwick|scoop|paddle)\b/i],
 ['mud',/\b(mud|muddy|wet|rain|slop)\b/i],
 ['soft',/\b(soft|loam|loamy|deep|tilled|ripped)\b/i],
 ['intermediate',/\b(intermediate|mid|medium|mixed|all[- ]round|everything)\b/i],
 ['hard',/\b(hard ?pack|hardpack|hard|clay|slick|blue[- ]?groove|dry|rocky|rocks?|concrete)\b/i],
];
const TIRE_WORD=/\b(tires?|tyres?|knobb(y|ies)|knobs?|tread|carcass|sidewall|beads?|compound|rubber)\b/i;
const BRAND=/\b(dunlop|michelin|pirelli|bridgestone|maxxis|kenda|shinko|irc|mitas|metzeler|geomax|starcross|scorpion|battlecross|maxx ?cross|mx ?3[34s]|mx ?14|mx ?53|mx ?71|mx ?12|mx ?32|mx-?s[timn]\+?|mx-?ih|terra ?force|mc ?360|vx ?[34]0|washougal|millville|southwick ii|sand mad|extra x)\b/i;
const PRESSURE_WORD=/\b(psi|pressures?|inflat\w*|deflat\w*|air (it )?(up|down))\b|\b\d+(\.\d+)?\s?bar\b/i;
const SUSPENSION_AIR=/\b(fork|forks|shock|nitrogen|reservoir|air fork|oil|radiator|fuel|compression)\b/i;
const PRESSURE_CONTEXT=/\b(front|rear|sand|mud|hard ?pack|rocks?|track|run|running|minis?|85|65|mousse|tube|tubliss)\b/i;
const NON_TIRE_TUBES=/\b(fork|upper|lower|outer|inner fork|head|frame|exhaust|down|top|throttle|pitot|breather|vent|overflow)\s+tubes?\b|\btubes? (in|through|above|showing|height)\b/gi;
const INSERT_WORD=/\b(mousses?|bib ?mousse|nitro ?mousse|nitromousse|tubliss|tubeless|inner ?tubes?|heavy[- ]duty tubes?|uhd|tubes?|foam insert)\b/i;
const FLAT_WORD=/\b(pinch(ed)? flats?|flat tires?|flat tyres?|got a flat|get(ting)? (a )?flats?|keep flatting|flatted|flats? (every|all the time|at)|punctur\w*|valve stems?|rim ?locks?|rim strikes?|dinged rims?|bent rims?)\b/i;
const WEAR_WORD=/\b(worn|wear(s|ing)?|replace|new (tires?|tyres?|rear|front)|last(s)?|knobs? (torn|tearing|rounded|chunk\w*|missing)|chunk(ing|ed)?|break[- ]?in|mount(ing)?|change (my |the )?(tires?|tyres?|rear|front)|old|age|hours)\b/i;
const CHOICE_WORD=/\b(which|best|recommend|choose|pick|should i (run|get|buy|use)|compare|vs\.?|versus|better|good for|for (sand|mud|hard|soft))\b/i;
const SIZE_WORD=/\b\d{2,3}\/\d{2,3}[- ]?\d{2}\b|\b(18|19|21)[- ]?(inch|in\b|")|\b(big|small) wheel\b/i;
const SX_WORD=/\b(supercross|stadium|arenacross|sx (tires?|tyres?)|pro (tires?|tyres?)|factory tires?)\b/i;
const SYMPTOM_WORDS:[string,RegExp][]=[
 ['front-push',/\b(front (end )?(pushes|push|pushing|washes|wash(es|ing)? out|slides?|sliding|plows?|won.?t bite)|washes out|won.?t turn|plows?)\b/i],
 ['rear-traction',/\b(won.?t hook ?up|hook(s|ing)? up|no (traction|drive|grip)|traction|wheel ?spin|spins|spinning|rear (slides?|steps? out|breaks? loose)|grip)\b/i],
 ['deflect-harsh',/\b(deflects?|deflecting|skates?|skating|pings? off|bounces? off)\b/i],
 ['squirm-vague',/\b(squirm\w*|vague|rolls? (over )?in (the )?turns?|rim strikes?|pinch flats?|feels? flat)\b/i],
 ['hop-shake',/\b(hops?|hopping|vibrat\w*|headshake|wobbl\w*|shakes? at speed)\b/i],
];
const NOT_TRACTION=/\btraction control\b/gi;
const OTHER_DOMAIN=/\b(jet(s|ting)?|carb|map|ecu|clickers?|sag|valve clearance|piston|clutch|chain|sprockets?|gearing|brakes?|pads?|coolant|oil change|air filter|spark|plug|exhaust|pipe)\b/i;

export type TireTopic='pressure'|'choice'|'inserts'|'wear'|'sizes'|'symptoms'|'pro';
export type TireSection={version:string;boundary:string;topics:TireTopic[];from_history?:boolean;[k:string]:unknown};

function topicsOf(raw:string):{topics:Set<TireTopic>;symptoms:string[]}{
 const text=raw.replace(NON_TIRE_TUBES,' ');
 const tire=TIRE_WORD.test(text)||BRAND.test(text);
 const t=new Set<TireTopic>();
 const pressure=PRESSURE_WORD.test(text);
 if(pressure&&(tire||(!SUSPENSION_AIR.test(text)&&PRESSURE_CONTEXT.test(text))))t.add('pressure');
 if(INSERT_WORD.test(text))t.add('inserts');
 if(FLAT_WORD.test(text)){t.add('inserts');t.add('wear');}
 if(tire&&WEAR_WORD.test(text))t.add('wear');
 // Tire choice: a brand or model named, or a tire question that asks which/best. A terrain word alone only counts when
 // the question is not already about pressure, inserts or wear ("what pressure for sand" is a pressure question).
 if(BRAND.test(text)||(tire&&!t.has('pressure')&&CHOICE_WORD.test(text))||(tire&&!t.size&&TERRAIN_WORDS.some(([,rx])=>rx.test(text))))t.add('choice');
 // A metric tire size (120/80-19) is a tire question by itself; "19 inch" needs a wheel or tire word with it.
 if(/\b\d{2,3}\/\d{2,3}[- ]?\d{2}\b/.test(text)||(SIZE_WORD.test(text)&&(tire||/\b(rear|front|wheel)\b/i.test(text))))t.add('sizes');
 if(SX_WORD.test(text)&&(tire||/\b(factory|pros?)\b.*\b(run|use)\b/i.test(text)))t.add('pro');
 const symptomText=text.replace(NOT_TRACTION,' ').replace(/\b(grips|grip glue|grip tape)\b/gi,' ');
 const symptoms=SYMPTOM_WORDS.filter(([,rx])=>rx.test(symptomText)).map(([id])=>id);
 if(symptoms.length)t.add('symptoms');
 if(tire&&!t.size)t.add('choice');
 return {topics:t,symptoms};
}

const strip=<T,>(o:T):T=>JSON.parse(JSON.stringify(o,(k,v)=>k==='src'?undefined:v));
const TERRAIN_LABEL:Record<Terrain,string>={sand:'sand',mud:'mud',soft:'soft',soft_intermediate:'soft to intermediate',intermediate:'intermediate',intermediate_hard:'intermediate to hard',hard:'hard',all_round:'all-round',mini:'minis'};
const posLabel=(p:Position)=>p==='both'?'F/R':p==='front'?'front':'rear';
const lineText=(l:TireLine)=>`${l.brand} ${l.model} (${posLabel(l.position)}${l.current?'':', older line'}): ${l.note}`;
const ADJACENT:Record<string,Terrain[]>={sand:['sand','soft'],mud:['mud','sand'],soft:['soft','soft_intermediate','sand'],intermediate:['intermediate','soft_intermediate','intermediate_hard','all_round'],hard:['hard','intermediate_hard']};

/** Names distinctive enough to identify a line on their own (generic words like "Sand" or "Medium Soft" are not). */
const modelKey=(l:TireLine)=>{const m=l.model.replace(/^(Geomax|Battlecross|Maxxcross|Scorpion|Terra Force-MX|Starcross)\s*/,'');
 return /\d/.test(m)||/Washougal|Millville|Southwick|Sand Mad|Extra X|Cheater/.test(m)?m.replace(/[+]/g,'').replace(/[\s-]+/g,'[\\s-]*'):null;};
export function brandsIn(text:string):string[]{
 return [...new Set(tireLines.filter(l=>{const k=modelKey(l);return new RegExp(`\\b${l.brand}\\b`,'i').test(text)||(k!==null&&new RegExp(`\\b${k}\\b`,'i').test(text));}).map(l=>l.brand))];
}
function selectLines(text:string,budgetLines:number){
 const brands=brandsIn(text);
 const terrains=TERRAIN_WORDS.filter(([,rx])=>rx.test(text)).map(([t])=>t);
 const wantFront=/\bfront\b/i.test(text)&&!/\brear\b/i.test(text),wantRear=/\brear\b/i.test(text)&&!/\bfront\b/i.test(text);
 let pool=tireLines.filter(l=>!(wantFront&&l.position==='rear')&&!(wantRear&&l.position==='front'));
 const allowed=new Set(terrains.flatMap(t=>ADJACENT[t]??[t]));
 if(/\b(minis?|50s?|65s?|85s?|supermini|pee ?wee)\b/i.test(text)){allowed.add('mini');terrains.push('mini');}
 const named=(l:TireLine)=>{const k=modelKey(l);return k!==null&&new RegExp(`\\b${k}\\b`,'i').test(text)||new RegExp(`\\b${l.brand}\\s+${l.model.replace(/[+]/g,'').replace(/[\s-]+/g,'[\\s-]*')}\\b`,'i').test(text)||(!!l.model.match(/^Starcross 6 /)&&new RegExp(l.model.replace('Starcross 6 ','starcross ?6? ?'),'i').test(text));};
 const asked=tireLines.filter(named);
 const score=(l:TireLine)=>(brands.includes(l.brand)?4:0)+(l.terrain.some(t=>allowed.has(t))?2:0)+(l.terrain.some(t=>terrains.includes(t))?1:0)+(l.current?0.5:0);
 if(brands.length||terrains.length)pool=pool.filter(l=>brands.includes(l.brand)||l.terrain.some(t=>allowed.has(t)));
 pool=[...pool].filter(l=>!asked.includes(l)).sort((a,b)=>score(b)-score(a)).slice(0,Math.max(0,budgetLines-asked.length));
 const by:Record<string,string[]>={};
 for(const l of pool){const k=TERRAIN_LABEL[l.terrain[0]];(by[k]??=[]).push(lineText(l));}
 return {focus:{brands,terrains,position:wantFront?'front':wantRear?'rear':'both'},...(asked.length?{asked_about:asked.map(l=>`${lineText(l)} Terrain: ${l.terrain.map(t=>TERRAIN_LABEL[t]).join(', ')}.`)}:{}),lines_by_terrain:by};
}
function selectTerrainPressure(text:string){
 const ids=new Set<string>();
 if(/\b(sand|sandy|soft|loam|deep)\b/i.test(text))ids.add('sand');
 if(/\b(mud|muddy|wet|rain)\b/i.test(text))ids.add('mud');
 if(/\b(hard ?pack|hardpack|hard|slick|clay|dry)\b/i.test(text))ids.add('hard_slick');
 if(/\b(rocks?|rocky|roots?|square[- ]edge|landings?|rim)\b/i.test(text))ids.add('rocks');
 if(/\b(sticky|tacky|watered|prepped|prepared|supercross|stadium)\b/i.test(text))ids.add('sticky_prepped');
 if(/\b(hot|heat|summer|late in the moto|long motos?)\b/i.test(text))ids.add('heat');
 return ids.size?terrainPressure.filter(p=>ids.has(p.id)):terrainPressure;
}
function selectInserts(text:string){
 const ids=new Set<string>();
 if(/\bmousses?\b|foam/i.test(text))ids.add('mousse');
 if(/tubliss|tubeless/i.test(text))ids.add('tubliss');
 if(/heavy[- ]duty|uhd/i.test(text))ids.add('heavy_duty_tube');
 if(/\btubes?\b/i.test(text)&&!ids.has('heavy_duty_tube'))ids.add('standard_tube');
 // One option named and no comparison asked: just that one. Otherwise (a comparison, a flat problem, nothing named): all four.
 const comparing=/\b(vs\.?|versus|compare|which|best|better|difference|worth it|instead)\b/i.test(text);
 return ids.size===1&&!comparing?inserts.filter(i=>ids.has(i.id)):inserts;
}

/** Rough budget: about 2.5k tokens of JSON, at roughly four characters a token. */
export const TIRE_KNOWLEDGE_MAX_CHARS=9600;

/** A compact tire section for Ask BAK, or null when the conversation is not about tires, grip, pressure, flats,
 *  inserts or a handling complaint where a tire is a likely cause. history: earlier rider messages, oldest first. */
export function tireKnowledge(message:string,history?:string[]):TireSection|null{
 const msg=message??'';
 let {topics,symptoms}=topicsOf(msg);
 let fromHistory=false,text=msg;
 // A short follow-up ("what about 12?", "and the rear?") inherits the tire topics of the last few rider messages,
 // unless it has moved to another system. A symptom-only history is inherited only when the follow-up asks about pressure.
 if(!topics.size&&history?.length&&msg.trim().length<=160&&!OTHER_DOMAIN.test(msg)){
  const recent=history.slice(-3).join('\n');
  const h=topicsOf(recent);
  const asksPressure=PRESSURE_WORD.test(msg)&&!SUSPENSION_AIR.test(msg);
  const symptomOnly=h.topics.size===1&&h.topics.has('symptoms');
  if(h.topics.size&&(!symptomOnly||asksPressure)){topics=h.topics;if(asksPressure)topics.add('pressure');symptoms=h.symptoms;fromHistory=true;text=recent+'\n'+msg;}
 }
 if(!topics.size)return null;
 const onlySymptoms=topics.size===1&&topics.has('symptoms');
 const out:TireSection={version:TIRE_KNOWLEDGE_VERSION,
  boundary:'BAK-authored tire knowledge for gas motocross from tire and insert makers\' public guidance. Tire-maker pressure ranges are general starting guidance, never this bike\'s published value: the bike maker\'s cold figure for the exact bike comes first, and changes are steps from the rider\'s current pressure. Name tire brands and models freely; never name a magazine, tester, retailer or rider as the source. Where makers differ, give the spread and who says what.',
  topics:[...topics]};
 if(fromHistory)out.from_history=true;
 // Sections in priority order; each is added only while the whole stays inside the budget.
 const parts:[string,()=>unknown][]=[];
 if(topics.has('symptoms'))parts.push(['symptom_checks',()=>({ask:tireAsk,checks:strip(tireSymptoms.filter(s=>symptoms.includes(s.id)))})]);
 if(topics.has('pressure')||onlySymptoms)parts.push(['pressure',()=>onlySymptoms?{rules:pressureRules.slice(0,4)}:{rules:pressureRules,maker_ranges_cold:strip(pressureRanges),makers_differ:pressureDisagreement,by_conditions:strip(selectTerrainPressure(text))}]);
 if(topics.has('inserts'))parts.push(['tubes_mousse_tubliss',()=>({options:strip(selectInserts(text)),practice:insertPractice})]);
 if(topics.has('wear'))parts.push(['wear_and_fitting',()=>strip(/\brim ?locks?|valve stem|mount|fit(ting)?|seat|install|bead/i.test(text)?{rim_locks:wear.rim_locks,mounting:wear.mounting,signs:wear.signs}:{signs:wear.signs,when:wear.when,rim_locks:wear.rim_locks.slice(0,2)})]);
 if(topics.has('choice'))parts.push(['choosing',()=>{const sel=selectLines(text,topics.size>2?10:24);return {how_to_choose:topics.size>2?choosingTires.slice(0,3):choosingTires,...sel};}]);
 if(topics.has('sizes'))parts.push(['sizes',()=>strip(sizes)]);
 if(topics.has('pro'))parts.push(['pro_practice',()=>proPractice]);
 for(const [k,f] of parts){
  const v=f();out[k]=v;
  if(JSON.stringify(out).length>TIRE_KNOWLEDGE_MAX_CHARS){
   // Try a trimmed form before dropping the section.
   if(k==='choosing'){const sel=selectLines(text,6);out[k]={how_to_choose:choosingTires.slice(0,2),...sel};}
   else if(Array.isArray(v))out[k]=v.slice(0,3);
   if(JSON.stringify(out).length>TIRE_KNOWLEDGE_MAX_CHARS)delete out[k];
  }
 }
 return out;
}
