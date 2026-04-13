# REQ-R-ABG3-INTERPRET — Graph-Function Runtime Interpretation

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ABG_3_CONSTITUTIONAL_DESIGN.md](../../ABG_3_CONSTITUTIONAL_DESIGN.md)

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
