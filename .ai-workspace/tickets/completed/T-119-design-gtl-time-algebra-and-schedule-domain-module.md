---
id: T-119
title: Design GTL time algebra and schedule domain module
type: spike
ticket_category: temporal_gtl_algebra
status: completed
goal: rc-next-schedule-native-gtl-time-algebra
change_intent: Reprice GTL and ABG temporal capability so time is modeled as replay-visible eligibility, expiry, recurrence, deadline, and scheduled-continuation law over graph functions rather than as a hidden scheduler or wall-clock controller.
change_class: requirement_reprice
re_entry_point: requirements
affected_boundary:
  - specification/INTENT.md
  - specification/PRODUCT.md
  - specification/requirements/gtl/
  - specification/requirements/abg/
  - specification/requirements/product/
  - build_tenants/abiogenesis/typescript/design/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/
  - build_tenants/abiogenesis/typescript/test_env/tests/
priority: high
build_tenant: typescript
release_scope: 3.6.0-rc.1
triaged_at: 2026-05-06T22:20:25+10:00
created_at: 2026-05-06T22:20:25+10:00
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
dependencies:
  - T-120 completed first declarative ABG Event Calculus runtime-law slice
  - T-100 completed zoomed workspace-asset obligation schedule and foldback evaluation
  - T-107 completed ABG traversal modulation profiles for agentic F_P attempts
  - T-112 completed per-edge traversal strategy through GTL config
  - B-007 completed progress lease replacing wall-clock F_P timeout
evidence_refs:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260426T105055Z_STRATEGY_gtl-time-algebra-temporal-theory.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/comments/claude/20260326T061936_REVIEW_pluggable-synthesis-strategy-response.md
  - /Users/jim/src/apps/abiogenesis/specification/INTENT.md
  - /Users/jim/src/apps/abiogenesis/specification/PRODUCT.md
  - /Users/jim/src/apps/abiogenesis/specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - /Users/jim/src/apps/abiogenesis/specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - /Users/jim/src/apps/abiogenesis/specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - /Users/jim/src/apps/abiogenesis/specification/requirements/gtl/REQ-L-GTL3-JOB.md
  - /Users/jim/src/apps/abiogenesis/specification/requirements/gtl/REQ-L-GTL3-RULE.md
  - /Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - /Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - /Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md
  - /Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-RETRY.md
  - /Users/jim/src/apps/abiogenesis/specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - /Users/jim/src/apps/abiogenesis/specification/requirements/product/REQ-P-POLICY.md
downstream_consumers:
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/completed/T-093-add-governed-scheduling-phase-between-design-and-realization.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/completed/B-079-decompose-test-execution-schedule-into-bounded-shards.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/completed/T-123-consume-per-edge-traversal-strategy-and-delay-steel-thread-scope.md
follow_up_tickets:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/backlog/T-122-deepen-gtl-temporal-algebra-for-deadline-recurrence-and-schedule-policy-proof.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/backlog/T-123-add-abg-method-trace-and-design-module-closure-guard.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-124-prove-functional-gtl-temporal-syntax-sandbox-and-live-lanes.md
proof_commands:
  - npm run build:semantic
  - npm run test:t119:gtl
  - npm run test:t119:sandbox
  - npm run test:t119:live
  - npm run test:t119
  - npm run test:semantic
current_evidence:
  - test:t119 proves not_before eligibility, admitted timer outcome authority, scheduled continuation replay, provider non-authority, cancellation/missed behavior, and homeostatic drift separation.
  - T-124 added executable `GraphVector.declarations["abg.temporal_constraint"]` syntax, fail-closed GTL parser coverage, sandbox proof, and live provider-admission proof.
  - T-119 design surfaces are under build_tenants/abiogenesis/typescript/design/.
  - test:semantic passed with 428 tests after T-124.
