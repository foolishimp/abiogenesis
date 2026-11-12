# TD-85a Return: the synchronous canonical-path checks ask the stored spelling

Writer: Claude Opus 5.5. Branch `claude/td85a-stored-spelling-checks` from local
`main` at `18bfd3f1a`, worktree `/private/tmp/abg-td85a` (sparse). Change class:
realization_refactor (the first part of the TD-85 ruling). No push, no tag.
T = `build_tenants/abiogenesis/typescript`. Scratch evidence is under
`/private/tmp/abg-td85a-work/`. Commits: `9e846f9f2` (source, design line and
lane), then this Return.

**Status: complete, for review. One owner, `shared/stored_spelling.ts`, states
the stored spelling of an existing path (`storedSpelling`, the system
`realpath`) and whether a path is spelled as stored (`spelledAsStored`). The 26
synchronous comparisons that asked the JavaScript `realpathSync` ask
`spelledAsStored`; the command-execution parent's root planner and the
synchronous tree walk take `storedSpelling`: 28 call sites in 10 files. Each
check keeps its place, its refusal and its message; no refusal code is new. The
C2 parent now refuses an archive root or a source subject in another letter case
or normalization form at its check, before any read or write, and the revision
gates report a recorded subject stale after a case-only or normalization-only
rename. Because the planner now returns the stored spelling, the parent also
refuses a stored source or a stored archive root inside a binding root declared
in another spelling, with its existing protected-root and overlap refusals. A
path in stored spelling gets the same verdict at every site. The differential
drives sites 1 to 11, 24 and 28 and gives 5,370 of 5,370 recorded rows equal and
every stored grid row equal (the inventory digest of the grid's tree compared on
one tree); for the other sites the old and the new question give the same answer
on all 1,198 recorded existing paths, which are all spelled as stored, and on
every grid spelling except the eight case and normalization variants. Rows that
depend on an absent protected root or on overlapping roots in stored spelling
are unchanged. The count of checks does not change: 830 in one C2 command execution
and 283 in one default-library Run, before and after, site for site. The 27
existing lane files give 269 / 262 / 0 / 7 (tests / pass / fail / skip) before
and after; the new lane gives 12 / 12 on the final build and 12 / 4 on the base.
Every base `.d.ts` file is byte-identical. One item to confirm: the planner's
refusals of a stored source or archive root inside a root declared in another
spelling are outside ruling 4's list (section 3). Both commits carry
`Co-Authored-By: Claude Opus 5.5`, not the brief's Claude Fable 5.2, because
this Writer runs as Opus 5.5; reword on merge if the brief's line is wanted.**

## 1. The predicate and its place

`code/src/shared/stored_spelling.ts` (23 lines, new):

```ts
export function storedSpelling(path: string): string {
  return realpathSync.native(path);
}
export function spelledAsStored(path: string): boolean {
  return storedSpelling(path) === path;
}
```

`realpathSync.native` asks the operating system, as the asynchronous owners'
`fs/promises` `realpath` does: every symbolic link resolved and every component
named as the volume stores it. The JavaScript `realpathSync` resolves links and
keeps the letters it is given. For any path, the system `realpath` returning the
path implies the JavaScript one returns it too, so the new question refuses
everything the old one refused and admits only stored spellings.

Why there:

- `shared/` imports only `shared/` and packages (`node:fs` is a package), and
  every layer that holds a check (`abg/`, `implementation/`, `product/`) may
  import `shared/`. `lint:imports` passes with no new edge and no cycle (31
  shared modules, was 30; the three forbidden owner pairs hold).
- `shared/path_confinement.ts` is lexical by its own statement and stays
  unedited. No existing owner of filesystem identity in `shared/` fits: the
  module states one system call and one comparison, nothing else.
- It has two exports because two callers need the string, not the boolean: the
  C2 parent's planner (`plannedCanonicalPath`) resolves the deepest existing
  ancestor and appends the missing remainder, and the synchronous tree walk's
  `realpath` step returns the resolved root. Both now take the stored spelling
  from the one owner, so `realpathSync` appears in `code/src` only in this
  module.
