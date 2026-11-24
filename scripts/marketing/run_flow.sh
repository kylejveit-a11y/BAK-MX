#!/bin/bash
# run.sh <name> : runs flows/<name>.yaml, screenshots land in out/<name>/, then builds contact sheets sheet-<name>-N.jpg (4 per sheet)
n=$1; rm -rf out/$n; mkdir -p out/$n; cd out/$n
export MAESTRO_CLI_NO_ANALYTICS=1
maestro --device 7F2945D3-F461-4004-B90F-1AA2B605F55B test --test-output-dir . ../../flows/$n.yaml > log.txt 2>&1; echo "exit $?"; grep -E "FAILED|Error|not found|❌" log.txt | head -8
find . -mindepth 2 -name "*.png" -exec mv {} . \; ; ls *.png 2>/dev/null | wc -l
i=0; for f in $(ls *.png 2>/dev/null | sort); do i=$((i+1)); done
ls *.png 2>/dev/null | sort > list.txt
split -l 4 list.txt part_
k=0; for p in part_*; do k=$((k+1)); args=""; c=0; for f in $(cat $p); do args="$args -i $f"; c=$((c+1)); done
 ffmpeg -y -loglevel error $args -filter_complex "$(for j in $(seq 0 $((c-1))); do printf "[%d:v]scale=414:-1[s%d];" $j $j; done)$(for j in $(seq 0 $((c-1))); do printf "[s%d]" $j; done)hstack=inputs=$c" -q:v 4 ../../sheet-$n-$k.jpg 2>/dev/null || cp $(head -1 $p) /dev/null
 echo "sheet-$n-$k: $(cat $p | tr '\n' ' ')"; done
