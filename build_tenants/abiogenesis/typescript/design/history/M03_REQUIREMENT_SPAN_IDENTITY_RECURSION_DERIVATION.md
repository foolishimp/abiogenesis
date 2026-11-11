# M03 Requirement Span Identity Recursion Derivation

**Status**: Active
**Date**: 2026-06-29
**Ticket**: T-169

## Source Authority

- `specification/requirements/gtl/REQ-L-GTL3-REQUIREMENTS-ALGEBRA.md`
- `specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md`
- `specification/requirements/abg/REQ-R-ABG3-PROJECTION.md`
- `specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md`
- `.ai-workspace/tickets/active/T-169-ratify-requirement-span-identity-across-recursion.md`

## Design Claim

T-169 starts by preserving span lineage through existing GTL/ABG carriers.

GTL traversal-span declarations carry inert lineage refs for frame, zoom,
foldback, and alias identity. ABG admits those refs into the existing
`TraversalSpan` carrier and exposes read-only span-lineage projection. ABG does
not mint a second span ledger or infer cross-frame identity from vector index
alone.

## First Slice Boundary

This first slice proves same-run lineage preservation across admitted
`TraversalSpan` fields and edge environment activation. It does not yet close
full recursive child-frame or sibling-call foldback. Those closure claims remain
open until the live proof exercises the real recursive path.

## Carrier Reuse

| Need | Existing carrier |
| --- | --- |
| span identity | `TraversalSpan.spanId` |
| graph anchor | `TraversalSpan.graphFunctionRef` |
| vector anchor | `TraversalSpan.graphVectorRefs` / `vectorIndexes` |
| frame lineage | `TraversalSpan.frameRefs` |
| zoom lineage | `TraversalSpan.zoomRefs` |
| foldback lineage | `TraversalSpan.foldbackRefs` |
| alias lineage | `TraversalSpan.aliasRefs` |
| residual location | `RequirementResidualProjection.spanId` |

The new `RequirementSpanLineageProjection` is a read model over the admitted
span carrier. It is not a prime carrier and does not own admission, traversal,
continuation, foldback, or re-entry authority.

## Closure Gate

The ticket remains active until a live F_P worker proof exercises span identity
through recursive child-frame or sibling-call foldback and re-entry without a
product-local span map.
