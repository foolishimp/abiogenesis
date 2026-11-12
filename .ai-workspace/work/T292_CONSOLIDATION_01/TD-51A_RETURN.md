# TD-51a Return: basis body re-reads within one operation

Writer: Claude Opus 5.5. Branch `claude/td51a-basis-body-rereads` from local
`main` at `727ec20f3`, worktree `/private/tmp/abg-td51a`. Change class:
realization_refactor, with one design paragraph addition. No push, no tag.

**Status: done. Inside a read owner or the witness owner, each body the
operation selects is now read from the store file once by location, and
nothing is held after the operation returns. The witness environment, which
`product/` builds before the witness owner opens its hold, is outside the
hold (ruling 1).
Both failing cases pass unchanged. On the cross-cut fixture each Definition
read makes 37 basis body reads instead of 11,461 (Run members) or 92,732
(graph-call members). `t287-held-basis-lifetime` passes unchanged. Replay of
the eleven TD-25R logs is identical on base and final, both through array
prefixes and through owned reopened histories. Cold reads of the live rc.12
store are about 35 % faster (medians, five runs each). 76 of the 78 lane
files give the same outcome per test on both builds. The other two
(`t292-td36r-*`) fail only because the committed candidate basis still names
the base build. They pass once the basis is refreshed, which is the identity
regeneration step at merge, as in `727ec20f3` (merge note, section 12).
Three points need the Executive's ruling (section 12).**

Commits on the branch, oldest first:

| Commit | Content |
| --- | --- |
| `9709fbe98` | operation hold (`runtime_history.ts`, `event_prefix.ts`), the three owners that open it, the new lane `t287-held-operation-bodies` |
| `6e1bbbf54` | the design paragraph addition |
| this commit | the Return |

## 1. Mechanism

The defect: without an O1 handle, `RuntimeHistory.event` keeps a basis body
only in the selected-body map the caller passes in, and
`RuntimeHistorySelection.materialize()` makes a new map on every call. Each
per-event selection inside one read therefore re-reads and re-authenticates
the same basis bodies from the file. `admitRootEventProfileUpgrade`
(`event_store.ts:3955`) re-materializes the entry history the same way.

The fix is an operation hold on the store history. Every line is in `T/code/src/abg`:

| Where | What |
| --- | --- |
| `runtime_history.ts:81-85` | `#operationBodies` (row index to body location and decoded event) and the counter `#operationHolds` |
| `runtime_history.ts:327` | `event()` takes a kept body from `#verifiedBodies`, then `#operationBodies`. A kept body is reused only when its offset, byte length and physical digest equal the row's, as before |
| `runtime_history.ts:346` | after the first authenticated read of a basis body that no run scope holds, the body goes to `#operationBodies` while a hold is open. The O1 branch (`#basisHolds`) comes first and is unchanged |
| `runtime_history.ts:351-366` | `holdOperationBodies()`: opens one counted hold and returns its release. The release is idempotent; the last release clears `#operationBodies`; a release after disposal (epoch changed) is inert. A validation view opens nothing |
| `runtime_history.ts:406` | `disposeBasisRetention()` (rollback through `truncate`, physical close through `releaseDurableOwnership`) also zeroes the holds and clears the bodies |
| `event_prefix.ts:93-100` | `holdOperationBodies(coordinate)`: the hold on the active held history of an acquired coordinate; a cold, closed or copied coordinate opens nothing |
| `project_read_definition_bindings.ts:759-760`, `:878-880` | `runReadKernel` (every Run read, reopen or borrowed held) opens the hold right after `acquired.resource` and releases it in `finally` |
| `project_read_definition_bindings.ts:928-929`, `:982-984` | legacy `binding()` (reopen reads), the same |
| `witness_definition_bindings.ts:217-218`, `:361-363` | `witnessOwner` (witness reprice, attest, hygiene stamp, run stopped and the other witness members), the same |

Why this owner, and why it is bounded:

- The owners that acquire the event resource are the operation. Each runs
  its body as one synchronous `Effect.try`, so a hold opens and closes inside
  one synchronous stack and cannot interleave with another operation on the
  same history.
- First reads are unchanged. A body enters `#operationBodies` only after
  `readRuntimeHistoryRowBytes` has done its `fstat` identity checks and
  physical digest, and after decode, exactly as on base. No caller passes
  history in; the store's own history holds the bodies.
