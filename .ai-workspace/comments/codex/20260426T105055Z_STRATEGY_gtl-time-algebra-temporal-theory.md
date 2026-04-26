# STRATEGY: GTL Time Algebra From Temporal Theory

**Author**: Codex
**Date**: 2026-04-26T10:50:55Z
**Addresses**: GTL temporal algebra, ABG scheduling semantics, schedule-native OODD
**Status**: Draft

## Summary

GTL can add a first-class time dimension without becoming Airflow, Control-M, or
a process scheduler.

The correct direction is:

```text
GTL declares temporal law.
ABG interprets temporal eligibility from admitted runtime truth.
A schedule domain module owns calendars, recurrence, windows, deadlines, and
timer semantics.
ABG run history projects schedule-vs-actual execution truth for SLA analytics.
Live telemetry feeds the homeostatic model when execution moves outside the
declared SLA envelope.
Cloud providers implement timer delivery and durable orchestration hooks.
```

Time should be modeled as an algebra over graph-function eligibility,
expiration, recurrence, and scheduled continuation. It should not be modeled as
a second controller that selects the next graph vector.

Under `DESIGN_MODULE_METHOD.md`, this work must start with the irreducible
carrier set, authority seams, subordinate payload register, structural carrier
diagram, and local/global collapse review before implementation closure.

## Current Reality

GTL already has dependency and graph structure:

```text
Node
GraphVector
GraphFunction
Job
Context
Rule
```

ABG owns runtime interpretation:

```text
start/resume
iteration
event admission
replay projection
next-vector selection
closure
retry
continuation
public stop truth
```

Scheduling currently belongs outside the core algebra. Cloud systems can wait,
timer, and invoke, but those systems are not yet represented as a GTL-native
time law. If scheduling is added by letting Step Functions, cron, Airflow,
Control-M, or an SDLC loop decide graph progression, the system recreates a
process controller outside ABG.

## Target Direction

Add a schedule-native GTL extension where time is an orthogonal constraint over
graph evolution:

```text
dependency law: what must already be true
temporal law: when work is eligible, expired, repeated, or suspended
runtime law: which lawful action ABG advances from replay truth
```

The governing interpretation should be:

```text
eligible(edge, replay) =
  dependency_truth_closed(edge, replay)
  AND temporal_truth_allows(edge, replay)
  AND policy_truth_allows(edge, replay)
```

Time changes eligibility. ABG still decides advancement.

## Temporal Theory Reading

Temporal theory gives several useful primitive ideas.

### Ordered Time

Time has an order relation:

```text
t1 <= t2
```

This supports `not_before`, `deadline`, `timeout`, `cooldown`, and
`retry_after`.

### Interval Time

Work often belongs to intervals, not just instants:

```text
window_open
window_close
eligible_during
blackout_during
deadline_interval
```

Intervals support business windows, maintenance windows, trading windows,
deployment freeze periods, and timed human gates.

### Modal Time

Temporal modalities describe obligations over time:

```text
eventually(outcome)
always(invariant)
until(condition, boundary)
within(duration, outcome)
after(event, action)
```

These should be GTL constraints and ABG projection truths, not imperative
callbacks.

### Recurrence

Schedules repeat:

```text
daily
weekly
every PT10M
business_day_at_18_00
on_calendar_event
```

Recurrence must not mean "run this task again because a scheduler fired." It
means "a new temporal eligibility instance exists; ABG may admit or reopen the
corresponding continuation if dependency and policy truth also allow it."

### Logical Time And Replay

Cloud-native execution needs deterministic replay. ABG must not treat hidden
wall-clock reads as runtime authority.

The lawful runtime source is admitted temporal events:

```text
timer_requested
timer_armed
timer_fired
window_opened
window_closed
deadline_breached
scheduled_continuation_reopened
```

Wall-clock services may cause events to arrive. They do not become semantic
truth until admitted.

## Category-Theoretic Shape

