# Engine pass3 final source checkpoint

Current reviewed package: **16 bounded procedures, 153 steps**, exact standard-US2026 YZ450F only. Source PDF SHA256 `b5cbf756d688c8516251e456d4255da4ab607c8e1206e1408f254a79f74a6fbd`. No specifications re-extracted, no frozen expansion bundle changed, no database writes by this research agent.

The current source-review manifest selects the revised crankcase-v2 and camshaft-inspection-v2; both v1 source files remain unchanged as superseded evidence. v2 closes the oil-strainer bolt torque, lower timing-chain/guide refit and the cam measurement fixture's bolt lubrication condition. Other current procedure contents are frozen. Routine actions use Checked; required measurements, condition decisions, torque settings and critical timing retain recorded observations.

## What is covered

- Transmission shaft stacks, forks/drum/bars, circlip orientation and movement check.
- Crankcase separation, bearing/seal work, oil nozzles/strainer, sealing and lower-chain restoration.
- Complete crankshaft assembly removal, dimensional inspection and installation with specified tools. This does not teach connecting-rod pin pressing or crank truing.
- Oil-pump inspection/reassembly and primary/balancer/starter-clutch assembly service.
- Generator removal/refit, shift mechanism, right-cover resealing and water-pump bearing/seal renewal with the impeller shaft retained as an intact assembly.
- Cylinder/head/piston removal and installation, actual measured piston fit, rings/pin checks and exact head-bolt sequence.
- Original-valve inspection/reseal, cam dimensional/journal inspection, cam removal and timed installation with four final cold clearance records.
- Clutch-pack renewal while leaving the conflicted clutch boss nut untouched.

`engine-chain-index-v1.json` binds actual step ranges and hashes, including the separately reviewed frame-pass3 engine-out/refit interfaces. It preserves access → interior → refit order. It is a reviewed phase index, **not a runtime executor** or a declaration that all engine work is finished. The app must compose the exact ranges, enforce their physical states, and keep omitted steps unperformed.

## Precise remaining limits

1. **Full bottom-end overhaul is held before teardown** by a real clutch boss nut preparation conflict. PDF58/258 specify oil,75Nm and staking; PDF259 depicts LT on the same nut. Root independently verified and quarantined that published claim; its root-owned `clutch-preparation-conflict.json` remains untouched. The separate held-basket artifact retains all other reviewed assembly details. Two targeted public searches did not return an exact2026 correction; old clutch generations were not inherited.
2. The head reseal guide covers serviceable original valves/guides/seats. The OEM guide replacement path uses100C head heating,5.5mm tooling, intake guide height13.5–13.9mm and exhaust12.2–12.6mm, then guide finishing and seat refacing. These are reviewed facts, but a complete seat-cutting method/angles and new-fit finishing decision are not supplied by those operation pages. A guide or valve requiring replacement routes to separately documented head work, not a false passed reseal. All valves are titanium; a lapping valve must be discarded and replaced with a different new valve; a new valve requires a new guide. A replaced head requires new valves.
3. Cylinder/piston individual standard ranges must not be used to auto-approve a pair. The actualC−piston result remains authoritative evidence alongside the separately printed clearance range. Ring gap0.55/0.85mm values are wear limits, not new-ring filing targets; rebore/replate and aftermarket ring filing remain outside this exact stock path.
4. The oil relief valve remains intact in the documented pump route. Its internal replacement/inspection sequence is not represented as completed. The water-pump route renews bearings/seals but retains or replaces the complete impeller-shaft assembly; it does not falsely claim rebuilding its internal impeller stack.
5. Correctly configured YDT with its supplied operation instructions is an equipment prerequisite for final temperature/idle commissioning. The older different-tool manual and PowerTuner display were not substituted.

Top-end composition can avoid the clutch nut completely, but its failed-inspection repair branches must remain honest. No claim of all-year, full-engine, complete-bike or launch readiness follows from these procedure counts.

## Validation

`validate_review.py`: PASS current16 procedures/153steps; hashes, exact target, source pages, printed-page metadata, record flags and local step dependencies.

`build_chain_index.py`: PASS both phase routes; referenced source hashes and exact step ranges checked. Full-engine route explicitly held before teardown.

Future changes to current procedure content require new source versions. Run `finalize_engine3.py` after any intentionally resumed generation to preserve the current supersession selection, then rebuild the chain index and validate; routine integration should read the final manifest without regenerating source.
