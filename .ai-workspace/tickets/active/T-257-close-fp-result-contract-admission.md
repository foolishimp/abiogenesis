# T-257 - Close F_P Result-Contract Admission

- id: T-257
- status: active
- phase_status: design_rework_required
- delivery_phase: DS-2
- change_class: design_reframe
- owner: abiogenesis
- priority: critical
- source_ticket: T-252
- design_ref: build_tenants/abiogenesis/typescript/design/M03_FP_OUTPUT_ADMISSION_BEHAVIOR_DESIGN.md
- dependency: T-256

## Boundary

Close `fp_result_contract_admission`: every raw F_P reviewer, reducer,
submitter, and reassessment output reaches exactly one admitted result or typed
blocked/retry truth before any routing, materialization, or closure.

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
