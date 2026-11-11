# RV3 review: ABIogenesis RC12 failed-child foldback and process prerequisites

Reviewer commentary to the Executive, not law. I repaired nothing, edited no tracked file and activated no agent. I share a model family with the authors.
T = `build_tenants/abiogenesis/typescript`. Subject 1 is the worktree at `fff8daacf`. Subject 2 is `8206e9576`, extracted to `/private/tmp/abg-rv3-tmp/p` (P).

## Product Frame: subject 1, declared failed-child foldback (`62fd17271..fff8daacf`)
- **5.0 frame.** "Complete 5.0 Feature Set" (PRODUCT.md:1269). Feature: Compute Algebra recursion (:307-331; new sentence :329-330) under Runtime Disposition (:427-457). Scenarios: ABG5-S02 and S03. GOALS.md records RC11 accepted and GOAL035/T287 open, and names no RC12 wave. The slice is the Executive's RC12 package B2a.
- **Outcome.** A `recurse` foldback may name child failure classes. A failed child of a named class folds back `failed`, and the parent is re-evaluated over its own prior input under the same bound. Any other child failure fails the recursion, as before.
- **Authority.** GTL owns the member (constructor, valibot and JSON schemas, validator form check). HoG proposes the fold and the re-entry (`hog/recursion_lifecycle.ts:869-971`). ABG admits the foldback (`abg/graph_application.ts`) and the route (`abg/traversal_route.ts:4100-4125`), and owns quiescence (`abg/replay.ts:410-432`) and replay. Public reads project.
- **Prohibitions.** No typed outcome erased into a generic flag (:452-453). No new event kind, payload, failure class or continuation. No second runtime or private writer. Recorded Runs stay readable.
- **Classification.** The declaration is an immutable definition. Fold, re-entry and the closure gate are runtime execution entities. Quiescence and Public reads are pure projections.

## Product Frame: subject 2, declared process prerequisites (`3a02bb52f..8206e9576`)
- **5.0 frame.** Default Governance And Lifecycle Library (PRODUCT.md:1108; new paragraph :1135). Scenario: ABG5-S03. Same wave note; the slice is package P.
- **Outcome.** A Program declares, per registered purpose, the reviews that must be satisfied and current. The Executive may select next only permitted work. A non-permitted choice is refused before its wrapper opens. A task names every review its Program names, as required or not.
- **Authority.** The step declaration `abg.default_library_prerequisites` is an immutable definition bound by the step digest. `governanceTargetPermission` is a deterministic Product construction. The ABG library owner (intake, choice projection, parent standing) reads the log. The F_P selector proposes, and the binder runs inside the F_P leaf's completion.
- **Prohibitions.** Judgment does not replace declared prerequisites. Refusal happens before effect (`non_admit`, P PRODUCT.md:416). No erasure of typed outcomes (:450-451). No feature controller and no hidden default.
- **Classification.** Immutable definition, deterministic construction, and a runtime execution entity (the refusals in the log).

## Verdicts
- **Subject 1: accept with repairs.** Repair F1-1 before the live demonstration.
- **Subject 2: accept with repairs.** Repair F2-1 before the live demonstration.

## Findings
### F1-1 (S2) A folded failed child reads `closed` in Public reads
- **Rejects.** B2A2 "stop 3 … not met", and "typed outcomes are never erased".
- **Evidence.**
  - `graphCallStatus` (`abg/project_read_ports.ts:1046-1050`; used at :1124 `graph_call_result` and :1242 `graph_call_replay`) and its copy (:1069-1094) return `closed` only on `graph_call_closed` and `active` only while held. Otherwise they return the Run's `runtimeStatus`.
  - A failed child of a closed Run therefore reads `status: closed, terminalResult: null` without `graph_call_closed`.
  - The test pins this (`t287-recursive-failure-foldback.test.mjs:305`).
