/** BAK-authored rider-fit knowledge: fitting a gas motocross bike to the rider.
 *
 * Handlebar height, bend, clamp position and rotation; levers (angle, reach, free play); shift and brake pedals; seat
 * height and foam; footpegs; grips; fitting kids and knowing when a child has outgrown a bike; how to measure; and arm
 * pump where it ties to position. Per-make adjustment ranges come from the owner's manuals and handbooks that the
 * per-bike research records (docs/research/knowledge/fit_*.json, research ids "rfit") were taken from.
 *
 * Every fact carries a `src` id from FIT_SOURCES (full list with URLs and dates in docs/research/rider-fit/SOURCES.md).
 * `src` never reaches the model: riderFit() strips it. Rider-facing text names bike makers, bar and grip makers and their
 * products only, never a magazine, tester, retailer or rider. Where nothing is published BAK says so instead of
 * inventing a number; `bak-reasoning` marks a step worked out from the geometry, with no figures of its own.
 *
 * Status: AUTHORED from public maker pages, owner's manuals and handbooks on 2026-11-07, pending review by Kyle. Edit
 * here; the runtime reads this file.
 */
export const RIDER_FIT_VERSION='mx-fit-1';

export type Source={id:string;publisher:string;kind:'bike_maker'|'bar_maker'|'part_maker'|'safety'|'medical'|'tester'|'retailer'|'bak';url:string;published?:string;accessed:string};
export type Fact={text:string;src:string[]};
export type FitTopic='position'|'bars'|'levers'|'pedals'|'seat'|'pegs'|'grips'|'kids'|'measure'|'arm_pump';
export type FitSection={version:string;boundary:string;topics:FitTopic[];from_history?:boolean;rider?:Record<string,string>;[k:string]:unknown};

