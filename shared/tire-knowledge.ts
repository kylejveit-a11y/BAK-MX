/** BAK-authored tire knowledge for gas motocross bikes.
 *
 * Tire lines with the sizes each maker lists and the terrain each is made for, published cold-pressure ranges from tire
 * and bike makers, how pressure moves with conditions, tube / heavy-duty tube / mousse / TUbliss trade-offs and which
 * insert fits which tire size, wear and replacement, rim locks and mounting, and the handling complaints where a tire is
 * as likely a cause as the suspension.
 *
 * Every number carries a `src` id from TIRE_SOURCES (full list with URLs and dates in docs/research/tires/SOURCES.md).
 * `src` never reaches the model: tireKnowledge() strips it. Rider-facing text names tire brands and models only, never a
 * magazine, tester, retailer or rider. Tire-maker ranges are general guidance, never the bike's published value: the bike
 * maker's own cold pressure for the exact bike (verified claims and bike knowledge) always comes first.
 *
 * Size lists: `f`/`r` are the exact sizes a maker page or catalogue lists; `fD`/`rD` are wheel diameters only (when the
 * maker gave diameters but not sizes). A line with no sizes has none confirmed from a maker source yet (see SOURCES.md).
 *
 * Status: AUTHORED from public maker pages and catalogues on 2026-11-07 (second pass), pending review by Kyle. Edit here;
 * the runtime reads this file.
 */
export const TIRE_KNOWLEDGE_VERSION='mx-tires-2';

export type Terrain='sand'|'mud'|'soft'|'soft_intermediate'|'intermediate'|'intermediate_hard'|'hard'|'all_round'|'mini';
export type Position='front'|'rear'|'both';
export type TireSizes={f?:string[];r?:string[];fD?:string[];rD?:string[]};
export type TireLine={brand:string;model:string;terrain:Terrain[];position:Position;note:string;current:boolean;sizes?:TireSizes;build?:string;road?:string;src:string[]};
export type PressureRange={who:string;applies:string;front?:string;rear?:string;both?:string;src:string};
export type TerrainPressure={id:string;terrain:string;direction:string;why:string;maker_figures?:string;watch:string;src:string[]};
export type InsertOption={id:string;name:string;weight:string;feel:string;flat_protection:string;pressure:string;life_and_heat:string;cost:string;install:string;best_for:string;src:string[]};
export type InsertFit={id:string;name:string;kind:'mousse'|'tube'|'tubeless';rows:[string,string][];note:string;src:string[]};
export type TireSymptom={id:string;rider_says:string[];tire_causes:string[];check:string[];versus_suspension:string;setup_guide?:string;src:string[]};
export type Source={id:string;publisher:string;kind:'tire_maker'|'insert_maker'|'bike_maker'|'series'|'press'|'retailer'|'tester';url:string;published?:string;accessed:string};
export type TireBike={manufacturer?:string;model?:string;model_year?:number};

