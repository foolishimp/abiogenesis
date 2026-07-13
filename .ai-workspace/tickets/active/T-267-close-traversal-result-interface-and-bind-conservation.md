# T-267 - Close Traversal Result Interface And Bind Conservation

- id: T-267
- status: active
- phase_status: design_accepted_implementation_authorized
- review_status: accepted_by_delegated_fh
- delivery_phase: DS-3
- change_class: design_reframe
- owner: abiogenesis
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
- dependencies:
  - T-255 compiled execution handoff and startup fence
  - T-256 declared execution-context join
  - T-257 F_P result-contract admission
  - T-258 public F_H response and resume admission
  - T-259 workflow.C runtime atom
  - T-260 typed HOF and batch runtime
  - T-261 bounded C.retry runtime
  - T-262 typed recurse runtime
- updated_at: 2026-07-13

## Boundary

Close `traversal_execution_contracts` after T-255 supplies the exact compiled
GraphVector handoff: join admitted plugin result-interface truth and explicit
bind-conservation contracts to produce a statically closeable TraversalUnit
without claiming a runtime edge is already closed.

## T-252 Census Gap Ownership

- gap_family: traversal_execution_contracts

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
