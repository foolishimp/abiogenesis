---
id: T-124
title: Prove functional GTL temporal syntax with sandbox and live lanes
type: feature
ticket_category: proof_surface_completion
status: completed
goal: rc-next-functional-proof-for-t112-t119-t120
change_intent: Close the proof gap where T-119/T-120 were green at unit level but did not prove executable GTL temporal syntax, sandbox behavior, live provider-admission behavior, or the repaired T-112 canonical traversal strategy syntax in sandbox/live-facing fixtures.
change_class: requirement_reprice
re_entry_point: requirements
affected_boundary:
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - build_tenants/abiogenesis/typescript/design/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/
  - build_tenants/abiogenesis/typescript/test_env/tests/
  - build_tenants/abiogenesis/typescript/test_env/sandbox/
  - build_tenants/abiogenesis/typescript/test_env/live/
priority: high
build_tenant: typescript
release_scope: prerequisite-for-next-rc-candidate
triaged_at: 2026-05-07T00:03:24+10:00
created_at: 2026-05-07T00:03:24+10:00
updated_at: 2026-05-07T00:07:09+10:00
closed_at: 2026-05-07T00:07:09+10:00
owning_repo: abiogenesis
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
dependencies:
  - T-112 completed per-edge traversal strategy through canonical GTL config
  - T-119 completed first temporal algebra proof slice
  - T-120 completed first Event Calculus runtime-law slice
related_tickets:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-112-carry-per-edge-traversal-strategy-through-gtl-config.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-119-design-gtl-time-algebra-and-schedule-domain-module.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-120-declare-abg-event-calculus-runtime-law-before-temporal-algebra.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/backlog/T-121-complete-abg-event-calculus-projection-parity-beyond-first-lifecycle-slice.md
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/backlog/T-122-deepen-gtl-temporal-algebra-for-deadline-recurrence-and-schedule-policy-proof.md
proof_commands:
  - npm run build:semantic
  - npm run lint:semantic
  - npm run lint:test-harness
  - npm run test:t112
  - npm run test:t119
  - npm run test:t120
  - npm run test:semantic
  - git diff --check
current_evidence:
  - test:t112 passed with 22 tests, including sandbox proof for canonical mini data-mapper traversal strategy syntax.
  - test:t119 passed with 15 tests, including GTL syntax, sandbox replay, live provider-admission, and dependent T-120 EC proof.
  - test:t120 passed with 4 tests.
  - test:semantic passed with 428 tests.
  - lint:semantic, lint:test-harness, and git diff --check passed.
intake_source: Operator requested completeness code review and proof that new features are tested functionally, including sandbox and live lanes, a full GTL syntax suite, and tickets reflecting proof obligations.
target_truth: The new temporal syntax is one canonical GTL graph-vector declaration surface, resolves into typed temporal runtime carriers, and is proven through admitted ABG events, EC replay, sandbox execution, and live provider-admission behavior. Traversal strategy sandbox/live-facing fixtures use the T-112 canonical key names only. Unit tests, sandbox tests, live tests, and tickets all trace to intent/product/requirements rather than proving constructors alone.
superseded_truth: The temporal feature is considered complete because constructors and projection unit tests pass, while no executable GTL syntax, sandbox proof, live provider-admission proof, or repaired canonical traversal sandbox exists.
closure_law: Close only when the requirement/design surfaces name the executable temporal GTL syntax, code resolves that syntax without compatibility aliases, unit tests cover positive and negative GTL syntax cases, sandbox tests prove functional replay behavior, live tests prove provider receipts do not authorize truth before ABG admission, the stale traversal sandbox/live fixture no longer uses retired key spellings, and focused plus semantic tests pass.
non_closure_conditions:
  - temporal syntax exists only as design prose or direct constructor calls
  - provider receipt files or timer callbacks alter eligibility without ABG admission
  - sandbox/live-facing traversal fixtures still use `abg.traversal_modulation` or `abg.default_traversal_modulation`
  - tests assert carrier shapes but never drive emitted events through replay projections
  - T-119 claims deadline, recurrence, window, or complete EC parity beyond the first slice
---

# T-124: Prove Functional GTL Temporal Syntax With Sandbox And Live Lanes

## STDO Triage

### First Missing Layer

Requirements.

T-119 stated that temporal constraints attach to `GraphVector`, but the active
requirement did not name the executable GTL declaration key or the required
config fields. That made the first temporal proof dependent on direct
constructor calls, not on the language syntax that downstream GTL authors will
publish.

The same review found a realization regression in a sandbox/live-facing fixture:
the mini data-mapper traversal scheme still used T-107's retired
`abg.traversal_modulation` spelling even though T-112 intentionally moved ABG to
one canonical `abg.traversal_strategy` surface.

### Lawful Re-Entry

`requirement_reprice`.

The temporal GTL syntax is interface law. It must be stated in requirements
before code and tests can claim a complete proof surface. The traversal fixture
repair is a realization refactor under the T-112 requirement break, but it is
included here because the requested proof review covers sandbox/live behavior
for the new interface.

## Review Findings

- [x] T-119 did not expose an executable GTL temporal syntax resolver; tests
  constructed `TemporalConstraint` directly.
- [x] T-119 had no sandbox lane proving the syntax-to-event-to-projection path.
- [x] T-119 had no live lane proving provider receipts remain non-authoritative
  until ABG admits a temporal event through `emit()`.
- [x] T-112 unit tests proved the old key was rejected, but the T-107 mini
  data-mapper sandbox/live fixture still published the retired keys.

## Closure Checklist

- [x] Update `REQ-L-GTL3-GRAPHVECTOR-011` with the canonical
  `GraphVector.declarations["abg.temporal_constraint"]` syntax.
- [x] Add `deriveTemporalConstraintFromGtl()` and fail-closed parser coverage.
- [x] Add a GTL syntax unit suite for positive replay behavior and malformed,
  duplicate, detached, absent, and unsupported declarations.
- [x] Add a sandbox proof that the GTL declaration emits and replays temporal
  eligibility while aggregate projection remains the iterator.
- [x] Add a live proof that a provider receipt has no eligibility effect before
  `timer_outcome_admitted` is emitted.
- [x] Repair the mini data-mapper traversal sandbox/live fixture to the
  canonical T-112 key names.
- [x] Add focused npm scripts for T-112 sandbox and T-119 GTL/sandbox/live lanes.
- [x] Run focused and semantic tests.

## Closure Evidence

T-124 closes the proof gap it opened. The executable temporal syntax is now
requirement-backed, design-documented, resolved in code, and covered by unit,
sandbox, and live proof. The T-107 mini data-mapper sandbox/live fixture no
longer publishes retired traversal key names.

## Deferred Scope

T-124 does not close deadline breach, recurrence, windows, schedule-policy
consequence, complete continuation/retry/reset EC parity, or cloud timer provider
contracts. Those remain in T-121 and T-122.
