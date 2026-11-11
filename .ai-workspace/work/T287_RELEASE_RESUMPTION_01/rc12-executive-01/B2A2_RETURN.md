# RC12 package B2a continuation Return: recoverable child failure closes

Writer Return (commentary).

- **Location.** Worktree `/private/tmp/abg-rc12-foldback-20261111`, branch `claude/rc12-foldback`, base `62fd17271`. T = `build_tenants/abiogenesis/typescript`.
- **Commits.** `b6f0f7f07` (specification), `9ad8d7e83` (code and tests), `da9ab23ec` (the Public child read), and this Return.
- **Starting tree.** It matched the backup patch byte for byte, apart from the four regenerated files, so nothing was restored.
- **Scratch.** S = `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/5e4c25c3-fca5-4dd6-89e7-20d55d008bdf/scratchpad/b2a2`.

## Verdict: green; stop 3 checked, not met on the evidence below

- **Run closes.** The fail-once Run closes through HoG and through a Public start. Ruling (b) needed no change to any axiom, event kind or payload.
- **Recorded Runs.** They replay to identical digests on base and branch.
- **Stop 3 facts.** The closed Run's Public `run_status` presents both folded frames as live (held probes, active `frame_progress`). The existing Public `graph_call_replay` of each folded child reads `closed` with no terminal result. That `closed` is the Run's own status, not a child fact. The owner quiescence reader also reads them as historical, but that reading is this package's W1. You classify; see decision 2.

## Changes (+/− lines)

- **`T/code/src/abg/replay.ts` (+19 −1).** In `projectRunQuiescence`, the frame probe of a child frame with an admitted `blocked`/`failed` `child_foldback_admitted` is historical. Keys come from the log: the foldback's `childFrameId`+`childGraphCallId` select that frame's frame-scope `runtime_activity_probe_observed` events, and each `observation.scopeDigest` (the relation that starts the fluent) is a key. The keys form their own set, not the closure spine.
- **`T/code/src/owner_bindings/run_invocation.ts` (+2 −5).** The recurse arm reads `foldback: FOLDBACK_DECLARATION_SCHEMA`.
- **Test file `t287-recursive-failure-foldback.test.mjs` (+90 −8, 292 lines).** Adds a quiescence subtest, a Public-start test with closed-Run reads, and helpers.
- **D11 in `T/design/M03_…_DESIGN.md`.** Date removed. It now states the canonical schema and adds a "Run quiescence" bullet: ruling (b) and the probe's Public visibility. The exit proof is extended.
- **Committed unchanged** (previous Writer): REQ-009, the PRODUCT sentence, graph_application +51 −7, traversal_route +10 −3, traversal_cursor +5 −2, recursion_lifecycle +12 −7, graph_applications +10 −1, serialization_contracts +1, validation +21.
- **Lints.** `lint:imports` and `lint:calculus` are clean. `lint:lifecycle` shows the same 4 offenders as base, all in `shared/owned_process_state.ts`.

## T1. Readers of run quiescence and of the `runtime_invocation_active` probe

| Consumer | Old reading | New reading |
|---|---|---|
| `closure.ts:543` root closure gate | A stopped-foldback child frame probe blocks (`runtime_basis_mismatch`) | Historical. A frame with no admitted stopped foldback still blocks. |
| Owner `run_status.quiescence` (`project_read_ports.ts:1064`); the `abg/index.ts:330` export; quiescence tests | Same as the closure gate | Same as the closure gate. The Public `run_status_projection` (`project_read_definition_bindings.ts:331`) carries no quiescence. |
| `axioms.ts` (probe start and end); `rules.ts` `deriveTerminalRunCensus` and `deriveProcessCleanup`; replay `activeFluents` (part of the digest); Public `activeFluents` and `nativeLiveness`; semantic `holdsAt` | — | Unchanged. The folded probes stay held. `run_stopped` and a Run-level failure end every probe. |

## T2. Sites that parse or validate a recurse foldback (one schema)

