# RC12 B1 Return: child failure inside an Executive Run

Worker Return to the Executive. Read-only trace at `1bc4e71cf` (`claude/rc12-executive`), build as found.
Two tracked files (`contracts/capabilities/capability-definition-graph.json`, `product-toolchain-manifest.json`)
were already modified by the 10:35 build before this work; untouched and not committed.
Evidence root `X` = `qualification-scratch/rc12-executive-01/b1/` (untracked). Harness `X/repro.test.mjs`
reuses the scripted stand-in of the last `t287-default-library-reviews` test (purposes construction, testing,
review, uat; two required reviews; bound 12; installed Public start through the CLI). The harness adds one declared
failure point per scenario. After the start, each scenario records the following: the event table, the continuation projections
(pending_execution, construction_intent, selected_action), the replay routes carrying a `nextActionProjection` (the only source of
`run_lawful_actions`, `abg/project_read_ports.ts:1485-1500`), the `run_status`, `run_result` and `run_gaps` reads, and the Public `run.continue`
population on both arms. When no arm existed, a second Public start over the same worksite follows. Per scenario: `X/scenario-<s>/`
(`start-events-compact.txt`, `*-failure-payloads.json`, `summary.json`, `actor.jsonl`). The runs: (a) through (e), Q3 and d2.
Each was bounded by a 900 s alarm. None hung, and none made a provider call.

## Q1. Current behaviour

The lift chain is identical in every failure scenario. Scenario (a) shows it: the native child of `construction` exits 3 (`X/scenario-a/start-events-compact.txt`).

| ord | event | graph | fields |
|---|---|---|---|
| 134 | c_call_opened | native-work | leaf, stageRole native-work |
| 151-153 | actor_process_exited, actor_result_artifact_observed, actor_invocation_failed | native-work | status 3; failure `transport_failure` |
| 157 | c_call_result_admitted | native-work | resultClass **failure**; `native_workspace_work_failure`/`transport_failure`; after observed; changedPaths `[generated/hello-world.mjs]` |
| 159, 161 | c_call_judged, traversal_route_admitted | native-work | judgment **blocked**; route **failed** |
| 163-174 | child_foldback_admitted, Result, judged, route | construction | failure, class relabelled `child_traversal_failed` (diagnosticRef keeps `.../transport_failure@5`); blocked; failed |
| 176-187 | child_foldback_admitted, Result, judged, route | executive-step | failure `governance_failure`/`child_traversal_failed`; blocked; failed |
| 189 | runtime_failure_observed (aggregate run) | executive | stage `route`, diagnosticRef `.../transport_failure@5` |

| | (a) exit 3 | (b) absolute ceiling | (c) inactivity | (d) schema-invalid report | d2 out-of-grant write | (e) review assessor exit 3 |
|---|---|---|---|---|---|---|
| Setup | native writes partial candidate, exits 3 | heartbeat every 300 ms; inactivity 6 s, absolute 12 s | silent after init; same limits | report omits `gaps`, exit 0 | edits protected `design/implementation-design.md`; valid report | construction succeeds; first assessor (review B) exits 3 |
| First failure fact | exited status 3 (151) | `actor_process_timeout_observed` **absolute** (226), SIGTERM (228) | `actor_process_timeout_observed` **absolute** (149); no inactivity fact | artifact `contract_failure` (152), at the transport/report layer | invocation closed success (154); native binder refuses | assessment exited 3 (360) |
| Native Result class | `transport_failure` | `transport_failure` (timeoutClass only on artifact/evidenced facts 230/233) | `transport_failure` | `contract_failure` | `write_scope_violation` | `transport_failure`, changedPaths `[]` |
| Run stop / Public outcome | runtime_failure_observed 189; `runtime_failed`; status `failed` | 267; same | 190; same | 190; same | 190; same | 398; same |
| Lawful actions / continuations | none: routes `{advance 4, failed 3}`, no nextActionProjection; pending, intent, selected all `[]` | same | same | same | same | same (`{advance 10, terminal 3, failed 3}`) |
| `run.continue` | both arms refused `missing_continuation` `/continuation` at population | same | same | same | same | same |
| Second start (new Run) | selects construction again; view observations `[]`; fails identically | same | same | same | prepare-selection fails: `missing-owned-prepare-selection`; 47 events; no actor call. Cause, as a reading: the protected-source digest no longer matches (`contextMatches`, `abg/default_library.ts:108`); this changed file is the only worksite difference from (a)'s restart | construction, review B, fails again |

