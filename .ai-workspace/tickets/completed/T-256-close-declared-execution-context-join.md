# T-256 - Close Declared Execution Context Join

- id: T-256
- status: completed
- phase_status: closed_after_proportional_repair
- review_status: accepted_by_fh
- implementation_status: realized_and_verified
- proof_status: verified
- closed_at: 2026-07-13
- delivery_phase: DS-2
- change_class: design_reframe
- owner: abiogenesis
- priority: critical
- source_ticket: T-252
- design_ref: build_tenants/abiogenesis/typescript/design/M03_INSTRUCTION_PROTOCOL_BEHAVIOR_DESIGN.md
- self_review_ref: .ai-workspace/comments/codex/20260713T131436Z_SELF_REVIEW_t256_proportional_authority_repair.md
- decision_ref: .ai-workspace/comments/codex/20260713T083400Z_DECISION_fh_accept_t256_repaired_design.md
- invalid_decision_ref: .ai-workspace/comments/codex/20260713T073149Z_DECISION_fh_accept_t256_design.md
- rejection_ref: .ai-workspace/comments/codex/20260713T074427Z_REVIEW_GATE_t256_design_rejected.md
- implementation_rejection_ref: .ai-workspace/comments/codex/20260713T101501Z_REVIEW_GATE_t256_canonical_consumer_rejected.md
- repair_self_review_ref: .ai-workspace/comments/codex/20260713T104058Z_SELF_REVIEW_t256_canonical_consumer_repair.md
- final_repair_self_review_ref: .ai-workspace/comments/codex/20260713T131436Z_SELF_REVIEW_t256_proportional_authority_repair.md
- final_decision_ref: .ai-workspace/comments/codex/20260713T133957Z_DECISION_fh_accept_and_close_t256.md
- implementation_commit: 5577a31
- dependency: T-255

## Boundary

Close one generic request-construction relation from typed carrier fields and
declared instruction/result/capability refs into the selected F_P/F_H execution
request. This owns `carrier_field_indirection` and
`declared_instruction_protocol_join`.

## Entry And Exit

Rework the blocked three-view design and obtain F_H acceptance. Use an admitted
generic field-path/ref contract, not a Consensus URI convention. GTL owns the
instruction/protocol declarations; ABG resolves them into one request under the
selected composition. The unchanged T-252 body and one non-Consensus request
fixture must compile through the join.

## T-252 Census Gap Ownership

- gap_family: carrier_field_indirection
- gap_family: declared_instruction_protocol_join

## Non-Closure

Prompt text authored in M03, ambient agent defaults, caller identity as worker
selection, local field-ref conventions, or concrete backend/transport in GTL.

## Current Disposition

`closed_as_designed`. The human authority accepted the proportional repair at
`5577a31` on 2026-07-13. The join preserves exact selected catalog authority,
derives relevance, compression, and work class from admitted declarations and
composition truth, rejects dependency-disambiguation without candidate or gap
truth, and conserves the exact selected result contract through plan, envelope,
manifest, and F_P request. T-257 is unblocked. T-267 still owns traversal
conservation and T-268 still owns tenant-conformance admission.

## Closure Evidence

- implementation checkpoint: `5577a31`
- full semantic suite: 1,618/1,618
- focused T-256 suite: 55/55, packed API 1/1, GTL law 82/82
- shared instruction compiler: 70/70
- T-252 body/probe: 11/11; body digest unchanged
- semantic lint and diff checks: passed
- Mermaid design gate: 27 diagrams across 9 files
- public-contract schemas: 63 verified
- generated publication assets: 33 verified from 1,041 immutable payload files
