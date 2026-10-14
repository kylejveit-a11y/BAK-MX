# Aftermarket parts and specs research, by bike family

User direction 2026-10-14: build everything there is to know about aftermarket parts for each bike: part numbers, where to
get them, what they change on the bike, and rider feedback. Order: KTM family (KTM, Husqvarna, GasGas) first, then Triumph,
then Yamaha, and on through Honda and Kawasaki until complete, newest model years first. Continues docs/AFTERMARKET_BUILD_PLAN.md.

Scope for now: motocross and cross-country models (enduro and trail models such as XC-W, TE, FE, EC and WR are out of scope).
Suspension components and their service parts are in ../suspension-knowledge/COMPONENT_CATALOG.md.

## How a family is built

Research goes by platform (generation), not by single bike-year, because aftermarket parts are sold per platform. Five slices
per family: the manufacturer's own accessory catalog; exhaust, intake, fuel and ECU; engine, clutch and cooling; chassis,
controls, wheels, brakes, drivetrain and protection; rider and tester feedback with project-bike builds. Each product keeps
its part numbers, every listed fitment line, what it changes (as claimed, attributed), supporting parts, where to buy (price
only as stated, dated) and a confidence. `scripts/aftermarket/build_catalog.py <dir> <title> <makes>` maps the fitment to the
app's bike list (`roster-2020-2027.json`), links feedback to products and writes `CATALOG.md` (with a by-bike section) and
`index.json`.

Everything here is a research candidate: not verified evidence, not shown to riders, and not a recommendation. Promotion into
the app needs a manufacturer-page fitment check per part (the evidence fields in AFTERMARKET_BUILD_PLAN.md).

## Progress

| Family | Pass | Status | Result |
|---|---|---|---|
| KTM family | 1: newest platforms (2023-2027), breadth across all five slices | Done 2026-10-14 | 112 products, 54 rider/tester findings, 11 project builds; 217 of 224 in-scope bike-years have at least one mapped part |
| KTM family | 2: manufacturer confirmation, missing brands and categories, 85 SX, more feedback | Done 2026-10-14 | 210 products (32 high, 123 medium, 55 unverified), 276 part numbers, 83 findings, 17 builds; all 224 in-scope bike-years have mapped parts |
| KTM family | 3: full dealer and retailer catalogs (every brand), company registry | In progress 2026-10-14 | KTM Twins 968 listings (59 brands), Lings 1,463 official Husqvarna / GasGas / KTM accessories, Cycle Gear crawl running; 233-company registry in companies/COMPANIES.md |
| Triumph | 1 | Queued | |
| Yamaha | 1 | Queued | |
| Honda | 1 | Queued | |
| Kawasaki | 1 | Queued | |

## KTM family: what pass 1 found and what pass 2 must do

Main findings: platform boundaries are sourced (full-size SX generation from MY2023, GasGas from MY2024, new 85 SX from
MY2025, 2027 125 SX fuel-injected); the 2026-27 airbox change means Akrapovič systems need the MY25 airbox, filter and map and
then exceed the FIM 109 dB limit; 2023-24 ECUs are locked (remaps through Vortex, Twisted Development, WMR or Jamie Ellis); the
WP XACT Pro 6500 coil conversion splits testers (MXA vs Keefer); 2024+ GasGas Braktec brakes make Brembo-fit levers and rotor
kits doubtful; magazine dyno results for FMF on the 2023 300 SX and TC 250 (green map).

Pass 2 list:
- Confidence: no product is high yet in the engine and OEM slices. Confirm part number and fitment on manufacturer pages
  (FMF, Rekluse, Hinson, Wiseco, Vertex, Galfer, Xtrig, Luxon, Ride Engineering, P3, Raptor); several manufacturer sites need a
  first fetch approval.
- Missing products: Arrow, SC-Project, Doma, Rocket, DEP exhausts; FMF 4.1 RCT and Factory Fatty part numbers for 2023+;
  Pro Circuit two-stroke pipes; reeds and power valve parts for TBI two-strokes; JE/CP pistons, big-bore kits, cams, valves,
  crank kits, gaskets for the 2023+ engines; Barnett, Rekluse RadiusX/auto; stators and flywheel weights; bars, grips,
  handguards, linkages, Haan/Warp 9/Talon/DID wheels, pads, master cylinders, chains, sprockets, skid plates and guards;
  Husqvarna- and GasGas-specific OEM part numbers; map switch part numbers; 85 SX for every slice.