- Errors: the module catches nothing. Both calls throw the same codes on paths
  that do not resolve (run, `/private/tmp/abg-td85a-work/errors.json`): `ENOENT`
  for an absent component, `ENOTDIR` through a file, `ELOOP` for a link loop,
  `EACCES` under an unsearchable directory. Only the message differs
  (`lstat '…'` or `stat '…'` against `realpath '…'`). Every site either checks
  the node with `lstat` first or catches by code into `false` or `null`, and
  `worksite_construction_recovery.ts:158` relies on the `ENOENT` throw for its
  absent observation, which it still gets.
- It is not re-exported from `shared/index.ts`, so no base declaration changes.

The design names it: one bullet in
`design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`, beside the
path-confinement owner, states both exports, which callers take which, that it
reads and writes nothing else, folds nothing and leaves each caller its
handling, and that the asynchronous worksite owners keep their `fs/promises`
call.

**The asynchronous checks of `product/worksite_operations.ts` stay.** They make
the same system call (`fs/promises` `realpath` at `:167`, `:209`, `:266`,
`:366`, `:480`, `:1145`, `:1183`) and give the same verdicts. They cannot call
the predicate without a behaviour change: the predicate is synchronous, so each
call would block the event loop, and the planner at `:167` runs inside
`Promise.all` at `:227` and `:954`, whose root checks would then run one after
another, which changes which refusal surfaces first when two roots fail. `:167`
and `:209` also need the resolved string. The command helper's `fs/promises`
checks are the same case and stay too.

## 2. The site table

Final line numbers. "On a non-stored path" is the site's existing outcome, now
reached by a path in another letter case or normalization form as well as by a
path through a symbolic link.

| # | File:line | Function | What it guards | On a non-stored path |
| --- | --- | --- | --- | --- |
| 1 | `implementation/worksite_command_execution.ts:219` | `plannedCanonicalPath` | the six binding roots and the attempt paths, for the subject and overlap checks | returns the stored spelling of the deepest existing ancestor (was: the given spelling); its own refusals at `:217`, `:224` unchanged |
| 2 | `…:246` | `assertCanonicalArchiveRoot` | the archive root, before any manifest write | throws "command execution archive root must be one canonical concrete directory" |
| 3 | `…:259` | `observeWorksiteSubjectSync` | the worksite root, before Worker dispatch | throws "canonical worksite root changed before Worker dispatch" |
| 4 | `…:275` | `observeWorksiteSubjectSync` | each component of a source subject, before it is read | throws "protected subject has a symlink or physical alias" |
| 5 | `…:369` | `assertExistingCanonicalNode` | the attempt root and the two manifests, after they are written | throws "command execution path must be one concrete ${expectedKind}" |
| 6 | `abg/worksite_revision.ts:725` | `worksiteRevisionPhysicalMatches` | the root | returns false |
| 7 | `…:732` | `worksiteRevisionPhysicalMatches` | each ancestor | returns false |
| 8 | `…:737` | `worksiteRevisionPhysicalMatches` | the file | returns false |
| 9 | `…:753` | `retainedWorksitePhysicalMatches` | the root | returns false |
| 10 | `…:760` | `retainedWorksitePhysicalMatches` | each ancestor | returns false |
| 11 | `…:763` | `retainedWorksitePhysicalMatches` | the file | returns false |
| 12 | `abg/semantic_stage.ts:293` | `projectSemanticWorksitePreparation` | the root | returns null |
| 13 | `…:301` | `projectSemanticWorksitePreparation` | each ancestor | returns null |
| 14 | `…:306` | `projectSemanticWorksitePreparation` | the target | returns null |
| 15 | `…:380` | `projectSemanticEvidenceInput` | the snapshot root | returns null |
| 16 | `…:383` | `projectSemanticEvidenceInput` | each snapshot path | throws "snapshot path crossed native locus", caught into null |
| 17 | `abg/semantic_job.ts:220` | `semanticJobContextCurrent` | each native context entry | returns false |
| 18 | `…:402` | `projectSemanticJobEvidence` | the snapshot root | returns null |
| 19 | `…:405` | `projectSemanticJobEvidence` | each snapshot path | throws "snapshot locus mismatch", caught into null |
| 20 | `abg/semantic_revision.ts:964` | `projectRevisionEvidenceInput` | the snapshot root | returns null |
| 21 | `…:967` | `projectRevisionEvidenceInput` | each snapshot path | throws "snapshot crossed native locus", caught into null |
| 22 | `abg/worksite_construction_recovery.ts:152` | `currentTaskPhysical` | the root | returns false |
| 23 | `…:158` | `currentTaskPhysical` | each path (an absent one throws `ENOENT` into its absent observation, as before) | returns false |
| 24 | `abg/transport_contracts.ts:579` | `isAdmittedActorArchiveFile` | an actor archive file, before it is read | returns false |
| 25 | `abg/runtime_liveness.ts:343` | `stageProbe` | a bound native asset's directory | throws "bound native asset is not one canonical file" |
| 26 | `product/stdo_environment.ts:99` | `compareInstalledC2ContextMaterial` | the installed owner's root | throws "C2 Context lacks its exact actual installed owner", caught into null |
| 27 | `…:103` | `compareInstalledC2ContextMaterial` | each installed file | throws "C2 Context material is not its canonical installed file", caught into null |
| 28 | `product/tree_inventory.ts:95` | the synchronous driver's `realpath` step | the walk's root | unchanged: TD-81 made it `realpathSync.native`; it now calls `storedSpelling` |

