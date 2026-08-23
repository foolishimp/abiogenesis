# T-287 Terminal Quiescence Owner Network — Bounded Local Design Repair

**Type**: STRATEGY  
**Status**: Frozen replacement candidate for F_H ratification; not operative authority  
**Base design incorporated unchanged**: SHA-256 `c295a065fb95eba780692310e99de7b9aa967d1f93c8fb23b9815326adabead9`, Git blob `d31978aa0f859ee56f750a0fec88de20574fa019`  
**Replacement scope**: exactly four local relations below  
**Base HEAD**: `a1fa19f68213aa0773b88b3b6ef9ba2e41f5ee99`  
**Accepted checkpoint retained**: `1f6a86074bf995763b4caff286422b5b1501374b`  
**Product/requirements re-entry**: none  
**GOALS/T-287 proposal**: the base candidate's minimal focus reprice is retained unchanged  
**Production/tests/authority/ticket/GOALS edits**: none  

## Composition and supersession law

This file is a bounded normative repair overlay, not a second independent
design. The exact replacement candidate is the ordered composition:

```text
base design c295a065fb95eba780692310e99de7b9aa967d1f93c8fb23b9815326adabead9
then
this four-relation repair blob
```

All base claims, Prime/IACS rows, views, algorithm decisions, coding order,
falsifiers, and repricing language remain unchanged unless a row below
explicitly replaces them. This overlay replaces only:

1. the CCall `not_open`/opening relation in base sections 4, 11, 15, and 19;
2. continuation participation inside the repair-link relation in base sections
   9, 10.2, 14, 16 A5/A7, and 19 TV6/TV8;
3. Run quiescence and ActorInvocation/Process detail in base sections 4, 7, 8,
   14, 15, 16 A2/A3, and 19 TV2/TV3/TV9/TV11; and
4. migration census/trace reach in base sections 17 through 20.

No rejected predecessor wording revives through this composition.

## R1. CCall opening is one atomic transition

Replace the base CCall phase table and every `opened_unselected` reference
with this exact state machine:

| Phase | Durable prefix cardinality | Lawful transition |
|---|---|---|
| `not_open` | zero CCall rows | one owner transaction may append exactly one `c_call_opened` immediately followed by exactly one `c_call_fibre_selected` |
| `selected_no_evidence` | one open plus one matching fibre row at the immediately following ordinal with the open event as its exact cause; both appended by the same atomic owner transaction; zero evidence/result/judgment | evidence or result admission under the CCall owner predicate |
| `evidencing` | one open; one fibre; one-or-more unique evidence rows; zero result/judgment | another unique evidence or exactly one result |
| `result_admitted` | one open; one fibre; zero-or-more evidence; exactly one result; zero judgment | exactly one judgment |
| `judged` | one open; one fibre; zero-or-more evidence; one result; one judgment | no CCall phase append; named owner may consume judgment availability |
| `invalid` | opened-only, fibre-only, different-batch open/fibre, duplicate/mismatched fibre, orphan, duplicate/out-of-order result/judgment, or any post-judgment suffix | no append and no current projection |

The only opening transition is:

```text
not_open
  -- compareAndAppendExpectedPrefix([c_call_opened, c_call_fibre_selected]) -->
selected_no_evidence
```

There is no lawful durable `opened_unselected` state. A validated prefix that
ends between the two rows is invalid even if it was manufactured by a
historical prefix-through-event query; a validated semantic prefix may end
only before or after the atomic pair. The event store remains mechanical: the
CCall owner constructs the pair and the CCall projection validates exact
adjacent ordinals, open-to-fibre causation, coordinates, cardinality, and
payload equality. No durable batch aggregate or transaction identity is added.

Fibre-selection validation completes before the transaction. Missing,
ambiguous, mismatched, or refused selection returns the typed opening refusal
with zero CCall events. Rejection totalization starts only from
`selected_no_evidence`, `evidencing`, or `result_admitted`; it never repairs an
opened-only prefix.

