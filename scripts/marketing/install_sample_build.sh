#!/bin/bash
# prep.sh <app.tar.gz url> : fresh install of a sample build with BAK blue and first-run cards already dealt with
U=7F2945D3-F461-4004-B90F-1AA2B605F55B; ID=00000000-0000-4000-8000-000000000001
rm -rf app2 && mkdir app2 && curl -fsSL -o app2.tgz "$1" && tar -xzf app2.tgz -C app2 || exit 1
xcrun simctl terminate $U com.bakmx.app 2>/dev/null; xcrun simctl uninstall $U com.bakmx.app; xcrun simctl install $U app2/*.app
D=$(xcrun simctl get_app_container $U com.bakmx.app data)/Documents; mkdir -p "$D"
echo 'true' > "$D/bakmx-device-welcome-seen.json"
echo 'true' > "$D/bakmx-$ID-ai-consent-v3.json"
echo '"bak"' > "$D/bakmx-$ID-app-color.json"
echo '"11111111-1111-4111-8111-111111111111"' > "$D/bakmx-$ID-active-bike.json"
[ "$2" = "nonew" ] && echo '{"dismissed":true,"opens":1}' > "$D/bakmx-$ID-whats-new-2026-11-talk-to-bak.json"
xcrun simctl launch $U com.bakmx.app; sleep 5; ls "$D" | head -20
