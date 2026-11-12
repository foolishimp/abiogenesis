# TD-37c Return: one walker for the installed-tree and sandbox inventories

Writer: Claude Opus 5.5. Branch `claude/td37c-tree-walker` from `main` at
`b3bcb1303`, worktree `/private/tmp/abg-td37c` (sparse). Change class:
realization_refactor. No push, no tag. T = `build_tenants/abiogenesis/typescript`.
Line numbers marked "base" are at `b3bcb1303`.

**Status: complete, for review. `product/tree_inventory.ts` holds the one
recursive walk. The C2 Worker (parent), the file replace and the command helper
take their entries from it; the three copies are deleted. Over 17 trees (an
installed Product root of 5,889 entries, and trees for nesting, emptiness, the
three symlink cases, names that need escaping, dotted names, equal bytes and
hard links, a FIFO, an unreadable directory and file, and eight root
spellings) and one changed tree, each site's rows, serialized as the site
serializes them, its digest and every thrown error equal the base copy's:
51 site comparisons and 1 delta comparison, 0 differences. The walks per
operation are unchanged (C2 execution: 2 in the parent, 4 in the helper; file
replace: 2 per conservation root), and each walk reads each file once. The
helper's start-up closure gains 1 module (247 → 248) and its interleaved
median start-up time moves by less than 0.4%. All 488 base `.d.ts` files are
byte-identical and the public contract catalog digest is unchanged; no pin
moves. The 29 existing lane files keep their counts (249 / 235 / 0 / 14) and
the new lane passes on both builds. 162 source lines go and 135 come in: net
27 fewer. The three copies treat every entry the same way; they differ only in their root rule,
their refusal texts, their row shapes and their calling convention, and each
site keeps those (section 2). Nothing needs a ruling; one observation is
listed for the Executive (section 9).**

## 1. The walker and what each site takes from it

`code/src/product/tree_inventory.ts` (118 lines). Imports: `node:fs`,
`node:fs/promises`, `node:path`, `shared/digests`. It imports nothing from
`abg/` and is the only module it adds to the helper's start-up graph.

| Item | Line | What it is |
| --- | --- | --- |
| `TreeEntry` (`@internal`) | `:18` | `relativePath`, `nodeKind`, `symlinkTarget`, `byteLength`, `digest`, `fileIdentity` (`device:inode:links`), in that key order: the row the parent and the file replace record |
| `TreeWalkRefusals` (`@internal`) | `:31` | `rootRefusal` (optional) and `specialNodeRefusal`: each site's own texts |
| `walk`, `visit` | `:43`, `:55` | one generator: the root rule when `rootRefusal` is given, then the recursive visit. Each filesystem call is a yielded step |
| `callSync`, `callAsync` | `:82`, `:92` | the two step performers: `lstatSync`/`readdirSync(…, { withFileTypes: true })`/`readlinkSync`/`readFileSync`/`realpathSync`, and the same five from `node:fs/promises` |
| `walkTreeSync`, `walkTree` (`@internal`) | `:103`, `:112` | the two drivers: perform each step and resume the walk with its result; the async driver awaits one call at a time |

The walk visits a directory's entries in `localeCompare` order of their names;
for each entry it calls `lstat`, then `readlink` for a symlink or `readFile` for
a file, and recurses into a directory right after recording it. That is the
order of all three copies, call for call. A symlink is recorded with its target
text and never followed. Anything else throws the site's special-node text.

| Site | Base copy | Now | Takes from the walker |
| --- | --- | --- | --- |
| Parent `installedProductInventoryDigest` (exported, sync) | `implementation/worksite_command_execution.ts:302-356` | `:301-306` | `walkTreeSync` with the parent's two texts; digests the entries with `sha256Canonical` |
| File replace `installedProductInventory` (private, async) | `implementation/worksite_file_replace.ts:188-242` | `:187-192` | `walkTree` with its two texts; returns the entries as its rows |
| Helper `filesystemInventory` (private, async) | `implementation/worksite_command_helper.ts:395-448` | `:395-402` | `canonicalDirectoryRoot` (unchanged, helper `:142`), then `walkTree` with no root rule and its special-node text; derives one frozen `worksite_path_observation` per entry (`kind`, `schemaVersion`, `relativePath`, `nodeKind`, `digest`, `byteLength`, `symlinkTarget`) into a `Map` keyed by relative path |

