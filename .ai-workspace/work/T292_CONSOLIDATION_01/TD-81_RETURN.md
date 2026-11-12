# TD-81 Return: the tree walk orders names by code units and takes the stored spelling of its root

Writer: Claude Opus 5.5. Branch `claude/td81-walk-order-and-root` from local `main` at `7102112b2`,
worktree `/private/tmp/abg-td81` (sparse). Change class: realization_refactor.
No push, no tag. T = `build_tenants/abiogenesis/typescript`. Scratch evidence
is under `/private/tmp/abg-td81w-work/`.

**Status: complete, for review. The walk in `product/tree_inventory.ts` and the
command helper's delta and report walk order names with
`compareUnicodeCodeUnits`; the walk's root rule calls `realpathSync.native` in
the synchronous driver. Under `LC_ALL=sv_SE.UTF-8`, `LC_ALL=tr_TR.UTF-8` and no
locale variable, each site gives equal rows and digest on the final build and
different ones on the base. The C2 Worker, the file replace and the helper give
one verdict on each of the 13 root spellings. The C2 Worker now refuses a Product
root in another letter case or normalization form before it writes the launch
manifests, with its existing refusal "installed Product root must remain
canonical". No reader changes: the base and final builds accept the same 74 of
161 recorded helper artifacts and refuse the same 87 for the same reason. The
87 come from `5.0.0-rc.1` (79), `5.0.0-rc.2` (4), `5.0.0-rc.3` (3) and
`5.0.0-dev.286` (1); none comes from `5.0.0-rc.12` or from a build of this wave.
For a tree of ASCII lower-case and digit names the helper's artifact is
byte-identical on the base and final builds. The helper's start-up closure is
unchanged (247 modules). Every base `.d.ts` file is byte-identical. The 32
existing lane files give 257 / 243 / 0 / 14 (tests / pass / fail / skip) before
and after; the new lane gives 7 / 7 on the final build and 1 / 7 on the base;
ten more files that reach the changed code through a support file give
77 / 75 / 0 / 2 on the final build.
Nothing needs a ruling; section 9 lists two observations. Both commits carry
`Co-Authored-By: Claude Opus 5.5`, not the brief's Claude Fable 5.2, because
this Writer runs as Opus 5.5; reword on merge if the brief's line is wanted.**

## 1. The change

| Site | File and line (final) | Before | After |
| --- | --- | --- | --- |
| The walk (C2 Worker, file replace, helper inventories) | `code/src/product/tree_inventory.ts:64` | `listed.sort((left, right) => left.name.localeCompare(right.name))` | `listed.sort((left, right) => compareUnicodeCodeUnits(left.name, right.name))` |
| The helper's delta: the union of paths before and after | `code/src/implementation/worksite_command_helper.ts:411` | `.sort((left, right) => left.localeCompare(right))` | `.sort(compareUnicodeCodeUnits)` |
| The helper's walk of report files (`walkFiles`) | `code/src/implementation/worksite_command_helper.ts:885` | `entries.sort((left, right) => left.name.localeCompare(right.name))` | `entries.sort((left, right) => compareUnicodeCodeUnits(left.name, right.name))` |
| The walk's root rule, synchronous driver (C2 Worker) | `code/src/product/tree_inventory.ts:94` | `realpathSync(step.path)` | `realpathSync.native(step.path)` |

`compareUnicodeCodeUnits` is the tenant's comparison (`shared/canonical_json.ts:9-11`):
JavaScript's `<` on strings, one UTF-16 code unit at a time, which no locale
changes. `tree_inventory.ts` imports it (`:5`); the helper adds it to its
existing `canonical_json.js` import (`:34`).

`realpathSync.native` asks the operating system, as the asynchronous driver's
`fs/promises` `realpath` already did, and returns the name as the volume stores
it. The JavaScript `realpathSync` keeps the letters it is given, so the C2
Worker admitted a root spelled in another letter case or Unicode normalization
form on a volume that ignores both (macOS APFS), where the file replace and the
helper refused it.

Comments: the module comment (`:8-16`) no longer says each site keeps its own
root rule; it says the C2 Worker and the file replace use the walk's rule, the
helper its own, and each takes the stored spelling from the system `realpath`.
The `TreeWalkRefusals` comment (`:31-35`) names the system `realpath` and the
stored spelling. The walk's comment (`:45-48`) states code-unit order in place of
`localeCompare` order.

No reader gains a check of the order (ruling 3). `isPathDelta`,
`isWorksiteExecutionHelperArtifact` and `isWorksiteExecutionObservation` are
untouched: `product/worksite_command_execution.ts` is unchanged, and its built
`.js` is byte-identical on both builds (sha256
`d59c28acaaadf3009550cdcc00ebe71084c33de9272fade3e419a08637bb0876`, 114,139
bytes). That is the module the C2 renderer pin names
(`gtl/worksite_command_execution.ts:37`, `:39`), so the pin holds and needs no
repin. The built `implementation/worksite_command_execution.js` and
`implementation/worksite_file_replace.js` are byte-identical too. No file under
`code/src`, `contracts`, `test_env/fixtures`, `test_env/tests`,
`test_env/support` or `test_env/qualification` names the sha256 of the base
`tree_inventory.js` or `worksite_command_helper.js`.

