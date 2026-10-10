Current pass4:39 guides/737steps,35 Yamaha and4 Husqvarna; zero full rebuild-qualified targets. See WORKSHOP_PASS4_20260913.md. Earlier sections are historical.

Current pass 3:37 source-reviewed guides/718steps; full rebuild coverage and release qualification remain incomplete. See WORKSHOP_PASS3_20260913.md and WORKSHOP_BUILD_PLAN.md. MX14450 VERIFIED/0 STAGED/1 CONFLICTED; preserve later conflict holds. Earlier report below is historical.

Latest pass 2: 12 reviewed guides / 154 steps; 220 matching captured assembly pairs; conversation retry protection and portable workshop recovery. Read docs/WORKSHOP_PASS2_20260913.md (from repository root) and RECOVERY_STATE.json. MX remains 14,451 VERIFIED / zero STAGED. Full rebuild scope and launch qualification remain unfinished. Earlier sections are historical.

Latest workshop checkpoint: 14,451 VERIFIED / zero STAGED in MX; 13,023 published expansion records. Four bounded 2026 YZ450F guides and mobile/web Workshop are integrated. Read WORKSHOP_BUILD_PLAN.md for current scope and remaining acceptance gates. Earlier sections below are historical; items 1–3 and launch qualification remain incomplete.

Current 13 September resumed checkpoint: 14,108 VERIFIED / zero STAGED in MX; 12,680 published expansion records. Both import waves and interrupted GasGas captures are complete. Read docs/research/expansion/recovery/RESUMED_HANDOFF.md and RECOVERY_STATE.json. Earlier counts below are historical. Native-first standalone BAK MX identity retained; launch remains unqualified.

# Current recovery checkpoint — non-KTM expansion

The conversation was stopped for handoff. Read ../HANDOFF.md and research/expansion/RECOVERY_STATE.json before any import. Latest database readback:2,353 VERIFIED and3,400 STAGED. Frozen wave-one bundle:9,574 records; only925 new expansion records are published. An additional3,106 reviewed records and several finalized catalogs await integration. No background worker is active.64 tests, typecheck and build passed; product launch remains unqualified. All older sections below are historical.

---

# KTM full-field checkpoint — 13 September 2026

COMPLETED: Recovered all1167 published OEM catalog labels across42assemblies for2025 KTM450SX-F USF8475Y5.71 exact torque assignments (34engine,37chassis). Integrated691 dimensional assignments,5 material designations,10 clearance/wear assignments,18 additional keyed fields,2 service-interval assignments,1 replacement rule and376 reviewed non-threaded torqueN/A assignments. Some dimensions/material designations are partial; catalog dimensions do not establish manufacturing tolerances.103 owner non-torque facts reviewed, including bike-level facts not forced onto a part.

DATABASE:1170 newly reviewed evidence records promoted after the pagination deployment;1298 KTM VERIFIED records total,1428 acrossMX. These totals include376 explicit non-applicability conclusions, so they are not counts of torque values. Authenticated-role SQL readback confirmed1298KTM records; no staged rows expected.

CORRECTION: Removed plug torque from spark-plug connector79539090000. Full descriptions are now mandatory bindings for every torque mapping. Plug77839093000 remains correctly linked. PistonI/II identities remain distinct. SamePN A46009082000 has different torque at steeringhead versus frontaxle, supported by separate locations.

TEST RESULTS:60 automated tests pass; typecheck and production build pass. New regression gates reject stale abbreviated labels, unapprovedN/A, false completeness from partial dimensions and silent claim truncation after1000rows. Deployment dpl_648o4bGa5Uo32icRYt2qyPphS58o is READY on the existingMX project; bakmx.vercel.app returns200. /api/health returns503 not_ready with live_dependencies_verified=false. Deployment readiness is not product readiness. Preview smoke was protected/redirected and was not claimed as a successful liveflow test.

BLOCKED / EVIDENCE GAPS: Full internal engine/WP repair procedures and tolerances remain inaccessible in public sources inspected. Official3206600en digital repair manual is listed at€27.45 incl displayed10%VAT, requires account and dealer selection, and has licensing restrictions to review. No purchase or account action made. Known dimensional conflicts: shiftlever M6x15catalog versus M6x16manual; oilpump covers M5x14catalog versus M5x16manual. Mixed-function callouts must be split by physical joint before torque assignment. WP50180029/50180014 dimensions were not found. Purchasing a repair manual is not proof it publishes all manufacturing properties.

IN PROGRESS: Exact KTM repair/specification coverage remains open.7722 broad requirement checks remain UNKNOWN or PARTIAL on this bike; this is a generic per-part matrix, not7722 missing torque values. Every-field completion remains false; no otherbike was started.

