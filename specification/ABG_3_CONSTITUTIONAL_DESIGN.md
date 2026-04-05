# ABG 3 Constitutional Design

**Status**: Active
**Date**: 2026-04-05
**Purpose**: State the canonical present-tense ABG 3 runtime design, ontology,
event model, event-calculus semantics, and GTL/ABG boundary as the
constitutional authority for ABG

---

## 1. Position

ABG 3 is the constitutional design for the Abiogenesis engine.

This document is the ABG constitution.

ABG is the canonical event-sourced, replayable, graph-function-first runtime
for GTL.

ABG is event-calculus-capable:

- events are the only written runtime truth
- fluents are replay-derived runtime truth
- projections answer what holds from event truth alone

GTL is declared law.

ABG is the lawful interpreter, enforcer, fact emitter, and projector of
that declared law.

---

## 2. Core Thesis

The simplification of ABG 3 is:

- public execution entry is graph-function-first
- runtime truth is event-first
- durable runtime state is fluent-first
- event emission is substrate-owned
- product policy is above the engine

The irreducible runtime facts of ABG 3 are not:

- CLI narration
- result files by themselves
- prompt/controller memory
- domain-specific imperative hooks

They are emitted events over explicit runtime aggregates.

ABG 3 therefore centers five runtime truths:

- `Run` truth
- `GraphCall` truth
- `Frame` truth
- vector-local traversal truth
- `Continuation` truth

Those truths must be reconstructible from the event stream alone.

---

## 3. Constitutional Scope

This document establishes:

- graph-function-first public execution entry
- the runtime ontology of runs, graph calls, frames, vectors, and continuations
- the canonical event envelope
- the event/fluent/projection split
- authoritative lifecycle events versus snapshot/checkpoint events
- replay and event-calculus requirements
- configured default policy bundles and fallback law
- correction, retry, supersession, and continuation opening
- the GTL/ABG boundary

---

## 4. What ABG 3 Is And Is Not

### ABG 3 is

- the canonical interpreter/runtime for GTL declarations
- an event-sourced runtime substrate
- a replayable runtime fact system
- a graph-function-first execution engine
- a runtime projector over fluents and aggregates
- a configured policy resolver over GTL hook surfaces
- the sole lawful owner of post-dispatch runtime fact truth

### ABG 3 is not

- a second workflow language above GTL
- a business-priority engine
- product-local imperative runtime code
- a prompt choreography framework
- a planner over probabilistic worker tactics
- a store of hidden mutable controller state
- a constitutional intent system
- an observer of hidden probabilistic worker reasoning

ABG 3 derives and records runtime continuations from event truth.

It does not redefine constitutional `Intent`.

---

## 5. Design Principles

### 5.1 Event Truth Primacy

The event stream is the only written runtime truth surface.

### 5.2 Fluents Are Derived, Not Written

Durable runtime state is derived by replay.

ABG writes events.

ABG does not write fluent state as a rival authority surface.

### 5.3 GraphFunction-First Public Execution

Public semantic work enters the runtime through published `GraphFunction`
carriers bound by GTL `Job` contracts.

### 5.4 Vector-Local Truth Is Necessary

`GraphVector` is the internal invariant-boundary carrier for local
evaluation, proof, closure, and traversal facts.

Vector-local truth is necessary.

It is not sufficient by itself to describe callable-level or recursive-level
open work.

### 5.5 No Shadow Runtime

CLI, product code, and app bootstrap may present, poll, proxy, or configure.

They do not own runtime fact emission after dispatch.

### 5.6 Fail-Closed Runtime Law

When runtime truth is contradictory, malformed, unresolved by law, or missing
required provenance, ABG fails closed.

### 5.7 Policy Resolution Without A Policy DSL

GTL exposes hooks plus opaque configuration.

ABG resolves them into executable policy behavior.

ABG does not require GTL to define a policy mini-language.

ABG governs admissible regimes, fallback law, proof, closure, and
observability boundaries.

It does not prescribe internal tactic, prompt choreography, decomposition
strategy, or retry choreography for probabilistic `F_P` work.

### 5.8 Continuation Over Runtime Intent

Runtime-open obligation truth derived from events is `Continuation` truth.

It is not constitutional `Intent` truth.

### 5.9 Event-Calculus Completeness

The event model must be rich enough to answer:

- what happened
- what now holds
- what no longer holds
- what is open

without hidden controller memory.

---

## 6. Runtime Ontology

ABG 3 consumes GTL declaration truth and owns the following runtime ontology.

### 6.1 GTL Inputs

ABG consumes:

- `GraphFunction`
- `GraphVector`
- `Job`
- `Role`
- `Context`
- GTL hook/config declaration surfaces