The parent and the file replace already wrote the same row, so the walker's
entry is that row and neither site maps it. The helper's row has another kind
and no file identity, so the helper derives it. The helper keeps a local
`filesystemInventory` function: `t287-owned-process-lifetime` replaces that
binding in the helper's module scope, which an imported binding would refuse.

Ruling 3: one walk serves both conventions. The walk is written once as a
generator of filesystem steps; the synchronous driver performs a step with the
`node:fs` call the parent used and the asynchronous driver with the
`node:fs/promises` call the other two used, awaiting each before the next, as
the copies did. So the calls, their order, the point of each read relative to
the entry's `lstat`, and what a file changing during the walk meets are the
copies'. Each call site keeps its convention, and the file replace still walks
its conservation roots concurrently under `Promise.all` at its own call sites
(`:456`, `:504`). The file replace's function now returns the walker's
promise, and those call sites await it as before, so no ordering relative to
its other effects changes.

## 2. Differences between the copies, kept per site

The three copies treat every entry alike: order, symlinks (to a file, to a
directory, dangling, a loop), directories, files, equal bytes, hard links and
special nodes. They differ in the following, and each site keeps its own:

| Difference | Parent | File replace | Helper | How it is kept |
| --- | --- | --- | --- | --- |
| Root rule | `resolve`, `lstat`, then: not equal to its resolved form, a symlink, not a directory, or (last, only if the rest pass) `realpath` differs | the same rule | its own `canonicalDirectoryRoot`: `lstat`; a symlink or not a directory refuses; then `realpath` always; then lexical or physical difference refuses | `rootRefusal` for the parent and the file replace; the helper passes none and keeps `canonicalDirectoryRoot`, which `confinedExistingPath` also uses |
| Root refusal text | "installed Product root must remain canonical" | "installed Product root must be one canonical concrete directory" | "declared root must be one concrete directory", "declared root must be lexical- and physical-canonical" | `rootRefusal`; helper unchanged |
| `realpath` used by the root rule | `realpathSync` (the JavaScript implementation, which keeps the spelling of each name) | `fs/promises` `realpath` (the system call, which returns the name as stored) | `fs/promises` `realpath` | the sync driver calls `realpathSync`, the async driver `realpath`. On this case-insensitive volume a root spelled in another letter case (`trees/SMALL` for `trees/small`) is admitted by the parent and refused by the other two, before and after (section 3, tree `root-case`) |
| Special-node text | "installed Product inventory encountered a special node" | the same | "worksite inventory encountered a special filesystem node" | `specialNodeRefusal` |
| Output | digest of the rows | the rows, compared across roots with `canonicalEquals` | frozen path observations in a `Map`, no file identity | each site's own code |
| Convention | synchronous | asynchronous, roots in parallel | asynchronous | the two drivers; call sites unchanged |

## 3. The differential

Script: `/private/tmp/abg-td37c-work/diff/differential.mjs`; trees:
`/private/tmp/abg-td37c-work/diff/make-trees.mjs`; report:
`/private/tmp/abg-td37c-work/diff/differential-after.json` (the base-against-base
run, `self-base.json`, checks that the harness is deterministic: 0 differences).
Each site's function is linked from its own built module (base `b3bcb1303`
snapshot and the final build) in a VM with an export appended, so each copy
runs in its own module scope with its own imports; the parent's rows are
captured from its one `sha256Canonical` call. Compared per site and tree:
rows as JSON (key order kept) and as canonical JSON, their digest, for the
helper the `Map` order, key-to-path equality and `Object.isFrozen` per row,
and for an error its constructor, name, message, code, errno, syscall, path and
`String(error)` (the file replace records `String(error)` and `error.code`
after its effect).

