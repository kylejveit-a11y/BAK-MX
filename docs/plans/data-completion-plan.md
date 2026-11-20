# Data and AI completion plan (started 2026-11-18)

Kyle's instruction: no new features; bring these to launch-ready, finished. Work the list top to bottom and keep this file current.

## 1. Sag targets and spring charts
Audit (2026-11-18, roster 898 bike-years): race sag on file for all KTM/GasGas/Husqvarna (bar a handful), Honda 2020+, Yamaha 84/166.
- [x] Kawasaki (60 bike-years): verified that no US KX owner's manual 2014-2027 prints a sag figure. Ask BAK told via
      `shared/maker-publishing.ts` (prompt 89). Nothing to load.
- [x] Yamaha: the first audit over-counted (its pattern missed "sunken length"). Real holes were 17 bike-years
      (WR250F 2010-13, 2015-17; WR450F 2010-18; YZ250FX 2018): loaded and verified 2026-11-18, all 90-100 mm.
      YZ65 / YZ85 owner's manuals print no sag: recorded in maker-publishing. Open: YZ65 2026, YZ85 2022-2027 (no manual matched).
      Report: docs/research/expansion/gaps/yamaha-sag/REPORT.md. Use the corrected SQL pattern (includes 'sunken length') for audits.
- [x] Honda 2010-2019: 35 bike-years loaded and verified 2026-11-18 (race sag; free sag 10-25 mm where printed), read in the
      browser on Kyle's computer. CRF150R 2012-2019 loaded at 85 mm on 2026-11-19 (standard line and worked example agree; 90 mm is a labelled example);
      CRF450RX 2018 has no manual. Report: docs/research/expansion/gaps/honda-sag/REPORT.md. Method reusable: window.__run in the
      browser pane at cdn.powersports.honda.com with pdf.js from cdnjs.
- [ ] Free sag: Honda 2010-2013 era prints 10-25 mm (loaded). Still to read: Honda 2020+ handbooks (gap log asks for it on CRF250R 2020 / 2024)
      and Yamaha; add a maker-publishing note where a manual prints none.
- [ ] Suzuki RM-Z (16): no manufacturer-published manual found online. Stays unknown unless Kyle supplies manuals.
- [x] Small holes, 2026-11-19: Husqvarna FC 250/450 2026 and KTM 125 SX 2023 manuals print sag only in tables labelled EU /
      Factory Edition / 125 XC US, none for the US standard model. Not loaded as US facts; quoted to Ask BAK with their table
      labels via maker-publishing (prompt 90). Report: docs/research/expansion/gaps/ktm-group-sag/REPORT.md.
      Still open (no manual facts at all): GasGas EC 250 2021, Husqvarna FE 450 2020-22, KX85/KX112 2027, RM-Z 2023.
