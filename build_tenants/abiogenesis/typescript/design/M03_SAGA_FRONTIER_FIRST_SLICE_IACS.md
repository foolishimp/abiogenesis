# M03 Saga Frontier First Slice IACS

**Status**: Active
**Date**: 2026-05-20
**Ticket**: T-141

This IACS is governed by `DESIGN_MODULE_METHOD.md` Prime Law and functional
realization review. Parallelism belongs at the system/runtime boundary, but the
semantic center remains immutable and prime: carriers and projections are
constructed values, not shared mutable scheduler state.

## Irreducible Architectural Carrier Set

1. `BranchRef`
   Stable logical identity for one dependency-frontier branch. It is not an
   attempt, worker invocation, process id, file path, or completion-order
   surrogate.

2. `BranchAttemptRef`
   Attempt identity under one logical branch. Retry, cancellation, lease expiry,
   or supersession changes the attempt without changing branch meaning.

3. `BranchIdempotencyKey`
   Deterministic admission identity for branch commands/results. It is derived
   from command kind, branch identity, attempt identity when attempt-scoped,
   observed-state set, output allocation, and write territory.

4. `BranchPayloadAdmissionRecord`
   The admitted logical branch-result record used for duplicate suppression and
   conflict detection.

5. `DependencyFrontierDeclaration`
   The admitted row of product-owned dependency opportunity: parents, observed
   state, reads, writes, output allocation, fan-in scope, idempotency key,
   priority, and critical-path cost.

6. `DependencyFrontierProjection`
   The replay-derived read model answering which branch rows are ready, blocked,
   leased, stale, safety-underdeclared, idempotently closed, or already closed.

7. `BranchExecutionPolicy`
   The resolved policy view consumed by selection. It carries max concurrency,
   queue discipline, retry behavior, timeout policy, cancellation policy, lease
   policy, worker/transport/resource caps, preemption policy, watchdog policy,
   and system-policy refs. It is not a new config authority.

8. `BranchSelectionProjection`
   The deterministic selection of write-disjoint ready branches under the
   declared runtime cap.

9. `BranchLeaseRecord` and `BranchLeaseProjection`
   Replay-visible lease rows and projection state for active, expired,
   released, and superseded branch leases. Active leases block dispatch; expired
   leases allow recovery by later replay.

10. `branch_lease_acquired`, `branch_lease_released`,
    `branch_lease_superseded`, `branch_task_failed`
    Runtime events that make branch lease lifecycle and failed native branch
    disposition replay-visible.

11. `WriteTerritoryConflictProjection`
   The static and dynamic conflict read model over declared write roots and
   active leased write territories.

12. `BranchPayloadAdmittedEvent`
    The replay-visible branch payload admission event consumed by fan-in and
    output publication.

13. `BranchFanInProjection` and `branch_fan_in_projected`
    Deterministic fan-in over admitted branch payloads. It orders by declared
    branch order when present, otherwise by stable branch identity.

14. `BranchOutputStageRecord` and `BranchOutputPublicationDecision`
    Branch-attempt staging law. Staged artifacts are invisible until a matching
    admitted branch payload makes publication lawful.

15. `runNativeSagaFrontier`
    The bounded native-promise realization of one dependency frontier. It
    consumes the projection and policy carriers; it does not own runtime truth.

16. `PublicConstructionProgressProjection`
    Read-only operator progress over admitted frontier state. It does not
    dispatch or close work.

## Subordinate Payloads

Subordinate payloads in this slice:

- native `Promise` handles;
- timer handles;
- process ids;
- worker transcript snippets;
- file-presence checks;
- queue implementation detail;
- local runner transients;
- `BranchResourceLimit` rows inside the `BranchExecutionPolicy` carrier family;
- physical workspace staging paths and filesystem mutation detail.

These may appear in later runner implementation. They do not become branch,
frontier, or progress truth.

The workspace remains a shared mutable effect substrate. It is lawful only as
an effect edge behind observed-state admission, write territory or output
allocation, branch staging, idempotent payload admission, and replay-visible
publication. It is not a second source of readiness or fan-in truth.

## Promotion Test

Promote a field into the saga frontier carrier set only if replay, branch
selection, idempotent admission, write conflict detection, fan-in, public
progress, or recovery needs it as semantic input. Otherwise keep it subordinate
to runner implementation.

## Effect Edges

```text
product dependency declaration
  + admitted observed-state refs
  + output allocation / write territory
  + branch identity
  + existing runtime policy
  -> DependencyFrontierProjection
  -> BranchSelectionProjection
  -> later branch lease / dispatch events
  -> branch payload admission
  -> fan-in / public progress projection
```

The first slice stops at pure projection and admission decisions. Later dispatch
must consume these carriers rather than recomputing a ready set in memory.

## First Slice Proof

The first slice is complete when:

- max concurrency `1` selects one branch and leaves other ready branches
  replay-visible;
- a larger cap selects disjoint ready branches deterministically;
- overlapping write territory serializes even when capacity is available;
- rows missing observed-state proof, idempotency proof, and write/output
  allocation proof block instead of becoming ready;
- shared output allocation conflicts even when write-territory refs are absent;
- child rows remain blocked until parent branch closure is admitted;
- stale observed-state refs block dispatch and remain visible to progress;
- duplicate same-attempt result admission is idempotent;
- same-attempt different payload fails closed as an idempotency conflict;
- same branch with a new attempt may admit a different payload;
- active leases keep rows out of selection while expired leases allow recovery;
- branch lease events replay to active/released/expired/superseded projection
  state;
- fan-in order is deterministic across different wall-clock completion orders;
- fan-in can replay from admitted branch payload events;
- staged output remains invisible until a matching payload admission exists;
- the native saga frontier runner honors max-concurrency `1` as serial fallback;
- the native saga frontier runner exploits disjoint fan-out only within policy
  cap;
- the evented native saga frontier runner emits replay-visible lease, payload,
  release, and fan-in events around native async dispatch;
- the evented native saga frontier runner emits replay-visible branch failure
  and lease release truth when a native branch task rejects after acquisition,
  and reports failed branches separately from scheduling deferrals;
- branch execution policy exposes the declared runtime control surface without
  introducing a new configuration authority;
- frontier, selection, and native runner results are immutable semantic values
  even when branch tasks operate over mutable effect edges.
- the odd_sdlc T-167 review shape is proven abstractly: two configured reviewer
  branches over one ticket surface can fan out, reduce into decision rows, and
  route into ticket drafts without ABG owning reviewer meaning or ticket status
  authority.

## Batch Completion Proof

T-141 is not fully closed by this first slice alone. Full closure still needs
construction-runner consumption of the evented saga frontier, cancellation and
evidence preservation, physical publish/merge implementation, broader policy
carrier consumption, and an `odd_sdlc` consumer proof.

## Module Boundary

The first slice is owned by:

- `code/src/abg/m03/contracts/saga_frontier.ts`;
- `code/src/abg/m03/runner/saga_frontier_runner.ts`;
- `test_env/tests/test_t141_saga_frontier.test.mjs`.

It reuses existing ABG contract exports and does not widen
`fp_consciousness.ts`, runtime transport, or the runner.
