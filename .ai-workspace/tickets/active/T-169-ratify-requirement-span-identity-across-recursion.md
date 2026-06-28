---
id: T-169
title: Ratify requirement span identity across recursion and foldback
type: feature
ticket_category: gtl_abg_span_identity
status: active
goal: >-
  Ratify and realize the GTL/ABG substrate for stable requirement span identity
  across graph frames, zoom, child frames, sibling graph calls, recursion,
  foldback, continuation, and re-entry. GTL shall declare span and lineage refs
  as inert contract-law truth over existing graph topology anchors. ABG shall
  admit, project, preserve, fold, residualize, and query those refs without
  downstream products creating local span maps or recursive pressure ledgers.
change_intent: >-
  GOAL-014 now depends on any-scale lifecycle pressure: T-168 needs
  requirement graph/refinement structure, and T-160 needs recursive executive
  observation over admitted traversal graphs. The unclosed gap is span identity
  across frames and recursion. Existing `spanCoversEdge`-style vector
  membership is insufficient for child-frame, sibling-call, zoom, foldback, and
  re-entry truth. This ticket makes that identity first-class enough for GTL
  declaration and ABG projection while preserving the existing topology and
  requirements-algebra carriers.
change_class: requirement_reprice
re_entry_point: requirements
downstream_reentry_sequence:
  - design_reframe
  - realization_refactor
owner: abiogenesis
priority: critical
triaged_at: 2026-06-29
created_at: 2026-06-29
updated_at: 2026-06-29
governance_scope: STDO Method, GTL, ABG, Requirements Algebra, Span Identity, Recursive Traversal, Foldback, Re-Entry
build_tenant: typescript
downstream_consumers:
  - /Users/jim/src/apps/odd_glc/.ai-workspace/tickets/active/T-001-govern-minimal-odd-glc-requirements-and-graph-design.md
  - /Users/jim/src/apps/odd_glc/.ai-workspace/tickets/active/T-007-interpret-assurance-fold-and-residual-pressure.md
source_documents:
  - specification/GOALS.md
  - specification/PRODUCT.md
  - specification/INTENT.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-REQUIREMENTS-ALGEBRA.md
  - specification/requirements/abg/REQ-R-ABG3-ITERATION.md
  - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md
  - .ai-workspace/comments/codex/20260626T011328Z_STRATEGY_requirements_algebra_edge_spans.md
  - .ai-workspace/tickets/active/T-160-declare-abg-recursive-executive-observer-graph-for-obligation-pressure.md
  - .ai-workspace/tickets/active/T-168-ratify-gtl-requirement-graph-and-abg-refinement-route.md
affected_boundary:
  requirements:
    - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
    - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
    - specification/requirements/gtl/REQ-L-GTL3-REQUIREMENTS-ALGEBRA.md
    - specification/requirements/abg/REQ-R-ABG3-ITERATION.md
    - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
    - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
    - specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md
  design:
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENT_SPAN_IDENTITY_RECURSION_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENT_SPAN_IDENTITY_RECURSION_FIRST_SLICE_IACS.md
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENT_SPAN_IDENTITY_RECURSION_STRUCTURAL_CARRIER_DIAGRAM.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/gtl/requirements/
    - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/projection/
    - build_tenants/abiogenesis/typescript/code/src/abg/requirements/
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t169_requirement_span_identity_recursion.test.mjs
target_truth: >-
  A GTL requirement span has stable identity and lineage across a selected
  `GraphFunction`, internal `GraphVector`, frame, zoom frame, recursive child
  frame, sibling graph call, foldback, continuation, and re-entry. ABG admits
  and projects that identity as replay-derived truth, preserves source span
  refs through fold/residual/disposition, and exposes read-only queries that
  let downstream products interpret pressure without building local span maps.
superseded_truth: >-
  Requirement span identity is inferred only from edge membership, vector index,
  source/target node equality, string matching, test fixture shape, or
  product-local mapping between parent and child frames.
