# T-275 - Realize Consensus Profiles And Ticket Result Projection

- id: T-275
- title: Realize attributed reviewer profiles and ticket-result projection
- type: feature
- ticket_category: ordinary
- status: active
- phase_status: design_required
- review_status: pending
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- delivery_phase: DS-4
- change_intent: >-
    Admit attributed reviewer and panel truth and project one typed Consensus
    result for a ticket without granting those carriers traversal or ticket
    mutation authority.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design M03 Consensus domain-carrier
    and projection boundary
- triaged_at: 2026-07-14
- created_at: 2026-07-14
- updated_at: 2026-07-14
- owner: abiogenesis
- build_tenant: typescript
- source_ticket: T-268
- priority: critical
- dependencies:
  - T-274 canonical Consensus public schemas
  - T-271 complete C-program interpretation
  - T-267 declared-program conservation
- authority_refs:
  - specification/requirements/product/REQ-P-CONSENSUS-005..012
  - specification/requirements/product/REQ-P-CONSENSUS-019

## Boundary

Admit explicit non-empty reviewer vectors, profile identity and configuration
digests, worker-selection/result contracts, attributed finding sets, round
policies, rulings, and terminal results. Project `ticket.consensus` and
`abg.schema.ticket-consensus-projection` from admitted result and replay truth.

The projection is result data. It cannot mutate, close, split, create, or triage
a ticket and cannot infer reviewer identity from array position, completion
order, or adapter identity.

## Exit

At least two differently attributed profiles survive native and serialized
admission; duplicate identities, stale configuration, mismatched panel,
unattributed findings, and forged ticket digest fail closed. The result
projection preserves subject, panel, policy, rounds, dissent, evidence,
lineage, result, and replay refs while producing no ticket mutation. Accept one
three-view domain design before code.
