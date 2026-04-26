# T-069 Model Idempotent Typed Graph Instances And Project Asset Instances

- id: T-069
- title: Model idempotent typed graph instances and project asset instances
- type: spike
- ticket_category: substrate_semantics_investigation
- status: completed
- build_tenant: typescript
- goal: research-product-lab-abg-sufficiency
- change_intent: Separate graph template, graph-function program, graph-call execution instance, and downstream project asset instance semantics so repeated graph-function execution is idempotent and auditable.
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
  - T-063 completed
  - T-064 completed
  - T-068 completed
- affected_boundary: `specification/requirements/gtl/**`, `specification/requirements/abg/**`, `build_tenants/abiogenesis/typescript/design/**`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/**`, `build_tenants/abiogenesis/typescript/code/src/qualification/m05/**`
- intake_source: Operator goal note `comments/jim/goals_0426` item 4: idempotent instantiated typed nodes and the Graph Function vs Graph distinction.
- library_usage: none
- library_rationale: this is substrate/product semantics clarification and may create downstream implementation tickets after the model is ratified.
- governing_design:
  - `build_tenants/abiogenesis/typescript/design/GTL_3_MODULE_DESIGN.md`
  - `build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md`
  - `build_tenants/abiogenesis/typescript/design/M05_SDLC_BOOTSTRAP_LINEAGE_DERIVATION.md`
- target_truth: A `Graph` is topology/template truth, a `GraphFunction` is the published callable program, ABG graph-call/work-key/materialization truth is the execution instance, and a downstream `Project` is a domain asset instance with lineage over source inputs and traversal evidence.
- current_truth: GTL/ABG already distinguish `Graph`, `GraphFunction`, `GraphCall`, frame, work key, and materialization truth, and M05 has a first `SdlcProject` asset proof. The product-lab idempotency model is not yet expressed as one clear requirement/design surface.
- closure_law: this ticket closes only when the live requirements/design surfaces make repeated graph-function execution over graph/project instances explainable, idempotent, and traceable without moving project-domain semantics into ABG.
- evaluation_criteria:
  - requirements or design distinguish `Graph`, `GraphFunction`, `GraphCall`, materialization, work key, and domain asset instance
  - repeated runs from one source graph to multiple target assets are lawful and traceable
  - project asset instance identity is domain-owned and not ABG-owned
  - idempotency means same admitted input and same declared target basis can be replayed and compared
  - lineage answers why an asset element exists and which source/traversal produced it
- non_closure_conditions:
  - `Graph` and `GraphFunction` are used interchangeably
  - project instance semantics are embedded in ABG runtime carriers
  - idempotency is assumed from file paths or mutable workspace state
  - new register surfaces are invented outside ODD/GTL/ABG without repricing
- proof_surface:
  - requirements/design clarification
  - downstream implementation/proof tickets if carrier changes are needed
  - focused M05 or M03 test proving repeated graph-function instance behavior

## Closure Evidence

Completed on 2026-04-26.

Realization:

- `specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md`
- `specification/requirements/abg/REQ-R-ABG3-GRAPHCALL.md`
- `specification/requirements/abg/REQ-R-ABG3-RUN.md`
- `build_tenants/abiogenesis/typescript/design/M03_GRAPH_APPLICATION_INSTANCE_SEMANTICS_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_m03_graph_application_instance_semantics.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/test_surface_map.md`

Observed test result:

```text
npm run test:t069
tests 1
pass 1
fail 0
```

Result:

Graph function and materialized graph identity remain stable across repeated
runs, distinct run identities create distinct graph-call and frame identities,
and replay of the same admitted run/work basis reproduces the same runtime
instance identity. Downstream project asset semantics remain downstream-owned.
