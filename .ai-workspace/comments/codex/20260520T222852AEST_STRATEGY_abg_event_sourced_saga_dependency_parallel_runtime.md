# STRATEGY: ABG Event-Sourced Saga Runtime For Dependency-Ready Parallel Traversal

**Author**: Codex
**Date**: 2026-05-20
**Status**: Strategy comment
**Scope**: ABG runtime strategy, event-sourced saga interpretation, dependency-ready F_P fan-out/fan-in, stateful-workspace recovery
**Authority class**: Commentary. This document proposes ticket and design direction. It is not ratified specification or design.

## Summary

The original system conception should be restored as an event-sourced saga
runtime.

ABG is not just a loop that walks vector index `0, 1, 2...`. ABG is the
event-sourced interpreter for GTL graph-function work. A graph-function
invocation is a long-running saga:

```text
open graph call / frame
-> observe admitted state
-> project ready work
-> dispatch lawful branches
-> admit results
-> fold in branch truth
-> project continuation, closure, compensation, retry, block, or escalation
```

The saga state is not private controller state. It is replay-derived from
admitted runtime events plus declared GTL surfaces and admitted observed state.
Workspace state matters, but only through admitted observation records,
digests, event watermarks, and output-allocation/write-territory truth.

The dependency-parallel runner should therefore not be a second scheduler beside
ABG. It should be the next realization of ABG's existing laws:

- `emit()` remains the only runtime truth write path.
- Projection remains the only lawful current-state surface.
- Fan-out/fan-in preserve lineage through event causation and correlation.
- Parallel workers are lawful only when their write territories are disjoint.
- Current workspace/register/projection reads are admitted observed state.
- Retry, compensation, correction, and reopen append truth; they do not erase
  prior events.

The simple async implementation shape is still correct:

```ts
async function runEdge(edge, parentPromises, dispatch) {
  await Promise.all(parentPromises);
  return dispatch(edge);
}
```

But that promise graph is only the local in-process view of the saga. The
authoritative runtime is the event stream and replay-derived projection. A
process may crash, lose every promise, rebuild the graph from admitted events
and observed workspace state, and continue without semantic loss.

## Governing Current Truth

This strategy is anchored in current ABG law.

`specification/INTENT.md` defines the primitive:

```text
iterate(
  current_surface_projection,
  cumulative_context,
  evaluators
) -> runtime_events
```

The current surface is replay-derived projection, not private mutable engine
state. ABG appends events, derives the next surface by projection, and advances
only through declared graph, evaluation, continuation, retry, hold, or stop law.

`specification/PRODUCT.md` repeats the same product truth: ABG is the runtime
motor for outcome compute; it admits runtime events, projects next state, and
advances through declared continuation, retry, hold, gap, completion, or stop
law.

`REQ-R-ABG3-EVENTS` states that `emit()` is the only lawful write path and the
event stream is append-only.

`REQ-R-ABG3-PROJECTION` states that durable runtime truth is replay-derived and
that snapshots/checkpoints may aid replay but cannot override event truth.

`REQ-L-GTL3-LAWS` states that fan-out, fan-in, gate, promote, recursion, and
event-sourced interpretation are lawful GTL language concerns.

`REQ-R-ABG3-LINEAGE` states that spawn, foldback, substitution, fan-out, and
fan-in preserve explainable lineage through causation and correlation.

`REQ-R-ABG3-WORKER` already contains the key parallelism law:

- worker capability exposes write territory
- ABG may realize work in parallel only when write territories are disjoint
- overlapping write territories serialize
- read overlap alone is not a parallelism conflict

`T-136` and `M03_OBSERVED_STATE_ADMISSION_DERIVATION.md` already establish the
stateful-workspace side of this: any workspace, register, projection, policy, or
event-watermark read that can affect selection, routing, pressure projection, or
closure must be admitted observed state.

The new strategy does not need to invent a different runtime model. It needs to
compose these existing laws into one saga runner.

## Event Calculus Boundary

ABG already uses Event Calculus for runtime truth.

