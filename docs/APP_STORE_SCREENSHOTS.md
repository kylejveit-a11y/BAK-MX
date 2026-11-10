# App Store screenshots

Eight images per size, captured from the real app on the iOS Simulator in sample mode (no account, no server; every call is
answered by `scripts/web-visual/mock-api.cjs` with `EXPO_PUBLIC_SAMPLE_STORE=1`). Nothing in them is drawn or invented: the
bike figures are the KTM 450 SX-F claims in the mock, there are no prices, no bike art and no real riders.

Two rules the first set broke, now part of the recipe:

- **BAK blue, not the bike's colour.** The sample bike is a KTM, so with the default *Match my bike* setting every header, chip,
  button and dash came out KTM orange. Store images use the app's own colour: Account › App colour › **BAK blue** (progress
  key `app-color` = `"bak"`, written before the first launch, see step 3), and the composed caption dash and glow use the same
  blue from `shared/brand-theme.ts` (`BAK_THEME`: accent `#6AA4FF`, deep `#2F74E8`). Verify every capture is blue before composing.
- **San Francisco, upright.** Captions are SF Pro Display Semibold (the app's and the App Store's own face), white, sentence
  case, left-aligned, two lines at most, tracking −1.5 %, one thin BAK-blue dash under them. Never an italic or display face.
  `compose.py` therefore runs on macOS: it loads SF from `/System/Library/Fonts/SFNS.ttf` (variable axes wght 600, opsz 96) or
  `/Library/Fonts/SF-Pro-Display-Semibold.otf` when installed, and falls back to Helvetica Neue Medium only if SF is missing
  (it prints the font it used).

Sizes: App Store Connect's one iPhone slot, *iPhone with Dynamic Island (medium display)*, takes **1206×2622** (6.3", iPhone 17 /
16 Pro class) or 1179×2556. The primary set is 1206×2622, captured on an iPhone 17 simulator (1206×2622 native) so nothing is
ever upscaled. The 6.9" (1320×2868) and 6.5" (1242×2688) canvases still work with the same script and their own captures.

| # | File | Screen | Caption |
|---|------|--------|---------|
| 1 | 01-chat.png | Ask BAK, answered question with one change, Save to Garage | Tell it what the bike’s doing. Get one change to try. |
| 2 | 02-fuel.png | Race day Home, fuel plan card (timeline to the gate) | Race day, planned. What to eat, drink and when. |
| 3 | 03-garage.png | Garage overview, active bike, readiness chips, "Add a photo" plate | Your exact bike. Every setting in one place. |
| 4 | 04-specs.png | Specs and parts, hero cards and stock-vs-yours rows | Published specs in rider words. |
| 5 | 05-raceday.png | Race day Home, Next up countdown, BAK’s setup, fuel plan | Countdown, next moto, what to check. |
| 6 | 06-service.png | Service log, Coming up, KTM schedule, history | Know what’s due before it costs you a moto. |
| 7 | 07-events.png | Events, upcoming practice day and race | Ride days, races and riders near you. |
| 8 | 08-pro.png | Ask BAK in race mode (Race chip), short between-motos answer | Short answers between motos. |

The eighth image uses the race-mode chat instead of the Account › Ask BAK plan card: on the simulator the store offerings do not
load, so the plan card shows only the tier name and links, too thin for a store image, and store prices must not appear anyway.

## Re-running for a release

1. Build and run the dev client on a simulator (`npx expo run:ios --device "iPhone 17" --no-bundler`). With Xcode 27 / an iOS 27
   simulator the generated app traps at launch (`UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`) because the
   Expo 57 template has no scene delegate: in the generated `ios/` (not committed) make `AppDelegate` also conform to
   `ExpoReactNativeFactoryProvider`, drop its `window = UIWindow(...)`/`startReactNative` block, add
   `class SceneDelegate: ExpoAppSceneDelegate {}` to AppDelegate.swift, and add a `UIApplicationSceneManifest` to Info.plist with
   `UISceneDelegateClassName` = `$(PRODUCT_MODULE_NAME).SceneDelegate`, then run `expo run:ios` again. Then start Metro with
   `EXPO_PUBLIC_SAMPLE_MODE=1 EXPO_PUBLIC_SAMPLE_STORE=1` plus the real `EXPO_PUBLIC_SUPABASE_URL` (the app treats any other
   URL as an unconfigured build), a non-empty `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and an `https://` `EXPO_PUBLIC_API_URL`;
   nothing is called in sample mode. Hide the dev-menu button and its onboarding sheet:
   `xcrun simctl spawn <udid> defaults write com.bakmx.app EXDevMenuShowFloatingActionButton -bool NO` and
   `… EXDevMenuIsOnboardingFinished -bool YES`. Open the bundle with
   `xcrun simctl openurl <udid> "exp+bakmx://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"`.
2. Status bar: `xcrun simctl status_bar <udid> override --time 9:41 --batteryState charged --batteryLevel 100 --wifiBars 3 --cellularBars 4`.
   For the two race-day screens the countdown comes from the real clock, so boot the simulator with `SIMCTL_CHILD_TZ` set to a
   zone where it is about 9:50 and override the status bar to that clock (the first set used 9:51 with Moto 1 at 10:40).
3. Skip the welcome, AI consent and What’s New and pick BAK blue by writing the app’s local-progress files into the app
   container’s `Documents` (plain JSON is read when no snapshot exists): `bakmx-device-welcome-seen.json` → `true`,
   `bakmx-<sample user id>-ai-consent-v3.json` → `true`, `…-whats-new-2026-10-widgets.json` → `{"dismissed":true,"opens":1}`,
   `…-active-bike.json` → the KTM id, `…-chat-thread-<bike id>.json` → the conversation id to open, **`…-app-color.json` → `"bak"`**.
   For the race-day screens add `…-race-day.json` (`{"on":true,"track":"Dade City MX","day":"<today>","kind":"race","next":{"label":"Moto 1","at":"10:40"}}`)
   and `…-fuel-day%3Arace.json` (`{"day":"<today>","profileId":"f1","input":{"kind":"race","gates":[{"label":"Moto 1","at":"10:40"},{"label":"Moto 2","at":"13:15"}],"motoMinutes":20}}`).
   The sample user id is `00000000-0000-4000-8000-000000000001`, the KTM is `11111111-1111-4111-8111-111111111111`, the
   conversation is `33333333-3333-4333-8333-333333333333`; the race-mode conversation (`55555555-…`) is reached from the chat's
   thread list. Restart the app after writing the files.
4. Capture each screen at full resolution with `xcrun simctl io <udid> screenshot <name>.png` (Maestro or taps to navigate), into
   `raw/6.3/` using the `raw` names in `scripts/store-shots/manifest.json`. Check every capture is blue (header dash, chips,
   buttons, active tab) before going on.
5. Compose, on macOS so SF is available:
   `python3 scripts/store-shots/compose.py --manifest scripts/store-shots/manifest.json --raw raw/6.3 --out final/6.3 --size 1206x2622 --screen-radius 165 --contact contact-6.3.jpg`
   (6.9": `--size 1320x2868 --screen-radius 180` from an iPhone 17 Pro Max capture; 6.5": `--size 1242x2688 --screen-radius 117`
   from an iPhone 11 Pro Max capture). Needs Pillow and numpy. Captures are only ever scaled down; the script prints the font
   it used and the capture scale for each image.
