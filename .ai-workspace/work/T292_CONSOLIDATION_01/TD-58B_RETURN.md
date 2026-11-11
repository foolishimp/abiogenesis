# TD-58B Return: one install per test file (second slice)

Writer: Claude Opus 5.5. Branch `claude/td58b-one-install-per-file` from
`main` at `ebeeaf5e0`, worktree `/private/tmp/abg-td58b`. Change class:
realization_refactor, test side only. No push, no tag.

- No file under `T/code`, `T/scripts` or `T/contracts` changed.
- No support module changed. Every conversion uses the two-phase owner the
  first slice put in `test_env/support/root-installed-environment.mjs`, or the
  `shared` route the first slice gave `support/amendment-witness-run.mjs`.
- Eleven test files are converted, one commit each.
- No `assert` line and no `test(` declaration is removed or added. This was
  checked over `git diff ebeeaf5e0 HEAD`.

**Status: all eleven conversions committed. Before and after runs are done for
all eleven, with equal titles and counts. The reversed-order runs were still
running in the chain when this Return was written; section 4 gives the state
per file at that moment. The Executive reruns `verdict.py` for the final state.**

## 1. Census of what is left

Scope: every test file that installs the product more than once per run, counted in
the default environment. Gated cases count only when they run, that is when no
selector variable is set.

- `installs` counts packed, verified and installed products per run.
- `variants` counts installs that differ in what they install. That is the
  floor of a one-install-per-variant conversion.
- Expected saving is about (installs minus variants) times 43 s. The 43 s is
  the P7 per-install setup.
- TS-11 gives seconds only for `t287-readable-stops` (219 s) and
  `t287-single-address-space-consolidation` (334 s).

