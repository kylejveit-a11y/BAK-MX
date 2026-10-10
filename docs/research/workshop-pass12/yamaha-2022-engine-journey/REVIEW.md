# Exact US 2022 YZ450F engine journeys

Both composed routes passed independent root review and are frozen:

- Top end: 169 ordered steps, source SHA `f9207a0cd26f1412979f3100584a362bcc6653119dde5bae3c43660fb7f4a6a3`.
- Major engine: 214 ordered steps, source SHA `bffa50837ce4db3e3b8e5e312e82c5de38e2ede1bf1895ce02b9cdf3ae699a83`.

These compose approved exact-year operations rather than transferring later-year specifications. Both connect actual engine removal, bench service, refit and commissioning. The major route includes sound retained cases, bearing/seal service, complete crank assembly replacement, gearbox, oil pump, primary/balance drives, coil-spring clutch and starter drive. It removes the piston-protection cloth before opening cases and carries required matched timing-drive replacement into later cam acceptance. Initial major-engine fill is 0.90 L; subsequent oil/filter service is 0.65 L. Actual flow and oil-level checks remain required.

The exact oil-level check-bolt closure specification remains an external prerequisite obtained before work, with actual closure recorded after the level check. ECU mounting torque conflict is avoided by retaining the ECU and coil on the removed aircase assembly. Specialist valve-seat work, tank-interior cleaning and inaccessible repaired-part checks require actual completed work. Pressed connecting-rod rebuilding, damaged-case machining/replacement and selected retained peripheral internals remain outside scope. No physical bike validation or launch qualification is claimed.

Corrections preserve original frozen bytes:

- `lower-filter-oring-correction-v1.json` and its review manifest bind the original lower guide and corrected snapshot. Only two filter-cover O-ring instruction plurals become singular. The major guide explicitly binds original, overlay and snapshot.
- `top-end-metadata-correction-v1.json` binds the frozen 169-step source and corrects only a stale standalone prerequisite and pending-review note. Root applies this to runtime metadata without changing the saved source identity.

Read-only checks: `validate.py --approved`, `validate.py --major --approved`, and `validate_lower_correction.py` pass. The first two verify source/dependency hashes, origin instructions, forward branches, handoff ordering, first-start sequencing and preserved external records. Builders and one-time finalizers refuse frozen inputs or require the exact reviewed candidate hash. No database writes or manual-page reproductions were added.
