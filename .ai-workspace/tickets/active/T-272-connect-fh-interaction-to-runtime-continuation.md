# T-272 - Connect F_H Interaction To Runtime Continuation

- id: T-272
- title: Connect F_H open, response, resume, and continuation consumption
- type: bug
- ticket_category: implementation_migration
- status: active
- phase_status: pc007_design_candidate
- review_status: design_review_pending
- proof_status: pending
- delivery_phase: DS-2 integration
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Replace the disconnected legacy escalation and caller-seeded interaction
    path with one engine-derived F_H lifecycle whose admitted resume is
    consumed by the exact held continuation.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design M03/M04 F_H interaction and
    continuation boundary
- triaged_at: 2026-07-14
- created_at: 2026-07-14
- updated_at: 2026-07-14
- owner: abiogenesis
- build_tenant: typescript
- source_ticket: T-258
- priority: critical
- migration_strategy: inside_out_hard_break
- library_usage: extend
- governing_library: >-
    build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/
    fh_interaction.ts
- dependencies:
  - completed T-258 carrier admission
  - active T-267
  - T-270
- authority_refs:
  - specification/INTENT.md interactive start and gaps loop
  - specification/requirements/abg/REQ-R-ABG3-CCALL.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
- prime_contraction_refs:
  - PC-007
- governing_prime_design_ref: >-
    build_tenants/abiogenesis/typescript/design/adrs/
    ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md
- design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M03_M04_FH_RUNTIME_CONTINUATION_BEHAVIOR_DESIGN.md

## Boundary

The engine derives interaction basis, graph call, frame, vector, C-call,
request, source carriers, causation, and continuation from current admitted
runtime truth. Public operations supply only actor-attributed response data.
`run.resume` admits and then consumes one exact response into the held
continuation; replay makes repeat calls idempotent and mismatched calls fail.

## Prime Contraction Input

Consume the existing admitted `ExecutionBasis`, interaction, C-call, and held
continuation carriers. Do not create a merged session controller or a second
execution-basis family. F_H open, response admission, resume admission, and
continuation consumption remain separate lifecycle transitions over the same
authority.

The local design must record its IACS, Promotion Test, recurrence result, and
before/after authority counts under ADR-044 before implementation.

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection/read-model surfaces are listed
- [ ] legacy `fh_escalated` path is removed or explicitly demoted
- [ ] mixed-state behavior is no longer accepted as closure evidence
- [ ] tests proving caller-seeded interaction authority are removed or repriced
- [x] recurring realization patterns are checked against existing library/commonization surfaces
- [x] ticket declares library usage and names the governing library or rationale
- [x] this ticket carries one TypeScript tenant lifecycle
- [ ] ticket wording, product wording, and proof claims are reconciled before closure

## Exit

A real engine-held F_H call opens the public interaction, a public response and
resume continue the same graph call, and forged basis/frame/vector/C-call or
continuation identities cannot enter through any public or production path.
