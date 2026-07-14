# T-267 - Close Traversal Result Interface And Bind Conservation

- id: T-267
- title: Preserve declared C programs through traversal conservation
- type: bug
- ticket_category: ordinary
- status: active
- phase_status: reopened_after_program_conservation_review
- implementation_status: design_reframe_required
- proof_status: invalidated
- review_status: external_review_rejected_closure
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Compile traversal contracts over every authored C stage and exact
    higher-order application identity while keeping ABG bind stages distinct
    from product-declared program stages.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design/
    M03_TRAVERSAL_RESULT_BIND_CONSERVATION_BEHAVIOR_DESIGN.md
- triaged_at: 2026-07-14
- created_at: 2026-07-13
- updated_at: 2026-07-14
- reopened_at: 2026-07-14
- delivery_phase: DS-3
- owner: abiogenesis
- build_tenant: typescript
- priority: critical
- source_ticket: T-252
- design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M03_TRAVERSAL_RESULT_BIND_CONSERVATION_BEHAVIOR_DESIGN.md
- design_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260713T211300Z_SELF_REVIEW_t267_traversal_conservation_design.md
- design_decision_ref: >-
    .ai-workspace/comments/codex/
    20260713T211400Z_DECISION_delegated_fh_accept_t267_design.md
- self_review_ref: >-
    .ai-workspace/comments/codex/
    20260713T225800Z_SELF_REVIEW_t267_traversal_conservation.md
- final_decision_ref: >-
    .ai-workspace/comments/codex/
    20260713T225900Z_DECISION_delegated_fh_accept_and_close_t267.md
- implementation_commit: f85bee83
- dependencies:
  - T-255 compiled execution handoff and startup fence
  - T-256 declared execution-context join
  - T-257 F_P result-contract admission
  - T-258 public F_H response and resume admission
  - T-259 workflow.C runtime atom
  - T-260 typed HOF and batch runtime
  - T-261 bounded C.retry runtime
  - T-262 typed recurse runtime

## Boundary

Close `traversal_execution_contracts` after T-255 supplies the exact compiled
GraphVector handoff: join admitted plugin result-interface truth and explicit
bind-conservation contracts to produce a statically closeable TraversalUnit
without claiming a runtime edge is already closed.

## T-252 Census Gap Ownership

- gap_family: traversal_execution_contracts
- gap_family: declared_program_conservation

## Entry And Exit

Accept a three-view design before code. Consume T-255 handoff identity,
T-257 result admission, exact target/materialization bindings, staged
authority, intent lineage, carried obligations, residual pressure, downstream
terminal pressure, admission strength, and all declared obligation-delta
dispositions. The unchanged T-252 body and a non-Consensus fixture must lose
only the final static TraversalUnit closeability diagnostics.

## Non-Closure

Minted result-interface refs, empty conservation rows, treating contract
presence as runtime closure, collapsing structural HOF work into a local C
selector, or deriving obligations and pressure from display names.

## Current Disposition

`reopened_for_design_reframe`. The former compiler selects only one
result-bearing stage, then publishes synthesized transform/evaluate/consequence
rows. It therefore proves a bind projection rather than conservation of the
whole authored C program, and it does not represent the outer typed-recurse
application identity. The following former disposition is superseded.

One generic compiler projects exact T-255 selected
handoffs or a T-260 selector-free fan-out binding into the existing
compute-composition, compute-stage, plugin-result-interface,
bind-conservation, and TraversalUnit conformance families. All 35 canonical
Consensus sources close the T-267 static contract without changing T-252 body
bytes.

The final gate keeps static closure, whole-program validity, capability, and
runtime closure separate. The canonical units remain program-blocked by 25
unrelated submitted-structure issues, and T-268 still blocks effect-bearing
handoffs until a canonical tenant-conformance manifest is published and
admitted. No result, obligation discharge, vector closure, or effect is
fabricated.

## Closure Evidence

The evidence below remains regression evidence for the local static carrier,
but it no longer proves program conservation or DS-3 closure.

- implementation checkpoint: `f85bee83`
- full semantic suite: 1688/1688
- focused T-267 lane: 50/50; packed public API proof 1/1; GTL law 82/82
- canonical T-252 projection: 35 static traversal contracts, zero T-267
  conformance issues, unchanged body digest, and one T-268 product gap
- source-blind T-223 suite: 70/70
- T-250 version-basis and documentation drift: 13/13
- semantic lint and `git diff --check`: passed
- Mermaid design gate: 42 diagrams across 14 files; 5/5 gate tests
- public-contract schemas: 82 verified
- generated publication assets: 40 verified from 1112 immutable payload files
- pre-closure ownership manifest:
  `sha256:ed420dede144c595ce639aeed4bea9967a822d79208eb28926b8a772378e5875`
- post-closure ownership manifest:
  `sha256:0d14768a8f622b2e40e10bffa81dfbe46edd41219bf0a1aa2a7767dac9b8736f`;
  zero unowned, duplicate, or active-owned-but-not-observed families
