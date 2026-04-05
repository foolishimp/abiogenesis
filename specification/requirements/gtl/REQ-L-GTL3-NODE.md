# REQ-L-GTL3-NODE — Typed Loci With Markov Conditions

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [GTL_3_CONSTITUTIONAL_DESIGN.md](../../GTL_3_CONSTITUTIONAL_DESIGN.md)

---

## Purpose

Define `Node` as the typed local locus of graph meaning and invariant state in
GTL 3.

## Acceptance Criteria

**REQ-L-GTL3-NODE-001**: `Node` shall be a first-class GTL declaration representing a typed local locus within a graph.

**REQ-L-GTL3-NODE-002**: A node shall carry declared schema/type and declared markov conditions as one language surface.

**REQ-L-GTL3-NODE-003**: `markov` shall express declarative state, outcome, or acceptance conditions at that node locus.

**REQ-L-GTL3-NODE-004**: Source-node markov conditions express upstream guarantees available to downstream graph application. Target-node markov conditions express declared conditions that a lawful transformation is intended to satisfy.

**REQ-L-GTL3-NODE-005**: `markov` belongs to the language declaration surface, not to ABG runtime metadata. ABG may interpret, render, project, or validate it, but shall not own or invent it.

**REQ-L-GTL3-NODE-006**: `markov` shall default to the empty tuple when unspecified. Absence of `markov` means no declared conditions.

**REQ-L-GTL3-NODE-007**: `Node.schema` shall support both concrete type references and symbolic schema names, including vectorized boundaries such as `Vector[T]`.

**REQ-L-GTL3-NODE-008**: Any lawful GTL interpretation, serialization surface, or GTL to ABG bridge shall preserve node schema and markov conditions without semantic loss.