- Nothing is retained after the operation returns. The release runs on every
  exit of the `try` (result, refusal, thrown defect). A reopened resource is
  physically closed by `finishRunRead` or `abandonAbgEventResource` before
  the `finally`, which disposes the hold first; the release is then inert.
- The O1 lifetime is unchanged. Operation-held bodies are not O1 retention:
  no O1 gauge (`observeRuntimeHistoryBasisRetention`, five keys unchanged)
  counts them, and no O1 handle is opened or released by them. A basis row
  whose invocation an open run scope holds still goes to the O1 maps.
- There is no process-wide or store-wide cache. The map lives on the store
  history, holds only bodies that an open operation selected, and is empty
  whenever no operation is open.

The profile upgrade: `admitRootEventProfileUpgrade` is reached only through
`admitWitnessedAct` (`witness_admission_operation.ts:1168`), whose only
production caller is `witnessOwner` (`witness_definition_bindings.ts:304`),
inside the witness hold. Its
`state.history.select().materialize()` (`:3955`) now finds row 1 (the basis
row) in the hold. `assertRootEventProfileBoundary` and the upgrade are not
edited, so their refusals, their order and their messages are unchanged by
construction.

The `:3812` site is inside the cold decode
(`decodeRuntimeHistoryDescriptor` → `foldRuntimeHistoryDescriptor`) of
`reopenEventStore`, which `acquireAbgEventResource` calls before an owner has
a resource. The decoded history is not yet the active held history of any
coordinate, so no operation holds it. Its temporary materialization reads
each pre-boundary body once by location, on base and on final alike (the
boundary probe, section 8). It is not changed. After acquisition, the
operation reads the basis row once more, from its location, under its hold.

`event_store.ts` has no hunk; the concurrent package's `:2930` area is not
touched.

## 2. Design text

Added to the "O1 lifetime (RC10)" paragraph of
`T/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`, after the
sentence ending "consumer-local selected-body map." Nothing else in the note
changes.

> For a read or admission operation that consumer is the whole operation:
> `runReadKernel` and `binding` (`project_read_definition_bindings.ts`) and
> `witnessOwner` (`witness_definition_bindings.ts`) open one operation hold
> (`holdOperationBodies`) right after acquiring the resource and release it in
> `finally`, so a body the operation selects is read from its location and
> authenticated once, and the last release drops it. Rollback and physical close
> dispose the operation hold too; it is not O1 retention, no O1 gauge counts it,
> and `t287-held-operation-bodies.test.mjs` measures its physical body reads.

## 3. Read counts

Cross-cut fixture of `t287-cross-cut-public-read` (809 non-basis rows, 37
basis rows, 27,080,944 body bytes), one Definition read per member on a held
reopened resource, at one fixed fixture path. Physical `readSync` calls on
the log, classified by row (`/private/tmp/abg-td51a-work/probe/crosscut-probe.mjs`,
outputs `probe-base-fixed.jsonl`, `probe-final-fixed.jsonl`).

| Member | Base: basis body reads (max per row) | Final: basis body reads (max per row) | Base: all reads, bytes | Final: all reads, bytes |
| --- | ---: | ---: | --- | --- |
| `run_status` | 11,461 (809) | 37 (1) | 12,477, 638,565,434 | 1,053, 27,080,944 |
| `run_result` | 11,461 (809) | 37 (1) | 12,477, 638,565,434 | 1,053, 27,080,944 |
| `run_replay` | 11,461 (809) | 37 (1) | 12,477, 638,565,434 | 1,053, 27,080,944 |
| `graph_call_result` | 92,732 (4,029) | 37 (1) | 93,748, 4,139,848,395 | 1,053, 27,080,944 |
| `graph_call_replay` | 92,732 (4,029) | 37 (1) | 93,748, 4,139,848,395 | 1,053, 27,080,944 |

Non-basis body reads are 809 (one per row) on both builds; the 207 decode
chunk reads are the same. Final reads equal the lane's expected 1,053 reads
and 27,080,944 bytes exactly. Owner output and receipt digests are identical
on base and final for all five members.

Witness profile boundary (`witness-reprice-definition-binding`, its own
diagnostic, which classifies each read by its owner reader): on base the
test stops at "no later handoff re-reads the complete closed population
(3/3)", three body reads by location for three rows. On final, the
acquisition decodes the 776-byte entry extent in one chunk
(`foldRuntimeHistoryDescriptor`), and the call then makes 2 body reads by
location (`readRuntimeHistoryRowBytes`), 4,223 bytes: rows 1 and 3
(776 + 3,447), each once. In this lane the Product environment is injected,
so `withAdmissionAuthority` makes no reads.

