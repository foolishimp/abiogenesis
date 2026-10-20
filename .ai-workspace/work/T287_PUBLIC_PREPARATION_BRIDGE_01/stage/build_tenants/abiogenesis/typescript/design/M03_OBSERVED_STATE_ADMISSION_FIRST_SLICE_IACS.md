# M03 Observed State Admission First Slice IACS

**Status**: Active
**Date**: 2026-05-16
**Ticket**: T-136

## Irreducible Architectural Carrier Set

### `ObservedStateSourceRef`

Prime carrier role: names the observed state source without exposing raw effect
payloads as runtime law.

Required fields:

- source kind
- scope ref
- source ref

Why prime:

Selection and replay need to know what was observed. A raw path, register field,
or controller variable is not enough because it does not identify the governed
scope or the source class.

### `ObservedStateDerivationBasis`

Prime carrier role: identifies the projection and event basis used to derive
the observation.

Required fields:

- derivation basis ref
- basis projection ref
- event watermark
- derived-from refs

Why prime:

The same workspace file or register can be read under different event-spine
truth. The derivation basis is what makes the observation replayable instead of
ambient.

### `ObservedStateRecord`

Prime carrier role: admitted observation identity for workspace/register/
projection/policy state.

Required fields:

- observed state ref
- source ref
- digest
- version or null
- freshness policy ref
- derivation basis

Why prime:

This is the single record downstream ABG mechanisms may read when selecting
construction actions, overlay firing, pressure projection, routing, or closure.
Without it, controllers reconstruct state privately.

### `ObservedStateAdmissionOutcome`

Prime carrier role: fail-closed decision on whether the observation is current
and matches the expected source identity.

Required fields:

- status: `admitted` or `rejected`
- record
- diagnostic refs

Why prime:

Stale or mismatched observed state is a first-class runtime condition, not a
TypeScript exception hidden in an app controller.

### `ObservedStateProjection`

Prime carrier role: replay-derived read model over admitted observed-state
events.

Required fields:

- projection ref
- records
- observed-state refs
- latest event watermark

Why prime:

Construction snapshots and future overlay frames need one projection surface for
checking that a decision's observed inputs were admitted.

### `ConstructionObservationSnapshot.observedStateRefs`

Prime carrier role: link construction decision context to admitted observations.

Why prime:

An observation snapshot without observed-state refs can still appear
well-formed while hiding the actual state that influenced selection. The refs
make the dependency explicit.

## Subordinate Payloads

Subordinate payloads in this slice:

- raw filesystem stats
- raw JSON register fragments
- raw projection rows before admission
- freshness calculation details
- process cwd
- controller-local variables
- prompt text rendered from observations

These payloads can feed an effect shell that constructs an
`ObservedStateRecord`, but downstream semantic kernels must consume the record
or projection, not the raw payload.

## Qualification Rule

An input becomes required observed state when any of these consumers reads it:

- overlay `fire_when`
- overlay `terminate_when`
- construction selection
- pressure projection
- routing
- closure

The implementation-level rule for this slice is conservative:

- construction snapshots must carry observed-state refs for state they expose;
- coverage must prove those refs exist in `ObservedStateProjection`;
- unsupported source kinds such as process-local cwd fail event admission.

## Effect Edges

```text
Effect shell read
  -> ObservedStateSourceRef
  -> ObservedStateDerivationBasis
  -> ObservedStateRecord
  -> observed_state_admitted event
  -> ObservedStateProjection
  -> ConstructionObservationSnapshot.observedStateRefs
  -> coverage check before construction selection/replay
```

## First Slice Proof

The first slice is complete when:

- observed-state events admit replayable records;
- projection derives the same record identity from replayed events;
- construction observation snapshots name observed-state refs;
- snapshots fail closed when they reference unadmitted observations;
- stale digest, stale watermark, wrong version, or wrong source kind rejects;
- process-local state cannot bypass observed-state admission.
