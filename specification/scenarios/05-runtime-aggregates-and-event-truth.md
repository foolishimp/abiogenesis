# Scenario Bundle - Runtime Aggregates And Event Truth

**Validates**: REQ-R-ABG3-EVENTS, REQ-R-ABG3-BINDING, REQ-R-ABG3-WORKER, REQ-R-ABG3-JOB-WORKER, REQ-R-ABG3-RUN, REQ-R-ABG3-GRAPHCALL, REQ-R-ABG3-FRAME, REQ-R-ABG3-CONTINUATION

**Derives from**: [/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../INTENT.md) INT-001, [ABG_3_CONSTITUTIONAL_DESIGN.md](../ABG_3_CONSTITUTIONAL_DESIGN.md)

**Purpose**: Prove that ABG 3 runtime truth is event-authoritative over
explicit aggregates rather than hidden controller memory.

## Scenario

Bind one worker to one published graph-function job, open one run, materialize
one graph call, traverse one recursive boundary with a frame, and open then
resolve one continuation from emitted runtime facts.

## Significant Paths

- entry path: public semantic work enters through `Job -> GraphFunction`
- aggregate path: `Run`, `GraphCall`, `Frame`, and `Continuation` open and
  close by authoritative events
- vector path: vector-local facts attach to the nearest enclosing runtime
  aggregate and never become their own aggregate
- boundary path: semantic GTL surfaces remain distinct from worker/run/call
  runtime truth

## Expected Outcomes

1. runtime truth is reconstructable from event emission alone
2. `GraphCall` is the public callable runtime aggregate
3. recursive execution uses explicit frame truth rather than hidden stack state
4. continuations record run-local open obligation truth, not a hidden task
   queue