const A='2026-11-07';
const HONDA='https://cdn.powersports.honda.com/documentum/MWOM/ml.remawmom.';
/** Every source behind a fact here. Not rider-facing and never sent to the model. Kept in step with SOURCES.md. */
export const FIT_SOURCES:Source[]=[
 {id:'honda-2020-fit',publisher:'Honda, 2020 CRF450R/RX/RWE Owner\'s Manual & Competition Handbook, Personal Fit Adjustments',kind:'bike_maker',url:HONDA+'2020_31mke630_crf450r_rx_rwe.pdf',published:'2019',accessed:A},
 {id:'honda-handbooks',publisher:'Honda, CRF250R/CRF450R competition handbooks 2021-2027 (bar holder positions, lever and pedal adjustment)',kind:'bike_maker',url:HONDA+'amker2626chen.pdf',published:'2025',accessed:A},
 {id:'honda-om',publisher:'Honda, CRF250R/CRF450R owner\'s manuals 2023-2026, specifications (seat and footpeg height)',kind:'bike_maker',url:HONDA+'ak952525omen.pdf',published:'2024',accessed:A},
 {id:'honda-crf150r',publisher:'Honda, CRF150R/RB competition handbook 2026',kind:'bike_maker',url:HONDA+'akse2626chen.pdf',published:'2025',accessed:A},
 {id:'yamaha-osm-2020',publisher:'Yamaha, 2020 YZ250/YZ250X Owner\'s Service Manual (B9U-28199-11)',kind:'bike_maker',url:'https://library.ymcapps.net/library/om/contents/pdf/10/B9U-28199-11_02.pdf',published:'2019',accessed:A},
 {id:'yamaha-osm',publisher:'Yamaha, YZ owner\'s service manuals 2021-2027 (e.g. 2022 YZ125, B4X-2819U-10)',kind:'bike_maker',url:'https://library.ymcapps.net/library/om/contents/pdf/10/B4X-2819U-10_02.pdf',published:'2021',accessed:A},
 {id:'yamaha-yz450f-2023',publisher:'Yamaha Motor USA, 2023 YZ450F features',kind:'bike_maker',url:'https://yamahamotorsports.com/models/23-yz450f/features',accessed:A},
 {id:'yamaha-tall-seat',publisher:'Yamaha Motor USA accessories, Yamaha Tall Seat',kind:'bike_maker',url:'https://yamaha-motor.com/p/yamaha-tall-seat',accessed:A},
 {id:'ktm-om',publisher:'KTM, Husqvarna and GasGas owner\'s manuals 2020-2027 (e.g. 2026 KTM 450 SX-F, art. no. 3240236)',kind:'bike_maker',url:'https://azwecdnepstoragewebsiteuploads.azureedge.net/26_3240236_en_BA.pdf',published:'2025',accessed:A},
 {id:'ktm-85sx-om',publisher:'KTM, 2027 85 SX owner\'s manual (art. no. 3240375)',kind:'bike_maker',url:'https://azwecdnepstoragewebsiteuploads.azureedge.net/27_3240375_en_BA.pdf',published:'2026',accessed:A},
 {id:'ktm-low-seat',publisher:'KTM PowerParts low seat (79107940200), dealer catalogue listing',kind:'retailer',url:'https://ktmdirect.co.uk/products/ktm-low-seat-15mm',accessed:A},
 {id:'ktm-50sx-lowering',publisher:'KTM PowerParts 50 SX lowering kit (45412955044S), dealer catalogue listing',kind:'retailer',url:'https://ktmdirect.co.uk/collections/ktm-50-sx-powerparts-accessories/products/lowering-kit-68mm-45412955044s',accessed:A},
 {id:'ktm-50sx-spec',publisher:'KTM USA, 2025 50 SX technical specifications',kind:'bike_maker',url:'https://www.ktm.com/en-us/models/motocross/2-stroke/2025-ktm-50-sx/technical-specifications.html',accessed:A},
 {id:'ktm-65sx-spec',publisher:'KTM USA, 2025 65 SX technical specifications',kind:'bike_maker',url:'https://www.ktm.com/en-us/models/motocross/2-stroke/2025-ktm-65-sx/technical-specifications.html',accessed:A},
 {id:'yamaha-yz65-spec',publisher:'Yamaha Motor USA, 2025 YZ65 specifications',kind:'bike_maker',url:'https://yamahamotorsports.com/models/25-yz65/specs',accessed:A},
 {id:'yamaha-yz85-spec',publisher:'Yamaha Motor USA, 2025 YZ85 specifications',kind:'bike_maker',url:'https://www.yamahamotorsports.com/models/25-yz85/specs',accessed:A},
 {id:'kawasaki-kx65-spec',publisher:'Kawasaki USA, 2025 KX65 spec sheet',kind:'bike_maker',url:'https://www.kawasaki.com/en-us/products/ProductSpecSheetPDF/2025-kx65',accessed:A},
 {id:'kawasaki-kx85-spec',publisher:'Kawasaki USA, 2025 KX85 spec sheet',kind:'bike_maker',url:'https://www.kawasaki.com/en-us/products/ProductSpecSheetPDF/2025-kx85',accessed:A},
 {id:'kawasaki-kx112',publisher:'Kawasaki USA, 2025 KX112 model page',kind:'bike_maker',url:'https://kawasaki.com/en-us/motorcycle/kx/kx-youth-mx/kx-112/2025-kx112',accessed:A},
 {id:'kawasaki-om',publisher:'Kawasaki, KX250/KX450 owner\'s manuals 2020-2027, Adjustable Ergonomics (KTIVS public manual portal)',kind:'bike_maker',url:'https://pws.ktivs.net/proxy/manuals/99814-0061-o5kx252esf-us-en_ebook-1caab68fb1b6f0bd0aca70be564f27dd/index.html',published:'2024',accessed:A},
 {id:'kawasaki-2021-press',publisher:'Kawasaki, 2021 KX250 Model Information (press kit PDF)',kind:'bike_maker',url:'https://www.enduro.de/wp-content/uploads/2020/07/21_KX250_Model-Information.pdf',published:'2020-07',accessed:A},
 {id:'kawasaki-kx-page',publisher:'Kawasaki (Latin America), KX250 and KX450 model pages',kind:'bike_maker',url:'https://guatemala.kawasaki-la.com/en-la/motorcycle/kx/full-size-mx/kx-250',accessed:A},
 {id:'triumph-handbook',publisher:'Triumph, Owner\'s Handbook TF 250-X / TF 450-X / TF 450-RC Edition (3850672-US-EN)',kind:'bike_maker',url:'https://api.triumphtechnicalinformation.com/handbooks/documents/697b0a68aa5a3d37f2aa2ef0/pdf',accessed:A},
 {id:'triumph-tf250x',publisher:'Triumph Motorcycles Australia, TF 250-X',kind:'bike_maker',url:'https://www.triumphmotorcycles.com.au/motorcycles/off-road/motocross/tf-250-x-2024',accessed:A},
 {id:'renthal-2021-recs',publisher:'Renthal, selecting handlebar bends for modern motocross bikes',kind:'bar_maker',url:'https://www.renthal.com/moto/2021-recommendations',accessed:A},
 {id:'renthal-fatbar36-bends',publisher:'Renthal, Fatbar36 bends and dimensions',kind:'bar_maker',url:'https://renthal.com/moto/fatbar36-bends',accessed:A},
 {id:'renthal-839',publisher:'Renthal, 839 Fatbar product page',kind:'bar_maker',url:'https://www.renthal.com/moto/839-01-HA',accessed:A},
 {id:'renthal-827',publisher:'Renthal, 827 Fatbar (Villopoto/Stewart) product page',kind:'bar_maker',url:'https://www.renthal.com/moto/827-01-HA',accessed:A},
 {id:'renthal-604',publisher:'Renthal, 604 Fatbar (RC / Honda CRF 04-18 / Kawasaki KX/KXF 06-21) product page',kind:'bar_maker',url:'https://www.renthal.com/moto/604-01-HA',accessed:A},
 {id:'guts-foam',publisher:'GUTS Racing seat foam description, as published by a retailer',kind:'retailer',url:'https://gb.mojomotosport.com/products/guts-suzuki-rmz450-phantom-ultra-light-weight-seat-foam-stock-height-8601-ph',accessed:A},
 {id:'msf-parents',publisher:'Motorcycle Safety Foundation, Parents, Youngsters and Off-Highway Motorcycles (copy hosted by the City of Porterville OHV park)',kind:'safety',url:'https://cms9files.revize.com/PortervilleCA/Document_Center/Department/Parks%20&%20Leisure/Parks%20&%20Facilities/OHV%20Park/Parents.Youngsters.Dirt_Bikes.pdf',published:'2003',accessed:A},
 {id:'ama-kids',publisher:'American Motorcyclist Association, Getting Started: Riding With Kids',kind:'safety',url:'https://americanmotorcyclist.com/riding/riding-101/getting-started-riding-with-kids/',published:'2024-04-29 (modified)',accessed:A},
 {id:'lever-setup-mag',publisher:'Australian dirt bike magazine, lever adjustment tech article',kind:'tester',url:'https://adbmag.com.au/editorial/lever-adjustment/',published:'2023-06-21',accessed:A},
 {id:'venhill-controls',publisher:'Venhill (control cable and lever maker), lever and pedal adjustment article',kind:'part_maker',url:'https://www.venhill.co.uk/news/post/lever-and-pedal-adjustment-how-it-can-help-you-ride-further-and-faster',accessed:A},
 {id:'odowd-2021',publisher:'O\'Dowd et al., Forearm compartment pressures and grip strength in elite motorbike racers with CECS, J Orthop Surg Res 16:603',kind:'medical',url:'https://josr-online.biomedcentral.com/articles/10.1186/s13018-021-02765-z',published:'2021-10',accessed:A},
 {id:'bak-reasoning',publisher:'BAK reasoning from the geometry, no figures of its own',kind:'bak',url:'(none)',accessed:A},
];

