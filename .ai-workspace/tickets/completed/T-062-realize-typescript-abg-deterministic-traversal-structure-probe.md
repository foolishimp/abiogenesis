# T-062 Realize TypeScript ABG Deterministic Traversal Structure Probe

- id: T-062
- title: Realize TypeScript ABG deterministic traversal structure probe
- type: feature
- ticket_category: substrate_semantics_investigation
- status: completed
- build_tenant: typescript
- goal: odd-native-sdlc-substrate-clarity
- change_intent: Add one reusable TypeScript M03 F_D probe that reports traversal structure, declared authority, replay projection, transition truth, event kinds, and allowed/not-allowed claims for deterministic exploration of ABG graph-function invocations.
- change_class: design_reframe
- re_entry_point: design_surface
- triaged_at: 2026-04-26
- priority: high
- created_at: 2026-04-26
- updated_at: 2026-04-26
- completed_at: 2026-04-26
- dependencies:
  - T-059 completed
  - T-061 completed
- affected_boundary: `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/**`, `build_tenants/abiogenesis/typescript/test_env/**`, `build_tenants/abiogenesis/typescript/package.json`
- intake_source: Design discussion on ABG visibility, event sourcing, event algebra, and the need for a deterministic forensics probe to explore traversal authority before SDLC.TS adds domain structure.
- library_usage: none
- library_rationale: this is an M03 runtime/projection carrier, not a shared helper extraction.
- governing_design:
  - `build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md`
  - `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_STRUCTURAL_CARRIER_DIAGRAM.md`
- target_truth: TypeScript ABG exposes a deterministic traversal-structure probe that can inspect one execution basis without mutating runtime truth, while separating graph shape, typed interface, declared compute carriers, runtime policy interpretation, event kinds, and forbidden overclaims.
- closure_law: this ticket closes only when the probe is reusable from the M03 public export surface, proves the three current PoC ladder rungs, and remains a pure derivation over admitted basis and runtime events rather than a second runtime path.
- evaluation_criteria:
  - the active M03 IACS classifies `TraversalStructureProbe` as downstream diagnostic projection, not prime runtime authority
  - the active M03 structural carrier diagram shows `TraversalStructureProbe` and its subordinate payloads
  - `deriveTraversalStructureProbe(...)` is exported from the M03 contracts surface
  - the probe reports graph function, job, current vector, source/target node schema and asset-surface truth
  - the probe reports operators, evaluators, rule, declared regimes, policy regime, transition kind, iteration event kinds, and transition event kinds
  - the probe classifies undefined traversal, minimum typed traversal, and minimum defined traversal distinctly
  - the probe emits allowed and not-allowed claim lists so deterministic exploration can detect overclaiming
  - the package exposes a bounded `test:t062` lane
- non_closure_conditions:
  - the probe reads files, emits events, or mutates runtime truth
  - the probe collapses typed interface authority into compute authority
  - the probe treats declared operators/evaluators as proof of completion
  - the probe becomes an operator-facing public command before product policy adopts it
- proof_surface:
  - M03 traversal-structure probe source
  - M03 unit proof
  - package script
  - test surface map entry
  - `npm run test:t062`

## Closure Evidence

Completed on 2026-04-26.

Realization:

- `design/M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`
- `design/M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md`
- `design/M03_GRAPH_FUNCTION_ITERATION_STRUCTURAL_CARRIER_DIAGRAM.md`
- `code/src/abg/m03/contracts/traversal_structure_probe.ts`
- `code/src/abg/m03/contracts/index.ts`
- `test_m03_traversal_structure_probe_unit.test.mjs`
- `npm run test:t062`

Observed test result:

```text
tests 3
pass 3
fail 0
duration_ms 58.030916
```

Observed probe behavior:

- The active M03 IACS classifies `TraversalStructureProbe` as a downstream
  diagnostic projection over existing basis/projection/decision/transition
  truth, not a third prime runtime authority.
- The structural carrier diagram shows `TraversalStructureProbe` and its
  subordinate payloads under the M03 graph-function iteration boundary.
- Undefined traversal reports `undefined_structural_morphism`.
- Minimum typed traversal reports `typed_structural_morphism`.
- Minimum defined traversal reports `defined_constructive_morphism`.
- The probe reports typed loci, edge shape, operator/evaluator surfaces,
  declared regimes, policy regime, transition kind, and replay-derived event
  kinds.
- The probe reports forbidden overclaims such as identity, domain completion,
  runtime-regime fallback, domain transform when no operator exists, and domain
  evaluation when no evaluator exists.

Result:

ABG now has a reusable deterministic exploration surface for traversal
structure. Scenario tests no longer need to hand-roll their own forensic view
of graph shape, runtime policy, event algebra, and overclaim boundaries.
