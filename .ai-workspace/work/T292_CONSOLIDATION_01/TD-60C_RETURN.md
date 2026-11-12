# TD-60C Return: test-side repairs from the whole-suite run at the first group close

Writer: Claude Opus 5.5. Branch `claude/td60c-suite-close-repairs` from local
`main` at `daaffe796`, worktree `/private/tmp/abg-td60c`. Change class:
realization_refactor, test side only. No push, no tag.

**Status: items 1, 2, 4 and 5 are done. Item 3 is done in part. Of the six
gated cases, three are restated and now run under the evidence root, where
they pass. The other three stay failing with their input present, and each
is reported as a product defect.**

- Held-prefix cases 1 and 3 have their stale 0 restated to the O1 bound,
  and they fail only on the excess over it. This is evidence for the second
  part of TD-51: read ports called outside an operation hold re-read the
  basis body.
- `owner-history-logical-digest` is an apparent product defect: a held owner
  admits an append after its log has been changed in place. This needs a
  ruling.

`d2-evidence-owner-lookup` is 5/5 with the root set, and the catalogue lane
passes in both modes. The suite's 62 skips all map to a catalogue row; none
is unexplained.

`T` is `build_tenants/abiogenesis/typescript`. The command below prints
nothing:

```
git diff --stat daaffe796 -- T/code T/contracts T/scripts T/package.json \
  T/product-toolchain-manifest.json T/design T/test_env/qualification specification
```

`T/test_env/qualification/inventory.json` and the recipe are not edited.

| Commit | Item | Content |
| --- | --- | --- |
| `36a9d4f16` | 1 | the evidence collector's free names come from their owners; VM context names are checked by name |
| `3b073effd` | 2 | the D5 preserved-result lane's limit is set from measured runs |
| `d101f9e81` | 3 | three held-prefix cases run under the root; cases 1 and 3 are restated to the O1 bound and stay failing; t288 is triaged in its row |
| this commit | | this Return |

Item 4 is a table, and item 5 is a list. Neither changes a file.

## Item 1. `d2-evidence-owner-lookup`

**What was wrong.**

- `test_env/support/d2-evidence-owner-harness.mjs` takes two compiled function
  bodies from `build/code/src/abg/semantic_revision.js`:
  `revisionEvidenceComponentsAtBasis` and `projectRevisionEvidenceInput`.
- It runs them with `runInNewContext` in a context whose free names it lists
  by hand.
- The collector now calls `pathRelation` and `pathStrictlyWithin` from
  `shared/path_confinement`, and the context lacked both.
- The collector's own `catch` turns the `ReferenceError` into its ordinary
  `null` refusal. So:
  - cases 1, 2 and 5 fail on `assert.ok`;
  - cases 3 and 4, which expect a refusal, pass on that same `null`.

  Both of those passes are vacuous.

**Which way, and why.**

- The two names come from the real `shared/path_confinement` module, through
  the harness's own `load`. This is the loader that already supplies every
  other owner module to the context, and the names are not stubbed.
  - The module is pure path arithmetic.
  - The collector's confinement decision is part of what the cases claim, so
    a stub would test the stub.
- A missing name now fails loudly, by name, before the body runs. The new
  module `test_env/support/vm-context-names.mjs` provides two functions:
  - `unboundNames(source)` lists the names the source reads that no
    declaration inside it binds. It uses the TypeScript compiler's own scope
    resolution: `createProgram` with no lib, collecting each "Cannot find
    name" diagnostic.
  - `assertContextBinds(source, context, label, exempt)` fails on each such
    name that neither the context nor a new VM context's own globals bind.
    Its message names every missing name.
  - The check covers any future missing name, not only these two. It needs no
    hand-kept list.
- The harness checks the exact source string it then runs. The check found
  three more names the context lacked:
  - `inlineWorksiteContextBytes` (`product/worksite_effect`);
  - `authenticateOwnedSemanticJobBasis` (`abg/semantic_job`);
  - the two private semantic-job helpers `jobRevisionPreparationFromSubject`
    and `jobRevisionSubjectAtBasis`.

  The first two now come from their owner modules. The two private helpers
  have no export to load. The harness builds a stage-lifecycle basis, so the
  job arm is not reached, and the two helpers are exempt by name. An exempt
  name that the source no longer reads also fails the check.

**Other harnesses that use `runInNewContext`.**

