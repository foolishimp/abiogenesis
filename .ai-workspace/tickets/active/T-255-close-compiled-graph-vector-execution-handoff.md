# T-255 - Close Compiled GraphVector Execution Handoff

- id: T-255
- status: active
- phase_status: design_repaired_after_adversarial_review_pending_explicit_fh
- review_status: pending_explicit_fh_acceptance
- implementation_status: provisional_uncommitted_not_admitted
- delivery_phase: DS-2
- change_class: design_reframe
- owner: abiogenesis
- priority: critical
- source_ticket: T-252
- dependencies:
  - completed T-252 corrected construction checkpoint
  - completed T-263 strict raw Module admission
  - completed T-264 proportional conformance inventory
  - completed T-265 canonical GraphFunction applications and derived owner lineage
- design_ref: build_tenants/abiogenesis/typescript/design/M03_COMPILED_EXECUTION_HANDOFF_BEHAVIOR_DESIGN.md
- upstream_decision_ref: .ai-workspace/comments/codex/20260713T044119Z_DECISION_fh_accept_t252_t263_t264_corrected_checkpoint.md
- review_ref: .ai-workspace/comments/codex/20260713T045307Z_REVIEW_GATE_t255_compiled_handoff_design_repair.md

## Boundary

Close one generic relation:

`admitted (GraphFunction, GraphVector, selected C program, effective composition selection, target binding, optional exact capability profile) -> execution handoff | typed blocked outcome`

This owner absorbs the census families
`graph_vector_program_runtime_selection`, `c_program_runtime_shape_generalization`,
`target_carrier_contract`, `edge_closure_contract`, and
`composition_owning_declaration_join`, because they are facets of that one
handoff. The selected C program and the effective public `abg.fn_composition`
selected under existing vector-local then GraphFunction-default precedence join
at this boundary as distinct authorities:
the former selects program shape, while the latter owns regime, carrier,
assurance, and closure governance. Neither declaration may be inferred from or
used to select the other. When the composition carries
`owningDeclarationRef`, this boundary verifies it against the already-compiled
T-254 vector/program binding; authored equality alone is not enforcement.

## T-252 Census Gap Ownership

- gap_family: c_program_runtime_shape_generalization
- gap_family: graph_vector_program_runtime_selection
- gap_family: target_carrier_contract
- gap_family: edge_closure_contract
- gap_family: composition_owning_declaration_join

## Entry And Exit

The candidate three-view design has been reworked against the accepted T-252
body and now requires its own explicit F_H acceptance before implementation is
admitted. Runtime must consume the exact T-254 binding, preserve arbitrary
lawful C-program shape, join the effective exact `abg.fn_composition` selection,
enforce any `owningDeclarationRef` against the T-254 binding, and derive one
canonical target row, edge-closure contract, and execution-handoff outcome
without a Consensus branch, second validator, or second declaration owner. The
visible generic target defaults instance must be corrected to satisfy the
existing target-row law; the handoff compiler may not repair malformed defaults
silently. Exit requires the unchanged T-252 body to lose only the five owned
handoff diagnostics and non-Consensus single-stage and multi-stage fixtures to
pass.

For an effect-bearing GraphFunction, T-255 also admits an exact versioned tenant
capability profile and decides compatibility against T-264 effect-requirement
projections. DS-4 supplies the published Consensus profile. Missing profile
truth blocks an accepted effect-bearing handoff; it is not an accepted deferred
status. T-268 owns that DS-4 publication. A non-Consensus exact-profile fixture
proves the generic admission law; the 28 structurally eligible T-252 handoffs
remain typed profile blocks until T-268 lands.

Final plugin result-interface and bind-conservation closeability require
authorities not present at this boundary and are owned by T-267. The
selector-free structural HOF wrapper remains T-260 runtime work.

## Non-Closure

GraphFunction-global selection, canonical-three-stage coercion, inferred target
or closure truth, composition inferred from program selection, feature-specific
runtime code, a second selector, a second composition owner, a test-only target
row builder, silent repair of malformed target defaults, an M03 dependency on
M04 application code, or a duplicated public-contract catalog carrier/admitter.
An accepted effect-bearing handoff with no exact admitted capability profile is
also non-closure.
