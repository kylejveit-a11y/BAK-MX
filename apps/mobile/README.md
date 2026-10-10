# BAK MX mobile

Primary iOS and Android application. This is a React Native application, not a website wrapper. The web application is the fallback. Shared API and engineering types live at repository root. Bundle exports prove JavaScript packaging; they do not prove native installation, store approval, live payment or AI quality.

## Local development

From this directory: `npm ci`, populate `.env` from `.env.example`, then `npx expo start --dev-client`. Use a development build for RevenueCat; Expo Go cannot validate native store purchasing. Run `npm run typecheck` and `npm run export` before a native build. `EXPO_OFFLINE=1` suppresses Expo metadata requests when necessary; npm dependencies must already be installed.

Public configuration is embedded in the app. Use only Supabase publishable and RevenueCat public SDK keys here. Service-role, AI, Stripe, RevenueCat secret and webhook keys belong on the server. API requires HTTPS. App uses Supabase user access tokens for API requests and stores auth sessions in encrypted native SecureStore. Foreground transitions refresh auth and reload the selected conversation. There is no promise of background AI execution. Connection failures preserve the in-memory question draft and request ID for an idempotent retry; process termination loses an unsent draft.

## Native identity and build

`com.baktech.bakmx` is a provisional identifier for BOTH platforms and is not registered. Confirm ownership and availability before provisioning. App URL scheme: `bakmx`. Add `bakmx://auth/confirm` and `bakmx://auth/recovery` to the dedicated Supabase project's redirect allowlist. Confirmation and password reset use PKCE callbacks on the initiating device. Test expired, reused and cross-device links. Populate EAS_PROJECT_ID from a separately created Expo project.

EAS profiles: development (dev client), preview (internal; APK for Android), production (store, auto-increment). Build commands: `eas build --profile preview --platform all`, then after gates pass `eas build --profile production --platform all`. Neither builds nor submissions were initiated. iOS signing needs Apple team and distribution credentials; Android needs registered Play app and signing. Do not use EMOTO identities, certificates or project credentials.

## Purchases

Create independent iOS and Android subscription products in their stores, attach them to RevenueCat entitlement `bakmx_pro`, and provide a current Offering. Prices come directly from store SDK products. The UI uses native `purchasePackage`, `restorePurchases`, and store subscription-management links. No mobile Stripe checkout links.

RevenueCat config/logIn uses the current Supabase UUID before fetching offerings, purchasing or restoring. Backend `POST /api/mobile/sync-entitlement` must independently verify current entitlement with RevenueCat; client purchase results never grant backend access. Configure signed/authorized RevenueCat webhooks on server and test lifecycle changes. Choose RevenueCat restore/transfer policy intentionally so purchases cannot unexpectedly move between app accounts.

## Launch gates still requiring external configuration or device execution

- Separate live API, Supabase migration/RLS, AI evidence corpus and model credentials.
- Apple Developer and Play Console registrations, store subscription records, tax/banking agreements, RevenueCat configuration, sandbox testers.
- Final app icon/splash and store screenshots, privacy/terms/support URLs, privacy disclosures, age rating, account deletion URL and review access.
- iOS and Android native build/install and physical device testing: keyboard/pickers, signup/confirmation/recovery/deep links, session expiry, account switching, Garage CRUD, service history, concurrent chat, app-background/recovery, offline draft, export share sheet/deletion.
- Store sandbox new purchase, cancellation, renewal, billing retry, expiration, refund, restore, cross-platform same-user access, separate-user denial. Verify backend paid access and webhook event ordering.
- Verify account deletion subscription policy, token/session revocation and data cascade. Deletion must not be blocked until store subscription expiry; store cancellation remains separately managed by the user.
- Accessibility (VoiceOver/TalkBack, font scaling), slow-network behavior, crash reporting, backup/restore and held-out live response grading.

Dependencies selected using Expo 57 bundled native version map. Reference docs: https://docs.expo.dev/guides/using-supabase/ ; https://docs.expo.dev/versions/latest/sdk/securestore/ ; https://www.revenuecat.com/docs/getting-started/installation/reactnative ; https://www.revenuecat.com/docs/getting-started/making-purchases .
