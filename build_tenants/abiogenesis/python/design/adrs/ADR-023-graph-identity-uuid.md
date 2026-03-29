# ADR-023: Graph and Vector Identity via UUID

**Series**: abiogenesis / claude_code build
**Status**: Proposed
**Date**: 2026-03-25
**Implements**: REQ-L-GTL2-IDENTITY
**Scope**: `gtl/graph.py`, `gtl/algebra.py`, `gtl/function_model.py`, `genesis/services.py`, `genesis/selection.py`, `genesis/interpret.py`

---

## Context

### The identity problem

`Graph.name` and `GraphVector.name` are human-readable labels. They are not operational identity handles. The runtime needs opaque identity for targeting, replacement, and provenance. Without that split, the following failure modes exist:

1. **Graph replacement by name**: After `substitute()`, `services.py` rebuilt the Module by matching `g.name == substituted_graph.name`. If a Module had two graphs with the same name, the wrong graph could be replaced silently.

2. **Vector targeting by name**: `substitute(outer, "design→code", inner)` targets by vector name. If two vectors in the same graph share a name (structurally impossible today but not prevented by the type system), the wrong vector would be substituted.

3. **Child key aliasing**: spawned children can collide when the same graph function is applied at multiple sites and work identity is label-based.

### Category-theoretic foundation

REQ-L-GTL2-IDENTITY establishes that GTL types are objects and morphisms in a workflow category. Identity must be independent of labelling. The requirement specifies opaque `.id` fields, identity preservation rules, and separation of identity from comparison.

## Decision

Add a `uuid4`-based `.id` field to `Graph`, `GraphVector`, `Node`, and `GraphFunction`. Use `dataclasses.field(default_factory=..., compare=False)` so ids are auto-minted at construction — no author burden.

### Identity does not redefine equality

The `.id` field is declared with `compare=False`. This means:

- **Structural equality** (`==`) is unchanged — two Graphs with the same structure are equal regardless of `.id`. This preserves the frozen value-type semantics established by REQ-L-GTL2-GRAPH-001.
- **Object identity** (`same_object(a, b)`) is a separate function that compares `.id` fields explicitly. This is the handle used by substitution targeting and module replacement.

This separation is required by REQ-L-GTL2-IDENTITY-005: identity comparison and structural comparison are distinct operations. Hardening `.id` into `__eq__` would break every existing equality assertion and conflate two intentionally separate concepts.

### Identity preservation rules

| Operation | `.id` on result |
|-----------|-----------------|
| Author constructs `Graph(...)` | Auto-minted (or explicit) |
| `substitute(outer, vec_id, inner)` → new Graph | New id |
| `compose(f, g)` → materialized Graph | New id |
| `GraphFunction.template()` → Graph | New id |
| Frozen copy (same dataclass instance) | Same id (frozen = same object) |

### What changes

1. **`gtl/graph.py`**: `Graph`, `GraphVector`, `Node` gain `.id: str` with UUID default factory.
2. **`gtl/function_model.py`**: `GraphFunction` gains `.id: str` with UUID default factory.
3. **`gtl/algebra.py`**:
   - `substitute()` parameter changes: `contract_vector: str` becomes the vector `.id`, not name.
   - Result Graph gets a new id (not copied from outer).
   - `compose()` result GraphFunction gets a new id.
4. **`genesis/selection.py`**: `enumerate_candidates()` and `validate_selection()` match by vector id.
5. **`genesis/interpret.py`**: `apply_selection()` finds vector by id. `SelectionDecision.contract_id` carries vector id.
6. **`genesis/services.py`**: Module rebuild matches by `graph.id`. Graph-name uniqueness guard replaced by id-based targeting.

### What does NOT change

- `.name` remains on all types as a human-readable label for logging, events, and display.
- Event data (`"edge"` fields) still uses `.name` for readability — but provenance fields carry `.id`.
- All existing tests continue to work — auto-minted ids mean no manual changes needed for construction. Tests that target by name in `substitute()` calls update to target by id.

### Comparison functions (future)

REQ-L-GTL2-IDENTITY-005 specifies `same_object`, `same_structure`, `isomorphic`, `derived_from`. These are not implemented in this ADR — they will be added when needed. The `.id` field is sufficient to support `same_object`; the others require additional infrastructure.

## Consequences

- **Positive**: Eliminates name-based aliasing. Substitution, replacement, and provenance become referentially sound.
- **Positive**: Auto-minting means zero author burden. Existing specs don't change.
- **Positive**: Foundation for derived-from lineage tracking (transform chains carry parent ids).
- **Negative**: Every Graph/Node/Vector/GraphFunction instance carries a UUID string (~36 bytes). Negligible for current scale.
- **Negative**: Tests that construct types and assert on substitution results need to use `.id` for targeting. One-time migration.
