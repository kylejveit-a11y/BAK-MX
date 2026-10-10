# BAK MX coverage and continuation report

## Current bike coverage

No bike is complete across frame, full engine and internal suspension rebuilding. This pass continues c484e71 without restarting research. The locally integrated library now contains **39 guides / 737 overlapping step entries**, across two exact bike identities. The numbers count standalone and composed guides, not unique mechanical operations.

| Exact bike | Available now | Still missing |
| --- | --- | --- |
| US 2026 standard Yamaha YZ450F | 35 guides: bounded top-end route, chassis strip/reassembly, fork oil/seal/bushing service, engine bench modules and service/setup/access guides | Complete bottom-end route, internal rear shock, machining/replacement branches, exact complete catalog and remaining specifications, physical validation |
| US 2025 standard Husqvarna FC 450 | Four guides: shock damping baseline, sag inspection, new fork air-pressure baseline and new engine oil/filter service | Full engine/frame/internal suspension rebuild routes; fork damping direction clarification; physical validation |
| US 2025 standard KTM 450 SX-F | Parts/specification benchmark; no executable rebuild guides | Remaining specifications and complete rebuild routes. Paid repair-manual purchase remains on hold. |
| US 2023 Beta 300 RR Race Edition | Separate internal-shock research; held bench companion | Oil/pressure conflict and bike extraction/refit closure; other rebuild coverage |
| Other 48 non-KTM targets | Varying captured specifications and catalogs | No released walkthroughs; catalog presence is not procedure completeness |

The 52-row snapshot in `research/coverage-pass4/COVERAGE.md` / `coverage.json` covers all 50 non-KTM targets, the KTM benchmark and separate Beta. It is reproducibly bound to **c484e71**, before this pass's two new Husqvarna guides. Its per-target facts/catalog counts remain the source baseline; only the FC450 guide count increases from2 to4 here. The baseline includes 13 complete non-KTM catalog inventories plus the KTM benchmark. Zero in an expansion-bundle column does not establish that every legacy database claim is absent.

Last authenticated database readback remains **14,450 VERIFIED / 0 STAGED / 1 CONFLICTED**. This pass made no database query or write. MX-only boundary and later conflict overlays remain intact. No EMOTO changes.

## What changed

- Added a12-step exact US2025 FC450 warm-drain engine oil/filter/screen service, including closure, leak check, temperature-dependent final level and conditional top-up. Correct stock configuration and operating-temperature engine are entry conditions. Root independently reviewed the source text and oil-service diagrams, corrected the pin-wrench path wording, retained the source stationary-running limit and removed internal editorial language from the rider step.
- Added a7-step exact US2025 FC450 stock fork air-pressure baseline. Root reviewed the exact US pressure row, same-condition/five-minute requirements, unloaded fork and hand-fitted valve cap. Damping directions remain excluded because the source wording conflicts; no correction was guessed.
- Mobile now features the three large Yamaha job routes and a compact categorized selector, replacing the long list of every bench module. Web groups the same choices. An expandable exact-build coverage summary explains each system's available scope and missing routes.
- Stock-guide exclusion now recognizes explicit XACT PRO, Cone Valve, FSCS and converted descriptions in affected components. This is exclusion of mismatched stock procedures, not verified aftermarket fitment or a new aftermarket instruction.
- Recorded the user's aftermarket/OEM upgrade/tuner requirements in `AFTERMARKET_BUILD_PLAN.md`: WP6500 and other conversions, Race Tech, Cone Valve, KYB/Technical Touch, PowerParts, REP, Twisted Development, Pro Circuit, WMR and other common supported-bike upgrades.

## Evidence follow-up

The Yamaha clutch review located another OEM oil-side table but no exact applicable correction to the US diagram/text contradiction. The full-bottom-end hold remains. Sixteen search queries and nine lead dispositions are saved under `research/engine-pass4/`; do not repeat the same search as if new or promote the quarantined UUID from older approvals.

The Beta lowering-kit instructions corroborate one oil recommendation for a modified assembly, but do not resolve the stock oil/pressure conflict. Yamaha's own2026 change descriptions support a shock-internal design boundary, not inheritance from older KYB instructions. An indexed tuner table lacks confirmed component applicability and differs from other exact settings. Follow-up evidence is under `research/suspension-pass4/`; the historical publication hold is unchanged.

## User-provided Suspension fund folder

Read-only intake found41 files:20 PDFs/21 DOCX, including seven current volumes totaling389 PDF pages. These are useful educational and diagnostic candidates, especially sag repeatability, motion-ratio conventions, rider interviews and baseline/change/result/rollback records. They do not close model-specific service gaps.

The documents themselves label examples as hypothetical and their final audit as AI manuscript preparation requiring human review and citation verification. Broad bibliographies do not bind individual equations to exact references. A sampled sag force-balance equation needs review; generic plots and training datasets are not measured dyno evidence. No content was imported into runtime or VERIFIED records. All original file hashes remained unchanged. See `research/suspension-foundations-intake/INTAKE.md` for concrete page locators, versions, limitations and intake plan.

## Files and checks

Application changes: `shared/procedure-catalog.ts`, `shared/procedures.ts`, both `ProcedureGuide.tsx` clients, `scripts/build-procedure-library.ts` and generated `shared/procedure-library.ts`. Tests: `tests/procedure-catalog.test.ts`. New research: coverage-pass4, engine-pass4, suspension-pass4 and suspension-foundations-intake. Build plans, handoff and recovery state carry the accepted work forward.

- `npm run check`: PASS typecheck,107 tests and production web build. Main bundle1,079.21kB minified/233.86kB gzip; splitting guide data remains a performance follow-up.
- `npm run check:mobile`: PASS typecheck and12 tests. Nonfatal Node module-type warnings remain.
- `npm run export` in apps/mobile: PASS iOS964/Android960 modules,4.7MB bundles. Unsigned exports only.
- Both new source validators: PASS original PDF hash, approved artifact hash, exact target, ordered steps and locators. Generator verifies all released source manifests and retains Beta exclusion.
- Browser fixture: categorized guides/coverage render, modified fork loses stock fork/chassis routes, Honda receives no Yamaha guides, no console errors. Fictional local identities only; no authenticated/backend QA.
- React review: shared pure catalog logic, labeled native/web selectors, stable IDs, unchanged mechanical hashes for old guides, no additional data requests or state effects. Native visual/device verification remains open.

## Manual QA and remaining blockers

Physical mechanic validation, signed Apple/Android builds, phone usability, real Garage/AI context, authentication/account isolation, photo picker, restart and backup import/share-sheet flows remain unqualified. Community, Events, Profile, Messages and Feedback were not modified or requalified. Live AI output grading, subscription purchase/restore, production deployment and store submission remain outstanding. Passing software checks does not establish mechanical correctness or launch readiness.

The next research work is exact-applicability clarification of held joints/shocks, additional complete service/rebuild routes for other bikes, and selective external verification of educational/aftermarket candidates. No paid purchase, external tuner outreach or whole-folder ingestion was performed.

Final commit and full-history bundle identity are recorded in the portable checkpoint metadata. Earlier pass3 and c484e71 coverage artifacts remain historical recovery points.
