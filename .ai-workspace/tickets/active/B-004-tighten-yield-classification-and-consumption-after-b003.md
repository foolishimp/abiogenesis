# B-004 Tighten Yield Classification And Consumption After B-003

- id: B-004
- title: Tighten yield classification and consumption after B-003
- type: backlog
- status: active
- goal: runtime-convergence-governance
- priority: high
- created_at: 2026-04-13
- updated_at: 2026-04-13

## Context

`B-003` introduced yielded post-dispatch handoff truth for unresolved
non-blocking post-transform observer findings.

That restored the missing middle state between fail-closed and blindly continue
open:

- `fail`
- `yield`
- `ok`

The core runtime shape is now correct, but several follow-up tightening items
remain outside the immediate stale-continuation fix.

## Why This Is Separate

This ticket exists so `B-003` can stay focused on:

- removing post-transform `F_D` closure regression
- introducing yielded handoff truth
- stopping blind redispatch under `start --auto`

The items below are real, but they are follow-up tightening rather than the
minimal authority restoration.

## Remaining Concerns

### 1. Yield classification is still too broad

`result_ingest._rerun_manifest_fd_failures(...)` can return mixed reasons such
as:

- `fd_still_failing`
- `missing_binding`
- `timeout`

Only ordinary non-blocking observer incompleteness should yield.

Runtime, malformed-config, or replay-defect classes should still fail closed.

### 2. Duplicate-dispatch guard does not yet treat yielded as active

`run.py` projects `yielded`, and correction/reset already treats `yielded` as
active runtime truth, but `find_pending_run()` still only considers:

- `queued`
- `pending`
- `started`
- `dispatched`

That leaves a second redispatch seam outside the fixed `start --auto` path.

### 3. Observer handoff continuation sink is not yet proved end-to-end

ABG now opens `continuation_kind = observer_handoff`.

The sink that absorbs or resolves that continuation after downstream
gap/routing handling is not yet proved in-tree.

That may belong to:

- downstream consumer runtime integration
- or a later ABG handoff-consumption surface

But it should be explicit rather than assumed.

### 4. Continuation provenance could be richer

Yielded `continuation_opened` currently carries the core continuation truth, but
does not thread the full adjacent provenance bundle:

- `job_id`
- `graph_function_id`
- `materialization_id`
- `vector_id`

That is not a blocker, but it may matter for provenance-heavy queries.

### 5. Operator readability note

`graph_call_closed -> continuation_opened -> run_yielded` is the correct event
order for:

- callable boundary closed
- run yielded handoff

But operators may misread `graph_call_closed` as terminal unless the design and
guide surfaces say explicitly that graph-call closure is not run terminalization.

### 6. Future taxonomy widening

`handoff_reason = "fd_findings"` is correct for the current narrow scope.

If later yielded causes include other non-blocking observer classes, the schema
will need widening rather than ad hoc reuse.

## Task List

- [ ] Classify post-transform replay failures by authority so only lawful non-blocking observer incompleteness yields.
- [ ] Make duplicate-dispatch guards treat yielded runs as active until the handoff is consumed or superseded.
- [ ] Define and prove the lawful sink for `observer_handoff` continuations.
- [ ] Decide whether continuation provenance should be aligned with adjacent run-yielded provenance.
- [ ] Add explicit design/guide wording that graph-call closure is not necessarily run terminalization.
- [ ] Generalize yielded handoff taxonomy only when a second real yielded cause exists.

## Acceptance

- Yield only applies to the intended non-blocking observer class.
- Non-auto and concurrent runtime paths cannot redispatch the same yielded lane blindly.
- `observer_handoff` continuation lifecycle is explicit and provable.
- Documentation no longer invites misreading of graph-call closure as run completion.

## Links

- parent bug: `/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/active/B-003-restore-gap-first-fd-authority-and-remove-post-fp-closure-regression.md`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/run.py`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/cli_adapter.py`
- runtime: `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/correction.py`
- standard: `/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md`
- standard: `/Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md`