Owned replay of the seven reopenable TD-25R logs (section 7): physical body
reads for the whole replay script, base / final: live rc.12 store 7,430 /
1,751 (122,274,984 / 15,022,093 bytes); default library 87 / 48; `MdmivN`
68 / 31; `gjgeWi` 326 / 224; registered selection 728 / 318; native
workspace work 469 / 425 (192,132,681 / 23,948,753 bytes); `hc2-current-intent`
560 / 194. Each read in the script is its own operation, so a row read by
two operations is read twice.

## 4. The two failing cases

Command as in section 5. Before on `base-root` (`727ec20f3`), after on the
worktree build.

| Lane | Before tests / pass / fail / skip | After tests / pass / fail / skip |
| --- | --- | --- |
| `t287-cross-cut-public-read` | 5 / 4 / 1 / 0 | 5 / 5 / 0 / 0 |
| `witness-reprice-definition-binding` | 15 / 14 / 1 / 0 | 15 / 15 / 0 / 0 |

Before: `t287-cross-cut-public-read` fails "different-cut native Definition
reads keep blocked absence and exact historical child result/replay" at
"run_status decodes the extent in bounded chunks and reads each body once by
location"; `witness-reprice-definition-binding` fails "Public profile reprice
retains the exact L-to-P boundary and standalone cold content checks" with
"live profile boundary: no later handoff re-reads the complete closed
population (3/3)". After, both pass with the files unchanged. The cross-cut
diagnostic reports 1,053 reads and 27,080,944 bytes for every member.

## 5. Lanes

Command, from T, one file at a time:
`mkdir -p /private/tmp/abg-td51a-tmp && TMPDIR=/private/tmp/abg-td51a-tmp ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap test_env/tests/<file>.test.mjs`
(`/private/tmp/abg-td51a-work/scripts/lanes.sh`). Before on `base-root`
(`727ec20f3`), after on the worktree build of `6e1bbbf54` (identity in
section 10). The two runs overlapped, at load averages of 10 to 20 on 16
cores. TAP files: `/private/tmp/abg-td51a-work/lanes-before/`, `lanes-after/`,
`lanes-after-rerun/`, `lanes-after-refreshed-basis/`, `lanes-final-build/`.

Selection (78 files, `lanes-all.txt`): the brief's named lanes, and every
file under `test_env/tests` naming `materialize`,
`retainExecutionBasisLifetime`, `indexedRuntimeEvents` or
`admitRootEventProfileUpgrade` (`rg -l`, excluding `test_runs`, `downstream`
and `evidence`), without the two cases of section 4. Plus the new lane.

