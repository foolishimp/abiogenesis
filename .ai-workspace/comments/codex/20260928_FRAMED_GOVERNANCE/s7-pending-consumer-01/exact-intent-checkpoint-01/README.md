# Frozen continuation checkpoint

The two archive parts retain all 587 selected members byte-for-byte: both exact-intent proof manifests, their controlling records, and the final source/generated snapshot. Expanded size is 936,133,403 bytes; compressed size is 66,911,848 bytes. `archive-receipt.json` gives the exact part, complete archive, and member digests. All members were verified after extraction; the compressed encoding was checked against the same verified tar bytes.

From this directory, extract into a **fresh empty directory**, never over a working checkout:

```sh
mkdir /private/tmp/abg-continuation-checkpoint-review
cat frozen-evidence.tar.zst.part-* | zstd -d --long=27 | tar -xf - -C /private/tmp/abg-continuation-checkpoint-review
```

The archive uses original repository-relative member paths. Original local proof members remain unchanged. The archived subjects preserve their own failure/readiness dispositions; this packaging supplies no additional test, review, live LLM, or release credit.
