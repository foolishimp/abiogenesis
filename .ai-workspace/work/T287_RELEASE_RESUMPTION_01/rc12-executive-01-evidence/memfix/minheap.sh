#!/bin/zsh
# usage: minheap.sh <tenant-dir> <name> <limitMB> [pattern]
T=$1; NAME=$2; L=$3; PAT=${4:-close-only}
D=/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/5e4c25c3-fca5-4dd6-89e7-20d55d008bdf/scratchpad/memfix
cd $T && TMPDIR=/private/tmp/abg-mem-tmp node --max-old-space-size=$L --experimental-vm-modules --test-name-pattern="$PAT" \
  test_env/tests/t287-c0-post-publication-failure.test.mjs > $D/mh-$NAME-$L.tap 2>&1
rc=$?
if grep -q 'heap out of memory' $D/mh-$NAME-$L.tap; then r=OOM; elif grep -q '^ℹ fail 0' $D/mh-$NAME-$L.tap; then r=PASS; else r=FAIL; fi
echo "$NAME $L $r rc=$rc" | tee -a $D/minheap.txt
