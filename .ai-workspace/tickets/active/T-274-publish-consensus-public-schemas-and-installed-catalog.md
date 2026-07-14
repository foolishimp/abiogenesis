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
    Publish nine canonical Consensus schema identities as projections of one
    authoritative Consensus contract family, plus the SYSTEM-owned callable
    catalog row from the admitted T-252 Module, without creating another body
    or runtime authority.
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
- prime_contraction_refs:
  - PC-001
  - PC-002
- governing_prime_design_ref: >-
    build_tenants/abiogenesis/typescript/design/adrs/
    ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md

## Boundary

Publish nine canonical Consensus schema identities as projections of one
authoritative Consensus contract family. Publish the ruling and round-outcome
vocabularies, the exact installed Module, and one SYSTEM-owned callable catalog
row for `gtl://abg/consensus/submitter-reviewer-rounds`. Native locators,
serialized assets, package files, catalog identity, and Module/body digest must
name the same admitted truth.

This ticket publishes assets. It does not interpret C programs, invoke a
reviewer, admit findings, project ticket results, write runtime events, or own
tenant-capability admission.

## Prime Compression

- `ConsensusContractFamily` is the single authoring model. It is not a tenth
  public contract identity.
- One schema document contains nine closed `$defs` and addressable projections.
  It is not one permissive object whose optional fields emulate all nine
  contracts.
- Each catalog row retains its own identity, version, authority refs, locator,
  and projection-specific digest.
- One native module may expose nine typed admitters or one closed discriminated
  dispatcher. No projection owns a parallel decoder or generator.
- `review-ruling-kind` and `consensus-round-outcome` vocabularies derive from
  the same native enum definitions used by admission and schema generation.
- Findings cannot substitute for rulings, round outcome cannot substitute for
  final result, and Consensus result cannot substitute for ticket projection.
  Every other cross-projection substitution also fails closed.
- `ABG_CONSENSUS_MODULE_DECLARATIONS` cannot remain a second authoring source
  for the callable. The SYSTEM catalog row derives from the exact admitted
  T-252 Module and outer GraphFunction.
- The accepted local design must record IACS, Promotion Test, recurrence, and
  before/after source counts under ADR-044.

## Exit

Every required schema identity and vocabulary resolves through the packed
public contract catalog from the one authoritative contract family; each
projection remains closed and cross-projection substitution fails. The
installed Module round-trips without source import; the callable row resolves
the exact T-252 GraphFunction and SYSTEM owner; malformed or digest-divergent
assets fail before catalog admission. Accept one three-view publication design
before code.
