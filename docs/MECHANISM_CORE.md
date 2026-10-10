# BAK MX authored mechanism core

The shared runtime now supplies twelve typed causal relationships across fuel, ignition, electrical, engine, intake, cooling, lubrication, clutch, transmission, suspension, chassis and brakes. These are **LIMITED authored hypotheses**, not verified OEM claims, known bike defects or model-year support.

Each relationship connects component → physical state → causal chain → possible observations → measurement → verification support/weakening conditions. Unknowns, test prerequisites, safe initial actions, stop conditions and repair gates travel with the relationship. No torque, pressure, fluid, clearance or setting values are embedded.

`getMechanismLibrary()` returns a bounded independent copy for request context. Optional filtering accepts only the declared system taxonomy, not rider wording. It is not a canned-answer router, likelihood ranking or proof of diagnosis. All competing mechanisms remain available by default. Consumers must still distinguish rider observations from hypotheses and must verify exact component applicability.

`summarizeMechanismEvidence()` gives deterministic treatment of structured verification results. Hypothetical evidence, unverified procedures and tests outside the complaint condition remain inconclusive. Even a qualified weakening result never declares a mechanism impossible or the diagnosis complete. The caller must obtain those classifications honestly; this utility does not validate a rider's measurement or make an LLM classification reliable by itself.

## Source boundary

The authored relationships are engineering hypotheses requiring mechanic review and live evaluation. They do not count toward the verified bike specification corpus. Component-manufacturer reference pages reviewed for broad background on fuel delivery and ignition were [DENSO fuel pumps](https://www.denso-am.eu/products/ignition/fuel-pump) and [DENSO ignition coils](https://www.denso-am.eu/products/ignition/ignition-coil). These automotive component references are **not** proof of MX fitment, exact circuitry or acceptance limits. No source numbers are transferred into MX answers.

No factory manual procedures are reproduced here. Fuel-pressure, ignition, leakdown, cooling-pressure, internal clutch, brake and damper testing require qualified personnel and applicable procedures. The initial action remains engine-off documentation or inspection; dangerous reproduction riding, opening hot pressure systems and exposed ignition near fuel are excluded.

## Verification and remaining work

Unit tests verify graph completeness, all-domain coverage, bounded context, taxonomy filtering, copy isolation, uncertainty preservation and selected safety gates. Tests were authored without reading held-out evaluator cases. Passing these structural tests does not prove answer quality or establish parity with EMOTO. Remaining gates: specialist review, evidence-linked component applicability, real conversation evaluation, and correct downstream model use of the hypotheses and stop conditions.
