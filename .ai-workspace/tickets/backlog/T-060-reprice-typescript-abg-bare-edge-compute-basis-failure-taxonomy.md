# T-060 Reprice TypeScript ABG Bare-Edge Compute-Basis Failure Taxonomy

- id: T-060
- title: Reprice TypeScript ABG bare-edge compute-basis failure taxonomy
- type: chore
- ticket_category: substrate_semantics_cleanup
- status: backlog
- build_tenant: typescript
- goal: odd-native-sdlc-substrate-clarity
- change_intent: Make the TypeScript ABG treatment of a bare structural edge explicit enough that no runtime, test, or downstream ODD program can mistake a missing compute basis for an implicit F_D or F_P fallback.
- change_class: design_reframe
- re_entry_point: design_surface
- triaged_at: 2026-04-26
- execution_triage: deferred_until_ready
- priority: medium
- created_at: 2026-04-26
- updated_at: 2026-04-26
- dependencies:
  - T-059 completed
- affected_boundary: `specification/requirements/abg/**`, `build_tenants/abiogenesis/typescript/design/**`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- intake_source: Design discussion following T-059 on algebraic graph edges, bare structural morphisms, and whether absent compute-basis truth is a no-op, identity, fallback, or explicit fail-closed condition.
- library_usage: none
- library_rationale: this is ABG substrate semantics and runtime taxonomy cleanup, not a reusable helper extraction.
- governing_design:
  - `build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md`
  - `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md`
- target_truth: A bare graph edge is a structural morphism. Edge shape does not choose a compute regime. A resolved runtime policy may explicitly interpret the edge as `F_D`, `F_P`, or `F_H`. If no runtime interpretation basis exists, ABG fails closed rather than falling back to deterministic or probabilistic execution.
- current_truth: TypeScript ABG already fails closed when `ResolvedPolicyIdentity.defaultRegime` is missing, and T-059 proves there is no implicit fallback. The current failure is structural admission failure on `defaultRegime`; it is not yet named as a domain-visible `no_compute_basis` or equivalent taxonomy condition.
- closure_law: this ticket closes only when the design, code, and proof surfaces agree on the explicit bare-edge compute-basis law and any retained admission failure is named clearly enough for downstream ODD/SDLC consumers to reason about it without folklore.
- evaluation_criteria:
  - requirements or design text states that a bare edge is a structural morphism, not a no-op, identity, F_D fallback, or F_P fallback
  - TypeScript M03 admission or transition logic either preserves the existing fail-closed behavior with clearer naming or introduces an explicit `no_compute_basis` taxonomy
  - tests prove that missing compute basis fails closed
  - tests prove that explicit `F_D`, `F_P`, and `F_H` policy bases remain lawful interpretations of the same bare structural edge
  - downstream-facing comments or strategy notes no longer describe missing compute basis as ambiguous runtime behavior
- non_closure_conditions:
  - ABG silently defaults a missing regime to `F_D`
  - ABG silently defaults a missing regime to `F_P`
  - a bare `A->B` edge is documented as identity without an explicit identity law
  - the cleanup only changes prose while tests still rely on implicit fallback assumptions
  - the cleanup moves SDLC domain semantics into ABG substrate law
- proof_surface:
  - updated design or requirement text
  - updated M03 unit or investigation test
  - package test lane covering the bare-edge compute-basis case
  - test surface map entry

## Context

T-059 proves the current TypeScript ABG behavior for the generic one-hop graph
function:

```text
edge shape does not choose compute regime
resolved policy chooses compute regime
missing policy regime is invalid
```

The current behavior is directionally correct. The cleanup question is whether
the fail-closed condition remains an admission error on missing `defaultRegime`
or becomes an explicitly named runtime taxonomy such as `no_compute_basis`.

## Execution Triage Deferred

This ticket is backlog-only. Do not implement it until it is selected for active
work and repriced against the current M03 design and ODD/ABG method language.