const A='2026-11-07';
/** Every source behind a fact here. Not rider-facing and never sent to the model. Kept in step with SOURCES.md. */
export const TIRE_SOURCES:Source[]=[
 {id:'dunlop-offroad-facts',publisher:'Dunlop Motorcycle Tires (US)',kind:'tire_maker',url:'https://dmt.exults.com/about/off-road-facts',accessed:A},
 {id:'dunlop-offroad-pdf',publisher:'Dunlop Motorcycle Tires (US), Off-Road Facts PDF',kind:'tire_maker',url:'https://images.motorcycleid.com/dunlop/items/pdf/off-road-facts-information.pdf',accessed:A},
 {id:'dunlop-care',publisher:'Dunlop Motorcycle Tires (US), Care & Maintenance',kind:'tire_maker',url:'https://dmt.exults.com/care',accessed:A},
 {id:'dunlop-care-pdf',publisher:'Dunlop Motorcycle Tires (US), Care and Maintenance sheet PDF',kind:'tire_maker',url:'https://images.motorcycleid.com/dunlop/items/pdf/care-and-maintenance-instruction-sheet.pdf',accessed:A},
 {id:'dunlop-mx34',publisher:'Goodyear Europe newsroom (Dunlop)',kind:'tire_maker',url:'https://news.goodyear.eu/dunlop-introduces-geomax-mx34-next-generation-intermediate-mx-tire/',published:'2023',accessed:A},
 {id:'dunlop-mx34-specs',publisher:'Dunlop Motorcycle Tires (US), Geomax MX34 page and size table',kind:'tire_maker',url:'https://www.dunlopmotorcycletires.com/tires/geomax-mx34',accessed:A},
 {id:'dunlop-mx14-specs',publisher:'Dunlop Motorcycle Tires (US), Geomax MX14 page and size table',kind:'tire_maker',url:'https://dmt.exults.com/tires/geomax-mx14',accessed:A},
 {id:'dunlop-mx53-specs',publisher:'Dunlop Motorcycle Tires (US), Geomax MX53 page and size table',kind:'tire_maker',url:'https://dmt.exults.com/tires/geomax-mx53',accessed:A},
 {id:'dunlop-mx33-specs',publisher:'Dunlop Motorcycle Tires (US), Geomax MX33 page and size table',kind:'tire_maker',url:'https://dmt.exults.com/tires/geomax-mx33',accessed:A},
 {id:'dunlop-mx3s-specs',publisher:'Dunlop Motorcycle Tires (US), Geomax MX3S page and size table',kind:'tire_maker',url:'https://dmt.exults.com/tires/geomax-mx3s',accessed:A},
 {id:'dunlop-factory-spec',publisher:'Dunlop Motorcycle Tires (US), Geomax Factory Spec page and size table',kind:'tire_maker',url:'https://dmt.exults.com/tires/geomax-factory-spec-mx34',accessed:A},
 {id:'dunlop-mx54',publisher:'Dunlop press release on the Geomax MX54, as published by a motocross news site',kind:'press',url:'https://www.mxpmag.com/dunlop-geomax-mx54-increased-versatility-on-intermediate-hard-motocross-tracks/',published:'2026-06-18',accessed:A},
 {id:'dunlop-geomax-eu',publisher:'Dunlop Moto Europe, Geomax range',kind:'tire_maker',url:'https://www.dunlop-moto.com/en_gb/why-dunlop/geomax-range.html',accessed:A},
 {id:'dunlop-mx12',publisher:'Dunlop Motorcycle Tires (US), Geomax MX12 release',kind:'tire_maker',url:'https://dmt.exults.com/dunlop-introduces-new-geomax-mx12',published:'2017-06-30',accessed:A},
 {id:'dunlop-track-guide',publisher:'Dunlop track-by-track tire setup (older Geomax lineup), as published by a retailer',kind:'retailer',url:'https://www.motosport.com/blog/dunlop-tire-setup-at-the-top-motocross-tracks',accessed:A},
 {id:'michelin-choose-mx',publisher:'Michelin, choosing motocross tyres',kind:'tire_maker',url:'https://www.michelin.com.au/motorbike/advice-motorbike/choose-tyres/motocross-tyres',accessed:A},
 {id:'michelin-pressure-offroad',publisher:'Michelin (US), off-road tire pressure',kind:'tire_maker',url:'https://www.michelinman.com/motorcycle/tips-and-advice/advice-motorbike/tire-pressure/off-road',accessed:A},
 {id:'michelin-bib-mousse',publisher:'Michelin (US), Bib Mousse and off-road pressure',kind:'tire_maker',url:'https://www.michelinman.com/motorcycle/tips-and-advice/tips-to-take-care-of-motorcycle-tires/tire-pressure-off-road',accessed:A},
 {id:'michelin-bib-mousse-chart',publisher:'Michelin (US), Bib Mousse page with the fitment chart by tire',kind:'tire_maker',url:'https://www.michelinman.com/motorcycle/accessories/michelin-bib-mousse',accessed:A},
 {id:'michelin-starcross-family',publisher:'Michelin (UK), Starcross family',kind:'tire_maker',url:'https://www.michelin.co.uk/motorbike/browse-tyres/by-family/starcross',accessed:A},
 {id:'michelin-sc6-ms',publisher:'Michelin (US), Starcross 6 Medium Soft sizes',kind:'tire_maker',url:'https://www.michelinman.com/motorcycle/tires/michelin-starcross-6-medium-soft',accessed:A},
 {id:'michelin-sc6-mh',publisher:'Michelin (US), Starcross 6 Medium Hard sizes',kind:'tire_maker',url:'https://www.michelinman.com/motorcycle/tires/michelin-starcross-6-medium-hard',accessed:A},
 {id:'michelin-sc6-hard',publisher:'Michelin (US), Starcross 6 Hard sizes',kind:'tire_maker',url:'https://www.michelinman.com/motorcycle/tires/michelin-starcross-6-hard',accessed:A},
 {id:'michelin-sc6-sand',publisher:'Michelin (UK), Starcross 6 Sand sizes',kind:'tire_maker',url:'https://www.michelin.co.uk/motorbike/tyres/michelin-starcross-6-sand',accessed:A},
 {id:'michelin-sc6-mud',publisher:'Michelin (UK), Starcross 6 Mud sizes',kind:'tire_maker',url:'https://www.michelin.co.uk/motorbike/tyres/michelin-starcross-6-mud',accessed:A},
 {id:'michelin-sc5-mini',publisher:'Michelin (UK), Starcross 5 Mini sizes',kind:'tire_maker',url:'https://www.michelin.co.uk/motorbike/tyres/michelin-starcross-5-mini',accessed:A},
 {id:'pirelli-mx-catalog',publisher:'Pirelli (US), motocross catalog',kind:'tire_maker',url:'https://pirelli.com/tires/en-us/motorcycle/all-tires/catalog/off-road/motocross',accessed:A},
 {id:'pirelli-offroad-2026',publisher:'Pirelli, Off-road flyer 2026 (German)',kind:'tire_maker',url:'https://tyre24.pirelli.com/moto/assets/pirelli/pdf/global/TDB/PI-Offroad-Flyer2026-DE.pdf',published:'2026-01',accessed:A},
 {id:'pirelli-mini-os-2020',publisher:'Pirelli press release (Mini O\'s 2020 tire setup)',kind:'tire_maker',url:'https://vitalmx.com/news/press-release/Pirelli-Releases-Recommended-Tire-Setup-for-Upcoming-Thor-Mini-O-s-Amateur-Motocross-National,21786',published:'2020-11-17',accessed:A},
 {id:'bridgestone-x31',publisher:'Bridgestone Tires (US), Battlecross X31',kind:'tire_maker',url:'https://tires.bridgestone.com/en-us/tires/motorcycle/battlecross/x31',accessed:A},
 {id:'bridgestone-x20',publisher:'Bridgestone Tires (US), Battlecross X20',kind:'tire_maker',url:'https://tires.bridgestone.com/en-us/tires/motorcycle/battlecross/x20',accessed:A},
 {id:'bridgestone-databook-2026',publisher:'Bridgestone, 2026 Motorcycle Tire Data Book (PDF)',kind:'tire_maker',url:'https://s7d1.scene7.com/is/content/bridgestone/motorcycle-tire-data-bookpdf',published:'2026-07-23',accessed:A},
 {id:'bridgestone-gripping',publisher:'Bridgestone Gripping Stories (Bridgestone motorcycle)',kind:'tire_maker',url:'https://grippingstories.com/?p=573',published:'2018-06-05',accessed:A},
 {id:'bridgestone-x40-dealer',publisher:'Dealer listing, Battlecross X40 sizes',kind:'retailer',url:'https://discountmotorcycletyres.com.au/products/bridgestone-battlecross-x40',accessed:A},
 {id:'maxxis-offroad',publisher:'Maxxis (US), moto off-road',kind:'tire_maker',url:'https://www.maxxis.com/us/tires/motorcycle/moto-off-road/',accessed:A},
 {id:'maxxis-mx-st',publisher:'Maxxis (international), Maxxcross MX-ST page and size table',kind:'tire_maker',url:'https://www.maxxis.com/int/tire/maxxcross-mx-st/',accessed:A},
 {id:'maxxis-mx-si',publisher:'Maxxis (US), Maxxcross MX-SI page and size table',kind:'tire_maker',url:'https://www.maxxis.com/us/tire/maxxcross-mx-si/',accessed:A},
 {id:'maxxis-mx-ih',publisher:'Maxxis (US), Maxxcross MX-IH page and size table',kind:'tire_maker',url:'https://www.maxxis.com/us/tire/maxxcross-mx-ih/',accessed:A},
 {id:'maxxis-sm',publisher:'Maxxis (US), Maxxcross SM page and size table',kind:'tire_maker',url:'https://www.maxxis.com/us/tire/maxxcross-sm/',accessed:A},
 {id:'maxxis-guide-au',publisher:'Maxxis dirt bike tyre guide (Australian press)',kind:'press',url:'https://transmoto.com.au/maxxis-dirt-bike-tyre-guide',accessed:A},
 {id:'kenda-catalog-2021',publisher:'Kenda product catalog 2021 (PDF, Kenda\'s own catalogue)',kind:'tire_maker',url:'https://images.motorcycleid.com/kenda-motorcycle-tires/info/pdf/kenda-product-catalog-2021.pdf',published:'2021',accessed:A},
 {id:'kenda-guide',publisher:'Dirt bike tire buyer\'s guide, Kenda page (retailer)',kind:'retailer',url:'https://dirtbikes.com/dirtbike-tires-buyers-guide/4',accessed:A},
 {id:'kenda-dealer',publisher:'Dealer listings with Kenda terrain designations',kind:'retailer',url:'https://www.blackcircles.com/brands/kenda/washougal-iii-k7102--motocross-intermed-terr-not-for-highway-use',accessed:A},
 {id:'shinko-520',publisher:'Retail listing, Shinko 520',kind:'retailer',url:'https://www.revzilla.com/motorcycle/shinko-520-series-intermediate-hard-tires',accessed:A},
 {id:'shinko-546-525',publisher:'Retail listings, Shinko 546 and 525 terrain titles',kind:'retailer',url:'https://www.jpcycles.com/product/shinko-546-series-soft-intermediate-tires',accessed:A},
 {id:'irc-vx40',publisher:'Cycle News product note, IRC VX40',kind:'press',url:'https://www.cyclenews.com/2023/02/article/irc-vx40-tire/',published:'2023-02-19',accessed:A},
 {id:'irc-vx30',publisher:'Retail listing, IRC VX30 soft/intermediate',kind:'retailer',url:'https://www.rockymountainatvmc.com/tires-and-wheels/irc-vx30-soft-intermediate-terrain-tire-p?v=2352',accessed:A},
 {id:'mitas-terraforce',publisher:'Mitas press room, Terra Force-MX',kind:'tire_maker',url:'https://www.mitas-moto.com/en/media-and-events/press-room/mitas-launching-new-motocross-competition-tires-terra-force-mx',published:'2019-03-25',accessed:A},
 {id:'mitas-tfmx-pdf',publisher:'Mitas, Terra Force-MX product information (PDF)',kind:'tire_maker',url:'https://images.motorcycleid.com/mitas/items/pdf/mitas-terra-force-mx-product-information.pdf',accessed:A},
 {id:'mitas-tfmx-pages',publisher:'Mitas (US), Terra Force-MX Sand, SM and MH pages',kind:'tire_maker',url:'https://mitas-moto.com/en-us/products/motorcycle-off-road-tires/motocross-tires/terra-force-mx-sm',accessed:A},
 {id:'mitas-pressures',publisher:'Mitas recommended inflation pressures (PDF)',kind:'tire_maker',url:'https://www.mitas-moto.com/~/media/mitas-moto/technology-and-safety/mitas-recommended-inflation-pressures.pdf?la=en',accessed:A},
 {id:'metzeler-mc360',publisher:'Metzeler, MC360 Mid Hard',kind:'tire_maker',url:'https://www.metzeler.com/en-ww/products/tyres/mc-360-mid-hard',accessed:A},
 {id:'metzeler-mc360-ms',publisher:'Metzeler, MC360 Mid Soft',kind:'tire_maker',url:'https://www.metzeler.com/en-ww/products/tyres/mc-360-mid-soft',accessed:A},
 {id:'plews-tyres',publisher:'Plews Tyres, product catalogue (MX1, MX2, MX3 and Ultra Mousse)',kind:'tire_maker',url:'https://plewstyres.com/products.json?limit=250',accessed:A},
 {id:'goldentyre-retail',publisher:'Retail listing, Goldentyre GT232N mid/soft rear',kind:'retailer',url:'https://www.mxstore.com.au/p/GoldenTyre-GT232N-100-90-19-Mid-Soft-Rear-Tyre/GOP4716',accessed:A},
 {id:'nuetech-tubliss-guide',publisher:'Nuetech TUbliss guide (PDF)',kind:'insert_maker',url:'https://images.motorcycleid.com/nuetech/items/pdf/guide.pdf',accessed:A},
 {id:'tubliss-kit-listing',publisher:'Retail listing reproducing Nuetech TUbliss Gen 2.0 kit details',kind:'retailer',url:'https://tripleclampmoto.ca/products/nuetech-tubliss-gen-2-0-system',accessed:A},
 {id:'nitromousse-listing',publisher:'Retail listing, Nuetech Nitromousse Platinum / Plushie',kind:'retailer',url:'https://www.tmbrmoto.com/products/nitromousse-platinum-equivilent-to-10-12-psi',accessed:A},
 {id:'mousse-guide-retailer',publisher:'Retailer guide to tire mousse',kind:'retailer',url:'https://motosport.com/blog/tire-mousse-a-guide-to-foam-tubes-and-flat-free-tires',accessed:A},
 {id:'pressure-guide-retailer',publisher:'Retailer guide to dirt bike tire pressure',kind:'retailer',url:'https://motosport.com/blog/how-to-get-ideal-dirt-bike-tire-pressure',accessed:A},
 {id:'replace-guide-retailer',publisher:'Retailer guide, when to replace dirt bike tires',kind:'retailer',url:'https://motosport.com/blog/when-to-replace-dirt-bike-tires',accessed:A},
 {id:'rimlock-guide-retailer',publisher:'Retailer guide, tire change and rim locks',kind:'retailer',url:'https://de.riskracing.com/blogs/news/dirt-bike-tire-change-when-how-much-balancing-rim-locks',accessed:A},
 {id:'michelin-uhd-listing',publisher:'Retail listing, Michelin Ultra Heavy Duty tube',kind:'retailer',url:'https://www.24mx.com/en-us/product/michelin-ultra-heavy-duty-4-mm-inner-tube/PM-0001097',accessed:A},
 {id:'tubliss-test',publisher:'Independent test, TUbliss Gen 2.0',kind:'tester',url:'https://dirtbiketest.com/product-tests/nuetech-tubliss-gen-2-0/',published:'2021-10-11 (last modified)',accessed:A},
 {id:'nitromousse-test',publisher:'Independent test, Nitro Mousse',kind:'tester',url:'https://dirtbiketest.com/product-tests/nuetech-nitro-mousse/',published:'2017 (images), 2021-10-11 (last modified)',accessed:A},
 {id:'wsx-tyres',publisher:'FIM World Supercross Championship, Tech Tuesday: tyres',kind:'series',url:'https://worldsupercrosschampionship.com/tech-tuesday-the-importance-of-tyres/',published:'2025-11-25',accessed:A},
 {id:'bike-manuals',publisher:'Bike makers\' owner\'s manuals already in BAK research (KTM, Husqvarna, GasGas, Kawasaki)',kind:'bike_maker',url:'docs/research/knowledge/manual_specs_b.json; manual_specs_c.json; kawasaki_manuals.json',accessed:A},
 {id:'bike-manuals-tires',publisher:'Bike makers\' owner\'s manuals and spec pages read for stock tires in this pass (KTM, Husqvarna, GASGAS, Yamaha, Kawasaki, Suzuki, Honda)',kind:'bike_maker',url:'docs/research/knowledge/tires_stock_*.json (each record carries its own manual URL)',accessed:A},
 {id:'oem-parts-rimlock',publisher:'Bike makers\' parts catalogues in BAK research (rim lock / bead stopper rows per wheel)',kind:'bike_maker',url:'docs/research/parts/inventory.json',accessed:A},
];

