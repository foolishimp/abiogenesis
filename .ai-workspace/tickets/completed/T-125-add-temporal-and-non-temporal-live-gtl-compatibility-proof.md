---
id: T-125
title: Add temporal and non-temporal live GTL compatibility proof
type: feature
ticket_category: proof_surface_completion
status: completed
goal: rc-next-functional-proof-for-t119-temporal-gtl
change_intent: Add live GTL graph-function proof lanes that carry the temporal declaration on the published vector and prove that the same GTL shape remains live-admissible when no temporal declaration is present.
change_class: realization_refactor
re_entry_point: realization
affected_boundary:
  - build_tenants/abiogenesis/typescript/test_env/live/
  - build_tenants/abiogenesis/typescript/package.json
priority: high
build_tenant: typescript
release_scope: 3.6.0-rc.1
triaged_at: 2026-05-07T00:21:03+10:00
created_at: 2026-05-07T00:21:03+10:00
updated_at: 2026-05-07T00:26:25+10:00
closed_at: 2026-05-07T00:26:25+10:00
owning_repo: abiogenesis
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
dependencies:
  - T-119 completed first temporal GTL algebra proof slice
  - T-120 completed first Event Calculus runtime-law slice
  - T-124 completed unit, sandbox, and first live temporal GTL proof
related_tickets:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-119-design-gtl-time-algebra-and-schedule-domain-module.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-120-declare-abg-event-calculus-runtime-law-before-temporal-algebra.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-124-prove-functional-gtl-temporal-syntax-sandbox-and-live-lanes.md
proof_commands:
  - npm run test:t125:live
  - npm run test:t119:live
  - npm run test:t119
  - npm run test:semantic
  - npm run lint:semantic
  - npm run lint:test-harness
  - git diff --check
current_evidence:
  - test:t125:live passed with 2 live graph-function tests.
  - test:t119:live passed with 3 live tests, including original provider-admission and new temporal/non-temporal GTL lanes.
  - test:t119 passed with 17 tests.
  - test:semantic passed with 428 tests.
  - lint:semantic, lint:test-harness, and git diff --check passed.
intake_source: Operator requested live tests by duplicating existing live-lane shape, adding a temporal element to GTL, and adding non-temporal live tests to prove existing GTL syntax remains compatible when temporal declarations are absent.
target_truth: Live GTL proof includes one graph-function lane whose published graph vector carries `GraphVector.declarations["abg.temporal_constraint"]` and one graph-function lane with the same non-temporal GTL shape and empty declarations. The temporal lane proves provider receipts do not authorize eligibility before ABG event admission; the non-temporal lane proves absence of the temporal declaration is lawful and normal ABG aggregate projection still opens the graph/frame.
superseded_truth: A provider-admission fixture proves temporal replay law, but no duplicated live graph-function lane proves the temporal declaration is present on the published GTL vector or that non-temporal GTL remains live-admissible when the declaration is absent.
closure_law: Close only when a live test builds both temporal and non-temporal GTL graph-function bases, archives replay evidence, proves temporal eligibility only after admitted ABG timer outcome events, proves non-temporal GTL resolves no temporal constraint without throwing, wires focused npm scripts, and focused plus semantic checks pass.
non_closure_conditions:
  - temporal proof passes a detached declaration copy while the published GTL vector has no temporal declaration
  - non-temporal proof is only a unit resolver assertion and never opens a live graph/frame
  - provider receipt files change eligibility without `timer_outcome_admitted`
  - tests reintroduce alternate temporal key spellings or traversal compatibility aliases
---

# T-125: Add Temporal And Non-Temporal Live GTL Compatibility Proof

## STDO Triage

### First Missing Layer

Realization proof.

T-124 established the canonical temporal syntax and first live admission
fixture, but the live proof still needed a duplicated graph-function lane where
the temporal element is present on the published GTL vector itself. The same
proof surface also needed a non-temporal live lane to show existing GTL graph
functions remain lawful when no `abg.temporal_constraint` declaration exists.

### Lawful Re-Entry

`realization_refactor`.

The requirement already says temporal constraints "may attach" and names one
canonical key. This ticket adds proof coverage under that requirement; it does
not add a compatibility alias or widen language law.

## Review Findings

- [x] T-119/T-124 live proof did not build a published GTL graph-function basis
  whose graph vector already carries the temporal declaration.
- [x] T-119/T-124 did not include a non-temporal live graph-function lane
  proving absence of `abg.temporal_constraint` remains admissible.

## Closure Checklist

- [x] Add a live temporal GTL graph-function lane with
  `GraphVector.declarations["abg.temporal_constraint"]` on the published vector.
- [x] Add a live non-temporal GTL graph-function lane with empty declarations.
- [x] Archive live evidence for temporal and non-temporal projections.
- [x] Wire focused npm scripts for the new live proof.
- [x] Run focused, semantic, lint, and diff checks.

## Closure Evidence

T-125 closes with `test_t125_temporal_and_non_temporal_gtl_live.test.mjs`.
The temporal lane builds a published GTL graph-function basis whose first graph
vector carries `abg.temporal_constraint`, archives provider and replay evidence,
and proves eligibility changes only after `timer_outcome_admitted`. The
non-temporal lane builds the same graph-function shape with empty declarations,
proves `tryDeriveTemporalConstraintFromGtl()` returns `null`, and proves normal
graph/frame aggregate projection remains live-admissible.

Executed proof:

- `npm run test:t125:live` -> 2 passed
- `npm run test:t119:live` -> 3 passed
- `npm run test:t119` -> 17 passed
- `npm run test:semantic` -> 428 passed
- `npm run lint:semantic` -> passed
- `npm run lint:test-harness` -> passed
- `git diff --check` -> passed
