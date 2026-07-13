# T-259 - Realize Generic workflow.C Runtime

- id: T-259
- status: completed
- phase_status: closed_after_self_review
- review_status: accepted_by_delegated_fh
- implementation_status: realized_and_verified
- proof_status: verified
- closed_at: 2026-07-13
- delivery_phase: DS-3
- change_class: design_reframe
- owner: abiogenesis
- priority: critical
- source_ticket: T-252
- dependency: T-258
- accepted_design: build_tenants/abiogenesis/typescript/design/M03_WORKFLOW_C_RUNTIME_BEHAVIOR_DESIGN.md
- design_decision: .ai-workspace/comments/codex/20260713T164900Z_DECISION_delegated_fh_accept_t259_design.md
- self_review_ref: .ai-workspace/comments/codex/20260713T173404Z_SELF_REVIEW_t259_workflow_c_runtime.md
- final_decision_ref: .ai-workspace/comments/codex/20260713T173553Z_DECISION_delegated_fh_accept_and_close_t259.md
- implementation_commit: f1763de

## Boundary

Realize `workflow_c_runtime`: lift one named admitted child GraphFunction across
one C-call boundary while preserving typed interfaces, lineage, frame, result,
and blocked truth.

## T-252 Census Gap Ownership

- gap_family: workflow_c_runtime

## Entry And Exit

Accept a three-view generic design before code. Recompile the unchanged T-252
body; only the five `gtl-c-unrealized-workflow-lift` frontier rows may move.
Prove a non-Consensus child-workflow fixture.

## Non-Closure

Inlining child workflow meaning, a Consensus dispatcher, name/tag inference,
or flattening the named boundary.

## Current Disposition

`closed_as_designed`. One direct `workflow.C(child)` program lowers to a closed
normalized workflow carrier and binds the exact selected Module, parent,
composition owner, GraphVector, program, child, interfaces, role, regime, and
composition. Runtime rederives the binding from the selected public catalog
entry before opening one parent C spine and invoking one internal ABG child
traversal.

Completed, blocked, and held child truth folds back as `advance`, `blocked`,
and `pending`. Malformed or throwing child traversal closes as typed runtime
failure. Child effects cannot exceed the public parent boundary, the child is
not separately published, and direct self-recursion is refused.

Mixed workflow expressions remain a typed gap. Canonical product traversal and
effects remain startup-blocked behind T-267.

## Closure Evidence

- implementation checkpoint: `f1763de`
- full semantic suite: 1651/1651
- focused T-259 lane: 43/43, packed public API proof 1/1, GTL law 82/82
- source-blind T-223 suite: 70/70
- T-252 body/probe: 11/11; body digest unchanged; seven successor gaps remain
- post-closure T-252 manifest: `sha256:f19a0615137536ceb4ff33161b0b6eea5679c9ec613d548f5e4ec546e47c9f99`; ownership joins clean
- semantic lint, changed-test lint, and diff checks: passed
- Mermaid design gate: 30 diagrams across 10 files; mutation proofs 5/5
- public-contract schemas: 82 verified
- generated publication assets: 40 verified from 1079 immutable payload files