Sites 2 to 27 change only the question; site 1 changes the string it returns;
site 28 changes no behaviour. The trace counted 28 call sites in 10 files with
the walk's step among them; at this base the walk already asked the system call,
so 27 sites in 9 files asked the JavaScript `realpathSync`. Every comparison
keeps its place in its condition, so each check runs where and when it ran.
`TD-31` has closed, so `product/stdo_environment.ts` is no longer reserved.

## 3. What now refuses

All run on this volume (APFS, aliasing both letter case and normalization form)
with the new lane and with copies of the trace's probes
(`/private/tmp/abg-td85a-work/probe/`, outputs in `base/` and `final/`).

| Case (trace row) | Base | Final | Written on the final build |
| --- | --- | --- | --- |
| C2 archive root `.abg/EVENTS` for the event-log root `.abg/events` (3a, archive (c)) | admitted; `task.json` and `launch.json` written into the event-log directory | "command execution archive root must be one canonical concrete directory" | nothing |
| C2 archive root `.ABG/events/archive`, nested in the event-log root (3a, archive (c)) | admitted; manifests written into the event-log directory | the same refusal | nothing |
| C2 event-log root NFC `café`, archive root the NFD spelling (3a, archive (d)) | admitted; manifests written into the event-log directory | the same refusal | nothing |
| C2 source `.ABG/events/runtime.events.jsonl` or `.abg/EVENTS/runtime.events.jsonl` (3a, C2 source (c)) | admitted; the protected file is read (the lane makes it unreadable, and base fails `EACCES` at the read) | "protected subject has a symlink or physical alias" | nothing; not read |
| C2 source `.abg/<NFD café>/state.json` inside the NFC-stored runtime root (3a, C2 source (d)) | admitted and read | the same refusal | nothing; not read |
| Revision gates after `src/a.txt` → `src/A.txt`, `src` → `SRC`, or the root renamed in case (5, 3a revision (c)) | both gates true for the recorded `src/a.txt` | both false; the new stored spelling is true | (read-only gates) |
| Revision gates after a directory or the file renamed to the other normalization form | both true | both false; the new stored spelling is true | (read-only gates) |

Two further refusals follow from the planner returning the stored spelling. The
brief does not name them; they are the same alias class, seen from the root's
side, and each uses the check's existing refusal:

| Case | Base | Final |
| --- | --- | --- |
| Event-log root declared `.ABG/events` (or the runtime root declared NFD) with a stored source inside its directory | admitted and read | "protected subject enters a WorkspaceBinding protected root" (`:269`) |
| Event-log root declared `.ABG/events` (or the runtime root declared NFD) with a stored archive root inside its directory | admitted; the manifests are written into the protected directory (five entries in the event-log directory; for the NFD runtime root, the attempt root lies in the runtime directory) | "command execution archive root overlaps a protected workspace root" (`:328`), nothing written |

The second row is from `probe/c2-overlap.mjs`; the first is lane tests 8 and 9.