| Tree | Entries | Parent | File replace | Helper | Equal (P/F/H) |
| --- | --- | --- | --- | --- | --- |
| `installed` (packed tenant, extracted) | 5,889 (5,308 files, 581 directories) | digest `cfcc4d21b6ff…` | same rows, same digest | `d6a76f61aa7a…`, all frozen | yes/yes/yes |
| `small` (nesting, an empty file, an empty directory) | 8 | ok | ok | ok | yes/yes/yes |
| `empty` | 0 | ok | ok | ok | yes/yes/yes |
| `links` (to a file, to a directory, dangling, a loop, an odd target text) | 8 | ok | ok | ok | yes/yes/yes |
| `names` (quote, backslash, newline, tab, control character, NFC and NFD, emoji, space, `...`, `..x/f`, `..y`, `.hidden`, locale-order names) | 28 | ok | ok | ok | yes/yes/yes |
| `equal` (two files with equal bytes, a hard-link pair) | 4 | ok | ok | ok | yes/yes/yes |
| `fifo` | — | special node | special node | special filesystem node | yes/yes/yes |
| `unreadable-dir` | — | `EACCES` scandir | `EACCES` scandir | `EACCES` scandir | yes/yes/yes |
| `unreadable-file` | — | `EACCES` open | `EACCES` open | `EACCES` open | yes/yes/yes |
| `root-missing` | — | `ENOENT` lstat | `ENOENT` lstat | `ENOENT` lstat | yes/yes/yes |
| `root-relative` (`trees/small`) | — | root refused | root refused | lexical/physical | yes/yes/yes |
| `root-trailing-slash` | — | root refused | root refused | lexical/physical | yes/yes/yes |
| `root-dotdot` (`small/../small`) | — | root refused | root refused | lexical/physical | yes/yes/yes |
| `root-file` | — | root refused | root refused | not a directory | yes/yes/yes |
| `root-symlink` | — | root refused | root refused | not a directory | yes/yes/yes |
| `root-via-tmp` (`/tmp` alias) | — | root refused | root refused | lexical/physical | yes/yes/yes |
| `root-case` (`trees/SMALL`) | 8 | admitted, digest equals `small`'s | root refused | lexical/physical | yes/yes/yes |

Delta: a copy of `small` is walked by every site of both builds, changed (one
file rewritten, one created, one deleted, one file replaced by a symlink, one
directory created), and walked again. Each build's own `worksiteDelta` gives
the product delta (5 rows) and a sandbox delta with one subtree territory; the
two builds' canonical bytes are equal, the parent's before and after digests
are equal between builds, and so are the file replace's rows. 0 differences.

The parent and the file replace give the same digest on every tree both admit:
they record the same row.

## 4. Walks per operation (ruling 5)

Probe: `/private/tmp/abg-td37c-work/probe/walk-probe.mjs`, preloaded with
`--import` in every process of the operation (`NODE_OPTIONS`). It wraps
`readdir`, `lstat`, `readlink`, `readFile` and `realpath` (sync, callback and
promise forms) and records each call whose stack passes through one of the
three site functions or the walker's drivers; a walk is a recorded `readdir`
whose parent directory no recorded `readdir` of that process read. Counter:
`count-walks.mjs`. Outputs: `c2-{before,after}.counts.json`,
`replace-{before,after}.counts.json` in the same directory.

