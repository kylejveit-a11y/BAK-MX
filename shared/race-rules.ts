/** BAK race-rules knowledge for gas motocross: classes, eligibility, sound tests, fuel, tech inspection, number plates,
 * protective gear, amateur national qualifying and arenacross basics.
 *
 * Every item is a short summary in BAK's own words of a published rule, never rule text. Each carries the rulebook
 * year it came from and a short source label (the body that publishes it). Source URLs, edition notes and the date
 * each source was read are in docs/research/race-rules/SOURCES.md. Numbers appear only where a source printed them;
 * anything not found stays in `raceRuleUnknowns` instead of being guessed.
 *
 * Rules change every season and clubs add their own supplemental rules, so every answer built from this tells the
 * rider to confirm with the current rulebook and the series running the race before race day.
 *
 * Status: RESEARCHED 2026-11-07, pending review by Kyle. Edit here; the runtime reads this file.
 */
export const RACE_RULES_VERSION='race-rules-2026.1';
/** The day these sources were read. */
export const RACE_RULES_AS_OF='2026-11-07';

export type RaceRuleTopic='classes'|'eligibility'|'sound'|'fuel'|'tech'|'plates'|'gear'|'qualifying'|'arenacross'|'local';
export type RaceRuleWho='pro'|'amateur'|'all';
export type RaceRule={
 id:string;topic:RaceRuleTopic;
 /** Who it applies to in plain words, e.g. "Pro Supercross" or "Loretta Lynn's qualifying". */
 applies:string;
 /** Rulebook or season year the item was taken from. */
 year:number;
 /** Short source label: the publishing body and document, never a URL. */
 source:string;
 rule:string;
 /** What it means for the rider, when that is not obvious. */
 means?:string;
 /** Season a published future change takes effect, when the item is an announced change. */
 effective?:number;
 /** Set when the item comes from an older edition or a secondary report rather than the current official book. */
 caution?:string;
 who:RaceRuleWho;
 /** Sent when the question names a topic only loosely. */
 core?:boolean;
};
export type RaceRuleUnknown={topic:RaceRuleTopic;year:number;what:string};

const SX='AMA Supercross Rulebook',MX='AMA Pro Racing Pro Motocross Rulebook',NEXT='SMX Next Supplemental Rulebook',
 LL='MX Sports Amateur National Supplemental Rules',LLC='MX Sports Amateur National class list',LLQ='MX Sports How to Qualify',
 LIM='AMA Limited Class Clarification Chart',AMA23='AMA Competition Rulebook (amateur sections)',AMAWEB='AMA motocross rules page',
 MEMO='AMA rulebook change memo (secondary repost)',AXR='AMA arenacross announcement (secondary report)',
 FL='Unlimited Sports rider meeting, Gatorback Cycle Park FL';
const OLD='Older AMA amateur edition: the 2026 amateur rulebook was not read. Treat as a starting point only.';
const SECONDARY='Secondary report of an AMA announcement, not the rulebook itself.';

