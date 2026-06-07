---
id: T-149
title: Simplify ABG iteration state into one recursive outcome algebra
type: bug
ticket_category: implementation_migration
status: completed
proof_status: passed
goal: replace scattered assurance, payload-ledger, re-entry, continuation, and terminal-fallback transition inference with one ABG-owned replay-derived iteration outcome algebra over primitive rows, lifecycle filtering, and recursive redispatch targets
change_class: requirement_reprice
re_entry_point: requirements
created_at: 2026-06-05
updated_at: 2026-06-07
completed_at: 2026-06-07
owning_repo: abiogenesis
governance_scope: STDO Method
priority: critical
build_tenant: typescript
source_documents:
  - /Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md
  - specification/PRODUCT.md
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-RUN.md
  - specification/requirements/abg/REQ-R-ABG3-ITERATION.md
related_tickets:
  - T-092
  - T-095
  - T-103
  - T-106
  - T-129
  - T-147
  - T-148
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-188-force-fp-depth-through-iteration-and-prompt-control.md
affected_boundary:
  requirements:
    - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
    - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
    - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
    - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
    - specification/requirements/abg/REQ-R-ABG3-RUN.md
    - specification/requirements/abg/REQ-R-ABG3-ITERATION.md
  design:
    - build_tenants/abiogenesis/typescript/design/M03_ITERATION_STATE_ACTION_ALGEBRA_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M03_ITERATION_STATE_ACTION_ALGEBRA_FIRST_SLICE_IACS.md
    - build_tenants/abiogenesis/typescript/design/M03_ITERATION_STATE_ACTION_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/iteration_state_action.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/graph_span_reentry.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/continuation_transition.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/traversal_non_progress.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/assurance.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/payload_ledger.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/retry_frontier.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/retry_repair.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/runtime_liveness.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/index.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/traversal_structure_probe.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/assurance_gate.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/attached_fp_worker.ts
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t149_iteration_state_action_algebra.test.mjs
target_truth: ABG owns one replay-derived total transition function for an active iteration boundary. That projection is the single STDO truth surface for the boundary's next transition. Evaluator outputs contribute semantic satisfaction rows only. Runtime, transport, liveness, payload, authority, assurance, and re-entry projections contribute typed fact rows. Attempt lineage classifies evidence as active, preserved/rebased, or superseded before any satisfaction fold; orphan is a failed current-authority binding guard, not a lifecycle category. The outcome algebra reduces to three primitive constructors: terminate, redispatch, or suspend. Close, block, defer, retry, evaluator retry, graph re-entry, and reprice are dispositions, redispatch targets, lawful re-entry refs, or reasons over those constructors, not separate truth surfaces.
superseded_truth: ABG derives next transition through scattered closure folds, payload-ledger scope filters, continuation fallback, terminal retry refs, pressure strings, and implicit current-scope inference. Superseded prior-attempt evidence can be indistinguishable from orphan evidence and can block a fulfilled current attempt.
closure_law: This ticket closes only when requirements explicitly define the recursive iteration outcome algebra, design declares the carrier/state machine/IACS, TypeScript routes assurance/payload/continuation decisions through the single total fold, attempt lineage prevents superseded evidence from poisoning current closure, and focused tests prove re-entered fulfilled edges converge while true orphan evidence remains fail-closed and observable.
non_closure_conditions:
  - a second local retry/block/close decision remains outside the state machine
  - the total fold has no explicit precedence order for mixed rows
  - the realized outcome model grows one constructor or enum value per
    circumstance
    instead of using primitive terminate, redispatch, and suspend constructors
  - any read model, report, summary, terminal fallback, pressure string, plugin
    outcome, or runner branch becomes a rival outcome truth surface
  - evidence used by closure lacks active attempt, preserved/rebased, or
    superseded lifecycle classification before the satisfaction fold
  - same-vector re-entry can supersede all prior evidence without preserving
    still-current satisfied evidence
  - orphan evidence is represented as a satisfaction or lifecycle category
    instead of a failed current-authority binding guard
  - terminal retry fallback can outrank typed row/outcome state
  - evaluator retry is implemented outside the state machine or as product
    worker retry
  - orphan/superseded evidence rows are computed transiently with no persisted or public diagnostic projection
  - any compatibility layer remains inside the iteration-boundary transition
    path after in-scope callers can be migrated
  - ABG imports odd_sdlc, data_mapper, language stack, or product-specific vocabulary
  - tests only call helper functions and do not prove the runner path
