# T-287 Wave 1 Terminal Run Barrier Design Reframe And Coding Plan

**Type**: STRATEGY  
**Status**: Frozen proposed design subject; not ratified; no checklist closure  
**Ticket**: T-287  
**Wave**: A5-F10 Wave 1  
**Re-entry class**: `design_reframe`  
**Base HEAD**: `a1fa19f68213aa0773b88b3b6ef9ba2e41f5ee99`  
**Accepted checkpoint retained**: `1f6a860`  
**Rejected donor evidence**: user-identified dirty frozen candidate `abac6114...`; inspected selectively and not transplanted  
**Authority line read**: repo instructions; `GOALS.md`; `INTENT.md`; `PRODUCT.md`; A5-F10 requirements; accepted design README and `ABI5_REALIZATION_CONSTITUTION.md`; T-287; installed immutable STDO 2.2.2; selective ABIogenesis 4.6 precedent  
**Realization/test edits in this subject**: none  

## Claim

Product and requirements remain stable. The accepted design is incomplete at
the relation between Run terminality, nested GraphCall/Frame lifecycle, CCall
history/currentness, retry, continuation, route/foldback, and closure. The
smallest lawful re-entry is therefore one bounded `design_reframe` that adds
the complete lifecycle network before any realization resumes.

The prime rule is:

> One validated admitted-event prefix and Event Calculus projection determine
> whether an exact Run-scoped transformation is available. Every producer that
> can open or advance runtime truth must join its exact current Run, Frame,
> locus, and consumed availability in that relation inside the append
> transaction. Unavailable or stale input appends zero events.

Historical truth and current transformation availability are separate facts
carried by one typed projection. Historical existence never grants current
write authority.

## Exact bounded design delta

### D1. Complete the entity/lifecycle network in Constitution section 6

Retain the accepted Run row and add the following rows. These rows are one
network; none may be accepted independently.

| Entity | Exact identity | Live states | Authoritative event truth | Current transformation law |
|---|---|---|---|---|
| Run | `runId` | `not_open -> active -> closed | stopped | failed` | `run_segment_opened`; `run_closed`; `run_stopped`; `runtime_failure_observed` | Only `active` admits a Run-scoped opening, advance, route, foldback, retry, continuation transition, or closure transaction. A terminal Run never becomes active again. Retry uses a fresh Run. |
| GraphCall | `graphCallId` within exact `runId` | `not_open -> active -> closed | blocked | failed` | `graph_call_opened`; `graph_call_closed`; terminal child route truth | A child GraphCall is subordinate to the same Run as its parent. A retry GraphCall is new. No GraphCall opens or closes under an inactive Run. |
| Frame | `frameId` within exact GraphCall and Run | `not_open -> active -> held -> active -> closed | blocked | failed` | `frame_opened`; hold/resume events; `frame_closed`; terminal child route truth | Active-only mutations require the exact active Frame. A held Frame admits only the exact continuation response/resume transition. Terminal child truth remains reconstructible after the child Frame ceases to be active. |
| traversal locus | `cursorRef` plus exact Run/GraphCall/Frame coordinates | `not_entered -> active -> consumed` | `traversal_cursor_entered`; `fh_interaction_resume_admitted`; `traversal_route_admitted` | A route consumes exactly one active source locus and its declared availability. It may initiate one target locus. Run terminality terminates every still-active locus owned by that Run. |
| CCall | `cCallRef` plus exact Run/GraphCall/Frame/locus attempt coordinates | `not_open -> active -> judged` | `c_call_opened`; fibre/evidence/result/judgment spine | Its exact admitted history is durable. Evidence, result, and judgment admission require the current CCall phase and exact active Run/Frame/locus. Judgment ends only the matching active retry attempt; it does not consume the source locus. |
| retry attempt | `attemptRef` plus retry boundary, attempt index/path, Run/GraphCall/Frame | `not_open -> active -> progressed | judged | terminal` | `retry_attempt_opened`; `retry_progress_recorded`; matching `c_call_judged`; Run terminal event | A retry route consumes the prior locus, creates its target locus, and only then permits the exact retry attempt. Run failure, stop, or close terminates every active retry attempt/progress availability in that Run. |
| child traversal | exact child GraphCall/Frame and parent waiting locus within one Run | `open -> closed | blocked | failed -> folded_back | refused` | child close or child terminal route; `child_foldback_admitted` or preparation refusal | Child terminal truth is durable historical truth. It is currently foldback-available exactly while the shared Run and parent Frame/locus remain active and the child terminal token is unconsumed. |
| F_H continuation | `continuationRef` plus exact Run/GraphCall/Frame/held locus | `not_open -> open -> responded -> resolved | abandoned | superseded` | `fh_interaction_opened`; `fh_interaction_responded`; `fh_interaction_resume_admitted`; `continuation_terminated`; Run terminal event | Public ingress reconstructs the continuation from admitted events. It may append a public operation or response/resume only for the exact current state. Terminal status never reopens in the same Run. |
| closure | `closureRef` over exact terminal route, Frame, GraphCall, and optional Run | `not_available -> available -> admitted` | `terminal_reached`; `frame_closed`; `graph_call_closed`; root `run_closed` | Root and interaction closure require an active Run and exact unconsumed terminal route and append one atomic closure batch. Child closure leaves the shared Run active. No closure event may append after Run failed, stopped, or closed. |

