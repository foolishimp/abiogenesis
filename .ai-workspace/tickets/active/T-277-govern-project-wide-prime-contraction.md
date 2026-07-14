# T-277 - Govern Project-Wide Prime Contraction

- id: T-277
- title: Govern ABIogenesis 5.0 project-wide Prime contraction
- type: chore
- ticket_category: implementation_migration
- status: active
- phase_status: implementation_authorized
- review_status: fh_accepted_for_implementation_independent_closure_review_pending
- proof_status: pending
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- delivery_phase: DS-2 through DS-6
- change_intent: >-
    Apply the existing Prime, Irreducible Architectural Carrier Set, and
    recurrence-extraction laws across the current ABIogenesis 5.0 product so
    later delivery consumes fewer authoritative authoring surfaces without
    collapsing distinct public identities or semantic boundaries.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design project-wide realization
    authority and cross-boundary commonization
- triaged_at: 2026-07-14
- created_at: 2026-07-14
- updated_at: 2026-07-15
- owner: abiogenesis
- build_tenant: typescript
- source_ticket: T-244
- priority: critical
- migration_strategy: inside_out_hard_break
- library_usage: none
- library_rationale: >-
    The census spans several existing semantic owners. A single governing
    library would itself be boundary inflation. Each confirmed recurrence must
    name and consume or establish its narrow tenant-local commonization
    surface in the contraction ledger.
- decision_ref: >-
    .ai-workspace/comments/codex/
    20260714T131953Z_DECISION_project_wide_prime_contraction.md
- self_review_ref: >-
    .ai-workspace/comments/codex/
    20260714T134327Z_SELF_REVIEW_t277_prime_contraction_design_packet.md
- design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260714T140354Z_DECISION_fh_authorize_t277_implementation.md
- pc011_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260714T141237Z_SELF_REVIEW_t277_pc011_prime_gate.md
- design_ref: >-
    build_tenants/abiogenesis/typescript/design/adrs/
    ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md
- design_refs:
  - build_tenants/abiogenesis/typescript/design/M04_PUBLIC_OPERATION_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md
- governing_prime_design_ref: >-
    build_tenants/abiogenesis/typescript/design/adrs/
    ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md
- census_ref: >-
    build_tenants/abiogenesis/typescript/design/
    A5_PRIME_CONTRACTION_CENSUS.md
- affected_tickets:
  - T-268
  - T-270
  - T-272
  - T-274
  - T-275
  - T-276
  - T-244 retained-feature successors
- reviewed_without_reentry:
  - T-267 unless a concrete census finding demonstrates reachable duplicate authority

## Authority

- `specification/GOALS.md` `GOAL-035` and `DS-2..DS-6`
- `specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md`
  Authority Seam Closure, Prime Law, Irreducible Architectural Carrier Set,
  Promotion Test, Recurrence Extraction, and Post-Ticket Design Review
- accepted ABIogenesis TypeScript design and ADR surfaces
- current public-contract, capability, catalog, runtime, CLI, scenario, and
  proof requirements

## Boundary

T-277 is the single governance carrier for the current-product Prime
contraction. It owns:

1. a cross-project census of duplicated authority, repeated authoring models,
   subordinate payload promotion, and authority-neutral recurrence
2. one tenant ADR defining the contraction decision algebra, three-view
   design, proof obligations, and stop conditions
3. an explicit disposition for every confirmed candidate
4. routing each implementation to its existing semantic owner
5. before-and-after authority and authoring-surface counts
6. a design-gate change that prevents recurrence without treating a
   `<<prime>>` annotation as proof
7. final cross-project verification that contractions preserve public
   identity, admission, replay, and release behavior
8. behavior-preserving tenant-local commonization and migration where the
   census assigns implementation directly to T-277

T-277 does not become a runtime controller, product authority, schema
registry, capability manifest, catalog, or release gate. It does not absorb
the semantic ownership of T-267, T-268, T-270, T-272, T-274, T-275, T-276, or
the retained-feature owners. Those tickets implement only their assigned
contractions under the common ADR.