// ---- General fit knowledge, in BAK's own words.
/** The order to fit a bike in, and the stance everything is set from. */
export const fitOrder:Fact[]=[
 {text:'Fit order: bars first (clamp position, rotation, then bend if the stock range runs out), then levers to the bars, then pedals to the boots, then seat and pegs. Every lever and pedal change follows a bar change.',src:['bak-reasoning','honda-2020-fit']},
 {text:'Set the cockpit from the standing attack position first, then check it seated: the bike maker\'s own rule is that bars, levers and pedals must be comfortable to use both sitting and standing, going straight and turning.',src:['honda-2020-fit','lever-setup-mag']},
 {text:'Change one thing at a time, mark where it was (paint pen on clamp and bar), ride a few laps, and keep the change only if it helps standing and seated.',src:['bak-reasoning']},
 {text:'Body-position technique itself (attack position, cornering, braking) belongs to riding coaching; fit only makes that position possible without strain.',src:['bak-reasoning']},
];

export const bars={
 dimensions:{text:'How bar makers measure a bend: Width (A) grip end to grip end; Height (B) from the clamp area up to the grip area; Rise (C); Clamping width (D); Sweep (E), the pullback from the bar mounts; Control length (F), the straight section for the controls. Renthal says width, height and sweep matter most.',src:['renthal-2021-recs','renthal-839','renthal-fatbar36-bends']} as Fact,
 rules:[
  {text:'Taller or long-legged riders: more bar height. Long arms or wide shoulders: a wider bar. Average or shorter riders: the standard bends; on KTM, Husqvarna and GasGas Renthal suggests trimming width to about 800-808 mm to suit wingspan and shoulder width.',src:['renthal-2021-recs']},
  {text:'Rolling the bar back in the clamps adds sweep; rolling it forward takes sweep away, so rotation fine-tunes a bend before buying another. Roll it with the levers loose and re-set the levers after.',src:['renthal-2021-recs']},
  {text:'Rotation reference: Triumph prints degree marks on the TF bar; Honda aligns a paint mark on the bar with the holder; Kawasaki uses gauge marks that must show equally each side of the clamps. Set both sides the same.',src:['triumph-handbook','honda-handbooks','kawasaki-om']},
  {text:'Clamp fore-aft: moving the bar forward lengthens the reach from seat and pegs to the grips (more room for a tall rider standing, weight further forward); moving it back shortens the reach (a smaller rider, more room seated). The bike\'s own steps are small, so try them before a new bend.',src:['bak-reasoning','honda-2020-fit','kawasaki-om']},
  {text:'Width can be cut: equally from both ends, a little at a time, chamfer the cut edges. Narrowing is easy and cannot be undone. A bent or straightened bar is fatigued and should be replaced, never re-straightened.',src:['honda-2020-fit','ktm-om']},
  {text:'An alternative bend (rise or sweep) is the next step when clamp position and rotation run out; the bike makers say their stock ergonomics suit an average-size rider.',src:['honda-2020-fit']},
 ] as Fact[],
 /** Renthal Fatbar (28.6 mm clamp) bends, maker figures. */
 renthal_bends:[
  {text:'839 Fatbar: width 802, height 91, rise 51, sweep 51, clamp width 131, control length 200 mm. Renthal lists it for the Honda CRF from 2018 and says Honda moved to this bend from the 2019 models and Kawasaki KX250/450 from 2021.',src:['renthal-839','renthal-2021-recs']},
  {text:'827 Fatbar (Villopoto/Stewart): width 811, height 92, rise 52, sweep 52, clamp width 117, control length 222 mm. Renthal\'s standard pick for Honda, Kawasaki and Yamaha, and its tall-rider pick for KTM, Husqvarna and GasGas.',src:['renthal-827','renthal-2021-recs']},
  {text:'604 Fatbar (RC / Honda CRF): width 804, height 104, rise 64, sweep 54, clamp width 105, control length 188 mm. Renthal\'s tall-rider pick for Honda and Kawasaki.',src:['renthal-604','renthal-2021-recs']},
  {text:'Renthal picks by brand (Fatbar36 / Twinwall / Fatbar): KTM, Husqvarna, GasGas standard 934/999/821, tall 933/996/827; Honda and Kawasaki standard 933/996/827, tall 930/997/604; Yamaha standard 933/996/827, tall 931/998/603 (and for Yamaha less sweep and/or more height suits average riders). KTM and GasGas stock bars match the 821 bend; Husqvarna\'s stock bar is low but wide.',src:['renthal-2021-recs']},
  {text:'Fatbar36 bars sit 4 mm lower than Twinwall and Fatbar of the same bend when compared at the clamp.',src:['renthal-fatbar36-bends']},
 ] as Fact[],
 not_published:'ProTaper, Neken and ODI bend charts were not reachable as maker pages in this pass, so BAK gives no numbers for their bends; compare any bar against the Renthal figures by width, height and sweep.',
};

