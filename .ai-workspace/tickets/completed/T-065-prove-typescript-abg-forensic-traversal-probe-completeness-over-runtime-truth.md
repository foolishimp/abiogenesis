# T-065 Prove TypeScript ABG Forensic Traversal Probe Completeness Over Runtime Truth

- id: T-065
- title: Prove TypeScript ABG forensic traversal probe completeness over runtime truth
- type: qualification
- ticket_category: substrate_semantics_investigation
- status: completed
- build_tenant: typescript
- goal: research-product-lab-abg-sufficiency
- change_intent: Prove that the deterministic traversal-structure probe gives enough forensic evidence to inspect a traversal without becoming execution authority or a second runtime path.
- change_class: design_reframe
- re_entry_point: design_surface
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
  - T-060 completed
  - T-062 completed
- affected_boundary: `build_tenants/abiogenesis/typescript/design/**`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- intake_source: Operator goal note `comments/jim/goals_0426` item 1: validate ABG traversal through a forensic probe.
- library_usage: none
- library_rationale: this is ABG substrate diagnostics and proof-surface work, not a reusable helper library extraction.
- governing_design:
  - `build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md`
  - `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_STRUCTURAL_CARRIER_DIAGRAM.md`
- target_truth: A forensic traversal probe can deterministically report graph-function identity, graph-call/frame context, current vector, type loci, operator and evaluator surfaces, policy regime, transition kind, event sequence, projection basis, and explicit allowed/not-allowed claims while remaining a downstream diagnostic projection.
- current_truth: T-062 introduced `TraversalStructureProbe`, but the proof is still a first diagnostic slice over the PoC ladder rather than a complete forensic acceptance surface for ABG traversal review.
- closure_law: this ticket closes only when the probe proof demonstrates enough replay-derived evidence for a reviewer to inspect what traversal happened, why it was lawful, what it did not claim, and where runtime authority still lives.
- evaluation_criteria:
  - probe output includes graph-function, materialized graph, current vector, runtime policy, transition, event, and projection evidence
  - probe distinguishes diagnostic observation from runtime authority
  - tests prove the probe never emits events or chooses next work
  - tests prove probe claims remain downstream of `ExecutionBasis`, `IterationAdvanceDecision`, `AdvancementTransition`, and replay projection
  - test surface map records the forensic probe lane
- non_closure_conditions:
  - probe becomes a public operator command without separate M04 design
  - probe chooses traversal, stop state, or next action
  - probe reconstructs runtime truth from raw objects instead of admitted carriers and projection
  - proof only checks one happy-path transition
- proof_surface:
  - updated M03 design/IACS/diagram if the probe carrier changes
  - focused M03 unit tests
  - `npm run lint:semantic`
  - `git diff --check`

## Closure Evidence

Completed on 2026-04-26.

Realization:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/traversal_structure_probe.ts`
- `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_STRUCTURAL_CARRIER_DIAGRAM.md`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_m03_forensic_traversal_probe_completeness.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/test_surface_map.md`

Observed test result:

```text
npm run test:t065
tests 1
pass 1
fail 0
```

Result:

The probe now exposes materialized graph identity, graph-call/frame replay
identity, runtime identity, current-vector evidence, projection truth, and a
diagnostic authority declaration while remaining read-only and non-authoritative
for next work.
