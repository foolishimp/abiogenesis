# TD-58A Return: one install per test file (first slice)

Writer: Claude Opus 5.5. Branch `claude/td58-one-install-per-file` from `main`
at `7928c58cc`, worktree `/private/tmp/abg-td58`. Change class:
realization_refactor, test side only. No push, no tag. No file under
`T/code`, `T/scripts` or `T/contracts` changed.

**Status: partial. The run was ended before the measurement chain finished.**
Only the owner change and the C0 pair are committed. The C0 pair is verified on
its first file only. The other conversions are written but uncommitted and
unverified (section 4).

| Commit | Content |
| --- | --- |
| `16c703c32` | two-phase owner in `root-installed-environment.mjs` |
| `38b0097a7` | C0 B04 pair converted (the support module and both test files) |
| this commit | this Return |

## 1. The two functions and their contract

These live in `test_env/support/root-installed-environment.mjs`.

- `installTenantOnce(packageRoot, options)` is the install phase. It runs once
  per test file and does the following under a scratch root of its own
  (`abi5-root-install-*`):
  - packs the tenant, or selects the frozen artifact;
  - prepares the fixture Products;
  - verifies every artifact;
  - installs them under one resolved lock;
  - imports the installed owners.

  Its options are the install-selecting ones: `frozenArtifact`,
  `candidateBasisSource`, `rootPublicationKind`, `prepareAdditionalProducts`,
  and `setupAccounting` for the install phases.

  It returns a frozen install record. `dispose()` re-inventories the whole
  install root (path, kind, mode, size, sha256) against the inventory taken
  when the install was made. If anything changed, it throws and keeps the root
  for inspection; otherwise it removes the root. A throw there fails the
  file's root `after` hook, which shows up as an extra failed entry. Product
  verification still runs, once per install.
- `openCaseEnvironment(context, install, options)` is the case phase. It
  creates a new scratch root (`abi5-root-case-*`) and opens in it:
  - the event store;
  - the admitted installs;
  - the workspace and its binding;
  - the publications and the Catalog.

  It returns the same environment shape as before. `scratch` is the case's
  root; `artifactPath`, `consumerRoot` and `installedRoot` are the shared
  install's. It refuses a case option that names a different install selector
  than the install's. The store is closed and the scratch root removed after
  the case.
- `installOncePerFile(create)` is called at module top level. It returns
  `key => Promise<install>`, creates each install lazily on first use, and
  disposes all of them in a root `after` hook.
- `setupInstalledRootInvocation`, and through it the Resolution and
  ExecutionBasis entries, accept `options.install`.
- `setupInstalledRootCatalog` (the per-case entry) is now the composition of
  the two internal phases in one scratch root per case, with the same layout
  as before. A diff of the old body against the two phases shows only the
  split. Proof that the composition is unchanged, before (pristine copy) and
  after (new owner):

  | File | Before | After |
  | --- | --- | --- |
  | `m5-fresh-process-reconstruction` | 1/1 pass, 44.3 s | 1/1 pass, 44.6 s |
  | `t287-registered-graph-selection` (exercises `prepareAdditionalProducts` and `setupAccounting`) | 1/1 pass, 69.4 s | 1/1 pass, 66.5 s |

  `t287-generic-job-lifecycle` was skipped by its gate in both runs.

Guard cost, measured once on a C0 install: one inventory takes 1.76 s over
10,658 files (155 MB), and `dispose` takes 2.39 s. That is about 4 s per file
for the two inventories. One `installTenantOnce` took 41.5 s.

## 2. Converted files, verified

Conditions:
- Before ran from a pristine APFS clone of the worktree at `7928c58cc`
  (`/private/tmp/abg-td58-base`).
- After ran from the worktree.
- Files ran one at a time, sequentially, with
  `node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap`
  under `/usr/bin/time -l` and `TMPDIR=/private/tmp/abg-td58-tmp`.
- Another suite run was using the machine throughout. Load averages are
  recorded per run.
- Max RSS is that of the largest single process in the tree (the runner, the
  per-file child, or a CLI child), not a sum.

| File | Titles and statuses equal | Before t/p/f/s | After t/p/f/s | s before | s after | Max RSS GB before / after | 1-min load before / after |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `t287-c0-post-publication-failure` | yes | 16/16/0/0 | 16/16/0/0 | 694 | 163 | 4.48 / 3.24 | 7.3-9.6 / 9.1-9.1 |

In the after run, the first case carries the install (42.7 s). Each later case
takes 7.3 to 8.5 s, against 41.8 to 46.1 s before.

## 3. Baselines recorded, after runs not finished

| File | Before t/p/f/s | s before | Max RSS GB | Load |
| --- | --- | --- | --- | --- |
| `t287-c0-post-publication-failure-owner-admission-close` | 15/15/0/0 | 726 | 4.30 | 9.6 |
| `t287-amendment-witness` | 13/12/0/1 (the live case is gated) | 828 | 4.47 | 15.6-27.7 at start |

The after run of the C0 sibling had started when the run ended. The C0 pair's
code is committed in `38b0097a7`; its second-file proof is in the results below.

## 4. Written but uncommitted and unverified (working tree)