## 2. The root rule on 13 spellings, and where the C2 Worker refuses (ruling 2)

Each site's own built function ran on one directory spelled 13 ways (the
trace's list), on this APFS volume, which ignores letter case and normalization
form (script `/private/tmp/abg-td81w-work/root/root-table.mjs`; the lane case of
section 4 asserts the same verdicts). "Canonical" abbreviates each site's root
text: the C2 Worker's "installed Product root must remain canonical", the file
replace's "installed Product root must be one canonical concrete directory",
the helper's "declared root must be lexical- and physical-canonical" or "declared
root must be one concrete directory".

| Spelling | C2 Worker, base | C2 Worker, final | File replace, both | Helper, both |
| --- | --- | --- | --- | --- |
| stored spelling | admitted | admitted | admitted | admitted |
| last component in another case | **admitted** | refused, must remain canonical | refused | refused, lexical- and physical-canonical |
| an ancestor in another case | **admitted** | refused, must remain canonical | refused | refused, lexical- and physical-canonical |
| first component in another case (`/PRIVATE/…`) | **admitted** | refused, must remain canonical | refused | refused, lexical- and physical-canonical |
| composed name, given composed | admitted | admitted | admitted | admitted |
| composed name, given decomposed | **admitted** | refused, must remain canonical | refused | refused, lexical- and physical-canonical |
| through a symlinked ancestor | refused | refused | refused | refused, lexical- and physical-canonical |
| the root is a symlink | refused | refused | refused | refused, one concrete directory |
| trailing separator | refused | refused | refused | refused, lexical- and physical-canonical |
| a `..` segment | refused | refused | refused | refused, lexical- and physical-canonical |
| a repeated separator | refused | refused | refused | refused, lexical- and physical-canonical |
| a relative path | refused | refused | refused | refused, lexical- and physical-canonical |
| firmlink spelling (`/System/Volumes/Data/private/tmp/…`) | admitted | admitted | admitted | admitted |

On the final build the three sites give one verdict on every spelling. Only the
C2 Worker's column moves, on the four spellings in bold, and the file replace
and the helper do not change.

Where the C2 Worker refuses (run, `/private/tmp/abg-td81w-work/bytes/probe-dispatch.mjs`):
a binding whose Product root is spelled `…/PRODUCT` over the stored directory
`…/product`, one observed C2 task, and `realizeWorksiteCommandExecution` of each
build.

| Build | Outcome of the preparation | Attempt directory afterwards |
| --- | --- | --- |
| base | a prepared invocation with its Worker request | exists, holding `launch.json` and `task.json` |
| final | `TypeError: installed Product root must remain canonical` | absent |