These are GTL-owned.

### 6.2 Engine-Owned Runtime Types

ABG owns:

- `EventEnvelope`
- `Run`
- `GraphCall`
- `Frame`
- vector-local traversal facts
- `Continuation`
- projections and replay-derived fluents
- workers, backends, and concrete binding/runtime identity

### 6.3 Run

`Run` is one engine-owned execution attempt over GTL semantic work.

Canonical runtime identity:

- `run_id`
- `job_id`
- `work_key`

### 6.4 GraphCall

`GraphCall` is one engine-owned realization of one published
`GraphFunction` boundary within runtime execution.

Canonical runtime identity:

- `call_id`
- `run_id`
- `graph_function_id`
- `materialization_id`

`GraphCall` is the runtime aggregate corresponding to the public callable
carrier.

It is not identical to the GTL `GraphFunction` declaration itself.

Each retry, reopen, or replacement callable attempt is a new `GraphCall` with
its own `call_id`.

ABG 3 does not define a separate graph-call lineage aggregate.

Cross-call relation is carried by causal/correlation identity in event truth,
not by mutable controller bookkeeping.

In-memory `GraphCall` objects are caches or projections over event truth.

They are not rival mutable control state.

### 6.5 Frame

`Frame` is one recursive invocation aggregate opened within a graph call.

Canonical runtime identity:

- `frame_attempt_id`
- `frame_lineage_id`
- `call_id`

`frame_attempt_id` identifies one runtime frame attempt.

`frame_lineage_id` carries lineage across reopening or retry of the same
recursive invocation boundary.

In-memory `Frame` objects are caches or projections over event truth.

They are not rival mutable control state.

### 6.6 Vector-Local Traversal Fact

Vector-local traversal truth is runtime fact about one internal boundary inside
a call or frame.

Canonical correlation surfaces:

- `vector_id`
- `call_id`
- `frame_attempt_id` when inside a frame

Vector-local traversal truth may be emitted as facts without making vector a
public execution aggregate.

The canonical ownership rule is:

- attach a vector-local fact to the nearest enclosing runtime aggregate
- use `frame` aggregate identity when the traversal occurs inside a frame
- otherwise use `graph_call` aggregate identity
- vector is never its own runtime aggregate

The same traversal fact must not be duplicated across multiple enclosing
aggregate owners as parallel authoritative truth.

### 6.7 Continuation

`Continuation` is one engine-owned durable open governance obligation or
unresolved runtime condition derived from prior event truth.

Canonical runtime identity:

- `continuation_id`
- `continuation_kind`
- `caused_by_event_id`
- `run_id`
- optional `call_id`
- optional `frame_attempt_id`

Lawful kinds may include:

- `retry`
- `repair`
- `fh_review`
- `correction`
- `compensation`

`Continuation` records what is open under runtime law.

It is not constitutional intent, goal, product strategy, hidden task queue, or
planner-authored next action.

`Continuation` is strictly run-local.

It does not survive into a replacement run as the same aggregate.

If an unresolved condition is relevant after retry, correction, or
supersession, ABG must terminate the old continuation by authoritative event
truth and open a new continuation in the new run with explicit causal linkage.

---

## 7. Public Execution Model

The canonical public execution shape is:

`Job -> GraphFunction -> GraphCall -> materialized graph -> internal GraphVector traversal`

Recursive and higher-order execution adds:

`GraphCall -> Frame(s) -> internal GraphVector traversal -> foldback -> closure`

The runtime must therefore distinguish:

- semantic work contract truth
- callable boundary truth
- recursive frame truth
- vector-local traversal truth
- continuation truth

---

## 8. Event Model

### 8.1 Event Envelope

The canonical event envelope is:

```python
@dataclass(frozen=True)
class EventEnvelope:
    event_id: str
    event_time: str
    event_type: str
    aggregate_type: str
    aggregate_id: str
    parent_aggregate_id: str | None = None
    causation_event_id: str | None = None
    correlation_id: str | None = None
    workflow_version: str = "unknown"
    work_key: str | None = None
    run_id: str | None = None
    job_id: str | None = None
    graph_function_id: str | None = None
    materialization_id: str | None = None
    frame_attempt_id: str | None = None
    frame_lineage_id: str | None = None
    vector_id: str | None = None
    data: Attrs = field(default_factory=Attrs)
```

The constitutional rules are:

1. `emit()` is the only lawful write path.
2. `event_id` is engine-assigned and immutable.
3. `event_time` is system-assigned and immutable.
4. aggregate identity and causal/correlation identity must be carried
   explicitly enough for replay to reconstruct runtime truth.

### 8.2 Aggregate Types