| Lane | Before tests / pass / fail / skip | After tests / pass / fail / skip |
| --- | --- | --- |
| `t287-held-operation-bodies` (new) | 1 / 0 / 1 / 0 (scratch copy on base) | 1 / 1 / 0 / 0 |
| `generic-input-retention` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 |
| `m5-c-algebra-validation` | 22 / 19 / 0 / 3 | 22 / 19 / 0 / 3 |
| `m5-consensus-module` | 16 / 16 / 0 / 0 | 16 / 16 / 0 / 0 |
| `m5-event-calculus-runtime` | 19 / 18 / 0 / 1 | 19 / 18 / 0 / 1 |
| `m5-event-store-reopen` | 27 / 27 / 0 / 0 | 27 / 27 / 0 / 0 |
| `m5-fresh-process-reconstruction` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `r1-packed-artifact` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `r10-projection-contracts` | 11 / 11 / 0 / 0 | 11 / 11 / 0 / 0 |
| `r2-clean-install` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `r3-workspace-binding` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `r7-graph-validation-basis` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `retained-route-cursor-transition` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `steel-basic-cli-public` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-calculus-fold` | 25 / 25 / 0 / 0 | 25 / 25 / 0 / 0 |
| `t287-common-computational-library` | 16 / 16 / 0 / 0 | 16 / 16 / 0 / 0 |
| `t287-conformance-owner-reuse` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-consensus-ref-shape` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t287-d1-requirement-handoff` | 5 / 2 / 0 / 3 | 5 / 2 / 0 / 3 |
| `t287-d1-semantic-stage` | 3 / 1 / 0 / 2 | 3 / 1 / 0 / 2 |
| `t287-default-library` | 37 / 34 / 0 / 3 | 37 / 34 / 0 / 3 |
| `t287-default-library-fulfillment` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t287-default-library-prerequisites` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t287-default-library-reviews` | 10 / 10 / 0 / 0 | 10 / 10 / 0 / 0 |
| `t287-deferred-application-restoration` | 2 / 0 / 0 / 2 | 2 / 0 / 0 / 2 |
| `t287-event-body-encoding` | 26 / 25 / 0 / 1 | 26 / 25 / 0 / 1 |
| `t287-exact-prefix-projection-reuse` | 3 / 2 / 0 / 1 | 3 / 2 / 0 / 1 |
| `t287-generic-job-meaning` | 5 / 3 / 0 / 2 | 5 / 3 / 0 / 2 |
| `t287-generic-job-parent-foldback` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-governance-covered-source-use` | 9 / 7 / 0 / 2 | 9 / 7 / 0 / 2 |
| `t287-governed-context` | 15 / 14 / 0 / 1 | 15 / 14 / 0 / 1 |
| `t287-gtl-graph-law` | 9 / 9 / 0 / 0 | 9 / 9 / 0 / 0 |
| `t287-gtl-serialization-publication` | 9 / 9 / 0 / 0 | 9 / 9 / 0 / 0 |
| `t287-held-basis-lifetime` | 2 / 1 / 0 / 1 | 2 / 1 / 0 / 1 |
| `t287-held-owner-fold-reuse` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-held-prefix` | 6 / 0 / 0 / 6 | 6 / 0 / 0 / 6 |
| `t287-historical-source-resource` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 |
| `t287-lifecycle-failure-carrier` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t287-management-context` | 14 / 12 / 0 / 2 | 14 / 12 / 0 / 2 |
| `t287-native-assembly-retained-input` | 2 / 1 / 0 / 1 | 2 / 1 / 0 / 1 |
| `t287-native-registered-selection` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-native-semantic-job` | 9 / 9 / 0 / 0 | 9 / 9 / 0 / 0 |
| `t287-native-semantic-revision` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t287-native-work-currentness-consumers` | 6 / 6 / 0 / 0 | 6 / 6 / 0 / 0 |
| `t287-native-work-reacquisition` | 10 / 7 / 0 / 3 | 10 / 7 / 0 / 3 |
| `t287-native-work-unknown-effect` | 10 / 10 / 0 / 0 | 10 / 10 / 0 / 0 |
| `t287-native-workspace-work` | 44 / 43 / 0 / 1 | 44 / 43 / 0 / 1 |
| `t287-ordered-reconstruction` | 7 / 4 / 0 / 3 | 7 / 4 / 0 / 3 |
| `t287-owned-call-reference` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-owned-native-proof` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-owned-process-lifetime` | 34 / 34 / 0 / 0 | 34 / 34 / 0 / 0 |
| `t287-post-binding-worksite-write` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t287-qualification-producer-acquisition-reuse` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `t287-r6-retry-success-exit` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-reconstruction-conservation` | 2 / 0 / 0 / 2 | 2 / 0 / 0 / 2 |
| `t287-recursive-registered-selection` | 7 / 6 / 0 / 1 | 7 / 6 / 0 / 1 |
| `t287-registered-graph-selection` | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 |
| `t287-required-operation-bindings` | 10 / 10 / 0 / 0 | 10 / 10 / 0 / 0 |
| `t287-retry-run-prefix` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `t287-route-reconstruction` | 13 / 11 / 0 / 2 | 13 / 11 / 0 / 2 |
| `t287-runtime-failure-diagnostic` | 21 / 21 / 0 / 0 | 21 / 21 / 0 / 0 |
| `t287-selected-action` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-selected-execution-closure` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-single-address-space-consolidation` | 17 / 17 / 0 / 0 | 17 / 17 / 0 / 0 |
| `t287-st1-installed-cross-owner-hello` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `t287-st2a-g-capability-definition-graph` | 4 / 4 / 0 / 0 | 4 / 4 / 0 / 0 |
| `t287-stdo-run-environment` | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 |
| `t287-undispatched-diagnostic` | 7 / 7 / 0 / 0 | 7 / 7 / 0 / 0 |
| `t287-value-equality` | 5 / 5 / 0 / 0 | 5 / 5 / 0 / 0 |
| `t287-w2-05-install-catalog-owner-chain` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `t287-wave2-owner-chain` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t287-wave2-owner-contract-source-set` | 15 / 15 / 0 / 0 | 15 / 15 / 0 / 0 |
| `t287-worksite-branch-construction` | 2 / 2 / 0 / 0 | 2 / 2 / 0 / 0 |
| `t288-instruction-assembly-owner` | 6 / 4 / 0 / 2 | 6 / 4 / 0 / 2 |
| `t292-td31-stdo-run-environment-shape` | 3 / 3 / 0 / 0 | 3 / 3 / 0 / 0 |
| `t292-td36r-admitted-binding-owner` | 1 / 1 / 0 / 0 | 1 / 0 / 1 / 0 with the committed basis; 1 / 1 / 0 / 0 with the basis refreshed for the final build |
| `t292-td36r-bind-door-strings` | 6 / 6 / 0 / 0 | 1 / 0 / 1 / 0 with the committed basis; 6 / 6 / 0 / 0 with the basis refreshed for the final build |
| `t292-td37a-worksite-subject` | 16 / 16 / 0 / 0 | 16 / 16 / 0 / 0 |
| `w2-steel-single-start-closure` | 8 / 1 / 0 / 7 | 8 / 1 / 0 / 7 |

Totals over the 78 files: before 628 tests, 569 pass, 0 fail, 59 skip; after
623, 562, 2, 59. Compared per test name (TD-25R's `tapcmp.py`), 76 files give
the same outcome for every test. The other two are the candidate basis pin:

- `t292-td36r-admitted-binding-owner` and `t292-td36r-bind-door-strings`
  pack the tenant and verify the archive against the committed fixture
  `test_env/fixtures/abi5-root-candidate-basis.json` (`readCandidateBasis`,
  not the `packed_artifact` default). That fixture names the base build
  (`productContentDigest` `sha256:a4e58672…`), so any source change refuses
  with `artifact_digest_mismatch` ("artifact bytes differ from the
  externally expected artifact identity") before the test body runs; the
  bind-door file then reports 1 test instead of 6. Rerun alone, the same.
  With the fixture refreshed for the final build (`node
  scripts/refresh-candidate-basis.mjs`: artifact
  `sha256:41d724f895e78c4a03051dd322cbe32339a2723709dbea1eaa3d46f62a8b4c99`,
  content `sha256:fbf2a3e1…`, manifest
  `sha256:5757d3aa2c95aa2614831cf27171c3636a8f12d9761a704848ef22d16ce2036a`),
  both give the base outcome for every test (1/1 and 6/6). The refreshed
  fixture is a generated file and is restored, not committed (merge note,
  section 12).

Skips (59, the same tests on both builds) are the files' own gates that the
brief's command does not set: retained or captured evidence variables
(`ABI5_HELD_PREFIX_NATIVE_FIXTURE`, `ABI5_PREFIX_REUSE_OBSERVATIONS`, the
`ABI5_STEEL03_RETAINED_*` roots and others), live selectors
(`ABI5_DEFAULT_LIBRARY_LIVE`, `ABI5_RECURSIVE_SELECTION_LIVE`,
`ABI5_NATIVE_SELECTION_LIVE`), the separately selected
`ABG_RC10_BASIS_LIFETIME_MODE=workload50` of `t287-held-basis-lifetime`, and
one STDO basis gate in `t287-stdo-run-environment` (the recipe's native
profile requires `stdo://releases/v3.0.2/`; the Product basis is
`v3.0.4`).

