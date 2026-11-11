# RC12 package RR Return: readable stops after RV2

Branch `claude/rc12-readback2` from `f12472743`. Commits: text `0d5e30880`, code and tests `01cbd7925`. Uncommitted: 27 regenerated files (26 under `T/contracts/`, plus `T/product-toolchain-manifest.json`). Re-entry: `requirement_reprice` of REQ-P-POLICY-065–068, realized on the read side. No change to event kinds, stop or foldback events, Public operations, axioms, `calculus/`, `hog/`, `replay.ts`, `graph_application.ts` or `default_library`.

## Repairs, with actual readings
Statements come from the branch run. "…" elides a statement's shared parts; refs are shortened here only.
- **F1.** `stop.evaluation` is replaced by `stop.lastRootResult`. It names the root GraphCall's last success Result by kind, reference and contract, and carries the value uninterpreted. The statement makes no content claim; the tests assert that neither "obligation" nor "evaluation" appears.
- **F2.** `stop.operator` is `{reasonKind, reasonDetail, operatorActorRef}` for an operator stop, and null otherwise. Example: `The Run stopped as operator_stop and did not complete. Reason: operator operator_stop by actor://mechanical/developer, detail "Selected operator stop component proof". No originating Result is admitted: the stop names no single admitted route. No Result of the root GraphCall is admitted. No next lawful action is admitted.`
- **F3.** The origin is found by causal descent, never by position:
  1. Find the stopping route. It is either the route a stop names among its causes, or the one failed route among those causes.
  2. Take the child Result of the stopped foldback that route consumes. If it consumes none, take the Result the route's judgment names.
  3. For each lifted Result, follow its cited `sub_traversal` evidence to the stopped foldback, then to that foldback's child Result (matched by reference and digest).

  Each link must be admitted before the event that cites it. A missing or ambiguous link reads `not_admitted{missingLink}`. Examples:
  - **Bound after handled failures (recorded Run):** `… Reason: reason://abiogenesis/recursion/bound-exhausted@5. Originating Result: recursive_selection_state result://…3472d6fd… from graph-function://registered-selection/recursive-parent@5. The last admitted Result of the root GraphCall is recursive_selection_state result://…3472d6fd… under contract contract://registered-selection/recursive-state@5. No next lawful action is admitted.`
  - **Undeclared failure:** `… Reason: diagnostic://registered-selection/undeclared-child-failure@5 at stage route. Originating failure: class controlled_child_failure in result://…7edbfa3f… from graph-function://registered-selection/A@5; timeout class not admitted. …`
  - **Worker exit:** `… Originating failure: class transport_failure in result://…8da667cc… from graph-function://abiogenesis/worksite/native-work@5; timeout class none. The last admitted Result of the root GraphCall is governance_work_state result://…1563df9f… under contract contract://abiogenesis/default-library/state@5. …`
  - **Absolute ceiling:** reads the same as worker exit, with `timeout class absolute`.
  - **Gap:** `… Reason: reason://abiogenesis/default-library/gap@5. Originating gap in result://…12f0f61d… from graph-function://default-library-witness/executive-step@5: missing support support://default-library-witness/complete-source-outcome@5; reason "Scripted ordered policy.". …`
- **F4.** Run truth carries `stopStatement` from the same fold. `run.invoke` (`start`, `invoke`) and `run.continue` (`current_intent`, `pending_execution`, `selected_action`) put it into the result or non-terminal value only when the Run stopped; one `continuationOutcome` helper replaces the three inline continue copies. `nextActions` is `run_lawful_actions`; the statement names them or says none is admitted.
- **F5.** The read side changed. The gap support-ref schema is now the GTL `refs` predicate in `gtl/registered_selection.ts`: any non-empty string. The gap reason stays non-blank on both sides. Why the read side: the language owns admission, and admitted gaps are already in logs. Narrowing GTL would change the language and leave stored gaps unreadable.
- **F6.** The design note now states the contract delta and the source-module digest-movement rule. It also marks the exact014 `run_status` slot pin as superseded.
- **F7.** A frame whose failed or blocked foldback is admitted gets the reader rule Run quiescence already uses: `activeFluents` omits its frame-probe fluent; `nativeLiveness` omits its frame-scope invocation (sealed invocations are kept or omitted, never rewritten); its GraphCall reads the foldback's disposition. Fluents and replay digests are unchanged (T4).

## T1 consumers of each changed Public value
| Value | Consumers (grep of `code/src`, tests) |
|---|---|
| `run_status.stop` shape | Binding `runStopFields` (schema check) and the CLI line. Only `t287-readable-stops*` read its fields |
| `run.invoke`/`run.continue` `stopStatement` | CLI and SDK output. Optional, absent unless stopped. No product code reads it |
| `activeFluents` and `nativeLiveness` of ended frames | Public reads only. Closure uses `replay.ts` quiescence (untouched). The last test of `t287-recursive-failure-foldback` pins the old values |
| Status of a stopped-folded child (`graph_call_status`, `graph_call_replay`) | Public pollers. `graph_call_result` for such a child now refuses `not_found` (was `not_ready` while its Run was active, held or gap-stopped) |
| Read `projectionDigest` (`run_status`, `run_replay`, `run_gaps`, `run_lawful_actions`, `graph_call_status`/`_replay`) on stopped-foldback Runs | No successor stores these. The coordinates that are stored (`publicAuthorityDigest` = request digest, `nextActionProjection*` in route events, Run source and replay) are unchanged |

