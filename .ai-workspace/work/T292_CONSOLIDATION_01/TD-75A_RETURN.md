# TD-75a Return: stopped at the first stop condition

**Status: Stopped before any code change.** A Public reader observes the
unfiltered cleanup-live census today: `project.read` member `workspace_replay`
hashes the whole-workspace Event Calculus projection, effect rows included,
into its Public `replay.digest`. Reading the owners suggests the census
difference is reachable; no test drove it (section 3). The filter is not
applied, and no lane is added. No recorded log carries the history, so no
recorded replay digest or Public result changes under the filter.

The stop condition was read so that "a Public result" covers results not yet
recorded. If only recorded results were meant, the condition does not fire,
and the package proceeds with the filter. One ruling is requested (section 7).

**Subject:** `abiogenesis`, branch `claude/td75a-run-filter-and-lanes` from
`332bfed27`. `T` = `build_tenants/abiogenesis/typescript`. The base build
leaves no tracked change. This Return is the only commit, and it touches no
file under `T`.

## 1. The census and the filter that was not applied

At a Run terminal, `deriveTerminalRunCensus` initiates `actor_cleanup_live`
for every held `actor_process_live`, whatever its Run (`T/code/src/abg/calculus/rules.ts:53-56`).
The terminations in the same function (`:78`) and the pending census in
`deriveActorProcessLifecycle` (`:173`) filter by
`state.contextualFluentRunIds.get(fluent.fluentRef) === event.runId`. The fold
stamps every initiated fluent with the initiating event's `runId`
(`T/code/src/abg/calculus/fold.ts:245-249`), so `actor_process_live(P)`
carries the Run of P's start. The planned filter added that relation to the
cleanup-live census only. It was tried in a scratch copy of the built
`rules.js` (section 3), not in the source.

## 2. Who observes the difference

The trace (`TD-75_TRACE.md`, section 5, h5) lists four Run-scoped readers and
concludes that none observes the difference. Those four hold. The trace missed
the readers below.

| Reader | Prefix | What it exposes | Observes the difference |
|---|---|---|---|
| `project.read` / `workspace_replay`: `projectWorkspaceReplay` (`T/code/src/abg/project_read_ports.ts:1482-1500`) | the whole workspace log (`prepared.fullPrefix`) | `eventContractProjection: deriveRuntimeEventCalculusProjection(fullPrefix)` (`:1492`, `:1498`): every held fluent and every effect row. The binding hashes the whole port value into the Public `replay.digest` and `projectionRef` (`T/code/src/abg/project_read_definition_bindings.ts:533-543`). `workspace_replay` is a projected Public definition key of `abg.operation.project.read` (`T/code/src/shared/capability_contracts.ts:87`). | **Yes.** The Run terminal's effect row lists the foreign process, and in the concurrent shape the held set differs too. |
| `replay(store)` with no scope (`T/code/src/abg/replay.ts:578-584`), exported from the ABG barrel (`T/code/src/abg/index.ts:309`) | the whole store | `activeFluents` from the held set (`replay.ts:1433`) | Only in the concurrent shape, where the held set differs. A search of `code/src` found no caller that omits the scope. |
| `projectRunQuiescence` (`replay.ts:386-390`) | one Run only; throws otherwise | blocking list | No |
| Replay body (`replay.ts:997-1003`), `projectRunStatus` (`project_read_ports.ts:1084-1097`, reading the Run calculus of `replay.ts:2157-2160`), closure (`T/code/src/abg/closure.ts:438-440`, `runPrefix`) | Run-scoped selection | held set | No |
| `runtimeEventCalculusEffectsByKind` (`T/code/src/abg/event_calculus.ts:327-336`) | any | effect rows of one kind | No: its one caller asks for `public_operation_artifact_admitted` (`T/code/src/abg/artifact_truth.ts:619`) |
| `qualification_proof.ts:684` | proof prefix | continuations only | No |

The other held-set readers (`open_call.ts:203`, `graph_application.ts:908`,
`retry_progress.ts:606`, `worksite_revision.ts:616`, `:847`) ask for named
fluents other than `actor_cleanup_live`.

## 3. Reachability, and the difference observed

**Two shapes.** The difference needs a held `actor_process_live(P_Y)` stamped
with Run Y when Run X's terminal is admitted.

- **Stuck (inferred reachable by reading; not driven through the owners).**
  Run Y leaves P_Y live for good. That happens in the trace's h6 (start,
  termination unconfirmed, Run failure), which the trace reached by reading
  and no lane has driven, or in a Run stop with the process still live. A later
  invocation in the same workspace store then opens Run X.
  - Root Run opening refuses only a second Run for the same root
    ExecutionBasis (`T/code/src/abg/open_call.ts:539-546`). It reads no other
    Run's held fluents.
  - Child GraphCalls stay in the parent's Run (`:598`, `:612`), so recursion
    makes no second Run.
  - Invocation admission reads a lifecycle fluent in one place: the
    source-result basis requires `actor_process_terminated` for every actor of
    the source Run (`T/code/src/abg/invocation_admission.ts:520-522`, in
    `deriveSourceResultBasisAtPrefix`). That refuses a successor that
    declares the stuck Run as its source. Nothing found refuses an unrelated
    invocation; the whole invocation path was not traced.
  - Recorded stores hold several Runs (section 4). In none of them is a
    process of one Run still live when another Run's terminal is admitted.
- **Concurrent (not established).** Run Y's process is live and Run Y has no
  terminal when Run X ends. Nothing in Run opening refuses it. Whether a host
  ever runs two root Runs against one store at once was not traced.