export const RACE_RULES:RaceRule[]=[
 // ── Classes ──
 {id:'pro-sx-displacement',topic:'classes',applies:'Pro Supercross 450 and 250',year:2026,source:SX,who:'pro',core:true,
  rule:'Single-cylinder, AMA-homologated production-based bikes only. 450 class: four-strokes 249–450cc or two-strokes 150–250cc. 250 class: four-strokes up to 250cc or two-strokes up to 125cc. Displacement limits are absolute, no overbore allowance.'},
 {id:'pro-mx-displacement',topic:'classes',applies:'Pro Motocross 450MX and 250MX',year:2026,source:MX,who:'pro',
  rule:'450MX: four-strokes 251–450cc or two-strokes 150–250cc. 250MX: four-strokes 150–250cc or two-strokes up to 125cc. Single cylinder, homologated models, no overbore allowance.',
  means:'The ranges are worded slightly differently from the Supercross book; check the book for the series you are entering.'},
 {id:'pro-weights',topic:'classes',applies:'Pro Supercross and Pro Motocross',year:2026,source:`${SX}; ${MX}`,who:'pro',
  rule:'Minimum weights: 450 four-stroke 220 lb, 450 two-stroke 212 lb, 250 four-stroke 212 lb, 250 two-stroke 194 lb. Weighed with the fuel tank drained, only coolant may be added, no ballast; officials may make you clean off mud first.'},
 {id:'ama-classes-overview',topic:'classes',applies:'AMA amateur motocross',year:2026,source:AMAWEB,who:'amateur',core:true,
  rule:'AMA sanctions motocross classes for bikes from 50cc up to over 450cc and riders from age 4 to 50-plus. A race is usually two motos per class with the combined score deciding the overall.'},
 {id:'ll-youth-minis',topic:'classes',applies:"Loretta Lynn's youth mini classes",year:2026,source:LLC,who:'amateur',core:true,
  rule:'51cc Micro classes (ages 4–6, a 4–6 shaft-drive two-stroke Limited class, and 7–8), plus Micro-E (4–7, electric, 1 kWh battery). 65cc classes use 59–65cc bikes for ages 7–9 and 10–11. 85cc (10–12) uses 79–85cc bikes with wheels no bigger than 17 in front / 14 in rear. Mini Sr 1 (12–14) and Mini Sr 2 (13–15) are 79–85cc two-strokes on wheels up to 19/16. Most mini classes also run a Limited version.',
  means:'A Micro rider may qualify in more than one Micro class but can race only one at the National.'},
 {id:'ll-supermini',topic:'classes',applies:"Loretta Lynn's Supermini and Girls",year:2026,source:`${LLC}; ${LL}`,who:'amateur',
  rule:'Supermini 1 (12–15) and Supermini 2 (13–16): 79–112cc two-strokes or 75–150cc four-strokes, wheels up to 19 in front / 16 rear. Girls (11–16) uses the same bikes. A rider must be 12 on the day of the Area Qualifier to ride a Supermini in any class.'},
 {id:'ll-125-schoolboy',topic:'classes',applies:"Loretta Lynn's 125 and Schoolboy classes",year:2026,source:`${LLC}; ${MEMO}`,who:'amateur',
  rule:'125 Jr (12–17) B/C: 122–125cc two-strokes. Schoolboy 1 (12–17) B/C: 86–125cc two-strokes or 75–150cc four-strokes, on full-size wheels of at least 19 in front / 16 rear. Schoolboy 2 (12–17) B/C: 122–250cc, and for 2026 AMA opened Schoolboy 2 to 250cc two-strokes.',
  means:'Schoolboy classes are for big-wheel bikes; a rider must be 14 to ride a 250cc.'},
 {id:'ll-big-bike',topic:'classes',applies:"Loretta Lynn's amateur big-bike classes",year:2026,source:LLC,who:'amateur',core:true,
  rule:'250 B, 250 B Limited, 250 C, 250 C Limited and 250 C Jr (12–17) Limited all use 122–250cc. 450 B, 450 B Limited and 450 C use 122cc to open. 125 C is 122–125cc. Open Pro Sport (122cc–open) and 250 Pro Sport (122–250cc) are for the fastest amateurs.'},
 {id:'ll-age-classes',topic:'classes',applies:"Loretta Lynn's age and women's classes",year:2026,source:LLC,who:'amateur',
  rule:'Women 122–250cc (must be 14 to ride a 250). College 18–24, Junior 25+, Vet 30+, Senior 40+, Senior 45+ and Masters 50+ all run 122cc to open. College, Vet 30+ and Senior 45+ are Sportsman classes: anyone who ever earned an AMA pro point cannot enter them.'},
 {id:'ll-limited',topic:'classes',applies:'AMA Limited classes',year:2026,source:`${LIM}; ${LL}`,who:'amateur',core:true,
  rule:'In Limited classes the whole OEM exhaust for that model year stays stock (an end cap may change only to fit a spark arrestor), and engine internals, bore and stroke, high-compression pistons, carburetor or throttle body, electronics, airbox, intake boot, reeds, hubs, axles and rim size stay stock. Allowed: suspension internals and springs, linkage, sprockets and chain, pegs, levers, bars and top clamp, jetting, radiators, plastics and graphics, cosmetic changes with no performance gain. A Limited bike may also race a non-Limited class.',
  means:'Violations mean disqualification from the class (or reassignment at a qualifier if the referee rules it unintentional); a second within a year can bring a one-year suspension.'},
 {id:'ll-machine',topic:'classes',applies:'AMA amateur national program',year:2026,source:LL,who:'amateur',
  rule:'2027-model bikes, cases, cylinders or engine internals are not eligible in 2026. Electric bikes are allowed only in the Mini-E class. Mini classes may use fuel injection only if the production model came with it. Bikes must appear on the 2026 AMA approved-motorcycle list.'},
 // ── Eligibility ──
 {id:'pro-age',topic:'eligibility',applies:'Pro Supercross and Pro Motocross licenses',year:2026,source:`${SX}; ${MX}`,who:'pro',core:true,
  rule:'Supercross: a rider license requires age 17 in 2026 (up from 16), rising to 18 with the 2027 book. Pro Motocross 2026: 18 for the 450 class and 17 for the 250 and WMX classes, and 18 for every class from 2027. A license also needs AMA membership, a fitness clearance, a recent ImPACT baseline and medical insurance.',
  caution:'The Pro Motocross PDF shows an edit mark beside an old value of 16 for the 250 class; confirm the age with AMA Pro Racing.'},
 {id:'pro-250-license',topic:'eligibility',applies:'250SX license',year:2026,source:SX,who:'pro',
  rule:'A rider must earn a 250 license through the AMA Road to Supercross before racing the 250 class. Through SMX Next, four points earned within a continuous 24-month window earn the license, and the rider then has two seasons to apply for it.'},
 {id:'pro-250-east-west',topic:'eligibility',applies:'250SX East/West',year:2026,source:SX,who:'pro',core:true,
  rule:'Declare East or West before the first round; switching is allowed only after an injury at your first event before starting the night show, by written request. Past 450 Supercross, 450 Pro Motocross or MXGP champions cannot race 250 East/West. A 250 champion gets at most four total years in the 250 class (a second title caps it at three); a season counts once you score at least 5 points. Riders moved up to 450 by points or titles cannot return, and the 2024 or 2025 top 15 in 450 points are out of the 250 class (self-advanced riders may appeal once). One class per event.'},
 {id:'pro-450-eligibility',topic:'eligibility',applies:'450SX class',year:2026,source:SX,who:'pro',
  rule:'To race 450SX a licensed rider must have held a 450 license during 2023–2025, have made a 250 night show at least once between 2023 and now, or (non-US riders) hold a current FIM international motocross license.'},
 {id:'smx-next',topic:'eligibility',applies:'SMX Next (amateur supercross)',year:2026,source:NEXT,who:'amateur',
  rule:'2026: age 15 and up, A or B classified, current AMA membership, on a 250cc four-stroke built to AMA homologation rules. From 2027 the class drops B riders: age 16 and A classified only.'},
 {id:'ll-classification',topic:'eligibility',applies:"Loretta Lynn's A/B/C classes",year:2026,source:LL,who:'amateur',core:true,
  rule:'You cannot race a C class if you ever raced the National (except Micro or Girls), had OEM factory support, held any AMA pro license or a WMX license, posted a rider performance value (RPV) of 15.0 or more in the last advancement year, or raced C in 2023 and 2024 with an RPV of 13.0 or more. 2025 top-5 finishers in 250B/450B (Limited) who were 17 or older on Jan 1 2026 are out of B classes. A riders cannot race youth classes. Anyone with an AMA pro point is out of B, C and Sportsman classes.'},
 {id:'ll-ages',topic:'eligibility',applies:"Loretta Lynn's age rules",year:2026,source:LL,who:'amateur',core:true,
  rule:'Youth classes, 250 C Jr and Schoolboy 2 use the rider’s age on January 1 for the whole year. Other amateur classes use age on the day of the Area Qualifier; Vet classes use age on the first day of the National (Aug 4 2026). A rider must be 14 on the qualifier day to ride a 250cc in any class. Riders under 18 need a parent present or a notarized consent form; proof of age may be asked for at any time.'},
 {id:'ll-pro-sport',topic:'eligibility',applies:"Loretta Lynn's Pro Sport",year:2026,source:LL,who:'amateur',
  rule:'Riders who made the Final 40 at no more than 3 Pro Motocross rounds this year or last may race only Open Pro Sport, 250 Pro Sport and Women. The top 42 Pro Sport entries at the National can take an AMA Pro Motocross license for that year and the next, if age-eligible.'},
 {id:'ama-2027-age',topic:'eligibility',applies:'AMA amateur motocross',year:2026,source:MEMO,who:'amateur',effective:2027,caution:SECONDARY,
  rule:'AMA announced that from 2027 the minimum age for Amateur (adult) classes rises from 12 to 14, that the Supermini range is 12–15, and that first-time Limited-class or displacement violations now bring suspensions.'},
 // ── Sound ──
 {id:'pro-sound-limits',topic:'sound',applies:'Pro Supercross and Pro Motocross',year:2026,source:`${SX}; ${MX}`,who:'pro',core:true,
  rule:'2-meter max test. 2026 limit: 112 dB/A at pre-race inspection, 113 dB/A post-race. The 2027 books drop it to 109 dB/A pre-race and 110 dB/A post-race. A rider can be sent to the sound test at any time and must go straight there.'},
 {id:'pro-sound-method',topic:'sound',applies:'2-meter max method (pro)',year:2026,source:`${SX}; ${MX}`,who:'pro',core:true,
  rule:'Meter on a tripod 79 in (2 m) behind the spot where the rear tire meets the ground, 45° off the centerline on the exhaust side, 53 in up. Engine hot, bike on its wheels, clutch engaged (the mechanic stands on the left and holds the clutch, in whatever gear the steward says). The inspector snaps the throttle wide open within 0.3 s, holds it about 1 s at the limiter, then lets go. Up to two retests if it reads over. Soft ground, nothing solid within 33 ft, background noise under 100 dB/A.'},
 {id:'pro-sound-rpm',topic:'sound',applies:'2-meter max method (pro)',year:2026,source:`${SX}; ${MX}`,who:'pro',
  rule:'The bike must reach and hold a minimum rpm during the test. Supercross 2026: 13,500 rpm for 250s and 10,800 for 450s. Pro Motocross 2026: 12,500 for 250s and 10,000 for 450s. A bike that cannot reach it is refused at pre-race and counts as a violation post-race; deliberately holding the revs down is a rule breach.'},
 {id:'pro-sound-corrections',topic:'sound',applies:'2-meter max method (pro)',year:2026,source:`${SX}; ${MX}`,who:'pro',
  rule:'Officials deduct 2 dB/A from the reading for meter tolerance, another 1 dB/A when it is below 50°F, or 2 dB/A below 32°F.'},
 {id:'pro-sound-fail',topic:'sound',applies:'Pro Supercross and Pro Motocross',year:2026,source:`${SX}; ${MX}`,who:'pro',core:true,
  rule:'Fail at pre-race: fix it and present the bike again (repeat attempts are allowed). Fail after qualifying: your fastest time is thrown out. Fail after the race: loss of 3 points. Race direction can waive it if the failure was accidental (crash damage) and gave no performance gain. Passed silencers are marked; only one marked spare per bike, the outlet cannot be altered, and a removable quiet insert that falls off during a race counts as a modified silencer.',
  means:'Carry a marked spare and check end caps and packing between motos; a crash-bent or blown-out silencer is the usual way a legal bike fails post-race.'},
 {id:'ama-amateur-sound',topic:'sound',applies:'AMA amateur motocross',year:2023,source:AMA23,who:'amateur',core:true,caution:OLD,
  rule:'Amateur bikes are checked with a stationary test at a fixed rpm: microphone 20 in from the exhaust outlet at 45°, at pipe height but at least 8 in off the ground, engine warm, transmission in neutral, rider or mechanic on the bike. Clubs must sound test; the lower of the AMA limit and the state limit applies; a bike that fails may be penalized. Silencers are marked after passing and the outlet cannot be altered afterwards. Limited classes listed 96 dB/A for post-2011 two-strokes, 94 dB/A for post-2011 four-strokes, 99 dB/A for pre-2011 bikes.'},
 {id:'ama-sound-postponed',topic:'sound',applies:'AMA amateur motocross',year:2026,source:MEMO,who:'amateur',caution:SECONDARY,
  rule:'AMA reported that the new sound rules passed in 2025 were postponed by one year.'},
 // ── Fuel ──
 {id:'pro-fuel-spec',topic:'fuel',applies:'Pro Supercross and Pro Motocross',year:2026,source:`${SX}; ${MX}`,who:'pro',core:true,
  rule:'Unleaded petroleum gasoline to the ASTM D4814 standard, plus: specific gravity 0.715–0.765 at 60°F, oxygen no more than 4.0% by mass, lead no more than 0.025 g/l, oxygenates limited to the ethers and alcohols listed in D4814, epoxides such as propylene oxide do not count as ethers, no nitrogen-bearing compounds. Two-stroke oil and other lubricants are fine if the mix still meets the spec.',
  means:'The books set a fuel spec, not a single mandated brand. Use a fuel its maker states meets this AMA spec, and do not add octane boosters or additives that could push it out.'},
 {id:'pro-fuel-test',topic:'fuel',applies:'Pro Supercross and Pro Motocross',year:2026,source:`${SX}; ${MX}`,who:'pro',
  rule:'Fuel may be sampled at any time, straight from the tank, into three sealed samples. One is lab tested; the second confirms a failure (the team may ask for it at its own cost) and the more favourable result stands. A fuel failure is a serious technical violation: after a race it means race disqualification, with more penalties possible. A protest involving a fuel test needs an extra US$1,000 deposit.'},
 {id:'ama-amateur-fuel',topic:'fuel',applies:'AMA amateur motocross',year:2023,source:AMA23,who:'amateur',core:true,caution:OLD,
  rule:'Petroleum-based gasoline meeting ASTM D4814, kept in approved containers. No separate oxygen or gravity limits were stated for amateurs in the edition read.',
  means:'Pump gasoline is made to D4814; a race fuel is fine when its maker states it meets the spec. Ask the club if unsure.'},
 // ── Tech ──
 {id:'tech-controls',topic:'tech',applies:'Pro (and AMA amateur equivalents)',year:2026,source:`${SX}; ${MX}; ${AMA23} (2023)`,who:'all',core:true,
  rule:'Levers need ball ends at least 1/2 in across. A working kill switch or button on the handlebar, reachable without taking your hand off the grip. A self-closing throttle. No cracked or bent-and-broken bars. The amateur book read (2023) has the same lever, kill switch and throttle rules.',
  means:'Check the throttle snaps shut with the bars at full lock both ways, and the kill button works, before tech.'},
 {id:'tech-pegs-frame',topic:'tech',applies:'Pro (and AMA amateur equivalents)',year:2026,source:`${SX}; ${MX}; ${AMA23} (2023)`,who:'all',
  rule:'Footpegs must fold back to 45°, be no longer than 5 in from the pivot, and sit no lower than the bottom frame tube. Kickstands removed. Cracked frames are banned.'},
 {id:'tech-brakes-wheels',topic:'tech',applies:'Pro Supercross and Pro Motocross',year:2026,source:`${SX}; ${MX}`,who:'pro',
  rule:'Working front and rear brakes of the production type (disc stays disc). Carbon, aluminium or titanium brake discs are banned, as are wheels made entirely of carbon. The primary drive must be fully covered.'},
 {id:'tech-exhaust',topic:'tech',applies:'Pro Supercross and Pro Motocross',year:2026,source:`${SX}; ${MX}`,who:'pro',
  rule:'Exhaust bolted to the frame with internal baffling, outlet no farther back than the rear edge of the rear tire and within 5 in of the outside edge of the tire or frame.'},
 {id:'tech-tires',topic:'tech',applies:'Pro and amateur national',year:2026,source:`${SX}; ${MX}; ${LL}`,who:'all',
  rule:'Pro: no studs (other than rubber), no paddle tires, knobs no taller than 3/4 in. Amateur National: only production tires on sale to the public.'},
 {id:'tech-chain-amateur',topic:'tech',applies:'AMA amateur motocross',year:2023,source:AMA23,who:'amateur',caution:OLD,
  rule:'The primary drive must be enclosed; a rear chain guard was not required in the edition read.'},
 {id:'tech-transponder',topic:'tech',applies:'Pro, amateur national and local',year:2026,source:`${SX}; ${MX}; ${LL}`,who:'all',core:true,
  rule:'Pro: transponder mounted vertically on the left fork leg between the triple clamps, powered whenever on track, returned after your last session (late returns are fined). Amateur National: required for Monday practice and every moto. At local races the rider is usually responsible for charging it and keeping it on the bike.'},
 {id:'tech-process-pro',topic:'tech',applies:'Pro Supercross and Pro Motocross',year:2026,source:`${SX}; ${MX}`,who:'pro',
  rule:'Up to two bikes per rider, same make and model, each with its frame number recorded; each must pass tech and the sound test before it is used. Passing tech does not certify the bike legal; it can be rechecked any time, and the top three go to impound. Officials can confiscate illegal parts.'},
 {id:'tech-process-amateur',topic:'tech',applies:"Loretta Lynn's program",year:2026,source:LL,who:'amateur',
  rule:'Teardown inspections happen in private with both racers allowed an observer. Protests are in writing within 30 minutes of results posting. The claiming value at the National is twice MSRP.'},
 // ── Number plates ──
 {id:'plates-pro',topic:'plates',applies:'Pro Supercross and Pro Motocross',year:2026,source:`${SX}; ${MX}`,who:'pro',core:true,
  rule:'450: white plates, black numbers. 250: black plates, white numbers. Points leader: red plates, white numbers. Last season’s SMX champions: purple plates, lime numbers (red with lime when leading).'},
 {id:'plates-pro-size',topic:'plates',applies:'Pro Supercross and Pro Motocross',year:2026,source:`${SX}; ${MX}`,who:'pro',
  rule:'Supercross: front and side numbers at least 5.5 in tall. Pro Motocross: front at least 6 in, sides at least 5.5 in. About 1/2 in of space around numbers, solid colour with no outline, no squashed or stretched digits. Front plate flat and rigid, with the series header (at least 1 × 8 in). Jersey number on the back at least 8 in tall, last name at the shoulders.'},
 {id:'plates-ll',topic:'plates',applies:"Loretta Lynn's program",year:2026,source:LL,who:'amateur',core:true,
  rule:'Pro Sport: white plate, black numbers. Women: blue (Process Blue) plate, white numbers. B classes: yellow, black numbers. C classes: black, white numbers. All other classes: white, black numbers.'},
 {id:'plates-ama',topic:'plates',applies:'AMA amateur motocross',year:2023,source:AMA23,who:'amateur',caution:OLD,
  rule:'Three plates, securely mounted. Numbers at least 5 in tall, plain block style, no shading or outline. Only the number on the plate, except the top 2 in of the front plate for a sponsor or name. Mini plates no smaller than stock. Recommended colours: A white/black, B yellow/black, C black/white. Rider and bike numbers must match.'},
 // ── Gear ──
 {id:'gear-helmet-pro',topic:'gear',applies:'Pro Supercross and Pro Motocross',year:2026,source:`${SX}; ${MX}`,who:'pro',core:true,
  rule:'Full-face helmet with its certification label attached: Snell M2015, M2020D or M2020R; ECE 22.05 or 22.06; or JIS T 8133:2015 Type 2 full face. It must carry the Eject helmet removal system. No helmet cameras or accessories.'},
 {id:'gear-pro-other',topic:'gear',applies:'Pro Supercross and Pro Motocross',year:2026,source:`${SX}; ${MX}`,who:'pro',
  rule:'Long-sleeve jersey worn to the wrist, full-length pants, MX boots at least 8 in high (no work boots), gloves at the start of every session, shatter-resistant goggles at the start of each race, no music players. Chest and back protection becomes mandatory with the 2027 books, under or over the jersey. A neck brace is optional; if worn over the jersey your name and number must still show.'},
 {id:'gear-smx-next',topic:'gear',applies:'SMX Next',year:2026,source:NEXT,who:'amateur',
  rule:'Approved chest and back protection is mandatory, under or over the jersey, covering the sternum, front and back ribs and the spine from T1 to T12.'},
 {id:'gear-ama-chest',topic:'gear',applies:'AMA amateur motocross',year:2026,source:MEMO,who:'amateur',core:true,caution:SECONDARY,
  rule:'For 2026 AMA made chest and back protection required for all motocross riders (the 2023 book required it only in Youth classes and recommended it for everyone else).',
  means:'Coverage the AMA has described: sternum, front and back ribs, spine T1–T12. Whether a roost deflector alone qualifies was not stated in what was read; ask the club.'},
 {id:'gear-ama-helmet',topic:'gear',applies:'AMA amateur motocross',year:2023,source:AMA23,who:'amateur',core:true,caution:OLD,
  rule:'Full-face helmet for practice and racing, unmodified, fitted and fastened: Snell M2015/M2020 or DOT FMVSS 218, ECE 22.05/22.06, JIS T 8133:2015, or FIM-approved. Boots at least 8 in high, shatterproof goggles or shield. Gloves, neck brace and knee braces recommended. AMA said in 2026 its helmet standards were updated, so check the current list.'},
 // ── Qualifying ──
 {id:'ll-path',topic:'qualifying',applies:"Loretta Lynn's qualifying",year:2026,source:`${LLQ}; ${LL}`,who:'amateur',core:true,
  rule:'Two steps: Area Qualifier (two motos) to Regional Championship (three motos; two at combined regionals), then the National at Loretta Lynn’s. The US is split into eight regions. Ride as many qualifiers in as many regions as you like, but you must attend the regional for the region you qualified in. Up to 4 classes a day at qualifiers and regionals, 2 at the National.'},
 {id:'ll-advancement',topic:'qualifying',applies:"Loretta Lynn's qualifying",year:2026,source:LL,who:'amateur',core:true,
  rule:'Guaranteed to advance from an Area Qualifier: top 9 in Northeast, Southeast, Mid-East, North Central and South Central; top 10 in Northwest; top 12 in Mid-West and Southwest. From the Regional to the National: top 6 in those first five regions, top 4 in Northwest, Mid-West and Southwest. 42 riders per class at the National.',
  means:'You also need a scored finish (at least half the leader’s laps and the checkered flag) in at least one moto to advance. Southeast covers Florida.'},
 {id:'ll-regional-rules',topic:'qualifying',applies:"Loretta Lynn's regionals and National",year:2026,source:`${LLQ}; ${LL}`,who:'amateur',
  rule:'Pre-register for your regional by the deadline to keep the spot and race both days. Qualifying in two regions sends you from your home region (your AMA address), else the better finish. Non-qualifiers can sign up as alternates, picked by a power ranking. Once qualified you cannot move up a class before the National.'},
 {id:'ll-moto-length',topic:'qualifying',applies:"Loretta Lynn's program",year:2026,source:LL,who:'amateur',
  rule:'Regional motos: 12 min for Micro, 65, Girls, Senior 45+, Masters 50+ and C classes; 20 min for Pro Sport; 15 min for the rest. National motos: 15 min, 25 min and 20 min for the same groups; Micro-E runs 4 laps.'},
 {id:'ll-scoring',topic:'qualifying',applies:"Loretta Lynn's program",year:2026,source:LL,who:'amateur',
  rule:'Low points win. A DNS scores the class size plus 30; a DNF scores the class size but never less than 20; a moto DQ scores the class size plus 40. National penalties: jumping the gate 1 lap, jumping or passing under yellow 5 positions, under the red cross 10 positions, not centred on your gate 2 positions.'},
 // ── Arenacross ──
 {id:'ax-series',topic:'arenacross',applies:'AMA Arenacross 2026–27',year:2026,source:AXR,who:'all',core:true,caution:SECONDARY,
  rule:'AMA backs three arenacross series for 2026–27: Partzilla Arenacross is the AMA Arenacross National Championship with East and West regions, GT Arenacross is the Midwest regional and Throttlecross the Rocky Mountain regional. The top 5 amateurs in each of the East, West and Midwest regions advance to the AMA Arenacross Amateur Championship finale at Lincoln Trail (Casey, Illinois).',
  means:'Class, sound and gear details are in the AMA Arenacross supplemental rules, which BAK has not read; check them and the series site.'},
 // ── Florida / local ──
 {id:'local-gatorback',topic:'local',applies:'Unlimited Sports events at Gatorback (Florida)',year:2025,source:FL,who:'amateur',core:true,
  rule:'All AMA rules and supplemental rules apply. Local penalties at that 2025 event: yellow flag jump or pass 2 positions plus riders passed, red cross 4 positions plus riders passed, cutting the course 1 plus riders passed, gate jump 1 lap. A red flag past 60% of the race ends it, earlier means a restart. Numbers as registered, no slashes, black on white or white on black. Riders on 51cc, Mini-E or 65 bikes go to staging with an adult.',
  means:'Local penalties can differ from the National; the rider meeting or the club supplemental rules are the word on the day.'},
];

