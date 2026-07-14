# T-267 - Close Traversal Result Interface And Bind Conservation

- id: T-267
- title: Preserve declared C programs through traversal conservation
- type: bug
- ticket_category: ordinary
- status: active
- phase_status: repair_checkpoint_pending_independent_re_review
- implementation_status: review_findings_repaired_checkpoint_pending_re_review
- proof_status: repair_self_review_verified_independent_re_review_pending
- review_status: independent_re_review_required
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
- superseded_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260714T095525Z_SELF_REVIEW_t267_whole_program_conservation_implementation.md
- self_review_ref: >-
    .ai-workspace/comments/codex/
    20260714T114843Z_SELF_REVIEW_t267_authority_conservation_repair.md
- superseded_implementation_commit: 0ce492fa
- implementation_commit: ce354ea7
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

`repair_checkpoint_pending_independent_re_review`. Commit `ce354ea7` retains
the whole-program conservation realized at `0ce492fa` and repairs the five
findings from its independent authority-path review:

- declared execution-context identity is recomputed and joined to the current
  T-255 handoff ref and digest
- declared runtime requests join the exact selected stage-term digest
- intermediate F_P/F_H loci retain their own output contract instead of the
  graph-final target contract
- direct application identity remains separate from compiled-plan identity
- result-authority order is canonical before compilation and admission hashing

The negative matrix now covers forged and coherently resealed stale execution
contexts, intermediate result-contract substitution, caller-order
permutations, authored-node and result-frontier drift, direct-application
drift, stale stage terms, and all three canonical recurse relation digest
components.

All 35 canonical Consensus sources now close the T-267 static contract. The
census reports one remaining product gap, T-268 tenant-conformance-manifest
coverage, and records 42 rejected recurse-component mutations. Every admitted
T-267 outcome still records `effectsPermitted: false`, and runtime start fails
closed awaiting T-270 public routing authority.

The bounded repair and self-review are complete. Ticket closure is not earned
until an independent re-review accepts this checkpoint.

## Closure Evidence

- superseded implementation checkpoint: `0ce492fa`
- repair checkpoint: `ce354ea7`
- full semantic suite: 1721/1721
- focused T-267 lane: 54/54; packed public API proof 1/1; GTL law 82/82
- canonical T-252 projection: 35 static traversal admissions, zero T-267
  conformance issues, 42 rejected recurse-component mutations, unchanged body
  digest, and one T-268 product gap
- T-252 body digest:
  `sha256:e1344106d4e90c8883f72c6e1490742b98a839433b89855315fec4b571ca8695`
- T-252 manifest digest:
  `sha256:0122e8646c563fdef0c2508080afad6629aef4dc17dc255ca3a17129fc1d9681`
- source-blind T-223 suite: 70/70
- T-250 version-basis and documentation drift: 13/13
- semantic lint and `git diff --check`: passed
- DS governance: 19 tickets, 68 comment refs, 13 required fields; passed
- Mermaid design gate: 7/7 inventory/render tests; governance tests 5/5
- public-contract schemas: 82 verified
- generated publication assets: 40 verified from 1118 immutable payload files
- package dry run: 1119 files; passed
- independent repair re-review: pending; closure blocked
