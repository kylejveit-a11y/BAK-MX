# Workshop implementation checkpoint — 13 September 2026

## Outcome and limits

Continued the recovered repository and completed exact-ID import recovery. Added a usable local Workshop and four bounded reviewed guides, improved Garage/chat continuity, and established component/year research groups. The user's items 1–3 remain in progress: all-bike frame/engine/suspension rebuilding and live AI qualification are not complete. Nothing in this checkpoint establishes launch readiness.

Only MX Supabase `yzvrujffiktfserrgkcb` was written. No EMOTO database writes, paid KTM manual purchase, new key creation, hosted deployment or GitHub push.

## Delivered

- Evidence: 14,451 VERIFIED, zero STAGED; 13,023 published expansion records. Latest wave contains 343 exact-ID Yamaha facts. Frozen manifests and publication readback are retained.
- Parts: 23,357 catalog occurrences, 943 assembly groups, 14 complete catalog inventories including KTM. Catalog completeness is not service specification completeness.
- Procedures: stock US 2026 YZ450F fork baseline, shock baseline, cold valve inspection, external fork removal/refit. Tools, parts, source diagrams, checks and saved progress accompany each. Full internal fork service has four unresolved requirements; engine/frame/shock rebuild sequences remain unfinished.
- Year research: 15 component groups/boundaries and 24 broader off-road family candidates. Four Yamaha 2025/2026 fastening exceptions prevent automatic inheritance. Candidates do not authorize all-year technical answers.
- Workshop: frame/engine/fork/shock/clicker journals, measured-setting comparisons, progress exports and contextual Ask BAK drafts. Journals are local and do not claim cross-device sync.
- Core flows: account/build-bound drafts, active-bike continuity, retry identities, saved returned answers, rotating native snapshots, secure-session recovery and broader owner-declared off-road identities.
- Garage/service creates now persist stable request IDs before sending; same-owner/same-input retries return one existing record, with no overwrite. Deploy the updated server before these clients. Conversation creation remains a separate interrupted-response case.
- AI: practical next-step prompt, 16 attributed reference links, exact evidence filtering, beta access mode retaining authentication/quotas, and six additional workshop evaluation cases. Live answers have not been graded.
- Runtime: fixed a browser blank-screen SDK failure. MX-only checks cover browser/native/server and privileged billing clients. VIN-specific Honda recall links appear for sourced identities.

## Main changed files

| Area | Paths | Purpose |
|---|---|---|
| Mobile | `apps/mobile/src/App.tsx`, `WorkshopScreen.tsx`, `ProcedureGuide.tsx`, `localProgress.ts`, `progressStorage.ts`, `sessionStorage.ts`, `continuity.ts`, `api.ts` | Rider flows, guide UI, recovery and context |
| Web | `src/App.tsx`, `Workshop.tsx`, `ProcedureGuide.tsx`, `client.ts`, `styles.css` | Equivalent fallback flows and working browser startup |
| Shared logic | `shared/workshop.ts`, `procedures.ts`, `bike-identity.ts`, `mx-project.ts`, `recalls.ts`, generated libraries | Exact applicability, progress validation and product isolation |
| Backend | `server/app.ts`, `validation.ts`, `engineering.ts`, `references.ts`, `ai-access.ts`, `create-record.ts`, database/billing guards | Context, evidence, access, duplicate-save prevention and MX boundary |
| Research | `docs/research/expansion/yamaha/workshop-2026/`, `docs/research/generations/` | Reviewed artifacts, source hashes, gaps and year exceptions |
| Database | `supabase/migrations/20260913190251_offroad_owner_identity.sql` | Broader owner-entered off-road year identity; no expanded evidence inference |

## Verification and manual QA

Source/hash validators passed for 343 facts and all four guides. Browser QA at 390 px covered navigation, fixture guide progression/reload, account/build isolation, storage failure recovery, clicker comparisons and question prefill. See `tests/browser/WORKSHOP_QA.md` and `docs/mobile/CORE_FLOW_QA_20260913.md` for detailed evidence and device checks. The fourth guide uses the same tested runner and additionally passes source/dependency/restore tests; it has not been physically serviced or individually browser-walked end to end.

Final checks: `npm run check` PASS (typecheck, 85 tests, web production build); mobile typecheck and 12 tests PASS; `npm --prefix apps/mobile run export` PASS for iOS and Android; `git diff --check` PASS. The first expanded evaluator run found a case-list initialization error, which was corrected and included in the passing full rerun. Real PostgreSQL tests cover duplicate creates, changed-input rejection and account isolation. No live provider capture was substituted with a test fixture.

Required manual qualification remains: real sign-in/sign-out/recovery, Garage create/edit/retry, service save/retry, live AI followups, account export/deletion, photo handling where supported, app restart and interrupted-write recovery on Apple/Android hardware. Community, events, profile/messages and feedback need their own product inventory and validation; this checkpoint does not claim those lanes were delivered.

## Remaining blockers

1. Source-backed full procedures and exact-year coverage for the requested mainstream roster. Paid KTM manuals remain on hold. Known unknowns must remain visible.
2. Separate MX AI/auth runtime configuration and actual graded conversations. The credential question remains unanswered; no secret was copied from EMOTO.
3. Physical-device and authenticated backend testing, cloud continuity requirements, and hands-on procedure usability validation.
4. Apple/Google signing, icons/store assets, legal/support, purchase lifecycle and review. EAS uses remote version numbers; an iOS build number above 103 has not been verified. Beta AI is not a claim that subscriptions are ready.

Local commits and the portable archive are recovery checkpoints, not deployments. Full final check results and the checkpoint hash are reported with delivery.
