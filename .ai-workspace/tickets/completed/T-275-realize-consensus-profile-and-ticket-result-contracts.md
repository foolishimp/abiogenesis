# T-275 - Realize Consensus Profiles And Ticket Result Projection

> **Current disposition (2026-07-25):** `completed_at_7722806d`.
> T-275 delivered the closed profile, panel, policy, finding, ruling, result, and
> ticket-projection semantics used by the current direct-GTL Consensus path.
> The historical X body below remains donor evidence only.

- id: T-275
- title: Realize attributed reviewer profiles and ticket-result projection
- type: feature
- ticket_category: implementation_migration
- status: completed
- implementation_hold: completed
- implementation_hold_ref: GOAL-035 ABG5-S05 and M05 Section 13
- implementation_hold_effect: >-
    implement only Product-owned Consensus domain admission, reduction,
    attribution, result, and read-only ticket projection through existing GTL,
    HoG, ABG, replay, and public boundaries
- phase_status: s05_complete
- review_status: proxy_accepted
- proof_status: s05_green
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- delivery_phase: M5_frontier_4
- change_intent: >-
    Admit attributed reviewer and panel truth, reduce bounded rounds, and
    project one replay-derived typed Consensus result for a ticket without
    granting those carriers traversal or ticket mutation authority.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design/
    M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md Section 13
- triaged_at: 2026-07-14
- created_at: 2026-07-14
- updated_at: 2026-07-25
- owner: abiogenesis
- build_tenant: typescript
- source_ticket: T-268
- priority: critical
- dependencies:
  - ratified T-278 Ontology accepted semantic candidate 1ca39b2b5c536be6d16eecfb30d8310e798853232ae7c03f71ac655a7f97bf40 and current projection digest bcbacd4a4b4dd3b5b6db2a3ad281c92bf76a7a889da38562d5b6301e85764615
  - accepted T-270 run.invoke authority design
  - accepted T-274 one-family public-schema and installed-catalog design
  - completed T-256 declared execution-context admission
  - completed T-257 declared F_P result admission
  - completed T-267 declared-program conservation
  - completed T-271 complete C-program interpretation
- implementation_fence:
  - completed T-281 P1 exact private 19-operation definition-family milestone
  - independently accepted T-270 public-router and AF-15/runtime-authority milestone
  - independently accepted T-274B one-family contract and catalog contribution milestone
- downstream_dependencies:
  - T-272 supplies lawful F_H continuation before a held interaction can yield a final result
  - T-268 aggregates final Consensus capability and conformance coverage
  - T-276 proves packed installed projection across the three workspace applications
- authority_refs:
  - specification/PRODUCT.md Public Operator Contract and bounded Consensus product
  - specification/requirements/product/REQ-P-CONSENSUS-004..012
  - specification/requirements/product/REQ-P-CONSENSUS-015
  - specification/requirements/product/REQ-P-CONSENSUS-019
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS-006
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS-008..010
  - build_tenants/abiogenesis/typescript/design/ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md
- prime_contraction_refs:
  - PC-001
  - PC-003
- governing_prime_design_ref: >-
    build_tenants/abiogenesis/typescript/design/adrs/
    ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md
- design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M03_CONSENSUS_DOMAIN_FAMILY_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md
- superseded_accepted_design_digest: 16b10ddc1af12b5f51e6e391bc387202df3c0792d593bc7a0033d26aa84c7435
- superseded_constructability_repair_design_digest: 45cb539849b511b15fd9302c0a76db80370ec6f2b713254954379461f76cbf9f
- accepted_constructability_repair_design_digest: d6480a9224df2d1268da80d687fedf75a2d60dcc36ba81e6256e89535f30985a
- constructability_repair_review_and_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260718T094902Z_REVIEW_DECISION_t275_constructability_repair.md
- superseded_independent_design_review_ref: >-
    .ai-workspace/comments/codex/
    20260716T075100Z_REVIEW_t275_reconciled_consensus_domain_design.md
- superseded_design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260716T075100Z_DECISION_fh_accept_t275_reconciled_consensus_domain_design.md
- pre_ontology_design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260714T154500Z_DECISION_fh_authorize_remaining_t277_refactor.md
- accepted_t270_design_ref: >-
    .ai-workspace/comments/codex/
    20260716T062747Z_DECISION_fh_accept_t270_reconciled_run_invoke_design.md
- accepted_t270_design_digest: 71076f364d06a9725b5482ee0cdc84e64d29a4c18447a5ab4c41e1b62ba7f430
- accepted_t274_design_ref: >-
    .ai-workspace/comments/codex/
    20260716T062342Z_DECISION_fh_accept_t274_reconciled_publication_design.md
- accepted_t274_design_digest: 930c26a2fa5e144ebe0d0ba1aa639fd2aaf531b51e4b5921df434860718313e8

## S05 Completion

Implementation commit `7722806d9f0c385a0cb009cc3885389c7156f731`
admits exact Consensus subject, attributed profiles, panel, policy, findings,
round state, rulings, result, escalation decision, and read-only ticket
projection semantics. F_P reviewer output remains candidate data until ABG
evidence and result admission; deterministic reduction owns only declared
agreement, dispute, budget, and envelope rules. No ticket mutation or
Consensus-specific runtime path exists.

