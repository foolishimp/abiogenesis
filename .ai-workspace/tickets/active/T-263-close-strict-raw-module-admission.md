# T-263 - Close Strict Raw Module Admission

- id: T-263
- status: active
- phase_status: three_view_design_authored_review_pending
- review_status: fh_review_required
- implementation_admission: blocked_pending_fh_design_acceptance_and_t252_closure
- delivery_phase: DS-1
- change_class: design_reframe
- owner: abiogenesis
- priority: high
- source_ticket: T-252
- dependency: T-252
- design_ref: build_tenants/abiogenesis/typescript/design/M01_M02_STRICT_RAW_MODULE_ADMISSION_BEHAVIOR_DESIGN.md
- review_ref: .ai-workspace/comments/codex/20260713T024512Z_REVIEW_t263_strict_raw_module_design.md
- authority_refs:
  - specification/GOALS.md DS-1
  - specification/INTENT.md malformed GTL boundary and success criterion 6
  - specification/PRODUCT.md raw admission owns serialized validity
  - specification/requirements/gtl/REQ-L-GTL3-MODULE.md
  - specification/requirements/gtl/REQ-L-GTL3-ATTRS.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md

## Boundary

Close `strict_raw_module_admission`: M02 raw Module admission rejects unknown,
duplicate, malformed, or lossy fields instead of silently dropping them.

## T-252 Census Gap Ownership

- gap_family: strict_raw_module_admission

## Entry And Exit

Review and accept the authored three-view admission design before code. Native serialization must
round-trip; the T-252 unknown-field mutation must become typed refusal while the
canonical body digest remains unchanged. Cover another non-Consensus module.

## Non-Closure

Post-admission digest comparison as the only guard, permissive stripping, or
hostile-local tamper controls outside malformed authored GTL.