The tight algebraic model is an indexed graph category:

```text
C = category of GTL asset states and graph-function morphisms
T = ordered time category or preorder
C_t = the admissible GTL category at temporal index t
```

At each time index `t`, only some morphisms are eligible.

```text
edge(A, B) in C
edge(A, B) eligible in C_t only when temporal constraints hold at t
```

Time is not a morphism selector. Time is an eligibility index over the graph
program.

A schedule-native GTL extension should therefore act like a temporal functor or
modal wrapper over existing graph functions:

```text
window(F, W)
deadline(F, D)
retry_after(F, duration)
recurs(F, recurrence)
until(F, temporal_condition)
```

These wrappers preserve the underlying graph-function contract. They add time
law to admissibility and continuation behavior.

## Proposed GTL Algebra Surface

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

These should compile to temporal constraints over existing GTL carriers, not to
a rival schedule graph.

Example:

```text
window(
  deadline(
    graph_function("derive_daily_reconciliation"),
    "PT2H"
  ),
  "business_day_18_00_Australia/Sydney"
)
```

Meaning:

```text
derive_daily_reconciliation is eligible only inside the declared window.
If it is not closed within the deadline, ABG admits deadline truth and decides
the next lawful stop, continuation, escalation, or reprice.
```

## Irreducible Carrier Set

Under `DESIGN_MODULE_METHOD.md`, the first design asset must name the
Irreducible Architectural Carrier Set.

Candidate prime carrier families:

1. `TemporalContext`
2. `TemporalConstraint`
3. `SchedulePolicy`
4. `TimerIntent`
5. `TimerOutcome`
6. `ScheduledContinuation`
7. `TemporalProjection`

### Carrier Roles

`TemporalContext`

- authoritative declaration of clock, timezone, calendar, and time-source
  assumptions
- belongs to GTL or the schedule domain module depending on ratified scope

`TemporalConstraint`

- graph-attached law such as `not_before`, `eligible_during`, `deadline`,
  `retry_after`, or `cooldown`
- should be attached to `GraphVector`, `GraphFunction`, `Job`, `Rule`, or
  `Context`

`SchedulePolicy`

- domain-level semantics for recurrence, misfire, catch-up, coalescing,
  blackout windows, and deadline consequences

`TimerIntent`

- ABG-admitted request to arm time-based continuation or eligibility

`TimerOutcome`

- admitted result from a timer provider: armed, fired, cancelled, expired,
  failed, or uncertain

`ScheduledContinuation`

- ABG-owned continuation state blocked on temporal eligibility

`TemporalProjection`

- replay-derived view of temporal eligibility, deadline state, recurrence
  instances, scheduled continuation status, and schedule-vs-run facts

## Subordinate Payloads

Likely subordinate payloads:

```text
ClockRef
CalendarRef
TimezoneId
InstantRef
IntervalRef
DurationSpec
RecurrenceRule
MisfirePolicy
CatchUpPolicy
TimerProviderRef
TimerProviderReceipt
```

These should remain subordinate unless they become independently admitted,
published, versioned, or reused across module boundaries with distinct
authority.

Design-method risk: promoting every time field into a top-level carrier would
create boundary inflation. The schedule module should collapse around the few
identity-bearing temporal carriers.

## Runtime Event Model

Temporal truth must be event-sourced.

Candidate runtime events:

```text
temporal_context_bound
timer_requested
timer_armed
timer_cancel_requested
timer_cancelled
timer_fired
timer_missed
window_opened
window_closed
deadline_breached
recurrence_instance_opened
recurrence_instance_coalesced
scheduled_continuation_opened
scheduled_continuation_reopened
scheduled_continuation_expired
```

These events should join the ABG runtime event family only if they carry
runtime authority. Presentation-only schedule facts should remain projection
truth or provider receipts.

ABG should derive temporal state from replay:

```text
RuntimeEvent[] + TemporalConstraint[] + SchedulePolicy
  -> TemporalProjection
  -> IterationAdvanceDecision
```