UNVERIFIED / RELEASE RISKS: LiveAI qualification, signednative releases, storepurchases and fullpaidlaunch remain incomplete. Querypagination is deployed, but authenticated application retrieval and AIquality over the expanded corpus require configured runtime services and a live session. This checkpoint does not claim those flows work. See KTM_FIELD_REVIEW.md, TORQUE_GAPS.md and ktm-repair-purchase-readiness.md for traceable details.

---

# Current checkpoint — KTM torque extraction, 13 September 2026

COMPLETED: Owner manual3240045en explicitly scoped to standard US2025 KTM450SX-F F8475Y5. Visually checked all engine/chassis torque tables:59engine+69chassis=128 approved facts, now VERIFIED in separate MX Supabase. Authenticated-role readback confirmed128 KTM rows. Existing130 verified facts retained;258 total. Twenty-eight exact catalog-occurrence torque mappings persist across inventory rebuilds. Full42-group/1167-occurrence KTM catalog retained.

IN PROGRESS: Exact engine fastener location and procedure reconciliation. Other bikes remain in the sequential queue.

BLOCKED / EVIDENCE GAPS: Several catalog labels are abbreviated. Head-bolt sequence, reuse/replacement rules, generic screw functions and differing pump-cover thread treatments still require exact documentation. Public factory repair-manual preview exposes contents, not engine procedure body. Official US digital item was displayed at€27.45; no purchase made. Owner-manual torque tables are available and have been extracted, so purchase is not being requested merely to obtain those torques.

UNVERIFIED: Full torque-to-every-bolt mapping, complete installation procedures and engineering-spec coverage. Catalog alternatives and kits are not installed-piece totals. Other model years do not inherit2025 torque facts. Paid-launch readiness is not established.

TEST RESULTS: Typecheck,6 focused inventory/torque tests and the full56-test suite pass, including wrong-scope, altered-value, missing-threadlocker, staged-head-bolt and water-pump treatment checks. Database constraint correctly blocked a statement-only formatting change; the approved statement and its evidence were corrected together and read back. No UI/native build or deployment performed in this data pass.

RELEASE RISKS:128 torque table facts are not128 fully qualified repairs. Mapping checks preserve exact source and conditions; UNKNOWN fields remain open. Runtime database publication does not prove live AI response quality or app-store readiness.

---

# BAK MX build report — 12 September 2026

## Latest sequential KTM checkpoint — 13 September
Finished the standard US 2025 KTM 450 SX-F official catalog enumeration (F8475Y5): all 42 groups, 1,168 source rows and 1,167 distinct entries. All diagram-linked part numbers are accounted for; one identical WP shim duplicate is retained in the audit. Quantities, options and non-orderable references are preserved. Total normalized inventory is 1,357 rows. KTM catalog inventory is complete; part-specification coverage is incomplete. Automatic approval rejected Yamaha navigation because KTM specifications remain unfinished; no retry or other-bike inventory expansion followed. KTM remains active. See research/parts/KTM_COMPLETION.md. No database or deployment changes. Four focused inventory tests and type checking passed; the full 54-test pass belongs to the preceding checkpoint.

## Latest parts-inventory checkpoint — 13 September
Added exact-target/assembly/callout inventory and specification-gap validation. All 60 targets tracked; 237 catalog-group entries and 235 parts-table rows captured across initial manufacturer lanes. All targets remain incomplete, all normalized specification links remain UNKNOWN, and requested US scope is pending catalog reconciliation. Retailer suggested quantities are not installed counts. One Kawasaki supersession conflict is retained. Existing approved manual facts remain 130 in the database; no database or deployment mutation in this pass. Root tests 54 passing; typecheck passed. See research/parts/README.md, PARTS.md and COVERAGE.md for actual coverage and remaining work.

## Latest manual checkpoint — 13 September
Twelve complete OEM PDF bodies acquired for selected-section inspection: all ten 2022–2026 Honda competition handbooks and two exact US Yamaha owner/service manuals. One hundred new facts independently checked and promoted; live database now has 130 VERIFIED facts across 12 exact targets. Thirteen lubricant qualifiers corrected before promotion. Authenticated-role readback and ten focused evidence/coverage tests passed. Research ledger: 190 records, 60 unapproved, 34/60 targets with some research and 19/60 exact US-standard candidate coverage. No target has complete service extraction. Detailed missing sections and purchase routes: research/MANUAL_ACQUISITION_REPORT.md. App deployment, live AI qualification and native/store/payment blockers remain unchanged. This section supersedes all earlier counts below.

