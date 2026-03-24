# Traversal Law (REQ-F-TRAV-*)

**Traces to**: INT-004
**Derived from**: V2 Roadmap Phases 1–2

The runtime traversal must operate on first-class work instances through a unified convergence law. No ad hoc reconstruction of work from `jobs × work_keys` at command boundaries. No divergent convergence models between reporting, selection, and fold-back.

### REQ-F-TRAV-001 — WorkInstance is the end-to-end dispatch unit

WorkInstance must be the real operational unit across all layers: command selection, runtime dispatch, and the GTL constitutional iterate surface. Not just a supporting type.

**Acceptance Criteria**:
- AC-1: `gen_gaps`, `gen_iterate`, and `_derive_state` all construct `WorkInstance` objects from the (jobs × work_keys) product before any convergence computation
- AC-2: Convergence selection iterates over `WorkInstance` objects, not raw `(job, work_key)` tuples
- AC-3: Command outputs include `work_key` and `run_id` when present — the dispatch unit is visible in results
- AC-4: V1 degenerate case: when no work_keys exist, a single WorkInstance with `work_key=None` is created per job
- AC-5: The GTL iterate contract acknowledges routed work — the constitutional runtime surface reflects `(job, work_key, run_id)` as the unit of traversal, not just `(job, candidate_asset, evaluator_fn)`
- AC-6: Work-instance scheduling operates on WorkInstances, not just Workers — scheduling means ordering which work to do next. This is distinct from worker batch partitioning (REQ-F-CORE-006), which partitions workers for concurrent safety

### REQ-F-TRAV-002 — Single convergence law for all paths

Gap reporting, state derivation, iteration selection, and fold-back must all flow through the same convergence computation.

**Acceptance Criteria**:
- AC-1: `schedule.delta()` is the single convergence function — all command paths use it for delta computation
- AC-2: `delta()` includes fold-back: when a work_key has spawned children, convergence delegates to descendants transparently
- AC-3: No separate convergence model exists in `bind_fd()` that can diverge from `schedule.delta()` — `bind_fd()` provides evaluator detail, `delta()` provides the convergence number
- AC-4: `gen_gaps` reports delta values from `schedule.delta()`, not from `bind_fd().delta`

### REQ-F-TRAV-003 — Convergence computation is replayable from events

Convergence state must be derivable entirely from the event stream — no hidden command-layer state.

**Acceptance Criteria**:
- AC-1: `delta(job, stream, work_key)` produces the same result given the same event stream — pure function of events
- AC-2: Fold-back convergence discovers children from `work_spawned` events in the stream, not from external state
- AC-3: Certificate emission (`edge_converged`) is idempotent — repeated computation on the same event stream does not produce duplicate certificates
- AC-4: V1 events (no work_key) remain visible to *global* (unscoped) queries — they are not migrated or deleted. However, V1 events do NOT satisfy work-key-scoped queries (REQ-F-EC-002 AC-5) — scoped projection requires matching work_key