---

# T-149: Simplify ABG Iteration State Into One Recursive Outcome Algebra

## Intake Triage

The current bug pattern is not one more closure edge case. It is a state-model
gap.

Existing ABG requirements already say:

- post-dispatch runtime truth is engine-owned
- replay projection is authoritative
- assurance is computed from current authority/input and admitted event truth
- evidence used by assurance must preserve enough binding metadata to
  distinguish fulfilled, partial, missing, stale, orphan, contradictory,
  deferred, and invalid-ledger states
- same-edge retry or re-entry shall mint fresh actor invocation identity and
  carry prior evidence only through replay-derived context
- continuation transition shall be one replay-derived projection, with typed
  facts outranking terminal fallback

The missing requirement is the explicit iteration outcome algebra that
ties these clauses together. Therefore this ticket enters at
`requirement_reprice`, then requires design and TypeScript realization.

This is the STDO one-truth-surface rule applied to ABG iteration. The
authoritative truth surface is the replay-derived iteration outcome projection.
All other surfaces in this boundary are either source facts, adapters, or read
models. They may explain, diagnose, or project the state; they must not own a
second next-transition decision.

This is new code-path consolidation, not data migration. Existing runtime event
truth remains replay source. The change is to stop multiple deterministic code
paths from re-deciding next transition over the same replay truth.

The owning constitutional home is a new requirement family:

```text
specification/requirements/abg/REQ-R-ABG3-ITERATION.md
```

Expected first clauses:

- `REQ-R-ABG3-ITERATION-001`: ABG shall derive one active-boundary
  iteration-state projection from admitted replay truth.
- `REQ-R-ABG3-ITERATION-002`: evaluator outputs shall contribute semantic
  finding categories only; they shall not emit runtime, transport, liveness, or
  evidence-lifecycle authority.
- `REQ-R-ABG3-ITERATION-003`: ABG shall derive evidence lifecycle as active,
  preserved/rebased, or superseded before evidence participates in a closure
  satisfaction fold. Orphan evidence shall be represented as a failed
  current-authority binding guard, not as a lifecycle or evaluator category.
- `REQ-R-ABG3-ITERATION-004`: ABG shall derive the next iteration outcome from
  one total priority fold over typed rows, and terminal fallback shall not
  outrank typed state.
- `REQ-R-ABG3-ITERATION-005`: every non-close outcome projection shall expose
  the category, lifecycle, provenance, and failed binding facts needed for
  replay-visible diagnosis.
- `REQ-R-ABG3-ITERATION-006`: evaluator retry, when allowed by policy, shall be
  a first-class redispatch target of the same iteration algebra. It shall be
  distinct from product-worker same-edge redispatch and shall fold to
  terminate-blocked when its retry policy is exhausted or when the evaluator
  failure is non-retryable.
- `REQ-R-ABG3-ITERATION-007`: reports, summaries, pressure refs, terminal
  fallback refs, plugin outcomes, and runner branches may provide source facts
  or read models for iteration state, but they shall not become rival
  next-transition truth surfaces.
- `REQ-R-ABG3-ITERATION-008`: the public iteration outcome carrier shall expose
  only primitive outcome constructors: terminate, redispatch, or suspend.
  Named cases such as close, block, defer, retry, evaluator retry, graph
  re-entry, and reprice shall be represented as dispositions, redispatch
  targets, lawful re-entry refs, or reasons over those constructors.
- `REQ-R-ABG3-ITERATION-009`: redispatch targets shall reuse existing
  `GraphReentryPoint` and target-vector identity. `GraphChangeClass` remains
  provenance/classification for why that surface was selected; it shall not
  become a parallel redispatch discriminator.
- `REQ-R-ABG3-ITERATION-010`: the total fold shall declare an explicit
  precedence order for mixed rows. Convergence shall be selected only when no
  blocking, constitutional re-entry, redispatch, or suspend row remains.
- `REQ-R-ABG3-ITERATION-011`: preserved/rebased evidence shall remain eligible
  to satisfy current closure only when its authority binding is still current
  after re-entry. Evidence invalidated by the re-entry scope shall become
  superseded, and evidence with no lawful current binding shall surface through
  the binding guard.
- `REQ-R-ABG3-ITERATION-012`: suspend shall be derived from runtime rows such as
  progressing, awaiting observer, or handoff. Suspend shall not be inferred from
  semantic satisfaction rows.

## Problem

The intended runtime loop is simple:

```text
current attempt state
+ evaluator category rows
+ runtime/transport/liveness facts
+ payload/evidence/authority facts
+ attempt/re-entry lineage
=> one next outcome
```

The current realization is more complicated than that:

- evaluator findings create authority, payload, evidence, and ambiguity events
- payload ledger scopes by basis, graph call, frame, vector, and edge
- assurance derives ambiguity rows from the ledger and current authority
- continuation transition may separately classify retry/block/yield
- terminal fallback refs can still influence retry
- re-entry clears traversal projection state, but payload/evidence truth does
  not have an equivalent first-class active-attempt boundary

That lets one logical state leak across several surfaces. In particular,
same-vector re-entry can preserve prior attempt evidence as replay history
without classifying it as active, preserved/rebased, superseded, or true orphan.
The result is a brittle distinction between evidence that is superseded by
attempt lineage and evidence that is truly orphaned from lawful authority.

## Prime Rule

Before adding a new iteration state, outcome constructor, enum value, carrier
family, or branch, the implementation must prove it cannot be represented by
the recursive primitive:

```text
typed rows -> lifecycle filter -> priority fold -> terminate | redispatch | suspend
```

If it can be represented by that primitive, it must be represented there. This
is the anti-zoo rule for this ticket.

## Spec Method Refactoring Rule

Apply inside-out Spec Method refactoring:

1. Ratify the smallest requirements change first.
2. Ratify the design shape and structural carrier proof before code.
3. Build the primitive fold at the core.
4. Migrate direct callers inward to the primitive fold.
5. Delete the superseded local deciders.
6. Prove only after old transition authority is gone.

Do not build compatibility layers inside the iteration-boundary transition
path. If an internal caller still needs the old function shape, migrate that
caller. A remaining wrapper is evidence that the ticket has not stripped ABG
back to one truth surface.

## Target Model

The TypeScript sketch below is an implementation brief. The ratified M03 design
artifacts created by this ticket own the authoritative carrier shape.

Create one ABG-owned state machine from primitive row projections:

```ts
type IterationEvidenceLifecycle =
  | "active"
  | "preserved_rebased"
  | "superseded";

type IterationSatisfactionStatus =
  | "satisfied"
  | "unsatisfied"
  | "deferred";

type IterationReason =
  | "missing_evidence"
  | "partial_evidence"
  | "stale_input"
  | "missing_authority"
  | "contradiction"
  | "runtime_failure"
  | "evaluator_failure"
  | "retry_exhausted"
  | "orphan_current_binding"
  | "unsupported_state";

interface IterationSatisfactionRow {
  readonly authorityRef: string;
  readonly status: IterationSatisfactionStatus;
  readonly reason: IterationReason | null;
  readonly lifecycle: IterationEvidenceLifecycle;
  readonly evidenceRefs: readonly string[];
}

interface IterationRuntimeRow {
  readonly boundary: "worker" | "evaluator" | "transport" | "liveness";
  readonly status: "progressing" | "failed";
  readonly reason: IterationReason | null;
  readonly retryable: boolean;
}

interface IterationBindingGuardRow {
  readonly status: "current_binding" | "orphan";
  readonly authorityRef: string | null;
  readonly evidenceRef: string | null;
  readonly failedCondition: string | null;
}

interface IterationRedispatchTarget {
  readonly reEntryPoint: GraphReentryPoint;
  readonly targetVectorIndex: number | null;
}

type IterationOutcome =
  | {
      readonly kind: "terminate";
      readonly disposition: "converged" | "blocked" | "deferred";
    }
  | {
      readonly kind: "redispatch";
      readonly target: IterationRedispatchTarget;
      readonly reason: IterationReason;
      readonly provenanceChangeClass: GraphChangeClass | null;
    }
  | {
      readonly kind: "suspend";
      readonly reason: "progressing" | "awaiting_observer" | "handoff";
    };
```

The state machine is a total deterministic priority fold:

```text
IterationRowProjection -> IterationOutcomeProjection
```

`IterationOutcomeProjection` is the only authoritative next-transition surface for
an active iteration boundary.

Rules:

- fact projections produce rows; they do not call each other and do not call the
  fold
- the fold consumes rows; it does not read events and does not call projections
- current active or preserved/rebased evidence may satisfy closure
- preserved/rebased evidence is still-current evidence carried across re-entry;
  it is not a weaker form of superseded evidence
- superseded evidence remains replay-visible but cannot satisfy or block current
  closure
