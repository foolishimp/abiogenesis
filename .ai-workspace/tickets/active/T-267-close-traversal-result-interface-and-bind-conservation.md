# T-267 - Close Traversal Result Interface And Bind Conservation

- id: T-267
- title: Preserve declared C programs through traversal conservation
- type: bug
- ticket_category: ordinary
- status: active
- phase_status: implementation_checkpoint_pending_independent_review
- implementation_status: implemented_checkpoint_pending_independent_review
- proof_status: self_review_verified_independent_review_pending
- review_status: independent_authority_path_review_required
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
- superseded_design_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260713T211300Z_SELF_REVIEW_t267_traversal_conservation_design.md
- superseded_design_decision_ref: >-
    .ai-workspace/comments/codex/
    20260713T211400Z_DECISION_delegated_fh_accept_t267_design.md
- design_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260714T085500Z_SELF_REVIEW_t267_whole_program_conservation_design.md
- design_decision_ref: >-
    .ai-workspace/comments/codex/
    20260714T085600Z_DECISION_delegated_fh_accept_t267_reframed_design.md
- superseded_implementation_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260713T225800Z_SELF_REVIEW_t267_traversal_conservation.md
- superseded_final_decision_ref: >-
    .ai-workspace/comments/codex/
    20260713T225900Z_DECISION_delegated_fh_accept_and_close_t267.md
- self_review_ref: >-
    .ai-workspace/comments/codex/
    20260714T095525Z_SELF_REVIEW_t267_whole_program_conservation_implementation.md
- implementation_commit: 0ce492fa
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

`implementation_checkpoint_pending_independent_review`. Commit `0ce492fa`
projects exact T-255 handoffs and selector-free T-260 fan-out bindings through
the exact T-271 plan. It conserves every authored node, every invoking locus,
the plan-derived result frontier, and the outer application relation without
synthesizing stage categories or changing T-252 body bytes.

All 35 canonical Consensus sources now close the T-267 static contract. The
census reports one remaining product gap, T-268 tenant-conformance-manifest
coverage. Every admitted T-267 outcome still records `effectsPermitted: false`,
and runtime start fails closed awaiting T-270 public routing authority.

The implementation and self-review are complete. Ticket closure is not
earned until an independent review traces the supported authority path and
accepts or remediates this checkpoint.

## Closure Evidence

- implementation checkpoint: `0ce492fa`
- full semantic suite: 1718/1718
- focused T-267 lane: 51/51; packed public API proof 1/1; GTL law 82/82
- canonical T-252 projection: 35 static traversal admissions, zero T-267
  conformance issues, unchanged body digest, and one T-268 product gap
- T-252 body digest:
  `sha256:e1344106d4e90c8883f72c6e1490742b98a839433b89855315fec4b571ca8695`
- T-252 manifest digest:
  `sha256:1899ba4d15cd734c2af504524a023566b25f8fa35d46badf15d98342289c1a38`
- source-blind T-223 suite: 70/70
- T-250 version-basis and documentation drift: 13/13
- semantic lint and `git diff --check`: passed
- DS governance: 19 tickets, 67 comment refs, 13 required fields; passed
- Mermaid design gate: 7/7 inventory/render tests; governance tests 5/5
- public-contract schemas: 82 verified
- generated publication assets: 40 verified from 1118 immutable payload files
- package dry run: 1119 files; passed
- independent authority-path review: pending; closure blocked