closure_law: >-
  Close only when GTL span declaration law and ABG projection law define stable
  span identity across frame, zoom, recursion, foldback, continuation, and
  re-entry boundaries; design proves no rival topology anchor or graph-vector
  carrier is introduced without DESIGN_MODULE_METHOD promotion; TypeScript
  realization preserves span refs through requirement fold/residual/disposition;
  and proof demonstrates parent span -> child frame or sibling call -> foldback
  -> re-entry projection without product-local span mapping.
non_closure_conditions:
  - The solution relies only on `spanCoversEdge`, vector-set membership, vector
    index, source/target node equality, or string matching.
  - GTL span declarations import or instantiate ABG runtime modules.
  - ABG creates a rival graph topology anchor, graph-vector carrier, or local
    span ledger instead of projecting over existing GTL/ABG carriers.
  - Requirement fold, residual, disposition, continuation, or re-entry truth
    loses the original span ref or parent/child lineage.
  - Cross-frame span identity is established in a query after the fact instead
    of emitted or projected from admitted traversal truth.
  - Downstream products must maintain local parent/child span maps to interpret
    lifecycle pressure.
  - T-160 claims recursive or any-scale pressure preservation before consuming
    this span identity law or explicitly deferring affected recursive claims.
required_work:
  - Add GTL acceptance criteria for stable requirement span declaration refs,
    lineage refs, source digests, graph-function refs, graph-vector refs,
    frame/zoom/foldback refs, and re-entry refs.
  - Add ABG acceptance criteria for admitting and projecting requirement span
    identity through traversal, frame open, graph call, zoom, recursion,
    foldback, continuation, and re-entry.
  - Author M03 span-identity derivation, IACS, and structural carrier diagram.
  - In the IACS, prove reuse of existing GTL topology anchors and ABG traversal,
    frame, continuation, projection, and requirements-algebra carriers by
    default.
  - In the IACS, apply the DESIGN_MODULE_METHOD promotion test before adding
    any new carrier.
  - Realize TypeScript GTL constructors and ABG admission/projection/query
    support without GTL-to-ABG runtime imports.
  - Add proof for parent requirement span projection through a child frame or
    sibling graph call, foldback, residual preservation, and re-entry.
  - Add negative proof that product-local span maps, query-invented span joins,
    and vector-index-only identity fail closure.
proof_commands:
  - cd build_tenants/abiogenesis/typescript && npm run test:t169
  - cd build_tenants/abiogenesis/typescript && npm run lint:semantic
  - cd build_tenants/abiogenesis/typescript && npm run lint:test-harness
  - git diff --check
---

# T-169: Requirement Span Identity Across Recursion

## STDO Triage

### First Missing Layer

Requirements.

The missing surface is shared GTL/ABG law. GTL must declare stable span and
lineage refs over existing graph topology anchors. ABG must admit and project
those refs through runtime frame, zoom, recursion, foldback, continuation, and
re-entry truth. A downstream product must not infer recursive lifecycle
pressure through local span maps.

### Lawful Re-Entry

`requirement_reprice -> design_reframe -> realization_refactor`.

The product boundary remains stable: GTL declares the span identity and lineage
surface; ABG admits, projects, folds, residualizes, and re-enters over it;
downstream products interpret admitted read models.

## Acceptance Checklist

- [ ] GTL span identity and lineage declaration law is ratified.
- [ ] GTL conformance rejects dangling graph-function, graph-vector, frame,
      zoom, foldback, continuation, re-entry, parent-span, and child-span refs.
- [ ] GTL declarations remain inert and import no ABG runtime modules.
- [ ] Design proves existing GTL topology anchors and ABG traversal/projection
      carriers are reused unless a new carrier passes the DESIGN_MODULE_METHOD
      promotion test.
- [ ] ABG projection preserves span identity through frame, zoom, child-frame
      or sibling-call, recursion, foldback, continuation, and re-entry.
- [ ] Requirement fold/residual/disposition views preserve original span refs
      and parent/child lineage.
- [ ] Public queries expose read-only span-lineage projection state.
- [ ] Negative proof rejects vector-index-only identity, query-invented span
      joins, and product-local span maps.
- [ ] `npm run test:t169` passes.
- [ ] `git diff --check` passes.
