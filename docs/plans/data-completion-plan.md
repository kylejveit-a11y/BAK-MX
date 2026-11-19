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
- [ ] Measure where the ~21 s goes; trim.
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
