# T-061 Investigate TypeScript ABG Minimum Typed Traversal Semantics

- id: T-061
- title: Investigate TypeScript ABG minimum typed traversal semantics
- type: spike
- ticket_category: substrate_semantics_investigation
- status: completed
- build_tenant: typescript
- goal: odd-native-sdlc-substrate-clarity
- change_intent: Add a bounded TypeScript ABG investigation proof for the minimum typed single-hop graph function so the ABG PoC ladder distinguishes typed interface authority from declared compute authority.
- change_class: design_reframe
- re_entry_point: design_surface
- triaged_at: 2026-04-26
- priority: high
- created_at: 2026-04-26
- updated_at: 2026-04-26
- completed_at: 2026-04-26
- dependencies:
  - T-059 completed
- affected_boundary: `build_tenants/abiogenesis/typescript/test_env/**`, `build_tenants/abiogenesis/typescript/package.json`
- intake_source: Design discussion on the ABG proof-of-concept traversal ladder: undefined traversal, minimum typed traversal, and minimum defined traversal.
- library_usage: none
- library_rationale: this is ABG substrate semantics proof, not a reusable tenant helper concern.
- governing_design:
  - `build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md`
  - `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md`
- target_truth: TypeScript ABG explicitly proves how a typed one-edge graph function behaves when the source and target carry schema and asset-surface type truth, while the edge carries no transform/evaluator hooks and the execution basis supplies `F_D`, `F_P`, `F_H`, or no admitted policy basis.
- closure_law: this ticket closes only when the investigation proof is runnable, records the observed substrate behavior, and proves that type/interface authority does not imply compute authority.
- evaluation_criteria:
  - `GF_TYPED_001` is constructed as one graph function over one typed `A_1->A_2` edge
  - source and target schema refs are visible as `schema://A_1` and `schema://A_2`
  - source and target asset kinds are visible as `A_1` and `A_2`
  - the edge has no operators, no evaluators, and no rule
  - `F_D`, `F_P`, and `F_H` policy bases are each exercised against the same typed carrier
  - absent policy basis is proved fail-closed at admission
  - the package exposes a bounded `test:t061` lane
- non_closure_conditions:
  - the proof adds transform or evaluator hooks to the minimum typed traversal
  - the proof treats type presence as deterministic transform authority
  - the proof treats type presence as evaluator authority
  - the proof hides the observed behavior behind helper-only assertions
- proof_surface:
  - M03 investigation test
  - package script
  - test surface map entry
  - `npm run test:t061`

## Investigation Question

What does TypeScript ABG do with the minimum typed single-hop graph function?

```text
GF_TYPED_001:
  one graph function
  one edge A_1->A_2
  source type A_1
  target type A_2
  no transform hook
  no evaluate hook
```

## Closure Evidence

Completed on 2026-04-26.

Realization:

- `test_m03_minimum_typed_traversal_investigation.test.mjs`
- `npm run test:t061`

Observed test result:

```text
tests 3
pass 3
fail 0
duration_ms 58.298416
```

Observed substrate behavior:

- `GF_TYPED_001` can be published as one graph function over one typed
  `A_1->A_2` edge.
- The source node carries `schema://A_1` and asset kind `A_1`.
- The target node carries `schema://A_2` and asset kind `A_2`.
- The edge carries no operators, no evaluators, and no rule.
- `deriveRuntimeAggregateProjection(...)` identifies vector index `0` as the
  open edge.
- `deriveIterationAdvanceDecision(...)` returns `advance_vector` for `A_1->A_2`.
- The admitted policy basis, not the type/interface truth, selects the current
  transition family:
  - `F_D` -> `fd_advance`
  - `F_P` -> `fp_dispatch`
  - `F_H` -> `fh_escalation`
- A missing policy basis fails closed before execution-basis admission because
  `defaultRegime` is required.

Result:

The current TypeScript ABG substrate treats a typed one-edge graph function as
structurally traversable when an execution policy basis is admitted. Typed
source and target loci make the interface visible, but they do not imply
transform authority, evaluator authority, identity, completion, or fallback
`F_D`/`F_P` semantics.

Follow-up:

The next ABG PoC ladder case is minimum defined traversal: typed `A_1->A_2`
with explicit transform and evaluator carriers.
