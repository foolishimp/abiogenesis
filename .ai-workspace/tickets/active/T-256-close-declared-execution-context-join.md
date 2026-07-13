# T-256 - Close Declared Execution Context Join

- id: T-256
- status: active
- phase_status: repair_review_gate
- review_status: ready_for_independent_re_review
- implementation_status: repair_complete
- proof_status: repair_gates_green
- delivery_phase: DS-2
- change_class: design_reframe
- owner: abiogenesis
- priority: critical
- source_ticket: T-252
- design_ref: build_tenants/abiogenesis/typescript/design/M03_INSTRUCTION_PROTOCOL_BEHAVIOR_DESIGN.md
- self_review_ref: .ai-workspace/comments/codex/20260713T093255Z_SELF_REVIEW_t256_implementation.md
- decision_ref: .ai-workspace/comments/codex/20260713T083400Z_DECISION_fh_accept_t256_repaired_design.md
- invalid_decision_ref: .ai-workspace/comments/codex/20260713T073149Z_DECISION_fh_accept_t256_design.md
- rejection_ref: .ai-workspace/comments/codex/20260713T074427Z_REVIEW_GATE_t256_design_rejected.md
- implementation_rejection_ref: .ai-workspace/comments/codex/20260713T101501Z_REVIEW_GATE_t256_canonical_consumer_rejected.md
- repair_self_review_ref: .ai-workspace/comments/codex/20260713T104058Z_SELF_REVIEW_t256_canonical_consumer_repair.md
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

The human authority accepted the repaired design and authorized implementation
on 2026-07-13. Independent implementation review then rejected the first
checkpoint because the unchanged T-252 consumer could not traverse the join,
instruction derivation was caller-authored, prompt contracts leaked into result
truth, and the census did not invoke the join. The bounded repair is complete
and independently self-reviewed; closure remains unearned until external
re-review accepts the repaired checkpoint. T-257 remains blocked. T-267 and
T-268 retain their existing ownership.
