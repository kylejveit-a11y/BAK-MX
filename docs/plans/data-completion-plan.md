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
- [ ] Rider-weight spring charts: KTM group have them; Honda 4 bike-years detected; check Honda handbooks and Yamaha.

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
      Bikes with under 100 parts: 27 -> 14 (all GasGas EC enduro models).

## 4. Track details (221 tracks: 130 low confidence, 207 with listed gaps; 11 riding areas without soil/layout)
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
- [ ] Lighter reasoning level for the answer: on 10 test questions the first word came at 3.9 s instead of 9.3 s and the whole
      answer 5-6 s sooner; same answer type and confidence on all 10, slightly fewer cited specs, one different pick
      (14/52 vs 14/53). Not switched on. Run the 100-question set at the lighter level and grade it before deciding.
      (Switch: eval route trial.answer_effort; "minimal" and "none" are not accepted by the provider.)
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