These need the Executive's confirmation. Read strictly, ruling 3 says nothing
else changes, and the subject or archive root in these rows is spelled as
stored. My case for keeping them: the path that is not spelled as stored is the
declared binding root, the planner is the site that receives it, and ruling 5
holds because a task whose paths are all spelled as stored gets the same verdict
on both builds. The old admission is not one a Product route relies on (stop
condition 2): every route to the C2 parent first runs an asynchronous owner over
all roots of the same binding, and that owner refuses every effect on a binding
with an existing root spelled other than stored (trace sections 4 and 5, rows h1
and h2 of the trace's `owners.json`). If the ruling is to keep the declared
spelling, the planner goes back to the JavaScript `realpathSync` (links
resolved, letters kept), and lane tests 8 and 9 are dropped.

**Unchanged, as the second part's rows:**

- Probes `owners`, `absent-root` and `materialize` give the same rows on both
  builds (inodes, digests and scratch names normalized). These cover file
  replace, file parents, native write roots and context observation, the absent
  protected root, and materialization into overlapping roots.
- Probe `absent-root-2` differs only in row 11's message. That message comes
  from a `Promise.all` race in the asynchronous planner and varies between runs
  on either build.
- The C2 archive root equal to the event-log root in identical strings, and an
  archive root stored inside a stored event-log root, keep "command execution
  archive root overlaps a protected workspace root" on both builds (lane test 3,
  `c2-overlap` control).
- The actor transport is not driven, as in the trace.

## 4. The differential

`/private/tmp/abg-td85a-work/diff/diff.mjs` drives each site function of one
build; `compare.mjs` compares base and final (`diff/base.json`,
`diff/final.json`, `diff/compare.json`).

**Recorded data (part B).** The trace's 58 recorded C2 `task.json` files under
the evidence root: 36,814 subjects, of which 1,549 are on disk; 348 roots, 331
on disk; 28 product roots, 27 existing. For each task the differential runs
`plannedCanonicalPath` on its six roots, `assertCanonicalArchiveRoot`,
`assertExistingCanonicalNode` on the attempt root and both manifests,
`isAdmittedActorArchiveFile` on `task.json`, `retainedWorksitePhysicalMatches`
on all rows, `observeWorksiteSubjectSync` and both per-subject revision gates on
each subject on disk, and `installedProductInventoryDigest` on each existing
product root. **5,370 rows, 5,370 equal.**

| Site | Verdicts (both builds) |
| --- | --- |
| `plannedCanonicalPath` | 348 values, equal |
| `assertCanonicalArchiveRoot` | 58 admitted |
| `assertExistingCanonicalNode` | 174 admitted |
| `isAdmittedActorArchiveFile` | 56 true, 2 false |
| `retainedWorksitePhysicalMatches`, all rows | 10 true, 48 false |
| `observeWorksiteSubjectSync` | 1,549 observed |
| per-subject revision gates | 58 true, 1,491 false |
| inventory digest | 27 digests, equal |

**Build-independent check (part C).** All 1,198 distinct existing paths reached
in part B are spelled as stored (system `realpath` equals the path), and all of
them also satisfy the JavaScript comparison. None is admitted by the old
question alone. 15 are absent.

**Spelling grid (part A).** One tree under `TMPDIR` with a NFC directory and a
file. The sites are driven with 20 spellings between them: stored, the last
component, an ancestor or the first component in another case, the NFC directory given NFC or
NFD, through a symlinked ancestor or root, the path itself a symlink, a trailing
separator, a `..` segment, a repeated separator, a relative path, the firmlink
spelling `/System/Volumes/Data/…`, absent paths, and the file or a directory in
another case or normalization form. 136 rows; 92 equal.

| Spellings | Rows | Equal | What differs |
| --- | --- | --- | --- |
| stored; NFC given NFC; firmlink | 28 | 25 | only `installedProductInventoryDigest`: one digest per build for all three spellings, different between builds because each run builds a fresh tree. On one tree both builds give `sha256:d32b09df…` for every stored spelling (`inv/inv.mjs`). |
| symlinked ancestor or root; path a symlink; trailing separator; `..`; repeated separator; relative; absent below the stored directory; absent | 58 | 58 | none |
| absent below another case | 4 | 3 | the planner returns the stored spelling of the existing part |
| last, ancestor or first component in another case; NFC directory given NFD | 30 | 5 | the planner returns the stored spelling; the archive-root, existing-node and worksite-root checks now refuse and both root gates return false. Equal: the inventory digest, which refused these on both builds since TD-81, and the archive-file check, which a lexical containment refuses |
| the file or a directory in another case or normalization form | 15 | 0 | the existing-node check and subject observation now refuse; the archive-file check and both subject gates return false |

The one row outside these groups records that the firmlink spelling exists.

