# T-274 - Publish Consensus Public Schemas And Installed Catalog

- id: T-274
- title: Publish Consensus public schemas and installed catalog assets
- type: feature
- ticket_category: ordinary
- status: active
- phase_status: t274a_closed_t274b_dependency_fenced
- review_status: t274a_independently_accepted_t274b_not_started
- proof_status: t274a_exact_basis_focused_prime_lint_and_pack_green
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
  - repaired T-281 Phase A native-schema source/witness mechanism; independent re-review gates T-274A closure
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
- t274a_implementation_ref: >-
    build_tenants/abiogenesis/typescript/code/src/app/m04/public_contracts/
    consensus_contract_phase_a.ts
- t274a_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260716T162101Z_SELF_REVIEW_t274a_consensus_temp_artifact_implementation.md
- t274a_independent_review_ref: >-
    .ai-workspace/comments/codex/
    20260717T020936Z_REVIEW_t274a_exact_implementation_closure.md
- t274a_accepted_implementation_checkpoint: >-
    b05da32fc63d01eb135d47bfd8e4f724061859e3
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

For T-281 P1, T-274A contributes only the exact `ConsensusResult` source and
`TicketConsensusProjection` result schema coordinates already present in its
nine-schema family. T-281 owns the generic `project.read` request/refusal
wrapper and explicitly absent non-terminal slot. T-274A does not author that
wrapper, change its nine-schema exit, move T-275 handler/projection semantics,
or close the full `ticket_consensus` definition by itself.

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

## T-274A Implementation Status

The implementation derives nine canonical schema candidates and two
closed vocabularies from the single native Consensus family. Proof
materializes them only under a temporary root, verifies exact bytes and
digests, validates both native vocabularies, and rejects all 72 cross-kind
schema substitutions through both native and JSON admission.

The projector also rejects forged Valibot schema/action lookalikes by exact
pinned constructor identity. The private helper has no package export and no
Consensus candidate asset exists under `contracts/`.

The exact-basis independent review accepts T-274A at `b05da32f`. It reverified
the accepted design digest, the one-family/nine-projection/two-vocabulary
relation, exact source and witness binding, `11/11` focused tests, `6/6`
Consensus Prime regression, focused lint, and a pack dry-run containing no
candidate Consensus schema or vocabulary asset. The earlier full semantic
proof remains `1771/1771`; the independent review deliberately did not rerun
that suite across unrelated concurrent T-281 changes. T-274A is closed.
T-274 remains active and T-274B remains dependency-fenced.