No hidden `Date.now()` call should decide closure, eligibility, or deadline
truth inside the semantic kernel.

## Schedule Domain Module

The schedule module should be a GTL/ABG domain module, not a runtime fork.

It should own:

- calendars
- time windows
- recurrence law
- misfire law
- catch-up and coalescing law
- business-time interpretation
- deadline semantics
- timer provider contracts
- schedule projections

It should not own:

- graph-function iteration
- next-vector selection
- vector closure
- retry or continuation authority
- public stop taxonomy
- event admission outside its admitted event contracts

The module can expose graph functions such as:

```text
derive_temporal_context
derive_schedule_policy
request_timer
admit_timer_outcome
project_temporal_eligibility
project_schedule_run
derive_schedule_gap
derive_sla_analytics
derive_sla_drift_observation
route_sla_homeostatic_gap
open_scheduled_continuation
reopen_scheduled_continuation
derive_deadline_gap
```

## Schedule Domain Model From Runs

The schedule domain model should not stop at declared calendars and recurrence
rules. It should also model the observed run produced by ABG traversal.

This gives a product-level capability:

```text
declared schedule
+ admitted temporal events
+ admitted ABG run events
-> schedule run projection
-> schedule gap analysis
-> SLA analytics
-> repricing input
```

The declared schedule model answers:

```text
when should this graph function, vector, job, or continuation become eligible?
what deadline, window, recurrence, catch-up, and coalescing law applies?
what SLA or service objective is promised?
```

The actual run model answers:

```text
when was it armed?
when did the provider fire?
when did ABG admit the signal?
when did ABG find it eligible?
when was work dispatched?
when did execution start?
when did evidence arrive?
when did closure occur?
what retry, continuation, or repricing path happened?
```

The gap model compares the two without letting the schedule projection become
runtime authority.

Useful derived measures:

- schedule adherence
- missed windows
- timer delivery latency
- admission latency
- queue or dispatch latency
- execution duration
- evidence/proof latency
- closure latency
- deadline breach duration
- recurrence drift
- catch-up debt
- coalesced or skipped run count
- retry/backoff utilization
- SLA burn and breach rate

This is an important reason to keep time as admitted runtime truth. The same
event stream that authorizes traversal also supports analytics over whether the
real system honored the declared schedule. That analysis can drive operational
dashboards, SLA reporting, gap analysis, and repricing without weakening ABG's
authority over traversal.

## Live Telemetry And Homeostatic Feedback

Schedule-vs-run projection can become a live telemetry feed into the
homeostatic model.

The feed should show when execution is drifting outside the declared SLA
envelope before the system reaches terminal breach.

Examples:

- timer fired but ABG admission is late
- continuation is eligible but dispatch is delayed
- execution started inside the window but evidence is late
- recurrence instances are accumulating catch-up debt
- retry backoff is consuming the remaining SLA budget
- closure latency is trending beyond service objective
- deadline breach is likely before current traversal can close

The product-level feedback shape is:

```text
declared SLA
+ schedule run projection
+ live telemetry projection
-> SLA drift observation
-> homeostatic gap
-> triage and route
-> lawful re-entry or operational mitigation
```

This is homeostatic pressure, not traversal authority. A telemetry projection
may show that the system is falling outside SLA. If that observation changes
runtime behavior, reprices work, alters schedule policy, or triggers
mitigation, the observation must be admitted through the governed homeostatic
event/gap path.

The useful distinction is:

```text
telemetry projection: shows drift
homeostatic observation: admitted pressure requiring triage
gap analysis: explains mismatch between declared schedule and actual run
repricing: changes product, requirement, design, or operational policy
ABG traversal: still advances only through admitted runtime truth
```

## Homeostatic Loop After Evaluation

The homeostatic loop is currently the under-defined step after:

```text
ABG.eval -> eval.event
```

That is the right seam to define it.