- superseded rows are filtered before the satisfaction fold
- orphan evidence is a failed current-binding guard and terminates blocked with
  diagnostic provenance
- `orphan_current_binding` is an outcome reason emitted from a binding guard
  row; it must not be emitted as a satisfaction-row reason
- evaluator output contributes semantic satisfaction rows, not runtime
  authority or evidence lifecycle authority
- runtime, transport, liveness, payload, authority, assurance, and re-entry
  facts remain orthogonal row inputs to the fold
- ABG owns the row-to-outcome fold
- runtime-local redispatch is represented by `reEntryPoint` values such as
  `realization` or `proof` plus a target vector
- constitutional re-entry is represented by `reEntryPoint` values such as
  `requirements`, `design_surface`, `product_definition`, `intent`, or `goals`
  with no runtime target vector
- evaluator retry, if selected, is a redispatch to the evaluator/proof boundary
  selected only by this fold and never by a side retry loop
- `provenanceChangeClass` records why the surface was selected; it does not
  compete with `reEntryPoint` or `targetVectorIndex` as the redispatch target
- reports, summaries, pressure strings, plugin outcomes, and runner branches
  cannot outrank the outcome projection
- terminal retry refs are fallback evidence only
- unknown mixed states fail closed with provenance

Priority fold:

The fold is worst-wins and total. It must evaluate mixed rows in this order:

1. Lifecycle normalization:
   - discard superseded rows from satisfaction/blocking consideration
   - retain preserved/rebased rows only when their authority binding remains
     current
   - emit a binding guard row for evidence with no lawful current binding
2. Hard guards:
   orphan current binding, unsupported state, non-retryable runtime/evaluator
   failure, and exhausted retry policy select `terminate(blocked)`.
3. Constitutional re-entry blockers:
   missing authority or contradiction select `terminate(blocked, reEntryPoint)`,
   with `requirements` or `design_surface` chosen by the reason table.
4. Suspend:
   progressing, awaiting observer, or handoff runtime rows select
   `suspend(...)` only when no higher-priority row matched.
5. Runtime-local redispatch:
   graph re-entry frontier, retryable evaluator failure, missing proof,
   wrong-stage proof, missing evidence, partial evidence, or stale evidence
   select a bounded `redispatch(...)` target.
6. Deferred:
   deferred rows select `terminate(deferred)` only when no unsatisfied,
   binding-guard, runtime-failure, redispatch, or suspend row remains.
7. Converged:
   `terminate(converged)` is selected only when every active or
   preserved/rebased satisfaction row is satisfied and no higher-priority row
   matched.
8. Terminal fallback:
   terminal retry fallback refs select bounded redispatch only when no typed
   row above matched and no current active or preserved/rebased row set
   converges or defers.

Initial reason table:

| Row condition | Primitive outcome |
| --- | --- |
| orphan current binding, non-retryable runtime/evaluator failure, exhausted retry policy, unsupported state | `terminate(blocked)` |
| missing authority | `terminate(blocked, requirements)` |
| contradiction in requirement truth | `terminate(blocked, requirements)` |
| contradiction in realization structure | `terminate(blocked, design_surface)` |
| progress observed without current result | `suspend(progressing)` |
| awaiting observer runtime row | `suspend(awaiting_observer)` |
| handoff runtime row | `suspend(handoff)` |
| graph frontier names an upstream vector | `redispatch(realization, targetVector)` |
| retryable evaluator failure while evaluator retry policy permits it | `redispatch(proof, currentVector)` |
| proof obligation is missing or wrong-stage | `redispatch(proof, currentVector)` |
| missing, partial, or stale evidence while policy permits product retry | `redispatch(realization, currentVector)` |
| only deferred rows remain unsatisfied | `terminate(deferred)` |
| all active/preserved rows satisfied and no higher-priority row matched | `terminate(converged)` |
| terminal retry fallback only | `redispatch(realization, currentVector)` |

## Required Work

1. Add `specification/requirements/abg/REQ-R-ABG3-ITERATION.md` and register it
   in `specification/requirements/abg/README.md`. The family must explicitly
   define:
   - iteration rows and outcome as replay-derived ABG truth
   - evaluator semantic rows as inputs to, not owners of, runtime outcome
   - runtime, transport, liveness, authority, and payload facts as separate
     row projections from evaluator semantic rows
   - attempt/re-entry evidence lifecycle
   - preserved/rebased versus superseded classification
   - the total priority fold over rows
   - primitive outcome constructors and the reason-to-re-entry-point table
   - required observability for non-close rows

