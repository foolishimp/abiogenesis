# T-255 - Close Compiled GraphVector Execution Handoff

- id: T-255
- status: active
- phase_status: unblocked_design_rework_required
- delivery_phase: DS-2
- change_class: design_reframe
- owner: abiogenesis
- priority: critical
- source_ticket: T-252
- dependencies:
  - completed T-264 proportional conformance inventory closure
  - completed T-265 canonical GraphFunction applications and derived owner lineage
- design_ref: build_tenants/abiogenesis/typescript/design/M03_COMPILED_EXECUTION_HANDOFF_BEHAVIOR_DESIGN.md

## Boundary

Close one generic relation:

`admitted (GraphFunction, GraphVector, selected C program, effective composition selection) -> closeable TraversalUnit/ExecutionBasis`

This owner absorbs the census families
`graph_vector_program_runtime_selection`, `c_program_runtime_shape_generalization`,
`target_carrier_contract`, `edge_closure_contract`, and
`traversal_execution_contracts`, plus
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
- gap_family: traversal_execution_contracts
- gap_family: composition_owning_declaration_join

## Entry And Exit

Rework the candidate three-view design against the T-252 body and obtain F_H
acceptance before code. Runtime must consume the exact T-254 binding, preserve
arbitrary lawful C-program shape, join the effective exact
`abg.fn_composition` selection, enforce any `owningDeclarationRef` against the
T-254 binding, and derive target/closure/traversal truth
without a Consensus branch or second declaration owner. Exit requires the
unchanged T-252 body to lose only the owned handoff diagnostics and a non-
Consensus multi-stage fixture to pass.

## Non-Closure

GraphFunction-global selection, canonical-three-stage coercion, inferred target
or closure truth, composition inferred from program selection, feature-specific
runtime code, a second selector, or a second composition owner.
