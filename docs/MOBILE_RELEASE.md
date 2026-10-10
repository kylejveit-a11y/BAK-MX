# BAK MX native release inputs and qualification

Updated 12 September 2026. Primary paid product: native iPhone AND Android. Website: fallback. Implementation direction communicated by the build coordinator: Expo React Native, RevenueCat with Apple/Google store purchases, and server-authoritative entitlement processing. This document does not certify the implementation or any provider configuration.

A next-week public launch requires both store distributions to be ready and approved. A successful Expo build, TestFlight distribution, or Play internal test is not evidence of public store approval. Submission/review timing remains unknown until actual store records are inspected.

## Payment and deletion baseline

BAK MX sells digital app functionality. Use native Apple/Google subscription products for the initial mobile purchase experience. Apple guideline 3.1.1 addresses in-app unlocks; 3.1.2 covers auto-renewable subscriptions and clear subscription information. Apple explicitly distinguishes United States storefront external-link treatment from other storefronts. Do not ship a global external-checkout link based on a United States exception. Review the selected storefronts before changing the native purchase flow. [Apple App Review Guidelines, sections 3.1.1–3.1.3](https://developer.apple.com/app-store/review/guidelines/)

Google describes Play Billing for digital purchases and subscriptions and identifies exception/program conditions. Treat alternative billing eligibility as a separate verified configuration; do not assume a region-specific program permits a worldwide external payment flow. The chosen store billing baseline avoids relying on such an exception. [Google Play Payments policy explanation](https://support.google.com/googleplay/android-developer/answer/10281818?hl=en)

Apple requires apps supporting account creation to let users initiate deletion inside the app. Explain that an auto-renewable Apple subscription can keep billing after account deletion and offer subscription management. Any option to defer deletion until subscription expiry must also allow immediate deletion. Deletion is not merely deactivation. [Apple account deletion guidance](https://developer.apple.com/support/offering-account-deletion-in-your-app/)

Google requires the applicable account-deletion path in the app and a functional web resource that lets a user request deletion without reinstalling the app. The web resource must clearly identify the app/developer and explain relevant retention. Include the URL in the Data safety form. [Google Play account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en)

These are the four primary references used for this baseline. Recheck their current text when submitting; store policy and regional programs can change. Technical product choices above are implementation decisions, not a claim of granted program eligibility.

## Required provider and business inputs

UNKNOWN means no verified provider value or approved business decision was supplied to this lane. Never substitute BAK EMOTO identifiers or fabricated values. Obtain accessible values through connected accounts before asking Kyle to provide them.

| Input | Required evidence or decision | Status |
|---|---|---|
| Apple developer ownership | Actual organization/team, active membership and authorized App Store Connect access | UNKNOWN |
| Google developer ownership | Actual Play Console account, verification and production-access eligibility | UNKNOWN |
| Apple app record | New BAK MX bundle identifier, App Store Connect app ID, SKU and display name | UNKNOWN |
| Android app record | New BAK MX package name and Play Console application | UNKNOWN |
| Signing and build service | Actual Expo/EAS organization/project, iOS distribution/provisioning and Android signing credentials managed securely | UNKNOWN |
| Build requirements | Current required SDK/target API, supported OS versions, device families and export-compliance answers checked against actual upload validation | UNKNOWN |
| Subscription commercial terms | Approved price, billing period, included AI usage, renewal terms, trial/offer policy and supported storefronts | UNKNOWN |
| Apple products | Product identifiers, subscription group, localizations and review readiness in the correct app | UNKNOWN |
| Google products | Subscription/base-plan/offer identifiers, prices, countries and activation in the correct app | UNKNOWN |
| RevenueCat configuration | Actual project/apps, platform public SDK keys, store integration credentials and entitlement/offering mapping | UNKNOWN |
| Entitlement identity | Verified authenticated BAK user ID mapping; account-switch/restore/transfer policy and cross-platform ownership | UNKNOWN |
| Webhook operations | Production HTTPS endpoint, authentication secret, environment separation, replay/order handling, reconciliation and deletion behavior | UNKNOWN |
| Business agreements | Paid app agreements, tax/banking setup and seller identity completed in each provider | UNKNOWN |
| Public legal/support pages | Approved privacy policy, terms, support contact and independent Google deletion-request URL | UNKNOWN |
| Data disclosures | Actual collection/sharing/retention inventory including model provider, RevenueCat, backend and diagnostics reflected in Apple privacy and Play Data safety answers | UNKNOWN |
| Store listing | Accurate name/description, category, age rating, icons and screenshots from actual native builds | UNKNOWN |
| Review access | Working dedicated review credentials/instructions and live review backend; explain subscription and evidence-limited capabilities | UNKNOWN |
| Release control | Authorized release countries, manual/automatic rollout choice, support owner and incident rollback procedure | UNKNOWN |

## Native acceptance evidence

Record device model/OS, platform, binary version/build, backend commit/environment, tester, date and artifact links for each check. Preserve secrets outside the report.

| Area | iPhone acceptance | Android acceptance | Status |
|---|---|---|---|
| Signed distribution | Install the actual TestFlight candidate and upgrade a previous candidate | Install actual Play internal-track candidate and upgrade it | UNVERIFIED |
| Identity | Correct app/bundle ID, app version/build and API environment displayed in diagnostics | Correct app/package ID, version/versionCode and API environment displayed in diagnostics | UNVERIFIED |
| Authentication | Signup/recovery deep links, foreground refresh, expired/revoked session and sign-out | Same flow, including Android app-link/intent behavior | UNVERIFIED |
| Safe local state | Secure credential storage; account-scoped drafts/cache; no secrets in logs | Same, using platform secure credential storage | UNVERIFIED |
| Continuity | Draft recovery and persisted response after app background, network loss and process termination | Same, including OS process recreation | UNVERIFIED |
| Store purchase | Product/price loaded from store, success, user cancellation, pending state and server access | Product/base-plan loaded, success, user cancellation, pending state and server access | UNVERIFIED |
| Restore and identity | Reinstall/restore, other BAK account, other Apple account, no silent access transfer | Reinstall/restore, other BAK account, other Google account, no silent access transfer | UNVERIFIED |
| Lifecycle | Renewal, cancellation, expiry, billing issue and refund/revocation reflected by backend | Same including supported pause/grace/account-hold states | UNVERIFIED |
| Backend notification | Forged/duplicate/delayed/out-of-order event rejection or safe handling; reconciliation | Same with Google-backed events | UNVERIFIED |
| Manage subscription | Correct provider management path; cancellation timing clearly explained | Correct provider management path; cancellation timing clearly explained | UNVERIFIED |
| Account deletion | In-app immediate deletion and billing explanation; auth/cache removed; no webhook resurrection | In-app deletion plus independent web request; auth/cache removed; no webhook resurrection | UNVERIFIED |
| Full physical flow | Garage → purchase → Ask/Diagnose/Setup → maintenance/history → restore/manage/delete | Same on a physical Android phone | UNVERIFIED |
| Usability | Keyboard/safe area, readable response, scrolling, large text/screen reader and touch targets | Keyboard/back action, readable response, scrolling, large text/screen reader and touch targets | UNVERIFIED |
| Public release | Store approval and intended storefront availability verified | Store approval and intended production-track availability verified | UNVERIFIED |

Engineering correctness remains governed by `docs/EVALUATION.md`: 30 cases/33 turns and independent semantic review. Native lifecycle and store checks complement those cases. A shared backend evaluation does not prove either app displays or persists the returned answer correctly.

## Launch record

- iOS binary: UNKNOWN
- Android binary: UNKNOWN
- TestFlight build/distribution: UNKNOWN
- Google Play internal-track build/distribution: UNKNOWN
- App Store review submission/status: UNKNOWN
- Play production review/submission/status: UNKNOWN
- Paid products approved/active: UNKNOWN
- Physical device results: UNVERIFIED
- Backend/live response qualification: UNVERIFIED
- Public availability: UNVERIFIED

No live native launch claim is supported by this document yet.
