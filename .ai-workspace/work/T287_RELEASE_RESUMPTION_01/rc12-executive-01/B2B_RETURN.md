# RC12 package B2b Return: recoverable step failure in the default library

Writer Return (commentary).

- **Location.** Worktree `/private/tmp/abg-rc12-consensus-20261111`, branch `claude/rc12-integration`, base `c8b63f204`. T = `build_tenants/abiogenesis/typescript`.
- **Commits.** `da1d589a9` (T3), `a61231c6a` (T4), `63c6a7563` (T5), and this Return. T1, T2, code and tests are not written.
- **Tree.** Code is at HEAD. One experiment was declared in `gtl/default_library.ts`, built, run, reverted and rebuilt. Only regenerated contract files are modified, and they are uncommitted.
- **Scratch.** S = `/private/tmp/claude-501/-Users-jim-src-apps-specification-methodology/5e4c25c3-fca5-4dd6-89e7-20d55d008bdf/scratchpad`. The census is under `S/b2b-census/` and the baseline under `S/b2b-base/logs/`.

## Verdict: stopped (R1 contradicted by a file I may not edit); two rulings needed

**Counterexample (stop 1).**
- `t287-readable-stops` tests 1 (worker exit) and 2 (absolute ceiling) assert `roles == ['select:construction','native:<mode>']` and `runtime_failed` with reasonRef `…/native-work/transport_failure@5`.
- Their consumer is `libraryConsumerDeclaration`, which copies the library's recurse foldback, so it inherits R1's default list.
- With the list declared (experiment below), test 1 is red:
  - `actual`: 11 × (`select:construction`, `native:exit`), then a blocked bound stop.
  - `expected`: `['select:construction','native:exit']`.
  - Log: `S/b2b-census/disc/readable-stops-exit.log`.
- Test 2 carries the same class and the same roles assertion. I did not run it.
- The file is on the do-not-edit list. On this evidence, neither A nor B below qualifies under the stop rule.

**A second contradiction (R3 against R2).**
- In `implementation/default_library.ts:107-108`, a selector process exit and a selector exchange-identity mismatch throw the same `"native selector exchange mismatch"`. The identity mismatch is a differing request, promptDigest, inputDigest or implementationRef, which is an integrity failure.
- Both end as `implementation-exception@5` at the select leaf, under F_P `implementation/select`.
- R3(a) and (b) admit both, because the select leaf has no worksite effect. R3 as written therefore continues past an integrity failure, which R2 forbids.

## Alternatives (for the Executive)

- **A. Keep R1's default list. The two readable-stops Runs declare an empty list** (smallest).
  - `support/default-library.mjs` `libraryConsumerDeclaration` forwards `failedChildDiagnosticClassRefs` to `defaultGovernanceGraphFunctions`. That is one line in a witness support file.
  - `stoppedRun` in readable-stops passes `[]` for `exit` and `absolute`. That is about 2 lines, owned by the other Writer.
  - The tests then prove readable stops on a Program with an empty list. R1 permits that list.
- **B. Opt-in list.** The library default is empty and the witness declares the list. This stays in my territory but loses R1's outcome for the default library, so the rule does not let me take it.
- **Rejected.** The support default strips the list. That would hide the library's behaviour from every consumer test.
- **Selector identity, choose one:**
  - (i) A select origin continues only when the log has an `actor_invocation_failed` related to that select cCall (a routine process failure; present in the selector-exit census row), or when the retained diagnostic's cause is the binding refusal.
  - (ii) Accept that a selector identity mismatch re-dispatches. It has no effect, but it contradicts R2.
  - I recommend (i). No new class is needed.

## Class census (Public start, default-library topology, this head, list not declared)

Each class is `failedChildDiagnosticClassRef(childReasonRef)` at the recursion route. Every Run stopped `runtime_failed` at `executive@5`, stage `route`, except C2.

| Scenario | Class | Origin (GraphFunction; locus; regime) | `after` | changedPaths | Timeout class on | Invocation fact |
|---|---|---|---|---|---|---|
| Worker exit 3 after a partial write | `native-work/transport_failure@5` | native-work@5; native-work leaf; F_P native-work-fp | present | `generated/hello-world.mjs` | – | `actor_invocation_failed` transport_failure |
| Absolute ceiling | same | same | present | [] | `absolute`: on `actor_process_timeout_observed`, `actor_result_artifact_observed` and `c_call_evidenced` | same |
| Inactivity | same | same | present | [] | `inactivity`, on the same three events | same |
| Report refused (no `gaps`) | `native-work/contract_failure@5` | same | present | [] | – | `actor_invocation_failed` contract_failure |
| Write outside the grant | `native-work/write_scope_violation@5` | same | present | `design/implementation-design.md` | – | none |
| Assessor exit | `native-work/transport_failure@5` | native-work/assessment@5; assessment leaf; F_P native-work-fp | present | [] | – | `actor_invocation_failed` transport_failure |
| Selection refused at binding | `implementation/implementation-exception@5` | executive-step; `node://…/default-library/select@5`; F_P implementation select; value `governance_failure`/`implementation_exception`; cause "native selector choice binding refused" | n/a | n/a | – | none |
| Selector exit | same | same; cause "native selector exchange mismatch" | n/a | n/a | – | `actor_invocation_failed` transport_failure |
| C2 helper mismatch | **not produced**: the tamper did not apply, every `exitStatus` was 0, and the Run reached bound 6 blocked | – | – | – | – | – |

