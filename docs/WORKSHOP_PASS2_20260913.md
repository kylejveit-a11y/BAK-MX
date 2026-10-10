# Workshop pass 2 — 13 September 2026

Continued checkpoint `622fe88838d61ef518eef7813f7f3f8b8212f2e5`. No research restart, new project or EMOTO writes. The prior 14,451 VERIFIED records were rechecked in MX; no new claim promotion was needed for this procedure-focused pass.

## Delivered in this pass

- AI input now includes server-selected exact-bike reviewed operations, their scope, prerequisites, source pages and ordered steps. Retrieved procedures do not establish fitted hardware or user progress. Numerical claims retain the existing evidence requirements. The exact reviewed-operation snapshot is retained with the provider audit output. Live AI qualification remains pending credentials.
- Captured catalog comparison covers 582 assembly/year pairs and finds 220 identical captured orderable-part multisets. This reduces repeated research while preserving quantity, market, model and variant boundaries. No automatic torque, clearance or procedure inheritance was enabled.
- Additional Yamaha procedures close valve adjustment, automatic timing-chain tensioner service, exhaust removal/refit, coolant replacement, airbox removal/refit and sealed-shock removal/refit. Two exact 2025 US Husqvarna FC 450 guides add shock baseline and sag inspection. Final registry: 12 guides, 154 steps, two exact bike scopes.
- Conversation creation uses a persisted stable request ID, extending Garage/service duplicate-save protection. Same-owner identical retries return the existing conversation; changed input cannot overwrite it.
- Mobile/web workshop backups can be exported and restored. Import validates the original account/bike, preserves conflicting versions and older build/source revisions as read-only history, and supports earlier structured exports. Plain-text recaps remain readable notes, not proof of checked steps.
- Routine web steps now use an explicit Checked action. Actual measurements and critical results remain required where the reviewed guide marks them. Progress saves before advancement.
- Independent review identified an all-in-range valve flow problem. V3 now branches directly to reassembly with bypassed steps recorded as NOT PERFORMED. Tests reject invented branches, partial skip sets and replacing already performed work. The source review preserves v2 and its manifest.
- A separate verified page-index correction adds the old inspection guide's omitted PDF58 metadata while preserving its frozen artifact and unchanged mechanical progress hash. Corrected source metadata carries its own correction hash.

## Source findings and remaining work

The complete vehicle, engine and internal suspension rebuild promise is still unfinished. Head/piston/cylinder core pages were reviewed, but a core section is not a complete executable rebuild chain. Preserve the head-bolt sequence, ring clocking, new parts, actual paired bore/piston clearance and diagnostic-tool dependencies in the research artifacts. Do not substitute nominal component ranges for the assembled clearance or wear limits for ring installation targets.

Race Tech's illustrated twin-chamber service is useful attributed evidence. Its generic oil-level method is not a substitute for the exact Yamaha measurement; threadlocker and other internal-fork details remain unresolved. An ambiguous Husqvarna fork-adjuster direction was excluded rather than guessed. Paid KTM manual acquisition remains on hold.

## Main implementation paths

- `server/workshop-context.ts`, `server/engineering.ts`: reviewed operation context and audit.
- `scripts/compare-catalog-years.ts`, `docs/research/generations/catalog-comparisons.json`: source-hashed comparison and reuse leads.
- `scripts/build-procedure-library.ts`, `shared/procedure-library.ts`, `shared/procedures.ts`: explicit reviewed registry and installed-component applicability.
- `server/create-record.ts`, `server/app.ts`, both App clients: conversation retry identity.
- `shared/workshop-backup.ts`, web/native WorkshopRecovery and recovery-storage modules: additive cross-device backup restoration for the same account/bike.
- `docs/research/expansion/yamaha/workshop-pass2/`, `docs/research/suspension-pass2/`: source artifacts, validators, manifests and unresolved dependencies.

## Qualification boundaries

Automated tests and local browser fixtures are not live AI or physical-device qualification. Real authenticated sign-in, service/AI retries, account deletion/export, device interruptions and Apple/Android hardware use still need runtime/device access. Backup transfer is explicit file export/import, not automatic cloud sync.

The separate Vercel MX project metadata was read successfully; no environment credentials were exposed or copied. No key was created, no paid manual purchased, no deployment made. Updated server behavior must be deployed before updated clients. Apple/Google signing, store assets, remote build numbers, subscriptions and release approval remain open.

This pass closes specific implementation and source-review work; it does not claim the majority of all requested dirt-bike rebuild coverage is complete. See the final delivery check results and current recovery state for exact totals.

Final full root check: typecheck, 101 tests and production web build PASS. A first build exposed CP1252 encoding in a changed UI file; it was corrected to UTF-8 and rerun successfully. Stronger source-page validation exposed the index omission documented above; the correction is separately reviewed and hash-bound. Provider transport tests use an explicit mock and do not represent live AI grading.

Final mobile typecheck and 12 tests PASS; fresh iOS/Android exports PASS (963/959 modules, approximately 4.5 MB bundles). Source validators for the Yamaha final manifest, reviewed valve branch and suspension manifest PASS. Browser interaction verified the in-range branch, notes requirement, reload at closure, completion of closure checks and NOT PERFORMED recap entries without console errors. File-picker automation returned `Not allowed`; actual import selection and native share/import interaction remain manual QA. Git whitespace check PASS after normalizing application files; frozen research artifacts were preserved byte-for-byte.