// ---------------------------------------------------------------------------------------------------------------
// Tire lines. Terrain words are the maker's own designation where the maker publishes one; see SOURCES.md.
// current:false marks an older line that still ships as original equipment or sits in riders' garages.
const BIG_F21=['80/100-21'];
export const tireLines:TireLine[]=[
 {brand:'Dunlop',model:'Geomax MX34',terrain:['soft_intermediate'],position:'both',current:true,
  note:'Soft and intermediate dirt (loam, sand, mud, packed-and-loose mixes); replaced the MX33. Dunlop added a taller 70/100-14 front and 90/100-12 rear for 65s.',
  build:'New carcass material Dunlop says holds its performance up to 30% longer than the MX33.',
  sizes:{f:['60/100-10','60/100-12','60/100-14','70/100-14','70/100-17','70/100-19','80/100-21'],r:['70/100-10','80/100-12','90/100-12','90/100-14','90/100-16','100/100-18','110/100-18','120/90-18','100/90-19','110/90-19','120/80-19','120/90-19']},src:['dunlop-mx34-specs','dunlop-mx34','dunlop-offroad-facts']},
 {brand:'Dunlop',model:'Geomax Factory Spec',terrain:['soft_intermediate'],position:'both',current:true,
  note:'Race version of the MX34 sold through KTM, Husqvarna and GasGas dealers; single-radius profile and a high-strength compound.',sizes:{f:BIG_F21,r:['110/90-19','120/90-19']},src:['dunlop-factory-spec']},
 {brand:'Dunlop',model:'Geomax MX14',terrain:['sand','mud'],position:'rear',current:true,note:'Rear for deep sand and mud only; paired with an MX34 or MX33 front.',
  sizes:{r:['70/100-10','80/100-12','90/100-14','90/100-16','110/100-18','100/90-19','110/90-19','120/80-19']},src:['dunlop-mx14-specs','dunlop-geomax-eu','dunlop-offroad-facts']},
 {brand:'Dunlop',model:'Geomax MX54',terrain:['intermediate_hard','hard'],position:'both',current:true,
  note:'New in 2026: intermediate-to-hard, succeeds the MX53 and covers the hard terrain the discontinued MX71 did. 17 sizes; exact list to confirm from Dunlop\'s size table.',
  sizes:{fD:['10','12','14','17','19','21'],rD:['10','12','14','16','18','19']},src:['dunlop-mx54']},
 {brand:'Dunlop',model:'Geomax MX53',terrain:['intermediate_hard','hard'],position:'both',current:true,
  note:'Hard pack and blue-groove, also intermediate; an MX53 front with an MX34 rear is Dunlop\'s mixed pairing. Being replaced by the MX54 (2026).',
  sizes:{f:['60/100-10','60/100-12','60/100-14','70/100-17','70/100-19','80/100-21'],r:['70/100-10','80/100-12','90/100-14','90/100-16','100/100-18','110/100-18','120/90-18','100/90-19','110/90-19','120/80-19','120/90-19']},src:['dunlop-mx53-specs','dunlop-geomax-eu','dunlop-offroad-facts']},
 {brand:'Dunlop',model:'Geomax MX71',terrain:['hard'],position:'both',current:false,note:'Hard terrain; discontinued (Dunlop, 2026).',src:['dunlop-geomax-eu','dunlop-mx54']},
 {brand:'Dunlop',model:'Geomax MX33',terrain:['soft_intermediate'],position:'both',current:false,note:'Soft to intermediate; replaced by the MX34. Original equipment on many 2020–2026 bikes; Dunlop US now lists only a 70/100-21 front and 90/100-18 rear.',sizes:{f:['70/100-21'],r:['90/100-18']},src:['dunlop-mx33-specs','dunlop-mx34','bike-manuals']},
 {brand:'Dunlop',model:'Geomax MX3S',terrain:['soft_intermediate'],position:'both',current:false,note:'Older soft-to-intermediate line, original equipment before the MX33; Dunlop US lists only the 80/100-21 front now.',sizes:{f:BIG_F21},src:['dunlop-mx3s-specs','bike-manuals']},
 {brand:'Dunlop',model:'Geomax MX12',terrain:['sand','mud'],position:'both',current:false,note:'Older sand and mud line for 21-inch front and 19-inch rear.',sizes:{fD:['21'],rD:['19']},src:['dunlop-mx12']},
 {brand:'Michelin',model:'Starcross 6 Sand',terrain:['sand'],position:'both',current:true,note:'Michelin puts the Sand on both ends for sand.',sizes:{f:BIG_F21,r:['100/90-19','110/90-19']},src:['michelin-choose-mx','michelin-sc6-sand']},
 {brand:'Michelin',model:'Starcross 6 Mud',terrain:['mud'],position:'rear',current:true,note:'Rear for mud; Michelin pairs it with a Starcross 6 Medium Soft front.',sizes:{r:['100/90-19','110/90-19']},src:['michelin-choose-mx','michelin-sc6-mud']},
 {brand:'Michelin',model:'Starcross 6 Medium Soft',terrain:['soft','soft_intermediate'],position:'both',current:true,note:'Ground a finger can push into; the more comfortable of the two middle tires.',
  sizes:{f:['80/100-21','90/100-21'],r:['110/100-18','120/90-18','100/90-19','110/90-19','120/80-19']},src:['michelin-choose-mx','michelin-sc6-ms']},
 {brand:'Michelin',model:'Starcross 6 Medium Hard',terrain:['intermediate'],position:'both',current:true,note:'Intermediate; more responsive than the Medium Soft, especially on the gas.',
  sizes:{f:['80/100-21','90/100-21'],r:['110/100-18','120/90-18','100/90-19','110/90-19','120/80-19']},src:['michelin-choose-mx','michelin-sc6-mh']},
 {brand:'Michelin',model:'Starcross 6 Hard',terrain:['hard'],position:'both',current:true,note:'Dry, compacted ground a finger will not go into, with or without stones; Michelin\'s pick for supercross.',sizes:{f:['90/100-21'],r:['110/90-19','120/80-19']},src:['michelin-choose-mx','michelin-sc6-hard','michelin-bib-mousse-chart']},
 {brand:'Michelin',model:'Starcross 5 Mini',terrain:['mini'],position:'both',current:true,note:'Michelin\'s line for 50s and 65s; no 85-size (17/14 or 19/16) listed.',sizes:{f:['2.50-10','2.50-12','60/100-14'],r:['2.50-10','2.75-10','80/100-12']},src:['michelin-starcross-family','michelin-sc5-mini']},
 {brand:'Pirelli',model:'Scorpion MX32 Mid Soft',terrain:['soft_intermediate'],position:'both',current:true,
  note:'Soft (mud, sand) through intermediate (dry soil, gravel); new generation from 2025. Pirelli\'s pick for well-prepared tracks; on rough, poorly prepared tracks it can chunk knobs, where Pirelli points to the Mid Hard.',
  sizes:{f:['2.50-10','60/100-12','80/100-14','70/100-17','70/100-19','80/100-21','90/100-21'],r:['2.75-10','80/100-12','90/100-12','90/100-14','90/100-16','110/90-17','100/90-19','110/90-19','120/80-19','120/90-19']},road:'NHS (fronts marked MST)',src:['pirelli-mx-catalog','pirelli-offroad-2026']},
 {brand:'Pirelli',model:'Scorpion MX32 Mid Hard',terrain:['intermediate_hard'],position:'both',current:true,note:'Medium to hard and rough, poorly prepared tracks; lasts longer on average than the Mid Soft, so riders also use it for practice.',
  sizes:{f:['70/100-19','80/100-21'],r:['90/100-16','100/90-19','110/90-19','120/80-19']},road:'NHS',src:['pirelli-mx-catalog','pirelli-offroad-2026']},
 {brand:'Pirelli',model:'Scorpion MX Soft',terrain:['sand','mud','soft'],position:'rear',current:true,note:'Rear scoop for mud, sand and soft clay; Pirelli pairs it with an MX32 Mid Soft (or Extra X) front.',
  sizes:{r:['80/100-12','90/100-16','120/90-18','100/90-19','110/90-19','120/80-19']},road:'NHS',src:['pirelli-mx-catalog','pirelli-offroad-2026']},
 {brand:'Pirelli',model:'Scorpion MX Extra X',terrain:['all_round'],position:'both',current:true,note:'Long-lasting all-rounder for practice and amateur racing; sturdy carcass against punctures and pinch hits.',sizes:{f:BIG_F21,r:['100/90-19','110/90-19','120/90-19']},road:'NHS',src:['pirelli-mx-catalog','pirelli-offroad-2026']},
 {brand:'Bridgestone',model:'Battlecross X10',terrain:['sand','mud'],position:'both',current:true,note:'Deep sand and mud.',sizes:{f:BIG_F21,r:['90/100-16','100/90-19','110/90-19']},road:'NHS',src:['bridgestone-databook-2026','bridgestone-gripping']},
 {brand:'Bridgestone',model:'Battlecross X20',terrain:['soft','soft_intermediate'],position:'both',current:true,note:'Soft to intermediate: sand, loose soil, soft loam and mud.',sizes:{f:['70/100-19','80/100-21','90/100-21'],r:['90/100-16','110/100-18','100/90-19','110/90-19','120/80-19']},road:'NHS',src:['bridgestone-databook-2026','bridgestone-x20']},
 {brand:'Bridgestone',model:'Battlecross X31',terrain:['intermediate'],position:'both',current:true,note:'A true intermediate that copes with soft and hard; successor to the X30.',sizes:{f:['80/100-21','90/100-21'],r:['110/100-18','100/90-19','110/90-19','120/80-19']},road:'NHS',src:['bridgestone-databook-2026','bridgestone-x31']},
 {brand:'Bridgestone',model:'Battlecross X30',terrain:['intermediate'],position:'both',current:false,note:'Earlier intermediate, still original equipment on some bikes and listed in 85 sizes.',sizes:{f:['70/100-19'],r:['90/100-16','100/100-18']},road:'NHS',src:['bridgestone-databook-2026','bike-manuals-tires']},
 {brand:'Bridgestone',model:'Battlecross X40',terrain:['intermediate_hard','hard'],position:'both',current:true,note:'Medium to hard terrain.',sizes:{f:['80/100-21','90/100-21'],r:['110/100-18','100/90-19','110/90-19','120/80-19']},road:'NHS',src:['bridgestone-databook-2026','bridgestone-gripping']},
 {brand:'Bridgestone',model:'Battlecross M203/M204',terrain:['mini','soft_intermediate'],position:'both',current:true,note:'Mini sizes, soft to intermediate (M203 front, M204 rear).',sizes:{f:['60/100-14','70/100-17','70/100-19'],r:['80/100-12','90/100-14','90/100-16']},road:'NHS',src:['bridgestone-databook-2026']},
 {brand:'Bridgestone',model:'Battlecross M403/M404',terrain:['mini','intermediate'],position:'both',current:true,note:'Mini sizes, intermediate (M403 front, M404 rear).',sizes:{f:['60/100-12','60/100-14','70/100-17'],r:['70/100-10','80/100-12','90/100-14']},road:'NHS',src:['bridgestone-databook-2026']},
 {brand:'Bridgestone',model:'Battlecross M23/M22',terrain:['mini','hard'],position:'both',current:true,note:'Mini sizes, hard and blue-groove (M23 front, M22 rear).',sizes:{f:['70/100-17','2.50-19'],r:['90/100-14','3.00-16']},road:'NHS',src:['bridgestone-databook-2026']},
 {brand:'Bridgestone',model:'Battlecross M40',terrain:['mini'],position:'both',current:true,note:'50cc sizes, front and rear.',sizes:{f:['2.50-10'],r:['2.50-10','2.75-10']},road:'NHS',src:['bridgestone-databook-2026']},
 {brand:'Maxxis',model:'Maxxcross MX-ST',terrain:['soft','soft_intermediate'],position:'both',current:true,note:'Intermediate to soft; the MX-ST+ is original equipment on GasGas MC models and many KTM-group minis.',
  sizes:{f:['60/100-10','60/100-12','60/100-14','70/100-17','70/100-19','80/100-21'],r:['70/100-10','80/100-10','80/100-12','90/100-14','90/100-16','110/100-18','120/100-18','100/90-19','110/90-19','120/80-19']},src:['maxxis-mx-st','maxxis-guide-au','bike-manuals-tires']},
 {brand:'Maxxis',model:'Maxxcross MX-SI',terrain:['soft_intermediate'],position:'both',current:true,note:'Soft to intermediate.',sizes:{f:['70/100-17','80/100-21'],r:['90/100-14','110/100-18','110/90-19','120/80-19']},src:['maxxis-mx-si','maxxis-offroad']},
 {brand:'Maxxis',model:'Maxxcross MX-IH',terrain:['intermediate_hard'],position:'both',current:true,note:'Intermediate to hard, including rocky and blue-groove hard pack.',sizes:{f:['70/100-19','80/100-21'],r:['90/100-16','110/100-18','120/90-18','110/90-19','120/80-19','120/90-19']},src:['maxxis-mx-ih','maxxis-guide-au']},
 {brand:'Maxxis',model:'Maxxcross SM',terrain:['sand','mud'],position:'both',current:true,note:'Sand and mud; silica compound and open tread for self-cleaning.',sizes:{f:BIG_F21,r:['110/100-18','120/100-18','100/90-19','110/90-19','120/90-19']},src:['maxxis-sm']},
 {brand:'Maxxis',model:'Maxxcross SI',terrain:['mini','soft_intermediate'],position:'both',current:false,note:'Earlier soft-to-intermediate line; original equipment on KTM-group minis to 2022 and the Yamaha YZ65.',src:['bike-manuals-tires']},
 {brand:'Kenda',model:'Washougal III',terrain:['intermediate'],position:'both',current:true,note:'Intermediate; Kenda\'s deepest front tread and still within motocross rules. Kenda\'s 2021 catalogue lists the 80/100-21 front; rear sizes came later.',sizes:{f:BIG_F21},src:['kenda-catalog-2021','kenda-dealer']},
 {brand:'Kenda',model:'Washougal II',terrain:['intermediate'],position:'both',current:true,note:'Intermediate; dual-compound rear; youth sizes in a sticky compound.',
  sizes:{f:['2.50-10','2.50-12','60/100-14','70/100-17','70/100-19','80/100-21','90/100-21'],r:['80/100-10','80/100-12','90/100-14','90/100-16','110/100-18','120/100-18','100/90-19','110/80-19','110/90-19','120/80-19']},road:'NHS (80/100-21 and 90/100-21 fronts DOT)',src:['kenda-catalog-2021','kenda-guide']},
 {brand:'Kenda',model:'Millville II',terrain:['soft_intermediate'],position:'both',current:true,note:'Soft to intermediate; scoop-shaped blocks.',
  sizes:{f:['60/100-14','70/100-17','70/100-19','80/100-21','90/100-21'],r:['80/100-12','90/100-14','90/100-16','110/100-18','120/100-18','100/90-19','110/80-19','110/90-19','120/80-19']},road:'NHS',src:['kenda-catalog-2021','kenda-guide']},
 {brand:'Kenda',model:'Southwick II',terrain:['sand','mud'],position:'both',current:true,note:'Loose sand and mud; tall knobs.',sizes:{f:BIG_F21,r:['100/100-18','110/100-18','100/90-19','110/90-19']},src:['kenda-catalog-2021','kenda-guide']},
 {brand:'Kenda',model:'Sand Mad',terrain:['sand','mud'],position:'rear',current:true,note:'Paddle rear for deep mud or sand.',sizes:{r:['110/100-18','100/90-19','110/90-19']},road:'NHS',src:['kenda-catalog-2021','kenda-guide']},
 {brand:'Kenda',model:'Triple',terrain:['hard'],position:'both',current:true,note:'Arenacross and supercross: hard-packed, slippery dirt; sticky compound, low-profile sidewall.',sizes:{f:['80/100-21','90/100-21'],r:['110/100-18','120/100-18','100/90-19','110/80-19','110/90-19','120/80-19']},src:['kenda-catalog-2021','kenda-guide']},
 {brand:'Shinko',model:'520',terrain:['intermediate_hard'],position:'both',current:true,note:'Intermediate and hard (sizes not confirmed from Shinko).',src:['shinko-520']},
 {brand:'Shinko',model:'546',terrain:['soft_intermediate'],position:'both',current:true,note:'Soft to intermediate (sizes not confirmed from Shinko).',src:['shinko-546-525']},
 {brand:'Shinko',model:'525 Hybrid Cheater',terrain:['soft_intermediate'],position:'rear',current:true,note:'Soft to intermediate rear (sizes not confirmed from Shinko).',src:['shinko-546-525']},
 {brand:'IRC',model:'VX40',terrain:['intermediate_hard'],position:'both',current:true,note:'Intermediate to hard.',sizes:{f:['80/100-21','90/90-21'],r:['110/100-18','120/90-18','110/90-19','120/80-19']},src:['irc-vx40']},
 {brand:'IRC',model:'VX30',terrain:['soft_intermediate'],position:'both',current:true,note:'Soft to intermediate (sizes not confirmed from IRC).',src:['irc-vx30']},
 {brand:'Mitas',model:'Terra Force-MX Sand',terrain:['sand'],position:'both',current:true,note:'Sand and extra-soft terrain; semi-paddle rear. Hardest Mitas MX compound, made not to soften in the race (double red stripe).',sizes:{f:BIG_F21,r:['100/90-19','110/90-19','120/80-19']},road:'NHS',src:['mitas-tfmx-pdf','mitas-terraforce']},
 {brand:'Mitas',model:'Terra Force-MX SM',terrain:['soft_intermediate'],position:'both',current:true,note:'Soft to medium; softer compound than the Sand (red and yellow stripe).',sizes:{f:['70/100-14','80/100-21','90/90-21'],r:['100/100-18','110/100-18','120/90-18','100/90-19','110/90-19','120/80-19']},road:'NHS',src:['mitas-tfmx-pdf','mitas-tfmx-pages']},
 {brand:'Mitas',model:'Terra Force-MX MH',terrain:['intermediate_hard'],position:'both',current:true,note:'Medium to hard; Mitas gives it the softest compound of the three for grip on hard ground (red and green stripe).',sizes:{f:['80/100-21','90/90-21','90/100-21'],r:['100/100-18','110/100-18','120/90-18','100/90-19','110/90-19','120/80-19']},road:'NHS',src:['mitas-tfmx-pdf','mitas-tfmx-pages']},
 {brand:'Metzeler',model:'MC360 Mid Soft',terrain:['soft_intermediate'],position:'both',current:true,note:'Soft and mid-soft terrain; wide spacing for self-cleaning.',sizes:{f:['80/100-21','90/90-21'],r:['140/80-18','120/80-19']},src:['metzeler-mc360-ms']},
 {brand:'Metzeler',model:'MC360 Mid Hard',terrain:['intermediate_hard'],position:'both',current:true,note:'Medium to hard; denser tread and rubber binding around each knob against tearing.',sizes:{f:['80/100-21','90/90-21'],r:['100/100-18','110/100-18','120/100-18','140/80-18','100/90-19','110/90-19']},src:['metzeler-mc360']},
 {brand:'Plews',model:'MX1 Hawkstone GP',terrain:['sand','mud'],position:'rear',current:true,note:'Soft rear for deep sand and mud; Plews says it stays within the 19.5 mm tread-depth limit.',sizes:{r:['80/100-12','90/100-12','90/100-14','90/100-16','100/90-19','110/90-19','120/80-19']},road:'NHS',src:['plews-tyres']},
 {brand:'Plews',model:'MX2 Matterly GP',terrain:['intermediate'],position:'both',current:true,note:'Intermediate, built for tracks that change from wet morning to hard afternoon.',
  sizes:{f:['60/100-12','60/100-14','90/90-14','70/100-17','70/100-19','80/100-21'],r:['3.00-10','2.75-12','90/100-12','90/100-14','90/100-16','100/90-19','110/90-19','120/80-19']},road:'NHS',src:['plews-tyres']},
 {brand:'Plews',model:'MX3 Foxhills GP',terrain:['hard'],position:'both',current:true,note:'Super-hard, fast and stony tracks; compound and tread made against chipping and chunking.',
  sizes:{f:['60/100-12','60/100-14','70/100-17','70/100-19','80/100-21'],r:['80/100-12','90/100-14','90/100-16','120/90-18','100/90-19','110/90-19','120/90-19']},road:'NHS; 80/100-21 and 120/90-18 also DOT/ECE',src:['plews-tyres']},
 {brand:'Goldentyre',model:'GT232N',terrain:['soft_intermediate'],position:'rear',current:true,note:'Mid-soft rear (from a retail listing; Goldentyre\'s own pages were not reachable).',src:['goldentyre-retail']},
];

