# Engineering pass 1 — independent baseline (2026-10-11)

Base commit: `6d1bd051fdbdc248dc8d3ec22b2c3003c7b67988`. This document records direct read-only observations, not a launch sign-off.

## Verified live infrastructure
- GitHub: `kylejveit-a11y/BAK-MX`, independent of BAK E-MOTO.
- Vercel: `bakmx` production deployment `dpl_4mhvRRoPv4rJaEWQSKg159FFbwME` was READY and referenced the base commit. READY is not an API or user-flow test.
- Supabase: `yzvrujffiktfserrgkcb` ACTIVE_HEALTHY. Public claims counts via SQL: VERIFIED 31,311; STAGED 1; CONFLICTED 1.
- Supabase security advisor: leaked-password protection disabled (WARN); six RLS-enabled tables with no policies (INFO). Confirm intentional server-only privileges before treating no-policy notices as defects.

## Source inspected
- `server/engineering.ts`: structured Ask BAK planning/retrieval/answer/validation pathway, fallback model and exact-scope filtering.
- `server/claims.ts`: exact bike, VERIFIED and non-conflicted evidence retrieval. Search RPC returns up to 12 per query, 6 queries and 60 total; full-bike pagination cap 20,000 rows/20 MB.
- `server/workshop-context.ts`: ranks exact-bike reviewed procedures using user text and history, provides at most two relevant procedures, distinguishes reviewed guides from actual rider progress.
- `shared/types.ts`, `src/App.tsx`, `README.md`, `docs/EVALUATION.md`, `docs/EVIDENCE_PIPELINE.md`, `docs/WORKSHOP_BUILD_PLAN.md`, `docs/PARTS_INVENTORY_PASS14_20260921.md`, `apps/mobile/README.md`.

## Critical distinctions
- VERIFIED is a workflow state, not proof that all 31,311 source claims have been independently rechecked against OEM originals.
- Parts pass 14 reports 71 complete model-year catalogs and 87,803 occurrences, but explicitly says no database integration occurred during that pass. Catalog completeness does not establish torque, tolerance, or procedure completeness.
- Workshop checkpoint reports 294 reviewed guides / 6,265 overlapping steps; no bike qualified as full rebuild-complete.
- Evaluation documentation specifies 30 cases / 33 turns, but explicitly reports no actual live engineering answer captures graded.
- Native Expo/React Native source exists, but physical-device, signing, store purchase and store approval gates are unverified.

## Priority verification gates (not executed in this pass)
1. Inspect `search_bike_evidence` SQL definition and EXPLAIN performance on representative exact-bike queries. Confirm only verified, unconflicted, exact-year/variant/region rows can escape.
2. Capture real authenticated Ask BAK requests, including a same-model different-year negative test, staged/conflicted exclusion, multi-turn bike-context continuity, and response citation audit. Preserve request IDs and deployed commit.
3. Trace parts/workshop research files through actual UI and API imports. Do not count repository-only inventories as user-accessible data.
4. Run `npm ci && npm run check && npm run check:mobile` on an authorized checked-out working tree, then execute physical-device tests separately. These commands have NOT been run for this audit.
5. Enable Supabase leaked-password protection after checking Auth policy and rollout impact.
6. Test actual Stripe/RevenueCat and account deletion lifecycles in sandbox before paid launch.

## Execution limitations
GitHub connector source and Supabase/Vercel metadata were inspected. Local clone was blocked by unavailable DNS/network access in the execution container. No local build, tests, authenticated live AI call, mobile binary, or production change is claimed. This baseline should be used for the next implementation pass and independently reviewed before merge.