`ABG.eval` should remain the transformation and traversal-completeness
evaluation. It answers:

```text
did this graph edge, vector, graph function, evidence set, or continuation meet
its declared local completion law?
```

It may emit an `eval.event` that says the current edge traversal, projection,
evidence, or closure condition does or does not satisfy the transformation
contract.

The homeostatic loop should consume those evaluation events as pressure:

```text
ABG.eval
-> eval.event
-> projection
-> delta
-> homeostatic observation
-> gap analysis
-> triage
-> route
-> operational mitigation or lawful re-entry
-> repricing when the gap is constitutional
```

This keeps the loop downstream of ABG evaluation. It does not become a second
inner traversal loop and it does not decide the next vector directly.

For the time algebra, this means SLA drift, schedule miss, recurrence debt, or
deadline pressure should first be expressed as evaluation events. The
homeostatic model then decides what kind of pressure exists:

- operational delay beneath current law
- provider or build-tenant fault
- schedule policy mismatch
- SLA definition mismatch
- requirement gap
- product or intent gap

Only after that classification should the system route to mitigation,
continuation, ticketing, design reframe, requirement reprice, product reprice,
or intent/goal renewal.

The missing design object is therefore not just "telemetry". It is the
post-evaluation homeostatic carrier family:

```text
EvalEvent
HomeostaticObservation
HomeostaticGap
HomeostaticTriage
HomeostaticRoute
ReentryDirective
RepricingProposal
```

Those carriers define how evaluated runtime mismatch becomes lawful reverse
pressure in the method chain.

## Two-Stage Evaluation Model

Adding a schedule model creates a second evaluation surface after
transformation evaluation.

Stage 1 is ABG traversal evaluation:

```text
runtime truth
+ graph-function contract
+ edge/vector evidence
-> ABG.eval
-> eval.event
```

This decides local transformation completeness. It is concerned with whether
the graph edge lawfully completed, yielded, continued, retried, blocked, or
failed under the graph-function contract.

Stage 2 is homeostatic evaluation:

```text
eval.event
+ schedule model
+ run projection
+ SLA objectives
+ performance model
+ specification deviation model
-> homeostatic evaluation
-> homeostatic observation or gap
```

This asks a different question:

```text
even if the edge traversal was locally complete, did the realized behavior stay
inside the declared schedule, SLA, performance, and specification envelope?
```

This separation matters. A graph function can be complete but still create
homeostatic pressure:

- it closed after the declared SLA
- it consumed too much retry budget
- it satisfied local evidence but missed the business window
- it accumulated recurrence catch-up debt
- it met the transformation contract but violated expected performance
- it exposed a mismatch between declared requirements and real operations

The schedule/SLA model therefore belongs in the post-evaluation homeostatic
surface, not inside the edge-completeness decision itself.

The authority rule is:

```text
ABG.eval decides traversal completeness.
Homeostatic evaluation decides drift, pressure, gap, and route.
Only lawful re-entry changes future traversal, design, requirements, product,
intent, or goals.
```

This lets ABG remain the graph iterator while still giving the product a live
model of whether the running system is remaining inside its declared operating
envelope.

## Cloud Provider Boundary

Step Functions, EventBridge, queues, cron services, durable timers, and saga
orchestrators are provider implementations.

They may:

- arm timers
- wait
- invoke external services
- hold callback tokens
- fan out provider work
- report provider receipts
- deliver timer-fired signals

They must not:

- select the next graph vector
- close a traversal
- decide convergence
- decide schedule outcome truth without ABG admission
- become the source of graph-function progression

Provider shape:

```text
TimerProviderContract
  input: admitted TimerIntent
  effect: cloud timer or workflow registration
  output: TimerOutcome candidate
  ABG admission: TimerOutcome becomes runtime truth only after validation
```

## Specification And Build Tenant Separation

Timed GTL and schedule-native ABG are product-level capability surfaces. They
belong first in specification, intent, product definition, and requirements.
That is the `WHAT`.

