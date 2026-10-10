# Rebuild guide verification — 13 September 2026

These checks verify software behavior and reviewed source integrity. They do not represent physical mechanical work or launch qualification.

## Browser observations

Isolated fixture: `http://127.0.0.1:5289/tests/browser/workshop.html`, fictional owner/bike only. No authentication or database requests. The pre-existing localhost4173 service was a different app and returned404; no interaction or writes were performed there. All subsequent checks used the dedicated MX preview.

- MX workshop rendered with new engine, fork and frame choices, without a framework error overlay.
- Transmission guide showed explicit case-open starting state and case-open ending state, source page locators, tool list and renewal parts.
- Starting the fictional guide, recording a clearly labeled test observation and advancing to step2 worked. Reloading and reopening that guide restored step2 and its recorded-step count.
- The combined chassis guide appeared with serviceable-stock scope, retained pressed races/pads, entry/exit conditions and one initial stock confirmation.
- Browser error log contained only the earlier different-service404; no MX-preview errors were reported.
- Final top-end guide appears in the menu and displays assembled-bike entry, accepted final clearances and refit checks, with crankcases/clutch basket/gearbox explicitly retained. Internal release terminology was removed from its rider-facing ending condition.

## Manual device/workshop QA still required

- Garage: select the exact real bike and confirm modified-component exclusions.
- AI: authenticated questions about the current step, correct build context, real output grading and failure recovery.
- Photos: physical phone photo-picker permissions and saved attachments.
- Persistence: real device kill/reopen, account switch, sign-out/sign-in and backup import/share sheet.
- Workshop: mechanic review and actual execution of access, measurements, torque sequences, routing and final checks. Do not use fictional browser records as mechanical validation.
- Apple/Android: signed builds, device usability, release configuration and store qualification.
- Community, Events, Profile, Messages and Feedback were not changed or qualified by this mechanical-coverage pass.

Full test/build/export results and remaining evidence blockers are recorded in WORKSHOP_PASS3_20260913.md.
