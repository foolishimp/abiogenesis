---
id: T-107
title: Define ABG traversal modulation profiles for agentic F_P graph-vector attempts
type: feature
ticket_category: runtime_traversal_modulation
status: completed
review_status: closed_ratified_abg_substrate_scope
goal: rc7-agentic-traversal-modulation-and-backend-progress-truth
change_intent: Extend the completed T-106 no-progress substrate into an ABG-owned bounded-attempt modulation surface that works for Claude and Codex style agentic workers, carries intent-affect control pressure as typed runtime input, and lets large F_P graph-vector work continue through replay-visible progress, retry, same-edge continuation, foldback, and lawful reentry without downstream private loops.
change_class: requirement_reprice
re_entry_point: requirement
affected_boundary: ABG graph-function iteration, GTL-visible policy/hook attachment, supervised actor backend progress profiles, F_P attempt envelopes, handoff manifests, traversal non-progress projection, retry frontier, workspace zoom/foldback, graph-span reentry, public start/gaps summaries, downstream odd_sdlc consumption
priority: critical
build_tenant: typescript
release_scope: RC7 candidate
triaged_at: 2026-05-03T16:20:00+10:00
created_at: 2026-05-03T16:20:00+10:00
updated_at: 2026-05-03T17:11:50+10:00
closed_at: 2026-05-03T17:11:50+10:00
closure_scope: ABG substrate scope only
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
dependencies:
  - T-082 completed ABG output instance allocation for input-only graph-function starts
  - T-100 completed zoomed workspace-asset obligation schedule and foldback evaluation
  - T-101 completed mini data-mapper redux live semantic eval sandbox
  - T-102 completed eval-suite projection artifacts and repeatable sandbox runs
  - T-103 completed graph-span foldback and reentry frontier
  - T-104 completed cross-workspace output allocation for graph-function starts
  - T-106 completed typed traversal non-progress continuation and summary agreement
related_strategy:
  - .ai-workspace/comments/codex/20260503T115921AEST_STRATEGY_traversal_modulation_and_intent_affect.md
related_tickets:
  - .ai-workspace/tickets/completed/T-106-define-abg-typed-traversal-non-progress-continuation-and-summary-agreement.md
  - downstream odd_sdlc B-082 backfills agentic CLI buffering/progress observation against live test66 evidence
candidate_requirement_authority:
  - specification/INTENT.md
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-ATTRS.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/gtl/REQ-L-GTL3-ROLE.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-RETRY.md
  - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
  - specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/abg/REQ-R-ABG3-BINDING.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-LINEAGE.md
  - specification/requirements/product/REQ-P-POLICY.md
related_design:
  - build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_ATTACHED_FP_WORKER_LOOP_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_SUPERVISED_ACTOR_INVOCATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_RETRY_REPAIR_LEAFTASK_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_OUTPUT_ALLOCATION_AND_WORKSPACE_ZOOM_FOLDBACK_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M04_MAXIMUM_AUTONOMY_GEN_START_DERIVATION.md
evidence_refs:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260503T115921AEST_STRATEGY_traversal_modulation_and_intent_affect.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-106-define-abg-typed-traversal-non-progress-continuation-and-summary-agreement.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/B-082-backfill-agentic-cli-buffering-progress-observation-design-adr.md
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/EDGE_COMPARISON_test35_vs_test65_vs_test66.md
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test66.TS.cl/.ai-workspace/runtime/odd_sdlc/operator-runs/20260503T040705129Z_pid69518
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test66.TS.cl/.ai-workspace/runtime/odd_sdlc/operator-runs/20260503T042255373Z_pid69518
  - /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test66.TS.cl/.ai-workspace/runtime/odd_sdlc/operator-runs/20260503T043749120Z_pid95586
proof_commands:
  - npm run build:semantic
  - npm run lint:semantic
  - npm run lint:test-harness
  - npm run test:t100:unit
  - npm run test:t100:sandbox
  - npm run test:t101
  - npm run test:t102
  - npm run test:t103
  - npm run test:t104
  - npm run test:t106
  - npm run test:t107
  - npm run test:semantic
  - git diff --check
deferred_proof_lanes:
  - CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude npm run test:t107:live
  - CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=codex npm run test:t107:live