| Harness | Check | Reason |
| --- | --- | --- |
| `tests/d2-binding-query-reuse.test.mjs` | added (3 lines, in a `test.before` hook) | it runs the emitted `revisionPreparationAtBasis` body against a hand-written stub scope |
| `tests/t287-common-computational-library.test.mjs` | not applicable | `runInNewContext` builds values in another realm; no extracted body runs there |
| `support/malformed-gtl-native-fixture.mjs:259` | not added | outside this item's selector: it uses `vm.createContext({Buffer, URL, console})` with `SourceTextModule` linking, not `runInNewContext`. Imports fail at link time by name. A global that the three listed ones miss would still throw only at use. The same check would take about two lines in its `load`. |

**Result.** Each file is run alone, with the guard preload refusing writes
under the root. Figures are tests/pass/fail/skip.

| File | Root set, before | Root set, after | Root unset, before | Root unset, after |
| --- | --- | --- | --- | --- |
| `d2-evidence-owner-lookup` | 5/2/3/0 | 5/5/0/0 | 5/0/0/5 | 5/0/0/5 |
| `d2-binding-query-reuse` | 7/7/0/0 | 7/7/0/0 | 7/7/0/0 | 7/7/0/0 |

The case titles are the same before and after.

**The loud failure, shown in scratch copies** under
`/private/tmp/abg-td60c-work/demo/`:

- Evidence harness, with `shared/path_confinement` removed from its module
  list: all 5 cases fail with "the extracted revision evidence collector reads
  names its VM context does not bind: pathRelation, pathStrictlyWithin". The
  two refusal cases that used to pass on the vacuous `null` fail too.
- `d2-binding-query-reuse`, with the `admitted` stub removed:
  - The old file fails 7/7, but with indirect errors such as "Cannot read
    properties of undefined (reading 'constructionTask')", "0 !== 1" and
    "'admitted is not defined' !== 'binding correspondence has no earlier
    admitted projection'".
  - The new file fails each case with "the emitted revisionPreparationAtBasis
    reads names its VM context does not bind: admitted".

## Item 2. `t287-d5-authentic-preserved-result` timeout

**What was wrong.** The single case had a 117 s limit. On this machine its
measured duration is about 115 to 122 s, so it times out in the suite and
when run alone.

**Option (a) does not apply.** The lane already uses the shared install owner.
`setupD5RecoveryEnvironment` in
`support/d5-authentic-preserved-result-fixture.mjs` calls
`setupInstalledRootCatalog` from `root-installed-environment.mjs`. The file
has one case, and `admitD5Run` passes `existingEnvironment`, so the file
installs once. No install remains to share.

**Option (b), what changed.** The limit is 180 s. A comment records the
measured laps it comes from. No assertion changed.

**Durations.** Root set, run alone, three runs each. The load average was
about 9 to 12 throughout.

| Run | Limit | Result | Duration (s) | Install setup lap (s) | Last lap, causal negatives (s) |
| --- | --- | --- | --- | --- | --- |
| before 1, 2, 3 | 117 s | timed out | 117.9, 118.6, 118.3 | n/a | not reached: stopped after `crossed_session-admit` at about 109 s |
| measurement 1, 2, 3 (scratch copy) | 600 s | pass | 121.5, 121.0, 118.4 | 41.2, 41.6, 40.1 | 120.6, 120.1, 117.5 |
| after 1, 2, 3 | 180 s | pass | 121.2, 115.8, 115.5 | 41.8, 39.6, 38.9 | n/a |

Root unset, one run each:

| Run | Result | Duration |
| --- | --- | --- |
| before | pass | 117.1 s (just under the 117 s limit) |
| after | pass | 113.7 s |

**Earlier records.**

- In the suite run the case timed out after `crossed_id-admit` at 112.6 s.
- The Executive's rerun alone (`suite4/rerun-d5`) timed out after
  `crossed_session` at 117.0 s.
- In three whole-suite runs it took 114.6 to 118.0 s.
- 180 s is about 1.5 times the slowest duration observed in any of these
  runs: 1.48 times 121.5 s.

## Item 3. The six gated cases with their input present

All runs below use the guard preload, which traces reads and refuses writes
under the root. No write was refused.

### `held-prefix-native-fixture` (5 cases, `t287-held-prefix`)

**Before.** With the fixture variable set, all five cases fail:

| Case | Failure |
| --- | --- |
| 1 | 45 warm reads where 0 is asserted |
| 2 | 1 read where 0 is asserted |
| 3 | 58 reads where 0 is asserted |
| 4, 5 | "event store was not constructed by this ABG module" |