The refusal is the walk's existing root refusal for the C2 Worker
(`implementation/worksite_command_execution.ts:301-306`), thrown at the
before-walk (`:529`), before `materializeExecutionManifests` (`:533`) and before
the Worker request is returned. It is the same refusal, at the same point, that a
Product root reached through a symlinked ancestor meets today. The leaf port
records a throw from preparation as an undispatched owner receipt with failure
class `implementation_exception`, stage `preparation`, reason `thrown`
(`implementation/leaf_invocation_port.ts:766`), so no Worker call is made (read;
I did not run the port). On the base build the same root passes the
preparation, the Worker call runs, the helper refuses the root at its first
Product inventory, and the C2 call ends in `helper_artifact_absent` (`:601`;
the trace's reading, not rerun here).

The recorded roots: the 161 readable `task.json` files of the trace's list carry
513 distinct root name and path pairs. 489 still exist, all in their stored
spelling; 24 no longer exist (run, a copy of the trace's `scan-roots.mjs`). No
kept lane and no recorded task uses a root the new rule refuses.

## 3. Other `localeCompare` and comparator-free sorts

By the language's definition, `Array.prototype.sort()` with no comparator
converts each element to a string and compares UTF-16 code units, so on strings
it is code-unit order already and no locale changes it. Only a comparator-free
sort of numbers would misorder (10 before 9). None of the sorts below changed.

### `localeCompare` outside the three sites (7 sites)

| Site | What it orders | Order recorded or digested? |
| --- | --- | --- |
| `validator/qualification.ts:156`, `:159` | the recipe's protected inputs and the task's protected observations, by relative path, both sides sorted the same way and compared with `canonicalEquals` in one process | no. Two paths that collate equal (a soft hyphen, or a composed and a decomposed letter) keep their input order, so the two sides could disagree on such a pair and raise `verification_source_inventory_mismatch` |
| `validator/qualification_resources.ts:267` | the interned qualification scope's `referenceSets`, by `setRef` | **yes**: the list enters `constructQualificationIdentity`, so the scope digest covers its order. Each `setRef` is `qualification-set://abiogenesis/` and lower-case hex, which en-US, sv-SE, tr-TR and code units order alike |
| `abg/worker_transport.ts:962` | the Worker environment's keys (`exactEnvironment`) | no: the object goes to the spawn, and its digest (`environmentDigest`, `:1069`) is `sha256Canonical`, which orders keys by code units |
| `implementation/release_publication.ts:44` | git ref rows (`rows`), by ref name | **yes**: the remote rows are recorded as `predecessorRefs` in the release record (`:113`). The rows kept are the `v5.0.0` tags, refs ending in `/v5.0.0` or `/v5.0.0-rc.*`, and the grant's carrier refs; a ref with a capital letter or an underscore orders differently under en-US than under code units (`refs/heads/Main` against `refs/heads/feature`, `td81-x` against `td81_x`; run) |
| `implementation/release_publication.ts:85` | the grant's expected local and remote refs, sorted to compare with the rows above | no: a comparison in one process |
| `scripts/generate-product-manifest.mjs:1000` | the contribution manifest's `publicationBindings`, by `moduleRef` | **yes**: it feeds `contributionManifestDigest`, so the build itself orders by its process's locale. The present eight refs order the same under en-US, sv-SE, tr-TR and code units (run), so today's identity does not depend on it |

### Comparator-free `.sort()` (108 sites in `code/src` and `scripts`)

Every one of the 108 sorts strings (keys, refs, paths, names); none sorts
numbers. So every one is code-unit order, the order this package gives the three
sites. They fall into three groups:

- 43 compare an object's own keys or a name set with a declared list (for
  example `shared/admit/record.ts:21-22`, `abg/c_call.ts:338-339`,
  `abg/retry_progress.ts:129-155`). Nothing is recorded.
- 30 order two sides of a comparison, or a traversal, inside one process (for
  example `validator/qualification.ts:107-108`, `:205`, the judge's set
  comparison; `product/environment.ts:660`, `:667`, `:729`, which require
  recorded lists to be in code-unit order; `product/install_product.ts:117`,
  `:150`; the three lint scripts). Nothing is recorded in that order.
- 35 order a value that is returned, recorded or digested:

| Site | What it orders |
| --- | --- |
| `validator/qualification.ts:105` | the test files of a qualification result |
| `shared/public_function_contracts.ts:701` | the issue paths of a contract refusal |
| `shared/public_function_contracts.ts:773` | the keys of a rebuilt JSON schema object |
| `validator/conformance_operation.ts:313` | the contract refs of a conformance failure |
| `product/native_workspace_work.ts:137` | a native work observation's `changedPaths` (its reader requires code-unit order, `sortedPaths`) |
| `product/worksite_operations.ts:1148` | a directory's members in a worksite context observation (its reader requires code-unit order) |
| `product/verify_product.ts:2129` | the payload inventory, by locator |
| `product/verify_product.ts:2596`, `:2597` | a verified Product row's `publicContractRefs` and `publicCapabilityRefs` |
| `product/install_product.ts:134`, `:169` | the installed payload file list and its inventory |
| `product/declaration_exports.ts:1856`, `:2531` | a module's exported symbols; the declaration closure's `rootNames` |
| `product/environment_operation_contracts.ts:340` | the issue paths of a refusal |
| `product/semantic_job.ts:557` | the expected binding version refs named in an issue |
| `abg/fh_continuation_projection.ts:344` | the relevant event ids of a continuation projection |
| `abg/retry.ts:3240` | `sortedUnique`, used for recorded ref lists |
| `abg/project_read_ports.ts:738`, `:1430` | run ids at a prefix; a read's evidence refs |
| `abg/effectful_invocation_truth.ts:107` | event refs |
| `abg/artifact_truth.ts:662`, `:668`, `:756`, `:758` | conflicting fields and event refs of an artifact truth conflict or row |
| `abg/invocation_execution_truth.ts:633` | invalid event refs |
| `abg/replay.ts:464` | fluent keys of a quiescence result |
| `implementation/leaf_execution_authority.ts:399` | the conservation roots of a worksite leaf |
| `gtl/default_library.ts:287` | the frame refs of a default-library role |
| `scripts/product-payload.mjs:69`, `:107`, `:125`, `:157` | bundled dependency locators and the payload members |
| `scripts/generate-qualification-rule-catalog.mjs:19`, `:33` | standard files and paths of the generated rule catalog |
| `scripts/generate-product-manifest.mjs:317` | directory entries of the payload walk |

The other 73, by group (paths under `code/src` unless they start with
`scripts/`):

- Keys or a name set against a declared list (43):
  `validator/conformance_operation.ts:87`, `:88`;
  `product/catalog_operation_contracts.ts:178`, `:179`;
  `shared/admit/record.ts:21`, `:22`, `:35`, `:36`;
  `product/semantic_revision.ts:71`, `:171`, `:174`, `:242`, `:244`;
  `product/worksite_preparation_contracts.ts:166`, `:179`;
  `product/verify_product.ts:577`, `:578`; `abg/retry.ts:568`, `:575`;
  `abg/witness_admission_operation.ts:285`, `:286`;
  `abg/project_read_ports.ts:212`, `:213`;
  `abg/probabilistic_result.ts:148`, `:149`;
  `abg/retry_progress.ts:129`, `:133`, `:140`, `:143`, `:150`, `:155`;
  `abg/c_call.ts:338`, `:339`, `:3669`, `:3670`, `:6399`;
  `product/semantic_job.ts:49`; `abg/event_store.ts:2800`, `:2801`;
  `abg/actor_process.ts:293`, `:297`;
  `implementation/leaf_invocation_port.ts:176`, `:177`.
- Two sides of a comparison, or a traversal, in one process (30):
  `validator/qualification.ts:107`, `:108`, `:205`, `:264`;
  `shared/public_function_contracts.ts:758`;
  `product/stdo_environment.ts:178`;
  `product/environment.ts:660`, `:667`, `:729`;
  `product/worksite_operations.ts:1157`;
  `product/verify_product.ts:1243`, `:2104`, `:2105`, `:2540`;
  `product/install_product.ts:117`, `:150`;
  `product/environment_operation_contracts.ts:243`, `:246`, `:261`, `:262`;
  `abg/stdo_environment.ts:88`; `abg/semantic_job.ts:220`;
  `product/semantic_job.ts:558`; `abg/qualification_proof.ts:655`;
  `scripts/check-lifecycle-boundary.mjs:83`,
  `scripts/check-import-direction.mjs:29`,
  `scripts/check-calculus-boundary.mjs:56`;
  `scripts/product-payload.mjs:59`, `:64`, `:89`.

## 4. Lanes (ruling 6)

### The TD-37c lane's two order pins

`test_env/tests/t292-td37c-tree-walker.test.mjs`: `TREE` lists `B.txt` before
`a.txt` (test 1, walk order), and the expected delta lists `B.txt` (deleted,
ordinal 0) before `a.txt` (changed, ordinal 1) (test 2). The header comment says
the lane passed on the build before the walker and on the walker's build, and
that the two order pins hold from TD-81's build on. Results: 3/3 on the final
build; on the base build with the new pins, tests 1 and 2 fail and test 3 passes.
The lane's tree has no `å`, `ä`, `ö`, `ı` or capital `I`, so it cannot tell the
locales apart; the trace ran it 3/3 under no locale variable, `LANG=sv_SE.UTF-8`
and `LC_ALL=tr_TR.UTF-8`.

### The new lane

`test_env/tests/t292-td81-walk-order-and-root.test.mjs`, 7 tests. Its expected
values come from its own tree definition and its own `<` sort, never from the
sites.

The order cases start the lane file itself as a child process three times, with
an environment built from nothing: `PATH=/usr/bin:/bin`, `TMPDIR`, the build
root, a child flag and one setting. The settings are `LC_ALL=sv_SE.UTF-8`,
`LC_ALL=tr_TR.UTF-8`, and no locale variable, which means `LC_ALL`,
`LC_MESSAGES` and `LANG` are all unset (the lane's own process has
`LANG=en_AU.UTF-8`, which the children do not inherit). Each child walks one tree
through each site's built function. The tree has 20 files and 2 directories:
`a.txt`, `B.txt`, `Z.txt`, `o.txt`, `å.txt`, `ä.txt`, `ö.txt`, `h.txt`,
`ia.txt`, `Ib.txt`, `ıc.txt`, `İd.txt`, `j.txt`, `1.txt`, `10.txt`, `2.txt`,
`Dir/x.txt`, `Dir/Y.txt`, `sv/zz.txt` and `sv/å.txt`. It has no symlink,
because the report walk refuses one. The names are created with `flag: 'wx'`, so
a name the volume folds onto another fails instead of overwriting it.

| # | Case | Final | Base |
| --- | --- | --- | --- |
| 1 | The three children collate the lane's names three ways (default collations sv-SE, tr-TR, en-US), and none is code-unit order: the premise | pass | pass |
| 2 | The C2 Worker's digest is equal in the three children and equals the digest of the file replace's rows | pass | fail: tr-TR's differs from sv-SE's |
| 3 | The file replace's rows are equal in the three children and in code-unit walk order | pass | fail |
| 4 | The helper's inventory (`Map` order, rows, digest) is equal in the three and in code-unit walk order | pass | fail |
| 5 | The helper's delta (every entry created against an empty tree): rows, ordinals and digest equal in the three and in code-unit order of the full paths | pass | fail |
| 6 | The helper's report walk lists the files in code-unit walk order in the three children | pass | fail |
| 7 | The three sites give one verdict on each of the 13 spellings of section 2, and the case and normalization variants meet each site's root text | pass | fail: the C2 Worker admits the last component in another case |

7/7 on the final build; 1/7 on the base build (`ABG_WORKSITE_BUILD_ROOT` set to
the base build's `build/code/src`, `/private/tmp/abg-td81w-work/newlane-base.tap`).
Case 7 checks whether each variant spelling names a directory here. On a volume
that keeps letter case or normalization form apart, the spelling names nothing,
and the case expects `ENOENT` from all three sites and says so in a diagnostic.
The firmlink spelling is skipped where `/System/Volumes/Data` does not hold the
root. On this machine every variant names the directory and the firmlink
exists.

### Existing lanes, before and after

Command from T, one file at a time, in the foreground:
`TMPDIR=/private/tmp/abg-td81w-tmp ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap test_env/tests/<file>.test.mjs`.
Files: the brief's list, and every file that names a changed function, the
helper or file replace module, or the helper's delta (the rule TD-37c used).
Two more files have a local function named `walkFiles` of their own
(`t287-pfc-f08a-product-verification-boundary`,
`t287-w2-05-generator-package-reproducibility`) and are not run. Counts are
tests / pass / fail / skip.

| File | Before: base build | After: final build |
| --- | --- | --- |
| `t292-td81-walk-order-and-root` (new) | 7 / 1 / 6 / 0 | 7 / 7 / 0 / 0 |
| `t292-td37c-tree-walker` | 3 / 3 / 0 / 0 (old pins); 3 / 1 / 2 / 0 (new pins) | 3 / 3 / 0 / 0 (new pins) |
| `t292-td37a-path-relation` | 6 / 6 / 0 / 0 | 6 / 6 / 0 / 0 |
| `t292-td37a-worksite-subject` | 16 / 16 / 0 / 0 | 16 / 16 / 0 / 0 |
| `t292-td37b-launch-identity` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 |
| `t292-td37d-leaf-authority-gate` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-observed-worksite-command` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 |
| `t287-generic-job-worksite` | 9 / 9 / 0 / 0 | 9 / 9 / 0 / 0 |
| `t287-c2-core-environment` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t287-c2-child-program` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 |
| `steel-basic-cli-c2` | 6 / 0 / 0 / 6 | 6 / 0 / 0 / 6 |
| `t287-owned-process-lifetime` | 34 / 34 / 0 / 0 | 34 / 34 / 0 / 0 |
| `t287-qual056-material` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 |
| `t287-default-library-fulfillment` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t287-generic-job-read-dependency` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-generic-job-revision` | 2 / 1 / 0 / 1 | 2 / 1 / 0 / 1 |
| `t287-lifecycle-failure-carrier` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 |
| `t287-live-worksite-construction` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t292-binding-row-owner-differential` | 5 / 5 / 0 / 0 | 5 / 5 / 0 / 0 |
| `t292-td36r-remaining-owners` | 6 / 6 / 0 / 0 | 6 / 6 / 0 / 0 |
| `w2-steel-serial-branch-installed` | 2 / 0 / 0 / 2 | 2 / 0 / 0 / 2 |
| `w2-steel-single-start-installed` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-worksite-command-execution` | 13 / 13 / 0 / 0 | 13 / 13 / 0 / 0 |
| `r2-clean-install` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-post-binding-worksite-write` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t287-default-library` | 35 / 34 / 0 / 1 | 35 / 34 / 0 / 1 |
| `t287-wave2-installed-product-verification` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t287-worksite-construction` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `d2-binding-transition` | 10 / 10 / 0 / 0 | 10 / 10 / 0 / 0 |
| `m5-worker-transport` | 39 / 39 / 0 / 0 | 39 / 39 / 0 / 0 |
| `t287-declared-testing-capability` | 5 / 3 / 0 / 2 | 5 / 3 / 0 / 2 |
| `t287-native-work-currentness-consumers` | 6 / 6 / 0 / 0 | 6 / 6 / 0 / 0 |
| `t287-worksite-branch-construction` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| **Total, existing 32 files** | **257 / 243 / 0 / 14** | **257 / 243 / 0 / 14** |
| **Total with the new lane** | | **264 / 250 / 0 / 14** |

Every existing file gives the same counts before and after; no case failed
or timed out. The 14 skips are the same cases on both builds. Each
names a variable the brief's command does not set: six need
`ABI5_C2_CARRIER_FIXTURE_PATH`, three a frozen artifact and run root
(`ABI5_STEEL03_*`, `ABI5_STEEL04_*`), two the live `claude` command
(`ABG_TS_CLAUDE_COMMAND`), and one each `ABI5_T287_C1_LIVE`,
`ABI5_GENERIC_JOB_CORRECTION_NATIVE` and `ABI5_DEFAULT_LIBRARY_LIVE`.

### Lanes that reach the changed code through a support file

Three support files launch or drive the changed code: `t287-generic-job-lifecycle.mjs`
(`:99`) and `d2-frame-fixture.mjs` (`:326`) assert the built helper's path, and
`c0-post-publication-failure.mjs` drives the file replace owner. Each test that
imports one of them and is not in the table above ran once on the final build,
after a rebuild so the generated files match the build:

| File | After: final build |
| --- | --- |
| `t287-c0-post-publication-failure` | 16 / 16 / 0 / 0 |
| `t287-c0-post-publication-failure-owner-admission-close` | 15 / 15 / 0 / 0 |
| `t287-generic-job-lifecycle` | 1 / 0 / 0 / 1 |
| `t287-generic-job-intake` | 1 / 1 / 0 / 0 |
| `t287-generic-job-meaning` | 3 / 3 / 0 / 0 |
| `t287-native-semantic-job` | 9 / 9 / 0 / 0 |
| `t287-management-context` | 13 / 12 / 0 / 1 |
| `t287-management-supervision` | 5 / 5 / 0 / 0 |
| `d2-bounded-repair` | 10 / 10 / 0 / 0 |
| `t292-td34a-run-invocation-schema-owner` | 4 / 4 / 0 / 0 |
| **Total** | **77 / 75 / 0 / 2** |

None failed, so none was rerun on the base. The two skips need
`ABI5_GENERIC_JOB_FULL_NATIVE` and `ABI5_CONTEXT_PUBLIC_PROOF`. Not run: the
tests that reach only `c2-observation-carrier.mjs` or `d2-workflow-step-harness.mjs`
(`t292-td28d-command-forward-refused`, `t287-native-semantic-revision`,
`d2-workflow-step`, `d2-acknowledgment`, `d2-evidence-owner-lookup`), because
those two build fake receipts with `worksiteDelta: []` and never call the
helper; `exact-candidate-qualification.mjs` names the helper only in a
comment. `tests/d2-frame-installed.mjs` is not a test file; only
`support/evidence-gates.json` names it.

## 5. Recorded history (ruling 4)

The trace's list: 163 helper artifacts (`result.json`) under
`worksite-command-execution` directories, 56 under the evidence root and 107
under the main checkout's `T/test_env/test_runs`; 161 have a readable
`task.json` beside them. The Product's own reader,
`isWorksiteExecutionHelperArtifact(task, artifact)`, ran over the 161 on the
base build and on the final build (`/private/tmp/abg-td81w-work/recorded/diagnose.mjs`;
outputs `diag-base.json` and `diag-final.json`). Beside the verdict, a staged
diagnostic names the first check of the reader that fails, in the reader's own
order; on every artifact it agrees with the reader's verdict.

| | Base | Final |
| --- | --- | --- |
| Accepted | 74 | 74 |
| Refused | 87 | 87 |
| Same verdict and same first failing check, artifact by artifact | | 161 of 161 |
| Accepted artifacts whose delta code-unit order would reorder | 61 | 61 |
| Those 61 with their delta re-sorted by code units, ordinals renumbered and digest recomputed, accepted | 61 | 61 |

The refused 87, by the package version that recorded them (`launch.json`
`packageVersion`, present for all 161) and by reason:

| Recorded by | Where | Count | Recorded | Reason |
| --- | --- | --- | --- | --- |
| `5.0.0-rc.1` | `test_runs` | 74 | 2026-10-06 to 2026-10-28 | the task's retained native work task carries a worksite context observation whose digest the present identity rule does not reproduce |
| `5.0.0-rc.1` | evidence root | 5 | 2026-09-26 to 2026-10-30 | the same |
| `5.0.0-rc.2` | evidence root | 4 | 2026-10-31 | the same |
| `5.0.0-rc.3` | evidence root | 3 | 2026-10-31 to 2026-11-01 | the same |
| `5.0.0-dev.286` | evidence root | 1 | 2026-09-13 | the artifact kind `worksite_command_forward_helper_artifact` with a `worksite_command_forward_task`, a kind the reader no longer admits (forward commands were retired in TD-28d) |

The 86 native refusals, step by step (run, `diagnose-task.mjs`,
`diagnose-native.mjs`, `diagnose-native-task.mjs`, `diagnose-context2.mjs`, on
both builds):

1. The task reader refuses the task (`isNativeWorksiteCommandExecutionTask`),
   because the native work observation reader refuses `sourceNativeWork`.
2. That observation retains its original native work task (`task`, `before`),
   and the native task reader refuses the retained task at its `context`
   member.
3. `isWorksiteContextObservation` refuses that context at its last check: the
   recorded `observationDigest` differs from the digest the present identity rule
   computes. In these 86 contexts every file entry carries its bytes inline
   (`encoding: "base64"`). The present rule, `worksiteContextIdentityDigest`
   (`product/worksite_effect.ts`), digests each file entry without its body
   carriage, so a digest that covered the bytes does not recompute. Every
   accepted context of the same shape (rc.3 to rc.6, 25 tasks) carries
   `admitted_member` entries.

None of the 87 was recorded by `5.0.0-rc.12` or by a build of this wave. The
one artifact recorded by `5.0.0-rc.12` is the live amendment-witness Run
(`.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01-evidence/live-01/…`,
helper `/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/…`), and both builds
accept it. Of the 87, 25 hold fewer than two delta rows, as the trace counted;
order is not their cause. This package changes nothing for these refusals.

The trace's other scan figures are unchanged by this package: no reader
re-sorts or rebuilds recorded rows, and the reader module is byte-identical.

## 6. The helper's bytes and start-up (ruling 5)

**Bytes** (run, `/private/tmp/abg-td81w-work/bytes/probe-bytes.mjs`). One kept
task shape: the observed C2 task of `t287-observed-worksite-command`, with a
write territory `out` and a `test_report_set_exact` predicate. The fixture is
made once at a fixed path; the helper of the base build and the helper of the
final build then run the same launch manifest in turn, from the same toolchain
location, and their artifacts are compared. Every name in the worksite, the
sandbox and the Product root is ASCII lower case or a digit. The command
creates 10 files and 4 reports in nested directories (`out/a`, `out/a0`,
`out/a1`, `out/aa`, `out/b`, `out/b10`, `out/b2`, `out/d1/e2`, `out/d10/f`,
`out/z9`, `out/rep/r1`, `out/rep/r10`, `out/rep/r2`, `out/rep/sub/r3`).

| | Base | Final |
| --- | --- | --- |
| Disposition | success | success |
| Worksite delta rows | 19 | 19 |
| Report set | `r1`, `r10`, `r2`, `sub/r3` | the same |
| Artifact bytes | 21,213 | 21,213 |
| Artifact sha256 | `12f9979d8c951b0b…` | `12f9979d8c951b0b…` |
| Byte-identical | | yes |

A control with mixed-case names (`out/Ab`, `out/B2`, `out/a`, `out/d1/E2`,
`out/rep/R2`) gives the same length and different bytes: the base delta lists
`out/a` before `out/Ab`, the final lists `out/Ab`, `out/B2`, then `out/a`. So
the probe sees an order change where there is one.

**Start-up** (`/private/tmp/abg-td81w-work/startup/`, TD-37c's scripts
repointed):

| | Before | After |
| --- | --- | --- |
| Static relative modules | 247 | 247 |
| Runtime build modules | 247 | 247 |
| Runtime package modules | 156 | 156 |
| Added or removed | | none |

`tree_inventory.js` imports `canonical_json.js`, which the helper already loads
(directly, and through `digests.js`).

Interleaved runs of `node worksite_command_helper.js` with no arguments, 40
rounds each, base first and final first in turn; the machine is shared with
other Writers (1-minute load 10 to 17):

| Pair | Base median | Final median | Change |
| --- | --- | --- | --- |
| base snapshot, final worktree build | 361.8 ms | 378.8 ms | +4.69% |
| the same, again | 344.6 ms | 349.7 ms | +1.47% |
| the same, again | 341.5 ms | 346.8 ms | +1.56% |
| base snapshot, final snapshot in the same layout | 342.5 ms | 346.9 ms | +1.30% |
| the same, again | 353.2 ms | 351.6 ms | −0.46% |
| the same, again | 354.9 ms | 350.0 ms | −1.39% |
| base snapshot against itself (noise) | 354.1 ms | 356.7 ms | +0.73% |

No module is added; every pair is below the 5% bound. The worktree build sits
beside a real `node_modules` and the snapshots beside a symlink to it; with the
layout equal, the change is between −1.4% and +1.3%.

## 7. Declarations, checks and identity

- Declarations: all 486 base `.d.ts` files are byte-identical on the final
  build; none is added or removed.
- `npm run build` passes and leaves only the generated files changed.
  `npm run lint:imports` (3 forbidden owner pairs hold), `lint:lifecycle` (281
  modules, no offender) and `lint:calculus` (no offender) pass.
- Generated files are restored to their `7102112b2` bytes before each commit;
  none is committed.

| Identity | Base `7102112b2` | Final build |
| --- | --- | --- |
| `productContentDigest` | `sha256:7a97b9f699986ed3d8727e01a0120bead67466136ae49340f6a8e344608f2ae9` | `sha256:d752b07f3e8a50296840cfa0835920c04bf9a146c6dffe0b22eff1ff17ec4b33` |
| `contributionManifestDigest` | `sha256:b7b50dc487a6c07d2940fd8916888e45677e269f7378c365a14961b5131ff649` | `sha256:e2eed8b24787ca93831e62f04916890d6b22ec46f0e1225be4e13d7d544d7df2` |
| `publicContractCatalog.catalogDigest` | `sha256:3dba155c2c0ae2f70f51410f1b46dd3d5a64c2d0d9988794a93f716f57dfccd4` | unchanged |
| capability graph `graphDigest` | `sha256:0cd0fd442d9199ff2a9a5993a05904e608b6bc69d58037f4d7ee5bfa5685280c` | `sha256:08ca7e5a59019e8bb50cfac7fb8f8842210f8366f9d0af2e82bbed9c01fed12c` |
| Product-relative locators | 5,299 | 5,299 |
| `product-toolchain-manifest.json` sha256 | `6b9c8937a7546d7b79b3e91bbdd4665696822c93e1ea5bf33e26d76771089829` | `28e444fef1fba9634c9ac09441a87c1c88225a6c63ca0723627933a0deb61bbb` |
| `contracts/capabilities/capability-definition-graph.json` sha256 | `85330207b9cc40e891cf0dc99959fe9dcd89ff85f4f8728912d2260a031ff185` | `10838cadd6d6a4f5b84ae8a60bbfb79f6fcfc9a67bcd08c67ae546c4b4a83820` |
| `contracts/worksite/command-execution-context.inventory.json` sha256 | `9e61bdf4adf1b0489d814a579cad555272c37fe4d84efe5cd9f1f686ba886ed1` | unchanged |
| `test_env/fixtures/abi5-root-candidate-basis.json` | unchanged by the build | unchanged |

What changed under `T/contracts`, in content: only
`capabilities/capability-definition-graph.json`. Its 16 rows keep their
capability ids and their owning and projected public contract ids. What moves is
the `productContentDigest` inside 241 owning-contract catalog coordinates, and
with it each row's `capabilityDefinitionDigest` and `…Ref` (16), each
dependent capability's digest and ref (18), and the `graphDigest`. In
`product-toolchain-manifest.json` the Product content digest, the contribution
manifest digest and ref, the descriptor and provenance refs, the eight
publication digests and the graph's digest and asset digest move; the locator
list is unchanged.

## 8. Size

`git diff --numstat 7102112b2` over `code/src` and `test_env`:

| File | Added | Deleted |
| --- | --- | --- |
| `code/src/product/tree_inventory.ts` | 15 | 9 |
| `code/src/implementation/worksite_command_helper.ts` | 3 | 3 |
| `test_env/tests/t292-td37c-tree-walker.test.mjs` | 12 | 9 |
| `test_env/tests/t292-td81-walk-order-and-root.test.mjs` (new) | 246 | 0 |

The source change is four statements and one import; the rest of
`tree_inventory.ts` is comments.

## 9. Deviations, observations, residuals

Deviations:

1. **Commit trailer.** The brief names `Claude Fable 5.2` in the
   `Co-Authored-By` trailer. This Writer runs as Claude Opus 5.5, so both
   commits carry `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
   with the brief's `Claude-Session` line.
2. **The new lane is its own file**, `t292-td81-walk-order-and-root`, beside the
   TD-37c lane, which keeps its three tests with the two pins moved. The new
   lane starts itself as the child process, so the child resolves the tenant's
   packages from `test_env/tests`, the way the lane's VM linker needs.
3. **The undispatched receipt is read, not run.** The probe of section 2 runs
   `realizeWorksiteCommandExecution` and sees its throw; the leaf port's
   mapping of that throw to `implementation_exception` is read from source.
4. **One start-up pair reads +4.69%.** It compares the base snapshot with the
   worktree build, whose layout differs (section 6). It is under the bound;
   the two reruns of the same pair read +1.47% and +1.56%.

Observations for the Executive (no ruling needed for this package):

1. Three `localeCompare` sites outside TD-81 order a value that is recorded or
   digested (section 3): the interned qualification scope's reference sets, the
   release record's `predecessorRefs`, and the build script's
   `publicationBindings`, which feeds `contributionManifestDigest`. The scope's
   set refs and the eight module refs order alike under every locale tried, so
   today's digests do not depend on the locale; a later module name with a
   capital letter, an underscore, or a `-` beside a `.` or `/` would make the
   build's identity depend on the build machine's locale. The release record's
   refs are git ref names; a carrier ref with a capital letter or an underscore
   would be recorded in an order that depends on the publishing machine's
   locale.
2. The 86 native refusals of section 5 are a reader fact, not an order fact:
   recorded tasks of `5.0.0-rc.1` to `5.0.0-rc.3` whose retained native
   context carried file bodies inline no longer read through
   `isWorksiteExecutionHelperArtifact`, because the context identity rule now
   excludes body carriage. Whether those recorded tasks must stay readable is
   outside TD-81.

Residuals: the 27 checks that keep a given spelling (`realpathSync(x) !== x`)
are TD-85; the C2 Worker's other such checks (archive root, protected subjects)
are among them. The helper's environment, and so its locale, is still whatever
the Worker's shell gives it; after this package none of the helper's own
orders depends on it.

## 10. Commits

| Commit | Content |
| --- | --- |
| `de9bff1af` | TD-81: code-unit order at the walk and the helper's two sorts; the walk's root rule takes the stored spelling (source and lanes) |
| this commit | TD-81 Return |
