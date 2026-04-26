# T-070 Investigate GTL Zoom In Zoom Out Fold Over Existing ODD Algebra

- id: T-070
- title: Investigate GTL zoom in, zoom out, and fold over existing ODD algebra
- type: spike
- ticket_category: substrate_semantics_investigation
- status: completed
- build_tenant: typescript
- goal: research-product-lab-abg-sufficiency
- change_intent: Determine whether zoom in, zoom out, and fold are already expressible through existing GTL/ODD algebra or require new requirement/design law before implementation.
- change_class: requirement_reprice
- re_entry_point: requirements
- triaged_at: 2026-04-26
- governance_scope: STDO Method
- governance_scope_expansion:
  - S: `SPEC_METHOD.md`
  - T: `TICKET_METHOD.md`
  - D: `DESIGN_MODULE_METHOD.md`
  - O: `ODD_METHOD.md`
- priority: medium
- created_at: 2026-04-26
- updated_at: 2026-04-26
- completed_at: 2026-04-26
- dependencies:
  - T-068 completed
  - T-069 completed
- affected_boundary: `specification/requirements/gtl/**`, `specification/requirements/abg/**`, `build_tenants/abiogenesis/typescript/design/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- intake_source: Operator goal note `comments/jim/goals_0426` item 5: zoom in, zoom out, and fold speculation to be tested.
- library_usage: none
- library_rationale: this is algebraic requirements/design investigation, not a realization library extraction.
- governing_design:
  - `build_tenants/abiogenesis/typescript/design/GTL_3_MODULE_DESIGN.md`
  - `build_tenants/abiogenesis/typescript/design/GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md`
  - `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`
- target_truth: Zoom in, zoom out, and fold are either mapped to existing lawful GTL/ODD operations or explicitly repriced into requirements before code. No register, ledger, or intermediary tracking surface is invented outside ODD just to make deterministic bookkeeping easier.
- current_truth: Existing GTL requirements cover `substitute`, `recurse`, `fan_out`, `fan_in`, deferred synthesis, and foldback. The product-lab vocabulary of zoom in/out/fold has not yet been resolved against those surfaces.
- closure_law: this ticket closes only when there is a written decision for each term: existing law is sufficient, new requirement/design law is required, or the term is rejected as misleading.
- evaluation_criteria:
  - zoom in is tested against refinement, substitution, and decomposing one outer edge into an inner graph function
  - zoom out is tested against comparison, projection, and gap evaluation across typed nodes/assets
  - fold is tested against `fan_in`, recursion foldback, and reducer graph functions
  - asset registers and event ledgers are modeled as ODD graph-function products when needed
  - any missing capability becomes a downstream ticket with its own proof surface
- non_closure_conditions:
  - zoom/fold terms remain only informal comments
  - new interpreter heuristics are introduced before requirements exist
  - deterministic registers are created outside ODD to compensate for unclear graph semantics
  - existing GTL laws are duplicated under new names without distinction
- proof_surface:
  - strategy/design note or requirements update
  - scenario mapping to T-068 catalog
  - downstream ticket list for any required implementation

## Closure Evidence

Completed on 2026-04-26.

Realization:

- `specification/requirements/gtl/REQ-L-GTL3-HOF.md`
- `build_tenants/abiogenesis/typescript/design/GTL_ODD_ZOOM_FOLD_ALGEBRA_DECISION.md`
- `build_tenants/abiogenesis/typescript/design/README.md`

Decision:

- zoom in maps to refinement or substitution of one outer edge by an inner
  graph function while preserving the outer contract
- zoom out maps to explicit typed projection or comparison graph functions
  over replay-visible evidence
- fold maps to `fan_in`, recursion foldback, or an explicit reducer graph
  function over a vector boundary

Result:

No new interpreter law, register, ledger, or hidden tracking surface is
authorized by zoom/fold vocabulary alone. Any future missing capability must be
repriced into requirements before implementation.
