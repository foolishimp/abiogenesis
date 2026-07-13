# T-263 - Close Strict Raw Module Admission

- id: T-263
- status: completed
- phase_status: closed_after_self_review
- review_status: design_accepted_by_fh_realization_self_review_clean
- implementation_admission: completed_as_designed
- proof_status: declared_gates_green
- closed_at: 2026-07-13
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

## Design Disposition

Accepted by F_H on 2026-07-13 through the direct instruction to continue the
proposed review sequence. T-252 is closed. Realization is admitted against
`M01_M02_STRICT_RAW_MODULE_ADMISSION_BEHAVIOR_DESIGN.md` without a second
parser, schema authority, raw carrier, or hostile-local hardening expansion.

## Closure Disposition

`closed_as_strict_recursive_module_admission` on 2026-07-13. The existing
`Module` remains the prime carrier. `admitSerializedModuleText` composes the
existing duplicate-preserving I-JSON parser with `admitModule`; object admission
first admits the complete I-JSON value and then closes every M01/M02 carrier at
its owning field profile. Existing defaults, value checks, identities,
constructor duplicates, and M03 whole-program judgments remain unchanged.

T-252's canonical body digest remains
`sha256:e4555c21cdb4292b64f7f4d5a625c2a520195aa8d6e9c759498eed4bf28d0ea0`.
Its unknown root mutation now refuses; the only frontier change is removal of
`strict_raw_module_admission`.
The successor probe manifest digest is
`sha256:f3c57a89eb7b1917a7d20c387bbb4ad34d3dffc9d2175d868be99e2df899e4e1`;
it records 20 active families with zero duplicate or unowned owners.

## Closure Evidence

- Focused T-263: 9/9; T-252 body lane: 10/10; standing GTL law: 82/82.
- The maximal non-Consensus fixture proves object/text/canonical convergence,
  34 recursive unknown-field paths, literal and escaped duplicate names,
  malformed and non-I-JSON input, all serializer/profile rows, defaults,
  semantic duplicate refusal, and packed M02-barrel publication.
- Admission dependency closure reaches no ABG runtime, app, qualification,
  worker, plugin, handler, transport, event, archive, workspace, or product
  effect path.
- Host lint, strict TypeScript, full semantic, generated publication, and
  `git diff --check` pass.
- Self-review:
  `.ai-workspace/comments/codex/20260713T031841Z_SELF_REVIEW_t263_strict_raw_module_admission.md`.