| File | Setup owner | Cases | Installs | Variants | Expected saving | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `r7-graph-validation-basis` | root (Resolution, Invocation) | 1 | 4 | 1 | 3 installs, ~130 s | converted |
| `m5-s03-authority` | root (ExecutionBasis) | 5 | 3 | 1 | 2, ~85 s | converted |
| `t287-worksite-construction` | root (ExecutionBasis) | 3 | 2 | 1 | 1, ~43 s | converted |
| `t287-worksite-branch-construction` | root (Invocation, through a file-local composite) | 2 | 2 | 1 | 1 | converted |
| `r5-invocation-admission` | root (Catalog) | 2 | 2 | 1 | 1 | converted |
| `r9-causal-result-closure` | root (ExecutionBasis) | 2 | 2 | 1 | 1 | converted |
| `runtime-scope-regressions` | root (Catalog) | 2 | 2 | 1 | 1 | converted |
| `t287-c0-correction-regressions` | root (ExecutionBasis) | 4 | 2 | 1 | 1 | converted |
| `t287-default-library-reviews` | root (Catalog, `publicReviewsRun`) | 10 | 2 | 1 | 1 | converted |
| `t287-default-library-recoverable-failure` | `runWitness` | 5 | 2 | 1 | 1 | converted |
| `t287-readable-stops` | root (Catalog, `stoppedRun`) | 5 | 4 | 3 | 1 | converted, keyed by variant |
| `t287-single-address-space-consolidation` | `runInstalledLanguageTest` (3), uat `populateSandbox` (2) | 12 | 5 | not settled | up to 4 | left (section 3) |
| `rival-authority-mutations` | root (2), CLI harness (1) | 3 | 3 | 2 | 1 | left (section 3) |
| `m5-installed-portability` | CLI harness | 8 | 8 | 8 | none | left: install-time behaviour |
| `t287-st1-installed-cross-owner-hello` | root (Catalog) | 3 | 2 | 2 (language smoke fixture, developer mini Product) | none | left |
| `t287-st2a-e-exact-prefix-workspace-environment` | root (Catalog) | 2 | 2 | 2 (explicit `prepareAdditionalProducts` with the language-test gtl view, and the owner's default fixture) | none | left |
| `m5-installed-graph-edge` | `runInstalledLanguageTest` | 2 | 2 | 2 (structural fixture, RC5 source transform) | none | left |
| `t287-rp2-fibre-substitution` | root (Catalog), in a loop | 1 | 2 | 2 (F_D and F_P fixture Products) | none | left |
| `t287-calculus-state-transfer` | `executeAdmittedTestGraph` (root ExecutionBasis), one subtest per shape | 1 (7 subtests) | 7 | 7 (one fixture Product per shape; it also reads the install-phase setup accounting) | none | left |

Every other installer file installs at most once per run. Four groups:

- **Already shared within the file.** A memo shares one setup across the
  file's cases: `m5-event-store-reopen`, `t289-install-event-bodies` and
  `t287-retry-run-prefix`. The first slice's eight files are also in this group.
- **One installing case.** Among others: `m5-fresh-process-reconstruction`,
  `r6`, `r8`, `t287-governed-context`, `t287-management-supervision`,
  `t287-declared-testing-capability`, `t287-held-basis-lifetime`,
  `t287-readable-stops-foldback`, `t287-required-operation-bindings`,
  `steel-basic-cli-public` and
  `t287-wave2-installed-product-verification`. The last one also tests stale
  installed bytes, so it would keep its install in any case.
- **Gated to zero or one by default.**
  - Root owner: `t287-generic-job-revision`, `t287-generic-job-lifecycle`, the
    Public case of `t287-management-context`, and `t287-s03-automatic`.
  - CLI owner: `t287-d1-requirement-handoff`,
    `t287-w2-05-install-catalog-owner-chain`, `w2-steel-serial-branch-installed`
    and `t287-stdo-proof-entry`.
- **The UAT harness.** `uat/harness.test.mjs` calls `populateSandbox` once. Its
  second call is the expected `EEXIST` refusal.

On the CLI owner, `root-cli-environment.mjs` needed no change: no CLI-owner
file installs more than once per run ungated, apart from
`m5-installed-portability`, which must keep its installs.

## 2. Converted files

The commit for each file is in the table in section 4.

### What each case shares

- **Shared:** the packed artifact, the bootstrap extract, the fixture Products,
  verification, the resolved lock, the install, and the imported installed
  owners.
- **Per case:** its own scratch root (`abi5-root-case-*`), event store,
  admitted installs, workspace, binding, publications and Catalog.
- **Guard:** the dispose guard re-hashes the install root after the file's last
  case.
- **Product verification:** still runs, once per install.

### The files

- **`r7-graph-validation-basis`**
  - Its one case builds four environments: admitted basis, set-only basis,
    rejected graph and forged basis. All four now open on one install.
  - Installs: 4 to 1.
  - The altered and forged carriers are `structuredClone`s. No case writes an
    environment carrier that comes from the install.
- **`m5-s03-authority`**
  - The three installed cases share one default install: invocation capability,
    continuation authority, and the Product-sealed projection.
  - The two other cases install nothing.
  - Installs: 3 to 1. The forged event candidates are `structuredClone`s of
    store rows.
- **`t287-worksite-construction`**
  - The two C1 cases share one `packed_artifact` + `worksite_construction`
    install: the fake-Claude traversal with fresh replay, and the partial prefix.
  - The deterministic worker is written under `environment.scratch`, which is
    now the case's root.
  - Installs: 2 to 1.
- **`t287-worksite-branch-construction`**
  - The same install as above, passed as `install` through the file's
    `setupCompositeRootExecutionBasis` to `setupInstalledRootInvocation`.
  - Installs: 2 to 1.
- **`r5-invocation-admission` and `runtime-scope-regressions`**
  - `setupInstalledRootCatalog(context, root)` became
    `openCaseEnvironment(context, await sharedInstall())`. It has the same
    defaults and returns the same environment shape.
  - `runtime-scope-regressions` keeps `process.cwd()` as its package root.
  - Installs: 2 to 1 each.
- **`r9-causal-result-closure` and `t287-c0-correction-regressions`**
  - `{ install }` is passed to `setupInstalledRootExecutionBasis`.
  - c0-correction wraps the leaf port in a per-case copy and does not write the
    shared one.
  - Installs: 2 to 1 each.
- **`t287-default-library-reviews`**
  - The two Public starts share one install of the tenant and the consumer
    fixture Product.
  - The selected run environment is kept beside the install, as
    `t287-default-library` does since the first slice.
  - Installs: 2 to 1.
- **`t287-default-library-recoverable-failure`**
  - The two witness Runs use the existing `shared` parameter of `runWitness`
    with `installOncePerFile(bound => installWitnessTenant({ bound }))`.
  - Installs: 2 to 1.
  - Both Runs keep the `{ after() {} }` context they had. Their case scratch
    roots stay in TMPDIR, as their whole install roots did before.
- **`t287-readable-stops`**
  - Installs are keyed by recursion bound and declared failed-child classes.
    `[]` (no classes) and `undefined` (the four default classes) are different
    install inputs.
  - Variants: bound 12 with `[]` (worker exit and absolute ceiling), bound 2
    with the defaults, and bound 12 with the defaults (selection gap).
  - Installs: 4 to 3.

### Comments and claims

- Each file gets one comment stating that its cases share one install and that
  each case opens its own store, workspace and scratch root.
- No converted file had a title or comment claiming a fresh install per case.
- No converted file reads the observation-only `observe*` counters.
- No case body joins the case scratch with `artifacts`, `consumer` or
  `bootstrap`.

## 3. Files left, and why

- **`t287-single-address-space-consolidation`.** Seven of its cases fail on
  missing inputs (TD-59). It also installs through two owners:
  `runInstalledLanguageTest`, with differing fixtures, and the uat
  `populateSandbox`. Neither owner takes a shared install today. Converting it
  needs TD-59 first, then an `install` option on `runInstalledLanguageTest` (a
  small change) and a two-phase `populateSandbox`.
- **`rival-authority-mutations`.** The register (TD-58 Retire) and TS-11 list
  it among the files that keep their own install.
  - By reading, its two root cases forge only in memory: a `structuredClone` of
    the ExecutionBasis, and a forged leaf port. Only its CLI case packs
    separately.
  - It would go from 2 root installs to 1 if the register's keep list is
    revisited. I left it, because the brief makes the register's keep list the
    boundary.
- **`m5-installed-portability`, `t287-wave2-installed-product-verification`,
  `r2-clean-install` and `r1`.** They test install-time behaviour or tampered
  bytes, so they keep their own installs.
- **`t287-st1`, `t287-st2a-e`, `m5-installed-graph-edge` and
  `t287-rp2-fibre-substitution`.** Each install is a different variant, so
  there is nothing to share within the file.
  - `st2a-e` builds the same language smoke fixture by two routes. The routes
    differ in the gtl argument: the language-test gtl view or the raw gtl.
  - Sharing would make one case run on an install the other route built. That
    changes the case's claim, so I did not do it.

## 4. Verification chain

State when this Return was written (`python3 /private/tmp/abg-td58b-runs/verdict.py`):

| file | commit | titles before=after | reversed vs after | before t/p/f/s | after t/p/f/s | reversed t/p/f/s | s before | s after | cpu s before | cpu s after | hook | after blob = commit | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| r7-graph-validation-basis | 88a939d1f | equal | same set | 1/1/0/0 | 1/1/0/0 | 1/1/0/0 | 153 | 50 | 203 | 62 | ok | yes | accept |
| m5-s03-authority | 75c71be6a | equal | same set | 5/5/0/0 | 5/5/0/0 | 5/5/0/0 | 121 | 45 | 157 | 58 | ok | yes | accept |
| t287-worksite-construction | 6165a6a56 | equal | running | 3/3/0/0 | 3/3/0/0 | running | 93 | 61 | 118 | 74 | ok | yes | pending |
| t287-worksite-branch-construction | d7ce7d040 | equal | pending | 2/2/0/0 | 2/2/0/0 | pending | 189 | 152 | 211 | 167 | ok | yes | pending |
| r5-invocation-admission | 9763a2077 | equal | pending | 2/2/0/0 | 2/2/0/0 | pending | 77 | 46 | 104 | 58 | ok | yes | pending |
| r9-causal-result-closure | 8614d15d2 | equal | pending | 2/2/0/0 | 2/2/0/0 | pending | 75 | 42 | 100 | 56 | ok | yes | pending |
| runtime-scope-regressions | ac1f1b5f2 | equal | pending | 2/2/0/0 | 2/2/0/0 | pending | 73 | 41 | 99 | 55 | ok | yes | pending |
| t287-c0-correction-regressions | 51622696a | equal | pending | 4/4/0/0 | 4/4/0/0 | pending | 82 | 46 | 108 | 60 | ok | yes | pending |
| t287-default-library-reviews | 855b0054d | equal | pending | 10/10/0/0 | 10/10/0/0 | pending | 170 | 136 | 202 | 155 | ok | yes | pending |
| t287-default-library-recoverable-failure | 542c5ef62 | equal | pending | 5/5/0/0 | 5/5/0/0 | pending | 225 | 196 | 258 | 215 | ok | yes | pending |
| t287-readable-stops | 3a0cb2c8f | equal | pending | 5/5/0/0 | 5/5/0/0 | pending | 224 | 225 | 272 | 244 | ok | yes | pending |

Files with both times: 1482 s before, 1040 s after (wall); 1832 s before, 1204 s after (user plus sys CPU).

### How the chain ran

- **Runner.** `/private/tmp/abg-td58b-runs/runner.py`, under `nohup`, ran the
  queue (`queue.txt`) one file at a time.
- **Command.** From T, each run used
  `TMPDIR=/private/tmp/abg-td58b-tmp /usr/bin/time -l node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap <file>`.
- **Output.** Each run writes `before-`, `after-` and `rev-<stem>` with `.tap`,
  `.time` and `.meta` files.
- **Before.** The file at `ebeeaf5e0` (`git show`), written as a temporary
  sibling `zz-before-<stem>.test.mjs` and deleted at job end. No support module
  changed, so this is the base as it was.
- **After.** The worktree file. The `.meta` records its blob, and the verdict
  checks that blob against the conversion commit.
- **Reversed.** The committed file with its top-level registrations moved to
  the end in reverse order (`reverse_tests.py`), written as
  `zz-rev-<stem>.test.mjs` and deleted at job end.
  - A `for (const x of [..]) test(` loop also has its array reversed
    (`t287-c0-correction-regressions`).
  - The number of moved blocks equals each file's number of declarations.
- **Commits.** The after run was the "passes once" gate for each commit.
  `commit-one.sh` commits only when the after run ran the same blob, has
  `# fail 0`, and shows no hook failure.
- **Verdict.** `python3 /private/tmp/abg-td58b-runs/verdict.py` prints the
  table above. It reports `pending`, `running` or `crashed` for a run that is
  missing or unfinished.
  - Titles are compared at every depth: before against after in order, and
    reversed against after as a multiset.
  - A failed hook in any run is flagged; that would be the dispose guard
    failing the file's root `after` hook.
  - It was checked against the first slice's run files, where it gives the
    first slice's results.
- **Load.** Other suite runs shared the machine throughout (1-minute load about
  8 to 11). The before and after runs of a file ran in the same single-runner
  queue, so they ran under the same kind of load. The seconds are wall-clock
  time under load, not CPU time.

### What the reversed run proves, and what it does not

- `r7-graph-validation-basis` has one case. Its reversed run equals its after
  run, so it shows only that the file passes a second time. Its independence
  evidence is by reading:
  - each of the four environments is used only through its own fields;
  - the altered graph function and the forged resolution-set validation are
    `structuredClone`s;
  - no line assigns into a carrier that came from the install (`verified`,
    `lock`, `installCandidates`, `candidateBasis`).
- The same grep was run over the other ten files. Every in-place write is to a
  clone, a spread copy, a per-case wrapper, or the case's own environment
  object, such as `env.catalogView`.
- The dispose guard checks the install root's bytes, not the in-memory install
  record. Only the top level of that record is frozen. A case that mutated a
  nested carrier in place would therefore not trip the guard. The grep is the
  evidence that no converted case does.

## 5. Next files, in order of saving

1. `t287-single-address-space-consolidation` (334 s in TS-11, up to 4
   installs). It needs, in order:
   - TD-59;
   - an `install` option on `runInstalledLanguageTest`;
   - a two-phase uat `populateSandbox`, the TS-08 owner.
2. `rival-authority-mutations` (2 root installs to 1). Only if the register's
   keep list is revisited; its root cases forge in memory only.
3. `t287-calculus-state-transfer` (269 s in TS-11, 7 installs, all
   different variants). Each shape installs the tenant together with its own
   fixture Product under one resolved lock. Sharing the tenant would need an
   owner that installs the fixture per case on a shared tenant install. That
   changes the lock each case sees, so it is a design question first, not a
   conversion.
4. Nothing else installs more than once per run.
   - The remaining suite cost is one install per installer file across about 60
     files.
   - Cutting it further means sharing the pack and install across files: a
     content-addressed tenant pack per build tree, then one install per run of
     the suite (TS-08).
   - Running files in parallel stays blocked by the fixed output paths
     (TD-62, TS-12).

## 6. Qualification members changed (inventory and recipe not edited)

- **Members:** eight of the converted files are members of both
  `test_env/qualification/inventory.json` and
  `test_env/qualification/recipe/verification-recipe.json`:
  - `r7-graph-validation-basis`, `m5-s03-authority`, `r5-invocation-admission`
    and `r9-causal-result-closure`;
  - `runtime-scope-regressions`, `t287-c0-correction-regressions`,
    `t287-worksite-construction` and `t287-worksite-branch-construction`.
- **Not members:** `t287-default-library-reviews`,
  `t287-default-library-recoverable-failure` and `t287-readable-stops`.
- **Not edited:** the inventory and the recipe, which are already stale.