The relationship diagram added to section 6 shall be:

```text
Run(active)
  -> GraphCall(parent, active)
     -> Frame(parent, active|held)
        -> locus(parent, active)
           -> CCall/history + availability
           -> retry attempt
           -> child GraphCall(same Run)
              -> child Frame
                 -> child terminal history
           <- foldback availability, only while parent and Run are active
           -> route consumes locus/availability
        -> closure consumes terminal route
  -> exactly one of closed | stopped | failed
     -> zero new Run-scoped active effects
```

### D2. Ratify one typed current-transformation relation

Add `RuntimeTransformationAvailability` as an accepted owner relation. It is a
typed projection over one `ValidatedRuntimeEventPrefix` and its Event Calculus
projection, not a second event scan or another runtime state register.

Its closed request union carries:

- `purpose`: the exact operation class, including child open, locus enter,
  CCall phase, actor active observation, retry open/progress, route, foldback,
  continuation open/respond/resume, child closure, root closure, Run stop, or
  runtime failure;
- exact `runId`, `graphCallId`, `frameId`, and `locusRef` when the purpose owns
  them;
- exact historical source refs and availability refs the purpose consumes;
- exact retry/child/continuation coordinates when applicable; and
- the selected prefix digest and terminal-event identity, if any.

Its closed result union is:

```text
available {
  selectedPrefixDigest,
  runActiveRef,
  frameActiveRef,
  locusActiveRef,
  requiredAvailabilityRefs,
  consumedByPurpose
}
|
unavailable {
  selectedPrefixDigest,
  reason:
    run_not_open | run_failed | run_stopped | run_closed |
    graph_call_inactive | frame_inactive | frame_held |
    locus_inactive | history_absent | availability_absent |
    availability_consumed | retry_inactive | continuation_not_current |
    child_truth_not_current | closure_not_current | stale_prefix,
  historicalRefs
}
```

An availability result is evidence for a decision, not a reusable capability.
The owner admission function must re-project the relation under the event
store transaction, compare the expected prefix digest, and append the whole
event batch only if it is still `available`. Any `unavailable` result or stale
prefix returns/refuses before append and changes neither event count nor prefix
digest.

The event store shall publish no bypass for Run-scoped active-effect admission.
Workspace-scoped admissions remain outside this Run relation. The event-kind
catalog shall give every Run-scoped kind one closed effect class:

- `opens_or_advances`: requires the availability relation and cannot append to
  a terminal Run;
- `terminalizes_run`: requires the Run active in the same transaction and can
  occur once;
- `terminalizes_subordinate`: requires the Run active, except when it is part
  of the same atomic Run-terminal transaction;
- `post_terminal_observation`: narrowly allowlisted actor/process cleanup
  observations that initiate no active/open/live/pending/available
  transformation fluent; or
- `workspace_only`.

`post_terminal_observation` is not authority to continue execution. Actor
binding/start/process-start/stdout/stderr/result observations are
`opens_or_advances`. Only exact cleanup facts such as exit or termination
failure may be classified post-terminal, and their EC effects must be
termination-only. Route, foldback, retry, Public continuation operations,
closure, and a second Run-terminal event are never post-terminal observations.

### D3. Parent and child use one Run; foldback never crosses Run terminality

Ratify the current structural identity: `openChildCall` creates a fresh child
GraphCall and Frame beneath the parent but reuses the exact parent `runId`.
This matches one public execution attempt and the Product recursive episode.

Consequences:

1. `return_to_parent` child completion never emits `run_stopped`, for either
   blocked or failed child disposition.
