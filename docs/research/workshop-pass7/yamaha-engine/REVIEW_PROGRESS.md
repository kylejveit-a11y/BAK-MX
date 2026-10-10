# Exact US 2026 YZ450F engine continuation

Only this bike is active. Source: D03-2819U-10 / LIT-11626-39-20, SHA256 b5cbf756d688c8516251e456d4255da4ab607c8e1206e1408f254a79f74a6fbd. No paid source, DB writes or edits to frozen guides.

## Pressure relief

A text search across the exact manual finds the named relief valve only in the lubrication diagram, PDF205 / 5-2, item6. The existing oil-pump guide and its PDF274–275 inspection describe complete pump replacement for damage or rough rotation; they do not provide relief-valve spring/seat removal, test pressure or reassembly. This pass does not manufacture that missing branch. Exact parts identification and applicable service evidence are still required.

## Head replacement branch

Current visual review: PDF230–234. Existing original-valve reseal source remains unchanged.

- Guide replacement: head heated to100 °C in oven; 5.5mm removal/installation tools90890-04016 or YM-01122; intake guide projection13.5–13.9mm, exhaust12.2–12.6mm; reamer90890-01196 or YM-01196; actual stem-to-guide fit must be measured after finishing. Reface the seat after replacing its guide. No cutter angle, cut depth or removal allowance appears in these operation pages.
- Seat damage/pitting or excessive contact width directs head replacement on PDF231. Contact width limit1.5mm both sides is a limit, not a newly invented seat-cut target.
- PDF232 explicitly uses titanium intake and exhaust valves. A valve used for lapping must not run. New valves used to lap are then replaced by different new running valves. Preserve all compound cleaning and stem/guide contamination precautions.
- The first PDF232 TIP sentence literally reads: “When replacing the cylinder head, replace also the valves with new ones without them.” Visual inspection confirms this wording. It is not an OCR loss, and no inferred no-lapping exception is approved.
- Lifter scratches/damage require lifters AND head replacement, PDF233. New removed/replaced valve stem seals mandatory. Valve spring large pitch upward; molybdenum-disulfide oil stems/seals, engine oil pads/lifters; compressor90890-04200/YM-04019 with90890-04108/YM-04108; cotters seated with controlled light soft-hammer tap. Lifters must turn smoothly.

A specialist machining handoff can make the work order and returned-part acceptance explicit, but is not an authored seat-cutting procedure. OEM requires refacing; outsourcing is a workflow choice, not an OEM mandate. Root has been notified of the exact limitation and ambiguous new-head sentence.

## Throttle access

PDF161/165/96 visually reviewed in this pass; PDF163/166 extracted with existing diagrams. A grip-end pull/return cable disconnection/refit route can release the handlebar tether while keeping TPS, throttle-body cable ends and hydraulic units unchanged. Full cable replacement is a separate branch. Housing3.8Nm; lithium-soap grease on sliding/cable-end surfaces; final freeplay3–6mm and no idle change across steering travel. Warm idle verification uses configured exact YDT at70–80 °C and tachometer1900–2100r/min. The source asks proper idle before freeplay adjustment and proper freeplay before idle adjustment; preserve established baseline and verify both after reconnection, rather than running a bound throttle.

## Saved candidates / recovery

- `throttle-grip-cable-access-v1.procedure.json`: 13 steps. Grip-end release/refit only, assembled-bike operating checks included. Pending independent review; no runtime release claimed.
- `guides-valves-renew-bench-v1.procedure.json`: 22 steps. Original-head guide/new-valve renewal with actual new-guide bore specification PDF50 visually verified (5.500–5.512 mm both). Seat refacing is explicitly an outsourced machining operation, not an invented cutter procedure. Different sacrificial lapping and running valves required. Includes postassembly port-sealing repeat as an explicit observation adaptation. Pending independent review.
- `source-review-manifest.json` hashes current candidates and exact local source bytes; `validate_review.py` passes source/hash/target/dependency/page coverage. Frozen pass3/pass6 artifacts unchanged.

Remaining exact dependencies: whole-head/lifter replacement wording clarification (PDF232 literal incomplete sentence); seat cutter geometry/removal allowance if an in-app machining procedure is desired; pressure-relief valve service identification/procedure beyond PDF205 diagram; full throttle-body cable replacement remains separate. Head bench candidate does not itself compose bike access, cam installation/clearance adjustment or post-valve-replacement break-in. OEM PDF40 specifies approximately30minutes at half throttle or less after valve replacement, requiring correct downstream commissioning composition. No complete-bike or five-bike completion claim is made.

## Final approval freeze
Independent year_groups_research approved both guides after explicit stem-OD rejection (intake 5.445 mm / exhaust 5.435 mm), stale reuse wording removal and actual dependency-hash validation. Both source.review_status and publication_status are APPROVED. Final exact hashes are recorded in source-review-manifest.json. Validator passes 22 head steps and 13 throttle steps; outsourced machining and bench-only scope remain explicit. Earlier pending-review status above is historical.

## New continuous guide/valve repair candidate

`top-end-guide-valve-renew-v1.procedure.json` composes 142 source-bound steps: approved access/refit and clearance branch plus approved new-guide/new-valve phase. Separate manifest `top-end-source-review-manifest-v1.json` preserves the frozen two-guide approval manifest. `validate_topend_renew.py` checks every dependency SHA, phase/step coverage, branch targets and source-page closure. Candidate remains pending independent review.

The final state is an assembled, stationary-checked bike requiring controlled running break-in and maintenance afterward. PDF40 gives about30minutes at no more than half throttle for valve replacement; cylinder replacement requires aboutonehour. PDF41 requires actual follow-up oil change/foreign-material inspection, engine fit and leaks, generator mounting, chassis and controls; PDF42–43 enumerate torque-check points. These are procedural integration work still to close, not unavailable OEM values. Existing oil-change, wheel/chain, controls and frame guides can supply much of that maintenance, but no automatic completion or inference from a generic note is accepted. The fixed top-end source retains its supported OEM pad-chart limits; unsupported selections and head/cap/cam/lifter replacement remain outside this route. Full bottom-end still requires clutch-boss preparation conflict resolution before teardown.
