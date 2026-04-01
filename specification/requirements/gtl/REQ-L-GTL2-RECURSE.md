# REQ-L-GTL2-RECURSE — Recursive Graph Application

**Status**: Active
**Category**: Capability
**Date**: 2026-03-24
**Derives from**: INT-GTL2-006
**Supersedes**: REQ-F-REFINE (replaced — spawn/fold-back portions)
**Wave**: 2

---

## Purpose

Graph-function application may induce child or repeated graph-function
applications. Recursion preserves lineage semantics while keeping the outer
contract intelligible.

Recursive application is invocation-local: child work is realized as lineage
and fold-back over a stable outer contract, not as automatic promotion of inner
vectors into module-global topology.

The recursive declaration must also publish the lawful fold-back contract:
how child return truth re-binds into the parent contract, and that parent
convergence requires re-evaluation rather than direct inheritance from child
closure alone.

The declared recursive surface must be sufficient for a continuation-driven
interpreter to suspend, resume, and enforce fold-back barriers without
inventing hidden recursion semantics outside the published recursion contract.

## Acceptance Criteria

**REQ-L-GTL2-RECURSE-001**: `recurse(graph_function, termination, foldback)` shall express that graph-function application may induce child or repeated graph-function applications under a declared termination condition and a declared fold-back contract.

**REQ-L-GTL2-RECURSE-002**: Recursion shall preserve explainable work lineage — parent/child relationships are traceable through parent work identity and child lineage keys.

**REQ-L-GTL2-RECURSE-003**: The declared fold-back contract shall identify how child return material re-binds into the parent contract. Interpreter-local invention of fold-back semantics is not lawful.

**REQ-L-GTL2-RECURSE-004**: Fold-back shall make the parent contract re-bindable and re-evaluable. Child closure alone shall not certify parent convergence.

**REQ-L-GTL2-RECURSE-005**: Recursive application shall preserve the declared outer interface of the recursively applied graph function. Inner steps may remain frame-local unless a separate export surface explicitly publishes them.

**REQ-L-GTL2-RECURSE-006**: Recursion shall be bounded by a declared termination contract and/or explicit bound visible to the interpreter.

**REQ-L-GTL2-RECURSE-007**: The published recursive declaration shall expose enough termination and fold-back truth for a continuation-driven interpreter to resume recursive execution and barrier evaluation without hidden interpreter-local recursion policy.
