# T-008 Tighten ABG design surface around one runtime execution law

- id: T-008
- title: Tighten ABG design surface around one runtime execution law
- type: chore
- ticket_category: ordinary
- status: completed
- goal: abg-declarative-runtime-refactor
- change_intent: Clean up the ABG Python design surface so one explicit runtime-execution law governs the controller-versus-carrier boundary and later refactors stop inheriting contradictory design assumptions.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- intake_source: runtime-law review 2026-04-20; B-027 preparation 2026-04-20; design-surface cleanup request 2026-04-20
- dependencies:
  - B-027 backlog
- affected_boundary: build_tenants/abiogenesis/python/design README and ADR layer, ABG runtime execution ownership interpretation
- triaged_at: 2026-04-20
- created_at: 2026-04-20
- updated_at: 2026-04-20

## Context

The current ABG design surface already carries the right constitutional law:

- `emit()` is the one lawful write boundary
- hidden controller memory is illegal
- runtime truth should be replay/projected from explicit carriers and events

But the Python design surface still spreads that law across multiple documents,
and `design/README.md` still contains an `App Bootstrap Assumption` section
that normalizes the very controller-owned seam the next ABG refactor is trying
to break.

That makes the design surface easier to drift than it should be.

## Required Direction

The ABG Python design surface should have one explicit runtime-execution law:

- runtime execution law is carrier-and-event owned
- controller/adapters are delivery bindings only
- projections derive from event truth
- `runtime_config` is ingress/config, not a semantic center

That law should be concentrated in one governing ADR and reflected clearly in
the design index.

## Acceptance

1. One new ADR explicitly governs runtime execution ownership.
2. `build_tenants/abiogenesis/python/design/README.md` points to that ADR as
   the primary runtime-law source for the current line.
3. The current bootstrap/orchestration wording in the design index no longer
   legitimizes controller-owned runtime semantics.
4. The cleanup is linked to the broader runtime refactor ticket so later work
   can cite the tightened design surface directly.

## Completion

Completed on 2026-04-20 by:

- adding `ADR-034` as the one governing runtime-execution law for the Python
  line
- tightening `design/README.md` so it points to `ADR-034` first
- replacing the old bootstrap/orchestration assumption with an explicit
  delivery-binding boundary
- linking the cleanup into `B-027`
