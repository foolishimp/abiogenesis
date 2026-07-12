# T-263 - Close Strict Raw Module Admission

- id: T-263
- status: active
- phase_status: three_view_design_required
- delivery_phase: DS-1
- change_class: design_reframe
- owner: abiogenesis
- priority: high
- source_ticket: T-252
- dependency: T-252

## Boundary

Close `strict_raw_module_admission`: M02 raw Module admission rejects unknown,
duplicate, malformed, or lossy fields instead of silently dropping them.

## T-252 Census Gap Ownership

- gap_family: strict_raw_module_admission

## Entry And Exit

Accept a three-view admission design before code. Native serialization must
round-trip; the T-252 unknown-field mutation must become typed refusal while the
canonical body digest remains unchanged. Cover another non-Consensus module.

## Non-Closure

Post-admission digest comparison as the only guard, permissive stripping, or
hostile-local tamper controls outside malformed authored GTL.