2. Child close, blocked, and failed truth is a durable typed child terminal
   projection reconstructed from admitted child events. It does not require
   the child Frame to remain active.
3. Parent foldback requires that durable child truth plus current shared-Run,
   parent-Frame, parent-locus, and unconsumed foldback availability.
4. A child terminal event accompanied by `run_stopped` terminalizes the shared
   Run. Parent foldback is then unavailable and appends zero. No projection may
   call that foldback current.
5. `terminalizeRun` is derived from root-versus-`return_to_parent` mode. Remove
   semantic exceptions such as `deferFailedRunStop`; implementation shape or a
   particular graph-function name cannot decide terminality.
6. Parent foldback consumes its exact child terminal/refusal token exactly
   once. Replaying the durable child truth does not recreate availability.

### D4. Separate exact CCall history from current availability in one API

Add one owner projection, `projectCCallTransformation`, with this shape:

```text
CCallTransformationProjection {
  history: ExactCCallHistoryProjection | null,
  current: RuntimeTransformationAvailability
}
```

`ExactCCallHistoryProjection` reconstructs the exact open/fibre/evidence/
result/judgment sequence through the judgment event from the validated prefix.
It remains reproducible after route consumption, child execution, Run stop,
Run failure, or Run close. It never asserts currentness.

The `current` arm joins a declared purpose to current Run/Frame/locus and exact
availability fluents. CCall phase producers select their phase availability;
route, foldback, continuation, closure, and deferred application select the
judgment/result/child/terminal availability they consume.

Retire the exported semantic meaning of
`hasCurrentAdmittedCCallResult`, `hasCurrentAdmittedCCallOutcome`, and caller
object identity. Rename/internalize purely historical helpers. WeakSets may
not decide history, freshness, duplication, or mutation authority.

All CCall consumers use the same projection:

- traversal route evidence selection;
- retry progress and retry route selection;
- child preparation/foldback and application foldback;
- F_H open/respond/resume reconstruction;
- terminal closure evidence;
- deferred application recovery;
- HoG leaf/recursive/workflow execution; and
- Public continuation operations and fresh-process replay.

### D5. Define continuation terminal lifecycle and Event Calculus effects

Add the single event kind `continuation_terminated`, reusing the prime event
shape established in 4.6 but not its old aggregate runtime implementation. Its
5.0 payload carries exact continuation/Run/GraphCall/Frame coordinates,
`terminalStatus: abandoned | superseded`, a closed terminal cause, and a
`successorRunId` only for `superseded`.

Lifecycle law:

- `fh_interaction_resume_admitted` resolves the continuation and consumes open,
  pending, response, and held-Frame availability.
- `runtime_failure_observed` abandons every still-open/responded continuation
  in the exact Run.
- `run_stopped` abandons every still-open/responded continuation unless the
  same atomic terminal transaction contains its exact
  `continuation_terminated(terminalStatus=superseded)` row.
- Supersession requires a distinct deterministic successor `runId`; the new
  Run and any new continuation cite the old terminal truth causally. It never
  reopens the old Run or continuation.
- `run_closed` is admissible only when no continuation is open/responded. Its
  EC effect nevertheless terminates any continuation availability in its Run;
  replay treats a close over a live continuation as invalid admitted history,
  not as successful abandonment.
- A terminal Run event clips all residual continuation-open, pending,
  response-available, and held-Frame current fluents in that Run.
- Public ingress reconstructs status from admitted events. `abandoned`,
  `superseded`, and `resolved` refuse respond/continue before
  `public_operation_admitted`, so stale ingress appends zero.

The Run stop/failure admission owner appends required continuation termination
rows and the Run terminal event as one transaction. No continuation terminal
row may be appended after the Run terminal event.

### D6. Make retry and locus termination effects scope-complete

Event Calculus shall maintain event-derived ownership coordinates for active
fluents. This is an internal derivation from the selected prefix, not durable
parallel state.

| Event | Exact locus effect | Exact retry effect |
|---|---|---|
| `c_call_judged` | does not consume source locus; route still owns that transition | terminates the active retry attempt matching Run, Frame, attempt index/path, and CCall; no unrelated attempt |
| `traversal_route_admitted` | terminates exact source locus and declared consumed availability; initiates exact target locus when route kind has one | retry route makes the target locus eligible for one subsequent exact retry attempt; it does not revive a prior attempt |
| `retry_progress_recorded` | none until the retry route consumes the source locus | terminates exact active attempt and initiates exact progress availability |
| `runtime_failure_observed` | terminates every active locus in the exact Run | terminates every active retry attempt and retry-progress availability in the exact Run |
| `run_stopped` | same Run-wide termination | same Run-wide termination |
| `run_closed` | same Run-wide termination | same Run-wide termination |

