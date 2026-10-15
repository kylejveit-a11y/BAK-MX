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
| KTM family | 3: full dealer and retailer catalogs (every brand), company registry | Wrapped up 2026-10-14 (partial, see below) | 8,738 listings: KTM Twins 968, Lings 1,463, Cycle Gear 2,790 parts across all 223 bike-years with a Cycle Gear page (150 brands, all with part numbers), MotoSport 3,368 across 60 bike-years 2025-2027 (230 brands, 2,652 with part numbers); all in `ktm-family/parts.csv`; per-bike pages list bike-specific listings in full and count universal ones; 233-company registry |
| Triumph | 1: genuine accessories (official dealer catalog), aftermarket search, rider and tester feedback; Cycle Gear and MotoSport catalogs | Done 2026-10-14 | 125 products (76 Triumph genuine accessories from triumphpartstore.com, 49 aftermarket: 5 high, 35 medium, 9 unverified), 31 findings, 5 builds; all 9 TF bike-years mapped. Retailer catalogs: Cycle Gear 1,273 parts (121 brands, all with part numbers), MotoSport 2,431 (208 brands, 2,280 with part numbers); 3,829 listings in `triumph/parts.csv` |
| Yamaha | 1: maker-confirmed parts, rider and tester feedback; Yamaha genuine and GYTR; Cycle Gear and MotoSport catalogs | Done 2026-10-15 | 5,992 listings in `yamaha/parts.csv`: 46 researched parts (about 22 maker-confirmed), 155 Yamaha genuine / GYTR (yamahaonlineparts.com), Cycle Gear 2,470 (148 brands), MotoSport 3,321 (232 brands); 34 findings, 5 builds; all 63 YZ bike-years mapped |
| Honda | 1: maker-confirmed parts, rider and tester feedback; Cycle Gear and MotoSport catalogs | Done 2026-10-15 | 5,158 listings in `honda/parts.csv`: 27 researched parts (12 maker-confirmed), Cycle Gear 2,033 (145 brands), MotoSport 3,098 (227 brands); 35 findings, 6 builds; all 28 CRF-R / RX bike-years mapped. Honda genuine accessories not readable from here |
| Kawasaki | 1: maker-confirmed parts, rider and tester feedback; Cycle Gear and MotoSport catalogs | Done 2026-10-15 | 5,057 listings in `kawasaki/parts.csv`: 30 researched parts (23 maker-confirmed), Cycle Gear 1,953 (141 brands), MotoSport 3,074 (229 brands); 28 findings, 4 builds; all 26 KX bike-years mapped. Kawasaki genuine accessories not readable from here |

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

## Triumph: what pass 1 found

Sources: the official US dealer catalog (triumphpartstore.com, 76 genuine accessories with part number, price and the TF
catalogue and year each is listed under), maker pages (Rekluse, Triumph MX Tune Pro), retailers, and tests (MXA, Keefer Inc,
Vital MX, Cycle News, Dirt Bike, Australian tests). Files: `triumph/dealer-triumph-genuine.json`, `triumph/triumph-aftermarket.json`,
`triumph/triumph-feedback.json`, built into `triumph/CATALOG.md`, `BRANDS.md` and `bikes/`.

Main findings: Pro Circuit, FMF, Yoshimura, Rekluse, Hinson, Pro-X, Enduro Engineering, AXP and X-Trig list TF parts with part
numbers; the FMF 4.1 Ti / Megabomb on the TF 250-X is the only aftermarket exhaust with a rider test (stronger 2nd-3rd gear pull,
slightly softer off idle); testers agree the stock springs are soft above about 80 kg, run 100-104 mm rear sag, and want a 110
rear tire; gearing is split (13/48 stock vs 13/49); the 2025 ECU maps can be dealer-flashed onto a 2024 TF 250-X; Rekluse
reports a Triumph recall of the TF 250-X clutch centre hub and plates (years not given). Six records have no stated years and
stay unmapped. Still to do: HGS and Akrapovič aftermarket numbers, Wiseco / Vertex / JE pistons, suspension tuner services,
ECU tuners, sprockets, wheels, rotors, bars and controls, graphics, seats, and factory-team bike parts lists; 2026 TF 450-X /
450-E fitment is thin everywhere.

## KTM family pass 3: where it stopped (2026-10-14)

Wrapped up at the owner's request so Triumph, Yamaha, Honda and Kawasaki can go next. What is in and what is left:

- Cycle Gear: complete (2026-10-15): every KTM / Husqvarna / GasGas bike-year with a Cycle Gear page, and every product page
  (manufacturer part number per style, category, fitment notes).
