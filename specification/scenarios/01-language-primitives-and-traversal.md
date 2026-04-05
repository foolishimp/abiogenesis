# Scenario Bundle - Language Primitives And Traversal

**Validates**: REQ-L-GTL3-LANGUAGE, REQ-L-GTL3-ATTRS, REQ-L-GTL3-CONTEXT, REQ-L-GTL3-GRAPH, REQ-L-GTL3-NODE, REQ-L-GTL3-GRAPHVECTOR, REQ-L-GTL3-INTERFACE, REQ-L-GTL3-IDENTITY

**Derives from**: [/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/genesis_sdlc/specification/standards/SPEC_METHOD.md), [INTENT.md](../INTENT.md) INT-001, [GTL_3_CONSTITUTIONAL_DESIGN.md](../GTL_3_CONSTITUTIONAL_DESIGN.md)

**Purpose**: Prove that GTL 3 language identity, immutable declaration
carriers, typed graph structure, invariant traversal, and opaque identity can
be stated and inspected directly in Python-native GTL declarations.

## Scenario

Author a minimal graph with typed nodes, one invariant traversal boundary,
context bindings, and explicit declaration metadata, then inspect the authored
surfaces and their identity behavior.

## Significant Paths

- success path: immutable `Attrs`, `Context`, `Node`, `GraphVector`, and
  `Graph` surfaces compose into one lawful graph declaration
- invariant path: one `GraphVector` exposes the traversal boundary and its
  attached declarations without becoming a rival ontology
- identity path: targeting and substitution use opaque ids rather than labels
- fail-closed path: invalid context or duplicate attr-key declarations are
  rejected

## Expected Outcomes

1. GTL remains an LLM-first, graph-first, declarative language surface
2. invariant traversal is visible on `GraphVector` and not hidden in runtime
   state
3. identity is categorical and distinct from human-readable labels