- **Boundary.** Public read projection, reachable only since this change. It is off the sunny-day path, but any recoverable failure in a live demonstration reaches it, for example `transport_failure`, the class B2A proposes.
- **Repair.** Report the disposition and failure Result of the admitted `child_foldback_admitted` naming the graph call. The read's `replayDigest` is the Run's, so no replay digest moves; old child reads change only where the fold disposition differs from the Run status. Fix the test. Small.
### F1-2 (S3) A closed Run's Public `run_status` shows folded frames as live
- **Evidence.**
  - `activeFluents` holds `runtime_invocation_active` for both folded frames: `run_closed` ends no probe (`calculus/rules.ts:46-81`), and the foldback ends `frame_*` and `graph_call_active` but not the probe (`calculus/axioms.ts:1178-1209`).
  - `nativeLiveness` reads `continue_waiting` / `unknown_watchdog_policy` with `frame_progress` active (test :280-283).
  - The Public projection drops quiescence (`project_read_definition_bindings.ts:317-359`).
- **Boundary.** Both values sit in the digested replay body (`replay.ts:1386-1446`), so a reader filter would split `run_status` from `run_replay`.
- **Repair.** Additive: publish the owner quiescence in the Public `run_status`. True removal is a versioned axiom change. D11 discloses this; ruling (b) stays the Executive's.
### F1-3 (S3) The class does not survive every lift; one class mixes recoverable and non-recoverable failures
- **Rejects.** D11 "every lift preserves [the class] from the first failure-class Result".
- **Evidence.**
  - A fan-out partial stop lifts as a failure carrying the blocked judgment's reason (`hog/workflow_lifecycle.ts:681-686`; B2A residual).
  - Retry exhaustion folds `blocked` (`abg/retry_lifecycle.ts:165-218`).
  - `implementation-exception@5` covers authority-verification refusals, load failures and thrown defects (`implementation/leaf_invocation_port.ts:581-611`), so declaring it folds all of them.
  - Validation is form-only.
- **Effect.** These gaps fail closed, except that a declared generic class folds failures that cannot be recovered.
- **Repair.** Correct D11. Refuse or document framework and generic classes. Small.
### F1-4 (S3) Re-evaluation is blind to the failure
- **Evidence.** REQ-009 conforms. But the re-entry input is byte-identical (equal parent `valueDigest`), and no read port gives the parent the admitted fold, so a deterministic selector reselects the failed step until the bound (B2A2 decision 1).
- **Effect and repair.** A bounded blind retry: sound for transport failures, not adaptive for contract failures. Executive decision (design_reframe).
### F1-5 (S4) The quiescence rule is wider than its tests
- **Scope.** Workflow and recursion foldbacks, blocked and failed, at any depth, with no probe-before-foldback ordering (`replay.ts:410-432`).
- **Untested.** The blocked arm reaches a closing path only through a partial-stop failure lift into a declared fold.
- **No undeclared closing path.**
  - A blocked child that is not failure-class gets a `refuse` judgment whatever the parent predicate says (`hog/workflow_lifecycle.ts:759-769`).
  - `re_enter` requires an `advance` judgment (`hog/route_proposal.ts:727-731`), so it cannot follow that refusal.
  - A root non-advance admits `run_stopped` (`abg/traversal_route.ts:5112-5116`), which ends every probe.
  - B2A2's "such a Run can now close" names no path, and I found none.
- **No counterexample.** C-call and actor probes, and every live fluent (`frame_active`, `c_call_active`, `actor_process_live`, `actor_cleanup_live` …), still block.
- **Repair.** Add a blocked-arm test or limit the rule to `failed`; add the ordering condition.
### F1-6 (S4) Tests and contract
- **Weak tests.** The undeclared test (:224-229) claims "exactly as without a declaration" but compares nothing with a no-declaration Run. The parent-fails test proves only that no child is prepared; it never reaches the route's `advance` guard.
- **Contract.**
  - The valibot and JSON schemas accept duplicate refs, while the constructor and validator refuse them.
  - Order is not canonical: one set, two refs.
  - Six type-only copies (`abg/construction_continuation.ts`) omit the member.
  - The class extractor repeats `runtime_failure.ts:202`.