Every stored spelling has the same verdict at every driven site; every changed
row is a spelling the volume aliases. Sites 12 to 23 and 25 to 27 are not driven
here: their functions need a native basis, a construction task, a runtime probe
or an installed C2 Context.
For them the evidence is part C and the question grid in section 7.

The firmlink spelling is its own stored spelling to both calls (run:
`realpathSync`, `realpathSync.native` and `fs/promises` `realpath` all return
`/System/Volumes/Data/private/tmp/…` unchanged), so it keeps its verdicts. It is
a second stored spelling of one directory; see section 11.

## 5. The lane

`test_env/tests/t292-td85a-stored-spelling.test.mjs`, 12 tests. It drives the C2
parent through its exported `realizeWorksiteCommandExecution` with a task built
by the Product's own constructors, the revision gates through their exports, and
lists every file under the worksite with its inode before and after to find
writes.

| # | Test | Base | Final |
| --- | --- | --- | --- |
| 1 | the volume: tests two names that differ only in letter case and two that differ only in normalization form | pass | pass |
| 2 | control: stored roots and source prepare the Worker request; the parent writes only under the archive root | pass | pass |
| 3 | control: archive root equal to the event-log root keeps its overlap refusal; nothing written | pass | pass |
| 4 | archive root naming the event-log directory in another case is refused at the archive-root check; nothing written | fail: prepared, manifests written | pass |
| 5 | the same in another normalization form | fail: prepared, manifests written | pass |
| 6 | a source entering the event-log root through another case is refused at its component check before it is read | fail: `EACCES` at the read | pass |
| 7 | the same through another normalization form | fail: `EACCES` at the read | pass |
| 8 | a binding root declared in another case is compared in its stored spelling; a stored source inside it is refused before it is read | fail: `EACCES` at the read | pass |
| 9 | the same declared in another normalization form | fail: `EACCES` at the read | pass |
| 10 | control: both revision gates report a stored recorded subject current | pass | pass |
| 11 | after a case-only rename of the file, a directory or the root, both gates report the recorded subject stale and the new stored spelling current | fail | pass |
| 12 | after a normalization-only rename of a directory or the file, the same | fail | pass |

**12 / 4 / 8 / 0 on the base, 12 / 12 / 0 / 0 on the final build.**

The volume test creates the second name with flag `wx`. `EEXIST` with the same
inode means the volume aliases that kind. Each changed test for a kind the
volume keeps apart is skipped, and its skip message gives the reason. This
volume aliases both kinds, so nothing skips here.

The skip branch was run once on a copy of the trace's case-sensitive APFS image,
attached under scratch with `TMPDIR` on it and detached afterwards
(`/private/tmp/abg-td85a-work/cs/lane-final.tap`). The final build gives
12 / 8 / 0 / 4: the four letter-case tests (4, 6, 8, 11) skip with "this volume
keeps two names that differ only in letter case apart, so no path in another
letter case names a stored one", and the normalization tests run and pass,
because case-sensitive APFS still aliases the two normalization forms.

To avoid reading a protected byte in tests 6 to 9, the lane makes the protected file mode 000: base
reaches the read and fails `EACCES`, and final refuses before it.

## 6. Cost

Counted with a preload that wraps `realpathSync` and `realpathSync.native` and
attributes each call to its nearest frame in `build/code/src/`
(`count/preload.mjs`):

| Run | Base | Final |
| --- | --- | --- |
| One C2 command execution: "T-287 C2 compact acknowledgment preserves installed large-log observation and replay" | 830: 797 JavaScript in `worksite_command_execution.js`, 9 JavaScript in `transport_contracts.js`, 24 native in `tree_inventory.js` | 830: the same sites, all native |
| One default-library Run: "default-library Run interrupted at the durable entered Testing cursor resumes once in the same Run through the cold Public pending_execution arm" (8 processes) | 283: 188 JavaScript in `worksite_command_execution.js`, 93 JavaScript in `transport_contracts.js`, 2 native in `tree_inventory.js` | 283: the same sites, all native |

Per site the counts are equal one for one (built lines shift by one for the
import; C2 execution first, default-library Run second): the planner 652 and 140, the archive-root check 40 and 5, the worksite
root 2 and 10, the subject components 4 and 21, the existing-node check 99 and
12, the archive-file check 9 and 93, the walk 24 and 2. On the final build no
path in either run is in a non-stored spelling; on the base none is a letter-case
or normalization variant. The trace measured the system call at 10
microseconds against 13 for the JavaScript one.

