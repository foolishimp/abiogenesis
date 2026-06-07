---
id: T-126
title: Consolidate temporal runtime scope and projection row carriers
type: refactor
ticket_category: ordinary
status: completed
proof_status: passed
goal: rc-next-schedule-native-gtl-time-algebra
change_intent: Finish the temporal realization cleanup left after T-119/T-122 by centralizing repeated temporal runtime-scope construction, while consuming the already-ratified T-149 iteration outcome algebra and T-151 scoped-row law instead of creating another engine decision surface.
change_class: realization_refactor
re_entry_point: realization
affected_boundary:
  realization:
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/temporal_algebra.ts
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t119_temporal_algebra_unit.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t122_temporal_deadline_policy.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t119_temporal_gtl_syntax.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/sandbox/test_t119_temporal_gtl_sandbox.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/live/test_t119_temporal_gtl_live.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/live/test_t125_temporal_and_non_temporal_gtl_live.test.mjs
priority: medium
build_tenant: typescript
release_scope: post-T-149-engine-consistency-cleanup
triaged_at: 2026-05-07T00:57:24+10:00
created_at: 2026-05-07T00:57:24+10:00
activated_at: 2026-06-07
updated_at: 2026-06-07
completed_at: 2026-06-07
owning_repo: abiogenesis
governance_scope: STDO Method
governance_scope_expansion:
  - D: DESIGN_MODULE_METHOD.md
dependencies:
  - T-122 deadline-breach projection attribution repair
  - T-149 simplify ABG iteration state into one recursive outcome algebra
  - T-151 declare segment-scoped evaluation redispatch substrate
intake_source: T-126 was originally opened from design-module review of repeated temporal runtime scope fields across TimerIntent, DeadlineBreach, ScheduledContinuation, and their admitted events. Re-review after T-149/T-151 found that the engine-level one-outcome work is already governed elsewhere; this ticket remains only as temporal realization cleanup.
target_truth: Temporal runtime-scope construction is centralized behind a module-private helper or subordinate module-local payload. Temporal projection keeps consuming admitted deadline-breach projection row truth from T-122. Temporal code does not create another iteration outcome, scoped-evaluation, redispatch, retry, block, closure, or re-entry authority surface; those remain governed by T-149 and T-151.
superseded_truth: Each temporal carrier and event constructor repeats basis/graph/frame/run/work/vector/edge field construction independently, increasing drift risk. T-126 is treated as a second engine-consistency ticket even though T-149 already owns the active-boundary outcome algebra and T-151 already owns scoped evaluation row metadata.
closure_law: Close only after a focused refactor reduces duplicated temporal runtime-scope construction without changing admitted event identity, temporal projection output, homeostatic projection output, or public carrier authority. The implementation must preserve T-149/T-151 ownership: temporal rows may provide temporal facts, but they must not select active-boundary outcome, localized redispatch, closure, retry, block, re-entry, or scoped evaluation truth.
non_closure_conditions:
  - consolidation creates a new public TemporalRuntimeScope carrier or exported authority surface without a design promotion test
  - helper extraction changes admitted event shape, event identity, projection row shape, sort keys, or public output
  - temporal code reconstructs deadline-breach policy/action truth downstream instead of consuming admitted `DeadlineBreachProjectionRow` truth
  - temporal code introduces a local retry/block/close/re-entry decision that belongs to T-149 `IterationOutcomeProjection`
  - temporal code introduces scoped evaluation identity, localized redispatch, or segment/cell/fold/relation addressing outside T-151 `GtlEvaluationScopeRef`
  - temporal code infers runtime scope from prompt text, diagnostic strings, filenames, wall-clock order, or product-local naming
  - proof only checks happy-path temporal behavior and does not guard exact output preservation
---

# T-126: Consolidate Temporal Runtime Scope And Projection Row Carriers

## STDO Triage

### First Missing Layer

Realization.

The remaining problem is implementation shape inside the temporal runtime
module. Current requirement and design law already decide the higher-level
engine behavior:

- T-122 already repaired the deadline-breach row-truth issue by making
  `TemporalProjection.deadlineBreachRows` preserve admitted
  `schedulePolicyRef`, `deadlineRef`, `deadlineBreachAction`, provider ref, and
  provider receipt ref.
- T-149 already owns the single active-boundary iteration outcome algebra:
  `typed rows -> lifecycle filter -> priority fold -> terminate | redispatch |
  suspend`.
- T-151 already owns scoped evaluation addressability as subordinate row and
  redispatch-target metadata under the T-149 primitive.

T-126 must therefore stay small. It does not add temporal law and does not add a
second "single engine" surface. It cleans temporal construction code so runtime
scope fields are built once and consumed consistently.

### Lawful Re-Entry

`realization_refactor`.

## Current Reality

`temporal_algebra.ts` still repeats the same runtime-scope field set across
multiple temporal carriers and event constructors:

```text
basisId
graphFunctionId
graphCallId
frameId
runId
workKey
vectorIndex
edge
```

This repetition is not currently a behavioral defect because the focused T-119
and T-122 lanes pass. It is still design-method pressure because one temporal
scope change could drift across carrier constructors, admitted events, runtime
fluents, and projection rows.