The AWS/serverless realization is a build tenant for a concrete technology
stack. It belongs under design and `build_tenants/`. That is the `HOW`.

Do not let the AWS build tenant define the constitutional temporal model.

Specification-level surfaces should define:

- the existence of time as a first-class GTL algebra dimension
- temporal eligibility, expiry, recurrence, deadline, and continuation
  semantics
- ABG authority over admission, replay, traversal decision, closure,
  continuation, retry, and repricing
- required runtime truth families such as timer intent, timer outcome,
  scheduled continuation, recurrence instance, and deadline breach
- projection and proof obligations for temporal runtime truth

Design and build tenant surfaces should define:

- how the temporal carriers are represented in a concrete implementation
- how provider adapters register timers and receive provider outcomes
- how event stores, buses, queues, Lambdas, Step Functions, and durable
  projections are wired
- how the build tenant proves conformance to the specification-level temporal
  contract

An AWS build tenant can show:

- ABG as a distributed event-sourced runtime protocol
- EventBridge Scheduler or Step Functions as the schedule provider
- Lambda or Step Functions tasks as disposable ABG runner entrypoints
- DynamoDB, EventBridge, or another durable store as the event/projection
  substrate
- SQS, SNS, or Step Functions callbacks as delivery mechanisms
- GTL temporal constraints compiled into `TimerIntent` and
  `ScheduledContinuation` carriers

Its purpose is to prove that GTL time law and ABG traversal authority survive a
cloud-native, inversion-of-control implementation.

The build tenant must not become precedent that AWS concepts are GTL concepts.
Step Functions state machines, callback tokens, EventBridge schedule names,
Lambda invocation IDs, and provider retry counters are effect-edge payloads
unless admitted through the temporal runtime event contract.

The strict acceptance shape is:

```text
GTL temporal constraint
-> ABG admits TimerIntent
-> AWS provider registers durable schedule or wait
-> AWS invokes an ABG runner entrypoint
-> ABG admits timer/provider outcome event
-> ABG replays frame truth
-> ABG decides eligibility
-> ABG executes or dispatches graph function
-> ABG admits function outcome
-> ABG decides continuation, retry, closure, or repricing
```

In that build, the scheduler may physically trigger graph-function compute. It
does not semantically authorize the graph transition. The ABG entrypoint is the
authority membrane.

## Saga Pattern Relation

Saga is useful as an implementation pattern for distributed effect work and
hierarchical continuations.

Lawful saga use:

```text
ABG opens child graph call or scheduled continuation.
Provider starts saga instance for effect work.
Saga reports admitted outcome candidates.
ABG admits events and replays.
ABG decides next continuation, retry, compensation, or closure.
```

Unlawful saga use:

```text
Saga owns the process DAG.
Saga decides next graph step.
Saga marks ABG work closed because its tasks completed.
Saga retries or compensates without admitted ABG continuation truth.
```

Saga should be an effect-edge provider, not a second ABG.

## Relationship To Airflow And Control-M

Airflow and Control-M are process-schedule systems:

```text
time/dependency trigger -> task execution -> success/failure -> next task
```

GTL time algebra should be outcome-driven:

```text
desired outcome
-> graph-function traversal
-> temporal eligibility
-> evidence/evaluation
-> closure, continuation, deadline, escalation, or repricing
```

The replacement claim should not be "we can schedule tasks." The claim should
be:

```text
we can govern time-bound outcomes under replayable graph truth.
```

That is stronger than process scheduling because task completion is not closure
unless the outcome is proven.

## Design Method Closure Requirements

Before ratifying this as GTL or ABG design, require:

1. Re-entry triage

   This is likely `requirement_reprice` if time algebra changes GTL capability
   law. It may include a downstream `design_reframe` for ABG and the schedule
   module.

2. Design derivation

   Define whether the extension is:

   - GTL language algebra
   - ABG runtime interpretation
   - schedule domain module
   - provider contract family

   Do not mix those as one carrier surface.