/** What was looked for and not found, so BAK says it does not know instead of guessing. */
export const raceRuleUnknowns:RaceRuleUnknown[]=[
 {topic:'sound',year:2026,what:'The 2026 AMA amateur sound limit and its fixed test rpm; the 2023 book’s amateur limit table was not readable and the 2026 amateur book was not read.'},
 {topic:'sound',year:2026,what:'The exact penalty a local club gives for a failed amateur sound test; it is set by the club or series.'},
 {topic:'fuel',year:2026,what:'Whether any amateur series in Florida names a spec fuel; none found.'},
 {topic:'tech',year:2026,what:'Rules on bar-end caps, bar pads, countershaft sprocket guards and kill-switch lanyards for motorcycles: none found in the books read (the 2023 amateur book required a tether kill switch only on ATVs).'},
 {topic:'gear',year:2026,what:'The exact 2026 AMA amateur helmet standards list and whether a roost deflector meets the chest and back rule.'},
 {topic:'arenacross',year:2026,what:'AMA Arenacross supplemental rules (classes, sound, gear): not read.'},
 {topic:'local',year:2026,what:'TriStar and Mid-South arenacross rules and the Florida Winter AM series rules: no published rulebook found.'},
 {topic:'eligibility',year:2026,what:'Age limits for 250SX beyond the license minimum: none published beyond licensing and championship-years rules.'},
];

