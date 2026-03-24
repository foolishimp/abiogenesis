# Bounded Leaf Tasks (REQ-F-LEAF-*)

**Traces to**: INT-005
**Derived from**: V2 Roadmap Phase 5, OpenClaw lessons

Leaf tasks are bounded, schema-driven sub-work units that execute within a graph traversal without flattening the engine. They are subordinate to graph traversal — not a substitute for it. The pattern provides disciplined agent sub-work for narrow transforms and structured queries.

### REQ-F-LEAF-001 — Leaf task surface is bounded and schema-driven

Leaf tasks have explicit input/output schemas, bounded execution, and constrained capabilities.

**Acceptance Criteria**:
- AC-1: A leaf task has a declared input schema (JSON) and output schema (JSON) — structurally validated before dispatch and after return
- AC-2: Leaf tasks have an explicit timeout — no unbounded execution
- AC-3: Leaf tasks are toolless by default — they receive context and produce structured output without filesystem access, network access, or subprocess invocation unless explicitly granted
- AC-4: Leaf task execution is atomic from the caller's perspective — it either produces a valid output or fails

### REQ-F-LEAF-002 — Leaf tasks integrate with run governance

Leaf task execution uses a **named projection** of the run lifecycle (REQ-F-RUN-001). Leaf tasks are subordinate sub-work — they do not traverse the full run state machine but share its identity model, failure taxonomy, and retry rules.

**Acceptance Criteria**:
- AC-1: Each leaf task execution gets a `run_id` — attempt identity is preserved, subordinate to the parent run's `run_id` as `{parent_run_id}/leaf/{task_name}`
- AC-2: Leaf task lifecycle is a projection of the run lifecycle: `queued → started → completed | failed | timed_out`. The states `dispatched`, `pending`, `assessed`, `converged`, and `superseded` from REQ-F-RUN-001 do not apply — leaf tasks are synchronous from the caller's perspective (atomic dispatch, no pending waiter)
- AC-3: Leaf task failures are classified using the same taxonomy as run governance: `transport_failure`, `no_output`, `bad_output` (REQ-F-RUN-002). `certification_failure` does not apply — leaf tasks do not produce convergence state
- AC-4: Leaf tasks are retryable — transient failures (`transport_failure`) trigger retry under the same bounded backoff rules as REQ-F-RUN-004

### REQ-F-LEAF-003 — Leaf tasks are subordinate to graph traversal

Leaf tasks exist within the iterate loop — they do not replace graph edges or bypass the convergence model.

**Acceptance Criteria**:
- AC-1: A leaf task is dispatched WITHIN an iterate() call, not as a separate graph edge
- AC-2: Leaf task output contributes to the parent edge's convergence — it does not produce its own convergence state
- AC-3: The number of leaf tasks per iterate() call is bounded — no unbounded task spawning within a single iteration
- AC-4: **Degenerate case:** engines without leaf task support use direct F_P dispatch — leaf tasks are additive

### REQ-F-LEAF-004 — Leaf task sub-dispatch and result flow

Leaf tasks have an explicit sub-dispatch primitive, identity model, and result integration path.

**Acceptance Criteria**:
- AC-1: The sub-dispatch primitive is `dispatch_leaf(task, input, parent_run_id)` — a synchronous call within iterate(). The caller blocks until the leaf task completes, fails, or times out
- AC-2: Leaf tasks carry sub-run identity: `run_id = "{parent_run_id}/leaf/{task_name}"`. They do NOT carry independent `work_key` — they inherit the parent's work_key. Leaf tasks are sub-work, not independent work
- AC-3: Leaf task results are returned as structured JSON validated against the output schema. The parent iterate() call integrates the result into its own working surface — leaf output does not bypass the parent edge's convergence model
- AC-4: On leaf task failure, the parent iterate() call receives a typed error with the failure classification (REQ-F-RUN-002). The parent decides whether to retry the leaf, fail the iteration, or continue without the leaf result
- AC-5: Leaf task events (`leaf_task_started`, `leaf_task_completed`, `leaf_task_failed`) are emitted to the same event stream as the parent, carrying the sub-run identity. They are Tier 2 control events (REQ-F-EC-001 AC-2)
