# Data and AI completion plan (started 2026-11-18)

Kyle's instruction: no new features; bring these to launch-ready, finished. Work the list top to bottom and keep this file current.

## 1. Sag targets and spring charts
Audit (2026-11-18, roster 898 bike-years): race sag on file for all KTM/GasGas/Husqvarna (bar a handful), Honda 2020+, Yamaha 84/166.
- [x] Kawasaki (60 bike-years): verified that no US KX owner's manual 2014-2027 prints a sag figure. Ask BAK told via
      `shared/maker-publishing.ts` (prompt 89). Nothing to load.
- [ ] (scan running: scratchpad ym/scan.py -> scan.json) Yamaha 82 bike-years without a sag row: older manuals print "sunken length ... standard figure 90-100 mm" in the Tuning chapter.
      Scan + load with path `Rear suspension setting / Choosing set length / Standard figure (sunken length, rider seated)`.
      YZ65 / YZ85: owner's manuals without service tables; check what they print.
- [ ] Honda 2010-2019 (44 bike-years): race sag is in the owner's manual; Honda's CDN refuses automated downloads (403).
      Needs the browser on Kyle's computer (ask before downloading).
- [ ] Honda / Yamaha static (free) sag: read the manuals; if not printed, add a maker-publishing note.
- [ ] Suzuki RM-Z (16): no manufacturer-published manual found online. Stays unknown unless Kyle supplies manuals.
- [ ] Small holes: Husqvarna FC 250/450 2026, TC 125/250 2014-15, KTM 125 SX 2023, Triumph TF 2027, bikes with no facts
      (GasGas EC 250 2021, Husqvarna FE 450 2020-22, KX85/KX112 2027, RM-Z 2023).
- [ ] Rider-weight spring charts: KTM group have them; Honda 4 bike-years detected; check Honda handbooks and Yamaha.

## 2. Manuals (manual_wanted: 83 HAVE / 359 WANTED)
- [x] Reconciled 2026-11-18: all 359 WANTED rows are paid factory service/repair manuals (Helm $50, Kawasaki ~$103, KTM print shop);
      the 83 HAVE are the free owner's manuals, already loaded. Nothing more can be loaded without buying. Kyle decides; shortlist
      by riders' bikes: Honda 61K9503, 61K9550, 61MKE61; Kawasaki 99830-0153-05; KTM/Husqvarna repair manuals; Triumph (no listing).

## 3. Modified bikes
- [ ] Check Ask BAK uses build-sheet values (spring rates, linkage, revalve notes) in spring_check and answers.
- [ ] Published kit data where the maker posts it (WP, Rekluse).

## 4. Track details (221 tracks: 130 low confidence, 207 with listed gaps; 11 riding areas without soil/layout)
- [ ] Raise low-confidence tracks from official pages, most-used states first (FL, GA, AL, NC, SC, TN).

## 5. Ask BAK speed and regression set
- [ ] Measure where the ~21 s goes; trim.
- [ ] Eval set from real rider questions; rerun after every prompt change.

## Log
- 2026-11-18: prompt 89 live; eval on KX450 2024 / KX250 2022 sag questions: says Kawasaki publishes none, gives preload-nut position and general guidance, no gap logged.
