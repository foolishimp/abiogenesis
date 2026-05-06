---
id: T-120
title: Declare ABG Event Calculus runtime law before temporal algebra
type: feature
ticket_category: event_calculus_runtime_law
status: completed
goal: rc-next-declarative-abg-event-calculus-substrate
change_intent: Make ABG's Event Calculus commitment explicit as declared event-to-fluent law so T-119 temporal algebra can be built over `HoldsAt`, `Initiates`, `Terminates`, clipping, and initial-condition truth instead of over another imperative projection switch.
change_class: requirement_reprice
re_entry_point: requirements
affected_boundary:
  - specification/INTENT.md
  - specification/PRODUCT.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-CORRECTION.md
  - specification/requirements/abg/REQ-R-ABG3-RUN.md
  - specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md
  - specification/requirements/abg/REQ-R-ABG3-RETRY.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - build_tenants/abiogenesis/typescript/design/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/
  - build_tenants/abiogenesis/typescript/test_env/tests/
priority: high
build_tenant: typescript
release_scope: prerequisite-for-T-119
triaged_at: 2026-05-06T22:36:29+10:00
created_at: 2026-05-06T22:36:29+10:00
updated_at: 2026-05-07T01:05:01+10:00
reopened_at: 2026-05-06T23:33:27+10:00
reopened_again_at: 2026-05-07T00:57:24+10:00
closed_at: 2026-05-07T01:05:01+10:00
owning_repo: abiogenesis
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
blocks:
  - T-119 design GTL time algebra and schedule domain module
dependencies:
  - T-106 completed typed traversal non-progress continuation and summary agreement
  - T-107 completed ABG traversal modulation profiles for agentic F_P attempts
  - T-118 backlog complete ABG defaults bundle expansion after plugin observer slice
evidence_refs:
  - /Users/jim/src/apps/abiogenesis/specification/INTENT.md
  - /Users/jim/src/apps/abiogenesis/specification/PRODUCT.md
  - /Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - /Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - /Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/carriers.ts
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_admission.ts
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/projection.ts
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/m03/events/emit.ts
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/events.py
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/projection.py
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/correction.py
related_tickets:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-119-design-gtl-time-algebra-and-schedule-domain-module.md
follow_up_tickets:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/backlog/T-121-complete-abg-event-calculus-projection-parity-beyond-first-lifecycle-slice.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/backlog/T-123-add-abg-method-trace-and-design-module-closure-guard.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-124-prove-functional-gtl-temporal-syntax-sandbox-and-live-lanes.md
proof_commands:
  - npm run build:semantic
  - npm run test:t120
  - npm run test:semantic
current_evidence:
  - test:t120 proves declared Initiates/Terminates/HoldsAt, inertia, clipping, malformed fluent rejection, undeclared event rejection, duplicate/contradictory axiom rejection, and aggregate closure parity.
  - aggregate projection consumes EC effects for graph-call open, frame open, and vector closure.
  - T-124 reran T-120 as part of the temporal syntax proof and kept the EC lint surface clean.
  - test:semantic passed with 428 tests after T-124.