## Latest approval checkpoint — 13 September
User delegated evidence approval; 30 source-checked Honda facts are now VERIFIED in the live MX database (CRF250R US standard: 2022=12, 2024=12, 2025=6). Authenticated-role readback confirmed all 30. A second assistant reviewer independently inspected pages, hashes, scope and existing corpus conflicts. Corrected the overly broad rights model to distinguish reviewed factual extraction from source reproduction permission, retaining all technical gates. See research/HONDA_APPROVAL.md and the approved JSON snapshot. Fifty root tests, typecheck and production build passed. Native/Vercel deployment unchanged; actual app-to-AI retrieval remains unverified. This supersedes older zero-VERIFIED counts below.

Coverage remains thin: three of 60 targets have any approved facts, none has complete service/diagnostic coverage. Of 85 collected OEM/OEM-authored candidates, 55 remain unapproved. Thirty-three targets have no fact candidate at all in the current inventory. These are separate acquisition and qualification gaps, not a request for the user to manually approve known facts.

## Latest data checkpoint — 13 September
Current evidence inventory: 85 OEM/OEM-authored research candidates, including seven from a dealer-hosted KTM manual pending publisher corroboration; 11 aftermarket product records plus five other leads. Three Honda PDFs were downloaded temporarily, hashed and visually checked; full publications are not distributed. Thirty Honda records were normalized, source-hash/schema checked and inserted into dedicated MX database staging. Runtime VERIFIED specifications remain zero. Rider-role verification confirms STAGED records are hidden.

The reproducible 60-target ledger now identifies 27 model-year targets with any research candidate, of which 11 have at least one exact US-standard candidate. These counts do not establish complete coverage. Missing manuals, model-specific diagnostic procedures, full torque tables, suspension service data, component IDs and firmware remain acquisition priorities. The European pass found a 2025 KTM450 manual whose filename suggests Factory Edition but whose internal scope explicitly includes standard US F8475Y5; scope is taken from the publication, not filename. Compression discrepancy and aftermarket document/fitment conflicts are retained unresolved. See research/COVERAGE.md, STAGING_CHECKPOINT.md and the manufacturer reports.

Application code and Vercel deployment are unchanged in this data pass. No new native binaries, live AI qualification or payment tests are claimed. Source checkpoint includes a coverage generator and scope-isolation tests; it is independent of runtime retrieval and cannot promote research data. All 49 root tests passed, including the two new research-scope tests. No production build was rerun for these data/tooling-only changes.

## Latest checkpoint — 13 September, engineering and continuity
This section supersedes older counts below. Added and wired 12 LIMITED authored causal mechanism graphs into runtime model context (mx-engineering-3). These are hypotheses, not OEM specifications or proven diagnoses; live semantic grading and specialist review remain outstanding. Added 14 older US OEM research candidates: total 44 OEM candidates, 8 in-scope aftermarket records, zero verified runtime specifications. Root tests: 47 passing.

Applied bike-snapshot binding migration 20260913063332 to the dedicated MX database. Final answer persistence now checks locked current bike context and rejects configuration changes during generation. Live rollback-only SQL smoke passed owner isolation, privileges and snapshot rejection/success; no test records retained. Security advisor: five informational no-policy findings on deliberately service-only tables, no warning/error findings. Latest source changes are not yet deployed to Vercel; the database migration is live. Paid-launch readiness remains false. Runtime service credentials, remote repository creation, native signing/store setup and live qualification are still blocked or unverified.

## 13 September — product identity correction
User rejected the generic workshop styling. Current EMOTO source and the actual metallic BAK logo were inspected; native and web are now aligned with the established near-black/silver/cool-blue family, stronger BAK identity and Chat/Garage hierarchy. See BAK_IDENTITY.md. This is a correction to the product experience, not evidence of launch readiness. Native typecheck, three continuity tests and both exports pass after the correction; web production build passed. Live browser inspection verified the loaded BAK mark, home hierarchy, More → Setup navigation, and 13/50 → 13/52 gearing output (4.000:1; 4.00%). Native device rendering and narrow-browser viewport remain unverified. Latest READY deployment: dpl_GVDuSmAxGzS8Cx8yN35FquTpBZ32 at https://bakmx.vercel.app/. This deployment contains web/backend source; corrected native source is in the local checkpoint.

## Product decision
Native iPhone and Android are primary. Web is the alternate client. Paid launch next week remains the target; readiness is NOT established.

## COMPLETED
- Inspected EMOTO reference architecture and recorded reuse map; no EMOTO production writes.
- Independent source tree, shared TypeScript contracts and 60 exact model/year identities.
- Native React Native clients: authentication, Garage/configuration, conversations, diagnostics, maintenance logging, seven deterministic calculators, evidence display, purchase/restore, export/deletion.
- Shared authenticated backend with owner checks, SQL RLS, atomic AI request/usage/completion, response audit and exact-applicability evidence retrieval.
- Server-authoritative native entitlements and alternate web subscriptions. Integration code exists; transactions remain unverified.
- Staged evidence ingestion with hashes, applicability, review/conflict/rights gates. Independent evaluation runner with 30 cases/33 turns.
- Separate Vercel project and working web development deployment. No live provider secrets configured.