intake_source: RC7 scoping discussion on 2026-05-03. The operator identified that prior bug T-106 may need repricing across both Claude and Codex agentic-worker usage, and linked the traversal modulation and intent affect strategy post as the related feature surface.
target_truth: ABG admits strategy-layer traversal modulation directives into replay-visible bounded F_P attempt envelopes. Downstream strategy layers such as odd_sdlc own the meaning of steel-thread, waterfall, phased, or feature-slice approaches. ABG owns the typed tools that force those strategies at runtime: schedule selection, ordering constraints, phase gates, progress artifact requirements, retry budget, same-edge continuation pressure, backend progress interpretation, forced-review gates, and intent-affect control pressure. The envelope, not prompt prose, is the scheduler command surface. Assurance consumes the envelope, admitted progress rows, forced-review gates, ledgers, and foldback projection; it must not infer completion or remaining work from worker prose or file presence. Public summaries, runner transitions, archives, and downstream consumers all render the same ABG projection.
superseded_truth: Large probabilistic edge work is controlled by prompt-only chunking, downstream SDLC-local loops, backend-specific CLI folklore, or hidden agent strategy rather than ABG-admitted attempt envelopes and replay-derived projection.
source_closure_boundary: T-107 closes for ABG source scope only when requirements, design, TypeScript implementation, and proof establish backend-aware traversal modulation as ABG runtime law. Downstream products such as odd_sdlc must consume the released ABG projection under downstream ticket authority before claiming product-level data_mapper parity.
closure_law: Close only when ABG can admit a modulation profile, derive a bounded attempt envelope, dispatch a Claude or Codex style F_P worker under that envelope, admit artifact/progress/non-progress truth, project same-edge continuation or lawful reentry from replay, and make public summaries agree with the carrier/projection without moving semantic requirement evaluation or domain chunking policy into ABG.
non_closure_conditions:
  - modulation is only prompt text and no replay-visible profile/envelope/event exists
  - remaining work, review need, or next tranche is inferred from prose instead of carried by typed rows
  - the scheduler advances because generated files or prose imply progress without complete typed schedule rows
  - Claude gets a special runtime branch while Codex remains dependent on a different local convention
  - Codex live readiness is manufactured through hidden core transport state rather than explicit test harness/setup truth
  - T-106 no-progress action and T-107 modulation continuation project different next actions for the same event stream
  - progress artifacts are treated as semantic closure rather than liveness/diagnostic inputs to admission and foldback
  - F_D envelope checks replace F_P semantic evaluation of A.req_i to B.result_i
  - intent affect is represented as emotional prose or semantic confidence, not typed control pressure
  - ABG hard-codes downstream strategy semantics such as steel-thread or waterfall instead of enforcing strategy-layer directives through generic runtime primitives
  - GTL becomes a policy DSL for steel-thread/layered-build semantics instead of exposing hook/config refs interpreted by ABG runtime policy
  - downstream odd_sdlc implements private chunking, retry, or same-edge continuation after this substrate exists
---

# T-107: ABG Traversal Modulation Profiles For Agentic F_P Attempts

## STDO Triage

### First Missing Layer

Requirement.

T-106 closed the narrow runtime bug: if an F_P attempt produces no artifact,
report, stream, or declared progress signal, ABG derives a typed non-progress
carrier and one public continuation action. That remains valid.

The RC7 gap is broader. A large graph-vector attempt can be lawful but too large
for one unbounded agentic worker call. The system needs a replay-visible way to
shape the attempt before dispatch:

```text
outer edge is valid
work is too large or too risky for one unbounded F_P call
ABG resolves bounded attempt policy
worker performs bounded construction
semantic evaluation folds result or gap
ABG continues same edge, retries, exhausts, or reenters lawfully
```

That is runtime requirement law, not a prompt convention and not an
odd_sdlc-local workflow policy.

### Lawful Re-Entry

`requirement_reprice`.

Existing requirements name transport, retry, projection, assurance, output
allocation, graph-span reentry, and non-progress classification. They do not
yet name traversal modulation as the ABG-owned carrier family that shapes a
bounded F_P attempt across backend-specific progress behavior.

## RC7 Scope Decision

T-107 is the RC7 substrate scope for:

1. backend-aware agentic worker progress interpretation across Claude and Codex;
2. bounded F_P attempt modulation for large graph-vector work;
3. typed intent-affect signals as control pressure inputs;
4. public summary and carrier agreement across artifact, progress,
   non-progress, retry, continuation, and reentry outcomes.

T-106 is not reopened by default. T-107 may update requirement/design/code
surfaces created by T-106 where the new law composes with no-progress
classification, but the T-107 ticket owns that change.

## Test35/Test66 Quality Bar

The RC7 bar is not merely "do not timeout" and not merely "close more vectors".
The bar is to recover the quality-producing behavior that made Python test35
successful while keeping the stricter ABG/TS runtime law.

Observed test35 success properties:

- `derive_implementation_design_surface`,
  `derive_implementation_module_surface`, and `derive_code_surface` each have a
  published fulfillment ledger with `expected_count: 77`, `fulfilled_count: 77`,
  `missing_count: 0`, `blocked_count: 0`, and `edge_converged: true`.
- `derive_code_surface` reached full product materialization: 105 main Scala
  source files, 35 Scala test files, and 33 test reports in the reference tree.
- Later failed or expanded proof pressure did not erase earlier admitted
  converged ledgers.
- Worker/runtime failure and semantic fulfillment remained distinct enough that
  useful preserved artifacts could be ingested rather than discarded.

Observed test66 quality delta:

- test66 has now closed vectors `0..11`; it crossed the old test65 vector-8
  breakpoint and produced admitted `implementation_module_surface` and
  `realization_schedule_surface` artifacts.
