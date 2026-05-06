---
id: T-123
title: Add ABG method trace and design-module closure guard
type: feature
ticket_category: method_trace_closure_guard
status: completed
goal: rc-next-spec-method-conformance-guard
change_intent: Add a local ABG guard that catches broad requirement-family trace comments, missing design-module review records, and premature ticket closure claims before they become method drift.
change_class: design_reframe
re_entry_point: design
affected_boundary:
  - .ai-workspace/tickets/
  - build_tenants/abiogenesis/typescript/design/
  - build_tenants/abiogenesis/typescript/test_env/tests/
  - build_tenants/abiogenesis/typescript/package.json
priority: medium
build_tenant: typescript
release_scope: post-T-112-T-119-T-120-method-repair
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
evidence_refs:
  - /Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
proof_commands:
  - npm run build:semantic
  - npm run test:t123
  - npm run test:semantic
intake_source: T-112/T-119/T-120 reopen review found broad requirement-family trace comments, missing post-ticket design-module review records, and premature closure status despite partial proof.
target_truth: ABG has a local proof lane that flags new code/test/design surfaces without specific requirement IDs when a specific requirement exists, flags completed tickets with open closure checklists, and flags design-module-governed tickets without a recorded design-module review outcome.
superseded_truth: Method conformance is enforced only by ad hoc human review after implementation has already closed tickets.
closure_law: Close only when a focused local guard catches the known T-112/T-119/T-120 drift classes and the ticket records whether the pattern should be promoted to specification_methodology as shared method/tooling.
non_closure_conditions:
  - the guard depends on mutable chat context rather than repo artifacts
  - broad family traces pass when a specific requirement ID is required
  - completed tickets can still contain unchecked closure checklist items
  - the ticket does not record whether a global shared-method follow-up is needed
  - the guard remains only an in-memory fixture test and does not scan current repo artifacts
  - structural carrier diagram files can use non-method `flowchart` sketches without failing the guard
global_consolidation_candidate: specification_methodology
---

# T-123: Add ABG Method Trace And Design-Module Closure Guard

## STDO Triage

### First Missing Layer

Design.

The shared method law exists. This ticket adds a local ABG guard over the current
TypeScript/ticket workflow and records whether the pattern should be promoted to
shared methodology after local proof.

### Lawful Re-Entry

`design_reframe`.

## Closure Checklist

- [x] Define the local guard inputs and failure classes.
- [x] Add a focused test or script lane.
- [x] Prove it catches broad traces, unchecked completed checklists, and missing
  design-module review records.
- [x] Record whether this should become a shared `specification_methodology`
  standard/tooling follow-up.
- [x] Run `npm run test:t123`.
- [x] Run `npm run test:semantic`.
- [x] Convert the guard from fixture-only proof into a repo-artifact scanner.
- [x] Add a failure class for structural carrier diagrams that lack method
  `classDiagram` shape and role stereotypes.
- [x] Wire the scanner into `npm run test:t123` and keep the fixture-level cases.

## Design Module Review

outcome: accepted

The local guard is a proof lane over durable repo artifacts, not a new shared
method standard. It validates strings and ticket bodies in the TypeScript test
harness so the known drift classes are caught by repeatable tests.

2026-05-07 update: closure is reopened because the test proves fixture strings
only. The guard must scan the current ABG repo artifacts before this ticket can
claim it catches method drift before closure.

2026-05-07 closure update:

- `test_env/tests/support/method-trace-guard.mjs` now owns the reusable local
  guard functions and current EC/temporal repo-artifact scan.
- `test_t123_method_trace_guard.test.mjs` keeps the fixture-level failure proofs
  and adds a current repo-artifact scan.
- The guard now catches invalid structural carrier diagrams that lack
  `classDiagram`, method stereotypes, or visibility members.
- `npm run test:t123` passed with 6 tests.
- `npm run test:semantic` passed with 443 tests.
- `npm run lint:test-harness` passed.

## Closure Evidence

T-123 closes with:

- `ABG_METHOD_TRACE_CLOSURE_GUARD_DERIVATION.md` defining guard inputs and
  failure classes.
- `test_t123_method_trace_guard.test.mjs` proving detection for broad
  requirement-family traces, unchecked completed-ticket checklist items, and
  missing design-module review outcomes, invalid structural diagrams, current
  EC/temporal repo artifacts, plus an allowed clean case.
- `package.json` script `test:t123`.

Global consolidation decision: promote later only if the pattern proves useful
outside ABG. The candidate target is `specification_methodology` generic
tooling, not ABG-local law.

Executed proof:

- `npm run test:t123` -> 6 passed
- `npm run test:semantic` -> 443 passed
- `npm run lint:semantic` -> passed
- `npm run lint:test-harness` -> passed
- `git diff --check` -> passed
