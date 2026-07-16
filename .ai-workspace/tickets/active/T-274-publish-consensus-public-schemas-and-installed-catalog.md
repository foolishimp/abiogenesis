# T-274 - Publish Consensus Public Schemas And Installed Catalog

- id: T-274
- title: Publish Consensus public schemas and installed catalog assets
- type: feature
- ticket_category: ordinary
- status: active
- phase_status: reconciled_design_accepted_implementation_pending
- review_status: fh_accepted_for_implementation_independent_closure_review_pending
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
- updated_at: 2026-07-16
- owner: abiogenesis
- build_tenant: typescript
- source_ticket: T-268
- priority: critical
- dependencies:
  - completed T-252 canonical Consensus Module
  - ratified T-278 Ontology `run.invoke` and `project.read` definitions
- downstream_dependencies:
  - T-270 runtime realization consumes the admitted contribution/catalog truth
    but does not gate T-274 publication design or implementation
- authority_refs:
  - specification/requirements/product/REQ-P-CONSENSUS-001..004
  - specification/requirements/product/REQ-P-CONSENSUS-007..008A
  - specification/requirements/product/REQ-P-CATALOG-009A
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - specification/PRODUCT.md Public Operator Contract
  - build_tenants/abiogenesis/typescript/design/ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md
- prime_contraction_refs:
  - PC-001
  - PC-002
- governing_prime_design_ref: >-
    build_tenants/abiogenesis/typescript/design/adrs/
    ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md
- design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M02_M04_CONSENSUS_PUBLICATION_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md
- pre_ontology_design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260714T154500Z_DECISION_fh_authorize_remaining_t277_refactor.md
- design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260716T062342Z_DECISION_fh_accept_t274_reconciled_publication_design.md
- design_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260716T062342Z_SELF_REVIEW_t274_reconciled_publication_design.md
- prime_migration_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260714T154835Z_SELF_REVIEW_t277_pc001_pc003_consensus_realization.md

## Boundary

Publish nine canonical Consensus schema identities as projections of one
authoritative Consensus contract family. AF-24 publishes their public-contract
catalog rows, the ruling and round-outcome vocabularies, and one SYSTEM-owned
GraphFunction contribution declaration for
`gtl://abg/consensus/submitter-reviewer-rounds`. GTL/M02 owns the exact Module
and GraphFunction declaration truth; T-274 packages and verifies its installed
round trip. AF-08 separately admits the contribution into the installed
`Catalog`. Native locators, serialized assets, package files, contribution
identity, admitted catalog identity, and Module/GraphFunction/body digests must
name the same truth without merging the public-contract and
contribution-catalog authorities.

This ticket publishes assets. It does not interpret C programs, invoke a
reviewer, admit findings, project ticket results, write runtime events, or own
tenant-capability admission.

The published Module and GraphFunction are declarations, not a `GtlProgram` or
execution authority. The callable may execute only as a member of a separately
admitted `GtlProgram` through `abg.operation.run.invoke`; consumers observe its
catalog/result/replay truth through `abg.operation.project.read`. T-274 adds no
Consensus operation and no compatibility alias for `catalog.invoke`.

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
  for the callable. The SYSTEM contribution declaration derives from the exact
  admitted T-252 Module and outer GraphFunction; AF-08 derives installed catalog
  admission from that declaration.
- The accepted local design must record IACS, Promotion Test, recurrence, and
  before/after source counts under ADR-044.

## Exit

Every required schema identity and vocabulary resolves through the packed
public contract catalog from the one authoritative contract family; each
projection remains closed and cross-projection substitution fails. The
installed Module round-trips without source import; the contribution declaration
and admitted catalog row resolve the exact T-252 GraphFunction and SYSTEM owner;
malformed or digest-divergent assets fail before their owning admission. Accept
one three-view publication design before code.

## Prime Migration Status

The native contract family and callable-source contraction are realized under
T-277. Nine schema assets, embedded resource locators, installed publication,
and packed catalog admission remain T-274 work. This ticket is not closed by
the migration checkpoint.