These facts hold in all five failure scenarios:
- The owner value is `{disposition: runtime_failed, gap: null, result: null, terminalResult: null}` with `stop` = the runtime_failure_observed event. It carries no failure class and no reason codes.
- `run_result` returns the refusal `not_found`, and `run_gaps` returns `frontiers: [], gaps: []`.
- `derivePendingExecutionContinuations` returns `[]` for any Run that has a Run-level runtime_failure_observed (`abg/construction_continuation.ts:250`). There is no selected or construction intent, because there is no construction composition. So `run.continue` has no arm, and a second failure changes nothing: each new start is a new Run with the same task and the same choice.

**Attribution.** The native binder observes the worksite even after a timeout, a non-zero exit or a bad report (`implementation/native_workspace_work.ts:62-80`). The failure Result therefore carries `after` and `changedPaths`.
- Currentness reads it: `worksiteCommandSourcesInvalidatedAfter(prefix, ord-1, root, [candidate])` returns true in (a), (b), (c) and (d), and `[source/witness-contract.md]` returns false (`abg/native_worksite_execution.ts:276`).
- `nativeWorkUnknownEffectDependencies` returns 0 because the Result carries the observation. No `actor_process_termination_unconfirmed` appeared in any scenario.
- The selection does not attribute it. The selection task is `{state, context}` (`abg/default_library.ts:137-141`). The fold refuses failure values (`:365`; `result()` requires success, `:121`).
- In the restart view, the candidate digest is `sha256:41e4f7…` (53 bytes; the seed is `647697…`, 29 bytes), with `observations: []`. The selector sees the bytes but not the producer or the failure.

## Q2. Declared retry

None is declared. The library graphs declare no `c_retry` term and no `re_enter`. Applications: `executive-step` has `registered_selection` only, `executive` has `recurse` with bound 12, and the wrappers have none (`X/validate-probe.json`, `declaredToday`). The native leaf is a plain `C.of` (`gtl/native_workspace_work.ts:50-55, 66-71`).
- `C.retry` is consumed only by `hog/traversal.ts:280`, `hog/structural_transition.ts:123-200` and `abg/retry.ts` (`declared_c_retry_*`).
- The runtime reads no budget: the liveness `retryBudget` is `{retryEligible: false, remaining: null, terminalPolicy: "block"}` (run_status, scenario a).
- The probe wrapped `C.retry(…,2)` around the step's construction invoke. The result was invalid: `carrier_mismatch` on the edge, plus registered-selection `invalid_application`.
- Around the wrapper's work call it fails with `carrier_mismatch` on the retention `inputBinding`.
- A same-edge retry would redispatch the same task in any case, not an Executive choice. The only bound in force is the recursion bound.

## Q3. Step limit (bound 2, `X/scenario-q3/`)

- **Sequence.** One construction step closes. The second parent evaluation (229) returns `terminal: false`, and `cursor.attempt 2 >= bound 2` (`hog/recursion_lifecycle.ts:658`). That leads to a `blocked` route (237), then `run_stopped` (239).
- **`run_stopped` payload.** `{disposition: blocked, reasonRef: reason://abiogenesis/recursion/bound-exhausted@5, cCallRef, judgmentRef, routeRef}`.
- **Public outcome.** `blocked`, with `gap`, `result` and `terminalResult` all null and `stop` = run_stopped. `run_gaps` is `[]` and `run_result` is `not_found`.
- **Obligations are not named.** They exist only in the last evaluate-parent Result (229): `unresolvedSupportRefs: [complete-source-outcome]` and both required reviews `{resultRef: null, satisfied: false, current: false}`.
- **No continuation.** No continuation is projected, and `run.continue` refuses with `missing_continuation`.
- **Bound counting.** Bound N admits N parent evaluations, which is N-1 steps. The default 12 allows 11.

