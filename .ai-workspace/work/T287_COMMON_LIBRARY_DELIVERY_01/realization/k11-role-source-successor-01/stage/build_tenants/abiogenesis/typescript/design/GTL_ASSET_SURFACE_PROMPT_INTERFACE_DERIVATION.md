# GTL Asset Surface Prompt Interface Derivation

**Status**: Active
**Date**: 2026-06-06
**Derived from**: `REQ-L-GTL3-ASSET-SURFACE`, `REQ-L-GTL3-NODE`, `GTL_3_INTERFACE_CONTRACTS.md`, `GTL_3_FIRST_SLICE_IACS.md`, T-150

## Claim

Renderer-backed prompt assets are GTL typed asset surfaces. They are not a new
topology object, not an ABG runtime carrier, and not downstream product policy.

The language-owned shape is:

```text
Node.assetSurface
  -> constructor refs
  -> renderer refs
  -> rendered-view digest policy ref
  -> section/clause kind refs
  -> authority slots: opaque authorityKindRef + disposition + fallbackPreconditionRefs
  -> proof obligation refs
```

The downstream product-owned values are:

- the concrete authority-kind vocabulary
- the assignment of those refs to normal, bounded fallback, or forbidden
  routine use
- the prompt clause content
- the semantic interpretation of product obligations

## Boundary

GTL declaration admission validates shape only:

- slot disposition is one of `normal`, `bounded_fallback`, or
  `forbidden_routine`
- `bounded_fallback` slots have at least one fallback precondition ref
- non-fallback slots do not carry fallback precondition refs
- constructor, renderer, section, clause, authority, and proof fields preserve
  ref truth through constructor, admission, serialization, and module
  publication

GTL does not parse rendered Markdown or infer prompt meaning. ABG/downstream
assurance may enforce declared authority policy against runtime packets.

## Chain Proof Shape

The proving chain is:

```text
Context[standards/compression]
  -> Node[PromptInput.assetSurface]
  -> GraphVector[construct prompt asset]
  -> Node[PromptInvocation.assetSurface]
  -> GraphVector[review/evaluate prompt asset]
  -> Node[PromptAssessment.assetSurface]
  -> GraphFunction chain
  -> Module publication/admission/serialization
```

Every node in the chain carries admitted `AssetSurface` truth. Serialization
round-trips the same constructor, renderer, authority-slot, and proof refs.

## Non-Goals

- no SDLC prompt ontology descends into GTL
- no concrete SDLC authority values descend into GTL
- no tone/verbosity/modulation policy is introduced in this ticket
- no F_D semantic extraction from rendered prompt text
