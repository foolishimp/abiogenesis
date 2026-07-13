# T-256 - Close Declared Execution Context Join

- id: T-256
- status: active
- phase_status: design_ready_for_fh_review
- review_status: pending_independent_and_fh
- implementation_status: blocked_pre_acceptance
- delivery_phase: DS-2
- change_class: design_reframe
- owner: abiogenesis
- priority: critical
- source_ticket: T-252
- design_ref: build_tenants/abiogenesis/typescript/design/M03_INSTRUCTION_PROTOCOL_BEHAVIOR_DESIGN.md
- self_review_ref: .ai-workspace/comments/codex/20260713T070822Z_SELF_REVIEW_t256_declared_execution_context_design.md
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

The reworked three-view design is self-reviewed and ready for independent and
explicit F_H review. It uses strict profiles over existing `Rule`, `Module`,
`Node`, and `AssetSurface` carriers; preserves declaration source refs through
registry event and replay truth; canonically binds non-invoking declaration
Modules in the existing runtime catalog basis; validates an exact declared C
stage without owning sequencing; and returns one discriminated request,
capability-blocked, or invalid outcome. No implementation is admitted yet.
