# T-260 - Realize Typed HOF And C.batch Runtime

- id: T-260
- title: Realize typed HOF and direct C.batch runtime atoms
- type: feature
- ticket_category: ordinary
- status: completed
- phase_status: closed_after_self_review
- implementation_status: realized_and_verified
- proof_status: verified
- closed_at: 2026-07-13
- delivery_phase: DS-3
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Realize exact typed fan-out, ordinal direct-root C.batch execution, and
    witnessed fan-in without collapsing structural and runtime authority.
- change_class: requirement_reprice
- owner: abiogenesis
- priority: critical
- source_ticket: T-252
- dependency: T-259
- re_entry_point: >-
    specification/requirements/gtl/REQ-L-GTL3-HOF.md
    HOF-009 through HOF-012
- triaged_at: 2026-07-14
- triage_provenance: retrospective_backfill_from_ticket_boundary_and_accepted_design
- created_at: 2026-07-13
- requirement_reprice_status: accepted_under_delegated_fh
- design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M03_TYPED_HOF_BATCH_RUNTIME_BEHAVIOR_DESIGN.md
- design_decision: >-
    .ai-workspace/comments/codex/
    20260713T180700Z_DECISION_delegated_fh_accept_t260_design.md
- self_review_ref: >-
    .ai-workspace/comments/codex/
    20260713T190200Z_SELF_REVIEW_t260_hof_batch_runtime.md
- final_decision_ref: >-
    .ai-workspace/comments/codex/
    20260713T190500Z_DECISION_delegated_fh_accept_and_close_t260.md
- review_status: accepted_by_delegated_fh
- implementation_commit: 398f254
- updated_at: 2026-07-14

## Boundary

Close one typed vector-HOF execution relation covering
`typed_fan_out_runtime`, `typed_fan_out_batch_projection`, and
`typed_fan_in_structure_and_runtime`: ordered input members become ordered
C.batch tasks/results and then an exact typed reduction.

## T-252 Census Gap Ownership

- gap_family: typed_fan_out_runtime
- gap_family: typed_fan_out_batch_projection
- gap_family: typed_fan_in_structure_and_runtime

## Entry And Exit

Accept a three-view generic design before code. Preserve member contract,
ordinal, attribution, cardinality, partial-failure blocking, and result order.
The unchanged T-252 body must lose the HOF gaps; Scenario 09 remains the required
non-Consensus proof and must exercise the same typed `fan_out`, ordered
vector-to-`C.batch` task/result projection, and typed `fan_in` reduction. The
fixture must prove each relation without Consensus vocabulary or fixed panel
cardinality.

## Non-Closure

Same-node facade, fixed reviewer cardinality, completion-order attribution,
name/tag semantics, or a Consensus panel loop.

## Current Disposition

`closed_as_designed`. Typed fan-out projects a runtime-cardinality admitted
vector into ordered serial C tasks. Every task closes one engine-owned C-call
spine, preserves member lineage and result cardinality, and contributes to an
output vector only after complete admitted success. Blocked, held, malformed,
throwing, reordered, duplicate, or foreign-basis truth cannot mint aggregate
vector truth.

Typed fan-in preserves the exact vector basis and application lineage through
one selected reducer invocation. Direct root `C.batch` uses the same resolver
without claiming vector semantics. Binding compilation and runtime rederive
the exact selected catalog entry, Module, structural relation, program,
composition, and carrier pair before effects.

Nested or mixed batch shapes remain typed gaps. Retry, recursion, canonical
startup, and traversal conservation remain owned by T-261, T-262, and T-267.

## Closure Evidence

- implementation checkpoint: `398f254`
- full semantic suite: 1660/1660
- focused T-260 lane: 58/58; packed public API proof 1/1; GTL law 82/82
- Scenario 09 runtime: 9/9 with dynamic cardinality and all-or-block truth
- inherited T-259 runtime: 9/9
- source-blind T-223 suite: 70/70
- T-250 version-basis and documentation drift: 13/13
- semantic and changed-test lint: passed
- Mermaid design gate: 33 diagrams across 11 files
- public-contract schemas: 82 verified
- generated publication assets: 40 verified from 1094 immutable payload files
- post-closure T-252 ownership manifest:
  `sha256:72351e36de5d3a3bd425d5443d6f3ef7283ac0dc5e828ff2505a82c5c50e75ab`;
  four active successor gaps, zero unowned, duplicate, or unobserved-active
  families
