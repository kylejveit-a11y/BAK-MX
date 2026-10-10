# Workshop browser verification — 13 September 2026

The isolated fixture `tests/browser/workshop.html` renders the actual Workshop and ProcedureGuide components with explicitly fictional bike identities. It has no API client, authentication bypass, Supabase access or production-route import. Run the normal Vite development server locally and open this fixture URL for manual regression testing. The fixture is not a production build entry point.

Browser exercised: Microsoft Edge via supported browser automation, 390 × 844 viewport. The temporary viewport override was reset after verification.

## Observed passing interactions

- Actual unconfigured MX app: home renders; Workshop home card opens the new page; Open Garage reaches Garage; mobile layout remains usable. No live sign-in attempted.
- Fixture: choosing the exact 2026 US standard YZ450F stock fork guide shows its narrow scope and requires one stock/prerequisite confirmation before Start enables.
- A verification note advances the guide exactly one step. Reload and reselect restore the current step and unsent step-note draft.
- Same bike ID under a second owner does not restore the first owner's guide run.
- Changed fork configuration does not restore stock-build guide progress. After component-filter update, the explicitly aftermarket fork removes the stock fork guide while shock and engine guides remain independently available.
- Unsupported Honda identity offers no reviewed procedure and does not receive Yamaha guidance.
- The fixture's explicit storage-failure switch makes completion stay on the same step, retain the note and show an error. Recovering storage and retrying advances successfully.
- A clicker journal retains completed phase notes and a measurement note after reload.
- One pending trial hides the next-comparison form. Choosing keep while untested is rejected. Recording better/keep persists across reload and unlocks the next comparison.
- The cold-valve inspection guide appears with its tools, required parts, exclusions and prerequisites; its first step is available after one confirmation.
- Ask BAK about this step produces a prefill containing the guide title, current step, source URL/pages and notes in the fixture's captured-output field; it does not send a chat request.

## Runtime blocker found and resolved during verification

The actual app initially rendered blank because the previous Supabase package called node:module createRequire in the browser. The integration owner pinned the compatible SDK. After restarting Vite with forced dependency optimization, the actual MX home and Workshop/Garage navigation rendered. The production build then completed without the former node:module externalization warning.

## Not established by this fixture

Live account behavior, backend chat responses/retry idempotency, store builds, physical service correctness and real-device native rendering are not certified. Chat draft merging and retry identity have been implemented and typechecked, but live authenticated UI testing remains pending. Fictional local records remain isolated by test owner/bike IDs.