This strategy must not introduce a rival saga calculus, scheduler calculus, or
workflow-state formalism. "Saga" is the operational pattern: a long-running
graph-function invocation whose current truth is replay-derived from admitted
events. Its projections should be ordinary ABG projections over existing Event
Calculus law:

```text
Happens(runtime event)
-> declared Initiates / Terminates / clipping law
-> replay-derived HoldsAt fluents
-> projection read model
-> lawful next command or terminal disposition
```

Any new branch, frontier, lease, fan-in, timeout, cancellation, or idempotency
surface proposed below is a candidate carrier/projection/event family inside
that existing event calculus. It is not a new semantic layer.

## Current Runtime Gap

The TypeScript M03 runner has the right event/projection center, but the
advancement shape is still serial.

Current projection derives `nextVectorIndex` as the first unclosed vector. It
also rejects non-replay-derived closure order by requiring all lower vector
indexes to be closed before a higher vector closes. `deriveIterationAdvanceDecision`
then advances that one vector. `runEngineIterateAsync` awaits each plugin effect
inside the same loop.

That is async effect handling, not dependency-ready saga fan-out.

This is consistent with the historical sequencing in `specification/INTENT.md`:
local run governance came first, while distributed coordination/saga was called
out as beyond that wave. The point of this strategy is that the earlier "out of
scope" line is now the next runtime wave, not a replacement for the local
event/projection foundation.

Current evidence surfaces:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/projection.ts`
  derives the first unclosed `nextVectorIndex` and enforces serial vector closure
  order.
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/iteration.ts`
  advances one selected vector.
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts`
  has async plugin-effect resolution, but the runner awaits one yielded effect
  inside the same iteration loop.
- `specification/requirements/abg/REQ-R-ABG3-WORKER.md` already declares the
  disjoint-write rule that a parallel runner must consume.
- `build_tenants/abiogenesis/typescript/design/M03_OBSERVED_STATE_ADMISSION_DERIVATION.md`
  already declares how mutable workspace/register/projection state becomes
  replay-visible input.

This is the gap to close:

```text
current shape:
  one replay projection -> first unclosed vector -> one effect -> await -> replay

target shape:
  one replay projection -> dependency-ready frontier -> lawful ready branches
  -> lease disjoint write territories -> dispatch bounded concurrent effects
  -> admit branch results -> deterministic fan-in projection -> continue
```

The target does not delete the existing serial runner. It generalizes
advancement from "next index" to "ready frontier under saga law."

## Saga Meaning In ABG

A saga is a long-running graph-function invocation whose state is explained by
events.

In ABG terms:

- `GraphCall` is the saga scope for one graph-function invocation.
- `Frame` is the invocation-local recursive scope.
- `Continuation` is the current machine-control surface.
- `Run` or traversal attempt identity is the effect attempt surface.
- `GraphVector` or admitted action row is the local work boundary.
- `ObservedStateRecord` is admitted current reality read by the saga.
- `PayloadLedger`, `AssuranceProjection`, and closure folds are read models
  over admitted events.

The saga is not a mutable object. It is a projection over these events:

```text
graph_call_opened
frame_opened
vector_traversal_planned
observed_state_admitted
traversal_attempt_envelope_derived
traversal_attempt_dispatched
runtime_activity_probe_observed
payload_observed
payload_validated
evidence_admitted
vector_evaluated
vector_closed
continuation_planned
graph_span_foldback_evaluated
graph_reentry_frontier_projected
terminal_reached
```

Some names above already exist; some need exact carrier names in the future
ticket. The important rule is that the saga state remains replay-derived.

## Branch Identity And Idempotency

Branch identity is the smallest critical missing shape.

Every dispatchable unit needs a stable logical branch identity, separate from
attempt identity. A candidate `BranchRef` should be derivable from existing ABG
runtime identity plus the selected frontier row:

```text
BranchRef =
  work_key
  basis_id
  graph_function_id
  graph_call_id
  frame_id
  frame_lineage_id
  frame_attempt_id
  vector_index or action_ref
  frontier_ref or frontier_digest
  branch_key
  fan_in_scope_ref
