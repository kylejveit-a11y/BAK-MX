# BAK MX rebuild coverage pass 3

## Executive summary

This pass extends the existing checkpoint; it does not restart research. The app now includes a continuous stock top-end route, a stock chassis strip/reassembly route and internal fork oil/seal/bushing service for the exact standard US 2026 Yamaha YZ450F. These are locally integrated, source-reviewed instructions, not physically validated workshop operations or a deployed release.

The library contains 37 guides / 718 steps across two exact bike scopes: 35 for US 2026 standard Yamaha YZ450F and the two existing US 2025 standard Husqvarna FC450 guides. Counts include overlapping standalone and composed operations. They are not 718 unique mechanical tasks or evidence of specification completeness. Complete full-engine/frame/internal-suspension targets: **zero**.

## Delivered coverage

| Operation | Scope and practical limit |
| --- | --- |
| Continuous top end: 132 steps | Assembled-bike engine removal, head/valve/cam inspection, stem-seal and measured cylinder/piston work, timing, supported pad adjustment, engine refit and final checks. Original head/caps/cams/valves/guides/seats must remain serviceable. Unsupported machining/replacement branches stop. |
| Chassis strip/reassembly: 106 steps | Engine, suspension assemblies, wheels, steering, swingarm/linkage, rear frame, cooling, wiring and other supported stock assemblies removed/refitted. Pressed steering races and bonded pads remain. Intact hydraulic/control assemblies are supported; structural frame repair is excluded. |
| Internal fork service: 53 steps | Both stock legs, both oil chambers, seals/bushings, inspection, bleeding and bike access/refit. Cartridge rod-seal overhaul and shim-stack/revalving work are excluded. |
| Engine bench modules: 16 / 153 steps | Head, cams, piston/cylinder, crankcase, crank assembly, transmission, shifting, clutch pack, primary/balancer, lubrication, generator, right cover and water pump. Each states its required starting and ending condition. Modules do not establish a complete bottom-end route. |
| Chassis/access modules: 6 / 120 steps | Engine removal/refit, clutch release, wheels, steering and swingarm/linkage. |

The original 12 guides / 154 steps remain. The continuous top-end route reuses frozen reviewed operations through exact hashes. Its in-range clearance branch skips only 13 additional adjustment steps and preserves the already performed rebuild work as performed. Skipped steps remain explicitly not performed. Required measurements remain rider-recorded; the app does not automatically validate free-text measurements as mechanically correct.

Preparation now shows tool identifiers, purpose and precision ranges, required entry/exit conditions and supplemental source attribution. Known modifications to affected assemblies exclude stock procedures. Web and native retain progress bound to bike, account, configuration and source revision. Routine steps use a simple Checked action; actual measurements and critical observations require a record.

## Evidence conflicts and remaining coverage

1. **Full Yamaha bottom end remains held before teardown.** The exact OEM clutch boss nut text/table specifies engine oil while the close-up diagram points to LT. Only claim UUID `a8317507-1cc3-5dab-a3bb-2501be6d2aef` was quarantined. A later, correctly applicable clarification is required; neither preparation was guessed. Full engine sequencing is indexed for recovery but is not an executable complete rebuild.
2. **Internal rear shock coverage remains incomplete.** The Yamaha source does not supply a complete internal shock procedure. The separately reviewed 2023 Beta 300 RR Race Edition KYB C46 bench companion was withheld after its exact-year supplement conflicted with the bench manual on oil and charging pressure. Bike extraction details also remain incomplete. `publication-hold.json` overrides historical approval and the generator enforces it.
3. Head machining, valve-guide replacement/finishing, seat cutting, crank pressing/truing and fork cartridge rod-seal work need separate reviewed procedures. The top-end path is limited to accepted original head/valve-train components and exact stock piston/cylinder fit. Inspection failures cannot be converted to completion with a note.
4. Final Yamaha temperature/idle checks require the correct configured YDT and supplied instructions. No Power Tuner substitute or invented diagnostic setup was used.
5. Remaining manufacturer/model/year targets still need full operations. Captured matching parts groups remain research leads; no torque, clearance or service procedure inherits automatically across years.

OEM, component-maker and attributed secondary sources remain acceptable. Paid KTM manuals remain on hold. No source PDFs are redistributed in this checkpoint; authored summaries preserve URLs, page locators, hashes, applicability and conflicts.

