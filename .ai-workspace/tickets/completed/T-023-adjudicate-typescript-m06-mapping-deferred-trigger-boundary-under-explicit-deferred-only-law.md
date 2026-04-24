# T-023 Adjudicate TypeScript `M06` mapping-deferred trigger boundary under explicit deferred-only law

- id: T-023
- title: Adjudicate TypeScript `M06` mapping-deferred trigger boundary under explicit deferred-only law
- type: spike
- ticket_category: implementation_migration
- migration_strategy: fundamental_re_adoption
- status: completed
- goal: typescript-tenant-m06-trigger-boundary
- change_intent: Keep the deferred `M06` alternate-runtime mapping family explicit in the TypeScript backlog by adjudicating when it remains dormant, what reference evidence governs it, and what trigger would lawfully open implementation.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: low
- dependencies:
  - T-015 completed
- intake_source: shared `M06-mapping-deferred` law and the user requirement for exhaustive backlog tracking
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, `.ai-workspace/tickets/`
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-24
- library_usage: none
- library_rationale: `M06` is dormant-only in this wave; no reusable realization
  library is lawful until an alternate runtime family is intentionally
  activated
- authoritative_contract: `M06` remains deferred until an alternate runtime family is intentionally activated; before any such implementation opens, the tenant must declare one explicit derivation asset, one trigger IACS, one Mermaid structural carrier diagram, and one trigger condition that justifies moving beyond the canonical ABG engine
- governing_design:
  - build_tenants/abiogenesis/typescript/design/README.md
  - build_tenants/abiogenesis/typescript/design/M06_MAPPING_DEFERRED_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M06_MAPPING_DEFERRED_TRIGGER_IACS.md
  - build_tenants/abiogenesis/typescript/design/M06_MAPPING_DEFERRED_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/common/design/modules/M06-mapping-deferred.yml
  - build_tenants/abiogenesis/python/design/README.md
  - specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - specification_methodology/specification/standards/TICKET_METHOD.md
- constitutional_requirements:
  - specification/requirements/mapping/REQ-M-GTL3-CAPABILITY.md
- target_truth: the deferred `M06` alternate-runtime family is explicitly tracked with a declared dormancy condition and a lawful trigger boundary instead of remaining an implicit “later maybe” surface
- superseded_truth: `M06` is only noted as deferred in shared module law and tenant design, with no ticket-level trigger boundary or explicit future adjudication surface
- closure_law: this ticket closes only when `M06` is either explicitly kept dormant with declared trigger conditions and future design assets, or intentionally activated by a successor ticket that supersedes this deferred-only adjudication

## Migration Declaration

- old_truth_path: deferred `M06` remains only an implicit note in shared module law and tenant design
- new_truth_path: deferred `M06` is tracked explicitly as a dormant alternate-runtime trigger boundary with future derivation assets and activation conditions
- producers_old: shared module notes and reviewer memory
- producers_new: this ticket plus future `M06` derivation assets
- consumers_old: future ticket authors and reviewers
- consumers_new: future ticket authors and reviewers
- derived_surfaces:
  - deferred-only `M06` trigger boundary
  - future `M06` derivation pack if activation occurs

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection/read-model surfaces are listed
- [x] old truth path is removed or explicitly demoted from authority
- [x] mixed-state behavior is no longer accepted as closure evidence
- [x] tests proving mixed old/new behavior are removed or repriced
- [x] recurring realization patterns are checked against existing library/commonization surfaces
- [x] library usage is declared and the governing library or rationale is named
- [x] ticket wording, product wording, and proof claims are reconciled before closure

## Recurring Realization And Library Declaration

- library_usage: none
- library_rationale: dormant-only adjudication with no executable `M06`
  realization surface in this wave
- recurring_patterns:
  - deferred trigger boundary declaration
  - explicit dormancy record over a future module family
- commonization_decision: no reusable realization library is lawful until a
  future alternate runtime family exists

## Sideways Reference Line

- sideways_reference_line: shared `M06-mapping-deferred` module law plus Python canonical-engine ownership notes
- module_and_interface_adjudication_surface:
  - `build_tenants/common/design/modules/M06-mapping-deferred.yml`
  - `build_tenants/common/design/module_decomp.md`

## Inherited Surface Adjudication

- canonical ABG engine ownership: `carry_across`
- alternate-runtime mapping implementation: `redundant` until a runtime family other than canonical ABG is intentionally activated
- future `M06` derivation assets: `rewrite` if activation occurs

## Expected Build Output

- `M06_MAPPING_DEFERRED_DERIVATION.md`
- `M06_MAPPING_DEFERRED_TRIGGER_IACS.md`
- `M06_MAPPING_DEFERRED_STRUCTURAL_CARRIER_DIAGRAM.md`
- one explicit activation trigger statement

## Python Source Asset Inventory

- `build_tenants/abiogenesis/python/design/README.md`
- `build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/python/test_env/test_surface_map.md`

## Python Source Reconciliation Checklist

- [x] `python/design/README.md` reconciled for canonical-engine versus alternate-runtime positioning
- [x] `python/design/ABG_3_MODULE_DESIGN.md` reconciled for canonical engine ownership notes that keep `M06` dormant
- [x] `python/test_env/test_surface_map.md` checked for any live proof obligation that would accidentally activate `M06`

## Completion

It completes only when:

- the dormancy/activation boundary for `M06` is explicit
- later TypeScript backlog review can say exactly why `M06` is not active
- any future activation must supersede this ticket instead of silently opening code
- every Python source asset listed above is reconciled or explicitly marked redundant

## Completion Record

- status_at_close: completed
- reviewed_by_design_method: yes
- local_optimizations_absorbed:
  - dormant `M06` truth is now carried by one derivation, one trigger IACS, and
    one structural carrier diagram instead of scattered reviewer memory
- cross_boundary_followups:
  - none
