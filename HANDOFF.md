## Current map — 8 October 2026

Read docs/LAUNCH_PLAN.md first; it is the current plan and state. Everything below is history.

## Current parts inventory checkpoint — 21 September 2026

Paused at the user's request after finishing active batches. Parts inventory only: 57 additional exact model-year catalogs completed; 71 total, 26/60 original targets. Read docs/PARTS_INVENTORY_PASS14_20260921.md and docs/research/parts-pass14/RECOVERY.json. All remaining queues and source gaps are saved. The 467 roster slots include unverified production years; they are not 467 confirmed bikes. Catalog completion is not rebuild or launch readiness. No database calls, deployments or runtime integration this pass. Earlier sections below are historical.

## Yamaha pass13 recovery — 2026-09-14

Current Yamaha pass 13: 294 reviewed guides / 6,265 overlapping steps across the app; 174 guides added this pass. All ten planned Yamaha families have80 exact standard-US2020–2027 targets;77 have reviewed guidance, zero are fully rebuild-complete. Read docs/WORKSHOP_PASS13_20260914.md and docs/research/workshop-pass13/YAMAHA_PROGRESS.json for actual scope and all remaining gaps.126 root tests,12 mobile tests,both typechecks,webbuild and both native exports pass. Web bundle-size warning remains; no physical validation, database calls or deployment this pass. Earlier sections below are historical.

Continue from the exact-year gap matrix and frozen approval manifests, not a new research scaffold. The 2027 YZ450FX/WR250F/WR450F exact service manuals remain unrecovered. Full rebuild authoring remains unfinished on other targets despite source availability. Source conflicts remain explicit. Only MX yzvrujffiktfserrgkcb is authorized; never write EMOTO. Paid KTM purchases remain on hold. Recovery archive and history bundle are stored alongside the repository with a separate SHA-256 inventory.

Current pass 12: 120 reviewed guides / 4,811 overlapping steps. Exact standard-US stock YZ450F 2022–2026 coverage pass finished with documented gaps; five model-years of one model. Zero fully complete bikes; no measured percentage. 125 root tests, 12 mobile tests, both typechecks, web build and both native exports pass. Read docs/WORKSHOP_PASS12_20260913.md. Earlier counts and active targets below are historical.

Current pass 12: 116 guides / 4,243 overlapping steps, including 11 exact 2022 YZ450F guides. Frame and connected engine commissioning remain active. 122 root tests pass. Read docs/WORKSHOP_PASS12_20260913.md. Earlier pass counts below are historical.

Current pass 11 checkpoint: 105 reviewed guides / 3,931 overlapping steps. Exact standard-US YZ450F 2026, 2025, 2024 and 2023 advance with documented gaps; 2022 is active. This round covers five model-years of one model. No measured percentage or full-completion claim. 122 root tests, 12 mobile tests, both typechecks and web build pass. Read docs/WORKSHOP_PASS11_20260913.md; earlier counts below are historical.

# Current pass11 intermediate checkpoint

99 guides /3,250 overlappingsteps;2023active. Read docs/WORKSHOP_PASS11_20260913.md. Earlier pass10below remains historical.

# Current workshop continuation — pass 10

90 guides / 3,057 overlapping steps. 2024 YZ450F advances with documented gaps; 2023 is active, then 2022 to finish the five-target round. Read docs/WORKSHOP_PASS10_20260913.md and RECOVERY_STATE.json first. 119 root tests, 12 mobile tests, both typechecks and web build pass. No full-completion or launch claim. Earlier handoffs below are historical.

# BAK MX recovery handoff — 13 September 2026

## Read this first

Kyle requested this checkpoint because the conversation became too large. Stop treating prior progress messages as proof that everything was published. The import was interrupted; its database transactions and local source files survived. No background agent is active at handoff. Continue from these files, not from a new scaffold.

BAK MX is a gas motocross engineering product, primarily an iOS/Android mobile app, with a web alternative. It is NOT ready for a paid launch. Current task: bring the 50 non-KTM standard-US 2022–2026 bike targets toward the documented KTM benchmark. Do not restart UI work or purchase manuals during this data pass.

Kyle authorized parallel research and Supabase cost. He explicitly put the paid KTM manual purchase ON HOLD. Secondary sources, tuners, Keefer and forums are allowed; retain attribution and exact applicability. Plausibility is a research lead, not sufficient evidence for a critical torque, clearance or compatibility claim.

The actual KTM benchmark is ONLY 2025 KTM 450 SX-F US F8475Y5, not all KTM bikes: 42 groups, 1,167 unique catalog occurrences, 71 exact torque assignments, 691 dimensional assignments and 1,298 published evidence records. Even this bike still has 7,722 broad UNKNOWN/PARTIAL requirements. Never claim that every KTM bolt/specification was completed.