export const levers:Fact[]=[
 {text:'Angle: stand in the attack position with hands on the grips; rotate the perches until elbow, wrist and fingers make one straight line onto the levers. Riders who sit a lot or ride with an unusual style can go a little up or down from there. For seated riding the same idea is a straight line from shoulder to fingertips with no wrist bend.',src:['lever-setup-mag','venhill-controls']},
 {text:'Reach: with the hand against the inside of the grip, the lever should fall under the first knuckle of the first finger (or the first joints of index, middle and ring fingers), so it can be pulled without moving the hand on the grip. Use the reach adjusters for this, not the perch angle.',src:['lever-setup-mag','venhill-controls']},
 {text:'Small hands: wind the reach adjusters in first. KTM, Husqvarna and GasGas use hand-turned screws with a limited range (never forced, never while riding); Yamaha prints the front lever position as 100 mm standard with 86-105 mm of range; Honda and Triumph use an adjuster with a lock nut or a span adjuster.',src:['ktm-om','yamaha-osm','honda-handbooks','triumph-handbook']},
 {text:'Free play must stay after any reach change or the brake or clutch can drag. Makers differ: KTM-group front brake at least 3 mm free travel; Yamaha no free play at the brake lever end; cable clutches 10-20 mm at the lever end on Honda, 7-12 mm on Yamaha YZ two-strokes; hydraulic clutches have no free-play figure. Use the figure for the exact bike.',src:['ktm-om','yamaha-osm','honda-handbooks']},
 {text:'Perch bolts: tight enough not to slip in normal riding, loose enough (or on tape under the clamp) that the perch rotates in a fall instead of the lever snapping.',src:['honda-2020-fit','lever-setup-mag']},
 {text:'Covering the lever with constant arm tension, or reaching for it, costs reaction time and adds forearm load all moto.',src:['venhill-controls']},
];

export const pedals:Fact[]=[
 {text:'Brake pedal height: set it with riding boots on. Makers start at about level with the footpeg (Honda; Yamaha prints 0.0 mm above the footrest top on its 2020 two-strokes). The pedal should sit just under the boot sole so it is reached without bending the ankle, close for quick use but never pressed when sitting or standing.',src:['honda-2020-fit','yamaha-osm-2020','venhill-controls']},
 {text:'After a pedal-height change reset the push rod so the pedal keeps free travel (KTM-group 3-5 mm, Triumph 6-9 mm at the tip); with none the rear brake drags and can overheat.',src:['ktm-om','triumph-handbook']},
 {text:'Shift lever: moved one spline up or down on the shaft (KTM group, Triumph). In its rest position it must not touch the boot; constant contact loads the gearbox. Bigger boots or a new boot often need one spline.',src:['ktm-om','triumph-handbook']},
 {text:'Honda sets pedal height by master-cylinder push-rod length (78.6-80.6 mm standard on 2021-2027 CRF250R/450R handbooks); Yamaha with an adjusting nut, keeping the bolt end at least 2.0 mm from the pedal.',src:['honda-handbooks','yamaha-osm']},
];

export const seat:Fact[]=[
 {text:'Seat options from the makers: Yamaha tall seat about 19 mm (3/4 in) taller for several YZ models; KTM PowerParts low seat about 15 mm lower for 2019-2022 SX/SX-F; KTM 50 SX lowering kit 68 mm lower for 2020-2023. Aftermarket foam from GUTS Racing comes about 1 in taller or 10 mm lower than stock.',src:['yamaha-tall-seat','ktm-low-seat','ktm-50sx-lowering','guts-foam']},
 {text:'Foam changes only the seat: taller foam opens the seat-to-peg room for long legs and makes the reach to the ground longer; lower foam does the reverse. Lowering the suspension changes the bike\'s geometry and travel too, so foam is the first step for comfort, not suspension.',src:['bak-reasoning']},
 {text:'Published seat heights to compare (makers, unladen): full-size motocross about 955-965 mm (Honda CRF250R/450R owner\'s manuals 2020-2026), Triumph TF 250-X 960 mm; minis 2025: KTM 50 SX 653 mm, KTM 65 SX 730 mm, Yamaha YZ65 754 mm, Kawasaki KX65 759 mm, KX85 831 mm, Yamaha YZ85 841 mm, KX112 871 mm.',src:['honda-om','honda-2020-fit','triumph-tf250x','ktm-50sx-spec','ktm-65sx-spec','yamaha-yz65-spec','kawasaki-kx65-spec','kawasaki-kx85-spec','yamaha-yz85-spec','kawasaki-kx112']},
];