/** How to choose, in BAK's words. */
export const choosingTires:string[]=[
 'Match the tire to the dirt most of the track is, not the one wet corner: soft or sandy (a finger pushes in), intermediate (loam that packs), or hard (a finger will not go in, shiny or blue-groove).',
 'A soft-to-intermediate tire covers most amateur tracks; a dedicated sand, mud or hard-pack tire is worth it when that is the track every week.',
 'Soft-terrain tires have taller, wider-spaced knobs that dig in and clean out; hard-terrain tires have more, lower knobs with more rubber on the ground. A soft tire on hard pack squirms and tears knobs; a hard tire in loam or sand will not dig and fills up.',
 'Mixing is normal: an intermediate or hard front with a softer rear, or a scoop or paddle-style rear only for deep sand and mud. Fit front-marked tires to the front and rear-marked tires to the rear.',
 'Terrain names are not compound hardness: Mitas makes its sand tire with its hardest compound and its hard-terrain tire with its softest. The same word (Soft, Mid Soft, Medium Hard, SM, MH) means different things from brand to brand.',
 'Rough, rutted, poorly prepared tracks chunk soft race compounds; a harder-wearing tire (Pirelli\'s Mid Hard, Michelin\'s Medium Hard, Plews\' MX3) is the safer pick there and for practice.',
 'Off-road and enduro tires with an 18-inch rear (and adventure, dual-sport, trials and rally tires) are made for other bikes and riding; they are not motocross tires. Most motocross tires are marked NHS (not for highway service).',
];

