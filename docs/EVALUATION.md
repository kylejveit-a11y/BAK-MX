# BAK MX native iPhone and Android paid-launch qualification

Launch target: native iPhone and Android apps are the primary paid product; the website is a fallback. Both native platforms must satisfy their release gates. Store approval and availability are separate from a successful build.

Status: evaluator implemented and its six contract tests pass locally. **No live engineering answers have been evaluated by this artifact. No paid-launch approval is implied.**

The suite contains 30 cases and 33 turns across all 12 initial families and model years 2022–2026. Coverage is deliberately a sample, not validation of all 60 identities or specification coverage. Cases include starting, thermal fuel faults, ignition, decompression uncertainty, valve train, cooling, lubrication, clutch, transmission, electrical, ECU applicability, suspension, gearing, chassis, maintenance, torque, variants, conflicting sources, diagnostic continuity, hypotheticals, unknowns, unsafe riding, mechanical faults versus technique, unsupported youth scope, and hostile source instructions.

The prompts and per-case rubric live in `tests/evaluation/cases.mjs`. There are no expected-answer strings or supplied OEM specifications. They were authored independently from the production reasoning implementation. Keep this directory out of runtime imports, retrieval ingestion and public assets. Developers can see these fixtures; true blind qualification also requires a reviewer to author an additional unrevealed sample after the candidate is frozen.

## Capture actual behavior

1. Freeze and record app commit, deployed backend version, native platform, bundle/package identity, app version, build number/versionCode, model and prompt version. Preserve platform/build metadata in the run ledger alongside the CLI captures. Use an isolated qualification account/database environment with no customer data.
2. Create the case bike with its exact identity. All fixtures use `standard` and `US`; prompts deliberately introduce variant conflicts when relevant.
3. Submit each case through the real authenticated `/api` conversation flow. Run each case in a fresh conversation and each subsequent turn in that same conversation. Use the normal entitlement and usage path.
4. Capture the real returned engineering response and its retrieved eligible-claim snapshot, request identifier and versions. Do not replace a poor answer with an edited answer. Capture API errors separately as failures in the run ledger; a missing response remains unverified in this CLI.
5. Record what each native client displayed against the same request identifier separately; an API response alone does not prove display, completion or continuity after backgrounding, suspension, force-close or network recovery. Run the full engineering suite on the shared backend once per frozen candidate and a fixed representative native UI subset on both platforms; only repeat semantic runs for a concrete platform-specific context discrepancy.
6. Have a qualified reviewer inspect the answer, source documents, applicability and prior turns. For the gearing case, compare the result to the deterministic calculator. A grader model may assist, but its judgment requires external review before use as `externally-reviewed`.

Input JSON contract:

```json
{
  "schema_version": 1,
  "captures": [
    {
      "case_id": "mx-001",
      "turn_index": 0,
      "prompt": "Exact case turn text",
      "origin": "live-api",
      "request_id": "Actual request ID",
      "captured_at": "2026-09-12T00:00:00Z",
      "app_version": "Actual deployed commit",
      "prompt_version": "Actual prompt version",
      "model": "Actual model identifier",
      "bike": {"manufacturer":"Yamaha","model":"YZ250F","model_year":2022,"variant":"standard","region":"US"},
      "response": {},
      "eligible_claims": [],
      "grades": {
        "reasoning": {
          "verdict":"PASS",
          "reviewer":"Named reviewer",
          "method":"human",
          "reviewed_at":"2026-09-12T01:00:00Z",
          "rationale":"Specific observed reasoning and evidence supporting this grade"
        }
      }
    }
  ]
}
```

This is a format illustration, not a passing capture. `response` must be the actual `EngineeringResponse` in `shared/types.ts`. `eligible_claims` must contain the actual `Claim` objects retrieved by the server. Grade all five rubric IDs (`reasoning`, `evidence`, `next_step`, `continuity`, `case_specific`) per turn. A missing grade remains UNVERIFIED. A reviewer may describe a criterion as not applicable in the rationale, but must explain why the response satisfies that criterion in context. Never fabricate request/version metadata to complete a capture.

Run:

```sh
node --test tests/evaluation/evaluate.test.mjs
node tests/evaluation/evaluate.mjs /absolute/path/captures.json /absolute/path/report.json
```

The CLI uses no network or paid model calls. Exit codes: 0 means every turn has supplied reviewed passing grades and required capture fields with no deterministic failure; 1 means invalid input or failure; 2 means incomplete/unverified coverage. `REVIEWED_PASS` reports supplied reviewer attestations. It is not an independent proof of semantic correctness, provenance authenticity or launch readiness.

Deterministic checks cover response shape, exact case/bike identity, duplicate/missing captures, claim existence, exact claim year/variant/region, governed status, conflicts, source locators and specification claim references. They cannot establish that a cited source actually says what the answer asserts, that a numeric value matches its source, that a procedure is safe, or that an instruction hidden in source content was ignored. Those checks belong in semantic review. A stored timestamp/request identifier is auditable metadata, not cryptographic proof of live execution.

