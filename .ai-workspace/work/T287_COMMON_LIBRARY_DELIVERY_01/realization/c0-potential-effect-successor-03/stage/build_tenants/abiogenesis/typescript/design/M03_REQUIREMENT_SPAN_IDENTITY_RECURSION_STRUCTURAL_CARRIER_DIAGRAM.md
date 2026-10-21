# M03 Requirement Span Identity Recursion Structural Carrier Diagram

**Status**: Active
**Date**: 2026-06-29
**Ticket**: T-169

```text
GTL traversal span declaration
  spanId
  graphFunctionRef
  graphVectorRefs
  vectorIndexes
  sourceNodeRef / targetNodeRef
  frameRefs
  zoomRefs
  foldbackRefs
  aliasRefs

ABG admission
  -> traversal_span_admitted
       TraversalSpan
         frameRefs[*]
         zoomRefs[*]
         foldbackRefs[*]
         aliasRefs[*]

Replay
  -> RequirementLedger.spans[*]

Edge query
  -> EdgeRequirementEnvironment.activeSpans[*]

Read-only query
  -> RequirementSpanLineageProjection[*]

Residual
  -> RequirementResidualProjection.spanId
```

## Forbidden Authority

- no product-local span map,
- no vector-index-only identity,
- no query-invented recursive span join,
- no second frame/zoom/foldback carrier,
- no downstream re-entry controller.
