# T-270 - Bind Public Catalog Invocation To Execution Authority

- id: T-270
- title: Bind public catalog invocation to compiled execution authority
- type: bug
- ticket_category: implementation_migration
- status: active
- delivery_phase: DS-2 integration
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Replace profile-aware catalog invocation without execution carriers with
    one M03-owned derivation and public start route that consumes exact
    declared execution, instruction, traversal, and catalog authority.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design public invocation and compiled
    execution handoff boundary
- triaged_at: 2026-07-14
- created_at: 2026-07-14
- updated_at: 2026-07-14
- owner: abiogenesis
- build_tenant: typescript
- source_ticket: T-255
- priority: critical
- migration_strategy: inside_out_hard_break
- library_usage: extend
- governing_library: >-
    build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/
    catalog_invocation.ts
- dependencies:
  - completed T-252
  - active T-267
  - T-271
- authority_refs:
  - specification/GOALS.md DS-2
  - specification/INTENT.md public invocation spine
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
- prime_contraction_refs:
  - PC-007
- governing_prime_design_ref: >-
    build_tenants/abiogenesis/typescript/design/adrs/
    ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md

## Boundary

The selected admitted catalog entry is the only source of Module,
GraphFunction, interface, execution-profile, and capability identity. M03
derives the execution request and traversal admission; M04 transports the
accepted carrier. Profile-aware entries fail before engine start when any
required carrier is missing or stale. Legacy entries without an execution
profile remain explicitly separate compatibility behavior.

## Prime Contraction Input

Consume the existing admitted `ExecutionBasis`, declared execution request,
traversal admission, and selected catalog binding. Do not introduce a public
invocation session carrier, reconstructed capability profile, or second start
router. Catalog invocation remains a distinct transition from F_H response and
resume; PC-007 commonizes authority consumption, not semantic behavior.

The local design must record its IACS, Promotion Test, recurrence result, and
before/after authority counts under ADR-044 before implementation.

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection/read-model surfaces are listed
- [ ] old profile-aware path is removed or explicitly demoted from authority
- [ ] mixed-state behavior is no longer accepted as closure evidence
- [ ] tests proving mixed old/new behavior are removed or repriced
- [x] recurring realization patterns are checked against existing library/commonization surfaces
- [x] ticket declares library usage and names the governing library or rationale
- [x] this ticket carries one TypeScript tenant lifecycle
- [ ] ticket wording, product wording, and proof claims are reconciled before closure

## Exit

One packed existing, alternate, and temporary-workspace invocation reaches the
same router. Removing any execution carrier fails closed; no SDK, CLI, or
adapter can invoke a profile-aware entry through the old partial path.