intake_source: Operator supplied Claude assessment that ABG is structurally Event-Calculus-shaped but only about 65 percent explicit: append-only event truth and replay projection exist, but `HoldsAt`, `Initiates`, `Terminates`, `InitiallyP`, `InitiallyN`, derived-fluent/ramification, and clipping/declipping law are not declared as a first-class runtime relation. Operator identified this as a prerequisite for implementing T-119 correctly.
target_truth: ABG TypeScript declares a replay-checkable Event Calculus law surface. Runtime event kinds map through explicit `Initiates` and `Terminates` declarations to named fluents; `HoldsAt` is derived by one replay function over admitted events, initial conditions, clipping, and derived-fluent rules; projections consume that declared law instead of privately encoding semantic state transitions in unrelated switch statements. The declared EC law remains ABG-owned runtime law, not GTL language semantics, product policy, provider state, or downstream controller logic.
superseded_truth: ABG relies on Event Calculus as constitutional vocabulary while current-state truth is encoded only as imperative event-kind switches, ad hoc reset checks, projection-local status mutation, and comments using EC terms without a declared predicate surface.
closure_law: Close the first EC runtime-law slice only when requirements, design, TypeScript carriers, projection functions, and tests establish a declarative EC transition surface for core lifecycle fluents, gate aggregate graph-call/frame/vector closure through declared EC effects, and make T-119 first-slice temporal carriers expressible as additional EC event/fluent declarations.
non_closure_conditions:
  - `HoldsAt`, `Initiates`, `Terminates`, initial conditions, clipping, or derived fluents exist only in prose or comments.
  - The selected core lifecycle projection path still owns semantic state-transition law that is not traceable to the declared EC mapping.
  - A reset or correction can shadow runtime truth without explicit clipping/termination law.
  - TypeScript temporal work can add `timer_fired`, `deadline_breached`, or `scheduled_continuation_reopened` without first declaring their EC impact.
  - Python reference behavior is treated as sufficient closure for the TypeScript primary release line.
  - The EC layer becomes a second runtime controller rather than a declared replay/projection law over admitted events.
  - The Event Calculus structural carrier diagram is a flow sketch rather than a DESIGN_MODULE_METHOD-compliant classDiagram with carrier roles, visibility, and stereotypes.
---

# T-120: Declare ABG Event Calculus Runtime Law Before Temporal Algebra

## STDO Triage

### First Missing Layer

Requirements.

`INTENT.md` already commits ABG to Event Calculus over authoritative events,
runtime aggregates, and replay-derived fluents. The current TypeScript runtime
has the structural shape: typed runtime events, admission, append/replay
through the CLI event log, and replay-derived projections. The missing layer is
the explicit ABG requirement/design law that names how event kinds initiate and
terminate fluent truth.

This is not a broad runtime redesign. It is a seam-closure ticket: expose the
EC relation that is currently implicit in projection code so temporal law in
T-119 can compile into the same declared replay substrate.

### Lawful Re-Entry

`requirement_reprice`.

The active requirements should be sharpened before implementation so the
TypeScript design can distinguish:

- event admission truth;
- EC transition law;
- replay-derived fluent truth;
- projections over those fluents;
- product-policy or downstream interpretation above those projections.

## Current Reality

ABG has a partial EC realization:

- `Happens(e, t)` is approximated by admitted runtime events in the event log.
- `HoldsAt(f, t)` is approximated by replay-derived projection functions.
- Inertia exists structurally because projections preserve state until later
  transition events change it.
- `Initiates` and `Terminates` are implicit in event-kind switch statements.
- Reset/correction partially acts like clipping through scope checks and
  follow-up termination events.

That is strong enough to prove ABG is EC-shaped. It is not strong enough for
T-119 because temporal algebra needs declared event/fluent effects:

```text
timer_fired Initiates eligible(edge)
deadline_breached Initiates deadline_pressure(edge)
scheduled_continuation_reopened Initiates continuation_open(...)
timer_cancelled Terminates pending_timer(...)
```

Those cannot safely be hidden inside a temporal projection switch without
recreating the same implicit-law problem.

## Reopen Review Findings And Closure Checklist

The 2026-05-06 review found that T-120 was lawfully entered but prematurely
closed. The implementation created a useful EC substrate, but aggregate
projection still owned most transition truth by private switch. The reopened
ticket treats the existing implementation as partial proof, not closure.

The 2026-05-07 final design-module review found a remaining design closure
defect: the required Event Calculus structural carrier asset is present, but it
is a flow sketch rather than the structural carrier `classDiagram` required by
DESIGN_MODULE_METHOD.

Before this ticket may close again:

- [x] Keep the declared `RuntimeEventCalculusAxiom` table and pure replay
  projection.
- [x] Gate aggregate `vector_closed` through declared EC effects.
- [x] Gate aggregate `graph_call_opened` through declared EC effects.
- [x] Gate aggregate `frame_opened` through declared EC effects.
- [x] Add tests proving `graph_call_open`, `frame_open`, and `vector_closed`
  `HoldsAt` truth for the core aggregate path.