Static event-kind effect declarations and dynamic effects must agree. An
identity-less fluent termination that cannot match its initiated fluent is a
design violation, not proof of termination.

### D7. Closure is one guarded terminal transaction

Root and interaction closure shall:

1. reconstruct exact historical route/result/judgment evidence;
2. require current Run, GraphCall, Frame, terminal-route availability, and no
   open continuation/retry authority through
   `RuntimeTransformationAvailability`;
3. append `terminal_reached`, `frame_closed`, `graph_call_closed`, and
   `run_closed` as one atomic ordered batch; and
4. revalidate the selected prefix inside that transaction.

Child closure appends its three child terminal rows atomically while the
shared Run and parent waiting relation are current. It does not append
`run_closed`.

After `runtime_failure_observed`, `run_stopped`, or `run_closed`, every closure
entry point returns/refuses with zero appended events. `refuseClosure` may
terminalize an active Run for an active invalid closure attempt, but it may not
append a runtime failure to an already terminal Run.

### D8. Give deferred application one non-contradictory projection

Do not add a current-only deferred object plus a second boolean authority
check. Add one `DeferredApplicationProjection` composed from
`projectCCallTransformation`:

```text
DeferredApplicationProjection {
  historicalCompletion: ExactCCallHistoryProjection,
  current: RuntimeTransformationAvailability
}
```

Historical completion is reconstructed through its exact judgment event and
remains readable later. Application, child open, route, or foldback is admitted
only when `current` is `available` for that exact purpose. Consumption or Run
terminality changes only the current arm. The historical arm never disappears
and never grants authority.

### D9. Amend the algorithm catalog before realization

In Constitution section 10, declare:

- **reuse**: validated event prefix selection, Event Calculus fold,
  content-addressed replay, existing child GraphCall/Frame identity, and
  event-store transaction;
- **extension**: Event Calculus contextual ownership/Run-wide clipping,
  replay continuation terminal states, and event-store effect-class admission;
- **addition**: `RuntimeTransformationAvailability`,
  `projectCCallTransformation`, the typed child-terminal/foldback projection,
  and the unified `DeferredApplicationProjection`; and
- **retirement/internalization**: semantic WeakSet membership, latest raw-event
  scans, caller-carried replay objects as current authority, current-named
  historical CCall booleans, and the donor's split current deferred API.

No new algorithm or file is implementation-authorized until this delta is
assessed and ratified under the Constitution change path.

## Affected producer and consumer census

### Run-scoped producers to migrate

| Owner file | Producer surface | Required relation |
|---|---|---|
| `abg/open_call.ts` | `openCall`, `openChildCall` | root `not_open` uniqueness; child current shared Run/parent Frame/locus |
| `abg/execution_basis.ts` | `admitChildExecutionBasis` | current shared Run/parent Frame; workspace basis admissions remain workspace-only |
| `abg/traversal_cursor.ts` | `admitInitialTraversalCursor` | exact current Run/Frame and one not-yet-entered locus |
| `abg/c_call.ts` | child refusal/foldback, all CCall open variants, pending interaction, evidence, result, judgment, rejected completion | purpose-specific Run/Frame/locus/CCall phase and exact availability |
| `abg/actor_process.ts` | transport binding, invocation/process start, streams, result, close/fail/cleanup | active event kinds use current CCall/Run/Frame/locus; cleanup uses closed post-terminal allowlist only |
| `abg/retry.ts` | `admitRetryAttempt`, `admitRetryProgress` | current retry target locus or exact active attempt/judgment |
| `abg/fan_out.ts` | `admitFanOutCompletion` | current Run/Frame/locus and exact fan-out completion inputs |
| `abg/traversal_route.ts` | `admitRoute`, `admitRecursionRoute`, route-plus-stop batches | exact current source locus and consumed evidence; root terminal mode only |
| `abg/graph_application.ts` | application child refusal/foldback | durable child truth plus current shared Run/parent Frame/locus/unconsumed token |
| `abg/continuation.ts` | Public operation, F_H open/response/resume, continuation termination | reconstructed continuation plus exact lifecycle availability |
| `abg/runtime_failure.ts` | `admitRuntimeFailure` | exactly one active Run terminal transition; subordinate terminal effects in same transaction |
| `abg/closure.ts` | refusal, root/interaction/child closure | exact active closure availability; atomic batch; zero after terminal |
| `abg/invocation_admission.ts` | initial run invocation only | remains workspace admission before Run; continuation operations are owned by `continuation.ts` and cannot pre-append |