## T2 chain per stop kind
| Stop | Events that establish the chain | Missing link reads |
|---|---|---|
| Route `run_stopped` (bound, gap) | `routeRef` among causes → `traversal_route_admitted` → [`child_foldback_admitted` consumed] or `c_call_judged(judgmentRef)` → `c_call_result_admitted` → `c_call_evidenced(sub_traversal, foldbackEventRef)` → `child_foldback_admitted(failed\|blocked)` → child Result (ref and digest) | `stopping_route`, `judged_result`, `lifted_foldback`, `child_result` |
| `runtime_failure_observed` | Exactly one failed route among causes, then the same chain | same |
| Operator `run_stopped` | Payload `reasonKind`, `reasonDetail`, `operatorActorRef`; no route | origin `not_admitted{stopping_route}`; root `not_admitted` |

## T3 Public contract delta (head build vs branch build)
- **`project.read run_status` result:** `lastRootResult` replaces `evaluation`; `operator` (nullable) and `nextActions` are added; the origin's `not_admitted` gains `missingLink`; gap `missingSupportRefs` items change from `pattern \S` to `minLength 1`.
- **`run.invoke` and `run.continue`:** `start`, `invoke`, `current_intent` and `selected_action` gain an optional `stopStatement` (`pattern \S`) in both the result and the non-terminal value.
- **Digest-only moves:** `run_result`, `run_replay`, `run_gaps`, `run_evidence` and `run_lawful_actions` move their definition digests through the shared source-module digest only. The family, catalog, adapter projection, 18 operation contracts, `public-operation.schema.json`, the capability graph and the manifest move with them.
- **Head drift:** head's tracked regenerated files already differ from a head build (for example, the family digest).

## T4 recorded-Run digests (head = branch for every row; 12-hex prefixes)
| Record | Status | scoped replay | replay value | semantic | quiescence | reads equal |
|---|---|---|---|---|---|---|
| hog-success (completed, closed foldback) | closed | 671bc79ed231 | bad57d1db4d0 | d06610e77f70 | 26e8c466f90e | 18/18 |
| hog-fail-once (handled failed foldback) | closed | 1ca8cebfbdf1 | 71e80d65bc18 | ccf2dc33def0 | 983edc42c8aa | 18/26 |
| public-fail-once (same, Public start) | closed | f73fa85dce98 | dc73526273ed | b853d0ad5470 | 949e5201de24 | 18/26 |
| hog-always-fail (bound after handled failures) | blocked | e139aa355091 | 58fc56d0eac4 | b7cbf0ade830 | 743743572f22 | 14/26 |
| hog-undeclared (failed) | failed | 8913eb416820 | 4cc0ff1d01a3 | 65c4c471595b | e32dfee77254 | 12/18 |
| hog-parent-fails (failed) | failed | 1dd220e7398e | 74a27a6ba5b8 | b322b940631d | 1cad0fda1518 | 9/10 |
| b2a2-ok (default library, completed) | closed | 4ff4c5fd902e | 466d1b042050 | e01b9484d028 | 65a79f5f1d7b | no archive |
| b2a2-a, Run 1 (default library, failed) | failed | c25743c69e2e | 2491ecf19094 | 112e3c409ae2 | a77a0816636b | no archive |
| b2a2-a, Run 2 (default library, failed) | failed | 194c1f200d21 | 24af41bd6bfb | 0d440877c2e0 | 297fe33c3484 | no archive |
| b2a2-q3 (default library, blocked) | blocked | 3784f60b2225 | ecd21274149d | aa27cb3a9651 | 03090c48b60d | no archive |

Both builds read each record from one shared log (scratchpad `rr/reads.mjs`, `rr/compare.mjs`). Only read-time `projectionDigest` values move, on Runs with a stop or a stopped foldback; `run_replay`'s `projectionDigest` is the read coordinate, while the Run's replay digest (`value.replay`) is unchanged. **F7 condition holds:** no digest a successor stores moved.

## T5 tests (tests/pass/fail/skip; head copy = git archive of `f12472743`, built; head → branch)
**Changed by design:**
- `t287-readable-stops`: 4/4/0/0 → 5/5/0/0 (operator case added).
- `t287-readable-stops-foldback`: new, 4/4/0/0.
- `t287-recursive-failure-foldback`: 8/8/0/0 → 8/7/1/0. The last test fails at line 278 with `TypeError: Cannot read properties of undefined (reading 'disposition')`, because the ended frame's invocation is now omitted. Its first test's subtest, which checks that the derived fluent still holds, stays green.