2. Add TypeScript M03 design:
   - derivation narrative
   - IACS entry for the row and outcome carriers
   - structural carrier diagram
   - state diagram and pseudocode for the row projection, lifecycle filter,
     worst-wins fold, and outcome materializer
   - explicit statement that the ticket's TypeScript sketch is illustrative and
     that the design artifacts own carrier authority

3. Realize one module, expected shape:

```text
code/src/abg/m03/contracts/iteration_state_action.ts
```

The module should own only the primitive vocabulary:

- `IterationRowProjection`
- `IterationSatisfactionRow`
- `IterationRuntimeRow`
- `IterationBindingGuardRow`
- `IterationEvidenceLifecycle`
- `IterationOutcome`
- `IterationOutcomeProjection`
- `deriveIterationRowProjection(...)`
- `deriveIterationOutcomeProjection(...)`
- `iterationReasonToReEntryPoint(...)`

4. Wire existing folds through it:
   - payload-ledger evidence rows
   - assurance ambiguity rows
   - continuation transition facts
   - runtime liveness/transport facts
   - graph re-entry attempt lineage
   - terminal fallback refs

5. Remove or subordinate rival decisions:
   - no separate runner branch may derive retry/block/close from pressure
     strings, terminal refs, or local summary fields after the outcome
     projection exists
   - assurance may still produce row facts, but the next runtime outcome must be
     selected by the iteration outcome projection

6. Persist or expose diagnostics:
   - non-close outcome projection must include satisfaction rows, runtime rows,
     binding guard rows, and evidence lifecycle rows
   - orphan evidence must show `evidenceRef`, `authorityRef`, failed binding
     condition, scope, and provenance event refs
   - superseded evidence must show superseding attempt or re-entry generation

## Proof Requirements

- A re-entered vector where attempt 1 has partial/wrong evidence and attempt 2
  fully satisfies current authority closes.
- The same event stream proves attempt 1 evidence is `superseded`, not
  `orphan`.
- A re-entered vector where attempt 1 satisfies authority A and attempt 2
  satisfies authority B converges by preserving/rebasing the still-current
  attempt-1 evidence for A while using attempt-2 evidence for B.
- A true orphan evidence row with no lawful current authority/scope binding
  terminates blocked and is visible in the outcome projection.
- A mixed row set with satisfied rows plus one missing-authority row selects
  `terminate(blocked, requirements)`, not `terminate(converged)`.
- A mixed row set with missing evidence and retryable evaluator failure selects
  the explicitly higher-priority redispatch target from the fold, not whichever
  projection happens to run last.
- Progressing, awaiting-observer, and handoff runtime rows map to the three
  `suspend(...)` reasons only when no higher-priority row matched.
- Non-retryable runtime failure, non-retryable evaluator failure, and exhausted
  runtime/evaluator retry policy map to `terminate(blocked)`, not product retry.
- Retryable evaluator failure maps to `redispatch(proof, currentVector)` only
  while evaluator retry policy permits it; evaluator retry exhaustion maps to
  `terminate(blocked)`.
- `redispatch(proof, currentVector)` re-runs the evaluator/proof boundary only.
  It must not redispatch the product worker or mutate payload/evidence truth
  outside normal admission.
- Missing evidence maps to `redispatch(realization, currentVector)` only while
  retry policy permits it.
- Missing authority maps to `terminate(blocked, requirements)`.
- A graph re-entry frontier for a cross-vector, upstream-authority-change, or
  graph-scope-change boundary maps to `redispatch(realization, targetVector)`,
  not current-vector redispatch, and the runner emits the corresponding
  re-entry events from the outcome projection.
- Contradiction maps to `terminate(blocked, requirements)` or
  `terminate(blocked, design_surface)` by explicit table row, not by fallback
  ordering.
- Terminal retry fallback is ignored when any typed row/outcome exists.
- Runner integration proves the engine consumes the outcome projection before
  emitting retry, terminal, vector close, or graph re-entry events.
- No ABG code imports or names odd_sdlc, data_mapper, JVM, SBT, JavaScript
  hello-world, or other product-specific vocabulary.

## Boundary

This is ABG kernel-layer work. Downstream products may map domain evaluator
findings into generic satisfaction rows, but they do not own the recursive
outcome algebra.

The objective is simplification, not one more projection beside the others.
Closure requires migration-and-remove discipline: existing scattered transition
decisions must either emit rows for this module or be deleted.

