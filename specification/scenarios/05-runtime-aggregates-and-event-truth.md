# Scenario Bundle - Runtime Aggregates And Event Truth

> **T-283 disposition (2026-07-20):** Prior scenario evidence; held and
> non-operative for 5.0 acceptance. The exact current Product scenarios are
> `ABG5-S01` through `ABG5-S07` in `PRODUCT.md` and
> `REQ-P-SCENARIOS.md`. Reuse requires post-closure re-derivation.

**Validates**: REQ-R-ABG3-EVENTS, REQ-R-ABG3-BINDING, REQ-R-ABG3-WORKER, REQ-R-ABG3-JOB-WORKER, REQ-R-ABG3-RUN, REQ-R-ABG3-GRAPHCALL, REQ-R-ABG3-FRAME, REQ-R-ABG3-CONTINUATION

**Derives from**: [SPEC_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/SPEC_METHOD.md), [INTENT.md](../INTENT.md) INT-001, [ODD_METHOD.md](https://github.com/foolishimp/specification_methodology/blob/main/specification/standards/ODD_METHOD.md), [PRODUCT.md](../PRODUCT.md), [requirements/abg/README.md](../requirements/abg/README.md)

**Purpose**: Prove that ABG 3 runtime truth is event-authoritative over
explicit aggregates, runtime-environment binding, and carried execution truth
rather than hidden controller memory.

## Scenario

Bind one worker to one published graph-function job, resolve one runtime
environment snapshot over entry and carried bindings, open one run, materialize
one graph call, traverse one recursive boundary with a frame, and open then
resolve one continuation from emitted runtime facts.

## Significant Paths

- entry path: public semantic work enters through `Job -> GraphFunction`
- binding path: ABG resolves a runtime environment snapshot, preserves the
  distinction between external entry bindings and internally carried bindings,
  widens the live executable boundary invocation-locally when a target
  `asset_surface` requires already-declared carried context, and fails closed
  when a target asset contract requires undeclared carried context
- aggregate path: `Run`, `GraphCall`, `Frame`, and `Continuation` open and
  close by authoritative events
- vector path: vector-local facts attach to the nearest enclosing runtime
  aggregate and never become their own aggregate
- boundary path: semantic GTL surfaces remain distinct from worker/run/call
  runtime truth

## Expected Outcomes

1. runtime truth is reconstructable from event emission alone
2. `GraphCall` is the public callable runtime aggregate
3. binding truth includes a replay-visible runtime environment snapshot rather
   than hidden ambient state, including explicit visibility into the effective
   required boundary merged from vector source and target `asset_surface`
   declarations
4. recursive execution uses explicit frame truth rather than hidden stack state
5. continuations record run-local open obligation truth, not a hidden task
   queue
