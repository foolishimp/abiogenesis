# T-274 - Publish Consensus Public Schemas And Installed Catalog

- id: T-274
- title: Publish Consensus public schemas and installed catalog assets
- type: feature
- ticket_category: ordinary
- status: active
- phase_status: design_required
- review_status: pending
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- delivery_phase: DS-4
- change_intent: >-
    Publish the canonical Consensus contract assets and SYSTEM-owned callable
    catalog row from the admitted T-252 Module without creating another body or
    runtime authority.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design M02/M04 Consensus publication
    boundary
- triaged_at: 2026-07-14
- created_at: 2026-07-14
- updated_at: 2026-07-14
- owner: abiogenesis
- build_tenant: typescript
- source_ticket: T-268
- priority: critical
- dependencies:
  - completed T-252 canonical Consensus Module
  - T-270 public catalog/start router
- authority_refs:
  - specification/requirements/product/REQ-P-CONSENSUS-001..004
  - specification/requirements/product/REQ-P-CONSENSUS-007..008A
  - specification/requirements/product/REQ-P-CATALOG-009A
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md

## Boundary

Publish the nine canonical Consensus schemas, the ruling and round-outcome
vocabularies, the exact installed Module, and one SYSTEM-owned callable catalog
row for `gtl://abg/consensus/submitter-reviewer-rounds`. Native locators,
serialized assets, package files, catalog identity, and Module/body digest must
name the same admitted truth.

This ticket publishes assets. It does not interpret C programs, invoke a
reviewer, admit findings, project ticket results, write runtime events, or own
tenant-capability admission.

## Exit

Every required schema and vocabulary resolves through the packed public
contract catalog; the installed Module round-trips without source import; the
callable row resolves the exact T-252 GraphFunction and SYSTEM owner; malformed
or digest-divergent assets fail before catalog admission. Accept one three-view
publication design before code.