On the rebuilt final tree (section 10), `witness-reprice-definition-binding`
(15/15), `t287-held-operation-bodies` (1/1) and `t287-held-basis-lifetime`
(2/1/0/1) were run again with the same results.

Build and lints on the final tree: `npm run build`, `lint:imports` (3
forbidden owner pairs hold), `lint:lifecycle` (292 modules, no offender) and
`lint:calculus` (no offender) pass.

## 6. Retention lane

`T/test_env/tests/t287-held-operation-bodies.test.mjs` (new, 183 lines). It
runs on a held reopened store of the existing language smoke fixture and
counts physical body reads by matching `readSync` calls on the log's
descriptor (by `fstat` device and inode) and classifying each by row offset
and length.

- Two actual start Runs give two basis rows outside every open scope; the O1
  gauges are zero afterwards.
- For `run_status` and `run_replay`: the first read reads every selected body
  at most once, selects at least one basis row, and leaves the gauges zero. A
  repeated read gives the same output, reads the same basis rows again exactly
  once each (nothing kept across operations), reads no non-basis body, and
  leaves the gauges zero.
- A run scope of another invocation open across a read: the read still reads
  its basis rows; gauges show only the open handle.
- A run scope of the read's own invocation: after one read the gauges show
  exactly its own basis bodies; the next read leaves the gauges unchanged and
  reads only the rows outside the scope; after the scope releases, the gauges
  are zero and the next read reads them again.