intake_source: Operator supplied Claude review of Codex strategy `20260426T105055Z_STRATEGY_gtl-time-algebra-temporal-theory.md` and requested an STDO backlog ticket for the timing, scheduling, and time-type design proposal.
target_truth: GTL declares temporal law as an eligibility dimension over graph functions and graph vectors. ABG admits temporal runtime events, derives temporal projections by replay, opens or reopens scheduled continuations when dependency and policy truth allow, and remains the only iterator that authorizes graph advancement. Schedule domain policy owns calendars, recurrence, misfire, catch-up, blackout, and deadline consequence semantics. Provider timers deliver effects only through admitted timer outcome events. SLA and schedule drift feed a separate homeostatic evaluation surface rather than edge-completeness closure.
superseded_truth: Cron, Step Functions, Temporal, cloud timers, runner loops, prompts, local wall-clock reads, or downstream schedule documents decide graph advancement, closure, deadline truth, recurrence instances, or retry timing outside admitted GTL/ABG temporal carriers.
closure_law: Close the first temporal algebra proof slice only after T-120 has completed the prerequisite EC first slice, temporal event carriers preserve required policy and provider identity, design-module review records local/global consolidation results, and broader temporal operators are honestly deferred by ticket reprice.
non_closure_conditions:
  - T-120 remains open without explicit reprice and temporal runtime behavior is implemented anyway.
  - Temporal behavior exists only as runner code, prompt prose, cron config, Step Functions state, or test fixture convention.
  - `Date.now()`, elapsed wall-clock, or provider state directly decides semantic eligibility, closure, retry, or deadline truth.
  - A schedule provider can select the next graph vector or emit authoritative runtime truth without ABG admission.
  - Temporal carriers are inflated by promoting every calendar, duration, recurrence, provider receipt, or timezone payload into a peer authority surface.
  - SLA drift is folded into edge-completeness closure instead of remaining a separate homeostatic evaluation and repricing input.
  - Deadline breach behavior is hard-coded in ABG rather than selected through admitted schedule policy.
  - Recurrence fragments provenance by creating fresh graph-call instances when scheduled continuation over the existing graph-function boundary would preserve closure and proof truth.
  - A new evaluator regime is introduced without first proving why existing F_D/F_P/F_H regime law cannot express temporal evaluation over replay-derived fluents.
  - The temporal structural carrier diagram is a flow sketch rather than a DESIGN_MODULE_METHOD-compliant classDiagram with carrier roles, visibility, and stereotypes.
  - The temporal IACS or structural diagram omits the active `DeadlineBreach` carrier added by the selected T-122 deadline-breach slice.
---

# T-119: Design GTL Time Algebra And Schedule Domain Module

## STDO Triage

### First Missing Layer

Requirements.

The proposal changes GTL capability law. It is not just an ABG runtime design
or a cloud scheduling implementation. The first re-entry point is therefore
`requirement_reprice`, followed by downstream `design_reframe` slices for ABG
runtime interpretation, schedule-domain policy, provider contracts, and the
TypeScript proof surface.

### Lawful Re-Entry

`requirement_reprice`.

The ticket may update intent/product wording only if the requirement reprice
finds that current product definition does not already preserve the needed
GTL/ABG boundary. It must not start by adding runtime timers, cloud callbacks,
or build-tenant schedule code.

## Proposal Review

The Codex strategy is accepted as the controlling draft proposal for this
ticket. Its central law is:

```text
time changes eligibility;
ABG remains the iterator.
```

The strategy already establishes the correct authority split:

- GTL declares temporal law over eligibility, expiry, recurrence, deadline, and
  scheduled continuation.
- ABG admits temporal runtime events and derives replay-visible temporal
  projection truth.
- A schedule domain module owns calendar, recurrence, misfire, catch-up,
  blackout, and deadline consequence policy.
- Provider timers and cloud durables deliver effects; they do not authorize
  graph transitions.
- ABG traversal evaluation remains separate from post-evaluation homeostatic
  schedule/SLA drift evaluation.

The Claude review adds five design constraints that this ticket must resolve:

1. Temporal constraint attachment must be decided before implementation. The
   initial working decision is `GraphVector` for per-edge eligibility and `Job`
   for outcome-level deadlines. `GraphFunction` may carry contract-level
   defaults. `Context` should carry `TemporalContext`, not graph-attached
   constraints. `Rule` is not the primary attachment point unless the design
   proves a distinct need.
2. Recurrence should default to `ScheduledContinuation` over the existing
   graph-function boundary. Fresh graph-call instances require explicit design
   justification because they can fragment provenance and closure truth.
3. Deadline breach outcome should be selected by `SchedulePolicy`. ABG must not
   hard-code terminal failure, yield, human gate, retry, or repricing as the
   one semantic answer.
4. Temporal evaluation must be named without silently adding a fourth evaluator
   regime. The design should either define a temporal evaluator pattern as F_D
   over replay-derived temporal fluents, or explicitly reprice evaluator regime
   law before introducing anything like `F_T`.
5. The seven temporal carriers must be restated in Event Calculus terms so the
   contract is replay-checkable: `Initiates`, `Terminates`, and `HoldsAt` over
   admitted temporal events and replay-derived fluents.

## Reopen Review Findings And Closure Checklist

The 2026-05-06 review found that this ticket was previously closed as if the
first runtime slice satisfied the whole temporal design ticket. The code also
failed the newly introduced event requirement because timer outcome and
scheduled-continuation events did not preserve all required policy/provider
identity through carrier and admission surfaces.