The command helper's start-up closure grows by one module, 247 to 248 (static
and runtime), because `tree_inventory.js` imports `shared/stored_spelling.js`.

## 7. Lanes before and after

Command, from T: `TMPDIR=/private/tmp/abg-td85a-tmp ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap test_env/tests/<file>.test.mjs`,
one file at a time from one runner script. The files are the brief's list plus
every file that names an edited function.

| Lane | Before | After |
| --- | --- | --- |
| `t292-td37a-path-relation` | 6 / 6 / 0 / 0 | 6 / 6 / 0 / 0 |
| `t292-td37a-worksite-subject` | 16 / 16 / 0 / 0 | 16 / 16 / 0 / 0 |
| `t292-td37c-tree-walker` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `t292-td81-walk-order-and-root` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `d2-binding-transition` | 10 / 10 / 0 / 0 | 10 / 10 / 0 / 0 |
| `t287-observed-worksite-command` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 |
| `t287-post-binding-worksite-write` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t287-worksite-construction` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `t287-worksite-branch-construction` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t287-generic-job-worksite` | 9 / 9 / 0 / 0 | 9 / 9 / 0 / 0 |
| `t287-c2-core-environment` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t287-management-context` | 13 / 12 / 0 / 1 | 13 / 12 / 0 / 1 |
| `integration-shared-seams` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t292-td28d-command-forward-refused` | 6 / 6 / 0 / 0 | 6 / 6 / 0 / 0 |
| `t287-native-worksite-execution` | 6 / 4 / 0 / 2 | 6 / 4 / 0 / 2 |
| `t287-native-semantic-job` | 9 / 9 / 0 / 0 | 9 / 9 / 0 / 0 |
| `t287-calculus-fold` | 25 / 25 / 0 / 0 | 25 / 25 / 0 / 0 |
| `t287-f04a-probabilistic-result-candidate` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t287-lifecycle-failure-carrier` | 8 / 8 / 0 / 0 | 8 / 8 / 0 / 0 |
| `t287-management-stream-drain` | 7 / 4 / 0 / 3 | 7 / 4 / 0 / 3 |
| `t287-qualification-scopes` | 24 / 24 / 0 / 0 | 24 / 24 / 0 / 0 |
| `t287-worksite-command-execution` | 13 / 13 / 0 / 0 | 13 / 13 / 0 / 0 |
| `t287-native-workspace-work` | 43 / 43 / 0 / 0 | 43 / 43 / 0 / 0 |
| `r2-clean-install` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `r3-workspace-binding` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-registered-graph-selection` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-default-library` | 35 / 34 / 0 / 1 | 35 / 34 / 0 / 1 |
| **27 files** | **269 / 262 / 0 / 7** | **269 / 262 / 0 / 7** |

The seven skips are the same tests with the same reasons on both builds: each
needs an environment variable that selects an installed proof or a held native
log (`ABI5_CONTEXT_PUBLIC_PROOF`, `ABI5_DEFAULT_LIBRARY_LIVE`,
`ABI5_NATIVE_SOURCE_READY_CATALOG`, `ABG_NATIVE_EXECUTION_RETAINED_LOG`,
`T287_STREAM_HELD_EVENT_LOG` three times).

**Paths the lanes pass to the checks.** `TMPDIR` (`/private/tmp/abg-td85a-tmp`),
the evidence root and T are each spelled as stored (run). To see what reaches
the checks, every file above was run again on the final build with the counting
preload, which classifies each path a counted call receives:

| Lane | Checks counted | Files reached | Paths not spelled as stored |
| --- | --- | --- | --- |
| `t292-td37a-worksite-subject` | 237 | `worksite_command_execution`, `transport_contracts`, `worksite_revision` | none |
| `t292-td37c-tree-walker` | 4 | `tree_inventory` | none |
| `t292-td81-walk-order-and-root` | 9 | `tree_inventory` | 4 letter-case or normalization variants and 1 path through a symbolic link, all the lane's own root spellings, refused on both builds (the walk asked the system call since TD-81) |
| `d2-binding-transition` | 2 | `worksite_revision` | none |
| `t287-observed-worksite-command` | 166 | `worksite_command_execution`, `tree_inventory` | none |
| `t287-worksite-construction` | 2 | `transport_contracts` | none |
| `t287-worksite-branch-construction` | 8 | `transport_contracts` | none |
| `t287-native-worksite-execution` | 16 | `worksite_command_execution` | none |
| `t287-native-semantic-job` | 217 | `worksite_command_execution`, `tree_inventory` | none |
| `t287-calculus-fold` | 1 | `transport_contracts` | none |
| `t287-worksite-command-execution` | 1,544 | `transport_contracts`, `worksite_command_execution`, `tree_inventory` | none |
| `t287-default-library` | 1,004 (16 processes) | `transport_contracts`, `worksite_command_execution`, `tree_inventory` | none |
| the other 15 files | 0 | none in a process the preload sees | none |

In the processes the preload sees, no kept lane passes a path through a
symbolic link or in another spelling to a changed site. The preload sees only
processes that inherit `NODE_OPTIONS`, so the 15 files with no counted check are
unobserved, not shown clean. Their evidence is the equal tests / pass / fail /
skip before and after, and the question itself: a path through a symbolic link,
such as `/tmp/…` or a default `/var/folders/…` `TMPDIR`, is refused by both the
old and the new question (the grid rows below), so any `TMPDIR` or evidence-root
spelling other than a letter-case or normalization variant gives the same verdict
on both builds.

The sites in `semantic_stage`, `semantic_job`, `semantic_revision`,
`worksite_construction_recovery`, `runtime_liveness` and `stdo_environment`
(sites 12 to 27) are reached by no counted process. For them the proof is the
question itself: each site changes only the comparison. On the grid's 25
spellings the old and the new question (`realpathSync(p) === p` against
`realpathSync.native(p) === p`, an error answering with its code) give the same
answer on 17 and differ on exactly the 8 letter-case and normalization variants
(`/private/tmp/abg-td85a-work/qgrid/qgrid.txt`). On the 1,198 recorded paths
they give the same answer on every one (part C).

The detector pass ran the files one at a time on the final build. 18 of them
were run a second time, because during the first pass I restored and then
regenerated the generated manifest for the source commit, and the lanes running
in that minute failed in `packProduct`, which read a manifest that did not match
the build. The second pass gives the same tests / pass / fail / skip as the
"After" column for all 18, and the table above takes those 18 from it. The
"After" column itself ran before the commit and is not affected.

## 8. Identity digests

From `product-toolchain-manifest.json` after `npm run build`:

| Identity | Base (`18bfd3f1a`) | Final |
| --- | --- | --- |
| `productContentDigest` | `sha256:d752b07f3e8a50296840cfa0835920c04bf9a146c6dffe0b22eff1ff17ec4b33` | `sha256:ba1941370ea5da3166294060d1c841d552a2cb06c867c08c4dcbd147f2e02669` |
| `contributionManifestDigest` | `sha256:e2eed8b24787ca93831e62f04916890d6b22ec46f0e1225be4e13d7d544d7df2` | `sha256:66fa30fcddd3ee91601da964906fed6992ecb85358f8a8145c7ebe0d213fd0f1` |
| `catalogDigest` | `sha256:3dba155c2c0ae2f70f51410f1b46dd3d5a64c2d0d9988794a93f716f57dfccd4` | unchanged |
| `graphDigest` | `sha256:08ca7e5a59019e8bb50cfac7fb8f8842210f8366f9d0af2e82bbed9c01fed12c` | `sha256:7c23b8b029dafe487c8a61ea5897f6eb85e4d059fc873417c8a0bef222e893e3` |
| Locators | 5,299 | 5,301 (the new module's `.js` and `.d.ts`) |

The build regenerates `contracts/capabilities/capability-definition-graph.json`
and `product-toolchain-manifest.json`; neither is committed.
`contracts/worksite/command-execution-context.inventory.json` is unchanged. The
C2 renderer pin's module, `build/code/src/product/worksite_command_execution.js`,
is byte-identical (`sha256:d59c28ac…0876` on both builds).

Declarations: 486 `.d.ts` files on the base, 487 on the final build; all 486 base
files are byte-identical. The new one is `shared/stored_spelling.d.ts`.

`npm run build`, `lint:imports` (31 modules under `shared/`; three forbidden
owner pairs hold), `lint:lifecycle` (282 modules, no offender) and
`lint:calculus` (6 modules, no offender) pass.

## 9. Lines changed

`git diff --numstat 18bfd3f1a` over `code/src`, `test_env` and `design`:

| File | Added | Removed |
| --- | --- | --- |
| `code/src/shared/stored_spelling.ts` (new) | 23 | 0 |
| `code/src/abg/runtime_liveness.ts` | 3 | 2 |
| `code/src/abg/semantic_job.ts` | 5 | 4 |
| `code/src/abg/semantic_revision.ts` | 4 | 3 |
| `code/src/abg/semantic_stage.ts` | 7 | 6 |
| `code/src/abg/transport_contracts.ts` | 3 | 2 |
| `code/src/abg/worksite_construction_recovery.ts` | 4 | 3 |
| `code/src/abg/worksite_revision.ts` | 8 | 7 |
| `code/src/implementation/worksite_command_execution.ts` | 6 | 6 |
| `code/src/product/stdo_environment.ts` | 4 | 3 |
| `code/src/product/tree_inventory.ts` | 3 | 2 |
| `test_env/tests/t292-td85a-stored-spelling.test.mjs` (new) | 364 | 0 |
| `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` | 1 | 0 |

`code/src`: 70 added, 38 removed. In each edited file the change is the import
(`realpathSync` dropped from `node:fs`, the owner imported) and the compared
expression.

## 10. Deviations

1. **Two exports, not one predicate.** The planner and the tree walk need the
   stored string. One owner states it; `spelledAsStored` is the comparison on
   top. Without `storedSpelling`, the planner would keep a private
   `realpathSync` call and the module would not be the one place that says what
   the stored spelling is.
2. **The planner returns the stored spelling.** Ruling 2 lists it among the
   checks; it is the one site that returns a path. With the old call it returned
   the declared spelling of an existing root, so the lexical checks after it
   compared a variant root with stored subjects. It adds no refusal of its own;
   the refusals it enables are listed in section 3 and need the Executive's
   confirmation.
3. **The tree walk's `realpath` step calls the owner.** TD-81 had already made it
   the system call. Routing it through the owner adds one module to the command
   helper's start-up closure (247 to 248) and changes nothing else.
4. **One design line.** The library design lists the shared owners; the new
   module has a bullet beside `path_confinement.ts`. Design files are not read
   by the build or the pack.
5. **Error messages under a race.** At the C2 parent's throwing sites a path
   that disappears between `lstat` and the check would now throw with
   `realpath '…'` in place of `lstat '…'`, with the same code. No lane or probe
   reaches this.
6. **How the lanes ran.** Each pass ran its files one at a time from one runner
   script, which the harness ran as a background shell; I waited for each pass
   to end. Short probes (the start-up closure, the overlap probe, the
   question grid, the lints) ran beside the detector pass; only file
   comparisons and reads ran beside the "After" pass. Section 7 records the restore of generated files during the
   detector pass and its rerun.
7. **Commit trailer.** `Co-Authored-By: Claude Opus 5.5`, not Claude Fable 5.2,
   because this Writer runs as Opus 5.5 (as in the TD-81 Return). The
   `Claude-Session` line is as briefed.

## 11. Residuals for the second part

- **Absent protected roots.** Unchanged (probes `absent-root`, `absent-root-2`,
  `owners`): file parents still creates `.abg/PROJECTION` when the root is
  absent, file replace still links and then refuses after publication, and
  native work's write-root check still admits an absent root in another
  spelling. None of these passes through a synchronous check.
- **Overlapping roots in stored spelling.** Unchanged (probe `materialize`, lane
  test 3, `c2-overlap` control): materialization still writes into the
  event-log directory when the projection root overlaps it; the C2 parent
  already refused that overlap and still does. The actor transport is not
  driven.
- **Roots declared in another spelling.** `workspace.bind` still admits them. The
  C2 parent now compares them in stored spelling, and the asynchronous owners
  already refuse every effect on such a binding when the root exists; bind-time
  refusal is the second part's.
- **Two stored spellings of one directory.** The firmlink path
  `/System/Volumes/Data/private/tmp/…` and `/private/tmp/…` are each their own
  stored spelling to every `realpath` (run). Not driven: a binding that names
  one root through each spelling would pass the lexical overlap rule and this
  predicate, since both spellings are stored and lexically apart. To catch it,
  the second part's bind-time rule (roots apart and spelled as stored) would
  need to compare roots by identity (device and inode) or refuse firmlink
  spellings.
- **The asynchronous owners** keep their own `fs/promises` call (section 1).
