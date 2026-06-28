---
id: T-168
title: Ratify GTL requirement graph declarations and ABG refinement route
type: feature
ticket_category: gtl_abg_requirement_refinement
status: active
goal: >-
  Ratify and realize the GTL/ABG substrate for requirement graph derivation,
  goal refinement, and multi-requirement route proof. GTL shall declare
  decomposition/refinement structure as inert contract-law truth. ABG shall
  admit, project, fold, residualize, and query that structure through the
  requirements route without downstream products creating requirement compilers
  or peer ledgers.
change_intent: >-
  T-164 intentionally deferred `derive_requirement_graph` and `refine_goal`
  from route-1. odd_glc can consume a single-requirement route, but full
  generic lifecycle work at scale needs multi-requirement decomposition and
  refinement. This work is partly GTL: the authoring language must declare
  parent/child, refinement, decomposition, obstruction, satisfaction, and span
  relationships without importing ABG runtime modules. ABG then owns admission,
  replay, projection, fold/residual propagation, and query.
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
governance_scope: STDO Method, GTL, ABG, Requirements Algebra, Requirement Graph Refinement, Downstream ODD Consumers
build_tenant: typescript
downstream_consumers:
  - /Users/jim/src/apps/odd_glc/.ai-workspace/tickets/active/T-001-govern-minimal-odd-glc-requirements-and-graph-design.md
source_documents:
  - specification/GOALS.md
  - specification/requirements/gtl/REQ-L-GTL3-REQUIREMENTS-ALGEBRA.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md
  - .ai-workspace/tickets/completed/T-164-realize-gtl-abg-requirements-algebra-route-for-downstream-lifecycle-consumers.md
  - .ai-workspace/tickets/active/T-169-ratify-requirement-span-identity-across-recursion.md
  - /Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/20260628T170821Z_T002_rc12_readiness_refresh.md
affected_boundary:
  requirements:
    - specification/requirements/gtl/REQ-L-GTL3-REQUIREMENTS-ALGEBRA.md
    - specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md
    - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
  design:
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_REFINEMENT_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_REFINEMENT_FIRST_SLICE_IACS.md
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_REFINEMENT_STRUCTURAL_CARRIER_DIAGRAM.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/gtl/requirements/
    - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/projection/
    - build_tenants/abiogenesis/typescript/code/src/abg/requirements/
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/
target_truth: >-
  GTL can declare a requirement graph and refinement structure over existing
  GTL module, graph-function, graph-vector, context, relation, and span refs.
  ABG admits those declarations, derives a replay-visible requirement graph,
  projects active edge environments across parent/child requirements, folds
  evidence at leaf and aggregate levels, preserves residual pressure by
  requirement graph position, and exposes read-only public queries. Downstream
  products consume the declarations and queries; they do not translate local
  requirement shapes into ABG terms.
superseded_truth: >-
  Requirement decomposition, refinement, or goal derivation is left for
  downstream products to model locally, or ABG treats route-1 atomic
  requirements as sufficient for generic lifecycle scale.
closure_law: >-
  Close only when GTL requirement graph/refinement declarations are ratified,
  ABG admission and projection preserve graph structure, public query surfaces
  expose replay-derived multi-requirement state, and proof shows at least one
  parent requirement refined into multiple child obligations with fold/residual
  propagation. Closure must prove GTL does not import ABG runtime modules and
  ABG does not infer requirement meaning from unknown downstream syntax.
non_closure_conditions:
  - Only ABG runtime code changes; GTL declaration law remains absent.
  - GTL declarations import or instantiate ABG runtime modules.
  - Downstream products must translate local requirement ledgers into ABG terms
    through a product-local compiler.
  - Requirement graph or refinement law re-mints KAOS, goal, decomposition,
    obstacle, or requirement-graph kernel carriers instead of reusing
    `RequirementTerm` and `RequirementRelation`, unless the design IACS proves
    a new essential carrier by the DESIGN_MODULE_METHOD promotion test.
  - Parent requirement closure is inferred from command success or child count
    rather than admitted fold/residual truth.
  - Parent or aggregate fold/residual truth is emitted by a second fold writer
    instead of projected from admitted child/leaf requirement truth.
  - Residual pressure loses the parent/child requirement graph position.
  - Cross-frame, zoomed, or recursive span identity is needed for closure but
    is neither closed by T-169 nor explicitly deferred from this slice.
  - Public queries expose emitter/admission/fold/residual commands.
required_work:
  - Add GTL acceptance criteria for requirement graph/refinement declarations,
    relation kinds, source digests, and route refs.
  - Add ABG acceptance criteria for admission, replay, projection, fold,
    residual, attenuation, and public query over requirement graph structure.
  - Author M03 refinement design, IACS, and structural carrier diagram.
  - In the IACS, prove the requirement graph reuses existing
    `RequirementTerm` and `RequirementRelation` carriers, with any derived graph
    view modeled as a replay projection rather than a re-minted carrier kernel.
  - In the IACS, apply the DESIGN_MODULE_METHOD promotion test to every
    proposed new carrier before adding it to GTL or ABG.
  - Define aggregate parent fold/residual as projection over admitted leaf or
    child requirement truth, not as a second fold-emission authority.
  - Realize TypeScript GTL constructors and ABG admission/projection/query
    support without GTL-to-ABG runtime imports.
  - Add synthetic proof for multi-requirement refinement and residual
    propagation.
  - Add installed or live proof artifact suitable for downstream consumers.
proof_commands:
  - cd build_tenants/abiogenesis/typescript && npm run test:t168
  - cd build_tenants/abiogenesis/typescript && npm run lint:semantic
  - cd build_tenants/abiogenesis/typescript && npm run lint:test-harness
  - git diff --check
---

# T-168: GTL Requirement Graph And ABG Refinement Route

## STDO Triage

### First Missing Layer

Requirements.

The missed surface is GTL, not only ABG. Route-1 consumed atomic GTL
requirement declarations. Full lifecycle scale requires GTL declaration law
for requirement graph and refinement structure before ABG can admit and project
that structure.

### Lawful Re-Entry

`requirement_reprice -> design_reframe -> realization_refactor`.

The product boundary remains stable: GTL declares, ABG admits/projects/runs,
downstream products interpret.

## Acceptance Checklist

- [ ] GTL requirement graph/refinement declaration law is ratified.
- [ ] GTL conformance rejects dangling parent/child, relation, span, and route
      refs.
- [ ] GTL requirements facade remains declaration-only and imports no ABG
      runtime modules.
- [ ] Design proves requirement graph/refinement structure reuses existing
      `RequirementTerm` and `RequirementRelation` carriers unless a new carrier
      passes the DESIGN_MODULE_METHOD promotion test.
- [ ] ABG admission preserves graph/refinement structure as replay truth.
- [ ] ABG edge environment projection carries active parent/child requirement
      pressure.
- [ ] ABG aggregate fold/residual propagation is projected from admitted
      child/leaf requirement truth and preserves requirement graph position.
- [ ] Cross-frame, zoomed, or recursive span identity needed by this slice is
      either proven by T-169 or explicitly deferred.
- [ ] Public queries expose read-only multi-requirement route state.
- [ ] Negative proof rejects downstream-public emitters and product-local
      requirement compiler shapes.
- [ ] `npm run test:t168` passes.
- [ ] `git diff --check` passes.