- The mechanism directly: two `indexedRuntimeEvents(prefix, 'kind:basis_admitted')`
  without a hold read each basis row twice; with `holdOperationBodies` open,
  once each, and the gauges stay zero; after a double release one selection
  reads them again once.
- Physical close (`closeAbgEventResource`) with a hold open disposes it: the
  closed cut reads its bodies again; the late release is inert; a closed
  coordinate opens no hold.

Rollback disposal (`truncate` after a failed append) is not driven by this
lane, as in `t287-held-basis-lifetime`.

| Build | Result |
| --- | --- |
| base (`727ec20f3`, scratch copy of the lane) | 1 / 0 / 1 / 0: `run_status: each body is read at most once within the read: {"37":13}` |
| final | 1 / 1 / 0 / 0 |

Final diagnostic: `{"basisRows":2,"secondRun":{"basisReads":{"37":1},"otherBodyReads":30},"run_status":{"firstReads":{"37":1},"againBasisReads":{"37":1}},"run_replay":{"firstReads":{"37":1},"againBasisReads":{"37":1}}}`.

`t287-held-basis-lifetime` is not edited and gives the same result on both
builds (section 5).

## 7. Replay comparison

Eleven logs of TD-25R (`/private/tmp/abg-td25r-work/replay-logs.txt`).

Array prefixes: TD-25R's `/private/tmp/abg-td25r-work/scripts/replay-log.mjs`
(whole-log replay digest, state digest, status, continuations, F_H
projection and facts, per-Run replay against full authority). Base and
final outputs: **11 of 11 identical**. Seven logs replay; four refuse at
decode with the same message on both builds.

Owned histories: `/private/tmp/abg-td51a-work/probe/owned-replay.mjs` copies
each log to a fixed path, reopens it as a held store (trying the legacy
profile, the current profile and the log's own last profile in the reopen
authority), and reads through the owned path: whole replay, held fluents,
F_H projection and facts, and per Run the scoped replay plus `run_status`,
`run_result` and `run_replay` prepare and project digests. On final each
read runs under its own `holdOperationBodies`; base has no hold. Outputs,
without the read counters and the hold flag: **11 of 11 identical**. Seven
logs reopen; four refuse reopen with the same codes and messages on both
builds, the same four the array path refuses at decode.

| Log | Rows | Array path (both builds) | Owned path (both builds) |
| --- | ---: | --- | --- |
| live rc.12 Run, `/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl` | 1,695 | `sha256:3800fb111acfede513425e706737e1637b7dfd210aac2fe68015eb3b47f5c5a5`, 1 Run | same digest, 1 Run |
| default library, `blocked-testing-diagnostic-001` | 44 | `sha256:40028725031a6ab8f143fa7ba6cdff4a8b80e6af2ad3bfe8cd28784295306a11`, 1 Run | same digest, 1 Run |
| retry, `abi5-root-env-MdmivN` | 27 | `sha256:6dbf55865ef5692a2ef9b5a43e84a54ab78d1a69c36980568923cd843cf3bc1c`, 1 Run | same digest, 1 Run |
| re-entry, `abi5-root-env-gjgeWi` | 216 | `sha256:0d3923da558e1b89dafabc8eff59521fdb5d164f552fffccca7c29cdcabef091`, 1 Run | same digest, 1 Run |
| registered selection, recursion | 282 | whole replay refuses ("run_stopped event and run_terminal HoldsAt truth disagree"), 7 Run digests | same refusal, 7 Runs |
| native workspace work | 421 | `sha256:bc4a919ee1d0d395b11b8487d1c51483efa500422dfe2d01068fed8a510275ae`, 1 Run | same digest, 1 Run |
| construction intent superseded, `hc2-current-intent` | 166 | whole replay refuses ("requires zero or one exact run_stopped event"), 2 Run digests | same refusal, 2 Runs |
| r10 proof log | | decode refuses ("runtime event payload matches no admitted event-contract variant") | reopen refused, same message |
| RC1 F_H hold, `s02-installed-continuation-19` | | decode refuses ("durable ABG event log contains a noncanonical event") | reopen refused, same message; with its own profile, `contract_mismatch` |
| RC1 F_H hold, `s02-installed-continuation-18` | | decode refuses, same | reopen refused, same message; with its own profile, `contract_mismatch` |
| RC1 F_H hold, `s02-installed-continuation-04` | | decode refuses ("event stamp differs from the exact native profile schedule") | reopen refused, same message; with its own profile, `contract_mismatch` |