- [x] Decide whether continuation, retry, reset/correction, and derived-fluent
  projection parity must close in this ticket or be split into follow-up tickets.
- [x] Run `npm run test:t120`.
- [x] Run `npm run test:semantic`.
- [x] Record design-module-method review outcome and execution-authority audit
  before moving this ticket back to completed.
- [x] Replace `ABG_EVENT_CALCULUS_STRUCTURAL_CARRIER_DIAGRAM.md` with a bounded
  carrier `classDiagram` using the required prime/subordinate/downstream/effect
  stereotypes and visibility.
- [x] Confirm the EC diagram separates admitted event truth, axiom law, effect
  rows, replay projection, and downstream read models without introducing a
  second runtime controller.

## Design Module Review

outcome: accepted

Boundary stayed lawful after the ticket was narrowed to the first EC
runtime-law slice. Core lifecycle projection now checks declared EC effects for
graph-call open, frame open, and vector closure.

Execution authority remains single:

- EC replay derives `HoldsAt` read-model truth from admitted events;
- aggregate projection consumes EC effects for selected lifecycle facts;
- ABG iteration/projection still owns advancement, ordering, duplicate-closure,
  range, and traversal integrity checks;
- the EC layer does not choose graph advancement, retry, or closure directly.

Deferred deeper proof:

- T-121 owns continuation, retry, reset/correction, declipping, and derived-fluent
  projection parity beyond this first lifecycle slice.

Global consolidation opportunity:

- T-123 owns a local method-trace/design-closure guard and records whether the
  pattern should move to shared methodology.
- T-126 owns temporal runtime-scope and projection-row consolidation after the
  closure blockers are repaired.

2026-05-07 closure update:

- `ABG_EVENT_CALCULUS_STRUCTURAL_CARRIER_DIAGRAM.md` is now a bounded
  `classDiagram` with admitted event truth, axiom law, effects, fluent
  patterns, replay projection, downstream projections, and subordinate
  provider/policy payload refs separated.
- `ABG_EVENT_CALCULUS_IACS.md` records `RuntimeEventCalculusEffectRow` as a
  subordinate downstream projection row.
- `npm run test:t120` passed with 4 tests.
- `npm run test:t121` passed with 4 tests.
- `npm run test:semantic` passed with 443 tests.
- `npm run lint:semantic` and `npm run lint:test-harness` passed.

## Target Shape

Add a declared EC runtime-law surface to the TypeScript ABG line.

Candidate carrier family:

```ts
type RuntimeFluent =
  | RunFluent
  | GraphCallFluent
  | FrameFluent
  | ContinuationFluent
  | VectorFluent
  | ActorProcessFluent
  | PayloadLedgerFluent
  | AssuranceFluent;

interface EventCalculusAxiom {
  readonly kind: "event_calculus_axiom";
  readonly eventKind: RuntimeEvent["kind"];
  readonly initiates: readonly RuntimeFluentPattern[];
  readonly terminates: readonly RuntimeFluentPattern[];
  readonly clips: readonly RuntimeFluentPattern[];
  readonly declips: readonly RuntimeFluentPattern[];
}

interface InitialFluentAxiom {
  readonly kind: "initial_fluent_axiom";
  readonly scope: "basis" | "run" | "graph_call" | "frame" | "continuation";
  readonly initiallyP: readonly RuntimeFluentPattern[];
  readonly initiallyN: readonly RuntimeFluentPattern[];
}

interface DerivedFluentRule {
  readonly kind: "derived_fluent_rule";
  readonly fluent: RuntimeFluentPattern;
  readonly dependsOn: readonly RuntimeFluentPattern[];
  readonly ruleRef: string;
}
```

The exact carrier names are design-owned. The required property is that event
kind to fluent effect is declared, typed, testable, and consumed by projections.

## Required Design Outputs