```

`branch_key` is the stable local key for the branch within the frontier. For
static graph vectors it can be the vector ref. For `fan_out(...)` over a vector
boundary it should include the item identity or declared item-order key. For a
product-supplied dependency map it should include the admitted dependency row
identity. It must not be inferred from worker prose or completion order.

Attempts are separate:

```text
BranchAttemptRef =
  branch_ref
  attempt_ordinal
  retry_attempt_ref
  actor_invocation_ref when present
```

Idempotency is event-admission law, not transport folklore.

Every command that can append branch truth needs an idempotency key derived from
the logical command identity and admitted input identity:

```text
IdempotencyKey =
  command_kind
  branch_ref
  branch_attempt_ref when attempt-scoped
  payload_ref or payload_digest when payload-scoped
  observed_state_ref set digest when state-dependent
  output_allocation_ref / write_territory_ref when write-dependent
```

Admission rules:

- same idempotency key + same admitted payload digest returns the prior logical
  admission result and does not create a second logical fact
- same idempotency key + different payload digest is an idempotency conflict and
  fails closed through admitted rejection/correction truth
- late results from a superseded, cancelled, expired, or compensated attempt may
  be observed as historical evidence, but they must not close the current branch
  unless projection still marks that attempt current
- retry opens a new `BranchAttemptRef`; it does not mint a new logical
  `BranchRef`
- fan-in consumes branch logical closure, not every duplicate delivery of a
  branch result

The natural delivery model is at-least-once effects with idempotent admission.
Exactly-once transport is not required and should not be assumed.

## Not This

This strategy is not:

- a cloud-vendor workflow engine replacing ABG semantics
- a Step Functions compiler where ASL becomes the source of truth
- a hidden service loop that owns fan-out/fan-in
- a product-specific build scheduler hidden in `odd_sdlc`
- a promise-only runtime where in-memory promises are durable state
- a transaction rollback model that erases failed work
- a worker-pool optimization that bypasses event/projection law

Those can be substrates or local realizations. They are not the semantic center.

## Command/Event/Projection Split

The saga runner should be expressed as CQRS over ABG runtime truth.

Commands request effects. Commands are not truth.

Events record admitted facts. Events are truth.

Projections derive current saga state. Projections are read models.

### Command Surfaces

Candidate command surfaces:

```text
start_graph_saga(start_intent)
admit_observed_state(observation)
derive_ready_frontier(basis, projection)
claim_branch_lease(branch_ref, write_territory)
dispatch_branch(branch_ref, dispatch_input)
admit_branch_result(result_artifact)
admit_branch_progress(progress_observation)
publish_branch_evidence(evidence_envelope)
release_branch_lease(branch_ref)
plan_fan_in(frontier_ref)
admit_fan_in_result(fan_in_input)
plan_compensation(scope_ref, reason)
admit_compensation_result(result)
plan_retry(branch_ref, retry_reason)
plan_reentry(frontier_projection)
```

The exact names can change. The rule cannot: a command either emits admissible
source facts or fails closed with a typed rejection. A command does not mutate
the saga behind projection's back.

### Event Families

The eventual ticket should define or reuse event families for:

- saga/graph-call open and terminal state
- frame open, reopen, reset, and close
- ready-frontier derivation identity when a frontier is used for dispatch
- branch lease acquisition and release
- branch lease expiry
- branch dispatch start
- branch activity and liveness observations
- branch result payload observation, validation, rejection, and evidence
- duplicate branch command/result rejection or prior-admission replay
- branch closure or non-progress classification
- branch timeout, cancellation, and interruption
- fan-in fold/admission
- compensation planning, dispatch, and completion
- correction/supersession/reopen

Ready frontier itself can remain a projection. If a projected frontier is used
to dispatch work, the dispatch events must preserve the frontier projection ref
or digest so replay can explain why that branch was considered ready.

### Projection Surfaces

The target runner needs these projections:

```text
SagaProjection
DependencyFrontierProjection
BranchLeaseProjection
BranchIdempotencyProjection
WriteTerritoryConflictProjection
BranchLivenessProjection
FanInProjection
CompensationProjection
ContinuationProjection
PublicConstructionProgressProjection
```

These projections should be deterministic over:

- admitted runtime events
- GTL graph/function/module declarations
- vector source/target boundaries
- declared dependency overlays when topology is product-supplied
- output allocation and workspace binding truth
- observed-state records and event watermarks
- payload/evidence/assurance projections
- retry, correction, and continuation events

## Dependency-Ready Frontier

The central scheduling object is the ready frontier.

The frontier answers:

```text
Which branch work is now lawful to dispatch?
Why are its parents complete?
Which observed state proves current inputs?
What output/write territory may it affect?
Which siblings can run at the same time?
Which branches must serialize?
Which fan-in gate will consume its result?
Which idempotency keys are already admitted or rejected?
```

The parent graph should be derived in this order:

1. GTL graph-vector source/target and graph-function environment truth.
2. Explicit `inputs`/`outputs` or equivalent typed node declarations.
3. Published graph-function composition, recursion, fan-out, fan-in, and gate
   structure.
4. ABG output-allocation and target-carrier truth.
5. Product-supplied dependency overlays, when a domain needs topology ABG cannot
   infer from GTL alone.
6. Admitted observed-state refs for mutable workspace/register inputs.

ABG should not infer product-specific dependencies from filenames, prompt text,
or worker prose. If `odd_sdlc` computes a module dependency map, that map is a
product-owned input to ABG. ABG admits and schedules against it; ABG does not
invent SDLC topology.

## Frontier Selection

`selectDisjointReadyBranches(...)` is a policy decision over a replay-derived
frontier. It should be explicit, deterministic, and replay-explainable.

Default selection policy:

1. filter to rows whose parents are closed or otherwise lawfully satisfied
2. filter out rows with stale or missing observed-state refs
3. filter out rows whose idempotency key is already admitted, rejected, or
   currently leased in a way projection treats as active
4. sort by declared priority, then critical-path/dependency depth when present,
   then stable branch identity
5. greedily select rows whose write territories are disjoint from already
   selected and already leased active branches
6. stop at declared resource caps

Products may provide priority policy inputs, but ABG owns the admission and
projection of the selected frontier. A product policy cannot make an
inadmissible branch ready, cannot bypass observed-state freshness, and cannot
override write-territory conflict law.

Human-gate branches are frontier rows too. They may remain pending for a long
time without holding compute capacity. Their timeout and escalation policy
should be F_H-aware; an idle human gate is not the same failure class as a hung
process worker.

## Promise Graph As Local Realization

The promise graph is the simplest local realization of the saga frontier.

```ts
type EdgePromise = Promise<EdgeClosureResult>;

