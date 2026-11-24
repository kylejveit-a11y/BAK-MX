#!/bin/bash
# rec.sh <flow> : records the simulator screen to rec/<flow>.mov while flows/<flow>.yaml runs
U=7F2945D3-F461-4004-B90F-1AA2B605F55B; n=$1; mkdir -p rec out/$n; rm -f rec/$n.mov
xcrun simctl io $U recordVideo --codec h264 --force rec/$n.mov > rec/$n.log 2>&1 &
RP=$!; sleep 1.5
(cd out/$n && MAESTRO_CLI_NO_ANALYTICS=1 maestro --device $U test --test-output-dir . ../../flows/$n.yaml > log.txt 2>&1; echo "exit $?")
sleep 1; kill -INT $RP; wait $RP 2>/dev/null; ls -la rec/$n.mov | cut -c24-70; grep -E "WARNED|FAILED" out/$n/log.txt | cut -c1-90 | head -5
