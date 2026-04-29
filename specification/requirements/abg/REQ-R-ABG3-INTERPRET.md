# REQ-R-ABG3-INTERPRET — Graph-Function Runtime Interpretation

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define ABG 3 interpretation as graph-function-first runtime execution over
event-authoritative aggregates.

## Acceptance Criteria

**REQ-R-ABG3-INTERPRET-001**: ABG shall load GTL 3 declarations without collapsing them into stale or flatter language shapes.

**REQ-R-ABG3-INTERPRET-002**: Public execution shall enter through published `GraphFunction` carriers bound by GTL `Job` contracts.

**REQ-R-ABG3-INTERPRET-003**: ABG shall materialize graph functions through explicit, replayable materialization requests over declared graph-function identity, profiles, and structural parameters.

**REQ-R-ABG3-INTERPRET-004**: `GraphVector` shall remain internal invariant-boundary truth for local traversal, evaluation, proof, closure, and dispatch facts. It shall not be the public execution carrier.

**REQ-R-ABG3-INTERPRET-005**: Recursive interpretation shall operate through explicit `GraphCall` and `Frame` truth rather than ad hoc command logic or hidden controller memory.

**REQ-R-ABG3-INTERPRET-006**: Post-dispatch runtime truth, including readiness, worker turn invocation, failure classification, proof re-entry, closure re-entry, and continuation opening, shall be engine-owned.

**REQ-R-ABG3-INTERPRET-007**: ABG shall fail closed on undeclared graph-function identity, undeclared profile, undeclared structural parameter, materialization output that violates the published outer contract, or unresolved runtime law.

**REQ-R-ABG3-INTERPRET-008**: Post-dispatch observer truth that is non-blocking but unresolved shall yield to the next lawful observer or routing layer rather than immediately redispatching the same constructive lane by default.

**REQ-R-ABG3-INTERPRET-009**: Public start/resume entry shall act as a safe ignition boundary over published `GraphFunction` work. It shall locate, admit, or resume the lawful graph-function execution boundary, but shall not replace the ABG internal iteration engine.

**REQ-R-ABG3-INTERPRET-010**: ABG shall execute a published `GraphFunction` by repeatedly planning and advancing lawful internal `GraphVector` traversals from replay-derived runtime truth until convergence, failure, hold, continuation, yielded handoff, human gate, or another lawful public stop condition is reached.

**REQ-R-ABG3-INTERPRET-011**: Next-edge selection shall be derived from graph-call, frame, vector-local traversal, evaluation, proof, and closure event truth. It shall not be inferred from private controller memory, package-local loop counters, or a fixed first-vector shortcut.

**REQ-R-ABG3-INTERPRET-012**: A realization shall not claim graph-function execution parity when it only materializes a composed graph function or dispatches one selected vector without proving replay-derived progression across the callable graph boundary.

**REQ-R-ABG3-INTERPRET-013**: ABG shall name an admitted graph-function execution request with no declared runtime compute basis as `no_compute_basis`. It shall not treat an uninitialized traversal as a no-op, identity traversal, deterministic fallback, probabilistic fallback, or human fallback.