async function runEdge(input: {
  edgeRef: string;
  parentPromises: readonly EdgePromise[];
  dispatch: (edgeRef: string) => Promise<EdgeClosureResult>;
}): Promise<EdgeClosureResult> {
  await Promise.all(input.parentPromises);
  return await input.dispatch(input.edgeRef);
}
```

This model is attractive because parent dependencies become language-level
blocking. Siblings whose parents resolve unblock together. Fan-in is explicit at
the child by `Promise.all(parents)`. The JS event loop supplies the local
scheduler.

But the promise graph must remain ephemeral.

The durable version is:

```text
parents complete?
  replay DependencyFrontierProjection

edge already closed?
  replay SagaProjection / closed vector projection

input workspace state current?
  replay ObservedStateProjection and compare watermark/digest

dispatch already in flight?
  replay BranchLeaseProjection and BranchLivenessProjection

result admitted?
  replay PayloadLedger and AssuranceProjection
```

On restart:

1. replay events
2. rebuild saga projection
3. rebuild dependency frontier
4. resolve already-closed branch promises immediately from projection
5. reacquire or recover branch leases for incomplete work
6. dispatch only frontier rows that remain lawful under current observed state

The promise graph is a runtime convenience over the saga projection. It is never
the source of truth.

## Stateful Workspace Rule

The mutable workspace is real. The defect is not reading it. The defect is
reading it privately.

Every workspace fact that affects selection, routing, pressure, readiness,
write-territory admission, fan-in, retry, compensation, or closure must be
admitted as observed state:

```text
source kind
scope ref
source ref
digest or version
event watermark
freshness policy
derivation basis
derived-from refs
```

The branch dispatch contract must preserve which observed-state refs it used.
The branch result must admit the output state it produced before downstream
branches treat that state as present.

A branch promise resolves only after its output is event-visible:

```text
worker exits
-> result payload observed
-> output materialization observed
-> evidence admitted
-> closure/continuation projected
-> promise resolves
```

That rule is what lets in-memory async execution and event-sourced recovery
agree.

## Write Territory And Parallel Safety

Parallelism is lawful only when declared write territories are disjoint.

Each dispatchable branch needs:

```text
branch_ref
graph_call_id
frame_id
vector_ref or action_ref
parent refs
read refs
observed_state refs
allowed_write_roots
expected_output_refs
fan_in_scope_ref
retry policy
lease policy
```

ABG can admit a parallel batch only when:

- every branch parent is closed or otherwise lawfully satisfied
- every branch has current observed-state refs
- every branch has a declared output allocation or write root
- write territories in the batch are pairwise disjoint
- read overlap does not imply write conflict
- shared substrate writes are either append-only event writes or separately
  serialized
- branch leases are visible in replay

Overlapping writes do not fail the saga by default. They serialize unless a
stronger product-owned merge contract is declared.

## Reliability And Operational Policy Contracts

The saga runner needs policy carriers, but those carriers consume existing ABG
law. They should not introduce a new runtime theory.

One compact carrier may be enough:

```text
BranchExecutionPolicy =
  retry_policy
  timeout_policy
  cancellation_policy
  resource_policy
  lease_policy
