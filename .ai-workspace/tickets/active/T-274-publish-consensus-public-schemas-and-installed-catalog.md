# T-274 - Publish Consensus Public Schemas And Installed Catalog

- id: T-274
- title: Publish Consensus public schemas and installed catalog assets
- type: feature
- ticket_category: ordinary
- status: active
- phase_status: phase_split_design_accepted_t274a_waits_t281_phase_a
- review_status: fh_accepted_t274a_dependency_gated_t274b_fenced
- proof_status: t274a_implementation_pending_dependency
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- delivery_phase: DS-4
- change_intent: >-
    First generate and verify nine canonical Consensus schema assets plus two
    vocabularies from one authoritative Consensus contract family and the one
    accepted native projector; later publish the SYSTEM-owned callable catalog
    row from the admitted T-252 Module without creating another body, authoring
    source, or runtime authority.
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
  - accepted T-281 Phase A native-schema mechanism for T-274A implementation
- downstream_dependencies:
  - T-281 P1 and T-270 gate T-274B installed publication, not T-274A schema projection
  - T-275 consumes the verified T-274B public schema identities
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
- superseded_reconciled_design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260716T062342Z_DECISION_fh_accept_t274_reconciled_publication_design.md
- design_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260716T062342Z_SELF_REVIEW_t274_reconciled_publication_design.md
- repaired_phase_split_candidate_digest: >-
    a370f6c894e08f966714d5b5541c9e02091b19be6768d5f4383773287cbc600e
- accepted_phase_split_gate_complete_design_digest: >-
    7be2f753a08e65b63d49266695780747c5e8fc620c88af68414d7a11cd51b867
- repaired_phase_split_review_ref: >-
    .ai-workspace/comments/codex/
    20260716T105629Z_REVIEW_t274_phase_split_design.md
- repaired_phase_split_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260716T105629Z_DECISION_fh_accept_t274_phase_split_design.md
- design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260716T105629Z_DECISION_fh_accept_t274_phase_split_design.md
- prime_migration_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260714T154835Z_SELF_REVIEW_t277_pc001_pc003_consensus_realization.md

## Boundary

Publish nine canonical Consensus schema identities as projections of one
authoritative Consensus contract family through two separately gated phases.

T-274A projects nine closed physical schema assets and the ruling and
round-outcome vocabularies through the exact private native mechanism accepted
under T-281 Phase A. It proves native/schema parity, distinct public identity,
closed substitution, and deterministic bytes. It exports no operation, Module,
callable, catalog row, committed product asset, install claim, or runtime
authority; Phase A proof output is temp-only.

T-274B follows the accepted public-operation P1 and T-270 boundaries. AF-24
publishes the verified schema/vocabulary rows and one SYSTEM-owned
GraphFunction contribution declaration for
`gtl://abg/consensus/submitter-reviewer-rounds`. GTL/M02 owns the exact Module
and GraphFunction declaration truth; T-274 packages and verifies its installed
round trip. AF-08 separately admits the contribution into the installed
`Catalog`. Native locators, serialized assets, package files, contribution
identity, admitted catalog identity, and Module/GraphFunction/body digests must
name the same truth without merging the public-contract and
contribution-catalog authorities.

This ticket projects and later publishes assets. It does not interpret C programs, invoke a
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
- Nine physical schema assets derive from the one closed family. Physical-file
  separation conforms to the existing file-level locator and verifier; it does
  not create nine authors or nine schema-definition sources.
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

T-274A closes when all nine physical schema assets and two vocabularies derive
from the one authoritative family through the accepted projector, remain
closed and independently addressable, reject cross-projection substitution,
and reproduce exact bytes and digests without any public or installed claim.
Phase A generation is temp-only and leaves no candidate asset in the package.

T-274B closes when those verified assets resolve through the packed public
contract catalog, the installed Module round-trips without source import, and
the contribution declaration and admitted catalog row resolve the exact T-252
GraphFunction and SYSTEM owner. Malformed or digest-divergent assets fail
before their owning admission. Each phase requires independent review.

## Prime Migration Status

The native contract family and callable-source contraction are realized under
T-277. T-274A owns nine generated schema assets, two derived vocabularies, and
their parity proofs after T-281 Phase A. T-274B owns public catalog rows,
callable contribution, installed publication, and packed admission after the
P1 and T-270 prerequisites. This ticket is not closed by either
design checkpoint or by T-274A alone.
