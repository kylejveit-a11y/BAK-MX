# App Store screenshots

Eight images per size, captured from the real app on the iOS Simulator in sample mode (no account, no server; every call is
answered by `scripts/web-visual/mock-api.cjs` with `EXPO_PUBLIC_SAMPLE_STORE=1`). Nothing in them is drawn or invented: the
bike figures are the KTM 450 SX-F claims in the mock, there are no prices, no bike art and no real riders.

Sizes: 6.9" (iPhone 17 Pro Max, 1320×2868) and 6.5" (iPhone 11 Pro Max, 1242×2688).

| # | File | Screen | Caption |
|---|------|--------|---------|
| 1 | 01-chat.png | Ask BAK, answered question with one change, Save to Garage | Tell it what the bike’s doing. Get one change to try. |
| 2 | 02-fuel.png | Race day Home, fuel plan card (timeline to the gate) | Race day, planned. What to eat, drink and when. |
| 3 | 03-garage.png | Garage overview, active bike, readiness chips | Your exact bike. Every setting in one place. |
| 4 | 04-specs.png | Specs and parts, hero cards and stock-vs-yours rows | Published specs in rider words. |
| 5 | 05-raceday.png | Race day Home, Next up countdown, BAK’s setup, fuel plan | Countdown, next moto, what to check. |
| 6 | 06-service.png | Service log, Coming up, KTM schedule, history | Know what’s due before it costs you a moto. |
| 7 | 07-events.png | Events, upcoming practice day and race | Ride days, races and riders near you. |
| 8 | 08-pro.png | Ask BAK in race mode (Race chip), short between-motos answer | Short answers between motos. |

The eighth image uses the race-mode chat instead of the Account › Ask BAK plan card: on the simulator the store offerings do not
load, so the plan card shows only the tier name and links, too thin for a store image, and store prices must not appear anyway.

## Re-running for a release

1. Build and run the dev client on a simulator (`npx expo run:ios --device "iPhone 17 Pro Max" --no-bundler`), then start Metro with
   `EXPO_PUBLIC_SAMPLE_MODE=1 EXPO_PUBLIC_SAMPLE_STORE=1` plus the usual `EXPO_PUBLIC_SUPABASE_URL`, a non-empty
   `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `EXPO_PUBLIC_API_URL`. Hide the dev-menu button:
   `xcrun simctl spawn <udid> defaults write com.bakmx.app EXDevMenuShowFloatingActionButton -bool NO`.
2. Status bar: `xcrun simctl status_bar <udid> override --time 9:41 --batteryState charged --batteryLevel 100 --wifiBars 3 --cellularBars 4`.
3. Skip the welcome, AI consent and What’s New by writing the app’s local-progress files into the app container’s `Documents`
   (plain JSON is read when no snapshot exists): `bakmx-device-welcome-seen.json` → `true`,
   `bakmx-<sample user id>-ai-consent-v3.json` → `true`, `…-whats-new-2026-10-widgets.json` → `{"dismissed":true,"opens":1}`,
   `…-active-bike.json` → the KTM id, `…-chat-thread-<bike id>.json` → the conversation id to open. For the race-day screens add
   `…-race-day.json` (`{"on":true,"track":"Dade City MX","day":"<today>","kind":"race","next":{"label":"Moto 1","at":"10:40"}}`) and
   `…-fuel-day%3Arace.json` with the gate times. Boot the simulator with `SIMCTL_CHILD_TZ=Etc/GMT+11` so the clock reads morning
   and the countdown matches the status bar.
4. Capture each screen at full resolution with `xcrun simctl io <udid> screenshot <name>.png` (Maestro or taps to navigate), into
   `raw/6.9/` and `raw/6.5/` using the `raw` names in `scripts/store-shots/manifest.json`.
5. Compose: `python3 scripts/store-shots/compose.py --manifest scripts/store-shots/manifest.json --raw raw/6.9 --out final/6.9 --size 1320x2868 --screen-radius 180 --contact contact-6.9.jpg`
   and the same with `--raw raw/6.5 --out final/6.5 --size 1242x2688 --screen-radius 117`. Needs Pillow and numpy; uses Inter
   Display Black Italic when installed. Captures are only ever scaled down.