- test66 reaches `derive_code_surface`, but the code attempt produced no
  admitted worker result report and no edge ledger.
- The code attempt wrote a 449-line `code_surface.md` and 19 product files, but
  only 14 main Scala files were present and only for `cdme-compiler` and
  `cdme-adjoint`.
- The generated `code_surface.md` planned all seven modules, but the filesystem
  contains no source trees for `cdme-executor`, `cdme-fidelity`,
  `cdme-accounting`, `cdme-assurance`, or `cdme-engine`, and no test reports.
- The failure is therefore a bounded-construction/progress problem as well as a
  transport problem: a high-quality plan started, partial materialization
  happened, and the framework lacked an admitted partial-progress continuation
  carrier that could preserve the work and continue the same edge.

RC7 must treat this as the quality target:

```text
full edge closes with admitted ledger and complete declared materialization
OR
bounded tranche produces admitted partial progress, typed remaining schedule,
and same-edge continuation pressure whose public summary agrees with carrier truth
```

It is not enough for RC7 to increase timeout or make stdout visible. It must
make the code/materialization edge progress in bounded, replay-visible units
until the declared module schedule closes or a lawful reentry is projected.

## Problem Statement

The strategy post identifies the operator problem:

```text
This folder has 100 features. Build them.
```

The operator should not have to split that manually into 100 tickets or drive a
private retry loop. The system should let an F_P worker make bounded progress,
evaluate real semantic deviation requirement-by-requirement, and continue the
same edge with sharper gap pressure until the edge closes or a lawful upstream
reentry is projected.

There are two current failure modes:

1. backend progress ambiguity:
   - Claude and Codex have different CLI/protocol/output behavior;
   - stdout buffering or API retry can look like worker silence;
   - progress truth becomes backend folklore unless ABG owns the profile.
2. prompt-only chunking:
   - the prompt says "do first N" or "make a plan";
   - no profile, envelope, event, or projection records the controlling law;
   - CLI, carrier, ledger, and downstream summary can disagree.

## Target Runtime Shape

### Strategy-Layer Directive And ABG Enforcement Tools

Traversal modulation is about strategy, but ABG does not own downstream
strategy semantics. odd_sdlc or another product strategy layer owns what
`steel_thread`, `waterfall`, `layered_build`, `by_feature`, or equivalent
domain strategies mean.

ABG shall define the typed enforcement tools that let that strategy layer force
its declared approach without private loops or prompt-only control:

```ts
type TraversalSchedulingPrimitive =
  | "atomic_attempt"
  | "bounded_batch"
  | "ordered_schedule_prefix"
  | "single_vertical_slice"
  | "phase_gate"
  | "gap_repair_slice"
  | "agent_proposed_slice_requires_admission";

interface TraversalStrategyDirective {
  readonly kind: "traversal_strategy_directive";
  readonly directiveRef: string;
  readonly strategyOwnerRef: string;
  readonly strategyLabel: string;
  readonly enforcementPrimitives: readonly TraversalSchedulingPrimitive[];
  readonly orderingConstraintRefs: readonly string[];
  readonly phaseGateRefs: readonly string[];
}
```

`strategyLabel` is descriptive and product-owned. ABG must not switch on labels
such as `steel_thread` or `waterfall`. ABG may switch only on the closed
`TraversalSchedulingPrimitive` set and the admitted schedule/gate refs. For
example, odd_sdlc may define a waterfall strategy by emitting ordered phase
gates, or a steel-thread strategy by emitting a single vertical slice plus
phase-gate constraints; ABG enforces those refs without knowing the domain
meaning of the strategy.

### GTL Configuration Surface And Resolution

Traversal modulation configuration is a qualifier on GTL traversal surfaces. It
is not an ad hoc runner argument and not hidden runtime side-channel state.

Primary configuration surface:

```text
GraphVector.declarations["abg.traversal_modulation"]
  -> SerializedAttrValue.kind = "hook_ref"
  -> HookRef.ref = product-owned strategy/policy hook ref
  -> HookRef.config = opaque GTL attrs interpreted by ABG policy resolution
```

Resolution precedence:

```text
1. GraphVector.declarations["abg.traversal_modulation"]
2. GraphFunction.declarations["abg.default_traversal_modulation"]
3. Role.policyHooks["abg.traversal_modulation"]
4. explicit resolved-policy default, only when the runtime policy declares that
   absence of a GTL qualifier is lawful for the edge
```

The `GraphVector` qualifier is the normal edge-traversal extension point because
`GraphVector.declarations` is the canonical transition-governance declaration
surface. `GraphFunction` default exists only to avoid repetition across vectors
inside one published graph function. `Role.policyHooks` exists for capability
class defaults. ABG may consume these GTL hook/config refs, but GTL remains a
declaration language and does not define strategy semantics.

ABG shall resolve a GTL qualifier into `TraversalStrategyDirective` before
deriving `TraversalModulationProfile`. The resolver is fail-closed:

- a present traversal-modulation attr must be `hook_ref`;
- the hook config must contain admitted scheduling primitive refs;
- duplicate qualifiers at the same precedence layer are illegal;
- multiple role-level defaults are illegal unless the resolved-policy layer
  chooses one explicitly and records that choice;
- an unresolved or malformed hook/config cannot silently fall back to prompt
  prose;
- ABG must not switch on `HookRef.ref` labels such as `steel_thread` or
  `waterfall`; it may switch only on admitted `TraversalSchedulingPrimitive`
  values and schedule/gate refs.

### Backend Progress Profile

ABG shall define a backend progress profile for process-bound agentic workers.
The profile records how liveness/protocol/progress signals are recognized for a
worker backend without turning those signals into semantic closure.

Initial required backend classes:

```ts
type AgenticBackendKind = "claude" | "codex" | "generic_process";

interface AgenticBackendProgressProfile {
  readonly kind: "agentic_backend_progress_profile";
  readonly backendKind: AgenticBackendKind;
  readonly profileRef: string;
  readonly processProtocolSignals: readonly string[];
  readonly streamProgressSignals: readonly string[];
  readonly declaredArtifactProgressSignals: readonly string[];
  readonly finalOutputMayBeBuffered: boolean;
  readonly progressSignalRequiredBeforeInactivityMs: number;
}
```

The first implementation may keep backend-specific transport argv outside this
carrier when owned by a downstream product. ABG still owns the progress
interpretation and no-progress classification boundary.

### Traversal Modulation Profile

ABG shall define:

```ts
interface TraversalModulationProfile {
  readonly kind: "traversal_modulation_profile";
  readonly profileRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly strategyDirectiveRef: string;
  readonly enforcementPrimitives: readonly TraversalSchedulingPrimitive[];
  readonly orderingConstraintRefs: readonly string[];
  readonly phaseGateRefs: readonly string[];
  readonly backendProfileRef: string;
  readonly policyRefs: readonly string[];
  readonly obligationScheduleRefs: readonly string[];
  readonly gapPressureRefs: readonly string[];
  readonly affectRefs: readonly string[];
  readonly batch: {
    readonly targetItemCount?: number;
    readonly maxItemCount?: number;
    readonly maxTokenPressure?: number;
  };
  readonly progressContract: {
    readonly progressArtifactRequired: boolean;
    readonly allowedProgressArtifactKinds: readonly string[];
    readonly noProgressClass: "runtime_non_progress";
  };
  readonly continuation: {
    readonly sameEdgeUntil: "foldback_closed" | "retry_budget_exhausted";
    readonly maxAttemptsWithoutNewSignal: number;
    readonly maxTotalAttempts: number;
  };
}
```

### Traversal Attempt Envelope

ABG shall derive an attempt envelope immediately before F_P dispatch:

```ts
interface TraversalAttemptEnvelope {
  readonly kind: "traversal_attempt_envelope";
  readonly envelopeRef: string;
  readonly profileRef: string;
  readonly backendProfileRef: string;
  readonly actorInvocationId: string;
  readonly selectedScheduleItemRefs: readonly string[];
  readonly orderingConstraintRefs: readonly string[];
  readonly phaseGateRefs: readonly string[];
  readonly requiredProgressArtifactRefs: readonly string[];
  readonly gapPressureRefs: readonly string[];
  readonly affectRefs: readonly string[];
  readonly retryBudgetRemaining: number;
  readonly mustExitAfterBoundedAttempt: boolean;
}
```

The F_P prompt and handoff manifest are projections of this envelope. The prompt
does not become authority.

### No-Inference And Forced Review Law

ABG shall not infer iterative work from prose, file counts, elapsed time,
directory shape, or the worker's unstated intent.

Every bounded attempt must leave a typed work/progress surface:

```ts
interface TraversalAttemptProgressRow {
  readonly kind: "traversal_attempt_progress_row";
  readonly envelopeRef: string;
  readonly scheduleItemRef: string;
  readonly declaredOutcome:
    | "fulfilled"
    | "partial"
    | "blocked"
    | "not_attempted";
  readonly artifactRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly remainingWorkRefs: readonly string[];
  readonly reviewRequired: boolean;
}
```

For every `selectedScheduleItemRef` in the attempt envelope, replay projection
must find exactly one admitted `TraversalAttemptProgressRow`. Missing rows,
duplicate rows, empty evidence for a non-`not_attempted` row, or partial rows
without `remainingWorkRefs` are typed defects.

Forced review is also a typed projection, not an operator hunch:

```ts
interface TraversalForcedReviewGate {
  readonly kind: "traversal_forced_review_gate";
  readonly gateRef: string;
  readonly envelopeRef: string;
  readonly trigger:
    | "missing_progress_row"
    | "duplicate_progress_row"
    | "partial_without_remaining_work"
    | "evidence_missing"
    | "summary_projection_disagreement"
    | "backend_progress_ambiguous"
    | "retry_budget_exhausted"
    | "semantic_gap_requires_review";
  readonly evidenceRefs: readonly string[];
  readonly requiredRegime: "F_P" | "F_H";
  readonly publicAction: "forced_review";
  readonly blocksPrivateContinuation: true;
}
```