| File | Change | Installs before / after |
| --- | --- | --- |
| `support/amendment-witness-run.mjs`, `tests/t287-amendment-witness.test.mjs` | `installWitnessTenant`; installs keyed by recursion bound (W5's bound 4 is the second install); `runWitness({shared})`; the live case still installs for itself (keep, accounting) | 8 / 2 |
| `tests/m5-event-calculus-runtime.test.mjs` | one default install; `{install}` at the 5 setup sites | 5 / 1 |
| `tests/t287-recursive-registered-selection.test.mjs` | one install of the tenant and the failure fixture for the 4-scenario case and the two interrupted cases; the gated live case is unchanged | 6 / 1 |
| `tests/t287-recursive-failure-foldback.test.mjs` | one install for the 4 direct scenarios; the Public start case is unchanged | 4 / 1 (plus 1 unchanged) |
| `tests/t287-worksite-command-execution.test.mjs` | one install for the 6 installed C2 cases; the ABG_T287_C2_PROOF_CONFIG proof still installs per case; one comment restated | 6 / 1 |
| `tests/t287-default-library.test.mjs` | one install for the three Public Runs (pending Testing, retained source, assessment dependency); one comment restated | 3 / 1 |

The measurement chain was left running in the background and writes to
`/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/5e4c25c3-fca5-4dd6-89e7-20d55d008bdf/scratchpad/runs/`:
- `chain1.sh`: after runs of the C0 sibling and the witness, then before and
  after back to back for m5, recursive-registered-selection and
  recursive-failure-foldback.
- `chain2.sh`: reversed-order runs of all six converted files.
- `chain3.sh`: worksite-command-execution before, after and reversed.
- `chain4.sh`: default-library before, after and reversed.

To build the table:
`python3 <scratchpad>/table.py <stem>...`

**Before committing these files, the next Writer must check per file:**
- the titles, statuses and counts are equal before and after;
- the reversed-order run gives the same results;
- the after hook did not fail.

Then commit one file or pair per commit and delete the untracked temporary
`test_env/tests/zz-rev-*.test.mjs` copies, which are needed until chain4
ends.

## 5. Not converted, and why

- `t287-single-address-space-consolidation`:
  - 7 of its cases fail on missing inputs (TD-59);
  - it installs through `installed-language-test.mjs` with differing fixtures
    and through the uat `populateSandbox` owner (TS-08).
- `steel-basic-cli-public`, `t287-calculus-state-transfer` and
  `t287-required-operation-bindings`: each has a single install, so there is
  nothing to share.
- `t287-readable-stops`: its 4 cases need 3 fixture variants
  (bound 12 with `[]`, bound 2, and bound 12 without the refs). Keyed installs
  would save one install. Left for the next slice.
- No converted file tampers with the install. Per TS-11, these must keep their
  own install: `r2-clean-install`, `m5-installed-portability`,
  `t287-wave2-installed-product-verification`, `rival-authority-mutations`
  and r1's tampered archive.

## 6. Next slice, in order of measured cost (TS-11 table)

1. Finish verifying and committing section 4: the witness (880 s),
   default-library (327 s), worksite-command-execution (320 s), the two
   recursive files (241 s and 231 s) and m5-event-calculus-runtime (195 s).
2. `t287-readable-stops` (219 s, with installs keyed by variant).
3. `t287-single-address-space-consolidation` (334 s, after TD-59 and the
   TS-08 uat owner).
4. `t287-default-library-reviews` (`publicReviewsRun`).
5. The other per-case installers among the 79 files. Their order needs
   `suite1.tap`, which is not in this sparse checkout.

## 7. Qualification members changed (inventory and recipe not edited)

- Members:
  - `test_env/support/root-installed-environment.mjs` (committed);
  - `test_env/tests/t287-c0-post-publication-failure.test.mjs` (committed);
  - uncommitted: `m5-event-calculus-runtime.test.mjs`,
    `t287-recursive-registered-selection.test.mjs`,
    `t287-worksite-command-execution.test.mjs`,
    `t287-default-library.test.mjs`.
- Changed files that are not members: `c0-post-publication-failure.mjs`,
  `amendment-witness-run.mjs`, the C0 sibling test, the witness test and the
  foldback test.

## 8. Deviations and residual risks

- One process now holds one product module graph per file. Relative imports
  resolve by installed path, so the old `?env=` nonce never isolated more than
  the entry modules.
- Identity-keyed memos (module-level WeakMaps) on the shared install carriers
  (`verified`, `lock`, install candidates) are warm from the second case on.
  Evidence of independence so far:
  - the C0 first file passes with every fault mode injected;
  - the per-case installed inventory and the file-level guard both held;
  - the product's post-publication inventory read
    (`implementation/worksite_file_replace.ts:188`) is computed per call and
    not memoized.

  The reversed-order runs are the remaining check (section 4).
- The observation-only counters (`observe*Work`, `observeRunPreparationSubjects`)
  accumulate across the cases of a file. No converted file reads them; the 16
  files that do were not touched.
- When a shared install fails, every case that uses it fails, as each did
  before with its own install.
- The first case of each file carries the install time, as before.
- `installOncePerFile` must be called at module top level.
- A guard failure keeps that install root in TMPDIR.
- Measurement noise: a concurrent suite run and my own composition checks and
  guard measurement overlapped the baselines. The C0 witness baseline started
  at a 1-minute load of 15.6.