**Bisection.** Each cut is built in scratch (`git archive`, a copy of
`node_modules`, `npm run build`) and runs its own copy of the test:

| Cut | 1 | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- | --- |
| `2b9e540db` (09-24) | pass | pass | pass | pass | pass |
| `0b1187c40` (10-06) | pass | pass | pass | pass | fail (`contractValueKindByRef`) |
| `727f1dbca` (10-09) | pass | pass | pass | pass | fail |
| `67c333799` (10-21) and `df7738b02` | fail (60) | fail (19) | fail (57) | fail (store brand) | fail |
| C-10 `457b5632a`, rc.5 `f49e7533e`, rc.6 `e7179b19b`, `fd38e8227`, rc.9 `e30ac16b4` | pass | pass | fail (19) | fail | fail |
| rc.10 `93a0de75a` and head | fail (45) | fail (1) | fail (58) | fail | fail |

**What the reads are.** A probe assigns each read at head to its row:

- Case 1: all 45 reads are body reads, by location, of the fixture's one
  `basis_admitted` row (5,672 bytes). The three member reads make 19, 13 and
  13 of them.
  - The same three reads inside one `holdOperationBodies` hold make 1 read.
  - With one hold per member, they make 3.
- Case 2: the 1 read is the basis body.
- Case 3: after the cold reopen, each of the 18 other bodies is read once,
  and the basis body is read 40 times.
- Cases 4 and 5:
  - Since `67c333799` both owners admit result and judgment through
    `abg/c_call_outcome.js` (`admitOwnedCCallResult`,
    `admitOwnedCCallJudgment`; ABI5_STDO3_COMPUTATIONAL_BINDING step 5).
    The case's overrides on `abg/index.js` no longer intercept, so the real
    admission meets the fixture's stub store.
  - Since `0b1187c40` the workflow owner also reads
    `port.contractValueKindByRef`.
  - Once both seams are restated, the warm read is 1: the basis body.

**Reading, per case.**

- Cases 2, 4 and 5 are stale tests.
  - The asserted 0 predates RC10's O1 lifetime (library design §10.12).
    Outside a run scope a basis body is not retained, so a held read reads
    each basis row once from its location, and no other row.
  - Cases 4 and 5 also predate the move of the receipts to `c_call_outcome`.
- Cases 1 and 3 are stale, and they also show a product defect.
  - Their 0 is stale for the same O1 reason.
  - Under O1 each read operation reads each basis body once by location.
    After a cold reopen, each prior body is also read once by location: the
    reopen decode, TD-51a `:3812`, the operational history representation
    since `67c333799`. The bound is therefore:
    - case 1: 3 reads, 17,016 bytes, which is the basis row once for each
      of three member reads;
    - case 3: 21 reads, 2,807,775 bytes, which is the 18 other prior rows
      once each and the basis row three times.
  - The cases make 45 and 58 reads. The excess is basis body reads only: 42
    and 37 extra reads of the 5,672-byte basis row.
  - A scratch copy wraps each member read in its own `holdOperationBodies`
    hold. In it both cases pass at exactly this bound
    (`/private/tmp/abg-td60c-work/probe/held-bound.tap`, 5/5).
  - The extra reads come from per-event dependency selections that repeat
    the basis body read. This is because `projectRunTruthAtDurablePrefix` and
    `prepareRunReadAtDurablePrefix`, called outside a read owner, open no
    operation hold.
  - That is the TD-50/TD-51 defect class (REQ-R-ABG3-PROJECTION-025) on a
    path that TD-51a does not hold.
  - The production callers of these ports outside a hold are:
    - `owner_bindings/run_invocation.ts`, several sites. These are TD-51a's
      ruling 2, the four Run owners.
    - `product/project_read_definition_bindings.ts:896`.
    - `abg/qualification_proof.ts:456`.

**What changed.**

- Cases 2, 4 and 5 move to the new catalogue row
  `held-prefix-native-fixture-basis-once`: `runs_with_root`, `conversion`
  done, former variable `ABI5_HELD_PREFIX_NATIVE_FIXTURE`. They now read the
  fixture through `ABI5_EVIDENCE_ROOT`.
- `realOwner` computes `basisRead`, the count and bytes of the fixture's
  basis rows, from the log itself.
- Case 2's `assert.equal(read.reads,0)` and the warm `assert.equal(warm.reads,0)`
  of cases 4 and 5 now compare `{reads, bytes}` with `basisRead`.