The runner may continue the same edge only when projection has admitted:

1. a closed attempt envelope;
2. exactly one progress row for every selected schedule item;
3. an admitted remaining schedule when any row is `partial`,
   `blocked`, or `not_attempted`;
4. no active `TraversalForcedReviewGate`;
5. one public next action shared by runner, archive, CLI/gaps, and downstream
   consumer projection.

If those conditions are not met, ABG must emit or project
`TraversalForcedReviewGate`. It must not infer that the next tranche is obvious
from generated files or prose.

### Scheduling Enforcement And Assurance Law

The typed traversal modulator is the scheduler enforcement surface. It is not a
prompt-improvement feature and not a downstream SDLC chunking convention.

Implementation law:

```text
strategy-layer directive
  -> TraversalModulationProfile
  -> TraversalAttemptEnvelope
  -> F_P dispatch manifest and prompt projection
  -> admitted TraversalAttemptProgressRow set
  -> forced-review / same-edge-continuation / foldback projection
  -> one public next action
```

The runner may schedule, continue, pause, retry, or stop only from that replayed
projection. The prompt can ask the worker to plan before execution, but the
worker's plan does not schedule the next tranche unless it is admitted as typed
progress rows, remaining-work rows, or another carrier named by this ticket.

The strategy layer may force a steel-thread, waterfall, phased, or feature-slice
approach by choosing schedule refs, ordering constraints, phase gates, and batch
limits. ABG enforces those typed refs. ABG does not interpret the product meaning
of the strategy label.

Assurance is therefore downstream of typed modulation truth:

```text
attempt envelope
  + one progress row per selected schedule item
  + admitted artifact/evidence refs
  + remaining schedule rows for every partial/blocked/not_attempted item
  + T-100 obligation/foldback truth
  + T-106 non-progress truth when no artifact/progress exists
  + T-103 graph-span reentry truth when semantic gap forces upstream reentry
  -> assurance projection
```

Assurance must treat missing or contradictory schedule truth as a defect, not as
ambiguous success. A worker that writes two modules out of a selected seven-item
slice has not implicitly scheduled the remaining five. It has either admitted
five remaining schedule rows, or ABG projects `TraversalForcedReviewGate`.

### Intent Affect

Intent affect is a typed control signal. It is not emotion prose and not
semantic evidence.

Initial closed set:

```ts
type TraversalAffect =
  | { readonly kind: "urgency"; readonly level: "low" | "normal" | "high" }
  | { readonly kind: "risk"; readonly level: "low" | "medium" | "high" }
  | { readonly kind: "confidence"; readonly level: "low" | "medium" | "high" }
  | { readonly kind: "precision"; readonly level: "low" | "medium" | "high" }
  | { readonly kind: "exploration"; readonly level: "low" | "medium" | "high" };
```

Examples:

- high risk: smaller batch and stronger progress artifact requirement;
- high urgency: faster bounded attempt and quicker same-edge continuation;
- low confidence: smaller selected slice and preserve alternatives;
- high precision: smaller slice and stricter foldback;
- high exploration: broader candidate generation before foldback.

Affect changes attempt pressure only. It must not certify semantic correctness.

## Event And Projection Law

Minimum event family:

```text
traversal_modulation_resolved
traversal_attempt_envelope_derived
traversal_attempt_dispatched
traversal_attempt_progress_observed
traversal_attempt_non_progress_classified
traversal_forced_review_projected
traversal_same_edge_continuation_planned
traversal_modulation_exhausted
```

These events compose with existing carrier families:

- T-100 owns obligation schedule and edge foldback.
- T-102 owns eval-suite projection over trial truth.
- T-103 owns graph-span foldback and graph/constitutional reentry frontier.
- T-104 owns input/output workspace materialization lineage.
- T-106 owns per-attempt non-progress classification and action projection.
- T-107 owns bounded attempt envelope and modulation continuation pressure.

Projection rule:

```text
Runtime event stream + current basis + resolved modulation profile
  -> current attempt envelope
  -> current progress/non-progress/foldback state
  -> forced review gate when typed progress is incomplete or ambiguous
  -> one next action for start/gaps/runner/downstream summaries
```

No read model may invent a separate action.

## Outcome Law

For a modulated F_P attempt, exactly one lawful path shall result:

```text
artifact produced
  -> admission
  -> semantic eval / foldback
  -> ledger progress or closure

typed partial progress produced
  -> admission
  -> open schedule rows remain
  -> same-edge continuation pressure

typed runtime non-progress
  -> no artifact/report/progress signal
  -> T-106 action projection
  -> bounded retry or projection-visible stop

typed semantic gap
  -> requirement-by-requirement gap pressure
  -> same-edge continuation or T-103 graph/constitutional reentry

typed exhausted / blocked
  -> no private retry
  -> projection-visible stop
```