## Bounded correction process

Run the frozen candidate once. Group failures by mechanism or infrastructure category. Investigate the shared cause, patch that cause, then run affected category tests and a fixed cross-category sentinel set. Run one final full qualification after integration. Stop additional paid runs unless an unresolved concrete risk or required release gate justifies them. Never patch exact prompt wording, relax a rubric to pass a candidate, or reuse failed questions as the only proof of generalization. Record why a prior gate missed a failure and add a separately authored family that exercises the missing condition. Preserve all failed captures and versions.

## Paid launch checklist

Each item needs dated execution evidence, environment, deployed commit and owner. Untested is UNVERIFIED; known missing capability is BLOCKED. The next-week launch date is a target.

| Gate | Required evidence | Current state |
|---|---|---|
| Independent deployment | Separate repository, database and hosting identifiers; deployed commit and successful health checks | UNVERIFIED |
| Authentication and isolation | Sign-up, recovery, sign-out, cross-user read/write denial and admin access tests on actual database | UNVERIFIED |
| Garage and maintenance | Exact identity persistence, edit/reload, null preservation, service history, interval provenance and account ownership | UNVERIFIED |
| Engineering retrieval | Positive exact-identity retrieval; wrong year/variant/region exclusion; staged/conflicted exclusion; source traceability | UNVERIFIED |
| Answer qualification | All 33 turns reviewed with no unresolved safety/specification faults, plus independent blind sample | UNVERIFIED |
| Conversation and display | Follow-up state retained, request-to-display match, reconnect/refresh recovery and partial/failure handling | UNVERIFIED |
| Native store commerce | Apple and Google sandbox purchases through RevenueCat; restore after reinstall, pending/cancelled purchase, renewal, billing retry, expiration, refund/revocation and account switching; authenticated webhook and authoritative server entitlement | UNVERIFIED |
| Store subscription lifecycle | Cancellation preserves access only for the entitled period; expiration/revocation removes paid access; duplicates, delayed and out-of-order notifications do not corrupt access; store management links open correctly | UNVERIFIED |
| Website fallback commerce | Separate checkout/portal smoke test, shared account identity, source-aware entitlement and prevention of misleading duplicate subscription offers | UNVERIFIED |
| Production payment configuration | Approved price and terms, live account configuration and authorized controlled transaction | UNVERIFIED |
| Privacy and account lifecycle | Export, delete, ownership controls, retention and protected diagnostic access verified | UNVERIFIED |
| Reliability | Rate limit/concurrency tests, upstream failure behavior, backup and demonstrated restoration, rollback | UNVERIFIED |
| Coverage disclosure | Each marketed model-year capability mapped to actual reviewed evidence; identity-only support clearly labeled | UNVERIFIED |
| Customer readiness | Business/support contact, approved terms/privacy/cancellation wording, support and incident procedure | UNVERIFIED |
| Native auth/session | Cold launch, email verification/recovery deep link, background/foreground token refresh, expired session, sign-out/account switching and revoked credentials on iPhone and Android | UNVERIFIED |
| Native secure storage | Session credentials protected by platform secure storage; no secrets in logs/build; owned drafts and cached state cleared or isolated across accounts | UNVERIFIED |
| Draft and response recovery | Unsent prompt survives normal background/relaunch; interrupted request recovers persisted answer without duplicate model charges; offline and process death states are honest | UNVERIFIED |
| Native version identity | Binary bundle/package ID, version/build, backend environment and any OTA runtime/update identity captured and matched to release artifact | UNVERIFIED |
| Distribution candidates | Actual signed iOS build available in TestFlight and Android build in Play internal testing; clean install and upgrade from distributed artifacts | UNVERIFIED |
| Physical devices | iPhone and Android sign-in → bike → store paid access → Ask/Diagnose/Setup → history/service → restore/manage/delete smoke flows; keyboard, safe areas, scrolling and accessibility checks | UNVERIFIED |
| Native deletion | Discoverable in-app deletion, active subscription explanation, immediate deletion option, token/cache cleanup and no webhook account resurrection; Google web deletion path works without app reinstall | UNVERIFIED |
| Store submissions | App Store/Play records, paid products, review access, metadata, privacy disclosures and approval status verified separately per platform | UNVERIFIED |
| Website fallback | Actual browser account, Garage, conversation and maintenance smoke flow with capability disclosure | UNVERIFIED |

A local build, six evaluator tests or a completed visual interface does not satisfy any live gate above. If evidence coverage is limited, sell only the substantiated capability with clear disclosure; do not imply complete OEM service-manual coverage.

Native submission inputs and the four official policy references are recorded in `docs/MOBILE_RELEASE.md`. The evaluation cases remain unchanged.