### F2-1 (S2) The binder's refusal is an untyped implementation exception
- **Rejects.** Design "Refusals keep their classes" as a typed outcome (true only in that no class was added), the Product's `non_admit`, and "none may be erased into a generic success/failure flag".
- **Evidence.**
  - `selectGovernanceWork.complete` throws `TypeError("native selector choice binding refused…")` (P `implementation/default_library.ts:110-116`).
  - The log carries `implementation-exception@5` / `implementation_completion` / `thrown`, identical to "native selector exchange mismatch" (:107-108), malformed output, or any defect in that leaf; only the message differs.
  - Typed `target_not_permitted` is reached only by forged results. The Run ends `runtime_failed`.
- **Cross-subject.** A Program that wants a re-ask after a refusal must declare `implementation-exception@5`, which also folds defects and authority refusals.
- **Path.** Off the sunny-day path, but it is the refusal any enforcement demonstration shows.
- **Repair.** Return a failure candidate through the existing `refusalReport("select", …)` (`missing-owned-select`, relation `target_not_permitted`, the projection's selectors) instead of throwing. No new class family; update the witness. Small.
  - The regime must change: `refusalReport` hard-codes `computeRegime: "F_D"` (:45), and `select` is F_P. Add a regime parameter.
  - Check first that the leaf port admits a failure candidate from a `prepared_probabilistic_leaf_invocation.complete`.
  - Gain: a typed `missing-owned-select@5` becomes declarable in `failedChildDiagnosticClassRefs`, which allows a re-ask without folding defects. This answers the P Return's re-ask residual, if R7 allows it.
  - Whether the Run ends `non_admit` is the Executive's call.
### F2-2 (S3) "Offered only permitted work" overclaims
- **Rejects.** PRODUCT.md:1135+ "The Executive is offered only permitted work", and the design's "The selector is offered only permitted work".
- **Evidence.** `governanceTargetPermission` returns `offered: true` for non-permitted targets. Assembly choices and the contributions enum use `offered`, and the view lists every offered target with `missingReviews` (test :106, :111). Only the next-member enum, the binder's next member and the projection use `permitted`.
- **Repair.** Text: "The Executive may select next only permitted work; other offered work stays visible with its missing reviews."
### F2-3 (S3) The task author can waive any Program prerequisite
- **Evidence.** `required: false` never gates (`!row.required`). No reason or authority is recorded, and the Program cannot make a review mandatory.
- **Effect.** The waiver is visible in the digest-bound Run input, not silent, but it makes the Program's process advisory against the task author.
- **Repair.** Owner decision: mandatory reviews, or a recorded waiver authority.
### F2-4 (S3) The declaration is opaque at admission
- **Evidence.** Canonical JSON inside a declaration string, read only by library code (`product/default_library.ts:179-183`, `gtl/default_library.ts:59`); the validator never reads it. A malformed or hand-edited value is admitted, then every Run refuses at intake (`process_declaration`). Consumers clone and edit the graphs (`libraryConsumerDeclaration`).
- **Lawfulness.** It follows the library's Product-interpreted declarations and is digest-bound and visible.
- **Repair.** An admission check or a stated limit.
### F2-5 (S4) The fixed direct Testing/UAT route never reads prerequisites
- **Evidence.** `abg/default_library.ts:66-70`; `product/default_library.ts:134-142`.
- **Why it is safe today.** Invoke requires the wrapper's Catalog row to be a member of the named Program (`product/invocation.ts:1161`). Wrapper rows belong only to the library Program (`gtl/default_library.ts:318-320`), which declares none.
- **Gap and repair.** No test pins that a consumer Program cannot invoke a wrapper; process scope is per Program. Add one negative test.
### F2-6 (S4) Housekeeping
- The design label "design_reframe … requirements unchanged" sits beside a PRODUCT.md amendment (`5efb5be13`).
- The active design text has a dated heading.
- The removed `governanceTargetSelectable` export is an API change.

## Answers
- **Q1.** Yes. Validated: the constructor and validator refuse empty, blank and duplicate refs. Serialized through `FOLDBACK_DECLARATION_SCHEMA` and the JSON schema. Digest-bound through `foldbackRef`, the application and the definition. An absent member is byte-identical (pins test). There is one schema now; validity is split three ways (F1-6).
- **Q2.** No undeclared fold.
  - HoG (`recursion_lifecycle.ts:876-878`), ABG admission and route causation (`traversal_route.ts:4116-4118`) apply one predicate to one reason, and truth requires `childReasonRef === child.diagnosticRef` (:831-833).
  - The class is the judgment `reasonRef` through workflow lifts (`workflow_lifecycle.ts:685`), or a retained URI's `diagnosticClassRef`.
  - A declared class fails to fold, closed, after a partial-stop relabel, a retry exhaustion, a Run-level child failure (:866-868) or a framework failure. A second failure in one step occurs only in fan-out and reads as undeclared.
- **Q3.**
  - Input: the source cursor's (`recursion_lifecycle.ts:960-971`; `traversal_route.ts:4102-4104`; cold read at `traversal_cursor.ts:568`). Attempt +1 (:4124).
  - Bound: advance is refused at `attempt >= bound` (:4119). The always-fail test shows folds failed and failed, 3 parent calls, then the bound stop.
  - Same lineage, so no reset. The parent's own failure never folds. Re-evaluation is blind (F1-4).
- **Q4.** No counterexample: only frame-scope probes of frames whose lifecycle the foldback ended become historical, and live descendants and processes still block. Only Runs with a declared failed fold newly close. Without a declaration, a blocked child forces `refuse` and the root stops with `run_stopped`, which ends every probe (F1-5 evidence). The blocked arm is untested and unordered (F1-5).
- **Q5.** Digests are unchanged by construction.
  - No axiom, rule or liveness file changed.
  - The `replay.ts` diff lies wholly inside `projectRunQuiescence`, which is outside the replay body.
  - The cold-cursor change (`traversal_cursor.ts:557-575`) fires only for a `recurse` advance that consumes a failed foldback, which no recorded log contains.
  - The Writer measured 4 Runs equal; I did not rerun them.
  - Untrue today: (a) the folded child's Public replay and status read `closed`, `terminalResult: null`; (b) `run_status` `activeFluents` and `nativeLiveness` show folded frames live.
  - (a) can be fixed in the reader with no digest change; (b) only additively, and removing it is versioned (F1-1, F1-2).
- **Q6.** No conversion. The child Result stays `resultClass: failure`, and the fold carries `failed`, `childReasonRef` and `childResultRef`, so the log reconstructs what failed and why. The erasures are the Public read (F1-1) and the existing partial-stop relabel.
- **Q7.** By inspection, not run: the member, fail-once, always-fail and Public tests fail on base, whose strict schema and exact-key validator refuse the member. The pins test is conservation. The quiescence subtest's first check holds on base; its second does not. Weaker than named: undeclared and parent-fails (F1-6). The Public test pins the untrue reads (F1-1).
- **Q8.** No entry path found.
  - Schema, binder and projection apply one relation to one task. The projection re-resolves the admitted selector input by resultRef and valueDigest (`abg/default_library.ts:166-171, 184-191`).
  - The parent recomputes standing every evaluation, and only same-Run verdicts are current. Between that evaluation and the projection only a worksite observation and a tool-free F_P call occur (`toolCallCount !== 0` refused).
  - A failed native child's writes carry the dependency key (`runtime_history.ts:701-704`).
  - Direct route: F2-5. Not-required review: F2-3. A missing named review is refused at intake.
- **Q9.** Yes. The declaration is in the step digest, callable membership and Catalog row. Without it, the HEAD_PINS equal `3a02bb52f`. The string form hides structure from the validator (F2-4).
- **Q10.** One function decides. Assembly and projection derive targets from one declaration. Text contradiction: F2-2.
- **Q11.** No wrapper call and no write: roles end at `select:construction`, and only earlier-step paths changed (I reran the witness). The class `implementation-exception@5` with `cause` TypeError is shared with defects in that leaf (F2-1).
- **Q12.** Neither. Intake forces every named review to be declared; `required: false` waives it visibly, with no reason or authority (F2-3).
- **Q13.** Complete.
  - `native_worksite_execution.ts` and `runtime_history.ts` diff empty against `7b5d2a358^`. The test file is deleted, and the design bullet and stub comment are replaced.
  - `governanceAssessmentDependencies` (P `abg/default_library.ts:307, 449`) and the authority-selections line (:251) are intact.
  - A2's PRODUCT sentence holds: C2 writes only its sandbox, and a product delta is `product_mismatch` (`worksite_command_helper.ts:1596-1667`).
- **Q14.** Subject 1: the PRODUCT sentence and REQ-009 are exact; D11's lift claim is false (F1-3). Subject 2: "refused before the work is entered" and "binds only a required review" are exact. "Offered only permitted work" overclaims (F2-2); see F2-1 on "Refusals keep their classes".
- **Q15.** The relation cases use hand-built standing rows. The owner cases link the built owner over stubbed authentication, invocation, basis and index rows, so the crossed case (:192) proves the equality check, not index population. The witness covers the path end to end. By inspection, tests 2-6 fail on base, which lacks the option; test 1 is conservation. The stand-in actor breaks the schema on purpose to reach the binder, which is legitimate.

## What I ran (TMPDIR under `/private/tmp/abg-rv3-tmp`)
- **Builds.** `npm run build`: S1 exit 0; P exit 0.
- **Fixture fault.** The first P runs of `-prerequisites` and `-reviews` failed with ENOENT on the absent `.ai-workspace/.../default-library-witness` fixture, an environment fault. I `git archive`d those 14 files (68 KB) and reran.
- **Build side effect.** After my S1 build, the worktree shows two tracked generated files modified: `contracts/capabilities/capability-definition-graph.json` and `product-toolchain-manifest.json`. `npm run build` regenerates them; B2A2 T4 records that base's own output already differs. I did not restore them.
- **Reds.** There were none, so nothing needed a solo rerun.

| Subject | File | Tests | Pass | Fail | Skipped | Time |
|---|---|---|---|---|---|---|
| S1 | `t287-recursive-failure-foldback` | 8 | 8 | 0 | 0 | 258 s |
| S1 | `m5-terminal-quiescence-owner` | 7 | 7 | 0 | 0 | 0.6 s |
| S1 | `t287-runtime-activity-quiescence` | 1 | 1 | 0 | 0 | 0.4 s |
| S1 | `t287-recursive-registered-selection` (B2A base 7/6/0/1) | 7 | 6 | 0 | 1 (live) | 256 s |
| P | `t287-amendment-witness` | 8 | 7 | 0 | 1 (live) | 225 s |
| P | `t287-default-library-prerequisites` | 6 | 6 | 0 | 0 | 0.7 s |
| P | `t287-default-library-reviews` | 10 | 10 | 0 | 0 | 184 s |
| P | `t287-default-library` | 37 | 34 | 0 | 3 (env-gated) | 340 s |
| P | `t287-default-library-fulfillment` | 7 | 7 | 0 | 0 | 1.4 s |

## Not checked
- The combined candidate (both subjects on one base) is unbuilt.
- I did not rerun recorded-Run digests.
- The base-failure claims in Q7 and Q15 rest on inspection (base `strictObject`, exact keys, no `prerequisites` option); I ran no base build.
- Not run: broad suites, lints, `t287-route-reconstruction` (pre-existing reds), installed qualification.
- Unchecked consumers: the removed export, and the P Return's inventory consumers.
- Whether a consumer may author Catalog rows for wrapper refs.
- The partial-stop reason value, traced concretely.
- Live or provider paths.