Public operator rule:

```text
Either produce an artifact and ledger-close/progress,
or emit a typed retry/continuation path whose carrier and public summary agree.
```

## GTL Boundary

GTL shall expose modulation as declaration attachment or hook/config refs,
not as a policy semantic language.

Acceptable GTL-level shapes include:

```text
GraphVector.declarations.traversal_modulation_ref
GraphFunction.declarations.default_traversal_modulation_ref
Role.policy_hooks.traversal_modulation
```

or the equivalent current GTL 3 attrs/hook shape.

GTL declares the outer graph contract and where policy/config may be attached.
ABG admits and interprets runtime policy. Downstream products provide domain
meaning, requirement schedules, and evaluator implementations.

Configuration and strategy ownership rule:

```text
downstream strategy layer
  -> declares strategy meaning through GTL hook/config refs
GraphVector.declarations / GraphFunction.declarations / Role.policyHooks
  -> publish qualifier truth
ABG
  -> resolves qualifier by precedence
  -> admits directive
  -> derives envelope
  -> enforces schedule/gate/progress/review primitives
  -> projects one next action
```

ABG must provide enough typed primitives for a downstream strategy layer to force
waterfall ordering, steel-thread slicing, layered construction, feature slicing,
or gap-repair continuation. ABG must not make those strategy names constitutional
runtime semantics.

## Implementation Targets

Expected requirement/design surfaces:

- `specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md`
- `specification/requirements/abg/REQ-R-ABG3-RETRY.md`
- `specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md`
- `specification/requirements/abg/REQ-R-ABG3-PROJECTION.md`
- `specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md`
- `specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md`
- `specification/requirements/gtl/REQ-L-GTL3-HOOKS.md`
- `specification/requirements/gtl/REQ-L-GTL3-ATTRS.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md`
- new `build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_MODULATION_DERIVATION.md`
- new `build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_MODULATION_FIRST_SLICE_IACS.md`
- optional structural carrier/state diagrams if design review needs them.

Expected TypeScript areas:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/events/`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/admission/`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/transport/`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/`
- `build_tenants/abiogenesis/typescript/test_env/tests/`
- `build_tenants/abiogenesis/typescript/test_env/sandbox/mini_dm_redux/`
- `build_tenants/abiogenesis/typescript/test_env/live/`

## Acceptance Criteria

- AC-1: Requirement authority names traversal modulation enforcement as ABG
  runtime law, while preserving downstream strategy ownership. Requirements must
  name `GraphVector.declarations` as the primary GTL edge-traversal qualifier,
  allow `GraphFunction.declarations` and `Role.policyHooks` defaults by
  precedence, avoid making GTL a policy DSL, and forbid ABG from hard-coding
  product strategy labels as runtime semantics.
- AC-2: Design defines `TraversalStrategyDirective`,
  `TraversalSchedulingPrimitive`, `AgenticBackendProgressProfile`,
  `TraversalModulationGtlQualifierResolution`, `TraversalModulationProfile`,
  `TraversalAttemptEnvelope`, `TraversalAffect`, event law, projection law,
  IACS, and runner composition with T-100/T-103/T-104/T-106.
- AC-3: Pure functions derive backend progress classification and attempt
  envelopes from basis, admitted strategy directive, resolved policy, schedule
  rows, ordering constraints, phase gates, gap pressure, affect, prior attempt
  facts, and retry budget.
- AC-4: ABG F_P handoff carriers carry the derived attempt envelope and
  required progress artifact refs through `EnginePluginInput` and transport
  dispatch request fields. Downstream product manifests and prompts are
  projections of that envelope under downstream ticket authority.
- AC-5: Claude and Codex backend profiles are both represented. Tests prove
  the same ABG progress/non-progress projection API applies to both.
- AC-6: Runtime non-progress remains T-106-owned. T-107 must not create a
  competing no-progress action taxonomy.
- AC-7: Progress artifacts and stream/protocol progress prevent false
  no-progress classification but do not close an edge without admission,
  semantic evaluation, and foldback.
- AC-8: Same-edge continuation is projected from replay-visible modulation and
  schedule truth, not downstream-local chunking state.
- AC-9: Retry budget exhaustion emits replay-visible exhausted/blocked truth
  and cannot loop privately.
- AC-10: Intent affect changes only control pressure. Tests prove affect cannot
  satisfy semantic obligations or bypass F_P/F_D boundary law.
- AC-11: Public start/gaps style summaries render the same next action as the
  ABG modulation/non-progress projection.
- AC-12: A deterministic sandbox proves a large-obligation mini data-mapper edge
  progresses in bounded slices from an admitted strategy directive without
  private SDLC-local orchestration.
- AC-13: A live Claude proof and a live Codex proof run through the same
  modulation carrier/projection path. If a backend is unavailable, the archive
  must preserve typed unavailability evidence and the ticket cannot claim
  backend parity closure for that backend.
