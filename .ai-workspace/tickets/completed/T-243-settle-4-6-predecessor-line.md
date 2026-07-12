# T-243 - Settle The 4.6 Predecessor Line

- id: T-243
- title: Settle the 4.6 predecessor line
- type: release
- ticket_category: release_qualification
- status: completed
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- owner: abiogenesis
- priority: high
- governance_scope: RELEASE_METHOD, STDO Method
- change_class: goal_reprice
- re_entry_point: specification/GOALS.md (release-line dependency)
- created_at: 2026-07-12
- updated_at: 2026-07-13 (stable-first terminal disposition)
- closed_at: 2026-07-13
- source_ticket: T-242
- decision_ref: T-242 Stable-First Superseding Decision Record
- dependencies:
  - completed T-221 (the predecessor disposition being settled)
  - T-242 stable-first ruling (the changed build/release premise)

## Intake Triage

1. Substantive: yes. The earlier ticket assumed the 4.6 line would remain an
   active campaign substrate and therefore needed a serviceable fix line.
2. The stable-first ruling removes that premise. ABIogenesis 5.0 is authored
   in its mutable source project and released as the stable baseline before
   dogfooding begins; 4.6 does not build or host a 5.0 campaign.
3. The smallest affected layer remains the GOAL-035 predecessor dependency.
   No 4.6 product bytes, tag, branch, package, or release claim change.

## Terminal Decision - Option B, Predecessor Evidence Only

F_H approved the stable-first plan on 2026-07-13. That approval selects the
`rc.3-permanent` branch of the original decision, narrowed by the removed
campaign premise:

- exact `4.6.0-rc.3` remains immutable predecessor and compatibility evidence;
- no final `4.6.0` tap, `rc.4` service line, or replacement release is opened;
- 4.6 is not an installed builder or campaign substrate for ABIogenesis 5.0;
- fixes needed for the stable 5.0 product land in the mutable 5.0 source line
  and pass the 5.0 design, conformance, qualification, and release gates; and
- completed T-221 remains truthful: `abandoned_and_rebound` names the terminal
  4.6 release disposition, while this ticket removes the stale future-service
  implication introduced by the discarded campaign ladder.

This is predecessor evidence, not a product dependency for T-248. T-249 may
cite the record while removing 4.6 bootstrap and campaign requirements from
active 5.0 authority.

## Closure Condition

Satisfied by this record. Exactly one terminal disposition exists; no 4.6
release work or successor ticket is authorized; T-249 owns removal of the
stale GOAL/INTENT/PRODUCT/requirement dependencies.