Exact plan impact:

- `openCCall`, `openInteractionCCall`, and `openWorkflowCCall` each retain one
  two-event atomic batch and perform every selection check before it;
- `projectCCallPhase` rejects an opened-only prefix;
- `rehydrateWorkflowCCall`, retry-frontier rows, deferred application, route,
  child, continuation, and closure consume only the four lawful post-open
  phases; and
- source/proof census requires zero `opened_unselected`, open-then-select
  sequential append, or selection-refusal CCall event paths.

This replaces the base TV4 transition spelling only; CCall ownership,
historical/current separation, cardinalities after selection, and downstream
relations remain unchanged.

## R2. Repair-link continuation participation is closed `none | some`

Replace the base link's unconditional predecessor/successor continuation
fields with two independent closed members:

```text
PredecessorContinuationParticipation =
  { kind: "none" }
  |
  {
    kind: "some",
    continuationId,
    continuationKind,
    priorStatus: "open" | "responded",
    openedEventRef,
    respondedEventRef: string exactly when priorStatus is "responded",
    terminalDisposition: "abandoned" | "superseded",
    terminalEventRef,
    terminalEventDigest
  }

SuccessorContinuationParticipation =
  { kind: "none" }
  |
  {
    kind: "some",
    plannedContinuationId,
    continuationKind,
    plannedOpeningBasisRef,
    openedEventRef: null before successor opening | exact successor event ref after opening,
    openedEventDigest: null before successor opening | exact digest after opening
  }
```

`ContinuationReentryLink` always carries both discriminants. Continuation
terminal fields are forbidden for predecessor `none` and required exactly for
predecessor `some`. Planned/opened continuation fields are forbidden for
successor `none` and required exactly for successor `some` at the applicable
projection stage. No placeholder id, null-filled pseudo-member, inferred
continuation, or synthetic terminal/open event is admitted.

Allowed repair-link pairs are:

| Predecessor | Successor | Meaning |
|---|---|---|
| `none` | `none` | repair crosses Runs with no continuation participation |
| `some(abandoned)` | `none` | predecessor obligation is authoritatively abandoned and not carried forward |
| `some(superseded)` | `some` | unresolved obligation is carried forward as a fresh successor aggregate |

`none -> some`, `some(abandoned) -> some`, and
`some(superseded) -> none` are malformed link histories. A successor Run may
later open an unrelated same-Run continuation from its own admitted hold; that
event is not repair-link participation and does not rewrite the link.

For `some -> some`, the successor continuation id differs from every
predecessor continuation id, belongs to the fresh successor Run, and its
opening payload cites `linkRef/linkDigest`. Its same-Run `causedByEventId` and
all `causationEventRefs` name only successor-Run facts. The workspace link
carries predecessor terminal evidence in payload; no cross-Run causation is
introduced.

Admission/replay order remains predecessor terminal -> workspace link -> fresh
successor Run. Link admission validates predecessor `some` terminal evidence
only when present. Link consumption validates successor `some` planned
freshness only when present. Post-opening composite replay requires fresh
continuation opening evidence only for successor `some`. Wrong discriminant
fields, absent/many terminal or opening rows, id reuse, or cross-Run causation
invalidates/refuses with zero append.

This replaces only continuation participation inside base TV6/TV8 and A5/A7.
The fresh Run/GraphCall/Frame/locus/CCall/manifest, workKey, no-overlap,
frontier, and workspace-link laws remain unchanged.

## R3. Closed Run-owned fluent partition and exact actor cleanup

### R3.1 Closed partition

Replace every base phrase equivalent to “other declared transformation
availability,” “other live member,” or an open-ended Run-owned catch-all with
this closed partition over every Run-scoped fluent in the selected slice.

