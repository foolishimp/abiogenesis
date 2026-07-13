# T-256 - Close Declared Execution Context Join

- id: T-256
- status: active
- phase_status: implementation_in_progress
- review_status: fh_accepted
- implementation_status: in_progress
- delivery_phase: DS-2
- change_class: design_reframe
- owner: abiogenesis
- priority: critical
- source_ticket: T-252
- design_ref: build_tenants/abiogenesis/typescript/design/M03_INSTRUCTION_PROTOCOL_BEHAVIOR_DESIGN.md
- self_review_ref: .ai-workspace/comments/codex/20260713T070822Z_SELF_REVIEW_t256_declared_execution_context_design.md
- decision_ref: .ai-workspace/comments/codex/20260713T073149Z_DECISION_fh_accept_t256_design.md
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

The reworked three-view design received explicit F_H acceptance on 2026-07-13.
Implementation is admitted within the ticket boundary. The realization must
use strict profiles over existing `Rule`, `Module`, `Node`, and `AssetSurface`
carriers; preserve declaration source refs through registry event and replay
truth; canonically bind non-invoking declaration Modules in the existing
runtime catalog basis; validate an exact declared C stage without owning
sequencing; and return one discriminated request, capability-blocked, or
invalid outcome.
