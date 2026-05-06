---
id: T-121
title: Complete ABG Event Calculus projection parity beyond first lifecycle slice
type: feature
ticket_category: event_calculus_projection_parity
status: completed
goal: rc-next-declarative-abg-event-calculus-substrate
change_intent: Deepen the T-120 Event Calculus substrate so continuation, retry, reset/correction, and derived-fluent projection truth consume declared EC law instead of remaining private projection-switch semantics.
change_class: design_reframe
re_entry_point: design
affected_boundary:
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-CORRECTION.md
  - build_tenants/abiogenesis/typescript/design/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/
  - build_tenants/abiogenesis/typescript/test_env/tests/
priority: high
build_tenant: typescript
release_scope: post-T-120-first-slice
triaged_at: 2026-05-06T23:45:46+10:00
created_at: 2026-05-06T23:45:46+10:00
updated_at: 2026-05-07T00:40:00+10:00
closed_at: 2026-05-07T00:40:00+10:00
owning_repo: abiogenesis
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
dependencies:
  - T-120 first EC runtime-law slice
evidence_refs:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/active/T-120-declare-abg-event-calculus-runtime-law-before-temporal-algebra.md
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/design/ABG_EVENT_CALCULUS_PROJECTION_REFACTOR_PLAN.md
proof_commands:
  - npm run build:semantic
  - npm run test:t121
  - npm run test:semantic
intake_source: T-120 reopen review found graph-call, frame, and vector closure EC gating sufficient for the first slice, but continuation, retry, reset/correction, and derived-fluent projection parity remain too large to close inside T-120 without hiding scope drift.
target_truth: ABG projection modules consume declared EC effects for closure-critical continuation, retry, reset/correction, and derived-fluent truth while preserving projection-local integrity checks such as ordering, duplicate detection, scope validation, and range validation.
superseded_truth: Projection modules claim EC completeness while closure-critical continuation, retry, reset/correction, or ramified truth remains private switch semantics without declared `Initiates`, `Terminates`, `Clips`, `Declips`, or derived-fluent rules.
closure_law: Close only when design and tests prove the next projection family consumes declared EC law, rejects undeclared event/fluent effects, and preserves one ABG execution authority without creating an EC controller.
non_closure_conditions:
  - continuation or retry projection truth remains private transition law while the ticket claims EC parity
  - reset/correction can shadow runtime truth without explicit clip/declipped evidence
  - derived fluents are implemented as ad hoc projection rows without declared derived-fluent rules
  - EC replay chooses graph advancement, retry, or closure directly instead of feeding ABG projection/iteration law
---

# T-121: Complete ABG Event Calculus Projection Parity Beyond First Lifecycle Slice

## STDO Triage

### First Missing Layer

Design.

T-120 introduced the requirement and first runtime-law slice. The remaining work
does not need new constitutional wording by default; it needs a deeper module
design and implementation plan for the next projection families.

### Lawful Re-Entry

`design_reframe`.

If this ticket discovers that current EC requirements cannot cover correction,
declipping, derived fluents, or continuation truth, it must reprice back to
requirements before implementation proceeds.

## Closure Checklist

- [x] Name the next projection family or families in scope.
- [x] Update `ABG_EVENT_CALCULUS_PROJECTION_REFACTOR_PLAN.md`.
- [x] Add declared EC effects or derived-fluent rules for the selected family.
- [x] Refactor the selected projection path to consume those declarations.
- [x] Add negative tests for undeclared effect, wrong scope, and stale private
  transition law.
- [x] Run `npm run test:t121`.
- [x] Run `npm run test:semantic`.

## Design Module Review

outcome: accepted

The selected T-121 family is retry/continuation projection parity:
`retry_repair_planned`, `continuation_terminated`, and
`continuation_reopened`. This is a bounded design refactor under the existing
EC requirement surface. Retry choice, graph advancement, duplicate checks, and
ordering checks remain ABG projection/iteration law; EC supplies declared
fluent effects.

## Closure Evidence

T-121 closes with:

- `deriveRuntimeAggregateProjection()` requiring declared EC effects for retry
  repair and continuation repair projection rows.
- `ABG_EVENT_CALCULUS_PROJECTION_REFACTOR_PLAN.md` updated for the selected
  retry/continuation family.
- `test_t121_event_calculus_projection_parity.test.mjs` proving positive EC
  replay plus undeclared axiom, wrong-scope, and stale-private-transition
  negative cases.

Executed proof:

- `npm run test:t121` -> 4 passed
- `npm run test:t119` -> 17 passed
- `npm run test:semantic` -> 440 passed
- `npm run lint:semantic` -> passed
- `npm run lint:test-harness` -> passed
- `git diff --check` -> passed