The bounded proxy decision
`20260725T013500Z_DECISION_proxy_accept_s05_and_advance_s06.md` accepts the
exact candidate. T-275 is complete.
- prime_migration_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260714T154835Z_SELF_REVIEW_t277_pc001_pc003_consensus_realization.md

## Boundary

Extend the already-realized closed `ConsensusContractFamily` with two bounded
relations. First, bind the exact subject contract/ref/digest, submitting actor,
optional ticket source, invocation input/authority, immutable workspace,
admitted GTL program and narrowed catalog view, panel, round policy, and ordered
reviewer profiles. Derive invocation-local reviewer assignments for T-256; ABG
then owns C-call, actor-invocation, effect, and event lineage. T-257 admits only
the raw result envelope. One generic selected-schema bridge admits the domain
payload through the same family decoder used by the GTL node and proves a non-
Consensus fixture. Second, admit the canonical `ConsensusResult` against its
runtime output authority and replay, then derive the ticket projection through
the `ticket_consensus` variant of `abg.operation.project.read`.

T-275 validates and projects. It does not select a reviewer or worker, create a
schema family, add a public operation, invoke traversal, write an event, persist
a read model, or mutate, close, split, create, or triage a ticket. Reviewer
identity derives from the declared panel/profile relation and never from worker
completion order, adapter position, or array coincidence.

T-275 owns one SYSTEM stdlib contribution for exactly ten canonical
Consensus-specific F_D leaf `Operator.binding` refs, Prime-contracted to six
native actions, plus the exact `round-closed` and `next-round` domain bindings.
T-270 remains the sole generic structural router and interpreter. The
`review-panel`, `reduce-panel-facts`, and `bounded-rounds` wrapper refs never
enter the domain implementation registry.

## Prime Contraction Input

Consume the accepted T-274 `ConsensusContractFamily` as the one native public
authoring model. The prior T-277 migration already replaced open
`ConsensusCarrier<Kind>` payload authority with one closed discriminated family.
T-275 may extend relational admission and graph-private assignment projections;
it shall not author another field roster, decoder family, schema identity,
operation identity, event kind, store, or ticket authority.

The local design must record its IACS, Promotion Test, recurrence result,
public/private classification, and before/after authoring counts under ADR-044.

## Exit

At least two differently attributed profiles survive native, serialized,
relational, execution-context, and result admission. Empty or duplicate panels,
stale configuration, panel/policy/workspace mismatch, assignment drift,
unattributed findings, malformed generic wire envelopes, selected-schema
failure, foreign C-call/actor invocation or replay truth, forged subject/actor/
ticket/projection authority, and cross-basis result reuse fail closed before
projection.

The ordinary `project.read` result preserves subject, panel, policy, round,
findings, rulings, dissent, evidence, lineage, result, replay, and ticket refs
while emitting no event and producing no ticket mutation. A held F_H interaction
is not fabricated into a final `ConsensusResult`; T-272 must first admit its
lawful continuation. Accept the reconciled three-view design before code.

The constructability gate additionally requires:

- complete T-256 slot coverage for reviewer, reducer, submitter, and F_H
  graph-private bindings;
- one real graph-private semantic route-decision contract and no evaluator refs
  to nonexistent assessment fields;
- `project-result` input conservation for every public result field;
- graph-private result candidates without `resultRef` or `replayRef`, with both
  identities supplied only by ABG output/replay projection;
- T-272-owned interaction identity and same-intent/program/frame/locus F_H
  re-entry; and
- exact recurse termination/foldback bindings with cumulative-truth
  conservation.

Design review may close while its implementation fence is open. No T-275 code,
schema, generated asset, or public projection may land until T-281 P1 and the
T-270/T-274B private milestones are independently accepted on the same target
basis. T-275 supplies the
pure `ticket_consensus` projection contribution required by T-281 P2; it does
not introduce a Consensus-specific handler or wait for that publication
milestone.

## Prime Migration Status

The open `ConsensusCarrier<Kind>` family is retired in favor of one closed,
schema-authored domain family. Local exact decoding exists. Relational
profile/panel/policy/configuration binding, T-256 assignment conservation,
T-257 raw-envelope conservation, generic selected-schema domain admission,
assignment/C-call/actor-invocation attribution, replay-backed
`ConsensusResult` admission, pure ticket projection, and the full negative
matrix remain T-275 work. This ticket is not closed by the migration checkpoint
or the reconciled design alone.

## Hard Break

- no `ticket.consensus` public operation; it is a closed `project.read`
  projection kind;
- no `catalog.invoke`, `read.result`, `read.replay`, feature-specific CLI verb,
  or compatibility alias;
- no caller-authored result, replay, projection ref, or projection digest;
- no profile-selection service, reviewer loop, result store, ticket writer, or
  Consensus-specific runtime branch; and
- no final result projection from a held or incomplete F_H state;
- no Consensus domain implementation for the three structural wrapper refs;
- no pre-authored F_H interaction, output-result, or replay identity; and
- no alternate termination, foldback, route, or evaluator-field compatibility
  path.