export const pegs:Fact[]=[
 {text:'Kawasaki is the maker that publishes footpeg positions: two per side on the KX250/KX450 (ERGO-FIT), the second about 5 mm lower per Kawasaki\'s 2021 KX250 press kit. Lower pegs give long legs more knee room.',src:['kawasaki-om','kawasaki-2021-press','kawasaki-kx-page']},
 {text:'BAK found no footpeg-position option in the Honda, Yamaha, KTM-group or Triumph manuals; on those bikes seat foam and bar position are the levers for knee room.',src:['honda-handbooks','yamaha-osm','ktm-om','triumph-handbook']},
 {text:'Stand on the balls of the feet on the pegs; the pedals are set from that foot position.',src:['bak-reasoning','venhill-controls']},
];

export const grips:Fact[]=[
 {text:'Stock grips: Kawasaki fits medium-compound ODI lock-on grips on the KX; Triumph fits ODI half-waffle lock-on grips on the TF 250-X. Lock-on grips change without glue and use a screw clamp.',src:['kawasaki-kx-page','triumph-tf250x']},
 {text:'A grip pushed too far in or out moves the hand relative to the levers; recheck lever reach after a grip change.',src:['bak-reasoning']},
];

export const kids={
 fit_check:[
  {text:'Seated: both feet touch the ground comfortably, with full gear on. Standing on the pegs: knees slightly bent and a few inches of clearance above the seat.',src:['msf-parents','ama-kids']},
  {text:'Hands: can turn the bars fully left and right; fingers reach comfortably around the grips and levers (also with the bars turned); can work throttle and front brake while holding the grips, and squeeze the levers hard enough.',src:['msf-parents']},
  {text:'Feet: both feet firmly on the pegs, and can work the brake pedal and shift lever easily.',src:['msf-parents']},
  {text:'If any check fails the child is not physically ready for that bike yet. Check the owner\'s manual for the control positions it allows (lever reach, pedal height) before deciding.',src:['msf-parents']},
 ] as Fact[],
 adjustments:[
  {text:'For a small rider: reach adjusters in, pedals and shifter set to the small boot, bar back and rolled to suit. KTM 85 SX top clamps have two bar-mount holes 15 mm apart plus 3.5 mm offset mounts (four positions); the 85 SX brake pedal tip also bolts on in two positions.',src:['ktm-85sx-om','msf-parents']},
  {text:'Seat: low seat or lowering kit where the maker sells one (KTM 50 SX lowering kit 68 mm).',src:['ktm-50sx-lowering']},
 ] as Fact[],
 outgrown:[
  {text:'Neither the MSF nor the AMA publishes a height, age or weight at which to move up a size. BAK\'s read: the child has outgrown the bike when, with the bars forward and up and the levers and pedals already re-set, the attack position is still cramped (knees hitting the bars or tank, elbows forced below the grips, heels hanging off the back of the pegs) and both feet sit flat on the ground with bent knees.',src:['bak-reasoning','msf-parents','ama-kids']},
  {text:'Moving up: run the same fit checks on the bigger bike (feet down, controls, strength to hold it up). Compare published seat heights between sizes, and remember that class age rules decide what they can race.',src:['msf-parents','ama-kids']},
 ] as Fact[],
};

export const measure:Fact[]=[
 {text:'Rider: height and inseam (in riding boots is most useful), boot size, hand size (does the first knuckle reach the lever), weight, and style (standing a lot, sit-down, supercross, outdoors, woods).',src:['bak-reasoning','msf-parents']},
 {text:'Bar: width end to end; height from the clamp centre line straight up to the centre of the bar end; sweep as the pullback from the clamp. Measure the stock bar the same way to compare with a bend chart.',src:['renthal-2021-recs','renthal-fatbar36-bends']},
 {text:'Lever: Yamaha measures lever position as the distance from the grip to the lever. Pedal: height against the top of the footpeg (Yamaha, Honda) or by push-rod length (Honda).',src:['yamaha-osm','honda-2020-fit','honda-handbooks']},
 {text:'Before and after any change, mark positions with a paint pen and note them, so a change can go back.',src:['bak-reasoning']},
];

export const armPump:Fact[]=[
 {text:'Arm pump is forearm chronic exertional compartment syndrome: pain and tightness in the forearm flexors (usually the throttle side) that builds with riding and eases when stopped. A study of elite road racers found forearm pressure rose from about 12 to 31 mmHg and grip strength fell about 30% after two minutes of repeated brake-lever pulls.',src:['odowd-2021']},
 {text:'The study names gripping through hard acceleration and braking, and sustained brake-lever force, as the load. Fit cuts needless grip: levers in line with the forearm and in reach so they need no wrist bend or stretch, pedals and bars that let the legs hold the bike.',src:['odowd-2021','venhill-controls','bak-reasoning']},
 {text:'Fit helps but is not a cure: symptoms that persist or come with numbness or weakness are for a doctor.',src:['odowd-2021']},
];