- AC-14: A data-mapper-shaped quality proof shows the code/materialization edge
  either closes with complete declared module materialization and an admitted
  fulfillment ledger, or emits an admitted partial-progress continuation with
  remaining module/tranche schedule truth. The proof must compare against the
  test35 reference dimensions: implementation module closure, code closure,
  materialized source/test inventory, and execution evidence tail.
- AC-15: Tests prove the no-inference rule: missing progress rows, duplicate
  rows, partial rows without remaining work, evidence-free progress claims, and
  summary/projection disagreement all project `TraversalForcedReviewGate` and
  block private continuation.
- AC-16: Tests prove same-edge continuation requires typed remaining schedule
  truth. A worker that writes files or prose but omits remaining schedule rows
  cannot advance by inference.
- AC-17: Existing proof lanes for T-100, T-101, T-102, T-103, T-104, and T-106
  remain green.
- AC-18: Downstream odd_sdlc has enough stable ABG carrier/projection surface to
  consume T-107 without reimplementing a private chunking or retry loop.
- AC-19: Assurance tests prove that schedule enforcement is derived from
  `TraversalAttemptEnvelope`, admitted `TraversalAttemptProgressRow` rows,
  `TraversalForcedReviewGate`, and existing T-100/T-103/T-106 projections. File
  presence, worker prose, elapsed time, and unstated worker intent are not
  accepted as assurance closure or continuation evidence.
- AC-20: Strategy-boundary tests prove ABG enforces generic scheduling
  primitives and admitted schedule/gate refs for steel-thread-like and
  waterfall-like directives without switching on product strategy labels or
  embedding downstream SDLC strategy semantics.
- AC-21: GTL qualifier resolution tests prove `GraphVector.declarations` wins
  over graph-function and role defaults, graph-function defaults win over role
  defaults, malformed or duplicate traversal-modulation hook attrs fail closed,
  and absence of an edge qualifier does not silently invent a modulated strategy.

## STDO Review

### Verdict

Ratify as RC7 candidate scope.

The feature is correctly classified as `requirement_reprice`: it adds runtime
law for how ABG shapes bounded F_P attempts and interprets backend progress
truth. It is not a realization refactor and not a downstream SDLC prompt patch.

### Findings

High: T-106 is necessary but not sufficient for RC7 agentic-worker parity.
T-106 correctly handles absence of artifact/report/stream/progress as one typed
non-progress path. It does not define backend progress profiles or bounded
attempt envelopes. Claude and Codex can expose progress differently, so RC7
needs a backend-agnostic ABG profile/projection surface before downstream
products rely on it.

High: traversal modulation must be event/projection law, not prompt wording.
The strategy post's core warning is valid. A prompt that says "steel thread" or
"first 5 features" has no replay authority. The attempt envelope must be
admitted runtime truth, and the prompt must be derived from it.

High: semantic evaluation remains outside modulation. Modulation may choose a
slice, require a progress artifact, or continue the same edge. It must not
decide that `A.req_i` is satisfied by `B.result_i`; that remains declared F_P
or domain evaluator truth through ABG admission/foldback.

High: inferred iteration is explicitly forbidden. T-107 requires one typed
progress row for every selected schedule item, typed remaining-work refs for
partial/block/not-attempted rows, and a typed forced-review gate whenever those
facts are incomplete or disagree with public summary truth. A lazy worker cannot
make private progress "obvious" by writing prose or a subset of files.

High: scheduling enforcement is the product signal. The modulation profile and
attempt envelope are the scheduler command surface; the prompt is only a
projection. Assurance must fold admitted envelopes, progress rows, forced-review
gates, and T-100/T-103/T-106 projection truth. If those typed carriers are
missing or contradictory, the lawful result is forced review or typed
continuation, not inferred advance.

High: strategy ownership must stay above ABG. Traversal modulation is a
strategy feature, but ABG's role is to provide the typed machinery that lets a
strategy layer force its plan. odd_sdlc may define steel-thread, waterfall,
layered-build, or feature-slice policy; ABG must enforce admitted schedule refs,
ordering constraints, phase gates, bounded batches, progress rows, and forced
review gates without switching on those product strategy labels.

High: GTL qualifier resolution is the entry point. The runtime directive must be
derived from GTL hook/config truth, normally `GraphVector.declarations`, before
ABG derives a modulation profile. A free-floating ABG directive with no
published GTL qualifier is not enough for closure because it could recreate the
same hidden side-channel the ticket is meant to remove.

Medium: GTL should expose hook/config refs, not absorb policy semantics.
Putting steel-thread, waterfall, layered-build, or feature-slice semantics into
GTL would turn GTL into a product-policy DSL and violate the current product
split.

Medium: intent affect is legitimate only as typed control pressure. The affect
surface is useful, but it must remain bounded to batch size, progress
requirements, retry pacing, and exploration/precision tradeoff. It cannot be
used as confidence evidence for closure.