/** Common sizes. From bike makers' manuals and spec pages in BAK's research and tire makers' size lists. */
export const sizes={
 full_size_front:'80/100-21 is the stock front on every full-size motocross bike in BAK\'s list; 90/100-21 is the wider option some makers offer (Michelin, Pirelli, Bridgestone, Kenda, Mitas), with a bigger footprint.',
 rear_19:'19-inch rears: 100/90-19 (125s, many 250Fs, Suzuki RM-Z250, GasGas MC models), 110/90-19 (most 250F and 350, Suzuki RM-Z450, European 450s), 120/80-19 (US 450s from KTM, Husqvarna, Kawasaki). 120/90-19 is a taller option some makers list. The second number is the sidewall height as a percentage of the width.',
 rear_18:'18-inch rears (100/100-18, 110/100-18, 120/90-18, 140/80-18) are fitted to cross-country and enduro models, not motocross models.',
 minis:'50s: 60/100-12 or 2.50-10 front with a 2.75-10 rear (KTM-group 50s run 60/100-12 / 2.75-10). 65s: 60/100-14 front, 80/100-12 rear. 85s: small wheel 70/100-17 / 90/100-14, big wheel 70/100-19 / 90/100-16 (Yamaha YZ85LW, Kawasaki KX112, KTM-group 19/16).',
 rule:'Take the size from the bike maker\'s manual for the exact model and year; a size change moves the overall diameter, the feel of the gearing and clearance at the swingarm and chain guide. A tire\'s load index (51M, 62M) belongs to its size; check it matches the sidewall.',
 src:['bike-manuals','bike-manuals-tires','dunlop-mx34-specs','pirelli-offroad-2026','mitas-tfmx-pdf','bridgestone-databook-2026','michelin-sc5-mini'],
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
 {who:'Bridgestone',applies:'Battlecross motocross tires, all sizes',both:'10–15 psi recommended',src:'bridgestone-databook-2026'},
 {who:'Mitas',applies:'Motocross hard terrain',both:'10–12 psi (0.66–0.80 bar)',src:'mitas-pressures'},
 {who:'Mitas',applies:'Motocross intermediate and soft terrain',both:'12–14 psi (0.80–0.93 bar)',src:'mitas-pressures'},
 {who:'Pirelli',applies:'Event guide for a Florida amateur national (sandy loam), all tires',both:'14 psi',src:'pirelli-mini-os-2020'},
];
/** What bike makers print for their own bikes, as a cross-check. The exact bike's figure in verified claims comes first. */
export const bikeMakerPressures:string[]=[
 'KTM, Husqvarna and GasGas motocross bikes and minis: 1.0 bar (about 14.5–15 psi) front and rear, cold, off-road.',
 'Honda CRF250R and CRF450R: 100 kPa (15 psi) front and rear. Yamaha YZ65 and YZ85: 100 kPa (15 psi).',
 'Suzuki RM-Z250 and RM-Z450: a 70–110 kPa (10–16 psi) range.',
 'Kawasaki KX65: an 80–100 kPa (11–14 psi) range; KX85 and KX112: 100–125 kPa (14.5–18.1 psi).',
];
export const bikeMakerSrc=['bike-manuals','bike-manuals-tires'];
export const pressureDisagreement='Makers differ on hard pack: Dunlop keeps the rear at its highest figure on hard and intermediate dirt and Kawasaki says to raise pressure on pebbly or hard tracks, while Mitas lists its lowest range for hard terrain. Hard and smooth or slick favours a little lower for grip; hard with rocks, square edges or big landings favours higher to protect the rim.';
export const terrainPressure:TerrainPressure[]=[
 {id:'sand',terrain:'Sand and deep soft dirt',direction:'Toward the low end of the range, mostly at the rear.',why:'A softer carcass spreads into a longer footprint and floats rather than digging.',maker_figures:'Dunlop drops the rear to 11–12 psi in soft conditions; Michelin\'s minimum with a tube is 0.8 bar (11.6 psi); Kawasaki says to lower pressure on sandy, muddy or slippery tracks.',watch:'Buried rocks and hard landings in sand still pinch tubes; stop at the first rim strike.',src:['dunlop-offroad-facts','michelin-pressure-offroad','bike-manuals-tires']},
 {id:'mud',terrain:'Mud',direction:'Usually unchanged, or a little lower if the track slows and grip is the problem; the bigger gain is a mud or sand tire.',why:'Lower pressure can help the knobs bite, but mud hides rocks and ruts, and a heavy, mud-packed bike hits harder.',maker_figures:'No tire maker publishes a separate mud pressure; Kawasaki\'s manuals say lower for wet or muddy tracks.',watch:'Clean packed mud from the tread; it hurts grip on the next ride.',src:['michelin-pressure-offroad','bike-manuals-tires']},
 {id:'hard_slick',terrain:'Hard pack and slick, smooth',direction:'A little lower within the range for grip, if there are no square edges or rocks.',why:'More footprint and a carcass that conforms to a hard surface rather than skating over it.',maker_figures:'Mitas lists 10–12 psi for hard terrain; Dunlop keeps the rear at 14 psi.',watch:'Lower pressure puts more force through tire and wheel on hard hits.',src:['mitas-pressures','dunlop-offroad-facts','wsx-tyres']},
 {id:'rocks',terrain:'Rocks, roots, square edges, big landings',direction:'Higher within the range.',why:'Protects the rim and tube from pinching and keeps the tire from folding on edges.',maker_figures:'Kawasaki says to raise pressure on pebbly or hard tracks to prevent damage and punctures, accepting more skidding.',watch:'Too high deflects and loses grip; that feels like harsh suspension.',src:['michelin-pressure-offroad','dunlop-track-guide','bike-manuals-tires']},
 {id:'sticky_prepped',terrain:'Sticky, prepared or watered dirt',direction:'Slightly higher can calm a tire that grabs and folds.',why:'A firmer carcass on tacky dirt reduces the grabby, rolling feel.',watch:'Recheck as the track dries; it changes through the day.',src:['wsx-tyres']},
 {id:'heat',terrain:'Hot days and long motos',direction:'Set cold and allow for the rise.',why:'Heat raises pressure through the moto; the tire feels firmer late on.',watch:'Do not set it hot to the cold figure.',src:['pressure-guide-retailer','michelin-pressure-offroad']},
];

