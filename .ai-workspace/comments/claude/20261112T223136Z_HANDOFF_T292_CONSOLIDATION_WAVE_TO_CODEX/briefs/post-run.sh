#!/bin/zsh
# usage: suite-run.sh <out dir> <file...>   (runs in the abg-post worktree, one file at a time)
T=/private/tmp/abg-post/build_tenants/abiogenesis/typescript
OUT=$1; shift
mkdir -p $OUT /private/tmp/abg-post-tmp
cd $T
for f in "$@"; do
  start=$(date +%s)
  TMPDIR=/private/tmp/abg-post-tmp ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap test_env/tests/$f.test.mjs > $OUT/$f.tap 2>&1
  rc=$?
  end=$(date +%s)
  t=$(grep -E '^# tests ' $OUT/$f.tap | awk '{print $3}'); p=$(grep -E '^# pass ' $OUT/$f.tap | awk '{print $3}'); fl=$(grep -E '^# fail ' $OUT/$f.tap | awk '{print $3}'); s=$(grep -E '^# skipped ' $OUT/$f.tap | awk '{print $3}')
  echo "$f tests=$t pass=$p fail=$fl skip=$s rc=$rc secs=$((end-start))" >> $OUT/summary.txt
done
echo DONE >> $OUT/summary.txt
