# Native core-flow repair checkpoint — 13 September 2026

## Implemented

- Active Garage bike survives restart, is scoped to the signed-in account, and falls back only to an existing bike after deletion. Garage cards identify the active bike and offer an Ask BAK action.
- Garage editing and maintenance-entry drafts autosave on the device. They are not represented as cloud-synchronized drafts.
- Chat restores the bike's selected thread, question draft, and in-flight request identity after restart. Identical retries retain the server idempotency key; changed text or conversation gets a new key.
- A completed answer renders before a history refresh. A failed refresh cannot hide the answer that was already returned.
- Tuning notebook supports rider-written changes, observations and next steps per account/bike. Notes and drafts are included in account export and removed on account deletion.
- Maintenance validates actual calendar dates, prevents duplicate synchronous save actions, locks form fields during save, and exposes history refresh. A successful save followed by failed history retrieval explicitly says the save succeeded.
- Native Supabase client only accepts MX project `yzvrujffiktfserrgkcb`. Missing/wrong configuration cannot construct an EMOTO client.
- Interrupted encrypted-session refresh retains the previous complete session using rotating chunk slots. Existing session storage migrates on the next refresh. Sign-out clears both slots and legacy chunks.
- Auth initialization failures end the loading state; recovery errors update an already-mounted sign-in screen; deep links must match the exact BAK MX auth scheme and host.
- User-facing raw claim identifiers were removed from chat cards. The specifications screen remains the source-review entry point.

## Automated validation

- `npm --prefix apps/mobile run typecheck` — PASS.
- `npm --prefix apps/mobile run export` � PASS, iOS and Android bundles exported.
- `npm --prefix apps/mobile test` — PASS, 8 tests, including stale-request gates, restored bike selection, impossible calendar dates, restart retry identity, interrupted session storage and legacy migration/sign-out cleanup.
- These checks do not prove live services, on-device rendering, email redirect configuration, or store readiness.

## Required real-device / authenticated QA

1. Sign in to account A; create two bikes; choose the second; force-close and reopen. Confirm active selection and saved bike data.
2. Partially edit a Garage bike and a service entry; restart and verify both drafts. Save each and confirm server persistence after a new sign-in.
3. Start a question; disconnect during send; reopen; refresh history before retrying. Confirm one server request/answer, original bike context, and no duplicate conversation after a conversation-create timeout.
4. Switch bikes while history loads; confirm old messages never appear under the new bike. Switch accounts and verify no local draft/note leakage.
5. Complete a response while the history fetch fails; verify the returned answer remains visible. Recover network and refresh.
6. Save tuning notes for each bike; restart; export account data; verify cloud data and device-only notes are clearly separated in the export.
7. Enter impossible service dates, rapidly tap save, and interrupt the save response. Confirm validation and inspect server history before retrying ambiguous writes.
8. Exercise signup confirmation, forgot-password deep link, password update, foreground token refresh, expired session, sign-out and sign-in on both iOS and Android.
9. Delete a test account and confirm device drafts/notes are removed. Test export/share on each platform.

## Remaining limits

Garage and service create retries are now idempotent for updated clients; deploy the compatible server first. Older clients without create_id retain legacy creation behavior. Conversation creation remains outside this change. Live authentication, API/AI quality, and native persistence/visual checks remain unverified without a configured device session. Drafts and notebook content are local device data; clearing app data or uninstalling removes them unless exported. Owner-entered off-road identities (1970�2027; motocross, cross-country or enduro) can now be saved. This expands Garage identity entry, not verified specification coverage. Full model-year evidence remains bounded by the reviewed research, not every dirt bike ever built.

## Additional native integration

Home and Maintenance open the local Workshop job screen. Reviewed response reference metadata renders source title, attribution, limitations and a source link. Owner-entered off-road identities record rider_declared provenance and off-road use. Custom Garage requires authenticated API/migration QA before release.

## Reviewed procedure runner

The Workshop reviewed-guides entry lists exact-bike procedures separately from job plans. Native ProcedureGuide now walks one reviewed step at a time with tools/source details, one initial stock-component confirmation, original-setting entry, explicit verification recording, resumable device progress, completed recap and sharing. Completion advances only after local saving succeeds. Procedure source/build/owner mismatches remain historical and cannot resume as current. These guides currently cover only the two reviewed stock 2026 YZ450F external suspension baseline resets, not internal suspension or engine rebuilds.

Manual QA: choose US standard 2026 YZ450F, start either guide, enter original settings, record a step, restart, verify the next step and all notes; finish and share recap. Change installed components in Garage and verify old progress cannot resume. Choose another year or YZ450FX and confirm these exact guides are absent. Simulate storage failure and confirm the runner does not advance. Inspect source link and tools on iOS/Android. These physical-device checks remain unverified.

## Subsequent reliability and guide expansion

- Native progress now uses two checksummed snapshots per record. The older slot is replaced only after identifying the last good snapshot; interrupted-write, corrupted-payload, and legacy migration tests verify last-good recovery. Legacy files remain available in exports. Physical-device interruption tests are still required.
- The runner now also supports the reviewed valve-clearance inspection. Completion labels are procedure-neutral; required measurements/assessments cannot be blank; required parts appear before starting; step source diagrams are linked and explicitly acknowledged by the Checked action.
- Workshop phases and reviewed steps can prefill Ask BAK with the exact bike, current work, notes and source. This does not send a message. Existing unsent text is preserved; token/content deduplication avoids repeated context, and oversized drafts require shortening before sending.
- Latest mobile test count: 12 PASS. Typecheck PASS. The earlier two-guide count describes the previous checkpoint; current shared library contains three bounded guides, not a full engine or suspension rebuild.