One C2 command execution (`probe-c2.mjs`: the fixture of
`t287-observed-worksite-command`'s zero-write case, a Product root holding the
extracted packed tenant, the parent's preparation, the built helper process,
then the parent's completion, which walks before its exchange check):

| Process | Build | Walks, in order | `readdir` | `lstat` | `readFile` | `realpath` |
| --- | --- | --- | --- | --- | --- | --- |
| Parent | base | product → product | 1,164 | 11,780 | 10,616 | 2 |
| Parent | final | product → product | 1,164 | 11,780 | 10,616 | 2 |
| Helper | base | product → sandbox → sandbox → product | 1,166 | 11,784 | 10,618 | 4 |
| Helper | final | product → sandbox → sandbox → product | 1,166 | 11,784 | 10,618 | 4 |

The helper's artifact is `success` with an empty product and worksite delta on
both builds, and the parent's after-digest equals its before-digest (it
reaches the exchange check, which the probe's empty exchange fails).

File replace, through `t287-post-binding-worksite-write` (2 tests, 4 file
replaces, one conservation root: the installed tenant):

| Build | Sequence | Walks | `readdir` | `lstat` | `readFile` | `realpath` |
| --- | --- | --- | --- | --- | --- | --- |
| base | walk, effect, walk walk, effect, walk walk, effect, walk walk, effect, walk | 8 | 4,656 | 47,120 | 42,464 | 8 |
| final | the same | 8 | 4,656 | 47,136 | 42,480 | 8 |

Each file replace walks its root once before and once after its effect on both
builds. The installed tenant in this lane is the lane's own build, so the final
one holds 2 more files (`product/tree_inventory.js` and `.d.ts`): 5,310 files
per walk against 5,308, each read once (42,480 = 8 × 5,310; 42,464 = 8 × 5,308).

## 5. Helper start-up (ruling 6)

Method as TD-37b (`/private/tmp/abg-td37c-work/startup/startup.mjs`,
`startup-ab.mjs`): static closure from the built helper; runtime closure from a
resolve hook; time of `node worksite_command_helper.js` with no arguments.

| | Before | After |
| --- | --- | --- |
| Static relative modules | 247 | 248 |
| Runtime build modules | 247 | 248 |
| Runtime package modules | 156 | 156 |
| Added | — | `product/tree_inventory.js` only |

Interleaved runs, 40 rounds each, base snapshot first and second in turn:

| Pair | Base median | After median | Change | Load (1-minute, start → end) |
| --- | --- | --- | --- | --- |
| base snapshot vs after snapshot, same layout | 341.6 ms | 340.8 ms | −0.22% | 12.38 → 12.30 |
| base snapshot vs worktree build | 346.4 ms | 347.7 ms | +0.38% | 12.30 → 13.40 |
| same layout, repeated | 340.3 ms | 339.3 ms | −0.29% | 13.40 → 12.47 |

The machine is shared with other Writers. The bound (5 modules, 10%) holds.

## 6. Bytes, declarations and pins

- `product/worksite_command_execution.ts` is unchanged and its built `.js` is
  byte-identical (sha256 `d59c28acaaadf3009550cdcc00ebe71084c33de9272fade3e419a08637bb0876`,
  114,139 bytes). The C2 renderer pin in `gtl/worksite_command_execution.ts`
  (`:37`, `:39`, `:61`: that digest, byteCount 114139, span 105408–107840,
  spanDigest `sha256:1fcd71846ed7a57571a96bf3bb6475aeaba3d4f89eafb121969c157904a896bf`)
  stays; no repin. No file under `code/src`, `contracts`, `test_env/fixtures`
  or `test_env/tests` names the sha256 of any of the three changed built
  implementation modules.
- All 488 base `.d.ts` files are byte-identical. One is added,
  `product/tree_inventory.d.ts`, which is `export {};` (every export is
  `@internal`). `installedProductInventoryDigest` keeps its signature.
- The helper's recorded bytes: its product-delta and sandbox-delta rows are
  derived from the same entries in the same order with the same fields
  (section 3); the artifact constructor is untouched.

## 7. Lanes

Command from T, one file at a time:
`mkdir -p /private/tmp/abg-td37c-tmp && TMPDIR=/private/tmp/abg-td37c-tmp ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap test_env/tests/<file>.test.mjs`.
Files: the brief's list without the two retired forward-command files; every
file that names one of the three functions (`t287-owned-process-lifetime`);
and every file that names the helper or file-replace module or the helper's
product delta. Counts are tests / pass / fail / skip.

| File | Before | After |
| --- | --- | --- |
| `t292-td37a-worksite-subject` | 16 / 16 / 0 / 0 | 16 / 16 / 0 / 0 |
| `t292-td37b-launch-identity` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 |
| `t292-td37a-path-relation` | 6 / 6 / 0 / 0 | 6 / 6 / 0 / 0 |
| `t287-observed-worksite-command` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 |
| `t287-generic-job-worksite` | 9 / 9 / 0 / 0 | 9 / 9 / 0 / 0 |
| `t287-owned-process-lifetime` | 34 / 34 / 0 / 0 | 34 / 34 / 0 / 0 |
| `t287-qual056-material` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 |
| `r2-clean-install` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-worksite-command-execution` | 13 / 13 / 0 / 0 | 13 / 13 / 0 / 0 |
| `t287-c2-core-environment` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `steel-basic-cli-c2` | 6 / 0 / 0 / 6 | 6 / 0 / 0 / 6 |
| `t287-default-library-fulfillment` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t287-default-library` | 35 / 34 / 0 / 1 | 35 / 34 / 0 / 1 |
| `t287-worksite-branch-construction` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t287-post-binding-worksite-write` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t287-wave2-installed-product-verification` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `d2-binding-transition` | 10 / 10 / 0 / 0 | 10 / 10 / 0 / 0 |
| `m5-worker-transport` | 39 / 39 / 0 / 0 | 39 / 39 / 0 / 0 |
| `t287-declared-testing-capability` | 5 / 3 / 0 / 2 | 5 / 3 / 0 / 2 |
| `t287-generic-job-read-dependency` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-generic-job-revision` | 2 / 1 / 0 / 1 | 2 / 1 / 0 / 1 |
| `t287-lifecycle-failure-carrier` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 |
| `t287-live-worksite-construction` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-native-work-currentness-consumers` | 6 / 6 / 0 / 0 | 6 / 6 / 0 / 0 |
| `t292-binding-row-owner-differential` | 5 / 5 / 0 / 0 | 5 / 5 / 0 / 0 |
| `t292-td36r-remaining-owners` | 6 / 6 / 0 / 0 | 6 / 6 / 0 / 0 |
| `w2-steel-serial-branch-installed` | 2 / 0 / 0 / 2 | 2 / 0 / 0 / 2 |
| `w2-steel-single-start-installed` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-worksite-construction` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |

The 29 existing files give the same counts before and after: 249 tests, 235
pass, 0 fail, 14 skip on both builds. The skips are the same cases on both
builds, each gated by an unset variable: a live model command or run (no model
call was made), a frozen artifact, or a C2 carrier fixture path. They include
all six cases of `steel-basic-cli-c2` and the installed steel threads. No case
timed out or was cancelled, so no rerun was needed. The known reds the brief names
are not in this set and none appeared.

### New lane

`test_env/tests/t292-td37c-tree-walker.test.mjs`, 3 tests. It passes 3/3 on
the `b3bcb1303` build (`ABG_WORKSITE_BUILD_ROOT` set to that build) and 3/3 on
the final build. Its expected values come from the lane's own `lstat`, the
bytes it wrote and its own canonical JSON, never from the walker.

1. One small tree (a dotted name, `a.txt` before `B.txt` by `localeCompare`,
   equal bytes, a dangling symlink, a symlink to a directory that is not
   followed, a nested and an empty directory): the parent's digest, the file
   replace's rows with their key order, and the helper's frozen rows, `Map`
   order and digest.
2. The helper's product delta for one change of that tree (a rewritten, a
   deleted and a created file and a re-pointed symlink), row for row.
3. Each site's refusal text for a FIFO, for a symlink root, a file root, a
   trailing separator and a `..` spelling, and `ENOENT` from `lstat` for an
   absent root.

A mutation check: with the walker's comparator changed to code-unit order in
a copy of the final build, test 1 fails.

### Checks

`npm run build`, `npm run lint:imports` (3 forbidden owner pairs hold),
`lint:lifecycle` (284 modules, no offender) and `lint:calculus` (no offender)
pass on the final source.

## 8. Identity after the final build

Generated files are restored to their `b3bcb1303` bytes before each commit;
none is committed.

| Identity | Base `b3bcb1303` | Final build |
| --- | --- | --- |
| `productContentDigest` | `sha256:52e13fdc162e1c648e1b8c2c963debc16e26afb4ac77470e7dac9b75ca452f99` | `sha256:9b5e424ca8253014e5213f918a18d8ceb4b7661d81deb679171583debdae5de6` |
| `contributionManifestDigest` | `sha256:5f5e27d41c18fd2ff303410fee7fd99e8f5ce9ae8c7601dead583891865be679` | `sha256:b5a597383d748d13467e8b5cefb411c10a2cb74ecedcab4de6588b594b84112d` |
| `publicContractCatalog.catalogDigest` | `sha256:e19931bd2c363bec559bb56c31913ec4d551c574a714f97567a55a7e941d5429` | unchanged |
| capability graph `graphDigest` | `sha256:ade661144125992e920b6bf59b83b54e5fc963f60d96f88074f6ea48a65b5300` | `sha256:bcd5741ed63c33923c024c0a182480e3e5ded42aacfae39612d49c8e495a57d9` |
| Product-relative locators | 5,306 | 5,308 |
| `product-toolchain-manifest.json` sha256 | `5802a5f6fd5dce39af8fea6e74f32d1199ad12883c3f52b151c1046452f89bc0` | `0bc76fbeae6cd8d7614c408ef7b0d5a27048766110fb447e42fb9a7f4676a36b` |
| `contracts/capabilities/capability-definition-graph.json` sha256 | `ec5e6e3b8123d84ed01b3e96539f94617dbf060df112f6967f3c47edf55fa163` | `1024923b8f335f2ad8bca1a4cc030aac1ed32f531a8616fa6e0809bfa3039f6b` |
| `contracts/worksite/command-execution-context.inventory.json` sha256 | `9e61bdf4adf1b0489d814a579cad555272c37fe4d84efe5cd9f1f686ba886ed1` | unchanged |
| `test_env/fixtures/abi5-root-candidate-basis.json` sha256 | `e9340357ecd698c2d96e3855344c6bfc8e8ec2a31765fcc30c0f997f9e565592` | unchanged |

## 9. Size, deviations, residuals

`git diff --numstat b3bcb1303 HEAD -- build_tenants/abiogenesis/typescript/code/src`
after the source commit:

| File | Added | Deleted |
| --- | --- | --- |
| `implementation/worksite_command_execution.ts` | 5 | 55 |
| `implementation/worksite_command_helper.ts` | 6 | 51 |
| `implementation/worksite_file_replace.ts` | 6 | 56 |
| `product/tree_inventory.ts` (new) | 118 | 0 |
| Total | 135 | 162 |

Deviations:

1. **Size.** The brief expected about 120 lines to go; 162 go and 135 come in,
   27 fewer net. The walker serves a synchronous and an asynchronous site, so
   it carries the step generator, the two step performers and the two drivers
   (about 35 lines) instead of one recursion, and its two types and comments
   (about 30 lines).
2. **The parent and the file replace take the entry as their row.** Ruling 1
   has each site derive its own row. These two sites recorded the same row, so
   the walker's entry has that shape and order and they use it unmapped; the
   helper derives its own. A separate mapping function for the two would add
   lines and change nothing.
3. **The file-replace walk count comes from a lane, not a single operation.**
   `t287-post-binding-worksite-write` runs four file replaces; the sequence in
   section 4 shows two walks around each owner effect. The probe was extended
   after a final-build run counted no file-replace walks, to recognize the
   walker's drivers: the file
   replace returns the walker's promise without awaiting it, so after its
   first call the site's name is not on the asynchronous stack. The base build
   has no such frames, so its counts stand as first taken.
4. **The lane list.** `forward-command-contracts` and `forward-command-owners`
   no longer exist (TD-28d). Added beyond the brief: the files that name the
   helper or file-replace module or the product delta (section 7).

Observation for the Executive (not a stop, no ruling needed for this package):
the parent's root rule admits a Product root spelled in another letter case on
a case-insensitive volume, because `realpathSync` keeps the spelling, where the
file replace and the helper refuse it (section 2). This package keeps it.
Workspace create and open take the canonical root from the system `realpath`
(`product/workspace_operations.ts:525`, `:589`); whether every binding's
Product root comes from it was not traced.

Residuals:

1. The number of walks is unchanged: one C2 execution walks the Product root
   four times and the sandbox twice, and each file replace walks each
   conservation root twice. Fewer walks is the design_reframe the register
   names.
2. The leaf-authority gate (TD-37's last part) is untouched.

## 10. Commits

| Commit | Content |
| --- | --- |
| `c5eacfaab` | TD-37c: one walker for the installed-tree and sandbox inventories (source and lane) |
| this commit | TD-37c Return |

Generated files (`contracts/`, `product-toolchain-manifest.json`,
`test_env/fixtures/abi5-root-candidate-basis.json`) are restored to their
`b3bcb1303` bytes before each commit. Scratch evidence (trees, differential,
probe and counts, start-up measurements, base and final build snapshots, lane
TAP files) is under `/private/tmp/abg-td37c-work/`.
