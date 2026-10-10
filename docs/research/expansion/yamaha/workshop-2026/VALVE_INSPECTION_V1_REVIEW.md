# Valve inspection and year exceptions, version 1

This adds one **inspection-only** procedure for the exact US 2026 YZ450F/YZ450FT. It closes the normal assembled-bike access, four cold-clearance measurements, and reassembly path in 16 original-worded steps. It does not remove cams, alter timing, choose shims or promise a repaired bike after an out-of-range measurement. It is a reviewed source-based instruction set, not physical-bike validation.

## Source reviewed

Same Yamaha D03-2819U-10 / LIT-11626-39-20 PDF, SHA-256 `b5cbf756d688c8516251e456d4255da4ab607c8e1206e1408f254a79f74a6fbd`. Visually reviewed PDF pages 38, 91–92, 97, 101, 123–127, 214–216, 221 and 306–308. Earlier reviewed torque table/legend/general pages supply linked tightening values. Full PDF/screenshots remain temporary.

Coverage includes sub-seat release, seat/side-cover/shroud access, air-filter-case cover release while leaving the filter installed, proper fuel drain/connector protection and tank storage, spark-plug cleanliness, head-cover removal, timing access, measurement and the necessary reassembly closures. Body locating tabs, timing marks and gasket geometry retain direct source-page links. Those diagram references are explicit dependencies, not guessed shape instructions.

## Conditions preserved

- Measure with the engine cold at room temperature. Rotate the crankshaft counterclockwise by hand and confirm rotor TDC **and both cam marks**, not rotor TDC alone.
- Four recorded clearances: each intake 0.10–0.17 mm; each exhaust 0.15–0.22 mm. Unresolved gauge boundaries remain unresolved.
- New cover gasket and spark-plug-hole gasket, with the specified ThreeBond 1541C application; cover bolts 10 N·m and spark plug 13 N·m.
- PDF216 exposes details missing from scalar torque tables: **both service-access O-rings are new**, lubricated with lithium-soap grease; engine oil points to the access-screw threads. Timing access screw 6 N·m; crankshaft access screw 10 N·m.
- Tank front bolts 8 N·m; retaining screw 4 N·m. Ordinary side-cover/shroud bolts 7 N·m; seat bolts 13 N·m. Center covers and their distinct 9.5 N·m fasteners are not part of this access path.
- Hose reconnection requires its positive click, connector-cover lock and correct routing. Fuel-pump internals remain untouched.

## Adjustment deliberately excluded

PDF92–95 introduces cam removal, valve-lifter/shim identification, lookup charts and original-pad rounding. The published rounding table only lists terminal digits 0/1/2, 4/5/6 and 8/9; it does not state a conversion for terminal digits 3/7. No invented rounding or substitute formula is supplied. Cam installation introduces lubricant locations, tightening order and timing/tensioner checks. That complete adjustment branch remains a separate unfinished procedure.

## Four exact-year exceptions

`generation-exceptions-v1.json` compares the existing approved US 2025 source records with the independently reviewed US 2026 records:

| Joint | 2025 | 2026 |
| --- | --- | --- |
| Clutch lever pivot bolt | 3 N·m | 6 N·m |
| Clutch lever pivot nut | 7 N·m | 6 N·m |
| Primary drive gear nut | 130 N·m, moly grease | 170 N·m, specified cleaning then moly grease |
| Clutch boss nut | 105 N·m, staking and locking agent | 75 N·m, staking and engine oil |

These are explicit **do-not-inherit** decisions, not same-scope conflicts. Identical remaining table cells would not establish parts compatibility or a whole-bike generation group.

The frozen 343-fact approved bundle is unchanged. These are additional local procedure/research artifacts; no database writes or new publication count are claimed. `valve-inspection-v1.manifest.json` binds this release; `validate_valve_v1.py` verifies the dependency graph, source references, closure details, exact-year exceptions and frozen-bundle hash.
