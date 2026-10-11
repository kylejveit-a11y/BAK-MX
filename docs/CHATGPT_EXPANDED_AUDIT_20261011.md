# BAK MX expanded technical audit — 2026-10-11

## Scope and limitations
Independent read-only review using GitHub connector, Supabase SQL and advisor, Vercel deployment metadata. Git clone failed because execution container could not resolve github.com. No build/test suite or physical-device testing was performed; this is NOT an exhaustive line-by-line source audit or launch qualification. Source branch: chatgpt/engineering-audit-pass-20261011, base 6d1bd051.

## Verified findings
1. **Database**: 31,313 claims, including 31,311 VERIFIED, 1 STAGED, 1 CONFLICTED. Every VERIFIED record has nonempty source_url, source_locator, evidence_record; every evidence_record contains source and review keys. Metadata presence does not independently verify OEM authenticity.
2. **Verified claims by manufacturer**: Yamaha 11,572 across 59 exact scopes; Husqvarna 8,552/19; KTM 5,569/29; GasGas 4,098/11; Honda 1,249/10; Kawasaki 271/1.
3. **Distribution**: service 25,143; maintenance 2,968; suspension 1,804; component_identification 1,067; engine 95; chassis 78; lubrication 63; final_drive_gearing 24; cooling 20; engine_mechanical 13; ignition 10; electrical 8; brakes 7; transmission 5; wheels_tires 4; fuel 2. These are classification counts, not an engineering completeness score.
4. **Search**: live public.search_bike_evidence uses exact manufacturer/model/year/variant/region predicates, VERIFIED and not-conflicted gates, plainto_tsquery with OR fallback, ranked search_labeled and capped result limit (1..40). server/claims.ts independently applies exact bike scope, status, source locator and conflict checks. No authenticated live RPC or performance EXPLAIN test executed.
5. **AI**: server/engineering.ts uses planner, bounded retrieval, structured response validation, tiered claims and exact-statement specification checking. Its code cannot alone detect unsupported numbers in free-form prose or validate causal correctness; docs/EVALUATION.md explicitly states real live semantic answer grading not yet completed.
6. **Workshop**: shared/procedures.ts and server/workshop-context.ts provide exact-bike reviewed guides, configuration screening and stateful step tracking. Source documents report 294 guides / 6,265 overlapping steps, but zero bikes fully rebuild-qualified. No physical workshop verification.
7. **Parts**: docs/PARTS_INVENTORY_PASS14_20260921.md reports 71 complete model-year catalogs, 87,803 catalog occurrences in complete/partial research; live part_catalogs, parts tables each have ZERO rows. Parts research is not live inventory.
8. **User activity**: live messages count 0, ai_requests count 1. This is insufficient evidence for a working real-user conversation flow.
9. **Security**: Supabase advisor WARN: leaked password protection disabled. Six no-policy INFO notices require grants review; sampled ai_requests grants show service_role only, consistent with intentional server-only access. RLS ownership policies exist for bikes, conversations, messages and many social tables. This is not a penetration test.
10. **Deployment**: Vercel production READY dpl_4mhvRRoPv4rJaEWQSKg159FFbwME points to commit 6d1bd051. READY only proves build/deployment; not AI health, credentials or end-to-end correctness. Vercel SSO protection applies to non-custom deployment domains per project metadata.
11. **Native**: Expo/React Native source and scripts exist; signed iOS/Android binaries, actual store lifecycle, physical-device flows and live API evaluation remain unverified.

## Risk ranking
P0: Real AI engineering accuracy unqualified; source-backed spec extraction vs unsupported prose; no live answer evidence.
P0: Parts inventory research not integrated into live tables.
P1: No confirmed physical native release or store commerce tests.
P1: Compromised-password screening disabled.
P1: Sparse diagnostic domain distribution; counts cannot establish diagnosis coverage.
P2: Full local build/tests unavailable in this audit environment.
P2: Verify RLS and function EXECUTE grants comprehensively before launch.

## Recommended next execution sequence
1. Obtain an authorized checked-out working tree with working dependency install, then run npm ci, npm run check, npm run check:mobile. Record exact commit, logs, failures.
2. Execute controlled live authenticated Ask BAK tests (positive and negative exact-scope, conflict/staged exclusion, multi-turn continuity, unsupported numeric prose, error recovery), capture actual responses and human grade.
3. Import reviewed parts catalogs via migration/seed on a nonproduction Supabase branch; validate counts, identifiers, supersessions, RLS and UI queries before production promotion.
4. Perform cross-user authorization and service-only grant tests, enable leaked-password screening after rollout review.
5. Complete iPhone/Android signed test builds, payment sandbox lifecycles, privacy/account deletion and physical-device acceptance.

## Change control
This audit is documentation only. No runtime source code, production database, environment settings or deployment was changed. Do not merge this draft PR as evidence of product qualification.