```

Retry policy should use the existing ABG retry failure classes. The current
retry allowlist is:

```text
transport_failure
no_output
contract_failure
```

Other failure classes block, escalate, compensate, or re-enter according to
declared continuation and assurance law. They do not become retryable by local
runner discretion.

Timeout policy should distinguish:

- no-output timeout
- inactivity timeout from runtime liveness projection
- hard safety cap
- F_H waiting state

Cancellation policy should distinguish:

- cooperative interruption signal
- grace interval
- forceful termination
- evidence preservation rule
- branch-attempt supersession rule

Resource policy should distinguish:

- max concurrency
- per-resource caps when known
- queueing policy under capacity pressure
- preemption policy, if any

Lease policy should include:

- lease identity
- lease ttl or freshness condition
- renewal rule
- expiry event/projection rule
- recovery behavior when a runner crashes while holding a lease

Event-store unavailability is a hard semantic boundary. A runner that cannot
append or verify event admission may not dispatch new branch work or claim
closure. It may preserve local process evidence for later admission, interrupt
workers, or yield a controlled runtime condition, but it must not keep advancing
from private memory as if runtime truth had been written.

Event ordering should reuse ABG event admission order. Within one aggregate
scope, replay must have a deterministic order. A distributed substrate may
materialize that order through conditional append, aggregate-local sequence, or
another ABG-admitted event-envelope field, but it should not introduce wall-clock
completion order as semantic ordering for fan-in.

## Fan-In And Deterministic Merge

Fan-in is not "wait until all promises return and concatenate results."

Fan-in is a replay-derived merge admission step.

It must answer:

```text
Which branches are included?
Which parent/dependency refs justified them?
Which branch outputs were admitted?
Is order declared significant or irrelevant?
If order is significant, what ordering law applies?
If branches conflict, what merge or compensation policy applies?
Which aggregate projection becomes the downstream input?
```

Default ordering should be deterministic:

- declared order from GTL or product dependency map when present
- otherwise stable sort by branch identity
- no reliance on wall-clock completion order unless the ordering policy declares
  completion order as authority

Fan-in should emit or admit enough event truth for replay to reconstruct the
aggregate input without re-running workers.

## Compensation, Correction, And Reopen

Saga compensation is not rollback.

ABG's event log remains truthful. A bad branch result is handled by one of:

- reject payload or evidence admission
- mark branch non-progress
- plan retry
- append correction
- supersede stale branch output
- compensate by scoped revocation plus corrective work
- reopen frame or continuation with fresh attempt identity
- route constitutional re-entry
- block or escalate

No correction destroys history. Prior events remain evidence and prior
projections become stale under replay.

A compensation command must name:

```text
scope_ref
event refs being compensated
reason class
authority/evidence refs
corrective graph action or no-action disposition
expected write territory
closure or review policy
```

## Observability And Self-Healing

Observability has four layers:

- events: admitted facts
- projections: replay-derived current state
- metrics: operational read models over event/projection truth
- traces: causation/correlation views over event identity

Metrics and traces are not authority. They are operator read models. Useful
metrics include branch duration, dispatch latency, fan-in wait time, retry count,
lease wait time, write-conflict serialization rate, timeout count, cancellation
count, stale-observation rejection count, and idempotency conflict count.

`PublicConstructionProgressProjection` should expose at least:

```text
saga_ref
graph_call_id
frame_id
frontier_ref
frontier_rows:
  branch_ref
  parent_refs
  state:
    blocked_by_parents
    ready
    leased
    dispatched
    awaiting_evidence
    awaiting_human
    retry_pending
    compensated
    closed
    blocked
    escalated
  active_attempt_ref
  observed_state_refs
  write_territory_ref
  fan_in_scope_ref
  latest_liveness_ref
  latest_policy_disposition