| Partition | Exact members | Closure rule |
|---|---|---|
| `closure_spine` | `run_active(runId)`; `graph_call_active(rootGraphCallId)`; `frame_active(rootFrameId)`; `terminal_route_available(terminalRouteRef)` | exactly these four matching the proposed closure may hold |
| `live_execution` | non-root `graph_call_active`; non-root `frame_active`; any `frame_held`; `locus_active`; `c_call_active`; `retry_attempt_active`; `actor_invocation_active`; `actor_process_active`; `actor_process_live`; `continuation_open`; `interaction_pending`; `parent_waiting_on_child` | must be empty |
| `consumable_authority` | `c_call_fibre_admitted`; `c_call_evidence_available`; `c_call_result_available`; `c_call_judgment_available`; `actor_transport_binding_admitted`; `actor_stdout_available`; `actor_stderr_available`; `actor_result_artifact_available`; `retry_progress_available`; `child_preparation_refused`; `child_foldback_available`; `fan_out_completion_available`; `fan_out_vector_available`; `fan_out_partial_stop_available`; `hold_route_admitted`; `continuation_response_available`; `construction_intent_available`; every `terminal_route_available` other than the named closure route | must be empty |
| `cleanup_pending` | `actor_cleanup_pending(actorInvocationRef, processRef, runTerminalEventRef)` | absent for closure; after stop/failure, one token per formerly active ActorInvocation and consumed exactly once by its terminal ActorInvocation cleanup row |
| `terminal_historical` | `frame_closed`; `frame_blocked`; `frame_failed`; `graph_call_closed`; `terminal_admitted`; `continuation_terminated(resolved)`; `continuation_terminated(abandoned)`; `continuation_terminated(superseded)`; `actor_process_spawn_failed`; `actor_process_timed_out`; `actor_process_signal_requested`; `actor_process_exited`; `actor_process_termination_unconfirmed`; `actor_invocation_closed`; `actor_invocation_failed`; `runtime_failure`; `run_terminal`; `run_closed` | allowed as historical/terminal truth only; no member is accepted by a currentness predicate |
| `run_independent` | workspace-scoped invocation, implementation, basis, catalog, Public ingress/artifact, install, binding, and continuation-link fluents declared run-independent by their event contracts | excluded from Run quiescence; their owning projections remain separate |

The selected fluent-name roster is closed. A Run-scoped fluent absent from all
six partitions makes `RunQuiescenceProjection` `invalid_unknown_fluent` and
closure refuses. A new event/fluent cannot enter by pattern matching or a name
suffix; it requires design/catalog amendment and an explicit partition row.

Phase effects consume `consumable_authority` exactly: fibre/evidence at result,
result at judgment, judgment/token/progress at route, actor stream/binding/
artifact availability at CCall evidence/result or ActorInvocation terminal,
continuation response at resume/terminal, and construction intent at its
declared delta/route. Historical event rows remain; no terminal/historical
fluent can recreate a consumable member.

`quiescent_for_close` means exact `closure_spine`, empty `live_execution`,
empty `consumable_authority`, empty `cleanup_pending`, only allowed
`terminal_historical`, and no unknown Run-scoped fluent.

### R3.2 ActorInvocation and Process prefix

For one ActorInvocation, replay admits exactly this prefix grammar:

```text
actor_transport_binding_admitted exactly 1
-> actor_invocation_started exactly 1
-> (
     actor_process_spawn_failed exactly 1; no process_started/stream/timeout/signal/exit
     |
     actor_process_started exactly 1
       -> stdout/stderr rows 0..N with one contiguous global streamOrdinal 1..N
       -> timeout row 0..1
       -> signal rows 0..2 with contiguous signalOrdinal and no duplicate signal
       -> exactly one of actor_process_exited | actor_process_termination_unconfirmed
   )
-> actor_result_artifact_observed 0..1
-> exactly one of actor_invocation_closed | actor_invocation_failed
```