3. Irreducible carrier set

   Publish the prime temporal carriers and keep payloads subordinate.

4. Structural carrier diagram

   Mermaid `classDiagram` with:

   - prime carriers
   - subordinate payloads
   - effect-edge provider payloads
   - downstream projections
   - deferred families
   - authoritative vs downstream roles

5. Authority seam closure

   Prove there is only one temporal truth path:

   ```text
   provider signal -> admitted timer outcome event -> replay projection -> ABG decision
   ```

6. Projection-source coherence

   Schedule projections must derive from admitted GTL/ABG temporal carriers and
   runtime events. They must fail closed on structural drift.

7. Effect boundary

   Cloud timers and saga providers may deliver effects. They do not own
   semantic state.

8. Module-derived tests

   Required proof lanes:

   - temporal carrier admission
   - event replay of timer arm/fire
   - not-before blocks then admits eligibility
   - deadline breach projects as public stop or continuation truth
   - recurrence opens exactly one lawful instance under coalescing policy
   - provider cannot select next vector or emit unadmitted runtime truth
   - projection fails closed on schedule-policy drift

9. Local/global optimization review

   Review recurrence across timer, retry, continuation, policy, and saga
   provider seams. If the same provider contract shape appears repeatedly,
   commonize it instead of building one-off callback APIs.

## Non-Goals

This strategy does not propose:

- replacing ABG iteration with a scheduler
- adding cron as a hidden runtime authority
- making Step Functions the workflow truth
- moving business calendar semantics into ABG core
- making all temporal payloads top-level GTL types
- treating task completion as outcome closure
- reading wall-clock time as hidden semantic truth during replay

## Open Design Questions

1. Should `TemporalConstraint` attach to `GraphVector`, `GraphFunction`, `Job`,
   `Rule`, or all four?

2. Should recurrence create new graph-call instances, new frame instances, or
   scheduled continuations over an existing graph-function boundary?

3. Does deadline breach become:

   - terminal failure,
   - yielded public stop,
   - scheduled continuation expiration,
   - human gate,
   - repricing input,
   - or policy-selected outcome?

4. Which temporal semantics belong in GTL language versus the schedule domain
   module?

5. What is the minimum cloud provider contract that proves timers without
   fossilizing AWS-specific Step Functions semantics into GTL?

## Recommended Action

Open a design ticket after T-072/T-073 or as a parallel design-only spike:

```text
Design GTL Time Algebra And Schedule Domain Module
```

Suggested ticket closure:

- requirement reprice for temporal GTL capability
- `GTL_TIME_ALGEBRA_DERIVATION.md`
- `GTL_TIME_ALGEBRA_IACS.md`
- `GTL_TIME_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md`
- `ABG_SCHEDULE_RUNTIME_DERIVATION.md`
- `SCHEDULE_DOMAIN_MODULE_DERIVATION.md`
- `SCHEDULE_RUN_PROJECTION_AND_SLA_ANALYTICS.md`
- `SLA_TELEMETRY_HOMEOSTATIC_FEEDBACK.md`
- `HOMEOSTATIC_LOOP_AFTER_EVAL_EVENT_DERIVATION.md`
- `TWO_STAGE_EVALUATION_MODEL.md`
- provider contract sketch for Step Functions or equivalent cloud timers
- AWS/serverless build tenant definition and acceptance proof
- module-derived proof plan

First proof should be small:

```text
one graph function
one not_before constraint
one timer provider stub
one timer_fired event
one replay-derived scheduled continuation reopen
one final closure under ABG iteration
one schedule-vs-actual gap projection
one SLA drift observation feeding the homeostatic model
one `ABG.eval -> eval.event -> homeostatic route` proof
one proof that local traversal completion and homeostatic drift evaluation stay
separate
```

That proof would establish the central law:

```text
time changes eligibility;
ABG remains the iterator.
```