**Equal and green:** witness-run-stopped-definition-binding 7/7/0/0; runtime-failure-diagnostic 21/21/0/0; st2a-g 4/4/0/0; wave2-owner-contract-source-set 15/15/0/0; exact-construction-intent 1/1/0/0; installed-product-coordinate 11/11/0/0; registered-graph-selection 1/1/0/0; default-library-reviews 7/7/0/0 (head rerun with its tracked input restored); management-supervision 5/5/0/0; rp2-correction-carriers 1/1/0/0; c0-post-publication-failure 31/31/0/0; st1 3/3/0/0; w2-05 3/3/0/0.

**Equal, with skips because `ABI5_EVIDENCE_ROOT` was unset on both sides** (its evidence lives outside the repo): cross-cut-public-read 5/1/0/4; public-terminal-projection 4/0/0/4; r10-projection-contracts 11/1/0/10; held-prefix 6/0/0/6; selected-action 1/0/0/1; selected-action-authority 3/2/0/1; continuation-causation 1/0/0/1; recursive-registered-selection 7/6/0/1; native-assembly-retained-input 2/1/0/1; generic-job-revision 4/1/0/3; w2-steel-serial 2/0/0/2; m5-event-store-reopen 27/26/0/1; default-library 37/34/0/3.

**Pre-existing reds, equal, not repaired:** framework-handoff-types 6/5/1/0 (exact014 archive absent); single-address-space-consolidation 12/5/7/0 (ENOENT `consolidation-inputs/`).

## Evidence
- **E1.** `cd T && TMPDIR=/private/tmp/abg-rr-tmp npm run build` exits 0. `npm run -s lint:imports` → "check-import-direction: 3 forbidden owner pair(s) hold"; `lint:lifecycle` → "288 modules under code/src; 7 allow-listed site(s), no offender"; `lint:calculus` → "6 modules under code/src/abg/calculus/; 0 allow-listed import(s), no offender".
- **E2/E3 (tests).** Each file ran as `TMPDIR=/private/tmp/abg-rr-tb node --experimental-vm-modules --test --test-concurrency=1 test_env/tests/<file>`, one process per file. Logs are in the scratchpad: `rr/e3-head/` and `rr/e3-branch/`.
- **E4 (unchanged reads).** The completed Run `hog-success` gives 18/18 byte-identical owner reads, every Run and GraphCall member through its port. The only change is internal: Run truth gains `stopStatement: null`, and start and continue output omit it.

## Repriced requirement (REQ-P-POLICY-066)
"The originating Result is the Result the stop's own failure or block was lifted from, established only by the
references the admitted events carry. … A handled child failure, folded back and consumed by a parent re-evaluation, is
not the originating Result of a later stop. When a link is not established, the origin shall read as typed absence
naming the missing link."

## Deviations
- **F7 vs E3: the Executive decides.** The last test of `t287-recursive-failure-foldback` pins the old presentation: probe held, invocation `continue_waiting`, child `closed`. That file is outside my grant.
  - A patch is ready at `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/5e4c25c3-fca5-4dd6-89e7-20d55d008bdf/scratchpad/rr/foldback-test-F7.patch` (52 lines; `git apply --check` passes). It changes those expectations to: probe not held, no invocation, child `failed`.
  - The same facts are asserted green by `t287-readable-stops-foldback` (its fail-once subtest).
- **Duplicated fixture.** The new file reproduces the declared-foldback fixture (about 45 lines), because `test_env/support/` and the foldback test are outside my grant. It can be deduplicated into support when the patch lands.
- **Operator next action.** Native admission accepts `run-resumed` while `operator_run_stopped` holds. But `WITNESS_DEFINITION_BINDINGS.admit` binds only `reprice` and `run-stopped`, and the hc1 inventory lists `#run-resumed` as unavailable. So the reading says no next lawful action is admitted. If resume gets a binding, the reading must name it.
- **`graph_call_result` refusal.** For a stopped-folded child of an active, held or gap-stopped Run, the refusal changes from `not_ready` to `not_found`.

## Residual risks
- **Continue path.** `stopStatement` is type-checked and comes from one helper, but no stopped `run.continue` was run end to end, and the continue tests skip without the evidence root.
- **Unexercised branches.** Non-empty `nextActions`; the `missingLink` values `judged_result`, `lifted_foldback` and `child_result`; and a route that consumes a stopped foldback.
- **Same-C-call re-evaluation.** RV2's case of re-evaluating within the same C-call cannot occur on this line, because re-evaluation opens a new C-call. The causal rule's guard for retry and fan-out is untested.
- **Duplicated reader rule.** The quiescence reader rule now exists twice, in the read ports and in `replay.ts` (which is outside my grant). The Executive decides on a single owner.
- **No archives for b2a2.** Those records compare by digests only.
- **exact014.** The pin stays masked by its pre-existing red.
