---
id: T-168
title: Ratify GTL requirement graph declarations and ABG refinement route
type: feature
ticket_category: gtl_abg_requirement_refinement
status: completed
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
  evidence at child or leaf levels, projects aggregate parent state from
  admitted child fold/residual truth, preserves residual pressure by
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
  ABG does not infer requirement meaning from unknown downstream syntax. The
  final closure proof must include a live F_P worker run that invokes a live LLM
  through the governed worker process; synthetic or installed replay-only proof
  is necessary for regression but is not sufficient for closure.
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
  - The proof does not include a live F_P worker run with replayed route events,
    emitted fold/residual/disposition truth, and a digest-pinned artifact.
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
  - Add installed proof artifact suitable for downstream consumers.
  - Add live F_P worker proof artifact suitable for downstream consumers.
proof_commands:
  - cd build_tenants/abiogenesis/typescript && npm run test:t168
  - cd build_tenants/abiogenesis/typescript && npm run test:t168:live
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

- [x] GTL requirement graph/refinement declaration law is ratified.
- [x] GTL conformance rejects dangling parent/child, relation, span, and route
      refs.
- [x] GTL requirements facade remains declaration-only and imports no ABG
      runtime modules.
- [x] Design proves requirement graph/refinement structure reuses existing
      `RequirementTerm` and `RequirementRelation` carriers unless a new carrier
      passes the DESIGN_MODULE_METHOD promotion test.
- [x] ABG admission preserves graph/refinement structure as replay truth.
- [x] ABG edge environment projection carries active parent/child requirement
      pressure.
- [x] ABG aggregate fold/residual propagation is projected from admitted
      child/leaf requirement truth and preserves requirement graph position.
- [x] Cross-frame, zoomed, or recursive span identity needed by this slice is
      either proven by T-169 or explicitly deferred.
- [x] Public queries expose read-only multi-requirement route state.
- [x] Negative proof rejects downstream-public emitters and product-local
      requirement compiler shapes.
- [x] `npm run test:t168` passes.
- [x] `npm run test:t168:live` passes with a live F_P worker process and
      digest-pinned replay artifact.
- [x] `git diff --check` passes.

## Closure Record

Closed on 2026-06-29 under STDO.

Implemented:

- GTL declaration law and conformance for requirement graph/refinement using
  existing `RequirementTerm` and `RequirementRelation` declarations.
- Public `gtl.requirements.declareRequirementRelation` declaration constructor.
- ABG `EdgeRequirementEnvironment.activeRelations` pressure projection.
- Read-only `projectRequirementGraph` and `projectAggregateStates` queries.
- Child/leaf-only default obligation/fold projection for composition parents
  with active refinement children.
- T-168 synthetic and live replay-artifact proofs.

Proof:

- `npm run test:t168` passed.
- `npm run test:t168:live` passed with a live F_P evaluator worker process.
- `npm run test:t162` passed.
- `npm run test:t164` passed.
- `npm run lint:semantic` passed.
- `npm run lint:test-harness` passed.
- `git diff --check` passed.

Synthetic artifact:

- Manifest: `build_tenants/abiogenesis/typescript/test_env/test_runs/t168_requirement_graph_refinement/20260628T194304329Z_pid96891/requirements-route-replay-manifest.json`
- Artifact digest: `sha256:c725096e725680c166ee7591bec5b7fd51776fc0849c57ba711fc703615a702f`
- Route event count: `89`

Live artifact:

- Manifest: `build_tenants/abiogenesis/typescript/test_env/test_runs/t168_requirement_graph_refinement_live/20260628T194107730Z_pid95265/requirements-route-replay-manifest.json`
- Artifact digest: `sha256:f22c56fe78ea7e29998a3f8cf6eb997b0e253ec790746c95d65e2887cb759bd5`
- Route event count: `109`

Residual scope:

- Cross-frame, zoomed, recursive, sibling-call, foldback, and re-entry span
  identity remains T-169. T-168 deliberately proves same-frame route-2
  refinement and aggregate projection only.
