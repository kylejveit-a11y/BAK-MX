# Exact 2025 YZ450F lower-engine review

Candidate: `lower-engine-bench-v1.procedure.json`, 47 ordered steps. Author and independent root review are complete; the bounded procedure is frozen APPROVED at SHA256 `47a147277f552cf86353a2277bfa5205b5d7719966c3e957cda86df0deb70e35`. The separate lower manifest preserves the already frozen top-end source manifest.

The exact D02 manual bytes are SHA256 `5005e7d8492c9482dfe44c6d752609a9a70a836f5b1dc94be3149d5d493de8ac`. Original PDF and rendered pages stay in Temp. Authored summaries and locators alone are distributed.

The route begins with a removed, cold, drained engine whose head/cylinder/piston are already off. It closes the lower engine after crankcase splitting, case-bearing replacement as needed, complete crankshaft assembly inspection/replacement, transmission inspection/replacement, oil-pump service, shift system, balancer/primary drives, starter clutch, cable clutch and side covers. The top end, engine refit and commissioning are separate required continuations.

The exact 2025 clutch instruction is coherent: PDF58 table, PDF244/245 exploded arrows and PDF252 assembly say new nut, LOCTITE, 105 N·m and staking. Oil arrows concern neighboring parts, not this nut. This does not resolve the different 2026 source conflict. Primary drive is 130 N·m with molybdenum grease; either failed primary gear requires the matched drive/driven pair.

Source diagrams/text visually reviewed: symbols7; general25; torque58; oil96/97; generator235/237–239; clutch244–254; shift255–259; primary/balancer260–263; pump264/265; cases266–272; crank273–275; transmission276–282. Exact full locator union is in the procedure and manifest.

Independent review clarified LS grease on three O-ring positions, both crank/balancer M-grease arrows, case solvent/debris drying, and matched primary-gear replacement. Chain stiffness inspection occurs before case splitting and crank selection: the required sprocket/chain set includes the complete crank assembly and later matching cams. No late chain fault is presented after case closure as though already repaired.

Remaining scope boundaries are substantive: no pressing apart/rebuilding the crank connecting-rod assembly, no water-pump/pressure-relief/starter-motor internals, no damaged case replacement/machining, and no failed retained clutch-release internal seal/bearing renewal. Those are explicit, rather than an assertion that every engine repair is covered. The complete-crank assembly replacement is a real OEM repair route but not an internal connecting-rod overhaul.

`validate_lower.py` is read-only and checks source/artifact hashes, applicability, page membership, step ordering and independent approval when requested. The explicit builder refuses to overwrite an approved artifact. A failed invocation caused by a mistyped local Python path did not alter validation results; the correct runtime subsequently passed.

Editorial follow-up only: the frozen `completeness` sentence retains the word “candidate.” Approval is governed by its explicit APPROVED statuses and hash-bound independent review. Remove that stale word at the next deliberate revision; it does not change mechanical instructions or scope. The frozen artifact remains untouched.
