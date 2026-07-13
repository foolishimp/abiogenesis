# T-255 - Close Compiled GraphVector Execution Handoff

- id: T-255
- status: active
- phase_status: design_repaired_round_2_pending_explicit_fh
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
- previous_review_ref: .ai-workspace/comments/codex/20260713T045307Z_REVIEW_GATE_t255_compiled_handoff_design_repair.md
- review_ref: .ai-workspace/comments/codex/20260713T052506Z_REVIEW_GATE_t255_round2_authority_correction.md
- correction_proof_ref: .ai-workspace/comments/codex/20260713T053229Z_PROOF_t255_round2_t252_authority_repair.md
- self_review_ref: .ai-workspace/comments/codex/20260713T053506Z_SELF_REVIEW_t255_round2_authority_correction.md

## Boundary

Close one generic relation:

`admitted (GraphFunction, GraphVector, selected C program, effective composition selection, target binding, canonical tenant-conformance manifest or absence) -> published startup-blocked handoff | typed blocked outcome`

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

For an effect-bearing GraphFunction, M04 admits the canonical versioned
`abg.schema.tenant-conformance-manifest` before M03 is called. T-255 receives
only that admitted carrier or explicit absence, derives a basis-preserving
capability-coverage projection, and decides compatibility against T-264
effect-requirement projections. DS-4 supplies ABG 5.0 manifest coverage
including Consensus. Missing manifest truth blocks publication; it is not a
deferred status. T-268 owns that DS-4 publication. A non-Consensus canonical
manifest fixture proves the generic admission law; the 28 structurally eligible
T-252 handoffs remain typed manifest blocks until T-268 lands.

Final plugin result-interface and bind-conservation closeability require
authorities not present at this boundary and are owned by T-267. Every handoff
published by T-255 remains startup-blocked before traversal, worker/plugin
invocation, archive writes, successful assessment, or closure truth until
T-267 supplies that authority. The selector-free structural HOF wrapper remains
T-260 runtime work.

## Non-Closure

GraphFunction-global selection, canonical-three-stage coercion, inferred target
or closure truth, composition inferred from program selection, feature-specific
runtime code, a second selector, a second composition owner, a test-only target
row builder, silent repair of malformed target defaults, an M03 dependency on
M04 application code, a duplicated public-contract catalog carrier/admitter, a
second tenant profile or manifest authority, or a capability projection that
does not preserve the admitted manifest basis. Raw manifest input reaching M03,
an effect-bearing handoff published without exact admitted manifest coverage,
or any published handoff traversing or causing effects before T-267 closes the
`TraversalUnit` is also non-closure.
