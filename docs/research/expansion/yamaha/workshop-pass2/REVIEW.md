# Yamaha workshop pass 2

Two bounded procedures are source-reviewed against exact US 2026 YZ450F manual D03-2819U-10 / LIT-11626-39-20. Source PDF SHA-256: `b5cbf756d688c8516251e456d4255da4ab607c8e1206e1408f254a79f74a6fbd`.

`valve-adjustment-v2.procedure.json` closes assembled-bike access, initial cold measurements, cam removal, pad selection from the actual OEM chart, pad/lifter installation, numbered cam-cap tightening, automatic-tensioner installation/release, timing verification, final measurements and reassembly. The exact source chart must remain available during selection. This is a manual chart lookup, not an invented calculator. Original pad last digits 3 and 7 are not covered by the OEM rounding table and remain unsupported. Blank chart cells and readings between displayed intervals cannot produce a guessed replacement. Repeat adjustment if final readings fail; never record successful adjustment with unresolved measurements.

`stock-tensioner-service-v1.procedure.json` closes the smaller independent stock automatic tensioner check/replacement operation. Cams, caps and shims stay installed. Initial timing and clearances must already pass. A damaged or sticking tensioner requires an exact applicable replacement; timing faults require the separate cam operation.

Newly visually reviewed PDF92-95 and216-221 include all camshaft removal/install diagrams, cam-cap order, tensioner sealing locations, shim orientation and chart axes. Existing reviewed access/closure steps are preserved with their source pages and an exact hash of the originating inspection artifact. Tools, replacement seals, lubrication conditions and diagram dependencies are embedded. The numbered cam-cap diagram and tensioner gasket positions must be visible in the runtime; their instructions cannot be flattened into generic torque facts.

These procedures do not claim complete top-end or engine rebuild coverage. Head/cylinder/piston sequences are the next review. Existing frozen facts, manifests and procedures remain untouched. No database writes or physical-bike validation are performed by this research pass.

## Second increment

`exhaust-remove-refit-v1.procedure.json` closes a third independent operation in nine steps. New visual checks of PDF206 and211-213 establish all three new joint seals, staged header-nut tightening, mounting torques and clamp locating features. The protector and silencer internals stay assembled. This operation also closes an actual future top-end prerequisite.

`topend-chain-coverage-v1.json` records visual review of all head PDF222-226 and piston/cylinder PDF235-239. It preserves the unusually important main-head-bolt remove-and-retighten procedure, different removal/install numbered orders, new seals/clips, piston orientation toward the rear exhaust, ring clocking, and dimensional measuring methods. It is explicitly incomplete for runtime: coolant, throttle-body access, upper-bracket support, head-valve overhaul and fit/locking-agent decisions remain. Individually acceptable bore and piston ranges do not guarantee an acceptable paired clearance; do not infer fit. Wear-limit ring gaps are not assembly targets.

All three complete procedures explicitly require recorded results for applicable measurements, chart selection, critical timing verification and final torque checks. Prior four versioned workshop artifacts remain untouched.
