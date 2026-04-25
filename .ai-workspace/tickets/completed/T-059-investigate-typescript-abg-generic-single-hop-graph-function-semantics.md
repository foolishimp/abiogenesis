# T-059 Investigate TypeScript ABG Generic Single-Hop Graph-Function Semantics

- id: T-059
- title: Investigate TypeScript ABG generic single-hop graph-function semantics
- type: spike
- ticket_category: substrate_semantics_investigation
- status: completed
- build_tenant: typescript
- goal: odd-native-sdlc-substrate-clarity
- change_intent: Add a bounded TypeScript ABG investigation proof for the minimum generic single-hop graph function so SDLC.TS design work can rely on explicit substrate behavior instead of Python tenant precedent or informal expectation.
- change_class: design_reframe
- re_entry_point: design_surface
- triaged_at: 2026-04-25
- priority: high
- created_at: 2026-04-25
- updated_at: 2026-04-25
- completed_at: 2026-04-25
- dependencies:
  - T-044 completed
- affected_boundary: `build_tenants/abiogenesis/typescript/test_env/**`, `build_tenants/abiogenesis/typescript/package.json`
- intake_source: design discussion on ODD programs, graph functions as programs, edge traversal as the compute unit, and the need to test `Fg_1` before creating `SDLC.TS`
- library_usage: none
- library_rationale: this is ABG substrate semantics proof, not a reusable tenant helper concern
- governing_design:
  - `build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md`
  - `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md`
- target_truth: TypeScript ABG explicitly proves how a generic one-edge graph function behaves when the nodes carry no domain-specific schema, the edge carries no transform/evaluator hooks, and the execution basis supplies `F_D`, `F_P`, `F_H`, or no admitted policy basis
- closure_law: this ticket closes only when the investigation proof is runnable, records the observed substrate behavior, and names whether additional ABG design or implementation work is required before SDLC.TS scaffolding relies on the result
- evaluation_criteria:
  - a generic `Fg_1` graph function with one edge and no edge-local hooks is constructed under M03 proof
  - `F_D`, `F_P`, and `F_H` policy bases are each exercised against the same generic carrier
  - absent policy basis is proved fail-closed at admission
  - the observed event and transition sequence is explicit
  - the package exposes a bounded `test:t059` lane
- non_closure_conditions:
  - the proof uses SDLC domain asset names or SDLC constructor hooks
  - installed-package sandbox behavior substitutes for M03 substrate semantics
  - the test hides the observed behavior behind helper-only assertions
- proof_surface:
  - M03 investigation test
  - package script
  - test surface map entry
  - `npm run test:t059`

## Investigation Question

What does TypeScript ABG do with the minimum single-hop graph function?

```text
Fg_1:
  one graph function
  one edge
  generic source node
  generic target node
  no transform hook
  no evaluate hook
  no domain-specific schema
```

## Closure Evidence

Completed on 2026-04-25.

Realization:

- `test_m03_generic_single_hop_graph_function_investigation.test.mjs`
- `npm run test:t059`

Observed substrate behavior:

- `Fg_1` can be published as one generic graph function over one `A -> B` edge.
- The admitted nodes can carry empty schema refs and empty asset-surface kind
  while still serving as generic structural loci.
- The edge can carry no operators, no evaluators, no rule, and no domain tags
  beyond the investigation marker.
- `deriveRuntimeAggregateProjection(...)` identifies vector index `0` as the
  open edge.
- `deriveIterationAdvanceDecision(...)` returns `advance_vector` for `A->B`.
- The admitted policy basis, not the edge-local hook set, selects the current
  transition family:
  - `F_D` -> `fd_advance`
  - `F_P` -> `fp_dispatch`
  - `F_H` -> `fh_escalation`
- A missing policy basis fails closed before execution-basis admission because
  `defaultRegime` is required.

Result:

The current TypeScript ABG substrate treats a generic one-edge graph function as
structurally traversable when an execution policy basis is admitted. It does not
require an edge-local evaluator or transform hook for `F_D` readiness. This is
now explicit proof rather than assumption.

Follow-up design question:

ODD/ABG method must decide whether "no edge-local compute basis" remains lawful
when the runtime policy supplies a default regime, or whether future ABG design
adds a distinct `no_edge_compute_basis` block. This is a method/design decision,
not an uncovered implementation failure in this ticket.
