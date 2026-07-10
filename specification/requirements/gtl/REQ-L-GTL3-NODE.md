# REQ-L-GTL3-NODE — Typed Loci With Markov And Asset Surface Declarations

**Status**: Active
**Category**: Capability
**Date**: 2026-07-11
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define `Node` as the typed local locus of graph meaning, invariant state, and
asset-surface declaration in GTL 3.

## Acceptance Criteria

**REQ-L-GTL3-NODE-001**: `Node` shall be a first-class GTL declaration representing a typed local locus within a graph.

**REQ-L-GTL3-NODE-002**: A node shall carry declared schema/type and declared markov conditions as one language surface.

**REQ-L-GTL3-NODE-003**: `markov` shall express declarative state, outcome, or acceptance conditions at that node locus.

**REQ-L-GTL3-NODE-004**: Source-node markov conditions express upstream guarantees available to downstream graph application. Target-node markov conditions express declared conditions that a lawful transformation is intended to satisfy.

**REQ-L-GTL3-NODE-005**: `markov` belongs to the language declaration surface, not to ABG runtime metadata. ABG may interpret, render, project, or validate it, but shall not own or invent it.

**REQ-L-GTL3-NODE-006**: `markov` shall default to the empty tuple when unspecified. Absence of `markov` means no declared conditions.

**REQ-L-GTL3-NODE-007**: `Node.schema` shall support both concrete type references and symbolic schema names, including vectorized boundaries such as `Vector[T]`.

**REQ-L-GTL3-NODE-008**: Any lawful GTL interpretation, serialization surface, or GTL to ABG bridge shall preserve node schema and markov conditions without semantic loss.

**REQ-L-GTL3-NODE-009**: A node may declare an `asset_surface` describing the intended asset kind/schema role at that locus, required carried contexts, and standards or output-contract references associated to production of that asset.

**REQ-L-GTL3-NODE-010**: `asset_surface` belongs to GTL declaration truth, not ABG runtime invention. ABG may resolve, project, or validate it, but shall not invent missing `asset_surface` law at runtime.

**REQ-L-GTL3-NODE-011**: Any lawful GTL interpretation, serialization surface, or GTL to ABG bridge shall preserve declared `asset_surface` contract without semantic loss.

**REQ-L-GTL3-NODE-012**: When a node declares a renderer-backed, prompt-like, or otherwise policy-rich `asset_surface`, the detailed asset interface shall be governed by `REQ-L-GTL3-ASSET-SURFACE`. The node remains the typed locus; the asset surface remains subordinate declaration truth.

**REQ-L-GTL3-NODE-013**: A node may bind to a reusable node type through an
explicit compiler-visible type reference. Type meaning shall not depend only
on `Node.schema`, tags, prompt prose, file names, or downstream convention.

**REQ-L-GTL3-NODE-014**: A node type reference shall be optional declaration
truth, because a type reference is a strengthening declaration over the node's
inline schema, markov, and asset-surface contract, not a mandatory admission
field: a node without a type reference carries exactly its inline contract.
When present, the type reference shall be preserved by GTL construction,
admission, serialization, conformance, and GTL-to-ABG bridge surfaces without
semantic loss, and its satisfaction is enforced fail-closed per
REQ-L-GTL3-NODE-015.

**REQ-L-GTL3-NODE-015**: A node with inline schema, markov, and asset-surface
law plus a type reference shall satisfy the referenced type only when the
inline declaration preserves or strengthens the referenced type contract.
Unknown type refs or weakened local declarations shall fail closed.
