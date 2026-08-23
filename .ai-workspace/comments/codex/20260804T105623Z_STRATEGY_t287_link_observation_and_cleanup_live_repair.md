# T-287 Continuation-Link Observation And Cleanup-Live Repair

**Type**: STRATEGY  
**Status**: Frozen second bounded repair candidate; not operative authority  
**Incorporated base design**: SHA-256 `c295a065fb95eba780692310e99de7b9aa967d1f93c8fb23b9815326adabead9`  
**Incorporated first repair**: SHA-256 `b0582ef7e0789ac4cb2a52f4a61d7e146b22fbbaeae1df3be3368ef77b8428a0`  
**Replacement scope**: exactly two local corrections below  
**Base HEAD**: `a1fa19f68213aa0773b88b3b6ef9ba2e41f5ee99`  
**Accepted checkpoint retained**: `1f6a86074bf995763b4caff286422b5b1501374b`  
**Product, requirements, GOALS, T-287, accepted design, production, and tests changed**: none  

## Composition law

The exact candidate is the ordered composition:

```text
c295a065fb95eba780692310e99de7b9aa967d1f93c8fb23b9815326adabead9
then b0582ef7e0789ac4cb2a52f4a61d7e146b22fbbaeae1df3be3368ef77b8428a0
then this repair blob
```

All passed relations remain unchanged. This post replaces only the successor
`some` fields and observed-opening law in first-repair R2, and the process-live/
cleanup portion of first-repair R3. No global relation is reopened.

## R1. Immutable link versus observed successor opening

Replace `SuccessorContinuationParticipation.some` with:

```text
SuccessorContinuationParticipation =
  { kind: "none" }
  |
  {
    kind: "some",
    plannedContinuationId,
    continuationKind,
    plannedOpeningBasisRef,
    plannedOpeningBasisDigest
  }
```

`ContinuationReentryLink` is immutable once admitted. It carries only the
planned fresh successor continuation identity and opening basis for `some`.
It never carries `openedEventRef`, `openedEventDigest`, mutable observation
slots, replacement rows, or a later update event. Link digest identity is
therefore stable before and after successor opening.

After the successor event exists, replay may derive:

```text
ObservedSuccessorContinuationOpening =
  {
    kind: "observed_successor_continuation_opening",
    linkRef,
    linkDigest,
    successorRunId,
    continuationId,
    continuationKind,
    openingBasisRef,
    openingBasisDigest,
    openedEventRef,
    openedEventDigest,
    successorPrefixDigest
  }
```

This is a read model, not an event or link mutation. It exists exactly when:

1. link successor participation is `some`;
2. the planned continuation id/basis is fresh and belongs to the exact
   successor Run named by the link;
3. exactly one successor-Run continuation-open event matches every planned
   identity and digest;
4. that opening payload cites `linkRef/linkDigest`; and
5. the opening event's `causedByEventId` and every `causationEventRef` name
   only lawful successor-Run facts.

For successor `none`, the observed-opening projection must be absent. For
successor `some`, its absence means `planned_not_yet_observed`, not malformed
history, until the successor lifecycle reaches the declared opening boundary.
Zero/many/mismatched openings, an opening under `none`, link replacement, or
any predecessor-Run causation is invalid. Replay never writes back to the
link.

This supersedes only the first repair's nullable opened-event fields and its
post-opening equality wording. The `none/none`, `some(abandoned)/none`, and
`some(superseded)/some` pair law, workspace payload linkage, fresh identity,
and no-cross-Run-causation laws remain unchanged.

## R2. Run terminality preserves process liveness through cleanup

### R2.1 Terminal effect

When Run stop/failure observes an active ActorInvocation/Process, it:

- terminates `actor_invocation_active` and `actor_process_active` execution
  authority;
- does **not** terminate `actor_process_live`;
- initiates one
  `actor_cleanup_pending(actorInvocationRef,processRef,runTerminalEventRef)`;
  and
- initiates
  `actor_cleanup_live(actorInvocationRef,processRef,runTerminalEventRef)` exactly
  when `actor_process_live(processRef)` held immediately before terminality.

`actor_process_live` and `actor_cleanup_live` remain true until an admitted
confirmed terminal Process variant proves exit or non-start. Run terminality,
timeout, signal request, ActorInvocation failure, caller loss, elapsed time,
and `actor_process_termination_unconfirmed` do not prove the process absent.

The closed Run-fluent partition is amended only as follows:

- add `actor_cleanup_live` to `cleanup_pending` alongside
  `actor_cleanup_pending`;
- after Run terminality, retain `actor_process_live` as cleanup-owned live
  truth rather than extinguishing it; and