// ── Gating ──
// Strong phrases mean the rider is asking about rules on their own; weak topic words need a rules word next to them,
// so "race fuel jetting" or "the rear sounds harsh" stay with tuning.
const STRONG=/\b(rule ?books?|race rules|ama rules|supplemental rules|sound (test|check|limit|level|control)|decibels?|\d{2,3} ?db|db ?\/?a\b|2[- ]?met(er|re) (max|test)|tech(nical)? (inspection|check|line)|pass(ed|ing)? tech|number plates?|plate colou?rs?|plate backgrounds?|background colou?rs?|spec fuel|fuel (spec|rules?|test)|race[- ]legal|legal (for|at|in) (ama|racing|the race|the national|loretta|supercross|pro)|loretta|area qualifiers?|regional championships?|amateur nationals?|road to supercross|smx next|250 ?(sx )?(east|west)|eligib\w*|homologat\w*|transponders?|chest (and back )?protect\w*|back protector|roost (guard|deflector)|helmet (cert\w*|standards?|rating|rules?)|snell|ece ?22|eject (system|helmet)|kill (switch|button)|lanyard|supermini|schoolboy|mini ?sr|limited class(es)?|(a|b|c|vet|senior|masters|women'?s?|girls|college|pro sport|micro) class(es)?|arenacross|claiming rule|rpv|pro point|regionals?|how many motos|moto format)\b/i;
const RULE_CTX=/\b(legal|illegal|allowed|permitted|eligible|required|requires?|mandatory|banned|rules?|ama|sanction(ed)?|series|tech|inspection|disqualif\w*|dq|penalt\w*)\b|\bcan (i|he|she|we|they|my \w+) (race|run|enter|ride)\b|\b(which|what) class\b|\bhow old\b/i;
const TOPIC_WORD=/\b(class(es)?|fuel|gas|plates?|numbers?|helmets?|boots|gear|chest|neck brace|exhaust|pipe|muffler|silencer|loud|age|qualif\w*|motos?|tires?|footpegs?|pegs|levers?|throttle|brakes?|knobs|two[- ]?strokes?|2[- ]?strokes?|four[- ]?strokes?|4[- ]?strokes?|cc|250|450|125|85|65|50)\b/i;
const FOLLOW_UP=/^(and|also|what about|how about|same for|what if|is that|does that|do they|does it|for (a|an|the|my))\b/i;

const TOPIC_WORDS:Record<RaceRuleTopic,RegExp>={
 classes:/\b(class(es)?|supermini|schoolboy|mini ?sr|micro|vet|senior|masters|women|girls|college|junior|limited|pro sport|displacement|cc|two[- ]?stroke|2[- ]?stroke|four[- ]?stroke|4[- ]?stroke|50|51|65|85|112|125|150|250|450|weight|move up)\b/i,
 eligibility:/\b(eligib\w*|license|age|old|turn pro|road to supercross|smx next|east|west|classification|rpv|pro point|(a|b|c) class|move up)\b/i,
 sound:/\b(sound|loud|db|decibels?|muffler|silencer|exhaust|pipe|quiet|packing|end ?cap|insert)\b/i,
 fuel:/\b(fuel|gas|gasoline|octane|oxygen\w*|ethanol|e10|race gas|pump|premix|additive)\b/i,
 tech:/\b(tech|inspection|kill|lanyard|levers?|ball ends?|bar ends?|throttle|brakes?|pegs?|footpegs?|chain|sprocket|guard|tires?|knobs|transponder|weigh\w*|impound|protest|teardown|claim)\b/i,
 plates:/\b(plates?|numbers?|backgrounds?|colou?rs?|graphics)\b/i,
 gear:/\b(helmet|snell|ece|chest|back protector|roost|neck|brace|boots?|gloves?|goggles?|jersey|pants|gear|protect\w*)\b/i,
 qualifying:/\b(loretta\w*|qualif\w*|aq|regionals?|nationals?|advance\w*|transfer|motos?|format|scor\w*|dns|dnf|alternates?|gate)\b/i,
 arenacross:/\b(arenacross|arena|partzilla|indoor|throttlecross|gt arenacross|tristar|mid-?south|ax)\b/i,
 local:/\b(florida|gatorback|unlimited sports|local|club|district|mini o'?s|winter am|tristar|mid-?south)\b/i,
};
const PRO=/\b(pro|pros|supercross|sx|smx|pro motocross|450sx|250sx|450mx|250mx|factory|privateer|road to supercross|east|west|license)\b/i;
const AMATEUR=/\b(amateur|youth|kids?|son|daughter|mini|minis|loretta\w*|aq|regionals?|vet|senior|masters|limited|schoolboy|supermini|girls|college|local|club|(a|b|c) class|50cc|51|65|85|112|125 ?c)\b/i;

/** Max size of the returned JSON, about 2.3k tokens at four characters a token. */
export const RACE_RULES_MAX_CHARS=9200;

const clean=(s:string)=>s.replace(/rules? of thumb/gi,'').replace(/sounds? (like|good|right|off|weird|harsh)/gi,'');
export function isRaceRulesQuestion(text:string):boolean{
 const t=clean(text);
 return STRONG.test(t)||(RULE_CTX.test(t)&&TOPIC_WORD.test(t));
}

/** Compact race-rules section for Ask BAK, or null when the conversation is not about race rules.
 * `history` is earlier rider messages, oldest first; a short follow-up inherits a rules conversation from them. */
export function raceRules(message:string,history:string[]=[]):object|null{
 const recent=history.slice(-3);
 let text=message;
 if(!isRaceRulesQuestion(message)){
  const short=message.trim().length<=90&&(FOLLOW_UP.test(message.trim())||TOPIC_WORD.test(clean(message)));
  if(!(short&&recent.some(isRaceRulesQuestion)))return null;
  text=[...recent,message].join(' \n ');
 }
 const t=clean(text),m=clean(message);
 const keys=Object.keys(TOPIC_WORDS) as RaceRuleTopic[];
 const hits=(re:RegExp,s:string)=>Math.min(3,(s.match(new RegExp(re.source,'gi'))??[]).length);
 // The current message counts double; earlier messages only carry the topic of a follow-up.
 const weight=Object.fromEntries(keys.map(k=>[k,2*hits(TOPIC_WORDS[k],m)+(t===m?0:hits(TOPIC_WORDS[k],t))])) as Record<RaceRuleTopic,number>;
 const topics=keys.filter(k=>weight[k]>0).sort((a,b)=>weight[b]-weight[a]);
 const pro=PRO.test(t),am=AMATEUR.test(t);
 const score=(r:RaceRule)=>{
  let s=topics.length?weight[r.topic]*2:(r.core?4:0);
  if(r.who==='all')s+=1;else if((r.who==='pro'&&pro)||(r.who==='amateur'&&am))s+=3;else if(pro!==am)s-=3;
  if(r.core)s+=1;
  return s;
 };
 const ranked=RACE_RULES.map((r,i)=>({r,i,s:score(r)})).filter(x=>(topics.length?topics.includes(x.r.topic):x.r.core)&&x.s>0).sort((a,b)=>b.s-a.s||a.i-b.i);
 const unknown=raceRuleUnknowns.filter(u=>topics.includes(u.topic)).map(({topic,year,what})=>({topic,year,what}));
 const out={version:RACE_RULES_VERSION,as_of:RACE_RULES_AS_OF,
  boundary:'Race rules BAK summarized in its own words from published rulebooks; not the official text. Each item carries the year of the book it came from and the body that publishes it. Rules change every season and clubs and series add supplemental rules, so always tell the rider to confirm with the current rulebook and the series or club running the race before race day; the tech inspector and referee have the final say. Items marked with a caution come from an older edition or a secondary report: say so. Anything under unknown, or not listed here, is unknown: say BAK does not have it rather than guessing a number.',
  topics:topics.length?topics:['overview'],
  items:[] as Omit<RaceRule,'core'|'who'|'id'>[],
  unknown};
 for(const {r} of ranked){
  const {core:_c,who:_w,id:_i,...item}=r;
  out.items.push(item);
  if(JSON.stringify(out).length>RACE_RULES_MAX_CHARS){out.items.pop();}
 }
 if(!out.items.length)return null;
 return out;
}
