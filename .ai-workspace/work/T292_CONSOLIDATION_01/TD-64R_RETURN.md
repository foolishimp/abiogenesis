# TD-64R Return: design-note repair

**Status:** complete with residuals. Branch `claude/td64r-design-repair` in
`/private/tmp/abg-td64r`, cut from `39d6cb975`. Thirteen repair commits plus
this Return. 28 stale or narrative sections cut from 18 notes; 3 of the cuts
are retired by TD-31. Ruling 2 rewrites in 5 notes. One citation re-pointed. No
realization change. Four items need an Executive ruling (listed under "Items
needing a ruling").

Change class: `design_reframe`, with no realization change. Every cut and every
replaced text sits verbatim in `T/design/history/<NAME>__RETIRED_SECTIONS.md`.
Each file starts with a line naming the note, the commit and the line ranges.
`T` is `build_tenants/abiogenesis/typescript`.

## Commits

| Commit | Content |
|---|---|
| `6bcda2838` | Ruling 3: typed-recurse header and D6-D9 restated (ruling 2), README line 21 |
| `6c6a0b759` | Ruling 5: F_P admission citation re-pointed in `T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION` |
| `0851f8886` | Ruling 6 cuts: `ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION`, `M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION`, `M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN` |
| `8eda97f3d` | Ruling 6 cuts: `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN`, `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN`, `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN` |
| `54f2e223a` | Ruling 6 cuts: `T287_W2_R3_C0`, `_C1`, `_C2`, `_C3`, `T287_W2_R3_SINGLE_START` |
| `a2769c3f7` | Ruling 6 cuts: `T287_W2_R2`, `T287_D4_SELF_CONFORMANCE`, `T287_F11_CARRIER_RESOURCE`, `T287_DECLARED_TESTING_CAPABILITY`, `T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY`, `T287_C1_PRESERVED_RESULT_ARTIFACT` |
| `cf4c8d9c7` | Ruling 2 rewrite: `M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION` Problem, carrier rows and Decision Rules |
| `97d2b7a4f` | Ruling 2 rewrite: `ABG_EVENT_CALCULUS_IACS` proof paragraph |
| `ef4c90103` | First version of this Return (superseded by the final commit) |
| `86b3f4d35` | `M03_SYSTEM_PROBE` pointer moved to after its requirement list (the README part of the message landed in the next commit) |
| `f7c1961ff` | README line 30: system-probe disposition owner `abg/calculus/liveness.ts` |
| `27892afd7` | Ruling 2 rewrite: `T287_NATIVE_LIVENESS_CONSERVATION` §7 |
| `0129817e2` | Ruling 2 rewrite: `T287_DECLARED_TESTING_CAPABILITY` environment-coverage paragraph |
| `98da94a2c` | TD-31: three `T287_STDO_RUN_ENVIRONMENT_PILOT` sections cut |

## Ruling 3: typed recurse

`M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN` goes from 237 to 252 lines.

- Line 7 now names `ABI5_REALIZATION_CONSTITUTION.md` as tenant authority.
- D6-D9 are restated under ruling 2. Headings and decision identifiers stay.
- D11 is unchanged.
- The original line 7 and lines 48-175 are appended to the existing retired
  file after a `---` separator, which takes it from 506 to 641 lines.
- README line 21 now names child preparation and foldback admission. It also
  adds `hog/child_traversal.ts` and `abg/traversal_route.ts` as realizing
  modules.

In the table, `hog/` is `code/src/hog`, and likewise for `abg/` and `gtl/`.

| # | Rule as restated | Realizing source |
|---|---|---|
| D6.1 | HoG prepares the child traversal before the child runs | `prepareChildTraversal`, `hog/child_traversal.ts` |
| D6.2 | ABG admits a child execution basis bound to the parent basis and scope, the parent CCall, the child GraphFunction and the parent result as input | `admitChildExecutionBasis`, `abg/execution_basis.ts` |
| D6.3 | The child scope opens with its own GraphCall and frame | `openTraversalScope`, `abg/open_call.ts` |
| D6.4 | The child returns a traversal completion with disposition closed, held, blocked or failed | `ExecutableTraversalCompletion`, `hog/traversal_completion.ts`; `completeRecursionChildUsing`, `hog/recursion_lifecycle.ts` |
| D6.5 | HoG proposes the foldback and ABG admits it; the child does not | `admitChildFoldback`, `abg/graph_application.ts` |
| D6.6 | The next attempt opens only through an ABG-admitted recursion route | `applyRecursionRoute`, `hog/traversal.ts` |
| D6.7 | Termination reads only the parent locus's result | `recursionTerminationDecision`, `gtl/graph_applications.ts` |
| D6.8 | A failed child is authenticated against the prepared basis and scope at the successor prefix: route, Result, Judgment, C_Call, value digest and diagnostic agree | `projectFailedRecursionChildTruth`, `hog/recursion_lifecycle.ts`; `projectChildFoldbackTruth`, `abg/child_lifecycle.ts` |
| D6.9 | The active Run stops through the runtime-failure owner, caused by the failed child route | `admitRuntimeFailure`, `abg/runtime_failure.ts`; `completeRecursionChildUsing` |
| D6.10 | An opaque diagnostic names the child C_Call, Result, Judgment and the parent coordinates; a canonical retained-JSON diagnostic keeps its exact decoded subject, including JSON `null` | `completeRecursionChildUsing`; `readRuntimeFailureDiagnosticSubject`, `constructRuntimeFailureDiagnosticRef`, `abg/runtime_failure.ts` |
| D6.11 | No foldback, termination evaluation, rebind or retry follows a failure; an already-failed Run propagates without a second admission | `completeRecursionChildUsing` |
| D6.12 | Missing, crossed or stale child truth fails with `application-foldback-mismatch` | `recursionFailure`, `hog/recursion_lifecycle.ts` |
| D7.1 | Recursion continues only while the attempt is below `bound`; ABG refuses an advance route at the bound | `beginRecursionApplicationUsing`; `recursionRouteCausation`, `abg/traversal_route.ts` |
| D7.2 | At the bound, a blocked route with reason `bound-exhausted` is admitted before any child preparation or foldback | `blockRecursion`; `recursionRouteCausation` |
| D7.3 | Held and blocked children never reach a termination decision | `completeRecursionChildUsing` |
| D7.4 | Consensus terminates on `$.terminal`: `closed_done` terminates; only `recurse_next_round` continues | `constructConsensusModulePublication`, `reduceConsensusRound`, `gtl/consensus.ts` |
| D8.1 | ABG admits `child_foldback_admitted`. Its body binds the declared foldback, child output, parent CCall, judgment and cursor, and the child basis, GraphCall and frame. `foldbackRef` is the digest of that body | `admitRecursiveApplicationChildFoldback`, `abg/graph_application.ts` |
| D8.2 | Refusal codes are `application_mismatch`, `parent_truth_mismatch` and `child_truth_mismatch` | `admitRecursiveApplicationChildFoldback` |
| D8.3 | The route refuses a crossed input or lineage. The advance route consumes exactly the judgment and the foldback, and its target input is the foldback output | `recursionRouteCausation` (`consumedAvailabilityRefs`) |
| D8.4 | A refused foldback is admitted as runtime failure truth | `recursionFailure` |
| D8.5 | A foldback is necessary but not sufficient: an admitted advance route must consume it | `recursionRouteCausation`; `applyRecursionRoute` |
| D9.1 | Every recurse declaration carries `requiresParentEvaluation: true` | `FOLDBACK_DECLARATION_SCHEMA`, `gtl/serialization_contracts.ts`; `recurseApplication`, `gtl/graph_applications.ts` |
| D9.2 | A closed child's output re-enters the same parent term at the next attempt | `deriveRecursionReentryCursor`, `hog/traversal.ts` |
| D9.3 | Rebind admission is the deterministic ABG route admission. It checks the foldback, the parent truth, input equality, the cursor lineage and the bound, and re-derives the foldback from admitted events | `recursionRouteCausation`; `isAdmittedApplicationChildFoldbackAtPrefix`, `abg/graph_application.ts` |
| D9.4 | Only an admitted advance route moves the parent; the next attempt consumes exactly the foldback output | `applyRecursionRoute`; `deriveRecursionReentryCursor` |
| D9.5 | The parent locus evaluates again, and termination is decided over its new result | `beginRecursionApplicationUsing` |
| D9.6 | Closure and foldback alone never terminate; a held child is returned unchanged; the route admits only `advance` and `blocked` | `recursionTerminationDecision`; `completeRecursionChildUsing`; `recursionRouteCausation` |

Unverified sentences, kept verbatim:

- D6: "The child adapter owns only the GraphFunction interior and must be
  idempotent for the prepared child GraphCall ref."
- D6: "Prior admitted parent work and unresolved input remain unchanged."

## Ruling 4: terminal quiescence

The two functions are not the same, so nothing in the note changes.

What the note describes is the frozen HOW at
`.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/e03-common-lifecycle-law-design-02/HOW-proposal.md`,
lines 11-23 and 94:

- a new module `abg/event_calculus_actor_lifecycle.ts`;
- `decideActorProcessLifecycle(actorInvocationRef, actorRows, runTerminalRows): Readonly<ActorProcessLifecycleDecision>`,
  a decision over row arrays;
- `projectActorProcessLifecycle` keeps its signatures and consumes that
  decision.

The note therefore names two functions, a decider and its consumer.

What head has:

- The decision role is the Event Calculus rule `actor_process_lifecycle`. It is
  realized by `deriveActorProcessLifecycle(FoldState, RuntimeEvent) -> EventCalculusEffect`
  in `abg/calculus/rules.ts:126` and registered in `ROOT_DERIVED_RULES`.
- `cleanupPending` is `not A and (T or U or (R and formerlyActiveActor))`.
- `projectActorProcessLifecycle` (`abg/actor_process.ts:602`) reads the fluents
  through `runtimeFluentHoldsAtPrefix`.
- `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN` §4 designs this, and
  §4.6 covers the process-facts terminal classification.

Head contradicts the note's token frontier (note lines 15-18). `rules.ts`
initiates `actor_cleanup_pending` on `actor_process_exited`,
`actor_process_spawn_failed` and `actor_process_termination_unconfirmed` when
there is no actor terminal, before any Run stop.

Unverified: whether a Process start after a matching Run stop is refused.

Section verdicts for the note:

| Lines | Verdict |
|---|---|
| 3-46 | Lifecycle conjunction, superseded or contradicted by head |
| 47-71 | Amendment record |
| 72-95 | Ratification of four tracked Codex posts, which were not read |
| 96-106 | Implementation-authorization record |

The note is cited by `T287_W2_R3_C2` and by README line 34. See "Items needing
a ruling".

## Ruling 5: citations of moved notes

- **`T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION` line 195: re-pointed.** The link
  `[F_P admission design](history/M03_FP_OUTPUT_ADMISSION_BEHAVIOR_DESIGN.md)`
  became `[F_P admission owner](../code/src/abg/probabilistic_result.ts)`.
  `admitProbabilisticResultCandidate` and
  `admitProbabilisticResultFromActorTransport` keep the raw and target output
  contracts distinct and check the transport basis. `c_call.ts` admits
  `c_call_result_admitted` and then `c_call_judged`, with causation on the
  result event. The link noun changed from "design" to "owner"; this is a
  deviation.
- **`T287_G2` line 182: unchanged.** `REQ-L-GTL3-LAWS-028` states the witnessed
  surfaces, bindings and live facts. The only statement of the reason-to-repair
  map is the history note's Carrier Contract (`VERSION_BASIS_REPAIR_EDIT_CLASS`).
  No carrier for it exists in code. The rule, quoted:

  | Reason | Repair |
  |---|---|
  | `subject_kind_ref_incoherent` | `correct_reference` |
  | `surface_binding_missing` | `add_missing_declaration` |
  | `surface_binding_ambiguous` | `remove_duplicate_declaration` |
  | `version_fact_missing` | `add_missing_declaration` |
  | `version_fact_ambiguous` | `remove_duplicate_declaration` |

## Ruling 6: section-level check of the 45 kept notes

Method: `sweep.py` lists each top-level section's distinctive code tokens and
checks them against `code/src`, and counts narrative keywords. The scripts are
in `/private/tmp/abg-td64r-work/`.

- **Read in full against source:** every section with absent tokens or
  narrative signals.
- **Read from the opening lines plus the token check:** sections with live
  tokens and no narrative signal.

Before every cut, `cites.py` searched for citations of the section's anchor and
number in code, scripts, test_env, specification, active tickets and kept notes,
and checked the note for references to its own sections by number. Every cut
section has zero citations.

- **Cut placement:** each cut runs from the blank line before the heading to
  the section's last content line, so the kept note has no doubled blank line.
- **Pointer:** a pointer line follows the note's first header block.
- **Commit in the retired-file header:** `39d6cb975`, because each cut note is
  byte-equal to it.
- **Verification:** for every note, a script checks that the retired-file tail
  equals the original ranges and that the kept note equals the original minus
  those ranges, plus the pointer.

18 notes need cuts, which is under the cap of 20.

README lines: the cuts remove narrative and change neither what a note designs
nor its realizing modules, so those lines stay. README line 30 (system probe)
now adds the disposition owner `abg/calculus/liveness.ts`, because the ruling 2
rewrite states the disposition rules it realizes.

Before cutting, I checked the two cut sections that state a rule for any other
statement of that rule:

- **F11 §10:** "values must contain no proof preimages". Kept F11 §6 still
  states that the successful `QualificationJudgment` "carries no scope,
  declaration/readiness, source-body or record preimage".
- **D4:** "keep the Public member roster unchanged". The constitution (line
  3216) states that the operation and member roster stays at 18/56. Kept D4
  line 16 names the qualification-only `self_conformance` kind.

### Sections cut (ruling 1)

| Note | Base lines | Section | Class |
|---|---|---|---|
| `ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION` | 23-31 | First Slice | stale: designs absent vector events |
| `M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION` | 95-103 | First Slice | narrative |
| `M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN` | 1356-1394, 1418-1458 | 14 Donor Admission And Retirement; 16 Implementation Handoff; 17 Candidate Decision | narrative |
| `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN` | 809-824 | Design Acceptance Predicate | narrative |
| `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN` | 2570-2634 | 14 Construction Order After Direct Gate 1 Acceptance; 15 Gate 1 Review Contract | narrative |
| `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN` | 3448-3508 | 12 Freeze And Review Gate | narrative |
| `T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN` | 800-808 | Stop And Return | narrative |
| `T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN` | 180-196, 652-691, 783-806 | Future Predecessor Gate; Future Realization Surface (Unselected); Downstream Reacquisition Gate (Prospective And Unselected) | narrative |
| `T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN` | 978-1037 | 10 Retained Failure And Superseded Five-Path I/E Plan | narrative |
| `T287_W2_R3_C3_BRANCH_CONSTRUCTION_AGGREGATE_DESIGN` | 676-710, 894-911 | 10 Prospective Realization Boundary; 13 Stop And Review Return | narrative |
| `T287_W2_R3_SINGLE_START_CONSTRUCTION_EXECUTION_DESIGN` | 340-358 | Owning amendments and small realization frontier | narrative |
| `T287_W2_R2_CONSUMER_DECLARATION_ADMISSION_DESIGN` | 151-177 | Implementation cut and source-blind proof; Disposition | narrative |
| `T287_D4_SELF_CONFORMANCE_DESIGN` | 195-252 | First Realization And Proof; Remaining Realization And Return | narrative |
| `T287_F11_CARRIER_RESOURCE_DESIGN` | 577-655 | 10 Bounded Implementation Territory And Discriminator | narrative |
| `T287_DECLARED_TESTING_CAPABILITY_DESIGN` | 192-234 | Proposed Implementation Territory And Stops | narrative |
| `T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN` | 295-324 | 7 Readiness and separate activation order | narrative |
| `T287_C1_PRESERVED_RESULT_ARTIFACT_DESIGN` | 175-205 | Exact coding cone and discriminator | narrative |
| `T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN` | 720-881, 938-1007 | Declaration And Capability Contract; One Existing-Owner Admission Route; Evidence, Instructions And Replay | stale: retired by TD-31 |

### Ruling 2 rewrites in notes under 600 lines

**`M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION`** goes from 103 lines to 96
after the cut and to 118 after the rewrite. The replaced ranges (lines 17-22,
30-35, 42-43, 45 and 72-89 of the note after the cut) are appended verbatim to
its retired file. The pointer first landed between `**Requirement authority**:`
and its list. It now follows the list (`86b3f4d35`), and a script re-checked
the note against base `39d6cb975` with every operation applied.

In the table, `liveness.ts` is `abg/calculus/liveness.ts` and `contracts` is
`abg/runtime_liveness_contracts.ts`.

| Rule as restated | Realizing source | Difference from the replaced text |
|---|---|---|
| One observer projection derives liveness and disposition from replay | `RuntimeLivenessObserverProjection` (contracts); `deriveRuntimeLivenessProjection` (`liveness.ts`) | T-106/T-108/T-115/T-127 history dropped |
| Probe sources are the closed `RUNTIME_PROBE_SOURCE_VALUES` | contracts | The prose list of observable activity is replaced by the realized enum. The rewrite claims no item-by-item mapping |
| Probe signals are `coverage`, `activity`, `artifact_pending`, `artifact_admitted`, `artifact_rejected`, `external_interruption` | `RuntimeProbeObservation` (contracts) | none |
| Probes do not decide retry or graph movement; the projection does | `deriveRuntimeLivenessSemantics` (`liveness.ts`) | none |
| The event carriers are `runtime_activity_probe_observed` and `runtime_external_interruption_observed` | `stageRuntimeActivityProbe`, `abg/runtime_liveness.ts`; event kinds in `abg/event_store.ts` | Type names `Runtime*ObservedEvent` do not exist. "Or hard safety cap" as an interruption source is dropped: a hard cap admits `actor_process_timeout_observed` |
| `RuntimeWatchdogPolicy` holds the startup and inactivity leases, the hard cap and the termination grace; the retry budget and terminal policy are separate budget facts | `constructRuntimeWatchdogPolicy` (contracts); `projectRuntimeRetryBudgetFacts` (`liveness.ts`) | The old row put retry budget and terminal actions in the policy |
| Rule order: hard cap, pending artifact, policy and interruption, preserved admitted artifact, closed attempt, lease | `deriveRuntimeLivenessSemantics` | Order and the preserved-artifact case were unstated |
| Rule 1: interruption gives `yield_continuation` or the budget's `terminalPolicy`; with no policy, `continue_waiting` | same | "Terminal unless a policy reprices" is realized as `terminalPolicy` (`block`, `escalate` or `reprice_policy`) |
| Rule 2: `artifact_pending` gives `inspect_archive` | same | "Activity before transport failure" is narrowed to a pending artifact observation |
| Rules 3-4: lease deadline is `startupMs`, or last activity plus `inactivityMs`; an expired lease with a live process gives `controlled_terminate` (`startup_expired` or `inactivity_expired`) | same | The lease states `startup_silence_exceeded` and `inactivity_exceeded` do not exist; the realized state is `leaseExpired` |
| Rules 5-6: a closed attempt, or an expired lease with full coverage and no live process, gives continuation, terminal policy at zero budget, `retry` when eligible, else `block` | same | A closed attempt is added as a trigger, as the code does |
| Rule 7: hard cap with a live process gives `controlled_terminate`, and the boundary admits `actor_process_timeout_observed` (`absolute`) | same; `admitRuntimeThreshold`, `abg/runtime_liveness.ts` | `requires_external_interruption_event` does not exist |
| Rule 8: otherwise `continue_waiting` | same | none |

**`ABG_EVENT_CALCULUS_IACS`** goes from 83 to 90 lines. Lines 51-54 named
`test_t120_event_calculus_runtime_law.test.mjs`, which does not exist. The
restated paragraph cites `test_env/tests/m5-event-calculus-runtime.test.mjs`,
case "closed typed Event Calculus law refuses missing, duplicate, malformed, and
contradictory input".

| Proof claim kept | Realizing source |
|---|---|
| Missing and duplicate axiom kinds are refused | `validateRuntimeEventCalculusAxiomKindsForModuleTest`, `abg/calculus/axioms.ts` |
| An unconstrained fluent pattern is refused | `constructRuntimeFluentPattern` |
| An effect that both initiates and terminates a fluent is refused | `validateRuntimeEventCalculusEffectForModuleTest` |
| A non-nominal prefix is refused | `deriveRuntimeEventCalculusProjection`, `abg/event_calculus.ts` |

The replaced sentence named a test file that does not exist, so it was false
as written. Ruling 2's "unverified" clause does not cover it. The claims that
`m5-event-calculus-runtime.test.mjs` proves are restated. The remaining claims
are dropped from the live note and sit in the retired file:

- initiation, inertia and clipping;
- undeclared-kind rejection, which differs from the missing-kind check;
- vector-closure parity, which is stale because vector events are absent.

No test was located for them. The Executive may want them restored with
another test named.

**`T287_NATIVE_LIVENESS_CONSERVATION_DESIGN`** goes from 344 to 336 lines.
§7's heading is kept.

| Change | Realizing source or reason |
|---|---|
| Lines 287-299 (accepted source/test plan, required source evidence, "no acceptance follows here") moved to the retired file | Activation plan; there is no code statement to restate |
| Snapshot identity uses a private WeakMap association; key, proof descriptor and private brand must agree | `SNAPSHOT_PROOFS`, `SnapshotProof.for` (`#source in proof`), `abg/runtime_derivation.ts` |
| Proofs have no snapshot backpointer | `SnapshotProof` holds only `#source`, `#parent` (a proof) and `#shared` |
| The reconstruction retains completed context, budget and fold facts for its owner source | `RuntimeLivenessReconstruction.folds`, `livenessReconstruction`, `abg/calculus/liveness.ts` |
| "The measured cumulative cut-cache retention is the selected repair seam ... remain to be proved" moved to the retired file | Future work |

Unverified sentences, kept verbatim: the WeakRef and kept-objects rationale;
"Current reusable facts ... remain those below"; and the call-local view
sentences (no intermediate historical vectors kept across calls, views released
on return, reverse and repeated queries give the same answers, rollback
discards disposable facts).

**`T287_DECLARED_TESTING_CAPABILITY_DESIGN`** goes from 193 to 197 lines. In
"Existing Chain And The Missing Relation", the paragraph "The gap is
environment coverage ..." claimed that only author and assessor loci are
accepted. The replacement paragraph is written to the retired file.

| Rule as restated | Realizing source |
|---|---|
| Declared F_P leaves map to roles: semantic and revision author and assessor, native assessment and work, C1 candidate (`constructor`), C2 command execution (`command_executor`), framed synthesis (`selector`) | `stdoRoleForDeclaredLeaf`, `gtl/stdo_run_environment.ts` |
| The generic role picklist is `author`, `assessor`, `constructor`, `command_executor`, `selector` | `RUN_ENVIRONMENT_SCHEMA`, same file |

Unverified sentences, kept verbatim:

- "C1 and C2 prepare separate native worker requests, and `actor_process.ts`
  reconstructs semantic assembly only."
- "Separate STDO Design and standalone C2 invocations cannot satisfy the
  current evidence bridge."

The two directive sentences that follow are kept verbatim. The heading keeps
its words "Missing Relation".

### Mixed sections left (listed, not rewritten)

| Note (lines) | Section (base lines) | Reason left |
|---|---|---|
| `T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN` (801) | 125-163 status label; 643-712 | Note over 600 lines |
| `T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN` (805) | 693-783 Required Root Proofs; 869-884 Residuals And Stop | Note over 600 lines |
| `M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN` (1380) | 7-42 Status | Note over 600 lines |
| `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN` (810) | 18-43; 780-794 | Note over 600 lines |
| `T287_D1_REQUIREMENT_LIFECYCLE_DESIGN` | 294-314 status label (scopes the predecessor text after it); 525-545 | Note over 600 lines |
| `T287_D2_REQUIREMENT_LIFECYCLE_DESIGN` | 304-317 status label | Note over 600 lines |
| `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN` | 579-610 amendment plus HOW | Note over 600 lines |
| `T287_R10_TYPED_TERMINAL_OUTCOME_DESIGN` (670) | 339-510 §7 candidate amendment; 511-590 2026-09-24 resource | Note over 600 lines |
| `T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN` (1261) | 91-618 retained MGMT03 design | Note over 600 lines; the TD-31 passage is below |
| `T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN` | 627-719, 882-937, 1008-1170, the rest of the historical RC6 pilot | Narrative and uncited by anchor. Held as the body of the cited 619 heading, which says "The text below is retained verbatim". Needs a ruling |
| `T287_TERMINAL_QUIESCENCE_OWNER_NETWORK_ACCEPTED_DESIGN` (106) | whole note | Ruling 4 plus the brief's "note not current as a whole: report, do not move"; below |

`T287_D6_RC6_RELEASE_IDENTITY_DESIGN` is classed current in both places:

- **Lines 5-32:** the HOW for the Product's owner-selected RC1 preview, which
  `PRODUCT.md` lines 1178-1192 still state. Cutting it would remove the only
  design statement a live Product passage relies on.
- **Lines 479-520:** the note's required proof cases.

### TD-31 passages

TD-31 retires the STDO-only run-environment shape. The source check still finds
these names live at head; they are treated as retired. Every passage below has
the reason **retired by TD-31**.

| Note | Lines | Passage | Disposition |
|---|---|---|---|
| `T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN` | 721-806 | Declaration And Capability Contract: `ModulePublication.stdoRunEnvironments` and adoption through `policies["abg.stdo_run_environment"]`, which keeps only its refusal | Cut under ruling 1. No anchor citation; the T-287 line 3926 anchor `#historical-rc6-pilot-design--nonoperative` (line 619) still resolves |
| `T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN` | 808-881 | One Existing-Owner Admission Route: the Product dependency-observation helper (`observeStdoEnvironment`), companion verification and ABG observation joins | Cut under ruling 1 |
| `T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN` | 939-1007 | Evidence, Instructions And Replay: STDO-only evidence and role-evidence projection (`STDO_ENVIRONMENT_EVIDENCE_SCHEMA`, `projectStdoRoleEvidence`) | Cut under ruling 1 |
| `T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN` | 149 | "Confirmed gaps: `isStdoRunEnvironmentDeclaration` permits only RC6/RC7; ..." in the 26-line subsection 131-156 of the retained MGMT03 section (91-618) | **Not repaired; needs a ruling.** See below |

Line 149 needs a ruling for two reasons:

- **The 600-line exemption.** Ruling 6 exempts this 1,261-line note from ruling
  2, but the TD-31 addition invokes rulings 1 and 2 directly.
- **The subsection is a dated historical gap list.** Subsection 131-156 is the
  2026-09-19 MGMT03 gap list and plan ("Three changes form one increment").
  Restating it as present-tense code would change a section the note labels
  "Retained ... Exact Historical Evidence".

The line-177 hit is the substring `StdoRunEnvironmentDeclaration` inside
`constructStdoRunEnvironmentDeclaration`, which TD-31 keeps, so that line needs
no change.

Checked and not affected:

- `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN` lines 564, 678 and 1238 name
  `constructStdoRunEnvironmentDeclaration`, the generic declaration and
  `gtl/stdo_run_environment.ts` profile recognition. All of these remain.
- `T287_DECLARED_TESTING_CAPABILITY_DESIGN` line 84 is about role coverage,
  not a retired name. It was stale at head regardless of TD-31 and is
  rewritten under ruling 2 (above).
- `T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN` lines 23-90 (the current binding
  delta) say that existing declarations and Runs keep their original exact
  basis. After TD-31, a publication carrying the old member is refused at
  structural admission. The sentence concerns history basis, not a retired name,
  so it is unchanged. Flagged for the Executive.

### Per-note section verdicts

"Base" line ranges are those at `39d6cb975`. "Listed" means kept and reported.

| Note | Lines before | Lines after | Top-level sections (base line ranges): verdict |
|---|---|---|---|
| `ABG_EVENT_CALCULUS_IACS` | 83 | 90 | 6-30 Irreducible Carrier Set [live 14; absent RuntimeDerivedFluentRule, RuntimeEventCalculusAxiom, RuntimeEventCalculusEffect]: current; 31-43 Subordinate And Downstream Rows [live 5]: current; 44-48 Effect Boundary [live 0]: current; 49-83 Proof Surface [live 16; absent actor_process_, test_t120_event_calculus_runtime_law]: mixed: one paragraph rewritten (R2) |
| `ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION` | 244 | 237 | 7-12 Claim [live 0]: current; 13-23 Boundary [live 2]: current; 24-32 First Slice [live 0; absent vector_closed]: stale: cut; 33-38 Non-Authority [live 0]: current; 39-51 Operational Fold And Historical Output [live 0]: current; 52-73 Task, Workspace And Run Correspondence [live 0]: current; 74-93 Two Operations, One History [live 1; absent admitConstructionIntent, invokeGraphFunction]: current; 94-152 Complete Phase Projection [live 3]: current; 153-194 Event Effects, Inertia And Validity [live 1]: current; 195-233 Exact Execution Resumption: Separate Unproved... [live 1]: current; 234-244 Totality And Selection [live 0]: current |
| `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN` | 1309 | 1309 | 9-33 1. Selected asset and Product boundary [live 4; absent runPipeline]: current; 34-81 2. Library organization and dependency direction [live 45; absent sourceWitness, targetWitness]: current; 82-119 3. Irreducible carrier set [live 25; absent RuntimeDerivedFluentRule, RuntimeEventCalculusEffect]: current; 120-261 4. Atomic function families [live 149; absent sameCanonical]: current; 262-277 5. Higher-order composition with laws [live 6]: current; 278-297 6. Prime atoms, admitted domains, falsifiers [live 30]: current; 298-522 7. Three views [live 19]: current; 523-533 8. Three accounts per family [live 5]: current; 534-598 9. Recovery from the event log [live 122; absent actor_process_, referencedEvidence]: current; 599-1174 10. Retirement order, decisions and proofs [live 386; absent RuntimeDerivedFluentRule, T287_NATIVE_WORKSPACE_WORK_DESIGN, actor_process_, assertHelperFailureAdmitted, assertHelperFailureExchanges, assertHelperFailureMode, assertLaunchFailureAdmitted, authenticateSemanticJobBasis, authenticateSemanticStageBasis, catalog_addition_proposal, catalog_extension, catalog_reuse, checkInstalledIdentity, expectResult, freshReadbacks, helperFailureMode, installedC2Case, invokeLifecycle, isJsonRecord, launchFailureMode, projectJobRevisionSubject, projectRevisionSelectionSubject, runReadbacks, runtimePrefixFromArtifactTruth, sameCanonical]: current; 1175-1264 11. Source-to-library-to-outcome paths [live 3; absent RefusedBeforeEffect, UnadmittedResidue]: current; 1265-1304 12. Finite coverage and execution obligations [live 0; absent invalid_basis]: current; 1305-1309 13. Conformance claimed and not claimed [live 0]: current |
| `ABI5_PROJECT_REFERENCE_FRAME_BASIS` | 443 | 443 | 3-21 Status And Boundary [live 0; absent stdo_abiogenesis]: current; 22-47 Exact Basis [live 2; absent ABI5_REALIZATION_CONSTITUTION, REFERENCE_FRAME, stdo_abiogenesis]: current; 48-97 Governed Outcome And Workspace [live 1; absent DESIGN_MODULE, SPEC_METHOD]: current; 98-164 Local Extension: Mutable-Worksite Causality [live 3; absent ObservationSnapshot, invalid_basis, out_of_frame]: current; 165-303 Local Extension: End-To-End Interface Integra... [live 3; absent ABI5_PROJECT_REFERENCE_FRAME_BASIS, invalid_basis, out_of_frame]: current; 304-329 Activation And Return [live 0]: current; 330-415 Executive, Writer, And Reviewer Binding [live 2]: current; 416-443 Coverage And Revision [live 1]: current |
| `ABI5_REALIZATION_CONSTITUTION` | 4456 | 4456 | 13-64 1. Authority And Purpose [live 0]: current; 65-95 2. Provenance [live 0; absent T024114Z_ASSESSMENT_t287_wave1_phase0_and_first_holdsat_plan, T032426Z_MANIFESTO_driving_ai_authored_coding_from_programming_basics, specification_methodology]: current; 96-139 3. Core Position [live 0]: current; 140-248 4. Programming Model [live 1]: current; 249-3376 5. Recursive Reference Frames [live 505; absent ABI5_PROJECT_REFERENCE_FRAME_BASIS, CCallReplayProjection, CanonicalSet, CapabilityGrantCoordinate, CatalogRefusal, ContinuationReplayProjection, DESIGN_MODULE_METHOD, DefinitionResourceSuccess, DefinitionRuntime, DirectInvocationCandidate, EvidenceProjection, ExactOwnerResourceEvidence, ExactVersion, F_READ, F_READ_CATALOG, F_READ_PAGE, GapSet, GraphCallReplayProjection, GraphCallResultProjection, GraphCallStatusProjection, ImplementationResolutionSet, InstallProductRefusal, InteractionReplayProjection, InvocationCandidate, InvocationRefusal, LoadedDefinitionBinding, MaterializationPlan, MaterializationRefusal, MaterializedGtlGraph, NodeFilesystemObservation, NonEmptyCanonicalSet, OwnerExpectedRefusalCause, OwnerResourceContractByCoordinate, ProductResponseRefusal, ProductToolchainManifest, PublicExecutionCandidate, PublicExecutionReceipt, PublicFunctionDefinition, PublicOperationCapabilityGrant, PublicTarget, PublicationValidationInput, RefusalOf, ReleaseEvidenceProjection, ReleaseSnapshotPort, ResourceBinding, ResourceGrantUseBasis, RunGapProjection, RunLawfulActionProjection, RunReplayProjection, RunResultProjection, RunStatusProjection, SPEC_METHOD, StartInvocationCandidate, StartRefusal, TraversalUnit, WorkspaceGapProjection, WorkspaceReplayProjection, abg_prefix_append, abg_prefix_read, abg_recursive_child_owner, accepted_rc_mismatch, affected_gate_failed, applyInteractionRespond, applyRunContinue, applyRunInvoke, bindingKind, bytes_mismatch, caller_target_create, caller_target_create_or_idempotent, carrier_read, catalogSource, configurationInput, contentAsset, contentAssets, content_addressed_derivation, content_derivation, contributionManifestSet, descriptorSet, environmentPrefix, executionProgram, final_delta_incomplete, grantUseBasisDigest, idempotent_no_new_commit, installTarget, installedImplementationSet, installedProductSet, installed_rc_authorization_missing, observed_unchanged, odd_glc, openCall, out_of_frame, ownerLeafAtomicityRefs, owner_versioned, product_verify, providerLayer, publishedGtlSet, qualificationBasisDigest, qualificationBasisRef, recursive_abg_prefix_frame, releaseOwnerResult, resourceStateCandidate, runPromise, server_allocated, snapshotPublishedRc, snapshotTappedRelease, static_composition, transitionDisposition, validator_attest, value_only, verifiedArtifactSet, worksite_mutation, worksite_read, workspaceTarget]: current; 3377-3405 6. Entity Lifecycle Register [live 6]: current; 3406-3444 7. Functional Hierarchy And Common Lattice [live 0]: current; 3445-3467 8. Immutable 4.6 And Donor Adoption [live 0]: current; 3468-3521 9. Lawful Technology Stack [live 2]: current; 3522-3960 10. Common Library Catalog [live 28; absent AbortController, FileSystem, FrameEngine, ReferenceFrame, ResultAsync, ScopedRef, TraversalUnit, catalog_addition_proposal, catalog_extension, catalog_reuse, direct_fold, effect_direct_scalar, runFork, runPromise, runSync]: current; 3961-3989 11. Mandatory Coding-Plan Trace [live 0]: current; 3990-4033 12. Design And Review Rules [live 0]: current; 4034-4058 13. AI Worker And Assessor Contract [live 0; absent SPEC_METHOD, STDO_REFERENCE_FRAME_BASELINE, TICKET_METHOD]: current; 4059-4085 14. Delivery Cycle [live 0]: current; 4086-4138 15. Pre-Baseline ABIogenesis Application (His... [live 3; absent PublicExecutionCandidate]: current; 4139-4456 16. Amendment Rule [live 94; absent ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN, ABI5_PROJECT_REFERENCE_FRAME_BASIS, CanonicalResourceStateCandidate, CanonicalSet, CapabilityDefinition, CapabilityGrantCoordinate, IntrinsicResourceTopologyFamily, LoadedDefinitionBinding, NonEmptyCanonicalSet, PublicExecutionCandidate, PublicExecutionReceipt, PublicOperationCapabilityGrant, ResourceGrantUseBasis, T152118Z_STDO_RC6_MIGRATION, T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN, TraversalUnit, catalog_addition_proposal, catalog_extension, catalog_reuse, compareAndSwap, interface_accepted, odd_glc, providerLayer, recursive_abg_prefix_frame, specification_methodology, stdo_abiogenesis, yIRMJu]: current |
| `ABI5_STDO3_COMPUTATIONAL_BINDING` | 490 | 490 | 9-36 1. Purpose and bounded claim [live 0]: current; 37-60 2. The two bindings and three accounts [live 2]: current; 61-79 3. Ontology and carrier projection [live 1]: current; 80-126 4. Closed operation and composition signature [live 40; absent OwnerExpectedRefusal]: current; 127-192 5. Operation results and method predicates [live 181; absent Outcome_B, ValiError, evaluate_action, executingOwnerArtifacts, invalid_basis, out_of_frame]: current; 193-228 6. State, effects and partial completion [live 0; absent entryInput]: current; 229-279 7. Computational realization and whole-path work [live 0]: current; 280-447 8. Whole-family Prime and three-view reconcil... [live 1]: current; 448-471 9. Finite Product coverage and release joins [live 0]: current; 472-490 10. Remaining decisions, proof and completion... [live 0]: current |
| `M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN` | 1458 | 1380 | 7-42 Status [live 0; absent stdo_abiogenesis]: mixed: listed; 43-71 1. Design Claim [live 0]: current; 72-88 2. Constitutional Derivation [live 0]: current; 89-115 3. Boundary And Deferred Scope [live 0]: current; 116-306 4. Candidate Ontology [live 10]: current; 307-430 5. Function Derivation And Traversal Monad [live 2]: current; 431-565 6. Whole-Family Prime Contraction [live 0; absent authoritativeCarriers]: current; 566-582 7. Irreducible Architectural Carrier Set [live 0]: current; 583-634 8. Target Module Architecture [live 0]: current; 635-1183 9. Three-View Behavioral Design [live 0]: current; 1184-1250 10. Event Calculus Relationship [live 16]: current; 1251-1274 11. Native Constructability [live 0]: current; 1275-1293 12. ABI5-ROOT-001 Design Mapping [live 0]: current; 1294-1356 13. Positive And Negative Proof Contract [live 0]: current; 1357-1395 14. Donor Admission And Retirement [live 0]: narrative: cut; 1396-1418 15. Cross-View Axiom Evaluation [live 0]: current; 1419-1439 16. Implementation Handoff [live 0]: narrative: cut; 1440-1458 17. Candidate Decision [live 0]: narrative: cut |
| `M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION` | 103 | 118 | 13-34 Problem [live 0]: mixed: rewritten (R2); 35-49 Irreducible Architectural Carrier Set [live 4; absent RuntimeActivityProbeObservedEvent, RuntimeExternalInterruptionObservedEvent]: mixed: 3 rows rewritten (R2); 50-67 Composition [live 4]: current; 68-88 Decision Rules [live 3; absent inactivity_exceeded, requires_external_interruption_event, startup_silence_exceeded]: mixed: rewritten (R2); 89-95 One Surface Rule [live 0]: current; 96-103 First Slice [live 0]: narrative: cut |
| `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN` | 824 | 810 | 18-43 Authority And Supersession [live 0; absent T182458Z_DECISION_direct_accept_s05_design_and_resume_realization, stdo_abiogenesis]: mixed: listed; 44-70 Requirement Projection [live 1; absent ConsensusProgram, ConsensusPublication, ConstructConsensusInvocation, ConstructRulingVector, DecideRound, MaterializeSubject, ProjectConsensusRead, ReviewerOccurrenceKey, ValidateRoleOccurrence]: current; 71-92 Product Function [live 0]: current; 93-208 Global Decisions And Local Projection [live 4; absent ConstructConsensusInvocation]: current; 209-322 Closed Semantic Algebra [live 11; absent ClosedDone, ConstructRulingVector, DecideRound, EscalateFh, RecurseNextRound, ValidateRoleOccurrence, admittedResponse, cCallAttemptRef, completeFindings]: current; 323-395 Affected Ontology [live 7; absent AssembleFindingsVector, ConsensusPublication, ConsensusRound, ConstructConsensusInvocation, ConstructRoleTask, DecideRound, EscalateFh, FhHold, FinalizeHumanDecision, InitializeRound, ProjectConsensusRead, RecurseNextRound, ResolveCatalogApplicationValue, ReviewFindingsOccurrence, ReviewerOccurrenceKey, ReviewerTaskOccurrence, RoundDecision, SerializedContractAssets, SubmitterTaskOccurrence, ValidateRoleOccurrence]: current; 396-457 Atomic Functions And Prime Contraction [live 3; absent AdmitCatalogApplication, AssembleFindingsVector, CatalogRow, ConstructConsensusInvocation, ConstructReviewerTask, ConstructRoleTask, ConstructSubmitterTask, ContributorProvenance, DecideRound, EvaluateRole, FinalizeHumanDecision, FinalizeSupport, InitializeRound, MaterializeSubject, ProductValidatedValue, ProjectConsensusRead, ProjectResult, ProjectSourceResult, ProjectTicket, ReduceRound, ResolveCatalogApplicationValue, ResolveRoleBasis, ValidateReviewer, ValidateRoleOccurrence, ValidateSubmitter]: current; 458-485 Irreducible Architectural Carrier Set [live 0; absent EnvironmentBasis, GtlDeclarationFamily, InvocationBasis, LeafRealizationBoundary, ReplayProjectionFamily, RuntimeEventFamily, TraversalAggregateFamily]: current; 486-523 Module And Interface Projection [live 0; absent AdmitCatalogApplication, AssembleFindingsVector, ConsensusSemantics, ConstructConsensusInvocation, ConstructRoleTask, DecideRound, EvaluateRole, FinalizeHumanDecision, InitializeRound, LeafExecutionPort, MaterializeSubject, ProjectConsensusRead, ResolveCatalogApplicationValue, ResolveRoleBasis, ValidateRoleOccurrence]: current; 524-760 Three Semantic Views [live 0]: current; 761-779 Cross-View Axiom Evaluation [live 0]: current; 780-794 Operational Lifecycle Confirmation [live 0]: mixed: listed; 795-809 Module-Owned Proof Definition [live 0]: current; 810-824 Design Acceptance Predicate [live 0]: narrative: cut |
| `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN` | 2634 | 2571 | 20-65 1. Decision Boundary [live 0; absent T113200Z_CENSUS_abiogenesis_5_0_s06_exact_56_key_construction]: current; 66-105 2. Constitutional Construction [live 1; absent ReleaseSnapshotPacket]: current; 106-136 3. Requirement Trace And Supersession [live 4; absent M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN, M03_M04_PUBLIC_CATALOG_INVOCATION_AUTHORITY_BEHAVIOR_DESIGN, M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN, M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN, M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN, M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN, narrowCatalogView]: current; 137-189 4. Concrete Port Law [live 2; absent definition_family, outcome_projection, ownerPort, project_read_contracts, schema_projection]: current; 190-1485 5. Explicit Carriers And Durable Ingress [live 59; absent ArtifactAdmissionCandidate, ArtifactTruthTransition, CatalogAdmissionCandidate, CatalogRowCandidate, ExactPrefixCatalogTruthProjection, RootOperationState, VerifiedProductCarrier, admitCheckedCatalogTransaction, candidate_digest_mismatch, candidate_not_constructed, catalog_admission, configureDurableLog, fileSize, projectCurrentPrefix, registry_entry_admitted, retry_exit, rowsByHandle]: current; 1486-1551 6. Catalog Authority [live 3; absent PublicContractCatalog]: current; 1552-2054 7. Event Calculus, Replay, Identity, And Retry [live 57; absent fileSize]: current; 2055-2084 8. One Normalized Program Before Effects [live 1; absent AdmittedNormalizedProgram]: current; 2085-2144 9. Common Refusal And Outcome Projection [live 6; absent missing_prerequisite, projectPublicOutcome]: current; 2145-2263 10. Exact Source And Dependency Construction Map [live 114; absent PROJECT_READ_CONTRACTS, PROJECT_READ_OWNER_PORTS, ReleaseSnapshotPort, RuntimeTruth, definition_family, interaction_response_operation, outcome_projection, ownerPort, project_read_contracts, run_continuation_operation]: current; 2264-2288 11. Atomic Hard Break And Generated Projections [live 1; absent indexedRequest, legacyRequest]: current; 2289-2303 12. Bounded Pre-S06 Recurrence Disposition [live 8]: current; 2304-2570 13. Falsifiers And Gate 2 Sentinel [live 36; absent RetainedRetryInput, RetryAttempt, admitChildClosure, admitClosure, admitFhInteractionResponse, admitFhInteractionResume, admitInteractionClosure, child_closure_admission_refusal, closure_admission_refusal, projectActiveRetryAttempt, refuseClosure, rehydrateFhContinuation, selectRetryInput]: current; 2571-2593 14. Construction Order After Direct Gate 1 Ac... [live 0]: narrative: cut; 2594-2634 15. Gate 1 Review Contract [live 0]: narrative: cut |
| `M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN` | 772 | 772 | 26-55 1. Boundary [live 3]: current; 56-245 2. Complete Function [live 19; absent CloseNativeContractMeaning, EnvironmentBasis]: current; 246-318 3. Ontology [live 7; absent DeclaredDirectDependency, EnvironmentBasis, NativeContractBindingSet, NativeContractCatalogSlice, NativeContractClosureDigest, NativeDeclarationInventoryProposal, NativeTypedContractProposal, ToolchainDeclarationBasis]: current; 319-430 4. Prime, IACS, And Module Design [live 1; absent EnvironmentBasis, NativeContractAnalysis, RejectCycle, ResolveExactMatch, SelectDirectGraph, VerifyCatalog, VerifyManifest, VerifyPayload]: current; 431-631 5. Three Views [live 0]: current; 632-654 6. Cross-View Axioms [live 0]: current; 655-726 7. Constructability, Lifecycle, And Proof [live 0]: current; 727-772 8. Realization Projection And Gate [live 1]: current |
| `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN` | 3508 | 3449 | 17-54 1. Authority And Supersession [live 0; absent EnvironmentBasis, InvocationBasis, M04_PUBLIC_CONTRACT_PUBLICATION_BEHAVIOR_DESIGN, M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN, M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN, ReplayProjectionFamily]: current; 55-114 2. Boundary Decisions [live 6; absent ContractExternalOccurrenceRef, DESIGN_MODULE_METHOD, EnvironmentBasis, InvocationBasis, M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN, NonTerminalOf, ProductVerifyPacket, RefusalOf, ReplayProjectionFamily, ResultOf]: current; 115-273 3. Complete Function [live 0]: current; 274-2300 4. Public Function Definition Algebra [live 181; absent AdmissionRefusalCodeOf, DeriveDeclaredPublicFunctionFamily, ExpectedOwnerContractSet, InteractionRespondPacket, InteractionRespondRequest, LoadDefinitionExecutionBinding, MetadataOf, NonTerminal, NonTerminalOf, OwnerContractBinding, OwnerContractIdentityProjection, OwnerOfRead, PROJECT_READ_CONTRACTS, PROJECT_READ_OWNER_PORTS, ProductContractBindingRefusal, ProductResolvePacket, ProductVerifyPacket, ProductVerifyResult, ProjectReadContracts, ProjectReadResult, ProjectionOf, PublicCatalogBindingRefusalContractCoordinate, PublicCatalogBindingRefusalNativeSource, PublicContractCatalogRow, PublicDefinitionGap, RefusalContractOf, RefusalOf, ReleaseSnapshotManifest, ReleaseSnapshotPacket, ReleaseSnapshotPort, RequestOf, ResultOf, RunContinuePacket, RunInvokePacket, StrictNativeSchema, WitnessAdmitRequest, WorkspaceBindPacket, intrinsicRow, observer_drafts, observer_report, replacementContractIds, tuning_report]: current; 2301-2643 5. Contract-Indexed Native Occurrence Algebra [live 13]: current; 2644-2751 6. Ontology [live 18; absent DefinitionBindingLoadReceipt, EnvironmentBasis, IntrinsicPublicFunctionDefinitionFamily, InvocationBasis, LoadedDefinitionExecutionBinding, NativeContractBindingSet, OwnerContractBinding, PublicContractCatalog, PublicDefinitionLoadRefusal]: current; 2752-2857 7. Prime, IACS, And Module Mapping [live 3; absent ContractDefinition, ContractProjection, NativeContractAnalysis, OperationContractSource, OutcomeProjection]: current; 2858-3177 8. Three Views [live 0]: current; 3178-3216 9. Cross-View Axioms [live 1; absent RefusalOf]: current; 3217-3265 10. Operational Lifecycle And Constructability [live 1]: current; 3266-3448 11. Realization Projection And Module Proof [live 10; absent RefusalOf]: current; 3449-3508 12. Freeze And Review Gate [live 0]: narrative: cut |
| `T287_C1_PRESERVED_RESULT_ARTIFACT_DESIGN` | 205 | 176 | 7-31 Product frame and decision [live 2]: current; 32-64 Actual source and the missing join [live 4]: current; 65-112 One declared recovery path [live 6]: current; 113-149 Source authentication and refusal [live 1]: current; 150-175 Current authority and replay [live 0]: current; 176-205 Exact coding cone and discriminator [live 9]: narrative: cut |
| `T287_C2_FORWARD_REENTRY_DESIGN` | 339 | 339 | 9-50 1. Selected refinement and compatibility [live 0]: current; 51-63 2. Bound evidence and selected vector [live 0]: current; 64-115 3. Finite declared carrier [live 4]: current; 116-151 4. One historical source relation, two differ... [live 0]: current; 152-203 5. New installs, current binding and retained... [live 0]: current; 204-233 6. Task derivation and four native checks [live 0]: current; 234-271 7. Shared P3 undispatched refusal [live 1]: current; 272-308 8. Host readiness and execution boundary [live 0]: current; 309-339 9. Minimum decisive evaluation [live 0]: current |
| `T287_D1_REQUIREMENT_LIFECYCLE_DESIGN` | 943 | 943 | 3-293 Proposed generic-job binding reframe [live 0]: current; 294-314 Preserved fixed-source design and prior bound... [live 0]: mixed (status label scoping later text): listed, note over 600 lines; 315-348 Product frame and selected outcome [live 0; absent stdo_abiogenesis]: current; 349-399 Smallest carrier and ownership decision [live 6]: current; 400-451 Native declaration access, admission and replay [live 4]: current; 452-483 Concrete field gaps and coding territory [live 12]: current; 484-524 Installed discriminator and stopping condition [live 0; absent mapper_requirements]: current; 525-545 Reconciled predecessor designs [live 0]: mixed: listed; 546-934 Native semantic stages and Design bridge [live 37]: current; 935-943 Native workspace source adapter — selected 20... [live 2]: current |
| `T287_D2_REQUIREMENT_LIFECYCLE_DESIGN` | 975 | 975 | 3-195 Native phase-qualified intake and correction ... [live 4]: current; 196-303 Proposed generic-job binding conservation [live 0]: current; 304-317 Preserved predecessor design and bounded obse... [live 1]: mixed (status label scoping later text): listed, note over 600 lines; 318-342 Product Outcome And Scope [live 0]: current; 343-363 Exact Existing Boundary [live 23]: current; 364-386 Select The Owning Re-entry [live 3]: current; 387-462 One Subordinate Successor Relation [live 9]: current; 463-504 Current Postimages, Repair And Fresh Evidence [live 1]: current; 505-535 Traversal And Minimal Realization [live 10; absent admitConstructionIntent, evidence_unavailable, invokeGraphFunction, selection_required]: current; 536-652 Current Role Context And Ordinary Local Conse... [live 5]: current; 653-675 Decisive Construction And Same-Instance Witness [live 0]: current; 676-814 D2 Narrow Repair And Retained Snapshot Depend... [live 0]: current; 815-975 D2 Same-App Binding Transition Evidence [live 3]: current |
| `T287_D4_D5_NATIVE_QUALIFICATION_DESIGN` | 310 | 310 | 8-20 1. Product frame and exact gap [live 0]: current; 21-44 2. Closed domain carriers and declared work [live 22; absent qualification_assess]: current; 45-102 3. One native proof owner [live 46]: current; 103-128 4. F11 finite evaluation and semantic respons... [live 3]: current; 129-230 5. Coverage and sole qualification verdict [live 9]: current; 231-260 6. Concrete source cone and integration depen... [live 23]: current; 261-310 7. Finite discriminators and proof boundary [live 0]: current |
| `T287_D4_SELF_CONFORMANCE_DESIGN` | 252 | 196 | 11-26 Outcome And Boundary [live 1]: current; 27-77 Exact Published Authority [live 3; absent AXIOMATIC_CALCULUS, REFERENCE_FRAME_METHOD, RELEASE_METHOD, SPEC_METHOD, STDO_REFERENCE_FRAME_BASELINE, stdo_abiogenesis]: current; 78-98 Closed Input And Ownership [live 4]: current; 99-117 QUAL-056 material selection [live 0]: current; 118-164 Evaluation Relation [live 0]: current; 165-195 Findings, Result And Qualification Join [live 5]: current; 196-234 First Realization And Proof [live 7]: narrative: cut; 235-252 Remaining Realization And Return [live 0]: narrative: cut |
| `T287_D6_RC6_RELEASE_IDENTITY_DESIGN` | 520 | 520 | 5-32 Owner-selected RC1 development-preview proced... [live 0]: current (HOW of the Product RC1 preview direction, PRODUCT.md:1178); 33-61 Current composition dependency: QUAL-056 [live 2]: current; 62-79 Current First Publication Selection [live 0]: current; 80-106 1. Frame, Authority And Conserved Scope [live 1; absent RELEASE_METHOD]: current; 107-157 2. Assigned Identity And One-Cut Lifecycle [live 2; absent stdo_abiogenesis]: current; 158-231 3. Native Qualification And Human-Acceptance ... [live 4; absent ReleaseQualificationVerdict]: current; 232-372 4. AF-25 Members, Resources And Physical Boun... [live 11]: current; 373-434 5. Results, Partial Effects And Reacquisition [live 6]: current; 435-478 6. Existing Reality And Minimal Later Realiza... [live 16]: current; 479-520 7. Required Discriminators And Stop Boundary [live 1]: current (required proof cases) |
| `T287_DECLARED_TESTING_CAPABILITY_DESIGN` | 234 | 197 | 3-32 Status And Authority [live 1; absent ABG5_TESTING_REUSE_IMPLEMENT_01, testing_reuse_review]: current; 33-62 Reuse Decision [live 3; absent DESIGN_MODULE_METHOD, STDO_REFERENCE_FRAME_BASELINE, TestingTool]: current; 63-88 Existing Chain And The Missing Relation [live 10]: mixed: one paragraph rewritten (R2); 89-148 Minimal Declaration And Assembly Amendment [live 7]: current; 149-192 One End-To-End Walkthrough And Proof Population [live 0]: current; 193-234 Proposed Implementation Territory And Stops [live 10; absent ABI5_PROJECT_REFERENCE_FRAME_BASIS]: narrative: cut |
| `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN` | 1669 | 1669 | 3-86 Recoverable step failure — 2026-11-11 [live 28]: current; 87-168 Declared process prerequisites — 2026-11-11 [live 21]: current; 169-255 Declared framed reviews — 2026-11-11 [live 13; absent governanceTargetSelectable]: current; 256-502 RC7 fixed Testing/UAT direct wrapper route — ... [live 36; absent BoundaryFailure, T287_NATIVE_WORKSPACE_WORK_DESIGN, T287_W2_R3_SINGLE_START_CONSTRUCTION_EXECUTION_DESIGN, assessmentSelection, constructFixedTestingCall, constructFixedUatCall, deriveFixedTestingSource, populateSandbox, programBinding]: current; 503-578 RC5 STDO 3.0.4 successor source and skill sel... [live 16; absent T287_RC5_METHOD_01]: current; 579-610 Later accepted STDO 3 source and role amendme... [live 1; absent _FRAMED_GOVERNANCE, bootstrapPackage, prepareAdditionalProducts]: mixed: listed; 611-644 Common application contract and coverage [live 6]: current; 645-1002 Selected execution relation [live 30; absent T287_PENDING_CONSUMER_CONTINUATION_DESIGN]: current; 1003-1046 Concrete missing relation and smallest implem... [live 8]: current; 1047-1142 DL-D01: observed-input Testing child — select... [live 8; absent T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN, constructFreshNativeLifecyclePublication]: current; 1143-1200 Small route to the independent application test [live 0]: current; 1201-1255 Read-subject identities [live 8; absent T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN, odd_glc]: current; 1256-1669 Optional admitted fulfillment — S6 [live 48; absent _host_recheck_coverage, _recheck, check_preconditions, execute_read]: current |
| `T287_F11_CARRIER_RESOURCE_DESIGN` | 655 | 578 | 8-34 Outcome And Boundary [live 0; absent _F11_CARRIER_ROOT_CAUSE_AND_FIX, _FRAMED_GOVERNANCE]: current; 35-112 1. One Finite Qualification Resource Assertion [live 9]: current; 113-196 2. Normalized Scope Conserves The Complete Do... [live 16]: current; 197-253 3. Compact Semantic Input And Exact Raw Identity [live 3]: current; 254-341 4. Initial Establishment And Rendering [live 4; absent lawfulSuccessorChanges, selectedRelation, sourceChanges]: current; 342-428 5. Completion, Admission And Successful Judgment [live 7]: current; 429-487 6. Admitted Consumption And Cold Proof [live 12]: current; 488-522 7. F11 Input, Scope Output And AF22 [live 5]: current; 523-558 8. Child, Continuation And Supported Read Con... [live 0]: current; 559-577 9. Historical Cut And Successor Discipline [live 0]: current; 578-655 10. Bounded Implementation Territory And Disc... [live 15]: narrative: cut |
| `T287_F11_REUSABLE_QUALIFICATION_LIBRARY_TARGET_DESIGN` | 288 | 288 | 10-19 1. Outcome and governing relations [live 0]: current; 20-41 2. Library boundary and contraction [live 6]: current; 42-63 3. Compact ontology and authority scaffold [live 0]: current; 64-229 4. UML views [live 0]: current; 230-244 5. Information transformation and computation... [live 0]: current; 245-254 6. Computational realization and foundation d... [live 0]: current; 255-272 7. Seven-case proof and worker entry [live 0]: current; 273-288 8. Cross-view design gate and observable comp... [live 0]: current |
| `T287_G2_GTL_SERIALIZATION_PUBLICATION_DESIGN` | 192 | 192 | 6-20 1. Authority And Exact Current Relation [live 9; absent DESIGN_MODULE_METHOD]: current; 21-57 2. Owner And Carrier Scaffold [live 8]: current; 58-162 3. Implementation-Ready Core [live 33]: current; 163-179 4. Required Publication And Proof [live 6]: current; 180-186 5. Explicit Constitutional Adjunct And Remain... [live 0; absent add_missing_declaration, correct_reference, remove_duplicate_declaration]: current; 187-192 6. Smallest Code Territory And Cost [live 5; absent T287_G2_CORE_ADOPTION_CODE_STORAGE_RECORD_01, T287_G2_GTL_CORE_REALIZATION_01]: current |
| `T287_GRAPH_CATALOG_CONTRACTION_ACCEPTED_DESIGN` | 69 | 69 | 3-10 Authority [live 0]: current; 11-44 Construction [live 1]: current; 45-60 Hard Break [live 0; absent registry_entry_admitted]: current; 61-69 Proof [live 0]: current |
| `T287_INTERRUPTED_EVENT_RESOURCE_RECOVERY_DESIGN` | 85 | 85 | 7-12 Product and authority [live 0]: current; 13-35 One lifecycle, four distinct dimensions [live 0]: current; 36-49 Closed installed maintenance entry and select... [live 13; absent resolvedAuthority]: current; 50-69 Physical sequence and supported premise [live 1]: current; 70-85 Refusal, residue and proof [live 3]: current |
| `T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN` | 337 | 309 | 9-34 1. Product frame and scope [live 0]: current; 35-93 2. Exact immutable profiles [live 11]: current; 94-136 3. Canonical stamps and read compatibility [live 1]: current; 137-189 4. One native L-to-P append boundary [live 2]: current; 190-244 5. Resource algebra, scope and replay [live 2]: current; 245-295 6. P3 owner observation and failure admission [live 4]: current; 296-325 7. Readiness and separate activation order [live 0]: narrative: cut; 326-337 8. Conserved boundaries [live 0]: current |
| `T287_NATIVE_LIVENESS_CONSERVATION_DESIGN` | 344 | 336 | 12-34 1. Product frame and bounded outcome [live 0]: current; 35-108 2. Closed declarations and authenticated obse... [live 18]: current; 109-152 3. One replay-derived relation and one elapse... [live 0]: current; 153-214 4. Lease, safety and result precedence [live 1]: current; 215-247 5. Native consumers and Event Calculus [live 6]: current; 248-284 6. Historical conservation and profile boundary [live 1]: current; 285-344 7. Implementation and qualification [live 0]: mixed: rewritten (R2) |
| `T287_NATIVE_WORKSPACE_WORK_DESIGN` | 564 | 564 | 3-37 Native D2 source relation (NATIVE-D2-01) [live 0]: current; 38-79 Declared boundary [live 6]: current; 80-131 Effect and observation [live 4]: current; 132-227 Protected write roots [live 16]: current; 228-304 Context body carriage (P1) [live 21]: current; 305-379 Consumer judgment and qualification [live 4]: current; 380-540 Declared typed assessment [live 12]: current; 541-564 Native semantic source composition — selected... [live 5; absent T287_D1_REQUIREMENT_LIFECYCLE_DESIGN]: current |
| `T287_PACKAGE_OWNED_NATIVE_DECLARATIONS_DESIGN` | 192 | 192 | 3-18 Boundary [live 1; absent EnvironmentBasis, M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN]: current; 19-132 Complete existing-owner function [live 6]: current; 133-154 Product payload membership [live 2; absent DS_Store, packProduct, productPayloadMembers]: current; 155-174 Requirement, function and realization mapping [live 5]: current; 175-192 Native discriminator and proof boundary [live 1]: current |
| `T287_PENDING_CONSUMER_CONTINUATION_DESIGN` | 1042 | 1042 | 18-36 Governing Distinction [live 1]: current; 37-324 Ordinary Fresh Work And Retained Evidence [live 19]: current; 325-412 Exact ConstructionIntent Continuation: Select... [live 10; absent T287_S7_EXACT_INTENT_IMPLEMENT_01]: current; 413-443 Scope, Contraction And Evidence [live 0]: current; 444-495 Selected Action At An Unconsumed Durable Boun... [live 0]: current; 496-881 Registered-Selection Pending Execution Contin... [live 81; absent T287_NATIVE_WORKSPACE_WORK_DESIGN, continuedHolders, pendingPreparations, projectContinuedContextHoldersAtPrefix, rootPublicationKind]: current; 882-1042 Selected Installed Proof Composition [live 3]: current |
| `T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION` | 220 | 220 | 56-67 Owner-derived native call typing (HC1) [live 8]: current; 68-75 Canonical operation population (HC2) [live 8]: current; 76-79 Finite completion evidence [live 0]: current; 80-220 Admission boundary and established internal v... [live 7; absent publicCaller]: current |
| `T287_R10_TYPED_TERMINAL_OUTCOME_DESIGN` | 670 | 670 | 7-46 1. Product frame and scope [live 0; absent STDO_REFERENCE_FRAME_BASELINE]: current; 47-77 2. Observed boundary [live 6]: current; 78-190 3. One contracted owner relation [live 2]: current; 191-246 4. Existing output members [live 7; absent F_READ]: current; 247-270 5. Definition and publication conservation [live 1; absent PublicFunctionDefinition, abg_cli_transport_result]: current; 271-338 6. Bounded realization and proof [live 12]: current; 339-510 7. Candidate amendment: historical child decl... [live 13; absent re_entry_requested]: mixed: listed; 511-590 2026-09-24 selected Run historical-source res... [live 12]: mixed: listed; 591-670 2026-11-11 readable stops [live 39]: current |
| `T287_REGISTERED_GRAPH_SELECTION_DESIGN` | 219 | 219 | 6-29 Basis and correction [live 2; absent ABI5_PROJECT_REFERENCE_FRAME_BASIS, _FRAMED_GOVERNANCE, stdo_abiogenesis, t287_registered_selection_design_01]: current; 30-45 Existing mechanics and actual gap [live 7]: current; 46-84 One declared application and direct execution... [live 2]: current; 85-159 Compact result and shared target/input resolu... [live 2]: current; 160-175 Purpose and actual F_P context [live 2]: current; 176-190 Exact change owners [live 9]: current; 191-219 Installed discriminator [live 2; absent candidateBasisSource]: current |
| `T287_REGISTERED_GRAPH_SELECTION_NATIVE_DESIGN` | 306 | 306 | 20-48 Selected realization [live 6]: current; 49-113 Minimum declaration and carrier [live 5]: current; 114-209 Assembly and admission [live 14]: current; 210-230 Owning realization boundaries [live 10]: current; 231-276 Small real-provider discriminator [live 1]: current; 277-306 Canonical installed test support [live 7]: current |
| `T287_S1_ROOT_ARTIFACT_CARRIER_DESIGN` | 59 | 59 | 3-18 Current Boundary [live 0]: current; 19-43 Owner And Evidence Relations [live 0]: current; 44-59 Proof Scope [live 0]: current |
| `T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN` | 1261 | 1031 | 3-22 Later accepted STDO 3 source and role amendme... [live 1; absent bootstrapPackage, prepareAdditionalProducts]: current; 23-90 Current STDO 3 Binding Delta [live 0]: current; 91-618 Retained MGMT03 Design And Exact Historical E... [live 88; absent ABI5_PROJECT_REFERENCE_FRAME_BASIS, DESIGN_MODULE_METHOD, SPEC_METHOD, STDO_REFERENCE_FRAME_BASELINE, authorityMatches, n5DtgZ, odd_glc]: mixed: listed, note over 600 lines; TD-31 clause at 149 needs a ruling; 619-626 Historical RC6 Pilot Design — Nonoperative [live 0]: narrative, cited by T-287:3926: kept; 627-658 Status And Exact Boundary [live 2; absent _STAGE_A_R1]: narrative: held as body of the cited 619 heading; 659-684 Source And Requirement Trace [live 0; absent ABI5_PROJECT_REFERENCE_FRAME_BASIS, ABI5_REALIZATION_CONSTITUTION, STDO_REFERENCE_FRAME_BASELINE, T287_D1_REQUIREMENT_LIFECYCLE_DESIGN, T287_D2_REQUIREMENT_LIFECYCLE_DESIGN, stdo_abiogenesis]: narrative: held as body of the cited 619 heading; 685-720 Existing Owners And The Actual Gap [live 20]: narrative: held as body of the cited 619 heading; 721-807 Declaration And Capability Contract [live 10]: stale (retired by TD-31): cut; 808-882 One Existing-Owner Admission Route [live 2]: stale (retired by TD-31): cut; 883-938 Exact Event-Contract Integration And Historic... [live 8; absent T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN]: narrative: held as body of the cited 619 heading; 939-1008 Evidence, Instructions And Replay [live 11]: stale (retired by TD-31): cut; 1009-1097 Small Ordinary Program Witness [live 5; absent semantic_composition, source_handoff]: narrative: held as body of the cited 619 heading; 1098-1148 Proposed Stage B Territory And Effort [live 16]: narrative: held as body of the cited 619 heading; 1149-1170 Residuals And Freeze Consumer [live 0]: narrative: held as body of the cited 619 heading; 1171-1261 Governed Context Endpoint, Fixed Client, Adap... [live 22; absent HostLookupResolution, _recheck, host_adapter]: current |
| `T287_TERMINAL_QUIESCENCE_OWNER_NETWORK_ACCEPTED_DESIGN` | 106 | 106 | 3-46 Current accepted lifecycle-law conjunction — ... [live 0; absent cleanupPendingRows, decideActorProcessLifecycle]: mixed: unchanged under ruling 4; 47-71 Earlier accepted Executive amendment — 2026-1... [live 0]: narrative: held, note not current as a whole; 72-95 Exact design subject [live 0; absent T072110Z_STRATEGY_t287_terminal_quiescence_owner_network_replacement, T090750Z_STRATEGY_t287_terminal_quiescence_bounded_local_repair, T105623Z_STRATEGY_t287_link_observation_and_cleanup_live_repair, T111837Z_STRATEGY_t287_preterminal_process_confirmation_overlay]: narrative: held, note not current as a whole; 96-106 Implementation boundary [live 0]: narrative: held, note not current as a whole |
| `T287_W2_R2_CONSUMER_DECLARATION_ADMISSION_DESIGN` | 177 | 152 | 5-12 Basis and boundary [live 0]: current; 13-21 Reached gaps and selected delta [live 3]: current; 22-106 Non-circular authority construction [live 20]: current; 107-145 Pure declaration application and value valida... [live 27; absent DESIGN_MODULE_METHOD]: current; 146-151 Refusal ownership and effect boundary [live 9]: current; 152-174 Implementation cut and source-blind proof [live 11; absent _definition_bindings]: narrative: cut; 175-177 Disposition [live 0]: narrative: cut |
| `T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN` | 808 | 801 | 5-124 Proposed assessed-file parent prerequisite [live 0]: current; 125-163 Preserved accepted file-replacement and B04 d... [live 2; absent T287_W2_ODD_GLC_TYPED_WORKSPACE_ADMISSION_DESIGN]: mixed (status label scoping later text): listed, note over 600 lines; 164-201 Decision [live 0]: current; 202-287 Worksite-Root Authority Relation [live 12; absent R_protected]: current; 288-308 Authority [live 1; absent ABI5_PROJECT_REFERENCE_FRAME_BASIS]: current; 309-379 Exact Carriers [live 19]: current; 380-423 Owner Effect [live 2; absent R_protected]: current; 424-603 B04 Post-Publication Failure Relation [live 33]: current; 604-642 ABG Admission And Replay [live 5]: current; 643-712 Future Realization Boundary (Unselected) [live 21; absent inputFactory]: mixed: listed; 713-729 Retained Worksite-Root Proof Matrix (Outside ... [live 3]: current; 730-765 Acceptance [live 1]: current; 766-800 Falsifiers [live 5]: current; 801-808 Stop And Return [live 0]: narrative: cut |
| `T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN` | 884 | 805 | 23-74 Decision [live 1]: current; 75-150 Worksite-Root Propagation And Admission [live 9; absent R_protected]: current; 151-180 Product Frame And Authority [live 1; absent ABI5_PROJECT_REFERENCE_FRAME_BASIS]: current; 181-199 Future Predecessor Gate [live 2]: narrative: cut; 200-330 Closed Product And GTL Carriers [live 26]: current; 331-410 Prompt And Candidate Boundary [live 10; absent encodeCandidateFile]: current; 411-605 GTL Publication And Topology [live 31]: current; 606-652 Deterministic Join And Ordered Effects [live 5]: current; 653-692 Future Realization Surface (Unselected) [live 10]: narrative: cut; 693-783 Required Root Proofs And Future Evidence (Uns... [live 11]: mixed: listed; 784-807 Downstream Reacquisition Gate (Prospective An... [live 4]: narrative: cut; 808-868 Falsifiers [live 6]: current; 869-884 Residuals And Stop [live 0]: mixed: listed |
| `T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN` | 1134 | 1076 | 28-74 Current common-lifetime failure-handoff amend... [live 9; absent inspectWorksiteCommandExecutionProcessFailure]: current; 75-93 1. Claim [live 3]: current; 94-110 2. Re-entry And Fixed Truth [live 0]: current; 111-444 3. Causal Boundary [live 33; absent ObservationSnapshot]: current; 445-476 4. Task Contract [live 6]: current; 477-641 5. Snapshot And Effect Boundary [live 29; absent attemptRefDigest]: current; 642-834 6. Exact Worker And Helper Join [live 18]: current; 835-868 7. Mechanical Predicate Surface [live 11]: current; 869-888 8. Publication And Lifecycle [live 0; absent helper_product_mismatch, helper_protected_mismatch, helper_territory_mismatch]: current; 889-978 9. Root Proof Matrix And Evidence Gate [live 12]: current; 979-1038 10. Retained Failure And Superseded Five-Path... [live 9; absent T102307822Z_pid92983, odd_glc, test_runs]: narrative: cut; 1039-1062 11. Nonclaims [live 2]: current; 1063-1134 12. D2-Only Mixed-Source Snapshot Arm [live 0]: current |
| `T287_W2_R3_C3_BRANCH_CONSTRUCTION_AGGREGATE_DESIGN` | 911 | 860 | 57-98 1. Decision [live 5]: current; 99-135 2. Re-entry And Fixed Truth [live 0]: current; 136-277 3. Public Aggregate Task [live 21]: current; 278-326 4. Admission And Readiness Law [live 3]: current; 327-511 5. GTL Publication And Direct HoG Traversal [live 14]: current; 512-553 6. Branch Execution And Partial Failure [live 4; absent serially_unstarted]: current; 554-603 7. Deterministic Fan-In And Flat Result [live 5]: current; 604-643 8. C2 Source Join [live 4]: current; 644-676 9. Replay And Closure [live 1]: current; 677-711 10. Prospective Realization Boundary [live 4]: narrative: cut; 712-861 11. Exact Proof Fixtures [live 1]: current; 862-894 12. Falsifiers And Nonclaims [live 1]: current; 895-911 13. Stop And Review Return [live 0]: narrative: cut |
| `T287_W2_R3_SINGLE_START_CONSTRUCTION_EXECUTION_DESIGN` | 424 | 407 | 8-54 Basis and outcome [live 0]: current; 55-177 1. Typed retention at the graph edge [live 26; absent ConstructionResult]: current; 178-231 2. Actual C2 task construction and start auth... [live 5]: current; 232-264 3. Independently exact installed owners [live 5]: current; 265-311 4. Completed source child and leaf admission [live 3]: current; 312-340 5. Failure and decisive proof [live 0]: current; 341-359 Owning amendments and small realization frontier [live 15]: narrative: cut; 360-386 D2-Only Preparation Tuple [live 0]: current; 387-424 Generic fixed pair for bounded consumer conti... [live 2]: current |
| `T289_IMMUTABLE_INSTALL_EVENT_BODIES_DESIGN` | 270 | 270 | 3-10 Authority and outcome [live 1]: current; 11-48 Representation and owners [live 6]: current; 49-67 Ordering and evidence [live 1]: current; 68-114 Native basis-input and CCall-result physical ... [live 17]: current; 115-171 Current RC2 hot-memory and canonical-hash inc... [live 2]: current; 172-270 Retained-route source carriage (T-287 / RC5 F4) [live 20]: current |

## Ruling 7: constitution section map

`ABI5_REALIZATION_CONSTITUTION` (4,456 lines) is not edited.

Citation search: kept notes, `specification/`, code, scripts and test_env, and
active tickets. A citation is an anchor link, or a "§N" or "Section N" on a line
that, together with the line before it, names the constitution. "Internal"
lists the constitution's own lines that reference the section. Class key:
**O** operative rule; **A** amendment or correction record; **H** migration or
historical narrative, including superseded and evidence-only text; **M** mixed.

| Section | Lines | Count | Class | Records (non-operative) | Cited by |
|---|---|---|---|---|---|
| Header | 1-12 | 12 | O | | |
| 1 Authority And Purpose | 13-64 | 52 | O | | none |
| 2 Provenance | 65-95 | 31 | M | Sources ratified (STDO surfaces, T-287 refinement, 4.6 donor, Phase 0, manifesto) | `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN`:697 |
| 3 Core Position | 96-139 | 44 | O | | COMMON:697 |
| 4 Programming Model | 140-214 | 75 | O | | none |
| 4.1 Distribution And Risk Proportionality | 215-248 | 34 | O | | COMMON:554; `T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION`:92; T-287 ticket:1897 |
| 5 Recursive Reference Frames (body) | 249-276 | 28 | O | | COMMON:80, 697 |
| 5.1 Frame-Shift Law | 277-300 | 24 | O | | none |
| 5.2 Definitions | 301-317 | 17 | O | | none |
| 5.3 Six-Frame Atlas | 318-349 | 32 | O | | `ABI5_PROJECT_REFERENCE_FRAME_BASIS`:34, 172, 430; ticket:4468 |
| 5.3.1 Local realization frames | 350-372 | 23 | O | | ticket:4842 |
| 5.3.2 Compounded-frame scenario proof law | 373-420 | 48 | O | | PROJECT_REFERENCE_FRAME_BASIS:173 |
| 5.3.3 Functional delivery status axiom | 421-442 | 22 | O | | none |
| 5.4 Abstract Relation | 443-487 | 45 | O | | none |
| 5.5 Axioms | 488-512 | 25 | O | | COMMON:65, 102, 193 |
| 5.6 Operator-Factorization Law (body) | 513-562 | 50 | O | | none |
| 5.6.1 Closed operator algebra | 563-628 | 66 | O | | COMMON:31; `ABI5_STDO3_COMPUTATIONAL_BINDING`:53, 84 |
| 5.6.1A Operative computational realization | 629-706 | 78 | O | | STDO3_BINDING:123 |
| 5.6.2 Installed definition-binding ABI | 707-1018 | 312 | H | Superseded by 5.6.2C and 16.7: `PublicExecutionCandidate`, topology arms, provider stages | external none; internal 681, 1852, 3026, 4132, 4237, 4292 |
| 5.6.2A Resource-transition algebra | 1019-1612 | 594 | H | Superseded resource forms and provider relations, kept as owner evidence | external none; internal 1852, 2248, 4132, 4292 |
| 5.6.2B Topology and installed-binding identity | 1613-1849 | 237 | H | Superseded `T0-T9` forms and family/arm/load identities, kept as a historical proof partition | external none; internal 712, 1852, 4132, 4292 |
| 5.6.2C Static definition-binding algebra | 1850-2429 | 580 | O | | COMMON:31, 65; STDO3_BINDING:459 |
| 5.6.3 Orthogonal factorization evidence | 2430-3076 | 647 | H | Non-executable classification and proof evidence for 5.6.2C | external none; internal 1443, 1469, 3148, 4188, 4258, 4417, 4437 and others |
| 5.6.4 56-key functional factorization map | 3077-3145 | 69 | H | Classification evidence: 56-key map | external none; internal 2432, 2498, 2980, 3025, 3148 |
| 5.6.5 W2-05 binding-gap and release-contract law | 3146-3242 | 97 | O | Labelled operative; active W2-05 construction and hold register | none |
| 5.6.5A W2-05 review-compression law | 3243-3322 | 80 | O | Labelled operative | none |
| 5.7 Temporal-Algebra Specialization | 3323-3343 | 21 | O | | none |
| 5.7.1 Current-input transfer and historical recovery | 3344-3376 | 33 | O | | none |
| 6 Entity Lifecycle Register; 6.1 Run; 6.2 | 3377-3405 | 29 | O | | COMMON:697; ticket:6152 |
| 7 Functional Hierarchy And Common Lattice | 3406-3444 | 39 | O | | `T287_F11_REUSABLE_QUALIFICATION_LIBRARY_TARGET_DESIGN`:15 |
| 8 Immutable 4.6 And Donor Adoption | 3445-3467 | 23 | M | Adoption rule framed over the immutable 4.6 donor baseline (migration) | external none; internal 3641 |
| 9 Lawful Technology Stack | 3468-3521 | 54 | O | | COMMON:1307 |
| 10 Common Library Catalog (body) | 3522-3540 | 19 | O | | COMMON:63, 193, 681 |
| 10.1 Foundation Admission And Cost Law (body) | 3541-3593 | 53 | O | | COMMON:32, 63, 672 |
| 10.1.1 Effect 3.22.1 decision ledger | 3594-3650 | 57 | A | Effect adoption decision ledger | COMMON:80; internal 4292, 4433 |
| 10.1.2 Effect conservation and replacement law | 3651-3682 | 32 | O | | none |
| 10.1.3 18/56 resource-capability foundation ledger | 3683-3735 | 53 | A | FS-18/FS-19 comparison ledger | external none; internal 1473, 3495, 4221, 4279, 4292 |
| 10.1.4 HoG target and preserved atoms | 3736-3765 | 30 | M | Effect-native HoG target plus atoms preserved | none |
| 10.2 New algorithm rule | 3766-3798 | 33 | O | | COMMON:32, 681 |
| 10.3 Semantic And Computational Disposition | 3799-3820 | 22 | O | | none |
| 10.4 Existing And Donor Substrate | 3821-3832 | 12 | M | Dispositions of current and donor surfaces | none |
| 10.5 Owner And Use-Case Matrix | 3833-3858 | 26 | O | | none |
| 10.6 TV5 Exact Binding | 3859-3884 | 26 | O | First implementation instance (TV5) | COMMON:32 |
| 10.7 Anti-Framework Falsifiers | 3885-3918 | 34 | O | | COMMON:63, 672, 677 |
| 10.8 Accepted Implementation Gate | 3919-3960 | 42 | A | TV5 coding-plan gate passed and proof obligations remaining | external none; internal 3815 |
| 11 Mandatory Coding-Plan Trace | 3961-3989 | 29 | O | | COMMON:7 |
| 12 Design And Review Rules; 12.1-12.4 | 3990-4033 | 44 | O | | STDO3_BINDING:460 |
| 13 AI Worker And Assessor Contract | 4034-4058 | 25 | O | | none |
| 14 Delivery Cycle | 4059-4085 | 27 | O | | none |
| 15 Pre-Baseline Application (Historical Selection) | 4086-4138 | 53 | H | Earlier W2-05 selection and evidence in original coordinates | external none; internal 4311 |
| 16 Amendment Rule (body) | 4139-4159 | 21 | O | | COMMON:699 |
| 16.1 Frame-Shift Amendment Record | 4160-4173 | 14 | A | Adds the topology-constrained frame-shift law | none; internal 4153, 4401 |
| 16.2 C1F Exact-Public-Factorization | 4174-4198 | 25 | A | Historical; superseded by 16.7 | none; internal 4213, 4237, 4437 |
| 16.3 Recursive Foundation And Effect-Composition | 4199-4224 | 26 | A | Historical; superseded by 16.7 and 16.15 | none; internal 4191, 4237 |
| 16.4 C1F Resource-State Binding Correction | 4225-4247 | 23 | A | Historical; superseded by 16.7 and 16.15 | none; internal 4252, 4255, 4292 |
| 16.5 C1F Leaf-Local Resource Binding Repair | 4248-4264 | 17 | A | Six constructability defects of 16.4 | none; internal 4235, 4239 |
| 16.6 C1F Execution-Carrier And Topology-Arm Repair | 4265-4284 | 20 | A | Superseded; rejection history | none; internal 2248, 4132, 4254, 4289, 4292 |
| 16.7 Static Definition-Binding Compression | 4285-4303 | 19 | A | Supersession record that makes 5.6.2C operative | COMMON:30; internal 709 and 12 others |
| 16.8 W2-05 Review-Compression | 4304-4318 | 15 | A | Source of 5.6.5A | none |
| 16.9 Program/GraphFunction Membership Coordinate | 4319-4334 | 16 | A | Membership coordinate amendment | none |
| 16.10 ST-2 Capability Authority And Exact-Prefix Join | 4335-4349 | 15 | A | ST-2 capability and environment join | none; internal 2119, 4315, 4356, 4363 |
| 16.11 ST-2A-G Capability-Graph Cardinality | 4350-4366 | 17 | A | Empty capability roster lawful | `test_env/tests/t287-st2a-g-capability-definition-graph.test.mjs`:257; internal 3618, 4347 |
| 16.12 STDO 2.5 And Mutable-Worksite Reconciliation | 4367-4382 | 16 | A | Historical STDO 2.5 selection | none; internal 4153, 4401 |
| 16.13 STDO RC6 Consumer-Basis Reconciliation | 4383-4409 | 27 | A | RC6 method-basis migration, named by the header | none external; internal 10, 69, 4157 |
| 16.14 Common Library Operator-Family | 4410-4422 | 13 | A | One module family per operator family | COMMON:672, 677 |
| 16.15 Application Ownership And Foundation Correction | 4423-4456 | 34 | A | Owner correction: foundation basis | none; internal 3515, 4202, 4228 |

Non-operative lines (classes A, H and M): 2,457 of 4,456. Superseded or evidence-only text
(5.6.2, 5.6.2A, 5.6.2B, 5.6.3, 5.6.4 and 15) is 1,912 lines, and none of it is
cited outside the constitution.

## Link check

Run with `linkcheck.py --all` before and after the edits.

| Scope | Before (links / dangling) | After |
|---|---|---|
| design-live rel | 475 / 42 | 491 / 39 |
| design-live repo | 37 / 1 | 37 / 1 |
| design-hist rel | 871 / 181 | 876 / 186 |
| design-hist bare | 110 / 103 | 133 / 103 |
| spec, tickets, other scopes | unchanged | unchanged |

- **Live notes:** no new dangling link. Three pre-existing ones left with the
  cut `T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY` §7 and the native-liveness §7
  plan text.
- **History:** the five new dangling links all sit inside verbatim retired
  text:
  - the typed-recurse old header link `./history/TYPESCRIPT_REALIZATION_GUARDRAILS.md`;
  - the D4 link `T287_D6_RC6_RELEASE_IDENTITY_DESIGN.md`, which is now one
    directory deeper;
  - the two NATIVE_EVENT source-test-plan links and the one native-liveness
    source-test-plan link, all three already dangling in the live note.

  Verbatim moves cannot preserve them.

## Realization check

`git diff --stat 39d6cb975 -- T/code T/contracts T/scripts T/test_env T/package.json T/product-toolchain-manifest.json specification`
is empty. `ABI5_REALIZATION_CONSTITUTION.md` is unchanged.

## Notes whose bytes changed

All 23 kept files below are pinned in `T/test_env/qualification/inventory.json`
and the recipe. Neither is edited.

- `ABG_EVENT_CALCULUS_IACS.md`
- `ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION.md`
- `M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md`
- `M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION.md`
- `M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN.md`
- `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md`
- `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md`
- `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md`
- `README.md`
- `T287_C1_PRESERVED_RESULT_ARTIFACT_DESIGN.md`
- `T287_D4_SELF_CONFORMANCE_DESIGN.md`
- `T287_DECLARED_TESTING_CAPABILITY_DESIGN.md`
- `T287_F11_CARRIER_RESOURCE_DESIGN.md`
- `T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN.md`
- `T287_NATIVE_LIVENESS_CONSERVATION_DESIGN.md`
- `T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION.md`
- `T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN.md`
- `T287_W2_R2_CONSUMER_DECLARATION_ADMISSION_DESIGN.md`
- `T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md`
- `T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN.md`
- `T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md`
- `T287_W2_R3_C3_BRANCH_CONSTRUCTION_AGGREGATE_DESIGN.md`
- `T287_W2_R3_SINGLE_START_CONSTRUCTION_EXECUTION_DESIGN.md`

There are 25 retired-section files in `T/design/history/`:

- 18 are new from cuts. The `M03_SYSTEM_PROBE` and
  `T287_DECLARED_TESTING_CAPABILITY` files also hold their notes' ruling 2
  replaced text.
- 2 are new for the ruling 2 rewrites of `ABG_EVENT_CALCULUS_IACS` and
  `T287_NATIVE_LIVENESS_CONSERVATION`.
- 1 existed from TD-64 and had the typed-recurse cut appended.
- 4 existed from TD-64 and are unchanged.

## Items needing a ruling

1. **`T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN`.**
   - The three TD-31 sections are cut.
   - The rest of the historical RC6 pilot (627-719, 882-937, 1008-1170) is
     narrative and uncited by anchor. It is held because the cited 619 heading
     says that text follows.
   - The retained MGMT03 section (91-618), including the line-149 TD-31 clause,
     is mixed in a note over 600 lines.

   Options:
   - retire the whole pilot body and MGMT03 section in one move, with T-287
     line 3926 re-pointed (outside `T/design`); or
   - accept them as listed.
2. **`T287_TERMINAL_QUIESCENCE_OWNER_NETWORK_ACCEPTED_DESIGN`.**
   - The note's rule names a function head does not have.
   - Its token frontier contradicts `rules.ts`.
   - Its remaining sections are amendment, ratification and authorization
     records.

   The note as a whole may not be current. The four ratified Codex posts it
   cites were not read. By the brief, this is reported and not moved.
3. **`ABG_EVENT_CALCULUS_IACS` proof claims.** Initiation, inertia, clipping
   and undeclared-kind rejection have no located test. Should they stay
   retired, or come back with a named test?
4. **`T287_G2` §5.** The history note is the only statement of the
   reason-to-repair map. It stays cited.

## Deviations and residuals

- Ruling 5: the re-pointed link text changed from "F_P admission design" to
  "F_P admission owner".
- Retired-file headers for ruling 6 cuts name `39d6cb975`; the cut notes are
  byte-equal to it. Ruling 2 headers are covered two items below.
- Cut ranges include the blank line before each heading so that no blank line
  doubles. The retired blocks therefore begin with that blank line.
- The ruling 2 retired-file headers name the commit before each rewrite:
  `a2769c3f7` for system probe and IACS, and `f7c1961ff` for declared-testing.
  Native liveness and the STDO pilot name `39d6cb975`, where their notes were
  byte-equal to base.
- Ruling 8 is read at anchor level: a section counts as cited when its own
  anchor or number is cited. The STDO pilot body is the one exception, held
  under item 1.
- `M03_SYSTEM_PROBE` lines 3-4 still say "Active design surface for T-129 first
  slice". This header line is outside any section and is not rewritten.
- Section numbering now has gaps where numbered sections were cut, for example
  M03_DIRECT §14, §16 and §17, C3 §10 and §13, F11 §10, NATIVE_EVENT §7 and
  C2 §10. The pointer line names the retired file.
- Sections judged current were read from their opening lines plus the
  token check, not line by line.