/** Per-make adjustment ranges from owner's manuals and handbooks (per-bike facts are the rfit records). */
export const makeAdjust:Record<string,Fact>={
 Honda:{text:'Honda CRF250R/450R (2020-2027): four bar positions. Lower holders offset 5 mm (turning them moves the bar 10 mm back) and optional top-bridge holes 26 mm forward: +26, +16, standard, -10 mm. Front brake lever adjuster; cable clutch 10-20 mm free play (CRF250R, and the 2020 CRF450R); the 2021-on CRF450R hydraulic clutch has a lever-position adjuster; pedal height by push-rod length. CRF150R: lever and pedal adjustment, no bar positions published.',src:['honda-handbooks','honda-2020-fit','honda-crf150r']},
 Yamaha:{text:'Yamaha YZ: lower bar holders can be fitted the other way round to change fore-aft offset (Yamaha does not print the millimetres); the 2023-on YZ450F clamp is four-position and rubber-mounted. Front brake lever 100 mm standard, 86-105 mm range; cable clutch 7-12 mm free play on the two-strokes; pedal height by adjusting nut. Tall seat (+19 mm) for several models.',src:['yamaha-osm','yamaha-osm-2020','yamaha-yz450f-2023','yamaha-tall-seat']},
 KTM:{text:'KTM, Husqvarna, GasGas (2020-2027 full size): bar mounts with holes 3.5 mm off centre, turned 180 degrees for two positions about 7 mm apart; rigid or rubber mounting; hand-turned reach screws on clutch and brake levers; brake pedal stop screw with 3-5 mm free travel; shift lever by spline. 85 SX: two top-clamp holes 15 mm apart plus the offset mounts, four positions.',src:['ktm-om','ktm-85sx-om']},
 Kawasaki:{text:'Kawasaki KX250/KX450 (ERGO-FIT): bar holders in two hole positions and turnable 180 degrees, four positions (2021 KX250 press kit: 25 and 15 mm forward, stock, 10 mm back); two footpeg positions, the second about 5 mm lower; front brake lever position adjustable. Medium-compound ODI lock-on grips.',src:['kawasaki-om','kawasaki-2021-press','kawasaki-kx-page']},
 Triumph:{text:'Triumph TF 250/450: bar ships in the rear position; turning the lower clamps 180 degrees moves it 9 mm forward; bar rotation set by degree marks on the bar; span adjusters on both levers; brake pedal height screw then 6-9 mm free play at the tip; shift pedal by spline. ProTaper ACF bar, ODI half-waffle grips.',src:['triumph-handbook','triumph-tf250x']},
};