- **Lift chain (native).** The leaf F_P failure folds back through a failed workflow foldback in construction@5 or review@5, then a lifted `child_traversal_failed` (F_D), then a failed workflow foldback in executive-step, then the lifted step. The selector fails directly in the step graph, with no workflow foldback.
- **Unknown-effect facts.** No `transport_exception` or `actor_process_termination_unconfirmed` appeared in any scenario.
- **C2 is outside the list by construction.** C2 diagnostics are `worksite/command-execution/<kebab-class>@5` (`worksite_command_execution.ts:235`), a family disjoint from `native-work/*` and `implementation-exception`.
- **`timeoutClass` is not on the failure Result.** R4's fold must read it from the origin cCall's `c_call_evidenced`.

**Class choices to confirm.**
- **Observed and proposed:** `implementation-exception@5`, `native-work/transport_failure@5`, `native-work/contract_failure@5`.
- **Fits R1 but not observed:** `native-work/result_contract_failure@5`, a report the transport accepts and the strict parser refuses (`native_workspace_work.ts:74`).
- **Excluded unless you rule otherwise:** `no_output` (exit 0 with an empty report), `incomplete`, `post_work_observation_failed`, `transport_identity_mismatch`, `assessment_independence_mismatch`, `write_scope_violation`.
- **`transport_failure` also covers more** (`transport_contracts.ts:125-129`): an unconfirmed termination, a spawn failure and an API retry. R3(b) separates the unconfirmed termination through its own fact.

## Discriminator (experimental list, then reverted)

- **Setup.** I declared `[implementation-exception, native-work/transport_failure, native-work/contract_failure]`, used bound 6, and made one step fail once.
- **Selection refused once.** A failed recursion foldback was admitted (implementation-exception). The parent C-call reopened at attempt 2 on the same graphCall and frame. The selector chose again and the Run continued.
- **Worker exit once.** Same result: a failed foldback (transport_failure), then parent attempt 2, and the Run continued.
- **Line 866.** The early return (`replayState.runtimeStatus === "failed"`) was not taken in either case.
- **R6, shown directly.** Both Runs had 6 parent evaluations and 5 children, including the failed one, and ended `run_stopped` `bound-exhausted`. No separate budget exists.

## Pins that move under a default list (R7)

- `t287-default-library-prerequisites` `HEAD_PINS.graphs` and `.library`.
- `t287-default-library-reviews` `OLD_INSTANCE_PINS.gtl3`.
- `t287-recursive-failure-foldback` "…without failedChildDiagnosticClassRefs keeps its base bytes…", lines 90–96:
  - the executive applicationRef `ac6f1ba5…`;
  - foldbackRef equality with the base;
  - `sha256Canonical(executive)` `235f8c59…`;
  - the round-trip digest `ca78eb2f…`.
- Building with an empty list keeps every one of these values. E2 asserts that.

## Prepared design (O1–O5, not applied)

- **O1.** `defaultGovernanceGraphFunctions({failedChildDiagnosticClassRefs})` uses the confirmed list as its default. An empty list omits the member, since the schema requires `minLength 1`.
- **O2. Origin.**
  - Start from the recursion `child_foldback_admitted`: failed, with `applicationRef`, and `basisId` equal to the parent basis. Take its `childResultRef`.
  - Follow failed workflow foldbacks under `payload:parentCCallRef:<result aggregateId>` until none remains.
  - The origin is the leaf failure Result at the `abg.framed_synthesis_locus` select node, or at the native-work or assessment GraphFunction.
- **O3. Attributable effects.** The value's `after` is not null. There is no `actor_process_termination_unconfirmed` under `related:<actorInvocationRef>`, and no `actor_invocation_failed` with `transport_exception` related to the origin cCall. These are the two causes `nativeWorkUnknownEffectDependencies` reads.
- **O4. Fold.**
  - Collect this Run's failed recursion foldbacks before the current step, in ordinal order.
  - Each row has:
    - from the step's `registered_graph_choice` under `graph-call:<childGraphCallId>`: graph and reviewRef;
    - class;
    - from the origin's `c_call_evidenced`: timeoutClass;
    - changedPaths;
    - the refusal cause (select origin);
    - resultRef.
  - The member is optional. The refs are appended to `framedSynthesisEvidenceRefs`.
- **O5. Refusal.** `evaluateGovernanceParent` gains `refusalReport`. `projectGovernanceParent(basis, input, refusal?)` refuses at stage `parent_reentry` with the relation `failure_origin` or `failure_effects_unattributed`, and selectors `{failureResultRef}`.

## Baseline E4 (copy of base `c8b63f204`, before any change)

Failures 0. The skips are environment-gated live or capture cases.

| File | Pass | Skipped |
|---|---|---|
| default-library | 34/37 | 3 |
| default-library-fulfillment | 7/7 | 0 |
| default-library-reviews | 10/10 | 0 |
| recursive-registered-selection | 6/7 | 1 |
| registered-graph-selection | 1/1 | 0 |
| governance-covered-source-use | 3/9 | 6 |
| default-library-prerequisites | 6/6 | 0 |
| recursive-failure-foldback | 8/8 | 0 |
| readable-stops | 4/4 | 0 |
| amendment-witness | 7/8 | 1 (live) |

**E5.** Three interruption-proof lines, not two, all ✔: default-library "Run interrupted at the durable entered Testing cursor resumes once…" (87 s); recursive-registered-selection "interrupted recursive workflow resumes its exact pending execution once" (41 s) and "…through the cold Public run.continue pending_execution arm" (58 s).

## Text commits

- **T3.** PRODUCT "System And One Surface" and row A5-F07 read "A system program". The grep found one more, REQ-P-POLICY line 178: "the admitted standard system program" became "an admitted system program". No other such statement exists in specification, requirements or design.
- **T4.** INTENT lines 174–176 lose "standalone Consensus qualification"; nothing else changes. **T5.** REQ-L-GTL3-RECURSE-007 gains the bound-counting sentence.
