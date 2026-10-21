# M03 Observed State Admission Derivation

**Status**: Active
**Date**: 2026-05-16
**Ticket**: T-136
**Purpose**: Define the ABG substrate contract for admitting workspace,
register, projection, event-watermark, and policy observations as replay-visible
construction inputs.

## Source Authority

- `specification/PRODUCT.md`
- `specification/requirements/abg/REQ-R-ABG3-EVENTS.md`
- `specification/requirements/abg/REQ-R-ABG3-PROJECTION.md`
- `specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md`
- `specification/requirements/gtl/REQ-L-GTL3-CONTEXT.md`
- `build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md`
- [T-136](../../../../.ai-workspace/tickets/completed/T-136-define-observed-state-register-admission-for-construction-replay.md)

## Problem

The Python reference achieved useful construction behavior by repeatedly reading
workspace files, register JSON, projection snapshots, and runtime events between
attempts. In ABG those reads cannot remain controller-local refresh and poll
logic. Any state read that can affect selection, overlay firing, pressure
projection, routing, or closure must become admitted observed-state truth.

The defect this ticket removes is not that ABG reads mutable workspace reality.
The defect is reading it without a stable source ref, digest or version, event
watermark, freshness policy, and derivation basis that replay can inspect.

## Decision

ABG admits observations through `ObservedStateRecord` and
`observed_state_admitted` runtime events. Construction observation snapshots
carry `observedStateRefs`; replay coverage checks fail closed when a snapshot
references an observation that was not admitted into the observed-state
projection.

Qualifying observed-state source kinds:

- `workspace_file`
- `register_json`
- `derived_projection`
- `event_spine_watermark`
- `policy_config`

Qualification rule:

Any field read by `fire_when`, `terminate_when`, construction selection,
pressure projection, routing, or closure must be represented by an admitted
observed-state record before it can influence the decision.

Non-qualifying transient state:

- process cwd
- current wall-clock reads outside an admitted timer/watermark event
- in-memory controller variables
- ambient filesystem reads without digest/version

Those values can be used only as raw effect-shell inputs before admission. They
cannot bypass the observed-state carrier.

## Contract

```ts
interface ObservedStateRecord {
  kind: "observed_state_record";
  observedStateRef: string;
  source: {
    kind:
      | "workspace_file"
      | "register_json"
      | "derived_projection"
      | "event_spine_watermark"
      | "policy_config";
    scopeRef: string;
    sourceRef: string;
  };
  digest: string;
  version: string | null;
  freshnessPolicyRef: string;
  derivationBasis: {
    derivationBasisRef: string;
    basisProjectionRef: string;
    eventWatermark: number;
    derivedFromRefs: readonly string[];
  };
}
```

`ObservedStateAdmissionOutcome` classifies the record as `admitted` or
`rejected` against expected digest, version, watermark, and source kind. Rejected
records carry typed diagnostic refs and are not lawful inputs to construction
selection.

## Closure Rules

- Observed state requires source kind, scope ref, source ref, digest, freshness
  policy, derivation basis ref, basis projection ref, event watermark, and at
  least one derived-from ref.
- Replay derives an `ObservedStateProjection` only from admitted
  `observed_state_admitted` events.
- Construction snapshots may name observed-state refs only when those refs are
  present in the projection.
- Digest mismatch, version mismatch, stale watermark, or source-kind mismatch
  rejects the observation.
- Current filesystem state, process cwd, and controller-local variables cannot
  act as observed-state truth without admission.

## Implementation Map

- `code/src/abg/m03/contracts/observed_state.ts` owns the pure observed-state
  carrier, admission, and projection kernels.
- `code/src/abg/m03/contracts/carriers.ts` declares the
  `observed_state_admitted` runtime event and source-kind vocabulary.
- `code/src/abg/m03/contracts/event_factories.ts` constructs observed-state
  admitted events from execution basis truth.
- `code/src/abg/m03/contracts/event_admission.ts` validates observed-state
  event shape.
- `code/src/abg/m03/contracts/fp_consciousness.ts` carries
  `observedStateRefs` on construction observation snapshots.
- `test_env/tests/test_t136_observed_state_admission.test.mjs` proves replay,
  coverage, stale/mismatch rejection, required derivation basis, and bypass
  rejection.

## Non-Goals

This slice does not implement overlay-frame `fire_when` or `terminate_when`
evaluation. T-137 consumes the observed-state projection when defining the
generic overlay frame contract. This slice makes the observations replay-visible
and fail-closed before overlays depend on them.