## Q4. Routes

**Hypothesis verdict.** Part (i) fails. Part (ii) holds as a reader, but today no traversal reaches it after a failure.

(i) is refused at three independent points, and the Run ends at a fourth:
1. **Validator.** `validator/validation.ts:1274-1325` requires source and target in the same node (`:1307`), an earlier leaf of the same C span, and a non-result-bearing source leaf. `executive-step`'s prepare, select, project and invoke are separate nodes. Reproduced: `invalid_application`, "re-enter application requires one bounded earlier locus in the same static graph span…" (`X/validate-probe.json`).
2. **HoG.** In `hog/route_proposal.ts:864`, a `resultClass === "failure"` Result goes to `proposeFailedRoute` before re-entry is considered. `selectedCCallOutcomeRoute` (`:724-743`) re-enters only on a success Result with an `advance` judgment and a `graph_span_selection` value. Observed: every failure Result was judged `blocked` and routed `failed`.
3. **ABG.** `abg/traversal_route.ts:3939-4027` requires judged evidence whose Result value *is* the reentry projection, the same node (`:3998`), `attempt+1`, and a prior count below `maxApplications`.
4. **Run end.** Even with a route inside the step, the parent recursion turns a failed step child into `runtime_failure_observed` at stage `route` (`hog/recursion_lifecycle.ts:868-905`).

(ii) `projectGovernanceSelection` (`abg/default_library.ts:181-185`) holds the admitted prefix and the runId. Failed attempts are log facts: the step's `registered_graph_choice`, the native-work `native_workspace_work_failure` (failureClass, diagnosticRef, after, changedPaths, report, provenance), and `timeoutClass` on `actor_result_artifact_observed` and `c_call_evidenced`.
- The fold must read the native-work Result. The wrapper and step lifts relabel the class to `child_traversal_failed`.
- `transport_failure` covers both an exit and the absolute ceiling, so `timeoutClass` must be joined from the evidence events.
- Only the `changedPaths` side is reproduced. No run produced `after: null` or `actor_process_termination_unconfirmed`, so the unknown-effect paths are a code reading (`nativeWorkImpact(task, null)`).