Additional device QA: interrupt a snapshot write and restore last good progress; verify original legacy data remains exportable; open the valve inspection, require actual values for measure/assess, open the required diagram, and confirm no baseline-reset wording. Start a chat draft, navigate into a guide and use Ask BAK about this step; confirm old draft survives, exact step context appears once, and no request is sent automatically.

## Garage and service create retry closure

Native and web persist a create ID before the request, keyed by account and entry type/bike. Exact unchanged retry reuses the ID, including after restart; changed payload gets a new attempt. The API uses the existing primary UUID key and never upserts existing data. A unique conflict returns the existing row only when owner and normalized submitted fields match. Changed input or another owner's ID returns 409. No database migration or live database write was performed for this change.

Validation: 10 focused PostgreSQL/workshop tests PASS (including concurrent retry, service retry, changed-input rejection and owner isolation); 12 mobile tests PASS; mobile and root typechecks PASS; web build PASS. Current shared guide library contains four bounded procedures. Remaining conversation-create timeout behavior is separate from bike/service create idempotency.

Required deployment/device QA: deploy server first, create a bike/service with response interruption, restart and retry the identical payload, verify one row; reuse a request ID with altered input and confirm 409/no overwrite; sign into another account and confirm no existing-row disclosure. New deliberate entries clear the acknowledged attempt. Tests simulate real PostgreSQL constraints/RLS; they do not replace authenticated production or physical-device validation.

## Conversation retries and portable workshop recovery — final local verification

- Conversation creation now follows the existing Garage/service stable create-ID path on web and native. The retry identity is persisted before POST; the returned conversation is saved before retiring the attempt. PostgreSQL-backed tests cover duplicate retry, changed-input rejection and owner isolation. No database migration or live database write was needed.
- Added portable JSON workshop backups and additive import on web/native for the same account and original Garage bike. Imports validate nested account/bike/build identity and procedure/source revisions. Conflicting notes, changed builds, old sources and invalid prerequisites remain readable history, never completed current work. Existing legacy native account exports and web JSON guide exports are supported; old plain-text summaries cannot reconstruct checked steps.
- Imports retain the validated incoming backup before updating individual storage records. Reimport is idempotent. This is not an atomic multi-record storage transaction: after storage failure, retain the original export and retry import. It does not recreate cloud Garage bikes, restore authentication, or import cloud service history.
- Native supports selecting recovered valid guide runs. Web and native routine guide steps use one explicit Checked action; real measurements/settings/assessment remain required where the reviewed step requires a record. Source-diagram acknowledgement is recorded with the check.
- Final checks: `npm run check:mobile` passed typecheck and 12 tests; `node --experimental-strip-types --test tests/workshop-backup.test.ts tests/create-record.test.ts` passed 8 tests; `npm run build` passed TypeScript and production Vite build. Strict UTF-8 decoding checked all touched code; corrected one ProcedureGuide encoding issue and its visible punctuation.
- Actual Edge browser QA used a temporary synthetic account/bike harness with no backend calls. Verified stock confirmation, guide start, routine advance without typed note, required settings disabled until a record was entered, and reload restoring step 3. Browser console reported no errors. Temporary fixture and server were removed afterward.
- File-picker QA limitation: `mcp__cua_repl.js` invoked the documented `playwright.waitForEvent('filechooser')` / `chooser.setFiles(absoluteSyntheticBackupPath)` flow. The chooser opened, but `fileChooser.setFiles` returned `{"code":-32000,"message":"Not allowed"}`. This was a browser tool restriction; it was not reported as an automatic approval-review rejection. Therefore actual browser file selection/import and native device picker/share remain unverified manually. Parser and browser storage integration tests passed; no permission request was made.
- Remaining physical-device checks: iOS/Android file picker, share-sheet export, reinstall/new-device import, storage-full recovery, sign-out during picker activity, and live authenticated conversation timeout retries. No claim of full rebuild coverage or launch readiness follows from these checks.
- Final `npm --prefix apps/mobile run export` also passed for iOS and Android (963 / 959 modules). Bundle export is not on-device execution.

### Reviewed conditional route follow-up

Web/native guides now expose only reviewed route choices, require a supporting record and persist the decision before advancing. Progress counts completed plus explicitly bypassed steps. Recaps and JSON exports identify bypassed steps as `Not performed` with the recorded reason, never as performed checks. Backup structure validation preserves route metadata; archived history displays it.

Actual Edge synthetic fixture QA verified: all-in-range route disabled with empty notes; explicit route at valve assessment step11 advances to closure step25; reload restores step25; final closure checks still required; completed recap shows bypassed cam/tensioner operations as `Not performed`. No console errors. Fixture and server removed. No real maintenance operation or live data write occurred.

Validation: 7 backup tests passed including reviewed-branch roundtrip, no fabricated completed checks, historical reasons and malformed bypass rejection. Web production build and mobile typecheck/12 tests passed. Native branch interaction remains device QA.
