# M03 Requirement Span Identity Recursion First Slice IACS

**Status**: Active
**Date**: 2026-06-29
**Ticket**: T-169

## Intended

Requirement span identity is stable across frame, zoom, foldback, and alias
lineage refs declared in GTL and admitted by ABG.

## Actual

Before this slice, the ABG `TraversalSpan` carrier already had
`frameRefs`, `zoomRefs`, `foldbackRefs`, and `aliasRefs`, but the GTL
requirements declaration wrapper did not expose them. Route admission therefore
filled those fields with empty arrays.

## Comparison

The gap is a wrapper/admission gap, not a carrier gap. The existing ABG carrier
already contains the required lineage fields.

## Sufficient For First Slice

- GTL span declarations accept frame, zoom, foldback, and alias refs.
- ABG declaration admission preserves those refs in `TraversalSpan`.
- Edge environment activation respects lineage refs when supplied by the edge.
- Public query exposes span-lineage read models.
- Residual projection keeps the original span id.

## Not Yet Sufficient For Full Closure

The first slice does not prove recursive child-frame or sibling-call foldback.
T-169 cannot close until the live proof exercises that runtime path.

## Promotion Test

No new prime carrier is promoted.

`RequirementSpanLineageProjection` is a read-only projection over
`TraversalSpan`; it does not pass the carrier promotion test as authority
because all identity truth remains in admitted span/runtime carriers.
It is a subordinate query output, not a standalone runtime carrier or
frame/zoom/foldback ledger.
