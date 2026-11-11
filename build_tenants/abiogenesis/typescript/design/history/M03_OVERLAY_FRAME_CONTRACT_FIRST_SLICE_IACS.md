# M03 Overlay Frame Contract First-Slice IACS

**Status**: Active
**Date**: 2026-05-16
**Ticket**: T-137

## Irreducible Architectural Carrier Set

1. `OverlayFrameContract`
   The replay-stable contract binding an overlay frame to GTL anchors, fire and
   terminate predicates, pressure refs, fold-back target, re-entry target, and
   optional no-close policy.

2. `OverlayFrameScopeEventRow`
   The lawful anchor row. It prevents overlay from becoming a rival topology by
   requiring scope kind to be one of graph function, graph vector, graph span,
   job, module, or rule.

3. `OverlayFramePredicateEventRow`
   The fire/terminate predicate declaration. It carries observed-state refs as
   the only load-bearing decision inputs.

4. `OverlayFrameFoldbackOutcome`
   The evaluated frame outcome over admitted observed state and clearing
   evidence.

5. `OverlayFrameProjection`
   The replay-derived read model carrying active rows, carried pressure, and
   cleared pressure.

6. `overlay_frame_declared` / `overlay_frame_evaluated`
   The runtime event pair that makes frame declaration and evaluation replay
   truth.

## Subordinate Payloads

- product-local overlay labels;
- predicate expression internals;
- display rows;
- rendered prompt text;
- domain-specific pressure labels.

These remain subordinate because ABG only owns the frame law. Products own the
domain vocabulary that names why the frame exists.

## First Slice

The first slice proves one overlay frame over a graph function, a graph vector,
and a graph span. It admits observed-state refs for fire and terminate, carries
pressure while terminate or clearing evidence is missing, clears only with
evidence, preserves pressure under no-close policy, and rejects evaluations that
do not replay from observed-state truth.