## Recovery files and environment

- Original working repo: `/workspace/scratch/0da6d91a3119/bakmx`.
- Checkpoint ZIP: `bakmx-ktm-torque-checkpoint-20260913.zip`. Despite its older filename, its updated version includes the full non-KTM expansion and this handoff.
- Persistent checkpoint identity: `libfile_255c5b1eef1c81919498a584a291293b`. Use the newest saved version, not its old version 1.
- ZIP contains the source tree and a Git history bundle. If the original workspace is gone, extract the ZIP to a fresh directory. Do not overwrite a newer checkout. Read this HANDOFF and `docs/research/expansion/RECOVERY_STATE.json` first.
- Last base commit before this expansion: `1e928e9fc79cd0acc75a8273a0ab7ab737715a8a`. The checkpoint adds a new local commit. No GitHub remote or write credentials were available in this environment; do not claim the repo was pushed to GitHub.
- Stack: Node 24, Vite/React/TypeScript, Supabase, Express-style server, Expo mobile. Read package files before installing or changing dependencies.
- Original temporary OEM PDFs are not redistributed in the archive. The facts, hashes, URLs, locators and reviews are retained. Re-download exact public documents and verify hashes only when required; do not discard prior work because a `/tmp` path is gone.

## Production boundaries

- MX Supabase: `yzvrujffiktfserrgkcb`. This is the only permitted database write target.
- EMOTO Supabase: `yxvwepgbahkdlkpedndj`. NEVER write MX data there.
- Vercel team: `team_OrmK4N40MK1G1CQP0PNuEyW0`.
- Vercel project: `prj_waIolcUpARAGAHokLCafdOKqgwjM`.
- Latest known deployment: `dpl_648o4bGa5Uo32icRYt2qyPphS58o`.
- Website: https://bakmx.vercel.app . Last web check returned 200; `/api/health` returned 503, `not_ready`, `live_dependencies_verified:false`. These are prior checks, not a new live verification at handoff.
- Runtime AI/auth/payment configuration, real authenticated AI grading, signed native builds, store purchases and launch qualification remain incomplete. This expansion did not deploy a new UI or certify those flows.

## Exact database stopping point

The last authenticated connector readback at handoff showed:

- VERIFIED: **2,353** total = prior 1,428 + first 925 new Honda/Yamaha records.
- STAGED: **3,400**, from an interrupted additional wave.
- `docs/research/expansion/published-claims.json` contains the **925** expansion records already published.
- `docs/research/expansion/approved-bundle.json` is the frozen **9,574-record wave-one bundle**, including those925. Its hash is in `RECOVERY_STATE.json`.
- The remaining wave-one delta is **8,649** records, prepared as **87 batches** of at most100.
- First34 delta batches appear committed, but DO NOT rely solely on a batch count after an interruption. Replay all87 idempotently or inspect exact IDs.
- Do not mark the entire9,574 published yet. Do not promote every STAGED database row globally.

### Finish wave one before changing its bundle

1. Read `scripts/prepare-expansion-promotion.ts` and verify the frozen bundle hash against `RECOVERY_STATE.json`.
2. Run `node --experimental-strip-types scripts/prepare-expansion-promotion.ts` from the repo. This consumes the saved approved bundle and published ledger; it does NOT require PDFs. It regenerates `/tmp/mx-expansion-0.sql` through `-86.sql` and `/tmp/mx-expansion-promote.sql`.
3. Execute staging SQL sequentially against MX Supabase only. Each batch inserts STAGED rows, uses ON CONFLICT(id) DO NOTHING, and rejects differing existing evidence. Replaying completed batches is safe. Use short groups, checkpoint progress and communicate; long orchestration cells were interrupted by the conversation.
4. Only after all batches succeed, execute the exact-ID promotion SQL. It checks all expected rows before promotion. Read back exact counts and statuses, including an authenticated-role check.
5. Expected total after wave one, assuming no unrelated changes: **11,002 VERIFIED**, zero remaining STAGED from this wave. That is prior1,428 + full9,574 expansion records.
6. Only after successful readback, update `published-claims.json` to contain all9,574 bundle claims. Save a database audit checkpoint. Do not regenerate `approved-bundle.json` before finishing this wave or otherwise freeze and track both waves explicitly.

## Data acquired in this conversation

### Honda