Outputs: `/private/tmp/abg-td51a-work/replay-{base,final}.jsonl` and
`owned-replay3-{base,final}.jsonl`.

## 8. Profile boundary probe

`/private/tmp/abg-td51a-work/probe/boundary-probe.mjs` performs a Public
profile reprice on a three-row legacy log and reopens the successor, with
stack frames for every read. On base and final the reopen reads the 6,393-byte
extent in one chunk, then rows 1 (`basis_admitted`) and 2
(`public_operation_admitted`) once each, from
`RuntimeHistorySelection.materialize` at `:3812`
(`foldRuntimeHistoryDescriptor`). The read lists are identical apart from
line numbers in `runtime_history.js`.

## 9. Timing

Cold Definition read of the live rc.12 store (1,695 rows, 14,506,732
bytes): a fresh process per run, one reopen-handoff read of the last Run,
base and final interleaved, at one fixed fixture path
(`/private/tmp/abg-td51a-work/probe/cold-read.mjs`, output `timing-1.jsonl`).
Load averages during the runs: 11.8 to 14.5 (1 minute), 13.0 to 13.6
(5 minutes), on 16 cores, with both lane runs active.

| Member | Base wall ms (5 runs) | Base median | Final wall ms (5 runs) | Final median | Change |
| --- | --- | ---: | --- | ---: | ---: |
| `run_status` | 3,394 3,708 3,304 3,511 3,540 | 3,511 | 2,342 2,265 2,251 2,264 2,121 | 2,264 | −35.5 % |
| `run_replay` | 3,391 3,684 3,387 4,444 5,379 | 3,684 | 2,348 2,349 2,192 3,707 2,698 | 2,349 | −36.2 % |

CPU medians: `run_status` 3,547 → 2,305 ms, `run_replay` 3,611 → 2,403 ms.
Log reads per read: 4,270 calls and 73,175,941 bytes on base, 1,919 calls
and 29,059,114 bytes on final. Output digests are identical on base and final
for each member. No regression.

Cross-cut fixture, single runs under the same load (section 3 probe):
`run_status` 12,560 → 1,162 ms, `graph_call_result` 77,028 → 3,309 ms.

## 10. Identity digests

After the final build of `6e1bbbf54` (before restoring generated files). The
base column is `base-root`'s own build of `727ec20f3`; it equals the
manifest committed at `727ec20f3`.

| Identity | Base (`727ec20f3`) | Final |
| --- | --- | --- |
| `productContentDigest` | `sha256:a4e58672516210090e7ec730d1b86f70517291c0971c95ab2b32170d1166c98c` | `sha256:fbf2a3e19c3b4de234e16d4d69647ea4d6188c0246a4580625eb390783b66288` |
| `contributionManifestDigest` | `sha256:95dcec88e32b128ba82f59262d12ed71d8c1b422b9dae0df1007cb786ddfaa78` | `sha256:d6d0db95a26efc886de1419cd160eafab34269b060eaced66ecf48aa42178746` |
| `publicContractCatalog.catalogDigest` | `sha256:8c5f262f2e7b9fcdef40a80d18b262aa90e4ea3cee854b1f01d52b67773c1733` | unchanged |
| capability graph `graphDigest` | `sha256:f47c46d701cbb01aec4ee0a61d36527b091ec96608300f7e6d0fbc0d13a507a8` | `sha256:4f1368ff652fb43148e67d6696c6996bba3535c8daabda4eb9d135e57d338f5b` |
| capability graph file `contentDigest` | `sha256:ce7391ea14dfc20b92764e65f776e2477a0832e28d62ac26b4cb23649f0477df` | `sha256:59a9d696e3ad9fbd6bb854e72faaff157ae80778542810bb9a824a87b1a62f89` |

