# M03 Attached F_P Worker Loop Derivation

**Status**: Active
**Date**: 2026-04-27
**Purpose**: Derive the TypeScript `M03` attached probabilistic worker loop
from existing ABG product law and the Python-era recursive realization
capability without copying Python's imperative delivery shape.

## Source Authority

- `specification/INTENT.md`
- `specification/PRODUCT.md`
- `specification/requirements/abg/REQ-R-ABG3-INTERPRET.md`
- `specification/requirements/abg/REQ-R-ABG3-RETRY.md`
- `specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md`
- `specification/requirements/abg/REQ-R-ABG3-RUN.md`
- `M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md`
- `M03_M04_PLUGIN_CONTRACT_MODEL_IACS.md`
- `M03_RETRY_REPAIR_LEAFTASK_FIRST_SLICE_IACS.md`
- `M04_RESULT_ASSESSMENT_DERIVATION.md`
- [T-084](../../../../.ai-workspace/tickets/backlog/T-084-realize-abg-owned-fp-result-ingest-retry-and-continue-loop-for-attached-workers.md)

## Position

ABG already owns traversal control, transport invocation, result ingestion,
event truth, replay projection, retry, continuation, and lawful next-step
selection.

The TypeScript runner previously had two lawful but incomplete modes:

- F_D execution could continue through all graph-function vectors.
- F_P execution could publish dispatch-required truth and stop for an external
  worker/result handoff.

That is insufficient for an attached worker. When the worker returns a result
in the same engine invocation, downstream products must not own the
dispatch-result-assess-retry loop. They may provide effect plugins and domain
evaluation evidence. ABG must admit the returned artifact, decide whether it
closes the current vector, emit retry/continuation facts when blocked, and
re-enter from replay-derived state until convergence, yield, or failure.

## Preserved Boundary Truth

- `GraphFunction` remains the reusable workflow library-function carrier.
- A graph overlay or GTL program composition remains the program surface.
- `ExecutionBasis` remains the admitted runtime basis.
- `RuntimeEvent` remains the only runtime truth write family.
- `RuntimeAggregateProjection` remains replay-derived current truth.
- `IterationAdvanceDecision` remains next-vector authority.
- F_P plugins may perform worker effects and return an attached artifact.
- F_P plugins may not emit events, close vectors, select successors, or own the
  loop.

## Python Capability Retained

The Python line had the functional behavior across `dispatch_runtime.py`,
`result_ingest.py`, `binding.py`, and continuation helpers:

- dispatch worker
- ingest result
- validate identity and proof
- fail proof without closing the edge
- open retry/repair/continuation truth
- regenerate prompt/manifest from current state
- re-enter construction over existing workspace assets

The TypeScript target keeps that capability but collapses it into the ABG M03
runner boundary using explicit carriers instead of Python delivery-side control
flow.

## TypeScript Target

The TypeScript implementation adds one attached F_P loop inside the M03 runner:

1. derive current projection from replay
2. derive current transition
3. emit F_P dispatch request truth
4. invoke the F_P dispatch plugin
5. if no attached artifact is returned, stop as external dispatch-required
6. if an attached artifact is returned, admit it through ABG result-ingest law
7. if artifact fulfillment is blocked, emit blocked evaluation plus retry and
   continuation facts
8. re-enter the same edge from replay-derived state
9. if artifact fulfillment is accepted, emit assessed truth
10. if `until = converged`, continue to the next replay-selected vector

## Non-Goals

- No downstream product-specific runner.
- No odd_sdlc-specific behavior.
- No file-count or data_mapper-specific heuristic.
- No worker-internal HOW in ABG.
- No plugin-emitted runtime events.
- No plugin-selected next vector.