- MotoSport: bike listings read for 2025-2027 (60 bike-years); 2020-2024 still to read (about 3 hours). Product pages
  read for 2,849 of 3,368 listings (shared with the other makes). The store's plain ride pages are not filtered by bike; the
  crawler selects the ride with the store's own mmy parameter (codes from its ride selector). Product pages (part number
  table) not read yet.
- To finish: `motosport_crawl.py` with the KTM-family targets (it resumes from what is saved), then
  `motosport_convert.py` into `ktm-family/` and `build_catalog.py`.
- Universal items (a listing that fits at least 40 % of the bike-years read from that retailer: oil, grips, batteries) are
  counted on each bike page rather than listed; every listing is in `parts.csv` with compact fitment.
- The workspace stops when the session is idle, so long crawls only run while a session is active.

Universal items: a Cycle Gear or MotoSport listing carried for three or more make families (KTM group, Triumph, Yamaha,
Honda, Kawasaki) is counted on the bike pages instead of listed. Until every family is crawled some universal items still
show as bike-specific; the pages sharpen as Yamaha, Honda and Kawasaki finish. Product pages read for Triumph also filled in
part numbers for the KTM-family listings they share (Cycle Gear 1,205, MotoSport 2,399).

## Yamaha: what pass 1 found

Maker-confirmed part numbers from Pro Circuit, FMF (two-stroke pipes), Yoshimura, Akrapovič, Rekluse and Wiseco; platform
boundaries as sources describe them (YZ450F 2023 new platform, 2025 linkage and mounts, 2026 frame, shock, hydraulic clutch and
locked ECU; YZ250F 2024 frame, 2027 all-new; YZ450FX on the YZ450F platform from 2024). Tester settings: Keefer baselines for
YZ450F 2025-26 and YZ250F 2023-26; MXA measured the 2026 YZ450F at 56.7 hp against 59.5 hp for 2025 (GYTR sells the 2025
airbox). Disagreements kept: YZ450F gearing (MXA taller, Keefer shorter), fork height, holeshot device height. GYTR listings
whose page names a model but no years stay unmapped. Gaps: HGS, Arrow, Hinson, Vertex, JE, Pro-X, Hot Cams, GET, suspension
tuners and the protection brands have no maker-confirmed numbers yet; YZ125X / YZ250X setup data is thin; 2026 YZ450F and
2027 exhaust fitment is not maker-confirmed.

## Honda: what pass 1 found

Maker-confirmed exhaust part numbers from Yoshimura and Pro Circuit, with the year splits they show (Yoshimura 2021-24 vs
2025-26 CRF450R; Akrapovič 2021-23 vs 2025-26; Pro Circuit CRF250R slip-on 22-24 vs 25-27). The 2027 CRF450R is a new
platform (new engine, about 70 % new frame, 160 mm sprocket mounting so older rear sprockets do not fit; Cycle News, Ultimate
Motorcycling). Keefer baselines for CRF450R 2024-26 and CRF250R 2024-26, his reduced chassis torque values, map and traction
control by condition, gearing (a 14T front is blocked by the clutch slave on the CRF450R). Disagreements kept: 2025 CRF450R
dyno (MXA 55.34 hp vs Dirt Rider 51.1 hp), 2027 dimensions between sources. Gaps: FMF's own pages and several Keefer pages
did not load; no HRC tuning tool for 2021+ found; no maker-confirmed pistons or cams for 2021+; no CRF250RX feedback; no
confirmed 2027 aftermarket fitment.

## Kawasaki: what pass 1 found

Maker-confirmed: Pro Circuit exhausts, race pistons, cams and linkages (KLS24450 fits KX450 2024-26 and KX250 2025-26),
Yoshimura RS-12, Akrapovič Evolution (needs its insert for the FIM limit), Rekluse, Wiseco, TM Designworks, and Kawasaki
Australia's KX FI Calibration Kit with the sub-harness and clamp it needs. Platforms: KX450 new from 2024 (centre exhaust,
Rideology app, no couplers), KX250 updated 2021 and new 2025, 2026 carry-over, 2027 KX450 new exhaust, frame spars, swingarm
and rear brake (no maker fitment yet). Keefer baselines for KX450 and KX250 2025/26; MXA dynos with the Pro Circuit Ti-6 and
Twisted Development map; optional softer engine mounts. Disagreements kept: coupler descriptions (Keefer vs MXA), KX450 fork
height, gearing, price changes over time. Gaps: FMF pages, Kawasaki US accessories and Ride Engineering did not load; no
2024+ KX450 aftermarket piston found; HGS, Arrow, GET and suspension tuners not covered.

## All brands

`companies/ALL_BRANDS.md` lists every brand with a part listed for any in-scope bike across all five families (390 brands;
96 of them also profiled in the researched registry `companies/COMPANIES.md`), with listing counts, families, main categories
and sources. Universal items are now judged against all five families.
