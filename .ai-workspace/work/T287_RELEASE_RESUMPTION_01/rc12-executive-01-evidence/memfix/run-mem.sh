#!/bin/zsh
# usage: run-mem.sh <tenant-dir> <name> [pattern] [snap-indexes]
T=$1; NAME=$2; PAT=${3:-'^B04-0[16] '}; SNAP=${4:-}
D=/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/5e4c25c3-fca5-4dd6-89e7-20d55d008bdf/scratchpad/memfix
rm -f $D/$NAME.jsonl
mkdir -p $D/snap-$NAME
cd $T && TMPDIR=/private/tmp/abg-mem-tmp MEM_OUT=$D/$NAME.jsonl MEM_SNAP=$SNAP MEM_SNAP_DIR=$D/snap-$NAME \
  node ${=NODE_EXTRA} --expose-gc --experimental-vm-modules --import $D/mem-preload.mjs --test-name-pattern="$PAT" \
  test_env/tests/t287-c0-post-publication-failure.test.mjs > $D/$NAME.tap 2>&1
echo "exit $?" >> $D/$NAME.tap