Canonical aggregate types are:

- `run`
- `graph_call`
- `frame`
- `continuation`

Vector-local traversal facts may be emitted against `graph_call` or `frame`
aggregates so long as `vector_id` is explicit.

The canonical rule is nearest-enclosing ownership:

- `frame` aggregate when inside frame execution
- otherwise `graph_call` aggregate

Vector is never its own runtime aggregate.

### 8.3 Event Families

Authoritative event families include at minimum:

- run lifecycle
- graph-call lifecycle
- vector-local traversal and dispatch facts
- frame lifecycle
- proof and closure facts
- continuation lifecycle
- correction and supersession facts

Illustrative event families:

- `run_bound`
- `run_started`
- `run_completed`
- `run_failed`
- `run_timed_out`
- `run_superseded`
- `graph_call_opened`
- `graph_call_closed`
- `graph_call_failed`
- `vector_started`
- `vector_gap_found`
- `fp_dispatched`
- `backend_readiness_succeeded`
- `backend_readiness_failed`
- `worker_turn_started`
- `worker_turn_succeeded`
- `worker_turn_failed`
- `proof_passed`
- `proof_failed`
- `closure_passed`
- `closure_failed`
- `frame_opened`
- `frame_step_started`
- `frame_step_completed`
- `frame_suspended`
- `frame_resumed`
- `foldback_opened`
- `frame_rebound`
- `frame_closed`
- `continuation_opened`
- `continuation_resolved`
- `continuation_superseded`
- `continuation_abandoned`

ABG may emit additional lawful facts.

But equivalent authoritative truth must exist for these runtime concerns.

ABG observes process-boundary runtime facts only.

It does not constitutionalize internal chain-of-thought, hidden tactic steps,
or private decomposition inside probabilistic workers.

### 8.4 Lifecycle Events Versus Snapshot Events

Primary lifecycle events are authoritative runtime fact.

Snapshot, checkpoint, or state-summary events may exist as replay aids.

But they do not replace authoritative lifecycle facts.

In particular:

- a state snapshot event must not be the only evidence that a frame, call, or
  continuation is open or closed
- lifecycle open/close/fail/rebound events are primary truth

---

## 9. Event Calculus

### 9.1 Core Split

ABG 3 distinguishes:

- event
  - instantaneous occurrence
- fluent
  - durable truth initiated or terminated by events
- projection
  - replay-derived answer to what currently holds

### 9.2 Canonical Fluents

Canonical fluents include at minimum:

- `run_active(run_id)`
- `run_completed(run_id)`
- `run_failed(run_id)`
- `run_superseded(run_id)`
- `graph_call_open(call_id)`
- `graph_call_failed(call_id)`
- `frame_open(frame_attempt_id)`
- `frame_suspended(frame_attempt_id)`
- `foldback_pending(frame_attempt_id)`
- `continuation_open(continuation_id)`

### 9.3 Initiation And Termination Law

The event model must support at minimum the following event-calculus law:

| Event | Initiates | Terminates |
| --- | --- | --- |
| `run_started` | `run_active(run_id)` | |
| `run_completed` | `run_completed(run_id)` | `run_active(run_id)` |
| `run_failed` | `run_failed(run_id)` | `run_active(run_id)` |
| `run_timed_out` | | `run_active(run_id)` |
| `run_superseded` | `run_superseded(old_run_id)` | `run_active(old_run_id)` |
| `graph_call_opened` | `graph_call_open(call_id)` | |
| `graph_call_closed` | | `graph_call_open(call_id)` |
| `graph_call_failed` | `graph_call_failed(call_id)` | `graph_call_open(call_id)` |
| `frame_opened` | `frame_open(frame_attempt_id)` | |
| `frame_suspended` | `frame_suspended(frame_attempt_id)` | |
| `frame_resumed` | | `frame_suspended(frame_attempt_id)` |
| `foldback_opened` | `foldback_pending(frame_attempt_id)` | |
| `frame_rebound` | | `foldback_pending(frame_attempt_id)` |
| `frame_closed` | | `frame_open(frame_attempt_id)`, `frame_suspended(frame_attempt_id)`, `foldback_pending(frame_attempt_id)` |
| `continuation_opened` | `continuation_open(continuation_id)` | |
| `continuation_resolved` | | `continuation_open(continuation_id)` |
| `continuation_superseded` | | `continuation_open(continuation_id)` |
| `continuation_abandoned` | | `continuation_open(continuation_id)` |

### 9.4 Invariants

At minimum, ABG 3 must make these states impossible by lawful replay:

- one run both active and completed
- one run both active and failed
- one graph call both open and closed
- one frame both open and closed
- one frame both foldback-pending and fully closed
- one continuation both open and resolved
- one continuation open after authoritative supersession or abandonment