- Cases 4 and 5 put their two receipts on `../abg/c_call_outcome.js`, and the
  workflow port supplies `contractValueKindByRef`.
- Cases 1 and 3 have their read assertions restated to the bound above:
  - case 1's `assert.equal(warm.reads,0)`;
  - case 3's `assert.equal(warm.reads,0,'cold acquisition already
    authenticated the prior physical rows')`.

  Both bounds are computed from the log's own rows.
- No other assertion changed.
- Cases 1 and 3 keep the private variable and the row
  `held-prefix-native-fixture` (`failing_with_input_present`). The row now
  holds:
  - those two cases;
  - the second input, `native-hello-prefix.jsonl`, with its sha256 and bytes;
  - the bisection, the probe classification and the excess over the bound.

**Result**, tests/pass/fail/skip:

| Mode | Before | After |
| --- | --- | --- |
| fixture variable set (input present) | 5/0/5/0 | 5/3/2/0 (case 1: 45 reads where 3 are expected; case 3: 58 where 21 are expected) |
| root set | 5/0/0/5 | 5/3/0/2 |
| root unset | 5/0/0/5 | 5/0/0/5 |

### `owner-history-logical-digest` (1 case, `t288-logical-prefix-digest`)

**Failure.** The case fails at `:41` with "Missing expected exception".

- After the test changes byte 0 of the log in place,
  `admitRuntimeEventTransactionAtExpectedPrefix` still reaches its action
  and appends a fourth event.
- The durable-prefix variant at `:40` also reaches its action. `:40` passes
  only because that action is `assert.fail`, whose error satisfies the bare
  `assert.throws`. That assertion is vacuous.

**History.** It fails at every tested cut:

- `ad2a39f40`, the file's first commit;
- `2b9e540db` and `0b1187c40`;
- rc.5, rc.6, `fd38e8227`, rc.9 and rc.10.

It also fails in the recorded run of 2026-10-07: `event-memory-repair-35`,
`commands/focused-prefix-corrected.stdout`, at `:59`.

**Reading.** It is not a superseded input: the history supplies only a
`run_segment_opened` template. It is not a stale test either, since the claim
held at no committed cut.

- `admitRuntimeEventTransactionAtExpectedPrefix` (`event_store.ts:4523`)
  checks only `store.digest()`.
- `appendDurablyBatch` does not re-verify the bytes on disk.
- The `DurablePrefixCoordinate` row of
  `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN` states
  "byte mismatch refuses before append/read result" and "successor
  constructed from verified committed bytes". This reads as requiring the
  refusal.

The reading is an apparent product defect. The test is unchanged; it fails
with its input present and stays gated. The row's `observed` and `note`
record this triage.

**Result**, tests/pass/fail/skip, the same before and after:

| Mode | Result |
| --- | --- |
| history variable set | 1/0/1/0 |
| root set | 1/0/0/1 |
| root unset | 1/0/0/1 |

### Catalogue lane

The catalogue has 69 rows, one more than before.
`verifyEvidenceGateCatalogue()` gives:

- before: 68 gates, 26 rows with inputs, 199 inputs checked;
- after: 69 gates, 27 rows with inputs, 200 inputs checked.

`t292-td60b-evidence-gate-catalogue`, tests/pass/fail/skip:

| Mode | Before | After (at `d101f9e81`) |
| --- | --- | --- |
| root set | 3/3/0/0 | 3/3/0/0 |
| root unset | 3/2/0/1 | 3/2/0/1 |

With the root unset, the pinned-input case skips, as designed.

## Item 4. The 62 skips

**Source.** The table is built from the suite TAP files in `scratchpad/suite4/all/`
(read-only). Those files come from the suite run at `384fd0265`, so each
skip is mapped against the catalogue at that commit. Every skip maps to
exactly one row by file and title, and none is unexplained.

**Since the suite run.**

- One of the 62 no longer exists at `daaffe796`: TD-28c (`8de6b8558`) deleted
  `t287-governed-context` and the row `gc03-native-profile-basis`.
- After TD-60C, three more run with the root set: held-prefix cases 2, 4 and
  5.

**Summary by class.**

| Class | Count | Catalogue status |
| --- | --- | --- |
| A. Needs a live provider or an opt-in variable | 18 | 8 `needs_live_provider`, 10 `opt_in_run` |
| B. Waiting for an output root | 4 | 1 `input_present_needs_output_root`, 2 `input_present_writes_under_root`, 1 `opt_in_run` whose note names the output root (ruling 6) |
| C. The six of item 3 | 6 | `failing_with_input_present` |
| D. Input not found (no recorded value, or the recorded value is outside the root or gone) | 32 | `input_not_found` |
| E. Input outside the root | 2 | `input_outside_root` |
| F. Not explained by the catalogue | 0 | |
| **Total** | **62** | |

