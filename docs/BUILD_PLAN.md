## Current parts inventory checkpoint — 21 September 2026

Paused at the user's request after finishing active batches. Parts inventory only: 57 additional exact model-year catalogs completed; 71 total, 26/60 original targets. Read docs/PARTS_INVENTORY_PASS14_20260921.md and docs/research/parts-pass14/RECOVERY.json. All remaining queues and source gaps are saved. The 467 roster slots include unverified production years; they are not 467 confirmed bikes. Catalog completion is not rebuild or launch readiness. No database calls, deployments or runtime integration this pass. Earlier sections below are historical.

Current Yamaha pass 13: 294 reviewed guides / 6,265 overlapping steps across the app; 174 guides added this pass. All ten planned Yamaha families have80 exact standard-US2020–2027 targets;77 have reviewed guidance, zero are fully rebuild-complete. Read docs/WORKSHOP_PASS13_20260914.md and docs/research/workshop-pass13/YAMAHA_PROGRESS.json for actual scope and all remaining gaps.126 root tests,12 mobile tests,both typechecks,webbuild and both native exports pass. Web bundle-size warning remains; no physical validation, database calls or deployment this pass. Earlier sections below are historical.

Current pass4:39 guides/737steps,35 Yamaha and4 Husqvarna; zero full rebuild-qualified targets. See WORKSHOP_PASS4_20260913.md. Earlier sections are historical.

Current pass 3:37 source-reviewed guides/718steps; full rebuild coverage and release qualification remain incomplete. See WORKSHOP_PASS3_20260913.md and WORKSHOP_BUILD_PLAN.md. MX14450 VERIFIED/0 STAGED/1 CONFLICTED; preserve later conflict holds. Earlier report below is historical.

Latest pass 2: 12 reviewed guides / 154 steps; 220 matching captured assembly pairs; conversation retry protection and portable workshop recovery. Read docs/WORKSHOP_PASS2_20260913.md (from repository root) and RECOVERY_STATE.json. MX remains 14,451 VERIFIED / zero STAGED. Full rebuild scope and launch qualification remain unfinished. Earlier sections are historical.

Latest workshop checkpoint: 14,451 VERIFIED / zero STAGED in MX; 13,023 published expansion records. Four bounded 2026 YZ450F guides and mobile/web Workshop are integrated. Read WORKSHOP_BUILD_PLAN.md for current scope and remaining acceptance gates. Earlier sections below are historical; items 1–3 and launch qualification remain incomplete.

Current 13 September resumed checkpoint: 14,108 VERIFIED / zero STAGED in MX; 12,680 published expansion records. Both import waves and interrupted GasGas captures are complete. Read docs/research/expansion/recovery/RESUMED_HANDOFF.md and RECOVERY_STATE.json. Earlier counts below are historical. Native-first standalone BAK MX identity retained; launch remains unqualified.

# BAK MX locked implementation baseline — 12 September 2026

Goal: paid native iPhone and Android launch next week; web is the alternate client, subject to verified gates. This date is a target, not a readiness claim. User authorizes implementation and separate infrastructure. No EMOTO production changes.

## Reuse map
Reference repository inspected: kylejveit-a11y/baktechemoto, source f0f657d194fdcd910b014201ec5f8004fd2984f4. Repository state is not proof of deployed state.

| Decision | Evidence and implementation |
|---|---|
| Reuse directly | Vite/React/TypeScript platform pattern. No production credentials or product data copied. |
| Adapt for MX | Authenticated request guard (rider endpoints require a real user, no service-token shortcut); reviewed evidence governance, exact applicability, durable conversation context, response auditing. Inspected requestAuthGuard.ts, engineeringKnowledge.ts, diagnosticSessionState.ts, diagnosticAuditEnvelope.ts, observationLogger.ts and admin trace viewer. |
| Rebuild for MX | EFI/engine reasoning prompt and evidence boundaries, gas-bike Garage, hours-based service log, separate schema, entitlements, UI. |
| Do not copy | EMOTO production keys/IDs/data, electric hardware catalog or tuning values, accumulated domain-specific routing patches, mobile product identity. |