`abg/catalog_admission.ts` and `abg/environment_admission.ts` are
workspace/install admission, not Run-active producers. They remain outside the
barrier unless their event coordinates are changed to Run scope.

### Orchestration consumers to migrate

- `hog/execute.ts`: all leaf, retry, recursive/application, workflow,
  continuation, route, foldback, failure, and closure call sites;
- `hog/structural_execute.ts`: retry/route call sites;
- `hog/graph_execute.ts`: runtime-failure terminalization;
- `public/operations.ts`: respond/continue reconstruction and failure paths;
- the Public child traversal port: parent/child same-Run opening, fresh-process
  reconstruction, and result transport; and
- `abg/index.ts`: export the typed projections and retire misleading current
  booleans.

### Competing authority to remove or internalize

The current base contains semantic WeakSets in `c_call.ts`, `retry.ts`,
`traversal_route.ts`, `fan_out.ts`, `traversal_cursor.ts`, `open_call.ts`, and
`actor_process.ts`. It also contains direct `readAll().find/filter/some` state
selection in CCall, retry, cursor, route, graph application, continuation,
closure, actor/process, and HoG deferred application paths.

The migration rule is not “no local iteration.” Exact event lookup inside the
validated-prefix/replay owner is lawful. A caller-level raw scan or WeakSet
that decides lifecycle, latest/current status, uniqueness, availability, or
write admission is competing authority and must disappear. Object brands may
remain only as non-semantic developer assertions after fresh-process event
reconstruction has already proved the fact; they cannot affect a result.

## Exact coding plan and migration order

1. **Ratify the design first.** Amend only the accepted Constitution sections
   6, 10, and the active application ledger after assessor acceptance. Freeze
   its exact blob/commit identity before code.
2. **Close carrier and event semantics.** In `event_store.ts`, add the event
   effect-class roster and `continuation_terminated` payload contract. Make
   Run-scoped active/terminal admission reachable only through a transaction
   that revalidates the selected prefix. Extend `event_prefix.ts` only with an
   exact prefix-through-event selector needed for historical reconstruction.
3. **Repair Event Calculus.** In `event_calculus.ts`, derive exact Run ownership
   of active loci, retries, continuations, actors, CCalls, Frames, and
   GraphCalls from events; implement the D5/D6 effects; make static/dynamic
   tables agree; export only typed fluent constructors needed by projections.
4. **Add the single availability owner.** Add
   `abg/runtime_transformation.ts` with
   `RuntimeTransformationAvailability` and its closed purpose union. It reuses
   validated prefix, EC, replay, and event-store transactions; it owns no
   durable state and performs no raw unvalidated scan.
5. **Make replay lifecycle-complete.** Extend `replay.ts` with explicit
   GraphCall/Frame/child terminal relations, continuation
   `resolved|abandoned|superseded`, retry/locus state, and invalid-history
   checks. Preserve exact historical projections independently from current
   availability.
6. **Unify CCall and deferred application.** Refactor `c_call.ts` around
   `projectCCallTransformation`; add the unified deferred projection in the
   same owner module unless a separate file is justified by the ratified
   catalog. Do not adopt the rejected donor's current-object/boolean split.
   Migrate CCall phase producers and remove semantic WeakSets/booleans.
7. **Migrate subordinate producers in causal order.** Update child basis/open,
   cursor, actor/process, retry, fan-out, route, graph application, and
   continuation. Ratify shared Run; delete implementation-specific failed-stop
   deferral; add one typed child terminal projection and exactly-once foldback.
8. **Migrate terminal owners.** Make continuation termination plus stop/failure
   atomic. Make closure batches atomic. Apply the terminal barrier to failure,
   stop, close, and post-terminal cleanup classification.
9. **Migrate HoG and Public consumers.** Replace caller-held currentness and
   raw scans in `hog/execute.ts`, `hog/structural_execute.ts`,
   `hog/graph_execute.ts`, Public operations, and the child port. Public
   respond/continue must reconstruct before any public operation event.
10. **Retire bypasses and publish exports.** Internalize raw append entry points
    for Run-scoped active effects, delete semantic WeakSet/current booleans,
    update `abg/index.ts`, and run a static census proving every affected
    producer routes through the typed relation.
