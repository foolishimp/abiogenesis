# T-234 - Realize Installed Two-Stage Self-Host

- id: T-234
- title: Realize installed two-stage self-host and freeze R5
- type: feature
- ticket_category: ordinary
- status: backlog
- goal: abg-5-0-full-product-delivery
- phase: DS-5
- priority: high
- change_intent: >-
    Execute the approved two-stage installed bootstrap over frozen inputs,
    prove equivalence, and freeze C1 as the exact R5 source candidate.
- change_class: realization_refactor
- re_entry_point: build_tenants/abiogenesis/typescript/code
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- source_ticket: T-233
- build_tenant: typescript
- admission_condition: T-233 is completed and its design is current
- affected_boundary: M03 installed self-build execution/equivalence and immutable R5 source-candidate freeze
- dependencies:
  - T-233
  - T-239
- authority_refs:
  - specification/requirements/abg/REQ-R-ABG3-SELFHOSTING.md
  - specification/requirements/product/REQ-P-QUAL.md
  - .ai-workspace/tickets/backlog/T-233-design-installed-two-stage-self-host.md

## Target Truth

`I4 + B5 + S5 -> C1`; fresh installed I1 plus the exact same B5 and S5
produces C2; both converge and the declared equivalence passes. Exact C1 bytes
then freeze as R5, with identities and evidence available to DS-6 and DS-7.

## Required Work

1. Freeze and record exact I4, B5, and S5 inputs.
2. Run stage one from I4 through public installed contracts and install C1 as I1.
3. Prove I1 source isolation and B5 5.0 compatibility admission.
4. Run stage two from I1 with unchanged B5/S5.
5. Compare C1/C2 through the approved equivalence contract.
6. Freeze R5 as exact C1 and publish the immutable candidate identity record.

## Closure Law

Close only when both installed stages converge, source isolation passes,
mechanical equivalence is green, C1 is frozen as R5, and phase-end review finds
no post-DS-4 code drift or hidden compiler/controller substrate.

## Non-Closure Conditions

- Either stage imports mutable ABG source or private build logic.
- The B5/S5 identities differ between stages.
- A red or incomplete equivalence comparison is waived.
- R5 is changed after freeze without reopening DS-5.

## Proof Surface

- exact stage input/output manifests
- clean installed I4 and I1 execution archives
- source-isolation assertions
- C1/C2 equivalence report
- immutable R5 identity/checksum record
- phase-end code review against T-233, T-218, PRODUCT, and SELFHOSTING
