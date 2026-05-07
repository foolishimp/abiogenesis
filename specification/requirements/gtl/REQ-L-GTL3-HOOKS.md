# REQ-L-GTL3-HOOKS — Governance Hook Surfaces

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define the governance hook surfaces of GTL 3 without introducing a policy
semantic language.

## Acceptance Criteria

**REQ-L-GTL3-HOOKS-001**: GTL shall expose governance hook attachment points on `GraphFunction.declarations`, `GraphVector.declarations`, `Job.policy_hooks`, `Role.policy_hooks`, `Module.policy_hooks`, and `CandidateFamily.policy_hints`.

**REQ-L-GTL3-HOOKS-002**: Governance hook concerns shall include at minimum dispatch, evaluation, escalation, deterministic proof, closure, and assurance.

**REQ-L-GTL3-HOOKS-003**: A hook attachment may declare a stable hook reference and opaque configuration for the resolved implementation.

**REQ-L-GTL3-HOOKS-004**: GTL may declare hook scope and precedence across graph-function, graph-vector, job, role, module, and candidate-family surfaces.

**REQ-L-GTL3-HOOKS-005**: GTL shall not define the internal semantic vocabulary of policy evaluation as a specialized in-language DSL.

**REQ-L-GTL3-HOOKS-006**: Governance hook references and opaque configuration shall remain inspectable and replayable through publication, serialization, and interpretation surfaces.

**REQ-L-GTL3-HOOKS-007**: Engines may resolve declared hook references to Python or other executable implementations, but raw injected callables shall not be the constitutional GTL surface.

**REQ-L-GTL3-HOOKS-008**: Assurance hook attachments may declare stable hook references and opaque configuration for authority snapshot, evidence adaptation, ambiguity classification, closure policy, and gain-function adaptation, while assurance semantics remain engine-owned.

**REQ-L-GTL3-HOOKS-009**: An authored `GraphFunction` or `GraphVector` shall be able to declare its assurance hook refs and boundary intent through GTL declarations without requiring hidden side-door runtime configuration to complete the published graph-function contract.

**REQ-L-GTL3-HOOKS-010**: Traversal modulation shall be declared as governance hook/config truth, not as hidden runtime configuration or prompt prose. `GraphVector.declarations` is the primary edge-traversal qualifier surface; `GraphFunction.declarations` and `Role.policy_hooks` may provide defaults by explicit precedence.

**REQ-L-GTL3-HOOKS-011**: Traversal modulation hook configuration may carry strategy owner refs, descriptive strategy labels, scheduling primitive refs, obligation schedule refs, ordering constraints, phase gates, and bounded batch parameters, but GTL shall not define downstream product strategy semantics such as steel-thread or waterfall as language law.

**REQ-L-GTL3-HOOKS-012**: A published GTL surface may declare `abg.fp_consciousness` hook/config truth for generic `F_P` construction evaluation. The hook may declare refs and opaque config for observation adaptation, action-catalog adaptation, observation-to-action binding, construction priority scheme, affect priority policy, construction-intent admissibility, value scoring, progress classification, escalation, and intent rendering, while ABG remains the runtime admission and projection owner. Affect priority adjustments are ABG-derived projection rows, not GTL-emitted authority.

**REQ-L-GTL3-HOOKS-013**: `abg.fp_consciousness` hook precedence shall be declared and replayable. The default precedence for a selected construction action is `GraphVector.declarations` > `GraphFunction.declarations` > `Job.policy_hooks` > `Role.policy_hooks` > `Module.policy_hooks` > visible installed fallback. Malformed present declarations fail closed; absent declarations use the visible default.