| Route | Declarations and code (rough size) | Adds | Digests and tests | Failure modes |
|---|---|---|---|---|
| H. `re_enter` from a failed wrapper invoke to prepare | widen `re_enter` to cross-node spans and failure-class sources, with a HoG-made projection: validator, `route_proposal`, `traversal_route`, replay, calculus axioms (~300+) | changes an existing application kind's meaning and admits failures as re-entry evidence: a new route mechanism in effect | `executive-step` digest; re_enter suites | own bound beside the recursion bound; stale-verdict loop until `maxApplications` |
| F. Wrapper fold consumes failure | declared lift of a failed child as success-class (`hog/workflow_lifecycle.ts:683-705`, precedent: blocked child); retention binding work→fold; fold accepts failure values (`:365`, `:121`) (~150-250) | lifts a failure-class Result into success at the wrapper. This conflicts with Runtime Disposition (PRODUCT 450-452: no erasure into a generic flag). Puts a failure row in state | every wrapper digest; state, view and fold pins | class erasure; failure copy in state |
| **R. Declared failure foldback on the existing `recurse`** | one declared field on the recurse foldback (named failure contract: re-evaluate the parent over its prior admitted input); validator; `recursion_lifecycle.ts:868-905` branch; widen the `recursive_application` foldback from `blocked\|closed` to include `failed` (`abg/graph_application.ts:84, 278, 584, 1024-1051`); re-entry input = the parent's prior Result; plus (ii) in selection preparation and the view (~250-400 with tests) | no new event kind or payload value: `childDisposition: "failed"` already exists on the workflow relation (`abg/c_call.ts:4222`, `child_lifecycle.ts:25`; observed at 163/176). No new application kind, operation, failure class or Public member. Extends recursion foldback (design_reframe) | `executive` digest; breaks the `gtl3` old-instance pin (`t287-default-library-reviews` test 1). `t287-recursive-registered-selection:147` (failed child yields a failed Run) still holds where nothing is declared. Selector task and view change only when failures exist | bounded by the existing recursion bound, which Q3 shows stops as a typed block. Risks: (1) the selector repeats the failing choice; (2) as a reading, after-null unknown effects stale every verdict over the grant; (3) d2: protected-source damage makes prepare-selection refuse (cause is a reading). Preparation refusals must not re-evaluate, or the step loops cheaply until the bound |
| S. Typed stop + `run.continue` at the parent | step failure becomes a blocked stop; a new continuation derivation for stopped Runs (pending_execution excludes them at `:250`; Q3's blocked Run also yields none); a Public arm (~300+) | a continuation kind or arm. An outside call per failure, which is the RC11 pattern | Public contract digests | the decision leaves the governed Run |
| K. Keep today's behaviour | none | none | none | falsified by Q1: no arm; the restart re-selects with `observations: []` |

**Recommendation: R with (ii).** The failure reaches the Executive in the same Run, and the selector chooses next from a log fold. Effects stay attributed through the native failure Result. The work state stores no failure copy.

**What would falsify R:**
- `recursive_application` foldback admission cannot accept the existing `failed` disposition without a new event kind or payload class. The domain and event already carry it for workflow children.
- The cursor or input identity rules refuse a re-entry whose input repeats the prior admitted input.
- An owner reading holds that re-evaluating after a failed child conflicts with "child success alone does not complete its parent" or the `depth_traversal` foldback law.

## Findings (candidate defects, not repaired)

- **B1-F1. The inactivity path is unreachable for a silent worker.**
  - Exact failure: (c), inactivity 6000 ms and absolute 12000 ms, one init line then silence. The only threshold is `actor_process_timeout_observed timeoutClass: absolute` (ord 149, wall 19.8 s), with no inactivity fact.
  - Cause (reading): `abg/calculus/liveness.ts:771` requires coverage of all eight required `claude_stream_json` probes (`runtime_liveness_contracts.ts:16-19`; `calculus/liveness.ts:121`). With probes uncovered the reason is `unknown_required_coverage` and the disposition stays `continue_waiting` until the hard cap (`:792`). The projection at the threshold was not captured.
  - Violates: REQ-R-ABG3-RETRY-008 (`inactivity_timeout` → `no_output`). A stalled worker holds until the absolute ceiling, which is the RC11 900 s pattern.
- **B1-F2. The Public failure outcome is generic.**
  - Five distinct causes all yield `runtime_failed`, with no class in the owner value, `run_gaps` `[]` and `run_result` `not_found`.
  - The class survives only in the stop event's `diagnosticRef` and the native Result.
  - Weigh this against PRODUCT 450-452.
- **B1-F3. A bound-exhausted block names no obligations.** The Public `blocked` outcome and `run_stopped` carry only `bound-exhausted`. The unresolved support and the review standing are reachable only through the parent Result (229). Weigh this against PRODUCT 1126-1131 ("remains visible as unresolved").
- **B1-F4. Liveness contradicts status after a failed Run.** On a Run whose status is `failed`, the root-frame liveness reports `continue_waiting` / `unknown_watchdog_policy`, `externallyInterrupted: true` (run_status, scenario a). Low severity.
- **Not a defect: the bound counts parent evaluations.** Bound N gives N-1 steps (`recursion_lifecycle.ts:658`, attempt starting at 1). Record the intent.

## Executive decisions

1. **Route.** Choose route R (design_reframe re-entry).
2. **Failure budget.** Decide whether failed steps consume the recursion bound, or whether a separate declared failure budget applies.
3. **Evidence and work state.** Decide whether failed-attempt Result refs become admissible selector evidence (the binder's evidence domain). Also decide whether any failure row may enter the work state. Success rows already carry `value` copies.
4. **Preparation refusal.** Decide the typed outcome when preparation refuses after protected-source damage.
5. **B1-F1.** Decide disposition: it governs case (c) independently of the route.
