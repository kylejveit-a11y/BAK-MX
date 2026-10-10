# Exact US 2025 YZ450F engine continuation

Source D02-2819U-10 / LIT-11626-38-16, March 2024. Current Temp bytes match SHA256 `5005e7d8492c9482dfe44c6d752609a9a70a836f5b1dc94be3149d5d493de8ac`. Original OEM PDF and rendered pages remain outside the repository.

## Candidate and actual scope

`top-end-bench-v1.procedure.json` is an independently approved 67-step bench operation. It covers top-end removal, measured cylinder/piston/ring/pin acceptance and stock renewal, head/valve inspection, optional guide renewal with new lapping and distinct running valves, actual specialist seat refacing, cam inspection, staged head installation, cam timing, pad adjustment and final cold clearance. It retains a serviceable original head/caps/lifters and lower engine. It does not claim assembled-bike access/closure or running completion. The chassis agent owns the exact 2025 engine removal/refit interfaces and fluid/startup closure.

All cited mechanical steps were independently authored from the 2025 source. Existing 2026 sequence was only a structural reference, not a source of specifications or a mass page-offset transformation. PDF pages 7,49,50,89–93,95,210–221,224–234 cited by the candidate were visually checked; actual cited subset is recorded in its source metadata. Drawings for head removal versus tightening order, cam-cap order, TDC/cam marks, piston marking/ring gaps, guide height and titanium-valve lapping restriction were inspected at readable resolution. Exact source links remain available per step.

## Differences and unresolved boundaries

- 2025 cam lobe limits are intake 38.030 mm and exhaust 34.170 mm, checked in PDF49/213. These were not inherited from 2026.
- Exact 2025 engine uses cable clutch, not 2026 hydraulic release; chassis author handles PDF205/244 and free play.
- PDF231–232 retain nominal bore 97.000–97.010 mm, piston 96.955–96.970 mm and separately stated clearance 0.010–0.045 mm. Their possible arithmetic range is not identical. Candidate requires measured actual pair acceptance, never assumes all individually conforming parts make a conforming pair or rewrites the source.
- PDF90 omits pad-number final digits 3 and 7; PDF92–93 chart cells/ranges cannot be extrapolated. Repeated real measurement is required after adjustment.
- PDF232 identifies excessive oil-rail gap but supplies no numeric oil-rail criterion here. No value is invented.
- PDF225 requires seat refacing after guide renewal but gives no cutter angles/removal allowance. Actual qualified machining is an explicitly recorded dependency; lapping steps and measurement follow it. New valves used for lapping never become running valves (PDF227).
- Damaged head/lifters, lower timing-chain repair, lubrication faults, cylinder machining and bottom-end overhaul remain outside this bench procedure. Clutch source differences will be checked on exact 2025 source rather than applying the 2026 conflict automatically.

## Integrity

The authoring build verifies source bytes before writing a candidate. `validate_review.py` only reads; it checks frozen manifest/artifact/source hashes, exact target, step/source coverage, immediate predecessor dependencies and forward branches. `--approved` additionally requires independent approval metadata. A successful validator is not mechanical or real-world validation.

## Independent review completed

The independent reviewer checked exact 2025 text and critical rendered diagrams, including shim tables, head bolt stages, cam timing/caps, titanium-valve restrictions, spring direction and piston/ring orientation. Three closure/tooling clarifications were applied before freezing: YM-01122 is a remover only, protective cloths are explicitly removed before cylinder/cam closure, and final valve-test solvent is drained and dried. No numerical substitutions were required. independent-review-v1.json records the reviewed final bytes and actual scope. The read-only validator passes with --approved; this is source review, not physical workshop testing or complete-bike certification.
