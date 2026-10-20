# M03 Overlay Frame Contract Derivation

**Status**: Active
**Date**: 2026-05-16
**Ticket**: T-137
**Purpose**: Define the ABG substrate contract for overlay-like iteration
frames over GTL anchors and admitted observed state.

## Source Authority

- `specification/PRODUCT.md`
- `specification/requirements/abg/REQ-R-ABG3-INTERPRET.md`
- `specification/requirements/abg/REQ-R-ABG3-PROJECTION.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md`
- `build_tenants/abiogenesis/typescript/design/M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_OBSERVED_STATE_ADMISSION_DERIVATION.md`
- [T-137](../../../../.ai-workspace/tickets/completed/T-137-declare-generic-overlay-frame-contract-over-graph-and-observed-state.md)

## Problem

The Python SDLC reference used outer-loop procedures to keep returning attention
to a lane or register condition until the workspace and registers stopped
carrying pressure. In ABG that behavior cannot remain a product-local loop. If a
frame can affect fire, termination, fold-back, re-entry, or pressure clearing,
its state must be declared as replay-visible ABG runtime truth.

The defect removed by this slice is controller-side overlay selection. Product
code may name domain overlays, but ABG owns the frame contract once the overlay
is bound to GTL anchors and admitted observed-state refs.

## Decision

ABG declares `OverlayFrameContract` as a runtime/frame contract. It is not a new
GTL topology type. Its scope binds only to existing anchors:

- `graph_function`
- `graph_vector`
- `graph_span`
- `job`
- `module`
- `rule`

`fire_when` and `terminate_when` are predicate bindings over
`observedStateRefs`. Evaluation is replay-checked against
`ObservedStateProjection`; a predicate evaluation is rejected if its satisfied
state or missing-ref set cannot be derived from admitted observed-state truth.

Pressure clearing is conservative:

- missing fire or terminate refs carry pressure;
- terminate without clearing evidence carries pressure and emits a diagnostic;
- terminate with declared clearing evidence clears pressure;
- terminate with `noClosePolicyRef` preserves pressure under no-close policy.

## Contract

```ts
interface OverlayFrameContract {
  kind: "overlay_frame_contract";
  overlayFrameRef: string;
  contractRef: string;
  basisId: string;
  graphFunctionId: string;
  scopeRefs: readonly OverlayFrameScopeEventRow[];
  fireWhen: OverlayFramePredicateEventRow;
  terminateWhen: OverlayFramePredicateEventRow;
  pressureRefs: readonly string[];
  foldbackTargetRef: string | null;
  reentryTargetVectorIndex: number | null;
  noClosePolicyRef: string | null;
}
```

Runtime events:

- `overlay_frame_declared`
- `overlay_frame_evaluated`

Projection:

- `OverlayFrameProjection` is folded into `RuntimeAggregateProjection` so
  runner and consumer decisions do not refold event streams or refresh/poll
  private state.

## Closure Rules

- Overlay scope rows must bind to existing GTL/ABG anchors.
- Overlay predicates must name observed-state refs.
- Predicate evaluation must replay from `ObservedStateProjection`.
- Overlay completion cannot clear pressure without clearing evidence unless a
  no-close policy explicitly preserves the pressure.
- Product-local overlay loops do not satisfy this contract.

## Implementation Map

- `code/src/abg/m03/contracts/overlay_frame.ts` owns the carrier constructors,
  predicate evaluation, and replay projection.
- `code/src/abg/m03/contracts/carriers.ts` declares overlay frame carriers and
  runtime events.
- `code/src/abg/m03/contracts/projection.ts` composes
  `OverlayFrameProjection` into the runtime aggregate projection.
- `code/src/abg/m03/contracts/event_admission.ts` validates overlay frame event
  shape.
- `test_env/tests/test_t137_overlay_frame_contract.test.mjs` proves pressure
  carry, clearing evidence, no-close preservation, replay-derivation rejection,
  and GTL-anchor scope rejection.

## Non-Goals

This slice does not render worker prompts and does not define product-specific
overlay vocabulary. T-139 consumes overlay frame truth when materializing the
construction pressure package.
