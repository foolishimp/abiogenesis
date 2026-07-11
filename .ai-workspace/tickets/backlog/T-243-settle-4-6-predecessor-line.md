# T-243 - Settle The 4.6 Predecessor Line

- id: T-243
- title: Settle the 4.6 predecessor line (reopen the T-221 fork)
- type: release
- ticket_category: release_qualification
- status: backlog
- goal: abg-5-0-full-product-delivery (campaign model, per T-242)
- owner: abiogenesis
- priority: high
- governance_scope: RELEASE_METHOD, STDO Method
- change_class: goal_reprice
- re_entry_point: specification/GOALS.md (release-line dependency)
- created_at: 2026-07-12
- source_ticket: T-242
- admission_condition: F_H ruling at the T-242 review pause selects an option; no work starts before that ruling
- dependencies:
  - T-242 course-correction ratification
  - completed T-221 (the fork being reopened)

## Intake Triage

1. Substantive: yes — it decides where substrate fixes lawfully land while the
   campaign model runs over the installed 4.6 line.
2. Boundary: release naming/qualification of the 4.6 line only. No new
   capability work; a qualification failure opens its own triaged ticket.
3. Upward walk: T-221 closed `abandoned_and_rebound` on the premise that the
   self-host would imminently supersede ABG (T-218 P4/I4 rebind). T-242 dropped
   that bootstrap, so the abandonment premise is gone ⇒ the release-line
   dependency in GOALS is the first affected layer ⇒ `goal_reprice` ⇒ affected
   span: the predecessor release identity every campaign installs ⇒ release
   scope: ABG TypeScript tenant 4.6 line only.

## The Decision (post rev 3 §8.2)

The campaign model's substrate/subject rule (installed substrate is immutable
during a campaign run; substrate defects route to the predecessor service
line) structurally requires a place for 4.6-line fixes to land, re-release,
and re-install. `rc.3-permanent` gives substrate fixes no lawful home. This is
a structural requirement of the new model, not a naming preference.

- **Option A — qualify and tap `4.6.0` final** from the exact rc.3 content
  (or a re-qualified cut), opening a serviceable `4.6.x` line for substrate
  fixes found by campaigns.
- **Option B — keep `rc.3` as the permanent predecessor** and explicitly
  declare the alternative fix-home (e.g. `4.6.0-rc.4+` continuation as the
  service line), accepting RC-lineage naming for a load-bearing floor.

Either option must leave exactly one honest, recorded disposition (T-221's own
target-truth standard).

## Closure Condition

F_H's ruling is recorded in this ticket with rationale; if Option A, a
successor release-qualification ticket is opened under RELEASE_METHOD; the
GOALS release-line dependency text is updated under residual R1's reprice.
