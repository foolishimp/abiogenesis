# T-269 - Clarify Declaration Construction And Bind-Stage Law

- id: T-269
- title: Clarify canonical declaration construction and internal bind-stage law
- type: bug
- ticket_category: ordinary
- status: completed
- phase_status: closed_after_independent_review_repair
- implementation_status: specification_and_proof_only
- proof_status: verified
- review_status: accepted_under_delegated_fh_after_independent_review
- delivery_phase: DS-0
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Remove the contradiction between LAWS-022 and the native canonical
    constructors while distinguishing authored C stages from ABG-internal
    admission and materialization bind stages.
- change_class: requirement_reprice
- re_entry_point: specification/requirements/gtl/REQ-L-GTL3-LAWS.md LAWS-022
- triaged_at: 2026-07-14
- created_at: 2026-07-14
- updated_at: 2026-07-14
- closed_at: 2026-07-14
- owner: abiogenesis
- build_tenant: typescript
- priority: critical
- dependencies: []
- authority_refs:
  - specification/PRODUCT.md Heart of Gold compute architecture
  - specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md
  - specification/requirements/gtl/REQ-L-GTL3-LAWS.md
  - specification/requirements/abg/REQ-R-ABG3-CCALL.md
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
- implementation_commit: 1105c391
- self_review_ref: >-
    .ai-workspace/comments/codex/
    20260714T030500Z_SELF_REVIEW_t269_open_program_law_repair.md
- decision_ref: >-
    .ai-workspace/comments/codex/
    20260714T030700Z_DECISION_delegated_fh_close_t269.md

## Boundary

Clarify that canonical declarations are admitted data at the language
boundary. Pure deterministic native constructors may assemble that data when
their output round-trips through the one canonical serializer and is admitted
under the same law as serialized input. Runtime-dependent, ambient, random,
or hidden host computation remains forbidden.

Define ABG call preparation, result admission, and materialization bindings as
interpreter-owned bind stages. They may surround an authored C stage in a
runtime plan but may not replace, rename, reorder, or count as authored C
program membership.

## Exit

PRODUCT, LAWS-022, C-ALGEBRA, and CCALL use one taxonomy. A native constructor
positive, a host-dependent declaration negative, and a whole-program
conservation negative prove the distinction. No implementation changes enter
before this requirement reprice is reviewed.

`FN-COMP-015` and `FN-COMP-021` must apply the event-sourced stage-set law to
the exact admitted open program. They may name `transform.C`, `evaluate.C`, and
`consequence.C` as lawful categories but may not require that fixed chain or
allow interpreter bind rows to replace authored stages.

## Current Disposition

`closed_after_independent_review_repair`. `FN-COMP-015/-021` now apply one
stage-set law to the exact ordered admitted program and explicitly forbid a
fixed three-stage replacement. Dedicated proof exercises the real native
constructor, canonical serializer, raw admission, digest equivalence,
ambient-input instability negative, and authored-stage/bind-stage law. No
runtime implementation changed.