## Delivery sequence and acceptance
1. Foundation: independent source tree, reproducible build, typed contract. Separate GitHub/Supabase/Vercel resources must be verified before deployment.
2. Rider flows: sign up/sign in/recovery, exact model-year Garage (12 families × 5 years), service logging with user/OEM interval provenance, history, setup calculators.
3. Engineering: server-owned bike context and conversation history, governed claim retrieval, model response schema and claim validation, one safe next step, refusal to invent specifications. OEM discovery is staging only.
4. Commerce: native Apple/Google subscriptions through RevenueCat, server-verified entitlement and atomic usage limits. Stripe checkout/portal serves the alternate web client. Free accounts retain owned data access.
5. Native: Expo React Native iPhone/Android client, secure sessions, purchase/restore, foreground recovery, TestFlight and Play internal testing, store metadata/privacy, review approval.
6. Operations: account export/deletion, protected health/response inspection, client receipt, evaluation export. Diagnostics are supporting scope.
7. Qualification: unit/integration tests, database/RLS tests, actual browser flow, live AI holdout review, payment lifecycle, account deletion, error recovery, backup restore, coverage disclosure.

## Locked scope
BAK product identity is mandatory: use the established BAK logotype, near-black/silver/cool-blue visual language and Chat/Garage hierarchy. See BAK_IDENTITY.md. User rejected the generic light/orange workshop design on 13 September; native and fallback clients are being corrected together.
Native iPhone and Android are PRIMARY (user clarification). Web is fallback. Direct ECU connectivity is deferred. Expo React Native shares the backend; native purchases/restore use Apple and Google store subscriptions through RevenueCat. Initial identity roster 2022–2026 Yamaha YZ250F/YZ450F, Honda CRF250R/CRF450R, Kawasaki KX250/KX450, KTM 250 SX-F/450 SX-F, Husqvarna FC 250/FC 450, GasGas MC 250F/MC 450F. Identity is not specification coverage. Unknown specs stay unknown. No OEM intervals are invented. One global reasoning system; no canned prompt answers.

## Initial baseline (superseded by BUILD_REPORT.md)
Latest execution checkpoint: causal mechanism library and runtime integration complete (qualification pending); live snapshot-binding migration and rollback smoke complete; older-US research expansion complete (review/promotion pending). Next gate is secure runtime configuration and native/store provisioning, followed by live AI/payment/device qualification. See BUILD_REPORT.md and project-state.json for current counts and blockers.

- COMPLETED: supplied handoff and initial EMOTO architecture inspection, connected resource inventory, scope and contracts.
- IN PROGRESS: application implementation and independent OEM discovery.
- BLOCKED: new Supabase project needs provider-required organization/cost confirmation; GitHub connector has no create-repository action; no local GitHub/Vercel/AI/payment credentials. Continue local implementation before requesting necessary input.
- UNVERIFIED: all product flows until execution evidence is recorded.
- EVIDENCE GAPS: model-year OEM documents/specifications, source ingestion, held-out live answers.
- RELEASE RISKS: paid launch depends on credentials, actual evidence coverage, checkout testing, support contact/legal business details, monitoring and recovery.

Never mark paid launch ready from UI or offline tests alone. Never re-run a full live model suite repeatedly to chase wording. Fix generalized failure categories with a bounded regression check and record remaining uncertainty.

## Active data completion gate — 13 September 2026

- COMPLETE:2025 KTM450SX-F US full42-group catalog enumeration;59engine/69chassis torque-table extraction and approved database publication.
- IN PROGRESS:exact torque-to-callout mapping and installation requirements;28 initial mappings accepted.
- PENDING:remaining KTM specification applicability and procedure review, then sequential remaining bike/year inventory completion.
- COMPLETE:this pass typecheck and56 automated tests; database authenticated visibility of128 KTM claims.
- UNVERIFIED:full repair readiness and every-bolt coverage; these are not implied by extracted table counts.

## Latest KTM completion gate

- COMPLETE:all1167 fullpublishedlabels; publicowner/corecatalog data pass;71 exacttorque mappings.
- COMPLETE:reviewedfield integration, sourceboundN/A and partialcoverage gates;1170newDBrecords;60tests/build;pagination deployed.
- BLOCKED:officialpaidrepairmanual acquisition/account/license and unresolvedsourceconflicts; internalWP and manufacturingdata gaps remain.
- NOT COMPLETE:everyKTMfield, entirevehicleengineeringcoverage, remainingbikequeue, paidproductqualification.