11. **Only then build proof artifacts.** No fixture, proof JSON, ticket
    checkbox, generated evidence, or release claim changes before the live
    tests and fresh-process installed proof pass.

## Falsifiers

The design is false if any one of these observations is possible:

1. After each of `runtime_failure_observed`, `run_stopped`, and `run_closed`,
   any active-effect producer increases event count or changes prefix digest.
2. A producer obtains an available projection, another event consumes it, and
   the stale producer still appends.
3. A `return_to_parent` blocked or failed child emits `run_stopped`.
4. Parent foldback succeeds after any `run_stopped` for the shared Run.
5. Fresh-process replay cannot reconstruct a blocked/failed/closed child, or a
   second foldback consumes the same child terminal truth.
6. Exact CCall result/judgment history disappears after its availability is
   consumed, or historical existence alone permits route/application/
   continuation/closure.
7. An open/responded continuation remains current after Run failure/stop, a
   stale Public response/continue appends `public_operation_admitted`, or a
   closed Run contains a live continuation without replay rejection.
8. A superseded continuation reopens in the same Run or lacks a distinct
   causally linked successor Run identity.
9. Root, interaction, or child closure appends any closure or failure event
   after failed/stopped/closed Run truth.
10. `c_call_judged` leaves its exact retry attempt active, terminates a
    different attempt, or consumes the locus before route.
11. Run failure/stop/close leaves any locus, retry attempt/progress, held
    continuation, actor active/live, Frame, or GraphCall active in that Run.
12. Deferred application needs one API to recover history and another
    contradictory API to decide whether that same history is current.
13. A caller-level latest raw scan, process-local WeakSet, or caller-carried
    replay object can change lifecycle/admission truth after fresh-process
    reconstruction.
14. Static event-kind EC declarations claim a termination that the identityful
    dynamic fold cannot perform.
15. An async actor observation after Run terminal initiates any active, open,
    live, pending, or available transformation fluent.

## Proof gates after ratification and implementation

1. Module tests for exact EC effects and event-kind/effect-class census,
   including all D5/D6 matrix rows.
2. Table-driven zero-append tests invoking every producer after failed,
   stopped, and closed Run states; assert event count and prefix digest are
   unchanged.
3. Stale-prefix interleaving tests around route, retry, foldback, continuation,
   failure, and closure transactions.
4. Same-Run recursive tests for child closed, blocked, and failed foldback;
   exact-once consumption; explicit proof that child `run_stopped` forbids
   foldback.
5. Historical/current CCall tests before and after route consumption and all
   Run terminal states, including deferred application.
6. Continuation lifecycle tests for resolved, abandoned on runtime failure,
   abandoned on stop, explicit supersession to a fresh Run, illegal close with
   live continuation, and stale Public ingress zero append.
7. Retry/locus parity tests for matching judgment, progress, route, and each
   Run terminal kind, including unrelated coordinate non-interference.
8. Atomic closure tests proving no visible partial closure prefix and no
   closure after terminal Run truth.
9. Async actor cleanup tests proving terminal observations cannot expose new
   transformation authority.
10. Static source census gates for Run-scoped raw append, direct semantic
    `readAll()` scans, and WeakSet authority in every affected owner/consumer.
11. Existing installed recursion, event-calculus runtime, and causal-result
    closure suites, followed by full candidate verification.
12. Fresh-process external installed-product proof: persist events, start a new
    process with no object identities, reconstruct child/CCall/continuation/
    retry/terminal truth, and obtain the same zero-append/currentness results.

No proof gate may be satisfied by fixture mutation, generated proof text, or a
ticket checkbox without the corresponding live runtime observation.

## Donor and 4.6 disposition

The rejected dirty donor is evidence only. Its prefix-through-judgment recovery
supports D4, but its child blocked projection treats a matching
`run_stopped` as current foldback truth despite the shared Run, and its
deferred application design splits one fact into a current object plus a
second authority boolean. Its partial Run-wide EC cleanup also omits required
retry/continuation parity. None of those edits are accepted code.

ABIogenesis 4.6 supplies precedent for one typed `continuation_terminated`
event and an EC termination of `continuation_open`. Its retry-specific payload
and aggregate projection are not imported. ABIogenesis 5.0 owns the exact
Run/Frame/locus/event-sourced design above.

## Assessor disposition

Unassessed. This post freezes a proposed design and coding-plan subject only.
It does not ratify the Constitution, authorize realization, accept the dirty
candidate, close a T-287 checklist row, or change accepted checkpoint
`1f6a860`.