- All10 CRF250R/CRF450R manuals, 2022–2026: **599 approved named torque facts**;25 table pages visually checked.
- **365 approved additional specifications**;40 pages checked: engine/piston standards and wear limits, clutch limits/replacement grouping, fork/shock alternatives, cold tire pressures, rim runout.
- Exact-year differences preserved, including 2025+ axle changes and450 engine wear limits.
- Files: `expansion/honda/20xx-crf*.json`, `REVIEW.md`, `SPEC_REVIEW.md`.
- Full parts inventories remain incomplete. RevZilla and Partzilla presented explicit verification screens; no bypass. Existing2025 CRF250R catalog has61 rows. Two new mapping suggestions remain research-only because catalog scope is not yet independently confirmed.
- `KAWASAKI_MANUAL_LEADS.md` records a2022 KX250 US99803-0214 official-reader/mirror match, plus2023/24 leads. No usable PDF was obtained, so OCR values were not approved.

### Yamaha

- Nine exact US manuals: all five YZ250F years2022–2026; YZ450F2022–2025.
- **1,471 torque/procedure records:1,466 approved,5 conflicted**. All torque pages/legends reviewed. No2026 YZ450F manual found.
- Five YZ250F head-bolt lubricant disagreements remain quarantined: table grease symbol versus TIP oil wording. Do not invent a resolution.
- Separate specs files for2024 YZ250F167 and2023 YZ450F179 = **346 additional reviewed records**, not yet in the frozen wave-one bundle. Remaining seven manuals' non-torque extraction still needed.
-2024 YZ250F catalog partial:235 rows across11/45 groups, US catalog scope still pending. Raw capture retained rather than falsely promoted.
- `source-map.json` lists exact PDF paths/hashes. Do not rerun original extraction scripts blindly: some reset manual-review status.
- Root removed a newly duplicated generic grease condition from2023 YZ450F head-procedure record `yamaha-yz450f-2023-torque-004`; its existing precise grease instruction already covered this and matches the925 published batch. Do not reintroduce unnecessary evidence-ID churn.

### Husqvarna

- All10 catalogs enumerated: **11,814 occurrences**. Eight2022–2025 US-standard targets confirmed: **9,463 occurrences**. Both2026 catalogs are EU captures with US scope pending.
- Exact US catalog totals: FC2502022/23/24/25 =1189/1185/1188/1181; FC4502022/23/24/25 =1181/1178/1185/1176.
- **1,474 approved specification records:**968 torque,148 engine,272 suspension,86 service/chassis.
- **5,387 partial catalog field facts/mappings** across those8 confirmed US catalogs. Individual `*-catalog-fields.REVIEW.md` and hash-bound source captures retained.
- Conflicts: linkage manualM16/80Nm vs catalogM14; throttle clamp duplicate2.8/5Nm on some450years; pressure-pump cover thread discrepancy; malformed2025 first gear `2:28 PM`. No KTM replacement values.
- Files finalized; no acquisition process active at handoff.

### GasGas

- Eight catalogs complete in raw captures; last two interrupted:
  - MC450F2024:34 groups /987 rows captured, incomplete.
  - MC450F2026:32 groups /942 rows captured, incomplete.
- Confirmed US catalog scope currently MC250F2024, MC250F2025, MC450F2025. Other completed EU/AR captures remain pending scope; retain them without US specification inheritance.
- **769 approved torque/specification records**, plus pending/excluded records. Facts frozen before publication preparation.
- **2,003 partial catalog fields/mappings** for the three confirmed targets; **36 exact torque mappings** for2025 MC450F.
- Four stock-fork direction facts were resolved using German OEM manuals with matching exact fork part numbers. They are already in `specs-250f-2025.json` and `specs-450f-2025.json`; English error history remains documented.
- German sources: 25_3215221_de_BA.pdf SHA527ca62f3bd6de5c9324a90d30f3d53f8bb8d223449e5d93843556fa78863488;25_3215223_de_BA.pdf SHA50f0e1cd7c594882ac840e81630f3b8d5fed67e1d1e687b1c06efa1bded1300a. Exact stock forks A460C105Y406000 / A460C109Y406000.
- Root caught and agent fixed a parser bug that added engine oil whenever a joint name contained 'oil'. Lubrication now requires explicit instruction-cell evidence. Do not rerun the old parser over reviewed data.

### Kawasaki and secondary sources

