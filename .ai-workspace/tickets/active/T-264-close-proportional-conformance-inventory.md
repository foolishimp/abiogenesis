# T-264 - Close Proportional Conformance Inventory

- id: T-264
- status: active
- phase_status: three_view_design_required
- delivery_phase: DS-1
- change_class: design_reframe
- owner: abiogenesis
- priority: high
- source_ticket: T-252
- dependency: T-263

## Boundary

Close one conformance read-model defect covering
`conformance_inventory_extraction`, `conformance_scope_proportionality`,
`effect_declaration_inventory_enforcement`, and
`plugin_handler_declaration_inventory_enforcement`: feature presence derives
from submitted structure, required effect/plugin/handler declarations are
inventoried exactly, and legitimately unused feature families do not require
invented nonzero inventory.

## T-252 Census Gap Ownership

- gap_family: conformance_inventory_extraction
- gap_family: conformance_scope_proportionality
- gap_family: effect_declaration_inventory_enforcement
- gap_family: plugin_handler_declaration_inventory_enforcement

## Entry And Exit

Accept a three-view conformance design before code. The T-252 root must retain
real atom/runtime gaps while losing only unsupported present-without-inventory
and universal-nonzero noise. A broader non-Consensus program must prove that
actual missing mandatory inventory still fails. Inventory must distinguish and
cross-check GraphFunction transitive effect refs, GraphFunction-hosted
`abg.plugin_selection`, exact per-program/stage/arm `abg.hog_handler_bindings`
and configs, and structurally applicable Module Jobs/Roles. Domain
`Operator.binding` is not a plugin or handler inventory source. Declaration
inventory remains separate from proof that the compiler probe executed no
runner, transport, event, archive, workspace, or product effect.

## Non-Closure

Marking present features `not_used`, weakening mandatory evidence, hard-coded
Consensus exceptions, reporting `pluginContractCount = 0` while plugin/handler
declarations exist, requiring invented nonzero Job/Role counts for direct catalog
invocation, treating declaration counts as execution evidence, accepting direct
plugin URIs in `Operator.binding`, or deleting full-root conformance to make the
census green.