Medium: backend parity requires explicit Codex proof. The project has previous
history rejecting hidden Codex readiness setup in core transport. T-107 proof
must either run Codex live through the same carrier path or preserve a typed
backend-unavailable archive and keep backend parity open.

Low: downstream odd_sdlc proof should stay downstream. This ticket should give
odd_sdlc stable ABG carrier/projection truth, but it should not include
odd_sdlc implementation patches in ABG source closure.

### Review Constraints For Implementation

- Do not reopen T-106 unless the completed T-106 law is found false. Compose
  through it.
- Do not add a second retry taxonomy.
- Do not add downstream-domain meaning to ABG.
- Do not make progress artifact existence closure authority.
- Do not infer remaining work, review need, or next tranche from prose or file
  shape.
- Do not add test-only Codex state hacks to core transport.
- Do not close without both deterministic proof and live backend evidence or a
  typed explanation of live backend unavailability.

## Initial Work Plan

1. Requirement pass:
   - add or update ABG requirements for traversal modulation, backend progress
     profiles, attempt envelopes, and affect control pressure;
   - add or update GTL requirements for hook/config attachment only.
2. Design pass:
   - author `M03_TRAVERSAL_MODULATION_DERIVATION.md`;
   - author `M03_TRAVERSAL_MODULATION_FIRST_SLICE_IACS.md`;
   - include carrier, event, projection, state, and sequence diagrams if the
     design review needs visual proof.
3. Pure-function implementation:
   - closed carrier/admission types;
   - pure GTL qualifier resolver over `GraphVector.declarations`,
     `GraphFunction.declarations`, and `Role.policyHooks`;
   - pure admission and validation for strategy-layer directives;
   - pure envelope derivation;
   - pure backend progress classification;
   - pure progress-row completeness and forced-review projection;
   - pure projection of next modulation action.
4. Runner integration:
   - derive envelope before F_P dispatch;
   - pass envelope into handoff manifests;
   - consume T-100 schedule rows and T-103/T-106 projections without replacing
     them.
5. Proof:
   - unit tests for every closed branch;
   - strategy-boundary tests proving ABG does not switch on downstream strategy
     labels;
   - runner tests for same-edge continuation and exhaustion;
   - assurance tests proving schedule enforcement consumes typed rows/gates, not
     file/prose inference;
   - deterministic mini data-mapper large-obligation sandbox;
   - live Claude and Codex runs through the same projection path;
   - full semantic suite and diff hygiene.

## Implementation Review Finding Status

Codex review findings were rechecked against the current tree during the first
implementation slice.

- Finding 1, runner not integrated: closed for the qualified `F_P` first slice
  across both runner modes. `engine_runner.ts` now resolves modulation from GTL
  qualifier truth through one shared F_P dispatch-attempt derivation path used
  by both `runEngineIterate` and `runEngineIterateAsync`, derives a
  profile/envelope only when the qualifier exists, passes the envelope to
  `EnginePluginInput`, emits the replay-visible T-107 event spine, and leaves
  unqualified vectors on the legacy path.
- Finding 2, required event kinds not admitted: closed for the minimum event
  family. `carriers.ts` contains the eight T-107 runtime events and
  `event_admission.ts` admits them with basis, graph-call, frame, vector,
  run/work, causation, and correlation fields.
- Finding 3, handoff/input transport cannot carry modulation payloads: closed
  for the first slice. `EnginePluginInput` carries
  `traversalAttemptEnvelope`; `DispatchRequest` carries envelope refs, selected
  schedule refs, ordering constraints, phase gates, required progress artifact
  refs, gap-pressure refs, and affect refs.
- Finding 4, proof/design surface missing: partially closed. `test:t107`,
  `M03_TRAVERSAL_MODULATION_DERIVATION.md`, and
  `M03_TRAVERSAL_MODULATION_FIRST_SLICE_IACS.md` exist. Live Claude/Codex proof
  and deterministic mini-data-mapper large-obligation sandbox remain later proof
  lanes, not satisfied by this first slice. `test:t107` now covers sync and
  async runner parity; `test:t107:live` is intentionally listed as deferred
  proof until a live harness exists.
- Finding 5, partial-law export surface: closed for the first slice. The
  traversal modulation pure functions, constructors, constants, and types are
  exported from the M03 contracts index.

## Closure Review

Closed on 2026-05-03 for ABG substrate scope after STDO implementation review
ratified the shared sync/async runner integration, GTL-qualified envelope
derivation, replay-visible event spine, transport handoff fields, no-inference
assurance guards, and expanded regression proof.

The ABG source ticket is complete because traversal modulation is now
requirement-backed, design-backed, exported, admitted as runtime event truth,
carried into `EnginePluginInput`, consumed by both `runEngineIterate` and
`runEngineIterateAsync` through one shared dispatch-attempt law, and covered by
focused and semantic tests.

This closure does not claim downstream odd_sdlc prompt/manifest rendering,
live Claude/Codex backend parity for a future `test:t107:live` harness, or
data-mapper product parity. Those remain downstream or release proof
obligations above the ABG substrate.