## Database and recovery

Authenticated MX readback after the exact conflict update: **14,450 VERIFIED / 0 STAGED / 1 CONFLICTED**, 14,451 total stored records. Historical expansion publication remains 13,023 records; 13,022 are currently verified after this quarantine. No other database writes occurred in this pass. No EMOTO writes occurred.

Audit: `research/engine-pass3/clutch-preparation-conflict.json`. Preserve this later conflict overlay when replaying older approved bundles. Never globally promote STAGED and never overwrite the quarantine with the older approval. Target project remains exclusively `yzvrujffiktfserrgkcb`.

Earlier recovery commits: `e0afec1` (fork integration), `dd69a9f` (exact conflict quarantine), `3462b84` (engine/chassis integration and holds). The final portable archive includes its exact final HEAD and full Git history in checkpoint metadata. No GitHub remote or push is claimed.

## Files changed and purpose

- `docs/research/engine-pass3/`: frozen engine modules, source review, full-engine held index, exact conflict audit and continuous top-end composition with immutable dependencies.
- `docs/research/frame-pass3/`: reviewed access modules and complete serviceable-stock chassis composition.
- `docs/research/suspension-pass3/`: internal fork service, historical Beta bench research and overriding conflict/publication hold.
- `scripts/build-procedure-library.ts`, `shared/procedure-library.ts`: explicit reviewed release list, source/dependency integrity, hold enforcement and generated instructions.
- `shared/procedures.ts`: entry/exit/supplemental metadata and affected-component applicability, including engine/cam/piston/valve-train aliases.
- `src/ProcedureGuide.tsx`, `apps/mobile/src/ProcedureGuide.tsx`: preparation, scope, source attribution and appropriate completion copy on both clients.
- `server/workshop-context.ts`: selected operation entry/exit and supplemental evidence in the contextual AI request. Live AI remains ungraded.
- `tests/workshop-evidence.test.ts`: source/progress recovery, stock exclusions, publication hold, frame ordering and continuous top-end branch behavior.
- Handoff, build plans, project state and recovery state: current counts, limits and next work replace stale current-status claims while preserving historical records.

## Verification

- `npm run check`: PASS root typecheck, 105 tests, production web build. Nonfatal bundle warning: main JavaScript 1,058.84 kB minified / 228.81 kB gzip; on-demand guide loading remains a mobile/web performance improvement to evaluate.
- `npm run check:mobile`: PASS native typecheck and 12 tests. Nonfatal Node module-type warnings remain.
- `npm run export` in `apps/mobile`: PASS final iOS/Android exports, 963/959 modules, 4.7 MB bundles. These are unsigned exports, not store builds.
- Source validators: PASS 16 engine modules/153 steps, 6 chassis modules/120 steps, frame composite106, top-end composite132 with9 immutable dependencies, fork/Beta historical source integrity and the later Beta publication hold. Historical artifact validity does not override its publication hold.
- Browser: new guide choices and explicit preparation/entry/exit views render; fictional transmission progress survives reload. Final top-end scope displays the retained crankcase/gearbox boundary. Details and manual QA are in `WORKSHOP_PASS3_QA.md`.
- `git -c core.whitespace=cr-at-eol diff --check`: PASS. Frozen source bytes remain hash-bound.

An initial test attempt caught an affected-engine alias omission and was fixed. The added top-end test initially used an unbounded loop against the final-step cursor; the test was corrected to iterate remaining steps once, then the full105-test check passed. No physical work was represented by these synthetic records. Passing checks verifies software and source integrity, not physical assembly or launch readiness.

## Manual QA and release blockers

Required: physical-device Garage selection, real authenticated AI/build context, sign-in/sign-out/account isolation, photo picker, interruption/restart, backup import/share-sheet recovery and mechanic execution of each supported operation. Community, Events, Profile, Messages and Feedback were not changed or qualified by this pass. Existing unrelated product lanes remain outside this mechanical coverage claim.

Apple/Android signing, device usability and store submission remain unqualified. Live AI credentials/output grading, deployment, actual subscription purchase/restore and production backend flows remain unqualified. No hard paywall or launch-readiness declaration was added. Further polish must follow real mobile/workshop use; data counts do not replace that validation.
