# T-263 - Close Strict Raw Module Admission

- id: T-263
- status: active
- phase_status: implementation_landed_pending_explicit_review
- review_status: design_sound_fh_acceptance_pending
- implementation_admission: provisional_after_invalid_gate
- proof_status: fresh_clean_gates_green_pending_explicit_fh
- delivery_phase: DS-1
- change_class: design_reframe
- owner: abiogenesis
- priority: high
- source_ticket: T-252
- dependency: T-252 explicit acceptance
- design_ref: build_tenants/abiogenesis/typescript/design/M01_M02_STRICT_RAW_MODULE_ADMISSION_BEHAVIOR_DESIGN.md
- correction_ref: .ai-workspace/comments/codex/20260713T041830Z_REVIEW_GATE_t252_t263_t264_authority_correction.md
- proof_ref: .ai-workspace/comments/codex/20260713T043615Z_PROOF_t252_t263_t264_clean_correction_gates.md

## Boundary

Close `strict_raw_module_admission`: raw M02 Module admission rejects unknown,
duplicate, malformed, or lossy fields instead of silently dropping them.

## T-252 Census Gap Ownership

- gap_family: strict_raw_module_admission

## Current State

The three-view design is sound. A provisional implementation landed after the
invalid `ebe0eea` gate and is preserved for review. It composes the existing
duplicate-preserving I-JSON parser with recursive M01/M02 admission, keeps
`Module` as the prime carrier, and adds no rival schema or parser authority.

The corrected T-252 probe no longer observes this gap. Because the ticket is
active pending explicit acceptance, the family appears as
`activeOwnedButNotObserved`, not as a fabricated compiler gap.

## Exit

- explicit F_H acceptance of the design and landed implementation;
- canonical Module object/text/serialization convergence;
- recursive refusal of unknown, duplicate, malformed, and non-I-JSON input;
- T-252 unknown-root mutation refusal with unchanged body digest;
- non-Consensus maximal fixture coverage;
- focused, full semantic, packed/publication, version-basis, strict TypeScript,
  and diff gates pass.

## Non-Closure

Permissive stripping, post-admission digest comparison as the only guard, a
second parser/schema authority, hostile-local hardening expansion, or inferred
acceptance from a continuation instruction.
