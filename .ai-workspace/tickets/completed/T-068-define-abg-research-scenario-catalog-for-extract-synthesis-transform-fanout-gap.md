# T-068 Define ABG Research Scenario Catalog For Extract Synthesis Transform Fanout Gap

- id: T-068
- title: Define ABG research scenario catalog for extract, synthesis, transform, fan-out, ambiguity, and gap evaluation
- type: feature
- ticket_category: qualification_scenario_catalog
- status: completed
- build_tenant: typescript
- goal: research-product-lab-abg-sufficiency
- change_intent: Define the reusable scenario catalog that proves ABG/GTL can support the product families we want to build from graph-function programs rather than imperative framework scaffolding.
- change_class: requirement_reprice
- re_entry_point: requirements
- triaged_at: 2026-04-26
- governance_scope: STDO Method
- governance_scope_expansion:
  - S: `SPEC_METHOD.md`
  - T: `TICKET_METHOD.md`
  - D: `DESIGN_MODULE_METHOD.md`
  - O: `ODD_METHOD.md`
- priority: high
- created_at: 2026-04-26
- updated_at: 2026-04-26
- completed_at: 2026-04-26
- dependencies:
  - T-065 completed
  - T-067 completed
- affected_boundary: `specification/requirements/product/**`, `specification/scenarios/**`, `build_tenants/abiogenesis/typescript/design/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- intake_source: Operator goal note `comments/jim/goals_0426` item 3: template or define scenario set for extract, synthesis, transform, per-item traversal, ambiguity, and gap evaluation.
- library_usage: none
- library_rationale: this defines product qualification scenarios and proof obligations, not a reusable runtime library.
- governing_design:
  - `build_tenants/abiogenesis/typescript/design/M05_QUALIFICATION_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M05_SDLC_BOOTSTRAP_LINEAGE_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M05_INSTALLED_LIVE_PORTFOLIO_DERIVATION.md`
- target_truth: The research lab has a named scenario catalog that can prove extract, synthesis, transform, fan-out/map, ambiguity harvesting, and gap evaluation as ODD-native graph-function programs over typed assets.
- current_truth: Existing M05 scenarios prove important package, live, archive, and bootstrap-lineage behavior, but the scenario set from the operator note is not yet constitutional or mapped to focused proof lanes.
- closure_law: this ticket closes only when the scenario catalog is written as requirements/scenario authority, mapped to GTL/ABG design surfaces, and split into downstream implementation/proof tickets where needed.
- evaluation_criteria:
  - extract scenario covers `Pattern/Rexp.X -> List[XItem]`
  - synthesis scenario covers `InferenceRules -> List[InferredItem]`
  - transform scenario covers `A -> A_t`
  - fan-out scenario covers every item in `A -> T -> List[A_t]`
  - ambiguity scenario covers every item in `A -> T -> List[Ambiguous[A_t]]`
  - gap evaluation scenario covers replay/projection-derived gap truth feeding triage or repricing
  - each scenario states source requirement authority, graph-function carrier, expected proof lane, and non-closure conditions
- non_closure_conditions:
  - scenarios are only examples in comments
  - scenarios depend on Python SDLC imperative behavior as product law
  - scenarios hide constructive carriers in scripts or service methods
  - ambiguity and gap behavior are asserted without replay/projection evidence
- proof_surface:
  - requirements/scenario files or equivalent active product authority
  - test surface map entries or downstream proof tickets
  - gap analysis for missing GTL/ABG capabilities

## Closure Evidence

Completed on 2026-04-26.

Realization:

- `specification/requirements/product/REQ-P-SCENARIOS.md`
- `specification/scenarios/09-research-product-lab-scenario-catalog.md`
- `specification/scenarios/README.md`
- `build_tenants/abiogenesis/typescript/design/M05_RESEARCH_PRODUCT_LAB_SCENARIO_CATALOG_DERIVATION.md`

Result:

The research product lab now has active scenario authority for extraction,
synthesis, transform, fan-out, ambiguity harvesting, and gap evaluation. The
design maps each family to GTL/ABG carriers and identifies the missing proof
families for the SDLC.TS PoC wave.