The ActorInvocation terminal payload closes the variable cardinalities with
`streamRowCount`, `timeoutRowCount`, `signalRowCount`, and exact
`processTerminalEventRef`; replay requires those counts and the final contiguous
ordinals to equal the admitted prefix. Callback-local counters are candidates
only until this terminal row is admitted.

The terminal variants are closed:

- `actor_invocation_closed` requires one success result artifact, a started
  process, and `actor_process_exited` with successful status;
- `actor_invocation_failed.with_result` requires one failure result artifact
  and one terminal process variant;
- `actor_invocation_failed.transport_exception` requires zero result artifact
  and one spawn-failed/exited/termination-unconfirmed terminal process fact;
  and
- `actor_invocation_failed.run_cleanup` requires the exact cleanup token and
  zero new result artifact after Run terminality.

An artifact is forbidden after ActorInvocation terminal. Closed and failed are
mutually exclusive. Duplicate binding/start/process-terminal/actor-terminal,
stream ordinal gaps, timeout multiplicity, signal overflow/order drift,
artifact/terminal disagreement, and rows after terminal are invalid.

### R3.3 Post-Run cleanup

When stop/failure terminalizes a Run, its terminal effect terminates every
active ActorInvocation/Process/live fluent and initiates exactly one
`actor_cleanup_pending` token for each ActorInvocation that was active
immediately before the terminal event. No token is created for an already
terminal ActorInvocation. The Run-terminal payload carries the exact closed
`cleanupPendingRows` array of ActorInvocation ref and Process ref; replay
requires exact equality with the pre-event active census, and EC derives each
token's `runTerminalEventRef` from the admitted source event identity.

While that token HoldsAt, the only post-Run event variants allowed for its
exact ActorInvocation/Process are:

- `actor_process_timeout_observed.cleanup` at most once;
- `actor_process_signal_requested.cleanup` at most twice with contiguous
  signal ordinals and declared distinct signals;
- exactly one of `actor_process_spawn_failed.cleanup`,
  `actor_process_exited.cleanup`, or
  `actor_process_termination_unconfirmed.cleanup`; and
- exactly one `actor_invocation_failed.run_cleanup`, which consumes the token.

If a success result artifact was admitted before Run terminality and only the
ActorInvocation terminal row was pending, `actor_invocation_closed.cleanup`
may replace the final failed row, must cite that preterminal artifact, and
consumes the same token. No other closed variant is post-Run legal.

Binding, invocation/process start, stdout/stderr, result artifact, CCall,
retry, route, child, continuation, foldback, and closure events are not cleanup
events. Cleanup variants initiate only their named terminal-historical facts;
they cannot initiate or de-clip any live/consumable/closure-spine fluent.
Intermediate timeout/signal/process-terminal observations neither consume nor
recreate the token. The one final ActorInvocation terminal row consumes it.
After consumption, every further actor/process event refuses with zero append.

The Actor/Process owner predicate validates this exact grammar and token before
the authority-neutral expected-prefix append. Event store retains no cleanup
or lifecycle semantics.

## R4. Complete migration census and zero legacy gates

Add these exact consumers to base sections 17, 18, and 19:

| File/function | Required migration | Retained role |
|---|---|---|
| `hog/traversal.ts::applyRecursionRoute` | replace `isCurrentAdmittedRecursionRoute` and process-local cursor admission as semantic gates with the exact replay-derived recursion-route/token projection; target cursor equality remains a structural check | HoG applies one admitted route; it does not determine route currentness |
| `public/continuation_authority.ts::constructPublicContinuationAuthority` | construct a self-digested transport carrier from replay-validated refs only; carry no authoritative lifecycle status | serialization/transport |
| `public/continuation_authority.ts::parsePublicContinuationAuthority` | validate closed shape/digest only; return an untrusted locator carrier, not current continuation truth | parse/transport |
| `public/continuation_authority.ts::updatePublicContinuationAuthority` | update only exact reopen-prefix transport metadata after replay validation; never update lifecycle status | transport refresh |
| `public/operations.ts::requireContinuationAuthority` | require/parse the carrier but make no lifecycle/currentness decision | request transport boundary |
| `public/operations.ts::reopenContinuation` | reopen exact durable store, rehydrate immutable Product/invocation basis, then require replay equality for Run/continuation/ref/digest; carrier fields alone never admit currentness | replay-validation boundary |
| `public/operations.ts::closeContinuationContext` | close store and refresh transport prefix only | transport refresh |
| `public/operations.ts::continuationMetadata` | accept the exact replay `ContinuationLifecycleProjection`, not a caller/local status argument; project `open / responded / resolved / abandoned / superseded` metadata without deciding it | output metadata |
| `public/operations.ts::applyProjectRead` | read lifecycle/status/result only from reopened replay; Public carrier locates the source and cannot override it | pure projection |
| `public/operations.ts::applyInteractionRespond` | require replay status `open` through the continuation owner before any Public operation event; stale/terminal refusal appends zero | ingress transport plus owner call |
| `public/operations.ts::applyRunContinue` | require replay status `responded` and exact response/current basis through the continuation owner before any Public operation event; failure metadata replays terminal status rather than defaulting to local `responded` | ingress transport plus owner call |

Also include downstream metadata-only consumers in
`public/contracts.ts`, `public/schema.ts`, `public/outcome.ts`, and
`public/index.ts`. They may expose the closed status vocabulary and carrier
schema but cannot test status to admit an effect.

The atomic semantic cut now has this hard static/reachability acceptance:

```text
reachable legacy currentness/status gates = 0
```

Zero includes:

- `isCurrentAdmittedRecursionRoute` on reachable HoG paths;
- `hasCurrentAdmittedCCallResult` and
  `hasCurrentAdmittedCCallOutcome` on reachable producer/consumer paths;
- process-local cursor/route/CCall/continuation WeakSet membership deciding
  semantic admission;
- carrier `continuationStatus`, caller-supplied status, metadata status, or
  `PublicContinuationAuthority` fields deciding respond/continue/read/failure;
- raw/reverse/latest event scans deciding lifecycle/currentness; and
- the split deferred-application current boolean.

The public continuation carrier is retained because it transports exact
immutable Product/binding/graph and durable reopen coordinates across Public
calls. It is replay-validated transport only. Possession, successful parsing,
self-digest equality, or refreshed reopen metadata grants no CCall, route,
continuation, retry, closure, or Run authority.

Migration reachability remains the base atomic cut: first switch every named
producer and consumer, including the additions above; then prove the reachable
legacy gate census is zero; then retire/internalize bypasses in the same
candidate commit. No mixed committed state exposes old and new status gates.

## Bounded repair falsifiers

The repaired candidate is false if any one occurs:

1. replay accepts an opened-only CCall prefix or selection refusal emits a
   CCall row;
2. repair-link `none` carries continuation evidence, `some` omits it, an
   invalid participation pair admits, or successor causation names a
   predecessor Run event;
3. closure accepts a Run-scoped fluent outside the closed partition or any
   non-spine live/consumable/cleanup member;
4. Actor/Process prefix violates its cardinality/order, a post-Run event is not
   allowlisted, cleanup creates availability, or one cleanup token is consumed
   zero/multiple times;
5. `applyRecursionRoute` or any named Public function uses a legacy currentness
   or status gate; or
6. possessing/updating metadata on `PublicContinuationAuthority` changes an
   owner admission result without an equal replay projection.

Promotion proofs add only the corresponding six mutation families to the base
proof plan. All other proof gates and relations remain unchanged.

## Assessor decision surface

F_H may accept or reject this exact ordered composition. Acceptance preserves
the base candidate's separate minimal GOALS/T-287 repricing requirement and
does not itself authorize code. This post changes no Product, requirement,
GOALS, ticket, accepted design, production, test, proof, donor, or progression
log artifact.