aggregate:
  ready_count
  active_count
  blocked_count
  closed_count
  critical_path_estimate when declared
```

Self-healing is policy-driven projection plus command emission. It is not a
private watchdog loop.

Default watchdog table:

| Condition from projection | Runtime truth emitted or admitted | Policy reaction |
| --- | --- | --- |
| no output before no-output timeout | branch non-progress / timeout observation | retry if failure class is retryable, else block or compensate |
| inactivity beyond liveness policy | runtime liveness disposition | cooperative cancel, retry, yield continuation, or escalate |
| hard cap reached | cancellation/interruption observation | terminate attempt, preserve evidence, block or compensate |
| lease expired without current liveness | lease expiry truth | release lease and allow fresh attempt if policy permits |
| idempotency conflict | rejection/correction truth | block branch or route F_H review |
| observed-state stale before dispatch | observation rejection | re-observe or block if freshness cannot be restored |
| write conflict with active branch | write-territory conflict projection | serialize or queue |

Workspace writes should use branch-scoped staging by default:

```text
allowed_write_root / branch_ref / attempt_ref / staging
```

The branch output becomes visible to downstream branches only after admission
publishes or merges the staged result under the declared output allocation.
Partial writes from cancelled or failed attempts remain evidence or are cleaned
by compensation policy; they do not become current workspace truth by accident.

## Local Runner Shape

A first local runner can stay small.

The target is not a distributed system first. The target is one correct local
saga runner whose state model can later move to a distributed substrate.

Sketch:

```ts
async function runSaga(input: SagaRunInput): Promise<SagaRunResult> {
  let projection = replaySaga(input.events, input.gtlModule);

  while (!projection.terminal) {
    const observed = await admitRequiredObservedState(input, projection);
    projection = replaySaga([...input.events, ...observed.events], input.gtlModule);

    const frontier = deriveDependencyFrontier(projection);
    const batch = selectDisjointReadyBranches(frontier, input.maxConcurrency);

    if (batch.length === 0) {
      return yieldOrBlock(projection, frontier);
    }

    const leases = admitBranchLeases(batch);
    const results = await Promise.all(
      leases.map((lease) => dispatchAndAdmitBranch(lease))
    );

    projection = replaySaga(
      [...input.events, ...observed.events, ...leases.events, ...results.events],
      input.gtlModule
    );
  }

  return projectSagaResult(projection);
}
```

That sketch hides details, but it preserves the important shape:

- replay before decision
- observe before selection when state matters
- derive frontier from projection
- dispatch only disjoint lawful branches
- admit results before downstream work
- replay after every admitted event batch
- terminal state from projection, not from Promise completion alone

## Cloud/Substrate Mapping

The cloud strategy remains a substrate mapping, not the semantic core.

Local:

- event store: JSONL or typed event files
- projections: pure functions
- dispatch frontier: in-process queue / promise graph
- leases: local event/admission records
- workers: process, PTY, API, or attached transport

Cloud:

- event store: DynamoDB or equivalent append-only event ledger
- projections: DynamoDB streams, Lambda/projector workers, materialized views
- dispatch frontier: SQS/EventBridge or equivalent ready-work queues
- leases: conditional writes over branch/work territory identity
- workers: Lambda, ECS, Batch, CodeBuild, Bedrock, remote agents
- artifacts: S3 or content-addressed store

The cloud version should not make Step Functions the semantic owner. Step
Functions, Durable Functions, Temporal, or other orchestration systems may host
the ready frontier and wait states, but ABG still owns event, projection,
lineage, retry, fan-in, and closure truth.

## Relationship To odd_sdlc

`odd_sdlc` should compute product-specific construction dependency maps.

ABG should provide the runtime that can execute an admitted dependency map:

```text
odd_sdlc:
  derive module/test dependency map
  select steel-thread or dependency-isolated parallel traversal
  declare write/output targets and evidence expectations

