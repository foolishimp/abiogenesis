---
id: T-126
title: Consolidate temporal runtime scope and projection row carriers
type: refactor
ticket_category: temporal_carrier_consolidation
status: backlog
goal: rc-next-schedule-native-gtl-time-algebra
change_intent: Reduce temporal carrier duplication after the T-119/T-122 proof slice by consolidating repeated runtime-scope construction and keeping deadline projection row truth as the single downstream source for homeostatic observations.
change_class: realization_refactor
re_entry_point: realization
affected_boundary:
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/temporal_algebra.ts
  - build_tenants/abiogenesis/typescript/test_env/tests/
priority: medium
build_tenant: typescript
release_scope: post-T-119-T-122-temporal-proof
triaged_at: 2026-05-07T00:57:24+10:00
created_at: 2026-05-07T00:57:24+10:00
owning_repo: abiogenesis
governance_scope: STDO Method
governance_scope_expansion:
  - D: DESIGN_MODULE_METHOD.md
dependencies:
  - T-122 deadline-breach projection attribution repair
intake_source: Final design-module review found repeated temporal runtime scope fields across TimerIntent, DeadlineBreach, ScheduledContinuation, and their admitted events.
target_truth: Temporal runtime-scope construction is centralized behind a subordinate helper or local payload shape, and homeostatic projection consumes admitted deadline-breach projection row truth rather than reconstructing policy/action values.
superseded_truth: Each temporal carrier and event constructor repeats basis/graph/frame/run/work/vector/edge field construction independently, increasing drift risk.
closure_law: Close only after a focused refactor reduces duplicated temporal runtime-scope construction without promoting subordinate scope detail into a new public authority carrier and without changing temporal projection behavior.
non_closure_conditions:
  - consolidation creates a new public carrier that becomes a rival authority surface
  - helper extraction changes admitted event identity or projection output
  - deadline-breach row truth is reconstructed downstream instead of preserved from admitted event truth
---

# T-126: Consolidate Temporal Runtime Scope And Projection Row Carriers

## STDO Triage

### First Missing Layer

Realization.

The current requirements and design can express the temporal proof slice. The
remaining issue is implementation shape: repeated runtime-scope field assembly
increases drift risk but does not require new temporal law.

### Lawful Re-Entry

`realization_refactor`.

## Closure Checklist

- [ ] Introduce a private helper or subordinate payload for temporal runtime
  scope construction.
- [ ] Keep the helper module-local unless a promotion test proves public carrier
  need.
- [ ] Preserve admitted event output exactly, or update tests intentionally if a
  changed field becomes lawful.
- [ ] Run `npm run test:t119`, `npm run test:t122`, and the temporal live lanes.
