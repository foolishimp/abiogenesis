# REQ-L-GTL2-IDENTITY — Categorical Identity for First-Class Types

**Status**: Active
**Date**: 2026-03-25
**Derives from**: INT-GTL2-001
**Supersedes**: (new — retroactive correction to type foundations)
**Wave**: 0 (foundational — constrains all other language requirements)

---

## Purpose

Every first-class GTL type shall carry an opaque identity distinct from its human-readable label. Identity determines when two values refer to the same object versus structurally equivalent but distinct objects. Without this, operations that target, replace, or record provenance of objects degenerate into label-matching, which aliases under renaming, duplication, or repeated application.

This requirement exists because the original GTL 2.x type definitions used `.name` as both label and identity handle, which caused aliasing bugs in substitution targeting and graph replacement during Phase 5 implementation.

## Foundations

From category theory: objects in a category have identity independent of their labelling. Two objects may be isomorphic (structurally equivalent) without being identical. Morphisms between objects are distinguished by their source and target identity, not by name. These distinctions are not optional — without them, composition and substitution lose referential integrity.

GTL types are the objects and morphisms of a workflow category. The same discipline applies:

- Two Graphs with the same structure but different positions in a Module are distinct objects.
- Two GraphVectors with the same source→target nodes but serving different contracts are distinct morphisms.
- A Graph produced by `substitute()` is a new object derived from its inputs, not the same object with modified contents.

## Acceptance Criteria

**REQ-L-GTL2-IDENTITY-001**: Every first-class structural type (`Graph`, `GraphVector`, `Node`, `GraphFunction`) shall carry an opaque identity field (`.id`) that is distinct from its human-readable label (`.name`).

**REQ-L-GTL2-IDENTITY-002**: Identity shall be automatically minted at construction. Authors may supply an explicit id but are not required to.

**REQ-L-GTL2-IDENTITY-003**: `.name` shall be a human-readable label with no operational semantics. Operations that target, replace, or reference specific objects shall use `.id`, not `.name`.

**REQ-L-GTL2-IDENTITY-004**: Identity preservation rules shall be defined for each transform:
- Pure copy: identity preserved.
- Algebraic transform (`substitute`, `compose`): new identity minted for the result.
- Template materialization (`GraphFunction.template()`): new identity minted.

**REQ-L-GTL2-IDENTITY-005**: Comparison functions shall be defined separately from identity:
- `same_object(a, b)` — identity equality (by `.id`).
- `same_structure(a, b)` — structural equality (by content, ignoring `.id`).
- `isomorphic(a, b)` — graph isomorphism (structure-preserving bijection).
- `derived_from(a, b)` — provenance relationship (via transform lineage).

**REQ-L-GTL2-IDENTITY-006**: Substitution shall target a specific `GraphVector` by `.id`, not by `.name`. This prevents aliasing when multiple vectors share the same label.

**REQ-L-GTL2-IDENTITY-007**: Module-level graph replacement (after substitution) shall target a specific `Graph` by `.id`, not by `.name`. This prevents aliasing when a Module contains multiple graphs.
