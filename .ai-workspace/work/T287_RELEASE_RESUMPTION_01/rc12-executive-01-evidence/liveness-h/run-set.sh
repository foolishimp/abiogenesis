#!/bin/zsh
# usage: run-set.sh <tag> <file-stem>...   runs each test file alone, sequentially, in T.
tag=$1; shift
T=/private/tmp/abg-rc12-liveness-20261111/build_tenants/abiogenesis/typescript
H=/private/tmp/abg-rc12-liveness-20261111/qualification-scratch/rc12-executive-01/h
OUT=$H/$tag
mkdir -p $OUT /private/tmp/abg-heartbeat-tmp
cd $T
for stem in "$@"; do
  file=test_env/tests/$stem.test.mjs
  start=$(date +%s)
  ABI5_HS03_STREAM_METADATA=$H/oracle/hs03-metadata.json TMPDIR=/private/tmp/abg-heartbeat-tmp node --experimental-vm-modules --test --test-concurrency=1 $file > $OUT/$stem.txt 2>&1
  code=$?
  echo "$stem exit=$code secs=$(( $(date +%s) - start )) $(grep -E '^ℹ (tests|pass|fail|skipped|cancelled) ' $OUT/$stem.txt | tr '\n' ' ')" >> $OUT/SUMMARY.txt
done
echo DONE >> $OUT/SUMMARY.txt