- Feedback: 2026-27 written tests, cross-country models, GasGas 250/350, 2023+ clutch tests, footpeg, wheel and rotor tests;
  Dirt Bike Test, Transworld, Dirt Rider, Cycle News, ThumperTalk; the blocked Swapmoto and MXA pages listed in the files.
- Then 2020-2022 platform back-fill across all slices.

## KTM family pass 2 (2026-10-14)

Confirmed on the maker's own page: Pro Circuit Ti-6 systems (with corrected year ranges: the maker lists fewer years and
models than retailers), FMF 2023+ slip-ons and TBI pipes (new numbers 025288, 025290, 045669/045680, 045670/045679), Rekluse
TorqDrive kits, Wiseco and ProX pistons, TM Designworks, Supersprox, Cometic, Works Connection axle blocks.

Corrections and findings: 2024+ GasGas Braktec brakes take their own levers (ARC BR-122), so Brembo-pattern levers were taken
off GasGas 2024+ (p2-corrections.json); 2023-24 and 2025+ linkage bolts differ, so linkages do not swap across them; the 2023
GasGas MC-F still has the previous KTM engine (2016-2022 engine parts fit); the 2023+ KTM SX-F handlebar switch number comes
only from a Vortex harness listing; Husqvarna did not import the 2026 FC to the US, which explains its absence from fitment
lists; Boyesen lists its WPK-44 supercooler only to 2022 on its own page; Rekluse auto clutch tested on a 2025 350 XC-F.

Pass 3 list:
- 2020-2022 platform back-fill across every slice.
- Still unconfirmed at the maker: KTM PowerParts and Akrapovič (ktm.com renders without data; dealer catalog PDFs may work),
  FMF 4.1 RCT 2023+ 450, Hinson (maker shows no SKUs), Galfer (US links redirect), Vertex, Moto-Master, Xtrig, Luxon, Ride
  Engineering, HGS, Kite, Raptor, Fastway, Scotts, Athena/GET, Twin Air, No Toil.
- Not found yet: 2023+ big-bore, cams, valves, crank kits, stators and four-stroke flywheel weights; JE/CP pistons; Boyesen
  reeds and power valve springs for TBI; support for the 2027 fuel-injected 125; 2025+ 85 SX wheels, controls and suspension
  part numbers; Husqvarna and GasGas colour-variant OEM numbers; Haan/Talon/DID wheels; Regina/EK chains.
- Feedback: no written aftermarket tests yet for 2026-27 KTM or Husqvarna; Hinson tests on 2023+; four-stroke cross-country
  tests; the MXA and Racer X pages listed as not done in p2-rider-feedback.json.

## Pass 3 method: whole catalogs instead of searches (2026-10-14)

Searching part by part reaches a few dozen products per session. Pass 3 reads whole dealer and retailer catalogs directly,
politely (robots.txt respected, about one request per second), so every brand they carry is captured with its part numbers,
fitment, price and link:

| Source | What it gives | Script |
|---|---|---|
| KTM Twins (official KTM dealer, US; public store feed) | KTM PowerParts and 58 other brands, part number, per-product FITMENT list, US price | scripts/aftermarket/ktmtwins_convert.py |
| Lings (KTM / Husqvarna / GasGas dealer, UK; public store feed) | Husqvarna and GasGas Technical Accessories and KTM PowerParts by exact model-year collection, GBP price; EU market | scripts/aftermarket/lings_convert.py |
| Cycle Gear (US retailer; server-rendered pages) | every part listed for each bike-year (all brands), product page with the manufacturer part number per style, fitment notes, rating, price | scripts/aftermarket/cyclegear_crawl.py |

Each family folder now has `bikes/<bike>.md` (every listed part for that bike-year, grouped by category, duplicates across
sellers merged), `BRANDS.md`, and `CATALOG.md` (researched parts, rider findings, builds, sources). Not readable from here:
MotoSport fitment (loaded by script; its product pages are used for part numbers only), AOMC, Partzilla, Rocky Mountain
(bot protection), Honda and Kawasaki genuine-accessory catalogs. Next readable sources found: yamahaonlineparts.com (GYTR,
store feed) and triumphpartstore.com (Triumph TF accessories, server-rendered fitment tables).