- `gtl/serialization_contracts.ts:99` `FOLDBACK_DECLARATION_SCHEMA` is the single schema. GraphFunction admission, conformance inputs and the generated JSON schema all use it.
- `owner_bindings/run_invocation.ts:363` now uses that schema. The old inline copy matched it field for field, minus the new member.
- Form checks only: the constructor (`gtl/graph_applications.ts:139-157`) and the validator's exact keys and Program form (`validator/validation.ts:385, 1157-1174`).
- **Difference.** The schema accepts duplicate class refs; the constructor and validator refuse them.
- **Not parsers.** `declaresFailedChildFoldback` only reads the member. Six TS type copies in `abg/construction_continuation.ts` (444–1551) omit it; they are type-only and outside my territory.

## T3. Recorded Runs (W4)

**Method.** I archived base to `S/base`, built it, and recorded three stores there with the parameterised B1 harness (`S/harness/record.test.mjs`): `ok` (completed), `a` (failed, then restarted) and `q3` (bound 2, blocked). I replayed each store on both builds with `S/harness/replay-digests.mjs`. Each output pair in `S/w4/` is byte-identical.

| Run | Status | Scoped replay digest (base = branch) | Semantic view |
|---|---|---|---|
| ok `fcd827ad…` | closed | `4ff4c5fd…cf6415` (= base Public read) | `1fbcb75f…` |
| a `84807796…` | failed, 2 failed workflow foldbacks | `c25743c6…5ff453` | `46ae621e…` |
| a restart `3af09bc0…` | failed, 2 failed workflow foldbacks | `194c1f20…e2b143` | `4d1d5eee…` |
| q3 `16c8d83a…` | blocked | `3784f60b…59f08` (= base Public read) | `db42edc4…` |

The full-prefix digests (`da9058a1…`, `36e56bf5…`, `7ed6c503…`) and the quiescence projections are also equal.

## T4. Identities and generated files

- **Definition digests.** The foldback, application and definition digests are unchanged when the member is absent; the E4 pins pass.
- **Committed.** `gtl-serialization.schema.json` (the member at 4 paths) and the corpus `schema.contentDigest` (`c9ff3782…` → `f4a58c61…`). The repository's committed copies equal what base itself generates, so they are kept in sync.
- **Not committed.** `capability-definition-graph.json` (product and catalog digests) and `product-toolchain-manifest.json` (28 contract source digests). The base build's own output already differs from the committed copies.
- **Regeneration.** All four come from `npm run build`.

## T5. Tests

Command, run in T: `TMPDIR=/private/tmp/abg-foldback-tmp node --experimental-vm-modules --test --test-concurrency=1 test_env/tests/<f>.test.mjs`. Logs are in `S/suite-{base,after,after2}/`. Counts are tests/pass/fail/skip; after equals base in every row.

Previously baselined: `t287-route-reconstruction` 13/8/2/3 (the same pre-existing reds `:539` and `:585`, `18 !== 22`); `m5-event-calculus-runtime` 19/18/0/1; `t287-default-library` 37/34/0/3; `-fulfillment` 7/7; `-reviews` 7/7; `t287-authenticated-owner-family` and `t287-generic-job-parent-foldback` 1/0/0/1; `t287-recursive-registered-selection` 7/6/0/1; `m5-c-algebra-validation` 22/19/0/3; `t287-gtl-graph-law` 9/9; `-language-corpus` 3/3; `-serialization-publication` 9/9; `t287-runtime-failure-diagnostic` 21/21.

Newly baselined: `t287-runtime-activity-quiescence` 1/1; `m5-terminal-quiescence-owner` 7/7; `r9-causal-result-closure` 2/2; `m5-fresh-process-reconstruction` 1/1; `t287-interrupted-event-resource-recovery` 8/8; `t287-historical-source-resource` 4/1/0/3; `t287-selected-execution-closure` 1/0/0/1; `t287-w2-05-static-binding-algebra` 5/3/0/2; `t287-native-frame-observation` 7/1/0/6.

- **New file.** `t287-recursive-failure-foldback` passes 8/8/0/0. After `da9ab23ec`, the changed Public test reran alone and passed 1/1.
- **W2 red, then green.** With base `run_invocation.ts` rebuilt, the Public start refuses at `resource_admission` with `invalid_resource_assertion` ("definition resources differ from the owner-authored structural contract"). With W2 it completes.

## Public reads of a closed Run that contained a failed foldback

