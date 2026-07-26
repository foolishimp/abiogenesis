# T-257 - Close F_P Result-Contract Admission

- id: T-257
- title: Close F_P result-contract admission
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
    Admit raw F_P reviewer, reducer, and submitter outputs against the exact
    selected result contract before routing, materialization, or closure.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design/
    M03_FP_OUTPUT_ADMISSION_BEHAVIOR_DESIGN.md
- triaged_at: 2026-07-14
- triage_provenance: retrospective_backfill_from_ticket_boundary_and_accepted_design
- created_at: 2026-07-13
- updated_at: 2026-07-14
- owner: abiogenesis
- priority: critical
- source_ticket: T-252
- design_ref: build_tenants/abiogenesis/typescript/design/M03_FP_OUTPUT_ADMISSION_BEHAVIOR_DESIGN.md
- design_decision_ref: .ai-workspace/comments/codex/20260713T135216Z_DECISION_delegated_fh_accept_t257_design.md
- self_review_ref: .ai-workspace/comments/codex/20260713T145740Z_SELF_REVIEW_t257_fp_result_contract_admission.md
- final_decision_ref: .ai-workspace/comments/codex/20260713T145826Z_DECISION_delegated_fh_accept_and_close_t257.md
- implementation_commit: 4d66222
- dependency: T-256

## Boundary

Close `fp_result_contract_admission`: every raw F_P reviewer, reducer, and
submitter output reaches exactly one admitted result or typed blocked/retry
truth before any routing, materialization, or closure. Public M04 result
reassessment remains outside this ticket.

## T-252 Census Gap Ownership

- gap_family: fp_result_contract_admission

## Entry And Exit

Resolve the blocked design's G1-G5 findings and obtain F_H acceptance. Pin
malformed, incomplete, contradictory, unattributed, nonretryable, and exhausted
outputs on the actual raw-to-close path. The same admission atom must serve a
non-Consensus F_P fixture. T-252 may change compiler output, never body bytes.

## Non-Closure

Parser-only tests, accepted-by-omission output, a local Consensus schema path,
or hardening against trusted in-process callers beyond malformed external F_P
data.

## Current Disposition

`closed_as_designed`. One public admission atom now serves the two standard
external F_P result profiles, conserves the selected T-256 result-contract
identity, rejects undeclared or malformed output, and supplies admitted or
typed blocked/retry truth before routing and closure. The canonical T-252 body
is unchanged and its derived census no longer reports
`fp_result_contract_admission`.

Trusted in-process typed plugins retain the ticket's explicit compatibility
boundary. Universal tenant-declared result-schema execution remains open under
`REQ-R-ABG3-PAYLOAD-028`; T-267 and T-268 retain traversal conservation and
tenant-conformance ownership.

## Closure Evidence

- implementation checkpoint: `4d66222`
- full semantic suite: 1,628/1,628
- focused T-257 suite: 56/56, packed public API proof 1/1, GTL law 82/82
- source-blind T-223 suite: 70/70
- T-252 body/probe: 11/11; body digest unchanged; nine later gaps remain
- semantic lint, changed-test lint, executable syntax, and diff checks: passed
- Mermaid design gate: 27 diagrams across 9 files; mutation proofs 5/5
- public-contract schemas: 63 verified
- generated publication assets: 33 verified from 1,044 immutable payload files

## 2026-07-19 Conformance Re-entry

The T-270/T-271 steel-thread conformance audit found one category error beyond
the original T-257 closure boundary: the attached transform response admitted a
`ResultArtifact` evidence proposal but did not carry the graph target `B` as a
distinct candidate. Assessment-shaped artifact content must not be promoted to
target truth.

The accepted bounded correction is:

- hard-replace `attached_result_artifact` with
  `attached_transform_result`; no alias or compatibility branch survives;
- keep one generic F_P result-admission family with two closed projections;
- require `target_value` on the transform projection and forbid it on the
  evaluator projection;
- project transform output into an evidence-only `ResultArtifact` candidate and
  a distinct target-value candidate;
- treat a normalized evaluated `FpEvaluationOutcome` as the evaluator-locus
  target candidate while a blocked evaluator outcome carries no target;
- leave exact target-schema, target-binding, and generic target-carrier
  admission to T-270 over the accepted T-255/T-256 execution handoff.

This entry does not rewrite the 2026-07-13 closure evidence. That evidence
remains the historical proof of the narrower standard wire-admission slice.
The hard-break profile correction and target-admission integration are current
T-270 realization work; they must earn new focused, packed, and steel-thread
proof before product closure.
