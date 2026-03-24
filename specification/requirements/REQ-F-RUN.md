# Run Governance (REQ-F-RUN-*)

**Traces to**: INT-005
**Derived from**: V2 Roadmap Phase 4, OpenClaw lessons

Run governance provides reliable transport for higher-level work. Each attempt (run_id) on a unit of work (work_key) has an explicit lifecycle, failure classification, and retry semantics. The kernel owns this — not domain packages.

### REQ-F-RUN-001 — Explicit run lifecycle model

Each run (work_key, run_id) has a well-defined state machine.

**Acceptance Criteria**:
- AC-1: Run states include at minimum: `queued`, `started`, `dispatched`, `pending`, `assessed`, `failed`, `timed_out`, `superseded`. Runs terminate at `assessed` (F_P actor produced a result). Convergence is an edge-level projection computed by `delta()`, not a run lifecycle event — a run may be assessed-pass without the edge converging (e.g., F_D evaluators still fail)
- AC-2: State transitions are recorded in the event stream — the lifecycle of any run is reconstructable from events
- AC-3: `run_id` is generated at creation time and immutable — each WorkInstance represents exactly one attempt
- AC-4: Multiple runs on the same work_key are distinguishable by run_id and ordered by event_time

### REQ-F-RUN-002 — Failure classification

Transport failures, output failures, and certification failures are distinguished — not collapsed into a single "failed" state.

**Acceptance Criteria**:
- AC-1: Transport failure (actor unreachable, timeout, crash) is classified as `transport_failure` — eligible for automatic retry
- AC-2: No output (actor returned empty/invalid response) is classified as `no_output` — eligible for retry with different parameters
- AC-3: Bad output (actor produced structurally invalid assessment) is classified as `bad_output` — requires diagnosis before retry
- AC-4: Failed certification (output exists but F_D evaluators still fail) is classified as `certification_failure` — a construction quality problem, not a transport problem
- AC-5: Failure classification is recorded in the event stream for observability and retry decisions

### REQ-F-RUN-003 — Waiter deduplication and pending semantics

The system must not dispatch duplicate work while a prior attempt is in flight.

**Acceptance Criteria**:
- AC-1: At most one run for a given (work_key, edge) is in `dispatched` or `pending` state at any time
- AC-2: Arrival of a new convergence request while a run is pending returns the pending run_id — no duplicate dispatch
- AC-3: Pending state has a maximum duration (timeout) — after which the run transitions to `timed_out` and a new run may be created
- AC-4: A `superseded` run is one whose work_key has been re-dispatched before the original run completed. Supersession is recorded via a `run_superseded` Tier 2 control event (REQ-F-EC-001 AC-2) emitted at the moment the new run is dispatched, carrying `{superseded_run_id, superseded_by: new_run_id, work_key, edge}`. If the superseded run's result arrives later, it is recorded in the event stream (append-only) but not applied to convergence state — replay uses the `run_superseded` event to distinguish "recorded but not applied" from "applied"

### REQ-F-RUN-004 — Retry grace for transient failures

Transient transport failures should not immediately fail the work — a bounded number of retries is permitted.

**Acceptance Criteria**:
- AC-1: Transport failures trigger automatic retry up to a configurable maximum (default: 3)
- AC-2: Each retry creates a new run_id on the same work_key — attempt history is preserved
- AC-3: Retry backoff is bounded (e.g., exponential with max) — the system does not retry indefinitely
- AC-4: After max retries, the work transitions to `failed` with a summary of all attempt outcomes
- AC-5: Retry behavior is transparent in the event stream — each retry is visible as a distinct run
