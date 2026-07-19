# Scenario Bundle - Language Primitives And Traversal

> **T-283 disposition (2026-07-20):** Prior scenario evidence; held and
> non-operative for 5.0 acceptance. The exact current Product scenarios are
> `ABG5-S01` through `ABG5-S07` in `PRODUCT.md` and
> `REQ-P-SCENARIOS.md`. Reuse requires post-closure re-derivation.

**Validates**: REQ-L-GTL3-LANGUAGE, REQ-L-GTL3-ATTRS, REQ-L-GTL3-CONTEXT, REQ-L-GTL3-GRAPH, REQ-L-GTL3-NODE, REQ-L-GTL3-GRAPHVECTOR, REQ-L-GTL3-INTERFACE, REQ-L-GTL3-IDENTITY

**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [INTENT.md](../INTENT.md) INT-001, [ODD_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/ODD_METHOD.md), [PRODUCT.md](../PRODUCT.md), [requirements/gtl/README.md](../requirements/gtl/README.md)

**Purpose**: Prove that GTL 3 language identity, immutable declaration
carriers, typed graph structure, typed asset-surface declarations, invariant
traversal, and opaque identity can be stated and inspected directly in
Python-native GTL declarations.

## Scenario

Author a minimal graph with typed nodes, one invariant traversal boundary,
context bindings, declared `asset_surface` contract truth, and explicit
declaration metadata, then inspect the authored surfaces and their identity
behavior.

## Significant Paths

- success path: immutable `Attrs`, `Context`, `Node`, `GraphVector`, and
  `Graph` surfaces compose into one lawful graph declaration
- asset path: declared `asset_surface` truth remains part of the visible node
  contract and survives GTL interpretation/materialization without runtime
  invention
- invariant path: one `GraphVector` exposes the traversal boundary and its
  attached declarations without becoming a rival ontology
- identity path: targeting and substitution use opaque ids rather than labels
- fail-closed path: invalid context or duplicate attr-key declarations are
  rejected

## Expected Outcomes

1. GTL remains an LLM-first, graph-first, declarative language surface
2. `Node` remains the typed local locus for both schema/markov truth and
   optional `asset_surface` declarations
3. invariant traversal is visible on `GraphVector` and not hidden in runtime
   state
4. identity is categorical and distinct from human-readable labels
