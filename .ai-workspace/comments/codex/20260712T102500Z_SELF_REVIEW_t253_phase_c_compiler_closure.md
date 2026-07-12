# T-253 Phase C Compiler And Closure Self-Review

**Surface**: M03 structural HOF validation, conformance projection, standing
proof integration, and generated public publication only.

**Verdict**: `closure_ready`.

## Findings And Repairs

1. The first review reproduced a same-contract/different-node-ref alias that
   reached `semantic_not_realized`. M03 now compares exact `(nodeRef,
   nodeContractKey)` pairs across environment, inline graph, graph nodes, and
   wrapper source/target. Direct and raw-admitted alias differentials now end
   `invalid_program`.
2. The compiler result omitted its design-declared repair affordance. The
   closed diagnostic now carries it, and the conformance issue derives its
   existing repair edit class from that one value.
3. The focused trace incorrectly cited HOF-004 and tested name spoofing only.
   The trace now cites HOF-001/005/006 and pins both name-only and tag-only
   non-authority.
4. The new public declarations exposed a missing Node shim in the older T-143
   type lane and stale generated publication inventories. The type lane now
   includes the existing shim, publication was regenerated once over the final
   M01/M03 surface, and all T-223 publication tests pass.

## Design Conformance

- A HOF relation is observed only from one canonical
  `gtl.hof_application`; no name or tag establishes feature truth.
- Child, member, vector, wrapper, graph, environment, and host relations are
  resolved structurally by exact ref and contract.
- Missing, duplicate, malformed, unresolved, or contradictory relation truth
  is `invalid_program` with a stable path, evidence, and repair affordance.
- A valid declaration ends at `semantic_not_realized` because no generic HOF
  runtime consumer exists.
- Added M03 source and proof lines contain no Consensus, reviewer, submitter,
  ticket-consensus, or homeostatic vocabulary.
- No scheduler, runtime fan-out, fan-in, C algebra, dispatch, worker, event,
  replay, archive, or product-specific branch was added.

## Verification

- `npm run test:t253`: green; 46 standing GTL-law tests and 131 focused
  integration/diagnostic tests.
- `npm run test:semantic`: 1523/1523 green.
- `npm run lint:host`: green.
- direct pinned render of
  `M01_M03_TYPED_HOF_VECTOR_RELATION_BEHAVIOR_DESIGN.md`: 1 file, 3 ordered
  diagrams, digest
  `sha256:70c25b8dd2fffd986d81eb49670bd3e7e534438ac8ccc179feb76922a9410cfa`.
- standing registered-design gate: 9 files and 27 diagrams green.
- generated public-contract publication: current; T-223 publication and
  source-blind tests green inside the full suite.
- `git diff --check`: green.
- independent Phase C re-review: no findings; closure earned within the
  declared non-runtime boundary.

T-253 closes the typed declaration and compiler boundary only. The retained
`gtl-hof-unrealized-fan-out` result is the input to T-252's frontier census,
not evidence that runtime fan-out exists.
