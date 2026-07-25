# REQ-R-ABG3-CONTINUATION — Runtime Open Obligation Truth

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](../../../.genesis/docs/standards/SPEC_METHOD.md), [ODD_METHOD.md](../../../.genesis/docs/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define `Continuation` as run-local runtime obligation truth derived from prior
events, preserving the distinction between continuation of the current admitted
intent and admission of a newly selected action.

## Acceptance Criteria

**REQ-R-ABG3-CONTINUATION-001**: `Continuation` shall represent an open governance obligation or unresolved runtime condition derived from event truth, not constitutional intent or hidden task-queue strategy.

**REQ-R-ABG3-CONTINUATION-002**: Continuation identity shall preserve at minimum `continuation_id`, `continuation_kind`, `caused_by_event_id`, and `run_id`.

**REQ-R-ABG3-CONTINUATION-003**: Continuation shall be strictly run-local. It shall not survive into a replacement run as the same aggregate.

**REQ-R-ABG3-CONTINUATION-004**: If unresolved work remains relevant after retry, correction, or supersession, ABG shall terminate the old continuation by authoritative event truth and open a new continuation in the new run with explicit causal linkage.

**REQ-R-ABG3-CONTINUATION-005**: Authoritative continuation lifecycle shall include at minimum open, resolved, superseded, and abandoned termination truth.

**REQ-R-ABG3-CONTINUATION-006**: Yielded post-dispatch handoff may open continuation truth for observer, routing, or approval-bearing next action, but that continuation shall remain runtime-open obligation truth rather than constitutional intent.

**REQ-R-ABG3-CONTINUATION-007**: A modulated same-edge continuation shall be derived from the traversal attempt envelope, admitted progress rows, typed remaining schedule refs, and existing retry/non-progress projection truth. ABG shall not infer remaining work from worker prose, file presence, elapsed time, or unstated worker intent.

**REQ-R-ABG3-CONTINUATION-008**: Retry exhaustion, blocked modulation, and forced review for a modulated attempt shall be replay-visible runtime truth. They shall not be implemented as a private loop inside a downstream product, runner adapter, or worker prompt.

**REQ-R-ABG3-CONTINUATION-009**: Liveness-yield, retry, block, or escalation for supervised runtime work shall consume ABG runtime liveness observer disposition. Continuation projection shall not derive a separate stop or retry action from elapsed time, process state, or transcript text.

**REQ-R-ABG3-CONTINUATION-010**: Recursive executive-observer pressure may feed
continuation, retry, re-entry, reprice, block, or close-candidate projection
only after ABG admits the observer's `evaluate.C` findings and projects typed
pressure facts. Worker prose, product plugin tuning, or downstream lifecycle
read models shall not directly select continuation action.

**REQ-R-ABG3-CONTINUATION-011**: An admitted F_H response, post-yield input, or other lawful input for the current construction intent shall continue only that intent through `continueExecution` over the exact replay-derived continuation and execution basis. The response shall not create a next-action basis, select another GraphFunction, or admit a new construction intent.

**REQ-R-ABG3-CONTINUATION-012**: When fresh post-disposition truth selects a new action, the path shall be `evaluateNext -> admitConstructionIntent -> invokeGraphFunction`. It shall not be relabeled as continuation of the prior intent or opened directly by public ingress, a projector, an adapter, or a worker result.

**REQ-R-ABG3-CONTINUATION-013**: A newer `ObservationSnapshot` under the same immutable workspace binding and `ExecutionBasis` may stale prior model, gap, target-binding, priority, or next-action projections and shall rerun the affected `synthesizeModel`, `evalGap`, and `evaluateNext` functions. Observation freshness alone shall not create a basis fork or require a new workspace binding.

**REQ-R-ABG3-CONTINUATION-014**: A changed workspace authority basis, workspace binding, product/install/catalog authority, declared root, or other execution authority on a continued spine shall require a separately admitted binding when applicable and an exact covering declaration reprice naming the crossed basis pair. Without that reprice, continuation shall fail closed as typed `basis_fork_detected` before traversal, materialization, or closure.