- [x] Rider-weight spring charts, Honda (2026-11-20): the 2021-2026 CRF250R/RX and 2021-2027 CRF450R/RX competition handbooks
      (13 documents, read in the browser on Kyle's computer) print no rider-weight range or chart; only the 2020 manual does
      (fork springs, 170-200 lb without gear, on file). Recorded in maker-publishing so Ask BAK says so. The same read found no
      free sag in the 2021 and 2027 handbooks. Not checked: 2027 CRF250R handbook (file name on record answered 404).
- [x] Rider-weight spring charts, Yamaha (2026-11-20): all 135 owner's service manuals in the indexes searched in full on Kyle's
      computer; none prints a rider-weight range or chart (they list optional spring rates with part numbers and ID marks).
      Recorded in maker-publishing for YZ125/125X/250/250X/250F/250FX/450F/450FX and WR250F/WR450F to 2019.

## 2. Manuals (manual_wanted: 83 HAVE / 359 WANTED)
- [x] Reconciled 2026-11-18: all 359 WANTED rows are paid factory service/repair manuals (Helm $50, Kawasaki ~$103, KTM print shop);
      the 83 HAVE are the free owner's manuals, already loaded. Nothing more can be loaded without buying. Kyle decides; shortlist
      by riders' bikes: Honda 61K9503, 61K9550, 61MKE61; Kawasaki 99830-0153-05; KTM/Husqvarna repair manuals; Triumph (no listing).

## 3. Modified bikes
- [x] 2026-11-19: the rider's own shock and fork spring rates already feed spring_check (server/physics-context.ts).
      Found and fixed while checking: the reader of the maker's standard sag missed Yamaha ("sunken length", 147 bike-years)
      and Triumph ("4.02 in (102 mm)") wording, could pick a Honda optional-spring or adjustment-range row, and treated
      Honda's 10-25 mm free-sag range as one number. Now strict, range-aware, and gives no target when standard rows disagree
      (shared/suspension-physics.ts). Checked: Honda CRF450R 2027's 95 mm and 100 mm rows are the standard and Works Edition variants, not a conflict.
- [ ] Published kit data where the maker posts it (WP, Rekluse).
- [x] 2026-11-19: retailer parts back-fill loaded. The 441 bike-years the Cycle Gear read had missed (47 of them list nothing there)
      and 2,885 product pages not read before are in docs/research/aftermarket/*/cg-backfill-2026-11.json; app catalogs rebuilt.
      Bikes with under 100 parts: 247 -> 35 (394 bikes gained parts). An earlier note here said 27 -> 14; that count was
      read wrongly from the catalog file and is corrected. The 34 still under 100 are GasGas EC, Husqvarna TE / FE 2020-22,
      TX 125, KTM 85 SX 19/16 2017-19, GasGas MC 50 2021 and Triumph TF 250-X 2027.
- [x] 2026-11-20: maker-direct parts from X-Trig, Ride Engineering, P3 Carbon and FCP Racing (711 products with the makers'
      own fitment). Every one of the 898 bikes now has parts from these makers (was 395); median 43 per bike.

## 4. Track details (221 tracks: 130 low confidence, 207 with listed gaps; 11 riding areas without soil/layout)
- [x] 2026-11-20 map and visit-info pass: 40 more places have a position (address geocoded), 191 have ground elevation
      (was 1), 41 places show hours / fees / rules from the track's own site on the place page, 54 records got contact,
      access, soil or social updates from official sites, and 6 website links that now lead to gambling or dead domains
      were removed. Twelve of the 14 official sites were read; danwoodleyracing.com answers 403 and silverdollarmp.com and
      hardrockoffroadpark.net only draw in a browser.
- [ ] Still open: about 50 places with no position (no street number on file), soil / layout for tracks whose sites do
      not describe them, and a second read of the track sites for layout and rider-condition detail.
- [ ] Raise low-confidence tracks from official pages, most-used states first (FL, GA, AL, NC, SC, TN).
      2026-11-19: FL/GA open low-confidence rows already hold everything the directories and press say; what is left is on the
      tracks' own sites, which need Kyle to approve the page fetches (or paste the links): fasttraxxflorida.com,
      danwoodleyracing.com, mesamotocross.com, motosandbox.com, haroldmotorsports.com, hardrockoffroadpark.net,
      centralfloridaoffroad.com, lanefarmmx.com, motoxcompound.com, silverdollarmp.com, stfraceway.com, tenmilemx.com,
      victorytrainingfacility.com, ironmountainresort.com. Silver Dollar: 2020 rebuild note and source added.

## 5. Ask BAK speed and regression set
- [x] 2026-11-19 measured (38 live answers, 14 days): median 23 s. Planning call 3.3 s, database 0.3 s, answer 18.7 s, of
      which about 7 s passes before the first word and the rest is writing (about 900 tokens at roughly 50-80 a second).
      Context size is not the driver (50k-90k tokens made no visible difference to the first word).
- [x] 2026-11-19 fixed: a stray word could pull two whole engine-rebuild jobs (460 KB, about 130,000 tokens) into an unrelated
      question (5 of 83 test questions). Long jobs now go in full only when the rider names them, otherwise as an outline.
      Also fixed while there: "rebuilding the top end" and "change the oil" matched no job at all (short words were dropped).
- [x] 2026-11-20 lighter reasoning level tested on 50 questions, same prompt (v91), run side by side. NOT switched on.
      Speed: first word 11.0 s -> 6.0 s (median, whole request); full answer 24.6 s -> 19.9 s. No guard repairs either way,
      no wrong facts seen. But it leaves out factory numbers the normal level volunteers: cited specs 2.2 -> 1.7 per answer,
      and in about 8 of 50 answers a useful maker value was missing (plug gap and torque, valve clearances, stock jetting).
      Those numbers are the point of BAK, so the default stays. Possible later: lighter level only for questions the
      planning step marks as needing no factory values (needs its own test run; each run costs API money).
- [ ] The planning call (2.5-3.3 s) is the next target: nothing lighter is accepted; a faster planning model is a config choice.
- [ ] Eval set from real rider questions; rerun after every prompt change.

## Log
- 2026-11-18: prompt 89 live; eval on KX450 2024 / KX250 2022 sag questions: says Kawasaki publishes none, gives preload-nut position and general guidance, no gap logged.

## Parked until the data work is done (Kyle asked not to be allowed to forget)

- First-login setup flow (asked 2026-11-19). On the first sign-in to a new account, walk the rider through setup before the
  app opens: profile basics (name and the few required fields), pick a bike, then the choices that now live in the menu
  (widgets, colours, measurements and the rest) asked as a few plain-worded questions, each answer setting the group of
  related settings behind it. Front-end work; start after the data checklist above is finished.
- Monetisation proposal (report dated 2026-11-19: affiliate parts links, banner ads on the free tier, ad-free Plus at $7.99).
  Reviewed in chat the same day. Kyle likes the affiliate links; researching retailer programs next. Banners and Plus: no decision.
- Parts buying inside Ask BAK (Kyle's idea, 2026-11-19): when a rider works through a problem and needs a part, Ask BAK shows
  the part that fits their Garage bike, where to buy it, and offers "save to my parts list". Later: live price and stock,
  then ordering and order tracking through the app. Stage 1 uses the existing catalog and affiliate links; ordering needs
  retailer agreements and is not confirmed possible. Commission must be disclosed, and parts ranked by fit, never by payout.
  Kyle's rule (2026-11-19): never push sales. Ask BAK only offers once, when a part is actually needed ("I can show you who
  has that and give you a link if you want"), and it is better to offer too rarely than too often. Separate "parts hunter"
  mode the rider opens on purpose to find a part and who sells it. More thought needed before any build.


## Aftermarket springs in Ask BAK (2026-11-20)

- `server/spring-options.ts`: on spring, sag or rider-weight questions Ask BAK now gets the aftermarket fork and shock springs listed for the rider's exact bike with the rates each company offers (N/mm plus the company's own label), and the listed rate nearest the one worked out from sag or the maker's rider-weight table, with the next step softer and stiffer.
- Coverage from the parts lists: 688 of 898 bikes have something; 578 have a shock rate list, 534 a fork rate list (Factory Connection, REP Suspension, WP, some Race Tech). Store listings that cover every bike in one long drop-down are not used as a rate list; the company is only named.
- Aftermarket companies do not publish static rider-weight charts (they use rate finders or a phone call), so BAK never says a company recommends a rate for a weight unless that company's own guide is on file (one so far: Ride JBI). Race Tech's rate finder is proprietary and is not copied.
- Cannon Racecraft chart: read 2026-11-20, see below.

## Cannon Racecraft application chart (2026-11-20)

- Kyle supplied the maker's chart PDF. `scripts/aftermarket/cannon_chart_convert.py` reads its table rows into
  `docs/research/aftermarket/specialty/cannon-racecraft.json`: 43 spring products, 812 bike-year fits, rate lists per bike
  (fork and shock). Rows for bikes outside the app are in the file's `unread` list. The PDF is not kept.
- The chart prints no rider-weight recommendations and no units (read as kg/mm); it says part numbers are not guaranteed, which
  is carried as a caveat on every record.

## Parked ideas from Kyle (do not lose)

- Specialist agents under the one rider-facing BAK agent (2026-11-20): a Suspension specialist (every shock, clicker, spring,
  dimension, valving stack, shim, bushing; rebuild, tune, maintain), an Engine specialist (full teardown and rebuild, custom
  tuning, porting explained correctly), maybe a Bike set-up specialist. Riders still talk to one BAK. Assessment given to Kyle:
  helps if built as deep knowledge packs plus a router and scored by specialist question sets; hurts if it becomes several
  separate chatbots or slows answers. The limit is data (valving stacks and shim specs are mostly paid service-manual or
  tuner-proprietary), not the agent plumbing.
- Race Tech's Motorcycle Suspension Bible: a book in print and under copyright. No free legal copy; not fetched. If Kyle buys
  a copy and supplies it, read it for the ideas and methods in our own words (facts only, text not stored).

## Suzuki RM-Z from public sources only (Kyle, 2026-11-20) — ACTIVE

Kyle is not buying Suzuki manuals: do not raise it again. Build RM-Z250 / RM-Z450 from the public web (magazine tests, tester
baselines, retailer torque pages, forums, Suzuki's own pages and brochures), under the existing COMMUNITY-tier rule in
`docs/research/expansion/suzuki/rmz-community-knowledge.json` (two independent sources agree, or stored as a spread).
State today: 2-61 facts per bike-year against 300-700 for a Honda; 120 community rows loaded 2026-11-03.
Open holes, in order:
1. RM-Z450 2022-2026 clickers, sag and shock spring (two manual editions disagree; settle with magazine stock boxes per year).
2. 2027 for both models (RM-Z450 moved to KYB; RM-Z250 KYB re-tuned): nothing loaded.
3. Torques, valve clearances, maintenance intervals, RM-Z250 fluids and gearing (single-source so far). Leads: MotoSport's
   per-bike torque pages, Dirt Rider technical-information pages (2023, 2025), Suzuki global and Australia spec pages.
4. 2023 (no facts at all) and the thin 2020-2022 years: Suzuki says the bikes carried over; find a source that says so per year.
First leads read 2026-11-20: Keefer 2026 450 baseline article (RM-Z450 fork 5.0 N/mm, 9 comp / 14 reb, height 3-5 mm; shock
54 N/mm, 105 mm, 1.25 / 1.5 turns; "settings haven't changed" from 2025); Ultimate Motorcycling 2027 RM-Z450 first look (KYB
fork and shock, new upper clamp, RK Excel rims, 247 lb wet). Not loaded yet.

Loaded 2026-11-20 (first public-sources pass): 165 rows, ids `rmzp-*`, from `scripts/knowledge/rmz_public_rows.py` ->
`docs/research/expansion/suzuki/rmz-public-2026-11-20.json` (hash-guarded insert, on conflict do nothing; values read back).
RM-Z450: shock spring 54 N/mm 2022-2026 (56 noted), tester baseline 2025-2026, model history, known issues (clutch, coolant
and radiator cap, shock and fork), gearing tip, measured power and weight (2023, 2025), chassis figures 2020-2023, couplers,
eight single-source maintenance values (torques, idle, tire pressure, intervals), what changed for 2027.
RM-Z250: model history 2020-2025, known issues, measured weight and power, couplers and MX-Tuner, five single-source values
(oil, coolant, plug torque, shock spring set length, fork oil range), what changed for 2027.
Still open for Suzuki: RM-Z450 2022-2024 fork compression and sag (sources disagree; only spreads for 2020-2021 on file);
2027 stock clickers, sag and springs for both bikes (none published yet); valve clearances; triple-clamp, caliper, sprocket
and linkage torques; RM-Z250 gearing; 2026 RM-Z250 carry-over statement. suzukicycles.com/motocross/2027/rm-z250 could not
be opened by the fetch tool (needs the link pasted in chat).
Second batch the same day (16 rows, ids rmzp-450-12..16): RM-Z450 2022-2024 stock positions as printed in Motocross Action
setup sheets (low confidence, conflicts stated), their 2021-2023 race setting, chain guide wear, measured power 2021, 2022, 2024.
Total loaded today: 181 rows. Live check: a 2027 RM-Z250 question now warns that earlier fork settings may not suit the 2027 parts.

## Track map, second pass (2026-11-20)
16 more places have a position and elevation (OpenStreetMap by name, Wikipedia for High Point; USGS elevation): Protective
Stadium, Garrett Coliseum, Minooka, Stony Lonesome, Prairie City (Hangtown), Mammoth, Pala, Houston Valley, Oakey Mountain,
Whissenhunt, Redbird Crest, White Sulphur, The Wick 338, Wayehutta, Wambaw, High Point. 43 of 254 still have none: mostly
closed or unknown-status tracks with no street address, plus Freestone, Florida Cracker Ranch, Moto Sandbox, Kentuck and a few
Georgia and Carolina forest trailheads that OpenStreetMap does not name. Only results whose mapped name matched were used.

## Maker kit setup notes (2026-11-20)
`shared/maker-setup-notes.ts`: setup facts read from the part maker's own document, attached to that part on the rider's build
sheet (installed_parts -> maker_setup, prompt 93). First two: Rekluse RadiusCX on KTM-group hydraulic clutches (free play gain
3 mm, adjustment, break-in, symptoms) and the WP XACT PRO 7548 fork (comfort / standard / sport clicks by model, 75-85 kg
standard springs, 40 h service). To add next, each from its own document: WP XACT PRO 8950 shock (manual text not reachable
through the fetch tool; needs the PDF link or file), Rekluse Radius X / Core EXP and the cable-clutch RadiusCX guides,
Kawasaki and Honda fitments of the WP parts.

## In progress at 2026-11-20 16:30 ET
- Yamaha rider-weight charts: the 2024 YZ450F manual has none (it prints the optional spring rates with part numbers and ID
  marks instead). A scan of all 135 Yamaha owner's service manuals in the index for a rider-weight chart is running in the
  browser pane on Kyle's computer (window.__out on library.ymcapps.net; 52 of 135 read, no hits). When it finishes with no
  hits, add a Yamaha "rider weight for springs: not printed" note to shared/maker-publishing.ts for the bikes scanned.
- Sag gaps: Husqvarna FE 450 / FE 501 owner's manuals for 2020 (art. no. 3402343en, 20_3402343_en_OM) and 2021 (3402453en,
  21_3402453_en_OM) are on the makers' document host and were read in the browser: static sag 37 mm, riding sag 110 mm, shock
  springs 39 / 42 / 45 N/mm and fork springs 4.0 / 4.2 / 4.4 N/mm for 65-75 / 75-85 / 85-95 kg riders, both years.
  Not loaded yet: the proper load is the whole manual through scripts/manual-textlayer (needs the PDFs in the workspace, so
  Kyle's OK to download them). Still to find: the 2022 FE 450 and 2021 GasGas EC 250 document numbers.

## Sag gaps closed (2026-11-20)
Husqvarna FE 450 and FE 501 2020-2022 and GasGas EC 250 2021 now have their whole owner's manual on file (1,853 verified rows:
sag 37 / 110 mm, rider-weight springs, clickers, torques, service schedule). Report: docs/research/expansion/gaps/enduro-sag-2026-11-20/REPORT.md.
No roster bike in the KTM group is left without a sag figure or a recorded reason.

## Track soil, native-soil pass (2026-11-20)
71 places that had no soil on file now carry the USDA soil survey's surface texture at their position (loam 42, clay 15,
sand 14), stored as low confidence with a note that it is the ground the track sits on, not a report of the racing surface.
Research file docs/research/tracks/usda-native-soil-2026-11.json; applied to the database directly (only where soil was
empty or unknown). 43 of 254 still have no soil: no position, an indoor venue, or a mixed map unit. Track websites were
searched for soil wording (30 sites, saved pages): none state it. Layout is still empty for the same places.

## Closed places marked in the list (Kyle, 2026-11-20)
Kyle opened four closed places in a row from the Where to Ride list. Now: a Closed badge beside the name, the row dimmed, and
closed places sorted below every open one (shared byDistance); closed places are left out of the race-day and ride-report
pickers (server). Web is live on deploy; the phone list changes with the next app build (the picker change is server-side).
Track layout is dropped as a data task (Kyle: tracks change layouts too often to keep current).

Kit guides, second batch (2026-11-20): Rekluse EXP (Radius X, Core EXP) on KTM-group DDS clutches (guide 191-6301) and on
cable clutches (guide 191-6300; Yamaha, Suzuki, Honda except the hydraulic 450 from 2021, Kawasaki before its hydraulic
years). The RadiusCX entry is now limited to the 250-501 cc DDS bikes. Not read yet: RadiusCX on cable clutches, the
hydraulic Honda / Kawasaki guides, WP XACT PRO 8950 shock (WP's site has no manual link; needs the PDF).
One more position: Apalachicola Springhill trails. 42 of 254 places still have none (9 open, 3 seasonal, 16 closed, 14 unknown).
Kit guides, third batch (2026-11-20): RadiusCX on cable clutches (guide 191-7900A: YZ450F/FX and WR450F 6 mm, the other
named bikes 3 mm; YZ250F/FX, YZ125, CRF250X, RM-Z450) and the DDS RadiusCX wear limits. Searched and not found in public:
RadiusCX guides for the hydraulic Honda CRF450R (2021+) and Kawasaki KX450/KX250, and the text of the WP XACT PRO 8950 shock
manual (only its contents page is online). Kits are done as far as public documents go.