ABG:
  admit dependency map as input/observed/product truth
  derive ready frontier
  enforce parent dependencies and write territory
  dispatch branches
  admit results and evidence
  project fan-in, retry, compensation, closure, block, or escalation
```

That split preserves the product/runtime boundary. ABG does not decide SDLC
module topology. `odd_sdlc` does not implement private async worker orchestration
to compensate for missing ABG saga semantics.

## Ticket Shape

This should be ticketed as ABG work, not hidden in an `odd_sdlc` runtime reader.

Suggested ticket sequence:

1. **Declare ABG saga frontier law**
   - Requirement/design reframe.
   - Define `SagaProjection`, `DependencyFrontierProjection`, branch identity,
     idempotency admission, branch lease, write-territory conflict projection,
     and deterministic fan-in law.
   - Preserve current serial runner as the degenerate one-branch case.

2. **Strengthen dispatch carriers for branch work**
   - Add branch identity, parent refs, observed-state refs, allowed write
     territory, fan-in scope, lease refs, and frontier projection ref/digest to
     dispatch/request carriers.
   - Ensure payload/evidence admission preserves branch identity.
   - Add idempotency key derivation and duplicate/late-result admission rules.

3. **Implement local dependency-ready saga runner**
   - Pure frontier derivation.
   - Disjoint write-territory batch selection.
   - Promise-graph local execution.
   - Replay after branch event batches.
   - Restart proof from event stream and observed-state records.
   - Consume declared retry, timeout, cancellation, resource, and lease policy
     through existing runtime liveness/retry/projection law.

4. **Add fan-in and compensation proof lanes**
   - Deterministic fan-in over multiple branch outputs.
   - Branch failure routes to retry, block, compensation, or reentry without
     erasing prior events.

5. **Connect odd_sdlc as a consumer**
   - Consume admitted module/test dependency maps.
   - Prove steel-thread first, then dependency-isolated parallel component/test
     work.
   - Keep product topology in `odd_sdlc`, runtime fan-out in ABG.

## Acceptance Proofs

The first complete proof set should include:

1. **Serial equivalence**
   - A graph with no independent branches produces the same projection as the
     existing serial runner.

2. **Critical-path timing**
   - A five-branch independent graph completes in approximately the longest
     branch duration plus fan-in overhead, not the sum of branch durations.

3. **Dependency blocking**
   - A child branch does not dispatch until all declared parents are closed or
     lawfully satisfied.

4. **Write conflict serialization**
   - Two branches with overlapping write territory do not run concurrently.

5. **Read overlap allowed**
   - Two branches with shared read refs and disjoint writes may run concurrently.

6. **Restart recovery**
   - Kill the runner after some branches close and others are in flight.
   - Replay events and observed-state records.
   - Closed branches resolve from projection; incomplete branches are retried,
     recovered, blocked, or continued according to runtime truth.

7. **Fan-in determinism**
   - Branch completion order differs across runs, but fan-in projection is stable.

8. **Compensation**
   - One admitted branch output is later superseded or rejected; compensation
     appends corrective truth and downstream projection changes without deleting
     prior events.

9. **Observed-state freshness**
   - A branch dispatch using stale workspace digest fails closed or re-observes
     before dispatch.

10. **odd_sdlc dependency-map consumer**
    - An admitted SDLC module dependency map produces steel-thread traversal first
      and then dependency-isolated parallel branch work without `odd_sdlc`
      owning async orchestration.

11. **Idempotent duplicate admission**
    - The same branch result is delivered twice under the same idempotency key.
    - Projection admits one logical result; duplicate delivery replays prior
      admission or emits a typed duplicate rejection without changing closure.

12. **Late result after retry**
    - Attempt 1 times out and attempt 2 closes the branch.
    - A late attempt-1 result is preserved as historical evidence but cannot
      supersede the current branch closure without correction/reopen truth.

13. **Lease expiry recovery**
    - The runner crashes while holding a branch lease.
    - Replay plus liveness/lease policy projects lease expiry.
    - A fresh attempt can acquire the branch without colliding with the dead
      attempt.

14. **Retry budget exhaustion**
    - A retryable failure repeats until policy budget is exhausted.
    - Projection routes to block, compensation, F_H, or re-entry according to
      declared policy; the runner does not keep retrying privately.

15. **Timeout and cancellation evidence**
    - A hung branch hits hard cap.
    - Runtime emits/admits cancellation and liveness truth, preserves available
      evidence refs, and prevents the attempt from closing later by accident.

16. **Progress observability**
    - An operator queries public construction progress mid-flight.
    - The projection reports ready, leased, dispatched, awaiting evidence,
      awaiting human, retry, closed, blocked, and compensated rows from admitted
      truth only.

17. **Mid-write abort cleanliness**
    - A worker is killed while writing branch output.
    - Partial staged output does not become downstream current state.
    - Retry or compensation proceeds from admitted evidence and observed-state
      truth.

## Non-Closure Conditions

The work is not closed if:

- a controller-local ready set owns truth outside replay
- in-memory promises are required to recover current state
- branch identity is implicit or derived from worker prose/completion order
- idempotency keys are missing for branch commands/results
- duplicate branch result delivery can create two logical closures
- late results from superseded attempts can close current branch without
  correction/reopen truth
- branch completion order affects fan-in without declared ordering law
- branch workers write outside declared output allocation/write territory
- overlapping writes are allowed without merge admission
- branch leases have no replay-visible expiry/recovery behavior
- retry, timeout, cancellation, and resource decisions live only in runner-local
  state
- event-store unavailability still permits new branch dispatch or closure claims
- partial writes from cancelled/failed branches become visible downstream without
  admission
- worker success, transport success, or file presence closes branches without
  payload/evidence/assurance admission
- compensation deletes or rewrites event history
- `odd_sdlc` product dependency maps become ABG product topology law
- a cloud orchestration service becomes the source of runtime truth
- current serial vector-index closure law remains the only projection path for
  graphs that declare independent branches

## Final Position

The next ABG runtime target should be described as:

```text
an event-sourced saga interpreter for GTL graph-function invocations, with a
dependency-ready frontier, replay-derived branch/fan-in projections, admitted
workspace state, and write-territory-safe parallel dispatch.
```

That wording preserves the original architecture:

- event sourcing is the runtime truth model
- saga is the long-running control pattern
- GTL is the language
- ABG is the interpreter
- workspace state is real but admitted
- parallelism is dependency- and write-territory-governed
- promise graphs are a local implementation tactic, not authority
- cloud orchestration is a substrate mapping, not semantics