The build changes two tracked files, `contracts/capabilities/capability-definition-graph.json`
and `product-toolchain-manifest.json`, one line each, in digest and
reference values that follow the new content digest. The build leaves
`test_env/fixtures/abi5-root-candidate-basis.json` unchanged; it was
refreshed by hand only to run the two pinned lanes (section 5). All three
files are restored before every commit; the branch carries no generated
file. The design note is outside the package `files` list (`build/**`,
`contracts/**`, the manifest), so the design commit does not change
identity. A second `npm run build` after both lane runs gives the same five
digests as the build the after-lanes ran on.

## 11. Lines changed

`git diff --numstat 727ec20f3` over the branch:

| File | Added | Removed |
| --- | ---: | ---: |
| `code/src/abg/runtime_history.ts` | 28 | 3 |
| `code/src/abg/project_read_definition_bindings.ts` | 9 | 0 |
| `code/src/abg/event_prefix.ts` | 8 | 0 |
| `code/src/abg/witness_definition_bindings.ts` | 5 | 1 |
| `test_env/tests/t287-held-operation-bodies.test.mjs` (new) | 183 | 0 |
| `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` | 8 | 0 |

Source: 50 added, 4 removed, in four files under `abg/`. `git diff
--name-only 727ec20f3..HEAD` lists only the six files above (and this
Return): no file under `hog/`, `gtl/`, `product/` or `owner_bindings/`, no
`abg/calculus/rules.ts`, no `abg/event_store.ts`, no existing test. `git diff
--quiet 727ec20f3 HEAD` over `t287-cross-cut-public-read.test.mjs`,
`witness-reprice-definition-binding.test.mjs` and
`t287-held-basis-lifetime.test.mjs` exits 0.

Local `main` has moved past the base to `46397ec36`. It merges TD-25S
(`event_store.ts`, one line in the retry progress admission check, and other
passages of the same design note), TD-60B (deletes six of this package's
lane files, among them `t287-reconstruction-conservation`,
`t287-selected-execution-closure` and `t287-stdo-run-environment`, and
retires gated cases in others) and an identity regeneration (`b4a9d8f76`).
None of these commits touches the four source files or the new lane. `git
merge-tree --write-tree main HEAD` is clean, and the support modules and
names the new lane imports exist unchanged on `main`. The lanes in this
Return ran on the `727ec20f3` base, not on `main`.

## 12. Deviations, residuals and rulings

Deviations:

- Lanes before run on `base-root`, an rsync copy of the worktree at
  `727ec20f3` without `.git`, with its own build; lanes after run on the
  worktree build. The two runs overlapped in time, sharing one `TMPDIR`.
- The candidate basis fixture was refreshed in the worktree to run the two
  pinned lanes and then restored; it is not committed.

Residuals:

- `withAdmissionAuthority` (`product/admission_authority.ts:506`) builds the
  witness environment after acquiring the resource and before `witnessOwner`
  opens its hold. Its selections are outside the hold. It is under
  `product/`, so it is not changed.
- Run operations (`owner_bindings/run_invocation.ts`) open no operation hold.
  Their own invocation's basis rows are in O1 retention, but a Run that
  selects an earlier Run's basis rows still reads them per selection. The
  lane's second start Run read the earlier basis row once, so no re-read was
  observed there; it is not asserted.
- `:3812`: the reopen decode reads each pre-boundary body once, and the next
  operation reads the basis row once more (section 8).
- Rollback disposal of the operation hold is coded (`disposeBasisRetention`)
  but not driven by a lane.

Rulings needed:

1. Witness hold placement in `witnessOwner` (`abg/`), not in
   `withAdmissionAuthority` (`product/`): accept, or extend the hold to the
   environment construction, which edits `product/`.
2. Run operations: leave without an operation hold (as now), or open one in
   the four run owners of `owner_bindings/run_invocation.ts`.
3. `:3812`: accept the cold decode's single read of each pre-boundary body
   plus the operation's one later read of the basis row (as now).

Merge note: the identity regeneration at merge (manifest, capability graph
and `test_env/fixtures/abi5-root-candidate-basis.json` through `node
scripts/refresh-candidate-basis.mjs`, as in `727ec20f3`) turns the two
`t292-td36r-*` lanes green; until then they are red on this branch. The
refreshed values in section 5 hold for this branch on `727ec20f3`; after
the merge with the current `main` the identity differs.