- `ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION.md`
- `ABG_EVENT_CALCULUS_IACS.md`
- `ABG_EVENT_CALCULUS_STRUCTURAL_CARRIER_DIAGRAM.md`
- `ABG_EVENT_CALCULUS_PROJECTION_REFACTOR_PLAN.md`
- `ABG_EVENT_CALCULUS_T119_TEMPORAL_EXTENSION_CONTRACT.md`

The design must explicitly separate:

- admitted runtime event;
- EC axiom declaration;
- replay interpreter;
- projection read model;
- downstream public summary;
- product policy.

## Required Implementation Slice

Implement the smallest useful TypeScript slice:

1. Declare EC carrier types and an axiom table for a bounded set of existing
   runtime events.
2. Implement a pure replay function that derives `HoldsAt` over those declared
   fluents.
3. Refactor one existing projection path to consume the declared EC layer
   without changing externally observed behavior.
4. Add parity tests proving the EC projection matches the previous projection
   for the selected event set.
5. Add negative tests for undeclared event kind, malformed fluent pattern,
   duplicate contradictory axioms, and reset/clipping scope mismatch.

The first event set should be small but representative:

- `basis_admitted`
- `graph_call_opened`
- `frame_opened`
- `vector_traversal_planned`
- `vector_evaluated`
- `vector_closed`
- `retry_repair_planned`
- `continuation_terminated`
- `continuation_reopened`
- `reset`

If the implementation discovers a smaller first slice that still proves
initiation, termination, inertia, clipping, and projection parity, update this
ticket before coding the alternate slice.

## T-119 Dependency Contract

T-119 may start requirements/design drafting against this ticket, but it must
not implement temporal runtime behavior until T-120 closes or is explicitly
repriced.

T-119 temporal carriers must be expressible as additional EC declarations:

- `TimerIntent` initiates pending timer obligation truth.
- `TimerOutcome(timer_fired)` terminates pending timer truth and initiates
  eligibility when dependency and policy truth hold.
- `window_opened` and `window_closed` initiate and terminate window eligibility.
- `deadline_breached` derives from schedule policy plus absence of certified
  outcome at the declared temporal boundary.
- `ScheduledContinuation` holds only by replay over open, expired, cancelled,
  superseded, and closed continuation truth.

## First-Slice Closure Criteria

- Requirements name ABG Event Calculus runtime law explicitly enough that the
  first slice can declare `HoldsAt`, `Initiates`, `Terminates`, initial truth,
  clipping, declipping, and derived-fluent carrier shapes instead of leaving
  them as implementation folklore.
- TypeScript design defines the IACS for EC law without making EC a second
  controller or GTL language feature.
- A typed axiom surface maps a bounded set of existing `RuntimeEvent.kind`
  values to fluent initiation and termination.
- A pure replay function derives `HoldsAt` from admitted events, initial
  fluents, clipping, and derived rules.
- At least one existing projection consumes the declared EC layer.
- Tests prove parity with the prior projection for graph-call open, frame open,
  and vector closure.
- Tests prove `HoldsAt`, inertia, clipping/reset, malformed axiom failure,
  duplicate contradictory axiom failure, and undeclared event failure.
- T-119 is updated or already references this ticket as a prerequisite.
- T-121 carries continuation, retry, reset/correction, declipping behavior, and
  derived-fluent parity beyond this first lifecycle slice.

## Non-Closure Conditions

This ticket is not closed by:

- adding EC words to comments without a typed relation;
- adding a helper that mirrors one projection switch without declaring reusable
  event-to-fluent law;
- treating Python reference-line EC shape as sufficient for the TypeScript
  release line;
- implementing temporal event kinds before existing runtime events have a
  declared EC substrate;
- allowing selected first-slice projections to keep private transition law while
  claiming first-slice EC closure;
- claiming continuation, retry, reset/correction, declipping, or derived-fluent
  projection parity without completing T-121 or equivalent repricing;
- introducing a query DSL, rule engine, or controller that can select graph
  advancement outside ABG iteration.
