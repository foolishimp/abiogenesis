---
id: T-122
title: Deepen GTL temporal algebra for deadline recurrence and schedule policy proof
type: feature
ticket_category: temporal_gtl_algebra_deepening
status: completed
goal: rc-next-schedule-native-gtl-time-algebra
change_intent: Extend the T-119 first temporal proof beyond `not_before` into deadline breach, recurrence, schedule-policy consequence, window, and drift proof without letting providers or runner loops become graph-transition authority.
change_class: requirement_reprice
re_entry_point: requirements
affected_boundary:
  - specification/requirements/gtl/
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - build_tenants/abiogenesis/typescript/design/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/
  - build_tenants/abiogenesis/typescript/test_env/tests/
priority: high
build_tenant: typescript
release_scope: post-T-119-first-proof
triaged_at: 2026-05-06T23:45:46+10:00
created_at: 2026-05-06T23:45:46+10:00
updated_at: 2026-05-07T01:05:01+10:00
reopened_at: 2026-05-07T00:57:24+10:00
closed_at: 2026-05-07T01:05:01+10:00
owning_repo: abiogenesis
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
dependencies:
  - T-119 first temporal algebra proof
  - T-120 first EC runtime-law slice
evidence_refs:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/active/T-119-design-gtl-time-algebra-and-schedule-domain-module.md
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/design/GTL_TIME_ALGEBRA_DERIVATION.md
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/design/SCHEDULE_DOMAIN_MODULE_DERIVATION.md
proof_commands:
  - npm run build:semantic
  - npm run test:t122
  - npm run test:semantic
intake_source: T-119 reopen review found the first proof slice sufficient for `not_before` eligibility and admitted timer outcomes, but deadline breach, recurrence coalescing, schedule-policy consequence, window events, and deeper drift proof are broader than the first slice.
target_truth: GTL temporal algebra covers the next temporal operators and compiles them into admitted ABG temporal event/fluent law. Deadline, recurrence, window, and schedule-policy consequence truth are replay-derived and policy-selected; provider receipts and wall-clock reads do not authorize traversal.
superseded_truth: The first `not_before` proof is treated as complete temporal algebra coverage, or deadline/recurrence/window semantics are added as runner-local timer behavior without requirement/design authority.
closure_law: Close only when requirements, design, TypeScript carriers, EC effects, temporal projections, and tests prove the selected temporal operators while preserving the law that time changes eligibility and ABG remains the iterator.
non_closure_conditions:
  - deadline breach behavior is hard-coded in ABG instead of selected through admitted schedule policy
  - recurrence creates fresh graph-call instances without design proof that scheduled continuation is insufficient
  - window or recurrence truth exists only as provider callback state
  - schedule/SLA drift closes or fails traversal directly instead of feeding homeostatic evaluation
  - tests prove only a happy path and omit missed, cancelled, malformed, stale, or provider-authority-negative cases
  - homeostatic projection can attribute a deadline-breach observation to a caller-supplied schedule policy/action that differs from admitted deadline-breach event truth
  - temporal projection collapses deadline-breach truth to vector indexes and refs without preserving the admitted policy/action/deadline row needed by homeostatic projection
---

# T-122: Deepen GTL Temporal Algebra For Deadline Recurrence And Schedule Policy Proof

## STDO Triage

### First Missing Layer

Requirements.

The next temporal operators likely change live GTL and ABG capability law beyond
the current first proof slice. Re-enter at requirements before adding new event
kinds or projection branches.

### Lawful Re-Entry

`requirement_reprice`.

## Closure Checklist

- [x] Select the next bounded operator family: deadline, recurrence, window, or
  schedule-policy consequence.
- [x] Update GTL/ABG requirements for the selected family.
- [x] Update the temporal IACS and schedule-domain derivation.
- [x] Declare EC effects for any new temporal events.
- [x] Add projection and homeostatic proof for the selected family.
- [x] Add provider-authority-negative tests.
- [x] Run `npm run test:t122`.
- [x] Run `npm run test:semantic`.
- [x] Preserve admitted deadline-breach `schedulePolicyRef`, `deadlineRef`, and
  `deadlineBreachAction` in the temporal projection read model.
- [x] Make homeostatic deadline observations consume admitted deadline-breach row
  truth instead of caller-supplied policy/action truth.
- [x] Add negative or multi-policy tests proving deadline-breach policy/action
  cannot be misattributed by the homeostatic projection.
- [x] Rerun focused temporal live lanes after the projection repair.

## Design Module Review

outcome: accepted

The selected bounded family is deadline breach plus schedule-policy
consequence. Recurrence and windows remain deferred. The implementation adds
optional `deadline_ref`, `deadline_breach_admitted`, EC projection of
`temporal_deadline_breached`, and homeostatic observation of the
policy-selected `deadline_breach_action`. Deadline pressure does not close,
fail, retry, or advance traversal directly.

2026-05-07 update: closure is reopened because homeostatic observations can use
caller-supplied policy/action values instead of the admitted deadline-breach
event truth. The ticket can close only after projection carries the deadline
breach row needed to make the homeostatic read model replay-derived.

2026-05-07 closure update:

- `TemporalProjection` now carries `eligibleRows` and `deadlineBreachRows`.
- `DeadlineBreachProjectionRow` preserves admitted `schedulePolicyRef`,
  `deadlineRef`, `deadlineBreachAction`, provider ref, and provider receipt ref.
- `deriveTemporalHomeostaticProjection` uses projection row truth and filters by
  matching `schedulePolicyRef` instead of stamping caller-supplied policy/action
  values onto observations.
- `test_t122_temporal_deadline_policy.test.mjs` now proves caller policy/action
  cannot misattribute deadline-breach observations.

## Closure Evidence

T-122 closes with:

- `REQ-L-GTL3-GRAPHVECTOR-011`,
  `REQ-R-ABG3-EVENTS-019`, and `REQ-R-ABG3-PROJECTION-014`
  updated for deadline-breach truth.
- `GTL_TIME_ALGEBRA_DERIVATION.md`, `GTL_TIME_ALGEBRA_IACS.md`,
  `SCHEDULE_DOMAIN_MODULE_DERIVATION.md`, `ABG_SCHEDULE_RUNTIME_DERIVATION.md`,
  and `ABG_EVENT_CALCULUS_T119_TEMPORAL_EXTENSION_CONTRACT.md` updated.
- `test_t122_temporal_deadline_policy.test.mjs` proving GTL deadline syntax,
  admitted deadline-breach projection, provider-authority-negative behavior,
  fail-closed missing deadline/action cases, and homeostatic pressure without
  graph closure.

Executed proof:

- `npm run test:t122` -> 5 passed
- `npm run test:t119` -> 17 passed
- `npm run test:semantic` -> 443 passed
- `npm run lint:semantic` -> passed
- `npm run lint:test-harness` -> passed
- `git diff --check` -> passed
