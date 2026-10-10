# Internal suspension pass3 — recovery checkpoint

Exact first target: standard US2026 Yamaha YZ450F stock fork. The new operation will include oil-chamber service and outer seals/bushings, with the original valve assemblies intact. It does not include revalving or machining damaged components.

Decisions after rereading and visually inspecting OEM pages168–177:

- Initial bleed: the explicit prohibition on strokes of200 mm or greater governs the nearby approximately200 mm wording. Use short slow strokes below200 mm. This is a source-based editorial reconciliation, not a new target stroke.
- LOCTITE: global symbol legend page7 and adjuster page177 provide no product grade. Preserve the specified brand/application without inventing243/271, cure time or chemistry. An unspecified grade in this source is not itself evidence that the operation cannot be described.
- Renewal list: individual positions can be keyed to the exploded view; a complete retail kit is not required. All disturbed NEW-marked seals must be renewed at their original illustrated positions. No kit-content inference.
- Base-valve seating: retain OEM hand-pressure/load-and-release wording and exact diagram. There is no gas-charge step. No numerical rod force or pressure, unillustrated direction, or generic Race Tech oil quantity may be substituted. A known technique still requiring its OEM illustration is different from inventing a text-only motion.

Source: https://library.ymcapps.net/library/om/contents/pdf/10/D03-2819U-10_02.pdf ; SHA256 b5cbf756d688c8516251e456d4255da4ab607c8e1206e1408f254a79f74a6fbd. Local PDF retained in the user temporary folder. Earlier removal/refit closure will be reused with attribution to its completed review.

Fork completed: `fork-oil-seals-bushings-v1.procedure.json` contains53 ordered steps for both legs plus bike access/closure. Independent source review accepted the below200 restriction and requested preservation of the maximum rod-pressure qualification; that exact qualification is now present. No direction of rod motion is inferred. Separate precision0.6 N·m driver is listed. `source-review-manifest.json` and `validate_review.py` verify the original PDF, approved artifact, target, sequence and diagram links; validation passes. Physical-bike execution is not verified.

The operation services both fork oil chambers and outer seals/bushings. It does not claim to overhaul internal cartridge rod seals, revalve a shim stack or repair bent tubes. Kit contents remain outside this scope; individual matching renewals are required. Internal shock research is separate and still in progress.