// ---------------------------------------------------------------------------------------------------------------
// Tubes, heavy-duty tubes, mousse, TUbliss.
export const inserts:InsertOption[]=[
 {id:'standard_tube',name:'Standard tube',weight:'Lightest of the usual options.',feel:'Lively; pressure tunes the feel.',flat_protection:'Least: pinch flats when run low or on rocks.',pressure:'Fully adjustable.',life_and_heat:'Fit a new tube with each new tire; old tubes stretch and crease.',cost:'Cheapest.',install:'Standard tire change; rim lock needed.',best_for:'Most motocross, and supercross pros run tubes front and rear for low weight and a livelier bike.',src:['dunlop-care-pdf','wsx-tyres']},
 {id:'heavy_duty_tube',name:'Heavy-duty or ultra-heavy-duty tube',weight:'A heavy-duty tube is about 2–3 lb; ultra-heavy-duty walls are around 4 mm thick (Pirelli\'s reinforced tubes are 3 mm).',feel:'Slightly deader than a standard tube, still adjustable.',flat_protection:'Much better pinch and puncture resistance, but it can still go flat.',pressure:'Fully adjustable.',life_and_heat:'Same care as a standard tube.',cost:'More than a standard tube, far less than a mousse.',install:'Standard tire change, a little harder to fit.',best_for:'Riders who flat at rocky tracks and want to keep a pressure they can tune.',src:['mousse-guide-retailer','michelin-uhd-listing','pirelli-offroad-2026']},
 {id:'mousse',name:'Mousse (foam insert: Michelin Bib Mousse, Pirelli, Plews, Nuetech Nitromousse and others)',weight:'Heavier than a tube in independent weighings (about 4.5–5 lb on average); Michelin says its Bib Mousse is lighter than a reinforced tube.',feel:'Damped and dead compared with a tube; new mousses start firm and soften with use. At full compression a mousse acts like solid rubber.',flat_protection:'No flats from punctures or pinches.',pressure:'None to set. Michelin: about 13 psi (0.8–1.0 bar) equivalent; Pirelli: a new mousse feels like about 0.7 bar (±0.1); Plews: High Durability 12–14 psi, Standard 10–12, Soft 6–8, Extreme 2–4; Nitromousse Platinum 10–12 psi, Plushie 6–8 psi.',life_and_heat:'Michelin: first use within 18 months of manufacture and use within 6 months of fitting, much less in motocross than enduro; keep under 130 km/h (80 mph); avoid above 40°C, store below 30°C. Heat from wheelspin followed by hard whoops is the hardest case.',cost:'Roughly the price of several heavy-duty tubes each.',install:'Hard: the maker\'s gel every fit (new or used), tire spoons, often a bead tool and a second pair of hands; seal spoke nipples and keep the rim lock. Michelin and Pirelli make theirs for their own tires; Pirelli advises against using its mousse in other brands. Pirelli says to check the suspension setting when first fitting one.',best_for:'Off-road racing and riders who cannot afford a flat; some motocross riders run one in the rear only. A soft or worn mousse can feel like low pressure.',src:['michelin-bib-mousse','michelin-bib-mousse-chart','pirelli-offroad-2026','plews-tyres','nitromousse-listing','mousse-guide-retailer','nitromousse-test']},
 {id:'tubliss',name:'TUbliss (Nuetech tubeless system)',weight:'Lighter than a tube: about a pound less than a standard rear tube and up to about 2 lb less than heavy-duty tubes; kits weigh under 2 lb including the lock.',feel:'Tubeless feel; lets the tire run lower for grip.',flat_protection:'No pinch flats; the high-pressure core holds the bead on the rim and protects it. Punctures can be plugged at the track; sealant goes in the tire only.',pressure:'Core at 100 psi before every ride (it loses about 1 psi a day and some at every gauge check). The tire can run at least 2 psi lower than with a tube; go down 1 psi at a time.',life_and_heat:'Two pressures to check; a loose valve core is the usual fault.',cost:'Similar to a mousse per wheel.',install:'New tires only (not ones mounted with a standard rim lock), no tire machine, smooth spoons; the core takes the place of the rim lock. Works on dented rims. Big-wheel kits are 18, 19 and 21 inch.',best_for:'Off-road and rocky tracks where low pressure and no pinch flats matter; off-road use only.',src:['nuetech-tubliss-guide','tubliss-kit-listing','tubliss-test']},
];
export const insertPractice='In motocross most amateurs run tubes. Supercross pros run tubes front and rear; some outdoor and world-championship riders run mousse, and mousse and TUbliss are common in off-road racing. No published motocross rule against them was found here; check the series rulebook.';
/** Which insert fits which tire size, from the insert and tire makers' own charts. */
export const insertFit:InsertFit[]=[
 {id:'bib_mousse',name:'Michelin Bib Mousse (for Michelin tires)',kind:'mousse',rows:[['M15','80/100-21'],['M16','90/100-21'],['M22','100/90-19'],['M199','110/90-19, 120/80-19'],['M18','100/100-18, 110/100-18'],['M14','120/90-18, 140/80-18']],note:'Michelin pairs each with a 21, 19 or 18-inch ultra-heavy-duty tube size as the tube alternative.',src:['michelin-bib-mousse-chart']},
 {id:'pirelli_mousse',name:'Pirelli mousse (X = motocross, E = enduro)',kind:'mousse',rows:[['X-21 B2','80/100-21, 90/100-21'],['X-19 D2','100/90-19'],['X-19 E1','110/90-19'],['X-19 F2','120/80-19, 120/90-19'],['E-18 F1','100/100-18, 110/100-18, 120/90-18'],['E-18 H1','120/100-18, 140/80-18']],note:'Medium hardness; supplied with Pirelli fitting gel.',src:['pirelli-offroad-2026']},
 {id:'plews_mousse',name:'Plews Ultra Mousse',kind:'mousse',rows:[['65cc','60/100-14 front, 80/100-12 rear'],['85cc','70/100-19 front, 90/100-16 rear'],['Front','80/100-21; 90/100-21'],['Rear','100/90-19; 110/90-19']],note:'Four compounds: High Durability, Standard, Soft, Extreme (see feel).',src:['plews-tyres']},
 {id:'nitromousse',name:'Nuetech Nitromousse',kind:'mousse',rows:[['18–21 inch','sized by tire brand and size on Nuetech\'s chart']],note:'Exact chart not confirmed from Nuetech in this pass.',src:['nitromousse-listing']},
 {id:'bridgestone_tubes',name:'Bridgestone TR-4 tubes (standard, MX-HD, MX-UHD)',kind:'tube',rows:[['21','80/100, 90/90, 90/100-21 (HD and UHD)'],['19','100/90-19; 110/90 and 120/80-19 share one (HD and UHD)'],['18','100/100-18; 110/100, 120/90 and 140/80-18 share one (HD and UHD)'],['Minis (standard)','2.50/70/100-10; 60/100-12; 2.75/80/100-12; 60/100-14; 90/100-14; 90/100-16; 70/100-17; 70/100-19']],note:'Heavy-duty tubes are listed in big-bike sizes only.',src:['bridgestone-databook-2026']},
 {id:'pirelli_tubes',name:'Pirelli tubes (21 B / 10 B are reinforced, 3 mm)',kind:'tube',rows:[['10 B 21','80/100-21, 90/90-21, 90/100-21'],['21 B 19','100/90-19 to 140/80-19, incl. 110/90 and 120/80-19'],['21 B 18','100/100-18 to 140/80-18'],['MH 19','70/100-19'],['MB 16','90/100-16'],['MA 17','70/100-17'],['MB 14','90/100-14'],['MA 14','60/100-14'],['MA 12 / MH 12','80/100-12 / 60/100-12'],['MA 10','2.50-10, 2.75-10']],note:'',src:['pirelli-offroad-2026']},
 {id:'tubliss_fit',name:'Nuetech TUbliss Gen 2.0',kind:'tubeless',rows:[['21 inch','1.60 in rims'],['19 inch','1.85–2.15 in rims'],['18 inch','1.85–2.15 in rims']],note:'Big-wheel kits only in the sources read; no mini kit seen.',src:['tubliss-kit-listing','nuetech-tubliss-guide']},
];

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
  'Replace when the edges are gone or knobs are tearing, not when the tire is bald: grip goes long before the rubber does. No tire maker publishes an hours or rides interval for motocross tires.',
  'The rear wears much faster than the front; a fresh rear makes the biggest difference off the start and out of corners.',
  'A new front with a badly worn rear can make the bike unstable; replace them together when the rear is worn out.',
  'Age: KTM, Husqvarna and GasGas say change tires after 5 years at the latest regardless of wear; Dunlop wants tires over 5 years old inspected yearly and replaced at 10 years from manufacture. The date is the last four digits of the DOT code (week, year).',
 ],
 depth:[
  'Yamaha\'s YZ65 and YZ85 manuals give a 4.0 mm minimum tread depth.',
  'New knob height to compare against: Dunlop MX34 80/100-21 about 13.5 mm (17/32 in), 19-inch rears about 18 mm (23/32 in); Bridgestone X40 fronts 14/32 in, rears 18–20/32 in; Maxxis MX-ST 80/100-21 15/32 in, 19-inch rears 20–21/32 in.',
  'Makers\' life claims: Pirelli says the MX32 Mid Hard lasts longer on average than the Mid Soft; Dunlop says the MX34 holds its performance up to 30% longer than the MX33.',
 ],
 rim_locks:[
  'The rim lock stops the tire slipping round the rim under braking and drive, which tears the valve stem out of the tube.',
  'Stock motocross wheels use one per wheel, sized to the rim width: KTM, Husqvarna and GasGas list a 1.60 in lock front and a 2.15 in lock rear; Honda calls it a bead stopper; Kawasaki a bead protector. A lock for the wrong rim width will not clamp properly.',
  'Tighten it after the bead is seated and before setting pressure; check it before every ride.',
  'A valve stem that leans means the tire or tube has moved: let the air out, straighten it and re-seat.',
  'With TUbliss the core takes the rim lock\'s place.',
 ],
 mounting:[
  'Lube the beads with soapy water; never go above 40 psi to seat a bead; if it will not seat, deflate, re-lube and try again.',
  'Powder the tube, give it just enough air to hold its shape, keep it out from under the rim lock and away from the spoon, then deflate and reinflate once seated to settle it.',
  'Mousse: use the maker\'s gel on every fit, new or used; TUbliss: align the tire\'s light spot with the valve.',
  'Ride the first laps on a new tire easy until you know where its grip ends, then recheck the pressure once it is cool.',
  'Store tires dry and out of sun, away from motors and chargers (ozone); wipe off fuel at once.',
 ],
 src:['dunlop-care','dunlop-care-pdf','dunlop-offroad-pdf','dunlop-mx34-specs','dunlop-mx34','bridgestone-databook-2026','maxxis-mx-st','pirelli-offroad-2026','bike-manuals-tires','oem-parts-rimlock','replace-guide-retailer','rimlock-guide-retailer','wsx-tyres','nuetech-tubliss-guide','michelin-bib-mousse'],
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
export const proSrc=['wsx-tyres','michelin-choose-mx'];

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
const BRAND=/\b(dunlop|michelin|pirelli|bridgestone|maxxis|kenda|shinko|irc|mitas|metzeler|plews|goldentyre|geomax|starcross|scorpion|battlecross|maxx ?cross|mx ?3[34s]|mx ?14|mx ?5[34]|mx ?71|mx ?12|mx ?32|mx-?s[timn]\+?|mx-?ih|terra ?force|mc ?360|vx ?[34]0|washougal|millville|southwick ii|sand mad|extra x|hawkstone|matterly|foxhills|gt ?232n?)\b/i;
const PRESSURE_WORD=/\b(psi|pressures?|inflat\w*|deflat\w*|air (it )?(up|down))\b|\b\d+(\.\d+)?\s?bar\b/i;
const SUSPENSION_AIR=/\b(fork|forks|shock|nitrogen|reservoir|air fork|oil|radiator|fuel|compression)\b/i;
const PRESSURE_CONTEXT=/\b(front|rear|sand|mud|hard ?pack|rocks?|track|run|running|minis?|85|65|mousse|tube|tubliss)\b/i;
const NON_TIRE_TUBES=/\b(fork|upper|lower|outer|inner fork|head|frame|exhaust|down|top|throttle|pitot|breather|vent|overflow)\s+tubes?\b|\btubes? (in|through|above|showing|height)\b/gi;
const INSERT_WORD=/\b(mousses?|bib ?mousse|nitro ?mousse|nitromousse|tubliss|tubeless|inner ?tubes?|heavy[- ]duty tubes?|uhd|tubes?|foam insert)\b/i;
const FLAT_WORD=/\b(pinch(ed)? flats?|flat tires?|flat tyres?|got a flat|get(ting)? (a )?flats?|keep flatting|flatted|flats? (every|all the time|at)|punctur\w*|valve stems?|rim ?locks?|bead (stopper|protector)s?|rim strikes?|dinged rims?|bent rims?)\b/i;
const WEAR_WORD=/\b(worn|wear(s|ing)?|replace|new (tires?|tyres?|rear|front)|last(s)?|knobs? (torn|tearing|rounded|chunk\w*|missing)|chunk(ing|ed)?|break[- ]?in|mount(ing)?|change (my |the )?(tires?|tyres?|rear|front)|old|age|hours|tread depth)\b/i;
const CHOICE_WORD=/\b(which|best|recommend|choose|pick|should i (run|get|buy|use)|compare|vs\.?|versus|better|good for|for (sand|mud|hard|soft))\b/i;
const SIZE_RX=/\b(\d{2,3}\/\d{2,3}|\d\.\d{2})[- ]?(\d{2})\b/;
const SIZE_WORD=/\b\d{2,3}\/\d{2,3}[- ]?\d{2}\b|\b(10|12|14|16|17|18|19|21)[- ]?(inch|in\b|")|\b(big|small) wheel\b/i;
const FIT_WORD=/\b(size|sizes|fit|fits|fitment|come in|available in|what size)\b/i;
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
const ADJACENT:Record<string,Terrain[]>={sand:['sand','soft'],mud:['mud','sand'],soft:['soft','soft_intermediate','sand'],intermediate:['intermediate','soft_intermediate','intermediate_hard','all_round'],hard:['hard','intermediate_hard']};

// ---- Wheel sizes: from the rider's bike (when known) or the message.
export type Wheels={front:string[];rear:string[];why:string};
const rimOf=(size:string)=>size.match(/-(\d{2})$/)?.[1]??'';
/** The rim diameters a bike runs, from its model name. Null when the model is not recognised. */
export function wheelsFor(bike?:TireBike|null):Wheels|null{
 const m=`${bike?.manufacturer??''} ${bike?.model??''}`.trim();
 if(!bike?.model)return null;
 if(/\b(50 SX|TC 50|MC 50|PW50|CRF50)\b/i.test(m))return {front:['10','12'],rear:['10'],why:'50cc'};
 if(/\b(65 SX|TC 65|MC 65|KX65|YZ65)\b/i.test(m))return {front:['14'],rear:['12'],why:'65cc'};
 if(/19\/16|\bLW\b|big wheel|KX112|KX 112/i.test(m))return {front:['19'],rear:['16'],why:'big-wheel 85/112'};
 if(/17\/14|small wheel/i.test(m))return {front:['17'],rear:['14'],why:'small-wheel 85'};
 if(/\b(85 SX|TC 85|MC 85|KX85|YZ85|RM85|CRF150R|CRF125F)\b/i.test(m))return {front:['17','19'],rear:['14','16'],why:'85 or 150 (small and big wheel)'};
 // Cross-country and enduro models run an 18-inch rear.
 if(/\b(XC-?W|XCF-?W|XC(?!-F)\b|TE \d|FE \d|FX \d|TX \d|EX \d|EC \d|WR\d|YZ\d{3}F?X\b|CRF\d{3}RX|KX\d{3}X\b|TF \d{3}-E)\b/i.test(m)||/\bXC-F\b/i.test(m))return {front:['21'],rear:['18'],why:'cross-country / enduro (18-inch rear)'};
 return {front:['21'],rear:['19'],why:'full-size motocross'};
}
function wheelsFromText(text:string):Wheels|null{
 if(/\b(50s?|50cc|pee ?wee)\b/i.test(text)&&/\b(mini|50|kid|youth)\b/i.test(text))return {front:['10','12'],rear:['10'],why:'50cc (from the message)'};
 if(/\b65s?\b|\b65cc\b/i.test(text))return {front:['14'],rear:['12'],why:'65cc (from the message)'};
 if(/\b(85|112|150)\b/.test(text)&&/\bbig[- ]wheel\b|19\/16/i.test(text))return {front:['19'],rear:['16'],why:'big-wheel 85 (from the message)'};
 if(/\b(85|112|150)\b/.test(text)&&/\bsmall[- ]wheel\b|17\/14/i.test(text))return {front:['17'],rear:['14'],why:'small-wheel 85 (from the message)'};
 if(/\b85s?\b|\b85cc\b|supermini|\b112\b/i.test(text))return {front:['17','19'],rear:['14','16'],why:'85 (from the message)'};
 return null;
}
const sizesFor=(l:TireLine,w:Wheels|null)=>{
 const s=l.sizes;if(!s)return null;
 const f=(s.f??[]).filter(x=>!w||w.front.includes(rimOf(x))),r=(s.r??[]).filter(x=>!w||w.rear.includes(rimOf(x)));
 const fD=(s.fD??[]).filter(x=>!w||w.front.includes(x)),rD=(s.rD??[]).filter(x=>!w||w.rear.includes(x));
 return {f,r,fD,rD};
};
/** Does the line come in a size for these wheels? null = no size data for the line. */
const fitsWheels=(l:TireLine,w:Wheels)=>{const s=sizesFor(l,w);if(!s)return null;return !!(s.f.length||s.r.length||s.fD.length||s.rD.length);};
const sizeText=(l:TireLine,w:Wheels|null,exact?:string)=>{
 const s=sizesFor(l,w);if(!s)return ' Sizes: not confirmed from the maker.';
 const pick=(xs:string[])=>exact?xs.filter(x=>x===exact):xs;
 const f=pick(s.f),r=pick(s.r);
 const parts=[f.length?`F ${f.join(', ')}`:'',r.length?`R ${r.join(', ')}`:'',!exact&&s.fD.length?`F ${s.fD.join('/')}-inch`:'',!exact&&s.rD.length?`R ${s.rD.join('/')}-inch`:''].filter(Boolean);
 return parts.length?` Sizes${w?' for these wheels':''}: ${parts.join('; ')}.`:(w?' No size listed for these wheels.':'');
};
const lineText=(l:TireLine,w:Wheels|null,withSizes:boolean,exact?:string)=>`${l.brand} ${l.model} (${posLabel(l.position)}${l.current?'':', older line'}): ${l.note}${l.build?' '+l.build:''}${l.road?` Marked ${l.road}.`:''}${withSizes?sizeText(l,w,exact):''}`;

/** Names distinctive enough to identify a line on their own (generic words like "Sand" or "Medium Soft" are not). */
const modelKey=(l:TireLine)=>{const m=l.model.replace(/^(Geomax|Battlecross|Maxxcross|Scorpion|Terra Force-MX|Starcross)\s*/,'');
 return /\d/.test(m)||/Washougal|Millville|Southwick|Sand Mad|Extra X|Cheater|Hawkstone|Matterly|Foxhills|Factory Spec/.test(m)?m.replace(/[+]/g,'').replace(/\//g,'\\/?').replace(/[\s-]+/g,'[\\s-]*'):null;};
const brandRx=(b:string)=>new RegExp(`\\b${b}\\b`,'i');
export function brandsIn(text:string):string[]{
 return [...new Set(tireLines.filter(l=>{const k=modelKey(l);return brandRx(l.brand).test(text)||(k!==null&&new RegExp(`\\b${k}\\b`,'i').test(text));}).map(l=>l.brand))];
}
function selectLines(text:string,budgetLines:number,w:Wheels|null){
 const brands=brandsIn(text);
 const terrains=TERRAIN_WORDS.filter(([,rx])=>rx.test(text)).map(([t])=>t);
 const wantFront=/\bfront\b/i.test(text)&&!/\brear\b/i.test(text),wantRear=/\brear\b/i.test(text)&&!/\bfront\b/i.test(text);
 const exactM=text.match(SIZE_RX);const exact=exactM?`${exactM[1]}-${exactM[2]}`:undefined;
 let pool=tireLines.filter(l=>!(wantFront&&l.position==='rear')&&!(wantRear&&l.position==='front'));
 const allowed=new Set(terrains.flatMap(t=>ADJACENT[t]??[t]));
 const mini=!!w&&!w.front.includes('21');
 if(mini||/\b(minis?|50s?|65s?|85s?|supermini|pee ?wee)\b/i.test(text)){allowed.add('mini');terrains.push('mini');}
 const named=(l:TireLine)=>{const k=modelKey(l);return k!==null&&new RegExp(`\\b${k}\\b`,'i').test(text)||new RegExp(`\\b${l.brand}\\s+${l.model.replace(/[+]/g,'').replace(/\//g,'\\/?').replace(/[\s-]+/g,'[\\s-]*')}\\b`,'i').test(text)||(!!l.model.match(/^Starcross 6 /)&&new RegExp(l.model.replace('Starcross 6 ','starcross ?6? ?'),'i').test(text));};
 const asked=tireLines.filter(named);
 // With the rider's wheels known, drop lines that are not made in a size for them (lines with no size data stay, ranked lower).
 if(w)pool=pool.filter(l=>fitsWheels(l,w)!==false);
 if(exact)pool=pool.filter(l=>[...(l.sizes?.f??[]),...(l.sizes?.r??[])].includes(exact));
 const score=(l:TireLine)=>(brands.includes(l.brand)?4:0)+(l.terrain.some(t=>allowed.has(t))?2:0)+(l.terrain.some(t=>terrains.includes(t))?1:0)+(l.current?0.5:0)+(w&&fitsWheels(l,w)?1:0)+(mini&&l.terrain.includes('mini')?1:0);
 if(brands.length||terrains.length)pool=pool.filter(l=>brands.includes(l.brand)||l.terrain.some(t=>allowed.has(t)));
 pool=[...pool].filter(l=>!asked.includes(l)).sort((a,b)=>score(b)-score(a)).slice(0,Math.max(0,budgetLines-asked.length));
 // Sizes ride along when they are what makes the answer: a named line, known wheels, an exact size or a fit question.
 const withSizes=!!w||!!exact||FIT_WORD.test(text);
 const by:Record<string,string[]>={};
 for(const l of pool){const k=TERRAIN_LABEL[l.terrain.find(t=>t!=='mini')??l.terrain[0]];(by[k]??=[]).push(lineText(l,w,withSizes,exact));}
 return {focus:{brands,terrains,position:wantFront?'front':wantRear?'rear':'both',...(w?{wheels:`${w.front.join('/')}-inch front, ${w.rear.join('/')}-inch rear (${w.why})`}:{}),...(exact?{size:exact}:{})},
  ...(asked.length?{asked_about:asked.map(l=>`${lineText(l,w,true)} Terrain: ${l.terrain.map(t=>TERRAIN_LABEL[t]).join(', ')}.`)}:{}),lines_by_terrain:by};
}
function selectTerrainPressure(text:string){
 const ids=new Set<string>();
 if(/\b(sand|sandy|soft|loam|deep)\b/i.test(text))ids.add('sand');
 if(/\b(mud|muddy|wet|rain)\b/i.test(text))ids.add('mud');
 if(/\b(hard ?pack|hardpack|hard|slick|clay|dry)\b/i.test(text))ids.add('hard_slick');
 if(/\b(rocks?|rocky|roots?|square[- ]edge|landings?|rim|pebbl\w*)\b/i.test(text))ids.add('rocks');
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
/** Insert fitment rows for the rider's wheels (or every row when the wheels are unknown), only for the kinds asked about. */
function selectInsertFit(text:string,w:Wheels|null){
 const kinds=new Set<string>();
 if(/\bmousses?\b|foam/i.test(text))kinds.add('mousse');
 if(/\btubes?\b|heavy[- ]duty|uhd/i.test(text))kinds.add('tube');
 if(/tubliss|tubeless/i.test(text))kinds.add('tubeless');
 if(!kinds.size)return null;
 // A size string fits when it is a front size on a front rim the bike runs, or a rear size on a rear rim it runs.
 const sizeFits=(sz:string)=>{const m=sz.match(/(\d\.\d{2}|\d{2,3})(?:\/\d{2,3})?-(\d{2})/);if(!m||!w)return false;
  const width=m[1].includes('.')?Number(m[1])*25.4:Number(m[1]),d=m[2];
  const front=d==='21'||(width<=80&&d!=='18'&&d!=='16'),rear=d==='18'||d==='16'||width>=80;
  return (front&&w.front.includes(d))||(rear&&w.rear.includes(d));};
 const keep=(row:[string,string])=>{if(!w)return true;if(/Minis/.test(row[0]))return !w.front.includes('21');if(/18–21/.test(row[0]))return w.front.includes('21');
  if(/65cc/.test(row[0]))return w.front.includes('14');if(/85cc/.test(row[0]))return w.rear.includes('16');
  const inch=row[0].match(/^(\d{2}) inch$/);if(inch)return w.front.includes(inch[1])&&inch[1]==='21'||w.rear.includes(inch[1]);
  const sizesIn=[...row[1].matchAll(/(?:\d\.\d{2}|\d{2,3}(?:\/\d{2,3})?)(?:, (?:\d{2,3}\/\d{2,3}))*-\d{2}/g)].map(x=>x[0]);
  const expanded=sizesIn.flatMap(x=>{const d=x.slice(-3);return x.slice(0,-3).split(', ').map(y=>y+d);});
  if(/^\d{2}$/.test(row[0])&&!expanded.length)return w.front.includes(row[0])||w.rear.includes(row[0]);
  return expanded.length?expanded.some(sizeFits):!/\d/.test(row[1]);};
 const out=insertFit.filter(f=>kinds.has(f.kind)).map(f=>({name:f.name,rows:f.rows.filter(keep).map(([a,b])=>`${a}: ${b}`),...(f.note?{note:f.note}:{})})).filter(f=>f.rows.length);
 return out.length?out:null;
}

/** Rough budget: about 2.5k tokens of JSON, at roughly four characters a token. */
export const TIRE_KNOWLEDGE_MAX_CHARS=9600;

/** A compact tire section for Ask BAK, or null when the conversation is not about tires, grip, pressure, flats,
 *  inserts or a handling complaint where a tire is a likely cause. history: earlier rider messages, oldest first.
 *  bike (optional): the rider's bike, used to keep tire lines, sizes and insert rows to the wheels it runs. */
export function tireKnowledge(message:string,history?:string[],bike?:TireBike|null):TireSection|null{
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
 // The message's own wheel words win over the saved bike ("what about for my son's 65?").
 const wheels=wheelsFromText(text)??wheelsFor(bike);
 const onlySymptoms=topics.size===1&&topics.has('symptoms');
 const out:TireSection={version:TIRE_KNOWLEDGE_VERSION,
  boundary:'BAK-authored tire knowledge for gas motocross from tire, insert and bike makers\' public guidance. Tire-maker pressure ranges are general starting guidance, never this bike\'s published value: the bike maker\'s cold figure for the exact bike comes first, and changes are steps from the rider\'s current pressure. Size lists are what each maker lists; a line not listed in a size is not made in it as far as BAK knows. Name tire brands and models freely; never name a magazine, tester, retailer or rider as the source. Where makers differ, give the spread and who says what.',
  topics:[...topics]};
 if(fromHistory)out.from_history=true;
 // Sections in priority order; each is added only while the whole stays inside the budget.
 const parts:[string,()=>unknown][]=[];
 if(topics.has('symptoms'))parts.push(['symptom_checks',()=>({ask:tireAsk,checks:strip(tireSymptoms.filter(s=>symptoms.includes(s.id)))})]);
 if(topics.has('pressure')||onlySymptoms)parts.push(['pressure',()=>onlySymptoms?{rules:pressureRules.slice(0,4)}:{rules:pressureRules,maker_ranges_cold:strip(pressureRanges),bike_makers_print:bikeMakerPressures,makers_differ:pressureDisagreement,by_conditions:strip(selectTerrainPressure(text))}]);
 if(topics.has('inserts'))parts.push(['tubes_mousse_tubliss',()=>{const fit=selectInsertFit(text,wheels);return {options:strip(selectInserts(text)),practice:insertPractice,...(fit?{fitment:fit}:{})};}]);
 if(topics.has('wear'))parts.push(['wear_and_fitting',()=>strip(/\brim ?locks?|bead (stopper|protector)|valve stem|mount|fit(ting)?|seat|install|bead/i.test(text)?{rim_locks:wear.rim_locks,mounting:wear.mounting,signs:wear.signs}:{signs:wear.signs,when:wear.when,depth:wear.depth,rim_locks:wear.rim_locks.slice(0,2)})]);
 if(topics.has('choice'))parts.push(['choosing',()=>{const sel=selectLines(text,topics.size>2?10:20,wheels);return {how_to_choose:topics.size>2?choosingTires.slice(0,3):choosingTires,...sel};}]);
 if(topics.has('sizes'))parts.push(['sizes',()=>{const s=strip(sizes);const sel=topics.has('choice')?null:selectLines(text,8,wheels);return sel&&(sel.focus.size||wheels)?{...s,lines_in_size:sel.lines_by_terrain}:s;}]);
 if(topics.has('pro'))parts.push(['pro_practice',()=>proPractice]);
 for(const [k,f] of parts){
  const v=f();out[k]=v;
  if(JSON.stringify(out).length>TIRE_KNOWLEDGE_MAX_CHARS){
   // Try trimmed forms before dropping the section.
   if(k==='choosing'){for(const n of [8,5,3]){const sel=selectLines(text,n,wheels);out[k]={how_to_choose:choosingTires.slice(0,2),...sel};if(JSON.stringify(out).length<=TIRE_KNOWLEDGE_MAX_CHARS)break;}}
   else if(k==='tubes_mousse_tubliss'){const o=v as {options:InsertOption[];fitment?:unknown};out[k]={options:o.options.map(i=>({id:i.id,name:i.name,pressure:i.pressure,flat_protection:i.flat_protection,best_for:i.best_for})),practice:insertPractice,...(o.fitment?{fitment:o.fitment}:{})};
    if(JSON.stringify(out).length>TIRE_KNOWLEDGE_MAX_CHARS)out[k]={options:o.options.map(i=>({id:i.id,name:i.name,pressure:i.pressure})),...(o.fitment?{fitment:o.fitment}:{})};}
   else if(k==='pressure'&&!onlySymptoms){const p=v as Record<string,unknown>;out[k]={rules:pressureRules.slice(0,4),maker_ranges_cold:p.maker_ranges_cold,bike_makers_print:bikeMakerPressures,by_conditions:p.by_conditions};}
   else if(Array.isArray(v))out[k]=v.slice(0,3);
   if(JSON.stringify(out).length>TIRE_KNOWLEDGE_MAX_CHARS)delete out[k];
  }
 }
 return out;
}
