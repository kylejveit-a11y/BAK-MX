# Suspension internal-service second pass

Second-manufacturer additions: [2025 Husqvarna FC450 US shock damping baseline](husqvarna-fc450-2025-shock-baseline.procedure.json), 5 steps; [static/rider sag inspection](husqvarna-fc450-2025-sag-inspection.procedure.json), 7 steps. Exact scope F2475Y2 is visually confirmed on manual page3. Damping pages45–48, sag pages49–50, and support/parking pages60–61 were visually reviewed. The OEM PDF was downloaded from the previously established manual URL and matches its original SHA256. These procedures do not inherit any other year, Factory Edition or FX model.

[Frozen review manifest](source-review-manifest.json) binds all three procedure file hashes, exact targets, original PDF hashes/URLs and current local PDF locations. [Validator](validate_review.py) checks source bytes, artifact bytes, scope, review status, ordered dependencies and diagram links. Positive validation passes for all3 procedures; an isolated changed-instruction copy was rejected by its frozen hash. Temporary source paths are recovery locations, not bundled runtime assets; a future host must restore matching PDFs before revalidation.

The Husqvarna fork damping pages55–57 contain contradictory clockwise-after-clockwise-stop text. No fork clicker procedure was published from that wording. The shock directions on pages45–48 explicitly say counterclockwise and are unambiguous. Sag targets remain inspection results; no guessed spring selection or adjustment tolerance is added.

Completed addition: [sealed stock shock removal/refit](shock-remove-refit-v1.procedure.json), a 15-step exact 2026 YZ450F operation with body/tank access and closure. Shock pages185/188/189/190/191 were visually reviewed; existing reviewed body/tank steps were reused. Upper mounting bolt enters from the right and lower from the left; the shock mounting nuts use 56 and53 N·m respectively, with specified molybdenum disulfide grease on the bolts. Internal pressure/fluid, spring preload and mount-seal disassembly are outside this operation. This guide is local reviewed content ready for integration review, not database publication or physical-bike QA.

Exact target: stock, standard US 2026 Yamaha YZ450F. Research only; no database or runtime edits.

The pass adds a proposed resolution for the initial bleed-stroke wording, a mechanical explanation of cartridge pressure, and an exact-submodel parts crosswalk. It does **not** supply a complete runnable internal-service guide. The unresolved threadlocker application and seal-position map remain material; the exact rod-motion explanation also needs confirmation. Existing complete external fork removal/refit remains the appropriate released boundary.

- [Gap dispositions and source locators](fork-internal-pass2.json)
- [Renewal crosswalk with unresolved locations/counts](renewal-map.json)

The original Yamaha PDF pages168 and172 were visually inspected in this pass from previously rendered local pages. Page177 text was checked against the source already visually reviewed in the first pass. Race Tech's own illustrated instructions were read as a tuner-authored explanation. Beta USA's KYB service manual was checked as an alternate component source and explicitly rejected as a Yamaha specification substitute. The dealer-hosted Yamaha fiche was treated as a parts-catalog republication, not as a tuner service procedure.

No generic KYB compatibility was inferred. No new threadlocker grade, nitrogen charge, shim setting or oil quantity was invented. No complete seal-kit purchase list is claimed. The proposed bleed instruction uses the manual's explicit stroke restriction; it is an editorial interpretation pending a second reviewer, not a newly published manufacturer correction.

Next evidence needed: exact Yamaha/KYB clarification for adjuster threadlocker and cartridge seating hand motion; an inspected US fiche diagram mapping every NEW seal and confirming seal-kit contents. The secondary explanation and crosswalk avoid repeating the first discovery pass, but do not erase those remaining evidence gaps.

Validation: both JSON files parse, source references resolve, and all four original gap IDs are represented. App tests are unnecessary for this documentation-only pass.
