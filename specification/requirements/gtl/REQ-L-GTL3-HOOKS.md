# REQ-L-GTL3-HOOKS — Governance Hook Surfaces

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define the governance hook surfaces of GTL 3 without introducing a policy
semantic language.

## Acceptance Criteria

**REQ-L-GTL3-HOOKS-001**: GTL shall expose governance hook attachment points on `GraphFunction.declarations`, `GraphVector.declarations`, `Role.policy_hooks`, and `CandidateFamily.policy_hints`.

**REQ-L-GTL3-HOOKS-002**: Governance hook concerns shall include at minimum dispatch, evaluation, escalation, deterministic proof, and closure.

**REQ-L-GTL3-HOOKS-003**: A hook attachment may declare a stable hook reference and opaque configuration for the resolved implementation.

**REQ-L-GTL3-HOOKS-004**: GTL may declare hook scope and precedence across graph-function, graph-vector, role, and candidate-family surfaces.

**REQ-L-GTL3-HOOKS-005**: GTL shall not define the internal semantic vocabulary of policy evaluation as a specialized in-language DSL.

**REQ-L-GTL3-HOOKS-006**: Governance hook references and opaque configuration shall remain inspectable and replayable through publication, serialization, and interpretation surfaces.

**REQ-L-GTL3-HOOKS-007**: Engines may resolve declared hook references to Python or other executable implementations, but raw injected callables shall not be the constitutional GTL surface.