**Per row.**

| Class | Row | Status at `384fd0265` | File | Skips |
| --- | --- | --- | --- | --- |
| A | `amendment-witness-live` | needs_live_provider | t287-amendment-witness | 1 |
| A | `declared-testing-live-command` | needs_live_provider | t287-declared-testing-capability | 2 |
| A | `default-library-live` | needs_live_provider | t287-default-library | 1 |
| A | `generic-job-full-native` | needs_live_provider | t287-generic-job-lifecycle | 1 |
| A | `native-selection-live` | needs_live_provider | t287-native-registered-selection | 1 |
| A | `recursive-selection-live` | needs_live_provider | t287-recursive-registered-selection | 1 |
| A | `t287-c1-live-worker` | needs_live_provider | t287-live-worksite-construction | 1 |
| A | `cold-record-material` | opt_in_run | t287-cold-record-decoder | 1 |
| A | `context-public-proof` | opt_in_run | t287-management-context | 1 |
| A | `frame-native-controlled-run` | opt_in_run | t287-native-frame-observation | 1 |
| A | `generic-job-correction-native` | opt_in_run | t287-generic-job-revision | 1 |
| A | `held-basis-lifetime-workload50` | opt_in_run | t287-held-basis-lifetime | 1 |
| A | `installed-qualification-conservation` | opt_in_run | t287-installed-qualification-conservation | 1 |
| A | `steel02-consumer-declaration-installed` | opt_in_run | steel-consumer-declaration | 1 |
| A | `steel03-single-start-installed` | opt_in_run | w2-steel-single-start-installed | 1 |
| A | `steel04-serial-branch-installed` | opt_in_run | w2-steel-serial-branch-installed | 2 |
| B | `declaration-baseline-module` | input_present_needs_output_root | t287-declaration-closure-symbol-reuse | 1 |
| B | `governance-covered-proof-root` | opt_in_run | t287-governance-covered-source-use | 1 |
| B | `s03-evidence-directory` | input_present_writes_under_root | t287-s03-automatic | 2 |
| C | `held-prefix-native-fixture` | failing_with_input_present | t287-held-prefix | 5 |
| C | `owner-history-logical-digest` | failing_with_input_present | t288-logical-prefix-digest | 1 |
| D | `c2-carrier-fixture` | input_not_found | steel-basic-cli-c2 | 6 |
| D | `conformance-owner-reuse` | input_not_found | t287-conformance-owner-reuse | 1 |
| D | `event-time-history` | input_not_found | t287-native-event-time | 1 |
| D | `frame-history` | input_not_found | t287-native-frame-observation | 1 |
| D | `gc03-native-profile-basis` | input_not_found | t287-governed-context (deleted by TD-28c) | 1 |
| D | `governance-c2-material-selectors` | input_not_found | t287-governance-covered-source-use | 1 |
| D | `native-execution-retained-log` | input_not_found | t287-native-worksite-execution | 1 |
| D | `native-reacquisition-root` | input_not_found | t287-native-work-reacquisition | 1 |
| D | `native-source-ready-catalog` | input_not_found | t287-native-worksite-execution | 1 |
| D | `owned-proof-native-request` | input_not_found | t287-owned-native-proof | 1 |
| D | `owner-reuse-predecessor` | input_not_found | t287-native-owner-reuse | 2 |
| D | `predecessor-context` | input_not_found | t287-predecessor-context | 1 |
| D | `preparation-resolve-call` | input_not_found | t287-w2-05-static-binding-algebra | 1 |
| D | `qualification-source-release-roots` | input_not_found | t287-qualification-law | 1 |
| D | `reacquisition-normalization-root` | input_not_found | t287-native-work-reacquisition-normalization | 1 |
| D | `retained-consumer-config` | input_not_found | t287-retained-installed-consumer | 1 |
| D | `route-native-scratch` | input_not_found | t287-route-reconstruction | 1 |
| D | `s02-projection-fixture` | input_not_found | t287-public-terminal-projection | 3 |
| D | `selected-action-evidence-root` | input_not_found | t287-selected-action | 1 |
| D | `selected-action-owner-subject` | input_not_found | t287-selected-action-authority | 1 |
| D | `steel03-start-call-path` | input_not_found | w2-steel-single-start-closure | 1 |
| D | `stream-held-event-log` | input_not_found | t287-management-stream-drain | 3 |
| E | `qualification-stage-fixtures` | input_outside_root | t287-qualification-law | 2 |