T-277 may implement authority-neutral commonization and migrate existing
consumers when the ledger proves that no product meaning, public contract, or
effect ownership changes. Any semantic change remains with the existing owner
or stops for requirement reprice.

## Constraints

- Public identities remain distinct when consumers address, version, admit,
  persist, or pattern-match them independently.
- Distinct public identity does not imply distinct authorship, decoder,
  generator, enum, registry, or proof harness.
- A contraction must reduce truth or authoring surfaces, not merely rename or
  wrap them.
- One permissive mega-schema, controller, registry, or switch is not Prime
  contraction.
- Cross-boundary substitutions must continue to fail closed.
- Runtime behavior does not change without an accepted local three-view
  design and the owning ticket's normal proof.
- Shared-method changes are outside this ticket. This ticket may strengthen
  the ABIogenesis tenant gate using already-ratified method law.
- Historical, retired, Python, 4.6 support-line, and 5.0.1 dogfood surfaces are
  excluded unless an active 5.0 authority imports them.

## Required Dispositions

Every census row must end in exactly one state:

- `retain_prime`: independent authority is irreducible
- `derive_projection`: preserve identity while deriving from one authoring
  source
- `commonize_tenant`: extract authority-neutral recurrence into one
  tenant-local surface
- `consume_existing`: route repeated behavior through an existing Prime
  carrier or commonization surface without introducing another one
- `retire_duplicate`: remove a rival truth or authoring surface
- `migrate_authority`: move consumers to the admitted source before retiring
  the old authority
- `requirement_reprice`: stop implementation because current WHAT requires
  duplicate or contradictory truth
- `not_a_candidate`: evidence disproves the suspected recurrence

## Execution Order

1. Complete the census before selecting abstractions.
2. Accept ADR-044 before modifying runtime or public realization code.
3. Amend each affected ticket with its exact census rows and local proof.
4. Implement contractions in dependency order, keeping each ticket's semantic
   tests green.
5. Run a post-ticket recurrence review after every affected owner closes.
6. Re-run the census and project proof before T-277 closure.

## Migration Checklist

- [x] old truth and authoring surfaces are named by the census
- [x] the target is one authority plus explicit derived projections, not a
  wrapper over the old paths
- [x] producer, consumer, projection, and proof surfaces are required per row
- [x] ADR-044 is explicitly F_H-authorized for implementation
- [ ] ADR-044 and the resulting implementation receive independent closure review
- [ ] every migration row names its exact old and new path
- [ ] every existing consumer is moved before the old source is retired
- [ ] mixed old/new authority fails the row's negative proof
- [ ] generated artifacts are regenerated from the new source
- [ ] no test fixture continues to author retired truth
- [ ] each recurrence consumes or establishes the ledger-named local
  commonization surface
- [ ] all affected ticket and proof claims agree with the final tree
- [ ] post-migration census proves the before-and-after contraction counts

## Implementation Progress

- `PC-011`: implemented at `be287765`; focused positive and negative proof is
  green; independent closure review remains pending
- `PC-004` and `PC-005`: focused three-view design is F_H-authorized under the
  T-277 implementation decision; implementation is active

## Exit

T-277 closes only when:

- ADR-044 has independent design acceptance
- every in-scope boundary has a recorded Irreducible Architectural Carrier Set
- every census candidate has one evidenced disposition
- every confirmed contraction is implemented by its existing owner or is
  blocked by an explicit upstream reprice
- no active 5.0 consumer reconstructs retired authority
- the strengthened tenant design gate has positive and negative proof
- before-and-after counts demonstrate actual contraction
- all affected focused, semantic, GTL, packed-publication, governance, and
  design gates pass from the same tree
- an independent holistic review accepts the final contraction ledger

Release closure is not a substitute for these conditions, and T-277 closure
does not itself release ABIogenesis 5.0.