- `quiescent_for_close` and fresh repair successor eligibility both require
  zero `actor_process_live`, zero `actor_cleanup_live`, and zero
  `actor_cleanup_pending` for the predecessor WorkScope.

### R2.2 Cleanup observation allowlist

While the exact cleanup-pending relation holds, allow:

- `actor_process_stdout_observed.cleanup` and
  `actor_process_stderr_observed.cleanup`, continuing the one contiguous global
  stream ordinal;
- `actor_process_timeout_observed.cleanup` at most once;
- `actor_process_signal_requested.cleanup` at most twice with contiguous signal
  ordinals and distinct declared signals;
- `actor_process_spawn_failed.cleanup` when no process-start event exists;
- `actor_process_exited.cleanup` after process start; and
- `actor_process_termination_unconfirmed.cleanup` at most once as an
  unresolved cleanup observation.

Cleanup stdout/stderr initiates only
`actor_stdout_cleanup_observed(eventId)` or
`actor_stderr_cleanup_observed(eventId)`. These are terminal-historical facts,
not `actor_stdout_available`, `actor_stderr_available`, evidence availability,
result availability, liveness renewal, or progress authority. No cleanup
observation may recreate a CCall, route, retry, continuation, foldback,
closure, actor-execution, or Run-active fluent.

### R2.3 Confirmed terminality and single-use consumption

The confirmed Process terminal variants are exactly:

- `actor_process_spawn_failed.cleanup`, proving no process started; or
- `actor_process_exited.cleanup`, proving the started process exited.

Either terminates `actor_process_live` when present and
`actor_cleanup_live`. Only after one exact confirmed Process terminal variant
may `actor_invocation_failed.run_cleanup` or the already-qualified
`actor_invocation_closed.cleanup` append. That final ActorInvocation terminal
row consumes `actor_cleanup_pending` exactly once.

`actor_process_termination_unconfirmed.cleanup` terminates neither live nor
pending cleanup truth. It projects
`cleanupDisposition: termination_unconfirmed`, blocks successor Run opening
and every new effect for the WorkScope, and exposes only the typed lawful action
to continue cleanup or escalate through the separately owned workspace/Public
boundary. It never authorizes retry, continuation, closure, or an assertion
that no process remains.

A later confirmed `actor_process_exited.cleanup` may follow the one unconfirmed
observation, after which the final ActorInvocation cleanup row may consume the
pending relation. Without that confirmation, cleanup remains live/pending
indefinitely and fresh repair successor admission refuses with zero append.

### R2.4 Prefix cardinality amendment

The Actor/Process prefix grammar from the first repair is amended only for a
Run-terminal interruption:

```text
preterminal actor/process prefix
-> Run terminal creates cleanup-live/pending
-> cleanup stdout/stderr 0..N with contiguous continuing stream ordinals
-> cleanup timeout 0..1
-> cleanup signals 0..2
-> termination_unconfirmed 0..1
-> confirmed spawn_failed or exited exactly 1 before cleanup completion
-> ActorInvocation cleanup terminal exactly 1
-> cleanup-pending consumed
```

The final ActorInvocation terminal payload closes preterminal plus cleanup
stream/timeout/signal counts and cites the exact confirmed Process terminal
event. Unknown cleanup variants, output artifacts after Run terminality,
ordinal gaps, duplicate confirmed terminality, cleanup completion before
confirmation, or any event after pending consumption is invalid/refused.

## Migration and proof delta

No new semantic owner is added. Continuation replay derives observed opening;
Actor/Process replay owns cleanup state; the event store remains mechanical.

Add only these proof mutations to the passed plan:

1. mutate/replace an immutable link after successor opening: rejection;
2. supply opened-event fields in link payload: schema rejection;
3. derive observed opening from none, mismatched, many, or cross-Run-caused
   events: replay rejection;
4. terminalize a Run with a live process and assert that
   `actor_process_live` disappeared: failure;
5. append cleanup streams and prove they create historical observations but no
   availability/progress;
6. use `termination_unconfirmed` to consume pending cleanup or open a successor:
   zero append and blocked/escalation projection; and
7. admit confirmed exit plus final ActorInvocation cleanup, consume pending
   once, then permit the otherwise-valid fresh successor.

All earlier migration census rows, zero-legacy-gate condition, atomic-cut law,
Prime/IACS, views, function traces, and proof gates remain unchanged except for
these exact effect/projection expectations.

## Assessor decision surface

F_H may accept or reject this exact additive repair blob. Acceptance does not
authorize code and retains the prior candidate's minimal GOALS/T-287 focus
reprice. This post changes no Product, requirement, authority, ticket, GOALS,
accepted design, production, test, proof, donor, or progression-log artifact.