## IN PROGRESS
- OEM and aftermarket evidence acquisition now running across independent manufacturer workstreams. Candidate facts are not runtime truth.
- Live service wiring and signed native builds remain next.

## BLOCKED
- Dedicated Supabase project CREATED: `yzvrujffiktfserrgkcb`, name `bakmx`, US East, quoted $10/month. Both schema migrations applied successfully. Application runtime secrets/auth redirects are not yet wired.
- New GitHub remote: available connector cannot create repositories; bakmx does not yet exist under inspected account. Local Git source is available.
- Live AI/model, RevenueCat/store products, web Stripe product, signing/Expo and store access are not configured.

## UNVERIFIED
Signed iOS/Android binaries, physical-device UX, native deep links, production auth/email, live API-to-database flows, actual AI answers, purchases/refunds/restore/account switching, live export/deletion, backups/recovery, load/cost controls, store review and accessibility. Live SQL RLS/privilege smoke checks have passed; that does not establish end-to-end app behavior.

## EVIDENCE GAPS
Initial manifest has 14 OEM discovery entries. Additional research now contains 30 OEM candidate facts and 8 in-scope manufacturer-page aftermarket records, plus two nonqualifying aftermarket leads. A Honda OEM manual was inspected; zero full manual archives captured, zero runtime-promoted model-year specifications. See research/README.md for exact market/year limitations. Recognition of 60 identities is not engineering coverage. No technical claim is promoted merely because it was discovered. Mechanism reasoning is implemented through a structured model prompt with governed evidence; its quality has not passed live grading. Numeric specification checks do not yet comprehensively enforce all prose claims.

## TEST RESULTS
- Root TypeScript, PostgreSQL/PGlite protections, unit/evaluation contract tests and Vite production build passed (40 tests including evidence-confidence enforcement).
- Three native continuity tests pass. Native TypeScript and both platform exports pass after bike/thread/account stale-response corrections.
- Live dedicated Supabase smoke test passed: owner visibility/isolation, anonymous denial, no client billing/message/audit authority, service-only RPC permissions, RLS on all 12 tables. Synthetic test fixtures rolled back.
- Supabase security advisor reported five informational no-policy notices on deliberately service-only private tables; no error/warning findings. These retain no client grants, rather than adding permissive policies. Reference: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
- Native TypeScript and Expo SDK compatibility passed. iOS and Android Hermes exports passed (950/946 modules). These are JavaScript bundles, not native installable binaries.
- Actual deployed web Home and Setup inspected in browser. Gearing example 13/50 to 13/52 returned 4.000:1 and 4.00% change.
- Deployed API health inspection was blocked by browser/network policy; no live health success is claimed.
- History/export pagination checks pass: deterministic owner-filtered pages, explicit incomplete/oversize failures. Multi-request retrieval is not a transactional snapshot.
- No live AI semantic evaluation or paid transaction has passed.

## DEVELOPMENT DEPLOYMENT
Project: bakmx (`prj_waIolcUpARAGAHokLCafdOKqgwjM`). First ready deployment: `dpl_6diyhq35aZHKXGEV3iSYyaJdYBS5`.
URL: https://bakmx-7dz2obp1t-bak-tech-e-moto.vercel.app
Latest READY checkpoint: `dpl_G2tDjRge3fCAVJ3bgB4ZC9hcjg48`, https://bakmx-ddr34s0yt-bak-tech-e-moto.vercel.app ; current alias https://bakmx.vercel.app . Includes continuity fixes, research records, database smoke script and native source (75 uploaded files). Native source inclusion is not an installable binary or GitHub remote. Backend credentials remain unconfigured.
The deployed web is an earlier source checkpoint; the downloadable source also includes the final pagination correction and native code. Requested preview target; Vercel reported the initial deployment target as production. This is a platform designation only: the client visibly states development preview and live services are not configured. No paid launch was performed.

## RELEASE RISKS / NEXT GATES
1. Wire the created database into the runtime securely, configure auth redirects/email, create the GitHub remote and configure remaining services.
2. Run live account/Garage/AI flows and establish reviewed OEM evidence coverage; disclose unsupported capabilities.
3. Configure native products and pricing, create signed internal builds, run iPhone/Android purchase and device lifecycle tests.
4. Complete store assets, business/support/privacy details, review access and submissions. External review timing is not guaranteed.
5. Clear generalized live reasoning, security, deletion and recovery gates before accepting paid customers.

## Recommendation
Do not label this checkpoint sell-ready or open paid enrollment. Proceed to service provisioning and native internal testing, then qualify a clearly scoped launch against demonstrated evidence and store approval.