The mapping script and the catalogue copy at `384fd0265` are in
`/private/tmp/abg-td60c-work/skips/`.

## Item 5. Inventory members changed

The inventory (1,191 members) was last regenerated at `09d7f03e1`. Three of
the changed files are members, and the inventory and recipe are not edited.

| Member | Inventory digest | At base `daaffe796` | At this branch | Recipe |
| --- | --- | --- | --- | --- |
| `test_env/support/d2-evidence-owner-harness.mjs` | `f8cc208e…` | `36c984cc…` (already differs) | `a70af591…` | listed (`verification-recipe.json:3370`) |
| `test_env/tests/d2-binding-query-reuse.test.mjs` | `4997f1d6…` | `4997f1d6…` (matches) | `d5ae4e7a…` | listed (`:3614`) |
| `test_env/tests/t287-held-prefix.test.mjs` | `2165a7b8…` | `0846fe07…` (already differs) | `210b3ed2…` | listed (`:3974`) |

Three changed files are not inventory members:

- `test_env/support/vm-context-names.mjs` (new);
- `test_env/tests/t287-d5-authentic-preserved-result.test.mjs`;
- `test_env/support/evidence-gates.json`.

## Deviations

1. **Item 1.** In `d2-binding-query-reuse` the check runs in a `test.before`
   hook, not at module top level. A top-level throw reports only one "test
   failed" entry for the file, while the hook puts the named message on every
   case.
2. **Item 2.** The repair uses option (b), because option (a) is already in
   place (see item 2). The measurements ran in a scratch copy with a 600 s
   limit and lap diagnostics; the committed file carries only the new limit
   and its comment.
3. **Item 3's premise does not fully hold.** The brief says the cause of the
   six cases, the basis-body re-read defect, is repaired by TD-51a
   (`36e269eae`).
   - TD-51a's hold covers read owners and the witness owner only. Cases 1
     and 3 call the ports directly, so they still show the re-reads.
   - Cases 2, 4 and 5 fail on stale assertions and seams.
   - The t288 case was never caused by the re-read defect.
4. **Old cuts.** The bisection builds old cuts in scratch with `git archive`
   and does not register worktrees. No other worktree and no main checkout
   file is touched.
5. **Item 3 split.** The held-prefix row is split by case. Converting only
   the passing cases needs a separate row, because the catalogue keys status
   per row.
6. **Item 3, "red".** The three failing cases stay gated by their private
   variables, as `failing_with_input_present`. This follows the convention
   the second gate slice used for a red case. In a suite run with only the
   root set they skip, not fail.

## Notes

- **The two private semantic-job helpers.** `jobRevisionPreparationFromSubject`
  and `jobRevisionSubjectAtBasis` are exempt, by name, from the free-name
  check in the evidence harness. Exporting them would be a source change,
  which this package may not make.
- **Inventory.** `test_env/support/vm-context-names.mjs` is a new support
  module that the inventory does not list. Three member digests change, and
  two of them already differ from base. Both points are for the next
  inventory regeneration.

## Reported for the register, and items that need a ruling

1. **Held-prefix cases 1 and 3: a report, not a ruling.** This is evidence
   for the second part of TD-51. Each case fails only on basis body re-reads
   beyond the O1 bound, 42 and 37 extra reads. Inside one port call, 19
   re-reads of one basis body is the per-event-selection breach of
   REQ-R-ABG3-PROJECTION-025 that TD-60T case 1 classified as a defect.
   The production callers of the ports outside a hold are:
   - `owner_bindings/run_invocation.ts` (TD-51a ruling 2, the four Run
     owners);
   - `product/project_read_definition_bindings.ts:896`;
   - `abg/qualification_proof.ts:456`.

   The cases go green at the bound when each member read runs in an
   operation hold.
2. **`owner-history-logical-digest`: needs a ruling.** This is an apparent
   product defect: a held owner admits an append after a same-length change
   of its log in place. It needs a register entry, or a ruling that the
   design row does not require the refusal.
   - Separately, the assertion at `:40` is vacuous: it is a bare
     `assert.throws` around an action that is `assert.fail`.
   - A matcher there would move the case's first failure to `:40` and hide
     `:41`, so it is not added in this package. Whoever repairs the owner
     should add it with the repair.