The 2026-05-07 final design-module review found another closure defect: the
temporal structural carrier asset exists, but it is a `flowchart` sketch rather
than a method-conformant structural `classDiagram`, and it did not include the
active `DeadlineBreach` carrier after the T-122 deadline-breach slice.

Before this ticket may close again:

- [x] Add `schedulePolicyRef` admission proof for `timer_outcome_admitted`.
- [x] Add `providerRef` admission proof for `timer_outcome_admitted`.
- [x] Add `schedulePolicyRef` admission proof for
  `scheduled_continuation_reopened`.
- [x] Add `providerRef` admission proof for `scheduled_continuation_reopened`.
- [x] Add positive tests proving admitted temporal outcome/continuation events
  preserve policy/provider identity.
- [x] Decide whether deadline breach, recurrence coalescing, schedule-policy
  drift failure, and broader schedule-domain policy proof remain in T-119 or
  move to follow-up tickets.
- [x] Run `npm run test:t119`.
- [x] Run `npm run test:semantic`.
- [x] Record design-module-method review outcome and local/global consolidation
  opportunities before moving this ticket back to completed.
- [x] Replace `GTL_TIME_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md` with a bounded
  carrier `classDiagram` using the required prime/subordinate/downstream/effect
  stereotypes and visibility.
- [x] Ensure the temporal IACS and diagram both include the selected T-122
  `DeadlineBreach` carrier and keep recurrence/window families explicitly
  deferred.
- [x] Rerun the focused temporal live lanes after the diagram repair.

## Design Module Review

outcome: accepted

Boundary stayed lawful after the ticket was narrowed to the first temporal proof
slice. The broader temporal design remains valid, but deadline breach,
recurrence, window, schedule-policy consequence, and deeper drift proof are not
claimed as closed by this ticket.

Local cleanup absorbed before closure:

- added missing policy/provider identity to temporal outcome and scheduled
  continuation carriers;
- added fail-closed admission tests for missing policy/provider identity;
- kept provider payloads as effects that become truth only through ABG-admitted
  events.

Deferred deeper proof:

- T-122 owns deadline, recurrence, window, schedule-policy consequence, and
  broader homeostatic drift proof.

Global consolidation opportunity:

- T-123 owns a local method-trace/design-closure guard and records whether the
  pattern should move to shared methodology.
- T-126 owns temporal runtime-scope and projection-row consolidation after the
  closure blockers are repaired.

2026-05-07 closure update:

- `GTL_TIME_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md` is now a bounded
  `classDiagram` with carrier roles, visibility, subordinate rows, and deferred
  recurrence/window families.
- `GTL_TIME_ALGEBRA_IACS.md` includes `DeadlineBreach` and
  `TemporalHomeostaticProjection`, with projection rows kept subordinate.
- `npm run test:t119` passed with 17 tests.
- `npm run test:semantic` passed with 443 tests.
- `npm run lint:semantic` and `npm run lint:test-harness` passed.

## Target Capability

Define a schedule-native GTL extension where temporal law is an orthogonal
constraint over graph evolution:

```text
eligible(edge, replay) =
  dependency_truth_closed(edge, replay)
  AND temporal_truth_allows(edge, replay)
  AND policy_truth_allows(edge, replay)
```

Initial algebra candidates:

```text
time_context(calendar, timezone, clock_ref)
window(graph_function_or_vector, time_window)
deadline(graph_function_or_vector, deadline_policy)
not_before(graph_function_or_vector, instant_or_event_ref)
not_after(graph_function_or_vector, instant_or_event_ref)
retry_after(graph_function_or_vector, duration)
cooldown(graph_function_or_vector, duration)
recurs(job_or_graph_function, recurrence_policy)
until(graph_function_or_vector, temporal_condition)
```

These compile to temporal constraints over existing GTL carriers. They do not
create a rival schedule graph or a scheduler-owned control loop.

## Irreducible Carrier Set

The first design pass must publish an IACS and keep subordinate payloads
subordinate by default.

Prime carrier families:

- `TemporalContext`
- `TemporalConstraint`
- `SchedulePolicy`
- `TimerIntent`
- `TimerOutcome`
- `ScheduledContinuation`
- `TemporalProjection`

Likely subordinate payloads:

- `ClockRef`
- `CalendarRef`
- `TimezoneId`
- `InstantRef`
- `IntervalRef`
- `DurationSpec`
- `RecurrenceRule`
- `MisfirePolicy`
- `CatchUpPolicy`
- `TimerProviderRef`
- `TimerProviderReceipt`

## Required Design Outputs

This ticket closes through design assets, not by immediate runtime feature work.

Required outputs:

- requirement reprice for temporal GTL capability;
- `GTL_TIME_ALGEBRA_DERIVATION.md`;
- `GTL_TIME_ALGEBRA_IACS.md`;
- `GTL_TIME_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md`;
- `ABG_SCHEDULE_RUNTIME_DERIVATION.md`;
- `SCHEDULE_DOMAIN_MODULE_DERIVATION.md`;
- `SCHEDULE_RUN_PROJECTION_AND_SLA_ANALYTICS.md`;
- `SLA_TELEMETRY_HOMEOSTATIC_FEEDBACK.md`;
- `HOMEOSTATIC_LOOP_AFTER_EVAL_EVENT_DERIVATION.md`;
- `TWO_STAGE_EVALUATION_MODEL.md`;
- provider contract sketch for Step Functions or an equivalent cloud timer;
- module-derived proof plan for the first deterministic slice.

## Event Calculus Contract

The design must translate temporal carriers into the existing INTENT-level
commitment to Event Calculus over authoritative events.

Minimum EC mapping to prove:

- `TimerIntent` initiates pending timer obligation truth.
- `TimerOutcome(timer_fired)` terminates pending timer obligation truth and
  initiates temporal eligibility for the governed boundary when dependency and
  policy truth also hold.
- `window_opened` and `window_closed` initiate and terminate window eligibility
  fluents.
- `deadline_breached` is derived from admitted deadline policy, replay time
  truth, and absence of the required certified outcome at the relevant temporal
  boundary.
- `ScheduledContinuation` holds only when replay proves an open temporal
  continuation with no admitted expiration, cancellation, supersession, or
  closure event.
- `TemporalProjection` is a replay-derived read model and must not outrank the
  source event ledger.

This ticket's closed proof slice covers the timer intent, fired/cancelled/missed
timer outcome, scheduled continuation reopen, provider non-authority, and
homeostatic separation parts of that mapping. Window, deadline, recurrence, and
deeper schedule-policy consequence proof are intentionally moved to T-122.

## First Proof Slice

The first proof should be deliberately small:

```text
one graph function
one not_before constraint
one timer provider stub
one timer_fired event
one replay-derived scheduled continuation reopen
one final closure under ABG iteration
one schedule-vs-actual gap projection
one SLA drift observation feeding the homeostatic model
one ABG.eval -> eval.event -> homeostatic route proof
one proof that traversal completion and homeostatic drift evaluation stay separate
```

## First-Slice Closure Criteria

- Requirements define time as first-class GTL temporal eligibility law without
  turning GTL into a provider-specific scheduler or policy DSL.
- Requirements preserve ABG authority over admission, replay, traversal
  decision, closure, continuation, retry, and repricing.
- Requirements or design define the schedule-domain policy boundary and defer
  deeper calendar, recurrence, misfire, catch-up, blackout, and deadline
  consequence proof to T-122.
- The IACS names the prime temporal carriers and demotes subordinate payloads.
- Structural carrier diagrams distinguish authoritative carriers, subordinate
  payloads, effect-edge provider payloads, projections, and downstream
  consumers.
- The attachment decision for `TemporalConstraint` is made and tested against
  `GraphVector`, `GraphFunction`, `Job`, `Rule`, and `Context` options.
- Recurrence shape defaults to `ScheduledContinuation`, with deeper recurrence
  proof deferred to T-122 unless that ticket proves fresh graph-call instances
  are necessary.
- Deadline breach behavior is policy-selected in design, with implementation
  proof deferred to T-122.
- Temporal evaluation is represented under existing evaluator regime law or the
  evaluator regime law is explicitly repriced.
- Event Calculus mapping is documented for the temporal carriers and candidate
  events.
- Provider contracts prove the strict path:

  ```text
  GTL temporal constraint
  -> ABG admits TimerIntent
  -> provider arms timer
  -> provider returns outcome
  -> ABG admits TimerOutcome
  -> ABG replays temporal projection
  -> ABG decides eligibility and continuation
  ```

- Deterministic first-slice tests prove carrier admission, timer fire/cancel/miss
  replay, `not_before` blocking and later eligibility, provider non-authority,
  scheduled continuation reopen, required policy/provider identity, and
  separation of traversal completion from homeostatic drift.

## Non-Closure Conditions

This ticket is not closed by:

- implementing cron-like behavior in a runner;
- adding Step Functions, Temporal, EventBridge, or equivalent cloud timer code
  before requirement/design authority exists;
- adding `timeout` or `deadline` fields without replay-derived event/projection
  law;
- making schedule projections mutable authority surfaces;
- letting provider receipts become runtime truth without ABG admission;
- creating top-level carriers for every temporal payload detail;
- adding a temporal evaluator label while bypassing F_D/F_P/F_H regime law;
- proving only happy-path timer firing without missed, cancelled, malformed,
  drifted, or provider-authority-negative cases.
