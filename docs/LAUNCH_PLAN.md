# BAK MX launch plan — current map (8 October 2026)

This file is the current plan. Dated checkpoint files in `docs/` are history.

## Decisions (Kyle, 8 October 2026)
- Scope: last ten model years of motocross bikes — minis (50/65/85), 125/250 two-strokes, 250F/350F/450F — KTM, Husqvarna, GasGas, Yamaha, Honda, Kawasaki, Suzuki, Triumph, Beta and smaller brands. Every bike shows its coverage level.
- BAK MX is its own product: separate accounts, subscription, Supabase project (`yzvrujffiktfserrgkcb`), repo and app identity. Nothing in BAK EMOTO is edited, ever.
- Sources: OEM owner's and service manuals first; full parts inventories from exploded diagrams (OEM parts finders, MotoSport). Facts are stored with citation; source documents are not redistributed.
- Feature parity target with EMOTO: Ask BAK, Garage, Community, Events, Profile, Messages, Feedback.

## Verified state on 8 October (end of day)
- Root: typecheck passes, 147/147 tests pass. Mobile: typecheck passes, 12/12 tests pass, iOS and Android JavaScript bundles export. Web production build passes. Checked on a clean install under Node 22.
- Web pages were rendered at desktop and phone size against a stubbed API and reviewed by eye. No real service, sign-in, purchase, model call or device was exercised.
- Database: 14,451 claims (14,450 verified), 35 bike-years, 2022–2026. See `TUNING_COVERAGE.md` for what riders can and cannot get per bike.
- Local, not in the database: 71 complete exact-year parts catalogs (80,465 entries), 294 reviewed workshop guides.
- No users, no runtime credentials, no signed native build.

## Built on 8 October
- **Ask BAK retrieval.** The model names the published facts it needs; the database returns matching evidence for the exact bike; the answer may cite only that. Replaces sending up to 320,000 characters per question. (`search_bike_evidence`, prompt `mx-engineering-7`.)
- **Answer kinds.** `answer`, `setup` or `diagnosis`. A healthy-bike question is no longer forced through hypotheses and a next step. Setup answers give ordered, relative, one-at-a-time changes.
- **Setup knowledge.** `shared/setup-knowledge.ts`: what each adjuster does and rider-language symptom guides, direction only, no numbers (enforced by test). Supplied to Ask BAK and shown as a Setup guide. Authored by the build agent — **Kyle to review**.
- **Setup log.** Per-bike entries with track, conditions, settings, change, result and notes; differences from the previous entry are shown; "Ask BAK about this".
- **Community, Events, Messages, Profile, Feedback.** Database with row-level security (profile before publishing, two-way blocks, private threads), API, web and mobile screens, report and block on every piece of rider content. Text only; photos are not built.
- **Community safety.** Rules accepted before a profile exists; a first-pass text screen on posts, comments, events, messages and profiles; an admin report queue (web, Account page) that removes content or dismisses a report and logs each action.
- **Answer key.** Format and twelve starter questions in `docs/answer-key/`; the required content of each answer is left for Kyle.
- **Parts catalog.** Tables, API, browse screens and a loader (`scripts/load-parts-catalogs.ts`, dry-run verified on all 71 catalogs). Not loaded: it needs the service key.
- **Specs.** Search this bike's verified values without the AI; grouped browsing; ambiguous settings labeled by their reviewed property.
- **Garage.** Picker generated from the reviewed roster (55 families, 346 confirmed model-years); one build-profile definition for web and mobile; a readiness card showing what is recorded and what BAK has for the exact bike; first-run steps.

## Changed on 9 October after reviewing the BAK EMOTO audit and its `bak-answer-v2` candidate
Read-only review of `BAK REPO 2026-10-09` (commit 57db290) and the other session's findings. Nothing in EMOTO was edited. What carried over to MX:
- **Confidence tiers replace "no source, not said".** Kyle's rule: reason like an engineer and label how solid each claim is. Every claim now carries a tier — Published, Your build, Engineering estimate, General guidance, Rider and tuner experience, Not on file. Published must cite retrieved evidence and quote it exactly; general guidance is allowed when labelled and may never be presented as this bike's published value. Riders see the tiers under "How sure is this". (Prompt `mx-engineering-8`.)
- **Answer first, one question at most, never re-ask what is saved.** Setup changes are written "from X to Y clicks out" when the current position is saved.
- **A failed stage no longer costs the rider an answer.** Lookup planning falls back to the rider's own words; a provider failure retries on a backup model (`OPENAI_BACKUP_MODEL`); a reply that breaks a rule gets one repair attempt before an honest error. A smaller model can do the planning step (`OPENAI_PLAN_MODEL`).
- **Data gaps are logged** to `data_gaps` per exact bike, so data work follows what riders actually ask.
- Lessons already matched by the MX design: answers read the database directly, one straight path instead of routes and pattern rules, Garage is not behind the paywall, a fixed answer key instead of new questions each run.

Not carried over, deliberately: v2's hard-coded test-key bypass, its unmetered access (MX keeps the daily allowance and entitlement check), and keyword rules for part categories (MX parts come from OEM catalogs with their own assemblies).

## Known gaps in what was built
- Photos on posts and builds (needs storage rules and a native image picker).
- Push notifications for messages and events.
- The report queue is web only, and messages or profiles cannot be hidden from it yet.
- Tab-bar icons on mobile are still text dots (needs an icon package in the native build).
- Workshop guides load on demand on the web (main bundle 343 KB); the native bundle still carries the whole library (6.2 MB).
- Suzuki, Triumph, Beta, minis and pre-2020 years are not in the roster yet.

## Order of work
1. **Tuning data** — stock clickers, sag, spring-rate-by-rider-weight, fork height, tire pressure, gearing, jetting/EFI map options, valve clearance and service intervals for the 35 bike-years already started. This is the product's core and the largest gap.
2. **Parts catalog in the database** — tables for catalog, assembly, part occurrence; a loader that reads the saved inventories with a service key; exploded-view browsing in Garage; part lookup for Ask BAK.
3. **Answer shape** — a healthy setup or education question must not be forced into hypotheses and a next step; add setup and reference answer kinds on web and mobile.
4. **Setup log** — per-track, per-conditions suspension and engine settings with results: the tuning notebook.
5. **Answer key** — 150–200 real rider questions with required content, written by Kyle; the same set is scored every time.
6. **Community, Events, Profile, Messages, Feedback** — with report and block from day one (App Store requirement for user content).
7. **Widen coverage** to the ten-year roster: two-strokes, minis, 350s, Suzuki, Triumph, Beta.
8. **Release** — live configuration, TestFlight, store review.

## Needed from Kyle (cannot be done by an agent)
- OpenAI API key and model choice, set in Vercel for the MX project only.
- Supabase runtime keys set in Vercel; auth redirect URLs and email delivery.
- A GitHub repository for BAK MX (this repo has no remote).
- Apple Developer app record for `com.baktech.bakmx`, Expo/EAS project, RevenueCat project with the `bakmx_pro` entitlement and store products.
- Stripe product for the web client, if web is sold at launch.
- Support, privacy and terms URLs.
- The answer key (item 5) and review of authored suspension and engine guidance.
