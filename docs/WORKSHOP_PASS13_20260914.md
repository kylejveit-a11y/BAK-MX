# Yamaha expansion pass 13 — 14 September 2026

## Result and limits

The planned Yamaha roster is ten adult off-road families and 80 exact standard-US model-years, 2020–2027. All identities are confirmed; 77 targets have reviewed runtime guidance. The exact 2027 YZ450FX, WR250F and WR450F service manuals were not recovered in this pass. Public URL failures are recorded as unsuccessful discovery, not proof that manuals do not exist.

Read [Yamaha family summary](research/workshop-pass13/YAMAHA_PROGRESS.md) and [all exact-year gaps and guide IDs](research/workshop-pass13/YAMAHA_PROGRESS.json). The generated report gives the final library count. Guides contain overlapping work and are not a completion percentage. Zero bikes are declared fully rebuild-complete or launch-ready.

YZ450F 2022–2026 retains the deepest bounded engine/frame/fork coverage. Other families gained exact-year stock suspension setup. YZ250 gained prepared-engine top-end/power-valve work; YZ250F gained prepared-engine inspection and accepted-original detached-head modules for individually reviewed years. These do not complete engine removal, lower-end repair, refitting or commissioning. Full engine/frame/internal-fork/internal-shock authoring remains substantial for the other families. Available manuals are not misrepresented as missing merely because authoring remains unfinished.

## Product changes

- `shared/garage-models.ts`, `shared/bike-identity.ts`, `src/App.tsx`, `apps/mobile/src/App.tsx`: expose all ten Yamaha presets and 2020–2027 selection in both clients, repair invalid preset years, retain custom bike identities. A selection is not verified mechanical coverage.
- `scripts/build-procedure-library.ts`, `shared/procedure-library.ts`: integrate independently approved exact-year guides with artifact/source hashes and explicit applicability. Same-named guide files require a unique exact-target manifest match. Preserve string-form required-part names instead of silently dropping them.
- `shared/procedure-catalog.ts`: keep prepared-engine modules out of featured whole-bike routes; combined fork/shock setup counts for both components. Modified hardware exclusions remain active.
- `tests/workshop-backup.test.ts`, `tests/workshop-review.test.ts`, `tests/workshop-evidence.test.ts`, `tests/procedure-catalog.test.ts`: use exact fixture identities and verify new family isolation, bench classification, part-name preservation and aftermarket exclusions.
- `docs/research/workshop-pass13/`: OEM source discovery, exact applicability, independently reviewed factual adaptations, frozen approval manifests, year matrix and unresolved gaps. Raw source PDFs are not redistributed.
- `scripts/build-yamaha-progress.ts`: reproducibly generate all 80 rows with runtime guide IDs, source URLs and explicit engine/frame/fork/shock/aftermarket/validation gaps.
- Handoff, build plans, project state and expansion recovery retain the separate BAK MX identity and exact-ID database policy.

## Source conflicts and applicability

The 2021 YZ450F piston-pin oil/diagram disagreement holds that reassembly draft outside runtime. YZ250F head-bolt oil-versus-grease disagreements exclude head mounting from the bounded inspection/detached-head work. The 2020 YZ250 bore mean-versus-maximum disagreement requires a separately resolved cylinder/piston disposition before completion. No conflicting torque, clearance or lubricant is selected by plausibility. Each artifact retains its exact limitations.

Similar source chapters were compared against each exact-year manual; a generation label does not authorize transfer. The 2027 YZ250F redesigned engine remains distinct. Cross-country X/FX and WR models do not inherit motocross engine instructions. Stock guides do not establish aftermarket fork, shock, piston or tuner compatibility.

## Verification

Final library: 294 reviewed bounded guides / 6,265 overlapping steps; 174 guides and 1,454 steps added in this pass. Yamaha accounts for290 guides; the existing four Husqvarna guides remain.

- `npm run check`: PASS — root typecheck,126 tests, web build. Web JavaScript bundle7.21MB (1.22MB gzip), performance warning retained.
- `npm run check:mobile`: PASS — mobile typecheck and12 tests.
- `npm --prefix apps/mobile run export`: PASS — iOS and Android bundles, approximately6.1MB each. These are exports, not signed app-store builds.
- Runtime generator, exact source/hash validators and CRLF-aware `git diff --check`: PASS.

Final command results are recorded in `research/workshop-pass13/RECOVERY.json` after final integration. Source validators and the runtime generator check frozen bytes and scopes. Automated checks cannot verify that a human can complete an engine rebuild or that every service specification is present.

The web build reports a large bundled library; split or load relevant guide data on demand in a future performance pass. No production deployment, signed native build, physical workshop procedure, subscription flow or live cloud-AI acceptance was performed. Supabase was neither read nor written this pass; the previous 14,450 VERIFIED / 0 STAGED / 1 CONFLICTED snapshot remains historical. Only MX project `yzvrujffiktfserrgkcb` is authorized.

## Manual QA still required

- Garage: select/save/reopen each new Yamaha family and boundary years; confirm modified-hardware exclusions and active build context.
- Workshop: walk real engine/frame/fork/shock jobs with the correct source, tools and inspected parts; test entry/exit handoffs and persistence on physical iOS/Android devices.
- AI chat: confirm active build and exact procedure applicability in live responses; preserve useful fallback behavior.
- Community, Events, Profile, Messages and Feedback: device smoke checks remain outstanding in this data pass.
- Sign-in/sign-out, photo picker and app restart persistence: real-device acceptance remains outstanding.

## Remaining product blockers

Complete the documented rebuild authoring and independent review, resolve source conflicts, recover three exact current manuals, audit specifications and aftermarket applicability, then validate real workshop and mobile rider flows. Apple submission still requires signed-device and store configuration checks. Purchases/subscription and live AI acceptance remain unverified. This pass does not qualify paid launch.