## Audit List

- [x] `TimerIntent` repeats temporal runtime-scope fields directly.
  Fix: derive those fields through a module-private helper or subordinate
  module-local payload.

- [x] `DeadlineBreach` repeats the same temporal runtime-scope fields directly.
  Fix: consume the same helper/payload as `TimerIntent`; preserve current public
  `DeadlineBreach` shape.

- [x] `ScheduledContinuation` repeats the same temporal runtime-scope fields and
  partially derives them from `TimerIntent`.
  Fix: consume helper/payload without creating an exported runtime-scope
  authority carrier.

- [x] `constructTimerIntentAdmittedEvent`,
  `constructDeadlineBreachAdmittedEvent`,
  `constructTimerOutcomeAdmittedEvent`, and
  `constructScheduledContinuationReopenedEvent` repeat event-scope assignment.
  Fix: centralize event-scope field projection while preserving the exact
  admitted event output.

- [x] `temporalEligibleRuntimeFluent(...)` rebuilds graph call, frame, run,
  work, vector, and edge scope independently.
  Fix: route through the same local scope derivation used by temporal carriers.

- [x] Temporal projection already carries `DeadlineBreachProjectionRow`, but the
  proof should keep guarding that homeostatic observations consume row truth.
  Fix: retain or strengthen T-122 tests so caller-supplied schedule policy/action
  cannot misattribute a deadline-breach observation.

- [x] No structural guard currently asserts that temporal runtime-scope
  construction has one local owner.
  Fix: add focused proof that the helper/payload is used by the temporal
  constructors, without overfitting to formatting.

- [x] No output-preservation guard currently snapshots the affected temporal
  carrier/event/projection shapes as part of this refactor.
  Fix: add exact deep-equality tests for representative timer intent,
  deadline-breach, scheduled-continuation, admitted event, temporal projection,
  and temporal homeostatic projection outputs.

- [x] T-126 must not fold T-149 or T-151 into temporal code.
  Fix: add a negative/static proof that temporal code does not define
  `IterationOutcome`, `redispatch` target scope, segment/cell/fold/relation
  scope, or local retry/block/close outcome selection.

## Implementation Rules

1. Introduce only a private helper or module-local subordinate payload for
   temporal runtime scope construction.
2. Do not export the helper as a public carrier unless a separate design
   promotion test proves public authority need.
3. Do not change temporal requirements or design unless the refactor exposes a
   genuine authority gap.
4. Preserve admitted event output and projection output exactly.
5. Keep deadline-breach row truth as the source for homeostatic projection.
6. Keep temporal facts subordinate to T-149 iteration outcome authority.
7. Keep scoped evaluation addressability subordinate to T-151.

## Closure Checklist

- [x] Add a module-private temporal runtime-scope helper or subordinate
  module-local payload.
- [x] Migrate `TimerIntent`, `DeadlineBreach`, `ScheduledContinuation`, temporal
  admitted events, and temporal runtime fluents to consume the helper/payload.
- [x] Preserve public carrier, admitted event, projection, and homeostatic
  output shapes exactly.
- [x] Add focused structural/output-preservation tests for the refactor.
- [x] Confirm homeostatic deadline observations still consume
  `DeadlineBreachProjectionRow` truth.
- [x] Confirm no temporal code owns T-149 outcome authority or T-151 scoped
  evaluation addressability.
- [x] Run:
  - `npm run test:t119`
  - `npm run test:t122`
  - `node --test test_env/tests/test_t126_temporal_runtime_scope_consolidation.test.mjs`
  - `npm run build:semantic`

## Current Proof Snapshot

Before activation, the current tree was checked with:

- `npm run test:t122` -> passed 5/5
- `npm run test:t119:gtl` -> passed 4/4

Those commands prove the existing temporal row-truth behavior still works. They
do not close this ticket because the runtime-scope duplication remains.

## Closure Evidence - 2026-06-07

Implementation:

- Added private `TemporalRuntimeScope` / `TemporalEventRuntimeScope` helpers
  inside `temporal_algebra.ts`; they are not exported and do not create a new
  public temporal authority surface.
- Routed `TimerIntent`, `DeadlineBreach`, `ScheduledContinuation`, temporal
  admitted events, and `temporalEligibleRuntimeFluent(...)` through the helper.
- Added `test_t126_temporal_runtime_scope_consolidation.test.mjs` to prove exact
  carrier/event/projection output preservation, row-truth homeostatic
  projection, one private helper owner, and no T-149/T-151 authority in temporal
  code.
- Strengthened the depth proof so temporal event and continuation constructors
  reject tampered runtime-scope carriers, and so the temporal constructor path
  cannot pair `TimerOutcome` with a contradictory `TimerIntent` lineage.

Verification:

- `npm run build:semantic` passed.
- `npm run test:t119` passed `17/17`, including `test_t119:live` and
  `test_t125:live` coverage.
- `npm run test:t122` passed `5/5`.
- `node --test test_env/tests/test_t126_temporal_runtime_scope_consolidation.test.mjs`
  passed `5/5`.
- Implementation-time snapshot: `npm run test:semantic` passed `717/717`.
- Subsequent review rerun reported `npm run test:semantic` passed `721/721`.
