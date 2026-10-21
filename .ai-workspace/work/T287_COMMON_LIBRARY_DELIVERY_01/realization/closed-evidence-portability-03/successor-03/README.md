# Closed review-evidence transport, successor 03

The complete repository/archive-only verification passed. It covers 120,454
original source addresses, 132,879 original metadata rows, 2,197 distinct repository
byte routes, eight original packages with 26,371 members, 575 inert archive
objects, one ordered chunked file and all 35 declared source-field adapters.
The 7,030 exact exclusions comprise 7,029 recomputable V8 cache rows and one system
Node executable identity. Thirteen symlink relations and 7,073 directory relations
remain original metadata, not dereferenced payload or reconstructed runtime roots.

[The actual verification output](verification.stdout) and
[closed receipt](verification.receipt.json) record exit 0 in 103.794 seconds.
The verifier opened zero original absolute source paths, scanned zero original
trees and performed zero Product executions or owner acquisitions. It created no
new archive. This is byte/coverage verification, not independent L5 acceptance.

## Preserved construction and failure history

The successful population and 20 new archives reside in the immutable
[successor02 cut](../successor-02/stopped-freeze.json). They contain 1,007,934,270
new payload bytes in 120,156,719 compressed bytes, below the 2 GiB logical and
1 GiB compressed limits; each archive is below 90 MiB. Ten selected prior archive
routes are reused. Visible source and stage copies are separately preserved by
the full-tree checkpoint, regardless of deduplicated transport storage.

Two failed consumer adaptations remain explicit:

- [Successor01](../successor-01/stopped-freeze.json) treated native `symlinks`
  container rows as ordinary files and included an in-flight log in its proposed
  population closure. It wrote no archive. Successor02 used the known container
  meaning and froze completed data and command streams separately.
- [Successor02 verification](../successor-02/return-stopped.json) inherited an
  archive-object-only package consumer. The two new exact packages were already
  valid repository-file byte routes. Its population and packaging passed, but
  complete portable verification did not. No original evidence was missing.

This successor changes only that package consumer: the two pinned repository-file
routes use the existing safe relative repository resolution plus full hash/length
checks. Archive-object support remains. Undeclared kinds fail. Full raw package
hash/size, member name/hash/size/mode, ordered chunks and native coverage checks
remain. The [diff](verifier.diff) and [activation](activation.json) bind this scope.
There was no re-selection, repacking, extraction, source mutation or runtime retry.

## Review and re-execution boundary

Original absolute addresses, hashes, modes, native metadata and symlink targets
are review coordinates. They do not transfer original process identity, device or
inode authority, append ownership, event-prefix currentness, permissions or runtime
admission. The two package cache paths are exact versioned byte routes; they are
never ambient npm cache lookups. No provider executable or ambient credentials
are copied. Earlier failed Product cuts remain failed, and successful finite cuts
retain their own subjects and limitations.

The [checkpoint entry point](../../review-checkpoint-01/README.md) links current
status, public independent reviews and the later accepted design correction. The
library delivery and release gates remain closed. A complete executable environment
is not reconstructed here.

After obtaining the repository and its Git LFS payloads, run from its root:

```sh
python3 .ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/closed-evidence-portability-03/successor-03/verify-transport.py
```

The committed manifest binds local records and all required repository routes.
The full-tree staging check must also confirm the two exact package carriers and
all other repository dependencies are in the index. Original runtime paths are
never a verification fallback.
