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
| KTM family | 2: depth and gaps (see below), then 2020-2022 back-fill | Next | |
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