// ---- Gating.
const FIT_WORD=/\b(ergonomic\w*|ergo[- ]?fit|cockpit|cramped|(un)?comfortable (on|riding) (the|my|this|his|her) bike|feels? (cramped|stretched( out)?)|rider fit|bike fit|fit (the bike|me|him|her|my (son|daughter|kid|boy|girl))|fits? (me|him|her)|too (tall|short|small|big) for|body position|riding position|attack position|knee room|legroom|leg room)\b/i;
const BAR_WORD=/\b(handle ?bars?|bars? (bend|height|position|width|sweep|rise|risers?|mounts?|clamps?|rotation|roll(ed)?|forward|back(ward)?|too (high|low|wide|narrow))|bend (for|chart)|(tall|low|high)[- ]bend|risers?|bar clamps?|bar mounts?|handlebar (clamps?|mounts?|holders?)|roll(ed|ing)? (the |my )?bars?|cut (the |my )?bars?|fatbar\w*|twinwall|protaper|pro taper|neken|renthal|\d{3} bend|sweep|pullback)\b/i;
const LEVER_WORD=/\b((clutch|brake|front brake)? ?levers? (angle|reach|position|height|span|adjust\w*|free ?play|too (far|close|high|low))|lever reach|lever angle|lever span|reach adjust\w*|small hands?|short fingers?|can'?t reach the (lever|clutch|brake)|free ?play|(clutch|brake) perch(es)?|perch(es)?|shorty levers?|levers? (rotate|roll|angle))\b/i;
const PEDAL_WORD=/\b(pedal height|brake pedal (height|position|too (high|low))|shift(er| lever| pedal) (height|position|too (high|low))|(raise|lower|move) (the |my )?(brake pedal|shifter|shift lever|shift pedal)|one spline|boots? (hit|touch|catch\w*))\b/i;
const SEAT_WORD=/\b(seat height|tall seat|low(er)? seat|seat foam|(tall|low|soft|firm) foam|lowering (kit|link)|lower (the|my) (bike|seat)|touch the ground|reach the ground|flat[- ]?foot\w*|tipp?y[- ]?toes?|feet (flat )?on the ground|inseam)\b/i;
const PEG_WORD=/\b((foot ?)?pegs? (position|height|lower\w*|too (high|low))|lower(ed)? (foot)?pegs?|footpeg (position|height))\b/i;
const GRIP_WORD=/\b(grips? (size|thickness|thick|thin|compound|soft|firm|diameter|position|for (small|big) hands)|lock[- ]on grips?|odi|half[- ]waffle|grip donuts?|which grips?|new grips?|what grips?)\b/i;
const KID_WORD=/\b(outgr[eo]wn?|outgrowing|too (big|small) for (the|his|her|my|their|a)|move (him|her|them|up) (up )?to (an?|the) (bigger|85|112|125|150|big)|ready for (an?|the) (bigger|85|112|125|150|65|big)|step(ping)? up to (an?|the)? ?(85|112|125|150|65|big|bigger)|(my|our) (son|daughter|kid|boy|girl|child)\b.*\b(fits?|size|sized|tall|reach\w*|touch\w*|too (big|small)|outgr\w+)|(kid|child|youth)\W+(size|sizing|fit)|what size (bike|dirt ?bike)|right size bike|bike size for)\b/i;
const MEASURE_WORD=/\b(how (do i|to) measure|measure (my|the) (bar|bars|inseam|seat|lever|pedal)|(\d'\s?\d{1,2}"?|\d\s?(ft|foot|feet)\s?\d{1,2}|\d{3}\s?cm) (tall|rider)|i'?m \d'|i am \d'|\d{2,3}\s?(cm|in(ch(es)?)?) inseam|inseam of)\b/i;
const PUMP_WORD=/\barm[- ]?pump\w*|\bforearms? (pump|tight|burn)\w*|\bcompartment syndrome\b/i;
const TALL_SHORT=/\b(i'?m|i am|he'?s|she'?s|rider is|for a|as a) (really |very |pretty |kinda )?(tall|short|small|big|lanky)( rider| guy| kid)?\b|\b(tall|short) (rider|riders|guy|kid|person)\b/i;
/** Questions that share words with fit but belong elsewhere: fork tubes in the clamps, tire pressure in bar, tire beads,
 *  traction grip, brake bleeding. Removed from the text before the fit words are looked for. */
const NOT_FIT=/\b(fork tubes?|tubes? (up|down)? ?in the clamps?|triple clamps? (offset|bolt|torque)|clamp (offset|bolts? torque)|(raise|lower|slide)( the)? forks?|[\d.]+ ?bar\b|seat(ing)? the bead|bead seat\w*|traction|(rear|tire|tyre|front) (won'?t|doesn'?t|no) grip\w*|grip on (hard|the)|spongy|bleed\w*|throttle (cable )?free ?play|valve (clearance|free ?play)|seat (bolt|cover|latch)|exhaust (fit|fits)|will (it|this|that) fit)\b/gi;
const OTHER_DOMAIN=/\b(jetting|jet|map|ecu|oil|piston|valves?|sag|rebound|compression|spring rate|gearing|sprocket|tire|tyre|psi|coolant|carb|air filter)\b/i;

function topicsOf(raw:string):Set<FitTopic>{
 const text=raw.replace(NOT_FIT,' ');
 const t=new Set<FitTopic>();
 if(BAR_WORD.test(text))t.add('bars');
 if(LEVER_WORD.test(text))t.add('levers');
 if(PEDAL_WORD.test(text))t.add('pedals');
 if(SEAT_WORD.test(text))t.add('seat');
 if(PEG_WORD.test(text))t.add('pegs');
 if(GRIP_WORD.test(text))t.add('grips');
 if(KID_WORD.test(text))t.add('kids');
 if(MEASURE_WORD.test(text))t.add('measure');
 if(PUMP_WORD.test(text))t.add('arm_pump');
 if(FIT_WORD.test(text)||TALL_SHORT.test(text))t.add('position');
 // A rider's own height with a setup question ("I'm 6'3", how should I set up my bike") is a whole-bike fit question.
 if(t.has('measure')&&!/how (do i|to) measure|measure (my|the)/i.test(text)&&(t.size===1||/\bset ?up|setup|what should i (change|do)|adjust/i.test(text)))t.add('position');
 return t;
}

/** Height, inseam, age and style the rider gave, echoed back so the answer uses them (no thresholds are applied). */
function riderFrom(text:string):Record<string,string>|undefined{
 const r:Record<string,string>={};
 const ftIn=text.match(/\b([4-7])\s?(?:'|ft|foot|feet)\s?(\d{1,2})?\s?(?:"|in(?:ch(?:es)?)?)?(?!\s?inseam)/i);
 const cm=text.match(/\b(1[0-9]{2}|2[01][0-9])\s?cm\b(?!\s?inseam)/i);
 if(ftIn)r.height=`${ftIn[1]} ft ${ftIn[2]??0} in`;else if(cm)r.height=`${cm[1]} cm`;
 const ins=text.match(/\b(\d{2,3})\s?(cm|in(?:ch(?:es)?)?|")\s?inseam\b|\binseam (?:of |is )?(\d{2,3})\s?(cm|in(?:ch(?:es)?)?|")?/i);
 if(ins)r.inseam=`${ins[1]??ins[3]} ${/cm/i.test(ins[2]??ins[4]??'')?'cm':'in'}`;
 const age=text.match(/\b(\d{1,2})[- ]?(?:year[- ]old|yo|yr old|years old)\b/i);if(age)r.age=`${age[1]}`;
 const styles=[...new Set((text.match(/\b(sit[- ]?down|standing|stand up|supercross|arenacross|outdoors?|sand|woods|enduro|hare scramble|gncc|vet|beginner|novice)\b/gi)??[]).map(s=>s.toLowerCase()))];
 if(styles.length)r.style=styles.join(', ');
 if(/\b(son|daughter|kid|boy|girl|child|youth)\b/i.test(text))r.who='a young rider';
 return Object.keys(r).length?r:undefined;
}

const MAKES:[string,RegExp][]=[['Honda',/\b(honda|crf\s?\d*)/i],['Yamaha',/\b(yamaha|yz\s?\d*)/i],['KTM',/\b(ktm|husqvarna|husky|gas ?gas|\d{2,3} ?sx-?f?|fc ?\d{3}|tc ?\d{2,3}|mc ?\d{2,3})\b/i],['Kawasaki',/\b(kawasaki|kx\s?\d*)/i],['Triumph',/\b(triumph|tf ?\d{3})\b/i]];

const strip=<T,>(o:T):T=>JSON.parse(JSON.stringify(o,(k,v)=>k==='src'?undefined:v));
const tx=(fs:Fact[])=>fs.map(f=>f.text);

/** Rough budget: about 2.5k tokens of JSON, at roughly four characters a token. */
export const RIDER_FIT_MAX_CHARS=9600;

/** A compact rider-fit section for Ask BAK, or null when the conversation is not about fit, ergonomics, comfort, bars,
 *  levers, pegs, seat, pedals, grips, rider size or a child outgrowing a bike. history: earlier rider messages, oldest
 *  first; a short follow-up inherits the fit topics of the last few. */
export function riderFit(message:string,history?:string[]):FitSection|null{
 const msg=message??'';
 let topics=topicsOf(msg);let text=msg;let fromHistory=false;
 if(!topics.size&&history?.length&&msg.trim().length<=160&&!OTHER_DOMAIN.test(msg)){
  const recent=history.slice(-3).join('\n');const h=topicsOf(recent);
  if(h.size){topics=h;text=recent+'\n'+msg;fromHistory=true;}
 }
 if(!topics.size)return null;
 const makes=MAKES.filter(([,rx])=>rx.test(text)).map(([m])=>m);
 const out:FitSection={version:RIDER_FIT_VERSION,
  boundary:'BAK-authored rider-fit knowledge from bike makers\' manuals and handbooks, bar and part makers\' published data, and rider-safety bodies. The exact bike\'s own manual figures (bike knowledge rows) come first. Fit is set standing, then checked seated, one change at a time. Where nothing is published say so; never invent a size chart or a height-to-bar rule. Name bike, bar and grip makers freely; never name a magazine, tester, retailer or rider as the source.',
  topics:[...topics]};
 if(fromHistory)out.from_history=true;
 const rider=riderFrom(text);if(rider)out.rider=rider;
 const all=topics.has('position');
 const parts:[string,()=>unknown][]=[];
 parts.push(['fit_order',()=>tx(all?fitOrder:fitOrder.slice(0,2))]);
 if(topics.has('kids'))parts.push(['kids',()=>({fit_check:tx(kids.fit_check),adjust:tx(kids.adjustments),outgrown:tx(kids.outgrown)})]);
 if(topics.has('bars')||all)parts.push(['bars',()=>({rules:tx(bars.rules),how_bends_are_measured:bars.dimensions.text,renthal_bends:tx(topics.has('bars')?bars.renthal_bends:bars.renthal_bends.slice(3,4)),...(topics.has('bars')?{not_published:bars.not_published}:{})})]);
 if(topics.has('levers')||all)parts.push(['levers',()=>tx(levers)]);
 if(topics.has('pedals')||all)parts.push(['pedals',()=>tx(pedals)]);
 if(topics.has('arm_pump'))parts.push(['arm_pump',()=>tx(armPump)]);
 if(topics.has('seat')||all||topics.has('kids'))parts.push(['seat',()=>tx(seat)]);
 if(topics.has('pegs')||all)parts.push(['pegs',()=>tx(pegs)]);
 if(topics.has('grips'))parts.push(['grips',()=>tx(grips)]);
 if(topics.has('measure')||all)parts.push(['how_to_measure',()=>tx(measure)]);
 // The make's own adjustment range: the makes named, or a one-line summary of each when none is named.
 const adjustable=['bars','levers','pedals','pegs','position','kids'].some(t=>topics.has(t as FitTopic));
 if(adjustable)parts.push(['bike_adjustments',()=>Object.fromEntries((makes.length?makes:Object.keys(makeAdjust)).map(m=>[m,makeAdjust[m].text]))]);
 for(const [k,f] of parts){
  out[k]=strip(f());
  if(JSON.stringify(out).length>RIDER_FIT_MAX_CHARS){
   const v=out[k];
   if(Array.isArray(v))out[k]=v.slice(0,2);
   else if(k==='bars'){const b=v as {rules:string[]};out[k]={rules:b.rules.slice(0,4),how_bends_are_measured:bars.dimensions.text};}
   else if(k==='kids'){const c=v as {fit_check:string[];outgrown:string[]};out[k]={fit_check:c.fit_check,outgrown:c.outgrown.slice(0,1)};}
   else if(k==='bike_adjustments'&&!makes.length)out[k]={note:'Each maker\'s bar, lever and pedal ranges are in the bike knowledge rows for the exact bike.'};
   if(JSON.stringify(out).length>RIDER_FIT_MAX_CHARS)delete out[k];
  }
 }
 return out;
}
