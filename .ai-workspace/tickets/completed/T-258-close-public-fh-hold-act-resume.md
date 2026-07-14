# T-258 - Close Public F_H Hold, Act, And Resume

- id: T-258
- title: Close the public F_H hold, act, and resume carriers
- type: feature
- ticket_category: ordinary
- status: completed
- phase_status: closed_after_self_review
- review_status: accepted_by_delegated_fh
- implementation_status: realized_and_verified
- proof_status: verified
- closed_at: 2026-07-13
- delivery_phase: DS-2
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Publish typed F_H interaction, response, and resume carriers without
    fabricating graph success or assigning orchestration authority to callers.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design/
    M03_M04_PUBLIC_SDK_CLI_BEHAVIOR_DESIGN.md
- triaged_at: 2026-07-14
- triage_provenance: retrospective_backfill_from_ticket_boundary_and_accepted_design
- created_at: 2026-07-13
- updated_at: 2026-07-14
- owner: abiogenesis
- priority: critical
- source_ticket: T-252
- dependency: T-257
- accepted_design: build_tenants/abiogenesis/typescript/design/M03_M04_PUBLIC_SDK_CLI_BEHAVIOR_DESIGN.md
- fh_design_decision: .ai-workspace/comments/codex/20260713T151415Z_DECISION_delegated_fh_accept_t258_design.md
- self_review_ref: .ai-workspace/comments/codex/20260713T162933Z_SELF_REVIEW_t258_public_fh_interaction.md
- final_decision_ref: .ai-workspace/comments/codex/20260713T163024Z_DECISION_delegated_fh_accept_and_close_t258.md
- implementation_commit: 8e71464

## Boundary

Close `fh_pending_runtime_hold` through one public typed interaction contract:
an F_H C call holds traversal, exposes lawful act/assess/answer/escalate input,
and resumes the same continuation without graph-success fabrication or caller-
owned orchestration.

## T-252 Census Gap Ownership

- gap_family: fh_pending_runtime_hold

## Entry And Exit

Author domain, sequence, and state views against the public SDK/CLI design and
obtain F_H acceptance. The unchanged T-252 body must stop at its F_H boundary;
public act and resume must cite the pending interaction, actor, capability,
continuation, result, and replay truth. Include one non-Consensus F_H fixture.

## Non-Closure

Returning escalation as graph success, a new Consensus CLI verb, shell-owned
continuation, ambient approval subject, scheduler, watcher, or ticket mutation.

## Current Disposition

`closed_as_designed`. One generic M03 lifecycle now opens, projects, responds
to, replays, and admits nonterminal resume for an existing F_H interaction. The
five constitutional F_H response operations and `run.resume` are published
through the same M04 SDK and CLI contract, with actor, interaction, basis,
contract, evidence, capability, provenance, response, continuation, event, and
replay truth preserved.

Replay revalidates lifecycle ownership and fails closed for forged or ambiguous
interaction truth. The implementation does not consume the response as a
traversal result or fabricate graph success. T-267 retains post-resume
traversal and bind-conservation authority.

## Closure Evidence

- implementation checkpoint: `8e71464`
- full semantic suite: 1642/1642
- focused T-258 suite: 13/13, packed public API proof 1/1, GTL law 82/82
- source-blind T-223 suite: 70/70
- T-252 body/probe: 11/11; body digest unchanged; eight successor gaps remain
- semantic lint, changed-test lint, and diff checks: passed
- Mermaid design gate: 27 diagrams across 9 files; mutation proofs 5/5
- public-contract schemas: 82 verified
- generated publication assets: 40 verified from 1073 immutable payload files