### 9.5 Replay Rule

If replay cannot determine what holds from event truth alone, the event
model is constitutionally incomplete.

---

## 10. Projection Law

Projection is replay-derived.

Projection does not overwrite runtime truth.

ABG 3 requires explicit projections for:

- `run`
- `graph_call`
- `frame`
- `continuation`

Vector-local and asset/edge-specific projections may also exist.

But callable and continuation truth must not be implicit side effects hidden
inside run projection alone.

---

## 11. Policy And Default Law

### 11.1 GTL/ABG Hook Split

GTL declares:

- hook attachment points
- stable hook references
- opaque hook configuration

ABG resolves:

- policy bundles
- hook implementations
- runtime enforcement order
- failure and fallback law

ABG policy resolution governs runtime admissibility and enforcement boundaries.

It does not define or own internal strategy for probabilistic workers.

### 11.2 Configured Default Bundles

ABG ships broad reference default bundles as ordinary configuration plus
executable hook implementations.

These are reference material, not hidden hardcoded law tables.

Domain users may copy, edit, and reference them from their own GTL/ABG
surfaces.

### 11.3 Broad F_P-Biased Default

The constitutional broad default is:

1. run declared deterministic proof/evaluation first when available
2. run generic deterministic proof/evaluation when declared custom logic is
   absent but generic engine checks are available
3. if deterministic handling is absent or unresolved, fall forward to
   governed `F_P`
4. re-run proof and closure after `F_P` returns
5. escalate to `F_H` only when resolved escalation policy requires it

### 11.4 Fail-Closed Distinction

The default `F_P` bias does not mean every deterministic problem falls forward
to `F_P`.

ABG distinguishes:

- deterministic path absent
  - lawful fall forward to governed `F_P`
- deterministic path open or unresolved
  - lawful fall forward to governed `F_P`
- deterministic path invalid, contradictory, malformed, or engine-erroring
  - fail closed and emit failure fact truth

That distinction is constitutional.

### 11.5 Constitutional Failure Taxonomy

ABG 3 distinguishes at minimum:

- runtime defect
  - engine, backend, transport, or runtime invariant failure
  - fail closed
- policy or configuration defect
  - unresolved hook reference, malformed config, or illegal policy bundle
  - fail closed
- probabilistic non-convergence
  - governed `F_P` work returned without resolving required closure
  - may open continuation truth according to resolved policy
- proof failure after constructive work
  - constructive work returned, but proof or closure did not hold
  - emits proof/closure failure truth and may open continuation truth
- superseded or abandoned work
  - work was lawfully replaced, withdrawn, or left non-operative by later
    authoritative events
  - must not be silently treated as success or engine defect

These categories are constitutional runtime law.

---

## 12. Post-Dispatch Runtime Ownership

After an `F_P` boundary is reached, ABG owns:

- dispatch request creation
- worker/backend resolution
- backend readiness
- worker turn invocation
- substrate failure classification
- proof re-entry
- closure re-entry
- retry/correction continuation opening
- authoritative fact emission for every stage

The CLI may:

- present
- proxy
- poll
- request human input

But it does not own runtime fact truth.

---

## 13. GTL/ABG Boundary

### GTL owns

- language law
- graph structure
- graph functions, graph vectors, roles, jobs, and modules
- hook attachment points and opaque configuration

### ABG owns

- execution entry over published graph functions
- graph-call, run, frame, and continuation aggregates
- event emission
- event-calculus replay and projection
- concrete workers/backends/transport
- policy bundle resolution
- evaluation, escalation, proof, and closure enforcement
- retries, correction, supersession, and continuation opening as derived
  runtime obligation truth

### Product/domain layers own

- business policy above runtime law
- domain-specific projections and operator-facing summaries
- interpretation of ABG facts into product decisions

This split is constitutional.

---

## 14. Authority

This document is the constitutional authority for ABG.

Requirements, design elaborations, implementation, and downstream integrations
shall conform to it.

---

## 15. Guiding Statement

ABG 3 is the canonical event-sourced, replayable, graph-function-first runtime
for GTL, with explicit run, graph-call, frame, vector-local, and continuation
truth; with events as the only written runtime authority; with fluents derived
by replay under event-calculus law; with configured default policy bundles and
fail-closed fallback semantics; and with sole substrate ownership of
post-dispatch runtime fact emission.

---

## 16. Bottom Line

The simplification is:

**GTL declares law; ABG emits and enforces runtime truth.**

The strengthening is:

**events are written truth, fluents are replay-derived truth, and public
execution is graph-function-first all the way down.**
