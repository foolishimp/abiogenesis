# Work Identity (REQ-F-WK-*)

**Traces to**: INT-004

### REQ-F-WK-001 — work_key is an immutable hierarchical identity on iterate()

Every unit of work carries an immutable identity expressed as a lawful chain. The chain is the identity — no surrogate IDs required.

**Acceptance Criteria**:
- AC-1: `work_key` is a `/`-delimited hierarchical string (e.g., `INT-001/REQ-042/build.design/module.auth`)
- AC-2: `iterate(job, work_key, run_id, ...)` — the kernel accepts work identity as parameters
- AC-3: `work_key` is stable across time — the same piece of work always has the same key regardless of how many attempts are made
- AC-4: Child work is expressed as key refinement: parent `INT-001/REQ-042` spawns child `INT-001/REQ-042/module.auth`

### REQ-F-WK-002 — run_id identifies one attempt on a work_key

Each attempt at a unit of work has its own identity for transaction, retry, and audit purposes.

**Acceptance Criteria**:
- AC-1: `run_id` is a unique identifier generated per attempt (e.g., UUID or hash)
- AC-2: Multiple runs on the same `work_key` produce distinct `run_id` values
- AC-3: Attempt history for a `work_key` is reconstructable by filtering events on `work_key` and ordering by `event_time` — `run_id` is an identity, not an ordering criterion (REQ-F-RUN-001 AC-4)

### REQ-F-WK-003 — Events carry work_key and run_id

The event stream records work identity on all events so state can be projected per work unit.

**Acceptance Criteria**:
- AC-1: `EventStream.append()` includes `work_key` and `run_id` fields when provided
- AC-2: Events without `work_key` remain valid (backwards compatibility with V1 events)
- AC-3: `project(stream, asset_type, work_key)` returns state scoped to that work unit
- AC-4: `project()` without `work_key` returns global state (V1 behaviour preserved)

### REQ-F-WK-004 — delta() computable per work_key

Convergence is measurable per unit of work, not just per edge.

**Acceptance Criteria**:
- AC-1: `delta(job, work_key)` computes convergence for a specific work unit on a specific edge
- AC-2: `delta(job)` without work_key computes global edge convergence (V1 behaviour preserved)
- AC-3: Adding a new feature vector to a converged workspace produces delta > 0 for that feature's work_key on code-tier edges
- AC-4: `gen-gaps` reports per-work_key delta when work_keys are active

### REQ-F-WK-005 — Scheduler creates work instances from (job, work_key) pairs

The scheduler generates work instances that pair topology with identity.

**Acceptance Criteria**:
- AC-1: Scheduler enumerates active work_keys (from feature vectors, modules, or explicit scope)
- AC-2: For each (job, work_key) pair with delta > 0, a work instance is created
- AC-3: Work instances are processed in topological edge order, respecting work_key dependencies
- AC-4: V1 behaviour (single global traversal) is the degenerate case where work_key is absent