## Migration Inventory

T-149 must collapse the current transition-shaped deciders into the one recursive
iteration outcome algebra. Closure is blocked unless every row below has a
delete or row-projection disposition in the implementation notes and proof.
Compatibility wrappers are not a closure disposition for the iteration-boundary
transition path.

| Surface | Current function | Required disposition |
| --- | --- | --- |
| `contracts/iteration.ts` | `deriveIterationAdvanceDecision` | subsume into `iteration_state_action.ts`; delete |
| `contracts/iteration.ts` | `deriveAdvancementTransition` | subsume into `iteration_state_action.ts`; delete |
| `contracts/graph_span_reentry.ts` | `deriveAdvancementTransitionWithReentry` | demote to graph re-entry fact/provenance rows or call the outcome projection; it must not independently select retry/reenter/block |
| `contracts/continuation_transition.ts` | `deriveRuntimeContinuationTransitionProjection` | fold into `iteration_state_action.ts`; delete any independent priority table |
| `contracts/traversal_non_progress.ts` | `deriveTraversalContinuationActionProjection` | demote to runtime/non-progress row projection; outcome selected by `iteration_state_action.ts` |
| `contracts/assurance.ts` | `deriveAssuranceClosureDecision` | demote assurance to satisfaction/lifecycle/binding rows; close/retry/block/reprice are materialized from `IterationOutcome` |
| `contracts/plugins.ts` | `deriveFdPressureRoutingDecision` | demote F_D pressure routing to typed category/fact rows; `block` and `route_to_fp` must not directly terminalize the active boundary |
| `contracts/retry_frontier.ts` | `deriveRetryFrontierProjection` / `deriveFreshRetryContextProjection` | remain retry-context fact projections; they do not select the final outcome |
| `contracts/retry_repair.ts` | `deriveRetryRepairDecision` | leave as event-materialization policy under `redispatch(realization, targetVector)`; it must not choose whether redispatch is lawful |
| `contracts/runtime_liveness.ts` | liveness disposition derivation | demote to runtime/liveness rows; continue/terminate/retry/yield/block vocabulary must not outrank `IterationOutcome` |
| `runner/attached_fp_worker.ts` | `deriveAttachedFpResultDecision` | demote to worker-result fact classification; it must not own retry/close/terminal transition |
| `runner/engine_runner.ts` | `deriveActiveReentry` | route through `redispatch(realization/proof, targetVector)` outcome before emitting re-entry events |
| `runner/engine_runner.ts` | `deriveBlockedFpNoArtifactContinuation` | route no-artifact and blocked F_P paths through the same outcome projection |
| `runner/engine_runner.ts` | `fdEvaluationEventStatus` / `fdAuthorityTerminalTransition` | emit F_D authority rows only; terminal/yield/block selection must come from the iteration outcome projection |
| `runner/engine_runner.ts` | direct calls to `deriveAdvancementTransition`, `deriveAssuranceClosureDecision`, `deriveRuntimeContinuationTransitionProjection`, `deriveTraversalContinuationActionProjection`, `deriveRetryRepairDecision`, and `deriveAttachedFpResultDecision` | remove or subordinate so the runner consumes one `IterationOutcomeProjection` before emitting retry, terminal, close, or re-entry events |
| `runner/assurance_gate.ts` | direct `deriveAssuranceClosureDecision` fold | use assurance rows as input facts only; no independent outcome decision |
| `contracts/traversal_structure_probe.ts` | direct calls to iteration advancement helpers | update to read or demonstrate the unified projection; no separate probe transition law |

## Scope Fence

Do not collapse these orthogonal ABG layers into the iteration outcome algebra:

- `event_calculus.ts` and `event_admission.ts`: event truth and admission
  substrate
- `saga_frontier.ts` and `saga_frontier_runner.ts`: parallel/frontier
  readiness across lanes
- dependency-frontier surfaces: cross-edge dependency readiness
- `temporal_algebra.ts`: time/SLA arithmetic and temporal facts
- overlay/frame/zoom surfaces: frame mechanics and observer context
- carrier type declarations except where a carrier is needed for the new
  iteration projection or diagnostic read model

The boundary is: frontier decides which work boundary is ready; iteration
outcome decides what the active boundary does next.

## Structural Guard

Add a deterministic structural test that fails if any iteration-boundary
function outside `iteration_state_action.ts` owns a local outcome table or
directly maps facts to close, retry, evaluator retry, re-enter, block, reprice,
yield, or qualified defer instead of producing rows or materializing an
`IterationOutcome`. Allowed outside the module:

- fact projections that do not select an outcome
- tests and design examples

The guard must cover function names matching transition-bearing families such as
`derive*Advancement*`, `derive*Continuation*`, `derive*Reentry*`,
`derive*Closure*`, `derive*Retry*`, and `derive*Decision*` when they operate on
an iteration boundary.

## Implementation Update - 2026-06-05

First inside-out slice is landed and verified, but the ticket is not closed.

Completed:

- Added and registered `REQ-R-ABG3-ITERATION`.
- Added M03 derivation, IACS, and structural carrier diagram for the iteration
  outcome algebra.
- Added `iteration_state_action.ts` with the primitive row families and one
  total fold to `terminate`, `redispatch`, or `suspend`.
- Routed runtime continuation transition projection through the iteration
  outcome fold so typed block/reprice/yield/retry, assurance decisions,
  traversal no-progress facts, and terminal fallback refs no longer own a
  separate priority order in that path.
- Added evidence lifecycle to assurance evidence rows and made only explicit
  `superseded` evidence non-blocking. Ordinary non-current worker/evaluator
  self-report remains true `orphan_evidence`.

Proof run:

- `npm run test:t149` passed.
- `npm run build:semantic && node --test test_env/tests/test_t099_fp_stage_carriers.test.mjs test_env/tests/test_t148_runtime_continuation_transition.test.mjs test_env/tests/test_t149_iteration_state_action_algebra.test.mjs` passed `19/19`.
- `npm run test:semantic` passed `672/672`.
- `git diff --check` clean.

Superseded by the final implementation update below.

## Implementation Update - 2026-06-05 Final Slice

Completed migration-and-remove:

- Deleted `contracts/iteration.ts`. Its advancement helpers now live in
  `iteration_state_action.ts`.
- Rewired contracts, constructors, runner, graph re-entry, and traversal probe
  imports away from the deleted `iteration.ts` surface.
- Demoted `deriveAssuranceClosureDecision` to a materializer over
  `deriveIterationOutcomeFromRows`. Assurance now adapts ambiguity rows into
  satisfaction, runtime, and binding-guard rows before the fold selects the
  outcome.
- Demoted graph-span re-entry transition materialization to the fold. Active
  graph-vector, constitutional, reprice, and block frontier outcomes construct
  row facts and consume `deriveIterationOutcomeFromRows` before emitting the
  existing graph re-entry carrier shape.
- Demoted traversal non-progress action materialization to the fold. Runtime
  archive, progress, retryable failure, exhausted retry, blocked, and policy
  reprice cases are row facts before the existing action projection is
  materialized.
- Demoted runtime liveness disposition materialization to the fold. Active
  leases suspend, retryable inactivity redispatches, and interruption/hard-cap
  states block through row facts before the existing liveness read model is
  materialized.
- Routed F_D authority terminal/yield selection through the fold.
- Added a structural T-149 guard proving the deleted `iteration.ts` surface is
  not imported, migrated transition surfaces consume the fold, and generic
  iteration surfaces contain no downstream product or stack vocabulary.
- Fixed the self-review terminal-fallback residue bug: terminal fallback now
  redispatches only after current satisfied/deferred rows have had the
  opportunity to converge/defer, so stale fallback refs cannot force a
  non-converging re-entry loop.
- Fixed the ongoing-review attached-F_P residual rival: blocked attached
  artifacts now assert retry, stop, and escalation materialization against
  `deriveIterationOutcomeFromRows`; retry repair remains event materialization,
  not transition authority.
- Fixed the latent `edgeCanClose` bypass: compact close eligibility can only
  converge when no current active or preserved/rebased satisfaction row is
  unsatisfied.

Current disposition by migration-inventory surface:

| Surface | Disposition |
| --- | --- |
| `contracts/iteration.ts` | deleted |
| `contracts/graph_span_reentry.ts` | active re-entry transition materializes after `deriveIterationOutcomeFromRows` |
| `contracts/continuation_transition.ts` | materializes after `deriveIterationOutcomeProjection` |
| `contracts/traversal_non_progress.ts` | materializes after `deriveIterationOutcomeFromRows` |
| `contracts/assurance.ts` | closure decision materializes after `deriveIterationOutcomeFromRows` |
| `contracts/plugins.ts` F_D routing | F_D terminal/yield runner selection routes through `deriveIterationOutcomeFromRows`; plugin outcome remains source fact |
| `contracts/retry_frontier.ts` | remains retry-context fact projection |
| `contracts/retry_repair.ts` | remains event-materialization policy consumed only after redispatch/retry has been selected |
| `contracts/runtime_liveness.ts` | disposition read model materializes after `deriveIterationOutcomeFromRows` |
| `runner/attached_fp_worker.ts` | blocked-result retry/stop/escalation materializes only after fold agreement; retry repair remains event materialization under the selected outcome |
| `runner/engine_runner.ts` | consumes fold-backed continuation, assurance, graph re-entry, traversal, liveness, F_D authority, and bounded-attempt materializers before emitting terminal/retry/re-entry events |
| `runner/assurance_gate.ts` | consumes fold-backed assurance decision read model |
| `contracts/traversal_structure_probe.ts` | imports advancement helpers from `iteration_state_action.ts`; no deleted transition surface remains |

Final proof:

- `npm run build:semantic` passed.
- `npm run test:t149` passed `12/12`.
- `npm run build:semantic && node --test test_env/tests/test_t084_attached_fp_worker_loop.test.mjs test_env/tests/test_t098_retry_frontier_projection.test.mjs test_env/tests/test_t107_traversal_modulation_unit.test.mjs test_env/tests/test_t149_iteration_state_action_algebra.test.mjs` passed `36/36`.
- `npm run test:semantic` passed `676/676`.
- `git diff --check` clean.

## Depth Review Fix - 2026-06-07

Deep review found two remaining boundary defects after the original proof:

- The exported row-only fold helper could receive scoped rows without the
  `ExecutionBasis` and runtime projection required to validate
  `GtlEvaluationScopeRef` against graph call, frame, graph function, graph
  vector, and vector index truth. That made `deriveIterationOutcomeFromRows`
  an unvalidated entrance for the T-151 scoped-row substrate even though
  `deriveIterationOutcomeProjection` validated the same rows.
- `edgeCanClose: true` could still converge an empty current satisfaction row
  set through vacuous `[].every(...)`. That overclaimed compact close evidence
  when no active or preserved/rebased satisfaction set was present.

Fix:

- `deriveIterationOutcomeFromRows(...)` now accepts optional
  `basis` + `runtimeProjection` together. If scoped rows or scoped redispatch
  targets are supplied without that validation context, it fails closed. When
  the context is supplied, it routes through `deriveIterationRowProjection(...)`
  and reuses the same validation path as the authoritative projection helper.
- The convergence branch now requires at least one current satisfaction row
  before either normal satisfaction or compact `edgeCanClose` evidence can
  converge.

Verification:

- `npm run build:semantic` passed.
- `npm run test:t149` passed `14/14`.
- Direct focused pack passed `33/33`:
  `test_t149_iteration_state_action_algebra.test.mjs`,
  `test_t152_contract_fulfillment_binding_api.test.mjs`,
  `test_t126_temporal_runtime_scope_consolidation.test.mjs`,
  `test_t122_temporal_deadline_policy.test.mjs`,
  `test_t119_temporal_algebra_unit.test.mjs`.
- Implementation-time snapshot: `npm run test:semantic` passed `717/717`.
- Subsequent review rerun reported `npm run test:semantic` passed `721/721`.
- `git diff --check` clean.

## Final Close Proof - 2026-06-07

Close-readiness review found three remaining proof/authority gaps:

- runner-level proof was too thin;
- `attached_fp_worker.ts` computed the fold but still let retry materialization
  appear to choose the outcome;
- `edgeCanClose` had become a dead compact-close parameter.

Final implementation resolves those gaps:

- `edgeCanClose` was removed from the public fold/projection inputs and from
  continuation transition plumbing.
- `attached_fp_worker.ts` now derives a blocked outcome from
  `deriveIterationOutcomeFromRows(...)` and branches on that fold result;
  retry repair only materializes the selected retry outcome and still checks
  agreement with the retry decision.
- `test_t149_iteration_state_action_algebra.test.mjs` now proves runner-level
  convergence, F_D handoff suspension, graph re-entry redispatch, scoped-row
  fail-closed behavior, empty satisfaction fail-closed behavior, and
  fold-backed attached F_P blocked-artifact stop behavior.

Verification:

- `npm run test:t149` passed `17/17`.
- `npm run lint:semantic` passed.
- `npm run test:semantic` passed `728/728`, `0` skipped, `0` todo.
- `git diff --check` clean.
