# Exact US 2026 Yamaha YZ450F workshop evidence

Reviewed 13 September 2026. This continues the acquired D03 source and preserves all previously published Yamaha work and conflicts. No database writes performed in this research lane.

## Completed

- 180 engine/chassis specification facts from PDF pages 49–54 (printed 2-2 to 2-7). All six pages rendered and visually reviewed. Includes nominal dimensions versus wear limits, cold valve clearances, distinct clutch plate groups, oil-fill conditions and stock suspension settings.
- 163 joint-level tightening records from PDF pages 57–63 (printed 2-10 to 2-16): 161 scalar torques and two conditional installation sequences. Seven table pages, general conditions on PDF page 56, procedure TIPs, head-bolt order diagram and PDF page 7 symbol legend rendered and reviewed. Table row counts: 29, 32, 17, 11, 34, 34, 6.
- One bounded stock-fork baseline-reset procedure with eight original-worded steps, dependencies, prerequisites, source locators and final verification. PDF pages 114–117 (printed 3-30 to 3-33) rendered and reviewed for direction, zero reference, defaults, preload definition and production-range caveats. The procedure only covers external fork clickers. It does not establish a rider-specific optimum or complete suspension service.

The source is Yamaha's public US owner-service manual D03-2819U-10 / LIT-11626-39-20, first edition April 2025. SHA-256: `b5cbf756d688c8516251e456d4255da4ab607c8e1206e1408f254a79f74a6fbd`. Exact cover and US copyright identity were visually verified in the earlier discovery checkpoint; this pass revalidated the whole-file hash. Full PDF and rendered images remain temporary; no full manual or long manual prose is redistributed.

## Critical review findings

- Primary drive gear nut: **170 N·m for 2026**, with explicit oil removal followed by molybdenum-disulfide grease on crankshaft threads, washer contact surface and nut threads/contact surface. This is not the published 2025 130 N·m value. No cross-year inheritance is authorized.
- M10 cylinder-head bolts retain staged torque/angle tightening and one-bolt-at-a-time removal, with grease on threads, seats and both washer faces. The diagram remains a required installation dependency. M6 cylinder-head bolts are a separate fact.
- Steering lower ring nut is a seating/back-off/final sequence, not a 38 N·m final torque.
- Fork rebound baseline: 9 clicks out; compression: 12 clicks out. Both use the gently seated full-hard reference; clockwise hardens and counterclockwise softens when facing the adjuster. Both legs must match. The nominal 20-click range is subject to production variation; never force travel.
- Rear suspension preload dimensions describe spring compression from free length, not rider sag. Rear damping table defaults retain turns versus clicks.
- Fork specification-table oil quantity is not interchangeable with the tuning chapter's adjustable outer oil amount. The tuning chapter and detailed fill/bleed procedure remain unreviewed for publication in this lane.
- The PDF text extractor rendered the fuel-injector resistance glyph as `W`; visual page 51 confirms ohms. Corrected to 12.0 Ω. Filter-heading ligature artifacts and multiplication signs were normalized. Existing reviewed files were not regenerated.
- The general room-temperature/clean-dry-unless-otherwise-specified/progressive-crisscross rules on PDF page 56 are attached to every tightening fact. A blank torque remark is not independently treated as proof of dry threads. Joint-specific preparation and replacement instructions still require their detailed service sections. Table evidence approval is not full procedure approval.

## Recovery and integration

`review-manifest.json` freezes exact local file hashes and records zero published facts. `validate.py` checks the manifest, source binding, row totals, key conditional values, unique IDs and the procedure dependency graph. `extract_specs.py` and `extract_torques.py` only write new files in this directory and require the acquired source hash.

Integrate these as a new exact-ID reviewed wave, preserving the frozen earlier bundles. Do not interpret these local APPROVED records as already imported or globally promote STAGED records. Only MX project `yzvrujffiktfserrgkcb` is authorized.

## Remaining gaps

`COVERAGE.json` explicitly indexes the next engine/fork/shock/tuning sections without claiming their procedures were reviewed. Full frame teardown/rebuild, full engine rebuild, fork service, shock internals, parts-to-joint mapping and a complete exact-market parts inventory remain unfinished. Additional component-maker/tuner evidence is particularly needed for shock internals. No model-family equivalence has been established by this pass. Review means assistant source review, not Yamaha approval or physical service validation.

## Additional bounded procedure

`shock-damping-baseline.procedure.json` adds a seven-step external stock-shock damping reset using the already visually reviewed pages 115–117: rebound 10 clicks out, fast compression 1.25 turns out, slow compression 8 clicks out, each from gently seated full hard. It explicitly separates turns from clicks and does not change spring preload or claim an internal rebuild. No additional facts added to the frozen 343-fact bundle.
