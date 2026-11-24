# Marketing captures: feature videos and App Store screenshots

Made on 2026-11-24 for 1.0.13 from the real app in sample mode (no account, no server, sample rider and bike). Nothing is drawn or invented.

Where it runs: a macOS sandbox on Expo (Xcode and the iOS Simulator are already there; Maestro drives the taps). Expo's cloud simulators were not available on the account, so the sandbox's own simulator was used.

1. Build the sample app: Expo build profile `ios-store` (BAK blue is set by the install script, not the build).
2. `install_sample_build.sh <build .tar.gz url> nonew` installs it fresh on the iPhone 18 Pro simulator (1206x2622, the App Store 6.3" size), sets BAK blue, skips the welcome and AI consent, and hides the What's New card.
3. `record.sh <flow>` records the screen while `flows/<flow>.yaml` runs. The simulator records at a variable frame rate: convert each recording to a constant 30 fps file before choosing cut points, or the times are wrong.
4. `render_videos.sh` cuts each recording and calls `feature_video.py` (1080x1920, 30 fps: caption, the recording in a rounded frame, then an end card with the wordmark).
5. `store_shots.py` composes the App Store screenshots from full-size captures in `../raw/`.

Fonts: San Francisco from `/System/Library/Fonts/SFNS.ttf`, so both scripts run on macOS. The wordmark is `public/bak-mx-logo.png`.

Known limits: Talk to BAK can be opened and photographed but not talked to in sample mode, so the voice video shows the screen only. Maestro sometimes taps an off-screen match on tab screens that stay mounted; tap by point when a label is ambiguous.
