# T-264 - Close Proportional Conformance Inventory

- id: T-264
- status: completed
- phase_status: closed_after_explicit_fh
- review_status: accepted_by_fh
- implementation_admission: completed_as_designed
- proof_status: fresh_clean_gates_green
- delivery_phase: DS-1
- change_class: design_reframe
- owner: abiogenesis
- priority: high
- source_ticket: T-252
- dependency: completed T-263
- closed_at: 2026-07-13
- decision_ref: .ai-workspace/comments/codex/20260713T044119Z_DECISION_fh_accept_t252_t263_t264_corrected_checkpoint.md
- design_ref: build_tenants/abiogenesis/typescript/design/M03_PROPORTIONAL_CONFORMANCE_INVENTORY_BEHAVIOR_DESIGN.md
- correction_ref: .ai-workspace/comments/codex/20260713T041830Z_REVIEW_GATE_t252_t263_t264_authority_correction.md
- proof_ref: .ai-workspace/comments/codex/20260713T043615Z_PROOF_t252_t263_t264_clean_correction_gates.md
- closure_proof_ref: .ai-workspace/comments/codex/20260713T044638Z_PROOF_t252_t263_t264_post_acceptance_closure.md

## Boundary

Close one conformance read-model defect covering
`conformance_inventory_extraction`, `conformance_scope_proportionality`,
`effect_declaration_inventory_enforcement`, and
`plugin_handler_declaration_inventory_enforcement`. Feature presence derives
from submitted structure, mandatory declarations are inventoried exactly, and
legitimately unused families do not require invented nonzero rows.

## T-252 Census Gap Ownership

- gap_family: conformance_inventory_extraction
- gap_family: conformance_scope_proportionality
- gap_family: effect_declaration_inventory_enforcement
- gap_family: plugin_handler_declaration_inventory_enforcement

## Capability Ownership

The accepted ownership split is exact:

- T-264 projects matchable effect requirements from admitted GTL structure.
- DS-4 supplies the published, versioned tenant capability profile.
- T-255 admits that exact profile and performs effect-to-capability
  compatibility admission.

T-264 does not admit a capability profile and cannot report compatibility.
Names, URI shape, package presence, plugin refs, and tests cannot substitute for
the DS-4 profile or T-255 admission.

## Closed State

The accepted structural implementation derives explicit conformance scope,
structural feature applicability, effects, plugin selections, HOG programs,
handler bindings and configs, Jobs, and Roles. It retains real
traversal/runtime gaps and does not claim effect compatibility. The corrected
T-252 probe no longer observes the four T-264 families.

## Closure Evidence

- T-263 is accepted and closed;
- T-264 design and implementation are explicitly accepted;
- submitted-structure and complete-program scopes remain distinct and strict;
- inventory derives from admitted structure and permits lawful zero families;
- effect requirements remain exact, transitive, and distinct from capability,
  plugin, and handler identity;
- malformed or missing mandatory inventory fails closed;
- non-Consensus fixtures and full proof lanes pass; and
- the T-252 body digest remains unchanged.

## Non-Closure

Universal nonzero expectations, hard-coded Consensus exceptions, direct plugin
URIs in domain `Operator.binding`, declaration counts as runtime evidence,
compatibility without the DS-4 profile and T-255 admission, or inferred F_H
acceptance.