-2025 KX450 US KX450MSFNN: **54/54 assemblies,867 occurrences**,49 AR quantities remain null. Previous56 retailer categories were not the OEM denominator.
- **271 partial catalog fields**:265 dimensional notations,6 spring rates. Full canonical source captures/hashes retained.
- No new Kawasaki torque facts. Official2025 reader99814-0003 was found but body did not load. Other9 catalogs remain incomplete after browser recovery failures.
- Secondary:29 records from10 sources including Keefer, MX-Tech, Race Tech and Factory Connection;16 eligible only for attributed/component-scoped reference use. None of these29 is in the generic runtime VERIFIED specification table. Claim-kind and installed-component retrieval gating still needed.
- Keefer reduced Honda torque experiments are not OEM specifications. Unit/year ambiguity remains explicit. Additional four German OEM direction records are separately documented and incorporated as above.

## Integration still outstanding

The newest raw files are ahead of normalized inventory and the frozen approved bundle. `RECOVERY_STATE.json.integration_pending` lists exact files absent from the current import manifest. At minimum:

- Four additional catalog-field bundles: GasGasMC250F2025=672; HusqvarnaFC4502022/23/24=667/668/667 (**2,674** records).
- All eight Husqvarna service-spec files (**86** records).
- Two Yamaha specs files (**346** records).
- Three finalized Husqvarna4502022–24 catalogs and completed GasGas4502023 pending-market catalog.
- At least **3,106 reviewed records** await addition after wave one, subject to reconciliation rather than blind count matching.

Current normalized snapshot is stale relative to those files:16,311 part occurrences,692 group rows,10 complete catalogs INCLUDING KTM. Regenerate after integration. No complete engineering specification coverage is claimed.

After wave one: extend `import-manifest.json` explicitly with reviewed files and exact document/capture hash-to-path bindings. For catalog fields, use fields:true and catalog:false on standalone field files; separately import actual catalogs. Bind multiple source hashes for English/German files. `prepare-expansion.ts` requires original document bytes; reacquire if missing, or retain frozen reviewed bundles while documenting unavailable source recheck. Never weaken its hash gate to make a missing PDF pass.

Run prepare-expansion, normalize-parts-research, build-parts-inventory, then publish only the new reviewed delta with the same controlled staging workflow. Update coverage and build reports. The generated progress report currently distinguishes925 published records from9,574 reviewed bundle records.

## Code changes and verification

- Added `shared/expansion-inventory.ts`: exact target namespace, explicit catalog denominator, separate manual/catalog scope, OEM-only quantities, no false completion from raw row count.
- Extended normalization to import reviewed expansion catalogs/claims, preserve KTM and larger existing captures, apply exact partial-field and torque mappings.
- Mapping gates reject pending market/unreviewed identity; torque mapping requires full matching catalog description and source-bound content. Range versus multi-stage meaning and units are retained.
- Added explicit-manifest preparation, delta publication and coverage scripts; no raw auto-promotion.
- Added tests for missing manifest/rows, manual-vs-catalog scope, cart quantities, unconfirmed identity, and GasGas head stages vs plug range. Existing KTM connector-vs-plug and same-PN/different-joint tests remain passing.
- **64 tests passed**, TypeScript passed, production build passed before handoff. No runtime UI bundle change was needed; output asset remained index-BZaZg5in.js. Later report/checkpoint edits are not a new live smoke test.
- Already deployed previous-turn pagination fix: `server/claims.ts` retrieves all verified exact-bike claims in250-row pages, projects out large audit payloads and fails on truncated/inconsistent reads. Live AI behavior over the expanded corpus is still unverified.

## Next priorities after import recovery

1. Persist/verify wave-one publication, then integrate the3,106+ reviewed pending records and finalized catalogs.
2. Resume the two partial GasGas catalogs using existing acquisition scripts and captured group IDs; do not restart all10. Public observed POST route uses ComponentGroupTemplateArticles_Read, id,partType=1,sort=SequenceNumber-asc after ordinary group page/cookie setup. Do not guess private routes or bypass challenges.
3. Finish Yamaha non-torque extraction from available manuals; find exact2026YZ450F OEM manual. Pursue lawful Kawasaki manual/catalog access and complete Honda/Yamaha parts inventories.
4. Map named torque facts to exact physical joints/occurrences; preserve thread, preparation, stages, replacement and scope conflicts. A matching diameter or part number alone is insufficient.
5. Resolve actual engine/WP service-procedure and tolerance gaps, optional component revisions and aftermarket context. Keep paidKTM purchase on hold.
6. Then return to mobile/backend launch blockers, real auth/AI/payment/native-store testing and BAK brand parity. Source record counts do not certify engineering answers or a sale-ready app.

Use parallel agents only for bounded independent tasks. Keep concise progress updates and save checkpoints regularly. Do not repeatedly ask Kyle for information obtainable from the code, connectors or public sources. Ask only for genuinely unavailable access, a necessary decision or physical test.