All reads went through the installed CLI after one Public start.

- **Start.** Disposition `completed`, foldbacks `['failed','closed']`, no runtime failure.
- **Run status.** `run_status` and `run_replay` both report `closed`, and their replay matches `run_result`'s. `run_result`: `terminalResult.value.terminal: true`.
- **Folded frames still held.** `run_status.activeFluents` holds `runtime_invocation_active(<scope>)` for both folded frames, with no `frame_*` or `graph_call_*` fluent of theirs. In the inspected run, the 32 held fluents were `basis_admitted` ×5, `frame_closed` ×3, `graph_call_closed` ×3, `terminal_admitted` ×3, `runtime_activity_recent` ×12, the 2 probes, `run_closed`, and 3 admission fluents.
- **Native liveness.** `run_status.nativeLiveness` has 12 invocations, all `continue_waiting` / `unknown_watchdog_policy`. The folded frames list `<frame>/frame_progress` under `activeSystems`; closed frames list it under `inactiveSystems`.
- **Child graph-call reads (`da9ab23ec`).** Public `graph_call_replay` of each folded `childGraphCallId` reads `status: closed`, `terminalResult: null`. Neither child has `graph_call_closed`, and the foldback ended `graph_call_active`, so `graphCallStatus` (`project_read_ports.ts:1046`) falls through to the Run's `runtimeStatus`. The read hides the child's failure.
- **Owner quiescence.** The owner `run_status.quiescence` reads `quiescent_for_close` with `blockingFluents: []`. Its historical reading comes from W1, and the Public projection omits it.

## Deviations

1. The frame match keys on `childFrameId` together with `childGraphCallId` and the same `runId`.
2. One Public fail-once Run covers both W3 case 1 and case 2.

## For the library Writer

- **Member name.** `failedChildDiagnosticClassRefs`, confirmed.
- **Class references.** `diagnostic://abiogenesis/worksite/native-work/<class>@5` (`native_workspace_work.ts:72-76`), where `<class>` is one of: `transport_identity_mismatch`, `contract_failure`, `no_output`, `transport_failure`, `post_work_observation_failed`, `write_scope_violation`, `result_contract_failure`, `assessment_independence_mismatch`, `incomplete`.
- **B1 recorded.** `transport_failure` for exit, absolute timeout, inactivity and assessor exit. `contract_failure` for a bad result. `write_scope_violation` for a scope breach. `failedChildDiagnosticClassRef` returns each ref unchanged.
- **The parent cannot see the failure.** Its re-entry input is byte-identical (parent Results 1 and 2 have equal `valueDigest`). The library's selector view reads only `state.observations`, which is that input.
- **Where the failure is recorded.** `child_foldback_admitted` carries `childDisposition: "failed"`, `childReasonRef` (the class) and `childResultRef`, which points at the recursion child's lifted failure Result. The next recursion `advance` route consumes that foldback. The leaf's own Result is in the workflow child frame (`native_workspace_work_failure`: `failureClass`, `diagnosticRef`, `changedPaths`, `after`, `report`).
- **No read port feeds any of this into the parent's next evaluation.**

## Decisions for the Executive

1. **Failure visibility for the parent.** The library executive sees the same view after a failed step; a deterministic selector reselects that step until the bound, and a model selector has nothing new to read. Should re-entry carry the failure to the parent, and through which owner? This may block library use even though the generic runtime is green.
2. **Folded frames in Public reads.** `run_status` shows them live, and `graph_call_replay` shows them `closed` only through the Run's status. Options: accept and disclose it (D11 states the `run_status` part), add quiescence to the Public `run_status`, or reprice the axiom or the child status later, which changes recorded digests.

## Residual risks

- **Duplicate schemas.** `run_invocation.ts` still redeclares the other GraphFunction and application schemas inline. In one place they differ: `declarations` values are nonblank there but any string in the canonical schema.
- **Blocked foldbacks.** The quiescence rule also covers `blocked` foldbacks, so such a Run can now close. No test or recorded flow expects the old refusal.
- **Earlier Return risks.** These remain: registered-selection re-entry, fan-out partial-stop reasons, and the class extractor repeating `runtime_failure.ts:202`.