**Observed, base build against a scratch copy with the filter.** The script
`/private/tmp/abg-td75a-work/scripts/foreign-demo.mjs` hand-builds both shapes
with the m5 lane's row shape, folds the whole prefix and reads the projection
that `workspace_replay` hashes. The filtered copy is the base build with only
the census line in `build/code/src/abg/calculus/rules.js` changed.

| Shape | Build | Run X terminal's effect row initiates | `actor_cleanup_live(P_Y)` held, Run stamp | Whole-prefix calculus digest |
|---|---|---|---|---|
| stuck: Y `[S, U, runtime_failure_observed]`, then X `run_stopped` | base | `actor_cleanup_live(P_Y)` | held, stamped X | `sha256:a07371aa58197de6d5024fb3a9fb05e7623b2e3a3dc09b31b1c78da7eab40639` |
| | filtered | nothing | held (from U), stamped Y | `sha256:c4179c462ce5f1296deeeac910f5fd9376522f7a536e470d1e05266db071b951` |
| concurrent: Y `[S]`, then X `run_stopped` | base | `actor_cleanup_live(P_Y)` | held, stamped X | `sha256:dee2b206d44aec4d64976f76e5ee54547ce6648a47b1c4787f0d6ded9b615d3a` |
| | filtered | nothing | not held | `sha256:951bf00cb9b2cc3e4bbd0c32aa30e85d3bb27b9e013de2a7cba088c0dd6cf9ad` |

In the stuck shape the held sets are equal, so every replay digest and the
blocking list are unchanged. The effect row and the Run stamp differ, and the
`workspace_replay` Public digest hashes the effect row. In the concurrent
shape the held set differs as well.

## 4. Recorded logs

**Census probe.** `/private/tmp/abg-td75a-work/scripts/foreign-census.mjs` folds
each whole log and, at every Run terminal, lists held `actor_process_live`
fluents stamped with another Run. It ran on the base build over:
- the eleven TD-25R logs;
- the 40 recorded logs under the evidence root that hold two or more Runs and an
  `actor_process_started` (found by a search of 834 event logs).

Results:
- 16 of the 40 decode on this build, and 24 are refused at decode ("event stamp
  differs from the exact native profile schedule" or "noncanonical event").
- **No decodable log has a foreign live process at any Run terminal.**
- The two multi-Run TD-25R logs (registered selection, 7 Runs; construction
  intent superseded, 2 Runs) have none either.

**Replay comparison.** The TD-25R script
(`/private/tmp/abg-td25r-work/scripts/replay-log.mjs`) was copied, and one
output was added: the digest of the whole-log
`deriveRuntimeEventCalculusProjection`, which is the value `workspace_replay`
hashes. The copy ran on the base build and on the filtered copy over 27 logs:
the eleven TD-25R logs and the 16 decodable multi-Run logs above. The r10
proof log is read from this worktree, byte-equal to the TD-25R copy.

The two output files are byte-identical (sha256
`5c394160a1504cae0f73d57cd13ee6214e7823ef2a96ff510c175ced7379374b`). That covers:
- the decode and refusal message of every log;
- 23 whole-log calculus digests;
- 7 whole-log replay digests and 16 identical whole-log replay refusals;
- 56 per-Run replay digests over full authority;
- the F_H continuation and fact projections.

The seven whole-log replay digests equal the TD-25R table (for example, live
rc.12 Run `sha256:3800fb111acfede513425e706737e1637b7dfd210aac2fe68015eb3b47f5c5a5`).
No recorded log holds `actor_cleanup_live` at its end.

## 5. Identity digests

Nothing under `T` changed, and the base build left no tracked change. The
identity therefore equals the committed `T/product-toolchain-manifest.json`:

| Field | Value |
|---|---|
| `productContentDigest` | `sha256:a4e58672516210090e7ec730d1b86f70517291c0971c95ab2b32170d1166c98c` |
| `contributionManifestDigest` | `sha256:95dcec88e32b128ba82f59262d12ed71d8c1b422b9dae0df1007cb786ddfaa78` |
| `publicContractCatalog.catalogDigest` | `sha256:8c5f262f2e7b9fcdef40a80d18b262aa90e4ea3cee854b1f01d52b67773c1733` |
| capability graph `graphDigest` | `sha256:f47c46d701cbb01aec4ee0a61d36527b091ec96608300f7e6d0fbc0d13a507a8` |

## 6. What was not done

- `rules.ts` is unchanged, and the foreign-Run lane is not written.
- The characterization lanes (h4, h6, two actors, attribution, a start after
  the Run terminal) are not written. Under the brief, the stop ends the package.
  These lanes do not depend on the filter.
- No lane was run, because no code changed.

## 7. Ruling requested

Choose one. If the stop condition meant recorded results only, the first
applies without further ruling.

1. **Apply the filter.** Accept that, for the stuck and concurrent shapes, the
   Public `workspace_replay` digest and the whole-store `replay(store)` held
   set change, and say whether the change joins TD-66's digest-affecting batch.
   No recorded digest changes (section 4).
2. **Hold the filter** until the TD-75 route decision. Re-dispatch the
   characterization lanes alone, with the foreign-Run lane written as a
   characterization of the rule at head.

Either way, the trace's section 5 h5 needs a correction: the `workspace_replay`
reader observes the difference.

## 8. Scratch

`/private/tmp/abg-td75a-work/`:
- `scripts/` holds the census probe, the demonstration and the extended replay
  script (the TD-25R script, with the whole-log calculus digest added);
- `foreign-census-*.jsonl` and `replay-{base,filtered}.jsonl` hold the outputs;
- `base-T/` and `filtered-T/` are the two build copies.
